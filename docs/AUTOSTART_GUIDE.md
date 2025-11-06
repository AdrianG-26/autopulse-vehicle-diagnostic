# 🚗 AutoPulse Auto-Startup System

## Quick Start (3 Steps)

### 1. Install Auto-Startup
```bash
./install_autostart.sh
```

### 2. Reboot RPi
```bash
sudo reboot
```

### 3. Use Your Car! 
- 🔌 **Plug OBD adapter** into car port
- ⚡ **System starts automatically**
- 🌐 **Dashboard updates in real-time**

## What Happens Automatically

```
OBD Scanner → RPi Collector → Random Forest ML → Supabase → Render → Vercel
```

1. **🔍 OBD Detection** - Automatically finds your adapter
2. **📊 Data Collection** - Reads engine sensors every few seconds  
3. **🤖 ML Processing** - Runs Random Forest health predictions
4. **☁️ Cloud Upload** - Sends data + predictions to Supabase
5. **🌐 Dashboard** - Your Vercel website shows live data

## Control Commands

```bash
./autopulse.sh status    # Check if running
./autopulse.sh logs      # View recent activity  
./autopulse.sh restart   # Restart if needed
./autopulse.sh stop      # Stop for maintenance
```

## System URLs

- **Local API**: `http://[RPi-IP]:5000/api/status`
- **Your Dashboard**: `https://[your-vercel-app].vercel.app`
- **Backend API**: `https://autopulse-backend.onrender.com`

## Troubleshooting

- **No data?** → Check `./autopulse.sh logs`
- **OBD not detected?** → Try different USB ports
- **Service not starting?** → Check `sudo systemctl status autopulse.service`

**No manual commands needed - just plug and drive!** 🚗💨
