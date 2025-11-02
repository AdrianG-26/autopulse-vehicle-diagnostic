/**
 * 📡 Simple HTTP Polling Service for Real-Time Data
 */

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
const POLL_INTERVAL = 2000; // Poll every 2 seconds

let pollingInterval = null;
let isPolling = false;
let dataCallback = null;
let statusCallback = null;

/**
 * Start polling for latest sensor data
 */
export const startPolling = (onData, onStatus) => {
  if (isPolling) {
    console.log("Polling already active");
    return;
  }

  dataCallback = onData;
  statusCallback = onStatus;
  isPolling = true;

  // Update status
  if (statusCallback) {
    statusCallback("CONNECTED", "Polling every 2 seconds");
  }

  // Initial fetch
  fetchLatest();

  // Start interval
  pollingInterval = setInterval(fetchLatest, POLL_INTERVAL);

  console.log("✅ Started polling:", `${API_BASE}/api/latest`);
};

/**
 * Stop polling
 */
export const stopPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
  isPolling = false;

  if (statusCallback) {
    statusCallback("DISCONNECTED", "Polling stopped");
  }

  console.log("⏹️ Stopped polling");
};

/**
 * Fetch latest reading
 */
const fetchLatest = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/latest`);
    const result = await response.json();

    if (result.success && result.data) {
      // Normalize data format
      const normalized = normalizeData(result.data);

      if (dataCallback) {
        dataCallback(normalized);
      }

      // Update status
      if (statusCallback) {
        statusCallback(
          "CONNECTED",
          `Last update: ${new Date().toLocaleTimeString()}`
        );
      }
    } else {
      // No data yet
      if (statusCallback) {
        statusCallback("WAITING", result.message || "Waiting for data...");
      }
    }
  } catch (error) {
    console.error("Polling error:", error);

    if (statusCallback) {
      statusCallback("ERROR", `Connection failed: ${error.message}`);
    }
  }
};

/**
 * Normalize data to match expected format
 */
const normalizeData = (raw) => {
  return {
    // Core metrics
    rpm: parseFloat(raw.rpm) || 0,
    speed: parseFloat(raw.vehicle_speed) || 0,
    coolantTemp: parseFloat(raw.coolant_temp) || 0,
    engineLoad: parseFloat(raw.engine_load) || 0,
    throttle: parseFloat(raw.throttle_pos) || 0,
    fuelLevel: parseFloat(raw.fuel_level) || 0,
    maf: parseFloat(raw.maf) || 0,
    timingAdvance: parseFloat(raw.timing_advance) || 0,

    // ML predictions
    healthScore: raw.ml_health_score || 0,
    status: raw.ml_status || "UNKNOWN",
    alerts: raw.ml_alerts || [],

    // Metadata
    timestamp: raw.timestamp,
    dataQuality: raw.data_quality_score || 0,
  };
};

/**
 * Check if currently polling
 */
export const isConnected = () => isPolling;

/**
 * Get polling status
 */
export const getStatus = () => ({
  connected: isPolling,
  interval: POLL_INTERVAL,
  endpoint: `${API_BASE}/api/latest`,
});
