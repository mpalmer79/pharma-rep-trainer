import {
  detectPatterns,
  SessionSnapshot,
  FeedbackDimension,
} from '@/lib/sessions/patterns';

describe('Pattern Detection', () => {
  const createSnapshot = (
    sessionId: string,
    scores: { dimension: FeedbackDimension; score: number }[]
  ): SessionSnapshot => ({
    sessionId,
    timestamp: new Date().toISOString(),
    scores: scores.map(({ dimension, score }) => ({ dimension, score })),
  });

  describe('detectPatterns', () => {
    it('should return empty array when sessions are below minimum', () => {
      const sessions: SessionSnapshot[] = [
        createSnapshot('1', [{ dimension: 'confidence', score: 70 }]),
        createSnapshot('2', [{ dimension: 'confidence', score: 75 }]),
      ];

      const patterns = detectPatterns(sessions, 3);
      expect(patterns).toEqual([]);
    });

    it('should detect improving pattern when scores consistently increase', () => {
      const sessions: SessionSnapshot[] = [
        createSnapshot('1', [{ dimension: 'confidence', score: 60 }]),
        createSnapshot('2', [{ dimension: 'confidence', score: 70 }]),
        createSnapshot('3', [{ dimension: 'confidence', score: 80 }]),
      ];

      const patterns = detectPatterns(sessions, 3);

      expect(patterns).toHaveLength(1);
      expect(patterns[0].dimension).toBe('confidence');
      expect(patterns[0].type).toBe('improving');
      expect(patterns[0].sessionsAnalyzed).toBe(3);
    });

    it('should detect declining pattern when scores consistently decrease', () => {
      const sessions: SessionSnapshot[] = [
        createSnapshot('1', [{ dimension: 'clarity', score: 90 }]),
        createSnapshot('2', [{ dimension: 'clarity', score: 80 }]),
        createSnapshot('3', [{ dimension: 'clarity', score: 70 }]),
      ];

      const patterns = detectPatterns(sessions, 3);

      expect(patterns).toHaveLength(1);
      expect(patterns[0].dimension).toBe('clarity');
      expect(patterns[0].type).toBe('declining');
    });

    it('should detect plateau pattern when scores remain unchanged', () => {
      const sessions: SessionSnapshot[] = [
        createSnapshot('1', [{ dimension: 'listening', score: 75 }]),
        createSnapshot('2', [{ dimension: 'listening', score: 75 }]),
        createSnapshot('3', [{ dimension: 'listening', score: 75 }]),
      ];

      const patterns = detectPatterns(sessions, 3);

      expect(patterns).toHaveLength(1);
      expect(patterns[0].dimension).toBe('listening');
      expect(patterns[0].type).toBe('plateau');
    });

    it('should not detect pattern when scores fluctuate', () => {
      const sessions: SessionSnapshot[] = [
        createSnapshot('1', [{ dimension: 'structure', score: 70 }]),
        createSnapshot('2', [{ dimension: 'structure', score: 80 }]),
        createSnapshot('3', [{ dimension: 'structure', score: 75 }]),
      ];

      const patterns = detectPatterns(sessions, 3);
      expect(patterns).toHaveLength(0);
    });

    it('should detect patterns across multiple dimensions', () => {
      const sessions: SessionSnapshot[] = [
        createSnapshot('1', [
          { dimension: 'confidence', score: 60 },
          { dimension: 'clarity', score: 90 },
          { dimension: 'listening', score: 70 },
        ]),
        createSnapshot('2', [
          { dimension: 'confidence', score: 70 },
          { dimension: 'clarity', score: 80 },
          { dimension: 'listening', score: 70 },
        ]),
        createSnapshot('3', [
          { dimension: 'confidence', score: 80 },
          { dimension: 'clarity', score: 70 },
          { dimension: 'listening', score: 70 },
        ]),
      ];

      const patterns = detectPatterns(sessions, 3);

      expect(patterns.length).toBe(3);

      const confidencePattern = patterns.find((p) => p.dimension === 'confidence');
      expect(confidencePattern?.type).toBe('improving');

      const clarityPattern = patterns.find((p) => p.dimension === 'clarity');
      expect(clarityPattern?.type).toBe('declining');

      const listeningPattern = patterns.find((p) => p.dimension === 'listening');
      expect(listeningPattern?.type).toBe('plateau');
    });

    it('should provide appropriate recommendation for improving pattern', () => {
      const sessions: SessionSnapshot[] = [
        createSnapshot('1', [{ dimension: 'objection_handling', score: 60 }]),
        createSnapshot('2', [{ dimension: 'objection_handling', score: 70 }]),
        createSnapshot('3', [{ dimension: 'objection_handling', score: 80 }]),
      ];

      const patterns = detectPatterns(sessions, 3);
      expect(patterns[0].recommendation).toContain('higher difficulty');
    });

    it('should provide appropriate recommendation for declining pattern', () => {
      const sessions: SessionSnapshot[] = [
        createSnapshot('1', [{ dimension: 'structure', score: 80 }]),
        createSnapshot('2', [{ dimension: 'structure', score: 70 }]),
        createSnapshot('3', [{ dimension: 'structure', score: 60 }]),
      ];

      const patterns = detectPatterns(sessions, 3);
      expect(patterns[0].recommendation).toContain('slow down');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty sessions array', () => {
      const patterns = detectPatterns([], 3);
      expect(patterns).toEqual([]);
    });

    it('should handle sessions with no scores', () => {
      const sessions: SessionSnapshot[] = [
        createSnapshot('1', []),
        createSnapshot('2', []),
        createSnapshot('3', []),
      ];

      const patterns = detectPatterns(sessions, 3);
      expect(patterns).toEqual([]);
    });
  });
});
