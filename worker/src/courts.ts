// 球場資料直接打包主站的 courts.json，約打只能開在站內收錄的球場（規劃 P4）。
// 主站更新球場後要重新部署 Worker 才會生效；GitHub Actions 在 courts.json 變動時會自動重新部署。
import data from '../../public/data/courts.json';

export interface CourtInfo {
  id: number;
  name: string;
  city: string;
  district?: string;
  type: 'indoor' | 'outdoor' | 'covered';
  courtsCount: number;
  net?: string;
  closed: boolean;
}

interface RawCourt {
  id: number;
  name: string;
  location: { city: string; district?: string };
  type: 'indoor' | 'outdoor' | 'covered';
  courts_count: number;
  net_type?: string;
  status?: string;
}

const COURTS = new Map<number, CourtInfo>(
  (data as { courts: RawCourt[] }).courts.map((c) => [
    c.id,
    {
      id: c.id,
      name: c.name,
      city: c.location.city,
      district: c.location.district,
      type: c.type,
      courtsCount: c.courts_count,
      net: c.net_type,
      closed: c.status === 'permanently_closed' || c.status === 'temporarily_closed',
    },
  ]),
);

export const getCourt = (id: number): CourtInfo | undefined => COURTS.get(id);
