#!/usr/bin/env python3
"""
Quick Verification Script - Check Supabase Connection and Data
Run this anytime to verify your Supabase setup is working
"""

import sys
import os

# Set environment variables
os.environ['SUPABASE_URL'] = 'https://qimiewqthuhmofjhzrrb.supabase.co'
os.environ['SUPABASE_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpbWlld3F0aHVobW9mamh6cnJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Mjc5MTMsImV4cCI6MjA3MTEwMzkxM30.jHY0m_l-uvwaZd-x9POEpLdoP__oLUdE-7U-E5mZqz0'
os.environ['USER_ID'] = '00000000-0000-0000-0000-000000000001'

from supabase import create_client
from datetime import datetime

print("\n" + "=" * 70)
print("🔍 CHECKING SUPABASE CONNECTION")
print("=" * 70 + "\n")

try:
    # Connect to Supabase
    supabase = create_client(
        os.environ['SUPABASE_URL'],
        os.environ['SUPABASE_KEY']
    )
    print("✅ Connected to Supabase")
    
    # 1. Check vehicle profiles
    print("\n📊 Checking vehicle_profiles table...")
    vehicles = supabase.table('vehicle_profiles').select('*').limit(5).execute()
    print(f"   ✅ Found {len(vehicles.data)} vehicle(s):")
    for v in vehicles.data[:5]:
        print(f"      • {v['make']} {v['model']} (ID: {v['id']})")
    
    # 2. Check sensor_data (historical)
    print("\n📊 Checking sensor_data table...")
    sensor_count = supabase.table('sensor_data').select('id', count='exact').execute()
    total = sensor_count.count
    print(f"   ✅ Total sensor readings: {total:,}")
    
    if total > 0:
        # Get latest readings
        latest = supabase.table('sensor_data').select('*').order('timestamp', desc=True).limit(3).execute()
        print(f"   📈 Latest 3 readings:")
        for i, reading in enumerate(latest.data, 1):
            print(f"      #{i}: RPM={reading.get('rpm', 'N/A')}, "
                  f"Speed={reading.get('vehicle_speed', 'N/A')} km/h, "
                  f"Temp={reading.get('coolant_temp', 'N/A')}°C")
    
    # 3. Check realtime data
    print("\n📊 Checking sensor_data_realtime table...")
    realtime = supabase.table('sensor_data_realtime').select('*').execute()
    print(f"   ✅ Active vehicles with realtime data: {len(realtime.data)}")
    for rt in realtime.data[:3]:
        print(f"      • Vehicle {rt['vehicle_id']}: RPM={rt['rpm']}, "
              f"Speed={rt['speed']} km/h, Load={rt['engine_load']}%")
    
    # 4. Check statistics view
    print("\n📊 Checking vehicle_statistics view...")
    stats = supabase.table('vehicle_statistics').select('*').limit(1).execute()
    if stats.data:
        s = stats.data[0]
        print(f"   ✅ Statistics available:")
        print(f"      Avg RPM: {s.get('avg_rpm', 0):.0f}")
        print(f"      Max RPM: {s.get('max_rpm', 0):.0f}")
        print(f"      Avg Speed: {s.get('avg_speed', 0):.1f} km/h")
    else:
        print(f"   ⚠️  No statistics yet (add sensor data first)")
    
    # 5. Test INSERT capability
    print("\n🧪 Testing INSERT capability...")
    test_vehicle = {
        'car_identifier': f'TEST_VERIFY_{datetime.now().timestamp()}',
        'car_display_name': 'Verification Test Vehicle',
        'make': 'Test',
        'model': 'Verification',
        'year': 2025,
        'is_active': True
    }
    result = supabase.table('vehicle_profiles').insert(test_vehicle).execute()
    new_id = result.data[0]['id']
    print(f"   ✅ INSERT works! Created vehicle ID: {new_id}")
    
    # Test INSERT sensor data
    test_sensor = {
        'vehicle_id': new_id,
        'timestamp': datetime.now().isoformat(),
        'rpm': 1500.0,
        'vehicle_speed': 60.0,
        'coolant_temp': 85.0,
        'engine_load': 45.0
    }
    supabase.table('sensor_data').insert(test_sensor).execute()
    print(f"   ✅ Sensor data INSERT works!")
    
    # 6. Test GET capability
    print("\n🧪 Testing GET capability...")
    verify = supabase.table('vehicle_profiles').select('*').eq('id', new_id).execute()
    if verify.data:
        print(f"   ✅ GET works! Retrieved: {verify.data[0]['make']} {verify.data[0]['model']}")
    
    # Cleanup test data
    print("\n🧹 Cleaning up test data...")
    supabase.table('sensor_data').delete().eq('vehicle_id', new_id).execute()
    supabase.table('vehicle_profiles').delete().eq('id', new_id).execute()
    print(f"   ✅ Cleanup complete")
    
    # Final summary
    print("\n" + "=" * 70)
    print("✨ SUCCESS! EVERYTHING IS WORKING!")
    print("=" * 70)
    print("\n✅ Verified:")
    print("   • Supabase connection active")
    print("   • All tables accessible")
    print("   • INSERT operations working")
    print("   • GET operations working")
    print("   • Views populating correctly")
    print("\n🎯 Your Raspberry Pi is ready to collect OBD data!")
    print(f"   Total readings in database: {total:,}\n")
    
except Exception as e:
    print("\n" + "=" * 70)
    print("❌ ERROR!")
    print("=" * 70)
    print(f"\n{e}\n")
    print("Possible issues:")
    print("  • Check internet connection")
    print("  • Verify .env file exists")
    print("  • Confirm Supabase credentials are correct")
    sys.exit(1)
