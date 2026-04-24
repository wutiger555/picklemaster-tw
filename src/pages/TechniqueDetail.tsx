import { useParams, Link, Navigate } from 'react-router-dom';
import { m, LazyMotion, domAnimation } from 'framer-motion';
import { getTechniqueBySlug, TECHNIQUES } from '../data/techniquesData';
import SEOHead from '../components/common/SEOHead';
import { useEffect } from 'react';

const Section = ({ title, children, icon }: { title: string; children: React.ReactNode; icon: string }) => (
  <section className="bg-white rounded-2xl border border-neutral-100 p-6 md:p-8 mb-6">
    <h2 className="text-2xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
      <span>{icon}</span> {title}
    </h2>
    {children}
  </section>
);

const TechniqueDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const technique = slug ? getTechniqueBySlug(slug) : undefined;

  // 注入 HowTo structured data
  useEffect(() => {
    if (!technique) return;
    const howToSchema = {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: `如何學會${technique.name} (${technique.nameEn})`,
      description: technique.tagline,
      totalTime: `PT${technique.timeToLearn.replace(/[^0-9]/g, '') || '2'}W`,
      step: technique.steps.map((s, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: s.title,
        text: s.description,
      })),
    };
    const old = document.querySelector('script[data-structured="technique-howto"]');
    if (old) old.remove();
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-structured', 'technique-howto');
    script.textContent = JSON.stringify(howToSchema);
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [technique]);

  if (!technique) return <Navigate to="/techniques" replace />;

  const related = technique.relatedTechniques
    .map(s => TECHNIQUES.find(t => t.slug === s))
    .filter(Boolean);

  return (
    <LazyMotion features={domAnimation}>
      <SEOHead
        customTitle={`${technique.name} (${technique.nameEn}) 完整教學 | 匹克球技巧百科`}
        customDescription={`${technique.tagline} — 深度步驟分解、常見錯誤、練習菜單與職業選手心法，讓你快速掌握這個${technique.level}級技巧。`}
      />
      <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50/30 to-white">
        {/* Hero */}
        <section className="pt-16 pb-8 md:pt-24 md:pb-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <Link to="/techniques" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-emerald-600 mb-6 transition-colors">
              ← 返回技巧百科
            </Link>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{technique.level}</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700">{technique.category}</span>
              <span className="text-xs text-neutral-500">難度 {'★'.repeat(technique.difficulty)}{'☆'.repeat(5 - technique.difficulty)}</span>
            </div>

            <m.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-black text-neutral-900 mb-2 tracking-tight leading-tight"
            >
              {technique.name}
            </m.h1>
            <p className="text-lg md:text-xl text-neutral-400 font-medium mb-3">{technique.nameEn}</p>
            <p className="text-base md:text-lg text-neutral-700 leading-relaxed">{technique.tagline}</p>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-white rounded-xl border border-neutral-100 p-4">
                <div className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">學習時間</div>
                <div className="text-neutral-900 font-bold mt-1">{technique.timeToLearn}</div>
              </div>
              <div className="bg-white rounded-xl border border-neutral-100 p-4">
                <div className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">使用時機</div>
                <div className="text-neutral-900 font-bold text-sm mt-1">{technique.whenToUse}</div>
              </div>
              <div className="bg-white rounded-xl border border-neutral-100 p-4 col-span-2 md:col-span-1">
                <div className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">YouTube 搜尋</div>
                <div className="text-sm mt-1 space-y-0.5">
                  {technique.videoKeywords.slice(0, 2).map(k => (
                    <a key={k} href={`https://www.youtube.com/results?search_query=${encodeURIComponent(k)}`} target="_blank" rel="noopener" className="block text-emerald-600 hover:underline">{k}</a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 max-w-4xl pb-20">
          {/* Key Points */}
          <Section title="關鍵要點" icon="🎯">
            <ul className="space-y-2">
              {technique.keyPoints.map((p, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                  <span className="text-neutral-700 leading-relaxed">{p}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* Steps */}
          <Section title="步驟分解" icon="📝">
            <div className="space-y-4">
              {technique.steps.map((s, i) => (
                <div key={i} className="flex gap-4 p-4 bg-gradient-to-r from-emerald-50/50 to-transparent rounded-xl">
                  <div className="flex-shrink-0 text-3xl font-black text-emerald-500">{i + 1}</div>
                  <div>
                    <h3 className="font-bold text-neutral-900 mb-1">{s.title}</h3>
                    <p className="text-neutral-700 text-sm md:text-base leading-relaxed">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Common Mistakes */}
          <Section title="常見錯誤與修正" icon="⚠️">
            <div className="space-y-4">
              {technique.commonMistakes.map((m, i) => (
                <div key={i} className="border-l-4 border-amber-400 bg-amber-50/50 p-4 rounded-r-xl">
                  <div className="text-sm font-semibold text-amber-800 mb-1">❌ 錯誤：{m.mistake}</div>
                  <div className="text-sm text-neutral-700">✅ 修正：{m.fix}</div>
                </div>
              ))}
            </div>
          </Section>

          {/* Drills */}
          <Section title="專屬練習菜單" icon="💪">
            <div className="grid md:grid-cols-2 gap-4">
              {technique.drills.map((d, i) => (
                <div key={i} className="bg-gradient-to-br from-neutral-50 to-white rounded-xl p-5 border border-neutral-100">
                  <h3 className="font-bold text-neutral-900 mb-2">{d.name}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed mb-3">{d.description}</p>
                  <div className="inline-block text-xs font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
                    🎯 {d.reps}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Pro Tip */}
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-2xl p-6 md:p-8 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">💎</span>
              <h2 className="text-xl font-bold">職業選手心法</h2>
            </div>
            <p className="text-neutral-200 leading-relaxed">{technique.proTip}</p>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <Section title="相關技巧" icon="🔗">
              <div className="grid md:grid-cols-3 gap-3">
                {related.map(r => r && (
                  <Link
                    key={r.slug}
                    to={`/techniques/${r.slug}`}
                    className="block bg-neutral-50 hover:bg-emerald-50 rounded-xl p-4 transition-colors border border-transparent hover:border-emerald-200"
                  >
                    <div className="font-bold text-neutral-900 mb-1">{r.name}</div>
                    <div className="text-xs text-neutral-500">{r.nameEn}</div>
                  </Link>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
    </LazyMotion>
  );
};

export default TechniqueDetail;
