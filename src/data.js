export const PHASES = ['p0', 'p1', 'p2', 'p2b', 'p3', 'p4', 'p5'];

export const PHASE_META = [
  { id: 'p0', label: 'Prerequisites', short: 'Prereqs', color: '#888888', icon: '⚙️', sub: 'Weeks 1–6 · Linux · Networking · Python · Web basics' },
  { id: 'p1', label: 'Security+ SY0-701', short: 'Sec+', color: '#4e8ef7', icon: '🏆', sub: 'Weeks 7–18 · Professor Messer free videos · All 5 domains' },
  { id: 'p2', label: 'SOC Analyst Core', short: 'SOC', color: '#3ecf8e', icon: '🛡️', sub: 'Weeks 19–26 · Free resources only · No TryHackMe paths' },
  { id: 'p2b', label: 'SIEM & Tooling', short: 'SIEM', color: '#2dd4bf', icon: '📊', sub: 'Weeks 27–30 · Splunk free training · Homelab setup' },
  { id: 'p3', label: 'Web Hacking', short: 'WebHack', color: '#a78bfa', icon: '⚔️', sub: 'Weeks 31–46 · PortSwigger Academy (100% free) · Burp Suite' },
  { id: 'p4', label: 'Bug Bounty Entry', short: 'Bounty', color: '#f05252', icon: '💰', sub: 'Weeks 47–58 · HackerOne · Bugcrowd · Recon tooling' },
  { id: 'p5', label: 'Advanced / Pentest', short: 'Adv', color: '#f5a623', icon: '🔬', sub: 'Weeks 59+ · HackTheBox · OSCP prep · API security · IoT niche' }
];

