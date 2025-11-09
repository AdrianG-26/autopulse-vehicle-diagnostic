import React, { useMemo } from 'react';

export default function DonutProgress({ 
  size = 56, 
  stroke = 6, 
  percent, 
  value, 
  max = 100, 
  label = '', 
  unit = '', 
  color = '#2563eb', 
  bg = '#e5e7eb' 
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate percent from value/max if percent not provided
  const calculatedPercent = percent !== undefined 
    ? percent 
    : (value !== undefined && max > 0 ? (value / max) * 100 : 0);
  
  const clamped = Math.max(0, Math.min(100, Number(calculatedPercent)));
  const dashOffset = useMemo(() => circumference * (1 - clamped / 100), [circumference, clamped]);
  
  // Display value if provided, otherwise show percent
  const displayValue = value !== undefined ? Math.round(value) : Math.round(clamped);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={bg}
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={size * 0.28}
        fontWeight="700"
        fill="#1f2937"
      >
        {displayValue}
      </text>
      {label && (
        <text
          x="50%"
          y="65%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize={size * 0.12}
          fontWeight="500"
          fill="#6b7280"
        >
          {label}
        </text>
      )}
      {unit && value !== undefined && (
        <text
          x="50%"
          y="75%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize={size * 0.1}
          fill="#9ca3af"
        >
          {unit}
        </text>
      )}
    </svg>
  );
} 