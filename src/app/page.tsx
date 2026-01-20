'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { drugs } from '@/data/drugs';
import { personas } from '@/data/personas';
import { TrainingSession, Feedback } from '@/types';
import MobileTrainingScreen from '@/components/MobileTrainingScreen';
import ProgressDashboard from '@/components/ProgressDashboard';
import SessionDetailModal from '@/components/SessionDetailModal';
import { useSessionHistory } from '@/hooks/useSessionHistory';

type Stage = 'landing' | 'training' | 'feedback';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface FeedbackData {
  score: number;
  strengths: string[];
  improvements: string[];
  tips: string[];
}

// Scroll animation hook
const useScrollAnimation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
};

// Animated section component
const AnimatedSection = ({ 
  children, 
  className = '',
  delay = 0 
}: { 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
}) => {
  const { ref, isVisible } = useScrollAnimation();
  
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
};

export default function Home() {
  const [stage, setStage] = useState<Stage>('landing');
  const [selectedDrug, setSelectedDrug] = useState<string | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const handleNavClick = () => setMobileMenuOpen(false);

  useEffect(() => {
    if (stage !== 'training' || timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) { endTraining(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [stage, timeRemaining]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [mobileMenuOpen]);

  const startTraining = useCallback(() => {
    if (!selectedDrug) return;
    const persona = selectedPersona ? personas.find(p => p.id === selectedPersona) : personas[0];
    if (!selectedPersona) setSelectedPersona(persona!.id);
    setTimeRemaining(persona!.timerSeconds);
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
        const duration = persona ? persona.timerSeconds - timeRemaining : 0;
        
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ==================== LANDING PAGE ====================
  if (stage === 'landing') {
    return (
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 lg:h-20">
              {/* Logo + LinkedIn Badge */}
              <div className="flex items-center gap-3 sm:gap-5">
                <a href="#" className="flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-gradient-to-br from-[#1B4D7A] to-[#2D6A9F] flex items-center justify-center">
                    <span className="text-white font-bold text-sm sm:text-lg">R</span>
                  </div>
                  <span className="text-lg sm:text-xl font-bold text-[#1B4D7A]">RepIQ</span>
                </a>
                {/* LinkedIn Badge - Prominent Oval */}
                <a 
                  href="https://www.linkedin.com/in/michael-palmer-qa/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#0A66C2] hover:bg-[#004182] text-white text-sm font-semibold rounded-full transition-all hover:shadow-lg"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  Visit me on LinkedIn
                </a>
              </div>

              {/* Desktop Nav */}
              <div className="hidden lg:flex items-center gap-8">
                <a href="#platform" className="text-gray-700 hover:text-[#E67E22] font-medium transition-colors">Platform</a>
                <a href="#training" className="text-gray-700 hover:text-[#E67E22] font-medium transition-colors">Training</a>
                <a href="#roles" className="text-gray-700 hover:text-[#E67E22] font-medium transition-colors">Solutions</a>
                <a href="#about" className="text-gray-700 hover:text-[#E67E22] font-medium transition-colors">About</a>
              </div>

              {/* Right Side - GitHub Badge + CTAs */}
              <div className="flex items-center gap-3">
                {/* GitHub Badge - Prominent Oval */}
                <a 
                  href="https://github.com/mpalmer79/pharma-rep-trainer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#24292F] hover:bg-[#1a1e22] text-white text-sm font-semibold rounded-full transition-all hover:shadow-lg"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  View this project on GitHub
                </a>
                {/* Progress Button */}
                <button 
                  onClick={() => setShowProgressDashboard(true)}
                  className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B4D7A] hover:bg-[#0F2D44] text-white font-semibold rounded transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Progress
                  {historyLoaded && sessions.length > 0 && (
                    <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">
                      {sessions.length}
                    </span>
                  )}
                </button>
                <a 
                  href="#simulator"
                  className="hidden sm:inline-flex px-5 py-2.5 bg-[#E67E22] hover:bg-[#D35400] text-white font-semibold rounded transition-colors text-sm"
                >
                  Get Started
                </a>
                <a 
                  href="#simulator"
                  className="hidden sm:inline-flex px-5 py-2.5 border-2 border-[#1B4D7A] text-[#1B4D7A] hover:bg-[#1B4D7A] hover:text-white font-semibold rounded transition-colors text-sm"
                >
                  RepIQ Login
                </a>
                
                {/* Mobile Menu Button */}
                <button 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 text-gray-600"
                  aria-label="Menu"
                >
                  {mobileMenuOpen ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-white border-t shadow-lg">
              <div className="px-4 py-6 space-y-4">
                <a href="#platform" onClick={handleNavClick} className="block py-2 text-gray-700 hover:text-[#E67E22] font-medium">Platform</a>
                <a href="#training" onClick={handleNavClick} className="block py-2 text-gray-700 hover:text-[#E67E22] font-medium">Training</a>
                <a href="#roles" onClick={handleNavClick} className="block py-2 text-gray-700 hover:text-[#E67E22] font-medium">Solutions</a>
                <a href="#about" onClick={handleNavClick} className="block py-2 text-gray-700 hover:text-[#E67E22] font-medium">About</a>
                <hr />
                {/* Portfolio Links - Prominent in Mobile Menu */}
                <a 
                  href="https://www.linkedin.com/in/michael-palmer-qa/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center gap-2 py-3 bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  Visit me on LinkedIn
                </a>
                <a 
                  href="https://github.com/mpalmer79/pharma-rep-trainer" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center gap-2 py-3 bg-[#24292F] hover:bg-[#1a1e22] text-white font-semibold rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  View this project on GitHub
                </a>
                <hr />
                <a href="#simulator" onClick={handleNavClick} className="block w-full py-3 bg-[#E67E22] text-white font-semibold rounded text-center">Get Started</a>
                <button 
                  onClick={() => { handleNavClick(); setShowProgressDashboard(true); }}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-[#1B4D7A] text-white font-semibold rounded"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  My Progress
                  {historyLoaded && sessions.length > 0 && (
                    <span className="bg-white/20 px-2 py-0.5 rounded text-sm">
                      {sessions.length} sessions
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Hero Section - Full Width Image */}
        <section className="relative min-h-[90vh] flex items-center pt-16 lg:pt-20">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920&q=80"
              alt="Pharmaceutical sales professional"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1B4D7A]/95 via-[#1B4D7A]/80 to-transparent"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Master Every{' '}
                <span className="relative inline-block">
                  Physician Conversation
                  <span className="absolute bottom-0 left-0 w-full h-1.5 bg-[#E67E22]"></span>
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-200 mb-8 leading-relaxed">
                AI-powered roleplay simulations built for New England's pharmaceutical sales teams. 
                Practice with realistic physician personas before your next sales call.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="#simulator"
                  className="px-8 py-4 bg-[#E67E22] hover:bg-[#D35400] text-white font-semibold rounded text-center transition-colors text-lg"
                >
                  START FREE TRAINING
                </a>
                <a 
                  href="#platform"
                  className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-[#1B4D7A] font-semibold rounded text-center transition-colors text-lg"
                >
                  LEARN MORE
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Strip */}
        <section className="py-8 bg-gray-50 border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500 uppercase tracking-wider mb-6">
              Trusted by pharmaceutical teams across New England
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 lg:gap-16 opacity-60">
              <span className="text-xl sm:text-2xl font-bold text-gray-400 tracking-tight">Mass General</span>
              <span className="text-xl sm:text-2xl font-bold text-gray-400 tracking-tight">Boston Medical</span>
              <span className="text-xl sm:text-2xl font-bold text-gray-400 tracking-tight">Harvard Health</span>
              <span className="text-xl sm:text-2xl font-bold text-gray-400 tracking-tight hidden sm:block">Brigham & Women's</span>
            </div>
          </div>
        </section>

        {/* Platform Section */}
        <section id="platform" className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <AnimatedSection>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1B4D7A] leading-tight mb-6">
                  <span className="relative inline-block">
                    Revolutionizing
                    <span className="absolute bottom-0 left-0 w-full h-1 bg-[#E67E22]"></span>
                  </span>{' '}
                  Pharmaceutical Sales Training
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Pharmaceutical sales teams face a growing challenge: physicians have less time, 
                  expectations are higher, and traditional training fades within weeks. Reps work hard, 
                  but execution still falls short.
                </p>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  <strong className="text-[#1B4D7A]">RepIQ changes that.</strong> Our AI-powered platform 
                  delivers realistic physician simulations that help your team practice challenging 
                  conversations before they happen in the field.
                </p>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#E67E22] rounded-full mt-2.5 flex-shrink-0"></div>
                    <p className="text-gray-700">Boost training retention by up to 170%</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#E67E22] rounded-full mt-2.5 flex-shrink-0"></div>
                    <p className="text-gray-700">Improve coaching effectiveness by 55%</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#E67E22] rounded-full mt-2.5 flex-shrink-0"></div>
                    <p className="text-gray-700">Practice anytime, anywhere, 24/7</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#E67E22] rounded-full mt-2.5 flex-shrink-0"></div>
                    <p className="text-gray-700">Real-time AI feedback and scoring</p>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={200}>
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&q=80"
                    alt="Sales professional in training session"
                    className="rounded-lg shadow-2xl w-full"
                  />
                  {/* Floating stat */}
                  <div className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-xl p-6 border-l-4 border-[#E67E22]">
                    <p className="text-4xl font-bold text-[#1B4D7A]">170%</p>
                    <p className="text-gray-600">Retention Boost</p>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Training Programs Section - Inspired by Janek */}
        <section id="training" className="py-20 lg:py-28 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1B4D7A] mb-4">
                <span className="relative inline-block">
                  AI-Powered Training
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-[#E67E22]"></span>
                </span>{' '}
                Programs
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our comprehensive training simulations cover the full spectrum of pharmaceutical sales challenges, 
                from initial introductions to complex clinical discussions.
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: 'Clinical Data Presentation',
                  description: 'Master the art of presenting Phase III trial data, survival rates, and comparative effectiveness studies to evidence-minded physicians.',
                  image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80'
                },
                {
                  title: 'Objection Handling',
                  description: 'Practice responding to common physician objections about formulary status, side effect profiles, and cost considerations.',
                  image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&q=80'
                },
                {
                  title: 'Time-Constrained Conversations',
                  description: 'Learn to deliver your key messages effectively in 90-second hallway conversations with busy practitioners.',
                  image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80'
                },
                {
                  title: 'Gatekeeper Navigation',
                  description: 'Develop strategies for building rapport with office staff and securing meaningful time with prescribers.',
                  image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80'
                },
                {
                  title: 'Academic Detailing',
                  description: 'Prepare for conversations with KOLs and academic physicians who demand rigorous scientific discussion.',
                  image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&q=80'
                },
                {
                  title: 'Competitive Positioning',
                  description: 'Practice differentiating your products against established competitors with specific clinical advantages.',
                  image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80'
                }
              ].map((program, i) => (
                <AnimatedSection key={program.title} delay={i * 100}>
                  <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow group">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={program.image}
                        alt={program.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1B4D7A]/60 to-transparent"></div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-[#1B4D7A] mb-3">{program.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{program.description}</p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Banner */}
        <section className="py-16 bg-[#1B4D7A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {[
                { number: '170%', label: 'Training Retention Boost' },
                { number: '55%', label: 'Coaching Effectiveness' },
                { number: '847', label: 'Reps Trained in 2025' },
                { number: '98%', label: 'User Satisfaction' }
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-4xl sm:text-5xl font-bold text-white mb-2">{stat.number}</p>
                  <p className="text-blue-200 text-sm sm:text-base">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Role-Based Solutions - Like Janek */}
        <section id="roles" className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1B4D7A] mb-4">
                Built for{' '}
                <span className="relative inline-block">
                  Every Role
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-[#E67E22]"></span>
                </span>
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Pharmaceutical sales success requires coordination across your entire team. 
                RepIQ delivers tailored tools for every role.
              </p>
            </AnimatedSection>

            {/* Sales Reps */}
            <AnimatedSection className="mb-20">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <p className="text-[#E67E22] font-semibold uppercase tracking-wider mb-2">For Pharmaceutical Reps</p>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#1B4D7A] mb-6">
                    Practice Until Perfect, Then Practice Some More
                  </h3>
                  <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                    New hires can dive into realistic simulations from day one. Practice clinical presentations, 
                    handle objections, and build confidence before your next call on a Boston cardiologist 
                    or Cambridge oncologist.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#E67E22] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700">24/7 access to AI physician simulations</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#E67E22] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Instant feedback on clinical accuracy and messaging</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#E67E22] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Track progress and identify knowledge gaps</span>
                    </li>
                  </ul>
                </div>
                <div className="order-1 lg:order-2">
                  <img 
                    src="https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=800&q=80"
                    alt="Sales professional preparing for meeting"
                    className="rounded-lg shadow-xl w-full"
                  />
                </div>
              </div>
            </AnimatedSection>

            {/* Sales Managers */}
            <AnimatedSection className="mb-20">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <img 
                    src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80"
                    alt="Manager coaching team member"
                    className="rounded-lg shadow-xl w-full"
                  />
                </div>
                <div>
                  <p className="text-[#E67E22] font-semibold uppercase tracking-wider mb-2">For Sales Managers</p>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#1B4D7A] mb-6">
                    Coach Smarter, Not Harder
                  </h3>
                  <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                    Stop spending hours reviewing call recordings. RepIQ automatically identifies 
                    coaching moments and skill gaps across your team, so you can focus your time 
                    where it matters most.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#E67E22] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700">AI-powered performance dashboards</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#E67E22] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Automated identification of coaching opportunities</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#E67E22] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Improve coaching effectiveness by 55%</span>
                    </li>
                  </ul>
                </div>
              </div>
            </AnimatedSection>

            {/* Enablement Leaders */}
            <AnimatedSection>
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <p className="text-[#E67E22] font-semibold uppercase tracking-wider mb-2">For Enablement Leaders</p>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#1B4D7A] mb-6">
                    Measure What Matters
                  </h3>
                  <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                    Transform fragmented training initiatives into an orchestrated system that delivers 
                    measurable ROI. Track skill development across your organization and connect 
                    enablement efforts to revenue outcomes.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#E67E22] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Comprehensive analytics and reporting</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#E67E22] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Build learning paths in minutes</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#E67E22] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Turn training into measurable ROI</span>
                    </li>
                  </ul>
                </div>
                <div className="order-1 lg:order-2">
                  <img 
                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80"
                    alt="Team analyzing performance data"
                    className="rounded-lg shadow-xl w-full"
                  />
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* New England Focus Section */}
        <section id="about" className="py-20 lg:py-28 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <AnimatedSection>
                <img 
                  src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80"
                  alt="Boston skyline"
                  className="rounded-lg shadow-xl w-full"
                />
              </AnimatedSection>
              
              <AnimatedSection delay={200}>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1B4D7A] mb-6">
                  Built for{' '}
                  <span className="relative inline-block">
                    New England
                    <span className="absolute bottom-0 left-0 w-full h-1 bg-[#E67E22]"></span>
                  </span>
                </h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  The Boston-Cambridge medical corridor is one of the world's most demanding pharmaceutical 
                  markets. Our AI personas are specifically trained on physician behaviors in academic 
                  medical centers, community practices, and hospital systems across Massachusetts, 
                  New Hampshire, and beyond.
                </p>
                <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-[#E67E22]">
                  <blockquote className="text-gray-700 text-lg italic mb-4">
                    "RepIQ transformed how we prepare reps for the Boston market. The AI simulations 
                    are remarkably realistic—our team actually gets nervous before practice sessions, 
                    just like they would before a real call."
                  </blockquote>
                  <div className="flex items-center gap-4">
                    <img 
                      src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face"
                      alt="James Mitchell"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-[#1B4D7A]">James Mitchell</p>
                      <p className="text-gray-500 text-sm">Regional Sales Director, BioPharma Inc.</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Simulator Section */}
        <section id="simulator" className="py-20 lg:py-28">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1B4D7A] mb-4">
                <span className="relative inline-block">
                  Try RepIQ
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-[#E67E22]"></span>
                </span>{' '}
                Now
              </h2>
              <p className="text-lg text-gray-600">
                Select a product and physician persona to start your training simulation
              </p>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 sm:p-8">
                {/* Product Selection */}
                <div className="mb-10">
                  <h4 className="text-lg font-bold text-[#1B4D7A] mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-[#E67E22] text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    Select Your Product
                  </h4>
                  <div className="grid gap-3">
                    {drugs.map(drug => (
                      <button
                        key={drug.id}
                        onClick={() => setSelectedDrug(drug.id)}
                        className={`p-4 sm:p-5 rounded-lg border-2 text-left transition-all ${
                          selectedDrug === drug.id 
                            ? 'bg-blue-50 border-[#1B4D7A]' 
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <h5 className="font-semibold text-[#1B4D7A]">{drug.name}</h5>
                            <p className="text-sm text-gray-500">{drug.category} • {drug.indication}</p>
                            <p className="text-sm text-gray-500 mt-1">{drug.keyData}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            selectedDrug === drug.id ? 'border-[#1B4D7A] bg-[#1B4D7A]' : 'border-gray-300'
                          }`}>
                            {selectedDrug === drug.id && <span className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Persona Selection */}
                <div className="mb-10">
                  <h4 className="text-lg font-bold text-[#1B4D7A] mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-[#E67E22] text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    Select Your Physician
                  </h4>
                  <div className="grid gap-3">
                    {personas.map(persona => (
                      <button
                        key={persona.id}
                        onClick={() => setSelectedPersona(persona.id)}
                        className={`p-4 sm:p-5 rounded-lg border-2 text-left transition-all ${
                          selectedPersona === persona.id 
                            ? 'bg-blue-50 border-[#1B4D7A]' 
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex gap-4 items-start">
                          <img 
                            src={`https://images.unsplash.com/photo-${
                              persona.id === 'rush' ? '1559839734-2b71ea197ec2' : 
                              persona.id === 'skeptic' ? '1612349317150-e413f6a5b16d' : 
                              persona.id === 'loyalist' ? '1594824476967-48c8b964273f' : 
                              persona.id === 'gatekeeper' ? '1573496359142-b8d87734a5a2' : 
                              '1537368910025-700350fe46c7'
                            }?w=100&h=100&fit=crop&crop=face`}
                            alt={persona.name}
                            className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-semibold text-[#1B4D7A]">{persona.name}</h5>
                                <p className="text-sm text-[#E67E22] font-medium">{persona.title}</p>
                              </div>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                selectedPersona === persona.id ? 'border-[#1B4D7A] bg-[#1B4D7A]' : 'border-gray-300'
                              }`}>
                                {selectedPersona === persona.id && <span className="w-2 h-2 rounded-full bg-white" />}
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{persona.description}</p>
                            <p className="text-xs text-gray-400 mt-2">
                              {Math.floor(persona.timerSeconds / 60)}:{(persona.timerSeconds % 60).toString().padStart(2, '0')} time limit • {persona.difficulty} difficulty
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={startTraining}
                  disabled={!selectedDrug}
                  className="w-full py-4 rounded-lg bg-[#E67E22] hover:bg-[#D35400] text-white font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  START TRAINING SESSION
                </button>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-20 lg:py-28">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80"
              alt="Modern office"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-[#1B4D7A]/90"></div>
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Sales Performance?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join leading pharmaceutical companies using AI-powered training to 
              accelerate rep onboarding and improve sales outcomes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="#simulator"
                className="px-8 py-4 bg-[#E67E22] hover:bg-[#D35400] text-white font-semibold rounded transition-colors text-lg"
              >
                Start Free Training
              </a>
              <a 
                href="mailto:contact@repiq.ai"
                className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-[#1B4D7A] font-semibold rounded transition-colors text-lg"
              >
                Schedule a Demo
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#0F2D44] text-gray-300 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded bg-gradient-to-br from-[#1B4D7A] to-[#2D6A9F] flex items-center justify-center">
                    <span className="text-white font-bold">R</span>
                  </div>
                  <span className="text-xl font-bold text-white">RepIQ</span>
                </div>
                <p className="text-sm leading-relaxed text-gray-400">
                  AI-powered pharmaceutical sales training built for New England's healthcare ecosystem.
                </p>
              </div>
              <div>
                <h5 className="font-semibold text-white mb-4">Platform</h5>
                <ul className="space-y-2 text-sm">
                  <li><a href="#platform" className="hover:text-white transition-colors">AI Simulations</a></li>
                  <li><a href="#training" className="hover:text-white transition-colors">Training Programs</a></li>
                  <li><a href="#roles" className="hover:text-white transition-colors">Solutions</a></li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-white mb-4">Company</h5>
                <ul className="space-y-2 text-sm">
                  <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-white mb-4">Connect</h5>
                <ul className="space-y-2 text-sm">
                  <li><a href="https://www.linkedin.com/in/michael-palmer-qa/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a></li>
                  <li><a href="https://github.com/mpalmer79/pharma-rep-trainer" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-400">
              <p>© 2025 RepIQ. All rights reserved.</p>
              <p>Built in Boston, MA</p>
            </div>
          </div>
        </footer>

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
            <p className="text-gray-600">Here's how you performed</p>
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
              onClick={resetTraining}
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
              onClick={() => {
                setMessages([]);
                setFeedback(null);
                setSessionStartTime(new Date());
                setTimeRemaining(currentPersona?.timerSeconds || 180);
                setMessages([{ role: 'assistant', content: currentPersona ? getOpeningLine(currentPersona) : '' }]);
                setStage('training');
              }}
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
            onViewSession={handleViewSession}
            onDeleteSession={deleteSession}
            onClearHistory={clearHistory}
            onStartTraining={() => {
              setShowProgressDashboard(false);
              resetTraining();
            }}
          />
        )}

        {/* Session Detail Modal in Feedback */}
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

  return null;
}
