import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Supabase client
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("Supabase URL and Key must be set in the .env file.")

supabase: Client = create_client(supabase_url, supabase_key)

@app.route('/')
def index():
    return "AutoPulse Flask API is running!"

@app.route('/log', methods=['POST'])
def create_log():
    """
    Receives telemetry data from Raspberry Pi and inserts it into Supabase.
    Expects a JSON payload with vehicle_id and other sensor data.
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400

    # Basic validation
    vehicle_id = data.get('vehicle_id')
    if not vehicle_id:
        return jsonify({"error": "vehicle_id is required"}), 400

    try:
        # Insert data into the 'telemetry_data' table
        response = supabase.table('telemetry_data').insert(data).execute()
        
        # Check for errors in the response
        if response.data:
            return jsonify({"success": True, "data": response.data}), 201
        else:
            return jsonify({"error": "Failed to insert data", "details": response.error}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/data/latest', methods=['GET'])
def get_latest_data():
    """
    Returns the most recent telemetry data row.
    """
    try:
        response = supabase.table('telemetry_data').select('*').order('timestamp', desc=True).limit(1).execute()
        if response.data:
            return jsonify(response.data[0]), 200
        else:
            return jsonify({"message": "No data found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/logs', methods=['GET'])
def get_logs():
    """
    Returns a list of logs, with optional filtering by severity.
    Example: /logs?severity=warning
    """
    severity = request.args.get('severity')
    try:
        query = supabase.table('logs').select('*').order('timestamp', desc=True)
        if severity and severity.lower() != 'all':
            query = query.eq('severity', severity)
            
        response = query.execute()
        
        if response.data:
            return jsonify(response.data), 200
        else:
            return jsonify([]), 200 # Return empty list if no logs match
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
