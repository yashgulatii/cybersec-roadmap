// src/components/ui/StatusBadge.jsx
// Purpose: Reusable colored status badge.

import React from 'react';

export default function StatusBadge({ status }) {
  let badgeColor = 'var(--text-muted)';
  let background = 'rgba(255, 255, 255, 0.02)';
  let border = '1px solid var(--border-color)';

  if (status === 'Complete') {
    badgeColor = 'var(--accent-green)';
    background = 'rgba(34, 197, 94, 0.05)';
    border = '1px solid var(--accent-green)';
  } else if (status === 'In Progress') {
    badgeColor = 'var(--accent-amber)';
    background = 'rgba(245, 166, 35, 0.05)';
    border = '1px solid var(--accent-amber)';
  }

  return (
    <span style={{
      color: badgeColor,
      background,
      border,
      fontFamily: 'var(--font-mono)',
      fontSize: '10px',
      fontWeight: 'bold',
      padding: '2px 6px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }}>
      {status}
    </span>
  );
}
