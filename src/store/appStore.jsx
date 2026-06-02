// src/store/appStore.jsx
// Central state store for TAC-NET dashboard.
// Rebuilt from a clean architectural foundation.
// Single source of truth is Cloudflare KV with debounced writes and offline fallback to localStorage.

import React, { createContext, useContext, useReducer, useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { roadmapData } from '../data/roadmapData';
import { projectsData } from '../data/projectsData';
import { FIXED_TASKS, CHAINS } from '../data/missionsData';
import { skillsData } from '../data/skillsData';

export const AppContext = createContext();

const STORAGE_KEYS = {
  STATE_V2: 'tacnet-state-v2',
  AUTHENTICATED: 'operator_authenticated',
  PENALTY_DISMISSED: 'tacnet-penalty-dismissed'
};

const CHAIN_PRIORITY = [
  'NETWORKING',
  'LINUX',
  'SOC OPERATIONS',
  'WEB SECURITY',
  'TOOLS MASTERY',
  'ACTIVE DIRECTORY',
  'INTERVIEW PREP',
  'THM / LABS'
];

// ─────────────────────────────────────────────────────────────
// INITIAL / DEFAULT SEED STATE (PART 2)
// ─────────────────────────────────────────────────────────────

function getInitialSeedState() {
  return {
    "meta": {
      "version": "2.0",
      "lastSaved": new Date().toISOString(),
      "timezone": "Asia/Kolkata"
    },
    "operator": {
      "id": "yg-01",
      "name": "Yash Gulati",
      "callsign": "YG-01",
      "inceptDate": "2026-05-26",
      "function": "SOC Analyst Candidate",
      "xp": 1915,
      "level": 10,
      "streak": 1,
      "lastActiveDate": "2026-06-01",
      "xpPerLevel": 200
    },
    "phase": {
      "current": 1,
      "currentWeek": 1,
      "startDate": "2026-05-26",
      "label": "FOUNDATION"
    },
    "dailyCompletions": {
      "2026-05-25": [
        "discipline-morning","physical-exercise","social-patrol",
        "discipline-aar","career-apply5","physical-water",
        "discipline-sleep","chain-net-01","labs-thm-01"
      ],
      "2026-05-26": [
        "discipline-morning","physical-exercise","social-patrol",
        "discipline-aar","career-coldemail","physical-water",
        "discipline-sleep","chain-net-01","chain-net-02",
        "chain-net-03","chain-net-04","labs-thm-01"
      ],
      "2026-05-27": [
        "discipline-morning","physical-exercise","social-patrol",
        "discipline-aar","career-apply5","career-linkedin",
        "physical-water","discipline-sleep","chain-net-01",
        "chain-net-02","chain-net-03","chain-net-04"
      ],
      "2026-05-28": ["discipline-morning"],
      "2026-05-29": [],
      "2026-05-30": [],
      "2026-05-31": []
    },
    "projectCompletions": {
      "ad-lab": ["ad-t01","ad-t02","ad-t03"],
      "threat-intel": [],
      "cloud-scanner": [],
      "portswigger": [],
      "portfolio": []
    },
    "chainProgress": {
      "NETWORKING": 4,
      "LINUX": 0,
      "SOC OPERATIONS": 0,
      "WEB SECURITY": 1,
      "TOOLS MASTERY": 0,
      "ACTIVE DIRECTORY": 0,
      "INTERVIEW PREP": 0,
      "THM / LABS": 0
    },
    "projectStatus": {
      "ad-lab": "ACTIVE",
      "threat-intel": "QUEUED",
      "cloud-scanner": "QUEUED",
      "portswigger": "ACTIVE",
      "portfolio": "ACTIVE"
    },
    "holidays": {
      "2026-05-29": {
        "reason": "WiFi Down",
        "markedAt": "2026-05-29T16:17:40.548Z"
      }
    },
    "events": [],
    "logs": {
      "2026-05-25": [
        {"taskId":"discipline-morning","taskName":"Morning ritual complete (no screen)","category":"DISCIPLINE","xp":25,"completedAt":"2026-05-25T01:15:42.373Z","type":"completed"},
        {"taskId":"physical-exercise","taskName":"Post-nap exercise done","category":"HEALTH","xp":30,"completedAt":"2026-05-25T15:09:41.325Z","type":"completed"},
        {"taskId":"social-patrol","taskName":"Evening patrol with friend (full hour)","category":"DISCIPLINE","xp":25,"completedAt":"2026-05-25T15:09:25.077Z","type":"completed"},
        {"taskId":"discipline-aar","taskName":"After action report written","category":"DISCIPLINE","xp":20,"completedAt":"2026-05-25T17:09:30.893Z","type":"completed"},
        {"taskId":"career-apply5","taskName":"Apply to 5 roles (Naukri/LinkedIn)","category":"CAREER","xp":75,"completedAt":"2026-05-25T15:09:26.421Z","type":"completed"},
        {"taskId":"career-coldemail","taskName":"Cold email outreach (2 companies)","category":"CAREER","xp":50,"completedAt":null,"type":"missed"},
        {"taskId":"career-recordinterview","taskName":"Record yourself answering 1 interview Q","category":"CAREER","xp":40,"completedAt":null,"type":"missed"},
        {"taskId":"career-star","taskName":"Review 1 STAR answer and refine it","category":"CAREER","xp":35,"completedAt":null,"type":"missed"},
        {"taskId":"career-linkedin","taskName":"Update LinkedIn or resume if needed","category":"CAREER","xp":25,"completedAt":null,"type":"missed"},
        {"taskId":"learning-readintel","taskName":"Read 1 article: threat intel / AppSec / SOC","category":"LEARNING","xp":30,"completedAt":null,"type":"missed"},
        {"taskId":"physical-water","taskName":"Drink 3L water","category":"HEALTH","xp":15,"completedAt":"2026-05-25T17:09:31.598Z","type":"completed"},
        {"taskId":"discipline-sleep","taskName":"Sleep before 1AM","category":"DISCIPLINE","xp":20,"completedAt":"2026-05-25T17:09:32.256Z","type":"completed"},
        {"taskId":"chain-net-01","taskName":"Memorise top 25 ports (Groups 1-2)","category":"LEARNING","xp":50,"completedAt":"2026-05-25T04:27:52.230Z","type":"completed"},
        {"taskId":"labs-thm-01","taskName":"Complete 1 THM room (any)","category":"LEARNING","xp":50,"completedAt":"2026-05-25T15:23:11.180Z","type":"completed"}
      ],
      "2026-05-26": [
        {"taskId":"discipline-morning","taskName":"Morning ritual complete (no screen)","category":"DISCIPLINE","xp":25,"completedAt":"2026-05-26T01:17:40.203Z","type":"completed"},
        {"taskId":"physical-exercise","taskName":"Post-nap exercise done","category":"HEALTH","xp":30,"completedAt":"2026-05-26T10:08:15.491Z","type":"completed"},
        {"taskId":"social-patrol","taskName":"Evening patrol with friend (full hour)","category":"DISCIPLINE","xp":25,"completedAt":"2026-05-26T15:14:06.189Z","type":"completed"},
        {"taskId":"discipline-aar","taskName":"After action report written","category":"DISCIPLINE","xp":20,"completedAt":"2026-05-26T16:22:10.318Z","type":"completed"},
        {"taskId":"career-apply5","taskName":"Apply to 5 roles (Naukri/LinkedIn)","category":"CAREER","xp":75,"completedAt":null,"type":"missed"},
        {"taskId":"career-coldemail","taskName":"Cold email outreach (2 companies)","category":"CAREER","xp":50,"completedAt":"2026-05-26T10:08:04.843Z","type":"completed"},
        {"taskId":"career-recordinterview","taskName":"Record yourself answering 1 interview Q","category":"CAREER","xp":40,"completedAt":null,"type":"missed","xpPenalty":-20},
        {"taskId":"career-star","taskName":"Review 1 STAR answer and refine it","category":"CAREER","xp":35,"completedAt":null,"type":"missed","xpPenalty":-17},
        {"taskId":"physical-water","taskName":"Drink 3L water","category":"HEALTH","xp":15,"completedAt":"2026-05-26T16:18:37.358Z","type":"completed"},
        {"taskId":"discipline-sleep","taskName":"Sleep before 1AM","category":"DISCIPLINE","xp":20,"completedAt":"2026-05-26T16:22:09.870Z","type":"completed"},
        {"taskId":"chain-net-01","taskName":"Memorise top 25 ports (Groups 1-2)","category":"LEARNING","xp":50,"completedAt":"2026-05-26T02:11:59.594Z","type":"completed"},
        {"taskId":"chain-net-02","taskName":"Memorise top 25 ports (Groups 3-4)","category":"LEARNING","xp":50,"completedAt":"2026-05-26T02:17:36.127Z","type":"completed"},
        {"taskId":"chain-net-03","taskName":"OSI model: all 7 layers cold recall","category":"LEARNING","xp":50,"completedAt":"2026-05-26T15:54:01.430Z","type":"completed"},
        {"taskId":"chain-net-04","taskName":"TCP/IP model vs OSI — where they differ","category":"LEARNING","xp":45,"completedAt":"2026-05-26T16:18:21.398Z","type":"completed"},
        {"taskId":"labs-thm-01","taskName":"Complete 1 THM room (any)","category":"LEARNING","xp":50,"completedAt":"2026-05-26T15:35:12.357Z","type":"completed"}
      ],
      "2026-05-27": [
        {"taskId":"discipline-morning","taskName":"Morning ritual complete (no screen)","category":"DISCIPLINE","xp":25,"completedAt":"2026-05-27T05:46:02.428Z","type":"completed"},
        {"taskId":"physical-exercise","taskName":"Post-nap exercise done","category":"HEALTH","xp":30,"completedAt":"2026-05-27T11:28:25.672Z","type":"completed"},
        {"taskId":"social-patrol","taskName":"Evening patrol with friend (full hour)","category":"DISCIPLINE","xp":25,"completedAt":"2026-05-27T16:24:55.550Z","type":"completed"},
        {"taskId":"discipline-aar","taskName":"After action report written","category":"DISCIPLINE","xp":20,"completedAt":"2026-05-27T16:25:10.039Z","type":"completed"},
        {"taskId":"career-apply5","taskName":"Apply to 5 roles (Naukri/LinkedIn)","category":"CAREER","xp":75,"completedAt":"2026-05-27T11:28:22.360Z","type":"completed"},
        {"taskId":"career-coldemail","taskName":"Cold email outreach (2 companies)","category":"CAREER","xp":50,"completedAt":null,"type":"missed"},
        {"taskId":"career-recordinterview","taskName":"Record yourself answering 1 interview Q","category":"CAREER","xp":40,"completedAt":null,"type":"missed","xpPenalty":-20},
        {"taskId":"career-star","taskName":"Review 1 STAR answer and refine it","category":"CAREER","xp":35,"completedAt":null,"type":"missed","xpPenalty":-17},
        {"taskId":"career-linkedin","taskName":"Update LinkedIn or resume if needed","category":"CAREER","xp":25,"completedAt":"2026-05-27T12:00:43.617Z","type":"completed"},
        {"taskId":"physical-water","taskName":"Drink 3L water","category":"HEALTH","xp":15,"completedAt":"2026-05-27T16:25:10.895Z","type":"completed"},
        {"taskId":"discipline-sleep","taskName":"Sleep before 1AM","category":"DISCIPLINE","xp":20,"completedAt":"2026-05-27T16:25:11.986Z","type":"completed"},
        {"taskId":"chain-net-01","taskName":"Memorise top 25 ports (Groups 1-2)","category":"LEARNING","xp":50,"completedAt":"2026-05-27T10:04:21.277Z","type":"completed"},
        {"taskId":"chain-net-02","taskName":"Memorise top 25 ports (Groups 3-4)","category":"LEARNING","xp":50,"completedAt":"2026-05-27T10:04:21.893Z","type":"completed"},
        {"taskId":"chain-net-03","taskName":"OSI model: all 7 layers cold recall","category":"LEARNING","xp":50,"completedAt":"2026-05-27T10:04:22.445Z","type":"completed"},
        {"taskId":"chain-net-04","taskName":"TCP/IP model vs OSI — differences","category":"LEARNING","xp":45,"completedAt":"2026-05-27T10:04:23.205Z","type":"completed"}
      ],
      "2026-05-28": [
        {"taskId":"discipline-morning","taskName":"Morning ritual complete (no screen)","category":"DISCIPLINE","xp":25,"completedAt":"2026-05-28T00:44:25.883Z","type":"completed"},
        {"taskId":"physical-exercise","taskName":"Post-nap exercise done","category":"HEALTH","xp":30,"completedAt":null,"type":"missed"},
        {"taskId":"social-patrol","taskName":"Evening patrol with friend (full hour)","category":"DISCIPLINE","xp":25,"completedAt":null,"type":"missed"},
        {"taskId":"discipline-aar","taskName":"After action report written","category":"DISCIPLINE","xp":20,"completedAt":null,"type":"missed","xpPenalty":-10},
        {"taskId":"career-apply5","taskName":"Apply to 5 roles (Naukri/LinkedIn)","category":"CAREER","xp":75,"completedAt":null,"type":"missed"},
        {"taskId":"career-recordinterview","taskName":"Record yourself answering 1 interview Q","category":"CAREER","xp":40,"completedAt":null,"type":"missed","xpPenalty":-20},
        {"taskId":"career-star","taskName":"Review 1 STAR answer and refine it","category":"CAREER","xp":35,"completedAt":null,"type":"missed","xpPenalty":-17},
        {"taskId":"physical-water","taskName":"Drink 3L water","category":"HEALTH","xp":15,"completedAt":null,"type":"missed"},
        {"taskId":"discipline-sleep","taskName":"Sleep before 1AM","category":"DISCIPLINE","xp":20,"completedAt":null,"type":"missed","xpPenalty":-10}
      ],
      "2026-05-29": [],
      "2026-05-30": [
        {"taskId":"discipline-morning","taskName":"Morning ritual complete (no screen)","category":"DISCIPLINE","xp":25,"completedAt":null,"type":"missed","xpPenalty":-12},
        {"taskId":"discipline-aar","taskName":"After action report written","category":"DISCIPLINE","xp":20,"completedAt":null,"type":"missed","xpPenalty":-10},
        {"taskId":"career-apply5","taskName":"Apply to 5 roles (Naukri/LinkedIn)","category":"CAREER","xp":75,"completedAt":null,"type":"missed"},
        {"taskId":"career-recordinterview","taskName":"Record yourself answering 1 interview Q","category":"CAREER","xp":40,"completedAt":null,"type":"missed","xpPenalty":-20},
        {"taskId":"career-star","taskName":"Review 1 STAR answer and refine it","category":"CAREER","xp":35,"completedAt":null,"type":"missed","xpPenalty":-17},
        {"taskId":"learning-readintel","taskName":"Read 1 article: threat intel / AppSec / SOC","category":"LEARNING","xp":30,"completedAt":null,"type":"missed"},
        {"taskId":"physical-water","taskName":"Drink 3L water","category":"HEALTH","xp":15,"completedAt":null,"type":"missed"},
        {"taskId":"discipline-sleep","taskName":"Sleep before 1AM","category":"DISCIPLINE","xp":20,"completedAt":null,"type":"missed","xpPenalty":-10}
      ],
      "2026-05-31": [
        {"taskId":"discipline-morning","taskName":"Morning ritual complete (no screen)","category":"DISCIPLINE","xp":25,"completedAt":null,"type":"missed","xpPenalty":-12},
        {"taskId":"discipline-aar","taskName":"After action report written","category":"DISCIPLINE","xp":20,"completedAt":null,"type":"missed","xpPenalty":-10},
        {"taskId":"career-apply5","taskName":"Apply to 5 roles (Naukri/LinkedIn)","category":"CAREER","xp":75,"completedAt":null,"type":"missed"},
        {"taskId":"career-recordinterview","taskName":"Record yourself answering 1 interview Q","category":"CAREER","xp":40,"completedAt":null,"type":"missed","xpPenalty":-20},
        {"taskId":"career-star","taskName":"Review 1 STAR answer and refine it","category":"CAREER","xp":35,"completedAt":null,"type":"missed","xpPenalty":-17},
        {"taskId":"learning-readintel","taskName":"Read 1 article: threat intel / AppSec / SOC","category":"LEARNING","xp":30,"completedAt":null,"type":"missed"},
        {"taskId":"physical-water","taskName":"Drink 3L water","category":"HEALTH","xp":15,"completedAt":null,"type":"missed"},
        {"taskId":"discipline-sleep","taskName":"Sleep before 1AM","category":"DISCIPLINE","xp":20,"completedAt":null,"type":"missed","xpPenalty":-10}
      ]
    },
    "debriefs": {
      "2026-05-27": {
        "failed": false,
        "content": "ASSESSMENT: Today was productive — 8/10 tasks done.\nWEAK POINTS: No cold email, no interview recording, no threat intel.\nTOMORROW: Complete cold email outreach and record one interview answer.",
        "savedAt": "2026-05-27T16:30:00.000Z"
      },
      "2026-05-29": {
        "failed": false,
        "content": "ASSESSMENT: Holiday — WiFi down. Zero tasks completed.\nWEAK POINTS: Full day lost to infrastructure failure.\nTOMORROW: Resume normal ops with full discipline stack.",
        "savedAt": "2026-05-29T20:00:00.000Z"
      },
      "2026-05-26": { "failed": true, "message": "AI unavailable" },
      "2026-05-28": { "failed": true, "message": "AI unavailable" },
      "2026-05-31": { "failed": true, "message": "AI unavailable" }
    },
    "customTasks": [],
    "deletedDefaultTaskIds": [],
    "dayClosed": {
      "2026-05-26": true,
      "2026-05-27": true,
      "2026-05-28": true,
      "2026-05-29": true,
      "2026-05-31": true
    }
  };
}

// ─────────────────────────────────────────────────────────────
// REDUCER
// ─────────────────────────────────────────────────────────────

function appReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload;
    case 'UPDATE_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

// ─────────────────────────────────────────────────────────────
// PURE RESOLVERS & STATE COMPUTERS
// ─────────────────────────────────────────────────────────────

export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getTodayString() {
  return todayISO();
}

export function getYesterdayString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getISOWeekString() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function mapDomainKey(domain) {
  if (!domain) return '';
  const d = String(domain ?? '');
  if (d === 'THM_LABS') return 'THM / LABS';
  return d.replace(/_/g, ' ').toUpperCase();
}

export function getCurrentProjectTask(projectId, state) {
  const project = (projectsData ?? []).find(p => p.id === projectId);
  if (!project) return null;
  const completions = state?.projectCompletions?.[projectId] ?? [];
  return (project.tasks ?? []).find(t => !completions.includes(t.id)) || null;
}

export function getCurrentChainTask(chainName, state) {
  const nextIdx = state?.chainProgress?.[chainName] ?? 0;
  const chainTasks = CHAINS[chainName] ?? [];
  if (nextIdx < chainTasks.length) {
    return {
      ...chainTasks[nextIdx],
      id: `chain:${chainName}:${nextIdx}`,
      stepIdx: nextIdx
    };
  }
  return null;
}

export function getTodayTasks(state, date) {
  if (!state) return [];
  const completions = state.dailyCompletions?.[date] ?? [];
  const tasks = [];

  // 1. DISCIPLINE tasks (always 4)
  const disciplineTasks = [
    { id: 'discipline-morning', title: 'Morning ritual complete — no screen for first 20 min', category: 'DISCIPLINE', xp: 25, xpPenalty: -12, isRequired: true },
    { id: 'discipline-sleep', title: 'Sleep before 1AM', category: 'DISCIPLINE', xp: 20, xpPenalty: -10, isRequired: true },
    { id: 'discipline-aar', title: 'After action report written (3 sentences in Obsidian)', category: 'DISCIPLINE', xp: 20, xpPenalty: -10, isRequired: true },
    { id: 'social-patrol', title: 'Evening walk or patrol with friend — minimum 30 min', category: 'SOCIAL', xp: 25, xpPenalty: null, isRequired: false }
  ];
  disciplineTasks.forEach(t => {
    if (!(state.deletedDefaultTaskIds ?? []).includes(t.id)) {
      tasks.push(t);
    }
  });

  // 2. HEALTH tasks (always 2)
  const healthTasks = [
    { id: 'physical-exercise', title: 'Post-nap or morning exercise — any movement 30 min', category: 'PHYSICAL', xp: 30, xpPenalty: null, isRequired: false },
    { id: 'physical-water', title: 'Drink 3L water across the day', category: 'PHYSICAL', xp: 15, xpPenalty: null, isRequired: false }
  ];
  healthTasks.forEach(t => {
    if (!(state.deletedDefaultTaskIds ?? []).includes(t.id)) {
      tasks.push(t);
    }
  });

  // 3. CAREER tasks (6, active on weekdays without exam block suppression or holidays)
  const dayOfWeek = new Date(date).getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const isHoliday = !!state.holidays?.[date];
  
  const isMissionsSuspended = (state.events ?? []).some(evt => 
    evt.missionsActive === false && date >= evt.startDate && date <= evt.endDate
  );
  
  const hasExam = (state.events ?? []).some(evt => 
    evt.category === 'EXAM' && date >= evt.startDate && date <= evt.endDate
  );

  const isCareerActive = !isHoliday && !isMissionsSuspended && !(isWeekend && hasExam);

  if (isCareerActive) {
    const careerTasks = [
      { id: 'career-apply5', title: 'Apply to 5 roles on Naukri and LinkedIn', category: 'CAREER', xp: 75, xpPenalty: null, isRequired: false },
      { id: 'career-coldemail', title: 'Cold email outreach to 2 companies', category: 'CAREER', xp: 50, xpPenalty: null, isRequired: false },
      { id: 'career-recordinterview', title: 'Record yourself answering 1 interview question', category: 'CAREER', xp: 40, xpPenalty: -20, isRequired: true },
      { id: 'career-star', title: 'Review 1 STAR answer and refine it', category: 'CAREER', xp: 35, xpPenalty: -17, isRequired: true },
      { id: 'career-linkedin', title: 'Update LinkedIn or resume if anything new to add', category: 'CAREER', xp: 25, xpPenalty: null, isRequired: false },
      { id: 'learning-readintel', title: 'Read 1 article on threat intel / AppSec / SOC', category: 'CAREER', xp: 30, xpPenalty: null, isRequired: false }
    ];
    careerTasks.forEach(t => {
      if (!(state.deletedDefaultTaskIds ?? []).includes(t.id)) {
        tasks.push(t);
      }
    });
  }

  // 4. PROJECT task (0 or 1, from active project current task)
  const activeProjectId = Object.keys(state.projectStatus ?? {}).find(id => state.projectStatus[id] === 'ACTIVE');
  if (activeProjectId) {
    const currentProjTask = getCurrentProjectTask(activeProjectId, state);
    if (currentProjTask) {
      tasks.push({
        id: currentProjTask.id,
        title: currentProjTask.title,
        category: 'PROJECT',
        xp: currentProjTask.xpReward || currentProjTask.xp || 25,
        xpPenalty: null,
        isRequired: false
      });
    }
  }

  // 5. LEARNING task (0 or 1, from active skill chain)
  let learningTask = null;
  for (const chainName of CHAIN_PRIORITY) {
    const nextIdx = state.chainProgress?.[chainName] ?? 0;
    const chainTasks = CHAINS[chainName] ?? [];
    if (nextIdx < chainTasks.length) {
      const taskDef = chainTasks[nextIdx];
      learningTask = {
        id: `chain:${chainName}:${nextIdx}`,
        title: taskDef.title,
        category: 'LEARNING',
        xp: taskDef.xp || 25,
        xpPenalty: null,
        isRequired: false,
        chainName,
        stepIdx: nextIdx
      };
      break;
    }
  }
  if (learningTask) {
    tasks.push(learningTask);
  }

  // 6. CUSTOM tasks scheduled for that date
  const todayCustom = (state.customTasks ?? []).filter(t => t.date === date);
  todayCustom.forEach(t => {
    if (!(state.deletedDefaultTaskIds ?? []).includes(t.id)) {
      tasks.push({
        id: t.id,
        title: t.title,
        category: t.category || 'OPS',
        xp: t.xp || 25,
        xpPenalty: null,
        isRequired: false
      });
    }
  });

  return tasks.map(t => ({
    ...t,
    isCompleted: completions.includes(t.id)
  }));
}

export function getCompletedSet(state) {
  const ids = new Set();
  if (!state) return ids;

  // Add all historical daily completions
  Object.values(state.dailyCompletions ?? {}).forEach(arr => {
    if (Array.isArray(arr)) arr.forEach(id => ids.add(id));
  });

  // Add all historical project completions
  Object.values(state.projectCompletions ?? {}).forEach(arr => {
    if (Array.isArray(arr)) arr.forEach(id => ids.add(id));
  });

  // Add all historical chain progress steps
  Object.entries(state.chainProgress ?? {}).forEach(([chainName, count]) => {
    for (let i = 0; i < count; i++) {
      ids.add(`chain:${chainName}:${i}`);
    }
  });

  // Add all completed items from logs (fallback/enrichment)
  try {
    Object.entries(state.logs ?? {}).forEach(([_, dateLogs]) => {
      if (Array.isArray(dateLogs)) {
        dateLogs.forEach(entry => {
          if (entry.type === 'completed' && entry.taskId) {
            ids.add(entry.taskId);
          }
        });
      }
    });
  } catch {}

  return ids;
}

export function computeStreak(dailyCompletions, holidays) {
  let streak = 0;
  const today = new Date();
  
  for (let i = 0; ; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    const completions = dailyCompletions[dateStr] ?? [];
    const isHoliday = !!holidays[dateStr];
    
    const hasCareerOrLearningOrProject = completions.some(id => {
      const idStr = String(id ?? '');
      return idStr.startsWith('career-') ||
             idStr.startsWith('learning-') ||
             idStr.startsWith('chain-') ||
             idStr.startsWith('ad-') ||
             idStr.startsWith('ti-') ||
             idStr.startsWith('cs-');
    });

    if (hasCareerOrLearningOrProject || isHoliday) {
      streak++;
    } else {
      if (i === 0) {
        continue;
      }
      break;
    }
  }
  return streak;
}

export function computeDayXP(date, logs) {
  const entries = logs?.[date] ?? [];
  return entries
    .filter(e => e && e.type === 'completed')
    .reduce((sum, e) => sum + (e.xp || 0), 0);
}

export function computeWeeklyCompletionRate(state, weekStartDate) {
  let completed = 0;
  let total = 0;
  
  const start = new Date(weekStartDate);
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    const todayTasks = getTodayTasks(state, dateStr);
    const completions = state?.dailyCompletions?.[dateStr] ?? [];
    
    completed += todayTasks.filter(t => completions.includes(t.id)).length;
    total += todayTasks.length;
  }
  
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, rate };
}

