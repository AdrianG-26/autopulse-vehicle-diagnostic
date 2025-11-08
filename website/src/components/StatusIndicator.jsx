import React from 'react';

export default function StatusIndicator({ status, label }) {
  const colors = {
    connected: '#16a34a',
    disconnected: '#dc2626',
    connecting: '#f59e0b',
    error: '#dc2626',
    na: '#9ca3af'
  };

  const text = status === 'na' ? `${label}: N/A` : label;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: colors[status] || '#6b7280'
        }}
      />
      <span style={{ fontSize: 14, color: '#6b7280' }}>{text}</span>
    </div>
  );
} 