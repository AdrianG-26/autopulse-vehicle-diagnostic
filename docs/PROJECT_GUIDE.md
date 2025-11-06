# 🚗 AutoPulse Project File Organization Guide

## 📁 Directory Structure

```
/home/rocketeers/vehicle_diagnostic_system/
├── 🏠 ROOT LEVEL (Quick Access)
│   ├── autopulse          → Main control panel (symlink)
│   ├── status             → System status check (symlink)
│   ├── obd-test           → Quick OBD test (symlink)
│   ├── obd-live           → Live vehicle data (symlink)
│   └── README.md          → Project overview
│
├── 📦 bin/                → Main Executable Scripts
│   ├── autopulse.sh       → Master control panel
│   └── check_status.sh    → System status checker
│
├── 🔧 scripts/           → Organized Scripts
│   ├── obd/              → OBD-II Related Scripts
│   │   ├── obd_live_data.sh        → Live vehicle data monitor
│   │   ├── quick_obd_test.sh       → Fast connection test
│   │   ├── test_obd_connection.sh  → Full diagnostic test
│   │   ├── setup_obd_connection.sh → Fix OBD connection
│   │   ├── check_obd_setup.sh      → OBD setup status
│   │   └── obd_autoconnect.sh      → Advanced auto-connect
│   │
│   ├── system/           → System Management
│   │   ├── install_autostart.sh    → Install auto-startup
│   │   └── rpi_autostart.sh        → RPi boot script
│   │
│   └── legacy/           → Old/Duplicate Scripts
│       └── (archived scripts)
│
├── ⚙️ systemd/           → Systemd Service Files
│   ├── autopulse.service          → Main AutoPulse service
│   └── obd-autoconnect.service    → OBD auto-connect service
│
├── 🔌 udev/              → Hardware Detection Rules
│   └── 99-obd-autoconnect.rules   → OBD device auto-detection
│
├── 📚 docs/              → Documentation
│   ├── AUTOSTART_GUIDE.md         → Auto-startup setup
│   ├── CLOUD_ARCHITECTURE.md      → Cloud integration
│   ├── DEMO_DAY_GUIDE.md           → Demo presentation
│   ├── VERCEL_DEPLOYMENT.md       → Frontend deployment
│   └── SECURITY_QUICK_FIX.md       → Security notes
│
├── 🐍 backend/           → Python Backend Code
│   ├── main.py           → Flask app entry point
│   ├── cloud_web_server.py        → Web API server
│   ├── cloud_collector_daemon.py  → Data collector
│   └── requirements.txt           → Python dependencies
│
├── 🌐 website/           → React Frontend
│   ├── src/              → React source code
│   ├── package.json      → Node.js dependencies
│   └── deploy.sh         → Frontend deployment
│
├── 📱 mobile-app/        → React Native Mobile App
│   ├── app/              → Mobile app source
│   └── package.json      → Mobile dependencies
│
├── 🧪 src/               → Legacy Python Scripts
│   ├── automated_car_collector_daemon.py
│   ├── enhanced_database.py
│   └── data/             → SQLite database
│
├── ⚙️ config/            → Configuration Files
├── 📝 logs/              → Log Files
└── 🗃️ tests/             → Test Scripts
```

## 🎯 Quick Commands (Daily Use)

### **Main Controls**
```bash
./autopulse status      # Check system status
./autopulse test        # Test OBD connection  
./autopulse live        # Monitor live vehicle data
./autopulse logs        # View system logs
./autopulse restart     # Restart services
```

### **Direct Script Access**
```bash
./status                # Quick status check
./obd-test             # Fast OBD test
./obd-live             # Live data monitor

# Or full paths:
bin/autopulse.sh status
scripts/obd/quick_obd_test.sh
scripts/obd/obd_live_data.sh
```

## 📂 File Categories

### **🔥 Most Important Files**
| File | Purpose | Usage |
|------|---------|-------|
| `autopulse` | Main control panel | `./autopulse status` |
| `bin/autopulse.sh` | Master script | All system control |
| `scripts/obd/obd_live_data.sh` | Live vehicle data | `./obd-live` |
| `backend/main.py` | Flask API | Backend server |
| `systemd/autopulse.service` | Auto-startup | System service |

### **🔧 Setup & Installation**
| File | Purpose | When to Use |
|------|---------|-------------|
| `scripts/system/install_autostart.sh` | Install auto-startup | One-time setup |
| `scripts/obd/setup_obd_connection.sh` | Fix OBD connection | Troubleshooting |
| `systemd/*.service` | System services | Auto-startup |
| `udev/*.rules` | Hardware detection | Device auto-connect |

### **📊 Monitoring & Testing**
| File | Purpose | When to Use |
|------|---------|-------------|
| `scripts/obd/quick_obd_test.sh` | Fast OBD test | Daily checks |
| `scripts/obd/test_obd_connection.sh` | Full diagnosis | Troubleshooting |
| `bin/check_status.sh` | System status | Health monitoring |

### **📚 Documentation**
| File | Purpose | Read When |
|------|---------|-----------|
| `README.md` | Project overview | Getting started |
| `docs/AUTOSTART_GUIDE.md` | Setup guide | Initial setup |
| `docs/DEMO_DAY_GUIDE.md` | Demo instructions | Presentations |

## 🚀 Workflow Examples

### **Daily Usage**
```bash
# 1. Check system
./autopulse status

# 2. Test OBD (optional)
./obd-test

# 3. Monitor live data (with car)
./obd-live
```

### **Troubleshooting**
```bash
# 1. Check detailed status
./autopulse logs

# 2. Test OBD connection
scripts/obd/test_obd_connection.sh

# 3. Fix connection if needed
scripts/obd/setup_obd_connection.sh

# 4. Restart services
./autopulse restart
```

### **Development**
```bash
# Backend development
cd backend/
python3 main.py

# Frontend development  
cd website/
npm start

# Mobile development
cd mobile-app/
npm start
```

## 📋 File Management Rules

### **✅ DO:**
- Use symlinks in root for daily commands (`./autopulse`, `./obd-test`)
- Keep scripts organized in `scripts/` subdirectories
- Put documentation in `docs/`
- Use `bin/` for main executable tools

### **❌ DON'T:**
- Put scripts directly in root directory
- Duplicate files across directories
- Mix Python and shell scripts in same folder
- Leave temporary files in project root

## 🔄 Updating File Organization

If you add new scripts:

```bash
# Add to appropriate directory:
scripts/obd/          # OBD-related scripts
scripts/system/       # System management
bin/                  # Main tools
docs/                 # Documentation

# Create symlinks for frequently used tools:
ln -sf scripts/obd/new_obd_tool.sh obd-newtool
```

## 🎯 Finding Files Quickly

```bash
# Find any script
find . -name "*.sh" | grep -i keyword

# Find documentation
ls docs/

# Find OBD scripts
ls scripts/obd/

# Find system services
ls systemd/

# Check symlinks
ls -la | grep "^l"
```

---

**📍 You are here:** `/home/rocketeers/vehicle_diagnostic_system/`

**🎮 Start with:** `./autopulse status`
