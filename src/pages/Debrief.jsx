// src/pages/Debrief.jsx
// Purpose: Displays the visual, dynamic commander debrief console, aggregating all telemetry metrics, trigger-controlled Llama strategists, accented assessments, and 7-day chronological collapsibles.

import React, { useState, useEffect, useMemo } from 'react';
import { useAppStore, getTodayString } from '../store/appStore';
import { useGroq } from '../hooks/useGroq';
import { roadmapData, getTasksForToday } from '../data/roadmapData';
import { skillsData } from '../data/skillsData';
import { projectsData } from '../data/projectsData';
import CategoryTag from '../components/ui/CategoryTag';
import ProgressBar from '../components/ui/ProgressBar';

const DEBRIEF_SYSTEM_PROMPT = `You are the TAC-NET AI debrief system for Yash Gulati, a final-year B.Sc. Electronics student in Delhi building a cybersecurity career to achieve financial independence and eventually remote work enabling solo global travel. He is targeting SOC Analyst and AppSec Engineer roles as a fresher. His background: TryHackMe top 2%, Google Cybersecurity Certificate, CNSP certification, ethical hacking internship, real IDOR discovery (CVSS 8.9, production app with 100+ users), Active Directory Attack and Detection Lab in progress, 7 Python security tools built, PortSwigger server-side labs in progress. His 10-year roadmap moves: Defensive Security (Phase 1) → Offensive Security/OSCP (Phase 2) → Remote Work and Bug Bounty Income (Phase 3) → Location-Independent Expert (Phase 4). He tracks daily missions, skill progression, project milestones, and XP in a personal gamified dashboard. Today's operational data is provided below. Debrief him as a direct, experienced mentor. Give: (1) PERFORMANCE ASSESSMENT: honest 3-sentence assessment of today's execution — do not inflate praise, do not catastrophize misses, (2) PATTERN ALERT: one pattern you notice across his recent completions or skips that he should know about, (3) PRIORITY DIRECTIVE: exactly one thing he must do tomorrow that will have the highest compounding impact given his current phase and progress, (4) PHASE HEALTH CHECK: rate his current phase progress as ON TRACK, SLIGHTLY BEHIND, or AT RISK — with one sentence explanation, (5) MORALE SIGNAL: one short, direct sentence that acknowledges where he is in the journey without being generic or performative.`;

