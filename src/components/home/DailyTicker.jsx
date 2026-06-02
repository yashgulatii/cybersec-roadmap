// src/components/home/DailyTicker.jsx
// Purpose: Displays the daily operational mission ticker, enabling operators to choose active phases, track streaks, and mark task completeness.

import React from 'react';
import { useAppStore } from '../../store/appStore';

export default function DailyTicker() {
  const {
    tickerTasks,
    tickerPhase,
    consistencyStreak,
    handleTickerPhaseChange,
    handleToggleTickerTask
  } = useAppStore();

  const completedCount = tickerTasks.filter(task => task.completed).length;

  return (
    <section className="todays-mission-panel" style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      padding: '20px',
      fontFamily: 'var(--font-mono)',
      position: 'relative'
    }}>
      {/* Panel Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px dashed var(--border-color)',
        paddingBottom: '12px',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>🎯</span>
          <h2 className="panel-title" style={{ margin: 0, fontSize: '15px', color: 'var(--accent-amber)', letterSpacing: '0.05em' }}>
            TODAY'S MISSION // DAILY OPERATIONAL TICKER
          </h2>
        </div>
        
        {/* Consistency Streak Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(245, 166, 35, 0.05)',
          border: '1px solid var(--accent-orange)',
          padding: '4px 10px',
          color: 'var(--accent-orange)',
          boxShadow: '0 0 8px rgba(245, 166, 35, 0.1)',
          fontWeight: 'bold',
          fontSize: '12px'
        }}>
          🔥 Day {consistencyStreak} of Consistency
        </div>
      </div>

      {/* Phase Selector & Info */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px',
        background: 'rgba(255, 255, 255, 0.02)',
        padding: '8px 12px',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ACTIVE PHASING:</span>
          <select
            value={tickerPhase}
            onChange={(e) => handleTickerPhaseChange(e.target.value)}
            className="dark-date-picker"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              padding: '2px 8px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--accent-amber)'
            }}
          >
            <option value="phase1_hunting">Phase 1 (Job Hunting)</option>
            <option value="phase1_employed">Phase 1 (Employed)</option>
            <option value="phase2">Phase 2 (Momentum)</option>
            <option value="phase3">Phase 3 (Expansion)</option>
            <option value="phase4">Phase 4 (Mastery)</option>
          </select>
        </div>
        
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          STATUS: <span style={{ color: completedCount >= 2 ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
            {completedCount}/3 COMPLETED {completedCount >= 2 ? '(STREAK ACTIVE)' : ''}
          </span>
        </div>
      </div>

      {/* Task List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {tickerTasks.map((task, index) => {
          let categoryColor = 'var(--accent-amber)';
          let categoryLabel = 'LEARNING';
          if (task.category === 'personal') {
            categoryColor = 'var(--accent-green)';
            categoryLabel = 'FINANCIAL / PERS';
          } else if (task.category === 'creative') {
            categoryColor = 'var(--accent-blue)';
            categoryLabel = 'CREATIVE / TRAV';
          }
          
          return (
            <div
              key={index}
              onClick={() => handleToggleTickerTask(index)}
              className={!task.completed ? "task-pulse-card" : ""}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: task.completed ? 'rgba(255, 255, 255, 0.02)' : 'var(--bg-card)',
                border: `1px solid ${task.completed ? 'var(--border-color)' : 'var(--accent-amber)'}`,
                padding: '12px 16px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative'
              }}
            >
              {/* Custom Checkbox */}
              <div style={{
                width: '18px',
                height: '18px',
                border: `2px solid ${task.completed ? 'var(--accent-green)' : 'var(--accent-amber)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: task.completed ? 'var(--accent-green)' : 'none',
                flexShrink: 0,
                transition: 'all 0.2s'
              }}>
                {task.completed && <span style={{ color: 'var(--bg-card)', fontWeight: 'bold', fontSize: '12px' }}>✓</span>}
              </div>
              
              {/* Task Title */}
              <span style={{
                fontSize: '13px',
                color: task.completed ? 'var(--text-muted)' : 'var(--text-main)',
                textDecoration: task.completed ? 'line-through' : 'none',
                flex: 1,
                lineHeight: '1.4'
              }}>
                {task.title}
              </span>

              {/* Category Badge */}
              <span style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${categoryColor}`,
                color: categoryColor,
                fontSize: '9px',
                fontWeight: 'bold',
                padding: '2px 6px',
                letterSpacing: '0.05em',
                flexShrink: 0
              }}>
                {categoryLabel}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
