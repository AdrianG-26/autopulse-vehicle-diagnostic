#!/bin/bash

# 🚀 Populate All Supabase Tables
# This script populates vehicle_profiles, sensor_data, and sensor_data_realtime
# from existing data in vehicles and telemetry_data tables

cd /home/rocketeers/vehicle_diagnostic_system
source .venv/bin/activate

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     🚀 Populating All Supabase Tables & Views                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

python3 << 'EOF'
from dotenv import load_dotenv
import os
load_dotenv('src/.env', override=True)

from supabase import create_client
from datetime import datetime, timezone

print("📡 Connecting to Supabase...")
supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_KEY')
)

user_id = os.getenv('USER_ID')

# Get existing vehicle
print("\n🚗 Step 1: Getting vehicle from 'vehicles' table...")
try:
    vehicles_result = supabase.table('vehicles').select('*').eq('user_id', user_id).execute()
    
    if not vehicles_result.data:
        print("❌ No vehicles found!")
        exit(1)
    
    vehicle = vehicles_result.data[0]
    print(f"✅ Found vehicle: {vehicle['name']}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)

# Create vehicle profile
print("\n🏭 Step 2: Creating vehicle profile...")
try:
    car_identifier = f"sha256_{vehicle.get('make', 'Unknown')}_{vehicle.get('model', 'Unknown')}_{vehicle.get('year', 2023)}"
    
    existing = supabase.table('vehicle_profiles').select('*').eq('car_identifier', car_identifier).execute()
    
    if existing.data:
        profile_id = existing.data[0]['id']
        print(f"✅ Profile exists: {profile_id}")
    else:
        vehicle_profile = {
            'user_id': user_id,
            'car_identifier': car_identifier,
            'car_display_name': vehicle['name'],
            'make': vehicle.get('make', 'Unknown'),
            'model': vehicle.get('model', 'Unknown'),
            'year': vehicle.get('year', 2023),
            'vin': vehicle.get('vin'),
            'fuel_type': 'Gasoline',
            'transmission_type': 'Automatic',
            'engine_size': '1.5L',
            'notes': 'Auto-migrated',
            'total_sessions': 1,
            'total_records': 0,
            'is_active': True
        }
        
        result = supabase.table('vehicle_profiles').insert(vehicle_profile).execute()
        profile_id = result.data[0]['id']
        print(f"✅ Created profile: {profile_id}")

except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)

# Get telemetry data
print("\n📊 Step 3: Getting telemetry data...")
try:
    telemetry_result = supabase.table('telemetry_data').select('*').eq('vehicle_id', vehicle['id']).order('timestamp', desc=True).limit(1).execute()
    
    if telemetry_result.data:
        latest = telemetry_result.data[0]
        print(f"✅ Found data: RPM={latest.get('rpm', 0)}")
    else:
        latest = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'rpm': 800,
            'speed': 0,
            'coolant_temp': 90.0,
            'battery': 12.3,
            'engine_load_pct': 20.0,
            'throttle_position': 5.0,
            'fuel_level_pct': 85.0
        }
        print("⚠️  Using default values")

except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)

# Populate sensor_data_realtime
print("\n⚡ Step 4: Populating sensor_data_realtime...")
try:
    realtime_data = {
        'vehicle_id': profile_id,
        'timestamp': latest.get('timestamp', datetime.now(timezone.utc).isoformat()),
        'rpm': latest.get('rpm', 0),
        'speed': latest.get('speed', 0),
        'coolant_temp': latest.get('coolant_temp', 0.0),
        'battery': latest.get('battery', 12.3),
        'engine_load': latest.get('engine_load_pct', 0.0),
        'throttle_pos': latest.get('throttle_position', 0.0),
        'fuel_level': latest.get('fuel_level_pct', 0.0),
        'status': 'NORMAL'
    }
    
    result = supabase.table('sensor_data_realtime').upsert(realtime_data, on_conflict='vehicle_id').execute()
    print("✅ Populated sensor_data_realtime")

except Exception as e:
    print(f"❌ Error: {e}")

# Populate sensor_data
print("\n📈 Step 5: Populating sensor_data...")
try:
    sensor_data = {
        'vehicle_id': profile_id,
        'timestamp': latest.get('timestamp', datetime.now(timezone.utc).isoformat()),
        'session_id': 'session_migration_001',
        'rpm': latest.get('rpm', 0),
        'vehicle_speed': latest.get('speed', 0),
        'coolant_temp': latest.get('coolant_temp', 0.0),
        'control_module_voltage': latest.get('battery', 12.3),
        'engine_load': latest.get('engine_load_pct', 0.0),
        'throttle_pos': latest.get('throttle_position', 0.0),
        'fuel_level': latest.get('fuel_level_pct', 0.0),
        'status': 'Normal',
        'fuel_efficiency': 15.5,
        'data_quality_score': 100
    }
    
    result = supabase.table('sensor_data').insert(sensor_data).execute()
    print("✅ Populated sensor_data")

except Exception as e:
    print(f"❌ Error: {e}")

# Verify views
print("\n🔍 Step 6: Verifying views...")
try:
    latest_data = supabase.table('vehicle_latest_data').select('*').eq('vehicle_id', profile_id).execute()
    if latest_data.data:
        print(f"✅ vehicle_latest_data: {latest_data.data[0]['car_display_name']}")
    else:
        print("⚠️  vehicle_latest_data is empty")
except Exception as e:
    print(f"⚠️  Error: {e}")

try:
    stats = supabase.table('vehicle_statistics').select('*').eq('vehicle_id', profile_id).execute()
    if stats.data:
        print(f"✅ vehicle_statistics: {stats.data[0].get('total_readings', 0)} readings")
    else:
        print("⚠️  vehicle_statistics is empty")
except Exception as e:
    print(f"⚠️  Error: {e}")

print("\n" + "=" * 70)
print("🎉 POPULATION COMPLETE!")
print("=" * 70)

EOF
