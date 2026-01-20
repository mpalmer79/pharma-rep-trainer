'use client';

import { useState, useEffect, useCallback } from 'react';
import { TrainingSession, Feedback, Message, ScoreBreakdown } from '@/types';

const STORAGE_KEY = 'repiq_session_history';
const MAX_SESSIONS = 50; // Keep last 50 sessions

export interface SessionHistoryData {
  sessions: TrainingSession[];
  lastUpdated: string;
}

export interface ProgressStats {
  totalSessions: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  scoresByPersona: Record<string, { average: number; count: number; best: number }>;
  scoresByDrug: Record<string, { average: number; count: number; best: number }>;
  recentTrend: 'improving' | 'declining' | 'stable' | 'insufficient';
  skillBreakdown: {
    opening: number;
    clinicalKnowledge: number;
    objectionHandling: number;
    timeManagement: number;
    compliance: number;
    closing: number;
  };
  streakDays: number;
  lastSessionDate: string | null;
  sessionsThisWeek: number;
  personalBests: {
    personaId: string;
    drugId: string;
    score: number;
    date: string;
  }[];
}

// Generate unique ID
const generateId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Safe localStorage access
const getStoredData = (): SessionHistoryData | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    // Convert date strings back to Date objects
    parsed.sessions = parsed.sessions.map((s: TrainingSession) => ({
      ...s,
      startedAt: new Date(s.startedAt),
      completedAt: s.completedAt ? new Date(s.completedAt) : undefined,
    }));
    
    return parsed;
  } catch (error) {
    console.error('Error reading session history:', error);
    return null;
  }
};

const saveStoredData = (data: SessionHistoryData): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving session history:', error);
  }
};

