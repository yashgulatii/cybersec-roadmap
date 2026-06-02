// src/pages/Manage.jsx
// Purpose: Unified operational dashboard to manage weekly targets, view stats, and sync ad-hoc tasks to daily ops.

import React, { useState, useMemo } from 'react';
import { useAppStore, storage } from '../store/appStore';
import { roadmapData } from '../data/roadmapData';
import CategoryTag from '../components/ui/CategoryTag';
import ProgressBar from '../components/ui/ProgressBar';

export default function Manage() {
  const {
    currentPhase,
    currentWeek,
    dailyState,
    handleToggleMission,
    customFixedTasks,
    setCustomFixedTasks,
    deletedTaskIds
  } = useAppStore();

  const [expandedDays, setExpandedDays] = useState({
    MONDAY: true, TUESDAY: true, WEDNESDAY: true, THURSDAY: true,
    FRIDAY: true, SATURDAY: true, SUNDAY: true
  });
  
  const toggleDay = (day) => {
    setExpandedDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  // Custom task form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('OPS');
  const [newXp, setNewXp] = useState(25);

  // 1. Resolve current week tasks with safe checks
  const currentWeekTasks = useMemo(() => {
    const phase = roadmapData[currentPhase];
    if (!phase) return [];
    
    const tasks = [];
    if (currentPhase === 'phase1' && phase.weeks) {
      const week = phase.weeks.find(w => w.weekNumber === currentWeek);
      if (week) tasks.push(...(week.tasks ?? []));
    } else if (currentPhase === 'phase2' && phase.months) {
      const month = phase.months.find(m => m.monthNumber === currentWeek);
      if (month) tasks.push(...(month.tasks ?? []));
    } else if (currentPhase === 'phase3' && phase.quarters) {
      const quarter = phase.quarters.find(q => q.quarterNumber === currentWeek);
      if (quarter) tasks.push(...(quarter.tasks ?? []));
    } else if (currentPhase === 'phase4' && phase.years) {
      const year = phase.years.find(y => y.yearNumber === currentWeek);
      if (year) tasks.push(...(year.tasks ?? []));
    }
    return tasks;
  }, [currentPhase, currentWeek]);

  // 2. Weekly summary stats
  const weeklySummary = useMemo(() => {
    const completedSet = new Set(dailyState?.completedTaskIds || []);
    const total = currentWeekTasks.length;
    const completed = currentWeekTasks.filter(t => completedSet.has(t.id)).length;
    const remaining = total - completed;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Pace Warning Logic: If it's Wednesday (3) or later and pct < 50
    const today = new Date().getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    const isPaceWarning = (today >= 3 || today === 0) && pct < 50;
    
    return {
      total,
      completed,
      remaining,
      pct,
      isPaceWarning
    };
  }, [currentWeekTasks, dailyState?.completedTaskIds]);

  // 3. Phase overall completion stats
  const phaseStats = useMemo(() => {
    const phase = roadmapData[currentPhase];
    if (!phase) return { completed: 0, total: 0, pct: 0 };
    
    // Gather all task IDs in this phase
    const allTaskIds = [];
    const sections = phase.weeks || phase.months || phase.quarters || phase.years || [];
    sections.forEach(sec => {
      (sec.tasks || []).forEach(task => {
        allTaskIds.push(task.id);
      });
    });

    const completedSet = new Set(dailyState?.completedTaskIds || []);
    const total = allTaskIds.length;
    const completed = allTaskIds.filter(id => completedSet.has(id)).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, pct };
  }, [currentPhase, dailyState?.completedTaskIds]);

  // 4. Group tasks by day & filter for today's only
  // Selected date state (defaults to today)
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0]; // format YYYY-MM-DD
  });

  // Compute day name from selected date
  const selectedDayName = useMemo(() => {
    if (!selectedDate) return 'MONDAY';
    const [year, month, day] = selectedDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[date.getDay()];
  }, [selectedDate]);

  const todayTasks = useMemo(() => {
    const todayList = [];
    currentWeekTasks.forEach(task => {
      const day = (task.day || 'MONDAY').toUpperCase();
      if (day === selectedDayName) {
        todayList.push(task);
      }
    });
    return todayList;
  }, [currentWeekTasks, selectedDayName]);

  const weekLabel = useMemo(() => {
    if (currentPhase === 'phase1') return `Week ${currentWeek}`;
    if (currentPhase === 'phase2') return `Month ${currentWeek}`;
    if (currentPhase === 'phase3') return `Quarter ${currentWeek}`;
    if (currentPhase === 'phase4') return `Year ${currentWeek}`;
    return `Period ${currentWeek}`;
  }, [currentPhase, currentWeek]);

  const handleAddCustomTask = () => {
    if (!newTitle.trim()) return;
    const newId = `fixed:custom_${Date.now()}`;
    const newTask = {
      id: newId,
      title: newTitle.trim(),
      category: newCategory,
      xp: parseInt(newXp) || 25,
      stat: 'OPS',
      bonus: Math.ceil((parseInt(newXp) || 25) * 0.1)
    };
    const nextCustom = [...(customFixedTasks || []), newTask];
    setCustomFixedTasks(nextCustom);
    storage.setItem('customFixedTasks', JSON.stringify(nextCustom));
    setNewTitle('');
  };

  const handleAddRoadmapToDaily = (task) => {
    // Check if it's already queued
    if ((customFixedTasks || []).some(c => c.id === task.id)) return;
    
    const newTask = {
      id: task.id,
      title: task.title,
      category: task.category || 'LEARNING',
      xp: task.xpReward || task.xp || 25,
      stat: 'OPS',
      bonus: 2
    };
    const nextCustom = [...(customFixedTasks || []), newTask];
    setCustomFixedTasks(nextCustom);
    storage.setItem('customFixedTasks', JSON.stringify(nextCustom));
  };

  const hasAnyTasks = currentWeekTasks.length > 0;

  return (
    <section className="manage-section" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <h2 className="panel-title">✎ OPERATIONAL MANAGEMENT DASHBOARD</h2>
      <hr className="section-divider" />

      {/* 1. COMPLETION STATUS REPORT */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderLeft: '4px solid var(--accent-blue)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <h4 style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--accent-blue)' }}>
          &gt; {(currentPhase || '').toUpperCase()} STATUS REPORT
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {/* Weekly Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>{weekLabel.toUpperCase()} TARGETS</span>
              <span>{weeklySummary.pct}% ({weeklySummary.completed}/{weeklySummary.total} done)</span>
            </div>
            <ProgressBar percentage={weeklySummary.pct} color="var(--accent-blue)" />
          </div>

          {/* Phase Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>OVERALL PHASE PROGRESS</span>
              <span>{phaseStats.pct}% ({phaseStats.completed}/{phaseStats.total} done)</span>
            </div>
            <ProgressBar percentage={phaseStats.pct} color="var(--accent-green)" />
          </div>
        </div>

        {weeklySummary.isPaceWarning && weeklySummary.total > 0 && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-coral)', marginTop: '4px', fontWeight: 'bold' }}>
            [!] PACE WARNING: {weeklySummary.remaining} target{weeklySummary.remaining === 1 ? '' : 's'} remaining this period.
          </div>
        )}
      </div>

      {/* 2. TODAY'S OBJECTIVES OVERVIEW */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', marginRight: '6px' }}>Select Date:</label>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '4px 8px', color: 'var(--text-primary)' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--text-muted)' }}>TODAY'S OBJECTIVES OVERVIEW</h3>
        
        {!hasAnyTasks || todayTasks.length === 0 ? (
          <div className="empty-state" style={{
            padding: '48px 24px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            border: '1px dashed var(--border-color)',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            [ NO ACTIVE ROADMAP MISSIONS REGISTERED FOR TODAY ]
          </div>
        ) : (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                padding: '10px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px dashed var(--border-color)',
                background: 'rgba(255,255,255,0.02)'
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--accent-amber)', fontWeight: 'bold' }}>{selectedDayName} (TODAY)</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>{todayTasks.length} TASKS</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 16px' }}>
              {todayTasks.map(task => {
                const isCompleted = dailyState?.completedTaskIds?.includes(task.id) || false;
                const isQueued = (customFixedTasks || []).some(c => c.id === task.id);
                const xpVal = task.xpReward || task.xp || 25;
                
                return (
                  <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '200px' }}>
                      <div
                        onClick={(e) => handleToggleMission(task.id, xpVal, false, null, null, e)}
                        className="checkbox-container"
                        style={{ borderColor: isCompleted ? 'var(--accent-green)' : 'var(--border-color)', flexShrink: 0, cursor: 'pointer' }}
                      >
                        {isCompleted && <span className="checkmark-icon" style={{ background: 'var(--accent-green)' }}></span>}
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: isCompleted ? 'var(--text-muted)' : 'var(--text-main)', textDecoration: isCompleted ? 'line-through' : 'none' }}>
                        {task.title}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <CategoryTag category={task.category} />
                      <button
                        onClick={() => handleAddRoadmapToDaily(task)}
                        disabled={isQueued || isCompleted}
                        style={{
                          background: 'transparent',
                          border: isQueued ? '1px solid var(--text-muted)' : '1px solid var(--accent-green)',
                          color: isQueued ? 'var(--text-muted)' : 'var(--accent-green)',
                          padding: '4px 8px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10px',
                          cursor: (isQueued || isCompleted) ? 'not-allowed' : 'pointer',
                          opacity: (isQueued || isCompleted) ? 0.5 : 1
                        }}
                      >
                        {isQueued ? '[ IN QUEUE ]' : '[ ADD TO TODAY ]'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. CUSTOM TASK ENTRY */}
      <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--text-muted)' }}>CUSTOM ONE-TIME TARGET</h3>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          padding: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'flex-end'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '200px' }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>TARGET TITLE</label>
            <input
              type="text"
              className="dark-date-picker"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="E.g. Investigate alert log #1409"
              style={{ width: '100%' }}
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>CATEGORY</label>
            <select
              className="dark-date-picker"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              style={{ minWidth: '120px' }}
            >
              <option value="OPS">OPS</option>
              <option value="INTEL">INTEL</option>
              <option value="COMMS">COMMS</option>
              <option value="DISCIPLINE">DISCIPLINE</option>
              <option value="PHYSICAL">PHYSICAL</option>
              <option value="SOCIAL">SOCIAL</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>XP REWARD</label>
            <input
              type="number"
              className="dark-date-picker"
              value={newXp}
              onChange={(e) => setNewXp(e.target.value)}
              style={{ width: '80px' }}
            />
          </div>

          <button
            onClick={handleAddCustomTask}
            style={{
              background: 'transparent',
              border: '1px solid var(--accent-amber)',
              color: 'var(--accent-amber)',
              padding: '6px 12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              cursor: 'pointer',
              height: '32px'
            }}
          >PUSH</button>
        </div>
      </div>

    </section>
  );
}
