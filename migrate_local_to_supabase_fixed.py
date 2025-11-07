#!/usr/bin/env python3
"""
Migrate local SQLite data to Supabase

This script:
1. Migrates vehicle profiles from car_profiles to vehicle_profiles
2. Migrates sensor data from enhanced_sensor_data to telemetry_data
3. Handles data type conversions and ID mappings
"""

import sqlite3
import sys
import os
from datetime import datetime, timezone
from dotenv import load_dotenv
import time

# Add parent directory to path to import supabase_direct_storage
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.supabase_direct_storage import supabase

# Load environment
load_dotenv()

def to_float(value):
    """Convert value to float, handling None and invalid values"""
    if value is None:
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None

def to_int(value):
    """Convert value to integer, handling None and float values"""
    if value is None:
        return None
    try:
        return int(float(value))  # Convert through float first to handle "699.0"
    except (ValueError, TypeError):
        return None

print("╔════════════════════════════════════════════════════════════════╗")
print("║     🚀 Migrating Local Data to Supabase                      ║")
print("╚════════════════════════════════════════════════════════════════╝")
print()

# Try multiple database locations
db_paths = [
    'src/data/vehicle_data.db',
    'backend/data/vehicle_data.db'
]

# Find the database with most data
best_db = None
max_rows = 0

for db_path in db_paths:
    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT COUNT(*) FROM enhanced_sensor_data")
            count = cursor.fetchone()[0]
            if count > max_rows:
                max_rows = count
                best_db = db_path
        except:
            pass
        conn.close()

if not best_db:
    print("❌ No local database found!")
    sys.exit(1)

print(f"📊 Found database: {best_db}")
print(f"   Total rows: {max_rows:,}")
print()

# Connect to local database
conn = sqlite3.connect(best_db)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# Step 1: Migrate vehicle profiles
print("🚗 Step 1: Migrating vehicle profiles...")
cursor.execute("SELECT * FROM car_profiles WHERE is_active = 1")
vehicles = cursor.fetchall()

vehicle_mapping = {}  # local_id -> supabase_id

for vehicle_row in vehicles:
    vehicle = dict(vehicle_row)
    try:
        car_identifier = vehicle['car_identifier']
        
        # Check if exists in Supabase
        existing = supabase.table('vehicle_profiles').select('id').eq('car_identifier', car_identifier).execute()
        
        if existing.data:
            supabase_id = existing.data[0]['id']
            print(f"   ✅ {vehicle['car_display_name']} already exists (ID: {supabase_id})")
        else:
            # Create new profile
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
                'notes': f"Migrated from local DB - {vehicle.get('notes', '')}",
                'total_sessions': to_int(vehicle.get('total_sessions', 0)),
                'total_records': 0,  # Will update after data migration
                'is_active': True
            }
            
            result = supabase.table('vehicle_profiles').insert(profile_data).execute()
            supabase_id = result.data[0]['id']
            print(f"   ✅ Created {vehicle['car_display_name']} (ID: {supabase_id})")
        
        vehicle_mapping[vehicle['id']] = supabase_id
        
    except Exception as e:
        print(f"   ❌ Error migrating {vehicle['car_display_name']}: {e}")

print(f"\n✅ Migrated {len(vehicle_mapping)} vehicle profiles")
print()

# Step 2: Migrate sensor data in batches
print("📊 Step 2: Migrating sensor data...")
print(f"   Total rows to migrate: {max_rows:,}")
print()

batch_size = 500  # Supabase batch size
total_migrated = 0
failed_batches = 0

for local_id, supabase_id in vehicle_mapping.items():
    print(f"\n🚗 Migrating data for vehicle ID {local_id} -> {supabase_id}...")
    
    # Count rows for this vehicle
    cursor.execute("SELECT COUNT(*) FROM enhanced_sensor_data WHERE car_profile_id = ?", (local_id,))
    vehicle_rows = cursor.fetchone()[0]
    print(f"   Rows: {vehicle_rows:,}")
    
    if vehicle_rows == 0:
        continue
    
    # Get session IDs for this vehicle
    cursor.execute("SELECT DISTINCT session_id FROM enhanced_sensor_data WHERE car_profile_id = ?", (local_id,))
    sessions = cursor.fetchall()
    
    for session_row in sessions:
        session_id = session_row[0]
        
        # Count rows in this session
        cursor.execute("SELECT COUNT(*) FROM enhanced_sensor_data WHERE car_profile_id = ? AND session_id = ?", (local_id, session_id))
        session_rows = cursor.fetchone()[0]
        
        print(f"   📁 Session {session_id}: {session_rows:,} rows")
        
        # Process in batches
        offset = 0
        session_migrated = 0
        session_failed = 0
        
        while offset < session_rows:
            try:
                # Get batch
                cursor.execute("""
                    SELECT * FROM enhanced_sensor_data 
                    WHERE car_profile_id = ? AND session_id = ?
                    ORDER BY timestamp
                    LIMIT ? OFFSET ?
                """, (local_id, session_id, batch_size, offset))
                
                rows = cursor.fetchall()
                
                if not rows:
                    break
                
                # Prepare batch data for Supabase
                batch_data = []
                for row_obj in rows:
                    row = dict(row_obj)
                    # Map to telemetry_data format with proper type conversions
                    telemetry_record = {
                        'vehicle_id': supabase_id,  # BIGINT, not string
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
                        'engine_runtime': to_int(row.get('run_time'))  # INTEGER field
                    }
                    batch_data.append(telemetry_record)
                
                # Insert to telemetry_data
                result = supabase.table('telemetry_data').insert(batch_data).execute()
                
                session_migrated += len(batch_data)
                total_migrated += len(batch_data)
                
                print(f"      ✅ Batch {offset//batch_size + 1}: {len(batch_data)} rows ({session_migrated:,}/{session_rows:,})", end='\r')
                
                offset += batch_size
                time.sleep(0.1)  # Rate limiting
                
            except Exception as e:
                print(f"\n      ❌ Error in batch: {e}")
                session_failed += 1
                failed_batches += 1
                offset += batch_size
                if session_failed > 5:
                    print("      ⚠️  Too many failed batches in this session, skipping...")
                    break
        
        print(f"\n      ✅ Session complete: {session_migrated:,} rows migrated")
    
    # Update vehicle statistics
    try:
        supabase.table('vehicle_profiles').update({
            'total_records': vehicle_rows,
            'last_used': datetime.now(timezone.utc).isoformat()
        }).eq('id', supabase_id).execute()
    except Exception as e:
        print(f"   ⚠️  Could not update stats: {e}")

conn.close()

print("\n" + "=" * 70)
print("🎉 MIGRATION COMPLETE!")
print(f"\n✅ Statistics:")
print(f"   • Total rows migrated: {total_migrated:,}")
print(f"   • Vehicles migrated: {len(vehicle_mapping)}")
print(f"   • Failed batches: {failed_batches}")
print(f"\n📊 View your data:")
print(f"   https://supabase.com/dashboard/project/qimiewqthuhmofjhzrrb/editor")
print("=" * 70)
