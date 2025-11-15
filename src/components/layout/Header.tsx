import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

const Header = () => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to={ROUTES.HOME} className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="text-xl font-bold text-gray-800">
              台灣匹克球學院
            </span>
          </Link>

          <div className="hidden md:flex space-x-6">
            <Link
              to={ROUTES.HOME}
              className="text-gray-700 hover:text-primary-500 transition-colors"
            >
              首頁
            </Link>
            <Link
              to={ROUTES.LEARNING}
              className="text-gray-700 hover:text-primary-500 transition-colors"
            >
              學習路徑
            </Link>
            <Link
              to={ROUTES.COURTS}
              className="text-gray-700 hover:text-primary-500 transition-colors"
            >
              球場地圖
            </Link>
            <Link
              to={ROUTES.ABOUT}
              className="text-gray-700 hover:text-primary-500 transition-colors"
            >
              關於匹克球
            </Link>
            <Link
              to={ROUTES.RESOURCES}
              className="text-gray-700 hover:text-primary-500 transition-colors"
            >
              資源
            </Link>
          </div>

          <button className="md:hidden p-2">
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
