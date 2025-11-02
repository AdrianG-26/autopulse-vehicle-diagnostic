# 📁 Vehicle Diagnostic System - Project Structure

**Last Updated:** October 29, 2025  
**Status:** ✅ Cleaned, Organized & Cloud-Integrated

---

## 🎯 Essential Files Only

### Root Directory

```
vehicle_diagnostic_system/
├── 🚀 start_system.sh           Start all services
├── 🛑 stop_system.sh            Stop all services
├── 📊 check_system.sh           Check system status
├── 🤖 web_server.py             Flask API + ML predictions
├── 🔌 websocket_server.py       Real-time data streaming (updated for RPI DB)
├── 📦 requirements.txt          Python dependencies
├── ☁️  supabase_schema.sql       Supabase database schema (NEW!)
├── 📋 CHEAT_SHEET.md           Quick reference guide
├── 📋 CLEANUP_REPORT.md        Detailed cleanup documentation
└── 📋 PROJECT_STRUCTURE.md     This file
```

### Core Backend (`src/`)

**5 Essential Python Files:**

```
src/
├── automated_car_collector_daemon.py  (76KB)  🚗 OBD data collection
├── enhanced_database.py               (48KB)  💾 Database management
├── bluetooth_obd_manager.py           (7KB)   📡 Bluetooth connectivity
├── random_forest_trainer.py           (21KB)  🤖 ML model training
└── sync_to_supabase.py                (NEW!)  ☁️  Cloud sync service
```

### Frontend (`Autopulse/`)

**React Application (Cloud-Connected):**

```
Autopulse/
├── src/
│   ├── components/     UI components (Navbar, Sidebar, Cards, etc.)
│   ├── pages/          Application pages (Dashboard, Engine, Fuel, MLTest, etc.)
│   ├── services/       🆕 UPDATED SERVICES:
│   │   ├── supabase.js      ✓ Auth & users (cloud)
│   │   ├── chat.js          ✓ Messages (cloud)
│   │   ├── vehicleML.js     ✓ ML predictions (local API)
│   │   ├── wsStream.js      🆕 WebSocket (updated for RPI DB schema)
│   │   └── vehicleData.js   🆕 Vehicle & sensor data (Supabase cloud)
│   └── archive_react_defaults/  📦 Archived React boilerplate files
├── public/
└── package.json
```

### Data & Logs

```
data/
└── vehicle_data.db (REMOVED - was empty duplicate)

src/data/
├── vehicle_data.db              ✅ Active SQLite database (46,910 records)
├── vehicle_data.db-shm          SQLite shared memory
├── vehicle_data.db-wal          SQLite write-ahead log
└── .sync_state.json             🆕 Supabase sync state tracker

logs/
├── flask_server.log             Flask API runtime logs
├── react_server.log             React development server logs
└── websocket_server.log         WebSocket streaming logs

src/logs/
├── daemon_collector.log         Data collector logs
└── professional_collector.log   Collection service logs
```

### Archived Files

```
archive_old_files/
├── web/                         Old Flask web interface (replaced by Autopulse)
├── flask_server.log             Old Flask logs
├── server.log                   Old server logs
└── web_server.log              Old web server logs

src/archive_utils/
├── check_collector_status.py    System monitoring utility
├── clear_database.py            Database management tool
├── export_data.py               Data export utility
├── incremental_trainer.py       Incremental ML training
└── retrain_compatible_model.py  Model compatibility tool

src/archive_test_scripts/
├── simple_ecu_test.py           ECU connection testing
└── universal_obd_checker.py     OBD diagnostics tool

Autopulse/archive_react_defaults/
├── App.test.js                  React test boilerplate
├── setupTests.js                Jest setup
├── reportWebVitals.js           Performance monitoring
└── logo.svg                     React logo
```

---

## 🚀 Quick Start

### Start the System

```bash
./start_system.sh
```

This will start:

- Flask API server (port 5000) - ML predictions & data export
- WebSocket server (port 8080) - Real-time sensor streaming
- React development server (port 3000) - Autopulse UI

