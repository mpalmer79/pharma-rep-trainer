export interface Drug {
  id: string;
  name: string;
  category: string;
  indication: string;
  keyData: string;
  competitorName?: string;
  mechanismOfAction?: string;
}

export interface Persona {
  id: string;
  name: string;
  title: string;
  description: string;
  avatar: string;
  timerSeconds: number;
  systemPrompt: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface ScoreBreakdown {
  opening: number;
  clinicalKnowledge: number;
  objectionHandling: number;
  timeManagement: number;
  compliance: number;
  closing: number;
}

export interface Feedback {
  scores: ScoreBreakdown;
  overall: number;
  strengths: string[];
  improvements: string[];
  tips: string;
  conversationHighlights?: {
    good: string[];
    needsWork: string[];
  };
}

export interface TrainingSession {
  id: string;
  drugId: string;
  personaId: string;
  messages: Message[];
  feedback: Feedback | null;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
}

export interface UserStats {
  totalSessions: number;
  averageScore: number;
  scoresByPersona: Record<string, number>;
  scoresByDrug: Record<string, number>;
  recentSessions: TrainingSession[];
}

export type Stage = 'setup' | 'training' | 'feedback';
