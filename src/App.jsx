import { useState, useEffect, useMemo, useRef } from 'react';
import { PHASES, PHASE_META, ROADMAP_DATA, SKILLS } from './data';
import './index.css';

export default function App() {
  const [completed, setCompleted] = useState(new Set());
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('roadmap_progress');
    if (saved) {
      setCompleted(new Set(JSON.parse(saved)));
    }
    
    // Fetch latest progress from the server
    fetch('/api/progress')
      .then(res => res.json())
      .then(data => {
        if (data.progress) {
          setCompleted(new Set(data.progress));
          localStorage.setItem('roadmap_progress', JSON.stringify(data.progress));
        }
      })
      .catch(e => console.error("Could not fetch remote progress", e));

    const editKey = sessionStorage.getItem('roadmap_edit_key');
    if (editKey) {
      setIsEditMode(true);
    }
  }, []);

  const saveCompleted = (newSet) => {
    setCompleted(newSet);
    const progressArr = Array.from(newSet);
    localStorage.setItem('roadmap_progress', JSON.stringify(progressArr));

    const editKey = sessionStorage.getItem('roadmap_edit_key');
    if (editKey) {
      fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: editKey, progress: progressArr })
      }).catch(e => console.error("Could not sync progress", e));
    }
  };

  const toggleTopic = (globalIndex) => {
    if (!isEditMode) {
      setShowAuthModal(true);
      return;
    }
    const newSet = new Set(completed);
    if (newSet.has(globalIndex)) {
      newSet.delete(globalIndex);
    } else {
      newSet.add(globalIndex);
    }
    saveCompleted(newSet);
  };

  const unlockEdit = (pw) => {
    setIsEditMode(true);
    sessionStorage.setItem('roadmap_edit_key', pw);
    setShowAuthModal(false);
  };

  const lockEdit = () => {
    setIsEditMode(false);
    sessionStorage.removeItem('roadmap_edit_key');
  };

  const stats = useMemo(() => {
    let total = 0;
    let done = 0;
    const phaseStats = {};
    const skillStats = {};
    Object.keys(SKILLS).forEach(k => {
      skillStats[k] = { ...SKILLS[k], total: 0, done: 0 };
    });

    PHASES.forEach(pId => {
      let pTotal = 0;
      let pDone = 0;
      const phaseData = ROADMAP_DATA[pId];
      if (phaseData && phaseData.sections) {
        phaseData.sections.forEach(section => {
          section.tasks.forEach(task => {
            pTotal++;
            
            let isDone = false;
            if (task.subtasks && task.subtasks.length > 0) {
              isDone = task.subtasks.every(st => completed.has(st.id));
            } else {
              isDone = completed.has(task.id);
            }

            if (isDone) pDone++;

            if (task.skills && task.skills.length > 0) {
              task.skills.forEach(skillId => {
                if (skillStats[skillId]) {
                  skillStats[skillId].total++;
                  if (isDone) skillStats[skillId].done++;
                }
              });
            }
          });
        });
      }
      total += pTotal;
      done += pDone;
      phaseStats[pId] = { total: pTotal, done: pDone, pct: pTotal === 0 ? 0 : Math.round((pDone / pTotal) * 100) };
    });

    Object.keys(skillStats).forEach(k => {
      const s = skillStats[k];
      s.pct = s.total === 0 ? 0 : Math.round((s.done / s.total) * 100);
    });

    const overallPct = total === 0 ? 0 : Math.round((done / total) * 100);

    return { total, done, phaseStats, skillStats, overallPct };
  }, [completed]);

  return (
    <div className={isEditMode ? '' : 'view-mode'}>
      <div className="topbar">
        <div className="topbar-title"><span>Yash's</span> Cybersecurity Roadmap</div>
        <div className="overall-pill">Overall: <span className="pct">{stats.overallPct}%</span></div>
        <button className="topbar-btn" onClick={() => setShowDashboard(true)}>📊 <span>Dashboard</span></button>
        {isEditMode ? (
          <button className="topbar-btn unlocked" onClick={lockEdit}>🔓 <span>Lock</span></button>
        ) : (
          <button className="topbar-btn" onClick={() => setShowAuthModal(true)}>🔒 <span>Edit</span></button>
        )}
      </div>

      <div className="layout">
        <Sidebar stats={stats} />
        <main className="main">
          {!isEditMode && (
            <div className="view-banner">
              <span>🔒 <strong>View-only mode</strong> — click <strong>Edit</strong> in the top bar to make changes.</span>
              <button onClick={() => setShowAuthModal(true)}>Unlock Edit</button>
            </div>
          )}

          {PHASES.map(pId => (
            <PhaseBlock 
              key={pId} 
              pId={pId} 
              meta={PHASE_META.find(m => m.id === pId)} 
              data={ROADMAP_DATA[pId]} 
              stats={stats.phaseStats[pId]}
              completed={completed}
              toggleTopic={toggleTopic}
            />
          ))}
        </main>
      </div>

      {showDashboard && <Dashboard stats={stats} onClose={() => setShowDashboard(false)} />}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onUnlock={unlockEdit} />}
    </div>
  );
}

