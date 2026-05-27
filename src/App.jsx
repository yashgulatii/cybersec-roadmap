import { useState, useEffect, useMemo } from 'react';
import './index.css';
import { fetchFlavorRotation, fetchDailyDebrief, fetchWeeklyReview } from './services/aiService';

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
  'NETWORKING': [
    { title: 'Memorise top 25 ports (Groups 1–2)', category: 'ROADMAP', xp: 50 },
    { title: 'Memorise top 25 ports (Groups 3–4)', category: 'ROADMAP', xp: 50 },
    { title: 'OSI model: all 7 layers cold recall', category: 'ROADMAP', xp: 50 },
    { title: 'TCP/IP model vs OSI — differences', category: 'ROADMAP', xp: 45 },
    { title: 'Subnetting basics (CIDR, /24, /16)', category: 'ROADMAP', xp: 55 },
    { title: 'Nmap: basic scan types (-sS, -sV, -sC)', category: 'ROADMAP', xp: 60 },
    { title: 'Nmap: advanced (OS detect, scripts, timing)', category: 'ROADMAP', xp: 65 },
    { title: 'Wireshark: capture and filter basics', category: 'ROADMAP', xp: 60 },
    { title: 'DNS, DHCP, ARP — how each works', category: 'ROADMAP', xp: 55 },
    { title: 'HTTP vs HTTPS, TLS handshake', category: 'ROADMAP', xp: 55 }
  ],
  'LINUX': [
    { title: 'Linux file system structure (/, /etc, /var, /home)', category: 'ROADMAP', xp: 45 },
    { title: 'Core commands: ls, cd, chmod, chown, find, grep', category: 'ROADMAP', xp: 45 },
    { title: 'File permissions and ownership', category: 'ROADMAP', xp: 45 },
    { title: 'Process management: ps, top, kill, jobs', category: 'ROADMAP', xp: 45 },
    { title: 'Bash scripting: variables, loops, conditionals', category: 'ROADMAP', xp: 55 },
    { title: 'Network commands: netstat, ss, curl, wget, dig', category: 'ROADMAP', xp: 50 },
    { title: 'Log analysis: /var/log, journalctl, grep patterns', category: 'ROADMAP', xp: 55 },
    { title: 'Service management with systemctl', category: 'ROADMAP', xp: 50 },
    { title: 'SSH: key-based auth, config, tunneling', category: 'ROADMAP', xp: 55 },
    { title: 'Linux hardening basics: firewall, users, cron', category: 'ROADMAP', xp: 60 }
  ],
  'SOC OPERATIONS': [
    { title: 'SOC roles and responsibilities', category: 'ROADMAP', xp: 45 },
    { title: 'SIEM basics: what it does, key vendors (Splunk, QRadar)', category: 'ROADMAP', xp: 50 },
    { title: 'Log types: Windows Event, syslog, firewall logs', category: 'ROADMAP', xp: 50 },
    { title: 'Alert triage: P1/P2/P3 classification', category: 'ROADMAP', xp: 55 },
    { title: 'IOC vs IOA: understanding indicators', category: 'ROADMAP', xp: 50 },
    { title: 'Incident response: 6 phases', category: 'ROADMAP', xp: 55 },
    { title: 'Splunk: basic SPL search queries', category: 'LABS', xp: 65 },
    { title: 'Write a mock incident response report', category: 'BUILD', xp: 70 },
    { title: 'Threat hunting basics', category: 'ROADMAP', xp: 60 },
    { title: 'MITRE ATT&CK framework overview', category: 'ROADMAP', xp: 65 }
  ],
  'WEB SECURITY': [
    { title: 'OWASP Top 10: read and summarise', category: 'ROADMAP', xp: 50 },
    { title: 'Burp Suite: intercept and repeat a request', category: 'LABS', xp: 55 },
    { title: 'PortSwigger: SQL Injection lab', category: 'LABS', xp: 60 },
    { title: 'PortSwigger: XSS lab', category: 'LABS', xp: 60 },
    { title: 'PortSwigger: IDOR lab', category: 'LABS', xp: 65 },
    { title: 'PortSwigger: SSRF lab', category: 'LABS', xp: 65 },
    { title: 'PortSwigger: Auth bypass lab', category: 'LABS', xp: 65 },
    { title: 'Write a 1-page VAPT mini-report', category: 'BUILD', xp: 75 }
  ],
  'TOOLS MASTERY': [
    { title: 'Nmap: installation and basic scans', category: 'LABS', xp: 50 },
    { title: 'Nmap: scripts and advanced usage', category: 'LABS', xp: 55 },
    { title: 'Metasploit: basics and msfconsole', category: 'LABS', xp: 60 },
    { title: 'Burp Suite: intercept, repeat, intruder', category: 'LABS', xp: 60 },
    { title: 'Wireshark: capture filters and traffic analysis', category: 'LABS', xp: 60 },
    { title: 'BloodHound: setup and AD enumeration', category: 'LABS', xp: 65 },
    { title: 'Gobuster/ffuf: directory and subdomain fuzzing', category: 'LABS', xp: 65 },
    { title: 'Hydra: basic credential brute forcing', category: 'LABS', xp: 65 },
    { title: 'SQLmap: automated SQL injection', category: 'LABS', xp: 65 },
    { title: 'Hashcat: password hash cracking basics', category: 'LABS', xp: 65 }
  ],
  'ACTIVE DIRECTORY': [
    { title: 'AD concepts: Kerberos, LDAP, AD structure', category: 'ROADMAP', xp: 55 },
    { title: 'AD Lab: setup and domain join (2h session)', category: 'BUILD', xp: 70 },
    { title: 'AD enumeration with BloodHound', category: 'LABS', xp: 70 },
    { title: 'Kerberoasting attack walkthrough', category: 'LABS', xp: 75 },
    { title: 'Pass-the-Hash and Pass-the-Ticket', category: 'LABS', xp: 75 },
    { title: 'AD privilege escalation paths', category: 'LABS', xp: 80 },
    { title: 'Build a detection rule for one attack', category: 'BUILD', xp: 80 },
    { title: 'Document findings in a lab report', category: 'BUILD', xp: 65 }
  ],
  'INTERVIEW PREP': [
    { title: 'Study 5 SOC analyst interview Qs', category: 'COMMS', xp: 45 },
    { title: 'Study 5 AppSec interview Qs', category: 'COMMS', xp: 45 },
    { title: 'Write STAR story: IDOR finding from internship', category: 'COMMS', xp: 55 },
    { title: 'Write STAR story: one offensive security tool built', category: 'COMMS', xp: 55 },
    { title: 'Mock interview: answer 3 Qs out loud, record', category: 'COMMS', xp: 60 },
    { title: 'Review recording, write improvement notes', category: 'COMMS', xp: 40 }
  ],
  'THM / LABS': [
    { title: 'Complete 1 TryHackMe room', category: 'LABS', xp: 50 },
    { title: 'Complete 1 HackTheBox intro machine', category: 'LABS', xp: 55 },
    { title: 'Complete a TryHackMe learning path module', category: 'LABS', xp: 65 }
  ]
};

