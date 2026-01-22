/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

jest.mock('@anthropic-ai/sdk', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      messages: {
        create: jest.fn(),
      },
    })),
  };
});

jest.mock('@/data/personas', () => ({
  getPersonaById: jest.fn((id) => {
    const personas: Record<string, unknown> = {
      curious: {
        id: 'curious',
        name: 'Dr. James Park',
        title: 'Early Adopter',
        description: 'Curious physician',
        difficulty: 'easy',
        systemPrompt: 'You are Dr. Park...',
      },
      skeptic: {
        id: 'skeptic',
        name: 'Dr. Michael Torres',
        title: 'Skeptic',
        description: 'Academic physician',
        difficulty: 'hard',
        systemPrompt: 'You are Dr. Torres...',
      },
    };
    return personas[id] || null;
  }),
}));

jest.mock('@/data/drugs', () => ({
  getDrugById: jest.fn((id) => {
    const drugs: Record<string, unknown> = {
      cardiomax: {
        id: 'cardiomax',
        name: 'CardioMax',
        category: 'Cardiovascular',
        indication: 'Heart Failure',
        keyData: '23% reduction',
        competitorName: 'Entresto',
      },
    };
    return drugs[id] || null;
  }),
}));

describe('Score API Route', () => {
  let POST: (request: NextRequest) => Promise<Response>;

  beforeEach(async () => {
    jest.clearAllMocks();
    delete process.env.ANTHROPIC_API_KEY;
    jest.resetModules();
    const routeModule = await import('@/app/api/score/route');
    POST = routeModule.POST;
  });

  const createRequest = (body: Record<string, unknown>): NextRequest => {
    return new NextRequest('http://localhost:3000/api/score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  };

  describe('Input Handling', () => {
    it('should accept persona and drug objects directly', async () => {
      const request = createRequest({
        persona: {
          id: 'curious',
          name: 'Dr. James Park',
          difficulty: 'easy',
        },
        drug: {
          id: 'cardiomax',
          name: 'CardioMax',
        },
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there' },
        ],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('scores');
      expect(data).toHaveProperty('overall');
    });
  });

  describe('Fallback Scoring', () => {
    it('should use fallback scoring when no API key is configured', async () => {
      const request = createRequest({
        persona: {
          id: 'curious',
          name: 'Dr. Park',
          difficulty: 'easy',
        },
        drug: {
          id: 'cardiomax',
          name: 'CardioMax',
        },
        messages: [
          { role: 'user', content: 'Let me tell you about the 23% reduction in our trial.' },
        ],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.scores).toBeDefined();
      expect(data.overall).toBeDefined();
      expect(data.strengths).toBeInstanceOf(Array);
      expect(data.improvements).toBeInstanceOf(Array);
    });

    it('should award higher clinical knowledge for data mentions', async () => {
      const requestWithData = createRequest({
        persona: { id: 'curious', name: 'Dr. Park', difficulty: 'easy' },
        drug: { id: 'cardiomax', name: 'CardioMax' },
        messages: [
          { role: 'user', content: 'The trial showed 45% improvement with statistical significance.' },
        ],
      });

      const requestWithoutData = createRequest({
        persona: { id: 'curious', name: 'Dr. Park', difficulty: 'easy' },
        drug: { id: 'cardiomax', name: 'CardioMax' },
        messages: [
          { role: 'user', content: 'This is a good medication.' },
        ],
      });

      const responseWithData = await POST(requestWithData);
      const dataWithData = await responseWithData.json();

      const responseWithoutData = await POST(requestWithoutData);
      const dataWithoutData = await responseWithoutData.json();

      expect(dataWithData.scores.clinicalKnowledge).toBeGreaterThan(
        dataWithoutData.scores.clinicalKnowledge
      );
    });

    it('should penalize compliance for absolute claims', async () => {
      const requestWithClaim = createRequest({
        persona: { id: 'curious', name: 'Dr. Park', difficulty: 'easy' },
        drug: { id: 'cardiomax', name: 'CardioMax' },
        messages: [
          { role: 'user', content: 'This drug will cure your patients with no side effects.' },
        ],
      });

      const responseWithClaim = await POST(requestWithClaim);
      const dataWithClaim = await responseWithClaim.json();

      expect(dataWithClaim.scores.compliance).toBeLessThan(90);
    });
  });

  describe('Feedback Structure', () => {
    it('should return all required score categories', async () => {
      const request = createRequest({
        persona: { id: 'curious', name: 'Dr. Park', difficulty: 'easy' },
        drug: { id: 'cardiomax', name: 'CardioMax' },
        messages: [{ role: 'user', content: 'Test' }],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.scores).toHaveProperty('opening');
      expect(data.scores).toHaveProperty('clinicalKnowledge');
      expect(data.scores).toHaveProperty('objectionHandling');
      expect(data.scores).toHaveProperty('timeManagement');
      expect(data.scores).toHaveProperty('compliance');
      expect(data.scores).toHaveProperty('closing');
    });

    it('should return scores within 0-100 range', async () => {
      const request = createRequest({
        persona: { id: 'curious', name: 'Dr. Park', difficulty: 'easy' },
        drug: { id: 'cardiomax', name: 'CardioMax' },
        messages: [{ role: 'user', content: 'Test message' }],
      });

      const response = await POST(request);
      const data = await response.json();

      Object.values(data.scores).forEach((score) => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });

    it('should return persona-specific tips', async () => {
      const curiousRequest = createRequest({
        persona: { id: 'curious', name: 'Dr. Park', difficulty: 'easy' },
        drug: { id: 'cardiomax', name: 'CardioMax' },
        messages: [{ role: 'user', content: 'Test' }],
      });

      const skepticRequest = createRequest({
        persona: { id: 'skeptic', name: 'Dr. Torres', difficulty: 'hard' },
        drug: { id: 'cardiomax', name: 'CardioMax' },
        messages: [{ role: 'user', content: 'Test' }],
      });

      const curiousResponse = await POST(curiousRequest);
      const curiousData = await curiousResponse.json();

      const skepticResponse = await POST(skepticRequest);
      const skepticData = await skepticResponse.json();

      expect(curiousData.tips).toBeDefined();
      expect(skepticData.tips).toBeDefined();
      expect(curiousData.tips).not.toBe(skepticData.tips);
    });
  });

  describe('Error Handling', () => {
    it('should handle empty messages array', async () => {
      const request = createRequest({
        persona: { id: 'curious', name: 'Dr. Park', difficulty: 'easy' },
        drug: { id: 'cardiomax', name: 'CardioMax' },
        messages: [],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.overall).toBeDefined();
    });
  });
});
