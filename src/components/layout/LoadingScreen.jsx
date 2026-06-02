// src/components/layout/LoadingScreen.jsx
// Purpose: Standalone secure initialization boot loader screen displaying dynamic startup console telemetry.

import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="login-overlay">
      <div className="login-box" style={{ maxWidth: '380px', textAlign: 'center' }}>
        <div className="login-title" style={{ justifyContent: 'center', marginBottom: '16px' }}>
          <span className="pulse-dot"></span>
          INITIALISING TAC-NET...
        </div>
        <div className="login-logs">
          <span className="login-log-line">Establishing secure pipeline...</span>
          <span className="login-log-line">Loading remote telemetry...</span>
        </div>
      </div>
    </div>
  );
}
