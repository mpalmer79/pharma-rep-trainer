'use client';

import { useState, useEffect, useRef, useCallback, TouchEvent } from 'react';
import { Drug } from '@/types';
import { Persona } from '@/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface MobileTrainingScreenProps {
  currentPersona: Persona;
  currentDrug: Drug;
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  timeRemaining: number;
  onSendMessage: () => void;
  onEndTraining: () => void;
  formatTime: (seconds: number) => string;
}

// Haptic feedback utility
const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'warning' | 'error') => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    const patterns: Record<string, number | number[]> = {
      light: 10,
      medium: 25,
      heavy: 50,
      warning: [50, 50, 50],
      error: [100, 30, 100, 30, 100],
    };
    navigator.vibrate(patterns[type]);
  }
};

// Get persona image URL
const getPersonaImage = (personaId: string): string => {
  const imageMap: Record<string, string> = {
    'rush': '1559839734-2b71ea197ec2',
    'skeptic': '1612349317150-e413f6a5b16d',
    'loyalist': '1594824476967-48c8b964273f',
    'gatekeeper': '1573496359142-b8d87734a5a2',
    'curious': '1537368910025-700350fe46c7',
  };
  return `https://images.unsplash.com/photo-${imageMap[personaId] || imageMap['curious']}?w=100&h=100&fit=crop&crop=face`;
};

