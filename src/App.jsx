import { useState, useEffect, useMemo } from 'react';
import './index.css';

// Daily missions definitions
const DAILY_MISSIONS = [
  { id: 'daily_ports', title: 'Memorise top 25 ports (Groups 1–2)', category: 'ROADMAP', xp: 50, stat: 'SIGINT', bonus: 5 },
  { id: 'daily_osi', title: 'OSI model: all 7 layers cold recall', category: 'ROADMAP', xp: 50, stat: 'SIGINT', bonus: 5 },
  { id: 'daily_ad_theory', title: 'Study Active Directory concepts (Kerberos, LDAP, AD structure)', category: 'ROADMAP', xp: 55, stat: 'SIGINT', bonus: 5 },
  { id: 'daily_apply', title: 'Apply to 5 roles (Naukri/LinkedIn)', category: 'OPS', xp: 75, stat: 'OPS', bonus: 8 },
  { id: 'daily_build', title: 'Work on AD Lab (2h deep session)', category: 'BUILD', xp: 70, stat: 'ARSENAL', bonus: 7 },
  { id: 'daily_interview', title: 'Record yourself answering 1 interview Q', category: 'COMMS', xp: 40, stat: 'COMMS', bonus: 4 },
  { id: 'daily_labs', title: '1 TryHackMe room or PortSwigger lab', category: 'LABS', xp: 50, stat: 'SIGINT', bonus: 5 }
];

// Project Board definitions
const PROJECTS = [
  {
    name: 'THREAT INTEL CORRELATION ENGINE',
    status: 'QUEUED',
    focus: 'Design phase — architecture planning',
    xp: 65,
    active: false
  },
  {
    name: 'CLOUD MISCONFIGURATION SCANNER (AWS/GCP)',
    status: 'QUEUED',
    focus: 'Research AWS IAM misconfig patterns',
    xp: 65,
    active: false
  },
  {
    name: 'AD ATTACK & DETECTION LAB',
    status: 'ACTIVE',
    focus: 'Active Directory fundamentals — learning phase',
    xp: 70,
    active: true
  }
];

// Side missions definitions
const SIDE_MISSIONS = [
  { id: 'side_morning', title: 'Morning ritual complete (no screen, Surya)', category: 'DISCIPLINE', xp: 25, stat: 'DISCIPLINE', bonus: 3 },
  { id: 'side_exercise', title: 'Post-nap exercise done', category: 'PHYSICAL', xp: 30, stat: 'ENDURANCE', bonus: 4 },
  { id: 'side_patrol', title: 'Evening patrol with friend (full hour)', category: 'SOCIAL', xp: 25, stat: 'DISCIPLINE', bonus: 3 },
  { id: 'side_aar', title: 'After action report written', category: 'DISCIPLINE', xp: 20, stat: 'DISCIPLINE', bonus: 3 },
  { id: 'side_read', title: 'Read 10 pages non-tech book', category: 'INTEL', xp: 20, stat: 'DISCIPLINE', bonus: 2 },
  { id: 'side_ctf', title: 'CTF challenge (for fun)', category: 'GAMING', xp: 35, stat: 'SIGINT', bonus: 4 },
  { id: 'side_reflect', title: 'Reflect on week in writing', category: 'GROWTH', xp: 25, stat: 'DISCIPLINE', bonus: 3 },
  { id: 'side_reachout', title: "Reach out to someone you haven't spoken to", category: 'SOCIAL', xp: 20, stat: 'DISCIPLINE', bonus: 2 }
];

