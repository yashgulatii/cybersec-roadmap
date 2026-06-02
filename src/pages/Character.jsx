import React, { useMemo } from 'react';
import { useAppStore, getTodayString } from '../store/appStore';
import { useXP } from '../hooks/useXP';
import ProgressBar from '../components/ui/ProgressBar';

export default function Character() {
  const { profile, chainProgress, stateToday, state } = useAppStore();
  const { levelProgress } = useXP(profile);
  const level = levelProgress?.level || 1;

  // Threat assessment logic (based on completed tasks)
  const completedCountToday = useMemo(() => {
    const today = getTodayString();
    const todayLogs = state?.logs?.[today] ?? [];
    return todayLogs.filter(entry => entry.type === 'completed').length;
  }, [state?.logs]);

  const expectedDailyCount = 12;
  const threatScore = Math.min(5, Math.max(0, Math.round((completedCountToday / expectedDailyCount) * 5)));
  const threatStr = '★'.repeat(threatScore) + '☆'.repeat(5 - threatScore);

  const streak = profile?.streak ?? 0;
  const mentalState = useMemo(() => {
    if (streak >= 3) return 'FOCUSED';
    if (streak >= 1) return 'NOMINAL';
    
    // streak === 0
    const today = new Date();
    let completionsInLast2Days = 0;
    for (let i = 1; i <= 2; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayLogs = state?.logs?.[dateStr] ?? [];
      const hasCompletions = dayLogs.some(entry => entry.type === 'completed');
      if (hasCompletions) completionsInLast2Days++;
    }
    return completionsInLast2Days > 0 ? 'DEGRADED' : 'AT RISK';
  }, [streak, state?.logs]);

  // Spaced row helper style
  const rowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid var(--border)'
  };

  const labelStyle = {
    color: 'var(--text-secondary)',
    fontSize: '11px',
    letterSpacing: '0.15em'
  };

  const valueStyle = {
    color: 'var(--text-primary)',
    fontSize: '11px',
    letterSpacing: '0.08em',
    fontWeight: 'bold'
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', fontFamily: 'var(--font)' }}>
      
      {/* OPERATOR STATS */}
      <div className="card" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="card-header">OPERATOR STATS</div>
        <div style={rowStyle}><span style={labelStyle}>NAME</span><span style={valueStyle}>YASH GULATI</span></div>
        <div style={rowStyle}><span style={labelStyle}>OPERATOR ID</span><span style={valueStyle}>YG-01</span></div>
        <div style={rowStyle}><span style={labelStyle}>INCEPT DATE</span><span style={valueStyle}>2026-05-26</span></div>
        <div style={rowStyle}><span style={labelStyle}>FUNCTION</span><span style={valueStyle}>SOC ANALYST CANDIDATE</span></div>
        <div style={rowStyle}><span style={labelStyle}>PHASE STATUS</span><span style={valueStyle}>FOUNDATION</span></div>
        <div style={rowStyle}><span style={labelStyle}>MENTAL STATE</span><span style={valueStyle}>{mentalState}</span></div>
        <div style={rowStyle}><span style={labelStyle}>LAST ACTIVE</span><span style={valueStyle}>{profile?.lastActiveDate || getTodayString()}</span></div>
        <div style={rowStyle}><span style={labelStyle}>THREAT ASSESSMENT</span><span style={valueStyle}>{threatStr}</span></div>
      </div>

      {/* Bottom: SKILL BARS */}
      <div className="card" style={{ gridColumn: '1 / -1', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="card-header">SKILL PROFICIENCY</div>
        {Object.entries(chainProgress || {}).map(([key, val]) => {
          const name = key.toUpperCase();
          const step = typeof val === 'number' ? val : (val?.currentStep ?? 0);
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', fontFamily: 'var(--font)' }}>
              <span className="field-name" style={{ width: '150px', textAlign: 'left', fontSize: '11px', letterSpacing: '0.05em' }}>{name}</span>
              <div style={{ flex: 1, padding: '0 16px' }}>
                <ProgressBar percentage={(step / 8) * 100} color="var(--green)" />
              </div>
              <span style={{ marginLeft: '16px', color: 'var(--text-secondary)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                {String(step).padStart(2, '0')}/08
              </span>
            </div>
          );
        })}
        {(!chainProgress || Object.keys(chainProgress).length === 0) && (
          <div style={{ textAlign: 'center', margin: '20px 0', color: 'var(--text-dim)' }}>NO SKILL DATA FOUND</div>
        )}
      </div>

    </div>
  );
}
