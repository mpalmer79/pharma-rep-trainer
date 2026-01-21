'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, AlertTriangle, Bell, MessageSquare, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface CoachingHintProps {
  hint: {
    id: string;
    type: 'tip' | 'warning' | 'reminder' | 'suggestion';
    title: string;
    message: string;
    priority: number;
  } | null;
  onDismiss: () => void;
  minimized?: boolean;
  onToggleMinimize?: () => void;
}

const hintStyles = {
  tip: {
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    border: 'border-blue-200 dark:border-blue-800',
    icon: Lightbulb,
    iconColor: 'text-blue-500 dark:text-blue-400',
    titleColor: 'text-blue-800 dark:text-blue-300',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-900/30',
    border: 'border-amber-200 dark:border-amber-800',
    icon: AlertTriangle,
    iconColor: 'text-amber-500 dark:text-amber-400',
    titleColor: 'text-amber-800 dark:text-amber-300',
  },
  reminder: {
    bg: 'bg-purple-50 dark:bg-purple-900/30',
    border: 'border-purple-200 dark:border-purple-800',
    icon: Bell,
    iconColor: 'text-purple-500 dark:text-purple-400',
    titleColor: 'text-purple-800 dark:text-purple-300',
  },
  suggestion: {
    bg: 'bg-green-50 dark:bg-green-900/30',
    border: 'border-green-200 dark:border-green-800',
    icon: MessageSquare,
    iconColor: 'text-green-500 dark:text-green-400',
    titleColor: 'text-green-800 dark:text-green-300',
  },
};

export default function CoachingHint({ hint, onDismiss, minimized = false, onToggleMinimize }: CoachingHintProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!hint) return null;

  const style = hintStyles[hint.type];
  const Icon = style.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={hint.id}
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={`${style.bg} ${style.border} border rounded-xl shadow-lg overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${style.iconColor}`} />
            <span className={`text-sm font-semibold ${style.titleColor}`}>
              {hint.title}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              )}
            </button>
            <button
              onClick={onDismiss}
              className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="px-3 pb-3">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {hint.message}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

// Compact coaching badge for the header
export function CoachingBadge({ enabled, hintCount }: { enabled: boolean; hintCount: number }) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
        enabled
          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
      }`}
    >
      <Lightbulb className="w-3 h-3" />
      <span>Coach {enabled ? 'ON' : 'OFF'}</span>
      {enabled && hintCount > 0 && (
        <span className="bg-green-500 text-white px-1.5 rounded-full text-xs">
          {hintCount}
        </span>
      )}
    </motion.div>
  );
}
