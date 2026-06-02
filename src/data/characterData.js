// src/data/characterData.js
// Purpose: Contains level limits, daily routine blocks, and statistics categories.

export const XP_PER_LEVEL = 200;

// ─── STAT CATEGORIES ──────────────────────────────────────────────────────────
// TECHNICAL added: all lab work, PortSwigger, AD attacks, Splunk, builds score here.
// Without it, your most job-relevant daily output had no stat to land in.
export const STAT_CATEGORIES = {
  DISCIPLINE: {
    name: 'Discipline',
    icon: '🧠',
    color: '#ff9f43',
    desc: 'Consistency, morning rituals, sleep, logs, after-action reports'
  },
  TECHNICAL: {
    name: 'Technical Ops',
    icon: '⚔️',
    color: '#00ff88',
    desc: 'Lab work, PortSwigger, AD attacks, Splunk, tool mastery, hands-on builds'
  },
  SIGINT: {
    name: 'Signal Intelligence',
    icon: '🛰️',
    color: '#00c8ff',
    desc: 'Technical reading, article summaries, threat intel research, writeup analysis'
  },
  ENDURANCE: {
    name: 'Endurance',
    icon: '🏃',
    color: '#ff6b6b',
    desc: 'Physical movement, sleep timing, diet, hydration'
  },
  OPS: {
    name: 'Operational Capacity',
    icon: '📁',
    color: '#e8d800',
    desc: 'Job applications, resumes, cold outreach, follow-ups'
  },
  COMMS: {
    name: 'Comms / Influence',
    icon: '🎙️',
    color: '#ff85e1',
    desc: 'Interview STAR answers, mock recordings, cold email quality'
  }
};

// ─── SCHEDULE BLOCKS ──────────────────────────────────────────────────────────
// CHANGE LOG:
// - APPLICATION OPS cut from 1h45m to 45min (14:15–15:00).
//   Reason: 5 quality cybersecurity apps/day do not exist. 3 targeted/week beats
//   35 spray-and-pray blasts. Reclaimed time goes to SECONDARY OPS.
// - SECONDARY OPS extended from 2h to 3h (15:00–18:00).
//   More time on PortSwigger, Splunk, bug bounty — the actual technical depth work.
// - All startMin/endMin values updated to match.

