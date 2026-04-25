import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NEWS_DATA } from '../data/newsData';
import { optimizeImage, unsplashSrcSet } from '../utils/imageOptimize';
import SEOHead from '../components/common/SEOHead';
import { ROUTES } from '../utils/constants';

const NewsDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const newsItem = NEWS_DATA.find(item => item.id === id);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        if (!newsItem) {
            navigate(ROUTES.HOME);
        }
    }, [newsItem, navigate]);

    if (!newsItem) return null;

    const fallbackGradients: Record<string, string> = {
        Taiwan: 'from-blue-400 to-indigo-600',
        International: 'from-violet-400 to-fuchsia-600',
        Equipment: 'from-amber-400 to-orange-600',
        Tournament: 'from-emerald-400 to-green-600',
        Courts: 'from-teal-400 to-cyan-600',
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Equipment':
                return (
                    <svg className="w-24 h-24 text-white/90 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.5 10.5L9.5 15.5M10.0387 7.02528L5.7868 11.2771C-0.34005 17.404 -0.34005 20.4674 5.7868 26.5942C11.9136 32.7211 14.9771 32.7211 21.1039 26.5942L25.3558 22.3424C31.4827 16.2155 31.4827 13.1521 25.3558 7.02528C19.2289 0.898427 16.1655 0.898427 10.0387 7.02528Z" transform="scale(0.6) translate(8,4)" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                );
            case 'Courts':
                return (
                    <svg className="w-24 h-24 text-white/90 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-24 h-24 text-white/90 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                );
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 pt-20 pb-24">
            <SEOHead
                title={`${newsItem.title} | PickleMaster TW`}
                description={newsItem.summary}
                image={newsItem.image}
            />

            <article className="container mx-auto px-4 max-w-4xl">
                {/* Breadcrumb */}
                <div className="flex items-center text-sm text-neutral-500 mb-8">
                    <Link to={ROUTES.HOME} className="hover:text-primary-600 transition-colors">首頁</Link>
                    <span className="mx-2">/</span>
                    <span className="text-neutral-900">匹克球新知</span>
                </div>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <div className="flex flex-wrap gap-3 mb-6">
                        <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-bold">
                            {newsItem.category === 'Taiwan' ? '台灣消息' :
                                newsItem.category === 'International' ? '國際快訊' :
                                    newsItem.category === 'Equipment' ? '裝備新知' :
                                        newsItem.category === 'Courts' ? '新球場' : newsItem.category}
                        </span>
                        <span className="text-neutral-500 flex items-center text-sm">
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {newsItem.date}
                        </span>
                    </div>

                    <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-black text-neutral-900 leading-tight mb-6">
                        {newsItem.title}
                    </h1>

                    {/* Main Image with Fallback */}
                    <div className={`relative aspect-video w-full overflow-hidden rounded-2xl shadow-xl mb-10 ${imageError ? `bg-gradient-to-br ${fallbackGradients[newsItem.category] || 'from-gray-400 to-gray-500'}` : 'bg-neutral-200'}`}>
                        {!imageError ? (
                            <img
                                src={optimizeImage(newsItem.image, { width: 1200 })}
                                srcSet={unsplashSrcSet(newsItem.image, [600, 1200, 1600])}
                                sizes="(max-width: 768px) 100vw, 1200px"
                                alt={newsItem.title}
                                width={1200}
                                height={675}
                                className="w-full h-full object-cover"
                                onError={() => setImageError(true)}
                                loading="eager"
                                decoding="async"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden text-white">
                                <div className="absolute inset-0 bg-white/10 skew-x-12 -translate-x-full animate-pulse opacity-20"></div>
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring" }}
                                >
                                    {getCategoryIcon(newsItem.category)}
                                </motion.div>
                                <div className="mt-4 px-6 text-center">
                                    <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-sm font-bold tracking-wider uppercase border border-white/20">
                                        {newsItem.category} Focus
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-neutral-100"
                >
                    <div className="prose prose-lg max-w-none text-neutral-700">
                        {newsItem.content ? (
                            <div dangerouslySetInnerHTML={{ __html: newsItem.content }} />
                        ) : (
                            <p className="lead text-xl md:text-2xl font-medium text-neutral-800 mb-8 leading-relaxed">
                                {newsItem.summary}
                            </p>
                        )}
                        {/* Placeholder for more content if we had it */}
                        {!newsItem.content && (
                            <div className="space-y-6 text-neutral-600 mt-8">
                                <p>
                                    （此為新聞摘要，完整報導請參考原始來源。）
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Source Link */}
                    <div className="mt-12 pt-8 border-t border-neutral-100 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-sm text-neutral-500">
                            資料來源：<span className="font-medium text-neutral-900">{newsItem.source}</span>
                        </div>

                        <div className="flex gap-4">
                            <Link
                                to={ROUTES.HOME}
                                className="px-6 py-3 rounded-xl font-bold text-neutral-600 hover:bg-neutral-100 transition-colors"
                            >
                                返回首頁
                            </Link>
                            <a
                                href={newsItem.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 rounded-xl font-bold bg-neutral-900 text-white hover:bg-neutral-800 transition-colors flex items-center shadow-lg hover:shadow-xl"
                            >
                                閱讀原始文章
                                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </motion.div>
            </article>
        </div>
    );
};

export default NewsDetail;
