'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { drugs } from '@/data/drugs';
import { personas } from '@/data/personas';

// Custom hook for animated counter
function useAnimatedCounter(end: number, duration: number = 2000, shouldStart: boolean = false) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!shouldStart) return;
    
    let startTime: number;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, shouldStart]);
  
  return count;
}

// Custom hook for scroll-triggered animations
function useScrollAnimation(threshold: number = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, [threshold]);
  
  return { ref, isVisible };
}

// Animated Section Component
function AnimatedSection({ 
  children, 
  direction = 'up', 
  delay = 0 
}: { 
  children: React.ReactNode; 
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
  delay?: number;
}) {
  const { ref, isVisible } = useScrollAnimation();
  
  const transforms = {
    up: 'translateY(40px)',
    down: 'translateY(-40px)',
    left: 'translateX(40px)',
    right: 'translateX(-40px)',
    scale: 'scale(0.95)'
  };
  
  return (
    <div
      ref={ref}
      style={{
        transform: isVisible ? 'none' : transforms[direction],
        opacity: isVisible ? 1 : 0,
        transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`
      }}
    >
      {children}
    </div>
  );
}

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
  const [hoveredPersona, setHoveredPersona] = useState<string | null>(null);
  const [selectedTherapeutic, setSelectedTherapeutic] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentPersona = personas.find(p => p.id === selectedPersona);
  const currentDrug = drugs.find(d => d.id === selectedDrug);

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

  // Stats animation refs
  const { ref: statsRef, isVisible: statsVisible } = useScrollAnimation();
  const stat1 = useAnimatedCounter(170, 2000, statsVisible);
  const stat2 = useAnimatedCounter(55, 2000, statsVisible);
  const stat3 = useAnimatedCounter(847, 2000, statsVisible);
  const stat4 = useAnimatedCounter(98, 2000, statsVisible);

  const therapeuticAreas = [
    { name: 'Oncology', drug: 'Keytruda', indication: 'Metastatic NSCLC', data: '44.8% 5-year survival', moa: 'PD-1 inhibitor', competitor: 'Opdivo' },
    { name: 'Cardiology', drug: 'Entresto', indication: 'Heart Failure (HFrEF)', data: '20% mortality reduction', moa: 'ARNI', competitor: 'ACE inhibitors' },
    { name: 'Immunology', drug: 'Humira', indication: 'Rheumatoid Arthritis', data: 'ACR50 in 40% patients', moa: 'TNF-alpha inhibitor', competitor: 'Enbrel' },
    { name: 'Neurology', drug: 'Tecfidera', indication: 'Multiple Sclerosis', data: '53% relapse reduction', moa: 'Nrf2 activator', competitor: 'Gilenya' },
    { name: 'Diabetes', drug: 'Ozempic', indication: 'Type 2 Diabetes', data: '1.4% A1C reduction', moa: 'GLP-1 agonist', competitor: 'Trulicity' }
  ];

  // Landing Page
  if (stage === 'landing') {
    return (
      <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
        {/* Floating Particles Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-[#00D4AA]/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${10 + Math.random() * 20}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>

        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00D4AA] to-[#0EA5E9] flex items-center justify-center font-bold text-slate-950">
                R
              </div>
              <span className="text-xl font-semibold tracking-tight">RepIQ</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#personas" className="hover:text-white transition-colors">Personas</a>
              <a href="#simulator" className="hover:text-white transition-colors">Simulator</a>
            </div>
            <a 
              href="#simulator"
              className="px-5 py-2.5 bg-gradient-to-r from-[#00D4AA] to-[#0EA5E9] text-slate-950 font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Start Training
            </a>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center pt-20">
          <div className="absolute inset-0 bg-gradient-to-b from-[#00D4AA]/5 via-transparent to-transparent" />
          
          {/* DNA Helix SVG */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-[600px] opacity-20">
            <svg viewBox="0 0 200 600" className="w-full h-full">
              <defs>
                <linearGradient id="dnaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00D4AA" />
                  <stop offset="100%" stopColor="#0EA5E9" />
                </linearGradient>
              </defs>
              {[...Array(12)].map((_, i) => (
                <g key={i} transform={`translate(0, ${i * 50})`}>
                  <ellipse cx="60" cy="25" rx="40" ry="8" fill="none" stroke="url(#dnaGradient)" strokeWidth="2" opacity="0.6">
                    <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
                  </ellipse>
                  <ellipse cx="140" cy="25" rx="40" ry="8" fill="none" stroke="url(#dnaGradient)" strokeWidth="2" opacity="0.6">
                    <animate attributeName="opacity" values="1;0.6;1" dur="2s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
                  </ellipse>
                  <line x1="100" y1="17" x2="100" y2="33" stroke="url(#dnaGradient)" strokeWidth="2" opacity="0.4" />
                </g>
              ))}
            </svg>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <AnimatedSection direction="right">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-sm text-slate-300 mb-6">
                  <span className="w-2 h-2 bg-[#00D4AA] rounded-full animate-pulse" />
                  New England's Premier AI Training Platform
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
                  <span className="bg-gradient-to-r from-[#00D4AA] to-[#0EA5E9] bg-clip-text text-transparent">
                    Master Every
                  </span>
                  <br />
                  Physician Conversation
                </h1>
                <p className="text-xl text-slate-400 mb-8 max-w-xl">
                  AI-powered roleplay simulations trained on real physician behaviors. 
                  Practice with challenging personas before your next sales call.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a 
                    href="#simulator"
                    className="px-8 py-4 bg-gradient-to-r from-[#00D4AA] to-[#0EA5E9] text-slate-950 font-semibold rounded-xl hover:opacity-90 transition-all text-center"
                  >
                    Start Free Training
                  </a>
                  <a 
                    href="#features"
                    className="px-8 py-4 border border-slate-700 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all text-center"
                  >
                    Learn More
                  </a>
                </div>
              </AnimatedSection>

              <AnimatedSection direction="left" delay={200}>
                <div className="relative">
                  {/* Simulated Chat Preview */}
                  <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 p-6 shadow-2xl shadow-[#00D4AA]/5">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                      <img 
                        src="https://i.pravatar.cc/60?img=3"
                        alt="Dr. Sarah Chen"
                        className="w-12 h-12 rounded-full ring-2 ring-[#00D4AA]/30"
                      />
                      <div>
                        <h4 className="font-semibold text-white">Dr. Sarah Chen</h4>
                        <p className="text-sm text-slate-400">Oncologist • Mass General</p>
                      </div>
                      <span className="ml-auto px-3 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full font-medium">
                        Medium
                      </span>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-slate-800/50 rounded-xl p-4 max-w-[85%]">
                        <p className="text-slate-300 text-sm">
                          "I have about 5 minutes. What makes your drug different from what I'm currently prescribing?"
                        </p>
                      </div>
                      <div className="bg-gradient-to-r from-[#00D4AA]/20 to-[#0EA5E9]/20 rounded-xl p-4 max-w-[85%] ml-auto border border-[#00D4AA]/20">
                        <p className="text-white text-sm">
                          "Of course, Dr. Chen. The key differentiator is our 44.8% five-year survival rate in the KEYNOTE-024 trial..."
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-[#00D4AA] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-[#00D4AA] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-[#00D4AA] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        AI is typing...
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating Stats Card */}
                  <div className="absolute -bottom-6 -left-6 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl" style={{ animation: 'float 6s ease-in-out infinite' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#00D4AA]/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#00D4AA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">+170%</p>
                        <p className="text-xs text-slate-400">Retention Boost</p>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500">
            <span className="text-sm">Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-slate-700 rounded-full flex justify-center">
              <div className="w-1.5 h-3 bg-[#00D4AA] rounded-full mt-2 animate-bounce" />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section ref={statsRef} className="py-20 border-y border-slate-800 bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <p className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#00D4AA] to-[#0EA5E9] bg-clip-text text-transparent">
                  {stat1}%
                </p>
                <p className="text-slate-400 mt-2">Training Retention</p>
              </div>
              <div className="text-center">
                <p className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#00D4AA] to-[#0EA5E9] bg-clip-text text-transparent">
                  {stat2}%
                </p>
                <p className="text-slate-400 mt-2">More Effective</p>
              </div>
              <div className="text-center">
                <p className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#00D4AA] to-[#0EA5E9] bg-clip-text text-transparent">
                  {stat3}
                </p>
                <p className="text-slate-400 mt-2">Reps Trained</p>
              </div>
              <div className="text-center">
                <p className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#00D4AA] to-[#0EA5E9] bg-clip-text text-transparent">
                  {stat4}%
                </p>
                <p className="text-slate-400 mt-2">Satisfaction</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <AnimatedSection direction="up">
              <div className="text-center mb-16">
                <span className="inline-block px-4 py-1.5 bg-[#00D4AA]/10 border border-[#00D4AA]/20 rounded-full text-[#00D4AA] text-sm font-medium mb-4">
                  Platform Features
                </span>
                <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                  Everything You Need to
                  <span className="bg-gradient-to-r from-[#00D4AA] to-[#0EA5E9] bg-clip-text text-transparent"> Excel</span>
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  Our AI-powered platform simulates real physician interactions, 
                  giving you the practice you need before high-stakes conversations.
                </p>
              </div>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ),
                  title: 'AI Physician Personas',
                  description: 'Practice with 5 distinct physician types, from the rushed specialist to the skeptical decision-maker.'
                },
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                  title: 'Real-Time Feedback',
                  description: 'Get instant scoring and actionable insights after every simulation session.'
                },
                {
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  ),
                  title: 'Drug Knowledge Base',
                  description: 'Comprehensive data on major therapeutics including clinical trial results and competitive positioning.'
                }
              ].map((feature, i) => (
                <AnimatedSection key={i} direction="up" delay={i * 100}>
                  <div className="group p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-[#00D4AA]/30 transition-all hover:shadow-lg hover:shadow-[#00D4AA]/5">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#00D4AA]/20 to-[#0EA5E9]/20 rounded-xl flex items-center justify-center text-[#00D4AA] mb-6 group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                    <p className="text-slate-400">{feature.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Therapeutic Areas */}
        <section className="py-24 bg-slate-900/50 border-y border-slate-800">
          <div className="max-w-7xl mx-auto px-6">
            <AnimatedSection direction="up">
              <div className="text-center mb-16">
                <span className="inline-block px-4 py-1.5 bg-[#00D4AA]/10 border border-[#00D4AA]/20 rounded-full text-[#00D4AA] text-sm font-medium mb-4">
                  Therapeutic Coverage
                </span>
                <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                  Train Across
                  <span className="bg-gradient-to-r from-[#00D4AA] to-[#0EA5E9] bg-clip-text text-transparent"> Major Areas</span>
                </h2>
              </div>
            </AnimatedSection>

            <div className="grid lg:grid-cols-2 gap-8 items-start">
              <AnimatedSection direction="right">
                <div className="space-y-3">
                  {therapeuticAreas.map((area, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedTherapeutic(i)}
                      className={`w-full p-5 rounded-xl text-left transition-all ${
                        selectedTherapeutic === i
                          ? 'bg-gradient-to-r from-[#00D4AA]/20 to-[#0EA5E9]/20 border border-[#00D4AA]/30'
                          : 'bg-slate-800/50 border border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className={`font-semibold ${selectedTherapeutic === i ? 'text-[#00D4AA]' : 'text-white'}`}>
                            {area.name}
                          </h4>
                          <p className="text-sm text-slate-400">{area.drug}</p>
                        </div>
                        <svg 
                          className={`w-5 h-5 transition-transform ${selectedTherapeutic === i ? 'text-[#00D4AA] rotate-90' : 'text-slate-500'}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </AnimatedSection>

              <AnimatedSection direction="left" delay={200}>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 sticky top-24">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#00D4AA] to-[#0EA5E9] rounded-xl flex items-center justify-center text-2xl font-bold text-slate-950">
                      {therapeuticAreas[selectedTherapeutic].name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{therapeuticAreas[selectedTherapeutic].drug}</h3>
                      <p className="text-[#00D4AA]">{therapeuticAreas[selectedTherapeutic].name}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-800/50 rounded-xl">
                      <p className="text-sm text-slate-400 mb-1">Indication</p>
                      <p className="text-white">{therapeuticAreas[selectedTherapeutic].indication}</p>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-xl">
                      <p className="text-sm text-slate-400 mb-1">Key Clinical Data</p>
                      <p className="text-white font-semibold">{therapeuticAreas[selectedTherapeutic].data}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-800/50 rounded-xl">
                        <p className="text-sm text-slate-400 mb-1">MOA</p>
                        <p className="text-white text-sm">{therapeuticAreas[selectedTherapeutic].moa}</p>
                      </div>
                      <div className="p-4 bg-slate-800/50 rounded-xl">
                        <p className="text-sm text-slate-400 mb-1">Competitor</p>
                        <p className="text-white text-sm">{therapeuticAreas[selectedTherapeutic].competitor}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Personas Section */}
        <section id="personas" className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <AnimatedSection direction="up">
              <div className="text-center mb-16">
                <span className="inline-block px-4 py-1.5 bg-[#00D4AA]/10 border border-[#00D4AA]/20 rounded-full text-[#00D4AA] text-sm font-medium mb-4">
                  AI Personas
                </span>
                <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                  Practice With Real
                  <span className="bg-gradient-to-r from-[#00D4AA] to-[#0EA5E9] bg-clip-text text-transparent"> Physician Types</span>
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  Each persona is modeled on common physician behaviors and communication styles 
                  you'll encounter in the field.
                </p>
              </div>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {personas.map((persona, i) => (
                <AnimatedSection key={persona.id} direction="up" delay={i * 100}>
                  <div 
                    className={`group relative p-6 rounded-2xl border transition-all cursor-pointer ${
                      hoveredPersona === persona.id
                        ? 'bg-slate-800 border-[#00D4AA]/50 shadow-lg shadow-[#00D4AA]/10'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }`}
                    onMouseEnter={() => setHoveredPersona(persona.id)}
                    onMouseLeave={() => setHoveredPersona(null)}
                    onClick={() => {
                      setSelectedPersona(persona.id);
                      document.getElementById('simulator')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <img 
                        src={`https://i.pravatar.cc/80?img=${persona.id === 'rush' ? 1 : persona.id === 'skeptic' ? 3 : persona.id === 'loyalist' ? 5 : persona.id === 'gatekeeper' ? 9 : 11}`}
                        alt={persona.name}
                        className="w-16 h-16 rounded-xl ring-2 ring-slate-700 group-hover:ring-[#00D4AA]/30 transition-all"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-white">{persona.name}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            persona.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400' :
                            persona.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {persona.difficulty}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 mb-3">{persona.title}</p>
                        <p className="text-sm text-slate-500">{persona.description}</p>
                        <div className="flex items-center gap-2 mt-4 text-xs text-slate-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {Math.floor(persona.timerSeconds / 60)}:{(persona.timerSeconds % 60).toString().padStart(2, '0')} time limit
                        </div>
                      </div>
                    </div>
                    
                    {/* Glow effect */}
                    <div className={`absolute inset-0 rounded-2xl transition-opacity ${
                      hoveredPersona === persona.id ? 'opacity-100' : 'opacity-0'
                    }`} style={{
                      background: 'radial-gradient(circle at 50% 50%, rgba(0, 212, 170, 0.1) 0%, transparent 70%)'
                    }} />
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* New England Region Section */}
        <section className="py-24 bg-slate-900/50 border-y border-slate-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <AnimatedSection direction="right">
                <span className="inline-block px-4 py-1.5 bg-[#00D4AA]/10 border border-[#00D4AA]/20 rounded-full text-[#00D4AA] text-sm font-medium mb-4">
                  Regional Focus
                </span>
                <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                  Built for
                  <span className="bg-gradient-to-r from-[#00D4AA] to-[#0EA5E9] bg-clip-text text-transparent"> New England</span>
                </h2>
                <p className="text-slate-400 mb-8">
                  Our AI personas are trained on physician behaviors specific to the 
                  Boston/Cambridge medical corridor and greater New England region.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                    <p className="text-3xl font-bold text-[#00D4AA]">5</p>
                    <p className="text-sm text-slate-400">Coverage Areas</p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                    <p className="text-3xl font-bold text-[#00D4AA]">12+</p>
                    <p className="text-sm text-slate-400">Academic Centers</p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                    <p className="text-3xl font-bold text-[#00D4AA]">25+</p>
                    <p className="text-sm text-slate-400">Specialties</p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                    <p className="text-3xl font-bold text-[#00D4AA]">24/7</p>
                    <p className="text-sm text-slate-400">Availability</p>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection direction="left" delay={200}>
                {/* New England Map Visualization */}
                <div className="relative bg-slate-900 rounded-2xl border border-slate-800 p-8 aspect-square">
                  <svg viewBox="0 0 300 300" className="w-full h-full">
                    {/* Simplified NE Region outline */}
                    <path
                      d="M50 80 L100 60 L150 50 L200 55 L250 80 L260 130 L250 180 L220 220 L180 250 L140 260 L100 250 L60 210 L40 160 L45 120 Z"
                      fill="none"
                      stroke="url(#mapGradient)"
                      strokeWidth="2"
                      opacity="0.3"
                    />
                    <defs>
                      <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00D4AA" />
                        <stop offset="100%" stopColor="#0EA5E9" />
                      </linearGradient>
                    </defs>
                    
                    {/* Location pins */}
                    {[
                      { x: 180, y: 180, label: 'Boston', size: 'lg' },
                      { x: 170, y: 160, label: 'Cambridge', size: 'md' },
                      { x: 140, y: 200, label: 'Worcester', size: 'sm' },
                      { x: 200, y: 220, label: 'Providence', size: 'sm' },
                      { x: 160, y: 100, label: 'Manchester', size: 'sm' }
                    ].map((loc, i) => (
                      <g key={i}>
                        <circle 
                          cx={loc.x} 
                          cy={loc.y} 
                          r={loc.size === 'lg' ? 12 : loc.size === 'md' ? 8 : 6}
                          fill="#00D4AA"
                          opacity="0.2"
                        >
                          <animate attributeName="r" values={`${loc.size === 'lg' ? 12 : loc.size === 'md' ? 8 : 6};${loc.size === 'lg' ? 18 : loc.size === 'md' ? 12 : 10};${loc.size === 'lg' ? 12 : loc.size === 'md' ? 8 : 6}`} dur="2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.2;0.1;0.2" dur="2s" repeatCount="indefinite" />
                        </circle>
                        <circle 
                          cx={loc.x} 
                          cy={loc.y} 
                          r={loc.size === 'lg' ? 6 : loc.size === 'md' ? 4 : 3}
                          fill="#00D4AA"
                        />
                        <text 
                          x={loc.x} 
                          y={loc.y - 15}
                          textAnchor="middle"
                          fill="#94a3b8"
                          fontSize="10"
                        >
                          {loc.label}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Simulator Section */}
        <section id="simulator" className="py-24">
          <div className="max-w-4xl mx-auto px-6">
            <AnimatedSection direction="up">
              <div className="text-center mb-12">
                <span className="inline-block px-4 py-1.5 bg-[#00D4AA]/10 border border-[#00D4AA]/20 rounded-full text-[#00D4AA] text-sm font-medium mb-4">
                  Training Simulator
                </span>
                <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                  Configure Your
                  <span className="bg-gradient-to-r from-[#00D4AA] to-[#0EA5E9] bg-clip-text text-transparent"> Session</span>
                </h2>
                <p className="text-slate-400">
                  Select a product and physician persona to begin your simulation
                </p>
              </div>
            </AnimatedSection>

            {/* Product Selection */}
            <AnimatedSection direction="up" delay={100}>
              <div className="mb-10">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-br from-[#00D4AA] to-[#0EA5E9] text-slate-950 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Select Product
                </h4>
                <div className="grid gap-3">
                  {drugs.map(drug => (
                    <button
                      key={drug.id}
                      onClick={() => setSelectedDrug(drug.id)}
                      className={`p-5 rounded-xl border text-left transition-all ${
                        selectedDrug === drug.id 
                          ? 'bg-gradient-to-r from-[#00D4AA]/10 to-[#0EA5E9]/10 border-[#00D4AA]/50' 
                          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-semibold text-white">{drug.name}</h5>
                          <p className="text-sm text-slate-400">{drug.category} • {drug.indication}</p>
                        </div>
                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedDrug === drug.id ? 'border-[#00D4AA] bg-[#00D4AA]' : 'border-slate-600'
                        }`}>
                          {selectedDrug === drug.id && <span className="w-2 h-2 rounded-full bg-slate-950" />}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-2">{drug.keyData}</p>
                    </button>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* Persona Selection */}
            <AnimatedSection direction="up" delay={200}>
              <div className="mb-10">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-br from-[#00D4AA] to-[#0EA5E9] text-slate-950 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Select Physician
                </h4>
                <div className="grid gap-3">
                  {personas.map(persona => (
                    <button
                      key={persona.id}
                      onClick={() => setSelectedPersona(persona.id)}
                      className={`p-5 rounded-xl border text-left transition-all ${
                        selectedPersona === persona.id 
                          ? 'bg-gradient-to-r from-[#00D4AA]/10 to-[#0EA5E9]/10 border-[#00D4AA]/50' 
                          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex gap-4 items-start">
                        <img 
                          src={`https://i.pravatar.cc/80?img=${persona.id === 'rush' ? 1 : persona.id === 'skeptic' ? 3 : persona.id === 'loyalist' ? 5 : persona.id === 'gatekeeper' ? 9 : 11}`}
                          alt={persona.name}
                          className="w-14 h-14 rounded-xl"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="font-semibold text-white">{persona.name}</h5>
                                <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
                                  persona.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400' :
                                  persona.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                                  'bg-red-500/20 text-red-400'
                                }`}>
                                  {persona.difficulty}
                                </span>
                              </div>
                              <p className="text-sm text-slate-400">{persona.title}</p>
                            </div>
                            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedPersona === persona.id ? 'border-[#00D4AA] bg-[#00D4AA]' : 'border-slate-600'
                            }`}>
                              {selectedPersona === persona.id && <span className="w-2 h-2 rounded-full bg-slate-950" />}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 mt-1">{persona.description}</p>
                          <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            </AnimatedSection>

            <AnimatedSection direction="up" delay={300}>
              <button
                onClick={startTraining}
                disabled={!selectedDrug}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00D4AA] to-[#0EA5E9] text-slate-950 font-semibold text-lg transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Training Session
              </button>
            </AnimatedSection>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00D4AA] to-[#0EA5E9] flex items-center justify-center font-bold text-slate-950">
                    R
                  </div>
                  <span className="text-xl font-semibold text-white">RepIQ</span>
                </div>
                <p className="text-slate-400 text-sm">
                  AI-powered pharmaceutical sales training for the modern rep.
                </p>
              </div>
              <div>
                <h5 className="font-semibold text-white mb-4">Product</h5>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#personas" className="hover:text-white transition-colors">Personas</a></li>
                  <li><a href="#simulator" className="hover:text-white transition-colors">Simulator</a></li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-white mb-4">Company</h5>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-white mb-4">Legal</h5>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
              <p>© 2025 RepIQ. Built with ❤️ in Boston, MA</p>
            </div>
          </div>
        </footer>

        {/* CSS for float animation */}
        <style jsx global>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        `}</style>
      </div>
    );
  }

  // Training Stage
  if (stage === 'training' && currentPersona && currentDrug) {
    return (
      <div className="min-h-screen bg-slate-950">
        {/* Header with Timer */}
        <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00D4AA] to-[#0EA5E9] flex items-center justify-center font-bold text-slate-950">
                R
              </div>
              <div>
                <h1 className="font-bold text-white">RepIQ</h1>
                <p className="text-xs text-slate-400">Training Session</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xl ${
              timeRemaining <= 30 
                ? 'bg-red-500/20 text-red-400 animate-pulse' 
                : 'bg-slate-800 text-white'
            }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatTime(timeRemaining)}
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Persona Info Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 flex items-center gap-4">
            <img 
              src={`https://i.pravatar.cc/80?img=${currentPersona.id === 'rush' ? 1 : currentPersona.id === 'skeptic' ? 3 : currentPersona.id === 'loyalist' ? 5 : currentPersona.id === 'gatekeeper' ? 9 : 11}`}
              alt={currentPersona.name}
              className="w-14 h-14 rounded-xl ring-2 ring-[#00D4AA]/30"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white">{currentPersona.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  currentPersona.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400' :
                  currentPersona.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {currentPersona.difficulty}
                </span>
              </div>
              <p className="text-sm text-slate-400">{currentPersona.title}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Product</p>
              <p className="font-medium text-[#00D4AA]">{currentDrug.name}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-4 mb-6 min-h-[400px]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-4 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-[#00D4AA]/20 to-[#0EA5E9]/20 border border-[#00D4AA]/20 text-white'
                    : 'bg-slate-800 text-slate-200'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 rounded-2xl p-4">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-[#00D4AA] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-[#00D4AA] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-[#00D4AA] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your response..."
              className="flex-1 px-4 py-3 bg-transparent text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-[#00D4AA] to-[#0EA5E9] text-slate-950 font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
            >
              Send
            </button>
          </div>

          {/* End Session Button */}
          <button
            onClick={endTraining}
            className="w-full mt-4 py-3 border border-slate-700 text-slate-400 rounded-xl hover:bg-slate-800 transition-all"
          >
            End Session Early
          </button>
        </div>
      </div>
    );
  }

  // Feedback Stage
  if (stage === 'feedback' && feedback) {
    const scoreColor = feedback.score >= 80 ? 'text-emerald-400' : feedback.score >= 60 ? 'text-amber-400' : 'text-red-400';
    const scoreBg = feedback.score >= 80 ? 'from-emerald-500/20 to-emerald-500/5' : feedback.score >= 60 ? 'from-amber-500/20 to-amber-500/5' : 'from-red-500/20 to-red-500/5';

    return (
      <div className="min-h-screen bg-slate-950 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00D4AA] to-[#0EA5E9] flex items-center justify-center font-bold text-slate-950 text-2xl mx-auto mb-4">
              R
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Session Complete</h1>
            <p className="text-slate-400">Here's how you performed</p>
          </div>

          {/* Score Card */}
          <div className={`bg-gradient-to-b ${scoreBg} border border-slate-800 rounded-2xl p-8 mb-6 text-center`}>
            <p className="text-slate-400 mb-2">Your Score</p>
            <p className={`text-7xl font-bold ${scoreColor}`}>{feedback.score}</p>
            <p className="text-slate-500 mt-2">out of 100</p>
          </div>

          {/* Strengths */}
          {feedback.strengths.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-4">
              <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Strengths
              </h3>
              <ul className="space-y-2">
                {feedback.strengths.map((s, i) => (
                  <li key={i} className="text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements */}
          {feedback.improvements.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-4">
              <h3 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Areas for Improvement
              </h3>
              <ul className="space-y-2">
                {feedback.improvements.map((imp, i) => (
                  <li key={i} className="text-slate-300 flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    {imp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pro Tips */}
          {feedback.tips.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-[#00D4AA] mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Pro Tips
              </h3>
              <ul className="space-y-2">
                {feedback.tips.map((tip, i) => (
                  <li key={i} className="text-slate-300 flex items-start gap-2">
                    <span className="text-[#00D4AA] mt-1">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={resetTraining}
              className="flex-1 py-4 border border-slate-700 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all"
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
              className="flex-1 py-4 bg-gradient-to-r from-[#00D4AA] to-[#0EA5E9] text-slate-950 font-semibold rounded-xl hover:opacity-90 transition-all"
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