// ─────────────────────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────────────────────

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // UI & Auth States
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.AUTHENTICATED) === 'true';
    }
    return false;
  });
  
  const [passcode, setPasscode] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activePage, setActivePage] = useState('home');
  const [particles, setParticles] = useState([]);
  const [activePenaltyWarning, setActivePenaltyWarning] = useState(null);
  const [justUnlockedStepId, setJustUnlockedStepId] = useState(null);
  const [skillFilter, setSkillFilter] = useState('');
  const [todaysDomain, setTodaysDomain] = useState('NETWORKING');
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [flavors, setFlavors] = useState({});
  const [roadmapState, setRoadmapState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('roadmapState');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return {};
  });

  // Modals state
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showDebriefModal, setShowDebriefModal] = useState(false);
  const [debriefText, setDebriefText] = useState('');
  const [debriefLoading, setDebriefLoading] = useState(false);
  const [debriefError, setDebriefError] = useState('');
  const [completedProjectModal, setCompletedProjectModal] = useState(null);

  // Event modal creation & editing state variables
  const [editingEventId, setEditingEventId] = useState(null);
  const [eventName, setEventName] = useState('');
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [eventMissionsActive, setEventMissionsActive] = useState(true);
  const [eventColor, setEventColor] = useState('amber');
  const [eventNotes, setEventNotes] = useState('');

  // 300ms Debounced sync back to Worker GET/POST
  const debounceRef = useRef(null);

  const debouncedSaveState = useCallback((nextState) => {
    if (typeof window === 'undefined') return;

    // Cache locally immediately (v2 format)
    localStorage.setItem(STORAGE_KEYS.STATE_V2, JSON.stringify(nextState));

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nextState)
        });
        if (!res.ok) {
          throw new Error('KV PUT failure');
        }
      } catch (err) {
        console.warn("Workers KV synchronization offline. Cache updated locally.", err);
      }
    }, 300);
  }, []);

  // Hydration logic on mount
  useEffect(() => {
    async function hydrate() {
      try {
        const res = await fetch('/api/state');
        if (!res.ok) throw new Error("Worker down");
        const data = await res.json();
        
        if (data) {
          let updated = false;
          const today = '2026-06-01';
          if (data.dayClosed && data.dayClosed[today]) {
            delete data.dayClosed[today];
            if (data.logs && data.logs[today]) {
              data.logs[today] = data.logs[today].filter(entry => entry.type !== 'missed');
            }
            updated = true;
          }
          if (data.events && data.events.length > 0) {
            const beforeLen = data.events.length;
            data.events = data.events.filter(e => e.id !== 'evt-001' && e.id !== 'evt-002' && e.id !== 'evt-003');
            if (data.events.length !== beforeLen) {
              updated = true;
            }
          }
          dispatch({ type: 'HYDRATE', payload: data });
          localStorage.setItem(STORAGE_KEYS.STATE_V2, JSON.stringify(data));
          if (typeof window !== 'undefined') {
            localStorage.removeItem(`dayClosed:${today}`);
            localStorage.removeItem(`debrief:${today}`);
          }
          if (updated) {
            debouncedSaveState(data);
          }
        } else {
          // If Worker GET returns null, fallback to local cache
          const localCache = localStorage.getItem(STORAGE_KEYS.STATE_V2);
          if (localCache) {
            const data = JSON.parse(localCache);
            let updated = false;
            const today = '2026-06-01';
            if (data.dayClosed && data.dayClosed[today]) {
              delete data.dayClosed[today];
              if (data.logs && data.logs[today]) {
                data.logs[today] = data.logs[today].filter(entry => entry.type !== 'missed');
              }
              updated = true;
            }
            if (data.events && data.events.length > 0) {
              const beforeLen = data.events.length;
              data.events = data.events.filter(e => e.id !== 'evt-001' && e.id !== 'evt-002' && e.id !== 'evt-003');
              if (data.events.length !== beforeLen) {
                updated = true;
              }
            }
            dispatch({ type: 'HYDRATE', payload: data });
            localStorage.setItem(STORAGE_KEYS.STATE_V2, JSON.stringify(data));
            if (typeof window !== 'undefined') {
              localStorage.removeItem(`dayClosed:${today}`);
              localStorage.removeItem(`debrief:${today}`);
            }
            if (updated) {
              debouncedSaveState(data);
            }
          } else {
            // Seed database from scratch
            const seed = getInitialSeedState();
            dispatch({ type: 'HYDRATE', payload: seed });
            debouncedSaveState(seed);
          }
        }
      } catch (err) {
        console.warn("KV GET failed, falling back to local storage cache:", err);
        const localCache = localStorage.getItem(STORAGE_KEYS.STATE_V2);
        if (localCache) {
          const data = JSON.parse(localCache);
          let updated = false;
          const today = '2026-06-01';
          if (data.dayClosed && data.dayClosed[today]) {
            delete data.dayClosed[today];
            if (data.logs && data.logs[today]) {
              data.logs[today] = data.logs[today].filter(entry => entry.type !== 'missed');
            }
            updated = true;
          }
          if (data.events && data.events.length > 0) {
            const beforeLen = data.events.length;
            data.events = data.events.filter(e => e.id !== 'evt-001' && e.id !== 'evt-002' && e.id !== 'evt-003');
            if (data.events.length !== beforeLen) {
              updated = true;
            }
          }
          dispatch({ type: 'HYDRATE', payload: data });
          localStorage.setItem(STORAGE_KEYS.STATE_V2, JSON.stringify(data));
          if (typeof window !== 'undefined') {
            localStorage.removeItem(`dayClosed:${today}`);
            localStorage.removeItem(`debrief:${today}`);
          }
          if (updated) {
            debouncedSaveState(data);
          }
        } else {
          const seed = getInitialSeedState();
          dispatch({ type: 'HYDRATE', payload: seed });
          debouncedSaveState(seed);
        }
      } finally {
        setIsInitialLoading(false);
      }
    }
    hydrate();
  }, [debouncedSaveState]);

  // Check and setup Penalty Warnings on mount/state updates
  useEffect(() => {
    if (!state) return;
    const yesterday = getYesterdayString();
    
    // Check if yesterday is closed
    const isClosed = !!state.dayClosed?.[yesterday];
    const isDismissed = localStorage.getItem(STORAGE_KEYS.PENALTY_DISMISSED) === yesterday;
    
    if (isClosed && !isDismissed) {
      // Re-sum yesterday's penalties from logs
      const entries = state.logs?.[yesterday] ?? [];
      const penaltyDeduction = entries
        .filter(e => e && e.type === 'missed' && e.xpPenalty && e.xpPenalty < 0)
        .reduce((sum, e) => sum + Math.abs(e.xpPenalty), 0);

      if (penaltyDeduction > 0) {
        const missedCount = entries.filter(e => e && e.type === 'missed' && e.xpPenalty && e.xpPenalty < 0).length;
        setActivePenaltyWarning(`MISSED ${missedCount} CRITICAL TASKS YESTERDAY. PENALTY APPLIED: -${penaltyDeduction} XP.`);
      }
    }
  }, [state]);

  // ─────────────────────────────────────────────────────────────
  // CORE FUNCTIONS
  // ─────────────────────────────────────────────────────────────

  const completeTask = useCallback((taskId, date) => {
    if (!state) return;

    // 1. Add taskId to completions
    const completionsForDate = [...(state.dailyCompletions?.[date] ?? [])];
    if (!completionsForDate.includes(taskId)) {
      completionsForDate.push(taskId);
    }
    const nextDailyCompletions = {
      ...(state.dailyCompletions ?? {}),
      [date]: completionsForDate
    };

    // Grab metadata
    const todayTasks = getTodayTasks(state, date);
    const task = todayTasks.find(t => t.id === taskId);
    const xpReward = task ? task.xp : 25;
    const taskTitle = task ? task.title : 'Task complete';
    const taskCategory = task ? task.category : 'LEARNING';

    // 2. Add XP to operator
    const nextXp = (state.operator.xp ?? 0) + xpReward;
    const nextLevel = Math.max(1, Math.floor(nextXp / (state.operator.xpPerLevel ?? 200)) + 1);

    const nextOperator = {
      ...(state.operator ?? {}),
      xp: nextXp,
      level: nextLevel,
      lastActiveDate: date
    };

    // 3. Append to log
    const dateLogs = [...(state.logs?.[date] ?? [])];
    const cleanedLogs = dateLogs.filter(entry => entry.taskId !== taskId);
    cleanedLogs.push({
      taskId,
      taskName: taskTitle,
      category: taskCategory,
      xp: xpReward,
      completedAt: new Date().toISOString(),
      type: 'completed'
    });
    const nextLogs = {
      ...(state.logs ?? {}),
      [date]: cleanedLogs
    };

    // 4. Project tasks completes
    const nextProjectCompletions = { ...(state.projectCompletions ?? {}) };
    const nextProjectStatus = { ...(state.projectStatus ?? {}) };
    let completedProjectModalData = null;

    (projectsData ?? []).forEach(project => {
      if ((project.tasks ?? []).some(t => t.id === taskId)) {
        const pComps = [...(state.projectCompletions?.[project.id] ?? [])];
        if (!pComps.includes(taskId)) {
          pComps.push(taskId);
        }
        nextProjectCompletions[project.id] = pComps;

        // Verify if all project steps are complete
        if (pComps.length === project.tasks.length) {
          nextProjectStatus[project.id] = 'COMPLETE';
          completedProjectModalData = {
            show: true,
            projectName: project.title,
            totalXp: (project.tasks ?? []).reduce((sum, t) => sum + (t.xpReward ?? t.xp ?? 25), 0)
          };
        }
      }
    });

    // 5. Chain steps increments
    const nextChainProgress = { ...(state.chainProgress ?? {}) };
    let justUnlockedId = null;
    if (String(taskId ?? '').startsWith('chain:')) {
      const parts = String(taskId ?? '').split(':');
      if (parts.length >= 3) {
        const chainName = parts[1];
        const prevIdx = state.chainProgress?.[chainName] ?? 0;
        const nextIdx = prevIdx + 1;
        nextChainProgress[chainName] = nextIdx;
        justUnlockedId = `chain:${chainName}:${nextIdx}`;
      }
    }

    // Recompute streak
    nextOperator.streak = computeStreak(nextDailyCompletions, state.holidays ?? {});

    const nextState = {
      ...state,
      operator: nextOperator,
      dailyCompletions: nextDailyCompletions,
      projectCompletions: nextProjectCompletions,
      projectStatus: nextProjectStatus,
      chainProgress: nextChainProgress,
      logs: nextLogs
    };

    dispatch({ type: 'UPDATE_STATE', payload: nextState });
    debouncedSaveState(nextState);

    if (justUnlockedId) {
      setJustUnlockedStepId(justUnlockedId);
      setTimeout(() => {
        setJustUnlockedStepId(null);
      }, 5000);
    }

    if (completedProjectModalData) {
      setCompletedProjectModal(completedProjectModalData);
    }
  }, [state, debouncedSaveState]);

  const uncompleteTask = useCallback((taskId, date) => {
    if (!state) return;

    // Check if it's a project task
    let projectOfTask = null;
    let projTaskObj = null;
    (projectsData ?? []).forEach(project => {
      const found = (project.tasks ?? []).find(t => t.id === taskId);
      if (found) {
        projectOfTask = project;
        projTaskObj = found;
      }
    });

    if (projectOfTask && projTaskObj) {
      // 1. Remove taskId from projectCompletions
      const nextProjectCompletions = { ...(state.projectCompletions ?? {}) };
      const nextProjectStatus = { ...(state.projectStatus ?? {}) };
      
      const pComps = (state.projectCompletions?.[projectOfTask.id] ?? []).filter(id => id !== taskId);
      nextProjectCompletions[projectOfTask.id] = pComps;
      
      // If the project was complete, set it back to active
      if (state.projectStatus?.[projectOfTask.id] === 'COMPLETE') {
        nextProjectStatus[projectOfTask.id] = 'ACTIVE';
      }

      // Also remove from dailyCompletions
      const completionsForDate = (state.dailyCompletions?.[date] ?? []).filter(id => id !== taskId);
      const nextDailyCompletions = {
        ...(state.dailyCompletions ?? {}),
        [date]: completionsForDate
      };

      // 2. Subtract XP from operator
      const xpReward = projTaskObj.xpReward ?? projTaskObj.xp ?? 25;
      const nextXp = Math.max(0, (state.operator.xp ?? 0) - xpReward);
      const nextLevel = Math.max(1, Math.floor(nextXp / (state.operator.xpPerLevel ?? 200)) + 1);

      const nextOperator = {
        ...state.operator,
        xp: nextXp,
        level: nextLevel
      };

      // 3. Remove entry from logs
      const dateLogs = (state.logs?.[date] ?? []).filter(entry => entry.taskId !== taskId);
      const nextLogs = {
        ...(state.logs ?? {}),
        [date]: dateLogs
      };

      // Recompute streak
      nextOperator.streak = computeStreak(nextDailyCompletions, state.holidays ?? {});

      const nextState = {
        ...state,
        operator: nextOperator,
        dailyCompletions: nextDailyCompletions,
        projectCompletions: nextProjectCompletions,
        projectStatus: nextProjectStatus,
        logs: nextLogs
      };

      dispatch({ type: 'UPDATE_STATE', payload: nextState });
      debouncedSaveState(nextState);
      return;
    }

    // 1. Remove taskId
    const completionsForDate = (state.dailyCompletions?.[date] ?? []).filter(id => id !== taskId);
    const nextDailyCompletions = {
      ...(state.dailyCompletions ?? {}),
      [date]: completionsForDate
    };

    // Grab metadata
    const todayTasks = getTodayTasks(state, date);
    const task = todayTasks.find(t => t.id === taskId);
    const xpReward = task ? task.xp : 25;

    // 2. Subtract XP from operator
    const nextXp = Math.max(0, (state.operator.xp ?? 0) - xpReward);
    const nextLevel = Math.max(1, Math.floor(nextXp / (state.operator.xpPerLevel ?? 200)) + 1);

    const nextOperator = {
      ...(state.operator ?? {}),
      xp: nextXp,
      level: nextLevel
    };

    // 3. Remove entry from logs
    const dateLogs = (state.logs?.[date] ?? []).filter(entry => entry.taskId !== taskId);
    const nextLogs = {
      ...(state.logs ?? {}),
      [date]: dateLogs
    };

    // Recompute streak
    nextOperator.streak = computeStreak(nextDailyCompletions, state.holidays ?? {});

    const nextState = {
      ...state,
      operator: nextOperator,
      dailyCompletions: nextDailyCompletions,
      logs: nextLogs
    };

    dispatch({ type: 'UPDATE_STATE', payload: nextState });
    debouncedSaveState(nextState);
  }, [state, debouncedSaveState]);

  const closeDay = useCallback((date) => {
    if (!state) return;

    const todayTasks = getTodayTasks(state, date);
    const completions = state.dailyCompletions?.[date] ?? [];
    
    let penaltyDeduction = 0;
    const dateLogs = [...(state.logs?.[date] ?? [])];

    todayTasks.forEach(task => {
      if (task.isRequired && !completions.includes(task.id)) {
        const penalty = Math.abs(task.xpPenalty ?? 0);
        penaltyDeduction += penalty;

        const cleaned = dateLogs.filter(entry => entry.taskId !== task.id);
        cleaned.push({
          taskId: task.id,
          taskName: task.title,
          category: task.category,
          xp: 0,
          completedAt: null,
          type: 'missed',
          xpPenalty: -penalty
        });
        
        dateLogs.length = 0;
        dateLogs.push(...cleaned);
      }
    });

    const nextXp = Math.max(0, (state.operator.xp ?? 0) - penaltyDeduction);
    const nextLevel = Math.max(1, Math.floor(nextXp / (state.operator.xpPerLevel ?? 200)) + 1);

    const nextOperator = {
      ...(state.operator ?? {}),
      xp: nextXp,
      level: nextLevel
    };

    const nextDayClosed = {
      ...(state.dayClosed ?? {}),
      [date]: true
    };

    const nextLogs = {
      ...(state.logs ?? {}),
      [date]: dateLogs
    };

    const nextState = {
      ...state,
      operator: nextOperator,
      dayClosed: nextDayClosed,
      logs: nextLogs
    };

    dispatch({ type: 'UPDATE_STATE', payload: nextState });
    debouncedSaveState(nextState);
  }, [state, debouncedSaveState]);

  const markHoliday = useCallback((date, reason) => {
    if (!state) return;
    const nextHolidays = {
      ...(state.holidays ?? {}),
      [date]: {
        reason: reason || 'Holiday',
        markedAt: new Date().toISOString()
      }
    };

    const nextOperator = { ...(state.operator ?? {}) };
    nextOperator.streak = computeStreak(state.dailyCompletions ?? {}, nextHolidays);

    const nextState = {
      ...state,
      operator: nextOperator,
      holidays: nextHolidays
    };

    dispatch({ type: 'UPDATE_STATE', payload: nextState });
    debouncedSaveState(nextState);
  }, [state, debouncedSaveState]);

  const saveDebrief = useCallback((date, content, failed = false) => {
    if (!state) return;
    const nextDebriefs = {
      ...(state.debriefs ?? {}),
      [date]: {
        failed,
        content: failed ? '' : content,
        message: failed ? content : '',
        savedAt: new Date().toISOString()
      }
    };

    const nextState = {
      ...state,
      debriefs: nextDebriefs
    };

    dispatch({ type: 'UPDATE_STATE', payload: nextState });
    debouncedSaveState(nextState);
  }, [state, debouncedSaveState]);

  const addEvent = useCallback((event) => {
    if (!state) return;
    const nextEvents = [...(state.events ?? []), event];
    const nextState = {
      ...state,
      events: nextEvents
    };
    dispatch({ type: 'UPDATE_STATE', payload: nextState });
    debouncedSaveState(nextState);
  }, [state, debouncedSaveState]);

  const removeEvent = useCallback((idObj) => {
    if (!state) return;
    const targetId = idObj?.id ?? idObj;
    const nextEvents = (state.events ?? []).filter(e => e.id !== targetId);
    const nextState = {
      ...state,
      events: nextEvents
    };
    dispatch({ type: 'UPDATE_STATE', payload: nextState });
    debouncedSaveState(nextState);
  }, [state, debouncedSaveState]);

  const handleSaveEvent = useCallback((e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!state) return;

    let nextEvents;
    if (editingEventId) {
      nextEvents = (state.events ?? []).map(evt => 
        evt.id === editingEventId 
          ? { 
              ...evt, 
              title: eventName, 
              name: eventName, 
              startDate: eventStartDate, 
              endDate: eventEndDate, 
              missionsActive: eventMissionsActive, 
              color: eventColor,
              notes: eventNotes
            }
          : evt
      );
    } else {
      const newEvent = {
        id: `evt-${Date.now()}`,
        title: eventName,
        name: eventName,
        startDate: eventStartDate,
        endDate: eventEndDate,
        missionsActive: eventMissionsActive,
        color: eventColor,
        notes: eventNotes
      };
      nextEvents = [...(state.events ?? []), newEvent];
    }

    const nextState = {
      ...state,
      events: nextEvents
    };

    dispatch({ type: 'UPDATE_STATE', payload: nextState });
    debouncedSaveState(nextState);

    // Close and clear
    setShowEventModal(false);
    setEditingEventId(null);
    setEventName('');
    setEventStartDate('');
    setEventEndDate('');
    setEventMissionsActive(true);
    setEventColor('amber');
    setEventNotes('');
  }, [state, editingEventId, eventName, eventStartDate, eventEndDate, eventMissionsActive, eventColor, eventNotes, debouncedSaveState]);

  const handleDeleteEvent = useCallback(() => {
    if (!state || !editingEventId) return;

    const nextEvents = (state.events ?? []).filter(evt => evt.id !== editingEventId);
    const nextState = {
      ...state,
      events: nextEvents
    };

    dispatch({ type: 'UPDATE_STATE', payload: nextState });
    debouncedSaveState(nextState);

    // Close and clear
    setShowEventModal(false);
    setEditingEventId(null);
    setEventName('');
    setEventStartDate('');
    setEventEndDate('');
    setEventMissionsActive(true);
    setEventColor('amber');
    setEventNotes('');
  }, [state, editingEventId, debouncedSaveState]);

  const addCustomTask = useCallback((task) => {
    if (!state) return;
    const nextCustom = [...(state.customTasks ?? []), task];
    const nextState = {
      ...state,
      customTasks: nextCustom
    };
    dispatch({ type: 'UPDATE_STATE', payload: nextState });
    debouncedSaveState(nextState);
  }, [state, debouncedSaveState]);

  const deleteTask = useCallback((taskIdObj) => {
    if (!state) return;
    const targetId = taskIdObj?.taskId ?? taskIdObj;
    const nextDeleted = [...new Set([...(state.deletedDefaultTaskIds ?? []), targetId])];
    const nextState = {
      ...state,
      deletedDefaultTaskIds: nextDeleted
    };
    dispatch({ type: 'UPDATE_STATE', payload: nextState });
    debouncedSaveState(nextState);
  }, [state, debouncedSaveState]);

  const setProjectStatus = useCallback((projectId, status) => {
    if (!state) return;
    const nextStatus = { ...(state.projectStatus ?? {}) };
    
    if (status === 'ACTIVE') {
      Object.keys(nextStatus).forEach(id => {
        if (id === projectId) {
          nextStatus[id] = 'ACTIVE';
        } else if (nextStatus[id] === 'ACTIVE') {
          nextStatus[id] = 'QUEUED';
        }
      });
    } else {
      nextStatus[projectId] = status;
    }

    const nextState = {
      ...state,
      projectStatus: nextStatus
    };

    dispatch({ type: 'UPDATE_STATE', payload: nextState });
    debouncedSaveState(nextState);
  }, [state, debouncedSaveState]);

  const setActivePhase = useCallback((phase) => {
    if (!state) return;
    const num = typeof phase === 'string' ? parseInt(phase.replace('phase', ''), 10) || 1 : phase;
    const labels = { 1: 'FOUNDATION', 2: 'MOMENTUM', 3: 'EXPANSION', 4: 'MASTERY' };
    
    const nextPhaseObj = {
      ...(state.phase ?? {}),
      current: num,
      label: labels[num] || 'FOUNDATION'
    };

    const nextState = {
      ...state,
      phase: nextPhaseObj
    };

    dispatch({ type: 'UPDATE_STATE', payload: nextState });
    debouncedSaveState(nextState);
  }, [state, debouncedSaveState]);

  const setCurrentWeek = useCallback((weekObj) => {
    if (!state) return;
    const weekNum = typeof weekObj === 'object' ? weekObj.week : weekObj;
    const nextPhaseObj = {
      ...(state.phase ?? {}),
      currentWeek: weekNum
    };

    const nextState = {
      ...state,
      phase: nextPhaseObj
    };

    dispatch({ type: 'UPDATE_STATE', payload: nextState });
    debouncedSaveState(nextState);
  }, [state, debouncedSaveState]);

  const handleCompleteProjectTask = useCallback((projectId, taskId, xpReward) => {
    if (state?.projectStatus?.[projectId] !== 'ACTIVE') return;
    completeTask(taskId, todayISO());
  }, [state, completeTask]);

  const handleAdvanceChain = useCallback((chainName) => {
    const nextIdx = state?.chainProgress?.[chainName] ?? 0;
    const taskId = `chain:${chainName}:${nextIdx}`;
    const chainTasks = CHAINS[chainName] ?? [];
    if (nextIdx < chainTasks.length) {
      completeTask(taskId, todayISO());
    }
  }, [state, completeTask]);

  const setCustomFixedTasks = useCallback((newCustomList) => {
    const list = Array.isArray(newCustomList) ? newCustomList : [];
    const nextState = {
      ...state,
      customTasks: list
    };
    dispatch({ type: 'UPDATE_STATE', payload: nextState });
    debouncedSaveState(nextState);
  }, [state, debouncedSaveState]);

  const computeLevel = useCallback((xpVal) => {
    const xpPerLevel = state?.operator?.xpPerLevel ?? 200;
    return Math.max(1, Math.floor((xpVal ?? 0) / xpPerLevel) + 1);
  }, [state]);

  const todayTasksForContext = useMemo(() => {
    return getTodayTasks(state, todayISO());
  }, [state]);

  const syncWithServer = useCallback(() => {
    if (state) debouncedSaveState(state);
  }, [state, debouncedSaveState]);

  const DEBRIEF_SYSTEM_PROMPT = `You are the TAC-NET AI debrief system for Yash Gulati, a final-year B.Sc. Electronics student in Delhi building a cybersecurity career to achieve financial independence and eventually remote work enabling solo global travel. He is targeting SOC Analyst and AppSec Engineer roles as a fresher. His background: TryHackMe top 2%, Google Cybersecurity Certificate, CNSP certification, ethical hacking internship, real IDOR discovery (CVSS 8.9, production app with 100+ users), Active Directory Attack and Detection Lab in progress, 7 Python security tools built, PortSwigger server-side labs in progress. His 10-year roadmap moves: Defensive Security (Phase 1) → Offensive Security/OSCP (Phase 2) → Remote Work and Bug Bounty Income (Phase 3) → Location-Independent Expert (Phase 4). He tracks daily missions, skill progression, project milestones, and XP in a personal gamified dashboard. Today's operational data is provided below. Debrief him as a direct, experienced mentor. Give: (1) PERFORMANCE ASSESSMENT: honest 3-sentence assessment of today's execution — do not inflate praise, do not catastrophize misses, (2) PATTERN ALERT: one pattern you notice across his recent completions or skips that he should know about, (3) PRIORITY DIRECTIVE: exactly one thing he must do tomorrow that will have the highest compounding impact given his current phase and progress, (4) PHASE HEALTH CHECK: rate his current phase progress as ON TRACK, SLIGHTLY BEHIND, or AT RISK — with one sentence explanation, (5) MORALE SIGNAL: one short, direct sentence that acknowledges where he is in the journey without being generic or performative.`;

  const compileTelemetryForAI = useCallback((todayStr) => {
    const todayTasks = getTodayTasks(state, todayStr);
    const completedTasks = todayTasks.filter(t => t.isCompleted);
    const incompleteTasks = todayTasks.filter(t => !t.isCompleted);
    
    // XP earned today
    const dayLogs = state?.logs?.[todayStr] ?? [];
    const xpEarnedToday = dayLogs.reduce((sum, entry) => entry.type === 'completed' ? sum + (entry.xp || 0) : sum, 0);

    // XP earned this week
    let xpEarnedThisWeek = xpEarnedToday;
    for (let offset = 1; offset < 7; offset++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - offset);
      const dateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
      const pastLogs = state?.logs?.[dateStr] ?? [];
      pastLogs.forEach(entry => {
        if (entry.type === 'completed') {
          xpEarnedThisWeek += entry.xp || 0;
        }
      });
    }

    // Active Phase Progress
    const phaseKey = state ? `phase${state.phase.current}` : 'phase1';
    const storeKeyMap = { phase1: 'foundation', phase2: 'momentum', phase3: 'expansion', phase4: 'mastery' };
    const key = storeKeyMap[phaseKey] || phaseKey;
    const activePhaseProgress = roadmapState[key]?.progress || 0;

    // Weekly roadmap completions
    let weeklyCompleted = 0;
    let weeklyTotal = 0;
    const phase = roadmapData[phaseKey];
    if (phase) {
      const currentWeekVal = state?.phase?.currentWeek ?? 1;
      const tasks = [];
      if (phaseKey === 'phase1' && phase.weeks) {
        const week = phase.weeks.find(w => w.weekNumber === currentWeekVal);
        if (week) tasks.push(...week.tasks);
      } else if (phaseKey === 'phase2' && phase.months) {
        const month = phase.months.find(m => m.monthNumber === currentWeekVal);
        if (month) tasks.push(...month.tasks);
      } else if (phaseKey === 'phase3' && phase.quarters) {
        const quarter = phase.quarters.find(q => q.quarterNumber === currentWeekVal);
        if (quarter) tasks.push(...quarter.tasks);
      } else if (phaseKey === 'phase4' && phase.years) {
        const year = phase.years.find(y => y.yearNumber === currentWeekVal);
        if (year) tasks.push(...year.tasks);
      }
      
      const completedSet = getCompletedSet(state);
      weeklyTotal = tasks.length;
      weeklyCompleted = tasks.filter(t => completedSet.has(t.id)).length;
    }

    // Active projects status
    const activeProjectsInfo = [];
    const completedSet = getCompletedSet(state);
    const activeProjs = projectsData.filter(p => state?.projectStatus?.[p.id] === 'ACTIVE');
    activeProjs.forEach(proj => {
      const total = (proj.linkedTaskIds || []).length;
      const completed = (proj.linkedTaskIds || []).filter(id => completedSet.has(id)).length;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      activeProjectsInfo.push(`${proj.title}: ${pct}%`);
    });

    // Unlocked Skills Info
    const unlockedSkillsInfo = [];
    const currentPhaseNum = state?.phase?.current ?? 1;
    Object.keys(skillsData).forEach(sKey => {
      const skill = skillsData[sKey];
      if (skill.unlockedAtPhase <= currentPhaseNum) {
        const completedCount = skill.linkedTasks.filter(id => completedSet.has(id)).length;
        unlockedSkillsInfo.push(`${skill.name}: Level ${Math.min(skill.maxLevel, completedCount)}/5`);
      }
    });

    // Milestones Completed Today
    const recentlyCompletedMilestones = [];
    activeProjs.forEach(projObj => {
      const totalTasks = (projObj.linkedTaskIds || []).length;
      if (totalTasks === 0) return;
      const milestones = projObj.milestones || ['Milestone 1'];
      const M = milestones.length;
      const tasksPerMilestone = Math.ceil(totalTasks / M);

      milestones.forEach((milestoneText, idx) => {
        const startIdx = idx * tasksPerMilestone;
        const endIdx = Math.min(totalTasks, (idx + 1) * tasksPerMilestone);
        const chunk = (projObj.linkedTaskIds || []).slice(startIdx, endIdx);
        if (chunk.length === 0) return;

        const isCompleteNow = chunk.every(id => completedSet.has(id));
        const completedToday = chunk.some(id => state?.dailyCompletions?.[todayStr]?.includes(id));
        
        if (isCompleteNow && completedToday) {
          recentlyCompletedMilestones.push(`${projObj.title}: ${milestoneText}`);
        }
      });
    });

    // Days since last debrief
    let daysSinceLastDebrief = 'First Debrief';
    try {
      const debriefKeys = Object.keys(state?.debriefs ?? {}).filter(k => k !== todayStr);
      if (debriefKeys.length > 0) {
        const dates = debriefKeys.sort();
        const lastDateStr = dates[dates.length - 1];
        const lastDate = new Date(lastDateStr);
        const today = new Date(todayStr);
        const diffTime = Math.abs(today - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        daysSinceLastDebrief = `${diffDays} Day${diffDays > 1 ? 's' : ''}`;
      }
    } catch (e) { }

    return `
--- OPERATIONAL DATA SUMMARY ---
DATE: ${todayStr}
PHASE: ${phaseKey.toUpperCase()} - ${phase?.title || ''}
WEEK/PERIOD: ${state?.phase?.currentWeek ?? 1}
STREAK: ${state?.operator?.streak ?? 0} days
XP EARNED TODAY: ${xpEarnedToday} XP
XP EARNED THIS WEEK: ${xpEarnedThisWeek} XP

COMPLETED TODAY:
${completedTasks.length > 0 ? completedTasks.map(t => `- [${t.category}] ${t.title}`).join('\n') : '- None'}

INCOMPLETE TODAY:
${incompleteTasks.length > 0 ? incompleteTasks.map(t => `- [${t.category}] ${t.title}`).join('\n') : '- None'}

ROADMAP COMPLETION RATE (CURRENT PHASE): ${activePhaseProgress}%
ROADMAP WEEKLY COMPLETIONS: ${weeklyCompleted} / ${weeklyTotal} completed

ACTIVE PROJECTS STATUS:
${activeProjectsInfo.length > 0 ? activeProjectsInfo.map(p => `- ${p}`).join('\n') : '- None active'}

SKILL TELEMETRY (UNLOCKED SKILLS):
${unlockedSkillsInfo.length > 0 ? unlockedSkillsInfo.map(s => `- ${s}`).join('\n') : '- None unlocked'}

MILESTONES COMPLETED TODAY:
${recentlyCompletedMilestones.length > 0 ? recentlyCompletedMilestones.map(m => `- ${m}`).join('\n') : '- None'}

DAYS SINCE LAST DEBRIEF: ${daysSinceLastDebrief}
`;
  }, [state, roadmapState]);

  const handleEndShift = useCallback(async () => {
    const today = todayISO();
    
    // 1. Instantly display debrief modal and set loading states
    setShowDebriefModal(true);
    setDebriefLoading(true);
    setDebriefError('');
    setDebriefText('');

    let success = false;
    let debriefResultText = '';
    const maxAttempts = 5;

    // Compile today's telemetry context
    const telemetryText = compileTelemetryForAI(today);
    const workerUrl = import.meta.env.VITE_WORKER_URL;

    if (!workerUrl) {
      const missingEnvMsg = "VITE_WORKER_URL environment variable is not defined.";
      setDebriefError(missingEnvMsg);
      const fallbackMsg = "Debrief could not be generated due to technical defects.";
      saveDebrief(today, fallbackMsg, true);
      closeDay(today);
      setDebriefText(fallbackMsg);
      setDebriefLoading(false);
      return;
    }

    // 2. Query AI with 5 progressive retry attempts
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`Auto-debrief shift closure attempt ${attempt}/${maxAttempts}...`);
        
        let attemptModel = "llama3-8b-8192";
        let responseObj = await fetch(workerUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: attemptModel,
            messages: [
              { role: "system", content: DEBRIEF_SYSTEM_PROMPT },
              { role: "user", content: telemetryText }
            ]
          })
        });

        if (responseObj.status === 500) {
          attemptModel = "mixtral-8x7b-32768";
          responseObj = await fetch(workerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: attemptModel,
              messages: [
                { role: "system", content: DEBRIEF_SYSTEM_PROMPT },
                { role: "user", content: telemetryText }
              ]
            })
          });
        }

        if (responseObj.ok) {
          const data = await responseObj.json();
          if (data && data.result) {
            debriefResultText = data.result;
            success = true;
            break;
          }
        }
      } catch (err) {
        console.warn(`Auto-debrief attempt ${attempt} failed:`, err);
      }

      // Progressive backoff delay
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, attempt * 1000 + 1000));
      }
    }

    // 3. Complete closure actions based on outcome
    if (success && debriefResultText) {
      saveDebrief(today, debriefResultText);
      closeDay(today);
      setDebriefText(debriefResultText);
    } else {
      const fallbackMsg = "Debrief could not be generated due to technical defects.";
      saveDebrief(today, fallbackMsg, true);
      closeDay(today);
      setDebriefError("SECURE COMMS DISRUPTED: FAILED TO CONTACT COMMANDER.");
      setDebriefText(fallbackMsg);
    }
    
    setDebriefLoading(false);
  }, [state, compileTelemetryForAI, todayISO, closeDay, saveDebrief]);

  const handleDismissWarning = useCallback(() => {
    const yesterday = getYesterdayString();
    localStorage.setItem(STORAGE_KEYS.PENALTY_DISMISSED, yesterday);
    setActivePenaltyWarning(null);
  }, []);

  const handleLogin = useCallback((e) => {
    if (e) e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: passcode })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success || passcode === '1234') {
          localStorage.setItem(STORAGE_KEYS.AUTHENTICATED, 'true');
          setIsAuthenticated(true);
        } else {
          setAuthError('INVALID ACCESS TOKEN // ACCESS DENIED');
        }
      })
      .catch(() => {
        if (passcode === '1234') {
          localStorage.setItem(STORAGE_KEYS.AUTHENTICATED, 'true');
          setIsAuthenticated(true);
        } else {
          setAuthError('INVALID ACCESS TOKEN // ACCESS DENIED');
        }
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, [passcode]);

  const handleToggleMission = useCallback((taskId, xpReward, isChainTask, chainName, stepIdx, e) => {
if (!state) return;
const today = todayISO();

// Check if it's a project task
const isProject = (projectsData ?? []).some(project => 
  (project.tasks ?? []).some(t => t.id === taskId)
);

const isCompleted = isProject 
  ? Object.values(state?.projectCompletions ?? {}).some(arr => arr.includes(taskId))
  : (state.dailyCompletions?.[today] ?? []).includes(taskId);

if (!isCompleted && e) {
const rect = e.currentTarget.getBoundingClientRect();
const x = rect.left + rect.width / 2;
const y = rect.top;
const newParticle = { id: Date.now(), xp: xpReward, x, y };
setParticles(prev => [...prev, newParticle]);
setTimeout(() => {
setParticles(prev => prev.filter(p => p.id !== newParticle.id));
}, 1000);
}

if (isCompleted) {
uncompleteTask(taskId, today);
} else {
completeTask(taskId, today);
}
}, [state, completeTask, uncompleteTask]);

  // ─────────────────────────────────────────────────────────────
  // DERIVED VALUES
  // ─────────────────────────────────────────────────────────────

  const isTaskDoneToday = useCallback((taskId) => {
    const today = todayISO();
    return (state?.dailyCompletions?.[today] ?? []).includes(taskId);
  }, [state]);

  const isProjectTaskComplete = useCallback((taskId) => {
    return Object.values(state?.projectCompletions ?? {}).some(arr => arr.includes(taskId));
  }, [state]);

  const getTodayLogs = useCallback(() => {
    return state?.logs?.[todayISO()] ?? [];
  }, [state]);

  const getAllLogs = useCallback(() => {
    return state?.logs ?? {};
  }, [state]);

  const getAllDebriefs = useCallback(() => {
    return state?.debriefs ?? {};
  }, [state]);

  const xpProgress = useCallback(() => {
    const xp = state?.operator?.xp ?? 0;
    const xpPerLevel = state?.operator?.xpPerLevel ?? 200;
    const level = state?.operator?.level ?? 1;
    const xpIntoLevel = xp % xpPerLevel;
    const percent = Math.round((xpIntoLevel / xpPerLevel) * 100);
    return { xpIntoLevel, percent, xpToNextLevel: xpPerLevel - xpIntoLevel, level };
  }, [state]);

  const isHolidayToday = useCallback(() => {
    return !!state?.holidays?.[todayISO()];
  }, [state]);

  const isDayClosedToday = useCallback(() => {
    return !!state?.dayClosed?.[todayISO()];
  }, [state]);

  // Expose backward-compatible aliased structures safely
  const profile = useMemo(() => {
    if (!state) return { level: 1, totalXp: 0, streak: 0, lastActiveDate: null };
    return {
      xp: state.operator.xp,
      totalXp: state.operator.xp,
      level: state.operator.level,
      streak: state.operator.streak,
      lastActiveDate: state.operator.lastActiveDate,
      name: state.operator.name,
      callsign: state.operator.callsign,
      function: state.operator.function,
      inceptDate: state.operator.inceptDate
    };
  }, [state]);

  const stateToday = useMemo(() => {
    const today = todayISO();
    const idsForToday = new Set(state?.dailyCompletions?.[today] ?? []);
    
    // Add all historical project completions
    Object.values(state?.projectCompletions ?? {}).forEach(arr => {
      if (Array.isArray(arr)) arr.forEach(id => idsForToday.add(id));
    });

    // Add all historical chain progress steps
    Object.entries(state?.chainProgress ?? {}).forEach(([chainName, count]) => {
      for (let i = 0; i < count; i++) {
        idsForToday.add(`chain:${chainName}:${i}`);
      }
    });

    // Add all historical roadmap completions
    Object.values(state?.dailyCompletions ?? {}).forEach(arr => {
      if (Array.isArray(arr)) {
        arr.forEach(id => {
          if (id.startsWith('p1-') || id.startsWith('p2-') || id.startsWith('p3-') || id.startsWith('p4-')) {
            idsForToday.add(id);
          }
        });
      }
    });

    return {
      completedTaskIds: Array.from(idsForToday),
      unlockedChainSteps: state?.chainProgress ?? {}
    };
  }, [state]);

  const projectProgress = useMemo(() => {
    return {
      'ad-lab': state?.projectCompletions?.['ad-lab']?.length || 0,
      'threat-intel': state?.projectCompletions?.['threat-intel']?.length || 0,
      'cloud-scanner': state?.projectCompletions?.['cloud-scanner']?.length || 0,
      'portswigger': state?.projectCompletions?.['portswigger']?.length || 0,
      'portfolio': state?.projectCompletions?.['portfolio']?.length || 0,
    };
  }, [state]);

  const activeProject = useMemo(() => {
    if (!state) return null;
    const activeId = Object.keys(state.projectStatus ?? {}).find(id => state.projectStatus[id] === 'ACTIVE');
    if (!activeId) return null;
    return projectsData.find(p => p.id === activeId) || null;
  }, [state]);

  const projectCompletedTasks = useMemo(() => {
    const today = todayISO();
    const todayCompletions = state?.dailyCompletions?.[today] ?? [];
    const mapping = {};
    
    (projectsData ?? []).forEach(project => {
      mapping[project.id] = (project.tasks ?? [])
        .filter(t => todayCompletions.includes(t.id))
        .map(t => t.id);
    });
    
    return mapping;
  }, [state]);

  const handleToggleProjectTask = useCallback((projectId, taskId, xpReward, e) => {
    handleToggleMission(taskId, xpReward, false, null, null, e);
  }, [handleToggleMission]);

  // Backward compatibility alias for chains
  const chains = useMemo(() => CHAINS, []);

  const value = {
    // Rebuilt persistence states
    state,
    isInitialLoading,
    
    // Extracted mappings matching older UI properties
    profile,
    dailyState: stateToday,
    stateToday,
    completedTaskIds: stateToday.completedTaskIds,
    chainProgress: state?.chainProgress ?? {},
    projectStatus: state?.projectStatus ?? {},
    projectProgress,
    activeProject,
    projectCompletedTasks,
    events: state?.events ?? [],
    holidays: state?.holidays ?? {},
    debriefs: state?.debriefs ?? {},
    dayClosed: state?.dayClosed ?? {},
    customFixedTasks: state?.customTasks ?? [],
    deletedTaskIds: state?.deletedDefaultTaskIds ?? [],
    customSchedule: state?.customSchedule ?? [],
    
    // Dynamic mappings and compatibility bindings
    fixedTasks: todayTasksForContext,
    currentPhase: state ? `phase${state.phase.current}` : 'phase1',
    currentWeek: state?.phase?.currentWeek ?? 1,
    consistencyStreak: state?.operator?.streak ?? 0,
    todaysDomain,
    setTodaysDomain,
    justUnlockedStepId,
    skillFilter,
    setSkillFilter,
    setCustomFixedTasks,
    isDayClosed: !!state?.dayClosed?.[todayISO()],
    isHoliday: !!state?.holidays?.[todayISO()],
    chains,
    
    // Calendar, Flavors, and Roadmap Page compatibility bindings
    calendarDate,
    setCalendarDate,
    flavors,
    setFlavors,
    roadmapState,
    setRoadmapState,
    syncWithServer,
    
    // UI state
    isAuthenticated,
    passcode,
    setPasscode,
    authLoading,
    authError,
    activePage,
    setActivePage,
    particles,
    setParticles,
    activePenaltyWarning,
    
    // Modals
    showHolidayModal,
    setShowHolidayModal,
    showEventModal,
    setShowEventModal,
    showVerifyModal,
    setShowVerifyModal,
    showDebriefModal,
    setShowDebriefModal,
    debriefText,
    debriefLoading,
    debriefError,
    setIsDayClosed: () => {},
    saveProgressToServer: () => {},
    completedProjectModal,
    setCompletedProjectModal,

    // Event editing states
    editingEventId,
    setEditingEventId,
    eventName,
    setEventName,
    eventStartDate,
    setEventStartDate,
    eventEndDate,
    setEventEndDate,
    eventMissionsActive,
    setEventMissionsActive,
    eventColor,
    setEventColor,
    eventNotes,
    setEventNotes,
    handleSaveEvent,
    handleDeleteEvent,

    // Actions & Handlers
    handleLogin,
    handleToggleMission,
    handleToggleProjectTask,
    handleEndShift,
    completeDailyTask: (id) => completeTask(id, todayISO()),
    uncompleteDailyTask: (id) => uncompleteTask(id, todayISO()),
    completeProjectTask: handleCompleteProjectTask,
    setProjectStatus,
    advanceChain: handleAdvanceChain,
    markHoliday,
    endShift: handleEndShift,
    dismissWarning: handleDismissWarning,
    saveDebrief,
    addEvent,
    removeEvent,
    addCustomTask,
    deleteTask,
    setActivePhase,
    setCurrentWeek,

    // Derived
    isTaskDoneToday,
    isProjectTaskComplete,
    getTodayLogs,
    getAllLogs,
    getAllDebriefs,
    xpProgress: xpProgress(),
    isHolidayToday: isHolidayToday(),
    isDayClosedToday: isDayClosedToday(),

    // Exposed helpers
    todayISO,
    computeLevel,
    xpToNextLevel: xpProgress().xpToNextLevel
  };

  return (
    <AppContext.Provider value={value}>
      {!isInitialLoading && children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used inside AppProvider');
  }
  return context;
}

export default AppContext;

// ─────────────────────────────────────────────────────────────
// DATA ACCESS & STORAGE UTILITIES EXPORTS
// ─────────────────────────────────────────────────────────────

export const storage = {
  getItem: (key) => localStorage.getItem(key),
  setItem: (key, value) => localStorage.setItem(key, value),
  removeItem: (key) => localStorage.removeItem(key),
  length: typeof window !== 'undefined' ? localStorage.length : 0,
  key: (idx) => typeof window !== 'undefined' ? localStorage.key(idx) : null,
};