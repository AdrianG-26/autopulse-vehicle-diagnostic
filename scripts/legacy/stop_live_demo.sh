#!/bin/bash

###############################################################################
# STOP LIVE DEMO
###############################################################################

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🛑 Stopping Live Demo..."
echo ""

# Stop sync process
if [ -f "$PROJECT_ROOT/logs/sync.pid" ]; then
    SYNC_PID=$(cat "$PROJECT_ROOT/logs/sync.pid")
    if kill -0 $SYNC_PID 2>/dev/null; then
        kill $SYNC_PID
        echo "✓ Stopped sync process (PID: $SYNC_PID)"
    fi
    rm "$PROJECT_ROOT/logs/sync.pid"
fi

# Stop OBD collector
cd "$SCRIPT_DIR"
./stop_system.sh

echo ""
echo "✅ Live demo stopped"
