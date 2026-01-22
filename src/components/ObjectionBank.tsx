'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  Target, 
  Lightbulb, 
  BookOpen,
  CheckCircle2,
  XCircle,
  Sparkles
} from 'lucide-react';
import { drugs } from '@/data/drugs';
import { personas } from '@/data/personas';
import {
  getObjectionsForPersona,
  getTalkingPointsForDrug,
  getStrategyForPersona,
  getExampleExchange,
  Objection,
  DrugTalkingPoint,
} from '@/data/ObjectionBank';

interface ObjectionBankProps {
  personaId: string;
  drugId: string;
}

export const ObjectionBank = ({ personaId, drugId }: ObjectionBankProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'objections' | 'talking' | 'strategy' | 'example'>('strategy');

  const persona = personas.find(p => p.id === personaId);
  const drug = drugs.find(d => d.id === drugId);

  if (!persona || !drug) return null;

  const objections = getObjectionsForPersona(personaId);
  const talkingPoints = getTalkingPointsForDrug(drugId);
  const strategy = getStrategyForPersona(personaId);
  const exampleExchange = getExampleExchange(personaId);

  const tabs = [
    { id: 'strategy', label: 'Strategy', icon: Target, count: null },
    { id: 'objections', label: 'Objections', icon: MessageSquare, count: objections.length },
    { id: 'talking', label: 'Talking Points', icon: Lightbulb, count: talkingPoints.length },
    { id: 'example', label: 'Example', icon: BookOpen, count: null },
  ];

  return (
    <div className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-blue-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-blue-100/50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-[#1B4D7A] dark:text-white">Prep Sheet</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {persona.name} + {drug.name}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </motion.div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* Tabs */}
            <div className="px-4 border-t border-blue-200 dark:border-gray-700">
              <div className="flex gap-1 pt-3 pb-2 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[#1B4D7A] text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                    {tab.count !== null && tab.count > 0 && (
                      <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                        activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="px-4 pb-4 max-h-80 overflow-y-auto">
              {/* Strategy Tab */}
              {activeTab === 'strategy' && strategy && (
                <div className="space-y-4 pt-3">
                  {/* Opening Tip */}
                  <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">OPENING TIP</p>
                    <p className="text-sm text-green-800 dark:text-green-300">{strategy.openingTip}</p>
                  </div>

                  {/* Do This / Avoid This */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-1.5 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-semibold text-green-700 dark:text-green-400">DO THIS</span>
                      </div>
                      <ul className="space-y-1.5">
                        {strategy.doThis.map((item: string, i: number) => (
                          <li key={i} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-1.5">
                            <span className="text-green-500 mt-0.5">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-1.5 mb-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-xs font-semibold text-red-700 dark:text-red-400">AVOID THIS</span>
                      </div>
                      <ul className="space-y-1.5">
                        {strategy.avoidThis.map((item: string, i: number) => (
                          <li key={i} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-1.5">
                            <span className="text-red-500 mt-0.5">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Closing Tip */}
                  <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">CLOSING TIP</p>
                    <p className="text-sm text-blue-800 dark:text-blue-300">{strategy.closingTip}</p>
                  </div>
                </div>
              )}

              {/* Objections Tab */}
              {activeTab === 'objections' && (
                <div className="space-y-3 pt-3">
                  {objections.map((obj: Objection, i: number) => (
                    <ObjectionCard key={i} objection={obj} index={i} />
                  ))}
                </div>
              )}

              {/* Talking Points Tab */}
              {activeTab === 'talking' && (
                <div className="space-y-3 pt-3">
                  {talkingPoints.map((point: DrugTalkingPoint, i: number) => (
                    <TalkingPointCard key={i} point={point} index={i} />
                  ))}
                </div>
              )}

              {/* Example Tab */}
              {activeTab === 'example' && exampleExchange && (
                <div className="pt-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Example conversation showing effective technique:
                  </p>
                  <div className="space-y-2 bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    {exampleExchange.exchange.map((msg: { role: string; content: string }, i: number) => (
                      <div
                        key={i}
                        className={`p-2 rounded-lg text-sm ${
                          msg.role === 'user'
                            ? 'bg-[#1B4D7A] text-white ml-4'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 mr-4'
                        }`}
                      >
                        <p className="text-xs opacity-70 mb-1">
                          {msg.role === 'user' ? 'You' : persona.name}
                        </p>
                        <p>{msg.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Objection Card Component
const ObjectionCard = ({ objection, index }: { objection: Objection; index: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2.5 flex items-start justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-start gap-2">
          <span className="w-5 h-5 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
            {index + 1}
          </span>
          <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">&quot;{objection.objection}&quot;</p>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
        )}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2 border-t border-gray-100 dark:border-gray-700 pt-2">
              <div>
                <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">SUGGESTED RESPONSE</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-900/30 rounded p-2">{objection.response}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">💡 TIP</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 italic">{objection.tip}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Talking Point Card Component
const TalkingPointCard = ({ point, index }: { point: DrugTalkingPoint; index: number }) => {
  const [isExpanded, setIsExpanded] = useState(index === 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2.5 flex items-start justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-start gap-2">
          <span className="w-5 h-5 bg-[#E67E22] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
            {index + 1}
          </span>
          <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{point.point}</p>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
        )}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2 border-t border-gray-100 dark:border-gray-700 pt-2">
              <div>
                <p className="text-xs font-semibold text-[#1B4D7A] dark:text-blue-400 mb-1">DATA POINT</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/30 rounded p-2 font-medium">{point.data}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">WHEN TO USE</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{point.whenToUse}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ObjectionBank;
