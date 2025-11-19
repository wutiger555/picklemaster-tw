import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NEWS_DATA } from '../../data/newsData';
import type { NewsCategory } from '../../types/news';
import NewsCard from './NewsCard';
import { staggerContainer, staggerItem } from '../../utils/animations';

const NewsSection: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<NewsCategory | 'All'>('All');

    const filteredNews = NEWS_DATA
        .filter(item => !item.archived) // Filter out archived items
        .filter(item => activeCategory === 'All' ? true : item.category === activeCategory);

    const categories: { id: NewsCategory | 'All'; label: string }[] = [
        { id: 'All', label: '全部消息' },
        { id: 'Taiwan', label: '台灣' },
        { id: 'International', label: '國際' },
        { id: 'Courts', label: '新球場' },
        { id: 'Equipment', label: '裝備' },
    ];

    return (
        <section className="py-24 md:py-32 bg-gradient-to-b from-white to-neutral-50 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl -translate-x-1/2"></div>
                <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-100/40 rounded-full blur-3xl translate-x-1/2"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="font-display text-display-md md:text-display-lg font-black mb-4 text-neutral-900">
                        匹克球新知
                    </h2>
                    <p className="text-body-lg md:text-body-xl text-neutral-600 max-w-3xl mx-auto">
                        掌握最新賽事資訊、裝備趨勢與國內外動態
                    </p>
                </motion.div>

                {/* Filter Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-wrap justify-center gap-3 mb-12"
                >
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${activeCategory === cat.id
                                ? 'bg-neutral-900 text-white shadow-lg scale-105'
                                : 'bg-white text-neutral-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </motion.div>

                {/* News Grid */}
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredNews.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                variants={staggerItem}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                            >
                                <NewsCard news={item} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* View More Button (Optional) */}
                <div className="mt-12 text-center">
                    <button className="text-neutral-500 font-semibold hover:text-neutral-900 transition-colors text-sm flex items-center justify-center mx-auto">
                        查看更多歷史消息
                        <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default NewsSection;
