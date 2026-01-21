'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { personas } from '@/data/personas';
import { TrainingSession } from '@/types';

// Difficulty tiers and unlock requirements
export interface UnlockRequirement {
  type: 'score' | 'sessions' | 'streak' | 'persona_mastery';
  value: number;
  description: string;
  personaId?: string; // For persona_mastery type
  difficulty?: 'Easy' | 'Medium' | 'Hard'; // For score/sessions on difficulty
}

export interface PersonaProgression {
  personaId: string;
  isUnlocked: boolean;
  unlockRequirements: UnlockRequirement[];
  currentProgress: number; // 0-100 percentage toward unlock
  unlockedAt?: Date;
}

export interface ProgressionStats {
  totalUnlocked: number;
  totalPersonas: number;
  currentTier: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  nextTierProgress: number;
  achievements: string[];
}

interface UseProgressionSystemProps {
  sessions: TrainingSession[];
}

interface UseProgressionSystemReturn {
  progression: PersonaProgression[];
  stats: ProgressionStats;
  isPersonaUnlocked: (personaId: string) => boolean;
  getUnlockProgress: (personaId: string) => number;
  getUnlockRequirements: (personaId: string) => UnlockRequirement[];
  checkAndUnlock: () => string[]; // Returns newly unlocked persona IDs
}

const STORAGE_KEY = 'repiq_progression';

// Define unlock requirements for each persona
const personaUnlockConfig: Record<string, { requirements: UnlockRequirement[]; tier: number }> = {
  // Tier 1 - Always unlocked (Easy)
  curious: {
    tier: 1,
    requirements: [], // Always unlocked - starter persona
  },
  // Tier 2 - Unlock after basic success (Easy-Medium)
  gatekeeper: {
    tier: 2,
    requirements: [
      {
        type: 'sessions',
        value: 1,
        description: 'Complete 1 training session',
      },
    ],
  },
  // Tier 3 - Unlock after proving competence (Medium)
  loyalist: {
    tier: 3,
    requirements: [
      {
        type: 'score',
        value: 65,
        difficulty: 'Easy',
        description: 'Score 65+ on any Easy persona',
      },
      {
        type: 'sessions',
        value: 3,
        description: 'Complete 3 total sessions',
      },
    ],
  },
  // Tier 4 - Unlock after consistent performance (Hard)
  rush: {
    tier: 4,
    requirements: [
      {
        type: 'score',
        value: 70,
        difficulty: 'Medium',
        description: 'Score 70+ on a Medium persona',
      },
      {
        type: 'persona_mastery',
        value: 75,
        personaId: 'gatekeeper',
        description: 'Score 75+ with Monica (Gatekeeper)',
      },
    ],
  },
  // Tier 5 - Unlock after mastery (Hard)
  skeptic: {
    tier: 5,
    requirements: [
      {
        type: 'score',
        value: 75,
        difficulty: 'Medium',
        description: 'Score 75+ on any Medium persona',
      },
      {
        type: 'streak',
        value: 3,
        description: 'Get 3 sessions in a row with 70+ score',
      },
      {
        type: 'sessions',
        value: 8,
        description: 'Complete 8 total sessions',
      },
    ],
  },
};

// Get persona difficulty
const getPersonaDifficulty = (personaId: string): 'Easy' | 'Medium' | 'Hard' => {
  const persona = personas.find(p => p.id === personaId);
  return (persona?.difficulty as 'Easy' | 'Medium' | 'Hard') || 'Medium';
};

