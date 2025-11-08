#!/usr/bin/env python3
"""
🧪 Random Forest Model Performance Testing & Validation
=======================================================

Comprehensive test suite to evaluate the trained Random Forest model
and provide detailed performance metrics for thesis documentation.

Author: Vehicle Diagnostic System Team
Date: October 29, 2025
"""

import joblib
import pandas as pd
import numpy as np
import sqlite3
from sklearn.metrics import (
    classification_report, confusion_matrix, accuracy_score,
    precision_recall_fscore_support, roc_auc_score
)
from sklearn.model_selection import cross_val_score
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# Set plotting style
plt.style.use('default')
sns.set_palette("husl")


class ModelPerformanceTester:
    """
    🧪 Comprehensive model testing and validation system
    """
    
    def __init__(self, model_path):
        """Load the trained model"""
        print(f"📂 Loading model: {model_path}")
        self.model_package = joblib.load(model_path)
        self.model = self.model_package['model']
        self.feature_names = self.model_package['feature_names']
        self.target_mapping = self.model_package['target_mapping']
        self.model_version = self.model_package.get('model_version', 'Unknown')
        
        print(f"✅ Model loaded successfully!")
        print(f"🤖 Version: {self.model_version}")
        print(f"📊 Features: {len(self.feature_names)}")
        print(f"🎯 Classes: {list(self.target_mapping.keys())}\n")
    
    def load_test_data(self, db_path="src/data/vehicle_data.db", sample_size=None):
        """
        📊 Load test data from database
        
        Args:
            db_path: Path to SQLite database
            sample_size: Number of samples to test (None = all data)
        """
        print(f"📂 Loading test data from: {db_path}")
        
        try:
            conn = sqlite3.connect(db_path)
            
            # Load all high-quality sensor data
            query = """
            SELECT 
                sd.rpm, sd.coolant_temp, sd.engine_load, sd.throttle_pos,
                sd.intake_temp, sd.fuel_level, sd.fuel_trim_short, sd.fuel_trim_long,
                sd.maf, sd.map, sd.timing_advance, sd.vehicle_speed,
                sd.fuel_pressure, sd.control_module_voltage, sd.dtc_count,
                sd.load_rpm_ratio, sd.temp_gradient, sd.fuel_efficiency,
                sd.throttle_response, sd.engine_stress_score,
                sd.data_quality_score, sd.status, sd.car_profile_id,
                
                -- Additional engineered features (if exist)
                CASE WHEN sd.vehicle_speed > 0 THEN sd.engine_load / sd.vehicle_speed ELSE 0 END as load_speed_ratio,
                CASE WHEN sd.rpm > 0 THEN sd.coolant_temp / sd.rpm * 1000 ELSE 0 END as temp_rpm_ratio,
                
                sd.timestamp
                
            FROM enhanced_sensor_data sd
            WHERE sd.data_quality_score >= 60
            ORDER BY RANDOM()
            """
            
            if sample_size:
                query += f" LIMIT {sample_size}"
            
            df = pd.read_sql_query(query, conn)
            conn.close()
            
            print(f"✅ Loaded {len(df):,} test samples")
            print(f"📅 Date range: {df['timestamp'].min()} to {df['timestamp'].max()}")
            
            # Status distribution
            print(f"\n📊 Test data distribution:")
            for status, code in self.target_mapping.items():
                count = (df['status'] == status).sum()
                pct = count / len(df) * 100
                print(f"   {status:10s}: {count:6,} samples ({pct:5.1f}%)")
            
            return df
            
        except Exception as e:
            print(f"❌ Error loading test data: {e}")
            return None
    
    def prepare_test_features(self, df):
        """
        🔧 Prepare features matching training format
        """
        print("\n🔧 Preparing test features...")
        
        # Extract features in the correct order
        X = df[self.feature_names].copy()
        
        # Handle missing values
        X = X.fillna(0)
        
        # Prepare target
        y = df['status'].map(self.target_mapping)
        
        print(f"✅ Feature matrix: {X.shape[0]:,} samples × {X.shape[1]} features")
        
        return X, y, df
    
    def comprehensive_evaluation(self, X, y, df):
        """
        📊 Comprehensive model evaluation
        """
        print("\n" + "=" * 70)
        print("🧪 COMPREHENSIVE MODEL EVALUATION")
        print("=" * 70)
        
        # Make predictions
        print("\n🔮 Making predictions...")
        y_pred = self.model.predict(X)
        y_pred_proba = self.model.predict_proba(X)
        
        # 1. Overall Accuracy
        accuracy = accuracy_score(y, y_pred)
        print(f"\n🎯 OVERALL ACCURACY: {accuracy:.1%}")
        
        # 2. Classification Report
        target_names = list(self.target_mapping.keys())
        print("\n📋 DETAILED CLASSIFICATION REPORT:")
        print(classification_report(y, y_pred, target_names=target_names))
        
        # 3. Confusion Matrix
        cm = confusion_matrix(y, y_pred)
        print("📊 CONFUSION MATRIX:")
        cm_df = pd.DataFrame(cm, index=target_names, columns=target_names)
        print(cm_df)
        
        # 4. Per-Class Metrics
        precision, recall, f1, support = precision_recall_fscore_support(y, y_pred)
        
        print("\n📈 PER-CLASS PERFORMANCE:")
        metrics_df = pd.DataFrame({
            'Class': target_names,
            'Precision': precision,
            'Recall': recall,
            'F1-Score': f1,
            'Support': support
        })
        print(metrics_df.to_string(index=False))
        
        # 5. Cross-validation (on subset for speed)
        if len(X) > 5000:
            sample_indices = np.random.choice(len(X), 5000, replace=False)
            X_cv = X.iloc[sample_indices]
            y_cv = y.iloc[sample_indices]
        else:
            X_cv = X
            y_cv = y
        
        print("\n🔄 CROSS-VALIDATION (5-fold):")
        cv_scores = cross_val_score(self.model, X_cv, y_cv, cv=5, scoring='accuracy')
        print(f"   CV Accuracy: {cv_scores.mean():.1%} (±{cv_scores.std() * 2:.1%})")
        print(f"   Scores: {[f'{s:.3f}' for s in cv_scores]}")
        
        # 6. Prediction Confidence Analysis
        print("\n🎲 PREDICTION CONFIDENCE ANALYSIS:")
        max_probabilities = y_pred_proba.max(axis=1)
        
        confidence_bins = [
            ('Very High (>90%)', (max_probabilities > 0.9).sum()),
            ('High (80-90%)', ((max_probabilities > 0.8) & (max_probabilities <= 0.9)).sum()),
            ('Medium (70-80%)', ((max_probabilities > 0.7) & (max_probabilities <= 0.8)).sum()),
            ('Low (<70%)', (max_probabilities <= 0.7).sum())
        ]
        
        for label, count in confidence_bins:
            pct = count / len(max_probabilities) * 100
            print(f"   {label:20s}: {count:6,} ({pct:5.1f}%)")
        
        # 7. Vehicle-specific performance
        print("\n🚗 PERFORMANCE BY VEHICLE:")
        for car_id in df['car_profile_id'].unique():
            car_mask = df['car_profile_id'] == car_id
            car_accuracy = accuracy_score(y[car_mask], y_pred[car_mask])
            car_samples = car_mask.sum()
            print(f"   Car {car_id}: {car_accuracy:.1%} accuracy ({car_samples:,} samples)")
        
        # 8. Error Analysis
        print("\n❌ ERROR ANALYSIS:")
        errors = y != y_pred
        error_rate = errors.sum() / len(y)
        print(f"   Total Errors: {errors.sum():,} / {len(y):,} ({error_rate:.1%})")
        
        if errors.sum() > 0:
            print("\n   Most Common Misclassifications:")
            reverse_mapping = {v: k for k, v in self.target_mapping.items()}
            
            error_pairs = pd.DataFrame({
                'Actual': y[errors].map(reverse_mapping),
                'Predicted': pd.Series(y_pred[errors]).map(reverse_mapping)
            })
            
            error_counts = error_pairs.value_counts().head(5)
            for (actual, predicted), count in error_counts.items():
                print(f"      {actual:10s} → {predicted:10s}: {count:4,} times")
        
        # 9. Feature Importance
        if hasattr(self.model, 'feature_importances_'):
            print("\n🏆 TOP 10 MOST IMPORTANT FEATURES:")
            feature_importance = pd.DataFrame({
                'Feature': self.feature_names,
                'Importance': self.model.feature_importances_
            }).sort_values('Importance', ascending=False)
            
            for i, (_, row) in enumerate(feature_importance.head(10).iterrows()):
                print(f"   {i+1:2d}. {row['Feature']:<25s} {row['Importance']:.4f}")
        
        return {
            'accuracy': accuracy,
            'y_pred': y_pred,
            'y_pred_proba': y_pred_proba,
            'confusion_matrix': cm,
            'classification_report': classification_report(y, y_pred, target_names=target_names, output_dict=True),
            'cv_scores': cv_scores,
            'confidence_scores': max_probabilities
        }
    
    def create_visualizations(self, evaluation_results, y_true, output_file=None):
        """
        📈 Create comprehensive performance visualizations
        """
        print("\n📈 Creating performance visualizations...")
        
        fig = plt.figure(figsize=(16, 12))
        gs = fig.add_gridspec(3, 3, hspace=0.3, wspace=0.3)
        
        target_names = list(self.target_mapping.keys())
        cm = evaluation_results['confusion_matrix']
        report = evaluation_results['classification_report']
        
        # 1. Confusion Matrix (Large)
        ax1 = fig.add_subplot(gs[0:2, 0:2])
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                   xticklabels=target_names, yticklabels=target_names,
                   ax=ax1, cbar_kws={'label': 'Count'})
        ax1.set_title('Confusion Matrix', fontsize=14, fontweight='bold')
        ax1.set_xlabel('Predicted Status', fontsize=12)
        ax1.set_ylabel('Actual Status', fontsize=12)
        
        # 2. Accuracy by Class
        ax2 = fig.add_subplot(gs[0, 2])
        classes = [k for k in report.keys() if k not in ['accuracy', 'macro avg', 'weighted avg']]
        f1_scores = [report[cls]['f1-score'] for cls in classes]
        colors = ['green', 'yellow', 'orange', 'red']
        ax2.bar(classes, f1_scores, color=colors, alpha=0.7)
        ax2.set_title('F1-Score by Class', fontweight='bold')
        ax2.set_ylabel('F1-Score')
        ax2.set_ylim(0, 1.1)
        ax2.axhline(y=0.8, color='gray', linestyle='--', alpha=0.5)
        plt.setp(ax2.xaxis.get_majorticklabels(), rotation=45, ha='right')
        
        # 3. Precision vs Recall
        ax3 = fig.add_subplot(gs[1, 2])
        precision_scores = [report[cls]['precision'] for cls in classes]
        recall_scores = [report[cls]['recall'] for cls in classes]
        x_pos = np.arange(len(classes))
        width = 0.35
        ax3.bar(x_pos - width/2, precision_scores, width, label='Precision', alpha=0.8)
        ax3.bar(x_pos + width/2, recall_scores, width, label='Recall', alpha=0.8)
        ax3.set_title('Precision vs Recall', fontweight='bold')
        ax3.set_xticks(x_pos)
        ax3.set_xticklabels(classes, rotation=45, ha='right')
        ax3.set_ylabel('Score')
        ax3.set_ylim(0, 1.1)
        ax3.legend()
        ax3.axhline(y=0.8, color='gray', linestyle='--', alpha=0.5)
        
        # 4. Feature Importance
        ax4 = fig.add_subplot(gs[2, 0:2])
        if hasattr(self.model, 'feature_importances_'):
            feature_importance = pd.DataFrame({
                'Feature': self.feature_names,
                'Importance': self.model.feature_importances_
            }).sort_values('Importance', ascending=False).head(12)
            
            ax4.barh(range(len(feature_importance)), feature_importance['Importance'])
            ax4.set_yticks(range(len(feature_importance)))
            ax4.set_yticklabels(feature_importance['Feature'])
            ax4.set_xlabel('Importance Score')
            ax4.set_title('Top 12 Most Important Features', fontweight='bold')
            ax4.invert_yaxis()
        
        # 5. Confidence Distribution
        ax5 = fig.add_subplot(gs[2, 2])
        confidence_scores = evaluation_results['confidence_scores']
        ax5.hist(confidence_scores, bins=20, edgecolor='black', alpha=0.7)
        ax5.axvline(confidence_scores.mean(), color='red', linestyle='--', 
                   label=f'Mean: {confidence_scores.mean():.2f}')
        ax5.set_xlabel('Prediction Confidence')
        ax5.set_ylabel('Frequency')
        ax5.set_title('Prediction Confidence Distribution', fontweight='bold')
        ax5.legend()
        
        # Add overall title
        fig.suptitle(f'🤖 Random Forest Model Performance Analysis - {self.model_version}\n'
                    f'Overall Accuracy: {evaluation_results["accuracy"]:.1%}',
                    fontsize=16, fontweight='bold', y=0.98)
        
        if output_file is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = f"src/exports/model_performance_test_{timestamp}.png"
        
        plt.savefig(output_file, dpi=300, bbox_inches='tight')
        print(f"💾 Visualization saved: {output_file}")
        
        plt.show()
        
        return output_file
    
    def generate_report(self, evaluation_results, output_file=None):
        """
        📝 Generate comprehensive text report for thesis documentation
        """
        if output_file is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = f"src/exports/model_performance_report_{timestamp}.txt"
        
        with open(output_file, 'w') as f:
            f.write("=" * 70 + "\n")
            f.write("🤖 RANDOM FOREST MODEL PERFORMANCE REPORT\n")
            f.write("=" * 70 + "\n\n")
            
            f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Model Version: {self.model_version}\n")
            f.write(f"Features: {len(self.feature_names)}\n")
            f.write(f"Classes: {list(self.target_mapping.keys())}\n\n")
            
            f.write("=" * 70 + "\n")
            f.write("📊 PERFORMANCE SUMMARY\n")
            f.write("=" * 70 + "\n\n")
            
            f.write(f"Overall Accuracy: {evaluation_results['accuracy']:.1%}\n")
            f.write(f"CV Accuracy: {evaluation_results['cv_scores'].mean():.1%} "
                   f"(±{evaluation_results['cv_scores'].std() * 2:.1%})\n\n")
            
            f.write("Per-Class Performance:\n")
            report = evaluation_results['classification_report']
            for cls in ['NORMAL', 'ADVISORY', 'WARNING', 'CRITICAL']:
                if cls in report:
                    f.write(f"  {cls:10s}: Precision={report[cls]['precision']:.3f}, "
                           f"Recall={report[cls]['recall']:.3f}, "
                           f"F1={report[cls]['f1-score']:.3f}, "
                           f"Support={report[cls]['support']}\n")
            
            f.write("\n" + "=" * 70 + "\n")
            f.write("🎯 MODEL QUALITY ASSESSMENT\n")
            f.write("=" * 70 + "\n\n")
            
            accuracy = evaluation_results['accuracy']
            if accuracy >= 0.95:
                f.write("✅ EXCELLENT - Production ready for deployment\n")
            elif accuracy >= 0.90:
                f.write("✅ VERY GOOD - Suitable for most applications\n")
            elif accuracy >= 0.85:
                f.write("⚠️  GOOD - Consider additional training data\n")
            elif accuracy >= 0.80:
                f.write("⚠️  FAIR - Needs improvement before deployment\n")
            else:
                f.write("❌ POOR - Requires retraining with better data\n")
            
            f.write("\n" + "=" * 70 + "\n")
            f.write("🔍 RECOMMENDATIONS\n")
            f.write("=" * 70 + "\n\n")
            
            # Analyze which classes need improvement
            for cls in ['NORMAL', 'ADVISORY', 'WARNING', 'CRITICAL']:
                if cls in report:
                    f1 = report[cls]['f1-score']
                    if f1 < 0.80:
                        f.write(f"⚠️  {cls} class needs more training data (F1={f1:.3f})\n")
            
            avg_confidence = evaluation_results['confidence_scores'].mean()
            if avg_confidence < 0.80:
                f.write(f"⚠️  Low average confidence ({avg_confidence:.1%}) - consider feature engineering\n")
            
            f.write("\n")
        
        print(f"💾 Report saved: {output_file}")
        return output_file


