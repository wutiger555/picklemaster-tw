import { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { m, LazyMotion, domAnimation } from 'framer-motion';
import { getArticleBySlug, ARTICLES } from '../data/articlesData';
import SEOHead from '../components/common/SEOHead';

const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getArticleBySlug(slug) : undefined;

  useEffect(() => {
    if (!article) return;
    // Article + FAQPage JSON-LD
    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.summary,
      author: { '@type': 'Organization', name: article.author },
      datePublished: article.publishedDate,
      dateModified: article.updatedDate,
      publisher: {
        '@type': 'Organization',
        name: 'Picklemaster Taiwan',
        logo: { '@type': 'ImageObject', url: 'https://picklemastertw.site/android-chrome-v2-512x512.png' }
      },
      mainEntityOfPage: `https://picklemastertw.site/articles/${article.slug}`,
      wordCount: article.sections.reduce((sum, s) => sum + s.content.length, 0),
      articleSection: article.category,
      keywords: article.tags.join(', '),
    };
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: article.faqs.map(f => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer }
      }))
    };
    const inject = (obj: object, key: string) => {
      const old = document.querySelector(`script[data-structured="${key}"]`);
      if (old) old.remove();
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.setAttribute('data-structured', key);
      s.textContent = JSON.stringify(obj);
      document.head.appendChild(s);
      return s;
    };
    const base = 'https://picklemastertw.site';
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '首頁', item: base + '/' },
        { '@type': 'ListItem', position: 2, name: '深度專欄', item: base + '/articles' },
        { '@type': 'ListItem', position: 3, name: article.title, item: `${base}/articles/${article.slug}` },
      ],
    };
    const s1 = inject(articleSchema, 'article');
    const s2 = inject(faqSchema, 'article-faq');
    const s3 = inject(breadcrumbSchema, 'article-breadcrumb');
    return () => { s1.remove(); s2.remove(); s3.remove(); };
  }, [article]);

  if (!article) return <Navigate to="/articles" replace />;

  // 相關文章（同分類，排除自己）
  const related = ARTICLES.filter(a => a.category === article.category && a.slug !== article.slug).slice(0, 3);

  return (
    <LazyMotion features={domAnimation}>
      <SEOHead
        customTitle={`${article.title} | 匹克球深度專欄`}
        customDescription={article.summary}
      />
      <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50/30 to-white">
        {/* Hero */}
        <section className="pt-16 pb-8 md:pt-24">
          <div className="container mx-auto px-4 max-w-4xl">
            <nav className="flex flex-wrap items-center gap-1.5 text-sm text-neutral-500 mb-6" aria-label="breadcrumb">
              <Link to="/" className="hover:text-emerald-600 transition-colors">首頁</Link>
              <span className="text-neutral-300">/</span>
              <Link to="/articles" className="hover:text-emerald-600 transition-colors">深度專欄</Link>
              <span className="text-neutral-300">/</span>
              <span className="text-neutral-700 font-medium line-clamp-1">{article.title}</span>
            </nav>

            <div className="flex items-center gap-3 text-xs text-neutral-500 mb-3 flex-wrap">
              <span className="font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{article.category}</span>
              <span>📅 {article.publishedDate}</span>
              <span>⏱️ {article.readingTime} 分鐘</span>
              <span>✍️ {article.author}</span>
            </div>

            <m.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-black text-neutral-900 mb-3 tracking-tight leading-tight"
            >
              {article.title}
            </m.h1>
            <p className="text-lg md:text-xl text-neutral-600 leading-relaxed mb-6">{article.subtitle}</p>

            <div className="text-7xl md:text-9xl text-center py-8 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-3xl my-6">
              {article.coverEmoji}
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 max-w-4xl pb-20">
          {/* Table of Contents */}
          <aside className="bg-white rounded-2xl border border-neutral-100 p-5 md:p-6 mb-8">
            <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3">本文目錄</h2>
            <ol className="space-y-1 text-sm">
              {article.tableOfContents.map((t, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-emerald-500 font-bold">{i + 1}.</span>
                  <a href={`#section-${i}`} className="text-neutral-700 hover:text-emerald-600 transition-colors">{t}</a>
                </li>
              ))}
            </ol>
          </aside>

          {/* Summary */}
          <div className="bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 rounded-2xl p-5 md:p-6 mb-8 border border-emerald-100">
            <p className="text-neutral-700 leading-relaxed font-medium">{article.summary}</p>
          </div>

          {/* Sections */}
          <article className="prose prose-lg max-w-none">
            {article.sections.map((s, i) => (
              <section key={i} id={`section-${i}`} className="mb-10">
                <h2 className="text-2xl md:text-3xl font-black text-neutral-900 mb-4 mt-10 first:mt-0 pb-2 border-b-2 border-emerald-200">
                  {s.heading}
                </h2>
                <div
                  className="article-content text-neutral-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: s.content }}
                />
              </section>
            ))}
          </article>

          {/* FAQ */}
          {article.faqs.length > 0 && (
            <section className="mt-16 bg-white rounded-2xl border border-neutral-100 p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-black text-neutral-900 mb-6">常見問題</h2>
              <div className="space-y-4">
                {article.faqs.map((faq, i) => (
                  <details key={i} className="group border-b border-neutral-100 last:border-0 pb-4">
                    <summary className="font-bold text-neutral-900 cursor-pointer list-none flex items-center justify-between hover:text-emerald-600 transition-colors">
                      <span>Q: {faq.question}</span>
                      <span className="text-2xl text-neutral-400 group-open:rotate-45 transition-transform">+</span>
                    </summary>
                    <p className="mt-3 text-neutral-700 leading-relaxed">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* References */}
          {article.references && article.references.length > 0 && (
            <section className="mt-8 bg-neutral-50 rounded-2xl p-5 md:p-6">
              <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3">參考資料</h3>
              <ul className="space-y-1 text-sm">
                {article.references.map((r, i) => (
                  <li key={i}>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                      → {r.title}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Tags */}
          <div className="mt-8 flex flex-wrap gap-2">
            {article.tags.map(t => (
              <span key={t} className="text-xs bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full">#{t}</span>
            ))}
          </div>

          {/* Related */}
          {related.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-bold text-neutral-900 mb-5">相關文章</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {related.map(r => (
                  <Link
                    key={r.slug}
                    to={`/articles/${r.slug}`}
                    className="block bg-white rounded-xl border border-neutral-100 p-4 hover:shadow-lg hover:border-emerald-200 transition-all"
                  >
                    <div className="text-3xl mb-2">{r.coverEmoji}</div>
                    <h3 className="font-bold text-neutral-900 text-sm leading-tight mb-1">{r.title}</h3>
                    <p className="text-xs text-neutral-500">{r.readingTime} 分鐘</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <style>{`
        .article-content p { margin-bottom: 1rem; }
        .article-content ul, .article-content ol { margin-bottom: 1rem; padding-left: 1.5rem; }
        .article-content ul { list-style-type: disc; }
        .article-content ol { list-style-type: decimal; }
        .article-content li { margin-bottom: 0.3rem; }
        .article-content strong { color: #059669; font-weight: 700; }
        .article-content table { width: 100%; margin-bottom: 1rem; border-collapse: collapse; }
        .article-content th, .article-content td { padding: 0.5rem; border-bottom: 1px solid #e5e7eb; }
        .article-content code { background: #f3f4f6; padding: 0.1rem 0.3rem; border-radius: 0.25rem; font-size: 0.9em; }
      `}</style>
    </LazyMotion>
  );
};

export default ArticleDetail;
