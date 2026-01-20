
'use client';

import { AnimatedSection } from '@/components/ui/AnimatedSection';

export const AboutSection = () => {
  return (
    <section id="about" className="py-20 lg:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <AnimatedSection>
            <img 
              src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80"
              alt="Boston skyline"
              className="rounded-lg shadow-xl w-full"
            />
          </AnimatedSection>
          
          <AnimatedSection delay={200}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1B4D7A] mb-6">
              Built for{' '}
              <span className="relative inline-block">
                New England
                <span className="absolute bottom-0 left-0 w-full h-1 bg-[#E67E22]"></span>
              </span>
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              The Boston-Cambridge medical corridor is one of the world&apos;s most demanding pharmaceutical 
              markets. Our AI personas are specifically trained on physician behaviors in academic 
              medical centers, community practices, and hospital systems across Massachusetts, 
              New Hampshire, and beyond.
            </p>
            <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-[#E67E22]">
              <blockquote className="text-gray-700 text-lg italic mb-4">
                &quot;RepIQ transformed how we prepare reps for the Boston market. The AI simulations 
                are remarkably realistic—our team actually gets nervous before practice sessions, 
                just like they would before a real call.&quot;
              </blockquote>
              <div className="flex items-center gap-4">
                <img 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face"
                  alt="James Mitchell"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-[#1B4D7A]">James Mitchell</p>
                  <p className="text-gray-500 text-sm">Regional Sales Director, BioPharma Inc.</p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
