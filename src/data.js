// data.js — redesigned with skill mapping + subtask breakdown

// ─── SKILL DEFINITIONS ───────────────────────────────────────────────────────
// Each skill has an id, name, icon, color, and short description.
// Skills are the unit of measurement for the dashboard progress view.

export const SKILLS = {
  networking: { id: 'networking', name: 'Networking', icon: '🌐', color: '#00c8ff', desc: 'Ports, OSI, TCP/IP, DNS, HTTP' },
  linux: { id: 'linux', name: 'Linux & OS', icon: '🐧', color: '#e8d800', desc: 'CLI, logs, file system, permissions' },
  windows: { id: 'windows', name: 'Windows & AD', icon: '🪟', color: '#4a9eff', desc: 'Event logs, Active Directory, registry' },
  threats: { id: 'threats', name: 'Threat Frameworks', icon: '⚔️', color: '#ff6b6b', desc: 'Kill Chain, MITRE ATT&CK, Diamond Model' },
  ir: { id: 'ir', name: 'Incident Response', icon: '🚨', color: '#ff9f43', desc: 'NIST lifecycle, triage, containment' },
  siem: { id: 'siem', name: 'SIEM & Log Analysis', icon: '📊', color: '#b57aff', desc: 'SIEM concepts, correlation, log sources' },
  splunk: { id: 'splunk', name: 'Splunk', icon: '🔍', color: '#ff6d35', desc: 'SPL, dashboards, alerts, BOTS dataset' },
  traffic: { id: 'traffic', name: 'Traffic Analysis', icon: '🦈', color: '#1adfdf', desc: 'Wireshark, PCAP, network forensics' },
  malware: { id: 'malware', name: 'Malware Analysis', icon: '🦠', color: '#ff4f6a', desc: 'Malware types, behaviors, persistence, IOCs' },
  vuln: { id: 'vuln', name: 'Vuln Management', icon: '🎯', color: '#ffd23f', desc: 'CVE, CVSS scoring, patch management' },
  webappsec: { id: 'webappsec', name: 'Web App Security', icon: '🕸️', color: '#00e87a', desc: 'OWASP Top 10, SQLi, XSS, CSRF, injection' },
  soc: { id: 'soc', name: 'SOC Operations', icon: '🛡️', color: '#7abaff', desc: 'Alert triage, SOC tiers, tools, workflow' },
  forensics: { id: 'forensics', name: 'Digital Forensics', icon: '🔬', color: '#ff85e1', desc: 'Memory, disk, Windows artifacts, timeline' },
  threatintel: { id: 'threatintel', name: 'Threat Intelligence', icon: '🧠', color: '#a8e063', desc: 'IOCs, IOAs, threat feeds, VirusTotal, OTX' },
  interview: { id: 'interview', name: 'Interview Readiness', icon: '💼', color: '#ffe066', desc: 'Q&A fluency, scenarios, resume, comms' },
  portfolio: { id: 'portfolio', name: 'Portfolio & Projects', icon: '📁', color: '#ffb347', desc: 'Homelab, reports, screenshots, evidence' },
  bugbounty: { id: 'bugbounty', name: 'Bug Bounty', icon: '💰', color: '#00e87a', desc: 'Recon methodology, hunting, submissions' },
  cloud: { id: 'cloud', name: 'Cloud Security', icon: '☁️', color: '#8af5ff', desc: 'Azure, Sentinel, IAM, misconfigurations' },
};

// ─── PHASE / WEEK METADATA ───────────────────────────────────────────────────
export const PHASES = ['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8', 'pa', 'pb', 'pc', 'pd', 'pe', 'pf'];

export const PHASE_META = [
  { id: 'w1', label: 'Week 1', short: 'W1', color: '#BA7517', icon: '🔥', sub: 'Ports, protocols & network drill' },
  { id: 'w2', label: 'Week 2', short: 'W2', color: '#BA7517', icon: '🔥', sub: 'Cyber Kill Chain & MITRE ATT&CK' },
  { id: 'w3', label: 'Week 3', short: 'W3', color: '#BA7517', icon: '🔥', sub: 'Windows Event Logs & Incident Response' },
  { id: 'w4', label: 'Week 4', short: 'W4', color: '#BA7517', icon: '🔥', sub: 'Wireshark & network forensics' },
  { id: 'w5', label: 'Week 5', short: 'W5', color: '#BA7517', icon: '🔥', sub: 'Splunk SIEM — hands on' },
  { id: 'w6', label: 'Week 6', short: 'W6', color: '#BA7517', icon: '🔥', sub: 'Live SOC labs & IOC enrichment' },
  { id: 'w7', label: 'Week 7', short: 'W7', color: '#BA7517', icon: '🔥', sub: 'Wazuh homelab & EDR concepts' },
  { id: 'w8', label: 'Week 8', short: 'W8', color: '#BA7517', icon: '🔥', sub: 'Interview prep & aggressive applying' },
  { id: 'pa', label: 'Phase A', short: 'Sec+', color: '#185FA5', icon: '🏆', sub: 'Security+ SY0-701' },
  { id: 'pb', label: 'Phase B', short: 'SOC', color: '#185FA5', icon: '🛡️', sub: 'SOC analyst core advanced' },
  { id: 'pc', label: 'Phase C', short: 'SIEM', color: '#185FA5', icon: '📊', sub: 'SIEM & tooling advanced' },
  { id: 'pd', label: 'Phase D', short: 'Web', color: '#185FA5', icon: '⚔️', sub: 'Web hacking — PortSwigger labs' },
  { id: 'pe', label: 'Phase E', short: 'Bug', color: '#185FA5', icon: '💰', sub: 'Bug bounty entry' },
  { id: 'pf', label: 'Phase F', short: 'Adv', color: '#185FA5', icon: '🔬', sub: 'Advanced pentest & electronics' },
];

// ─── ROADMAP DATA ─────────────────────────────────────────────────────────────
// Structure:
//   ROADMAP_DATA[phaseId] = {
//     weekTitle: string,
//     weekGoal:  string,
//     sections: [
//       {
//         sectionTitle: string,
//         tasks: [
//           {
//             id:        string   (globally unique),
//             title:     string,
//             skills:    string[] (skill ids this task builds),
//             badge:     string,
//             badgeClass:string,
//             link?:     string,
//             linkText?: string,
//             subtasks:  { id: string, text: string }[]
//           }
//         ]
//       }
//     ]
//   }

