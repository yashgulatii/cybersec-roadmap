// src/data/missionsData.js
// Purpose: Contains all daily fixed tasks and progressive study chain definitions.
//
// CHANGE LOG:
// - fixed:apply_roles   → 3 roles/day (was 5). Quality over quantity. India cybersec
//                         market does not have 5 fresh matching roles daily.
// - fixed:sleep_early   → "Sleep before 23:00" (was "before 1AM"). Schedule says
//                         STAND DOWN at 22:30. 1AM contradicted every other block.
// - INTERVIEW PREP      → Expanded from 6 to 18 tasks. Getting a job is priority #1.
//                         6 tasks for the most critical chain was a design mistake.
// - WEB SECURITY        → Expanded from 8 to 16 tasks. AppSec Engineer targeting
//                         requires HTTP smuggling, OAuth, JWT, API security coverage.
// - THM / LABS          → Replaced with THM PATHS. Specific learning path completions
//                         instead of generic "do a room" placeholders.
// - stat fields added   → All chain tasks now carry a stat: field so XP routes to
//                         the correct category (TECHNICAL for lab/build work).

export const FIXED_TASKS = [
  {
    id: 'fixed:morning_ritual',
    title: 'Morning ritual complete (no screen)',
    category: 'DISCIPLINE',
    xp: 25,
    stat: 'DISCIPLINE',
    bonus: 3
  },
  {
    id: 'fixed:post_nap_exercise',
    title: 'Post-nap exercise done',
    category: 'PHYSICAL',
    xp: 30,
    stat: 'ENDURANCE',
    bonus: 4
  },
  {
    id: 'fixed:evening_patrol',
    title: 'Evening patrol with friend (full hour)',
    category: 'SOCIAL',
    xp: 25,
    stat: 'DISCIPLINE',
    bonus: 3
  },
  {
    id: 'fixed:after_action_report',
    title: 'After action report written',
    category: 'DISCIPLINE',
    xp: 20,
    stat: 'DISCIPLINE',
    bonus: 3
  },
  {
    // FIXED: was 5 roles/day — unsustainable and produces low-quality applications.
    id: 'fixed:apply_roles',
    title: 'Apply to 3 roles (Naukri/LinkedIn) — tailored, not bulk',
    category: 'OPS',
    xp: 60,
    stat: 'OPS',
    bonus: 6
  },
  {
    id: 'fixed:cold_email',
    title: 'Cold email outreach (2 companies)',
    category: 'OPS',
    xp: 50,
    stat: 'OPS',
    bonus: 5
  },
  {
    id: 'fixed:record_interview',
    title: 'Record yourself answering 1 interview Q',
    category: 'COMMS',
    xp: 40,
    stat: 'COMMS',
    bonus: 4
  },
  {
    id: 'fixed:review_star',
    title: 'Review 1 STAR answer and refine it',
    category: 'COMMS',
    xp: 35,
    stat: 'COMMS',
    bonus: 3
  },
  {
    id: 'fixed:read_article',
    title: 'Read 1 article: threat intel / AppSec / SOC',
    category: 'INTEL',
    xp: 30,
    stat: 'SIGINT',
    bonus: 3
  },
  {
    id: 'fixed:drink_water',
    title: 'Drink 3L water',
    category: 'PHYSICAL',
    xp: 15,
    stat: 'ENDURANCE',
    bonus: 2
  },
  {
    // FIXED: was "before 1AM". Schedule has STAND DOWN at 22:30. Aligned to match.
    id: 'fixed:sleep_early',
    title: 'Sleep before 23:00',
    category: 'DISCIPLINE',
    xp: 20,
    stat: 'DISCIPLINE',
    bonus: 2
  }
];

