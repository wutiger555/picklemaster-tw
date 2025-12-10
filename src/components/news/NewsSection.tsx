import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { NEWS_DATA } from '../../data/newsData';
import type { NewsCategory, NewsItem } from '../../types/news';
import { ROUTES } from '../../utils/constants';

// 取得類別圖標和顏色
const getCategoryStyle = (category: NewsCategory) => {
    switch (category) {
        case 'Taiwan':
            return { icon: '🇹🇼', label: '台灣消息', bgColor: 'bg-red-50', textColor: 'text-red-700' };
        case 'International':
            return { icon: '🌍', label: '國際快訊', bgColor: 'bg-blue-50', textColor: 'text-blue-700' };
        case 'Courts':
            return { icon: '📍', label: '新球場', bgColor: 'bg-green-50', textColor: 'text-green-700' };
        case 'Equipment':
            return { icon: '🏓', label: '裝備新知', bgColor: 'bg-amber-50', textColor: 'text-amber-700' };
        case 'Tournament':
            return { icon: '🏆', label: '賽事資訊', bgColor: 'bg-purple-50', textColor: 'text-purple-700' };
        default:
            return { icon: '📰', label: '最新消息', bgColor: 'bg-neutral-50', textColor: 'text-neutral-700' };
    }
};

// Featured news item component - 大卡片
const FeaturedNewsItem: React.FC<{ news: NewsItem }> = ({ news }) => {
    const style = getCategoryStyle(news.category);

    return (
        <Link to={`${ROUTES.NEWS}?id=${news.id}`} className="group block">
            <motion.article
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl overflow-hidden h-full min-h-[320px]"
            >
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                        backgroundSize: '24px 24px'
                    }} />
                </div>

                <div className="relative z-10 p-6 md:p-8 h-full flex flex-col text-white">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold">
                            {style.icon} {style.label}
                        </span>
                        <span className="text-white/60 text-xs">{news.date}</span>
                        {news.tags?.includes('Upcoming') && (
                            <span className="px-2 py-0.5 bg-amber-400/90 text-amber-900 rounded-full text-xs font-bold animate-pulse">
                                即將開始
                            </span>
                        )}
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold mb-3 group-hover:underline decoration-2 underline-offset-4 flex-grow">
                        {news.title}
                    </h3>

                    <p className="text-white/80 text-sm md:text-base line-clamp-3 mb-4">
                        {news.summary}
                    </p>

                    <span className="inline-flex items-center gap-1 text-sm font-semibold group-hover:gap-2 transition-all mt-auto">
                        閱讀更多
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </span>
                </div>
            </motion.article>
        </Link>
    );
};

