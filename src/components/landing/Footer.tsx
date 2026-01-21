'use client';

export const Footer = () => {
  return (
    <footer className="bg-[#0F2D44] text-gray-300 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded bg-gradient-to-br from-[#1B4D7A] to-[#2D6A9F] flex items-center justify-center">
                <span className="text-white font-bold">R</span>
              </div>
              <span className="text-xl font-bold text-white">RepIQ</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              AI-powered pharmaceutical sales training built for New England&apos;s healthcare ecosystem.
            </p>
          </div>
          <div>
            <h5 className="font-semibold text-white mb-4">Platform</h5>
            <ul className="space-y-2 text-sm">
              <li><a href="#platform" className="hover:text-white transition-colors">AI Simulations</a></li>
              <li><a href="#training" className="hover:text-white transition-colors">Training Programs</a></li>
              <li><a href="/training-library" className="hover:text-white transition-colors">Training Library</a></li>
              <li><a href="#roles" className="hover:text-white transition-colors">Solutions</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-white mb-4">Company</h5>
            <ul className="space-y-2 text-sm">
              <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-white mb-4">Connect</h5>
            <ul className="space-y-2 text-sm">
              <li><a href="https://www.linkedin.com/in/michael-palmer-qa/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a></li>
              <li><a href="https://github.com/mpalmer79/pharma-rep-trainer" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>© 2025 RepIQ. All rights reserved.</p>
          <p>Built in Boston, MA</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
