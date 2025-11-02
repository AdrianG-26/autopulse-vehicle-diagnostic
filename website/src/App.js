import React, { useEffect, useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import Emissions from "./pages/Emissions";
import Engine from "./pages/Engine";
import Fuel from "./pages/Fuel";
import Login from "./pages/Login";
import Logs from "./pages/Logs";
import Settings from "./pages/Settings";
import { startPolling } from "./services/polling";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tab, setTab] = useState("Dashboard");

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const checkAuth = () => {
      const savedAuth = localStorage.getItem("autopulse_auth");
      if (savedAuth) {
        try {
          const authData = JSON.parse(savedAuth);
          if (authData.keepSignedIn && authData.username) {
            setIsAuthenticated(true);
            return;
          }
        } catch (e) {
          localStorage.removeItem("autopulse_auth");
        }
      }
    };

    checkAuth();
  }, []);

  // Auto-start polling on app load
  useEffect(() => {
    console.log("🚀 Starting data polling...");

    // Start polling with callbacks
    startPolling(
      (data) => {
        // Data callback - could dispatch to global state if needed
        // For now, pages will subscribe directly via polling service
        console.log("📊 Received data:", data);
      },
      (status, message) => {
        // Status callback
        console.log(`📡 Polling status: ${status} - ${message}`);
      }
    );

    // Cleanup on unmount (optional - polling continues across navigation)
    // return () => stopPolling();
  }, []);

  const handleLoginSuccess = (authData) => {
    // Save authentication data to localStorage
    localStorage.setItem(
      "autopulse_auth",
      JSON.stringify({
        username: authData.username,
        email: authData.email,
        keepSignedIn: true,
        loginTime: Date.now(),
      })
    );
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem("autopulse_auth");
    setIsAuthenticated(false);
    setTab("Dashboard");
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const renderPage = () => {
    if (tab === "Dashboard") return <Dashboard onNavigate={setTab} />;
    if (tab === "Engine") return <Engine onNavigate={setTab} />;
    if (tab === "Fuel") return <Fuel onNavigate={setTab} />;
    if (tab === "Emissions") return <Emissions onNavigate={setTab} />;
    if (tab === "Contact") return <Contact onNavigate={setTab} />;
    if (tab === "Logs") return <Logs onNavigate={setTab} />;
    if (tab === "Settings") return <Settings onNavigate={setTab} />;
    return <Dashboard onNavigate={setTab} />;
  };

  return (
    <div className="App">
      <Navbar active={tab} onChangeTab={setTab} onLogout={handleLogout} />
      {renderPage()}
    </div>
  );
}

export default App;
