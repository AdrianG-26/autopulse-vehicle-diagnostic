#!/bin/bash
# 🚗 Vehicle Diagnostic System - Startup Script
# Run this script tomorrow to restart all services

echo "🚀 Starting Vehicle Diagnostic System..."

# Change to project directory
cd /home/rocketeers/vehicle_diagnostic_system

# Activate virtual environment
source .venv/bin/activate

echo "✅ Virtual environment activated"

# Start Flask API server (with ML predictions)
echo "🤖 Starting Flask API server..."
nohup python3 web_server.py > logs/flask_server.log 2>&1 &
FLASK_PID=$!
echo "Flask API running (PID: $FLASK_PID)"

# Wait a moment for Flask to start
sleep 3

# Start WebSocket server for real-time data
echo "🔌 Starting WebSocket server..."
nohup python3 websocket_server.py > logs/websocket_server.log 2>&1 &
WEBSOCKET_PID=$!
echo "WebSocket server running (PID: $WEBSOCKET_PID)"

# Start React development server
echo "💻 Starting React development server..."
cd Autopulse
nohup npm start > ../logs/react_server.log 2>&1 &
REACT_PID=$!
cd ..

echo "React app running (PID: $REACT_PID)"

# Create logs directory if it doesn't exist
mkdir -p logs

# Save process IDs for easy management
echo "$FLASK_PID" > logs/flask.pid
echo "$WEBSOCKET_PID" > logs/websocket.pid  
echo "$REACT_PID" > logs/react.pid

echo ""
echo "🎉 All services started successfully!"
echo ""
echo "📊 Your system is now running:"
echo "   🤖 Flask API:      http://localhost:5000"
echo "   💻 React App:      http://localhost:3000"
echo "   🔌 WebSocket:      ws://localhost:8080"
echo ""
echo "📝 To stop all services, run: ./stop_system.sh"
echo "📋 To check status, run: ./check_system.sh"
echo ""
echo "🚗 Don't forget to:"
echo "   1. Start your car engine"
echo "   2. Connect OBD scanner to diagnostic port"
echo "   3. Run: python3 src/automated_car_collector_daemon.py --interactive"