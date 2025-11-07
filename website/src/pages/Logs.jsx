import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function Logs({ onNavigate }) {
  const [rawData, setRawData] = useState(null);
  const [pollingStatus, setPollingStatus] = useState("WAITING");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from("sensor_data")
          .select("*")
          .order("timestamp", { ascending: false })
          .limit(10);

        if (error) throw error;

        if (data && data.length > 0) {
          setRawData(data);
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
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      <h1>📋 Data Logs</h1>
      <p>Status: {pollingStatus}</p>
      {rawData && rawData.map((record, idx) => (
        <div key={idx} style={{ marginBottom: "1rem", padding: "1rem", backgroundColor: "white", borderRadius: "8px" }}>
          <p>Time: {new Date(record.timestamp).toLocaleString()}</p>
          <p>RPM: {record.rpm} | Speed: {record.vehicle_speed} km/h</p>
          <p>Temp: {record.coolant_temp}°C | Load: {record.engine_load}%</p>
        </div>
      ))}
    </div>
  );
}
