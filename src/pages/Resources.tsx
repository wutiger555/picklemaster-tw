const Resources = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8">學習資源</h1>

        <div className="max-w-4xl mx-auto space-y-8">
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-4">官方組織</h2>
            <div className="space-y-4">
              <a
                href="https://pickleball.org.tw"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 transition-colors"
              >
                <h3 className="font-semibold text-lg mb-2">中華民國匹克球協會</h3>
                <p className="text-gray-600 text-sm">
                  台灣官方匹克球組織，提供賽事資訊、教練培訓、球場資訊等。
                </p>
              </a>

              <a
                href="https://usapickleball.org"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 transition-colors"
              >
                <h3 className="font-semibold text-lg mb-2">USA Pickleball</h3>
                <p className="text-gray-600 text-sm">
                  美國匹克球協會，提供官方規則、教學影片、賽事資訊。
                </p>
              </a>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-4">教學影片</h2>
            <div className="space-y-3 text-gray-700">
              <p>以下是一些優質的匹克球教學 YouTube 頻道：</p>
              <ul className="space-y-2">
                <li>• Pickleball Kitchen - 技術分析與戰術教學</li>
                <li>• Third Shot Sports - 新手友善的基礎教學</li>
                <li>• Pickleball 411 - 進階技巧與策略</li>
              </ul>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-4">推薦裝備</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">球拍選擇</h3>
                <p className="text-gray-700 text-sm mb-2">
                  新手建議選擇重量適中（7.5-8.5 oz）的複合材質球拍。
                </p>
                <ul className="text-gray-700 text-sm space-y-1">
                  <li>• 入門級：約 NT$ 1,500-3,000</li>
                  <li>• 中階：約 NT$ 3,000-6,000</li>
                  <li>• 高階：約 NT$ 6,000 以上</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">服裝與鞋子</h3>
                <p className="text-gray-700 text-sm">
                  建議穿著透氣運動服和具有良好抓地力的室內運動鞋或網球鞋。
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-4">社群與活動</h2>
            <div className="space-y-3 text-gray-700">
              <p>加入匹克球社群，認識球友，參加活動：</p>
              <ul className="space-y-2">
                <li>• Facebook：台灣匹克球社團</li>
                <li>• LINE：各地區匹克球 LINE 群組</li>
                <li>• Instagram：#台灣匹克球 #pickleballtaiwan</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Resources;
