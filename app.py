from flask import Flask, jsonify
from probability import load_database

app = Flask(__name__)

@app.route('/parking-data', methods=['GET'])
def get_parking_data():
    """
    Returns the latest parking lot info as JSON
    """
    try:
        data = load_database()  # Reads from database.json
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
