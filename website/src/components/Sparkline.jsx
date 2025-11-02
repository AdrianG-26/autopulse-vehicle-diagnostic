import React, { useMemo } from 'react';

export default function Sparkline({ data, width = 160, height = 50, color = '#4f46e5' }) {
  const points = useMemo(() => {
    if (!data || data.length === 0) return '';
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    return data
      .map((v, i) => {
        const x = (i / (data.length - 1 || 1)) * width;
        const y = height - ((v - min) / range) * height;
        return `${x},${y}`;
      })
      .join(' ');
  }, [data, width, height]);

  return (
    <svg width={width} height={height}>
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
    </svg>
  );
} 