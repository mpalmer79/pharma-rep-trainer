import { renderHook, act } from '@testing-library/react';
import { useProgressionSystem } from '@/hooks/useProgressionSystem';
import { TrainingSession } from '@/types';
import { createMockSession, createMockFeedback, mockLocalStorage } from '../utils/test-utils';

// Mock the personas data
jest.mock('@/data/personas', () => ({
  personas: [
    { id: 'curious', name: 'Dr. James Park', difficulty: 'easy' },
    { id: 'gatekeeper', name: 'Monica Reynolds', difficulty: 'medium' },
    { id: 'loyalist', name: 'Dr. Patricia Williams', difficulty: 'medium' },
    { id: 'rush', name: 'Dr. Sarah Chen', difficulty: 'hard' },
    { id: 'skeptic', name: 'Dr. Michael Torres', difficulty: 'hard' },
  ],
}));

describe('useProgressionSystem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
  });

  describe('Initial State', () => {
    it('should initialize with curious persona unlocked by default', () => {
      const { result } = renderHook(() =>
        useProgressionSystem({ sessions: [] })
      );

      expect(result.current.isPersonaUnlocked('curious')).toBe(true);
    });

    it('should start at Beginner tier with no sessions', () => {
      const { result } = renderHook(() =>
        useProgressionSystem({ sessions: [] })
      );

      expect(result.current.stats.currentTier).toBe('Beginner');
      expect(result.current.stats.totalUnlocked).toBe(1);
    });

    it('should have correct total personas count', () => {
      const { result } = renderHook(() =>
        useProgressionSystem({ sessions: [] })
      );

      expect(result.current.stats.totalPersonas).toBe(5);
    });

    it('should load saved progression from localStorage', () => {
      mockLocalStorage({
        repiq_progression: {
          unlockedPersonas: ['curious', 'gatekeeper', 'loyalist'],
          unlockDates: {
            curious: new Date().toISOString(),
            gatekeeper: new Date().toISOString(),
            loyalist: new Date().toISOString(),
          },
        },
      });

      const { result } = renderHook(() =>
        useProgressionSystem({ sessions: [] })
      );

      expect(result.current.isPersonaUnlocked('curious')).toBe(true);
      expect(result.current.isPersonaUnlocked('gatekeeper')).toBe(true);
      expect(result.current.isPersonaUnlocked('loyalist')).toBe(true);
    });
  });

  describe('Persona Unlocking', () => {
    it('should unlock gatekeeper after completing 1 session', () => {
      const sessions: TrainingSession[] = [
        createMockSession({
          personaId: 'curious',
          feedback: createMockFeedback(60),
        }),
      ];

      const { result } = renderHook(() =>
        useProgressionSystem({ sessions })
      );

      expect(result.current.isPersonaUnlocked('gatekeeper')).toBe(true);
    });

    it('should unlock loyalist after scoring 65+ on easy persona and 3 sessions', () => {
      const sessions: TrainingSession[] = [
        createMockSession({
          personaId: 'curious',
          feedback: createMockFeedback(70),
        }),
        createMockSession({
          personaId: 'curious',
          feedback: createMockFeedback(65),
        }),
        createMockSession({
          personaId: 'gatekeeper',
          feedback: createMockFeedback(60),
        }),
      ];

      const { result } = renderHook(() =>
        useProgressionSystem({ sessions })
      );

      expect(result.current.isPersonaUnlocked('loyalist')).toBe(true);
    });

    it('should NOT unlock loyalist with only 2 sessions even with high score', () => {
      const sessions: TrainingSession[] = [
        createMockSession({
          personaId: 'curious',
          feedback: createMockFeedback(90),
        }),
        createMockSession({
          personaId: 'curious',
          feedback: createMockFeedback(85),
        }),
      ];

      const { result } = renderHook(() =>
        useProgressionSystem({ sessions })
      );

      expect(result.current.isPersonaUnlocked('loyalist')).toBe(false);
    });

    it('should unlock rush after scoring 70+ on medium and 75+ with gatekeeper', () => {
      const sessions: TrainingSession[] = [
        createMockSession({ personaId: 'curious', feedback: createMockFeedback(70) }),
        createMockSession({ personaId: 'curious', feedback: createMockFeedback(70) }),
        createMockSession({ personaId: 'curious', feedback: createMockFeedback(70) }),
        createMockSession({
          personaId: 'gatekeeper',
          feedback: createMockFeedback(75),
        }),
        createMockSession({
          personaId: 'loyalist',
          feedback: createMockFeedback(72),
        }),
      ];

      const { result } = renderHook(() =>
        useProgressionSystem({ sessions })
      );

      expect(result.current.isPersonaUnlocked('rush')).toBe(true);
    });
  });

  describe('Unlock Progress', () => {
    it('should return 100 for unlocked personas', () => {
      const { result } = renderHook(() =>
        useProgressionSystem({ sessions: [] })
      );

      expect(result.current.getUnlockProgress('curious')).toBe(100);
    });

    it('should calculate partial progress for locked personas', () => {
      const sessions: TrainingSession[] = [];

      const { result } = renderHook(() =>
        useProgressionSystem({ sessions })
      );

      const progress = result.current.getUnlockProgress('gatekeeper');
      expect(progress).toBe(0);
    });

    it('should show 100% progress when session requirement is met', () => {
      const sessions: TrainingSession[] = [
        createMockSession({ feedback: createMockFeedback(50) }),
      ];

      const { result } = renderHook(() =>
        useProgressionSystem({ sessions })
      );

      expect(result.current.getUnlockProgress('gatekeeper')).toBe(100);
    });
  });

  describe('Unlock Requirements', () => {
    it('should return empty array for personas with no requirements', () => {
      const { result } = renderHook(() =>
        useProgressionSystem({ sessions: [] })
      );

      const requirements = result.current.getUnlockRequirements('curious');
      expect(requirements).toEqual([]);
    });

    it('should return correct requirements for gatekeeper', () => {
      const { result } = renderHook(() =>
        useProgressionSystem({ sessions: [] })
      );

      const requirements = result.current.getUnlockRequirements('gatekeeper');
      expect(requirements).toHaveLength(1);
      expect(requirements[0].type).toBe('sessions');
      expect(requirements[0].value).toBe(1);
    });

    it('should return multiple requirements for advanced personas', () => {
      const { result } = renderHook(() =>
        useProgressionSystem({ sessions: [] })
      );

      const requirements = result.current.getUnlockRequirements('skeptic');
      expect(requirements.length).toBeGreaterThan(1);
      expect(requirements.some((r) => r.type === 'score')).toBe(true);
      expect(requirements.some((r) => r.type === 'streak')).toBe(true);
    });
  });

  describe('Tier Progression', () => {
    it('should progress to Intermediate tier with 2+ unlocks', () => {
      const sessions: TrainingSession[] = [
        createMockSession({ feedback: createMockFeedback(70) }),
      ];

      const { result } = renderHook(() =>
        useProgressionSystem({ sessions })
      );

      expect(result.current.stats.currentTier).toBe('Intermediate');
    });

    it('should track next tier progress correctly', () => {
      const { result } = renderHook(() =>
        useProgressionSystem({ sessions: [] })
      );

      expect(result.current.stats.nextTierProgress).toBe(50);
    });
  });

  describe('Achievements', () => {
    it('should award "First Steps" achievement with 1+ unlock', () => {
      const { result } = renderHook(() =>
        useProgressionSystem({ sessions: [] })
      );

      expect(result.current.stats.achievements).toContain('First Steps');
    });

    it('should award "Getting Serious" with 3+ unlocks', () => {
      mockLocalStorage({
        repiq_progression: {
          unlockedPersonas: ['curious', 'gatekeeper', 'loyalist'],
          unlockDates: {},
        },
      });

      const { result } = renderHook(() =>
        useProgressionSystem({ sessions: [] })
      );

      expect(result.current.stats.achievements).toContain('Getting Serious');
    });

    it('should award "Hot Streak" with 3+ consecutive 70+ scores', () => {
      const sessions: TrainingSession[] = [
        createMockSession({
          startedAt: new Date(Date.now() - 300000),
          feedback: createMockFeedback(75),
        }),
        createMockSession({
          startedAt: new Date(Date.now() - 200000),
          feedback: createMockFeedback(72),
        }),
        createMockSession({
          startedAt: new Date(Date.now() - 100000),
          feedback: createMockFeedback(80),
        }),
      ];

      const { result } = renderHook(() =>
        useProgressionSystem({ sessions })
      );

      expect(result.current.stats.achievements).toContain('Hot Streak');
    });
  });

  describe('checkAndUnlock', () => {
    it('should return newly unlocked persona IDs', () => {
      const sessions: TrainingSession[] = [
        createMockSession({ feedback: createMockFeedback(60) }),
      ];

      const { result } = renderHook(() =>
        useProgressionSystem({ sessions })
      );

      const newUnlocks = result.current.checkAndUnlock();
      expect(newUnlocks).toEqual([]);
    });

    it('should save progression to localStorage when unlocking', () => {
      const sessions: TrainingSession[] = [
        createMockSession({ feedback: createMockFeedback(60) }),
      ];

      renderHook(() => useProgressionSystem({ sessions }));

      expect(window.localStorage.setItem).toHaveBeenCalled();
      const calls = (window.localStorage.setItem as jest.Mock).mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[0]).toBe('repiq_progression');
    });
  });

  describe('Progression Data', () => {
    it('should return progression array with all personas', () => {
      const { result } = renderHook(() =>
        useProgressionSystem({ sessions: [] })
      );

      expect(result.current.progression).toHaveLength(5);
      expect(result.current.progression.every((p) => p.personaId)).toBe(true);
    });

    it('should include unlock status for each persona', () => {
      const { result } = renderHook(() =>
        useProgressionSystem({ sessions: [] })
      );

      const curiousProgression = result.current.progression.find(
        (p) => p.personaId === 'curious'
      );
      expect(curiousProgression?.isUnlocked).toBe(true);

      const skepticProgression = result.current.progression.find(
        (p) => p.personaId === 'skeptic'
      );
      expect(skepticProgression?.isUnlocked).toBe(false);
    });
  });

  describe('Streak Calculation', () => {
    it('should calculate streak based on consecutive 70+ scores (most recent first)', () => {
      const sessions: TrainingSession[] = [
        createMockSession({
          startedAt: new Date(Date.now() - 400000),
          feedback: createMockFeedback(65),
        }),
        createMockSession({
          startedAt: new Date(Date.now() - 300000),
          feedback: createMockFeedback(75),
        }),
        createMockSession({
          startedAt: new Date(Date.now() - 200000),
          feedback: createMockFeedback(72),
        }),
        createMockSession({
          startedAt: new Date(Date.now() - 100000),
          feedback: createMockFeedback(80),
        }),
      ];

      const { result } = renderHook(() =>
        useProgressionSystem({ sessions })
      );

      expect(result.current.stats.achievements).toContain('Hot Streak');
    });

    it('should break streak when score drops below 70', () => {
      const sessions: TrainingSession[] = [
        createMockSession({
          startedAt: new Date(Date.now() - 200000),
          feedback: createMockFeedback(75),
        }),
        createMockSession({
          startedAt: new Date(Date.now() - 100000),
          feedback: createMockFeedback(65),
        }),
      ];

      const { result } = renderHook(() =>
        useProgressionSystem({ sessions })
      );

      expect(result.current.stats.achievements).not.toContain('Hot Streak');
    });
  });
});
