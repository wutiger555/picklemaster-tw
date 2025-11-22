import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { NewsItem } from '../../types/news';
import GlassCard from '../common/GlassCard';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

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
        Taiwan: 'from-blue-500 to-blue-600',
        International: 'from-purple-500 to-purple-600',
        Equipment: 'from-orange-500 to-orange-600',
        Tournament: 'from-green-500 to-green-600',
        Courts: 'from-teal-500 to-teal-600',
    };

    return (
        <GlassCard
            variant="light"
            size="sm"
            hoverable
            clickable
            className="h-full flex flex-col overflow-hidden p-0 group transition-all duration-500"
        >
            {/* Image Container */}
            <div className="relative h-52 overflow-hidden rounded-t-xl bg-gradient-to-br ${fallbackGradients[news.category] || 'from-gray-400 to-gray-500'}">
                {!imageError ? (
                    <motion.img
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        src={news.image}
                        alt={news.title}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                        loading="lazy"
                    />
                ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${fallbackGradients[news.category] || 'from-gray-400 to-gray-500'} flex items-center justify-center`}>
                        <div className="text-center text-white">
                            <svg className="w-16 h-16 mx-auto mb-2 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm font-medium opacity-80">圖片載入中</p>
                        </div>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-4 left-4 flex gap-2">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-sm border ${categoryColors[news.category] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
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
