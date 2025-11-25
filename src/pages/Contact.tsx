import { usePageTitle } from '../hooks/usePageTitle';
import SEOHead from '../components/common/SEOHead';

const Contact = () => {
  usePageTitle('聯絡我們');

  return (
    <div className="min-h-screen bg-neutral-50">
      <SEOHead
        page="contact"
        title="聯絡我們 - Picklemaster Taiwan"
        description="聯絡 Picklemaster Taiwan。若您有任何問題、建議或合作機會，歡迎隨時與我們聯繫。"
      />
      <main className="container mx-auto px-4 py-12">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg">
          <h1 className="text-4xl md:text-5xl font-black text-neutral-900 mb-8">
            聯絡我們 (Contact Us)
          </h1>
          <div className="prose prose-lg max-w-none text-neutral-700">
            <p className="text-blue-600 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <strong>[重要提示]：</strong>
              請在此處填寫您真實且有效的聯絡方式，例如電子郵件地址、聯絡表單或社群媒體連結。這能有效地建立使用者對您網站的信任感，也是 AdSense 審核的重點之一。
            </p>

            <p>
              我們非常樂意聽取您的意見！不論是關於網站功能的建議、球場資訊的更新，或是任何合作機會，都歡迎您透過以下方式與我們聯繫：
            </p>

            <ul>
              <li>
                <strong>電子郵件：</strong> [請填寫您的電子郵件地址]
              </li>
              <li>
                <strong>GitHub Issues：</strong>
                <a href="https://github.com/wutiger555/picklemaster-tw/issues" target="_blank" rel="noopener noreferrer">
                  點此提交問題或建議
                </a>
              </li>
              {/* 您也可以新增其他聯絡方式，例如 Facebook, Instagram 等 */}
            </ul>

            <p>
              我們會盡快回覆您的訊息，感謝您對 Picklemaster Taiwan 的支持！
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
