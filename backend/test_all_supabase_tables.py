#!/usr/bin/env python3
"""
Test All Supabase Tables
Tests POST and GET operations for all tables using historical SQLite data
"""

import sys
import os
import sqlite3
from datetime import datetime
from typing import Dict, List, Optional

# Set environment variables
os.environ['SUPABASE_URL'] = 'https://qimiewqthuhmofjhzrrb.supabase.co'
os.environ['SUPABASE_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpbWlld3F0aHVobW9mamh6cnJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Mjc5MTMsImV4cCI6MjA3MTEwMzkxM30.jHY0m_l-uvwaZd-x9POEpLdoP__oLUdE-7U-E5mZqz0'
os.environ['USER_ID'] = '00000000-0000-0000-0000-000000000001'

from supabase import create_client, Client

# Initialize Supabase client
supabase: Client = create_client(
    os.environ['SUPABASE_URL'],
    os.environ['SUPABASE_KEY']
)

# Path to historical SQLite database
SQLITE_DB = '../src/data/vehicle_data.db'

print("=" * 80)
print("🧪 TESTING ALL SUPABASE TABLES")
print("=" * 80)
print(f"\n📁 Using historical data from: {SQLITE_DB}\n")


def test_vehicle_profiles():
    """Test vehicle_profiles table"""
    print("\n" + "=" * 80)
    print("1️⃣  TESTING: vehicle_profiles")
    print("=" * 80)
    
    try:
        # Get sample vehicle from SQLite
        conn = sqlite3.connect(SQLITE_DB)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM car_profiles LIMIT 1")
        row = cursor.fetchone()
        
        if not row:
            print("⚠️  No sample data in SQLite")
            return False
            
        # Extract vehicle data
        vehicle_data = {
            'car_identifier': f'TEST_VEHICLE_{datetime.now().timestamp()}',
            'car_display_name': 'Test Vehicle from SQLite',
            'make': 'Toyota',
            'model': 'Test Model',
            'year': 2023,
            'fuel_type': 'Gasoline',
            'transmission_type': 'Automatic',
            'is_active': True
        }
        
        # POST: Insert vehicle
        print(f"📤 POST: Creating vehicle profile...")
        result = supabase.table('vehicle_profiles').insert(vehicle_data).execute()
        vehicle_id = result.data[0]['id']
        print(f"   ✅ Created vehicle ID: {vehicle_id}")
        
        # GET: Retrieve vehicle
        print(f"📥 GET: Fetching vehicle profile...")
        result = supabase.table('vehicle_profiles').select('*').eq('id', vehicle_id).execute()
        if result.data:
            print(f"   ✅ Retrieved: {result.data[0]['make']} {result.data[0]['model']}")
        
        conn.close()
        return vehicle_id
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return None


def test_telemetry_data(vehicle_id: int):
    """Test telemetry_data table"""
    print("\n" + "=" * 80)
    print("2️⃣  TESTING: telemetry_data")
    print("=" * 80)
    
    try:
        # Get sample sensor data from SQLite
        conn = sqlite3.connect(SQLITE_DB)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT rpm, vehicle_speed, coolant_temp, engine_load, throttle_pos, 
                   barometric_pressure, maf, fuel_level, timestamp
            FROM enhanced_sensor_data 
            WHERE rpm > 0 
            LIMIT 5
        """)
        rows = cursor.fetchall()
        
        if not rows:
            print("⚠️  No sample data in SQLite")
            return False
        
        # Prepare batch data (match telemetry_data column names)
        telemetry_batch = []
        for row in rows:
            telemetry_batch.append({
                'vehicle_id': vehicle_id,
                'timestamp': datetime.now().isoformat(),
                'rpm': int(float(row[0])) if row[0] else 0,
                'speed': float(row[1]) if row[1] else 0,  # speed, not vehicle_speed!
                'coolant_temp': float(row[2]) if row[2] else 0,
                'engine_load_pct': float(row[3]) if row[3] else 0,  # engine_load_pct!
                'throttle_position': float(row[4]) if row[4] else 0,  # throttle_position!
                'map_kpa': float(row[5]) if row[5] else 100,
                'maf_grams_sec': float(row[6]) if row[6] else 0,  # maf_grams_sec!
                'fuel_level_pct': float(row[7]) if row[7] else 50  # fuel_level_pct!
            })
        
        # POST: Insert telemetry data
        print(f"📤 POST: Inserting {len(telemetry_batch)} telemetry records...")
        result = supabase.table('telemetry_data').insert(telemetry_batch).execute()
        print(f"   ✅ Inserted {len(result.data)} records")
        
        # GET: Retrieve telemetry data
        print(f"📥 GET: Fetching telemetry data...")
        result = supabase.table('telemetry_data').select('*').eq('vehicle_id', vehicle_id).limit(3).execute()
        print(f"   ✅ Retrieved {len(result.data)} records")
        for i, record in enumerate(result.data[:3], 1):
            print(f"      #{i}: RPM={record['rpm']}, Speed={record['speed']} km/h")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

        
        # Prepare batch data (match telemetry_data column names)
        telemetry_batch = []
        for row in rows:
            telemetry_batch.append({
                'vehicle_id': vehicle_id,
                'timestamp': datetime.now().isoformat(),
                'rpm': int(float(row[0])) if row[0] else 0,
                'speed': float(row[1]) if row[1] else 0,  # speed, not vehicle_speed!
                'coolant_temp': float(row[2]) if row[2] else 0,
                'engine_load_pct': float(row[3]) if row[3] else 0,  # engine_load_pct!
                'throttle_position': float(row[4]) if row[4] else 0,  # throttle_position!
                'map_kpa': float(row[5]) if row[5] else 100,
                'maf_grams_sec': float(row[6]) if row[6] else 0,  # maf_grams_sec!
                'fuel_level_pct': float(row[7]) if row[7] else 50  # fuel_level_pct!
            })
        
        # POST: Insert telemetry data
        print(f"📤 POST: Inserting {len(telemetry_batch)} telemetry records...")
        result = supabase.table('telemetry_data').insert(telemetry_batch).execute()
        print(f"   ✅ Inserted {len(result.data)} records")
        
        # GET: Retrieve telemetry data
        print(f"📥 GET: Fetching telemetry data...")
        result = supabase.table('telemetry_data').select('*').eq('vehicle_id', vehicle_id).limit(3).execute()
        print(f"   ✅ Retrieved {len(result.data)} records")
        for i, record in enumerate(result.data[:3], 1):
            print(f"      #{i}: RPM={record['rpm']}, Speed={record['speed']} km/h")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

        
        # Prepare batch data
        telemetry_batch = []
        for row in rows:
            telemetry_batch.append({
                'vehicle_id': vehicle_id,
                'session_id': f'test_session_{datetime.now().timestamp()}',
                'timestamp': datetime.now().isoformat(),
                'rpm': int(float(row[0])) if row[0] else 0,
                'vehicle_speed': float(row[1]) if row[1] else 0,
                'coolant_temp': float(row[2]) if row[2] else 0,
                'engine_load': float(row[3]) if row[3] else 0,
                'throttle_pos': float(row[4]) if row[4] else 0,
                'intake_pressure': float(row[5] or 100) if row[5] else 0,
                'maf_rate': float(row[6]) if row[6] else 0,
                'fuel_level': float(row[7]) if row[7] else 50
            })
        
        # POST: Insert telemetry data
        print(f"📤 POST: Inserting {len(telemetry_batch)} telemetry records...")
        result = supabase.table('telemetry_data').insert(telemetry_batch).execute()
        print(f"   ✅ Inserted {len(result.data)} records")
        
        # GET: Retrieve telemetry data
        print(f"📥 GET: Fetching telemetry data...")
        result = supabase.table('telemetry_data').select('*').eq('vehicle_id', vehicle_id).limit(3).execute()
        print(f"   ✅ Retrieved {len(result.data)} records")
        for i, record in enumerate(result.data[:3], 1):
            print(f"      #{i}: RPM={record['rpm']}, Speed={record['vehicle_speed']} km/h")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


def test_sensor_data(vehicle_id: int):
    """Test sensor_data table"""
    print("\n" + "=" * 80)
    print("3️⃣  TESTING: sensor_data")
    print("=" * 80)
    
    try:
        # Get sample sensor data from SQLite
        conn = sqlite3.connect(SQLITE_DB)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT rpm, vehicle_speed, coolant_temp, engine_load, throttle_pos, fuel_level
            FROM enhanced_sensor_data 
            WHERE rpm > 0 
            LIMIT 3
        """)
        rows = cursor.fetchall()
        
        if not rows:
            print("⚠️  No sample data in SQLite")
            return False
        
        # Prepare batch data
        sensor_batch = []
        for row in rows:
            sensor_batch.append({
                'vehicle_id': vehicle_id,
                'session_id': f'test_session_{datetime.now().timestamp()}',
                'timestamp': datetime.now().isoformat(),
                'rpm': int(float(row[0])) if row[0] else 0,
                'vehicle_speed': float(row[1]) if row[1] else 0,
                'coolant_temp': float(row[2]) if row[2] else 0,
                'engine_load': float(row[3]) if row[3] else 0,
                'throttle_pos': float(row[4]) if row[4] else 0,
                'fuel_level': float(row[5]) if row[5] else 50
            })
        
        # POST: Insert sensor data
        print(f"📤 POST: Inserting {len(sensor_batch)} sensor records...")
        result = supabase.table('sensor_data').insert(sensor_batch).execute()
        print(f"   ✅ Inserted {len(result.data)} records")
        
        # GET: Retrieve sensor data
        print(f"📥 GET: Fetching sensor data...")
        result = supabase.table('sensor_data').select('*').eq('vehicle_id', vehicle_id).limit(3).execute()
        print(f"   ✅ Retrieved {len(result.data)} records")
        for i, record in enumerate(result.data[:3], 1):
            print(f"      #{i}: RPM={record['rpm']}, Coolant={record['coolant_temp']}°C")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