export function useProgressionSystem({ sessions }: UseProgressionSystemProps): UseProgressionSystemReturn {
  const [unlockedPersonas, setUnlockedPersonas] = useState<Set<string>>(new Set(['curious']));
  const [unlockDates, setUnlockDates] = useState<Record<string, Date>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load progression from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setUnlockedPersonas(new Set(data.unlockedPersonas || ['curious']));
        setUnlockDates(data.unlockDates || {});
      }
    } catch (error) {
      console.error('Error loading progression:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save progression to localStorage
  const saveProgression = useCallback((unlocked: Set<string>, dates: Record<string, Date>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        unlockedPersonas: Array.from(unlocked),
        unlockDates: dates,
      }));
    } catch (error) {
      console.error('Error saving progression:', error);
    }
  }, []);

  // Calculate session stats for requirement checking
  const sessionStats = useMemo(() => {
    const totalSessions = sessions.length;
    
    // Best scores by difficulty
    const scoresByDifficulty: Record<string, number> = { Easy: 0, Medium: 0, Hard: 0 };
    const scoresByPersona: Record<string, number> = {};
    
    // Calculate current streak (consecutive 70+ scores)
    let currentStreak = 0;
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    for (const session of sortedSessions) {
      const score = session.feedback.overall;
      if (score >= 70) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate best scores
    for (const session of sessions) {
      const score = session.feedback.overall;
      const difficulty = getPersonaDifficulty(session.personaId);
      
      // Track best by difficulty
      if (score > scoresByDifficulty[difficulty]) {
        scoresByDifficulty[difficulty] = score;
      }
      
      // Track best by persona
      if (!scoresByPersona[session.personaId] || score > scoresByPersona[session.personaId]) {
        scoresByPersona[session.personaId] = score;
      }
    }

    return {
      totalSessions,
      currentStreak,
      scoresByDifficulty,
      scoresByPersona,
    };
  }, [sessions]);

  // Check if a specific requirement is met
  const isRequirementMet = useCallback((req: UnlockRequirement): boolean => {
    switch (req.type) {
      case 'sessions':
        return sessionStats.totalSessions >= req.value;
      
      case 'score':
        if (req.difficulty) {
          return sessionStats.scoresByDifficulty[req.difficulty] >= req.value;
        }
        return Math.max(...Object.values(sessionStats.scoresByDifficulty)) >= req.value;
      
      case 'streak':
        return sessionStats.currentStreak >= req.value;
      
      case 'persona_mastery':
        if (req.personaId) {
          return (sessionStats.scoresByPersona[req.personaId] || 0) >= req.value;
        }
        return false;
      
      default:
        return false;
    }
  }, [sessionStats]);

  // Get progress toward a requirement (0-100)
  const getRequirementProgress = useCallback((req: UnlockRequirement): number => {
    switch (req.type) {
      case 'sessions':
        return Math.min(100, (sessionStats.totalSessions / req.value) * 100);
      
      case 'score':
        if (req.difficulty) {
          const currentScore = sessionStats.scoresByDifficulty[req.difficulty];
          return Math.min(100, (currentScore / req.value) * 100);
        }
        const maxScore = Math.max(...Object.values(sessionStats.scoresByDifficulty));
        return Math.min(100, (maxScore / req.value) * 100);
      
      case 'streak':
        return Math.min(100, (sessionStats.currentStreak / req.value) * 100);
      
      case 'persona_mastery':
        if (req.personaId) {
          const personaScore = sessionStats.scoresByPersona[req.personaId] || 0;
          return Math.min(100, (personaScore / req.value) * 100);
        }
        return 0;
      
      default:
        return 0;
    }
  }, [sessionStats]);

  // Check if persona should be unlocked
  const shouldUnlock = useCallback((personaId: string): boolean => {
    const config = personaUnlockConfig[personaId];
    if (!config) return false;
    if (config.requirements.length === 0) return true; // No requirements = always unlocked
    
    // All requirements must be met
    return config.requirements.every(req => isRequirementMet(req));
  }, [isRequirementMet]);

  // Check and unlock any newly available personas
  const checkAndUnlock = useCallback((): string[] => {
    const newlyUnlocked: string[] = [];
    const updatedUnlocked = new Set(unlockedPersonas);
    const updatedDates = { ...unlockDates };

    for (const personaId of Object.keys(personaUnlockConfig)) {
      if (!updatedUnlocked.has(personaId) && shouldUnlock(personaId)) {
        updatedUnlocked.add(personaId);
        updatedDates[personaId] = new Date();
        newlyUnlocked.push(personaId);
      }
    }

    if (newlyUnlocked.length > 0) {
      setUnlockedPersonas(updatedUnlocked);
      setUnlockDates(updatedDates);
      saveProgression(updatedUnlocked, updatedDates);
    }

    return newlyUnlocked;
  }, [unlockedPersonas, unlockDates, shouldUnlock, saveProgression]);

  // Auto-check for unlocks when sessions change
  useEffect(() => {
    if (isLoaded && sessions.length > 0) {
      checkAndUnlock();
    }
  }, [isLoaded, sessions, checkAndUnlock]);

  // Check if persona is unlocked
  const isPersonaUnlocked = useCallback((personaId: string): boolean => {
    return unlockedPersonas.has(personaId);
  }, [unlockedPersonas]);

  // Get overall unlock progress for a persona (average of all requirements)
  const getUnlockProgress = useCallback((personaId: string): number => {
    if (unlockedPersonas.has(personaId)) return 100;
    
    const config = personaUnlockConfig[personaId];
    if (!config || config.requirements.length === 0) return 100;
    
    const totalProgress = config.requirements.reduce(
      (sum, req) => sum + getRequirementProgress(req),
      0
    );
    
    return Math.round(totalProgress / config.requirements.length);
  }, [unlockedPersonas, getRequirementProgress]);

  // Get unlock requirements for a persona
  const getUnlockRequirements = useCallback((personaId: string): UnlockRequirement[] => {
    return personaUnlockConfig[personaId]?.requirements || [];
  }, []);

  // Build progression data for all personas
  const progression: PersonaProgression[] = useMemo(() => {
    return personas.map(persona => ({
      personaId: persona.id,
      isUnlocked: unlockedPersonas.has(persona.id),
      unlockRequirements: personaUnlockConfig[persona.id]?.requirements || [],
      currentProgress: getUnlockProgress(persona.id),
      unlockedAt: unlockDates[persona.id] ? new Date(unlockDates[persona.id]) : undefined,
    }));
  }, [unlockedPersonas, unlockDates, getUnlockProgress]);

  // Calculate overall progression stats
  const stats: ProgressionStats = useMemo(() => {
    const totalUnlocked = unlockedPersonas.size;
    const totalPersonas = personas.length;
    
    // Determine current tier
    let currentTier: ProgressionStats['currentTier'] = 'Beginner';
    if (totalUnlocked >= 5) currentTier = 'Expert';
    else if (totalUnlocked >= 4) currentTier = 'Advanced';
    else if (totalUnlocked >= 2) currentTier = 'Intermediate';
    
    // Calculate progress to next tier
    const tierThresholds = { Beginner: 2, Intermediate: 4, Advanced: 5, Expert: 5 };
    const nextThreshold = tierThresholds[currentTier];
    const nextTierProgress = currentTier === 'Expert' 
      ? 100 
      : Math.round((totalUnlocked / nextThreshold) * 100);
    
    // Collect achievements
    const achievements: string[] = [];
    if (totalUnlocked >= 1) achievements.push('First Steps');
    if (totalUnlocked >= 3) achievements.push('Getting Serious');
    if (totalUnlocked >= 5) achievements.push('Master Communicator');
    if (sessionStats.currentStreak >= 3) achievements.push('Hot Streak');
    if (sessionStats.scoresByDifficulty.Hard >= 80) achievements.push('Challenge Accepted');
    
    return {
      totalUnlocked,
      totalPersonas,
      currentTier,
      nextTierProgress,
      achievements,
    };
  }, [unlockedPersonas, sessionStats]);

  return {
    progression,
    stats,
    isPersonaUnlocked,
    getUnlockProgress,
    getUnlockRequirements,
    checkAndUnlock,
  };
}

export default useProgressionSystem;