// Schedule blocks definitions (times map to minutes of day for highlighting)
const SCHEDULE_BLOCKS = [
  { time: '05:30', name: 'WAKE + RITUAL', category: 'recovery', desc: 'Bath · Surya · no screen', startMin: 330, endMin: 390 },
  { time: '06:30', name: 'MORNING BRIEF', category: 'prep', desc: 'Review missions · 15 min', startMin: 390, endMin: 405 },
  { time: '06:45', name: 'DEEP OPS', category: 'primary', desc: 'Roadmap theory · TryHackMe · 2h45m', startMin: 405, endMin: 570 },
  { time: '09:30', name: 'FIELD BREAK', category: 'rest', desc: 'Tea · stretch · away from screen', startMin: 570, endMin: 600 },
  { time: '10:00', name: 'PROJECT BUILD', category: 'primary', desc: 'AD Lab · Threat Intel Engine · Cloud Scanner · 2h30m', startMin: 600, endMin: 750 },
  { time: '12:30', name: 'CHOW', category: 'recovery', desc: 'Lunch', startMin: 750, endMin: 780 },
  { time: '13:00', name: 'REST PHASE', category: 'recovery', desc: 'Power nap · 30 min', startMin: 780, endMin: 810 },
  { time: '13:30', name: 'PHYSICAL TRAINING', category: 'sideop', desc: 'Exercise · 40 min', startMin: 810, endMin: 855 },
  { time: '14:15', name: 'APPLICATION OPS', category: 'primary', desc: 'Job apps · cold emails · 1h45m', startMin: 855, endMin: 960 },
  { time: '16:00', name: 'SECONDARY OPS', category: 'secondary', desc: 'PortSwigger · Splunk · bug bounty · 2h', startMin: 960, endMin: 1080 },
  { time: '18:00', name: 'PATROL', category: 'sideop', desc: 'Walk with friend · 1–2 hours', startMin: 1080, endMin: 1200 },
  { time: '20:00', name: 'INTEL REVIEW', category: 'light', desc: 'Read · tech content · 1 hour', startMin: 1200, endMin: 1260 },
  { time: '21:00', name: 'AFTER ACTION', category: 'prep', desc: 'Journal · plan tomorrow · 30 min', startMin: 1260, endMin: 1290 },
  { time: '21:30', name: 'COMMS BLACKOUT', category: 'recovery', desc: 'No screens until sleep', startMin: 1290, endMin: 1350 },
  { time: '22:30', name: 'STAND DOWN', category: 'recovery', desc: 'Sleep', startMin: 1350, endMin: 1770 } // overnight
];

