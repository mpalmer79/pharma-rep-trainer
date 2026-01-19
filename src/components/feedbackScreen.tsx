'use client';

import React from 'react';
import { Feedback } from '@/types';
import { Trophy, TrendingUp, Lightbulb, RotateCcw, PlusCircle } from 'lucide-react';

interface FeedbackScreenProps {
  feedback: Feedback;
  onRetry: () => void;
  onNewScenario: () => void;
}

export default function FeedbackScreen({ feedback, onRetry, onNewScenario }: FeedbackScreenProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/20 border-emerald-500/30';
    if (score >= 60) return 'bg-amber-500/20 border-amber-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const getOverallGrade = (score: number) => {
    if (score >= 90) return { grade: 'A', label: 'Excellent' };
    if (score >= 80) return { grade: 'B', label: 'Strong' };
    if (score >= 70) return { grade: 'C', label: 'Competent' };
    if (score >= 60) return { grade: 'D', label: 'Developing' };
    return { grade: 'F', label: 'Needs Work' };
  };

  const scoreLabels: Record<string, string> = {
    opening: 'Opening',
    clinicalKnowledge: 'Clinical Knowledge',
    objectionHandling: 'Objection Handling',
    timeManagement: 'Time Management',
    compliance: 'Compliance',
    closing: 'Closing',
  };

  const { grade, label } = getOverallGrade(feedback.overall);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Overall Score */}
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-8 text-center">
        <h2 className="text-xl font-medium text-slate-300 mb-4 flex items-center justify-center gap-2">
          <Trophy className="w-6 h-6 text-amber-400" />
          Overall Performance
        </h2>
        <div className="flex items-center justify-center gap-6">
          <div className={`text-7xl font-bold ${getScoreColor(feedback.overall)}`}>
            {feedback.overall}
          </div>
          <div className="text-left">
            <div className={`text-4xl font-bold ${getScoreColor(feedback.overall)}`}>{grade}</div>
            <div className="text-slate-400">{label}</div>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          Score Breakdown
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(feedback.scores).map(([key, value]) => (
            <div key={key} className={`p-4 rounded-xl border ${getScoreBg(value)}`}>
              <div className={`text-2xl font-bold ${getScoreColor(value)}`}>{value}</div>
              <div className="text-sm text-slate-400">{scoreLabels[key] || key}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths */}
      {feedback.strengths.length > 0 && (
        <div className="bg-emerald-500/10 rounded-2xl border border-emerald-500/20 p-6">
          <h3 className="font-semibold text-lg mb-3 text-emerald-400">💪 Strengths</h3>
          <ul className="space-y-2">
            {feedback.strengths.map((s, i) => (
              <li key={i} className="text-slate-300 flex gap-2">
                <span className="text-emerald-400 flex-shrink-0">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Areas for Improvement */}
      {feedback.improvements.length > 0 && (
        <div className="bg-amber-500/10 rounded-2xl border border-amber-500/20 p-6">
          <h3 className="font-semibold text-lg mb-3 text-amber-400">📈 Areas for Improvement</h3>
          <ul className="space-y-2">
            {feedback.improvements.map((s, i) => (
              <li key={i} className="text-slate-300 flex gap-2">
                <span className="text-amber-400 flex-shrink-0">→</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pro Tip */}
      {feedback.tips && (
        <div className="bg-blue-500/10 rounded-2xl border border-blue-500/20 p-6">
          <h3 className="font-semibold text-lg mb-2 text-blue-400 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Pro Tip
          </h3>
          <p className="text-slate-300">{feedback.tips}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={onRetry}
          className="flex-1 py-4 rounded-xl bg-slate-700 hover:bg-slate-600 font-medium transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          Try Again
        </button>
        <button
          onClick={onNewScenario}
          className="flex-1 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          New Scenario
        </button>
      </div>
    </div>
  );
}
