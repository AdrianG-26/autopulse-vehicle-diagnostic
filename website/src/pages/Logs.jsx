import React, { useEffect, useState } from "react";

export default function Logs({ onNavigate }) {
  const [logs, setLogs] = useState([]);
  const [pollingStatus, setPollingStatus] = useState("WAITING");
  const [lastUpdate, setLastUpdate] = useState(null);
  const [filter, setFilter] = useState("ALL"); // ALL, NORMAL, ADVISORY, WARNING, CRITICAL

  // Poll for latest data every 5 seconds (logs don't need frequent updates)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_BASE =
          process.env.REACT_APP_API_URL || "http://localhost:5000";
        const response = await fetch(`${API_BASE}/api/latest`);
        const result = await response.json();

        if (result.success && result.data) {
          // Add to logs with timestamp
          const logEntry = {
            ...result.data,
            localTimestamp: new Date().toISOString(),
          };

          setLogs((prev) => [logEntry, ...prev].slice(0, 200)); // Keep last 200 entries
          setPollingStatus("CONNECTED");
          setLastUpdate(new Date());
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

    // Poll every 5 seconds
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    if (filter === "ALL") return true;
    return log.ml_status === filter || log.status === filter;
  });

  // Clear logs
  const clearLogs = () => {
    if (window.confirm("Clear all logs?")) {
      setLogs([]);
    }
  };

  // Export logs as CSV
  const exportLogs = () => {
    if (logs.length === 0) {
      alert("No logs to export");
      return;
    }

    const headers = [
      "Timestamp",
      "RPM",
      "Speed",
      "Coolant°C",
      "Load%",
      "Throttle%",
      "ML Health",
      "Status",
    ];
    const csvContent = [
      headers.join(","),
      ...logs.map((log) =>
        [
          new Date(log.localTimestamp).toLocaleString(),
          log.rpm || 0,
          log.vehicle_speed || 0,
          log.coolant_temp || 0,
          log.engine_load?.toFixed(1) || 0,
          log.throttle_pos?.toFixed(1) || 0,
          log.ml_health_score || 0,
          log.ml_status || "UNKNOWN",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vehicle_logs_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Status colors
  const getStatusColor = (status) => {
    switch (status) {
      case "EXCELLENT":
      case "NORMAL":
        return "#10b981";
      case "ADVISORY":
        return "#f59e0b";
      case "WARNING":
        return "#ef4444";
      case "CRITICAL":
        return "#dc2626";
      default:
        return "#6b7280";
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#0f172a",
        color: "#e2e8f0",
      }}
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

        <button
          onClick={() => onNavigate("Dashboard")}
          style={{
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
          onClick={() => onNavigate("Emissions")}
          style={{
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
          🌿 Emissions
        </button>

        <button
          style={{
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
          📋 Logs
        </button>

        <button
          onClick={() => onNavigate("Settings")}
          style={{
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
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          padding: "30px",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "28px" }}>📋 Vehicle Data Logs</h1>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span
              style={{
                fontSize: "12px",
                color: "#94a3b8",
                backgroundColor: "#1e293b",
                padding: "6px 12px",
                borderRadius: "4px",
              }}
            >
              {pollingStatus === "CONNECTED"
                ? "🟢"
                : pollingStatus === "WAITING"
                ? "🟡"
                : "🔴"}{" "}
              {pollingStatus}
            </span>
            {lastUpdate && (
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                Updated: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setFilter("ALL")}
            style={{
              padding: "8px 16px",
              backgroundColor: filter === "ALL" ? "#38bdf8" : "#334155",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            All ({logs.length})
          </button>
          <button
            onClick={() => setFilter("EXCELLENT")}
            style={{
              padding: "8px 16px",
              backgroundColor: filter === "EXCELLENT" ? "#10b981" : "#334155",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            Excellent
          </button>
          <button
            onClick={() => setFilter("NORMAL")}
            style={{
              padding: "8px 16px",
              backgroundColor: filter === "NORMAL" ? "#10b981" : "#334155",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            Normal
          </button>
          <button
            onClick={() => setFilter("ADVISORY")}
            style={{
              padding: "8px 16px",
              backgroundColor: filter === "ADVISORY" ? "#f59e0b" : "#334155",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            Advisory
          </button>
          <button
            onClick={() => setFilter("WARNING")}
            style={{
              padding: "8px 16px",
              backgroundColor: filter === "WARNING" ? "#ef4444" : "#334155",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            Warning
          </button>
          <button
            onClick={exportLogs}
            style={{
              padding: "8px 16px",
              backgroundColor: "#8b5cf6",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
              marginLeft: "auto",
            }}
          >
            📥 Export CSV
          </button>
          <button
            onClick={clearLogs}
            style={{
              padding: "8px 16px",
              backgroundColor: "#dc2626",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            🗑️ Clear
          </button>
        </div>

        {/* Logs Table */}
        {filteredLogs.length === 0 ? (
          <div
            style={{
              backgroundColor: "#1e293b",
              borderRadius: "8px",
              padding: "40px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            <p style={{ fontSize: "18px", margin: 0 }}>No logs available</p>
            <p style={{ fontSize: "14px", margin: "10px 0 0 0" }}>
              {logs.length === 0
                ? "Waiting for data..."
                : "No logs match the selected filter"}
            </p>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: "#1e293b",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            {/* Table Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "180px 80px 80px 90px 80px 90px 100px 100px",
                gap: "10px",
                padding: "12px 16px",
                backgroundColor: "#334155",
                fontWeight: "bold",
                fontSize: "13px",
                color: "#cbd5e1",
                borderBottom: "1px solid #475569",
              }}
            >
              <div>Timestamp</div>
              <div>RPM</div>
              <div>Speed</div>
              <div>Coolant</div>
              <div>Load</div>
              <div>Throttle</div>
              <div>ML Health</div>
              <div>Status</div>
            </div>

            {/* Table Rows */}
            <div
              style={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto" }}
            >
              {filteredLogs.map((log, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "180px 80px 80px 90px 80px 90px 100px 100px",
                    gap: "10px",
                    padding: "12px 16px",
                    borderBottom: "1px solid #334155",
                    fontSize: "13px",
                    color: "#e2e8f0",
                    backgroundColor: idx % 2 === 0 ? "#1e293b" : "#1a2332",
                  }}
                >
                  <div style={{ color: "#94a3b8" }}>
                    {new Date(log.localTimestamp).toLocaleTimeString()}
                  </div>
                  <div>{log.rpm || 0}</div>
                  <div>{log.vehicle_speed || 0} mph</div>
                  <div>{log.coolant_temp || 0}°C</div>
                  <div>{log.engine_load?.toFixed(1) || 0}%</div>
                  <div>{log.throttle_pos?.toFixed(1) || 0}%</div>
                  <div
                    style={{
                      fontWeight: "bold",
                      color:
                        log.ml_health_score >= 90
                          ? "#10b981"
                          : log.ml_health_score >= 70
                          ? "#f59e0b"
                          : "#ef4444",
                    }}
                  >
                    {log.ml_health_score || 0}
                  </div>
                  <div>
                    <span
                      style={{
                        backgroundColor: getStatusColor(log.ml_status),
                        color: "#fff",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: "bold",
                      }}
                    >
                      {log.ml_status || "UNKNOWN"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
