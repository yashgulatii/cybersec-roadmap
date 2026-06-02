// src/constants/index.js
// Purpose: Declares named constants and system thresholds to replace raw numbers in daily checklist logic, streaks, and debrief parameters.

export const MAX_DAILY_TASKS = 3;

export const XP_PER_TASK_CATEGORY = {
  PERSONAL: 25,
  CAREER: 40,
  LAB: 50,
  LEARNING: 35,
  TRAVEL: 20,
  CREATIVE: 30,
  DAILY: 20
};

export const STREAK_RESET_THRESHOLD = 1; // Days since last active to consider streak broken

export const DEBRIEF_COOLDOWN_HOURS = 8; // Hours between operational reviews

export const PHASES = [
  { id: "phase1", name: "Phase 1 - Foundation" },
  { id: "phase2", name: "Phase 2 - Momentum" },
  { id: "phase3", name: "Phase 3 - Expansion" },
  { id: "phase4", name: "Phase 4 - Mastery" }
];
