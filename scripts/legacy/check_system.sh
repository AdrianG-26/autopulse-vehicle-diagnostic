#!/bin/bash
# 🚗 Vehicle Diagnostic System - Status Check
# Check which services are running

echo "🔍 Vehicle Diagnostic System Status"
echo "=================================="

cd /home/rocketeers/vehicle_diagnostic_system

echo ""
echo "🤖 Flask API Server (port 5000):"
if pgrep -f "web_server.py" > /dev/null; then
    echo "   ✅ Running (PID: $(pgrep -f 'web_server.py'))"
    curl -s http://localhost:5000/api/model-info > /dev/null && echo "   ✅ API responding" || echo "   ❌ API not responding"
else
    echo "   ❌ Not running"
fi

echo ""
echo "🔌 WebSocket Server (port 8080):"
if pgrep -f "websocket_server.py" > /dev/null; then
    echo "   ✅ Running (PID: $(pgrep -f 'websocket_server.py'))"
else
    echo "   ❌ Not running"
fi

echo ""
echo "💻 React Development Server (port 3000):"
if pgrep -f "npm start" > /dev/null || pgrep -f "react-scripts" > /dev/null; then
    echo "   ✅ Running"
    curl -s http://localhost:3000 > /dev/null && echo "   ✅ App accessible" || echo "   ❌ App not accessible"
else
    echo "   ❌ Not running"
fi

echo ""
echo "🚗 OBD Data Collector:"
if pgrep -f "automated_car_collector_daemon.py" > /dev/null; then
    echo "   ✅ Running (PID: $(pgrep -f 'automated_car_collector_daemon.py'))"
else
    echo "   ❌ Not running"
fi

echo ""
echo "📊 Database Status:"
if [ -f "data/vehicle_data.db" ]; then
    RECORDS=$(python3 -c "import sqlite3; conn = sqlite3.connect('data/vehicle_data.db'); cursor = conn.cursor(); cursor.execute('SELECT COUNT(*) FROM enhanced_sensor_data'); print(cursor.fetchone()[0]); conn.close()" 2>/dev/null || echo "0")
    echo "   ✅ Database exists ($RECORDS records)"
else
    echo "   ❌ No database found"
fi

echo ""
echo "🔗 Quick Access URLs:"
echo "   🤖 API:      http://localhost:5000"
echo "   💻 Web App:  http://localhost:3000"
echo "   🔌 WebSocket: ws://localhost:8080"