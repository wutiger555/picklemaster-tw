import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import SEOHead from '../components/common/SEOHead';
import { VIDEO_TUTORIALS, VIDEO_CATEGORIES, VIDEO_LEVELS, type VideoCategory, type VideoLevel, type VideoTutorial } from '../data/videosData';

const LEVEL_COLORS: Record<VideoLevel, string> = {
  新手: 'bg-slate-100 text-slate-700',
  初階: 'bg-emerald-100 text-emerald-700',
  中階: 'bg-blue-100 text-blue-700',
  進階: 'bg-purple-100 text-purple-700',
};

const VideoCard = ({ v, index }: { v: VideoTutorial; index: number }) => {
  // 若有 youtubeId 用直接連結，否則用搜尋
  const ytUrl = v.youtubeId.match(/^[\w-]{11}$/)
    ? `https://www.youtube.com/watch?v=${v.youtubeId}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(v.searchQuery || v.titleEn)}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.03, 0.25) }}
      className="bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
    >
      <a href={ytUrl} target="_blank" rel="noopener noreferrer" className="block">
        {/* Video thumbnail placeholder */}
        <div className="relative aspect-video bg-gradient-to-br from-red-500 via-rose-500 to-pink-500 flex items-center justify-center overflow-hidden">
          <div className="text-7xl text-white/90 group-hover:scale-110 transition-transform">▶</div>
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">{v.duration}</div>
          <div className="absolute bottom-2 left-2 bg-white/90 text-neutral-900 text-[10px] px-2 py-0.5 rounded font-bold">{v.language}</div>
        </div>

        <div className="p-5">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${LEVEL_COLORS[v.level]}`}>{v.level}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">{v.category}</span>
            {v.views && <span className="text-xs text-neutral-500 ml-auto">👁 {v.views}</span>}
          </div>

          <h3 className="text-lg font-bold text-neutral-900 mb-1 leading-tight group-hover:text-red-600 transition-colors line-clamp-2">{v.title}</h3>
          <p className="text-xs text-neutral-400 mb-2 line-clamp-1">{v.titleEn}</p>

          <div className="text-xs text-neutral-600 mb-2">📺 {v.channel}</div>

          <p className="text-sm text-neutral-700 leading-relaxed line-clamp-2 mb-2">{v.description}</p>

          <div className="bg-emerald-50 border-l-2 border-emerald-400 px-3 py-2 rounded-r-lg">
            <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-0.5">為什麼推薦</div>
            <p className="text-xs text-emerald-900 leading-relaxed">{v.whyWatch}</p>
          </div>
        </div>
      </a>
    </motion.article>
  );
};

const Videos = () => {
  const [categoryFilter, setCategoryFilter] = useState<'all' | VideoCategory>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | VideoLevel>('all');

  const filtered = useMemo(() => {
    return VIDEO_TUTORIALS
      .filter(v => categoryFilter === 'all' || v.category === categoryFilter)
      .filter(v => levelFilter === 'all' || v.level === levelFilter);
  }, [categoryFilter, levelFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50/30 to-white">
      <SEOHead page="videos" />

      <section className="pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-red-600 bg-red-50 px-4 py-1.5 rounded-full mb-6">
            Video Tutorials · {VIDEO_TUTORIALS.length} 支精選
          </span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-neutral-900 mb-4 tracking-tight leading-tight"
          >
            匹克球<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500">教學影片中心</span>
          </motion.h1>
          <p className="text-base md:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            精選 YouTube 國際名師教學影片：Briones、Pickleball University、Enhance Pickleball 等。每支附中文解說與推薦理由。
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 max-w-7xl">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 mb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-2">分類：</span>
            <button onClick={() => setCategoryFilter('all')} className={`px-3 py-1 rounded-full text-xs font-semibold transition ${categoryFilter === 'all' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}>全部</button>
            {VIDEO_CATEGORIES.map(c => {
              const count = VIDEO_TUTORIALS.filter(v => v.category === c).length;
              if (count === 0) return null;
              return (
                <button key={c} onClick={() => setCategoryFilter(c)} className={`px-3 py-1 rounded-full text-xs font-semibold transition ${categoryFilter === c ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}>{c} ({count})</button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-2">等級：</span>
            <button onClick={() => setLevelFilter('all')} className={`px-3 py-1 rounded-full text-xs font-semibold transition ${levelFilter === 'all' ? 'bg-red-500 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}>全部</button>
            {VIDEO_LEVELS.map(l => (
              <button key={l} onClick={() => setLevelFilter(l)} className={`px-3 py-1 rounded-full text-xs font-semibold transition ${levelFilter === l ? 'bg-red-500 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}>{l}</button>
            ))}
          </div>
        </div>

        <div className="text-sm text-neutral-500 mb-4">共 {filtered.length} 支影片 · 點擊卡片開啟 YouTube</div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-20">
          {filtered.map((v, i) => <VideoCard key={v.slug} v={v} index={i} />)}
        </div>

        <div className="text-xs text-neutral-500 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-12">
          ⚠️ 影片連結會開啟 YouTube。部分影片若無確切 ID，將自動以關鍵字搜尋頻道。所有版權屬原頻道所有，本站僅整理推薦清單。
        </div>
      </section>
    </div>
  );
};

export default Videos;
