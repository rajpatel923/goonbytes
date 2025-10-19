#!/usr/bin/env python3
"""
Simple WebSocket Test
"""
import asyncio
import websockets
import json

async def test_connection():
    uri = "ws://localhost:8000/ws/video-stream"
    
    try:
        print("🔌 Testing WebSocket connection...")
        print(f"📡 Connecting to: {uri}")
        
        async with websockets.connect(uri) as websocket:
            print("✅ WebSocket connected successfully!")
            
            # Listen for a few messages
            message_count = 0
            frame_count = 0
            
            print("📨 Listening for messages...")
            
            try:
                async for message in websocket:
                    data = json.loads(message)
                    message_count += 1
                    
                    if data.get("type") == "frame":
                        frame_count += 1
                        print(f"📸 Received frame {frame_count}")
                    elif data.get("type") == "error":
                        print(f"❌ Server error: {data.get('message')}")
                    elif data.get("type") == "status":
                        print(f"ℹ️  Server status: {data.get('message')}")
                    else:
                        print(f"📨 Message {message_count}: {data.get('type', 'unknown')}")
                    
                    # Stop after 10 messages or 3 frames
                    if message_count >= 10 or frame_count >= 3:
                        print("✅ Test completed successfully!")
                        break
                        
            except KeyboardInterrupt:
                print("\n🛑 Test interrupted by user")
                
    except ConnectionRefusedError:
        print("❌ Connection refused! Make sure the server is running:")
        print("   ./start_fixed_server.sh")
        return False
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False
    
    print(f"📊 Test completed: {message_count} messages, {frame_count} frames")
    return True

if __name__ == "__main__":
    print("🧪 Simple WebSocket Test")
    print("=======================")
    
    success = asyncio.run(test_connection())
    
    if success:
        print("✅ WebSocket test completed successfully!")
    else:
        print("❌ WebSocket test failed!")
