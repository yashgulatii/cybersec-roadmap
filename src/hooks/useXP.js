// src/hooks/useXP.js
// Purpose: Handles leveling calculation based on total accumulated XP.

import { useMemo } from 'react';
import { XP_PER_LEVEL } from '../data/characterData';

export function useXP(profile) {
  const levelProgress = useMemo(() => {
    const totalXp = profile?.totalXp || 0;
    const currentLevel = profile?.level || Math.floor(totalXp / XP_PER_LEVEL) + 1;
    const currentLevelXp = totalXp % XP_PER_LEVEL;
    const percentage = (currentLevelXp / XP_PER_LEVEL) * 100;
    return {
      level: currentLevel,
      xpInLevel: currentLevelXp,
      xpToNextLevel: XP_PER_LEVEL - currentLevelXp,
      percent: percentage,
      percentage
    };
  }, [profile?.totalXp, profile?.level]);

  return { levelProgress };
}
