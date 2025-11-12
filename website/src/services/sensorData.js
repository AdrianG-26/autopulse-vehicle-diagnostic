/**
 * Sensor Data Service
 * Fetches sensor data from Supabase sensor_data table using REST API
 * Uses Supabase Realtime for real-time updates (no polling)
 */

import { supabase } from "./supabase";

const DEFAULT_VEHICLE_ID = 1; // Default vehicle ID if not specified

class SensorDataService {
  constructor() {
    this.currentVehicleId = DEFAULT_VEHICLE_ID;
    this.subscriptions = new Map(); // Store Realtime channel subscriptions
  }

  /**
   * Get latest ML prediction for a vehicle
   * @param {number} vehicleId - Vehicle ID
   */
  async getLatestMLPrediction(vehicleId = DEFAULT_VEHICLE_ID) {
    if (!supabase) {
      return null;
    }

    try {
      console.log(`🤖 Fetching ML prediction for vehicle_id: ${vehicleId}`);

      // Try ml_predictions_realtime first (faster)
      let result = await supabase
        .from("ml_predictions_realtime")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .limit(1);

      if (result.data && result.data.length > 0) {
        console.log("✅ Found ML prediction in realtime table");
        return result.data[0];
      }

      // Fallback to ml_predictions table
      result = await supabase
        .from("ml_predictions")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .order("timestamp", { ascending: false })
        .limit(1);

      if (result.data && result.data.length > 0) {
        console.log("✅ Found ML prediction in main table");
        return result.data[0];
      }

      console.log("⚠️ No ML predictions found");
      return null;
    } catch (error) {
      console.error("Failed to fetch ML prediction:", error);
      return null;
    }
  }

