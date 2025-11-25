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
            <p className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
              <strong>[重要提示]：</strong>
              以下是隱私權政策的通用模板。請務必根據您網站的實際情況，諮詢法律專業人士，修改並填寫以下內容，以確保其完整與合規。您需要詳細說明您如何蒐集、使用、儲存及保護使用者的資料，特別是關於 Cookies、第三方服務 (如 Google AdSense) 的部分。
            </p>

            <h2>1. 我們蒐集的資訊</h2>
            <p>
              我們可能會蒐集您在使用本網站時提供的個人資訊，例如您的姓名、電子郵件地址等。我們也會自動蒐集某些資訊，例如您的 IP 位址、瀏覽器類型、作業系統等。
            </p>

            <h2>2. 資訊的使用</h2>
            <p>
              我們使用蒐集到的資訊來提供、維護及改善我們的服務，以及與您進行溝通。我們也可能使用這些資訊來個人化您的體驗，並提供您可能感興趣的內容或廣告。
            </p>

            <h2>3. 第三方服務</h2>
            <p>
              本網站使用第三方服務，如 Google AdSense，來顯示廣告。這些第三方服務可能會使用 Cookies 來蒐集您的資訊，以提供更具相關性的廣告。您可以透過瀏覽器的設定來管理 Cookies。
            </p>

            <h2>4. 您的權利</h2>
            <p>
              您有權存取、更正或刪除您的個人資訊。如果您希望行使這些權利，請透過我們的聯絡頁面與我們聯繫。
            </p>

            <h2>5. 政策的變更</h2>
            <p>
              我們可能會不時更新本隱私權政策。任何變更都將公佈在此頁面上。
            </p>

            <p>最後更新日期：2025-11-25</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
