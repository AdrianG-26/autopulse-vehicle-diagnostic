#!/bin/bash
# 🚗 Vehicle Diagnostic System - Stop Script
# Safely stop all running services

echo "🛑 Stopping Vehicle Diagnostic System..."

# Change to project directory
cd /home/rocketeers/vehicle_diagnostic_system

# Kill processes by name (safer than PID files)
echo "Stopping Flask API server..."
pkill -f "web_server.py"

echo "Stopping WebSocket server..."  
pkill -f "websocket_server.py"

echo "Stopping React development server..."
pkill -f "npm start"
pkill -f "react-scripts"

echo "Stopping OBD data collector..."
pkill -f "automated_car_collector_daemon.py"

# Clean up PID files
rm -f logs/flask.pid logs/websocket.pid logs/react.pid

echo ""
echo "✅ All services stopped successfully!"
echo "🔌 You can now safely disconnect from SSH"