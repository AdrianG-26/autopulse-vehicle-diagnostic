# 🚀 Data Migration & Real-Time Sync Guide

## Current Situation

✅ **What's Working:**
- Cloud collector daemon (`cloud_collector_daemon.py`) 
- Supabase storage module (`supabase_direct_storage.py`)
- Real-time batch uploading (every 20 readings)
- Automatic table updates (telemetry_data, sensor_data_realtime, sensor_data)

⚠️ **What Needs Action:**
- **61,063 rows** of existing data in local SQLite
- Data stored in: `src/data/vehicle_data.db` and `backend/data/vehicle_data.db`

---

## 📊 Code Analysis Results

### ✅ Upload Logic is Already Connected!

The code is **properly configured** for real-time uploads:

1. **Data Collection** (`cloud_collector_daemon.py`)
   - Reads OBD data every 2 seconds
   - Buffers data in memory (max 100 readings)
   - Uploads batch when buffer reaches 20 readings

2. **Batch Upload** (`upload_batch_to_cloud()`)
   - Calls `supabase_storage.store_sensor_data_batch()`
   - Clears buffer after successful upload
   - Logs upload status

3. **Supabase Storage** (`supabase_direct_storage.py`)
   - `store_sensor_data_batch()` - Inserts multiple readings at once
   - `update_realtime_data()` - Updates latest reading for dashboard
   - `update_vehicle_statistics()` - Updates vehicle stats

### 📝 Data Flow (Already Implemented)

```
OBD-II → cloud_collector_daemon.py
          ↓
       Buffer (20 readings)
          ↓
     upload_batch_to_cloud()
          ↓
  supabase_direct_storage.py
          ↓
    ┌─────────────────────┐
    │                     │
    ↓                     ↓
telemetry_data    sensor_data_realtime
(historical)          (latest)
    ↓                     ↓
sensor_data         sensor_data_realtime
    ↓                     ↓
vehicle_statistics  vehicle_latest_data
    (view)              (view)
```

---

## 🎯 Two Options

### Option 1: Migrate Existing Data (Recommended)

Upload all 61,063 rows from local database to Supabase:

```bash
python3 migrate_local_to_supabase.py
```

This will:
- ✅ Migrate all vehicle profiles
- ✅ Upload all historical sensor data (in batches of 500)
- ✅ Update vehicle statistics
- ⏱️ Takes ~15-30 minutes depending on internet speed

### Option 2: Start Fresh (Only New Data)

Start the collector daemon to only upload new OBD readings:

```bash
# Connect OBD-II to your car first!
python3 backend/cloud_collector_daemon.py
```

This will:
- ✅ Create new vehicle profile (or use existing)
- ✅ Upload OBD data in real-time (every 20 readings)
- ✅ Update dashboard automatically
- ⚠️ Old data stays in local SQLite only

---

## 🚀 Recommended Workflow

### Step 1: Migrate Historical Data
```bash
cd ~/vehicle_diagnostic_system
python3 migrate_local_to_supabase.py
```

### Step 2: Start Real-Time Collector
```bash
# Connect your OBD-II adapter to the car
python3 backend/cloud_collector_daemon.py
```

### Step 3: Monitor in Real-Time
```bash
# Watch logs
tail -f logs/collector_daemon.log

# Or check Supabase dashboard
# https://supabase.com/dashboard/project/qimiewqthuhmofjhzrrb/editor
```

---

## 📊 Migration Progress Indicators

The migration script shows:
- ✅ Vehicle profiles migrated
- 📊 Current vehicle being processed
- 📁 Current session being uploaded
- ⚡ Batch upload progress
- 🎉 Total rows migrated

Example output:
```
🚗 Migrating data for vehicle ID 1 -> 8...
   Rows: 25,000
   📁 Session cloud_20250907_123456: 25,000 rows
      ✅ Batch 1: 500 rows (500/25,000)
      ✅ Batch 2: 500 rows (1,000/25,000)
      ...
```

---

## ⚙️ Configuration

Current settings in `cloud_collector_daemon.py`:

```python
batch_size = 20          # Upload after 20 readings
collection_interval = 2.0  # Read OBD every 2 seconds
buffer_size = 100        # Max 100 readings in memory
```

Current settings in `supabase_direct_storage.py`:

```python
batch_size = 50  # Insert up to 50 rows per Supabase call
```

You can adjust these for performance!

---

## 🔍 Verify Everything is Working

After migration, check:

```bash
python3 << 'EOF'
from dotenv import load_dotenv
import os
load_dotenv('src/.env', override=True)
from supabase import create_client

supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))

# Count migrated data
result = supabase.table('telemetry_data').select('*', count='exact').execute()
print(f"📊 Telemetry data: {result.count} rows")

result = supabase.table('vehicle_profiles').select('*', count='exact').execute()
print(f"🚗 Vehicle profiles: {result.count} rows")

result = supabase.table('sensor_data').select('*', count='exact').execute()
print(f"📈 Sensor data: {result.count} rows")
EOF
```

---

## ✅ Summary

**Your code is already properly connected for real-time uploads!**

- ✅ Logic is implemented
- ✅ Batch uploading configured
- ✅ Real-time updates enabled
- ⚠️ Just need to migrate historical data

**Next step:** Run `python3 migrate_local_to_supabase.py`
