#!/usr/bin/env python3
"""
☁️ Cloud-First Vehicle Diagnostic Web Server
Enhanced web server that fetches data directly from Supabase cloud database
for ML predictions instead of local SQLite, enabling real-time cloud analytics.
"""

from flask import Flask, jsonify, request
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

# Enable CORS
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
        self.model_loaded = False
        self.model_info = {}
        self.cloud_storage = supabase_storage
        self.load_model()
    
    def load_model(self):
        """Load ML model or create fallback"""
        try:
            # Look for model files
            model_files = list(MODELS_DIR.glob("*.joblib")) if MODELS_DIR.exists() else []
            
            if model_files:
                model_path = sorted(model_files, key=lambda x: x.stat().st_mtime)[-1]
                logger.info(f"Loading ML model: {model_path.name}")
                
                model_package = joblib.load(model_path)
                self.model = model_package['model']
                self.model_info = model_package.get('info', {})
                self.model_loaded = True
                
                logger.info("✅ ML model loaded successfully")
            else:
                self.create_fallback_model()
                
        except Exception as e:
            logger.error(f"❌ Failed to load ML model: {e}")
            self.create_fallback_model()
    
    def create_fallback_model(self):
        """Create simple fallback model"""
        class FallbackModel:
            def predict(self, X):
                if len(X) == 0:
                    return [75]
                
                scores = []
                for row in X:
                    rpm = row[0] if len(row) > 0 else 800
                    coolant_temp = row[2] if len(row) > 2 else 90
                    engine_load = row[3] if len(row) > 3 else 20
                    
                    health = 100
                    if rpm > 4000: health -= 10
                    elif rpm < 500: health -= 15
                    
                    if coolant_temp > 105: health -= 20
                    elif coolant_temp > 95: health -= 10
                    
                    if engine_load > 80: health -= 15
                    
                    scores.append(max(20, min(100, health)))
                
                return scores
        
        self.model = FallbackModel()
        self.model_loaded = True
        self.model_info = {'type': 'fallback', 'accuracy': 'N/A'}
        logger.info("✅ Fallback model created")
    
    def predict_vehicle_health_from_cloud(self, vehicle_id, data_limit=100):
        """Predict vehicle health using cloud data"""
        try:
            if not self.cloud_storage.is_connected:
                logger.warning("⚠️ Cloud storage not connected, using mock data")
                return self.generate_mock_prediction()
            
            # Get recent sensor data from cloud
            sensor_data = self.cloud_storage.get_recent_sensor_data(vehicle_id, data_limit)
            
            if not sensor_data:
                logger.warning(f"⚠️ No cloud data for vehicle {vehicle_id}")
                return self.generate_mock_prediction()
            
            # Convert to DataFrame
            df = pd.DataFrame(sensor_data)
            
            # Prepare features
            feature_columns = ['rpm', 'speed_mph', 'coolant_temp_c', 'engine_load_pct', 
                             'throttle_position_pct', 'fuel_level_pct']
            
            for col in feature_columns:
                if col not in df.columns:
                    df[col] = 0
            
            latest_reading = df.iloc[0] if len(df) > 0 else None
            X = df[feature_columns].fillna(0).values
            
            # Get ML prediction
            if self.model_loaded and len(X) > 0:
                health_scores = self.model.predict(X)
                current_health = int(health_scores[0])
            else:
                current_health = 75
            
            # Generate alerts
            alerts = self.generate_alerts_from_data(latest_reading) if latest_reading is not None else []
            
            return {
                'health_score': current_health,
                'prediction_confidence': 0.85 if self.model_loaded else 0.50,
                'data_points_analyzed': len(df),
                'alerts': alerts,
                'statistics': {
                    'avg_rpm': round(df['rpm'].mean(), 1) if len(df) > 0 else 0,
                    'avg_temperature': round(df['coolant_temp_c'].mean(), 1) if len(df) > 0 else 0,
                    'avg_engine_load': round(df['engine_load_pct'].mean(), 1) if len(df) > 0 else 0,
                    'data_quality': df['data_quality_score'].mean() if 'data_quality_score' in df.columns else 90
                },
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'model_info': self.model_info,
                'data_source': 'cloud'
            }
            
        except Exception as e:
            logger.error(f"❌ Cloud ML prediction error: {e}")
            return self.generate_mock_prediction()
    
    def generate_alerts_from_data(self, latest_data):
        """Generate maintenance alerts based on sensor data"""
        alerts = []
        
        try:
            if latest_data.get('coolant_temp_c', 0) > 105:
                alerts.append({
                    'severity': 'high',
                    'message': 'Engine overheating detected - Check coolant system',
                    'component': 'cooling_system'
                })
            
            if latest_data.get('rpm', 0) > 4500:
                alerts.append({
                    'severity': 'medium',
                    'message': 'High RPM detected - Consider gentler driving',
                    'component': 'engine'
                })
            
            if latest_data.get('fuel_level_pct', 100) < 15:
                alerts.append({
                    'severity': 'low',
                    'message': 'Low fuel level - Refuel soon',
                    'component': 'fuel_system'
                })
            
        except Exception as e:
            logger.error(f"Alert generation error: {e}")
        
        return alerts
    
    def generate_mock_prediction(self):
        """Generate mock prediction for demo purposes"""
        current_health = random.randint(70, 95)
        
        alerts = []
        if current_health < 80:
            alerts.append({
                'severity': 'medium',
                'message': 'Consider routine maintenance check',
                'component': 'general'
            })
        
        return {
            'health_score': current_health,
            'prediction_confidence': 0.65,
            'data_points_analyzed': 0,
            'alerts': alerts,
            'statistics': {
                'avg_rpm': random.randint(800, 2500),
                'avg_temperature': random.randint(85, 95),
                'avg_engine_load': random.randint(15, 45),
                'data_quality': 85
            },
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'model_info': {'type': 'mock'},
            'data_source': 'mock'
        }

