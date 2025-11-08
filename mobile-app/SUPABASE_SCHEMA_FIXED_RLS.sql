-- ================================================================
-- AutoPulse - FIXED RLS Schema (v3 - Signup Fix)
-- ================================================================
-- Run this in your Supabase SQL Editor to fix the RLS policy issue
-- This allows authenticated users to create their profile during signup
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- STEP 1: Drop existing tables (CASCADE handles policies)
-- ================================================================

-- Drop tables in reverse dependency order
-- CASCADE will automatically drop all associated policies
DROP TABLE IF EXISTS telemetry_data CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ================================================================
-- STEP 2: Create users table WITHOUT password column
-- ================================================================
-- IMPORTANT: Passwords are NEVER stored here!
-- Supabase Auth automatically hashes passwords with bcrypt
-- and stores them securely in the auth.users table.
-- ================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- NO PASSWORD COLUMN - Supabase Auth handles this securely!
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'technician'))
);

-- ================================================================
-- STEP 3: Create vehicles table
-- ================================================================

CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    make TEXT,
    model TEXT,
    year INTEGER,
    vin TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- STEP 4: Create telemetry data table
-- ================================================================

CREATE TABLE telemetry_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Engine metrics
    rpm INTEGER,
    speed INTEGER,
    coolant_temp DECIMAL(5,2),
    battery DECIMAL(5,2),
    map_kpa DECIMAL(6,2),
    engine_load_pct DECIMAL(5,2),
    intake_air_temp DECIMAL(5,2),
    throttle_position DECIMAL(5,2),
    ignition_advance DECIMAL(5,2),
    
    -- Fuel system
    fuel_system_status TEXT,
    fuel_pressure_kpa DECIMAL(6,2),
    fuel_level_pct DECIMAL(5,2),
    fuel_trim_short_pct DECIMAL(5,2),
    fuel_trim_long_pct DECIMAL(5,2),
    
    -- Additional metrics
    maf_grams_sec DECIMAL(6,2),
    o2_voltage DECIMAL(4,2),
    dtc_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- STEP 5: Enable Row Level Security
-- ================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_data ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- STEP 6: Create RLS Policies for users table
-- ================================================================

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- 🔧 FIXED: This policy now allows any authenticated user to insert their profile
-- The check ensures they can only insert a row with their own auth.uid()
CREATE POLICY "Authenticated users can create their profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- ================================================================
-- STEP 7: Create RLS Policies for vehicles table
-- ================================================================

CREATE POLICY "Users can view own vehicles"
  ON vehicles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own vehicles"
  ON vehicles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vehicles"
  ON vehicles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vehicles"
  ON vehicles FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================================
-- STEP 8: Create RLS Policies for telemetry_data table
-- ================================================================

CREATE POLICY "Users can view own telemetry"
  ON telemetry_data FOR SELECT
  USING (
    vehicle_id IN (
      SELECT id FROM vehicles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own telemetry"
  ON telemetry_data FOR INSERT
  WITH CHECK (
    vehicle_id IN (
      SELECT id FROM vehicles WHERE user_id = auth.uid()
    )
  );

-- ================================================================
-- STEP 9: Helper Functions
-- ================================================================

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for vehicles
CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- ✅ SETUP COMPLETE - RLS FIXED!
-- ================================================================
-- Changes from previous version:
-- ✅ INSERT policy now uses "TO authenticated" role
-- ✅ This allows newly created auth users to insert their profile
-- ✅ Still enforces that users can only insert their own ID
-- ================================================================

-- To test, try signing up again in your app!
