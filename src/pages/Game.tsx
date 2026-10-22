import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PickleballGame from '../components/game/PickleballGame';
import { ROUTES } from '../utils/constants';
import { usePageTitle } from '../hooks/usePageTitle';
import { staggerContainer, staggerItem } from '../utils/animations';
import SEOHead from '../components/common/SEOHead';

const PHYSICS = [
  { value: '30–34 in', label: '78 吋落下的反彈高度', note: '依 USA Pickleball 球規調出球與地面的恢復係數' },
  { value: '0.43', label: '球拍反彈係數上限', note: 'PBCoR 規範，決定你最快能抽多快' },
  { value: '26 g', label: '戶外球重量', note: '洞洞球阻力大：抽得再快也飛不遠' },
];

const RULES = [
  { tag: '雙彈跳', text: '發球和接發球都要先落地一次，第三拍之後才能截擊。' },
  { tag: '廚房', text: '腳在廚房（含廚房線）時不能截擊，截擊後衝進廚房也算違例。' },
  { tag: '換發球制', text: '只有發球方能得分，報分是「發球方分數－接發方分數」。' },
  { tag: '觸身', text: '球在落地前打到身體就失分，就算那顆球本來會出界。' },
];

const SPECIAL_LIST = [
  { name: '烈焰爆裂抽擊', paddle: '赤焰・長拍', color: 'from-orange-500 to-red-600', text: '時速破百的火球直線轟出，接不準會被震退。' },
  { name: '天雷貫地', paddle: '蒼雷・標準拍', color: 'from-blue-500 to-indigo-600', text: '把球擊上高空，落雷般垂直砸下再暴衝彈跳。' },
  { name: '幻影分身', paddle: '幻月・寬拍', color: 'from-purple-500 to-fuchsia-600', text: '球分裂成三顆幻影蛇行，只有一顆是真的。' },
  { name: '絕對零度', paddle: '霜鋒・混合拍', color: 'from-cyan-400 to-sky-600', text: '極強下旋，落地瞬間凍結，幾乎彈不起來。' },
];

const TIPS = [
  { title: '低於網的球，別硬抽', text: '從網下往上抽，過網的餘裕很小，很容易掛網或被反擊。用 dink 放進對方廚房。' },
  { title: '接完發球就上網', text: '接發方不受第三拍限制，回完球馬上往廚房線移動，搶下網前主導權。' },
  { title: '第三拍放小球', text: '對手已經在網前時，從底線用「軟」放一顆落進廚房的球，再跟著上網。' },
  { title: '高球才進攻', text: '球彈到網子以上才是加速的時機。打對手腳下，比打空檔更難接。' },
];

