import { renderHook, act } from '@testing-library/react';
import { useVoiceInput } from '@/hooks/useVoiceInput';

describe('useVoiceInput', () => {
  let mockRecognition: {
    start: jest.Mock;
    stop: jest.Mock;
    abort: jest.Mock;
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onstart: (() => void) | null;
    onresult: ((event: unknown) => void) | null;
    onerror: ((event: unknown) => void) | null;
    onend: (() => void) | null;
  };

  beforeEach(() => {
    mockRecognition = {
      start: jest.fn(),
      stop: jest.fn(),
      abort: jest.fn(),
      continuous: false,
      interimResults: false,
      lang: '',
      onstart: null,
      onresult: null,
      onerror: null,
      onend: null,
    };

    (window.SpeechRecognition as jest.Mock).mockImplementation(() => mockRecognition);
    (window.webkitSpeechRecognition as jest.Mock).mockImplementation(() => mockRecognition);
  });

  describe('Browser Support', () => {
    it('should detect browser support when SpeechRecognition is available', () => {
      const { result } = renderHook(() => useVoiceInput());
      expect(result.current.isSupported).toBe(true);
    });
  });

  describe('Initial State', () => {
    it('should initialize with not listening', () => {
      const { result } = renderHook(() => useVoiceInput());
      expect(result.current.isListening).toBe(false);
    });

    it('should initialize with empty transcript', () => {
      const { result } = renderHook(() => useVoiceInput());
      expect(result.current.transcript).toBe('');
    });

    it('should initialize with no error', () => {
      const { result } = renderHook(() => useVoiceInput());
      expect(result.current.error).toBeNull();
    });
  });

  describe('Configuration', () => {
    it('should configure recognition with default language', () => {
      renderHook(() => useVoiceInput());
      expect(mockRecognition.lang).toBe('en-US');
    });

    it('should configure recognition with custom language', () => {
      renderHook(() => useVoiceInput({ language: 'es-ES' }));
      expect(mockRecognition.lang).toBe('es-ES');
    });

    it('should enable continuous mode by default', () => {
      renderHook(() => useVoiceInput());
      expect(mockRecognition.continuous).toBe(true);
    });
  });

  describe('startListening', () => {
    it('should call recognition.start()', () => {
      const { result } = renderHook(() => useVoiceInput());

      act(() => {
        result.current.startListening();
      });

      expect(mockRecognition.start).toHaveBeenCalled();
    });
  });

  describe('stopListening', () => {
    it('should call recognition.stop() when listening', () => {
      const { result } = renderHook(() => useVoiceInput());

      act(() => {
        result.current.startListening();
        mockRecognition.onstart?.();
      });

      act(() => {
        result.current.stopListening();
      });

      expect(mockRecognition.stop).toHaveBeenCalled();
    });
  });

  describe('toggleListening', () => {
    it('should start listening if not listening', () => {
      const { result } = renderHook(() => useVoiceInput());

      act(() => {
        result.current.toggleListening();
      });

      expect(mockRecognition.start).toHaveBeenCalled();
    });
  });

  describe('Speech Recognition Events', () => {
    it('should update isListening on start event', () => {
      const { result } = renderHook(() => useVoiceInput());

      act(() => {
        mockRecognition.onstart?.();
      });

      expect(result.current.isListening).toBe(true);
    });

    it('should handle final results', () => {
      const { result } = renderHook(() => useVoiceInput());

      act(() => {
        mockRecognition.onresult?.({
          resultIndex: 0,
          results: {
            length: 1,
            0: { isFinal: true, 0: { transcript: 'hello world' } },
          },
        });
      });

      expect(result.current.transcript).toBe('hello world');
    });
  });

  describe('Error Handling', () => {
    const errorTestCases = [
      { error: 'no-speech', expectedMessage: /no speech/i },
      { error: 'audio-capture', expectedMessage: /microphone/i },
      { error: 'not-allowed', expectedMessage: /denied/i },
      { error: 'network', expectedMessage: /network/i },
    ];

    errorTestCases.forEach(({ error, expectedMessage }) => {
      it(`should handle ${error} error`, () => {
        const { result } = renderHook(() => useVoiceInput());

        act(() => {
          mockRecognition.onerror?.({ error, message: `${error} error` });
        });

        expect(result.current.error).toMatch(expectedMessage);
        expect(result.current.isListening).toBe(false);
      });
    });
  });

  describe('Callbacks', () => {
    it('should call onTranscript with combined transcript', () => {
      const onTranscript = jest.fn();
      renderHook(() => useVoiceInput({ onTranscript }));

      act(() => {
        mockRecognition.onresult?.({
          resultIndex: 0,
          results: {
            length: 1,
            0: { isFinal: false, 0: { transcript: 'hello' } },
          },
        });
      });

      expect(onTranscript).toHaveBeenCalledWith('hello');
    });
  });

  describe('Cleanup', () => {
    it('should abort recognition on unmount', () => {
      const { unmount } = renderHook(() => useVoiceInput());

      unmount();

      expect(mockRecognition.abort).toHaveBeenCalled();
    });
  });
});
