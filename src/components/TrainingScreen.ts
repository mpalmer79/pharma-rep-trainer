'use client';

import React, { useRef, useEffect } from 'react';
import { Message, Persona, Drug } from '@/types';
import { Send, Loader2 } from 'lucide-react';

interface TrainingScreenProps {
  messages: Message[];
  input: string;
  isLoading: boolean;
  persona: Persona;
  drug: Drug;
  onInputChange: (value: string) => void;
  onSend: () => void;
}

export default function TrainingScreen({
  messages,
  input,
  isLoading,
  persona,
  drug,
  onInputChange,
  onSend,
}: TrainingScreenProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden flex flex-col h-[600px]">
        {/* Persona Header */}
        <div className="p-4 border-b border-slate-700/50 bg-slate-800/80">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{persona.avatar}</span>
            <div>
              <h3 className="font-semibold">{persona.name}</h3>
              <p className="text-sm text-slate-400">{persona.title}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-blue-500 text-white rounded-br-sm' 
                  : 'bg-slate-700/50 text-slate-200 rounded-bl-sm'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-700/50 rounded-2xl rounded-bl-sm p-4">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-700/50 bg-slate-800/80">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your response..."
              className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <button
              onClick={onSend}
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-blue-500 rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">
            Detailing: {drug.name} ({drug.indication})
          </p>
        </div>
      </div>
    </div>
  );
}
