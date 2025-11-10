import React, { useEffect, useState } from "react";
import { vehicleMLService } from "../services/vehicleML";
import sensorDataService from "../services/sensorData";

export default function Dashboard({ onNavigate }) {
  const [sensorData, setSensorData] = useState(null);
  const [pollingStatus, setPollingStatus] = useState("WAITING");

  useEffect(() => {
    console.log('📊 Dashboard - Setting up sensor data subscription');
    const unsubscribe = sensorDataService.subscribeToSensorData(
      1,
      (data) => {
        if (data) {
          setSensorData(data);
          setPollingStatus("CONNECTED");
        } else {
          setPollingStatus("WAITING");
        }
      }
    );
    return () => unsubscribe();
  }, []);

  const fmt = (value, decimals = 1) => {
    if (pollingStatus !== "CONNECTED" || !sensorData || value === null || value === undefined) return "N/A";
    if (typeof value === "number") return value.toFixed(decimals);
    return value;
  };

  // ML data comes directly from Supabase database (not mock data)
  // sensorData is fetched from Supabase via sensorDataService.subscribeToSensorData()
  const mlHealthScore = sensorData?.mlHealthScore ?? null;
  const mlStatus = sensorData?.mlStatus || sensorData?.status || "UNKNOWN";
  const hasMLData = mlHealthScore !== null && mlHealthScore !== undefined;
  // Decide which status to display: prefer mlStatus/status if present; otherwise show Disconnected
  const hasAnyStatus = Boolean(sensorData?.mlStatus || sensorData?.status);
  // vehicleMLService.getStatusDisplay() only formats the display (text/color/icon), doesn't fetch data
  const statusDisplay = hasAnyStatus
    ? vehicleMLService.getStatusDisplay(mlStatus)
    : { text: "Disconnected", color: "#9ca3af", icon: "⏸️" };

  return (
    <>
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", padding: "20px" }}>
        <div style={{ maxWidth: "1800px", margin: "0 auto" }}>
          
          {/* Header */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: "24px"
          }}>
          <div>
              <h1 style={{ 
                fontSize: "2rem", 
                fontWeight: "800", 
                color: "#111827", 
                margin: 0,
                marginBottom: "4px"
              }}>
                Vehicle Dashboard
            </h1>
              <p style={{ fontSize: "0.9rem", color: "#6b7280", margin: 0 }}>
                Real-time monitoring • ML-powered diagnostics
            </p>
          </div>
        </div>

          {/* ML Prediction - Hero Section */}
          <div style={{ 
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "20px",
            padding: "32px",
            marginBottom: "24px",
            boxShadow: "0 20px 60px rgba(102, 126, 234, 0.3)",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: "linear-gradient(90deg, #fff, #a78bfa, #fff)",
              backgroundSize: "200% 100%",
              animation: "gradient 3s ease infinite"
            }} />
            
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
              <div style={{
                width: "64px",
                height: "64px",
                borderRadius: "16px",
                background: "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.5rem",
                backdropFilter: "blur(10px)"
              }}>
                🤖
              </div>
              <div>
                <h2 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#ffffff", margin: 0, marginBottom: "4px" }}>
                  ML Prediction
                </h2>
                <p style={{ fontSize: "0.9rem", color: "rgba(255, 255, 255, 0.9)", margin: 0 }}>
                  Random Forest Algorithm
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
              <div style={{
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(10px)",
                borderRadius: "16px",
                padding: "24px",
                textAlign: "center",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                transition: "all 0.3s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "12px" }}>❤️</div>
                <div style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.8)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>
                  Health Score
                </div>
                <div style={{ fontSize: "3.5rem", fontWeight: "900", color: "#ffffff", lineHeight: "1" }}>
                  {fmt(mlHealthScore, 0)}
                  <span style={{ fontSize: "1.5rem", fontWeight: "600", opacity: 0.8, marginLeft: "4px" }}>/100</span>
                </div>
              </div>

              <div style={{
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(10px)",
                borderRadius: "16px",
                padding: "24px",
                textAlign: "center",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                transition: "all 0.3s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "12px" }}>{statusDisplay.icon}</div>
                <div style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.8)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>
                  System Status
                </div>
                <div style={{ fontSize: "2rem", fontWeight: "800", color: "#ffffff", lineHeight: "1" }}>
                  {statusDisplay.text}
                </div>
              </div>

              <div style={{
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(10px)",
                borderRadius: "16px",
                padding: "24px",
                textAlign: "center",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                transition: "all 0.3s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "12px" }}>📊</div>
                <div style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.8)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>
                  Data Quality
                </div>
                <div style={{ fontSize: "3.5rem", fontWeight: "900", color: "#ffffff", lineHeight: "1" }}>
                  {fmt(sensorData?.dataQualityScore, 0)}
                  <span style={{ fontSize: "1.5rem", fontWeight: "600", opacity: 0.8, marginLeft: "4px" }}>%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid - 3 columns */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            
            {/* Column 1 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{
                background: "#ffffff",
                borderRadius: "16px",
                padding: "20px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)"
              }}>
                <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#111827", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>🚗</span> Vehicle Health Status
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                  <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px", border: "1px solid #e5e7eb" }}>
                    <div style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: "600", textTransform: "uppercase", marginBottom: "8px" }}>🔧 Engine RPM</div>
                    <div style={{ fontSize: "1.75rem", fontWeight: "700", color: "#3b82f6" }}>{fmt(sensorData?.rpm, 0)}<span style={{ fontSize: "0.875rem", color: "#6b7280", marginLeft: "4px" }}>rpm</span></div>
                  </div>
                  <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px", border: "1px solid #e5e7eb" }}>
                    <div style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: "600", textTransform: "uppercase", marginBottom: "8px" }}>🌡️ Coolant Temp</div>
                    <div style={{ fontSize: "1.75rem", fontWeight: "700", color: "#f59e0b" }}>{fmt(sensorData?.coolantTemp, 1)}<span style={{ fontSize: "0.875rem", color: "#6b7280", marginLeft: "4px" }}>°C</span></div>
                  </div>
                  <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px", border: "1px solid #e5e7eb" }}>
                    <div style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: "600", textTransform: "uppercase", marginBottom: "8px" }}>⚡ Engine Load</div>
                    <div style={{ fontSize: "1.75rem", fontWeight: "700", color: "#8b5cf6" }}>{fmt(sensorData?.engineLoad, 1)}<span style={{ fontSize: "0.875rem", color: "#6b7280", marginLeft: "4px" }}>%</span></div>
                  </div>
                  <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px", border: "1px solid #e5e7eb" }}>
                    <div style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: "600", textTransform: "uppercase", marginBottom: "8px" }}>🎚️ Throttle</div>
                    <div style={{ fontSize: "1.75rem", fontWeight: "700", color: "#06b6d4" }}>{fmt(sensorData?.throttlePos, 1)}<span style={{ fontSize: "0.875rem", color: "#6b7280", marginLeft: "4px" }}>%</span></div>
                  </div>
                </div>
              </div>

              <div style={{
                background: "#ffffff",
                borderRadius: "16px",
                padding: "20px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)"
              }}>
                <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#111827", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>📈</span> Performance Metrics
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px", border: "1px solid #e5e7eb" }}>
                    <div style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: "600", textTransform: "uppercase", marginBottom: "8px" }}>📐 Load/RPM Ratio</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#6366f1" }}>{fmt(sensorData?.loadRpmRatio, 3)}</div>
                  </div>
                  <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px", border: "1px solid #e5e7eb" }}>
                    <div style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: "600", textTransform: "uppercase", marginBottom: "8px" }}>🌡️ Temp Gradient</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#ec4899" }}>{fmt(sensorData?.tempGradient, 2)}</div>
                  </div>
                  <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px", border: "1px solid #e5e7eb" }}>
                    <div style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: "600", textTransform: "uppercase", marginBottom: "8px" }}>⚠️ Engine Stress</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#f59e0b" }}>{fmt(sensorData?.engineStressScore, 2)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{
                background: "#ffffff",
                borderRadius: "16px",
                padding: "20px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)"
              }}>
                <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#111827", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>📡</span> Sensor Readings
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                  <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px", border: "1px solid #e5e7eb" }}>
                    <div style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: "600", textTransform: "uppercase", marginBottom: "8px" }}>🚗 Speed</div>
                    <div style={{ fontSize: "1.75rem", fontWeight: "700", color: "#10b981" }}>{fmt(sensorData?.vehicleSpeed, 1)}<span style={{ fontSize: "0.875rem", color: "#6b7280", marginLeft: "4px" }}>km/h</span></div>
                  </div>
                  <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px", border: "1px solid #e5e7eb" }}>
                    <div style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: "600", textTransform: "uppercase", marginBottom: "8px" }}>🌡️ Intake Temp</div>
                    <div style={{ fontSize: "1.75rem", fontWeight: "700", color: "#06b6d4" }}>{fmt(sensorData?.intakeTemp, 1)}<span style={{ fontSize: "0.875rem", color: "#6b7280", marginLeft: "4px" }}>°C</span></div>
                  </div>
                  <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px", border: "1px solid #e5e7eb" }}>
                    <div style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: "600", textTransform: "uppercase", marginBottom: "8px" }}>⏱️ Timing</div>
                    <div style={{ fontSize: "1.75rem", fontWeight: "700", color: "#8b5cf6" }}>{fmt(sensorData?.timingAdvance, 1)}<span style={{ fontSize: "0.875rem", color: "#6b7280", marginLeft: "4px" }}>°</span></div>
                  </div>
                  <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px", border: "1px solid #e5e7eb" }}>
                    <div style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: "600", textTransform: "uppercase", marginBottom: "8px" }}>📊 Pressure</div>
                    <div style={{ fontSize: "1.75rem", fontWeight: "700", color: "#6366f1" }}>{fmt(sensorData?.barometricPressure, 1)}<span style={{ fontSize: "0.875rem", color: "#6b7280", marginLeft: "4px" }}>kPa</span></div>
                  </div>
                </div>
        </div>

              <div style={{
                background: "#ffffff",
                borderRadius: "16px",
                padding: "20px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)"
              }}>
                <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#111827", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>⛽</span> Fuel System
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px", border: "1px solid #e5e7eb" }}>
                    <div style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: "600", textTransform: "uppercase", marginBottom: "8px" }}>⛽ Short Fuel Trim</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#f59e0b" }}>{fmt(sensorData?.fuelTrimShort, 2)}<span style={{ fontSize: "0.875rem", color: "#6b7280", marginLeft: "4px" }}>%</span></div>
                  </div>
                  <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px", border: "1px solid #e5e7eb" }}>
                    <div style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: "600", textTransform: "uppercase", marginBottom: "8px" }}>📊 Long Fuel Trim</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#ec4899" }}>{fmt(sensorData?.fuelTrimLong, 2)}<span style={{ fontSize: "0.875rem", color: "#6b7280", marginLeft: "4px" }}>%</span></div>
                  </div>
            </div>
            </div>
            </div>

            {/* Column 3 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{
                background: "#ffffff",
                borderRadius: "16px",
                padding: "20px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)"
              }}>
                <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#111827", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>🔧</span> System Info
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px", border: "1px solid #e5e7eb" }}>
                    <div style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: "600", textTransform: "uppercase", marginBottom: "8px" }}>⚡ Voltage</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: "700", color: sensorData?.controlModuleVoltage >= 12 ? "#10b981" : "#ef4444" }}>
                      {fmt(sensorData?.controlModuleVoltage, 2)}<span style={{ fontSize: "0.875rem", color: "#6b7280", marginLeft: "4px" }}>V</span>
            </div>
            </div>
                  <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px", border: "1px solid #e5e7eb" }}>
                    <div style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: "600", textTransform: "uppercase", marginBottom: "8px" }}>⏱️ Runtime</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#6366f1" }}>{fmt(sensorData?.engineRuntime, 0)}<span style={{ fontSize: "0.875rem", color: "#6b7280", marginLeft: "4px" }}>s</span></div>
              </div>
            </div>
          </div>
            </div>

        </div>
      </div>
    </div>
    </>
  );
}
