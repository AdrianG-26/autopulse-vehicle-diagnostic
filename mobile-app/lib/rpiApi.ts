/**
 * Vehicle Data API Service
 * Connects directly to Supabase database for real-time vehicle diagnostics
 * Data flow: OBD2 → Raspberry Pi → Supabase → Mobile App
 */

// Legacy settings (kept for backward compatibility but not used for Supabase connection)
const DEFAULT_API_URL = "Supabase (Direct Connection)";
const STORAGE_KEY_API_URL = "@autopulse:rpi_api_url";

import AsyncStorage from "@react-native-async-storage/async-storage";

interface VehicleData {
  timestamp: string;
  rpm: number;
  coolant_temp: number;
  engine_load: number;
  throttle_pos: number;
  intake_temp: number;
  fuel_level: number;
  fuel_trim_short: number;
  fuel_trim_long: number;
  maf: number;
  map: number;
  timing_advance: number;
  vehicle_speed: number;
  o2_sensor_1: number;
  o2_sensor_2: number;
  catalyst_temp: number;
  egr_error: number;
  barometric_pressure: number;
  fuel_pressure: number;
  run_time: number;
  control_module_voltage: number;
  dtc_count: number;
  fuel_system_status: string;
  load_rpm_ratio: number;
  temp_gradient: number;
  fuel_efficiency: number;
  throttle_response: number;
  engine_stress_score: number;
  status: string;
  fault_type: string;
  data_quality_score: number;
  health_status?: number; // Health status from Supabase (0=Normal, 1=Advisory, 2=Warning, 3=Critical)
  // ML-related fields (optional - may not exist in all tables)
  ml_health_score?: number;
  ml_status?: string;
  ml_alerts?: string[];
}

interface ApiResponse {
  success: boolean;
  data: VehicleData | null;
  timestamp: string;
  message?: string;
  error?: string;
}

class VehicleDataAPI {
  private apiUrl: string; // Legacy field (kept for compatibility)
  private latestData: VehicleData | null;

  constructor(apiUrl: string = DEFAULT_API_URL) {
    this.apiUrl = apiUrl;
    this.latestData = null;
  }

  /**
   * Initialize from persisted storage (call on app start)
   */
  async init(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY_API_URL);
      if (saved) {
        this.apiUrl = saved;
        console.log("Loaded saved Raspberry Pi API URL:", saved);
      } else {
        console.log("No saved API URL, using default:", this.apiUrl);
      }
    } catch (e) {
      console.warn("Failed to load saved API URL, using default", e);
    }
  }

  /**
   * Get API URL
   */
  getApiUrl(): string {
    return this.apiUrl;
  }

  /**
   * Set API URL (for changing Raspberry Pi IP)
   */
  setApiUrl(url: string): void {
    this.apiUrl = url;
  }

  /**
   * Set and persist API URL
   */
  async setAndPersistApiUrl(url: string): Promise<void> {
    this.apiUrl = url;
    try {
      await AsyncStorage.setItem(STORAGE_KEY_API_URL, url);
      console.log("Persisted Raspberry Pi API URL:", url);
    } catch (e) {
      console.warn("Failed to persist API URL", e);
    }
  }

  /**
   * Fetch latest sensor data from Supabase (direct connection)
   */
  async fetchLatest(): Promise<ApiResponse> {
    try {
      // Import supabase - dynamic import to avoid circular dependencies
      const { supabase } = await import('./supabase');
      
      console.log('🔄 Fetching latest data from Supabase...', new Date().toLocaleTimeString());
      
      const { data, error } = await supabase
        .from('sensor_data')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('❌ Supabase query error:', error);
        throw error;
      }

      if (!data) {
        console.log('⚠️ No data returned from Supabase');
        return {
          success: false,
          data: null,
          timestamp: new Date().toISOString(),
          message: 'No data available yet'
        };
      }

      const healthStatusText = 
        data.health_status === 0 ? 'Normal' :
        data.health_status === 1 ? 'Advisory' :
        data.health_status === 2 ? 'Warning' :
        data.health_status === 3 ? 'Critical' : 'Unknown';
      
      console.log('✅ Data fetched successfully:', {
        timestamp: data.timestamp,
        rpm: data.rpm,
        status: data.status,
        run_time: data.run_time,
        health_status: `${data.health_status} (${healthStatusText})`
      });

      // Store latest data for immediate access
      this.latestData = data as VehicleData;

      return {
        success: true,
        data: data as VehicleData,
        timestamp: data.timestamp || new Date().toISOString()
      };
    } catch (error: any) {
      console.error("❌ Error fetching from Supabase:", error);
      return {
        success: false,
        data: null,
        timestamp: new Date().toISOString(),
        error: error.message || "Failed to connect to Supabase",
      };
    }
  }

  /**
   * Get the latest cached data
   */
  getLatestData(): VehicleData | null {
    return this.latestData;
  }

  /**
   * Manually refresh data (for pull-to-refresh)
   */
  async refresh(): Promise<ApiResponse> {
    return this.fetchLatest();
  }

  /**
   * Test connection to Supabase
   */
  async testConnection(): Promise<boolean> {
    try {
      const { supabase } = await import('./supabase');
      
      const { error } = await supabase
        .from('sensor_data')
        .select('timestamp')
        .limit(1);

      return !error;
    } catch (error) {
      console.error("Supabase connection test failed:", error);
      return false;
    }
  }

  /**
   * Get model information (not available with direct Supabase connection)
   */
  async getModelInfo(): Promise<any> {
    // Model info not available with direct Supabase connection
    return {
      source: 'supabase',
      note: 'Direct database connection - ML predictions included in sensor data'
    };
  }
}

// Export singleton instance
export const rpiApi = new VehicleDataAPI();

// Attempt to load persisted API URL on import (non-blocking)
(async () => {
  try {
    await rpiApi.init();
  } catch (e) {
    console.warn("rpiApi.init() failed:", e);
  }
})();

// Export types
export type { ApiResponse, VehicleData };
