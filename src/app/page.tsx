'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { drugs } from '@/data/drugs';
import { personas, getPersonaById } from '@/data/personas';
import { getDrugById } from '@/data/drugs';
import { Message, Feedback, Stage } from '@/types';

// Scroll animation hook
function useScrollAnimation() {
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

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

// Animated Section Component
function AnimatedSection({ 
  children, 
  direction = 'left',
  delay = 0 
}: { 
  children: React.ReactNode; 
  direction?: 'left' | 'right' | 'up';
  delay?: number;
}) {
  const { ref, isVisible } = useScrollAnimation();
  
  const directionClasses = {
    left: 'translate-x-[-50px]',
    right: 'translate-x-[50px]',
    up: 'translate-y-[50px]'
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible 
          ? 'opacity-100 translate-x-0 translate-y-0' 
          : `opacity-0 ${directionClasses[direction]}`
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const [stage, setStage] = useState<Stage>('setup');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(90);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState('');
  const [selectedPersona, setSelectedPersona] = useState('rush');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasEndedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateFeedback = useCallback(async () => {
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;

    try {
      const response = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId: selectedPersona,
          drugId: selectedDrug,
          messages,
        }),
      });

      if (response.ok) {
        const feedbackData = await response.json();
        setFeedback(feedbackData);
      } else {
        setFeedback(generateLocalFeedback());
      }
    } catch {
      setFeedback(generateLocalFeedback());
    }
    
    setStage('feedback');
  }, [messages, selectedDrug, selectedPersona]);

  const handleTimeUp = useCallback(() => {
    setIsTimerRunning(false);
    
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `*looks at watch* I'm sorry, I really have to go - my next patient is waiting. ${prev.length < 4 ? "We barely got started. Maybe schedule more time next visit?" : "Thanks for stopping by."}`,
    }]);
    
    setTimeout(() => generateFeedback(), 1000);
  }, [generateFeedback]);

  useEffect(() => {
    if (isTimerRunning && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, handleTimeUp]);

  const generateLocalFeedback = (): Feedback => {
    const userMessages = messages.filter(m => m.role === 'user');
    const allUserText = userMessages.map(m => m.content).join(' ').toLowerCase();
    
    const scores = {
      opening: Math.min(100, Math.max(40, 60 + (userMessages[0]?.content.length < 150 ? 20 : -10))),
      clinicalKnowledge: Math.min(100, 50 + (allUserText.includes('%') ? 15 : 0) + (allUserText.includes('study') ? 10 : 0)),
      objectionHandling: Math.min(100, 40 + userMessages.length * 12),
      timeManagement: selectedPersona === 'rush' ? Math.min(100, userMessages.reduce((a, m) => a + m.content.length, 0) / userMessages.length < 150 ? 85 : 60) : 75,
      compliance: Math.max(50, 90 - (allUserText.includes('cure') ? 20 : 0) - (allUserText.includes('guarantee') ? 20 : 0)),
      closing: 70,
    };

    const overall = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 6);

    return {
      scores,
      overall,
      strengths: scores.compliance >= 80 ? ['Maintained compliant messaging'] : ['Completed the exercise'],
      improvements: scores.timeManagement < 70 ? ['Keep responses shorter for time-pressed physicians'] : [],
      tips: 'Lead with your strongest differentiator and listen for buying signals.',
    };
  };

  const getOpeningLine = () => {
    const persona = getPersonaById(selectedPersona);
    const drug = getDrugById(selectedDrug);
    
    if (!persona || !drug) return "Hello, what can I do for you today?";
    
    switch(persona.id) {
      case 'rush':
        return "*glances up from laptop while finishing a note* Oh, hi. You're the rep for... *checks badge* ...right. I've got maybe a minute before my next patient. What do you have for me?";
      case 'skeptic':
        return `*sets down journal article* Ah yes, you're here about ${drug.name}. I've looked at the Phase 3 data. Interesting trial design choices. What would you like to discuss?`;
      case 'loyalist':
        return `*smiles warmly* Come in, come in. I remember you mentioned ${drug.name} last time. I'll be honest - my patients are doing well on their current regimen. But I'm happy to hear what's new.`;
      case 'gatekeeper':
        return "*looks up from computer* Hi there. Do you have an appointment? The doctors are pretty booked today. What company are you with?";
      case 'curious':
        return `*leans forward with interest* Oh good, you're here! I've been wanting to learn more about ${drug.name}. Tell me about the mechanism of action.`;
      default:
        return "Hello, what can I do for you today?";
    }
  };

  const startTraining = () => {
    if (!selectedDrug) return;
    
    const persona = getPersonaById(selectedPersona);
    if (!persona) return;
    
    hasEndedRef.current = false;
    setTimeRemaining(persona.timerSeconds);
    setStage('training');
    setMessages([{
      role: 'assistant',
      content: getOpeningLine(),
    }]);
    setIsTimerRunning(true);
  };

  const sendMessage = async () => {
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
          personaId: selectedPersona,
          drugId: selectedDrug,
          messages: [...messages, { role: 'user', content: userMessage }],
          timeRemaining,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
        
        if (data.endConversation) {
          setIsTimerRunning(false);
          setTimeout(() => generateFeedback(), 1500);
        }
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "I see. Tell me more about how this would benefit my patients." 
        }]);
      }
    } catch {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Interesting. What about the side effect profile?" 
      }]);
    }
    
    setIsLoading(false);
  };

  const resetTraining = () => {
    setStage('setup');
    setMessages([]);
    setFeedback(null);
    setInput('');
    hasEndedRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  const currentPersona = getPersonaById(selectedPersona);
  const currentDrug = getDrugById(selectedDrug);

  // Landing page / Setup stage
  if (stage === 'setup') {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#F58220] to-[#E86F10] flex items-center justify-center font-bold text-xl text-white shadow-lg">
                Rx
              </div>
              <div className="text-center">
                <h1 className="font-bold text-xl text-[#1E3A5C]">PharmaRep Trainer</h1>
                <p className="text-sm text-gray-500">AI-Powered Sales Simulation</p>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#1E3A5C] via-[#2D4A6C] to-[#1E3A5C] text-white py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-[#F58220] rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#F58220] rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2" />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <AnimatedSection direction="left">
                <div>
                  <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                    Master Pharmaceutical Sales with{' '}
                    <span className="text-[#F58220]">AI-Powered Training</span>
                  </h2>
                  <p className="text-xl text-gray-300 mb-8">
                    Practice physician calls with realistic AI simulations. Get instant feedback, 
                    track your progress, and develop the skills to become a trusted advisor.
                  </p>
                  <a 
                    href="#simulator" 
                    className="inline-block bg-[#F58220] hover:bg-[#E86F10] text-white font-semibold px-8 py-4 rounded-lg transition-all shadow-lg hover:shadow-xl"
                  >
                    Start Training Now
                  </a>
                </div>
              </AnimatedSection>
              
              <AnimatedSection direction="right" delay={200}>
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=600&h=400&fit=crop"
                    alt="Medical professional in consultation"
                    className="rounded-2xl shadow-2xl w-full"
                  />
                  <div className="absolute -bottom-6 -left-6 bg-white text-[#1E3A5C] p-4 rounded-xl shadow-xl">
                    <div className="text-3xl font-bold text-[#F58220]">90%</div>
                    <div className="text-sm">Skill Retention Rate</div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <AnimatedSection direction="up">
              <div className="text-center mb-16">
                <h3 className="text-3xl font-bold text-[#1E3A5C] mb-4">
                  Why Train With PharmaRep Trainer?
                </h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Our AI-powered platform simulates real physician interactions, 
                  providing a safe environment to practice and perfect your sales approach.
                </p>
              </div>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
              <AnimatedSection direction="left">
                <img 
                  src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&h=400&fit=crop"
                  alt="Professional training session"
                  className="rounded-2xl shadow-xl w-full"
                />
              </AnimatedSection>
              <AnimatedSection direction="right" delay={150}>
                <div>
                  <h4 className="text-2xl font-bold text-[#1E3A5C] mb-4">
                    Realistic Physician Personas
                  </h4>
                  <p className="text-gray-600 mb-6">
                    Practice with five distinct AI physician personalities—from the time-pressed PCP 
                    who gives you 90 seconds, to the data-driven skeptic who challenges every claim.
                  </p>
                  <ul className="space-y-3">
                    {['Time-Pressed PCP', 'Data-Driven Skeptic', 'Competitor Loyalist', 'Office Gatekeeper', 'Early Adopter'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <span className="w-2 h-2 bg-[#F58220] rounded-full" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedSection>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
              <AnimatedSection direction="left" delay={150}>
                <div className="order-2 md:order-1">
                  <h4 className="text-2xl font-bold text-[#1E3A5C] mb-4">
                    Real-Time Coaching Feedback
                  </h4>
                  <p className="text-gray-600 mb-6">
                    Receive instant, AI-powered evaluation across six key competency areas. 
                    Understand your strengths, identify improvement areas, and get actionable tips.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {['Opening', 'Clinical Knowledge', 'Objection Handling', 'Time Management', 'Compliance', 'Closing'].map((skill, i) => (
                      <div key={i} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                        <span className="text-sm font-medium text-[#1E3A5C]">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
              <AnimatedSection direction="right">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop"
                  alt="Analytics dashboard"
                  className="rounded-2xl shadow-xl w-full order-1 md:order-2"
                />
              </AnimatedSection>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <AnimatedSection direction="left">
                <img 
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=400&fit=crop"
                  alt="Sales professional on phone"
                  className="rounded-2xl shadow-xl w-full"
                />
              </AnimatedSection>
              <AnimatedSection direction="right" delay={150}>
                <div>
                  <h4 className="text-2xl font-bold text-[#1E3A5C] mb-4">
                    Five Therapeutic Areas
                  </h4>
                  <p className="text-gray-600 mb-6">
                    Practice detailing across multiple product categories, each with unique 
                    clinical data, competitive landscapes, and physician concerns.
                  </p>
                  <div className="space-y-3">
                    {[
                      { name: 'CardioStat', area: 'Cardiovascular' },
                      { name: 'GlucoNorm XR', area: 'Diabetes' },
                      { name: 'Immunex Pro', area: 'Immunology' },
                      { name: 'NeuroCalm', area: 'CNS' },
                      { name: 'OncoShield', area: 'Oncology' },
                    ].map((drug, i) => (
                      <div key={i} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                        <span className="font-medium text-[#1E3A5C]">{drug.name}</span>
                        <span className="text-sm text-gray-500">{drug.area}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Simulator Section */}
        <section id="simulator" className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <AnimatedSection direction="up">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-[#1E3A5C] mb-4">
                  Configure Your Training Session
                </h3>
                <p className="text-gray-600">
                  Select a product and physician persona to begin your simulation
                </p>
              </div>
            </AnimatedSection>

            {/* Product Selection */}
            <AnimatedSection direction="up" delay={100}>
              <div className="mb-10">
                <h4 className="text-lg font-semibold text-[#1E3A5C] mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-[#F58220] text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Select Product
                </h4>
                <div className="grid gap-3">
                  {drugs.map(drug => (
                    <button
                      key={drug.id}
                      onClick={() => setSelectedDrug(drug.id)}
                      className={`p-5 rounded-xl border-2 text-left transition-all ${
                        selectedDrug === drug.id 
                          ? 'bg-[#FFF5EB] border-[#F58220] shadow-md' 
                          : 'bg-white border-gray-200 hover:border-[#F58220]/50 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-semibold text-[#1E3A5C]">{drug.name}</h5>
                          <p className="text-sm text-gray-500">{drug.category} • {drug.indication}</p>
                        </div>
                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedDrug === drug.id ? 'border-[#F58220] bg-[#F58220]' : 'border-gray-300'
                        }`}>
                          {selectedDrug === drug.id && <span className="w-2 h-2 rounded-full bg-white" />}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">{drug.keyData}</p>
                    </button>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* Persona Selection */}
            <AnimatedSection direction="up" delay={200}>
              <div className="mb-10">
                <h4 className="text-lg font-semibold text-[#1E3A5C] mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-[#F58220] text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Select Physician
                </h4>
                <div className="grid gap-3">
                  {personas.map(persona => (
                    <button
                      key={persona.id}
                      onClick={() => setSelectedPersona(persona.id)}
                      className={`p-5 rounded-xl border-2 text-left transition-all ${
                        selectedPersona === persona.id 
                          ? 'bg-[#FFF5EB] border-[#F58220] shadow-md' 
                          : 'bg-white border-gray-200 hover:border-[#F58220]/50 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex gap-4 items-start">
                        <img 
                          src={`https://i.pravatar.cc/80?img=${persona.id === 'rush' ? 1 : persona.id === 'skeptic' ? 3 : persona.id === 'loyalist' ? 5 : persona.id === 'gatekeeper' ? 9 : 11}`}
                          alt={persona.name}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="font-semibold text-[#1E3A5C]">{persona.name}</h5>
                                <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
                                  persona.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700' :
                                  persona.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {persona.difficulty}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500">{persona.title}</p>
                            </div>
                            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedPersona === persona.id ? 'border-[#F58220] bg-[#F58220]' : 'border-gray-300'
                            }`}>
                              {selectedPersona === persona.id && <span className="w-2 h-2 rounded-full bg-white" />}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{persona.description}</p>
                          <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
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
                className="w-full py-4 rounded-xl bg-[#F58220] hover:bg-[#E86F10] text-white font-semibold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Training Session
              </button>
            </AnimatedSection>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-[#1E3A5C]">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <AnimatedSection direction="up">
              <h3 className="text-3xl font-bold text-white mb-4">
                Ready to Transform Your Sales Performance?
              </h3>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                Join leading pharmaceutical companies using AI-powered training 
                to accelerate rep onboarding and improve sales outcomes.
              </p>
              <a 
                href="#simulator"
                className="inline-block bg-[#F58220] hover:bg-[#E86F10] text-white font-semibold px-8 py-4 rounded-lg transition-all"
              >
                Get Started Today
              </a>
            </AnimatedSection>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 py-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F58220] to-[#E86F10] flex items-center justify-center font-bold text-white">
                Rx
              </div>
              <span className="text-white font-semibold">PharmaRep Trainer</span>
            </div>
            <p className="text-sm">© 2025 PharmaRep Trainer. All rights reserved.</p>
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
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F58220] to-[#E86F10] flex items-center justify-center font-bold text-white">
                Rx
              </div>
              <div>
                <h1 className="font-bold text-[#1E3A5C]">PharmaRep Trainer</h1>
                <p className="text-xs text-gray-500">Training Session</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xl ${
              timeRemaining <= 30 
                ? 'bg-red-100 text-red-600 animate-pulse' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatTime(timeRemaining)}
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col h-[600px]">
            {/* Persona Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <img 
                  src={`https://i.pravatar.cc/80?img=${currentPersona.id === 'rush' ? 1 : currentPersona.id === 'skeptic' ? 3 : currentPersona.id === 'loyalist' ? 5 : currentPersona.id === 'gatekeeper' ? 9 : 11}`}
                  alt={currentPersona.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-semibold text-[#1E3A5C]">{currentPersona.name}</h3>
                  <p className="text-sm text-gray-500">{currentPersona.title}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-[#F58220] text-white rounded-br-sm' 
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl rounded-bl-sm p-4">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Type your response..."
                  className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F58220]/50 focus:border-[#F58220]"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="px-6 py-3 bg-[#F58220] hover:bg-[#E86F10] rounded-xl font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Detailing: {currentDrug.name} ({currentDrug.indication})
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Feedback Stage
  if (stage === 'feedback' && feedback) {
    const scoreLabels: Record<string, string> = {
      opening: 'Opening',
      clinicalKnowledge: 'Clinical Knowledge',
      objectionHandling: 'Objection Handling',
      timeManagement: 'Time Management',
      compliance: 'Compliance',
      closing: 'Closing',
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F58220] to-[#E86F10] flex items-center justify-center font-bold text-white">
                Rx
              </div>
              <div className="text-center">
                <h1 className="font-bold text-[#1E3A5C]">PharmaRep Trainer</h1>
                <p className="text-xs text-gray-500">Session Results</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          {/* Overall Score */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
            <h2 className="text-xl font-medium text-gray-600 mb-4">Overall Performance</h2>
            <div className="flex items-center justify-center gap-6">
              <div className={`text-7xl font-bold ${getScoreColor(feedback.overall)}`}>
                {feedback.overall}
              </div>
              <div className="text-left">
                <div className={`text-3xl font-bold ${getScoreColor(feedback.overall)}`}>
                  {feedback.overall >= 90 ? 'A' : feedback.overall >= 80 ? 'B' : feedback.overall >= 70 ? 'C' : feedback.overall >= 60 ? 'D' : 'F'}
                </div>
                <div className="text-gray-500">
                  {feedback.overall >= 90 ? 'Excellent' : feedback.overall >= 80 ? 'Strong' : feedback.overall >= 70 ? 'Competent' : feedback.overall >= 60 ? 'Developing' : 'Needs Work'}
                </div>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-lg text-[#1E3A5C] mb-4">Score Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(feedback.scores).map(([key, value]) => (
                <div key={key} className={`p-4 rounded-xl border ${getScoreBg(value)}`}>
                  <div className={`text-2xl font-bold ${getScoreColor(value)}`}>{value}</div>
                  <div className="text-sm text-gray-600">{scoreLabels[key]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths */}
          {feedback.strengths.length > 0 && (
            <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6">
              <h3 className="font-semibold text-lg text-emerald-800 mb-3">💪 Strengths</h3>
              <ul className="space-y-2">
                {feedback.strengths.map((s, i) => (
                  <li key={i} className="text-emerald-700 flex gap-2">
                    <span>✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements */}
          {feedback.improvements.length > 0 && (
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6">
              <h3 className="font-semibold text-lg text-amber-800 mb-3">📈 Areas for Improvement</h3>
              <ul className="space-y-2">
                {feedback.improvements.map((s, i) => (
                  <li key={i} className="text-amber-700 flex gap-2">
                    <span>→</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pro Tip */}
          {feedback.tips && (
            <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
              <h3 className="font-semibold text-lg text-blue-800 mb-2">💡 Pro Tip</h3>
              <p className="text-blue-700">{feedback.tips}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setFeedback(null);
                hasEndedRef.current = false;
                startTraining();
              }}
              className="flex-1 py-4 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={resetTraining}
              className="flex-1 py-4 rounded-xl bg-[#F58220] hover:bg-[#E86F10] text-white font-medium transition-colors"
            >
              New Scenario
            </button>
          </div>
        </main>
      </div>
    );
  }

  return null;
}
