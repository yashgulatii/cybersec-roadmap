// src/pages/Calendar.jsx
// Purpose: Displays the Operational Calendar page, including monthly calendars, date selectors, holidays, and event indicators.

import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';

export default function Calendar() {
  const {
    calendarDate,
    setCalendarDate,
    events,
    setShowEventModal,
    setEditingEventId,
    setEventName,
    setEventStartDate,
    setEventEndDate,
    setEventMissionsActive,
    eventColor,
    setEventColor,
    eventNotes,
    setEventNotes,
    isTodayHoliday,
    removeEvent,
    state
  } = useAppStore();

  const [selectedEvent, setSelectedEvent] = useState(null);

  const activeEvent = React.useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return (events ?? []).find(evt => today >= evt.startDate && today <= evt.endDate);
  }, [events]);

  const getTodayString = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const startDayOfWeek = firstDayOfMonth.getDay();
    const offset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const days = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = offset - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({ date: d, isCurrentMonth: false });
    }

    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= lastDayOfMonth; i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, isCurrentMonth: true });
    }

    const totalCells = Math.ceil(days.length / 7) * 7;
    const paddingCells = totalCells - days.length;
    for (let i = 1; i <= paddingCells; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, isCurrentMonth: false });
    }

    return days;
  };

  const getXpForDate = (dateStr) => {
    const dayLogs = state?.logs?.[dateStr] ?? [];
    const completedLogs = dayLogs.filter(log => log && log.type === 'completed');
    return completedLogs.reduce((sum, log) => sum + (log.xp || 0), 0);
  };

  const getEventsForDate = (dateStr) => {
    return events.filter(evt => dateStr >= evt.startDate && dateStr <= evt.endDate);
  };

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const monthName = calendarDate.toLocaleString('default', { month: 'long' }).toUpperCase();

  const days = getCalendarDays(calendarDate);
  const weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const handlePrevMonth = () => {
    setCalendarDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarDate(new Date(year, month + 1, 1));
  };

  return (
    <section className="calendar-section" style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="panel-title">📅 OPERATIONAL CALENDAR // {monthName} {year}</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              setEditingEventId(null);
              setEventName('');
              setEventStartDate(getTodayString());
              setEventEndDate(getTodayString());
              setEventMissionsActive(true);
              setEventColor('amber');
              setShowEventModal(true);
            }}
            className="end-shift-btn"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--accent-green)',
              color: 'var(--accent-green)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              fontWeight: 'bold',
              padding: '4px 12px',
              cursor: 'pointer',
              boxShadow: '0 0 5px rgba(34, 197, 94, 0.2)',
              textTransform: 'uppercase'
            }}
          >+ ADD EVENT</button>
          <button
            onClick={handlePrevMonth}
            className="end-shift-btn"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--accent-amber)',
              color: 'var(--accent-amber)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              padding: '4px 12px',
              cursor: 'pointer'
            }}
          >
            &lt; PREV
          </button>
          <button
            onClick={handleNextMonth}
            className="end-shift-btn"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--accent-amber)',
              color: 'var(--accent-amber)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              padding: '4px 12px',
              cursor: 'pointer'
            }}
          >
            NEXT &gt;
          </button>
        </div>
      </div>
      <hr className="section-divider" />

      {/* ACTIVE EVENT DETAILS BANNER */}
      {activeEvent && (
        <div style={{
          background: 'rgba(251, 191, 36, 0.05)',
          border: '1px solid var(--accent-amber)',
          borderLeft: '4px solid var(--accent-amber)',
          padding: '16px 20px',
          borderRadius: 'var(--r-md)',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 0 15px rgba(251, 191, 36, 0.1)',
          fontFamily: 'var(--font-mono)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '9px', color: 'var(--accent-amber)', letterSpacing: '0.15em', fontWeight: 'bold' }}>⚠️ ACTIVE OPERATION EVENT OVERVIEW</span>
            <span style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{activeEvent.name || activeEvent.title}</span>
            {activeEvent.notes && <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{activeEvent.notes}</span>}
          </div>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '9px', color: 'var(--text-dim)' }}>DATE DURATION</span>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>{activeEvent.startDate} — {activeEvent.endDate}</span>
            <span style={{ fontSize: '9px', color: activeEvent.missionsActive ? 'var(--accent-green)' : 'var(--accent-coral)' }}>
              {activeEvent.missionsActive ? 'MISSIONS ACTIVE' : 'MISSIONS SUSPENDED'}
            </span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start', width: '100%' }}>
        {/* Calendar Grid Container */}
        <div style={{
          flex: '1 1 600px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {/* Weekday headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '8px',
            textAlign: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--text-muted)',
            fontWeight: 'bold',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '8px'
          }}>
            {weekdays.map(day => <div key={day}>{day}</div>)}
          </div>

          {/* Days grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gridAutoRows: 'minmax(90px, auto)',
            gap: '8px'
          }}>
            {days.map(({ date, isCurrentMonth }, idx) => {
              const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
              const isToday = dateStr === getTodayString();
              const isHoliday = !!state?.holidays?.[dateStr];
              const dayXp = getXpForDate(dateStr);

              const dateEvents = getEventsForDate(dateStr);
              const hasRedEvent = dateEvents.some(e => e.color === 'red');
              const hasBlueEvent = dateEvents.some(e => e.color === 'blue');

              let borderStyle = '1px solid var(--border-color)';
              if (isToday) {
                borderStyle = '2px solid var(--accent-green)';
              }

              const isFuture = date > new Date();
              const isPast = date < new Date() && !isToday;

              let cellBg = 'rgba(0, 0, 0, 0.2)';
              let dateColor = 'var(--text-main)';

              if (!isCurrentMonth) {
                cellBg = 'rgba(0, 0, 0, 0.4)';
                dateColor = 'var(--text-muted)';
              } else if (isToday) {
                cellBg = 'rgba(34, 197, 94, 0.08)'; // Soft green background
                dateColor = 'var(--accent-green)'; // Green dates
              } else if (isHoliday) {
                cellBg = 'rgba(156, 163, 175, 0.15)'; // Grey holiday tint
              } else if (hasRedEvent) {
                cellBg = 'rgba(239, 68, 68, 0.12)'; // Red exam tint
              } else if (hasBlueEvent) {
                cellBg = 'rgba(59, 130, 246, 0.12)'; // Blue trip tint
              } else if (isFuture) {
                dateColor = 'var(--text-muted)';
              } else if (isPast && dayXp === 0) {
                cellBg = 'rgba(255, 111, 97, 0.05)';
                borderStyle = '1px solid rgba(255, 111, 97, 0.2)';
              }

              return (
                <div
                  key={idx}
                  className="calendar-day-cell"
                  style={{
                    background: cellBg,
                    border: borderStyle,
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '90px',
                    boxShadow: isToday ? '0 0 10px rgba(34, 197, 94, 0.15)' : 'none',
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setEditingEventId(null);
                    setEventName('');
                    setEventStartDate(dateStr);
                    setEventEndDate(dateStr);
                    setEventMissionsActive(true);
                    setEventColor('amber');
                    setEventNotes('');
                    setShowEventModal(true);
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        color: dateColor
                      }}>
                        {date.getDate()}
                      </span>
                      {/* Event Color Dots row */}
                      <div className="event-dots-row" style={{ display: 'flex', gap: '3px', marginTop: '2px' }}>
                        {isHoliday && (
                          <span
                            title="Holiday"
                            style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#9ca3af', display: 'inline-block' }}
                          />
                        )}
                        {dateEvents.map(evt => {
                          let dotColor = '#f5a623'; // Amber
                          if (evt.color === 'red') {
                            dotColor = '#ef4444'; // Red
                          } else if (evt.color === 'blue') {
                            dotColor = '#3b82f6'; // Blue
                          } else if (evt.color === 'green') {
                            dotColor = '#10b981'; // Green
                          }
                          return (
                            <span
                              key={evt.id}
                              title={evt.name}
                              style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: dotColor, display: 'inline-block' }}
                            />
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      {isHoliday && (
                        <span style={{
                          background: '#9ca3af',
                          color: 'var(--bg-card)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '8px',
                          fontWeight: 'bold',
                          padding: '0px 3px',
                          borderRadius: '1px'
                        }}>
                          H
                        </span>
                      )}

                      {dayXp > 0 && (
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          color: 'rgba(34, 197, 94, 0.8)',
                          fontWeight: 'bold'
                        }}>
                          +{dayXp}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    marginTop: '8px'
                  }}>
                    {dateEvents.map(evt => {
                      let tagColor = 'var(--accent-amber)';
                      let tagBg = 'rgba(251, 191, 36, 0.15)'; // Translucent amber
                      if (evt.color === 'red') {
                        tagColor = 'var(--accent-coral)';
                        tagBg = 'rgba(255, 111, 97, 0.15)'; // Translucent coral
                      } else if (evt.color === 'green') {
                        tagColor = 'var(--accent-green)';
                        tagBg = 'rgba(34, 197, 94, 0.15)'; // Translucent green
                      } else if (evt.color === 'blue') {
                        tagColor = 'var(--accent-blue)';
                        tagBg = 'rgba(59, 130, 246, 0.15)'; // Translucent blue
                      }

                      return (
                        <div
                          key={evt.id}
                          style={{
                            background: tagBg,
                            border: `1px solid ${tagColor}`,
                            color: tagColor,
                            fontSize: '9px',
                            fontFamily: 'var(--font-mono)',
                            padding: '1px 4px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(evt);
                          }}
                        >
                          {evt.name}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Event Details Panel on the right */}
        {selectedEvent && (
          <div style={{
            width: '280px',
            flexShrink: 0,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            fontFamily: 'var(--font-mono)',
            boxShadow: '0 0 10px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border-color)', paddingBottom: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--accent-amber)', fontWeight: 'bold' }}>// EVENT INTEL</span>
              <button
                onClick={() => setSelectedEvent(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  padding: 0
                }}
              >
                [ CLOSE ]
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>EVENT IDENTIFIER</span>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-main)', wordBreak: 'break-word' }}>
                {selectedEvent.name}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>OPERATIONAL DATE RANGE</span>
              <span style={{ fontSize: '11px', color: 'var(--text-main)' }}>
                {selectedEvent.startDate} — {selectedEvent.endDate}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>CLASSIFICATION COLOR</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: selectedEvent.color === 'red' ? '#ef4444' : selectedEvent.color === 'blue' ? '#3b82f6' : selectedEvent.color === 'green' ? '#10b981' : '#f5a623'
                }}></div>
                <span style={{ fontSize: '10px', color: 'var(--text-main)', textTransform: 'uppercase' }}>
                  {selectedEvent.color}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>TASK SUPPRESSION STATUS</span>
              <span style={{ fontSize: '11px', color: selectedEvent.missionsActive ? 'var(--accent-coral)' : 'var(--accent-green)' }}>
                {selectedEvent.missionsActive ? 'MISSIONS SUSPENDED' : 'MISSIONS ACTIVE'}
              </span>
            </div>

            {selectedEvent.notes && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>EVENT NOTES / INTEL</span>
                <span style={{ fontSize: '11px', color: 'var(--text-main)', lineHeight: '1.4', wordBreak: 'break-word' }}>
                  {selectedEvent.notes}
                </span>
              </div>
            )}

            <button
              onClick={() => {
                setEditingEventId(selectedEvent.id);
                setEventName(selectedEvent.name || selectedEvent.title || '');
                setEventStartDate(selectedEvent.startDate || '');
                setEventEndDate(selectedEvent.endDate || '');
                setEventMissionsActive(selectedEvent.missionsActive !== false);
                setEventColor(selectedEvent.color || 'amber');
                setEventNotes(selectedEvent.notes || '');
                setShowEventModal(true);
              }}
              style={{
                marginTop: '12px',
                background: 'rgba(245, 166, 35, 0.1)',
                border: '1px solid var(--accent-amber)',
                color: 'var(--accent-amber)',
                fontSize: '11px',
                fontWeight: 'bold',
                padding: '8px 12px',
                cursor: 'pointer',
                textAlign: 'center',
                textTransform: 'uppercase',
                transition: 'background 0.2s'
              }}
            >
              EDIT EVENT
            </button>

            <button
              onClick={() => {
                removeEvent({ id: selectedEvent.id });
                setSelectedEvent(null);
              }}
              style={{
                marginTop: '8px',
                background: 'rgba(255, 111, 97, 0.1)',
                border: '1px solid var(--accent-coral)',
                color: 'var(--accent-coral)',
                fontSize: '11px',
                fontWeight: 'bold',
                padding: '8px 12px',
                cursor: 'pointer',
                textAlign: 'center',
                textTransform: 'uppercase',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255, 111, 97, 0.2)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255, 111, 97, 0.1)'}
            >
              REMOVE EVENT
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
