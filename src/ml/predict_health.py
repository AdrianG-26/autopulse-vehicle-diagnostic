#!/usr/bin/env python3
"""
Make Health Predictions - 4-CLASS CLASSIFICATION
NORMAL / ADVISORY / WARNING / CRITICAL
"""
import sys, os, json
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from supabase import create_client
import pandas as pd, numpy as np, joblib
from datetime import datetime

SUPABASE_URL = "https://qimiewqthuhmofjhzrrb.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpbWlld3F0aHVobW9mamh6cnJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Mjc5MTMsImV4cCI6MjA3MTEwMzkxM30.jHY0m_l-uvwaZd-x9POEpLdoP__oLUdE-7U-E5mZqz0"
MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', 'models')

def engineer_features_single(data):
    """Engineer features for a single data point"""
    df = pd.DataFrame([data])
    df['rpm_load_ratio'] = np.where(df['engine_load'] > 0, df['rpm'] / df['engine_load'], 0)
    df['temp_efficiency'] = np.where(df['coolant_temp'] > 0, df['engine_load'] / df['coolant_temp'], 0)
    df['speed_throttle_ratio'] = np.where(df['throttle_pos'] > 0, df['vehicle_speed'] / df['throttle_pos'], 0)
    df['high_rpm'] = (df['rpm'] > 3000).astype(int)
    df['low_speed'] = (df['vehicle_speed'] < 20).astype(int)
    df['high_throttle'] = (df['throttle_pos'] > 70).astype(int)
    df['voltage_health'] = ((df['control_module_voltage'] >= 12.5) & (df['control_module_voltage'] <= 14.5)).astype(int)
    df['stress_indicator'] = (df['high_rpm'] * 0.3) + (df['high_throttle'] * 0.3) + ((df['coolant_temp'] > 95).astype(int) * 0.4)
    return df.replace([np.inf, -np.inf], 0).iloc[0].to_dict()

