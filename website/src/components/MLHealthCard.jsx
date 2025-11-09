import React, { useEffect, useState, useRef } from "react";
import { vehicleMLService } from "../services/vehicleML";
import sensorDataService from "../services/sensorData";

export default function MLHealthCard({ sensorData, style = {} }) {
  const [healthData, setHealthData] = useState({
    healthScore: null,
    status: "UNKNOWN",
    alerts: [],
    confidence: 0,
    isConnected: false,
    lastUpdate: null,
  });

  const refreshIntervalRef = useRef(null);

  // Function to update ML data from sensorData
  const updateMLData = (data) => {
    if (data) {
      // Use ML data directly from Supabase (processed by Raspberry Pi)
      const mlHealthScore = data.mlHealthScore ?? null;
      const mlStatus = data.mlStatus || data.status || "UNKNOWN";
      const mlAlerts = data.mlAlerts || [];
      const mlConfidence = data.mlConfidence || 0.95;
      const hasMLData = mlHealthScore !== null && mlHealthScore !== undefined;
      
      console.log('🤖 MLHealthCard - Updating ML data:', {
        mlHealthScore,
        mlStatus,
        mlAlertsCount: mlAlerts.length,
        mlConfidence,
        hasMLData,
        sensorDataKeys: Object.keys(data),
        rawMLData: {
          mlHealthScore: data.mlHealthScore,
          mlStatus: data.mlStatus,
          mlAlerts: data.mlAlerts,
          mlConfidence: data.mlConfidence,
          healthStatus: data.healthStatus // Check if health_status exists
        }
      });
      
      // Debug: Check if ML columns exist in database
      if (!hasMLData) {
        console.warn('⚠️ ML Health Score is missing!', {
          reason: 'ml_health_score column may not exist in database or Raspberry Pi is not writing ML predictions',
          solution: 'Run ADD_ML_COLUMNS.sql in Supabase SQL Editor to add ML columns',
          hasHealthStatus: data.healthStatus !== null && data.healthStatus !== undefined,
          healthStatusValue: data.healthStatus
        });
      }
      
      setHealthData({
        healthScore: mlHealthScore,
        status: hasMLData ? mlStatus : "DISCONNECTED", // Set to DISCONNECTED when no ML data
        alerts: mlAlerts,
        confidence: mlConfidence,
        isConnected: hasMLData,
        lastUpdate: data.timestamp ? new Date(data.timestamp).getTime() : Date.now(),
      });
    } else {
      // Reset when no sensor data
      setHealthData({
        healthScore: null,
        status: "DISCONNECTED",
        alerts: [],
        confidence: 0,
        isConnected: false,
        lastUpdate: null,
      });
    }
  };

  // Automatically update ML data from Supabase sensorData in real-time
  useEffect(() => {
    updateMLData(sensorData);
  }, [sensorData]);

  // Auto-refresh every 3 seconds to ensure data is up-to-date
  useEffect(() => {
    const refreshData = async () => {
      try {
        const latestData = await sensorDataService.getLatestSensorData(1); // Default vehicle ID
        if (latestData) {
          updateMLData(latestData);
        }
      } catch (error) {
        console.error('Auto-refresh error:', error);
      }
    };

    // Initial refresh
    refreshData();

    // Set up interval for auto-refresh every 3 seconds
    refreshIntervalRef.current = setInterval(refreshData, 3000);

    // Cleanup interval on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []); // Empty dependency array - only run once on mount

  // Show disconnected status when not connected, otherwise use actual status
  const statusDisplay = !healthData.isConnected 
    ? { text: "Disconnected", color: "#9ca3af", icon: "⏸️" }
    : vehicleMLService.getStatusDisplay(healthData.status);
  const healthColor = !healthData.isConnected
    ? "#9ca3af"
    : vehicleMLService.getHealthScoreColor(healthData.healthScore);

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
        <h3 style={titleStyle}>🧠 Random Forest ML (Auto & Real-time)</h3>
        <div style={statusBadgeStyle}>
          {healthData.isConnected ? "🟢 Active" : "🔴 Offline"}
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
            {healthData.healthScore ?? "N/A"}
            {healthData.healthScore && (
              <span style={{ fontSize: "18px" }}>/100</span>
            )}
          </div>
          <div
            style={{ fontSize: "14px", color: "#6b7280", fontWeight: "500" }}
          >
            Health Score
          </div>
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
            Status
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

      {/* Real-time Status Footer */}
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              color: healthData.isConnected ? "#10b981" : "#9ca3af",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: healthData.isConnected ? "#10b981" : "#9ca3af",
                animation: healthData.isConnected ? "pulse 2s infinite" : "none",
              }}
            />
            {healthData.isConnected ? "🔄 Real-time Active" : "⏸️ Waiting for data"}
          </div>
        </div>

        {healthData.lastUpdate && (
          <span style={{ fontSize: "12px", color: "#9ca3af" }}>
            Updated: {new Date(healthData.lastUpdate).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}
