"""
Simple Gun Detection - Detects weapons and draws boxes
Optimized for M3 MacBook Pro
"""
from inference import get_model
import supervision as sv
import cv2
import os
from collections import deque
from dotenv import load_dotenv

load_dotenv()

# Settings - Optimized for M3 MacBook Pro
CONFIDENCE_THRESHOLD = 0.65
FRAME_SKIP = 1
MAX_FPS = 15
NMS_THRESHOLD = 0.4
STABILITY_FRAMES = 10

class DetectionStabilizer:
    """Prevents flickering by requiring consecutive detections"""
    def __init__(self, min_consecutive=STABILITY_FRAMES):
        self.detection_history = deque(maxlen=min_consecutive + 2)
        self.min_consecutive = min_consecutive
        self.last_stable = None
    
    def update(self, detections):
        has_detection = len(detections) > 0
        self.detection_history.append(has_detection)
        
        recent = sum(list(self.detection_history)[-self.min_consecutive:])
        
        if recent >= self.min_consecutive:
            if has_detection:
                self.last_stable = detections
                return detections
            elif self.last_stable is not None:
                return self.last_stable
        
        if recent == 0:
            self.last_stable = None
        
        return sv.Detections.empty()

class GunDetector:
    """Simple gun detector with stabilization"""
    def __init__(self):
        self.model = get_model(
            model_id="weapon-detection-ctenp/1",
            api_key=os.getenv("ROBOFLOW_API_KEY")
        )
        self.box_annotator = sv.BoxAnnotator(thickness=2, color=sv.Color.RED)
        self.label_annotator = sv.LabelAnnotator(text_color=sv.Color.WHITE, text_thickness=1)
        self.stabilizer = DetectionStabilizer()
        self.detection_results = None
    
    def detect(self, frame):
        """Run detection on frame"""
        try:
            results = self.model.infer(frame)[0]
            detections = sv.Detections.from_inference(results)
            
            if len(detections) > 0:
                # Filter by confidence and apply NMS
                detections = detections[detections.confidence > CONFIDENCE_THRESHOLD]
                detections = detections.with_nms(threshold=NMS_THRESHOLD)
            
            # Stabilize to prevent flickering
            self.detection_results = self.stabilizer.update(detections)
        except Exception as e:
            print(f"Error: {e}")
            self.detection_results = sv.Detections.empty()
    
    def draw(self, frame):
        """Draw boxes on frame"""
        if self.detection_results is not None and len(self.detection_results) > 0:
            frame = self.box_annotator.annotate(scene=frame, detections=self.detection_results)
            frame = self.label_annotator.annotate(scene=frame, detections=self.detection_results)
        return frame

def main():
    detector = GunDetector()
    cap = cv2.VideoCapture(0)
    
    # Optimize camera
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    cap.set(cv2.CAP_PROP_FPS, MAX_FPS)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    
    print("🔫 Gun Detection Running")
    print("Press 'q' to quit")
    
    frame_count = 0
    
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_count += 1
            
            # Process every frame or skip based on FRAME_SKIP
            if frame_count % FRAME_SKIP == 0:
                detector.detect(frame)
            
            # Draw boxes
            annotated = detector.draw(frame)
            
            # Show
            cv2.imshow("Gun Detection", annotated)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
                
    except KeyboardInterrupt:
        print("\nShutting down...")
    finally:
        cap.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
