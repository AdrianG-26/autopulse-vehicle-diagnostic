// Vehicle Data Service
// Manages vehicle profiles and sensor data from Supabase cloud database
import React from "react";
import { supabase } from "./supabase";

class VehicleDataService {
  constructor() {
    this.isConnected = false;
    this.currentVehicleId = null;
    this.vehicles = [];
    this.realtimeSubscription = null;
  }

  /**
   * Check if Supabase is properly configured
   */
  isSupabaseConfigured() {
    return Boolean(supabase);
  }

  /**
   * Fetch all vehicles for the current user
   */
  async fetchUserVehicles(userId = null) {
    if (!supabase) {
      console.warn("Supabase not configured");
      return [];
    }

    try {
      let query = supabase
        .from("vehicle_profiles")
        .select("*")
        .eq("is_active", true)
        .order("last_used", { ascending: false });

      // If userId provided, filter by user
      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching vehicles:", error);
        return [];
      }

      this.vehicles = data || [];
      this.isConnected = true;
      return this.vehicles;
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
      return [];
    }
  }

  /**
   * Get a specific vehicle by ID
   */
  async getVehicle(vehicleId) {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from("vehicle_profiles")
        .select("*")
        .eq("id", vehicleId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching vehicle:", error);
      return null;
    }
  }

  /**
   * Get latest sensor data for a vehicle
   */
  async getLatestSensorData(vehicleId) {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from("sensor_data_realtime")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows
        console.error("Error fetching latest sensor data:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Failed to fetch latest sensor data:", error);
      return null;
    }
  }

  /**
   * Get historical sensor data for a vehicle
   * @param {number} vehicleId - Vehicle ID
   * @param {object} options - Query options
   * @param {Date} options.startTime - Start time filter
   * @param {Date} options.endTime - End time filter
   * @param {number} options.limit - Max number of records
   */
  async getHistoricalData(vehicleId, options = {}) {
    if (!supabase) return [];

    const { startTime, endTime, limit = 1000 } = options;

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

      return data || [];
    } catch (error) {
      console.error("Failed to fetch historical data:", error);
      return [];
    }
  }

  /**
   * Get sensor data statistics for a vehicle
   */
  async getVehicleStatistics(vehicleId) {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from("vehicle_statistics")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching statistics:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
      return null;
    }
  }

  /**
   * Subscribe to real-time updates for a vehicle
   */
  subscribeToVehicleUpdates(vehicleId, callback) {
    if (!supabase) {
      console.warn("Supabase not configured");
      return () => {};
    }

    // Unsubscribe from previous subscription
    this.unsubscribeFromVehicleUpdates();

    try {
      this.realtimeSubscription = supabase
        .channel(`vehicle-${vehicleId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "sensor_data_realtime",
            filter: `vehicle_id=eq.${vehicleId}`,
          },
          (payload) => {
            console.log("Real-time update:", payload);
            if (callback) {
              callback(payload.new);
            }
          }
        )
        .subscribe();

      this.currentVehicleId = vehicleId;

      // Return unsubscribe function
      return () => this.unsubscribeFromVehicleUpdates();
    } catch (error) {
      console.error("Failed to subscribe to vehicle updates:", error);
      return () => {};
    }
  }

  /**
   * Unsubscribe from real-time updates
   */
  unsubscribeFromVehicleUpdates() {
    if (this.realtimeSubscription) {
      supabase.removeChannel(this.realtimeSubscription);
      this.realtimeSubscription = null;
      this.currentVehicleId = null;
    }
  }

  /**
   * Add a new vehicle profile
   */
  async addVehicle(vehicleData) {
    if (!supabase) {
      throw new Error("Supabase not configured");
    }

    try {
      const { data, error } = await supabase
        .from("vehicle_profiles")
        .insert([vehicleData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error adding vehicle:", error);
      throw error;
    }
  }

  /**
   * Update vehicle profile
   */
  async updateVehicle(vehicleId, updates) {
    if (!supabase) {
      throw new Error("Supabase not configured");
    }

    try {
      const { data, error } = await supabase
        .from("vehicle_profiles")
        .update(updates)
        .eq("id", vehicleId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating vehicle:", error);
      throw error;
    }
  }

  /**
   * Delete vehicle profile
   */
  async deleteVehicle(vehicleId) {
    if (!supabase) {
      throw new Error("Supabase not configured");
    }

    try {
      const { error } = await supabase
        .from("vehicle_profiles")
        .delete()
        .eq("id", vehicleId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      throw error;
    }
  }

  /**
   * Get vehicles with latest data (uses view)
   */
  async getVehiclesWithLatestData(userId = null) {
    if (!supabase) return [];

    try {
      let query = supabase
        .from("vehicle_latest_data")
        .select("*")
        .order("updated_at", { ascending: false });

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching vehicles with latest data:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Failed to fetch vehicles with latest data:", error);
      return [];
    }
  }
}

// Create singleton instance
export const vehicleDataService = new VehicleDataService();

/**
 * React hook for vehicle data management
 */
export const useVehicleData = () => {
  const [vehicles, setVehicles] = React.useState([]);
  const [currentVehicle, setCurrentVehicle] = React.useState(null);
  const [latestData, setLatestData] = React.useState(null);
  const [historicalData, setHistoricalData] = React.useState([]);
  const [statistics, setStatistics] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Fetch user vehicles
  const fetchVehicles = React.useCallback(async (userId = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await vehicleDataService.fetchUserVehicles(userId);
      setVehicles(data);
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Select a vehicle
  const selectVehicle = React.useCallback(async (vehicleId) => {
    setIsLoading(true);
    setError(null);
    try {
      const vehicle = await vehicleDataService.getVehicle(vehicleId);
      setCurrentVehicle(vehicle);

      // Fetch latest data
      const latest = await vehicleDataService.getLatestSensorData(vehicleId);
      setLatestData(latest);

      // Fetch statistics
      const stats = await vehicleDataService.getVehicleStatistics(vehicleId);
      setStatistics(stats);

      return vehicle;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch historical data
  const fetchHistoricalData = React.useCallback(
    async (vehicleId, options = {}) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await vehicleDataService.getHistoricalData(
          vehicleId,
          options
        );
        setHistoricalData(data);
        return data;
      } catch (err) {
        setError(err.message);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Subscribe to real-time updates
  const subscribeToUpdates = React.useCallback((vehicleId, callback) => {
    return vehicleDataService.subscribeToVehicleUpdates(vehicleId, (data) => {
      setLatestData(data);
      if (callback) callback(data);
    });
  }, []);

  return {
    vehicles,
    currentVehicle,
    latestData,
    historicalData,
    statistics,
    isLoading,
    error,
    fetchVehicles,
    selectVehicle,
    fetchHistoricalData,
    subscribeToUpdates,
    vehicleDataService,
  };
};

export default vehicleDataService;
