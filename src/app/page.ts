'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Header, SetupScreen, TrainingScreen, FeedbackScreen } from '@/components';
import { drugs } from '@/data/drugs';
import { personas, getPersonaById } from '@/data/personas';
import { getDrugById } from '@/data/drugs';
import { Message, Feedback, Stage } from '@/types';

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
        // Fallback to local scoring
        setFeedback(generateLocalFeedback());
      }
    } catch {
      setFeedback(generateLocalFeedback());
    }
    
    setStage('feedback');
  }, [messages, selectedDrug, selectedPersona]);

  const handleTimeUp = useCallback(() => {
    setIsTimerRunning(false);
    const persona = getPersonaById(selectedPersona);
    
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `*looks at watch* I'm sorry, I really have to go - my next patient is waiting. ${prev.length < 4 ? "We barely got started. Maybe schedule more time next visit?" : "Thanks for stopping by."}`,
    }]);
    
    setTimeout(() => generateFeedback(), 1000);
  }, [selectedPersona, generateFeedback]);

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
        // Fallback response if API fails
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "I see. Tell me more about how this would benefit my patients." 
        }]);
      }
    } catch {
      // Fallback response
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

  const retryScenario = () => {
    setFeedback(null);
    hasEndedRef.current = false;
    startTraining();
  };

  const newScenario = () => {
    setSelectedDrug('');
    setSelectedPersona('rush');
    resetTraining();
  };

  const currentPersona = getPersonaById(selectedPersona);
  const currentDrug = getDrugById(selectedDrug);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Header 
        timeRemaining={timeRemaining} 
        showTimer={stage === 'training'} 
      />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {stage === 'setup' && (
          <SetupScreen
            drugs={drugs}
            personas={personas}
            selectedDrug={selectedDrug}
            selectedPersona={selectedPersona}
            onDrugSelect={setSelectedDrug}
            onPersonaSelect={setSelectedPersona}
            onStart={startTraining}
          />
        )}

        {stage === 'training' && currentPersona && currentDrug && (
          <TrainingScreen
            messages={messages}
            input={input}
            isLoading={isLoading}
            persona={currentPersona}
            drug={currentDrug}
            onInputChange={setInput}
            onSend={sendMessage}
          />
        )}

        {stage === 'feedback' && feedback && (
          <FeedbackScreen
            feedback={feedback}
            onRetry={retryScenario}
            onNewScenario={newScenario}
          />
        )}
      </main>
    </div>
  );
}
