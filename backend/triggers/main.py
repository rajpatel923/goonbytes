import os
import uuid
import json
from typing import Optional
import asyncio
from fastapi import FastAPI, HTTPException, Header, Response, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
import httpx
from dotenv import load_dotenv
from google import genai
from twilio.rest import Client
from google.genai import types
import mimetypes
from pathlib import Path
from elevenlabs.client import ElevenLabs
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content, Attachment, FileContent, FileName, FileType, Disposition
from fastapi.middleware.cors import CORSMiddleware

import base64

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="Student Notification & Police Reporter")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080"
    ],
    allow_credentials=True,
    allow_methods=["*"],
)

# In-memory stores
idempotency_store = {}
dedupe_store = set()

# TTS storage directory
TTS_DIR = Path("./tts")
TTS_DIR.mkdir(parents=True, exist_ok=True)


# ===== MODELS =====

class StudentNotifyRequest(BaseModel):
    audio_risk_level: int = Field(ge=0, le=100)
    image_risk_level: int = Field(ge=0, le=100)
    threat_level: int = Field(ge=0, le=100)
    timestamp: str
    location: str = Field(max_length=140)
    mixed_score: float = Field(ge=0.0, le=1.0)


class NotifyChannels(BaseModel):
    email: bool = False
    call: bool = False


class PoliceNotifyRequest(BaseModel):
    video_link: str
    threat_level: int = Field(ge=0, le=100)
    timestamp: str
    location: str = Field(max_length=140)
    mixed_score: float = Field(ge=0.0, le=1.0)
    notify: NotifyChannels


# ===== HELPERS =====

def get_env(key: str, required: bool = True) -> Optional[str]:
    val = os.getenv(key)
    if required and not val:
        raise ValueError(f"Missing required env var: {key} for {val}")
    return val


def get_subscribers():
    """Load subscribers from env or JSON file"""
    source = os.getenv("SUBSCRIBERS_SOURCE", "env")

    if source == "json":
        json_path = get_env("SUBSCRIBERS_JSON_PATH")
        with open(json_path) as f:
            data = json.load(f)
            return [(s["name"], s["phone"]) for s in data]
    else:
        # From env CSV: "Name1:+1234,Name2:+5678"
        csv = get_env("SUBSCRIBERS_CSV", required=False)
        if not csv:
            return []
        subscribers = []
        for entry in csv.split(","):
            name, phone = entry.split(":")
            subscribers.append((name.strip(), phone.strip()))
        return subscribers


def mask_phone(phone: str) -> str:
    """Show only last 4 digits"""
    if len(phone) <= 4:
        return phone
    return "***" + phone[-4:]


def generate_trace_id() -> str:
    return str(uuid.uuid4())


async def call_gemini(prompt: str) -> str:
    """Call Gemini API for text generation via google-genai SDK"""
    model = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-001")
    api_key = os.getenv("GEMINI_API_KEY")

    try:
        client = genai.Client(api_key=api_key)

        # Use native async support via client.aio
        response = await client.aio.models.generate_content(
            model=model,
            contents=prompt,  # Plain string, not [{"text": prompt}]
            config=types.GenerateContentConfig(  # Typed object, not dict
                temperature=0.7,
                max_output_tokens=200,
                top_p=0.95,
                top_k=40,
            ),
        )

        # Extract text from response
        text = response.text

        # Light cleanup to match your previous behavior
        text = text.strip('"\'`').replace('**', '').replace('*', '')
        return text

    except Exception as e:
        # Optionally log: print(f"Gemini SDK error: {e}")
        raise HTTPException(status_code=503, detail="Failed to generate message via Gemini API")


