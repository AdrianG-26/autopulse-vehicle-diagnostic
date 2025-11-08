# 🚀 Automated Cloud Collection System - User Guide

## ✅ What Was Set Up

Your Raspberry Pi now has **fully automated** vehicle data collection to Supabase:

### Services Installed:

1. **rfcomm-obd.service** - Auto-binds Bluetooth OBD adapter
2. **vehicle-cloud-collector.service** - Collects and uploads data to Supabase

### How It Works:

```
Pi Boots → Bluetooth Service → RFCOMM Binding → Cloud Collector
                                      ↓
                          OBD Adapter Connected
                                      ↓
                          Car Ignition Detected
                                      ↓
                     Data Collection Starts Automatically
                                      ↓
                      Data Stored to Supabase Cloud
```

---

## 🎯 Daily Usage (No Terminal Needed!)

### Start Your Day:
1. **Turn on car** 🔑
2. **Plug in OBD adapter** 🔌
3. **That's it!** ✨

The system automatically:
- Detects the car
- Connects to OBD
- Starts collecting data
- Uploads to Supabase every 10 readings

### End Your Day:
1. **Turn off car** 🔒
2. **Unplug OBD adapter** 🔌
3. **Shut down Pi** (optional)

Data is safely stored in Supabase cloud!

---

## 📊 Check System Status

### Quick Status Check:
```bash
cd ~/vehicle_diagnostic_system
./cloud_service_status.sh
```

### View Live Logs:
```bash
sudo journalctl -u vehicle-cloud-collector -f
```

Press `Ctrl+C` to stop viewing logs.

---

## 🔧 Service Management

### Start/Stop Services:

```bash
# Stop collection
sudo systemctl stop vehicle-cloud-collector

# Start collection
sudo systemctl start vehicle-cloud-collector

# Restart collection
sudo systemctl restart vehicle-cloud-collector

# Check if running
sudo systemctl status vehicle-cloud-collector
```

### Disable Auto-Start (if needed):

```bash
# Disable auto-start on boot
sudo systemctl disable vehicle-cloud-collector
sudo systemctl disable rfcomm-obd

# Re-enable later
sudo systemctl enable vehicle-cloud-collector
sudo systemctl enable rfcomm-obd
```

---

## 🌐 Works Completely Offline from Laptop

✅ **No laptop connection needed**  
✅ **No SSH required**  
✅ **No terminal commands**  
✅ **Just plug and go!**

The Pi connects directly to Supabase over WiFi/internet.

---

## 🔍 Troubleshooting

### Service Not Starting?

```bash
# Check service status
sudo systemctl status vehicle-cloud-collector

# View detailed logs
sudo journalctl -u vehicle-cloud-collector -n 50

# Restart services
sudo systemctl restart rfcomm-obd
sudo systemctl restart vehicle-cloud-collector
```

### No /dev/rfcomm0 Device?

```bash
# Check RFCOMM service
sudo systemctl status rfcomm-obd

# Manually bind (temporary)
sudo rfcomm bind 0 00:1D:A5:68:98:8A 1
sudo chmod 666 /dev/rfcomm0
```

### Car Not Detected?

- Ensure car ignition is **ON**
- Check OBD adapter is **plugged in**
- Wait 10-20 seconds after starting car
- Check logs: `sudo journalctl -u vehicle-cloud-collector -f`

---

## 📈 Data Access

### View Data in Supabase:
1. Go to your Supabase dashboard
2. Navigate to Table Editor
3. View tables:
   - `sensor_data` - All historical readings
   - `sensor_data_realtime` - Latest reading per vehicle
   - `vehicle_profiles` - Vehicle information

### Query Recent Data:
```sql
SELECT * FROM sensor_data 
ORDER BY timestamp DESC 
LIMIT 100;
```

---

## �� Service Status Indicators

When you check status, look for:

- **active (running)** ✅ - Service is working
- **active (exited)** ✅ - RFCOMM service (normal for oneshot)
- **failed** ❌ - Service has errors
- **inactive** ⚠️ - Service is stopped

---

## 🔄 What Happens After Reboot?

1. Pi boots up
2. Bluetooth service starts
3. RFCOMM device created automatically
4. Cloud collector starts automatically
5. Waits for car connection
6. Starts collecting when car is detected

**No manual intervention needed!**

---

## 📝 Service Files Location

- RFCOMM Service: `/etc/systemd/system/rfcomm-obd.service`
- Collector Service: `/etc/systemd/system/vehicle-cloud-collector.service`
- Status Script: `~/vehicle_diagnostic_system/cloud_service_status.sh`

---

## ⚡ Quick Reference

| Task | Command |
|------|---------|
| Check status | `./cloud_service_status.sh` |
| View logs | `sudo journalctl -u vehicle-cloud-collector -f` |
| Stop service | `sudo systemctl stop vehicle-cloud-collector` |
| Start service | `sudo systemctl start vehicle-cloud-collector` |
| Restart service | `sudo systemctl restart vehicle-cloud-collector` |
| Disable auto-start | `sudo systemctl disable vehicle-cloud-collector` |
| Enable auto-start | `sudo systemctl enable vehicle-cloud-collector` |

---

## 🎓 For Your Thesis Demo

**Show your adviser:**

1. Turn on car
2. Wait 10-20 seconds
3. Open Supabase dashboard
4. Show live data appearing automatically
5. No terminal commands needed!

**Impressive points:**
- ✅ Fully automated system
- ✅ No human intervention
- ✅ Cloud-connected (Supabase)
- ✅ Production-ready deployment
- ✅ Runs on boot automatically
- ✅ Restarts on failures

---

## 📞 Support

If you need to modify the service:
1. Edit service file: `sudo nano /etc/systemd/system/vehicle-cloud-collector.service`
2. Reload systemd: `sudo systemctl daemon-reload`
3. Restart service: `sudo systemctl restart vehicle-cloud-collector`

---

**🎉 Congratulations! Your vehicle diagnostic system is now fully automated!**
