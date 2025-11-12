#!/usr/bin/env python3
"""
Test ML prediction for idle conditions
"""
import sys
import numpy as np
import joblib
import json
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

def engineer_features(data):
    """Engineer the same features used in training"""
    features = {}
    
    # Engine stress score
    rpm = data.get('rpm', 0)
    load = data.get('engine_load', 0)
    temp = data.get('coolant_temp', 85)
    
    features['engine_stress_score'] = (
        (rpm / 6000) * 0.3 +
        (load / 100) * 0.4 +
        (max(0, temp - 90) / 20) * 0.3
    ) * 100
    
    # Load/RPM ratio
    features['load_rpm_ratio'] = load / (rpm + 1)
    
    # Temperature gradient
    intake_temp = data.get('intake_temp', 25)
    features['temp_gradient'] = temp - intake_temp
    
    # Fuel efficiency proxy
    speed = data.get('vehicle_speed', 0)
    features['fuel_efficiency'] = speed / (load + 1)
    
    # RPM/Load ratio
    features['rpm_load_ratio'] = rpm / (load + 1)
    
    # Temperature efficiency
    features['temp_efficiency'] = temp / (load + 1)
    
    # Speed/Throttle ratio
    throttle = data.get('throttle_pos', 0)
    features['speed_throttle_ratio'] = speed / (throttle + 1)
    
    # Binary flags
    features['high_rpm'] = 1 if rpm > 4000 else 0
    features['low_speed'] = 1 if speed < 30 else 0
    features['high_throttle'] = 1 if throttle > 75 else 0
    
    # Voltage health
    voltage = data.get('control_module_voltage', 14)
    features['voltage_health'] = 1 if 13 <= voltage <= 15 else 0
    
    # Stress indicator
    features['stress_indicator'] = 1 if (rpm > 3500 and load > 70) else 0
    
    return features

def test_idle_prediction():
    """Test prediction for idle conditions"""
    
    # Load the model
    model_path = Path(__file__).parent.parent / 'models' / 'vehicle_health_rf_model_4class.pkl'
    scaler_path = Path(__file__).parent.parent / 'models' / 'scaler_4class.pkl'
    metadata_path = Path(__file__).parent.parent / 'models' / 'model_metadata_4class.json'
    
    print("="*80)
    print("TESTING ML PREDICTION FOR IDLE CONDITIONS")
    print("="*80)
    
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    
    with open(metadata_path, 'r') as f:
        metadata = json.load(f)
    
    print(f"\n✅ Loaded model: {metadata['accuracy']*100:.2f}% accuracy")
    print(f"✅ Classes: {metadata['classes']}")
    print(f"✅ Features: {len(metadata['features'])} total")
    
    # Your actual idle data from the screenshot
    idle_data = {
        'rpm': 1028,
        'vehicle_speed': 0.0,
        'coolant_temp': 96.0,
        'engine_load': 50.6,
        'throttle_pos': 18.8,
        'intake_temp': 58.0,
        'control_module_voltage': 14.10,
        'fuel_level': 50.0,  # Assumed
        'barometric_pressure': 99.0,  # From screenshot
        'engine_runtime': 2085,
        'fuel_pressure': 300,  # Assumed typical
        'timing_advance': -2.5,  # From screenshot
        'maf': 2.5,  # Assumed for idle
    }
    
    print("\n" + "="*80)
    print("INPUT DATA (Your Idle Car)")
    print("="*80)
    for key, value in idle_data.items():
        print(f"  {key:30s}: {value}")
    
    # Engineer features
    engineered = engineer_features(idle_data)
    
    print("\n" + "="*80)
    print("ENGINEERED FEATURES")
    print("="*80)
    for key, value in engineered.items():
        print(f"  {key:30s}: {value:.4f}")
    
    # Combine raw + engineered features in correct order
    feature_values = []
    for feature_name in metadata['features']:
        if feature_name in idle_data:
            feature_values.append(idle_data[feature_name])
        elif feature_name in engineered:
            feature_values.append(engineered[feature_name])
        else:
            print(f"⚠️  Missing feature: {feature_name}")
            feature_values.append(0)
    
    # Scale and predict
    X = np.array([feature_values])
    X_scaled = scaler.transform(X)
    
    prediction = model.predict(X_scaled)[0]
    probabilities = model.predict_proba(X_scaled)[0]
    
    print("\n" + "="*80)
    print("PREDICTION RESULTS")
    print("="*80)
    print(f"\n🎯 Predicted Class: {prediction} ({metadata['classes'][str(prediction)]})")
    print(f"\n📊 Probabilities:")
    for i, class_name in enumerate([metadata['classes'][str(j)] for j in range(len(metadata['classes']))]):
        prob = probabilities[i] * 100
        bar = '█' * int(prob / 2)
        print(f"  {class_name:12s}: {prob:5.1f}% {bar}")
    
    print("\n" + "="*80)
    print("DIAGNOSIS")
    print("="*80)
    
    if prediction == 0:  # NORMAL
        print("✅ Model correctly predicts NORMAL for idle conditions")
    else:
        print(f"❌ Model INCORRECTLY predicts {metadata['classes'][str(prediction)]}")
        print("\nPOSSIBLE CAUSES:")
        print("1. Training data didn't have enough idle samples")
        print("2. Engine load 50.6% at idle might be unusual (AC running?)")
        print("3. Coolant temp 96°C close to threshold")
        print("4. Model may be over-sensitive to idle conditions")
        print("\nFIXES:")
        print("1. Collect more idle data and retrain")
        print("2. Adjust _auto_label_health() thresholds for idle")
        print("3. Add 'IDLE' as separate condition detection")
    
    # Find most influential features
    print("\n" + "="*80)
    print("TOP FEATURE VALUES (might explain prediction)")
    print("="*80)
    feature_importances = model.feature_importances_
    top_indices = np.argsort(feature_importances)[-10:][::-1]
    
    for idx in top_indices:
        feature_name = metadata['features'][idx]
        importance = feature_importances[idx]
        value = feature_values[idx]
        print(f"  {feature_name:30s}: {value:8.2f} (importance: {importance:.4f})")

if __name__ == '__main__':
    test_idle_prediction()
