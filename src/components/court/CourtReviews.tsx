import { useEffect, useState } from 'react';
import { Sheet, Toast, type ToastMsg } from '../play/Sheet';
import ProfileSheet, { type Profile } from '../play/ProfileSheet';
import { COURT_TAGS, MAX_TAGS, TAG_GROUPS, conflictsOf, tagByKey } from '../../utils/courtTags';
import { deleteCourtReview, ensurePlayer, getCachedMe, getCourtReviews, putCourtReview, type CourtReviews as Data } from '../../utils/playApi';

const TONE = {
  good: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  heads_up: 'border-amber-200 bg-amber-50 text-amber-800',
} as const;

function ago(ms: number) {
  const d = Math.floor((Date.now() - ms) / 86400_000);
  return d <= 0 ? '今天' : d === 1 ? '昨天' : d < 30 ? `${d} 天前` : `${Math.floor(d / 30)} 個月前`;
}

// 球場頁的「球友怎麼說」：只有標籤、沒有自由文字，統計近一年。
// 資料在瀏覽器端載入，預渲染頁不含這區（不做 aggregateRating 之類的結構化資料）。
export default function CourtReviews({ courtId, courtName }: { courtId: number; courtName: string }) {
  const [data, setData] = useState<Data | null>(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [needProfile, setNeedProfile] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMsg | null>(null);

  useEffect(() => {
    let alive = true;
    getCourtReviews(courtId)
      .then((d) => alive && setData(d))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [courtId]);

  const startEdit = () => {
    setPicked(data?.mine ?? []);
    setError(null);
    setOpen(true);
  };

  const toggle = (key: string) =>
    setPicked((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      const next = prev.filter((k) => !conflictsOf(key).includes(k));
      return next.length >= MAX_TAGS ? next : [...next, key];
    });

  const save = async (profile?: Profile) => {
    setBusy(true);
    setError(null);
    try {
      if (profile) await ensurePlayer(profile);
      const d = await putCourtReview(courtId, picked);
      setData(d);
      setOpen(false);
      setNeedProfile(false);
      setToast({ title: '謝謝你的評價！', sub: '其他球友來之前就能先知道這裡的狀況' });
    } catch (e) {
      setError(e instanceof Error ? e.message : '沒有送出成功');
    } finally {
      setBusy(false);
    }
  };

  const submit = () => {
    if (!picked.length) return setError('至少選一個標籤');
    if (getCachedMe()) save();
    else {
      setOpen(false);
      setNeedProfile(true);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      setData(await deleteCourtReview(courtId));
      setOpen(false);
      setToast({ title: '已刪除你的評價' });
    } catch (e) {
      setError(e instanceof Error ? e.message : '刪除失敗');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-neutral-100 p-6" aria-labelledby="court-reviews">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <h2 id="court-reviews" className="text-xl font-bold text-neutral-900">球友怎麼說</h2>
        {data && data.total > 0 && (
          <span className="whitespace-nowrap text-xs text-neutral-500">
            {data.total} 位球友 · 近一年{data.updatedAt ? ` · ${ago(data.updatedAt)}更新` : ''}
          </span>
        )}
      </div>
      <p className="mb-4 text-xs text-neutral-500">打過這裡的球友選的標籤，數字是選了這個標籤的人數。</p>

      {/* 固定高度的佔位，避免載入完成時版面跳動 */}
      {data === null && !failed ? (
        <div className="min-h-[104px] animate-pulse rounded-xl bg-neutral-50" aria-busy="true" />
      ) : failed ? (
        <p className="min-h-[56px] text-sm text-neutral-500">暫時讀不到球友評價，稍後再試。</p>
      ) : data && data.total > 0 ? (
        <div className="flex min-h-[56px] flex-wrap gap-2">
          {data.tags.map(({ tag, count }) => {
            const t = tagByKey.get(tag);
            if (!t) return null;
            return (
              <span key={tag} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${TONE[t.tone]}`}>
                {t.label}
                <b className="font-mono text-xs">{count}</b>
              </span>
            );
          })}
        </div>
      ) : (
        <div className="flex min-h-[56px] items-center gap-3 rounded-xl bg-neutral-50 p-3">
          <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-lime-300 text-base" aria-hidden>🏓</span>
          <p className="text-sm text-neutral-600">還沒有球友評過{courtName}。打過的話，花 10 秒幫下一位球友選幾個標籤吧。</p>
        </div>
      )}

      {!failed && (
        <button type="button" onClick={startEdit} className="mt-4 h-11 rounded-xl bg-neutral-900 px-4 text-sm font-bold text-white">
          {data?.mine ? '修改我的評價' : '我來評這座球場'}
        </button>
      )}

      <Sheet open={open} onClose={() => setOpen(false)} label="評這座球場">
        <h2 className="text-lg font-black text-neutral-900">{courtName}</h2>
        <p className="mb-4 text-[13px] text-neutral-500">選符合你經驗的標籤，最多 {MAX_TAGS} 個。互相矛盾的標籤只能選一個。</p>
        {TAG_GROUPS.map((g) => (
          <fieldset key={g} className="mb-4">
            <legend className="mb-1.5 text-xs font-bold text-neutral-500">{g}</legend>
            <div className="flex flex-wrap gap-1.5">
              {COURT_TAGS.filter((t) => t.group === g).map((t) => {
                const on = picked.includes(t.key);
                return (
                  <button key={t.key} type="button" aria-pressed={on} onClick={() => toggle(t.key)}
                    className={`rounded-full border-[1.5px] px-3 py-1.5 text-[13px] font-bold ${on ? (t.tone === 'good' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-amber-500 bg-amber-50 text-amber-800') : 'border-transparent bg-neutral-100 text-neutral-700'}`}>
                    {on ? '✓ ' : ''}{t.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
        {error && <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
        <button type="button" onClick={submit} disabled={busy}
          className="h-[52px] w-full rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-base font-black text-white shadow-lg shadow-teal-500/25 disabled:opacity-60">
          {busy ? '送出中…' : `送出（已選 ${picked.length}）`}
        </button>
        {data?.mine && (
          <button type="button" onClick={remove} disabled={busy} className="mt-2 h-11 w-full rounded-2xl text-sm font-bold text-red-600">刪除我的評價</button>
        )}
      </Sheet>

      <ProfileSheet
        open={needProfile}
        onClose={() => setNeedProfile(false)}
        title="最後一步：取個暱稱"
        confirmLabel="送出評價"
        note="評價只會顯示標籤的人數，不會列出你的暱稱。"
        busy={busy}
        error={error}
        onConfirm={(p) => save(p)}
      />
      <Toast msg={toast} onDone={() => setToast(null)} />
    </section>
  );
}
