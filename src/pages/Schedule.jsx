// src/pages/Schedule.jsx
// Purpose: Displays the detailed full-day operational schedule timeline, tracking active block highlights dynamically with color-coded custom cards.

import React from 'react';
import { useAppStore } from '../store/appStore';
import { SCHEDULE_BLOCKS } from '../data/characterData';

export default function Schedule() {
  const { customSchedule = [] } = useAppStore();
  const schedule = (customSchedule && customSchedule.length > 0) ? customSchedule : SCHEDULE_BLOCKS;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const getBlockColorStyles = (block) => {
    const name = (block.name || block.label || '').toUpperCase();
    const cat = (block.category || block.type || '').toLowerCase();
    
    // 1. Study (Deep Ops, Project Build, Applications, Secondary Ops, Intel Review) -> Yellow
    if (
      cat === 'primary' || 
      cat === 'secondary' || 
      cat === 'light' || 
      name.includes('OPS') || 
      name.includes('BUILD') || 
      name.includes('INTEL')
    ) {
      return {
        bg: 'rgba(251, 191, 36, 0.08)',
        border: '1px solid rgba(251, 191, 36, 0.3)',
        text: '#fbbf24',
        label: 'STUDY',
        shadow: 'rgba(251, 191, 36, 0.15)'
      };
    }
    
    // 2. Rest / Recovery / Exercise (Field Break, Patrol, PT, Power nap, chow) -> Green
    if (
      cat === 'rest' || 
      cat === 'sideop' || 
      name.includes('BREAK') || 
      name.includes('PATROL') || 
      name.includes('TRAINING') || 
      name.includes('CHOW') || 
      name.includes('NAP') || 
      name.includes('REST PHASE')
    ) {
      return {
        bg: 'rgba(74, 222, 128, 0.08)',
        border: '1px solid rgba(74, 222, 128, 0.3)',
        text: '#4ade80',
        label: 'REST',
        shadow: 'rgba(74, 222, 128, 0.15)'
      };
    }
    
    // 3. Discipline (Wake, Rituals, Brief, AAR, Comms Blackout, Stand Down / Sleep) -> Dark Blue
    return {
      bg: 'rgba(30, 58, 138, 0.25)',
      border: '1px solid rgba(96, 165, 250, 0.4)',
      text: '#60a5fa',
      label: 'DISCIPLINE',
      shadow: 'rgba(59, 130, 246, 0.15)'
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', padding: '4px' }}>
      <h2 className="panel-title">✎ OPERATIONAL ROUTINE TIMELINE</h2>
      <hr className="section-divider" style={{ marginBottom: '10px' }} />

      <div className="schedule-container">
        {(schedule ?? []).map((block, idx) => {
          let startHour = 0, startMinute = 0;
          let endHour = 0, endMinute = 0;
          
          if (block.start) {
            const parts = block.start.split(':');
            if (parts.length === 2) [startHour, startMinute] = (parts ?? []).map(Number);
          } else if (block.time) {
            const parts = block.time.split(':');
            if (parts.length === 2) [startHour, startMinute] = (parts ?? []).map(Number);
          } else if (block.startMin !== undefined) {
            startHour = Math.floor(block.startMin / 60);
            startMinute = block.startMin % 60;
          }

          if (block.end) {
            const parts = block.end.split(':');
            if (parts.length === 2) [endHour, endMinute] = (parts ?? []).map(Number);
          } else if (block.endMin !== undefined) {
            endHour = Math.floor(block.endMin / 60);
            endMinute = block.endMin % 60;
          }

          const startMinutesTotal = startHour * 60 + startMinute;
          let endMinutesTotal = endHour * 60 + endMinute;

          let adjustedMinutes = currentMinutes;
          if (currentMinutes < 330) {
            adjustedMinutes = currentMinutes + 1440;
          }

          if (endMinutesTotal < startMinutesTotal) {
            endMinutesTotal += 1440;
          }

          const isActive = adjustedMinutes >= startMinutesTotal && adjustedMinutes < endMinutesTotal;

          const blockStart = block.start || block.time || `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;
          const blockEnd = block.end || `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
          const blockLabel = block.label || block.name || '';
          const blockDesc = block.description || block.desc || '';

          const styles = getBlockColorStyles(block);

          return (
            <div key={block.id || idx} className="schedule-block-container">
              {/* Left Column: Timeline Markers */}
              <div
                className={`schedule-time-badge ${isActive ? 'active' : ''}`}
                style={{
                  color: isActive ? styles.text : 'var(--text-secondary)',
                  fontWeight: isActive ? 'bold' : 'normal',
                  borderColor: isActive ? styles.text : 'var(--border)',
                  boxShadow: isActive ? `0 0 12px ${styles.shadow}` : 'none'
                }}
              >
                <span>{blockStart}</span>
                <div className="schedule-time-line" style={{ backgroundColor: isActive ? styles.text : 'var(--text-dim)' }}></div>
                <span>{blockEnd}</span>
              </div>

              {/* Right Column: Colored Card */}
              <div
                style={{
                  flex: 1,
                  background: styles.bg,
                  border: styles.border,
                  borderLeft: `4px solid ${styles.text}`,
                  borderRadius: 'var(--r-lg)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  boxShadow: isActive ? `0 0 20px ${styles.shadow}` : 'none',
                  position: 'relative',
                  transition: 'all 200ms ease'
                }}
              >
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '16px',
                      background: styles.text,
                      color: 'var(--bg-page)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '9px',
                      fontWeight: 'bold',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      letterSpacing: '0.05em'
                    }}
                  >
                    ACTIVE BLOCK
                  </div>
                )}
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: 'var(--text-main)',
                      textTransform: 'uppercase'
                    }}
                  >
                    {blockLabel}
                  </span>
                  <span
                    style={{
                      fontSize: '9px',
                      fontFamily: 'var(--font-mono)',
                      borderColor: styles.text,
                      border: `1px solid ${styles.text}`,
                      color: styles.text,
                      padding: '0 5px',
                      borderRadius: '3px',
                      fontWeight: 'bold'
                    }}
                  >
                    {styles.label}
                  </span>
                </div>

                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    lineHeight: '1.4'
                  }}
                >
                  {blockDesc}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

