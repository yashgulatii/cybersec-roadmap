// src/components/home/PriorityMissions.jsx
// Purpose: Displays a grid of the highest XP rewarding, uncompleted fixed daily tasks, recommending them as immediate priorities.

import React from 'react';
import { useAppStore } from '../../store/appStore';

export default function PriorityMissions() {
  const {
    fixedTasks,
    dailyState,
    flavors,
    handleToggleMission,
    setActivePage,
    events,
    isHoliday
  } = useAppStore();

  const getTodayString = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getActiveMissionsSuppressedEventToday = () => {
    const today = getTodayString();
    if (isHoliday) {
      return null;
    }
    return events.find(evt => evt.missionsActive === false && today >= evt.startDate && today <= evt.endDate);
  };

  const activeSuppressedEvent = getActiveMissionsSuppressedEventToday();

  const priorityMissions = (() => {
    const uncompletedFixed = fixedTasks.filter(task => !dailyState.completedTaskIds.includes(task.id));
    const sortedMissions = [...uncompletedFixed].sort((firstTask, secondTask) => secondTask.xp - firstTask.xp);
    return sortedMissions.slice(0, 4);
  })();

  return (
    <section className="daily-ops-section" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <h2 className="panel-title">Priority Missions</h2>
      <hr className="section-divider" />
      {activeSuppressedEvent ? (
        <div className="warning-banner" style={{
          background: 'rgba(100, 116, 139, 0.05)',
          border: '1px solid var(--text-muted)',
          padding: '12px 16px',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          color: 'var(--text-muted)',
          textAlign: 'center'
        }}>EVENT: {(activeSuppressedEvent?.name || '').toUpperCase()} — MISSIONS SUSPENDED</div>
      ) : (
        <div className="missions-grid">
          {priorityMissions.map(task => {
            const isCompleted = dailyState.completedTaskIds.includes(task.id);
            const displayTitle = flavors[task.id]?.title ?? task.name ?? task.title;
            const briefing = flavors[task.id]?.briefing;
            return (
              <div
                key={task.id}
                className={`mission-card ${isCompleted ? 'completed' : ''}`}
                onClick={(e) => handleToggleMission(task.id, task.xp, false, null, null, e)}
              >
                <div className="checkbox-container">
                  <span className="checkmark-icon"></span>
                </div>
                <div className="mission-details">
                  <span className="mission-title">{displayTitle}</span>
                  {briefing && (
                    <span className="mission-briefing" style={{
                      display: 'block',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      marginTop: '2px',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      {briefing}
                    </span>
                  )}
                  <div className="mission-meta">
                    <span className={`badge badge-${(task?.category || '').toLowerCase()}`}>{task.category}</span>
                    <span className="xp-reward">+{task.xp} XP</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div style={{ marginTop: '12px', textAlign: 'center' }}>
        <button
          onClick={() => setActivePage('missions')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent-amber)',
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            textDecoration: 'underline',
            letterSpacing: '0.05em'
          }}
        >VIEW ALL MISSIONS →</button>
      </div>
    </section>
  );
}