export const SCHEDULE_BLOCKS = [
  {
    time: '05:30',
    name: 'WAKE + RITUAL',
    category: 'recovery',
    desc: 'Bath · Surya · no screen',
    startMin: 330,
    endMin: 390,
    start: '05:30',
    end: '06:30',
    label: 'WAKE + RITUAL',
    type: 'recovery',
    description: 'Bath · Surya · no screen'
  },
  {
    time: '06:30',
    name: 'MORNING BRIEF',
    category: 'prep',
    desc: 'Review missions · 15 min',
    startMin: 390,
    endMin: 405,
    start: '06:30',
    end: '06:45',
    label: 'MORNING BRIEF',
    type: 'prep',
    description: 'Review missions · 15 min'
  },
  {
    time: '06:45',
    name: 'DEEP OPS',
    category: 'primary',
    desc: 'Roadmap theory · TryHackMe · 2h45m',
    startMin: 405,
    endMin: 570,
    start: '06:45',
    end: '09:30',
    label: 'DEEP OPS',
    type: 'primary',
    description: 'Roadmap theory · TryHackMe · 2h45m'
  },
  {
    time: '09:30',
    name: 'FIELD BREAK',
    category: 'rest',
    desc: 'Tea · stretch · away from screen',
    startMin: 570,
    endMin: 600,
    start: '09:30',
    end: '10:00',
    label: 'FIELD BREAK',
    type: 'rest',
    description: 'Tea · stretch · away from screen'
  },
  {
    time: '10:00',
    name: 'PROJECT BUILD',
    category: 'primary',
    desc: 'AD Lab · Threat Intel Engine · Cloud Scanner · 2h30m',
    startMin: 600,
    endMin: 750,
    start: '10:00',
    end: '12:30',
    label: 'PROJECT BUILD',
    type: 'primary',
    description: 'AD Lab · Threat Intel Engine · Cloud Scanner · 2h30m'
  },
  {
    time: '12:30',
    name: 'CHOW',
    category: 'recovery',
    desc: 'Lunch',
    startMin: 750,
    endMin: 780,
    start: '12:30',
    end: '13:00',
    label: 'CHOW',
    type: 'recovery',
    description: 'Lunch'
  },
  {
    time: '13:00',
    name: 'REST PHASE',
    category: 'recovery',
    desc: 'Power nap · 30 min',
    startMin: 780,
    endMin: 810,
    start: '13:00',
    end: '13:30',
    label: 'REST PHASE',
    type: 'recovery',
    description: 'Power nap · 30 min'
  },
  {
    time: '13:30',
    name: 'PHYSICAL TRAINING',
    category: 'sideop',
    desc: 'Exercise · 40 min',
    startMin: 810,
    endMin: 855,
    start: '13:30',
    end: '14:15',
    label: 'PHYSICAL TRAINING',
    type: 'sideop',
    description: 'Exercise · 40 min'
  },
  {
    // FIXED: was 14:15–16:00 (1h45m). Now 14:15–15:00 (45min).
    // 3 targeted, researched applications beats 5 untailored blasts every time.
    time: '14:15',
    name: 'APPLICATION OPS',
    category: 'primary',
    desc: 'Job apps · cold emails · tailored · 45min',
    startMin: 855,
    endMin: 900,
    start: '14:15',
    end: '15:00',
    label: 'APPLICATION OPS',
    type: 'primary',
    description: 'Job apps · cold emails · tailored · 45min'
  },
  {
    // FIXED: was 16:00–18:00 (2h). Now 15:00–18:00 (3h). Starts 1h earlier.
    // Extra hour reclaimed from APPLICATION OPS goes to actual technical depth.
    time: '15:00',
    name: 'SECONDARY OPS',
    category: 'secondary',
    desc: 'PortSwigger · Splunk · bug bounty · 3h',
    startMin: 900,
    endMin: 1080,
    start: '15:00',
    end: '18:00',
    label: 'SECONDARY OPS',
    type: 'secondary',
    description: 'PortSwigger · Splunk · bug bounty · 3h'
  },
  {
    time: '18:00',
    name: 'PATROL',
    category: 'sideop',
    desc: 'Walk with friend · 1–2 hours',
    startMin: 1080,
    endMin: 1200,
    start: '18:00',
    end: '20:00',
    label: 'PATROL',
    type: 'sideop',
    description: 'Walk with friend · 1–2 hours'
  },
  {
    time: '20:00',
    name: 'INTEL REVIEW',
    category: 'light',
    desc: 'Read · tech content · 1 hour',
    startMin: 1200,
    endMin: 1260,
    start: '20:00',
    end: '21:00',
    label: 'INTEL REVIEW',
    type: 'light',
    description: 'Read · tech content · 1 hour'
  },
  {
    time: '21:00',
    name: 'AFTER ACTION',
    category: 'prep',
    desc: 'Journal · plan tomorrow · 30 min',
    startMin: 1260,
    endMin: 1290,
    start: '21:00',
    end: '21:30',
    label: 'AFTER ACTION',
    type: 'prep',
    description: 'Journal · plan tomorrow · 30 min'
  },
  {
    time: '21:30',
    name: 'COMMS BLACKOUT',
    category: 'recovery',
    desc: 'No screens until sleep',
    startMin: 1290,
    endMin: 1350,
    start: '21:30',
    end: '22:30',
    label: 'COMMS BLACKOUT',
    type: 'recovery',
    description: 'No screens until sleep'
  },
  {
    time: '22:30',
    name: 'STAND DOWN',
    category: 'recovery',
    desc: 'Sleep · 7 hours',
    startMin: 1350,
    endMin: 1770,
    start: '22:30',
    end: '05:30',
    label: 'STAND DOWN',
    type: 'recovery',
    description: 'Sleep · 7 hours'
  }
];