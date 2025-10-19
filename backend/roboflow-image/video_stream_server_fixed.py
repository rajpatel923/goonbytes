"""
Fixed FastAPI WebSocket Video Streaming Server for Gun Detection
Streams annotated video frames from Python backend to frontend
"""
import asyncio
import base64
import cv2
import json
import logging
import os
import time
from typing import Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from event_formatter import aggregator

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Gun Detection Video Stream", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VideoStreamManager:
    """Manages video streaming and gun detection"""
    
    def __init__(self):
        print("video_stream_server_fixed.py initialized")
        self.detector = None
        self.cap: Optional[cv2.VideoCapture] = None
        self.is_streaming = False
        self.frame_count = 0
        self.frame_skip = 1  # Process every frame
        self.api_key = None
        
    async def initialize_detector(self):
        """Initialize the gun detector with API key"""
        try:
            self.api_key = os.getenv("ROBOFLOW_API_KEY")
            if not self.api_key:
                raise ValueError("ROBOFLOW_API_KEY not found in environment variables")
            
            # Import here to avoid issues if not available
            try:
                from inference import get_model
                import supervision as sv
                
                self.detector = get_model(
                    model_id="weapon-detection-ctenp/1",
                    api_key=self.api_key
                )
                
                # Create annotators
                self.box_annotator = sv.BoxAnnotator(thickness=2, color=sv.Color.RED)
                self.label_annotator = sv.LabelAnnotator(text_color=sv.Color.WHITE, text_thickness=1)
                
                logger.info("Gun detector initialized successfully")
                return True
            except ImportError as e:
                logger.error(f"Failed to import inference libraries: {e}")
                return False
            except Exception as e:
                logger.error(f"Failed to initialize detector: {e}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to initialize detector: {e}")
            return False
    
    async def start_camera(self):
        """Start camera capture"""
        try:
            if self.cap is not None:
                logger.warning("Camera already running")
                return True
                
            self.cap = cv2.VideoCapture(0)
            if not self.cap.isOpened():
                raise Exception("Failed to open camera")
            
            # Optimize camera settings
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            self.cap.set(cv2.CAP_PROP_FPS, 15)
            self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
            
            self.is_streaming = True
            logger.info("Camera started successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to start camera: {e}")
            return False
    
    async def stop_camera(self):
        """Stop camera capture"""
        try:
            self.is_streaming = False
            if self.cap is not None:
                self.cap.release()
                self.cap = None
            logger.info("Camera stopped")
        except Exception as e:
            logger.error(f"Error stopping camera: {e}")
    
    async def get_annotated_frame(self):
        """Capture and process a single frame"""
        if not self.cap or not self.is_streaming:
            return None
            
        try:
            ret, frame = self.cap.read()
            if not ret:
                return None
            
            self.frame_count += 1
            
            # Process frame with detection if detector is available
            if self.detector and self.frame_count % self.frame_skip == 0:
                try:
                    # Run inference
                    results = self.detector.infer(frame)[0]

                    # Add frame to aggregator
                    if aggregator is None:
                        pass
                    else:
                        try:
                            camera_id = os.getenv("CAMERA_ID", "camera_1")
                            event = aggregator.add_frame(results, camera_id)
                            if event:
                                print("Aggregated event emitted:", event.get("event_id"))
                        except Exception as e:
                            print("Aggregator error:", e)

                    
                    # Import supervision here to avoid circular imports
                    import supervision as sv
                    detections = sv.Detections.from_inference(results)
                    
                    # Filter by confidence threshold
                    if len(detections) > 0:
                        detections = detections[detections.confidence > 0.65]
                        detections = detections.with_nms(threshold=0.4)
                    
                    # Draw annotations
                    if len(detections) > 0:
                        frame = self.box_annotator.annotate(scene=frame, detections=detections)
                        frame = self.label_annotator.annotate(scene=frame, detections=detections)
                        
                        # Log detection
                        logger.info(f"🔫 Detected {len(detections)} weapon(s)!")
                        
                except Exception as e:
                    logger.error(f"Error in detection: {e}")
                    # Continue with original frame if detection fails
            
            return frame
        except Exception as e:
            logger.error(f"Error processing frame: {e}")
            return None
    
    def encode_frame_to_jpeg(self, frame):
        """Encode frame as JPEG and return base64 string"""
        try:
            # Encode frame as JPEG
            encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 80]  # 80% quality
            _, buffer = cv2.imencode('.jpg', frame, encode_param)
            
            # Convert to base64
            frame_base64 = base64.b64encode(buffer).decode('utf-8')
            return frame_base64
        except Exception as e:
            logger.error(f"Error encoding frame: {e}")
            return None

# Global stream manager
stream_manager = VideoStreamManager()

@app.websocket("/ws/video-stream")
async def video_stream_endpoint(websocket: WebSocket):
    """WebSocket endpoint for video streaming"""
    await websocket.accept()
    logger.info("WebSocket client connected")
    
    try:
        # Initialize detector
        if not await stream_manager.initialize_detector():
            await websocket.send_text(json.dumps({
                "type": "error",
                "message": "Failed to initialize gun detector. Check API key."
            }))
            return
        
        # Start camera
        if not await stream_manager.start_camera():
            await websocket.send_text(json.dumps({
                "type": "error", 
                "message": "Failed to start camera. Check camera permissions."
            }))
            return
        
        # Send success message
        await websocket.send_text(json.dumps({
            "type": "status",
            "message": "Camera started successfully"
        }))
        
        # Main streaming loop
        frame_count = 0
        while stream_manager.is_streaming:
            try:
                # Get annotated frame
                frame = await stream_manager.get_annotated_frame()
                if frame is None:
                    await asyncio.sleep(0.1)
                    continue
                
                # Encode frame
                frame_base64 = stream_manager.encode_frame_to_jpeg(frame)
                if frame_base64 is None:
                    continue
                
                # Send frame to client
                await websocket.send_text(json.dumps({
                    "type": "frame",
                    "data": frame_base64,
                    "timestamp": time.time(),
                    "frame_id": frame_count
                }))
                
                frame_count += 1
                
                # Control frame rate (15 FPS)
                await asyncio.sleep(1.0 / 15)
                
            except WebSocketDisconnect:
                logger.info("WebSocket client disconnected")
                break
            except Exception as e:
                logger.error(f"Error in streaming loop: {e}")
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": f"Streaming error: {str(e)}"
                }))
                break
                
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        try:
            await websocket.send_text(json.dumps({
                "type": "error",
                "message": f"Connection error: {str(e)}"
            }))
        except:
            pass
    finally:
        # Cleanup
        await stream_manager.stop_camera()
        logger.info("WebSocket connection closed")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Gun detection server is running"}

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Gun Detection Video Stream Server",
        "websocket_endpoint": "/ws/video-stream",
        "health_check": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
