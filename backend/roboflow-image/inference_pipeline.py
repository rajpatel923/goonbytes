# 1. Import the InferencePipeline library
from inference import InferencePipeline
import cv2
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def my_sink(result, video_frame):
    # Display the video frame (always show camera feed)
    if result.get("output_image"):
        # Show workflow output if available (with detections)
        cv2.imshow("Gun Detection", result["output_image"].numpy_image)
    else:
        # Show raw frame if no workflow output
        cv2.imshow("Gun Detection", video_frame.image)
    
    cv2.waitKey(1)
    # Do something with the predictions of each frame
    print(result)


# 2. Initialize a pipeline object
pipeline = InferencePipeline.init_with_workflow(
    api_key=os.getenv("ROBOFLOW_API_KEY"),
    workspace_name=os.getenv("ROBOFLOW_WORKSPACE_NAME"),
    workflow_id=os.getenv("ROBOFLOW_WORKFLOW_ID"),
    video_reference=0, # Path to video, device id (int, usually 0 for built in webcams), or RTSP stream url
    max_fps=30,
    on_prediction=my_sink
)

# 3. Initialize the display window
cv2.namedWindow("Gun Detection", cv2.WINDOW_AUTOSIZE)

# 4. Start the pipeline and wait for it to finish
try:
    pipeline.start()
    pipeline.join()
except KeyboardInterrupt:
    print("\nShutting down...")
finally:
    # Clean up OpenCV windows
    cv2.destroyAllWindows()
