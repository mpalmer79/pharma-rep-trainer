'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserMenu } from '@/components/UserMenu';

interface NavbarProps {
  historyLoaded: boolean;
  sessionsCount: number;
  onProgressClick: () => void;
}

export const Navbar = ({ historyLoaded, sessionsCount, onProgressClick }: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = () => setMobileMenuOpen(false);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [mobileMenuOpen]);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-gradient-to-br from-[#1B4D7A] to-[#2D6A9F] flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-lg">R</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-[#1B4D7A]">RepIQ</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6">
            <a href="#platform" className="text-gray-700 hover:text-[#E67E22] font-medium transition-colors text-sm">Platform</a>
            <a href="#training" className="text-gray-700 hover:text-[#E67E22] font-medium transition-colors text-sm">Training</a>
            <a href="#roles" className="text-gray-700 hover:text-[#E67E22] font-medium transition-colors text-sm">Solutions</a>
            <a href="#about" className="text-gray-700 hover:text-[#E67E22] font-medium transition-colors text-sm">About</a>
            <Link href="/training-library" className="text-[#E67E22] hover:text-[#D35400] font-semibold transition-colors text-sm">Training Library</Link>
          </div>

          {/* Right Side - CTAs */}
          <div className="flex items-center gap-3">
            {/* Progress Button */}
            <button 
              onClick={onProgressClick}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B4D7A] hover:bg-[#0F2D44] text-white font-semibold rounded transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Progress
              {historyLoaded && sessionsCount > 0 && (
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">
                  {sessionsCount}
                </span>
              )}
            </button>
            
            <a 
              href="#simulator"
              className="hidden sm:inline-flex px-5 py-2.5 bg-[#E67E22] hover:bg-[#D35400] text-white font-semibold rounded transition-colors text-sm"
            >
              Try Demo
            </a>
            
            {/* User Menu / Auth Buttons */}
            <div className="hidden sm:block">
              <UserMenu />
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t shadow-lg">
          <div className="px-4 py-6 space-y-4">
            <a href="#platform" onClick={handleNavClick} className="block py-2 text-gray-700 hover:text-[#E67E22] font-medium">Platform</a>
            <a href="#training" onClick={handleNavClick} className="block py-2 text-gray-700 hover:text-[#E67E22] font-medium">Training</a>
            <a href="#roles" onClick={handleNavClick} className="block py-2 text-gray-700 hover:text-[#E67E22] font-medium">Solutions</a>
            <a href="#about" onClick={handleNavClick} className="block py-2 text-gray-700 hover:text-[#E67E22] font-medium">About</a>
            <Link href="/training-library" onClick={handleNavClick} className="block py-2 text-[#E67E22] hover:text-[#D35400] font-semibold">Training Library</Link>
            <hr />
            {/* Portfolio Links - Prominent in Mobile Menu */}
            <a 
              href="https://www.linkedin.com/in/michael-palmer-qa/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-center gap-2 py-3 bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              Visit me on LinkedIn
            </a>
            <a 
              href="https://github.com/mpalmer79/pharma-rep-trainer" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-center gap-2 py-3 bg-[#24292F] hover:bg-[#1a1e22] text-white font-semibold rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              View this project on GitHub
            </a>
            <hr />
            <a href="#simulator" onClick={handleNavClick} className="block w-full py-3 bg-[#E67E22] text-white font-semibold rounded text-center">Try Demo</a>
            <button 
              onClick={() => { handleNavClick(); onProgressClick(); }}
              className="flex items-center justify-center gap-2 w-full py-3 bg-[#1B4D7A] text-white font-semibold rounded"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              My Progress
              {historyLoaded && sessionsCount > 0 && (
                <span className="bg-white/20 px-2 py-0.5 rounded text-sm">
                  {sessionsCount} sessions
                </span>
              )}
            </button>
            {/* Mobile Auth */}
            <div className="pt-2">
              <Link 
                href="/auth/login" 
                onClick={handleNavClick}
                className="block w-full py-3 border-2 border-[#1B4D7A] text-[#1B4D7A] font-semibold rounded text-center hover:bg-[#1B4D7A] hover:text-white transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
