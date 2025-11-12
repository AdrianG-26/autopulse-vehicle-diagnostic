#!/usr/bin/env python3
"""
Train Random Forest Model - 4-CLASS CLASSIFICATION
NORMAL / ADVISORY / WARNING / CRITICAL
"""
import sys, os, json
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import pandas as pd, numpy as np, joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from datetime import datetime

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', 'data', 'ml')
MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', 'models')
os.makedirs(MODEL_DIR, exist_ok=True)

def engineer_features(df):
    """Engineer 9 additional ML features"""
    df = df.copy()
    df['rpm_load_ratio'] = np.where(df['engine_load'] > 0, df['rpm'] / df['engine_load'], 0)
    df['temp_efficiency'] = np.where(df['coolant_temp'] > 0, df['engine_load'] / df['coolant_temp'], 0)
    df['speed_throttle_ratio'] = np.where(df['throttle_pos'] > 0, df['vehicle_speed'] / df['throttle_pos'], 0)
    df['high_rpm'] = (df['rpm'] > 3000).astype(int)
    df['low_speed'] = (df['vehicle_speed'] < 20).astype(int)
    df['high_throttle'] = (df['throttle_pos'] > 70).astype(int)
    df['voltage_health'] = ((df['control_module_voltage'] >= 12.5) & (df['control_module_voltage'] <= 14.5)).astype(int)
    df['stress_indicator'] = (df['high_rpm'] * 0.3) + (df['high_throttle'] * 0.3) + ((df['coolant_temp'] > 95).astype(int) * 0.4)
    return df.replace([np.inf, -np.inf], 0)

