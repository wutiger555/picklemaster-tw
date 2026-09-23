import { usePageTitle } from '../hooks/usePageTitle';
import SEOHead from '../components/common/SEOHead';

const PrivacyPolicy = () => {
  usePageTitle('隱私權政策');

  return (
    <div className="min-h-screen bg-neutral-50">
      <SEOHead
        page="privacy"
        title="隱私權政策 - Picklemaster Taiwan"
        description="Picklemaster Taiwan 的隱私權政策，說明我們如何蒐集、使用與保護您的個人資料。"
      />
      <main className="container mx-auto px-4 py-12">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg">
          <h1 className="text-4xl md:text-5xl font-black text-neutral-900 mb-8">
            隱私權政策 (Privacy Policy)
          </h1>
          <div className="prose prose-lg max-w-none text-neutral-700">
            <p>
              本站由 Picklemaster Taiwan 經營。瀏覽網站不需要註冊或登入。以下依個人資料保護法第 8 條，說明我們蒐集哪些資料、為什麼蒐集、存在哪裡、保存多久，以及你可以怎麼行使權利。
            </p>

            <h2>1. 瀏覽網站與工具</h2>
            <p>
              一般瀏覽不需要提供任何個人資料。計分器、訓練菜單進度等工具的資料只存在你自己瀏覽器的 localStorage，不會傳到本站。清除瀏覽器資料就會移除。
            </p>

            <h2>2. 揪團約打（/play/）</h2>
            <p>這是本站唯一會把資料存到伺服器的功能，而且只在你報名或開團時才會建立資料：</p>
            <ul>
              <li><strong>蒐集的資料</strong>：你自己取的暱稱、球拍頭像的樣式、自填的程度與 DUPR（選填）、報名與開團紀錄，以及你在固定球敘按下的「我會去」（只顯示人數，不顯示是誰；球敘過後兩天自動刪除），和你在球場頁選的評價標籤（只顯示各標籤的人數，不顯示是誰；只統計近一年，兩年後自動刪除）。系統會替這支手機產生一組隨機代號，用來辨識是同一位球友。我們<strong>不蒐集</strong>真實姓名、email、電話或生日。</li>
              <li><strong>目的</strong>：讓你報名、開團、候補遞補，以及顯示出席紀錄。團的名單只會顯示暱稱與頭像。</li>
              <li><strong>防濫用</strong>：送出資料時會經過 Cloudflare Turnstile 驗證是不是機器人。為了限制頻率，IP 位址只會以不可還原的雜湊值暫存，最多 2 天後刪除，不保存原始 IP。</li>
              <li><strong>存放地點</strong>：Cloudflare 的雲端服務（Workers 與 D1 資料庫，位於境外），以及你手機瀏覽器的 localStorage。</li>
              <li><strong>保存期間</strong>：每一團的報名明細在開打一年後自動刪除。你可以隨時自行刪除資料（見第 4 點）。</li>
              <li><strong>誰看得到</strong>：暱稱、頭像、自填程度會顯示在你報名的團頁上，任何打開連結的人都看得到。其他資料不會提供給第三方，也不會用於廣告。</li>
            </ul>

            <h2>3. 第三方服務</h2>
            <p>
              本網站使用 Google AdSense 顯示廣告，AdSense 可能使用 Cookies 提供更相關的廣告，你可以在瀏覽器設定中管理 Cookies。地圖圖磚、天氣資料、字型與外部影片由第三方提供，這些服務可能有自己的紀錄行為。
            </p>

            <h2>4. 你的權利</h2>
            <p>
              依個人資料保護法第 3 條，你可以查詢、閱覽、補充、更正你的資料，也可以要求停止使用或刪除。揪團約打的資料可以直接在揪團大廳的「我的團」頁面修改暱稱與程度，或按「刪除我的資料」一次清除。刪除後，暱稱會被移除，你之後的報名會取消，候補的球友會自動遞補。其他需求請透過聯絡頁面與我們聯繫。
            </p>

            <h2>5. 政策的變更</h2>
            <p>
              我們可能會不時更新本隱私權政策，任何變更都會公佈在這個頁面上。
            </p>

            <p>最後更新日期：2026-09-23</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
