import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { NEWS_DATA } from '../../data/newsData';
import type { NewsCategory, NewsItem } from '../../types/news';
import { ROUTES } from '../../utils/constants';

// Featured news item component - 更大、更突出
const FeaturedNewsItem: React.FC<{ news: NewsItem }> = ({ news }) => (
    <Link to={`${ROUTES.NEWS}?id=${news.id}`} className="group block">
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-6 md:p-8 text-white overflow-hidden"
        >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                }} />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold">
                        {news.category === 'Taiwan' ? '🇹🇼 台灣' :
                            news.category === 'International' ? '🌍 國際' :
                                news.category === 'Courts' ? '📍 新球場' : '🏓 裝備'}
                    </span>
                    <span className="text-white/60 text-xs">{news.date}</span>
                </div>

                <h3 className="text-xl md:text-2xl font-bold mb-2 group-hover:underline decoration-2 underline-offset-4">
                    {news.title}
                </h3>

                <p className="text-white/80 text-sm md:text-base line-clamp-2 mb-4">
                    {news.summary}
                </p>

                <span className="inline-flex items-center gap-1 text-sm font-semibold group-hover:gap-2 transition-all">
                    閱讀更多
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </span>
            </div>
        </motion.article>
    </Link>
);

// Regular news item - 簡潔的列表風格
const NewsListItem: React.FC<{ news: NewsItem; index: number }> = ({ news, index }) => (
    <Link to={`${ROUTES.NEWS}?id=${news.id}`} className="group block">
        <motion.article
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="flex items-start gap-4 py-4 border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50/50 -mx-4 px-4 rounded-lg transition-colors"
        >
            {/* Category icon */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0
        ${news.category === 'Taiwan' ? 'bg-red-50' : ''}
        ${news.category === 'International' ? 'bg-blue-50' : ''}
        ${news.category === 'Courts' ? 'bg-green-50' : ''}
        ${news.category === 'Equipment' ? 'bg-amber-50' : ''}
      `}>
                {news.category === 'Taiwan' ? '🇹🇼' :
                    news.category === 'International' ? '🌍' :
                        news.category === 'Courts' ? '📍' : '🏓'}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-neutral-900 group-hover:text-emerald-600 transition-colors line-clamp-1 mb-1">
                    {news.title}
                </h4>
                <p className="text-sm text-neutral-500 line-clamp-1">
                    {news.summary}
                </p>
            </div>

            {/* Date */}
            <span className="text-xs text-neutral-400 shrink-0 hidden sm:block">
                {news.date}
            </span>

            {/* Arrow */}
            <svg className="w-4 h-4 text-neutral-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </motion.article>
    </Link>
);

const NewsSection: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<NewsCategory | 'All'>('All');

    const filteredNews = NEWS_DATA
        .filter(item => !item.archived)
        .filter(item => activeCategory === 'All' ? true : item.category === activeCategory);

    // 分離出 featured 和 regular news
    const featuredNews = filteredNews[0];
    const regularNews = filteredNews.slice(1, 6); // 只顯示 5 筆

    const categories: { id: NewsCategory | 'All'; label: string }[] = [
        { id: 'All', label: '全部' },
        { id: 'Taiwan', label: '台灣' },
        { id: 'International', label: '國際' },
        { id: 'Courts', label: '新球場' },
        { id: 'Equipment', label: '裝備' },
    ];

    return (
        <section className="py-12 md:py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
                    >
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">
                                匹克球新知
                            </h2>
                            <p className="text-neutral-500 text-sm mt-1">
                                最新賽事、裝備趨勢與國內外動態
                            </p>
                        </div>

                        {/* Filter tabs - 更緊湊 */}
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200
                    ${activeCategory === cat.id
                                            ? 'bg-neutral-900 text-white'
                                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                        }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* News Grid - Headlines Style */}
                    {filteredNews.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Featured news */}
                            {featuredNews && (
                                <div className="md:row-span-2">
                                    <FeaturedNewsItem news={featuredNews} />
                                </div>
                            )}

                            {/* Regular news list */}
                            <div className="bg-white rounded-xl border border-neutral-100 p-2">
                                {regularNews.length > 0 ? (
                                    regularNews.map((item, index) => (
                                        <NewsListItem key={item.id} news={item} index={index} />
                                    ))
                                ) : (
                                    <p className="text-center text-neutral-400 py-8">暫無更多新聞</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-neutral-400">暫無相關新聞</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default NewsSection;
