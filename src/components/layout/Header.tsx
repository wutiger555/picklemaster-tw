import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { ROUTES, BRAND } from '../../utils/constants';

const Header = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const isActive = (path: string) => location.pathname === path;

  // 定義下拉選單子項目類型
  type DropdownItem = {
    path: string;
    label: string;
    description: string;
    badge?: string;
  };

  // 導航結構：支持下拉選單的專業分組
  const navigation: Array<
    | { path: string; label: string; type: 'link' }
    | { label: string; type: 'dropdown'; icon: string; items: DropdownItem[] }
  > = [
    { path: ROUTES.HOME, label: '首頁', type: 'link' },
    {
      label: '學習中心',
      type: 'dropdown',
      icon: '🎓',
      items: [
        { path: ROUTES.RULES, label: '規則教學', description: '互動式學習匹克球規則' },
        { path: ROUTES.LEARNING_PATHS, label: '學習路徑', description: '從新手到高手的完整路徑' },
        { path: ROUTES.GAME, label: '互動遊戲', description: '透過遊戲學習技巧' },
      ],
    },
    {
      label: '球場服務',
      type: 'dropdown',
      icon: '🏟️',
      items: [
        { path: ROUTES.COURTS, label: '找球場', description: '全台 55+ 球場地圖' },
        { path: ROUTES.SCORER, label: '專業計分器', description: '比賽計分必備工具', badge: 'NEW' },
      ],
    },
    { path: ROUTES.EQUIPMENT, label: '裝備指南', type: 'link' },
    {
      label: '更多',
      type: 'dropdown',
      icon: '📚',
      items: [
        { path: ROUTES.RESOURCES, label: '資源中心', description: '影片、文章、社群連結' },
        { path: ROUTES.ABOUT, label: '關於我們', description: '了解 Picklemaster Taiwan' },
      ],
    },
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
            <img src="/logo.png" alt="Picklemaster Taiwan Logo" className="w-14 h-14 md:w-16 md:h-16 object-contain" />
            <div className="flex flex-col">
              <span className="text-lg md:text-2xl font-black text-white tracking-tight">
                {BRAND.NAME_ZH}
              </span>
              <span className="text-xs text-pickleball-100 hidden sm:block">
                {BRAND.NAME}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigation.map((item, index) => (
              <div
                key={index}
                className="relative"
                onMouseEnter={() => item.type === 'dropdown' && setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {item.type === 'link' ? (
                  <Link
                    to={item.path!}
                    className={`
                      px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 block
                      ${isActive(item.path!)
                        ? 'bg-white text-pickleball-600 shadow-lg'
                        : 'text-white hover:bg-white/20'
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <>
                    <button
                      className="px-5 py-2.5 rounded-lg font-semibold text-white hover:bg-white/20 transition-all duration-300 flex items-center space-x-1"
                    >
                      <span>{item.label}</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {activeDropdown === item.label && (
                      <div className="absolute top-full left-0 pt-2 w-80">
                        <div className="bg-white rounded-xl shadow-2xl overflow-hidden animate-slide-down border border-gray-100">
                          {item.items?.map((subItem, subIndex) => (
                            <Link
                              key={subIndex}
                              to={subItem.path}
                              className="block px-6 py-4 hover:bg-gradient-to-r hover:from-pickleball-50 hover:to-sport-50 transition-all duration-200 border-b border-gray-100 last:border-b-0"
                              onClick={() => setActiveDropdown(null)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="font-bold text-gray-800 mb-1 flex items-center space-x-2">
                                    <span>{subItem.label}</span>
                                    {subItem.badge && (
                                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                        {subItem.badge}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-600">{subItem.description}</div>
                                </div>
                                <svg className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
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
          <div className="lg:hidden mt-4 pb-4 space-y-2">
            {navigation.map((item, index) => (
              <div key={index}>
                {item.type === 'link' ? (
                  <Link
                    to={item.path!}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      block px-4 py-3 rounded-lg font-semibold transition-all duration-300
                      ${isActive(item.path!)
                        ? 'bg-white text-pickleball-600 shadow-lg'
                        : 'text-white hover:bg-white/20'
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <div className="space-y-1">
                    <div className="px-4 py-2 text-white/70 text-sm font-bold flex items-center space-x-2">
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.items?.map((subItem, subIndex) => (
                      <Link
                        key={subIndex}
                        to={subItem.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-6 py-2.5 rounded-lg text-white hover:bg-white/20 transition-all duration-300 ml-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{subItem.label}</span>
                          {subItem.badge && (
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                              {subItem.badge}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
