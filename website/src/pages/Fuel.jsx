import React, { useEffect, useState } from "react";
import DonutProgress from "../components/DonutProgress";

export default function Fuel({ onNavigate }) {
  const [rawData, setRawData] = useState(null);
  const [pollingStatus, setPollingStatus] = useState("WAITING");
  const [lastUpdate, setLastUpdate] = useState(null);

  // Poll for latest data every 30 seconds
  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_BASE =
          process.env.REACT_APP_API_URL || "http://localhost:5000";
        const response = await fetch(`${API_BASE}/api/latest`);
        const result = await response.json();

        if (result.success && result.data) {
          setRawData(result.data);
          setPollingStatus("CONNECTED");
          setLastUpdate(new Date());
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

    // Poll every 30 seconds
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, []);

  // Show N/A when not connected
  const shouldShowNA = pollingStatus !== "CONNECTED" || !rawData;

  // Helper function to format numbers
  const fmt = (value, decimals = 1) => {
    if (shouldShowNA || value === null || value === undefined) return "N/A";
    return typeof value === "number" ? value.toFixed(decimals) : value;
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#0f172a",
        color: "#e2e8f0",
      }}
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

        <button
          onClick={() => onNavigate("Dashboard")}
          style={{
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
          📊 Dashboard
        </button>

        <button
          onClick={() => onNavigate("Engine")}
          style={{
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
          style={{
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
          ⛽ Fuel
        </button>

        <button
          onClick={() => onNavigate("Emissions")}
          style={{
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
            ⛽ Fuel System Diagnostics
          </h1>
          <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8" }}>
            Comprehensive fuel system monitoring • Updates every 30 seconds
          </p>
        </div>

        {/* Connection Status */}
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
          <span
            style={{
              fontWeight: "600",
              color: pollingStatus === "CONNECTED" ? "#166534" : "#991b1b",
            }}
          >
            {pollingStatus === "CONNECTED"
              ? "✅ Connected"
              : "⏳ Waiting for data..."}
          </span>
          {lastUpdate && (
            <span style={{ fontSize: "12px", color: "#6b7280" }}>
              Last Update: {lastUpdate.toLocaleTimeString()} • Next:{" "}
              {new Date(lastUpdate.getTime() + 30000).toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Fuel System Status */}
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
          <h2
            style={{
              margin: "0 0 16px 0",
              fontSize: "18px",
              fontWeight: "700",
              color: "#374151",
            }}
          >
            🔍 Fuel System Status
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "16px",
            }}
          >
            <div
              style={{
                padding: "20px",
                backgroundColor: "#f0fdf4",
                borderRadius: "8px",
                border: "2px solid #86efac",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  color: "#166534",
                  marginBottom: "8px",
                  fontWeight: "600",
                }}
              >
                System Status
              </div>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: "700",
                  color: "#15803d",
                }}
              >
                {rawData?.fuel_system_status || "N/A"}
              </div>
              <div
                style={{ fontSize: "12px", color: "#4ade80", marginTop: "4px" }}
              >
                {rawData?.fuel_system_status === "Closed Loop"
                  ? "Normal Operation"
                  : "Check System"}
              </div>
            </div>

            <div
              style={{
                padding: "20px",
                backgroundColor: "#fef3c7",
                borderRadius: "8px",
                border: "1px solid #fde68a",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  color: "#92400e",
                  marginBottom: "8px",
                  fontWeight: "600",
                }}
              >
                Fuel Efficiency
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <DonutProgress
                  size={70}
                  stroke={7}
                  percent={rawData?.fuel_efficiency || 0}
                  color={
                    (rawData?.fuel_efficiency || 0) >= 70
                      ? "#10b981"
                      : (rawData?.fuel_efficiency || 0) >= 40
                      ? "#f59e0b"
                      : "#ef4444"
                  }
                  bg="#fde68a"
                />
                <div>
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: "700",
                      color: "#78350f",
                    }}
                  >
                    {fmt(rawData?.fuel_efficiency, 0)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fuel Delivery */}
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
          <h2
            style={{
              margin: "0 0 16px 0",
              fontSize: "18px",
              fontWeight: "700",
              color: "#374151",
            }}
          >
            💧 Fuel Delivery
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
            }}
          >
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
                Fuel Pressure
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "600",
                  color: "#1e3a8a",
                }}
              >
                {fmt(rawData?.fuel_pressure, 1)}
              </div>
              <div
                style={{ fontSize: "11px", color: "#1e40af", marginTop: "2px" }}
              >
                psi
              </div>
            </div>

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
                Fuel Level
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.fuel_level, 1)}
              </div>
              <div
                style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}
              >
                % (if available)
              </div>
            </div>
          </div>
        </div>

        {/* Fuel Trim - Short Term */}
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
          <h2
            style={{
              margin: "0 0 16px 0",
              fontSize: "18px",
              fontWeight: "700",
              color: "#374151",
            }}
          >
            ⚡ Short-Term Fuel Trim (STFT)
          </h2>
          <div
            style={{
              padding: "20px",
              backgroundColor: "#f0fdf4",
              borderRadius: "8px",
              border: "1px solid #bbf7d0",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#166534",
                    fontWeight: "600",
                  }}
                >
                  Current Trim Value
                </div>
                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: "700",
                    color: "#15803d",
                    marginTop: "4px",
                  }}
                >
                  {fmt(rawData?.fuel_trim_short, 2)}%
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    marginBottom: "4px",
                  }}
                >
                  Status
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    backgroundColor:
                      Math.abs(rawData?.fuel_trim_short || 0) < 5
                        ? "#dcfce7"
                        : Math.abs(rawData?.fuel_trim_short || 0) < 10
                        ? "#fef3c7"
                        : "#fee2e2",
                    color:
                      Math.abs(rawData?.fuel_trim_short || 0) < 5
                        ? "#166534"
                        : Math.abs(rawData?.fuel_trim_short || 0) < 10
                        ? "#92400e"
                        : "#991b1b",
                  }}
                >
                  {Math.abs(rawData?.fuel_trim_short || 0) < 5
                    ? "✅ Normal"
                    : Math.abs(rawData?.fuel_trim_short || 0) < 10
                    ? "⚠️ Monitor"
                    : "🔴 Check"}
                </div>
              </div>
            </div>
            <div
              style={{ fontSize: "12px", color: "#6b7280", lineHeight: "1.5" }}
            >
              <strong>What is STFT?</strong> Short-term fuel trim shows
              immediate fuel mixture adjustments. Values between -5% and +5% are
              normal. Positive values indicate the ECU is adding fuel (lean
              condition), negative values mean reducing fuel (rich condition).
            </div>
          </div>
        </div>

        {/* Fuel Trim - Long Term */}
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
          <h2
            style={{
              margin: "0 0 16px 0",
              fontSize: "18px",
              fontWeight: "700",
              color: "#374151",
            }}
          >
            📊 Long-Term Fuel Trim (LTFT)
          </h2>
          <div
            style={{
              padding: "20px",
              backgroundColor: "#eff6ff",
              borderRadius: "8px",
              border: "1px solid #bfdbfe",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#1e40af",
                    fontWeight: "600",
                  }}
                >
                  Learned Trim Value
                </div>
                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: "700",
                    color: "#1e3a8a",
                    marginTop: "4px",
                  }}
                >
                  {fmt(rawData?.fuel_trim_long, 2)}%
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    marginBottom: "4px",
                  }}
                >
                  Status
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    backgroundColor:
                      Math.abs(rawData?.fuel_trim_long || 0) < 8
                        ? "#dcfce7"
                        : Math.abs(rawData?.fuel_trim_long || 0) < 15
                        ? "#fef3c7"
                        : "#fee2e2",
                    color:
                      Math.abs(rawData?.fuel_trim_long || 0) < 8
                        ? "#166534"
                        : Math.abs(rawData?.fuel_trim_long || 0) < 15
                        ? "#92400e"
                        : "#991b1b",
                  }}
                >
                  {Math.abs(rawData?.fuel_trim_long || 0) < 8
                    ? "✅ Excellent"
                    : Math.abs(rawData?.fuel_trim_long || 0) < 15
                    ? "⚠️ Acceptable"
                    : "🔴 Attention Needed"}
                </div>
              </div>
            </div>
            <div
              style={{ fontSize: "12px", color: "#6b7280", lineHeight: "1.5" }}
            >
              <strong>What is LTFT?</strong> Long-term fuel trim represents
              learned adjustments over time. Values between -8% and +8% are
              excellent. Values outside ±15% may indicate issues like vacuum
              leaks, faulty O2 sensors, or fuel delivery problems.
            </div>
          </div>
        </div>

        {/* Fuel Trim Interpretation */}
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
          <h2
            style={{
              margin: "0 0 16px 0",
              fontSize: "18px",
              fontWeight: "700",
              color: "#374151",
            }}
          >
            🎯 Fuel Trim Analysis
          </h2>
          <div style={{ display: "grid", gap: "12px" }}>
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
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "6px",
                }}
              >
                Combined Trim Status
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  lineHeight: "1.6",
                }}
              >
                {(() => {
                  const stft = Math.abs(rawData?.fuel_trim_short || 0);
                  const ltft = Math.abs(rawData?.fuel_trim_long || 0);

                  if (stft < 5 && ltft < 8) {
                    return "✅ Excellent: Both short and long-term trims are within normal range. Fuel system is operating optimally.";
                  } else if (stft < 10 && ltft < 15) {
                    return "⚠️ Good: Trims are acceptable. Monitor for any trends. May indicate minor adjustments due to fuel quality or driving conditions.";
                  } else {
                    return "🔴 Attention: One or both trims are outside normal range. Possible issues: vacuum leak, MAF sensor, O2 sensor, fuel pressure, or injector problems. Professional diagnosis recommended.";
                  }
                })()}
              </div>
            </div>

            {/* Visual Guide */}
            <div
              style={{
                padding: "16px",
                backgroundColor: "#fefce8",
                borderRadius: "8px",
                border: "1px solid #fef08a",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#854d0e",
                  marginBottom: "8px",
                }}
              >
                📚 Quick Reference Guide
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#78350f",
                  lineHeight: "1.8",
                }}
              >
                <div>
                  <strong>Positive Values (+):</strong> ECU adding more fuel
                  (mixture too lean)
                </div>
                <div>
                  <strong>Negative Values (-):</strong> ECU reducing fuel
                  (mixture too rich)
                </div>
                <div>
                  <strong>High Positive STFT & LTFT:</strong> Vacuum leak, weak
                  fuel pump, clogged filter
                </div>
                <div>
                  <strong>High Negative STFT & LTFT:</strong> Leaking injectors,
                  high fuel pressure, faulty MAF
                </div>
                <div>
                  <strong>High STFT, Normal LTFT:</strong> Recent change or
                  transient condition
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Sensors */}
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2
            style={{
              margin: "0 0 16px 0",
              fontSize: "18px",
              fontWeight: "700",
              color: "#374151",
            }}
          >
            🔬 Related Sensors
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
            }}
          >
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
                O2 Sensor
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.o2_sensor_2, 3)}V
              </div>
              <div
                style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}
              >
                Oxygen feedback
              </div>
            </div>

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
                Driver demand
              </div>
            </div>

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
                Current load
              </div>
            </div>

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
                MAF (if available)
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.maf, 2)}
              </div>
              <div
                style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}
              >
                g/s airflow
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
