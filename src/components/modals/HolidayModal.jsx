// src/components/modals/HolidayModal.jsx
// Purpose: Renders the holiday configuration modal allowing operators to mark specific dates as off-duty holidays.

import React from 'react';
import { useAppStore, storage } from '../../store/appStore';
import { getTodayString } from '../../utils/helpers';

export default function HolidayModal() {
  const {
    showHolidayModal,
    setShowHolidayModal,
    holidayDate,
    setHolidayDate,
    holidayReason,
    setHolidayReason,
    setIsTodayHoliday,
    syncWithServer
  } = useAppStore();

  if (!showHolidayModal) return null;

  const handleConfirm = () => {
    if (holidayDate) {
      storage.setItem(`holiday:${holidayDate}`, JSON.stringify({
        reason: holidayReason || 'Holiday',
        markedAt: new Date().toISOString()
      }));
      if (holidayDate === getTodayString()) {
        setIsTodayHoliday(true);
      }
      setShowHolidayModal(false);
      syncWithServer();
    }
  };

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
        maxWidth: '400px',
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
          &gt; MARK DAY AS HOLIDAY
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>DATE</label>
            <input
              type="date"
              className="dark-date-picker"
              value={holidayDate}
              onChange={(e) => setHolidayDate(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>REASON (OPTIONAL)</label>
            <input
              type="text"
              placeholder="e.g. WiFi down, travel, rest day"
              className="dark-date-picker"
              value={holidayReason}
              onChange={(e) => setHolidayReason(e.target.value)}
              style={{ width: '100%', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={() => setShowHolidayModal(false)}
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
            onClick={handleConfirm}
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
          >CONFIRM</button>
        </div>
      </div>
    </div>
  );
}
