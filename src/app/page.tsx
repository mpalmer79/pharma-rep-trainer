'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { drugs } from '@/data/drugs';
import { personas } from '@/data/personas';

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

  const currentPersona = personas.find(p => p.id === selectedPersona);
  const currentDrug = drugs.find(d => d.id === selectedDrug);

  // Generate opening line based on persona
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

  // Close mobile menu when navigating
  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  // Timer effect
  useEffect(() => {
    if (stage !== 'training' || timeRemaining <= 0) return;
    
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

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const startTraining = useCallback(() => {
    if (!selectedDrug) return;
    const persona = selectedPersona ? personas.find(p => p.id === selectedPersona) : personas[0];
    if (!selectedPersona) setSelectedPersona(persona!.id);
    
    setTimeRemaining(persona!.timerSeconds);
    setMessages([{
      role: 'assistant',
      content: getOpeningLine(persona!)
    }]);
    setStage('training');
  }, [selectedDrug, selectedPersona]);

  const endTraining = useCallback(async () => {
    if (messages.length < 2) {
      setFeedback({
        score: 0,
        strengths: [],
        improvements: ['Session ended before meaningful interaction'],
        tips: ['Try to engage more with the physician persona']
      });
      setStage('feedback');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          drug: currentDrug,
          persona: currentPersona
        })
      });
      
      const data = await response.json();
      setFeedback(data);
    } catch (error) {
      setFeedback({
        score: 50,
        strengths: ['Completed the session'],
        improvements: ['Unable to generate detailed feedback'],
        tips: ['Try again for a more detailed analysis']
      });
    }
    setIsLoading(false);
    setStage('feedback');
  }, [messages, currentDrug, currentPersona]);

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
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
          drug: currentDrug,
          persona: currentPersona
        })
      });
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm having trouble responding. Let's continue our discussion."
      }]);
    }
    setIsLoading(false);
  }, [input, isLoading, messages, currentDrug, currentPersona]);

  const resetTraining = () => {
    setStage('landing');
    setMessages([]);
    setFeedback(null);
    setSelectedDrug(null);
    setSelectedPersona(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Landing Page
  if (stage === 'landing') {
    return (
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            {/* Logo and LinkedIn */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[#0066CC] to-[#0052A3] flex items-center justify-center">
                  <span className="text-white font-bold text-sm sm:text-lg">R</span>
                </div>
                <span className="text-lg sm:text-xl font-semibold text-gray-900 tracking-tight">RepIQ</span>
              </div>
              {/* LinkedIn Badge - Always visible but compact on mobile */}
              <a 
                href="https://www.linkedin.com/in/michael-palmer-qa/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-[#0A66C2] hover:bg-[#004182] text-white text-xs sm:text-sm font-medium rounded-md transition-colors"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span className="hidden sm:inline">LinkedIn</span>
              </a>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <a href="#platform" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Platform</a>
              <a href="#personas" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Personas</a>
              <a href="#results" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Results</a>
            </div>

            {/* Desktop Right Side */}
            <div className="hidden md:flex items-center gap-3 lg:gap-4">
              {/* GitHub Badge */}
              <a 
                href="https://github.com/mpalmer79/pharma-rep-trainer"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#24292F] hover:bg-[#1a1e22] text-white text-sm font-medium rounded-md transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="hidden lg:inline">View on GitHub</span>
              </a>
              <a 
                href="#simulator"
                className="px-4 lg:px-5 py-2 lg:py-2.5 bg-[#0066CC] hover:bg-[#0052A3] text-white font-medium rounded-lg transition-colors text-sm lg:text-base"
              >
                Request Demo
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Toggle menu"
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

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
              <div className="px-4 py-4 space-y-3">
                <a 
                  href="#platform" 
                  onClick={handleNavClick}
                  className="block py-2 text-gray-700 hover:text-[#0066CC] font-medium transition-colors"
                >
                  Platform
                </a>
                <a 
                  href="#personas" 
                  onClick={handleNavClick}
                  className="block py-2 text-gray-700 hover:text-[#0066CC] font-medium transition-colors"
                >
                  Personas
                </a>
                <a 
                  href="#results" 
                  onClick={handleNavClick}
                  className="block py-2 text-gray-700 hover:text-[#0066CC] font-medium transition-colors"
                >
                  Results
                </a>
                <hr className="border-gray-200" />
                <a 
                  href="https://www.linkedin.com/in/michael-palmer-qa/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 py-2 text-[#0A66C2] font-medium"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn Profile
                </a>
                <a 
                  href="https://github.com/mpalmer79/pharma-rep-trainer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 py-2 text-gray-700 font-medium"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  View on GitHub
                </a>
                <hr className="border-gray-200" />
                <a 
                  href="#simulator"
                  onClick={handleNavClick}
                  className="block w-full py-3 bg-[#0066CC] hover:bg-[#0052A3] text-white font-medium rounded-lg transition-colors text-center"
                >
                  Request Demo
                </a>
              </div>
            </div>
          )}
        </nav>

        {/* Hero Section */}
        <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full text-xs sm:text-sm text-[#0066CC] font-medium mb-4 sm:mb-6">
                  <span className="w-1.5 h-1.5 bg-[#0066CC] rounded-full"></span>
                  AI-Powered Sales Enablement
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 sm:mb-6">
                  The intelligent coaching system for{' '}
                  <span className="text-[#0066CC]">pharmaceutical sales</span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  RepIQ orchestrates AI-powered physician simulations that help your reps 
                  master every conversation. Built for the New England healthcare market.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12 justify-center lg:justify-start">
                  <a 
                    href="#simulator"
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-[#0066CC] hover:bg-[#0052A3] text-white font-semibold rounded-lg transition-colors text-center"
                  >
                    Start Free Training
                  </a>
                  <a 
                    href="#platform"
                    className="px-6 sm:px-8 py-3 sm:py-4 border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-colors text-center"
                  >
                    See How It Works
                  </a>
                </div>
                
                {/* Trust Indicators */}
                <div className="pt-6 sm:pt-8 border-t border-gray-200">
                  <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">Trusted by leading pharmaceutical teams</p>
                  <div className="flex items-center justify-center lg:justify-start gap-4 sm:gap-8 opacity-60 flex-wrap">
                    <div className="text-gray-400 font-semibold text-xs sm:text-sm">BOSTON MEDICAL</div>
                    <div className="text-gray-400 font-semibold text-xs sm:text-sm">MASS GENERAL</div>
                    <div className="text-gray-400 font-semibold text-xs sm:text-sm hidden sm:block">HARVARD HEALTH</div>
                  </div>
                </div>
              </div>
              
              {/* Hero Image/Demo Area - Hidden on mobile, shown on tablet+ */}
              <div className="relative hidden md:block">
                <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                  {/* Browser Chrome */}
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="bg-white rounded px-3 py-1 text-xs text-gray-400 text-center">
                        repiq.ai/training
                      </div>
                    </div>
                  </div>
                  
                  {/* Demo Content */}
                  <div className="p-4 lg:p-6">
                    <div className="flex items-center gap-3 lg:gap-4 mb-4 lg:mb-6">
                      <img 
                        src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face"
                        alt="Dr. Sarah Chen"
                        className="w-12 h-12 lg:w-14 lg:h-14 rounded-full object-cover ring-2 ring-white shadow-md"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm lg:text-base truncate">Dr. Sarah Chen</h4>
                        <p className="text-xs lg:text-sm text-gray-500 truncate">Oncologist • Massachusetts General Hospital</p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                          Challenging
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3 lg:space-y-4">
                      <div className="bg-gray-100 rounded-xl rounded-tl-none p-3 lg:p-4 max-w-[90%]">
                        <p className="text-gray-700 text-xs lg:text-sm">
                          "I have 5 minutes. Walk me through the Phase III data — specifically the progression-free survival compared to standard of care."
                        </p>
                      </div>
                      <div className="bg-[#0066CC] rounded-xl rounded-tr-none p-3 lg:p-4 max-w-[90%] ml-auto">
                        <p className="text-white text-xs lg:text-sm">
                          "Absolutely, Dr. Chen. In KEYNOTE-024, we saw median PFS of 10.3 months versus 6.0 months with chemotherapy..."
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 lg:mt-6 pt-3 lg:pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>1:32 remaining</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs lg:text-sm text-gray-500">AI Active</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Stats Card */}
                <div className="absolute -bottom-4 lg:-bottom-6 -left-4 lg:-left-6 bg-white rounded-xl shadow-xl border border-gray-100 p-3 lg:p-4">
                  <div className="flex items-center gap-2 lg:gap-3">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xl lg:text-2xl font-bold text-gray-900">170%</p>
                      <p className="text-xs lg:text-sm text-gray-500">Training Retention</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-10 sm:py-16 bg-[#0066CC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 text-center">
              <div className="p-3 sm:p-0">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2">170%</p>
                <p className="text-blue-100 text-xs sm:text-sm lg:text-base">Boost in Training Retention</p>
              </div>
              <div className="p-3 sm:p-0">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2">55%</p>
                <p className="text-blue-100 text-xs sm:text-sm lg:text-base">Improvement in Sales</p>
              </div>
              <div className="p-3 sm:p-0">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2">847</p>
                <p className="text-blue-100 text-xs sm:text-sm lg:text-base">Reps Trained This Year</p>
              </div>
              <div className="p-3 sm:p-0">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2">98%</p>
                <p className="text-blue-100 text-xs sm:text-sm lg:text-base">User Satisfaction Rate</p>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Section */}
        <section id="platform" className="py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                An AI-native coaching system that orchestrates sales execution
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
                Powered by advanced AI, embedded in your sales workflow. 
                Designed to unify process, skills, and technology.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#0066CC] rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">AI Physician Simulations</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Practice with 5 distinct physician personas modeled on real behaviors — 
                  from time-pressed PCPs to data-driven academic specialists.
                </p>
              </div>
              
              <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#0066CC] rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Real-Time Analytics</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Get instant feedback on your performance with detailed scoring 
                  across clinical knowledge, objection handling, and compliance.
                </p>
              </div>
              
              <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#0066CC] rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Comprehensive Drug Library</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Train on major therapeutics with complete clinical data — 
                  trial results, mechanism of action, and competitive positioning.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Personas Section */}
        <section id="personas" className="py-16 sm:py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Practice with real physician archetypes
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
                Each persona is carefully designed to challenge different aspects 
                of your sales approach. Master them all.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {personas.map((persona) => (
                <div 
                  key={persona.id}
                  className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 hover:border-[#0066CC] hover:shadow-lg transition-all cursor-pointer active:scale-[0.98]"
                  onClick={() => {
                    setSelectedPersona(persona.id);
                    document.getElementById('simulator')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <img 
                      src={`https://images.unsplash.com/photo-${
                        persona.id === 'rush' ? '1559839734-2b71ea197ec2' : 
                        persona.id === 'skeptic' ? '1612349317150-e413f6a5b16d' : 
                        persona.id === 'loyalist' ? '1594824476967-48c8b964273f' : 
                        persona.id === 'gatekeeper' ? '1573496359142-b8d87734a5a2' : 
                        '1537368910025-700350fe46c7'
                      }?w=100&h=100&fit=crop&crop=face`}
                      alt={persona.name}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{persona.name}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          persona.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                          persona.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {persona.difficulty}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#0066CC] font-medium mb-1 sm:mb-2">{persona.title}</p>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{persona.description}</p>
                      <div className="flex items-center gap-1 mt-2 sm:mt-3 text-xs text-gray-400">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {Math.floor(persona.timerSeconds / 60)}:{(persona.timerSeconds % 60).toString().padStart(2, '0')} time limit
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Results/Testimonial Section */}
        <section id="results" className="py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              <div className="order-2 lg:order-1">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 text-center lg:text-left">
                  Built for New England's healthcare ecosystem
                </h2>
                <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed text-center lg:text-left">
                  Our AI personas are trained on physician behaviors specific to the 
                  Boston/Cambridge medical corridor and greater New England region — 
                  where expectations are high and time is short.
                </p>
                
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-0.5 sm:mb-1 text-sm sm:text-base">Academic Medical Centers</h4>
                      <p className="text-gray-600 text-sm sm:text-base">Prepare for data-driven conversations with researchers and KOLs.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-0.5 sm:mb-1 text-sm sm:text-base">Community Practices</h4>
                      <p className="text-gray-600 text-sm sm:text-base">Master the art of the 90-second elevator pitch with busy PCPs.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-0.5 sm:mb-1 text-sm sm:text-base">Hospital Systems</h4>
                      <p className="text-gray-600 text-sm sm:text-base">Navigate complex stakeholder environments and formulary discussions.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-5 sm:p-8 order-1 lg:order-2">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <img 
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face"
                    alt="Sales Director"
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">James Mitchell</p>
                    <p className="text-xs sm:text-sm text-gray-500">Regional Sales Director, BioPharma Inc.</p>
                  </div>
                </div>
                <blockquote className="text-base sm:text-lg text-gray-700 leading-relaxed mb-4 sm:mb-6">
                  "RepIQ transformed how we onboard new reps. The AI simulations are 
                  remarkably realistic — our team actually gets nervous before training 
                  sessions, just like they would before a real call. That's exactly what we need."
                </blockquote>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Simulator Section */}
        <section id="simulator" className="py-16 sm:py-24 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Start your training session
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600">
                Select a product and physician persona to begin
              </p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
              {/* Product Selection */}
              <div className="mb-8 sm:mb-10">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                  <span className="w-6 h-6 sm:w-8 sm:h-8 bg-[#0066CC] text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">1</span>
                  Select Product
                </h4>
                <div className="grid gap-2 sm:gap-3">
                  {drugs.map(drug => (
                    <button
                      key={drug.id}
                      onClick={() => setSelectedDrug(drug.id)}
                      className={`p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl border-2 text-left transition-all ${
                        selectedDrug === drug.id 
                          ? 'bg-blue-50 border-[#0066CC]' 
                          : 'bg-white border-gray-200 hover:border-gray-300 active:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-gray-900 text-sm sm:text-base">{drug.name}</h5>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">{drug.category} • {drug.indication}</p>
                        </div>
                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedDrug === drug.id ? 'border-[#0066CC] bg-[#0066CC]' : 'border-gray-300'
                        }`}>
                          {selectedDrug === drug.id && <span className="w-2 h-2 rounded-full bg-white" />}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2 line-clamp-2">{drug.keyData}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Persona Selection */}
              <div className="mb-8 sm:mb-10">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                  <span className="w-6 h-6 sm:w-8 sm:h-8 bg-[#0066CC] text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">2</span>
                  Select Physician
                </h4>
                <div className="grid gap-2 sm:gap-3">
                  {personas.map(persona => (
                    <button
                      key={persona.id}
                      onClick={() => setSelectedPersona(persona.id)}
                      className={`p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl border-2 text-left transition-all ${
                        selectedPersona === persona.id 
                          ? 'bg-blue-50 border-[#0066CC]' 
                          : 'bg-white border-gray-200 hover:border-gray-300 active:bg-gray-50'
                      }`}
                    >
                      <div className="flex gap-3 sm:gap-4 items-start">
                        <img 
                          src={`https://images.unsplash.com/photo-${
                            persona.id === 'rush' ? '1559839734-2b71ea197ec2' : 
                            persona.id === 'skeptic' ? '1612349317150-e413f6a5b16d' : 
                            persona.id === 'loyalist' ? '1594824476967-48c8b964273f' : 
                            persona.id === 'gatekeeper' ? '1573496359142-b8d87734a5a2' : 
                            '1537368910025-700350fe46c7'
                          }?w=100&h=100&fit=crop&crop=face`}
                          alt={persona.name}
                          className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="font-semibold text-gray-900 text-sm sm:text-base">{persona.name}</h5>
                                <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
                                  persona.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                  persona.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {persona.difficulty}
                                </span>
                              </div>
                              <p className="text-xs sm:text-sm text-gray-500">{persona.title}</p>
                            </div>
                            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              selectedPersona === persona.id ? 'border-[#0066CC] bg-[#0066CC]' : 'border-gray-300'
                            }`}>
                              {selectedPersona === persona.id && <span className="w-2 h-2 rounded-full bg-white" />}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">{persona.description}</p>
                          <div className="flex items-center gap-1 mt-1 sm:mt-2 text-xs text-gray-400">
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {Math.floor(persona.timerSeconds / 60)}:{(persona.timerSeconds % 60).toString().padStart(2, '0')} time limit
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={startTraining}
                disabled={!selectedDrug}
                className="w-full py-3 sm:py-4 rounded-lg sm:rounded-xl bg-[#0066CC] hover:bg-[#0052A3] text-white font-semibold text-base sm:text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                Start Training Session
              </button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-20 bg-[#0066CC]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
              Ready to transform your sales performance?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Join leading pharmaceutical companies using AI-powered training 
              to accelerate rep onboarding and improve sales outcomes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <a 
                href="#simulator"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-[#0066CC] font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Start Free Training
              </a>
              <a 
                href="#"
                className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                Schedule a Demo
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 py-10 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 sm:mb-12">
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[#0066CC] to-[#0052A3] flex items-center justify-center">
                    <span className="text-white font-bold text-sm sm:text-base">R</span>
                  </div>
                  <span className="text-lg sm:text-xl font-semibold text-white">RepIQ</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed">
                  AI-powered pharmaceutical sales training built for 
                  New England's healthcare ecosystem.
                </p>
              </div>
              <div>
                <h5 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Platform</h5>
                <ul className="space-y-2 text-xs sm:text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">AI Simulations</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Analytics</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Drug Library</a></li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Company</h5>
                <ul className="space-y-2 text-xs sm:text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Legal</h5>
                <ul className="space-y-2 text-xs sm:text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                </ul>
              </div>
            </div>
            <div className="pt-6 sm:pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm">
              <p>© 2025 RepIQ. All rights reserved.</p>
              <p>Built in Boston, MA</p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Training Stage
  if (stage === 'training' && currentPersona && currentDrug) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header with Timer */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[#0066CC] to-[#0052A3] flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-base">R</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-sm sm:text-base">RepIQ</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Training Session</p>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-mono text-lg sm:text-xl ${
              timeRemaining <= 30 
                ? 'bg-red-100 text-red-600' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatTime(timeRemaining)}
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          {/* Persona Info Card */}
          <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 flex items-center gap-3 sm:gap-4">
            <img 
              src={`https://images.unsplash.com/photo-${
                currentPersona.id === 'rush' ? '1559839734-2b71ea197ec2' : 
                currentPersona.id === 'skeptic' ? '1612349317150-e413f6a5b16d' : 
                currentPersona.id === 'loyalist' ? '1594824476967-48c8b964273f' : 
                currentPersona.id === 'gatekeeper' ? '1573496359142-b8d87734a5a2' : 
                '1537368910025-700350fe46c7'
              }?w=100&h=100&fit=crop&crop=face`}
              alt={currentPersona.name}
              className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{currentPersona.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  currentPersona.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                  currentPersona.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {currentPersona.difficulty}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 truncate">{currentPersona.title}</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs sm:text-sm text-gray-400">Product</p>
              <p className="font-medium text-[#0066CC] text-sm sm:text-base">{currentDrug.name}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 min-h-[300px] sm:min-h-[400px]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] sm:max-w-[80%] p-3 sm:p-4 rounded-2xl text-sm sm:text-base ${
                  msg.role === 'user'
                    ? 'bg-[#0066CC] text-white rounded-tr-none'
                    : 'bg-white border border-gray-200 text-gray-700 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-3 sm:p-4">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-1.5 sm:p-2 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your response..."
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-sm sm:text-base"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-[#0066CC] hover:bg-[#0052A3] text-white font-semibold rounded-lg disabled:opacity-50 transition-colors text-sm sm:text-base"
            >
              Send
            </button>
          </div>

          {/* End Session Button */}
          <button
            onClick={endTraining}
            className="w-full mt-3 sm:mt-4 py-2.5 sm:py-3 border border-gray-300 text-gray-600 rounded-lg sm:rounded-xl hover:bg-gray-100 transition-colors text-sm sm:text-base"
          >
            End Session Early
          </button>
        </div>
      </div>
    );
  }

  // Feedback Stage
  if (stage === 'feedback' && feedback) {
    const scoreColor = feedback.score >= 80 ? 'text-green-600' : feedback.score >= 60 ? 'text-amber-600' : 'text-red-600';
    const scoreBg = feedback.score >= 80 ? 'bg-green-50' : feedback.score >= 60 ? 'bg-amber-50' : 'bg-red-50';

    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-[#0066CC] to-[#0052A3] flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span className="text-white font-bold text-lg sm:text-2xl">R</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Session Complete</h1>
            <p className="text-gray-600 text-sm sm:text-base">Here's how you performed</p>
          </div>

          {/* Score Card */}
          <div className={`${scoreBg} border border-gray-200 rounded-xl sm:rounded-2xl p-6 sm:p-8 mb-4 sm:mb-6 text-center`}>
            <p className="text-gray-600 mb-1 sm:mb-2 text-sm sm:text-base">Your Score</p>
            <p className={`text-5xl sm:text-7xl font-bold ${scoreColor}`}>{feedback.score}</p>
            <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">out of 100</p>
          </div>

          {/* Strengths */}
          {feedback.strengths.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-green-600 mb-3 sm:mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Strengths
              </h3>
              <ul className="space-y-2">
                {feedback.strengths.map((s, i) => (
                  <li key={i} className="text-gray-700 flex items-start gap-2 text-sm sm:text-base">
                    <span className="text-green-500 mt-1">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements */}
          {feedback.improvements.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-amber-600 mb-3 sm:mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Areas for Improvement
              </h3>
              <ul className="space-y-2">
                {feedback.improvements.map((imp, i) => (
                  <li key={i} className="text-gray-700 flex items-start gap-2 text-sm sm:text-base">
                    <span className="text-amber-500 mt-1">•</span>
                    {imp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pro Tips */}
          {feedback.tips.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-semibold text-[#0066CC] mb-3 sm:mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Pro Tips
              </h3>
              <ul className="space-y-2">
                {feedback.tips.map((tip, i) => (
                  <li key={i} className="text-gray-700 flex items-start gap-2 text-sm sm:text-base">
                    <span className="text-[#0066CC] mt-1">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={resetTraining}
              className="flex-1 py-3 sm:py-4 border border-gray-300 text-gray-700 font-semibold rounded-lg sm:rounded-xl hover:bg-gray-100 transition-colors text-sm sm:text-base"
            >
              Back to Home
            </button>
            <button
              onClick={() => {
                setMessages([]);
                setFeedback(null);
                setStage('training');
                setTimeRemaining(currentPersona?.timerSeconds || 180);
                setMessages([{ role: 'assistant', content: currentPersona ? getOpeningLine(currentPersona) : '' }]);
              }}
              className="flex-1 py-3 sm:py-4 bg-[#0066CC] hover:bg-[#0052A3] text-white font-semibold rounded-lg sm:rounded-xl transition-colors text-sm sm:text-base"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
