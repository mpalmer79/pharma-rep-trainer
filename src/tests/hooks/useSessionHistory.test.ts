import { renderHook, act } from '@testing-library/react';
import { useSessionHistory } from '@/hooks/useSessionHistory';
import { TrainingSession } from '@/types';
import { createMockSession, createMockFeedback, mockLocalStorage } from '../utils/test-utils';

describe('useSessionHistory', () => {
  const STORAGE_KEY = 'pharma_training_history';

  beforeEach(() => {
    jest.clearAllMocks();
    (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
  });

  describe('Initial State', () => {
    it('should initialize with empty sessions', () => {
      const { result } = renderHook(() => useSessionHistory());

      expect(result.current.sessions).toEqual([]);
      expect(result.current.isLoaded).toBe(true);
    });

    it('should load sessions from localStorage on mount', () => {
      const storedSessions = [
        createMockSession({ id: 'session-1' }),
        createMockSession({ id: 'session-2' }),
      ];

      mockLocalStorage({
        [STORAGE_KEY]: storedSessions,
      });

      const { result } = renderHook(() => useSessionHistory());

      expect(result.current.sessions).toHaveLength(2);
      expect(result.current.sessions[0].id).toBe('session-1');
    });

    it('should handle corrupted localStorage data gracefully', () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue('invalid json{');

      const { result } = renderHook(() => useSessionHistory());

      expect(result.current.sessions).toEqual([]);
      expect(result.current.isLoaded).toBe(true);
    });
  });

  describe('saveSession', () => {
    it('should add new session to the beginning of the list', () => {
      const { result } = renderHook(() => useSessionHistory());

      act(() => {
        result.current.saveSession(
          'cardiomax',
          'skeptic',
          [
            { role: 'user', content: 'Hello' },
            { role: 'assistant', content: 'Hi' },
          ],
          createMockFeedback(75),
          180
        );
      });

      expect(result.current.sessions).toHaveLength(1);
      expect(result.current.sessions[0].drugId).toBe('cardiomax');
      expect(result.current.sessions[0].personaId).toBe('skeptic');
    });

    it('should persist session to localStorage', () => {
      const { result } = renderHook(() => useSessionHistory());

      act(() => {
        result.current.saveSession(
          'neurozen',
          'rush',
          [],
          createMockFeedback(80),
          120
        );
      });

      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.any(String)
      );

      const savedData = JSON.parse(
        (window.localStorage.setItem as jest.Mock).mock.calls[0][1]
      );
      expect(savedData[0].drugId).toBe('neurozen');
    });

    it('should generate unique session IDs', () => {
      const { result } = renderHook(() => useSessionHistory());

      act(() => {
        result.current.saveSession('drug1', 'persona1', [], createMockFeedback(70), 100);
      });

      act(() => {
        result.current.saveSession('drug2', 'persona2', [], createMockFeedback(80), 100);
      });

      expect(result.current.sessions[0].id).not.toBe(result.current.sessions[1].id);
    });
  });

  describe('deleteSession', () => {
    it('should remove session by ID', () => {
      const storedSessions = [
        createMockSession({ id: 'keep-1' }),
        createMockSession({ id: 'delete-me' }),
        createMockSession({ id: 'keep-2' }),
      ];

      mockLocalStorage({
        [STORAGE_KEY]: storedSessions,
      });

      const { result } = renderHook(() => useSessionHistory());

      act(() => {
        result.current.deleteSession('delete-me');
      });

      expect(result.current.sessions).toHaveLength(2);
      expect(result.current.sessions.find((s) => s.id === 'delete-me')).toBeUndefined();
    });
  });

  describe('clearHistory', () => {
    it('should remove all sessions', () => {
      const storedSessions = [
        createMockSession({ id: 'session-1' }),
        createMockSession({ id: 'session-2' }),
        createMockSession({ id: 'session-3' }),
      ];

      mockLocalStorage({
        [STORAGE_KEY]: storedSessions,
      });

      const { result } = renderHook(() => useSessionHistory());

      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.sessions).toEqual([]);
    });

    it('should remove data from localStorage', () => {
      const { result } = renderHook(() => useSessionHistory());

      act(() => {
        result.current.clearHistory();
      });

      expect(window.localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
    });
  });

  describe('getStats', () => {
    it('should return zeros when no sessions exist', () => {
      const { result } = renderHook(() => useSessionHistory());

      const stats = result.current.getStats();

      expect(stats.totalSessions).toBe(0);
      expect(stats.averageScore).toBe(0);
      expect(stats.totalTime).toBe(0);
      expect(stats.bestScore).toBe(0);
      expect(stats.worstScore).toBe(0);
    });

    it('should calculate correct statistics', () => {
      const storedSessions = [
        createMockSession({
          id: '1',
          feedback: createMockFeedback(60),
          duration: 100,
        }),
        createMockSession({
          id: '2',
          feedback: createMockFeedback(80),
          duration: 150,
        }),
        createMockSession({
          id: '3',
          feedback: createMockFeedback(70),
          duration: 120,
        }),
      ];

      mockLocalStorage({
        [STORAGE_KEY]: storedSessions,
      });

      const { result } = renderHook(() => useSessionHistory());

      const stats = result.current.getStats();

      expect(stats.totalSessions).toBe(3);
      expect(stats.averageScore).toBe(70);
      expect(stats.totalTime).toBe(370);
      expect(stats.bestScore).toBe(80);
      expect(stats.worstScore).toBe(60);
    });
  });

  describe('Session Ordering', () => {
    it('should maintain newest-first order', () => {
      const { result } = renderHook(() => useSessionHistory());

      act(() => {
        result.current.saveSession('drug1', 'persona1', [], createMockFeedback(70), 100);
      });

      act(() => {
        result.current.saveSession('drug2', 'persona2', [], createMockFeedback(80), 100);
      });

      expect(result.current.sessions[0].drugId).toBe('drug2');
      expect(result.current.sessions[1].drugId).toBe('drug1');
    });
  });
});
