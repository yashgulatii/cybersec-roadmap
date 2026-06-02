// src/data/roadmapData.js
// Purpose: Single source of truth containing all career phases, detailed 12-week checklists, phase milestones, helper functions, and legacy compatibility tags.

// ─── NEW STRUCTURED ROADMAP DATA ──────────────────────────────────────────────
export const roadmapData = {
  phase1: {
    id: "phase1",
    title: "Phase 1 — Foundation",
    timeframe: "Now to Month 12",
    theme: "Get employed. Get stable. Build the base of everything else.",
    status: "active",
    progressPercent: 0,
    weeks: [
      {
        weekNumber: 1,
        title: "Week 1 — Audit and Lock In",
        focusArea: "Self-assessment, profile building, and tracking setup.",
        tasks: [
          {
            id: "p1-w1-d1-t1",
            day: "Monday",
            title: "Initialize YASH-OS Obsidian Vault",
            description: "Open Obsidian and create a central vault called YASH-OS for core tracking.",
            category: "PERSONAL",
            estimatedMinutes: 30,
            xpReward: 25,
            linkedSkill: "Discipline",
            linkedProject: "portfolio",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w1-d1-t2",
            day: "Monday",
            title: "Create Vault Categorisation Folders",
            description: "Create five folders in your Obsidian vault: Career, Learning, Personal, Travel, Creative.",
            category: "PERSONAL",
            estimatedMinutes: 15,
            xpReward: 15,
            linkedSkill: "Discipline",
            linkedProject: "portfolio",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w1-d1-t3",
            day: "Monday",
            title: "Write Brutal Self-Assessment",
            description: "Write an honest, 1-page self-assessment detailing current skill gaps and professional constraints.",
            category: "PERSONAL",
            estimatedMinutes: 60,
            xpReward: 35,
            linkedSkill: "Discipline",
            linkedProject: "portfolio",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w1-d1-t4",
            day: "Monday",
            title: "Update LinkedIn Profile Metrics",
            description: "Update your profile with Google Cybersecurity Cert, CNSP, TryHackMe Top 2%, Internship, and IDOR finding details.",
            category: "CAREER",
            estimatedMinutes: 60,
            xpReward: 40,
            linkedSkill: "Communication",
            linkedProject: "portfolio",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w1-d2-t1",
            day: "Tuesday",
            title: "Initialize Job Application Tracker",
            description: "Set up a tracking sheet with columns: Company, Role, JD Link, Applied Date, Status, Follow-up, Notes.",
            category: "CAREER",
            estimatedMinutes: 45,
            xpReward: 25,
            linkedSkill: "Communication",
            linkedProject: "portfolio",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w1-d2-t2",
            day: "Tuesday",
            title: "Research Key Cybersecurity Roles",
            description: "Identify and research 5 target companies: DigiCert, PowerSchool, Hyland, Secureworks, and TCS security division.",
            category: "CAREER",
            estimatedMinutes: 90,
            xpReward: 30,
            linkedSkill: "Communication",
            linkedProject: "portfolio",
            isCompleted: false,
            isRequired: false
          },
          {
            id: "p1-w1-d3-t1",
            day: "Wednesday",
            title: "Finalize Core Resume Drafts",
            description: "Finalize your 1-page primary resume. Create specialized SOC Analyst and AppSec variations highlighting AD Lab & IDOR findings.",
            category: "CAREER",
            estimatedMinutes: 120,
            xpReward: 50,
            linkedSkill: "Communication",
            linkedProject: "portfolio",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w1-d4-t1",
            day: "Thursday",
            title: "Send First Batch of Job Applications",
            description: "Apply to 3 relevant SOC L1 / AppSec roles using your tailored resumes.",
            category: "CAREER",
            estimatedMinutes: 60,
            xpReward: 40,
            linkedSkill: "Communication",
            linkedProject: "portfolio",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w1-d4-t2",
            day: "Thursday",
            title: "Draft Cold Outreach Emails",
            description: "Write cold outreach templates in Obsidian. Customize and send them directly to 2 security managers on LinkedIn.",
            category: "CAREER",
            estimatedMinutes: 45,
            xpReward: 35,
            linkedSkill: "Communication",
            linkedProject: "portfolio",
            isCompleted: false,
            isRequired: false
          },
          {
            id: "p1-w1-d5-t1",
            day: "Friday",
            title: "Initialize Active Directory Lab Setup",
            description: "Set up Domain Controller Server on VirtualBox, add a Windows 10 client, and configure network ranges.",
            category: "LAB",
            estimatedMinutes: 180,
            xpReward: 70,
            linkedSkill: "Active Directory Defense",
            linkedProject: "ad-lab",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w1-d6-t1",
            day: "Saturday",
            title: "Solve PortSwigger Web Vulnerabilities",
            description: "Complete 2 server-side vulnerability labs on PortSwigger Academy. Log payloads in Obsidian.",
            category: "LEARNING",
            estimatedMinutes: 120,
            xpReward: 40,
            linkedSkill: "Web Application Testing (PortSwigger path)",
            linkedProject: "portswigger",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w1-d6-t2",
            day: "Saturday",
            title: "Study HackerOne Writeups",
            description: "Read 2 public HackerOne IDOR/access control writeups. Document how researchers bypassed authorization filters.",
            category: "LEARNING",
            estimatedMinutes: 60,
            xpReward: 25,
            linkedSkill: "Bug Bounty Hunting",
            linkedProject: "portswigger",
            isCompleted: false,
            isRequired: false
          }
        ]
      },
      {
        weekNumber: 2,
        title: "Week 2 — Deep Tracking & Port Reconnaissance",
        focusArea: "Audit applications, perform basic network drills, and complete early web labs.",
        tasks: [
          {
            id: "p1-w2-d1-t1",
            day: "Monday",
            title: "Review Application Outreach Log",
            description: "Review your first week outreach and update tracking records. Refine messages in Obsidian.",
            category: "CAREER",
            estimatedMinutes: 45,
            xpReward: 20,
            linkedSkill: "Communication",
            linkedProject: "portfolio",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w2-d2-t1",
            day: "Tuesday",
            title: "Perform Basic Nmap Scanning Drill",
            description: "Run advanced network scans (-sS, -sV, -sC) against target virtual hosts in your lab environment.",
            category: "LAB",
            estimatedMinutes: 90,
            xpReward: 35,
            linkedSkill: "Nmap",
            linkedProject: "ad-lab",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w2-d3-t1",
            day: "Wednesday",
            title: "Complete PortSwigger SQLi Labs",
            description: "Solve 2 additional SQL Injection labs on PortSwigger Web Academy.",
            category: "LEARNING",
            estimatedMinutes: 120,
            xpReward: 40,
            linkedSkill: "Web Application Testing (PortSwigger path)",
            linkedProject: "portswigger",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w2-d4-t1",
            day: "Thursday",
            title: "Job Applications Batch 2",
            description: "Identify and apply to 3 more SOC L1 / junior security roles on job boards.",
            category: "CAREER",
            estimatedMinutes: 60,
            xpReward: 30,
            linkedSkill: "Communication",
            linkedProject: "portfolio",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w2-d5-t1",
            day: "Friday",
            title: "Audit Active Directory DC Event Logging",
            description: "Configure local audit policies on Domain Controller. Ingest security logs into Splunk core collector.",
            category: "LAB",
            estimatedMinutes: 150,
            xpReward: 50,
            linkedSkill: "Active Directory Defense",
            linkedProject: "ad-lab",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w2-d6-t1",
            day: "Saturday",
            title: "Analyze IDOR Bypass Writeups",
            description: "Read 3 public bug reports detailing IDOR vulnerabilities on target sites. Map the parameter patterns.",
            category: "LEARNING",
            estimatedMinutes: 90,
            xpReward: 30,
            linkedSkill: "Bug Bounty Hunting",
            linkedProject: null,
            isCompleted: false,
            isRequired: false
          },
          {
            id: "p1-w2-d7-t1",
            day: "Sunday",
            title: "Rest & Street Photography Practice",
            description: "Spend a full afternoon walking outside. Shoot 10 street photography scenes with high contrast using manual camera parameters.",
            category: "CREATIVE",
            estimatedMinutes: 180,
            xpReward: 25,
            linkedSkill: "Photography",
            linkedProject: null,
            isCompleted: false,
            isRequired: true
          }
        ]
      },
      {
        weekNumber: 3,
        title: "Week 3 — Active Directory Lab Depth & Attack Practice",
        focusArea: "Launch first active directory attack and prepare foundational technical questions.",
        tasks: [
          {
            id: "p1-w3-d1-t1",
            day: "Monday",
            title: "Perform RDP Brute Force with Hydra",
            description: "Execute RDP brute force simulations against a Windows client VM. Ingest and detect Event ID 4625 bursts in Splunk.",
            category: "LAB",
            estimatedMinutes: 120,
            xpReward: 60,
            linkedSkill: "Active Directory Attacks",
            linkedProject: "ad-lab",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w3-d2-t1",
            day: "Tuesday",
            title: "Targeted Job Application Outreaches",
            description: "Apply to 3 roles and send 1-line follow-up emails on past applications to keep momentum active.",
            category: "CAREER",
            estimatedMinutes: 60,
            xpReward: 35,
            linkedSkill: "Communication",
            linkedProject: "portfolio",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w3-d3-t1",
            day: "Wednesday",
            title: "PortSwigger SQLi Exploit Path",
            description: "Complete a minimum of 2 intermediate SQL Injection labs on PortSwigger.",
            category: "LEARNING",
            estimatedMinutes: 120,
            xpReward: 40,
            linkedSkill: "Web Application Testing (PortSwigger path)",
            linkedProject: "portswigger",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w3-d4-t1",
            day: "Thursday",
            title: "Execute Kerberoasting in Homelab",
            description: "Perform Kerberoasting via Impacket's GetUserSPNs.py against local domain resources and map Event ID 4769 logs.",
            category: "LAB",
            estimatedMinutes: 150,
            xpReward: 65,
            linkedSkill: "Active Directory Attacks",
            linkedProject: "ad-lab",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w3-d5-t1",
            day: "Friday",
            title: "Prepare SOC Technical Q&As",
            description: "Formulate and prepare answers for standard SOC Qs: IDOR finding, brute force logs, AuthN vs AuthZ, CIA triad.",
            category: "CAREER",
            estimatedMinutes: 90,
            xpReward: 40,
            linkedSkill: "Communication",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w3-d6-t1",
            day: "Saturday",
            title: "Complete XSS Vulnerability Labs",
            description: "Solve 2 Cross-Site Scripting (XSS) labs on PortSwigger and catalog filtering bypass rules.",
            category: "LEARNING",
            estimatedMinutes: 120,
            xpReward: 45,
            linkedSkill: "Web Application Testing (PortSwigger path)",
            linkedProject: "portswigger",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w3-d7-t1",
            day: "Sunday",
            title: "Walk Outdoors & Rest",
            description: "Decompress with a scenic outdoor walk. Allow the nervous system to settle.",
            category: "PERSONAL",
            estimatedMinutes: 120,
            xpReward: 20,
            linkedSkill: "Discipline",
            isCompleted: false,
            isRequired: true
          }
        ]
      },
      {
        weekNumber: 4,
        title: "Week 4 — Security+ Introduction & Advanced Lab attacks",
        focusArea: "Launch Messer Security+ SY0-701 study sprint and execute credential dumps.",
        tasks: [
          {
            id: "p1-w4-d1-t1",
            day: "Monday",
            title: "Messer Security+ Domain 1 Study",
            description: "Download and study Professor Messer Security+ SY0-701 materials. Cover Domain 1 for 45 mins.",
            category: "LEARNING",
            estimatedMinutes: 60,
            xpReward: 35,
            linkedSkill: "Security+",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w4-d2-t1",
            day: "Tuesday",
            title: "Job Applications & Trackers Update",
            description: "Submit 3 tailored job applications. Research and append 5 target companies to tracking sheets.",
            category: "CAREER",
            estimatedMinutes: 60,
            xpReward: 30,
            linkedSkill: "Communication",
            linkedProject: "portfolio",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w4-d3-t1",
            day: "Wednesday",
            title: "Execute Pass-the-Hash with Mimikatz",
            description: "Run PtH attacks using Mimikatz in your AD Lab. Map and trigger custom Splunk alert rules.",
            category: "LAB",
            estimatedMinutes: 120,
            xpReward: 65,
            linkedSkill: "Active Directory Attacks",
            linkedProject: "ad-lab",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w4-d4-t1",
            day: "Thursday",
            title: "Messer Security+ Domain 2 Study",
            description: "Cover Domain 2 (Threats, Vulnerabilities, Mitigations) in Messer's official outline.",
            category: "LEARNING",
            estimatedMinutes: 60,
            xpReward: 35,
            linkedSkill: "Security+",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w4-d5-t1",
            day: "Friday",
            title: "Record Mock Interview Session",
            description: "Answer core L1 technical questions out loud on camera. Review the recording for speed and tone adjustments.",
            category: "CAREER",
            estimatedMinutes: 90,
            xpReward: 50,
            linkedSkill: "Communication",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w4-d6-t1",
            day: "Saturday",
            title: "Read IDOR Vulnerability Reports",
            description: "Analyze 5 detailed HackerOne access control bug writeups. Ingest concepts in your Obsidian vault.",
            category: "LEARNING",
            estimatedMinutes: 90,
            xpReward: 30,
            linkedSkill: "Bug Bounty Hunting",
            isCompleted: false,
            isRequired: false
          },
          {
            id: "p1-w4-d7-t1",
            day: "Sunday",
            title: "Golden Hour Street Photography",
            description: "Rest and go on an outdoor walk. Capture shadows, lights, and architecture during golden hour.",
            category: "CREATIVE",
            estimatedMinutes: 180,
            xpReward: 25,
            linkedSkill: "Photography",
            isCompleted: false,
            isRequired: true
          }
        ]
      },
      {
        weekNumber: 5,
        title: "Week 5 — Security+ Domain 1 & Reconnaissance Labs",
        focusArea: "Tackle Domain 1 practice tests and perform BloodHound mapping.",
        tasks: [
          {
            id: "p1-w5-d1-t1",
            day: "Monday",
            title: "Security+ Domain 1 Practice Drills",
            description: "Practice 20 custom Domain 1 questions. Outline weak concepts in Obsidian.",
            category: "LEARNING",
            estimatedMinutes: 60,
            xpReward: 35,
            linkedSkill: "Security+",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w5-d2-t1",
            day: "Tuesday",
            title: "Complete PortSwigger Web Labs",
            description: "Complete 2 server-side vulnerability labs on PortSwigger academy.",
            category: "LEARNING",
            estimatedMinutes: 90,
            xpReward: 30,
            linkedSkill: "Web Application Testing (PortSwigger path)",
            linkedProject: "portswigger",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w5-d3-t1",
            day: "Wednesday",
            title: "Map AD Lab with BloodHound",
            description: "Run SharpHound ingestion and import data inside BloodHound. Identify shortest domain admin pathways.",
            category: "LAB",
            estimatedMinutes: 120,
            xpReward: 60,
            linkedSkill: "BloodHound",
            linkedProject: "ad-lab",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w5-d4-t1",
            day: "Thursday",
            title: "PortSwigger Authentication Bypass Labs",
            description: "Solve 2 authentication bypass challenges inside PortSwigger academy.",
            category: "LEARNING",
            estimatedMinutes: 90,
            xpReward: 35,
            linkedSkill: "Web Application Testing (PortSwigger path)",
            linkedProject: "portswigger",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w5-d5-t1",
            day: "Friday",
            title: "Security+ Domain 1 Review Session",
            description: "Consolidate and write down all flashcard summaries for general security concepts.",
            category: "LEARNING",
            estimatedMinutes: 60,
            xpReward: 30,
            linkedSkill: "Security+",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w5-d6-t1",
            day: "Saturday",
            title: "Aggressive Job Hunting Outreaches",
            description: "Submit 3 high-quality role applications. Follow up with past tracking log items.",
            category: "CAREER",
            estimatedMinutes: 60,
            xpReward: 35,
            linkedSkill: "Communication",
            linkedProject: "portfolio",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w5-d7-t1",
            day: "Sunday",
            title: "Rest & Recovery Journaling",
            description: "Rest offline. Write weekly progress summary and next week focus targets in Obsidian.",
            category: "PERSONAL",
            estimatedMinutes: 90,
            xpReward: 20,
            linkedSkill: "Discipline",
            isCompleted: false,
            isRequired: true
          }
        ]
      },
      {
        weekNumber: 6,
        title: "Week 6 — Security+ Domain 2 & Pass-the-Ticket Attacks",
        focusArea: "Focus on threats, vulnerabilities, and mitigations study drills.",
        tasks: [
          {
            id: "p1-w6-d1-t1",
            day: "Monday",
            title: "Security+ Domain 2 Practice Questions",
            description: "Tackle 20 practice questions daily. Study vulnerability scoring vectors (CVSS).",
            category: "LEARNING",
            estimatedMinutes: 60,
            xpReward: 35,
            linkedSkill: "Security+",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w6-d2-t1",
            day: "Tuesday",
            title: "Solve PortSwigger CSRF Labs",
            description: "Solve 2 CSRF labs on PortSwigger academy to map web vulnerabilities.",
            category: "LEARNING",
            estimatedMinutes: 90,
            xpReward: 30,
            linkedSkill: "Web Application Testing (PortSwigger path)",
            linkedProject: "portswigger",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w6-d3-t1",
            day: "Wednesday",
            title: "Execute Pass-the-Ticket in Lab",
            description: "Perform PtT attacks using stolen Kerberos TGTs inside your VirtualBox domain controller lab.",
            category: "LAB",
            estimatedMinutes: 120,
            xpReward: 60,
            linkedSkill: "Active Directory Attacks",
            linkedProject: "ad-lab",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w6-d4-t1",
            day: "Thursday",
            title: "PortSwigger Client-Side Path",
            description: "Solve 2 client-side web application labs on PortSwigger.",
            category: "LEARNING",
            estimatedMinutes: 90,
            xpReward: 35,
            linkedSkill: "Web Application Testing (PortSwigger path)",
            linkedProject: "portswigger",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w6-d5-t1",
            day: "Friday",
            title: "Domain 2 Vulnerabilities Consolidation",
            description: "Review threats, vulnerabilities, and hardware side-channel risks inside Messer's syllabus.",
            category: "LEARNING",
            estimatedMinutes: 60,
            xpReward: 30,
            linkedSkill: "Security+",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w6-d6-t1",
            day: "Saturday",
            title: "Job Outreach & Tracker Review",
            description: "Send 3 applications. Follow up with contacts from the past fortnight.",
            category: "CAREER",
            estimatedMinutes: 60,
            xpReward: 35,
            linkedSkill: "Communication",
            linkedProject: "portfolio",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w6-d7-t1",
            day: "Sunday",
            title: "Rest & Restorative Journaling",
            description: "Rest offline. Keep a strict digital detox away from terminal monitors.",
            category: "PERSONAL",
            estimatedMinutes: 90,
            xpReward: 20,
            linkedSkill: "Discipline",
            isCompleted: false,
            isRequired: true
          }
        ]
      },
      {
        weekNumber: 7,
        title: "Week 7 — Security+ Architecture & DCSync Exploits",
        focusArea: "Tackle security architecture models and simulate DCSync operations.",
        tasks: [
          {
            id: "p1-w7-d1-t1",
            day: "Monday",
            title: "Security+ Domain 3 Architecture Review",
            description: "Review security architecture concepts and attempt 20 practice questions.",
            category: "LEARNING",
            estimatedMinutes: 60,
            xpReward: 35,
            linkedSkill: "Security+",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w7-d2-t1",
            day: "Tuesday",
            title: "PortSwigger Web CSRF Bypasses",
            description: "Solve 2 advanced CSRF bypass validation labs on PortSwigger academy.",
            category: "LEARNING",
            estimatedMinutes: 90,
            xpReward: 35,
            linkedSkill: "Web Application Testing (PortSwigger path)",
            linkedProject: "portswigger",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w7-d3-t1",
            day: "Wednesday",
            title: "Simulate DCSync in AD Lab",
            description: "Simulate DCSync attacks to dump hashes from DC using Mimikatz or Impacket's secretsdump.py.",
            category: "LAB",
            estimatedMinutes: 120,
            xpReward: 65,
            linkedSkill: "Active Directory Attacks",
            linkedProject: "ad-lab",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w7-d4-t1",
            day: "Thursday",
            title: "PortSwigger SSRF Vulnerability Labs",
            description: "Solve 2 Server-Side Request Forgery (SSRF) labs inside PortSwigger academy.",
            category: "LEARNING",
            estimatedMinutes: 90,
            xpReward: 40,
            linkedSkill: "Web Application Testing (PortSwigger path)",
            linkedProject: "portswigger",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w7-d5-t1",
            day: "Friday",
            title: "Security+ Domain 3 PBQ Practice",
            description: "Practice Performance-Based Questions (PBQs) focusing on network firewalls and subnets.",
            category: "LEARNING",
            estimatedMinutes: 60,
            xpReward: 30,
            linkedSkill: "Security+",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w7-d6-t1",
            day: "Saturday",
            title: "Submit Job Applications Batch 3",
            description: "Submit 3 tailored junior pentesting or SOC role applications.",
            category: "CAREER",
            estimatedMinutes: 60,
            xpReward: 35,
            linkedSkill: "Communication",
            linkedProject: "portfolio",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w7-d7-t1",
            day: "Sunday",
            title: "Rest & Weekly Review",
            description: "Review your task logs and perform emergency reserve validations.",
            category: "PERSONAL",
            estimatedMinutes: 90,
            xpReward: 20,
            linkedSkill: "Discipline",
            isCompleted: false,
            isRequired: true
          }
        ]
      },
      {
        weekNumber: 8,
        title: "Week 8 — Security+ Operations & Splunk Dashboards",
        focusArea: "Tackle security operations domain and compile homelab dashboards.",
        tasks: [
          {
            id: "p1-w8-d1-t1",
            day: "Monday",
            title: "Security+ Domain 4 & 5 Practice Questions",
            description: "Attempt 20 practice questions covering security operations and program management.",
            category: "LEARNING",
            estimatedMinutes: 60,
            xpReward: 35,
            linkedSkill: "Security+",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w8-d2-t1",
            day: "Tuesday",
            title: "Complete PortSwigger CORS Labs",
            description: "Complete 2 CORS vulnerability labs on PortSwigger academy.",
            category: "LEARNING",
            estimatedMinutes: 90,
            xpReward: 35,
            linkedSkill: "Web Application Testing (PortSwigger path)",
            linkedProject: "portswigger",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w8-d3-t1",
            day: "Wednesday",
            title: "Compile Splunk Security Dashboard",
            description: "Create an elegant Splunk monitoring dashboard correlating RDP brute force, PtH, and DCSync events.",
            category: "LAB",
            estimatedMinutes: 120,
            xpReward: 60,
            linkedSkill: "SIEM (Splunk)",
            linkedProject: "ad-lab",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w8-d4-t1",
            day: "Thursday",
            title: "Solve PortSwigger Directory Traversal Labs",
            description: "Solve 2 directory traversal validation labs on PortSwigger academy.",
            category: "LEARNING",
            estimatedMinutes: 90,
            xpReward: 35,
            linkedSkill: "Web Application Testing (PortSwigger path)",
            linkedProject: "portswigger",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w8-d5-t1",
            day: "Friday",
            title: "Security+ Comprehensive Mock Exam",
            description: "Run a full-length, proctored mock exam covering all five domains.",
            category: "LEARNING",
            estimatedMinutes: 120,
            xpReward: 50,
            linkedSkill: "Security+",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w8-d6-t1",
            day: "Saturday",
            title: "Apply to Target Companies",
            description: "Apply to 3 target roles and update the central job tracking sheet.",
            category: "CAREER",
            estimatedMinutes: 60,
            xpReward: 35,
            linkedSkill: "Communication",
            linkedProject: "portfolio",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w8-d7-t1",
            day: "Sunday",
            title: "Rest & Photography Outing",
            description: "Outdoor walk. Photograph urban shapes and geometries to decompress the mind.",
            category: "CREATIVE",
            estimatedMinutes: 180,
            xpReward: 25,
            linkedSkill: "Photography",
            isCompleted: false,
            isRequired: true
          }
        ]
      },
      {
        weekNumber: 9,
        title: "Week 9 — Security+ Mock Trials & Final Sprint",
        focusArea: "Focus on mock exams, timing audits, and resolving weak categories.",
        tasks: [
          {
            id: "p1-w9-d1-t1",
            day: "Monday",
            title: "Security+ Full Length Practice Test 1",
            description: "Attempt Dion or Messer full-length test. Review incorrect queries in your vault.",
            category: "LEARNING",
            estimatedMinutes: 120,
            xpReward: 40,
            linkedSkill: "Security+",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w9-d2-t1",
            day: "Tuesday",
            title: "Review Messer Domains 1–3 Flashcards",
            description: "Study key terms, encryption ciphers, and port numbers for 45 mins.",
            category: "LEARNING",
            estimatedMinutes: 60,
            xpReward: 25,
            linkedSkill: "Security+",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w9-d3-t1",
            day: "Wednesday",
            title: "PortSwigger SQLi Bypasses Review",
            description: "Solve 1 SQL Injection lab requiring filter bypass commands on PortSwigger.",
            category: "LEARNING",
            estimatedMinutes: 90,
            xpReward: 30,
            linkedSkill: "Web Application Testing (PortSwigger path)",
            linkedProject: "portswigger",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w9-d4-t1",
            day: "Thursday",
            title: "Review Messer Domains 4–5 Flashcards",
            description: "Study IR phases, incident management roles, and compliance terms for 45 mins.",
            category: "LEARNING",
            estimatedMinutes: 60,
            xpReward: 25,
            linkedSkill: "Security+",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w9-d5-t1",
            day: "Friday",
            title: "Practice Security+ PBQs",
            description: "Run advanced simulation scenarios matching performance-based question structures.",
            category: "LEARNING",
            estimatedMinutes: 90,
            xpReward: 35,
            linkedSkill: "Security+",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w9-d6-t1",
            day: "Saturday",
            title: "Submit Job Proposals",
            description: "Submit 3 tailored applications focusing on your newly acquired SIEM knowledge.",
            category: "CAREER",
            estimatedMinutes: 60,
            xpReward: 35,
            linkedSkill: "Communication",
            linkedProject: "portfolio",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w9-d7-t1",
            day: "Sunday",
            title: "Rest and Walk Outdoors",
            description: "Quiet outdoor decompression walk. Protect mental stability.",
            category: "PERSONAL",
            estimatedMinutes: 120,
            xpReward: 20,
            linkedSkill: "Discipline",
            isCompleted: false,
            isRequired: true
          }
        ]
      },
      {
        weekNumber: 10,
        title: "Week 10 — Verification Exams & Security+ Voucher Booking",
        focusArea: "Secure 80%+ on final mock exams and lock in booking details.",
        tasks: [
          {
            id: "p1-w10-d1-t1",
            day: "Monday",
            title: "Security+ Comprehensive Practice Exam 2",
            description: "Verify that you hit 80%+ on full-length mock tests before proceeding to bookings.",
            category: "LEARNING",
            estimatedMinutes: 120,
            xpReward: 40,
            linkedSkill: "Security+",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w10-d2-t1",
            day: "Tuesday",
            title: "Review Critical Weak Topics",
            description: "Review specific incorrect questions and check reference materials for clarifications.",
            category: "LEARNING",
            estimatedMinutes: 60,
            xpReward: 25,
            linkedSkill: "Security+",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w10-d3-t1",
            day: "Wednesday",
            title: "Complete PortSwigger XSS Lab",
            description: "Solve 1 intermediate Cross-Site Scripting (XSS) validation lab.",
            category: "LEARNING",
            estimatedMinutes: 90,
            xpReward: 30,
            linkedSkill: "Web Application Testing (PortSwigger path)",
            linkedProject: "portswigger",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w10-d4-t1",
            day: "Thursday",
            title: "Security+ Final Practice Exam 3",
            description: "Execute a final review trial. Audit speed and timing stats closely.",
            category: "LEARNING",
            estimatedMinutes: 120,
            xpReward: 40,
            linkedSkill: "Security+",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w10-d5-t1",
            day: "Friday",
            title: "Purchase & Book Security+ Exam",
            description: "Purchase the SY0-701 exam voucher and schedule your proctored test session.",
            category: "CAREER",
            estimatedMinutes: 60,
            xpReward: 50,
            linkedSkill: "Security+",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w10-d6-t1",
            day: "Saturday",
            title: "Targeted LinkedIn Job Applications",
            description: "Submit 3 highly targeted job applications listing Security+ in progress.",
            category: "CAREER",
            estimatedMinutes: 60,
            xpReward: 35,
            linkedSkill: "Communication",
            linkedProject: "portfolio",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w10-d7-t1",
            day: "Sunday",
            title: "Rest & Relax",
            description: "Rest. Go out for dinner and allow yourself to detach from exam preparation.",
            category: "PERSONAL",
            estimatedMinutes: 180,
            xpReward: 20,
            linkedSkill: "Discipline",
            isCompleted: false,
            isRequired: true
          }
        ]
      },
      {
        weekNumber: 11,
        title: "Week 11 — Security+ Certification Day",
        focusArea: "Pass the CompTIA Security+ examination and celebrate technical milestone.",
        tasks: [
          {
            id: "p1-w11-d1-t1",
            day: "Monday",
            title: "Messer Notes Final Readthrough",
            description: "Read through Professor Messer's quick review summary sheets in your vault.",
            category: "LEARNING",
            estimatedMinutes: 90,
            xpReward: 30,
            linkedSkill: "Security+",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w11-d2-t1",
            day: "Tuesday",
            title: "Build Technical Cheat Sheet",
            description: "Compile and organize a 1-page network reference sheet with common encryption parameters.",
            category: "LEARNING",
            estimatedMinutes: 60,
            xpReward: 25,
            linkedSkill: "Security+",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w11-d3-t1",
            day: "Wednesday",
            title: "Attempt and Pass Security+ Exam",
            description: "Attempt and successfully pass the official CompTIA Security+ proctored examination.",
            category: "LEARNING",
            estimatedMinutes: 180,
            xpReward: 100,
            linkedSkill: "Security+",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w11-d4-t1",
            day: "Thursday",
            title: "Celebrate Technical Milestone Success",
            description: "Take a full day off to celebrate the successful acquisition of your first core security certification.",
            category: "PERSONAL",
            estimatedMinutes: 240,
            xpReward: 20,
            linkedSkill: "Discipline",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w11-d5-t1",
            day: "Friday",
            title: "Complete Basic PortSwigger Lab",
            description: "Log back in and solve 1 basic web security lab on PortSwigger academy.",
            category: "LEARNING",
            estimatedMinutes: 60,
            xpReward: 20,
            linkedSkill: "Web Application Testing (PortSwigger path)",
            linkedProject: "portswigger",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w11-d6-t1",
            day: "Saturday",
            title: "Aggressive Job Board Updates",
            description: "Update resumes and online profiles. Submit 3 targeted applications indicating your passed Security+.",
            category: "CAREER",
            estimatedMinutes: 90,
            xpReward: 40,
            linkedSkill: "Communication",
            linkedProject: "portfolio",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w11-d7-t1",
            day: "Sunday",
            title: "Rest & Outdoor Walk",
            description: "Enjoy a relaxed stroll outside. Allow the system to re-orient after exam cycles.",
            category: "PERSONAL",
            estimatedMinutes: 120,
            xpReward: 20,
            linkedSkill: "Discipline",
            isCompleted: false,
            isRequired: true
          }
        ]
      },
      {
        weekNumber: 12,
        title: "Week 12 — Profile Optimization & Code of Conduct",
        focusArea: "Optimize portfolios, initiate client-side studies, and author personal code of ethics.",
        tasks: [
          {
            id: "p1-w12-d1-t1",
            day: "Monday",
            title: "Update LinkedIn Credentials",
            description: "Formally add CompTIA Security+ badge details to your profiles and ATS-compliant resumes.",
            category: "CAREER",
            estimatedMinutes: 60,
            xpReward: 35,
            linkedSkill: "Communication",
            linkedProject: "portfolio",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w12-d2-t1",
            day: "Tuesday",
            title: "Begin Client-Side Web Studies",
            description: "Study client-side vulnerability concepts: Cross-Site Scripting (XSS), CSRF, and CORS structures.",
            category: "LEARNING",
            estimatedMinutes: 90,
            xpReward: 30,
            linkedSkill: "Web Application Testing (PortSwigger path)",
            linkedProject: "portswigger",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w12-d3-t1",
            day: "Wednesday",
            title: "Author Personal Security Code of Ethics",
            description: "Draft your personal operator code of conduct inside a central Obsidian vault sheet.",
            category: "PERSONAL",
            estimatedMinutes: 60,
            xpReward: 25,
            linkedSkill: "Discipline",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w12-d4-t1",
            day: "Thursday",
            title: "Submit 5 Core Job Applications",
            description: "Submit 5 high-yield applications using your newly updated ATS profiles.",
            category: "CAREER",
            estimatedMinutes: 90,
            xpReward: 40,
            linkedSkill: "Communication",
            linkedProject: "portfolio",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w12-d5-t1",
            day: "Friday",
            title: "Complete Client-Side PortSwigger Labs",
            description: "Complete 2 client-side labs focusing on DOM XSS and payload structures.",
            category: "LEARNING",
            estimatedMinutes: 90,
            xpReward: 35,
            linkedSkill: "Web Application Testing (PortSwigger path)",
            linkedProject: "portswigger",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w12-d6-t1",
            day: "Saturday",
            title: "Review STAR Interview Frameworks",
            description: "Refine your personal STAR scenario answers with newly acquired security credentials.",
            category: "CAREER",
            estimatedMinutes: 60,
            xpReward: 30,
            linkedSkill: "Communication",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p1-w12-d7-t1",
            day: "Sunday",
            title: "Rest Offline and Walk",
            description: "Complete a full day offline walk to conclude the first 12 weeks of operational sprints.",
            category: "PERSONAL",
            estimatedMinutes: 180,
            xpReward: 20,
            linkedSkill: "Discipline",
            isCompleted: false,
            isRequired: true
          }
        ]
      }
    ]
  },
  phase2: {
    id: "phase2",
    title: "Phase 2 — Momentum",
    timeframe: "Year 1 to Year 3",
    theme: "Become excellent. Build parallel income. Start living on your own terms.",
    status: "upcoming",
    progressPercent: 0,
    months: [
      {
        monthNumber: 13,
        title: "Month 13 — Enterprise SIEM and HTB Introduction",
        focusArea: "Deeply understand enterprise SIEM, begin HTB Tier 0, and study access controls.",
        tasks: [
          {
            id: "p2-m13-t1",
            title: "Document Enterprise SIEM Alert Types",
            description: "Identify top 10 alert triggers at work, documenting false positive patterns.",
            category: "LEARNING",
            estimatedMinutes: 180,
            xpReward: 50,
            linkedSkill: "SIEM (Splunk)",
            linkedProject: "portswigger",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p2-m13-t2",
            title: "Begin HTB Starting Point Tier 0",
            description: "Complete 2 machines per week unguided on Hack The Box Starting Point.",
            category: "LEARNING",
            estimatedMinutes: 240,
            xpReward: 60,
            linkedSkill: "Kali Linux",
            linkedProject: "portswigger",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p2-m13-t3",
            title: "Analyze IDOR Bypass Reports",
            description: "Read 1 public HackerOne IDOR vulnerability report daily to study authorization validation.",
            category: "LEARNING",
            estimatedMinutes: 90,
            xpReward: 30,
            linkedSkill: "Bug Bounty Hunting",
            isCompleted: false,
            isRequired: false
          }
        ]
      },
      {
        monthNumber: 14,
        title: "Month 14 — HTB Progression and VDP Hunting",
        focusArea: "Complete easy machines and submit report proof of concepts on public VDPs.",
        tasks: [
          {
            id: "p2-m14-t1",
            title: "Solve HTB Easy Machines Unguided",
            description: "Enumerate and exploit active directory or Linux targets without writeups.",
            category: "LEARNING",
            estimatedMinutes: 300,
            xpReward: 70,
            linkedSkill: "OSCP Preparation",
            linkedProject: "portswigger",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p2-m14-t2",
            title: "HackerOne VDP Scope Mapping",
            description: "Join public VDP and spend 8 hours auditing parameter authorizations.",
            category: "LEARNING",
            estimatedMinutes: 240,
            xpReward: 50,
            linkedSkill: "Bug Bounty Hunting",
            linkedProject: "bugbounty",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p2-m14-t3",
            title: "Mirrorless Photography Session",
            description: "Practice street photography compositions around urban centers.",
            category: "CREATIVE",
            estimatedMinutes: 120,
            xpReward: 25,
            linkedSkill: "Photography",
            isCompleted: false,
            isRequired: false
          }
        ]
      },
      {
        monthNumber: 15,
        title: "Month 15 — OSCP Planning and Budgeting",
        focusArea: "Create courseware roadmap and establish formal emergency fund logs.",
        tasks: [
          {
            id: "p2-m15-t1",
            title: "Create OSCP PEN-200 study checklist",
            description: "Map current knowledge gaps including Windows/Linux privilege escalation and AD buffer overflows.",
            category: "LEARNING",
            estimatedMinutes: 120,
            xpReward: 40,
            linkedSkill: "OSCP Preparation",
            linkedProject: "oscp",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p2-m15-t2",
            title: "Submit First Valid Bug Report",
            description: "Draft and submit a structured POC detailing access bypasses to VDP targets.",
            category: "LEARNING",
            estimatedMinutes: 180,
            xpReward: 60,
            linkedSkill: "Bug Bounty Hunting",
            linkedProject: "bugbounty",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p2-m15-t3",
            title: "Establish Monthly Spreadsheet Budget",
            description: "Audit first paychecks and establish active SIP Nifty 50 compound investments.",
            category: "PERSONAL",
            estimatedMinutes: 60,
            xpReward: 30,
            linkedSkill: "Financial Literacy",
            isCompleted: false,
            isRequired: true
          }
        ]
      },
      {
        monthNumber: 16,
        title: "Month 16 — OSCP Course Purchase & Solo Journey",
        focusArea: "Purchase PEN-200 courseware and coordinate solo train trip.",
        tasks: [
          {
            id: "p2-m16-t1",
            title: "Purchase OffSec PEN-200 Course",
            description: "Acquire 90-day lab vouchers and commit to 15-20 hours weekly.",
            category: "LEARNING",
            estimatedMinutes: 120,
            xpReward: 80,
            linkedSkill: "OSCP Preparation",
            linkedProject: "oscp",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p2-m16-t2",
            title: "Conduct 6-Month Review Conversation",
            description: "Discuss operational performance metrics and growth options with managers.",
            category: "CAREER",
            estimatedMinutes: 60,
            xpReward: 40,
            linkedSkill: "Communication",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p2-m16-t3",
            title: "Conduct Solo India Rail Journey",
            description: "Coordinate backpacking travel including a 5+ hour rail trip.",
            category: "TRAVEL",
            estimatedMinutes: 300,
            xpReward: 50,
            isCompleted: false,
            isRequired: true
          }
        ]
      },
      {
        monthNumber: 17,
        title: "Month 17 — Active Recon & Paid Bounty Targetings",
        focusArea: "Focus on PEN-200 recon modules and private paid scopes.",
        tasks: [
          {
            id: "p2-m17-t1",
            title: "Complete PEN-200 Active Recon Modules",
            description: "Audit scanning parameters, information gatherings, and service enum exercises.",
            category: "LEARNING",
            estimatedMinutes: 240,
            xpReward: 50,
            linkedSkill: "OSCP Preparation",
            linkedProject: "oscp",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p2-m17-t2",
            title: "Audit Paid Scopes on HackerOne",
            description: "Transition to paid private scopes, targeting custom parameter bypasses.",
            category: "LEARNING",
            estimatedMinutes: 180,
            xpReward: 50,
            linkedSkill: "Bug Bounty Hunting",
            linkedProject: "bugbounty",
            isCompleted: false,
            isRequired: true
          }
        ]
      },
      {
        monthNumber: 18,
        title: "Month 18 — Privilege Escalation & Net Worth Milestone",
        focusArea: "Tackle privilege escalation labs and hit ₹1 Lakh savings target.",
        tasks: [
          {
            id: "p2-m18-t1",
            title: "Complete Web Exploitation and PrivEsc Modules",
            description: "Finish privilege escalation exercises and complete 3 medium HTB machines.",
            category: "LEARNING",
            estimatedMinutes: 300,
            xpReward: 70,
            linkedSkill: "Privilege Escalation",
            linkedProject: "oscp",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p2-m18-t2",
            title: "Save ₹1 Lakh in Investments",
            description: "Reach your first major savings target across SIP allocations and liquid reserves.",
            category: "PERSONAL",
            estimatedMinutes: 30,
            xpReward: 50,
            linkedSkill: "Financial Literacy",
            isCompleted: false,
            isRequired: true
          }
        ]
      },
      {
        monthNumber: 19,
        title: "Months 19-21 — Guided Penetration Tests",
        focusArea: "Run weekly full pentest reports against laboratory systems.",
        tasks: [
          {
            id: "p2-m19-t1",
            title: "Generate Guided Pentest Reports",
            description: "Exploit simulated lab targets and draft professional audit summaries.",
            category: "LEARNING",
            estimatedMinutes: 360,
            xpReward: 80,
            linkedSkill: "OSCP Preparation",
            linkedProject: "oscp",
            isCompleted: false,
            isRequired: true
          }
        ]
      },
      {
        monthNumber: 22,
        title: "Month 22 — Attempt OSCP Examination",
        focusArea: "Pass 24-hour proctored OffSec exam.",
        tasks: [
          {
            id: "p2-m22-t1",
            title: "Pass OSCP Certification Exam",
            description: "Complete 24-hour examination targeting at least 70 points, including AD sets.",
            category: "LEARNING",
            estimatedMinutes: 1440,
            xpReward: 200,
            linkedSkill: "OSCP Preparation",
            linkedProject: "oscp",
            isCompleted: false,
            isRequired: true
          }
        ]
      },
      {
        monthNumber: 23,
        title: "Months 23-24 — Red Team Pivot & Travel Doc",
        focusArea: "Tackle junior pentesting roles and publish photo essay portfolios.",
        tasks: [
          {
            id: "p2-m23-t1",
            title: "Apply for Junior Pentesting Roles",
            description: "Leverage OSCP certification and homelab reports to seek offensive roles.",
            category: "CAREER",
            estimatedMinutes: 180,
            xpReward: 60,
            linkedSkill: "Communication",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p2-m23-t2",
            title: "Publish Travel Photo Essay",
            description: "Select 10 street photographs and draft a visual essay post on LinkedIn.",
            category: "CREATIVE",
            estimatedMinutes: 120,
            xpReward: 40,
            linkedSkill: "Photography",
            isCompleted: false,
            isRequired: false
          }
        ]
      }
    ]
  },
  phase3: {
    id: "phase3",
    title: "Phase 3 — Expansion",
    timeframe: "Year 3 to Year 5",
    theme: "Go offensive. Go remote. Go wider.",
    status: "upcoming",
    progressPercent: 0,
    quarters: [
      {
        quarterNumber: 1,
        title: "Quarter 1 — Offensive Placement & CRTO Booking",
        focusArea: "Secure full pentester role, book CRTO course, and execute international trip.",
        tasks: [
          {
            id: "p3-q1-t1",
            title: "Secure Full Offensive Role",
            description: "Pivot into dedicated infrastructure pentesting or red teaming role.",
            category: "CAREER",
            estimatedMinutes: 240,
            xpReward: 90,
            linkedSkill: "Red Team Operations",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p3-q1-t2",
            title: "Pass Certified Red Team Operator (CRTO)",
            description: "Study Cobalt Strike beacon mechanisms and complete active directory evasion rules.",
            category: "LEARNING",
            estimatedMinutes: 300,
            xpReward: 100,
            linkedSkill: "Red Team Operations",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p3-q1-t3",
            title: "Execute Solo International Travel",
            description: "Backpack Southeast Asia (Thailand/Vietnam) solo, managing logistics.",
            category: "TRAVEL",
            estimatedMinutes: 600,
            isCompleted: false,
            isRequired: true
          }
        ]
      },
      {
        quarterNumber: 2,
        title: "Quarter 2 — Hardware Hacking & Community",
        focusArea: "Study physical hardware debugging (UART/JTAG) and present at OWASP.",
        tasks: [
          {
            id: "p3-q2-t1",
            title: "Dump Device Firmware via UART",
            description: "Locate UART pads, dump firmware configurations, and analyze binary structures.",
            category: "LEARNING",
            estimatedMinutes: 240,
            xpReward: 70,
            linkedSkill: "Kali Linux",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p3-q2-t2",
            title: "Present at local OWASP meetup",
            description: "Draft slides and deliver a short presentation sharing Active Directory detections.",
            category: "CAREER",
            estimatedMinutes: 180,
            xpReward: 60,
            linkedSkill: "Communication",
            isCompleted: false,
            isRequired: false
          }
        ]
      },
      {
        quarterNumber: 3,
        title: "Quarter 3 — Nomadic trial & Cloud Auditing",
        focusArea: "Tackle cloud service misconfigs and experiment working as a nomad.",
        tasks: [
          {
            id: "p3-q3-t1",
            title: "Perform AWS misconfig Audit",
            description: "Evaluate public S3 buckets and wildcard IAM policy risks in sandbox.",
            category: "LEARNING",
            estimatedMinutes: 180,
            xpReward: 60,
            linkedSkill: "Active Directory Defense",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p3-q3-t2",
            title: "Establish Nomad Working Routine",
            description: "Spend 2 weeks working remotely from Chiang Mai or other nomad hub.",
            category: "TRAVEL",
            estimatedMinutes: 480,
            isCompleted: false,
            isRequired: true
          }
        ]
      },
      {
        quarterNumber: 4,
        title: "Quarter 4 — Financial Autonomy & Advanced Certs",
        focusArea: "Compile SIP reserves and begin OSEP/OSWE advanced outlines.",
        tasks: [
          {
            id: "p3-q4-t1",
            title: "Target 40% FIRE Milestone",
            description: "Verify SIP portfolios approach initial Financial Independence thresholds.",
            category: "PERSONAL",
            estimatedMinutes: 60,
            xpReward: 50,
            linkedSkill: "Financial Literacy",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p3-q4-t2",
            title: "Purchase OSEP / OSWE Study Material",
            description: "Outline advanced evasion or code-review learning paths.",
            category: "LEARNING",
            estimatedMinutes: 120,
            xpReward: 70,
            linkedSkill: "Red Team Operations",
            isCompleted: false,
            isRequired: true
          }
        ]
      }
    ]
  },
  phase4: {
    id: "phase4",
    title: "Phase 4 — Mastery and Freedom",
    timeframe: "Year 5 to Year 10",
    theme: "Live on your own terms. Work is a tool, not a cage.",
    status: "upcoming",
    progressPercent: 0,
    years: [
      {
        yearNumber: 6,
        title: "Year 6 — Senior Consultings & DEF CON Speaking",
        focusArea: "Secure advisory contracts and present custom exploit researches globally.",
        tasks: [
          {
            id: "p4-y6-t1",
            title: "Submit research to DEF CON / Black Hat",
            description: "Document custom zero-day vulnerability disclosures and request speaking slots.",
            category: "LEARNING",
            estimatedMinutes: 300,
            xpReward: 120,
            linkedSkill: "Technical Writing",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p4-y6-t2",
            title: "Establish Senior Advisory Pipelines",
            description: "Consult for selective international clients at high-end daily rates.",
            category: "CAREER",
            estimatedMinutes: 240,
            xpReward: 100,
            linkedSkill: "Red Team Operations",
            isCompleted: false,
            isRequired: true
          }
        ]
      },
      {
        yearNumber: 7,
        title: "Year 7 — Physical Resilience & physical Photobook",
        focusArea: "Achieve 50% FIRE milestones and compile travel photobooks.",
        tasks: [
          {
            id: "p4-y7-t1",
            title: "Achieve 50% FIRE target",
            description: "Hit major compounding milestones inside low-cost index tracker sheets.",
            category: "PERSONAL",
            estimatedMinutes: 60,
            xpReward: 80,
            linkedSkill: "Financial Literacy",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p4-y7-t2",
            title: "Draft Travel Photobook Drafts",
            description: "Compile top 100 high contrast street shots into a print-ready document.",
            category: "CREATIVE",
            estimatedMinutes: 180,
            xpReward: 50,
            linkedSkill: "Photography",
            isCompleted: false,
            isRequired: false
          }
        ]
      },
      {
        yearNumber: 8,
        title: "Year 8 — Extreme Travels & Expert Auditing",
        focusArea: "Coordinate high difficulty solo hikes and research kernel modules.",
        tasks: [
          {
            id: "p4-y8-t1",
            title: "Coordinate Iceland / Patagonia Solo Trek",
            description: "Backpack rugged geographic zones independently to test mental stamina.",
            category: "TRAVEL",
            estimatedMinutes: 600,
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p4-y8-t2",
            title: "Publish Custom Exploits Framework",
            description: "Publish an open-source Windows security assessment framework to GitHub.",
            category: "LEARNING",
            estimatedMinutes: 300,
            xpReward: 90,
            linkedSkill: "Technical Writing",
            isCompleted: false,
            isRequired: true
          }
        ]
      },
      {
        yearNumber: 9,
        title: "Years 9–10 — Aggressive FIRE actualisation",
        focusArea: "Achieve total financial freedom, work optionally, and mentor researchers.",
        tasks: [
          {
            id: "p4-y9-t1",
            title: "Achieve Total Financial Independence",
            description: "Verify Nifty 50 returns exceed annual life budgets comfortably.",
            category: "PERSONAL",
            estimatedMinutes: 120,
            xpReward: 200,
            linkedSkill: "Financial Literacy",
            isCompleted: false,
            isRequired: true
          },
          {
            id: "p4-y9-t2",
            title: "Set up Hardware Security Research Lab",
            description: "Establish a fully private lab matching physical signal analyzers and chip exploit tools.",
            category: "LAB",
            estimatedMinutes: 240,
            xpReward: 100,
            isCompleted: false,
            isRequired: true
          }
        ]
      }
    ]
  }
};

// ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────

// Returns the tasks for a specific day in a phase and week
export function getTasksForToday(currentPhase, currentWeek, currentDay) {
  const phase = roadmapData[currentPhase];
  if (!phase) return [];

  // Phase 1 has a weekly structure
  if (currentPhase === "phase1" && phase.weeks) {
    const week = phase.weeks.find(w => w.weekNumber === currentWeek);
    if (!week) return [];
    return week.tasks.filter(task => (task?.day || '').toLowerCase() === (currentDay || '').toLowerCase());
  }

  // Fallback if looking for a matching day name elsewhere
  return [];
}

// Returns all tasks for a specific week in a phase
export function getWeeklyTasks(currentPhase, currentWeek) {
  const phase = roadmapData[currentPhase];
  if (!phase) return [];

  if (currentPhase === "phase1" && phase.weeks) {
    const week = phase.weeks.find(w => w.weekNumber === currentWeek);
    return week ? week.tasks : [];
  }

  return [];
}

// Computes the phase completion percentage (0 - 100) based on completedTaskIds
export function getPhaseProgress(phaseId, completedTaskIds = []) {
  const phase = roadmapData[phaseId];
  if (!phase) return 0;

  const completedSet = new Set(completedTaskIds);
  let totalTasks = 0;
  let completedCount = 0;

  if (phaseId === "phase1" && phase.weeks) {
    phase.weeks.forEach(week => {
      week.tasks.forEach(task => {
        totalTasks++;
        if (completedSet.has(task.id)) {
          completedCount++;
        }
      });
    });
  } else if (phaseId === "phase2" && phase.months) {
    phase.months.forEach(month => {
      month.tasks.forEach(task => {
        totalTasks++;
        if (completedSet.has(task.id)) {
          completedCount++;
        }
      });
    });
  } else if (phaseId === "phase3" && phase.quarters) {
    phase.quarters.forEach(quarter => {
      quarter.tasks.forEach(task => {
        totalTasks++;
        if (completedSet.has(task.id)) {
          completedCount++;
        }
      });
    });
  } else if (phaseId === "phase4" && phase.years) {
    phase.years.forEach(year => {
      year.tasks.forEach(task => {
        totalTasks++;
        if (completedSet.has(task.id)) {
          completedCount++;
        }
      });
    });
  }

  if (totalTasks === 0) return 0;
  return Math.min(100, Math.round((completedCount / totalTasks) * 100));
}

