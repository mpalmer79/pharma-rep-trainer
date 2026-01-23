'use client';

import { motion } from 'framer-motion';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { 
  Trophy, 
  Target, 
  Clock, 
  Unlock, 
  TrendingUp, 
  Award,
  Zap,
  Users,
  Handshake,
  Star,
  Lightbulb
} from 'lucide-react';

const journeySteps = [
  {
    level: 1,
    title: 'The Newcomer',
    description: 'Start with friendly personas who give you time to make your pitch.',
    icon: Target,
    color: 'from-green-400 to-emerald-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    personas: ['Dr. Emily Chen - The Curious Learner'],
    tip: 'Focus on building rapport and presenting patient benefits clearly.',
  },
  {
    level: 2,
    title: 'The Challenger',
    description: 'Face skeptical physicians who demand data and evidence.',
    icon: TrendingUp,
    color: 'from-amber-400 to-orange-500',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    personas: ['Dr. Robert Chen - The Skeptic', 'Dr. Patricia Williams - The Loyalist'],
    tip: 'Know your clinical data cold. Every response is graded in real-time.',
  },
  {
    level: 3,
    title: 'The Expert',
    description: 'Navigate gatekeepers and time-pressured situations.',
    icon: Unlock,
    color: 'from-red-400 to-rose-500',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    personas: ['Monica Reynolds - The Gatekeeper', 'Dr. James Morrison - The Rush'],
    tip: 'Earn bonus time with excellent responses. Poor responses cost you seconds.',
  },
  {
    level: 4,
    title: 'The Champion',
    description: 'Win long-term partnerships and establish trusted relationships.',
    icon: Trophy,
    color: 'from-purple-400 to-indigo-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    personas: ['All personas mastered'],
    tip: 'Consistent excellence across all scenarios earns you Champion status.',
  },
];

const gameFeatures = [
  {
    icon: Clock,
    title: 'Dynamic Timer',
    description: 'Your responses are graded in real-time. Excellent answers earn bonus time (+15 sec). Poor responses cost you time (-10 sec).',
  },
  {
    icon: Unlock,
    title: 'Unlock System',
    description: 'Master easier personas to unlock harder challenges. Each level requires demonstrating specific competencies.',
  },
  {
    icon: Award,
    title: 'Skill Progression',
    description: 'Track your growth across six core competencies: Opening, Clinical Knowledge, Objection Handling, Time Management, Compliance, and Closing.',
  },
  {
    icon: Star,
    title: 'Achievement Tiers',
    description: 'Progress from Beginner → Intermediate → Advanced → Expert as you complete challenges and improve scores.',
  },
];

export const GameJourneySection = () => {
  return (
    <section id="journey" className="py-20 lg:py-28 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E67E22]/10 rounded-full mb-6">
            <Zap className="w-5 h-5 text-[#E67E22]" />
            <span className="text-sm font-semibold text-[#E67E22]">THE CHALLENGE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1B4D7A] dark:text-white mb-4">
            Can You{' '}
            <span className="relative inline-block">
              Beat the Game?
              <span className="absolute bottom-0 left-0 w-full h-1.5 bg-[#E67E22]"></span>
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            This isn't just training — it's your journey from rookie rep to trusted partner. 
            Every conversation is scored. Every second counts. Unlock new challenges as you prove your skills.
          </p>
        </AnimatedSection>

        {/* Journey Path */}
        <div className="relative mb-20">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-amber-400 via-red-400 to-purple-500 transform -translate-y-1/2 z-0" />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {journeySteps.map((step, index) => (
              <AnimatedSection key={step.level} delay={index * 150}>
                <motion.div
                  className={`relative p-6 rounded-2xl border-2 ${step.borderColor} ${step.bgColor} h-full`}
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Level Badge */}
                  <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-bold text-lg">{step.level}</span>
                  </div>
                  
                  {/* Icon */}
                  <div className="flex justify-center mt-4 mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center shadow-md`}>
                      <step.icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold text-[#1B4D7A] dark:text-white text-center mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center text-sm mb-4">
                    {step.description}
                  </p>
                  
                  {/* Personas */}
                  <div className="space-y-1 mb-4">
                    {step.personas.map((persona, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Users className="w-3 h-3" />
                        <span>{persona}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Tip */}
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-[#E67E22] font-medium flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 flex-shrink-0" />
                      {step.tip}
                    </p>
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>

        {/* Ultimate Goal Banner */}
        <AnimatedSection delay={300}>
          <motion.div
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1B4D7A] to-[#0f3a5d] p-8 md:p-12 mb-16"
            whileHover={{ scale: 1.01 }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#E67E22] rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#E67E22] to-amber-400 flex items-center justify-center shadow-2xl">
                  <Handshake className="w-12 h-12 text-white" />
                </div>
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 flex items-center gap-3 justify-center md:justify-start">
                  <Trophy className="w-8 h-8 text-[#E67E22]" />
                  The Ultimate Goal: Win the Contract
                </h3>
                <p className="text-blue-100 text-lg mb-4">
                  Your mission isn't just to survive — it's to build lasting partnerships. 
                  Master every persona, prove your value, and establish long-term relationships 
                  between your pharmaceutical company and the healthcare providers who trust you.
                </p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="flex items-center gap-2 text-white/80">
                    <Trophy className="w-5 h-5 text-[#E67E22]" />
                    <span>Unlock all personas</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Star className="w-5 h-5 text-[#E67E22]" />
                    <span>Reach Expert tier</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Target className="w-5 h-5 text-[#E67E22]" />
                    <span>Score 85%+ consistently</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatedSection>

        {/* How the Game Works */}
        <AnimatedSection>
          <h3 className="text-2xl font-bold text-[#1B4D7A] dark:text-white text-center mb-8">
            How the Game Works
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {gameFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -3 }}
              >
                <div className="w-12 h-12 rounded-lg bg-[#E67E22]/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[#E67E22]" />
                </div>
                <h4 className="font-bold text-[#1B4D7A] dark:text-white mb-2">{feature.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        {/* CTA */}
        <AnimatedSection delay={200} className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Ready to start your journey from newcomer to champion?
          </p>
          <a
            href="#simulator"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#E67E22] hover:bg-[#D35400] text-white font-bold rounded-xl transition-colors text-lg shadow-lg hover:shadow-xl"
          >
            <Trophy className="w-5 h-5" />
            Accept the Challenge
          </a>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default GameJourneySection;
