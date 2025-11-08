import React from "react";

export default function Navbar({ active, onChangeTab, onLogout }) {
  // Removed duplicate tabs - navigation is now handled by sidebar
  return (
    <div className="navbar">
      <div className="brand">AutoPulse</div>
      <div className="nav-tabs">{/* Navigation moved to sidebar */}</div>
      <button className="logout-btn" onClick={onLogout}>
        Logout
      </button>
    </div>
  );
}
