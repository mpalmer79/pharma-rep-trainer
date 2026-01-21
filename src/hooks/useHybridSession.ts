import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface SessionRecord {
  id: string;
  drug: string;
  persona: string;
  score: number;
  duration: number;
  completedAt: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  feedback?: {
    strengths: string[];
    improvements: string[];
    tips: string[];
  };
}

export interface ProgressStats {
  totalSessions: number;
  avgScore: number;
  totalTime: number;
  bestScore: number;
  worstScore: number;
}

export function useHybridSession() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getStorageKey = useCallback(() => {
    return user ? `pharma_sessions_${user.id}` : 'pharma_sessions_guest';
  }, [user]);

  // Load sessions from localStorage
  const loadSessions = useCallback(() => {
    setIsLoading(true);
    try {
      const saved = localStorage.getItem(getStorageKey());
      if (saved) {
        setSessions(JSON.parse(saved));
      } else {
        setSessions([]);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, [getStorageKey]);

  // Save session
  const saveSession = useCallback(
    async (session: Omit<SessionRecord, 'id' | 'completedAt'>) => {
      const newSession: SessionRecord = {
        ...session,
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        completedAt: new Date().toISOString(),
      };

      setSessions((prev) => {
        const updated = [newSession, ...prev];
        localStorage.setItem(getStorageKey(), JSON.stringify(updated));
        return updated;
      });

      return newSession;
    },
    [getStorageKey]
  );

  // Delete session
  const deleteSession = useCallback(
    (sessionId: string) => {
      setSessions((prev) => {
        const updated = prev.filter((s) => s.id !== sessionId);
        localStorage.setItem(getStorageKey(), JSON.stringify(updated));
        return updated;
      });
    },
    [getStorageKey]
  );

  // Clear all sessions
  const clearSessions = useCallback(() => {
    localStorage.removeItem(getStorageKey());
    setSessions([]);
  }, [getStorageKey]);

  // Get session by ID
  const getSession = useCallback(
    (sessionId: string) => {
      return sessions.find((s) => s.id === sessionId);
    },
    [sessions]
  );

  // Get stats
  const getStats = useCallback((): ProgressStats => {
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        avgScore: 0,
        totalTime: 0,
        bestScore: 0,
        worstScore: 0,
      };
    }

    const scores = sessions.map((s) => s.score);
    const totalTime = sessions.reduce((acc, s) => acc + s.duration, 0);

    return {
      totalSessions: sessions.length,
      avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      totalTime,
      bestScore: Math.max(...scores),
      worstScore: Math.min(...scores),
    };
  }, [sessions]);

  // Load sessions on mount and when user changes
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Migrate guest sessions to user account on login
  useEffect(() => {
    if (user) {
      const guestSessions = localStorage.getItem('pharma_sessions_guest');
      if (guestSessions) {
        const guest = JSON.parse(guestSessions);
        const userKey = `pharma_sessions_${user.id}`;
        const existing = localStorage.getItem(userKey);
        const userSessions = existing ? JSON.parse(existing) : [];

        // Merge guest sessions (avoiding duplicates)
        const guestIds = new Set(guest.map((s: SessionRecord) => s.id));
        const merged = [
          ...guest,
          ...userSessions.filter((s: SessionRecord) => !guestIds.has(s.id)),
        ];

        localStorage.setItem(userKey, JSON.stringify(merged));
        localStorage.removeItem('pharma_sessions_guest');
        loadSessions();
      }
    }
  }, [user, loadSessions]);

  return {
    sessions,
    isLoading,
    saveSession,
    deleteSession,
    clearSessions,
    getSession,
    getStats,
    refreshSessions: loadSessions,
  };
}
