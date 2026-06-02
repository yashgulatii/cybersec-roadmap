// src/components/ui/TaskCard.jsx
// Purpose: Reusable task item card styled with cyberpunk elements, indicating required status, day/time sub-labels, and XP rewards.

import CategoryTag from './CategoryTag';
import XPBadge from './XPBadge';

export default function TaskCard({ task, completed, onToggle }) {
  const xpPoints = task.xp !== undefined ? task.xp : (task.xpReward !== undefined ? task.xpReward : 0);

  const activeBorderColor = 'var(--border-color)';
  const activeCheckboxColor = 'var(--accent-amber)';

  return (
    <div
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: completed ? 'rgba(255, 255, 255, 0.01)' : 'var(--bg-card)',
        border: `1px solid ${completed ? 'var(--border-color)' : activeBorderColor}`,
        padding: '12px 16px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        gap: '12px',
        position: 'relative',
        boxShadow: 'none'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        {/* Checkbox */}
        <div style={{
          width: '18px',
          height: '18px',
          border: `2px solid ${completed ? 'var(--accent-green)' : activeCheckboxColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: completed ? 'var(--accent-green)' : 'none',
          flexShrink: 0,
          transition: 'all 0.2s'
        }}>
          {completed && <span style={{ color: 'var(--bg-card)', fontWeight: 'bold', fontSize: '11px' }}>✓</span>}
        </div>

        {/* Text Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: completed ? 'var(--text-muted)' : 'var(--text-main)',
            textDecoration: completed ? 'line-through' : 'none',
            lineHeight: '1.4'
          }}>
            {task.title}
          </span>
          
          {/* Sub-label for metadata */}
          {(task.day || task.estimatedMinutes) && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '2px' }}>
              {task.day && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                  {(task?.day || '').toUpperCase()}
                </span>
              )}
              {task.estimatedMinutes && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-amber)', opacity: 0.85 }}>
                  ⏱ {task.estimatedMinutes} MINS
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tags & Rewards */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {task.category && <CategoryTag category={task.category} />}
        {xpPoints > 0 && <XPBadge points={xpPoints} />}
      </div>
    </div>
  );
}
