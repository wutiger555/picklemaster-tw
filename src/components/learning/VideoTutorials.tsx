import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../common/GlassCard';

interface Video {
    id: string;
    title: string;
    description: string;
    thumbnail?: string;
    videoUrl: string;
    duration: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    uploadDate?: string; // ISO 8601 format
}

const videos: Video[] = [
    {
        id: 'continental-grip',
        title: '萬用基礎——大陸式握拍',
        description: '展示最適合初學者的握拍方式，就像握鐵鎚一樣。重點是虎口對準拍框側面。',
        videoUrl: '/videos/continental-grip.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1599474924187-334a405be655?q=80&w=600&auto=format&fit=crop',
        duration: '0:16',
        level: 'beginner',
        uploadDate: '2024-11-25',
    },
    {
        id: 'forehand-drive',
        title: '正手擊球——從低到高的軌跡',
        description: '分解正手抽球的標準動作，強調「蹲低引拍」和「擊球點在身體前方」。',
        videoUrl: '/videos/forehand-drive.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1626245550536-e46d29b06c25?q=80&w=600&auto=format&fit=crop',
        duration: '0:20', // Estimated duration, can be adjusted
        level: 'beginner',
        uploadDate: '2024-11-25',
    },
    {
        id: 'punch-volley',
        title: '網前截擊——是「推」不是「揮」',
        description: '糾正新手在網前喜歡「大動作揮拍」的壞習慣。截擊應該短促有力，像出拳一樣。',
        videoUrl: '/videos/punch-volley.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1515165592879-1849b88c43e9?q=80&w=600&auto=format&fit=crop',
        duration: '0:15', // Estimated duration
        level: 'beginner',
        uploadDate: '2024-11-25',
    },
];

const VideoTutorials: React.FC = () => {
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

    // Generate Schema.org ItemList for videos
    const itemListSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": videos.map((video, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
                "@type": "VideoObject",
                "name": video.title,
                "description": video.description,
                "thumbnailUrl": [video.thumbnail],
                "uploadDate": video.uploadDate ? `${video.uploadDate}T08:00:00+08:00` : "2024-01-01T08:00:00+08:00",
                "duration": `PT${parseInt(video.duration.split(':')[1])}S`, // Simple parsing for now
                "contentUrl": `https://picklemaster.tw${video.videoUrl}`,
                "embedUrl": `https://picklemaster.tw${video.videoUrl}`,
            }
        }))
    };

    return (
        <section className="py-12 relative overflow-hidden">
            {/* Inject Schema.org JSON-LD */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />

            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <GlassCard variant="primary" size="md" className="mb-12 border-none bg-white/30 backdrop-blur-md">
                    <div className="relative">
                        <h2 className="font-display text-heading-2xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                            影音教學專區
                        </h2>
                        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full" />
                    </div>
                    <p className="text-body-lg text-center text-neutral-700 mt-6 max-w-2xl mx-auto font-medium">
                        透過高畫質影片示範，更直觀地學習匹克球的各項技巧
                    </p>
                </GlassCard>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {videos.map((video) => (
                        <motion.div
                            key={video.id}
                            whileHover={{ y: -8, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedVideo(video)}
                            className="cursor-pointer group relative"
                        >
                            {/* Glow effect on hover */}
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl opacity-0 group-hover:opacity-75 blur transition duration-500" />

                            <GlassCard variant="light" size="sm" className="h-full flex flex-col relative bg-white rounded-xl overflow-hidden border border-neutral-100 shadow-xl">
                                <div className="relative aspect-video bg-neutral-900 overflow-hidden">
                                    {/* Video Preview */}
                                    <video
                                        src={video.videoUrl}
                                        poster={video.thumbnail}
                                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                                        muted
                                        loop
                                        playsInline
                                        preload="none"
                                        onMouseOver={(e) => e.currentTarget.play()}
                                        onMouseOut={(e) => {
                                            e.currentTarget.pause();
                                            e.currentTarget.currentTime = 0;
                                            e.currentTarget.load(); // Reset to poster
                                        }}
                                    />

                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                                    {/* Play Button */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/50 group-hover:scale-110 transition-transform duration-300">
                                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg">
                                                <svg className="w-6 h-6 text-primary-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Duration Badge */}
                                    <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-md border border-white/10">
                                        {video.duration}
                                    </div>

                                    {/* Level Badge */}
                                    <div className="absolute top-3 left-3">
                                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20 shadow-lg ${video.level === 'beginner' ? 'bg-emerald-500/90 text-white' :
                                            video.level === 'intermediate' ? 'bg-blue-500/90 text-white' :
                                                'bg-purple-500/90 text-white'
                                            }`}>
                                            {video.level === 'beginner' ? '新手入門' :
                                                video.level === 'intermediate' ? '中階進修' : '進階強化'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 flex-grow flex flex-col bg-white">
                                    <h3 className="font-display text-heading-md font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                                        {video.title}
                                    </h3>
                                    <p className="text-body-sm text-neutral-600 line-clamp-2 leading-relaxed">
                                        {video.description}
                                    </p>

                                    <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center text-primary-600 font-bold text-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                        <span>觀看影片</span>
                                        <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>

                {/* Video Modal */}
                <AnimatePresence>
                    {selectedVideo && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
                            onClick={() => setSelectedVideo(null)}
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
                                        src={selectedVideo.videoUrl}
                                        controls
                                        autoPlay
                                        className="w-full h-full"
                                    />
                                </div>
                                <div className="p-8 bg-neutral-900 text-white">
                                    <div className="flex items-start justify-between gap-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className={`text-xs font-bold px-2 py-1 rounded ${selectedVideo.level === 'beginner' ? 'bg-emerald-500/20 text-emerald-400' :
                                                    selectedVideo.level === 'intermediate' ? 'bg-blue-500/20 text-blue-400' :
                                                        'bg-purple-500/20 text-purple-400'
                                                    }`}>
                                                    {selectedVideo.level === 'beginner' ? '新手入門' :
                                                        selectedVideo.level === 'intermediate' ? '中階進修' : '進階強化'}
                                                </span>
                                                <span className="text-neutral-400 text-sm flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {selectedVideo.duration}
                                                </span>
                                            </div>
                                            <h3 className="font-display text-2xl md:text-3xl font-bold mb-4 text-white">
                                                {selectedVideo.title}
                                            </h3>
                                            <p className="text-neutral-300 text-lg leading-relaxed max-w-3xl">
                                                {selectedVideo.description}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedVideo(null)}
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

export default VideoTutorials;
