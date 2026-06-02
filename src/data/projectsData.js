// src/data/projectsData.js
//
// CHANGE LOG:
// - portswiggerProject ADDED: PortSwigger labs were scattered across the roadmap
//   weekly tasks but never tracked as a project. AppSec Engineer applications need
//   this tracked formally. 24 tasks covering server-side, client-side, and advanced.
// - portfolioProject ADDED: yashgulatii.pages.dev is a live job application asset.
//   It was referenced nowhere in the project data. Now tracked with explicit tasks.
// - cloudScannerProject: Added cost warning comment. AWS free tier has billing risk
//   with misconfigured resources. Do not start this before employment.
// - adLabProject: Minor fix on ad-t11 double space in title string.
// - Threat Intel and Cloud Scanner remain QUEUED. Do not start either until
//   AD Lab is 80%+ complete and the job search has active interview traction.

export const adLabProject = {
  id: 'ad-lab',
  title: 'AD Attack and Detection Lab',
  description: 'Build a full Active Directory attack and detection lab using VirtualBox, Windows Server 2022, Windows 10, Kali Linux, and Splunk SIEM.',
  defaultStatus: 'ACTIVE',
  tasks: [
    { id: 'ad-t01', chainIndex: 0, phase: 'SETUP', title: 'Install VirtualBox and configure host-only network adapter', estimatedMinutes: 45, xpReward: 40 },
    { id: 'ad-t02', chainIndex: 1, phase: 'SETUP', title: 'Download and verify Windows Server 2022 evaluation ISO', estimatedMinutes: 20, xpReward: 20 },
    { id: 'ad-t03', chainIndex: 2, phase: 'SETUP', title: 'Create and configure Windows Server 2022 VM in VirtualBox', estimatedMinutes: 60, xpReward: 50 },
    { id: 'ad-t04', chainIndex: 3, phase: 'SETUP', title: 'Promote server to Domain Controller and create the tacnet.local domain', estimatedMinutes: 90, xpReward: 75 },
    { id: 'ad-t05', chainIndex: 4, phase: 'SETUP', title: 'Create Windows 10 client VM and join it to the domain', estimatedMinutes: 60, xpReward: 50 },
    { id: 'ad-t06', chainIndex: 5, phase: 'SETUP', title: 'Install Kali Linux VM and configure host-only adapter for same subnet', estimatedMinutes: 45, xpReward: 40 },
    { id: 'ad-t07', chainIndex: 6, phase: 'SIEM', title: 'Download and install Splunk Enterprise on Ubuntu server VM', estimatedMinutes: 60, xpReward: 60 },
    { id: 'ad-t08', chainIndex: 7, phase: 'SIEM', title: 'Install Splunk Universal Forwarder on Windows Server and configure inputs', estimatedMinutes: 45, xpReward: 50 },
    { id: 'ad-t09', chainIndex: 8, phase: 'SIEM', title: 'Install Splunk Universal Forwarder on Windows 10 client', estimatedMinutes: 30, xpReward: 40 },
    { id: 'ad-t10', chainIndex: 9, phase: 'SIEM', title: 'Verify both forwarders send Windows Event Logs to Splunk and create index', estimatedMinutes: 30, xpReward: 50 },
    // FIXED: removed double space before "from Kali"
    { id: 'ad-t11', chainIndex: 10, phase: 'RECONNAISSANCE', title: 'Run BloodHound CE and SharpHound from Kali to map full AD structure', estimatedMinutes: 60, xpReward: 70 },
    { id: 'ad-t12', chainIndex: 11, phase: 'RECONNAISSANCE', title: 'Enumerate AD users and groups using enum4linux and rpcclient from Kali', estimatedMinutes: 30, xpReward: 50 },
    { id: 'ad-t13', chainIndex: 12, phase: 'RECONNAISSANCE', title: 'Perform LDAP enumeration with ldapsearch and document all findings in Obsidian', estimatedMinutes: 45, xpReward: 55 },
    { id: 'ad-t14', chainIndex: 13, phase: 'RECONNAISSANCE', title: 'Identify privilege escalation paths using BloodHound attack graph', estimatedMinutes: 45, xpReward: 65 },
    { id: 'ad-t15', chainIndex: 14, phase: 'ATTACKS', title: 'Execute brute-force RDP with Hydra and confirm detection via Event ID 4625 in Splunk', estimatedMinutes: 60, xpReward: 80 },
    { id: 'ad-t16', chainIndex: 15, phase: 'ATTACKS', title: 'Perform Kerberoasting using Impacket GetUserSPNs.py and capture TGS ticket', estimatedMinutes: 45, xpReward: 85 },
    { id: 'ad-t17', chainIndex: 16, phase: 'ATTACKS', title: 'Crack captured Kerberoast hash offline using Hashcat with rockyou.txt', estimatedMinutes: 30, xpReward: 70 },
    { id: 'ad-t18', chainIndex: 17, phase: 'ATTACKS', title: 'Execute Pass-the-Hash with Mimikatz and detect via Event ID 4624 logon type 3', estimatedMinutes: 60, xpReward: 90 },
    { id: 'ad-t19', chainIndex: 18, phase: 'ATTACKS', title: 'Perform DCSync attack using Impacket secretsdump.py to dump NTDS hashes', estimatedMinutes: 45, xpReward: 95 },
    { id: 'ad-t20', chainIndex: 19, phase: 'ATTACKS', title: 'Execute Pass-the-Ticket and observe lateral movement in Splunk telemetry', estimatedMinutes: 60, xpReward: 95 },
    { id: 'ad-t21', chainIndex: 20, phase: 'DETECTION', title: 'Build Splunk dashboard with detection panels covering all six attack types', estimatedMinutes: 90, xpReward: 100 },
    { id: 'ad-t22', chainIndex: 21, phase: 'DETECTION', title: 'Write Splunk saved search detection rules for each attack with alert thresholds', estimatedMinutes: 60, xpReward: 85 },
    { id: 'ad-t23', chainIndex: 22, phase: 'DETECTION', title: 'Write complete lab documentation in Obsidian covering every attack and detection', estimatedMinutes: 120, xpReward: 100 }
  ]
};

