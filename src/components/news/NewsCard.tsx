import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { NewsItem } from '../../types/news';
import GlassCard from '../common/GlassCard';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { optimizeImage, unsplashSrcSet } from '../../utils/imageOptimize';

interface NewsCardProps {
    news: NewsItem;
}

const NewsCard: React.FC<NewsCardProps> = ({ news }) => {
    const [imageError, setImageError] = useState(false);

    const categoryColors: Record<string, string> = {
        Taiwan: 'bg-blue-500/10 text-blue-700 border-blue-200',
        International: 'bg-purple-500/10 text-purple-700 border-purple-200',
        Equipment: 'bg-orange-500/10 text-orange-700 border-orange-200',
        Tournament: 'bg-green-500/10 text-green-700 border-green-200',
        Courts: 'bg-teal-500/10 text-teal-700 border-teal-200',
    };

    const fallbackGradients: Record<string, string> = {
        Taiwan: 'from-blue-400 to-indigo-600',
        International: 'from-violet-400 to-fuchsia-600',
        Equipment: 'from-amber-400 to-orange-600',
        Tournament: 'from-emerald-400 to-green-600',
        Courts: 'from-teal-400 to-cyan-600',
    };

    // Category Icons for Fallback
    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Equipment':
                return (
                    <svg className="w-16 h-16 text-white/90 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.5 10.5L9.5 15.5M10.0387 7.02528L5.7868 11.2771C-0.34005 17.404 -0.34005 20.4674 5.7868 26.5942C11.9136 32.7211 14.9771 32.7211 21.1039 26.5942L25.3558 22.3424C31.4827 16.2155 31.4827 13.1521 25.3558 7.02528C19.2289 0.898427 16.1655 0.898427 10.0387 7.02528Z" transform="scale(0.6) translate(8,4)" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /> {/* Lightning bolt for gear */}
                    </svg>
                );
            case 'Courts':
                return (
                    <svg className="w-16 h-16 text-white/90 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                );
            case 'Taiwan':
            case 'International':
                return (
                    <svg className="w-16 h-16 text-white/90 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'Tournament':
                return (
                    <svg className="w-16 h-16 text-white/90 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-16 h-16 text-white/90 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                );
        }
    }

    return (
        <GlassCard
            variant="light"
            size="sm"
            hoverable
            clickable
            className="h-full flex flex-col overflow-hidden p-0 group transition-all duration-500"
        >
            {/* Image Container with Dynamic Fallback */}
            <div className={`relative h-52 overflow-hidden rounded-t-xl bg-gradient-to-br ${fallbackGradients[news.category] || 'from-gray-400 to-gray-500'}`}>
                {!imageError ? (
                    <motion.img
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        src={optimizeImage(news.image, { width: 600 })}
                        srcSet={unsplashSrcSet(news.image, [400, 600, 800])}
                        sizes="(max-width: 768px) 100vw, 400px"
                        alt={news.title}
                        width={600}
                        height={300}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                        loading="lazy"
                        decoding="async"
                    />
                ) : (
                    // Fallback Design: Beautiful Gradient + Icon
                    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
                        {/* Abstract animated shine */}
                        <div className="absolute inset-0 bg-white/10 skew-x-12 -translate-x-full animate-pulse opacity-20"></div>

                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            {getCategoryIcon(news.category)}
                        </motion.div>

                        <div className="mt-3 px-4 text-center">
                            <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold tracking-wider uppercase border border-white/20">
                                {news.category} News
                            </span>
                        </div>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Category Badge (Top Left) */}
                <div className="absolute top-4 left-4 flex gap-2">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-sm border shadow-sm ${categoryColors[news.category] || 'bg-gray-100 text-gray-800 border-gray-200'} ${imageError ? 'bg-white/90 border-white/50' : ''}`}>
                        {news.category === 'Taiwan' ? '台灣消息' :
                            news.category === 'International' ? '國際快訊' :
                                news.category === 'Equipment' ? '裝備新知' :
                                    news.category === 'Courts' ? '新球場' : news.category}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center text-xs text-gray-500 mb-3">
                    <svg className="w-3.5 h-3.5 mr-1.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{news.date}</span>
                    <span className="mx-2">•</span>
                    <span className="truncate">{news.source}</span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-primary-600 transition-colors duration-300">
                    {news.title}
                </h3>

                <p className="text-sm text-gray-600 mb-5 line-clamp-3 flex-grow leading-relaxed">
                    {news.summary}
                </p>

                <div className="mt-auto pt-4 border-t border-gray-100">
                    <Link
                        to={ROUTES.NEWS.replace(':id', news.id)}
                        className="text-primary-600 text-sm font-bold flex items-center group/link"
                    >
                        閱讀更多
                        <svg className="w-4 h-4 ml-1.5 transform group-hover/link:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </GlassCard>
    );
};

export default NewsCard;
