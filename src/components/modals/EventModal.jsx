// src/components/modals/EventModal.jsx
// Purpose: Renders the event configuration modal allowing operators to register or edit schedule events and task suppression parameters.

import React from 'react';
import { useAppStore } from '../../store/appStore';

export default function EventModal() {
  const {
    showEventModal,
    setShowEventModal,
    editingEventId,
    eventName,
    setEventName,
    eventStartDate,
    setEventStartDate,
    eventEndDate,
    setEventEndDate,
    eventMissionsActive,
    setEventMissionsActive,
    eventColor,
    setEventColor,
    eventNotes,
    setEventNotes,
    handleSaveEvent,
    handleDeleteEvent
  } = useAppStore();

  if (!showEventModal) return null;

  return (
    <div className="debrief-modal-overlay" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(7, 8, 10, 0.95)',
      zIndex: 150000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div className="debrief-modal-box" style={{
        width: '100%',
        maxWidth: '450px',
        background: 'var(--bg-card)',
        border: '2px solid var(--accent-amber)',
        padding: '24px',
        boxShadow: '0 0 20px var(--accent-amber-glow)',
        fontFamily: 'var(--font-mono)',
        color: 'var(--accent-amber)',
        position: 'relative'
      }}>
        <div style={{
          borderBottom: '1px dashed var(--accent-amber)',
          paddingBottom: '12px',
          marginBottom: '16px',
          fontWeight: 'bold',
          fontSize: '16px',
          letterSpacing: '0.05em'
        }}>
          &gt; {editingEventId ? 'EDIT EVENT' : 'CREATE EVENT'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>EVENT NAME</label>
            <input
              type="text"
              placeholder="e.g. Physics Exam, Travel, Rest Day"
              className="dark-date-picker"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>START DATE</label>
              <input
                type="date"
                className="dark-date-picker"
                value={eventStartDate}
                onChange={(e) => setEventStartDate(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>END DATE</label>
              <input
                type="date"
                className="dark-date-picker"
                value={eventEndDate}
                onChange={(e) => setEventEndDate(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>MISSIONS ACTIVE</span>
            <button
              onClick={() => setEventMissionsActive(!eventMissionsActive)}
              className="end-shift-btn"
              style={{
                background: 'var(--bg-card)',
                border: `1px solid ${eventMissionsActive ? 'var(--accent-green)' : 'var(--accent-coral)'}`,
                color: eventMissionsActive ? 'var(--accent-green)' : 'var(--accent-coral)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                padding: '2px 8px',
                cursor: 'pointer'
              }}
            >
              {eventMissionsActive ? '[ ON ]' : '[ OFF ]'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>EVENT NOTES / INTEL DETAILS</label>
            <textarea
              placeholder="e.g. syllabus key objectives, travel locations, specific prep checklist items..."
              className="dark-date-picker"
              value={eventNotes}
              onChange={(e) => setEventNotes(e.target.value)}
              style={{
                width: '100%',
                height: '80px',
                resize: 'vertical',
                fontFamily: 'var(--font-mono)'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>COLOR TAG</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {['amber', 'red', 'green', 'blue'].map(c => {
                let btnColor = 'var(--amber)';
                if (c === 'red') {
                  btnColor = 'var(--red)';
                } else if (c === 'green') {
                  btnColor = 'var(--green)';
                } else if (c === 'blue') {
                  btnColor = 'var(--blue)';
                }

                return (
                  <button
                    key={c}
                    onClick={() => setEventColor(c)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: btnColor,
                      border: eventColor === c ? '2px solid var(--text-primary)' : 'none',
                      cursor: 'pointer',
                      boxShadow: eventColor === c ? `0 0 8px ${btnColor}` : 'none'
                    }}
                  ></button>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editingEventId ? (
            <button
              onClick={handleDeleteEvent}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--accent-coral)',
                color: 'var(--accent-coral)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                padding: '6px 16px',
                cursor: 'pointer',
                textTransform: 'uppercase'
              }}
            >DELETE</button>
          ) : <div></div>}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowEventModal(false)}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--text-muted)',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                padding: '6px 16px',
                cursor: 'pointer',
                textTransform: 'uppercase'
              }}
            >CANCEL</button>
            <button
              onClick={handleSaveEvent}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--accent-amber)',
                color: 'var(--accent-amber)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                padding: '6px 16px',
                cursor: 'pointer',
                textTransform: 'uppercase'
              }}
            >SAVE</button>
          </div>
        </div>
      </div>
    </div>
  );
}
