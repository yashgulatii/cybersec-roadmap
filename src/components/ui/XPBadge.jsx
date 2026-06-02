// src/components/ui/XPBadge.jsx
// Purpose: Reusable XP point indicator tag.

import React from 'react';

export default function XPBadge({ points }) {
  return (
    <span className="xp-reward" style={{
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid var(--accent-amber)',
      color: 'var(--accent-amber)',
      fontFamily: 'var(--font-mono)',
      fontSize: '10px',
      fontWeight: 'bold',
      padding: '1px 6px',
      letterSpacing: '0.05em'
    }}>
      +{points} XP
    </span>
  );
}
