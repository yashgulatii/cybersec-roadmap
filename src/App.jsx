import { useState, useEffect, useMemo } from 'react';
import './index.css';
import { fetchFlavorRotation, fetchDailyDebrief, fetchWeeklyReview } from './services/aiService';

const getSafeStorage = () => {
  const hasWindow = typeof window !== 'undefined';
  const memoryStorage = {};

  return {
    getItem(key) {
      try {
        if (hasWindow && window.storage && typeof window.storage.getItem === 'function') {
          return window.storage.getItem(key);
        }
        if (hasWindow && window.storage && typeof window.storage.get === 'function') {
          const val = window.storage.get(key);
          if (val instanceof Promise) {
            return memoryStorage[key] !== undefined ? memoryStorage[key] : null;
          }
          if (val && typeof val === 'object' && val.value !== undefined) {
            return val.value;
          }
          return typeof val === 'string' ? val : null;
        }
      } catch (e) {
        console.warn("window.storage.getItem/get failed for key:", key, e);
      }

      return memoryStorage[key] !== undefined ? memoryStorage[key] : null;
    },
    setItem(key, value) {
      try {
        memoryStorage[key] = value;
      } catch (e) { }

      try {
        if (hasWindow && window.storage && typeof window.storage.setItem === 'function') {
          window.storage.setItem(key, value);
          return;
        }
        if (hasWindow && window.storage && typeof window.storage.set === 'function') {
          window.storage.set(key, value);
          return;
        }
      } catch (e) {
        console.warn("window.storage.setItem/set failed for key:", key, e);
      }
    },
    removeItem(key) {
      try {
        delete memoryStorage[key];
      } catch (e) { }

      try {
        if (hasWindow && window.storage && typeof window.storage.removeItem === 'function') {
          window.storage.removeItem(key);
          return;
        }
        if (hasWindow && window.storage && typeof window.storage.delete === 'function') {
          window.storage.delete(key);
          return;
        }
      } catch (e) {
        console.warn("window.storage.removeItem/delete failed for key:", key, e);
      }
    },
    key(index) {
      return Object.keys(memoryStorage)[index] || null;
    },
    get length() {
      return Object.keys(memoryStorage).length;
    }
  };
};

const storage = getSafeStorage();

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

const mapDomainKey = (domain) => {
  if (domain === 'THM_LABS') return 'THM / LABS';
  return domain.replace(/_/g, ' ');
};

// Day Transition & Initial Telemetry State Setup
const initializeTelemetry = () => {
  const today = getTodayString();
  const lastActiveDate = storage.getItem('operator_completion_date');

  let localChains = { ...CHAINS };
  try {
    const storedCustom = storage.getItem('customChains');
    if (storedCustom) {
      const custom = JSON.parse(storedCustom) || {};
      localChains = { ...localChains, ...custom };
    }
  } catch { }

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

  // Scan all past states and logs in storage to ensure all previous completed chain tasks are accounted for
  try {
    const allKeys = [];
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (k && (k.startsWith('state:') || k.startsWith('log:'))) {
        allKeys.push(k);
      }
    }
    allKeys.forEach(k => {
      const raw = storage.getItem(k);
      if (raw) {
        if (k.startsWith('state:')) {
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.completedTaskIds)) {
            parsed.completedTaskIds.forEach(id => {
              if (id.startsWith('chain:')) {
                const parts = id.split(':');
                if (parts.length === 3) {
                  const chainName = parts[1];
                  const stepIdx = parseInt(parts[2], 10);
                  if (chainProgress[chainName] !== undefined) {
                    chainProgress[chainName] = Math.max(chainProgress[chainName], stepIdx + 1);
                  }
                }
              }
            });
          }
        } else if (k.startsWith('log:')) {
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed)) {
            parsed.forEach(entry => {
              if (entry.type === 'completed' && entry.taskName) {
                Object.keys(localChains).forEach(chainName => {
                  const stepIdx = localChains[chainName].findIndex(step => step.title === entry.taskName);
                  if (stepIdx !== -1) {
                    chainProgress[chainName] = Math.max(chainProgress[chainName], stepIdx + 1);
                  }
                });
              }
            });
          }
        }
      }
    });
    storage.setItem('chainProgress', JSON.stringify(chainProgress));
  } catch (err) {
    console.error("Failed to reconstruct chainProgress from historical states/logs", err);
  }

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

const SCHEDULE = [
  { id: 's1', label: 'WAKE + RITUAL', start: '05:30', end: '06:30', type: 'DISCIPLINE', description: 'Bath · Surya · no screen' },
  { id: 's2', label: 'MORNING BRIEF', start: '06:30', end: '06:45', type: 'DISCIPLINE', description: 'Review missions · 15 min' },
  { id: 's3', label: 'DEEP OPS', start: '06:45', end: '09:30', type: 'ROADMAP', description: 'Roadmap theory · TryHackMe · 2h45m' },
  { id: 's4', label: 'FIELD BREAK', start: '09:30', end: '10:00', type: 'PHYSICAL', description: 'Tea · stretch · away from screen' },
  { id: 's5', label: 'PROJECT BUILD', start: '10:00', end: '12:30', type: 'BUILD', description: 'AD Lab · Threat Intel Engine · Cloud Scanner · 2h30m' },
  { id: 's6', label: 'CHOW', start: '12:30', end: '13:00', type: 'PHYSICAL', description: 'Lunch' },
  { id: 's7', label: 'REST PHASE', start: '13:00', end: '13:30', type: 'PHYSICAL', description: 'Power nap · 30 min' },
  { id: 's8', label: 'PHYSICAL TRAINING', start: '13:30', end: '14:15', type: 'PHYSICAL', description: 'Exercise · 40 min' },
  { id: 's9', label: 'APPLICATION OPS', start: '14:15', end: '16:00', type: 'OPS', description: 'Job apps · cold emails · 1h45m' },
  { id: 's10', label: 'SECONDARY OPS', start: '16:00', end: '18:00', type: 'LABS', description: 'PortSwigger · Splunk · bug bounty · 2h' },
  { id: 's11', label: 'PATROL', start: '18:00', end: '20:00', type: 'SOCIAL', description: 'Walk with friend · 1-2 hours' },
  { id: 's12', label: 'INTEL REVIEW', start: '20:00', end: '21:00', type: 'INTEL', description: 'Read · tech content · 1 hour' },
  { id: 's13', label: 'AFTER ACTION', start: '21:00', end: '21:30', type: 'DISCIPLINE', description: 'Journal · plan tomorrow · 30 min' },
  { id: 's14', label: 'COMMS BLACKOUT', start: '21:30', end: '22:30', type: 'DISCIPLINE', description: 'No screens until sleep' },
  { id: 's15', label: 'STAND DOWN', start: '22:30', end: '5:30', type: 'DISCIPLINE', description: 'Sleep' },
];

function getCurrentBlock(schedule) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const block of schedule) {
    const [startH, startM] = block.start.split(':').map(Number);
    const [endH, endM] = block.end.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
      return { current: block, progress: (currentMinutes - startMinutes) / (endMinutes - startMinutes) };
    }
  }
  return null;
}

function getNextBlock(schedule) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const block of schedule) {
    const [startH, startM] = block.start.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    if (startMinutes > currentMinutes) return block;
  }
  return null;
}

