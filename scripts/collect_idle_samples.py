#!/usr/bin/env python3
"""
Collect NORMAL idle samples for model retraining

This script will:
1. Query recent data from Supabase where car is idling (RPM < 1200, Speed = 0)
2. Relabel them as NORMAL (health_status = 0) if they meet idle criteria
3. Generate additional synthetic idle variations
4. Save to training data for retraining

Usage:
    python3 scripts/collect_idle_samples.py
"""

import sys
import os
from pathlib import Path
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

# Supabase imports
from supabase import create_client, Client
from dotenv import load_dotenv

# Supabase configuration (hardcoded for simplicity)
SUPABASE_URL = "https://qimiewqthuhmofjhzrrb.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpbWlld3F0aHVobW9mamh6cnJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Mjc5MTMsImV4cCI6MjA3MTEwMzkxM30.jHY0m_l-uvwaZd-x9POEpLdoP__oLUdE-7U-E5mZqz0"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def fetch_idle_data():
    """Fetch data that looks like idle conditions"""
    print("="*80)
    print("FETCHING IDLE DATA FROM SUPABASE")
    print("="*80)
    
    # Get recent data where car is likely idling
    # Criteria: RPM < 1200, Speed = 0, coolant temp 85-100°C
    try:
        response = supabase.table('sensor_data') \
            .select('*') \
            .lt('rpm', 1200) \
            .eq('vehicle_speed', 0) \
            .gte('coolant_temp', 85) \
            .lte('coolant_temp', 100) \
            .order('timestamp', desc=True) \
            .limit(1000) \
            .execute()
        
        data = response.data
        print(f"✅ Found {len(data)} potential idle samples")
        
        if len(data) == 0:
            print("⚠️  No idle data found. Make sure your car has been idling with data collection running.")
            return pd.DataFrame()
        
        df = pd.DataFrame(data)
        
        # Show sample
        print("\n📊 Sample idle data:")
        print(df[['rpm', 'vehicle_speed', 'coolant_temp', 'engine_load', 'health_status']].head(10))
        
        return df
        
    except Exception as e:
        print(f"❌ Error fetching data: {e}")
        return pd.DataFrame()

def relabel_idle_as_normal(df):
    """Relabel idle samples as NORMAL if they meet criteria"""
    print("\n" + "="*80)
    print("RELABELING IDLE SAMPLES AS NORMAL")
    print("="*80)
    
    # Define strict idle criteria
    idle_criteria = (
        (df['rpm'] >= 600) & (df['rpm'] <= 1200) &  # Normal idle RPM range
        (df['vehicle_speed'] == 0) &                # Parked
        (df['coolant_temp'] >= 85) & (df['coolant_temp'] <= 100) &  # Normal operating temp
        (df['engine_load'] <= 60) &                 # Reasonable idle load (AC, accessories)
        (df['control_module_voltage'] >= 13) & (df['control_module_voltage'] <= 15)  # Good electrical
    )
    
    idle_samples = df[idle_criteria].copy()
    
    print(f"✅ Found {len(idle_samples)} samples meeting strict idle criteria")
    print(f"   - RPM: 600-1200")
    print(f"   - Speed: 0 km/h")
    print(f"   - Coolant: 85-100°C")
    print(f"   - Load: ≤60%")
    print(f"   - Voltage: 13-15V")
    
    # Relabel as NORMAL (0)
    idle_samples['health_status'] = 0
    idle_samples['status'] = 'NORMAL'
    
    # Show distribution before/after
    print(f"\n📊 Original health_status distribution:")
    print(df['health_status'].value_counts().sort_index())
    
    print(f"\n📊 After relabeling idle samples:")
    print(f"   NORMAL (0): {len(idle_samples)} samples")
    
    return idle_samples

