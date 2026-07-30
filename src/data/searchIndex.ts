// 全站搜尋索引：涵蓋球場、選手、技巧、文章、術語與主要頁面。
// 僅透過動態 import 載入（見 SearchBar），大型資料檔獨立成 chunk，不進初始 bundle。
import { PLAYERS } from './playersData';
import { TECHNIQUES } from './techniquesData';
import { ARTICLES } from './articlesData';
import { GLOSSARY } from './glossaryData';
import { ROUTES } from '../utils/constants';
import type { CourtsData, Court } from '../types';
import type { SearchEntry } from './searchFilter';

export type { SearchEntry } from './searchFilter';

// 主要頁面（維持原本站內導覽的可搜尋性）
const STATIC_PAGES: SearchEntry[] = [
  { title: '找球場', description: '全台 129+ 匹克球場地圖與詳細資訊', path: ROUTES.COURTS, category: '球場', keywords: ['球場', '地圖', '場地', 'court', '找', '尋找', '附近'] },
  { title: '匹克球規則', description: '3D 互動式規則教學與場地配置', path: ROUTES.RULES, category: '學習', keywords: ['規則', 'rule', '雙彈跳', '廚房區', '發球', '計分'] },
  { title: '球拍裝備', description: '球拍選購指南與專業推薦', path: ROUTES.EQUIPMENT, category: '裝備', keywords: ['球拍', 'paddle', '裝備', '選購', '推薦', '材質'] },
  { title: '球拍資料庫', description: '各品牌球拍規格與比較', path: ROUTES.PADDLE_DATABASE, category: '裝備', keywords: ['球拍', 'paddle', '資料庫', '規格', '比較', 'JOOLA', 'Selkirk'] },
  { title: '學習路徑', description: '從新手到進階的完整學習系統', path: ROUTES.LEARNING_PATHS, category: '學習', keywords: ['學習', 'learning', '新手', '進階', '課程'] },
  { title: '技巧教學', description: '3D 互動教學與技巧訓練', path: ROUTES.LEARNING, category: '學習', keywords: ['技巧', '教學', '訓練', '3D', '互動'] },
  { title: '訓練菜單', description: '系統化每週逐日訓練計畫', path: ROUTES.TRAINING_PROGRAMS, category: '學習', keywords: ['訓練', '菜單', '課表', '練習', 'program'] },
  { title: '2026 賽事', description: '全台匹克球賽事總覽與行事曆', path: ROUTES.TOURNAMENTS, category: '賽事', keywords: ['賽事', '比賽', '報名', 'tournament', '賽程'] },
  { title: 'DUPR 評級', description: 'DUPR 評級制度與查詢指南', path: ROUTES.RATINGS, category: '學習', keywords: ['DUPR', '評級', '分級', 'rating', '積分'] },
  { title: '術語字典', description: '匹克球術語完整解釋', path: ROUTES.GLOSSARY, category: '術語', keywords: ['術語', '字典', '名詞', 'glossary'] },
  { title: '職業選手', description: '世界頂尖匹克球選手資料庫', path: ROUTES.PRO_PLAYERS, category: '選手', keywords: ['選手', '職業', 'player', 'pro'] },
  { title: '計分器', description: '專業比賽計分工具', path: ROUTES.SCORER, category: '工具', keywords: ['計分', 'scorer', '比賽', '裁判'] },
  { title: '互動遊戲', description: '線上匹克球模擬遊戲', path: ROUTES.GAME, category: '工具', keywords: ['遊戲', 'game', '練習', '模擬'] },
  { title: '常見問題', description: '匹克球常見問題解答', path: ROUTES.FAQ, category: '幫助', keywords: ['FAQ', '問題', '幫助', 'help', '入門'] },
];

const clean = (arr: (string | undefined)[]): string[] => arr.filter((s): s is string => !!s);
const typeLabel = (t: Court['type']) => (t === 'indoor' ? '室內' : t === 'covered' ? '風雨' : '戶外');

let cached: SearchEntry[] | null = null;

export async function buildSearchIndex(): Promise<SearchEntry[]> {
  if (cached) return cached;
  const entries: SearchEntry[] = [...STATIC_PAGES];

  // 職業選手
  for (const p of PLAYERS) {
    entries.push({
      title: p.name,
      description: `${p.country} 職業選手${p.rank ? ` · 世界排名 #${p.rank}` : ''}`,
      path: `/players/${p.slug}`,
      category: '選手',
      keywords: clean([p.name, p.nameZh, p.country, p.category, p.playingStyle, p.paddleBrand, p.signatureShot]),
    });
  }

  // 技巧百科
  for (const t of TECHNIQUES) {
    entries.push({
      title: `${t.name}（${t.nameEn}）`,
      description: t.tagline,
      path: `/techniques/${t.slug}`,
      category: '技巧',
      keywords: clean([t.name, t.nameEn, t.category, t.level, t.tagline]),
    });
  }

  // 深度專欄
  for (const a of ARTICLES) {
    entries.push({
      title: a.title,
      description: a.summary,
      path: `/articles/${a.slug}`,
      category: '文章',
      keywords: clean([a.title, a.category, ...(a.tags || [])]),
    });
  }

  // 術語字典（皆連往 /glossary，含 anchor 供定位）
  for (const g of GLOSSARY) {
    entries.push({
      title: g.term,
      description: g.definition.length > 48 ? g.definition.slice(0, 48) + '…' : g.definition,
      path: `${ROUTES.GLOSSARY}#${g.id}`,
      category: '術語',
      keywords: clean([g.term, g.termEn, g.category]),
    });
  }

  // 球場（動態載入 courts.json）
  try {
    const res = await fetch('/data/courts.json');
    const data: CourtsData = await res.json();
    for (const c of data.courts) {
      entries.push({
        title: c.name,
        description: `${c.location.city}${c.location.district || ''} · ${typeLabel(c.type)} · ${c.fee === 'free' ? '免費' : '付費'} · ${c.courts_count} 面`,
        path: `/courts/court-${c.id}`,
        category: '球場',
        keywords: clean([c.name, c.location.city, c.location.district, c.location.address, ...(c.features || [])]),
      });
    }
  } catch { /* 球場資料載入失敗不影響其他搜尋 */ }

  cached = entries;
  return entries;
}
