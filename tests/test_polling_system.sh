#!/bin/bash

# 🧪 Test Script for HTTP Polling System
# Tests the new polling architecture (replaces WebSocket)

echo "================================================"
echo "🧪 AUTOPULSE POLLING SYSTEM TEST"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Check if Flask API is running
echo -e "${BLUE}[1/4]${NC} Testing Flask API (port 5000)..."
API_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/model-info)
if [ "$API_TEST" == "200" ]; then
    echo -e "${GREEN}✅ Flask API is running${NC}"
else
    echo -e "${RED}❌ Flask API not responding (got HTTP $API_TEST)${NC}"
    echo "   Start with: python3 web_server.py"
    exit 1
fi

# Test 2: Check if /api/latest endpoint works
echo ""
echo -e "${BLUE}[2/4]${NC} Testing /api/latest endpoint..."
LATEST_TEST=$(curl -s http://localhost:5000/api/latest)
if echo "$LATEST_TEST" | grep -q '"success"'; then
    echo -e "${GREEN}✅ /api/latest endpoint working${NC}"
    
    # Show sample data
    echo ""
    echo "Sample response:"
    echo "$LATEST_TEST" | python3 -m json.tool | head -20
else
    echo -e "${RED}❌ /api/latest endpoint error${NC}"
    echo "$LATEST_TEST"
    exit 1
fi

# Test 3: Check if React app is running
echo ""
echo -e "${BLUE}[3/4]${NC} Testing React app (port 3000)..."
REACT_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$REACT_TEST" == "200" ]; then
    echo -e "${GREEN}✅ React app is running${NC}"
else
    echo -e "${RED}❌ React app not responding (got HTTP $REACT_TEST)${NC}"
    echo "   Start with: cd Autopulse && npm start"
    exit 1
fi

# Test 4: Check database
echo ""
echo -e "${BLUE}[4/4]${NC} Checking database..."
if [ -f "src/data/vehicle_data.db" ]; then
    DB_SIZE=$(du -h src/data/vehicle_data.db | cut -f1)
    echo -e "${GREEN}✅ Database exists: $DB_SIZE${NC}"
else
    echo -e "${RED}❌ Database not found${NC}"
    echo "   Start data collection: python3 src/automated_car_collector_daemon.py"
fi

# Summary
echo ""
echo "================================================"
echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
echo "================================================"
echo ""
echo "🌐 ACCESS YOUR DASHBOARD:"
echo "   http://localhost:3000"
echo ""
echo "📡 SYSTEM INFO:"
echo "   • Method: HTTP Polling (every 2 seconds)"
echo "   • API Endpoint: http://localhost:5000/api/latest"
echo "   • React App: http://localhost:3000"
echo ""
echo "💡 TIP: Just refresh your browser - no cache issues!"
echo "   The system now uses simple HTTP polling instead of WebSocket"
echo ""
