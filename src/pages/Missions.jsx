// src/pages/Missions.jsx
// Purpose: Displays the Missions page, including Primary Missions, Active Project Ops, Skill Chain, and Side Ops.

import React, { useMemo } from 'react';
import { useAppStore, mapDomainKey } from '../store/appStore';
import { roadmapData, getTasksForToday } from '../data/roadmapData';
import { skillsData } from '../data/skillsData';
import { allProjects } from '../data/projectsData';
import { getCurrentTask } from '../utils/helpers';

export default function Missions() {
  const {
    state,
    fixedTasks,
    completedTaskIds,
    completeProjectTask,
    stateToday,
    chainProgress,
    chains,
    todaysDomain,
    justUnlockedStepId,
    flavors,
    handleToggleMission,
    events,
    currentPhase,
    currentWeek,
    setSkillFilter,
    setSelectedProjectId,
    setActivePage,
    projectStatus,
    projectCompletedTasks,
    isDayClosed,
    isHoliday,
    deleteTask
  } = useAppStore();

  const getTodayString = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getTodayDayName = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  const activeSuppressedEvent = useMemo(() => {
    const today = getTodayString();
    if (isHoliday) {
      return null;
    }
    return events.find(evt => evt.missionsActive === false && today >= evt.startDate && today <= evt.endDate);
  }, [events, isHoliday]);

  const roadmapTasksToday = useMemo(() => {
    const todayDayName = getTodayDayName();
    return getTasksForToday(currentPhase, currentWeek, todayDayName);
  }, [currentPhase, currentWeek]);

  const primaryCategories = ['OPS', 'CAREER', 'COMMS', 'INTEL', 'LEARNING', 'LAB', 'LABS', 'ROADMAP'];
  const sideOpsCategories = ['DISCIPLINE', 'PHYSICAL', 'SOCIAL'];

  const primaryMissions = useMemo(() => {
    let fixed = fixedTasks.filter(t => primaryCategories.includes((t.category || '').toUpperCase()) && !String(t.id ?? '').startsWith('chain:'));
    let dynamic = roadmapTasksToday.filter(t => primaryCategories.includes((t.category || 'LEARNING').toUpperCase()));
    if (isDayClosed) {
      fixed = fixed.filter(t => !stateToday.completedTaskIds.includes(t.id));
      dynamic = dynamic.filter(t => !stateToday.completedTaskIds.includes(t.id));
    }
    return { fixed, dynamic };
  }, [fixedTasks, roadmapTasksToday, isDayClosed, stateToday.completedTaskIds]);

  const sideOpsMissions = useMemo(() => {
    let fixed = fixedTasks.filter(t => sideOpsCategories.includes((t.category || '').toUpperCase()));
    let dynamic = roadmapTasksToday.filter(t => sideOpsCategories.includes((t.category || '').toUpperCase()));
    if (isDayClosed) {
      fixed = fixed.filter(t => !stateToday.completedTaskIds.includes(t.id));
      dynamic = dynamic.filter(t => !stateToday.completedTaskIds.includes(t.id));
    }
    return { fixed, dynamic };
  }, [fixedTasks, roadmapTasksToday, isDayClosed, stateToday.completedTaskIds]);

  const activePhaseObj = roadmapData[currentPhase];
  const activeWeekObj = useMemo(() => {
    if (!activePhaseObj) return null;
    if (currentPhase === 'phase1' && activePhaseObj.weeks) {
      return activePhaseObj.weeks.find(w => w.weekNumber === currentWeek);
    } else if (currentPhase === 'phase2' && activePhaseObj.months) {
      return activePhaseObj.months.find(m => m.monthNumber === currentWeek);
    } else if (currentPhase === 'phase3' && activePhaseObj.quarters) {
      return activePhaseObj.quarters.find(q => q.quarterNumber === currentWeek);
    } else if (currentPhase === 'phase4' && activePhaseObj.years) {
      return activePhaseObj.years.find(y => y.yearNumber === currentWeek);
    }
    return null;
  }, [activePhaseObj, currentPhase, currentWeek]);

  const weekLabel = useMemo(() => {
    if (currentPhase === 'phase1') return `Week ${currentWeek}`;
    if (currentPhase === 'phase2') return `Month ${currentWeek}`;
    if (currentPhase === 'phase3') return `Quarter ${currentWeek}`;
    if (currentPhase === 'phase4') return `Year ${currentWeek}`;
    return `Period ${currentWeek}`;
  }, [currentPhase, currentWeek]);

  const primaryLearningSkill = useMemo(() => {
    // 1. Check if there is an active learning/lab task scheduled for TODAY in the roadmap
    const todayLearnTask = (roadmapTasksToday || []).find(t => t.linkedSkill && (t.category === 'LEARNING' || t.category === 'LAB'));
    if (todayLearnTask) {
      const skillName = todayLearnTask.linkedSkill;
      const skillKey = Object.keys(skillsData).find(
        key => skillsData[key].name === skillName || key === skillName.toLowerCase().replace(/[\s\(\)\-+]/g, '_')
      );
      if (skillKey) return skillsData[skillKey];
    }

    // 2. Check if there is an active skill chain task today (incomplete step)
    let activeChainName = null;
    if (chains && chainProgress) {
      activeChainName = Object.keys(chains).find(name => {
        const progress = chainProgress[name] ?? 0;
        const total = Array.isArray(chains[name]) ? chains[name].length : (chains[name].tasks || []).length;
        return progress < total;
      });
    }

    if (activeChainName) {
      let targetSkillKey = null;
      if (activeChainName === 'NETWORKING') targetSkillKey = 'network_fundamentals';
      else if (activeChainName === 'LINUX') targetSkillKey = 'kali_linux';
      else if (activeChainName === 'SOC OPERATIONS') targetSkillKey = 'siem_splunk';
      else if (activeChainName === 'WEB SECURITY') targetSkillKey = 'web_app_testing';
      else if (activeChainName === 'TOOLS MASTERY') targetSkillKey = 'kali_linux';
      else if (activeChainName === 'ACTIVE DIRECTORY') targetSkillKey = 'ad_defense';
      else if (activeChainName === 'INTERVIEW PREP') targetSkillKey = 'communication';

      if (targetSkillKey && skillsData[targetSkillKey]) {
        return skillsData[targetSkillKey];
      }
    }

    // 3. Fall back to the first task in the active week
    if (!activeWeekObj || !activeWeekObj.tasks) return null;
    const primaryTask = activeWeekObj.tasks.find(t => t.linkedSkill && (t.category === 'LEARNING' || t.category === 'LAB'));
    if (!primaryTask) return null;
    
    const skillName = primaryTask.linkedSkill;
    const skillKey = Object.keys(skillsData).find(
      key => skillsData[key].name === skillName || key === skillName.toLowerCase().replace(/[\s\(\)\-+]/g, '_')
    );
    
    if (skillKey) return skillsData[skillKey];
    
    return {
      id: skillName.toLowerCase().replace(/[\s\(\)\-+]/g, '_'),
      name: skillName,
      description: "Linked core study domain for the active roadmap period."
    };
  }, [activeWeekObj, roadmapTasksToday, chains, chainProgress]);

  const todaysPriority = useMemo(() => {
    const incompleteTasks = roadmapTasksToday.filter(t => !stateToday.completedTaskIds.includes(t.id));
    if (incompleteTasks.length === 0) return null;
    return incompleteTasks.reduce((prev, current) => {
      const prevXp = prev.xpReward || prev.xp || 25;
      const currXp = current.xpReward || current.xp || 25;
      return (currXp > prevXp) ? current : prev;
    });
  }, [roadmapTasksToday, stateToday.completedTaskIds]);

  const activeProjectOps = useMemo(() => {
    let ops = [];
    const activeProjs = allProjects.filter(p => projectStatus[p.id] === 'ACTIVE');
    
    activeProjs.forEach(project => {
      // 1. Get all tasks of this project completed TODAY
      const completedTodayIds = projectCompletedTasks?.[project.id] || [];
      completedTodayIds.forEach(taskId => {
        const task = (project.tasks || []).find(t => t.id === taskId);
        if (task) {
          ops.push({
            project: project,
            task: task
          });
        }
      });

      // 2. Get the current incomplete task
      const currentTask = getCurrentTask(project.tasks || [], completedTaskIds);
      if (currentTask) {
        if (!ops.some(o => o.task.id === currentTask.id)) {
          ops.push({
            project: project,
            task: currentTask
          });
        }
      }
    });
    return ops;
  }, [projectStatus, completedTaskIds, isDayClosed, projectCompletedTasks]);

  const getVisibleChainSteps = (chainName) => {
    const chain = chains[chainName];
    if (!chain) return [];
    const tasksArray = Array.isArray(chain) ? chain : (chain.tasks || []);
    const todayStr = getTodayString();
    
    // Get all steps of this chain completed TODAY
    const completedTodaySteps = [];
    for (let idx = 0; idx < tasksArray.length; idx++) {
      const taskId = `chain:${chainName}:${idx}`;
      if ((state?.dailyCompletions?.[todayStr] ?? []).includes(taskId)) {
        completedTodaySteps.push({ id: taskId, stepIdx: idx, task: tasksArray[idx] });
      }
    }

    const currentIdx = chainProgress[chainName] !== undefined ? chainProgress[chainName] : 0;
    const visible = [...completedTodaySteps];
    if (currentIdx < tasksArray.length) {
      const currentTaskId = `chain:${chainName}:${currentIdx}`;
      if (!visible.some(s => s.id === currentTaskId)) {
        visible.push({ id: currentTaskId, stepIdx: currentIdx, task: tasksArray[currentIdx] });
      }
    }
    return visible;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      
      {/* CONTEXT BAR */}
      {activePhaseObj && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--accent-amber)',
          borderLeft: '4px solid var(--accent-amber)',
          padding: '12px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 0 10px rgba(245, 166, 35, 0.05)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold' }}>
              OPERATIVE RADAR // SYNCED TARGET
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-main)', fontWeight: 'bold' }}>
              &gt; {(activePhaseObj?.title || '').toUpperCase()} // <span style={{ color: 'var(--accent-amber)' }}>{(weekLabel || '').toUpperCase()}</span>
            </span>
          </div>
          
          {activeWeekObj && (
            <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>CURRENT OBJECTIVE FOCUS</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-main)', opacity: 0.9 }}>
                {activeWeekObj.focusArea || activeWeekObj.title}
              </span>
              {todaysPriority && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-amber)', marginTop: '2px', fontWeight: 'bold' }}>
                  TODAY'S PRIORITY: {(todaysPriority?.title || '').toUpperCase()}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* TARGET STUDY TRACK */}
      {primaryLearningSkill && (
        <div style={{
          background: 'rgba(0, 200, 255, 0.02)',
          border: '1px solid var(--accent-blue)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--accent-blue)', fontWeight: 'bold' }}>
              TARGET STUDY TRACK
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-main)' }}>
              Linked Skill: <span
                onClick={() => {
                  setSkillFilter(primaryLearningSkill.id);
                  setActivePage('skillmap');
                }}
                style={{
                  color: 'var(--accent-blue)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  
                }}
              >
                {primaryLearningSkill.name}
              </span>
            </span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', maxWidth: '340px' }}>
            {primaryLearningSkill.description}
          </span>
        </div>
      )}

      {/* SECTION 1 - PRIMARY MISSIONS */}
      <section className="primary-ops-section">
        <h2 className="panel-title" style={{ color: 'var(--accent-blue)',  }}>Primary Missions</h2>
        <hr className="section-divider" style={{ borderColor: 'var(--accent-blue)' }} />
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
            {/* Fixed Tasks */}
            {primaryMissions.fixed.map(task => {
              const isCompleted = stateToday.completedTaskIds.includes(task.id);
              const displayTitle = flavors[task.id]?.title ?? task.name ?? task.title;
              const briefing = flavors[task.id]?.briefing;
              return (
                <div key={task.id} className={`mission-card ${isCompleted ? 'completed' : ''}`} onClick={(e) => handleToggleMission(task.id, task.xp, false, null, null, e)}>
                  <div className="checkbox-container" style={{ borderColor: isCompleted ? 'var(--green)' : 'var(--border-hover)' }}>
                    {isCompleted && <span className="checkmark-icon" style={{ background: 'var(--green)' }}></span>}
                  </div>
                  <div className="mission-details">
                    <span className="mission-title">{displayTitle}</span>
                    {briefing && <span className="mission-briefing" style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>{briefing}</span>}
                    <div className="mission-meta" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="text-ghost" style={{ letterSpacing: "0.1em" }}>{task.category || 'OPS'}</span>
                        <span className="xp-reward">+{task.xp} XP</span>
                      </div>
                      {!task.isRequired && !isCompleted && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Dismiss task "${displayTitle}" permanently?`)) {
                              deleteTask(task.id);
                            }
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent-coral)',
                            cursor: 'pointer',
                            fontSize: '9px',
                            fontFamily: 'var(--font-mono)',
                            padding: 0,
                            textDecoration: 'underline'
                          }}
                        >
                          [DISMISS]
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Dynamic Roadmap Tasks */}
            {primaryMissions.dynamic.map(task => {
              const isCompleted = stateToday.completedTaskIds.includes(task.id);
              const xpVal = task.xpReward || task.xp || 25;
              return (
                <div key={task.id} className={`mission-card ${isCompleted ? 'completed' : ''}`} onClick={(e) => handleToggleMission(task.id, xpVal, false, null, null, e)}>
                  <div className="checkbox-container" style={{ borderColor: isCompleted ? 'var(--green)' : 'var(--accent-blue)' }}>
                    {isCompleted && <span className="checkmark-icon" style={{ background: 'var(--green)' }}></span>}
                  </div>
                  <div className="mission-details">
                    <span className="mission-title" style={{ color: isCompleted ? 'var(--text-muted)' : 'var(--text-main)', textDecoration: isCompleted ? 'line-through' : 'none' }}>{task.title}</span>
                    {task.description && <span className="mission-briefing" style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>{task.description}</span>}
                    <div className="mission-meta">
                      <span className="badge badge-roadmap" style={{ background: 'rgba(0, 200, 255, 0.05)', border: '1px solid var(--accent-blue)', color: 'var(--accent-blue)' }}>ROADMAP</span>
                      <span className="text-ghost" style={{ letterSpacing: "0.1em" }}>{task.category || 'LEARNING'}</span>
                      <span className="xp-reward">+{xpVal} XP</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 2 - ACTIVE PROJECT OPS */}
      <section className="project-ops-section" style={{ marginTop: '10px' }}>
        <h2 className="panel-title" style={{ color: 'var(--accent-amber)' }}>Active Project Ops</h2>
        <hr className="section-divider" style={{ borderColor: 'var(--accent-amber)' }} />
        {Object.values(projectStatus).every(status => status !== 'ACTIVE') ? (
          <div className="warning-banner" style={{ background: 'rgba(2, 2, 8, 0.5)', border: '1px solid var(--border)', padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-dim)', textAlign: 'center' }}>NO ACTIVE PROJECT MISSIONS</div>
        ) : activeProjectOps.length === 0 ? (
          <div className="warning-banner" style={{ background: 'rgba(2, 2, 8, 0.5)', border: '1px solid var(--border)', padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-dim)', textAlign: 'center' }}>ALL ACTIVE PROJECT OBJECTIVES COMPLETED</div>
        ) : (
          <div className="missions-grid">
            {activeProjectOps.map(({ project, task }) => {
              const isCompleted = stateToday.completedTaskIds.includes(task.id);
              const xpVal = task.xpReward || task.xp || 25;
              return (
                <div key={task.id} className={`mission-card ${isCompleted ? 'completed' : ''}`} onClick={(e) => handleToggleMission(task.id, xpVal, false, null, null, e)}>
                  <div className="checkbox-container" style={{ borderColor: isCompleted ? 'var(--green)' : 'var(--accent-amber)' }}>
                    {isCompleted && <span className="checkmark-icon" style={{ background: 'var(--green)' }}></span>}
                  </div>
                  <div className="mission-details">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>{project.title.toUpperCase()}</span>
                    <span className="mission-title" style={{ color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: isCompleted ? 'line-through' : 'none' }}>{task.title}</span>
                    <div className="mission-meta">
                      <span className="text-ghost" style={{ letterSpacing: "0.1em" }}>( {task.phase || 'TASK'} )</span>
                      <span style={{ fontSize: '9px', color: 'var(--text-dim)', marginLeft: '8px' }}>{task.estimatedMinutes || 30} MINS</span>
                      <span className="xp-reward">+{xpVal} XP</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 3 - SKILL CHAIN */}
      <section className="skill-chain-section">
        <h2 className="panel-title" style={{ color: 'var(--accent-green)' }}>Skill Chain</h2>
        <hr className="section-divider" style={{ borderColor: 'var(--accent-green)' }} />
        <div className="missions-grid">
          {Object.keys(chains).map(chainName => {
            const mappedActive = mapDomainKey(todaysDomain);
            if (chainName !== mappedActive) return null;

            const visibleSteps = getVisibleChainSteps(chainName);
            return (
              <div key={chainName} style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', gridColumn: 'span 2' }}>
                <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-green)', fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.1em', textTransform: 'uppercase', fontVariant: 'small-caps', marginBottom: '6px', marginTop: '6px' }}>
                  SKILL CHAIN: {chainName}
                </div>
                {visibleSteps.length === 0 ? (
                  <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px dashed var(--accent-green)', color: 'var(--accent-green)', padding: '12px 16px', fontSize: '13px', fontFamily: 'var(--font-mono)', textAlign: 'center',  }}>{chainName} CHAIN COMPLETE — ALL STEPS CLEARED</div>
                ) : (
                  visibleSteps.map(({ id, stepIdx, task }) => {
                    const isCompleted = stateToday.completedTaskIds.includes(id);
                    const isJustUnlocked = justUnlockedStepId === id;
                    const displayTitle = flavors[id]?.title ?? task.name ?? task.title;
                    const briefing = flavors[id]?.briefing;
                    return (
                      <div key={id} className={`mission-card ${isCompleted ? 'completed' : ''} ${isJustUnlocked ? 'unlocked-flash' : ''}`} onClick={(e) => handleToggleMission(id, task.xp, true, chainName, stepIdx, e)}>
                        <div className="checkbox-container" style={{ borderColor: isCompleted ? 'var(--green)' : 'var(--border-hover)', marginRight: '8px' }}>
                          {isCompleted && <span className="checkmark-icon" style={{ background: 'var(--green)' }}></span>}
                        </div>
                        <div className="mission-details">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                            <span className="mission-title">{displayTitle}</span>
                            {isJustUnlocked && (
                              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent-green)', border: '1px solid var(--accent-green)', padding: '0 4px', marginLeft: '8px',  whiteSpace: 'nowrap' }}>UNLOCKED</span>
                            )}
                          </div>
                          {briefing && <span className="mission-briefing" style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>{briefing}</span>}
                          <div className="mission-meta">
                            <span className="text-ghost" style={{ letterSpacing: "0.1em" }}>({task.category.toUpperCase()})</span>
                            <span className="xp-reward">+{task.xp} XP</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 4 - SIDE OPS */}
      <section className="side-ops-section" style={{ opacity: 0.85, transform: 'scale(0.98)', transformOrigin: 'top left' }}>
        <h2 className="panel-title" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Side Ops</h2>
        <hr className="section-divider" style={{ borderColor: 'var(--text-muted)' }} />
        {activeSuppressedEvent ? (
          <div className="warning-banner" style={{ background: 'rgba(100, 116, 139, 0.05)', border: '1px solid var(--text-muted)', padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>EVENT: {(activeSuppressedEvent?.name || '').toUpperCase()} — MISSIONS SUSPENDED</div>
        ) : (
          <div className="missions-grid">
            {/* Fixed Tasks */}
            {sideOpsMissions.fixed.map(task => {
              const isCompleted = stateToday.completedTaskIds.includes(task.id);
              const displayTitle = flavors[task.id]?.title ?? task.name ?? task.title;
              const briefing = flavors[task.id]?.briefing;
              return (
                <div key={task.id} className={`mission-card ${isCompleted ? 'completed' : ''}`} onClick={(e) => handleToggleMission(task.id, task.xp, false, null, null, e)}>
                  <div className="checkbox-container" style={{ borderColor: isCompleted ? 'var(--green)' : 'var(--border-hover)' }}>
                    {isCompleted && <span className="checkmark-icon" style={{ background: 'var(--green)' }}></span>}
                  </div>
                  <div className="mission-details">
                    <span className="mission-title">{displayTitle}</span>
                    {briefing && <span className="mission-briefing" style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>{briefing}</span>}
                    <div className="mission-meta" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="text-ghost" style={{ letterSpacing: "0.1em" }}>{task.category || 'DISCIPLINE'}</span>
                        <span className="xp-reward">+{task.xp} XP</span>
                      </div>
                      {!task.isRequired && !isCompleted && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Dismiss task "${displayTitle}" permanently?`)) {
                              deleteTask(task.id);
                            }
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent-coral)',
                            cursor: 'pointer',
                            fontSize: '9px',
                            fontFamily: 'var(--font-mono)',
                            padding: 0,
                            textDecoration: 'underline'
                          }}
                        >
                          [DISMISS]
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Dynamic Tasks */}
            {sideOpsMissions.dynamic.map(task => {
              const isCompleted = stateToday.completedTaskIds.includes(task.id);
              const xpVal = task.xpReward || task.xp || 25;
              return (
                <div key={task.id} className={`mission-card ${isCompleted ? 'completed' : ''}`} onClick={(e) => handleToggleMission(task.id, xpVal, false, null, null, e)}>
                  <div className="checkbox-container" style={{ borderColor: isCompleted ? 'var(--green)' : 'var(--border-hover)' }}>
                    {isCompleted && <span className="checkmark-icon" style={{ background: 'var(--green)' }}></span>}
                  </div>
                  <div className="mission-details">
                    <span className="mission-title">{task.title}</span>
                    {task.description && <span className="mission-briefing" style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>{task.description}</span>}
                    <div className="mission-meta">
                      <span className="badge badge-roadmap" style={{ background: 'rgba(0, 200, 255, 0.05)', border: '1px solid var(--accent-blue)', color: 'var(--accent-blue)' }}>ROADMAP</span>
                      <span className="text-ghost" style={{ letterSpacing: "0.1em" }}>{task.category || 'DISCIPLINE'}</span>
                      <span className="xp-reward">+{xpVal} XP</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}
