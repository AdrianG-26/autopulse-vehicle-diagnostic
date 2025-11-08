#!/usr/bin/env python3
"""Standalone migration script"""

import sqlite3
import os
from datetime import datetime, timezone
import time
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Initialize Supabase client directly
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

if not url or not key:
    print("❌ Error: SUPABASE_URL and SUPABASE_KEY must be set in .env")
    exit(1)

supabase: Client = create_client(url, key)

def to_float(value):
    if value is None:
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None

def to_int(value):
    if value is None:
        return None
    try:
        return int(float(value))
    except (ValueError, TypeError):
        return None

print("╔════════════════════════════════════════════════════════════════╗")
print("║     🚀 Migrating Local Data to Supabase                      ║")
print("╚════════════════════════════════════════════════════════════════╝")
print()

best_db = 'src/data/vehicle_data.db' if os.path.exists('src/data/vehicle_data.db') else 'backend/data/vehicle_data.db'

conn = sqlite3.connect(best_db)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

cursor.execute("SELECT COUNT(*) FROM enhanced_sensor_data")
max_rows = cursor.fetchone()[0]

print(f"📊 Database: {best_db}")
print(f"   Total rows: {max_rows:,}\n")

# Step 1: Migrate vehicles
print("🚗 Step 1: Migrating vehicle profiles...")
cursor.execute("SELECT * FROM car_profiles WHERE is_active = 1")
vehicles = cursor.fetchall()

vehicle_mapping = {}

for vehicle_row in vehicles:
    vehicle = dict(vehicle_row)
    car_identifier = vehicle['car_identifier']
    
    existing = supabase.table('vehicle_profiles').select('id').eq('car_identifier', car_identifier).execute()
    
    if existing.data:
        supabase_id = existing.data[0]['id']
        print(f"   ✅ {vehicle['car_display_name']} (ID: {supabase_id})")
    else:
        profile_data = {
            'car_identifier': car_identifier,
            'car_display_name': vehicle['car_display_name'],
            'make': vehicle['make'],
            'model': vehicle['model'],
            'year': to_int(vehicle['year']),
            'vin': vehicle.get('vin'),
            'fuel_type': vehicle['fuel_type'],
            'transmission_type': vehicle.get('transmission_type', 'Automatic'),
            'engine_size': to_float(vehicle.get('engine_size')),
            'notes': f"Migrated - {vehicle.get('notes', '')}",
            'total_sessions': to_int(vehicle.get('total_sessions', 0)),
            'is_active': True
        }
        
        result = supabase.table('vehicle_profiles').insert(profile_data).execute()
        supabase_id = result.data[0]['id']
        print(f"   ✅ Created {vehicle['car_display_name']} (ID: {supabase_id})")
    
    vehicle_mapping[vehicle['id']] = supabase_id

print(f"\n✅ Migrated {len(vehicle_mapping)} vehicles\n")

# Step 2: Migrate sensor data
print("📊 Step 2: Migrating sensor data...")
total_migrated = 0
failed_batches = 0

for local_id, supabase_id in vehicle_mapping.items():
    cursor.execute("SELECT COUNT(*) FROM enhanced_sensor_data WHERE car_profile_id = ?", (local_id,))
    vehicle_rows = cursor.fetchone()[0]
    
    if vehicle_rows == 0:
        continue
    
    print(f"\n🚗 Vehicle ID {local_id} -> {supabase_id} ({vehicle_rows:,} rows)")
    
    cursor.execute("SELECT DISTINCT session_id FROM enhanced_sensor_data WHERE car_profile_id = ?", (local_id,))
    sessions = cursor.fetchall()
    
    for session_row in sessions:
        session_id = session_row[0]
        cursor.execute("SELECT COUNT(*) FROM enhanced_sensor_data WHERE car_profile_id = ? AND session_id = ?", (local_id, session_id))
        session_rows = cursor.fetchone()[0]
        
        print(f"   📁 Session {session_id}: {session_rows:,} rows")
        
        offset = 0
        session_migrated = 0
        
        while offset < session_rows:
            try:
                cursor.execute("""
                    SELECT * FROM enhanced_sensor_data 
                    WHERE car_profile_id = ? AND session_id = ?
                    ORDER BY timestamp
                    LIMIT 500 OFFSET ?
                """, (local_id, session_id, offset))
                
                rows = cursor.fetchall()
                if not rows:
                    break
                
                batch_data = []
                for row_obj in rows:
                    row = dict(row_obj)
                    batch_data.append({
                        'vehicle_id': supabase_id,
                        'timestamp': row['timestamp'],
                        'rpm': to_float(row.get('rpm')),
                        'speed': to_float(row.get('vehicle_speed')),
                        'coolant_temp': to_float(row.get('coolant_temp')),
                        'battery': to_float(row.get('control_module_voltage')),
                        'engine_load_pct': to_float(row.get('engine_load')),
                        'throttle_position': to_float(row.get('throttle_pos')),
                        'fuel_level_pct': to_float(row.get('fuel_level')),
                        'map_kpa': to_float(row.get('map')),
                        'intake_air_temp': to_float(row.get('intake_temp')),
                        'ignition_advance': to_float(row.get('timing_advance')),
                        'fuel_trim_short_pct': to_float(row.get('fuel_trim_short')),
                        'fuel_trim_long_pct': to_float(row.get('fuel_trim_long')),
                        'engine_runtime': to_int(row.get('run_time'))
                    })
                
                supabase.table('telemetry_data').insert(batch_data).execute()
                
                session_migrated += len(batch_data)
                total_migrated += len(batch_data)
                
                print(f"      ✅ {session_migrated:,}/{session_rows:,}", end='\r')
                
                offset += 500
                time.sleep(0.1)
                
            except Exception as e:
                print(f"\n      ❌ Error: {e}")
                failed_batches += 1
                offset += 500
                if failed_batches > 3:
                    break
        
        print(f"\n      ✅ Complete: {session_migrated:,} rows")

conn.close()

print("\n" + "=" * 70)
print("🎉 MIGRATION COMPLETE!")
print(f"\n✅ Total migrated: {total_migrated:,}")
print(f"❌ Failed batches: {failed_batches}")
print("=" * 70)
