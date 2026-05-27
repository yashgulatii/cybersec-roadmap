import { useState, useEffect, useMemo } from 'react';
import './index.css';
import { fetchFlavorRotation, fetchDailyDebrief } from './services/aiService';

const storage = typeof window !== 'undefined' && window.storage ? window.storage : localStorage;

let particleCounter = 0;

// Type A - 12 Fixed Daily Tasks
const FIXED_TASKS = [
  { id: 'fixed:morning_ritual', title: 'Morning ritual complete (no screen)', category: 'DISCIPLINE', xp: 25, stat: 'DISCIPLINE', bonus: 3 },
  { id: 'fixed:post_nap_exercise', title: 'Post-nap exercise done', category: 'PHYSICAL', xp: 30, stat: 'ENDURANCE', bonus: 4 },
  { id: 'fixed:evening_patrol', title: 'Evening patrol with friend (full hour)', category: 'SOCIAL', xp: 25, stat: 'DISCIPLINE', bonus: 3 },
  { id: 'fixed:after_action_report', title: 'After action report written', category: 'DISCIPLINE', xp: 20, stat: 'DISCIPLINE', bonus: 3 },
  { id: 'fixed:apply_roles', title: 'Apply to 5 roles (Naukri/LinkedIn)', category: 'OPS', xp: 75, stat: 'OPS', bonus: 8 },
  { id: 'fixed:cold_email', title: 'Cold email outreach (2 companies)', category: 'OPS', xp: 50, stat: 'OPS', bonus: 5 },
  { id: 'fixed:record_interview', title: 'Record yourself answering 1 interview Q', category: 'COMMS', xp: 40, stat: 'COMMS', bonus: 4 },
  { id: 'fixed:review_star', title: 'Review 1 STAR answer and refine it', category: 'COMMS', xp: 35, stat: 'COMMS', bonus: 3 },
  { id: 'fixed:update_linkedin', title: 'Update LinkedIn or resume if needed', category: 'OPS', xp: 25, stat: 'OPS', bonus: 2 },
  { id: 'fixed:read_article', title: 'Read 1 article: threat intel / AppSec / SOC', category: 'INTEL', xp: 30, stat: 'SIGINT', bonus: 3 },
  { id: 'fixed:drink_water', title: 'Drink 3L water', category: 'PHYSICAL', xp: 15, stat: 'ENDURANCE', bonus: 2 },
  { id: 'fixed:sleep_early', title: 'Sleep before 1AM', category: 'DISCIPLINE', xp: 20, stat: 'DISCIPLINE', bonus: 2 }
];

// Type B - 6 Progressive Chain Tasks
const CHAINS = {
  'Networking Fundamentals': [
    { title: 'Memorise top 25 ports (Groups 1–2)', category: 'ROADMAP', xp: 50, stat: 'SIGINT', bonus: 5 },
    { title: 'Memorise top 25 ports (Groups 3–4)', category: 'ROADMAP', xp: 50, stat: 'SIGINT', bonus: 5 },
    { title: 'OSI model: all 7 layers cold recall', category: 'ROADMAP', xp: 50, stat: 'SIGINT', bonus: 5 },
    { title: 'TCP/IP model vs OSI — where they differ', category: 'ROADMAP', xp: 45, stat: 'SIGINT', bonus: 4 },
    { title: 'Subnetting basics (CIDR, /24, /16)', category: 'ROADMAP', xp: 55, stat: 'SIGINT', bonus: 5 },
    { title: 'Nmap: basic scan types (-sS, -sV, -sC)', category: 'ROADMAP', xp: 60, stat: 'SIGINT', bonus: 6 },
    { title: 'Nmap: advanced (OS detect, scripts, timing)', category: 'ROADMAP', xp: 65, stat: 'SIGINT', bonus: 6 },
    { title: 'Wireshark: capture and filter basics', category: 'ROADMAP', xp: 60, stat: 'SIGINT', bonus: 6 },
    { title: 'DNS, DHCP, ARP — how each works', category: 'ROADMAP', xp: 55, stat: 'SIGINT', bonus: 5 },
    { title: 'HTTP vs HTTPS, TLS handshake', category: 'ROADMAP', xp: 55, stat: 'SIGINT', bonus: 5 }
  ],
  'Active Directory': [
    { title: 'AD concepts: Kerberos, LDAP, AD structure', category: 'ROADMAP', xp: 55, stat: 'SIGINT', bonus: 5 },
    { title: 'AD Lab: setup and domain join (2h session)', category: 'BUILD', xp: 70, stat: 'ARSENAL', bonus: 7 },
    { title: 'AD enumeration with BloodHound', category: 'LABS', xp: 70, stat: 'SIGINT', bonus: 7 },
    { title: 'Kerberoasting attack walkthrough', category: 'LABS', xp: 75, stat: 'SIGINT', bonus: 7 },
    { title: 'Pass-the-Hash and Pass-the-Ticket', category: 'LABS', xp: 75, stat: 'SIGINT', bonus: 7 },
    { title: 'AD privilege escalation paths', category: 'LABS', xp: 80, stat: 'SIGINT', bonus: 8 },
    { title: 'AD defence: what defenders look for', category: 'INTEL', xp: 65, stat: 'SIGINT', bonus: 6 }
  ],
  'Web AppSec': [
    { title: 'OWASP Top 10: read and summarise', category: 'ROADMAP', xp: 50, stat: 'SIGINT', bonus: 5 },
    { title: 'Burp Suite: intercept and repeat a request', category: 'LABS', xp: 55, stat: 'SIGINT', bonus: 5 },
    { title: 'PortSwigger: SQL Injection lab', category: 'LABS', xp: 60, stat: 'SIGINT', bonus: 6 },
    { title: 'PortSwigger: XSS lab', category: 'LABS', xp: 60, stat: 'SIGINT', bonus: 6 },
    { title: 'PortSwigger: IDOR lab', category: 'LABS', xp: 65, stat: 'SIGINT', bonus: 6 },
    { title: 'PortSwigger: SSRF lab', category: 'LABS', xp: 65, stat: 'SIGINT', bonus: 6 },
    { title: 'PortSwigger: Auth bypass lab', category: 'LABS', xp: 65, stat: 'SIGINT', bonus: 6 },
    { title: 'Write a 1-page VAPT mini-report on any finding', category: 'BUILD', xp: 75, stat: 'ARSENAL', bonus: 7 }
  ],
  'TryHackMe / Labs': [
    { title: 'Complete 1 THM room (any)', category: 'LABS', xp: 50, stat: 'SIGINT', bonus: 5 },
    { title: 'Complete another THM room or Hack The Box intro', category: 'LABS', xp: 55, stat: 'SIGINT', bonus: 5 },
    { title: 'Complete a TryHackMe learning path module', category: 'LABS', xp: 65, stat: 'SIGINT', bonus: 6 }
  ],
  'Interview Prep': [
    { title: 'Study 5 SOC analyst interview Qs', category: 'COMMS', xp: 45, stat: 'COMMS', bonus: 4 },
    { title: 'Study 5 AppSec interview Qs', category: 'COMMS', xp: 45, stat: 'COMMS', bonus: 4 },
    { title: 'Write STAR story: IDOR finding from your internship', category: 'COMMS', xp: 55, stat: 'COMMS', bonus: 5 },
    { title: 'Write STAR story: pick one offensive security tool you built', category: 'COMMS', xp: 55, stat: 'COMMS', bonus: 5 },
    { title: 'Mock interview: answer 3 Qs out loud, record', category: 'COMMS', xp: 60, stat: 'COMMS', bonus: 6 },
    { title: 'Review recording, write improvement notes', category: 'COMMS', xp: 40, stat: 'COMMS', bonus: 4 }
  ],
  'AD Attack & Detection Lab': [
    { title: 'AD Lab: setup and domain join (2h session)', category: 'BUILD', xp: 70, stat: 'ARSENAL', bonus: 7 },
    { title: 'AD enumeration with BloodHound', category: 'LABS', xp: 70, stat: 'SIGINT', bonus: 7 },
    { title: 'Kerberoasting attack walkthrough', category: 'LABS', xp: 75, stat: 'SIGINT', bonus: 7 },
    { title: 'Pass-the-Hash and Pass-the-Ticket', category: 'LABS', xp: 75, stat: 'SIGINT', bonus: 7 },
    { title: 'AD privilege escalation paths', category: 'LABS', xp: 80, stat: 'SIGINT', bonus: 8 },
    { title: 'Build a detection rule for one attack', category: 'BUILD', xp: 80, stat: 'ARSENAL', bonus: 8 },
    { title: 'Document findings in a lab report', category: 'BUILD', xp: 65, stat: 'ARSENAL', bonus: 6 }
  ]
};