async def process_video_with_gemini(video_path: str) -> dict:
    """
    Process video using Gemini's multimodal capabilities.
    Returns extracted insights about the video content.
    """
    model = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-001")
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise HTTPException(status_code=503, detail="Missing GEMINI_API_KEY in environment")

    try:
        client = genai.Client(api_key=api_key)

        # Read video file
        video_file_path = Path(video_path)
        if not video_file_path.exists():
            raise FileNotFoundError(f"Video not found: {video_path}")

        # Upload video to Gemini
        with open(video_file_path, 'rb') as f:
            video_data = f.read()

        # Detect mime type
        mime_type, _ = mimetypes.guess_type(str(video_file_path))
        if not mime_type:
            mime_type = "video/mp4"

        # Upload the file
        uploaded_file = await client.aio.files.upload(
            file=video_file_path,
            config=types.UploadFileConfig(
                mime_type=mime_type,
                display_name=video_file_path.name
            )
        )

        # Wait for video processing to complete
        while uploaded_file.state == "PROCESSING":
            await asyncio.sleep(2)
            uploaded_file = await client.aio.files.get(name=uploaded_file.name)

        if uploaded_file.state == "FAILED":
            raise Exception("Video processing failed")

        # Analyze video content
        analysis_prompt = """Analyze this security camera footage and provide a detailed report covering:

            1. SCENE DESCRIPTION: What is visible in the video (people, objects, environment)
            2. ACTIVITIES: What actions or events are taking place
            3. POTENTIAL THREATS: Any suspicious behavior, weapons, aggressive actions, or safety concerns
            4. TIMELINE: Sequence of events in chronological order
            5. KEY OBSERVATIONS: Important details that law enforcement should know
            
            Be factual, specific, and focus on observable details. Use clear, professional language suitable for a police dispatcher brief.
            
        Provide your analysis in 150-200 words."""

        response = await client.aio.models.generate_content(
            model=model,
            contents=[
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_uri(
                            file_uri=uploaded_file.uri,
                            mime_type=uploaded_file.mime_type
                        ),
                        types.Part.from_text(text=analysis_prompt)
                    ]
                )
            ],
            config=types.GenerateContentConfig(
                temperature=0.3,  # Lower temperature for factual analysis
                max_output_tokens=400,
                top_p=0.95,
            )
        )

        video_analysis = response.text.strip()

        # Delete the uploaded file to save quota
        await client.aio.files.delete(name=uploaded_file.name)

        return {
            "analysis": video_analysis,
            "processed": True,
            "file_name": video_file_path.name
        }

    except Exception as e:
        print(f"Video processing error: {e}")
        return {
            "analysis": "Video analysis unavailable - manual review required.",
            "processed": False,
            "error": str(e)
        }


async def send_twilio_sms(to_phone: str, message: str):
    """Send SMS via Twilio"""
    account_sid = get_env("TWILIO_ACCOUNT_SID")
    auth_token = get_env("TWILIO_AUTH_TOKEN")

    # Use messaging service or from number
    from_number = os.getenv("TWILIO_FROM_NUMBER")
    messaging_sid = os.getenv("TWILIO_MESSAGING_SERVICE_SID")

    # Initialize Twilio client
    client = Client(account_sid, auth_token)

    if not message or not message.strip():
        message = "(No message content)"

    # Prepare message parameters
    message_params = {
        "body": message,
        "to": "+1 8777804236"
    }

    if messaging_sid:
        message_params["messaging_service_sid"] = messaging_sid
    elif from_number:
        message_params["from_"] = from_number
    else:
        raise ValueError("Need TWILIO_MESSAGING_SERVICE_SID or TWILIO_FROM_NUMBER")

    # Send message
    twilio_message = client.messages.create(**message_params)

    return {
        "sid": twilio_message.sid,
        "status": twilio_message.status,
        "body": twilio_message.body
    }


