import { Link } from 'react-router-dom';
import { ROUTES, BRAND } from '../../utils/constants';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { path: ROUTES.HOME, label: '首頁' },
    { path: ROUTES.RULES, label: '規則教學' },
    { path: ROUTES.COURTS, label: '找球場' },
    { path: ROUTES.ABOUT, label: '關於' },
  ];

  const resources = [
    { url: 'https://pickleball.org.tw', label: '台灣匹克球協會' },
    { url: 'https://usapickleball.org', label: '美國匹克球協會' },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-auto">
      {/* 上方裝飾波浪 */}
      <div className="w-full">
        <svg viewBox="0 0 1440 80" className="w-full h-auto">
          <path
            fill="white"
            d="M0,32L48,37.3C96,43,192,53,288,48C384,43,480,21,576,16C672,11,768,21,864,26.7C960,32,1056,32,1152,26.7C1248,21,1344,11,1392,5.3L1440,0L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
            opacity="0.1"
          />
        </svg>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* 品牌區 */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-4 mb-4">
              <img src="/logo.png" alt="Picklemaster Taiwan Logo" className="w-20 h-20 object-contain" />
              <div>
                <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pickleball-400 to-sport-400">
                  {BRAND.NAME_ZH}
                </h3>
                <p className="text-xs text-gray-400">{BRAND.NAME}</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4 leading-relaxed">
              {BRAND.DESCRIPTION}
            </p>
            <div className="flex space-x-3">
              <a
                href="https://github.com/wutiger555/picklemaster-tw"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-700 hover:bg-pickleball-500 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 text-sm font-semibold"
              >
                GitHub
              </a>
            </div>
          </div>

          {/* 快速連結 */}
          <div>
            <h4 className="text-lg font-bold mb-4">
              快速連結
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-300 hover:text-pickleball-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 資源 */}
          <div>
            <h4 className="text-lg font-bold mb-4">
              相關資源
            </h4>
            <ul className="space-y-2">
              {resources.map((resource) => (
                <li key={resource.url}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-sport-400 transition-colors"
                  >
                    {resource.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="https://github.com/wutiger555/picklemaster-tw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-court-400 transition-colors"
                >
                  GitHub 專案
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 底部版權 */}
        <div className="border-t border-gray-700 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              &copy; {currentYear} {BRAND.NAME_ZH}. Taiwan Pickleball Community
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>Built with</span>
              <span className="text-sport-400">React</span>
              <span>+</span>
              <span className="text-pickleball-400">Vite</span>
              <span>+</span>
              <span className="text-court-400">Tailwind</span>
            </div>
          </div>
        </div>
      </div>

      {/* 底部裝飾 */}
      <div className="h-2 bg-gradient-to-r from-pickleball-500 via-sport-500 to-court-500"></div>
    </footer>
  );
};

export default Footer;