### Sync Data to Supabase Cloud

```bash
# First time: Full sync of all data
export SUPABASE_URL='https://your-project.supabase.co'
export SUPABASE_KEY='your-anon-key'
python src/sync_to_supabase.py --full

# Incremental sync (only new data)
python src/sync_to_supabase.py --incremental

# Continuous background sync (every 60 seconds)
python src/sync_to_supabase.py --continuous
```

### Check System Status

```bash
./check_system.sh
```

### Stop the System

```bash
./stop_system.sh
```

---

## 🏗️ New System Architecture

### Hybrid Cloud + Local Architecture

```
    ┌──────────────────────────────────────────────────┐
    │        AUTOPULSE (React Frontend)                │
    │        http://localhost:3000                     │
    │                                                   │
    │  Services:                                       │
    │    • vehicleData.js  (Supabase vehicles/data)   │
    │    • vehicleML.js    (Local ML API)             │
    │    • wsStream.js     (Local real-time)          │
    │    • supabase.js     (Auth/users)               │
    │    • chat.js         (Messages)                 │
    └────┬─────────┬───────────┬──────────┬───────────┘
         │         │           │          │
    Auth │    Real │      Hist │      ML  │
    Chat │    time │      Data │   Predict│
         │         │           │          │
         ▼         ▼           ▼          ▼
    ┌─────────┐ ┌─────┐  ┌──────────┐ ┌────────┐
    │Supabase │ │ WS  │  │ Supabase │ │ Flask  │
    │ Cloud   │ │:8080│  │  Cloud   │ │  API   │
    │         │ │     │  │          │ │ :5000  │
    │ Tables: │ └──┬──┘  │ Tables:  │ └────┬───┘
    │ • users │    │     │ • vehicle│      │
    │ • msgs  │    │     │   _prof. │      │
    └─────────┘    │     │ • sensor │      │
                   │     │   _data  │      │
                   │     │ • realti.│      │
                   ▼     └────▲─────┘      ▼
            ┌──────────────────┴──────────────┐
            │   RPI Local SQLite Database     │
            │   src/data/vehicle_data.db      │
            │                                  │
            │   Tables:                        │
            │   • car_profiles (4 vehicles)   │
            │   • enhanced_sensor_data        │
            │     (46,910 records)             │
            └──────────────▲───────────────────┘
                           │
                    ┌──────┴────────┐
                    │ Data Collector│
                    │    Daemon     │
                    │ (OBD-II)      │
                    └───────────────┘
                           ▲
                    ┌──────┴────────┐
                    │ sync_to_      │
                    │ supabase.py   │
                    │ (Background)  │
                    └───────────────┘
```

### Data Flow

1. **Data Collection** (RPI Local)

   - OBD collector daemon reads from vehicle
   - Stores in local SQLite (`enhanced_sensor_data` table)
   - 46,910 records from 4 vehicles

2. **Real-Time Streaming** (Local → Frontend)

   - WebSocket server reads latest from SQLite
   - Streams to Autopulse via ws://localhost:8080
   - Updated to match RPI database schema

3. **Cloud Sync** (Local → Supabase)

   - `sync_to_supabase.py` uploads data in batches
   - Vehicles → `vehicle_profiles` table
   - Historical → `sensor_data` table
   - Latest → `sensor_data_realtime` table

4. **Frontend Display** (Supabase → Frontend)
   - `vehicleData.js` service fetches from cloud
   - Real-time subscriptions via Supabase Realtime
   - Historical charts & analytics
   - Multi-vehicle support

---

## 🔧 Development Workflow

### Backend Development

Work with the 5 essential files in `src/`:

1. **Data Collection:** `automated_car_collector_daemon.py`
2. **Database:** `enhanced_database.py`
3. **Bluetooth:** `bluetooth_obd_manager.py`
4. **ML Training:** `random_forest_trainer.py`
5. **Cloud Sync:** `sync_to_supabase.py` 🆕

### Frontend Development

Work in `Autopulse/src/`:

```bash
cd Autopulse
npm start
```

**Key Services:**

