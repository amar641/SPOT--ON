import json
import os
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for Node.js server to fetch data

# Use relative path - works from any directory
JSON_FILE = "database.json"

def read_parking_data():
    """Read parking data from database.json"""
    try:
        if not os.path.exists(JSON_FILE):
            return {
                "total_spaces": 0,
                "free_spaces": 0,
                "occupied_spaces": 0,
                "probability": 0.0,
                "error": "Database file not found"
            }

        with open(JSON_FILE, "r") as f:
            data = json.load(f)

        parking = data.get("parking_lot", {})
        
        return {
            "total_spaces": parking.get("total_spaces", 0),
            "free_spaces": parking.get("free_spaces", 0),
            "occupied_spaces": parking.get("occupied_spaces", 0),
            "probability": parking.get("probability", 0.0),
            "timestamp": parking.get("timestamp", "N/A")
        }

    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}", flush=True)
        return {
            "total_spaces": 0,
            "free_spaces": 0,
            "occupied_spaces": 0,
            "probability": 0.0,
            "error": "Invalid JSON format"
        }
    except Exception as e:
        print(f"Error reading JSON: {e}", flush=True)
        return {
            "total_spaces": 0,
            "free_spaces": 0,
            "occupied_spaces": 0,
            "probability": 0.0,
            "error": str(e)
        }

@app.route('/', methods=['GET'])
def home():
    """Root endpoint"""
    return jsonify({
        "message": "Parking Detection API",
        "endpoints": {
            "/parking-data": "GET - Fetch current parking data",
            "/health": "GET - Check API health"
        }
    }), 200

@app.route('/parking-data', methods=['GET'])
def get_parking_data():
    """GET endpoint for parking data"""
    data = read_parking_data()
    return jsonify(data), 200

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "running",
        "database_exists": os.path.exists(JSON_FILE)
    }), 200

if __name__ == "__main__":
    print("=" * 50)
    print("🚗 Parking Detection API Server Starting...")
    print(f"📁 Database file: {os.path.abspath(JSON_FILE)}")
    print(f"🌐 API will be available at: http://localhost:5000")
    print(f"📊 Parking data endpoint: http://localhost:5000/parking-data")
    print("=" * 50)
    
    # Run Flask on port 5000 (default) without debug mode for production
    app.run(host="0.0.0.0", port=5000, debug=False, use_reloader=False)