// ADDED: PortSwigger was referenced in nearly every Phase 1 week but never tracked
// as a project. For an AppSec Engineer target, PortSwigger completion is your
// primary interview proof. It needs milestones, not scattered weekly tasks.
export const portswiggerProject = {
  id: 'portswigger',
  title: 'PortSwigger Web Security Academy',
  description: 'Systematic completion of PortSwigger labs covering server-side, client-side, and advanced web vulnerabilities. Primary evidence base for AppSec Engineer applications.',
  defaultStatus: 'ACTIVE',
  tasks: [
    { id: 'ps-t01', chainIndex: 0, phase: 'SERVER-SIDE', title: 'SQL Injection — complete all apprentice labs', estimatedMinutes: 90, xpReward: 60 },
    { id: 'ps-t02', chainIndex: 1, phase: 'SERVER-SIDE', title: 'SQL Injection — complete 3 practitioner labs', estimatedMinutes: 120, xpReward: 75 },
    { id: 'ps-t03', chainIndex: 2, phase: 'SERVER-SIDE', title: 'Authentication — complete all apprentice labs', estimatedMinutes: 90, xpReward: 60 },
    { id: 'ps-t04', chainIndex: 3, phase: 'SERVER-SIDE', title: 'Authentication — complete 3 practitioner labs', estimatedMinutes: 120, xpReward: 75 },
    { id: 'ps-t05', chainIndex: 4, phase: 'SERVER-SIDE', title: 'Path traversal — complete all labs', estimatedMinutes: 60, xpReward: 55 },
    { id: 'ps-t06', chainIndex: 5, phase: 'SERVER-SIDE', title: 'Command injection — complete all labs', estimatedMinutes: 60, xpReward: 55 },
    { id: 'ps-t07', chainIndex: 6, phase: 'SERVER-SIDE', title: 'Business logic — complete all apprentice and practitioner labs', estimatedMinutes: 120, xpReward: 70 },
    { id: 'ps-t08', chainIndex: 7, phase: 'SERVER-SIDE', title: 'Information disclosure — complete all labs', estimatedMinutes: 60, xpReward: 50 },
    { id: 'ps-t09', chainIndex: 8, phase: 'SERVER-SIDE', title: 'Access control and IDOR — complete all labs', estimatedMinutes: 120, xpReward: 80 },
    { id: 'ps-t10', chainIndex: 9, phase: 'SERVER-SIDE', title: 'SSRF — complete all apprentice and practitioner labs', estimatedMinutes: 120, xpReward: 75 },
    { id: 'ps-t11', chainIndex: 10, phase: 'SERVER-SIDE', title: 'XXE injection — complete all labs', estimatedMinutes: 90, xpReward: 65 },
    { id: 'ps-t12', chainIndex: 11, phase: 'CLIENT-SIDE', title: 'XSS — complete all apprentice labs', estimatedMinutes: 90, xpReward: 60 },
    { id: 'ps-t13', chainIndex: 12, phase: 'CLIENT-SIDE', title: 'XSS — complete 4 practitioner labs', estimatedMinutes: 150, xpReward: 80 },
    { id: 'ps-t14', chainIndex: 13, phase: 'CLIENT-SIDE', title: 'CSRF — complete all labs', estimatedMinutes: 90, xpReward: 65 },
    { id: 'ps-t15', chainIndex: 14, phase: 'CLIENT-SIDE', title: 'CORS — complete all labs', estimatedMinutes: 60, xpReward: 60 },
    { id: 'ps-t16', chainIndex: 15, phase: 'CLIENT-SIDE', title: 'Clickjacking — complete all labs', estimatedMinutes: 60, xpReward: 50 },
    { id: 'ps-t17', chainIndex: 16, phase: 'CLIENT-SIDE', title: 'DOM-based vulnerabilities — complete all labs', estimatedMinutes: 90, xpReward: 65 },
    { id: 'ps-t18', chainIndex: 17, phase: 'ADVANCED', title: 'HTTP request smuggling — complete all apprentice labs', estimatedMinutes: 120, xpReward: 85 },
    { id: 'ps-t19', chainIndex: 18, phase: 'ADVANCED', title: 'OAuth authentication — complete all labs', estimatedMinutes: 120, xpReward: 85 },
    { id: 'ps-t20', chainIndex: 19, phase: 'ADVANCED', title: 'JWT attacks — complete all labs', estimatedMinutes: 120, xpReward: 85 },
    { id: 'ps-t21', chainIndex: 20, phase: 'ADVANCED', title: 'API testing and mass assignment — complete all labs', estimatedMinutes: 90, xpReward: 80 },
    { id: 'ps-t22', chainIndex: 21, phase: 'ADVANCED', title: 'GraphQL API vulnerabilities — complete all labs', estimatedMinutes: 90, xpReward: 75 },
    { id: 'ps-t23', chainIndex: 22, phase: 'ADVANCED', title: 'Web cache poisoning — complete all apprentice labs', estimatedMinutes: 90, xpReward: 80 },
    { id: 'ps-t24', chainIndex: 23, phase: 'REPORT', title: 'Write a full VAPT-style report for your 3 best PortSwigger findings', estimatedMinutes: 120, xpReward: 90 }
  ]
};

