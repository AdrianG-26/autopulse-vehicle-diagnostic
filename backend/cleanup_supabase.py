#!/usr/bin/env python3
"""
Clean up Supabase tables - Remove test/migration data
Keeps: users, password, messages
Cleans: vehicle_profiles, sensor_data, sensor_data_realtime, telemetry_data, vehicles
"""

import os
from supabase import create_client

# Set environment variables
os.environ['SUPABASE_URL'] = 'https://qimiewqthuhmofjhzrrb.supabase.co'
os.environ['SUPABASE_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpbWlld3F0aHVobW9mamh6cnJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Mjc5MTMsImV4cCI6MjA3MTEwMzkxM30.jHY0m_l-uvwaZd-x9POEpLdoP__oLUdE-7U-E5mZqz0'

supabase = create_client(os.environ['SUPABASE_URL'], os.environ['SUPABASE_KEY'])

print("\n" + "=" * 70)
print("🗑️  CLEANING UP SUPABASE TABLES")
print("=" * 70)

# Tables to clean (in order - child tables first due to foreign keys)
tables_to_clean = [
    'sensor_data_realtime',  # Child of vehicle_profiles
    'sensor_data',           # Child of vehicle_profiles  
    'telemetry_data',        # Child of vehicle_profiles
    'vehicles',              # If exists
    'vehicle_profiles',      # Parent table (clean last)
]

# Tables to KEEP (do not touch)
tables_to_keep = ['users', 'password', 'messages', 'alerts', 'fault_codes']

print(f"\n⚠️  WARNING: This will delete ALL data from:")
for table in tables_to_clean:
    print(f"   • {table}")

print(f"\n✅ Will KEEP data in:")
for table in tables_to_keep:
    print(f"   • {table}")

response = input("\n⚠️  Are you sure you want to continue? (yes/no): ")
if response.lower() != 'yes':
    print("❌ Cancelled. No data was deleted.")
    exit(0)

print("\n" + "=" * 70)
print("🧹 Starting cleanup...")
print("=" * 70)

# Track results
results = {}

# Clean each table
for table_name in tables_to_clean:
    try:
        print(f"\n📊 Cleaning {table_name}...")
        
        # Count current rows
        count_result = supabase.table(table_name).select('id', count='exact').execute()
        before_count = count_result.count
        print(f"   Current rows: {before_count:,}")
        
        if before_count == 0:
            print(f"   ✅ Already empty")
            results[table_name] = 'already_empty'
            continue
        
        # Delete all rows (using a condition that's always true)
        # Note: Delete without filter will delete ALL rows
        delete_result = supabase.table(table_name).delete().neq('id', 0).execute()
        
        # Verify deletion
        verify_result = supabase.table(table_name).select('id', count='exact').execute()
        after_count = verify_result.count
        
        if after_count == 0:
            print(f"   ✅ Deleted {before_count:,} rows")
            results[table_name] = f'deleted_{before_count}'
        else:
            print(f"   ⚠️  Partially cleaned: {before_count - after_count:,} deleted, {after_count} remaining")
            results[table_name] = f'partial_{after_count}_remaining'
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        results[table_name] = f'error_{str(e)[:50]}'

# Summary
print("\n" + "=" * 70)
print("📊 CLEANUP SUMMARY")
print("=" * 70)

for table, result in results.items():
    if result == 'already_empty':
        status = "✅ Already empty"
    elif result.startswith('deleted_'):
        count = result.split('_')[1]
        status = f"✅ Deleted {count} rows"
    elif result.startswith('partial_'):
        remaining = result.split('_')[1]
        status = f"⚠️  {remaining} rows remaining"
    elif result.startswith('error_'):
        status = f"❌ Error"
    else:
        status = result
    
    print(f"{table:30s} {status}")

print("\n" + "=" * 70)
print("✅ CLEANUP COMPLETE!")
print("=" * 70)
print("\n📋 Next steps:")
print("   1. Run verification: python3 verify_supabase.py")
print("   2. Run tests: python3 test_all_supabase_tables.py")
print("   3. Start collecting OBD data: python3 cloud_collector_daemon.py")
print()
