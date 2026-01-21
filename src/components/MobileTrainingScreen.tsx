'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Persona } from '@/types';
import { Drug } from '@/types';

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

const getPersonaImage = (personaId: string) => {
  const imageMap: Record<string, string> = {
    rush: '1559839734-2b71ea197ec2',
    skeptic: '1612349317150-e413f6a5b16d',
    loyalist: '1594824476967-48c8b964273f',
    gatekeeper: '1573496359142-b8d87734a5a2',
    curious: '1537368910025-700350fe46c7',
  };
  return `https://images.unsplash.com/photo-${
    imageMap[personaId] || '1537368910025-700350fe46c7'
  }?w=100&h=100&fit=crop&crop=face`;
};

// Typing Indicator Component
const TypingIndicator = ({ personaName }: { personaName: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-start gap-3 mb-4"
    >
      <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
      <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-500 mr-2">{personaName} is typing</span>
          <motion.span
            className="w-2 h-2 bg-gray-400 rounded-full"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
          />
          <motion.span
            className="w-2 h-2 bg-gray-400 rounded-full"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
          />
          <motion.span
            className="w-2 h-2 bg-gray-400 rounded-full"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
          />
        </div>
      </div>
    </motion.div>
  );
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
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages change or when loading
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const timerColor =
    timeRemaining === -1
      ? 'text-blue-600'
      : timeRemaining <= 30
      ? 'text-red-600'
      : timeRemaining <= 60
      ? 'text-amber-600'
      : 'text-[#1B4D7A]';

  const timerBg =
    timeRemaining === -1
      ? 'bg-blue-50'
      : timeRemaining <= 30
      ? 'bg-red-50'
      : timeRemaining <= 60
      ? 'bg-amber-50'
      : 'bg-gray-100';

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between safe-top">
        <div className="flex items-center gap-3">
          <img
            src={getPersonaImage(currentPersona.id)}
            alt={currentPersona.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h2 className="font-semibold text-[#1B4D7A] text-sm">{currentPersona.name}</h2>
            <p className="text-xs text-gray-500">{currentDrug.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-full ${timerBg}`}>
            <span className={`font-mono font-bold ${timerColor}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
          <button
            onClick={onEndTraining}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            End
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-start gap-3 mb-4 ${
                message.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              {message.role === 'assistant' ? (
                <img
                  src={getPersonaImage(currentPersona.id)}
                  alt={currentPersona.name}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#1B4D7A] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">You</span>
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-[#1B4D7A] text-white rounded-tr-sm'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isLoading && <TypingIndicator personaName={currentPersona.name} />}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 safe-bottom">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isLoading}
              rows={1}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1B4D7A] focus:border-transparent resize-none text-sm disabled:bg-gray-50 disabled:text-gray-400"
              style={{ maxHeight: '120px' }}
            />
          </div>
          <motion.button
            onClick={onSendMessage}
            disabled={isLoading || !input.trim()}
            className="p-3 bg-[#E67E22] hover:bg-[#D35400] text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </motion.button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
