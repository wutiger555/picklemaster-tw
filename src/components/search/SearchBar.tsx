import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

interface SearchResult {
  title: string;
  description: string;
  path: string;
  category: string;
  keywords: string[];
}

const searchDatabase: SearchResult[] = [
  {
    title: '找球場',
    description: '全台 55+ 匹克球場地圖與詳細資訊',
    path: ROUTES.COURTS,
    category: '球場',
    keywords: ['球場', '地圖', '場地', '台北', '台中', '高雄', '台南', 'court', '找', '尋找']
  },
  {
    title: '匹克球規則',
    description: '互動式學習匹克球規則與場地配置',
    path: ROUTES.RULES,
    category: '學習',
    keywords: ['規則', 'rule', '雙彈跳', '廚房區', '發球', '計分', '教學']
  },
  {
    title: '球拍裝備',
    description: '球拍選購指南與專業推薦',
    path: ROUTES.EQUIPMENT,
    category: '裝備',
    keywords: ['球拍', 'paddle', '裝備', '選購', '推薦', '材質', '重量', '購買']
  },
  {
    title: '學習路徑',
    description: '從新手到進階的完整學習系統',
    path: ROUTES.LEARNING_PATHS,
    category: '學習',
    keywords: ['學習', 'learning', '新手', '進階', '課程', '訓練', '教學']
  },
  {
    title: '技巧教學',
    description: '3D 互動教學與技巧訓練',
    path: ROUTES.LEARNING,
    category: '學習',
    keywords: ['技巧', '教學', '訓練', '3D', '互動', '發球', '截擊', '戰術']
  },
  {
    title: '計分器',
    description: '專業比賽計分工具',
    path: ROUTES.SCORER,
    category: '工具',
    keywords: ['計分', 'scorer', '比賽', '裁判', '計時']
  },
  {
    title: '互動遊戲',
    description: '線上匹克球模擬遊戲',
    path: ROUTES.GAME,
    category: '工具',
    keywords: ['遊戲', 'game', '練習', '模擬', '線上']
  },
  {
    title: '資源中心',
    description: '影片教學、文章與社群連結',
    path: ROUTES.RESOURCES,
    category: '資源',
    keywords: ['資源', 'resources', '影片', 'youtube', '社群', '協會']
  },
  {
    title: '常見問題',
    description: '匹克球常見問題解答',
    path: ROUTES.FAQ,
    category: '幫助',
    keywords: ['FAQ', '問題', '幫助', 'help', '新手', '入門']
  }
];

interface SearchBarProps {
  variant?: 'header' | 'hero';
  onClose?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ variant = 'header', onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 搜尋邏輯
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const searchQuery = query.toLowerCase();
    const filtered = searchDatabase.filter(item => {
      return (
        item.title.toLowerCase().includes(searchQuery) ||
        item.description.toLowerCase().includes(searchQuery) ||
        item.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery))
      );
    });

    setResults(filtered);
    setIsOpen(filtered.length > 0);
    setSelectedIndex(0);
  }, [query]);

  // 點擊外部關閉
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 鍵盤導航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelect = (result: SearchResult) => {
    navigate(result.path);
    setQuery('');
    setIsOpen(false);
    onClose?.();
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      '球場': 'bg-purple-100 text-purple-700',
      '學習': 'bg-blue-100 text-blue-700',
      '裝備': 'bg-orange-100 text-orange-700',
      '工具': 'bg-green-100 text-green-700',
      '資源': 'bg-pink-100 text-pink-700',
      '幫助': 'bg-gray-100 text-gray-700',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  if (variant === 'hero') {
    return (
      <div ref={searchRef} className="relative w-full max-w-2xl">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
            placeholder="搜尋球場、規則、裝備..."
            className="w-full pl-14 pr-5 py-5 text-lg bg-white/95 backdrop-blur-sm border-2 border-gray-200 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-200 transition-all outline-none shadow-xl"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setIsOpen(false);
              }}
              className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* 搜尋結果 */}
        {isOpen && results.length > 0 && (
          <div className="absolute top-full mt-3 w-full bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <button
                key={result.path}
                onClick={() => handleSelect(result)}
                className={`w-full text-left px-6 py-4 border-b border-gray-100 last:border-b-0 transition-all ${
                  index === selectedIndex
                    ? 'bg-primary-50'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${getCategoryColor(result.category)}`}>
                        {result.category}
                      </span>
                      <h4 className="font-bold text-gray-900">{result.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{result.description}</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Header variant
  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="搜尋..."
          className="w-48 pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* 搜尋結果 */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-96 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={result.path}
              onClick={() => handleSelect(result)}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0 transition-all ${
                index === selectedIndex
                  ? 'bg-primary-50'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${getCategoryColor(result.category)}`}>
                      {result.category}
                    </span>
                    <h4 className="font-bold text-sm text-gray-900">{result.title}</h4>
                  </div>
                  <p className="text-xs text-gray-600">{result.description}</p>
                </div>
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
