const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8">關於匹克球</h1>

        <div className="max-w-4xl mx-auto">
          <section className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">什麼是匹克球？</h2>
            <p className="text-gray-700 mb-4">
              匹克球（Pickleball）是一種結合網球、羽毛球和乒乓球元素的球拍運動，
              於 1965 年在美國華盛頓州誕生。這項運動使用特殊的塑膠球和實心球拍，
              在類似網球但較小的場地上進行。
            </p>
            <p className="text-gray-700">
              匹克球以其易學性、趣味性和社交性，成為全球成長最快速的運動之一。
              無論年齡或技術水平如何，都能輕鬆上手享受這項運動的樂趣。
            </p>
          </section>

          <section className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">球場規格</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">尺寸</h3>
                <ul className="text-gray-700 space-y-1">
                  <li>• 長度：13.41 公尺（44 英尺）</li>
                  <li>• 寬度：6.10 公尺（20 英尺）</li>
                  <li>• 非截擊區（廚房）：2.13 公尺（7 英尺）</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">設備</h3>
                <ul className="text-gray-700 space-y-1">
                  <li>• 球網高度：91.4 公分（中央）</li>
                  <li>• 球拍：實心複合材質</li>
                  <li>• 球：有孔塑膠球（26-40 個孔）</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">基本規則</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">發球規則</h3>
                <ul className="text-gray-700 space-y-1">
                  <li>• 發球時必須由下往上擊球</li>
                  <li>• 發球必須落在對角發球區內</li>
                  <li>• 只有發球方可以得分</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">雙跳規則（Two-Bounce Rule）</h3>
                <p className="text-gray-700">
                  發球後，接發球方必須讓球彈跳一次才能擊球，
                  發球方回擊時也必須讓球彈跳一次。之後才可進行截擊。
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">非截擊區（廚房區）</h3>
                <p className="text-gray-700">
                  球員不得站在非截擊區內截擊（volley）球。
                  但可以在球彈跳後進入該區域擊球。
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-4">匹克球在台灣</h2>
            <p className="text-gray-700 mb-4">
              匹克球在台灣的發展日益蓬勃，各縣市陸續增設專用球場。
              台灣匹克球協會積極推廣這項運動，舉辦各級賽事和教練培訓課程。
            </p>
            <p className="text-gray-700">
              從公園到運動中心，越來越多地方可以打匹克球。
              無論你是想運動健身、社交交友，或是追求競技挑戰，
              匹克球都是一個絕佳的選擇！
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