async def generate_tts(text: str, trace_id: str) -> str:
    """Generate TTS MP3 via ElevenLabs with voice validation and graceful fallback."""
    api_key = get_env("ELEVENLABS_API_KEY", required=False)
    voice_id = os.getenv("ELEVENLABS_VOICE_ID")  # optional; may be invalid

    if not api_key:
        return None

    client = ElevenLabs(api_key=api_key)

    def _write_audio(iterable):
        mp3_path = TTS_DIR / f"{trace_id}.mp3"
        with open(mp3_path, "wb") as f:
            for chunk in iterable:
                f.write(chunk)
        return f"/v1/tts/{trace_id}.mp3"

    try:
        # If no voice_id provided, try to pick the first available voice
        if not voice_id:
            try:
                voices = client.voices.get_all()  # ✓ Changed from list() to get_all()
                if voices and voices.voices:  # ✓ voices are in the .voices attribute
                    voice_id = voices.voices[0].voice_id  # ✓ Correct attribute access
                    print(f"ℹ Using voice: {voices.voices[0].name} ({voice_id})")
            except Exception as e:
                print(f"✗ Failed to list voices: {e}")
                # Use a default voice ID as fallback
                voice_id = "21m00Tcm4TlvDq8ikWAM"  # Rachel (default ElevenLabs voice)

        # Fallback if still no voice_id
        if not voice_id:
            voice_id = "21m00Tcm4TlvDq8ikWAM"

        audio = client.text_to_speech.convert(
            text=text,
            voice_id=voice_id,
            model_id="eleven_monolingual_v1",
            output_format="mp3_44100_128",
        )

        return _write_audio(audio)

    except Exception as e:
        # Detect voice-not-found from error message
        msg = str(e).lower()
        if "voice_not_found" in msg or ("voice" in msg and "not found" in msg):
            # Try with default voice
            try:
                print(f"✗ Voice {voice_id} not found, trying default voice...")
                voices = client.voices.get_all()
                if voices and voices.voices:
                    chosen = voices.voices[0].voice_id
                    print(f"ℹ Using fallback voice: {voices.voices[0].name}")

                    audio = client.text_to_speech.convert(
                        text=text,
                        voice_id=chosen,
                        model_id="eleven_monolingual_v1",
                        output_format="mp3_44100_128",
                    )
                    return _write_audio(audio)
            except Exception as e2:
                print(f"✗ ElevenLabs retry failed: {e2}")

        # Log and return None so caller can continue without TTS
        print(f"✗ ElevenLabs TTS error: {e}")
        return None


# python
'''
async def send_sendgrid_email(to_email: str, subject: str, body: str, attachments=None):
    """
    Send email via SendGrid.
    - `attachments` may be:
      * None
      * a file path (str)
      * a dict with keys: content (base64 str), filename, type, disposition
      * a list of the above
    """
    from_email = os.getenv("EMAIL_FROM")
    api_key = os.getenv("SENDGRID_API_KEY")

    if not from_email or not api_key:
        raise ValueError("Missing EMAIL_FROM or SENDGRID_API_KEY")

    message = Mail(
        from_email=Email(from_email),
        to_emails=[To(to_email)],
        subject=subject,
        html_content=Content("text/html", f"<p>{body}</p>")
    )

    sg_attachments = []

    def _make_sg_attachment_from_path(path: str):
        with open(path, "rb") as f:
            data = f.read()
        encoded_file = base64.b64encode(data).decode()
        filename = os.path.basename(path)
        mime_type, _ = mimetypes.guess_type(path)
        mime_type = mime_type or "application/octet-stream"
        return Attachment(
            FileContent(encoded_file),
            FileName(filename),
            FileType(mime_type),
            Disposition("attachment")
        )

    def _make_sg_attachment_from_dict(d: dict):
        content = d.get("content")
        filename = d.get("filename") or "attachment"
        ftype = d.get("type") or "application/octet-stream"
        disposition = d.get("disposition") or "attachment"
        return Attachment(
            FileContent(content),
            FileName(filename),
            FileType(ftype),
            Disposition(disposition)
        )

    # Normalize attachments to a list
    if attachments:
        if isinstance(attachments, (list, tuple)):
            items = attachments
        else:
            items = [attachments]

        for item in items:
            try:
                if isinstance(item, str):
                    sg_attachments.append(_make_sg_attachment_from_path(item))
                elif isinstance(item, dict):
                    # Expect base64 content in dict
                    sg_attachments.append(_make_sg_attachment_from_dict(item))
                else:
                    # unsupported type; skip
                    continue
            except Exception as e:
                print(f"✗ Skipping attachment due to error: {e}")

    # Attach to message
    for a in sg_attachments:
        try:
            message.add_attachment(a)
        except Exception:
            # Fallback if add_attachment not present
            if not hasattr(message, "attachments") or message.attachments is None:
                message.attachments = []
            message.attachments.append(a)

    sg = SendGridAPIClient(api_key)

    # Run blocking network call in thread
    response = await asyncio.to_thread(sg.send, message)
    print(f"Status: {response.status_code}, Message ID: {response.headers.get('x-message-id')}")
    return response
'''


