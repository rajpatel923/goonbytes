# Student Notification & Police Reporter Service

Simple FastAPI service providing two notification endpoints for campus security alerts.

## Features

**Service A - Student Notify** (`POST /v1/notify/students`)
- Broadcasts SMS alerts to students via Twilio
- Uses Gemini to generate context-aware messages (≤160 chars)
- Supports threat levels: Low (<40), Elevated (40-69), Severe (≥70)

**Service B - Police Reporter** (`POST /v1/notify/police`)
- Sends incident briefs to police via email and/or voice call
- Uses Gemini to generate dispatcher brief (80-120 words)
- Optional TTS via ElevenLabs for voice calls
- Attaches incident JSON to email

## Quick Start

1. Copy `.env.example` to `.env` and fill in your API keys
2. Run with Docker:
```bash
docker-compose up --build
```

3. Service runs on `http://localhost:8000`
4. API docs: `http://localhost:8000/docs`

## Configuration

See `.env.example` for all required environment variables.

### Subscribers

**Option 1: CSV in env** (default)
```
SUBSCRIBERS_SOURCE=env
SUBSCRIBERS_CSV=John:+1234567890,Jane:+1987654321
```

**Option 2: JSON file**
```
SUBSCRIBERS_SOURCE=json
SUBSCRIBERS_JSON_PATH=/app/subscribers.json
```

## API Examples

### Student Notify
```bash
curl -X POST http://localhost:8000/v1/notify/students \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "audio_risk_level": 75,
    "image_risk_level": 80,
    "threat_level": 85,
    "timestamp": "2025-10-18T15:30:00Z",
    "location": "Main Campus Library",
    "mixed_score": 0.82
  }'
```

### Police Notify
```bash
curl -X POST http://localhost:8000/v1/notify/police \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "video_link": "https://example.com/video.mp4",
    "threat_level": 85,
    "timestamp": "2025-10-18T15:30:00Z",
    "location": "Main Campus Library",
    "mixed_score": 0.82,
    "notify": {
      "email": true,
      "call": true
    }
  }'
```

## Notes

- In-memory idempotency & deduplication (resets on restart)
- No database - simple and stateless
- JSON logging with PII masking (shows last 4 digits of phone numbers)
- TTS files stored in `/app/tts` volume
