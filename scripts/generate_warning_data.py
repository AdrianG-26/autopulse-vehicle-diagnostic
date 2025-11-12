#!/usr/bin/env python3
"""
Generate Synthetic WARNING Data for ML Training
Uses real WARNING samples as templates and creates realistic variations
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from supabase import create_client
import numpy as np
from datetime import datetime, timedelta
import random

SUPABASE_URL = "https://qimiewqthuhmofjhzrrb.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpbWlld3F0aHVobW9mamh6cnJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Mjc5MTMsImV4cCI6MjA3MTEwMzkxM30.jHY0m_l-uvwaZd-x9POEpLdoP__oLUdE-7U-E5mZqz0"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("\n" + "="*80)
print("🔬 SMART WARNING DATA GENERATOR")
print("="*80)

# Step 1: Fetch existing WARNING samples as templates
print("\n📥 Step 1: Fetching real WARNING samples from Supabase...")
response = supabase.table('sensor_data').select('*').eq('health_status', 2).execute()

real_warning_samples = response.data
print(f"✅ Found {len(real_warning_samples)} real WARNING samples")

if len(real_warning_samples) == 0:
    print("❌ No WARNING samples found. Cannot generate synthetic data.")
    sys.exit(1)

# Step 2: Analyze the templates
print("\n🔍 Step 2: Analyzing WARNING sample characteristics...")

# Get column names from first sample
template = real_warning_samples[0]
numeric_fields = []
for key, value in template.items():
    if isinstance(value, (int, float)) and value is not None and key not in ['id', 'health_status']:
        numeric_fields.append(key)

print(f"   Found {len(numeric_fields)} numeric parameters to vary")

# Calculate statistics for each field
field_stats = {}
for field in numeric_fields:
    values = [s.get(field) for s in real_warning_samples if s.get(field) is not None]
    if values:
        field_stats[field] = {
            'mean': np.mean(values),
            'std': np.std(values),
            'min': np.min(values),
            'max': np.max(values),
            'median': np.median(values)
        }

print(f"   Calculated statistics for {len(field_stats)} parameters")

# Step 3: Generate synthetic WARNING samples
TARGET_WARNING_COUNT = 200  # Total WARNING samples we want
num_to_generate = TARGET_WARNING_COUNT - len(real_warning_samples)

print(f"\n🎯 Step 3: Generating {num_to_generate} synthetic WARNING samples...")
print(f"   Strategy: Create realistic variations of real samples")

synthetic_samples = []

for i in range(num_to_generate):
    # Pick a random real WARNING sample as base template
    base_template = random.choice(real_warning_samples).copy()
    
    # Remove id and timestamp (will be auto-generated)
    base_template.pop('id', None)
    base_template.pop('created_at', None)
    
    # Determine variation type (different levels of variation)
    variation_type = i % 4
    
    if variation_type == 0:
        # Minor variation (±5% of mean)
        variation_factor = 0.05
    elif variation_type == 1:
        # Moderate variation (±10% of mean)
        variation_factor = 0.10
    elif variation_type == 2:
        # Higher variation (±15% of mean)
        variation_factor = 0.15
    else:
        # Interpolation between two real samples
        sample2 = random.choice(real_warning_samples)
        interpolation_factor = random.uniform(0.3, 0.7)
        
        for field in numeric_fields:
            val1 = base_template.get(field)
            val2 = sample2.get(field)
            
            if val1 is not None and val2 is not None:
                # Interpolate between the two values
                new_val = val1 * interpolation_factor + val2 * (1 - interpolation_factor)
                base_template[field] = round(new_val, 4) if isinstance(val1, float) else int(new_val)
        
        synthetic_samples.append(base_template)
        continue
    
    # Apply variations to numeric fields
    for field in numeric_fields:
        if field in field_stats and base_template.get(field) is not None:
            original_value = base_template[field]
            mean = field_stats[field]['mean']
            std = field_stats[field]['std']
            
            # Add Gaussian noise based on variation factor
            noise = np.random.normal(0, std * variation_factor)
            new_value = original_value + noise
            
            # Clamp to realistic bounds (within observed min/max range)
            min_val = field_stats[field]['min']
            max_val = field_stats[field]['max']
            new_value = max(min_val * 0.9, min(max_val * 1.1, new_value))
            
            # Round appropriately
            if isinstance(original_value, float):
                base_template[field] = round(new_value, 4)
            else:
                base_template[field] = int(new_value)
    
    # Ensure health_status remains WARNING (2)
    base_template['health_status'] = 2
    
    # Recalculate derived features if they exist
    if 'load_rpm_ratio' in base_template and base_template.get('rpm') and base_template.get('engine_load'):
        rpm = base_template['rpm']
        load = base_template['engine_load']
        if rpm > 0:
            base_template['load_rpm_ratio'] = round((load / rpm) * 1000, 4)
    
    if 'temp_gradient' in base_template:
        # Keep existing or set to reasonable WARNING range
        if base_template['temp_gradient'] is None:
            base_template['temp_gradient'] = round(np.random.uniform(0.5, 2.5), 4)
    
    if 'fuel_efficiency' in base_template and base_template.get('vehicle_speed') and base_template.get('fuel_level'):
        speed = base_template['vehicle_speed']
        fuel = base_template['fuel_level']
        if speed > 0 and fuel > 0:
            base_template['fuel_efficiency'] = round(speed / fuel, 4)
    
    synthetic_samples.append(base_template)
    
    if (i + 1) % 50 == 0:
        print(f"   Generated {i + 1}/{num_to_generate} samples...")

print(f"✅ Generated {len(synthetic_samples)} synthetic WARNING samples")

# Step 4: Upload to Supabase
print(f"\n💾 Step 4: Uploading synthetic samples to Supabase...")

# Upload in batches to avoid timeout
BATCH_SIZE = 100
uploaded_count = 0

for i in range(0, len(synthetic_samples), BATCH_SIZE):
    batch = synthetic_samples[i:i+BATCH_SIZE]
    
    try:
        result = supabase.table('sensor_data').insert(batch).execute()
        uploaded_count += len(batch)
        print(f"   Uploaded batch {i//BATCH_SIZE + 1}: {len(batch)} samples")
    except Exception as e:
        print(f"❌ Error uploading batch {i//BATCH_SIZE + 1}: {e}")
        continue

print(f"✅ Successfully uploaded {uploaded_count} synthetic WARNING samples")

# Step 5: Verify final counts
print(f"\n📊 Step 5: Verifying final WARNING count...")
final_response = supabase.table('sensor_data').select('health_status', count='exact').eq('health_status', 2).execute()
final_warning_count = final_response.count

print("\n" + "="*80)
print("📈 FINAL RESULTS")
print("="*80)
print(f"\n   Real WARNING samples:      {len(real_warning_samples):>6,}")
print(f"   Generated synthetic:        {uploaded_count:>6,}")
print(f"   Total WARNING samples:      {final_warning_count:>6,}")
print(f"\n   Target was:                 {TARGET_WARNING_COUNT:>6,}")

if final_warning_count >= TARGET_WARNING_COUNT * 0.9:  # Within 10% of target
    print(f"\n   ✅ SUCCESS! Achieved target WARNING sample count")
else:
    print(f"\n   ⚠️  Below target by {TARGET_WARNING_COUNT - final_warning_count} samples")

print("\n" + "="*80)
print("🎓 METHODOLOGY NOTE FOR THESIS")
print("="*80)
print("""
Data Augmentation Approach:
- Used real WARNING samples (n={}) as templates
- Applied Gaussian noise and interpolation techniques
- Maintained realistic parameter relationships
- Variations: ±5% to ±15% of observed statistics
- Ensures WARNING class is adequately represented for ML training

This is a standard practice in ML when dealing with class imbalance.
Cite: "Data Augmentation for Machine Learning" (academic standard)
""".format(len(real_warning_samples)))

print("="*80)
print("\n✅ NEXT STEPS:")
print("   1. Run: python3 src/ml/fetch_training_data.py")
print("   2. Run: python3 src/ml/train_random_forest.py")
print("   3. Verify model now has 4 classes (including WARNING)")
print("\n" + "="*80 + "\n")
