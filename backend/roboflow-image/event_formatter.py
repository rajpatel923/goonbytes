import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from collections import deque, defaultdict
from statistics import mean
import os
import httpx
from typing import List
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Severity thresholds (tunable)
# If combined_score < LOW_SEVERITY_THRESHOLD, the event will be suppressed (no ping)
LOW_SEVERITY_THRESHOLD = 0.7
MEDIUM_SEVERITY_THRESHOLD = 0.8
HIGH_SEVERITY_THRESHOLD = 0.9


def iso_now() -> str:
    """Return current UTC time in ISO 8601 format with Z."""
    return datetime.now(timezone.utc).isoformat()


def compute_combined_score(video_score: float, audio_score: Optional[float] = None) -> float:
    """Combine video and audio scores. If audio_score is missing, return video_score.

    Simple weighted average: video 0.9, audio 0.1 when both present.
    """
    if audio_score is None:
        return float(round(video_score, 4))
    # clamp
    v = max(0.0, min(1.0, video_score))
    a = max(0.0, min(1.0, audio_score))
    combined = 0.9 * v + 0.1 * a
    return float(round(combined, 4))


def sanitize_for_json(obj: Any) -> Any:
    """Recursively convert numpy types and other non-JSON-friendly objects into
    native Python types suitable for json.dumps.

    Rules:
    - objects with .tolist() will be converted via tolist()
    - numpy scalar-like objects with .item() will be converted via item()
    - dicts/lists/tuples are recursively sanitized
    - other unknown objects are converted to str as a last resort
    """
    # Primitive JSON types
    if obj is None or isinstance(obj, (str, bool, int, float)):
        return obj

    # numpy arrays and array-like with tolist()
    if hasattr(obj, "tolist") and not isinstance(obj, dict):
        try:
            converted = obj.tolist()
            return sanitize_for_json(converted)
        except Exception:
            pass

    # numpy scalars with item()
    if hasattr(obj, "item") and not isinstance(obj, (dict, list, tuple)):
        try:
            return sanitize_for_json(obj.item())
        except Exception:
            pass

    # dict-like
    if isinstance(obj, dict):
        out = {}
        for k, v in obj.items():
            # keys should be strings for JSON; coerce if necessary
            key = k if isinstance(k, str) else str(k)
            out[key] = sanitize_for_json(v)
        return out

    # list/tuple -> list
    if isinstance(obj, (list, tuple)):
        return [sanitize_for_json(v) for v in obj]

    # As a last resort try to stringify
    try:
        return str(obj)
    except Exception:
        return None


def extract_frame_summary(result: Dict[str, Any]) -> Dict[str, Any]:
    """Extract a per-frame summary (video_score, audio_score, combined_score, detections).

    Accepts the same input shapes as the main formatter and returns a small dict used
    by the EventAggregator.
    """
    # Reuse logic: call the formatter path but avoid creating event metadata
    # We'll build a lightweight summary: video_score, audio_score, combined_score, detections
    video_score = None
    detections = []

    preds = result.get("predictions") or result.get("prediction")

    if preds and isinstance(preds, (list, tuple)):
        for p in preds:
            conf = None
            label = None
            if isinstance(p, dict):
                conf = p.get("confidence") or p.get("score") or p.get("probability")
                label = p.get("class") or p.get("label") or p.get("class_name")
            if conf is None and isinstance(p, (int, float)):
                conf = float(p)
            try:
                conf = float(conf) if conf is not None else None
            except Exception:
                conf = None
            detections.append({"label": label or "unknown", "confidence": conf})
        confidences = [d["confidence"] for d in detections if d.get("confidence") is not None]
        if confidences:
            video_score = max(confidences)
    else:
        # support supervision.Detections-like
        if preds is not None and (hasattr(preds, "confidence") or hasattr(preds, "data") or hasattr(preds, "xyxy")):
            try:
                n = None
                if hasattr(preds, "confidence"):
                    try:
                        n = len(getattr(preds, "confidence"))
                    except Exception:
                        n = None
                if n is None and hasattr(preds, "xyxy"):
                    try:
                        n = len(getattr(preds, "xyxy"))
                    except Exception:
                        n = None
                if n is None:
                    n = 0
                data_attr = getattr(preds, "data", None)
                for i in range(n):
                    conf = None
                    label = None
                    if hasattr(preds, "confidence"):
                        try:
                            conf_val = getattr(preds, "confidence")[i]
                            conf = float(conf_val)
                        except Exception:
                            conf = None
                    if isinstance(data_attr, dict):
                        class_name = data_attr.get("class_name")
                        if class_name is not None:
                            try:
                                val = class_name[i]
                                label = val.item() if hasattr(val, "item") else val
                            except Exception:
                                label = None
                    if label is None and hasattr(preds, "class_id"):
                        try:
                            val = getattr(preds, "class_id")[i]
                            label = str(val)
                        except Exception:
                            label = None
                    detections.append({"label": label or "unknown", "confidence": conf})
                confidences = [d.get("confidence") for d in detections if d.get("confidence") is not None]
                if confidences:
                    video_score = max(confidences)
            except Exception:
                pass

    video_score = float(video_score) if video_score is not None else 0.0
    audio_score = None
    combined_score = compute_combined_score(video_score, audio_score)

    return {
        "video_score": video_score,
        "audio_score": audio_score,
        "combined_score": combined_score,
        "detections": detections,
    }


