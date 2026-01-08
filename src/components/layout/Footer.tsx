import { Link } from 'react-router-dom';
import { ROUTES, BRAND } from '../../utils/constants';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const exploreLinks = [
    { path: ROUTES.HOME, label: '首頁' },
    { path: ROUTES.NEWCOMER_GUIDE, label: '新手指南' },
    { path: ROUTES.COURTS, label: '尋找球場' },
    { path: ROUTES.EQUIPMENT, label: '裝備攻略' },
  ];

  const learnLinks = [
    { path: ROUTES.RULES, label: '規則教學' },
    { path: ROUTES.LEARNING, label: '互動課程' },
    { path: ROUTES.LEARNING_PATHS, label: '學習路徑' },
    { path: ROUTES.SCORER, label: '計分工具' },
  ];

  const companyLinks = [
    { path: ROUTES.ABOUT, label: '關於我們' },
    { path: ROUTES.CONTACT, label: '聯絡我們' },
    { path: ROUTES.PRIVACY_POLICY, label: '隱私權政策' },
  ];

  return (
    <footer className="bg-neutral-950 text-white pt-20 pb-10 border-t border-neutral-900">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">

          {/* Brand Column */}
          <div className="md:col-span-4 space-y-6">
            <Link to={ROUTES.HOME} className="inline-block">
              <h3 className="text-3xl font-black tracking-tighter text-white">
                PICKLE<span className="text-emerald-500">MASTER</span>
              </h3>
            </Link>
            <p className="text-neutral-400 leading-relaxed font-medium">
              EMPWOER YOUR GAME.<br />
              台灣最完整的匹克球學習平台，致力於推廣這項新興運動，讓每個人都能享受揮拍的樂趣。
            </p>
            <div className="flex space-x-4 pt-2">
              {/* Social placeholders could go here */}
              <a href="https://github.com/wutiger555/picklemaster-tw" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">EXPLORE</h4>
              <ul className="space-y-4">
                {exploreLinks.map(link => (
                  <li key={link.path}>
                    <Link to={link.path} className="text-neutral-400 hover:text-emerald-400 transition-colors text-sm font-medium">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">LEARN</h4>
              <ul className="space-y-4">
                {learnLinks.map(link => (
                  <li key={link.path}>
                    <Link to={link.path} className="text-neutral-400 hover:text-emerald-400 transition-colors text-sm font-medium">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">COMPANY</h4>
              <ul className="space-y-4">
                {companyLinks.map(link => (
                  <li key={link.path}>
                    <Link to={link.path} className="text-neutral-400 hover:text-emerald-400 transition-colors text-sm font-medium">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-neutral-500 text-xs">
            &copy; {currentYear} {BRAND.NAME}. All rights reserved. Taiwan.
          </p>
          <div className="flex gap-6">
            <span className="text-neutral-600 text-xs hover:text-neutral-400 cursor-pointer">Terms of Use</span>
            <span className="text-neutral-600 text-xs hover:text-neutral-400 cursor-pointer">Privacy Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
