# 🔧 ML Integration Fix - Complete Implementation Guide

## 🚨 Problem Identified

**Root Cause:** ML predictions are being stored in a **separate table** (`ml_predictions`) but the website dashboard reads from `sensor_data` table, which doesn't have ML columns.

### Current (Broken) Flow:
```
Raspberry Pi Collector
    ↓
  ML Prediction
    ↓
 ┌─────────────────────────┐
 │  ml_predictions table   │ ← Predictions stored here
 └─────────────────────────┘
    
 ┌─────────────────────────┐
 │  sensor_data table      │ ← NO ML DATA!
 └─────────────────────────┘
    ↓
Website Dashboard
    ❌ No ML health score displayed!
```

### Fixed Flow:
```
Raspberry Pi Collector
    ↓
  ML Prediction
    ↓
Attach ML fields to sensor readings
    ↓
 ┌─────────────────────────┐
 │  sensor_data table      │ ← ML DATA INCLUDED! ✅
 │  - ml_health_score      │
 │  - ml_status            │
 │  - ml_alerts            │
 │  - ml_confidence        │
 └─────────────────────────┘
    ↓
Website Dashboard
    ✅ ML health score displayed!
```

---

## 📋 Implementation Steps (20 minutes total)

### Step 1: Add ML Columns to Database (5 minutes)

1. **Open Supabase Dashboard** → SQL Editor
2. **Run this SQL** (copy and paste entire script):

```sql
-- Add ML columns to sensor_data table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sensor_data' AND column_name = 'ml_health_score'
    ) THEN
        ALTER TABLE sensor_data ADD COLUMN ml_health_score REAL;
        RAISE NOTICE '✅ Added ml_health_score column to sensor_data';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sensor_data' AND column_name = 'ml_status'
    ) THEN
        ALTER TABLE sensor_data ADD COLUMN ml_status TEXT;
        RAISE NOTICE '✅ Added ml_status column to sensor_data';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sensor_data' AND column_name = 'ml_alerts'
    ) THEN
        ALTER TABLE sensor_data ADD COLUMN ml_alerts JSONB;
        RAISE NOTICE '✅ Added ml_alerts column to sensor_data';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sensor_data' AND column_name = 'ml_confidence'
    ) THEN
        ALTER TABLE sensor_data ADD COLUMN ml_confidence REAL;
        RAISE NOTICE '✅ Added ml_confidence column to sensor_data';
    END IF;
END $$;

-- Add ML columns to sensor_data_realtime table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sensor_data_realtime' AND column_name = 'ml_health_score'
    ) THEN
        ALTER TABLE sensor_data_realtime ADD COLUMN ml_health_score REAL;
        RAISE NOTICE '✅ Added ml_health_score column to sensor_data_realtime';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sensor_data_realtime' AND column_name = 'ml_status'
    ) THEN
        ALTER TABLE sensor_data_realtime ADD COLUMN ml_status TEXT;
        RAISE NOTICE '✅ Added ml_status column to sensor_data_realtime';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sensor_data_realtime' AND column_name = 'ml_alerts'
    ) THEN
        ALTER TABLE sensor_data_realtime ADD COLUMN ml_alerts JSONB;
        RAISE NOTICE '✅ Added ml_alerts column to sensor_data_realtime';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sensor_data_realtime' AND column_name = 'ml_confidence'
    ) THEN
        ALTER TABLE sensor_data_realtime ADD COLUMN ml_confidence REAL;
        RAISE NOTICE '✅ Added ml_confidence column to sensor_data_realtime';
    END IF;
END $$;
```

3. **Verify** you see success messages for 8 columns

---

### Step 2: Create ML Utility File (2 minutes)

Create file: `src/ml_health_utils.py`

```python
#!/usr/bin/env python3
"""ML Health Utilities - Helper functions for ML prediction conversions"""

def prediction_to_health_score(predicted_status_int):
    """Convert ML prediction (0-3) to health score (0-100)"""
    health_score_map = {
        0: 95.0,  # NORMAL
        1: 70.0,  # ADVISORY
        2: 45.0,  # WARNING
        3: 20.0   # CRITICAL
    }
    return health_score_map.get(predicted_status_int, 50.0)

def extract_ml_fields_from_prediction(prediction_result):
    """Extract ML fields from prediction result for database storage"""
    if not prediction_result:
        return {
            'ml_health_score': None,
            'ml_status': None,
            'ml_alerts': None,
            'ml_confidence': None
        }
    
    predicted_health_status = prediction_result.get('predicted_health_status', 0)
    ml_health_score = prediction_to_health_score(predicted_health_status)
    ml_status = prediction_result.get('predicted_status', 'UNKNOWN')
    ml_alerts = prediction_result.get('recommended_actions', [])
    confidence = prediction_result.get('confidence_score', 0)
    ml_confidence = confidence / 100.0 if confidence > 1 else confidence
    
    return {
        'ml_health_score': float(ml_health_score),
        'ml_status': ml_status,
        'ml_alerts': ml_alerts,
        'ml_confidence': float(ml_confidence)
    }
```

---

### Step 3: Update supabase_direct_storage.py (5 minutes)

**File:** `src/supabase_direct_storage.py`

**Change 1 - In `store_sensor_data_batch()` around line 170:**