- `vehicleData.js` - Supabase vehicle & sensor data 🆕
- `wsStream.js` - WebSocket real-time streaming (updated) 🆕
- `vehicleML.js` - ML predictions from Flask API
- `supabase.js` - Authentication & users
- `chat.js` - Chat/messaging

### API Development

Work with `web_server.py` for:

- ML prediction endpoints
- Data export APIs
- Real-time health scoring

### Cloud Database Setup

1. Run SQL schema in Supabase:

   ```bash
   # Copy contents of supabase_schema.sql
   # Paste in Supabase SQL Editor
   # Execute
   ```

2. Configure environment:

   ```bash
   export SUPABASE_URL='https://xxx.supabase.co'
   export SUPABASE_KEY='your-key'
   ```

3. Sync data:
   ```bash
   python src/sync_to_supabase.py --full
   ```

---

## 📦 File Count Summary

| Category                | Count | Location                                  |
| ----------------------- | ----- | ----------------------------------------- |
| System Scripts          | 3     | Root directory                            |
| Backend Servers         | 2     | Root directory                            |
| Core Python Files       | 5     | `src/` (was 4, now 5)                     |
| Autopulse Services      | 5     | `Autopulse/src/services/` (2 new)         |
| Autopulse Pages         | 8     | `Autopulse/src/pages/`                    |
| Autopulse Components    | 13    | `Autopulse/src/components/`               |
| Archived Utilities      | 5     | `src/archive_utils/`                      |
| Archived Tests          | 2     | `src/archive_test_scripts/`               |
| Archived React Defaults | 4     | `Autopulse/archive_react_defaults/` (new) |
| Old Web Interface       | 1 dir | `archive_old_files/web/`                  |
| Documentation           | 4     | Root directory (added SQL schema)         |

**Total Essential Files:** 13 root + services  
**Archived Files:** 11 files + directories

---

## 🆕 What's New (October 29, 2025)

### ✅ Database Integration

- Created Supabase cloud database schema
- Matches RPI local database structure
- 3 tables: `vehicle_profiles`, `sensor_data`, `sensor_data_realtime`
- Row-level security for multi-user support
- Real-time subscriptions enabled

### ✅ Services Created

- **`vehicleData.js`** - Supabase vehicle data service with React hooks
- **`sync_to_supabase.py`** - Cloud sync script (full/incremental/continuous modes)

### ✅ Services Updated

- **`wsStream.js`** - Now matches RPI database schema (car_profile_id, correct field names)
- **`websocket_server.py`** - Updated to use `enhanced_sensor_data` table structure

### ✅ Cleanup

- Archived React default files (test, reportWebVitals, logo)
- Removed empty duplicate databases
- Updated `index.js` to remove unused imports

---

## ✅ Cleanup Benefits

1. **Professional Structure** - Clean, easy to navigate
2. **Thesis Ready** - Focus on 5 core backend files + integrated frontend
3. **Cloud-Connected** - Local + Cloud hybrid architecture
4. **No Redundancy** - Old code archived, not duplicated
5. **Maintainable** - Clear separation of concerns
6. **Safe** - Nothing deleted, everything archived
7. **Scalable** - Cloud database supports multiple users & vehicles

---

## 🔄 Restore Archived Files

### Restore Utilities

```bash
# Restore specific utility
cp src/archive_utils/export_data.py src/

# Restore all utilities
cp src/archive_utils/*.py src/
```

### Restore Test Scripts

```bash
# Restore specific test
cp src/archive_test_scripts/simple_ecu_test.py src/

# Restore all tests
cp src/archive_test_scripts/*.py src/
```

### Restore React Defaults

```bash
# If needed for testing
cp Autopulse/archive_react_defaults/* Autopulse/src/
```

---

## 📞 Support

For detailed cleanup information, see `CLEANUP_REPORT.md`  
For quick commands, see `CHEAT_SHEET.md`  
For Supabase setup, see `supabase_schema.sql`

---

**Structure last verified:** October 29, 2025 ✅  
**Cloud integration:** Complete ✅  
**Database sync:** Ready ✅
