'use client';

import { useCallback } from 'react';
import { drugs } from '@/data/drugs';
import { personas } from '@/data/personas';
import { TrainingSession } from '@/types';

interface UseQuickPracticeProps {
  recentSessions?: TrainingSession[];
  avoidRecentCount?: number;
  filterPersonas?: (personaId: string) => boolean;
}

interface QuickPracticeSelection {
  drugId: string;
  personaId: string;
  drugName: string;
  personaName: string;
}

export function useQuickPractice({
  recentSessions = [],
  avoidRecentCount = 3,
  filterPersonas = () => true,
}: UseQuickPracticeProps = {}) {
  
  const getRandomSelection = useCallback((): QuickPracticeSelection | null => {
    // Get recent drug/persona combinations to avoid
    const recentCombos = recentSessions
      .slice(0, avoidRecentCount)
      .map(s => `${s.drugId}-${s.personaId}`);

    // Filter personas based on the provided filter (e.g., only unlocked)
    const availablePersonas = personas.filter(p => filterPersonas(p.id));
    
    if (availablePersonas.length === 0) {
      // Fallback to first persona if none are available
      const fallbackPersona = personas[0];
      const randomDrug = drugs[Math.floor(Math.random() * drugs.length)];
      return {
        drugId: randomDrug.id,
        personaId: fallbackPersona.id,
        drugName: randomDrug.name,
        personaName: fallbackPersona.name,
      };
    }

    // Build all possible combinations with available personas
    const allCombinations: { drug: typeof drugs[0]; persona: typeof personas[0] }[] = [];
    
    for (const drug of drugs) {
      for (const persona of availablePersonas) {
        const comboKey = `${drug.id}-${persona.id}`;
        // Skip if this combo was recently used
        if (!recentCombos.includes(comboKey)) {
          allCombinations.push({ drug, persona });
        }
      }
    }

    // If all combos were recently used, allow any available combo
    const pool = allCombinations.length > 0 
      ? allCombinations 
      : drugs.flatMap(drug => 
          availablePersonas.map(persona => ({ drug, persona }))
        );

    // Pick a random combination
    const selection = pool[Math.floor(Math.random() * pool.length)];

    return {
      drugId: selection.drug.id,
      personaId: selection.persona.id,
      drugName: selection.drug.name,
      personaName: selection.persona.name,
    };
  }, [recentSessions, avoidRecentCount, filterPersonas]);

  return {
    getRandomSelection,
  };
}

export default useQuickPractice;