// Helpers for Date calculations
const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getYesterdayString = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function App() {
  const [activeTab, setActiveTab] = useState('missions');
  
  // Auth states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);

  // Profile state
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('operator_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return { level: 1, totalXp: 0, streak: 0, lastActiveDate: '' };
  });

  // Completed missions for today
  const [completedMissions, setCompletedMissions] = useState(() => {
    const today = getTodayString();
    const saved = localStorage.getItem(`operator_completed_${today}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {};
  });

  // Schedule timer index
  const [activeBlockIndex, setActiveBlockIndex] = useState(-1);

  // Particle effect state
  const [particles, setParticles] = useState([]);

  // Helpers to push state to server KV
  const saveProgressToServer = (password, missions, prof) => {
    setSyncLoading(true);
    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: password,
        progress: {
          completedMissions: missions,
          profile: prof
        }
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        console.log("Progress synchronized to Cloudflare KV successfully.");
      } else {
        console.error("Cloudflare KV sync failed", data.error);
      }
    })
    .catch(err => console.error("Error syncing progress", err))
    .finally(() => {
      setSyncLoading(false);
    });
  };

  // Helper to pull state from server KV
  const fetchRemoteProgress = (password) => {
    fetch('/api/progress')
      .then(res => res.json())
      .then(data => {
        if (data.progress) {
          const remoteData = data.progress;
          const today = getTodayString();
          const yesterday = getYesterdayString();
          
          let resolvedMissions = {};
          let resolvedProfile = { level: 1, totalXp: 0, streak: 0, lastActiveDate: '' };
          
          if (remoteData.profile) {
            resolvedProfile = { ...remoteData.profile };
            const lastActive = resolvedProfile.lastActiveDate;
            if (lastActive) {
              if (lastActive === today || lastActive === yesterday) {
                // Streak is maintained
              } else {
                // Streak broken (missed at least one full day)
                resolvedProfile.streak = 0;
              }
            } else {
              resolvedProfile.streak = 0;
            }
          }
          
          // Only load remote completed missions if they were completed today
          if (remoteData.profile && remoteData.profile.lastActiveDate === today) {
            if (remoteData.completedMissions) {
              resolvedMissions = remoteData.completedMissions;
            }
          } else {
            // Otherwise, start fresh for the new day
            resolvedMissions = {};
          }
          
          setCompletedMissions(resolvedMissions);
          localStorage.setItem(`operator_completed_${today}`, JSON.stringify(resolvedMissions));
          
          setProfile(resolvedProfile);
          localStorage.setItem('operator_profile', JSON.stringify(resolvedProfile));
        } else {
          // Push initial profile to Cloudflare KV if none exists yet
          saveProgressToServer(password, completedMissions, profile);
        }
      })
      .catch(err => console.error("Could not fetch remote progress", err))
      .finally(() => {
        setIsInitialLoading(false);
      });
  };

  // Validation on Mount
  useEffect(() => {
    const savedPasscode = localStorage.getItem('operator_passcode');
    if (savedPasscode) {
      fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: savedPasscode })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPasscode(savedPasscode);
          setIsAuthenticated(true);
          fetchRemoteProgress(savedPasscode);
        } else {
          localStorage.removeItem('operator_passcode');
          setIsInitialLoading(false);
        }
      })
      .catch(err => {
        console.error("Mount auth verification failed", err);
        setIsInitialLoading(false);
      });
    } else {
      setIsInitialLoading(false);
    }
  }, []);

  // Login submission
  const handleLogin = (e) => {
    e.preventDefault();
    if (!passcode) return;
    setAuthLoading(true);
    setAuthError('');

    fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: passcode })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        localStorage.setItem('operator_passcode', passcode);
        setIsAuthenticated(true);
        fetchRemoteProgress(passcode);
      } else {
        setAuthError('INVALID ACCESS TOKEN // ACCESS DENIED');
      }
    })
    .catch(err => {
      console.error(err);
      setAuthError('CONNECTION ERROR // GATEWAY OFFLINE');
    })
    .finally(() => {
      setAuthLoading(false);
    });
  };

  // Setup schedule highlighter
  useEffect(() => {
    const updateActiveBlock = () => {
      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();
      
      let calculatedMins = currentMins;
      if (currentMins < 330) {
        calculatedMins = currentMins + 1440;
      }

      let activeIndex = -1;
      for (let i = 0; i < SCHEDULE_BLOCKS.length; i++) {
        const block = SCHEDULE_BLOCKS[i];
        if (calculatedMins >= block.startMin && calculatedMins < block.endMin) {
          activeIndex = i;
          break;
        }
      }
      setActiveBlockIndex(activeIndex);
    };

    updateActiveBlock();
    const interval = setInterval(updateActiveBlock, 10000);
    return () => clearInterval(interval);
  }, []);

  // Sync profile and handle streak maintain/reset on load
  useEffect(() => {
    const today = getTodayString();
    const yesterday = getYesterdayString();
    
    setProfile(prev => {
      let updatedProfile = { ...prev };
      const lastActive = prev.lastActiveDate;

      if (lastActive) {
        if (lastActive === today || lastActive === yesterday) {
          // Maintain current streak
        } else {
          updatedProfile.streak = 0;
        }
      } else {
        updatedProfile.streak = 0;
      }

      localStorage.setItem('operator_profile', JSON.stringify(updatedProfile));
      return updatedProfile;
    });
  }, []);

  // Compute RPG stats dynamically
  const computedStats = useMemo(() => {
    let sigintBonus = 0;
    let opsBonus = 0;
    let arsenalBonus = 0;
    let commsBonus = 0;
    let disciplineBonus = 0;
    let enduranceBonus = 0;

    DAILY_MISSIONS.forEach(m => {
      if (completedMissions[m.id]) {
        if (m.stat === 'SIGINT') sigintBonus += m.bonus;
        if (m.stat === 'OPS') opsBonus += m.bonus;
        if (m.stat === 'ARSENAL') arsenalBonus += m.bonus;
        if (m.stat === 'COMMS') commsBonus += m.bonus;
      }
    });

    SIDE_MISSIONS.forEach(m => {
      if (completedMissions[m.id]) {
        if (m.stat === 'SIGINT') sigintBonus += m.bonus;
        if (m.stat === 'DISCIPLINE') disciplineBonus += m.bonus;
        if (m.stat === 'ENDURANCE') enduranceBonus += m.bonus;
      }
    });

    return {
      sigint: Math.min(100, 62 + sigintBonus),
      ops: Math.min(100, 45 + opsBonus),
      arsenal: Math.min(100, 70 + arsenalBonus),
      comms: Math.min(100, 40 + commsBonus),
      discipline: Math.min(100, 55 + disciplineBonus),
      endurance: Math.min(100, 60 + enduranceBonus),
      sigintBonus,
      opsBonus,
      arsenalBonus,
      commsBonus,
      disciplineBonus,
      enduranceBonus
    };
  }, [completedMissions]);

  // Compute level from XP
  const levelProgress = useMemo(() => {
    const totalXp = profile.totalXp;
    const currentLevel = Math.floor(totalXp / 200) + 1;
    const currentLevelXp = totalXp % 200;
    return {
      level: currentLevel,
      xpInLevel: currentLevelXp,
      pct: (currentLevelXp / 200) * 100
    };
  }, [profile.totalXp]);

  // Toggle mission completion
  const handleToggleMission = (missionId, xpReward, e) => {
    const today = getTodayString();
    const yesterday = getYesterdayString();
    
    // Add particle logic
    if (!completedMissions[missionId]) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top;
      
      const newParticle = {
        id: Date.now() + Math.random(),
        xp: xpReward,
        x: x,
        y: y
      };
      setParticles(prev => [...prev, newParticle]);
      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== newParticle.id));
      }, 1000);
    }

    const updatedMissions = {
      ...completedMissions,
      [missionId]: !completedMissions[missionId]
    };

    // Filter out uncompleted fields to save space
    if (!updatedMissions[missionId]) {
      delete updatedMissions[missionId];
    }

    setCompletedMissions(updatedMissions);
    localStorage.setItem(`operator_completed_${today}`, JSON.stringify(updatedMissions));

    // Update profile total XP and streak
    setProfile(prev => {
      const activeStateAfter = Object.keys(updatedMissions).length;
      let newTotalXp = prev.totalXp + (updatedMissions[missionId] ? xpReward : -xpReward);
      if (newTotalXp < 0) newTotalXp = 0;

      let newStreak = prev.streak;
      let newLastActive = prev.lastActiveDate;

      if (activeStateAfter > 0 && (!prev.lastActiveDate || prev.lastActiveDate !== today)) {
        // Just completed first mission today
        if (prev.lastActiveDate === yesterday) {
          newStreak = prev.streak + 1;
        } else {
          newStreak = 1;
        }
        newLastActive = today;
      } else if (activeStateAfter === 0 && prev.lastActiveDate === today) {
        // Unchecked the last completed mission today
        // Revert last active to yesterday (or empty if they had no history)
        newLastActive = prev.streak > 1 ? yesterday : '';
        newStreak = Math.max(0, prev.streak - 1);
      }

      const updatedLevel = Math.floor(newTotalXp / 200) + 1;

      const newProfile = {
        level: updatedLevel,
        totalXp: newTotalXp,
        streak: newStreak,
        lastActiveDate: newLastActive
      };

      localStorage.setItem('operator_profile', JSON.stringify(newProfile));
      
      // Sync with serverless KV store
      const activePasscode = passcode || localStorage.getItem('operator_passcode');
      if (activePasscode) {
        saveProgressToServer(activePasscode, updatedMissions, newProfile);
      }

      return newProfile;
    });
  };

  if (isInitialLoading) {
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

  if (!isAuthenticated) {
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

  return (
    <div className="app-container">
      {/* XP Floating Particle Container */}
      <div className="xp-particle-layer">
        {particles.map(p => (
          <div key={p.id} className="xp-particle" style={{ left: p.x, top: p.y }}>
            +{p.xp} XP
          </div>
        ))}
      </div>

      {/* GLOBAL HEADER */}
      <header className="global-header">
        <div className="header-top-row">
          <div className="operator-tag">
            <span className="pulse-dot"></span>
            OPERATOR: YASH
            <span style={{ fontSize: '11px', color: syncLoading ? '#f5a623' : '#22c55e', marginLeft: '10px', fontWeight: 'normal', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              {syncLoading ? '[SYNCING...]' : '[ONLINE]'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span className="streak-counter">
              🔥 STREAK: {profile.streak} {profile.streak === 1 ? 'DAY' : 'DAYS'}
            </span>
            <span className="level-badge">
              LVL {levelProgress.level}
            </span>
          </div>
        </div>
        <div className="xp-progress-container">
          <div className="xp-bar-outer">
            <div className="xp-bar-inner" style={{ width: `${levelProgress.pct}%` }}></div>
          </div>
          <div className="xp-numbers">
            {levelProgress.xpInLevel} / 200 XP
          </div>
        </div>
      </header>

      {/* NAVIGATION TABS */}
      <nav className="nav-tabs">
        <button 
          className={`tab-btn ${activeTab === 'missions' ? 'active' : ''}`}
          onClick={() => setActiveTab('missions')}
        >
          Missions
        </button>
        <button 
          className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          Schedule
        </button>
        <button 
          className={`tab-btn ${activeTab === 'character' ? 'active' : ''}`}
          onClick={() => setActiveTab('character')}
        >
          Character
        </button>
      </nav>

      {/* TAB CONTENT PANEL */}
      <main className="tab-content-panel">
        {activeTab === 'missions' && (
          <div className="missions-layout">
            
            {/* MAIN OBJECTIVE */}
            <section className="main-objective-section">
              <h2 className="panel-title">Main Objective</h2>
              <hr className="section-divider" />
              <div className="main-objective-card">
                <div className="obj-header">
                  <div className="obj-title-group">
                    <h3>Land First Cybersecurity Role</h3>
                  </div>
                  <span className="status-badge">ACTIVE</span>
                </div>

                <div className="obj-progress-group">
                  <div className="obj-progress-header">
                    <span>STAGE PROGRESS</span>
                    <span>35%</span>
                  </div>
                  <div className="obj-progress-bar-outer">
                    <div className="obj-progress-bar-inner" style={{ width: '35%' }}></div>
                  </div>
                </div>

                <div className="milestones-grid">
                  <div className="milestone-item">
                    <span className="milestone-week">WEEK 1–4</span>
                    <span className="milestone-title">Foundation Complete</span>
                  </div>
                  <div className="milestone-item">
                    <span className="milestone-week">WEEK 5–6</span>
                    <span className="milestone-title">SIEM Mastery</span>
                  </div>
                  <div className="milestone-item">
                    <span className="milestone-week">WEEK 7</span>
                    <span className="milestone-title">Homelab Live</span>
                  </div>
                  <div className="milestone-item">
                    <span className="milestone-week">WEEK 8</span>
                    <span className="milestone-title">35+ Applications Sent</span>
                  </div>
                </div>
              </div>
            </section>

            {/* PROJECT BOARD */}
            <section className="project-board-section">
              <h2 className="panel-title">Project Board</h2>
              <hr className="section-divider" />
              <div className="projects-grid">
                {PROJECTS.map((proj, idx) => (
                  <div 
                    key={idx} 
                    className={`project-card ${proj.active ? 'active-project' : 'queued'}`}
                  >
                    <div className="project-status-row">
                      <span className="project-name">{proj.name}</span>
                      <span className={proj.active ? 'project-badge-active' : 'project-badge-queued'}>
                        {proj.status}
                      </span>
                    </div>
                    <span className="project-focus">Focus: {proj.focus}</span>
                    <span className="project-xp-reward">Daily session XP: +{proj.xp}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* DAILY OPS */}
            <section className="daily-ops-section">
              <h2 className="panel-title">Daily Ops</h2>
              <hr className="section-divider" />
              <div className="missions-grid">
                {DAILY_MISSIONS.map(m => {
                  const isCompleted = !!completedMissions[m.id];
                  return (
                    <div 
                      key={m.id} 
                      className={`mission-card ${isCompleted ? 'completed' : ''}`}
                      onClick={(e) => handleToggleMission(m.id, m.xp, e)}
                    >
                      <div className="checkbox-container">
                        <span className="checkmark-icon"></span>
                      </div>
                      <div className="mission-details">
                        <span className="mission-title">{m.title}</span>
                        <div className="mission-meta">
                          <span className={`badge badge-${m.category.toLowerCase()}`}>{m.category}</span>
                          <span className="xp-reward">+{m.xp} XP</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SIDE OPS */}
            <section className="side-ops-section">
              <h2 className="panel-title">Side Ops</h2>
              <hr className="section-divider" />
              <div className="missions-grid">
                {SIDE_MISSIONS.map(m => {
                  const isCompleted = !!completedMissions[m.id];
                  return (
                    <div 
                      key={m.id} 
                      className={`mission-card ${isCompleted ? 'completed' : ''}`}
                      onClick={(e) => handleToggleMission(m.id, m.xp, e)}
                    >
                      <div className="checkbox-container">
                        <span className="checkmark-icon"></span>
                      </div>
                      <div className="mission-details">
                        <span className="mission-title">{m.title}</span>
                        <div className="mission-meta">
                          <span className={`badge badge-${m.category.toLowerCase()}`}>{m.category}</span>
                          <span className="xp-reward">+{m.xp} XP</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="schedule-container">
            {SCHEDULE_BLOCKS.map((block, idx) => {
              const isActive = activeBlockIndex === idx;
              return (
                <div 
                  key={idx} 
                  className={`timeline-block border-${block.category} ${isActive ? 'active-block' : ''}`}
                >
                  <div className="timeline-time">{block.time}</div>
                  <div className="timeline-details">
                    <div className="timeline-header-group">
                      <span className="timeline-name">{block.name}</span>
                      <span className="timeline-desc">{block.desc}</span>
                    </div>
                    <span className="timeline-type-tag">{block.category}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'character' && (
          <div className="character-layout">
            <section className="character-sheet-section">
              <h2 className="panel-title">Character Sheet</h2>
              <hr className="section-divider" />
              
              <div className="stats-card">
                <div className="stats-grid">
                  
                  {/* SIGINT */}
                  <div className="stat-item">
                    <div className="stat-header">
                      <div className="stat-label-group">
                        <span className="stat-icon">📡</span>
                        <span className="stat-name">SIGINT</span>
                        <span className="stat-desc">— Technical knowledge</span>
                      </div>
                      <span className="stat-value">{computedStats.sigint}%</span>
                    </div>
                    <div className="stat-bar-outer">
                      <div className="stat-bar-inner" style={{ width: `${computedStats.sigint}%` }}></div>
                    </div>
                  </div>

                  {/* OPS */}
                  <div className="stat-item">
                    <div className="stat-header">
                      <div className="stat-label-group">
                        <span className="stat-icon">⚡</span>
                        <span className="stat-name">OPS</span>
                        <span className="stat-desc">— Execution speed</span>
                      </div>
                      <span className="stat-value">{computedStats.ops}%</span>
                    </div>
                    <div className="stat-bar-outer">
                      <div className="stat-bar-inner" style={{ width: `${computedStats.ops}%` }}></div>
                    </div>
                  </div>

                  {/* ARSENAL */}
                  <div className="stat-item">
                    <div className="stat-header">
                      <div className="stat-label-group">
                        <span className="stat-icon">⚔️</span>
                        <span className="stat-name">ARSENAL</span>
                        <span className="stat-desc">— 3 active projects · AD Lab · TI Engine · Cloud Scanner</span>
                      </div>
                      <span className="stat-value">{computedStats.arsenal}%</span>
                    </div>
                    <div className="stat-bar-outer">
                      <div className="stat-bar-inner" style={{ width: `${computedStats.arsenal}%` }}></div>
                    </div>
                  </div>

                  {/* COMMS */}
                  <div className="stat-item">
                    <div className="stat-header">
                      <div className="stat-label-group">
                        <span className="stat-icon">💬</span>
                        <span className="stat-name">COMMS</span>
                        <span className="stat-desc">— Interview readiness</span>
                      </div>
                      <span className="stat-value">{computedStats.comms}%</span>
                    </div>
                    <div className="stat-bar-outer">
                      <div className="stat-bar-inner" style={{ width: `${computedStats.comms}%` }}></div>
                    </div>
                  </div>

                  {/* DISCIPLINE */}
                  <div className="stat-item">
                    <div className="stat-header">
                      <div className="stat-label-group">
                        <span className="stat-icon">🛡️</span>
                        <span className="stat-name">DISCIPLINE</span>
                        <span className="stat-desc">— Schedule adherence</span>
                      </div>
                      <span className="stat-value">{computedStats.discipline}%</span>
                    </div>
                    <div className="stat-bar-outer">
                      <div className="stat-bar-inner" style={{ width: `${computedStats.discipline}%` }}></div>
                    </div>
                  </div>

                  {/* ENDURANCE */}
                  <div className="stat-item">
                    <div className="stat-header">
                      <div className="stat-label-group">
                        <span className="stat-icon">🔋</span>
                        <span className="stat-name">ENDURANCE</span>
                        <span className="stat-desc">— Physical/mental</span>
                      </div>
                      <span className="stat-value">{computedStats.endurance}%</span>
                    </div>
                    <div className="stat-bar-outer">
                      <div className="stat-bar-inner" style={{ width: `${computedStats.endurance}%` }}></div>
                    </div>
                  </div>

                </div>
              </div>

              {/* OPERATOR STAT SUMMARY */}
              <div className="profile-card">
                <div className="profile-details">
                  <span className="profile-name">NAME: YASH</span>
                  <span className="profile-xp">LIFETIME XP: {profile.totalXp} | CURRENT LEVEL: {profile.level}</span>
                </div>
                <div className="profile-streak-badge">
                  <span>🔥 {profile.streak} DAY STREAK</span>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
