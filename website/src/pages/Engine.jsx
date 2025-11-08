import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function Engine({ onNavigate }) {
  const [rawData, setRawData] = useState(null);
  const [pollingStatus, setPollingStatus] = useState("WAITING");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from("sensor_data")
          .select("*")
          .order("timestamp", { ascending: false })
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          const latest = data[0];
          setRawData({
            rpm: latest.rpm,
            speed: latest.vehicle_speed,
            coolant_temp: latest.coolant_temp,
            engine_load: latest.engine_load,
            throttle_pos: latest.throttle_pos,
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
    const interval = setInterval(fetchData, 10000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  const shouldShowNA = pollingStatus !== "CONNECTED" || !rawData;
  const fmt = (value, decimals = 1) => {
    if (shouldShowNA || value === null || value === undefined) return "N/A";
    return typeof value === "number" ? value.toFixed(decimals) : value;
  };

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      <h1>🔧 Engine Diagnostics</h1>
      <p>Status: {pollingStatus}</p>
      <div>
        <p>RPM: {fmt(rawData?.rpm, 0)}</p>
        <p>Speed: {fmt(rawData?.speed)} km/h</p>
        <p>Coolant Temp: {fmt(rawData?.coolant_temp)}°C</p>
        <p>Engine Load: {fmt(rawData?.engine_load)}%</p>
        <p>Throttle: {fmt(rawData?.throttle_pos)}%</p>
      </div>
    </div>
  );
}
