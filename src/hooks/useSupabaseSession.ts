import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface SessionData {
  id: string;
  user_id: string;
  drug_name: string;
  persona_name: string;
  score: number;
  duration_seconds: number;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  feedback?: {
    strengths: string[];
    improvements: string[];
    tips: string[];
  };
  created_at: string;
}

export function useSupabaseSession() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load sessions from Supabase
  const loadSessions = useCallback(async () => {
    if (!user || !isSupabaseConfigured) {
      setSessions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('training_sessions_simple')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setSessions((data as SessionData[]) || []);
    } catch (err) {
      console.error('Error loading sessions:', err);
      setError('Failed to load sessions');
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Save session to Supabase
  const saveSession = useCallback(
    async (session: {
      drug: string;
      persona: string;
      score: number;
      duration: number;
      messages: Array<{ role: 'user' | 'assistant'; content: string }>;
      feedback?: { strengths: string[]; improvements: string[]; tips: string[] };
    }) => {
      if (!user) {
        throw new Error('User must be logged in to save sessions');
      }

      if (!isSupabaseConfigured) {
        throw new Error('Supabase not configured');
      }

      const { data, error: insertError } = await supabase
        .from('training_sessions_simple')
        .insert({
          user_id: user.id,
          drug_name: session.drug,
          persona_name: session.persona,
          score: session.score,
          duration_seconds: session.duration,
          messages: session.messages,
          feedback: session.feedback,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setSessions((prev) => [data as SessionData, ...prev]);
      return data;
    },
    [user]
  );

  // Delete session from Supabase
  const deleteSession = useCallback(
    async (sessionId: string) => {
      if (!user || !isSupabaseConfigured) return;

      const { error: deleteError } = await supabase
        .from('training_sessions_simple')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    },
    [user]
  );

  // Get stats
  const getStats = useCallback(() => {
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
    const totalTime = sessions.reduce((acc, s) => acc + s.duration_seconds, 0);

    return {
      totalSessions: sessions.length,
      avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      totalTime,
      bestScore: Math.max(...scores),
      worstScore: Math.min(...scores),
    };
  }, [sessions]);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return {
    sessions,
    isLoading,
    error,
    saveSession,
    deleteSession,
    getStats,
    refreshSessions: loadSessions,
  };
}
