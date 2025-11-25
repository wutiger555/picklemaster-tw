import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

const VideoSpotlight: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleMouseEnter = () => {
        if (videoRef.current) {
            videoRef.current.play().catch(() => {
                // Handle autoplay restrictions
            });
            setIsPlaying(true);
        }
    };

    const handleMouseLeave = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
            setIsPlaying(false);
        }
    };

    // Schema.org VideoObject data
    const videoSchema = {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        "name": "萬用基礎——大陸式握拍",
        "description": "展示最適合初學者的握拍方式，就像握鐵鎚一樣。重點是虎口對準拍框側面。",
        "thumbnailUrl": [
            "https://images.unsplash.com/photo-1599474924187-334a405be655?q=80&w=1080&auto=format&fit=crop"
        ],
        "uploadDate": "2024-11-25T08:00:00+08:00",
        "duration": "PT16S",
        "contentUrl": "https://picklemaster.tw/videos/continental-grip.mp4",
        "embedUrl": "https://picklemaster.tw/videos/continental-grip.mp4",
        "interactionStatistic": {
            "@type": "InteractionCounter",
            "interactionType": { "@type": "WatchAction" },
            "userInteractionCount": 1000
        }
    };

    return (
        <section className="py-20 bg-neutral-900 relative overflow-hidden">
            {/* Inject Schema.org JSON-LD */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }} />

            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1599474924187-334a405be655?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-transparent to-neutral-900" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    {/* Content Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:w-1/2"
                    >
                        <div className="inline-block px-4 py-2 rounded-full bg-primary-500/20 text-primary-400 font-bold text-sm mb-6 border border-primary-500/30">
                            🎥 全新功能
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                            視覺化學習體驗
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">
                                掌握每個關鍵動作
                            </span>
                        </h2>
                        <p className="text-lg text-neutral-400 mb-8 leading-relaxed">
                            不再憑空想像！透過我們的高畫質慢動作解析與專業教練示範，
                            從握拍、站位到擊球策略，每一個細節都清晰可見。
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                to={ROUTES.LEARNING}
                                className="px-8 py-4 bg-white text-neutral-900 rounded-xl font-bold text-lg hover:bg-neutral-100 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                            >
                                觀看完整教學
                            </Link>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-8 py-4 bg-transparent border border-white/30 text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-colors flex items-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                預覽課程
                            </button>
                        </div>
                    </motion.div>

                    {/* Video Preview Side */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:w-1/2 w-full"
                    >
                        <div
                            className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl group cursor-pointer"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            onClick={() => setIsModalOpen(true)}
                        >
                            {/* Video Element */}
                            <video
                                ref={videoRef}
                                src="/videos/continental-grip.mp4"
                                poster="https://images.unsplash.com/photo-1599474924187-334a405be655?q=80&w=1080&auto=format&fit=crop"
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                muted
                                loop
                                playsInline
                                preload="metadata"
                            />

                            {/* Overlay */}
                            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
                                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/50 group-hover:scale-110 transition-transform">
                                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg">
                                        <svg className="w-8 h-8 text-primary-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Badge */}
                            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10">
                                本週精選：大陸式握拍
                            </div>

                            {/* Progress Bar (Decorative) */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                                <motion.div
                                    className="h-full bg-primary-500"
                                    initial={{ width: "0%" }}
                                    animate={{ width: isPlaying ? "100%" : "0%" }}
                                    transition={{ duration: 16, ease: "linear" }} // Matching video duration roughly
                                />
                            </div>
                        </div>

                        {/* Decorative Elements around video */}
                        <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary-500/20 blur-[100px] rounded-full opacity-50" />
                    </motion.div>
                </div>

                {/* Video Modal */}
                <AnimatePresence>
                    {isModalOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
                            onClick={() => setIsModalOpen(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="w-full max-w-5xl bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="relative aspect-video bg-black">
                                    <video
                                        src="/videos/continental-grip.mp4"
                                        controls
                                        autoPlay
                                        className="w-full h-full"
                                    />
                                </div>
                                <div className="p-8 bg-neutral-900 text-white">
                                    <div className="flex items-start justify-between gap-6">
                                        <div>
                                            <h3 className="font-display text-2xl md:text-3xl font-bold mb-4 text-white">
                                                萬用基礎——大陸式握拍
                                            </h3>
                                            <p className="text-neutral-300 text-lg leading-relaxed max-w-3xl">
                                                展示最適合初學者的握拍方式，就像握鐵鎚一樣。重點是虎口對準拍框側面。
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setIsModalOpen(false)}
                                            className="p-2 hover:bg-white/10 rounded-full transition-colors group"
                                        >
                                            <svg className="w-8 h-8 text-neutral-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};

export default VideoSpotlight;