const Game = () => {
  usePageTitle('匹克球對戰遊戲');

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/70 via-white to-white">
      <SEOHead
        title="Pickle Master 匹克球對戰遊戲｜真實物理 × 熱血必殺技"
        description="免下載的 3D 匹克球網頁遊戲：夜間體育館、四支真實規格球拍各帶一招必殺技（火焰抽擊、天雷貫地、幻影分身、絕對零度）。球的彈性、空氣阻力與旋轉照真實數據模擬，雙彈跳、廚房規則照比賽判，也有寫實模式。"
      />

      <section className="container mx-auto px-4 pt-8 pb-6 md:pt-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-3 flex items-center gap-3">
            <span className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-2 text-xl leading-none shadow-lg shadow-emerald-500/25">
              🎮
            </span>
            <span className="text-sm font-semibold uppercase tracking-wide text-teal-600">Pickleball Game</span>
          </div>
          <h1 className="mb-3 text-3xl font-bold text-neutral-900 md:text-4xl lg:text-5xl">匹克球對戰遊戲</h1>
          <p className="max-w-2xl text-lg text-neutral-600">
            底子是真的：球的彈性、球拍反彈係數、空氣阻力與旋轉照真實數據模擬，規則照比賽判。上面再疊一層熱血：挑一支球拍當武器，集滿能量放出必殺技。想專心學規則，也可以切到寫實模式。
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {['四支球拍 × 四招必殺', '真實物理引擎', '三種程度 AI', '寫實模式', 'Dink 挑戰', '手機觸控可玩'].map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 rounded-full border border-teal-100 bg-white/80 px-3 py-1.5 text-sm text-neutral-700 shadow-sm backdrop-blur-sm"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {t}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="container mx-auto px-4 pb-12">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}>
          <PickleballGame />
        </motion.div>
      </section>

      <section className="container mx-auto px-4 pb-6">
        <motion.div
          className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white md:p-8"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
        >
          <span className="text-xs font-bold uppercase tracking-wider text-fuchsia-300">Special Moves</span>
          <h2 className="mt-1 text-2xl font-bold">球拍就是武器：四招必殺技</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/70">
            完美擊球、致勝球和長來回都會累積能量，滿了按空白鍵（手機點「必殺」）蓄勢，下一拍放出。接到對手的必殺球時打出「完美」或「蓄滿」就能破解，還會反過來大量回能量。
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SPECIAL_LIST.map((sp) => (
              <div key={sp.name} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <div className={`bg-gradient-to-r ${sp.color} px-4 py-3`}>
                  <div className="text-lg font-black italic">{sp.name}</div>
                  <div className="text-xs font-semibold text-white/80">{sp.paddle}</div>
                </div>
                <p className="px-4 py-3 text-sm leading-relaxed text-white/75">{sp.text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <motion.div
          className="grid grid-cols-1 gap-6 lg:grid-cols-2"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.div variants={staggerItem} className="rounded-3xl border border-neutral-200/70 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg md:p-8">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Real Physics</span>
            <h2 className="mt-1 text-2xl font-bold text-neutral-900">照真實數據調出來的球感</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {PHYSICS.map((p) => (
                <div key={p.label} className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
                  <div className="text-2xl font-black text-emerald-700 tabular-nums">{p.value}</div>
                  <div className="mt-1 text-sm font-semibold text-neutral-800">{p.label}</div>
                  <div className="mt-1 text-xs leading-relaxed text-neutral-500">{p.note}</div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-neutral-600">
              上旋球落地後往前竄、切球會被地面煞住；擦網球可能滾過去也可能掉回來。出界、掛網都是物理算出來的，不是擲骰子決定。
            </p>
          </motion.div>

          <motion.div variants={staggerItem} className="rounded-3xl border border-neutral-200/70 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg md:p-8">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-500">Real Rules</span>
            <h2 className="mt-1 text-2xl font-bold text-neutral-900">邊玩邊學規則</h2>
            <ul className="mt-5 space-y-3">
              {RULES.map((r) => (
                <li key={r.tag} className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0 rounded-lg bg-orange-50 px-2 py-0.5 text-xs font-bold text-orange-600">{r.tag}</span>
                  <span className="text-sm leading-relaxed text-neutral-700">{r.text}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-neutral-600">
              犯規時遊戲會告訴你是哪一條規則。想看完整條文：
              <Link to={ROUTES.RULES} className="ml-1 font-semibold text-teal-600 hover:text-teal-700">
                匹克球規則 →
              </Link>
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-6 rounded-3xl bg-gradient-to-br from-slate-900 to-emerald-950 p-6 text-white md:p-8"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
        >
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Strategy</span>
          <h2 className="mt-1 text-2xl font-bold">打贏 AI 的四個訣竅（球場上也適用）</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TIPS.map((t, i) => (
              <div key={t.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-black text-emerald-300 tabular-nums">0{i + 1}</div>
                <div className="mt-1 font-bold">{t.title}</div>
                <p className="mt-1.5 text-sm leading-relaxed text-white/70">{t.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link to={ROUTES.COURTS} className="rounded-xl bg-emerald-400 px-4 py-2 font-bold text-emerald-950 hover:bg-emerald-300">
              找附近球場實戰 →
            </Link>
            <Link to={ROUTES.LEARNING_PATHS} className="rounded-xl bg-white/10 px-4 py-2 font-bold text-white hover:bg-white/15">
              學習路徑
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Game;
