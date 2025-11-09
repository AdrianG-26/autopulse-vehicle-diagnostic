-- Add ML prediction columns to sensor_data table
-- Run this in your Supabase SQL Editor

-- Check if columns already exist before adding
DO $$ 
BEGIN
    -- Add ml_health_score (0-100 score)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sensor_data' AND column_name = 'ml_health_score'
    ) THEN
        ALTER TABLE sensor_data ADD COLUMN ml_health_score REAL;
        RAISE NOTICE 'Added ml_health_score column';
    ELSE
        RAISE NOTICE 'ml_health_score column already exists';
    END IF;

    -- Add ml_status (NORMAL, ADVISORY, WARNING, CRITICAL)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sensor_data' AND column_name = 'ml_status'
    ) THEN
        ALTER TABLE sensor_data ADD COLUMN ml_status TEXT;
        RAISE NOTICE 'Added ml_status column';
    ELSE
        RAISE NOTICE 'ml_status column already exists';
    END IF;

    -- Add ml_alerts (array of alert messages)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sensor_data' AND column_name = 'ml_alerts'
    ) THEN
        ALTER TABLE sensor_data ADD COLUMN ml_alerts JSONB;
        RAISE NOTICE 'Added ml_alerts column';
    ELSE
        RAISE NOTICE 'ml_alerts column already exists';
    END IF;

    -- Add ml_confidence (0-1 confidence score)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sensor_data' AND column_name = 'ml_confidence'
    ) THEN
        ALTER TABLE sensor_data ADD COLUMN ml_confidence REAL;
        RAISE NOTICE 'Added ml_confidence column';
    ELSE
        RAISE NOTICE 'ml_confidence column already exists';
    END IF;
END $$;

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'sensor_data' 
  AND column_name IN ('ml_health_score', 'ml_status', 'ml_alerts', 'ml_confidence')
ORDER BY column_name;
