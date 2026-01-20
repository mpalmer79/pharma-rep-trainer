
'use client';

export const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-16 lg:pt-20">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920&q=80"
          alt="Pharmaceutical sales professional"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1B4D7A]/95 via-[#1B4D7A]/80 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Master Every{' '}
            <span className="relative inline-block">
              Physician Conversation
              <span className="absolute bottom-0 left-0 w-full h-1.5 bg-[#E67E22]"></span>
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 mb-8 leading-relaxed">
            AI-powered roleplay simulations built for New England's pharmaceutical sales teams. 
            Practice with realistic physician personas before your next sales call.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
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
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
