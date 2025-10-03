import json
import os
import time
import threading
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

# Use relative path - works from any directory
JSON_FILE = "database.json"

# Store last data to detect changes
last_data = None

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
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
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

def monitor_and_broadcast():
    """Monitor database changes and broadcast via WebSocket"""
    global last_data
    print("🔄 Starting live monitoring thread...")
    
    while True:
        try:
            current_data = read_parking_data()
            
            # Only broadcast if data changed
            if current_data != last_data:
                last_data = current_data
                socketio.emit('parking_update', current_data, namespace='/')
                print(f"📡 Broadcasted: Free={current_data['free_spaces']}, "
                      f"Occupied={current_data['occupied_spaces']}, "
                      f"Probability={current_data['probability']}%", flush=True)
            
            time.sleep(0.5)  # Check every 500ms
            
        except Exception as e:
            print(f"❌ Monitor error: {e}", flush=True)
            time.sleep(1)

# REST API Endpoints
@app.route('/', methods=['GET'])
def home():
    """Root endpoint"""
    return jsonify({
        "message": "Parking Detection API with WebSocket",
        "endpoints": {
            "/parking-data": "GET - Fetch current parking data",
            "/health": "GET - Check API health"
        },
        "websocket": {
            "url": "ws://localhost:8080",
            "event": "parking_update",
            "description": "Connect to receive real-time parking updates"
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
        "database_exists": os.path.exists(JSON_FILE),
        "websocket_active": True
    }), 200

# WebSocket Events
@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    client_id = request.sid if request else 'unknown'
    print(f"✅ Client connected: {client_id}", flush=True)
    # Send current data immediately on connect
    data = read_parking_data()
    emit('parking_update', data)

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    print(f"❌ Client disconnected", flush=True)

@socketio.on('request_data')
def handle_request():
    """Handle manual data request from client"""
    data = read_parking_data()
    emit('parking_update', data)
    print(f"📥 Manual data request received", flush=True)

if __name__ == "__main__":
    print("=" * 60)
    print("🚗 Parking Detection API Server with WebSocket Starting...")
    print(f"📁 Database file: {os.path.abspath(JSON_FILE)}")
    print(f"🌐 REST API: http://localhost:8080")
    print(f"📊 Parking data: http://localhost:8080/parking-data")
    print(f"🔌 WebSocket: ws://localhost:8080")
    print(f"📡 Event name: 'parking_update'")
    print("=" * 60)
    
    # Start monitoring thread
    monitor_thread = threading.Thread(target=monitor_and_broadcast, daemon=True)
    monitor_thread.start()
    
    # Run Flask-SocketIO server on port 8080
    socketio.run(app, host="0.0.0.0", port=8080, debug=False, allow_unsafe_werkzeug=True)