export const ROADMAP_DATA = {

  // ── WEEK 1 ──────────────────────────────────────────────────────────────────
  w1: {
    weekTitle: 'Week 1 — Networking & Protocols',
    weekGoal: 'Nail the questions that fail most freshers in the first 10 minutes of a SOC interview.',
    sections: [
      {
        sectionTitle: 'Ports & Services',
        tasks: [
          {
            id: 'w1_ports', title: 'Top 25 ports — instant recall',
            skills: ['networking'],
            badge: 'Must know', badgeClass: 'badge-must',
            subtasks: [
              { id: 'w1_ports_1', text: 'Group 1 — memorise: FTP:21, SSH:22, Telnet:23, SMTP:25, DNS:53' },
              { id: 'w1_ports_2', text: 'Group 2 — memorise: HTTP:80, POP3:110, IMAP:143, HTTPS:443, SMB:445' },
              { id: 'w1_ports_3', text: 'Group 3 — memorise: RDP:3389, MySQL:3306, MSSQL:1433, VNC:5900, PostgreSQL:5432' },
              { id: 'w1_ports_4', text: 'Group 4 — memorise: LDAP:389, Kerberos:88, SNMP:161, NTP:123, TFTP:69' },
              { id: 'w1_ports_5', text: 'Group 5 — memorise: MongoDB:27017, Redis:6379, WinRM:5985, SMTP-alt:587, LDAPS:636' },
              { id: 'w1_ports_6', text: 'Self-quiz: write all 25 port→service mappings cold, no notes. Repeat until 100%.' },
            ],
          },
        ],
      },
      {
        sectionTitle: 'OSI & TCP/IP',
        tasks: [
          {
            id: 'w1_osi', title: 'OSI model — all 7 layers with protocols',
            skills: ['networking'],
            badge: 'Must know', badgeClass: 'badge-must',
            subtasks: [
              { id: 'w1_osi_1', text: 'Memorise layers top→bottom: Application, Presentation, Session, Transport, Network, Data Link, Physical' },
              { id: 'w1_osi_2', text: 'Mnemonic (bottom→top): "Please Do Not Throw Sausage Pizza Away"' },
              { id: 'w1_osi_3', text: 'Layer 7 protocols: HTTP, HTTPS, DNS, SMTP, FTP, SNMP' },
              { id: 'w1_osi_4', text: 'Layer 4: TCP (reliable), UDP (fast/unreliable) — with examples of which apps use each' },
              { id: 'w1_osi_5', text: 'Layer 3: IP, ICMP — devices: routers. Layer 2: ARP, MAC — devices: switches. Layer 1: cables, hubs.' },
              { id: 'w1_osi_6', text: 'Watch Professor Messer "OSI Model" video (free YouTube). Draw model from memory after.' },
            ],
          },
          {
            id: 'w1_tcp', title: 'TCP 3-way handshake + all flags',
            skills: ['networking', 'traffic'],
            badge: 'Must know', badgeClass: 'badge-must',
            subtasks: [
              { id: 'w1_tcp_1', text: 'Connection setup: Client→SYN, Server→SYN-ACK, Client→ACK' },
              { id: 'w1_tcp_2', text: 'TCP flags: SYN (sync), ACK (acknowledge), FIN (finish), RST (reset), PSH (push), URG (urgent)' },
              { id: 'w1_tcp_3', text: 'Understand half-open (SYN) scan: sends SYN, never completes handshake — used by Nmap -sS' },
              { id: 'w1_tcp_4', text: 'TCP vs UDP: TCP=reliable, ordered, flow-controlled. UDP=fast, no guarantee, used by DNS/VoIP/games.' },
              { id: 'w1_tcp_5', text: 'Draw the full 3-way handshake on paper from memory. Explain RST vs FIN teardown.' },
            ],
          },
        ],
      },
      {
        sectionTitle: 'Key Application Protocols',
        tasks: [
          {
            id: 'w1_dns', title: 'DNS — full resolution chain + record types',
            skills: ['networking'],
            badge: 'Must know', badgeClass: 'badge-must',
            subtasks: [
              { id: 'w1_dns_1', text: 'Resolution chain: Browser cache → OS cache → Stub → Recursive Resolver → Root → TLD → Authoritative NS' },
              { id: 'w1_dns_2', text: 'Record types: A (IPv4), AAAA (IPv6), MX (mail), CNAME (alias), TXT (verification), PTR (reverse), NS (nameserver)' },
              { id: 'w1_dns_3', text: 'DNS runs on port 53 UDP for queries, port 53 TCP for zone transfers (AXFR)' },
              { id: 'w1_dns_4', text: 'DNS attack types: cache poisoning, DNS tunneling (data exfil over DNS), typosquatting domains' },
              { id: 'w1_dns_5', text: 'Trace step-by-step: what happens when you type "google.com" in a browser. Say it out loud.' },
            ],
          },
          {
            id: 'w1_http', title: 'HTTP/HTTPS — methods, status codes, headers',
            skills: ['networking', 'webappsec'],
            badge: 'Must know', badgeClass: 'badge-must',
            subtasks: [
              { id: 'w1_http_1', text: 'HTTP methods: GET (retrieve), POST (create/send data), PUT (update), DELETE (remove), PATCH (partial update), OPTIONS, HEAD' },
              { id: 'w1_http_2', text: 'Status groups: 2xx success, 3xx redirect, 4xx client error, 5xx server error' },
              { id: 'w1_http_3', text: 'Key codes: 200 OK, 301 permanent redirect, 302 temp redirect, 400 bad request, 401 unauthorised, 403 forbidden, 404 not found, 500 server error' },
              { id: 'w1_http_4', text: 'HTTPS: TLS encrypts data in transit. TLS handshake: ClientHello → ServerHello + cert → key exchange → finished.' },
              { id: 'w1_http_5', text: 'Key headers: Authorization, Cookie, Set-Cookie, X-Forwarded-For, Content-Type, HSTS, CSP, CORS' },
            ],
          },
          {
            id: 'w1_ip', title: 'IP addressing, subnetting, private ranges',
            skills: ['networking'],
            badge: 'Free', badgeClass: 'badge-free',
            subtasks: [
              { id: 'w1_ip_1', text: 'RFC1918 private ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 — know these cold' },
              { id: 'w1_ip_2', text: 'CIDR notation: /24 = 256 hosts, /16 = 65536, /8 = 16.7M. /30 = 4 hosts (2 usable).' },
              { id: 'w1_ip_3', text: 'NAT: why internal IPs differ from external — router translates private→public on egress' },
              { id: 'w1_ip_4', text: 'Do 20 practice subnetting problems at subnettingpractice.com (free). Target < 20 sec per question.' },
            ],
            link: 'https://subnettingpractice.com', linkText: 'subnettingpractice.com',
          },
          {
            id: 'w1_resources', title: 'Resource: Professor Messer N+ networking videos',
            skills: ['networking'],
            badge: 'Free', badgeClass: 'badge-free',
            link: 'https://www.professormesser.com/network-plus/n10-009/n10-009-video/n10-009-training-course/', linkText: 'professormesser.com',
            subtasks: [
              { id: 'w1_res_1', text: 'Watch: "OSI Model" video — take handwritten notes' },
              { id: 'w1_res_2', text: 'Watch: "TCP/IP Model" video — take handwritten notes' },
              { id: 'w1_res_3', text: 'Watch: "DNS" video — trace the resolution chain while watching' },
              { id: 'w1_res_4', text: 'Complete TryHackMe "Pre-Security" networking module (free tier)' },
            ],
          },
        ],
      },
    ],
  },

  // ── WEEK 2 ──────────────────────────────────────────────────────────────────
  w2: {
    weekTitle: 'Week 2 — Kill Chain & MITRE ATT&CK',
    weekGoal: 'Answer framework questions fluently — second most common interview killer after ports.',
    sections: [
      {
        sectionTitle: 'Cyber Kill Chain',
        tasks: [
          {
            id: 'w2_ckc', title: 'Kill Chain — all 7 stages with attacker actions & defences',
            skills: ['threats', 'soc'],
            badge: 'Must know', badgeClass: 'badge-must',
            subtasks: [
              { id: 'w2_ckc_1', text: 'Stage 1 Reconnaissance: OSINT (Shodan, LinkedIn, email harvesting). Defence: limit public exposure.' },
              { id: 'w2_ckc_2', text: 'Stage 2 Weaponisation: craft exploit + payload (Office macro, PDF exploit). Defence: patch CVEs fast.' },
              { id: 'w2_ckc_3', text: 'Stage 3 Delivery: phishing email, watering hole, USB drop. Defence: email gateway, user training.' },
              { id: 'w2_ckc_4', text: 'Stage 4 Exploitation: payload executes (macro runs, browser exploit fires). Defence: EDR, app whitelisting.' },
              { id: 'w2_ckc_5', text: 'Stage 5 Installation: malware drops, persistence set (scheduled task, registry Run key). Defence: behaviour-based EDR.' },
              { id: 'w2_ckc_6', text: 'Stage 6 Command & Control: malware calls home (HTTP/HTTPS to C2 IP). Defence: firewall egress filtering, DNS sinkholing.' },
              { id: 'w2_ckc_7', text: 'Stage 7 Actions on Objectives: data exfil, ransomware encrypt, lateral move. Defence: data loss prevention, network segmentation.' },
              { id: 'w2_ckc_8', text: 'Write all 7 stages from memory without notes. Repeat until instant.' },
            ],
          },
        ],
      },
      {
        sectionTitle: 'MITRE ATT&CK',
        tasks: [
          {
            id: 'w2_attack_tactics', title: 'MITRE ATT&CK — all 14 tactics in order',
            skills: ['threats', 'soc'],
            badge: 'Must know', badgeClass: 'badge-must',
            link: 'https://attack.mitre.org', linkText: 'attack.mitre.org',
            subtasks: [
              { id: 'w2_atk_1', text: 'Open attack.mitre.org. Understand the matrix layout: columns = tactics, cells = techniques.' },
              { id: 'w2_atk_2', text: 'Tactics 1–5: Reconnaissance, Resource Development, Initial Access, Execution, Persistence' },
              { id: 'w2_atk_3', text: 'Tactics 6–10: Privilege Escalation, Defense Evasion, Credential Access, Discovery, Lateral Movement' },
              { id: 'w2_atk_4', text: 'Tactics 11–14: Collection, Command & Control, Exfiltration, Impact' },
              { id: 'w2_atk_5', text: 'Understand: Tactic = the WHY (adversary goal), Technique = the HOW (specific method)' },
              { id: 'w2_atk_6', text: 'Write all 14 tactics from memory in order. No notes.' },
            ],
          },
          {
            id: 'w2_attack_techniques', title: 'MITRE ATT&CK — 5 key techniques in depth',
            skills: ['threats', 'soc', 'windows'],
            badge: 'Must know', badgeClass: 'badge-must',
            subtasks: [
              { id: 'w2_tech_1', text: 'T1566 Phishing: email delivers malicious attachment/link. Sub-techniques: spearphishing attachment, link, via service. Detection: email gateway logs, attachment sandboxing.' },
              { id: 'w2_tech_2', text: 'T1078 Valid Accounts: attacker uses stolen legit credentials. Hard to detect without baselines. Detection: impossible travel, off-hours logins, Event ID 4624 from unusual IPs.' },
              { id: 'w2_tech_3', text: 'T1059 Command Scripting: T1059.001 PowerShell specifically. Detection: Event ID 4104 (script block logging). Why: PowerShell is trusted, bypasses AV.' },
              { id: 'w2_tech_4', text: 'T1053 Scheduled Tasks: persistence via schtasks.exe. Detection: Event ID 4698 (scheduled task created), 4688 with schtasks.exe parent. Common malware technique.' },
              { id: 'w2_tech_5', text: 'T1021 Remote Services: RDP (T1021.001), SMB (T1021.002), WinRM (T1021.006). Lateral movement. Detection: Event ID 4624 Type 10 (RDP), Type 3 (network/SMB).' },
            ],
          },
          {
            id: 'w2_navigator', title: 'ATT&CK Navigator — build and export a threat layer',
            skills: ['threats', 'portfolio'],
            badge: 'Portfolio', badgeClass: 'badge-port',
            link: 'https://mitre-attack.github.io/attack-navigator/', linkText: 'mitre-attack.github.io',
            subtasks: [
              { id: 'w2_nav_1', text: 'Open ATT&CK Navigator at mitre-attack.github.io/attack-navigator' },
              { id: 'w2_nav_2', text: 'Create new layer. Highlight all techniques used in a phishing → lateral move campaign.' },
              { id: 'w2_nav_3', text: 'Colour-code: yellow = Initial Access, orange = Lateral Movement, red = Exfiltration.' },
              { id: 'w2_nav_4', text: 'Export as SVG or PNG. Save for portfolio and resume.' },
              { id: 'w2_nav_5', text: 'Write 3 sentences explaining what your layer shows — use this in interviews.' },
            ],
          },
          {
            id: 'w2_model_diff', title: 'Kill Chain vs ATT&CK vs Diamond Model — articulate differences',
            skills: ['threats', 'interview'],
            badge: 'Must know', badgeClass: 'badge-must',
            subtasks: [
              { id: 'w2_diff_1', text: 'Kill Chain: sequential linear model (Lockheed Martin, 2011). Good for early-stage detection gates.' },
              { id: 'w2_diff_2', text: 'ATT&CK: granular post-compromise TTP library. Good for detection engineering and threat hunting.' },
              { id: 'w2_diff_3', text: 'Diamond Model: four vertices — Adversary, Capability, Infrastructure, Victim. Good for attribution and campaign tracking.' },
              { id: 'w2_diff_4', text: 'Practice: explain the difference in 60 seconds out loud. Record yourself. Fix hesitations.' },
            ],
          },
        ],
      },
      {
        sectionTitle: 'CIA Triad & Security Foundations',
        tasks: [
          {
            id: 'w2_cia', title: 'CIA Triad, security controls, MFA factors',
            skills: ['threats', 'soc', 'interview'],
            badge: 'Must know', badgeClass: 'badge-must',
            subtasks: [
              { id: 'w2_cia_1', text: 'Confidentiality: prevent unauthorised access. Violation: data breach exposing customer PII.' },
              { id: 'w2_cia_2', text: 'Integrity: data is accurate and unmodified. Violation: attacker alters financial records.' },
              { id: 'w2_cia_3', text: 'Availability: systems accessible when needed. Violation: ransomware encrypts servers during trading hours.' },
              { id: 'w2_cia_4', text: 'Control types: preventive, detective, corrective, deterrent, compensating, directive' },
              { id: 'w2_cia_5', text: 'Control categories: technical (firewall), managerial (policy), operational/physical (guard, camera)' },
              { id: 'w2_cia_6', text: 'MFA factors: something you know (password), have (OTP token), are (fingerprint), location, behaviour' },
              { id: 'w2_cia_7', text: 'Non-repudiation: digital signatures ensure sender cannot deny sending. Example: email with S/MIME.' },
            ],
          },
        ],
      },
    ],
  },

  // ── WEEK 3 ──────────────────────────────────────────────────────────────────
  w3: {
    weekTitle: 'Week 3 — Windows Event Logs & Incident Response',
    weekGoal: 'This is the core daily work of a SOC L1. You will do this every single shift.',
    sections: [
      {
        sectionTitle: 'Windows Event IDs',
        tasks: [
          {
            id: 'w3_eids', title: 'Critical 8 Event IDs — know cold what each means as a threat indicator',
            skills: ['windows', 'soc', 'ir'],
            badge: 'Must know', badgeClass: 'badge-must',
            subtasks: [
              { id: 'w3_eid_1', text: '4624 Successful Logon — check: LogonType, TargetUserName, IpAddress. Unusual logon = indicator.' },
              { id: 'w3_eid_2', text: '4625 Failed Logon — repeated = brute force. Track SubStatus for locked account vs bad password.' },
              { id: 'w3_eid_3', text: '4688 New Process Created — needs process auditing enabled. Suspicious: cmd.exe spawned by Word.exe.' },
              { id: 'w3_eid_4', text: '4720 User Account Created — unexpected new accounts = persistence or insider threat indicator.' },
              { id: 'w3_eid_5', text: '4726 User Account Deleted — covering tracks after operation or legitimate offboarding.' },
              { id: 'w3_eid_6', text: '4732 Member Added to Local Administrators Group — privilege escalation or lateral movement.' },
              { id: 'w3_eid_7', text: '7045 New Service Installed — classic malware persistence. Check service name and binary path.' },
              { id: 'w3_eid_8', text: '4104 PowerShell Script Block Logging — captures full script content. Requires GPO to enable.' },
              { id: 'w3_eid_9', text: 'Open Windows Event Viewer on your machine. Find at least 3 of these Event IDs in your own logs.' },
            ],
          },
          {
            id: 'w3_logon_types', title: 'Windows Logon Types — lateral movement detection',
            skills: ['windows', 'ir', 'forensics'],
            badge: 'Must know', badgeClass: 'badge-must',
            subtasks: [
              { id: 'w3_lt_1', text: 'Type 2 Interactive: physical console login. Normal user sitting at keyboard.' },
              { id: 'w3_lt_2', text: 'Type 3 Network: SMB file share, net use, mapped drive — no credentials cached.' },
              { id: 'w3_lt_3', text: 'Type 7 Unlock: screen unlock after lock. Normal for workstations.' },
              { id: 'w3_lt_4', text: 'Type 10 Remote Interactive: RDP session. High priority for SOC review.' },
              { id: 'w3_lt_5', text: 'Lateral movement signature: rapid Type 3 logons from one source to many internal hosts.' },
              { id: 'w3_lt_6', text: 'Practice: explain this pattern in interview — "How would you detect lateral movement in Windows logs?"' },
            ],
          },
        ],
      },
      {
        sectionTitle: 'Incident Response',
        tasks: [
          {
            id: 'w3_nist_ir', title: 'NIST SP 800-61 Incident Response — 4 phases with specific actions',
            skills: ['ir', 'soc'],
            badge: 'Must know', badgeClass: 'badge-must',
            subtasks: [
              { id: 'w3_ir_1', text: 'Phase 1 Preparation: IR plan, runbooks, team contacts, tooling (SIEM, EDR, forensics kit).' },
              { id: 'w3_ir_2', text: 'Phase 2 Detection & Analysis: alert review, log triage, initial scoping, IOC extraction, classify severity.' },
              { id: 'w3_ir_3', text: 'Phase 3 Containment: isolate host (network segment), block C2 IP in firewall, disable compromised account, null-route domain.' },
              { id: 'w3_ir_4', text: 'Phase 3 Eradication: remove malware, close persistence (delete scheduled task/reg key), patch the vulnerability.' },
              { id: 'w3_ir_5', text: 'Phase 3 Recovery: restore from backup, verify clean, monitor closely for 48–72 hours post-recovery.' },
              { id: 'w3_ir_6', text: 'Phase 4 Post-Incident: lessons learned report, update playbooks and detection rules, root cause analysis.' },
              { id: 'w3_ir_7', text: 'Draw the full lifecycle from memory. Practice explaining it in < 90 seconds.' },
            ],
          },
          {
            id: 'w3_ioc_ioa', title: 'IOC vs IOA — operational distinction',
            skills: ['ir', 'threatintel', 'soc'],
            badge: 'Must know', badgeClass: 'badge-must',
            subtasks: [
              { id: 'w3_ioc_1', text: 'IOC (Indicator of Compromise): artifact of a past event. Examples: malicious IP, file hash, C2 domain, registry key, user-agent string.' },
              { id: 'w3_ioc_2', text: 'IOA (Indicator of Attack): behavioural pattern of an active attack. Example: unusual process spawning cmd.exe at 3am.' },
              { id: 'w3_ioc_3', text: 'Why IOAs are harder to evade: attackers can change hashes/IPs easily but cannot easily change behaviour patterns.' },
              { id: 'w3_ioc_4', text: 'SOC L1 handles IOCs. Threat hunters work IOAs. Know your scope for interviews.' },
            ],
          },
        ],
      },
      {
        sectionTitle: 'Malware Detection via Logs',
        tasks: [
          {
            id: 'w3_malware_events', title: 'Malware types — which Event IDs fire for each',
            skills: ['malware', 'windows', 'soc'],
            badge: 'Must know', badgeClass: 'badge-must',
            subtasks: [
              { id: 'w3_mal_1', text: 'Ransomware: mass file rename events, VSS deletion (vssadmin delete shadows via 4688), 7045 for new service.' },
              { id: 'w3_mal_2', text: 'RAT/Backdoor: 4624 Type 10 from unusual IPs, outbound connections at regular intervals (C2 beacon), 7045 service install.' },
              { id: 'w3_mal_3', text: 'Keylogger: 4688 with suspicious parent-child (e.g. svchost spawning notepad), process injection indicators.' },
              { id: 'w3_mal_4', text: 'Fileless malware: 4104 PowerShell script block, WMI execution (no file dropped — lives in memory/registry).' },
              { id: 'w3_mal_5', text: 'Rootkit: 7045 new driver/service, integrity check failures, hidden processes (detectable by memory forensics).' },
            ],
          },
          {
            id: 'w3_linux_logs', title: 'Linux log analysis — read and interpret auth events',
            skills: ['linux', 'soc'],
            badge: 'Free', badgeClass: 'badge-free',
            subtasks: [
              { id: 'w3_linux_1', text: 'Log locations: /var/log/auth.log (SSH & sudo), /var/log/syslog (general), /var/log/kern.log (kernel).' },
              { id: 'w3_linux_2', text: 'Run: grep "Failed password" /var/log/auth.log — identify a brute force pattern.' },
              { id: 'w3_linux_3', text: 'Run: grep "Accepted password" /var/log/auth.log — identify successful logins and source IPs.' },
              { id: 'w3_linux_4', text: 'Understand syslog severity: emerg, alert, crit, err, warning, notice, info, debug.' },
              { id: 'w3_linux_5', text: '/etc/passwd stores usernames/shells (readable). /etc/shadow stores hashed passwords (root only).' },
              { id: 'w3_linux_6', text: 'TryHackMe: complete "Linux Fundamentals Part 1" (free room).' },
            ],
          },
        ],
      },
    ],
  },

  // ── WEEK 4 ──────────────────────────────────────────────────────────────────
  w4: {
    weekTitle: 'Week 4 — Wireshark & Network Forensics',
    weekGoal: 'Many interviews include a live PCAP exercise. Be able to open a file and narrate what you see.',
    sections: [
      {
        sectionTitle: 'Wireshark Setup & Filters',
        tasks: [
          {
            id: 'w4_install', title: 'Install Wireshark and capture live traffic',
            skills: ['traffic'],
            badge: 'Free', badgeClass: 'badge-free',
            subtasks: [
              { id: 'w4_inst_1', text: 'Install Wireshark (free at wireshark.org). Open it and select your active network interface.' },
              { id: 'w4_inst_2', text: 'Capture live traffic for 5 minutes. Browse a website, do a DNS lookup, ping something.' },
              { id: 'w4_inst_3', text: 'Identify at least 3 different protocols in the capture (DNS, HTTP, TCP, TLS).' },
              { id: 'w4_inst_4', text: 'Stop capture. Save as .pcap file. Reopen it — this is your first PCAP artifact.' },
            ],
          },
          {
            id: 'w4_filters', title: 'Capture filters vs display filters — write 5 of each from memory',
            skills: ['traffic'],
            badge: 'Must know', badgeClass: 'badge-must',
            subtasks: [
              { id: 'w4_flt_1', text: 'Capture filters (BPF, applied before capture): tcp, port 80, host 192.168.1.1, not broadcast' },
              { id: 'w4_flt_2', text: 'Display filters (applied after capture): http, dns, tls, icmp, arp' },
              { id: 'w4_flt_3', text: 'Display filter — specific IP: ip.src == 192.168.1.5 or ip.dst == 10.0.0.1' },
              { id: 'w4_flt_4', text: 'Display filter — TCP flags: tcp.flags.syn == 1, tcp.flags.reset == 1' },
              { id: 'w4_flt_5', text: 'Display filter — DNS content: dns.qry.name contains "evil" or dns.qry.name matches ".*\\.ru"' },
              { id: 'w4_flt_6', text: 'Practice: write 5 capture and 5 display filters from memory without looking them up.' },
            ],
          },
          {
            id: 'w4_stream', title: 'Follow TCP stream to reconstruct full sessions',
            skills: ['traffic', 'forensics'],
            badge: 'Must know', badgeClass: 'badge-must',
            subtasks: [
              { id: 'w4_str_1', text: 'In any HTTP pcap: right-click a TCP packet → Analyze → Follow → TCP Stream.' },
              { id: 'w4_str_2', text: 'Reconstruct a full HTTP request + response in plaintext. Identify the URL, headers, and body.' },
              { id: 'w4_str_3', text: 'Try to find credentials transmitted in cleartext HTTP (not HTTPS) traffic.' },
              { id: 'w4_str_4', text: 'Use Statistics → Conversations to see which IP pairs had the most traffic.' },
            ],
          },
        ],
      },
      {
        sectionTitle: 'PCAP Analysis — Attack Patterns',
        tasks: [
          {
            id: 'w4_malware_pcap', title: 'Analyse 2 real malware PCAPs from malware-traffic-analysis.net',
            skills: ['traffic', 'malware', 'forensics'],
            badge: 'Free', badgeClass: 'badge-free',
            link: 'https://malware-traffic-analysis.net', linkText: 'malware-traffic-analysis.net',
            subtasks: [
              { id: 'w4_mpcap_1', text: 'Download 2 free PCAP samples from malware-traffic-analysis.net.' },
              { id: 'w4_mpcap_2', text: 'PCAP 1: identify all protocols present, list all external IPs seen.' },
              { id: 'w4_mpcap_3', text: 'PCAP 1: identify what the attack is doing (C2 beacon? data exfil? lateral movement?).' },
              { id: 'w4_mpcap_4', text: 'PCAP 2: same analysis. Write a 5-sentence incident summary per PCAP.' },
              { id: 'w4_mpcap_5', text: 'Keep both PCAPs + summaries. Mention them in interviews as portfolio evidence.' },
            ],
          },
          {
            id: 'w4_attack_patterns', title: 'Identify port scan, brute force, C2 beacon in a PCAP',
            skills: ['traffic', 'threats', 'soc'],
            badge: 'Must know', badgeClass: 'badge-must',
            subtasks: [
              { id: 'w4_pat_1', text: 'Port scan signature: sequential SYN packets to many ports on one host, most return RST. Use filter: tcp.flags.syn==1 && tcp.flags.ack==0' },
              { id: 'w4_pat_2', text: 'Brute force signature: repeated POST requests to /login with 401 responses from same source IP.' },
              { id: 'w4_pat_3', text: 'C2 beacon signature: regular outbound connections (e.g. every 60s) from same host to same external IP. Use Statistics → IO Graphs.' },
              { id: 'w4_pat_4', text: 'Data exfiltration signature: large outbound transfer to unusual external IP, often after hours. Filter: frame.len > 1400 and check destination.' },
              { id: 'w4_pat_5', text: 'Practice: describe each pattern in interview language without looking at notes.' },
            ],
          },
        ],
      },
      {
        sectionTitle: 'IDS/IPS Concepts',
        tasks: [
          {
            id: 'w4_ids', title: 'IDS vs IPS — types, placement, detection modes',
            skills: ['soc', 'networking'],
            badge: 'Free', badgeClass: 'badge-free',
            subtasks: [
              { id: 'w4_ids_1', text: 'IDS = Intrusion Detection System: monitors and alerts only. No blocking. Out-of-band (tap/span port).' },
              { id: 'w4_ids_2', text: 'IPS = Intrusion Prevention System: monitors and blocks inline. In-band (traffic passes through). Adds latency.' },
              { id: 'w4_ids_3', text: 'NIDS: network-based (monitors traffic on a segment). HIDS: host-based (monitors a single machine).' },
              { id: 'w4_ids_4', text: 'Signature-based: matches known patterns (fast, misses zero-days). Anomaly-based: detects deviations from baseline (catches new threats, high false positives).' },
              { id: 'w4_ids_5', text: 'Snort rule structure concept: action protocol src_ip src_port → dst_ip dst_port (msg: "alert description"; content: "payload"; sid: 1000001;)' },
            ],
          },
        ],
      },
    ],
  },

  // ── WEEK 5 ──────────────────────────────────────────────────────────────────
  w5: {
    weekTitle: 'Week 5 — Splunk SIEM Hands-On',
    weekGoal: 'Splunk is the #1 most-requested tool in Indian SOC job postings. Get the official cert this week.',
    sections: [
      {
        sectionTitle: 'Splunk Official Training',
        tasks: [
          {
            id: 'w5_sf1', title: 'Splunk Fundamentals 1 — free official course (9 hours)',
            skills: ['splunk', 'siem'],
            badge: 'Must know', badgeClass: 'badge-must',
            link: 'https://www.splunk.com/en_us/training/free-courses/splunk-fundamentals-1.html', linkText: 'splunk.com',
            subtasks: [
              { id: 'w5_sf1_1', text: 'Create free account at training.splunk.com.' },
              { id: 'w5_sf1_2', text: 'Complete Module 1: Splunk interface — navigation, search bar, time pickers.' },
              { id: 'w5_sf1_3', text: 'Complete Module 2: Basic searching — syntax, search modes (fast/smart/verbose).' },
              { id: 'w5_sf1_4', text: 'Complete Module 3: Fields — automatic fields, field discovery, field extraction.' },
              { id: 'w5_sf1_5', text: 'Complete Module 4: Transforming commands — stats, top, rare, chart.' },
              { id: 'w5_sf1_6', text: 'Complete Module 5: Reports and dashboards — save searches, create reports.' },
              { id: 'w5_sf1_7', text: 'Complete Module 6: Lookups and alerts — scheduled alerts, email notifications.' },
              { id: 'w5_sf1_8', text: 'Complete the final exam. Download your digital badge. Add to LinkedIn and resume.' },
            ],
          },
        ],
      },
      {
        sectionTitle: 'SPL Query Mastery',
        tasks: [
          {
            id: 'w5_spl', title: 'SPL — master 8 core commands cold',
            skills: ['splunk'],
            badge: 'Must know', badgeClass: 'badge-must',
            subtasks: [
              { id: 'w5_spl_1', text: 'search: basic keyword and field=value syntax. index=*, sourcetype=WinEventLog, EventCode=4625.' },
              { id: 'w5_spl_2', text: 'stats: count, sum, avg, max, min. Example: | stats count by src_ip' },
              { id: 'w5_spl_3', text: 'eval: computed fields. Example: | eval threat_level=if(count>100,"HIGH","LOW")' },
              { id: 'w5_spl_4', text: 'rex: regex extraction. Example: | rex field=_raw "src=(?<src_ip>\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})"' },
              { id: 'w5_spl_5', text: 'table + sort + dedup: shape output. | table user, src_ip, count | sort -count | dedup user' },
              { id: 'w5_spl_6', text: 'timechart: time-series. | timechart span=1h count by EventCode' },
              { id: 'w5_spl_7', text: 'Write from scratch — live interview query: "index=* sourcetype=WinEventLog EventCode=4625 | stats count by src_ip | sort -count | head 10"' },
              { id: 'w5_spl_8', text: 'Write from scratch: find all accounts that had >5 failed logins followed by a successful login in the last hour.' },
            ],
          },
        ],
      },
      {
        sectionTitle: 'Splunk Investigation Practice',
        tasks: [
          {
            id: 'w5_bots', title: 'BOTS v1 dataset — real attack investigation',
            skills: ['splunk', 'portfolio', 'ir'],
            badge: 'Portfolio', badgeClass: 'badge-port',
            link: 'https://github.com/splunk/botsv1', linkText: 'github.com/splunk/botsv1',
            subtasks: [
              { id: 'w5_bots_1', text: 'Download BOTS v1 dataset from GitHub (github.com/splunk/botsv1).' },
              { id: 'w5_bots_2', text: 'Ingest dataset into your free Splunk instance (Splunk Free allows 500MB/day).' },
              { id: 'w5_bots_3', text: 'Investigate: what is the attacker\'s initial source IP address?' },
              { id: 'w5_bots_4', text: 'Investigate: what was the initial access vector (web exploit, phishing, brute force)?' },
              { id: 'w5_bots_5', text: 'Investigate: what malware was dropped? What is its MD5 hash?' },
              { id: 'w5_bots_6', text: 'Document the full attack timeline from initial access to actions on objective.' },
              { id: 'w5_bots_7', text: 'Add to resume: "Investigated BOTS v1 attack scenario in Splunk, documenting full kill chain from initial access to exfiltration."' },
            ],
          },
          {
            id: 'w5_dashboard', title: 'Build a failed-login detection dashboard',
            skills: ['splunk', 'portfolio', 'soc'],
            badge: 'Portfolio', badgeClass: 'badge-port',
            subtasks: [
              { id: 'w5_dash_1', text: 'Panel 1: timechart of failed login attempts (EventCode=4625) over last 24h.' },
              { id: 'w5_dash_2', text: 'Panel 2: top 10 source IPs by failed login count (stats count by src_ip, head 10).' },
              { id: 'w5_dash_3', text: 'Panel 3: top targeted user accounts (stats count by TargetUserName, head 10).' },
              { id: 'w5_dash_4', text: 'Set a scheduled alert: trigger if >50 failed logins from one IP in 10 minutes.' },
              { id: 'w5_dash_5', text: 'Screenshot dashboard. Add to portfolio. Resume line: "Built Splunk brute force detection dashboard with automated alerting."' },
            ],
          },
          {
            id: 'w5_siem_compare', title: 'Splunk vs QRadar vs Sentinel — articulate differences',
            skills: ['siem', 'interview'],
            badge: 'Must know', badgeClass: 'badge-must',
            subtasks: [
              { id: 'w5_cmp_1', text: 'Splunk: search-first, flexible data model, expensive licensing, on-prem and cloud, SPL query language.' },
              { id: 'w5_cmp_2', text: 'Microsoft Sentinel: cloud-native, Azure-integrated, PAYG pricing, KQL query language, good for hybrid environments.' },
              { id: 'w5_cmp_3', text: 'IBM QRadar: enterprise-grade correlation engine, on-prem heavy, event-based pricing, used in large MSSPs.' },
              { id: 'w5_cmp_4', text: 'When asked "have you used QRadar?" — answer: "Not hands-on, but I understand its correlation architecture differs from Splunk\'s search-first model. I\'m confident I could learn its interface quickly."' },
            ],
          },
        ],
      },
    ],
  },

  // ── WEEK 6 ──────────────────────────────────────────────────────────────────
  w6: {
    weekTitle: 'Week 6 — Live SOC Labs & IOC Enrichment',
    weekGoal: 'The closest thing to real SOC work you can get for free. Do every alert and write every report.',
    sections: [
      {
        sectionTitle: 'LetsDefend Alert Investigations',
        tasks: [
          {
            id: 'w6_ld', title: 'LetsDefend — complete 5 full alert investigations',
            skills: ['soc', 'ir', 'threatintel', 'portfolio'],
            badge: 'Must know', badgeClass: 'badge-must',
            link: 'https://letsdefend.io', linkText: 'letsdefend.io',
            subtasks: [
              { id: 'w6_ld_1', text: 'Create free account. Complete the SOC analyst intro module first.' },
              { id: 'w6_ld_2', text: 'Alert 1: read the alert, identify event type, check IOCs in VirusTotal. Classify true/false positive.' },
              { id: 'w6_ld_3', text: 'Alert 2: write triage notes. Document: what triggered it, what you checked, your verdict, reasoning.' },
              { id: 'w6_ld_4', text: 'Alert 3: make an escalation decision. Justify it in writing as if escalating to L2.' },
              { id: 'w6_ld_5', text: 'Alert 4: write formal investigation findings: timeline, IOCs found, affected system, recommended action.' },
              { id: 'w6_ld_6', text: 'Alert 5: complete full workflow — triage → investigate → contain → document → close ticket.' },
              { id: 'w6_ld_7', text: 'Note the 3 most common alert types you saw. These come up in interviews — "What types of alerts have you triaged?"' },
            ],
          },
        ],
      },
      {
        sectionTitle: 'IOC Enrichment Workflow',
        tasks: [
          {
            id: 'w6_ioc_wf', title: 'IOC enrichment — VirusTotal → OTX → URLScan → AbuseIPDB',
            skills: ['threatintel', 'soc'],
            badge: 'Must know', badgeClass: 'badge-must',
            subtasks: [
              { id: 'w6_ioc_1', text: 'Suspicious IP: look up in VirusTotal (virustotal.com). Note detection count and malicious vendor hits.' },
              { id: 'w6_ioc_2', text: 'Same IP in AbuseIPDB (abuseipdb.com). Note abuse confidence score and report history.' },
              { id: 'w6_ioc_3', text: 'Same IP in AlienVault OTX (otx.alienvault.com). Note associated threat actor or campaign.' },
              { id: 'w6_ioc_4', text: 'Suspicious domain: look up in URLScan.io (urlscan.io). Analyse screenshot, redirects, JS includes.' },
              { id: 'w6_ioc_5', text: 'Suspicious file hash (MD5/SHA256): search in VirusTotal. Check behaviour tab for dropped files and network connections.' },
              { id: 'w6_ioc_6', text: 'Write a standard IOC enrichment checklist — the 5 steps you\'d follow for any suspicious indicator. Memorise it.' },
            ],
          },
        ],
      },
      {
        sectionTitle: 'CyberDefenders Labs',
        tasks: [
          {
            id: 'w6_cd', title: 'CyberDefenders: PacketMaze network forensics lab',
            skills: ['traffic', 'forensics', 'portfolio'],
            badge: 'Portfolio', badgeClass: 'badge-port',
            link: 'https://cyberdefenders.org/blueteam-ctf-challenges/packetmaze/', linkText: 'cyberdefenders.org',
            subtasks: [
              { id: 'w6_cd_1', text: 'Create free account at cyberdefenders.org.' },
              { id: 'w6_cd_2', text: 'Open PacketMaze lab. Download the challenge files.' },
              { id: 'w6_cd_3', text: 'Answer all challenge questions using Wireshark.' },
              { id: 'w6_cd_4', text: 'Write a 1-page investigation report: timeline, IOCs, attack type, affected systems.' },
              { id: 'w6_cd_5', text: 'Keep report as portfolio piece. Resume/interview line: "Investigated multi-stage network attack in PacketMaze lab using Wireshark, documenting C2 traffic and exfiltration patterns."' },
            ],
          },
        ],
      },
      {
        sectionTitle: 'Formal Incident Report Writing',
        tasks: [
          {
            id: 'w6_report', title: 'Write one complete mock incident report',
            skills: ['ir', 'portfolio', 'soc'],
            badge: 'Portfolio', badgeClass: 'badge-port',
            subtasks: [
              { id: 'w6_rpt_1', text: 'Section 1 — Executive Summary: 2 sentences. What happened and what is the business impact.' },
              { id: 'w6_rpt_2', text: 'Section 2 — Timeline of Events: chronological attacker actions with timestamps. Use your LetsDefend or CyberDefenders data.' },
              { id: 'w6_rpt_3', text: 'Section 3 — Indicators of Compromise: table of IOCs (type | value | source | first seen).' },
              { id: 'w6_rpt_4', text: 'Section 4 — Affected Systems: list of impacted hosts with hostnames and IPs.' },
              { id: 'w6_rpt_5', text: 'Section 5 — Containment Actions Taken: what was done and when.' },
              { id: 'w6_rpt_6', text: 'Section 6 — Recommendations: 3 specific remediation steps with priority.' },
              { id: 'w6_rpt_7', text: 'Review: can a non-technical manager understand Sections 1 and 6? If not, rewrite.' },
            ],
          },
        ],
      },
    ],
  },

  // ── WEEK 7 ──────────────────────────────────────────────────────────────────
  w7: {
    weekTitle: 'Week 7 — Wazuh Homelab & EDR Concepts',
    weekGoal: 'The resume differentiator most freshers skip. "Deployed SIEM homelab" separates you from 90% of applicants.',
    sections: [
      {
        sectionTitle: 'Wazuh Homelab Deployment',
        tasks: [
          {
            id: 'w7_wazuh', title: 'Deploy Wazuh SIEM homelab — full working instance',
            skills: ['siem', 'portfolio', 'soc'],
            badge: 'Portfolio', badgeClass: 'badge-port',
            link: 'https://documentation.wazuh.com/current/quickstart.html', linkText: 'wazuh.com',
            subtasks: [
              { id: 'w7_waz_1', text: 'Install VirtualBox (free at virtualbox.org) if not already installed.' },
              { id: 'w7_waz_2', text: 'Download the Wazuh OVA from documentation.wazuh.com (all-in-one package).' },
              { id: 'w7_waz_3', text: 'Import OVA into VirtualBox. Start the Wazuh manager VM. Note the IP address.' },
              { id: 'w7_waz_4', text: 'Access Wazuh web interface via browser. Log in with default credentials.' },
              { id: 'w7_waz_5', text: 'Install Wazuh agent on your own Windows or Linux machine. Register it with the manager.' },
              { id: 'w7_waz_6', text: 'Verify logs are flowing into the dashboard. Confirm agent shows as "Active".' },
              { id: 'w7_waz_7', text: 'Screenshot the working dashboard with your agent reporting. This is your portfolio evidence.' },
              { id: 'w7_waz_8', text: 'Resume line: "Deployed Wazuh SIEM homelab with Windows/Linux agent log collection and real-time alerting."' },
            ],
          },
          {
            id: 'w7_wazuh_active', title: 'Wazuh — trigger and verify real alerts',
            skills: ['siem', 'portfolio', 'linux', 'windows'],
            badge: 'Portfolio', badgeClass: 'badge-port',
            subtasks: [
              { id: 'w7_wa_1', text: 'Trigger a brute force alert: enter wrong password 5 times on your monitored machine.' },
              { id: 'w7_wa_2', text: 'Verify the authentication failure alert appears in Wazuh dashboard. Note rule ID and description.' },
              { id: 'w7_wa_3', text: 'Create a new local user on your machine. Verify the account creation event appears in Wazuh.' },
              { id: 'w7_wa_4', text: 'Create one custom alert rule in ossec.conf (e.g. alert when a specific file in /tmp is modified).' },
              { id: 'w7_wa_5', text: 'Screenshot the custom alert firing. Add to portfolio with explanation of what the rule detects.' },
            ],
          },
        ],
      },
      {
        sectionTitle: 'EDR & Endpoint Security',
        tasks: [
          {
            id: 'w7_edr', title: 'AV vs EDR vs XDR — conceptual depth',
            skills: ['soc', 'malware', 'vuln'],
            badge: 'Must know', badgeClass: 'badge-must',
            subtasks: [
              { id: 'w7_edr_1', text: 'Traditional AV: signature-based, scans files, misses zero-days and fileless malware.' },
              { id: 'w7_edr_2', text: 'EDR: behavioural telemetry, process trees, memory analysis, threat hunting capabilities. Detects fileless attacks.' },
              { id: 'w7_edr_3', text: 'XDR: extends EDR with network + cloud + email telemetry. Cross-domain correlation.' },
              { id: 'w7_edr_4', text: 'Commercial products: CrowdStrike Falcon (EDR/XDR), SentinelOne (EDR/XDR), Microsoft Defender for Endpoint (integrated with Sentinel).' },
              { id: 'w7_edr_5', text: 'Process tree understanding: why cmd.exe spawned by winword.exe is malicious. Practice explaining this.' },
            ],
          },
        ],
      },
      {
        sectionTitle: 'CVSS, Vuln Management & Network Architecture',
        tasks: [
          {
            id: 'w7_cvss', title: 'CVSS v3 scoring — understand all components',
            skills: ['vuln', 'interview'],
            badge: 'Must know', badgeClass: 'badge-must',
            subtasks: [
              { id: 'w7_cvss_1', text: 'Base metrics — Attack Vector: Network(N), Adjacent(A), Local(L), Physical(P).' },
              { id: 'w7_cvss_2', text: 'Base metrics — Attack Complexity: Low(L) or High(H). Privileges Required: None/Low/High. User Interaction: None/Required.' },
              { id: 'w7_cvss_3', text: 'Impact metrics: Confidentiality, Integrity, Availability — each rated None/Low/High.' },
              { id: 'w7_cvss_4', text: 'Score ranges: Critical 9.0–10.0, High 7.0–8.9, Medium 4.0–6.9, Low 0.1–3.9.' },
              { id: 'w7_cvss_5', text: 'Calculate scores for 2 real CVEs at nvd.nist.gov using the CVSS calculator.' },
              { id: 'w7_cvss_6', text: 'Know CVE vs NVD vs CVSS: CVE = identifier (MITRE), NVD = enriched database (NIST), CVSS = scoring system.' },
            ],
          },
          {
            id: 'w7_firewall', title: 'Firewall types + DMZ architecture',
            skills: ['networking', 'soc'],
            badge: 'Must know', badgeClass: 'badge-must',
            subtasks: [
              { id: 'w7_fw_1', text: 'Packet filter: stateless, Layer 3/4 rules only. Fast but dumb — no session awareness.' },
              { id: 'w7_fw_2', text: 'Stateful: tracks connection state table. Knows if a packet is part of an established connection.' },
              { id: 'w7_fw_3', text: 'NGFW: application-layer inspection, SSL inspection, IPS integration, URL/category filtering.' },
              { id: 'w7_fw_4', text: 'WAF: Web Application Firewall — Layer 7, protects web apps from SQLi, XSS, CSRF at HTTP level.' },
              { id: 'w7_fw_5', text: 'DMZ design: web server in DMZ, database in internal LAN, no direct Internet→internal path. Explain why.' },
            ],
          },
        ],
      },
    ],
  },

  // ── WEEK 8 ──────────────────────────────────────────────────────────────────
  w8: {
    weekTitle: 'Week 8 — Interview Prep & Aggressive Applying',
    weekGoal: 'Stop preparing. Start converting. 35+ applications this week minimum.',
    sections: [
      {
        sectionTitle: 'Technical Q&A Verbal Fluency',
        tasks: [
          {
            id: 'w8_qa', title: '5 core questions — answer out loud until fluent, < 90 seconds each',
            skills: ['interview'],
            badge: 'Must know', badgeClass: 'badge-must',
            subtasks: [
              { id: 'w8_qa_1', text: 'Q1: "Walk me through NIST Incident Response lifecycle." Answer: Preparation → Detection & Analysis → Containment/Eradication/Recovery → Post-Incident. 2 actions per phase.' },
              { id: 'w8_qa_2', text: 'Q2: "You see 1000 failed SSH logins in 10 minutes. What do you do?" Answer: Identify IP, check auth logs, verify no successful login after, block IP, document, escalate if needed.' },
              { id: 'w8_qa_3', text: 'Q3: "What is MITRE ATT&CK and how does it differ from the Cyber Kill Chain?" Answer: ATT&CK = TTP library (post-compromise, granular). Kill Chain = linear 7-stage model (linear, high-level, good for detection gates).' },
              { id: 'w8_qa_4', text: 'Q4: "Explain IDS vs IPS." Answer: IDS detects + alerts (out-of-band). IPS detects + blocks (inline). NIDS vs HIDS placement.' },
              { id: 'w8_qa_5', text: 'Q5: "What does a SOC L1 analyst do on a typical day?" Answer: alert triage in SIEM, IOC enrichment (VirusTotal, OTX), classify true/false positives, document findings, escalate to L2.' },
              { id: 'w8_qa_6', text: 'Record yourself on phone answering all 5. Watch it back. Every filler word ("uhh", "like") is a failure point. Fix them.' },
              { id: 'w8_qa_7', text: 'Repeat until every answer is under 90 seconds, confident, and sounds natural.' },
            ],
          },
        ],
      },
      {
        sectionTitle: 'Scenario-Based Q&A',
        tasks: [
          {
            id: 'w8_scenarios', title: 'Incident scenario responses — structure: Identify → Investigate → Contain → Document',
            skills: ['interview', 'ir', 'soc'],
            badge: 'Must know', badgeClass: 'badge-must',
            subtasks: [
              { id: 'w8_sc_1', text: 'Scenario: "Phishing email reported by a user." Answer: quarantine email, check headers (From/Reply-To/X-Originating-IP), extract URLs/attachments, check IOCs in VirusTotal, check if any user clicked (proxy logs), check if payload ran (EDR), escalate.' },
              { id: 'w8_sc_2', text: 'Scenario: "SIEM fires brute force alert at 3am." Answer: check source IP reputation, check if any successful login followed the failures (4624 after 4625s), isolate account if yes, block IP in firewall, document, escalate.' },
              { id: 'w8_sc_3', text: 'Scenario: "Host beaconing to unknown external IP every 60 seconds." Answer: isolate host, check process responsible for connection (netstat/EDR), hash the process binary on VirusTotal, check for persistence (scheduled tasks, registry), escalate to L2.' },
              { id: 'w8_sc_4', text: 'Scenario: "Large data transfer to Eastern Europe IP, 2am." Answer: check if IP is known (VT/OTX), identify source user and process, check what data was transferred (DLP logs), determine if authorised, if not — contain and escalate.' },
              { id: 'w8_sc_5', text: 'Practice: answer each scenario out loud. Time yourself. Must be structured, confident, under 2 minutes.' },
            ],
          },
        ],
      },
      {
        sectionTitle: 'Resume Rewrite',
        tasks: [
          {
            id: 'w8_resume', title: 'Rewrite all projects with security-first framing',
            skills: ['interview', 'portfolio'],
            badge: 'Must know', badgeClass: 'badge-must',
            subtasks: [
              { id: 'w8_res_1', text: 'DualAuth rewrite: "Demonstrated 5 SQL injection attack chains (auth bypass, session hijacking, UNION extraction) scored with CVSS v3. Built parameterised query remediation guide."' },
              { id: 'w8_res_2', text: 'EnChat rewrite: "Implemented AES-256 + Diffie-Hellman key exchange to prevent MITM attacks. Verified forward secrecy under simulated adversarial conditions."' },
              { id: 'w8_res_3', text: 'Netra rewrite: "Multi-threaded port scanner identifying service misconfigurations across 65,535 ports — 3x speed vs single-threaded baseline. Used in 5 internal network assessments."' },
              { id: 'w8_res_4', text: 'Add new line: "Deployed Wazuh SIEM homelab with Windows/Linux log collection, brute force detection rule, and custom alerting."' },
              { id: 'w8_res_5', text: 'Add new line: "Investigated BOTS v1 attack dataset in Splunk — documented full kill chain from web exploit to data exfiltration."' },
              { id: 'w8_res_6', text: 'Add new line: "Completed Splunk Fundamentals 1 (official). Handled 5+ SOC alert scenarios on LetsDefend platform."' },
              { id: 'w8_res_7', text: 'Rule check: every bullet must have at least one number or specific outcome. No vague bullets.' },
              { id: 'w8_res_8', text: 'Format check: 1 page only. Remove anything that does not support the SOC analyst narrative.' },
            ],
          },
        ],
      },
      {
        sectionTitle: 'Applications & LinkedIn',
        tasks: [
          {
            id: 'w8_gap', title: 'Prepare and rehearse the gap explanation',
            skills: ['interview'],
            badge: 'Must know', badgeClass: 'badge-must',
            subtasks: [
              { id: 'w8_gap_1', text: 'Write your statement: "Between 2022–2024 I managed a serious family medical situation that ended with my father\'s passing. I\'m back with full focus, as reflected in the Wazuh homelab, Splunk certification, and BOTS investigation I completed in the last 8 weeks."' },
              { id: 'w8_gap_2', text: 'Practice saying it out loud 10 times until it comes out without hesitation or discomfort.' },
              { id: 'w8_gap_3', text: 'Do NOT lead with it. Only use it when directly asked about the gap. Redirect immediately to recent work.' },
              { id: 'w8_gap_4', text: 'Prepare 2 follow-up sentences that pivot to your strongest recent activity after the gap statement.' },
            ],
          },
          {
            id: 'w8_apply', title: 'Apply to 35 roles this week — minimum',
            skills: ['interview'],
            badge: 'Must know', badgeClass: 'badge-must',
            subtasks: [
              { id: 'w8_app_1', text: 'Update LinkedIn headline: "SOC Analyst | Splunk | Wazuh SIEM | TryHackMe Top 2% | Google Cybersecurity Certificate". Turn on Open to Work.' },
              { id: 'w8_app_2', text: 'Direct careers pages (5 applications): Wipro Cybersecurity, TCS Cybersec, HCL Cybersecurity, Accenture Security India, Infosys Cyber.' },
              { id: 'w8_app_3', text: 'MSSP applications (5): Paladion/Atos, Sequretek, NetEnrich, Aujas, SAFE Security/Lucideus.' },
              { id: 'w8_app_4', text: 'Naukri (10 applications): search "SOC analyst fresher" + "security analyst 0-1 years".' },
              { id: 'w8_app_5', text: 'LinkedIn Jobs (10 applications): filter Security Operations + India + 0–2 years experience.' },
              { id: 'w8_app_6', text: 'Internshala (5 applications): search security analyst internship + full-time.' },
              { id: 'w8_app_7', text: 'LinkedIn DMs (5 contacts): message SOC managers/analysts with personalised note. Not asking for job — asking for advice.' },
              { id: 'w8_app_8', text: 'Track everything: company, role, date applied, status, follow-up date. Spreadsheet or Notion.' },
            ],
          },
          {
            id: 'w8_fiverr', title: 'Fiverr setup — income while job hunting',
            skills: ['portfolio'],
            badge: 'Free', badgeClass: 'badge-free',
            subtasks: [
              { id: 'w8_fvr_1', text: 'Create Fiverr account. Upload professional photo. Write bio mentioning Python + security background.' },
              { id: 'w8_fvr_2', text: 'Gig 1: "Python log parsing and analysis scripts for security teams".' },
              { id: 'w8_fvr_3', text: 'Gig 2: "Security documentation writing — pentest reports and incident reports".' },
              { id: 'w8_fvr_4', text: 'Price at ₹500–1000 for first 5 orders to build reviews. Raise price after 5 reviews.' },
              { id: 'w8_fvr_5', text: 'Share gig links in cybersecurity Discord servers and r/cybersecurity to get first orders.' },
            ],
          },
        ],
      },
    ],
  },

  // ── PHASE A — Security+ ──────────────────────────────────────────────────────
  pa: {
    weekTitle: 'Phase A — Security+ SY0-701',
    weekGoal: 'Only start this after you have a stable income. Do not spend ₹30K on the exam until you are consistently at 80%+ on practice tests.',
    sections: [
      {
        sectionTitle: 'Domain 1 — General Security Concepts',
        tasks: [
          {
            id: 'pa_d1_crypto', title: 'Cryptography, PKI and Zero Trust',
            skills: ['threats', 'interview'],
            badge: 'Free', badgeClass: 'badge-free',
            subtasks: [
              { id: 'pa_d1_1', text: 'Symmetric: AES-128/256 (fast, same key encrypt/decrypt). Asymmetric: RSA/ECC (key pair, slower, used for key exchange).' },
              { id: 'pa_d1_2', text: 'PKI: CA signs certificate → sub-CA → end-entity cert. Chain of trust. CRL and OCSP for revocation.' },
              { id: 'pa_d1_3', text: 'Hashing: SHA-256, SHA-3 (one-way, fixed output). Not encryption. Used for integrity verification.' },
              { id: 'pa_d1_4', text: 'Zero Trust model: "never trust, always verify". Verify explicitly. Use least privilege. Assume breach.' },
              { id: 'pa_d1_5', text: 'MFA factors — know all 5: knowledge, possession, inherence, location, behaviour.' },
            ],
          },
          {
            id: 'pa_d1_controls', title: 'Security controls — all types and categories',
            skills: ['threats', 'soc', 'interview'],
            badge: 'Free', badgeClass: 'badge-free',
            subtasks: [
              { id: 'pa_ctrl_1', text: 'Control types: preventive (stops attack), detective (identifies attack), corrective (fixes after), deterrent (discourages), compensating (alternative when primary not possible), directive (guides behaviour).' },
              { id: 'pa_ctrl_2', text: 'Control categories: technical (firewall, EDR), managerial (policies, risk assessments), operational/physical (guards, locks, cameras).' },
              { id: 'pa_ctrl_3', text: 'Defence-in-depth: multiple overlapping controls so failure of one does not compromise everything.' },
              { id: 'pa_ctrl_4', text: 'For each control type: give one real-world example. Exam tests application, not just definitions.' },
            ],
          },
        ],
      },
      {
        sectionTitle: 'Domain 2 — Threats, Vulnerabilities & Mitigations',
        tasks: [
          {
            id: 'pa_d2_se', title: 'Social engineering taxonomy',
            skills: ['threats', 'malware'],
            badge: 'Free', badgeClass: 'badge-free',
            subtasks: [
              { id: 'pa_se_1', text: 'Phishing (mass), spear phishing (targeted), whaling (C-suite), vishing (voice), smishing (SMS), pretexting (fabricated scenario), baiting (USB drop), tailgating (physical).' },
              { id: 'pa_se_2', text: 'Business Email Compromise (BEC): attacker impersonates CFO to transfer funds. Hard to detect technically.' },
              { id: 'pa_se_3', text: 'Key principles attackers exploit: authority, urgency, scarcity, social proof, familiarity, intimidation.' },
            ],
          },
          {
            id: 'pa_d2_attacks', title: 'Attack types, OWASP Top 10 & CVE/CVSS',
            skills: ['threats', 'webappsec', 'malware', 'vuln'],
            badge: 'Free', badgeClass: 'badge-free',
            subtasks: [
              { id: 'pa_atk_1', text: 'OWASP Top 10 2021: Broken Access Control, Cryptographic Failures, Injection, Insecure Design, Security Misconfiguration, Vulnerable & Outdated Components, Identification & Auth Failures, Software & Data Integrity Failures, Security Logging Failures, SSRF.' },
              { id: 'pa_atk_2', text: 'Network attacks: DoS (single source), DDoS (distributed), on-path/MITM, replay, MAC flooding, ARP spoofing.' },
              { id: 'pa_atk_3', text: 'APT: Advanced Persistent Threat — nation-state, long dwell time, stealthy. SolarWinds supply chain attack as case study.' },
              { id: 'pa_atk_4', text: 'CVSS v3 scoring components from memory — all 8 base metrics, their options, and what score ranges mean.' },
            ],
          },
        ],
      },
      {
        sectionTitle: 'Domain 3 — Security Architecture',
        tasks: [
          {
            id: 'pa_d3_net', title: 'Network architecture — segmentation, VPN, cloud',
            skills: ['networking', 'soc', 'cloud'],
            badge: 'Free', badgeClass: 'badge-free',
            subtasks: [
              { id: 'pa_net_1', text: 'Network segmentation: VLANs (Layer 2), DMZ (public-facing servers), micro-segmentation (zero-trust workloads).' },
              { id: 'pa_net_2', text: 'Firewall types: packet filter, stateful, NGFW — from memory.' },
              { id: 'pa_net_3', text: 'VPN: IPSec (transport mode = host-to-host, tunnel mode = network-to-network). IKE Phase 1 (SA), Phase 2 (IPSec SA). SSL/TLS VPN = clientless via browser.' },
              { id: 'pa_net_4', text: 'Cloud shared responsibility model: provider secures infrastructure, customer secures data/config/access.' },
            ],
          },
          {
            id: 'pa_d3_iam', title: 'Identity & Access Management — all models',
            skills: ['soc', 'interview'],
            badge: 'Free', badgeClass: 'badge-free',
            subtasks: [
              { id: 'pa_iam_1', text: 'RBAC: Role-Based — permissions assigned to roles, roles assigned to users. Most common in enterprise.' },
              { id: 'pa_iam_2', text: 'ABAC: Attribute-Based — permissions based on user attributes (department, clearance, location). More granular than RBAC.' },
              { id: 'pa_iam_3', text: 'MAC: Mandatory Access Control — OS enforces based on labels (Top Secret, Confidential). Government/military.' },
              { id: 'pa_iam_4', text: 'DAC: Discretionary Access Control — resource owner sets permissions. Default for most file systems.' },
              { id: 'pa_iam_5', text: 'Least privilege: users get only what they need to do their job, nothing more.' },
              { id: 'pa_iam_6', text: 'SSO: SAML 2.0 (enterprise federation), OAuth 2.0 (authorisation), OIDC (authentication on top of OAuth).' },
            ],
          },
        ],
      },
      {
        sectionTitle: 'Domain 4 — Security Operations',
        tasks: [
          {
            id: 'pa_d4_ops', title: 'IR, SIEM, forensics and threat hunting for Sec+',
            skills: ['ir', 'siem', 'forensics', 'interview'],
            badge: 'Free', badgeClass: 'badge-free',
            subtasks: [
              { id: 'pa_ops_1', text: 'NIST 800-61 IR lifecycle — all phases with specific actions. From memory.' },
              { id: 'pa_ops_2', text: 'Digital forensics order of volatility: RAM → network connections → running processes → disk. Collect most volatile first.' },
              { id: 'pa_ops_3', text: 'Chain of custody: document who handled evidence, when, and why. Prevents legal challenges.' },
              { id: 'pa_ops_4', text: 'Threat hunting vs IR: hunting is proactive (assume breach, look for hidden threats). IR is reactive (respond to known alert).' },
              { id: 'pa_ops_5', text: 'Vulnerability management lifecycle: discover → assess → prioritise (by CVSS + asset criticality) → remediate → verify → report.' },
            ],
          },
        ],
      },
      {
        sectionTitle: 'Domain 5 — Security Program Management',
        tasks: [
          {
            id: 'pa_d5_risk', title: 'Risk management and compliance frameworks',
            skills: ['interview'],
            badge: 'Free', badgeClass: 'badge-free',
            subtasks: [
              { id: 'pa_risk_1', text: 'Risk = Threat × Vulnerability × Impact. Risk responses: accept, avoid, transfer (insurance), mitigate.' },
              { id: 'pa_risk_2', text: 'NIST CSF 5 functions: Identify, Protect, Detect, Respond, Recover.' },
              { id: 'pa_risk_3', text: 'ISO 27001: information security management system (ISMS) standard. Not prescriptive — risk-based approach.' },
              { id: 'pa_risk_4', text: 'PCI-DSS: payment card data. SOC 2: service organisation controls (trust service criteria). HIPAA: US healthcare data.' },
              { id: 'pa_risk_5', text: 'RTO (Recovery Time Objective): max acceptable downtime. RPO (Recovery Point Objective): max acceptable data loss. Both used in DR planning.' },
            ],
          },
          {
            id: 'pa_practice', title: 'Practice exams — 80%+ before booking real exam',
            skills: ['interview'],
            badge: 'Must know', badgeClass: 'badge-must',
            link: 'https://www.professormesser.com/sy0-701-practice-exams/', linkText: 'professormesser.com',
            subtasks: [
              { id: 'pa_prac_1', text: 'Practice exam 1: target 70%+. Review every wrong answer — understand WHY the correct answer is correct.' },
              { id: 'pa_prac_2', text: 'Practice exam 2: target 75%+. Focus revision on your lowest-scoring domain.' },
              { id: 'pa_prac_3', text: 'Practice exam 3: target 80%+. Do not book real exam until 3 consecutive exams at 80%+.' },
              { id: 'pa_prac_4', text: 'The real exam costs ~₹30,000. Money is tight. Do not book until you are consistently passing.' },
            ],
          },
        ],
      },
    ],
  },

  // ── PHASE B — SOC Advanced ───────────────────────────────────────────────────
  pb: {
    weekTitle: 'Phase B — SOC Analyst Core Advanced',
    weekGoal: 'L1 → L2 transition skills. Active Directory, Windows forensics, memory analysis.',
    sections: [
      {
        sectionTitle: 'Blue Team Pathway',
        tasks: [
          {
            id: 'pb_sbt', title: 'Security Blue Team Junior Analyst Pathway (free)',
            skills: ['soc', 'forensics', 'threatintel'],
            badge: 'Free', badgeClass: 'badge-free',
            link: 'https://www.securityblue.team/', linkText: 'securityblue.team',
            subtasks: [
              { id: 'pb_sbt_1', text: 'Complete OSINT module: passive recon techniques for threat intelligence.' },
              { id: 'pb_sbt_2', text: 'Complete Digital Forensics module: disk and memory artifact acquisition.' },
              { id: 'pb_sbt_3', text: 'Complete Network Analysis module: advanced Wireshark and traffic reconstruction.' },
              { id: 'pb_sbt_4', text: 'Complete Vulnerability Management module: scanning, scoring, prioritisation.' },
              { id: 'pb_sbt_5', text: 'Complete Threat Hunting module: hypothesis-driven hunting in SIEM.' },
            ],
          },
          {
            id: 'pb_mitre_deep', title: 'MITRE ATT&CK — complete cheat sheet for all 14 tactics',
            skills: ['threats', 'soc'],
            badge: 'Free', badgeClass: 'badge-free',
            subtasks: [
              { id: 'pb_mit_1', text: 'For each of the 14 tactics: list 3 techniques, the detection logic, relevant SIEM rule idea, and associated Windows Event ID.' },
              { id: 'pb_mit_2', text: 'Build this as a reference table (spreadsheet or Notion). This becomes your daily work reference.' },
              { id: 'pb_mit_3', text: 'Focus on high-frequency tactics: Execution, Persistence, Lateral Movement, Credential Access.' },
            ],
          },
        ],
      },
      {
        sectionTitle: 'Active Directory & Endpoint Forensics',
        tasks: [
          {
            id: 'pb_ad', title: 'Active Directory attacks — Kerberos, PtH, Kerberoasting',
            skills: ['windows', 'threats', 'forensics'],
            badge: 'Free', badgeClass: 'badge-free',
            subtasks: [
              { id: 'pb_ad_1', text: 'Kerberos flow: AS-REQ → AS-REP (TGT) → TGS-REQ → TGS-REP (service ticket) → resource access.' },
              { id: 'pb_ad_2', text: 'Pass-the-Hash: attacker reuses NTLM hash instead of plaintext password. Requires same hash on target.' },
              { id: 'pb_ad_3', text: 'Kerberoasting: request service ticket for SPN, crack offline. Detection: Event ID 4769 (TGS requested for weak SPN).' },
              { id: 'pb_ad_4', text: 'AS-REPRoasting: accounts with pre-auth disabled — get hash without credentials. Event ID 4768.' },
              { id: 'pb_ad_5', text: 'Golden Ticket: forge TGT using KRBTGT hash. Persists even after password resets. Detection: Event ID 4769 with unusual encryption type.' },
            ],
          },
          {
            id: 'pb_forensics', title: 'Windows forensics artifacts — Prefetch, Registry, LNK, $MFT',
            skills: ['forensics', 'windows'],
            badge: 'Free', badgeClass: 'badge-free',
            subtasks: [
              { id: 'pb_for_1', text: 'Prefetch files (C:\\Windows\\Prefetch): execution evidence, up to 128 entries, includes last run time and run count.' },
              { id: 'pb_for_2', text: 'Registry persistence locations: HKCU/HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run. Services under SYSTEM\\CurrentControlSet.' },
              { id: 'pb_for_3', text: 'LNK files (C:\\Users\\%user%\\AppData\\Roaming\\Microsoft\\Windows\\Recent): recently accessed files, includes original path.' },
              { id: 'pb_for_4', text: '$MFT: NTFS Master File Table — record of every file on the volume including deleted ones (until overwritten).' },
              { id: 'pb_for_5', text: 'CyberDefenders: complete one Windows endpoint forensics challenge using these artifacts.' },
            ],
          },
          {
            id: 'pb_memory', title: 'Memory forensics — Volatility 3 basics',
            skills: ['forensics'],
            badge: 'Free', badgeClass: 'badge-free',
            subtasks: [
              { id: 'pb_mem_1', text: 'Install Volatility 3 (free, github.com/volatilityfoundation/volatility3).' },
              { id: 'pb_mem_2', text: 'Run pslist plugin: list all running processes in a memory dump.' },
              { id: 'pb_mem_3', text: 'Run netscan plugin: list network connections in the memory dump.' },
              { id: 'pb_mem_4', text: 'Run malfind plugin: identify injected code regions (signs of process injection).' },
              { id: 'pb_mem_5', text: 'TryHackMe: complete "Volatility" room (free). Document commands used.' },
            ],
          },
        ],
      },
    ],
  },

  // ── PHASE C — SIEM Advanced ──────────────────────────────────────────────────
  pc: {
    weekTitle: 'Phase C — SIEM & Tooling Advanced',
    weekGoal: 'Add ELK and Microsoft Sentinel to your toolset. Splunk alone is not enough for cloud-heavy environments.',
    sections: [
      {
        sectionTitle: 'ELK Stack',
        tasks: [
          {
            id: 'pc_elk', title: 'Deploy ELK Stack — Elasticsearch + Logstash + Kibana',
            skills: ['siem', 'portfolio'],
            badge: 'Free', badgeClass: 'badge-free',
            subtasks: [
              { id: 'pc_elk_1', text: 'Install Elasticsearch (search/store), Logstash (ingest/transform), Kibana (visualise) on local VM.' },
              { id: 'pc_elk_2', text: 'Ingest Linux syslog and Windows event logs into the stack.' },
              { id: 'pc_elk_3', text: 'Create a Kibana dashboard similar to your Splunk dashboard (failed logins over time, top source IPs).' },
              { id: 'pc_elk_4', text: 'Add to resume: "Deployed ELK stack for log aggregation and security dashboard creation."' },
            ],
          },
          {
            id: 'pc_bots_adv', title: 'Splunk BOTS v2 + v3 — advanced attack scenarios',
            skills: ['splunk', 'portfolio'],
            badge: 'Free', badgeClass: 'badge-free',
            subtasks: [
              { id: 'pc_bots_1', text: 'Download BOTS v2 dataset (more complex than v1 — ransomware scenario).' },
              { id: 'pc_bots_2', text: 'Investigate v2: identify initial access, lateral movement, and ransomware execution chain.' },
              { id: 'pc_bots_3', text: 'Download BOTS v3 dataset (APT and web attack scenarios).' },
              { id: 'pc_bots_4', text: 'Document methodology for all 3 BOTS datasets. Combined portfolio entry: "Investigated BOTS v1/v2/v3 — ransomware, APT, and web attack scenarios in Splunk."' },
            ],
          },
        ],
      },
      {
        sectionTitle: 'Microsoft Sentinel',
        tasks: [
          {
            id: 'pc_sentinel', title: 'Microsoft Sentinel — 30-day free trial on Azure',
            skills: ['siem', 'cloud', 'portfolio'],
            badge: 'Free', badgeClass: 'badge-free',
            subtasks: [
              { id: 'pc_sent_1', text: 'Create Azure free account (azure.microsoft.com). Free tier includes $200 credit.' },
              { id: 'pc_sent_2', text: 'Deploy Microsoft Sentinel workspace in Azure portal.' },
              { id: 'pc_sent_3', text: 'Connect data connectors: Windows Security Events and Syslog.' },
              { id: 'pc_sent_4', text: 'Create one analytics rule (e.g. alert on 5+ failed logons in 5 minutes).' },
              { id: 'pc_sent_5', text: 'Learn KQL basics: SecurityEvent | where EventID == 4625 | summarize count() by Account — note difference from SPL.' },
              { id: 'pc_sent_6', text: 'Add to resume: "Deployed Microsoft Sentinel SIEM on Azure with custom KQL analytics rules." This adds ₹1–2 LPA to cloud-focused offers.' },
            ],
          },
        ],
      },
      {
        sectionTitle: 'Network IDS',
        tasks: [
          {
            id: 'pc_suricata', title: 'Suricata — deploy as network IDS on homelab',
            skills: ['soc', 'traffic', 'portfolio'],
            badge: 'Portfolio', badgeClass: 'badge-port',
            subtasks: [
              { id: 'pc_sur_1', text: 'Install Suricata on your homelab Linux VM.' },
              { id: 'pc_sur_2', text: 'Enable Emerging Threats Open ruleset (free, 30,000+ rules).' },
              { id: 'pc_sur_3', text: 'Run an Nmap scan against the Suricata-monitored interface. Verify port scan alerts fire.' },
              { id: 'pc_sur_4', text: 'Forward Suricata alerts to your Wazuh or ELK SIEM. View in dashboard.' },
            ],
          },
        ],
      },
    ],
  },

  // ── PHASE D — Web Hacking ────────────────────────────────────────────────────
  pd: {
    weekTitle: 'Phase D — Web Hacking (PortSwigger Labs)',
    weekGoal: 'You built DualAuth. Now understand the attacks at real depth — not just mitigation.',
    sections: [
      {
        sectionTitle: 'Injection & Client-Side Attacks',
        tasks: [
          {
            id: 'pd_sqli', title: 'SQL injection — all apprentice + practitioner labs',
            skills: ['webappsec', 'portfolio'],
            badge: 'Free', badgeClass: 'badge-free',
            link: 'https://portswigger.net/web-security/sql-injection', linkText: 'portswigger.net',
            subtasks: [
              { id: 'pd_sqli_1', text: 'Complete all Apprentice-level SQLi labs: string-based WHERE clause injection.' },
              { id: 'pd_sqli_2', text: 'Complete: UNION-based data extraction (find columns, extract from other tables).' },
              { id: 'pd_sqli_3', text: 'Complete: blind SQLi — boolean-based and time-based.' },
              { id: 'pd_sqli_4', text: 'Complete: reading from information_schema (enumerate tables and columns).' },
              { id: 'pd_sqli_5', text: 'Write a 1-page summary: types of SQLi + detection method + remediation. Portfolio piece.' },
            ],
          },
          {
            id: 'pd_xss', title: 'XSS — reflected, stored, DOM-based + CSP bypass',
            skills: ['webappsec', 'portfolio'],
            badge: 'Free', badgeClass: 'badge-free',
            subtasks: [
              { id: 'pd_xss_1', text: 'Reflected XSS: payload in URL parameter, reflected back unsanitised. Complete all PortSwigger Apprentice labs.' },
              { id: 'pd_xss_2', text: 'Stored XSS: payload persists in database, fires for every visitor. Complete PortSwigger labs.' },
              { id: 'pd_xss_3', text: 'DOM XSS: sink vs source concept. document.write, innerHTML as sinks. Complete labs.' },
              { id: 'pd_xss_4', text: 'Build a stored XSS payload that exfiltrates document.cookie to a requestbin.io endpoint.' },
              { id: 'pd_xss_5', text: 'CSP bypass: understand script-src nonces, unsafe-inline, and gadget-based bypasses.' },
            ],
          },
        ],
      },
      {
        sectionTitle: 'Auth, Access Control & Server-Side',
        tasks: [
          {
            id: 'pd_auth', title: 'CSRF, IDOR, authentication flaws and JWT attacks',
            skills: ['webappsec', 'portfolio'],
            badge: 'Free', badgeClass: 'badge-free',
            subtasks: [
              { id: 'pd_auth_1', text: 'CSRF: create a PoC HTML page that auto-submits a state-changing form. Verify cookie-based session is exploitable.' },
              { id: 'pd_auth_2', text: 'IDOR: horizontal (access another user\'s data), vertical (access higher-privilege functions). Complete labs.' },
              { id: 'pd_auth_3', text: 'Password reset flaws: token predictability, host header injection in reset emails, response manipulation.' },
              { id: 'pd_auth_4', text: 'JWT attacks: algorithm confusion (RS256 → HS256), none algorithm, weak secret brute-force. Complete PortSwigger JWT labs.' },
            ],
          },
          {
            id: 'pd_server', title: 'SSRF, XXE, file upload and path traversal',
            skills: ['webappsec'],
            badge: 'Free', badgeClass: 'badge-free',
            subtasks: [
              { id: 'pd_srv_1', text: 'SSRF: access AWS metadata at http://169.254.169.254/latest/meta-data/ via server-side request. Complete labs.' },
              { id: 'pd_srv_2', text: 'XXE: XML external entity to read /etc/passwd. Blind XXE via out-of-band interaction.' },
              { id: 'pd_srv_3', text: 'File upload: bypass extension/MIME type checks. Upload PHP webshell. RCE via polyglot file.' },
              { id: 'pd_srv_4', text: 'Path traversal: ../../../../etc/passwd. URL encoding bypass (..%2F). Complete all PortSwigger labs.' },
            ],
          },
        ],
      },
      {
        sectionTitle: 'Advanced Web Attacks',
        tasks: [
          {
            id: 'pd_advanced', title: 'Business logic, HTTP request smuggling, cache poisoning',
            skills: ['webappsec'],
            badge: 'Free', badgeClass: 'badge-free',
            subtasks: [
              { id: 'pd_adv_1', text: 'Business logic: race conditions, negative price exploits, workflow bypass. Think like a tester not a developer.' },
              { id: 'pd_adv_2', text: 'HTTP request smuggling: CL.TE and TE.CL desync. Understand why front-end/back-end parsing differences matter.' },
              { id: 'pd_adv_3', text: 'Web cache poisoning: understand cache key vs unkeyed inputs. X-Forwarded-Host poisoning.' },
              { id: 'pd_adv_4', text: 'Complete before applying for any AppSec role. This level separates intermediate from advanced candidates.' },
            ],
          },
        ],
      },
    ],
  },

  // ── PHASE E — Bug Bounty ─────────────────────────────────────────────────────
  pe: {
    weekTitle: 'Phase E — Bug Bounty Entry',
    weekGoal: 'Supplementary income while job hunting. Do not quit applications to do this full time.',
    sections: [
      {
        sectionTitle: 'Methodology & Recon',
        tasks: [
          {
            id: 'pe_h1_read', title: 'Read 50 disclosed HackerOne reports in your target scope',
            skills: ['bugbounty', 'webappsec'],
            badge: 'Free', badgeClass: 'badge-free',
            link: 'https://hackerone.com/hacktivity', linkText: 'hackerone.com',
            subtasks: [
              { id: 'pe_h1_1', text: 'Go to hackerone.com/hacktivity. Filter by vulnerability type (start with XSS, IDOR, SSRF).' },
              { id: 'pe_h1_2', text: 'For each report: how it was found, what the impact statement said, why it was accepted, what bounty was paid.' },
              { id: 'pe_h1_3', text: 'Read 20 reports for XSS. Read 20 for IDOR. Read 10 for SSRF.' },
              { id: 'pe_h1_4', text: 'Write your own methodology checklist based on what you learned from reports — this is more valuable than any course.' },
            ],
          },
          {
            id: 'pe_recon', title: 'Build recon pipeline: subfinder + httpx + waybackurls + ffuf',
            skills: ['bugbounty', 'portfolio'],
            badge: 'Portfolio', badgeClass: 'badge-port',
            subtasks: [
              { id: 'pe_rec_1', text: 'Install: subfinder (subdomain enum), dnsx (DNS resolution), httpx (HTTP probing), waybackurls (historical URLs), ffuf (fuzzing).' },
              { id: 'pe_rec_2', text: 'Chain them: subfinder | dnsx | httpx → feed URLs into waybackurls | filter interesting extensions.' },
              { id: 'pe_rec_3', text: 'Write as a reusable bash script: input=domain, output=live subdomains with status codes + interesting endpoints.' },
              { id: 'pe_rec_4', text: 'This is both your working tool and a portfolio piece. Add to GitHub with README.' },
            ],
          },
        ],
      },
      {
        sectionTitle: 'Scanning & First Submission',
        tasks: [
          {
            id: 'pe_nuclei', title: 'Nuclei — template-based scanning on in-scope targets only',
            skills: ['bugbounty', 'vuln'],
            badge: 'Free', badgeClass: 'badge-free',
            subtasks: [
              { id: 'pe_nuc_1', text: 'Install Nuclei. Update community templates: nuclei -update-templates.' },
              { id: 'pe_nuc_2', text: 'Only scan targets where you are explicitly in scope. Never scan out of scope — this is illegal.' },
              { id: 'pe_nuc_3', text: 'Run Nuclei against in-scope targets. Review every finding manually before reporting.' },
              { id: 'pe_nuc_4', text: 'Document: target URL, vulnerability type, impact, reproduction steps, CVSS score.' },
            ],
          },
          {
            id: 'pe_submit', title: 'Submit your first bug report — P4/P5 is fine',
            skills: ['bugbounty', 'portfolio'],
            badge: 'Must know', badgeClass: 'badge-must',
            subtasks: [
              { id: 'pe_sub_1', text: 'Choose a beginner-friendly program with a wide scope (e.g. HackerOne programs marked "Good for beginners").' },
              { id: 'pe_sub_2', text: 'Write a clear report: Summary, Steps to Reproduce (numbered), Impact, CVSS score, supporting screenshots.' },
              { id: 'pe_sub_3', text: 'Submit. A duplicate or informational response is still educational — you learn the process.' },
              { id: 'pe_sub_4', text: 'Your goal is NOT to get rich from bug bounty. It is to learn reporting, get feedback, and occasionally earn ₹5,000–15,000 on a P3/P4.' },
            ],
          },
        ],
      },
    ],
  },

  // ── PHASE F — Advanced ───────────────────────────────────────────────────────
  pf: {
    weekTitle: 'Phase F — Advanced Pentest & IoT / Electronics',
    weekGoal: 'Your Electronics degree is a genuine differentiator. IoT security has very few qualified freshers in India.',
    sections: [
      {
        sectionTitle: 'Offensive Foundations',
        tasks: [
          {
            id: 'pf_htb', title: 'HackTheBox Starting Point — Tier 0 + Tier 1',
            skills: ['webappsec', 'portfolio'],
            badge: 'Free', badgeClass: 'badge-free',
            link: 'https://app.hackthebox.com/starting-point', linkText: 'hackthebox.com',
            subtasks: [
              { id: 'pf_htb_1', text: 'Complete all Tier 0 machines: guided with full walkthrough. Build your methodology.' },
              { id: 'pf_htb_2', text: 'Complete all Tier 1 machines: less guidance. Document every step independently.' },
              { id: 'pf_htb_3', text: 'Write writeups for each machine: recon → enumeration → exploitation → post-exploitation → lessons learned.' },
              { id: 'pf_htb_4', text: 'Publish writeups on your Hashnode blog. Adds to portfolio and demonstrates real practical skill.' },
            ],
          },
          {
            id: 'pf_api', title: 'API security — OWASP API Top 10',
            skills: ['webappsec'],
            badge: 'Free', badgeClass: 'badge-free',
            link: 'https://www.apisecuniversity.com/', linkText: 'apisecuniversity.com',
            subtasks: [
              { id: 'pf_api_1', text: 'Complete free APIsec University course. Learn all OWASP API Top 10 2023.' },
              { id: 'pf_api_2', text: 'BOLA (Broken Object Level Authorisation): access other users\' objects by changing ID in API request.' },
              { id: 'pf_api_3', text: 'Broken Function Level Authorisation: access admin endpoints as non-admin user.' },
              { id: 'pf_api_4', text: 'Excessive Data Exposure: API returns more data than the app displays — check raw API responses.' },
              { id: 'pf_api_5', text: 'AppSec roles increasingly test API security. This completes your web security knowledge.' },
            ],
          },
        ],
      },
      {
        sectionTitle: 'Hardware & IoT Security',
        tasks: [
          {
            id: 'pf_iot', title: 'OWASP IoT Top 10 + firmware analysis with binwalk',
            skills: ['webappsec', 'portfolio'],
            badge: 'Free', badgeClass: 'badge-free',
            subtasks: [
              { id: 'pf_iot_1', text: 'Read OWASP IoT Top 10 2018. Note hardcoded credentials, insecure update mechanisms, poor physical security.' },
              { id: 'pf_iot_2', text: 'Install binwalk (firmware analysis tool). Extract filesystem from a publicly available router firmware image.' },
              { id: 'pf_iot_3', text: 'Use grep to search extracted firmware for: default passwords, hardcoded API keys, private keys, insecure protocols.' },
              { id: 'pf_iot_4', text: 'Your Electronics degree gives you genuine advantage here. You understand hardware that pure CS people do not. Market this explicitly.' },
              { id: 'pf_iot_5', text: 'IoT security has very few qualified candidates in India. Target job postings at companies doing embedded/product security.' },
            ],
          },
          {
            id: 'pf_oscp', title: 'OSCP prep — long-term goal, not now',
            skills: ['webappsec', 'portfolio'],
            badge: 'Free', badgeClass: 'badge-free',
            subtasks: [
              { id: 'pf_oscp_1', text: 'Start only after 12+ months of SOC experience and stable income.' },
              { id: 'pf_oscp_2', text: 'Complete 30 HackTheBox Medium+ machines before enrolling.' },
              { id: 'pf_oscp_3', text: 'The exam costs ~₹80,000. Target employer sponsorship — "I want to pursue OSCP. Will the company sponsor it after 12 months?" is a legitimate ask.' },
              { id: 'pf_oscp_4', text: 'OSCP with employer sponsorship is better than paying for it while broke. Wait.' },
            ],
          },
        ],
      },
    ],
  },

};