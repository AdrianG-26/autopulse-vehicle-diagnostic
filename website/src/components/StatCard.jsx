import React from 'react';

export default function StatCard({ label, value, unit, footer }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">
        {value !== undefined && value !== null ? value : '--'}
        {unit ? <span className="stat-unit">{unit}</span> : null}
      </div>
      {footer ? <div className="stat-footer">{footer}</div> : null}
    </div>
  );
} 