// Existing 3 Project Board cards
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
  { time: '22:30', name: 'STAND DOWN', category: 'recovery', desc: 'Sleep', startMin: 1350, endMin: 1770 }
];

// Helper calculations for Date strings
const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getYesterdayString = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Day Transition & Initial Telemetry State Setup
const initializeTelemetry = () => {
  const today = getTodayString();
  const lastActiveDate = storage.getItem('operator_completion_date');
  
  let chainProgress = {
    'Networking Fundamentals': 0,
    'Active Directory': 0,
    'Web AppSec': 0,
    'TryHackMe / Labs': 0,
    'Interview Prep': 0,
    'AD Attack & Detection Lab': 0
  };
  
  const savedChainProg = storage.getItem('chainProgress');
  if (savedChainProg) {
    try {
      Object.assign(chainProgress, JSON.parse(savedChainProg));
    } catch (err) {
      console.error("Failed to parse chainProgress", err);
    }
  }

  // Detect day transition
  if (lastActiveDate && lastActiveDate !== today) {
    // Load yesterday's state
    const yesterdayStateKey = `state:${lastActiveDate}`;
    const yesterdayStateRaw = storage.getItem(yesterdayStateKey);
    let yesterdayCompletedTaskIds = [];
    if (yesterdayStateRaw) {
      try {
        const parsed = JSON.parse(yesterdayStateRaw);
        yesterdayCompletedTaskIds = parsed.completedTaskIds || [];
      } catch (err) {
        console.error("Failed to parse yesterday state", err);
      }
    }

    // Retrieve yesterday's completion timestamps
    const yesterdayTimesKey = `completion_times:${lastActiveDate}`;
    const yesterdayTimesRaw = storage.getItem(yesterdayTimesKey);
    let yesterdayTimes = {};
    if (yesterdayTimesRaw) {
      try {
        yesterdayTimes = JSON.parse(yesterdayTimesRaw);
      } catch (err) {
        console.error("Failed to parse yesterday completion times", err);
      }
    }

    const logEntries = [];
    
    // Process yesterday's fixed tasks (both completed and missed)
    FIXED_TASKS.forEach(task => {
      const isCompleted = yesterdayCompletedTaskIds.includes(task.id);
      const isMissedPenalized = !isCompleted && ['ROADMAP', 'COMMS', 'DISCIPLINE'].includes(task.category);
      logEntries.push({
        taskName: task.title,
        tag: task.category,
        xp: task.xp,
        completedAt: isCompleted ? (yesterdayTimes[task.id] || `${lastActiveDate}T12:00:00.000Z`) : null,
        type: isCompleted ? 'completed' : 'missed',
        ...(isMissedPenalized ? { xpPenalty: -Math.floor(task.xp * 0.5) } : {})
      });
    });

    // Process yesterday's completed chain tasks
    yesterdayCompletedTaskIds.forEach(id => {
      if (id.startsWith('chain:')) {
        const parts = id.split(':');
        if (parts.length === 3) {
          const chainName = parts[1];
          const stepIdx = parseInt(parts[2], 10);
          const chain = CHAINS[chainName];
          if (chain && chain[stepIdx]) {
            const stepTask = chain[stepIdx];
            logEntries.push({
              taskName: stepTask.title,
              tag: stepTask.category,
              xp: stepTask.xp,
              completedAt: yesterdayTimes[id] || `${lastActiveDate}T12:00:00.000Z`,
              type: 'completed'
            });
          }
        }
      }
    });

    // Save yesterday's log compile
    storage.setItem(`log:${lastActiveDate}`, JSON.stringify(logEntries));

    // Advance permanent chainProgress for steps completed yesterday
    Object.keys(CHAINS).forEach(chainName => {
      let currentP = chainProgress[chainName] || 0;
      let nextP = currentP;
      
      while (true) {
        const stepId = `chain:${chainName}:${nextP}`;
        if (yesterdayCompletedTaskIds.includes(stepId)) {
          nextP = nextP + 1; // ONLY moves forward, never resets/wraps
        } else {
          break;
        }
      }
      chainProgress[chainName] = nextP;
    });
    storage.setItem('chainProgress', JSON.stringify(chainProgress));

    // Clean up auxiliary yesterday times
    storage.removeItem(yesterdayTimesKey);
  }

  // Save last active date as today
  storage.setItem('operator_completion_date', today);

  // Initialize today's state
  let dailyState = { completedTaskIds: [], unlockedChainSteps: {} };
  const savedState = storage.getItem(`state:${today}`);
  if (savedState) {
    try {
      dailyState = JSON.parse(savedState);
    } catch (err) {
      console.error("Failed to parse today daily state", err);
    }
  } else {
    storage.setItem(`state:${today}`, JSON.stringify(dailyState));
  }

  return { dailyState, chainProgress };
};

