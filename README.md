# 🚗 AutoPulse - Vehicle Diagnostic System

![AutoPulse](https://img.shields.io/badge/AutoPulse-Vehicle%20Diagnostic-blue)
![ML Model](https://img.shields.io/badge/ML%20Accuracy-99.94%25-success)
![Platform](https://img.shields.io/badge/Platform-Web%20%2B%20Mobile-orange)

**AutoPulse** is an intelligent vehicle diagnostic system that uses Machine Learning to predict vehicle health and provide real-time monitoring through OBD-II sensors.

> **Thesis Project** - Computer Science Capstone  
> **Author:** Adrian G.  
> **Year:** 2025

---

## 🎯 Features

### 🧠 **ML-Powered Predictions**
- **99.94% accuracy** Random Forest model
- Real-time health score calculation
- Predictive maintenance alerts
- Status classification (Excellent, Normal, Advisory, Warning, Critical)

### 📊 **Multi-Platform**
- **Website Dashboard** - React-based real-time monitoring
- **Mobile Application** - React Native (Expo) for iOS & Android
- **Raspberry Pi Backend** - Python Flask API with OBD-II integration

### 🔌 **OBD-II Integration**
- 30+ sensor data points
- Live data streaming (1-second polling)
- Historical data logging
- Diagnostic Trouble Codes (DTC) monitoring

### 📱 **Cross-Platform Synchronization**
- Same data, same features across web and mobile
- Consistent UI/UX design
- Real-time updates

---

## 🏗️ Project Structure

```
autopulse-vehicle-diagnostic/
├── website/                    # React web dashboard
│   ├── src/
│   │   ├── pages/             # Dashboard, Engine, Fuel, Emissions, Logs
│   │   ├── components/        # Reusable UI components
│   │   └── services/          # API services (polling, ML)
│   ├── DEPLOYMENT.md          # Vercel deployment guide
│   └── package.json
│
├── mobile-app/                # React Native mobile app (Expo)
│   ├── app/                   # App screens & routes
│   ├── components/            # UI components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # RPI API integration
│   └── package.json
│
├── src/                       # Raspberry Pi Python backend
│   ├── automated_car_collector_daemon.py  # OBD-II data collector
│   ├── enhanced_database.py               # SQLite database
│   ├── random_forest_trainer.py           # ML model training
│   └── models/                            # Trained ML models
│
├── web_server.py              # Flask API server
├── requirements.txt           # Python dependencies
└── docs/                      # Complete documentation
```

---

## 🚀 Quick Start

### **1. Raspberry Pi Setup**

```bash
# Clone repository
git clone https://github.com/AdrianG-26/autopulse-vehicle-diagnostic.git
cd autopulse-vehicle-diagnostic

# Install Python dependencies
pip3 install -r requirements.txt

# Start data collector
python3 src/automated_car_collector_daemon.py

# Start Flask API server
python3 web_server.py
```

### **2. Website Setup**

```bash
# Navigate to website directory
cd website

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

**Deploy to Vercel:** See `website/DEPLOYMENT.md` for complete guide

### **3. Mobile App Setup**

```bash
# Navigate to mobile app directory
cd mobile-app

# Install dependencies
npm install

# Start Expo development server
npx expo start

# Scan QR code with Expo Go app
```

**Build APK:** See `mobile-app/MOBILE_APP_UPDATES.md` for instructions

---

## 📊 Sensor Data Monitored

### **Engine Metrics**
- RPM (Revolutions Per Minute)
- Engine Load
- Coolant Temperature
- Intake Air Temperature
- Throttle Position
- Timing Advance
- MAF (Mass Air Flow)
- MAP (Manifold Absolute Pressure)

### **Fuel System**
- Fuel System Status
- Fuel Pressure
- Fuel Level
- Fuel Efficiency
- Short-term Fuel Trim
- Long-term Fuel Trim

### **Emissions**
- O₂ Sensor Voltages (Bank 1, Sensor 1 & 2)
- Catalyst Temperature
- EGR Error Rate
- Barometric Pressure

### **Other**
- Vehicle Speed
- Control Module Voltage
- Engine Runtime
- DTC Count
- And more...

---

## 🧪 ML Model Details

**Algorithm:** Random Forest Classifier  
**Accuracy:** 99.94%  
**Features:** 30+ sensor inputs  
**Output:** Health Score (0-100) + Status Classification  

**Training Data:**
- Real-world OBD-II sensor readings
- Multiple vehicle conditions
- Various maintenance scenarios

**Model File:** `src/models/vehicle_maintenance_rf_rpi_compatible_20251026_200238.joblib`

---

## 🌐 Deployment

### **Website (Vercel)**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/AdrianG-26/autopulse-vehicle-diagnostic)

See `website/DEPLOYMENT.md` for detailed instructions.

### **Mobile App**
- Build APK with Expo EAS Build
- Or publish to Google Play Store / Apple App Store

### **Raspberry Pi API**
- Run locally on Raspberry Pi
- Expose via Cloudflare Tunnel or ngrok for remote access

---

## 📖 Documentation

- **[Dashboard Features](docs/DASHBOARD_FEATURES.md)** - UI components and features
- **[Polling Architecture](docs/POLLING_ARCHITECTURE.md)** - Data flow and API structure
- **[Project Structure](docs/PROJECT_STRUCTURE.md)** - Detailed file organization
- **[Workflow Guide](docs/WORKFLOW_GUIDE.md)** - Development workflow
- **[ML Model Report](ML_MODEL_REPORT.md)** - Model training and evaluation
- **[Deployment Guide](website/DEPLOYMENT.md)** - Production deployment

---

## 🛠️ Technology Stack

### **Frontend**
- React 19.1.1
- React Native (Expo)
- TypeScript
- Tailwind-inspired styling

### **Backend**
- Python 3.x
- Flask (REST API)
- SQLite (data storage)
- python-obd (OBD-II communication)

### **Machine Learning**
- scikit-learn
- Random Forest
- joblib (model persistence)

### **Deployment**
- Vercel (website hosting)
- Expo (mobile app distribution)
- Cloudflare Tunnel (API exposure)

---

## 🔧 System Requirements

### **Raspberry Pi**
- Raspberry Pi 3/4/5
- Raspbian OS
- Python 3.7+
- OBD-II USB/Bluetooth adapter

### **Development**
- Node.js 18+
- npm or yarn
- Git

### **Mobile Testing**
- Expo Go app (iOS/Android)
- Or Android Studio / Xcode for building

---

## 📝 License

This project is part of a thesis/capstone project for educational purposes.

---

## 👨‍💻 Author

**Adrian G.**  
GitHub: [@AdrianG-26](https://github.com/AdrianG-26)

---

## 🙏 Acknowledgments

- OBD-II community for python-obd library
- Expo team for amazing mobile development tools
- Vercel for free hosting
- OpenAI for development assistance

---

## 📞 Support

For questions or issues:
1. Open a GitHub Issue
2. Check the documentation in `/docs`
3. Review deployment guides in `/website`

---

**Built with ❤️ for vehicle health monitoring**
