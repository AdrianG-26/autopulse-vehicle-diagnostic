#!/usr/bin/env python3
"""Check Supabase for WARNING data"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from supabase import create_client
from collections import Counter

SUPABASE_URL = "https://qimiewqthuhmofjhzrrb.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpbWlld3F0aHVobW9mamh6cnJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Mjc5MTMsImV4cCI6MjA3MTEwMzkxM30.jHY0m_l-uvwaZd-x9POEpLdoP__oLUdE-7U-E5mZqz0"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("\n" + "="*80)
print("🔍 CHECKING SUPABASE DATABASE FOR WARNING DATA")
print("="*80)

# Get COUNT first
count_response = supabase.table('sensor_data').select('id', count='exact').execute()
total_in_db = count_response.count

print(f"\n📊 Total Records in Database: {total_in_db:,}")
print("⏳ Fetching all records (this may take a moment)...")

# Get ALL sensor data with health_status (no limit)
all_data = []
page_size = 1000
offset = 0

while True:
    response = supabase.table('sensor_data')\
        .select('health_status, engine_stress_score, coolant_temp, rpm, engine_load, control_module_voltage')\
        .range(offset, offset + page_size - 1)\
        .execute()
    
    if not response.data:
        break
    
    all_data.extend(response.data)
    offset += page_size
    
    if len(response.data) < page_size:
        break
    
    if offset % 5000 == 0:
        print(f"   Fetched {offset:,} records...")

print(f"✅ Fetched {len(all_data):,} records")

total_records = len(all_data)

# Count health status distribution (handle both text and numeric)
status_counts = Counter([r['health_status'] for r in all_data])

# Map text to numeric for consistency
text_to_numeric = {'NORMAL': 0, 'ADVISORY': 1, 'WARNING': 2, 'CRITICAL': 3}
status_labels = {0: 'NORMAL', 1: 'ADVISORY', 2: 'WARNING', 3: 'CRITICAL'}

# Check if data is text or numeric
first_status = all_data[0]['health_status'] if all_data else None
is_text_format = isinstance(first_status, str)

print("\n" + "="*80)
print("HEALTH STATUS DISTRIBUTION")
print("="*80)
print(f"\nData Format: {'TEXT' if is_text_format else 'NUMERIC'}")
print(f"\n{'Status':<15} {'Value':<12} {'Count':<12} {'Percentage':<12}")
print("-" * 60)

for status in sorted(status_counts.keys()):
    if is_text_format:
        label = status
        numeric_code = text_to_numeric.get(status, '?')
    else:
        label = status_labels.get(status, f'Unknown({status})')
        numeric_code = status
    count = status_counts[status]
    percentage = (count / total_records * 100) if total_records > 0 else 0
    print(f"{label:<15} {str(numeric_code):<12} {count:>8,}   {percentage:>8.2f}%")

print("\n" + "="*80)

# Check WARNING samples in detail (handle both formats)
if is_text_format:
    warning_samples = [r for r in all_data if r['health_status'] == 'WARNING']
else:
    warning_samples = [r for r in all_data if r['health_status'] == 2]

if warning_samples:
    print(f"\n✅ FOUND {len(warning_samples)} WARNING SAMPLES!")
    print("\n" + "="*80)
    print("WARNING SAMPLE DETAILS (First 10)")
    print("="*80)
    print(f"\n{'Stress':<8} {'Temp(°C)':<10} {'RPM':<8} {'Load(%)':<10} {'Voltage':<10}")
    print("-" * 55)
    
    for sample in warning_samples[:10]:
        stress = sample.get('engine_stress_score', 'N/A')
        temp = sample.get('coolant_temp', 'N/A')
        rpm = sample.get('rpm', 'N/A')
        load = sample.get('engine_load', 'N/A')
        voltage = sample.get('control_module_voltage', 'N/A')
        
        print(f"{stress!s:<8} {temp!s:<10} {rpm!s:<8} {load!s:<10} {voltage!s:<10}")
    
    if len(warning_samples) > 10:
        print(f"\n... and {len(warning_samples) - 10} more WARNING samples")
else:
    print("\n❌ NO WARNING DATA FOUND")
    print("\n💡 Possible reasons:")
    print("   - Car is running very well (healthy)")
    print("   - Not enough driving in WARNING conditions")
    print("   - Need highway driving, hill climbing, or heavy load scenarios")

print("\n" + "="*80)
print("RECOMMENDATION")
print("="*80)

if len(warning_samples) >= 100:
    print(f"\n✅ You have {len(warning_samples)} WARNING samples - SUFFICIENT for training!")
    print("   Ready to retrain the model with 4 classes.")
elif len(warning_samples) > 0:
    print(f"\n⚠️  You have {len(warning_samples)} WARNING samples - LIMITED")
    print("   Recommended: Collect at least 100-200 WARNING samples")
    print("   Options:")
    print("   1. Drive more in WARNING conditions (highway, hills, heavy load)")
    print("   2. Use synthetic data generation to supplement")
elif len(warning_samples) == 0:
    print("\n❌ No WARNING data collected yet")
    print("   You MUST either:")
    print("   1. Collect real WARNING data through driving")
    print("   2. Generate synthetic WARNING data")
    print("   Otherwise, model will remain 3-class (no WARNING detection)")

print("\n" + "="*80 + "\n")
