import React from 'react';

export default function Sidebar({ active = 'Overview', onSelect }) {
  const items = [
    { label: 'Dashboard', key: 'Overview', icon: '📊' },
    { label: 'Engine', key: 'Engine', icon: '🔧' },
    { label: 'Fuel', key: 'Fuel', icon: '⛽' },
  ];

  return (
    <aside style={{ 
      width: '250px', 
      backgroundColor: '#f8fafc', 
      borderRight: '1px solid #e2e8f0',
      padding: '24px 0',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh'
    }}>
      <nav style={{ flex: 1, padding: '16px 0' }}>
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => onSelect && onSelect(item.key)}
            style={{
              width: '100%',
              padding: '12px 24px',
              border: 'none',
              backgroundColor: active === item.key ? '#3b82f6' : 'transparent',
              color: active === item.key ? 'white' : '#64748b',
              fontSize: '14px',
              fontWeight: '500',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
            onMouseEnter={(e) => {
              if (active !== item.key) {
                e.target.style.backgroundColor = '#f1f5f9';
                e.target.style.color = '#475569';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = active === item.key ? '#3b82f6' : 'transparent';
              e.target.style.color = active === item.key ? 'white' : '#64748b';
            }}
          >
            <span style={{ fontSize: '16px' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
} 