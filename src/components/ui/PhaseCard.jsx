// src/components/ui/PhaseCard.jsx
// Purpose: Renders a sidebar topic selection card with a status dot and progress bar.

import React from 'react';
import ProgressBar from './ProgressBar';

export default function PhaseCard({ title, progress, status, isSelected, onClick, taskFraction }) {
  let dotColor = 'var(--text-muted)';
  if (status === 'Complete') dotColor = 'var(--accent-terminal)';
  else if (status === 'In Progress') dotColor = 'var(--accent-primary)';

  return (
    <div
      onClick={onClick}
      className={`roadmap-sidebar-card ${isSelected ? 'selected' : ''}`}
      style={{
        background: isSelected ? 'var(--bg-card)' : 'var(--bg-card)',
        border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border)',
        padding: '12px 16px',
        cursor: 'pointer',
        
        boxShadow: isSelected ? '0 0 8px rgba(0, 200, 255, 0.2)' : 'none',
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          fontWeight: 'bold',
          color: isSelected ? 'var(--accent-primary)' : 'var(--text-main)'
        }}>
          {title}
        </span>
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: dotColor,
          display: 'inline-block',
          flexShrink: 0,
          boxShadow: `0 0 5px ${dotColor}`
        }}></span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <ProgressBar percentage={progress} color={status === 'Complete' ? 'var(--accent-terminal)' : 'var(--accent-primary)'} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          <span>{(status || '').toUpperCase()}</span>
          <span>{taskFraction ? `${taskFraction} (${progress}%)` : `${progress}%`}</span>
        </div>
      </div>
    </div>
  );
}
