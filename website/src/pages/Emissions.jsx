import React, { useEffect, useState } from "react";

export default function Emissions({ onNavigate }) {
  const [rawData, setRawData] = useState(null);
  const [pollingStatus, setPollingStatus] = useState("WAITING");

  // Poll for latest data every 1 second
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

    // Poll every 1 second
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

  // Get emission status based on values
  const getEmissionStatus = () => {
    if (shouldShowNA) return { label: "Unknown", color: "#6b7280" };

    const o2_1 = parseFloat(rawData?.o2_sensor_1 || 0);
    const o2_2 = parseFloat(rawData?.o2_sensor_2 || 0);
    const catalystTemp = parseFloat(rawData?.catalyst_temp || 0);

    // Check for critical issues
    if (catalystTemp > 900 || o2_1 < 0.1 || o2_2 < 0.1) {
      return { label: "At Risk", color: "#e74c3c" };
    }

    // Check for moderate issues
    if (catalystTemp > 800 || o2_1 < 0.3 || o2_2 < 0.3) {
      return { label: "Moderate", color: "#f1c40f" };
    }

    return { label: "Healthy", color: "#2ecc71" };
  };

  const emissionStatus = getEmissionStatus();

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
            onClick={() => onNavigate("Dashboard")}
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <span style={{ fontSize: "24px" }}>🌿</span>
            <h1
              style={{
                margin: 0,
                fontSize: "28px",
                fontWeight: "700",
                color: "#f1f5f9",
              }}
            >
              Emissions Control
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8" }}>
            Monitor your vehicle's emissions for optimal environmental health
          </p>
        </div>

        {/* Status Badges */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              paddingHorizontal: "12px",
              paddingVertical: "6px",
              backgroundColor:
                emissionStatus.color === "#2ecc71"
                  ? "#dcfce7"
                  : emissionStatus.color === "#f1c40f"
                  ? "#fef3c7"
                  : "#fee2e2",
              border: `1px solid ${emissionStatus.color}`,
              borderRadius: "999px",
              padding: "8px 16px",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: emissionStatus.color,
              }}
            />
            <span
              style={{
                fontWeight: "700",
                color: emissionStatus.color,
                fontSize: "14px",
              }}
            >
              {emissionStatus.label}
            </span>
          </div>
        </div>

        {/* Main Emissions Card */}
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
              marginBottom: "20px",
            }}
          >
            <span style={{ fontSize: "20px" }}>🌍</span>
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: "700",
                color: "#374151",
              }}
            >
              Emission Sensor Readings
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "16px",
            }}
          >
            {/* O2 Sensor 1 */}
            <div
              style={{
                padding: "16px",
                backgroundColor: "#E9F5FF",
                borderRadius: "12px",
                border: "1px solid #E6E9ED",
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "#38bdf8",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                }}
              >
                ⚡
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#637783",
                    fontWeight: "600",
                    marginBottom: "4px",
                  }}
                >
                  O₂ Sensor 1 Voltage
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "800",
                    color: "#123B4A",
                  }}
                >
                  {fmt(rawData?.o2_sensor_1, 2)}V
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#6b7280",
                    marginTop: "2px",
                  }}
                >
                  Bank 1 Sensor 1
                </div>
              </div>
            </div>

            {/* O2 Sensor 2 */}
            <div
              style={{
                padding: "16px",
                backgroundColor: "#EAF6EC",
                borderRadius: "12px",
                border: "1px solid #E6E9ED",
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "#2ecc71",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                }}
              >
                📈
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#637783",
                    fontWeight: "600",
                    marginBottom: "4px",
                  }}
                >
                  O₂ Sensor 2 Voltage
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "800",
                    color: "#123B4A",
                  }}
                >
                  {fmt(rawData?.o2_sensor_2, 2)}V
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#6b7280",
                    marginTop: "2px",
                  }}
                >
                  Bank 1 Sensor 2
                </div>
              </div>
            </div>

            {/* Catalyst Temperature */}
            <div
              style={{
                padding: "16px",
                backgroundColor: "#FFEFF2",
                borderRadius: "12px",
                border: "1px solid #E6E9ED",
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "#e74c3c",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                }}
              >
                🌡️
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#637783",
                    fontWeight: "600",
                    marginBottom: "4px",
                  }}
                >
                  Catalyst Temperature
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "800",
                    color: "#123B4A",
                  }}
                >
                  {fmt(rawData?.catalyst_temp, 0)}°C
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#6b7280",
                    marginTop: "2px",
                  }}
                >
                  Catalytic converter
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Emission-Related Data */}
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
              marginBottom: "20px",
            }}
          >
            <span style={{ fontSize: "20px" }}>🔬</span>
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: "700",
                color: "#374151",
              }}
            >
              Related Emission Metrics
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
            }}
          >
            {/* Short-Term Fuel Trim */}
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
                  fontSize: "11px",
                  color: "#6b7280",
                  marginBottom: "4px",
                  fontWeight: "500",
                }}
              >
                Short-Term Fuel Trim
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.fuel_trim_short, 2)}%
              </div>
              <div
                style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}
              >
                Immediate adjustment
              </div>
            </div>

            {/* Long-Term Fuel Trim */}
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
                  fontSize: "11px",
                  color: "#6b7280",
                  marginBottom: "4px",
                  fontWeight: "500",
                }}
              >
                Long-Term Fuel Trim
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.fuel_trim_long, 2)}%
              </div>
              <div
                style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}
              >
                Long-term adjustment
              </div>
            </div>

            {/* EGR Error */}
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
                  fontSize: "11px",
                  color: "#6b7280",
                  marginBottom: "4px",
                  fontWeight: "500",
                }}
              >
                EGR Error
              </div>
              <div
                style={{
                  fontSize: "24px",
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

            {/* Barometric Pressure */}
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
                  fontSize: "11px",
                  color: "#6b7280",
                  marginBottom: "4px",
                  fontWeight: "500",
                }}
              >
                Barometric Pressure
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.barometric_pressure, 1)} kPa
              </div>
              <div
                style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}
              >
                Atmospheric pressure
              </div>
            </div>

            {/* MAF (Mass Air Flow) */}
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
                  fontSize: "11px",
                  color: "#6b7280",
                  marginBottom: "4px",
                  fontWeight: "500",
                }}
              >
                Mass Air Flow (MAF)
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.maf, 2)} g/s
              </div>
              <div
                style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}
              >
                Air intake flow rate
              </div>
            </div>

            {/* Intake Air Temperature */}
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
                  fontSize: "11px",
                  color: "#6b7280",
                  marginBottom: "4px",
                  fontWeight: "500",
                }}
              >
                Intake Air Temperature
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {fmt(rawData?.intake_temp, 1)}°C
              </div>
              <div
                style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}
              >
                Air temperature entering engine
              </div>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div
          style={{
            backgroundColor: "#eff6ff",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #bfdbfe",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <div style={{ fontSize: "24px" }}>ℹ️</div>
            <div>
              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#1e40af",
                }}
              >
                About Emissions Monitoring
              </h3>
              <p style={{ margin: 0, fontSize: "14px", color: "#1e3a8a" }}>
                O₂ sensors monitor oxygen levels in exhaust gases to optimize
                fuel efficiency and reduce emissions. The catalytic converter
                reduces harmful pollutants. Healthy readings indicate proper
                emissions control system operation.
              </p>
              <div
                style={{
                  marginTop: "12px",
                  fontSize: "13px",
                  color: "#1e40af",
                }}
              >
                <strong>Normal ranges:</strong>
                <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
                  <li>O₂ Sensor: 0.1V - 0.9V (fluctuating)</li>
                  <li>Catalyst Temp: 400°C - 800°C</li>
                  <li>Fuel Trim: -10% to +10%</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
