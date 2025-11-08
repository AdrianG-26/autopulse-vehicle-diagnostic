-- ================================================================
-- SUPABASE SCHEMA EXPANSION FOR ML TRAINING
-- ================================================================
-- Adds 15 new OBD parameters + health_status for Random Forest model
-- Date: November 8, 2025
-- ================================================================

-- Add new OBD parameter columns to sensor_data table
ALTER TABLE sensor_data

-- Core Engine (3 new)
ADD COLUMN IF NOT EXISTS timing_advance REAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS run_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS absolute_load REAL DEFAULT 0,

-- Fuel System (4 new)
ADD COLUMN IF NOT EXISTS fuel_pressure REAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS short_fuel_trim_2 REAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS long_fuel_trim_2 REAL DEFAULT 0,

-- Emissions (2 new)
ADD COLUMN IF NOT EXISTS o2_b1s2 REAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS catalyst_temp_b1s1 REAL DEFAULT 0,

-- Electrical (1 new)
ADD COLUMN IF NOT EXISTS control_module_voltage REAL DEFAULT 0,

-- Diagnostic (3 new)
ADD COLUMN IF NOT EXISTS distance_w_mil REAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS dtc_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS mil_status BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fuel_status TEXT DEFAULT 'Unknown',

-- ML Training Label (CRITICAL for Random Forest)
ADD COLUMN IF NOT EXISTS health_status INTEGER DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN sensor_data.timing_advance IS 'Ignition timing advance (degrees before TDC)';
COMMENT ON COLUMN sensor_data.run_time IS 'Engine run time since start (seconds)';
COMMENT ON COLUMN sensor_data.absolute_load IS 'Absolute engine load value (%)';
COMMENT ON COLUMN sensor_data.fuel_pressure IS 'Fuel rail pressure (kPa)';
COMMENT ON COLUMN sensor_data.short_fuel_trim_2 IS 'Short term fuel trim Bank 2 (%)';
COMMENT ON COLUMN sensor_data.long_fuel_trim_2 IS 'Long term fuel trim Bank 2 (%)';
COMMENT ON COLUMN sensor_data.o2_b1s2 IS 'Oxygen sensor Bank 1 Sensor 2 (volts)';
COMMENT ON COLUMN sensor_data.catalyst_temp_b1s1 IS 'Catalytic converter temperature Bank 1 Sensor 1 (°C)';
COMMENT ON COLUMN sensor_data.control_module_voltage IS 'ECU/Battery voltage (volts)';
COMMENT ON COLUMN sensor_data.distance_w_mil IS 'Distance driven with MIL/Check Engine Light on (km)';
COMMENT ON COLUMN sensor_data.dtc_count IS 'Number of Diagnostic Trouble Codes active';
COMMENT ON COLUMN sensor_data.mil_status IS 'Malfunction Indicator Lamp (Check Engine Light) status';
COMMENT ON COLUMN sensor_data.fuel_status IS 'Fuel system status (Open/Closed Loop)';
COMMENT ON COLUMN sensor_data.health_status IS 'Auto-labeled vehicle health: 0=NORMAL, 1=ADVISORY, 2=WARNING, 3=CRITICAL';

-- Create index on health_status for faster ML query filtering
CREATE INDEX IF NOT EXISTS idx_health_status ON sensor_data(health_status);
CREATE INDEX IF NOT EXISTS idx_dtc_count ON sensor_data(dtc_count);
CREATE INDEX IF NOT EXISTS idx_mil_status ON sensor_data(mil_status);

-- Update sensor_data_realtime table (for dashboard)
ALTER TABLE sensor_data_realtime

-- Core Engine
ADD COLUMN IF NOT EXISTS timing_advance REAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS run_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS absolute_load REAL DEFAULT 0,

-- Fuel System
ADD COLUMN IF NOT EXISTS fuel_pressure REAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS short_fuel_trim_2 REAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS long_fuel_trim_2 REAL DEFAULT 0,

-- Emissions
ADD COLUMN IF NOT EXISTS o2_b1s2 REAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS catalyst_temp_b1s1 REAL DEFAULT 0,

-- Electrical
ADD COLUMN IF NOT EXISTS control_module_voltage REAL DEFAULT 0,

-- Diagnostic
ADD COLUMN IF NOT EXISTS distance_w_mil REAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS dtc_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS mil_status BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fuel_status TEXT DEFAULT 'Unknown',

-- Health Status
ADD COLUMN IF NOT EXISTS health_status INTEGER DEFAULT 0;

-- ================================================================
-- SUMMARY OF CHANGES
-- ================================================================
-- BEFORE: 15 OBD parameters
-- AFTER:  30 OBD parameters
--
-- NEW PARAMETERS (15):
--   1. timing_advance
--   2. run_time
--   3. absolute_load
--   4. fuel_pressure
--   5. short_fuel_trim_2
--   6. long_fuel_trim_2
--   7. o2_b1s2
--   8. catalyst_temp_b1s1
--   9. control_module_voltage
--  10. distance_w_mil
--  11. dtc_count
--  12. mil_status
--  13. fuel_status
--  14. health_status (ML label)
--
-- READY FOR: Random Forest model training with 30 features
-- ================================================================