export default function Debrief() {
  const {
    currentPhase,
    currentWeek,
    dailyState,
    profile,
    roadmapState,
    projectProgress,
    projectStatus,
    fixedTasks,
    chains,
    chainProgress,
    isDayClosed,
    setRoadmapState,
    syncWithServer,
    saveDebrief,
    debriefs = {},
    state
  } = useAppStore();

  const { callGroq, isLoading: groqLoading, error: groqError } = useGroq();

  // Local state for debrief response, clipboard copy indicators, active history selection, and cooldown timers
  const [activeDebriefText, setActiveDebriefText] = useState('');
  const [copied, setCopied] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0); // in ms
  const [expandedHistoryDate, setExpandedHistoryDate] = useState(null);
  const [historyPruned, setHistoryPruned] = useState([]);
  const [isRetrying, setIsRetrying] = useState(false);
  const [debriefAttempt, setDebriefAttempt] = useState(0);

  const todayStr = useMemo(() => getTodayString(), []);

  // Convert currentPhase (e.g. 'phase1') to numerical phase number
  const currentPhaseNum = useMemo(() => {
    return parseInt(currentPhase.replace('phase', ''), 10) || 1;
  }, [currentPhase]);

  // Retrieve today's day of week name
  const todayDayName = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  }, []);

  // Compute a comprehensive set of all completed task IDs (current + historical logs + chains progress)
  const completedSet = useMemo(() => {
    const ids = new Set(dailyState?.completedTaskIds || []);

    // Load from chainProgress
    if (chainProgress) {
      Object.keys(chainProgress).forEach(chainName => {
        const count = chainProgress[chainName] || 0;
        for (let i = 0; i < count; i++) {
          ids.add(`chain:${chainName}:${i}`);
        }
      });
    }

    // Load from historical logs in central state
    try {
      const logsMap = state?.logs ?? {};
      Object.entries(logsMap).forEach(([dateStr, logs]) => {
        if (Array.isArray(logs)) {
          logs.forEach(entry => {
            if (entry.type === 'completed') {
              const fixedTask = fixedTasks.find(t => t.title === entry.taskName);
              if (fixedTask) {
                ids.add(fixedTask.id);
              }

              ['phase1', 'phase2', 'phase3', 'phase4'].forEach(pKey => {
                const phase = roadmapData[pKey];
                if (!phase) return;
                const sections = phase.weeks || phase.months || phase.quarters || phase.years || [];
                sections.forEach(sec => {
                  (sec.tasks || []).forEach(task => {
                    if (task.title === entry.taskName) {
                      ids.add(task.id);
                    }
                  });
                });
              });
            }
          });
        }
      });
    } catch (e) {
      console.warn("Failed to aggregate historical logs:", e);
    }

    return ids;
  }, [dailyState?.completedTaskIds, chainProgress, fixedTasks]);

  // Look up XP for a given task ID across standard sources
  const getTaskXp = (taskId) => {
    const ft = fixedTasks.find(t => t.id === taskId);
    if (ft) return ft.xpReward || ft.xp || 20;

    let resolvedXp = null;
    ['phase1', 'phase2', 'phase3', 'phase4'].forEach(pKey => {
      const phase = roadmapData[pKey];
      if (!phase) return;
      const sections = phase.weeks || phase.months || phase.quarters || phase.years || [];
      sections.forEach(sec => {
        (sec.tasks || []).forEach(task => {
          if (task.id === taskId) {
            resolvedXp = task.xpReward || task.xp || 25;
          }
        });
      });
    });
    if (resolvedXp !== null) return resolvedXp;

    return 25; // Default fallback
  };

  // Calculate XP earned today (completed task IDs today)
  const xpEarnedToday = useMemo(() => {
    return (dailyState?.completedTaskIds || []).reduce((sum, id) => sum + getTaskXp(id), 0);
  }, [dailyState?.completedTaskIds, fixedTasks]);

  // Calculate XP earned this week (summing today + last 6 days' logs)
  const xpEarnedThisWeek = useMemo(() => {
    let sum = xpEarnedToday;
    for (let offset = 1; offset < 7; offset++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - offset);
      const dateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;

      const dayLogs = state?.logs?.[dateStr];
      if (dayLogs && Array.isArray(dayLogs)) {
        dayLogs.forEach(entry => {
          if (entry.type === 'completed') {
            sum += entry.xp || 25;
          }
        });
      }
    }
    return sum;
  }, [xpEarnedToday]);

  // Scrape all daily operational tasks scheduled for today
  const dailyTasks = useMemo(() => {
    const roadmapTasksToday = getTasksForToday(currentPhase, currentWeek, todayDayName) || [];
    
    // Fixed tasks
    const dailyFixed = fixedTasks || [];
    
    // Chains active step tasks today
    const chainTasksToday = [];
    Object.keys(chains).forEach(chainName => {
      const chain = chains[chainName];
      if (!chain) return;
      const tasksArray = Array.isArray(chain) ? chain : (chain.tasks || []);
      const currentIdx = chainProgress[chainName] !== undefined ? chainProgress[chainName] : 0;
      if (currentIdx < tasksArray.length) {
        const taskId = `chain:${chainName}:${currentIdx}`;
        chainTasksToday.push({
          id: taskId,
          title: tasksArray[currentIdx].title,
          category: 'LABS',
          xpReward: tasksArray[currentIdx].xp
        });
      }
    });

    // Merge everything
    const allTasks = [];
    roadmapTasksToday.forEach(t => {
      allTasks.push({ id: t.id, title: t.title, category: t.category || 'ROADMAP' });
    });
    dailyFixed.forEach(t => {
      allTasks.push({ id: t.id, title: t.title, category: t.category || 'DAILY' });
    });
    chainTasksToday.forEach(t => {
      allTasks.push(t);
    });

    const completed = [];
    const incomplete = [];
    const completedIdsSet = new Set(dailyState?.completedTaskIds || []);

    allTasks.forEach(t => {
      if (completedIdsSet.has(t.id)) {
        completed.push(t);
      } else {
        incomplete.push(t);
      }
    });

    return { completed, incomplete };
  }, [dailyState?.completedTaskIds, currentPhase, currentWeek, todayDayName, fixedTasks, chains, chainProgress]);

  // Retrieve current active phase progress
  const activePhaseObj = roadmapData[currentPhase];
  const activePhaseProgress = useMemo(() => {
    const storeKeyMap = { phase1: 'foundation', phase2: 'momentum', phase3: 'expansion', phase4: 'mastery' };
    const key = storeKeyMap[currentPhase] || currentPhase;
    return roadmapState[key]?.progress || 0;
  }, [currentPhase, roadmapState]);

  // Aggregate active projects metrics
  const activeProjectsInfo = useMemo(() => {
    const activeProjs = projectsData.filter(p => projectStatus[p.id] === 'ACTIVE');
    return activeProjs.map(proj => {
      const total = (proj.linkedTaskIds || []).length;
      const completed = (proj.linkedTaskIds || []).filter(id => completedSet.has(id)).length;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { name: proj.title, progress: pct, projObj: proj };
    });
  }, [projectStatus, completedSet]);

  // Calculate unlocked skill levels
  const unlockedSkillsInfo = useMemo(() => {
    const skills = [];
    Object.keys(skillsData).forEach(key => {
      const skill = skillsData[key];
      if (skill.unlockedAtPhase <= currentPhaseNum) {
        const completedCount = skill.linkedTasks.filter(id => completedSet.has(id)).length;
        skills.push({
          name: skill.name,
          level: Math.min(skill.maxLevel, completedCount)
        });
      }
    });
    return skills;
  }, [currentPhaseNum, completedSet]);

  // Calculate weekly roadmap tasks completed vs total
  const weeklyRoadmapTasksStats = useMemo(() => {
    const phase = roadmapData[currentPhase];
    if (!phase) return { completed: 0, total: 0 };

    const tasks = [];
    if (currentPhase === 'phase1' && phase.weeks) {
      const week = phase.weeks.find(w => w.weekNumber === currentWeek);
      if (week) tasks.push(...week.tasks);
    } else if (currentPhase === 'phase2' && phase.months) {
      const month = phase.months.find(m => m.monthNumber === currentWeek);
      if (month) tasks.push(...month.tasks);
    } else if (currentPhase === 'phase3' && phase.quarters) {
      const quarter = phase.quarters.find(q => q.quarterNumber === currentWeek);
      if (quarter) tasks.push(...quarter.tasks);
    } else if (currentPhase === 'phase4' && phase.years) {
      const year = phase.years.find(y => y.yearNumber === currentWeek);
      if (year) tasks.push(...year.tasks);
    }

    const completed = tasks.filter(t => completedSet.has(t.id)).length;
    return { completed, total: tasks.length };
  }, [currentPhase, currentWeek, completedSet]);

  // Detect session-completed milestones completed TODAY
  const recentlyCompletedMilestones = useMemo(() => {
    const list = [];
    activeProjectsInfo.forEach(({ name, projObj }) => {
      const totalTasks = (projObj.linkedTaskIds || []).length;
      if (totalTasks === 0) return;
      const milestones = projObj.milestones || ['Milestone 1'];
      const M = milestones.length;
      const tasksPerMilestone = Math.ceil(totalTasks / M);

      milestones.forEach((milestoneText, idx) => {
        const startIdx = idx * tasksPerMilestone;
        const endIdx = Math.min(totalTasks, (idx + 1) * tasksPerMilestone);
        const chunk = (projObj.linkedTaskIds || []).slice(startIdx, endIdx);
        if (chunk.length === 0) return;

        const isCompleteNow = chunk.every(id => completedSet.has(id));
        const completedToday = chunk.some(id => dailyState?.completedTaskIds?.includes(id));
        
        if (isCompleteNow && completedToday) {
          list.push(`${name}: ${milestoneText}`);
        }
      });
    });
    return list;
  }, [activeProjectsInfo, completedSet, dailyState?.completedTaskIds]);

  // Calculate days elapsed since the most recent recorded debrief
  const daysSinceLastDebrief = useMemo(() => {
    let lastDateStr = null;
    try {
      const debriefKeys = Object.keys(debriefs).filter(k => k !== todayStr);
      if (debriefKeys.length > 0) {
        const dates = debriefKeys.sort();
        lastDateStr = dates[dates.length - 1];
      }
    } catch (e) { }

    if (!lastDateStr) return 'First Debrief';

    const lastDate = new Date(lastDateStr);
    const today = new Date(todayStr);
    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} Day${diffDays > 1 ? 's' : ''}`;
  }, [todayStr, debriefs]);

  // Fetch history directly from central store debriefs object keeping only the most recent 7 entries
  const pruneAndFetchHistory = React.useCallback(() => {
    try {
      const historyList = Object.entries(debriefs ?? {}).map(([dateStr, val]) => {
        let content = '';
        if (val) {
          if (typeof val === 'object') {
            content = val.content || val.message || '';
          } else {
            content = String(val);
          }
        }
        return {
          date: dateStr,
          content,
          timestamp: new Date(dateStr).getTime() || 0
        };
      });

      // Sort in descending order (most recent first)
      historyList.sort((a, b) => b.timestamp - a.timestamp);

      setHistoryPruned(historyList.slice(0, 7));
    } catch (e) {
      console.warn("Failed to load debrief history:", e);
    }
  }, [debriefs]);

  // Sync historical list on component mount
  useEffect(() => {
    pruneAndFetchHistory();
    
    // Check if a debrief response exists for today already
    const todayDebrief = debriefs?.[todayStr];
    if (todayDebrief) {
      if (typeof todayDebrief === 'object') {
        setActiveDebriefText(todayDebrief.content || todayDebrief.message || '');
      } else {
        setActiveDebriefText(String(todayDebrief));
      }
    }
  }, [todayStr, debriefs, pruneAndFetchHistory]);

  // Set up tick timer for the 8-hour trigger cooldown countdown
  useEffect(() => {
    const getLocalDateString = (timestamp) => {
      const d = timestamp ? new Date(timestamp) : new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${date}`;
    };

    const calculateCooldown = () => {
      const lastRunTime = localStorage.getItem('last_debrief_run_timestamp');
      if (!lastRunTime) {
        setCooldownRemaining(0);
        return;
      }
      const lastRun = parseInt(lastRunTime, 10) || 0;
      
      const lastRunDateStr = getLocalDateString(lastRun);
      const todayDateStr = getLocalDateString();
      if (lastRunDateStr !== todayDateStr) {
        setCooldownRemaining(0);
        return;
      }

      const elapsed = Date.now() - lastRun;
      const cooldownLimit = 8 * 60 * 60 * 1000; // 8 hours in ms
      const remaining = cooldownLimit - elapsed;
      setCooldownRemaining(remaining > 0 ? remaining : 0);
    };

    calculateCooldown();
    const interval = setInterval(calculateCooldown, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Format cooldown display (e.g. "7h 45m")
  const cooldownLabel = useMemo(() => {
    if (cooldownRemaining <= 0) return '';
    const hours = Math.floor(cooldownRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((cooldownRemaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }, [cooldownRemaining]);

  // Run AI debrief strategist call with 5-attempt retry mechanism
  const handleTriggerDebrief = async () => {
    if (cooldownRemaining > 0) return;

    // Compose user message packing all accumulated telemetry
    const userMessage = `
--- OPERATIONAL DATA SUMMARY ---
DATE: ${todayStr}
PHASE: ${(currentPhase || '').toUpperCase()} - ${activePhaseObj?.title || ''}
WEEK/PERIOD: ${currentWeek}
STREAK: ${profile.streak} days
XP EARNED TODAY: ${xpEarnedToday} XP
XP EARNED THIS WEEK: ${xpEarnedThisWeek} XP

COMPLETED TODAY:
${dailyTasks.completed.length > 0 ? dailyTasks.completed.map(t => `- [${t.category}] ${t.title}`).join('\n') : '- None'}

INCOMPLETE TODAY:
${dailyTasks.incomplete.length > 0 ? dailyTasks.incomplete.map(t => `- [${t.category}] ${t.title}`).join('\n') : '- None'}

ROADMAP COMPLETION RATE (CURRENT PHASE): ${activePhaseProgress}%
ROADMAP WEEKLY COMPLETIONS: ${weeklyRoadmapTasksStats.completed} / ${weeklyRoadmapTasksStats.total} completed

ACTIVE PROJECTS STATUS:
${activeProjectsInfo.length > 0 ? activeProjectsInfo.map(p => `- ${p.name}: ${p.progress}%`).join('\n') : '- None active'}

SKILL TELEMETRY (UNLOCKED SKILLS):
${unlockedSkillsInfo.length > 0 ? unlockedSkillsInfo.map(s => `- ${s.name}: Level ${s.level}/5`).join('\n') : '- None unlocked'}

MILESTONES COMPLETED TODAY:
${recentlyCompletedMilestones.length > 0 ? recentlyCompletedMilestones.map(m => `- ${m}`).join('\n') : '- None'}

DAYS SINCE LAST DEBRIEF: ${daysSinceLastDebrief}
`;

    const maxAttempts = 5;
    let success = false;
    setIsRetrying(true);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      setDebriefAttempt(attempt);
      try {
        console.log(`Debrief generation attempt ${attempt}/${maxAttempts}...`);
        const resultText = await callGroq(DEBRIEF_SYSTEM_PROMPT, userMessage);
        if (resultText) {
          // Save to central store
          saveDebrief(todayStr, resultText);
          localStorage.setItem('last_debrief_run_timestamp', Date.now().toString());
          setActiveDebriefText(resultText);
          setCooldownRemaining(8 * 60 * 60 * 1000); // Set cooldown to 8 hours
          pruneAndFetchHistory(); // Reload history descending
          success = true;
          break;
        }
      } catch (err) {
        console.warn(`Debrief generation attempt ${attempt} failed:`, err);
        // Wait before retrying (progressive backoff: 2s, 3s, 4s, 5s)
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, attempt * 1000 + 1000));
        }
      }
    }

    setIsRetrying(false);
    setDebriefAttempt(0);

    if (!success) {
      // Mark that debrief could not be generated due to technical defects
      const fallbackMessage = "Debrief could not be generated due to technical defects.";
      saveDebrief(todayStr, fallbackMessage, true);
      setActiveDebriefText(fallbackMessage);
      pruneAndFetchHistory();
    }
  };

  // Helper to copy raw response text to clipboard
  const handleCopyToClipboard = (textToCopy) => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Parses markdown text response into the five core accented panels
  const parsedSections = useMemo(() => {
    if (!activeDebriefText) return null;

    const sections = { performance: '', pattern: '', priority: '', health: '', morale: '' };
    let text = '';
    if (typeof activeDebriefText === 'object') {
      text = activeDebriefText.content || activeDebriefText.message || '';
    } else {
      text = String(activeDebriefText);
    }
    if (!text) return null;

    const idxPerformance = text.search(/performance\s*assessment/i);
    const idxPattern = text.search(/pattern\s*alert/i);
    const idxPriority = text.search(/priority\s*directive/i);
    const idxHealth = text.search(/phase\s*health\s*check/i);
    const idxMorale = text.search(/morale\s*signal/i);

    const markers = [
      { key: 'performance', idx: idxPerformance },
      { key: 'pattern', idx: idxPattern },
      { key: 'priority', idx: idxPriority },
      { key: 'health', idx: idxHealth },
      { key: 'morale', idx: idxMorale }
    ].filter(m => m.idx !== -1).sort((a, b) => a.idx - b.idx);

    if (markers.length === 0) {
      return {
        'PERFORMANCE ASSESSMENT': text,
        'PATTERN ALERT': '',
        'PRIORITY DIRECTIVE': '',
        'PHASE HEALTH CHECK': '',
        'MORALE SIGNAL': ''
      };
    }

    for (let i = 0; i < markers.length; i++) {
      const current = markers[i];
      const next = markers[i + 1];
      let content = text.slice(current.idx, next ? next.idx : text.length);
      content = content.replace(/^[#\s*\-*]*(performance\s*assessment|pattern\s*alert|priority\s*directive|phase\s*health\s*check|morale\s*signal)[\s*:\-]*\s*/i, '').trim();
      sections[current.key] = content;
    }

    return {
      'PERFORMANCE ASSESSMENT': sections.performance,
      'PATTERN ALERT': sections.pattern,
      'PRIORITY DIRECTIVE': sections.priority,
      'PHASE HEALTH CHECK': sections.health,
      'MORALE SIGNAL': sections.morale
    };
  }, [activeDebriefText]);

  // Color mapper helper for phase health ratings
  const getHealthColor = (text) => {
    const upper = text ? text.toUpperCase() : '';
    if (upper.includes('ON TRACK') || upper.includes('ON_TRACK')) return 'var(--accent-green)';
    if (upper.includes('SLIGHTLY BEHIND') || upper.includes('SLIGHTLY_BEHIND') || upper.includes('BEHIND')) return 'var(--accent-amber)';
    if (upper.includes('AT RISK') || upper.includes('AT_RISK') || upper.includes('RISK')) return 'var(--accent-coral)';
    return 'var(--border-color)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', fontFamily: 'var(--font-mono)' }}>
      
      {/* Debrief Header Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px dashed var(--border-color)',
        paddingBottom: '14px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h2 style={{
            margin: 0,
            fontSize: '18px',
            color: 'var(--accent-amber)',
            letterSpacing: '0.05em'
          }}>
            &gt; AAR_COMMAND_CONSOLE // TAC-NET
          </h2>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            AFTER ACTION REVIEW SYSTEM -- DATA AGGREGATION & STRATEGIC INSIGHTS
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {activeDebriefText && (
            <button
              onClick={() => handleCopyToClipboard(activeDebriefText)}
              className="dark-date-picker"
              style={{
                fontSize: '11px',
                padding: '6px 12px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: copied ? 'var(--accent-green)' : 'var(--text-main)',
                cursor: 'pointer',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                transition: 'color 0.2s'
              }}
            >
              {copied ? '[ COPIED! ]' : '[ COPY FULL DEBRIEF ]'}
            </button>
          )}

          <button
            onClick={handleTriggerDebrief}
            disabled={cooldownRemaining > 0 || groqLoading || isRetrying}
            className="dark-date-picker"
            style={{
              fontSize: '11px',
              padding: '6px 16px',
              background: (cooldownRemaining > 0 || groqLoading || isRetrying) ? 'rgba(0,0,0,0.3)' : 'var(--accent-amber)',
              border: `1px solid ${cooldownRemaining > 0 ? 'var(--border-color)' : 'var(--accent-amber)'}`,
              color: (cooldownRemaining > 0 || groqLoading || isRetrying) ? 'var(--text-muted)' : 'var(--bg-card)',
              cursor: (cooldownRemaining > 0 || groqLoading || isRetrying) ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              boxShadow: (cooldownRemaining > 0 || groqLoading || isRetrying) ? 'none' : '0 0 10px rgba(245, 166, 35, 0.2)'
            }}
          >
            {isRetrying
              ? `COMMS RETRY ${debriefAttempt}/5...`
              : groqLoading 
                ? 'ESTABLISHING SECURE COMMS...' 
                : cooldownRemaining > 0 
                  ? `DEBRIEF LOCKED — NEXT AVAILABLE IN ${cooldownLabel}` 
                  : '[ RUN DEBRIEF ]'}
          </button>
        </div>
      </div>

      {/* INTEL SUMMARY STAT CARDS GRID */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{
          fontSize: '10px',
          color: 'var(--text-muted)',
          fontWeight: 'bold',
          letterSpacing: '0.05em'
        }}>
          // INTEL TELEMETRY SUMMARY (REAL-TIME COMPILATION)
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px'
        }}>
          {/* CARD 1: Phase & Week */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '14px' }}>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>OPERATIVE TIMELINE</span>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-main)', display: 'block' }}>
              {(currentPhase || '').toUpperCase()} // P{currentPhaseNum}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--accent-amber)', display: 'block', marginTop: '2px' }}>
              Week/Month {currentWeek} focus area locked
            </span>
          </div>

          {/* CARD 2: Consistency Streak */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '14px' }}>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>CONSISTENCY STREAK</span>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--accent-orange)', display: 'block' }}>
              ⚡ {profile.streak || 0} Day{profile.streak === 1 ? '' : 's'}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
              Compound trajectory multiplier active
            </span>
          </div>

          {/* CARD 3: XP Rewards */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '14px' }}>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>XP FIELD ACCUMULATION</span>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--accent-green)', display: 'block' }}>
              +{xpEarnedToday} XP Today
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
              +{xpEarnedThisWeek} XP logged this week
            </span>
          </div>

          {/* CARD 4: Daily Checklist */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '14px' }}>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>DAILY TASK COMPLETION</span>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-main)', display: 'block' }}>
              {dailyTasks.completed.length} / {dailyTasks.completed.length + dailyTasks.incomplete.length} Completed
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
              {dailyTasks.incomplete.length} pending critical targets today
            </span>
          </div>

          {/* CARD 5: Phase Progress */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '14px' }}>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>PHASE ROADMAP PROGRESS</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-main)' }}>
                {activePhaseProgress}% Completed
              </span>
            </div>
            <ProgressBar percentage={activePhaseProgress} height="4px" />
          </div>

          {/* CARD 6: Projects Progress */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '14px' }}>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>ACTIVE PROJECTS TELEMETRY</span>
            {activeProjectsInfo.length === 0 ? (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No active projects.</span>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {activeProjectsInfo.map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '140px' }} title={p.name}>
                      {p.name}
                    </span>
                    <span style={{ fontWeight: 'bold', color: 'var(--accent-blue)' }}>{p.progress}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CARD 7: Skills Telemetry */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '14px' }}>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>INTEGRATED SKILLS</span>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-main)', display: 'block' }}>
              {unlockedSkillsInfo.length} Skills Unlocked
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
              Grouped across 5 career fields
            </span>
          </div>

          {/* CARD 8: Milestone completed & Days Since */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '14px' }}>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>TELEMETRY LOG GAPS</span>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-main)', display: 'block' }}>
              Last Debrief: {daysSinceLastDebrief} ago
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
              {recentlyCompletedMilestones.length} milestone{recentlyCompletedMilestones.length === 1 ? '' : 's'} hit today
            </span>
          </div>

        </div>
      </div>

      {/* AI DEBRIEF ASSESSMENT PANELS */}
      {groqLoading && (
        <div style={{
          border: '1px dashed var(--accent-amber)',
          background: 'rgba(255, 255, 255, 0.005)',
          padding: '48px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px'
        }}>
          <div className="pulse-dot" style={{ width: '16px', height: '16px', background: 'var(--accent-amber)' }}></div>
          <span style={{ fontSize: '13px', color: 'var(--accent-amber)', fontWeight: 'bold', letterSpacing: '0.1em' }} className="loading-blink">
            &gt; ESTABLISHING FEEDBACK LOOP TO COMMANDER AI SYSTEMS...
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', maxWidth: '340px', lineHeight: '1.6' }}>
            Transmitting aggregated Delhi fresher metrics. Synthesizing performance reports and compund trajectory directive matrices...
          </span>
        </div>
      )}

      {groqError && (
        <div style={{
          border: '1px dashed var(--accent-coral)',
          padding: '20px',
          color: 'var(--accent-coral)',
          fontSize: '12px',
          lineHeight: '1.6',
          background: 'rgba(255, 51, 102, 0.03)'
        }}>
          [!] SECURE COMMS DISRUPTED: FAILED TO QUERY COMMAND INTEL STRATEGIST.
          <br />
          ERROR DETAIL: {groqError}
          <br />
          <span style={{ display: 'block', marginTop: '10px', color: 'var(--text-muted)' }}>
            Ensure connection to local Cloudflare Workers and environment VITE_WORKER_URL is correctly calibrated.
          </span>
        </div>
      )}

      {/* RENDER DYNAMIC 5 STYLE BOX PANELS */}
      {!groqLoading && parsedSections && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{
            fontSize: '11px',
            color: 'var(--accent-amber)',
            fontWeight: 'bold',
            letterSpacing: '0.05em',
            borderBottom: '1px dashed var(--border-color)',
            paddingBottom: '6px'
          }}>
            &gt; SECURE DEBRIEF SUMMARY REPORT LOGGED BY COMMANDER AI
          </div>

          {/* PANEL 1: PERFORMANCE ASSESSMENT */}
          {parsedSections['PERFORMANCE ASSESSMENT'] && (
            <div style={{
              background: 'rgba(186, 117, 23, 0.02)',
              border: '1px solid var(--accent-amber)',
              borderLeft: '4px solid var(--accent-amber)',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-amber)', fontWeight: 'bold', letterSpacing: '0.05em' }}>
                // PERFORMANCE ASSESSMENT
              </span>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6', color: 'var(--text-main)' }}>
                {parsedSections['PERFORMANCE ASSESSMENT']}
              </p>
            </div>
          )}

          {/* PANEL 2: PATTERN ALERT */}
          {parsedSections['PATTERN ALERT'] && (
            <div style={{
              background: 'rgba(0, 200, 255, 0.02)',
              border: '1px solid var(--accent-blue)',
              borderLeft: '4px solid var(--accent-blue)',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-blue)', fontWeight: 'bold', letterSpacing: '0.05em' }}>
                // PATTERN ALERT
              </span>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6', color: 'var(--text-main)' }}>
                {parsedSections['PATTERN ALERT']}
              </p>
            </div>
          )}

          {/* PANEL 3: PRIORITY DIRECTIVE */}
          {parsedSections['PRIORITY DIRECTIVE'] && (
            <div style={{
              background: 'rgba(34, 197, 94, 0.03)',
              border: '1px solid var(--accent-green)',
              borderLeft: '4px solid var(--accent-green)',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              boxShadow: '0 0 10px rgba(34, 197, 94, 0.15)'
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-green)', fontWeight: 'bold', letterSpacing: '0.05em' }}>
                // PRIORITY DIRECTIVE
              </span>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6', color: 'var(--text-main)', fontWeight: 'bold' }}>
                {parsedSections['PRIORITY DIRECTIVE']}
              </p>
            </div>
          )}

          {/* PANEL 4: PHASE HEALTH CHECK */}
          {parsedSections['PHASE HEALTH CHECK'] && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.005)',
              border: `1px solid ${getHealthColor(parsedSections['PHASE HEALTH CHECK'])}`,
              borderLeft: `4px solid ${getHealthColor(parsedSections['PHASE HEALTH CHECK'])}`,
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: getHealthColor(parsedSections['PHASE HEALTH CHECK']),
                fontWeight: 'bold',
                letterSpacing: '0.05em'
              }}>
                // PHASE HEALTH CHECK
              </span>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6', color: 'var(--text-main)' }}>
                {parsedSections['PHASE HEALTH CHECK']}
              </p>
            </div>
          )}

          {/* PANEL 5: MORALE SIGNAL */}
          {parsedSections['MORALE SIGNAL'] && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.005)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderLeft: '4px solid rgba(255, 255, 255, 0.2)',
              padding: '14px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', fontWeight: 'bold', letterSpacing: '0.05em' }}>
                // MORALE SIGNAL
              </span>
              <p style={{ margin: 0, fontSize: '12px', lineHeight: '1.5', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                {parsedSections['MORALE SIGNAL']}
              </p>
            </div>
          )}

        </div>
      )}

      {/* PREVIOUS DEBRIEFS HISTORY FOLDERS */}
      <div style={{
        marginTop: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{
          fontSize: '11px',
          color: 'var(--text-muted)',
          fontWeight: 'bold',
          letterSpacing: '0.05em',
          borderBottom: '1px dashed var(--border-color)',
          paddingBottom: '6px'
        }}>
          // PREVIOUS OPERATIONS DEBRIEFS HISTORY (MAX 7 RECORDS)
        </div>

        {historyPruned.length === 0 ? (
          <div style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            fontStyle: 'italic',
            border: '1px dashed var(--border-color)',
            padding: '24px',
            textAlign: 'center'
          }}>
            No previous operations debrief summaries found in local terminal vaults.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {historyPruned.map((entry) => {
              const isExpanded = expandedHistoryDate === entry.date;
              return (
                <div
                  key={entry.date}
                  style={{
                    border: `1px solid ${isExpanded ? 'rgba(245, 166, 35, 0.4)' : 'var(--border-color)'}`,
                    background: isExpanded ? 'rgba(255, 255, 255, 0.005)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {/* History entry header clickable trigger */}
                  <div
                    onClick={() => setExpandedHistoryDate(isExpanded ? null : entry.date)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 18px',
                      cursor: 'pointer',
                      background: isExpanded ? 'rgba(245, 166, 35, 0.02)' : 'none',
                      userSelect: 'none'
                    }}
                  >
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: isExpanded ? 'var(--accent-amber)' : 'var(--text-main)'
                    }}>
                      📁 DEBRIEF // RECORD_DATE: {entry.date}
                    </span>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                        {isExpanded ? '[ CLOSE ]' : '[ EXPAND ]'}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {isExpanded ? '▼' : '►'}
                      </span>
                    </div>
                  </div>

                  {/* History content body */}
                  {isExpanded && (
                    <div style={{
                      padding: '16px 20px',
                      borderTop: '1px dashed var(--border-color)',
                      background: 'rgba(0, 0, 0, 0.2)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px'
                    }}>
                      {/* Clipboard copy helper for historical entry */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleCopyToClipboard(entry.content)}
                          className="dark-date-picker"
                          style={{
                            fontSize: '9px',
                            padding: '3px 8px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            textTransform: 'uppercase'
                          }}
                        >COPY RECORD</button>
                      </div>

                      <div style={{
                        whiteSpace: 'pre-wrap',
                        fontSize: '12px',
                        lineHeight: '1.6',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-main)',
                        opacity: 0.95
                      }}>
                        {entry.content}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