async def make_twilio_call(to_number: str, tts_url: str):
    """Make Twilio voice call with TwiML"""
    account_sid = get_env("TWILIO_ACCOUNT_SID")
    auth_token = get_env("TWILIO_AUTH_TOKEN")
    from_number = get_env("TWILIO_VOICE_FROM_NUMBER", required=False)

    if not from_number:
        return False

    # Build absolute TwiML URL (assumes public endpoint)
    base_url = os.getenv("PUBLIC_BASE_URL", "http://localhost:8000")
    play_url = f"{base_url}{tts_url}"

    twiml = f'<?xml version="1.0" encoding="UTF-8"?><Response><Play>{play_url}</Play></Response>'

    url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Calls.json"

    data = {
        "To": to_number,
        "From": from_number,
        "Twiml": twiml
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(url, data=data, auth=(account_sid, auth_token))
        resp.raise_for_status()
        return True


# ===== AUTH MIDDLEWARE =====

security = HTTPBearer(auto_error=False)


async def prepare_video_attachment(video_path: str) -> dict:
    """
    Read video file and prepare it for email attachment

    Returns:
        dict with content (base64), filename, type, disposition
        or None if video cannot be attached
    """
    try:
        video_file_path = Path(video_path)

        # Check if file exists and is accessible
        if not video_file_path.exists():
            print(f"⚠️ Video file not found: {video_path}")
            return None

        # Check file size (SendGrid limit is 30MB total for all attachments)
        file_size_mb = video_file_path.stat().st_size / (1024 * 1024)

        if file_size_mb > 25:  # Leave room for JSON attachment
            print(f"⚠️ Video file too large ({file_size_mb:.2f}MB). Max 25MB.")
            return None

        # Read and encode video file
        with open(video_file_path, 'rb') as f:
            video_data = f.read()

        encoded_video = base64.b64encode(video_data).decode()

        # Detect mime type
        mime_type, _ = mimetypes.guess_type(str(video_file_path))
        if not mime_type:
            mime_type = "video/mp4"  # Default to mp4

        print(f"✓ Video prepared for attachment: {video_file_path.name} ({file_size_mb:.2f}MB)")

        return {
            "content": encoded_video,
            "filename": video_file_path.name,
            "type": mime_type,
            "disposition": "attachment"
        }

    except Exception as e:
        print(f"✗ Failed to prepare video attachment: {e}")
        return None


def get_valid_api_keys() -> set:
    """
    Load valid API keys from environment.
    Supports multiple keys separated by commas.
    Example: API_KEYS="key1,key2,key3"
    """
    keys_str = os.getenv("API_KEYS", "")
    if not keys_str:
        # If no API keys configured, allow all requests (dev mode)
        # In production, this should raise an error
        return set()

    return {key.strip() for key in keys_str.split(",") if key.strip()}


async def verify_api_key(
        credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> str:
    """
    Verify API key from Authorization header.
    Expected format: Authorization: Bearer <api_key>
    """
    valid_keys = get_valid_api_keys()

    # If no keys configured, skip auth (development mode)
    if not valid_keys:
        # You might want to log a warning here in production
        return "dev-mode"

    # Check if credentials provided
    if not credentials:
        raise HTTPException(
            status_code=401,
            detail="Missing authorization header",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Verify the API key
    if credentials.credentials not in valid_keys:
        raise HTTPException(
            status_code=403,
            detail="Invalid or expired API key",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return credentials.credentials


# Alternative: API key in custom header
async def verify_api_key_header(
        x_api_key: Optional[str] = Header(None, alias="X-API-Key")
) -> str:
    """
    Verify API key from X-API-Key header.
    Alternative to Bearer token auth.
    """
    valid_keys = get_valid_api_keys()

    # If no keys configured, skip auth (development mode)
    if not valid_keys:
        return "dev-mode"

    # Check if API key provided
    if not x_api_key:
        raise HTTPException(
            status_code=401,
            detail="Missing X-API-Key header"
        )

    # Verify the API key
    if x_api_key not in valid_keys:
        raise HTTPException(
            status_code=403,
            detail="Invalid or expired API key"
        )

    return x_api_key


# ===== SERVICE A: STUDENT NOTIFY =====

@app.post("/v1/notify/students", status_code=202, dependencies=[Depends(verify_api_key)])
async def notify_students(req: StudentNotifyRequest):
    """
    Send emergency notifications to all student subscribers.
    Requires valid API key authentication.
    """
    trace_id = generate_trace_id()

    # Check idempotency (simple: same timestamp + location)
    idempotent_key = f"{req.timestamp}:{req.location}"
    if idempotent_key in idempotency_store:
        return {
            "status": "accepted",
            "dedupe": False,
            "idempotent_replay": True,
            "estimated_recipients": 0,
            "trace_id": idempotency_store[idempotent_key]
        }

    idempotency_store[idempotent_key] = trace_id

    # Determine threat category
    threat = req.threat_level
    if threat < 40:
        category = "Low - monitoring"
    elif threat < 70:
        category = "Elevated - stay alert indoors"
    else:
        category = "Severe - shelter in place"

    # Generate SMS via Gemini
    prompt = f"""You are a campus security alert system. Generate a clear, concise SMS message for students.

CONTEXT:
- Threat level: {threat}/100 ({category})
- Location: {req.location}
- Mixed score: {round(req.mixed_score, 2)}

REQUIREMENTS:
- EXACTLY one sentence
- Maximum 160 characters (strict limit)
- Calm, directive, professional tone
- State threat level, location, and action required
- End with "Await updates."
- NO quotes, NO markdown, NO extra formatting

EXAMPLES:
- Low threat: "Security monitoring activity at Main Library. Low threat. Stay aware. Await updates."
- Elevated threat: "Elevated threat at North Campus. Stay alert, remain indoors. Await updates."
- Severe threat: "SEVERE threat at Student Center. Shelter in place immediately. Await updates."

Generate ONLY the SMS text (no quotes, no explanations):"""

    sms_text = await call_gemini(prompt)

    # Ensure it fits in 160 chars
    if len(sms_text) > 160:
        sms_text = sms_text[:157] + "..."

    # Send to subscribers
    subscribers = get_subscribers()

    for name, phone in subscribers:
        try:
            await send_twilio_sms(phone, sms_text)
            print(f"✓ SMS sent to {name} ({mask_phone(phone)})")
        except Exception as e:
            print(f"✗ Failed to send to {name} ({mask_phone(phone)}): {e}")

    return {
        "status": "accepted",
        "dedupe": False,
        "idempotent_replay": False,
        "estimated_recipients": len(subscribers),
        "trace_id": trace_id
    }


# ===== SERVICE B: POLICE REPORTER =====
@app.post("/v1/notify/police", status_code=202, dependencies=[Depends(verify_api_key)])
async def notify_police(req: PoliceNotifyRequest):
    """
    Send incident brief to police with video analysis, email with video attachment, and voice call.
    Requires valid API key authentication.
    """
    trace_id = generate_trace_id()

    # Determine confidence level
    threat = req.threat_level
    if threat < 40:
        confidence = "Low"
    elif threat < 70:
        confidence = "Medium"
    else:
        confidence = "High"

    # Process video if it's a local file path
    video_analysis_result = None
    video_insights = "Video analysis not available."
    is_local_video = False

    # Check if video_link is a local path (for test videos)
    if req.video_link.startswith("./") or req.video_link.startswith("test/") or Path(req.video_link).exists():
        is_local_video = True
        print(f"🎥 Processing local video: {req.video_link}")
        video_analysis_result = await process_video_with_gemini(req.video_link)

        if video_analysis_result["processed"]:
            video_insights = video_analysis_result["analysis"]
            print(f"✓ Video analysis complete")
        else:
            print(f"✗ Video analysis failed: {video_analysis_result.get('error', 'Unknown')}")
    else:
        # For remote URLs, note that video is available but not processed
        video_insights = f"Video evidence available at provided link. Manual review required."

    # Generate comprehensive dispatcher brief via Gemini
    prompt = f"""You are a police dispatcher. Generate a professional incident brief for law enforcement based on video analysis and threat assessment.

INCIDENT DETAILS:
- Location: {req.location}
- Timestamp: {req.timestamp}
- Threat Level: {threat}/100
- Confidence: {confidence}
- ML Mixed Score: {round(req.mixed_score, 2)}

VIDEO ANALYSIS:
{video_insights}

REQUIREMENTS:
- 120-180 words (comprehensive but concise)
- Professional, factual, dispatcher tone
- Plain text ONLY (no URLs, no markdown, no formatting)
- Integrate video analysis findings naturally
- State confidence level and ML score
- Include specific threat indicators from video
- Provide clear response recommendations
- Focus on actionable intelligence

STRUCTURE:
1. Incident summary with location and time
2. Key findings from video analysis
3. Threat assessment with ML confidence score
4. Recommended response level and units needed
5. Special considerations or immediate actions required

Generate ONLY the dispatcher brief (no quotes, no explanations):"""

    brief_text = await call_gemini(prompt)

    print(f"✓ Dispatcher brief generated :- {brief_text}")

    # Generate TTS for voice call
    tts_url = None
    if req.notify.email or req.notify.call:
        # Create a more natural speech version for TTS
        tts_prompt = f"""Convert this police dispatcher brief into natural spoken language suitable for a phone call.

ORIGINAL BRIEF:
{brief_text}

REQUIREMENTS:
- 100-150 words
- Conversational but professional tone
- Remove abbreviations, spell out numbers
- Add natural pauses and flow
- Maintain all critical information
- End with "Please respond immediately" if threat level is high

Generate ONLY the spoken version (no quotes):"""

        tts_text = await call_gemini(tts_prompt)
        print(f"✓ TTS text generated :- {tts_text}")
        tts_url = await generate_tts(tts_text, trace_id)
        print(f"✓ TTS audio generated at {tts_url}")

    # Send email with comprehensive details AND video attachment
    email_sent = False
    if req.notify.email:
        try:
            police_email = get_env("POLICE_EMAIL_TO")
            subject = f"🚨 INCIDENT ALERT – {req.location} – Threat Level {threat}/100"

            body = f"""INCIDENT BRIEF - IMMEDIATE ATTENTION REQUIRED

═══════════════════════════════════════════════════════
INCIDENT METADATA
═══════════════════════════════════════════════════════
Location: {req.location}
Timestamp: {req.timestamp}
Threat Level: {threat}/100
Confidence: {confidence}
ML Mixed Score: {round(req.mixed_score, 2)}
Video Source: {req.video_link}

═══════════════════════════════════════════════════════
DISPATCHER BRIEF
═══════════════════════════════════════════════════════
{brief_text}

═══════════════════════════════════════════════════════
VIDEO ANALYSIS DETAILS
═══════════════════════════════════════════════════════
{video_insights}

═══════════════════════════════════════════════════════
RESPONSE RECOMMENDATIONS
═══════════════════════════════════════════════════════
"""

            # Add response recommendations based on threat level
            if threat >= 70:
                body += """- IMMEDIATE DISPATCH: Multiple units required
- SWAT/Tactical team on standby
- Establish perimeter and evacuate area
- Emergency medical services on alert
"""
            elif threat >= 40:
                body += """- PRIORITY DISPATCH: 2-3 units recommended
- Approach with caution
- Request backup if needed
- Medical on standby
"""
            else:
                body += """- STANDARD RESPONSE: 1-2 units for assessment
- Monitor situation
- Coordinate with campus security
"""

            body += f"""
═══════════════════════════════════════════════════════
EVIDENCE ATTACHMENTS
═══════════════════════════════════════════════════════
"""

            # Prepare attachments list
            attachments = []

            # 1. JSON attachment with incident data
            incident_data = {
                "trace_id": trace_id,
                "timestamp": req.timestamp,
                "location": req.location,
                "threat_assessment": {
                    "threat_level": threat,
                    "confidence": confidence,
                    "mixed_score": req.mixed_score
                },
                "video_analysis": {
                    "processed": video_analysis_result["processed"] if video_analysis_result else False,
                    "video_source": req.video_link,
                    "analysis": video_insights
                },
                "dispatcher_brief": brief_text,
                "tts_url": tts_url,
                "response_channels": {
                    "email": req.notify.email,
                    "call": req.notify.call
                }
            }

            incident_json = json.dumps(incident_data, indent=2)
            encoded_json = base64.b64encode(incident_json.encode()).decode()

            attachments.append({
                "content": encoded_json,
                "filename": f"incident_{trace_id}.json",
                "type": "application/json",
                "disposition": "attachment"
            })

            body += f"- Incident data: incident_{trace_id}.json\n"

            # 2. Video attachment (if local file)
            video_attached = False
            if is_local_video:
                video_attachment = await prepare_video_attachment(req.video_link)
                if video_attachment:
                    attachments.append(video_attachment)
                    video_attached = True
                    body += f"- Video footage: {video_attachment['filename']}\n"
                else:
                    body += f"- Video footage: TOO LARGE - Available at {req.video_link}\n"
            else:
                body += f"- Video footage: Available at {req.video_link}\n"

            body += f"""- TTS audio brief: {tts_url if tts_url else 'Not generated'}
- Trace ID: {trace_id}

This is an automated alert from Campus Security AI System.
Video footage {"is attached to this email" if video_attached else "available at provided link"}.
"""

            # Send email with all attachments
            '''
            await send_sendgrid_email(police_email, subject, body, attachments)
            email_sent = True
            print(f"✓ Email sent to {police_email} with {len(attachments)} attachment(s)")
            if video_attached:
                print(f"  ✓ Video file attached to email")
            '''

        except Exception as e:
            print(f"✗ Email failed: {e}")
            import traceback
            traceback.print_exc()

    # Make voice call
    call_placed = False
    if req.notify.call and tts_url:
        try:
            police_number = get_env("POLICE_VOICE_NUMBER", required=False)
            if police_number:
                await make_twilio_call(police_number, tts_url)
                call_placed = True
                print(f"✓ Call placed to {mask_phone(police_number)}")
        except Exception as e:
            print(f"✗ Call failed: {e}")

    return {
        "status": "accepted",
        "email_sent": email_sent,
        "call_placed": call_placed,
        "video_processed": video_analysis_result["processed"] if video_analysis_result else False,
        "video_attached": is_local_video and email_sent,  # Video attached if local and email sent
        "tts_url": tts_url,
        "trace_id": trace_id,
        "threat_level": threat,
        "confidence": confidence
    }


# ===== TTS SERVE =====

@app.get("/v1/tts/{trace_id}.mp3")
async def get_tts(trace_id: str):
    """
    Serve generated TTS audio files.
    No authentication required for TwiML callbacks.
    """
    mp3_path = TTS_DIR / f"{trace_id}.mp3"

    if not mp3_path.exists():
        raise HTTPException(status_code=404, detail="TTS file not found")

    with open(mp3_path, "rb") as f:
        content = f.read()

    return Response(content=content, media_type="audio/mpeg")


@app.get("/health")
async def health():
    """Health check endpoint - no authentication required"""
    return {"status": "ok"}
