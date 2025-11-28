import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { pageSEO } from '../utils/seo';

interface SEOProps {
  page: string;
  titleOverride?: string;
  descriptionOverride?: string;
  keywordsOverride?: string;
  canonicalOverride?: string;
}

const SEO: React.FC<SEOProps> = ({ page, titleOverride, descriptionOverride, keywordsOverride, canonicalOverride }) => {
  const location = useLocation();
  const config = pageSEO[page] || {};

  const title = titleOverride || config.title || '匹克球台灣 | Picklemaster Taiwan';
  const description = descriptionOverride || config.description || '台灣最完整的匹克球學習平台';
  const keywords = keywordsOverride || config.keywords || '匹克球,台灣匹克球,pickleball taiwan';

  // Determine canonical URL:
  // 1. Explicit override
  // 2. Config canonical
  // 3. Current location (default behavior)
  const canonical = canonicalOverride || config.canonical || `https://picklemastertw.site${location.pathname === '/' ? '' : location.pathname}`;

  const ogImage = config.ogImage || 'https://picklemastertw.site/og-image.png';

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Picklemaster Taiwan" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Picklemaster Taiwan",
          "url": "https://picklemastertw.site/",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://picklemastertw.site/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })}
      </script>

      {/* Page Specific Structured Data if available */}
      {config.structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(config.structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
