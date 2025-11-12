import React, { useEffect, useState } from "react";
import sensorDataService from "../services/sensorData";
import { vehicleMLService } from "../services/vehicleML";

export default function Dashboard({ onNavigate }) {
  const [sensorData, setSensorData] = useState(null);
  const [pollingStatus, setPollingStatus] = useState("WAITING");

  useEffect(() => {
    console.log("📊 Dashboard - Setting up sensor data subscription");
    const unsubscribe = sensorDataService.subscribeToSensorData(1, (data) => {
      if (data) {
        setSensorData(data);
        setPollingStatus("CONNECTED");
      } else {
        setPollingStatus("WAITING");
      }
    });
    return () => unsubscribe();
  }, []);

  const fmt = (value, decimals = 1) => {
    if (
      pollingStatus !== "CONNECTED" ||
      !sensorData ||
      value === null ||
      value === undefined ||
      value === 0
    )
      return "N/A";
    if (typeof value === "number") return value.toFixed(decimals);
    return value;
  };

  const healthScore = sensorData?.healthScoreDisplay ?? null;
  const mlStatus = sensorData?.mlStatus || sensorData?.status || "UNKNOWN";
  const hasAnyStatus = Boolean(sensorData?.mlStatus || sensorData?.status);
  const statusDisplay = hasAnyStatus
    ? vehicleMLService.getStatusDisplay(mlStatus)
    : { text: "Disconnected", color: "#9ca3af", icon: "⏸️" };

  const SensorCard = ({ title, value, unit, icon, color = "#6366f1" }) => (
    <div
      style={{
        background: "#f9fafb",
        borderRadius: "12px",
        padding: "16px",
        border: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          fontSize: "0.7rem",
          color: "#6b7280",
          fontWeight: "600",
          textTransform: "uppercase",
          marginBottom: "8px",
        }}
      >
        {icon} {title}
      </div>
      <div
        style={{
          fontSize: "1.75rem",
          fontWeight: "700",
          color: color,
        }}
      >
        {value}
        {unit && (
          <span
            style={{
              fontSize: "0.875rem",
              color: "#6b7280",
              marginLeft: "4px",
            }}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  );

  const SectionCard = ({ title, icon, children }) => (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "16px",
        padding: "20px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
      }}
    >
      <h3
        style={{
          fontSize: "1rem",
          fontWeight: "700",
          color: "#111827",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span>{icon}</span> {title}
      </h3>
      {children}
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f3f4f6",
          padding: "20px",
        }}
      >
        <div style={{ maxWidth: "1800px", margin: "0 auto" }}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "2rem",
                  fontWeight: "800",
                  color: "#111827",
                  margin: 0,
                  marginBottom: "4px",
                }}
              >
                Vehicle Dashboard
              </h1>
              <p style={{ fontSize: "0.9rem", color: "#6b7280", margin: 0 }}>
                Real-time monitoring • ML-powered diagnostics • All Sensor Data
              </p>
            </div>
          </div>

          {/* ML Prediction - Hero Section */}
          <div
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "20px",
              padding: "32px",
              marginBottom: "24px",
              boxShadow: "0 20px 60px rgba(102, 126, 234, 0.3)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "16px",
                  background: "rgba(255, 255, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2.5rem",
                  backdropFilter: "blur(10px)",
                }}
              >
                🤖
              </div>
              <div>
                <h2
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: "800",
                    color: "#ffffff",
                    margin: 0,
                  }}
                >
                  ML Health Prediction
                </h2>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "rgba(255, 255, 255, 0.9)",
                    margin: 0,
                  }}
                >
                  Random Forest Algorithm
                </p>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "20px",
              }}
            >
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "16px",
                  padding: "24px",
                  textAlign: "center",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "12px" }}>❤️</div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "12px",
                  }}
                >
                  Health Score
                </div>
                <div
                  style={{
                    fontSize: "3rem",
                    fontWeight: "800",
                    color: "#ffffff",
                  }}
                >
                  {healthScore !== null ? healthScore : "N/A"}
                  {healthScore !== null && (
                    <span style={{ fontSize: "1.5rem" }}>/100</span>
                  )}
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "16px",
                  padding: "24px",
                  textAlign: "center",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "12px" }}>
                  {statusDisplay.icon}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "12px",
                  }}
                >
                  Vehicle Status
                </div>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "700",
                    color: "#ffffff",
                  }}
                >
                  {statusDisplay.text}
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "16px",
                  padding: "24px",
                  textAlign: "center",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "12px" }}>📊</div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "12px",
                  }}
                >
                  ML Confidence
                </div>
                <div
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: "800",
                    color: "#ffffff",
                  }}
                >
                  {fmt(sensorData?.mlConfidence, 1)}
                  {sensorData?.mlConfidence && (
                    <span style={{ fontSize: "1.2rem" }}>%</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Sensor Data Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "20px" }}>
            
            {/* ENGINE PERFORMANCE */}
            <SectionCard title="Engine Performance" icon="⚙️">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <SensorCard title="RPM" value={fmt(sensorData?.rpm, 0)} icon="🔄" color="#ef4444" />
                <SensorCard title="Engine Load" value={fmt(sensorData?.engineLoad, 1)} unit="%" icon="⚡" color="#8b5cf6" />
                <SensorCard title="Coolant Temp" value={fmt(sensorData?.coolantTemp, 1)} unit="°C" icon="🌡️" color="#f97316" />
                <SensorCard title="Intake Temp" value={fmt(sensorData?.intakeTemp, 1)} unit="°C" icon="🌡️" color="#06b6d4" />
                <SensorCard title="Throttle Pos" value={fmt(sensorData?.throttlePos, 1)} unit="%" icon="🎚️" color="#06b6d4" />
                <SensorCard title="Absolute Load" value={fmt(sensorData?.absoluteLoad, 1)} unit="%" icon="⚡" color="#a855f7" />
              </div>
            </SectionCard>

            {/* FUEL SYSTEM */}
            <SectionCard title="Fuel System" icon="⛽">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <SensorCard title="Fuel Level" value={fmt(sensorData?.fuelLevel, 1)} unit="%" icon="⛽" color="#10b981" />
                <SensorCard title="Fuel Pressure" value={fmt(sensorData?.fuelPressure, 1)} unit="kPa" icon="💨" color="#3b82f6" />
                <SensorCard title="Short Trim" value={fmt(sensorData?.fuelTrimShort, 2)} unit="%" icon="🔧" color="#f59e0b" />
                <SensorCard title="Long Trim" value={fmt(sensorData?.fuelTrimLong, 2)} unit="%" icon="🔧" color="#f59e0b" />
              </div>
            </SectionCard>

            {/* AIR FLOW & PRESSURE */}
            <SectionCard title="Air Flow & Pressure" icon="💨">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <SensorCard title="MAF" value={fmt(sensorData?.maf, 2)} unit="g/s" icon="🌬️" color="#06b6d4" />
                <SensorCard title="MAP" value={fmt(sensorData?.map, 1)} unit="kPa" icon="📊" color="#6366f1" />
                <SensorCard title="Barometric" value={fmt(sensorData?.barometricPressure, 1)} unit="kPa" icon="📊" color="#6366f1" />
                <SensorCard title="O2 Sensor" value={fmt(sensorData?.o2Sensor1, 2)} unit="V" icon="🔬" color="#ec4899" />
              </div>
            </SectionCard>

            {/* IGNITION & TIMING */}
            <SectionCard title="Ignition & Timing" icon="⏱️">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <SensorCard title="Timing Advance" value={fmt(sensorData?.timingAdvance, 1)} unit="°" icon="⏱️" color="#8b5cf6" />
                <SensorCard title="Engine Runtime" value={fmt(sensorData?.engineRuntime, 0)} unit="s" icon="⏰" color="#10b981" />
              </div>
            </SectionCard>

            {/* VEHICLE STATUS */}
            <SectionCard title="Vehicle Status" icon="🚗">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <SensorCard title="Speed" value={fmt(sensorData?.vehicleSpeed, 1)} unit="km/h" icon="🚗" color="#10b981" />
                <SensorCard title="DTC Count" value={fmt(sensorData?.dtcCount, 0)} icon="⚠️" color="#ef4444" />
                <SensorCard title="Module Voltage" value={fmt(sensorData?.controlModuleVoltage, 2)} unit="V" icon="🔋" color="#3b82f6" />
                <SensorCard title="Data Quality" value={fmt(sensorData?.dataQualityScore, 0)} unit="%" icon="✅" color="#10b981" />
              </div>
            </SectionCard>

            {/* COMPUTED METRICS */}
            <SectionCard title="Computed Metrics" icon="📈">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <SensorCard title="Load/RPM Ratio" value={fmt(sensorData?.loadRpmRatio, 3)} icon="📐" color="#6366f1" />
                <SensorCard title="Temp Gradient" value={fmt(sensorData?.tempGradient, 2)} icon="🌡️" color="#ec4899" />
                <SensorCard title="Engine Stress" value={fmt(sensorData?.engineStressScore, 2)} icon="⚠️" color="#f59e0b" />
                <SensorCard title="Health Display" value={fmt(sensorData?.healthScoreDisplay, 0)} icon="❤️" color="#ef4444" />
              </div>
            </SectionCard>
          </div>

          {/* ML PREDICTION DETAILS */}
          {sensorData?.mlStatus && (
            <div style={{ marginBottom: "20px" }}>
              <SectionCard title="ML Prediction Details" icon="🤖">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                  <SensorCard title="Normal Prob" value={fmt(sensorData?.probNormal, 1)} unit="%" icon="✅" color="#10b981" />
                  <SensorCard title="Advisory Prob" value={fmt(sensorData?.probAdvisory, 1)} unit="%" icon="ℹ️" color="#3b82f6" />
                  <SensorCard title="Warning Prob" value={fmt(sensorData?.probWarning, 1)} unit="%" icon="⚠️" color="#f59e0b" />
                  <SensorCard title="Critical Prob" value={fmt(sensorData?.probCritical, 1)} unit="%" icon="🚨" color="#ef4444" />
                </div>
                {sensorData?.daysUntilMaintenance && (
                  <div style={{ marginTop: "12px", padding: "16px", background: "#fef3c7", borderRadius: "12px", border: "1px solid #fcd34d" }}>
                    <div style={{ fontSize: "0.9rem", color: "#92400e", fontWeight: "600" }}>
                      🔧 Maintenance Prediction: {sensorData.daysUntilMaintenance} days until recommended maintenance
                    </div>
                  </div>
                )}
                {sensorData?.failureRisk && (
                  <div style={{ marginTop: "12px", padding: "16px", background: "#fee2e2", borderRadius: "12px", border: "1px solid #fca5a5" }}>
                    <div style={{ fontSize: "0.9rem", color: "#991b1b", fontWeight: "600" }}>
                      ⚠️ Failure Risk: {sensorData.failureRisk}
                    </div>
                  </div>
                )}
              </SectionCard>
            </div>
          )}

          {/* ML ALERTS */}
          {sensorData?.mlAlerts && sensorData.mlAlerts.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <SectionCard title="ML Recommended Actions" icon="🔔">
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {sensorData.mlAlerts.map((alert, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "12px 16px",
                        background: "#fef3c7",
                        border: "1px solid #fcd34d",
                        borderRadius: "8px",
                        color: "#92400e",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                      }}
                    >
                      {alert}
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          )}

          {/* CONNECTION STATUS */}
          <div style={{ textAlign: "center", padding: "16px", background: pollingStatus === "CONNECTED" ? "#d1fae5" : "#fee2e2", borderRadius: "12px" }}>
            <div style={{ fontSize: "0.9rem", color: pollingStatus === "CONNECTED" ? "#065f46" : "#991b1b", fontWeight: "600" }}>
              {pollingStatus === "CONNECTED" ? "🟢 Connected to Vehicle" : "🔴 Waiting for Connection..."}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
