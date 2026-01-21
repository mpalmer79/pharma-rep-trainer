'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { ObjectionBank } from '@/components/ObjectionBank';
import { drugs } from '@/data/drugs';
import { personas } from '@/data/personas';
import { Shuffle, Clock, Infinity, Settings2 } from 'lucide-react';

interface SimulatorSectionProps {
  selectedDrug: string | null;
  selectedPersona: string | null;
  onDrugSelect: (drugId: string) => void;
  onPersonaSelect: (personaId: string) => void;
  onStartTraining: (customTimer?: number | null) => void;
}

type TimerMode = 'default' | 'custom' | 'unlimited';

export const SimulatorSection = ({
  selectedDrug,
  selectedPersona,
  onDrugSelect,
  onPersonaSelect,
  onStartTraining,
}: SimulatorSectionProps) => {
  const [timerMode, setTimerMode] = useState<TimerMode>('default');
  const [customMinutes, setCustomMinutes] = useState(3);
  const [showTimerSettings, setShowTimerSettings] = useState(false);
  const [showPrepSheet, setShowPrepSheet] = useState(false);

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

  const handleQuickPractice = () => {
    const randomDrug = drugs[Math.floor(Math.random() * drugs.length)];
    const randomPersona = personas[Math.floor(Math.random() * personas.length)];
    onDrugSelect(randomDrug.id);
    onPersonaSelect(randomPersona.id);
    // Start immediately with default timer
    setTimeout(() => {
      handleStartTraining();
    }, 300);
  };

  const handleStartTraining = () => {
    let customTimer: number | null = null;
    if (timerMode === 'custom') {
      customTimer = customMinutes * 60;
    } else if (timerMode === 'unlimited') {
      customTimer = -1; // -1 signals unlimited mode
    }
    onStartTraining(customTimer);
  };

  const selectedPersonaData = personas.find((p) => p.id === selectedPersona);
  const selectedDrugData = drugs.find((d) => d.id === selectedDrug);
  
  const getTimerDisplay = () => {
    if (timerMode === 'unlimited') return '∞ Unlimited';
    if (timerMode === 'custom') return `${customMinutes}:00 Custom`;
    if (selectedPersonaData) {
      const mins = Math.floor(selectedPersonaData.timerSeconds / 60);
      const secs = selectedPersonaData.timerSeconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')} Default`;
    }
    return 'Select persona';
  };

  // Auto-open prep sheet when both are selected
  const bothSelected = selectedDrug && selectedPersona;

  return (
    <section id="simulator" className="py-20 lg:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1B4D7A] mb-4">
            <span className="relative inline-block">
              Try RepIQ
              <span className="absolute bottom-0 left-0 w-full h-1 bg-[#E67E22]"></span>
            </span>{' '}
            Now
          </h2>
          <p className="text-lg text-gray-600">
            Select a product and physician persona to start your training simulation
          </p>
        </AnimatedSection>

        <AnimatedSection delay={200}>
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 sm:p-8">
            {/* Quick Practice Button */}
            <motion.button
              onClick={handleQuickPractice}
              className="w-full mb-8 py-4 px-6 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg"
              whileHover={{ scale: 1.02, boxShadow: '0 10px 40px rgba(139, 92, 246, 0.3)' }}
              whileTap={{ scale: 0.98 }}
            >
              <Shuffle className="w-6 h-6" />
              Quick Practice - Surprise Me!
            </motion.button>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-sm text-gray-500">or customize your session</span>
              </div>
            </div>

            {/* Product Selection */}
            <div className="mb-10">
              <h4 className="text-lg font-bold text-[#1B4D7A] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#E67E22] text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </span>
                Select Your Product
              </h4>
              <div className="grid gap-3">
                {drugs.map((drug) => (
                  <motion.button
                    key={drug.id}
                    onClick={() => onDrugSelect(drug.id)}
                    className={`p-4 sm:p-5 rounded-lg border-2 text-left transition-all ${
                      selectedDrug === drug.id
                        ? 'bg-blue-50 border-[#1B4D7A]'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <h5 className="font-semibold text-[#1B4D7A]">{drug.name}</h5>
                        <p className="text-sm text-gray-500">
                          {drug.category} • {drug.indication}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{drug.keyData}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedDrug === drug.id
                            ? 'border-[#1B4D7A] bg-[#1B4D7A]'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedDrug === drug.id && (
                          <span className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Persona Selection */}
            <div className="mb-10">
              <h4 className="text-lg font-bold text-[#1B4D7A] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#E67E22] text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </span>
                Select Your Physician
              </h4>
              <div className="grid gap-3">
                {personas.map((persona) => (
                  <motion.button
                    key={persona.id}
                    onClick={() => onPersonaSelect(persona.id)}
                    className={`p-4 sm:p-5 rounded-lg border-2 text-left transition-all ${
                      selectedPersona === persona.id
                        ? 'bg-blue-50 border-[#1B4D7A]'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex gap-4 items-start">
                      <img
                        src={getPersonaImage(persona.id)}
                        alt={persona.name}
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-semibold text-[#1B4D7A]">{persona.name}</h5>
                            <p className="text-sm text-[#E67E22] font-medium">{persona.title}</p>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              selectedPersona === persona.id
                                ? 'border-[#1B4D7A] bg-[#1B4D7A]'
                                : 'border-gray-300'
                            }`}
                          >
                            {selectedPersona === persona.id && (
                              <span className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{persona.description}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {Math.floor(persona.timerSeconds / 60)}:
                          {(persona.timerSeconds % 60).toString().padStart(2, '0')} time limit •{' '}
                          {persona.difficulty} difficulty
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Prep Sheet / Objection Bank */}
            <AnimatePresence>
              {bothSelected && selectedDrugData && selectedPersonaData && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-8 overflow-hidden"
                >
                  <ObjectionBank
                    drug={selectedDrugData}
                    persona={selectedPersonaData}
                    isOpen={showPrepSheet}
                    onToggle={() => setShowPrepSheet(!showPrepSheet)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Timer Settings */}
            <div className="mb-8">
              <button
                onClick={() => setShowTimerSettings(!showTimerSettings)}
                className="flex items-center gap-2 text-[#1B4D7A] font-medium hover:text-[#2D6A9F] transition-colors"
              >
                <Settings2 className="w-5 h-5" />
                Timer Settings
                <motion.span
                  animate={{ rotate: showTimerSettings ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  ▼
                </motion.span>
              </button>

              <AnimatePresence>
                {showTimerSettings && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex flex-wrap gap-3 mb-4">
                        <button
                          onClick={() => setTimerMode('default')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                            timerMode === 'default'
                              ? 'bg-[#1B4D7A] text-white'
                              : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <Clock className="w-4 h-4" />
                          Default
                        </button>
                        <button
                          onClick={() => setTimerMode('custom')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                            timerMode === 'custom'
                              ? 'bg-[#1B4D7A] text-white'
                              : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <Settings2 className="w-4 h-4" />
                          Custom
                        </button>
                        <button
                          onClick={() => setTimerMode('unlimited')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                            timerMode === 'unlimited'
                              ? 'bg-[#1B4D7A] text-white'
                              : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <Infinity className="w-4 h-4" />
                          Unlimited
                        </button>
                      </div>

                      {timerMode === 'custom' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-4"
                        >
                          <label className="text-sm text-gray-600">Duration:</label>
                          <input
                            type="range"
                            min={1}
                            max={10}
                            value={customMinutes}
                            onChange={(e) => setCustomMinutes(parseInt(e.target.value))}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1B4D7A]"
                          />
                          <span className="text-lg font-bold text-[#1B4D7A] min-w-[60px]">
                            {customMinutes} min
                          </span>
                        </motion.div>
                      )}

                      <div className="mt-4 text-sm text-gray-500">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Session timer: <span className="font-medium text-[#1B4D7A]">{getTimerDisplay()}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              onClick={handleStartTraining}
              disabled={!selectedDrug}
              className="w-full py-4 rounded-lg bg-[#E67E22] hover:bg-[#D35400] text-white font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: selectedDrug ? 1.02 : 1 }}
              whileTap={{ scale: selectedDrug ? 0.98 : 1 }}
            >
              START TRAINING SESSION
            </motion.button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default SimulatorSection;
