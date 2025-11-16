import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
}

const SEO = ({
  title = '匹克大師台灣 | Picklemaster Taiwan - 台灣匹克球玩家社群與資源平台',
  description = '台灣最完整的匹克球（Pickleball）學習平台！提供全台球場地圖、互動式規則教學、3D球場配置、裝備選購指南、職業選手裝備推薦、學習路徑與測驗。加入台灣匹克球社群，一起享受這項有趣的運動！',
  keywords = '匹克球,pickleball,台灣匹克球,匹克球規則,匹克球球場,匹克球教學,匹克球裝備,球拍推薦,運動,球類運動,pickleball taiwan,匹克球協會',
  ogImage = '/picklemaster-tw/og-image.png',
  canonical,
}: SEOProps) => {
  useEffect(() => {
    // 更新標題
    document.title = title;

    // 更新或創建 meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }

      element.setAttribute('content', content);
    };

    // 基本 meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', ogImage, true);
    updateMetaTag('og:type', 'website', true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', ogImage);

    // Canonical URL
    if (canonical) {
      let linkElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;

      if (!linkElement) {
        linkElement = document.createElement('link');
        linkElement.setAttribute('rel', 'canonical');
        document.head.appendChild(linkElement);
      }

      linkElement.setAttribute('href', canonical);
    }
  }, [title, description, keywords, ogImage, canonical]);

  return null;
};

export default SEO;
