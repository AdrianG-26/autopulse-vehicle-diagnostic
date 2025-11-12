-- ======================================================
-- ML Integration Database Migration
-- Add ML prediction columns to sensor_data tables
-- ======================================================

-- Add ML columns to sensor_data table
DO $$ 
BEGIN
    -- ml_health_score (0-100)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sensor_data' AND column_name = 'ml_health_score'
    ) THEN
        ALTER TABLE sensor_data ADD COLUMN ml_health_score REAL;
        RAISE NOTICE '✅ Added ml_health_score to sensor_data';
    ELSE
        RAISE NOTICE '⚠️  ml_health_score already exists in sensor_data';
    END IF;

    -- ml_status (NORMAL, ADVISORY, WARNING, CRITICAL)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sensor_data' AND column_name = 'ml_status'
    ) THEN
        ALTER TABLE sensor_data ADD COLUMN ml_status TEXT;
        RAISE NOTICE '✅ Added ml_status to sensor_data';
    ELSE
        RAISE NOTICE '⚠️  ml_status already exists in sensor_data';
    END IF;

    -- ml_alerts (recommended actions)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sensor_data' AND column_name = 'ml_alerts'
    ) THEN
        ALTER TABLE sensor_data ADD COLUMN ml_alerts JSONB;
        RAISE NOTICE '✅ Added ml_alerts to sensor_data';
    ELSE
        RAISE NOTICE '⚠️  ml_alerts already exists in sensor_data';
    END IF;

    -- ml_confidence (0.0-1.0)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sensor_data' AND column_name = 'ml_confidence'
    ) THEN
        ALTER TABLE sensor_data ADD COLUMN ml_confidence REAL;
        RAISE NOTICE '✅ Added ml_confidence to sensor_data';
    ELSE
        RAISE NOTICE '⚠️  ml_confidence already exists in sensor_data';
    END IF;
END $$;

-- Add ML columns to sensor_data_realtime table
DO $$ 
BEGIN
    -- ml_health_score (0-100)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sensor_data_realtime' AND column_name = 'ml_health_score'
    ) THEN
        ALTER TABLE sensor_data_realtime ADD COLUMN ml_health_score REAL;
        RAISE NOTICE '✅ Added ml_health_score to sensor_data_realtime';
    ELSE
        RAISE NOTICE '⚠️  ml_health_score already exists in sensor_data_realtime';
    END IF;

    -- ml_status (NORMAL, ADVISORY, WARNING, CRITICAL)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sensor_data_realtime' AND column_name = 'ml_status'
    ) THEN
        ALTER TABLE sensor_data_realtime ADD COLUMN ml_status TEXT;
        RAISE NOTICE '✅ Added ml_status to sensor_data_realtime';
    ELSE
        RAISE NOTICE '⚠️  ml_status already exists in sensor_data_realtime';
    END IF;

    -- ml_alerts (recommended actions)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sensor_data_realtime' AND column_name = 'ml_alerts'
    ) THEN
        ALTER TABLE sensor_data_realtime ADD COLUMN ml_alerts JSONB;
        RAISE NOTICE '✅ Added ml_alerts to sensor_data_realtime';
    ELSE
        RAISE NOTICE '⚠️  ml_alerts already exists in sensor_data_realtime';
    END IF;

    -- ml_confidence (0.0-1.0)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sensor_data_realtime' AND column_name = 'ml_confidence'
    ) THEN
        ALTER TABLE sensor_data_realtime ADD COLUMN ml_confidence REAL;
        RAISE NOTICE '✅ Added ml_confidence to sensor_data_realtime';
    ELSE
        RAISE NOTICE '⚠️  ml_confidence already exists in sensor_data_realtime';
    END IF;
END $$;

-- Verify the migration
SELECT 'Migration complete! Checking columns...' AS status;

SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name IN ('sensor_data', 'sensor_data_realtime')
    AND column_name LIKE 'ml_%'
ORDER BY table_name, column_name;
