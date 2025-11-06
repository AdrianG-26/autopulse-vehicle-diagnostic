# Vehicle Diagnostic System - Source Code

## 🎯 Essential Python Modules

This directory contains only the **core essential** Python modules needed for the vehicle diagnostic system to function.

### Core Modules (4 files)

1. **`automated_car_collector_daemon.py`** (76KB)

   - Main data collection daemon
   - Handles OBD-II connection and continuous data collection
   - Professional logging and error handling
   - Intelligent car signature recognition
   - Real-time health monitoring

2. **`enhanced_database.py`** (48KB)

   - Core database management system
   - SQLite database operations with connection pooling
   - Data validation and integrity checks
   - Car profile management
   - Advanced analytics and reporting

3. **`bluetooth_obd_manager.py`** (7.1KB)

   - Bluetooth OBD-II adapter connection manager
   - Automatic RFCOMM binding
   - Connection status monitoring
   - Pairing verification

4. **`random_forest_trainer.py`** (21KB)
   - Machine learning model trainer
   - Random Forest classifier for maintenance prediction
   - Feature engineering and importance analysis
   - Model evaluation and cross-validation

## 📦 Archived Utilities

Non-essential scripts have been moved to archive directories but are still available if needed:

### `archive_utils/` - Utility Scripts

- `check_collector_status.py` - System monitoring and status dashboard
- `clear_database.py` - Database management and cleanup tool
- `export_data.py` - Data export to CSV/Excel formats
- `incremental_trainer.py` - Incremental ML training (thesis-specific)
- `retrain_compatible_model.py` - One-time model retraining script

### `archive_test_scripts/` - Test & Diagnostic Scripts

- `simple_ecu_test.py` - ECU connection testing
- `universal_obd_checker.py` - OBD adapter diagnostic tool

## 🚀 Quick Start

### Start Data Collection

```bash
python3 automated_car_collector_daemon.py --interactive
```

### Train ML Model

```bash
python3 random_forest_trainer.py
```

## 🔧 Restore Archived Scripts

If you need any archived utility:

```bash
# Restore status checker
cp archive_utils/check_collector_status.py .

# Restore export tool
cp archive_utils/export_data.py .

# Restore test scripts
cp archive_test_scripts/simple_ecu_test.py .
```

## 📊 Directory Structure

```
src/
├── automated_car_collector_daemon.py  (CORE - Data Collection)
├── enhanced_database.py               (CORE - Database System)
├── bluetooth_obd_manager.py           (CORE - Bluetooth Manager)
├── random_forest_trainer.py           (CORE - ML Training)
├── archive_utils/                     (Utility scripts)
│   ├── check_collector_status.py
│   ├── clear_database.py
│   ├── export_data.py
│   ├── incremental_trainer.py
│   └── retrain_compatible_model.py
├── archive_test_scripts/              (Test scripts)
│   ├── simple_ecu_test.py
│   └── universal_obd_checker.py
├── data/                              (Database storage)
├── models/                            (ML models)
├── exports/                           (Exported data)
├── logs/                              (System logs)
└── backups/                           (Database backups)
```

## 🎓 For Thesis Defense

The essential 4 files represent the **core production system**:

- Real-time data collection (collector daemon)
- Data persistence (database system)
- Hardware interface (Bluetooth manager)
- Predictive analytics (ML trainer)

All archived scripts are still available if reviewers want to see utility tools or testing frameworks.

---

**Last Updated:** October 29, 2025
**Cleanup Version:** 1.0
