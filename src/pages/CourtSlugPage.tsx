import { useParams } from 'react-router-dom';
import { parseCourtSlug } from '../utils/slugify';
import { getCityBySlug } from '../utils/cityData';
import CourtDetail from './CourtDetail';
import CityCourts from './CityCourts';

// /courts/:slug 分派器：court-{id} → 球場詳細頁；城市 slug（taipei 等）→ 城市 Hub 頁
const CourtSlugPage = () => {
  const { slug } = useParams<{ slug: string }>();
  if (slug && !parseCourtSlug(slug) && getCityBySlug(slug)) {
    return <CityCourts />;
  }
  return <CourtDetail />;
};

export default CourtSlugPage;
