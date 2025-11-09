-- Check RPM data in Supabase
-- Run this in your Supabase SQL Editor to see recent RPM values

-- 1. Check latest 10 records with RPM values
SELECT 
    id,
    timestamp,
    rpm,
    vehicle_speed,
    coolant_temp,
    engine_load,
    CASE 
        WHEN rpm IS NULL THEN 'NULL'
        WHEN rpm = 0 THEN 'ZERO'
        ELSE 'HAS_VALUE'
    END as rpm_status
FROM sensor_data
ORDER BY timestamp DESC
LIMIT 10;

-- 2. Count records with RPM = 0 vs RPM > 0
SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN rpm IS NULL THEN 1 END) as rpm_null,
    COUNT(CASE WHEN rpm = 0 THEN 1 END) as rpm_zero,
    COUNT(CASE WHEN rpm > 0 THEN 1 END) as rpm_has_value,
    AVG(CASE WHEN rpm > 0 THEN rpm END) as avg_rpm,
    MAX(CASE WHEN rpm > 0 THEN rpm END) as max_rpm
FROM sensor_data
WHERE timestamp > NOW() - INTERVAL '1 hour';

-- 3. Check if RPM was working before (last 24 hours)
SELECT 
    DATE_TRUNC('hour', timestamp) as hour,
    COUNT(*) as records,
    COUNT(CASE WHEN rpm > 0 THEN 1 END) as records_with_rpm,
    AVG(CASE WHEN rpm > 0 THEN rpm END) as avg_rpm,
    MAX(rpm) as max_rpm
FROM sensor_data
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', timestamp)
ORDER BY hour DESC;