export const CHAINS = {

  'NETWORKING': [
    { title: 'Memorise top 25 ports (Groups 1–2)', category: 'ROADMAP', xp: 50, stat: 'TECHNICAL' },
    { title: 'Memorise top 25 ports (Groups 3–4)', category: 'ROADMAP', xp: 50, stat: 'TECHNICAL' },
    { title: 'OSI model: all 7 layers cold recall', category: 'ROADMAP', xp: 50, stat: 'TECHNICAL' },
    { title: 'TCP/IP model vs OSI — differences', category: 'ROADMAP', xp: 45, stat: 'TECHNICAL' },
    { title: 'Subnetting basics (CIDR, /24, /16)', category: 'ROADMAP', xp: 55, stat: 'TECHNICAL' },
    { title: 'Nmap: basic scan types (-sS, -sV, -sC)', category: 'ROADMAP', xp: 60, stat: 'TECHNICAL' },
    { title: 'Nmap: advanced (OS detect, scripts, timing)', category: 'ROADMAP', xp: 65, stat: 'TECHNICAL' },
    { title: 'Wireshark: capture and filter basics', category: 'ROADMAP', xp: 60, stat: 'TECHNICAL' },
    { title: 'DNS, DHCP, ARP — how each works', category: 'ROADMAP', xp: 55, stat: 'TECHNICAL' },
    { title: 'HTTP vs HTTPS, TLS handshake', category: 'ROADMAP', xp: 55, stat: 'TECHNICAL' }
  ],

  'LINUX': [
    { title: 'Linux file system structure (/, /etc, /var, /home)', category: 'ROADMAP', xp: 45, stat: 'TECHNICAL' },
    { title: 'Core commands: ls, cd, chmod, chown, find, grep', category: 'ROADMAP', xp: 45, stat: 'TECHNICAL' },
    { title: 'File permissions and ownership', category: 'ROADMAP', xp: 45, stat: 'TECHNICAL' },
    { title: 'Process management: ps, top, kill, jobs', category: 'ROADMAP', xp: 45, stat: 'TECHNICAL' },
    { title: 'Bash scripting: variables, loops, conditionals', category: 'ROADMAP', xp: 55, stat: 'TECHNICAL' },
    { title: 'Network commands: netstat, ss, curl, wget, dig', category: 'ROADMAP', xp: 50, stat: 'TECHNICAL' },
    { title: 'Log analysis: /var/log, journalctl, grep patterns', category: 'ROADMAP', xp: 55, stat: 'TECHNICAL' },
    { title: 'Service management with systemctl', category: 'ROADMAP', xp: 50, stat: 'TECHNICAL' },
    { title: 'SSH: key-based auth, config, tunneling', category: 'ROADMAP', xp: 55, stat: 'TECHNICAL' },
    { title: 'Linux hardening basics: firewall, users, cron', category: 'ROADMAP', xp: 60, stat: 'TECHNICAL' }
  ],

  'SOC OPERATIONS': [
    { title: 'SOC roles and responsibilities (L1/L2/L3 tiers)', category: 'ROADMAP', xp: 45, stat: 'SIGINT' },
    { title: 'SIEM basics: what it does, key vendors (Splunk, QRadar, Google SecOps)', category: 'ROADMAP', xp: 50, stat: 'SIGINT' },
    { title: 'Log types: Windows Event, syslog, firewall logs', category: 'ROADMAP', xp: 50, stat: 'TECHNICAL' },
    { title: 'Alert triage: P1/P2/P3 classification', category: 'ROADMAP', xp: 55, stat: 'TECHNICAL' },
    { title: 'IOC vs IOA: understanding indicators', category: 'ROADMAP', xp: 50, stat: 'SIGINT' },
    { title: 'Incident response: 6 phases (NIST model)', category: 'ROADMAP', xp: 55, stat: 'SIGINT' },
    { title: 'Splunk: basic SPL search queries', category: 'LABS', xp: 65, stat: 'TECHNICAL' },
    { title: 'Write a mock incident response report', category: 'BUILD', xp: 70, stat: 'TECHNICAL' },
    { title: 'Threat hunting basics', category: 'ROADMAP', xp: 60, stat: 'SIGINT' },
    { title: 'MITRE ATT&CK framework overview', category: 'ROADMAP', xp: 65, stat: 'SIGINT' }
  ],

  // FIXED: Expanded from 8 to 16 tasks.
  // Original stopped at a "1-page VAPT mini-report". For an AppSec Engineer target,
  // this chain needed HTTP smuggling, OAuth, JWT, and API security — all topics
  // from PortSwigger's Top 10 Web Hacking Techniques 2025 that you already studied.
  'WEB SECURITY': [
    { title: 'OWASP Top 10: read and summarise all 10', category: 'ROADMAP', xp: 50, stat: 'SIGINT' },
    { title: 'Burp Suite: intercept, modify, and repeat a request', category: 'LABS', xp: 55, stat: 'TECHNICAL' },
    { title: 'PortSwigger: SQL Injection — apprentice labs (all)', category: 'LABS', xp: 60, stat: 'TECHNICAL' },
    { title: 'PortSwigger: SQL Injection — practitioner labs (2)', category: 'LABS', xp: 70, stat: 'TECHNICAL' },
    { title: 'PortSwigger: XSS — apprentice labs (all)', category: 'LABS', xp: 60, stat: 'TECHNICAL' },
    { title: 'PortSwigger: XSS — practitioner labs (2)', category: 'LABS', xp: 70, stat: 'TECHNICAL' },
    { title: 'PortSwigger: IDOR and access control labs (all)', category: 'LABS', xp: 65, stat: 'TECHNICAL' },
    { title: 'PortSwigger: SSRF — apprentice and practitioner labs', category: 'LABS', xp: 65, stat: 'TECHNICAL' },
    { title: 'PortSwigger: Authentication bypass labs', category: 'LABS', xp: 65, stat: 'TECHNICAL' },
    { title: 'PortSwigger: CSRF labs', category: 'LABS', xp: 60, stat: 'TECHNICAL' },
    { title: 'PortSwigger: HTTP request smuggling — apprentice labs', category: 'LABS', xp: 75, stat: 'TECHNICAL' },
    { title: 'PortSwigger: OAuth and OpenID Connect labs', category: 'LABS', xp: 75, stat: 'TECHNICAL' },
    { title: 'PortSwigger: JWT attacks labs', category: 'LABS', xp: 75, stat: 'TECHNICAL' },
    { title: 'PortSwigger: API security and mass assignment labs', category: 'LABS', xp: 70, stat: 'TECHNICAL' },
    { title: 'Read PortSwigger Top 10 Web Hacking Techniques 2025 — summarise each', category: 'ROADMAP', xp: 55, stat: 'SIGINT' },
    { title: 'Write a 2-page VAPT report for a PortSwigger lab finding as practice', category: 'BUILD', xp: 80, stat: 'TECHNICAL' }
  ],

  'TOOLS MASTERY': [
    { title: 'Nmap: installation and basic scans', category: 'LABS', xp: 50, stat: 'TECHNICAL' },
    { title: 'Nmap: scripts and advanced usage', category: 'LABS', xp: 55, stat: 'TECHNICAL' },
    { title: 'Metasploit: basics and msfconsole', category: 'LABS', xp: 60, stat: 'TECHNICAL' },
    { title: 'Burp Suite: intercept, repeat, intruder', category: 'LABS', xp: 60, stat: 'TECHNICAL' },
    { title: 'Wireshark: capture filters and traffic analysis', category: 'LABS', xp: 60, stat: 'TECHNICAL' },
    { title: 'BloodHound: setup and AD enumeration', category: 'LABS', xp: 65, stat: 'TECHNICAL' },
    { title: 'Gobuster/ffuf: directory and subdomain fuzzing', category: 'LABS', xp: 65, stat: 'TECHNICAL' },
    { title: 'Hydra: basic credential brute forcing', category: 'LABS', xp: 65, stat: 'TECHNICAL' },
    { title: 'SQLmap: automated SQL injection', category: 'LABS', xp: 65, stat: 'TECHNICAL' },
    { title: 'Hashcat: password hash cracking basics', category: 'LABS', xp: 65, stat: 'TECHNICAL' }
  ],

  'ACTIVE DIRECTORY': [
    { title: 'AD concepts: Kerberos, LDAP, AD structure', category: 'ROADMAP', xp: 55, stat: 'TECHNICAL' },
    { title: 'AD Lab: setup and domain join (2h session)', category: 'BUILD', xp: 70, stat: 'TECHNICAL' },
    { title: 'AD enumeration with BloodHound', category: 'LABS', xp: 70, stat: 'TECHNICAL' },
    { title: 'Kerberoasting attack walkthrough', category: 'LABS', xp: 75, stat: 'TECHNICAL' },
    { title: 'Pass-the-Hash and Pass-the-Ticket', category: 'LABS', xp: 75, stat: 'TECHNICAL' },
    { title: 'AD privilege escalation paths', category: 'LABS', xp: 80, stat: 'TECHNICAL' },
    { title: 'Build a detection rule for one attack', category: 'BUILD', xp: 80, stat: 'TECHNICAL' },
    { title: 'Document findings in a lab report', category: 'BUILD', xp: 65, stat: 'TECHNICAL' }
  ],

  // FIXED: Expanded from 6 to 18 tasks.
  // Getting a job is priority #1. 6 tasks for interview prep was a critical gap.
  // Added role-specific technical drills, Kerberos/Splunk/CVSS explanation drills,
  // and full mock simulations for both SOC and AppSec tracks separately.
  'INTERVIEW PREP': [
    { title: 'Study 10 SOC analyst interview Qs (network triage, log analysis, SIEM)', category: 'COMMS', xp: 45, stat: 'COMMS' },
    { title: 'Study 10 AppSec engineer interview Qs (OWASP, auth bypasses, IDOR, API)', category: 'COMMS', xp: 45, stat: 'COMMS' },
    { title: 'Write STAR story: Campus Track IDOR finding — 90-second pitch version', category: 'COMMS', xp: 55, stat: 'COMMS' },
    { title: 'Write STAR story: one offensive security tool built (Airtrace/Netra/EnChat)', category: 'COMMS', xp: 55, stat: 'COMMS' },
    { title: 'Write STAR story: AD lab — describe one attack you executed and detected end-to-end', category: 'COMMS', xp: 60, stat: 'COMMS' },
    { title: 'Drill: explain Kerberos authentication flow out loud in 3 minutes without notes', category: 'COMMS', xp: 50, stat: 'COMMS' },
    { title: 'Drill: explain the difference between IDS and IPS in 60 seconds', category: 'COMMS', xp: 40, stat: 'COMMS' },
    { title: 'Drill: walk through a phishing incident using the NIST IR 6-phase model', category: 'COMMS', xp: 50, stat: 'COMMS' },
    { title: 'Drill: describe what a SOC L1 analyst does on a typical shift', category: 'COMMS', xp: 40, stat: 'COMMS' },
    { title: 'Drill: explain your CVSS 8.9 scoring for the Campus Track IDOR', category: 'COMMS', xp: 45, stat: 'COMMS' },
    { title: 'Study 5 Splunk SPL interview Qs (index searches, stats, saved searches, alerts)', category: 'COMMS', xp: 50, stat: 'COMMS' },
    { title: 'Study Google SecOps (Chronicle SIEM) basics — PowerSchool lists it as a plus', category: 'COMMS', xp: 45, stat: 'COMMS' },
    { title: 'Mock SOC interview: answer 5 technical Qs out loud, record yourself', category: 'COMMS', xp: 65, stat: 'COMMS' },
    { title: 'Mock AppSec interview: answer 5 technical Qs out loud, record yourself', category: 'COMMS', xp: 65, stat: 'COMMS' },
    { title: 'Review SOC recording — write specific improvement notes for each answer', category: 'COMMS', xp: 40, stat: 'COMMS' },
    { title: 'Review AppSec recording — write specific improvement notes for each answer', category: 'COMMS', xp: 40, stat: 'COMMS' },
    { title: 'Full mock SOC L1 interview: 45-minute simulation covering all question types', category: 'COMMS', xp: 75, stat: 'COMMS' },
    { title: 'Full mock AppSec engineer interview: 45-minute simulation covering all question types', category: 'COMMS', xp: 75, stat: 'COMMS' }
  ],

  // FIXED: Replaced the previous THM / LABS chain (3 generic placeholder tasks).
  // "Complete 1 TryHackMe room" three times is not a chain. You are top 2% on THM.
  // You do not need a reminder to open it. Replaced with specific path completions
  // that map directly to SOC and AppSec interview topics.
  'THM PATHS': [
    { title: 'TryHackMe: SOC Level 1 path — Cyber Defence Frameworks module', category: 'LABS', xp: 55, stat: 'TECHNICAL' },
    { title: 'TryHackMe: SOC Level 1 path — Cyber Threat Intelligence module', category: 'LABS', xp: 55, stat: 'TECHNICAL' },
    { title: 'TryHackMe: SOC Level 1 path — Network Security and Traffic Analysis module', category: 'LABS', xp: 60, stat: 'TECHNICAL' },
    { title: 'TryHackMe: SOC Level 1 path — SIEM module (complete all rooms)', category: 'LABS', xp: 65, stat: 'TECHNICAL' },
    { title: 'TryHackMe: SOC Level 1 path — Incident Response and Forensics module', category: 'LABS', xp: 65, stat: 'TECHNICAL' },
    { title: 'TryHackMe: Jr Penetration Tester path — Web Fundamentals module', category: 'LABS', xp: 60, stat: 'TECHNICAL' },
    { title: 'TryHackMe: Jr Penetration Tester path — Burp Suite module (all rooms)', category: 'LABS', xp: 65, stat: 'TECHNICAL' },
    { title: 'TryHackMe: Active Directory Basics room', category: 'LABS', xp: 55, stat: 'TECHNICAL' },
    { title: 'TryHackMe: Attacking Active Directory room', category: 'LABS', xp: 70, stat: 'TECHNICAL' },
    { title: 'TryHackMe: Splunk Basics + Splunk 2 rooms (both complete)', category: 'LABS', xp: 65, stat: 'TECHNICAL' }
  ]
};