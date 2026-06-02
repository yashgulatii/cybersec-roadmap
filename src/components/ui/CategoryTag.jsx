// src/components/ui/CategoryTag.jsx
// Purpose: Reusable colored category tag component.

import React from 'react';

export default function CategoryTag({ category }) {
  let color = 'var(--text-muted)';
  let background = 'rgba(255, 255, 255, 0.05)';

  const catUpper = category ? category.toUpperCase() : '';

  if (catUpper === 'DISCIPLINE' || catUpper === 'PERSONAL') {
    color = 'var(--accent-orange)';
    background = 'rgba(245, 166, 35, 0.05)';
  } else if (catUpper === 'PHYSICAL') {
    color = 'var(--accent-coral)';
    background = 'rgba(255, 111, 97, 0.05)';
  } else if (catUpper === 'OPS' || catUpper === 'LAB') {
    color = 'var(--accent-amber)';
    background = 'rgba(245, 166, 35, 0.05)';
  } else if (catUpper === 'COMMS' || catUpper === 'CAREER') {
    color = 'var(--accent-blue)';
    background = 'rgba(0, 200, 255, 0.05)';
  } else if (catUpper === 'INTEL' || catUpper === 'LEARNING') {
    color = 'var(--accent-green)';
    background = 'rgba(34, 197, 94, 0.05)';
  } else if (catUpper === 'TRAVEL') {
    color = '#ff3366';
    background = 'rgba(255, 51, 102, 0.05)';
  } else if (catUpper === 'CREATIVE') {
    color = '#bd5eff';
    background = 'rgba(189, 94, 255, 0.05)';
  }

  return (
    <span style={{
      color,
      background,
      border: `1px solid ${color}`,
      fontFamily: 'var(--font-mono)',
      fontSize: '9px',
      fontWeight: 'bold',
      padding: '1px 5px',
      letterSpacing: '0.05em',
      textTransform: 'uppercase'
    }}>
      {category}
    </span>
  );
}
