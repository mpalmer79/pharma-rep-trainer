'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Persona, Drug } from '@/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface CoachingHint {
  id: string;
  type: 'tip' | 'warning' | 'reminder' | 'suggestion';
  title: string;
  message: string;
  priority: number; // 1 = highest
}

interface UseCoachingModeProps {
  enabled: boolean;
  messages: Message[];
  persona: Persona | null;
  drug: Drug | null;
  timeRemaining: number;
  isLoading: boolean;
  input: string;
}

interface UseCoachingModeReturn {
  currentHint: CoachingHint | null;
  dismissHint: () => void;
  hintHistory: CoachingHint[];
}

// Persona-specific coaching strategies
const personaStrategies: Record<string, {
  openingTip: string;
  keyReminders: string[];
  objectionTips: Record<string, string>;
  closingTip: string;
  idealResponseLength: { min: number; max: number };
}> = {
  rush: {
    openingTip: "Dr. Chen is extremely time-pressed. Lead with your ONE strongest differentiator in under 30 words.",
    keyReminders: [
      "Keep responses under 50 words",
      "Use bullet-point thinking: one key point per message",
      "Skip pleasantries - get to the value immediately",
    ],
    objectionTips: {
      'time': "Acknowledge the time constraint, then pivot: 'I understand. In 30 seconds: [key point]'",
      'busy': "Offer a micro-commitment: 'Just one data point that might save you time with [patient type]'",
      'later': "Create urgency with patient benefit: 'Quick question - are you seeing patients with [condition]?'",
    },
    closingTip: "End with a specific, low-commitment ask: 'Can I leave a one-page summary for your next [patient type]?'",
    idealResponseLength: { min: 20, max: 75 },
  },
  skeptic: {
    openingTip: "Dr. Torres values data rigor. Lead with specific numbers, confidence intervals, or NNT.",
    keyReminders: [
      "Use absolute risk reduction, not just relative",
      "Cite the specific trial name and population size",
      "Acknowledge limitations before she finds them",
    ],
    objectionTips: {
      'study': "Welcome scrutiny: 'Good question. The study methodology was [specific detail]...'",
      'data': "Offer transparency: 'I can share the full trial data. What specific metrics matter most to you?'",
      'evidence': "Pivot to real-world evidence if available: 'Beyond the RCT, post-market data shows...'",
      'concern': "Validate and address: 'That's a fair concern. Here's what the safety data shows...'",
    },
    closingTip: "Offer peer-reviewed resources: 'Can I send you the NEJM publication and our medical affairs contact?'",
    idealResponseLength: { min: 50, max: 150 },
  },
  loyalist: {
    openingTip: "Dr. Williams is satisfied with current therapy. Don't attack his choice - find the gaps.",
    keyReminders: [
      "Position for NEW patients, not switching stable ones",
      "Find unmet needs: 'For patients who [specific limitation]...'",
      "Respect his experience and clinical judgment",
    ],
    objectionTips: {
      'happy': "Agree and pivot: 'Your results speak for themselves. For the patients where [gap]...'",
      'switch': "Remove pressure: 'Not suggesting a switch. But for your next new diagnosis...'",
      'works': "Find the edge cases: 'Absolutely. What about patients who [specific scenario]?'",
      'years': "Leverage his experience: 'With your experience, you've probably seen patients who...'",
    },
    closingTip: "Plant a seed for new patients: 'Next time you see a patient with [specific profile], would you consider...?'",
    idealResponseLength: { min: 40, max: 120 },
  },
  gatekeeper: {
    openingTip: "Monica controls access. Treat her as a professional partner, not an obstacle.",
    keyReminders: [
      "Be specific about your time ask: '3 minutes' not 'a few minutes'",
      "Explain patient benefit, not product features",
      "Offer value to HER: samples, patient resources, staff education",
    ],
    objectionTips: {
      'busy': "Offer flexibility: 'I understand. What's the best way to get 3 minutes with Dr. [Name]?'",
      'appointment': "Provide options: 'I can wait, come back, or leave materials. What works best?'",
      'not interested': "Find the angle: 'I have patient savings cards that could help your [condition] patients...'",
      'call': "Make it easy: 'Absolutely. When should I follow up? I want to respect everyone\\'s time.'",
    },
    closingTip: "Build the relationship: 'Thank you for your help. Is there anything I can bring next time that would be useful?'",
    idealResponseLength: { min: 30, max: 100 },
  },
  curious: {
    openingTip: "Dr. Park loves learning. Go deep on mechanism of action and ideal patient profiles.",
    keyReminders: [
      "Explain the 'why' behind the data",
      "Discuss where it fits in the treatment algorithm",
      "Be ready for detailed pharmacology questions",
    ],
    objectionTips: {
      'how': "This is interest, not objection! Dive into mechanism: 'Great question. The pathway is...'",
      'which patients': "Get specific: 'Ideal candidates are patients with [detailed profile]...'",
      'compare': "Welcome comparison: 'Versus [competitor], the key differentiator is...'",
      'new': "Address novelty concerns: 'Early adopters like yourself can help identify ideal patients...'",
    },
    closingTip: "Offer deeper engagement: 'Would you be interested in our speaker program or a peer-to-peer with our KOL?'",
    idealResponseLength: { min: 60, max: 200 },
  },
};

