// src/hooks/useRoadmapProgress.js
// Purpose: Custom hook that computes stats (SIGINT, OPS, ARSENAL, COMMS, DISCIPLINE, ENDURANCE) and overall roadmap readiness.

import { useMemo } from 'react';
import { getTodayString } from '../utils/helpers';
import { PROJECTS } from '../data/projectsData';

export function useRoadmapProgress(profile, dailyState, chainProgress, projectProgress, fixedTasks, chains, events) {
  const computedStats = useMemo(() => {
    const todayStr = getTodayString ? getTodayString() : new Date().toISOString().split('T')[0];

    // Calculate active days in last 7 days (non-holiday, non-suspended)
    let activeDays7 = 0;
    for (let offset = 0; offset < 7; offset++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - offset);
      const dateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;

      const isHoliday = localStorage.getItem(`holiday:${dateStr}`) !== null || window.storage?.getItem?.(`holiday:${dateStr}`) !== null;
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
    fixedTasks.forEach(task => {
      counts7Days[task.id] = 0;
    });

    for (let offset = 0; offset < 7; offset++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - offset);
      const dateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;

      if (dateStr === todayStr) {
        dailyState.completedTaskIds.forEach(taskId => {
          if (taskId.startsWith('fixed:')) {
            counts7Days[taskId] = (counts7Days[taskId] || 0) + 1;
          }
        });
      } else {
        const logsRaw = localStorage.getItem(`log:${dateStr}`) || window.storage?.getItem?.(`log:${dateStr}`);
        if (logsRaw) {
          try {
            const logs = JSON.parse(logsRaw);
            if (Array.isArray(logs)) {
              logs.forEach(log => {
                if (log.type === 'completed') {
                  const fixedTask = fixedTasks.find(task => task.title === log.taskName);
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
    let totalRoadmapLabsDefined = 0;
    let totalRoadmapLabsCompleted = 0;
    Object.keys(chains).forEach(chainName => {
      chains[chainName].forEach(step => {
        if (step.category === 'ROADMAP' || step.category === 'LABS') {
          totalRoadmapLabsDefined++;
        }
      });
      const completedCount = chainProgress[chainName] || 0;
      for (let stepIndex = 0; stepIndex < completedCount; stepIndex++) {
        const step = chains[chainName][stepIndex];
        if (step && (step.category === 'ROADMAP' || step.category === 'LABS')) {
          totalRoadmapLabsCompleted++;
        }
      }
    });
    const sigint = totalRoadmapLabsDefined > 0 ? Math.min(100, Math.round((totalRoadmapLabsCompleted / totalRoadmapLabsDefined) * 100)) : 0;

    // 2. OPS — Execution speed
    const opsTasks = fixedTasks.filter(task => task.category === 'OPS');
    const opsCompleted = opsTasks.reduce((sum, task) => sum + (counts7Days[task.id] || 0), 0);
    const ops = opsTasks.length > 0 ? Math.min(100, Math.round((opsCompleted / (opsTasks.length * activeDays7)) * 100)) : 0;

    // 3. ARSENAL — Active projects
    let totalProjectTasks = 0;
    let totalProjectProgress = 0;
    PROJECTS.forEach(project => {
      totalProjectTasks += (project.linkedTaskIds || []).length;
      totalProjectProgress += projectProgress[project.id] || 0;
    });
    const arsenal = totalProjectTasks > 0 ? Math.min(100, Math.round((totalProjectProgress / totalProjectTasks) * 100)) : 0;

    // 4. COMMS — Interview readiness
    let totalCommsStepsDefined = 0;
    let totalCommsStepsCompleted = 0;
    Object.keys(chains).forEach(chainName => {
      chains[chainName].forEach(step => {
        if (step.category === 'COMMS') {
          totalCommsStepsDefined++;
        }
      });
      const completedCount = chainProgress[chainName] || 0;
      for (let stepIndex = 0; stepIndex < completedCount; stepIndex++) {
        const step = chains[chainName][stepIndex];
        if (step && step.category === 'COMMS') {
          totalCommsStepsCompleted++;
        }
      }
    });
    const commsFixedTasks = fixedTasks.filter(task => task.category === 'COMMS');
    const commsFixedCompleted = commsFixedTasks.reduce((sum, task) => sum + (counts7Days[task.id] || 0), 0);
    const comms = (totalCommsStepsDefined + commsFixedTasks.length * activeDays7) > 0
      ? Math.min(100, Math.round(((totalCommsStepsCompleted + commsFixedCompleted) / (totalCommsStepsDefined + commsFixedTasks.length * activeDays7)) * 100))
      : 0;

    // 5. DISCIPLINE — Schedule adherence
    const disciplineTasks = fixedTasks.filter(task => task.category === 'DISCIPLINE');
    const disciplineCompleted = disciplineTasks.reduce((sum, task) => sum + (counts7Days[task.id] || 0), 0);
    const discipline = disciplineTasks.length > 0 ? Math.min(100, Math.round((disciplineCompleted / (disciplineTasks.length * activeDays7)) * 100)) : 0;

    // 6. ENDURANCE — Physical/mental
    const enduranceTasks = fixedTasks.filter(task => task.category === 'PHYSICAL' || task.category === 'SOCIAL');
    const enduranceCompleted = enduranceTasks.reduce((sum, task) => sum + (counts7Days[task.id] || 0), 0);
    const endurance = enduranceTasks.length > 0 ? Math.min(100, Math.round((enduranceCompleted / (enduranceTasks.length * activeDays7)) * 100)) : 0;

    return {
      sigint,
      ops,
      arsenal,
      comms,
      discipline,
      endurance
    };
  }, [dailyState.completedTaskIds, chainProgress, fixedTasks, chains, events, projectProgress]);

  const mainObjectiveProgress = useMemo(() => {
    // 1. Skills learned (35% weight)
    const sigintContribution = computedStats.sigint * 0.35;

    // 2. Applications sent (30% weight)
    let applyRolesCount = 0;
    if (dailyState.completedTaskIds.includes('fixed:apply_roles')) {
      applyRolesCount++;
    }
    const todayStr = getTodayString ? getTodayString() : new Date().toISOString().split('T')[0];
    const allKeys = [];
    try {
      const store = window.storage || localStorage;
      for (let index = 0; index < store.length; index++) {
        const key = store.key(index);
        if (key && key.startsWith('log:')) {
          allKeys.push(key);
        }
      }
    } catch {
      const store = window.storage || localStorage;
      Object.keys(store).forEach(key => {
        if (key.startsWith('log:')) {
          allKeys.push(key);
        }
      });
    }

    const storeObj = window.storage || localStorage;
    allKeys.forEach(key => {
      if (key === `log:${todayStr}`) return;
      const raw = storeObj.getItem ? storeObj.getItem(key) : storeObj[key];
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

    // 3. Interview readiness (20% weight)
    const commsContribution = computedStats.comms * 0.20;

    // 4. Lab hours (15% weight)
    let labsBuildCount = 0;
    dailyState.completedTaskIds.forEach(taskId => {
      if (taskId.startsWith('chain:')) {
        const idParts = taskId.split(':');
        if (idParts.length === 3) {
          const chainName = idParts[1];
          const stepIndex = parseInt(idParts[2], 10);
          const chain = chains[chainName];
          if (chain && chain[stepIndex]) {
            const task = chain[stepIndex];
            if (task.category === 'LABS' || task.category === 'BUILD') {
              labsBuildCount++;
            }
          }
        }
      } else {
        const task = fixedTasks.find(t => t.id === taskId);
        if (task && (task.category === 'LABS' || task.category === 'BUILD')) {
          labsBuildCount++;
        }
      }
    });

    allKeys.forEach(key => {
      if (key === `log:${todayStr}`) return;
      const raw = storeObj.getItem ? storeObj.getItem(key) : storeObj[key];
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

  return { computedStats, mainObjectiveProgress };
}
