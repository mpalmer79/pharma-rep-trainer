'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X } from 'lucide-react';
import { Persona } from '@/types';
import { Drug } from '@/types';
import { useSound } from '@/hooks/useSound';
import { useVoiceInput } from '@/hooks/useVoiceInput';

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
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">{personaName} is typing</span>
          <motion.span
            className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
          />
          <motion.span
            className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
          />
          <motion.span
            className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
          />
        </div>
      </div>
    </motion.div>
  );
};

// Voice Recording Indicator
const VoiceRecordingIndicator = ({ 
  interimTranscript, 
  onCancel 
}: { 
  interimTranscript: string;
  onCancel: () => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-full left-0 right-0 mb-2 mx-4"
    >
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <motion.div
              className="w-3 h-3 bg-red-500 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-red-600 dark:text-red-400 font-medium text-sm">Listening...</span>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-red-500 dark:text-red-400" />
          </button>
        </div>
        {interimTranscript && (
          <p className="text-gray-700 dark:text-gray-300 text-sm italic">"{interimTranscript}"</p>
        )}
        {!interimTranscript && (
          <p className="text-gray-400 dark:text-gray-500 text-sm">Speak now...</p>
        )}
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
  const { playSound } = useSound({ volume: 0.5 });
  
  // Track which warnings have been played
  const [warning30Played, setWarning30Played] = useState(false);
  const [warning10Played, setWarning10Played] = useState(false);
  const prevTimeRef = useRef(timeRemaining);

  // Voice input hook
  const {
    isListening,
    isSupported: isVoiceSupported,
    interimTranscript,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    error: voiceError,
  } = useVoiceInput({
    continuous: true,
    language: 'en-US',
  });

  // Update input when voice transcript changes
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript, setInput]);

  // Play session start sound on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      playSound('sessionStart');
    }, 300);
    return () => clearTimeout(timer);
  }, [playSound]);

  // Timer warning sounds
  useEffect(() => {
    // Skip for unlimited mode
    if (timeRemaining === -1) return;

    // 30-second warning
    if (timeRemaining <= 30 && timeRemaining > 10 && !warning30Played && prevTimeRef.current > 30) {
      playSound('warning30');
      setWarning30Played(true);
    }
    
    // 10-second warning
    if (timeRemaining <= 10 && timeRemaining > 0 && !warning10Played && prevTimeRef.current > 10) {
      playSound('warning10');
      setWarning10Played(true);
    }
    
    // Tick sound for final 5 seconds
    if (timeRemaining <= 5 && timeRemaining > 0 && prevTimeRef.current !== timeRemaining) {
      playSound('tick');
    }

    prevTimeRef.current = timeRemaining;
  }, [timeRemaining, warning30Played, warning10Played, playSound]);

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
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (input.trim() && !isLoading) {
      playSound('messageSent');
      onSendMessage();
      resetTranscript();
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
      // If there's a transcript, it will be in the input field
    } else {
      resetTranscript();
      setInput('');
      startListening();
    }
  };

  const handleVoiceCancel = () => {
    stopListening();
    resetTranscript();
    setInput('');
  };

  const timerColor =
    timeRemaining === -1
      ? 'text-blue-600 dark:text-blue-400'
      : timeRemaining <= 10
      ? 'text-red-600 dark:text-red-400 animate-pulse'
      : timeRemaining <= 30
      ? 'text-red-600 dark:text-red-400'
      : timeRemaining <= 60
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-[#1B4D7A] dark:text-blue-400';

  const timerBg =
    timeRemaining === -1
      ? 'bg-blue-50 dark:bg-blue-900/30'
      : timeRemaining <= 10
      ? 'bg-red-100 dark:bg-red-900/30'
      : timeRemaining <= 30
      ? 'bg-red-50 dark:bg-red-900/20'
      : timeRemaining <= 60
      ? 'bg-amber-50 dark:bg-amber-900/20'
      : 'bg-gray-100 dark:bg-gray-800';

  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between safe-top">
        <div className="flex items-center gap-3">
          <img
            src={getPersonaImage(currentPersona.id)}
            alt={currentPersona.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h2 className="font-semibold text-[#1B4D7A] dark:text-white text-sm">{currentPersona.name}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{currentDrug.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-full ${timerBg} transition-colors`}>
            <span className={`font-mono font-bold ${timerColor} transition-colors`}>
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

      {/* Low time warning banner */}
      <AnimatePresence>
        {timeRemaining !== -1 && timeRemaining <= 10 && timeRemaining > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-500 text-white text-center py-2 text-sm font-semibold overflow-hidden"
          >
            ⚠️ Time running out! Wrap up your conversation.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice error banner */}
      <AnimatePresence>
        {voiceError && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-amber-500 text-white text-center py-2 text-sm font-medium overflow-hidden"
          >
            🎤 {voiceError}
          </motion.div>
        )}
      </AnimatePresence>

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
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-sm shadow-sm'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isLoading && <TypingIndicator personaName={currentPersona.name.startsWith('Dr.') ? `Dr. ${currentPersona.name.split(' ').pop()}` : currentPersona.name.split(' ')[0]} />}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3 safe-bottom relative">
        {/* Voice Recording Indicator */}
        <AnimatePresence>
          {isListening && (
            <VoiceRecordingIndicator
              interimTranscript={interimTranscript || input}
              onCancel={handleVoiceCancel}
            />
          )}
        </AnimatePresence>

        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening..." : "Type or tap 🎤 to speak..."}
              disabled={isLoading || isListening}
              rows={1}
              className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1B4D7A] dark:focus:ring-blue-500 focus:border-transparent resize-none text-sm disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${
                isListening ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'
              }`}
              style={{ maxHeight: '120px' }}
            />
          </div>

          {/* Voice Input Button */}
          {isVoiceSupported && (
            <motion.button
              onClick={handleVoiceToggle}
              disabled={isLoading}
              className={`p-3 rounded-full transition-colors flex-shrink-0 ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              whileTap={{ scale: 0.95 }}
              animate={isListening ? { scale: [1, 1.1, 1] } : {}}
              transition={isListening ? { duration: 1, repeat: Infinity } : {}}
            >
              {isListening ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </motion.button>
          )}

          {/* Send Button */}
          <motion.button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim() || isListening}
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

        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {isVoiceSupported 
              ? 'Enter to send • 🎤 for voice input'
              : 'Press Enter to send • Shift+Enter for new line'
            }
          </p>
          {isVoiceSupported && !isListening && (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Tap mic to speak
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
