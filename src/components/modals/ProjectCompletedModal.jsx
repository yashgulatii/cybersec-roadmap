// src/components/modals/ProjectCompletedModal.jsx
// Purpose: Renders the project completed celebration modal overlay upon concluding all milestones.

import React from 'react';
import { useAppStore } from '../../store/appStore';

export default function ProjectCompletedModal() {
  const { completedProjectModal, setCompletedProjectModal } = useAppStore();

  if (!completedProjectModal || !completedProjectModal.show) return null;

  const handleDismiss = () => {
    setCompletedProjectModal({ show: false, projectName: '', totalXp: 0 });
  };

  return (
    <div className="debrief-modal-overlay" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(7, 8, 10, 0.95)',
      zIndex: 200000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div className="debrief-modal-box" style={{
        width: '100%',
        maxWidth: '500px',
        background: 'var(--bg-card)',
        border: '2px solid var(--accent-green)',
        padding: '24px',
        boxShadow: '0 0 20px rgba(34, 197, 94, 0.25)',
        fontFamily: 'var(--font-mono)',
        color: 'var(--accent-green)',
        position: 'relative',
        textAlign: 'center'
      }}>
        <div style={{
          borderBottom: '1px dashed var(--accent-green)',
          paddingBottom: '12px',
          marginBottom: '16px',
          fontSize: '18px',
          fontWeight: 'bold',
          letterSpacing: '0.05em'
        }}>
          🏆 PROJECT COMPLETE — MISSION ACCOMPLISHED
        </div>
        <p style={{ color: 'var(--text-main)', fontSize: '14px', marginBottom: '16px', lineHeight: '1.6' }}>
          All operational phases of <strong style={{ color: 'var(--accent-green)' }}>{completedProjectModal.projectName}</strong> have been successfully concluded.
        </p>
        <div style={{ fontSize: '20px', fontWeight: 'bold', margin: '20px 0', color: 'var(--accent-green)' }}>
          TOTAL PROJECT REWARD: +{completedProjectModal.totalXp} XP
        </div>
        <button
          onClick={handleDismiss}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--accent-green)',
            color: 'var(--accent-green)',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            padding: '8px 20px',
            cursor: 'pointer',
            textTransform: 'uppercase',
            marginTop: '12px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--accent-green)';
            e.currentTarget.style.color = 'var(--bg-card)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-card)';
            e.currentTarget.style.color = 'var(--accent-green)';
          }}
        >DISMISS COMMS</button>
      </div>
    </div>
  );
}
