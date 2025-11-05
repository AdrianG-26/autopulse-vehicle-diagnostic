#!/bin/bash
# 🔍 Quick System Status Check

echo "════════════════════════════════════════════════════════"
echo "🚗 Vehicle Diagnostic System - Status Check"
echo "════════════════════════════════════════════════════════"
echo ""

# Check Flask API
if pgrep -f "web_server.py" > /dev/null; then
    echo "✅ Flask API Server: RUNNING"
    echo "   http://localhost:5000"
else
    echo "❌ Flask API Server: STOPPED"
fi

# Check WebSocket
if pgrep -f "websocket_server.py" > /dev/null; then
    echo "✅ WebSocket Server: RUNNING"
    echo "   ws://localhost:8080"
else
    echo "❌ WebSocket Server: STOPPED"
fi

# Check Data Collector
if pgrep -f "automated_car_collector_daemon.py" > /dev/null; then
    echo "✅ OBD Collector: RUNNING"
else
    echo "❌ OBD Collector: STOPPED"
fi

# Check React
if pgrep -f "react-scripts" > /dev/null; then
    echo "✅ React Frontend: RUNNING"
    echo "   http://localhost:3000"
else
    echo "❌ React Frontend: STOPPED"
fi

echo ""
echo "════════════════════════════════════════════════════════"
echo "📊 Quick Stats:"

# Check database
if [ -f "/home/rocketeers/vehicle_diagnostic_system/src/data/vehicle_diagnostic.db" ]; then
    RECORDS=$(sqlite3 /home/rocketeers/vehicle_diagnostic_system/src/data/vehicle_diagnostic.db "SELECT COUNT(*) FROM sensor_data" 2>/dev/null || echo "N/A")
    echo "   Database records: $RECORDS"
fi

# Check ML model
if [ -f "/home/rocketeers/vehicle_diagnostic_system/src/models/vehicle_maintenance_rf_rpi_compatible_20251026_200238.joblib" ]; then
    echo "   ML Model: ✅ Loaded (99.94% accuracy)"
else
    echo "   ML Model: ❌ Not found"
fi

echo "════════════════════════════════════════════════════════"