def train_model():
    print("\n" + "="*80)
    print("🤖 TRAINING RANDOM FOREST MODEL - 4-CLASS CLASSIFICATION")
    print("="*80)
    
    clean_file = os.path.join(DATA_DIR, 'clean_training_data.csv')
    if not os.path.exists(clean_file):
        print(f"\n❌ ERROR: Run python3 src/ml/fetch_training_data.py first"); return
    
    df = pd.read_csv(clean_file)
    print(f"✅ Loaded {len(df):,} clean records")
    df = engineer_features(df)
    
    # 53 features total
    feature_columns = ['rpm', 'vehicle_speed', 'coolant_temp', 'engine_load', 'throttle_pos',
                      'intake_temp', 'control_module_voltage', 'intake_pressure', 'fuel_level',
                      'barometric_pressure', 'ambient_air_temp', 'engine_runtime', 'distance_with_mil',
                      'fuel_rail_pressure', 'commanded_egr', 'fuel_pressure', 'timing_advance', 'maf',
                      'engine_stress_score', 'load_rpm_ratio', 'temp_gradient', 'fuel_efficiency',
                      'rpm_load_ratio', 'temp_efficiency', 'speed_throttle_ratio',
                      'high_rpm', 'low_speed', 'high_throttle', 'voltage_health', 'stress_indicator']
    
    available_features = [col for col in feature_columns if col in df.columns]
    X = df[available_features].fillna(0)
    
    # 4-CLASS CLASSIFICATION (not binary!)
    y = df['health_status'].copy()  # Keep original: 0=NORMAL, 1=ADVISORY, 2=WARNING, 3=CRITICAL
    
    print(f"\n📊 Using {len(available_features)} features")
    
    # Show 4-class distribution
    print("\n" + "="*80)
    print("🎯 4-CLASS DISTRIBUTION")
    print("="*80)
    
    health_labels = {0: 'NORMAL', 1: 'ADVISORY', 2: 'WARNING', 3: 'CRITICAL'}
    class_counts = y.value_counts().sort_index()
    
    for status in sorted(y.unique()):
        count = sum(y == status)
        label = health_labels.get(status, f'Unknown({status})')
        print(f"   {label:<12} {count:>6,} ({count/len(y)*100:>5.1f}%)")
    
    # Check if we have all 4 classes
    unique_classes = sorted(y.unique())
    num_classes = len(unique_classes)
    print(f"\n📊 Classes present: {num_classes} classes → {[health_labels.get(c, c) for c in unique_classes]}")
    
    if num_classes < 4:
        print(f"   ⚠️  NOTE: Only {num_classes} classes in data. Model will predict these classes only.")
        # Update target_names for classification report
        target_names = [health_labels[c] for c in unique_classes]
    else:
        target_names = ['NORMAL', 'ADVISORY', 'WARNING', 'CRITICAL']
    
    # Train-test split with stratification
    print("\n" + "="*80)
    print("✂️  TRAIN-TEST SPLIT (80-20)")
    print("="*80)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"\n   Training set:   {len(X_train):>6,} samples")
    print(f"   Testing set:    {len(X_test):>6,} samples")
    
    # Feature scaling
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train Random Forest
    print("\n" + "="*80)
    print("🌲 TRAINING RANDOM FOREST (4-CLASS)")
    print("="*80)
    print("\nHyperparameters:")
    print("   n_estimators:      200 trees")
    print("   max_depth:         15")
    print("   min_samples_split: 10")
    print("   min_samples_leaf:  5")
    print("   class_weight:      'balanced' (handle class imbalance)")
    print("   random_state:      42")
    
    print("\n🚀 Training in progress...")
    
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=15,
        min_samples_split=10,
        min_samples_leaf=5,
        class_weight='balanced',  # Important for imbalanced classes!
        random_state=42,
        n_jobs=-1,
        verbose=1
    )
    
    model.fit(X_train_scaled, y_train)
    print("\n✅ Training complete!")
    
    # Evaluate
    print("\n" + "="*80)
    print("📊 MODEL EVALUATION")
    print("="*80)
    
    y_pred = model.predict(X_test_scaled)
    y_pred_proba = model.predict_proba(X_test_scaled)
    
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\n🎯 Overall Accuracy: {accuracy*100:.2f}%")
    
    # Classification report
    print("\n📋 Classification Report (4-Class):")
    print(classification_report(y_test, y_pred, target_names=target_names, digits=4, zero_division=0))
    
    # Confusion matrix
    print("\n📊 Confusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    
    # Print header
    header_label = 'Actual \\\\\Predicted'
    print(f"\n{header_label:<20}", end="")
    for cls in unique_classes:
        print(f"{health_labels[cls]:<12}", end="")
    print()
    print("-" * (20 + 12 * num_classes))
    
    # Print matrix
    for i, actual_cls in enumerate(unique_classes):
        print(f"{health_labels[actual_cls]:<20}", end="")
        for j in range(num_classes):
            print(f"{cm[i][j]:<12}", end="")
        print()
    
    # Feature importance
    print("\n" + "="*80)
    print("🔝 TOP 15 IMPORTANT FEATURES")
    print("="*80)
    
    feature_importance = pd.DataFrame({
        'feature': available_features,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False).head(15)
    
    print(f"\n{'Rank':<6} {'Feature':<30} {'Importance':<12}")
    print("-" * 55)
    for idx, row in enumerate(feature_importance.itertuples(), 1):
        print(f"{idx:<6} {row.feature:<30} {row.importance:.6f}")
    
    # Save model
    print("\n" + "="*80)
    print("💾 SAVING MODEL")
    print("="*80)
    
    model_file = os.path.join(MODEL_DIR, 'vehicle_health_rf_model_4class.pkl')
    scaler_file = os.path.join(MODEL_DIR, 'scaler_4class.pkl')
    metadata_file = os.path.join(MODEL_DIR, 'model_metadata_4class.json')
    
    joblib.dump(model, model_file)
    joblib.dump(scaler, scaler_file)
    
    print(f"\n✅ Saved model to: {model_file}")
    print(f"✅ Saved scaler to: {scaler_file}")
    
    # Save metadata
    metadata = {
        'model_type': 'RandomForestClassifier',
        'classification_type': '4-class',
        'classes': {int(k): v for k, v in health_labels.items() if k in unique_classes},
        'training_date': datetime.now().isoformat(),
        'total_samples': len(df),
        'training_samples': len(X_train),
        'testing_samples': len(X_test),
        'accuracy': float(accuracy),
        'features': available_features,
        'num_features': len(available_features),
        'hyperparameters': {
            'n_estimators': 200,
            'max_depth': 15,
            'min_samples_split': 10,
            'min_samples_leaf': 5,
            'class_weight': 'balanced'
        },
        'class_distribution': {health_labels[int(cls)]: int((y == cls).sum()) for cls in unique_classes}
    }
    
    with open(metadata_file, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"✅ Saved metadata to: {metadata_file}")
    
    print("\n" + "="*80)
    print("🎉 MODEL TRAINING COMPLETE!")
    print("="*80)
    print(f"\n📊 Final Results:")
    print(f"   Classification:   4-CLASS (NORMAL/ADVISORY/WARNING/CRITICAL)")
    print(f"   Accuracy:         {accuracy*100:.2f}%")
    print(f"   Training samples: {len(X_train):,}")
    print(f"   Testing samples:  {len(X_test):,}")
    print(f"   Features used:    {len(available_features)}")
    print(f"\n🚀 Next: python3 src/ml/predict_health.py\n")

if __name__ == "__main__":
    train_model()
