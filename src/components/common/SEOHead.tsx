import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { pageSEO, generateBreadcrumbStructuredData } from '../../utils/seo';

interface SEOHeadProps {
  page?: string;
  customTitle?: string;
  customDescription?: string;
  title?: string;
  description?: string;
  image?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({ page, customTitle, customDescription, title: propTitle, description: propDescription, image }) => {
  const location = useLocation();

  // 根據路徑自動判斷頁面
  const getPageFromPath = (pathname: string): string => {
    const path = pathname.replace('/picklemaster-tw', '').replace('/', '') || 'home';
    return path;
  };

  const currentPage = page || getPageFromPath(location.pathname);
  const seoConfig = pageSEO[currentPage] || pageSEO.home;

  const title = propTitle || customTitle || seoConfig.title;
  const description = propDescription || customDescription || seoConfig.description;
  const keywords = seoConfig.keywords;

  useEffect(() => {
    // 更新 title
    document.title = title;

    // 更新或創建 meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // 更新或創建 meta keywords
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', keywords);
    }

    // 更新 Open Graph tags
    const updateOGTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    updateOGTag('og:title', title);
    updateOGTag('og:description', description);
    updateOGTag('og:url', `https://picklemastertw.site${location.pathname}`);
    if (image) {
      updateOGTag('og:image', image);
    }

    // 更新 Twitter tags
    const updateTwitterTag = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    updateTwitterTag('twitter:title', title);
    updateTwitterTag('twitter:description', description);

    // 更新 canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `https://picklemastertw.site${location.pathname}`);

    // 添加麵包屑結構化資料
    const breadcrumbItems = getBreadcrumbItems(currentPage);
    if (breadcrumbItems.length > 1) {
      const breadcrumbData = generateBreadcrumbStructuredData(breadcrumbItems);

      // 移除舊的麵包屑資料
      const oldBreadcrumb = document.querySelector('script[data-breadcrumb]');
      if (oldBreadcrumb) {
        oldBreadcrumb.remove();
      }

      // 添加新的麵包屑資料
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-breadcrumb', 'true');
      script.textContent = JSON.stringify(breadcrumbData);
      document.head.appendChild(script);
    }
  }, [title, description, keywords, location.pathname, currentPage]);

  return null; // 這是一個只執行副作用的組件
};

// 生成麵包屑項目
const getBreadcrumbItems = (page: string): Array<{ name: string, url: string }> => {
  const baseUrl = 'https://picklemastertw.site';
  const breadcrumbs: Array<{ name: string, url: string }> = [
    { name: '首頁', url: baseUrl }
  ];

  const pageNames: Record<string, string> = {
    'courts': '球場地圖',
    'rules': '規則教學',
    'equipment': '裝備推薦',
    'learning-paths': '學習路徑',
    'learning': '技巧教學',
    'game': '互動遊戲',
    'scorer': '計分器',
    'resources': '學習資源',
    'about': '關於我們',
    'faq': '常見問題'
  };

  if (page !== 'home' && pageNames[page]) {
    breadcrumbs.push({
      name: pageNames[page],
      url: `${baseUrl}/${page}`
    });
  }

  return breadcrumbs;
};

export default SEOHead;
