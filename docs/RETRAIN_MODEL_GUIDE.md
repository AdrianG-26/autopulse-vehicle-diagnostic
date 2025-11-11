# Model Retraining Guide

## 📍 Model Location

Your trained model files are stored in:

```text
~/vehicle_diagnostic_system/models/
├── vehicle_health_rf_model_4class.pkl    (3.5 MB) - Main model
├── scaler_4class.pkl                      (2.0 KB) - Feature scaler
└── model_metadata_4class.json            (1.2 KB) - Metadata
```

---

## 🔄 How to Retrain with New Data

### Tomorrow's Simple 3-Step Process

After collecting WARNING/CRITICAL data, just run:

```bash
cd ~/vehicle_diagnostic_system

# Step 1: Fetch new data from Supabase
python3 src/ml/fetch_training_data.py

# Step 2: Train new model (overwrites old one)
python3 src/ml/train_random_forest.py

# Step 3: Test predictions
python3 src/ml/predict_health.py
```

**That's it!** Takes ~3-5 minutes total.

---

## 🎯 Data Collection Tips for Tomorrow

### WARNING Samples (need ≥2, aim for 50-100)

- Low fuel level (<10%)
- Slightly high coolant temp (95-100°C)
- Battery voltage 11.5-12V
- Moderate engine stress conditions

### CRITICAL Samples (already have 705, but more helps)

- Very high coolant temp (>100°C) - **BE CAREFUL!**
- Very low battery (<11V)
- Heavy load + high RPM for extended periods
- Active DTCs/check engine light

**Safety Tips:**

- ⚠️ Don't damage your engine - monitor temperature closely
- Have coolant/water ready if testing high temps
- Don't let battery die completely
- Test in safe, controlled environment

---

## 📊 Expected Results

### Current Model (3-class)

```text
NORMAL:    6,474 samples (79.7%)
ADVISORY:    946 samples (11.6%)
WARNING:       1 sample  ( 0.0%) ← EXCLUDED
CRITICAL:    705 samples ( 8.7%)

Accuracy: 95.63%
```

### After Tomorrow (4-class)

```text
NORMAL:    6,500+ samples (70-75%)
ADVISORY:  1,000+ samples (10-12%)
WARNING:     100+ samples ( 1-3%)  ← NEW!
CRITICAL:    800+ samples (10-12%)

Expected Accuracy: 96-98%
```

---

## 💾 Backup Current Model (Recommended!)

Before retraining, backup your current 95.63% accurate model:

```bash
# Create backup directory
mkdir -p ~/vehicle_diagnostic_system/models/backups

# Backup current model
cp ~/vehicle_diagnostic_system/models/vehicle_health_rf_model_4class.pkl \
   ~/vehicle_diagnostic_system/models/backups/model_3class_$(date +%Y%m%d).pkl

cp ~/vehicle_diagnostic_system/models/scaler_4class.pkl \
   ~/vehicle_diagnostic_system/models/backups/scaler_3class_$(date +%Y%m%d).pkl

cp ~/vehicle_diagnostic_system/models/model_metadata_4class.json \
   ~/vehicle_diagnostic_system/models/backups/metadata_3class_$(date +%Y%m%d).json

echo "✅ Backed up current model!"
```

---

## 🔍 Verify New Data Uploaded

Before retraining, check that your new data is in Supabase:

```bash
python3 -c "
from supabase import create_client
from collections import Counter

SUPABASE_URL = 'https://qimiewqthuhmofjhzrrb.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpbWlld3F0aHVobW9mamh6cnJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Mjc5MTMsImV4cCI6MjA3MTEwMzkxM30.jHY0m_l-uvwaZd-x9POEpLdoP__oLUdE-7U-E5mZqz0'

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Get all health status
response = supabase.table('sensor_data').select('health_status').execute()
counts = Counter([r['health_status'] for r in response.data])

status_names = {0: 'NORMAL', 1: 'ADVISORY', 2: 'WARNING', 3: 'CRITICAL'}
print(f'Total records: {len(response.data):,}')
print('\\nClass distribution:')
for status in sorted(counts.keys()):
    name = status_names.get(status, f'Unknown({status})')
    print(f'  {name:12s}: {counts[status]:>6,}')
"
```

