const Learning = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8">學習路徑</h1>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          選擇適合你的學習路徑，從基礎到進階，系統化學習匹克球技巧。
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 新手入門 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-green-500 text-white p-6">
              <h2 className="text-2xl font-bold">新手入門</h2>
              <p className="text-green-100 mt-2">適合完全沒有接觸過匹克球的初學者</p>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>認識匹克球場地與器材</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>基本規則與計分方式</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>正確握拍與站位</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>發球與接發球技巧</span>
                </li>
              </ul>
              <button className="mt-6 w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors">
                開始學習
              </button>
            </div>
          </div>

          {/* 中階進修 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-blue-500 text-white p-6">
              <h2 className="text-2xl font-bold">中階進修</h2>
              <p className="text-blue-100 mt-2">已掌握基礎，想要提升技術水平</p>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span>進階擊球技巧（切球、旋轉球）</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span>戰術策略與場上走位</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span>雙打配合與溝通</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span>常見錯誤修正</span>
                </li>
              </ul>
              <button className="mt-6 w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors">
                開始學習
              </button>
            </div>
          </div>

          {/* 進階強化 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-purple-500 text-white p-6">
              <h2 className="text-2xl font-bold">進階強化</h2>
              <p className="text-purple-100 mt-2">追求卓越，準備參加比賽</p>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">✓</span>
                  <span>專業技術細節優化</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">✓</span>
                  <span>比賽心理與策略運用</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">✓</span>
                  <span>體能訓練與傷害預防</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">✓</span>
                  <span>教練培訓與教學技巧</span>
                </li>
              </ul>
              <button className="mt-6 w-full bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 transition-colors">
                開始學習
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learning;
