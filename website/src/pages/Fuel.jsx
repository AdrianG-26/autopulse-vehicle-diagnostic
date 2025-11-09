import React, { useEffect, useState } from "react";
import sensorDataService from "../services/sensorData";
import DonutProgress from "../components/DonutProgress";

export default function Fuel({ onNavigate }) {
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

  const getFuelTrimStatus = (trim) => {
    if (trim === null || trim === undefined) return { color: "#6b7280", status: "N/A" };
    const absTrim = Math.abs(trim);
    if (absTrim < 5) return { color: "#10b981", status: "Normal" };
    if (absTrim < 10) return { color: "#f59e0b", status: "Advisory" };
    return { color: "#ef4444", status: "Warning" };
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb", padding: "1.5rem" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#111827", marginBottom: "0.5rem" }}>
              Γ¢╜ Fuel System
            </h1>
            <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
              Real-time fuel system monitoring and diagnostics ΓÇó Status: {pollingStatus}
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
          <DonutProgress
            value={sensorData?.fuelLevel || 0}
            max={100}
            label="Fuel Level"
            unit="%"
            color="#ec4899"
          />
          <DonutProgress
            value={sensorData?.throttlePos || 0}
            max={100}
            label="Throttle Position"
            unit="%"
            color="#06b6d4"
          />
          <DonutProgress
            value={sensorData?.fuelPressure || 0}
            max={500}
            label="Fuel Pressure"
            unit="kPa"
            color="#f59e0b"
          />
          <DonutProgress
            value={sensorData?.maf || 0}
            max={200}
            label="Mass Air Flow"
            unit="g/s"
            color="#3b82f6"
          />
        </div>

        {/* Fuel System Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ backgroundColor: "white", borderRadius: "0.75rem", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#111827", marginBottom: "1rem" }}>
              Γ¢╜ Fuel Level & Pressure
            </h3>
            <div style={{ display: "grid", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.75rem", borderBottom: "1px solid #e5e7eb" }}>
                <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Fuel Level</span>
                <span style={{ fontSize: "1.5rem", fontWeight: "600", color: "#111827" }}>{fmt(sensorData?.fuelLevel, 1)}%</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.75rem", borderBottom: "1px solid #e5e7eb" }}>
                <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Fuel Pressure</span>
                <span style={{ fontSize: "1.5rem", fontWeight: "600", color: "#111827" }}>{fmt(sensorData?.fuelPressure, 1)} kPa</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Mass Air Flow (MAF)</span>
                <span style={{ fontSize: "1.5rem", fontWeight: "600", color: "#111827" }}>{fmt(sensorData?.maf, 2)} g/s</span>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: "white", borderRadius: "0.75rem", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#111827", marginBottom: "1rem" }}>
              ≡ƒôè Fuel Trim
            </h3>
            <div style={{ display: "grid", gap: "1rem" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Short Term Fuel Trim</span>
                  <span style={{ fontSize: "1.5rem", fontWeight: "600", color: getFuelTrimStatus(sensorData?.fuelTrimShort).color }}>
                    {fmt(sensorData?.fuelTrimShort, 2)}%
                  </span>
                </div>
                <div style={{ height: "8px", backgroundColor: "#e5e7eb", borderRadius: "4px", overflow: "hidden" }}>
                  <div 
                    style={{ 
                      height: "100%", 
                      width: `${Math.min(Math.abs(sensorData?.fuelTrimShort || 0) * 2, 100)}%`, 
                      backgroundColor: getFuelTrimStatus(sensorData?.fuelTrimShort).color,
                      transition: "width 0.3s ease"
                    }}
                  />
                </div>
                <div style={{ fontSize: "0.75rem", color: getFuelTrimStatus(sensorData?.fuelTrimShort).color, marginTop: "0.25rem" }}>
                  {getFuelTrimStatus(sensorData?.fuelTrimShort).status}
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Long Term Fuel Trim</span>
                  <span style={{ fontSize: "1.5rem", fontWeight: "600", color: getFuelTrimStatus(sensorData?.fuelTrimLong).color }}>
                    {fmt(sensorData?.fuelTrimLong, 2)}%
                  </span>
                </div>
                <div style={{ height: "8px", backgroundColor: "#e5e7eb", borderRadius: "4px", overflow: "hidden" }}>
                  <div 
                    style={{ 
                      height: "100%", 
                      width: `${Math.min(Math.abs(sensorData?.fuelTrimLong || 0) * 2, 100)}%`, 
                      backgroundColor: getFuelTrimStatus(sensorData?.fuelTrimLong).color,
                      transition: "width 0.3s ease"
                    }}
                  />
                </div>
                <div style={{ fontSize: "0.75rem", color: getFuelTrimStatus(sensorData?.fuelTrimLong).color, marginTop: "0.25rem" }}>
                  {getFuelTrimStatus(sensorData?.fuelTrimLong).status}
                </div>
              </div>
              <div style={{ paddingTop: "0.5rem", borderTop: "1px solid #e5e7eb", marginTop: "0.5rem" }}>
                <div style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "0.25rem" }}>Combined Fuel Trim</div>
                <div style={{ fontSize: "1.25rem", fontWeight: "600", color: "#111827" }}>
                  {fmt((sensorData?.fuelTrimShort || 0) + (sensorData?.fuelTrimLong || 0), 2)}%
                </div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: "white", borderRadius: "0.75rem", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#111827", marginBottom: "1rem" }}>
              ≡ƒôê Fuel Performance
            </h3>
            <div style={{ display: "grid", gap: "1rem" }}>
              {/* Fuel Efficiency removed - has null values in database */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.75rem", borderBottom: "1px solid #e5e7eb" }}>
                <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Throttle Position</span>
                <span style={{ fontSize: "1.5rem", fontWeight: "600", color: "#111827" }}>{fmt(sensorData?.throttlePos, 1)}%</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.75rem", borderBottom: "1px solid #e5e7eb" }}>
                <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Mass Air Flow</span>
                <span style={{ fontSize: "1.5rem", fontWeight: "600", color: "#111827" }}>{fmt(sensorData?.maf, 2)} g/s</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>Engine Load</span>
                <span style={{ fontSize: "1.5rem", fontWeight: "600", color: "#111827" }}>{fmt(sensorData?.engineLoad, 1)}%</span>
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
