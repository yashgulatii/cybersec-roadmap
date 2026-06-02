import React, { useMemo, useEffect, useState } from 'react';
import { useAppStore } from '../store/appStore';
import { useXP } from '../hooks/useXP';
import { getTasksForToday } from '../data/roadmapData';
import { SCHEDULE_BLOCKS } from '../data/characterData';

export default function Home() {
  const {
    profile,
    chainProgress,
    fixedTasks,
    dailyState,
    handleToggleMission,
    currentPhase,
    currentWeek,
    chains,
    consistencyStreak,
    events = [],
    customSchedule = [],
    todayISO,
    endShift,
    isDayClosed,
    state,
    deleteTask
  } = useAppStore();

  const completedTaskIds = useMemo(() => dailyState?.completedTaskIds ?? [], [dailyState]);

  const activeEvent = useMemo(() => {
    const today = todayISO ? todayISO() : new Date().toISOString().split('T')[0];
    return (events ?? []).find(evt => today >= evt.startDate && today <= evt.endDate);
  }, [events, todayISO]);

  const upcomingEvents = useMemo(() => {
    const today = todayISO ? todayISO() : new Date().toISOString().split('T')[0];
    return (events ?? [])
      .filter(evt => evt.startDate > today)
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .slice(0, 3);
  }, [events, todayISO]);

  const getBlockColorStyles = (block) => {
    if (!block) return { text: '#a78bfa', bg: 'var(--violet-bg)', border: '1px solid var(--violet-border)', label: 'ROUTINE', shadow: 'var(--violet-border)' };
    const name = (block.name || block.label || '').toUpperCase();
    const cat = (block.category || block.type || '').toLowerCase();
    
    if (
      cat === 'primary' || 
      cat === 'secondary' || 
      cat === 'light' || 
      name.includes('OPS') || 
      name.includes('BUILD') || 
      name.includes('INTEL')
    ) {
      return {
        bg: 'var(--amber-bg)',
        border: '1px solid var(--amber-border)',
        text: 'var(--amber)',
        label: 'STUDY',
        shadow: 'var(--amber-border)'
      };
    }
    
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
        bg: 'var(--green-bg)',
        border: '1px solid var(--green-border)',
        text: 'var(--green)',
        label: 'REST',
        shadow: 'var(--green-border)'
      };
    }
    
    return {
      bg: 'var(--blue-bg)',
      border: '1px solid var(--blue-border)',
      text: 'var(--blue)',
      label: 'DISCIPLINE',
      shadow: 'var(--blue-border)'
    };
  };

  const activeScheduleBlock = useMemo(() => {
    const schedule = (customSchedule && customSchedule.length > 0) ? customSchedule : SCHEDULE_BLOCKS;
    const dNow = new Date();
    const currentMinutes = dNow.getHours() * 60 + dNow.getMinutes();

    let foundBlock = null;

    (schedule ?? []).forEach((block) => {
      let startHour = 0, startMinute = 0;
      let endHour = 0, endMinute = 0;
      
      if (block.start) {
        const parts = block.start.split(':');
        if (parts.length === 2) [startHour, startMinute] = parts.map(Number);
      } else if (block.time) {
        const parts = block.time.split(':');
        if (parts.length === 2) [startHour, startMinute] = parts.map(Number);
      } else if (block.startMin !== undefined) {
        startHour = Math.floor(block.startMin / 60);
        startMinute = block.startMin % 60;
      }

      if (block.end) {
        const parts = block.end.split(':');
        if (parts.length === 2) [endHour, endMinute] = parts.map(Number);
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

      if (adjustedMinutes >= startMinutesTotal && adjustedMinutes < endMinutesTotal) {
        foundBlock = block;
      }
    });

    return foundBlock;
  }, [customSchedule]);

  const { levelProgress } = useXP(profile);
  const level = levelProgress?.level || 1;
  const xpToNext = levelProgress?.xpToNextLevel || 0;
  const xpPercent = levelProgress?.percent || 0;

  const [waveform, setWaveform] = useState([]);

  useEffect(() => {
    // Generate waveform data from the last 7 days logs
    const generateWaveform = () => {
      const today = new Date();
      const data = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const dayLogs = state?.logs?.[dateStr] ?? [];
        let xp = 0;
        dayLogs.forEach(entry => {
          if (entry.xp) xp += entry.xp;
          else if (entry.xpReward && entry.completed) xp += entry.xpReward;
        });
        
        const days = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
        data.push({ day: days[d.getDay()], xp, dateStr });
      }
      setWaveform(data);
    };
    generateWaveform();
  }, [completedTaskIds, state?.logs]);

  const todayDayName = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  }, []);

  // Reconstruct tickerTasks dynamically
  const tickerTasks = useMemo(() => {
    const roadmapTasksToday = getTasksForToday(currentPhase, currentWeek, todayDayName) || [];
    
    // Fixed tasks
    const dailyFixed = fixedTasks || [];
    
    // Merge everything
    const allTasks = [];
    roadmapTasksToday.forEach(t => {
      allTasks.push({ id: t.id, title: t.title, category: t.category || 'ROADMAP', xpReward: t.xp || t.xpReward || 25, isRequired: t.isRequired });
    });
    dailyFixed.forEach(t => {
      allTasks.push({ id: t.id, title: t.title, category: t.category || 'DAILY', xpReward: t.xp || t.xpReward || 20, isRequired: t.isRequired });
    });

    const mappedTasks = allTasks.map(t => ({
      ...t,
      completed: completedTaskIds.includes(t.id)
    }));

    if (isDayClosed) {
      return mappedTasks.filter(t => !t.completed);
    }
    return mappedTasks;
  }, [completedTaskIds, currentPhase, currentWeek, todayDayName, fixedTasks, isDayClosed]);

  const handleToggleTickerTask = (idx) => {
    const task = tickerTasks[idx];
    if (task) {
      handleToggleMission(task.id, task.xpReward || 25);
    }
  };

  // priority missions
  const priorityMissions = useMemo(() => {
    const uncompletedFixed = (fixedTasks || []).filter(task => !completedTaskIds?.includes(task.id));
    const sortedMissions = [...uncompletedFixed].sort((a, b) => (b.xp || 0) - (a.xp || 0));
    return sortedMissions.slice(0, 4);
  }, [fixedTasks, completedTaskIds]);

  // chain progress visualization
  const chainStep = chainProgress?.NETWORKING ?? chainProgress?.networking ?? 0;
  const chainTotal = 8;
  const chainPercent = (chainStep / chainTotal) * 100;

  const maxXP = Math.max(...waveform.map(d => d.xp), 100);
  const svgWidth = 400;
  const svgHeight = 80;
  
  const points = waveform.map((d, i) => {
    const x = (i / 6) * svgWidth;
    const y = svgHeight - (d.xp / maxXP) * (svgHeight - 10) - 5;
    return `${x},${y}`;
  }).join(' ');

  const getTagClass = (cat) => {
    const c = (cat || 'LEARNING').toUpperCase();
    if (['LEARNING', 'LAB', 'LABS'].includes(c)) return 'badge-learning';
    if (['CAREER', 'OPS', 'ROADMAP'].includes(c)) return 'badge-career';
    if (['FINANCIAL', 'INTEL'].includes(c)) return 'badge-financial';
    if (['PHYSICAL'].includes(c)) return 'badge-physical';
    return 'badge-comms';
  };

  const completedCount = tickerTasks.filter(t => t.completed).length;
  const totalCount = tickerTasks.length;

  const displayXp = profile?.totalXp ?? 0;
  const displayStreak = profile?.streak ?? consistencyStreak ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', fontFamily: 'var(--font)' }}>
      {/* HEADER SECTION WITH END SHIFT */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        padding: '16px 20px',
        borderRadius: 'var(--r-lg)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', color: 'var(--accent-blue)', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}>
            &gt; OPERATOR_DASHBOARD // TAC-NET
          </h2>
          <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            SECURE SYSTEM INTERFACE -- OPERATIVE: YASH GULATI
          </span>
        </div>
        
        <div>
          {isDayClosed ? (
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid var(--accent-green)',
              color: 'var(--accent-green)',
              padding: '8px 18px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              borderRadius: 'var(--r-md)',
              boxShadow: '0 0 10px rgba(34, 197, 94, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              ✅ SHIFT CONCLUDED
            </div>
          ) : (
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to end your shift and close today's operations? Uncompleted required tasks will incur XP penalties.")) {
                  endShift();
                }
              }}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid var(--accent-coral)',
                color: 'var(--accent-coral)',
                padding: '8px 18px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
                textTransform: 'uppercase',
                borderRadius: 'var(--r-md)',
                boxShadow: '0 0 10px rgba(239, 68, 68, 0.15)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--accent-coral)';
                e.currentTarget.style.color = 'var(--bg-card)';
                e.currentTarget.style.boxShadow = '0 0 15px var(--accent-coral)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.color = 'var(--accent-coral)';
                e.currentTarget.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.15)';
              }}
            >
              🛑 END SHIFT
            </button>
          )}
        </div>
      </div>

      <div className="home-grid" style={{ margin: 0 }}>
        
        {/* ACTIVE EVENT DETAILS BANNER */}
      {activeEvent && (
        <div style={{
          gridColumn: '1 / -1',
          background: 'var(--amber-bg)',
          border: '1px solid var(--amber-border)',
          borderLeft: '4px solid var(--amber)',
          padding: '16px 20px',
          borderRadius: 'var(--r-lg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 0 15px var(--amber-border)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '9px', color: 'var(--amber)', letterSpacing: '0.15em', fontWeight: 'bold' }}>⚠️ ACTIVE OPERATION EVENT OVERVIEW</span>
            <span style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{activeEvent.name || activeEvent.title}</span>
            {activeEvent.notes && <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{activeEvent.notes}</span>}
          </div>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '9px', color: 'var(--text-dim)' }}>DATE DURATION</span>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>{activeEvent.startDate} — {activeEvent.endDate}</span>
            <span style={{ fontSize: '9px', color: activeEvent.missionsActive ? 'var(--green)' : 'var(--red)', fontWeight: 'bold' }}>
              {activeEvent.missionsActive ? 'MISSIONS ACTIVE' : 'MISSIONS SUSPENDED'}
            </span>
          </div>
        </div>
      )}

      {/* LEFT COLUMN */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* PRIORITY TARGETS CARD */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-header" style={{ marginBottom: 0 }}>PRIORITY TARGETS</span>
          </div>

          <div>
            {priorityMissions.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '12px' }}>
                ALL PRIORITY TARGETS COMPLETED
              </div>
            ) : (
              priorityMissions.map((task, idx) => {
                const isCompleted = completedTaskIds?.includes(task.id);
                return (
                  <div 
                    key={task.id} 
                    className="card-interactive"
                    onClick={() => handleToggleMission(task.id, task.xp)}
                    style={{ 
                      height: '44px', 
                      padding: '0 18px', 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      opacity: isCompleted ? 0.35 : 1
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{String(idx + 1).padStart(2, '0')}</span>
                      <span style={{
                        fontSize: '12px',
                        color: 'var(--text-primary)',
                        textDecoration: isCompleted ? 'line-through' : 'none'
                      }}>
                        {task.name || task.title}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      +{task.xp} XP
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        {/* TODAY'S MISSION CARD */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="card-header" style={{ marginBottom: 0 }}>TODAY'S MISSION</span>
              <span style={{ fontSize: '10px', color: 'var(--green)', letterSpacing: '0.1em' }}>{completedCount}/{totalCount} COMPLETED</span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px' }}>
              {(currentPhase || '').toUpperCase()} // WEEK {currentWeek}
            </div>
          </div>

          <div>
            {tickerTasks.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '12px' }}>
                NO ONGOING MISSIONS REGISTERED FOR TODAY
              </div>
            ) : (
              tickerTasks.map((task, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    height: '52px', 
                    padding: '0 18px', 
                    borderBottom: idx < tickerTasks.length - 1 ? '1px solid var(--border)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: task.completed ? 'var(--bg-card)' : 'transparent'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div 
                      onClick={() => handleToggleTickerTask(idx)}
                      style={{
                        width: '18px',
                        height: '18px',
                        border: task.completed ? '1.5px solid var(--green)' : '1.5px solid var(--border-hover)',
                        borderRadius: '4px',
                        background: task.completed ? 'var(--green)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      {task.completed && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="#052e16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 400,
                      color: 'var(--text-primary)',
                      opacity: task.completed ? 0.4 : 1,
                      textDecoration: task.completed ? 'line-through' : 'none'
                    }}>
                      {task.title || 'Unknown Task'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span className={`badge ${getTagClass(task.category)}`}>
                      {(task.category || 'LEARNING')}
                    </span>
                    {!task.isRequired && !task.completed && (task.id.startsWith('discipline-') || task.id.startsWith('physical-') || task.id.startsWith('career-') || task.id.startsWith('learning-') || task.id.startsWith('fixed:')) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Dismiss task "${task.title}" permanently?`)) {
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
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                      +{task.xpReward} XP
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* STATS 2x2 GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          
          <div className="card" style={{ background: 'var(--violet-bg)', borderColor: 'var(--violet-border)' }}>
            <div style={{ fontSize: '9px', color: 'var(--violet)', letterSpacing: '0.2em', opacity: 0.7 }}>TOTAL XP</div>
            <div style={{ fontSize: '32px', color: 'var(--violet)', fontWeight: 600, marginTop: '4px' }}>{displayXp}</div>
            <div style={{ fontSize: '9px', color: 'var(--text-dim)', marginTop: '8px' }}>{(currentPhase || '').toUpperCase()} ACTIVE</div>
          </div>

          <div className="card" style={{ background: 'var(--amber-bg)', borderColor: 'var(--amber-border)' }}>
            <div style={{ fontSize: '9px', color: 'var(--amber)', letterSpacing: '0.2em', opacity: 0.7 }}>STREAK</div>
            <div style={{ fontSize: '32px', color: 'var(--amber)', fontWeight: 600, marginTop: '4px' }}>{displayStreak}</div>
            <div style={{ fontSize: '9px', color: 'var(--text-dim)', marginTop: '8px' }}>DAYS CONSECUTIVE</div>
          </div>

          <div className="card" style={{ background: 'var(--bg-card-accent)' }}>
            <div style={{ fontSize: '9px', color: 'var(--text-dim)', letterSpacing: '0.2em' }}>OPERATOR LVL</div>
            <div style={{ fontSize: '32px', color: 'var(--text-primary)', fontWeight: 600, marginTop: '4px' }}>{level}</div>
            <div style={{ width: '100%', height: '2px', background: 'var(--border)', borderRadius: '1px', marginTop: '6px', overflow: 'hidden' }}>
              <div style={{ width: `${xpPercent}%`, height: '100%', background: 'var(--green)' }}></div>
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text-dim)', marginTop: '6px' }}>{xpToNext} XP TO NEXT LEVEL</div>
          </div>

          <div className="card" style={{ background: 'var(--blue-bg)', borderColor: 'var(--blue-border)' }}>
            <div style={{ fontSize: '9px', color: 'var(--blue)', letterSpacing: '0.2em', opacity: 0.7 }}>PHASE STATUS</div>
            <div style={{ fontSize: '18px', color: 'var(--blue)', fontWeight: 500, marginTop: '12px', textTransform: 'uppercase' }}>
              {currentPhase === 'phase1' ? 'FOUNDATION' : currentPhase === 'phase2' ? 'MOMENTUM' : currentPhase === 'phase3' ? 'EXPANSION' : 'MASTERY'}
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text-dim)', marginTop: '14px' }}>WK {String(currentWeek).padStart(2, '0')} LOCKED</div>
          </div>

        </div>

        {/* ACTIVE ROUTINE BLOCK CARD */}
        {activeScheduleBlock && (() => {
          const styles = getBlockColorStyles(activeScheduleBlock);
          return (
            <div className="card" style={{
              background: styles.bg,
              borderColor: styles.text,
              borderLeft: `4px solid ${styles.text}`,
              boxShadow: `0 0 15px var(--border)`,
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="card-header" style={{ marginBottom: 0, color: styles.text }}>ACTIVE ROUTINE BLOCK</span>
                <span style={{
                  fontSize: '9px',
                  fontFamily: 'var(--font-mono)',
                  borderColor: styles.text,
                  border: `1px solid ${styles.text}`,
                  color: styles.text,
                  padding: '1px 5px',
                  borderRadius: '3px',
                  fontWeight: 'bold'
                }}>
                  {styles.label}
                </span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {activeScheduleBlock.label || activeScheduleBlock.name}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  ⏳ {activeScheduleBlock.start || activeScheduleBlock.time} — {activeScheduleBlock.end}
                </span>
                {activeScheduleBlock.description && (
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4, opacity: 0.85 }}>
                    {activeScheduleBlock.description}
                  </span>
                )}
              </div>
            </div>
          );
        })()}

        {/* UPCOMING EVENTS CARD */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span className="card-header" style={{ marginBottom: 0 }}>UPCOMING EVENTS // PLAN</span>
            <span style={{ fontSize: '9px', color: 'var(--accent-amber)', letterSpacing: '0.1em' }}>SCHEDULED OPS</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {upcomingEvents.length === 0 ? (
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--text-dim)',
                fontStyle: 'italic',
                textAlign: 'center',
                padding: '16px',
                border: '1px dashed var(--border)'
              }}>
                NO UPCOMING EVENTS SCHEDULED
              </div>
            ) : (
              upcomingEvents.map((evt, idx) => {
                const isMissionsActive = evt.missionsActive ?? true;
                const borderAccent = evt.color || 'var(--accent-amber)';
                return (
                  <div 
                    key={evt.id || idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.01)',
                      border: '1px solid var(--border)',
                      borderLeft: `3px solid ${borderAccent}`,
                      borderRadius: 'var(--r-md)',
                      padding: '10px 12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, minWidth: 0 }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {evt.name || evt.title}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                        📅 {evt.startDate} — {evt.endDate}
                      </span>
                      {evt.notes && (
                        <span style={{
                          fontSize: '10px',
                          color: 'var(--text-dim)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          opacity: 0.8
                        }}>
                          {evt.notes}
                        </span>
                      )}
                    </div>
                    <span style={{
                      fontSize: '8px',
                      color: isMissionsActive ? 'var(--green)' : 'var(--accent-coral)',
                      fontWeight: 'bold',
                      border: `1px solid ${isMissionsActive ? 'var(--green)' : 'var(--accent-coral)'}`,
                      padding: '2px 5px',
                      borderRadius: '2px',
                      whiteSpace: 'nowrap',
                      textTransform: 'uppercase'
                    }}>
                      {isMissionsActive ? 'ONGOING' : 'SUSPEND'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ACTIVE SKILL CHAIN CARD */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-header" style={{ marginBottom: 0 }}>ACTIVE SKILL CHAIN</span>
            <span style={{ fontSize: '11px', color: 'var(--green)', letterSpacing: '0.1em' }}>NETWORKING</span>
          </div>

          <div style={{ marginTop: '18px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>STEP {String(chainStep).padStart(2, '0')} / {String(chainTotal).padStart(2, '0')}</div>
            <div style={{ width: '100%', height: '4px', background: 'var(--border)', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
              <div style={{ width: `${chainPercent}%`, height: '100%', background: 'var(--green)' }}></div>
            </div>
            
            <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '10px' }}>
              Master the OSI Model and Subnetting
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.6 }}>
              Complete the fundamental networking modules in TryHackMe and apply them to local VMs.
            </div>
            
            <div style={{ textAlign: 'right', marginTop: '12px' }}>
              <span style={{ fontSize: '9px', color: 'var(--text-dim)' }}>NEXT </span>
              <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>SUBNETTING MASTERY</span>
            </div>
          </div>
        </div>

        {/* SIGNAL ANALYSIS CARD */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <span className="card-header" style={{ marginBottom: 0 }}>SIGNAL ANALYSIS</span>
            <span style={{ fontSize: '9px', color: 'var(--green)' }}>SIGNAL ACTIVE</span>
          </div>

          <div style={{ position: 'relative', width: '100%', height: '80px', borderBottom: '1px solid var(--border)' }}>
            <svg width="100%" height="80" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
              <polyline 
                points={points}
                fill="none" 
                stroke="var(--blue)" 
                strokeWidth="1.5" 
                strokeLinejoin="round"
              />
              {waveform.map((d, i) => {
                const x = (i / 6) * svgWidth;
                const y = svgHeight - (d.xp / maxXP) * (svgHeight - 10) - 5;
                return (
                  <circle key={i} cx={x} cy={y} r="4" fill="var(--blue)" />
                );
              })}
            </svg>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            {waveform.map((w, i) => <span key={i} style={{ fontSize: '9px', color: 'var(--text-dim)' }}>{w.day}</span>)}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
