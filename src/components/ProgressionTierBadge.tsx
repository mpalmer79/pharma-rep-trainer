'use client';

import { motion } from 'framer-motion';
import { Award, Star, Zap, Crown } from 'lucide-react';

interface ProgressionTierBadgeProps {
  tier: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  progress: number;
  compact?: boolean;
}

const tierConfig = {
  Beginner: {
    icon: Star,
    color: 'text-gray-500',
    bg: 'bg-gray-100 dark:bg-gray-700',
    border: 'border-gray-300 dark:border-gray-600',
    gradient: 'from-gray-400 to-gray-500',
  },
  Intermediate: {
    icon: Zap,
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-300 dark:border-blue-700',
    gradient: 'from-blue-400 to-blue-600',
  },
  Advanced: {
    icon: Award,
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-300 dark:border-purple-700',
    gradient: 'from-purple-400 to-purple-600',
  },
  Expert: {
    icon: Crown,
    color: 'text-yellow-500',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-300 dark:border-yellow-700',
    gradient: 'from-yellow-400 to-yellow-600',
  },
};

export default function ProgressionTierBadge({ tier, progress, compact = false }: ProgressionTierBadgeProps) {
  const config = tierConfig[tier];
  const Icon = config.icon;

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${config.bg} border ${config.border}`}>
        <Icon className={`w-3.5 h-3.5 ${config.color}`} />
        <span className={`text-xs font-semibold ${config.color}`}>{tier}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-4 rounded-xl ${config.bg} border ${config.border}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Current Tier</div>
          <div className={`text-lg font-bold ${config.color}`}>{tier}</div>
        </div>
      </div>

      {tier !== 'Expert' && (
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Progress to next tier</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full bg-gradient-to-r ${config.gradient} rounded-full`}
            />
          </div>
        </div>
      )}

      {tier === 'Expert' && (
        <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
          🏆 Maximum tier reached!
        </div>
      )}
    </motion.div>
  );
}
