// src/pages/SkillMap.jsx
// Purpose: Displays the structured cybersecurity skill tree map reflecting skillsData, with locked phase gates, active week task pulses, interactive details, and fully integrated checklist toggles.

import React, { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../store/appStore';
import { skillsData } from '../data/skillsData';
import { roadmapData } from '../data/roadmapData';
import CategoryTag from '../components/ui/CategoryTag';
import ProgressBar from '../components/ui/ProgressBar';

const TREE_COLORS = {
  'Defensive Security': 'var(--accent-blue)',
  'Offensive Security': '#ff3366',
  'Tools': '#bd5eff',
  'Creative': 'var(--accent-green)',
  'Personal': 'var(--accent-orange)'
};

export default function SkillMap() {
  const {
    currentPhase,
    setCurrentPhase,
    currentWeek,
    setCurrentWeek,
    setActivePage,
    stateToday,
    skillFilter,
    setSkillFilter,
    handleToggleMission,
    roadmapState,
    setRoadmapState,
    syncWithServer,
    profile,
    chainProgress,
    isDayClosed,
    chains
  } = useAppStore();

  const [selectedSkillId, setSelectedSkillId] = useState(null);

  // Sync skillFilter from URL or click routing
  useEffect(() => {
    if (skillFilter) {
      const matchedKey = Object.keys(skillsData).find(
        key => key === skillFilter ||
               skillsData[key].id === skillFilter ||
               String(skillsData[key]?.name || '').toLowerCase() === String(skillFilter || '').toLowerCase()
      );
      if (matchedKey) {
        setSelectedSkillId(matchedKey);
      }
    }
  }, [skillFilter]);

  // Determine current active phase number
  const currentPhaseNum = useMemo(() => {
    return parseInt(String(currentPhase ?? '').replace('phase', ''), 10) || 1;
  }, [currentPhase]);

  // Extract all tasks active inside the current week/month/quarter/year
  const currentWeekTasks = useMemo(() => {
    const phase = roadmapData[currentPhase];
    if (!phase) return [];

    const tasks = [];
    if (currentPhase === 'phase1' && phase.weeks) {
      const week = phase.weeks.find(w => w.weekNumber === currentWeek);
      if (week) tasks.push(...week.tasks);
    } else if (currentPhase === 'phase2' && phase.months) {
      const month = phase.months.find(m => m.monthNumber === currentWeek);
      if (month) tasks.push(...month.tasks);
    } else if (currentPhase === 'phase3' && phase.quarters) {
      const quarter = phase.quarters.find(q => q.quarterNumber === currentWeek);
      if (quarter) tasks.push(...quarter.tasks);
    } else if (currentPhase === 'phase4' && phase.years) {
      const year = phase.years.find(y => y.yearNumber === currentWeek);
      if (year) tasks.push(...year.tasks);
    }

    return tasks;
  }, [currentPhase, currentWeek]);

  // Group all skills by their tree structure
  const groupedSkills = useMemo(() => {
    const groups = {};
    
    // First, map all roadmap tasks to their skill matches
    const skillTaskMap = {};
    Object.keys(skillsData).forEach(id => { skillTaskMap[id] = []; });
    
    const normalize = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
    
    ['phase1', 'phase2', 'phase3', 'phase4'].forEach(pKey => {
      const phase = roadmapData[pKey];
      if (!phase) return;
      const sections = phase.weeks || phase.months || phase.quarters || phase.years || [];
      sections.forEach(sec => {
        (sec.tasks || []).forEach(task => {
          if (!task.linkedSkill) return;
          const tSkill = normalize(task.linkedSkill);
          Object.values(skillsData).forEach(skill => {
            if (tSkill === normalize(skill.name) || tSkill === normalize(skill.id)) {
              skillTaskMap[skill.id].push(task);
            } else if ((skill.linkedTasks || []).includes(task.id)) {
              skillTaskMap[skill.id].push(task);
            }
          });
        });
      });
    });

    // Also map chains tasks dynamically
    if (chains) {
      Object.keys(chains).forEach(chainName => {
        const tasksArray = Array.isArray(chains[chainName]) ? chains[chainName] : (chains[chainName].tasks || []);
        tasksArray.forEach((task, index) => {
          const taskId = `chain:${chainName}:${index}`;
          let targetSkillKey = null;
          if (chainName === 'NETWORKING') {
            targetSkillKey = 'network_fundamentals';
          } else if (chainName === 'LINUX') {
            targetSkillKey = 'kali_linux';
          } else if (chainName === 'SOC OPERATIONS') {
            targetSkillKey = 'siem_splunk';
          } else if (chainName === 'WEB SECURITY') {
            targetSkillKey = 'web_app_testing';
          } else if (chainName === 'TOOLS MASTERY') {
            targetSkillKey = 'kali_linux';
          } else if (chainName === 'ACTIVE DIRECTORY') {
            targetSkillKey = 'ad_defense';
          } else if (chainName === 'INTERVIEW PREP') {
            targetSkillKey = 'communication';
          }

          if (targetSkillKey && skillTaskMap[targetSkillKey]) {
            const normalizedTask = {
              id: taskId,
              title: task.title,
              category: task.category || 'LABS',
              xpReward: task.xp || task.xpReward || 50,
              isChainTask: true,
              chainName
            };
            if (!skillTaskMap[targetSkillKey].some(t => t.id === taskId)) {
              skillTaskMap[targetSkillKey].push(normalizedTask);
            }
          }
        });
      });
    }

    Object.values(skillsData).forEach(skill => {
      const key = skill.id;
      const tree = skill.tree;
      if (!groups[tree]) groups[tree] = [];

      const linked = skillTaskMap[skill.id] || [];
      const completedCount = linked.filter(t => stateToday?.completedTaskIds?.includes(t.id)).length;
      
      const isLocked = skill.unlockedAtPhase > currentPhaseNum;
      
      const isActiveThisWeek = currentWeekTasks.some(task => 
        linked.some(lt => lt.id === task.id)
      );

      const skillWithMeta = {
        ...skill,
        key,
        completedCount,
        isLocked,
        isActiveThisWeek,
      };

      groups[tree].push(skillWithMeta);
    });

    return groups;
  }, [stateToday?.completedTaskIds, currentPhaseNum, currentWeekTasks, chains]);

  // Find all advancing tasks in roadmapData and chains for a given skill
  const skillAdvancements = useMemo(() => {
    if (!selectedSkillId) return [];
    const skill = skillsData[selectedSkillId];
    if (!skill) return [];

    const advancements = [];
    const normalize = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const sNameNorm = normalize(skill.name);
    const sIdNorm = normalize(skill.id);
    
    // 1. Process roadmapData
    ['phase1', 'phase2', 'phase3', 'phase4'].forEach(phaseKey => {
      const phaseObj = roadmapData[phaseKey];
      if (!phaseObj) return;
      
      const sectionsList = phaseObj.weeks || phaseObj.months || phaseObj.quarters || phaseObj.years || [];
      const phaseTitle = phaseKey === 'phase1' ? 'Phase 1' :
                         phaseKey === 'phase2' ? 'Phase 2' :
                         phaseKey === 'phase3' ? 'Phase 3' : 'Phase 4';
                         
      sectionsList.forEach((sec, secIdx) => {
        const secNumber = sec.weekNumber || sec.monthNumber || sec.quarterNumber || sec.yearNumber || (secIdx + 1);
        let secLabel = '';
        if (sec.weekNumber) secLabel = `Week ${sec.weekNumber}`;
        else if (sec.monthNumber) secLabel = `Month ${sec.monthNumber}`;
        else if (sec.quarterNumber) secLabel = `Quarter ${sec.quarterNumber}`;
        else if (sec.yearNumber) secLabel = `Year ${sec.yearNumber}`;
        
        const secTasks = sec.tasks || [];
        secTasks.forEach(task => {
          const tSkillNorm = normalize(task.linkedSkill);
          const matchesSkill = 
            (task.linkedSkill && (tSkillNorm === sNameNorm || tSkillNorm === sIdNorm)) ||
            (skill.linkedTasks && skill.linkedTasks.includes(task.id));

          if (matchesSkill) {
            advancements.push({ phaseTitle, secLabel, task, phaseKey, secNumber });
          }
        });
      });
    });

    // 2. Process chains from AppStore
    if (chains) {
      Object.keys(chains).forEach(chainName => {
        const tasksArray = Array.isArray(chains[chainName]) ? chains[chainName] : (chains[chainName].tasks || []);
        tasksArray.forEach((task, index) => {
          const taskId = `chain:${chainName}:${index}`;
          if (skill.linkedTasks && skill.linkedTasks.includes(taskId)) {
            if (!advancements.some(adv => adv.task.id === taskId)) {
              advancements.push({
                phaseTitle: 'Skill Chain',
                secLabel: chainName,
                task: {
                  id: taskId,
                  title: task.title,
                  description: 'Complete this step in the progressive skill chain to level up this skill.',
                  category: task.category || 'LABS',
                  xpReward: task.xp || task.xpReward || 50,
                  isChainTask: true,
                  chainName
                },
                phaseKey: currentPhase,
                secNumber: currentWeek
              });
            }
          }
        });
      });
    }

    return advancements;
  }, [selectedSkillId, chains, currentPhase, currentWeek]);

  // Selected skill instance
    const selectedSkill = useMemo(() => {
    if (!selectedSkillId) return null;
    const skill = skillsData[selectedSkillId];
    if (!skill) return null;
    
    // Compute completedCount from dynamically found skillAdvancements instead of hardcoded linkedTasks
    const completedCount = skillAdvancements.filter(({ task }) => 
      stateToday?.completedTaskIds?.includes(task.id)
    ).length;
    
    const isLocked = skill.unlockedAtPhase > currentPhaseNum;

    return {
      ...skill,
      completedCount,
      isLocked
    };
  }, [selectedSkillId, stateToday?.completedTaskIds, currentPhaseNum, skillAdvancements]);

  // Helper to fetch completion fraction for a specific phase (used to update phase progress when toggling task)
  const getPhaseTaskFraction = (phaseId, completedIds = []) => {
    const phase = roadmapData[phaseId];
    if (!phase) return { completed: 0, total: 0 };
    
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

    return { completed, total };
  };

  // Safe handler to toggle a task directly from the Skill Map details checklist
  const handleTaskToggle = async (task, e) => {
    if (isDayClosed) return;

    // Trigger central task check/uncheck
    await handleToggleMission(task.id, task.xpReward || 0, false, null, null, e);

    // Safely recalculate the phase progress rate containing this task
    let taskPhase = null;
    let storeKey = null;

    ['phase1', 'phase2', 'phase3', 'phase4'].forEach(pKey => {
      const phase = roadmapData[pKey];
      if (!phase) return;
      const sectionsList = phase.weeks || phase.months || phase.quarters || phase.years || [];
      const hasTask = sectionsList.some(sec => (sec.tasks || []).some(t => t.id === task.id));
      if (hasTask) {
        taskPhase = pKey;
        if (pKey === 'phase1') storeKey = 'foundation';
        else if (pKey === 'phase2') storeKey = 'momentum';
        else if (pKey === 'phase3') storeKey = 'expansion';
        else if (pKey === 'phase4') storeKey = 'mastery';
      }
    });

    if (taskPhase && storeKey) {
      const currentCompleted = stateToday?.completedTaskIds || [];
      const updatedCompletedIds = currentCompleted.includes(task.id)
        ? currentCompleted.filter(id => id !== task.id)
        : [...currentCompleted, task.id];

      const fraction = getPhaseTaskFraction(taskPhase, updatedCompletedIds);
      const nextProgressVal = fraction.total > 0 ? Math.round((fraction.completed / fraction.total) * 100) : 0;

      const activeState = roadmapState[storeKey] || { progress: 0, status: 'Not Started' };
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
      syncWithServer(profile, stateToday, chainProgress);
    }
  };

  const handleSelectSkill = (skillKey) => {
    setSelectedSkillId(skillKey);
    setSkillFilter(skillKey);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Inline styles for neon cyber highlights and pulses */}
      <style>{`
        @keyframes skillPulseHighlight {
          0% { border-color: rgba(245, 166, 35, 0.4); box-shadow: 0 0 4px rgba(245, 166, 35, 0.2); }
          50% { border-color: var(--accent-amber); box-shadow: 0 0 16px rgba(245, 166, 35, 0.6); }
          100% { border-color: rgba(245, 166, 35, 0.4); box-shadow: 0 0 4px rgba(245, 166, 35, 0.2); }
        }
        .skill-active-pulse {
          animation: skillPulseHighlight 2.5s infinite ease-in-out;
          border: 1px solid var(--accent-amber) !important;
        }
        .skill-hover-card {
          transition: all 0.2s ease-in-out;
        }
        .skill-hover-card:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.02) !important;
          border-color: rgba(255, 255, 255, 0.25) !important;
        }
        .skill-locked-card {
          filter: grayscale(0.5);
          opacity: 0.55;
          transition: all 0.2s;
        }
        .skill-locked-card:hover {
          opacity: 0.85;
          filter: grayscale(0.2);
        }
      `}</style>

      {/* Main Terminal Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px dashed var(--border-color)',
        paddingBottom: '14px'
      }}>
        <h2 style={{
          margin: 0,
          fontFamily: 'var(--font-mono)',
          fontSize: '18px',
          color: 'var(--accent-amber)',
          letterSpacing: '0.05em'
        }}>
          🗺️ TAC-NET CENTRAL SKILL TREE
        </h2>
        {skillFilter && (
          <button
            onClick={() => {
              setSkillFilter('');
              setSelectedSkillId(null);
            }}
            className="dark-date-picker"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              padding: '4px 10px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--accent-coral)',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >CLEAR ACTIVE FILTER</button>
        )}
      </div>

      {/* Two-Column Responsive Layout */}
      <div style={{
        display: 'flex',
        gap: '24px',
        width: '100%',
        alignItems: 'flex-start',
        flexWrap: 'wrap'
      }}>
        
        {/* Left Column: Skill Categories Grid */}
        <div style={{
          flex: '1 1 600px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          minWidth: '0'
        }}>
          {Object.entries(groupedSkills).map(([treeName, skills]) => {
            const totalCount = skills.length;
            const advancedCount = skills.filter(s => s.completedCount > 0).length;
            const treeColor = TREE_COLORS[treeName] || 'var(--accent-amber)';

            return (
              <div key={treeName} style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Category Header */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid var(--border-color)',
                  borderLeft: `4px solid ${treeColor}`,
                  padding: '10px 16px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  letterSpacing: '0.05em',
                  color: 'var(--text-main)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <span style={{ textTransform: 'uppercase' }}>// {treeName}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {advancedCount} / {totalCount} ADVANCED
                  </span>
                </div>

                {/* Skills Cards Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '12px'
                }}>
                  {skills.map(skill => {
                    const isSelected = selectedSkillId === skill.key;
                    const cardBorder = isSelected 
                      ? '1px solid var(--accent-amber)' 
                      : '1px solid var(--border-color)';
                    const cardBg = isSelected 
                      ? 'rgba(245, 166, 35, 0.02)' 
                      : 'var(--bg-card)';

                    let cardClass = "skill-hover-card";
                    if (skill.isLocked) cardClass += " skill-locked-card";
                    if (skill.isActiveThisWeek) cardClass += " skill-active-pulse";

                    return (
                      <div
                        key={skill.key}
                        onClick={() => handleSelectSkill(skill.key)}
                        className={cardClass}
                        style={{
                          background: cardBg,
                          border: cardBorder,
                          padding: '14px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}
                      >
                        {/* Title and Lock Badge */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 'bold',
                            fontSize: '13px',
                            color: 'var(--text-main)',
                            lineHeight: '1.4'
                          }}>
                            {skill.name}
                          </span>
                          {skill.isLocked ? (
                            <span style={{ fontSize: '12px' }} title={`Locked until Phase ${skill.unlockedAtPhase}`}>🔒</span>
                          ) : skill.isActiveThisWeek ? (
                            <span style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '9px',
                              background: 'rgba(245, 166, 35, 0.1)',
                              color: 'var(--accent-amber)',
                              border: '1px solid var(--accent-amber)',
                              padding: '1px 4px',
                              fontWeight: 'bold'
                            }}>
                              ACTIVE
                            </span>
                          ) : null}
                        </div>

                        {/* Lock Sub-label */}
                        {skill.isLocked && (
                          <div style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '9px',
                            color: 'var(--accent-coral)',
                            fontWeight: 'bold'
                          }}>Unlocks in Phase {skill.unlockedAtPhase}</div>
                        )}

                        {/* Level and Completion Stats */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: '4px'
                        }}>
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11px',
                            color: skill.isLocked ? 'var(--text-muted)' : treeColor,
                            fontWeight: 'bold'
                          }}>
                            LVL {skill.completedCount} / {skill.maxLevel}
                          </span>
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '10px',
                            color: 'var(--text-muted)'
                          }}>
                            {skill.completedCount} / {skill.linkedTasks?.length || 0} Tasks
                          </span>
                        </div>

                        {/* Neon Level Bar */}
                        <div style={{ marginTop: '2px' }}>
                          <ProgressBar
                            percentage={skill.levelPct}
                            color={skill.isLocked ? 'rgba(255, 255, 255, 0.15)' : treeColor}
                            height="4px"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Interactive Detail View Panel */}
        <div style={{
          flex: '1 1 350px',
          maxWidth: '420px',
          position: 'sticky',
          top: '20px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          padding: '24px',
          alignSelf: 'flex-start',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          minWidth: '320px'
        }}>
          {!selectedSkill ? (
            /* Standby / No selection telemetry display */
            <div style={{
              border: '1px dashed var(--border-color)',
              padding: '60px 20px',
              textAlign: 'center',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '380px'
            }}>
              <div style={{ fontSize: '28px', marginBottom: '16px' }}>🛰️</div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--accent-amber)', letterSpacing: '0.1em' }}>STANDBY - SYSTEM IDLE</div>
              <div style={{ fontSize: '11px', marginTop: '12px', maxWidth: '260px', lineHeight: '1.6' }}>
                Decryption grid operational. Select a defensive, offensive, or core tool skill module to display structural telemetry.
              </div>
            </div>
          ) : (
            /* Active skill telemetry detail view */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Header block */}
              <div style={{ borderBottom: '1px dashed var(--border-color)', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    color: TREE_COLORS[selectedSkill.tree] || 'var(--accent-amber)',
                    border: `1px solid ${TREE_COLORS[selectedSkill.tree] || 'var(--accent-amber)'}`,
                    padding: '1px 5px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    {selectedSkill.tree}
                  </span>
                  
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    color: selectedSkill.isLocked ? 'var(--accent-coral)' : 'var(--accent-green)',
                    fontWeight: 'bold'
                  }}>
                    {selectedSkill.isLocked 
                      ? `[ LOCKDOWN - PHASE ${selectedSkill.unlockedAtPhase} ]` 
                      : '[ INTEGRATED ]'}
                  </span>
                </div>

                <h3 style={{
                  margin: '8px 0 0 0',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '18px',
                  color: 'var(--text-main)',
                  lineHeight: '1.3'
                }}>
                  {selectedSkill.name}
                </h3>
              </div>

              {/* Stats Panel */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid var(--border-color)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                    CURRENT SYSTEM LEVEL:
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    color: TREE_COLORS[selectedSkill.tree] || 'var(--accent-amber)',
                    fontWeight: 'bold'
                  }}>
                    LVL {selectedSkill.completedCount} / {selectedSkill.maxLevel}
                  </span>
                </div>

                {/* Level Blocks */}
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '2px' }}>
                  {(() => {
                    const blocks = [];
                    const activeColor = TREE_COLORS[selectedSkill.tree] || 'var(--accent-amber)';
                    for (let i = 1; i <= selectedSkill.maxLevel; i++) {
                      const filled = i <= selectedSkill.completedCount;
                      blocks.push(
                        <div
                          key={i}
                          style={{
                            width: '18px',
                            height: '14px',
                            marginRight: '6px',
                            background: filled ? activeColor : 'rgba(255, 255, 255, 0.03)',
                            border: `1px solid ${filled ? activeColor : 'var(--border-color)'}`,
                            boxShadow: filled ? `0 0 6px ${activeColor}` : 'none'
                          }}
                        />
                      );
                    }
                    return blocks;
                  })()}
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px dashed var(--border-color)',
                  paddingTop: '10px',
                  marginTop: '4px'
                }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                    COMPLETED TASKS:
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: 'var(--text-main)',
                    fontWeight: 'bold'
                  }}>
                    {selectedSkill.completedCount} / {selectedSkill.linkedTasks?.length || 0}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  color: 'var(--text-muted)',
                  fontWeight: 'bold'
                }}>
                  DESCRIPTION / APPLICATIONS:
                </span>
                <p style={{
                  margin: 0,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--text-main)',
                  lineHeight: '1.6',
                  background: 'rgba(255,255,255,0.01)',
                  borderLeft: '2px solid var(--border-color)',
                  paddingLeft: '10px'
                }}>
                  {selectedSkill.description}
                </p>
              </div>

              {/* Linked Roadmap Advancements / Checklist */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  color: 'var(--text-muted)',
                  fontWeight: 'bold'
                }}>
                  ROADMAP PIPELINES & ADVANCEMENTS:
                </span>

                {skillAdvancements.length === 0 ? (
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    fontStyle: 'italic',
                    background: 'rgba(255,255,255,0.01)',
                    padding: '12px',
                    border: '1px dashed var(--border-color)',
                    textAlign: 'center'
                  }}>
                    No active tasks currently linked to this skill in this phase framework.
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    maxHeight: '260px',
                    overflowY: 'auto',
                    paddingRight: '6px'
                  }}>
                    {skillAdvancements.map(({ phaseTitle, secLabel, task, phaseKey, secNumber }, idx) => {
                      const isCompleted = stateToday?.completedTaskIds?.includes(task.id);
                      
                      return (
                        <div
                          key={task.id || idx}
                          style={{
                            background: 'rgba(255, 255, 255, 0.01)',
                            border: `1px solid ${isCompleted ? 'rgba(34, 197, 94, 0.2)' : 'var(--border-color)'}`,
                            padding: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            opacity: selectedSkill.isLocked ? 0.7 : 1
                          }}
                        >
                          {/* Title row with checkbox */}
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <input
                              type="checkbox"
                              checked={isCompleted}
                              disabled={isDayClosed || selectedSkill.isLocked}
                              onChange={(e) => handleTaskToggle(task, e)}
                              style={{
                                marginTop: '3px',
                                cursor: (isDayClosed || selectedSkill.isLocked) ? 'not-allowed' : 'pointer',
                                width: '13px',
                                height: '13px',
                                accentColor: 'var(--accent-green)'
                              }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                              <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '11px',
                                color: isCompleted ? 'var(--accent-green)' : 'var(--text-main)',
                                textDecoration: isCompleted ? 'line-through' : 'none',
                                fontWeight: 'bold',
                                lineHeight: '1.4'
                              }}>
                                {task.title}
                              </span>
                              
                              {task.description && (
                                <span style={{
                                  fontFamily: 'var(--font-mono)',
                                  fontSize: '10px',
                                  color: 'var(--text-muted)',
                                  lineHeight: '1.4'
                                }}>
                                  {task.description}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Metadata row */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderTop: '1px dashed rgba(255,255,255,0.05)',
                            paddingTop: '6px',
                            marginTop: '2px'
                          }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '9px',
                                color: 'var(--accent-blue)',
                                fontWeight: 'bold'
                              }}>{String(phaseTitle ?? '').toUpperCase()} — {String(secLabel ?? '').toUpperCase()}</span>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentPhase(phaseKey);
                                  setCurrentWeek(secNumber);
                                  setActivePage('roadmap');
                                }}
                                style={{
                                  background: 'rgba(0, 200, 255, 0.1)',
                                  border: '1px solid var(--accent-blue)',
                                  color: 'var(--accent-blue)',
                                  fontFamily: 'var(--font-mono)',
                                  fontSize: '8px',
                                  padding: '2px 6px',
                                  cursor: 'pointer',
                                  fontWeight: 'bold'
                                }}
                              >
                                JUMP TO WEEK
                              </button>
                            </div>
                            
                            <span style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '9px',
                              color: 'var(--accent-orange)',
                              fontWeight: 'bold'
                            }}>
                              +{task.xpReward || 25} XP
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
