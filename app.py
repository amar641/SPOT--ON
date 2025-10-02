import json
import time
import threading
from flask import Flask, jsonify

JSON_FILE = "C:\\Users\\Asus\\OneDrive\\Desktop\\Projects\\spoton\\SPOT--ON\\database.json"  

app = Flask(__name__)

def read_parking_data():
    try:
        with open(JSON_FILE, "r") as f:
            data = json.load(f)

        parking = data.get("parking_lot", {})
        total_spaces = parking.get("total_spaces", 0)
        free_spaces = parking.get("free_spaces", 0)
        occupied_spaces = parking.get("occupied_spaces", 0)
        probability = parking.get("probability", 0.0)

        return {
            "total_spaces": total_spaces,
            "free_spaces": free_spaces,
            "occupied_spaces": occupied_spaces,
            "probability": probability
        }

    except Exception as e:
        print(f"Error reading JSON: {e}", flush=True)
        return {
            "total_spaces": 0,
            "free_spaces": 0,
            "occupied_spaces": 0,
            "probability": 0.0
        }

def print_continuously():
    while True:
        data = read_parking_data()
        print(f"Total: {data['total_spaces']}, Free: {data['free_spaces']}, "
              f"Occupied: {data['occupied_spaces']}, Probability: {data['probability']:.2f}%", flush=True)
        time.sleep(1)

@app.route('/parking-data', methods=['GET'])
def get_parking_data():
    data = read_parking_data()
    return jsonify(data), 200

if __name__ == "__main__":
    # Start continuous printing in background
    t = threading.Thread(target=print_continuously, daemon=True)
    t.start()

    # Start Flask server
    app.run(host="0.0.0.0", port=8080, debug=True)
