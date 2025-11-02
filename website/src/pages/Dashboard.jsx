import React, { useEffect, useState } from "react";
import DonutProgress from "../components/DonutProgress";
import StatusIndicator from "../components/StatusIndicator";

export default function Dashboard({ onNavigate }) {
  const [pollingStatus, setPollingStatus] = useState("WAITING");
  const [rawData, setRawData] = useState(null); // Store raw API response

  // Poll for latest data every 1 second (ultra-responsive!)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_BASE =
          process.env.REACT_APP_API_URL || "http://localhost:5000";
        const response = await fetch(`${API_BASE}/api/latest`);
        const result = await response.json();

        if (result.success && result.data) {
          // Store raw data for detailed display
          setRawData(result.data);
          setPollingStatus("CONNECTED");
        } else {
          setPollingStatus("WAITING");
        }
      } catch (error) {
        console.error("Polling error:", error);
        setPollingStatus("ERROR");
      }
    };

    // Initial fetch
    fetchData();

    // Poll every 1 second for ultra-responsive updates!
    const interval = setInterval(fetchData, 1000);

    return () => clearInterval(interval);
  }, []);

  // Show N/A when not connected
  const shouldShowNA = pollingStatus !== "CONNECTED" || !rawData;

  // Helper function to format numbers
  const fmt = (value, decimals = 1) => {
    if (shouldShowNA || value === null || value === undefined) return "N/A";
    return typeof value === "number" ? value.toFixed(decimals) : value;
  };

  // Get status color and icon
  const getStatusDisplay = (status) => {
    const statusMap = {
      NORMAL: { color: "#10b981", icon: "✅", text: "Normal", bg: "#dcfce7" },
      ADVISORY: {
        color: "#f59e0b",
        icon: "⚠️",
        text: "Advisory",
        bg: "#fef3c7",
      },
      WARNING: { color: "#ef4444", icon: "⚠️", text: "Warning", bg: "#fee2e2" },
      CRITICAL: {
        color: "#dc2626",
        icon: "🔴",
        text: "Critical",
        bg: "#fee2e2",
      },
    };
    return (
      statusMap[status] || {
        color: "#6b7280",
        icon: "❓",
        text: "Unknown",
        bg: "#f3f4f6",
      }
    );
  };

  const mlStatus = getStatusDisplay(rawData?.ml_status || "UNKNOWN");
  const sysStatus = getStatusDisplay(rawData?.status || "UNKNOWN");

  return (
    <div
      className="page"
      style={{ padding: "0", height: "100vh", display: "flex" }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "240px",
          backgroundColor: "#1e293b",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          borderRight: "1px solid #334155",
        }}
      >
        <h2
          style={{ margin: "0 0 20px 0", color: "#38bdf8", fontSize: "20px" }}
        >
          🚗 AutoPulse
        </h2>

        {/* Sidebar Navigation */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#334155",
              color: "#38bdf8",
              border: "1px solid #38bdf8",
              borderRadius: "6px",
              cursor: "pointer",
              textAlign: "left",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            📊 Dashboard
          </button>

          <button
            onClick={() => onNavigate("Engine")}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#1e293b",
              color: "#94a3b8",
              border: "1px solid #334155",
              borderRadius: "6px",
              cursor: "pointer",
              textAlign: "left",
              fontSize: "14px",
            }}
          >
            🔧 Engine
          </button>

          <button
            onClick={() => onNavigate("Fuel")}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#1e293b",
              color: "#94a3b8",
              border: "1px solid #334155",
              borderRadius: "6px",
              cursor: "pointer",
              textAlign: "left",
              fontSize: "14px",
            }}
          >
            ⛽ Fuel
          </button>

          <button
            onClick={() => onNavigate("Emissions")}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#1e293b",
              color: "#94a3b8",
              border: "1px solid #334155",
              borderRadius: "6px",
              cursor: "pointer",
              textAlign: "left",
              fontSize: "14px",
            }}
          >
            🌿 Emissions
          </button>

          <button
            onClick={() => onNavigate("Logs")}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#1e293b",
              color: "#94a3b8",
              border: "1px solid #334155",
              borderRadius: "6px",
              cursor: "pointer",
              textAlign: "left",
              fontSize: "14px",
            }}
          >
            📋 Logs
          </button>

          <button
            onClick={() => onNavigate("Settings")}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#1e293b",
              color: "#94a3b8",
              border: "1px solid #334155",
              borderRadius: "6px",
              cursor: "pointer",
              textAlign: "left",
              fontSize: "14px",
            }}
          >
            ⚙️ Settings
          </button>

          <button
            onClick={() => onNavigate("Contact")}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#1e293b",
              color: "#94a3b8",
              border: "1px solid #334155",
              borderRadius: "6px",
              cursor: "pointer",
              textAlign: "left",
              fontSize: "14px",
            }}
          >
            💬 Support
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          padding: "30px",
          overflowY: "auto",
          backgroundColor: "#0f172a",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <h1
            style={{
              margin: "0 0 8px 0",
              fontSize: "28px",
              fontWeight: "700",
              color: "#f1f5f9",
            }}
          >
            🚗 Proactive Vehicle Maintenance Dashboard
          </h1>
          <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8" }}>
            Real-time ML-powered diagnostics • Updates every 1 second
          </p>
        </div>

        {/* Connection Status Banner */}
        <div
          style={{
            padding: "12px 20px",
            backgroundColor:
              pollingStatus === "CONNECTED" ? "#dcfce7" : "#fee2e2",
            borderRadius: "8px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: `1px solid ${
              pollingStatus === "CONNECTED" ? "#bbf7d0" : "#fecaca"
            }`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <StatusIndicator status={pollingStatus.toLowerCase()} label="" />
            <span
              style={{
                fontWeight: "600",
                color: pollingStatus === "CONNECTED" ? "#166534" : "#991b1b",
              }}
            >
              {pollingStatus === "CONNECTED"
                ? "Live Data Streaming"
                : "Waiting for Vehicle Data..."}
            </span>
            {rawData && (
              <span style={{ fontSize: "12px", color: "#6b7280" }}>
                Last Update: {new Date(rawData.timestamp).toLocaleTimeString()}
              </span>
            )}
          </div>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            Data Quality: {fmt(rawData?.data_quality_score, 0)}%
          </div>
        </div>

        {/* ML Prediction Section */}
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "24px",
            borderRadius: "12px",
            border: "2px solid #3b82f6",
            boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.1)",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "20px",
            }}
          >
            <span style={{ fontSize: "24px" }}>🤖</span>
            <h2
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: "700",
                color: "#1e40af",
              }}
            >
              Random Forest ML Prediction
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
            }}
          >
            {/* Health Score with Donut Chart */}
            <div
              style={{
                padding: "20px",
                backgroundColor: "#eff6ff",
                borderRadius: "8px",
                border: "1px solid #bfdbfe",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <DonutProgress
                size={80}
                stroke={8}
                percent={rawData?.ml_health_score || 0}
                color={
                  (rawData?.ml_health_score || 0) >= 80
                    ? "#10b981"
                    : (rawData?.ml_health_score || 0) >= 60
                    ? "#f59e0b"
                    : "#ef4444"
                }
                bg="#e0e7ff"
              />
              <div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#1e40af",
                    fontWeight: "600",
                  }}
                >
                  ML Health Score
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    marginTop: "4px",
                  }}
                >
                  {(rawData?.ml_health_score || 0) >= 80
                    ? "Excellent"
                    : (rawData?.ml_health_score || 0) >= 60
                    ? "Good"
                    : (rawData?.ml_health_score || 0) >= 40
                    ? "Fair"
                    : "Poor"}
                </div>
              </div>
            </div>

            {/* ML Status */}
            <div
              style={{
                padding: "20px",
                backgroundColor: mlStatus.bg,
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                {mlStatus.icon}
              </div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: mlStatus.color,
                  marginBottom: "4px",
                }}
              >
                {mlStatus.text}
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>
                ML Prediction
              </div>
            </div>

            {/* System Status */}
            <div
              style={{
                padding: "20px",
                backgroundColor: sysStatus.bg,
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                {sysStatus.icon}
              </div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: sysStatus.color,
                  marginBottom: "4px",
                }}
              >
                {sysStatus.text}
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>
                System Status
              </div>
            </div>

            {/* DTCs */}
            <div
              style={{
                padding: "20px",
                backgroundColor: rawData?.dtc_count > 0 ? "#fee2e2" : "#dcfce7",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "48px",
                  fontWeight: "700",
                  color: rawData?.dtc_count > 0 ? "#dc2626" : "#10b981",
                  marginBottom: "4px",
                }}
              >
                {fmt(rawData?.dtc_count, 0)}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#374151",
                  fontWeight: "600",
                }}
              >
                Trouble Codes
              </div>
              <div
                style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}
              >
                {rawData?.dtc_count > 0 ? "Check Engine" : "All Clear"}
              </div>
            </div>
          </div>

          {/* ML Alerts */}
          {rawData?.ml_alerts && rawData.ml_alerts.length > 0 && (
            <div
              style={{
                marginTop: "20px",
                padding: "16px",
                backgroundColor: "#fffbeb",
                borderRadius: "8px",
                border: "1px solid #fef3c7",
              }}
            >
              <h3
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#92400e",
                }}
              >
                🔔 Active ML Alerts:
              </h3>
              {rawData.ml_alerts.map((alert, idx) => (
                <div
                  key={idx}
                  style={{
                    fontSize: "13px",
                    color: "#78350f",
                    marginBottom: "4px",
                  }}
                >
                  • {alert}
                </div>
              ))}
            </div>
          )}

          {/* Fault Type */}
          {rawData?.fault_type && (
            <div
              style={{
                marginTop: "12px",
                fontSize: "13px",
                color: "#6b7280",
                textAlign: "center",
              }}
            >
              <strong>Detected Issue:</strong> {rawData.fault_type}
            </div>
          )}
        </div>

        {/* ML Model Features Section */}
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            <span style={{ fontSize: "20px" }}>🧠</span>
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: "700",
                color: "#374151",
              }}
            >
              ML Model Input Features
            </h2>
            <span
              style={{ fontSize: "12px", color: "#6b7280", marginLeft: "auto" }}
            >
              Primary data used by Random Forest model
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
            }}
          >
            {/* RPM */}
            <div
              style={{
                padding: "16px",
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  marginBottom: "4px",
                  fontWeight: "500",
                }}
              >
                Engine RPM
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.rpm, 1)}
              </div>
              <div
                style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}
              >
                Revolutions/min
              </div>
            </div>

            {/* Coolant Temperature */}
            <div
              style={{
                padding: "16px",
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  marginBottom: "4px",
                  fontWeight: "500",
                }}
              >
                Coolant Temp
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.coolant_temp, 1)}°C
              </div>
              <div
                style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}
              >
                Primary feature
              </div>
            </div>

            {/* Engine Load */}
            <div
              style={{
                padding: "16px",
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  marginBottom: "4px",
                  fontWeight: "500",
                }}
              >
                Engine Load
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.engine_load, 1)}%
              </div>
              <div
                style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}
              >
                Load percentage
              </div>
            </div>

            {/* Throttle Position */}
            <div
              style={{
                padding: "16px",
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  marginBottom: "4px",
                  fontWeight: "500",
                }}
              >
                Throttle Position
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.throttle_pos, 1)}%
              </div>
              <div
                style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}
              >
                Pedal position
              </div>
            </div>
          </div>
        </div>

        {/* Calculated Metrics Section */}
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            <span style={{ fontSize: "20px" }}>📊</span>
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: "700",
                color: "#374151",
              }}
            >
              Calculated Performance Metrics
            </h2>
            <span
              style={{ fontSize: "12px", color: "#6b7280", marginLeft: "auto" }}
            >
              Derived features for ML analysis
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
            }}
          >
            {/* Load/RPM Ratio */}
            <div
              style={{
                padding: "16px",
                backgroundColor: "#fef3c7",
                borderRadius: "8px",
                border: "1px solid #fde68a",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#92400e",
                  marginBottom: "4px",
                  fontWeight: "500",
                }}
              >
                Load/RPM Ratio
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#78350f",
                }}
              >
                {fmt(rawData?.load_rpm_ratio, 2)}
              </div>
              <div
                style={{ fontSize: "11px", color: "#92400e", marginTop: "2px" }}
              >
                Efficiency metric
              </div>
            </div>

            {/* Temperature Gradient */}
            <div
              style={{
                padding: "16px",
                backgroundColor: "#dbeafe",
                borderRadius: "8px",
                border: "1px solid #bfdbfe",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#1e40af",
                  marginBottom: "4px",
                  fontWeight: "500",
                }}
              >
                Temp Gradient
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#1e3a8a",
                }}
              >
                {fmt(rawData?.temp_gradient, 2)}°C
              </div>
              <div
                style={{ fontSize: "11px", color: "#1e40af", marginTop: "2px" }}
              >
                Change rate
              </div>
            </div>

            {/* Throttle Response */}
            <div
              style={{
                padding: "16px",
                backgroundColor: "#e0e7ff",
                borderRadius: "8px",
                border: "1px solid #c7d2fe",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#4338ca",
                  marginBottom: "4px",
                  fontWeight: "500",
                }}
              >
                Throttle Response
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#3730a3",
                }}
              >
                {fmt(rawData?.throttle_response, 3)}
              </div>
              <div
                style={{ fontSize: "11px", color: "#4338ca", marginTop: "2px" }}
              >
                Response ratio
              </div>
            </div>

            {/* Engine Stress Score */}
            <div
              style={{
                padding: "16px",
                backgroundColor: "#fee2e2",
                borderRadius: "8px",
                border: "1px solid #fecaca",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#991b1b",
                  marginBottom: "4px",
                  fontWeight: "500",
                }}
              >
                Engine Stress
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#7f1d1d",
                }}
              >
                {fmt(rawData?.engine_stress_score, 1)}
              </div>
              <div
                style={{ fontSize: "11px", color: "#991b1b", marginTop: "2px" }}
              >
                Stress level
              </div>
            </div>
          </div>
        </div>

        {/* Essential Sensor Data */}
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            <span style={{ fontSize: "20px" }}>🔧</span>
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: "700",
                color: "#374151",
              }}
            >
              Essential Sensor Readings
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "12px",
            }}
          >
            <div
              style={{
                padding: "12px",
                backgroundColor: "#f9fafb",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                  marginBottom: "4px",
                }}
              >
                Vehicle Speed
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.vehicle_speed, 1)} km/h
              </div>
            </div>

            <div
              style={{
                padding: "12px",
                backgroundColor: "#f9fafb",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                  marginBottom: "4px",
                }}
              >
                Intake Temp
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.intake_temp, 1)}°C
              </div>
            </div>

            <div
              style={{
                padding: "12px",
                backgroundColor: "#f9fafb",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                  marginBottom: "4px",
                }}
              >
                Timing Advance
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.timing_advance, 1)}°
              </div>
            </div>

            <div
              style={{
                padding: "12px",
                backgroundColor: "#f9fafb",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                  marginBottom: "4px",
                }}
              >
                O2 Sensor
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.o2_sensor_2, 2)}V
              </div>
            </div>

            <div
              style={{
                padding: "12px",
                backgroundColor: "#f9fafb",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                  marginBottom: "4px",
                }}
              >
                Catalyst Temp
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.catalyst_temp, 0)}°C
              </div>
            </div>

            <div
              style={{
                padding: "12px",
                backgroundColor: "#f9fafb",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                  marginBottom: "4px",
                }}
              >
                Baro Pressure
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.barometric_pressure, 1)} kPa
              </div>
            </div>

            <div
              style={{
                padding: "12px",
                backgroundColor: "#f9fafb",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                  marginBottom: "4px",
                }}
              >
                MAF (Mass Air Flow)
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.maf, 2)} g/s
              </div>
            </div>

            <div
              style={{
                padding: "12px",
                backgroundColor: "#f9fafb",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                  marginBottom: "4px",
                }}
              >
                MAP (Manifold Pressure)
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.map, 1)} kPa
              </div>
            </div>

            <div
              style={{
                padding: "12px",
                backgroundColor: "#f9fafb",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                  marginBottom: "4px",
                }}
              >
                O₂ Sensor 1
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.o2_sensor_1, 2)}V
              </div>
            </div>

            <div
              style={{
                padding: "12px",
                backgroundColor: "#f9fafb",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                  marginBottom: "4px",
                }}
              >
                Fuel Level
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.fuel_level, 1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Fuel System */}
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            <span style={{ fontSize: "20px" }}>⛽</span>
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: "700",
                color: "#374151",
              }}
            >
              Fuel System
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "12px",
            }}
          >
            <div
              style={{
                padding: "12px",
                backgroundColor: "#f9fafb",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                  marginBottom: "4px",
                }}
              >
                Fuel Pressure
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.fuel_pressure, 1)} psi
              </div>
            </div>

            <div
              style={{
                padding: "12px",
                backgroundColor: "#f9fafb",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                  marginBottom: "4px",
                }}
              >
                Fuel Efficiency
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.fuel_efficiency, 1)}%
              </div>
            </div>

            <div
              style={{
                padding: "12px",
                backgroundColor: "#f9fafb",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                  marginBottom: "4px",
                }}
              >
                Short Fuel Trim
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.fuel_trim_short, 2)}%
              </div>
            </div>

            <div
              style={{
                padding: "12px",
                backgroundColor: "#f9fafb",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                  marginBottom: "4px",
                }}
              >
                Long Fuel Trim
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.fuel_trim_long, 2)}%
              </div>
            </div>

            <div
              style={{
                padding: "12px",
                backgroundColor: "#f9fafb",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                  marginBottom: "4px",
                }}
              >
                Fuel System Status
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#10b981",
                  marginTop: "4px",
                }}
              >
                {rawData?.fuel_system_status || "N/A"}
              </div>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            <span style={{ fontSize: "20px" }}>⚙️</span>
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: "700",
                color: "#374151",
              }}
            >
              System Information
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "12px",
            }}
          >
            <div
              style={{
                padding: "12px",
                backgroundColor: "#f9fafb",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                  marginBottom: "4px",
                }}
              >
                Control Module Voltage
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.control_module_voltage, 1)}V
              </div>
            </div>

            <div
              style={{
                padding: "12px",
                backgroundColor: "#f9fafb",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                  marginBottom: "4px",
                }}
              >
                Engine Runtime
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.engine_runtime, 0)} sec
              </div>
            </div>

            <div
              style={{
                padding: "12px",
                backgroundColor: "#f9fafb",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                  marginBottom: "4px",
                }}
              >
                EGR Error
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.egr_error, 2)}%
              </div>
            </div>

            <div
              style={{
                padding: "12px",
                backgroundColor: "#f9fafb",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                  marginBottom: "4px",
                }}
              >
                Session ID
              </div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "500",
                  color: "#111827",
                  marginTop: "4px",
                  wordBreak: "break-all",
                }}
              >
                {rawData?.session_id || "N/A"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
