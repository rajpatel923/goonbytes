#!/bin/bash

# FastAPI Video Stream Server Startup Script
echo "🎥 Gun Detection Video Stream Server"
echo "===================================="

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Run ./setup.sh first to set up the environment"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "Please create a .env file with your Roboflow API key:"
    echo "echo 'ROBOFLOW_API_KEY=your_key_here' > .env"
    exit 1
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

echo ""
echo "🚀 Starting FastAPI Video Stream Server..."
echo "=========================================="
echo ""
echo "📹 WebSocket endpoint: ws://localhost:8000/ws/video-stream"
echo "🔧 Health check: http://localhost:8000/health"
echo "🔫 Gun detection with real-time streaming"
echo "⌨️  Press Ctrl+C to stop the server"
echo ""

# Start the FastAPI server
python video_stream_server.py