// ─── LEGACY COMPATIBILITY EXPORTS ─────────────────────────────────────────────
export const PHASES = ["phase1", "phase2", "phase3", "phase4"];

export const PHASE_META = [
  { id: "phase1", label: "Phase 1", short: "P1", color: "#BA7517", icon: "🔥", sub: "Foundation (Month 1-12)" },
  { id: "phase2", label: "Phase 2", short: "P2", color: "#185FA5", icon: "🛡️", sub: "Momentum (Year 1-3)" },
  { id: "phase3", label: "Phase 3", short: "P3", color: "#10b981", icon: "🛰️", sub: "Expansion (Year 3-5)" },
  { id: "phase4", label: "Phase 4", short: "P4", color: "#8af5ff", icon: "🏆", sub: "Mastery (Year 5-10)" }
];

export const ROADMAP_TOPICS = {
  foundation: {
    id: "foundation",
    title: "Phase 1 - Foundation (Now to Month 12)",
    shortTitle: "Phase 1 Foundation",
    defaultProgress: 35,
    defaultStatus: "In Progress",
    color: "yellow",
    content: `### Theme: Get employed. Get stable. Build the base of everything else.

#### WEEKS 1–2: AUDIT AND LOCK IN
- **Day 1**: 
  - Open Obsidian. Create a vault called \`YASH-OS\`.
  - Create five folders: \`Career\`, \`Learning\`, \`Personal\`, \`Travel\`, \`Creative\`.
  - Write a 1-page honest self-assessment. Brutal review of gaps.
  - Update LinkedIn: Google Cybersecurity Cert, CNSP, TryHackMe Top 2%, Ethical Hacking Internship, Campus Track IDOR (CVSS 8.9), 7 Python security tools.
- **Day 2**: 
  - Set up a job tracking sheet with columns: Company, Role, JD Link, Applied Date, Status, Follow-up, Notes.
  - Research: DigiCert, PowerSchool, Hyland, Secureworks, TCS security division.
  - Identify 10 more companies on LinkedIn & Naukri for tracking.
- **Day 3**: 
  - Finalize primary 1-page resume highlighting the IDOR CVSS 8.9 and the AD Lab.
  - Create two versions: **SOC Analyst** (leads with AD Lab/TryHackMe) and **AppSec** (leads with IDOR/PortSwigger).
- **Day 4**: 
  - Apply to 3 roles today using role-specific resume.
  - Draft cold email template in Obsidian. Send to 2 companies.
- **Day 5**: 
  - Dedicated Active Directory Lab day. Set up Domain Controller on Windows Server 2022, Windows 10 domain-joined client, Kali Linux attacker, and Splunk log ingestion.
  - If partially done: configure Splunk to catch brute force (Event ID 4625 burst -> 4624 success).
- **Day 6 (Weekend)**: 
  - PortSwigger: Complete 2 server-side labs. Log findings in Obsidian.
  - Read 2 HackerOne writeups on Hacktivity.
- **Day 7**: 
  - Rest. Genuine physical recovery away from screen.`
  },
  momentum: {
    id: "momentum",
    title: "Phase 2 - Momentum (Year 1 to Year 3)",
    shortTitle: "Phase 2 Momentum",
    defaultProgress: 0,
    defaultStatus: "Upcoming",
    color: "red",
    content: `### Theme: Become excellent. Build parallel income. Start living on your own terms.

#### MONTHS 13–15 (Year 1, Q1 of Employment)
- **Month 13**:
  - *At Work*: Deeply understand your company's SIEM. Identify top 10 alert types. Document false positives vs true positives.
  - *Learning*: Begin Hack The Box (Starting Point, Tier 0). Complete 2 machines per week.
  - *Bug Bounty*: Read 1 HackerOne IDOR report per day (30 total) to identify access control patterns.
  - *Personal*: Secure one dedicated evening per week for pure personal recovery.
- **Month 14**:
  - *Learning*: Hack The Box easy machines unguided. Build solid enumeration and privilege escalation habits.
  - *Bug Bounty*: Join your first actual VDP on HackerOne. Spend 8 hours this month focused only on IDOR on one target.
  - *Work*: Volunteer to write or tune a detection rule.
  - *Creative*: Acquire a mirrorless or DSLR camera. Practice street photography.
- **Month 15**:
  - *Learning*: Build OSCP PEN-200 study checklist. Map knowledge gaps (Linux/Win privesc, AD exploitation, buffer overflows).
  - *Bug Bounty*: Submit your first bug report (aim for a clean, structured proof of concept).
  - *Financial*: Establish a formal monthly spreadsheet budget (SIP running, 3-month emergency fund building).`
  },
  expansion: {
    id: "expansion",
    title: "Phase 3 - Expansion (Year 3 to Year 5)",
    shortTitle: "Phase 3 Expansion",
    defaultProgress: 0,
    defaultStatus: "Upcoming",
    color: "red",
    content: `### Theme: Go offensive. Go remote. Go wider.

#### YEAR 3, Q1 (Months 37–39)
- **Career**:
  - Secure a Pentesting or Red Team operator role (utilizing OSCP + CRTO).
  - Negotiate remote or hybrid arrangements to increase life flexibility.
  - Build public credibility: 1 LinkedIn post per month, 1 technical blog post per quarter.
- **Learning**:
  - Study and pass the Certified Red Team Operator (CRTO) exam (1.5 hours daily for 8–10 weeks).
  - Begin exploring OSWE (advanced web) or OSEP (evasion/red teaming).
- **Bug Bounty**: Focus on high-yield 2026 bugs: API security, auth bypass, and SSRF.
- **Financial**: Compounding is visible (SIP value ₹3–4 Lakhs, bug bounty ₹20K-40K/month).
- **Travel**: First international solo trip (Thailand, Vietnam, or Bali for 8–10 days). Navigate everything independently.`
  },
  mastery: {
    id: "mastery",
    title: "Phase 4 - Mastery and Freedom (Year 5 to Year 10)",
    shortTitle: "Phase 4 Mastery",
    defaultProgress: 0,
    defaultStatus: "Upcoming",
    color: "red",
    content: `### Theme: Live on your own terms. Work is a tool, not a cage.

#### YEAR 6 (Established Authority)
- **Career**: Senior Red Teamer or High-End Consultant. Custom exploit development, advanced IoT/embedded hacking. Target speaking engagements at DEF CON, Black Hat, Nullcon, or c0c0n India.
- **Learning**: Research-driven. CVE publications, zero-day discoveries, custom frameworks.
- **Financial**: ₹40–60 Lakh net worth. Multiple passive and active remote income streams.
- **Travel**: 3-week Europe trip blending photography, nomadic work, and nature.
- **Personal**: Formally mentor 2–3 junior professionals. Ensure your career compounds by lifting others.`
  }
};

