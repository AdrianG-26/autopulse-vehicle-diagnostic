# 🚗 AutoPulse Vehicle Diagnostic System - Quick Reference Guide

> **Cloud-based ML vehicle health monitoring with real-time predictions**
>
> Version 4.0.0 | Updated November 10, 2025

---

## ⚡ QUICK START (New Users Start Here!)

**🚀 Fastest Way to Get Started:**

```bash
# 1. Start the data collector (terminal 1)
cd /Users/adriangalvez/Thesis/autopulse-vehicle-diagnostic/src
python3 cloud_collector_daemon_pro.py

# 2. That's it! System automatically:
✅ Detects OBD connection
✅ Identifies your vehicle
✅ Collects sensor data (30+ parameters)
✅ Runs ML predictions (NORMAL/ADVISORY/WARNING/CRITICAL)
✅ Stores to Supabase cloud database
```

**What you need:**

- 🔑 Car ignition ON
- 🔌 OBD-II adapter connected
- 📡 Internet connection (for Supabase)

---

## 📚 Table of Contents

1. [Quick Start](#-quick-start-new-users-start-here)
2. [System Architecture](#️-system-architecture)
3. [Data Collection](#-data-collection)
4. [Machine Learning Pipeline](#-machine-learning-pipeline)
5. [Cloud Database (Supabase)](#️-cloud-database-supabase)
6. [OBD-II Adapter Setup](#-obd-ii-adapter-setup)
7. [Troubleshooting](#-troubleshooting)
8. [Command Reference](#-command-reference)

---

## 🏗️ System Architecture

### Current System Components

```text
┌──────────────────────────────────────────────────────────┐
│ Raspberry Pi + OBD-II Scanner                            │
│   └─ cloud_collector_daemon_pro.py                       │
│      • Reads 30+ OBD sensors every 1 second              │
│      • Calculates 3 real-time features                   │
│      • Auto-labels health status (stress scoring)        │
│      • Runs ML predictions every 9 seconds               │
└──────────────────┬───────────────────────────────────────┘
                   │
                   ↓
┌──────────────────────────────────────────────────────────┐
│ Supabase Cloud Database (PostgreSQL)                     │
│   • sensor_data (historical time-series)                 │
│   • sensor_data_realtime (latest readings)               │
│   • ml_predictions (health predictions)                  │
│   • vehicles (car profiles)                              │
└──────────────────┬───────────────────────────────────────┘
                   │
                   ↓
┌──────────────────────────────────────────────────────────┐
│ Machine Learning (Random Forest)                         │
│   • 38 features (28 raw + 10 engineered)                 │
│   • 4-class classification (NORMAL/ADVISORY/WARNING/     │
│     CRITICAL)                                            │
│   • 94-96% accuracy                                      │
│   • <15ms prediction latency                             │
└──────────────────────────────────────────────────────────┘
```

### Key Features

- ✅ **Cloud-First**: All data stored in Supabase (no local SQLite)
- ✅ **Real-Time ML**: Predictions every 9 seconds during driving
- ✅ **Auto-Labeling**: Health status computed using 9-factor stress scoring
- ✅ **Multi-Vehicle**: Supports unlimited vehicles with automatic detection
- ✅ **Production-Ready**: Runs 24/7 with auto-reconnect

---

## 📊 Data Collection

### Main Data Collector Script

**File**: `src/cloud_collector_daemon_pro.py`

**Start Collection:**

```bash
cd /Users/adriangalvez/Thesis/autopulse-vehicle-diagnostic/src
python3 cloud_collector_daemon_pro.py
```

**What It Does:**

1. **Connects to OBD-II** (Bluetooth `/dev/rfcomm0` or USB `/dev/ttyUSB*`)
2. **Detects Vehicle** (VIN or ECU fingerprint)
3. **Collects Data** (30+ sensors every 1 second)
4. **Calculates Features**:
   - Load/RPM ratio (engine efficiency)
   - Temperature gradient (overheating detection)
   - Fuel efficiency (L/100km)
5. **Auto-Labels Health** (stress scoring algorithm)
6. **Uploads to Cloud** (batches of 3 readings)
7. **Runs ML Predictions** (every 3rd batch)

### 30+ OBD-II Parameters Collected

**Core Engine (8):**

- RPM, Speed, Coolant Temp, Engine Load
- Intake Temp, Timing Advance, Run Time, Absolute Load

**Fuel System (7):**

- Fuel Level, Fuel Pressure, Throttle Position
- Short/Long Fuel Trim (Bank 1 & 2)

**Air Intake (3):**

- MAF (Mass Air Flow), Intake Pressure, Barometric Pressure

**Emissions (3):**

- O2 Sensors (B1S1, B1S2), Catalyst Temperature

**Electrical (1):**

- Control Module Voltage (battery health)

**Diagnostics (5):**

- DTC Count, MIL Status, Distance with MIL
- Fuel Status, Ambient Air Temp

### Live Monitoring

**Terminal Output:**

```text
📊 LIVE CLOUD DATA COLLECTION ACTIVE
======================================================================
#      RPM     Temp    Load   Speed   Status      Quality
----------------------------------------------------------------------
    1:    750    85.0°C  28.5%   0.0    🟢NORMAL     0.85
    2:   1200    87.2°C  35.1%  15.3    🟢NORMAL     0.88
    3:   2500    92.5°C  52.3%  45.7    ⚠️ADVISORY    0.92
```

**Log Files:**

```bash
# View real-time logs
tail -f logs/cloud_collector.log

# Check statistics
grep "Batch stored" logs/cloud_collector.log | wc -l  # Total batches
```

---

## 🤖 Machine Learning Pipeline

### Model Architecture

**Type**: Random Forest Classifier (200 trees)
**Classes**: 4 (NORMAL / ADVISORY / WARNING / CRITICAL)
**Accuracy**: 94-96%
**Features**: 38 total

### Training Workflow

#### Step 1: Analyze Data Quality

```bash
cd /Users/adriangalvez/Thesis/autopulse-vehicle-diagnostic/src/ml
python3 analyze_data_quality.py
```

**Output:**

- Total records in Supabase
- NULL value distribution
- Health status distribution
- Recommendations for training

#### Step 2: Fetch & Clean Training Data

```bash
python3 fetch_training_data.py
```

**What it does:**

- Downloads all sensor data from Supabase
- Filters records with ≤2 NULL values
- Saves to `data/ml/clean_training_data.csv`
- Typically keeps 70-80% of raw data

#### Step 3: Train Random Forest Model

```bash
python3 train_random_forest.py
```

**Process:**

1. Load clean data
2. Engineer 7 additional features
3. Split 80/20 train/test
4. Scale features (StandardScaler)
5. Train Random Forest (200 trees)
6. Evaluate performance
7. Save model files:
   - `models/vehicle_health_rf_model_4class.pkl`
   - `models/scaler_4class.pkl`
   - `models/model_metadata_4class.json`

#### Step 4: Test Predictions

```bash
python3 predict_health.py
```

**Shows:**

- Latest sensor readings
- ML prediction (NORMAL/ADVISORY/WARNING/CRITICAL)
- Confidence score
- Probability distribution
- Recommended actions

### Feature Engineering

**Real-Time Features (3)** - calculated during collection:

1. **load_rpm_ratio**: Engine efficiency metric
2. **temp_gradient**: Overheating detection (°C/min)
3. **fuel_efficiency**: Real consumption (L/100km)

**Training Features (7)** - calculated during model training: 4. **rpm_load_ratio**: Inverse efficiency 5. **temp_efficiency**: Load vs temperature 6. **speed_throttle_ratio**: Throttle efficiency 7. **high_rpm**: Binary flag (>3000 RPM) 8. **low_speed**: Binary flag (<20 km/h) 9. **high_throttle**: Binary flag (>70%) 10. **voltage_health**: Binary flag (12.5-14.5V)

**Total**: 28 raw OBD + 10 engineered = **38 features**

### Health Status Scoring

**Multi-Factor Stress Algorithm** (9 factors, 0-15 points):

1. **Engine Load** (0-3 pts) - Primary indicator
2. **RPM vs Load Mismatch** (0-2 pts) - Inefficiency
3. **Temperature Stress** (0-3 pts) - Overheating
4. **Voltage Issues** (0-2 pts) - Electrical health
5. **Fuel Trim** (0-2 pts) - Combustion efficiency
6. **O2 Sensor** (0-1 pt) - Emissions
7. **Diagnostic Codes** (0-2 pts) - DTCs
8. **Check Engine Light** (0-2 pts) - MIL status
9. **Distance with MIL** (0-1 pt) - Ignored warnings

**Classification:**

- **NORMAL** (0-2 points): Healthy operation
- **ADVISORY** (3-5 points): Monitor closely
- **WARNING** (6-9 points): Attention needed
- **CRITICAL** (10+ points or override): Immediate action

**Critical Overrides** (bypass scoring):

- Coolant temp > 110°C
- Voltage < 11V
- DTC count > 10
- Engine load > 95%

---

## ☁️ Cloud Database (Supabase)

### Connection Info

**URL**: `https://qimiewqthuhmofjhzrrb.supabase.co`
**Database**: PostgreSQL (cloud-hosted)

### Tables

#### 1. `sensor_data` - Historical Time-Series

- All sensor readings (every 1 second)
- 30+ columns for OBD parameters
- Auto-labeled health_status
- Timestamp indexed for fast queries

#### 2. `sensor_data_realtime` - Latest Snapshot

- One row per vehicle
- Updated every batch (3 seconds)
- Used for dashboard live view

#### 3. `ml_predictions` - Model Predictions

- Prediction results every 9 seconds
- Stores confidence scores
- Links to sensor_data records

#### 4. `vehicles` - Car Profiles

- Vehicle identification
- Make, model, year
- VIN or ECU signature

### Manual Queries

**Python:**

```python
from supabase import create_client

SUPABASE_URL = "https://qimiewqthuhmofjhzrrb.supabase.co"
SUPABASE_KEY = "your_key_here"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Get latest 10 readings
response = supabase.table('sensor_data') \
    .select('*') \
    .order('timestamp', desc=True) \
    .limit(10) \
    .execute()

print(response.data)
```

**Check Scripts:**

```bash
# Verify Supabase connection
cd /Users/adriangalvez/Thesis/autopulse-vehicle-diagnostic/scripts
python3 check_supabase_data.py
```

---

## 🔌 OBD-II Adapter Setup

### Supported Adapters

| Type                 | Connection       | Port                           | Auto-Detect |
| -------------------- | ---------------- | ------------------------------ | ----------- |
| **Bluetooth OBD-II** | ELM327 Bluetooth | `/dev/rfcomm0`                 | ✅ Yes      |
| **USB OBD-II**       | USB serial       | `/dev/ttyUSB*`, `/dev/ttyACM*` | ✅ Yes      |

### Bluetooth Setup (ELM327)

**MAC Address**: `00:1D:A5:68:98:8A`

**One-Time Pairing:**

```bash
# Pair with adapter
sudo bluetoothctl
> scan on
> pair 00:1D:A5:68:98:8A
> trust 00:1D:A5:68:98:8A
> exit

# Create serial port
sudo rfcomm bind 0 00:1D:A5:68:98:8A

# Verify connection
ls -la /dev/rfcomm0
```

**Note**: The collector script auto-reconnects, so you only need to pair once!

### Test OBD Connection

**Quick Test:**

```bash
cd /Users/adriangalvez/Thesis/autopulse-vehicle-diagnostic/src
python3 -c "
import obd
conn = obd.OBD('/dev/rfcomm0')
if conn.is_connected():
    print('✅ OBD Connected!')
    print(f'Protocol: {conn.protocol_name()}')
    print(f'Supported: {len(conn.supported_commands)} commands')
else:
    print('❌ Connection failed')
"
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. No OBD Connection

**Symptoms**: "Could not connect to OBD-II adapter"

**Solutions:**

```bash
# Check if device exists
ls -la /dev/rfcomm0  # Bluetooth
ls -la /dev/ttyUSB*  # USB

# Verify car is ON
# (ignition must be ON, engine running preferred)

# Check Bluetooth connection
sudo rfcomm show

# Rebind if needed
sudo rfcomm release 0
sudo rfcomm bind 0 00:1D:A5:68:98:8A
```

#### 2. Supabase Connection Failed

**Symptoms**: "Error storing sensor data"

**Solutions:**

```bash
# Check internet connection
ping -c 3 google.com

# Verify Supabase credentials in code
# src/supabase_direct_storage.py

# Test connection
cd /Users/adriangalvez/Thesis/autopulse-vehicle-diagnostic/scripts
python3 check_supabase_data.py
```

#### 3. Low Data Quality

**Symptoms**: `data_quality < 0.5`

**Solutions:**

- Ensure car engine is running (not just ignition)
- Check OBD adapter connection is secure
- Try different OBD port (some cars have multiple)
- Verify adapter is ELM327 v1.5 or higher

#### 4. ML Model Not Found

**Symptoms**: "Model not found" or "ML prediction unavailable"

**Solutions:**

```bash
# Check if model files exist
ls -la /Users/adriangalvez/Thesis/autopulse-vehicle-diagnostic/models/

# Should see:
# vehicle_health_rf_model_4class.pkl
# scaler_4class.pkl
# model_metadata_4class.json

# If missing, train model:
cd /Users/adriangalvez/Thesis/autopulse-vehicle-diagnostic/src/ml
python3 train_random_forest.py
```

### Debug Mode

**Enable verbose logging:**

```bash
# Start collector with debug output
cd /Users/adriangalvez/Thesis/autopulse-vehicle-diagnostic/src
python3 cloud_collector_daemon_pro.py 2>&1 | tee debug.log

# Watch logs in real-time
tail -f logs/cloud_collector.log
```

---

## 📋 Command Reference

### Data Collection

```bash
# Start main collector
cd /Users/adriangalvez/Thesis/autopulse-vehicle-diagnostic/src
python3 cloud_collector_daemon_pro.py

# Stop collector (Ctrl+C in terminal)

# View logs
tail -f logs/cloud_collector.log
```

### Machine Learning

```bash
cd /Users/adriangalvez/Thesis/autopulse-vehicle-diagnostic/src/ml

# Analyze data quality
python3 analyze_data_quality.py

# Fetch and clean training data
python3 fetch_training_data.py

# Train model
python3 train_random_forest.py

# Test predictions
python3 predict_health.py
```

### Database Management

```bash
cd /Users/adriangalvez/Thesis/autopulse-vehicle-diagnostic/scripts

# Check Supabase data
python3 check_supabase_data.py

# View vehicle profiles
# (query vehicles table via Supabase dashboard)
```

### System Monitoring

```bash
# View real-time collection
tail -f /Users/adriangalvez/Thesis/autopulse-vehicle-diagnostic/logs/cloud_collector.log

# Count total readings
grep "Batch stored" logs/cloud_collector.log | wc -l

# Check for errors
grep "ERROR" logs/cloud_collector.log

# Monitor system resources
htop  # CPU/Memory
df -h  # Disk space
```

---

## 🎯 Quick Workflows

### Daily Use (Collect Data)

```bash
# 1. Turn on car ignition
# 2. Connect OBD adapter
# 3. Start collector
cd /Users/adriangalvez/Thesis/autopulse-vehicle-diagnostic/src
python3 cloud_collector_daemon_pro.py

# 4. Drive normally - data auto-collects!
# 5. Stop with Ctrl+C when done
```

### Train ML Model (First Time)

```bash
cd /Users/adriangalvez/Thesis/autopulse-vehicle-diagnostic/src/ml

# 1. Analyze what data you have
python3 analyze_data_quality.py

# 2. Fetch and clean data (need 1000+ records)
python3 fetch_training_data.py

# 3. Train model
python3 train_random_forest.py

# 4. Test it
python3 predict_health.py
```

### Retrain Model (After Collecting More Data)

```bash
cd /Users/adriangalvez/Thesis/autopulse-vehicle-diagnostic/src/ml

# 1. Fetch updated data
python3 fetch_training_data.py

# 2. Retrain
python3 train_random_forest.py

# Model automatically updates!
```

### Check System Health

```bash
# 1. Check recent data collection
tail -n 50 /Users/adriangalvez/Thesis/autopulse-vehicle-diagnostic/logs/cloud_collector.log

# 2. Verify Supabase connection
cd /Users/adriangalvez/Thesis/autopulse-vehicle-diagnostic/scripts
python3 check_supabase_data.py

# 3. Test ML predictions
cd /Users/adriangalvez/Thesis/autopulse-vehicle-diagnostic/src/ml
python3 predict_health.py
```

---

## 📊 Understanding Output

### Collection Output

```text
📊 LIVE CLOUD DATA COLLECTION ACTIVE
======================================================================
#      RPM     Temp    Load   Speed   Status      Quality
----------------------------------------------------------------------
    1:    750    85.0°C  28.5%   0.0    🟢NORMAL     0.85
```

**Columns:**

- **#**: Reading number
- **RPM**: Engine revolutions per minute
- **Temp**: Coolant temperature (°C)
- **Load**: Engine load percentage
- **Speed**: Vehicle speed (km/h)
- **Status**: Health status (NORMAL/ADVISORY/WARNING/CRITICAL)
- **Quality**: Data quality score (0.0-1.0)

**Status Icons:**

- 🟢 NORMAL: All systems OK
- ⚠️ ADVISORY: Monitor closely
- 🟠 WARNING: Attention needed
- 🔴 CRITICAL: Immediate action

### ML Prediction Output

```text
🔮 VEHICLE HEALTH PREDICTION
============================================================
📊 CURRENT SENSOR VALUES

   RPM:                1200
   Speed:              45.3 km/h
   Coolant Temp:       92.5 °C
   Engine Load:        52.3 %
   Voltage:            13.8 V

🎯 PREDICTION RESULTS

   Predicted Health Status: ADVISORY
   Confidence:              87.3%

   Probability Distribution:
      NORMAL       9.5%
      ADVISORY     87.3%
      WARNING      2.8%
      CRITICAL     0.4%

💡 INTERPRETATION

   ⚠️ ADVISORY - Vehicle requires attention soon
      • Coolant temperature elevated - check cooling system
      • Schedule inspection within 1-2 weeks
```

---

## 📚 Documentation Files

| File                                | Purpose                           |
| ----------------------------------- | --------------------------------- |
| **ML_SYSTEM_DOCUMENTATION.md**      | Complete ML pipeline explanation  |
| **ENGINE_STRESS_HEALTH_SCORING.md** | Health scoring algorithm details  |
| **CALCULATED_FEATURES_UPDATE.md**   | Feature engineering documentation |
| **4CLASS_MODEL_READY.md**           | Model training results            |
| **CHEAT_SHEET.md**                  | This file - Quick reference       |

---

## 🚀 Best Practices

### Data Collection Best Practices

1. ✅ **Always run with engine ON** (not just ignition)
2. ✅ **Collect during varied driving** (idle, city, highway)
3. ✅ **Monitor data quality** (should be >0.7)
4. ✅ **Check logs regularly** for errors
5. ✅ **Ensure stable internet** for Supabase uploads

### Machine Learning Best Practices

1. ✅ **Collect 1000+ records** before first training
2. ✅ **Retrain after 500+ new records** for better accuracy
3. ✅ **Verify class distribution** (70% NORMAL, 30% others)
4. ✅ **Monitor prediction confidence** (should be >80%)
5. ✅ **Save model versions** before retraining

### System Maintenance

1. ✅ **Monitor disk space** (logs can grow)
2. ✅ **Backup model files** regularly
3. ✅ **Check Supabase storage** (free tier limits)
4. ✅ **Update dependencies** periodically
5. ✅ **Test OBD connection** before long drives

---

**🎊 AutoPulse Vehicle Diagnostic System v4.0**  
**Cloud-based ML health monitoring with 94-96% accuracy**

_Last Updated: November 10, 2025_  
_System Status: ✅ Production Ready_

---


nmcli device status
sudo nmcli device wifi connect "ZTEMU5002AD" password "AdrianGalvez_2025"
sudo nmcli device wifi connect "jologs" password "watermelon#12"
sudo nmcli device wifi connect "WIFI NI BRIAN" password "Brianronnie2019!"