def generate_synthetic_idle_variations(base_samples, n_synthetic=200):
    """Generate synthetic variations of real idle data"""
    print("\n" + "="*80)
    print(f"GENERATING {n_synthetic} SYNTHETIC IDLE VARIATIONS")
    print("="*80)
    
    if len(base_samples) == 0:
        print("❌ No base samples to generate from!")
        return pd.DataFrame()
    
    synthetic_samples = []
    
    # Use up to 50 real samples as templates
    template_samples = base_samples.sample(n=min(50, len(base_samples)), replace=True)
    
    samples_per_template = n_synthetic // len(template_samples)
    
    for _, template in template_samples.iterrows():
        for _ in range(samples_per_template):
            synthetic = template.copy()
            
            # Add realistic variations
            synthetic['rpm'] = np.clip(
                template['rpm'] + np.random.normal(0, 50),  # ±50 RPM variation
                650, 1150
            )
            
            synthetic['coolant_temp'] = np.clip(
                template['coolant_temp'] + np.random.normal(0, 2),  # ±2°C variation
                88, 98
            )
            
            synthetic['engine_load'] = np.clip(
                template['engine_load'] + np.random.normal(0, 5),  # ±5% variation
                15, 60
            )
            
            synthetic['throttle_pos'] = np.clip(
                template.get('throttle_pos', 15) + np.random.normal(0, 3),
                10, 25
            )
            
            synthetic['intake_temp'] = np.clip(
                template.get('intake_temp', 50) + np.random.normal(0, 3),
                45, 65
            )
            
            synthetic['control_module_voltage'] = np.clip(
                template.get('control_module_voltage', 14) + np.random.normal(0, 0.2),
                13.5, 14.5
            )
            
            # Ensure NORMAL label
            synthetic['health_status'] = 0
            synthetic['status'] = 'NORMAL'
            
            # Update timestamp
            synthetic['timestamp'] = datetime.now().isoformat()
            
            synthetic_samples.append(synthetic)
    
    synthetic_df = pd.DataFrame(synthetic_samples)
    
    print(f"✅ Generated {len(synthetic_df)} synthetic idle samples")
    print(f"\n📊 Synthetic data ranges:")
    print(f"   RPM: {synthetic_df['rpm'].min():.0f} - {synthetic_df['rpm'].max():.0f}")
    print(f"   Coolant: {synthetic_df['coolant_temp'].min():.1f}°C - {synthetic_df['coolant_temp'].max():.1f}°C")
    print(f"   Load: {synthetic_df['engine_load'].min():.1f}% - {synthetic_df['engine_load'].max():.1f}%")
    
    return synthetic_df

def save_training_data(real_idle, synthetic_idle):
    """Save combined idle data for retraining"""
    print("\n" + "="*80)
    print("SAVING IDLE TRAINING DATA")
    print("="*80)
    
    # Combine real and synthetic
    combined = pd.concat([real_idle, synthetic_idle], ignore_index=True)
    
    print(f"✅ Total idle samples: {len(combined)}")
    print(f"   - Real: {len(real_idle)}")
    print(f"   - Synthetic: {len(synthetic_idle)}")
    
    # Save to CSV
    output_file = 'idle_normal_samples.csv'
    combined.to_csv(output_file, index=False)
    
    print(f"\n💾 Saved to: {output_file}")
    print(f"   Rows: {len(combined)}")
    print(f"   Columns: {len(combined.columns)}")
    
    # Show columns
    print(f"\n📋 Columns included:")
    for col in combined.columns:
        non_null = combined[col].notna().sum()
        print(f"   - {col:30s}: {non_null}/{len(combined)} non-null")
    
    return output_file

def main():
    print("\n" + "="*80)
    print("IDLE DATA COLLECTION FOR MODEL RETRAINING")
    print("="*80)
    print("This will:")
    print("1. Fetch recent idle data from Supabase")
    print("2. Relabel as NORMAL (health_status=0)")
    print("3. Generate synthetic variations")
    print("4. Save for retraining")
    print("="*80)
    
    # Step 1: Fetch idle data
    idle_data = fetch_idle_data()
    
    if idle_data.empty:
        print("\n❌ No idle data available. Please:")
        print("   1. Start your car")
        print("   2. Let it idle for 5-10 minutes")
        print("   3. Make sure cloud_collector_daemon_pro.py is running")
        print("   4. Run this script again")
        return
    
    # Step 2: Relabel as NORMAL
    real_idle = relabel_idle_as_normal(idle_data)
    
    if real_idle.empty:
        print("\n❌ No samples met strict idle criteria")
        return
    
    # Step 3: Generate synthetic variations
    synthetic_idle = generate_synthetic_idle_variations(real_idle, n_synthetic=300)
    
    # Step 4: Save
    output_file = save_training_data(real_idle, synthetic_idle)
    
    print("\n" + "="*80)
    print("✅ IDLE DATA COLLECTION COMPLETE")
    print("="*80)
    print(f"\nNext steps:")
    print(f"1. Review the data: {output_file}")
    print(f"2. Merge with existing training data")
    print(f"3. Retrain model: python3 src/ml/train_random_forest.py")
    print(f"4. Test with: python3 scripts/test_idle_prediction.py")
    print("="*80)

if __name__ == '__main__':
    main()
