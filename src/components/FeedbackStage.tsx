
'use client';

import { TrainingSession } from '@/types';
import { Persona } from '@/types';
import ProgressDashboard from '@/components/ProgressDashboard';
import SessionDetailModal from '@/components/SessionDetailModal';
import { ProgressStats } from '@/hooks/useSessionHistory';

interface FeedbackData {
  score: number;
  strengths: string[];
  improvements: string[];
  tips: string[];
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
  onRetrySession
}: FeedbackStageProps) => {
  const scoreColor = feedback.score >= 80 ? 'text-green-600' : feedback.score >= 60 ? 'text-amber-600' : 'text-red-600';
  const scoreBg = feedback.score >= 80 ? 'bg-green-50 border-green-200' : feedback.score >= 60 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded bg-gradient-to-br from-[#1B4D7A] to-[#2D6A9F] flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">R</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1B4D7A] mb-2">Session Complete</h1>
          <p className="text-gray-600">Here&apos;s how you performed</p>
        </div>

        <div className={`${scoreBg} border rounded-xl p-8 mb-6 text-center`}>
          <p className="text-gray-600 mb-2">Your Score</p>
          <p className={`text-7xl font-bold ${scoreColor}`}>{feedback.score}</p>
          <p className="text-gray-500 mt-2">out of 100</p>
        </div>

        {feedback.strengths.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4 shadow-sm">
            <h3 className="text-lg font-semibold text-green-600 mb-4">Strengths</h3>
            <ul className="space-y-2">
              {feedback.strengths.map((s, i) => (
                <li key={i} className="text-gray-700 flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {feedback.improvements.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4 shadow-sm">
            <h3 className="text-lg font-semibold text-amber-600 mb-4">Areas for Improvement</h3>
            <ul className="space-y-2">
              {feedback.improvements.map((imp, i) => (
                <li key={i} className="text-gray-700 flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  {imp}
                </li>
              ))}
            </ul>
          </div>
        )}

        {feedback.tips.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
            <h3 className="text-lg font-semibold text-[#1B4D7A] mb-4">Pro Tips</h3>
            <ul className="space-y-2">
              {feedback.tips.map((tip, i) => (
                <li key={i} className="text-gray-700 flex items-start gap-2">
                  <span className="text-[#E67E22] mt-1">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onReset}
            className="flex-1 py-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </button>
          <button
            onClick={() => setShowProgressDashboard(true)}
            className="flex-1 py-4 bg-[#1B4D7A] hover:bg-[#0F2D44] text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            View Progress
          </button>
          <button
            onClick={onRetry}
            className="flex-1 py-4 bg-[#E67E22] hover:bg-[#D35400] text-white font-semibold rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>

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
