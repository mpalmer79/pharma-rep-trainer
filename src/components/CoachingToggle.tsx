'use client';

import { motion } from 'framer-motion';
import { Lightbulb, GraduationCap } from 'lucide-react';

interface CoachingToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  className?: string;
}

export default function CoachingToggle({ enabled, onToggle, className = '' }: CoachingToggleProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        <GraduationCap className="w-5 h-5 text-[#1B4D7A] dark:text-blue-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Coaching Mode
        </span>
      </div>
      
      <button
        onClick={() => onToggle(!enabled)}
        className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
          enabled 
            ? 'bg-green-500' 
            : 'bg-gray-300 dark:bg-gray-600'
        }`}
        aria-label={`Coaching mode ${enabled ? 'enabled' : 'disabled'}`}
      >
        <motion.div
          className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center"
          animate={{ left: enabled ? '32px' : '4px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <Lightbulb className={`w-3 h-3 ${enabled ? 'text-green-500' : 'text-gray-400'}`} />
        </motion.div>
      </button>
      
      {enabled && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xs text-green-600 dark:text-green-400 font-medium"
        >
          Real-time hints enabled
        </motion.span>
      )}
    </div>
  );
}

// Compact version for the training header
export function CoachingIndicator({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full"
    >
      <motion.div
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Lightbulb className="w-3 h-3 text-green-600 dark:text-green-400" />
      </motion.div>
      <span className="text-xs font-medium text-green-700 dark:text-green-400">
        Coaching
      </span>
    </motion.div>
  );
}
