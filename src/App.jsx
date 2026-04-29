import { useState, useEffect, useMemo, useRef } from 'react';
import { PHASES, PHASE_META, ROADMAP_DATA } from './data';
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
    const editSaved = sessionStorage.getItem('roadmap_edit');
    if (editSaved === '1') {
      setIsEditMode(true);
    }
  }, []);

  const saveCompleted = (newSet) => {
    setCompleted(newSet);
    localStorage.setItem('roadmap_progress', JSON.stringify(Array.from(newSet)));
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

  const unlockEdit = () => {
    setIsEditMode(true);
    sessionStorage.setItem('roadmap_edit', '1');
    setShowAuthModal(false);
  };

  const lockEdit = () => {
    setIsEditMode(false);
    sessionStorage.removeItem('roadmap_edit');
  };

  const stats = useMemo(() => {
    let total = 0;
    let done = 0;
    const phaseStats = {};

    PHASES.forEach(pId => {
      let pTotal = 0;
      let pDone = 0;
      ROADMAP_DATA[pId]?.forEach(section => {
        section.topics.forEach((topic, i) => {
          const globalIdx = `${pId}-${total + i}`;
          pTotal++;
          if (completed.has(globalIdx)) pDone++;
        });
        total += section.topics.length;
      });
      done += pDone;
      phaseStats[pId] = { total: pTotal, done: pDone, pct: pTotal === 0 ? 0 : Math.round((pDone / pTotal) * 100) };
    });

    const overallPct = total === 0 ? 0 : Math.round((done / total) * 100);

    return { total, done, phaseStats, overallPct };
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
    { label: 'Foundation', phases: ['p0', 'p1'] },
    { label: 'Blue Team', phases: ['p2', 'p2b'] },
    { label: 'Offensive', phases: ['p3', 'p4', 'p5'] }
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
                <span className="sidebar-dot" style={{ background: meta.color }}></span>
                {meta.label}
                <span className="sidebar-pct">{stats.phaseStats[pId].pct}%</span>
              </a>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function PhaseBlock({ pId, meta, data, stats, completed, toggleTopic }) {
  let topicOffset = 0;

  return (
    <div className="phase-block" id={pId}>
      <div className="phase-header">
        <div className="phase-icon" style={{ background: `${meta.color}22` }}>{meta.icon}</div>
        <div>
          <div className="phase-title">Phase {pId.replace('p', '')} — {meta.label}</div>
          <div className="phase-sub">{meta.sub}</div>
        </div>
        <div className="phase-progress-wrap">
          <div className="phase-pct-label" style={{ color: meta.color }}>{stats.pct}%</div>
          <div className="phase-bar">
            <div className="phase-bar-fill" style={{ width: `${stats.pct}%`, background: meta.color }}></div>
          </div>
        </div>
      </div>

      {pId === 'p0' && (
        <div className="warn"><strong>Don't skip this.</strong> Even if you "know Linux" — work through OverTheWire Bandit levels 0–34. If you can't do level 20 without googling, your Linux is not production-ready for security work.</div>
      )}
      {pId === 'p1' && (
        <div className="info"><strong>Primary resource:</strong> All videos at <a href="https://www.professormesser.com/security-plus/sy0-701/sy0-701-video/sy0-701-training-course/" target="_blank" rel="noreferrer" style={{ color: 'var(--blue)' }}>professormesser.com/sy0-701</a> — 100% free. Watch one section, take notes in your own words, then do practice questions before moving on. Don't binge-watch.</div>
      )}

      {data.map((section, sIdx) => (
        <div className="section" key={sIdx}>
          <div className="section-title">{section.title}</div>
          <div className="topic-grid">
            {section.topics.map((topic, tIdx) => {
              const globalIdx = `${pId}-${topicOffset + tIdx}`;
              const isDone = completed.has(globalIdx);
              const Item = (
                <div key={tIdx} className={`topic-item ${isDone ? 'done' : ''}`} onClick={() => toggleTopic(globalIdx)}>
                  <div className="topic-check">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="topic-content">
                    <div className="topic-name">{topic.name}</div>
                    <div className="topic-desc">{topic.desc}</div>
                    {topic.link && <a className="topic-link" href={topic.link} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>{topic.linkText}</a>}
                  </div>
                  <span className={`topic-badge ${topic.badgeClass}`}>{topic.badge}</span>
                </div>
              );
              if (tIdx === section.topics.length - 1) {
                topicOffset += section.topics.length;
              }
              return Item;
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
        onUnlock();
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
      // Draw Donuts
      PHASES.forEach(pId => {
        const canvas = document.getElementById(`dash-donut-${pId}`);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width; const H = canvas.height;
        ctx.clearRect(0, 0, W, H);
        
        const cx = W / 2; const cy = H / 2;
        const r = 24; const lw = 6;
        const meta = PHASE_META.find(m => m.id === pId);
        const pStats = stats.phaseStats[pId];
        
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = lw;
        ctx.stroke();

        if (pStats.total > 0 && pStats.done > 0) {
          const endAngle = (pStats.done / pStats.total) * 2 * Math.PI - (Math.PI / 2);
          ctx.beginPath();
          ctx.arc(cx, cy, r, -Math.PI / 2, endAngle);
          ctx.strokeStyle = meta.color;
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pStats.pct + '%', cx, cy + 1);
      });

      // Draw Bar Chart
      const bCanvas = document.getElementById('dash-barchart');
      if (!bCanvas) return;
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

      const numBars = PHASES.length;
      const barSpacing = chartW / numBars;
      const barWidth = Math.min(40, barSpacing * 0.6);

      PHASES.forEach((pId, i) => {
        const meta = PHASE_META.find(m => m.id === pId);
        const pStats = stats.phaseStats[pId];
        
        const x = padding + i * barSpacing + (barSpacing - barWidth) / 2;
        const h = (pStats.pct / 100) * chartH;
        const y = padding + chartH - h;

        bCtx.fillStyle = meta.color;
        bCtx.fillRect(x, y, barWidth, h);

        bCtx.fillStyle = 'rgba(255,255,255,0.05)';
        bCtx.fillRect(x, padding, barWidth, chartH - h);

        bCtx.fillStyle = '#888';
        bCtx.font = '10px sans-serif';
        bCtx.textAlign = 'center';
        bCtx.fillText(meta.short, x + barWidth / 2, padding + chartH + 15);
      });
    };
    
    requestAnimationFrame(drawCharts);
    window.addEventListener('resize', drawCharts);
    return () => window.removeEventListener('resize', drawCharts);
  }, [stats]);

  return (
    <div className="dash-overlay visible">
      <div className="dash-topbar">
        <div className="dash-topbar-title">Progress Dashboard</div>
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

        <div className="dash-section-title">Phase Breakdown</div>
        <div className="dash-donuts-grid">
          {PHASES.map(pId => {
            const meta = PHASE_META.find(m => m.id === pId);
            const pStats = stats.phaseStats[pId];
            return (
              <div className="donut-card" key={pId}>
                <canvas id={`dash-donut-${pId}`} width="64" height="64"></canvas>
                <div className="donut-label">{meta.short}</div>
                <div className="donut-sub">{pStats.done} / {pStats.total} tasks</div>
              </div>
            );
          })}
        </div>

        <div className="dash-section-title">Phase Comparison</div>
        <div className="dash-card">
          <div className="dash-card-title">Completion by Phase</div>
          <canvas id="dash-barchart" style={{ width: '100%', height: '200px', display: 'block' }}></canvas>
        </div>
      </div>
    </div>
  );
}
