'use client';

import { motion } from 'framer-motion';
import { Trophy, Zap, Target, ArrowRight } from 'lucide-react';

export const CTASection = () => {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80"
          alt="Modern office"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1B4D7A]/95 to-[#0f3a5d]/90"></div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-[#E67E22]/20 rounded-full blur-xl"
          animate={{ y: [0, 20, 0], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Trophy Icon */}
        <motion.div
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-[#E67E22] to-amber-400 mb-8 shadow-2xl"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', bounce: 0.5 }}
        >
          <Trophy className="w-10 h-10 text-white" />
        </motion.div>
        
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
          Ready to{' '}
          <span className="relative inline-block">
            Win the Game?
            <span className="absolute bottom-0 left-0 w-full h-1.5 bg-[#E67E22]"></span>
          </span>
        </h2>
        
        <p className="text-xl text-blue-100 mb-6 max-w-2xl mx-auto">
          Every second counts. Every response is scored. 
          Unlock all personas, reach Expert tier, and prove you have what it takes 
          to build lasting pharmaceutical partnerships.
        </p>
        
        {/* Challenge Stats */}
        <div className="flex flex-wrap justify-center gap-6 mb-10">
          <div className="flex items-center gap-2 text-white/80">
            <Zap className="w-5 h-5 text-[#E67E22]" />
            <span>Real-time scoring</span>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <Target className="w-5 h-5 text-[#E67E22]" />
            <span>5 personas to conquer</span>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <Trophy className="w-5 h-5 text-[#E67E22]" />
            <span>1 ultimate goal</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.a 
            href="#simulator"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#E67E22] hover:bg-[#D35400] text-white font-bold rounded-xl transition-colors text-lg shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Zap className="w-5 h-5" />
            Accept the Challenge
            <ArrowRight className="w-5 h-5" />
          </motion.a>
          <motion.a 
            href="#journey"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-[#1B4D7A] font-semibold rounded-xl transition-colors text-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            See How to Win
          </motion.a>
        </div>
        
        {/* Bottom tagline */}
        <p className="mt-8 text-blue-200/70 text-sm">
          Join leading pharmaceutical teams using AI-powered training to sharpen their competitive edge.
        </p>
      </div>
    </section>
  );
};

export default CTASection;
