# Supabase vs Website Field Audit Report
## Date: November 13, 2025

### ✅ FIELDS CORRECTLY DISPLAYED IN WEBSITE

**Engine Performance:**
- rpm ✅
- engine_load ✅  
- coolant_temp ✅
- intake_temp ✅
- throttle_pos ✅
- absolute_load ✅

**Fuel System:**
- fuel_level ✅
- fuel_pressure ✅
- fuel_trim_short ✅
- fuel_trim_long ✅

**Air Flow & Pressure:**
- maf ✅
- map ✅
- barometric_pressure ✅
- o2_sensor_1 ✅

**Ignition & Timing:**
- timing_advance ✅
- run_time (as engineRuntime) ✅

**Vehicle Status:**
- vehicle_speed ✅
- dtc_count ✅
- control_module_voltage ✅
- data_quality_score ✅

**Computed Metrics:**
- load_rpm_ratio ✅
- temp_gradient ✅
- engine_stress_score ✅
- health_score_display ✅

**ML Predictions:**
- ml_health_score ✅
- ml_status ✅
- ml_confidence ✅
- ml_alerts ✅
- prob_normal ✅
- prob_advisory ✅
- prob_warning ✅
- prob_critical ✅
- days_until_maintenance ✅
- predicted_failure_risk ✅

### ❌ FIELDS IN SUPABASE BUT NOT DISPLAYED

1. **o2_b1s2** - Second O2 Sensor (Bank 1, Sensor 2)
   - Currently collected: YES
   - Value range seen: 0.055-0.155V
   - Should add: YES - useful for diagnostics

2. **catalyst_temp_b1s1** - Catalyst Temperature (Bank 1, Sensor 1)
   - Currently collected: YES
   - Should add: YES - important for emissions

3. **mil_status** - Malfunction Indicator Lamp Status
   - Currently collected: YES
   - Should add: YES - critical alert indicator

4. **distance_w_mil** - Distance driven with MIL on
   - Currently collected: YES
   - Should add: YES - helps track how long issues persist

5. **long_fuel_trim_2** - Long Fuel Trim Bank 2
   - Currently collected: YES
   - Should add: MAYBE - if vehicle has Bank 2

6. **short_fuel_trim_2** - Short Fuel Trim Bank 2
   - Currently collected: YES
   - Should add: MAYBE - if vehicle has Bank 2

7. **fuel_status** - Fuel System Status
   - Currently collected: YES
   - Should add: YES - shows open/closed loop status

8. **health_status** - Raw health status from DB
   - Currently collected: YES
   - Already have ml_status: REDUNDANT

9. **session_id** - Collection session ID
   - Currently collected: YES
   - Should add: NO - internal tracking only

10. **timestamp** - Record timestamp
    - Currently collected: YES
    - Should add: NO - not needed in UI

### 📊 SUMMARY

- **Total fields in Supabase:** ~40 fields
- **Fields displayed:** ~30 fields
- **Missing important fields:** 6 fields
  - o2_b1s2
  - catalyst_temp_b1s1
  - mil_status
  - distance_w_mil
  - fuel_status
  - long/short_fuel_trim_2

### 🎯 RECOMMENDATION

Add the 6 missing important fields to the Dashboard in appropriate sections:
- Add o2_b1s2 to "Air Flow & Pressure" section
- Add catalyst_temp_b1s1 to "Engine Performance" section
- Add mil_status to "Vehicle Status" section  
- Add distance_w_mil to "Vehicle Status" section
- Add fuel_status to "Fuel System" section
- Add long/short_fuel_trim_2 to "Fuel System" section (conditional if Bank 2 exists)
