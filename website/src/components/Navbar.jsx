import React from "react";
import SettingsMenu from "./SettingsMenu";

export default function Navbar({ active, onChangeTab, onLogout, userEmail, userId }) {
  // Removed duplicate tabs - navigation is now handled by sidebar
  return (
    <div className="navbar">
      <div className="brand">AutoPulse</div>
      <div className="nav-tabs">{/* Navigation moved to sidebar */}</div>
      <SettingsMenu userEmail={userEmail} userId={userId} onLogout={onLogout} />
    </div>
  );
}