// ADDED: Portfolio site is a live job application asset referenced throughout the
// roadmap but tracked nowhere in the project data. Explicit tasks make it
// maintainable and ensure nothing critical (IDOR case study, AD write-up) stays
// unpublished when you're actively applying.
export const portfolioProject = {
  id: 'portfolio',
  title: 'Portfolio Site — yashgulatii.pages.dev',
  description: 'Live portfolio maintained as a primary job application asset. Requires targeted updates as projects complete and credentials are earned.',
  defaultStatus: 'ACTIVE',
  tasks: [
    { id: 'pf-t01', chainIndex: 0, phase: 'CORE', title: 'Verify all 7 tool cards display correctly with educational use disclaimers on offensive tools', estimatedMinutes: 30, xpReward: 25 },
    { id: 'pf-t02', chainIndex: 1, phase: 'CORE', title: 'Publish Campus Track IDOR case study page with CVSS 8.9 scoring documentation and remediation', estimatedMinutes: 90, xpReward: 70 },
    { id: 'pf-t03', chainIndex: 2, phase: 'CORE', title: 'Add MobiKwik VAPT report summary page with methodology, scope, and findings overview', estimatedMinutes: 60, xpReward: 55 },
    { id: 'pf-t04', chainIndex: 3, phase: 'CORE', title: 'Link ATS-clean resume PDF from landing page — SOC Analyst and AppSec Engineer versions both', estimatedMinutes: 30, xpReward: 30 },
    { id: 'pf-t05', chainIndex: 4, phase: 'CORE', title: 'Confirm landing page copy states both target roles: SOC Analyst and AppSec Engineer clearly', estimatedMinutes: 20, xpReward: 20 },
    { id: 'pf-t06', chainIndex: 5, phase: 'PROJECTS', title: 'Publish AD Lab project page: architecture diagram, attack list, Splunk dashboard screenshot', estimatedMinutes: 120, xpReward: 80 },
    { id: 'pf-t07', chainIndex: 6, phase: 'PROJECTS', title: 'Add PortSwigger progress section: completed lab count, 3 top findings documented in plain text', estimatedMinutes: 60, xpReward: 50 },
    { id: 'pf-t08', chainIndex: 7, phase: 'CREDENTIALS', title: 'Add Google Cybersecurity Certificate and CNSP badges with verification links', estimatedMinutes: 30, xpReward: 25 },
    { id: 'pf-t09', chainIndex: 8, phase: 'CREDENTIALS', title: 'Add TryHackMe top 2% badge with direct profile link', estimatedMinutes: 20, xpReward: 20 },
    { id: 'pf-t10', chainIndex: 9, phase: 'CREDENTIALS', title: 'Add Security+ badge and Credly verification link (complete after exam)', estimatedMinutes: 20, xpReward: 30 },
    { id: 'pf-t11', chainIndex: 10, phase: 'POLISH', title: 'Run Lighthouse audit — fix any performance or accessibility issues above failure threshold', estimatedMinutes: 45, xpReward: 35 },
    { id: 'pf-t12', chainIndex: 11, phase: 'POLISH', title: 'Test all links, verify mobile layout, confirm all project pages load without errors', estimatedMinutes: 30, xpReward: 25 }
  ]
};

