// 社群回報管道（Phase 0）
//
// 填入 Google 表單網址後，球場頁的「回報資訊有誤」與球場列表的「新增球場」入口會自動出現；
// 留空則不顯示任何入口，不會產生斷連結。
//
// REPORT_FORM_COURT_FIELD 是「預先填入球場名稱」用的 entry ID。
// 取得方式：Google 表單 → 右上「⋮」→「取得預先填入的連結」→ 在球場名稱欄填任意字 →
// 複製連結，其中 entry.XXXXXXXXX=... 的 entry.XXXXXXXXX 就是這個值。留空則不預填。

export const REPORT_FORM_URL: string = '';
export const REPORT_FORM_COURT_FIELD: string = '';
export const NEW_COURT_FORM_URL: string = '';

/** 球場資訊回報連結；未設定表單時回傳 null。 */
export const reportUrl = (courtName?: string): string | null => {
  if (!REPORT_FORM_URL) return null;
  if (!courtName || !REPORT_FORM_COURT_FIELD) return REPORT_FORM_URL;
  const sep = REPORT_FORM_URL.includes('?') ? '&' : '?';
  return `${REPORT_FORM_URL}${sep}${REPORT_FORM_COURT_FIELD}=${encodeURIComponent(courtName)}`;
};