  /**
   * Get latest sensor data for a vehicle (with ML predictions merged)
   * @param {number} vehicleId - Vehicle ID (defaults to 1)
   */
  async getLatestSensorData(vehicleId = DEFAULT_VEHICLE_ID) {
    if (!supabase) {
      console.warn("Supabase not configured");
      return null;
    }

    try {
      // Try multiple strategies to get data
      let data = null;
      let error = null;

      // Strategy 1: Try with vehicle_id filter
      console.log(`🔍 Fetching sensor data for vehicle_id: ${vehicleId}`);
      let query = supabase
        .from("sensor_data")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .order("timestamp", { ascending: false })
        .limit(1);

      let result = await query;
      data = result.data;
      error = result.error;

      console.log(`📊 Strategy 1 result:`, {
        hasData: !!data && data.length > 0,
        dataCount: data?.length || 0,
        error: error?.message,
        errorCode: error?.code,
      });

      // Strategy 2: If no data or RLS error, try without vehicle_id filter
      if (
        (!data || data.length === 0 || (error && error.code === "PGRST301")) &&
        vehicleId === DEFAULT_VEHICLE_ID
      ) {
        console.log("🔄 Trying fallback query without vehicle_id filter...");
        query = supabase
          .from("sensor_data")
          .select("*")
          .order("timestamp", { ascending: false })
          .limit(1);

        result = await query;
        data = result.data;
        error = result.error;

        console.log(`📊 Strategy 2 result:`, {
          hasData: !!data && data.length > 0,
          dataCount: data?.length || 0,
          error: error?.message,
          errorCode: error?.code,
          sampleData: data?.[0] ? Object.keys(data[0]) : null,
        });
      }

      // Strategy 3: If still no data, try sensor_data_realtime table
      if ((!data || data.length === 0) && vehicleId === DEFAULT_VEHICLE_ID) {
        console.log("Trying sensor_data_realtime table...");
        query = supabase
          .from("sensor_data_realtime")
          .select("*")
          .eq("vehicle_id", vehicleId)
          .limit(1);

        result = await query;
        if (result.data && result.data.length > 0) {
          // Convert realtime data to sensor_data format
          const realtimeData = result.data[0];
          data = [
            {
              ...realtimeData,
              vehicle_speed: realtimeData.speed,
              coolant_temp: realtimeData.coolant_temp,
              engine_load: realtimeData.engine_load,
              throttle_pos: realtimeData.throttle_pos,
              fuel_level: realtimeData.fuel_level,
            },
          ];
          error = null;
        }
      }

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows, which is acceptable
        console.error("Error fetching sensor data:", error);
        console.error("Error details:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        // Don't return null on RLS errors - log them but continue
        if (
          error.code === "PGRST301" ||
          error.message?.includes("permission") ||
          error.message?.includes("policy")
        ) {
          console.warn(
            "RLS policy may be blocking access. Check Supabase RLS policies or use service role key for development."
          );
        }
      }

      if (!data || data.length === 0) {
        console.log("No sensor data found in database");
        return null;
      }

      const rawData = data[0];

      // Fetch ML predictions separately and merge
      const mlPrediction = await this.getLatestMLPrediction(vehicleId);
      if (mlPrediction) {
        console.log("🤖 Merging ML prediction data:", {
          predicted_status: mlPrediction.predicted_status,
          confidence_score: mlPrediction.confidence_score,
          predicted_health_status: mlPrediction.predicted_health_status,
        });

        // Merge ML prediction fields into rawData
        rawData.ml_status = mlPrediction.predicted_status;
        rawData.ml_confidence = mlPrediction.confidence_score;
        rawData.ml_health_score = mlPrediction.predicted_health_status;
        rawData.ml_alerts = mlPrediction.recommended_actions;
        rawData.prob_normal = mlPrediction.prob_normal;
        rawData.prob_advisory = mlPrediction.prob_advisory;
        rawData.prob_warning = mlPrediction.prob_warning;
        rawData.prob_critical = mlPrediction.prob_critical;
        rawData.failure_risk = mlPrediction.predicted_failure_risk;
        rawData.days_until_maintenance = mlPrediction.days_until_maintenance;
      }

      console.log("📊 Raw sensor data from Supabase:", {
        hasMLHealthScore: !!rawData.ml_health_score,
        hasMLStatus: !!rawData.ml_status,
        hasMLAlerts: !!rawData.ml_alerts,
        hasMLConfidence: !!rawData.ml_confidence,
        hasHealthStatus:
          rawData.health_status !== null && rawData.health_status !== undefined,
        mlHealthScore: rawData.ml_health_score,
        mlStatus: rawData.ml_status,
        healthStatus: rawData.health_status,
        timestamp: rawData.timestamp,
        sampleFields: {
          rpm: rawData.rpm,
          rpmType: typeof rawData.rpm,
          rpmIsNull: rawData.rpm === null,
          rpmIsUndefined: rawData.rpm === undefined,
          vehicleSpeed: rawData.vehicle_speed,
          coolantTemp: rawData.coolant_temp,
          engineLoad: rawData.engine_load,
        },
        allKeys: Object.keys(rawData),
      });

      // Debug RPM specifically
      if (
        rawData.rpm === null ||
        rawData.rpm === undefined ||
        rawData.rpm === 0
      ) {
        console.warn("⚠️ RPM is null/undefined/0 in database:", {
          rawRpm: rawData.rpm,
          rpmType: typeof rawData.rpm,
          timestamp: rawData.timestamp,
        });
      }

      return this.normalizeSensorData(rawData);
    } catch (error) {
      console.error("Failed to fetch sensor data:", error);
      return null;
    }
  }

