'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Lock, CheckCircle, Circle, Trophy, Target, Flame, Star } from 'lucide-react';
import { UnlockRequirement } from '@/hooks/useProgressionSystem';

interface LockedPersonaOverlayProps {
  personaName: string;
  requirements: UnlockRequirement[];
  progress: number;
  onClose: () => void;
  isRequirementMet: (req: UnlockRequirement) => boolean;
  getRequirementProgress: (req: UnlockRequirement) => number;
}

const requirementIcons: Record<string, React.ElementType> = {
  score: Target,
  sessions: Trophy,
  streak: Flame,
  persona_mastery: Star,
};

export default function LockedPersonaOverlay({
  personaName,
  requirements,
  progress,
  onClose,
  isRequirementMet,
  getRequirementProgress,
}: LockedPersonaOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-700 to-gray-900 p-6 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">
            {personaName} is Locked
          </h3>
          <p className="text-gray-300 text-sm">
            Complete the following to unlock this persona
          </p>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">Overall Progress</span>
            <span className="font-semibold text-[#1B4D7A] dark:text-blue-400">{progress}%</span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="h-full bg-gradient-to-r from-[#1B4D7A] to-[#E67E22] rounded-full"
            />
          </div>
        </div>

        {/* Requirements List */}
        <div className="p-6 space-y-4">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm uppercase tracking-wide">
            Requirements
          </h4>
          
          {requirements.map((req, index) => {
            const isMet = isRequirementMet(req);
            const reqProgress = getRequirementProgress(req);
            const Icon = requirementIcons[req.type] || Target;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  isMet 
                    ? 'bg-green-50 dark:bg-green-900/20' 
                    : 'bg-gray-50 dark:bg-gray-700/50'
                }`}
              >
                <div className={`mt-0.5 ${isMet ? 'text-green-500' : 'text-gray-400 dark:text-gray-500'}`}>
                  {isMet ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-4 h-4 ${isMet ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`} />
                    <span className={`text-sm font-medium ${
                      isMet 
                        ? 'text-green-700 dark:text-green-300' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {req.description}
                    </span>
                  </div>
                  
                  {!isMet && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{Math.round(reqProgress)}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${reqProgress}%` }}
                          transition={{ duration: 0.3, delay: 0.2 + (0.1 * index) }}
                          className="h-full bg-[#E67E22] rounded-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#1B4D7A] hover:bg-[#0F2D44] text-white font-semibold rounded-xl transition-colors"
          >
            Got It
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
