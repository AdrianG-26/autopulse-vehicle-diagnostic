import React, { useEffect, useState } from "react";
import DonutProgress from "../components/DonutProgress";
import StatusIndicator from "../components/StatusIndicator";
import { supabase } from "../services/supabase";

export default function Dashboard({ onNavigate }) {
  const [pollingStatus, setPollingStatus] = useState("WAITING");
  const [rawData, setRawData] = useState(null);

  // Poll for latest data from Supabase every 1 second
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('sensor_data')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          const latest = data[0];
          setRawData({
            rpm: latest.rpm || 0,
            speed: latest.vehicle_speed || 0,
            coolant_temp: latest.coolant_temp || 0,
            engine_load: latest.engine_load || 0,
            throttle_pos: latest.throttle_pos || 0,
            fuel_level: latest.fuel_level || 0,
            timestamp: latest.timestamp,
            vehicle_id: latest.vehicle_id,
            status: 'NORMAL',
          });
          setPollingStatus("CONNECTED");
        } else {
          setPollingStatus("WAITING");
        }
      } catch (error) {
        console.error("Supabase error:", error);
        setPollingStatus("ERROR");
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const shouldShowNA = pollingStatus !== "CONNECTED" || !rawData;

  const fmt = (value, decimals = 1) => {
    if (shouldShowNA || value === null || value === undefined) return "N/A";
    return typeof value === "number" ? value.toFixed(decimals) : value;
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      NORMAL: { color: "#10b981", icon: "✅", text: "Normal", bg: "#dcfce7" },
      ADVISORY: { color: "#f59e0b", icon: "⚠️", text: "Advisory", bg: "#fef3c7" },
      WARNING: { color: "#ef4444", icon: "⚠️", text: "Warning", bg: "#fee2e2" },
      CRITICAL: { color: "#dc2626", icon: "🚨", text: "Critical", bg: "#fef2f2" },
    };
    return statusMap[status] || statusMap.NORMAL;
  };

  const currentStatus = getStatusDisplay(rawData?.status || "NORMAL");

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb", padding: "1.5rem" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#111827", marginBottom: "0.5rem" }}>
              🚗 Vehicle Dashboard
            </h1>
            <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
              Real-time OBD-II monitoring • Connected to Supabase Cloud ☁️
            </p>
          </div>
          <StatusIndicator status={pollingStatus} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
          <DonutProgress
            value={rawData?.rpm || 0}
            max={7000}
            label="RPM"
            unit="rpm"
            color="#3b82f6"
          />
          <DonutProgress
            value={rawData?.speed || 0}
            max={180}
            label="Speed"
            unit="km/h"
            color="#10b981"
          />
          <DonutProgress
            value={rawData?.coolant_temp || 0}
            max={120}
            label="Coolant Temp"
            unit="°C"
            color="#f59e0b"
          />
          <DonutProgress
            value={rawData?.engine_load || 0}
            max={100}
            label="Engine Load"
            unit="%"
            color="#8b5cf6"
          />
        </div>

        <div style={{ backgroundColor: "white", borderRadius: "0.75rem", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#111827", marginBottom: "1rem" }}>
            📊 Live Sensor Data
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <div>
              <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>RPM</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "#111827" }}>{fmt(rawData?.rpm, 0)}</div>
            </div>
            <div>
              <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Speed</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "#111827" }}>{fmt(rawData?.speed, 1)} km/h</div>
            </div>
            <div>
              <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Coolant Temp</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "#111827" }}>{fmt(rawData?.coolant_temp, 1)}°C</div>
            </div>
            <div>
              <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Engine Load</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "#111827" }}>{fmt(rawData?.engine_load, 1)}%</div>
            </div>
            <div>
              <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Throttle Position</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "#111827" }}>{fmt(rawData?.throttle_pos, 1)}%</div>
            </div>
            <div>
              <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Status</div>
              <div style={{ fontSize: "1.25rem", fontWeight: "600", color: currentStatus.color }}>
                {currentStatus.icon} {currentStatus.text}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
