#!/usr/bin/env bash
# Setup ML Training Environment

echo "====================================================================="
echo "🚀 ML TRAINING ENVIRONMENT SETUP"
echo "====================================================================="

# Fix NumPy compatibility issue
echo ""
echo "📦 Fixing NumPy compatibility..."
pip install -q "numpy<2" 2>/dev/null || true

# Install required packages if missing
echo "📦 Checking required packages..."
pip install -q scikit-learn joblib pandas supabase 2>/dev/null || true

echo ""
echo "✅ Environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. python3 src/ml/analyze_data_quality.py"
echo "   2. python3 src/ml/fetch_training_data.py"
echo "   3. python3 src/ml/train_random_forest.py"
echo "   4. python3 src/ml/predict_health.py"
echo ""
