import cv2
import pickle
import numpy as np

# Load or initialize parking positions
try:
    with open('CarParkPos', 'rb') as f:
        posList = pickle.load(f)  # list of (cam_id, x1, y1, x2, y2, color)
except FileNotFoundError:
    posList = []

# Open both cameras
cap0 = cv2.VideoCapture(0)
cap5 = cv2.VideoCapture(5)

# Variables for drawing
drawing = False
start_point = None
current_cam = 0  # 0 = left, 5 = right

def mouseClick(event, x, y, flags, param):
    global drawing, start_point, posList

    frame_width = param["frame_width"]

    # Decide camera based on x position
    if x < frame_width:
        cam_id = 0
        x_cam = x
    else:
        cam_id = 5
        x_cam = x - frame_width

    color = (255, 0, 255) if cam_id == 0 else (0, 0, 255)

    if event == cv2.EVENT_LBUTTONDOWN:
        drawing = True
        start_point = (x_cam, y)

    elif event == cv2.EVENT_MOUSEMOVE and drawing:
        # Just preview rectangle (not saved yet)
        param["preview"] = (cam_id, start_point[0], start_point[1], x_cam, y, color)

    elif event == cv2.EVENT_LBUTTONUP:
        drawing = False
        x1, y1 = start_point
        x2, y2 = x_cam, y
        # Normalize coordinates (so top-left -> bottom-right always)
        x1, x2 = sorted([x1, x2])
        y1, y2 = sorted([y1, y2])

        posList.append((cam_id, x1, y1, x2, y2, color))
        param["preview"] = None

        # Save positions
        with open('CarParkPos', 'wb') as f:
            pickle.dump(posList, f)

    elif event == cv2.EVENT_RBUTTONDOWN:
        # Right-click = remove space if inside
        for i, (c_id, x1, y1, x2, y2, c) in enumerate(posList):
            if c_id == cam_id and x1 < x_cam < x2 and y1 < y < y2:
                posList.pop(i)
                break
        with open('CarParkPos', 'wb') as f:
            pickle.dump(posList, f)

while True:
    ret0, img0 = cap0.read()
    ret5, img5 = cap5.read()

    if not ret0 and not ret5:
        print("No cameras available.")
        break

    if not ret0:
        img0 = np.zeros((480, 640, 3), dtype=np.uint8)
    if not ret5:
        img5 = np.zeros((480, 640, 3), dtype=np.uint8)

    img0 = cv2.resize(img0, (640, 480))
    img5 = cv2.resize(img5, (640, 480))

    # Draw saved spaces
    for cam_id, x1, y1, x2, y2, color in posList:
        if cam_id == 0:
            cv2.rectangle(img0, (x1, y1), (x2, y2), color, 2)
        else:
            cv2.rectangle(img5, (x1, y1), (x2, y2), color, 2)

    # Combine feeds
    combined = np.hstack((img0, img5))

    # Draw preview rectangle if dragging
    if "preview" in locals() and locals()["preview"]:
        cam_id, x1, y1, x2, y2, color = locals()["preview"]
        if cam_id == 0:
            cv2.rectangle(combined, (x1, y1), (x2, y2), (0, 255, 0), 1)
        else:
            cv2.rectangle(combined, (x1 + img0.shape[1], y1),
                          (x2 + img0.shape[1], y2), (0, 255, 0), 1)

    cv2.imshow("Space Picker (Left=Cam0 | Right=Cam5)", combined)
    cv2.setMouseCallback("Space Picker (Left=Cam0 | Right=Cam5)", mouseClick,
                         {"frame_width": img0.shape[1], "preview": None})

    key = cv2.waitKey(1) & 0xFF
    if key == ord('q'):
        break

cap0.release()
cap5.release()
cv2.destroyAllWindows()
