import React, { useEffect, useState } from "react";
import { vehicleMLService } from "../services/vehicleML";

export default function MLHealthCard({ sensorData, style = {} }) {
  const [healthData, setHealthData] = useState({
    healthScore: null,
    status: "UNKNOWN",
    alerts: [],
    confidence: 0,
    isConnected: false,
    lastUpdate: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(true);

  // Auto-predict when sensor data changes
  useEffect(() => {
    if (
      sensorData &&
      autoUpdate &&
      (sensorData.rpm > 0 || sensorData.coolantTemp > 0)
    ) {
      predictHealth();
    }
  }, [sensorData, autoUpdate]);

  // Check ML API connection on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const predictHealth = async () => {
    if (!sensorData) return;

    setIsLoading(true);
    try {
      const prediction = await vehicleMLService.predictVehicleHealth(
        sensorData
      );
      setHealthData({
        healthScore: prediction.healthScore,
        status: prediction.status,
        alerts: vehicleMLService.formatAlertsForUI(prediction.alerts),
        confidence: prediction.confidence,
        isConnected: prediction.success,
        lastUpdate: Date.now(),
      });
    } catch (error) {
      console.error("Health prediction failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkConnection = async () => {
    const modelInfo = await vehicleMLService.checkConnection();
    setHealthData((prev) => ({
      ...prev,
      isConnected: vehicleMLService.isConnected,
    }));
  };

  const statusDisplay = vehicleMLService.getStatusDisplay(healthData.status);
  const healthColor = vehicleMLService.getHealthScoreColor(
    healthData.healthScore
  );

  const cardStyle = {
    padding: "24px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    ...style,
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    borderBottom: "2px solid #f3f4f6",
    paddingBottom: "12px",
  };

  const titleStyle = {
    fontSize: "20px",
    fontWeight: "700",
    color: "#111827",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const statusBadgeStyle = {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    backgroundColor: healthData.isConnected ? "#dcfce7" : "#fee2e2",
    color: healthData.isConnected ? "#166534" : "#991b1b",
    border: `1px solid ${healthData.isConnected ? "#bbf7d0" : "#fecaca"}`,
  };

  const metricsGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "20px",
  };

  const metricCardStyle = {
    padding: "16px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    textAlign: "center",
  };

  return (
    <div style={cardStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h3 style={titleStyle}>🤖 AI Vehicle Health Monitor</h3>
        <div style={statusBadgeStyle}>
          {healthData.isConnected ? "🟢 ML Connected" : "🔴 ML Offline"}
        </div>
      </div>

      {/* Health Metrics Grid */}
      <div style={metricsGridStyle}>
        {/* Health Score */}
        <div style={metricCardStyle}>
          <div
            style={{
              fontSize: "36px",
              fontWeight: "700",
              color: healthColor,
              marginBottom: "4px",
            }}
          >
            {isLoading ? "..." : healthData.healthScore || "N/A"}
            {healthData.healthScore && (
              <span style={{ fontSize: "18px" }}>/100</span>
            )}
          </div>
          <div
            style={{ fontSize: "14px", color: "#6b7280", fontWeight: "500" }}
          >
            Health Score
          </div>
          {healthData.confidence > 0 && (
            <div
              style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}
            >
              {(healthData.confidence * 100).toFixed(0)}% confidence
            </div>
          )}
        </div>

        {/* Status */}
        <div style={metricCardStyle}>
          <div
            style={{
              fontSize: "24px",
              fontWeight: "600",
              color: statusDisplay.color,
              marginBottom: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <span>{statusDisplay.icon}</span>
            {statusDisplay.text}
          </div>
          <div
            style={{ fontSize: "14px", color: "#6b7280", fontWeight: "500" }}
          >
            Vehicle Status
          </div>
        </div>

        {/* Active Alerts */}
        <div style={metricCardStyle}>
          <div
            style={{
              fontSize: "36px",
              fontWeight: "700",
              color: healthData.alerts.length > 0 ? "#ef4444" : "#10b981",
              marginBottom: "4px",
            }}
          >
            {healthData.alerts.length}
          </div>
          <div
            style={{ fontSize: "14px", color: "#6b7280", fontWeight: "500" }}
          >
            Active Alerts
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {healthData.alerts.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <h4
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            🔔 Maintenance Alerts
          </h4>
          <div style={{ maxHeight: "150px", overflowY: "auto" }}>
            {healthData.alerts.slice(0, 3).map((alert, index) => (
              <div
                key={index}
                style={{
                  padding: "12px",
                  marginBottom: "8px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  backgroundColor:
                    alert.type === "error"
                      ? "#fef2f2"
                      : alert.type === "warning"
                      ? "#fffbeb"
                      : "#f0f9ff",
                  border: `1px solid ${
                    alert.type === "error"
                      ? "#fecaca"
                      : alert.type === "warning"
                      ? "#fed7aa"
                      : "#bfdbfe"
                  }`,
                  color:
                    alert.type === "error"
                      ? "#991b1b"
                      : alert.type === "warning"
                      ? "#92400e"
                      : "#1e40af",
                }}
              >
                <div style={{ fontWeight: "500" }}>{alert.title}</div>
                {alert.message && alert.message !== alert.title && (
                  <div style={{ marginTop: "4px", opacity: 0.8 }}>
                    {alert.message}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "16px",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <label
            style={{
              fontSize: "14px",
              color: "#374151",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <input
              type="checkbox"
              checked={autoUpdate}
              onChange={(e) => setAutoUpdate(e.target.checked)}
              style={{ margin: 0 }}
            />
            Auto-predict
          </label>

          {healthData.lastUpdate && (
            <span style={{ fontSize: "12px", color: "#9ca3af" }}>
              Last: {new Date(healthData.lastUpdate).toLocaleTimeString()}
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={checkConnection}
            disabled={isLoading}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#374151",
              backgroundColor: "#f9fafb",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            🔄 Check Connection
          </button>

          <button
            onClick={predictHealth}
            disabled={isLoading || !sensorData}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "500",
              color: "white",
              backgroundColor: isLoading ? "#9ca3af" : "#3b82f6",
              border: "none",
              borderRadius: "6px",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >
            {isLoading ? "🤖 Analyzing..." : "🧠 Predict Health"}
          </button>
        </div>
      </div>
    </div>
  );
}
