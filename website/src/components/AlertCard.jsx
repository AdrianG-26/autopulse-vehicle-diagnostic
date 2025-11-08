import React from 'react';

export default function AlertCard({ type = 'info', title, message, timestamp }) {
  const colors = {
    info: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
    warning: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
    error: { bg: '#fee2e2', border: '#dc2626', text: '#991b1b' },
    success: { bg: '#dcfce7', border: '#16a34a', text: '#166534' }
  };

  const color = colors[type] || colors.info;

  return (
    <div style={{
      backgroundColor: color.bg,
      border: `1px solid ${color.border}`,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: 600, color: color.text, marginBottom: 4 }}>{title}</div>
          <div style={{ color: color.text, fontSize: 14 }}>{message}</div>
        </div>
        {timestamp && (
          <div style={{ fontSize: 12, color: color.text, opacity: 0.8 }}>
            {new Date(timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
} 