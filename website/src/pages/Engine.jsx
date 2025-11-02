import React, { useEffect, useState } from "react";

export default function Engine({ onNavigate }) {
  const [rawData, setRawData] = useState(null);
  const [pollingStatus, setPollingStatus] = useState("WAITING");
  const [lastUpdate, setLastUpdate] = useState(null);

  // Poll for latest data every 30 seconds (detailed diagnostics don't need real-time)
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
          🔧 Engine
        </button>

        <button
          onClick={() => onNavigate("Fuel")}
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
            🔧 Engine Diagnostics
          </h1>
          <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8" }}>
            Detailed engine analysis • Updates every 30 seconds
          </p>
        </div>

        {/* Connection Status */}
        <div
          style={{
            padding: "12px 20px",
            backgroundColor:
              pollingStatus === "CONNECTED" ? "#064e3b" : "#7f1d1d",
            borderRadius: "8px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: `1px solid ${
              pollingStatus === "CONNECTED" ? "#10b981" : "#ef4444"
            }`,
          }}
        >
          <span
            style={{
              fontWeight: "600",
              color: pollingStatus === "CONNECTED" ? "#10b981" : "#fca5a5",
            }}
          >
            {pollingStatus === "CONNECTED"
              ? "✅ Connected"
              : "⏳ Waiting for data..."}
          </span>
          {lastUpdate && (
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>
              Last Update: {lastUpdate.toLocaleTimeString()} • Next:{" "}
              {new Date(lastUpdate.getTime() + 30000).toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Core Engine Metrics */}
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
            ⚙️ Core Engine Metrics
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
                Engine RPM
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.rpm, 0)}
              </div>
              <div
                style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}
              >
                Revolutions/min
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
                  fontSize: "28px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.engine_load, 1)}%
              </div>
              <div
                style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}
              >
                Calculated load
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
                  fontSize: "28px",
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
                Vehicle Speed
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.vehicle_speed, 0)}
              </div>
              <div
                style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}
              >
                km/h
              </div>
            </div>
          </div>
        </div>

        {/* Temperature Monitoring */}
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
            🌡️ Temperature Monitoring
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
                Coolant Temperature
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "600",
                  color: "#78350f",
                }}
              >
                {fmt(rawData?.coolant_temp, 1)}°C
              </div>
              <div
                style={{ fontSize: "11px", color: "#92400e", marginTop: "2px" }}
              >
                Engine coolant
              </div>
            </div>

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
                Intake Air Temp
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "600",
                  color: "#1e3a8a",
                }}
              >
                {fmt(rawData?.intake_temp, 1)}°C
              </div>
              <div
                style={{ fontSize: "11px", color: "#1e40af", marginTop: "2px" }}
              >
                Manifold air
              </div>
            </div>

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
                Catalyst Temp
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "600",
                  color: "#7f1d1d",
                }}
              >
                {fmt(rawData?.catalyst_temp, 0)}°C
              </div>
              <div
                style={{ fontSize: "11px", color: "#991b1b", marginTop: "2px" }}
              >
                Catalytic converter
              </div>
            </div>

            <div
              style={{
                padding: "16px",
                backgroundColor: "#f3e8ff",
                borderRadius: "8px",
                border: "1px solid #e9d5ff",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#6b21a8",
                  marginBottom: "4px",
                  fontWeight: "500",
                }}
              >
                Temp Gradient
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "600",
                  color: "#581c87",
                }}
              >
                {fmt(rawData?.temp_gradient, 2)}°C
              </div>
              <div
                style={{ fontSize: "11px", color: "#6b21a8", marginTop: "2px" }}
              >
                Change rate
              </div>
            </div>
          </div>
        </div>

        {/* Timing & Ignition */}
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
            ⚡ Timing & Ignition System
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
                Timing Advance
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.timing_advance, 1)}°
              </div>
              <div
                style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}
              >
                Before TDC
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
                Control Module Voltage
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.control_module_voltage, 2)}V
              </div>
              <div
                style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}
              >
                ECU power
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
                Engine Runtime
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.engine_runtime, 0)}
              </div>
              <div
                style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}
              >
                Seconds
              </div>
            </div>
          </div>
        </div>

        {/* Pressure & Airflow */}
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
            💨 Pressure & Airflow
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
                Barometric Pressure
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.barometric_pressure, 1)}
              </div>
              <div
                style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}
              >
                kPa
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
                MAP (If Available)
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.map, 1)}
              </div>
              <div
                style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}
              >
                kPa
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
                MAF (If Available)
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.maf, 2)}
              </div>
              <div
                style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}
              >
                g/s
              </div>
            </div>
          </div>
        </div>

        {/* Emissions & EGR */}
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
            🌿 Emissions & EGR System
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
                  fontSize: "28px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.o2_sensor_2, 3)}V
              </div>
              <div
                style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}
              >
                Oxygen sensor 2
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
                EGR Error
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.egr_error, 2)}%
              </div>
              <div
                style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}
              >
                Exhaust gas recirculation
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
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
            📈 Calculated Performance Metrics
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
                Load/RPM Ratio
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "600",
                  color: "#3730a3",
                }}
              >
                {fmt(rawData?.load_rpm_ratio, 2)}
              </div>
              <div
                style={{ fontSize: "11px", color: "#4338ca", marginTop: "2px" }}
              >
                Efficiency metric
              </div>
            </div>

            <div
              style={{
                padding: "16px",
                backgroundColor: "#fce7f3",
                borderRadius: "8px",
                border: "1px solid #fbcfe8",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#9f1239",
                  marginBottom: "4px",
                  fontWeight: "500",
                }}
              >
                Throttle Response
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "600",
                  color: "#881337",
                }}
              >
                {fmt(rawData?.throttle_response, 3)}
              </div>
              <div
                style={{ fontSize: "11px", color: "#9f1239", marginTop: "2px" }}
              >
                Response ratio
              </div>
            </div>

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
                Engine Stress Score
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "600",
                  color: "#7f1d1d",
                }}
              >
                {fmt(rawData?.engine_stress_score, 1)}
              </div>
              <div
                style={{ fontSize: "11px", color: "#991b1b", marginTop: "2px" }}
              >
                Composite metric
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
