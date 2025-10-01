import cv2

# Laptop webcam
cap1 = cv2.VideoCapture(0)
# iRiun phone feed
cap2 = cv2.VideoCapture(5)

while True:
    ret1, frame1 = cap1.read()
    ret2, frame2 = cap2.read()

    if not ret1 or not ret2:
        print("Failed to grab frames")
        break

    cv2.imshow('Laptop Webcam', frame1)
    cv2.imshow('iRiun Phone', frame2)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap1.release()
cap2.release()
cv2.destroyAllWindows()
