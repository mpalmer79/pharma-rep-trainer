'use client';

import { motion } from 'framer-motion';

const stats = [
  { 
    number: '5', 
    label: 'Personas to Master',
    subtext: 'Progressive difficulty levels'
  },
  { 
    number: '+15s', 
    label: 'Time Bonus',
    subtext: 'Reward for excellent responses'
  },
  { 
    number: '6', 
    label: 'Core Competencies',
    subtext: 'Measurable skill development'
  },
  { 
    number: '85%', 
    label: 'Target Score',
    subtext: 'Champion-level benchmark'
  }
];

export const StatsBanner = () => {
  return (
    <section className="py-16 bg-[#1B4D7A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-blue-200 text-sm font-medium tracking-wide uppercase mb-2">
            Performance-Based Training
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold text-white">
            Every Response Counts
          </h3>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <p className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-2">
                {stat.number}
              </p>
              <p className="text-white font-semibold text-sm sm:text-base mb-1">
                {stat.label}
              </p>
              <p className="text-blue-200/70 text-xs sm:text-sm">
                {stat.subtext}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Divider line */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-center text-blue-200/80 text-sm">
            Real-time AI scoring adapts your training session based on performance
          </p>
        </div>
      </div>
    </section>
  );
};

export default StatsBanner;
