# 🚗 AutoPulse - Real-time Vehicle Diagnostic Dashboard

**Professional ML-powered vehicle diagnostics with live data streaming**

Built with React 19 + Supabase + HTTP Polling for real-time vehicle health monitoring.

---

## 🎯 Features

✅ **Real-time Dashboard** - Live OBD-II sensor data updates (1-second intervals)  
✅ **ML Health Predictions** - 99.94% accurate Random Forest model  
✅ **7 Diagnostic Pages** - Dashboard, Engine, Fuel, Logs, ML Test, Settings, Support  
✅ **Dark Mode UI** - Professional unified dark theme across all pages  
✅ **HTTP Polling** - Reliable real-time data fetching every 1-2 seconds  
✅ **Cloud Integration** - Supabase authentication & database sync  
✅ **Chat Support** - Integrated customer support widget

---

## 🚀 Quick Start

### Prerequisites

```bash
# Ensure backend services are running
cd ~/vehicle_diagnostic_system
./auto_start_complete.sh
```

### Start Development Server

```bash
cd ~/vehicle_diagnostic_system/Autopulse
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

The page will auto-reload when you make changes.

---

## 📁 Project Structure

```
Autopulse/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable React components
│   │   ├── AlertCard.jsx
│   │   ├── ChatWidget.jsx
│   │   ├── DonutProgress.jsx
│   │   ├── LoginBranding.jsx
│   │   ├── LoginForm.jsx
│   │   ├── MLHealthCard.jsx
│   │   ├── MiniBar.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProgressCard.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Sparkline.jsx
│   │   ├── StatCard.jsx
│   │   └── StatusIndicator.jsx
│   ├── pages/          # Main application pages
│   │   ├── Dashboard.jsx    # Real-time overview
│   │   ├── Engine.jsx       # Engine diagnostics
│   │   ├── Fuel.jsx         # Fuel system analysis
│   │   ├── Logs.jsx         # Historical data
│   │   ├── MLTest.jsx       # ML model testing
│   │   ├── Settings.jsx     # User settings
│   │   ├── Contact.jsx      # Support chat
│   │   └── Login.jsx        # Authentication
│   ├── services/       # API & data services
│   │   ├── chat.js          # Chat support API
│   │   ├── polling.js       # HTTP polling service
│   │   ├── supabase.js      # Supabase client
│   │   ├── vehicleData.js   # Vehicle data API
│   │   └── vehicleML.js     # ML predictions API
│   ├── App.js          # Main app component
│   ├── App.css         # Global styles
│   ├── index.js        # React entry point
│   └── index.css       # Base CSS
├── .env                # Environment variables
├── package.json        # Dependencies
└── README.md           # This file
```

---

## 🔧 Available Scripts

### `npm start`

Start development server (port 3000)

### `npm run build`

Build optimized production bundle to `/build` folder

### `npm test`

Run test suite in interactive watch mode

### `npm test`

Run test suite in interactive watch mode

---

## 🌐 Environment Configuration

Create `.env` file in the Autopulse root directory:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_anon_key

# Vehicle ML API (Flask backend)
REACT_APP_API_URL=http://localhost:5000
```

**Note:** `.env` file is already configured. Do not commit sensitive keys to Git.

---

## 🎨 Dark Mode Theme

All pages use unified dark theme with consistent styling:

- **Sidebar Background:** `#1e293b` (slate-800)
- **Main Content:** `#0f172a` (slate-900)
- **Borders:** `#334155` (slate-700)
- **Active Button:** `#334155` bg + `#38bdf8` border
- **Brand Color:** `#38bdf8` (sky-400)
- **Text (headings):** `#f1f5f9` (slate-100)
- **Text (body):** `#94a3b8` (slate-400)

---

## 📊 Data Flow Architecture

```
OBD-II Scanner → RPI Data Collector → SQLite Database
                                            ↓
                                    Flask API (ML Model)
                                            ↓
                                  HTTP Polling (1-2 seconds)
                                            ↓
                    React Dashboard ← Supabase Cloud → User Auth
```

---

## 🔌 Backend Services Required

AutoPulse requires these services to be running:

| Service          | Port | Purpose                   |
| ---------------- | ---- | ------------------------- |
| Flask API        | 5000 | ML predictions & data API |
| React Dev Server | 3000 | Frontend UI               |

**Start backend services:**

```bash
cd ~/vehicle_diagnostic_system
./auto_start_complete.sh
```

---

## 🧪 ML Model Integration

The dashboard integrates with a Random Forest ML model:

- **Accuracy:** 99.94%
- **Training Samples:** 33,060
- **Real-time Predictions:** Health score (0-100), status, alerts
- **Features:** 20+ OBD-II sensor readings

**API Endpoints:**

- `GET /api/latest` - Latest sensor data with ML prediction
- `GET /api/model-info` - Model metadata & accuracy
- `POST /api/predict` - Manual prediction from sensor data

---

## 📦 Dependencies

**Core:**

- `react` 19.1.1 - UI framework
- `react-dom` 19.1.1 - React renderer
- `react-scripts` 5.0.1 - Build tooling

**Services:**

- `@supabase/supabase-js` - Cloud database & auth

**Testing:**

- `@testing-library/react` - Component testing
- `@testing-library/jest-dom` - Jest matchers
- `@testing-library/user-event` - User interaction testing

---

## 🚀 Deployment

### Production Build

```bash
npm run build
```

Creates optimized production bundle in `/build` folder with:

- Minified JavaScript
- CSS optimization
- Asset hashing for cache busting
- Source maps

### Serve Production Build

```bash
# Install serve globally (one-time)
npm install -g serve

# Serve the build
serve -s build -l 3000
```

---

## 🐛 Troubleshooting

### CORS Errors

If you see CORS errors in the console, ensure:

- Flask API is running on port 5000
- `.env` has correct `REACT_APP_API_URL`
- Backend has CORS enabled for localhost:3000

### Connection Refused

- Verify backend services: `ps aux | grep web_server`
- Check ports: `netstat -tuln | grep -E "5000|8080"`
- Restart backend: `./stop_system.sh && ./auto_start_complete.sh`

### Module Not Found

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Learn More

- [React Documentation](https://react.dev)
- [Create React App Docs](https://create-react-app.dev)
- [Supabase Documentation](https://supabase.com/docs)

---

**Built with ❤️ for professional vehicle diagnostics**
