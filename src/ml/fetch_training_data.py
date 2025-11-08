#!/usr/bin/env python3
"""
Fetch Training Data from Supabase
Downloads all sensor data and applies Strategy 1 (Clean Data Only) filtering
"""

import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from supabase import create_client
import pandas as pd

SUPABASE_URL = "https://qimiewqthuhmofjhzrrb.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpbWlld3F0aHVobW9mamh6cnJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Mjc5MTMsImV4cCI6MjA3MTEwMzkxM30.jHY0m_l-uvwaZd-x9POEpLdoP__oLUdE-7U-E5mZqz0"

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', 'data', 'ml')
os.makedirs(DATA_DIR, exist_ok=True)

def fetch_and_clean_data():
    print("\n" + "="*80)
    print("📥 FETCHING TRAINING DATA FROM SUPABASE")
    print("="*80)
    
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Fetch ALL data (no limit)
    print("\n📥 Downloading all sensor_data records...")
    all_data = []
    page_size = 1000
    offset = 0
    
    while True:
        response = supabase.table('sensor_data').select('*').range(offset, offset + page_size - 1).execute()
        if not response.data:
            break
        all_data.extend(response.data)
        print(f"  Fetched {len(all_data)} records so far...")
        if len(response.data) < page_size:
            break
        offset += page_size
    
    df_all = pd.DataFrame(all_data)
    print(f"✅ Downloaded {len(df_all):,} total records")
    
    # Save raw data
    raw_file = os.path.join(DATA_DIR, 'raw_training_data.csv')
    df_all.to_csv(raw_file, index=False)
    print(f"💾 Saved raw data to: {raw_file}")
    
    # Critical features
    critical_features = ['rpm', 'vehicle_speed', 'coolant_temp', 'engine_load',
                        'throttle_pos', 'control_module_voltage', 
                        'engine_stress_score', 'health_status']
    
    print("\n" + "="*80)
    print("🔍 APPLYING STRATEGY 1: CLEAN DATA ONLY")
    print("="*80)
    
    df_all['null_count'] = df_all[critical_features].isnull().sum(axis=1)
    df_clean = df_all[df_all['null_count'] <= 2].copy()
    
    print(f"\n�� Filtering results:")
    print(f"   Before: {len(df_all):>6,} records")
    print(f"   After:  {len(df_clean):>6,} records")
    print(f"   Removed: {len(df_all) - len(df_clean):>6,} records ({(len(df_all) - len(df_clean))/len(df_all)*100:.1f}%)")
    
    health_dist = df_clean['health_status'].value_counts().sort_index()
    print(f"\n🏥 HEALTH STATUS DISTRIBUTION:")
    for status, count in health_dist.items():
        label = {0: 'NORMAL', 1: 'ADVISORY', 2: 'WARNING', 3: 'CRITICAL'}.get(status, f'Unknown({status})')
        print(f"   {label:<12} {count:>6,} ({count/len(df_clean)*100:>5.1f}%)")
    
    df_clean = df_clean.drop(columns=['null_count'])
    clean_file = os.path.join(DATA_DIR, 'clean_training_data.csv')
    df_clean.to_csv(clean_file, index=False)
    print(f"\n💾 Saved clean data to: {clean_file}")
    print(f"\n🚀 Ready for training! Use: python3 src/ml/train_random_forest.py\n")
    return clean_file

if __name__ == "__main__":
    fetch_and_clean_data()
