'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Unlock, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { personas } from '@/data/personas';

interface UnlockNotificationProps {
  unlockedPersonaIds: string[];
  onDismiss: () => void;
}

export default function UnlockNotification({ unlockedPersonaIds, onDismiss }: UnlockNotificationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const unlockedPersonas = unlockedPersonaIds
    .map(id => personas.find(p => p.id === id))
    .filter(Boolean);

  const currentPersona = unlockedPersonas[currentIndex];

  // Auto-advance through multiple unlocks
  useEffect(() => {
    if (unlockedPersonas.length > 1 && currentIndex < unlockedPersonas.length - 1) {
      const timer = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, unlockedPersonas.length]);

  // Auto-dismiss after showing all
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300);
    }, unlockedPersonas.length * 3000 + 1000);
    return () => clearTimeout(timer);
  }, [unlockedPersonas.length, onDismiss]);

  if (!currentPersona) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4"
        >
          <div className="bg-gradient-to-r from-[#1B4D7A] to-[#2D6A9F] rounded-2xl shadow-2xl overflow-hidden">
            {/* Sparkle effects */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{ 
                    x: Math.random() * 100 + '%', 
                    y: Math.random() * 100 + '%',
                    scale: 0,
                    opacity: 0 
                  }}
                  animate={{ 
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    delay: i * 0.3,
                    ease: 'easeInOut'
                  }}
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                </motion.div>
              ))}
            </div>

            <div className="relative p-4">
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onDismiss, 300);
                }}
                className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-white/70" />
              </button>

              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center"
                >
                  <Unlock className="w-7 h-7 text-white" />
                </motion.div>

                <div className="flex-1">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="text-yellow-300 text-xs font-semibold uppercase tracking-wider mb-0.5">
                      🎉 New Persona Unlocked!
                    </div>
                    <div className="text-white font-bold text-lg">
                      {currentPersona.name}
                    </div>
                    <div className="text-white/70 text-sm">
                      {currentPersona.difficulty} difficulty
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Progress dots for multiple unlocks */}
              {unlockedPersonas.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-3">
                  {unlockedPersonas.map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i === currentIndex ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
