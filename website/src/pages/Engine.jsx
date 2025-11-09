import React, { useEffect, useState } from "react";
import sensorDataService from "../services/sensorData";
import DonutProgress from "../components/DonutProgress";

export default function Engine({ onNavigate }) {
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

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb", padding: "1.5rem" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#111827", marginBottom: "0.5rem" }}>
              ≡ƒöº Engine Diagnostics
            </h1>
            <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
              Real-time engine performance monitoring ΓÇó Status: {pollingStatus}
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
          <DonutProgress
            value={sensorData?.rpm || 0}
            max={7000}
            label="RPM"
            unit="rpm"
            color="#3b82f6"
          />
          <DonutProgress
            value={sensorData?.engineLoad || 0}
            max={100}
            label="Engine Load"
            unit="%"
            color="#8b5cf6"
          />
          <DonutProgress
            value={sensorData?.coolantTemp || 0}
            max={120}
            label="Coolant Temp"
            unit="┬░C"
            color="#f59e0b"
          />
          <DonutProgress
            value={sensorData?.throttlePos || 0}
            max={100}
            label="Throttle Position"
            unit="%"
            color="#06b6d4"
          />
        </div>

        {/* Engine Performance Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ backgroundColor: "white", borderRadius: "0.75rem", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#111827", marginBottom: "1rem" }}>
              ΓÜÖ∩╕Å Core Engine Metrics
            </h3>
            <div style={{ display: "grid", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.75rem", borderBottom: "1px solid #e5e7eb" }}>
                <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>RPM</span>
                <span style={{ fontSize: "1.5rem", fontWeight: "600", color: "#111827" }}>{fmt(sensorData?.rpm, 0)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.75rem", borderBottom: "1px solid #e5e7eb" }}>
                <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Engine Load</span>
                <span style={{ fontSize: "1.5rem", fontWeight: "600", color: "#111827" }}>{fmt(sensorData?.engineLoad, 1)}%</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.75rem", borderBottom: "1px solid #e5e7eb" }}>
                <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Coolant Temperature</span>
                <span style={{ fontSize: "1.5rem", fontWeight: "600", color: "#111827" }}>{fmt(sensorData?.coolantTemp, 1)}┬░C</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Engine Runtime</span>
                <span style={{ fontSize: "1.5rem", fontWeight: "600", color: "#111827" }}>
                  {sensorData?.engineRuntime ? `${Math.floor(sensorData.engineRuntime / 60)}m ${sensorData.engineRuntime % 60}s` : "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: "white", borderRadius: "0.75rem", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#111827", marginBottom: "1rem" }}>
              ≡ƒÆ¿ Air Intake System
            </h3>
            <div style={{ display: "grid", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.75rem", borderBottom: "1px solid #e5e7eb" }}>
                <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Mass Air Flow (MAF)</span>
                <span style={{ fontSize: "1.5rem", fontWeight: "600", color: "#111827" }}>{fmt(sensorData?.maf, 2)} g/s</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.75rem", borderBottom: "1px solid #e5e7eb" }}>
                <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Manifold Pressure (MAP)</span>
                <span style={{ fontSize: "1.5rem", fontWeight: "600", color: "#111827" }}>{fmt(sensorData?.map, 1)} kPa</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.75rem", borderBottom: "1px solid #e5e7eb" }}>
                <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Intake Air Temperature</span>
                <span style={{ fontSize: "1.5rem", fontWeight: "600", color: "#111827" }}>{fmt(sensorData?.intakeTemp, 1)}┬░C</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Barometric Pressure</span>
                <span style={{ fontSize: "1.5rem", fontWeight: "600", color: "#111827" }}>{fmt(sensorData?.barometricPressure, 1)} kPa</span>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: "white", borderRadius: "0.75rem", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#111827", marginBottom: "1rem" }}>
              ΓÜí Ignition & Timing
            </h3>
            <div style={{ display: "grid", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.75rem", borderBottom: "1px solid #e5e7eb" }}>
                <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Timing Advance</span>
                <span style={{ fontSize: "1.5rem", fontWeight: "600", color: "#111827" }}>{fmt(sensorData?.timingAdvance, 1)}┬░</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.75rem", borderBottom: "1px solid #e5e7eb" }}>
                <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Throttle Position</span>
                <span style={{ fontSize: "1.5rem", fontWeight: "600", color: "#111827" }}>{fmt(sensorData?.throttlePos, 1)}%</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.75rem", borderBottom: "1px solid #e5e7eb" }}>
                <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>ECU Voltage</span>
                <span style={{ fontSize: "1.5rem", fontWeight: "600", color: "#111827" }}>{fmt(sensorData?.controlModuleVoltage, 2)} V</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Load/RPM Ratio</span>
                <span style={{ fontSize: "1.5rem", fontWeight: "600", color: "#111827" }}>{fmt(sensorData?.loadRpmRatio, 3)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostics Section */}
        <div style={{ backgroundColor: "white", borderRadius: "0.75rem", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#111827", marginBottom: "1rem" }}>
            ≡ƒöì Engine Diagnostics
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <div>
              <div style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Engine Stress Score</div>
              <div style={{ fontSize: "2rem", fontWeight: "700", color: sensorData?.engineStressScore > 50 ? "#ef4444" : "#10b981" }}>
                {fmt(sensorData?.engineStressScore, 1)}
              </div>
            </div>
            <div>
              <div style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Temperature Gradient</div>
              <div style={{ fontSize: "2rem", fontWeight: "700", color: "#111827" }}>
                {fmt(sensorData?.tempGradient, 2)}
              </div>
            </div>
      <div>
              <div style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Load/RPM Ratio</div>
              <div style={{ fontSize: "2rem", fontWeight: "700", color: "#111827" }}>
                {fmt(sensorData?.loadRpmRatio, 3)}
              </div>
            </div>
          </div>
          {lastUpdate && (
            <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e5e7eb", color: "#6b7280", fontSize: "0.875rem" }}>
              Last update: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