# Initialize ML predictor
ml_predictor = CloudMLPredictor()

# API Routes
@app.route('/api/status')
def api_status():
    """System status endpoint"""
    return jsonify({
        'status': 'running',
        'ml_model_loaded': ml_predictor.model_loaded,
        'cloud_connected': CLOUD_STORAGE_AVAILABLE and supabase_storage.is_connected,
        'model_info': ml_predictor.model_info,
        'timestamp': datetime.now(timezone.utc).isoformat()
    })

@app.route('/api/predict/<int:vehicle_id>')
def api_predict_health(vehicle_id):
    """Get ML health prediction for specific vehicle"""
    try:
        prediction = ml_predictor.predict_vehicle_health_from_cloud(vehicle_id)
        return jsonify(prediction)
    except Exception as e:
        logger.error(f"Prediction API error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/current-health')
def api_current_health():
    """Get current health for default vehicle"""
    return api_predict_health(1)

@app.route('/api/vehicles')
def api_vehicles():
    """List all vehicles"""
    return jsonify([
        {
            'id': 1,
            'name': 'Demo Vehicle 1',
            'make': 'Toyota',
            'model': 'Camry',
            'year': 2018,
            'last_seen': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': 2,
            'name': 'Demo Vehicle 2', 
            'make': 'Honda',
            'model': 'Civic',
            'year': 2020,
            'last_seen': datetime.now(timezone.utc).isoformat()
        }
    ])

if __name__ == '__main__':
    logger.info("🚀 Starting Cloud-First Vehicle Diagnostic Web Server...")
    
    if not CLOUD_STORAGE_AVAILABLE:
        logger.warning("⚠️ Cloud storage not available - running in mock mode")
    elif not supabase_storage.is_connected:
        logger.warning("⚠️ Cloud storage not connected - running in mock mode")
    else:
        logger.info("✅ Cloud storage connected successfully")
    
    logger.info("🌐 Server starting on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=False)
