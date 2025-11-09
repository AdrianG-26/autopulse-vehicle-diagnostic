# Machine Learning Setup Instructions

## Problem
The ML Health Card shows "Disconnected" because ML prediction columns don't exist in the database or the Raspberry Pi isn't writing ML predictions.

## Solution Steps

### Step 1: Add ML Columns to Supabase Database

1. Open your **Supabase SQL Editor**
2. Run the SQL script: `website/ADD_ML_COLUMNS.sql`
3. This will add these columns to `sensor_data` table:
   - `ml_health_score` (REAL) - Health score 0-100
   - `ml_status` (TEXT) - Status: NORMAL, ADVISORY, WARNING, CRITICAL
   - `ml_alerts` (JSONB) - Array of alert messages
   - `ml_confidence` (REAL) - Confidence score 0-1

### Step 2: Update Raspberry Pi Collector to Write ML Predictions

The Raspberry Pi collector (`backend/automated_car_collector_daemon.py`) currently:
- ✅ Collects sensor data
- ✅ Calculates ML features
- ❌ **Does NOT generate or store ML predictions**

**You need to modify the collector to:**
1. Load the Random Forest ML model
2. Generate predictions for each sensor reading
3. Store predictions in the `ml_health_score`, `ml_status`, `ml_alerts`, `ml_confidence` columns

### Step 3: Verify ML Columns Exist

Run this SQL query in Supabase to check:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sensor_data' 
  AND column_name LIKE 'ml_%'
ORDER BY column_name;
```

### Step 4: Check if Data is Being Written

Run this SQL query to see if ML predictions are being stored:
```sql
SELECT 
    timestamp,
    ml_health_score,
    ml_status,
    ml_confidence,
    health_status
FROM sensor_data
ORDER BY timestamp DESC
LIMIT 10;
```

## Temporary Workaround

The website now uses `health_status` as a fallback:
- If `ml_health_score` is missing, it uses `health_status` to calculate a score
- `health_status = 0` → Health Score: 90 (NORMAL)
- `health_status = 1` → Health Score: 70 (ADVISORY)
- `health_status = 2` → Health Score: 50 (WARNING)
- `health_status = 3` → Health Score: 30 (CRITICAL)

However, for full ML functionality, you need to:
1. Add the ML columns (Step 1)
2. Update the Raspberry Pi to write ML predictions (Step 2)

## Debugging

Check the browser console for:
- `⚠️ ML Health Score is missing!` - ML columns don't exist or aren't being written
- `🤖 MLHealthCard - Updating ML data:` - Shows what ML data is being received
- `📊 Raw sensor data from Supabase:` - Shows raw database values