export default function App() {
  const [activeTab, setActiveTab] = useState('missions');
  
  // Auth states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Synchronous loading checks
  const [isInitialLoading, setIsInitialLoading] = useState(() => {
    const savedPasscode = storage.getItem('operator_passcode');
    return !!savedPasscode;
  });
  const [syncLoading, setSyncLoading] = useState(false);

  // Profile state - load profile and correct streak synchronously on initialisation
  const [profile, setProfile] = useState(() => {
    const saved = storage.getItem('operator_profile');
    let loadedProfile = { level: 1, totalXp: 0, streak: 0, lastActiveDate: '' };
    if (saved) {
      try {
        loadedProfile = JSON.parse(saved);
      } catch (err) {
        console.error("Failed to parse operator profile", err);
      }
    }

    const today = getTodayString();
    const yesterday = getYesterdayString();
    const lastActive = loadedProfile.lastActiveDate;

    if (lastActive) {
      if (lastActive === today || lastActive === yesterday) {
        // Streak is maintained
      } else {
        loadedProfile.streak = 0;
      }
    } else {
      loadedProfile.streak = 0;
    }

    storage.setItem('operator_profile', JSON.stringify(loadedProfile));
    return loadedProfile;
  });

  // Run day transition & state initialization synchronously
  const telemetry = useMemo(() => initializeTelemetry(), []);

  // Today's daily state
  const [dailyState, setDailyState] = useState(telemetry.dailyState);
  
  // Permanent chain step progress
  const [chainProgress, setChainProgress] = useState(telemetry.chainProgress);
  
  // Particle effects for checked item XP gains
  const [particles, setParticles] = useState([]);

  // Controls flash animations of newly unlocked tasks
  const [justUnlockedStepId, setJustUnlockedStepId] = useState('');

  // Logs expansion controls
  const [isLogsExpanded, setIsLogsExpanded] = useState(true);

  // Selected date picker lookup state (default to yesterday)
  const [lookupDate, setLookupDate] = useState(getYesterdayString());

  // Active schedule index
  const [activeBlockIndex, setActiveBlockIndex] = useState(-1);

  // Daily Flavor Rotation (AI-Powered) state
  const [flavors, setFlavors] = useState({});
  const [isFlavorLoading, setIsFlavorLoading] = useState(false);
  const [unlockedTasks, setUnlockedTasks] = useState([]);

  // Missed task penalty banner state
  const [showPenaltyBanner, setShowPenaltyBanner] = useState(() => {
    const today = getTodayString();
    const dismissed = storage.getItem(`dismissed_banner:${today}`);
    if (dismissed === 'true') return false;

    const yesterday = getYesterdayString();
    const yesterdayLogsRaw = storage.getItem(`log:${yesterday}`);
    if (yesterdayLogsRaw) {
      try {
        const logs = JSON.parse(yesterdayLogsRaw);
        return logs.some(log => log.type === 'missed' && log.xpPenalty && log.xpPenalty < 0);
      } catch {
        return false;
      }
    }
    return false;
  });

  // End of Day AI Debrief states
  const [isDayClosed, setIsDayClosed] = useState(() => {
    const today = getTodayString();
    return storage.getItem(`dayClosed:${today}`) === 'true';
  });
  const [showDebriefModal, setShowDebriefModal] = useState(false);
  const [debriefText, setDebriefText] = useState('');
  const [debriefLoading, setDebriefLoading] = useState(false);
  const [debriefError, setDebriefError] = useState(false);
  const [isDebriefExpanded, setIsDebriefExpanded] = useState(false);

  // Reset collapsible debrief when lookup date changes
  useEffect(() => {
    setIsDebriefExpanded(false);
  }, [lookupDate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const today = getTodayString();
    const stored = storage.getItem(`flavor:${today}`);
    
    let hasValidStored = false;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          setFlavors(parsed);
          hasValidStored = true;
        } else {
          throw new Error("Stored flavor cache is not a valid JSON object");
        }
      } catch (e) {
        console.error("Failed to parse stored flavors", e);
      }
    }

    if (!hasValidStored) {
      setIsFlavorLoading(true);
      const allTasks = [
        ...FIXED_TASKS.map(t => ({ id: t.id, name: t.title, tag: t.category })),
        ...Object.keys(CHAINS).flatMap(chainName => 
          CHAINS[chainName].map((task, stepIdx) => ({
            id: `chain:${chainName}:${stepIdx}`,
            name: task.title,
            tag: task.category
          }))
        )
      ];

      fetchFlavorRotation(allTasks)
        .then(result => {
          if (result && typeof result === 'object' && !Array.isArray(result)) {
            storage.setItem(`flavor:${today}`, JSON.stringify(result));
            setFlavors(result);
          } else {
            throw new Error("Invalid or empty flavor rotation response structure from worker");
          }
        })
        .catch(err => {
          console.error("Flavor rotation fetch failed:", err);
          setFlavors({});
        })
        .finally(() => {
          setIsFlavorLoading(false);
        });
    }
  }, [isAuthenticated]);

  // Push telemetry packages to Serverless KV Store
  const saveProgressToServer = (password, stateToday, prof, chainProg, timesToday) => {
    setSyncLoading(true);
    
    const allKeys = [];
    try {
      for (let i = 0; i < storage.length; i++) {
        allKeys.push(storage.key(i));
      }
    } catch {
      allKeys.push(...Object.keys(storage));
    }
    
    const logsToSync = {};
    const debriefsToSync = {};
    const dayClosedToSync = {};
    const flavorsToSync = {};

    allKeys.forEach(k => {
      if (k) {
        if (k.startsWith('log:')) {
          logsToSync[k] = storage.getItem(k);
        } else if (k.startsWith('debrief:')) {
          debriefsToSync[k] = storage.getItem(k);
        } else if (k.startsWith('dayClosed:')) {
          dayClosedToSync[k] = storage.getItem(k);
        } else if (k.startsWith('flavor:')) {
          flavorsToSync[k] = storage.getItem(k);
        }
      }
    });

    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: password,
        progress: {
          profile: prof,
          stateToday: stateToday,
          chainProgress: chainProg,
          completionTimesToday: timesToday,
          logs: logsToSync,
          debriefs: debriefsToSync,
          dayClosed: dayClosedToSync,
          flavors: flavorsToSync
        }
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        console.log("Telemetry successfully synchronized to Cloudflare KV.");
      }
    })
    .catch(err => console.error("Telemetry sync error", err))
    .finally(() => {
      setSyncLoading(false);
    });
  };

  // Pull Telemetry progress package from Serverless KV Store
  const fetchRemoteProgress = (password) => {
    fetch('/api/progress')
      .then(res => res.json())
      .then(data => {
        if (data.progress) {
          const remoteData = data.progress;
          const today = getTodayString();
          const yesterday = getYesterdayString();
          
          let resolvedProfile = { level: 1, totalXp: 0, streak: 0, lastActiveDate: '' };
          if (remoteData.profile) {
            resolvedProfile = { ...remoteData.profile };
            const lastActive = resolvedProfile.lastActiveDate;
            if (lastActive) {
              if (lastActive === today || lastActive === yesterday) {
                // Streak is maintained
              } else {
                resolvedProfile.streak = 0;
              }
            } else {
              resolvedProfile.streak = 0;
            }
          }
          
          // Restore today's daily state
          let resolvedState = { completedTaskIds: [], unlockedChainSteps: {} };
          if (remoteData.profile && remoteData.profile.lastActiveDate === today) {
            if (remoteData.stateToday) {
              resolvedState = remoteData.stateToday;
            }
          }
          
          // Restore chainProgress
          let resolvedChainProgress = {
            'Networking Fundamentals': 0,
            'Active Directory': 0,
            'Web AppSec': 0,
            'TryHackMe / Labs': 0,
            'Interview Prep': 0,
            'AD Attack & Detection Lab': 0
          };
          
          let localChainProgress = {};
          const localSaved = storage.getItem('chainProgress');
          if (localSaved) {
            try {
              localChainProgress = JSON.parse(localSaved);
            } catch (e) {
              console.error("Failed to parse local chainProgress", e);
            }
          }

          Object.keys(resolvedChainProgress).forEach(key => {
            const remoteVal = (remoteData.chainProgress && remoteData.chainProgress[key] !== undefined) ? remoteData.chainProgress[key] : 0;
            const localVal = localChainProgress[key] !== undefined ? localChainProgress[key] : 0;
            resolvedChainProgress[key] = Math.max(localVal, remoteVal);
          });
          
          // Restore completion times
          let resolvedCompletionTimes = {};
          if (remoteData.completionTimesToday) {
            resolvedCompletionTimes = remoteData.completionTimesToday;
          }
          storage.setItem(`completion_times:${today}`, JSON.stringify(resolvedCompletionTimes));
          
          // Restore logs
          if (remoteData.logs) {
            Object.keys(remoteData.logs).forEach(k => {
              storage.setItem(k, remoteData.logs[k]);
            });
          }

          // Restore debriefs
          if (remoteData.debriefs) {
            Object.keys(remoteData.debriefs).forEach(k => {
              storage.setItem(k, remoteData.debriefs[k]);
            });
          }

          // Restore dayClosed
          if (remoteData.dayClosed) {
            Object.keys(remoteData.dayClosed).forEach(k => {
              storage.setItem(k, remoteData.dayClosed[k]);
            });
          }

          // Restore flavors
          if (remoteData.flavors) {
            Object.keys(remoteData.flavors).forEach(k => {
              storage.setItem(k, remoteData.flavors[k]);
            });
          }
          
          setDailyState(resolvedState);
          storage.setItem(`state:${today}`, JSON.stringify(resolvedState));
          
          setChainProgress(resolvedChainProgress);
          storage.setItem('chainProgress', JSON.stringify(resolvedChainProgress));
          
          setProfile(resolvedProfile);
          storage.setItem('operator_profile', JSON.stringify(resolvedProfile));

          // Dynamically update closed and flavor states based on restored package
          const todayClosed = storage.getItem(`dayClosed:${today}`) === 'true';
          setIsDayClosed(todayClosed);

          const todayFlavorsRaw = storage.getItem(`flavor:${today}`);
          if (todayFlavorsRaw) {
            try {
              setFlavors(JSON.parse(todayFlavorsRaw));
            } catch {}
          }
        } else {
          // Push initial profile to Cloudflare KV if none exists yet
          saveProgressToServer(password, dailyState, profile, chainProgress, {});
        }
      })
      .catch(err => console.error("Could not fetch remote telemetry", err))
      .finally(() => {
        setIsInitialLoading(false);
      });
  };

  // Mount logic for user token authentication
  useEffect(() => {
    const savedPasscode = storage.getItem('operator_passcode');
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
          storage.removeItem('operator_passcode');
          setIsInitialLoading(false);
        }
      })
      .catch(err => {
        console.error("Mount auth verification failed", err);
        setIsInitialLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle End Shift and AI Debrief fetching
  const handleEndShift = async () => {
    const today = getTodayString();
    
    if (isDayClosed) {
      // Reopen stored debrief text
      const stored = storage.getItem(`debrief:${today}`);
      setDebriefText(stored || 'NO DEBRIEF DATA LOCATED.');
      setDebriefError(false);
      setDebriefLoading(false);
      setShowDebriefModal(true);
      return;
    }

    // Collect today's performance state
    const completedTasks = [];
    const missedFixedTasks = [];
    let totalXpEarned = 0;

    dailyState.completedTaskIds.forEach(id => {
      if (id.startsWith('chain:')) {
        const parts = id.split(':');
        if (parts.length === 3) {
          const chainName = parts[1];
          const stepIdx = parseInt(parts[2], 10);
          const chain = CHAINS[chainName];
          if (chain && chain[stepIdx]) {
            const task = chain[stepIdx];
            completedTasks.push(task.title);
            totalXpEarned += task.xp;
          }
        }
      } else {
        const task = FIXED_TASKS.find(t => t.id === id);
        if (task) {
          completedTasks.push(task.title);
          totalXpEarned += task.xp;
        }
      }
    });

    FIXED_TASKS.forEach(task => {
      const isCompleted = dailyState.completedTaskIds.includes(task.id);
      if (!isCompleted) {
        missedFixedTasks.push(task.title);
        const isMissedPenalized = ['ROADMAP', 'COMMS', 'DISCIPLINE'].includes(task.category);
        if (isMissedPenalized) {
          totalXpEarned -= Math.floor(task.xp * 0.5);
        }
      }
    });

    const chainPositions = {};
    Object.keys(CHAINS).forEach(chainName => {
      chainPositions[chainName] = chainProgress[chainName];
    });

    const payload = {
      completed: completedTasks,
      missed: missedFixedTasks,
      xpEarned: totalXpEarned,
      chainProgress
    };

    try {
      setDebriefText('> CONTACTING COMMANDER...');
      setDebriefLoading(true);
      setDebriefError(false);
      setShowDebriefModal(true);

      const debriefResult = await fetchDailyDebrief(payload);
      setDebriefText(debriefResult);
    } catch (err) {
      console.error(err);
      setDebriefError(true);
    } finally {
      setDebriefLoading(false);
    }
  };

  const closeDebriefModal = () => {
    setShowDebriefModal(false);
    if (!isDayClosed) {
      const today = getTodayString();
      const logEntries = [];

      // Process today's fixed tasks (both completed and missed)
      FIXED_TASKS.forEach(task => {
        const isCompleted = dailyState.completedTaskIds.includes(task.id);
        const isMissedPenalized = !isCompleted && ['ROADMAP', 'COMMS', 'DISCIPLINE'].includes(task.category);
        
        logEntries.push({
          taskName: task.title,
          tag: task.category,
          xp: task.xp,
          completedAt: isCompleted ? (storage.getItem(`completion_times:${today}`) ? JSON.parse(storage.getItem(`completion_times:${today}`))[task.id] || new Date().toISOString() : new Date().toISOString()) : null,
          type: isCompleted ? 'completed' : 'missed',
          ...(isMissedPenalized ? { xpPenalty: -Math.floor(task.xp * 0.5) } : {})
        });
      });

      // Process today's completed chain tasks
      dailyState.completedTaskIds.forEach(id => {
        if (id.startsWith('chain:')) {
          const parts = id.split(':');
          if (parts.length === 3) {
            const chainName = parts[1];
            const stepIdx = parseInt(parts[2], 10);
            const chain = CHAINS[chainName];
            if (chain && chain[stepIdx]) {
              const stepTask = chain[stepIdx];
              logEntries.push({
                taskName: stepTask.title,
                tag: stepTask.category,
                xp: stepTask.xp,
                completedAt: storage.getItem(`completion_times:${today}`) ? JSON.parse(storage.getItem(`completion_times:${today}`))[id] || new Date().toISOString() : new Date().toISOString(),
                type: 'completed'
              });
            }
          }
        }
      });

      // Save today's log compile
      storage.setItem(`log:${today}`, JSON.stringify(logEntries));
      storage.setItem(`debrief:${today}`, debriefText);
      storage.setItem(`dayClosed:${today}`, 'true');
      setIsDayClosed(true);

      // Also trigger a KV sync to backup today's new logs and closure status
      const activePasscode = passcode || storage.getItem('operator_passcode');
      if (activePasscode) {
        saveProgressToServer(activePasscode, dailyState, profile, chainProgress, storage.getItem(`completion_times:${today}`) ? JSON.parse(storage.getItem(`completion_times:${today}`)) : {});
      }
    }
  };

  // Login handler
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
        storage.setItem('operator_passcode', passcode);
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

  // Clear newly unlocked step flash timer
  useEffect(() => {
    if (justUnlockedStepId) {
      const timer = setTimeout(() => {
        setJustUnlockedStepId('');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [justUnlockedStepId]);

  // Compute RPG stats dynamically based on daily completedTaskIds
  const computedStats = useMemo(() => {
    let sigintBonus = 0;
    let opsBonus = 0;
    let arsenalBonus = 0;
    let commsBonus = 0;
    let disciplineBonus = 0;
    let enduranceBonus = 0;

    const completedIds = dailyState.completedTaskIds || [];

    completedIds.forEach(id => {
      if (id.startsWith('chain:')) {
        const parts = id.split(':');
        if (parts.length === 3) {
          const chainName = parts[1];
          const stepIdx = parseInt(parts[2], 10);
          const chain = CHAINS[chainName];
          if (chain && chain[stepIdx]) {
            const m = chain[stepIdx];
            if (m.stat === 'SIGINT') sigintBonus += m.bonus || 0;
            if (m.stat === 'OPS') opsBonus += m.bonus || 0;
            if (m.stat === 'ARSENAL') arsenalBonus += m.bonus || 0;
            if (m.stat === 'COMMS') commsBonus += m.bonus || 0;
            if (m.stat === 'DISCIPLINE') disciplineBonus += m.bonus || 0;
            if (m.stat === 'ENDURANCE') enduranceBonus += m.bonus || 0;
          }
        }
      } else {
        const task = FIXED_TASKS.find(t => t.id === id);
        if (task) {
          if (task.stat === 'SIGINT') sigintBonus += task.bonus || 0;
          if (task.stat === 'OPS') opsBonus += task.bonus || 0;
          if (task.stat === 'ARSENAL') arsenalBonus += task.bonus || 0;
          if (task.stat === 'COMMS') commsBonus += task.bonus || 0;
          if (task.stat === 'DISCIPLINE') disciplineBonus += task.bonus || 0;
          if (task.stat === 'ENDURANCE') enduranceBonus += task.bonus || 0;
        }
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
  }, [dailyState.completedTaskIds]);

  // Level computation from XP
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

  // Toggle mission completion for both type A and type B tasks
  const handleToggleMission = (taskId, xpReward, isChainTask, chainName, stepIdx, e) => {
    if (isDayClosed) return;
    const today = getTodayString();
    const yesterday = getYesterdayString();
    
    // Copy today's daily state values
    const stateKey = `state:${today}`;
    let currentCompletedIds = [...dailyState.completedTaskIds];
    let currentUnlockedSteps = { ...dailyState.unlockedChainSteps };
    
    const isCompleted = currentCompletedIds.includes(taskId);
    
    // Particles for XP gains
    if (!isCompleted && e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top;
      
      const newParticle = {
        id: ++particleCounter,
        xp: xpReward,
        x: x,
        y: y
      };
      setParticles(prev => [...prev, newParticle]);
      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== newParticle.id));
      }, 1000);
    }

    // Access completion times to store timestamps
    const timesKey = `completion_times:${today}`;
    let completionTimes = {};
    const savedTimes = storage.getItem(timesKey);
    if (savedTimes) {
      try {
        completionTimes = JSON.parse(savedTimes);
      } catch (err) {
        console.error("Failed to parse completion times", err);
      }
    }

    let netXpChange = 0;

    if (isChainTask) {
      if (!isCompleted) {
        // MARK PROGRESSIVE CHAIN TASK AS COMPLETED
        currentCompletedIds.push(taskId);
        
        // Unlock next step index
        const chainLength = CHAINS[chainName].length;
        const nextStepIdx = stepIdx + 1;
        if (nextStepIdx < chainLength) {
          currentUnlockedSteps[chainName] = nextStepIdx;
          const nextStepId = `chain:${chainName}:${nextStepIdx}`;
          setUnlockedTasks(prev => [...prev, nextStepId]);
          setJustUnlockedStepId(nextStepId);
        }
        
        completionTimes[taskId] = new Date().toISOString();
        netXpChange = xpReward;
      } else {
        // UNMARK PROGRESSIVE CHAIN TASK
        // Unmarking removes this step and any higher chain steps that have been checked
        const stepsToRemove = [];
        
        currentCompletedIds = currentCompletedIds.filter(id => {
          if (id.startsWith(`chain:${chainName}:`)) {
            const idx = parseInt(id.split(':')[2], 10);
            if (idx >= stepIdx) {
              stepsToRemove.push(id);
              return false;
            }
          }
          return true;
        });

        // Calculate XP deductions
        stepsToRemove.forEach(removedId => {
          const idx = parseInt(removedId.split(':')[2], 10);
          const stepTask = CHAINS[chainName][idx];
          if (stepTask) {
            netXpChange -= stepTask.xp;
          }
          delete completionTimes[removedId];
        });

        // Reset the unlocked step back to the one we just unchecked
        currentUnlockedSteps[chainName] = stepIdx;

        // Remove any higher unlocked tasks from session-only unlockedTasks
        setUnlockedTasks(prev => prev.filter(id => {
          if (id.startsWith(`chain:${chainName}:`)) {
            const idx = parseInt(id.split(':')[2], 10);
            return idx < stepIdx;
          }
          return true;
        }));
      }
    } else {
      // FIXED TASK TOGGLING
      if (!isCompleted) {
        currentCompletedIds.push(taskId);
        completionTimes[taskId] = new Date().toISOString();
        netXpChange = xpReward;
      } else {
        currentCompletedIds = currentCompletedIds.filter(id => id !== taskId);
        delete completionTimes[taskId];
        netXpChange = -xpReward;
      }
    }

    // Save state package to storage
    const updatedState = {
      completedTaskIds: currentCompletedIds,
      unlockedChainSteps: currentUnlockedSteps
    };
    setDailyState(updatedState);
    storage.setItem(stateKey, JSON.stringify(updatedState));
    storage.setItem(timesKey, JSON.stringify(completionTimes));

    // Update level, streak and total XP
    setProfile(prev => {
      const activeStateAfter = currentCompletedIds.length;
      let newTotalXp = prev.totalXp + netXpChange;
      if (newTotalXp < 0) newTotalXp = 0;

      let newStreak = prev.streak;
      let newLastActive = prev.lastActiveDate;

      if (activeStateAfter > 0 && (!prev.lastActiveDate || prev.lastActiveDate !== today)) {
        if (prev.lastActiveDate === yesterday) {
          newStreak = prev.streak + 1;
        } else {
          newStreak = 1;
        }
        newLastActive = today;
      } else if (activeStateAfter === 0 && prev.lastActiveDate === today) {
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

      storage.setItem('operator_profile', JSON.stringify(newProfile));
      
      // Synchronize changes to Cloudflare KV
      const activePasscode = passcode || storage.getItem('operator_passcode');
      if (activePasscode) {
        saveProgressToServer(activePasscode, updatedState, newProfile, chainProgress, completionTimes);
      }

      return newProfile;
    });
  };

  // Determine active & visible chain task steps dynamically based on starting perm steps
  const getVisibleChainSteps = (chainName) => {
    const chain = CHAINS[chainName];
    const currentIdx = chainProgress[chainName] !== undefined ? chainProgress[chainName] : 0;
    if (currentIdx >= chain.length) return [];
    
    const visible = [];
    const stepId = `chain:${chainName}:${currentIdx}`;
    visible.push({
      id: stepId,
      stepIdx: currentIdx,
      task: chain[currentIdx]
    });

    let nextIdx = currentIdx + 1;
    while (nextIdx < chain.length) {
      const nextStepId = `chain:${chainName}:${nextIdx}`;
      if (unlockedTasks.includes(nextStepId)) {
        visible.push({
          id: nextStepId,
          stepIdx: nextIdx,
          task: chain[nextIdx]
        });
        nextIdx++;
      } else {
        break;
      }
    }
    
    return visible;
  };

  const DAILY_OPS_FIXED_TASKS = useMemo(() => {
    return FIXED_TASKS.filter(t => t.category !== 'PHYSICAL' && t.category !== 'DISCIPLINE');
  }, []);

  const SIDE_OPS_FIXED_TASKS = useMemo(() => {
    return FIXED_TASKS.filter(t => t.category === 'PHYSICAL' || t.category === 'DISCIPLINE');
  }, []);

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
            {isFlavorLoading && (
              <span style={{ fontSize: '11px', color: 'var(--accent-amber)', marginLeft: '15px', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
                [ LOADING MISSION BRIEFING... ]
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              onClick={handleEndShift}
              className="end-shift-btn"
              style={{
                background: 'var(--bg-terminal)',
                border: '1px solid var(--accent-amber)',
                color: 'var(--accent-amber)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                fontWeight: 'bold',
                padding: '4px 12px',
                cursor: 'pointer',
                boxShadow: '0 0 5px rgba(245, 166, 35, 0.2)',
                transition: 'all 0.2s',
                textTransform: 'uppercase'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--accent-amber)';
                e.currentTarget.style.color = 'var(--bg-terminal)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-terminal)';
                e.currentTarget.style.color = 'var(--accent-amber)';
              }}
            >
              {isDayClosed ? '[ VIEW DEBRIEF ]' : '[ END SHIFT ]'}
            </button>
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

      {/* Missed Task Penalty Warning Banner */}
      {showPenaltyBanner && (() => {
        const yesterday = getYesterdayString();
        const yesterdayLogsRaw = storage.getItem(`log:${yesterday}`);
        let missedPenalizedCount = 0;
        let totalPenalty = 0;
        if (yesterdayLogsRaw) {
          try {
            const logs = JSON.parse(yesterdayLogsRaw);
            logs.forEach(log => {
              if (log.type === 'missed' && log.xpPenalty && log.xpPenalty < 0) {
                missedPenalizedCount++;
                totalPenalty += Math.abs(log.xpPenalty);
              }
            });
          } catch {}
        }

        if (missedPenalizedCount === 0) return null;

        return (
          <div style={{
            background: 'rgba(255, 111, 97, 0.1)',
            border: '1px solid var(--accent-coral)',
            color: 'var(--accent-coral)',
            padding: '12px 16px',
            marginBottom: '20px',
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 0 10px rgba(255, 111, 97, 0.15)',
            textShadow: '0 0 4px rgba(255, 111, 97, 0.4)'
          }}>
            <span>
              ⚠ YESTERDAY YOU WENT DARK ON {missedPenalizedCount} MISSIONS — {totalPenalty} XP LOST
            </span>
            <button 
              onClick={() => {
                const today = getTodayString();
                storage.setItem(`dismissed_banner:${today}`, 'true');
                setShowPenaltyBanner(false);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-coral)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontWeight: 'bold',
                fontSize: '16px',
                marginLeft: '12px'
              }}
            >
              [X]
            </button>
          </div>
        );
      })()}

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

            {/* DAILY OPS Grid */}
            <section className="daily-ops-section">
              <h2 className="panel-title">Daily Ops</h2>
              <hr className="section-divider" />
              <div className="missions-grid">
                {/* Render Type A - Non-physical/non-discipline fixed daily tasks */}
                {DAILY_OPS_FIXED_TASKS.map(task => {
                  const isCompleted = dailyState.completedTaskIds.includes(task.id);
                  const displayTitle = flavors[task.id]?.title ?? task.name ?? task.title;
                  const briefing = flavors[task.id]?.briefing;
                  return (
                    <div 
                      key={task.id} 
                      className={`mission-card ${isCompleted ? 'completed' : ''}`}
                      onClick={(e) => handleToggleMission(task.id, task.xp, false, null, null, e)}
                    >
                      <div className="checkbox-container">
                        <span className="checkmark-icon"></span>
                      </div>
                      <div className="mission-details">
                        <span className="mission-title">{displayTitle}</span>
                        {briefing && (
                          <span className="mission-briefing" style={{ 
                            display: 'block', 
                            fontSize: '11px', 
                            color: 'var(--text-muted)', 
                            marginTop: '2px', 
                            fontFamily: 'var(--font-mono)' 
                          }}>
                            {briefing}
                          </span>
                        )}
                        <div className="mission-meta">
                          <span className={`badge badge-${task.category.toLowerCase()}`}>{task.category}</span>
                          <span className="xp-reward">+{task.xp} XP</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Render Type B - Active and Completed Progressive Chain tasks */}
                {Object.keys(CHAINS).map(chainName => {
                  const visibleSteps = getVisibleChainSteps(chainName);
                  return visibleSteps.map(({ id, stepIdx, task }) => {
                    const isCompleted = dailyState.completedTaskIds.includes(id);
                    const isJustUnlocked = justUnlockedStepId === id;
                    const displayTitle = flavors[id]?.title ?? task.name ?? task.title;
                    const briefing = flavors[id]?.briefing;
                    return (
                      <div 
                        key={id} 
                        className={`mission-card ${isCompleted ? 'completed' : ''} ${isJustUnlocked ? 'unlocked-flash' : ''}`}
                        onClick={(e) => handleToggleMission(id, task.xp, true, chainName, stepIdx, e)}
                      >
                        <div className="checkbox-container">
                          <span className="checkmark-icon"></span>
                        </div>
                        <div className="mission-details">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                            <span className="mission-title">{displayTitle}</span>
                            {isJustUnlocked && (
                              <span style={{ 
                                fontSize: '10px', 
                                fontFamily: 'var(--font-mono)', 
                                color: 'var(--accent-green)', 
                                border: '1px solid var(--accent-green)', 
                                padding: '0 4px', 
                                marginLeft: '8px',
                                textShadow: '0 0 4px rgba(34, 197, 94, 0.4)',
                                whiteSpace: 'nowrap'
                              }}>
                                UNLOCKED
                              </span>
                            )}
                          </div>
                          {briefing && (
                            <span className="mission-briefing" style={{ 
                              display: 'block', 
                              fontSize: '11px', 
                              color: 'var(--text-muted)', 
                              marginTop: '2px', 
                              fontFamily: 'var(--font-mono)' 
                            }}>
                              {briefing}
                            </span>
                          )}
                          <div className="mission-meta">
                            <span className={`badge badge-${task.category.toLowerCase()}`}>{task.category}</span>
                            <span className="xp-reward">+{task.xp} XP</span>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })}
              </div>
            </section>

            {/* SIDE OPS section */}
            <section className="side-ops-section">
              <h2 className="panel-title">Side Ops</h2>
              <hr className="section-divider" />
              <div className="missions-grid">
                {/* Render Type A - Physical and Discipline fixed daily tasks */}
                {SIDE_OPS_FIXED_TASKS.map(task => {
                  const isCompleted = dailyState.completedTaskIds.includes(task.id);
                  const displayTitle = flavors[task.id]?.title ?? task.name ?? task.title;
                  const briefing = flavors[task.id]?.briefing;
                  return (
                    <div 
                      key={task.id} 
                      className={`mission-card ${isCompleted ? 'completed' : ''}`}
                      onClick={(e) => handleToggleMission(task.id, task.xp, false, null, null, e)}
                    >
                      <div className="checkbox-container">
                        <span className="checkmark-icon"></span>
                      </div>
                      <div className="mission-details">
                        <span className="mission-title">{displayTitle}</span>
                        {briefing && (
                          <span className="mission-briefing" style={{ 
                            display: 'block', 
                            fontSize: '11px', 
                            color: 'var(--text-muted)', 
                            marginTop: '2px', 
                            fontFamily: 'var(--font-mono)' 
                          }}>
                            {briefing}
                          </span>
                        )}
                        <div className="mission-meta">
                          <span className={`badge badge-${task.category.toLowerCase()}`}>{task.category}</span>
                          <span className="xp-reward">+{task.xp} XP</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* COLLAPSIBLE MISSION LOGS */}
            <section className="mission-logs-section">
              <div 
                className="panel-title-clickable" 
                onClick={() => setIsLogsExpanded(!isLogsExpanded)} 
                style={{ 
                  cursor: 'pointer', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  userSelect: 'none'
                }}
              >
                <h2 className="panel-title" style={{ margin: 0 }}>📊 MISSION LOGS</h2>
                <span 
                  className="collapse-arrow" 
                  style={{ 
                    color: 'var(--accent-amber)', 
                    fontFamily: 'var(--font-mono)', 
                    fontSize: '13px',
                    letterSpacing: '0.05em'
                  }}
                >
                  {isLogsExpanded ? '[ COLLAPSE - ]' : '[ EXPAND + ]'}
                </span>
              </div>
              <hr className="section-divider" />
              
              {isLogsExpanded && (
                <div className="logs-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Date picker lookup */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--text-muted)' }}>
                      LOOKUP DATE:
                    </span>
                    <input 
                      type="date" 
                      className="dark-date-picker" 
                      value={lookupDate} 
                      onChange={(e) => setLookupDate(e.target.value)}
                    />
                  </div>

                  {(() => {
                    const savedLogsRaw = storage.getItem(`log:${lookupDate}`);
                    if (!savedLogsRaw) {
                      return (
                        <div 
                          className="empty-logs-msg" 
                          style={{ 
                            padding: '24px', 
                            border: '1px dashed var(--border-color)', 
                            color: 'var(--text-muted)', 
                            fontFamily: 'var(--font-mono)', 
                            fontSize: '13px', 
                            textAlign: 'center',
                            background: 'rgba(0, 0, 0, 0.2)'
                          }}
                        >
                          NO DATA FOR THIS DATE
                        </div>
                      );
                    }

                    try {
                      const dayLogs = JSON.parse(savedLogsRaw);
                      if (!dayLogs || dayLogs.length === 0) {
                        return (
                          <div 
                            className="empty-logs-msg" 
                            style={{ 
                              padding: '24px', 
                              border: '1px dashed var(--border-color)', 
                              color: 'var(--text-muted)', 
                              fontFamily: 'var(--font-mono)', 
                              fontSize: '13px', 
                              textAlign: 'center',
                              background: 'rgba(0, 0, 0, 0.2)'
                            }}
                          >
                            NO DATA FOR THIS DATE
                          </div>
                        );
                      }

                      const completedLogs = dayLogs.filter(l => l.type === 'completed');
                      const missedLogs = dayLogs.filter(l => l.type === 'missed');
                      const totalXp = completedLogs.reduce((sum, log) => sum + (log.xp || 0), 0) +
                                      missedLogs.reduce((sum, log) => sum + (log.xpPenalty || 0), 0);

                      const storedDebrief = storage.getItem(`debrief:${lookupDate}`);

                      return (
                        <div 
                          className="day-logs-card" 
                          style={{ 
                            background: 'var(--bg-card)', 
                            border: '1px solid var(--border-color)', 
                            padding: '16px',
                            position: 'relative'
                          }}
                        >
                          <div 
                            className="day-logs-header" 
                            style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center', 
                              marginBottom: '12px', 
                              borderBottom: '1px dashed var(--border-color)', 
                              paddingBottom: '8px' 
                            }}
                          >
                            <span 
                              className="day-date" 
                              style={{ 
                                fontFamily: 'var(--font-mono)', 
                                fontSize: '14px', 
                                color: 'var(--accent-amber)', 
                                fontWeight: 'bold' 
                              }}
                            >
                              📅 LOG_DATE: {lookupDate}
                            </span>
                            <span 
                              className="day-total-xp" 
                              style={{ 
                                fontFamily: 'var(--font-mono)', 
                                fontSize: '13px', 
                                color: 'var(--accent-green)', 
                                fontWeight: 'bold' 
                              }}
                            >
                              +{totalXp} XP EARNED
                            </span>
                          </div>

                          <div 
                            className="day-logs-list" 
                            style={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              gap: '8px',
                              marginBottom: '16px'
                            }}
                          >
                            {/* Render Completed Tasks */}
                            {completedLogs.map((log, idx) => {
                              const logTime = new Date(log.completedAt);
                              const formattedTime = !isNaN(logTime.getTime()) 
                                ? `${String(logTime.getHours()).padStart(2, '0')}:${String(logTime.getMinutes()).padStart(2, '0')}`
                                : '--:--';
                              return (
                                <div 
                                  key={`comp-${idx}`} 
                                  className="log-entry-row" 
                                  style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    padding: '6px 10px', 
                                    background: 'rgba(34, 197, 94, 0.02)', 
                                    border: '1px solid rgba(34, 197, 94, 0.1)',
                                    borderLeft: '3px solid var(--accent-green)'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                                    <span 
                                      className={`badge badge-${(log.tag || '').toLowerCase()}`} 
                                      style={{ 
                                        fontSize: '9px', 
                                        padding: '1px 5px',
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      {log.tag}
                                    </span>
                                    <span 
                                      className="log-entry-name" 
                                      style={{ 
                                        fontSize: '13px', 
                                        color: 'var(--text-main)',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                      }}
                                    >
                                      {log.taskName}
                                    </span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                                    <span 
                                      className="log-entry-xp" 
                                      style={{ 
                                        color: 'var(--accent-green)', 
                                        fontFamily: 'var(--font-mono)', 
                                        fontSize: '12px', 
                                        fontWeight: 'bold' 
                                      }}
                                    >
                                      +{log.xp} XP
                                    </span>
                                    <span 
                                      className="log-entry-time" 
                                      style={{ 
                                        color: 'var(--text-muted)', 
                                        fontFamily: 'var(--font-mono)', 
                                        fontSize: '11px' 
                                      }}
                                    >
                                      [{formattedTime}]
                                    </span>
                                  </div>
                                </div>
                              );
                            })}

                            {/* Render Missed Fixed Tasks */}
                            {missedLogs.map((log, idx) => {
                              return (
                                <div 
                                  key={`missed-${idx}`} 
                                  className="log-entry-row" 
                                  style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    padding: '6px 10px', 
                                    background: 'rgba(255, 111, 97, 0.02)', 
                                    border: '1px solid rgba(255, 111, 97, 0.05)',
                                    borderLeft: '3px solid var(--accent-coral)',
                                    opacity: 0.6
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                                    <span 
                                      className={`badge badge-${(log.tag || '').toLowerCase()}`} 
                                      style={{ 
                                        fontSize: '9px', 
                                        padding: '1px 5px',
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      {log.tag}
                                    </span>
                                    <span 
                                      className="log-entry-name" 
                                      style={{ 
                                        fontSize: '13px', 
                                        color: 'var(--text-muted)',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                      }}
                                    >
                                      {log.taskName}
                                    </span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                                    <span 
                                      className="log-entry-xp" 
                                      style={{ 
                                        color: 'var(--accent-coral)', 
                                        fontFamily: 'var(--font-mono)', 
                                        fontSize: '11px', 
                                        fontWeight: 'bold' 
                                      }}
                                    >
                                      MISSED {log.xpPenalty ? `(${log.xpPenalty} XP)` : ''}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {storedDebrief && (
                            <div className="debrief-collapsible" style={{ marginBottom: '16px' }}>
                              <button 
                                onClick={() => setIsDebriefExpanded(!isDebriefExpanded)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--accent-amber)',
                                  fontFamily: 'var(--font-mono)',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  padding: '4px 0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  width: '100%',
                                  textAlign: 'left'
                                }}
                              >
                                <span>{isDebriefExpanded ? '▼' : '►'} COMMANDER'S DEBRIEF</span>
                              </button>
                              
                              {isDebriefExpanded && (
                                <div style={{
                                  background: 'rgba(245, 166, 35, 0.02)',
                                  borderLeft: '2px solid var(--accent-amber)',
                                  padding: '10px 14px',
                                  marginTop: '6px',
                                  fontFamily: 'var(--font-mono)',
                                  fontSize: '12px',
                                  color: 'var(--accent-amber)',
                                  whiteSpace: 'pre-wrap',
                                  lineHeight: '1.5'
                                }}>
                                  {storedDebrief}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Stats line */}
                          <div 
                            style={{ 
                              fontFamily: 'var(--font-mono)', 
                              fontSize: '13px', 
                              color: 'var(--text-muted)',
                              textAlign: 'right',
                              borderTop: '1px dashed var(--border-color)',
                              paddingTop: '8px'
                            }}
                          >
                            STATS: <span style={{ color: 'var(--accent-green)' }}>{completedLogs.length} COMPLETED</span> / <span style={{ color: 'var(--accent-coral)' }}>{missedLogs.length} MISSED</span> / <span style={{ color: 'var(--accent-amber)' }}>{totalXp} XP EARNED</span>
                          </div>

                        </div>
                      );
                    } catch (err) {
                      console.error("Failed to parse day logs", err);
                      return (
                        <div 
                          className="empty-logs-msg" 
                          style={{ 
                            padding: '24px', 
                            border: '1px dashed var(--border-color)', 
                            color: 'var(--text-muted)', 
                            fontFamily: 'var(--font-mono)', 
                            fontSize: '13px', 
                            textAlign: 'center',
                            background: 'rgba(0, 0, 0, 0.2)'
                          }}
                        >
                          CORRUPT LOG DATA FOR THIS DATE
                        </div>
                      );
                    }
                  })()}

                </div>
              )}
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
                        <span className="stat-desc">— Active projects</span>
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

      {/* End of Day AI Debrief Modal */}
      {showDebriefModal && (
        <div className="debrief-modal-overlay" style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(7, 8, 10, 0.95)',
          zIndex: 100000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}>
          <div className="debrief-modal-box" style={{
            width: '100%',
            maxWidth: '600px',
            background: 'var(--bg-card)',
            border: '2px solid var(--accent-amber)',
            padding: '24px',
            boxShadow: '0 0 20px var(--accent-amber-glow)',
            fontFamily: 'var(--font-mono)',
            color: 'var(--accent-amber)',
            position: 'relative'
          }}>
            <div style={{
              borderBottom: '1px dashed var(--accent-amber)',
              paddingBottom: '12px',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontWeight: 'bold', fontSize: '16px', letterSpacing: '0.05em' }}>
                &gt; COMMANDER_DEBRIEF // TAC-NET
              </span>
              <span className="pulse-dot" style={{ width: '8px', height: '8px', background: 'var(--accent-amber)' }}></span>
            </div>

            {debriefLoading ? (
              <div style={{ padding: '40px 0', textAlign: 'center', fontSize: '14px', letterSpacing: '0.1em' }}>
                <span className="loading-blink">ESTABLISHING CONNECTION TO COMMAND...</span>
              </div>
            ) : debriefError ? (
              <div style={{ padding: '20px 0', color: 'var(--accent-coral)' }}>
                [!] COMMS ERROR: UNABLE TO CONTACT COMMANDER. SILENT GATEWAY.
              </div>
            ) : (
              <div style={{ 
                whiteSpace: 'pre-wrap', 
                fontSize: '13px', 
                lineHeight: '1.6', 
                maxHeight: '400px', 
                overflowY: 'auto',
                paddingRight: '10px'
              }}>
                {debriefText}
              </div>
            )}

            {!debriefLoading && (
              <div style={{
                marginTop: '24px',
                display: 'flex',
                justifyContent: 'flex-end',
                borderTop: '1px dashed var(--border-color)',
                paddingTop: '16px'
              }}>
                <button 
                  onClick={closeDebriefModal}
                  style={{
                    background: 'var(--bg-terminal)',
                    border: '1px solid var(--accent-amber)',
                    color: 'var(--accent-amber)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    padding: '6px 16px',
                    cursor: 'pointer',
                    textTransform: 'uppercase'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--accent-amber)';
                    e.currentTarget.style.color = 'var(--bg-terminal)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--bg-terminal)';
                    e.currentTarget.style.color = 'var(--accent-amber)';
                  }}
                >
                  [ DISMISS COMMS ]
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
