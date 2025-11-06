#!/usr/bin/env python3
"""
☁️ Cloud-First Vehicle Diagnostic Web Server
Enhanced web server that fetches data directly from Supabase cloud database
for ML predictions instead of local SQLite, enabling real-time cloud analytics.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO
from pathlib import Path
import json
import os
import pandas as pd
import numpy as np
from datetime import datetime, timezone
import joblib
import logging
import time
import random

# Import cloud storage
try:
    from supabase_direct_storage import supabase_storage
    CLOUD_STORAGE_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ Cloud storage unavailable: {e}")
    CLOUD_STORAGE_AVAILABLE = False

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure paths
BASE_DIR = Path(__file__).parent
MODELS_DIR = BASE_DIR / "models"

# Create Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'vehicle_diagnostic_cloud_2025'

# Initialize SocketIO with CORS enabled
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize CORS
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Enable CORS headers
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

class CloudMLPredictor:
    """Cloud-based ML model wrapper with Supabase data integration"""
    
    def __init__(self):
        self.model = None
        self.feature_names = [
            'engine_rpm', 'vehicle_speed', 'coolant_temp', 'fuel_level',
            'engine_load', 'throttle_position', 'fuel_pressure', 'intake_temp',
            'maf_rate', 'o2_voltage', 'short_fuel_trim', 'long_fuel_trim'
        ]
        self.load_model()
    
    def load_model(self):
        """Load the ML model with fallback options"""
        try:
            # Try to load the latest model
            model_files = list(MODELS_DIR.glob("*.joblib"))
            if model_files:
                latest_model = max(model_files, key=os.path.getctime)
                self.model = joblib.load(latest_model)
                logger.info(f"✅ ML model loaded successfully: {latest_model.name}")
            else:
                logger.warning("⚠️ No model files found, using fallback predictions")
        except Exception as e:
            logger.error(f"❌ Error loading ML model: {e}")
            self.model = None
    
    def get_cloud_vehicle_data(self, vehicle_id=None, limit=100):
        """Fetch vehicle data from Supabase cloud database"""
        try:
            if not CLOUD_STORAGE_AVAILABLE:
                return self.generate_fallback_data(limit)
            
            # Fetch from cloud storage
            data = supabase_storage.get_recent_diagnostic_data(vehicle_id, limit)
            
            if data and len(data) > 0:
                df = pd.DataFrame(data)
                logger.info(f"📊 Retrieved {len(df)} cloud records for vehicle {vehicle_id}")
                return df
            else:
                logger.info("📊 No cloud data found, generating fallback data")
                return self.generate_fallback_data(limit)
                
        except Exception as e:
            logger.error(f"❌ Cloud data fetch error: {e}")
            return self.generate_fallback_data(limit)
    
    def generate_fallback_data(self, limit=100):
        """Generate realistic synthetic data when cloud data unavailable"""
        np.random.seed(int(time.time()) % 1000)
        
        data = []
        for i in range(limit):
            # Generate realistic OBD-II parameter ranges
            record = {
                'timestamp': datetime.now(timezone.utc),
                'vehicle_id': f'DEMO_{random.randint(1, 5)}',
                'engine_rpm': np.random.normal(2000, 500),
                'vehicle_speed': max(0, np.random.normal(45, 15)),
                'coolant_temp': np.random.normal(90, 10),
                'fuel_level': max(0, min(100, np.random.normal(65, 20))),
                'engine_load': max(0, min(100, np.random.normal(45, 15))),
                'throttle_position': max(0, min(100, np.random.normal(25, 20))),
                'fuel_pressure': np.random.normal(45, 5),
                'intake_temp': np.random.normal(25, 10),
                'maf_rate': max(0, np.random.normal(8, 3)),
                'o2_voltage': np.random.uniform(0.1, 0.9),
                'short_fuel_trim': np.random.normal(0, 5),
                'long_fuel_trim': np.random.normal(0, 8)
            }
            data.append(record)
        
        return pd.DataFrame(data)
    
    def predict_maintenance_needs(self, vehicle_data):
        """Generate maintenance predictions using ML model or fallback logic"""
        try:
            if self.model is not None and len(vehicle_data) > 0:
                # Use trained model for predictions
                features_df = vehicle_data[self.feature_names].fillna(0)
                predictions = self.model.predict(features_df)
                probabilities = self.model.predict_proba(features_df)
                
                results = []
                for i, (pred, prob) in enumerate(zip(predictions, probabilities)):
                    confidence = max(prob) * 100
                    results.append({
                        'prediction': int(pred),
                        'confidence': confidence,
                        'health_score': max(20, min(100, 100 - (pred * 20) + np.random.normal(0, 5)))
                    })
                
                return results
            else:
                # Fallback algorithm based on thresholds
                return self.fallback_health_analysis(vehicle_data)
                
        except Exception as e:
            logger.error(f"❌ Prediction error: {e}")
            return self.fallback_health_analysis(vehicle_data)
    
    def fallback_health_analysis(self, vehicle_data):
        """Rule-based health analysis when ML model unavailable"""
        results = []
        
        for _, row in vehicle_data.iterrows():
            score = 85  # Base healthy score
            alerts = []
            
            # Engine health checks
            if row.get('coolant_temp', 90) > 105:
                score -= 15
                alerts.append({
                    'type': 'warning',
                    'message': 'High coolant temperature detected',
                    'value': row.get('coolant_temp')
                })
            
            if row.get('engine_load', 45) > 85:
                score -= 10
                alerts.append({
                    'type': 'info', 
                    'message': 'High engine load detected',
                    'value': row.get('engine_load')
                })
            
            if row.get('fuel_level', 65) < 15:
                score -= 5
                alerts.append({
                    'type': 'warning',
                    'message': 'Low fuel level',
                    'value': row.get('fuel_level')
                })
            
            # Add some realistic variation
            score += np.random.normal(0, 5)
            score = max(20, min(100, score))
            
            results.append({
                'prediction': 0 if score > 70 else 1,
                'confidence': min(95, max(60, score + np.random.uniform(-5, 5))),
                'health_score': score,
                'alerts': alerts
            })
        
        return results

# Initialize the ML predictor
ml_predictor = CloudMLPredictor()

@app.route("/")
def health_check():
    """Root health check endpoint for Render"""
    return jsonify({
        "status": "healthy",
        "service": "AutoPulse Backend API", 
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

@app.route('/api/status')
def get_status():
    """API status endpoint with system information"""
    return jsonify({
        'status': 'active',
        'cloud_storage': CLOUD_STORAGE_AVAILABLE,
        'ml_model_loaded': ml_predictor.model is not None,
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'version': '2.0.0'
    })

@app.route('/api/predict/<int:vehicle_id>')
def get_vehicle_prediction(vehicle_id):
    """Get ML predictions for specific vehicle"""
    try:
        # Fetch vehicle data
        vehicle_data = ml_predictor.get_cloud_vehicle_data(vehicle_id, limit=50)
        
        if vehicle_data.empty:
            return jsonify({'error': 'No data available for vehicle'}), 404
        
        # Generate predictions
        predictions = ml_predictor.predict_maintenance_needs(vehicle_data)
        
        # Return latest prediction
        latest_prediction = predictions[-1] if predictions else None
        
        return jsonify({
            'vehicle_id': vehicle_id,
            'prediction': latest_prediction,
            'data_points': len(vehicle_data),
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ Prediction API error: {e}")
        return jsonify({'error': 'Prediction service unavailable'}), 500

@app.route('/api/current-health')
def get_current_health():
    """Get current health summary across all vehicles"""
    try:
        # Get demo data for multiple vehicles
        all_data = ml_predictor.get_cloud_vehicle_data(limit=20)
        predictions = ml_predictor.predict_maintenance_needs(all_data)
        
        # Calculate summary statistics
        if predictions:
            avg_health = np.mean([p['health_score'] for p in predictions])
            vehicle_count = len(set(all_data['vehicle_id']) if 'vehicle_id' in all_data.columns else [1])
        else:
            avg_health = 75
            vehicle_count = 1
        
        return jsonify({
            'average_health_score': round(avg_health, 1),
            'total_vehicles': vehicle_count,
            'active_alerts': sum(1 for p in predictions if p['health_score'] < 70),
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ Health API error: {e}")
        return jsonify({'error': 'Health service unavailable'}), 500

@app.route('/api/vehicles')
def get_vehicles():
    """Get list of vehicles with recent data"""
    try:
        # Fetch recent data
        recent_data = ml_predictor.get_cloud_vehicle_data(limit=100)
        
        if recent_data.empty:
            return jsonify([])
        
        # Group by vehicle_id and get latest data for each
        if 'vehicle_id' in recent_data.columns:
            vehicles = []
            for vehicle_id in recent_data['vehicle_id'].unique():
                vehicle_records = recent_data[recent_data['vehicle_id'] == vehicle_id]
                latest_record = vehicle_records.iloc[-1]
                
                # Get prediction for this vehicle's latest data
                predictions = ml_predictor.predict_maintenance_needs(pd.DataFrame([latest_record]))
                health_info = predictions[0] if predictions else {'health_score': 75, 'prediction': 0}
                
                vehicles.append({
                    'id': vehicle_id,
                    'health_score': health_info['health_score'],
                    'status': 'healthy' if health_info['prediction'] == 0 else 'needs_maintenance',
                    'last_update': latest_record.get('timestamp', datetime.now(timezone.utc)).isoformat() if hasattr(latest_record.get('timestamp'), 'isoformat') else str(latest_record.get('timestamp', datetime.now(timezone.utc)))
                })
            
            return jsonify(vehicles)
        else:
            # Demo vehicle data
            return jsonify([{
                'id': 'DEMO_1',
                'health_score': 82.5,
                'status': 'healthy', 
                'last_update': datetime.now(timezone.utc).isoformat()
            }])
        
    except Exception as e:
        logger.error(f"❌ Vehicles API error: {e}")
        return jsonify([])

if __name__ == '__main__':
    # Development server (not used in production)
    app.run(host='0.0.0.0', port=5000, debug=False)
