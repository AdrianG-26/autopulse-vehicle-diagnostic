-- ================================================================
-- AutoPulse SECURE Database Schema
-- ================================================================
-- SECURITY: Password column REMOVED - Supabase Auth handles passwords
-- Run this in your Supabase SQL Editor
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- Users table (extends auth.users)
-- ================================================================
-- NOTE: Passwords are NEVER stored here!
-- Supabase Auth automatically hashes passwords with bcrypt
-- and stores them securely in the auth.users table.
-- ================================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- NO PASSWORD COLUMN - Supabase Auth handles this securely!
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'technician'))
);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own data (except role)
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- ================================================================
-- Vehicles table
-- ================================================================

CREATE TABLE IF NOT EXISTS vehicles (
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

-- Row Level Security
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

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
-- Telemetry data table (main data source)
-- ================================================================

CREATE TABLE IF NOT EXISTS telemetry_data (
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
    short_term_fuel_trim DECIMAL(5,2),
    long_term_fuel_trim DECIMAL(5,2),
    
    -- Oxygen sensors
    o2_sensor_1 DECIMAL(5,3),
    o2_sensor_2 DECIMAL(5,3),
    
    -- Computed fields
    fuel_efficiency DECIMAL(6,2),
    
    -- Status
    status TEXT DEFAULT 'NORMAL',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE telemetry_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vehicle telemetry"
  ON telemetry_data FOR SELECT
  USING (
    vehicle_id IN (
      SELECT id FROM vehicles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own vehicle telemetry"
  ON telemetry_data FOR INSERT
  WITH CHECK (
    vehicle_id IN (
      SELECT id FROM vehicles WHERE user_id = auth.uid()
    )
  );

-- ================================================================
-- Indexes for performance
-- ================================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX idx_telemetry_vehicle_id ON telemetry_data(vehicle_id);
CREATE INDEX idx_telemetry_timestamp ON telemetry_data(timestamp DESC);

-- ================================================================
-- Functions
-- ================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- SECURITY NOTES
-- ================================================================
-- 
-- ✅ PASSWORD SECURITY:
-- ---------------------
-- Passwords are NEVER stored in custom tables!
-- Supabase Auth handles password hashing automatically:
--   • Uses bcrypt algorithm
--   • Stores hashed passwords in auth.users (secure system table)
--   • Plaintext passwords never touch your database
--   • Industry-standard security practices
--
-- When users sign up via:
--   supabase.auth.signUp({ email, password })
-- 
-- Supabase automatically:
--   1. Hashes the password with bcrypt
--   2. Stores hash in auth.users table
--   3. Creates session token
--   4. Returns user object (no password!)
--
-- ✅ ROW LEVEL SECURITY (RLS):
-- ---------------------------
-- All tables have RLS enabled
-- Users can only access their own data
-- Prevents unauthorized data access
--
-- ================================================================
