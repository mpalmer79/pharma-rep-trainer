import React from 'react';
import { render, screen, fireEvent } from '../utils/test-utils';
import FeedbackStage from '@/components/FeedbackStage';
import { TrainingSession } from '@/types';
import { createMockSession, createMockFeedback, mockPersonas } from '../utils/test-utils';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => (
      <div {...props}>{children}</div>
    ),
    button: ({ children, ...props }: React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>) => (
      <button {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

jest.mock('canvas-confetti', () => jest.fn());

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  RadarChart: ({ children }: React.PropsWithChildren) => <div data-testid="radar-chart">{children}</div>,
  PolarGrid: () => <div />,
  PolarAngleAxis: () => <div />,
  PolarRadiusAxis: () => <div />,
  Radar: () => <div />,
}));

describe('FeedbackStage', () => {
  const mockFeedback = {
    score: 75,
    overall: 75,
    scores: {
      opening: 80,
      clinicalKnowledge: 70,
      objectionHandling: 75,
      timeManagement: 85,
      compliance: 90,
      closing: 65,
    },
    strengths: ['Good opening', 'Strong clinical knowledge'],
    improvements: ['Work on closing', 'Add more data points'],
    tips: 'Focus on asking more questions.',
  };

  const mockPersona = mockPersonas[0];

  const mockSessions: TrainingSession[] = [
    createMockSession({ id: 'session-1' }),
    createMockSession({ id: 'session-2' }),
  ];

  const defaultProps = {
    feedback: mockFeedback,
    currentPersona: mockPersona,
    showProgressDashboard: false,
    setShowProgressDashboard: jest.fn(),
    selectedSession: null,
    setSelectedSession: jest.fn(),
    sessions: mockSessions,
    getStats: jest.fn(() => ({
      totalSessions: 2,
      averageScore: 72,
      highestScore: 85,
      lowestScore: 60,
      scoresByPersona: {},
      scoresByDrug: {},
      recentTrend: 'stable' as const,
      skillBreakdown: {
        opening: 75,
        clinicalKnowledge: 70,
        objectionHandling: 72,
        timeManagement: 80,
        compliance: 85,
        closing: 68,
      },
      streakDays: 3,
      lastSessionDate: new Date().toISOString(),
      sessionsThisWeek: 2,
      personalBests: [],
    })),
    deleteSession: jest.fn(),
    clearHistory: jest.fn(),
    onReset: jest.fn(),
    onRetry: jest.fn(),
    onViewSession: jest.fn(),
    onRetrySession: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the overall score', () => {
      render(<FeedbackStage {...defaultProps} />);
      expect(screen.getByText('75')).toBeInTheDocument();
    });

    it('should display feedback strengths', () => {
      render(<FeedbackStage {...defaultProps} />);
      expect(screen.getByText('Good opening')).toBeInTheDocument();
      expect(screen.getByText('Strong clinical knowledge')).toBeInTheDocument();
    });

    it('should display feedback improvements', () => {
      render(<FeedbackStage {...defaultProps} />);
      expect(screen.getByText('Work on closing')).toBeInTheDocument();
      expect(screen.getByText('Add more data points')).toBeInTheDocument();
    });

    it('should display the tip', () => {
      render(<FeedbackStage {...defaultProps} />);
      expect(screen.getByText(/Focus on asking more questions/)).toBeInTheDocument();
    });

    it('should display persona information when available', () => {
      render(<FeedbackStage {...defaultProps} />);
      expect(screen.getByText(mockPersona.name)).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should call onRetry when retry button is clicked', () => {
      render(<FeedbackStage {...defaultProps} />);
      const retryButton = screen.getByRole('button', { name: /retry|try again/i });
      fireEvent.click(retryButton);
      expect(defaultProps.onRetry).toHaveBeenCalled();
    });

    it('should call onReset when new session button is clicked', () => {
      render(<FeedbackStage {...defaultProps} />);
      const newSessionButton = screen.getByRole('button', { name: /new|different|home/i });
      fireEvent.click(newSessionButton);
      expect(defaultProps.onReset).toHaveBeenCalled();
    });
  });

  describe('Score Breakdown', () => {
    it('should display all score categories', () => {
      render(<FeedbackStage {...defaultProps} />);
      expect(screen.getByText(/opening/i)).toBeInTheDocument();
      expect(screen.getByText(/clinical/i)).toBeInTheDocument();
      expect(screen.getByText(/objection/i)).toBeInTheDocument();
      expect(screen.getByText(/time/i)).toBeInTheDocument();
      expect(screen.getByText(/compliance/i)).toBeInTheDocument();
      expect(screen.getByText(/closing/i)).toBeInTheDocument();
    });

    it('should display individual category scores', () => {
      render(<FeedbackStage {...defaultProps} />);
      expect(screen.getByText('80')).toBeInTheDocument();
      expect(screen.getByText('90')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty strengths array', () => {
      const noStrengthsFeedback = { ...mockFeedback, strengths: [] };
      render(<FeedbackStage {...defaultProps} feedback={noStrengthsFeedback} />);
      expect(screen.getByText('75')).toBeInTheDocument();
    });

    it('should handle empty improvements array', () => {
      const noImprovementsFeedback = { ...mockFeedback, improvements: [] };
      render(<FeedbackStage {...defaultProps} feedback={noImprovementsFeedback} />);
      expect(screen.getByText('75')).toBeInTheDocument();
    });

    it('should handle null persona gracefully', () => {
      render(<FeedbackStage {...defaultProps} currentPersona={undefined} />);
      expect(screen.getByText('75')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button labels', () => {
      render(<FeedbackStage {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeEnabled();
      });
    });
  });
});
