import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">台灣匹克球學院</h3>
            <p className="text-gray-400 text-sm">
              打造台灣最完整的匹克球學習平台，
              讓每個人都能輕鬆入門這項有趣的運動。
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">快速連結</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to={ROUTES.HOME} className="text-gray-400 hover:text-white transition-colors">
                  首頁
                </Link>
              </li>
              <li>
                <Link to={ROUTES.LEARNING} className="text-gray-400 hover:text-white transition-colors">
                  學習路徑
                </Link>
              </li>
              <li>
                <Link to={ROUTES.COURTS} className="text-gray-400 hover:text-white transition-colors">
                  球場地圖
                </Link>
              </li>
              <li>
                <Link to={ROUTES.ABOUT} className="text-gray-400 hover:text-white transition-colors">
                  關於匹克球
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">資源</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://pickleball.org.tw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  台灣匹克球協會
                </a>
              </li>
              <li>
                <a
                  href="https://usapickleball.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  美國匹克球協會
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">聯絡我們</h4>
            <p className="text-gray-400 text-sm mb-2">
              有任何問題或建議嗎？
            </p>
            <a
              href="https://github.com/wutiger555/picklemaster-tw"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-400 hover:text-primary-300 transition-colors text-sm"
            >
              GitHub 專案
            </a>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>&copy; {currentYear} 台灣匹克球學院. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
