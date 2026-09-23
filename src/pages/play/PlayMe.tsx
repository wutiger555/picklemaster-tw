import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PaddleAvatar from '../../components/play/PaddleAvatar';
import { Toast, type ToastMsg } from '../../components/play/Sheet';
import { LEVEL_OPTIONS, dayLabel, hm } from '../../components/play/playFormat';
import {
  claimPlayerCode, deleteMyData, fetchMe, getCachedMe, getToken, issuePlayerCode, updateMe,
  type GameSummary, type Level, type Me,
} from '../../utils/playApi';

type MyGame = GameSummary & { myStatus: string; isHost: boolean };

const isLineBrowser = () => typeof navigator !== 'undefined' && /\bLine\//i.test(navigator.userAgent);
const isStandalone = () => typeof window !== 'undefined' && (window.matchMedia?.('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true);

export default function PlayMe() {
  const [me, setMe] = useState<Me | null>(getCachedMe());
  const [stats, setStats] = useState<{ played: number; hosted: number } | null>(null);
  const [games, setGames] = useState<MyGame[] | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [claim, setClaim] = useState('');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<ToastMsg | null>(null);
  const [nick, setNick] = useState(me?.nickname ?? '');
  const hasIdentity = !!getToken();

  useEffect(() => {
    if (!hasIdentity) return;
    fetchMe()
      .then((r) => {
        setMe(r.player);
        setNick(r.player.nickname);
        setStats(r.stats);
        setGames(r.games);
      })
      .catch((e: Error) => setToast({ title: '讀不到你的資料', sub: e.message }));
  }, [hasIdentity]);

  const save = async (patch: Partial<Pick<Me, 'nickname' | 'avatarSeed' | 'level'>>, done = '已更新') => {
    try {
      setMe(await updateMe(patch));
      setToast({ title: done });
    } catch (e) {
      setToast({ title: '沒有更新成功', sub: e instanceof Error ? e.message : '' });
    }
  };

  const doClaim = async () => {
    setBusy(true);
    try {
      const p = await claimPlayerCode(claim);
      setMe(p);
      setToast({ title: `歡迎回來，${p.nickname}`, sub: '紀錄已經轉到這支手機' });
      window.location.reload();
    } catch (e) {
      setToast({ title: '轉移失敗', sub: e instanceof Error ? e.message : '' });
    } finally {
      setBusy(false);
    }
  };

  if (!hasIdentity || !me) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="container mx-auto max-w-lg px-4 pb-24 pt-6 md:pt-10">
          <Link to="/play/" className="text-sm font-bold text-teal-700">← 揪團大廳</Link>
          <h1 className="mt-4 text-2xl font-black text-neutral-900">我的球拍</h1>
          <p className="mt-2 text-neutral-600">你還沒有球友身分。第一次報名或開團時取個暱稱，就會自動建立，不用註冊。</p>
          <Link to="/play/" className="mt-5 inline-flex h-12 items-center rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 px-5 font-black text-white shadow-lg shadow-teal-500/25">去挑一團</Link>
          <section className="mt-10 rounded-3xl bg-white p-5 shadow-sm">
            <h2 className="font-black text-neutral-900">換了手機？輸入球友碼</h2>
            <p className="mt-1 text-sm text-neutral-500">在舊手機的「我的球拍」產生一組球友碼，輸入到這裡就能把紀錄轉過來。</p>
            <form onSubmit={(e) => { e.preventDefault(); if (claim.trim()) doClaim(); }} className="mt-3 flex gap-2">
              <label htmlFor="play-claim" className="sr-only">球友碼</label>
              <input id="play-claim" value={claim} onChange={(e) => setClaim(e.target.value)} placeholder="PK-XXXX-XXXX" autoCapitalize="characters" className="h-12 flex-1 rounded-2xl border-[1.5px] border-neutral-200 px-4 font-mono text-base uppercase outline-none focus:border-teal-500" />
              <button type="submit" disabled={busy} className="h-12 rounded-2xl bg-neutral-900 px-4 font-bold text-white disabled:opacity-60">轉移</button>
            </form>
          </section>
        </div>
        <Toast msg={toast} onDone={() => setToast(null)} />
      </div>
    );
  }

  const saveHint = isStandalone()
    ? null
    : isLineBrowser()
      ? '你正在 LINE 裡瀏覽，資料只存在 LINE 裡。記下球友碼，或用瀏覽器開啟這頁再加到主畫面。'
      : 'iPhone 的 Safari 超過 7 天沒來，資料可能被清掉。把這頁加到主畫面（分享 → 加入主畫面）就不會。';

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto max-w-lg space-y-3 px-4 pb-24 pt-6 md:pt-10">
        <Link to="/play/" className="text-sm font-bold text-teal-700">← 揪團大廳</Link>

        <section className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-sm">
          <div className="grid justify-items-center">
            <PaddleAvatar name={me.nickname} seed={me.avatarSeed} size={56} />
            <button type="button" onClick={() => save({ avatarSeed: me.avatarSeed + 1 }, '換好新球拍了')} className="mt-1 text-xs font-bold text-teal-700">↻ 換一支</button>
          </div>
          <div className="flex-1">
            <label htmlFor="play-me-nick" className="text-xs font-bold text-neutral-500">暱稱</label>
            <div className="flex gap-2">
              <input id="play-me-nick" value={nick} maxLength={12} onChange={(e) => setNick(e.target.value)} className="h-10 min-w-0 flex-1 rounded-xl border-[1.5px] border-neutral-200 px-3 text-base font-bold outline-none focus:border-teal-500" />
              {nick.trim() && nick.trim() !== me.nickname && <button type="button" onClick={() => save({ nickname: nick.trim() })} className="rounded-xl bg-neutral-900 px-3 text-sm font-bold text-white">存</button>}
            </div>
            <small className="mt-1 block text-xs text-neutral-400">不用註冊，身分存在這支手機</small>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-white p-3 text-center shadow-sm"><b className="block font-mono text-2xl font-extrabold">{stats?.played ?? '–'}</b><small className="text-xs text-neutral-500">打過的場次</small></div>
          <div className="rounded-2xl bg-white p-3 text-center shadow-sm"><b className="block font-mono text-2xl font-extrabold">{stats?.hosted ?? '–'}</b><small className="text-xs text-neutral-500">開過的團</small></div>
        </div>

        <section className="rounded-3xl bg-white p-4 shadow-sm">
          <h2 className="mb-2 font-black text-neutral-900">我的程度 <small className="font-normal text-neutral-500">只用來配對</small></h2>
          <div className="flex flex-wrap gap-1.5">
            {LEVEL_OPTIONS.map((o) => (
              <button key={o.value} type="button" aria-pressed={me.level === o.value} onClick={() => save({ level: o.value as Level })}
                className={`rounded-xl border-[1.5px] px-3 py-2 text-[13px] font-bold ${me.level === o.value ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-transparent bg-neutral-100'}`}>{o.label}</button>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-4 shadow-sm">
          <h2 className="mb-2 font-black text-neutral-900">我的團</h2>
          {games === null ? (
            <div className="h-16 animate-pulse rounded-2xl bg-neutral-100" />
          ) : games.length ? (
            <ul className="grid gap-2">
              {games.map((g) => (
                <li key={g.id}>
                  <Link to={`/play/?g=${g.id}`} className="flex items-center gap-3 rounded-2xl bg-neutral-50 p-3">
                    <span className="w-14 text-center"><b className="block font-mono text-sm font-extrabold">{hm(g.startsAt)}</b><small className="text-[11px] text-neutral-500">{dayLabel(g.startsAt)}</small></span>
                    <span className="min-w-0 flex-1"><b className="block truncate text-sm">{g.title}</b><small className="text-xs text-neutral-500">{g.court.name}</small></span>
                    <span className={`whitespace-nowrap rounded-lg px-2 py-1 text-[11px] font-black ${g.isHost ? 'bg-neutral-900 text-white' : g.myStatus === 'waitlist' ? 'bg-lime-300 text-lime-900' : 'bg-teal-50 text-teal-700'}`}>
                      {g.isHost ? '團主' : g.myStatus === 'waitlist' ? '候補中' : '已報名'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neutral-500">還沒有報名任何團。<Link to="/play/" className="text-teal-700 underline">回大廳挑一團</Link></p>
          )}
        </section>

        <section className="rounded-3xl bg-white p-4 shadow-sm">
          <h2 className="font-black text-neutral-900">保存身分，換手機也帶得走</h2>
          {saveHint && <p className="mt-1 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">{saveHint}</p>}
          {code ? (
            <div className="mt-3 flex items-center gap-3 rounded-2xl bg-neutral-900 p-4 text-white">
              <b className="flex-1 font-mono text-2xl tracking-widest">{code}</b>
              <button type="button" onClick={() => navigator.clipboard?.writeText(code).then(() => setToast({ title: '已複製球友碼' }), () => undefined)} className="rounded-xl bg-white/15 px-3 py-2 text-sm font-bold">複製</button>
            </div>
          ) : (
            <button type="button" onClick={async () => { try { setCode((await issuePlayerCode()).code); } catch (e) { setToast({ title: '產生失敗', sub: e instanceof Error ? e.message : '' }); } }}
              className="mt-3 h-11 w-full rounded-2xl bg-neutral-100 font-bold text-neutral-800">產生球友碼</button>
          )}
          <p className="mt-2 text-xs text-neutral-500">在新手機的「我的球拍」輸入這組碼就能轉移。每組只能用一次，重新產生後舊的就失效。</p>
        </section>

        <details className="rounded-3xl bg-white p-4 text-sm shadow-sm">
          <summary className="cursor-pointer font-bold text-neutral-700">刪除我的資料</summary>
          <p className="mt-2 text-neutral-600">會清除暱稱、取消你之後的報名（空出的位子由候補遞補），你開的團也會取消。這個動作不能復原。</p>
          <button type="button" disabled={busy} onClick={async () => {
            if (!window.confirm('確定刪除？之後的報名和你開的團都會取消。')) return;
            setBusy(true);
            try { await deleteMyData(); window.location.href = '/play/'; } catch (e) { setToast({ title: '刪除失敗', sub: e instanceof Error ? e.message : '' }); setBusy(false); }
          }} className="mt-3 h-11 rounded-2xl bg-red-50 px-4 font-bold text-red-700">刪除我的資料</button>
        </details>
      </div>
      <Toast msg={toast} onDone={() => setToast(null)} />
    </div>
  );
}
