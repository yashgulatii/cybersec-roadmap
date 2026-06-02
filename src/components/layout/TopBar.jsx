import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { useXP } from '../../hooks/useXP';

export default function TopBar() {
  const {
    activePage,
    setActivePage,
    setShowHolidayModal,
    profile,
    consistencyStreak
  } = useAppStore();
  const { levelProgress } = useXP(profile);
  const level = levelProgress?.level || 1;

  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000;
      const ist = new Date(now.getTime() + istOffset);

      const hh = String(ist.getUTCHours()).padStart(2, '0');
      const mm = String(ist.getUTCMinutes()).padStart(2, '0');
      const ss = String(ist.getUTCSeconds()).padStart(2, '0');

      const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const dayName = days[ist.getUTCDay()];

      const dd = String(ist.getUTCDate()).padStart(2, '0');
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const mmm = months[ist.getUTCMonth()];
      const yyyy = ist.getUTCFullYear();

      setTimeStr(`${dayName}, ${dd} ${mmm} ${yyyy} // ${hh}:${mm}:${ss} IST`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const pageName = activePage ? (activePage || '').toUpperCase() : 'HOME';
  const displayXp = profile?.totalXp ?? 0;
  const displayStreak = profile?.streak ?? consistencyStreak ?? 0;

  return (
    <>
      <header style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        marginBottom: '20px'
      }}>
        {/* Left Side: Breadcrumb & Clock */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.15em' }}>
            <span style={{ color: 'var(--text-dim)' }}>OPERATOR TERMINAL</span>
            <span style={{ color: 'var(--text-dim)', margin: '0 6px' }}>/</span>
            <span style={{ color: 'var(--text-primary)' }}>{pageName}</span>
          </div>
          <div style={{ fontSize: '9px', color: 'var(--text-dim)' }}>
            28.6139°N 77.2090°E // {timeStr}
          </div>
        </div>

        {/* Right Side: Stat Pills */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          
          {/* Streak Pill */}
          <div style={{
            background: 'var(--bg-card-accent)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-sm)',
            padding: '4px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>🔥</span>
            <span style={{ color: 'var(--amber)', fontWeight: 600 }}>{displayStreak}</span>
            <span style={{ color: 'var(--text-dim)', fontSize: '9px' }}>DAYS</span>
          </div>

          {/* XP Pill */}
          <div style={{
            background: 'var(--bg-card-accent)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-sm)',
            padding: '4px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ color: 'var(--text-dim)', fontSize: '9px' }}>XP</span>
            <span style={{ color: 'var(--violet)', fontWeight: 600 }}>{displayXp}</span>
          </div>

          {/* Level Pill */}
          <div style={{
            background: 'var(--violet-bg)',
            border: '1px solid var(--violet-border)',
            borderRadius: 'var(--r-sm)',
            padding: '4px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ color: 'var(--text-dim)', fontSize: '9px' }}>LVL</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{level}</span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', marginLeft: '8px' }}>
            <button 
              onClick={() => setShowHolidayModal(true)}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--text-dim)',
                padding: '4px 12px',
                borderRadius: 'var(--r-sm)',
                fontSize: '10px',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                transition: 'all 150ms'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-hover)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-dim)';
              }}
            >
              MARK HOLIDAY
            </button>
            <button 
              onClick={() => setActivePage('debrief')}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--text-dim)',
                padding: '4px 12px',
                borderRadius: 'var(--r-sm)',
                fontSize: '10px',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                transition: 'all 150ms'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--blue-border)';
                e.currentTarget.style.color = 'var(--blue)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-dim)';
              }}
            >
              VIEW DEBRIEF
            </button>
          </div>

        </div>
      </header>
    </>
  );
}