export const DAILY_TASK_POOLS = {
  phase1_hunting: [
    { title: "Apply to 3 SOC L1 / AppSec roles on LinkedIn or Naukri", category: "learning" },
    { title: "Review primary resume for ATS check parameters", category: "learning" },
    { title: "Send 2 high-quality personalized cold emails to managers", category: "learning" },
    { title: "Configure Splunk to detect RDP brute force in AD Lab", category: "learning" },
    { title: "Analyze 2 HackerOne IDOR writeups and log payloads", category: "learning" },
    { title: "Complete 2 server-side labs on PortSwigger Academy", category: "learning" },
    { title: "Study Messer Security+ Domain 1 (General Concepts) for 45 mins", category: "learning" },
    { title: "Perform simulated brute force via Hydra in your AD lab", category: "learning" },
    { title: "Practice answers for 5 standard SOC technical interview questions", category: "learning" },
    { title: "Practice CIDR subnetting calculations (10 problems)", category: "learning" },
    { title: "Memorize top 25 network ports and service protocols cold recall", category: "learning" },
    { title: "Write a Bash script to automate log extraction", category: "learning" },
    { title: "Perform recon on AD DC using BloodHound and analyze paths", category: "learning" },
    { title: "Complete 2 client-side labs on PortSwigger (XSS or CSRF)", category: "learning" },
    { title: "Analyze Windows Event ID 4624 vs 4625 logs in Splunk", category: "learning" },
    { title: "Practice mock technical interview out loud while recording", category: "learning" },
    { title: "Read and summarize 3 recent OWASP Top 10 vulnerabilities", category: "learning" },
    { title: "Study PortSwigger SQL injection techniques for 1 hour", category: "learning" },
    { title: "Establish emergency budget spreadsheet and audit last 30 days expenses", category: "personal" },
    { title: "Configure a recurring low-cost SIP index fund investment", category: "personal" },
    { title: "Verify you have a fully-funded 3-month emergency reserve", category: "personal" },
    { title: "Read Viktor Frankl's 'Man's Search for Meaning' for 20 minutes", category: "personal" },
    { title: "Draft your personal cybersecurity operator code of ethics in Obsidian", category: "personal" },
    { title: "Commit to 10 minutes of pure sensory silence", category: "personal" },
    { title: "Prep home-cooked meals for clean physical energy", category: "personal" },
    { title: "Execute a 30-minute physical movement workout", category: "personal" },
    { title: "Research affordable PG accommodations in Bangalore", category: "creative" },
    { title: "Plan a budget-friendly solo train journey to McLeod Ganj or Jaipur", category: "creative" },
    { title: "Study camera manual and practice manual settings in street lighting", category: "creative" },
    { title: "Select your top 5 street photography shots and write a critique", category: "creative" },
    { title: "Outline a 1-day photography walking tour path", category: "creative" },
    { title: "Practice post-processing of 3 photos to match a cyberpunk aesthetic", category: "creative" }
  ],
  phase1_employed: [
    { title: "At Work: Identify top 10 alert types and document false positives", category: "learning" },
    { title: "Work: Spend 30 mins documenting standard response for phishing alerts", category: "learning" },
    { title: "Work: Ask a senior analyst for feedback on a closed ticket", category: "learning" },
    { title: "Learning: Complete HTB 'Starting Point' Tier 0 machine unguided", category: "learning" },
    { title: "Learning: Begin OSCP study checklist & review Linux privesc", category: "learning" },
    { title: "Learning: Study Windows service configurations and permissions", category: "learning" },
    { title: "Bounty: Read 1 HackerOne public IDOR report and try payloads", category: "learning" },
    { title: "Bounty: Spend 45 minutes mapping directories on VDP target", category: "learning" },
    { title: "Bounty: Review subdomains on a broad-scope program using Subfinder", category: "learning" },
    { title: "Learning: Complete 2 machines on TryHackMe relating to AD", category: "learning" },
    { title: "Learning: Build custom Python script to parse log errors", category: "learning" },
    { title: "Learning: Pass one mock test for Splunk Certified User with 80%+", category: "learning" },
    { title: "Learning: Study DNS zone transfers and practice command line dig tools", category: "learning" },
    { title: "Learning: Review a recent CVE exploit code and write a summary", category: "learning" },
    { title: "Learning: Practice active network sniffing with Wireshark filters", category: "learning" },
    { title: "Learning: Review how Kerberos tickets are granted", category: "learning" },
    { title: "Learning: Spend 45 mins learning how to write custom Yara rules", category: "learning" },
    { title: "Learning: Set up automated RSS feed of top security news sites", category: "learning" },
    { title: "Budgeting: Audit your first month paycheck allocations", category: "personal" },
    { title: "SIP: Increase index fund monthly contributions by 10%", category: "personal" },
    { title: "Insurance: Research independent health insurance plans", category: "personal" },
    { title: "Stoicism: Read Marcus Aurelius's 'Meditations' for 15 minutes", category: "personal" },
    { title: "Habit: Keep phone in another room overnight to prioritize sleep", category: "personal" },
    { title: "Habit: Walk 8,000 steps today to keep active during sitting shifts", category: "personal" },
    { title: "Habit: Write down 3 wins and 1 improvement area before sleep", category: "personal" },
    { title: "Habit: Spend 10 minutes performing full-body stretching", category: "personal" },
    { title: "Photography: Carry camera outside and shoot 10 high-contrast photos", category: "creative" },
    { title: "Travel: Outline budget and logistics for second solo rail journey", category: "creative" },
    { title: "Filmmaking: Learn basic cinematic transitions on YouTube", category: "creative" },
    { title: "Photography: Review photography work by Sean Tucker for street philosophy", category: "creative" },
    { title: "Photography: Practice black & white editing on 3 photos", category: "creative" },
    { title: "Travel: Research local hostels and budget homestays in Varanasi", category: "creative" }
  ],
  phase2: [
    { title: "OSCP: Complete 2 OffSec lab exercises for Linux/Windows privesc", category: "learning" },
    { title: "OSCP: Attempt and document 1 full pentest against lab machine", category: "learning" },
    { title: "OSCP: Practice using Impacket scripts (GetNPUsers, GetUserSPNs) in labs", category: "learning" },
    { title: "OSCP: Study Mimikatz command usage for credentials dumping", category: "learning" },
    { title: "OSCP: Solve 1 medium Linux machine on HTB unguided", category: "learning" },
    { title: "OSCP: Solve 1 medium Windows machine on HTB unguided", category: "learning" },
    { title: "Bounty: Focus for 1.5 hours on finding access bypasses in target", category: "learning" },
    { title: "Bounty: Submit high-quality vulnerability report to paid VDP", category: "learning" },
    { title: "Bounty: Map out API endpoints on mobile target using Burp", category: "learning" },
    { title: "Work: Review recently tuned detection rules at work and analyze logs", category: "learning" },
    { title: "Work: Draft achievement summary for 6-month review", category: "learning" },
    { title: "Learning: Spend 1 hour studying custom exploit modifications", category: "learning" },
    { title: "Learning: Build local lab simulating active directory delegation", category: "learning" },
    { title: "Learning: Practice using BloodHound to spot path options", category: "learning" },
    { title: "Learning: Run mock 4-hour OSCP sprint exam simulation", category: "learning" },
    { title: "Learning: Study how to perform cross-site scripting bypasses", category: "learning" },
    { title: "Learning: Read 2 technical blogs on AD mitigations", category: "learning" },
    { title: "Learning: Learn OffSec style proctored report formatting", category: "learning" },
    { title: "SIP: Increase SIP amount and verify compounding progress", category: "personal" },
    { title: "Savings: Review emergency reserve allocations and update logs", category: "personal" },
    { title: "Networking: Connect with 3 mid-level offensive pros on LinkedIn", category: "personal" },
    { title: "Networking: Draft template for experienced red teamers for 15-min call", category: "personal" },
    { title: "Mindset: Spend 15 minutes of quiet reading on philosophy or ethics", category: "personal" },
    { title: "Fitness: Complete high-intensity 30-minute strength or bodyweight workout", category: "personal" },
    { title: "Mental: Spend 10 minutes journaling about work-life balance", category: "personal" },
    { title: "Habit: Eliminate processed sugar today to keep focus stable", category: "personal" },
    { title: "Travel: Book train tickets or select dates for solo Himalayan journey", category: "creative" },
    { title: "Photography: Post a travel photography photo essay on LinkedIn", category: "creative" },
    { title: "Filmmaking: Edit 60-second high-energy travel reel with sound design", category: "creative" },
    { title: "Photography: Practice editing raw files for neon/cyberpunk tones", category: "creative" },
    { title: "Photography: Go on golden hour street shoot focusing on reflections", category: "creative" },
    { title: "Travel: Research digital nomad friendly spaces in Ladakh", category: "creative" }
  ],
  phase3: [
    { title: "CRTO: Study AD abuse via Cobalt Strike beacons for 1 hour", category: "learning" },
    { title: "CRTO: Execute DCSync credentials harvesting in practice lab", category: "learning" },
    { title: "OSWE: Review source code of vulnerable app for SQLi pathways", category: "learning" },
    { title: "OSWE: Write Python script to automate multi-step auth bypass exploit", category: "learning" },
    { title: "Bounty: Scan high-yield API target for IDORs and authorization issues", category: "learning" },
    { title: "Bounty: Target SSRF vulnerabilities on private programs using DNS loggers", category: "learning" },
    { title: "Hardware: Dump firmware from old router using binwalk tools", category: "learning" },
    { title: "Hardware: Analyze UART/JTAG pinouts and dump serial outputs", category: "learning" },
    { title: "CTF: Form or join CTF team on CTFtime and register", category: "learning" },
    { title: "CTF: Solve hard reverse engineering challenge from past CTF", category: "learning" },
    { title: "Career: Write and publish technical post about AD security on LinkedIn", category: "learning" },
    { title: "Career: Draft talk abstract for local OWASP or security meetup", category: "learning" },
    { title: "Career: Identify 3 remote offensive roles on remotejob boards", category: "learning" },
    { title: "Career: Scope freelance VAPT consulting agreement template", category: "learning" },
    { title: "Learning: Perform cloud audit on AWS S3 permissions", category: "learning" },
    { title: "Learning: Spend 1 hour studying modern AV/EDR evasion on Windows", category: "learning" },
    { title: "Learning: Set up local test suite with Cobalt Strike to analyze triggers", category: "learning" },
    { title: "Learning: Practice decompiling basic Android app using jadx tools", category: "learning" },
    { title: "FIRE: Calculate exact Monthly FIRE Number and plot progress", category: "personal" },
    { title: "Portfolio: Audit mutual funds, SIP allocations, and compound rates", category: "personal" },
    { title: "Freelancing: Determine target daily billing rates for security audits", category: "personal" },
    { title: "Health: Commit to 3-mile outdoor run or high-stamina cardio session", category: "personal" },
    { title: "Wellness: Practice 15 minutes of controlled breathing in nature", category: "personal" },
    { title: "Mentorship: Review junior professional's resume and write feedback", category: "personal" },
    { title: "Stoicism: Spend 20 minutes offline studying stoic adaptability", category: "personal" },
    { title: "Habit: Keep entirely offline evening starting from 7 PM", category: "personal" },
    { title: "Travel: Create packing checklist for first international solo trip", category: "creative" },
    { title: "Filmmaking: Edit 3-minute cinematic draft of local dynamics", category: "creative" },
    { title: "Photography: Practice compositional framing during a walk", category: "creative" },
    { title: "Travel: Research coworking hubs and internet in digital nomad hubs", category: "creative" },
    { title: "Photography: Post architectural photos analyzing urban layouts", category: "creative" },
    { title: "Travel: Plan logistics for 4-day solo motorbike journey", category: "creative" }
  ],
  phase4: [
    { title: "Exploits: Spend 2 hours researching zero-day in public software", category: "learning" },
    { title: "Exploits: Build custom fuzzing script in Go/Python to test services", category: "learning" },
    { title: "Research: Draft technical outline for DEF CON or Nullcon submission", category: "learning" },
    { title: "Research: Review security features of IoT smart home firmware dump", category: "learning" },
    { title: "Consulting: Draft security audit proposal for mock corporate client", category: "learning" },
    { title: "Consulting: Spend 1 hour optimizing personal consulting website", category: "learning" },
    { title: "CVE: Search for undocumented API features in open-source to request CVEs", category: "learning" },
    { title: "CVE: Document clean proof-of-concept for local privesc bug", category: "learning" },
    { title: "Learning: Build custom kernel-level hook simulator in sandboxed Win", category: "learning" },
    { title: "Learning: Analyze and bypass modern commercial EDR in custom lab", category: "learning" },
    { title: "Learning: Study hardware security bypasses for secure boot on ARM", category: "learning" },
    { title: "Learning: Spend 1.5 hours coding custom C2 agent in Go", category: "learning" },
    { title: "Learning: Document complex AD forest-trust evasion paths in vault", category: "learning" },
    { title: "Learning: Complete 2 advanced reverse engineering challenges on Crackmes", category: "learning" },
    { title: "Learning: Set up local honeypot and analyze incoming automated scans", category: "learning" },
    { title: "Learning: Review how modern hardware debuggers operate on logic signals", category: "learning" },
    { title: "Learning: Write custom threat-intel brief based on recent actor campaigns", category: "learning" },
    { title: "Learning: Spend 1 hour studying elliptic curve cryptography", category: "learning" },
    { title: "FIRE: Audit entire net worth, SIP accounts, and secondary income", category: "personal" },
    { title: "Revenue: Review passive remote income channels performance", category: "personal" },
    { title: "Mentoring: Conduct 1-hour active technical mentorship session", category: "personal" },
    { title: "Wellness: Spend 1 entire day completely offline in nature", category: "personal" },
    { title: "Stoicism: Read deep philosophy on life balance and write 10-year view", category: "personal" },
    { title: "Fitness: Complete major physical milestone workout", category: "personal" },
    { title: "Finances: Verify automatic SIP payments are optimized", category: "personal" },
    { title: "Habit: Practice sensory silence for 15 minutes upon waking", category: "personal" },
    { title: "Travel: Map out itinerary for 3-week road trip across Europe or Japan", category: "creative" },
    { title: "Creative: Select and compile 20 of your best travel photos into book draft", category: "creative" },
    { title: "Filmmaking: Outline script and storyboard for cybersecurity documentary", category: "creative" },
    { title: "Photography: Practice landscape long-exposure shots at dawn", category: "creative" },
    { title: "Travel: Research logistics for 4-week slow-travel stay in South America", category: "creative" },
    { title: "Creative: Document firmware dumping process into visual tutorial", category: "creative" }
  ]
};

export const ROADMAP_DATA = roadmapData;
