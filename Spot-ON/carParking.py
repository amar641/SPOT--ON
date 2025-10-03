import cv2
import pickle
import cvzone
import numpy as np
import time

# Video feed
cap = cv2.VideoCapture(r'/Users/aryan/Spot on project /Spot-ON/python/carPark.mp4')


# Load parking positions
with open('CarParkPos', 'rb') as f:
    posList = pickle.load(f)

width, height = 107, 48
prev_free_spots = -1  # Initialize with an invalid value to trigger the first print

def checkParkingSpace(imgPro):
    global prev_free_spots
    spaceCounter = 0  # Count of free spaces

    for pos in posList:
        x, y = pos
        imgCrop = imgPro[y:y + height, x:x + width]
        count = cv2.countNonZero(imgCrop)

        if count < 900:  # If the space is mostly empty
            color = (0, 255, 0)
            thickness = 5
            spaceCounter += 1  # Increment free space count
        else:
            color = (0, 0, 255)
            thickness = 2

        cv2.rectangle(img, pos, (pos[0] + width, pos[1] + height), color, thickness)
        cvzone.putTextRect(img, str(count), (x, y + height - 3), scale=1,
                           thickness=2, offset=0, colorR=color)

    # In carParking.py (inside checkParkingSpace)
    if spaceCounter != prev_free_spots:
        prev_free_spots = spaceCounter
        occupied_spaces = len(posList) - spaceCounter
        print(f"{spaceCounter},{occupied_spaces}", flush=True)  # <-- Send data as CSV format

        return occupied_spaces #return spaces as output


    return None  # No change in free spots

while True:
    if cap.get(cv2.CAP_PROP_POS_FRAMES) == cap.get(cv2.CAP_PROP_FRAME_COUNT):
        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)

    success, img = cap.read()
    if not success:
        break  # Exit if video reading fails

    imgGray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    imgBlur = cv2.GaussianBlur(imgGray, (3, 3), 1)
    imgThreshold = cv2.adaptiveThreshold(imgBlur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                         cv2.THRESH_BINARY_INV, 25, 16)
    imgMedian = cv2.medianBlur(imgThreshold, 5)
    kernel = np.ones((3, 3), np.uint8)
    imgDilate = cv2.dilate(imgMedian, kernel, iterations=1)

    occupied_cars = checkParkingSpace(imgDilate)  # Check parking space

    if occupied_cars is not None:
        pass  # You can store or process the value if needed

    cv2.imshow("Image", img)
    if cv2.waitKey(10) & 0xFF == ord('q'):
        break  # Press 'q' to exit

cap.release()
cv2.destroyAllWindows()