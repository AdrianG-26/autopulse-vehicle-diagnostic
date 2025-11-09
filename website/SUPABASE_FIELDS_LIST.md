# Complete List of Supabase sensor_data Fields

## All Available Fields in sensor_data Table

### **Core Engine Metrics**
1. `rpm` - Engine RPM
2. `coolant_temp` - Coolant temperature (°C)
3. `engine_load` - Engine load (%)
4. `vehicle_speed` - Vehicle speed (km/h)

### **Throttle & Intake**
5. `throttle_pos` - Throttle position (%)
6. `intake_temp` - Intake air temperature (°C)

### **Fuel System**
7. `fuel_level` - Fuel level (%)
8. `fuel_trim_short` - Short term fuel trim (%)
9. `fuel_trim_long` - Long term fuel trim (%)
10. `fuel_pressure` - Fuel pressure (kPa)
11. `fuel_system_status` - Fuel system status ⚠️ (HAS NULL VALUES)

### **Air Flow & Pressure**
12. `maf` - Mass Air Flow (g/s)
13. `map` - Manifold Absolute Pressure (kPa)
14. `barometric_pressure` - Barometric pressure (kPa)

### **Ignition & Timing**
15. `timing_advance` - Timing advance (degrees)

### **Oxygen Sensors**
16. `o2_sensor_1` - O2 sensor 1 voltage
17. `o2_sensor_2` - O2 sensor 2 voltage ⚠️ (HAS NULL VALUES)

### **Temperatures**
18. `catalyst_temp` - Catalyst temperature (°C) ⚠️ (HAS NULL VALUES)

### **System Metrics**
19. `control_module_voltage` - ECU voltage (V)
20. `engine_runtime` - Engine runtime (seconds)

### **Diagnostics**
21. `dtc_count` - Diagnostic Trouble Code count
22. `status` - Overall status (NORMAL, WARNING, etc.)
23. `fault_type` - Fault classification ⚠️ (HAS NULL VALUES)

### **Computed Metrics (from RPI)**
24. `load_rpm_ratio` - Load/RPM ratio
25. `temp_gradient` - Temperature gradient
26. `fuel_efficiency` - Computed fuel efficiency ⚠️ (HAS NULL VALUES)
27. `throttle_response` - Throttle response metric
28. `engine_stress_score` - Engine stress score
29. `egr_error` - EGR error percentage
30. `data_quality_score` - Data quality (0-100)

### **ML Predictions (if added)**
31. `ml_health_score` - ML predicted health score (0-100)
32. `ml_status` - ML predicted status (NORMAL, ADVISORY, WARNING, CRITICAL)
33. `ml_alerts` - ML predicted alerts array
34. `ml_confidence` - ML prediction confidence (0-1)

### **Metadata**
35. `id` - Primary key
36. `vehicle_id` - Vehicle reference
37. `session_id` - Data collection session ID
38. `timestamp` - Timestamp
39. `created_at` - Creation timestamp

---

## Fields to EXCLUDE (Have Null Values)

Based on your list:
- ✅ `fuel_system_status` - EXCLUDE
- ✅ `o2_sensor_2` - EXCLUDE
- ✅ `catalyst_temp` - EXCLUDE
- ✅ `fault_type` - EXCLUDE
- ✅ `fuel_efficiency` - EXCLUDE
- ❓ `fuel_status` - Not found in schema (maybe you meant `fuel_system_status`?)

---

## Current Usage in Website

### **Currently Displayed:**
- Dashboard: rpm, vehicleSpeed, coolantTemp, engineLoad, fuelLevel, throttlePos
- Engine Page: rpm, coolantTemp, engineLoad, throttlePos, intakeTemp, timingAdvance, engineRuntime
- Fuel Page: fuelLevel, fuelTrimShort, fuelTrimLong, fuelPressure, maf
- Emissions Page: o2Sensor1, o2Sensor2, catalystTemp, maf, barometricPressure

### **Not Currently Displayed:**
- map, controlModuleVoltage, dtcCount, loadRpmRatio, tempGradient, throttleResponse, engineStressScore, egrError, dataQualityScore

