'use client';

import { useCallback } from 'react';
import { drugs } from '@/data/drugs';
import { personas } from '@/data/personas';
import { TrainingSession } from '@/types';

interface QuickPracticeResult {
  drugId: string;
  personaId: string;
  drugName: string;
  personaName: string;
}

interface UseQuickPracticeOptions {
  recentSessions?: TrainingSession[];
  avoidRecentCount?: number; // How many recent combos to avoid
}

export function useQuickPractice(options: UseQuickPracticeOptions = {}) {
  const { recentSessions = [], avoidRecentCount = 3 } = options;

  const getRandomSelection = useCallback((): QuickPracticeResult => {
    // Get recent drug/persona combos to avoid
    const recentCombos = new Set(
      recentSessions
        .slice(0, avoidRecentCount)
        .map((s) => `${s.drugId}-${s.personaId}`)
    );

    // Generate all possible combos
    const allCombos: { drug: typeof drugs[0]; persona: typeof personas[0] }[] = [];
    drugs.forEach((drug) => {
      personas.forEach((persona) => {
        allCombos.push({ drug, persona });
      });
    });

    // Filter out recent combos if possible
    let availableCombos = allCombos.filter(
      (combo) => !recentCombos.has(`${combo.drug.id}-${combo.persona.id}`)
    );

    // If all combos were recent, use all combos
    if (availableCombos.length === 0) {
      availableCombos = allCombos;
    }

    // Pick a random combo
    const randomIndex = Math.floor(Math.random() * availableCombos.length);
    const selected = availableCombos[randomIndex];

    return {
      drugId: selected.drug.id,
      personaId: selected.persona.id,
      drugName: selected.drug.name,
      personaName: selected.persona.name,
    };
  }, [recentSessions, avoidRecentCount]);

  // Get a challenge selection (harder personas)
  const getChallengeSelection = useCallback((): QuickPracticeResult => {
    const hardPersonas = personas.filter((p) => p.difficulty === 'Hard');
    const randomDrug = drugs[Math.floor(Math.random() * drugs.length)];
    const randomPersona = hardPersonas[Math.floor(Math.random() * hardPersonas.length)];

    return {
      drugId: randomDrug.id,
      personaId: randomPersona.id,
      drugName: randomDrug.name,
      personaName: randomPersona.name,
    };
  }, []);

  return {
    getRandomSelection,
    getChallengeSelection,
  };
}

export default useQuickPractice;
