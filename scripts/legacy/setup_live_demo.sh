#!/bin/bash

###############################################################################
#
#  🎯 LIVE DEMO SETUP SCRIPT
#  
#  Purpose: Automate setup for thesis demonstration with live OBD data
#  Author: Vehicle Diagnostic System
#  Usage: ./setup_live_demo.sh
#
###############################################################################

set -e  # Exit on error

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
cat << "BANNER"
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║          🎯 LIVE DEMO SETUP FOR THESIS PRESENTATION              ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
BANNER
echo -e "${NC}"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SRC_DIR="$PROJECT_ROOT/src"
DATA_DIR="$PROJECT_ROOT/data"

echo -e "${YELLOW}📁 Project root: $PROJECT_ROOT${NC}\n"

###############################################################################
# STEP 1: Check if .env exists in src/
###############################################################################

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 1: Checking Supabase Configuration${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

ENV_FILE="$SRC_DIR/.env"

if [ -f "$ENV_FILE" ]; then
    echo -e "${GREEN}✓ .env file found${NC}"
    
    # Check if it has Supabase config
    if grep -q "SUPABASE_URL" "$ENV_FILE" && grep -q "SUPABASE_KEY" "$ENV_FILE"; then
        echo -e "${GREEN}✓ Supabase credentials configured${NC}\n"
    else
        echo -e "${YELLOW}⚠ Supabase credentials missing in .env${NC}"
        echo -e "${YELLOW}Adding Supabase configuration...${NC}\n"
        
        cat >> "$ENV_FILE" << 'ENVEOF'

# Supabase Configuration
SUPABASE_URL=https://qimiewqthuhmofjhzrrb.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpbWlld3F0aHVobW9mamh6cnJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Mjc5MTMsImV4cCI6MjA3MTEwMzkxM30.jHY0m_l-uvwaZd-x9POEpLdoP__oLUdE-7U-E5mZqz0
USER_ID=00000000-0000-0000-0000-000000000001
ENVEOF
        
        echo -e "${GREEN}✓ Supabase configuration added${NC}\n"
    fi
else
    echo -e "${YELLOW}⚠ .env file not found. Creating...${NC}\n"
    
    cat > "$ENV_FILE" << 'ENVEOF'
# Supabase Configuration
SUPABASE_URL=https://qimiewqthuhmofjhzrrb.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpbWlld3F0aHVobW9mamh6cnJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Mjc5MTMsImV4cCI6MjA3MTEwMzkxM30.jHY0m_l-uvwaZd-x9POEpLdoP__oLUdE-7U-E5mZqz0
USER_ID=00000000-0000-0000-0000-000000000001
ENVEOF
    
    echo -e "${GREEN}✓ .env file created with Supabase credentials${NC}\n"
fi

###############################################################################
# STEP 2: Install Python dependencies
###############################################################################

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 2: Installing Dependencies${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${YELLOW}Checking for supabase-py...${NC}"

if python3 -c "import supabase" 2>/dev/null; then
    echo -e "${GREEN}✓ supabase-py already installed${NC}\n"
else
    echo -e "${YELLOW}Installing supabase-py...${NC}"
    pip3 install supabase --quiet
    echo -e "${GREEN}✓ supabase-py installed${NC}\n"
fi

###############################################################################
# STEP 3: Check local database
###############################################################################

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 3: Checking Local Database${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

DB_FILE="$DATA_DIR/vehicle_data.db"

if [ -f "$DB_FILE" ]; then
    echo -e "${GREEN}✓ Local database found: $DB_FILE${NC}"
    
    # Check record count
    RECORD_COUNT=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM sensor_data;" 2>/dev/null || echo "0")
    echo -e "${GREEN}✓ Database contains $RECORD_COUNT sensor records${NC}\n"
    
    if [ "$RECORD_COUNT" -eq 0 ]; then
        echo -e "${YELLOW}⚠ Database is empty. You need to:${NC}"
        echo -e "${YELLOW}  1. Connect OBD scanner to car${NC}"
        echo -e "${YELLOW}  2. Run: cd $SCRIPT_DIR && ./start_system.sh${NC}"
        echo -e "${YELLOW}  3. Wait 5-10 minutes for data collection${NC}\n"
    fi
else
    echo -e "${YELLOW}⚠ Local database not found${NC}"
    echo -e "${YELLOW}  Database will be created when OBD collector starts${NC}\n"
fi

###############################################################################
# STEP 4: Test Supabase connection
###############################################################################

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 4: Testing Supabase Connection${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Export env vars for Python script
export $(cat "$ENV_FILE" | grep -v '^#' | xargs 2>/dev/null || true)

# Create test script
TEST_SCRIPT=$(mktemp /tmp/test_supabase.XXXXXX.py)

cat > "$TEST_SCRIPT" << 'PYEOF'
import os
import sys

try:
    from supabase import create_client, Client
    
    url = os.environ.get('SUPABASE_URL')
    key = os.environ.get('SUPABASE_KEY')
    
    if not url or not key:
        print("❌ Missing SUPABASE_URL or SUPABASE_KEY")
        sys.exit(1)
    
    client: Client = create_client(url, key)
    
    # Try to query vehicle_profiles
    response = client.table('vehicle_profiles').select('*').limit(1).execute()
    
    print(f"✓ Connected to Supabase successfully")
    print(f"✓ URL: {url}")
    sys.exit(0)
    
except Exception as e:
    print(f"❌ Connection failed: {e}")
    sys.exit(1)
PYEOF

if python3 "$TEST_SCRIPT"; then
    echo -e "${GREEN}✓ Supabase connection successful${NC}\n"
else
    echo -e "${RED}✗ Supabase connection failed${NC}"
    echo -e "${YELLOW}  Check your SUPABASE_URL and SUPABASE_KEY in $ENV_FILE${NC}\n"
    rm "$TEST_SCRIPT"
    exit 1
fi

rm "$TEST_SCRIPT"

echo -e "${GREEN}"
cat << "COMPLETE"
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║                    ✅ SETUP COMPLETE!                            ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
COMPLETE
echo -e "${NC}"

echo -e "${YELLOW}NEXT STEPS FOR LIVE DEMO:${NC}\n"
echo -e "   ${GREEN}1.${NC} ./start_live_demo.sh     - Start everything"
echo -e "   ${GREEN}2.${NC} ./check_live_demo.sh     - Check status"
echo -e "   ${GREEN}3.${NC} ./stop_live_demo.sh      - Stop when done\n"

