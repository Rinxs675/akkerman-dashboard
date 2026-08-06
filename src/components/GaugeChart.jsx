import React from 'react';

/**
 * Circular progress gauge component matching Google Presentation style
 */
export default function GaugeChart({ percentage = 0, label = 'Выполнение плана' }) {
  const clampedPct = Math.min(Math.max(percentage, 0), 100);
  const strokeWidth = 14;
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedPct / 100) * circumference;

  // Determine color based on completion percentage
  let colorClass = '#10B981'; // Emerald green
  if (percentage < 75) colorClass = '#F59E0B'; // Orange
  if (percentage < 50) colorClass = '#EF4444'; // Red

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg style={{ width: '180px', height: '180px', transform: 'rotate(-90deg)' }} viewBox="0 0 160 160">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={colorClass}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
          />
        </svg>
        {/* Inner percentage text */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}>
          <span style={{ fontSize: '2rem', fontWeight: 800, color: '#F8FAFC' }}>
            {percentage.toFixed(1)}%
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginTop: '4px' }}>
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}

