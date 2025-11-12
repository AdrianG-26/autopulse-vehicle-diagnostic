-- ================================================================
-- Create ML Predictions Tables for AutoPulse
-- Run this in Supabase SQL Editor
-- ================================================================

-- Drop existing tables if they exist (CAREFUL - this deletes data!)
DROP TABLE IF EXISTS ml_predictions CASCADE;
DROP TABLE IF EXISTS ml_predictions_realtime CASCADE;
DROP TABLE IF EXISTS ml_health_trends CASCADE;

-- ================================================================
-- 1. ml_predictions - Historical ML predictions
-- ================================================================
CREATE TABLE ml_predictions (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicle_profiles(id) ON DELETE CASCADE,
    sensor_data_id BIGINT REFERENCES sensor_data(id) ON DELETE SET NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Prediction Results
    predicted_health_status INTEGER NOT NULL CHECK (predicted_health_status >= 0 AND predicted_health_status <= 3),
    predicted_status TEXT NOT NULL CHECK (predicted_status IN ('NORMAL', 'ADVISORY', 'WARNING', 'CRITICAL')),
    confidence_score REAL NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
    
    -- Probability Distribution (must add up to ~1.0)
    prob_normal REAL NOT NULL CHECK (prob_normal >= 0 AND prob_normal <= 1),
    prob_advisory REAL NOT NULL CHECK (prob_advisory >= 0 AND prob_advisory <= 1),
    prob_warning REAL NOT NULL CHECK (prob_warning >= 0 AND prob_warning <= 1),
    prob_critical REAL NOT NULL CHECK (prob_critical >= 0 AND prob_critical <= 1),
    
    -- Risk Assessment
    predicted_failure_risk TEXT CHECK (predicted_failure_risk IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    days_until_maintenance INTEGER,
    
    -- Recommended Actions
    recommended_actions JSONB DEFAULT '[]'::jsonb,
    
    -- Top Risk Factors
    top_risk_factor_1 TEXT,
    top_risk_factor_2 TEXT,
    top_risk_factor_3 TEXT,
    
    -- Model Metadata
    model_version TEXT DEFAULT '4class_v1',
    model_accuracy REAL,
    prediction_latency_ms REAL,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX idx_ml_predictions_vehicle_id ON ml_predictions(vehicle_id);
CREATE INDEX idx_ml_predictions_timestamp ON ml_predictions(timestamp DESC);
CREATE INDEX idx_ml_predictions_vehicle_timestamp ON ml_predictions(vehicle_id, timestamp DESC);
CREATE INDEX idx_ml_predictions_predicted_status ON ml_predictions(predicted_status);

-- ================================================================
-- 2. ml_predictions_realtime - Latest prediction per vehicle
-- ================================================================
CREATE TABLE ml_predictions_realtime (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id INTEGER UNIQUE REFERENCES vehicle_profiles(id) ON DELETE CASCADE,
    latest_prediction_id BIGINT REFERENCES ml_predictions(id) ON DELETE SET NULL,
    
    -- Prediction Results (denormalized for speed)
    predicted_status TEXT NOT NULL CHECK (predicted_status IN ('NORMAL', 'ADVISORY', 'WARNING', 'CRITICAL')),
    confidence_score REAL NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
    
    -- Probability Distribution
    prob_normal REAL NOT NULL CHECK (prob_normal >= 0 AND prob_normal <= 1),
    prob_advisory REAL NOT NULL CHECK (prob_advisory >= 0 AND prob_advisory <= 1),
    prob_warning REAL NOT NULL CHECK (prob_warning >= 0 AND prob_warning <= 1),
    prob_critical REAL NOT NULL CHECK (prob_critical >= 0 AND prob_critical <= 1),
    
    -- Risk Assessment
    predicted_failure_risk TEXT CHECK (predicted_failure_risk IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    days_until_maintenance INTEGER,
    
    -- Recommended Actions
    recommended_actions JSONB DEFAULT '[]'::jsonb,
    
    -- Top Risk Factors
    top_risk_factor_1 TEXT,
    top_risk_factor_2 TEXT,
    top_risk_factor_3 TEXT,
    
    -- Model Metadata
    model_version TEXT DEFAULT '4class_v1',
    
    -- Timestamps
    timestamp TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX idx_ml_predictions_realtime_vehicle ON ml_predictions_realtime(vehicle_id);

-- ================================================================
-- 3. ml_health_trends - Health trend analysis
-- ================================================================
CREATE TABLE ml_health_trends (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicle_profiles(id) ON DELETE CASCADE,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    
    -- Prediction Counts
    total_predictions INTEGER NOT NULL DEFAULT 0,
    normal_count INTEGER NOT NULL DEFAULT 0,
    advisory_count INTEGER NOT NULL DEFAULT 0,
    warning_count INTEGER NOT NULL DEFAULT 0,
    critical_count INTEGER NOT NULL DEFAULT 0,
    
    -- Average Confidence
    avg_confidence REAL,
    
    -- Health Trend Direction
    trend_direction TEXT CHECK (trend_direction IN ('IMPROVING', 'STABLE', 'DECLINING', 'CRITICAL')),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique period per vehicle
    UNIQUE(vehicle_id, period_start, period_end)
);

-- Indexes
CREATE INDEX idx_ml_health_trends_vehicle ON ml_health_trends(vehicle_id);
CREATE INDEX idx_ml_health_trends_period ON ml_health_trends(period_start, period_end);

-- ================================================================
-- Enable Row Level Security (RLS) - Optional
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE ml_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_predictions_realtime ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_health_trends ENABLE ROW LEVEL SECURITY;

-- Allow public read access (adjust based on your security needs)
CREATE POLICY "Allow public read on ml_predictions"
    ON ml_predictions FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert on ml_predictions"
    ON ml_predictions FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public read on ml_predictions_realtime"
    ON ml_predictions_realtime FOR SELECT
    USING (true);

CREATE POLICY "Allow public all on ml_predictions_realtime"
    ON ml_predictions_realtime FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow public read on ml_health_trends"
    ON ml_health_trends FOR SELECT
    USING (true);

-- ================================================================
-- Verification Queries
-- ================================================================

-- Check table structures
SELECT 
    table_name, 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('ml_predictions', 'ml_predictions_realtime', 'ml_health_trends')
ORDER BY table_name, ordinal_position;

-- Verify constraints
SELECT 
    con.conname AS constraint_name,
    rel.relname AS table_name,
    att.attname AS column_name,
    con.contype AS constraint_type
FROM pg_constraint con
JOIN pg_class rel ON con.conrelid = rel.oid
JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = ANY(con.conkey)
WHERE rel.relname IN ('ml_predictions', 'ml_predictions_realtime', 'ml_health_trends')
ORDER BY rel.relname, con.conname;

-- ================================================================
-- Success Message
-- ================================================================

DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ ML Prediction tables created successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Tables created:';
    RAISE NOTICE '  • ml_predictions (historical predictions)';
    RAISE NOTICE '  • ml_predictions_realtime (latest prediction per vehicle)';
    RAISE NOTICE '  • ml_health_trends (trend analysis)';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Next steps:';
    RAISE NOTICE '  1. Restart autopulse-collector service: sudo systemctl restart autopulse-collector';
    RAISE NOTICE '  2. Check logs: journalctl -u autopulse-collector -f';
    RAISE NOTICE '  3. Verify data: SELECT * FROM ml_predictions_realtime;';
    RAISE NOTICE '';
END $$;