FIND this section:
```python
                    # ML Training (1)
                    'health_status': reading.get('health_status', 0),
                    
                    # Metadata
                    'data_quality_score': reading.get('data_quality', 90),
```

REPLACE WITH:
```python
                    # ML Training (1)
                    'health_status': reading.get('health_status', 0),
                    
                    # ML Predictions (from Random Forest model)
                    'ml_health_score': reading.get('ml_health_score'),
                    'ml_status': reading.get('ml_status'),
                    'ml_alerts': reading.get('ml_alerts'),
                    'ml_confidence': reading.get('ml_confidence'),
                    
                    # Metadata
                    'data_quality_score': reading.get('data_quality', 90),
```

**Change 2 - In `update_realtime_data()` around line 235:**

FIND this section:
```python
                'health_status': latest_reading.get('health_status', 0),
                'engine_stress_score': latest_reading.get('engine_stress_score', 0),
                'data_quality_score': latest_reading.get('data_quality', 90)
            }
```

REPLACE WITH:
```python
                'health_status': latest_reading.get('health_status', 0),
                'engine_stress_score': latest_reading.get('engine_stress_score', 0),
                'data_quality_score': latest_reading.get('data_quality', 90),
                
                # ML Predictions
                'ml_health_score': latest_reading.get('ml_health_score'),
                'ml_status': latest_reading.get('ml_status'),
                'ml_alerts': latest_reading.get('ml_alerts'),
                'ml_confidence': latest_reading.get('ml_confidence')
            }
```

---

### Step 4: Update cloud_collector_daemon_pro.py (8 minutes)

**File:** `src/cloud_collector_daemon_pro.py`

**Change 1 - Add import at top (around line 23):**

FIND:
```python
try:
    from ml_predictor import get_ml_predictor
    from ml_storage import extend_supabase_storage_with_ml
    ML_AVAILABLE = True
```

REPLACE WITH:
```python
try:
    from ml_predictor import get_ml_predictor
    from ml_storage import extend_supabase_storage_with_ml
    from ml_health_utils import extract_ml_fields_from_prediction
    ML_AVAILABLE = True
```

**Change 2 - Update `upload_batch_to_cloud()` (around line 590-620):**

FIND the ML prediction section that looks like this:
```python
                # Run ML prediction every Nth batch
                if should_run_ml and self.ml_predictor and self.ml_predictor.is_loaded and self.ml_storage:
                    try:
                        latest_reading = batch_data[-1]
                        prediction = self.ml_predictor.predict(latest_reading)
                        
                        if prediction:
                            sensor_data_id = None
                            ml_success = self.ml_storage.store_prediction(...)
                            if ml_success:
                                logger.info(f"🤖 ML Prediction: ...")
                    except Exception as e:
                        logger.error(f"❌ ML prediction error: {e}")

                self.data_buffer.clear()
```

REPLACE WITH:
```python
                # Run ML prediction BEFORE storing (attach to readings)
                if should_run_ml and self.ml_predictor and self.ml_predictor.is_loaded:
                    try:
                        latest_reading = batch_data[-1]
                        prediction = self.ml_predictor.predict(latest_reading)
                        
                        if prediction:
                            # Extract ML fields for database storage
                            ml_fields = extract_ml_fields_from_prediction(prediction)
                            
                            # Attach ML fields to ALL readings in this batch
                            for reading in batch_data:
                                reading.update(ml_fields)
                            
                            logger.info(f"🤖 ML Prediction: {ml_fields['ml_status']} "
                                      f"(score: {ml_fields['ml_health_score']}/100, "
                                      f"confidence: {ml_fields['ml_confidence']*100:.1f}%)")
                            
                            # ALSO store to ml_predictions table (for historical analysis)
                            if self.ml_storage:
                                self.ml_storage.store_prediction(
                                    self.current_vehicle_id, None, prediction
                                )
                    except Exception as e:
                        logger.error(f"❌ ML prediction error: {e}")

                self.data_buffer.clear()
```

---

### Step 5: Restart & Verify (5 minutes)

1. **Restart Raspberry Pi Collector:**
```bash
cd /home/rocketeers/vehicle_diagnostic_system/src
python3 cloud_collector_daemon_pro.py
```

2. **Watch for these logs:**
```
🤖 ML Predictor loaded (Accuracy: 94.XX%)
🤖 ML Prediction: NORMAL (score: 95.0/100, confidence: 87.3%)
💾 Batch stored: 3/3 records
```

3. **Check Supabase data:**
```sql
SELECT ml_health_score, ml_status, ml_confidence 
FROM sensor_data 
ORDER BY timestamp DESC 
LIMIT 1;
```

4. **Open website dashboard** - Should show health score!

---

## ✅ Success Criteria

- ✅ Supabase `sensor_data` table has ML columns with data
- ✅ RPI logs show ML predictions with score
- ✅ Website dashboard displays health score number (not "N/A")
- ✅ Browser console shows `hasMLData: true`

---

## 🐛 Troubleshooting

### Website shows "N/A"
- Clear browser cache (Ctrl+Shift+R)
- Verify SQL migration ran successfully
- Check RPI is running updated code

### ModuleNotFoundError: ml_health_utils
- Verify `src/ml_health_utils.py` exists
- Restart RPI collector

### ML columns are NULL
- Verify code changes applied correctly
- Check ML predictor loading in logs
- Wait ~9 seconds for first prediction

---

**Last Updated:** November 12, 2025
