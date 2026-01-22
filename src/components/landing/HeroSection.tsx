'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, Zap } from 'lucide-react';

interface QuickPracticeResult {
  drugId: string;
  personaId: string;
  drugName: string;
  personaName: string;
}

interface HeroSectionProps {
  onQuickPractice?: () => QuickPracticeResult | null;
  onStartQuickPractice?: (drugId: string, personaId: string) => void;
}

export const HeroSection = ({ onQuickPractice, onStartQuickPractice }: HeroSectionProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<QuickPracticeResult | null>(null);

  const handleQuickPractice = () => {
    if (!onQuickPractice || !onStartQuickPractice) {
      // Fallback: scroll to simulator
      const simulator = document.getElementById('simulator');
      if (simulator) simulator.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const selection = onQuickPractice();
    if (!selection) {
      // No available selection, scroll to simulator
      const simulator = document.getElementById('simulator');
      if (simulator) simulator.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    
    setPreviewData(selection);
    setShowPreview(true);

    // Auto-start after showing preview
    setTimeout(() => {
      setShowPreview(false);
      onStartQuickPractice(selection.drugId, selection.personaId);
    }, 1500);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center pt-16 lg:pt-20">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920&q=80"
          alt="Pharmaceutical sales professional"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1B4D7A]/95 via-[#1B4D7A]/85 to-[#1B4D7A]/70"></div>
      </div>

      {/* Content - Center Aligned */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
        {/* Social Links */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <a 
            href="https://www.linkedin.com/in/michael-palmer-qa/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-medium rounded-full transition-all hover:shadow-lg"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Visit me on LinkedIn
          </a>
          <a 
            href="https://github.com/mpalmer79/pharma-rep-trainer"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#24292F] hover:bg-[#1a1e22] text-white text-xs font-medium rounded-full transition-all hover:shadow-lg"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            View on GitHub
          </a>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
          Master Every<br />
          <span className="relative inline-block">
            Physician Conversation
            <span className="absolute bottom-0 left-0 w-full h-1.5 bg-[#E67E22]"></span>
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-200 mb-8 leading-relaxed max-w-2xl mx-auto">
          AI-powered roleplay simulations built for New England's pharmaceutical sales teams. 
          Practice with realistic physician personas before your next sales call.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <a 
            href="#simulator"
            className="px-8 py-4 bg-[#E67E22] hover:bg-[#D35400] text-white font-semibold rounded text-center transition-colors text-lg"
          >
            START FREE TRAINING
          </a>
          <a 
            href="#platform"
            className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-[#1B4D7A] font-semibold rounded text-center transition-colors text-lg"
          >
            LEARN MORE
          </a>
        </div>

        {/* Quick Practice Button */}
        <motion.button
          onClick={handleQuickPractice}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-full transition-all shadow-lg"
          whileHover={{ scale: 1.05, boxShadow: '0 10px 40px rgba(139, 92, 246, 0.4)' }}
          whileTap={{ scale: 0.95 }}
        >
          <Zap className="w-5 h-5" />
          Quick Practice - Jump Right In!
        </motion.button>

        {/* DEMO MODE Watermark */}
        <div className="mt-12 sm:mt-16">
          <div className="inline-block px-8 py-4 border-4 border-white/30 rounded-lg bg-white/5 backdrop-blur-sm">
            <span 
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-[0.2em] text-white/25 select-none"
              style={{ 
                fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif",
                textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                letterSpacing: '0.15em'
              }}
            >
              DEMO MODE
            </span>
          </div>
        </div>
      </div>

      {/* Quick Practice Preview Modal */}
      <AnimatePresence>
        {showPreview && previewData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl"
            >
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center"
              >
                <Shuffle className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-[#1B4D7A] mb-2">Let's Go!</h3>
              <p className="text-gray-600 mb-4">Your random selection:</p>
              <div className="space-y-3">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Product</p>
                  <p className="font-bold text-[#1B4D7A]">{previewData.drugName}</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Physician</p>
                  <p className="font-bold text-[#E67E22]">{previewData.personaName}</p>
                </div>
              </div>
              <motion.div
                className="mt-6 h-1 bg-gray-200 rounded-full overflow-hidden"
              >
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.5, ease: 'linear' }}
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-600"
                />
              </motion.div>
              <p className="mt-2 text-sm text-gray-500">Starting session...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default HeroSection;
