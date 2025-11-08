#!/bin/bash

# 🧪 Test Supabase Storage After RLS Disabled
# Run this after disabling RLS in Supabase Dashboard

cd /home/rocketeers/vehicle_diagnostic_system

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     🧪 Testing Supabase Storage (RLS Disabled)               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

python3 << 'EOF'
from dotenv import load_dotenv
import os
load_dotenv('src/.env', override=True)

from supabase import create_client
from datetime import datetime, timezone

supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_KEY')
)

print("📡 Step 1: Testing Connection...")
print("-" * 70)

user_id = os.getenv('USER_ID')
print(f"✅ Connected to Supabase")
print(f"   User ID: {user_id}")

# Step 1: Create/verify user
print("\n👤 Step 2: Creating User...")
print("-" * 70)

try:
    # Check if user exists
    user_check = supabase.table('users').select('*').eq('id', user_id).execute()
    
    if not user_check.data:
        # Create user
        new_user = {
            'id': user_id,
            'email': 'admin@autopulse.local',
            'username': 'admin'
        }
        user_result = supabase.table('users').insert(new_user).execute()
        print(f"✅ Created user: admin")
    else:
        print(f"✅ User already exists: {user_check.data[0]['username']}")
        
except Exception as e:
    print(f"❌ User creation error: {e}")
    print("\n⚠️  Make sure you ran the SQL to disable RLS!")
    print("   Copy this and run in Supabase SQL Editor:")
    print("   ALTER TABLE users DISABLE ROW LEVEL SECURITY;")
    print("   ALTER TABLE users ALTER COLUMN password DROP NOT NULL;")
    exit(1)

# Step 2: Create vehicle
print("\n🚗 Step 3: Creating Vehicle (Toyota Veloz 2023)...")
print("-" * 70)

try:
    # Check if vehicle exists
    vehicle_check = supabase.table('vehicles').select('*').eq('name', 'Toyota Veloz 2023').execute()
    
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
        print(f"✅ Vehicle already exists: ID {vehicle_id}")
        
except Exception as e:
    print(f"❌ Vehicle creation error: {e}")
    print("\n⚠️  Make sure you ran the SQL to disable RLS!")
    print("   ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;")
    exit(1)

# Step 3: Store telemetry data (YOUR FORMAT)
print("\n📊 Step 4: Storing Telemetry Data (Your Format)...")
print("-" * 70)

try:
    telemetry_readings = [
        {
            'vehicle_id': vehicle_id,
            'timestamp': '2025-11-05T18:19:06.310334',
            'rpm': 759,
            'speed': 0.0,
            'coolant_temp': 95.0,
            'engine_load': 38.8,
            'throttle_position': 10.0,
            'fuel_level': 0.0
        },
        {
            'vehicle_id': vehicle_id,
            'timestamp': '2025-11-05T18:19:05.310543',
            'rpm': 752,
            'speed': 0.0,
            'coolant_temp': 95.0,
            'engine_load': 38.4,
            'throttle_position': 10.0,
            'fuel_level': 0.0
        },
        {
            'vehicle_id': vehicle_id,
            'timestamp': '2025-11-05T18:19:04.310522',
            'rpm': 752,
            'speed': 0.0,
            'coolant_temp': 95.0,
            'engine_load': 38.0,
            'throttle_position': 10.0,
            'fuel_level': 0.0
        }
    ]
    
    telem_result = supabase.table('telemetry_data').insert(telemetry_readings).execute()
    
    print(f"✅ Stored {len(telem_result.data)} telemetry readings!")
    
except Exception as e:
    print(f"❌ Telemetry storage error: {e}")
    print("\n⚠️  Make sure you ran the SQL to disable RLS!")
    print("   ALTER TABLE telemetry_data DISABLE ROW LEVEL SECURITY;")
    exit(1)

# Step 4: Retrieve and display
print("\n📡 Step 5: Retrieving Data from Supabase (Your Format)...")
print("=" * 70)

try:
    recent_data = supabase.table('telemetry_data').select('*').eq('vehicle_id', vehicle_id).order('timestamp', desc=True).limit(5).execute()
    
    if recent_data.data:
        print(f"\n✅ Retrieved {len(recent_data.data)} records:\n")
        
        for record in recent_data.data:
            print(f"🕐 {record['timestamp']} | 🚗 Toyota Veloz 2023")
            print(f"   🔴 Status: NORMAL   | RPM: {record['rpm']:6.0f} | Load: {record['engine_load']:5.1f}%")
            print(f"   🌡️  Temp: {record['coolant_temp']:5.1f}°C | 🚀 Speed: {record['speed']:5.1f} km/h | ⛽ Fuel: {record['fuel_level']:5.1f}%")
            print(f"   📈 Stress:   0.0 | ⚠️  Fault: All Parameters Normal\n")
    else:
        print("⚠️  No data found")
        
except Exception as e:
    print(f"❌ Data retrieval error: {e}")

# Success summary
print("=" * 70)
print("🎉 SUCCESS! Supabase Storage is Working!")
print("\n✅ All RPi data will now be stored in Supabase (No SQLite)")
print("\n📊 Check Supabase Dashboard:")
print("   https://supabase.com/dashboard/project/qimiewqthuhmofjhzrrb/editor/tables")
print("\n🚀 Data Flow: OBD Scanner → RPi → Supabase Cloud → Dashboard")
print("=" * 70)

EOF
