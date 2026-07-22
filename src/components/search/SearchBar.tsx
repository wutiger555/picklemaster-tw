import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SearchEntry } from '../../data/searchFilter';
import { searchEntries } from '../../data/searchFilter';

type SearchResult = SearchEntry;

interface SearchBarProps {
  variant?: 'header' | 'hero';
  onClose?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ variant = 'header', onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [index, setIndex] = useState<SearchEntry[] | null>(null);
  const loadingRef = useRef(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 首次聚焦／輸入才動態載入完整索引（球場+選手+技巧+文章+術語），
  // 讓大型資料檔 code-split，不打進每頁初始 bundle
  const ensureIndex = useCallback(() => {
    if (index || loadingRef.current) return;
    loadingRef.current = true;
    import('../../data/searchIndex')
      .then(m => m.buildSearchIndex())
      .then(setIndex)
      .catch(() => { loadingRef.current = false; });
  }, [index]);

  // 搜尋邏輯（索引就緒後即時過濾；索引載入中會在 index 到位後自動重跑）
  useEffect(() => {
    if (query.trim().length < 1) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    ensureIndex();
    if (!index) return;
    const filtered = searchEntries(index, query);
    setResults(filtered);
    setIsOpen(filtered.length > 0);
    setSelectedIndex(0);
  }, [query, index, ensureIndex]);

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
      '選手': 'bg-rose-100 text-rose-700',
      '技巧': 'bg-cyan-100 text-cyan-700',
      '文章': 'bg-amber-100 text-amber-700',
      '術語': 'bg-teal-100 text-teal-700',
      '賽事': 'bg-indigo-100 text-indigo-700',
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
            onFocus={() => { ensureIndex(); if (query.length >= 1) setIsOpen(true); }}
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
          onFocus={() => { ensureIndex(); if (query.length >= 1) setIsOpen(true); }}
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
