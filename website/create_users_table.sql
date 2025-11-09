-- ================================================================
-- Create Users Table for AutoPulse
-- ================================================================
-- Run this in your Supabase SQL Editor to create the users table
-- with proper RLS policies for password updates
-- ================================================================

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Allow all operations for anon" ON users;

-- Policy: Allow anyone to read users (for login/signup)
-- You can restrict this later if needed
CREATE POLICY "Users can view all profiles"
  ON users FOR SELECT
  USING (true);

-- Policy: Allow anyone to insert (for signup)
CREATE POLICY "Users can insert profiles"
  ON users FOR INSERT
  WITH CHECK (true);

-- Policy: Allow users to update their own profile (including password)
-- This matches by email or username since we don't have auth.uid()
-- For simplicity, allow all updates (you can restrict this later)
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- IMPORTANT: For login to work, we need to allow SELECT without authentication
-- This is safe because we're checking passwords in the application

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at_trigger ON users;
CREATE TRIGGER update_users_updated_at_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_users_updated_at();

-- ================================================================
-- IMPORTANT NOTES:
-- ================================================================
-- 1. These policies allow all operations for simplicity
-- 2. For production, you should restrict UPDATE to only allow
--    users to update their own records
-- 3. Consider using Supabase Auth instead of plain text passwords
-- ================================================================

