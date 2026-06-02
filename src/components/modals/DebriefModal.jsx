// src/components/modals/DebriefModal.jsx
// Purpose: Renders the end-of-day Commander AI debrief modal fallback overlay upon closing shifts.

import React from 'react';
import { useAppStore, storage } from '../../store/appStore';
import { getTodayString, getYesterdayString } from '../../utils/helpers';

export default function DebriefModal() {
  const {
    showDebriefModal,
    setShowDebriefModal,
    debriefText,
    debriefLoading,
    debriefError,
    dailyState,
    fixedTasks,
    chains,
    chainProgress,
    setIsDayClosed,
    passcode,
    profile,
    saveProgressToServer,
    state
  } = useAppStore();

  if (!showDebriefModal) return null;

  const handleDismiss = () => {
    setShowDebriefModal(false);
  };

  const handleCloseShiftLog = () => {
    setShowDebriefModal(false);
  };

  return (
    <div className="debrief-modal-overlay" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(7, 8, 10, 0.95)',
      zIndex: 100000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div className="debrief-modal-box" style={{
        width: '100%',
        maxWidth: '600px',
        background: 'var(--bg-card)',
        border: '2px solid var(--accent-amber)',
        padding: '24px',
        boxShadow: '0 0 20px var(--accent-amber-glow)',
        fontFamily: 'var(--font-mono)',
        color: 'var(--accent-amber)',
        position: 'relative'
      }}>
        {!debriefLoading && (
          <button
            onClick={handleDismiss}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'none',
              border: 'none',
              color: 'var(--accent-amber)',
              fontFamily: 'var(--font-mono)',
              fontSize: '20px',
              fontWeight: 'bold',
              cursor: 'pointer',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000000
            }}
          >X</button>
        )}
        <div style={{
          borderBottom: '1px dashed var(--accent-amber)',
          paddingBottom: '12px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '16px', letterSpacing: '0.05em' }}>
            &gt; COMMANDER_DEBRIEF // TAC-NET
          </span>
          <span className="pulse-dot" style={{ width: '8px', height: '8px', background: 'var(--accent-amber)' }}></span>
        </div>

        {debriefLoading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', fontSize: '14px', letterSpacing: '0.1em' }}>
            <span className="loading-blink">ESTABLISHING CONNECTION TO COMMAND...</span>
          </div>
        ) : debriefError ? (
          <div style={{ padding: '20px 0', color: 'var(--accent-coral)' }}>
            [!] COMMS ERROR: UNABLE TO CONTACT COMMANDER. SILENT GATEWAY.
          </div>
        ) : (
          <div style={{
            whiteSpace: 'pre-wrap',
            fontSize: '13px',
            lineHeight: '1.6',
            maxHeight: '400px',
            overflowY: 'auto',
            paddingRight: '10px',
            color: 'var(--accent-amber)'
          }}>
            {debriefText}
          </div>
        )}

        {!debriefLoading && (
          <div style={{
            marginTop: '24px',
            display: 'flex',
            justifyContent: 'flex-end',
            borderTop: '1px dashed var(--border-color)',
            paddingTop: '16px'
          }}>
            <button
              onClick={handleCloseShiftLog}
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
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--accent-amber)';
                e.currentTarget.style.color = 'var(--bg-card)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-card)';
                e.currentTarget.style.color = 'var(--accent-amber)';
              }}
            >DISMISS COMMS</button>
          </div>
        )}
      </div>
    </div>
  );
}
