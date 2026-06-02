// src/pages/Projects.jsx
// Purpose: Displays the Projects Board page, showing dynamic project progress bars computed from central completed task lists, milestone checklists, and Roadmap sync indicators.

import React, { useMemo } from 'react';
import { useAppStore } from '../store/appStore';
import { getTaskChainState, getProjectProgress } from '../utils/helpers';
import { projectsData } from '../data/projectsData';
import { roadmapData } from '../data/roadmapData';
import ProgressBar from '../components/ui/ProgressBar';

export default function Projects() {
  const {
    projectStatus,
    setProjectStatus,
    stateToday,
    completeProjectTask,
    currentPhase,
    currentWeek,
    selectedProjectId,
    setSelectedProjectId,
    isCompletedProjectsExpanded,
    setIsCompletedProjectsExpanded,
    events,
    isDayClosed,
    handleToggleMission,
    isProjectTaskComplete,
    isHoliday
  } = useAppStore();

  const getTodayString = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const activeSuppressedEvent = useMemo(() => {
    const today = getTodayString();
    if (isHoliday) {
      return null;
    }
    return events.find(evt => evt.missionsActive === false && today >= evt.startDate && today <= evt.endDate);
  }, [events, isHoliday]);

  const handleChangeProjectStatus = (projId, newStatus) => {
    setProjectStatus(projId, newStatus);
  };

  // Group current week's tasks to check project task linkages
  const currentWeekTasks = useMemo(() => {
    const phase = roadmapData[currentPhase];
    if (!phase) return [];
    
    const tasks = [];
    if (currentPhase === 'phase1' && phase.weeks) {
      const week = phase.weeks.find(w => w.weekNumber === currentWeek);
      if (week) tasks.push(...week.tasks);
    } else if (currentPhase === 'phase2' && phase.months) {
      const month = phase.months.find(m => m.monthNumber === currentWeek);
      if (month) tasks.push(...month.tasks);
    } else if (currentPhase === 'phase3' && phase.quarters) {
      const quarter = phase.quarters.find(q => q.quarterNumber === currentWeek);
      if (quarter) tasks.push(...quarter.tasks);
    } else if (currentPhase === 'phase4' && phase.years) {
      const year = phase.years.find(y => y.yearNumber === currentWeek);
      if (year) tasks.push(...year.years);
    }
    return tasks;
  }, [currentPhase, currentWeek]);

  const currentWeekTaskIds = useMemo(() => new Set(currentWeekTasks.map(t => t.id)), [currentWeekTasks]);

  // Compute stats and statuses dynamically for all projects using isProjectTaskComplete
  const processedProjects = useMemo(() => {
    return projectsData.map(proj => {
      const status = projectStatus[proj.id] || 'QUEUED';
      const tasks = proj.tasks || [];
      const totalTasks = tasks.length;
      const completedCount = tasks.filter(t => isProjectTaskComplete(t.id)).length;
      const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
      
      // Calculate milestone completion statuses by grouping tasks by phase
      const phases = [...new Set(tasks.map(t => t.phase))];
      const milestonesStatus = phases.map(phaseName => {
        const phaseTasks = tasks.filter(t => t.phase === phaseName);
        const isCompleted = phaseTasks.length > 0 && phaseTasks.every(t => isProjectTaskComplete(t.id));
        return {
          title: phaseName,
          isCompleted
        };
      });

      // Find active milestone (first uncompleted)
      const activeMilestone = milestonesStatus.find(m => !m.isCompleted)?.title || 'Project Complete';

      // Find roadmap tasks linked to this project
      const hasActiveTasksThisWeek = currentWeekTasks.some(t => t.linkedProject === proj.id);

      return {
        ...proj,
        status,
        progressPercent,
        completedCount,
        totalTasks,
        activeMilestone,
        milestonesStatus,
        hasActiveTasksThisWeek
      };
    });
  }, [projectStatus, currentWeekTasks, isProjectTaskComplete]);

  // Filter projects by board categories
  const activeOrQueuedList = useMemo(() => {
    return processedProjects.filter(p => p.status !== 'COMPLETE');
  }, [processedProjects]);

  const completedList = useMemo(() => {
    return processedProjects.filter(p => p.status === 'COMPLETE');
  }, [processedProjects]);

  // Resolve selected project details
  const selectedProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return processedProjects.find(p => p.id === selectedProjectId);
  }, [selectedProjectId, processedProjects]);

  // Filter selected project's tasks active in this week
  const selectedProjectTasksInCurrentWeek = useMemo(() => {
    if (!selectedProject) return [];
    return currentWeekTasks.filter(t => t.linkedProject === selectedProject.id);
  }, [selectedProject, currentWeekTasks]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Dynamic Keyframe style block for pulsing dots */}
      <style>{`
        @keyframes pulseGreen {
          0% { box-shadow: 0 0 4px rgba(34, 197, 94, 0.4); border-color: rgba(34, 197, 94, 0.5); }
          50% { box-shadow: 0 0 12px rgba(34, 197, 94, 0.8); border-color: var(--accent-green); }
          100% { box-shadow: 0 0 4px rgba(34, 197, 94, 0.4); border-color: rgba(34, 197, 94, 0.5); }
        }
        .pulse-sync-dot {
          animation: pulseGreen 2s infinite ease-in-out;
          background: var(--accent-green) !important;
        }
      `}</style>

      {/* PROJECT BOARD */}
      <section className="project-board-section">
        <h2 className="panel-title">Project Board</h2>
        <hr className="section-divider" />
        {activeSuppressedEvent ? (
          <div className="warning-banner" style={{
            background: 'rgba(100, 116, 139, 0.05)',
            border: '1px solid var(--text-muted)',
            padding: '12px 16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--text-muted)',
            textAlign: 'center',
            marginBottom: '20px'
          }}>EVENT: {(activeSuppressedEvent?.name || '').toUpperCase()} — ACTIVE PROJECTS SUSPENDED</div>
        ) : (
          <div className="projects-grid">
            {activeOrQueuedList.map((proj) => {
              const isActive = proj.status === 'ACTIVE';
              
              let badgeStyle = {
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                fontWeight: 'bold',
                padding: '2px 8px',
                textTransform: 'uppercase'
              };

              if (isActive) {
                badgeStyle = {
                  background: 'rgba(245, 166, 35, 0.1)',
                  border: '1px solid var(--accent-amber)',
                  color: 'var(--accent-amber)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  padding: '2px 8px',
                  textTransform: 'uppercase'
                };
              } else if (proj.status === 'ON HOLD') {
                badgeStyle = {
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  padding: '2px 8px',
                  textTransform: 'uppercase'
                };
              }

              const isQueued = proj.status === 'QUEUED';
              
              return (
                <div
                  key={proj.id}
                  className={`project-card ${isActive ? 'active-project' : 'queued'}`}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: isQueued ? 'default' : 'pointer',
                    background: selectedProjectId === proj.id ? 'var(--bg-card)' : 'var(--bg-card)',
                    border: selectedProjectId === proj.id ? '1px solid var(--accent-amber)' : '1px solid var(--border-color)',
                    boxShadow: selectedProjectId === proj.id ? '0 0 10px rgba(245, 166, 35, 0.15)' : 'none'
                  }}
                  onClick={() => {
                    if (isQueued) return;
                    setSelectedProjectId(selectedProjectId === proj.id ? null : proj.id);
                  }}
                >
                  {isQueued && (
                    <div style={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      background: 'rgba(2, 2, 8, 0.85)',
                      zIndex: 5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none'
                    }}>
                      <span style={{ color: 'var(--accent-coral)', border: '1px solid var(--accent-coral)', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
                        [ PROJECT QUEUED // ACTIVATE TO BEGIN ]
                      </span>
                    </div>
                  )}
                  {/* Status row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{
                      fontWeight: 'bold',
                      fontSize: '14px',
                      color: isActive ? 'var(--accent-amber)' : 'var(--text-main)',
                      textTransform: 'uppercase',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      {proj.title}
                    </span>
                    <span style={badgeStyle}>
                      {proj.status}
                    </span>
                  </div>

                  {/* Focus Subheading */}
                  <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>
                    {proj.description.slice(0, 95)}...
                  </span>

                  {/* Overall progress bar */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      <span>PROGRESS</span>
                      <span>{proj.progressPercent}% ({proj.completedCount}/{proj.totalTasks})</span>
                    </div>
                    <ProgressBar percentage={proj.progressPercent} color={isActive ? 'var(--accent-amber)' : 'var(--border-color)'} />
                  </div>

                  {/* Active Milestone indicator */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.01)',
                    border: '1px solid var(--border-color)',
                    padding: '8px 12px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    marginBottom: '12px'
                  }}>
                    <span style={{ color: 'var(--accent-amber)', display: 'block', fontWeight: 'bold', fontSize: '9px', marginBottom: '2px' }}>
                      ACTIVE MILESTONE:
                    </span>
                    <span style={{ color: 'var(--text-main)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {proj.activeMilestone}
                    </span>
                  </div>

                  {/* Sync Indicator row */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 'auto',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--border-color)'
                  }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div
                        className={proj.hasActiveTasksThisWeek ? 'pulse-sync-dot' : ''}
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#555',
                          display: 'inline-block'
                        }}
                      />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                        {proj.hasActiveTasksThisWeek ? 'ROADMAP SYNC ACTIVE' : 'ROADMAP IDLE'}
                      </span>
                    </div>

                    <select
                      value={proj.status}
                      onChange={(e) => handleChangeProjectStatus(proj.id, e.target.value)}
                      className="dark-date-picker"
                      style={{
                        zIndex: 15,
                        fontSize: '11px',
                        padding: '2px 6px',
                        fontFamily: 'var(--font-mono)',
                        height: '24px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--accent-amber)',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="QUEUED">QUEUED</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="ON HOLD">ON HOLD</option>
                      <option value="COMPLETE">DONE</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SELECTED PROJECT DETAIL PANEL */}
      {selectedProject && (
        <section style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--accent-amber)',
          borderLeft: '4px solid var(--accent-amber)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          animation: 'fadeIn 0.3s'
        }}>
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-amber)', fontWeight: 'bold' }}>
              PROJECT DECRYPTED // DEEP-DIVE OVERLAY
            </span>
            <h3 style={{ margin: '4px 0 0 0', fontFamily: 'var(--font-mono)', fontSize: '18px', color: 'var(--text-main)', textTransform: 'uppercase' }}>
              &gt; {selectedProject.title}
            </h3>
            <p style={{ margin: '8px 0 0 0', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              {selectedProject.description}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            
            {/* Milestone Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-amber)', borderBottom: '1px dashed var(--border-color)', paddingBottom: '6px' }}>
                // MILESTONE COMPLETION MATRIX
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedProject.milestonesStatus.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      opacity: m.isCompleted ? 1 : 0.6
                    }}
                  >
                    <div style={{
                      width: '14px',
                      height: '14px',
                      border: `1px solid ${m.isCompleted ? 'var(--accent-green)' : 'var(--border-color)'}`,
                      background: m.isCompleted ? 'rgba(34, 197, 94, 0.1)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '9px',
                      color: 'var(--accent-green)',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}>
                      {m.isCompleted ? '✓' : ''}
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: m.isCompleted ? 'var(--accent-green)' : 'var(--text-main)',
                      textDecoration: m.isCompleted ? 'line-through' : 'none'
                    }}>
                      {m.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Current week's active roadmap tasks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-blue)', borderBottom: '1px dashed var(--border-color)', paddingBottom: '6px' }}>
                // ACTIVE ROADMAP MISSIONS ({selectedProjectTasksInCurrentWeek.length})
              </h4>
              
              {selectedProjectTasksInCurrentWeek.length === 0 ? (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                  No roadmap objectives active for this project during the current week.
                </span>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedProjectTasksInCurrentWeek.map(task => {
                    const isCompleted = stateToday?.completedTaskIds.includes(task.id);
                    const xpVal = task.xpReward || task.xp || 25;
                    return (
                      <div
                        key={task.id}
                        onClick={(e) => {
                          if (isDayClosed) return;
                          handleToggleMission(task.id, xpVal, false, null, null, e);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: isCompleted ? 'rgba(255, 255, 255, 0.01)' : 'rgba(0, 200, 255, 0.02)',
                          border: `1px solid ${isCompleted ? 'var(--border-color)' : 'var(--accent-blue)'}`,
                          padding: '10px 14px',
                          cursor: isDayClosed ? 'default' : 'pointer',
                          transition: 'all 0.2s',
                          gap: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                          <div style={{
                            width: '14px',
                            height: '14px',
                            border: `1px solid ${isCompleted ? 'var(--accent-green)' : 'var(--accent-blue)'}`,
                            background: isCompleted ? 'var(--accent-green)' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '9px',
                            color: 'var(--bg-card)',
                            fontWeight: 'bold',
                            flexShrink: 0
                          }}>
                            {isCompleted ? '✓' : ''}
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '11px',
                              color: isCompleted ? 'var(--text-muted)' : 'var(--text-main)',
                              textDecoration: isCompleted ? 'line-through' : 'none'
                            }}>
                              {task.title}
                            </span>
                            {task.day && (
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>
                                {(task?.day || '').toUpperCase()} // ⏱ {task.estimatedMinutes || 30} MINS
                              </span>
                            )}
                          </div>
                        </div>

                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10px',
                          color: isCompleted ? 'var(--text-muted)' : 'var(--accent-amber)',
                          border: `1px solid ${isCompleted ? 'var(--border-color)' : 'var(--accent-amber)'}`,
                          padding: '0 4px'
                        }}>
                          +{xpVal} XP
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Project Tasks Matrix */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', gridColumn: '1 / -1', marginTop: '10px' }}>
              <h4 style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-amber)', borderBottom: '1px dashed var(--border-color)', paddingBottom: '6px' }}>
                // PROJECT OPERATION TASKS TELEMETRY
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                
                {/* Column 1: PENDING OPERATIONS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-coral)', fontWeight: 'bold' }}>
                    ⏳ PENDING OPERATIONS // ACTIVE COMMANDS
                  </span>
                  
                  {selectedProject.tasks.filter(t => !isProjectTaskComplete(t.id)).length === 0 ? (
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      fontStyle: 'italic',
                      padding: '16px',
                      border: '1px dashed var(--border-color)',
                      textAlign: 'center',
                      background: 'rgba(255,255,255,0.01)'
                    }}>
                      ALL PROJECT OPERATION TASKS EXECUTED
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
                      {selectedProject.tasks.filter(t => !isProjectTaskComplete(t.id)).map(task => {
                        const xpVal = task.xpReward || task.xp || 25;
                        return (
                          <div
                            key={task.id}
                            onClick={(e) => {
                              if (isDayClosed) return;
                              handleToggleMission(task.id, xpVal, false, null, null, e);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: 'rgba(255, 255, 255, 0.01)',
                              border: '1px solid var(--border-color)',
                              padding: '10px 14px',
                              cursor: isDayClosed ? 'default' : 'pointer',
                              transition: 'all 0.2s',
                              gap: '12px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                              <div style={{
                                width: '14px',
                                height: '14px',
                                border: '1px solid var(--border-color)',
                                background: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '9px',
                                color: 'var(--bg-card)',
                                fontWeight: 'bold',
                                flexShrink: 0
                              }} />
                              
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-main)', fontWeight: 'bold' }}>
                                  {task.title}
                                </span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>
                                  PHASE: {task.phase || 'GENERAL'} // ⏱ {task.estimatedMinutes || 30} MINS
                                </span>
                              </div>
                            </div>

                            <span style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '10px',
                              color: 'var(--accent-amber)',
                              border: '1px solid var(--accent-amber)',
                              padding: '0 4px',
                              whiteSpace: 'nowrap'
                            }}>
                              +{xpVal} XP
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Column 2: COMPLETED OPERATIONS (DONE LIST) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-green)', fontWeight: 'bold' }}>
                    🏆 COMPLETED OPERATIONS // LOGGED ACTIONS
                  </span>
                  
                  {selectedProject.tasks.filter(t => isProjectTaskComplete(t.id)).length === 0 ? (
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      fontStyle: 'italic',
                      padding: '16px',
                      border: '1px dashed var(--border-color)',
                      textAlign: 'center',
                      background: 'rgba(255,255,255,0.01)'
                    }}>
                      NO COMPLETED OPERATION TASKS REGISTERED
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
                      {selectedProject.tasks.filter(t => isProjectTaskComplete(t.id)).map(task => {
                        const xpVal = task.xpReward || task.xp || 25;
                        return (
                          <div
                            key={task.id}
                            onClick={(e) => {
                              if (isDayClosed) return;
                              handleToggleMission(task.id, xpVal, false, null, null, e);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: 'rgba(34, 197, 94, 0.02)',
                              border: '1px solid rgba(34, 197, 94, 0.2)',
                              padding: '10px 14px',
                              cursor: isDayClosed ? 'default' : 'pointer',
                              transition: 'all 0.2s',
                              gap: '12px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                              <div style={{
                                width: '14px',
                                height: '14px',
                                border: '1px solid var(--accent-green)',
                                background: 'var(--accent-green)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '9px',
                                color: 'var(--bg-card)',
                                fontWeight: 'bold',
                                flexShrink: 0
                              }}>
                                ✓
                              </div>
                              
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{
                                  fontFamily: 'var(--font-mono)',
                                  fontSize: '11px',
                                  color: 'var(--text-muted)',
                                  textDecoration: 'line-through',
                                  fontWeight: 'bold'
                                }}>
                                  {task.title}
                                </span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>
                                  PHASE: {task.phase || 'GENERAL'} // ⏱ {task.estimatedMinutes || 30} MINS
                                </span>
                              </div>
                            </div>

                            <span style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '10px',
                              color: 'var(--text-muted)',
                              border: '1px solid var(--border-color)',
                              padding: '0 4px',
                              whiteSpace: 'nowrap'
                            }}>
                              +{xpVal} XP
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        </section>
      )}

      {/* COMPLETED PROJECTS GRID */}
      {completedList.length > 0 && (
        <section className="completed-projects-section" style={{ marginTop: '10px' }}>
          <div
            className="panel-title-clickable"
            onClick={() => setIsCompletedProjectsExpanded(!isCompletedProjectsExpanded)}
            style={{
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              userSelect: 'none'
            }}
          >
            <h3 className="panel-title" style={{ margin: 0, fontSize: '15px', color: 'var(--accent-green)' }}>
              🏆 COMPLETED PROJECTS ({completedList.length})
            </h3>
            <span style={{ color: 'var(--accent-green)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
              {isCompletedProjectsExpanded ? '[ COLLAPSE - ]' : '[ EXPAND + ]'}
            </span>
          </div>
          <hr className="section-divider" style={{ borderColor: 'rgba(34, 197, 94, 0.3)', margin: '8px 0' }} />
          
          {isCompletedProjectsExpanded && (
            <div className="projects-grid">
              {completedList.map((proj) => (
                <div
                  key={proj.id}
                  className="project-card done"
                  style={{ border: '1px solid var(--accent-green)', boxShadow: '0 0 10px rgba(34, 197, 94, 0.05)' }}
                >
                  {(proj.status === 'QUEUED' || proj.status === 'ON HOLD') && (
                      <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(2, 2, 8, 0.85)',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none'
                      }}>
                        <span style={{ color: 'var(--text-primary)', border: '1px solid var(--text-primary)', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold' }}>PROJECT QUEUED // ACTIVATE TO BEGIN</span>
                      </div>
                    )}
                    <div className="project-status-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="project-name" style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--accent-green)', textTransform: 'uppercase' }}>
                      {proj.title}
                    </span>
                    <span style={{
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid var(--accent-green)',
                      color: 'var(--accent-green)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      padding: '2px 8px'
                    }}>
                      DONE
                    </span>
                  </div>

                  <span className="project-focus" style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    {proj.description.slice(0, 95)}...
                  </span>

                  <div className="project-progress-group" style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-green)', marginBottom: '4px' }}>
                      <span>COMPLETED</span>
                      <span>100% ({proj.totalTasks}/{proj.totalTasks})</span>
                    </div>
                    <div className="xp-bar-outer" style={{ height: '6px', borderColor: 'rgba(34, 197, 94, 0.2)' }}>
                      <div className="xp-bar-inner" style={{ width: '100%', background: 'var(--accent-green)', boxShadow: '0 0 6px rgba(34, 197, 94, 0.3)' }}></div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px', borderTop: '1px dashed rgba(34, 197, 94, 0.2)' }}>
                    <span className="project-xp-reward" style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>
                      Project Complete
                    </span>

                    <select
                      value={proj.status}
                      onChange={(e) => handleChangeProjectStatus(proj.id, e.target.value)}
                      className="dark-date-picker"
                      style={{ fontSize: '11px', padding: '2px 6px', fontFamily: 'var(--font-mono)', height: '24px', background: 'var(--bg-card)', border: '1px solid rgba(34, 197, 94, 0.3)', color: 'var(--accent-green)' }}
                    >
                      <option value="COMPLETE">DONE</option>
                      <option value="QUEUED">QUEUED</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="ON HOLD">ON HOLD</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
