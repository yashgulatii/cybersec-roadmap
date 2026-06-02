// src/components/roadmap/CredibilityPanel.jsx
// Purpose: Displays the AI-powered credibility checker panel on the Roadmap page, enabling operators to analyze roadmap milestones against modern cybersecurity market standards using the Cloudflare Worker URL.

import React, { useState } from 'react';
import { useGroq } from '../../hooks/useGroq';

export default function CredibilityPanel({ topicId, topicContent }) {
  const { callGroq, response, isLoading, error } = useGroq();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleCheckCredibility = async () => {
    const systemPrompt = "You are a senior cybersecurity career strategist specializing in the Indian market in 2026. You are reviewing a section of a 10-year personal cybersecurity career roadmap belonging to a final-year electronics student in Delhi targeting SOC Analyst and AppSec Engineer roles. They have: TryHackMe top 2%, Google Cybersecurity Certificate, CNSP, an ethical hacking internship, a real IDOR finding (CVSS 8.9) from a production app, and an AD Attack and Detection Lab in progress. Review the roadmap section provided and respond in exactly four labeled sections: ACCURATE (what holds up in 2026), NEEDS UPDATE (anything that may be outdated or unrealistic), MISSING (skills, tools, or steps not mentioned), IMPROVEMENT (one specific actionable change to make this section stronger). Be direct, specific, and honest.";
    try {
      await callGroq(systemPrompt, topicContent || 'No roadmap section text provided.');
      setIsExpanded(true);
    } catch (err) {
      console.error('Failed to analyze credibility:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
        <button
          onClick={handleCheckCredibility}
          disabled={isLoading}
          className="end-shift-btn"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--accent-amber)',
            color: 'var(--accent-amber)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 'bold',
            padding: '4px 12px',
            cursor: 'pointer',
            textTransform: 'uppercase'
          }}
        >
          {isLoading ? 'Checking...' : '[ CHECK CREDIBILITY WITH AI ]'}
        </button>
      </div>

      {error && (
        <div style={{
          background: 'rgba(255, 111, 97, 0.05)',
          border: '1px solid var(--accent-coral)',
          padding: '12px',
          color: 'var(--accent-coral)',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px'
        }}>
          {typeof error === 'string' ? error : (error.message || error.toString() || 'Connection Anomaly')}
        </div>
      )}

      {response && (
        <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '20px', marginTop: '10px' }}>
          <div
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              background: 'rgba(245, 166, 35, 0.02)',
              borderLeft: '3px solid var(--accent-amber)',
              padding: '10px 14px',
              userSelect: 'none'
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 'bold', color: 'var(--accent-amber)' }}>
              🧠 {isExpanded ? '▼' : '►'} GROQ AI REVIEW // SYSTEM COMPLIANCE
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
              MODEL: LLAMA-3.3-70B-VERSATILE
            </span>
          </div>
          
          {isExpanded && (
            <div style={{
              background: 'rgba(245, 166, 35, 0.01)',
              border: '1px solid var(--border-color)',
              borderTop: 'none',
              padding: '16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              lineHeight: '1.6',
              color: 'var(--text-main)',
              whiteSpace: 'pre-wrap',
              overflowX: 'auto'
            }}>
              {response}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
