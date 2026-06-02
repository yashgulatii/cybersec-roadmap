// src/utils/helpers.js
// Purpose: Shared operational utilities and calculations including date string formats, label mappers, and progress rate calculators.

export const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const getYesterdayString = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const getISOWeekString = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

export const getWeekLabel = (phaseId, weekNum) => {
  if (phaseId === 'phase1') return `Week ${weekNum}`;
  if (phaseId === 'phase2') return `Month ${weekNum}`;
  if (phaseId === 'phase3') return `Quarter ${weekNum}`;
  if (phaseId === 'phase4') return `Year ${weekNum}`;
  return `Period ${weekNum}`;
};

export const getStateKey = (phaseId) => {
  if (phaseId === 'phase1') return 'foundation';
  if (phaseId === 'phase2') return 'momentum';
  if (phaseId === 'phase3') return 'expansion';
  if (phaseId === 'phase4') return 'mastery';
  return phaseId;
};

export const calculateProgressPercentage = (completed, total) => {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
};


export function getTaskChainState(projectTasks, completedTaskIds) {
  const completedSet = new Set(completedTaskIds);
  return projectTasks
    .sort((a, b) => a.chainIndex - b.chainIndex)
    .map((task, index, sorted) => {
      const isComplete = completedSet.has(task.id);
      const prevComplete = index === 0
        ? true
        : completedSet.has(sorted[index - 1].id);
      const isUnlocked = prevComplete;
      const isLocked = !isUnlocked;
      const isCurrent = isUnlocked && !isComplete;
      return { ...task, isComplete, isUnlocked, isLocked, isCurrent };
    });
}

export function getCurrentTask(projectTasks, completedTaskIds) {
  const chain = getTaskChainState(projectTasks, completedTaskIds);
  return chain.find(t => t.isCurrent) ?? null;
}

export function getProjectProgress(projectTasks, completedTaskIds) {
  const completedSet = new Set(completedTaskIds);
  const completed = projectTasks.filter(t => completedSet.has(t.id)).length;
  const total = projectTasks.length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { completed, total, percent };
}
