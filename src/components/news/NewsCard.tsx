import React from 'react';
import { motion } from 'framer-motion';
import type { NewsItem } from '../../types/news';
import GlassCard from '../common/GlassCard';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

interface NewsCardProps {
    news: NewsItem;
}

const NewsCard: React.FC<NewsCardProps> = ({ news }) => {
    const categoryColors: Record<string, string> = {
        Taiwan: 'bg-blue-100 text-blue-800',
        International: 'bg-purple-100 text-purple-800',
        Equipment: 'bg-orange-100 text-orange-800',
        Tournament: 'bg-green-100 text-green-800',
        Courts: 'bg-teal-100 text-teal-800',
    };

    return (
        <GlassCard
            variant="light"
            size="sm"
            hoverable
            clickable
            className="h-full flex flex-col overflow-hidden p-0"
        >
            {/* Image Container */}
            <div className="relative h-48 overflow-hidden rounded-t-xl">
                <motion.img
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    src={news.image}
                    alt={news.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${categoryColors[news.category] || 'bg-gray-100 text-gray-800'}`}>
                        {news.category === 'Taiwan' ? '台灣消息' :
                            news.category === 'International' ? '國際快訊' :
                                news.category === 'Equipment' ? '裝備新知' :
                                    news.category === 'Courts' ? '新球場' : news.category}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-center text-xs text-gray-500 mb-2">
                    <span>{news.date}</span>
                    <span className="mx-2">•</span>
                    <span>{news.source}</span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
                    {news.title}
                </h3>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">
                    {news.summary}
                </p>

                <div className="mt-auto pt-3 border-t border-gray-100">
                    <Link
                        to={ROUTES.NEWS.replace(':id', news.id)}
                        className="text-primary-600 text-sm font-semibold flex items-center group"
                    >
                        閱讀更多
                        <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </GlassCard>
    );
};

export default NewsCard;
