// src/components/ui/ErrorBoundary.jsx
// Purpose: Reusable Class Component that intercepts unhandled render exceptions, preventing page-level crashes from taking down the shell.

import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary intercepted unhandled render exception:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          background: 'rgba(255, 111, 97, 0.04)',
          border: '1px dashed var(--accent-coral)',
          padding: '24px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--accent-coral)',
          margin: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: '0 0 10px rgba(255, 111, 97, 0.05)'
        }}>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>[!] SECURITY INTERFACING ANOMALY IN ACTIVE PANEL</h3>
          <p style={{ margin: 0, fontSize: '11px', lineHeight: '1.6', opacity: 0.9 }}>
            The current panel crashed due to an unhandled system anomaly. Details logged to terminal.
          </p>
          <pre style={{
            margin: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '12px',
            fontSize: '10px',
            overflowX: 'auto',
            border: '1px solid rgba(255, 111, 97, 0.15)',
            lineHeight: '1.4'
          }}>
            {this.state.error ? this.state.error.toString() : 'Unknown system error'}
          </pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="dark-date-picker"
            style={{
              alignSelf: 'flex-start',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              padding: '6px 12px',
              background: 'var(--bg-card)',
              border: '1px solid var(--accent-coral)',
              color: 'var(--accent-coral)',
              cursor: 'pointer',
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}
          >REBOOT COMPONENT PANEL</button>
        </div>
      );
    }

    return this.props.children;
  }
}