  /**
   * Normalize sensor data to consistent format
   */
  normalizeSensorData(raw) {
    if (!raw) return null;

    return {
      // Core metrics (from actual database fields)
      rpm: parseFloat(raw.rpm) || 0, // ✅ EXISTS in database!
      vehicleSpeed: parseFloat(raw.vehicle_speed) || 0,
      coolantTemp: parseFloat(raw.coolant_temp) || 0,
      engineLoad: parseFloat(raw.engine_load) || 0,

      // Throttle & intake
      throttlePos: parseFloat(raw.throttle_pos) || 0,
      intakeTemp: parseFloat(raw.intake_temp) || 0,

      // Fuel system (from actual database fields)
      fuelLevel: parseFloat(raw.fuel_level) || 0, // ✅ EXISTS in database!
      fuelTrimShort: parseFloat(raw.fuel_trim_short) || 0,
      fuelTrimLong: parseFloat(raw.fuel_trim_long) || 0,
      fuelTrimShort2: parseFloat(raw.short_fuel_trim_2) || 0, // Bank 2
      fuelTrimLong2: parseFloat(raw.long_fuel_trim_2) || 0, // Bank 2
      fuelPressure: parseFloat(raw.fuel_pressure) || 0, // ✅ EXISTS in database!
      // fuel_system_status: EXCLUDED - has null values
      // fuel_status: EXCLUDED - has null values

      // Air flow & pressure
      maf: parseFloat(raw.maf) || 0, // Mass Air Flow (g/s)
      map: parseFloat(raw.map) || 0, // Manifold Absolute Pressure (kPa)
      barometricPressure: parseFloat(raw.barometric_pressure) || 0,

      // Ignition & timing
      timingAdvance: parseFloat(raw.timing_advance) || 0,

      // Oxygen sensors
      o2Sensor1: parseFloat(raw.o2_sensor_1) || 0, // ✅ EXISTS in database!
      // o2_sensor_2: EXCLUDED - has null values
      // o2_b1s2: Available but not used

      // Temperatures
      // catalyst_temp: EXCLUDED - has null values
      // catalyst_temp_b1s1: Available but not used

      // System metrics
      controlModuleVoltage: parseFloat(raw.control_module_voltage) || 0,
      engineRuntime: parseInt(raw.engine_runtime || raw.run_time) || 0, // Both exist, prefer engine_runtime

      // Diagnostics
      dtcCount: parseInt(raw.dtc_count) || 0, // ✅ EXISTS in database!
      milStatus: Boolean(raw.mil_status) || false, // Malfunction Indicator Lamp (Check Engine Light)
      distanceWithMil: parseFloat(raw.distance_w_mil) || 0, // Distance traveled with MIL on (km)
      status: raw.status || "NORMAL",
      // fault_type: EXCLUDED - has null values

      // Computed metrics (from actual database fields)
      loadRpmRatio: parseFloat(raw.load_rpm_ratio) || 0,
      tempGradient: parseFloat(raw.temp_gradient) || 0,
      engineStressScore: parseFloat(raw.engine_stress_score) || 0,
      dataQualityScore: parseInt(raw.data_quality_score) || 100, // ✅ EXISTS in database!
      absoluteLoad: parseFloat(raw.absolute_load) || 0, // New field

      // Additional fields available but not used
      // fuel_efficiency: EXCLUDED - has null values
      // throttle_response: Not in database
      // egr_error: Not in database

      // ML Predictions (from Random Forest algorithm on Raspberry Pi)
      // ONLY use data that the RPi writes to the database - no fallback calculations!
      mlHealthScore:
        parseFloat(
          raw.ml_health_score ||
            raw.mlHealthScore ||
            raw.health_score ||
            raw.healthScore
        ) || null,
      mlStatus: raw.ml_status || raw.mlStatus || raw.predicted_status || null,
      mlAlerts: Array.isArray(raw.ml_alerts)
        ? raw.ml_alerts
        : Array.isArray(raw.mlAlerts)
        ? raw.mlAlerts
        : raw.ml_alerts
        ? [raw.ml_alerts]
        : raw.mlAlerts
        ? [raw.mlAlerts]
        : [],
      mlConfidence:
        parseFloat(
          raw.ml_confidence ||
            raw.mlConfidence ||
            raw.confidence_score ||
            raw.confidence
        ) || null,
      healthStatus: raw.health_status, // Store raw health_status for debugging

      // Additional ML prediction fields
      probNormal: parseFloat(raw.prob_normal) || null,
      probAdvisory: parseFloat(raw.prob_advisory) || null,
      probWarning: parseFloat(raw.prob_warning) || null,
      probCritical: parseFloat(raw.prob_critical) || null,
      failureRisk: raw.failure_risk || raw.predicted_failure_risk || null,
      daysUntilMaintenance: parseInt(raw.days_until_maintenance) || null,

      // Dashboard Display Metrics
      // Convert engine stress score (0-15+) to Health Score (0-100)
      // Formula: Health Score = 100 - (stress_score × 6.67)
      // 0 stress = 100 health, 15 stress = 0 health
      healthScoreDisplay: Math.max(
        0,
        Math.min(
          100,
          Math.round(100 - parseFloat(raw.engine_stress_score || 0) * 6.67)
        )
      ),

      // Metadata
      vehicleId: raw.vehicle_id,
      sessionId: raw.session_id,
      timestamp: raw.timestamp,
      createdAt: raw.created_at,
    };
  }

