import AdBanner from './AdBanner';

interface AdSidebarProps {
  /** 是否為測試模式 */
  testMode?: boolean;
  /** 自定義廣告單元ID */
  adSlot?: string;
}

/**
 * 側邊欄廣告組件
 * 用於在頁面側邊顯示垂直廣告
 */
const AdSidebar = ({ testMode = false, adSlot }: AdSidebarProps) => {
  return (
    <aside className="hidden lg:block sticky top-24 h-fit">
      <div className="space-y-6">
        {/* 主要廣告位 */}
        <AdBanner
          format="vertical"
          testMode={testMode}
          adSlot={adSlot || 'ad-sidebar-1'}
        />

        {/* 推薦連結 */}
        <div className="bg-gradient-to-br from-pickleball-50 to-sport-50 rounded-lg p-4 border border-pickleball-200">
          <h3 className="font-bold text-sm text-gray-800 mb-3 flex items-center">
            <span className="mr-2">🔗</span>
            推薦連結
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <a
                href="https://pickleball.org.tw"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sport-600 hover:text-sport-700 hover:underline"
              >
                中華民國匹克球協會
              </a>
            </li>
            <li>
              <a
                href="https://usapickleball.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sport-600 hover:text-sport-700 hover:underline"
              >
                USA Pickleball
              </a>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default AdSidebar;
