
'use client';

import { AnimatedSection } from '@/components/ui/AnimatedSection';

export const PlatformSection = () => {
  return (
    <section id="platform" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1B4D7A] leading-tight mb-6">
              <span className="relative inline-block">
                Revolutionizing
                <span className="absolute bottom-0 left-0 w-full h-1 bg-[#E67E22]"></span>
              </span>{' '}
              Pharmaceutical Sales Training
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Pharmaceutical sales teams face a growing challenge: physicians have less time, 
              expectations are higher, and traditional training fades within weeks. Reps work hard, 
              but execution still falls short.
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              <strong className="text-[#1B4D7A]">RepIQ changes that.</strong> Our AI-powered platform 
              delivers realistic physician simulations that help your team practice challenging 
              conversations before they happen in the field.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#E67E22] rounded-full mt-2.5 flex-shrink-0"></div>
                <p className="text-gray-700">Boost training retention by up to 170%</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#E67E22] rounded-full mt-2.5 flex-shrink-0"></div>
                <p className="text-gray-700">Improve coaching effectiveness by 55%</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#E67E22] rounded-full mt-2.5 flex-shrink-0"></div>
                <p className="text-gray-700">Practice anytime, anywhere, 24/7</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#E67E22] rounded-full mt-2.5 flex-shrink-0"></div>
                <p className="text-gray-700">Real-time AI feedback and scoring</p>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&q=80"
                alt="Sales professional in training session"
                className="rounded-lg shadow-2xl w-full"
              />
              {/* Floating stat */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-xl p-6 border-l-4 border-[#E67E22]">
                <p className="text-4xl font-bold text-[#1B4D7A]">170%</p>
                <p className="text-gray-600">Retention Boost</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default PlatformSection;
