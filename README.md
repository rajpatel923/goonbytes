# GoonBytes - AI-Powered Campus Security System

A comprehensive real-time security monitoring platform that uses AI to detect weapons and threats on campus, with automated notification systems for students and law enforcement.

## 🚀 Features

### Core Security Features
- **Real-time AI Detection**: Continuous monitoring using Roboflow AI for weapon and threat detection
- **Live Camera Feeds**: Multiple camera support with real-time video streaming
- **Event Management**: Live and historical security event tracking with severity levels
- **Emergency SOS**: Manual emergency alert system for immediate escalation

### AI & Detection
- **Weapon Detection**: Advanced computer vision models to identify firearms and weapons
- **Audio Analysis**: Gunshot detection and audio threat assessment
- **Confidence Scoring**: AI-powered confidence levels for threat assessment
- **Real-time Processing**: Low-latency detection with WebSocket streaming

### Notification System
- **Student Alerts**: Automated SMS notifications via Twilio with threat level categorization
- **Police Integration**: Direct communication with law enforcement via email and voice calls
- **Smart Messaging**: AI-generated context-aware alerts using Gemini
- **Multi-channel Delivery**: SMS, email, and voice call notifications

## 🏗️ Architecture

```
Frontend (React) ←→ WebSocket ←→ FastAPI Server ←→ OpenCV Camera ←→ Roboflow AI
                                    ↓
                            Notification Service ←→ Twilio/SendGrid/ElevenLabs
```

### Components
- **Frontend**: React + TypeScript + Tailwind CSS dashboard
- **AI Backend**: Python FastAPI server with Roboflow integration
- **Notification Service**: FastAPI service for student and police notifications
- **Database**: Supabase for event storage and real-time updates

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Framer Motion for animations
- Radix UI components
- Supabase for authentication and real-time data

### Backend
- Python 3.10+ with FastAPI
- Roboflow for AI inference
- OpenCV for video processing
- WebSocket for real-time streaming
- Twilio for SMS/voice notifications
- SendGrid for email delivery
- ElevenLabs for text-to-speech
- Gemini for AI-generated content

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- Camera access (webcam or IP camera)
- API keys for external services

### 1. Clone and Setup

```bash
git clone <repository-url>
cd goonbytes
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 3. AI Detection Backend

```bash
cd backend/roboflow-image

# Create environment file
echo 'ROBOFLOW_API_KEY=your_roboflow_api_key_here' > .env

# Setup and start
./setup.sh
./start_stream_server.sh
```

The AI detection server runs on `http://localhost:8000`

### 4. Notification Service

```bash
cd backend/triggers

# Copy environment template
cp .env.example .env
# Edit .env with your API keys

# Run with Docker
docker-compose up --build
```

The notification service runs on `http://localhost:8092`

## 📋 Configuration

### Required API Keys

#### Roboflow (AI Detection)
- `ROBOFLOW_API_KEY`: Your Roboflow API key for weapon detection

#### Notification Service
- `GEMINI_API_KEY`: Google Gemini for AI-generated messages
- `TWILIO_ACCOUNT_SID` & `TWILIO_AUTH_TOKEN`: Twilio for SMS/voice
- `SENDGRID_API_KEY`: SendGrid for email notifications
- `ELEVENLABS_API_KEY`: ElevenLabs for text-to-speech (optional)

### Environment Variables

See individual service READMEs for detailed configuration:
- [AI Detection Backend](./backend/roboflow-image/README.md)
- [Notification Service](./backend/triggers/README.md)

## 🎯 Usage

### Security Dashboard
1. Navigate to the Account page after authentication
2. Use the **Feed** tab to view multiple camera feeds
3. Switch to **Live Camera** for AI-powered detection
4. Monitor **Security Events** for real-time alerts

### Event Management
- **Live Events**: Real-time security alerts requiring action
- **Past Events**: Historical event log with approval/rejection status
- **Severity Levels**: 
  - 🔴 High: Immediate threat requiring escalation
  - 🟡 Medium: Elevated risk requiring monitoring
  - 🔵 Low: Routine security events

### Emergency Response
- **Approve**: Escalates to student notifications and police contact
- **Reject**: Dismisses as false alarm
- **Emergency SOS**: Manual emergency trigger for immediate response

## 🔧 Development

### Project Structure
```
goonbytes/
├── frontend/                 # React dashboard
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Main application pages
│   │   └── hooks/           # Custom React hooks
├── backend/
│   ├── roboflow-image/      # AI detection service
│   └── triggers/           # Notification service
└── README.md
```

### Key Features Implementation

#### Real-time Video Streaming
- WebSocket connection between frontend and Python backend
- JPEG frame encoding for efficient transmission
- Live annotation overlay with detection boxes

#### AI Detection Pipeline
- OpenCV camera capture
- Roboflow model inference
- Confidence scoring and threat classification
- Real-time bounding box visualization

#### Notification System
- Multi-channel delivery (SMS, email, voice)
- AI-generated contextual messages
- Threat level-based alert categorization
- Idempotency and deduplication

## 🚨 Security Considerations

- All API keys stored in environment variables
- WebSocket connections use localhost for development
- PII masking in logs (phone numbers show last 4 digits only)
- No persistent storage of sensitive data
- Authentication required for dashboard access

## 📊 Monitoring & Analytics

- Real-time event tracking with Supabase
- Confidence score analytics
- Detection accuracy metrics
- Response time monitoring
- Event approval/rejection rates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
- Check the individual service READMEs for detailed setup instructions
- Review the troubleshooting sections in each backend service
- Ensure all API keys are properly configured
- Verify camera permissions and network connectivity

## 🔮 Future Enhancements

- Mobile app integration
- Advanced analytics dashboard
- Multi-campus support
- Integration with existing security systems
- Machine learning model improvements
- Enhanced notification customization