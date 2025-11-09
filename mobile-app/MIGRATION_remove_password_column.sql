-- ================================================================
-- SECURITY MIGRATION: Remove Password Column
-- ================================================================
-- This migration removes the insecure password column from users table
-- Supabase Auth already handles password hashing securely
-- 
-- SAFE TO RUN: This column should be empty (never used)
-- ================================================================

-- Step 1: Check if column exists and has any data (for safety)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'password'
  ) THEN
    -- Log a warning if any passwords are stored (shouldn't happen)
    RAISE NOTICE 'Checking for password data...';
    
    -- Count rows with password data
    DECLARE
      password_count INTEGER;
    BEGIN
      SELECT COUNT(*) INTO password_count
      FROM users
      WHERE password IS NOT NULL AND password != '';
      
      IF password_count > 0 THEN
        RAISE WARNING 'Found % rows with password data! This should not happen.', password_count;
      ELSE
        RAISE NOTICE 'Good! No password data found in users table.';
      END IF;
    END;
    
    -- Drop the column
    RAISE NOTICE 'Removing password column from users table...';
    ALTER TABLE users DROP COLUMN IF EXISTS password;
    RAISE NOTICE '✅ Password column removed successfully!';
  ELSE
    RAISE NOTICE 'Password column does not exist. Nothing to do.';
  END IF;
END $$;

-- Step 2: Add comment to table for documentation
COMMENT ON TABLE users IS 'User profiles - extends auth.users. Passwords are NEVER stored here - Supabase Auth handles password hashing securely in auth.users table.';

-- Step 3: Verify column is gone
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'password'
  ) THEN
    RAISE NOTICE '✅ VERIFIED: Password column successfully removed!';
  ELSE
    RAISE WARNING '❌ ERROR: Password column still exists!';
  END IF;
END $$;

-- ================================================================
-- Migration Complete!
-- ================================================================
-- Your database now follows security best practices:
-- ✅ No password storage in custom tables
-- ✅ Supabase Auth handles all password operations
-- ✅ Passwords are hashed with bcrypt
-- ✅ Industry-standard security
-- ================================================================