export function useSessionHistory() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const data = getStoredData();
    if (data) {
      setSessions(data.sessions);
    }
    setIsLoaded(true);
  }, []);

  // Save a new session
  const saveSession = useCallback((
    drugId: string,
    personaId: string,
    messages: Message[],
    feedback: Feedback,
    startedAt: Date,
    duration: number
  ): TrainingSession => {
    const newSession: TrainingSession = {
      id: generateId(),
      drugId,
      personaId,
      messages,
      feedback,
      startedAt,
      completedAt: new Date(),
      duration,
    };

    setSessions(prev => {
      const updated = [newSession, ...prev].slice(0, MAX_SESSIONS);
      saveStoredData({
        sessions: updated,
        lastUpdated: new Date().toISOString(),
      });
      return updated;
    });

    return newSession;
  }, []);

  // Delete a session
  const deleteSession = useCallback((sessionId: string): void => {
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== sessionId);
      saveStoredData({
        sessions: updated,
        lastUpdated: new Date().toISOString(),
      });
      return updated;
    });
  }, []);

  // Clear all history
  const clearHistory = useCallback((): void => {
    setSessions([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Calculate progress stats
  const getStats = useCallback((): ProgressStats => {
    const completedSessions = sessions.filter(s => s.feedback?.overall !== undefined);
    
    if (completedSessions.length === 0) {
      return {
        totalSessions: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        scoresByPersona: {},
        scoresByDrug: {},
        recentTrend: 'insufficient',
        skillBreakdown: {
          opening: 0,
          clinicalKnowledge: 0,
          objectionHandling: 0,
          timeManagement: 0,
          compliance: 0,
          closing: 0,
        },
        streakDays: 0,
        lastSessionDate: null,
        sessionsThisWeek: 0,
        personalBests: [],
      };
    }

    const scores = completedSessions.map(s => s.feedback!.overall);
    const totalSessions = completedSessions.length;
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / totalSessions);
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);

    // Scores by persona
    const scoresByPersona: Record<string, { average: number; count: number; best: number }> = {};
    completedSessions.forEach(s => {
      if (!scoresByPersona[s.personaId]) {
        scoresByPersona[s.personaId] = { average: 0, count: 0, best: 0 };
      }
      const entry = scoresByPersona[s.personaId];
      entry.count++;
      entry.average = ((entry.average * (entry.count - 1)) + s.feedback!.overall) / entry.count;
      entry.best = Math.max(entry.best, s.feedback!.overall);
    });
    // Round averages
    Object.keys(scoresByPersona).forEach(k => {
      scoresByPersona[k].average = Math.round(scoresByPersona[k].average);
    });

    // Scores by drug
    const scoresByDrug: Record<string, { average: number; count: number; best: number }> = {};
    completedSessions.forEach(s => {
      if (!scoresByDrug[s.drugId]) {
        scoresByDrug[s.drugId] = { average: 0, count: 0, best: 0 };
      }
      const entry = scoresByDrug[s.drugId];
      entry.count++;
      entry.average = ((entry.average * (entry.count - 1)) + s.feedback!.overall) / entry.count;
      entry.best = Math.max(entry.best, s.feedback!.overall);
    });
    // Round averages
    Object.keys(scoresByDrug).forEach(k => {
      scoresByDrug[k].average = Math.round(scoresByDrug[k].average);
    });

    // Recent trend (compare last 5 to previous 5)
    let recentTrend: 'improving' | 'declining' | 'stable' | 'insufficient' = 'insufficient';
    if (completedSessions.length >= 5) {
      const recent5 = completedSessions.slice(0, 5).map(s => s.feedback!.overall);
      const recentAvg = recent5.reduce((a, b) => a + b, 0) / 5;
      
      if (completedSessions.length >= 10) {
        const prev5 = completedSessions.slice(5, 10).map(s => s.feedback!.overall);
        const prevAvg = prev5.reduce((a, b) => a + b, 0) / 5;
        
        if (recentAvg - prevAvg > 5) recentTrend = 'improving';
        else if (prevAvg - recentAvg > 5) recentTrend = 'declining';
        else recentTrend = 'stable';
      } else {
        recentTrend = 'stable';
      }
    }

    // Skill breakdown average
    const skillTotals: ScoreBreakdown = {
      opening: 0,
      clinicalKnowledge: 0,
      objectionHandling: 0,
      timeManagement: 0,
      compliance: 0,
      closing: 0,
    };
    
    completedSessions.forEach(s => {
      if (s.feedback?.scores) {
        Object.keys(skillTotals).forEach(key => {
          skillTotals[key as keyof ScoreBreakdown] += s.feedback!.scores[key as keyof ScoreBreakdown];
        });
      }
    });
    
    const skillBreakdown = {
      opening: Math.round(skillTotals.opening / totalSessions),
      clinicalKnowledge: Math.round(skillTotals.clinicalKnowledge / totalSessions),
      objectionHandling: Math.round(skillTotals.objectionHandling / totalSessions),
      timeManagement: Math.round(skillTotals.timeManagement / totalSessions),
      compliance: Math.round(skillTotals.compliance / totalSessions),
      closing: Math.round(skillTotals.closing / totalSessions),
    };

    // Streak calculation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streakDays = 0;
    const daySet = new Set<string>();
    
    completedSessions.forEach(s => {
      const date = new Date(s.completedAt || s.startedAt);
      const dateStr = date.toISOString().split('T')[0];
      daySet.add(dateStr);
    });
    
    const sortedDays = Array.from(daySet).sort().reverse();
    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = new Date(today.getTime() - 86400000).toISOString().split('T')[0];
    
    if (sortedDays[0] === todayStr || sortedDays[0] === yesterdayStr) {
      let checkDate = sortedDays[0] === todayStr ? today : new Date(today.getTime() - 86400000);
      
      for (let i = 0; i < 365; i++) {
        const checkStr = checkDate.toISOString().split('T')[0];
        if (daySet.has(checkStr)) {
          streakDays++;
          checkDate = new Date(checkDate.getTime() - 86400000);
        } else {
          break;
        }
      }
    }

    // Sessions this week
    const weekAgo = new Date(today.getTime() - 7 * 86400000);
    const sessionsThisWeek = completedSessions.filter(s => {
      const sessionDate = new Date(s.completedAt || s.startedAt);
      return sessionDate >= weekAgo;
    }).length;

    // Last session date
    const lastSessionDate = completedSessions.length > 0 
      ? (completedSessions[0].completedAt || completedSessions[0].startedAt).toISOString()
      : null;

    // Personal bests (top score for each persona+drug combo)
    const bestsByCombo: Record<string, { personaId: string; drugId: string; score: number; date: string }> = {};
    
    completedSessions.forEach(s => {
      const key = `${s.personaId}_${s.drugId}`;
      const score = s.feedback!.overall;
      const date = (s.completedAt || s.startedAt).toISOString();
      
      if (!bestsByCombo[key] || score > bestsByCombo[key].score) {
        bestsByCombo[key] = { personaId: s.personaId, drugId: s.drugId, score, date };
      }
    });
    
    const personalBests = Object.values(bestsByCombo)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return {
      totalSessions,
      averageScore,
      highestScore,
      lowestScore,
      scoresByPersona,
      scoresByDrug,
      recentTrend,
      skillBreakdown,
      streakDays,
      lastSessionDate,
      sessionsThisWeek,
      personalBests,
    };
  }, [sessions]);

  // Get session by ID
  const getSession = useCallback((sessionId: string): TrainingSession | undefined => {
    return sessions.find(s => s.id === sessionId);
  }, [sessions]);

  // Get recent sessions (for quick display)
  const getRecentSessions = useCallback((limit: number = 5): TrainingSession[] => {
    return sessions.slice(0, limit);
  }, [sessions]);

  return {
    sessions,
    isLoaded,
    saveSession,
    deleteSession,
    clearHistory,
    getStats,
    getSession,
    getRecentSessions,
  };
}

export default useSessionHistory;
