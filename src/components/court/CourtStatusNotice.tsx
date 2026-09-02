import type { Court } from '../../types';

const LABEL: Record<NonNullable<Court['status']>, string> = {
  temporarily_closed: '暫時關閉',
  permanently_closed: '已歇業',
};

/** 列表／地圖用的小標籤 */
export const CourtStatusChip = ({ status }: { status?: Court['status'] }) => {
  if (!status) return null;
  return (
    <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-bold">
      {LABEL[status]}
    </span>
  );
};

/**
 * 球場頁用的完整說明。
 * 一定顯示查證日期——沒有日期的「已關閉」跟沒有日期的「營業中」一樣不可信。
 */
const CourtStatusNotice = ({ court }: { court: Court }) => {
  if (!court.status) return null;
  return (
    <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg" aria-hidden="true">
          ⚠️
        </span>
        <h2 className="text-lg font-bold text-rose-900">此場地目前{LABEL[court.status]}</h2>
      </div>
      {court.status_note && <p className="text-sm text-rose-900 leading-relaxed mb-2">{court.status_note}</p>}
      {court.status_verified && (
        <p className="text-xs text-rose-700">
          查證日期：
          <time dateTime={court.status_verified} className="font-semibold">
            {court.status_verified}
          </time>
          <span className="ml-2">狀態若已恢復，歡迎回報更正。</span>
        </p>
      )}
    </div>
  );
};

export default CourtStatusNotice;