const getDynamicFixedTasks = () => {
  const defaultTasks = FIXED_TASKS.filter(t => t.id !== 'fixed:update_linkedin');
  try {
    const storedCustom = storage.getItem('customFixedTasks');
    const custom = storedCustom ? JSON.parse(storedCustom) || [] : [];
    const storedDeleted = storage.getItem('deletedTaskIds');
    const deleted = storedDeleted ? JSON.parse(storedDeleted) || [] : [];

    const merged = [...defaultTasks];
    custom.forEach(c => {
      const idx = merged.findIndex(t => t.id === c.id);
      if (idx !== -1) {
        merged[idx] = c;
      } else {
        merged.push(c);
      }
    });
    return merged.filter(t => !deleted.includes(t.id));
  } catch {
    return defaultTasks;
  }
};

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [currentBlock, setCurrentBlock] = useState(null);
  const [nextBlock, setNextBlock] = useState(null);
  const [blockProgress, setBlockProgress] = useState(0);

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

  // Manage Page states
  const [manageTab, setManageTab] = useState('fixed');
  const [newFixedTitle, setNewFixedTitle] = useState('');
  const [newFixedCategory, setNewFixedCategory] = useState('OPS');
  const [newFixedXp, setNewFixedXp] = useState(25);
  const [newFixedStat, setNewFixedStat] = useState('OPS');
  const [selectedManageChain, setSelectedManageChain] = useState('NETWORKING');
  const [newChainName, setNewChainName] = useState('');
  const [newSchedStart, setNewSchedStart] = useState('09:00');
  const [newSchedEnd, setNewSchedEnd] = useState('10:00');
  const [newSchedLabel, setNewSchedLabel] = useState('');
  const [newSchedType, setNewSchedType] = useState('ROADMAP');
  const [newSchedDesc, setNewSchedDesc] = useState('');

  // Custom task and schedule override states
  const [deletedTaskIds, setDeletedTaskIds] = useState(() => {
    try {
      const stored = storage.getItem('deletedTaskIds');
      return stored ? JSON.parse(stored) || [] : [];
    } catch {
      return [];
    }
  });

  const [customFixedTasks, setCustomFixedTasks] = useState(() => {
    try {
      const stored = storage.getItem('customFixedTasks');
      return stored ? JSON.parse(stored) || [] : [];
    } catch {
      return [];
    }
  });

  const [fixedTasks, setFixedTasks] = useState(() => {
    return getDynamicFixedTasks();
  });

  const [chains, setChains] = useState(() => {
    const defaultChains = { ...CHAINS };
    try {
      const storedCustom = storage.getItem('customChains');
      if (storedCustom) {
        const custom = JSON.parse(storedCustom) || {};
        return { ...defaultChains, ...custom };
      }
    } catch { }
    return defaultChains;
  });

  const [schedule, setSchedule] = useState(() => {
    try {
      const storedCustom = storage.getItem('customSchedule');
      if (storedCustom) {
        const parsed = JSON.parse(storedCustom);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { }
    return SCHEDULE;
  });

  const updateFixedTasksList = (newCustom, nextDeleted) => {
    setCustomFixedTasks(newCustom);
    setDeletedTaskIds(nextDeleted);
    storage.setItem('customFixedTasks', JSON.stringify(newCustom));
    storage.setItem('deletedTaskIds', JSON.stringify(nextDeleted));
    setFixedTasks(getDynamicFixedTasks());
    syncWithServer();
  };

  const saveCustomChains = (updatedChains) => {
    setChains(updatedChains);
    storage.setItem('customChains', JSON.stringify(updatedChains));
    syncWithServer();
  };

  const saveCustomSchedule = (updatedSchedule) => {
    const sorted = [...updatedSchedule].sort((a, b) => a.start.localeCompare(b.start));
    setSchedule(sorted);
    storage.setItem('customSchedule', JSON.stringify(sorted));
    syncWithServer();
  };

  // Holiday states
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [holidayDate, setHolidayDate] = useState(getTodayString());
  const [holidayReason, setHolidayReason] = useState('');
  const [isTodayHoliday, setIsTodayHoliday] = useState(() => {
    return storage.getItem(`holiday:${getTodayString()}`) !== null;
  });

  // Calendar and Event System states
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [eventName, setEventName] = useState('');
  const [eventStartDate, setEventStartDate] = useState(getTodayString());
  const [eventEndDate, setEventEndDate] = useState(getTodayString());
  const [eventMissionsActive, setEventMissionsActive] = useState(true);
  const [eventColor, setEventColor] = useState('amber');
  const [events, setEvents] = useState(() => {
    try {
      const saved = storage.getItem('events');
      return saved ? JSON.parse(saved) || [] : [];
    } catch {
      return [];
    }
  });

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
      } catch { }
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
      } catch { }
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

    // Calculate active days in last 7 days (non-holiday, non-suspended)
    let activeDays7 = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      const isHoliday = storage.getItem(`holiday:${dateStr}`) !== null;
      const isSuspended = events.some(evt =>
        evt.missionsActive === false && dateStr >= evt.startDate && dateStr <= evt.endDate
      );
      if (!isHoliday && !isSuspended) {
        activeDays7++;
      }
    }
    if (activeDays7 === 0) activeDays7 = 1;

    // Count completions of fixedTasks in last 7 days:
    const counts7Days = {};
    fixedTasks.forEach(t => {
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
                  const fixedTask = fixedTasks.find(t => t.title === log.taskName);
                  if (fixedTask) {
                    counts7Days[fixedTask.id] = (counts7Days[fixedTask.id] || 0) + 1;
                  }
                }
              });
            }
          } catch { }
        }
      }
    }

    // 1. SIGINT — Technical knowledge
    // = (total ROADMAP + LABS chain steps permanently completed across all chains) / (total ROADMAP + LABS chain steps defined) × 100
    let totalRoadmapLabsDefined = 0;
    let totalRoadmapLabsCompleted = 0;
    Object.keys(chains).forEach(chainName => {
      chains[chainName].forEach(step => {
        if (step.category === 'ROADMAP' || step.category === 'LABS') {
          totalRoadmapLabsDefined++;
        }
      });
      const completedCount = chainProgress[chainName] || 0;
      for (let i = 0; i < completedCount; i++) {
        const step = chains[chainName][i];
        if (step && (step.category === 'ROADMAP' || step.category === 'LABS')) {
          totalRoadmapLabsCompleted++;
        }
      }
    });
    const sigint = totalRoadmapLabsDefined > 0 ? Math.min(100, Math.round((totalRoadmapLabsCompleted / totalRoadmapLabsDefined) * 100)) : 0;

    // 2. OPS — Execution speed
    // = (OPS-tagged fixed tasks completed in last 7 days) / (OPS-tagged fixed tasks × activeDays7) × 100
    const opsTasks = fixedTasks.filter(t => t.category === 'OPS');
    const opsCompleted = opsTasks.reduce((sum, t) => sum + (counts7Days[t.id] || 0), 0);
    const ops = opsTasks.length > 0 ? Math.min(100, Math.round((opsCompleted / (opsTasks.length * activeDays7)) * 100)) : 0;

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
    // = (COMMS chain steps completed + COMMS fixed tasks completed last 7 days) / (total COMMS steps + COMMS fixed tasks × activeDays7) × 100
    let totalCommsStepsDefined = 0;
    let totalCommsStepsCompleted = 0;
    Object.keys(chains).forEach(chainName => {
      chains[chainName].forEach(step => {
        if (step.category === 'COMMS') {
          totalCommsStepsDefined++;
        }
      });
      const completedCount = chainProgress[chainName] || 0;
      for (let i = 0; i < completedCount; i++) {
        const step = chains[chainName][i];
        if (step && step.category === 'COMMS') {
          totalCommsStepsCompleted++;
        }
      }
    });
    const commsFixedTasks = fixedTasks.filter(t => t.category === 'COMMS');
    const commsFixedCompleted = commsFixedTasks.reduce((sum, t) => sum + (counts7Days[t.id] || 0), 0);
    const comms = (totalCommsStepsDefined + commsFixedTasks.length * activeDays7) > 0
      ? Math.min(100, Math.round(((totalCommsStepsCompleted + commsFixedCompleted) / (totalCommsStepsDefined + commsFixedTasks.length * activeDays7)) * 100))
      : 0;

    // 5. DISCIPLINE — Schedule adherence
    // = (DISCIPLINE fixed tasks completed last 7 days) / (DISCIPLINE fixed tasks × activeDays7) × 100
    const disciplineTasks = fixedTasks.filter(t => t.category === 'DISCIPLINE');
    const disciplineCompleted = disciplineTasks.reduce((sum, t) => sum + (counts7Days[t.id] || 0), 0);
    const discipline = disciplineTasks.length > 0 ? Math.min(100, Math.round((disciplineCompleted / (disciplineTasks.length * activeDays7)) * 100)) : 0;

    // 6. ENDURANCE — Physical/mental
    // = (PHYSICAL + SOCIAL fixed tasks completed last 7 days) / ((PHYSICAL + SOCIAL fixed tasks) × activeDays7) × 100
    const enduranceTasks = fixedTasks.filter(t => t.category === 'PHYSICAL' || t.category === 'SOCIAL');
    const enduranceCompleted = enduranceTasks.reduce((sum, t) => sum + (counts7Days[t.id] || 0), 0);
    const endurance = enduranceTasks.length > 0 ? Math.min(100, Math.round((enduranceCompleted / (enduranceTasks.length * activeDays7)) * 100)) : 0;

    return {
      sigint,
      ops,
      arsenal,
      comms,
      discipline,
      endurance
    };
  }, [dailyState.completedTaskIds, chainProgress, fixedTasks, chains, events]);

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
        } catch { }
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
          const chain = chains[chainName];
          if (chain && chain[stepIdx]) {
            const task = chain[stepIdx];
            if (task.category === 'LABS' || task.category === 'BUILD') {
              labsBuildCount++;
            }
          }
        }
      } else {
        const task = fixedTasks.find(t => t.id === id);
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
        } catch { }
      }
    });
    const labsBuildPct = Math.min(100, Math.round((labsBuildCount / 40) * 100));
    const labsBuildContribution = labsBuildPct * 0.15;

    const totalPct = Math.round(sigintContribution + applyRolesContribution + commsContribution + labsBuildContribution);
    return Math.min(100, totalPct);
  }, [computedStats, dailyState.completedTaskIds, chains, fixedTasks]);

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
  const [todaysDomain, setTodaysDomain] = useState('NETWORKING');
  const [isSkillMapExpanded, setIsSkillMapExpanded] = useState(() => {
    const saved = storage.getItem('isSkillMapExpanded');
    return saved !== null ? saved === 'true' : true;
  });
  const [isLifeMetricsExpanded, setIsLifeMetricsExpanded] = useState(() => {
    const saved = storage.getItem('isLifeMetricsExpanded');
    return saved !== null ? saved === 'true' : true;
  });
  const [weeklyReview, setWeeklyReview] = useState(null);
  const [isWeeklyReviewDismissed, setIsWeeklyReviewDismissed] = useState(false);

  // Load or initialize today's active rotating domain & check day transition
  useEffect(() => {
    const initDomainAndTransition = async () => {
      const rotationOrder = ['NETWORKING', 'LINUX', 'SOC_OPERATIONS', 'WEB_SECURITY', 'TOOLS_MASTERY', 'ACTIVE_DIRECTORY', 'INTERVIEW_PREP', 'THM_LABS'];
      const dayIndex = Math.floor(Date.now() / 86400000);
      const defaultDomain = rotationOrder[dayIndex % rotationOrder.length];

      const todayISO = getTodayString(); // YYYY-MM-DD
      const todayDateStr = new Date().toDateString(); // Wed May 27 2026

      let domainVal = defaultDomain;
      if (typeof window !== 'undefined' && window.storage && typeof window.storage.get === 'function') {
        try {
          const storedDateStr = await window.storage.get(`activeDomain:${todayDateStr}`);
          const storedISOStr = await window.storage.get(`activeDomain:${todayISO}`);
          const stored = storedDateStr || storedISOStr;

          if (stored) {
            domainVal = typeof stored === 'object' && stored !== null && 'value' in stored ? stored.value : (typeof stored === 'string' ? stored : defaultDomain);
          }

          await window.storage.set(`activeDomain:${todayDateStr}`, domainVal);
          await window.storage.set(`activeDomain:${todayISO}`, domainVal);
        } catch (e) {
          console.error("Failed to read/write activeDomain via window.storage", e);
        }
      } else {
        const localDateStr = storage.getItem(`activeDomain:${todayDateStr}`);
        const localISOStr = storage.getItem(`activeDomain:${todayISO}`);
        const local = localDateStr || localISOStr;

        if (local) {
          domainVal = local;
        }
        storage.setItem(`activeDomain:${todayDateStr}`, domainVal);
        storage.setItem(`activeDomain:${todayISO}`, domainVal);
      }
      setTodaysDomain(domainVal);

      // Now run async Day Transition: stored date ≠ today on app load
      let lastActiveDate = null;
      if (typeof window !== 'undefined' && window.storage && typeof window.storage.get === 'function') {
        try {
          const res = await window.storage.get('operator_completion_date');
          lastActiveDate = res ? (typeof res === 'object' && res.value !== undefined ? res.value : res) : null;
        } catch { }
      }
      if (!lastActiveDate) {
        lastActiveDate = storage.getItem('operator_completion_date');
      }

      if (lastActiveDate && lastActiveDate !== todayISO) {
        // Step 1 — Load yesterday's state first:
        let completedYesterday = [];
        let yesterdayTimes = {};
        if (typeof window !== 'undefined' && window.storage && typeof window.storage.get === 'function') {
          try {
            const yesterdayState = await window.storage.get(`state:${lastActiveDate}`);
            if (yesterdayState) {
              const val = typeof yesterdayState === 'object' && yesterdayState.value !== undefined ? yesterdayState.value : yesterdayState;
              const parsed = typeof val === 'string' ? JSON.parse(val) : val;
              completedYesterday = parsed?.completedTaskIds || [];
            }
            const yesterdayTimesRes = await window.storage.get(`completion_times:${lastActiveDate}`);
            if (yesterdayTimesRes) {
              const val = typeof yesterdayTimesRes === 'object' && yesterdayTimesRes.value !== undefined ? yesterdayTimesRes.value : yesterdayTimesRes;
              yesterdayTimes = typeof val === 'string' ? JSON.parse(val) : val;
            }
          } catch { }
        } else {
          const yesterdayStateRaw = storage.getItem(`state:${lastActiveDate}`);
          if (yesterdayStateRaw) {
            try {
              completedYesterday = JSON.parse(yesterdayStateRaw)?.completedTaskIds || [];
            } catch { }
          }
          const yesterdayTimesRaw = storage.getItem(`completion_times:${lastActiveDate}`);
          if (yesterdayTimesRaw) {
            try {
              yesterdayTimes = JSON.parse(yesterdayTimesRaw) || {};
            } catch { }
          }
        }

        // Step 2 — Advance chainProgress for every chain task completed yesterday:
        let localChainProg = {};
        if (typeof window !== 'undefined' && window.storage && typeof window.storage.get === 'function') {
          try {
            const res = await window.storage.get('chainProgress');
            if (res) {
              const val = typeof res === 'object' && res.value !== undefined ? res.value : res;
              localChainProg = typeof val === 'string' ? JSON.parse(val) : val;
            }
          } catch { }
        }
        if (!localChainProg || Object.keys(localChainProg).length === 0) {
          const localSaved = storage.getItem('chainProgress');
          if (localSaved) {
            try {
              localChainProg = JSON.parse(localSaved) || {};
            } catch { }
          }
        }

        const newChainProgress = {
          'NETWORKING': 0,
          'LINUX': 0,
          'SOC OPERATIONS': 0,
          'WEB SECURITY': 0,
          'TOOLS MASTERY': 0,
          'ACTIVE DIRECTORY': 0,
          'INTERVIEW PREP': 0,
          'THM / LABS': 0,
          ...localChainProg
        };

        for (const taskId of completedYesterday) {
          for (const [chainId, chain] of Object.entries(CHAINS)) {
            const tasksArray = Array.isArray(chain) ? chain : (chain.tasks || []);
            let stepIndex = -1;
            if (taskId.startsWith(`chain:${chainId}:`)) {
              stepIndex = parseInt(taskId.split(':')[2], 10);
            } else {
              stepIndex = tasksArray.findIndex(t => t.id === taskId);
            }

            if (stepIndex !== -1) {
              const currentStep = newChainProgress[chainId] || 0;
              if (stepIndex === currentStep) {
                newChainProgress[chainId] = currentStep + 1;
              }
            }
          }
        }

        setChainProgress(newChainProgress);
        storage.setItem('chainProgress', JSON.stringify(newChainProgress));
        if (typeof window !== 'undefined' && window.storage && typeof window.storage.set === 'function') {
          try {
            await window.storage.set('chainProgress', JSON.stringify(newChainProgress));
          } catch (e) {
            console.warn("window.storage.set chainProgress failed", e);
          }
        }

        const isYesterdayHoliday = storage.getItem(`holiday:${lastActiveDate}`) !== null;
        let yesterdayEvents = [];
        try {
          const saved = storage.getItem('events');
          if (saved) yesterdayEvents = JSON.parse(saved) || [];
        } catch { }
        const isYesterdaySuppressed = yesterdayEvents.some(evt =>
          evt.missionsActive === false && lastActiveDate >= evt.startDate && lastActiveDate <= evt.endDate
        );

        // Compile logs for yesterday
        const logEntries = [];
        getDynamicFixedTasks().forEach(task => {
          const isCompleted = completedYesterday.includes(task.id);
          if (isCompleted) {
            logEntries.push({
              taskName: task.title,
              tag: task.category,
              xp: task.xp,
              completedAt: yesterdayTimes[task.id] || `${lastActiveDate}T12:00:00.000Z`,
              type: 'completed'
            });
          } else if (!isYesterdayHoliday && !isYesterdaySuppressed) {
            const isMissedPenalized = ['ROADMAP', 'COMMS', 'DISCIPLINE'].includes(task.category);
            logEntries.push({
              taskName: task.title,
              tag: task.category,
              xp: task.xp,
              completedAt: null,
              type: 'missed',
              ...(isMissedPenalized ? { xpPenalty: -Math.floor(task.xp * 0.5) } : {})
            });
          }
        });

        completedYesterday.forEach(taskId => {
          if (taskId.startsWith('chain:')) {
            const parts = taskId.split(':');
            if (parts.length === 3) {
              const chainName = parts[1];
              const stepIdx = parseInt(parts[2], 10);
              const chain = chains[chainName];
              if (chain && chain[stepIdx]) {
                const stepTask = chain[stepIdx];
                logEntries.push({
                  taskName: stepTask.title,
                  tag: stepTask.category,
                  xp: stepTask.xp,
                  completedAt: yesterdayTimes[taskId] || `${lastActiveDate}T12:00:00.000Z`,
                  type: 'completed'
                });
              }
            }
          }
        });

        storage.setItem(`log:${lastActiveDate}`, JSON.stringify(logEntries));
        if (typeof window !== 'undefined' && window.storage && typeof window.storage.set === 'function') {
          try {
            await window.storage.set(`log:${lastActiveDate}`, JSON.stringify(logEntries));
          } catch (e) {
            console.warn("window.storage.set log failed", e);
          }
        }

        // Clean up yesterday's completed project tasks and completion times
        ['ad-lab', 'threat-intel', 'cloud-scanner'].forEach(id => {
          storage.removeItem(`projectCompleted:${id}`);
        });
        storage.removeItem(`completion_times:${lastActiveDate}`);

        // Commit operator_completion_date as todayISO
        storage.setItem('operator_completion_date', todayISO);
        if (typeof window !== 'undefined' && window.storage && typeof window.storage.set === 'function') {
          try {
            await window.storage.set('operator_completion_date', todayISO);
          } catch (e) {
            console.warn("window.storage.set operator_completion_date failed", e);
          }
        }

        // Step 3 — Then create fresh today state with no completed tasks
        const freshTodayState = { completedTaskIds: [], unlockedChainSteps: {} };
        setDailyState(freshTodayState);
        storage.setItem(`state:${todayISO}`, JSON.stringify(freshTodayState));
        if (typeof window !== 'undefined' && window.storage && typeof window.storage.set === 'function') {
          try {
            await window.storage.set(`state:${todayISO}`, JSON.stringify(freshTodayState));
          } catch (e) {
            console.warn("window.storage.set state failed", e);
          }
        }
      }
    };
    initDomainAndTransition();
  }, []);

  // Missed task penalty banner state
  const [showPenaltyBanner, setShowPenaltyBanner] = useState(() => {
    const today = getTodayString();
    const dismissed = storage.getItem(`dismissed_banner:${today}`);
    if (dismissed === 'true') return false;

    const yesterday = getYesterdayString();
    const yesterdayHoliday = storage.getItem(`holiday:${yesterday}`) !== null;
    let yesterdayEvents = [];
    try {
      const saved = storage.getItem('events');
      if (saved) yesterdayEvents = JSON.parse(saved) || [];
    } catch { }
    const yesterdaySuppressed = yesterdayEvents.some(evt =>
      evt.missionsActive === false && yesterday >= evt.startDate && yesterday <= evt.endDate
    );

    if (yesterdayHoliday || yesterdaySuppressed) return false;

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
        ...fixedTasks.map(t => ({ id: t.id, name: t.title, tag: t.category })),
        ...Object.keys(chains).flatMap(chainName =>
          chains[chainName].map((task, stepIdx) => ({
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
  }, [isAuthenticated, fixedTasks, chains]);

  // Helper to retrieve completed fixed task counts for the last 30 days
  const getCompletedCountsForLast30Days = () => {
    const today = getTodayString();
    const counts = {};

    fixedTasks.forEach(t => {
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
                  const fixedTask = fixedTasks.find(t => t.title === log.taskName);
                  if (fixedTask) {
                    counts[fixedTask.id] = (counts[fixedTask.id] || 0) + 1;
                  }
                }
              });
            }
          } catch { }
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
          fixedTasks.forEach(task => {
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
                const chain = chains[chainName];
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
            } catch { }
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
  }, [isAuthenticated, computedStats, chainProgress, mainObjectiveProgress, fixedTasks, chains]);

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
    const holidaysToSync = {};

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
        } else if (k.startsWith('holiday:')) {
          holidaysToSync[k] = storage.getItem(k);
        }
      }
    });

    const statusToSync = storage.getItem('projectStatus') ? JSON.parse(storage.getItem('projectStatus')) : {};
    const progressToSync = storage.getItem('projectProgress') ? JSON.parse(storage.getItem('projectProgress')) : {};

    const customFixedTasksToSync = storage.getItem('customFixedTasks') ? JSON.parse(storage.getItem('customFixedTasks')) : [];
    const deletedTaskIdsToSync = storage.getItem('deletedTaskIds') ? JSON.parse(storage.getItem('deletedTaskIds')) : [];
    const customChainsToSync = storage.getItem('customChains') ? JSON.parse(storage.getItem('customChains')) : {};
    const customScheduleToSync = storage.getItem('customSchedule') ? JSON.parse(storage.getItem('customSchedule')) : [];
    const eventsToSync = storage.getItem('events') ? JSON.parse(storage.getItem('events')) : [];

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
          projectProgress: progressToSync,
          customFixedTasks: customFixedTasksToSync,
          deletedTaskIds: deletedTaskIdsToSync,
          customChains: customChainsToSync,
          customSchedule: customScheduleToSync,
          events: eventsToSync,
          holidays: holidaysToSync
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

  const syncWithServer = (updatedProfile = profile, updatedState = dailyState, updatedChainProgress = chainProgress) => {
    const activePasscode = passcode || storage.getItem('operator_passcode');
    if (activePasscode) {
      const today = getTodayString();
      const timesToday = storage.getItem(`completion_times:${today}`) ? JSON.parse(storage.getItem(`completion_times:${today}`)) : {};
      saveProgressToServer(activePasscode, updatedState, updatedProfile, updatedChainProgress, timesToday);
    }
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

          // 1. Restore holidays
          if (remoteData.holidays) {
            Object.keys(remoteData.holidays).forEach(k => {
              if (k.startsWith('holiday:')) {
                storage.setItem(k, remoteData.holidays[k]);
              }
            });
            const todayStr = getTodayString();
            if (remoteData.holidays[`holiday:${todayStr}`]) {
              setIsTodayHoliday(true);
            } else {
              setIsTodayHoliday(false);
            }
          } else {
            setIsTodayHoliday(storage.getItem(`holiday:${getTodayString()}`) !== null);
          }

          // Restore customFixedTasks
          let resolvedCustomFixedTasks = [];
          if (Array.isArray(remoteData.customFixedTasks)) {
            resolvedCustomFixedTasks = remoteData.customFixedTasks;
            setCustomFixedTasks(resolvedCustomFixedTasks);
            storage.setItem('customFixedTasks', JSON.stringify(resolvedCustomFixedTasks));
          }

          // Restore deletedTaskIds
          let resolvedDeletedTaskIds = [];
          if (Array.isArray(remoteData.deletedTaskIds)) {
            resolvedDeletedTaskIds = remoteData.deletedTaskIds;
            setDeletedTaskIds(resolvedDeletedTaskIds);
            storage.setItem('deletedTaskIds', JSON.stringify(resolvedDeletedTaskIds));
          }

          // Force update fixedTasks list state
          const defaultTasks = FIXED_TASKS.filter(t => t.id !== 'fixed:update_linkedin');
          const merged = [...defaultTasks];
          resolvedCustomFixedTasks.forEach(c => {
            const idx = merged.findIndex(t => t.id === c.id);
            if (idx !== -1) {
              merged[idx] = c;
            } else {
              merged.push(c);
            }
          });
          const activeFixedTasks = merged.filter(t => !resolvedDeletedTaskIds.includes(t.id));
          setFixedTasks(activeFixedTasks);

          // Restore customChains
          if (remoteData.customChains && typeof remoteData.customChains === 'object') {
            const defaultChains = { ...CHAINS };
            setChains({ ...defaultChains, ...remoteData.customChains });
            storage.setItem('customChains', JSON.stringify(remoteData.customChains));
          }

          // Restore customSchedule
          if (Array.isArray(remoteData.customSchedule)) {
            const sorted = [...remoteData.customSchedule].sort((a, b) => a.start.localeCompare(b.start));
            setSchedule(sorted.length > 0 ? sorted : SCHEDULE);
            storage.setItem('customSchedule', JSON.stringify(remoteData.customSchedule));
          }

          // Restore events
          if (Array.isArray(remoteData.events)) {
            setEvents(remoteData.events);
            storage.setItem('events', JSON.stringify(remoteData.events));
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

          // Restore logs
          if (remoteData.logs) {
            Object.keys(remoteData.logs).forEach(k => {
              storage.setItem(k, remoteData.logs[k]);
            });
          }

          // 2. Profile resolution & Streak maintenance
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

          // 3. Day Transition or Today State Restore
          let resolvedState = { completedTaskIds: [], unlockedChainSteps: {} };
          let resolvedChainProgress = {
            'NETWORKING': 0,
            'LINUX': 0,
            'SOC OPERATIONS': 0,
            'WEB SECURITY': 0,
            'TOOLS MASTERY': 0,
            'ACTIVE DIRECTORY': 0,
            'INTERVIEW PREP': 0,
            'THM / LABS': 0,
            ...(remoteData.chainProgress || {})
          };

          const lastActiveDate = resolvedProfile.lastActiveDate;
          const dayTransitionNeeded = lastActiveDate && lastActiveDate !== today;

          if (dayTransitionNeeded) {
            // Day has transitioned! Compile logs for yesterday
            const completedYesterday = remoteData.stateToday ? (remoteData.stateToday.completedTaskIds || []) : [];
            const yesterdayTimes = remoteData.completionTimesToday || {};

            // Advance chainProgress for chain tasks completed yesterday
            for (const taskId of completedYesterday) {
              for (const [chainId, chain] of Object.entries(CHAINS)) {
                const tasksArray = Array.isArray(chain) ? chain : (chain.tasks || []);
                let stepIndex = -1;
                if (taskId.startsWith(`chain:${chainId}:`)) {
                  stepIndex = parseInt(taskId.split(':')[2], 10);
                } else {
                  stepIndex = tasksArray.findIndex(t => t.id === taskId);
                }

                if (stepIndex !== -1) {
                  const currentStep = resolvedChainProgress[chainId] || 0;
                  if (stepIndex === currentStep) {
                    resolvedChainProgress[chainId] = currentStep + 1;
                  }
                }
              }
            }

            const isYesterdayHoliday = storage.getItem(`holiday:${lastActiveDate}`) !== null;
            const isYesterdaySuppressed = remoteData.events && remoteData.events.some(evt =>
              evt.missionsActive === false && lastActiveDate >= evt.startDate && lastActiveDate <= evt.endDate
            );

            // Compile logs
            const logEntries = [];
            activeFixedTasks.forEach(task => {
              const isCompleted = completedYesterday.includes(task.id);
              if (isCompleted) {
                logEntries.push({
                  taskName: task.title,
                  tag: task.category,
                  xp: task.xp,
                  completedAt: yesterdayTimes[task.id] || `${lastActiveDate}T12:00:00.000Z`,
                  type: 'completed'
                });
              } else if (!isYesterdayHoliday && !isYesterdaySuppressed) {
                const isMissedPenalized = ['ROADMAP', 'COMMS', 'DISCIPLINE'].includes(task.category);
                logEntries.push({
                  taskName: task.title,
                  tag: task.category,
                  xp: task.xp,
                  completedAt: null,
                  type: 'missed',
                  ...(isMissedPenalized ? { xpPenalty: -Math.floor(task.xp * 0.5) } : {})
                });
              }
            });

            completedYesterday.forEach(taskId => {
              if (taskId.startsWith('chain:')) {
                const parts = taskId.split(':');
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
                      completedAt: yesterdayTimes[taskId] || `${lastActiveDate}T12:00:00.000Z`,
                      type: 'completed'
                    });
                  }
                }
              }
            });

            storage.setItem(`log:${lastActiveDate}`, JSON.stringify(logEntries));
            storage.removeItem(`completion_times:${lastActiveDate}`);

            // Fresh today completion times
            storage.setItem(`completion_times:${today}`, JSON.stringify({}));
            storage.setItem(`state:${today}`, JSON.stringify(resolvedState));
            storage.setItem('chainProgress', JSON.stringify(resolvedChainProgress));

            setDailyState(resolvedState);
            setChainProgress(resolvedChainProgress);
            setProfile(resolvedProfile);
            storage.setItem('operator_profile', JSON.stringify(resolvedProfile));

            // Sync newly transitioned state package to Cloudflare KV
            saveProgressToServer(password, resolvedState, resolvedProfile, resolvedChainProgress, {});
          } else {
            // No day transition needed: just restore today's values
            if (remoteData.stateToday) {
              resolvedState = {
                completedTaskIds: Array.isArray(remoteData.stateToday.completedTaskIds) ? remoteData.stateToday.completedTaskIds : [],
                unlockedChainSteps: (remoteData.stateToday.unlockedChainSteps && typeof remoteData.stateToday.unlockedChainSteps === 'object') ? remoteData.stateToday.unlockedChainSteps : {}
              };
            }

            let resolvedCompletionTimes = {};
            if (remoteData.completionTimesToday && typeof remoteData.completionTimesToday === 'object') {
              resolvedCompletionTimes = remoteData.completionTimesToday;
            }
            storage.setItem(`completion_times:${today}`, JSON.stringify(resolvedCompletionTimes));
            storage.setItem(`state:${today}`, JSON.stringify(resolvedState));
            storage.setItem('chainProgress', JSON.stringify(resolvedChainProgress));
            storage.setItem('operator_profile', JSON.stringify(resolvedProfile));

            setDailyState(resolvedState);
            setChainProgress(resolvedChainProgress);
            setProfile(resolvedProfile);
          }

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
            } catch { }
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
    const missedTasks = [];
    let totalXpEarned = 0;

    dailyState.completedTaskIds.forEach(id => {
      if (id.startsWith('chain:')) {
        const parts = id.split(':');
        if (parts.length === 3) {
          const chainName = parts[1];
          const stepIdx = parseInt(parts[2], 10);
          const chain = chains[chainName];
          if (chain && chain[stepIdx]) {
            const task = chain[stepIdx];
            completedTasks.push({ name: task.title, tag: task.category, xp: task.xp });
            totalXpEarned += task.xp;
          }
        }
      } else {
        const task = fixedTasks.find(t => t.id === id);
        if (task) {
          completedTasks.push({ name: task.title, tag: task.category, xp: task.xp });
          totalXpEarned += task.xp;
        }
      }
    });

    // Include completed project tasks today:
    Object.keys(projectCompletedTasks).forEach(projId => {
      const project = PROJECTS.find(p => p.id === projId);
      const completedToday = projectCompletedTasks[projId] || [];
      completedToday.forEach(taskId => {
        const task = project?.tasks.find(t => t.id === taskId);
        if (task) {
          completedTasks.push({ name: task.name, tag: 'OPS', xp: task.xp });
          totalXpEarned += task.xp;
        }
      });
    });

    fixedTasks.forEach(task => {
      const isCompleted = dailyState.completedTaskIds.includes(task.id);
      if (!isCompleted) {
        missedTasks.push({ name: task.title, tag: task.category });

        const isTodayHoliday = storage.getItem(`holiday:${today}`) !== null;
        let todayEvents = [];
        try {
          const saved = storage.getItem('events');
          if (saved) todayEvents = JSON.parse(saved) || [];
        } catch { }
        const isTodaySuppressed = todayEvents.some(evt =>
          evt.missionsActive === false && today >= evt.startDate && today <= evt.endDate
        );

        if (!isTodayHoliday && !isTodaySuppressed) {
          const isMissedPenalized = ['ROADMAP', 'COMMS', 'DISCIPLINE'].includes(task.category);
          if (isMissedPenalized) {
            totalXpEarned -= Math.floor(task.xp * 0.5);
          }
        }
      }
    });

    const payload = {
      completed: completedTasks.map(t => ({ name: t.name, tag: t.tag, xp: t.xp })),
      missed: missedTasks.map(t => ({ name: t.name, tag: t.tag })),
      xpEarned: totalXpEarned,
      chainProgress: chainProgress
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
      setDebriefText('COMMS ERROR: Commander unavailable. File your own report.');
    } finally {
      setDebriefLoading(false);
    }
  };

  const closeDebriefModal = () => {
    setShowDebriefModal(false);
    if (!isDayClosed) {
      const today = getTodayString();
      const logEntries = [];

      const isTodayHoliday = storage.getItem(`holiday:${today}`) !== null;
      let todayEvents = [];
      try {
        const saved = storage.getItem('events');
        if (saved) todayEvents = JSON.parse(saved) || [];
      } catch { }
      const isTodaySuppressed = todayEvents.some(evt =>
        evt.missionsActive === false && today >= evt.startDate && today <= evt.endDate
      );

      // Process today's fixed tasks (both completed and missed)
      fixedTasks.forEach(task => {
        const isCompleted = dailyState.completedTaskIds.includes(task.id);
        if (isCompleted) {
          logEntries.push({
            taskName: task.title,
            tag: task.category,
            xp: task.xp,
            completedAt: (() => {
              const timesRaw = storage.getItem(`completion_times:${today}`);
              if (timesRaw) {
                try {
                  const parsed = JSON.parse(timesRaw);
                  if (parsed && typeof parsed === 'object') {
                    return parsed[task.id] || new Date().toISOString();
                  }
                } catch { }
              }
              return new Date().toISOString();
            })(),
            type: 'completed'
          });
        } else if (!isTodayHoliday && !isTodaySuppressed) {
          const isMissedPenalized = !isCompleted && ['ROADMAP', 'COMMS', 'DISCIPLINE'].includes(task.category);
          logEntries.push({
            taskName: task.title,
            tag: task.category,
            xp: task.xp,
            completedAt: null,
            type: 'missed',
            ...(isMissedPenalized ? { xpPenalty: -Math.floor(task.xp * 0.5) } : {})
          });
        }
      });

      // Process today's completed chain tasks
      dailyState.completedTaskIds.forEach(id => {
        if (id.startsWith('chain:')) {
          const parts = id.split(':');
          if (parts.length === 3) {
            const chainName = parts[1];
            const stepIdx = parseInt(parts[2], 10);
            const chain = chains[chainName];
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
                    } catch { }
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
          } catch { }
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

  // Setup schedule highlighter and block synchronization
  useEffect(() => {
    const refresh = () => {
      const cur = getCurrentBlock(SCHEDULE);
      if (cur) {
        setCurrentBlock(cur.current);
        setBlockProgress(cur.progress);
      } else {
        setCurrentBlock(null);
        setBlockProgress(0);
      }
      const nxt = getNextBlock(SCHEDULE);
      setNextBlock(nxt);

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

    refresh();
    const interval = setInterval(refresh, 60000);
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
  const handleToggleMission = async (taskId, xpReward, isChainTask, chainName, stepIdx, e) => {
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
    let updatedProgress = chainProgress;

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

        // chainProgress is not updated during the day to ensure it never decrements/resets
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

        // chainProgress is not updated during the day to ensure it never decrements/resets
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
        saveProgressToServer(activePasscode, updatedState, newProfile, updatedProgress, completionTimes);
      }

      return newProfile;
    });
  };

  // Determine active & visible chain task steps dynamically based on starting perm steps
  const getVisibleChainSteps = (chainName) => {
    const chain = chains[chainName];
    if (!chain) return [];
    const tasksArray = Array.isArray(chain) ? chain : (chain.tasks || []);
    const currentIdx = chainProgress[chainName] !== undefined ? chainProgress[chainName] : 0;

    if (currentIdx >= tasksArray.length) {
      return [];
    }

    const visible = [];
    let idx = currentIdx;
    while (idx < tasksArray.length) {
      const taskId = `chain:${chainName}:${idx}`;
      const isCompleted = dailyState.completedTaskIds.includes(taskId);
      visible.push({
        id: taskId,
        stepIdx: idx,
        task: tasksArray[idx]
      });

      if (isCompleted) {
        idx++;
      } else {
        break;
      }
    }

    return visible;
  };

  const DAILY_OPS_FIXED_TASKS = useMemo(() => {
    return fixedTasks.filter(t => t.category !== 'PHYSICAL' && t.category !== 'DISCIPLINE');
  }, [fixedTasks]);

  const SIDE_OPS_FIXED_TASKS = useMemo(() => {
    return fixedTasks.filter(t => t.category === 'PHYSICAL' || t.category === 'DISCIPLINE');
  }, [fixedTasks]);


  // ==========================================
  // RENDER HELPERS FOR MULTI-PAGE SIDEBAR LAYOUT
  // ==========================================

  const renderScheduleBlock = () => {
    if (!currentBlock) {
      return (
        <div className="schedule-card" style={{ border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.02)' }}>
          <div className="schedule-header" style={{ justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--text-muted)', fontWeight: 'bold', letterSpacing: '0.1em' }}>
              [ OFF HOURS — REST AND RECOVER ]
            </span>
          </div>
        </div>
      );
    }

    const activeBlock = currentBlock;
    const progressPct = blockProgress * 100;

    return (
      <div className="schedule-card">
        <div className="schedule-header">
          <span className="schedule-badge now" style={{ display: 'inline-block' }}>NOW</span>
          <span className="timeline-type-tag" style={{ color: 'var(--accent-amber)', borderColor: 'var(--accent-amber)' }}>{activeBlock.type}</span>
        </div>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--accent-amber)', letterSpacing: '0.05em' }}>
          {activeBlock.label}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)' }}>
          TIME RANGE: {activeBlock.start} - {activeBlock.end}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-main)', marginTop: '4px' }}>
          {activeBlock.description}
        </div>
        <div className="schedule-progress-outer">
          <div className="schedule-progress-inner" style={{ width: `${progressPct}%` }}></div>
        </div>
        {nextBlock && (
          <div className="schedule-next-label">
            NEXT: {nextBlock.label} AT {nextBlock.start}
          </div>
        )}
      </div>
    );
  };

  const renderTodaysBriefing = () => {
    const xpToday = (() => {
      let total = 0;
      dailyState.completedTaskIds.forEach(id => {
        if (id.startsWith('chain:')) {
          const parts = id.split(':');
          if (parts.length === 3) {
            const chainName = parts[1];
            const stepIdx = parseInt(parts[2], 10);
            const chain = CHAINS[chainName];
            if (chain && chain[stepIdx]) {
              total += chain[stepIdx].xp;
            }
          }
        } else {
          const task = FIXED_TASKS.find(t => t.id === id);
          if (task) {
            total += task.xp;
          }
        }
      });
      Object.keys(projectCompletedTasks).forEach(projId => {
        const project = PROJECTS.find(p => p.id === projId);
        const completedToday = projectCompletedTasks[projId] || [];
        completedToday.forEach(taskId => {
          const task = project?.tasks.find(t => t.id === taskId);
          if (task) {
            total += task.xp;
          }
        });
      });
      return total;
    })();

    const tasksLeft = (() => {
      const fixedLeft = fixedTasks.filter(t => !dailyState.completedTaskIds.includes(t.id)).length;
      const mappedActive = mapDomainKey(todaysDomain);
      const currentStep = chainProgress[mappedActive] || 0;
      const chain = chains[mappedActive];
      const chainTaskId = `chain:${mappedActive}:${currentStep}`;
      const chainLeft = (chain && currentStep < chain.length && !dailyState.completedTaskIds.includes(chainTaskId)) ? 1 : 0;
      let projectLeft = 0;
      if (activeProject) {
        const prog = projectProgress[activeProject.id] || 0;
        const completedToday = projectCompletedTasks[activeProject.id] || [];
        if (prog < activeProject.tasks.length && completedToday.length === 0) {
          projectLeft = 1;
        }
      }
      return fixedLeft + chainLeft + projectLeft;
    })();

    const chainId = mapDomainKey(todaysDomain);
    const activeSuppressedEvent = getActiveMissionsSuppressedEventToday();

    return (
      <section className="main-objective-section" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h2 className="panel-title">Today's Briefing</h2>
        <hr className="section-divider" />
        <div className="main-objective-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            fontWeight: 'bold',
            color: 'var(--accent-amber)',
            borderBottom: '1px dashed var(--border-color)',
            paddingBottom: '8px'
          }}>
            TODAY'S DOMAIN: {chainId.toUpperCase()}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              &gt; ACTIVE SKILL PATH MISSION
            </span>
            {activeSuppressedEvent ? (
              <div style={{
                background: 'rgba(100, 116, 139, 0.05)',
                border: '1px dashed var(--text-muted)',
                color: 'var(--text-muted)',
                padding: '10px 14px',
                fontSize: '13px',
                fontFamily: 'var(--font-mono)',
                textAlign: 'center'
              }}>
                [ PAUSED FOR EVENT: {activeSuppressedEvent.name.toUpperCase()} ]
              </div>
            ) : (() => {
              const chain = chains[chainId];
              if (!chain) return null;
              const tasksArray = Array.isArray(chain) ? chain : (chain.tasks || []);
              const currentIdx = chainProgress[chainId] !== undefined ? chainProgress[chainId] : 0;

              if (currentIdx >= tasksArray.length) {
                return (
                  <div style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px dashed var(--accent-green)',
                    color: 'var(--accent-green)',
                    padding: '10px 14px',
                    fontSize: '13px',
                    fontFamily: 'var(--font-mono)',
                    textAlign: 'center',
                    textShadow: '0 0 4px rgba(34, 197, 94, 0.4)'
                  }}>
                    [ {chainId} CHAIN COMPLETE — ALL STEPS CLEARED ]
                  </div>
                );
              }

              const visible = [];
              let idx = currentIdx;
              while (idx < tasksArray.length) {
                const taskId = `chain:${chainId}:${idx}`;
                const isCompleted = dailyState.completedTaskIds.includes(taskId);
                visible.push({
                  id: taskId,
                  stepIdx: idx,
                  task: tasksArray[idx],
                  completed: isCompleted
                });

                if (isCompleted) {
                  idx++;
                } else {
                  break;
                }
              }

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {visible.map(({ id, stepIdx, task, completed }) => {
                    const isJustUnlocked = justUnlockedStepId === id;
                    const displayTitle = flavors[id]?.title ?? task.name ?? task.title;
                    const briefing = flavors[id]?.briefing;
                    return (
                      <div
                        key={id}
                        className={`mission-card ${completed ? 'completed' : ''} ${isJustUnlocked ? 'unlocked-flash' : ''}`}
                        onClick={(e) => handleToggleMission(id, task.xp, true, chainId, stepIdx, e)}
                        style={{ width: '100%', padding: '10px 14px' }}
                      >
                        <div className="checkbox-container" style={{ width: '16px', height: '16px' }}>
                          <span className="checkmark-icon"></span>
                        </div>
                        <div className="mission-details" style={{ gap: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                            <span className="mission-title" style={{ fontSize: '13px' }}>{displayTitle}</span>
                            {isJustUnlocked && (
                              <span style={{
                                fontSize: '9px',
                                fontFamily: 'var(--font-mono)',
                                color: 'var(--accent-green)',
                                border: '1px solid var(--accent-green)',
                                padding: '0 3px',
                                marginLeft: '6px',
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
                              fontSize: '10px',
                              color: 'var(--text-muted)',
                              fontFamily: 'var(--font-mono)'
                            }}>
                              {briefing}
                            </span>
                          )}
                          <div className="mission-meta">
                            <span className={`badge badge-${task.category.toLowerCase()}`} style={{ fontSize: '9px', padding: '0px 4px' }}>{task.category}</span>
                            <span className="xp-reward" style={{ fontSize: '11px' }}>+{task.xp} XP</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              &gt; ACTIVE PROJECT OPS
            </span>
            {activeSuppressedEvent ? (
              <div style={{
                background: 'rgba(100, 116, 139, 0.05)',
                border: '1px dashed var(--text-muted)',
                color: 'var(--text-muted)',
                padding: '10px 14px',
                fontSize: '13px',
                fontFamily: 'var(--font-mono)',
                textAlign: 'center'
              }}>
                [ PAUSED FOR EVENT: {activeSuppressedEvent.name.toUpperCase()} ]
              </div>
            ) : activeProject ? (
              (() => {
                const progIdx = projectProgress[activeProject.id] || 0;
                const completedToday = projectCompletedTasks[activeProject.id] || [];

                if (progIdx < activeProject.tasks.length) {
                  const task = activeProject.tasks[progIdx];
                  const isCompleted = completedToday.includes(task.id);
                  return (
                    <div
                      key={task.id}
                      className={`mission-card ${isCompleted ? 'completed' : ''}`}
                      onClick={(e) => handleToggleProjectTask(activeProject.id, task.id, task.xp, e)}
                      style={{ width: '100%', padding: '10px 14px' }}
                    >
                      <div className="checkbox-container" style={{ width: '16px', height: '16px' }}>
                        <span className="checkmark-icon"></span>
                      </div>
                      <div className="mission-details" style={{ gap: '4px' }}>
                        <span className="mission-title" style={{ fontSize: '13px' }}>
                          {task.name}
                        </span>
                        <div className="mission-meta">
                          <span className="badge badge-ops" style={{ fontSize: '9px', padding: '0 4px', background: 'var(--accent-amber-dim)', border: '1px solid var(--accent-amber)', color: 'var(--accent-amber)' }}>
                            {activeProject.name} // {task.phase}
                          </span>
                          <span className="xp-reward" style={{ fontSize: '11px' }}>+{task.xp} XP</span>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div style={{
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px dashed var(--accent-green)',
                      color: 'var(--accent-green)',
                      padding: '10px 14px',
                      fontSize: '13px',
                      fontFamily: 'var(--font-mono)',
                      textAlign: 'center',
                      textShadow: '0 0 4px rgba(34, 197, 94, 0.4)'
                    }}>
                      [ ACTIVE PROJECT {activeProject.name} COMPLETE ]
                    </div>
                  );
                }
              })()
            ) : (
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px dashed var(--border-color)',
                color: 'var(--text-muted)',
                padding: '10px 14px',
                fontSize: '13px',
                fontFamily: 'var(--font-mono)',
                textAlign: 'center'
              }}>
                [ NO ACTIVE PROJECT DEPLOYED ]
              </div>
            )}
          </div>

          <div className="briefing-stats-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', fontSize: '12px' }}>
            <span className="briefing-stat-item">
              [ XP TODAY: <span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>{xpToday}</span> ]
            </span>
            <span className="briefing-stat-item">
              [ STREAK: <span style={{ color: 'var(--accent-orange)', fontWeight: 'bold' }}>{profile.streak}</span> ]
            </span>
            <span className="briefing-stat-item">
              [ TASKS LEFT: <span style={{ color: 'var(--accent-coral)', fontWeight: 'bold' }}>{tasksLeft}</span> ]
            </span>
          </div>

        </div>
      </section>
    );
  };

  const renderPriorityMissions = () => {
    const activeSuppressedEvent = getActiveMissionsSuppressedEventToday();
    const priorityMissions = (() => {
      const uncompletedFixed = fixedTasks.filter(t => !dailyState.completedTaskIds.includes(t.id));
      const sorted = [...uncompletedFixed].sort((a, b) => b.xp - a.xp);
      return sorted.slice(0, 4);
    })();

    return (
      <section className="daily-ops-section" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h2 className="panel-title">Priority Missions</h2>
        <hr className="section-divider" />
        {activeSuppressedEvent ? (
          <div className="warning-banner" style={{
            background: 'rgba(100, 116, 139, 0.05)',
            border: '1px solid var(--text-muted)',
            padding: '12px 16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--text-muted)',
            textAlign: 'center'
          }}>
            [ EVENT: {activeSuppressedEvent.name.toUpperCase()} — MISSIONS SUSPENDED ]
          </div>
        ) : (
          <div className="missions-grid">
            {priorityMissions.map(task => {
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
        )}
        <div style={{ marginTop: '12px', textAlign: 'center' }}>
          <button
            onClick={() => setActivePage('missions')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-amber)',
              fontFamily: 'var(--font-mono)',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              textDecoration: 'underline',
              letterSpacing: '0.05em'
            }}
          >
            [ VIEW ALL MISSIONS → ]
          </button>
        </div>
      </section>
    );
  };

  const renderMainObjectiveCard = () => {
    return (
      <section className="main-objective-section" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
    );
  };

  const renderProjectOps = () => {
    if (!activeProject || renderedOpsTasks.length === 0) return null;
    const activeSuppressedEvent = getActiveMissionsSuppressedEventToday();
    return (
      <section className="project-ops-section">
        <h2 className="panel-title">Project Ops // {activeProject.name}</h2>
        <hr className="section-divider" />
        {activeSuppressedEvent ? (
          <div className="warning-banner" style={{
            background: 'rgba(100, 116, 139, 0.05)',
            border: '1px solid var(--text-muted)',
            padding: '12px 16px',
            marginBottom: '24px',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--text-muted)',
            textAlign: 'center'
          }}>
            [ EVENT: {activeSuppressedEvent.name.toUpperCase()} — PROJECTS SUSPENDED ]
          </div>
        ) : (
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
        )}
      </section>
    );
  };

  const renderDailyOps = () => {
    const activeSuppressedEvent = getActiveMissionsSuppressedEventToday();
    return (
      <section className="daily-ops-section">
        <h2 className="panel-title">Daily Ops</h2>
        <hr className="section-divider" />
        {activeSuppressedEvent ? (
          <div className="warning-banner" style={{
            background: 'rgba(100, 116, 139, 0.05)',
            border: '1px solid var(--text-muted)',
            padding: '12px 16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--text-muted)',
            textAlign: 'center'
          }}>
            [ EVENT: {activeSuppressedEvent.name.toUpperCase()} — MISSIONS SUSPENDED ]
          </div>
        ) : (
          <div className="missions-grid">
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

            {Object.keys(chains).map(chainName => {
              const mappedActive = mapDomainKey(todaysDomain);
              if (chainName !== mappedActive) return null;

              const visibleSteps = getVisibleChainSteps(chainName);
              return (
                <div key={chainName} style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--accent-amber)',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontVariant: 'small-caps',
                    marginBottom: '6px'
                  }}>
                    TODAY'S SKILL: {chainName}
                  </div>
                  {visibleSteps.length === 0 ? (
                    <div style={{
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px dashed var(--accent-green)',
                      color: 'var(--accent-green)',
                      padding: '12px 16px',
                      fontSize: '13px',
                      fontFamily: 'var(--font-mono)',
                      textAlign: 'center',
                      textShadow: '0 0 4px rgba(34, 197, 94, 0.4)'
                    }}>
                      [ {chainName} CHAIN COMPLETE — ALL STEPS CLEARED ]
                    </div>
                  ) : (
                    visibleSteps.map(({ id, stepIdx, task }) => {
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
                    })
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    );
  };

  const renderSideOps = () => {
    const activeSuppressedEvent = getActiveMissionsSuppressedEventToday();
    return (
      <section className="side-ops-section">
        <h2 className="panel-title">Side Ops</h2>
        <hr className="section-divider" />
        {activeSuppressedEvent ? (
          <div className="warning-banner" style={{
            background: 'rgba(100, 116, 139, 0.05)',
            border: '1px solid var(--text-muted)',
            padding: '12px 16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--text-muted)',
            textAlign: 'center'
          }}>
            [ EVENT: {activeSuppressedEvent.name.toUpperCase()} — MISSIONS SUSPENDED ]
          </div>
        ) : (
          <div className="missions-grid">
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
        )}
      </section>
    );
  };

  const renderProjectBoard = () => {
    return (
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

                <div className="project-progress-group" style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <span>PROGRESS</span>
                    <span>{pct}% ({progressIdx}/{totalTasks})</span>
                  </div>
                  <div className="xp-bar-outer" style={{ height: '6px' }}>
                    <div className="xp-bar-inner" style={{ width: `${pct}%`, transition: 'width 0.6s ease' }}></div>
                  </div>
                </div>

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

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                  <span className="project-xp-reward" style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)' }}>
                    Daily Session XP: +{proj.dailyXP}
                  </span>

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
    );
  };

  const renderLifeMetrics = () => {
    return (
      <section className="life-metrics-section" style={{ marginTop: '24px', marginBottom: '24px' }}>
        <div
          className="panel-title-clickable"
          onClick={() => setIsLifeMetricsExpanded(prev => { const next = !prev; storage.setItem('isLifeMetricsExpanded', String(next)); return next; })}
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
    );
  };

  const renderMissionLogs = () => {
    return (
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
                      <div style={{ display: 'flex', alignItems: 'center' }}>
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
                        {storedDebrief && (
                          <button
                            onClick={() => {
                              setDebriefText(storedDebrief);
                              setDebriefError(false);
                              setDebriefLoading(false);
                              setShowDebriefModal(true);
                            }}
                            className="debrief-view-btn"
                            style={{
                              background: 'var(--bg-terminal)',
                              border: '1px solid var(--accent-amber)',
                              color: 'var(--accent-amber)',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '11px',
                              padding: '2px 8px',
                              cursor: 'pointer',
                              marginLeft: '12px',
                              boxShadow: '0 0 5px rgba(245, 166, 35, 0.2)',
                              textTransform: 'uppercase',
                              transition: 'all 0.2s'
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
                            [ VIEW DEBRIEF ]
                          </button>
                        )}
                      </div>
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
                                  color: 'var(--accent-green)',
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
                                  color: log.xpPenalty ? 'var(--accent-coral)' : 'var(--text-muted)',
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
    );
  };

  const renderSkillMap = () => {
    return (
      <section className="skill-map-section">
        <div
          className="panel-title-clickable"
          onClick={() => setIsSkillMapExpanded(prev => { const next = !prev; storage.setItem('isSkillMapExpanded', String(next)); return next; })}
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
            {['NETWORKING', 'LINUX', 'SOC OPERATIONS', 'WEB SECURITY', 'TOOLS MASTERY', 'ACTIVE DIRECTORY', 'INTERVIEW PREP', 'THM / LABS'].map(domain => {
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
                      {completedCount} / {totalSteps} ({pct}%)
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
    );
  };

  const renderCharacterSheet = () => {
    return (
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
    );
  };

  const renderFullSchedule = () => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return (
      <div className="schedule-container">
        {schedule.map((block, idx) => {
          // Check if this block is active
          const [startH, startM] = block.start.split(':').map(Number);
          const [endH, endM] = block.end.split(':').map(Number);
          const startMinutes = startH * 60 + startM;
          const endMinutes = endH * 60 + endM;

          let adjustedMinutes = currentMinutes;
          // Account for after midnight stand-down hours
          if (currentMinutes < 330) {
            adjustedMinutes = currentMinutes + 1440;
          }
          const blockStartMin = startH * 60 + startM;
          let blockEndMin = endH * 60 + endM;
          if (blockEndMin < blockStartMin) {
            blockEndMin += 1440;
          }

          const isActive = adjustedMinutes >= blockStartMin && adjustedMinutes < blockEndMin;

          return (
            <div
              key={block.id || idx}
              className={`timeline-block border-${block.type.toLowerCase()} ${isActive ? 'active-block' : ''}`}
            >
              <div className="timeline-time">{block.start} - {block.end}</div>
              <div className="timeline-details">
                <div className="timeline-header-group">
                  <span className="timeline-name">{block.label}</span>
                  <span className="timeline-desc">{block.description}</span>
                </div>
                <span className="timeline-type-tag" style={{
                  color: 'var(--accent-amber)',
                  borderColor: 'var(--accent-amber)'
                }}>{block.type}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderManagePage = () => {
    return (
      <section className="manage-section" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 className="panel-title">✎ OPERATIONAL MANAGEMENT PORTAL</h2>
        <hr className="section-divider" />

        {/* Tab navigation */}
        <div className="nav-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={() => setManageTab('fixed')}
            className={`tab-btn ${manageTab === 'fixed' ? 'active' : ''}`}
            style={{ flex: 1 }}
          >
            FIXED TASKS
          </button>
          <button
            onClick={() => setManageTab('chain')}
            className={`tab-btn ${manageTab === 'chain' ? 'active' : ''}`}
            style={{ flex: 1 }}
          >
            CHAIN TASKS
          </button>
          <button
            onClick={() => setManageTab('schedule')}
            className={`tab-btn ${manageTab === 'schedule' ? 'active' : ''}`}
            style={{ flex: 1 }}
          >
            SCHEDULE
          </button>
        </div>

        {/* FIXED TASKS TAB */}
        {manageTab === 'fixed' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Add Fixed Task Form */}
            <div className="stats-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)', fontSize: '15px' }}>[ + ADD NEW FIXED MISSION ]</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TITLE</label>
                  <input
                    type="text"
                    className="dark-date-picker"
                    value={newFixedTitle}
                    onChange={(e) => setNewFixedTitle(e.target.value)}
                    placeholder="Refined title"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>CATEGORY</label>
                  <select
                    className="dark-date-picker"
                    value={newFixedCategory}
                    onChange={(e) => setNewFixedCategory(e.target.value)}
                  >
                    <option value="DISCIPLINE">DISCIPLINE</option>
                    <option value="PHYSICAL">PHYSICAL</option>
                    <option value="SOCIAL">SOCIAL</option>
                    <option value="OPS">OPS</option>
                    <option value="COMMS">COMMS</option>
                    <option value="INTEL">INTEL</option>
                    <option value="ROADMAP">ROADMAP</option>
                    <option value="LABS">LABS</option>
                    <option value="BUILD">BUILD</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>XP REWARD</label>
                  <input
                    type="number"
                    className="dark-date-picker"
                    value={newFixedXp}
                    onChange={(e) => setNewFixedXp(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>RPG STAT</label>
                  <select
                    className="dark-date-picker"
                    value={newFixedStat}
                    onChange={(e) => setNewFixedStat(e.target.value)}
                  >
                    <option value="DISCIPLINE">DISCIPLINE</option>
                    <option value="ENDURANCE">ENDURANCE</option>
                    <option value="OPS">OPS</option>
                    <option value="COMMS">COMMS</option>
                    <option value="SIGINT">SIGINT</option>
                  </select>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!newFixedTitle) return;
                  const newId = `fixed:custom_${Date.now()}`;
                  const newTask = {
                    id: newId,
                    title: newFixedTitle,
                    category: newFixedCategory,
                    xp: newFixedXp,
                    stat: newFixedStat,
                    bonus: Math.ceil(newFixedXp * 0.1)
                  };
                  updateFixedTasksList([...customFixedTasks, newTask], deletedTaskIds);
                  setNewFixedTitle('');
                }}
                className="end-shift-btn"
                style={{ alignSelf: 'flex-start', marginTop: '8px', padding: '6px 16px', border: '1px solid var(--accent-green)', color: 'var(--accent-green)' }}
              >
                [ + ADD TASK ]
              </button>
            </div>

            {/* List of current tasks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--text-muted)' }}>ACTIVE MISSIONS</h3>
              {fixedTasks.map(task => (
                <div
                  key={task.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="dark-date-picker"
                      style={{ flex: 1, minWidth: '200px' }}
                      value={task.title}
                      onChange={(e) => {
                        const updated = customFixedTasks.map(c => c.id === task.id ? { ...c, title: e.target.value } : c);
                        if (!customFixedTasks.some(c => c.id === task.id)) {
                          updated.push({ ...task, title: e.target.value });
                        }
                        updateFixedTasksList(updated, deletedTaskIds);
                      }}
                    />
                    <select
                      className="dark-date-picker"
                      value={task.category}
                      onChange={(e) => {
                        const updated = customFixedTasks.map(c => c.id === task.id ? { ...c, category: e.target.value } : c);
                        if (!customFixedTasks.some(c => c.id === task.id)) {
                          updated.push({ ...task, category: e.target.value });
                        }
                        updateFixedTasksList(updated, deletedTaskIds);
                      }}
                    >
                      <option value="DISCIPLINE">DISCIPLINE</option>
                      <option value="PHYSICAL">PHYSICAL</option>
                      <option value="SOCIAL">SOCIAL</option>
                      <option value="OPS">OPS</option>
                      <option value="COMMS">COMMS</option>
                      <option value="INTEL">INTEL</option>
                      <option value="ROADMAP">ROADMAP</option>
                      <option value="LABS">LABS</option>
                      <option value="BUILD">BUILD</option>
                    </select>
                    <input
                      type="number"
                      className="dark-date-picker"
                      style={{ width: '80px' }}
                      value={task.xp}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        const updated = customFixedTasks.map(c => c.id === task.id ? { ...c, xp: val } : c);
                        if (!customFixedTasks.some(c => c.id === task.id)) {
                          updated.push({ ...task, xp: val });
                        }
                        updateFixedTasksList(updated, deletedTaskIds);
                      }}
                    />
                    <button
                      onClick={() => {
                        const nextDeleted = [...deletedTaskIds, task.id];
                        const nextCustom = customFixedTasks.filter(c => c.id !== task.id);
                        updateFixedTasksList(nextCustom, nextDeleted);
                      }}
                      className="end-shift-btn"
                      style={{ border: '1px solid var(--accent-coral)', color: 'var(--accent-coral)', padding: '4px 12px' }}
                    >
                      [ DELETE ]
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHAIN TASKS TAB */}
        {manageTab === 'chain' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Create New Chain */}
            <div className="stats-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)', fontSize: '15px' }}>[ + CREATE NEW PROGRESSIVE PATH ]</h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="text"
                  className="dark-date-picker"
                  placeholder="New Chain Name (e.g. AUDITING)"
                  value={newChainName}
                  onChange={(e) => setNewChainName(e.target.value.toUpperCase())}
                  style={{ flex: 1 }}
                />
                <button
                  onClick={() => {
                    if (!newChainName || chains[newChainName]) return;
                    const cloned = { ...chains };
                    cloned[newChainName] = [{ title: 'Initial Step Name', category: 'ROADMAP', xp: 50 }];
                    saveCustomChains(cloned);
                    setSelectedManageChain(newChainName);
                    setNewChainName('');
                  }}
                  className="end-shift-btn"
                  style={{ border: '1px solid var(--accent-green)', color: 'var(--accent-green)', padding: '6px 16px' }}
                >
                  [ CREATE ]
                </button>
              </div>
            </div>

            {/* Select Chain to View */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--text-muted)' }}>SELECT PATH:</span>
              <select
                className="dark-date-picker"
                value={selectedManageChain}
                onChange={(e) => setSelectedManageChain(e.target.value)}
              >
                {Object.keys(chains).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Steps List */}
            {chains[selectedManageChain] && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--text-muted)' }}>STEPS FOR {selectedManageChain}</h3>
                  <button
                    onClick={() => {
                      const cloned = { ...chains };
                      cloned[selectedManageChain] = [
                        ...cloned[selectedManageChain],
                        { title: 'New Step Name', category: 'ROADMAP', xp: 50 }
                      ];
                      saveCustomChains(cloned);
                    }}
                    className="end-shift-btn"
                    style={{ border: '1px solid var(--accent-green)', color: 'var(--accent-green)', padding: '4px 12px' }}
                  >
                    [ + ADD STEP TO END ]
                  </button>
                </div>

                {chains[selectedManageChain].map((step, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)', width: '30px' }}>#{idx + 1}</span>
                      <input
                        type="text"
                        className="dark-date-picker"
                        style={{ flex: 1 }}
                        value={step.title}
                        onChange={(e) => {
                          const cloned = { ...chains };
                          cloned[selectedManageChain][idx].title = e.target.value;
                          saveCustomChains(cloned);
                        }}
                      />
                      <input
                        type="number"
                        className="dark-date-picker"
                        style={{ width: '80px' }}
                        value={step.xp}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          const cloned = { ...chains };
                          cloned[selectedManageChain][idx].xp = val;
                          saveCustomChains(cloned);
                        }}
                      />
                      <button
                        onClick={() => {
                          const cloned = { ...chains };
                          cloned[selectedManageChain].splice(idx, 0, {
                            title: 'Inserted Step Name',
                            category: 'ROADMAP',
                            xp: 50
                          });
                          saveCustomChains(cloned);
                        }}
                        className="end-shift-btn"
                        style={{ border: '1px solid var(--accent-teal)', color: 'var(--accent-teal)', padding: '4px 8px', fontSize: '11px' }}
                      >
                        [ INS ]
                      </button>
                      <button
                        onClick={() => {
                          const cloned = { ...chains };
                          cloned[selectedManageChain].splice(idx, 1);
                          saveCustomChains(cloned);
                        }}
                        className="end-shift-btn"
                        style={{ border: '1px solid var(--accent-coral)', color: 'var(--accent-coral)', padding: '4px 8px', fontSize: '11px' }}
                        disabled={chains[selectedManageChain].length <= 1}
                      >
                        [ DEL ]
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SCHEDULE TAB */}
        {manageTab === 'schedule' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Insert Schedule Block */}
            <div className="stats-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)', fontSize: '15px' }}>[ + INSERT TIME TIMELINE BLOCK ]</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>START TIME</label>
                  <input
                    type="time"
                    className="dark-date-picker"
                    value={newSchedStart}
                    onChange={(e) => setNewSchedStart(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>END TIME</label>
                  <input
                    type="time"
                    className="dark-date-picker"
                    value={newSchedEnd}
                    onChange={(e) => setNewSchedEnd(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>LABEL</label>
                  <input
                    type="text"
                    className="dark-date-picker"
                    placeholder="Deep work"
                    value={newSchedLabel}
                    onChange={(e) => setNewSchedLabel(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TYPE Tag</label>
                  <select
                    className="dark-date-picker"
                    value={newSchedType}
                    onChange={(e) => setNewSchedType(e.target.value)}
                  >
                    <option value="ROADMAP">ROADMAP</option>
                    <option value="BUILD">BUILD</option>
                    <option value="PHYSICAL">PHYSICAL</option>
                    <option value="DISCIPLINE">DISCIPLINE</option>
                    <option value="OPS">OPS</option>
                    <option value="LABS">LABS</option>
                    <option value="SOCIAL">SOCIAL</option>
                    <option value="INTEL">INTEL</option>
                    <option value="REST">REST</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>DESCRIPTION</label>
                  <input
                    type="text"
                    className="dark-date-picker"
                    placeholder="TryHackMe / PortSwigger sessions"
                    value={newSchedDesc}
                    onChange={(e) => setNewSchedDesc(e.target.value)}
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  if (!newSchedLabel || !newSchedStart || !newSchedEnd) return;
                  const newBlock = {
                    id: `sched_${Date.now()}`,
                    label: newSchedLabel,
                    start: newSchedStart,
                    end: newSchedEnd,
                    type: newSchedType,
                    description: newSchedDesc
                  };
                  saveCustomSchedule([...schedule, newBlock]);
                  setNewSchedLabel('');
                  setNewSchedDesc('');
                }}
                className="end-shift-btn"
                style={{ alignSelf: 'flex-start', marginTop: '8px', padding: '6px 16px', border: '1px solid var(--accent-green)', color: 'var(--accent-green)' }}
              >
                [ + INSERT BLOCK ]
              </button>
            </div>

            {/* List of current schedule blocks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--text-muted)' }}>CURRENT CHRONOLOGICAL BLOCKS</h3>
              {schedule.map((block, idx) => (
                <div
                  key={block.id || idx}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                      type="time"
                      className="dark-date-picker"
                      style={{ width: '100px' }}
                      value={block.start}
                      onChange={(e) => {
                        const cloned = schedule.map(s => (s.id === block.id || (!s.id && schedule.indexOf(s) === idx)) ? { ...s, start: e.target.value } : s);
                        saveCustomSchedule(cloned);
                      }}
                    />
                    <span style={{ color: 'var(--text-muted)' }}>TO</span>
                    <input
                      type="time"
                      className="dark-date-picker"
                      style={{ width: '100px' }}
                      value={block.end}
                      onChange={(e) => {
                        const cloned = schedule.map(s => (s.id === block.id || (!s.id && schedule.indexOf(s) === idx)) ? { ...s, end: e.target.value } : s);
                        saveCustomSchedule(cloned);
                      }}
                    />
                    <input
                      type="text"
                      className="dark-date-picker"
                      style={{ flex: 1, minWidth: '150px' }}
                      value={block.label}
                      onChange={(e) => {
                        const cloned = schedule.map(s => (s.id === block.id || (!s.id && schedule.indexOf(s) === idx)) ? { ...s, label: e.target.value } : s);
                        saveCustomSchedule(cloned);
                      }}
                    />
                    <select
                      className="dark-date-picker"
                      value={block.type}
                      onChange={(e) => {
                        const cloned = schedule.map(s => (s.id === block.id || (!s.id && schedule.indexOf(s) === idx)) ? { ...s, type: e.target.value } : s);
                        saveCustomSchedule(cloned);
                      }}
                    >
                      <option value="ROADMAP">ROADMAP</option>
                      <option value="BUILD">BUILD</option>
                      <option value="PHYSICAL">PHYSICAL</option>
                      <option value="DISCIPLINE">DISCIPLINE</option>
                      <option value="OPS">OPS</option>
                      <option value="LABS">LABS</option>
                      <option value="SOCIAL">SOCIAL</option>
                      <option value="INTEL">INTEL</option>
                      <option value="REST">REST</option>
                    </select>
                    <button
                      onClick={() => {
                        const cloned = schedule.filter(s => !(s.id === block.id || (!s.id && schedule.indexOf(s) === idx)));
                        saveCustomSchedule(cloned);
                      }}
                      className="end-shift-btn"
                      style={{ border: '1px solid var(--accent-coral)', color: 'var(--accent-coral)', padding: '4px 12px' }}
                      disabled={schedule.length <= 1}
                    >
                      [ DELETE ]
                    </button>
                  </div>
                  <input
                    type="text"
                    className="dark-date-picker"
                    style={{ width: '100%' }}
                    placeholder="Description"
                    value={block.description}
                    onChange={(e) => {
                      const cloned = schedule.map(s => (s.id === block.id || (!s.id && schedule.indexOf(s) === idx)) ? { ...s, description: e.target.value } : s);
                      saveCustomSchedule(cloned);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    );
  };

  const getCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const startDayOfWeek = firstDayOfMonth.getDay();
    const offset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const days = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = offset - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({ date: d, isCurrentMonth: false });
    }

    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= lastDayOfMonth; i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, isCurrentMonth: true });
    }

    const totalCells = Math.ceil(days.length / 7) * 7;
    const paddingCells = totalCells - days.length;
    for (let i = 1; i <= paddingCells; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, isCurrentMonth: false });
    }

    return days;
  };

  const getXpForDate = (dateStr) => {
    const raw = storage.getItem(`log:${dateStr}`);
    if (!raw) return 0;
    try {
      const logs = JSON.parse(raw);
      if (!Array.isArray(logs)) return 0;
      const completedLogs = logs.filter(l => l && l.type === 'completed');
      const missedLogs = logs.filter(l => l && l.type === 'missed');
      return completedLogs.reduce((sum, log) => sum + (log.xp || 0), 0) +
        missedLogs.reduce((sum, log) => sum + (log.xpPenalty || 0), 0);
    } catch {
      return 0;
    }
  };

  const getEventsForDate = (dateStr) => {
    return events.filter(evt => dateStr >= evt.startDate && dateStr <= evt.endDate);
  };

  const handleSaveEvent = () => {
    if (!eventName || !eventStartDate || !eventEndDate) return;

    let updatedEvents = [...events];
    if (editingEventId) {
      updatedEvents = updatedEvents.map(evt => {
        if (evt.id === editingEventId) {
          return {
            ...evt,
            name: eventName,
            startDate: eventStartDate,
            endDate: eventEndDate,
            missionsActive: eventMissionsActive,
            color: eventColor
          };
        }
        return evt;
      });
    } else {
      updatedEvents.push({
        id: `evt-${Date.now()}`,
        name: eventName,
        startDate: eventStartDate,
        endDate: eventEndDate,
        missionsActive: eventMissionsActive,
        color: eventColor
      });
    }

    setEvents(updatedEvents);
    storage.setItem('events', JSON.stringify(updatedEvents));
    setShowEventModal(false);
    syncWithServer();
  };

  const handleDeleteEvent = () => {
    if (!editingEventId) return;
    const updatedEvents = events.filter(evt => evt.id !== editingEventId);
    setEvents(updatedEvents);
    storage.setItem('events', JSON.stringify(updatedEvents));
    setShowEventModal(false);
    syncWithServer();
  };

  const upcomingEvents = useMemo(() => {
    const today = getTodayString();
    const activeOrFuture = events.filter(evt => evt.endDate >= today);
    activeOrFuture.sort((a, b) => a.startDate.localeCompare(b.startDate));
    return activeOrFuture.slice(0, 3);
  }, [events]);

  const renderUpcomingEventsWidget = () => {
    if (upcomingEvents.length === 0) return null;
    return (
      <section className="upcoming-events-section" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h2 className="panel-title">Upcoming Events</h2>
        <hr className="section-divider" />
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {upcomingEvents.map(evt => {
            let colorVar = 'var(--accent-amber)';
            if (evt.color === 'red') colorVar = 'var(--accent-coral)';
            else if (evt.color === 'green') colorVar = 'var(--accent-green)';
            else if (evt.color === 'blue') colorVar = 'var(--accent-blue)';

            return (
              <div
                key={evt.id}
                style={{
                  background: 'var(--bg-card)',
                  border: `1px solid ${colorVar}`,
                  padding: '8px 12px',
                  borderRadius: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  flex: '1 1 calc(33.33% - 12px)',
                  minWidth: '200px'
                }}
              >
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: colorVar
                }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{evt.name}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{evt.startDate} to {evt.endDate}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const getActiveMissionsSuppressedEventToday = () => {
    const today = getTodayString();
    if (storage.getItem(`holiday:${today}`) !== null) return null;
    return events.find(evt => evt.missionsActive === false && today >= evt.startDate && today <= evt.endDate);
  };

  const renderCalendar = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const monthName = calendarDate.toLocaleString('default', { month: 'long' }).toUpperCase();

    const days = getCalendarDays(calendarDate);
    const weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

    const handlePrevMonth = () => {
      setCalendarDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
      setCalendarDate(new Date(year, month + 1, 1));
    };

    return (
      <section className="calendar-section" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="panel-title">📅 OPERATIONAL CALENDAR // {monthName} {year}</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                setEditingEventId(null);
                setEventName('');
                setEventStartDate(getTodayString());
                setEventEndDate(getTodayString());
                setEventMissionsActive(true);
                setEventColor('amber');
                setShowEventModal(true);
              }}
              className="end-shift-btn"
              style={{
                background: 'var(--bg-terminal)',
                border: '1px solid var(--accent-green)',
                color: 'var(--accent-green)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                fontWeight: 'bold',
                padding: '4px 12px',
                cursor: 'pointer',
                boxShadow: '0 0 5px rgba(34, 197, 94, 0.2)',
                textTransform: 'uppercase'
              }}
            >
              [ + ADD EVENT ]
            </button>
            <button
              onClick={handlePrevMonth}
              className="end-shift-btn"
              style={{
                background: 'var(--bg-terminal)',
                border: '1px solid var(--accent-amber)',
                color: 'var(--accent-amber)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                padding: '4px 12px',
                cursor: 'pointer'
              }}
            >
              &lt; PREV
            </button>
            <button
              onClick={handleNextMonth}
              className="end-shift-btn"
              style={{
                background: 'var(--bg-terminal)',
                border: '1px solid var(--accent-amber)',
                color: 'var(--accent-amber)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                padding: '4px 12px',
                cursor: 'pointer'
              }}
            >
              NEXT &gt;
            </button>
          </div>
        </div>
        <hr className="section-divider" />

        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {/* Weekday headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '8px',
            textAlign: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--text-muted)',
            fontWeight: 'bold',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '8px'
          }}>
            {weekdays.map(day => <div key={day}>{day}</div>)}
          </div>

          {/* Days grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gridAutoRows: 'minmax(90px, auto)',
            gap: '8px'
          }}>
            {days.map(({ date, isCurrentMonth }, idx) => {
              const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
              const isToday = dateStr === getTodayString();
              const isHoliday = storage.getItem(`holiday:${dateStr}`) !== null;
              const dayXp = getXpForDate(dateStr);

              const dateEvents = getEventsForDate(dateStr);
              const hasRedEvent = dateEvents.some(e => e.color === 'red');
              const hasBlueEvent = dateEvents.some(e => e.color === 'blue');

              let borderStyle = '1px solid var(--border-color)';
              if (isToday) {
                borderStyle = '2px solid var(--accent-amber)';
              }

              const isFuture = date > new Date();
              const isPast = date < new Date() && !isToday;

              let cellBg = 'rgba(0, 0, 0, 0.2)';
              let dateColor = 'var(--text-main)';

              if (!isCurrentMonth) {
                cellBg = 'rgba(0, 0, 0, 0.4)';
                dateColor = 'var(--text-muted)';
              } else if (isHoliday) {
                cellBg = 'rgba(156, 163, 175, 0.15)'; // Grey holiday tint
              } else if (hasRedEvent) {
                cellBg = 'rgba(239, 68, 68, 0.12)'; // Red exam tint
              } else if (hasBlueEvent) {
                cellBg = 'rgba(59, 130, 246, 0.12)'; // Blue trip tint
              } else if (isFuture) {
                dateColor = 'var(--text-muted)';
              } else if (isPast && dayXp === 0) {
                cellBg = 'rgba(255, 111, 97, 0.05)';
                borderStyle = '1px solid rgba(255, 111, 97, 0.2)';
              }

              return (
                <div
                  key={idx}
                  className="calendar-day-cell"
                  style={{
                    background: cellBg,
                    border: borderStyle,
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '90px',
                    boxShadow: isToday ? '0 0 10px var(--accent-amber-glow)' : 'none',
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setEditingEventId(null);
                    setEventName('');
                    setEventStartDate(dateStr);
                    setEventEndDate(dateStr);
                    setEventMissionsActive(true);
                    setEventColor('amber');
                    setShowEventModal(true);
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        color: dateColor
                      }}>
                        {date.getDate()}
                      </span>
                      {/* Event Color Dots row */}
                      <div className="event-dots-row" style={{ display: 'flex', gap: '3px', marginTop: '2px' }}>
                        {isHoliday && (
                          <span
                            title="Holiday"
                            style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#9ca3af', display: 'inline-block' }}
                          />
                        )}
                        {dateEvents.map(evt => {
                          let dotColor = '#f5a623'; // Amber
                          if (evt.color === 'red') dotColor = '#ef4444'; // Red
                          else if (evt.color === 'blue') dotColor = '#3b82f6'; // Blue
                          else if (evt.color === 'green') dotColor = '#10b981'; // Green
                          return (
                            <span
                              key={evt.id}
                              title={evt.name}
                              style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: dotColor, display: 'inline-block' }}
                            />
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      {isHoliday && (
                        <span style={{
                          background: '#9ca3af',
                          color: 'var(--bg-terminal)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '8px',
                          fontWeight: 'bold',
                          padding: '0px 3px',
                          borderRadius: '1px'
                        }}>
                          H
                        </span>
                      )}

                      {dayXp > 0 && (
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          color: 'rgba(34, 197, 94, 0.8)',
                          fontWeight: 'bold'
                        }}>
                          +{dayXp}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    marginTop: '8px'
                  }}>
                    {dateEvents.map(evt => {
                      let tagColor = 'var(--accent-amber)';
                      let tagBg = 'var(--accent-amber-dim)';
                      if (evt.color === 'red') {
                        tagColor = 'var(--accent-coral)';
                        tagBg = 'rgba(255, 111, 97, 0.15)';
                      } else if (evt.color === 'green') {
                        tagColor = 'var(--accent-green)';
                        tagBg = 'var(--accent-green-dim)';
                      } else if (evt.color === 'blue') {
                        tagColor = 'var(--accent-blue)';
                        tagBg = 'var(--accent-blue-dim)';
                      }

                      return (
                        <div
                          key={evt.id}
                          style={{
                            background: tagBg,
                            border: `1px solid ${tagColor}`,
                            color: tagColor,
                            fontSize: '9px',
                            fontFamily: 'var(--font-mono)',
                            padding: '1px 4px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            textAlign: 'center',
                            fontWeight: 'bold'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingEventId(evt.id);
                            setEventName(evt.name);
                            setEventStartDate(evt.startDate);
                            setEventEndDate(evt.endDate);
                            setEventMissionsActive(evt.missionsActive);
                            setEventColor(evt.color);
                            setShowEventModal(true);
                          }}
                        >
                          {evt.name}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
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
    <div className="layout-wrapper">
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="sidebar">
        <div className="sidebar-title">TAC-NET</div>
        <nav className="sidebar-menu">
          <div
            className={`sidebar-link ${activePage === 'home' ? 'active' : ''}`}
            onClick={() => setActivePage('home')}
          >
            <span>🏠</span> HOME
          </div>
          <div
            className={`sidebar-link ${activePage === 'calendar' ? 'active' : ''}`}
            onClick={() => setActivePage('calendar')}
          >
            <span>📅</span> CALENDAR
          </div>
          <div
            className={`sidebar-link ${activePage === 'missions' ? 'active' : ''}`}
            onClick={() => setActivePage('missions')}
          >
            <span>⚔️</span> MISSIONS
          </div>
          <div
            className={`sidebar-link ${activePage === 'projects' ? 'active' : ''}`}
            onClick={() => setActivePage('projects')}
          >
            <span>📁</span> PROJECTS
          </div>
          <div
            className={`sidebar-link ${activePage === 'schedule' ? 'active' : ''}`}
            onClick={() => setActivePage('schedule')}
          >
            <span>📅</span> SCHEDULE
          </div>
          <div
            className={`sidebar-link ${activePage === 'skillmap' ? 'active' : ''}`}
            onClick={() => setActivePage('skillmap')}
          >
            <span>🗺️</span> SKILL MAP
          </div>
          <div
            className={`sidebar-link ${activePage === 'character' ? 'active' : ''}`}
            onClick={() => setActivePage('character')}
          >
            <span>👤</span> CHARACTER
          </div>
          <div
            className={`sidebar-link ${activePage === 'logs' ? 'active' : ''}`}
            onClick={() => setActivePage('logs')}
          >
            <span>📊</span> LOGS
          </div>
          <div
            className={`sidebar-link ${activePage === 'manage' ? 'active' : ''}`}
            onClick={() => setActivePage('manage')}
          >
            <span>✎</span> MANAGE
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        {/* GLOBAL HEADER (DESKTOP) */}
        <header className="global-header desktop-header" style={{ marginBottom: '20px' }}>
          <div className="header-operator-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="operator-role" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)', fontSize: '13px', fontWeight: 'bold' }}>
              OPERATOR TERMINAL // DEEP GRID
            </span>
            <div className="header-stats-row" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {isTodayHoliday ? (
                <button
                  disabled
                  className="end-shift-btn"
                  style={{
                    background: 'var(--bg-terminal)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    padding: '2px 8px',
                    opacity: 0.5,
                    cursor: 'not-allowed',
                    textTransform: 'uppercase'
                  }}
                >
                  [ HOLIDAY MARKED ]
                </button>
              ) : (
                <button
                  onClick={() => {
                    setHolidayDate(getTodayString());
                    setHolidayReason('');
                    setShowHolidayModal(true);
                  }}
                  className="end-shift-btn"
                  style={{
                    background: 'var(--bg-terminal)',
                    border: '1px solid var(--accent-amber)',
                    color: 'var(--accent-amber)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    padding: '2px 8px',
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
                  [ MARK HOLIDAY ]
                </button>
              )}
              <button
                onClick={handleEndShift}
                className="end-shift-btn"
                style={{
                  background: 'var(--bg-terminal)',
                  border: '1px solid var(--accent-amber)',
                  color: 'var(--accent-amber)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  padding: '2px 8px',
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
              <span className="streak-badge" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-orange)' }}>
                🔥 STREAK: {profile.streak} {profile.streak === 1 ? 'DAY' : 'DAYS'}
              </span>
              <span className="level-badge" style={{ background: 'var(--accent-amber-dim)', border: '1px solid var(--accent-amber)', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 'bold', padding: '1px 6px' }}>
                LVL {levelProgress.level}
              </span>
            </div>
          </div>
          <div className="xp-progress-container" style={{ marginTop: '8px' }}>
            <div className="xp-bar-outer" style={{ height: '6px' }}>
              <div className="xp-bar-inner" style={{ width: `${levelProgress.pct}%`, transition: 'width 0.6s ease' }}></div>
            </div>
            <div className="xp-numbers" style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {levelProgress.xpInLevel} / 200 XP
            </div>
          </div>
        </header>

        {/* GLOBAL HEADER (MOBILE) */}
        <header className="global-header mobile-only-header" style={{ marginBottom: '20px' }}>
          <div className="mobile-header-row-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="operator-role" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)', fontSize: '13px', fontWeight: 'bold' }}>
              OPERATOR // DEEP GRID
            </span>
            <span className="online-badge" style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid var(--accent-green)',
              color: 'var(--accent-green)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 'bold',
              padding: '2px 8px',
              borderRadius: '2px',
              boxShadow: '0 0 5px rgba(34, 197, 94, 0.2)'
            }}>
              [ ONLINE ]
            </span>
          </div>
          <div className="mobile-header-row-2" style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="mobile-header-stats" style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span className="streak-badge" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-orange)' }}>
                  🔥 {profile.streak} DAYS
                </span>
                <span className="level-badge" style={{ background: 'var(--accent-amber-dim)', border: '1px solid var(--accent-amber)', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 'bold', padding: '1px 6px' }}>
                  LVL {levelProgress.level}
                </span>
              </div>
              {isTodayHoliday ? (
                <button
                  disabled
                  className="end-shift-btn"
                  style={{
                    background: 'var(--bg-terminal)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    padding: '2px 8px',
                    opacity: 0.5,
                    cursor: 'not-allowed',
                    textTransform: 'uppercase'
                  }}
                >
                  [ HOLIDAY MARKED ]
                </button>
              ) : (
                <button
                  onClick={() => {
                    setHolidayDate(getTodayString());
                    setHolidayReason('');
                    setShowHolidayModal(true);
                  }}
                  className="end-shift-btn"
                  style={{
                    background: 'var(--bg-terminal)',
                    border: '1px solid var(--accent-amber)',
                    color: 'var(--accent-amber)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    padding: '2px 8px',
                    cursor: 'pointer',
                    boxShadow: '0 0 5px rgba(245, 166, 35, 0.2)',
                    textTransform: 'uppercase'
                  }}
                >
                  [ HOLIDAY ]
                </button>
              )}
            </div>
            <div className="xp-progress-container" style={{ marginTop: '2px' }}>
              <div className="xp-bar-outer" style={{ height: '6px' }}>
                <div className="xp-bar-inner" style={{ width: `${levelProgress.pct}%`, transition: 'width 0.6s ease' }}></div>
              </div>
              <div className="xp-numbers" style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {levelProgress.xpInLevel} / 200 XP
              </div>
            </div>
          </div>
        </header>

        {/* HOLIDAY BANNER */}
        {isTodayHoliday && (
          <div className="warning-banner" style={{
            background: 'var(--accent-amber-dim)',
            border: '1px solid var(--accent-amber)',
            padding: '12px 16px',
            marginBottom: '20px',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--accent-amber)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>[ TODAY MARKED AS HOLIDAY — NO PENALTIES ACTIVE ]</span>
              <button
                onClick={() => {
                  const todayStr = getTodayString();
                  storage.removeItem(`holiday:${todayStr}`);
                  setIsTodayHoliday(false);
                  syncWithServer();
                }}
                className="end-shift-btn"
                style={{
                  background: 'var(--bg-terminal)',
                  border: '1px solid var(--accent-amber)',
                  color: 'var(--accent-amber)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  padding: '2px 8px',
                  cursor: 'pointer',
                  boxShadow: '0 0 5px rgba(245, 166, 35, 0.2)',
                  transition: 'all 0.2s',
                  textTransform: 'uppercase'
                }}
              >
                [ UNMARK ]
              </button>
            </div>
          </div>
        )}

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
            } catch { }
          }

          if (missedPenalizedCount === 0) return null;

          return (
            <div className="warning-banner" style={{
              background: 'rgba(255, 111, 97, 0.05)',
              border: '1px solid var(--accent-coral)',
              padding: '12px 16px',
              marginBottom: '20px',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: 'var(--accent-coral)',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>[!] OPERATIONAL ANOMALY: MISSED {missedPenalizedCount} CRITICAL TASKS YESTERDAY. PENALTY APPLIED: -{totalPenalty} XP.</span>
                <button
                  onClick={() => setShowPenaltyBanner(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-coral)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  [ DISMISS WARNING ]
                </button>
              </div>
            </div>
          );
        })()}

        {/* Weekly Report Banner */}
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
                    padding: '2px 6px',
                    fontSize: '11px',
                    fontWeight: 'bold'
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

        {/* ACTIVE PAGE CONTENT */}
        {activePage === 'home' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {renderScheduleBlock()}
            {renderUpcomingEventsWidget()}
            {renderTodaysBriefing()}
            {renderPriorityMissions()}
            {renderMainObjectiveCard()}
          </div>
        )}

        {activePage === 'calendar' && (
          <div>
            {renderCalendar()}
          </div>
        )}

        {activePage === 'missions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {renderDailyOps()}
            {renderSideOps()}
          </div>
        )}

        {activePage === 'projects' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {renderProjectOps()}
            {renderProjectBoard()}
          </div>
        )}

        {activePage === 'schedule' && (
          <div>
            {renderFullSchedule()}
          </div>
        )}

        {activePage === 'skillmap' && (
          <div>
            {renderSkillMap()}
          </div>
        )}

        {activePage === 'character' && (
          <div>
            {renderCharacterSheet()}
          </div>
        )}

        {activePage === 'logs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {renderLifeMetrics()}
            {renderMissionLogs()}
          </div>
        )}

        {activePage === 'manage' && (
          <div>
            {renderManagePage()}
          </div>
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="bottom-nav">
        <button
          className={`bottom-nav-btn ${activePage === 'home' ? 'active' : ''}`}
          onClick={() => setActivePage('home')}
          title="HOME"
          style={{ touchAction: 'manipulation' }}
        >
          <span className="bottom-nav-icon">🏠</span>
        </button>
        <button
          className={`bottom-nav-btn ${activePage === 'calendar' ? 'active' : ''}`}
          onClick={() => setActivePage('calendar')}
          title="CALENDAR"
          style={{ touchAction: 'manipulation' }}
        >
          <span className="bottom-nav-icon">📅</span>
        </button>
        <button
          className={`bottom-nav-btn ${activePage === 'missions' ? 'active' : ''}`}
          onClick={() => setActivePage('missions')}
          title="MISSIONS"
          style={{ touchAction: 'manipulation' }}
        >
          <span className="bottom-nav-icon">⚔️</span>
        </button>
        <button
          className={`bottom-nav-btn ${activePage === 'projects' ? 'active' : ''}`}
          onClick={() => setActivePage('projects')}
          title="PROJECTS"
          style={{ touchAction: 'manipulation' }}
        >
          <span className="bottom-nav-icon">📁</span>
        </button>
        <button
          className={`bottom-nav-btn ${activePage === 'schedule' ? 'active' : ''}`}
          onClick={() => setActivePage('schedule')}
          title="SCHEDULE"
          style={{ touchAction: 'manipulation' }}
        >
          <span className="bottom-nav-icon">🗓️</span>
        </button>
        <button
          className={`bottom-nav-btn ${activePage === 'skillmap' ? 'active' : ''}`}
          onClick={() => setActivePage('skillmap')}
          title="SKILL MAP"
          style={{ touchAction: 'manipulation' }}
        >
          <span className="bottom-nav-icon">🗺️</span>
        </button>
        <button
          className={`bottom-nav-btn ${activePage === 'character' ? 'active' : ''}`}
          onClick={() => setActivePage('character')}
          title="CHARACTER"
          style={{ touchAction: 'manipulation' }}
        >
          <span className="bottom-nav-icon">👤</span>
        </button>
        <button
          className={`bottom-nav-btn ${activePage === 'logs' ? 'active' : ''}`}
          onClick={() => setActivePage('logs')}
          title="LOGS"
          style={{ touchAction: 'manipulation' }}
        >
          <span className="bottom-nav-icon">📊</span>
        </button>
        <button
          className={`bottom-nav-btn ${activePage === 'manage' ? 'active' : ''}`}
          onClick={() => setActivePage('manage')}
          title="MANAGE"
          style={{ touchAction: 'manipulation' }}
        >
          <span className="bottom-nav-icon">✎</span>
        </button>
        <button
          className="bottom-nav-btn end-shift-mobile-btn"
          onClick={handleEndShift}
          title="END SHIFT"
          style={{ touchAction: 'manipulation' }}
        >
          <span className="bottom-nav-icon font-mono">{isDayClosed ? 'AAR' : 'END'}</span>
        </button>
      </nav>

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
            {!debriefLoading && (
              <button
                onClick={closeDebriefModal}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-amber)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  touchAction: 'manipulation',
                  zIndex: 1000000
                }}
              >
                [X]
              </button>
            )}
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

      {/* Mark Holiday Modal */}
      {showHolidayModal && (
        <div className="debrief-modal-overlay" style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(7, 8, 10, 0.95)',
          zIndex: 150000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}>
          <div className="debrief-modal-box" style={{
            width: '100%',
            maxWidth: '400px',
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
              fontWeight: 'bold',
              fontSize: '16px',
              letterSpacing: '0.05em'
            }}>
              &gt; MARK DAY AS HOLIDAY
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>DATE</label>
                <input
                  type="date"
                  className="dark-date-picker"
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>REASON (OPTIONAL)</label>
                <input
                  type="text"
                  placeholder="e.g. WiFi down, travel, rest day"
                  className="dark-date-picker"
                  value={holidayReason}
                  onChange={(e) => setHolidayReason(e.target.value)}
                  style={{ width: '100%', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setShowHolidayModal(false)}
                style={{
                  background: 'var(--bg-terminal)',
                  border: '1px solid var(--text-muted)',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  padding: '6px 16px',
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                [ CANCEL ]
              </button>
              <button
                onClick={() => {
                  if (holidayDate) {
                    storage.setItem(`holiday:${holidayDate}`, JSON.stringify({
                      reason: holidayReason || 'Holiday',
                      markedAt: new Date().toISOString()
                    }));
                    if (holidayDate === getTodayString()) {
                      setIsTodayHoliday(true);
                    }
                    setShowHolidayModal(false);
                    syncWithServer();
                  }
                }}
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
              >
                [ CONFIRM ]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event System Modal */}
      {showEventModal && (
        <div className="debrief-modal-overlay" style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(7, 8, 10, 0.95)',
          zIndex: 150000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}>
          <div className="debrief-modal-box" style={{
            width: '100%',
            maxWidth: '450px',
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
              fontWeight: 'bold',
              fontSize: '16px',
              letterSpacing: '0.05em'
            }}>
              &gt; {editingEventId ? 'EDIT EVENT' : 'CREATE EVENT'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>EVENT NAME</label>
                <input
                  type="text"
                  placeholder="e.g. Physics Exam, Travel, Rest Day"
                  className="dark-date-picker"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>START DATE</label>
                  <input
                    type="date"
                    className="dark-date-picker"
                    value={eventStartDate}
                    onChange={(e) => setEventStartDate(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>END DATE</label>
                  <input
                    type="date"
                    className="dark-date-picker"
                    value={eventEndDate}
                    onChange={(e) => setEventEndDate(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>MISSIONS ACTIVE</span>
                <button
                  onClick={() => setEventMissionsActive(!eventMissionsActive)}
                  className="end-shift-btn"
                  style={{
                    background: 'var(--bg-terminal)',
                    border: `1px solid ${eventMissionsActive ? 'var(--accent-green)' : 'var(--accent-coral)'}`,
                    color: eventMissionsActive ? 'var(--accent-green)' : 'var(--accent-coral)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    padding: '2px 8px',
                    cursor: 'pointer'
                  }}
                >
                  {eventMissionsActive ? '[ ON ]' : '[ OFF ]'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>COLOR TAG</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {['amber', 'red', 'green', 'blue'].map(c => {
                    let btnColor = 'var(--accent-amber)';
                    if (c === 'red') btnColor = 'var(--accent-coral)';
                    else if (c === 'green') btnColor = 'var(--accent-green)';
                    else if (c === 'blue') btnColor = 'var(--accent-blue)';

                    return (
                      <button
                        key={c}
                        onClick={() => setEventColor(c)}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: btnColor,
                          border: eventColor === c ? '2px solid var(--text-main)' : 'none',
                          cursor: 'pointer',
                          boxShadow: eventColor === c ? `0 0 8px ${btnColor}` : 'none'
                        }}
                      ></button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {editingEventId ? (
                <button
                  onClick={handleDeleteEvent}
                  style={{
                    background: 'var(--bg-terminal)',
                    border: '1px solid var(--accent-coral)',
                    color: 'var(--accent-coral)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    padding: '6px 16px',
                    cursor: 'pointer',
                    textTransform: 'uppercase'
                  }}
                >
                  [ DELETE ]
                </button>
              ) : <div></div>}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowEventModal(false)}
                  style={{
                    background: 'var(--bg-terminal)',
                    border: '1px solid var(--text-muted)',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    padding: '6px 16px',
                    cursor: 'pointer',
                    textTransform: 'uppercase'
                  }}
                >
                  [ CANCEL ]
                </button>
                <button
                  onClick={handleSaveEvent}
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
                >
                  [ SAVE ]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