export const ROADMAP_DATA = {
  p0: [
    {
      title: "Linux command line",
      topics: [
        { name: "OverTheWire: Bandit levels 0–10", desc: "SSH, ls, cat, file, find, du, strings, base64. Navigation fundamentals.", link: "https://overthewire.org/wargames/bandit/", linkText: "overthewire.org/wargames/bandit", badge: "Free", badgeClass: "badge-free" },
        { name: "OverTheWire: Bandit levels 11–25", desc: "Pipes, grep, sort, uniq, tr, gzip, tar, cron, setuid. File permissions deep dive.", badge: "Free", badgeClass: "badge-free" },
        { name: "OverTheWire: Bandit levels 26–34", desc: "SSH keys, port forwarding, cron jobs, bash scripting, environment variables.", badge: "Free", badgeClass: "badge-free" },
        { name: "File permissions: chmod, chown, SUID/SGID, sticky bit", desc: "Read /etc/passwd and /etc/shadow structure. Understand octal notation.", badge: "Free", badgeClass: "badge-free" },
        { name: "Process management: ps, top, kill, systemctl, crontab", desc: "Start/stop services, schedule tasks, monitor running processes.", badge: "Free", badgeClass: "badge-free" },
        { name: "Bash scripting basics", desc: "Variables, if/else, loops (for/while), functions, $() command substitution, pipelines.", link: "https://learnshell.org/", linkText: "learnshell.org (free)", badge: "Free", badgeClass: "badge-free" }
      ]
    },
    {
      title: "Networking fundamentals",
      topics: [
        { name: "OSI model — all 7 layers with examples", desc: "Know which protocols live on which layer. This comes up in every security interview.", link: "https://www.professormesser.com/network-plus/n10-009/n10-009-video/n10-009-training-course/", linkText: "professormesser.com — free Network+ videos", badge: "Free", badgeClass: "badge-free" },
        { name: "TCP/IP: TCP 3-way handshake, UDP, ICMP", desc: "Understand SYN, SYN-ACK, ACK, FIN, RST flags. Read them in Wireshark.", badge: "Free", badgeClass: "badge-free" },
        { name: "IP addressing, subnetting, CIDR notation", desc: "Calculate subnet ranges, broadcast addresses. Practice with subnettingpractice.com (free).", badge: "Free", badgeClass: "badge-free" },
        { name: "DNS: A, AAAA, MX, CNAME, TXT records + resolution process", desc: "Understand full DNS resolution chain. Use dig and nslookup from CLI.", badge: "Free", badgeClass: "badge-free" },
        { name: "HTTP/HTTPS: request/response cycle, status codes, headers, cookies", desc: "Know 2xx/3xx/4xx/5xx codes. Understand Set-Cookie, Content-Type, Authorization headers.", link: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview", linkText: "MDN HTTP overview (free)", badge: "Free", badgeClass: "badge-free" },
        { name: "Common ports to memorise", desc: "FTP, SSH, SMTP, DNS, HTTP, POP3, IMAP, HTTPS, SMB, MySQL, RDP. These appear on Security+ exam.", badge: "Sec+ Exam", badgeClass: "badge-exam" },
        { name: "Wireshark: capture filters, display filters, follow TCP stream", desc: "Analyse a pcap: identify protocols, find credentials, reconstruct sessions. Use with sample pcaps from malware-traffic-analysis.net.", link: "https://www.wireshark.org/docs/wsug_html_chunked/", linkText: "Wireshark official docs (free)", badge: "Free", badgeClass: "badge-free" }
      ]
    },
    {
      title: "Python scripting for security",
      topics: [
        { name: "Automate the Boring Stuff: Chapters 1–9", desc: "Variables, strings, lists, dicts, loops, functions, file I/O. Foundation only.", link: "https://automatetheboringstuff.com/", linkText: "automatetheboringstuff.com (free)", badge: "Free", badgeClass: "badge-free" },
        { name: "Python: requests library — making HTTP calls", desc: "GET/POST requests, headers, cookies, sessions. Write a script that sends a custom HTTP request to a test server.", badge: "Free", badgeClass: "badge-free" },
        { name: "Python: regex, argparse, JSON parsing", desc: "Parse log files, extract IPs/domains, build CLI tools. Essential for recon scripting.", badge: "Free", badgeClass: "badge-free" }
      ]
    }
  ],
  p1: [
    {
      title: "Domain 1: General Security Concepts",
      topics: [
        { name: "CIA Triad: Confidentiality, Integrity, Availability", desc: "With real examples of each being violated. Non-repudiation concept.", badge: "Exam", badgeClass: "badge-exam" },
        { name: "Authentication factors", desc: "MFA, passwordless auth, biometrics. Understand AAA framework.", badge: "Exam", badgeClass: "badge-exam" },
        { name: "Cryptography: symmetric vs asymmetric, key exchange", desc: "AES, 3DES, RSA, ECC. Know key lengths and use cases.", badge: "Exam", badgeClass: "badge-exam" },
        { name: "Hashing algorithms: MD5, SHA-1, SHA-256, SHA-3", desc: "Why MD5/SHA-1 are deprecated. Understand collisions, salting, HMAC.", badge: "Exam", badgeClass: "badge-exam" },
        { name: "PKI: Certificates, CA hierarchy, CRL, OCSP", desc: "How HTTPS works end-to-end. DV vs OV vs EV certificates.", badge: "Exam", badgeClass: "badge-exam" },
        { name: "Security controls", desc: "Technical vs managerial vs operational controls. Physical controls.", badge: "Exam", badgeClass: "badge-exam" },
        { name: "Zero Trust model", desc: "Microsegmentation, identity verification, continuous validation.", badge: "Exam", badgeClass: "badge-exam" }
      ]
    },
    {
      title: "Domain 2: Threats, Vulnerabilities & Mitigations",
      topics: [
        { name: "Social engineering", desc: "Identify each type. Understand why humans are the weakest link.", badge: "Exam", badgeClass: "badge-exam" },
        { name: "Malware types", desc: "Understand propagation method + payload for each.", badge: "Exam", badgeClass: "badge-exam" },
        { name: "Attack types: DoS, DDoS, on-path", desc: "Mechanisms and mitigations for each. Amplification attacks.", badge: "Exam", badgeClass: "badge-exam" },
        { name: "Web application attacks", desc: "How each works at HTTP level. OWASP Top 10.", badge: "Exam", badgeClass: "badge-exam" },
        { name: "Password attacks", desc: "Salting/hashing defences. Account lockout policies.", badge: "Exam", badgeClass: "badge-exam" },
        { name: "Vulnerability scanning", desc: "CVSS score components. CVE/NVD databases.", badge: "Exam", badgeClass: "badge-exam" },
        { name: "Threat intelligence: OSINT, dark web, IOCs", desc: "Indicators of Compromise vs Indicators of Attack.", badge: "Exam", badgeClass: "badge-exam" },
        { name: "Supply chain attacks, zero-day exploits, APTs", desc: "SolarWinds-style attack as a case study.", badge: "Exam", badgeClass: "badge-exam" }
      ]
    },
    {
      title: "Domain 3: Security Architecture",
      topics: [
        { name: "Network segmentation: VLANs, DMZ", desc: "Draw a typical network diagram with DMZ.", badge: "Exam", badgeClass: "badge-exam" },
        { name: "Firewalls: stateful vs stateless", desc: "Packet filtering vs application layer inspection.", badge: "Exam", badgeClass: "badge-exam" },
        { name: "IDS vs IPS", desc: "Snort rules basics. Understanding alerts vs blocks.", badge: "Exam", badgeClass: "badge-exam" },
        { name: "VPN: IPsec vs SSL/TLS", desc: "IKE phases, tunnel vs transport mode.", badge: "Exam", badgeClass: "badge-exam" },
        { name: "Cloud security", desc: "AWS/Azure/GCP security basics. Cloud misconfigurations.", badge: "Exam", badgeClass: "badge-exam" },
        { name: "Secure network design", desc: "Understand why layered security beats single-point defences.", badge: "Exam", badgeClass: "badge-exam" },
        { name: "Identity & Access Management", desc: "Federation, RBAC, ABAC, MAC, DAC.", badge: "Exam", badgeClass: "badge-exam" }
      ]
    },
    {
      title: "Domain 4: Security Operations",
      topics: [
        { name: "Incident response lifecycle", desc: "NIST SP 800-61 framework.", badge: "Exam + SOC", badgeClass: "badge-exam" },
        { name: "Log types: Windows Event Logs, Syslog", desc: "Know key Windows Event IDs.", badge: "Exam + SOC", badgeClass: "badge-exam" },
        { name: "SIEM: log aggregation", desc: "What SIEM does and doesn't do. Integration with threat intel.", badge: "Exam + SOC", badgeClass: "badge-exam" },
        { name: "Endpoint security: AV, EDR", desc: "EDR vs traditional AV. Telemetry vs signatures.", badge: "Exam", badgeClass: "badge-exam" },
        { name: "Vulnerability management lifecycle", desc: "Patch management, rollback, compensating controls.", badge: "Exam", badgeClass: "badge-exam" },
        { name: "Digital forensics basics", desc: "What to collect first in an incident. Legal considerations.", badge: "Exam + SOC", badgeClass: "badge-exam" },
        { name: "Threat hunting", desc: "Difference from incident response. MITRE ATT&CK framework.", badge: "Exam + SOC", badgeClass: "badge-exam" },
        { name: "Network monitoring", desc: "East-west vs north-south traffic. Baseline normal.", badge: "Exam + SOC", badgeClass: "badge-exam" }
      ]
    },
    {
      title: "Domain 5: Security Program Management",
      topics: [
        { name: "Risk management", desc: "Risk matrix, residual risk, risk acceptance/avoidance.", badge: "Exam", badgeClass: "badge-exam" },
        { name: "Compliance frameworks", desc: "NIST CSF, ISO 27001, SOC 2, PCI-DSS.", badge: "Exam", badgeClass: "badge-exam" },
        { name: "Data classification", desc: "Data retention, destruction policies, DLP controls.", badge: "Exam", badgeClass: "badge-exam" },
        { name: "BCP/DR: RTO, RPO", desc: "Recovery Time Objective vs Recovery Point Objective.", badge: "Exam", badgeClass: "badge-exam" }
      ]
    }
  ],
  p2: [
    {
      title: "Security Blue Team — Junior Analyst Pathway",
      topics: [
        { name: "SBT: Phishing Analysis", desc: "Header analysis, link inspection, attachment analysis.", link: "https://www.securityblue.team/", linkText: "securityblue.team", badge: "Do first", badgeClass: "badge-key" },
        { name: "SBT: Threat Intelligence", desc: "IOC types, MISP, threat intel platforms.", badge: "Free", badgeClass: "badge-free" },
        { name: "SBT: Digital Forensics", desc: "Artefact collection, timeline analysis.", badge: "Free", badgeClass: "badge-free" },
        { name: "SBT: SIEM Fundamentals", desc: "Log ingestion, correlation rules, alert triage.", badge: "Free", badgeClass: "badge-free" },
        { name: "SBT: Incident Response", desc: "Triage process, escalation criteria.", badge: "Free", badgeClass: "badge-free" },
        { name: "SBT: Network Analysis", desc: "Pcap analysis, Wireshark filtering.", badge: "Free", badgeClass: "badge-free" }
      ]
    },
    {
      title: "MITRE ATT&CK framework",
      topics: [
        { name: "ATT&CK Enterprise matrix: 14 tactics", desc: "Reconnaissance → Resource Development → Initial Access...", badge: "Must know", badgeClass: "badge-key" },
        { name: "ATT&CK techniques", desc: "Focus on T1059, T1078, T1566, T1053, T1021.", badge: "Free", badgeClass: "badge-free" },
        { name: "ATT&CK Navigator", desc: "Building threat profiles using the free Navigator tool.", badge: "Free", badgeClass: "badge-free" },
        { name: "Cyber Kill Chain", desc: "Lockheed Martin vs ATT&CK.", badge: "Free", badgeClass: "badge-free" }
      ]
    },
    {
      title: "CyberDefenders labs",
      topics: [
        { name: "CyberDefenders: network forensics", desc: "Investigate real attack traffic. Start with PacketMaze.", link: "https://cyberdefenders.org/", linkText: "cyberdefenders.org", badge: "Free", badgeClass: "badge-free" },
        { name: "CyberDefenders: endpoint forensics", desc: "Windows artefact analysis. Tomcat Takeover lab.", badge: "Free", badgeClass: "badge-free" },
        { name: "CyberDefenders: log analysis", desc: "Correlate events across multiple log sources.", badge: "Free", badgeClass: "badge-free" },
        { name: "LetsDefend: free tier", desc: "Work through real alert queues.", link: "https://letsdefend.io/", linkText: "letsdefend.io", badge: "Do this", badgeClass: "badge-key" }
      ]
    },
    {
      title: "Windows & Active Directory fundamentals",
      topics: [
        { name: "Windows Event Log analysis", desc: "4624/4625, 4720, 4688, 7045. PowerShell logging.", badge: "Free", badgeClass: "badge-free" },
        { name: "Active Directory: domain controller", desc: "Understand what AD is and Kerberos auth.", badge: "Free", badgeClass: "badge-free" },
        { name: "Common AD attacks to detect", desc: "Pass-the-Hash, Kerberoasting, DCSync, Golden Ticket.", badge: "Free", badgeClass: "badge-free" }
      ]
    }
  ],
  p2b: [
    {
      title: "Splunk (free official training)",
      topics: [
        { name: "Splunk Fundamentals 1", desc: "Data onboarding, basic search. ~9 hours.", badge: "Free + badge", badgeClass: "badge-key" },
        { name: "SPL (Splunk Processing Language)", desc: "search, stats, eval, rex, table, sort, dedup.", badge: "Free", badgeClass: "badge-free" },
        { name: "Splunk Boss of the SOC (BOTS)", desc: "Free downloadable datasets with real attack scenarios.", badge: "Free", badgeClass: "badge-free" }
      ]
    },
    {
      title: "Homelab setup",
      topics: [
        { name: "Deploy Wazuh SIEM", desc: "Free open-source SIEM. Follow official quickstart docs.", badge: "Portfolio item", badgeClass: "badge-key" },
        { name: "ELK Stack: basic setup", desc: "Free, widely used. Ingest system logs.", badge: "Free", badgeClass: "badge-free" },
        { name: "Network traffic monitoring", desc: "Zeek (Bro) or Suricata + Pcap collection.", badge: "Free", badgeClass: "badge-free" }
      ]
    }
  ],
  p3: [
    {
      title: "PortSwigger: injection vulnerabilities",
      topics: [
        { name: "SQL Injection: all apprentice labs", desc: "String-based, error-based, blind boolean.", badge: "Week 31", badgeClass: "badge-key" },
        { name: "SQL Injection: practitioner labs", desc: "UNION-based data extraction, reading from schema.", badge: "Week 32", badgeClass: "badge-free" },
        { name: "Command Injection", desc: "Blind command injection via time delays.", badge: "Free", badgeClass: "badge-free" },
        { name: "SSTI (Server-Side Template Injection)", desc: "Detecting SSTI, exploiting Jinja2, Twig.", badge: "Free", badgeClass: "badge-free" }
      ]
    },
    {
      title: "PortSwigger: client-side vulnerabilities",
      topics: [
        { name: "XSS: reflected, stored, DOM-based", desc: "Understand sink vs source in DOM XSS.", badge: "Week 33", badgeClass: "badge-key" },
        { name: "XSS: CSP bypass labs", desc: "Bypassing Content Security Policy.", badge: "Week 34", badgeClass: "badge-free" },
        { name: "CSRF: all labs", desc: "Building a CSRF PoC page. Token validation bypass.", badge: "Free", badgeClass: "badge-free" },
        { name: "Clickjacking, CORS misconfigurations", desc: "Building iframe-based clickjacking PoC.", badge: "Free", badgeClass: "badge-free" }
      ]
    },
    {
      title: "PortSwigger: access control & authentication",
      topics: [
        { name: "IDOR: all access control labs", desc: "Horizontal vs vertical privilege escalation.", badge: "Week 35–36", badgeClass: "badge-key" },
        { name: "Authentication: password reset flaws", desc: "Response manipulation, token predictability.", badge: "Week 37", badgeClass: "badge-free" },
        { name: "JWT attacks", desc: "JSON Web Token manipulation. Using jwt_tool.", badge: "Free", badgeClass: "badge-free" },
        { name: "OAuth 2.0 misconfigurations", desc: "Open redirect via redirect_uri.", badge: "Free", badgeClass: "badge-free" }
      ]
    },
    {
      title: "PortSwigger: server-side vulnerabilities",
      topics: [
        { name: "SSRF: basic, blind", desc: "Accessing internal services, cloud metadata.", badge: "Week 38–39", badgeClass: "badge-key" },
        { name: "XXE (XML External Entity)", desc: "Reading /etc/passwd via XXE.", badge: "Week 40", badgeClass: "badge-free" },
        { name: "File upload vulnerabilities", desc: "Web shell upload, bypassing extension checks.", badge: "Week 41", badgeClass: "badge-free" },
        { name: "Path traversal / directory traversal", desc: "../../../etc/passwd via different encodings.", badge: "Free", badgeClass: "badge-free" },
        { name: "Business logic vulnerabilities", desc: "Price manipulation, workflow bypass.", badge: "Weeks 42–43", badgeClass: "badge-key" },
        { name: "HTTP request smuggling", desc: "CL.TE, TE.CL, TE.TE.", badge: "Weeks 44–45", badgeClass: "badge-free" },
        { name: "Web cache poisoning", desc: "Cache key manipulation, poisoning via unkeyed headers.", badge: "Week 46", badgeClass: "badge-free" }
      ]
    }
  ],
  p4: [
    {
      title: "Mindset & methodology",
      topics: [
        { name: "Read 50 disclosed HackerOne reports", desc: "Study: how found, how reported, what made it valid.", badge: "Do first", badgeClass: "badge-key" },
        { name: "Read aituglo's guide", desc: "Program selection methodology.", badge: "Free", badgeClass: "badge-free" },
        { name: "How to write a good bug report", desc: "Impact, reproduction steps, CVSS.", badge: "Free", badgeClass: "badge-free" }
      ]
    },
    {
      title: "Recon toolchain",
      topics: [
        { name: "Subfinder + amass", desc: "Chain subfinder → amass → dnsx.", badge: "Free", badgeClass: "badge-free" },
        { name: "httpx: HTTP probing", desc: "Identify web servers and tech stacks.", badge: "Free", badgeClass: "badge-free" },
        { name: "waybackurls + gau", desc: "Uncover forgotten endpoints.", badge: "Free", badgeClass: "badge-free" },
        { name: "Nuclei: template-based scanning", desc: "Use for finding exposed admin panels.", badge: "Free", badgeClass: "badge-free" },
        { name: "ffuf: directory/parameter fuzzing", desc: "Fuzz for hidden files, directories.", badge: "Free", badgeClass: "badge-free" },
        { name: "Build a recon bash pipeline", desc: "Chain these tools into a reusable bash script.", badge: "Portfolio", badgeClass: "badge-key" }
      ]
    }
  ],
  p5: [
    {
      title: "HackTheBox: free tier machines",
      topics: [
        { name: "HTB Starting Point: Tier 0 + Tier 1", desc: "Guided machines with free walkthrough access.", badge: "Start here", badgeClass: "badge-key" },
        { name: "HTB: solve 10 Easy-rated retired machines", desc: "Using community writeups.", badge: "Free", badgeClass: "badge-free" },
        { name: "HTB: solve 10 Medium-rated machines", desc: "Before using hints. Document your methodology.", badge: "Free tier", badgeClass: "badge-free" }
      ]
    },
    {
      title: "API security",
      topics: [
        { name: "APIsec University: OWASP API Top 10", desc: "Broken Object Level Auth (API1), etc.", badge: "High value", badgeClass: "badge-key" },
        { name: "GraphQL security", desc: "Introspection, batching attacks, injection via queries.", badge: "Free", badgeClass: "badge-free" }
      ]
    },
    {
      title: "Your IoT/Electronics niche",
      topics: [
        { name: "OWASP IoT Top 10", desc: "Weak passwords, insecure network services.", badge: "Free", badgeClass: "badge-free" },
        { name: "Firmware analysis", desc: "Extract and analyse firmware from IoT devices.", badge: "Free", badgeClass: "badge-free" },
        { name: "LiveOverflow: binary exploitation", desc: "Bridges hardware knowledge with offensive security.", badge: "Free", badgeClass: "badge-free" }
      ]
    }
  ]
};
