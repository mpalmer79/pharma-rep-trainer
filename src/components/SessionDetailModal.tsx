'use client';

import { TrainingSession } from '@/types';
import { drugs } from '@/data/drugs';
import { personas } from '@/data/personas';

interface SessionDetailModalProps {
  session: TrainingSession;
  onClose: () => void;
  onRetry: (drugId: string, personaId: string) => void;
}

// Helper to format date
const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

// Helper to format duration
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

// Score color helper
const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-600';
};

const getScoreBg = (score: number): string => {
  if (score >= 80) return 'bg-green-50 border-green-200';
  if (score >= 60) return 'bg-amber-50 border-amber-200';
  return 'bg-red-50 border-red-200';
};

// Score label helper
const getScoreLabel = (key: string): string => {
  const labels: Record<string, string> = {
    opening: 'Opening',
    clinicalKnowledge: 'Clinical Knowledge',
    objectionHandling: 'Objection Handling',
    timeManagement: 'Time Management',
    compliance: 'Compliance',
    closing: 'Closing',
  };
  return labels[key] || key;
};

export default function SessionDetailModal({
  session,
  onClose,
  onRetry,
}: SessionDetailModalProps) {
  const drug = drugs.find(d => d.id === session.drugId);
  const persona = personas.find(p => p.id === session.personaId);

  const getPersonaImage = (personaId: string): string => {
    const imageMap: Record<string, string> = {
      'rush': '1559839734-2b71ea197ec2',
      'skeptic': '1612349317150-e413f6a5b16d',
      'loyalist': '1594824476967-48c8b964273f',
      'gatekeeper': '1573496359142-b8d87734a5a2',
      'curious': '1537368910025-700350fe46c7',
    };
    return `https://images.unsplash.com/photo-${imageMap[personaId] || imageMap['curious']}?w=100&h=100&fit=crop&crop=face`;
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            {persona && (
              <img 
                src={getPersonaImage(persona.id)}
                alt={persona.name}
                className="w-12 h-12 rounded-xl object-cover"
              />
            )}
            <div>
              <h2 className="font-bold text-gray-800">{persona?.name || 'Unknown Persona'}</h2>
              <p className="text-sm text-gray-500">
                {persona?.title} • {drug?.name || 'Unknown Product'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Session Info */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-gray-500">Date:</span>
                <span className="ml-1 font-medium text-gray-700">
                  {formatDateTime(session.completedAt || session.startedAt)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Duration:</span>
                <span className="ml-1 font-medium text-gray-700">
                  {session.duration ? formatDuration(session.duration) : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Messages:</span>
                <span className="ml-1 font-medium text-gray-700">
                  {session.messages.length}
                </span>
              </div>
            </div>
          </div>

          {/* Score Summary */}
          {session.feedback && (
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Performance Score</h3>
                <div className={`px-4 py-2 rounded-xl ${getScoreBg(session.feedback.overall)}`}>
                  <span className={`text-3xl font-bold ${getScoreColor(session.feedback.overall)}`}>
                    {session.feedback.overall}
                  </span>
                  <span className="text-gray-500 text-sm ml-1">/ 100</span>
                </div>
              </div>
              
              {/* Score Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(session.feedback.scores).map(([key, value]) => (
                  <div 
                    key={key}
                    className="bg-gray-50 rounded-lg p-3"
                  >
                    <p className="text-xs text-gray-500 mb-1">{getScoreLabel(key)}</p>
                    <p className={`text-xl font-bold ${getScoreColor(value)}`}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback Details */}
          {session.feedback && (
            <div className="px-6 py-5 border-b border-gray-200 space-y-4">
              {session.feedback.strengths.length > 0 && (
                <div>
                  <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Strengths
                  </h4>
                  <ul className="space-y-1">
                    {session.feedback.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {session.feedback.improvements.length > 0 && (
                <div>
                  <h4 className="font-semibold text-amber-700 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Areas to Improve
                  </h4>
                  <ul className="space-y-1">
                    {session.feedback.improvements.map((imp, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-amber-500 mt-1">•</span>
                        {imp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {session.feedback.tips && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-700 mb-1 flex items-center gap-2">
                    <span>💡</span> Pro Tip
                  </h4>
                  <p className="text-sm text-blue-700">{session.feedback.tips}</p>
                </div>
              )}
            </div>
          )}

          {/* Conversation Transcript */}
          <div className="px-6 py-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Conversation Transcript
            </h3>
            
            <div className="space-y-3 bg-gray-50 rounded-xl p-4">
              {session.messages.map((msg, i) => (
                <div 
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] p-3 rounded-xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-[#1B4D7A] text-white rounded-tr-sm'
                        : 'bg-white border border-gray-200 text-gray-700 rounded-tl-sm shadow-sm'
                    }`}
                  >
                    <p className="text-xs opacity-70 mb-1">
                      {msg.role === 'user' ? 'You (Rep)' : persona?.name || 'Physician'}
                    </p>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => onRetry(session.drugId, session.personaId)}
            className="flex-1 py-3 bg-[#E67E22] hover:bg-[#D35400] text-white font-semibold rounded-lg transition-colors"
          >
            Try Again with Same Setup
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
