-- ================================================================
-- 🚗 Autopulse - Supabase Database Schema
-- ================================================================
-- This schema matches the RPI local database structure and adds
-- cloud storage for vehicle profiles and sensor data
--
-- Execute this in your Supabase SQL Editor to create the tables
-- ================================================================

-- ================================================================
-- 1. VEHICLE PROFILES TABLE
-- ================================================================
-- Stores vehicle information from multiple users
-- Synced from RPI local database
-- ================================================================

CREATE TABLE IF NOT EXISTS vehicle_profiles (
  id BIGSERIAL PRIMARY KEY,
  
  -- User relationship (links vehicle to user account)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Vehicle identification (from RPI collector)
  car_identifier TEXT NOT NULL UNIQUE,  -- Hash from RPI
  car_display_name TEXT NOT NULL,       -- e.g., "Toyota Veloz 2023"
  
  -- Vehicle details
  make TEXT,                             -- e.g., "Toyota"
  model TEXT,                            -- e.g., "Veloz"
  year INTEGER,                          -- e.g., 2023
  vin TEXT,                              -- Vehicle Identification Number
  
  -- Engine & fuel specs
  fuel_type TEXT,                        -- "Gasoline", "Diesel", "Hybrid", etc.
  transmission_type TEXT,                -- "Manual", "Automatic", "CVT", etc.
  engine_size TEXT,                      -- e.g., "1.5L", "2.0L"
  
  -- Metadata
  notes TEXT,                            -- User notes about vehicle
  total_sessions INTEGER DEFAULT 0,      -- Number of data collection sessions
  total_records INTEGER DEFAULT 0,       -- Total sensor readings collected
  is_active BOOLEAN DEFAULT true,        -- Currently in use
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX idx_vehicle_profiles_user_id ON vehicle_profiles(user_id);
CREATE INDEX idx_vehicle_profiles_car_identifier ON vehicle_profiles(car_identifier);
CREATE INDEX idx_vehicle_profiles_is_active ON vehicle_profiles(is_active);

-- Row Level Security (RLS)
ALTER TABLE vehicle_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own vehicles
CREATE POLICY "Users can view their own vehicles"
  ON vehicle_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own vehicles
CREATE POLICY "Users can insert their own vehicles"
  ON vehicle_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own vehicles
CREATE POLICY "Users can update their own vehicles"
  ON vehicle_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own vehicles
CREATE POLICY "Users can delete their own vehicles"
  ON vehicle_profiles FOR DELETE
  USING (auth.uid() = user_id);


-- ================================================================
-- 2. SENSOR DATA TABLE (Historical)
-- ================================================================
-- Stores comprehensive sensor readings from vehicles
-- This is for historical data analysis and charts
-- ================================================================

CREATE TABLE IF NOT EXISTS sensor_data (
  id BIGSERIAL PRIMARY KEY,
  
  -- Vehicle reference
  vehicle_id BIGINT REFERENCES vehicle_profiles(id) ON DELETE CASCADE,
  session_id TEXT,                      -- Data collection session ID
  
  -- Timestamp
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Core engine metrics
  rpm REAL,                             -- Engine RPM
  coolant_temp REAL,                    -- Coolant temperature (°C)
  engine_load REAL,                     -- Engine load (%)
  vehicle_speed REAL,                   -- Vehicle speed (km/h)
  
  -- Throttle & intake
  throttle_pos REAL,                    -- Throttle position (%)
  intake_temp REAL,                     -- Intake air temperature (°C)
  
  -- Fuel system
  fuel_level REAL,                      -- Fuel level (%)
  fuel_trim_short REAL,                 -- Short term fuel trim (%)
  fuel_trim_long REAL,                  -- Long term fuel trim (%)
  fuel_pressure REAL,                   -- Fuel pressure (kPa)
  fuel_system_status TEXT,              -- Fuel system status
  
  -- Air flow & pressure
  maf REAL,                             -- Mass Air Flow (g/s)
  map REAL,                             -- Manifold Absolute Pressure (kPa)
  barometric_pressure REAL,             -- Barometric pressure (kPa)
  
  -- Ignition & timing
  timing_advance REAL,                  -- Timing advance (degrees)
  
  -- Oxygen sensors
  o2_sensor_1 REAL,                     -- O2 sensor 1 voltage
  o2_sensor_2 REAL,                     -- O2 sensor 2 voltage
  
  -- Temperatures
  catalyst_temp REAL,                   -- Catalyst temperature (°C)
  
  -- System metrics
  control_module_voltage REAL,          -- ECU voltage (V)
  engine_runtime INTEGER,               -- Engine runtime (seconds)
  
  -- Diagnostics
  dtc_count INTEGER DEFAULT 0,          -- Diagnostic Trouble Code count
  status TEXT,                          -- Overall status (NORMAL, WARNING, etc.)
  fault_type TEXT,                      -- Fault classification
  
  -- Computed metrics (from RPI)
  load_rpm_ratio REAL,                  -- Load/RPM ratio
  temp_gradient REAL,                   -- Temperature gradient
  fuel_efficiency REAL,                 -- Computed fuel efficiency
  throttle_response REAL,               -- Throttle response metric
  engine_stress_score REAL,             -- Engine stress score
  egr_error REAL,                       -- EGR error percentage
  data_quality_score INTEGER DEFAULT 100, -- Data quality (0-100)
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX idx_sensor_data_vehicle_id ON sensor_data(vehicle_id);
CREATE INDEX idx_sensor_data_timestamp ON sensor_data(timestamp DESC);
CREATE INDEX idx_sensor_data_session_id ON sensor_data(session_id);
CREATE INDEX idx_sensor_data_vehicle_timestamp ON sensor_data(vehicle_id, timestamp DESC);

-- Row Level Security
ALTER TABLE sensor_data ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see data for their vehicles
CREATE POLICY "Users can view their vehicle sensor data"
  ON sensor_data FOR SELECT
  USING (
    vehicle_id IN (
      SELECT id FROM vehicle_profiles WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can insert data for their vehicles
CREATE POLICY "Users can insert their vehicle sensor data"
  ON sensor_data FOR INSERT
  WITH CHECK (
    vehicle_id IN (
      SELECT id FROM vehicle_profiles WHERE user_id = auth.uid()
    )
  );


-- ================================================================
-- 3. REAL-TIME SENSOR DATA TABLE (Live Stream)
-- ================================================================
-- Lightweight table for real-time WebSocket updates
-- Only stores latest reading per vehicle
-- Auto-updates on each new sensor reading
-- ================================================================

CREATE TABLE IF NOT EXISTS sensor_data_realtime (
  id BIGSERIAL PRIMARY KEY,
  
  -- Vehicle reference (unique - one row per vehicle)
  vehicle_id BIGINT UNIQUE REFERENCES vehicle_profiles(id) ON DELETE CASCADE,
  
  -- Timestamp
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Essential real-time metrics
  rpm REAL DEFAULT 0,
  speed REAL DEFAULT 0,
  coolant_temp REAL DEFAULT 0,
  battery REAL DEFAULT 12.0,
  
  -- Performance metrics
  engine_load REAL DEFAULT 0,
  throttle_pos REAL DEFAULT 0,
  fuel_level REAL DEFAULT 50,
  
  -- Status
  status TEXT DEFAULT 'NORMAL',
  
  -- System info
  map_kpa REAL,
  intake_air_temp REAL,
  timing_advance REAL,
  fuel_trim_short REAL,
  fuel_trim_long REAL,
  
  -- Auto-update timestamp
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sensor_data_realtime_vehicle_id ON sensor_data_realtime(vehicle_id);
CREATE INDEX idx_sensor_data_realtime_updated_at ON sensor_data_realtime(updated_at DESC);

-- Row Level Security
ALTER TABLE sensor_data_realtime ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view real-time data for their vehicles
CREATE POLICY "Users can view their vehicle real-time data"
  ON sensor_data_realtime FOR SELECT
  USING (
    vehicle_id IN (
      SELECT id FROM vehicle_profiles WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can upsert real-time data for their vehicles
CREATE POLICY "Users can upsert their vehicle real-time data"
  ON sensor_data_realtime FOR INSERT
  WITH CHECK (
    vehicle_id IN (
      SELECT id FROM vehicle_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their vehicle real-time data"
  ON sensor_data_realtime FOR UPDATE
  USING (
    vehicle_id IN (
      SELECT id FROM vehicle_profiles WHERE user_id = auth.uid()
    )
  );


-- ================================================================
-- 4. HELPER FUNCTIONS
-- ================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for vehicle_profiles
CREATE TRIGGER update_vehicle_profiles_updated_at
  BEFORE UPDATE ON vehicle_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for sensor_data_realtime
CREATE TRIGGER update_sensor_data_realtime_updated_at
  BEFORE UPDATE ON sensor_data_realtime
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ================================================================
-- 5. VIEWS FOR COMMON QUERIES
-- ================================================================

-- Latest sensor reading per vehicle with vehicle info
CREATE OR REPLACE VIEW vehicle_latest_data AS
SELECT 
  vp.id as vehicle_id,
  vp.car_display_name,
  vp.make,
  vp.model,
  vp.year,
  vp.user_id,
  sdr.timestamp,
  sdr.rpm,
  sdr.speed,
  sdr.coolant_temp,
  sdr.battery,
  sdr.engine_load,
  sdr.throttle_pos,
  sdr.fuel_level,
  sdr.status,
  sdr.updated_at
FROM vehicle_profiles vp
LEFT JOIN sensor_data_realtime sdr ON vp.id = sdr.vehicle_id
WHERE vp.is_active = true;


-- Vehicle statistics summary
CREATE OR REPLACE VIEW vehicle_statistics AS
SELECT 
  vp.id as vehicle_id,
  vp.car_display_name,
  vp.user_id,
  COUNT(sd.id) as total_readings,
  MAX(sd.timestamp) as last_reading,
  MIN(sd.timestamp) as first_reading,
  AVG(sd.rpm) as avg_rpm,
  MAX(sd.rpm) as max_rpm,
  AVG(sd.coolant_temp) as avg_temp,
  MAX(sd.coolant_temp) as max_temp,
  AVG(sd.fuel_efficiency) as avg_fuel_efficiency,
  COUNT(DISTINCT sd.session_id) as total_sessions
FROM vehicle_profiles vp
LEFT JOIN sensor_data sd ON vp.id = sd.vehicle_id
GROUP BY vp.id, vp.car_display_name, vp.user_id;


-- ================================================================
-- 6. REALTIME PUBLICATION (for Supabase Realtime subscriptions)
-- ================================================================

-- Enable realtime for sensor_data_realtime table
ALTER PUBLICATION supabase_realtime ADD TABLE sensor_data_realtime;


-- ================================================================
-- SETUP COMPLETE! 
-- ================================================================
-- Next steps:
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. Verify tables are created
-- 3. Test RLS policies
-- 4. Run the sync script to populate from local SQLite
-- ================================================================
