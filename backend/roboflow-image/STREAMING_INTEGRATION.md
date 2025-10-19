# Python Video Stream Integration

This document explains how to use the new WebSocket-based video streaming integration between the Python gun detection backend and the React frontend.

## Overview

The integration allows the frontend to receive real-time annotated video frames from the Python gun detection server via WebSocket, providing a seamless AI-powered security monitoring experience.

## Architecture

```
Frontend (React) ←→ WebSocket ←→ FastAPI Server ←→ OpenCV Camera ←→ Roboflow AI
```

- **Backend**: FastAPI server with WebSocket endpoint streaming JPEG frames
- **Frontend**: Connects to WebSocket when user clicks "Start", displays frames in video element
- **Video Source**: Python backend accesses webcam directly and runs gun detection
- **Frame Flow**: Python captures → Roboflow inference → Draw boxes → Encode JPEG → Send via WebSocket → Frontend displays

## Setup Instructions

### 1. Backend Setup

1. **Create environment file**:
   ```bash
   cd backend/roboflow-image
   echo 'ROBOFLOW_API_KEY=your_actual_api_key_here' > .env
   ```

2. **Install dependencies**:
   ```bash
   ./setup.sh
   ```

3. **Start the streaming server**:
   ```bash
   ./start_stream_server.sh
   ```

The server will run on `http://localhost:8000` with WebSocket endpoint at `ws://localhost:8000/ws/video-stream`.

### 2. Frontend Setup

The frontend has been automatically updated to use WebSocket streaming. No additional setup required.

## Usage

1. **Start the Python server** (from `backend/roboflow-image/`):
   ```bash
   ./start_stream_server.sh
   ```

2. **Start the frontend** (from project root):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Use the application**:
   - Navigate to the Account page
   - Click on "Live Camera" tab
   - Click "Start AI Detection" button
   - The video feed will show real-time gun detection with bounding boxes

## Features

### Backend Features
- **Real-time gun detection** using Roboflow AI
- **WebSocket streaming** for low-latency video transmission
- **Automatic camera management** (starts/stops with client connections)
- **Error handling** with graceful fallbacks
- **Frame rate optimization** (15 FPS for smooth performance)
- **JPEG compression** for efficient bandwidth usage

### Frontend Features
- **Seamless WebSocket integration** with existing UI
- **Automatic reconnection** (up to 3 attempts)
- **Connection status indicators** (green/red dot)
- **Error handling** with user-friendly toast notifications
- **Real-time frame display** with AI annotations
- **Smooth start/stop controls**

## API Endpoints

### WebSocket Endpoint
- **URL**: `ws://localhost:8000/ws/video-stream`
- **Purpose**: Streams annotated video frames
- **Message Format**:
  ```json
  {
    "type": "frame",
    "data": "base64_encoded_jpeg_frame",
    "timestamp": 1234567890.123
  }
  ```

### HTTP Endpoints
- **Health Check**: `GET http://localhost:8000/health`
- **Root**: `GET http://localhost:8000/`

## Error Handling

### Backend Errors
- **API Key Missing**: Server won't start without valid ROBOFLOW_API_KEY
- **Camera Access**: Graceful handling of camera permission issues
- **WebSocket Disconnect**: Automatic camera cleanup
- **Detection Errors**: Logged but don't crash the stream

### Frontend Errors
- **Connection Failed**: Toast notification with retry option
- **Stream Interrupted**: Automatic reconnection attempts
- **Invalid Frames**: Graceful handling of corrupted data
- **Server Unavailable**: Clear error messages

## Performance Optimizations

- **Frame Rate**: Limited to 15 FPS for smooth performance
- **JPEG Quality**: 80% compression for balance of quality/speed
- **Buffer Management**: Single frame buffer to minimize latency
- **Reconnection**: Smart retry logic with exponential backoff
- **Memory Management**: Proper cleanup of video streams and WebSocket connections

## Troubleshooting

### Common Issues

1. **"Failed to connect to detection server"**
   - Ensure Python server is running (`./start_stream_server.sh`)
   - Check that port 8000 is not blocked
   - Verify .env file exists with valid API key

2. **"Camera already in use"**
   - Close other applications using the camera
   - Restart the Python server
   - Check camera permissions

3. **"No frames received"**
   - Check WebSocket connection status (green dot)
   - Verify camera is working in other applications
   - Check browser console for errors

4. **Poor video quality**
   - Check network connection
   - Verify camera resolution settings
   - Monitor CPU usage on both frontend and backend

### Debug Mode

Enable debug logging by setting environment variable:
```bash
export DEBUG=1
./start_stream_server.sh
```

## Security Considerations

- **Local Network Only**: WebSocket server binds to localhost only
- **CORS Protection**: Configured for specific frontend origins
- **API Key Security**: Store API key in .env file (not committed to git)
- **Camera Access**: Only one client can connect at a time

## Development Notes

- **Hot Reload**: Frontend changes don't require server restart
- **Server Restart**: Backend changes require server restart
- **Testing**: Use browser dev tools to monitor WebSocket messages
- **Logging**: Check server console for detailed error information

## Future Enhancements

- **Multiple Camera Support**: Stream from multiple cameras simultaneously
- **Recording**: Save annotated video streams to disk
- **Analytics**: Track detection statistics and performance metrics
- **Mobile Support**: Optimize for mobile device cameras
- **Cloud Deployment**: Deploy to cloud with proper security measures
