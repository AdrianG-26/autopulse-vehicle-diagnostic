-- Check what ML data exists in your sensor_data table
-- Run this in Supabase SQL Editor to see what's actually stored

-- 1. Check if ml_health_score column exists and has data
SELECT 
  COUNT(*) as total_rows,
  COUNT(ml_health_score) as rows_with_ml_health_score,
  COUNT(health_status) as rows_with_health_status,
  COUNT(ml_status) as rows_with_ml_status
FROM sensor_data
ORDER BY timestamp DESC
LIMIT 100;

-- 2. Get the latest row with all ML-related fields
SELECT 
  timestamp,
  health_status,
  ml_health_score,
  ml_status,
  ml_alerts,
  ml_confidence,
  vehicle_speed,
  coolant_temp,
  engine_load
FROM sensor_data
ORDER BY timestamp DESC
LIMIT 1;

-- 3. Check what values health_status has
SELECT 
  health_status,
  COUNT(*) as count,
  CASE 
    WHEN health_status = 0 THEN 'NORMAL (fallback → 90)'
    WHEN health_status = 1 THEN 'ADVISORY (fallback → 70)'
    WHEN health_status = 2 THEN 'WARNING (fallback → 50)'
    WHEN health_status = 3 THEN 'CRITICAL (fallback → 30)'
    ELSE 'UNKNOWN'
  END as meaning
FROM sensor_data
WHERE health_status IS NOT NULL
GROUP BY health_status
ORDER BY health_status;

