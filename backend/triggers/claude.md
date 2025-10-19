Keep this project simple and easy to use by other services, we dont need any userid or or auth. Make the devo dbs in the momoery only (something like direction for temparory for testing, like you can have username and phonenumber and other information in direction or class and use them instead of creating a full db service for this project) 
* **Stack**

  * Python 3.12, FastAPI, Uvicorn, Pydantic v2, httpx
  * Providers: **Gemini** (text), **Twilio** (SMS + call), **SendGrid** (email), **ElevenLabs** (TTS MP3)
  * Minimal: **no tests**, in-memory idempotency & dedupe
  * 
* **Env (examples)**

  * `SERVICE_AUTH_TOKEN`
  * `GEMINI_API_KEY`
  * `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_MESSAGING_SERVICE_SID` **or** `TWILIO_FROM_NUMBER`
  * `TWILIO_VOICE_FROM_NUMBER`, `POLICE_VOICE_NUMBER` (optional calls)
  * `SENDGRID_API_KEY`, `EMAIL_FROM`, `POLICE_EMAIL_TO`
  * `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID` (optional)
  * Students list: `SUBSCRIBERS_SOURCE=env|json`, `SUBSCRIBERS_CSV`, `SUBSCRIBERS_JSON_PATH`

---

### Service A — student-notify (SMS broadcast)

* **Route**: `POST /v1/notify/students`
* **Payload**:

  * `audio_risk_level` (0–100), `image_risk_level` (0–100), `threat_level` (0–100)
  * `timestamp` (UTC ISO-8601 ending with `Z`)
  * `location` (1–140 chars)
  * `mixed_score` (0.00–1.00, round to 2dp)
* **LLM (Gemini)**:

  * Generate **one SMS ≤160 chars**, calm + directive
  * Rules: `<40 Low—monitoring | 40–69 Elevated—stay alert indoors | ≥70 Severe—shelter in place`; end with “Await updates.”
* **Send (Twilio)**:

  * Use Messaging Service SID or `From` number
  * Loop over subscribers (from env/json)
* **Response (202)**:

  * `{ status, dedupe, idempotent_replay, estimated_recipients, trace_id }`

---

### Service B — police-reporter (brief → email and/or call)

* **Routes**:

  * `POST /v1/notify/police` (main)
  * `GET /v1/tts/{trace_id}.mp3` (serve ElevenLabs audio)
* **Payload**:

  * `video_link` (`https://…`), `threat_level` (0–100), `timestamp` (UTC ISO-8601), `location` (≤140), `mixed_score` (0.00–1.00)
  * `notify`: `{ "email": true|false, "call": true|false }`
* **LLM (Gemini)**:

  * 80–120 word dispatcher brief (plain text, no URLs/markup)
  * Confidence: `<40 Low | 40–69 Medium | ≥70 High`
* **TTS (ElevenLabs)**:

  * Generate MP3 → save `/app/tts/{trace_id}.mp3` → serve via GET
* **Email (SendGrid)**:

  * To `POLICE_EMAIL_TO`, From `EMAIL_FROM`
  * Subject `Incident Brief – {location} – {timestamp}`
  * Body: 5-line header + brief; attach `incident.json` (payload + brief + `tts_url`)
* **Call (optional, Twilio Voice)**:

  * Place call to `POLICE_VOICE_NUMBER` from `TWILIO_VOICE_FROM_NUMBER`
  * TwiML `<Play>` the MP3 at `/v1/tts/{trace_id}.mp3`
* **Response (202)**:

  * `{ status, email_sent, call_placed, tts_url, trace_id }`

---

* **Minimal Ops**

  * JSON logs; mask PII (show last 4 digits)
  * In-memory stores for idempotency/dedupe (reset on restart)
  * Dockerfile per service + docker-compose to run both services together