export const threatIntelProject = {
  id: 'threat-intel',
  title: 'Threat Intel Correlation Engine',
  description: 'Python tool that ingests IOCs from AlienVault OTX, abuse.ch, and VirusTotal then correlates them against local log files to flag matches with confidence scoring.',
  // QUEUED: Do not start until AD Lab is 80%+ complete AND the job search has
  // active interview traction. Time cost is 16 tasks × 45-90 min each.
  defaultStatus: 'QUEUED',
  tasks: [
    { id: 'ti-t01', chainIndex: 0, phase: 'DESIGN', title: 'Define tool requirements — input sources, IOC types, output report format', estimatedMinutes: 30, xpReward: 30 },
    { id: 'ti-t02', chainIndex: 1, phase: 'DESIGN', title: 'Sketch architecture diagram — ingestion layer, normalizer, correlator, reporter', estimatedMinutes: 30, xpReward: 35 },
    { id: 'ti-t03', chainIndex: 2, phase: 'DESIGN', title: 'Set up Python venv and project folder structure with requirements.txt', estimatedMinutes: 20, xpReward: 25 },
    { id: 'ti-t04', chainIndex: 3, phase: 'INGESTION', title: 'Write AlienVault OTX API connector to pull IOCs by pulse subscription', estimatedMinutes: 60, xpReward: 60 },
    { id: 'ti-t05', chainIndex: 4, phase: 'INGESTION', title: 'Write abuse.ch URLhaus feed downloader to pull current malicious URL and hash list', estimatedMinutes: 45, xpReward: 55 },
    { id: 'ti-t06', chainIndex: 5, phase: 'INGESTION', title: 'Write VirusTotal API wrapper to check file hashes on demand with rate limiting', estimatedMinutes: 60, xpReward: 65 },
    { id: 'ti-t07', chainIndex: 6, phase: 'INGESTION', title: 'Normalize all three source outputs into a shared IOC schema with type and confidence', estimatedMinutes: 60, xpReward: 70 },
    { id: 'ti-t08', chainIndex: 7, phase: 'CORRELATION', title: 'Write log file parser to extract IPs, domains, URLs, and file hashes from raw logs', estimatedMinutes: 60, xpReward: 70 },
    { id: 'ti-t09', chainIndex: 8, phase: 'CORRELATION', title: 'Build correlation engine that matches log-extracted IOCs against the normalized feed', estimatedMinutes: 90, xpReward: 85 },
    { id: 'ti-t10', chainIndex: 9, phase: 'CORRELATION', title: 'Add confidence scoring — exact match scores 1.0, partial or fuzzy match scores lower', estimatedMinutes: 45, xpReward: 65 },
    { id: 'ti-t11', chainIndex: 10, phase: 'CORRELATION', title: 'Build JSON report formatter that writes all matched IOCs with context and confidence', estimatedMinutes: 30, xpReward: 50 },
    { id: 'ti-t12', chainIndex: 11, phase: 'INTERFACE', title: 'Build CLI interface using argparse with flags for source selection and log file path', estimatedMinutes: 30, xpReward: 45 },
    { id: 'ti-t13', chainIndex: 12, phase: 'INTERFACE', title: 'Add colour-coded terminal output using the rich library for match severity', estimatedMinutes: 30, xpReward: 35 },
    { id: 'ti-t14', chainIndex: 13, phase: 'INTERFACE', title: 'Write README with usage examples, architecture diagram, and sample output screenshot', estimatedMinutes: 45, xpReward: 40 },
    { id: 'ti-t15', chainIndex: 14, phase: 'DEPLOY', title: 'Test tool against a prepared log file containing 10 known malicious indicators', estimatedMinutes: 45, xpReward: 70 },
    { id: 'ti-t16', chainIndex: 15, phase: 'DEPLOY', title: 'Push to GitHub with proper description and add to portfolio at yashgulatii.pages.dev', estimatedMinutes: 30, xpReward: 50 }
  ]
};

