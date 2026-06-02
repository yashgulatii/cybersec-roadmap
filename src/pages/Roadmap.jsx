// src/pages/Roadmap.jsx
// Purpose: Renders the redesigned, interactive YASH-OS Cybersecurity Career Roadmap page with two-panel layout, accordions, vertical track timelines, and dynamic AI credibility verifications.

import React, { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../store/appStore';
import { useGroq } from '../hooks/useGroq';
import { roadmapData } from '../data/roadmapData';
import PhaseCard from '../components/ui/PhaseCard';
import CategoryTag from '../components/ui/CategoryTag';
import ProgressBar from '../components/ui/ProgressBar';

// Cross-cutting static tracks data
const TRACKS_DATA = {
  daily_rhythm: {
    id: "daily_rhythm",
    title: "Daily Rhythm",
    milestones: [
      { title: "AM Focus Session", timeframe: "Daily 08:00 - 12:00", description: "Deep focus study, lab building, and bug hunting offline without distractions." },
      { title: "Shift Duty Duty", timeframe: "Daily 14:00 - 22:00", description: "Active SOC shift duties, threat triage, playbook execution, and incident analysis." },
      { title: "PM Review & Debrief", timeframe: "Daily 22:30 - 23:00", description: "After-action reflection, task check-off logging, and drafting priorities for the next day." }
    ]
  },
  certifications: {
    id: "certifications",
    title: "Certifications Timeline",
    milestones: [
      { title: "CompTIA Security+", timeframe: "Phase 1 (Months 2-3)", description: "Acquire foundational network security architecture and defensive concepts." },
      { title: "Splunk Certified User", timeframe: "Phase 1 (Months 5-6)", description: "Master SIEM log queries, threat hunt dashboards, and analytics reporting." },
      { title: "OSCP Pentesting Sprint", timeframe: "Phase 2 (Months 12-18)", description: "Master privilege escalation, network exploitation, and pass the 24-hr proctored exam." },
      { title: "CRTO Red Team Operator", timeframe: "Phase 3 (Year 3)", description: "Master active directory exploitation, lateral movement, and Cobalt Strike operation." },
      { title: "OSWE Web Hacking Expert", timeframe: "Phase 3 (Year 4)", description: "Master white-box source code analysis, auth bypasses, and custom exploit coding." }
    ]
  },
  bug_bounty: {
    id: "bug_bounty",
    title: "Bug Bounty Track",
    milestones: [
      { title: "CVSS 8.9 Production IDOR", timeframe: "Completed", description: "Discovered and safely disclosed a critical IDOR vulnerability on a live production target." },
      { title: "HackerOne VDP Invitation", timeframe: "Phase 1 (Month 6)", description: "Earn private program boarding invites through high-quality vulnerability submissions." },
      { title: "Consistent Bug Bounty Yields", timeframe: "Phase 2 (Month 18)", description: "Submit 2 verified valid vulnerabilities per month on private scopes." },
      { title: "Global Rank Top 500", timeframe: "Phase 3 (Year 3)", description: "Climb into the top 500 elite security researchers on global leaderboard rankings." }
    ]
  },
  resources: {
    id: "resources",
    title: "Resources & Tech Stack",
    milestones: [
      { title: "AD DC VirtualBox Homelab", timeframe: "Completed", description: "VirtualBox domain setup including domain controller, Kali, and SIEM logging." },
      { title: "PortSwigger Web Academy", timeframe: "Ongoing", description: "Complete advanced web vulnerability path labs (SQLi, XSS, CSRF, SSRF)." },
      { title: "Obsidian YASH-OS Vault", timeframe: "Ongoing", description: "Maintain a structured personal knowledge vault capturing tech drafts and logs." },
      { title: "GitHub Threat Intel Arsenal", timeframe: "Phase 1 (Month 6)", description: "Launch open-source repository containing log parses and threat hunting tools." }
    ]
  },
  personal_dev: {
    id: "personal_dev",
    title: "Personal Development",
    milestones: [
      { title: "Sensory Silence Routine", timeframe: "Daily (AM)", description: "Commit to 10-15 minutes of quiet reflection offline upon waking to foster discipline." },
      { title: "Cardio & Strength Conditioning", timeframe: "3x Weekly", description: "Engage in physical workouts to balance the sedentary nature of desk-heavy shifts." },
      { title: "Weekly Operations Audit (AAR)", timeframe: "Weekly (Sunday)", description: "Perform deep-dive after-action reviews to evaluate weekly learning efficiency." },
      { title: "Mentoring & Writing", timeframe: "Phase 3-4 (Year 5+)", description: "Provide actionable guidance to junior analysts to compound leadership skills." }
    ]
  },
  financial: {
    id: "financial",
    title: "Financial Milestones",
    milestones: [
      { title: "Emergency Reserve Fund", timeframe: "Phase 1 (Month 3)", description: "Secure a fully funded 3-month living emergency cash reserve." },
      { title: "Compounding Index SIP", timeframe: "Phase 1 (Month 12)", description: "Initiate automatic monthly systematic investment plans (SIPs) in low-cost index funds." },
      { title: "First ₹5 Lakhs Net Worth", timeframe: "Phase 2 (Year 2)", description: "Reach initial capital accumulation target through savings and side income." },
      { title: "40% FIRE Asset Target", timeframe: "Phase 3 (Year 5)", description: "Cross the 40% threshold of the Financial Independence Retire Early portfolio target." },
      { title: "Complete Financial Freedom", timeframe: "Phase 4 (Year 10)", description: "Reach self-sustaining net worth allowing optional consulting and nomadic flexibility." }
    ]
  },
  travel: {
    id: "travel",
    title: "Travel Milestones",
    milestones: [
      { title: "Solo Rail Exploration", timeframe: "Phase 1 (Month 6)", description: "Plan and navigate a solo budget train trip to McLeod Ganj or Jaipur." },
      { title: "Himalayan Motorbike Journey", timeframe: "Phase 2 (Year 2)", description: "Navigate high passes in Ladakh on a 4-day solo bike ride." },
      { title: "International Solo Adventure", timeframe: "Phase 3 (Year 3)", description: "Explore digital nomad hubs in Thailand, Vietnam, or Bali independently." },
      { title: "Nomadic Slow Living", timeframe: "Phase 4 (Year 6+)", description: "Spend 4+ weeks traveling slowly and working remotely in South America, Europe, or Japan." }
    ]
  },
  creative: {
    id: "creative",
    title: "Creative Track",
    milestones: [
      { title: "Neon Cyberpunk Photography", timeframe: "Ongoing", description: "Build a street photography style capturing high-contrast light reflections and night dynamics." },
      { title: "Atmospheric Sound Design Reels", timeframe: "Ongoing", description: "Produce cinematic travel films with immersive soundscapes and custom color grades." },
      { title: "LinkedIn Visual Storytelling", timeframe: "Phase 2 (Year 2)", description: "Share travel photo essays analyzing local cultural atmospheres." },
      { title: "Cyberpunk Street Photobook", timeframe: "Phase 4 (Year 5)", description: "Compile and publish the best 50 street photography shots in a dedicated book draft." }
    ]
  }
};

const BRANCHES_META = {
  career_applications: {
    id: 'career_applications',
    name: 'CAREER & APPLICATIONS',
    match: (task) => {
      const cat = (task.category || '').toUpperCase();
      return cat === 'CAREER' || cat === 'OPS' || cat === 'COMMS';
    }
  },
  learning_certs: {
    id: 'learning_certs',
    name: 'LEARNING & CERTS',
    match: (task) => {
      const cat = (task.category || '').toUpperCase();
      return cat === 'LEARNING' || cat === 'LABS' || cat === 'ROADMAP' || cat === 'INTEL';
    }
  },
  ad_lab_projects: {
    id: 'ad_lab_projects',
    name: 'AD LAB & PROJECTS',
    match: (task) => {
      const cat = (task.category || '').toUpperCase();
      const linked = task.linkedProject || '';
      return cat === 'LAB' || cat === 'PROJECT' || ['ad-lab', 'threat-intel', 'cloud-scanner', 'portswigger', 'portfolio'].includes(linked);
    }
  },
  bug_bounty_track: {
    id: 'bug_bounty_track',
    name: 'BUG BOUNTY TRACK',
    match: (task) => {
      const cat = (task.category || '').toUpperCase();
      return cat === 'BUG BOUNTY' || cat.includes('BUG') || cat.includes('BOUNTY');
    }
  },
  personal_development: {
    id: 'personal_development',
    name: 'PERSONAL DEVELOPMENT',
    match: (task) => {
      const cat = (task.category || '').toUpperCase();
      return cat === 'PERSONAL' || cat === 'DISCIPLINE' || cat === 'CREATIVE' || cat === 'TRAVEL';
    }
  },
  physical_mental: {
    id: 'physical_mental',
    name: 'PHYSICAL & MENTAL',
    match: (task) => {
      const cat = (task.category || '').toUpperCase();
      return cat === 'PHYSICAL' || cat === 'SOCIAL';
    }
  }
};

const isMilestoneCompleted = (m, completedTaskIds) => {
  if (m.timeframe && (m?.timeframe || '').toUpperCase() === 'COMPLETED') return true;
  const titleUpper = (m.title || '').toUpperCase();
  let matchedTasks = [];
  
  ['phase1', 'phase2', 'phase3', 'phase4'].forEach(pId => {
    const phase = roadmapData[pId];
    if (!phase) return;
    const sections = phase.weeks || phase.months || phase.quarters || phase.years || [];
    sections.forEach(sec => {
      (sec.tasks || []).forEach(t => {
        if ((t.title || '').toUpperCase().includes(titleUpper) || (t.linkedSkill && (t.linkedSkill || '').toUpperCase().includes(titleUpper))) {
          matchedTasks.push(t.id);
        }
      });
    });
  });

  if (matchedTasks.length > 0) {
    return matchedTasks.every(id => completedTaskIds.includes(id));
  }
  return false;
};

const getAllPhaseTasks = (phaseId) => {
  const phase = roadmapData[phaseId];
  if (!phase) return [];
  const tasks = [];
  const sectionsList = phase.weeks || phase.months || phase.quarters || phase.years || [];
  sectionsList.forEach(sec => {
    const secLabel = sec.weekNumber ? `Week ${sec.weekNumber}`
                   : sec.monthNumber ? `Month ${sec.monthNumber}`
                   : sec.quarterNumber ? `Quarter ${sec.quarterNumber}`
                   : `Year ${sec.yearNumber}`;
    (sec.tasks || []).forEach(task => {
      tasks.push({
        ...task,
        secLabel
      });
    });
  });
  return tasks;
};

export default function Roadmap() {
  const {
    roadmapState,
    setRoadmapState,
    stateToday,
    dailyState,
    handleToggleMission,
    profile,
    chainProgress,
    syncWithServer,
    isDayClosed
  } = useAppStore();

  const { callGroq, response: aiResponse, isLoading: aiLoading, error: aiError } = useGroq();

  // Local navigation state (defaulting to Phase 1)
  const [selectedTopic, setSelectedTopic] = useState('phase1');
  const [isAiReviewExpanded, setIsAiReviewExpanded] = useState(true);
  const [expandedBranch, setExpandedBranch] = useState(null);

  useEffect(() => {
    setExpandedBranch(null);
  }, [selectedTopic]);

  const isPhase = selectedTopic.startsWith('phase');

  const activePhaseObj = useMemo(() => {
    return roadmapData[selectedTopic];
  }, [selectedTopic]);

  const allPhaseTasks = useMemo(() => {
    if (!isPhase || !activePhaseObj) return [];
    return getAllPhaseTasks(selectedTopic);
  }, [selectedTopic, isPhase, activePhaseObj]);

  const selectedPhaseStats = useMemo(() => {
    if (!isPhase) return { completed: 0, total: 0 };
    const completedSet = new Set(stateToday?.completedTaskIds || []);
    let completed = 0;
    allPhaseTasks.forEach(t => {
      if (completedSet.has(t.id)) completed++;
    });
    return { completed, total: allPhaseTasks.length };
  }, [allPhaseTasks, isPhase, stateToday?.completedTaskIds]);

  const activePhaseProgress = useMemo(() => {
    if (selectedPhaseStats.total === 0) return 0;
    return Math.round((selectedPhaseStats.completed / selectedPhaseStats.total) * 100);
  }, [selectedPhaseStats]);

  const phaseBranches = useMemo(() => {
    if (!isPhase) return [];

    const branches = {
      career_applications: [],
      learning_certs: [],
      ad_lab_projects: [],
      bug_bounty_track: [],
      personal_development: [],
      physical_mental: []
    };

    allPhaseTasks.forEach(task => {
      if (BRANCHES_META.ad_lab_projects.match(task)) {
        branches.ad_lab_projects.push(task);
      } else if (BRANCHES_META.bug_bounty_track.match(task)) {
        branches.bug_bounty_track.push(task);
      } else if (BRANCHES_META.career_applications.match(task)) {
        branches.career_applications.push(task);
      } else if (BRANCHES_META.personal_development.match(task)) {
        branches.personal_development.push(task);
      } else if (BRANCHES_META.physical_mental.match(task)) {
        branches.physical_mental.push(task);
      } else {
        branches.learning_certs.push(task);
      }
    });

    return Object.keys(BRANCHES_META).map(key => {
      const meta = BRANCHES_META[key];
      const branchTasks = branches[key] || [];
      const completedCount = branchTasks.filter(t => dailyState?.completedTaskIds?.includes(t.id)).length;
      const totalCount = branchTasks.length;
      const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      return {
        id: meta.id,
        name: meta.name,
        tasks: branchTasks,
        completedCount,
        totalCount,
        progressPercent
      };
    }).filter(b => b.totalCount > 0);
  }, [allPhaseTasks, isPhase, dailyState?.completedTaskIds]);

  const trackMilestonesStats = useMemo(() => {
    if (isPhase) return { completed: 0, total: 0, percentage: 0 };
    const track = TRACKS_DATA[selectedTopic];
    if (!track) return { completed: 0, total: 0, percentage: 0 };

    const completedTaskIds = dailyState?.completedTaskIds || [];
    let completed = 0;
    
    track.milestones.forEach(m => {
      if (isMilestoneCompleted(m, completedTaskIds)) {
        completed++;
      }
    });

    const total = track.milestones.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  }, [selectedTopic, isPhase, dailyState?.completedTaskIds]);

  const milestonesWithStatus = useMemo(() => {
    if (isPhase) return [];
    const track = TRACKS_DATA[selectedTopic];
    if (!track) return [];

    const completedTaskIds = dailyState?.completedTaskIds || [];
    let foundCurrent = false;

    return track.milestones.map((m) => {
      const completed = isMilestoneCompleted(m, completedTaskIds);
      let current = false;
      if (!completed && !foundCurrent) {
        current = true;
        foundCurrent = true;
      }
      return {
        ...m,
        isCompleted: completed,
        isCurrent: current,
        isFuture: !completed && !current
      };
    });
  }, [selectedTopic, isPhase, dailyState?.completedTaskIds]);

  // Helper to map selected topic to store key
  const getStateKey = (topicId) => {
    if (topicId === 'phase1') return 'foundation';
    if (topicId === 'phase2') return 'momentum';
    if (topicId === 'phase3') return 'expansion';
    if (topicId === 'phase4') return 'mastery';
    return topicId; // for tracks
  };

  const storeKey = getStateKey(selectedTopic);
  const activeState = (roadmapState ?? {})[storeKey] || { progress: 0, status: 'Not Started' };

  // Calculate task counts dynamically for phase cards
  const getPhaseTaskFraction = (phaseId, completedIds = []) => {
    const phase = roadmapData[phaseId];
    if (!phase) return { completed: 0, total: 0, fractionString: "0/0 tasks" };
    
    const completedSet = new Set(completedIds);
    let total = 0;
    let completed = 0;

    if (phaseId === 'phase1' && phase.weeks) {
      phase.weeks.forEach(week => {
        week.tasks.forEach(task => {
          total++;
          if (completedSet.has(task.id)) completed++;
        });
      });
    } else if (phaseId === 'phase2' && phase.months) {
      phase.months.forEach(month => {
        month.tasks.forEach(task => {
          total++;
          if (completedSet.has(task.id)) completed++;
        });
      });
    } else if (phaseId === 'phase3' && phase.quarters) {
      phase.quarters.forEach(quarter => {
        quarter.tasks.forEach(task => {
          total++;
          if (completedSet.has(task.id)) completed++;
        });
      });
    } else if (phaseId === 'phase4' && phase.years) {
      phase.years.forEach(year => {
        year.tasks.forEach(task => {
          total++;
          if (completedSet.has(task.id)) completed++;
        });
      });
    }

    return {
      completed,
      total,
      fractionString: `${completed}/${total} tasks`
    };
  };

  // Recalculates and updates phase progress in the store on task toggling
  const handleTaskToggle = async (task, e) => {
    if (isDayClosed) return;
    
    // Perform standard appStore checklist mutation
    await handleToggleMission(task.id, task.xpReward || 0, false, null, null, e);
    
    // Safely recalculate the next progress rate from simulated post-toggled state
    const currentCompleted = dailyState?.completedTaskIds || [];
    const updatedCompletedIds = currentCompleted.includes(task.id)
      ? currentCompleted.filter(id => id !== task.id)
      : [...currentCompleted, task.id];
      
    const fraction = getPhaseTaskFraction(selectedTopic, updatedCompletedIds);
    const nextProgressVal = fraction.total > 0 ? Math.round((fraction.completed / fraction.total) * 100) : 0;
    
    const updatedState = {
      ...roadmapState,
      [storeKey]: {
        ...activeState,
        progress: nextProgressVal,
        status: nextProgressVal === 100 ? 'Complete' : (nextProgressVal === 0 ? 'Not Started' : 'In Progress')
      }
    };
    
    setRoadmapState(updatedState);
    localStorage.setItem('roadmapState', JSON.stringify(updatedState));
    syncWithServer(profile, dailyState, chainProgress);
  };



  // Time remaining estimates
  const getRemainingTimeframe = (topicId, completedIds) => {
    const phase = roadmapData[topicId];
    if (!phase) return 'N/A';
    const completedSet = new Set(completedIds);
    
    if (topicId === 'phase1' && phase.weeks) {
      const remainingWeeks = phase.weeks.filter(w => w.tasks.some(t => !completedSet.has(t.id))).length;
      return `${remainingWeeks} Weeks Remaining`;
    } else if (topicId === 'phase2' && phase.months) {
      const remainingMonths = phase.months.filter(m => m.tasks.some(t => !completedSet.has(t.id))).length;
      return `${remainingMonths} Months Remaining`;
    } else if (topicId === 'phase3' && phase.quarters) {
      const remainingQuarters = phase.quarters.filter(q => q.tasks.some(t => !completedSet.has(t.id))).length;
      return `${remainingQuarters} Quarters Remaining`;
    } else if (topicId === 'phase4' && phase.years) {
      const remainingYears = phase.years.filter(y => y.tasks.some(t => !completedSet.has(t.id))).length;
      return `${remainingYears} Years Remaining`;
    }
    return 'N/A';
  };

  // Dynamic Phase Milestone mapping
  const getPhaseMilestone = (topicId, progress) => {
    if (topicId === 'phase1') {
      if (progress < 30) return 'Initialize Obsidian vault & draft tailorable resume';
      if (progress < 70) return 'Set up AD Lab, Domain Controller & Splunk logging';
      if (progress < 100) return 'Pass CompTIA Security+ & begin active job hunting';
      return 'Gain entry-level SOC Analyst/AppSec placement';
    } else if (topicId === 'phase2') {
      if (progress < 50) return 'Master privilege escalation & read daily security writeups';
      if (progress < 100) return 'Undertake OSCP PEN-200 proctored exam study checklist';
      return 'Pass the OSCP exam and secure certification';
    } else if (topicId === 'phase3') {
      if (progress < 50) return 'Secure CRTO (Red Team Operator) certification';
      if (progress < 100) return 'Perform cloud infrastructure audits & motorbike solo travel';
      return 'Advance to senior offensive remote consulting engineer';
    } else if (topicId === 'phase4') {
      if (progress < 50) return 'IoT firmware analysis & kernel exploit development';
      if (progress < 100) return 'Nullcon/DEF CON presentation speaking slots';
      return 'Achieve Complete Financial Independence (FIRE) at Year 10';
    }
    return 'N/A';
  };

  // Localized AI credibility checks
  const handleCheckCredibility = async () => {
    let contentToAnalyze = '';
    
    if (isPhase) {
      const phase = roadmapData[selectedTopic];
      if (selectedTopic === 'phase1' && phase.weeks) {
        contentToAnalyze = `Phase 1 Foundation. Timeframe: ${phase.timeframe}. Focus topics:\n` + 
          phase.weeks.map(w => `- Week ${w.weekNumber} (${w.title}): Focus: ${w.focusArea}. Tasks: ${w.tasks.map(t => t.title).join(', ')}`).join('\n');
      } else if (selectedTopic === 'phase2' && phase.months) {
        contentToAnalyze = `Phase 2 Momentum. Timeframe: ${phase.timeframe}. Focus topics:\n` +
          phase.months.map(m => `- Month ${m.monthNumber} (${m.title}): Focus: ${m.focusArea}. Tasks: ${m.tasks.map(t => t.title).join(', ')}`).join('\n');
      } else if (selectedTopic === 'phase3' && phase.quarters) {
        contentToAnalyze = `Phase 3 Expansion. Timeframe: ${phase.timeframe}. Focus topics:\n` +
          phase.quarters.map(q => `- Quarter ${q.quarterNumber} (${q.title}): Focus: ${q.focusArea}. Tasks: ${q.tasks.map(t => t.title).join(', ')}`).join('\n');
      } else if (selectedTopic === 'phase4' && phase.years) {
        contentToAnalyze = `Phase 4 Mastery. Timeframe: ${phase.timeframe}. Focus topics:\n` +
          phase.years.map(y => `- Year ${y.yearNumber} (${y.title}): Focus: ${y.focusArea}. Tasks: ${y.tasks.map(t => t.title).join(', ')}`).join('\n');
      }
    } else {
      const track = TRACKS_DATA[selectedTopic];
      if (track) {
        contentToAnalyze = `Track: ${track.title}. Milestones:\n` +
          track.milestones.map(m => `- ${m.title} (${m.timeframe}): ${m.description}`).join('\n');
      }
    }

    const systemPrompt = "You are a senior cybersecurity career strategist specializing in the Indian market in 2026. You are reviewing a section of a 10-year personal cybersecurity career roadmap belonging to a final-year electronics student in Delhi targeting SOC Analyst and AppSec Engineer roles. They have: TryHackMe top 2%, Google Cybersecurity Certificate, CNSP, an ethical hacking internship, a real IDOR finding (CVSS 8.9) from a production app, and an AD Attack and Detection Lab in progress. Review the roadmap section provided and respond in exactly four labeled sections: ACCURATE (what holds up in 2026), NEEDS UPDATE (anything that may be outdated or unrealistic), MISSING (skills, tools, or steps not mentioned), IMPROVEMENT (one specific actionable change to make this section stronger). Be direct, specific, and honest.";
    
    try {
      await callGroq(systemPrompt, contentToAnalyze || 'No roadmap section text provided.');
      setIsAiReviewExpanded(true);
    } catch (err) {
      console.error('Failed to analyze credibility:', err);
    }
  };

  // Parses Groq Llama response into 4 distinct neon box outputs
  const parseResponse = (text) => {
    if (!text) return null;
    
    const sections = { accurate: '', needs_update: '', missing: '', improvement: '' };
    
    const idxAccurate = text.search(/accurate/i);
    const idxNeedsUpdate = text.search(/needs\s*update/i);
    const idxMissing = text.search(/missing/i);
    const idxImprovement = text.search(/improvement/i);

    const markers = [
      { key: 'accurate', idx: idxAccurate },
      { key: 'needs_update', idx: idxNeedsUpdate },
      { key: 'missing', idx: idxMissing },
      { key: 'improvement', idx: idxImprovement }
    ].filter(m => m.idx !== -1).sort((a, b) => a.idx - b.idx);

    if (markers.length === 0) {
      return {
        'ACCURATE': text,
        'NEEDS UPDATE': '',
        'MISSING': '',
        'IMPROVEMENT': ''
      };
    }

    for (let i = 0; i < markers.length; i++) {
      const current = markers[i];
      const next = markers[i + 1];
      let content = text.slice(current.idx, next ? next.idx : text.length);
      content = content.replace(/^[#\s*\-*]*[a-zA-Z\s]+[\s*:\-]*\s*/i, '').trim();
      sections[current.key] = content;
    }

    return {
      'ACCURATE': sections.accurate || 'No details provided.',
      'NEEDS UPDATE': sections.needs_update || 'No updates required.',
      'MISSING': sections.missing || 'No gaps identified.',
      'IMPROVEMENT': sections.improvement || 'No improvement suggested.'
    };
  };

  const parsedAi = parseResponse(aiResponse);

  return (
    <div style={{ display: 'flex', gap: '24px', minHeight: 'calc(100vh - 120px)', width: '100%' }}>
      {/* Localized style tag for keyframe animations */}
      <style>{`
        @keyframes pulseSoft {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        .pulse-milestone {
          animation: pulseSoft 2s infinite ease-in-out;
        }
        @keyframes pulseRing {
          0% {
            box-shadow: 0 0 0 0 rgba(0, 200, 255, 0.1);
          }
          70% {
            box-shadow: 0 0 0 6px rgba(0, 200, 255, 0.1);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(0, 200, 255, 0.1);
          }
        }
        .pulse-ring-slow {
          animation: pulseRing 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      {/* LEFT PANEL - Phase & Track Navigation */}
      <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 }}>
        
        {/* Phase Cards list */}
        {['phase1', 'phase2', 'phase3', 'phase4'].map((pId) => {
          const phase = roadmapData[pId];
          const key = getStateKey(pId);
          const fraction = getPhaseTaskFraction(pId, dailyState?.completedTaskIds || []);
          const computedProgress = fraction.total > 0 ? Math.round((fraction.completed / fraction.total) * 100) : 0;
          const status = computedProgress === 100 ? 'Complete' : (computedProgress > 0 ? 'In Progress' : 'Not Started');
          const isSelected = selectedTopic === pId;

          return (
            <PhaseCard
              key={pId}
              title={phase.title}
              progress={computedProgress}
              status={status}
              isSelected={isSelected}
              taskFraction={fraction.fractionString}
              onClick={() => setSelectedTopic(pId)}
            />
          );
        })}

        {/* Tracks Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          margin: '12px 0 6px 0'
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 'bold',
            color: 'var(--text-muted)',
            letterSpacing: '0.1em'
          }}>
            // CROSS-CUTTING TRACKS
          </span>
          <div style={{ flex: 1, borderTop: '1px dashed var(--border)', opacity: 0.3 }}></div>
        </div>

        {/* Tracks Navigation List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {Object.keys(TRACKS_DATA).map(tId => {
            const track = TRACKS_DATA[tId];
            const isSelected = selectedTopic === tId;

            return (
              <div
                key={tId}
                onClick={() => setSelectedTopic(tId)}
                className="roadmap-task-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  background: isSelected ? 'var(--bg-card)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  userSelect: 'none'
                }}
              >
                <div style={{
                  width: '6px',
                  height: '6px',
                  background: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)',
                  borderRadius: '50%',
                  boxShadow: isSelected ? '0 0 5px var(--accent-primary)' : 'none'
                }} />
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  fontWeight: isSelected ? 'bold' : 'normal',
                  color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)'
                }}>
                  {track.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL - Topic Detail View */}
      <div style={{
        flexGrow: 1,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        overflowY: 'auto'
      }}>
        
        {/* Header Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          borderBottom: '1px dashed var(--border)',
          paddingBottom: '20px'
        }}>
          <h2 style={{
            margin: 0,
            fontFamily: 'var(--font-mono)',
            fontSize: '20px',
            color: 'var(--accent-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            &gt; {isPhase ? roadmapData[selectedTopic]?.title : TRACKS_DATA[selectedTopic]?.title}
          </h2>

          {/* Status & Progress Grid Controls */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.01)',
            border: '1px solid var(--border)',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            {/* Computed Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                STATUS:
              </span>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  padding: '4px 10px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--accent-primary)',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}
              >
                {(() => {
                  const p = isPhase ? activePhaseProgress : trackMilestonesStats.percentage;
                  if (p === 100) return 'Complete';
                  if (p > 0) return 'In Progress';
                  return 'Not Started';
                })()}
              </div>
            </div>

            {/* Computed Progress control */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, maxWidth: '400px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                PROGRESS:
              </span>
              <div style={{
                flex: 1,
                height: '8px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  width: `${isPhase ? activePhaseProgress : trackMilestonesStats.percentage}%`,
                  height: '100%',
                  background: 'var(--accent-primary)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                minWidth: '80px',
                textAlign: 'right',
                fontWeight: 'bold',
                color: 'var(--accent-primary)'
              }}>
                {isPhase ? activePhaseProgress : trackMilestonesStats.percentage}% ({isPhase ? selectedPhaseStats.completed : trackMilestonesStats.completed}/{isPhase ? selectedPhaseStats.total : trackMilestonesStats.total})
              </span>
            </div>
          </div>

          {/* Statistics Metadata Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            marginTop: '4px'
          }}>
            <div style={{ borderLeft: '2px solid var(--accent-blue)', paddingLeft: '12px', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>TIMEFRAME</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-main)', fontWeight: 'bold' }}>
                {isPhase ? getRemainingTimeframe(selectedTopic, dailyState?.completedTaskIds || []) : 'Continuous'}
              </span>
            </div>
            
            <div style={{ borderLeft: '2px solid var(--accent-green)', paddingLeft: '12px', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>COMPLETION RATE</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-main)', fontWeight: 'bold' }}>
                {isPhase 
                  ? `${selectedPhaseStats.completed}/${selectedPhaseStats.total} tasks`
                  : `${trackMilestonesStats.completed}/${trackMilestonesStats.total} Milestones`
                }
              </span>
            </div>

            <div style={{ borderLeft: '2px solid var(--accent-orange)', paddingLeft: '12px', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>TARGET FOCUS</span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--text-main)',
                fontWeight: 'bold',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }} title={isPhase ? getPhaseMilestone(selectedTopic, activePhaseProgress) : TRACKS_DATA[selectedTopic].title}>
                {isPhase ? getPhaseMilestone(selectedTopic, activePhaseProgress) : 'Core Skill Progression'}
              </span>
            </div>
          </div>
        </div>

        {/* Phase Tasks Branch Layout (Render if selectedTopic is a Phase) */}
        {isPhase && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {phaseBranches.map((branch) => {
              const isExpanded = expandedBranch === branch.id;
              
              return (
                <div
                  key={branch.id}
                  className="roadmap-task-card"
                  style={{
                    background: isExpanded ? 'rgba(255, 255, 255, 0.005)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {/* Accordion Trigger Header */}
                  <div
                    onClick={() => setExpandedBranch(isExpanded ? null : branch.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '14px 18px',
                      cursor: 'pointer',
                      background: isExpanded ? 'rgba(0, 200, 255, 0.1)' : 'none',
                      borderLeft: isExpanded ? '4px solid var(--accent-primary)' : '4px solid transparent',
                      userSelect: 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        color: isExpanded ? 'var(--accent-primary)' : 'var(--text-main)'
                      }}>
                        {branch.name}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {/* Computed Progress display for the branch */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '60px',
                          height: '4px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '2px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${branch.progressPercent}%`,
                            height: '100%',
                            background: branch.progressPercent === 100 ? 'var(--accent-green)' : 'var(--accent-primary)',
                            transition: 'width 0.3s'
                          }} />
                        </div>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10px',
                          color: branch.progressPercent === 100 ? 'var(--accent-green)' : 'var(--text-muted)',
                          fontWeight: 'bold'
                        }}>
                          {branch.progressPercent}%
                        </span>
                      </div>
                      
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        background: branch.completedCount === branch.totalCount ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                        color: branch.completedCount === branch.totalCount ? 'var(--accent-green)' : 'var(--text-muted)',
                        border: `1px solid ${branch.completedCount === branch.totalCount ? 'var(--accent-green)' : 'var(--border)'}`,
                        padding: '1px 6px',
                        fontWeight: 'bold'
                      }}>
                        {branch.completedCount}/{branch.totalCount} DONE
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {isExpanded ? '▼' : '►'}
                      </span>
                    </div>
                  </div>

                  {/* Accordion collapsible body - Minimal task row rendering */}
                  {isExpanded && (
                    <div style={{
                      padding: '16px 20px',
                      borderTop: '1px dashed var(--border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      background: 'rgba(0, 0, 0, 0.2)'
                    }}>
                      {branch.tasks.length === 0 ? (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
                          No specific checklist objectives logged.
                        </span>
                      ) : (
                        branch.tasks.map((task) => {
                          const isCompleted = dailyState?.completedTaskIds?.includes(task.id);
                          return (
                            <div
                              key={task.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '8px 12px',
                                background: isCompleted ? 'rgba(34, 197, 94, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                                border: `1px solid ${isCompleted ? 'rgba(34, 197, 94, 0.2)' : 'var(--border)'}`,
                                opacity: isCompleted ? 0.7 : 1,
                                transition: 'all 0.2s',
                                cursor: 'pointer'
                              }}
                              onClick={(e) => handleTaskToggle(task, e)}
                            >
                              <div style={{
                                width: '16px',
                                height: '16px',
                                border: `1px solid ${isCompleted ? 'var(--accent-green)' : 'var(--text-muted)'}`,
                                background: isCompleted ? 'var(--accent-green)' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                {isCompleted && <span style={{ color: '#000', fontSize: '10px', fontWeight: 'bold' }}>✓</span>}
                              </div>
                              
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{
                                  fontFamily: 'var(--font-mono)',
                                  fontSize: '13px',
                                  color: isCompleted ? 'var(--text-muted)' : 'var(--text-main)',
                                  textDecoration: isCompleted ? 'line-through' : 'none'
                                }}>
                                  {task.title}
                                </span>
                              </div>
                              
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                <span style={{
                                  fontFamily: 'var(--font-mono)',
                                  fontSize: '10px',
                                  color: 'var(--text-muted)',
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  padding: '2px 6px',
                                  borderRadius: '2px'
                                }}>
                                  {task.secLabel}
                                </span>
                                {task.category && (
                                  <CategoryTag category={task.category} />
                                )}
                                {task.xpReward > 0 && (
                                  <span style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '11px',
                                    color: 'var(--accent-blue)',
                                    fontWeight: 'bold'
                                  }}>
                                    +{task.xpReward} XP
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tracks Timeline View (Render if selectedTopic is a Track) */}
        {!isPhase && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            paddingLeft: '24px',
            marginTop: '10px',
            gap: '32px'
          }}>
            {milestonesWithStatus.map((m, idx) => {
              const totalMilestones = trackMilestonesStats.total;
              const isCompleted = m.isCompleted;
              const isCurrent = m.isCurrent;
              const isFuture = m.isFuture;

              return (
                <div
                  key={idx}
                  style={{
                    position: 'relative',
                    opacity: isCompleted || isCurrent ? 1 : 0.3,
                    transition: 'all 0.3s'
                  }}
                >
                  {/* Custom Segment Line Segment */}
                  {idx < totalMilestones - 1 && (
                    <div style={{
                      position: 'absolute',
                      left: '-19px',
                      top: '15px',
                      height: 'calc(100% + 23px)',
                      width: '1px',
                      background: isCompleted ? 'var(--accent-terminal-dim)' : 'var(--border)',
                      zIndex: 1
                    }} />
                  )}

                  {/* Vertical Node Indicator (Custom Reticles) */}
                  {isCompleted ? (
                    /* Completed: filled var(--accent-terminal) 6px dot */
                    <div
                      style={{
                        position: 'absolute',
                        left: '-21px',
                        top: '6px',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: 'var(--accent-terminal)',
                        zIndex: 2
                      }}
                    />
                  ) : isCurrent ? (
                    /* Current: slow pulse ring */
                    <div
                      className="pulse-ring-slow"
                      style={{
                        position: 'absolute',
                        left: '-24px',
                        top: '3px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        border: '1px solid var(--accent-primary)',
                        background: 'var(--bg-void)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2
                      }}
                    >
                      <div style={{
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        background: 'var(--accent-primary)'
                      }} />
                    </div>
                  ) : (
                    /* Future: empty void with a dim border */
                    <div
                      style={{
                        position: 'absolute',
                        left: '-24px',
                        top: '3px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        border: '1px solid var(--border)',
                        background: 'var(--bg-void)',
                        zIndex: 2
                      }}
                    />
                  )}

                  {/* Node Content */}
                  <div className="roadmap-task-card" style={{
                    background: isCurrent ? 'rgba(0, 200, 255, 0.1)' : 'none',
                    padding: isCurrent ? '16px' : '0 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    transition: 'all 0.3s'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <h4 style={{
                        margin: 0,
                        fontFamily: 'var(--font-mono)',
                        fontSize: '14px',
                        color: isCompleted || isCurrent ? 'var(--accent-primary)' : 'var(--text-main)',
                        fontWeight: 'bold'
                      }}>
                        {m.title}
                      </h4>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        color: 'var(--accent-blue)',
                        fontWeight: 'bold',
                        letterSpacing: '0.05em'
                      }}>
                        {(m?.timeframe || '').toUpperCase()}
                      </span>
                      {isCurrent && (
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '9px',
                          background: 'rgba(245, 166, 35, 0.1)',
                          border: '1px solid var(--accent-amber)',
                          color: 'var(--accent-amber)',
                          padding: '1px 5px',
                          fontWeight: 'bold',
                          letterSpacing: '0.05em',
                          animation: 'pulse 1.5s infinite'
                        }}>
                          ACTIVE TARGET
                        </span>
                      )}
                    </div>
                    <p style={{
                      margin: 0,
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      lineHeight: '1.5'
                    }}>
                      {m.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* AI Credibility Check telemetry & outputs */}
        <div style={{
          borderTop: '1px dashed var(--border)',
          paddingTop: '24px',
          marginTop: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
            <button
              onClick={handleCheckCredibility}
              disabled={aiLoading}
              className="end-shift-btn"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--accent-primary)',
                color: 'var(--accent-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 'bold',
                padding: '8px 16px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                transition: 'all 0.2s',
                outline: 'none'
              }}
            >
              {aiLoading ? 'RUNNING ANALYSIS...' : '[ GROQ CREDIBILITY CHECK ]'}
            </button>
          </div>

          {aiError && (
            <div style={{
              background: 'rgba(255, 111, 97, 0.05)',
              border: '1px solid var(--accent-coral)',
              padding: '14px',
              color: 'var(--accent-coral)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px'
            }}>
              {typeof aiError === 'string' && aiError.startsWith('[!]') 
                ? aiError 
                : `[!] AI CONNECTION ERROR // ${aiError.message || aiError.toString() || 'CONNECTION FAILED'}`}
            </div>
          )}

          {parsedAi && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                onClick={() => setIsAiReviewExpanded(!isAiReviewExpanded)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  background: 'rgba(0, 200, 255, 0.1)',
                  borderLeft: '3px solid var(--accent-primary)',
                  padding: '10px 14px',
                  userSelect: 'none'
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                  🧠 {isAiReviewExpanded ? '▼' : '►'} LLA-3.3-70B TELEMETRY DECENCIES // MARKET COMPLIANCE
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                  MODEL: LLAMA-3.3-70B-VERSATILE
                </span>
              </div>

              {isAiReviewExpanded && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: '16px',
                  animation: 'fadeIn 0.4s'
                }}>
                  {/* ACCURATE BOX */}
                  <div style={{
                    border: '1px solid var(--accent-green)',
                    background: 'rgba(34, 197, 94, 0.01)',
                    padding: '16px'
                  }}>
                    <h5 style={{
                      margin: '0 0 10px 0',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      color: 'var(--accent-green)',
                      fontWeight: 'bold',
                      letterSpacing: '0.05em'
                    }}>
                      ACCURATE [VERIFIED MARKET REALITY]
                    </h5>
                    <p style={{
                      margin: 0,
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      color: 'var(--text-main)',
                      whiteSpace: 'pre-wrap',
                      lineHeight: '1.6'
                    }}>
                      {parsedAi.ACCURATE}
                    </p>
                  </div>

                  {/* NEEDS UPDATE BOX */}
                  {parsedAi['NEEDS UPDATE'] && (
                    <div style={{
                      border: '1px solid var(--accent-orange)',
                      background: 'rgba(0, 200, 255, 0.1)',
                      padding: '16px'
                    }}>
                      <h5 style={{
                        margin: '0 0 10px 0',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        color: 'var(--accent-orange)',
                        fontWeight: 'bold',
                        letterSpacing: '0.05em'
                      }}>
                        NEEDS UPDATE [REALITY GAP RECON]
                      </h5>
                      <p style={{
                        margin: 0,
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        color: 'var(--text-main)',
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.6'
                      }}>
                        {parsedAi['NEEDS UPDATE']}
                      </p>
                    </div>
                  )}

                  {/* MISSING BOX */}
                  {parsedAi.MISSING && (
                    <div style={{
                      border: '1px solid var(--accent-coral)',
                      background: 'rgba(255, 111, 97, 0.01)',
                      padding: '16px'
                    }}>
                      <h5 style={{
                        margin: '0 0 10px 0',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        color: 'var(--accent-coral)',
                        fontWeight: 'bold',
                        letterSpacing: '0.05em'
                      }}>
                        MISSING [GAPS IN SECURITY SYSTEM]
                      </h5>
                      <p style={{
                        margin: 0,
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        color: 'var(--text-main)',
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.6'
                      }}>
                        {parsedAi.MISSING}
                      </p>
                    </div>
                  )}

                  {/* IMPROVEMENT BOX */}
                  {parsedAi.IMPROVEMENT && (
                    <div style={{
                      border: '1px solid var(--accent-blue)',
                      background: 'rgba(0, 200, 255, 0.01)',
                      padding: '16px'
                    }}>
                      <h5 style={{
                        margin: '0 0 10px 0',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        color: 'var(--accent-blue)',
                        fontWeight: 'bold',
                        letterSpacing: '0.05em'
                      }}>
                        IMPROVEMENT [STRATEGIC HARDENING]
                      </h5>
                      <p style={{
                        margin: 0,
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        color: 'var(--text-main)',
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.6'
                      }}>
                        {parsedAi.IMPROVEMENT}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
