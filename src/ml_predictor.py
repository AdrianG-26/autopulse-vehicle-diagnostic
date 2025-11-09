#!/usr/bin/env python3
"""ML Health Predictor - Loads RF model and runs predictions"""
import os, sys, joblib, json, logging, time, numpy as np
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

class MLHealthPredictor:
    def __init__(self, model_dir=None):
        if model_dir is None:
            model_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'models')
        self.model_dir = model_dir
        self.model = None
        self.scaler = None
        self.metadata = None
        self.is_loaded = False
        self.health_labels = {0: 'NORMAL', 1: 'ADVISORY', 2: 'WARNING', 3: 'CRITICAL'}
        self.load_model()
    
    def load_model(self):
        try:
            model_file = os.path.join(self.model_dir, 'vehicle_health_rf_model_4class.pkl')
            scaler_file = os.path.join(self.model_dir, 'scaler_4class.pkl')
            metadata_file = os.path.join(self.model_dir, 'model_metadata_4class.json')
            if not os.path.exists(model_file):
                logger.error(f"Model not found: {model_file}")
                return False
            self.model = joblib.load(model_file)
            self.scaler = joblib.load(scaler_file)
            with open(metadata_file, 'r') as mf:
                self.metadata = json.load(mf)
            self.is_loaded = True
            logger.info(f"✅ ML Model loaded ({self.metadata['accuracy']*100:.2f}% accuracy)")
            return True
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            self.is_loaded = False
            return False
    
    def engineer_features(self, sensor_data):
        features = {}
        raw_features = ['rpm', 'vehicle_speed', 'coolant_temp', 'engine_load', 'throttle_pos',
                       'intake_temp', 'control_module_voltage', 'intake_pressure', 'fuel_level',
                       'barometric_pressure', 'ambient_air_temp', 'engine_runtime', 'distance_w_mil',
                       'fuel_pressure', 'timing_advance', 'maf', 'engine_stress_score']
        for f in raw_features:
            if f == 'vehicle_speed' and 'speed' in sensor_data:
                features[f] = sensor_data.get('speed', 0)
            elif f == 'engine_runtime' and 'run_time' in sensor_data:
                features[f] = sensor_data.get('run_time', 0)
            else:
                features[f] = sensor_data.get(f, 0)
        features['load_rpm_ratio'] = sensor_data.get('load_rpm_ratio') or 0
        features['temp_gradient'] = sensor_data.get('temp_gradient') or 0
        features['fuel_efficiency'] = sensor_data.get('fuel_efficiency') or 0
        engine_load = features.get('engine_load', 0)
        features['rpm_load_ratio'] = features['rpm'] / engine_load if engine_load > 0 else 0
        coolant_temp = features.get('coolant_temp', 0)
        features['temp_efficiency'] = engine_load / coolant_temp if coolant_temp > 0 else 0
        throttle_pos = features.get('throttle_pos', 0)
        features['speed_throttle_ratio'] = features['vehicle_speed'] / throttle_pos if throttle_pos > 0 else 0
        features['high_rpm'] = 1 if features['rpm'] > 3000 else 0
        features['low_speed'] = 1 if features['vehicle_speed'] < 20 else 0
        features['high_throttle'] = 1 if throttle_pos > 70 else 0
        voltage = features.get('control_module_voltage', 14)
        features['voltage_health'] = 1 if (12.5 <= voltage <= 14.5) else 0
        features['stress_indicator'] = 1 if (features['high_rpm'] == 1 and engine_load > 60) else 0
        return features
    
    def predict(self, sensor_data):
        if not self.is_loaded:
            return None
        start_time = time.time()
        try:
            features = self.engineer_features(sensor_data)
            feature_names = self.metadata['features']
            X = np.array([float(features.get(f, 0) or 0) for f in feature_names]).reshape(1, -1)
            X_scaled = self.scaler.transform(X)
            prediction = self.model.predict(X_scaled)[0]
            probabilities = self.model.predict_proba(X_scaled)[0]
            latency_ms = (time.time() - start_time) * 1000
            predicted_status = self.health_labels.get(int(prediction), 'UNKNOWN')
            confidence = float(probabilities[prediction] * 100)
            prob_dict = {
                'normal': float(probabilities[0]) if len(probabilities) > 0 else 0.0,
                'advisory': float(probabilities[1]) if len(probabilities) > 1 else 0.0,
                'warning': float(probabilities[2]) if len(probabilities) > 2 else 0.0,
                'critical': float(probabilities[3]) if len(probabilities) > 3 else 0.0
            }
            stress_score = sensor_data.get('engine_stress_score', 0)
            failure_risk = 'Critical' if predicted_status == 'CRITICAL' else ('High' if stress_score >= 6 else ('Medium' if stress_score >= 3 else 'Low'))
            days_until = 0 if predicted_status == 'CRITICAL' else (7 if stress_score >= 6 else (14 if predicted_status == 'ADVISORY' else 30))
            recommendations = []
            coolant = sensor_data.get('coolant_temp', 0)
            if coolant > 100: recommendations.append("Check coolant level")
            voltage = sensor_data.get('control_module_voltage', 14)
            if voltage < 12.5: recommendations.append("Check battery")
            dtc = sensor_data.get('dtc_count', 0)
            if dtc > 0: recommendations.append(f"Scan {dtc} error code(s)")
            if not recommendations:
                recommendations = ["Continue normal operation"] if predicted_status == 'NORMAL' else ["Schedule maintenance"]
            result = {
                'predicted_health_status': int(prediction),
                'predicted_status': predicted_status,
                'confidence_score': round(confidence, 2),
                'probabilities': {k: round(v, 4) for k, v in prob_dict.items()},
                'failure_risk': failure_risk,
                'days_until_maintenance': days_until,
                'recommended_actions': recommendations[:3],
                'top_risk_factors': [],
                'model_version': '4class_v1',
                'model_accuracy': round(self.metadata['accuracy'], 4),
                'prediction_latency_ms': round(latency_ms, 2),
                'timestamp': datetime.now(timezone.utc).isoformat()
            }
            return result
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return None

_ml_predictor = None
def get_ml_predictor():
    global _ml_predictor
    if _ml_predictor is None:
        _ml_predictor = MLHealthPredictor()
    return _ml_predictor