export const cloudScannerProject = {
  id: 'cloud-scanner',
  title: 'Cloud Misconfiguration Scanner (AWS/GCP)',
  description: 'Python scanner that audits AWS and GCP accounts for critical misconfigurations — public S3 buckets, overpermissioned IAM, exposed snapshots — and outputs a severity-scored HTML report.',
  // QUEUED: Do not start before employment. Tasks cs-t04 and cs-t05 require
  // intentionally misconfigured AWS resources. Free tier does not protect against
  // unexpected billing from misconfigured setups. Start only once you have income.
  defaultStatus: 'QUEUED',
  tasks: [
    { id: 'cs-t01', chainIndex: 0, phase: 'RESEARCH', title: 'Study AWS IAM misconfig patterns — wildcard policies, privilege escalation paths', estimatedMinutes: 45, xpReward: 40 },
    { id: 'cs-t02', chainIndex: 1, phase: 'RESEARCH', title: 'Study S3 bucket misconfig patterns — public ACL, no-block-public-access, bucket policy', estimatedMinutes: 30, xpReward: 35 },
    { id: 'cs-t03', chainIndex: 2, phase: 'RESEARCH', title: 'Study GCP IAM and Cloud Storage misconfiguration patterns and audit methods', estimatedMinutes: 45, xpReward: 40 },
    { id: 'cs-t04', chainIndex: 3, phase: 'SETUP', title: 'Create AWS free-tier account and configure boto3 credentials in local environment', estimatedMinutes: 30, xpReward: 30 },
    { id: 'cs-t05', chainIndex: 4, phase: 'SETUP', title: 'Create intentionally misconfigured S3 bucket and overpermissioned IAM role for testing', estimatedMinutes: 45, xpReward: 50 },
    { id: 'cs-t06', chainIndex: 5, phase: 'SETUP', title: 'Set up Python project with boto3 and google-cloud-storage SDK installed in venv', estimatedMinutes: 30, xpReward: 35 },
    { id: 'cs-t07', chainIndex: 6, phase: 'AWS CHECKS', title: 'Write check for public S3 buckets by reading bucket ACL and bucket policy via API', estimatedMinutes: 60, xpReward: 65 },
    { id: 'cs-t08', chainIndex: 7, phase: 'AWS CHECKS', title: 'Write check for overpermissioned IAM policies using IAM policy simulator and get-policy', estimatedMinutes: 60, xpReward: 70 },
    { id: 'cs-t09', chainIndex: 8, phase: 'AWS CHECKS', title: 'Write check for public EC2 snapshots and unencrypted EBS volumes in all regions', estimatedMinutes: 45, xpReward: 60 },
    { id: 'cs-t10', chainIndex: 9, phase: 'AWS CHECKS', title: 'Write check for security groups allowing 0.0.0.0/0 inbound on ports 22, 3389, 445', estimatedMinutes: 45, xpReward: 60 },
    { id: 'cs-t11', chainIndex: 10, phase: 'GCP CHECKS', title: 'Write check for public GCS buckets using allUsers ACL binding in storage API', estimatedMinutes: 45, xpReward: 60 },
    { id: 'cs-t12', chainIndex: 11, phase: 'GCP CHECKS', title: 'Write check for GCP service accounts with roles/owner or roles/editor at project level', estimatedMinutes: 45, xpReward: 65 },
    { id: 'cs-t13', chainIndex: 12, phase: 'GCP CHECKS', title: 'Write check for GCP VPC firewall rules allowing unrestricted ingress on sensitive ports', estimatedMinutes: 45, xpReward: 60 },
    { id: 'cs-t14', chainIndex: 13, phase: 'REPORTING', title: 'Build severity scorer — CRITICAL, HIGH, MEDIUM, LOW — based on finding risk weight', estimatedMinutes: 30, xpReward: 50 },
    { id: 'cs-t15', chainIndex: 14, phase: 'REPORTING', title: 'Build HTML report generator that outputs a formatted findings table with severity colours', estimatedMinutes: 60, xpReward: 70 },
    { id: 'cs-t16', chainIndex: 15, phase: 'REPORTING', title: 'Write documentation, add sample report to README, push to GitHub and portfolio', estimatedMinutes: 45, xpReward: 50 }
  ]
};

export const allProjects = [
  adLabProject,
  portswiggerProject,
  portfolioProject,
  threatIntelProject,
  cloudScannerProject
];

allProjects.forEach(proj => {
  proj.linkedTaskIds = proj.tasks.map(t => t.id);
  proj.milestones = [...new Set(proj.tasks.map(t => t.phase || 'General'))];
});

export default allProjects;

export const PROJECTS = allProjects;
export const projectsData = allProjects;