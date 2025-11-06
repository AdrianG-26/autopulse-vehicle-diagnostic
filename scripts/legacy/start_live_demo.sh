#!/bin/bash

###############################################################################
# START LIVE DEMO - Run this on demo day!
###############################################################################

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SRC_DIR="$PROJECT_ROOT/src"

echo "🚀 Starting Live Demo Setup..."
echo ""

# 1. Start OBD collector
echo "1️⃣  Starting OBD collector..."
cd "$SCRIPT_DIR"
./start_system.sh
echo ""

# 2. Wait a bit
echo "⏳ Waiting 10 seconds for collector to initialize..."
sleep 10
echo ""

# 3. Start sync script in background
echo "2️⃣  Starting Supabase sync..."
cd "$SRC_DIR"
export $(cat .env | grep -v '^#' | xargs)

# Kill any existing sync process
pkill -f "sync_to_supabase.py" 2>/dev/null || true

# Start sync in background
nohup python3 sync_to_supabase.py --continuous > ../logs/sync.log 2>&1 &
SYNC_PID=$!
echo $SYNC_PID > ../logs/sync.pid
echo "✓ Sync process started (PID: $SYNC_PID)"
echo ""

# 4. Show status
echo "3️⃣  Checking status..."
echo ""
cd "$SCRIPT_DIR"
./check_live_demo.sh
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ LIVE DEMO READY!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Monitor sync: tail -f $PROJECT_ROOT/logs/sync.log"
echo "📱 Open website: http://localhost:3000"
echo "📱 Open mobile app: npx expo start"
echo ""
echo "To stop: ./stop_live_demo.sh"
echo ""