def main():
    """
    🚀 Main testing pipeline
    """
    print("=" * 70)
    print("🧪 RANDOM FOREST MODEL PERFORMANCE TESTING")
    print("=" * 70)
    print()
    
    # Initialize tester with the latest model
    model_path = "src/models/vehicle_maintenance_rf_rpi_compatible_20251026_200238.joblib"
    tester = ModelPerformanceTester(model_path)
    
    # Load test data (use all available data for comprehensive testing)
    df = tester.load_test_data(sample_size=None)
    
    if df is None or len(df) == 0:
        print("❌ No test data available. Exiting.")
        return
    
    # Prepare features
    X, y, df = tester.prepare_test_features(df)
    
    # Run comprehensive evaluation
    results = tester.comprehensive_evaluation(X, y, df)
    
    # Create visualizations
    tester.create_visualizations(results, y)
    
    # Generate text report
    tester.generate_report(results)
    
    print("\n" + "=" * 70)
    print("✅ MODEL TESTING COMPLETED!")
    print("=" * 70)
    print(f"\n🎯 FINAL VERDICT: {results['accuracy']:.1%} Accuracy")
    
    if results['accuracy'] >= 0.90:
        print("✅ Model is PRODUCTION READY! 🎉")
    elif results['accuracy'] >= 0.85:
        print("⚠️  Model is GOOD but could benefit from more training data")
    else:
        print("⚠️  Model needs improvement - collect more diverse data")
    
    print("\n📁 Output files saved in src/exports/")


if __name__ == "__main__":
    import os
    os.makedirs('src/exports', exist_ok=True)
    main()
