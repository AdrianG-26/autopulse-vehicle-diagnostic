#!/usr/bin/env python3
"""
🚗 Vehicle Diagnostic System - ML-Enhanced Web Server
===================================================
Web server with integrated machine learning predictions for vehicle maintenance.
Provides real-time health scoring and maintenance alerts.

Features:
- ML model integration for predictive maintenance
- Real-time vehicle health scoring (0-100)
- Maintenance alert generation
- Export management and statistics
"""

from flask import Flask, render_template, send_from_directory, jsonify, request
from flask_socketio import SocketIO, emit
from pathlib import Path
import json
import os
import sqlite3
import pandas as pd
import numpy as np
from datetime import datetime
import joblib
import logging
import threading
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure paths BEFORE creating the Flask app
BASE_DIR = Path(__file__).parent
EXPORTS_DIR = BASE_DIR / "src" / "exports"
STATIC_DIR = BASE_DIR / "web" / "static"
TEMPLATES_DIR = BASE_DIR / "web" / "templates"
MODELS_DIR = BASE_DIR / "src" / "models"
DB_PATH = BASE_DIR / "data" / "vehicle_data.db"

# Create Flask app with explicit template and static folders
app = Flask(__name__, 
            template_folder=str(TEMPLATES_DIR),
            static_folder=str(STATIC_DIR))
app.config['SECRET_KEY'] = 'vehicle_diagnostic_system_2025'

# Initialize SocketIO with CORS enabled
socketio = SocketIO(app, cors_allowed_origins="*", port=8080)

