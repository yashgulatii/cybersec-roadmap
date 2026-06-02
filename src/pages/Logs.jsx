// src/pages/Logs.jsx
// Purpose: Historical logs read-only page featuring a 7-day visualization bar and parsed log records.

import React, { useMemo, useState } from 'react';
import { useAppStore, storage } from '../store/appStore';

export default function Logs() {
  const { events, debriefs, state } = useAppStore();
  const [expandedDebriefs, setExpandedDebriefs] = useState({});

  const toggleDebrief = (dateStr) => {
    setExpandedDebriefs(prev => ({
      ...prev,
      [dateStr]: !prev[dateStr]
    }));
  };

  const isDateHoliday = (dateStr) => {
    const localReason = storage.getItem(`holiday:${dateStr}`);
    if (localReason !== null) return localReason || 'HOLIDAY';
    const event = events.find(evt => evt.missionsActive === false && dateStr >= evt.startDate && dateStr <= evt.endDate);
    if (event) return event.name || 'HOLIDAY';
    return false;
  };

  const getDayName = (date) => {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[date.getDay()];
  };

  const getMonthName = (date) => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return months[date.getMonth()];
  };

  const formatDateHeader = (dateStr) => {
    // dateStr is 'YYYY-MM-DD'
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr.toUpperCase();
    const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const day = getDayName(date);
    const dayNum = String(date.getDate()).padStart(2, '0');
    const month = getMonthName(date);
    const year = date.getFullYear();
    return `${day} — ${dayNum} ${month} ${year}`.toUpperCase();
  };

  const parseLogDay = (dateStr) => {
    const raw = storage.getItem(`log:${dateStr}`);
    if (!raw) return { completed: [], missed: [], totalXp: 0, isEmpty: true };
    try {
      const logs = JSON.parse(raw);
      if (!Array.isArray(logs) || logs.length === 0) return { completed: [], missed: [], totalXp: 0, isEmpty: true };
      const completed = logs.filter(log => log && log.type === 'completed');
      const missed = logs.filter(log => log && log.type === 'missed');
      const totalXp = completed.reduce((sum, log) => sum + (log.xp || 0), 0);
      return { completed, missed, totalXp, isEmpty: false };
    } catch {
      return { completed: [], missed: [], totalXp: 0, isEmpty: true };
    }
  };

  const getParsedSections = (debriefText) => {
    if (!debriefText) return null;
    let text = '';
    if (typeof debriefText === 'object') {
      text = debriefText.content || debriefText.message || '';
    } else {
      text = String(debriefText);
    }
    if (!text) return null;
    
    const sections = { performance: '', pattern: '', priority: '', health: '', morale: '' };
    
    const idxPerformance = text.search(/performance\s*assessment/i);
    const idxPattern = text.search(/pattern\s*alert/i);
    const idxPriority = text.search(/priority\s*directive/i);
    const idxHealth = text.search(/phase\s*health\s*check/i);
    const idxMorale = text.search(/morale\s*signal/i);

    const markers = [
      { key: 'performance', idx: idxPerformance },
      { key: 'pattern', idx: idxPattern },
      { key: 'priority', idx: idxPriority },
      { key: 'health', idx: idxHealth },
      { key: 'morale', idx: idxMorale }
    ].filter(m => m.idx !== -1).sort((a, b) => a.idx - b.idx);

    if (markers.length === 0) {
      return {
        'PERFORMANCE ASSESSMENT': text,
        'PATTERN ALERT': '',
        'PRIORITY DIRECTIVE': '',
        'PHASE HEALTH CHECK': '',
        'MORALE SIGNAL': ''
      };
    }

    for (let i = 0; i < markers.length; i++) {
      const current = markers[i];
      const next = markers[i + 1];
      let content = text.slice(current.idx, next ? next.idx : text.length);
      content = content.replace(/^[#\s*\-*]*(performance\s*assessment|pattern\s*alert|priority\s*directive|phase\s*health\s*check|morale\s*signal)[\s*:\-]*\s*/i, '').trim();
      sections[current.key] = content;
    }

    return {
      'PERFORMANCE ASSESSMENT': sections.performance,
      'PATTERN ALERT': sections.pattern,
      'PRIORITY DIRECTIVE': sections.priority,
      'PHASE HEALTH CHECK': sections.health,
      'MORALE SIGNAL': sections.morale
    };
  };

  // 1. All historical logs descending
  const historicalLogs = useMemo(() => {
    const dbLogs = state?.logs ?? {};
    const keys = [];
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (k && k.startsWith('log:')) {
        keys.push(k);
      }
    }
    const datesSet = new Set(keys.map(k => k.replace('log:', '')));
    Object.keys(dbLogs).forEach(d => datesSet.add(d));
    const dates = Array.from(datesSet).sort((a, b) => b.localeCompare(a));
    
    return dates.map(dateStr => {
      let completed = [];
      let missed = [];
      let totalXp = 0;
      let isEmpty = true;
      let parsed = null;

      const dbDayLogs = dbLogs[dateStr];
      if (dbDayLogs && Array.isArray(dbDayLogs) && dbDayLogs.length > 0) {
        completed = dbDayLogs.filter(log => log && log.type === 'completed').map(log => ({
          taskName: log.taskName || log.title,
          tag: log.category,
          xp: log.xp,
          completedAt: log.completedAt
        }));
        missed = dbDayLogs.filter(log => log && log.type === 'missed').map(log => ({
          taskName: log.taskName || log.title,
          tag: log.category,
          xp: log.xp,
          xpPenalty: log.xpPenalty
        }));
        totalXp = completed.reduce((sum, log) => sum + (log.xp || 0), 0);
        isEmpty = false;
      } else {
        parsed = parseLogDay(dateStr);
        completed = parsed.completed;
        missed = parsed.missed;
        totalXp = parsed.totalXp;
        isEmpty = parsed.isEmpty;
      }

      let fallbackText = '';
      if (isEmpty) {
        const holidayReason = isDateHoliday(dateStr);
        fallbackText = holidayReason ? `[ HOLIDAY: ${(holidayReason || '').toUpperCase()} ]` : '[ NO DATA ]';
      }
      return {
        dateStr,
        ...(parsed || {}), // fallback compatibility
        completed,
        missed,
        totalXp,
        isEmpty,
        fallbackText
      };
    });
  }, [state?.logs, events]);

  // 2. 7-Day Summary Bar
  const last7Days = useMemo(() => {
    const dbLogs = state?.logs ?? {};
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      let completed = [];
      let missed = [];
      let totalXp = 0;
      let isEmpty = true;

      const dbDayLogs = dbLogs[dateStr];
      if (dbDayLogs && Array.isArray(dbDayLogs) && dbDayLogs.length > 0) {
        completed = dbDayLogs.filter(log => log && log.type === 'completed');
        missed = dbDayLogs.filter(log => log && log.type === 'missed');
        totalXp = completed.reduce((sum, log) => sum + (log.xp || 0), 0);
        isEmpty = false;
      } else {
        const parsed = parseLogDay(dateStr);
        completed = parsed.completed;
        missed = parsed.missed;
        totalXp = parsed.totalXp;
        isEmpty = parsed.isEmpty;
      }
      
      let color = 'var(--text-muted)'; // Grey if holiday or no data
      if (!isEmpty) {
        const total = completed.length + missed.length;
        if (total > 0) {
          const completionRate = completed.length / total;
          if (completionRate > 0.5) color = 'var(--accent-green)';
          else if (completionRate >= 0.3) color = 'var(--accent-amber)';
          else color = 'var(--accent-coral)';
        }
      }

      days.push({
        dateStr,
        dayNum: String(d.getDate()),
        color,
        totalXp: totalXp
      });
    }
    return days;
  }, [state?.logs]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', fontFamily: 'var(--font-mono)' }}>
      
      {/* 7-DAY SUMMARY BAR */}
      <section>
        <h2 className="panel-title" style={{ fontSize: '14px', marginBottom: '12px' }}>7-DAY PERFORMANCE RADAR</h2>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          padding: '16px',
          gap: '8px',
          overflowX: 'auto'
        }}>
          {last7Days.map(day => (
            <div key={day.dateStr} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minWidth: '40px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>{day.dayNum}</span>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: day.color,
                boxShadow: `0 0 6px ${day.color}`
              }}></div>
              <span style={{ fontSize: '9px', color: day.totalXp > 0 ? 'var(--accent-amber)' : 'var(--text-muted)' }}>
                {day.totalXp > 0 ? `+${day.totalXp}` : '0'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* HISTORICAL LOGS */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h2 className="panel-title" style={{ fontSize: '14px' }}>HISTORICAL RECORDS</h2>
        {historicalLogs.length === 0 && (
           <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', fontSize: '13px' }}>NO LOG DATA FOUND IN STORAGE</div>
        )}
        
        {historicalLogs.map(logDay => {
          const debriefText = debriefs?.[logDay.dateStr];
          const isExpanded = !!expandedDebriefs[logDay.dateStr];
          const parsedSections = getParsedSections(debriefText);

          return (
            <div key={logDay.dateStr} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Header flex line */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {formatDateHeader(logDay.dateStr)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={() => toggleDebrief(logDay.dateStr)}
                    style={{
                      fontSize: '10px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-amber)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 'bold',
                      padding: 0
                    }}
                  >
                    {isExpanded ? '[ HIDE DEBRIEF ↑ ]' : '[ VIEW DEBRIEF ↓ ]'}
                  </button>
                </div>
              </div>
              
              {/* Inline Expanded Debrief */}
              {isExpanded && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '8px' }}>
                  {!debriefText ? (
                    <div style={{
                      padding: '16px',
                      background: 'rgba(255, 111, 97, 0.02)',
                      border: '1px dashed var(--accent-coral)',
                      color: 'var(--accent-coral)',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      textTransform: 'uppercase',
                      textAlign: 'center'
                    }}>
                      [!] DEBRIEF TELEMETRY COMPILATION FAILED: NO DEBRIEF RECORDED ON THIS DATE
                    </div>
                  ) : (
                    <div style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--accent-amber)',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{ fontSize: '10px', color: 'var(--accent-amber)', fontWeight: 'bold', letterSpacing: '0.05em', borderBottom: '1px dashed var(--border-color)', paddingBottom: '6px' }}>
                        // HISTORICAL COGNITIVE REVIEW LOG
                      </div>
                      
                      {parsedSections && Object.keys(parsedSections).map(sectionKey => {
                        const content = parsedSections[sectionKey];
                        if (!content) return null;
                        
                        let color = 'var(--text-main)';
                        let borderColor = 'var(--border-color)';
                        let bg = 'rgba(255, 255, 255, 0.01)';
                        
                        if (sectionKey === 'PERFORMANCE ASSESSMENT') {
                          color = 'var(--accent-amber)';
                          borderColor = 'var(--accent-amber)';
                          bg = 'rgba(186, 117, 23, 0.02)';
                        } else if (sectionKey === 'PATTERN ALERT') {
                          color = 'var(--accent-blue)';
                          borderColor = 'var(--accent-blue)';
                          bg = 'rgba(0, 200, 255, 0.02)';
                        } else if (sectionKey === 'PRIORITY DIRECTIVE') {
                          color = 'var(--accent-green)';
                          borderColor = 'var(--accent-green)';
                          bg = 'rgba(34, 197, 94, 0.03)';
                        }
                        
                        return (
                          <div key={sectionKey} style={{
                            background: bg,
                            border: `1px solid ${borderColor}`,
                            borderLeft: `4px solid ${borderColor}`,
                            padding: '10px 14px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}>
                            <span style={{ fontSize: '9px', color: color, fontWeight: 'bold', letterSpacing: '0.05em' }}>
                              // {sectionKey}
                            </span>
                            <p style={{ margin: 0, fontSize: '11px', lineHeight: '1.5', color: 'var(--text-main)' }}>
                              {content}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {logDay.isEmpty ? (
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-color)', color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center' }}>
                  {logDay.fallbackText}
                </div>
              ) : (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Summary Line */}
                  <div style={{ fontSize: '12px', color: 'var(--text-main)', borderBottom: '1px dashed var(--border-color)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--accent-green)' }}>{logDay.completed.length} completed</span> · <span style={{ color: 'var(--accent-coral)' }}>{logDay.missed.length} missed</span> · <span style={{ color: 'var(--accent-amber)' }}>+{logDay.totalXp} XP earned</span>
                  </div>
                  
                  {/* Side-by-side lists */}
                  <div className="logs-grid">
                    {/* Completed List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {logDay.completed.map((task, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', padding: '6px', background: 'rgba(34, 197, 94, 0.03)', borderLeft: '2px solid var(--accent-green)' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.taskName}</span>
                            <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{task.tag}</span>
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: 'bold', flexShrink: 0 }}>+{task.xp} XP</span>
                        </div>
                      ))}
                    </div>

                    {/* Missed List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {logDay.missed.map((task, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', padding: '6px', background: 'rgba(255, 111, 97, 0.03)', borderLeft: '2px solid var(--accent-coral)' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-main)', opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.taskName}</span>
                            <span style={{ fontSize: '9px', color: 'var(--text-muted)', opacity: 0.8 }}>{task.tag}</span>
                          </div>
                          {task.xpPenalty ? (
                             <span style={{ fontSize: '11px', color: 'var(--accent-coral)', fontWeight: 'bold', flexShrink: 0 }}>{task.xpPenalty} XP</span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
