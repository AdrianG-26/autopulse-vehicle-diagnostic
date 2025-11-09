-- AutoPulse Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    password TEXT, -- Note: Supabase handles password hashing
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'technician'))
);

-- Vehicles table
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

-- Telemetry data table (main data source)
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
    fuel_pressure_psi DECIMAL(6,2),
    stft_b1_pct DECIMAL(5,2),
    ltft_b1_pct DECIMAL(5,2),
    fuel_level_pct DECIMAL(5,2),
    fuel_type TEXT,
    
    -- System status
    system_status TEXT,
    fault_codes TEXT,
    source TEXT,
    raw_data JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('warning', 'error', 'info', 'critical')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Fault codes table
CREATE TABLE IF NOT EXISTS fault_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    description TEXT,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_telemetry_data_vehicle_timestamp ON telemetry_data(vehicle_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_data_timestamp ON telemetry_data(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_vehicle_timestamp ON alerts(vehicle_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_fault_codes_vehicle_active ON fault_codes(vehicle_id, is_active);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient, created_at DESC);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fault_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Vehicles policies
CREATE POLICY "Users can view own vehicles" ON vehicles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vehicles" ON vehicles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vehicles" ON vehicles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vehicles" ON vehicles FOR DELETE USING (auth.uid() = user_id);

-- Telemetry data policies
CREATE POLICY "Users can view telemetry for own vehicles" ON telemetry_data FOR SELECT USING (
    vehicle_id IN (SELECT id FROM vehicles WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert telemetry for own vehicles" ON telemetry_data FOR INSERT WITH CHECK (
    vehicle_id IN (SELECT id FROM vehicles WHERE user_id = auth.uid())
);

-- Alerts policies
CREATE POLICY "Users can view alerts for own vehicles" ON alerts FOR SELECT USING (
    vehicle_id IN (SELECT id FROM vehicles WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert alerts for own vehicles" ON alerts FOR INSERT WITH CHECK (
    vehicle_id IN (SELECT id FROM vehicles WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update alerts for own vehicles" ON alerts FOR UPDATE USING (
    vehicle_id IN (SELECT id FROM vehicles WHERE user_id = auth.uid())
);

-- Fault codes policies
CREATE POLICY "Users can view fault codes for own vehicles" ON fault_codes FOR SELECT USING (
    vehicle_id IN (SELECT id FROM vehicles WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert fault codes for own vehicles" ON fault_codes FOR INSERT WITH CHECK (
    vehicle_id IN (SELECT id FROM vehicles WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update fault codes for own vehicles" ON fault_codes FOR UPDATE USING (
    vehicle_id IN (SELECT id FROM vehicles WHERE user_id = auth.uid())
);

-- Messages policies
CREATE POLICY "Users can view messages sent to them" ON messages FOR SELECT USING (auth.uid() = recipient);
CREATE POLICY "Users can view messages they sent" ON messages FOR SELECT USING (auth.uid() = sender);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile when auth user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data insertion (optional - remove in production)
-- Insert a sample user (replace with actual user ID from auth.users)
-- INSERT INTO users (id, email, username, role) VALUES 
-- ('00000000-0000-0000-0000-000000000000', 'test@example.com', 'testuser', 'user');

-- Insert a sample vehicle
-- INSERT INTO vehicles (user_id, name, make, model, year, vin) VALUES 
-- ('00000000-0000-0000-0000-000000000000', 'My Car', 'Toyota', 'Camry', 2020, '1HGBH41JXMN109186');

-- Insert sample telemetry data
-- INSERT INTO telemetry_data (vehicle_id, rpm, speed, coolant_temp, battery, map_kpa, engine_load_pct, intake_air_temp, throttle_position, ignition_advance, fuel_system_status, fuel_pressure_kpa, fuel_pressure_psi, stft_b1_pct, ltft_b1_pct, fuel_level_pct, fuel_type, system_status) VALUES 
-- ('00000000-0000-0000-0000-000000000001', 2500, 65, 88.5, 12.4, 35.2, 45.8, 25.3, 15.2, 12.5, 'CLOSED_LOOP', 350.5, 50.8, 2.1, -1.2, 75.0, 'GASOLINE', 'NORMAL');
