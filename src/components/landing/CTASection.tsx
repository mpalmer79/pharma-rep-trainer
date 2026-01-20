'use client';

export const CTASection = () => {
  return (
    <section className="relative py-20 lg:py-28">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80"
          alt="Modern office"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1B4D7A]/90"></div>
      </div>
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
          Ready to Transform Your Sales Performance?
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Join leading pharmaceutical companies using AI-powered training to 
          accelerate rep onboarding and improve sales outcomes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="#simulator"
            className="px-8 py-4 bg-[#E67E22] hover:bg-[#D35400] text-white font-semibold rounded transition-colors text-lg"
          >
            Start Free Training
          </a>
          <a 
            href="mailto:contact@repiq.ai"
            className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-[#1B4D7A] font-semibold rounded transition-colors text-lg"
          >
            Schedule a Demo
          </a>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