// Detect objection keywords in assistant messages
const detectObjection = (message: string, personaId: string): string | null => {
  const lowerMessage = message.toLowerCase();
  const strategy = personaStrategies[personaId];
  if (!strategy) return null;

  for (const keyword of Object.keys(strategy.objectionTips)) {
    if (lowerMessage.includes(keyword)) {
      return keyword;
    }
  }
  return null;
};

// Check if user mentioned clinical data
const hasClinicalData = (message: string): boolean => {
  const dataIndicators = [
    '%', 'percent', 'trial', 'study', 'data', 'patients',
    'reduction', 'improvement', 'efficacy', 'safety',
    'nnt', 'nnr', 'confidence', 'significant', 'p-value',
    'compared to', 'versus', 'vs', 'outcome'
  ];
  const lower = message.toLowerCase();
  return dataIndicators.some(indicator => lower.includes(indicator));
};

// Check if user asked a question
const hasQuestion = (message: string): boolean => {
  return message.includes('?') || 
    message.toLowerCase().startsWith('what') ||
    message.toLowerCase().startsWith('how') ||
    message.toLowerCase().startsWith('would') ||
    message.toLowerCase().startsWith('could') ||
    message.toLowerCase().startsWith('can');
};

export function useCoachingMode({
  enabled,
  messages,
  persona,
  drug,
  timeRemaining,
  isLoading,
  input,
}: UseCoachingModeProps): UseCoachingModeReturn {
  const [currentHint, setCurrentHint] = useState<CoachingHint | null>(null);
  const [hintHistory, setHintHistory] = useState<CoachingHint[]>([]);
  const [dismissedHints, setDismissedHints] = useState<Set<string>>(new Set());
  const lastHintTimeRef = useRef<number>(Date.now());
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showHint = useCallback((hint: CoachingHint) => {
    if (dismissedHints.has(hint.id)) return;
    
    // Don't show hints too frequently (min 8 seconds apart)
    const now = Date.now();
    if (now - lastHintTimeRef.current < 8000) return;
    
    setCurrentHint(hint);
    setHintHistory(prev => {
      // Avoid duplicates in history
      if (prev.some(h => h.id === hint.id)) return prev;
      return [...prev, hint];
    });
    lastHintTimeRef.current = now;
  }, [dismissedHints]);

  const dismissHint = useCallback(() => {
    if (currentHint) {
      setDismissedHints(prev => new Set([...prev, currentHint.id]));
    }
    setCurrentHint(null);
  }, [currentHint]);

  // Generate hints based on conversation state
  useEffect(() => {
    if (!enabled || !persona || !drug || isLoading) {
      setCurrentHint(null);
      return;
    }

    const strategy = personaStrategies[persona.id];
    if (!strategy) return;

    const userMessages = messages.filter(m => m.role === 'user');
    const assistantMessages = messages.filter(m => m.role === 'assistant');
    const lastAssistantMessage = assistantMessages[assistantMessages.length - 1];
    const lastUserMessage = userMessages[userMessages.length - 1];
    const messageCount = userMessages.length;

    // Opening hint (before first user message)
    if (messageCount === 0 && !input) {
      showHint({
        id: `opening-${persona.id}`,
        type: 'tip',
        title: 'Opening Strategy',
        message: strategy.openingTip,
        priority: 1,
      });
      return;
    }

    // Check for objection in last assistant message
    if (lastAssistantMessage && messageCount > 0) {
      const objectionKeyword = detectObjection(lastAssistantMessage.content, persona.id);
      if (objectionKeyword && strategy.objectionTips[objectionKeyword]) {
        showHint({
          id: `objection-${objectionKeyword}-${messageCount}`,
          type: 'suggestion',
          title: 'Objection Handling',
          message: strategy.objectionTips[objectionKeyword],
          priority: 1,
        });
        return;
      }
    }

    // Response length warning (while typing)
    if (input.length > 0) {
      if (input.length > strategy.idealResponseLength.max * 1.5) {
        showHint({
          id: `length-warning-${messageCount}`,
          type: 'warning',
          title: 'Response Too Long',
          message: `For ${persona.name}, keep responses under ${strategy.idealResponseLength.max} characters. Consider trimming to your key point.`,
          priority: 2,
        });
        return;
      }
    }

    // No clinical data mentioned after 2+ messages
    if (messageCount >= 2 && lastUserMessage) {
      const allUserText = userMessages.map(m => m.content).join(' ');
      if (!hasClinicalData(allUserText)) {
        showHint({
          id: `data-reminder-${messageCount}`,
          type: 'reminder',
          title: 'Add Clinical Data',
          message: `You haven't mentioned specific data yet. Consider citing: "${drug.keyData.split('.')[0]}."`,
          priority: 3,
        });
        return;
      }
    }

    // No questions asked after 2+ messages
    if (messageCount >= 2 && messageCount <= 4) {
      const allUserText = userMessages.map(m => m.content).join(' ');
      if (!hasQuestion(allUserText)) {
        showHint({
          id: `question-suggestion-${messageCount}`,
          type: 'suggestion',
          title: 'Engage with Questions',
          message: 'Try asking a question to understand their needs better. "What challenges are you seeing with...?"',
          priority: 4,
        });
        return;
      }
    }

    // Closing reminder when time is low
    if (timeRemaining !== -1 && timeRemaining <= 45 && timeRemaining > 15 && messageCount >= 2) {
      showHint({
        id: `closing-reminder`,
        type: 'tip',
        title: 'Time to Close',
        message: strategy.closingTip,
        priority: 2,
      });
      return;
    }

    // Random key reminder if no other hint (every ~20 seconds of no hints)
    if (messageCount >= 1 && !currentHint) {
      const randomReminder = strategy.keyReminders[Math.floor(Math.random() * strategy.keyReminders.length)];
      const timeSinceLastHint = Date.now() - lastHintTimeRef.current;
      if (timeSinceLastHint > 20000) {
        showHint({
          id: `reminder-${Date.now()}`,
          type: 'reminder',
          title: `${persona.name} Tip`,
          message: randomReminder,
          priority: 5,
        });
      }
    }
  }, [enabled, messages, persona, drug, timeRemaining, isLoading, input, showHint, currentHint]);

  // Silence detection - if user hasn't typed for 15 seconds after persona response
  useEffect(() => {
    if (!enabled || !persona || isLoading) return;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    const userMessages = messages.filter(m => m.role === 'user');
    const assistantMessages = messages.filter(m => m.role === 'assistant');

    // If persona just responded and user hasn't typed
    if (assistantMessages.length > userMessages.length && !input) {
      silenceTimerRef.current = setTimeout(() => {
        const strategy = personaStrategies[persona.id];
        if (strategy) {
          showHint({
            id: `silence-${Date.now()}`,
            type: 'suggestion',
            title: 'Keep the Momentum',
            message: strategy.keyReminders[0],
            priority: 3,
          });
        }
      }, 15000);
    }

    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [enabled, messages, persona, isLoading, input, showHint]);

  return {
    currentHint: enabled ? currentHint : null,
    dismissHint,
    hintHistory,
  };
}

export default useCoachingMode;
