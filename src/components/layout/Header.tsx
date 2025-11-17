import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { ROUTES, BRAND } from '../../utils/constants';

const Header = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: ROUTES.HOME, label: '首頁' },
    { path: ROUTES.RULES, label: '規則教學' },
    { path: ROUTES.EQUIPMENT, label: '裝備指南' },
    { path: ROUTES.LEARNING_PATHS, label: '學習路徑' },
    { path: ROUTES.COURTS, label: '找球場' },
    { path: ROUTES.GAME, label: '互動遊戲' },
    { path: ROUTES.RESOURCES, label: '資源' },
    { path: ROUTES.ABOUT, label: '關於' },
  ];

  return (
    <header className="bg-gradient-to-r from-pickleball-400 via-pickleball-500 to-sport-500 shadow-lg sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to={ROUTES.HOME}
            className="flex items-center space-x-3 group"
          >
            <img src="/logo.png" alt="Picklemaster Taiwan Logo" className="w-16 h-16 object-contain" />
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-black text-white tracking-tight">
                {BRAND.NAME_ZH}
              </span>
              <span className="text-xs text-pickleball-100 hidden sm:block">
                {BRAND.NAME}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`
                  px-4 py-2 rounded-full font-semibold transition-all duration-300
                  ${isActive(link.path)
                    ? 'bg-white text-pickleball-600 shadow-lg scale-105'
                    : 'text-white hover:bg-white/20 hover:scale-105'
                  }
                `}
              >
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 space-y-2 animate-slide-in">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  block px-4 py-3 rounded-lg font-semibold transition-all duration-300
                  ${isActive(link.path)
                    ? 'bg-white text-pickleball-600 shadow-lg'
                    : 'text-white hover:bg-white/20'
                  }
                `}
              >
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