function Sidebar({ stats }) {
  const sections = [
    { label: 'Fire Track', phases: ['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8'] },
    { label: 'Post-Job Learning', phases: ['pa', 'pb', 'pc', 'pd', 'pe', 'pf'] }
  ];

  return (
    <nav className="sidebar">
      {sections.map(sec => (
        <div key={sec.label}>
          <div className="sidebar-section">{sec.label}</div>
          {sec.phases.map(pId => {
            const meta = PHASE_META.find(m => m.id === pId);
            return (
              <a key={pId} className="sidebar-item" href={`#${pId}`}>
                <div className="sidebar-item-inner">
                  <div className="sidebar-item-top">
                    <span className="sidebar-dot" style={{ background: meta.color }}></span>
                    <span className="sidebar-label">{meta.label}</span>
                    <span className="sidebar-pct">{stats.phaseStats[pId].pct}%</span>
                  </div>
                  <div className="sidebar-bar">
                    <div className="sidebar-bar-fill" style={{ width: `${stats.phaseStats[pId].pct}%`, background: meta.color }}></div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function PhaseBlock({ pId, meta, data, stats, completed, toggleTopic }) {
  if (!data) return null;

  return (
    <div className="phase-block" id={pId}>
      <div className="phase-header">
        <div className="phase-icon" style={{ background: `${meta.color}22` }}>{meta.icon}</div>
        <div>
          <div className="phase-title">{data.weekTitle || meta.label}</div>
          <div className="phase-sub">{data.weekGoal || meta.sub}</div>
        </div>
        <div className="phase-progress-wrap">
          <div className="phase-pct-label" style={{ color: meta.color }}>{stats.pct}%</div>
          <div className="phase-bar">
            <div className="phase-bar-fill" style={{ width: `${stats.pct}%`, background: meta.color }}></div>
          </div>
        </div>
      </div>

      {data.sections && data.sections.map((section, sIdx) => (
        <div className="section" key={sIdx}>
          <div className="section-title">{section.sectionTitle}</div>
          <div className="task-list">
            {section.tasks.map((task) => {
              const allSubtasksDone = task.subtasks && task.subtasks.length > 0 
                ? task.subtasks.every(st => completed.has(st.id))
                : completed.has(task.id);

              return (
                <div key={task.id} className="task-group" style={{ marginBottom: '24px' }}>
                  <div className="task-group-header" style={{ marginBottom: '10px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text)', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {allSubtasksDone && <span style={{ color: 'var(--green)' }}>✓</span>}
                      {task.title}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
                      {task.badge && <span className={`topic-badge ${task.badgeClass || ''}`}>{task.badge}</span>}
                      {task.skills && task.skills.map(s => {
                         const sk = SKILLS[s];
                         return sk ? <span key={s} className="topic-badge" style={{ background: `${sk.color}22`, color: sk.color }}>{sk.icon} {sk.name}</span> : null;
                      })}
                    </div>
                  </div>
                  
                  {task.link && (
                    <div style={{ marginBottom: '10px' }}>
                      <a className="topic-link" href={task.link} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>{task.linkText || task.link}</a>
                    </div>
                  )}

                  <div className="topic-grid">
                    {task.subtasks && task.subtasks.length > 0 ? (
                      task.subtasks.map(st => {
                        const isDone = completed.has(st.id);
                        return (
                          <div key={st.id} className={`topic-item ${isDone ? 'done' : ''}`} onClick={() => toggleTopic(st.id)}>
                            <div className="topic-check">
                              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <div className="topic-content">
                              <div className="topic-name">{st.text}</div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className={`topic-item ${completed.has(task.id) ? 'done' : ''}`} onClick={() => toggleTopic(task.id)}>
                        <div className="topic-check">
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div className="topic-content">
                          <div className="topic-name">{task.title}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function AuthModal({ onClose, onUnlock }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!password) { setError('Please enter a password.'); return; }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.success) {
        onUnlock(password);
      } else {
        setError('Incorrect password. Try again.');
      }
    } catch (e) {
      setError('Could not reach auth server. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay visible">
      <div className="modal-box">
        <div className="modal-icon">🔐</div>
        <div className="modal-title">Edit Mode</div>
        <div className="modal-sub">Enter the master password to edit progress.</div>
        <input 
          type="password" 
          className="modal-input" 
          placeholder="Password..." 
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          autoFocus
        />
        <div className="modal-error">{error}</div>
        <div className="modal-actions">
          <button className="btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? 'Checking...' : 'Unlock'}</button>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ stats, onClose }) {
  useEffect(() => {
    const drawCharts = () => {
      // Draw Donuts based on skillStats
      Object.keys(stats.skillStats).filter(k => stats.skillStats[k].total > 0).forEach(k => {
        const canvasId = `dash-donut-${k}`;
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width; const H = canvas.height;
        ctx.clearRect(0, 0, W, H);
        
        const cx = W / 2; const cy = H / 2;
        const r = 24; const lw = 6;
        const sStats = stats.skillStats[k];
        
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = lw;
        ctx.stroke();

        if (sStats.total > 0 && sStats.done > 0) {
          const endAngle = (sStats.done / sStats.total) * 2 * Math.PI - (Math.PI / 2);
          ctx.beginPath();
          ctx.arc(cx, cy, r, -Math.PI / 2, endAngle);
          
          ctx.strokeStyle = sStats.color;
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sStats.pct + '%', cx, cy + 1);
      });

      // Draw Bar Chart for Skills
      const bCanvas = document.getElementById('dash-skill-barchart');
      if (bCanvas) {
        const bCtx = bCanvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = bCanvas.getBoundingClientRect();
        bCanvas.width = rect.width * dpr;
        bCanvas.height = rect.height * dpr;
        bCtx.scale(dpr, dpr);
        
        const W = rect.width; const H = rect.height;
        bCtx.clearRect(0, 0, W, H);
        
        const padding = 40;
        const chartW = W - padding * 2;
        const chartH = H - padding * 2;
        
        bCtx.beginPath();
        bCtx.moveTo(padding, padding);
        bCtx.lineTo(padding, padding + chartH);
        bCtx.lineTo(padding + chartW, padding + chartH);
        bCtx.strokeStyle = 'rgba(255,255,255,0.1)';
        bCtx.lineWidth = 1;
        bCtx.stroke();

        const skillKeys = Object.keys(stats.skillStats).filter(k => stats.skillStats[k].total > 0);
        const numBars = skillKeys.length;
        if (numBars > 0) {
          const barSpacing = chartW / numBars;
          const barWidth = Math.min(40, barSpacing * 0.6);

          skillKeys.forEach((k, i) => {
            const sStats = stats.skillStats[k];
            
            const x = padding + i * barSpacing + (barSpacing - barWidth) / 2;
            const h = (sStats.pct / 100) * chartH;
            const y = padding + chartH - h;

            bCtx.fillStyle = sStats.color;
            bCtx.fillRect(x, y, barWidth, h);

            bCtx.fillStyle = 'rgba(255,255,255,0.05)';
            bCtx.fillRect(x, padding, barWidth, chartH - h);

            bCtx.fillStyle = '#888';
            bCtx.font = '14px sans-serif';
            bCtx.textAlign = 'center';
            bCtx.fillText(sStats.icon, x + barWidth / 2, padding + chartH + 16);
          });
        }
      }
    };
    
    requestAnimationFrame(drawCharts);
    window.addEventListener('resize', drawCharts);
    return () => window.removeEventListener('resize', drawCharts);
  }, [stats]);

  return (
    <div className="dash-overlay visible">
      <div className="dash-topbar">
        <div className="dash-topbar-title">Skills Dashboard</div>
        <button className="btn-ghost" onClick={onClose}>✕ Close</button>
      </div>

      <div className="dash-body">
        <div className="dash-section-title">Overview</div>
        <div className="dash-stats-grid">
          <div className="stat-card">
            <div className="stat-card-label">Total Tasks</div>
            <div className="stat-card-value blue">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Completed</div>
            <div className="stat-card-value green">{stats.done}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Remaining</div>
            <div className="stat-card-value amber">{stats.total - stats.done}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Overall %</div>
            <div className="stat-card-value">{stats.overallPct}%</div>
          </div>
        </div>

        <div className="overall-progress-card">
          <div className="overall-progress-header">
            <div className="overall-progress-label">Overall Completion</div>
            <div className="overall-progress-pct">{stats.overallPct}%</div>
          </div>
          <div className="overall-bar-track">
            <div className="overall-bar-fill" style={{ width: `${stats.overallPct}%` }}></div>
          </div>
        </div>

        <div className="dash-section-title">Skills Breakdown</div>
        <div className="dash-donuts-grid">
          {Object.keys(stats.skillStats).filter(k => stats.skillStats[k].total > 0).map(k => {
            const s = stats.skillStats[k];
            return (
              <div className="donut-card" key={k}>
                <canvas id={`dash-donut-${k}`} width="64" height="64"></canvas>
                <div className="donut-label" style={{ color: s.color }}>{s.icon} {s.name}</div>
                <div className="donut-sub">{s.done} / {s.total} tasks</div>
              </div>
            );
          })}
        </div>

        <div className="dash-section-title">Skills Comparison</div>
        <div className="dash-card" style={{ marginBottom: '28px' }}>
          <div className="dash-card-title">Completion by Skill</div>
          <canvas id="dash-skill-barchart" style={{ width: '100%', height: '200px', display: 'block' }}></canvas>
        </div>

        <div className="dash-section-title">Phase Progress</div>
        <div className="dash-phase-bars">
          {PHASES.map(pId => {
            const meta = PHASE_META.find(m => m.id === pId);
            const pStats = stats.phaseStats[pId];
            return (
              <div className="dash-phase-bar-item" key={pId}>
                <div className="dash-phase-bar-header">
                  <div className="dash-phase-bar-label">
                    <span className="dash-phase-icon" style={{ background: `${meta.color}22` }}>{meta.icon}</span>
                    <span>{meta.label}</span>
                  </div>
                  <div className="dash-phase-bar-pct" style={{ color: meta.color }}>{pStats.pct}%</div>
                </div>
                <div className="dash-phase-bar-track">
                  <div className="dash-phase-bar-fill" style={{ width: `${pStats.pct}%`, background: meta.color }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
