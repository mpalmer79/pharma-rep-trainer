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
import ManagerDashboard from '@/components/ManagerDashboard';

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
import { useSessionHistory, useQuickPractice } from '@/hooks';

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
  tips: string | string[];
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
  
  // Manager Dashboard state
  const [showManagerDashboard, setShowManagerDashboard] = useState(false);
  
  // Coaching mode state
  const [coachingEnabled, setCoachingEnabled] = useState(true);
  
  // Session history hook
  const { 
    sessions, 
    isLoaded: historyLoaded, 
    saveSession, 
    deleteSession, 
    clearHistory, 
    getStats 
  } = useSessionHistory();

  // Quick practice hook
  const { getRandomSelection } = useQuickPractice({
    recentSessions: sessions,
    avoidRecentCount: 3,
  });

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

  // Updated startTraining to support custom timer and coaching mode
  const startTraining = useCallback((customTimer?: number | null, coaching?: boolean) => {
    if (!selectedDrug) return;
    const persona = selectedPersona ? personas.find(p => p.id === selectedPersona) : personas[0];
    if (!selectedPersona) setSelectedPersona(persona!.id);
    
    // Set coaching state (default to true if not specified)
    if (coaching !== undefined) {
      setCoachingEnabled(coaching);
    }
    
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

  // Quick practice start - sets drug/persona and starts immediately with coaching enabled
  const handleQuickPracticeStart = useCallback((drugId: string, personaId: string) => {
    const persona = personas.find(p => p.id === personaId);
    if (!persona) return;

    setSelectedDrug(drugId);
    setSelectedPersona(personaId);
    setCoachingEnabled(true); // Enable coaching by default for quick practice
    setTimeRemaining(persona.timerSeconds);
    setMessages([{ role: 'assistant', content: getOpeningLine(persona) }]);
    setSessionStartTime(new Date());
    setStage('training');
  }, []);

  const endTraining = useCallback(async () => {
    // Handle early session end with minimal interaction
    if (messages.length < 2) {
      setFeedback({ 
        score: 0, 
        overall: 0,
        scores: {
          opening: 0,
          clinicalKnowledge: 0,
          objectionHandling: 0,
          timeManagement: 0,
          compliance: 0,
          closing: 0,
        },
        strengths: [], 
        improvements: ['Session ended before meaningful interaction'], 
        tips: 'Try to engage more with the physician persona' 
      });
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
      
      // Ensure data has required fields (handle API errors gracefully)
      const validatedFeedback: FeedbackData = {
        score: data.overall || data.score || 50,
        overall: data.overall || data.score || 50,
        scores: data.scores || {
          opening: 50,
          clinicalKnowledge: 50,
          objectionHandling: 50,
          timeManagement: 50,
          compliance: 50,
          closing: 50,
        },
        strengths: data.strengths || ['Completed the session'],
        improvements: data.improvements || [],
        tips: data.tips || 'Keep practicing to improve your skills!',
      };
      
      setFeedback(validatedFeedback);
      
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
          scores: validatedFeedback.scores || {
            opening: validatedFeedback.score || 50,
            clinicalKnowledge: validatedFeedback.score || 50,
            objectionHandling: validatedFeedback.score || 50,
            timeManagement: validatedFeedback.score || 50,
            compliance: validatedFeedback.score || 50,
            closing: validatedFeedback.score || 50,
          },
          overall: validatedFeedback.overall || validatedFeedback.score || 50,
          strengths: validatedFeedback.strengths || [],
          improvements: validatedFeedback.improvements || [],
          tips: Array.isArray(validatedFeedback.tips) 
            ? validatedFeedback.tips.join(' ') 
            : (validatedFeedback.tips || ''),
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
    } catch (error) {
      console.error('Error getting feedback:', error);
      setFeedback({ 
        score: 50, 
        overall: 50,
        scores: {
          opening: 50,
          clinicalKnowledge: 50,
          objectionHandling: 50,
          timeManagement: 50,
          compliance: 50,
          closing: 50,
        },
        strengths: ['Completed the session'], 
        improvements: ['Unable to generate detailed feedback'], 
        tips: 'Try again for a more detailed analysis' 
      });
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
      // Handle both successful response and error response
      const assistantMessage = data.message || "I'm considering what you've said. Could you tell me more?";
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
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
        setCoachingEnabled(true); // Enable coaching on retry
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

  // Handle retry from feedback - maintains current coaching state
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
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navbar 
          historyLoaded={historyLoaded}
          sessionsCount={sessions.length}
          onProgressClick={() => setShowProgressDashboard(true)}
          onManagerDemoClick={() => setShowManagerDashboard(true)}
        />

        <HeroSection 
          onQuickPractice={getRandomSelection}
          onStartQuickPractice={handleQuickPracticeStart}
        />
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

        {/* Manager Dashboard Modal */}
        {showManagerDashboard && (
          <ManagerDashboard onClose={() => setShowManagerDashboard(false)} />
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
        coachingEnabled={coachingEnabled}
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