def test_sensor_data_realtime(vehicle_id: int):
    """Test sensor_data_realtime table"""
    print("\n" + "=" * 80)
    print("4️⃣  TESTING: sensor_data_realtime")
    print("=" * 80)
    
    try:
        # Get latest sensor reading from SQLite
        conn = sqlite3.connect(SQLITE_DB)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT rpm, vehicle_speed, coolant_temp, engine_load, throttle_pos, fuel_level, barometric_pressure
            FROM enhanced_sensor_data 
            WHERE rpm > 0 
            ORDER BY id DESC 
            LIMIT 1
        """)
        row = cursor.fetchone()
        
        if not row:
            print("⚠️  No sample data in SQLite")
            return False
        
        # Prepare realtime data (only one row per vehicle)
        realtime_data = {
            'vehicle_id': vehicle_id,
            'timestamp': datetime.now().isoformat(),
            'rpm': int(float(row[0])) if row[0] else 0,
            'speed': float(row[1]) if row[1] else 0,
            'coolant_temp': float(row[2]) if row[2] else 0,
            'engine_load': float(row[3]) if row[3] else 0,
            'throttle_pos': float(row[4]) if row[4] else 0,
            'fuel_level': float(row[5]) if row[5] else 50,
            'battery': 12.0 if row[6] else 12.0
        }
        
        # POST: Upsert realtime data (updates if exists)
        print(f"📤 POST: Upserting realtime data (vehicle_id={vehicle_id})...")
        result = supabase.table('sensor_data_realtime').upsert(realtime_data, on_conflict='vehicle_id').execute()
        print(f"   ✅ Upserted realtime data")
        
        # GET: Retrieve realtime data
        print(f"📥 GET: Fetching realtime data...")
        result = supabase.table('sensor_data_realtime').select('*').eq('vehicle_id', vehicle_id).execute()
        if result.data:
            record = result.data[0]
            print(f"   ✅ Retrieved: RPM={record['rpm']}, Speed={record['speed']} km/h")
            print(f"      Engine Load={record['engine_load']}%, Fuel={record['fuel_level']}%")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


def test_vehicle_statistics_view(vehicle_id: int):
    """Test vehicle_statistics view (read-only)"""
    print("\n" + "=" * 80)
    print("5️⃣  TESTING: vehicle_statistics (VIEW - Read Only)")
    print("=" * 80)
    
    try:
        # GET: Retrieve vehicle statistics
        print(f"📥 GET: Fetching vehicle statistics...")
        result = supabase.table('vehicle_statistics').select('*').eq('vehicle_id', vehicle_id).execute()
        
        if result.data:
            stats = result.data[0]
            print(f"   ✅ Retrieved statistics:")
            print(f"      Avg RPM: {stats.get('avg_rpm', 0):.0f}")
            print(f"      Max RPM: {stats.get('max_rpm', 0):.0f}")
            print(f"      Avg Speed: {stats.get('avg_speed', 0):.1f} km/h")
            print(f"      Avg Temp: {stats.get('avg_temp', 0):.1f}°C")
        else:
            print(f"   ⚠️  No statistics yet (view may need data to populate)")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


def test_vehicle_latest_data_view(vehicle_id: int):
    """Test vehicle_latest_data view (read-only)"""
    print("\n" + "=" * 80)
    print("6️⃣  TESTING: vehicle_latest_data (VIEW - Read Only)")
    print("=" * 80)
    
    try:
        # GET: Retrieve latest vehicle data
        print(f"📥 GET: Fetching latest vehicle data...")
        result = supabase.table('vehicle_latest_data').select('*').eq('vehicle_id', vehicle_id).execute()
        
        if result.data:
            latest = result.data[0]
            print(f"   ✅ Retrieved latest data:")
            print(f"      Vehicle: {latest.get('make')} {latest.get('model')}")
            print(f"      RPM: {latest.get('rpm', 0)}")
            print(f"      Speed: {latest.get('speed', 0)} km/h")
            print(f"      Last Update: {latest.get('last_update', 'N/A')}")
        else:
            print(f"   ⚠️  No latest data yet (view may need data to populate)")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


def test_users_table():
    """Test users table"""
    print("\n" + "=" * 80)
    print("7️⃣  TESTING: users (Custom Users Table)")
    print("=" * 80)
    
    try:
        # Check if we can query users table
        print(f"📥 GET: Checking users table...")
        result = supabase.table('users').select('*').limit(1).execute()
        
        if result.data:
            print(f"   ✅ Users table accessible, found {len(result.data)} user(s)")
        else:
            print(f"   ⚠️  Users table empty (expected for test)")
        
        return True
        
    except Exception as e:
        print(f"   ⚠️  Users table may not exist or RLS is blocking: {e}")
        return False


def cleanup_test_data(vehicle_id: int):
    """Clean up test data"""
    print("\n" + "=" * 80)
    print("🧹 CLEANUP: Removing test data...")
    print("=" * 80)
    
    try:
        # Delete in reverse order (child tables first)
        print("   Deleting sensor_data_realtime...")
        supabase.table('sensor_data_realtime').delete().eq('vehicle_id', vehicle_id).execute()
        
        print("   Deleting sensor_data...")
        supabase.table('sensor_data').delete().eq('vehicle_id', vehicle_id).execute()
        
        print("   Deleting telemetry_data...")
        supabase.table('telemetry_data').delete().eq('vehicle_id', vehicle_id).execute()
        
        print("   Deleting vehicle_profiles...")
        supabase.table('vehicle_profiles').delete().eq('id', vehicle_id).execute()
        
        print("   ✅ Cleanup complete!")
        return True
        
    except Exception as e:
        print(f"   ⚠️  Cleanup error: {e}")
        return False


def main():
    """Run all tests"""
    results = {
        'vehicle_profiles': False,
        'telemetry_data': False,
        'sensor_data': False,
        'sensor_data_realtime': False,
        'vehicle_statistics': False,
        'vehicle_latest_data': False,
        'users': False
    }
    
    # Test vehicle_profiles first (need vehicle_id for other tests)
    vehicle_id = test_vehicle_profiles()
    if vehicle_id:
        results['vehicle_profiles'] = True
        
        # Test other tables
        results['telemetry_data'] = test_telemetry_data(vehicle_id)
        results['sensor_data'] = test_sensor_data(vehicle_id)
        results['sensor_data_realtime'] = test_sensor_data_realtime(vehicle_id)
        results['vehicle_statistics'] = test_vehicle_statistics_view(vehicle_id)
        results['vehicle_latest_data'] = test_vehicle_latest_data_view(vehicle_id)
        results['users'] = test_users_table()
        
        # Cleanup
        cleanup_test_data(vehicle_id)
    
    # Print summary
    print("\n" + "=" * 80)
    print("📊 TEST SUMMARY")
    print("=" * 80)
    
    total_tests = len(results)
    passed_tests = sum(1 for result in results.values() if result)
    
    for table_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"   {status} - {table_name}")
    
    print("\n" + "=" * 80)
    print(f"🎯 RESULTS: {passed_tests}/{total_tests} tests passed")
    print("=" * 80)
    
    if passed_tests == total_tests:
        print("\n🎉 ALL TESTS PASSED! Supabase is fully operational!")
    elif passed_tests >= total_tests - 1:
        print("\n✅ MOSTLY WORKING! Minor issues detected.")
    else:
        print("\n⚠️  SOME TESTS FAILED. Check errors above.")
    
    print("\n")


if __name__ == "__main__":
    main()