export default function MobileTrainingScreen({
  currentPersona,
  currentDrug,
  messages,
  input,
  setInput,
  isLoading,
  timeRemaining,
  onSendMessage,
  onEndTraining,
  formatTime,
}: MobileTrainingScreenProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Swipe gesture state
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  
  // Timer warning state
  const [hasWarned30, setHasWarned30] = useState(false);
  const [hasWarned10, setHasWarned10] = useState(false);
  const [timerPulse, setTimerPulse] = useState(false);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Hide swipe hint after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowSwipeHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Haptic feedback on timer warnings
  useEffect(() => {
    if (timeRemaining === 30 && !hasWarned30) {
      triggerHaptic('warning');
      setHasWarned30(true);
      setTimerPulse(true);
      setTimeout(() => setTimerPulse(false), 1000);
    }
    if (timeRemaining === 10 && !hasWarned10) {
      triggerHaptic('error');
      setHasWarned10(true);
    }
    if (timeRemaining <= 10 && timeRemaining > 0) {
      triggerHaptic('light');
    }
  }, [timeRemaining, hasWarned30, hasWarned10]);

  // Swipe gesture handlers
  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    // Only track swipe if at top of chat
    if (chatContainerRef.current && chatContainerRef.current.scrollTop <= 5) {
      touchStartY.current = e.touches[0].clientY;
      touchStartTime.current = Date.now();
      setIsSwipeActive(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (!isSwipeActive) return;
    
    const currentY = e.touches[0].clientY;
    const distance = currentY - touchStartY.current;
    
    // Only track downward swipes
    if (distance > 0) {
      setSwipeDistance(Math.min(distance, 150));
      
      // Haptic feedback at threshold
      if (distance >= 100 && swipeDistance < 100) {
        triggerHaptic('medium');
      }
    }
  }, [isSwipeActive, swipeDistance]);

  const handleTouchEnd = useCallback(() => {
    if (swipeDistance >= 100) {
      // Trigger end session
      triggerHaptic('heavy');
      onEndTraining();
    }
    
    setSwipeDistance(0);
    setIsSwipeActive(false);
  }, [swipeDistance, onEndTraining]);

  // Handle send with haptic
  const handleSend = useCallback(() => {
    if (input.trim() && !isLoading) {
      triggerHaptic('light');
      onSendMessage();
    }
  }, [input, isLoading, onSendMessage]);

  // Calculate swipe indicator opacity
  const swipeOpacity = Math.min(swipeDistance / 100, 1);
  const swipeScale = 0.8 + (swipeOpacity * 0.2);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Swipe-to-end indicator */}
      <div 
        className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-center transition-all duration-200 pointer-events-none"
        style={{
          height: `${Math.max(swipeDistance, 0)}px`,
          opacity: swipeOpacity,
          background: `linear-gradient(to bottom, rgba(220, 38, 38, ${swipeOpacity * 0.9}), transparent)`,
        }}
      >
        <div 
          className="flex flex-col items-center text-white transition-transform"
          style={{ transform: `scale(${swipeScale})` }}
        >
          <svg 
            className="w-8 h-8 mb-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 14l-7 7m0 0l-7-7m7 7V3" 
            />
          </svg>
          <span className="text-sm font-semibold">
            {swipeDistance >= 100 ? 'Release to End' : 'Pull to End Session'}
          </span>
        </div>
      </div>

      {/* Header - Larger touch targets */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm safe-area-top">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#1B4D7A] to-[#2D6A9F] flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <div>
              <h1 className="font-bold text-[#1B4D7A] text-base sm:text-lg">RepIQ</h1>
              <p className="text-xs text-gray-500">Training Session</p>
            </div>
          </div>
          
          {/* Timer - Larger, more visible */}
          <div 
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-mono text-xl sm:text-2xl font-bold transition-all ${
              timeRemaining <= 10 
                ? 'bg-red-500 text-white animate-pulse' 
                : timeRemaining <= 30 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-gray-100 text-gray-700'
            } ${timerPulse ? 'scale-110' : ''}`}
          >
            {timeRemaining <= 30 && (
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {formatTime(timeRemaining)}
          </div>
        </div>
      </header>

      {/* Swipe hint banner */}
      {showSwipeHint && (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center justify-center gap-2 text-blue-700 text-sm animate-pulse sm:hidden">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          <span>Pull down from top to end session</span>
        </div>
      )}

      {/* Main content area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto overscroll-contain"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          {/* Persona card - More compact on mobile */}
          <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 flex items-center gap-3 sm:gap-4 shadow-sm">
            <img 
              src={getPersonaImage(currentPersona.id)}
              alt={currentPersona.name}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[#1B4D7A] text-sm sm:text-base truncate">
                {currentPersona.name}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 truncate">{currentPersona.title}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-gray-400">Product</p>
              <p className="font-medium text-[#E67E22] text-sm sm:text-base">{currentDrug.name}</p>
            </div>
          </div>

          {/* Difficulty indicator */}
          <div className="flex items-center justify-center gap-2 mb-4 sm:hidden">
            <span className="text-xs text-gray-500">Difficulty:</span>
            <div className="flex gap-1">
              {['easy', 'medium', 'hard'].map((level, i) => (
                <div
                  key={level}
                  className={`w-2 h-2 rounded-full ${
                    (currentPersona.difficulty === 'easy' && i === 0) ||
                    (currentPersona.difficulty === 'medium' && i <= 1) ||
                    (currentPersona.difficulty === 'hard')
                      ? currentPersona.difficulty === 'easy' 
                        ? 'bg-green-500' 
                        : currentPersona.difficulty === 'medium' 
                          ? 'bg-amber-500' 
                          : 'bg-red-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-gray-600 capitalize">
              {currentPersona.difficulty}
            </span>
          </div>

          {/* Messages - Larger touch targets */}
          <div className="space-y-3 sm:space-y-4 min-h-[300px] sm:min-h-[400px]">
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] sm:max-w-[80%] p-3.5 sm:p-4 rounded-2xl text-[15px] sm:text-base leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#1B4D7A] text-white rounded-tr-md'
                      : 'bg-white border border-gray-200 text-gray-700 rounded-tl-md shadow-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md p-4 shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input area - Fixed at bottom, larger touch targets */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          {/* Character count hint */}
          {input.length > 0 && (
            <div className="flex justify-end mb-1 px-1">
              <span className={`text-xs ${input.length > 300 ? 'text-amber-500' : 'text-gray-400'}`}>
                {input.length} characters
                {input.length > 300 && ' (consider being more concise)'}
              </span>
            </div>
          )}
          
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-1.5 sm:p-2 flex gap-2 items-end">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your response..."
              className="flex-1 px-3 sm:px-4 py-3 sm:py-3.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B4D7A]/20 focus:border-[#1B4D7A] text-base"
              style={{ fontSize: '16px' }} // Prevents iOS zoom
              autoComplete="off"
              autoCorrect="on"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="flex-shrink-0 w-14 h-12 sm:w-auto sm:h-auto sm:px-6 sm:py-3.5 bg-[#E67E22] hover:bg-[#D35400] active:bg-[#C44D00] text-white font-semibold rounded-lg disabled:opacity-50 disabled:active:bg-[#E67E22] transition-colors flex items-center justify-center touch-manipulation"
              aria-label="Send message"
            >
              {/* Send icon for mobile, text for desktop */}
              <svg className="w-6 h-6 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>

          {/* End session button - Larger on mobile */}
          <button
            onClick={() => {
              triggerHaptic('medium');
              onEndTraining();
            }}
            className="w-full mt-3 py-3.5 sm:py-3 border-2 border-gray-300 text-gray-600 font-medium rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation text-base"
          >
            End Session Early
          </button>
          
          {/* Quick tips - Mobile only */}
          <div className="mt-3 sm:hidden">
            <p className="text-xs text-gray-400 text-center">
              💡 Tip: Keep responses concise for time-pressed physicians
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