  /**
   * Subscribe to real-time sensor data updates using Supabase Realtime
   * This replaces the old polling mechanism with REST API + Realtime subscriptions
   */
  subscribeToSensorData(vehicleId, callback) {
    if (!supabase) {
      console.warn("Supabase not configured");
      return () => {};
    }

    // Clear existing subscription for this vehicle
    this.unsubscribeFromSensorData(vehicleId);

    // Initial fetch using REST API
    console.log(`🚀 Subscribing to sensor data for vehicle ${vehicleId}`);
    this.getLatestSensorData(vehicleId)
      .then((data) => {
        console.log(`📡 Initial fetch result:`, {
          hasData: !!data,
          dataKeys: data ? Object.keys(data) : null,
          vehicleSpeed: data?.vehicleSpeed,
          coolantTemp: data?.coolantTemp,
          engineLoad: data?.engineLoad,
        });
        if (data && callback) {
          callback(data);
        } else {
          console.warn("⚠️ No data returned from initial fetch");
        }
      })
      .catch((err) => {
        console.error("❌ Initial fetch error:", err);
      });

    // Always set up periodic polling as backup (every 3 seconds)
    // This ensures data updates even if Realtime doesn't work
    console.log(
      `🔄 Setting up periodic polling backup (every 3 seconds) for vehicle ${vehicleId}`
    );
    const pollingInterval = setInterval(async () => {
      console.log(
        `🔄 Periodic polling - fetching data for vehicle ${vehicleId}`
      );
      try {
        const data = await this.getLatestSensorData(vehicleId);
        if (data && callback) {
          console.log("✅ Periodic polling - data received:", {
            vehicleSpeed: data.vehicleSpeed,
            coolantTemp: data.coolantTemp,
            engineLoad: data.engineLoad,
          });
          callback(data);
        } else {
          console.warn("⚠️ Periodic polling - no data received");
        }
      } catch (err) {
        console.error("❌ Periodic polling error:", err);
      }
    }, 3000); // Poll every 3 seconds
    this.subscriptions.set(`${vehicleId}-polling`, pollingInterval);

    // Set up Supabase Realtime subscription (replaces setInterval polling)
    try {
      const channelName = `sensor-data-${vehicleId}`;
      const channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "*", // Listen to INSERT, UPDATE, DELETE
            schema: "public",
            table: "sensor_data",
            filter: `vehicle_id=eq.${vehicleId}`,
          },
          (payload) => {
            console.log("📡 Real-time update received:", payload);

            // When new data is inserted or updated, fetch the latest using REST API
            // Supabase Realtime payload structure: { eventType: 'INSERT'|'UPDATE'|'DELETE', new: {...}, old: {...} }
            const eventType = payload.eventType;
            if (eventType === "INSERT" || eventType === "UPDATE") {
              console.log(
                `🔄 Realtime triggered - fetching latest data for vehicle ${vehicleId}`
              );
              this.getLatestSensorData(vehicleId)
                .then((data) => {
                  console.log(`📡 Realtime fetch result:`, {
                    hasData: !!data,
                    vehicleSpeed: data?.vehicleSpeed,
                    coolantTemp: data?.coolantTemp,
                  });
                  if (data && callback) {
                    callback(data);
                  }
                })
                .catch((err) => {
                  console.error("❌ Realtime fetch error:", err);
                });
            }
          }
        )
        .subscribe((status) => {
          console.log("📡 Realtime subscription status:", status);
          if (status === "SUBSCRIBED") {
            console.log(
              `✅ Successfully subscribed to real-time updates for vehicle ${vehicleId}`
            );
          } else if (status === "CHANNEL_ERROR") {
            console.error(
              "❌ Realtime channel error. Falling back to periodic REST API calls."
            );
            // Fallback: If Realtime fails, use periodic REST API calls as backup
            const fallbackInterval = setInterval(async () => {
              console.log(
                `🔄 Fallback polling - fetching data for vehicle ${vehicleId}`
              );
              const data = await this.getLatestSensorData(vehicleId);
              if (data && callback) {
                console.log("✅ Fallback polling - data received");
                callback(data);
              } else {
                console.warn("⚠️ Fallback polling - no data received");
              }
            }, 3000); // Fallback: poll every 3 seconds
            this.subscriptions.set(`${vehicleId}-fallback`, fallbackInterval);
          } else if (status === "TIMED_OUT" || status === "CLOSED") {
            console.warn(
              `⚠️ Realtime subscription ${status}. Setting up fallback polling.`
            );
            // Set up fallback polling if Realtime times out or closes
            const fallbackInterval = setInterval(async () => {
              console.log(
                `🔄 Fallback polling (${status}) - fetching data for vehicle ${vehicleId}`
              );
              const data = await this.getLatestSensorData(vehicleId);
              if (data && callback) {
                callback(data);
              }
            }, 3000);
            this.subscriptions.set(`${vehicleId}-fallback`, fallbackInterval);
          }
        });

