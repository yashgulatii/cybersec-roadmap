// src/data/skillsData.js
//
// CHANGE LOG:
// - hardware_iot_security ADDED: Your electronics degree is a market differentiator
//   in IoT/hardware security niches. Needs to exist in the tree at Phase 3 so you
//   can see where it fits in the long-term plan.
// - vapt_reporting ADDED: Distinct skill from technical_writing. You have a real
//   CVSS 8.9 finding and a MobiKwik VAPT report. This is a separate competency.
// - ACTIVE DIRECTORY chain mapping FIXED: was 'ad_defense'. Kerberoasting,
//   Pass-the-Hash, Pass-the-Ticket, and DCSync are offensive skills. They belong
//   on 'ad_attacks', not 'ad_defense'. This was the biggest data integrity error.
// - TOOLS MASTERY chain mapping FIXED: was entirely 'kali_linux'. Now maps each
//   task to the correct individual tool skill (nmap, burp_suite, bloodhound, etc.).
// - SOC OPERATIONS chain mapping FIXED: was entirely 'siem_splunk'. Now distributes
//   tasks across log_analysis, incident_response, threat_detection, siem_splunk.
// - filmmaking unlockedAtPhase FIXED: was 1. You consciously deferred filmmaking.
//   Changed to Phase 3 to eliminate noise from the active skill tree.
// - financial_literacy unlockedAtPhase FIXED: was 1 with zero linked tasks —
//   a floating phantom skill. Changed to Phase 2. Links when employment tasks appear.
// - python_scripting description UPDATED: currentLevel 0 is misleading given your
//   7 built tools. Level tracking is your responsibility; description now reflects
//   that this is an existing strength to be deepened, not started from zero.

import { roadmapData } from './roadmapData';
import { CHAINS } from './missionsData';

