// src/components/debrief/DebriefPanel.jsx
// Purpose: Displays the detailed AI-powered After Action Report (AAR) debrief panel, including loading states and fallback gateways.

import React from 'react';
import { useAppStore } from '../../store/appStore';

export default function DebriefPanel() {
  const {
    debriefText,
    debriefLoading,
    debriefError,
    setShowDebriefModal,
    isDayClosed,
    setIsDayClosed
  } = useAppStore();

  const handleDismissDebrief = () => {
    setShowDebriefModal(false);
  };

  return (
    <div style={{ fontFamily: 'var(--font-mono)' }}>
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
            onClick={handleDismissDebrief}
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
  );
}
