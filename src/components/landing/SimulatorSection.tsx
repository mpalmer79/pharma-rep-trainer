'use client';

import { motion } from 'framer-motion';
import { drugs } from '@/data/drugs';
import { personas } from '@/data/personas';
import { useState } from 'react';
import { Clock, Infinity, ChevronDown, ChevronUp } from 'lucide-react';
import ObjectionBank from '@/components/ObjectionBank';
import CoachingToggle from '@/components/CoachingToggle';

interface SimulatorSectionProps {
  selectedDrug: string | null;
  selectedPersona: string | null;
  onDrugSelect: (drugId: string) => void;
  onPersonaSelect: (personaId: string) => void;
  onStartTraining: (customTimer?: number | null, coachingEnabled?: boolean) => void;
}

export const SimulatorSection = ({
  selectedDrug,
  selectedPersona,
  onDrugSelect,
  onPersonaSelect,
  onStartTraining,
}: SimulatorSectionProps) => {
  const [showTimerOptions, setShowTimerOptions] = useState(false);
  const [customTimer, setCustomTimer] = useState<number | null>(null);
  const [coachingEnabled, setCoachingEnabled] = useState(true);

  const selectedPersonaData = personas.find(p => p.id === selectedPersona);
  const defaultTimer = selectedPersonaData?.timerSeconds || 180;

  const timerPresets = [
    { label: '1 min', value: 60 },
    { label: '2 min', value: 120 },
    { label: '3 min', value: 180 },
    { label: '5 min', value: 300 },
    { label: 'Unlimited', value: -1 },
  ];

  const getActiveTimer = () => {
    if (customTimer === -1) return 'Unlimited';
    if (customTimer) return `${Math.floor(customTimer / 60)}:${(customTimer % 60).toString().padStart(2, '0')}`;
    return `${Math.floor(defaultTimer / 60)}:${(defaultTimer % 60).toString().padStart(2, '0')}`;
  };

  const handleStartTraining = () => {
    onStartTraining(customTimer, coachingEnabled);
  };

  return (
    <section id="simulator" className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#1B4D7A] dark:text-white mb-4">
            Try the Simulator
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Select a product and physician persona to begin your practice session
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Drug Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">1. Select Product</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {drugs.map((drug) => (
                <motion.button
                  key={drug.id}
                  onClick={() => onDrugSelect(drug.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedDrug === drug.id
                      ? 'border-[#E67E22] bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-[#E67E22]/50 bg-white dark:bg-gray-800'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="font-semibold text-[#1B4D7A] dark:text-white">{drug.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{drug.category}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{drug.indication}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Persona Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">2. Select Physician Persona</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {personas.map((persona) => (
                <motion.button
                  key={persona.id}
                  onClick={() => onPersonaSelect(persona.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedPersona === persona.id
                      ? 'border-[#1B4D7A] bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-[#1B4D7A]/50 bg-white dark:bg-gray-800'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-[#1B4D7A] dark:text-white">{persona.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      persona.difficulty === 'Hard' 
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                        : persona.difficulty === 'Medium'
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    }`}>
                      {persona.difficulty}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{persona.title}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">{persona.description}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Objection Bank - Shows when drug AND persona are selected */}
          {selectedDrug && selectedPersona && (
            <ObjectionBank
              personaId={selectedPersona}
              drugId={selectedDrug}
            />
          )}

          {/* Timer & Coaching Options */}
          {selectedDrug && selectedPersona && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-8"
            >
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">3. Session Settings</h3>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
                {/* Timer Settings */}
                <div>
                  <button
                    onClick={() => setShowTimerOptions(!showTimerOptions)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <div className="flex items-center gap-3">
                      {customTimer === -1 ? (
                        <Infinity className="w-5 h-5 text-[#1B4D7A] dark:text-blue-400" />
                      ) : (
                        <Clock className="w-5 h-5 text-[#1B4D7A] dark:text-blue-400" />
                      )}
                      <div>
                        <div className="font-medium text-gray-800 dark:text-gray-200">Session Timer</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {getActiveTimer()} {!customTimer && '(default for this persona)'}
                        </div>
                      </div>
                    </div>
                    {showTimerOptions ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {showTimerOptions && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 flex flex-wrap gap-2"
                    >
                      {timerPresets.map((preset) => (
                        <button
                          key={preset.value}
                          onClick={() => setCustomTimer(preset.value === defaultTimer ? null : preset.value)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            (customTimer === preset.value) || (!customTimer && preset.value === defaultTimer)
                              ? 'bg-[#1B4D7A] text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 dark:border-gray-700" />

                {/* Coaching Toggle */}
                <CoachingToggle
                  enabled={coachingEnabled}
                  onToggle={setCoachingEnabled}
                />
                
                {coachingEnabled && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 ml-7">
                    Get real-time tips and suggestions based on your conversation. Recommended for beginners.
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* Start Button */}
          <motion.button
            onClick={handleStartTraining}
            disabled={!selectedDrug || !selectedPersona}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              selectedDrug && selectedPersona
                ? 'bg-[#E67E22] hover:bg-[#D35400] text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
            whileHover={selectedDrug && selectedPersona ? { scale: 1.02 } : {}}
            whileTap={selectedDrug && selectedPersona ? { scale: 0.98 } : {}}
          >
            {selectedDrug && selectedPersona ? 'Start Training Session' : 'Select Product & Persona to Begin'}
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default SimulatorSection;
