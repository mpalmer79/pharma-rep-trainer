'use client';

import { useState } from 'react';
import { TrainingSession } from '@/types';
import { ProgressStats } from '@/hooks/useSessionHistory';
import { drugs } from '@/data/drugs';
import { personas } from '@/data/personas';

interface ProgressDashboardProps {
  stats: ProgressStats;
  sessions: TrainingSession[];
  onClose: () => void;
  onViewSession: (session: TrainingSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onClearHistory: () => void;
  onStartTraining: () => void;
}

// Helper to format date
const formatDate = (dateStr: string | Date): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

// Helper to format duration
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Score color helper
const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-600';
};

const getScoreBg = (score: number): string => {
  if (score >= 80) return 'bg-green-100';
  if (score >= 60) return 'bg-amber-100';
  return 'bg-red-100';
};

// Trend icon component
const TrendIndicator = ({ trend }: { trend: string }) => {
  if (trend === 'improving') {
    return (
      <div className="flex items-center gap-1 text-green-600">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <span className="text-sm font-medium">Improving</span>
      </div>
    );
  }
  if (trend === 'declining') {
    return (
      <div className="flex items-center gap-1 text-red-600">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
        <span className="text-sm font-medium">Needs Work</span>
      </div>
    );
  }
  if (trend === 'stable') {
    return (
      <div className="flex items-center gap-1 text-blue-600">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
        </svg>
        <span className="text-sm font-medium">Stable</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 text-gray-500">
      <span className="text-sm">Need more sessions</span>
    </div>
  );
};

// Skill bar component
const SkillBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className={`font-semibold ${getScoreColor(value)}`}>{value}</span>
    </div>
    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
      <div 
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

export default function ProgressDashboard({
  stats,
  sessions,
  onClose,
  onViewSession,
  onDeleteSession,
  onClearHistory,
  onStartTraining,
}: ProgressDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'skills'>('overview');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Get drug/persona names
  const getDrugName = (id: string) => drugs.find(d => d.id === id)?.name || id;
  const getPersonaName = (id: string) => personas.find(p => p.id === id)?.name || id;
  const getPersonaTitle = (id: string) => personas.find(p => p.id === id)?.title || '';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="absolute inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#1B4D7A] to-[#2D6A9F]">
          <div>
            <h2 className="text-xl font-bold text-white">Your Progress</h2>
            <p className="text-sm text-white/70">Track your training journey</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {(['overview', 'skills', 'history'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-[#1B4D7A] border-b-2 border-[#E67E22]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {stats.totalSessions === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Training History Yet</h3>
              <p className="text-gray-500 mb-6 max-w-sm">
                Complete your first training session to start tracking your progress and see your improvement over time.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onStartTraining();
                }}
                className="px-6 py-3 bg-[#E67E22] hover:bg-[#D35400] text-white font-semibold rounded-lg transition-colors"
              >
                Start Your First Session
              </button>
            </div>
          ) : activeTab === 'overview' ? (
            /* Overview Tab */
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-[#1B4D7A] to-[#2D6A9F] rounded-xl p-4 text-white">
                  <p className="text-sm opacity-80">Total Sessions</p>
                  <p className="text-3xl font-bold">{stats.totalSessions}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-gray-500">Average Score</p>
                  <p className={`text-3xl font-bold ${getScoreColor(stats.averageScore)}`}>
                    {stats.averageScore}
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-gray-500">Best Score</p>
                  <p className="text-3xl font-bold text-green-600">{stats.highestScore}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-gray-500">This Week</p>
                  <p className="text-3xl font-bold text-[#E67E22]">{stats.sessionsThisWeek}</p>
                </div>
              </div>

              {/* Trend & Streak */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-gray-500 mb-2">Recent Trend</p>
                  <TrendIndicator trend={stats.recentTrend} />
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-gray-500 mb-2">Practice Streak</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🔥</span>
                    <span className="text-xl font-bold text-[#E67E22]">
                      {stats.streakDays} {stats.streakDays === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance by Persona */}
              {Object.keys(stats.scoresByPersona).length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-4">Performance by Persona</h3>
                  <div className="space-y-3">
                    {Object.entries(stats.scoresByPersona).map(([personaId, data]) => (
                      <div key={personaId} className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">
                              {getPersonaName(personaId)}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-400">{data.count} sessions</span>
                              <span className={`font-semibold ${getScoreColor(data.average)}`}>
                                {data.average}
                              </span>
                            </div>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                data.average >= 80 ? 'bg-green-500' : data.average >= 60 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${data.average}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-400">Best</span>
                          <p className="text-sm font-semibold text-green-600">{data.best}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Performance by Drug */}
              {Object.keys(stats.scoresByDrug).length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-4">Performance by Product</h3>
                  <div className="space-y-3">
                    {Object.entries(stats.scoresByDrug).map(([drugId, data]) => (
                      <div key={drugId} className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">
                              {getDrugName(drugId)}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-400">{data.count} sessions</span>
                              <span className={`font-semibold ${getScoreColor(data.average)}`}>
                                {data.average}
                              </span>
                            </div>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                data.average >= 80 ? 'bg-green-500' : data.average >= 60 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${data.average}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-400">Best</span>
                          <p className="text-sm font-semibold text-green-600">{data.best}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Personal Bests */}
              {stats.personalBests.length > 0 && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span>🏆</span> Personal Bests
                  </h3>
                  <div className="space-y-2">
                    {stats.personalBests.slice(0, 5).map((pb, i) => (
                      <div 
                        key={`${pb.personaId}_${pb.drugId}`}
                        className="flex items-center justify-between py-2 border-b border-amber-200/50 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '⭐'}</span>
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {getPersonaName(pb.personaId)}
                            </p>
                            <p className="text-xs text-gray-500">{getDrugName(pb.drugId)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-[#E67E22]">{pb.score}</p>
                          <p className="text-xs text-gray-400">{formatDate(pb.date)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'skills' ? (
            /* Skills Tab */
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-6">Skill Breakdown</h3>
                <div className="space-y-4">
                  <SkillBar 
                    label="Opening" 
                    value={stats.skillBreakdown.opening} 
                    color="bg-blue-500"
                  />
                  <SkillBar 
                    label="Clinical Knowledge" 
                    value={stats.skillBreakdown.clinicalKnowledge} 
                    color="bg-purple-500"
                  />
                  <SkillBar 
                    label="Objection Handling" 
                    value={stats.skillBreakdown.objectionHandling} 
                    color="bg-indigo-500"
                  />
                  <SkillBar 
                    label="Time Management" 
                    value={stats.skillBreakdown.timeManagement} 
                    color="bg-cyan-500"
                  />
                  <SkillBar 
                    label="Compliance" 
                    value={stats.skillBreakdown.compliance} 
                    color="bg-emerald-500"
                  />
                  <SkillBar 
                    label="Closing" 
                    value={stats.skillBreakdown.closing} 
                    color="bg-orange-500"
                  />
                </div>
              </div>

              {/* Skill Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <h3 className="font-semibold text-blue-800 mb-3">💡 Focus Areas</h3>
                <div className="space-y-2 text-sm text-blue-700">
                  {stats.skillBreakdown.opening < 70 && (
                    <p>• <strong>Opening:</strong> Get to the point faster and establish relevance immediately.</p>
                  )}
                  {stats.skillBreakdown.clinicalKnowledge < 70 && (
                    <p>• <strong>Clinical Knowledge:</strong> Cite specific trial data and use precise terminology.</p>
                  )}
                  {stats.skillBreakdown.objectionHandling < 70 && (
                    <p>• <strong>Objection Handling:</strong> Address concerns directly before pivoting.</p>
                  )}
                  {stats.skillBreakdown.timeManagement < 70 && (
                    <p>• <strong>Time Management:</strong> Keep responses concise for busy physicians.</p>
                  )}
                  {stats.skillBreakdown.compliance < 70 && (
                    <p>• <strong>Compliance:</strong> Stick to approved messaging and avoid absolute claims.</p>
                  )}
                  {stats.skillBreakdown.closing < 70 && (
                    <p>• <strong>Closing:</strong> Always establish a clear next step or call to action.</p>
                  )}
                  {Object.values(stats.skillBreakdown).every(v => v >= 70) && (
                    <p>🎉 Great work! All your skills are at 70 or above. Keep practicing to reach mastery level (80+)!</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* History Tab */
            <div className="space-y-4">
              {sessions.length > 0 ? (
                <>
                  {sessions.map(session => (
                    <div 
                      key={session.id}
                      className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {getPersonaName(session.personaId)}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {getPersonaTitle(session.personaId)} • {getDrugName(session.drugId)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getScoreColor(session.feedback?.overall || 0)}`}>
                            {session.feedback?.overall || 'N/A'}
                          </div>
                          <p className="text-xs text-gray-400">
                            {formatDate(session.completedAt || session.startedAt)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Score pills */}
                      {session.feedback?.scores && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {Object.entries(session.feedback.scores).map(([key, value]) => (
                            <span 
                              key={key}
                              className={`text-xs px-2 py-1 rounded-full ${getScoreBg(value)} ${getScoreColor(value)}`}
                            >
                              {key.replace(/([A-Z])/g, ' $1').trim()}: {value}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-400">
                          {session.duration ? formatDuration(session.duration) : '—'} • {session.messages.length} messages
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => onViewSession(session)}
                            className="text-sm text-[#1B4D7A] hover:text-[#E67E22] font-medium"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => onDeleteSession(session.id)}
                            className="text-sm text-gray-400 hover:text-red-500"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Clear History */}
                  <div className="pt-4 border-t border-gray-200">
                    {showClearConfirm ? (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-700 mb-3">
                          Are you sure you want to delete all training history? This cannot be undone.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              onClearHistory();
                              setShowClearConfirm(false);
                            }}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg"
                          >
                            Yes, Delete All
                          </button>
                          <button
                            onClick={() => setShowClearConfirm(false)}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowClearConfirm(true)}
                        className="text-sm text-gray-400 hover:text-red-500"
                      >
                        Clear All History
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No sessions recorded yet.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {stats.totalSessions > 0 && (
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <button
              onClick={() => {
                onClose();
                onStartTraining();
              }}
              className="w-full py-3 bg-[#E67E22] hover:bg-[#D35400] text-white font-semibold rounded-lg transition-colors"
            >
              Start New Training Session
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