const initialSkillsData = {

  // ─── DEFENSIVE SECURITY SKILLS ────────────────────────────────────────────
  network_fundamentals: {
    id: 'network_fundamentals',
    name: 'Network Fundamentals',
    tree: 'Defensive Security',
    unlockedAtPhase: 1,
    currentLevel: 0,
    maxLevel: 5,
    linkedTasks: [],
    description: 'Core networking concepts, protocols, CIDR subnetting, ports, and traffic dynamics. Foundational for both SOC and AppSec roles.'
  },
  siem_splunk: {
    id: 'siem_splunk',
    name: 'SIEM (Splunk)',
    tree: 'Defensive Security',
    unlockedAtPhase: 1,
    currentLevel: 0,
    maxLevel: 5,
    linkedTasks: [],
    description: 'Splunk ingestion, SPL query compilation, custom alerts, correlation dashboard development, and saved searches. PowerSchool lists Google SecOps (Chronicle) as a plus — study both.'
  },
  log_analysis: {
    id: 'log_analysis',
    name: 'Log Analysis',
    tree: 'Defensive Security',
    unlockedAtPhase: 1,
    currentLevel: 0,
    maxLevel: 5,
    linkedTasks: [],
    description: 'Interpreting Windows Event Logs (4624, 4625, 4769, 4688), Syslog entries, and firewall activity patterns.'
  },
  incident_response: {
    id: 'incident_response',
    name: 'Incident Response',
    tree: 'Defensive Security',
    unlockedAtPhase: 1,
    currentLevel: 0,
    maxLevel: 5,
    linkedTasks: [],
    description: 'NIST incident response phases (Preparation, Detection, Containment, Eradication, Recovery, Lessons Learned), containment strategies, and threat triage operations.'
  },
  threat_detection: {
    id: 'threat_detection',
    name: 'Threat Detection',
    tree: 'Defensive Security',
    unlockedAtPhase: 1,
    currentLevel: 0,
    maxLevel: 5,
    linkedTasks: [],
    description: 'Mapping attacks to MITRE ATT&CK, distinguishing IOCs from IOAs, writing custom alert policies, and threat hunting methodologies.'
  },
  security_plus: {
    id: 'security_plus',
    name: 'Security+',
    tree: 'Defensive Security',
    unlockedAtPhase: 1,
    currentLevel: 0,
    maxLevel: 5,
    linkedTasks: [],
    description: 'CompTIA Security+ SY0-701 covering general security concepts, threats, architecture, and risk management. Note: Exam voucher costs ~₹35,000–40,000. Gate the purchase on Week 8 budget check or employer sponsorship.'
  },
  ad_defense: {
    id: 'ad_defense',
    name: 'Active Directory Defense',
    tree: 'Defensive Security',
    unlockedAtPhase: 1,
    currentLevel: 0,
    maxLevel: 5,
    linkedTasks: [],
    description: 'Hardening Active Directory domains, auditing Group Policy Objects, monitoring credential theft via Event ID patterns, and building Splunk detection rules for AD attacks.'
  },

  // ─── OFFENSIVE SECURITY SKILLS ────────────────────────────────────────────
  web_app_testing: {
    id: 'web_app_testing',
    name: 'Web Application Testing (PortSwigger path)',
    tree: 'Offensive Security',
    unlockedAtPhase: 1,
    currentLevel: 0,
    maxLevel: 5,
    linkedTasks: [],
    description: 'OWASP Top 10 vulnerabilities, server-side parameter manipulation, client-side exploits, HTTP smuggling, OAuth/JWT attacks, and API security. Lead skill for AppSec Engineer applications.'
  },
  ad_attacks: {
    id: 'ad_attacks',
    name: 'Active Directory Attacks',
    tree: 'Offensive Security',
    unlockedAtPhase: 1,
    currentLevel: 0,
    maxLevel: 5,
    linkedTasks: [],
    description: 'Kerberoasting, Pass-the-Hash, Pass-the-Ticket, DCSync, BloodHound lateral movement mapping, and privilege escalation path execution.'
  },
  privilege_escalation: {
    id: 'privilege_escalation',
    name: 'Privilege Escalation',
    tree: 'Offensive Security',
    unlockedAtPhase: 2,
    currentLevel: 0,
    maxLevel: 5,
    linkedTasks: [],
    description: 'Bypassing restrictions and elevating privileges on Linux (SUID, cron, writable paths) and Windows (UAC bypass, unquoted service paths, DLL hijacking).'
  },
  bug_bounty_hunting: {
    id: 'bug_bounty_hunting',
    name: 'Bug Bounty Hunting',
    tree: 'Offensive Security',
    unlockedAtPhase: 1,
    currentLevel: 0,
    maxLevel: 5,
    linkedTasks: [],
    description: 'Reconnaissance, target scoping, finding access control vulnerabilities on HackerOne/Bugcrowd VDPs, and drafting structured reports.'
  },
  oscp_prep: {
    id: 'oscp_prep',
    name: 'OSCP Preparation',
    tree: 'Offensive Security',
    unlockedAtPhase: 2,
    currentLevel: 0,
    maxLevel: 5,
    linkedTasks: [],
    description: 'Preparing for the OffSec Certified Professional (PEN-200) examination through HTB machines, OffSec labs, and proctored report practice. Phase 2 skill — after employment.'
  },
  red_team_ops: {
    id: 'red_team_ops',
    name: 'Red Team Operations',
    tree: 'Offensive Security',
    unlockedAtPhase: 3,
    currentLevel: 0,
    maxLevel: 5,
    linkedTasks: [],
    description: 'Executing red team assessments, Cobalt Strike beacon operations, C2 infrastructure, and evasion tactics. Phase 3 skill — after OSCP.'
  },
  // ADDED: Your electronics degree is the differentiator in India for IoT/hardware
  // security roles. Placeholder at Phase 3 so it is visible in the long-term tree.
  hardware_iot_security: {
    id: 'hardware_iot_security',
    name: 'Hardware & IoT Security',
    tree: 'Offensive Security',
    unlockedAtPhase: 3,
    currentLevel: 0,
    maxLevel: 5,
    linkedTasks: [],
    description: 'Electronics-background differentiator. UART/JTAG firmware dumping, embedded system binary analysis, IoT protocol attacks, and hardware debug interface exploitation. Medium-term specialization after SOC stabilization.'
  },

  // ─── TOOLS SKILLS ─────────────────────────────────────────────────────────
  kali_linux: {
    id: 'kali_linux',
    name: 'Kali Linux',
    tree: 'Tools',
    unlockedAtPhase: 1,
    currentLevel: 0,
    maxLevel: 5,
    linkedTasks: [],
    description: 'Linux system fundamentals, penetration testing toolchain configuration, Bash scripting, and Kali-specific environment setup.'
  },
  burp_suite: {
    id: 'burp_suite',
    name: 'Burp Suite',
    tree: 'Tools',
    unlockedAtPhase: 1,
    currentLevel: 0,
    maxLevel: 5,
    linkedTasks: [],
    description: 'Intercepting proxies, Repeater, Intruder, target scope mapping, and automated scanning workflows.'
  },
  nmap: {
    id: 'nmap',
    name: 'Nmap',
    tree: 'Tools',
    unlockedAtPhase: 1,
    currentLevel: 0,
    maxLevel: 5,
    linkedTasks: [],
    description: 'Network service discovery, OS detection, scripting engine (NSE) configurations, timing parameters, and firewall bypass techniques.'
  },
  bloodhound: {
    id: 'bloodhound',
    name: 'BloodHound',
    tree: 'Tools',
    unlockedAtPhase: 1,
    currentLevel: 0,
    maxLevel: 5,
    linkedTasks: [],
    description: 'Active Directory attack path analysis, SharpHound collection parameters, Neo4j graph queries, and shortest-path to DA identification.'
  },
  mimikatz: {
    id: 'mimikatz',
    name: 'Mimikatz',
    tree: 'Tools',
    unlockedAtPhase: 1,
    currentLevel: 0,
    maxLevel: 5,
    linkedTasks: [],
    description: 'Credential dumping (sekurlsa::logonpasswords), Kerberos ticket manipulation (kerberos::ptt), and DCSync operations (lsadump::dcsync).'
  },
  impacket: {
    id: 'impacket',
    name: 'Impacket',
    tree: 'Tools',
    unlockedAtPhase: 1,
    currentLevel: 0,
    maxLevel: 5,
    linkedTasks: [],
    description: 'Python network protocol tools: secretsdump.py (NTDS hash dumping), GetUserSPNs.py (Kerberoasting), wmiexec.py (lateral movement), and smbclient.py.'
  },
  python_scripting: {
    id: 'python_scripting',
    name: 'Python Scripting',
    tree: 'Tools',
    unlockedAtPhase: 1,
    currentLevel: 0,
    maxLevel: 5,
    linkedTasks: [],
    // UPDATED: You have 7 built security tools (Airtrace, Netra, EnChat, SimLock,
    // DualAuth, KeyScope, EntropyX) plus Flask/Django/React/Firebase experience.
    // currentLevel 0 is a tracking placeholder — set it to reflect your actual
    // baseline. This skill needs deepening in security automation, not starting.
    description: 'Security-focused Python: API connectors, log parsers, exploit automation, and tool development. Existing strength with 7 built tools — advance into offensive scripting and security automation.'
  },
  // ADDED: Distinct from technical_writing. You have a real CVSS 8.9 IDOR
  // finding and a MobiKwik VAPT report. Report writing is a standalone competency
  // that interviewers at DigiCert and PowerSchool will specifically ask about.
  vapt_reporting: {
    id: 'vapt_reporting',
    name: 'VAPT Report Writing',
    tree: 'Tools',
    unlockedAtPhase: 1,
    currentLevel: 0,
    maxLevel: 5,
    linkedTasks: [],
    description: 'Structuring vulnerability assessment and penetration testing reports with CVSS scoring, evidence documentation, attack narrative, and prioritized remediation. Linked to Campus Track IDOR and MobiKwik VAPT deliverables.'
  },

  // ─── CREATIVE SKILLS ──────────────────────────────────────────────────────
  photography: {
    id: 'photography',
    name: 'Photography',
    tree: 'Creative',
    unlockedAtPhase: 1,
    currentLevel: 0,
    maxLevel: 5,
    linkedTasks: [],
    description: 'Street photography, camera parameters, framing, lighting dynamics, and RAW photo processing.'
  },
  // FIXED: was unlockedAtPhase 2. Filmmaking is a consciously deferred interest.
  // Phase 2 created noise in the active skill tree during the job search period.
  // Moved to Phase 3 — revisit after employment is stable.
  filmmaking: {
    id: 'filmmaking',
    name: 'Filmmaking',
    tree: 'Creative',
    unlockedAtPhase: 3,
    currentLevel: 0,
    maxLevel: 5,
    linkedTasks: [],
    description: 'Camera movements, lighting control, cinematic structures, and post-production video editing. Deferred interest — Phase 3 when stability allows.'
  },
  technical_writing: {
    id: 'technical_writing',
    name: 'Technical Writing',
    tree: 'Creative',
    unlockedAtPhase: 4,
    currentLevel: 0,
    maxLevel: 5,
    linkedTasks: [],
    description: 'Publishing exploit research briefs, documenting complex attacks for public audiences, and writing technical blog posts. Phase 4 — after OSCP and public credibility building.'
  },

  // ─── PERSONAL SKILLS ──────────────────────────────────────────────────────
  discipline: {
    id: 'discipline',
    name: 'Discipline',
    tree: 'Personal',
    unlockedAtPhase: 1,
    currentLevel: 0,
    maxLevel: 5,
    linkedTasks: [],
    description: 'Maintaining core morning rituals, routine adherence, offline blocks, and daily tracking updates. Foundation for all other progress.'
  },
  // FIXED: was unlockedAtPhase 1 with zero linked tasks — a phantom floating skill.
  // Moved to Phase 2 where the first financial tasks appear (employment budget,
  // SIP setup, emergency fund). No income = no meaningful financial tracking.
  financial_literacy: {
    id: 'financial_literacy',
    name: 'Financial Literacy',
    tree: 'Personal',
    unlockedAtPhase: 2,
    currentLevel: 0,
    maxLevel: 5,
    linkedTasks: [],
    description: 'SIP compound allocations, Nifty 50 index fund setup, budgeting after first paycheck, and emergency savings milestone tracking. Phase 2 — activates after employment.'
  },
  communication: {
    id: 'communication',
    name: 'Communication',
    tree: 'Personal',
    unlockedAtPhase: 1,
    currentLevel: 0,
    maxLevel: 5,
    linkedTasks: [],
    description: 'STAR framework interview answers, mock interview recordings, cold outreach quality, and professional writing. Most critical Phase 1 skill alongside technical ops.'
  },
  relationships: {
    id: 'relationships',
    name: 'Relationships',
    tree: 'Personal',
    unlockedAtPhase: 1,
    currentLevel: 0,
    maxLevel: 5,
    linkedTasks: [],
    description: 'Fostering professional networks, LinkedIn connections in target companies, mentor relationships, and community presence at OWASP / security meetups.'
  }
};

