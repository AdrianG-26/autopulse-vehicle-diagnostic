#!/bin/bash

###############################################################################
# CHECK LIVE DEMO STATUS
###############################################################################

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "📊 LIVE DEMO STATUS CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Check OBD collector
echo "1️⃣  OBD Collector:"
if pgrep -f "automated_car_collector" > /dev/null; then
    echo "   ✅ Running"
else
    echo "   ❌ Not running"
fi
echo ""

# 2. Check sync process
echo "2️⃣  Supabase Sync:"
if pgrep -f "sync_to_supabase" > /dev/null; then
    echo "   ✅ Running"
    
    # Show last few log lines
    if [ -f "$PROJECT_ROOT/logs/sync.log" ]; then
        echo "   📄 Recent activity:"
        tail -5 "$PROJECT_ROOT/logs/sync.log" | sed 's/^/      /'
    fi
else
    echo "   ❌ Not running"
fi
echo ""

# 3. Check local database
echo "3️⃣  Local Database:"
DB_FILE="$PROJECT_ROOT/data/vehicle_data.db"
if [ -f "$DB_FILE" ]; then
    RECENT_COUNT=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM sensor_data WHERE timestamp > datetime('now', '-5 minutes');" 2>/dev/null || echo "0")
    echo "   ✅ Database exists"
    echo "   📊 Records in last 5 min: $RECENT_COUNT"
else
    echo "   ❌ Database not found"
fi
echo ""

# 4. Check Supabase connection
echo "4️⃣  Supabase Connection:"
if [ -f "$PROJECT_ROOT/src/.env" ]; then
    export $(cat "$PROJECT_ROOT/src/.env" | grep -v '^#' | xargs)
    
    if [ -n "$SUPABASE_URL" ]; then
        echo "   ✅ Configured"
        echo "   🔗 URL: $SUPABASE_URL"
    else
        echo "   ❌ Not configured"
    fi
else
    echo "   ❌ .env file missing"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
