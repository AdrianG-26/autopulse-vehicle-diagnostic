# ✅ AutoPulse Autostart Setup - SUCCESS!

## 🎉 What Just Happened

Your Raspberry Pi is now configured to automatically collect OBD-II data and send it to Supabase **without any laptop, terminal, or VS Code needed!**

## ✅ Installed Components

1. **systemd service**: `autopulse-collector.service`
   - Starts automatically on boot
   - Restarts if it crashes
   - Runs in background

2. **Setup script**: `scripts/setup_autostart_collector.sh`
   - Used to install the service (already completed)

3. **Verification script**: `scripts/check_supabase_data.py`
   - Check if data is reaching Supabase

## 🚀 How It Works Now

```
Power On Car → Pi Boots (30s) → Service Starts → OBD Connects → Data Flows to Supabase
```

**No laptop needed!** Just turn on your car and it works automatically.

## 🔍 How to Verify It's Working

### Option 1: Check Supabase Dashboard (Easiest)
1. Go to https://supabase.com
2. Open your project: `qimiewqthuhmofjhzrrb`
3. Click "Table Editor" → `sensor_data`
4. Look for recent timestamps (should be within last few minutes when car is running)

### Option 2: Run Verification Script
```bash
python3 scripts/check_supabase_data.py
```

This shows:
- Recent sensor readings
- How fresh the data is
- Registered vehicles

### Option 3: Check Service Status
```bash
sudo systemctl status autopulse-collector
```

Should show: `Active: active (running)`

### Option 4: View Live Logs
```bash
sudo journalctl -u autopulse-collector -f
```

Press Ctrl+C to exit

## 📊 Current Status

**Service**: ✅ Running
**Supabase**: ✅ Connected
**OBD Adapter**: 🔄 Attempting to connect

The service will keep trying to connect to OBD until:
- Car ignition is ON
- OBD adapter is plugged in and paired (if Bluetooth)

## 🚗 OBD Connection Notes

The service tries these ports in order:
1. `/dev/rfcomm0` - Bluetooth OBD-II
2. `/dev/ttyUSB0` - USB OBD-II (primary)
3. `/dev/ttyUSB1` - USB OBD-II (secondary)

**For Bluetooth OBD:**
- Make sure adapter is paired with Pi
- Car ignition must be ON
- Wait ~30 seconds for connection

**For USB OBD:**
- Just plug it in
- Car ignition must be ON

## 🎯 Testing Steps

1. **Start car** (turn ignition ON)
2. **Wait 1-2 minutes** for OBD connection
3. **Check logs**:
   ```bash
   sudo journalctl -u autopulse-collector -n 50
   ```
4. **Look for**: "✅ Connected to OBD-II" message
5. **Verify data**:
   ```bash
   python3 scripts/check_supabase_data.py
   ```

## 📱 Access Your Data

Once data is in Supabase, access it from:
- ✅ Web dashboard (Render deployment)
- ✅ Mobile app
- ✅ Any device with internet

## 🔧 Useful Commands

```bash
# Check service status
sudo systemctl status autopulse-collector

# View last 50 log lines
sudo journalctl -u autopulse-collector -n 50

# View live logs (Ctrl+C to exit)
sudo journalctl -u autopulse-collector -f

# Restart service
sudo systemctl restart autopulse-collector

# Stop service
sudo systemctl stop autopulse-collector

# Start service
sudo systemctl start autopulse-collector

# Disable autostart (if needed)
sudo systemctl disable autopulse-collector

# Re-enable autostart
sudo systemctl enable autopulse-collector

# Check Supabase data
python3 scripts/check_supabase_data.py
```

## 🐛 Troubleshooting

### Service won't start
```bash
# Check for errors
sudo journalctl -u autopulse-collector -n 100

# Check if script exists
ls -la /home/rocketeers/vehicle_diagnostic_system/src/cloud_collector_daemon_pro.py

# Try running manually to see errors
cd /home/rocketeers/vehicle_diagnostic_system/src
python3 cloud_collector_daemon_pro.py
```

### OBD won't connect
```bash
# Check if OBD device exists
ls -la /dev/rfcomm* /dev/ttyUSB*

# For Bluetooth OBD:
sudo systemctl status bluetooth
bluetoothctl devices

# Restart Bluetooth
sudo systemctl restart bluetooth
```

### No data in Supabase
1. Check car ignition is ON
2. Wait 1-2 minutes for connection
3. Check service is running: `sudo systemctl status autopulse-collector`
4. View logs: `sudo journalctl -u autopulse-collector -f`
5. Verify Supabase credentials in service file

## 🎓 For Thesis Demo

Perfect setup for demonstration:
1. Power on car
2. Wait 30 seconds
3. Open web dashboard on phone/laptop
4. Show live data streaming
5. **No terminals visible** - professional product demo!

## 🎉 You're Done!

The Pi will now automatically:
- ✅ Start collecting on boot
- ✅ Connect to OBD when car is ON
- ✅ Upload data to Supabase
- ✅ Restart if it crashes
- ✅ Work without any laptop/terminal

**Just drive and let it collect! 🚗💨**

---

Last Updated: November 8, 2025
AutoPulse Vehicle Diagnostic System