def predict_latest():
    print("\n" + "="*80)
    print("🔮 VEHICLE HEALTH PREDICTION - 4-CLASS MODEL")
    print("="*80)
    
    # Load 4-class model
    model_file = os.path.join(MODEL_DIR, 'vehicle_health_rf_model_4class.pkl')
    scaler_file = os.path.join(MODEL_DIR, 'scaler_4class.pkl')
    metadata_file = os.path.join(MODEL_DIR, 'model_metadata_4class.json')
    
    if not os.path.exists(model_file):
        print("\n❌ ERROR: 4-class model not found!")
        print(f"   Run: python3 src/ml/train_random_forest.py")
        return
    
    model = joblib.load(model_file)
    scaler = joblib.load(scaler_file)
    with open(metadata_file) as f:
        metadata = json.load(f)
    
    print(f"\n✅ Model loaded: {metadata['classification_type']}")
    print(f"   Accuracy: {metadata['accuracy']*100:.2f}%")
    print(f"   Classes: {', '.join(metadata['classes'].values())}")
    
    # Fetch latest data
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    response = supabase.table('sensor_data_realtime').select('*').limit(1).execute()
    
    if not response.data:
        print("\n❌ No data in sensor_data_realtime"); return
    
    latest_data = response.data[0]
    
    # Display current values
    print("\n" + "="*80)
    print("📊 CURRENT SENSOR VALUES")
    print("="*80)
    print(f"\n   RPM:                {latest_data.get('rpm',0):.0f}")
    print(f"   Speed:              {latest_data.get('vehicle_speed',0):.1f} km/h")
    print(f"   Coolant Temp:       {latest_data.get('coolant_temp',0):.1f} °C")
    print(f"   Engine Load:        {latest_data.get('engine_load',0):.1f} %")
    print(f"   Throttle Position:  {latest_data.get('throttle_pos',0):.1f} %")
    print(f"   Voltage:            {latest_data.get('control_module_voltage',0):.2f} V")
    print(f"   Engine Stress:      {latest_data.get('engine_stress_score',0):.1f}")
    
    # Engineer features
    enriched_data = engineer_features_single(latest_data)
    X = pd.DataFrame([enriched_data])[metadata['features']].fillna(0)
    X_scaled = scaler.transform(X)
    
    # Make prediction
    prediction = model.predict(X_scaled)[0]
    probabilities = model.predict_proba(X_scaled)[0]
    
    # Map prediction to label
    health_labels = {int(k): v for k, v in metadata['classes'].items()}
    predicted_label = health_labels[prediction]
    confidence = probabilities[prediction] * 100
    
    # Display results
    print("\n" + "="*80)
    print("�� PREDICTION RESULTS")
    print("="*80)
    
    print(f"\n   Predicted Health Status: {predicted_label}")
    print(f"   Confidence:              {confidence:.1f}%")
    
    print(f"\n   Probability Distribution:")
    for cls_idx, cls_name in health_labels.items():
        prob = probabilities[cls_idx] * 100 if cls_idx < len(probabilities) else 0
        print(f"      {cls_name:<12} {prob:>5.1f}%")
    
    # Health interpretation
    print("\n" + "="*80)
    print("💡 INTERPRETATION")
    print("="*80)
    
    if prediction == 0:  # NORMAL
        print("\n   ✅ Vehicle is operating NORMALLY")
        print("      • All systems functioning within normal parameters")
        print("      • No immediate action required")
        print("      • Continue regular maintenance schedule")
        
    elif prediction == 1:  # ADVISORY
        print("\n   ⚠️  ADVISORY - Vehicle requires attention soon")
        print("      • Some parameters showing early warning signs")
        print("      • Schedule inspection within 1-2 weeks")
        
        # Specific recommendations
        if latest_data.get('coolant_temp', 0) > 90:
            print("      • Coolant temperature elevated - check cooling system")
        if latest_data.get('engine_load', 0) > 75:
            print("      • Engine load high - avoid heavy loads temporarily")
        if latest_data.get('control_module_voltage', 0) < 13.0:
            print("      • Battery voltage low - check charging system")
        if latest_data.get('engine_stress_score', 0) > 60:
            print("      • Engine stress elevated - reduce aggressive driving")
            
    elif prediction == 2:  # WARNING
        print("\n   ⚠️  WARNING - Vehicle requires immediate attention")
        print("      • Critical parameters approaching unsafe levels")
        print("      • Schedule inspection THIS WEEK")
        print("      • Reduce vehicle usage until inspected")
        
        # Specific warnings
        if latest_data.get('coolant_temp', 0) > 95:
            print("      • 🔴 Coolant temperature HIGH - risk of overheating")
        if latest_data.get('control_module_voltage', 0) < 12.5:
            print("      • 🔴 Battery voltage CRITICAL - check immediately")
        if latest_data.get('engine_stress_score', 0) > 80:
            print("      • 🔴 Engine under SEVERE stress - stop aggressive driving")
            
    else:  # CRITICAL
        print("\n   🔴 CRITICAL - IMMEDIATE ACTION REQUIRED")
        print("      • Vehicle systems in CRITICAL state")
        print("      • DO NOT OPERATE VEHICLE")
        print("      • Seek immediate professional assistance")
        print("      • Potential for catastrophic failure")
        
        # Critical alerts
        if latest_data.get('coolant_temp', 0) > 100:
            print("      • 🚨 OVERHEATING DANGER - Engine damage imminent")
        if latest_data.get('control_module_voltage', 0) < 11.5:
            print("      • 🚨 BATTERY FAILURE - Electrical system compromised")
        if latest_data.get('engine_stress_score', 0) > 90:
            print("      • 🚨 EXTREME ENGINE STRESS - Component failure risk")
    
    # Actual vs predicted
    actual_status = latest_data.get('health_status')
    if actual_status is not None:
        actual_label = health_labels.get(actual_status, f'Unknown({actual_status})')
        match = "✅ MATCH" if prediction == actual_status else "⚠️  MISMATCH"
        
        print("\n" + "="*80)
        print("📋 VALIDATION")
        print("="*80)
        print(f"\n   Actual Status:    {actual_label}")
        print(f"   Predicted Status: {predicted_label}")
        print(f"   Result:           {match}")
    
    print("\n" + "="*80)
    print(f"✅ Prediction complete! (Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')})")
    print("="*80 + "\n")

if __name__ == "__main__":
    predict_latest()
