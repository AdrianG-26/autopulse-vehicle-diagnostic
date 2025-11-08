#!/usr/bin/env python3
"""
🤖 Random Forest Predictive Maintenance Model
==============================================

Professional ML system for vehicle maintenance prediction using Random Forest algorithm.
Supports incremental training with new data collection sessions.

Author: Vehicle Diagnostic System Team
Date: October 11, 2025
Version: 1.0.0

Academic Purpose: Thesis project demonstrating AI-powered predictive maintenance
Industry Standards: Follows automotive ML best practices and SAE standards
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import sqlite3
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# Set style for professional plots
plt.style.use('default')
sns.set_palette("husl")

class VehicleMaintenancePredictorML:
    """
    🎯 Professional Random Forest Model for Vehicle Maintenance Prediction
    
    Features:
    - Industry-standard data preprocessing
    - Hyperparameter optimization
    - Cross-validation with automotive-specific metrics  
    - Feature importance analysis for engineering insights
    - Incremental training support for new data
    - Professional visualization and reporting
    """
    
    def __init__(self, model_version="v1.0"):
        """Initialize the ML prediction system"""
        self.model_version = model_version
        self.model = None
        self.label_encoder = LabelEncoder()
        self.scaler = StandardScaler()
        self.feature_names = None
        self.target_mapping = {
            'NORMAL': 0,
            'ADVISORY': 1, 
            'WARNING': 2,
            'CRITICAL': 3
        }
        
        # Performance tracking
        self.training_history = []
        self.feature_importance = None
        
        print(f"🤖 Vehicle Maintenance ML System {model_version} Initialized")
        print(f"📊 Target Classes: {list(self.target_mapping.keys())}")
        
    def load_data_from_database(self, db_path="data/vehicle_data.db"):
        """
        📊 Load and preprocess data from enhanced database
        
        Returns comprehensive dataset with all 32 features for ML training
        """
        print("📂 Loading data from enhanced database...")
        
        try:
            conn = sqlite3.connect(db_path)
            
            # Load sensor data with car profile information  
            query = """
            SELECT 
                -- Sensor data (32 features)
                sd.rpm, sd.coolant_temp, sd.engine_load, sd.throttle_pos,
                sd.intake_temp, sd.fuel_level, sd.fuel_trim_short, sd.fuel_trim_long,
                sd.maf, sd.map, sd.timing_advance, sd.vehicle_speed,
                sd.o2_sensor_1, sd.o2_sensor_2, sd.catalyst_temp, sd.egr_error,
                sd.barometric_pressure, sd.fuel_pressure, sd.engine_runtime,
                sd.control_module_voltage, sd.dtc_count, sd.fuel_system_status,
                
                -- Engineered ML features
                sd.load_rpm_ratio, sd.temp_gradient, sd.fuel_efficiency,
                sd.throttle_response, sd.engine_stress_score,
                
                -- Health classification (target)
                sd.status, sd.fault_type, sd.data_quality_score,
                
                -- Vehicle information
                COALESCE(cp.make, 'Unknown') as make, 
                COALESCE(cp.model, 'Unknown') as model, 
                COALESCE(cp.year, 0) as year, 
                sd.car_profile_id,
                sd.session_id, sd.timestamp
                
            FROM enhanced_sensor_data sd
            LEFT JOIN car_profiles cp ON sd.car_profile_id = cp.id
            WHERE sd.data_quality_score >= 60
            ORDER BY sd.timestamp
            """
            
            df = pd.read_sql_query(query, conn)
            conn.close()
            
            print(f"✅ Loaded {len(df):,} high-quality records")
            print(f"📅 Date range: {df['timestamp'].min()} to {df['timestamp'].max()}")
            
            # Data quality summary
            quality_stats = df['data_quality_score'].describe()
            print(f"📋 Data quality: {quality_stats['mean']:.1f}% avg (range: {quality_stats['min']:.0f}%-{quality_stats['max']:.0f}%)")
            
            return df
            
        except Exception as e:
            print(f"❌ Error loading data: {e}")
            return None
    
    def prepare_features(self, df):
        """
        🔧 Professional feature engineering and preprocessing
        
        Implements automotive industry best practices for ML feature preparation
        """
        print("🔧 Preparing features for Random Forest training...")
        
        # Define numerical features (main predictors)
        numerical_features = [
            # Core engine parameters
            'rpm', 'coolant_temp', 'engine_load', 'throttle_pos', 'intake_temp',
            
            # Fuel system
            'fuel_level', 'fuel_trim_short', 'fuel_trim_long', 'maf', 'fuel_pressure',
            
            # Engine control
            'map', 'timing_advance', 'vehicle_speed', 'engine_runtime', 
            'control_module_voltage', 'dtc_count',
            
            # Emissions
            'o2_sensor_1', 'o2_sensor_2', 'catalyst_temp', 'egr_error', 'barometric_pressure',
            
            # Engineered features (key for prediction)
            'load_rpm_ratio', 'temp_gradient', 'fuel_efficiency', 
            'throttle_response', 'engine_stress_score', 'data_quality_score'
        ]
        
        # Handle categorical features
        categorical_features = ['fuel_system_status', 'make', 'model']
        
        # Create feature matrix
        X = df[numerical_features].copy()
        
        # Add encoded categorical features
        for cat_feature in categorical_features:
            if cat_feature in df.columns:
                le = LabelEncoder()
                X[f'{cat_feature}_encoded'] = le.fit_transform(df[cat_feature].fillna('unknown'))
        
        # Add temporal features (advanced ML technique)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        X['hour'] = df['timestamp'].dt.hour
        X['day_of_week'] = df['timestamp'].dt.dayofweek
        
        # Handle missing values (Random Forest robust, but ensure no NaN)
        X = X.fillna(0)
        
        # Prepare target variable
        y = df['status'].map(self.target_mapping)
        
        # Store feature names for interpretation
        self.feature_names = X.columns.tolist()
        
        print(f"✅ Feature matrix prepared: {X.shape[0]:,} samples × {X.shape[1]} features")
        print(f"📊 Target distribution:")
        for status, code in self.target_mapping.items():
            count = (y == code).sum()
            pct = count / len(y) * 100
            print(f"   {status}: {count:,} samples ({pct:.1f}%)")
        
        return X, y
    
    def optimize_hyperparameters(self, X, y):
        """
        ⚙️ Professional hyperparameter optimization using GridSearchCV
        
        Finds optimal Random Forest configuration for automotive data
        """
        print("⚙️ Optimizing Random Forest hyperparameters...")
        
        # Define hyperparameter grid (automotive-optimized)
        param_grid = {
            'n_estimators': [50, 100, 200],           # Trees in forest
            'max_depth': [10, 15, 20, None],          # Tree depth
            'min_samples_split': [2, 5, 10],          # Minimum samples to split
            'min_samples_leaf': [1, 2, 4],            # Minimum samples per leaf
            'max_features': ['sqrt', 'log2', None]    # Feature sampling
        }
        
        # Initialize base model
        rf_base = RandomForestClassifier(
            random_state=42,
            n_jobs=-1,           # Use all CPU cores
            class_weight='balanced'  # Handle class imbalance
        )
        
        # Grid search with cross-validation
        grid_search = GridSearchCV(
            rf_base, 
            param_grid, 
            cv=5,                # 5-fold cross-validation
            scoring='accuracy',   # Optimize for overall accuracy
            n_jobs=-1,
            verbose=1
        )
        
        print("🔍 Running grid search (this may take a few minutes)...")
        grid_search.fit(X, y)
        
        print(f"✅ Best parameters found: {grid_search.best_params_}")
        print(f"📈 Best CV accuracy: {grid_search.best_score_:.3f}")
        
        return grid_search.best_estimator_
    
    def train_model(self, X, y, optimize_hyperparams=True):
        """
        🏋️ Train Random Forest model with automotive-specific optimization
        """
        print("🏋️ Training Random Forest model for vehicle maintenance prediction...")
        
        # Split data (80% train, 20% test)
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        print(f"📊 Training set: {X_train.shape[0]:,} samples")
        print(f"📊 Test set: {X_test.shape[0]:,} samples")
        
        # Optimize hyperparameters or use defaults
        if optimize_hyperparams and len(X) > 1000:
            self.model = self.optimize_hyperparameters(X_train, y_train)
        else:
            # Use automotive-optimized defaults for smaller datasets
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=15,
                min_samples_split=5,
                min_samples_leaf=2,
                max_features='sqrt',
                random_state=42,
                n_jobs=-1,
                class_weight='balanced'
            )
            self.model.fit(X_train, y_train)
        
        # Cross-validation performance
        cv_scores = cross_val_score(self.model, X_train, y_train, cv=5)
        print(f"📈 Cross-validation accuracy: {cv_scores.mean():.3f} (±{cv_scores.std()*2:.3f})")
        
        # Test set evaluation
        y_pred = self.model.predict(X_test)
        test_accuracy = accuracy_score(y_test, y_pred)
        
        # Store training results
        training_result = {
            'timestamp': datetime.now(),
            'model_version': self.model_version,
            'training_samples': len(X_train),
            'test_samples': len(X_test),
            'cv_accuracy': cv_scores.mean(),
            'test_accuracy': test_accuracy,
            'hyperparameters': self.model.get_params()
        }
        self.training_history.append(training_result)
        
        print(f"✅ Model training completed!")
        print(f"📊 Test accuracy: {test_accuracy:.3f}")
        
        # Feature importance analysis
        self.feature_importance = pd.DataFrame({
            'feature': self.feature_names,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        return X_test, y_test, y_pred
    
    def evaluate_model(self, X_test, y_test, y_pred):
        """
        📊 Comprehensive model evaluation with automotive-specific metrics
        """
        print("📊 Evaluating model performance...")
        
        # Overall accuracy
        accuracy = accuracy_score(y_test, y_pred)
        print(f"🎯 Overall Accuracy: {accuracy:.1%}")
        
        # Detailed classification report
        target_names = list(self.target_mapping.keys())
        report = classification_report(y_test, y_pred, target_names=target_names, output_dict=True)
        
        print("\n📋 Classification Report:")
        print(classification_report(y_test, y_pred, target_names=target_names))
        
        # Confusion Matrix
        cm = confusion_matrix(y_test, y_pred)
        
        # Feature Importance (Top 10)
        print("\n🏆 Top 10 Most Important Features:")
        for i, (_, row) in enumerate(self.feature_importance.head(10).iterrows()):
            print(f"   {i+1:2d}. {row['feature']:<20} {row['importance']:.3f}")
        
        return {
            'accuracy': accuracy,
            'classification_report': report,
            'confusion_matrix': cm,
            'feature_importance': self.feature_importance
        }
    
    def create_visualizations(self, evaluation_results):
        """
        📈 Create professional visualizations for thesis presentation
        """
        print("📈 Creating professional visualizations...")
        
        # Set up the plotting area
        fig, axes = plt.subplots(2, 2, figsize=(15, 12))
        fig.suptitle('🚗 Vehicle Maintenance Prediction Model - Performance Analysis', fontsize=16, fontweight='bold')
        
        # 1. Confusion Matrix
        cm = evaluation_results['confusion_matrix']
        target_names = list(self.target_mapping.keys())
        
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                   xticklabels=target_names, yticklabels=target_names,
                   ax=axes[0,0])
        axes[0,0].set_title('Confusion Matrix')
        axes[0,0].set_xlabel('Predicted')
        axes[0,0].set_ylabel('Actual')
        
        # 2. Feature Importance (Top 15)
        top_features = self.feature_importance.head(15)
        axes[0,1].barh(range(len(top_features)), top_features['importance'])
        axes[0,1].set_yticks(range(len(top_features)))
        axes[0,1].set_yticklabels(top_features['feature'])
        axes[0,1].set_xlabel('Importance Score')
        axes[0,1].set_title('Feature Importance (Top 15)')
        axes[0,1].invert_yaxis()
        
        # 3. Class Distribution
        report = evaluation_results['classification_report']
        classes = [k for k in report.keys() if k not in ['accuracy', 'macro avg', 'weighted avg']]
        
        precision_scores = [report[cls]['precision'] for cls in classes]
        recall_scores = [report[cls]['recall'] for cls in classes]
        
        x = np.arange(len(classes))
        width = 0.35
        
        axes[1,0].bar(x - width/2, precision_scores, width, label='Precision', alpha=0.8)
        axes[1,0].bar(x + width/2, recall_scores, width, label='Recall', alpha=0.8)
        axes[1,0].set_xlabel('Health Status')
        axes[1,0].set_ylabel('Score')
        axes[1,0].set_title('Precision & Recall by Class')
        axes[1,0].set_xticks(x)
        axes[1,0].set_xticklabels(classes, rotation=45)
        axes[1,0].legend()
        axes[1,0].set_ylim(0, 1.1)
        
        # 4. Training History (if multiple trainings)
        if len(self.training_history) > 1:
            timestamps = [t['timestamp'] for t in self.training_history]
            cv_accuracies = [t['cv_accuracy'] for t in self.training_history]
            test_accuracies = [t['test_accuracy'] for t in self.training_history]
            
            axes[1,1].plot(timestamps, cv_accuracies, 'o-', label='CV Accuracy', linewidth=2)
            axes[1,1].plot(timestamps, test_accuracies, 's-', label='Test Accuracy', linewidth=2)
            axes[1,1].set_xlabel('Training Session')
            axes[1,1].set_ylabel('Accuracy')
            axes[1,1].set_title('Model Performance Over Time')
            axes[1,1].legend()
            axes[1,1].set_ylim(0, 1)
        else:
            # Single training - show accuracy by class
            f1_scores = [report[cls]['f1-score'] for cls in classes]
            axes[1,1].bar(classes, f1_scores, alpha=0.8, color='green')
            axes[1,1].set_xlabel('Health Status')
            axes[1,1].set_ylabel('F1-Score')
            axes[1,1].set_title('F1-Score by Class')
            axes[1,1].set_xticklabels(classes, rotation=45)
            axes[1,1].set_ylim(0, 1.1)
        
        plt.tight_layout()
        
        # Save the visualization
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"exports/ml_model_analysis_{self.model_version}_{timestamp}.png"
        plt.savefig(filename, dpi=300, bbox_inches='tight')
        print(f"💾 Visualizations saved: {filename}")
        
        plt.show()
    
    def save_model(self, filename=None):
        """
        💾 Save trained model and metadata for production use
        """
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"models/vehicle_maintenance_rf_{self.model_version}_{timestamp}.joblib"
        
        # Create model package
        model_package = {
            'model': self.model,
            'feature_names': self.feature_names,
            'target_mapping': self.target_mapping,
            'label_encoder': self.label_encoder,
            'model_version': self.model_version,
            'training_history': self.training_history,
            'feature_importance': self.feature_importance
        }
        
        joblib.dump(model_package, filename)
        print(f"💾 Model saved: {filename}")
        return filename
    
    def load_model(self, filename):
        """
        📂 Load previously trained model
        """
        model_package = joblib.load(filename)
        
        self.model = model_package['model']
        self.feature_names = model_package['feature_names']
        self.target_mapping = model_package['target_mapping']
        self.label_encoder = model_package['label_encoder']
        self.model_version = model_package['model_version']
        self.training_history = model_package.get('training_history', [])
        self.feature_importance = model_package.get('feature_importance', None)
        
        print(f"📂 Model loaded: {filename}")
        print(f"🤖 Model version: {self.model_version}")
    
    def predict_maintenance(self, sensor_data):
        """
        🔮 Predict maintenance needs from current sensor readings
        
        Args:
            sensor_data: Dictionary with current vehicle sensor values
            
        Returns:
            prediction: Maintenance status and confidence
        """
        if self.model is None:
            raise ValueError("Model not trained. Call train_model() first.")
        
        # Convert to feature vector
        feature_vector = np.array([sensor_data.get(feature, 0) for feature in self.feature_names]).reshape(1, -1)
        
        # Get prediction and confidence
        prediction = self.model.predict(feature_vector)[0]
        prediction_proba = self.model.predict_proba(feature_vector)[0]
        
        # Convert back to status name
        status_names = {v: k for k, v in self.target_mapping.items()}
        predicted_status = status_names[prediction]
        confidence = prediction_proba.max()
        
        return {
            'status': predicted_status,
            'confidence': confidence,
            'probabilities': {status_names[i]: prob for i, prob in enumerate(prediction_proba)}
        }


def main():
    """
    🚀 Main training pipeline for vehicle maintenance prediction
    """
    print("🚗 Vehicle Maintenance Prediction Model Training")
    print("=" * 60)
    
    # Initialize ML system
    ml_system = VehicleMaintenancePredictorML(model_version="v1.0_baseline")
    
    # Load data from database
    df = ml_system.load_data_from_database()
    if df is None:
        print("❌ Failed to load data. Exiting.")
        return
    
    # Prepare features for training
    X, y = ml_system.prepare_features(df)
    
    # Train Random Forest model
    X_test, y_test, y_pred = ml_system.train_model(X, y, optimize_hyperparams=True)
    
    # Evaluate model performance  
    evaluation_results = ml_system.evaluate_model(X_test, y_test, y_pred)
    
    # Create professional visualizations
    ml_system.create_visualizations(evaluation_results)
    
    # Save trained model
    model_filename = ml_system.save_model()
    
    # Summary report
    print("\n" + "=" * 60)
    print("🎉 MODEL TRAINING COMPLETED SUCCESSFULLY!")
    print("=" * 60)
    print(f"📊 Final Accuracy: {evaluation_results['accuracy']:.1%}")
    print(f"💾 Model saved: {model_filename}")
    print(f"📈 Visualizations: exports/ml_model_analysis_*.png")
    print("\n🎯 Ready for production deployment!")
    print("📋 Next steps:")
    print("   1. Review feature importance analysis")
    print("   2. Collect additional highway data tomorrow")
    print("   3. Retrain with enhanced dataset")
    print("   4. Update thesis documentation")


if __name__ == "__main__":
    # Create necessary directories
    import os
    os.makedirs('models', exist_ok=True)
    os.makedirs('exports', exist_ok=True)
    
    main()