// src/components/home/DailyBriefing.jsx
// Purpose: Renders the daily operational briefing overview, highlighting active skill progression chains and active project actions.

import React from 'react';
import { useAppStore, mapDomainKey } from '../../store/appStore';

export default function DailyBriefing() {
  const {
    state,
    dailyState,
    chainProgress,
    projectProgress,
    projectCompletedTasks,
    fixedTasks,
    chains,
    todaysDomain,
    activeProject,
    profile,
    justUnlockedStepId,
    flavors,
    handleToggleMission,
    handleToggleProjectTask,
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

  const xpToday = (() => {
    let total = 0;
    dailyState.completedTaskIds.forEach(id => {
      if (id.startsWith('chain:')) {
        const parts = id.split(':');
        if (parts.length === 3) {
          const chainName = parts[1];
          const stepIndex = parseInt(parts[2], 10);
          const chain = chains[chainName];
          if (chain && chain[stepIndex]) {
            total += chain[stepIndex].xp;
          }
        }
      } else {
        const task = fixedTasks.find(t => t.id === id);
        if (task) {
          total += task.xp;
        }
      }
    });

    Object.keys(projectCompletedTasks).forEach(projId => {
      const completedToday = projectCompletedTasks[projId] || [];
      const project = activeProject && activeProject.id === projId ? activeProject : null;
      if (project) {
        completedToday.forEach(taskId => {
          const task = project.tasks.find(t => t.id === taskId);
          if (task) {
            total += task.xp;
          }
        });
      }
    });
    return total;
  })();

  const tasksLeft = (() => {
    const fixedLeft = fixedTasks.filter(t => !dailyState.completedTaskIds.includes(t.id)).length;
    const mappedActive = mapDomainKey(todaysDomain);
    const currentStep = chainProgress[mappedActive] || 0;
    const chain = chains[mappedActive];
    const chainTaskId = `chain:${mappedActive}:${currentStep}`;
    const chainLeft = (chain && currentStep < chain.length && !dailyState.completedTaskIds.includes(chainTaskId)) ? 1 : 0;
    
    let projectLeft = 0;
    if (activeProject) {
      const progressVal = projectProgress[activeProject.id] || 0;
      const completedToday = projectCompletedTasks[activeProject.id] || [];
      if (progressVal < activeProject.tasks.length && completedToday.length === 0) {
        projectLeft = 1;
      }
    }
    return fixedLeft + chainLeft + projectLeft;
  })();

  const chainId = mapDomainKey(todaysDomain);
  const activeSuppressedEvent = getActiveMissionsSuppressedEventToday();

  return (
    <section className="main-objective-section" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <h2 className="panel-title">Today's Briefing</h2>
      <hr className="section-divider" />
      <div className="main-objective-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '14px',
          fontWeight: 'bold',
          color: 'var(--accent-amber)',
          borderBottom: '1px dashed var(--border-color)',
          paddingBottom: '8px'
        }}>
          TODAY'S DOMAIN: {(chainId || '').toUpperCase()}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            &gt; ACTIVE SKILL PATH MISSION
          </span>
          {activeSuppressedEvent ? (
            <div style={{
              background: 'rgba(100, 116, 139, 0.05)',
              border: '1px dashed var(--text-muted)',
              color: 'var(--text-muted)',
              padding: '10px 14px',
              fontSize: '13px',
              fontFamily: 'var(--font-mono)',
              textAlign: 'center'
            }}>PAUSED FOR EVENT: {(activeSuppressedEvent?.name || '').toUpperCase()}</div>
          ) : (() => {
            const chain = chains[chainId];
            if (!chain) return null;
            const tasksArray = Array.isArray(chain) ? chain : (chain.tasks || []);
            const todayStr = getTodayString();
            
            // Get all steps of this chain completed TODAY
            const completedTodaySteps = [];
            for (let idx = 0; idx < tasksArray.length; idx++) {
              const taskId = `chain:${chainId}:${idx}`;
              if ((state?.dailyCompletions?.[todayStr] ?? []).includes(taskId)) {
                completedTodaySteps.push({
                  id: taskId,
                  stepIdx: idx,
                  task: tasksArray[idx],
                  completed: true
                });
              }
            }

            // Get the current incomplete step (if any)
            const currentIdx = chainProgress[chainId] !== undefined ? chainProgress[chainId] : 0;
            const visible = [...completedTodaySteps];
            if (currentIdx < tasksArray.length) {
              const currentTaskId = `chain:${chainId}:${currentIdx}`;
              if (!visible.some(s => s.id === currentTaskId)) {
                visible.push({
                  id: currentTaskId,
                  stepIdx: currentIdx,
                  task: tasksArray[currentIdx],
                  completed: false
                });
              }
            }

            if (visible.length === 0 && currentIdx >= tasksArray.length) {
              return (
                <div style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px dashed var(--accent-green)',
                  color: 'var(--accent-green)',
                  padding: '10px 14px',
                  fontSize: '13px',
                  fontFamily: 'var(--font-mono)',
                  textAlign: 'center',
                }}>{chainId} CHAIN COMPLETE — ALL STEPS CLEARED</div>
              );
            }

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {visible.map(({ id, stepIdx, task, completed }) => {
                  const isJustUnlocked = justUnlockedStepId === id;
                  const displayTitle = flavors[id]?.title ?? task.name ?? task.title;
                  const briefing = flavors[id]?.briefing;
                  return (
                    <div
                      key={id}
                      className={`mission-card ${completed ? 'completed' : ''} ${isJustUnlocked ? 'unlocked-flash' : ''}`}
                      onClick={(e) => handleToggleMission(id, task.xp, true, chainId, stepIdx, e)}
                      style={{ width: '100%', padding: '10px 14px' }}
                    >
                      <div className="checkbox-container" style={{ width: '16px', height: '16px', borderColor: completed ? 'var(--green)' : 'var(--accent-green)' }}>
                        {completed && <span className="checkmark-icon" style={{ background: 'var(--green)' }}></span>}
                      </div>
                      <div className="mission-details" style={{ gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                          <span className="mission-title" style={{ fontSize: '13px', color: completed ? 'var(--text-muted)' : 'var(--text-main)', textDecoration: completed ? 'line-through' : 'none' }}>{displayTitle}</span>
                          {isJustUnlocked && (
                            <span style={{
                              fontSize: '9px',
                              fontFamily: 'var(--font-mono)',
                              color: 'var(--accent-green)',
                              border: '1px solid var(--accent-green)',
                              padding: '0 3px',
                              marginLeft: '6px',
                              whiteSpace: 'nowrap'
                            }}>
                              UNLOCKED
                            </span>
                          )}
                        </div>
                        {briefing && (
                          <span className="mission-briefing" style={{
                            display: 'block',
                            fontSize: '10px',
                            color: 'var(--text-muted)',
                            fontFamily: 'var(--font-mono)'
                          }}>
                            {briefing}
                          </span>
                        )}
                        <div className="mission-meta">
                          <span className={`badge badge-${(task?.category || '').toLowerCase()}`} style={{ fontSize: '9px', padding: '0px 4px' }}>{task.category}</span>
                          <span className="xp-reward" style={{ fontSize: '11px' }}>+{task.xp} XP</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            &gt; ACTIVE PROJECT OPS
          </span>
          {activeSuppressedEvent ? (
            <div style={{
              background: 'rgba(100, 116, 139, 0.05)',
              border: '1px dashed var(--text-muted)',
              color: 'var(--text-muted)',
              padding: '10px 14px',
              fontSize: '13px',
              fontFamily: 'var(--font-mono)',
              textAlign: 'center'
            }}>PAUSED FOR EVENT: {(activeSuppressedEvent?.name || '').toUpperCase()}</div>
          ) : activeProject ? (
            (() => {
              const completedTodayIds = projectCompletedTasks?.[activeProject.id] || [];
              const ops = [];

              // Add tasks completed today
              completedTodayIds.forEach(taskId => {
                const task = (activeProject.tasks || []).find(t => t.id === taskId);
                if (task) {
                  ops.push({ task, isCompleted: true });
                }
              });

              // Add current incomplete task
              const progressIdx = projectProgress[activeProject.id] || 0;
              if (progressIdx < activeProject.tasks.length) {
                const task = activeProject.tasks[progressIdx];
                if (!ops.some(o => o.task.id === task.id)) {
                  ops.push({ task, isCompleted: false });
                }
              }

              if (ops.length === 0) {
                return (
                  <div style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px dashed var(--accent-green)',
                    color: 'var(--accent-green)',
                    padding: '10px 14px',
                    fontSize: '13px',
                    fontFamily: 'var(--font-mono)',
                    textAlign: 'center',
                  }}>ACTIVE PROJECT {activeProject.name} COMPLETE</div>
                );
              }

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {ops.map(({ task, isCompleted }) => (
                    <div
                      key={task.id}
                      className={`mission-card ${isCompleted ? 'completed' : ''}`}
                      onClick={(e) => handleToggleProjectTask(activeProject.id, task.id, task.xp, e)}
                      style={{ width: '100%', padding: '10px 14px' }}
                    >
                      <div className="checkbox-container" style={{ width: '16px', height: '16px', borderColor: isCompleted ? 'var(--green)' : 'var(--accent-amber)' }}>
                        {isCompleted && <span className="checkmark-icon" style={{ background: 'var(--green)' }}></span>}
                      </div>
                      <div className="mission-details" style={{ gap: '4px' }}>
                        <span className="mission-title" style={{ fontSize: '13px', color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: isCompleted ? 'line-through' : 'none' }}>
                          {task.name ?? task.title}
                        </span>
                        <div className="mission-meta">
                          <span className="badge badge-ops" style={{ fontSize: '9px', padding: '0 4px', background: 'var(--accent-amber-dim)', border: '1px solid var(--accent-amber)', color: 'var(--accent-amber)' }}>
                            {activeProject.name} // {task.phase}
                          </span>
                          <span className="xp-reward" style={{ fontSize: '11px' }}>+{task.xp} XP</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()
          ) : (
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px dashed var(--border-color)',
              color: 'var(--text-muted)',
              padding: '10px 14px',
              fontSize: '13px',
              fontFamily: 'var(--font-mono)',
              textAlign: 'center'
            }}>NO ACTIVE PROJECT DEPLOYED</div>
          )}
        </div>

        <div className="briefing-stats-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', fontSize: '12px' }}>
          <span className="briefing-stat-item">XP TODAY: <span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>{xpToday}</span></span>
          <span className="briefing-stat-item">STREAK: <span style={{ color: 'var(--accent-orange)', fontWeight: 'bold' }}>{profile.streak}</span></span>
          <span className="briefing-stat-item">TASKS LEFT: <span style={{ color: 'var(--accent-coral)', fontWeight: 'bold' }}>{tasksLeft}</span></span>
        </div>

      </div>
    </section>
  );
}
