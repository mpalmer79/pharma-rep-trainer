import {
  recommendNextJourneyNode,
  TrainingJourneyNode,
  JourneyStatus,
} from '@/lib/journeys/recommendation';
import { DetectedPattern, FeedbackDimension } from '@/lib/sessions/patterns';

describe('Journey Recommendation', () => {
  const createNode = (
    id: string,
    status: JourneyStatus,
    difficulty?: 'beginner' | 'intermediate' | 'advanced',
    dimension?: FeedbackDimension
  ): TrainingJourneyNode => ({
    id,
    type: 'skill',
    status,
    difficulty,
    metadata: dimension ? { dimension } : undefined,
  });

  const createPattern = (
    dimension: FeedbackDimension,
    type: 'improving' | 'declining' | 'plateau'
  ): DetectedPattern => ({
    dimension,
    type,
    sessionsAnalyzed: 3,
    summary: `${type} pattern in ${dimension}`,
    recommendation: `Recommendation for ${type} ${dimension}`,
  });

  describe('recommendNextJourneyNode', () => {
    it('should return null when nodes array is empty', () => {
      const result = recommendNextJourneyNode([], []);
      expect(result).toBeNull();
    });

    it('should return null when no nodes are available', () => {
      const nodes: TrainingJourneyNode[] = [
        createNode('1', 'completed'),
        createNode('2', 'locked'),
        createNode('3', 'in_progress'),
      ];

      const result = recommendNextJourneyNode(nodes, []);
      expect(result).toBeNull();
    });

    it('should return first available node when no patterns exist', () => {
      const nodes: TrainingJourneyNode[] = [
        createNode('1', 'completed'),
        createNode('2', 'available'),
        createNode('3', 'available'),
      ];

      const result = recommendNextJourneyNode(nodes, []);

      expect(result).not.toBeNull();
      expect(result?.nodeId).toBe('2');
      expect(result?.reason).toContain('progress');
    });
  });

  describe('Declining Pattern Priority', () => {
    it('should prioritize declining patterns with matching available node', () => {
      const nodes: TrainingJourneyNode[] = [
        createNode('confidence-beginner', 'available', 'beginner', 'confidence'),
        createNode('clarity-advanced', 'available', 'advanced', 'clarity'),
      ];

      const patterns: DetectedPattern[] = [
        createPattern('confidence', 'declining'),
      ];

      const result = recommendNextJourneyNode(nodes, patterns);

      expect(result?.nodeId).toBe('confidence-beginner');
      expect(result?.reason).toContain('declining');
    });

    it('should avoid advanced nodes for declining patterns', () => {
      const nodes: TrainingJourneyNode[] = [
        createNode('confidence-advanced', 'available', 'advanced', 'confidence'),
        createNode('other-beginner', 'available', 'beginner'),
      ];

      const patterns: DetectedPattern[] = [
        createPattern('confidence', 'declining'),
      ];

      const result = recommendNextJourneyNode(nodes, patterns);
      expect(result?.nodeId).not.toBe('confidence-advanced');
    });
  });

  describe('Plateau Pattern Priority', () => {
    it('should recommend matching node for plateau patterns', () => {
      const nodes: TrainingJourneyNode[] = [
        createNode('listening-intermediate', 'available', 'intermediate', 'listening'),
        createNode('other-beginner', 'available', 'beginner'),
      ];

      const patterns: DetectedPattern[] = [
        createPattern('listening', 'plateau'),
      ];

      const result = recommendNextJourneyNode(nodes, patterns);

      expect(result?.nodeId).toBe('listening-intermediate');
      expect(result?.reason).toContain('plateau');
    });
  });

  describe('Improving Pattern Priority', () => {
    it('should recommend advanced node for improving patterns', () => {
      const nodes: TrainingJourneyNode[] = [
        createNode('structure-beginner', 'available', 'beginner', 'structure'),
        createNode('structure-advanced', 'available', 'advanced', 'structure'),
      ];

      const patterns: DetectedPattern[] = [
        createPattern('structure', 'improving'),
      ];

      const result = recommendNextJourneyNode(nodes, patterns);

      expect(result?.nodeId).toBe('structure-advanced');
      expect(result?.reason).toContain('improvement');
    });
  });

  describe('Fallback Behavior', () => {
    it('should return first available node when patterns do not match any nodes', () => {
      const nodes: TrainingJourneyNode[] = [
        createNode('unrelated-node', 'available', 'beginner', 'listening'),
      ];

      const patterns: DetectedPattern[] = [
        createPattern('confidence', 'declining'),
      ];

      const result = recommendNextJourneyNode(nodes, patterns);

      expect(result?.nodeId).toBe('unrelated-node');
      expect(result?.reason).toContain('progress');
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle multiple patterns with multiple available nodes', () => {
      const nodes: TrainingJourneyNode[] = [
        createNode('confidence-advanced', 'available', 'advanced', 'confidence'),
        createNode('clarity-beginner', 'available', 'beginner', 'clarity'),
        createNode('listening-intermediate', 'available', 'intermediate', 'listening'),
      ];

      const patterns: DetectedPattern[] = [
        createPattern('confidence', 'improving'),
        createPattern('clarity', 'declining'),
        createPattern('listening', 'plateau'),
      ];

      const result = recommendNextJourneyNode(nodes, patterns);

      // Declining clarity should take priority
      expect(result?.nodeId).toBe('clarity-beginner');
    });
  });
});
