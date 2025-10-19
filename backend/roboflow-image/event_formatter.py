import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from collections import deque, defaultdict
from statistics import mean

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


def format_event_from_roboflow_result(result: Dict[str, Any], camera_id: str = "unknown") -> Optional[Dict[str, Any]]:
    """Format a detection result (from Roboflow Inference) into event JSON.

    Expects `result` to contain a confidence or predictions list. This function is defensive
    about available keys and will extract a best-effort video score and detections summary.
    """
    event_id = f"evt_{uuid.uuid4().hex}"
    event_start = iso_now()
    event_end = event_start

    # Try to find a top-level confidence or predictions
    video_score = None
    detections = []

    # Roboflow inference outputs often include 'predictions' key
    preds = result.get("predictions") or result.get("prediction")

    # Case A: preds is a list/iterable of dict-like predictions (legacy)
    if preds and isinstance(preds, (list, tuple)):
        for p in preds:
            # p might be a dict with 'confidence' and 'class' or 'label'
            conf = None
            label = None
            if isinstance(p, dict):
                conf = p.get("confidence") or p.get("score") or p.get("probability")
                label = p.get("class") or p.get("label") or p.get("class_name")
            # fallbacks
            if conf is None and isinstance(p, (int, float)):
                conf = float(p)

            if conf is not None:
                try:
                    conf = float(conf)
                except Exception:
                    conf = None

            detections.append({"label": label or "unknown", "confidence": conf})

        # take max confidence as video score
        confidences = [d["confidence"] for d in detections if d.get("confidence") is not None]
        if confidences:
            video_score = max(confidences)
    else:
        # Case B: preds may be a supervision.Detections-like object
        # Detect by presence of attributes like 'confidence' or 'data'
        if preds is not None and (hasattr(preds, "confidence") or hasattr(preds, "data") or hasattr(preds, "xyxy")):
            try:
                # number of detections
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
                    # Nothing we can iterate
                    n = 0

                data_attr = getattr(preds, "data", None)
                for i in range(n):
                    conf = None
                    label = None
                    bbox = None
                    detection_id = None

                    # confidence
                    if hasattr(preds, "confidence"):
                        try:
                            conf_val = getattr(preds, "confidence")[i]
                            conf = float(conf_val)
                        except Exception:
                            conf = None

                    # bbox
                    if hasattr(preds, "xyxy"):
                        try:
                            bbox_val = getattr(preds, "xyxy")[i]
                            # convert numpy array to list if needed
                            try:
                                bbox = bbox_val.tolist()
                            except Exception:
                                bbox = list(bbox_val)
                        except Exception:
                            bbox = None

                    # label from data['class_name'] or preds.class_id
                    if isinstance(data_attr, dict):
                        # class_name often stored as numpy array
                        class_name = data_attr.get("class_name")
                        if class_name is not None:
                            try:
                                # handle numpy arrays / scalar
                                val = class_name[i]
                                try:
                                    label = val.item() if hasattr(val, "item") else val
                                except Exception:
                                    label = val
                            except Exception:
                                label = None

                        # detection id
                        det_id_arr = data_attr.get("detection_id")
                        if det_id_arr is not None:
                            try:
                                val = det_id_arr[i]
                                detection_id = val.item() if hasattr(val, "item") else val
                            except Exception:
                                detection_id = None

                    if label is None and hasattr(preds, "class_id"):
                        try:
                            class_id_arr = getattr(preds, "class_id")
                            val = class_id_arr[i]
                            label = str(val)
                        except Exception:
                            label = None

                    detections.append({
                        "label": label or "unknown",
                        "confidence": conf,
                        "bbox": bbox,
                        "detection_id": detection_id,
                    })

                confidences = [d.get("confidence") for d in detections if d.get("confidence") is not None]
                if confidences:
                    video_score = max(confidences)
            except Exception:
                # fallback: leave detections empty
                pass

    # Some workflows include an explicit 'confidence' field
    if video_score is None:
        try:
            maybe_conf = result.get("confidence") or result.get("score")
            if maybe_conf is not None:
                video_score = float(maybe_conf)
        except Exception:
            video_score = None

    video_score = float(video_score) if video_score is not None else 0.0

    # Placeholder for audio score (not available in this pipeline)
    audio_score = None

    combined_score = compute_combined_score(video_score, audio_score)

    # Suppress events below the low severity threshold

    if combined_score < LOW_SEVERITY_THRESHOLD:
        return None

    event = {
        "event_id": event_id,
        "camera_id": camera_id,
        "event_start": event_start,
        "event_end": event_end,
        "combined_score": combined_score,
        "scores": {"video": float(round(video_score, 4)), "audio": audio_score},
        "detections": detections,
    }

    # Add a simple severity field for easy frontend usage
    if combined_score >= HIGH_SEVERITY_THRESHOLD:
        event["severity"] = "high"
    elif combined_score >= MEDIUM_SEVERITY_THRESHOLD:
        event["severity"] = "medium"
    else:
        event["severity"] = "low"

    return event


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

        return event


# Export a default aggregator for convenience
aggregator = EventAggregator(frames_required=10)
