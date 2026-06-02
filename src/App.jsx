// src/App.jsx
// Purpose: Primary entry point and layout router, wrapping the application tree in the central AppProvider, rendering modular overlays, and sandboxing pages with error boundaries.
//
// --- COMPILATION TELEMETRY WARNINGS ---
// (!) Some chunks are larger than 500 kB after minification (Vite bundle size limit).
// Rationale: All pages and data structures (including extensive roadmapData.js) are statically imported to preserve instant client-side routing. Consider dynamic code-splitting via React.lazy() in the next phase.

import React, { useState, useMemo } from 'react';
import './index.css';
import { AppProvider, useAppStore } from './store/appStore';

// Layout and widgets
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import LoginScreen from './components/layout/LoginScreen';
import LoadingScreen from './components/layout/LoadingScreen';


// Page components wrapped in Error Boundaries
import ErrorBoundary from './components/ui/ErrorBoundary';
import Home from './pages/Home';
import Calendar from './pages/Calendar';
import Missions from './pages/Missions';
import Projects from './pages/Projects';
import Schedule from './pages/Schedule';
import SkillMap from './pages/SkillMap';
import Character from './pages/Character';
import Logs from './pages/Logs';
import Roadmap from './pages/Roadmap';
import Manage from './pages/Manage';
import Debrief from './pages/Debrief';

// Banners & Modals
import PenaltyBanner from './components/banners/PenaltyBanner';
import WeeklyReviewBanner from './components/banners/WeeklyReviewBanner';
import HolidayModal from './components/modals/HolidayModal';
import EventModal from './components/modals/EventModal';
import VerifyModal from './components/modals/VerifyModal';
import ProjectCompletedModal from './components/modals/ProjectCompletedModal';
import DebriefModal from './components/modals/DebriefModal';

function AppContent() {
  const {
    isAuthenticated,
    activePage,
    setActivePage,
    isInitialLoading,
    handleEndShift,
    isDayClosed,
    particles
  } = useAppStore();

  // Router switcher returning pages safely wrapped inside Error Boundaries
  const activePageElement = useMemo(() => {
    switch (activePage) {
      case 'home':
        return <ErrorBoundary><Home /></ErrorBoundary>;
      case 'calendar':
        return <ErrorBoundary><Calendar /></ErrorBoundary>;
      case 'missions':
        return <ErrorBoundary><Missions /></ErrorBoundary>;
      case 'projects':
        return <ErrorBoundary><Projects /></ErrorBoundary>;
      case 'schedule':
        return <ErrorBoundary><Schedule /></ErrorBoundary>;
      case 'skillmap':
        return <ErrorBoundary><SkillMap /></ErrorBoundary>;
      case 'character':
        return <ErrorBoundary><Character /></ErrorBoundary>;
      case 'logs':
        return <ErrorBoundary><Logs /></ErrorBoundary>;
      case 'roadmap':
        return <ErrorBoundary><Roadmap /></ErrorBoundary>;
      case 'manage':
        return <ErrorBoundary><Manage /></ErrorBoundary>;
      case 'debrief':
        return <ErrorBoundary><Debrief /></ErrorBoundary>;
      default:
        return <ErrorBoundary><Home /></ErrorBoundary>;
    }
  }, [activePage]);

  if (isInitialLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="layout-wrapper">

      {/* XP GAIN PARTICLE FLIGHT ELEMENT */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="particle"
          style={{
            position: 'fixed',
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            color: 'var(--accent-green)',
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            fontWeight: 'bold',
            pointerEvents: 'none',
            zIndex: 999999,
            animation: 'particle-float-up 1s ease-out forwards'
          }}
        >
          +{particle.xp} XP
        </div>
      ))}

      {/* LEFT SIDEBAR NAVIGATION */}
      <Sidebar />

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        
        {/* DESKTOP & MOBILE HEADER STATS */}
        <TopBar />

        {/* Missed Task Penalty Warning Banner */}
        <PenaltyBanner />

        {/* Weekly Report Banner */}
        <WeeklyReviewBanner />

        {/* ACTIVE PAGE DIRECTIVES */}
        <div key={activePage} className="page-fade-in">
          {activePageElement}
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="bottom-nav">
        {['home', 'calendar', 'missions', 'projects', 'schedule', 'skillmap', 'character', 'logs', 'roadmap', 'manage'].map(page => {
          const icons = {
            home: '🏠', calendar: '📅', missions: '⚔️', projects: '📁', schedule: '🗓️',
            skillmap: '🗺️', character: '👤', logs: '📊', roadmap: '📜', manage: '✎'
          };
          return (
            <button
              key={page}
              className={`bottom-nav-btn ${activePage === page ? 'active' : ''}`}
              onClick={() => setActivePage(page)}
              title={(page || '').toUpperCase()}
              style={{ touchAction: 'manipulation' }}
            >
              <span className="bottom-nav-icon">{icons[page]}</span>
            </button>
          );
        })}
        <button
          className="bottom-nav-btn end-shift-mobile-btn"
          onClick={handleEndShift}
          title="END SHIFT"
          style={{ touchAction: 'manipulation' }}
        >
          <span className="bottom-nav-icon font-mono">{isDayClosed ? 'AAR' : 'END'}</span>
        </button>
      </nav>

      {/* Global Modals Portal Wrappers */}
      <HolidayModal />
      <EventModal />
      <VerifyModal />
      <ProjectCompletedModal />
      <DebriefModal />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </AppProvider>
    </ErrorBoundary>
  );
}