---

## 🚀 Quick Retrain Script (All-in-One)

Create this convenience script:

```bash
cat > ~/vehicle_diagnostic_system/retrain_model.sh << 'SCRIPTEND'
#!/bin/bash
# Quick retrain script

echo "======================================"
echo "🔄 MODEL RETRAINING PIPELINE"
echo "======================================"

cd ~/vehicle_diagnostic_system

# Backup current model
echo ""
echo "📦 Backing up current model..."
mkdir -p models/backups
cp models/vehicle_health_rf_model_4class.pkl \
   models/backups/model_$(date +%Y%m%d_%H%M%S).pkl
cp models/scaler_4class.pkl \
   models/backups/scaler_$(date +%Y%m%d_%H%M%S).pkl
echo "✅ Backup complete"

# Fetch latest data
echo ""
echo "📥 Fetching latest data from Supabase..."
python3 src/ml/fetch_training_data.py

# Train new model
echo ""
echo "🤖 Training new model..."
python3 src/ml/train_random_forest.py

# Test predictions
echo ""
echo "🔮 Testing predictions..."
python3 src/ml/predict_health.py

echo ""
echo "======================================"
echo "✅ RETRAINING COMPLETE!"
echo "======================================"
SCRIPTEND

chmod +x ~/vehicle_diagnostic_system/retrain_model.sh
echo "✅ Created retrain_model.sh"
```

Then just run:

```bash
./retrain_model.sh
```

---

## ✅ Validation Checklist

After retraining, verify:

### 1. Overall Accuracy

- ✅ Should be **≥95%** (ideally 96-98%)

### 2. Critical Safety Check

```text
CRITICAL → NORMAL errors = 0  (must be zero!)
WARNING  → NORMAL errors = 0  (should be zero)
```

### 3. Class Distribution

- ✅ All 4 classes present (NORMAL, ADVISORY, WARNING, CRITICAL)
- ✅ WARNING has ≥2 samples (ideally 50+)

### 4. Per-Class Performance

- ✅ Precision >75% for all classes
- ✅ Recall >90% for all classes
- ✅ F1-Score >85% for all classes

---

## 🎓 For Your Thesis

**Before & After Comparison:**

| Metric            | Before (3-class)         | After (4-class)   |
| ----------------- | ------------------------ | ----------------- |
| Classes           | NORMAL/ADVISORY/CRITICAL | All 4 classes     |
| Samples           | 8,125                    | 8,300+ (estimate) |
| Accuracy          | 95.63%                   | 96-98% (expected) |
| WARNING Detection | ❌ Excluded (n=1)        | ✅ Enabled        |
| Status            | Partial spectrum         | Full spectrum     |

This demonstrates:

- **Iterative improvement** with more data
- **Scalability** of the approach
- **Adaptive classification** in action
- **Production readiness** (easy retraining)

---

## ❓ FAQ

**Q: Will retraining delete my old model?**  
A: Yes, unless you back it up first. Use the backup commands above!

**Q: How long does retraining take?**  
A: About 3-5 minutes total for all 3 steps.

**Q: What if accuracy drops?**  
A: Collect more WARNING samples (need 100+ for good performance) or tune hyperparameters.

**Q: Can I retrain multiple times?**  
A: Yes! Retrain whenever you have significant new data.

**Q: Will my mobile app use the new model automatically?**  
A: If it loads from the same file path (`models/vehicle_health_rf_model_4class.pkl`), yes!

---

**Ready to retrain tomorrow!** 🚀

Just remember:

1. Collect WARNING/CRITICAL data (safely!)
2. Wait for Supabase sync (~5 min)
3. Run 3 commands (or use retrain_model.sh)
4. Validate accuracy ≥95%
5. Done!

**Questions?** Ask anytime! 💡
