// Vehicle ML API Service
// Connects React frontend to Raspberry Pi ML prediction system
// Supports mock API for deployed demos
import React from "react";
import { mockMLService } from "./mockMLService";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const USE_MOCK_API = process.env.REACT_APP_USE_MOCK_API === "true";

class VehicleMLService {
  constructor() {
    this.isConnected = false;
    this.lastHealthCheck = null;
    this.useMock = USE_MOCK_API;
    
    if (this.useMock) {
      console.log("🎭 Using Mock ML API for demo");
      this.isConnected = true;
    } else {
      this.checkConnection();
    }
  }

  async checkConnection() {
    if (this.useMock) {
      return await mockMLService.checkConnection();
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/model-info`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        timeout: 5000,
      });

      if (response.ok) {
        const modelInfo = await response.json();
        this.isConnected = modelInfo.success;
        return modelInfo;
      }
    } catch (error) {
      console.error("ML API connection failed:", error);
      this.isConnected = false;
    }
    return null;
  }

  async predictVehicleHealth(sensorData) {
    if (this.useMock) {
      return await mockMLService.predictVehicleHealth(sensorData);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rpm: sensorData.rpm || 0,
          coolant_temp: sensorData.coolantTemp || 90,
          engine_load: sensorData.engineLoadPct || 20,
          throttle_pos: sensorData.throttlePosition || 10,
          vehicle_speed: sensorData.speed || 0,
          timing_advance: sensorData.ignitionAdvance || 0,
          fuel_level: sensorData.fuelLevelPct || 50,
          data_quality_score: 90,
        }),
      });

      if (response.ok) {
        const prediction = await response.json();
        if (prediction.success) {
          return {
            success: true,
            healthScore: prediction.health_score,
            status: prediction.status,
            alerts: prediction.alerts,
            confidence: prediction.ml_confidence,
            method: prediction.prediction_method,
          };
        }
      }
    } catch (error) {
      console.error("ML prediction failed:", error);
    }

    return {
      success: false,
      healthScore: 0,
      status: "UNKNOWN",
      alerts: ["ML prediction unavailable"],
      confidence: 0,
      method: "Error",
    };
  }

  async getCurrentHealth() {
    if (this.useMock) {
      return await mockMLService.getCurrentHealth();
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/current-health`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error("Current health check failed:", error);
    }
    return null;
  }

  async getMaintenanceAlerts() {
    if (this.useMock) {
      return await mockMLService.getMaintenanceAlerts();
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/alerts`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error("Alerts fetch failed:", error);
    }
    return { success: false, alerts: [], count: 0 };
  }

  async getSensorData() {
    if (this.useMock) {
      return await mockMLService.getSensorData();
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/sensor-data`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error("Sensor data fetch failed:", error);
    }
    return { success: false, data: [], count: 0 };
  }

  // Health score to color mapping for UI
  getHealthScoreColor(score) {
    return this.useMock ? 
      mockMLService.getHealthScoreColor(score) :
      this._getHealthScoreColor(score);
  }

  _getHealthScoreColor(score) {
    if (score >= 80) return "#10b981"; // Green
    if (score >= 60) return "#f59e0b"; // Yellow
    if (score >= 40) return "#ef4444"; // Red
    return "#dc2626"; // Dark red
  }

  // Status to display mapping
  getStatusDisplay(status) {
    return this.useMock ?
      mockMLService.getStatusDisplay(status) :
      this._getStatusDisplay(status);
  }

  _getStatusDisplay(status) {
    const statusMap = {
      NORMAL: { text: "Excellent", color: "#10b981", icon: "✅" },
      ADVISORY: { text: "Good", color: "#f59e0b", icon: "💡" },
      WARNING: { text: "Attention Needed", color: "#ef4444", icon: "⚠️" },
      CRITICAL: { text: "Critical", color: "#dc2626", icon: "🚨" },
      UNKNOWN: { text: "Unknown", color: "#6b7280", icon: "❓" },
    };
    return statusMap[status] || statusMap["UNKNOWN"];
  }

  // Convert alerts to UI format
  formatAlertsForUI(alerts) {
    return this.useMock ?
      mockMLService.formatAlertsForUI(alerts) :
      this._formatAlertsForUI(alerts);
  }

  _formatAlertsForUI(alerts) {
    return alerts.map((alert, index) => {
      let type = "info";
      if (alert.includes("CRITICAL")) type = "error";
      else if (alert.includes("WARNING")) type = "warning";
      else if (alert.includes("ADVISORY")) type = "warning";

      const parts = alert.split(":");
      const title = parts[0]?.trim() || "Vehicle Alert";
      const message = parts.slice(1).join(":").trim() || alert;

      return {
        id: `ml-alert-${index}`,
        type,
        title,
        message,
        timestamp: Date.now(),
        source: this.useMock ? "Mock ML API" : "ML Prediction",
      };
    });
  }
}

// Create singleton instance
export const vehicleMLService = new VehicleMLService();

// React hooks for easy integration
export const useVehicleML = () => {
  const [mlData, setMLData] = React.useState({
    healthScore: null,
    status: "UNKNOWN",
    alerts: [],
    confidence: 0,
    isConnected: false,
    lastUpdate: null,
  });

  const [isLoading, setIsLoading] = React.useState(false);

  const predictHealth = React.useCallback(async (sensorData) => {
    setIsLoading(true);
    try {
      const prediction = await vehicleMLService.predictVehicleHealth(
        sensorData
      );
      setMLData((prev) => ({
        ...prev,
        healthScore: prediction.healthScore,
        status: prediction.status,
        alerts: vehicleMLService.formatAlertsForUI(prediction.alerts),
        confidence: prediction.confidence,
        isConnected: prediction.success,
        lastUpdate: Date.now(),
      }));
      return prediction;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkConnection = React.useCallback(async () => {
    const modelInfo = await vehicleMLService.checkConnection();
    setMLData((prev) => ({
      ...prev,
      isConnected: vehicleMLService.isConnected,
    }));
    return modelInfo;
  }, []);

  return {
    mlData,
    predictHealth,
    checkConnection,
    isLoading,
    vehicleMLService,
  };
};

export default vehicleMLService;
