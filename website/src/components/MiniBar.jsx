import React from 'react';

export default function MiniBar({ label, value, unit, color = '#16a34a', max = 150 }) {
  const pct = Math.max(0, Math.min(100, (Number(value) / max) * 100));
  return (
    <div className="mini-bar">
      <div className="mini-bar-row">
        <span className="mini-bar-label">{label}</span>
        <span className="mini-bar-value">{value}{unit ? unit : ''}</span>
      </div>
      <div className="mini-bar-track">
        <div className="mini-bar-fill" style={{ width: pct + '%', backgroundColor: color }} />
      </div>
    </div>
  );
} 