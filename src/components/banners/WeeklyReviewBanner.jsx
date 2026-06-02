// src/components/banners/WeeklyReviewBanner.jsx
// Purpose: Renders the weekly command report review detailing intelligence threat levels, focus targets, and stat changes.

import React from 'react';
import { useAppStore, storage } from '../../store/appStore';
import { getISOWeekString } from '../../utils/helpers';

export default function WeeklyReviewBanner() {
  const { weeklyReview, isWeeklyReviewDismissed, setIsWeeklyReviewDismissed } = useAppStore();

  if (!weeklyReview || isWeeklyReviewDismissed) return null;

  const isoWeek = getISOWeekString();

  let borderLeftColor = 'var(--accent-green)';
  let badgeColor = 'var(--accent-green)';
  if (weeklyReview.threatLevel === 'AMBER') {
    borderLeftColor = 'var(--accent-amber)';
    badgeColor = 'var(--accent-amber)';
  } else if (weeklyReview.threatLevel === 'RED') {
    borderLeftColor = 'var(--accent-coral)';
    badgeColor = 'var(--accent-coral)';
  }

  const handleDismiss = () => {
    storage.setItem(`dismissedReview:${isoWeek}`, 'true');
    setIsWeeklyReviewDismissed(true);
  };

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderLeft: `5px solid ${borderLeftColor}`,
      padding: '16px',
      marginBottom: '20px',
      fontFamily: 'var(--font-mono)',
      position: 'relative',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${badgeColor}`,
            color: badgeColor,
            padding: '2px 6px',
            fontSize: '11px',
            fontWeight: 'bold'
          }}>
            THREAT LEVEL: {weeklyReview.threatLevel}
          </span>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-main)', letterSpacing: '0.05em' }}>
            {weeklyReview.headline}
          </span>
        </div>
        <button
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >X</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
        <span>&gt; INSIGHT: {weeklyReview.insight}</span>
        <span>&gt; FOCUS: {weeklyReview.nextWeekFocus}</span>
        <span>&gt; STRONGEST STAT: <span style={{ color: 'var(--accent-green)' }}>{weeklyReview.strongestStat}</span> | WEAKEST STAT: <span style={{ color: 'var(--accent-coral)' }}>{weeklyReview.weakestStat}</span></span>
      </div>
    </div>
  );
}
