# WebSocket Video Stream Debugging Guide

This guide helps debug the WebSocket-based video streaming integration between the Python backend and React frontend.

## 🔍 Issues Found and Fixed

### 1. **Backend Import Errors**
**Problem**: The original `video_stream_server.py` tried to import classes from `live_gun_detection.py` that didn't exist.

**Solution**: Created `video_stream_server_fixed.py` with:
- Direct imports of `inference` and `supervision` libraries
- Proper error handling for missing dependencies
- Simplified detection logic without complex class dependencies

### 2. **Frontend Frame Rendering Issues**
**Problem**: Complex canvas-to-video approach was causing connection failures and poor performance.

**Solution**: 
- Changed from `<video>` to `<img>` element
- Direct base64 data URL rendering
- Proper memory management with URL cleanup

### 3. **Duplicate Dependencies**
**Problem**: `requirements.txt` had duplicate entries causing installation conflicts.

**Solution**: Cleaned up requirements.txt with proper organization.

### 4. **WebSocket Connection Issues**
**Problem**: No proper connection validation and error handling.

**Solution**: Added comprehensive error handling and connection status indicators.

## 🚀 How to Test the Fixed Implementation

### Step 1: Setup Backend
```bash
cd backend/roboflow-image

# Create .env file with your API key
echo 'ROBOFLOW_API_KEY=your_actual_api_key_here' > .env

# Install dependencies
./setup.sh

# Start the FIXED server
./start_fixed_server.sh
```

### Step 2: Test WebSocket Connection
```bash
# In another terminal, test the WebSocket connection
python test_websocket.py
```

Expected output:
```
🔌 Testing WebSocket connection...
📡 Connecting to: ws://localhost:8000/ws/video-stream
✅ WebSocket connected successfully!
📨 Listening for messages...
ℹ️  Server status: Camera started successfully
📸 Received frame 10 (message 12)
📸 Received frame 20 (message 22)
```

### Step 3: Test Frontend
```bash
# In project root
cd frontend
npm run dev
```

Navigate to Account page → Live Camera tab → Click "Start AI Detection"

## 🔧 Debugging Commands

### Check Server Health
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status": "healthy", "message": "Gun detection server is running"}
```

### Check Server Logs
Look for these log messages in the server console:
- `"WebSocket client connected"`
- `"Gun detector initialized successfully"`
- `"Camera started successfully"`
- `"Detected X objects"` (when objects are found)

### Check Frontend Console
Open browser DevTools → Console, look for:
- `"WebSocket connected"`
- `"WebSocket status: Camera started successfully"`
- Any error messages

## 🐛 Common Issues and Solutions

### Issue: "Connection Lost - Failed to reconnect to detection server"

**Causes:**
1. Backend server not running
2. Wrong WebSocket URL
3. Camera already in use
4. Missing API key

**Solutions:**
1. **Check if server is running:**
   ```bash
   curl http://localhost:8000/health
   ```

2. **Check WebSocket URL in frontend:**
   - Should be `ws://localhost:8000/ws/video-stream`
   - Not `ws://localhost:8000/ws/video-stream/` (trailing slash)

3. **Check camera permissions:**
   - Close other applications using the camera
   - Check system camera permissions

4. **Verify API key:**
   ```bash
   cat .env
   # Should show: ROBOFLOW_API_KEY=your_key_here
   ```

### Issue: "Failed to initialize gun detector"

**Causes:**
1. Missing or invalid API key
2. Network issues with Roboflow API
3. Missing dependencies

**Solutions:**
1. **Check API key:**
   ```bash
   # In backend/roboflow-image directory
   source venv/bin/activate
   python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('API Key:', os.getenv('ROBOFLOW_API_KEY'))"
   ```

2. **Test Roboflow connection:**
   ```bash
   python -c "
   from inference import get_model
   import os
   from dotenv import load_dotenv
   load_dotenv()
   model = get_model('weapon-detection-ctenp/1', api_key=os.getenv('ROBOFLOW_API_KEY'))
   print('✅ Roboflow connection successful')
   "
   ```

3. **Reinstall dependencies:**
   ```bash
   pip install -r requirements.txt --force-reinstall
   ```

### Issue: "Failed to start camera"

**Causes:**
1. Camera already in use by another process
2. No camera available
3. Permission issues

**Solutions:**
1. **Check camera availability:**
   ```bash
   python -c "import cv2; cap = cv2.VideoCapture(0); print('Camera available:', cap.isOpened()); cap.release()"
   ```

2. **Close other camera applications:**
   - Zoom, Teams, Skype, etc.
   - Other browser tabs with camera access

3. **Check system permissions:**
   - macOS: System Preferences → Security & Privacy → Camera
   - Linux: Check camera device permissions

### Issue: No frames received in frontend

**Causes:**
1. WebSocket connection not established
2. Server not sending frames
3. Frontend not processing frames correctly

**Solutions:**
1. **Check WebSocket connection:**
   - Look for green dot in frontend
   - Check browser console for connection messages

2. **Test with WebSocket test script:**
   ```bash
   python test_websocket.py
   ```

3. **Check server logs for frame processing:**
   - Look for "Detected X objects" messages
   - Check for any error messages

## 📊 Performance Monitoring

### Backend Performance
- **Frame Rate**: Should be ~15 FPS
- **CPU Usage**: Monitor with `htop` or Activity Monitor
- **Memory Usage**: Check for memory leaks

### Frontend Performance
- **Network Tab**: Check WebSocket messages frequency
- **Console**: Monitor for memory warnings
- **Performance Tab**: Check for frame drops

## 🔄 Troubleshooting Workflow

1. **Start with server health check:**
   ```bash
   curl http://localhost:8000/health
   ```

2. **Test WebSocket connection:**
   ```bash
   python test_websocket.py
   ```

3. **Check frontend console for errors**

4. **Verify camera access:**
   ```bash
   python -c "import cv2; cap = cv2.VideoCapture(0); print('Camera:', cap.isOpened()); cap.release()"
   ```

5. **Test Roboflow API:**
   ```bash
   python -c "
   from inference import get_model
   import os
   from dotenv import load_dotenv
   load_dotenv()
   model = get_model('weapon-detection-ctenp/1', api_key=os.getenv('ROBOFLOW_API_KEY'))
   print('✅ API working')
   "
   ```

## 📝 Log Analysis

### Server Logs to Watch For:
- `"WebSocket client connected"` - Client connected successfully
- `"Gun detector initialized successfully"` - AI model loaded
- `"Camera started successfully"` - Camera access granted
- `"Detected X objects"` - AI detection working
- `"WebSocket connection closed"` - Client disconnected

### Frontend Logs to Watch For:
- `"WebSocket connected"` - Connection established
- `"WebSocket status: Camera started successfully"` - Server ready
- `"WebSocket disconnected"` - Connection lost
- `"Attempting reconnection X/3"` - Auto-reconnection working

## 🎯 Success Indicators

✅ **Backend Working:**
- Server responds to health check
- WebSocket accepts connections
- Camera starts without errors
- AI detection processes frames

✅ **Frontend Working:**
- Green connection indicator
- Frames appear in img element
- No console errors
- Smooth frame updates

✅ **Integration Working:**
- Real-time video with AI annotations
- Automatic reconnection on disconnect
- Proper error handling and user feedback
