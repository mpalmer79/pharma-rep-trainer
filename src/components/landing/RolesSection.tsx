
'use client';

import { AnimatedSection } from '@/components/ui/AnimatedSection';

const CheckIcon = () => (
  <div className="w-6 h-6 rounded-full bg-[#E67E22] flex items-center justify-center flex-shrink-0 mt-0.5">
    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  </div>
);

export const RolesSection = () => {
  return (
    <section id="roles" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1B4D7A] mb-4">
            Built for{' '}
            <span className="relative inline-block">
              Every Role
              <span className="absolute bottom-0 left-0 w-full h-1 bg-[#E67E22]"></span>
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Pharmaceutical sales success requires coordination across your entire team. 
            RepIQ delivers tailored tools for every role.
          </p>
        </AnimatedSection>

        {/* Sales Reps */}
        <AnimatedSection className="mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <p className="text-[#E67E22] font-semibold uppercase tracking-wider mb-2">For Pharmaceutical Reps</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#1B4D7A] mb-6">
                Practice Until Perfect, Then Practice Some More
              </h3>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                New hires can dive into realistic simulations from day one. Practice clinical presentations, 
                handle objections, and build confidence before your next call on a Boston cardiologist 
                or Cambridge oncologist.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <span className="text-gray-700">24/7 access to AI physician simulations</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <span className="text-gray-700">Instant feedback on clinical accuracy and messaging</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <span className="text-gray-700">Track progress and identify knowledge gaps</span>
                </li>
              </ul>
            </div>
            <div className="order-1 lg:order-2">
              <img 
                src="https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=800&q=80"
                alt="Sales professional preparing for meeting"
                className="rounded-lg shadow-xl w-full"
              />
            </div>
          </div>
        </AnimatedSection>

        {/* Sales Managers */}
        <AnimatedSection className="mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80"
                alt="Manager coaching team member"
                className="rounded-lg shadow-xl w-full"
              />
            </div>
            <div>
              <p className="text-[#E67E22] font-semibold uppercase tracking-wider mb-2">For Sales Managers</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#1B4D7A] mb-6">
                Coach Smarter, Not Harder
              </h3>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Stop spending hours reviewing call recordings. RepIQ automatically identifies 
                coaching moments and skill gaps across your team, so you can focus your time 
                where it matters most.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <span className="text-gray-700">AI-powered performance dashboards</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <span className="text-gray-700">Automated identification of coaching opportunities</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <span className="text-gray-700">Improve coaching effectiveness by 55%</span>
                </li>
              </ul>
            </div>
          </div>
        </AnimatedSection>

        {/* Enablement Leaders */}
        <AnimatedSection>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <p className="text-[#E67E22] font-semibold uppercase tracking-wider mb-2">For Enablement Leaders</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#1B4D7A] mb-6">
                Measure What Matters
              </h3>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Transform fragmented training initiatives into an orchestrated system that delivers 
                measurable ROI. Track skill development across your organization and connect 
                enablement efforts to revenue outcomes.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <span className="text-gray-700">Comprehensive analytics and reporting</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <span className="text-gray-700">Build learning paths in minutes</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <span className="text-gray-700">Turn training into measurable ROI</span>
                </li>
              </ul>
            </div>
            <div className="order-1 lg:order-2">
              <img 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80"
                alt="Team analyzing performance data"
                className="rounded-lg shadow-xl w-full"
              />
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default RolesSection;
