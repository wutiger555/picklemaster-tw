import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { ROUTES } from '../../utils/constants';

const Header = () => {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const isActive = (path: string) => location.pathname === path;

    type DropdownItem = {
        path: string;
        label: string;
        description: string;
        badge?: string;
    };

    const navigation: Array<
        | { path: string; label: string; type: 'link' }
        | { label: string; type: 'dropdown'; items: DropdownItem[] }
    > = [
            { path: ROUTES.HOME, label: '首頁', type: 'link' },
            {
                label: '學習',
                type: 'dropdown',
                items: [
                    { path: ROUTES.RULES, label: '規則教學', description: '互動式學習匹克球規則與場地配置' },
                    { path: ROUTES.LEARNING_PATHS, label: '學習路徑', description: '從新手到進階的完整學習系統' },
                ],
            },
            {
                label: '球場',
                type: 'dropdown',
                items: [
                    { path: ROUTES.COURTS, label: '找球場', description: '全台 55+ 球場地圖與詳細資訊' },
                    { path: ROUTES.SCORER, label: '計分器', description: '專業比賽計分工具', badge: 'NEW' },
                ],
            },
            { path: ROUTES.EQUIPMENT, label: '裝備', type: 'link' },
            {
                label: '資源',
                type: 'dropdown',
                items: [
                    { path: ROUTES.RESOURCES, label: '資源中心', description: '影片教學、文章與社群連結' },
                    { path: ROUTES.ABOUT, label: '關於', description: '了解 Picklemaster Taiwan' },
                ],
            },
        ];

    return (
        <header className="sticky top-0 z-50 shadow-lg">
            {/* Layered Background with Pickleball Court Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
                {/* Subtle court grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `
              linear-gradient(90deg, #10b981 1px, transparent 1px),
              linear-gradient(#10b981 1px, transparent 1px)
            `,
                        backgroundSize: '40px 40px'
                    }}
                />
                {/* Court center line accent */}
                <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
            </div>

            {/* Border */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />

            <nav className="container mx-auto px-6 py-5 relative">
                <div className="flex items-center justify-between">
                    {/* Modern Sports Brand Logo */}
                    <Link
                        to={ROUTES.HOME}
                        className="flex items-center space-x-4 group relative"
                    >
                        {/* Logo with dynamic glow */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <img
                                src="/logo.png"
                                alt="Picklemaster Taiwan"
                                className="w-16 h-16 object-contain relative z-10 transition-transform duration-300 group-hover:scale-110 drop-shadow-lg"
                            />
                        </div>

                        {/* Modern Athletic Brand Name */}
                        <div className="flex flex-col">
                            {/* Main Brand - Bold & Modern */}
                            <div className="flex items-baseline space-x-2.5">
                                <h1 className="text-2xl font-black tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                                        PICKLEMASTER
                                    </span>
                                </h1>
                                {/* Dynamic accent bar */}
                                <div className="flex flex-col space-y-0.5 hidden sm:flex">
                                    <div className="h-0.5 w-12 bg-gradient-to-r from-emerald-500 to-transparent rounded-full" />
                                    <div className="h-0.5 w-8 bg-gradient-to-r from-teal-500 to-transparent rounded-full" />
                                </div>
                            </div>
                            {/* Subtitle - Sleek & International */}
                            <div className="flex items-center space-x-2 mt-0.5">
                                <p className="text-[10px] font-bold text-emerald-600/80 uppercase tracking-[0.15em]" style={{ fontFamily: "'Inter', sans-serif" }}>
                                    Taiwan Pickleball
                                </p>
                            </div>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-1">
                        {navigation.map((item, index) => (
                            <div
                                key={index}
                                className="relative group/nav"
                            >
                                {item.type === 'link' ? (
                                    <Link
                                        to={item.path!}
                                        className={`
                      px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 block text-sm relative
                      ${isActive(item.path!)
                                                ? 'text-emerald-700 bg-emerald-50 shadow-sm'
                                                : 'text-neutral-700 hover:text-emerald-700 hover:bg-neutral-50/80'
                                            }
                    `}
                                    >
                                        {item.label}
                                        {isActive(item.path!) && (
                                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent rounded-full" />
                                        )}
                                    </Link>
                                ) : (
                                    <>
                                        <button
                                            className="px-5 py-2.5 rounded-xl font-semibold text-neutral-700 hover:text-emerald-700 hover:bg-neutral-50/80 transition-all duration-200 flex items-center space-x-1.5 text-sm"
                                            onMouseEnter={() => setActiveDropdown(item.label)}
                                        >
                                            <span>{item.label}</span>
                                            <svg
                                                className="w-3.5 h-3.5 transition-transform duration-200"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                style={{ transform: activeDropdown === item.label ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {/* Fixed Dropdown Menu */}
                                        {activeDropdown === item.label && (
                                            <div
                                                className={`absolute top-full pt-2 w-96 ${item.label === '資源' ? 'right-0' : 'left-0'}`}
                                                onMouseEnter={() => setActiveDropdown(item.label)}
                                                onMouseLeave={() => setActiveDropdown(null)}
                                            >
                                                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-neutral-200/60 overflow-hidden">
                                                    {/* Dropdown header accent */}
                                                    <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />

                                                    {item.items?.map((subItem, subIndex) => (
                                                        <Link
                                                            key={subIndex}
                                                            to={subItem.path}
                                                            className="group block px-6 py-4 hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-teal-50/30 transition-all duration-200 border-b border-neutral-100 last:border-b-0"
                                                            onClick={() => setActiveDropdown(null)}
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <div className="font-bold text-neutral-900 mb-1.5 flex items-center space-x-2 group-hover:text-emerald-700 transition-colors">
                                                                        <span>{subItem.label}</span>
                                                                        {subItem.badge && (
                                                                            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs px-2.5 py-0.5 rounded-lg font-bold shadow-sm">
                                                                                {subItem.badge}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-sm text-neutral-600 leading-relaxed">{subItem.description}</div>
                                                                </div>
                                                                <svg
                                                                    className="w-5 h-5 text-neutral-300 mt-1 flex-shrink-0 ml-4 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
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

                        {/* Premium Game CTA */}
                        <Link
                            to={ROUTES.GAME}
                            className="ml-6 group relative"
                        >
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />

                            {/* Button */}
                            <div className="relative px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm border border-emerald-500/20 group-hover:scale-105">
                                <div className="flex items-center space-x-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>互動遊戲</span>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden p-2.5 text-neutral-700 hover:bg-neutral-100 rounded-xl transition-all duration-200"
                    >
                        {mobileMenuOpen ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="lg:hidden mt-6 pb-4 space-y-2 border-t border-neutral-200/60 pt-6">
                        {/* Game CTA for Mobile */}
                        <Link
                            to={ROUTES.GAME}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-5 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl text-center shadow-lg mb-4"
                        >
                            <div className="flex items-center justify-center space-x-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>互動遊戲</span>
                            </div>
                        </Link>

                        {navigation.map((item, index) => (
                            <div key={index}>
                                {item.type === 'link' ? (
                                    <Link
                                        to={item.path!}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`
                      block px-5 py-3 rounded-xl font-semibold transition-all duration-200
                      ${isActive(item.path!)
                                                ? 'text-emerald-700 bg-emerald-50'
                                                : 'text-neutral-700 hover:bg-neutral-50'
                                            }
                    `}
                                    >
                                        {item.label}
                                    </Link>
                                ) : (
                                    <div className="space-y-1.5">
                                        <div className="px-5 py-2 text-neutral-500 text-xs font-bold uppercase tracking-wider">
                                            {item.label}
                                        </div>
                                        {item.items?.map((subItem, subIndex) => (
                                            <Link
                                                key={subIndex}
                                                to={subItem.path}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="block px-5 py-3 rounded-xl text-neutral-700 hover:bg-neutral-50 transition-all duration-200 ml-3"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold">{subItem.label}</span>
                                                    {subItem.badge && (
                                                        <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs px-2 py-0.5 rounded-lg font-bold">
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
