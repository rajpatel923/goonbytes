#!/bin/bash

# Start the notification server on port 8092
echo "🚀 Starting Student Notification & Police Reporter Service on port 8092..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found. Make sure environment variables are configured."
fi

# Start uvicorn server
uvicorn main:app --host 0.0.0.0 --port 8092 --reload

# Note: --reload enables auto-restart on file changes (good for development)
# For production, remove --reload flag