class EventAggregator:
    """Aggregate per-frame summaries and emit an event when the last N frames
    all meet a severity threshold.

    Usage: aggregator = EventAggregator(frames_required=10)
    call aggregator.add_frame(result, camera_id) for each frame; it returns an event dict
    when criteria are met, otherwise None.
    """

    def __init__(self, frames_required: int = 10):
        self.frames_required = frames_required
        # camera_id -> deque of frame summaries (dicts)
        self.buffers = defaultdict(lambda: deque(maxlen=self.frames_required))

    def add_frame(self, result: Dict[str, Any], camera_id: str = "unknown") -> Optional[Dict[str, Any]]:
        summary = extract_frame_summary(result)
        summary["timestamp"] = iso_now()
        buf = self.buffers[camera_id]
        buf.append(summary)

        if len(buf) < self.frames_required:
            return None

        # Determine highest severity where all frames meet that threshold
        severity = None
        if all(frame["combined_score"] >= HIGH_SEVERITY_THRESHOLD for frame in buf):
            severity = "high"
        elif all(frame["combined_score"] >= MEDIUM_SEVERITY_THRESHOLD for frame in buf):
            severity = "medium"
        elif all(frame["combined_score"] >= LOW_SEVERITY_THRESHOLD for frame in buf):
            severity = "low"

        if severity is None:
            # no severity met across all frames
            return None

        # Build aggregated event using averages across frames
        combined_scores = [f["combined_score"] for f in buf]
        video_scores = [f["video_score"] for f in buf]
        audio_scores = [f["audio_score"] for f in buf if f.get("audio_score") is not None]

        avg_combined = float(round(mean(combined_scores), 4))
        avg_video = float(round(mean(video_scores), 4)) if video_scores else 0.0
        avg_audio = float(round(mean(audio_scores), 4)) if audio_scores else None

        # Simple detection aggregation: count per label and average confidence
        label_buckets = {}
        for f in buf:
            for d in f.get("detections", []):
                lbl = d.get("label") or "unknown"
                conf = d.get("confidence")
                if lbl not in label_buckets:
                    label_buckets[lbl] = {"confs": [], "count": 0}
                if conf is not None:
                    label_buckets[lbl]["confs"].append(conf)
                label_buckets[lbl]["count"] += 1

        detections_agg = []
        for lbl, info in label_buckets.items():
            avg_conf = float(round(mean(info["confs"]), 4)) if info["confs"] else None
            detections_agg.append({"label": lbl, "avg_confidence": avg_conf, "count": info["count"]})

        event = {
            "event_id": f"evt_{uuid.uuid4().hex}",
            "camera_id": camera_id,
            "event_start": buf[0]["timestamp"],
            "event_end": buf[-1]["timestamp"],
            "combined_score": avg_combined,
            "scores": {"video": avg_video, "audio": avg_audio},
            "detections": detections_agg,
            "severity": severity,
        }

        # Clear buffer to avoid duplicate events immediately
        self.buffers[camera_id] = deque(maxlen=self.frames_required)

        # Attempt to push the event to Supabase (best-effort; do not raise)
        try:
            _push_event_to_supabase(event)
        except Exception:
            # swallow exceptions — aggregator should not crash the detection loop
            pass

        return event


# Export a default aggregator for convenience
aggregator = EventAggregator(frames_required=10)


def _push_event_to_supabase(event: Dict[str, Any]) -> None:
    """Push the event to Supabase as a new row in `events` table.

    Expects these environment variables to be set:
    - SUPABASE_URL
    - SUPABASE_SERVICE_ROLE_KEY

    This is a best-effort helper — failures are logged but do not raise.
    """
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not supabase_key:
        return

    # Build the insert payload; store raw event JSON in `payload` column and also common columns
    payload = sanitize_for_json(event)
    row = {
        "id": event.get("event_id"),
        "camera_id": event.get("camera_id"),
        "event_start": event.get("event_start"),
        "event_end": event.get("event_end"),
        "combined_score": event.get("combined_score"),
        "severity": event.get("severity"),
        "payload": payload,
    }

    # Supabase REST insert endpoint
    insert_url = f"{supabase_url}/rest/v1/events"

    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
        # Prefer return=minimal for simple inserts; not needed here
    }

    # Use httpx sync client (blocking); this helper is best-effort
    with httpx.Client(timeout=5.0) as client:
        resp = client.post(insert_url, headers=headers, json=row)
        # 201 Created or 204 depending on config; ignore other statuses silently
        if resp.status_code not in (200, 201, 204):
            # optional: log or print for debugging
            print("Supabase insert failed:", resp.status_code, resp.text)