      // Store subscription
      this.subscriptions.set(vehicleId, channel);

      // Return unsubscribe function
      return () => {
        this.unsubscribeFromSensorData(vehicleId);
      };
    } catch (error) {
      console.error("❌ Failed to subscribe to real-time updates:", error);
      // Fallback to periodic REST API calls if Realtime fails
      console.log(
        "🔄 Falling back to periodic REST API calls every 3 seconds..."
      );
      const fallbackInterval = setInterval(async () => {
        console.log(
          `🔄 Fallback polling (catch block) - fetching data for vehicle ${vehicleId}`
        );
        const data = await this.getLatestSensorData(vehicleId);
        if (data && callback) {
          console.log(
            "✅ Fallback polling - data received and callback called"
          );
          callback(data);
        } else {
          console.warn("⚠️ Fallback polling - no data received");
        }
      }, 3000);
      this.subscriptions.set(`${vehicleId}-fallback`, fallbackInterval);
      return () => {
        this.unsubscribeFromSensorData(vehicleId);
      };
    }
  }

  /**
   * Unsubscribe from sensor data updates
   */
  unsubscribeFromSensorData(vehicleId) {
    // Remove Realtime channel subscription
    const channel = this.subscriptions.get(vehicleId);
    if (channel) {
      supabase.removeChannel(channel);
      this.subscriptions.delete(vehicleId);
      console.log(`🔌 Unsubscribed from vehicle ${vehicleId} (Realtime)`);
    }

    // Remove fallback interval if exists
    const fallbackInterval = this.subscriptions.get(`${vehicleId}-fallback`);
    if (fallbackInterval) {
      clearInterval(fallbackInterval);
      this.subscriptions.delete(`${vehicleId}-fallback`);
      console.log(`🔌 Removed fallback polling for vehicle ${vehicleId}`);
    }

    // Remove periodic polling interval if exists
    const pollingInterval = this.subscriptions.get(`${vehicleId}-polling`);
    if (pollingInterval) {
      clearInterval(pollingInterval);
      this.subscriptions.delete(`${vehicleId}-polling`);
      console.log(`🔌 Removed periodic polling for vehicle ${vehicleId}`);
    }
  }

  /**
   * Get historical sensor data
   */
  async getHistoricalData(vehicleId, options = {}) {
    if (!supabase) return [];

    const { limit = 100, startTime, endTime } = options;

    try {
      let query = supabase
        .from("sensor_data")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (startTime) {
        query = query.gte("timestamp", startTime.toISOString());
      }

      if (endTime) {
        query = query.lte("timestamp", endTime.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching historical data:", error);
        return [];
      }

      return (data || []).map((item) => this.normalizeSensorData(item));
    } catch (error) {
      console.error("Failed to fetch historical data:", error);
      return [];
    }
  }

  /**
   * Set current vehicle ID
   */
  setVehicleId(vehicleId) {
    this.currentVehicleId = vehicleId || DEFAULT_VEHICLE_ID;
  }

  /**
   * Get current vehicle ID
   */
  getVehicleId() {
    return this.currentVehicleId;
  }
}

// Export singleton instance
export const sensorDataService = new SensorDataService();

// Export default
export default sensorDataService;
