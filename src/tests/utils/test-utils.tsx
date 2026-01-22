import { TrainingSession, Feedback, ScoreBreakdown, Message, Persona, Drug } from '@/types';

// =====================================================
// MOCK PERSONAS
// =====================================================
export const mockPersonas: Persona[] = [
  {
    id: 'curious',
    name: 'Dr. James Park',
    title: 'Early Adopter',
    description: 'Interested in new treatments but asks deep mechanistic questions.',
    avatar: '👨‍⚕️',
    timerSeconds: 180,
    difficulty: 'easy',
    systemPrompt: 'You are Dr. James Park, a curious physician...',
  },
  {
    id: 'gatekeeper',
    name: 'Monica Reynolds',
    title: 'Office Manager',
    description: 'Controls access to the physicians. Get past her first.',
    avatar: '👩‍💼',
    timerSeconds: 120,
    difficulty: 'medium',
    systemPrompt: 'You are Monica Reynolds, the office manager...',
  },
  {
    id: 'skeptic',
    name: 'Dr. Michael Torres',
    title: 'Data-Driven Skeptic',
    description: 'Academic physician who challenges every claim.',
    avatar: '👨‍🔬',
    timerSeconds: 180,
    difficulty: 'hard',
    systemPrompt: 'You are Dr. Michael Torres, a skeptical physician...',
  },
  {
    id: 'rush',
    name: 'Dr. Sarah Chen',
    title: 'Time-Pressed Physician',
    description: 'Has 90 seconds. Make every word count.',
    avatar: '👩‍⚕️',
    timerSeconds: 90,
    difficulty: 'hard',
    systemPrompt: 'You are Dr. Sarah Chen, extremely busy...',
  },
  {
    id: 'loyalist',
    name: 'Dr. Patricia Williams',
    title: 'Competitor Loyalist',
    description: 'Happy with current prescribing. You need a compelling reason.',
    avatar: '👩‍⚕️',
    timerSeconds: 150,
    difficulty: 'medium',
    systemPrompt: 'You are Dr. Patricia Williams, loyal to competitor...',
  },
];

// =====================================================
// MOCK DRUGS
// =====================================================
export const mockDrugs: Drug[] = [
  {
    id: 'cardiomax',
    name: 'CardioMax',
    category: 'Cardiovascular',
    indication: 'Heart Failure with reduced ejection fraction',
    keyData: '23% reduction in cardiovascular death in the EMPEROR trial',
    competitorName: 'Entresto',
    mechanismOfAction: 'SGLT2 inhibitor',
  },
  {
    id: 'neurozen',
    name: 'NeuroZen',
    category: 'Neurology',
    indication: 'Migraine prevention',
    keyData: '50% reduction in monthly migraine days vs placebo',
    competitorName: 'Aimovig',
    mechanismOfAction: 'CGRP inhibitor',
  },
];

// =====================================================
// MOCK MESSAGES
// =====================================================
export const createMockMessages = (count: number = 4): Message[] => {
  const messages: Message[] = [];
  for (let i = 0; i < count; i++) {
    const isUser = i % 2 === 0;
    messages.push({
      role: isUser ? 'user' : 'assistant',
      content: isUser
        ? `User message ${i + 1}: Discussing the medication benefits.`
        : `Assistant message ${i + 1}: Response about the medication.`,
      timestamp: new Date(Date.now() - (count - i) * 60000),
    });
  }
  return messages;
};

// =====================================================
// MOCK FEEDBACK
// =====================================================
export const createMockFeedback = (overall: number = 75): Feedback => {
  const scores: ScoreBreakdown = {
    opening: overall + 5,
    clinicalKnowledge: overall - 5,
    objectionHandling: overall,
    timeManagement: overall + 10,
    compliance: 90,
    closing: overall - 10,
  };

  return {
    scores,
    overall,
    strengths: ['Good opening', 'Strong clinical knowledge'],
    improvements: ['Work on closing', 'Add more data points'],
    tips: 'Focus on asking more questions to understand needs.',
  };
};

// =====================================================
// MOCK TRAINING SESSIONS
// =====================================================
export const createMockSession = (overrides: Partial<TrainingSession> = {}): TrainingSession => ({
  id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  drugId: 'cardiomax',
  personaId: 'curious',
  messages: createMockMessages(4),
  feedback: createMockFeedback(75),
  startedAt: new Date(Date.now() - 300000),
  completedAt: new Date(),
  duration: 180,
  ...overrides,
});

export const createMockSessions = (count: number, scoreRange: [number, number] = [60, 90]): TrainingSession[] => {
  return Array.from({ length: count }, (_, i) => {
    const score = scoreRange[0] + Math.floor(Math.random() * (scoreRange[1] - scoreRange[0]));
    const personaIndex = i % mockPersonas.length;
    const drugIndex = i % mockDrugs.length;
    
    return createMockSession({
      id: `session_${i}`,
      personaId: mockPersonas[personaIndex].id,
      drugId: mockDrugs[drugIndex].id,
      feedback: createMockFeedback(score),
      startedAt: new Date(Date.now() - (count - i) * 86400000),
    });
  });
};

// =====================================================
// RENDER HELPERS
// =====================================================
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// =====================================================
// ASYNC UTILITIES
// =====================================================
export const waitForNextTick = () => new Promise((resolve) => setTimeout(resolve, 0));

export const mockFetchResponse = (data: unknown, ok: boolean = true) => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok,
    json: async () => data,
  });
};

export const mockFetchError = (error: Error) => {
  (global.fetch as jest.Mock).mockRejectedValueOnce(error);
};

// =====================================================
// LOCALSTORAGE HELPERS
// =====================================================
export const mockLocalStorage = (data: Record<string, unknown>) => {
  (window.localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
    return data[key] ? JSON.stringify(data[key]) : null;
  });
};

export const getLocalStorageCalls = () => {
  return {
    getItem: (window.localStorage.getItem as jest.Mock).mock.calls,
    setItem: (window.localStorage.setItem as jest.Mock).mock.calls,
    removeItem: (window.localStorage.removeItem as jest.Mock).mock.calls,
  };
};
