import React, { useEffect, useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Emissions from "./pages/Emissions";
import Engine from "./pages/Engine";
import Fuel from "./pages/Fuel";
import Login from "./pages/Login";
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

  // Note: Data fetching is now handled by individual pages using Supabase REST API + Realtime
  // No global polling service needed - each page subscribes directly to Supabase

  const handleLoginSuccess = (authData) => {
    console.log('🎉 handleLoginSuccess called with:', authData);
    
    if (!authData) {
      console.error('❌ handleLoginSuccess: authData is null/undefined');
      return;
    }
    
    // Save authentication data to localStorage
    const authPayload = {
      id: authData.id || null,
      username: authData.username || null,
      email: authData.email || null,
      keepSignedIn: true,
      loginTime: Date.now(),
    };
    
    console.log('💾 Saving to localStorage:', authPayload);
    localStorage.setItem("autopulse_auth", JSON.stringify(authPayload));
    
    // Update authentication state - this will trigger re-render and show dashboard
    setIsAuthenticated(true);
    console.log('✅ Authentication state updated to true');
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
    return <Dashboard onNavigate={setTab} />;
  };

  // Get user info from localStorage
  const getAuthData = () => {
    try {
      const savedAuth = localStorage.getItem("autopulse_auth");
      if (savedAuth) {
        return JSON.parse(savedAuth);
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  const authData = getAuthData();

  return (
    <div className="App">
      <Navbar 
        active={tab} 
        onChangeTab={setTab} 
        onLogout={handleLogout}
        userEmail={authData?.email}
        userId={authData?.id}
      />
      {renderPage()}
    </div>
  );
}

export default App;
