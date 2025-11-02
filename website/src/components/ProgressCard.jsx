import React from 'react';

export default function ProgressCard({ title, percent = 0, caption }) {
  const pct = Math.max(0, Math.min(100, Number(percent)));
  return (
    <div className="card">
      <div className="card-header-row">
        <div className="card-title">{title}</div>
      </div>
      <div className="progress">
        <div className="progress-bar" style={{ width: pct + '%' }} />
      </div>
      <div className="progress-row">
        <div className="progress-value">{pct}%</div>
        {caption && <div className="progress-caption">{caption}</div>}
      </div>
    </div>
  );
} 