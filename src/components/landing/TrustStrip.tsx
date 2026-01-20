
'use client';

export const TrustStrip = () => {
  return (
    <section className="py-8 bg-gray-50 border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-500 uppercase tracking-wider mb-6">
          Trusted by pharmaceutical teams across New England
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 lg:gap-16 opacity-60">
          <span className="text-xl sm:text-2xl font-bold text-gray-400 tracking-tight">Mass General</span>
          <span className="text-xl sm:text-2xl font-bold text-gray-400 tracking-tight">Boston Medical</span>
          <span className="text-xl sm:text-2xl font-bold text-gray-400 tracking-tight">Harvard Health</span>
          <span className="text-xl sm:text-2xl font-bold text-gray-400 tracking-tight hidden sm:block">Brigham & Women&apos;s</span>
        </div>
      </div>
    </section>
  );
};

export default TrustStrip;
