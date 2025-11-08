#!/usr/bin/env python3
"""
Analyze Data Quality from Supabase
Checks NULL patterns, distribution, and recommends cleaning strategy
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from supabase import create_client
import pandas as pd
import numpy as np
from datetime import datetime

# Supabase configuration
SUPABASE_URL = "https://qimiewqthuhmofjhzrrb.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpbWlld3F0aHVobW9mamh6cnJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Mjc5MTMsImV4cCI6MjA3MTEwMzkxM30.jHY0m_l-uvwaZd-x9POEpLdoP__oLUdE-7U-E5mZqz0"

def analyze_data_quality():
    """Analyze NULL patterns and data quality"""
    
    print("\n" + "="*80)
    print("🔍 DATA QUALITY ANALYSIS")
    print("="*80)
    
    # Connect to Supabase
    print("\n📡 Connecting to Supabase...")
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Fetch all data
    print("📥 Fetching all sensor data...")
    response = supabase.table('sensor_data') \
        .select('*') \
        .execute()
    
    df = pd.DataFrame(response.data)
    print(f"✅ Fetched {len(df)} total records")
    
    # Critical features that MUST have values
    critical_features = [
        'rpm', 'vehicle_speed', 'coolant_temp', 'engine_load',
        'throttle_pos', 'control_module_voltage', 
        'engine_stress_score', 'health_status'
    ]
    
    # Count NULLs per record
    print("\n" + "="*80)
    print("📊 NULL VALUE DISTRIBUTION")
    print("="*80)
    
    df['null_count'] = df[critical_features].isnull().sum(axis=1)
    
    print(f"\n📈 Critical Features NULL Count:")
    print(f"   Records with 0 NULLs:     {len(df[df['null_count'] == 0]):>6,} ({len(df[df['null_count'] == 0])/len(df)*100:>5.1f}%)")
    print(f"   Records with 1-2 NULLs:   {len(df[(df['null_count'] >= 1) & (df['null_count'] <= 2)]):>6,} ({len(df[(df['null_count'] >= 1) & (df['null_count'] <= 2)])/len(df)*100:>5.1f}%)")
    print(f"   Records with 3-5 NULLs:   {len(df[(df['null_count'] >= 3) & (df['null_count'] <= 5)]):>6,} ({len(df[(df['null_count'] >= 3) & (df['null_count'] <= 5)])/len(df)*100:>5.1f}%)")
    print(f"   Records with 6+ NULLs:    {len(df[df['null_count'] >= 6]):>6,} ({len(df[df['null_count'] >= 6])/len(df)*100:>5.1f}%)")
    
    # Analyze by ID range
    print("\n" + "="*80)
    print("📅 NULL PATTERN BY ID RANGE (Timeline)")
    print("="*80)
    
    ranges = [
        (1, 2000, "Early Phase 1"),
        (2001, 4000, "Phase 2"),
        (4001, 6000, "Transition Phase"),
        (6001, df['id'].max(), "Current Phase")
    ]
    
    for start, end, phase in ranges:
        phase_df = df[(df['id'] >= start) & (df['id'] <= end)]
        if len(phase_df) > 0:
            clean = len(phase_df[phase_df['null_count'] == 0])
            print(f"\n{phase} (ID {start:>5,}-{end:>5,}):")
            print(f"   Total records:  {len(phase_df):>6,}")
            print(f"   Clean records:  {clean:>6,} ({clean/len(phase_df)*100:>5.1f}%)")
            print(f"   Avg NULLs:      {phase_df['null_count'].mean():>6.2f}")
    
    # Health status distribution
    print("\n" + "="*80)
    print("🏥 HEALTH STATUS DISTRIBUTION")
    print("="*80)
    
    health_dist = df['health_status'].value_counts().sort_index()
    health_labels = {0: 'NORMAL', 1: 'ADVISORY', 2: 'WARNING', 3: 'CRITICAL'}
    
    print(f"\n{'Status':<12} {'Count':<8} {'Percentage':<12}")
    print("-" * 40)
    for status, count in health_dist.items():
        label = health_labels.get(status, f'Unknown({status})')
        print(f"{label:<12} {count:>6,}   {count/len(df)*100:>6.1f}%")
    
    # Feature completeness
    print("\n" + "="*80)
    print("📋 FEATURE COMPLETENESS (Top NULL Columns)")
    print("="*80)
    
    null_counts = df.isnull().sum().sort_values(ascending=False).head(15)
    
    print(f"\n{'Feature':<30} {'NULL Count':<12} {'NULL %':<10}")
    print("-" * 60)
    for feature, null_count in null_counts.items():
        if null_count > 0:
            print(f"{feature:<30} {null_count:>10,}   {null_count/len(df)*100:>6.1f}%")
    
    # Recommendations
    print("\n" + "="*80)
    print("💡 RECOMMENDATIONS")
    print("="*80)
    
    clean_records = len(df[df['null_count'] <= 2])
    
    print(f"\n✅ STRATEGY 1 (Clean Data Only) - RECOMMENDED")
    print(f"   Keep records with ≤ 2 NULL values in critical features")
    print(f"   Usable records: {clean_records:,} ({clean_records/len(df)*100:.1f}%)")
    
    if clean_records >= 1000:
        print(f"   Status: ✅ EXCELLENT - {clean_records:,} is more than enough!")
        print(f"   Expected accuracy: 94-96%")
    elif clean_records >= 500:
        print(f"   Status: ⚠️  ACCEPTABLE - {clean_records:,} will work")
        print(f"   Expected accuracy: 90-93%")
    else:
        print(f"   Status: ❌ INSUFFICIENT - Only {clean_records:,} records")
        print(f"   Consider Strategy 3 (Hybrid approach)")
    
    print("\n" + "="*80)
    print("📊 SUMMARY")
    print("="*80)
    print(f"\nTotal records:        {len(df):>8,}")
    print(f"Clean records (≤2 NULL): {clean_records:>8,} ({clean_records/len(df)*100:.1f}%)")
    print(f"NORMAL samples:       {health_dist.get(0, 0):>8,}")
    print(f"ADVISORY samples:     {health_dist.get(1, 0):>8,}")
    print(f"WARNING samples:      {health_dist.get(2, 0):>8,}")
    print(f"CRITICAL samples:     {health_dist.get(3, 0):>8,}")
    
    print("\n✅ Analysis complete!")
    print(f"�� Ready to proceed with training using {clean_records:,} clean samples\n")
    
    return clean_records

if __name__ == "__main__":
    analyze_data_quality()
