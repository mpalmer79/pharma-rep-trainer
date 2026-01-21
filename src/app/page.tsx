'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { drugs } from '@/data/drugs';
import { personas } from '@/data/personas';
import { TrainingSession, Feedback } from '@/types';

// Components
import MobileTrainingScreen from '@/components/MobileTrainingScreen';
import ProgressDashboard from '@/components/ProgressDashboard';
import SessionDetailModal from '@/components/SessionDetailModal';
import FeedbackStage from '@/components/FeedbackStage';

// Landing Page Components
import {
  Navbar,
  HeroSection,
  TrustStrip,
  PlatformSection,
  TrainingProgramsSection,
  StatsBanner,
  RolesSection,
  AboutSection,
  SimulatorSection,
  CTASection,
  Footer
} from '@/components/landing';

// Hooks
import { useSessionHistory } from '@/hooks/useSessionHistory';

type Stage = 'landing' | 'training' | 'feedback';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

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
  tips: string[];
}

export default function Home() {
  const [stage, setStage] = useState<Stage>('landing');
  const [selectedDrug, setSelectedDrug] = useState<string | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Session history state
  const [showProgressDashboard, setShowProgressDashboard] = useState(false);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  
  // Session history hook
  const { 
    sessions, 
    isLoaded: historyLoaded, 
    saveSession, 
    deleteSession, 
    clearHistory, 
    getStats 
  } = useSessionHistory();

  const currentPersona = personas.find(p => p.id === selectedPersona);
  const currentDrug = drugs.find(d => d.id === selectedDrug);

  const getOpeningLine = (persona: typeof personas[0]) => {
    const openings: Record<string, string> = {
      'rush': "I have about 90 seconds before my next patient. What do you have for me?",
      'skeptic': "Alright, I've got some time. What's the data look like for this medication?",
      'loyalist': "Hi there. I should tell you upfront, I've been happy with my current prescribing patterns, but I'm willing to listen.",
      'gatekeeper': "Good morning. The doctors are quite busy today. How can I help you?",
      'curious': "Oh good, I was hoping to learn about some new options. What can you tell me about this medication?"
    };
    return openings[persona.id] || "Hello, how can I help you today?";
  };

  // Timer effect - handles countdown and unlimited mode
  useEffect(() => {
    // Skip timer if not in training, time is up, or unlimited mode (-1)
    if (stage !== 'training' || timeRemaining === 0 || timeRemaining === -1) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) { 
          endTraining(); 
          return 0; 
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [stage, timeRemaining]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Updated startTraining to support custom timer
  const startTraining = useCallback((customTimer?: number | null) => {
    if (!selectedDrug) return;
    const persona = selectedPersona ? personas.find(p => p.id === selectedPersona) : personas[0];
    if (!selectedPersona) setSelectedPersona(persona!.id);
    
    // Handle timer: -1 = unlimited, positive number = custom, undefined/null = default
    if (customTimer === -1) {
      setTimeRemaining(-1); // Unlimited mode
    } else if (customTimer && customTimer > 0) {
      setTimeRemaining(customTimer);
    } else {
      setTimeRemaining(persona!.timerSeconds);
    }
    
    setMessages([{ role: 'assistant', content: getOpeningLine(persona!) }]);
    setSessionStartTime(new Date());
    setStage('training');
  }, [selectedDrug, selectedPersona]);

  const endTraining = useCallback(async () => {
    if (messages.length < 2) {
      setFeedback({ score: 0, strengths: [], improvements: ['Session ended before meaningful interaction'], tips: ['Try to engage more with the physician persona'] });
      setStage('feedback');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, drug: currentDrug, persona: currentPersona })
      });
      const data = await response.json();
      setFeedback(data);
      
      // Save session to history
      if (selectedDrug && selectedPersona && sessionStartTime) {
        const startTime = sessionStartTime;
        const persona = personas.find(p => p.id === selectedPersona);
        // Calculate duration - handle unlimited mode
        const duration = timeRemaining === -1 
          ? Math.floor((Date.now() - sessionStartTime.getTime()) / 1000)
          : persona ? persona.timerSeconds - timeRemaining : 0;
        
        // Convert feedback to proper format for saving
        const feedbackToSave: Feedback = {
          scores: data.scores || {
            opening: data.score || 50,
            clinicalKnowledge: data.score || 50,
            objectionHandling: data.score || 50,
            timeManagement: data.score || 50,
            compliance: data.score || 50,
            closing: data.score || 50,
          },
          overall: data.overall || data.score || 50,
          strengths: data.strengths || [],
          improvements: data.improvements || [],
          tips: data.tips || '',
        };
        
        saveSession(
          selectedDrug,
          selectedPersona,
          messages,
          feedbackToSave,
          startTime,
          duration
        );
      }
    } catch {
      setFeedback({ score: 50, strengths: ['Completed the session'], improvements: ['Unable to generate detailed feedback'], tips: ['Try again for a more detailed analysis'] });
    }
    setIsLoading(false);
    setStage('feedback');
  }, [messages, currentDrug, currentPersona, selectedDrug, selectedPersona, sessionStartTime, timeRemaining, saveSession]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: userMessage }], drug: currentDrug, persona: currentPersona })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble responding. Let's continue our discussion." }]);
    }
    setIsLoading(false);
  }, [input, isLoading, messages, currentDrug, currentPersona]);

  const resetTraining = () => {
    setStage('landing');
    setMessages([]);
    setFeedback(null);
    setSelectedDrug(null);
    setSelectedPersona(null);
    setSessionStartTime(null);
  };

  // Handle viewing a session from history
  const handleViewSession = (session: TrainingSession) => {
    setSelectedSession(session);
  };

  // Handle retrying a session with same setup
  const handleRetrySession = (drugId: string, personaId: string) => {
    setSelectedSession(null);
    setShowProgressDashboard(false);
    setSelectedDrug(drugId);
    setSelectedPersona(personaId);
    // Small delay to ensure state is set before starting
    setTimeout(() => {
      const persona = personas.find(p => p.id === personaId);
      if (persona) {
        setTimeRemaining(persona.timerSeconds);
        setMessages([{ role: 'assistant', content: getOpeningLine(persona) }]);
        setSessionStartTime(new Date());
        setStage('training');
      }
    }, 100);
  };

  // Scroll to simulator section
  const scrollToSimulator = () => {
    setShowProgressDashboard(false);
    const simulator = document.getElementById('simulator');
    if (simulator) {
      simulator.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Updated formatTime to handle unlimited mode
  const formatTime = (seconds: number) => {
    if (seconds === -1) return '∞';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle retry from feedback
  const handleRetryFromFeedback = () => {
    setMessages([]);
    setFeedback(null);
    setSessionStartTime(new Date());
    setTimeRemaining(currentPersona?.timerSeconds || 180);
    setMessages([{ role: 'assistant', content: currentPersona ? getOpeningLine(currentPersona) : '' }]);
    setStage('training');
  };

  // ==================== LANDING PAGE ====================
  if (stage === 'landing') {
    return (
      <div className="min-h-screen bg-white">
        <Navbar 
          historyLoaded={historyLoaded}
          sessionsCount={sessions.length}
          onProgressClick={() => setShowProgressDashboard(true)}
        />

        <HeroSection />
        <TrustStrip />
        <PlatformSection />
        <TrainingProgramsSection />
        <StatsBanner />
        <RolesSection />
        <AboutSection />
        
        <SimulatorSection
          selectedDrug={selectedDrug}
          selectedPersona={selectedPersona}
          onDrugSelect={setSelectedDrug}
          onPersonaSelect={setSelectedPersona}
          onStartTraining={startTraining}
        />
        
        <CTASection />
        <Footer />

        {/* Progress Dashboard Modal */}
        {showProgressDashboard && (
          <ProgressDashboard
            stats={getStats()}
            sessions={sessions}
            onClose={() => setShowProgressDashboard(false)}
            onViewSession={handleViewSession}
            onDeleteSession={deleteSession}
            onClearHistory={clearHistory}
            onStartTraining={scrollToSimulator}
          />
        )}

        {/* Session Detail Modal */}
        {selectedSession && (
          <SessionDetailModal
            session={selectedSession}
            onClose={() => setSelectedSession(null)}
            onRetry={handleRetrySession}
          />
        )}
      </div>
    );
  }

  // ==================== TRAINING STAGE ====================
  if (stage === 'training' && currentPersona && currentDrug) {
    return (
      <MobileTrainingScreen
        currentPersona={currentPersona}
        currentDrug={currentDrug}
        messages={messages}
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        timeRemaining={timeRemaining}
        onSendMessage={sendMessage}
        onEndTraining={endTraining}
        formatTime={formatTime}
      />
    );
  }

  // ==================== FEEDBACK STAGE ====================
  if (stage === 'feedback' && feedback) {
    return (
      <FeedbackStage
        feedback={feedback}
        currentPersona={currentPersona}
        showProgressDashboard={showProgressDashboard}
        setShowProgressDashboard={setShowProgressDashboard}
        selectedSession={selectedSession}
        setSelectedSession={setSelectedSession}
        sessions={sessions}
        getStats={getStats}
        deleteSession={deleteSession}
        clearHistory={clearHistory}
        onReset={resetTraining}
        onRetry={handleRetryFromFeedback}
        onViewSession={handleViewSession}
        onRetrySession={handleRetrySession}
      />
    );
  }

  return null;
}
