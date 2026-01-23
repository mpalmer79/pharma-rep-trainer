import '@testing-library/jest-dom';

// Only set up browser mocks if window is defined (jsdom environment)
if (typeof window !== 'undefined') {
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // Deprecated
      removeListener: jest.fn(), // Deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // Mock IntersectionObserver
  class MockIntersectionObserver {
    observe = jest.fn();
    disconnect = jest.fn();
    unobserve = jest.fn();
  }

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });

  // Mock ResizeObserver
  class MockResizeObserver {
    observe = jest.fn();
    disconnect = jest.fn();
    unobserve = jest.fn();
  }

  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: MockResizeObserver,
  });

  // Mock scrollIntoView
  Element.prototype.scrollIntoView = jest.fn();

  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn(),
  };

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });

  // Mock SpeechRecognition API
  const mockSpeechRecognition = {
    start: jest.fn(),
    stop: jest.fn(),
    abort: jest.fn(),
    continuous: false,
    interimResults: false,
    lang: '',
    onresult: null,
    onerror: null,
    onend: null,
    onstart: null,
  };

  Object.defineProperty(window, 'SpeechRecognition', {
    writable: true,
    value: jest.fn().mockImplementation(() => ({ ...mockSpeechRecognition })),
  });

  Object.defineProperty(window, 'webkitSpeechRecognition', {
    writable: true,
    value: jest.fn().mockImplementation(() => ({ ...mockSpeechRecognition })),
  });

  // Reset mocks between tests
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });
}

// Global fetch mock (works in both environments)
global.fetch = jest.fn();

// Reset fetch mock between tests
beforeEach(() => {
  if (global.fetch) {
    (global.fetch as jest.Mock).mockClear();
  }
});
