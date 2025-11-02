/**
 * Raspberry Pi API Service
 * Connects to Flask API running on Raspberry Pi
 */

// Default to a common Pi IP for local hotspots; can be configured in app settings
const DEFAULT_API_URL = "http://192.168.1.100:5000"; // Change this to your Raspberry Pi IP

// Persisted setting key
const STORAGE_KEY_API_URL = "@autopulse:rpi_api_url";

// AsyncStorage is used to persist the API URL so the app can switch endpoints at runtime
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
  engine_runtime: number;
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
  ml_health_score: number;
  ml_status: string;
  ml_alerts: string[];
}

interface ApiResponse {
  success: boolean;
  data: VehicleData | null;
  timestamp: string;
  message?: string;
  error?: string;
}

class RaspberryPiAPI {
  private apiUrl: string;
  private subscribers: Map<string, (data: VehicleData | null) => void>;
  private pollingInterval: ReturnType<typeof setInterval> | null;
  private isPolling: boolean;

  constructor(apiUrl: string = DEFAULT_API_URL) {
    this.apiUrl = apiUrl;
    this.subscribers = new Map();
    this.pollingInterval = null;
    this.isPolling = false;
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
   * Fetch latest sensor data from Raspberry Pi
   */
  async fetchLatest(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/api/latest`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Timeout after 5 seconds
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();
      return data;
    } catch (error: any) {
      console.error("Error fetching latest data:", error);
      return {
        success: false,
        data: null,
        timestamp: new Date().toISOString(),
        error: error.message || "Failed to connect to Raspberry Pi",
      };
    }
  }

  /**
   * Subscribe to real-time updates (polling every 1 second)
   */
  subscribe(
    id: string,
    callback: (data: VehicleData | null) => void
  ): () => void {
    this.subscribers.set(id, callback);

    // Start polling if not already started
    if (!this.isPolling) {
      this.startPolling();
    }

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(id);
      if (this.subscribers.size === 0) {
        this.stopPolling();
      }
    };
  }

  /**
   * Start polling for data
   */
  private startPolling(): void {
    if (this.isPolling) return;

    this.isPolling = true;
    console.log("🚀 Started polling Raspberry Pi API");

    // Initial fetch
    this.poll();

    // Poll every 1 second (matching website behavior)
    this.pollingInterval = setInterval(() => {
      this.poll();
    }, 1000);
  }

  /**
   * Stop polling
   */
  private stopPolling(): void {
    if (!this.isPolling) return;

    this.isPolling = false;
    console.log("🛑 Stopped polling Raspberry Pi API");

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * Execute poll and notify subscribers
   */
  private async poll(): Promise<void> {
    const response = await this.fetchLatest();

    // Notify all subscribers
    this.subscribers.forEach((callback) => {
      callback(response.data);
    });
  }

  /**
   * Manually refresh data (for pull-to-refresh)
   */
  async refresh(): Promise<ApiResponse> {
    return this.fetchLatest();
  }

  /**
   * Test connection to Raspberry Pi
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/api/latest`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(3000),
      });

      return response.ok;
    } catch (error) {
      console.error("Connection test failed:", error);
      return false;
    }
  }

  /**
   * Get model information
   */
  async getModelInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/api/model-info`);
      if (!response.ok) throw new Error("Failed to fetch model info");
      return await response.json();
    } catch (error) {
      console.error("Error fetching model info:", error);
      return null;
    }
  }
}

// Export singleton instance
export const rpiApi = new RaspberryPiAPI();

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
