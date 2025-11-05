-- ================================================================
-- AutoPulse - SIMPLE Schema (Passwords in Database)
-- ================================================================
-- This is the SIMPLE version - stores passwords directly in the users table
-- No Supabase Auth, no RLS complexity, just basic tables
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- STEP 1: Drop existing tables
-- ================================================================

DROP TABLE IF EXISTS telemetry_data CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ================================================================
-- STEP 2: Create SIMPLE users table WITH password column
-- ================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,  -- 👈 Password stored in plain text
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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
-- STEP 5: DISABLE Row Level Security (keep it simple!)
-- ================================================================

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_data DISABLE ROW LEVEL SECURITY;

-- ================================================================
-- STEP 6: Helper Functions
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
-- ✅ SIMPLE SETUP COMPLETE!
-- ================================================================
-- This schema:
-- ✅ Stores passwords directly in the users table
-- ✅ No Supabase Auth complexity
-- ✅ No RLS policies to deal with
-- ✅ Just basic CRUD operations
-- ================================================================

-- You can now use simple INSERT/SELECT queries for signup/login!
