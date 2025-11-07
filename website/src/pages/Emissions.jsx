import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function Emissions({ onNavigate }) {
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
            engine_load: latest.engine_load,
            coolant_temp: latest.coolant_temp,
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
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const shouldShowNA = pollingStatus !== "CONNECTED" || !rawData;
  const fmt = (value, decimals = 1) => {
    if (shouldShowNA || value === null || value === undefined) return "N/A";
    return typeof value === "number" ? value.toFixed(decimals) : value;
  };

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      <h1>🌿 Emissions</h1>
      <p>Status: {pollingStatus}</p>
      <div>
        <p>Engine Load: {fmt(rawData?.engine_load)}%</p>
        <p>Coolant Temp: {fmt(rawData?.coolant_temp)}°C</p>
      </div>
    </div>
  );
}
