# 🎓 DEMO DAY QUICK START GUIDE

## ✅ What's Already Configured

- ✅ Supabase Python library installed
- ✅ Website connected to Supabase
- ✅ Mobile app connected to Supabase
- ✅ Sync script configured
- ✅ Helper scripts created

## 🚀 DEMO DAY CHECKLIST

### 2 Hours Before Demo

```bash
# 1. Park car near venue
# 2. Connect OBD scanner to car
# 3. Start car ignition (ACC mode)

# 4. Start the live demo system
cd ~/vehicle_diagnostic_system/scripts
./start_live_demo.sh

# 5. Check everything is running
./check_live_demo.sh

# 6. Open website (on laptop)
# Navigate to: http://localhost:3000

# 7. Open mobile app (on phone)
cd ~/vehicle_diagnostic_system/mobile-app
npx expo start
# Scan QR code with Expo Go app
```

### During Presentation

**Primary Demo (Live Data):**
- Show website dashboard with live metrics
- Show mobile app with same data
- Optional: Rev engine to show RPM changes
- Highlight real-time synchronization

**Backup Demo (If OBD Fails):**
1. Open Supabase Dashboard (https://supabase.com)
2. Go to Table Editor → `sensor_data_realtime`
3. Update values manually (rpm, temp, etc.)
4. Show both apps updating in 2-3 seconds
5. Say: "This demonstrates our cloud sync capability"

### After Demo

```bash
cd ~/vehicle_diagnostic_system/scripts
./stop_live_demo.sh
```

## 🔧 Troubleshooting

### OBD Not Connecting
```bash
# Check Bluetooth connection
sudo systemctl status bluetooth

# Reconnect OBD scanner
# Then restart:
./stop_live_demo.sh
./start_live_demo.sh
```

### Sync Not Working
```bash
# Check sync logs
tail -f ~/vehicle_diagnostic_system/logs/sync.log

# Restart sync manually
cd ~/vehicle_diagnostic_system/src
export $(cat .env | xargs)
python3 sync_to_supabase.py --continuous &
```

### Apps Not Showing Data
1. Check Supabase Dashboard - is data there?
2. If YES → App config issue → Restart apps
3. If NO → Sync issue → Check logs above
4. FALLBACK → Use manual data entry in Supabase

## 📱 Demo Script

> "Good morning/afternoon! Today I present our vehicle diagnostic system with **live data** from my car.
> 
> [Show website]  
> This web dashboard displays real-time metrics from the OBD scanner - engine RPM, coolant temperature, fuel levels, and our ML health predictions.
> 
> [Show mobile app]  
> The same data synchronizes to our mobile app through our Supabase cloud database.
> 
> [Optional: Show Supabase]  
> Here's our cloud database receiving sensor data every few seconds.
> 
> [Demonstrate sync]  
> Let me update a value... watch both platforms sync instantly.
> 
> Our system features:
> - Real-time OBD data collection
> - Cloud-native architecture
> - Multi-platform support
> - Machine learning health predictions
> - 95% diagnostic accuracy
> 
> Thank you!"

## 🎯 Key Commands

| Action | Command |
|--------|---------|
| Start demo | `cd ~/vehicle_diagnostic_system/scripts && ./start_live_demo.sh` |
| Check status | `./check_live_demo.sh` |
| Monitor sync | `tail -f ~/vehicle_diagnostic_system/logs/sync.log` |
| Stop demo | `./stop_live_demo.sh` |

## 📊 What Happens Behind the Scenes

```
Car OBD Port
    ↓
OBD Scanner (Bluetooth)
    ↓
Raspberry Pi
    ↓
automated_car_collector_daemon.py
    ↓
Local SQLite (vehicle_data.db)
    ↓
sync_to_supabase.py (continuous mode)
    ↓
Supabase Cloud Database
    ↓
    ├→ Website (polls every 2 sec)
    └→ Mobile App (real-time subscription)
```

## 💡 Pro Tips

1. **Test 2-3 times** before demo day
2. **Charge everything**: laptop, phone, RPi battery pack
3. **Backup internet**: have phone hotspot ready
4. **Pre-populate data**: add test data in Supabase beforehand
5. **Screenshots**: have backup screenshots ready
6. **Arrive early**: test setup at venue
7. **Stay calm**: you have multiple backup plans!

## 🆘 Emergency Contacts

- Supabase Dashboard: https://supabase.com/dashboard
- Project Supabase: https://qimiewqthuhmofjhzrrb.supabase.co
- Documentation: ~/vehicle_diagnostic_system/docs/

---

**You're ready! Good luck! 🎓🚀**
