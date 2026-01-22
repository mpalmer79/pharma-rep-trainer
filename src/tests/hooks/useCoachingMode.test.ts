import { renderHook, act, waitFor } from '@testing-library/react';
import { useCoachingMode } from '@/hooks/useCoachingMode';
import { Persona, Drug } from '@/types';

jest.useFakeTimers();

describe('useCoachingMode', () => {
  const mockPersona: Persona = {
    id: 'rush',
    name: 'Dr. Sarah Chen',
    title: 'Time-Pressed Physician',
    description: 'Has 90 seconds. Make every word count.',
    avatar: '👩‍⚕️',
    timerSeconds: 90,
    difficulty: 'hard',
    systemPrompt: 'You are Dr. Sarah Chen...',
  };

  const mockDrug: Drug = {
    id: 'cardiomax',
    name: 'CardioMax',
    category: 'Cardiovascular',
    indication: 'Heart Failure',
    keyData: '23% reduction in cardiovascular death',
    competitorName: 'Entresto',
    mechanismOfAction: 'SGLT2 inhibitor',
  };

  const defaultProps = {
    enabled: true,
    messages: [],
    persona: mockPersona,
    drug: mockDrug,
    timeRemaining: 90,
    isLoading: false,
    input: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
  });

  describe('Initial State', () => {
    it('should return null hint when disabled', () => {
      const { result } = renderHook(() =>
        useCoachingMode({ ...defaultProps, enabled: false })
      );

      expect(result.current.currentHint).toBeNull();
    });

    it('should return null hint when persona is null', () => {
      const { result } = renderHook(() =>
        useCoachingMode({ ...defaultProps, persona: null })
      );

      expect(result.current.currentHint).toBeNull();
    });

    it('should return null hint when drug is null', () => {
      const { result } = renderHook(() =>
        useCoachingMode({ ...defaultProps, drug: null })
      );

      expect(result.current.currentHint).toBeNull();
    });

    it('should return null hint when loading', () => {
      const { result } = renderHook(() =>
        useCoachingMode({ ...defaultProps, isLoading: true })
      );

      expect(result.current.currentHint).toBeNull();
    });

    it('should initialize with empty hint history', () => {
      const { result } = renderHook(() => useCoachingMode(defaultProps));

      expect(result.current.hintHistory).toEqual([]);
    });
  });

  describe('Opening Hints', () => {
    it('should show opening hint before first user message', async () => {
      const { result } = renderHook(() =>
        useCoachingMode({
          ...defaultProps,
          messages: [{ role: 'assistant', content: 'Hello, I have 90 seconds.' }],
        })
      );

      await waitFor(() => {
        expect(result.current.currentHint).not.toBeNull();
      });

      expect(result.current.currentHint?.type).toBe('tip');
      expect(result.current.currentHint?.title).toBe('Opening Strategy');
      expect(result.current.currentHint?.message).toContain('time-pressed');
    });

    it('should show persona-specific opening hint', async () => {
      const skepticPersona: Persona = {
        ...mockPersona,
        id: 'skeptic',
        name: 'Dr. Michael Torres',
      };

      const { result } = renderHook(() =>
        useCoachingMode({
          ...defaultProps,
          persona: skepticPersona,
          messages: [{ role: 'assistant', content: 'Show me the data.' }],
        })
      );

      await waitFor(() => {
        expect(result.current.currentHint).not.toBeNull();
      });

      expect(result.current.currentHint?.message).toContain('data');
    });
  });

  describe('Response Length Warnings', () => {
    it('should warn when input is too long for persona', async () => {
      const longInput = 'A'.repeat(200);

      const { result } = renderHook(() =>
        useCoachingMode({
          ...defaultProps,
          messages: [
            { role: 'assistant', content: 'Hello' },
            { role: 'user', content: 'Hi' },
          ],
          input: longInput,
        })
      );

      await waitFor(() => {
        expect(result.current.currentHint?.type).toBe('warning');
      });

      expect(result.current.currentHint?.title).toBe('Response Too Long');
    });

    it('should NOT warn when input is within acceptable length', async () => {
      const shortInput = 'Brief response about the drug.';

      const { result } = renderHook(() =>
        useCoachingMode({
          ...defaultProps,
          messages: [
            { role: 'assistant', content: 'Hello' },
            { role: 'user', content: 'Hi' },
            { role: 'assistant', content: 'Tell me more' },
          ],
          input: shortInput,
        })
      );

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      if (result.current.currentHint) {
        expect(result.current.currentHint.title).not.toBe('Response Too Long');
      }
    });
  });

  describe('Objection Detection', () => {
    it('should detect time-related objections for rush persona', async () => {
      const { result } = renderHook(() =>
        useCoachingMode({
          ...defaultProps,
          messages: [
            { role: 'assistant', content: "I don't have time for this." },
            { role: 'user', content: 'I understand.' },
            { role: 'assistant', content: 'Make it quick, I am busy.' },
          ],
        })
      );

      await waitFor(() => {
        expect(result.current.currentHint).not.toBeNull();
      });

      expect(result.current.currentHint?.type).toBe('suggestion');
      expect(result.current.currentHint?.title).toBe('Objection Handling');
    });
  });

  describe('Closing Hints', () => {
    it('should show closing hint when time is low', async () => {
      const { result } = renderHook(() =>
        useCoachingMode({
          ...defaultProps,
          timeRemaining: 30,
          messages: [
            { role: 'assistant', content: 'Hello' },
            { role: 'user', content: 'Hi' },
            { role: 'assistant', content: 'Continue' },
            { role: 'user', content: 'More info' },
          ],
        })
      );

      await waitFor(() => {
        expect(result.current.currentHint).not.toBeNull();
      });

      expect(result.current.currentHint?.title).toBe('Time to Close');
    });

    it('should NOT show closing hint in unlimited mode', async () => {
      const { result } = renderHook(() =>
        useCoachingMode({
          ...defaultProps,
          timeRemaining: -1,
          messages: [
            { role: 'assistant', content: 'Hello' },
            { role: 'user', content: 'Hi' },
          ],
        })
      );

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      if (result.current.currentHint) {
        expect(result.current.currentHint.title).not.toBe('Time to Close');
      }
    });
  });

  describe('Hint Dismissal', () => {
    it('should clear current hint on dismiss', async () => {
      const { result } = renderHook(() =>
        useCoachingMode({
          ...defaultProps,
          messages: [{ role: 'assistant', content: 'Hello' }],
        })
      );

      await waitFor(() => {
        expect(result.current.currentHint).not.toBeNull();
      });

      act(() => {
        result.current.dismissHint();
      });

      expect(result.current.currentHint).toBeNull();
    });
  });

  describe('Hint History', () => {
    it('should track shown hints in history', async () => {
      const { result } = renderHook(() =>
        useCoachingMode({
          ...defaultProps,
          messages: [{ role: 'assistant', content: 'Hello' }],
        })
      );

      await waitFor(() => {
        expect(result.current.currentHint).not.toBeNull();
      });

      expect(result.current.hintHistory.length).toBeGreaterThan(0);
    });
  });

  describe('Persona-Specific Strategies', () => {
    const personaTestCases = [
      { id: 'rush', expectedKeyword: 'time-pressed' },
      { id: 'skeptic', expectedKeyword: 'data' },
      { id: 'loyalist', expectedKeyword: 'satisfied' },
      { id: 'gatekeeper', expectedKeyword: 'partner' },
      { id: 'curious', expectedKeyword: 'mechanism' },
    ];

    personaTestCases.forEach(({ id, expectedKeyword }) => {
      it(`should provide ${id}-specific opening strategy`, async () => {
        const persona: Persona = {
          ...mockPersona,
          id,
          name: `Test ${id}`,
        };

        const { result } = renderHook(() =>
          useCoachingMode({
            ...defaultProps,
            persona,
            messages: [{ role: 'assistant', content: 'Hello' }],
          })
        );

        await waitFor(() => {
          expect(result.current.currentHint).not.toBeNull();
        });

        expect(result.current.currentHint?.title).toBe('Opening Strategy');
        expect(
          result.current.currentHint?.message.toLowerCase()
        ).toContain(expectedKeyword.toLowerCase());
      });
    });
  });
});
