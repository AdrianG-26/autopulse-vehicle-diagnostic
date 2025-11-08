# 🚗 OPTIMIZED VEHICLE DIAGNOSTIC SYSTEM WORKFLOW

**Version:** 2.0 (Fully Automated)  
**Date:** October 29, 2025  
**Status:** Production Ready ✅

---

## 📋 Table of Contents

1. [Current vs Optimized Workflow](#current-vs-optimized-workflow)
2. [Fully Automated Setup](#fully-automated-setup)
3. [Manual Operation Mode](#manual-operation-mode)
4. [System Architecture](#system-architecture)
5. [Installation & Configuration](#installation--configuration)
6. [Daily Usage](#daily-usage)
7. [Troubleshooting](#troubleshooting)

---

## 🔄 Current vs Optimized Workflow

### ❌ Your Current Manual Workflow

1. Connect OBD scanner to car's OBD port
2. OBD scanner connects to RPI (manually)
3. **Open terminal** → Run collection command
4. Wait for data collection
5. **Open another terminal** → Run ML model
6. **Start backend servers** manually
7. **Open Autopulse** to view data

**Problems:**

- ❌ Too many manual steps
- ❌ Easy to forget something
- ❌ Not convenient for daily use
- ❌ ML runs after collection (not real-time)
- ❌ Data not immediately available on website

### ✅ NEW Optimized Automated Workflow

**ONE-TIME SETUP** (do this once):

```bash
# Install as system service (optional but recommended)
sudo cp vehicle-diagnostic.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable vehicle-diagnostic
sudo systemctl start vehicle-diagnostic
```

**DAILY USAGE** (after one-time setup):

1. ✅ **Turn on car** → System auto-starts
2. ✅ **Connect OBD scanner** → Auto-detects and starts collection
3. ✅ **ML predictions** → Real-time (every second)
4. ✅ **Live data on website** → Automatic streaming
5. ✅ **Turn off car** → System saves data and stops

**Benefits:**

- ✅ Zero manual commands
- ✅ True plug-and-play experience
- ✅ Real-time ML predictions
- ✅ Immediate web dashboard updates
- ✅ Professional production deployment

---

## 🤖 Fully Automated Setup (RECOMMENDED)

### Architecture: Complete Automation

```
┌─────────────────────────────────────────────────────────┐
│                  RPI BOOT SEQUENCE                      │
│  (systemd starts vehicle-diagnostic.service)           │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│              AUTO_START_COMPLETE.SH                     │
│  Launches all components in correct order:             │
│  1. Flask API (port 5000) - ML predictions             │
│  2. WebSocket (port 8080) - Real-time streaming        │
│  3. Data Collector Daemon - Waits for OBD              │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│         AUTOMATED_CAR_COLLECTOR_DAEMON.PY               │
│  (Running in background, waiting for car...)           │
│                                                         │
│  State: IDLE - Monitoring for OBD connection           │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ ⏳ Waiting...
                 │
      [User turns on car & connects OBD scanner]
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│         🚗 OBD CONNECTION DETECTED!                     │
│  • Auto-recognize car (by VIN signature)               │
│  • Load or create car profile                          │
│  • Start data collection immediately                   │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│         📊 CONTINUOUS DATA COLLECTION                   │
│  • Read sensors every 1 second                         │
│  • Calculate engineered features                       │
│  • Store in local SQLite database                      │
│  • Batch insert every 50 records                       │
└────────────────┬────────────────────────────────────────┘
                 │
                 ├──────────────────┬───────────────────┐
                 ▼                  ▼                   ▼
┌──────────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  🤖 ML PREDICTION    │  │  🔌 WEBSOCKET    │  │  ☁️ CLOUD SYNC   │
│  (Flask API)         │  │  STREAMING       │  │  (Optional)      │
│                      │  │                  │  │                  │
│  • Reads latest data │  │  • Reads latest  │  │  • Periodic sync │
│  • Random Forest     │  │    data          │  │    to Supabase   │
│    prediction        │  │  • Sends to web  │  │  • Every 5 min   │
│  • Returns health    │  │    clients       │  │    or on-demand  │
│    score (0-100)     │  │  • Real-time     │  │                  │
│  • Status: NORMAL/   │  │    updates       │  │                  │
│    ADVISORY/WARNING/ │  │                  │  │                  │
│    CRITICAL          │  │                  │  │                  │
└──────────┬───────────┘  └────────┬─────────┘  └──────────────────┘
           │                       │
           └───────────┬───────────┘
                       ▼
           ┌────────────────────────────┐
           │   💻 AUTOPULSE WEBSITE     │
           │   (http://localhost:3000)  │
           │                            │
           │  • Live sensor data        │
           │  • ML health predictions   │
           │  • Real-time charts        │
           │  • Alerts & notifications  │
           │  • Historical analytics    │
           └────────────────────────────┘
                       │
                       │ [User views dashboard]
                       ▼
           ┌────────────────────────────┐
           │   📱 USER EXPERIENCE       │
           │                            │
           │  • See RPM, temp, etc.     │
           │  • ML health score         │
           │  • Maintenance alerts      │
           │  • Fuel efficiency         │
           │  • Engine stress level     │
           └────────────────────────────┘
```

### How It Works

**Boot/Startup Phase:**

1. RPI powers on
2. Systemd starts `vehicle-diagnostic.service`
3. Service runs `auto_start_complete.sh`
4. Script launches:
   - Flask API (ML predictions ready)
   - WebSocket server (waiting for data)
   - Data collector daemon (waiting for OBD)

**Car Connection Phase:**

1. User turns on car ignition
2. OBD scanner connects to car's diagnostic port
3. Bluetooth auto-pairs with RPI
4. Daemon detects OBD connection
5. Auto-recognizes car (or creates new profile)
6. **Starts data collection IMMEDIATELY**

**Active Collection Phase:**

1. **Every 1 second:**
   - Read 30+ sensor values from OBD
   - Calculate engineered features (stress, efficiency, etc.)
   - Store in local database
2. **Every 1 second (parallel):**
   - Flask API reads latest data → ML prediction
   - WebSocket reads latest data → Sends to web
3. **Every 50 records:**
   - Batch insert to database (efficiency)
4. **Every 5 minutes (optional):**
   - Sync data to Supabase cloud

**User Experience:**

- Open browser → `http://localhost:3000`
- See LIVE data updating every second
- See ML health score updating in real-time
- Get instant alerts if issues detected

**Shutdown Phase:**

1. User turns off car / disconnects OBD
2. Daemon detects disconnection
3. Saves final data batch
4. Closes session cleanly
5. Returns to waiting mode

---

## 🔧 Installation & Configuration

### One-Time Setup (RECOMMENDED FOR AUTO-START ON BOOT)

```bash
# 1. Copy systemd service file
sudo cp vehicle-diagnostic.service /etc/systemd/system/

# 2. Reload systemd
sudo systemctl daemon-reload

# 3. Enable auto-start on boot
sudo systemctl enable vehicle-diagnostic

# 4. Start the service now
sudo systemctl start vehicle-diagnostic

# 5. Check status
sudo systemctl status vehicle-diagnostic
```

**What this does:**

- ✅ Starts automatically when RPI boots
- ✅ Restarts automatically if crashes
- ✅ Runs in background (no terminal needed)
- ✅ Logs to system journal
- ✅ Professional production setup

### Verify Installation

```bash
# Check if service is running
sudo systemctl status vehicle-diagnostic

# View live logs
sudo journalctl -u vehicle-diagnostic -f

# Check process status
./check_system.sh
```

### Disable Auto-Start (if needed)

```bash
# Stop the service
sudo systemctl stop vehicle-diagnostic

# Disable auto-start
sudo systemctl disable vehicle-diagnostic
```

---

## 📱 Manual Operation Mode (Development/Testing)

If you don't want auto-start, you can run manually:

### Quick Start (All-in-One)

```bash
./auto_start_complete.sh
```

This starts everything at once:

- Backend servers (Flask + WebSocket)
- Data collector (daemon mode)
- Waits for OBD connection

### Step-by-Step Manual Start

```bash
# 1. Start backend servers
./start_system.sh

# 2. Start data collector in daemon mode
python3 src/automated_car_collector_daemon.py --daemon

# 3. Open Autopulse (optional - if not using React dev server)
cd Autopulse && npm start
```

### Interactive Mode (Testing/Development)

```bash
# Interactive mode with car selection
python3 src/automated_car_collector_daemon.py --interactive

# Verbose logging for debugging
python3 src/automated_car_collector_daemon.py --daemon --verbose
```

---

## 🏗️ System Architecture

### Component Interaction

```
┌─────────────────────────────────────────────────────────┐
│                    DATA FLOW                            │
└─────────────────────────────────────────────────────────┘

OBD Scanner → Bluetooth → RPI → Collector Daemon
                                      │
                                      ▼
                              ┌───────────────┐
                              │ SQLite DB     │
                              │ (Local)       │
                              └───────┬───────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
            ┌───────────────┐ ┌──────────────┐ ┌──────────────┐
            │ Flask API     │ │ WebSocket    │ │ Sync Script  │
            │ (ML Model)    │ │ Server       │ │ (Supabase)   │
            └───────┬───────┘ └──────┬───────┘ └──────┬───────┘
                    │                │                 │
                    └────────────────┼─────────────────┘
                                     ▼
                            ┌─────────────────┐
                            │ Autopulse Web   │
                            │ (React App)     │
                            └─────────────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │ User Browser    │
                            └─────────────────┘
```

### Real-Time ML Predictions

**How it works:**

1. Data collector stores sensor data in database
2. Flask API has a background thread that:
   - Reads latest sensor data every 1 second
   - Passes data through Random Forest model
   - Generates health prediction
   - Caches result
3. WebSocket or API endpoint serves the prediction
4. Web dashboard displays it immediately

**No manual ML running needed!** It's automatic and continuous.

---

## 📊 Daily Usage Workflow

### Option 1: Fully Automated (Recommended)

**One-time setup:**

```bash
sudo systemctl enable vehicle-diagnostic
```

**Every time you use your car:**

1. Turn on car ignition
2. Connect OBD scanner to diagnostic port
3. That's it! Everything else is automatic:
   - System detects connection
   - Starts data collection
   - Runs ML predictions
   - Streams to website

**View data:**

```bash
# Open browser
firefox http://localhost:3000

# Or check from command line
curl http://localhost:5000/api/health
```

### Option 2: Manual Start (Development)

```bash
# Day 1: Start system
./auto_start_complete.sh

# Connect OBD scanner → Auto-detects

# View logs
tail -f logs/collector_daemon.log

# Stop when done
./stop_system.sh
```

---

## 🔍 Monitoring & Logs

### Check System Status

```bash
# Quick status check
./check_system.sh

# Detailed systemd status
sudo systemctl status vehicle-diagnostic

# Live log viewing
sudo journalctl -u vehicle-diagnostic -f
```

### Log Files

```
logs/
├── flask_server.log         # ML API logs
├── websocket_server.log     # Real-time streaming logs
├── collector_daemon.log     # Data collection logs
├── daemon_collector.log     # Detailed collector events
└── react_server.log         # Frontend logs (if using npm start)
```

### View Logs

```bash
# All logs in real-time
tail -f logs/*.log

# Specific component
tail -f logs/collector_daemon.log

# Search for errors
grep -i error logs/*.log

# Last 100 lines
tail -n 100 logs/collector_daemon.log
```

---

## 🛠️ Troubleshooting

### Issue: OBD not auto-connecting

**Check:**

```bash
# 1. Is Bluetooth adapter connected?
hcitool dev

# 2. Is OBD scanner paired?
bluetoothctl devices

# 3. Check Bluetooth logs
sudo journalctl -u bluetooth -n 50
```

**Fix:**

```bash
# Pair OBD scanner manually (one-time)
bluetoothctl
> scan on
> pair [OBD_MAC_ADDRESS]
> trust [OBD_MAC_ADDRESS]
> connect [OBD_MAC_ADDRESS]
> exit
```

### Issue: ML predictions not updating

**Check:**

```bash
# 1. Is Flask API running?
curl http://localhost:5000/api/health

# 2. Is model loaded?
curl http://localhost:5000/api/model/info

# 3. Check Flask logs
tail -f logs/flask_server.log
```

**Fix:**

```bash
# Restart Flask API
pkill -f web_server.py
python3 web_server.py &
```

### Issue: Website not showing live data

**Check:**

```bash
# 1. Is WebSocket running?
netstat -tulpn | grep 8080

# 2. Test WebSocket connection
wscat -c ws://localhost:8080

# 3. Check WebSocket logs
tail -f logs/websocket_server.log
```

**Fix:**

```bash
# Restart WebSocket server
pkill -f websocket_server.py
python3 websocket_server.py &
```

### Issue: System not auto-starting on boot

**Check:**

```bash
# Is service enabled?
sudo systemctl is-enabled vehicle-diagnostic

# Check service status
sudo systemctl status vehicle-diagnostic
```

**Fix:**

```bash
# Enable and start
sudo systemctl enable vehicle-diagnostic
sudo systemctl start vehicle-diagnostic
```

---

## 🎯 Performance Optimization Tips

### 1. Data Collection Interval

**Current:** 1 second (default)

**Adjust for your needs:**

```python
# Edit: src/automated_car_collector_daemon.py
# Line ~100
self.collection_interval = 2  # Slower (less CPU, less data)
self.collection_interval = 0.5  # Faster (more data, more CPU)
```

### 2. Batch Size

**Current:** 50 records (default)

**Adjust:**

```python
# Edit: src/automated_car_collector_daemon.py
self.batch_size = 100  # Larger batches = faster writes
self.batch_size = 25   # Smaller batches = more frequent saves
```

### 3. Cloud Sync Frequency

**Optional - only if using Supabase:**

```bash
# Manual sync after each drive
python3 src/sync_to_supabase.py --incremental

# Continuous sync (every 5 min)
python3 src/sync_to_supabase.py --continuous --interval 300
```

---

## 📚 Summary

### ✅ What You Get with This Setup

| Feature              | Before               | After (Optimized)           |
| -------------------- | -------------------- | --------------------------- |
| **Start Collection** | Manual command       | Automatic on car connection |
| **ML Predictions**   | Run after collection | Real-time (every second)    |
| **Web Dashboard**    | Start manually       | Always available            |
| **Data Streaming**   | Not live             | Live updates (1 sec)        |
| **Car Detection**    | Manual selection     | Auto-recognition            |
| **Boot Behavior**    | Nothing              | Full system ready           |
| **User Actions**     | 5+ steps             | 1 step (turn on car)        |

### 🎯 Recommended Setup for Your Car

**For Daily Use (Thesis Demo):**

```bash
# One-time installation
sudo cp vehicle-diagnostic.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable vehicle-diagnostic
sudo systemctl start vehicle-diagnostic

# Done! Now just use your car normally
# System handles everything automatically
```

**For Development/Testing:**

```bash
# Quick manual start
./auto_start_complete.sh

# Or step by step
./start_system.sh
python3 src/automated_car_collector_daemon.py --daemon
```

---

## 🚀 Next Steps

1. **Choose your mode:**

   - Production (auto-start): Install systemd service
   - Development: Use manual scripts

2. **Test the system:**

   ```bash
   # Start everything
   ./auto_start_complete.sh

   # Connect OBD scanner
   # Watch logs: tail -f logs/collector_daemon.log
   ```

3. **Verify ML predictions:**

   ```bash
   curl http://localhost:5000/api/predict
   ```

4. **Open dashboard:**

   ```bash
   firefox http://localhost:3000
   ```

5. **Enjoy plug-and-play vehicle diagnostics!** 🎉

---

**Questions? Check:**

- `CHEAT_SHEET.md` - Quick reference
- `PROJECT_STRUCTURE.md` - Architecture details
- `ML_MODEL_REPORT.md` - Model performance
- `logs/*.log` - Runtime logs
