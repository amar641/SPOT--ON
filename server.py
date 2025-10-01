import cv2
import pickle
import cvzone
import numpy as np
from probability import calculate_probability, load_database, save_database

# Load saved parking positions (custom rectangles)
with open('CarParkPos', 'rb') as f:
    posList = pickle.load(f)  # [(cam_id, x1, y1, x2, y2, color), ...]

# Open multiple cameras
cameras = {
    0: cv2.VideoCapture(0),  # add more if you have more cams
    5: cv2.VideoCapture(5)
}

def checkParkingSpace(imgPro, img, cam_id):
    free_spaces = 0
    occupied_spaces = 0

    for idx, pos in enumerate(posList):
        try:
            p_cam, x1, y1, x2, y2, color = pos
            if p_cam != cam_id:
                continue

            imgCrop = imgPro[y1:y2, x1:x2]
            count = cv2.countNonZero(imgCrop)

            threshold = 300
            if count < threshold:
                rect_color = (0, 255, 0)
                free_spaces += 1
            else:
                rect_color = (0, 0, 255)
                occupied_spaces += 1

            cv2.rectangle(img, (x1, y1), (x2, y2), rect_color, 2)
            label = f"ID-{idx + 1}"
            cvzone.putTextRect(img, label, (x1 + 5, y2 + 15), scale=0.5,
                               thickness=1, offset=3, colorR=rect_color)

        except Exception as e:
            print(f"Error processing parking space {pos}: {e}")

    return free_spaces, occupied_spaces


# Load database
data = load_database()
total_spaces = len(posList)

while True:
    free_total, occ_total = 0, 0
    frames = []

    for cam_id, cap in cameras.items():
        success, img = cap.read()
        if not success:
            img = np.zeros((480, 640, 3), dtype=np.uint8)
            cv2.putText(img, f"Camera {cam_id} not available",
                        (50, 240), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        else:
            imgGray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            imgBlur = cv2.GaussianBlur(imgGray, (3, 3), 1)
            imgThreshold = cv2.adaptiveThreshold(imgBlur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                                 cv2.THRESH_BINARY_INV, 25, 16)
            imgMedian = cv2.medianBlur(imgThreshold, 5)
            kernel = np.ones((3, 3), np.uint8)
            imgDilate = cv2.dilate(imgMedian, kernel, iterations=1)

            free, occ = checkParkingSpace(imgDilate, img, cam_id)
            free_total += free
            occ_total += occ

            cvzone.putTextRect(img, f"Cam {cam_id} | Free: {free} Occ: {occ}",
                               (30, 30), scale=1, thickness=2, offset=5, colorR=(255, 200, 0))

        frames.append(cv2.resize(img, (640, 480)))

    # Combine all cameras side by side
    combined = np.hstack(frames)

    probability = calculate_probability()

    # Update DB
    data["parking_lot"]["total_spaces"] = total_spaces
    data["parking_lot"]["free_spaces"] = free_total
    data["parking_lot"]["occupied_spaces"] = occ_total
    data["parking_lot"]["probability"] = probability
    save_database(data)

    print(f"Total: {total_spaces}, Free: {free_total}, "
          f"Occupied: {occ_total}, Probability: {probability}%", flush=True)

    cvzone.putTextRect(combined, f"Total: {total_spaces}  Free: {free_total}  "
                                 f"Occupied: {occ_total}  Prob: {probability}%",
                       (50, 470), scale=1, thickness=2, offset=5, colorR=(0, 100, 255))

    cv2.imshow("Live Parking (Multi-Cam)", combined)
    if cv2.waitKey(10) & 0xFF == ord('q'):
        break

for cap in cameras.values():
    cap.release()
cv2.destroyAllWindows()
