#!/bin/bash

# AutoPulse Vehicle Diagnostic System - Auto Startup Script
# This script runs automatically when RPi boots up

echo "🚗 AutoPulse System Starting..."
echo "📅 $(date)"

# Set working directory
cd /home/rocketeers/vehicle_diagnostic_system

# Wait for network connection
echo "🌐 Waiting for network connection..."
while ! ping -c 1 google.com &> /dev/null; do
    sleep 2
done
echo "✅ Network connected"

# Load environment variables
export SUPABASE_URL="https://qimiewqthuhmofjhzrrb.supabase.co"
export SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpbWlld3F0aHVobW9mamh6cnJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Mjc5MTMsImV4cCI6MjA3MTEwMzkxM30.jHY0m_l-uvwaZd-x9POEpLdoP__oLUdE-7U-E5mZqz0"

# Create log directory
mkdir -p /home/rocketeers/autopulse_logs

# Wait for OBD adapter to be available
echo "🔌 Waiting for OBD adapter..."
for i in {1..30}; do
    if ls /dev/ttyUSB* 2>/dev/null || ls /dev/rfcomm* 2>/dev/null; then
        echo "✅ OBD adapter detected"
        break
    fi
    sleep 2
done

# Start the data collection and ML processing
echo "🔄 Starting AutoPulse services..."

# Activate virtual environment if it exists
if [ -d ".venv" ]; then
    source .venv/bin/activate
    echo "✅ Virtual environment activated"
fi

# Start the cloud collector (with auto-restart)
echo "📊 Starting Data Collector..."
python3 backend/cloud_collector_daemon.py > /home/rocketeers/autopulse_logs/collector.log 2>&1 &
COLLECTOR_PID=$!
echo "✅ Data Collector started (PID: $COLLECTOR_PID)"

# Wait a moment for collector to initialize
sleep 5

# Start the ML processing server (with auto-restart)  
echo "🤖 Starting ML Server..."
python3 backend/cloud_web_server.py > /home/rocketeers/autopulse_logs/server.log 2>&1 &
SERVER_PID=$!
echo "✅ ML Server started (PID: $SERVER_PID)"

# Save PIDs for monitoring
echo $COLLECTOR_PID > /home/rocketeers/autopulse_logs/collector.pid
echo $SERVER_PID > /home/rocketeers/autopulse_logs/server.pid

echo ""
echo "🎉 AutoPulse System fully operational!"
echo "📊 Data Flow: OBD → RPi → Supabase → Render → Vercel"
echo "📝 Logs: /home/rocketeers/autopulse_logs/"
echo "�� Local API: http://$(hostname -I | cut -d' ' -f1):5000/api/status"
echo ""

# Keep script running and monitor processes
while true; do
    sleep 60
    
    # Check if collector process is still running
    if ! kill -0 $COLLECTOR_PID 2>/dev/null; then
        echo "⚠️ $(date): Collector stopped, restarting..." | tee -a /home/rocketeers/autopulse_logs/system.log
        python3 backend/cloud_collector_daemon.py > /home/rocketeers/autopulse_logs/collector.log 2>&1 &
        COLLECTOR_PID=$!
        echo $COLLECTOR_PID > /home/rocketeers/autopulse_logs/collector.pid
    fi
    
    # Check if server process is still running
    if ! kill -0 $SERVER_PID 2>/dev/null; then
        echo "⚠️ $(date): ML Server stopped, restarting..." | tee -a /home/rocketeers/autopulse_logs/system.log
        python3 backend/cloud_web_server.py > /home/rocketeers/autopulse_logs/server.log 2>&1 &
        SERVER_PID=$!
        echo $SERVER_PID > /home/rocketeers/autopulse_logs/server.pid
    fi
    
    # Log system health every 10 minutes
    if [ $(($(date +%M) % 10)) -eq 0 ]; then
        echo "✅ $(date): System healthy - Collector: $COLLECTOR_PID, Server: $SERVER_PID" >> /home/rocketeers/autopulse_logs/system.log
    fi
done