const normalize = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

// ─── LINK TASKS FROM ROADMAP DATA ─────────────────────────────────────────────
['phase1', 'phase2', 'phase3', 'phase4'].forEach(pKey => {
  const phase = roadmapData[pKey];
  if (!phase) return;
  const sections = phase.weeks || phase.months || phase.quarters || phase.years || [];
  sections.forEach(sec => {
    (sec.tasks || []).forEach(task => {
      if (!task.linkedSkill) return;
      const tSkill = normalize(task.linkedSkill);
      Object.values(initialSkillsData).forEach(skill => {
        if (tSkill === normalize(skill.name) || tSkill === normalize(skill.id)) {
          if (!skill.linkedTasks.includes(task.id)) {
            skill.linkedTasks.push(task.id);
          }
        }
      });
    });
  });
});

// ─── LINK TASKS FROM CHAINS ───────────────────────────────────────────────────
// FIXED: Previously every chain was routed to a single skill incorrectly.
// Now each chain maps tasks to the correct skill based on what is actually being learned.
if (CHAINS) {
  Object.keys(CHAINS).forEach(chainName => {
    const chainTasks = CHAINS[chainName] || [];

    chainTasks.forEach((ct, index) => {
      const taskId = `chain:${chainName}:${index}`;
      let targetSkillKey = null;

      if (chainName === 'NETWORKING') {
        targetSkillKey = 'network_fundamentals';

      } else if (chainName === 'LINUX') {
        targetSkillKey = 'kali_linux';

      } else if (chainName === 'SOC OPERATIONS') {
        // FIXED: was entirely 'siem_splunk'. SOC operations spans 4 skill areas.
        const socMap = {
          0: 'incident_response',  // SOC roles and responsibilities
          1: 'siem_splunk',        // SIEM basics: vendors, capabilities
          2: 'log_analysis',       // Log types: Windows Event, syslog, firewall
          3: 'threat_detection',   // Alert triage: P1/P2/P3 classification
          4: 'threat_detection',   // IOC vs IOA
          5: 'incident_response',  // Incident response: 6 phases
          6: 'siem_splunk',        // Splunk: basic SPL search queries
          7: 'incident_response',  // Write a mock incident response report
          8: 'threat_detection',   // Threat hunting basics
          9: 'threat_detection'    // MITRE ATT&CK framework overview
        };
        targetSkillKey = socMap[index] ?? 'siem_splunk';

      } else if (chainName === 'WEB SECURITY') {
        targetSkillKey = 'web_app_testing';

      } else if (chainName === 'TOOLS MASTERY') {
        // FIXED: was entirely 'kali_linux'. Maps each task to its correct skill.
        const toolsMap = {
          0: 'nmap',                  // Nmap: installation and basic scans
          1: 'nmap',                  // Nmap: scripts and advanced usage
          2: 'kali_linux',            // Metasploit: basics and msfconsole
          3: 'burp_suite',            // Burp Suite: intercept, repeat, intruder
          4: 'network_fundamentals',  // Wireshark: capture filters, traffic analysis
          5: 'bloodhound',            // BloodHound: setup and AD enumeration
          6: 'kali_linux',            // Gobuster/ffuf: directory and subdomain fuzzing
          7: 'kali_linux',            // Hydra: basic credential brute forcing
          8: 'web_app_testing',       // SQLmap: automated SQL injection
          9: 'kali_linux'             // Hashcat: password hash cracking basics
        };
        targetSkillKey = toolsMap[index] ?? 'kali_linux';

      } else if (chainName === 'ACTIVE DIRECTORY') {
        // FIXED: was 'ad_defense'. Kerberoasting, PtH, PtT, DCSync are offensive.
        // BUILD tasks (lab setup, detection rules, documentation) map to ad_defense.
        const adMap = {
          0: 'ad_attacks',    // AD concepts: Kerberos, LDAP, AD structure
          1: 'ad_defense',    // AD Lab: setup and domain join (infrastructure build)
          2: 'ad_attacks',    // AD enumeration with BloodHound
          3: 'ad_attacks',    // Kerberoasting attack walkthrough
          4: 'ad_attacks',    // Pass-the-Hash and Pass-the-Ticket
          5: 'ad_attacks',    // AD privilege escalation paths
          6: 'ad_defense',    // Build a detection rule for one attack
          7: 'ad_defense'     // Document findings in a lab report
        };
        targetSkillKey = adMap[index] ?? 'ad_attacks';

      } else if (chainName === 'INTERVIEW PREP') {
        targetSkillKey = 'communication';

      } else if (chainName === 'THM PATHS') {
        // Route THM path completions to the skill they teach
        const thmMap = {
          0: 'threat_detection',    // SOC L1: Cyber Defence Frameworks
          1: 'threat_detection',    // SOC L1: Cyber Threat Intelligence
          2: 'network_fundamentals', // SOC L1: Network Security and Traffic Analysis
          3: 'siem_splunk',         // SOC L1: SIEM module
          4: 'incident_response',   // SOC L1: Incident Response and Forensics
          5: 'web_app_testing',     // Jr Pentester: Web Fundamentals
          6: 'burp_suite',          // Jr Pentester: Burp Suite module
          7: 'ad_attacks',          // Active Directory Basics
          8: 'ad_attacks',          // Attacking Active Directory
          9: 'siem_splunk'          // Splunk Basics + Splunk 2
        };
        targetSkillKey = thmMap[index] ?? 'kali_linux';
      }

      if (targetSkillKey && initialSkillsData[targetSkillKey]) {
        if (!initialSkillsData[targetSkillKey].linkedTasks.includes(taskId)) {
          initialSkillsData[targetSkillKey].linkedTasks.push(taskId);
        }
      }
    });
  });
}

export const skillsData = initialSkillsData;
export const SKILLS = skillsData;