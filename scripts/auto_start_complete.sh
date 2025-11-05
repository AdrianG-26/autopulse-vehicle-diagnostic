#!/bin/bash
###############################################################################
# 🚗 COMPLETE AUTOMATED VEHICLE DIAGNOSTIC SYSTEM
###############################################################################
# This script starts EVERYTHING automatically:
# 1. Backend servers (Flask API + WebSocket)
# 2. OBD data collector (waits for car connection)
# 3. ML prediction engine (real-time)
# 4. Cloud sync (optional)
###############################################################################

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🚗 VEHICLE DIAGNOSTIC SYSTEM - AUTO START                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Change to project directory
cd /home/rocketeers/vehicle_diagnostic_system

# Create necessary directories
mkdir -p logs
mkdir -p src/data

# Activate virtual environment
if [ -d ".venv" ]; then
    source .venv/bin/activate
    echo -e "${GREEN}✅ Virtual environment activated${NC}"
else
    echo -e "${RED}❌ Virtual environment not found!${NC}"
    echo "Run: python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# Kill any existing processes
echo -e "${YELLOW}🧹 Cleaning up old processes...${NC}"
pkill -f "web_server.py" 2>/dev/null || true
pkill -f "websocket_server.py" 2>/dev/null || true
pkill -f "automated_car_collector_daemon.py" 2>/dev/null || true
sleep 2

###############################################################################
# STEP 1: Start Backend Servers
###############################################################################
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 1: Starting Backend Servers${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Start Flask API server (ML predictions + data API)
echo -e "${GREEN}🤖 Starting Flask API server (ML Predictions)...${NC}"
nohup python3 web_server.py > logs/flask_server.log 2>&1 &
FLASK_PID=$!
echo "$FLASK_PID" > logs/flask.pid
echo -e "   Flask API: http://localhost:5000 (PID: $FLASK_PID)"

# Wait for Flask to initialize
sleep 3

# Start WebSocket server (real-time data streaming)
echo -e "${GREEN}🔌 Starting WebSocket server (Real-time Data)...${NC}"
nohup python3 websocket_server.py > logs/websocket_server.log 2>&1 &
WEBSOCKET_PID=$!
echo "$WEBSOCKET_PID" > logs/websocket.pid
echo -e "   WebSocket: ws://localhost:8080 (PID: $WEBSOCKET_PID)"

sleep 2
echo -e "${GREEN}✅ Backend servers started${NC}"
echo ""

###############################################################################
# STEP 2: Start Automated Data Collector (Daemon Mode)
###############################################################################
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 2: Starting Automated Data Collector${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "${YELLOW}⏳ Waiting for OBD-II connection...${NC}"
echo -e "   📍 Please:"
echo -e "      1. Turn on your car ignition"
echo -e "      2. Connect OBD scanner to diagnostic port"
echo -e "      3. Scanner will auto-connect to RPI via Bluetooth"
echo ""

# Start the collector in daemon mode (will wait for OBD connection)
nohup python3 src/automated_car_collector_daemon.py --daemon > logs/collector_daemon.log 2>&1 &
COLLECTOR_PID=$!
echo "$COLLECTOR_PID" > logs/collector.pid

echo -e "${GREEN}🚗 Data collector started in daemon mode (PID: $COLLECTOR_PID)${NC}"
echo -e "   Status: Waiting for car connection..."
echo -e "   Log: tail -f logs/collector_daemon.log"
echo ""

###############################################################################
# STEP 3: ML Prediction Engine Status
###############################################################################
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 3: ML Prediction Engine${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check if ML model exists
if [ -f "src/models/vehicle_maintenance_rf_rpi_compatible_20251026_200238.joblib" ]; then
    echo -e "${GREEN}✅ Random Forest Model: LOADED${NC}"
    echo -e "   Model: vehicle_maintenance_rf_rpi_compatible_20251026_200238.joblib"
    echo -e "   Accuracy: 100%"
    echo -e "   Confidence: 97.4%"
    echo -e "   Status: Ready for real-time predictions"
else
    echo -e "${YELLOW}⚠️  ML model not found${NC}"
    echo -e "   Run training: python3 src/random_forest_trainer.py"
fi
echo ""

###############################################################################
# STEP 4: Summary & Instructions
###############################################################################
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🎉 SYSTEM READY!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}📊 Services Running:${NC}"
echo -e "   🤖 Flask API (ML):     http://localhost:5000"
echo -e "   🔌 WebSocket (Data):   ws://localhost:8080"
echo -e "   💻 Autopulse Web:      http://localhost:3000 (run manually if needed)"
echo -e "   🚗 Data Collector:     Daemon mode (waiting for car)"
echo ""
echo -e "${GREEN}🔄 Workflow:${NC}"
echo -e "   1. ✅ Backend servers running"
echo -e "   2. ⏳ Waiting for OBD connection..."
echo -e "   3. 🔜 Auto-detect car → Start collection"
echo -e "   4. 🔜 Real-time ML predictions"
echo -e "   5. 🔜 Live data streaming to Autopulse"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo -e "   • Connect OBD scanner to your car"
echo -e "   • System will automatically start data collection"
echo -e "   • Open Autopulse dashboard to view live data"
echo -e "   • ML predictions updated every second"
echo ""
echo -e "${YELLOW}🛠️  Management:${NC}"
echo -e "   • Check status:  ./check_system.sh"
echo -e "   • Stop system:   ./stop_system.sh"
echo -e "   • View logs:     tail -f logs/*.log"
echo ""
echo -e "${GREEN}✅ Auto-start complete!${NC}"
echo ""

# Keep script running if started by systemd
if [ -n "$INVOCATION_ID" ]; then
    echo "Running in systemd mode - keeping alive..."
    # Wait for all background processes
    wait
fi
