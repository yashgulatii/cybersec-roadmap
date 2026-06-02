// src/components/layout/LoginScreen.jsx
// Purpose: Standalone secure passcode entry and decryption screen for unauthorized operators. Connected directly to central store.

import React from 'react';
import { useAppStore } from '../../store/appStore';

export default function LoginScreen() {
  const { passcode, setPasscode, authLoading, authError, handleLogin } = useAppStore();

  return (
    <div className="login-overlay">
      <form className="login-box" onSubmit={handleLogin}>
        <div className="login-title-bar">
          <div className="login-title">
            <span className="pulse-dot"></span>
            SYSTEM SECURITY CONTROL
          </div>
        </div>

        <div className="login-logs">
          <span className="login-log-line">[!] WARNING: ACCESS RESTRICTED TO AUTHORIZED OPERATORS ONLY</span>
          <span className="login-log-line">[!] TARGET HOST: OPERATOR TERMINAL // DEEP GRID</span>
          <span className="login-log-line">[!] ENTER MASTER PASSCODE TO DECRYPT INTERFACE</span>
        </div>

        <div className="login-input-group">
          <label className="login-input-label">Authorization Token</label>
          <div className="login-input-wrapper">
            <span className="login-prompt-arrow">PASSCODE&gt;</span>
            <input
              type="password"
              className="login-input"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              required
              autoFocus
            />
          </div>
        </div>

        <button className="login-btn" type="submit" disabled={authLoading}>
          {authLoading ? 'Verifying...' : 'Authorize Operator'}
        </button>

        {authError && (
          <div className="login-error">
            <span>[!] ERROR: {authError}</span>
          </div>
        )}
      </form>
    </div>
  );
}
