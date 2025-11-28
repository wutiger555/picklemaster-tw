import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NEWS_DATA } from '../data/newsData';
import SEOHead from '../components/common/SEOHead';
import { ROUTES } from '../utils/constants';

const NewsDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const newsItem = NEWS_DATA.find(item => item.id === id);

    useEffect(() => {
        if (!newsItem) {
            navigate(ROUTES.HOME);
        }
    }, [newsItem, navigate]);

    if (!newsItem) return null;

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

                    {/* Main Image */}
                    <div className="relative aspect-video w-full overflow-hidden rounded-2xl shadow-xl mb-10">
                        <img
                            src={newsItem.image}
                            alt={newsItem.title}
                            className="w-full h-full object-cover"
                        />
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
