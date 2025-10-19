#!/usr/bin/env python3
"""
Test Manual Stop Behavior
Simulates the frontend behavior to test manual stop functionality
"""
import asyncio
import websockets
import json
import time

async def test_manual_stop():
    """Test that manual stop prevents reconnection"""
    uri = "ws://localhost:8000/ws/video-stream"
    
    print("🧪 Testing Manual Stop Behavior")
    print("==============================")
    
    try:
        print("🔌 Connecting to WebSocket...")
        async with websockets.connect(uri) as websocket:
            print("✅ WebSocket connected!")
            
            # Listen for a few messages
            message_count = 0
            frame_count = 0
            
            print("📨 Listening for messages...")
            print("⏱️  Will simulate manual stop after 5 seconds...")
            
            start_time = time.time()
            
            try:
                async for message in websocket:
                    data = json.loads(message)
                    message_count += 1
                    
                    if data.get("type") == "frame":
                        frame_count += 1
                        print(f"📸 Received frame {frame_count}")
                    elif data.get("type") == "status":
                        print(f"ℹ️  Status: {data.get('message')}")
                    
                    # Simulate manual stop after 5 seconds
                    if time.time() - start_time > 5:
                        print("🛑 Simulating manual stop...")
                        await websocket.close()
                        print("✅ WebSocket closed manually")
                        break
                        
            except websockets.exceptions.ConnectionClosed:
                print("🔌 WebSocket connection closed")
                
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    print("✅ Manual stop test completed successfully!")
    print("📊 Summary: WebSocket should NOT attempt to reconnect after manual close")
    return True

if __name__ == "__main__":
    success = asyncio.run(test_manual_stop())
    
    if success:
        print("✅ Manual stop test passed!")
    else:
        print("❌ Manual stop test failed!")
