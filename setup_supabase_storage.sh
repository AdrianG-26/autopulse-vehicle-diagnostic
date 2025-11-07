#!/bin/bash

# 🚀 AutoPulse Supabase Storage Setup
# This script sets up Supabase storage for Raspberry Pi data collection

cd /home/rocketeers/vehicle_diagnostic_system
source .venv/bin/activate

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          🚀 Setting Up Supabase Storage                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check internet
echo "🌐 Checking internet connection..."
if ! ping -c 1 -W 2 google.com &> /dev/null; then
    echo "❌ No internet connection"
    echo "   Please connect to the internet and run this script again"
    exit 1
fi
echo "✅ Internet connected"

# Run setup
python3 << 'EOF'
from dotenv import load_dotenv
import os
load_dotenv('src/.env', override=True)

from supabase import create_client
from datetime import datetime, timezone

print("\n📡 Connecting to Supabase...")

supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_KEY')
)

user_id = os.getenv('USER_ID')

# Step 1: Create user
print("\n👤 Creating User...")
try:
    user_check = supabase.table('users').select('*').eq('id', user_id).execute()
    
    if not user_check.data:
        new_user = {
            'id': user_id,
            'email': 'admin@autopulse.local',
            'username': 'admin'
        }
        user_result = supabase.table('users').upsert(new_user, on_conflict='id').execute()
        print(f"✅ Created user: admin")
    else:
        print(f"✅ User exists: {user_check.data[0].get('username', 'admin')}")
except Exception as e:
    error_msg = str(e)
    if 'row-level security' in error_msg.lower() or '42501' in error_msg:
        print(f"\n❌ RLS is blocking access. Please disable RLS first:")
        print(f"\n📋 Go to: https://supabase.com/dashboard/project/qimiewqthuhmofjhzrrb/sql/new")
        print(f"\nCopy and run this SQL:")
        print("""
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_telemetry_vehicle_timestamp 
ON telemetry_data(vehicle_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_telemetry_timestamp 
ON telemetry_data(timestamp DESC);
        """)
        print(f"\nThen run this script again: ./setup_supabase_storage.sh")
        exit(1)
    elif 'password' in error_msg.lower() and 'not-null' in error_msg.lower():
        print(f"\n❌ Password column needs to be nullable")
        print(f"\nRun this SQL in Supabase:")
        print("ALTER TABLE users ALTER COLUMN password DROP NOT NULL;")
        exit(1)
    else:
        print(f"❌ Error: {error_msg}")
        exit(1)

# Step 2: Create vehicle
print("\n🚗 Creating Vehicle Profile...")
try:
    vehicle_check = supabase.table('vehicles').select('*').eq('name', 'Toyota Veloz 2023').limit(1).execute()
    
    if not vehicle_check.data:
        new_vehicle = {
            'user_id': user_id,
            'name': 'Toyota Veloz 2023',
            'make': 'Toyota',
            'model': 'Veloz',
            'year': 2023
        }
        vehicle_result = supabase.table('vehicles').insert(new_vehicle).execute()
        vehicle_id = vehicle_result.data[0]['id']
        print(f"✅ Created vehicle ID: {vehicle_id}")
    else:
        vehicle_id = vehicle_check.data[0]['id']
        print(f"✅ Vehicle exists: ID {vehicle_id}")
        
    # Save vehicle ID to file for collector
    with open('/home/rocketeers/vehicle_diagnostic_system/.vehicle_id', 'w') as f:
        f.write(str(vehicle_id))
        
except Exception as e:
    print(f"❌ Vehicle error: {e}")
    exit(1)

# Step 3: Test telemetry storage
print("\n📊 Testing Telemetry Storage...")
try:
    test_data = {
        'vehicle_id': vehicle_id,
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'rpm': 800,
        'speed': 0,
        'coolant_temp': 90.0,
        'engine_load_pct': 20.0,
        'throttle_position': 5.0,
        'fuel_level_pct': 85.0
    }
    
    result = supabase.table('telemetry_data').insert(test_data).execute()
    
    if result.data:
        print(f"✅ Successfully stored test telemetry!")
        print(f"   RPM: {result.data[0]['rpm']}")
        print(f"   Temp: {result.data[0]['coolant_temp']:.1f}°C")
        print(f"   Load: {result.data[0]['engine_load_pct']:.1f}%")
    else:
        print("⚠️  No data returned")
        
except Exception as e:
    print(f"❌ Telemetry error: {e}")
    exit(1)

print("\n" + "=" * 70)
print("🎉 SUCCESS! Supabase storage is configured!")
print("\n✅ Setup Complete:")
print("   • User created in Supabase")
print("   • Vehicle profile created")
print("   • Telemetry storage tested")
print("   • Vehicle ID saved")
print("\n📊 View Data:")
print("   https://supabase.com/dashboard/project/qimiewqthuhmofjhzrrb/editor/telemetry_data")
print("\n🚀 Next: Start data collection service")
print("   sudo systemctl restart autopulse.service")
print("=" * 70)

EOF
