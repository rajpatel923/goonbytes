#!/usr/bin/env python3
"""
WebSocket Connection Test Script
Tests the WebSocket connection to the video stream server
"""
import asyncio
import json
import websockets
import sys

async def test_websocket_connection():
    """Test WebSocket connection to the video stream server"""
    uri = "ws://localhost:8000/ws/video-stream"
    
    try:
        print("🔌 Testing WebSocket connection...")
        print(f"📡 Connecting to: {uri}")
        
        async with websockets.connect(uri) as websocket:
            print("✅ WebSocket connected successfully!")
            
            # Listen for messages
            message_count = 0
            frame_count = 0
            
            print("📨 Listening for messages...")
            print("Press Ctrl+C to stop")
            
            try:
                async for message in websocket:
                    data = json.loads(message)
                    message_count += 1
                    
                    if data.get("type") == "frame":
                        frame_count += 1
                        if frame_count % 10 == 0:  # Log every 10th frame
                            print(f"📸 Received frame {frame_count} (message {message_count})")
                    elif data.get("type") == "error":
                        print(f"❌ Server error: {data.get('message')}")
                    elif data.get("type") == "status":
                        print(f"ℹ️  Server status: {data.get('message')}")
                    else:
                        print(f"📨 Message {message_count}: {data.get('type', 'unknown')}")
                        
            except KeyboardInterrupt:
                print("\n🛑 Test interrupted by user")
                
    except ConnectionRefusedError:
        print("❌ Connection refused! Make sure the server is running:")
        print("   ./start_fixed_server.sh")
        return False
    except websockets.exceptions.InvalidURI:
        print("❌ Invalid URI! Check the WebSocket URL")
        return False
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False
    
    print(f"📊 Test completed: {message_count} messages, {frame_count} frames")
    return True

if __name__ == "__main__":
    print("🧪 WebSocket Connection Test")
    print("============================")
    
    success = asyncio.run(test_websocket_connection())
    
    if success:
        print("✅ WebSocket test completed successfully!")
        sys.exit(0)
    else:
        print("❌ WebSocket test failed!")
        sys.exit(1)
