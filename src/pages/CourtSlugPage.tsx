import { useParams } from 'react-router-dom';
import { parseCourtSlug } from '../utils/slugify';
import { getCityBySlug } from '../utils/cityData';
import { getAttributeBySlug } from '../utils/courtAttributes';
import CourtDetail from './CourtDetail';
import CityCourts from './CityCourts';
import AttributeCourts from './AttributeCourts';

// /courts/:slug 分派器：
//   court-{id}          → 球場詳細頁
//   城市 slug（taipei）  → 城市 Hub 頁
//   屬性 slug（free）    → 屬性清單頁
// 三組 slug 不會撞名：court- 有前綴，城市與屬性各自在 CITY_INFO / COURT_ATTRIBUTES 裡列舉。
const CourtSlugPage = () => {
  const { slug } = useParams<{ slug: string }>();
  if (slug && !parseCourtSlug(slug)) {
    if (getCityBySlug(slug)) return <CityCourts />;
    if (getAttributeBySlug(slug)) return <AttributeCourts />;
  }
  return <CourtDetail />;
};

export default CourtSlugPage;