// Regular news card - 小卡片
const NewsCard: React.FC<{ news: NewsItem; index: number }> = ({ news, index }) => {
    const style = getCategoryStyle(news.category);

    return (
        <Link to={`${ROUTES.NEWS}?id=${news.id}`} className="group block">
            <motion.article
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl border border-neutral-100 p-4 hover:border-emerald-200 hover:shadow-lg transition-all h-full"
            >
                <div className="flex items-center gap-2 mb-3">
                    <span className={`${style.bgColor} ${style.textColor} text-xs px-2 py-1 rounded-full font-medium`}>
                        {style.icon} {style.label}
                    </span>
                    <span className="text-neutral-400 text-xs">{news.date}</span>
                </div>

                <h4 className="font-bold text-neutral-900 group-hover:text-emerald-600 transition-colors line-clamp-2 mb-2">
                    {news.title}
                </h4>

                <p className="text-sm text-neutral-500 line-clamp-2">
                    {news.summary}
                </p>

                {news.tags && news.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {news.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </motion.article>
        </Link>
    );
};

// News list item - 列表
const NewsListItem: React.FC<{ news: NewsItem; index: number }> = ({ news, index }) => {
    const style = getCategoryStyle(news.category);

    return (
        <Link to={`${ROUTES.NEWS}?id=${news.id}`} className="group block">
            <motion.article
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-4 py-3 border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50/50 -mx-2 px-2 rounded-lg transition-colors"
            >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${style.bgColor}`}>
                    {style.icon}
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-neutral-900 group-hover:text-emerald-600 transition-colors line-clamp-1 mb-1">
                        {news.title}
                    </h4>
                    <p className="text-sm text-neutral-500 line-clamp-1">
                        {news.summary}
                    </p>
                </div>

                <span className="text-xs text-neutral-400 shrink-0 hidden sm:block">
                    {news.date}
                </span>

                <svg className="w-4 h-4 text-neutral-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </motion.article>
        </Link>
    );
};

const NewsSection: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<NewsCategory | 'All'>('All');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // 按日期排序，最新的在前面
    const sortedNews = useMemo(() => {
        return [...NEWS_DATA]
            .filter(item => !item.archived)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, []);

    const filteredNews = useMemo(() => {
        return sortedNews.filter(item => activeCategory === 'All' ? true : item.category === activeCategory);
    }, [sortedNews, activeCategory]);

    // 分離 featured 和 regular news
    const featuredNews = filteredNews[0];
    const regularNews = filteredNews.slice(1, viewMode === 'grid' ? 7 : 10);

    const categories: { id: NewsCategory | 'All'; label: string; icon: string }[] = [
        { id: 'All', label: '全部', icon: '📰' },
        { id: 'Taiwan', label: '台灣', icon: '🇹🇼' },
        { id: 'Courts', label: '球場', icon: '📍' },
        { id: 'Tournament', label: '賽事', icon: '🏆' },
        { id: 'Equipment', label: '裝備', icon: '🏓' },
    ];

    // 統計資料
    const stats = {
        total: sortedNews.length,
        taiwan: sortedNews.filter(n => n.category === 'Taiwan').length,
        courts: sortedNews.filter(n => n.category === 'Courts').length,
    };

    return (
        <section className="py-12 md:py-16 bg-gradient-to-b from-white to-neutral-50">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-8"
                    >
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
                            <div>
                                <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold mb-3">
                                    📰 最新動態
                                </span>
                                <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">
                                    匹克球新知
                                </h2>
                                <p className="text-neutral-500 text-sm mt-1">
                                    台灣賽事、新球場、國內外動態 · 共 {stats.total} 則消息
                                </p>
                            </div>

                            {/* 視圖切換 */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500'}`}
                                    aria-label="網格視圖"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500'}`}
                                    aria-label="列表視圖"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Filter tabs */}
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${activeCategory === cat.id
                                            ? 'bg-neutral-900 text-white shadow-lg'
                                            : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                                        }`}
                                >
                                    <span className="mr-1">{cat.icon}</span>
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* News Content */}
                    {filteredNews.length > 0 ? (
                        viewMode === 'grid' ? (
                            // Grid View
                            <div className="grid lg:grid-cols-3 gap-6">
                                {/* Featured news - spans 2 columns */}
                                {featuredNews && (
                                    <div className="lg:col-span-2">
                                        <FeaturedNewsItem news={featuredNews} />
                                    </div>
                                )}

                                {/* First regular card */}
                                {regularNews[0] && (
                                    <div>
                                        <NewsCard news={regularNews[0]} index={0} />
                                    </div>
                                )}

                                {/* Rest of the cards */}
                                {regularNews.slice(1).map((item, index) => (
                                    <NewsCard key={item.id} news={item} index={index + 1} />
                                ))}
                            </div>
                        ) : (
                            // List View
                            <div className="bg-white rounded-2xl border border-neutral-100 p-4 md:p-6">
                                {/* Featured in list view */}
                                {featuredNews && (
                                    <div className="mb-6 pb-6 border-b border-neutral-100">
                                        <FeaturedNewsItem news={featuredNews} />
                                    </div>
                                )}

                                {/* List items */}
                                <div>
                                    {regularNews.map((item, index) => (
                                        <NewsListItem key={item.id} news={item} index={index} />
                                    ))}
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="text-center py-16 bg-white rounded-2xl border border-neutral-100">
                            <div className="text-5xl mb-4">📰</div>
                            <p className="text-neutral-400 mb-4">暫無相關新聞</p>
                            <button
                                onClick={() => setActiveCategory('All')}
                                className="text-emerald-600 font-medium hover:underline"
                            >
                                查看全部新聞
                            </button>
                        </div>
                    )}

                    {/* 查看更多連結 */}
                    {filteredNews.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="mt-8 text-center"
                        >
                            <p className="text-neutral-500 text-sm mb-4">
                                想了解更多匹克球資訊？
                            </p>
                            <div className="flex flex-wrap justify-center gap-3">
                                <Link
                                    to={ROUTES.FAQ}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-100 text-neutral-700 font-medium rounded-xl hover:bg-neutral-200 transition-colors"
                                >
                                    ❓ 常見問題
                                </Link>
                                <Link
                                    to={ROUTES.RESOURCES}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-100 text-neutral-700 font-medium rounded-xl hover:bg-neutral-200 transition-colors"
                                >
                                    📚 學習資源
                                </Link>
                                <a
                                    href="https://www.pickleball.org.tw"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
                                >
                                    🇹🇼 匹克球協會官網
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default NewsSection;
