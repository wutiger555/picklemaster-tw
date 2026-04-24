import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  pageSEO,
  generateBreadcrumbStructuredData,
  equipmentProductData,
  courtsLocationData,
  learningCourseData,
  faqStructuredData,
  tournamentsEventData,
  ratingsDefinedTermSet,
  glossaryDefinedTermSet
} from '../../utils/seo';

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

    // 添加頁面特定的結構化資料
    const addStructuredData = (data: any, dataType: string) => {
      // 移除舊的資料
      const oldData = document.querySelector(`script[data-structured="${dataType}"]`);
      if (oldData) {
        oldData.remove();
      }

      // 添加新的資料
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-structured', dataType);
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
    };

    // 根據頁面添加對應的結構化資料
    if (currentPage === 'equipment') {
      addStructuredData(equipmentProductData, 'equipment');
    } else if (currentPage === 'courts') {
      addStructuredData(courtsLocationData, 'courts');
    } else if (currentPage === 'learning') {
      addStructuredData(learningCourseData, 'learning');
    } else if (currentPage === 'faq') {
      addStructuredData(faqStructuredData, 'faq');
    } else if (currentPage === 'tournaments') {
      addStructuredData(tournamentsEventData, 'tournaments');
    } else if (currentPage === 'ratings') {
      addStructuredData(ratingsDefinedTermSet, 'ratings');
    } else if (currentPage === 'glossary') {
      addStructuredData(glossaryDefinedTermSet, 'glossary');
    } else if (currentPage === 'home') {
      // Home 頁也載入 FAQ 以增加 AI Overview 曝光
      addStructuredData(faqStructuredData, 'faq-home');
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
    'faq': '常見問題',
    'tournaments': '2026 賽事',
    'glossary': '術語字典',
    'ratings': 'DUPR 評級',
    'newcomer-guide': '新手懶人包',
    'techniques': '技巧百科',
    'articles': '深度專欄',
    'tools': '工具箱'
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
