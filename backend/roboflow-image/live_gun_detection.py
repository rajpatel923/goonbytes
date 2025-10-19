from inference import get_model
import supervision as sv
import cv2
import os
from dotenv import load_dotenv

# Load API key
load_dotenv()

# Load the gun detection model
model = get_model(
    model_id="weapon-detection-ctenp/1",  # Your gun detection model
    api_key=os.getenv("ROBOFLOW_API_KEY")
)

# Create supervision annotators for beautiful boxes
bounding_box_annotator = sv.BoxAnnotator(thickness=3, color=sv.Color.RED)
label_annotator = sv.LabelAnnotator(text_color=sv.Color.WHITE, text_thickness=2)

# Open webcam
cap = cv2.VideoCapture(0)

print("🎥 Starting gun detection on webcam...")
print("Press 'q' to quit")

while True:
    # Read frame from webcam
    ret, frame = cap.read()
    if not ret:
        break
    
    # Run inference on the frame
    results = model.infer(frame)[0]
    
    # Convert results to supervision Detections
    detections = sv.Detections.from_inference(results)
    
    # Annotate frame with bounding boxes
    annotated_frame = bounding_box_annotator.annotate(
        scene=frame, 
        detections=detections
    )
    
    # Add labels with confidence scores
    annotated_frame = label_annotator.annotate(
        scene=annotated_frame, 
        detections=detections
    )
    
    # Display detection count
    if len(detections) > 0:
        print(f"🔫 {len(detections)} gun(s) detected!")
    
    # Show the frame
    cv2.imshow("Gun Detection", annotated_frame)
    
    # Break on 'q' key
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Cleanup
cap.release()
cv2.destroyAllWindows()
