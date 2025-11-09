import React, { useEffect, useState } from "react";
import sensorDataService from "../services/sensorData";
import DonutProgress from "../components/DonutProgress";

export default function Emissions({ onNavigate }) {
  const [sensorData, setSensorData] = useState(null);
  const [pollingStatus, setPollingStatus] = useState("WAITING");
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const unsubscribe = sensorDataService.subscribeToSensorData(
      1, // Default vehicle ID
      (data) => {
        if (data) {
          setSensorData(data);
          setLastUpdate(new Date());
          setPollingStatus("CONNECTED");
        } else {
          setPollingStatus("WAITING");
        }
      }
      // No interval parameter - using Supabase Realtime instead of polling
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const shouldShowNA = pollingStatus !== "CONNECTED" || !sensorData;

  const fmt = (value, decimals = 1) => {
    if (shouldShowNA || value === null || value === undefined) return "N/A";
    if (typeof value === "number") {
      return value.toFixed(decimals);
    }
    return value;
  };

  const getO2SensorStatus = (voltage) => {
    if (voltage === null || voltage === undefined) return { color: "#6b7280", status: "N/A" };
    if (voltage > 0.1 && voltage < 0.9) return { color: "#10b981", status: "Normal" };
    return { color: "#f59e0b", status: "Check" };
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb", padding: "1.5rem" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#111827", marginBottom: "0.5rem" }}>
              🌿 Emissions Monitoring
            </h1>
            <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
              Real-time emissions system diagnostics and oxygen sensor monitoring • Status: {pollingStatus}
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
          <DonutProgress
            value={sensorData?.o2Sensor1 || 0}
            max={1}
            label="O2 Sensor 1"
            unit="V"
            color="#10b981"
          />
          <DonutProgress
            value={sensorData?.maf || 0}
            max={200}
            label="Mass Air Flow"
            unit="g/s"
            color="#3b82f6"
          />
          <DonutProgress
            value={sensorData?.map || 0}
            max={150}
            label="Manifold Pressure"
            unit="kPa"
            color="#8b5cf6"
          />
          <DonutProgress
            value={sensorData?.dtcCount || 0}
            max={10}
            label="DTC Count"
            unit=""
            color={sensorData?.dtcCount > 0 ? "#ef4444" : "#10b981"}
          />
        </div>

        {/* Air Flow & Pressure Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ backgroundColor: "white", borderRadius: "0.75rem", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#111827", marginBottom: "1rem" }}>
              ⚡ Oxygen Sensor 1
            </h3>
            <div style={{ display: "grid", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.75rem", borderBottom: "1px solid #e5e7eb" }}>
                <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Voltage</span>
                <span style={{ fontSize: "1.5rem", fontWeight: "600", color: getO2SensorStatus(sensorData?.o2Sensor1).color }}>
                  {fmt(sensorData?.o2Sensor1, 3)} V
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.75rem", borderBottom: "1px solid #e5e7eb" }}>
                <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Status</span>
                <span style={{ fontSize: "1rem", fontWeight: "600", color: getO2SensorStatus(sensorData?.o2Sensor1).color, padding: "0.25rem 0.75rem", backgroundColor: getO2SensorStatus(sensorData?.o2Sensor1).color === "#10b981" ? "#dcfce7" : "#fef3c7", borderRadius: "0.5rem" }}>
                  {getO2SensorStatus(sensorData?.o2Sensor1).status}
                </span>
              </div>
              <div style={{ height: "60px", backgroundColor: "#f3f4f6", borderRadius: "0.5rem", display: "flex", alignItems: "flex-end", padding: "0.5rem", overflow: "hidden" }}>
                <div 
                  style={{ 
                    width: "100%", 
                    height: `${Math.min((sensorData?.o2Sensor1 || 0) * 100, 100)}%`, 
                    backgroundColor: getO2SensorStatus(sensorData?.o2Sensor1).color,
                    borderRadius: "0.25rem",
                    transition: "height 0.3s ease"
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: "white", borderRadius: "0.75rem", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#111827", marginBottom: "1rem" }}>
              🌡️ Temperature Monitoring
            </h3>
            <div style={{ display: "grid", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.75rem", borderBottom: "1px solid #e5e7eb" }}>
                <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Coolant Temperature</span>
                <span style={{ fontSize: "1.5rem", fontWeight: "600", color: "#111827" }}>{fmt(sensorData?.coolantTemp, 1)}°C</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.75rem", borderBottom: "1px solid #e5e7eb" }}>
                <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Intake Air Temperature</span>
                <span style={{ fontSize: "1.5rem", fontWeight: "600", color: "#111827" }}>{fmt(sensorData?.intakeTemp, 1)}°C</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Temperature Gradient</span>
                <span style={{ fontSize: "1.5rem", fontWeight: "600", color: "#111827" }}>{fmt(sensorData?.tempGradient, 2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Engine Metrics */}
        <div style={{ backgroundColor: "white", borderRadius: "0.75rem", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#111827", marginBottom: "1rem" }}>
            ⚙️ Engine Performance
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <div>
              <div style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Engine Load</div>
              <div style={{ fontSize: "2rem", fontWeight: "700", color: sensorData?.engineLoad > 80 ? "#f59e0b" : "#111827" }}>
                {fmt(sensorData?.engineLoad, 1)}%
              </div>
            </div>
            <div>
              <div style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Engine Stress Score</div>
              <div style={{ fontSize: "2rem", fontWeight: "700", color: "#111827" }}>
                {fmt(sensorData?.engineStressScore, 2)}
              </div>
            </div>
      <div>
              <div style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Load/RPM Ratio</div>
              <div style={{ fontSize: "2rem", fontWeight: "700", color: "#111827" }}>
                {fmt(sensorData?.loadRpmRatio, 3)}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        {lastUpdate && (
          <div style={{ backgroundColor: "white", borderRadius: "0.75rem", padding: "1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", textAlign: "center", color: "#6b7280", fontSize: "0.875rem" }}>
            Last update: {lastUpdate.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}
