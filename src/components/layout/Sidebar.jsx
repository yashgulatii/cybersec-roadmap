import React from 'react';
import { useAppStore } from '../../store/appStore';
import { useXP } from '../../hooks/useXP';

export default function Sidebar() {
  const { activePage, setActivePage, profile } = useAppStore();
  const { levelProgress } = useXP(profile);
  const level = levelProgress?.level || 1;

  const menuItems = [
    { id: 'home', label: 'HOME', icon: 'ti-home' },
    { id: 'calendar', label: 'CALENDAR', icon: 'ti-calendar' },
    { id: 'missions', label: 'MISSIONS', icon: 'ti-crosshair' },
    { id: 'projects', label: 'PROJECTS', icon: 'ti-layout-kanban' },
    { id: 'schedule', label: 'SCHEDULE', icon: 'ti-clock' },
    { id: 'skillmap', label: 'SKILL MAP', icon: 'ti-map' },
    { id: 'character', label: 'CHARACTER', icon: 'ti-user' },
    { id: 'logs', label: 'LOGS', icon: 'ti-chart-line' },
    { id: 'roadmap', label: 'ROADMAP', icon: 'ti-route' },
    { id: 'manage', label: 'MANAGE', icon: 'ti-settings' }
  ];

  return (
    <aside style={{
      width: '200px',
      background: 'var(--bg-card)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      padding: '20px 0 0 0'
    }}>
      {/* Top Section */}
      <div style={{ padding: '0 16px 16px 16px' }}>
        <div style={{
          fontSize: '14px',
          fontWeight: 600,
          letterSpacing: '0.2em',
          color: 'var(--text-primary)'
        }}>
          TAC-NET
        </div>
        <div style={{
          marginTop: '4px',
          fontSize: '10px',
          color: 'var(--text-dim)',
          letterSpacing: '0.1em'
        }}>
          OPR: YG-01
        </div>
        <div style={{
          height: '1px',
          background: 'var(--border)',
          marginTop: '12px'
        }}></div>
      </div>

      {/* Nav Menu */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '8px 0', overflowY: 'auto' }}>
        {menuItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <div
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className="nav-item"
              style={{
                height: '40px',
                padding: isActive ? '0 16px 0 13px' : '0 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                background: isActive ? 'var(--green-bg)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--green)' : 'none',
                transition: 'all 120ms',
                color: isActive ? 'var(--text-primary)' : 'var(--text-dim)'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--bg-card-raised)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.querySelector('i').style.color = 'var(--text-secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-dim)';
                  e.currentTarget.querySelector('i').style.color = 'var(--text-dim)';
                }
              }}
            >
              <i className={`ti ${item.icon}`} style={{ 
                fontSize: '16px', 
                color: isActive ? 'var(--green)' : 'var(--text-dim)',
                transition: 'color 120ms'
              }}></i>
              <span style={{ 
                fontSize: '12px', 
                fontWeight: isActive ? 500 : 400, 
                letterSpacing: '0.08em' 
              }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </nav>

      {/* Bottom Status Block */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <div style={{
          fontSize: '11px',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)' }}></div>
          SYS ONLINE
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          PHASE {String(profile?.currentPhase || 1).padStart(2, '0')}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          LVL {String(level).padStart(2, '0')}
        </div>
      </div>
    </aside>
  );
}
