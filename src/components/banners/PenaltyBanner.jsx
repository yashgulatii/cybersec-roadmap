// src/components/banners/PenaltyBanner.jsx
// Purpose: Renders the warning banner detailing yesterday's critical task misses and XP penalty deductions.

import React from 'react';
import { useAppStore, storage, getYesterdayString } from '../../store/appStore';

export default function PenaltyBanner() {
  const { activePenaltyWarning, dismissWarning } = useAppStore();

  if (!activePenaltyWarning) return null;

  const yesterday = getYesterdayString();
  const yesterdayLogsRaw = storage.getItem(`log:${yesterday}`);
  let missedPenalizedCount = 0;
  let totalPenalty = 0;

  if (yesterdayLogsRaw) {
    try {
      const logs = JSON.parse(yesterdayLogsRaw);
      if (Array.isArray(logs)) {
        logs.forEach(log => {
          if (log.type === 'missed' && log.xpPenalty && log.xpPenalty < 0) {
            missedPenalizedCount++;
            totalPenalty += Math.abs(log.xpPenalty);
          }
        });
      }
    } catch { }
  }

  if (missedPenalizedCount === 0) return null;

  return (
    <div className="warning-banner" style={{
      background: 'rgba(255, 111, 97, 0.05)',
      border: '1px solid var(--accent-coral)',
      padding: '12px 16px',
      marginBottom: '20px',
      fontFamily: 'var(--font-mono)',
      fontSize: '13px',
      color: 'var(--accent-coral)',
      position: 'relative',
      boxShadow: '0 0 10px rgba(239, 68, 68, 0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>[!] OPERATIONAL ANOMALY: MISSED {missedPenalizedCount} CRITICAL TASKS YESTERDAY. PENALTY APPLIED: -{totalPenalty} XP.</span>
        <button
          onClick={dismissWarning}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent-coral)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >DISMISS WARNING</button>
      </div>
    </div>
  );
}
