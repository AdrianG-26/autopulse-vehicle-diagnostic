#!/bin/bash

# 🚀 AutoPulse Quick Start & Verification Script
# Run this to verify the entire system is working

set -e  # Exit on error

PROJECT_ROOT="/home/rocketeers/vehicle_diagnostic_system"
cd "$PROJECT_ROOT"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        🚀 AutoPulse System Quick Start & Verification         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Environment Check
echo "📋 Step 1: Checking Environment..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d ".venv" ]; then
    echo "✅ Virtual environment exists"
else
    echo "❌ Virtual environment not found!"
    exit 1
fi

source .venv/bin/activate
echo "✅ Virtual environment activated"

# Check Python version
PYTHON_VERSION=$(python3 --version)
echo "✅ Python: $PYTHON_VERSION"

# Check critical packages
echo ""
echo "📦 Checking Python packages..."
for package in obd supabase pandas flask scikit-learn; do
    if pip show "$package" &> /dev/null; then
        VERSION=$(pip show "$package" | grep Version | awk '{print $2}')
        echo "   ✅ $package ($VERSION)"
    else
        echo "   ❌ $package - NOT INSTALLED"
    fi
done

# Step 2: OBD Connection
echo ""
echo "�� Step 2: Checking OBD Connection..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if hcitool con | grep -q "00:1D:A5:68:98:8A"; then
    echo "✅ OBD Bluetooth device connected"
else
    echo "⚠️  OBD Bluetooth device not connected"
    echo "   Run: bash scripts/obd/obd_autoconnect.sh"
fi

if [ -e "/dev/rfcomm0" ]; then
    echo "✅ Serial device /dev/rfcomm0 exists"
else
    echo "⚠️  Serial device /dev/rfcomm0 not found"
fi

# Step 3: Database Check
echo ""
echo "🗄️  Step 3: Checking Database..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "src/data/vehicle_data.db" ]; then
    DB_SIZE=$(du -h src/data/vehicle_data.db | awk '{print $1}')
    echo "✅ Local database exists (${DB_SIZE})"
    
    # Count records
    PROFILES=$(sqlite3 src/data/vehicle_data.db "SELECT COUNT(*) FROM car_profiles;")
    SENSORS=$(sqlite3 src/data/vehicle_data.db "SELECT COUNT(*) FROM sensor_data;")
    echo "   📊 Car Profiles: $PROFILES"
    echo "   📊 Sensor Records: $SENSORS"
else
    echo "⚠️  Local database not found"
fi

# Step 4: Supabase Connection
echo ""
echo "☁️  Step 4: Testing Supabase Connection..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

python3 << 'PYTHON_TEST'
import os
from dotenv import load_dotenv

load_dotenv('src/.env')

try:
    from supabase import create_client
    
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ Supabase credentials not found in src/.env")
        exit(1)
    
    supabase = create_client(supabase_url, supabase_key)
    response = supabase.table('vehicle_profiles').select('*').limit(1).execute()
    
    print(f"✅ Supabase connected successfully")
    print(f"   📡 URL: {supabase_url}")
    
except Exception as e:
    print(f"❌ Supabase connection failed: {e}")
    exit(1)
PYTHON_TEST

# Step 5: Services Status
echo ""
echo "⚙️  Step 5: Checking System Services..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if systemctl is-active --quiet autopulse.service; then
    echo "✅ autopulse.service is running"
    AUTOPULSE_UPTIME=$(systemctl show autopulse.service --property=ActiveEnterTimestamp | cut -d'=' -f2)
    echo "   ⏱️  Started: $AUTOPULSE_UPTIME"
else
    echo "⚠️  autopulse.service is not running"
    echo "   Start with: sudo systemctl start autopulse.service"
fi

if systemctl is-active --quiet obd-autoconnect.service; then
    echo "✅ obd-autoconnect.service is running"
else
    echo "⚠️  obd-autoconnect.service is not running"
fi

# Step 6: Network Connectivity
echo ""
echo "🌐 Step 6: Testing Network Connectivity..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ping -c 1 -W 2 qimiewqthuhmofjhzrrb.supabase.co &> /dev/null; then
    echo "✅ Can reach Supabase server"
else
    echo "❌ Cannot reach Supabase server"
fi

if ping -c 1 -W 2 autopulse-backend.onrender.com &> /dev/null; then
    echo "✅ Can reach Render backend"
else
    echo "⚠️  Cannot reach Render backend (might be asleep)"
fi

# Step 7: Test Database Functions
echo ""
echo "🧪 Step 7: Testing Database Functions..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

python3 << 'PYTHON_DB_TEST'
import sys
sys.path.insert(0, 'src')

try:
    from enhanced_database import EnhancedVehicleDatabase
    
    db = EnhancedVehicleDatabase()
    
    # Test view_car_profiles
    import io
    import sys
    old_stdout = sys.stdout
    sys.stdout = io.StringIO()
    
    try:
        db.view_car_profiles()
        sys.stdout = old_stdout
        print("✅ view_car_profiles() - No errors")
    except Exception as e:
        sys.stdout = old_stdout
        print(f"❌ view_car_profiles() - Error: {e}")
        
    # Test quick_view
    sys.stdout = io.StringIO()
    
    try:
        db.quick_view()
        sys.stdout = old_stdout
        print("✅ quick_view() - No errors")
    except Exception as e:
        sys.stdout = old_stdout
        print(f"❌ quick_view() - Error: {e}")
        
except Exception as e:
    print(f"❌ Database test failed: {e}")
PYTHON_DB_TEST

# Summary
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    🎯 Verification Complete                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Next Steps:"
echo ""
echo "   1️⃣  Test OBD Live Data:"
echo "      ./obd-live"
echo ""
echo "   2️⃣  View Database (Interactive):"
echo "      cd src && python3 enhanced_database.py"
echo ""
echo "   3️⃣  Watch Real-Time Logs:"
echo "      sudo journalctl -u autopulse.service -f"
echo ""
echo "   4️⃣  Check Complete Status:"
echo "      ./autopulse status"
echo ""
echo "   5️⃣  View Documentation:"
echo "      cat docs/SYSTEM_INITIALIZATION.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚗 AutoPulse Vehicle Diagnostic System v3.0"
echo "   Documentation: docs/"
echo "   Quick Commands: ./autopulse, ./obd-test, ./obd-live, ./status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
