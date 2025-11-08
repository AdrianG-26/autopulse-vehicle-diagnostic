import React from "react";
import ChatWidget from "../components/ChatWidget";

export default function Contact({ onNavigate }) {
  // Get username from localStorage
  const getUsername = () => {
    try {
      const authData = localStorage.getItem("autopulse_auth");
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.username || "user";
      }
    } catch (e) {
      console.error("Error getting username:", e);
    }
    return "user";
  };

  return (
    <div
      className="page"
      style={{
        padding: "0",
        height: "calc(100vh - 64px)",
        display: "flex",
        overflow: "hidden",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "240px",
          backgroundColor: "#1e293b",
          padding: "20px",
          borderRight: "1px solid #334155",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
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
          onClick={() => onNavigate("Logs")}
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
            backgroundColor: "#334155",
            color: "#38bdf8",
            border: "2px solid #38bdf8",
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
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          backgroundColor: "#0f172a",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <ChatWidget currentUsername={getUsername()} embedded={true} />
        </div>
      </div>
    </div>
  );
}
