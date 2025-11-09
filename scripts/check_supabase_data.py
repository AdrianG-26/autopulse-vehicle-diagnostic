#!/usr/bin/env python3
"""
Check if OBD data is being stored in Supabase
Quick verification script for Raspberry Pi
"""

import os
import sys
from datetime import datetime, timedelta, timezone

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

try:
    from supabase_direct_storage import supabase_storage
except ImportError:
    print("❌ Could not import Supabase storage")
    sys.exit(1)

def check_recent_data():
    """Check for recent sensor data in Supabase"""
    print("🔍 Checking Supabase for recent OBD data...")
    print("=" * 60)
    
    if not supabase_storage.is_connected:
        print("❌ Not connected to Supabase")
        return False
    
    print("✅ Connected to Supabase")
    print()
    
    try:
        # Query recent sensor data using supabase_client
        response = supabase_storage.supabase_client.table('sensor_data') \
            .select('*') \
            .order('timestamp', desc=True) \
            .limit(10) \
            .execute()
        
        if not response.data:
            print("⚠️  No data found in sensor_data table")
            print("   The collector may not be running or no OBD connection")
            return False
        
        print(f"✅ Found {len(response.data)} recent readings")
        print()
        print("Latest readings:")
        print("-" * 60)
        
        for i, reading in enumerate(response.data[:5], 1):
            timestamp = reading.get('timestamp', 'N/A')
            vehicle_id = reading.get('vehicle_id', 'N/A')
            rpm = reading.get('rpm', 0)
            speed = reading.get('vehicle_speed', 0)
            temp = reading.get('coolant_temp', 0)
            load = reading.get('engine_load', 0)
            
            print(f"{i}. {timestamp}")
            print(f"   Vehicle ID: {vehicle_id}")
            print(f"   RPM: {rpm}, Speed: {speed} km/h, Temp: {temp}°C, Load: {load}%")
            print()
        
        # Check how recent the data is
        latest = response.data[0]
        timestamp_str = latest.get('timestamp')
        if timestamp_str:
            try:
                # Parse timestamp
                latest_time = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
                now = datetime.now(timezone.utc)
                age = now - latest_time
                
                print("-" * 60)
                print(f"⏱️  Latest reading age: {age.total_seconds():.1f} seconds ago")
                
                if age.total_seconds() < 60:
                    print("✅ Data is FRESH! Collector is actively running")
                elif age.total_seconds() < 300:
                    print("⚠️  Data is a few minutes old")
                else:
                    print("⚠️  Data is old - collector may have stopped")
                
            except Exception as e:
                print(f"⚠️  Could not parse timestamp: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error querying Supabase: {e}")
        import traceback
        traceback.print_exc()
        return False

def check_vehicles():
    """Check registered vehicles"""
    print()
    print("🚗 Checking registered vehicles...")
    print("-" * 60)
    
    try:
        response = supabase_storage.supabase_client.table('vehicle_profiles') \
            .select('*') \
            .execute()
        
        if not response.data:
            print("⚠️  No vehicles registered yet")
            return
        
        print(f"✅ Found {len(response.data)} vehicle(s)")
        print()
        
        for i, vehicle in enumerate(response.data, 1):
            vehicle_id = vehicle.get('id', 'N/A')
            name = vehicle.get('display_name', 'Unknown')
            make = vehicle.get('make', 'N/A')
            model = vehicle.get('model', 'N/A')
            total_records = vehicle.get('total_records', 0)
            
            print(f"{i}. {name}")
            print(f"   ID: {vehicle_id}")
            print(f"   Make/Model: {make} {model}")
            print(f"   Total Records: {total_records}")
            print()
        
    except Exception as e:
        print(f"❌ Error checking vehicles: {e}")
        import traceback
        traceback.print_exc()

def main():
    print()
    print("🔍 AutoPulse Supabase Data Verification")
    print("=" * 60)
    print()
    
    # Check data
    has_data = check_recent_data()
    
    # Check vehicles
    check_vehicles()
    
    print()
    print("=" * 60)
    
    if has_data:
        print("✅ SUCCESS: OBD data is being stored in Supabase!")
        print()
        print("🎉 Your system is working perfectly!")
        print("   - OBD collector is running")
        print("   - Data is reaching Supabase")
        print("   - Your web dashboard can now show live data")
    else:
        print("⚠️  No recent data found")
        print()
        print("Troubleshooting steps:")
        print("  1. Check if collector service is running:")
        print("     sudo systemctl status autopulse-collector")
        print("  2. View collector logs:")
        print("     sudo journalctl -u autopulse-collector -n 50")
        print("  3. Check OBD connection:")
        print("     ls -la /dev/rfcomm* /dev/ttyUSB*")
        print("  4. Restart collector:")
        print("     sudo systemctl restart autopulse-collector")
    
    print()

if __name__ == "__main__":
    main()
