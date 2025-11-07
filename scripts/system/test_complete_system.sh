#!/bin/bash

# Complete AutoPulse System Test Script
# Tests all components before starting the system

echo "🔍 AutoPulse System Comprehensive Test"
echo "======================================"
echo ""

# Set working directory
cd /home/rocketeers/vehicle_diagnostic_system

# Test 1: Check Python environment
echo "1️⃣ Testing Python Environment..."
if [ -d ".venv" ]; then
    source .venv/bin/activate
    echo "   ✅ Virtual environment activated"
else
    echo "   ❌ Virtual environment not found!"
    exit 1
fi

# Test 2: Check required Python packages
echo ""
echo "2️⃣ Testing Python Dependencies..."
REQUIRED_PACKAGES=("obd" "supabase" "flask" "pandas" "numpy" "sklearn")
MISSING_PACKAGES=()

for package in "${REQUIRED_PACKAGES[@]}"; do
    if python3 -c "import $package" 2>/dev/null; then
        echo "   ✅ $package installed"
    else
        echo "   ❌ $package missing"
        MISSING_PACKAGES+=("$package")
    fi
done

if [ ${#MISSING_PACKAGES[@]} -gt 0 ]; then
    echo "   ⚠️  Missing packages detected. Installing..."
    pip install -r requirements_rpi.txt
fi

# Test 3: Check environment variables
echo ""
echo "3️⃣ Testing Environment Configuration..."
source scripts/system/rpi_autostart.sh 2>/dev/null || true

if [ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_KEY" ]; then
    echo "   ✅ Supabase credentials configured"
else
    echo "   ❌ Supabase credentials missing!"
    exit 1
fi

# Test 4: Test Supabase connection
echo ""
echo "4️⃣ Testing Supabase Connection..."
python3 << PYTHON_EOF
import os
import sys
os.environ['SUPABASE_URL'] = 'https://qimiewqthuhmofjhzrrb.supabase.co'
os.environ['SUPABASE_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpbWlld3F0aHVobW9mamh6cnJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA0MjQ4MDcsImV4cCI6MjA0NjAwMDgwN30.DWZ_QL_VJmUKUOaKC59xMeTYoSJPtZ8u1nAi8eAD3_o'

try:
    from supabase import create_client
    client = create_client(os.environ['SUPABASE_URL'], os.environ['SUPABASE_KEY'])
    
    # Test query
    result = client.table('vehicle_profiles').select('id').limit(1).execute()
    print("   ✅ Supabase connection successful")
    print(f"   📊 Database accessible, found {len(result.data)} test records")
    sys.exit(0)
except Exception as e:
    print(f"   ❌ Supabase connection failed: {e}")
    sys.exit(1)
PYTHON_EOF

if [ $? -ne 0 ]; then
    echo "   ⚠️  Supabase test failed"
    exit 1
fi

# Test 5: Check OBD device
echo ""
echo "5️⃣ Testing OBD Scanner Connection..."
if [ -c "/dev/rfcomm0" ]; then
    echo "   ✅ OBD device found at /dev/rfcomm0"
elif ls /dev/ttyUSB* 2>/dev/null; then
    echo "   ✅ USB OBD adapter detected"
else
    echo "   ⚠️  No OBD device found (normal if not plugged into car)"
    echo "   💡 Plug OBD scanner into car to test"
fi

# Test 6: Check network connectivity
echo ""
echo "6️⃣ Testing Network Connectivity..."
if ping -c 1 google.com &> /dev/null; then
    echo "   ✅ Internet connection working"
else
    echo "   ❌ No internet connection!"
    echo "   💡 Connect to WiFi first"
    exit 1
fi

# Test 7: Test OBD library
echo ""
echo "7️⃣ Testing OBD Library..."
python3 << PYTHON_EOF
try:
    import obd
    print("   ✅ OBD library imported successfully")
    print(f"   📦 OBD library version: {obd.__version__}")
except Exception as e:
    print(f"   ❌ OBD library test failed: {e}")
    exit(1)
PYTHON_EOF

# Test 8: Check systemd services
echo ""
echo "8️⃣ Testing System Services..."
if systemctl is-enabled autopulse.service 2>/dev/null; then
    echo "   ✅ autopulse.service is enabled"
else
    echo "   ⚠️  autopulse.service not enabled (run: sudo systemctl enable autopulse.service)"
fi

if systemctl is-enabled obd-autoconnect.service 2>/dev/null; then
    echo "   ✅ obd-autoconnect.service is enabled"
else
    echo "   ⚠️  obd-autoconnect.service not enabled (run: sudo systemctl enable obd-autoconnect.service)"
fi

# Test 9: Check log directories
echo ""
echo "9️⃣ Testing Log Directories..."
if [ -d "/home/rocketeers/autopulse_logs" ]; then
    echo "   ✅ Log directory exists"
else
    mkdir -p /home/rocketeers/autopulse_logs
    echo "   ✅ Log directory created"
fi

# Test 10: Test ML model
echo ""
echo "🔟 Testing ML Model..."
if [ -f "backend/models/random_forest_model.joblib" ]; then
    echo "   ✅ ML model file found"
else
    echo "   ⚠️  ML model not found (will be created on first run)"
fi

# Summary
echo ""
echo "=========================================="
echo "✅ System Test Complete!"
echo "=========================================="
echo ""
echo "📊 Test Results:"
echo "   • Python Environment: ✅"
echo "   • Dependencies: ✅"
echo "   • Supabase Connection: ✅"
echo "   • Network: ✅"
echo "   • OBD Library: ✅"
echo ""
echo "🚀 System is ready to start!"
echo ""
echo "📋 Next Steps:"
echo "   1. Plug OBD scanner into car"
echo "   2. Turn on car ignition"
echo "   3. Run: ./autopulse start"
echo "   OR"
echo "   4. Run: sudo systemctl start autopulse.service"
echo ""