// Existing 3 Project Board cards
// Existing 3 Project Board cards
const PROJECTS = [
  {
    id: 'ad-lab',
    name: 'AD ATTACK & DETECTION LAB',
    status: 'ACTIVE',
    focus: 'Active Directory fundamentals — learning phase',
    dailyXP: 70,
    tasks: [
      // PHASE 1: SETUP
      { id: 'ad-01', phase: 'SETUP', name: 'Install VirtualBox and configure host network settings', xp: 40 },
      { id: 'ad-02', phase: 'SETUP', name: 'Download Windows Server 2019 ISO and create Domain Controller VM', xp: 45 },
      { id: 'ad-03', phase: 'SETUP', name: 'Install and configure Active Directory Domain Services on DC', xp: 55 },
      { id: 'ad-04', phase: 'SETUP', name: 'Create Windows 10 client VM and join it to the domain', xp: 50 },
      { id: 'ad-05', phase: 'SETUP', name: 'Create test AD users, groups, and OUs for lab scenarios', xp: 45 },
      // PHASE 2: ENUMERATION
      { id: 'ad-06', phase: 'ENUMERATION', name: 'Run SharpHound collector and import data into BloodHound', xp: 65 },
      { id: 'ad-07', phase: 'ENUMERATION', name: 'Identify shortest path to Domain Admin using BloodHound', xp: 65 },
      { id: 'ad-08', phase: 'ENUMERATION', name: 'Enumerate SPNs for Kerberoastable accounts manually', xp: 60 },
      // PHASE 3: ATTACKS
      { id: 'ad-09', phase: 'ATTACKS', name: 'Execute Kerberoasting and crack extracted hashes with Hashcat', xp: 75 },
      { id: 'ad-10', phase: 'ATTACKS', name: 'Execute AS-REP Roasting against accounts without pre-auth', xp: 75 },
      { id: 'ad-11', phase: 'ATTACKS', name: 'Perform Pass-the-Hash attack using Mimikatz', xp: 80 },
      { id: 'ad-12', phase: 'ATTACKS', name: 'Perform Pass-the-Ticket attack using stolen TGT', xp: 80 },
      { id: 'ad-13', phase: 'ATTACKS', name: 'Execute DCSync attack to dump all domain hashes', xp: 85 },
      { id: 'ad-14', phase: 'ATTACKS', name: 'Forge a Golden Ticket and verify persistence', xp: 85 },
      // PHASE 4: DETECTION
      { id: 'ad-15', phase: 'DETECTION', name: 'Enable advanced audit policies on Domain Controller', xp: 55 },
      { id: 'ad-16', phase: 'DETECTION', name: 'Install Splunk and configure Windows Event log forwarding', xp: 65 },
      { id: 'ad-17', phase: 'DETECTION', name: 'Write Splunk detection rule for Kerberoasting (Event ID 4769)', xp: 70 },
      { id: 'ad-18', phase: 'DETECTION', name: 'Write detection rule for Pass-the-Hash (Event ID 4624 Type 3)', xp: 70 },
      { id: 'ad-19', phase: 'DETECTION', name: 'Write detection rule for DCSync (Event ID 4662)', xp: 70 },
      { id: 'ad-20', phase: 'DETECTION', name: 'Test all detection rules against simulated attacks', xp: 75 },
      // PHASE 5: REPORT
      { id: 'ad-21', phase: 'REPORT', name: 'Document all attack paths with screenshots and commands used', xp: 65 },
      { id: 'ad-22', phase: 'REPORT', name: 'Write detection recommendations and remediation steps', xp: 60 },
      { id: 'ad-23', phase: 'REPORT', name: 'Produce final lab report (PDF format)', xp: 70 },
    ]
  },
  {
    id: 'threat-intel',
    name: 'THREAT INTEL CORRELATION ENGINE',
    status: 'QUEUED',
    focus: 'Design phase — architecture planning',
    dailyXP: 65,
    tasks: [
      // PHASE 1: DESIGN
      { id: 'ti-01', phase: 'DESIGN', name: 'Define system architecture and data flow diagram', xp: 45 },
      { id: 'ti-02', phase: 'DESIGN', name: 'Research threat intel APIs: VirusTotal, AbuseIPDB, Shodan', xp: 50 },
      { id: 'ti-03', phase: 'DESIGN', name: 'Design database schema for IOC storage and relationships', xp: 55 },
      { id: 'ti-04', phase: 'DESIGN', name: 'Write technical specification document', xp: 50 },
      // PHASE 2: BACKEND
      { id: 'ti-05', phase: 'BACKEND', name: 'Setup project structure with FastAPI and SQLite', xp: 50 },
      { id: 'ti-06', phase: 'BACKEND', name: 'Integrate VirusTotal API — IP, domain, and hash lookup', xp: 65 },
      { id: 'ti-07', phase: 'BACKEND', name: 'Integrate AbuseIPDB API for IP reputation scoring', xp: 60 },
      { id: 'ti-08', phase: 'BACKEND', name: 'Integrate Shodan API for host intelligence', xp: 60 },
      { id: 'ti-09', phase: 'BACKEND', name: 'Build IOC correlation engine — link related indicators', xp: 80 },
      { id: 'ti-10', phase: 'BACKEND', name: 'Build REST API endpoints for frontend consumption', xp: 65 },
      // PHASE 3: FRONTEND
      { id: 'ti-11', phase: 'FRONTEND', name: 'Build IOC search interface in React', xp: 60 },
      { id: 'ti-12', phase: 'FRONTEND', name: 'Build correlation graph visualization (D3.js or Recharts)', xp: 75 },
      { id: 'ti-13', phase: 'FRONTEND', name: 'Build threat report generation and export to PDF', xp: 70 },
      // PHASE 4: SHIP
      { id: 'ti-14', phase: 'SHIP', name: 'Write unit tests for correlation engine', xp: 60 },
      { id: 'ti-15', phase: 'SHIP', name: 'Containerize with Docker and write docker-compose', xp: 65 },
      { id: 'ti-16', phase: 'SHIP', name: 'Deploy to cloud and write README with demo screenshots', xp: 65 },
    ]
  },
  {
    id: 'cloud-scanner',
    name: 'CLOUD MISCONFIGURATION SCANNER (AWS/GCP)',
    status: 'QUEUED',
    focus: 'Research AWS IAM misconfig patterns',
    dailyXP: 65,
    tasks: [
      // PHASE 1: RESEARCH
      { id: 'cs-01', phase: 'RESEARCH', name: 'Study AWS IAM misconfig patterns: wildcard policies, privilege escalation', xp: 55 },
      { id: 'cs-02', phase: 'RESEARCH', name: 'Study GCP common misconfigs: IAM bindings, firewall rules', xp: 55 },
      { id: 'cs-03', phase: 'RESEARCH', name: 'Analyse existing tools: ScoutSuite, Prowler, CloudMapper', xp: 50 },
      { id: 'cs-04', phase: 'RESEARCH', name: 'Define scan rules and severity scoring system', xp: 50 },
      // PHASE 2: BUILD AWS
      { id: 'cs-05', phase: 'BUILD-AWS', name: 'Setup project CLI structure with Python argparse', xp: 50 },
      { id: 'cs-06', phase: 'BUILD-AWS', name: 'AWS scanner: detect public S3 buckets', xp: 65 },
      { id: 'cs-07', phase: 'BUILD-AWS', name: 'AWS scanner: detect overpermissive IAM policies (*:*)', xp: 70 },
      { id: 'cs-08', phase: 'BUILD-AWS', name: 'AWS scanner: detect security groups open to 0.0.0.0/0', xp: 65 },
      { id: 'cs-09', phase: 'BUILD-AWS', name: 'AWS scanner: check CloudTrail and GuardDuty are enabled', xp: 60 },
      // PHASE 3: BUILD GCP
      { id: 'cs-10', phase: 'BUILD-GCP', name: 'GCP scanner: check IAM bindings for allUsers or allAuthenticatedUsers', xp: 65 },
      { id: 'cs-11', phase: 'BUILD-GCP', name: 'GCP scanner: detect firewall rules allowing broad ingress', xp: 65 },
      { id: 'cs-12', phase: 'BUILD-GCP', name: 'GCP scanner: check Cloud Storage bucket permissions', xp: 60 },
      // PHASE 4: SHIP
      { id: 'cs-13', phase: 'SHIP', name: 'Build HTML + JSON report generator with severity ratings', xp: 70 },
      { id: 'cs-14', phase: 'SHIP', name: 'Test scanner against AWS free tier sandbox account', xp: 65 },
      { id: 'cs-15', phase: 'SHIP', name: 'Package as installable CLI tool and publish to GitHub', xp: 65 },
      { id: 'cs-16', phase: 'SHIP', name: 'Write full README with usage examples and screenshots', xp: 55 },
    ]
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

const getISOWeekString = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

const getStageLabel = (pct) => {
  if (pct <= 25) return 'Foundation Building';
  if (pct <= 50) return 'Skills Acquisition';
  if (pct <= 75) return 'Active Hunting';
  if (pct <= 99) return 'Final Approach';
  return 'OBJECTIVE COMPLETE';
};

// Day Transition & Initial Telemetry State Setup
const initializeTelemetry = () => {
  const today = getTodayString();
  const lastActiveDate = storage.getItem('operator_completion_date');
  
  let chainProgress = {
    'NETWORKING': 0,
    'LINUX': 0,
    'SOC OPERATIONS': 0,
    'WEB SECURITY': 0,
    'TOOLS MASTERY': 0,
    'ACTIVE DIRECTORY': 0,
    'INTERVIEW PREP': 0,
    'THM / LABS': 0
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
        if (parsed && Array.isArray(parsed.completedTaskIds)) {
          yesterdayCompletedTaskIds = parsed.completedTaskIds;
        }
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
        const parsedTimes = JSON.parse(yesterdayTimesRaw);
        if (parsedTimes && typeof parsedTimes === 'object') {
          yesterdayTimes = parsedTimes;
        }
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

    // Clean up yesterday's completed project tasks
    ['ad-lab', 'threat-intel', 'cloud-scanner'].forEach(id => {
      storage.removeItem(`projectCompleted:${id}`);
    });

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
      const parsed = JSON.parse(savedState);
      if (parsed && typeof parsed === 'object') {
        dailyState = {
          completedTaskIds: Array.isArray(parsed.completedTaskIds) ? parsed.completedTaskIds : [],
          unlockedChainSteps: (parsed.unlockedChainSteps && typeof parsed.unlockedChainSteps === 'object') ? parsed.unlockedChainSteps : {}
        };
      }
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
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          loadedProfile = {
            level: typeof parsed.level === 'number' ? parsed.level : 1,
            totalXp: typeof parsed.totalXp === 'number' ? parsed.totalXp : 0,
            streak: typeof parsed.streak === 'number' ? parsed.streak : 0,
            lastActiveDate: typeof parsed.lastActiveDate === 'string' ? parsed.lastActiveDate : ''
          };
        }
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

  // Project status state
  const [projectStatus, setProjectStatus] = useState(() => {
    const saved = storage.getItem('projectStatus');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch {}
    }
    return { 'ad-lab': 'ACTIVE', 'threat-intel': 'QUEUED', 'cloud-scanner': 'QUEUED' };
  });

  // Project progress state
  const [projectProgress, setProjectProgress] = useState(() => {
    const saved = storage.getItem('projectProgress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            'ad-lab': typeof parsed['ad-lab'] === 'number' ? parsed['ad-lab'] : 3,
            'threat-intel': typeof parsed['threat-intel'] === 'number' ? parsed['threat-intel'] : 0,
            'cloud-scanner': typeof parsed['cloud-scanner'] === 'number' ? parsed['cloud-scanner'] : 0
          };
        }
      } catch {}
    }
    return { 'ad-lab': 3, 'threat-intel': 0, 'cloud-scanner': 0 };
  });

  // Project completed tasks for today's session
  const [projectCompletedTasks, setProjectCompletedTasks] = useState(() => {
    const completed = {};
    PROJECTS.forEach(proj => {
      const saved = storage.getItem(`projectCompleted:${proj.id}`);
      if (saved) {
        try {
          completed[proj.id] = JSON.parse(saved) || [];
        } catch {
          completed[proj.id] = [];
        }
      } else {
        completed[proj.id] = [];
      }
    });
    return completed;
  });

  // Collapsible completed projects control
  const [isCompletedProjectsExpanded, setIsCompletedProjectsExpanded] = useState(false);

  // Accomplished project modal control
  const [completedProjectModal, setCompletedProjectModal] = useState({ show: false, projectName: '', totalXp: 0 });

  // Active project calculation
  const activeProject = useMemo(() => {
    return PROJECTS.find(p => projectStatus[p.id] === 'ACTIVE');
  }, [projectStatus]);

  // Done projects list
  const doneProjects = useMemo(() => {
    return PROJECTS.filter(p => projectStatus[p.id] === 'DONE');
  }, [projectStatus]);

  // Active or Queued projects list
  const activeOrQueuedProjects = useMemo(() => {
    return PROJECTS.filter(p => projectStatus[p.id] !== 'DONE');
  }, [projectStatus]);

  // Rendered Project Ops tasks
  const renderedOpsTasks = useMemo(() => {
    if (!activeProject) return [];
    const activeProjProg = projectProgress[activeProject.id] || 0;
    const activeProjCompletedToday = projectCompletedTasks[activeProject.id] || [];
    const opsTasks = [];
    
    // Calculate starting index of tasks completed today
    const startIndex = Math.max(0, activeProjProg - activeProjCompletedToday.length);
    
    // Add completed today tasks
    for (let i = startIndex; i < activeProjProg; i++) {
      if (activeProject.tasks[i]) {
        opsTasks.push({
          task: activeProject.tasks[i],
          completed: true
        });
      }
    }
    
    // Add single active task if not fully complete
    if (activeProjProg < activeProject.tasks.length) {
      opsTasks.push({
        task: activeProject.tasks[activeProjProg],
        completed: false
      });
    }
    
    return opsTasks;
  }, [activeProject, projectProgress, projectCompletedTasks]);

  // Compute RPG stats dynamically based on daily completedTaskIds and last 7 days of logs
  const computedStats = useMemo(() => {
    const today = getTodayString();
    
    // Count completions of FIXED_TASKS in last 7 days:
    const counts7Days = {};
    FIXED_TASKS.forEach(t => {
      counts7Days[t.id] = 0;
    });

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      if (dateStr === today) {
        dailyState.completedTaskIds.forEach(id => {
          if (id.startsWith('fixed:')) {
            counts7Days[id] = (counts7Days[id] || 0) + 1;
          }
        });
      } else {
        const logsRaw = storage.getItem(`log:${dateStr}`);
        if (logsRaw) {
          try {
            const logs = JSON.parse(logsRaw);
            if (Array.isArray(logs)) {
              logs.forEach(log => {
                if (log.type === 'completed') {
                  const fixedTask = FIXED_TASKS.find(t => t.title === log.taskName);
                  if (fixedTask) {
                    counts7Days[fixedTask.id] = (counts7Days[fixedTask.id] || 0) + 1;
                  }
                }
              });
            }
          } catch {}
        }
      }
    }

    // 1. SIGINT — Technical knowledge
    // = (total ROADMAP + LABS chain steps permanently completed across all chains) / (total ROADMAP + LABS chain steps defined) × 100
    let totalRoadmapLabsDefined = 0;
    let totalRoadmapLabsCompleted = 0;
    Object.keys(CHAINS).forEach(chainName => {
      CHAINS[chainName].forEach(step => {
        if (step.category === 'ROADMAP' || step.category === 'LABS') {
          totalRoadmapLabsDefined++;
        }
      });
      const completedCount = chainProgress[chainName] || 0;
      for (let i = 0; i < completedCount; i++) {
        const step = CHAINS[chainName][i];
        if (step && (step.category === 'ROADMAP' || step.category === 'LABS')) {
          totalRoadmapLabsCompleted++;
        }
      }
    });
    const sigint = totalRoadmapLabsDefined > 0 ? Math.min(100, Math.round((totalRoadmapLabsCompleted / totalRoadmapLabsDefined) * 100)) : 0;

    // 2. OPS — Execution speed
    // = (OPS-tagged fixed tasks completed in last 7 days) / (OPS-tagged fixed tasks × 7) × 100
    const opsTasks = FIXED_TASKS.filter(t => t.category === 'OPS');
    const opsCompleted = opsTasks.reduce((sum, t) => sum + (counts7Days[t.id] || 0), 0);
    const ops = opsTasks.length > 0 ? Math.min(100, Math.round((opsCompleted / (opsTasks.length * 7)) * 100)) : 0;

    // 3. ARSENAL — Active projects
    // = (sum of projectProgress[id] across all projects) / (sum of total tasks across all projects) × 100
    let totalProjectTasks = 0;
    let totalProjectProgress = 0;
    PROJECTS.forEach(proj => {
      totalProjectTasks += proj.tasks.length;
      totalProjectProgress += projectProgress[proj.id] || 0;
    });
    const arsenal = totalProjectTasks > 0 ? Math.min(100, Math.round((totalProjectProgress / totalProjectTasks) * 100)) : 0;

    // 4. COMMS — Interview readiness
    // = (COMMS chain steps completed + COMMS fixed tasks completed last 7 days) / (total COMMS steps + COMMS fixed tasks × 7) × 100
    let totalCommsStepsDefined = 0;
    let totalCommsStepsCompleted = 0;
    Object.keys(CHAINS).forEach(chainName => {
      CHAINS[chainName].forEach(step => {
        if (step.category === 'COMMS') {
          totalCommsStepsDefined++;
        }
      });
      const completedCount = chainProgress[chainName] || 0;
      for (let i = 0; i < completedCount; i++) {
        const step = CHAINS[chainName][i];
        if (step && step.category === 'COMMS') {
          totalCommsStepsCompleted++;
        }
      }
    });
    const commsFixedTasks = FIXED_TASKS.filter(t => t.category === 'COMMS');
    const commsFixedCompleted = commsFixedTasks.reduce((sum, t) => sum + (counts7Days[t.id] || 0), 0);
    const comms = (totalCommsStepsDefined + commsFixedTasks.length * 7) > 0 
      ? Math.min(100, Math.round(((totalCommsStepsCompleted + commsFixedCompleted) / (totalCommsStepsDefined + commsFixedTasks.length * 7)) * 100)) 
      : 0;

    // 5. DISCIPLINE — Schedule adherence
    // = (DISCIPLINE fixed tasks completed last 7 days) / (DISCIPLINE fixed tasks × 7) × 100
    const disciplineTasks = FIXED_TASKS.filter(t => t.category === 'DISCIPLINE');
    const disciplineCompleted = disciplineTasks.reduce((sum, t) => sum + (counts7Days[t.id] || 0), 0);
    const discipline = disciplineTasks.length > 0 ? Math.min(100, Math.round((disciplineCompleted / (disciplineTasks.length * 7)) * 100)) : 0;

    // 6. ENDURANCE — Physical/mental
    // = (PHYSICAL + SOCIAL fixed tasks completed last 7 days) / ((PHYSICAL + SOCIAL fixed tasks) × 7) × 100
    const enduranceTasks = FIXED_TASKS.filter(t => t.category === 'PHYSICAL' || t.category === 'SOCIAL');
    const enduranceCompleted = enduranceTasks.reduce((sum, t) => sum + (counts7Days[t.id] || 0), 0);
    const endurance = enduranceTasks.length > 0 ? Math.min(100, Math.round((enduranceCompleted / (enduranceTasks.length * 7)) * 100)) : 0;

    return {
      sigint,
      ops,
      arsenal,
      comms,
      discipline,
      endurance
    };
  }, [dailyState.completedTaskIds, chainProgress]);

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

  // Main Objective dynamic readiness calculation
  const mainObjectiveProgress = useMemo(() => {
    // 1. Skills learned (35% weight): SIGINT stat
    const sigintContribution = computedStats.sigint * 0.35;

    // 2. Applications sent (30% weight): Count of Apply to roles completions in all logs (target: 35)
    let applyRolesCount = 0;
    if (dailyState.completedTaskIds.includes('fixed:apply_roles')) {
      applyRolesCount++;
    }
    const today = getTodayString();
    const allKeys = [];
    try {
      for (let i = 0; i < storage.length; i++) {
        const k = storage.key(i);
        if (k && k.startsWith('log:')) {
          allKeys.push(k);
        }
      }
    } catch {
      Object.keys(storage).forEach(k => {
        if (k.startsWith('log:')) {
          allKeys.push(k);
        }
      });
    }
    allKeys.forEach(k => {
      if (k === `log:${today}`) return;
      const raw = storage.getItem(k);
      if (raw) {
        try {
          const logs = JSON.parse(raw);
          if (Array.isArray(logs)) {
            logs.forEach(entry => {
              if (entry.type === 'completed' && entry.taskName === 'Apply to 5 roles (Naukri/LinkedIn)') {
                applyRolesCount++;
              }
            });
          }
        } catch {}
      }
    });
    const applyRolesPct = Math.min(100, Math.round((applyRolesCount / 35) * 100));
    const applyRolesContribution = applyRolesPct * 0.30;

    // 3. Interview readiness (20% weight): COMMS stat
    const commsContribution = computedStats.comms * 0.20;

    // 4. Lab hours (15% weight): Count of LABS + BUILD completions in all logs (target: 40)
    let labsBuildCount = 0;
    dailyState.completedTaskIds.forEach(id => {
      if (id.startsWith('chain:')) {
        const parts = id.split(':');
        if (parts.length === 3) {
          const chainName = parts[1];
          const stepIdx = parseInt(parts[2], 10);
          const chain = CHAINS[chainName];
          if (chain && chain[stepIdx]) {
            const task = chain[stepIdx];
            if (task.category === 'LABS' || task.category === 'BUILD') {
              labsBuildCount++;
            }
          }
        }
      } else {
        const task = FIXED_TASKS.find(t => t.id === id);
        if (task && (task.category === 'LABS' || task.category === 'BUILD')) {
          labsBuildCount++;
        }
      }
    });
    allKeys.forEach(k => {
      if (k === `log:${today}`) return;
      const raw = storage.getItem(k);
      if (raw) {
        try {
          const logs = JSON.parse(raw);
          if (Array.isArray(logs)) {
            logs.forEach(entry => {
              if (entry.type === 'completed' && (entry.tag === 'LABS' || entry.tag === 'BUILD')) {
                labsBuildCount++;
              }
            });
          }
        } catch {}
      }
    });
    const labsBuildPct = Math.min(100, Math.round((labsBuildCount / 40) * 100));
    const labsBuildContribution = labsBuildPct * 0.15;

    const totalPct = Math.round(sigintContribution + applyRolesContribution + commsContribution + labsBuildContribution);
    return Math.min(100, totalPct);
  }, [computedStats, dailyState.completedTaskIds]);
  
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
  const [isSkillMapExpanded, setIsSkillMapExpanded] = useState(true);
  const [isLifeMetricsExpanded, setIsLifeMetricsExpanded] = useState(true);
  const [weeklyReview, setWeeklyReview] = useState(null);
  const [isWeeklyReviewDismissed, setIsWeeklyReviewDismissed] = useState(false);

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
        return Array.isArray(logs) && logs.some(log => log.type === 'missed' && log.xpPenalty && log.xpPenalty < 0);
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

  // Helper to retrieve completed fixed task counts for the last 30 days
  const getCompletedCountsForLast30Days = () => {
    const today = getTodayString();
    const counts = {};
    
    FIXED_TASKS.forEach(t => {
      counts[t.id] = 0;
    });

    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      if (dateStr === today) {
        dailyState.completedTaskIds.forEach(id => {
          if (id.startsWith('fixed:')) {
            counts[id] = (counts[id] || 0) + 1;
          }
        });
      } else {
        const logsRaw = storage.getItem(`log:${dateStr}`);
        if (logsRaw) {
          try {
            const logs = JSON.parse(logsRaw);
            if (Array.isArray(logs)) {
              logs.forEach(log => {
                if (log.type === 'completed') {
                  const fixedTask = FIXED_TASKS.find(t => t.title === log.taskName);
                  if (fixedTask) {
                    counts[fixedTask.id] = (counts[fixedTask.id] || 0) + 1;
                  }
                }
              });
            }
          } catch {}
        }
      }
    }
    return counts;
  };

  // Helper to format the 30-day snapshot range string
  const get30DayRangeString = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 29);
    
    const formatDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return `${formatDate(start)} TO ${formatDate(end)}`;
  };

  // Automated Weekly AI Review background fetch
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const isoWeek = getISOWeekString();
    const storedReview = storage.getItem(`weeklyReview:${isoWeek}`);
    const dismissed = storage.getItem(`dismissedReview:${isoWeek}`) === 'true';
    
    if (storedReview) {
      try {
        const parsed = JSON.parse(storedReview);
        if (parsed && typeof parsed === 'object') {
          setWeeklyReview(parsed);
          setIsWeeklyReviewDismissed(dismissed);
          return;
        }
      } catch (e) {
        console.error("Failed to parse stored weekly review", e);
      }
    }

    const todayDay = new Date().getDay(); // 1 = Monday
    const isMonday = todayDay === 1;
    
    const lastReviewDateStr = storage.getItem('last_weekly_review_date');
    let moreThan7Days = false;
    if (lastReviewDateStr) {
      const lastDate = new Date(lastReviewDateStr);
      const diffTime = Math.abs(new Date() - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 7) {
        moreThan7Days = true;
      }
    } else {
      moreThan7Days = true;
    }

    if (isMonday || moreThan7Days) {
      // Gather last 7 days of logs (completed + missed)
      const last7DaysLogs = [];
      const today = getTodayString();
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        
        if (dateStr === today) {
          FIXED_TASKS.forEach(task => {
            const isCompleted = dailyState.completedTaskIds.includes(task.id);
            last7DaysLogs.push({
              taskName: task.title,
              tag: task.category,
              type: isCompleted ? 'completed' : 'missed',
              date: dateStr
            });
          });
          dailyState.completedTaskIds.forEach(id => {
            if (id.startsWith('chain:')) {
              const parts = id.split(':');
              if (parts.length === 3) {
                const chainName = parts[1];
                const stepIdx = parseInt(parts[2], 10);
                const chain = CHAINS[chainName];
                if (chain && chain[stepIdx]) {
                  last7DaysLogs.push({
                    taskName: chain[stepIdx].title,
                    tag: chain[stepIdx].category,
                    type: 'completed',
                    date: dateStr
                  });
                }
              }
            }
          });
        } else {
          const rawLogs = storage.getItem(`log:${dateStr}`);
          if (rawLogs) {
            try {
              const parsed = JSON.parse(rawLogs);
              if (Array.isArray(parsed)) {
                parsed.forEach(entry => {
                  last7DaysLogs.push({
                    taskName: entry.taskName,
                    tag: entry.tag,
                    type: entry.type,
                    date: dateStr
                  });
                });
              }
            } catch {}
          }
        }
      }

      const payload = {
        logs: last7DaysLogs,
        stats: computedStats,
        chainProgress,
        mainObjectiveProgress
      };

      fetchWeeklyReview(payload).then(result => {
        if (result && typeof result === 'object') {
          storage.setItem(`weeklyReview:${isoWeek}`, JSON.stringify(result));
          storage.setItem('last_weekly_review_date', new Date().toISOString());
          setWeeklyReview(result);
          setIsWeeklyReviewDismissed(false);
        }
      });
    }
  }, [isAuthenticated, computedStats, chainProgress, mainObjectiveProgress]);

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

    const statusToSync = storage.getItem('projectStatus') ? JSON.parse(storage.getItem('projectStatus')) : {};
    const progressToSync = storage.getItem('projectProgress') ? JSON.parse(storage.getItem('projectProgress')) : {};

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
          flavors: flavorsToSync,
          projectStatus: statusToSync,
          projectProgress: progressToSync
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
              resolvedState = {
                completedTaskIds: Array.isArray(remoteData.stateToday.completedTaskIds) ? remoteData.stateToday.completedTaskIds : [],
                unlockedChainSteps: (remoteData.stateToday.unlockedChainSteps && typeof remoteData.stateToday.unlockedChainSteps === 'object') ? remoteData.stateToday.unlockedChainSteps : {}
              };
            }
          }
          
          // Restore chainProgress
          let resolvedChainProgress = {
            'NETWORKING': 0,
            'LINUX': 0,
            'SOC OPERATIONS': 0,
            'WEB SECURITY': 0,
            'TOOLS MASTERY': 0,
            'ACTIVE DIRECTORY': 0,
            'INTERVIEW PREP': 0,
            'THM / LABS': 0
          };
          
          let localChainProgress = {};
          const localSaved = storage.getItem('chainProgress');
          if (localSaved) {
            try {
              const parsed = JSON.parse(localSaved);
              if (parsed && typeof parsed === 'object') {
                localChainProgress = parsed;
              }
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
          if (remoteData.completionTimesToday && typeof remoteData.completionTimesToday === 'object') {
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
          
          // Restore projectStatus
          let resolvedProjectStatus = { 'ad-lab': 'ACTIVE', 'threat-intel': 'QUEUED', 'cloud-scanner': 'QUEUED' };
          if (remoteData.projectStatus && typeof remoteData.projectStatus === 'object') {
            resolvedProjectStatus = remoteData.projectStatus;
          }
          setProjectStatus(resolvedProjectStatus);
          storage.setItem('projectStatus', JSON.stringify(resolvedProjectStatus));

          // Restore projectProgress
          let resolvedProjectProgress = { 'ad-lab': 3, 'threat-intel': 0, 'cloud-scanner': 0 };
          if (remoteData.projectProgress && typeof remoteData.projectProgress === 'object') {
            resolvedProjectProgress = remoteData.projectProgress;
          }
          setProjectProgress(resolvedProjectProgress);
          storage.setItem('projectProgress', JSON.stringify(resolvedProjectProgress));

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
              const parsed = JSON.parse(todayFlavorsRaw);
              if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                setFlavors(parsed);
              }
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
          completedAt: isCompleted ? (() => {
            const timesRaw = storage.getItem(`completion_times:${today}`);
            if (timesRaw) {
              try {
                const parsed = JSON.parse(timesRaw);
                if (parsed && typeof parsed === 'object') {
                  return parsed[task.id] || new Date().toISOString();
                }
              } catch {}
            }
            return new Date().toISOString();
          })() : null,
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
                completedAt: (() => {
                  const timesRaw = storage.getItem(`completion_times:${today}`);
                  if (timesRaw) {
                    try {
                      const parsed = JSON.parse(timesRaw);
                      if (parsed && typeof parsed === 'object') {
                        return parsed[id] || new Date().toISOString();
                      }
                    } catch {}
                  }
                  return new Date().toISOString();
                })(),
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
        let timesObj = {};
        const timesRaw = storage.getItem(`completion_times:${today}`);
        if (timesRaw) {
          try {
            const parsed = JSON.parse(timesRaw);
            if (parsed && typeof parsed === 'object') {
              timesObj = parsed;
            }
          } catch {}
        }
        saveProgressToServer(activePasscode, dailyState, profile, chainProgress, timesObj);
      }
    }
  };

  // Change project status handler
  const handleChangeProjectStatus = (projId, newStatus) => {
    let updatedStatus = { ...projectStatus };
    if (newStatus === 'ACTIVE') {
      // Set any previously ACTIVE project to ON HOLD
      Object.keys(updatedStatus).forEach(id => {
        if (updatedStatus[id] === 'ACTIVE') {
          updatedStatus[id] = 'ON HOLD';
        }
      });
    }
    updatedStatus[projId] = newStatus;
    setProjectStatus(updatedStatus);
    storage.setItem('projectStatus', JSON.stringify(updatedStatus));

    // Also trigger server sync
    const activePasscode = passcode || storage.getItem('operator_passcode');
    if (activePasscode) {
      saveProgressToServer(activePasscode, dailyState, profile, chainProgress, storage.getItem(`completion_times:${getTodayString()}`) ? JSON.parse(storage.getItem(`completion_times:${getTodayString()}`)) : {});
    }
  };

  // Toggle project task completion
  const handleToggleProjectTask = (projId, taskId, xpReward, e) => {
    if (isDayClosed) return;
    const today = getTodayString();
    
    const currentProgressVal = projectProgress[projId] || 0;
    const completedToday = projectCompletedTasks[projId] || [];
    const isCompleted = completedToday.includes(taskId);
    
    let nextCompleted = [...completedToday];
    let nextProgressVal = currentProgressVal;
    
    // Handle particles
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

    if (!isCompleted) {
      // Mark task as completed today
      nextCompleted.push(taskId);
      nextProgressVal = currentProgressVal + 1;
      
      // Trigger flash animation for the NEXT task
      const project = PROJECTS.find(p => p.id === projId);
      if (project && nextProgressVal < project.tasks.length) {
        const nextTaskId = project.tasks[nextProgressVal].id;
        setJustUnlockedStepId(nextTaskId);
      }
    } else {
      // Uncheck task:
      // Remove it from nextCompleted, and decrement progress.
      nextCompleted = nextCompleted.filter(id => id !== taskId);
      nextProgressVal = Math.max(0, currentProgressVal - 1);
    }
    
    // Save to storage & update state
    const updatedCompleted = { ...projectCompletedTasks, [projId]: nextCompleted };
    setProjectCompletedTasks(updatedCompleted);
    storage.setItem(`projectCompleted:${projId}`, JSON.stringify(nextCompleted));
    
    const updatedProgress = { ...projectProgress, [projId]: nextProgressVal };
    setProjectProgress(updatedProgress);
    storage.setItem('projectProgress', JSON.stringify(updatedProgress));
    
    // Add XP to profile
    setProfile(prev => {
      let newTotalXp = prev.totalXp + (isCompleted ? -xpReward : xpReward);
      if (newTotalXp < 0) newTotalXp = 0;
      const updatedLevel = Math.floor(newTotalXp / 200) + 1;
      const newProfile = {
        ...prev,
        level: updatedLevel,
        totalXp: newTotalXp
      };
      storage.setItem('operator_profile', JSON.stringify(newProfile));
      
      // Sync to server
      const activePasscode = passcode || storage.getItem('operator_passcode');
      if (activePasscode) {
        saveProgressToServer(activePasscode, dailyState, newProfile, chainProgress, storage.getItem(`completion_times:${today}`) ? JSON.parse(storage.getItem(`completion_times:${today}`)) : {});
      }
      return newProfile;
    });

    // Check if all tasks in this project are completed
    const project = PROJECTS.find(p => p.id === projId);
    if (project && nextProgressVal === project.tasks.length) {
      // Auto-set project status to DONE
      const updatedStatus = { ...projectStatus, [projId]: 'DONE' };
      setProjectStatus(updatedStatus);
      storage.setItem('projectStatus', JSON.stringify(updatedStatus));
      
      // Show accomplishments modal
      setCompletedProjectModal({
        show: true,
        projectName: project.name,
        totalXp: project.tasks.reduce((sum, t) => sum + t.xp, 0)
      });
      
      // Sync to server with new DONE status
      const activePasscode = passcode || storage.getItem('operator_passcode');
      if (activePasscode) {
        setTimeout(() => {
          saveProgressToServer(activePasscode, dailyState, profile, chainProgress, storage.getItem(`completion_times:${today}`) ? JSON.parse(storage.getItem(`completion_times:${today}`)) : {});
        }, 100);
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
        const parsed = JSON.parse(savedTimes);
        if (parsed && typeof parsed === 'object') {
          completionTimes = parsed;
        }
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
            if (Array.isArray(logs)) {
              logs.forEach(log => {
                if (log.type === 'missed' && log.xpPenalty && log.xpPenalty < 0) {
                  missedPenalizedCount++;
                  totalPenalty += Math.abs(log.xpPenalty);
                }
              });
            }
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

      {/* Weekly AI Performance Review Banner */}
      {weeklyReview && !isWeeklyReviewDismissed && (() => {
        const isoWeek = getISOWeekString();
        
        let borderLeftColor = 'var(--accent-green)';
        let badgeColor = 'var(--accent-green)';
        if (weeklyReview.threatLevel === 'AMBER') {
          borderLeftColor = 'var(--accent-amber)';
          badgeColor = 'var(--accent-amber)';
        } else if (weeklyReview.threatLevel === 'RED') {
          borderLeftColor = 'var(--accent-coral)';
          badgeColor = 'var(--accent-coral)';
        }

        return (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderLeft: `5px solid ${borderLeftColor}`,
            padding: '16px',
            marginBottom: '20px',
            fontFamily: 'var(--font-mono)',
            position: 'relative',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${badgeColor}`,
                  color: badgeColor,
                  fontSize: '11px',
                  fontWeight: 'bold',
                  padding: '2px 8px',
                  textTransform: 'uppercase'
                }}>
                  THREAT LEVEL: {weeklyReview.threatLevel}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-main)', letterSpacing: '0.05em' }}>
                  {weeklyReview.headline}
                </span>
              </div>
              <button
                onClick={() => {
                  storage.setItem(`dismissedReview:${isoWeek}`, 'true');
                  setIsWeeklyReviewDismissed(true);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                [X]
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span>&gt; INSIGHT: {weeklyReview.insight}</span>
              <span>&gt; FOCUS: {weeklyReview.nextWeekFocus}</span>
              <span>&gt; STRONGEST STAT: <span style={{ color: 'var(--accent-green)' }}>{weeklyReview.strongestStat}</span> | WEAKEST STAT: <span style={{ color: 'var(--accent-coral)' }}>{weeklyReview.weakestStat}</span></span>
            </div>
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
                    <span>STAGE: {getStageLabel(mainObjectiveProgress)}</span>
                    <span>{mainObjectiveProgress}%</span>
                  </div>
                  <div className="obj-progress-bar-outer">
                    <div className="obj-progress-bar-inner" style={{ width: `${mainObjectiveProgress}%`, transition: 'width 0.6s ease' }}></div>
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
                {activeOrQueuedProjects.map((proj) => {
                  const status = projectStatus[proj.id] || 'QUEUED';
                  const progressIdx = projectProgress[proj.id] || 0;
                  const totalTasks = proj.tasks.length;
                  const pct = Math.round((progressIdx / totalTasks) * 100);
                  const currentTask = progressIdx < totalTasks ? proj.tasks[progressIdx] : null;
                  
                  // Dynamic styles for status badge
                  let badgeStyle = {
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    padding: '1px 6px'
                  };
                  if (status === 'ACTIVE') {
                    badgeStyle = {
                      background: 'var(--accent-amber-dim)',
                      border: '1px solid var(--accent-amber)',
                      color: 'var(--accent-amber)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      padding: '1px 6px'
                    };
                  } else if (status === 'DONE') {
                    badgeStyle = {
                      background: 'var(--accent-green-dim)',
                      border: '1px solid var(--accent-green)',
                      color: 'var(--accent-green)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      padding: '1px 6px'
                    };
                  } else if (status === 'ON HOLD') {
                    badgeStyle = {
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      padding: '1px 6px'
                    };
                  }

                  return (
                    <div 
                      key={proj.id} 
                      className={`project-card ${status === 'ACTIVE' ? 'active-project' : 'queued'}`}
                    >
                      <div className="project-status-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span className="project-name" style={{ fontWeight: 'bold', fontSize: '14px', color: status === 'ACTIVE' ? 'var(--accent-amber)' : 'var(--text-main)', textTransform: 'uppercase' }}>{proj.name}</span>
                        <span style={badgeStyle}>
                          {status}
                        </span>
                      </div>

                      <span className="project-focus" style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        Focus: {proj.focus}
                      </span>

                      {/* Progress Bar */}
                      <div className="project-progress-group" style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '4px' }}>
                          <span>PROGRESS</span>
                          <span>{pct}% ({progressIdx}/{totalTasks})</span>
                        </div>
                        <div className="xp-bar-outer" style={{ height: '6px' }}>
                          <div className="xp-bar-inner" style={{ width: `${pct}%`, transition: 'width 0.6s ease' }}></div>
                        </div>
                      </div>

                      {/* Current Phase / Task */}
                      <div className="project-current-task-group" style={{ marginBottom: '12px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                        {currentTask ? (
                          <>
                            <span style={{ color: 'var(--accent-amber)', display: 'block', fontWeight: 'bold' }}>PHASE: {currentTask.phase}</span>
                            <span style={{ color: 'var(--text-muted)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{currentTask.name}</span>
                          </>
                        ) : (
                          <span style={{ color: 'var(--accent-green)', display: 'block', fontWeight: 'bold' }}>PHASE: COMPLETE</span>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px', borderTop: '1px dashed var(--border-color)' }}>
                        <span className="project-xp-reward" style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)' }}>
                          Daily Session XP: +{proj.dailyXP}
                        </span>

                        {/* Status Control Select */}
                        <select 
                          value={status} 
                          onChange={(e) => handleChangeProjectStatus(proj.id, e.target.value)}
                          className="dark-date-picker"
                          style={{ fontSize: '11px', padding: '2px 6px', fontFamily: 'var(--font-mono)', height: '24px', background: 'var(--bg-terminal)', border: '1px solid var(--border-color)', color: 'var(--accent-amber)' }}
                        >
                          <option value="QUEUED">QUEUED</option>
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="ON HOLD">ON HOLD</option>
                          <option value="DONE">DONE</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Collapsed COMPLETED PROJECTS row below */}
              {doneProjects.length > 0 && (
                <div className="completed-projects-section" style={{ marginTop: '20px' }}>
                  <div 
                    className="panel-title-clickable" 
                    onClick={() => setIsCompletedProjectsExpanded(!isCompletedProjectsExpanded)} 
                    style={{ 
                      cursor: 'pointer', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      userSelect: 'none'
                    }}
                  >
                    <h3 className="panel-title" style={{ margin: 0, fontSize: '15px', color: 'var(--accent-green)' }}>🏆 COMPLETED PROJECTS ({doneProjects.length})</h3>
                    <span style={{ color: 'var(--accent-green)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                      {isCompletedProjectsExpanded ? '[ COLLAPSE - ]' : '[ EXPAND + ]'}
                    </span>
                  </div>
                  <hr className="section-divider" style={{ borderColor: 'rgba(34, 197, 94, 0.3)', margin: '8px 0' }} />
                  {isCompletedProjectsExpanded && (
                    <div className="projects-grid">
                      {doneProjects.map((proj) => {
                        const totalTasks = proj.tasks.length;
                        return (
                          <div 
                            key={proj.id} 
                            className="project-card done"
                            style={{ border: '1px solid var(--accent-green)', boxShadow: '0 0 10px rgba(34, 197, 94, 0.05)' }}
                          >
                            <div className="project-status-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span className="project-name" style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--accent-green)', textTransform: 'uppercase' }}>{proj.name}</span>
                              <span style={{
                                background: 'var(--accent-green-dim)',
                                border: '1px solid var(--accent-green)',
                                color: 'var(--accent-green)',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                padding: '1px 6px'
                              }}>
                                DONE
                              </span>
                            </div>

                            <span className="project-focus" style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                              Focus: {proj.focus}
                            </span>

                            <div className="project-progress-group" style={{ marginBottom: '12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-green)', marginBottom: '4px' }}>
                                <span>COMPLETED</span>
                                <span>100% ({totalTasks}/{totalTasks})</span>
                              </div>
                              <div className="xp-bar-outer" style={{ height: '6px', borderColor: 'rgba(34, 197, 94, 0.2)' }}>
                                <div className="xp-bar-inner" style={{ width: '100%', background: 'var(--accent-green)', boxShadow: '0 0 6px rgba(34, 197, 94, 0.3)' }}></div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px', borderTop: '1px dashed rgba(34, 197, 94, 0.2)' }}>
                              <span className="project-xp-reward" style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>
                                Project Complete
                              </span>

                              {/* Status Control Select to allow moving back */}
                              <select 
                                value="DONE" 
                                onChange={(e) => handleChangeProjectStatus(proj.id, e.target.value)}
                                className="dark-date-picker"
                                style={{ fontSize: '11px', padding: '2px 6px', fontFamily: 'var(--font-mono)', height: '24px', background: 'var(--bg-terminal)', border: '1px solid rgba(34, 197, 94, 0.3)', color: 'var(--accent-green)' }}
                              >
                                <option value="DONE">DONE</option>
                                <option value="QUEUED">QUEUED</option>
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="ON HOLD">ON HOLD</option>
                              </select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* SKILL MAP SECTION */}
            <section className="skill-map-section">
              <div 
                className="panel-title-clickable" 
                onClick={() => setIsSkillMapExpanded(!isSkillMapExpanded)} 
                style={{ 
                  cursor: 'pointer', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  userSelect: 'none'
                }}
              >
                <h2 className="panel-title" style={{ margin: 0 }}>🗺️ SKILL MAP</h2>
                <span 
                  className="collapse-arrow" 
                  style={{ 
                    color: 'var(--accent-amber)', 
                    fontFamily: 'var(--font-mono)', 
                    fontSize: '13px',
                    letterSpacing: '0.05em'
                  }}
                >
                  {isSkillMapExpanded ? '[ COLLAPSE - ]' : '[ EXPAND + ]'}
                </span>
              </div>
              <hr className="section-divider" />

              {isSkillMapExpanded && (
                <div className="skill-map-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
                  {['NETWORKING', 'LINUX', 'SOC OPERATIONS', 'WEB SECURITY', 'TOOLS MASTERY', 'ACTIVE DIRECTORY', 'INTERVIEW PREP'].map(domain => {
                    const chain = CHAINS[domain];
                    const completedCount = chainProgress[domain] || 0;
                    const totalSteps = chain.length;
                    const pct = Math.round((completedCount / totalSteps) * 100);
                    
                    return (
                      <div 
                        key={domain} 
                        className="skill-card" 
                        style={{ 
                          background: 'var(--bg-card)', 
                          border: '1px solid var(--border-color)', 
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', fontSize: '15px', color: 'var(--accent-amber)', textTransform: 'uppercase' }}>
                            {domain}
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--accent-amber)' }}>
                            {pct}%
                          </span>
                        </div>
                        
                        <div className="xp-bar-outer" style={{ height: '6px' }}>
                          <div className="xp-bar-inner" style={{ width: `${pct}%`, transition: 'width 0.6s ease' }}></div>
                        </div>

                        <div className="skill-steps-list" style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                          {chain.map((step, idx) => {
                            const isCleared = idx < completedCount;
                            return (
                              <div 
                                key={idx} 
                                style={{ 
                                  fontSize: '11px', 
                                  fontFamily: 'var(--font-mono)', 
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  color: isCleared ? 'var(--accent-green)' : 'var(--text-muted)',
                                  textDecoration: isCleared ? 'line-through' : 'none'
                                }}
                              >
                                <span>{isCleared ? '✓' : '○'}</span>
                                <span style={{ opacity: isCleared ? 0.6 : 1 }}>
                                  {step.title}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* PROJECT OPS section */}
            {activeProject && renderedOpsTasks.length > 0 && (
              <section className="project-ops-section">
                <h2 className="panel-title">Project Ops // {activeProject.name}</h2>
                <hr className="section-divider" />
                <div className="missions-grid" style={{ marginBottom: '24px' }}>
                  {renderedOpsTasks.map(({ task, completed }) => {
                    const isJustUnlocked = justUnlockedStepId === task.id;
                    return (
                      <div 
                        key={task.id} 
                        className={`mission-card ${completed ? 'completed' : ''} ${isJustUnlocked ? 'unlocked-flash' : ''}`}
                        onClick={(e) => handleToggleProjectTask(activeProject.id, task.id, task.xp, e)}
                      >
                        <div className="checkbox-container">
                          <span className="checkmark-icon"></span>
                        </div>
                        <div className="mission-details">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                            <span className="mission-title">{task.name}</span>
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
                          <div className="mission-meta">
                            <span className="badge badge-ops" style={{ background: 'var(--accent-amber-dim)', border: '1px solid var(--accent-amber)', color: 'var(--accent-amber)' }}>
                              {task.phase}
                            </span>
                            <span className="xp-reward">+{task.xp} XP</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

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

            {/* LIFE METRICS SECTION */}
            <section className="life-metrics-section" style={{ marginTop: '24px', marginBottom: '24px' }}>
              <div 
                className="panel-title-clickable" 
                onClick={() => setIsLifeMetricsExpanded(!isLifeMetricsExpanded)} 
                style={{ 
                  cursor: 'pointer', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  userSelect: 'none'
                }}
              >
                <h2 className="panel-title" style={{ margin: 0 }}>📊 LIFE METRICS</h2>
                <span 
                  className="collapse-arrow" 
                  style={{ 
                    color: 'var(--accent-amber)', 
                    fontFamily: 'var(--font-mono)', 
                    fontSize: '13px',
                    letterSpacing: '0.05em'
                  }}
                >
                  {isLifeMetricsExpanded ? '[ COLLAPSE - ]' : '[ EXPAND + ]'}
                </span>
              </div>
              <hr className="section-divider" />

              {isLifeMetricsExpanded && (() => {
                const c30 = getCompletedCountsForLast30Days();
                const careerNum = (c30['fixed:apply_roles'] || 0) + (c30['fixed:cold_email'] || 0) + (c30['fixed:update_linkedin'] || 0);
                const physicalNum = (c30['fixed:post_nap_exercise'] || 0) + (c30['fixed:drink_water'] || 0) + (c30['fixed:sleep_early'] || 0);
                const mentalNum = (c30['fixed:morning_ritual'] || 0) + (c30['fixed:after_action_report'] || 0);
                const socialNum = c30['fixed:evening_patrol'] || 0;

                const careerPct = Math.min(100, Math.round((careerNum / 90) * 100));
                const physicalPct = Math.min(100, Math.round((physicalNum / 90) * 100));
                const mentalPct = Math.min(100, Math.round((mentalNum / 60) * 100));
                const socialPct = Math.min(100, Math.round((socialNum / 30) * 100));

                const metrics = [
                  { name: 'CAREER MOMENTUM', pct: careerPct, label: 'Job hunt execution' },
                  { name: 'PHYSICAL CONDITION', pct: physicalPct, label: 'Health consistency' },
                  { name: 'MENTAL DISCIPLINE', pct: mentalPct, label: 'Routine adherence' },
                  { name: 'SOCIAL BATTERY', pct: socialPct, label: 'Real world presence' }
                ];

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                      {metrics.map(metric => (
                        <div 
                          key={metric.name} 
                          className="metric-card" 
                          style={{ 
                            background: 'var(--bg-card)', 
                            border: '1px solid var(--border-color)', 
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', fontSize: '14px', color: 'var(--accent-amber)', textTransform: 'uppercase' }}>
                              {metric.name}
                            </span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--accent-amber)' }}>
                              {metric.pct}%
                            </span>
                          </div>
                          
                          <div className="xp-bar-outer" style={{ height: '8px' }}>
                            <div className="xp-bar-inner" style={{ width: `${metric.pct}%`, transition: 'width 0.6s ease' }}></div>
                          </div>
                          
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {metric.label}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', borderTop: '1px dashed var(--border-color)', paddingTop: '10px' }}>
                      30-DAY SNAPSHOT: {get30DayRangeString()}
                    </div>
                  </div>
                );
              })()}
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

                      if (!Array.isArray(dayLogs)) {
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

                      const completedLogs = dayLogs.filter(l => l && l.type === 'completed');
                      const missedLogs = dayLogs.filter(l => l && l.type === 'missed');
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
                      <div className="stat-bar-inner" style={{ width: `${computedStats.sigint}%`, transition: 'width 0.6s ease' }}></div>
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
                      <div className="stat-bar-inner" style={{ width: `${computedStats.ops}%`, transition: 'width 0.6s ease' }}></div>
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
                      <div className="stat-bar-inner" style={{ width: `${computedStats.arsenal}%`, transition: 'width 0.6s ease' }}></div>
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
                      <div className="stat-bar-inner" style={{ width: `${computedStats.comms}%`, transition: 'width 0.6s ease' }}></div>
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
                      <div className="stat-bar-inner" style={{ width: `${computedStats.discipline}%`, transition: 'width 0.6s ease' }}></div>
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
                      <div className="stat-bar-inner" style={{ width: `${computedStats.endurance}%`, transition: 'width 0.6s ease' }}></div>
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

      {/* Project Accomplished Modal Overlay */}
      {completedProjectModal.show && (
        <div className="debrief-modal-overlay" style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(7, 8, 10, 0.95)',
          zIndex: 200000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}>
          <div className="debrief-modal-box" style={{
            width: '100%',
            maxWidth: '500px',
            background: 'var(--bg-card)',
            border: '2px solid var(--accent-green)',
            padding: '24px',
            boxShadow: '0 0 20px rgba(34, 197, 94, 0.25)',
            fontFamily: 'var(--font-mono)',
            color: 'var(--accent-green)',
            position: 'relative',
            textAlign: 'center'
          }}>
            <div style={{
              borderBottom: '1px dashed var(--accent-green)',
              paddingBottom: '12px',
              marginBottom: '16px',
              fontSize: '18px',
              fontWeight: 'bold',
              letterSpacing: '0.05em'
            }}>
              🏆 PROJECT COMPLETE — MISSION ACCOMPLISHED
            </div>
            <p style={{ color: 'var(--text-main)', fontSize: '14px', marginBottom: '16px', lineHeight: '1.6' }}>
              All operational phases of <strong style={{ color: 'var(--accent-green)' }}>{completedProjectModal.projectName}</strong> have been successfully concluded.
            </p>
            <div style={{ fontSize: '20px', fontWeight: 'bold', margin: '20px 0', color: 'var(--accent-green)' }}>
              TOTAL PROJECT REWARD: +{completedProjectModal.totalXp} XP
            </div>
            <button 
              onClick={() => setCompletedProjectModal({ show: false, projectName: '', totalXp: 0 })}
              style={{
                background: 'var(--bg-terminal)',
                border: '1px solid var(--accent-green)',
                color: 'var(--accent-green)',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                padding: '8px 20px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                marginTop: '12px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--accent-green)';
                e.currentTarget.style.color = 'var(--bg-terminal)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-terminal)';
                e.currentTarget.style.color = 'var(--accent-green)';
              }}
            >
              [ DISMISS COMMS ]
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