# Enable CORS for React development
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Handle OPTIONS requests for CORS preflight
@app.route('/api/<path:path>', methods=['OPTIONS'])
def handle_options(path):
    response = jsonify({'status': 'ok'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response, 200

# Ensure directories exist
EXPORTS_DIR.mkdir(parents=True, exist_ok=True)
STATIC_DIR.mkdir(parents=True, exist_ok=True)
TEMPLATES_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)

# 🤖 ML Model Management
class MLPredictor:
    """Simple ML model wrapper for vehicle maintenance predictions"""
    
    def __init__(self):
        self.model = None
        self.model_loaded = False
        self.model_info = {}
        self.load_model()
    
    def load_model(self):
        """Load the trained Random Forest model (RPI-compatible version)"""
        try:
            # Look for RPI-compatible model first, then fall back to others
            rpi_models = list(MODELS_DIR.glob("vehicle_maintenance_rf_rpi_compatible_*.joblib"))
            other_models = list(MODELS_DIR.glob("vehicle_maintenance_rf_*.joblib"))
            
            model_files = rpi_models + other_models
            
            if model_files:
                # Use the most recent model
                model_path = sorted(model_files, key=lambda x: x.stat().st_mtime)[-1]
                
                logger.info(f"Loading ML model: {model_path.name}")
                
                # Load the actual Random Forest model
                model_package = joblib.load(model_path)
                self.model = model_package['model']
                self.feature_names = model_package['feature_names']
                self.target_mapping = model_package['target_mapping']
                
                # Store model metadata
                training_info = model_package.get('training_info', {})
                self.model_info = {
                    'filename': model_path.name,
                    'type': 'Random Forest Classifier',
                    'version': model_package.get('model_version', 'Unknown'),
                    'loaded_at': datetime.now().isoformat(),
                    'size_mb': round(model_path.stat().st_size / (1024*1024), 2),
                    'accuracy': training_info.get('test_accuracy', 'Unknown'),
                    'training_samples': training_info.get('training_samples', 'Unknown'),
                    'rpi_compatible': 'rpi_compatible' in model_path.name
                }
                
                self.model_loaded = True
                logger.info(f"✅ Random Forest model loaded successfully (Accuracy: {training_info.get('test_accuracy', 0):.1%})")
                return True
            else:
                # Fallback to rule-based system
                logger.warning("No trained Random Forest model found, using rule-based system")
                self.model_info = {
                    'type': 'Rule-based MVP',
                    'loaded_at': datetime.now().isoformat(),
                    'note': 'No trained model found - using intelligent rules'
                }
                self.model = "rule_based_mvp"
                self.model_loaded = True
                return True
                
        except Exception as e:
            logger.error(f"Failed to load Random Forest model: {e}")
            logger.info("Falling back to rule-based prediction system")
            
            # Fallback to rule-based system
            self.model_info = {
                'type': 'Rule-based Fallback',
                'loaded_at': datetime.now().isoformat(),
                'note': f'Model loading failed: {str(e)}'
            }
            self.model = "rule_based_mvp"
            self.model_loaded = True
            return True
    
    def predict_vehicle_health(self, sensor_data):
        """
        Predict vehicle health from sensor data using Random Forest or rule-based fallback
        Returns: dict with health_score (0-100) and maintenance_alerts
        """
        if not self.model_loaded:
            return {
                'success': False,
                'error': 'ML model not loaded',
                'health_score': 0,
                'status': 'UNKNOWN',
                'alerts': ['System Error: ML model unavailable']
            }
        
        try:
            # Check if we have the actual Random Forest model
            if hasattr(self.model, 'predict') and hasattr(self, 'feature_names'):
                # Use Random Forest prediction
                return self._predict_with_random_forest(sensor_data)
            else:
                # Use rule-based prediction as fallback
                return self._predict_with_rules(sensor_data)
                
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return {
                'success': False,
                'error': str(e),
                'health_score': 0,
                'status': 'ERROR',
                'alerts': [f'Prediction error: {str(e)}']
            }
    
    def _predict_with_random_forest(self, sensor_data):
        """Use trained Random Forest model for prediction"""
        try:
            # Prepare feature vector matching training data
            feature_vector = {}
            
            # Map sensor data to model features
            feature_mapping = {
                'rpm': sensor_data.get('rpm', 0),
                'coolant_temp': sensor_data.get('coolant_temp', 90),
                'engine_load': sensor_data.get('engine_load', 20),
                'throttle_pos': sensor_data.get('throttle_pos', 10),
                'vehicle_speed': sensor_data.get('vehicle_speed', 0),
                'intake_temp': sensor_data.get('intake_temp', 25),
                'fuel_trim_short': sensor_data.get('fuel_trim_short', 0),
                'fuel_trim_long': sensor_data.get('fuel_trim_long', 0),
                'timing_advance': sensor_data.get('timing_advance', 0),
                'load_rpm_ratio': sensor_data.get('load_rpm_ratio', 0),
                'fuel_efficiency': sensor_data.get('fuel_efficiency', 50),
                'throttle_response': sensor_data.get('throttle_response', 0),
                'engine_stress_score': sensor_data.get('engine_stress_score', 0),
                'data_quality_score': sensor_data.get('data_quality_score', 90)
            }
            
            # Calculate derived features if not provided
            rpm = feature_mapping['rpm']
            coolant_temp = feature_mapping['coolant_temp']
            engine_load = feature_mapping['engine_load']
            vehicle_speed = feature_mapping['vehicle_speed']
            
            if feature_mapping['load_rpm_ratio'] == 0 and rpm > 0:
                feature_mapping['load_rpm_ratio'] = engine_load / (rpm / 1000)
                
            feature_mapping['temp_rpm_ratio'] = coolant_temp / (rpm / 1000 + 1)
            feature_mapping['load_speed_ratio'] = engine_load / (vehicle_speed + 1)
            
            # Create feature array in correct order
            X = np.array([feature_mapping.get(feature, 0) for feature in self.feature_names]).reshape(1, -1)
            
            # Make prediction
            prediction = self.model.predict(X)[0]
            prediction_proba = self.model.predict_proba(X)[0]
            
            # Convert back to status name
            status_names = {v: k for k, v in self.target_mapping.items()}
            predicted_status = status_names[prediction]
            confidence = prediction_proba.max()
            
            # Convert status to health score
            health_score = self._status_to_health_score(predicted_status)
            
            # Generate alerts based on ML prediction and sensor data
            alerts = self._generate_ml_alerts(predicted_status, confidence, sensor_data)
            
            return {
                'success': True,
                'health_score': health_score,
                'status': predicted_status,
                'alerts': alerts,
                'ml_confidence': confidence,
                'prediction_method': 'Random Forest',
                'model_info': self.model_info
            }
            
        except Exception as e:
            logger.error(f"Random Forest prediction failed: {e}")
            # Fall back to rule-based prediction
            return self._predict_with_rules(sensor_data)
    
    def _predict_with_rules(self, sensor_data):
        """Rule-based prediction fallback"""
        health_score = self._calculate_simple_health_score(sensor_data)
        status = self._determine_status(health_score)
        alerts = self._generate_alerts(sensor_data, health_score)
        
        return {
            'success': True,
            'health_score': health_score,
            'status': status,
            'alerts': alerts,
            'prediction_method': 'Rule-based',
            'model_info': self.model_info
        }
    
    def _status_to_health_score(self, status):
        """Convert ML status to health score (0-100)"""
        status_scores = {
            'NORMAL': 95,
            'ADVISORY': 75,
            'WARNING': 45,
            'CRITICAL': 15
        }
        return status_scores.get(status, 50)
    
    def _generate_ml_alerts(self, predicted_status, confidence, sensor_data):
        """Generate alerts based on ML prediction"""
        alerts = []
        
        # Confidence-based alerts
        if confidence < 0.7:
            alerts.append(f'⚠️ Low prediction confidence ({confidence:.1%}) - Monitor closely')
        
        # Status-based alerts
        if predicted_status == 'CRITICAL':
            alerts.append('🚨 CRITICAL: ML model predicts imminent maintenance required')
        elif predicted_status == 'WARNING':
            alerts.append('⚠️ WARNING: ML model suggests scheduling maintenance soon')
        elif predicted_status == 'ADVISORY':
            alerts.append('💡 ADVISORY: ML model recommends monitoring vehicle condition')
        
        # Add sensor-specific alerts
        rpm = sensor_data.get('rpm', 0)
        coolant_temp = sensor_data.get('coolant_temp', 90)
        engine_load = sensor_data.get('engine_load', 20)
        
        if coolant_temp > 105:
            alerts.append('🌡️ High engine temperature detected')
        if rpm > 6000:
            alerts.append('🔴 High RPM detected - Reduce engine stress')
        if engine_load > 85:
            alerts.append('⚙️ High engine load - Monitor performance')
        
        if not alerts:
            alerts.append('✅ All systems operating normally - ML model confident')
            
        return alerts
    
    def _calculate_simple_health_score(self, data):
        """
        Calculate intelligent health score for MVP (0-100)
        Based on automotive engineering best practices
        """
        score = 100
        issues_detected = []
        
        # Engine temperature analysis (critical for engine health)
        coolant_temp = data.get('coolant_temp', 90)
        if coolant_temp > 115:
            score -= 40  # Critical overheating
            issues_detected.append('critical_overheating')
        elif coolant_temp > 105:
            score -= 25  # Severe overheating risk
            issues_detected.append('severe_heat')
        elif coolant_temp > 100:
            score -= 10  # Elevated temperature
            issues_detected.append('elevated_temp')
        elif coolant_temp < 70:
            score -= 5   # Engine not warmed up properly
            
        # RPM analysis (engine stress indicator)
        rpm = data.get('rpm', 800)
        if rpm > 7000:
            score -= 35  # Extreme RPM - potential damage
            issues_detected.append('extreme_rpm')
        elif rpm > 6000:
            score -= 20  # Very high RPM stress
            issues_detected.append('high_rpm_stress')
        elif rpm > 4500:
            score -= 8   # Elevated RPM
        elif rpm < 500 and rpm > 0:
            score -= 15  # Engine struggling/rough idle
            issues_detected.append('rough_idle')
            
        # Engine load analysis (efficiency indicator)
        engine_load = data.get('engine_load', 20)
        if engine_load > 95:
            score -= 25  # Maximum load stress
            issues_detected.append('max_load_stress')
        elif engine_load > 85:
            score -= 12  # High load operation
            
        # Throttle position correlation
        throttle_pos = data.get('throttle_pos', 10)
        if throttle_pos > 90 and engine_load < 30:
            score -= 20  # Throttle/load mismatch - potential issue
            issues_detected.append('throttle_load_mismatch')
            
        # Vehicle speed vs RPM analysis
        vehicle_speed = data.get('vehicle_speed', 0)
        if vehicle_speed > 0 and rpm > 0:
            speed_rpm_ratio = vehicle_speed / (rpm / 1000)
            if speed_rpm_ratio < 5:  # Very low ratio - possible transmission issue
                score -= 15
                issues_detected.append('potential_transmission_issue')
                
        # Fuel system analysis
        fuel_level = data.get('fuel_level', 50)
        if fuel_level < 5:
            score -= 20  # Critical low fuel
            issues_detected.append('critical_low_fuel')
        elif fuel_level < 15:
            score -= 10  # Low fuel warning
            issues_detected.append('low_fuel')
            
        # Advanced sensor analysis (if available)
        maf = data.get('maf', 0)  # Mass Air Flow
        if maf > 0:
            # Normal MAF range check (depends on engine size, approximate)
            if maf < 2 or maf > 300:
                score -= 12  # MAF sensor issue
                issues_detected.append('maf_sensor_issue')
                
        # Timing advance analysis
        timing_advance = data.get('timing_advance', 10)
        if timing_advance < -10:
            score -= 18  # Severe timing retard - knock detected
            issues_detected.append('knock_detected')
        elif timing_advance < 0:
            score -= 8   # Timing retard
            
        # Data quality factor
        data_quality = data.get('data_quality_score', 1.0)
        if data_quality < 0.7:
            score -= 5   # Reduce confidence for poor data quality
            
        # Store detected issues for alert generation
        self.last_issues = issues_detected
        
        return max(0, min(100, score))
    
    def _determine_status(self, health_score):
        """Determine status based on health score"""
        if health_score >= 80:
            return 'NORMAL'
        elif health_score >= 60:
            return 'ADVISORY'
        elif health_score >= 40:
            return 'WARNING'
        else:
            return 'CRITICAL'
    
    def _generate_alerts(self, data, health_score):
        """Generate specific maintenance alerts based on sensor data and detected issues"""
        alerts = []
        priority_alerts = []
        
        # Get detected issues from health score calculation
        issues = getattr(self, 'last_issues', [])
        
        # Critical alerts (immediate attention required)
        coolant_temp = data.get('coolant_temp', 90)
        rpm = data.get('rpm', 800)
        fuel_level = data.get('fuel_level', 50)
        
        if 'critical_overheating' in issues:
            priority_alerts.append('🔥 CRITICAL: Engine overheating! Stop driving immediately')
        elif 'severe_heat' in issues:
            priority_alerts.append('🌡️ WARNING: Severe overheating risk - Reduce speed, check coolant')
        elif 'elevated_temp' in issues:
            alerts.append('⚠️ High engine temperature - Monitor closely')
            
        if 'extreme_rpm' in issues:
            priority_alerts.append('🔴 CRITICAL: Extreme RPM detected - Engine damage risk')
        elif 'high_rpm_stress' in issues:
            alerts.append('🔶 WARNING: High RPM stress - Reduce engine load')
            
        if 'rough_idle' in issues:
            alerts.append('🔧 Engine rough idle detected - Check spark plugs/fuel system')
            
        if 'knock_detected' in issues:
            priority_alerts.append('💥 WARNING: Engine knock detected - Use higher octane fuel')
            
        if 'throttle_load_mismatch' in issues:
            alerts.append('🔍 Throttle/load mismatch - Check throttle body/sensors')
            
        if 'potential_transmission_issue' in issues:
            alerts.append('⚙️ Possible transmission issue - Schedule diagnostic')
            
        if 'maf_sensor_issue' in issues:
            alerts.append('📊 MAF sensor reading abnormal - Check air filter/sensor')
            
        # Fuel system alerts
        if 'critical_low_fuel' in issues:
            priority_alerts.append('⛽ CRITICAL: Very low fuel - Find gas station immediately')
        elif 'low_fuel' in issues:
            alerts.append('⛽ Low fuel level - Refuel soon')
            
        # Maintenance scheduling based on health score
        if health_score < 30:
            priority_alerts.append('🚨 CRITICAL: Multiple issues detected - Stop driving, seek service')
        elif health_score < 50:
            alerts.append('🔧 WARNING: Schedule immediate maintenance inspection')
        elif health_score < 70:
            alerts.append('📋 ADVISORY: Schedule maintenance within 1 week')
        elif health_score < 85:
            alerts.append('✅ GOOD: Monitor condition, routine maintenance due soon')
            
        # Predictive maintenance suggestions
        if coolant_temp > 95 and coolant_temp <= 100:
            alerts.append('🔄 Consider coolant system service - Temperature trending high')
            
        if rpm > 3000 and data.get('engine_load', 0) < 50:
            alerts.append('🔄 Check transmission - High RPM at low load')
            
        # Combine alerts with priority first
        all_alerts = priority_alerts + alerts
        
        if not all_alerts:
            all_alerts.append('✅ All systems operating normally')
            
        return all_alerts

# Initialize ML predictor
ml_predictor = MLPredictor()

@app.route('/')
def index():
    """Main page"""
    return render_template('index.html')

@app.route('/api/exports')
def list_exports():
    """List all available export files"""
    try:
        exports = []
        
        for file_path in sorted(EXPORTS_DIR.glob("*"), key=lambda x: x.stat().st_mtime, reverse=True):
            if file_path.is_file():
                stat = file_path.stat()
                exports.append({
                    'filename': file_path.name,
                    'size': stat.st_size,
                    'size_mb': round(stat.st_size / (1024 * 1024), 2),
                    'modified': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    'modified_readable': datetime.fromtimestamp(stat.st_mtime).strftime('%Y-%m-%d %H:%M:%S'),
                    'type': file_path.suffix.lower()
                })
        
        return jsonify({
            'success': True,
            'exports': exports,
            'count': len(exports)
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/exports/<filename>')
def download_export(filename):
    """Download a specific export file"""
    try:
        return send_from_directory(EXPORTS_DIR, filename, as_attachment=True)
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 404

@app.route('/api/stats')
def get_stats():
    """Get overall statistics"""
    try:
        files = list(EXPORTS_DIR.glob("*"))
        total_size = sum(f.stat().st_size for f in files if f.is_file())
        
        by_type = {}
        for file in files:
            if file.is_file():
                ext = file.suffix.lower()
                if ext not in by_type:
                    by_type[ext] = {'count': 0, 'size': 0}
                by_type[ext]['count'] += 1
                by_type[ext]['size'] += file.stat().st_size
        
        return jsonify({
            'success': True,
            'total_files': len(files),
            'total_size': total_size,
            'total_size_mb': round(total_size / (1024 * 1024), 2),
            'by_type': by_type
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# 🤖 ML PREDICTION ENDPOINTS (MVP Features)
@app.route('/api/predict', methods=['POST'])
def predict_maintenance():
    """
    🎯 Core ML endpoint - Predict vehicle maintenance needs
    Input: JSON with sensor data
    Output: Health score (0-100) + maintenance alerts
    """
    try:
        # Get sensor data from request
        sensor_data = request.get_json()
        if not sensor_data:
            return jsonify({
                'success': False,
                'error': 'No sensor data provided'
            }), 400
        
        # Run ML prediction
        prediction = ml_predictor.predict_vehicle_health(sensor_data)
        
        return jsonify(prediction)
    
    except Exception as e:
        logger.error(f"Prediction API error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/current-health')
def get_current_health():
    """
    📊 Get latest vehicle health status from database
    Returns current health score and status
    """
    try:
        # Connect to database and get latest sensor reading
        conn = sqlite3.connect(DB_PATH)
        
        query = """
        SELECT rpm, coolant_temp, engine_load, throttle_pos, vehicle_speed,
               fuel_level, maf, timing_advance, timestamp, status
        FROM enhanced_sensor_data 
        ORDER BY timestamp DESC 
        LIMIT 1
        """
        
        result = pd.read_sql_query(query, conn)
        conn.close()
        
        if result.empty:
            return jsonify({
                'success': False,
                'error': 'No vehicle data available',
                'health_score': 0,
                'status': 'NO_DATA'
            })
        
        # Get latest data and run prediction
        latest_data = result.iloc[0].to_dict()
        prediction = ml_predictor.predict_vehicle_health(latest_data)
        
        # Add timestamp info
        prediction['last_updated'] = latest_data['timestamp']
        
        return jsonify(prediction)
    
    except Exception as e:
        logger.error(f"Current health API error: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'health_score': 0,
            'status': 'ERROR'
        }), 500

@app.route('/api/alerts')
def get_maintenance_alerts():
    """
    🚨 Get current maintenance alerts and recommendations
    """
    try:
        # Get current health status
        health_response = get_current_health()
        health_data = health_response.get_json()
        
        if not health_data.get('success'):
            return jsonify({
                'success': False,
                'alerts': ['Unable to assess vehicle condition'],
                'count': 1
            })
        
        return jsonify({
            'success': True,
            'alerts': health_data.get('alerts', []),
            'count': len(health_data.get('alerts', [])),
            'health_score': health_data.get('health_score', 0),
            'status': health_data.get('status', 'UNKNOWN')
        })
    
    except Exception as e:
        logger.error(f"Alerts API error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/sensor-data')
def get_sensor_data():
    """
    📡 Get latest sensor readings with ML predictions
    """
    try:
        # Get recent sensor data (last 10 readings)
        conn = sqlite3.connect(DB_PATH)
        
        query = """
        SELECT rpm, coolant_temp, engine_load, throttle_pos, vehicle_speed,
               fuel_level, maf, timing_advance, timestamp, status,
               data_quality_score
        FROM enhanced_sensor_data 
        ORDER BY timestamp DESC 
        LIMIT 10
        """
        
        df = pd.read_sql_query(query, conn)
        conn.close()
        
        if df.empty:
            return jsonify({
                'success': False,
                'error': 'No sensor data available',
                'data': []
            })
        
        # Convert to list of dictionaries and add predictions
        sensor_readings = []
        for _, row in df.iterrows():
            reading = row.to_dict()
            
            # Add ML prediction for each reading
            prediction = ml_predictor.predict_vehicle_health(reading)
            reading['ml_health_score'] = prediction.get('health_score', 0)
            reading['ml_status'] = prediction.get('status', 'UNKNOWN')
            
            sensor_readings.append(reading)
        
        return jsonify({
            'success': True,
            'data': sensor_readings,
            'count': len(sensor_readings),
            'latest': sensor_readings[0] if sensor_readings else None
        })
    
    except Exception as e:
        logger.error(f"Sensor data API error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/latest')
def get_latest_reading():
    """
    📡 Get the most recent sensor reading with ML prediction (for polling)
    """
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        
        query = """
        SELECT * FROM enhanced_sensor_data 
        ORDER BY timestamp DESC 
        LIMIT 1
        """
        
        cursor = conn.cursor()
        cursor.execute(query)
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return jsonify({
                'success': False,
                'message': 'No data available yet. Connect your OBD scanner.',
                'data': None
            })
        
        # Convert row to dictionary
        data = dict(row)
        
        # Add ML prediction
        try:
            prediction = ml_predictor.predict_vehicle_health(data)
            data['ml_health_score'] = prediction.get('health_score', 0)
            data['ml_status'] = prediction.get('status', 'UNKNOWN')
            data['ml_alerts'] = prediction.get('alerts', [])
        except:
            data['ml_health_score'] = 0
            data['ml_status'] = 'UNKNOWN'
            data['ml_alerts'] = []
        
        return jsonify({
            'success': True,
            'data': data,
            'timestamp': data.get('timestamp', datetime.now().isoformat())
        })
    
    except Exception as e:
        logger.error(f"Latest reading API error: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'data': None
        }), 500

@app.route('/api/model-info')
def get_model_info():
    """
    🤖 Get information about the loaded ML model
    """
    return jsonify({
        'success': ml_predictor.model_loaded,
        'model_info': ml_predictor.model_info if ml_predictor.model_loaded else {},
        'endpoints': {
            'predict': '/api/predict (POST)',
            'current_health': '/api/current-health (GET)',
            'alerts': '/api/alerts (GET)', 
            'sensor_data': '/api/sensor-data (GET)'
        }
    })

# WebSocket Events
@socketio.on('connect')
def handle_connect():
    logger.info('WebSocket client connected')
    emit('status', {'message': 'Connected to vehicle diagnostic system'})

@socketio.on('disconnect')
def handle_disconnect():
    logger.info('WebSocket client disconnected')

# Real-time data streaming thread
def stream_vehicle_data():
    """Stream real-time vehicle data to WebSocket clients"""
    while True:
        try:
            # Get latest sensor data from database
            conn = sqlite3.connect(DB_PATH)
            query = """
            SELECT rpm, coolant_temp, engine_load, throttle_pos, vehicle_speed,
                   fuel_level, maf, timing_advance, timestamp, status
            FROM enhanced_sensor_data 
            ORDER BY timestamp DESC 
            LIMIT 1
            """
            
            result = pd.read_sql_query(query, conn)
            conn.close()
            
            if not result.empty:
                row = result.iloc[0]
                
                # Format data for WebSocket (match expected format)
                websocket_data = {
                    'timestamp': int(time.time() * 1000),  # JavaScript timestamp
                    'rpm': float(row['rpm']) if pd.notna(row['rpm']) else 0,
                    'speed': float(row['vehicle_speed']) if pd.notna(row['vehicle_speed']) else 0,
                    'coolantTemp': float(row['coolant_temp']) if pd.notna(row['coolant_temp']) else 90,
                    'battery': 12.3,  # Default battery voltage (can be enhanced)
                    'engineLoad': float(row['engine_load']) if pd.notna(row['engine_load']) else 0,
                    'throttlePosition': float(row['throttle_pos']) if pd.notna(row['throttle_pos']) else 0,
                    'fuelLevelPct': float(row['fuel_level']) if pd.notna(row['fuel_level']) else 50,
                    'ignitionAdvance': float(row['timing_advance']) if pd.notna(row['timing_advance']) else 0,
                    'systemStatus': str(row['status']) if pd.notna(row['status']) else 'NORMAL'
                }
                
                # Emit to all connected WebSocket clients
                socketio.emit('vehicle_data', websocket_data)
                
        except Exception as e:
            logger.error(f"WebSocket streaming error: {e}")
        
        # Stream every 1 second
        time.sleep(1)

if __name__ == '__main__':
    print("🚗 Vehicle Diagnostic System - ML-Enhanced Web Server")
    print("=" * 60)
    print(f"🤖 ML Model Status: {'✅ Loaded' if ml_predictor.model_loaded else '❌ Failed'}")
    if ml_predictor.model_loaded:
        print(f"📊 Model: {ml_predictor.model_info.get('filename', 'Unknown')}")
    print(f"📁 Database: {DB_PATH}")
    print(f"🌍 Web Interface: http://localhost:5000")
    print(f"\n📦 Available API Endpoints:")
    print(f"   🤖 ML PREDICTIONS:")
    print(f"   - POST /api/predict         - ML maintenance prediction")
    print(f"   - GET  /api/current-health  - Current vehicle health score")
    print(f"   - GET  /api/alerts          - Maintenance alerts")
    print(f"   - GET  /api/sensor-data     - Sensor readings + ML analysis")
    print(f"   - GET  /api/model-info      - ML model information")
    print(f"   📊 DATA MANAGEMENT:")
    print(f"   - GET  /api/exports         - List all exports")
    print(f"   - GET  /api/exports/<file>  - Download export file")
    print(f"   - GET  /api/stats           - System statistics")
    print(f"   🔌 WEBSOCKET:")
    print(f"   - ws://localhost:8080       - Real-time vehicle data stream")
    print(f"\n✨ Ready for predictive maintenance predictions!")
    print(f"Press Ctrl+C to stop the server\n")
    
    # Start WebSocket streaming thread
    streaming_thread = threading.Thread(target=stream_vehicle_data, daemon=True)
    streaming_thread.start()
    
    # Run Flask-SocketIO server (handles both HTTP and WebSocket)
    socketio.run(app, host='0.0.0.0', port=5000, debug=False, allow_unsafe_werkzeug=True)
