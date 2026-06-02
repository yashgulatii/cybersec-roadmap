import React from 'react';

export default function ProgressBar({ percentage, height = '4px', color = 'var(--green)' }) {
  const cleanPercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div style={{ width: '100%', height, background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
      <div style={{ width: `${cleanPercentage}%`, height: '100%', background: color }}></div>
    </div>
  );
}
