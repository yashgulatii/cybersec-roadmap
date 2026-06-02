// src/components/modals/VerifyModal.jsx
// Purpose: Renders the roadmap credibility check modal allowing operators to query command AI strategists on specific phases or custom inputs.

import React from 'react';
import { useAppStore, storage } from '../../store/appStore';

export default function VerifyModal() {
  const {
    showVerifyModal,
    setShowVerifyModal,
    verifyPhase,
    setVerifyPhase,
    verifyText,
    setVerifyText,
    verifyAiLoading,
    verifyAiResult,
    verifyAiError,
    handleVerifyRoadmap
  } = useAppStore();

  if (!showVerifyModal) return null;

  const handlePhaseChange = (e) => {
    const val = e.target.value;
    setVerifyPhase(val);
    if (val !== 'custom') {
      const rawContent = storage.getItem('roadmapState');
      let contentStr = '';
      try {
        if (rawContent) {
          const parsed = JSON.parse(rawContent);
          contentStr = parsed[val]?.content || '';
        }
      } catch { }
      setVerifyText(contentStr || '');
    } else {
      setVerifyText('');
    }
  };

  const handleCopy = () => {
    if (verifyAiResult) {
      navigator.clipboard.writeText(verifyAiResult);
      alert("Credibility report copied to clipboard!");
    }
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
        maxWidth: '700px',
        background: 'var(--bg-card)',
        border: '2px solid var(--accent-amber)',
        padding: '24px',
        boxShadow: '0 0 25px var(--accent-amber-glow)',
        fontFamily: 'var(--font-mono)',
        color: 'var(--accent-amber)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Modal Header */}
        <div style={{
          borderBottom: '1px dashed var(--accent-amber)',
          paddingBottom: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '15px', letterSpacing: '0.05em' }}>
            🧠 ROADMAP CREDIBILITY CHECKER // AI ADVISOR
          </span>
          <button
            onClick={() => setShowVerifyModal(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-amber)',
              fontFamily: 'var(--font-mono)',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >X</button>
        </div>

        {/* Dropdown for Phase Select */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SELECT SOURCE PHASE TO ANALYZE</label>
          <select
            value={verifyPhase}
            onChange={handlePhaseChange}
            className="dark-date-picker"
            style={{ width: '100%', padding: '6px' }}
          >
            <option value="foundation">Phase 1 - Foundation (Now to Month 12)</option>
            <option value="momentum">Phase 2 - Momentum (Year 1 to Year 3)</option>
            <option value="expansion">Phase 3 - Expansion (Year 3 to Year 5)</option>
            <option value="mastery">Phase 4 - Mastery and Freedom (Year 5 to Year 10)</option>
            <option value="custom">-- Custom Paste Text --</option>
          </select>
        </div>

        {/* Scrollable Text Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ROADMAP SOURCE TEXT</label>
          <textarea
            value={verifyText}
            onChange={(e) => {
              setVerifyText(e.target.value);
              setVerifyPhase('custom');
            }}
            placeholder="Paste career phases, task lists, or certification timelines here for AI review..."
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              padding: '12px',
              height: '140px',
              resize: 'vertical',
              width: '100%'
            }}
          />
        </div>

        {/* Trigger Button */}
        <button
          onClick={handleVerifyRoadmap}
          disabled={verifyAiLoading}
          className="end-shift-btn"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--accent-amber)',
            color: 'var(--accent-amber)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            fontWeight: 'bold',
            padding: '10px 16px',
            cursor: 'pointer',
            textTransform: 'uppercase',
            alignSelf: 'flex-start'
          }}
        >
          {verifyAiLoading ? 'ANALYZING TIMELINES...' : '[ RUN CREDIBILITY CHECK ]'}
        </button>

        {/* Error Notification */}
        {verifyAiError && (
          <div style={{
            background: 'rgba(255, 111, 97, 0.05)',
            border: '1px solid var(--accent-coral)',
            padding: '12px',
            color: 'var(--accent-coral)',
            fontSize: '12px'
          }}>
            [!] ERROR: {verifyAiError}
          </div>
        )}

        {/* Result Terminal Panel */}
        {verifyAiResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minHeight: 0 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(245, 166, 35, 0.02)',
              borderLeft: '3px solid var(--accent-amber)',
              padding: '8px 12px'
            }}>
              <span style={{ fontWeight: 'bold', fontSize: '12px' }}>🧠 CREDIBILITY REPORT</span>
              <button
                onClick={handleCopy}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-amber)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >COPY REVIEW</button>
            </div>
            <div style={{
              background: 'rgba(245, 166, 35, 0.01)',
              border: '1px solid var(--border-color)',
              padding: '16px',
              fontSize: '12px',
              lineHeight: '1.6',
              color: 'var(--text-main)',
              whiteSpace: 'pre-wrap',
              maxHeight: '220px',
              overflowY: 'auto'
            }}>
              {verifyAiResult}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
