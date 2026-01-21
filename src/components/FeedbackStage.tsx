'use client';

import { TrainingSession } from '@/types';
import { Persona } from '@/types';
import { motion } from 'framer-motion';
import ProgressDashboard from '@/components/ProgressDashboard';
import SessionDetailModal from '@/components/SessionDetailModal';
import RadarChart from '@/components/ui/RadarChart';
import { ProgressStats } from '@/hooks/useSessionHistory';

interface FeedbackData {
  score: number;
  scores?: {
    opening: number;
    clinicalKnowledge: number;
    objectionHandling: number;
    timeManagement: number;
    compliance: number;
    closing: number;
  };
  overall?: number;
  strengths: string[];
  improvements: string[];
  tips: string | string[];
}

interface FeedbackStageProps {
  feedback: FeedbackData;
  currentPersona: Persona | undefined;
  showProgressDashboard: boolean;
  setShowProgressDashboard: (show: boolean) => void;
  selectedSession: TrainingSession | null;
  setSelectedSession: (session: TrainingSession | null) => void;
  sessions: TrainingSession[];
  getStats: () => ProgressStats;
  deleteSession: (id: string) => void;
  clearHistory: () => void;
  onReset: () => void;
  onRetry: () => void;
  onViewSession: (session: TrainingSession) => void;
  onRetrySession: (drugId: string, personaId: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const scoreVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 15,
      delay: 0.2,
    },
  },
};

export const FeedbackStage = ({
  feedback,
  currentPersona,
  showProgressDashboard,
  setShowProgressDashboard,
  selectedSession,
  setSelectedSession,
  sessions,
  getStats,
  deleteSession,
  clearHistory,
  onReset,
  onRetry,
  onViewSession,
  onRetrySession,
}: FeedbackStageProps) => {
  const displayScore = feedback.overall || feedback.score;
  const scoreColor =
    displayScore >= 80
      ? 'text-green-600'
      : displayScore >= 60
      ? 'text-amber-600'
      : 'text-red-600';
  const scoreBg =
    displayScore >= 80
      ? 'bg-green-50 border-green-200'
      : displayScore >= 60
      ? 'bg-amber-50 border-amber-200'
      : 'bg-red-50 border-red-200';

  // Default scores if not provided
  const scores = feedback.scores || {
    opening: displayScore,
    clinicalKnowledge: displayScore,
    objectionHandling: displayScore,
    timeManagement: displayScore,
    compliance: displayScore,
    closing: displayScore,
  };

  // Normalize tips to always be an array
  const tipsArray = feedback.tips
    ? Array.isArray(feedback.tips)
      ? feedback.tips
      : [feedback.tips]
    : [];

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <motion.div
        className="max-w-2xl mx-auto px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <div className="w-16 h-16 rounded bg-gradient-to-br from-[#1B4D7A] to-[#2D6A9F] flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">R</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1B4D7A] mb-2">Session Complete</h1>
          <p className="text-gray-600">Here&apos;s how you performed</p>
        </motion.div>

        {/* Overall Score */}
        <motion.div
          className={`${scoreBg} border rounded-xl p-8 mb-6 text-center`}
          variants={scoreVariants}
        >
          <p className="text-gray-600 mb-2">Your Score</p>
          <motion.p
            className={`text-7xl font-bold ${scoreColor}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.4 }}
          >
            {displayScore}
          </motion.p>
          <p className="text-gray-500 mt-2">out of 100</p>
        </motion.div>

        {/* Radar Chart - Score Breakdown */}
        <motion.div
          className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm"
          variants={itemVariants}
        >
          <h3 className="text-lg font-semibold text-[#1B4D7A] mb-4 text-center">
            Performance Breakdown
          </h3>
          <RadarChart scores={scores} />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            {Object.entries(scores).map(([key, value]) => {
              const labels: Record<string, string> = {
                opening: 'Opening',
                clinicalKnowledge: 'Clinical',
                objectionHandling: 'Objections',
                timeManagement: 'Time Mgmt',
                compliance: 'Compliance',
                closing: 'Closing',
              };
              const color =
                value >= 80
                  ? 'text-green-600 bg-green-50'
                  : value >= 60
                  ? 'text-amber-600 bg-amber-50'
                  : 'text-red-600 bg-red-50';
              return (
                <div key={key} className={`p-3 rounded-lg ${color} text-center`}>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs opacity-75">{labels[key]}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {feedback.strengths.length > 0 && (
          <motion.div
            className="bg-white border border-gray-200 rounded-xl p-6 mb-4 shadow-sm"
            variants={itemVariants}
          >
            <h3 className="text-lg font-semibold text-green-600 mb-4">Strengths</h3>
            <ul className="space-y-2">
              {feedback.strengths.map((s, i) => (
                <motion.li
                  key={i}
                  className="text-gray-700 flex items-start gap-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <span className="text-green-500 mt-1">✓</span> {s}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}

        {feedback.improvements.length > 0 && (
          <motion.div
            className="bg-white border border-gray-200 rounded-xl p-6 mb-4 shadow-sm"
            variants={itemVariants}
          >
            <h3 className="text-lg font-semibold text-amber-600 mb-4">Areas for Improvement</h3>
            <ul className="space-y-2">
              {feedback.improvements.map((imp, i) => (
                <motion.li
                  key={i}
                  className="text-gray-700 flex items-start gap-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                >
                  <span className="text-amber-500 mt-1">→</span> {imp}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}

        {tipsArray.length > 0 && (
          <motion.div
            className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm"
            variants={itemVariants}
          >
            <h3 className="text-lg font-semibold text-[#1B4D7A] mb-4">Pro Tips</h3>
            <ul className="space-y-2">
              {tipsArray.map((tip, i) => (
                <motion.li
                  key={i}
                  className="text-gray-700 flex items-start gap-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                >
                  <span className="text-[#E67E22] mt-1">💡</span> {tip}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}

        <motion.div className="flex flex-col sm:flex-row gap-3" variants={itemVariants}>
          <motion.button
            onClick={onReset}
            className="flex-1 py-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Back to Home
          </motion.button>
          <motion.button
            onClick={() => setShowProgressDashboard(true)}
            className="flex-1 py-4 bg-[#1B4D7A] hover:bg-[#0F2D44] text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            View Progress
          </motion.button>
          <motion.button
            onClick={onRetry}
            className="flex-1 py-4 bg-[#E67E22] hover:bg-[#D35400] text-white font-semibold rounded-lg transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Try Again
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Progress Dashboard Modal in Feedback */}
      {showProgressDashboard && (
        <ProgressDashboard
          stats={getStats()}
          sessions={sessions}
          onClose={() => setShowProgressDashboard(false)}
          onViewSession={onViewSession}
          onDeleteSession={deleteSession}
          onClearHistory={clearHistory}
          onStartTraining={() => {
            setShowProgressDashboard(false);
            onReset();
          }}
        />
      )}

      {/* Session Detail Modal in Feedback */}
      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onRetry={onRetrySession}
        />
      )}
    </div>
  );
};

export default FeedbackStage;
