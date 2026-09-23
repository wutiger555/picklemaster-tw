import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import CourtSeats, { PaddleRack } from '../../components/play/CourtSeats';
import PaddleAvatar from '../../components/play/PaddleAvatar';
import ProfileSheet, { type Profile } from '../../components/play/ProfileSheet';
import { Sheet, Toast, type ToastMsg } from '../../components/play/Sheet';
import { useCourts } from '../../components/play/useCourts';
import { FORMAT_LABEL, SCORING_LABEL, dayLabel, hm, levelText, needsNet, perPerson } from '../../components/play/playFormat';
import { shareUrlFor } from '../../config/play';
import { courtSlug } from '../../utils/slugify';
import {
  PlayApiError, ensurePlayer, getCachedMe, getGame, getManageKey, joinGame, leaveGame, reportGame, saveManageKey, updateGame, type GameDetail,
} from '../../utils/playApi';

const REDUCED = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function celebrate() {
  if (REDUCED) return;
  confetti({ particleCount: 70, spread: 70, startVelocity: 32, origin: { y: 0.45 }, colors: ['#d9f23f', '#10b981', '#2f6fd6', '#ffffff'], shapes: ['circle'], scalar: 1.1, disableForReducedMotion: true });
}

function Countdown({ to }: { to: number }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  let s = Math.max(0, Math.floor((to - now) / 1000));
  const d = Math.floor(s / 86400); s -= d * 86400;
  const h = Math.floor(s / 3600); s -= h * 3600;
  const m = Math.floor(s / 60); s -= m * 60;
  const cells: [number, string][] = [...(d ? [[d, '天'] as [number, string]] : []), [h, '時'], [m, '分'], [s, '秒']];
  return (
    <div className="mt-4 flex gap-1.5" aria-label="距離開打">
      {cells.map(([v, u]) => (
        <div key={u} className="min-w-[52px] rounded-xl bg-black/25 px-2 py-1 text-center">
          <b className="block font-mono text-xl font-extrabold leading-tight tabular-nums">{String(v).padStart(2, '0')}</b>
          <small className="text-[10px] opacity-80">{u}</small>
        </div>
      ))}
    </div>
  );
}

function icsFor(g: GameDetail) {
  const f = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const esc = (s: string) => s.replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');
  const url = shareUrlFor(g.id);
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//PickleMaster//Play//ZH', 'BEGIN:VEVENT',
    `UID:${g.id}@picklemastertw.com`, `DTSTAMP:${f(Date.now())}`, `DTSTART:${f(g.startsAt)}`, `DTEND:${f(g.startsAt + g.durationMin * 60000)}`,
    `SUMMARY:${esc(`🏓 ${g.title}`)}`, `LOCATION:${esc(g.court.name ?? '')}`, `DESCRIPTION:${esc(`${url}\n取消截止：${dayLabel(g.cancelDeadline)} ${hm(g.cancelDeadline)}`)}`, `URL:${url}`,
    'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', `DESCRIPTION:${esc(g.title)} 兩小時後開打`, 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
}

export default function PlayGame({ id }: { id: string }) {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const courts = useCourts();
  const [game, setGame] = useState<GameDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMsg | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sheetError, setSheetError] = useState<string | null>(null);
  const [hostOpen, setHostOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(params.has('created'));

  // 管理連結 ?k=… ：存進這支手機後就從網址拿掉，避免被截圖外流
  useEffect(() => {
    const k = params.get('k');
    if (!k) return;
    saveManageKey(id, k);
    params.delete('k');
    setParams(params, { replace: true });
  }, [id, params, setParams]);

  const reload = useCallback(async () => {
    try {
      setGame(await getGame(id));
      setLoadError(null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : '讀取失敗');
    }
  }, [id]);

  // 頁面在前景時每 30 秒更新名單；在背景就暫停，省免費額度
  useEffect(() => {
    reload();
    const tick = () => document.visibilityState === 'visible' && reload();
    const t = setInterval(tick, 30_000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [reload]);

  const court = useMemo(() => courts?.find((c) => c.id === game?.court.id), [courts, game]);
  const shareUrl = shareUrlFor(id);

  const share = async () => {
    if (!game) return;
    const text = `${game.title}｜${dayLabel(game.startsAt)} ${hm(game.startsAt)} @${game.court.name ?? ''}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: game.title, text, url: shareUrl });
        return;
      } catch { /* 使用者取消或不支援，改用 LINE 連結 */ }
    }
    window.open(`https://line.me/R/share?text=${encodeURIComponent(`${text}\n報名：${shareUrl}`)}`, '_blank', 'noopener');
  };

  const copyLink = async (url: string, what: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setToast({ title: `已複製${what}`, sub: url.replace(/^https?:\/\//, '') });
    } catch {
      window.prompt(`複製${what}`, url);
    }
  };

  const downloadIcs = () => {
    if (!game) return;
    const blob = new Blob([icsFor(game)], { type: 'text/calendar;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `picklemaster-${game.id}.ics`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const doJoin = async (profile?: Profile) => {
    setBusy(true);
    setSheetError(null);
    try {
      if (profile) await ensurePlayer(profile);
      const me = await joinGame(id);
      setProfileOpen(false);
      await reload();
      if (me.status === 'confirmed') {
        celebrate();
        setToast({ title: '報名成功！', sub: '開打前兩小時提醒可以加到行事曆', action: { label: '加到行事曆', onClick: downloadIcs } });
      } else {
        setToast({ title: `已掛上球拍架（候補 #${me.position ?? '?'}）`, sub: '有人取消會自動遞補' });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : '報名失敗';
      if (profileOpen) setSheetError(msg);
      else setToast({ title: '沒有報名成功', sub: msg });
    } finally {
      setBusy(false);
    }
  };

  const onJoinClick = () => (getCachedMe() ? doJoin() : setProfileOpen(true));

  const doLeave = async () => {
    if (!game) return;
    const late = Date.now() > game.cancelDeadline && game.me?.status === 'confirmed';
    if (late && !window.confirm('已經過了取消截止時間，現在取消會記一次「遲取消」。確定要取消嗎？')) return;
    setBusy(true);
    try {
      const r = await leaveGame(id);
      await reload();
      setToast({ title: '已取消報名', sub: r.status === 'late_cancel' ? '已記一次遲取消' : r.promoted ? '候補的球友已自動遞補' : '截止前取消，不留紀錄' });
    } catch (e) {
      setToast({ title: '取消失敗', sub: e instanceof Error ? e.message : '' });
    } finally {
      setBusy(false);
    }
  };

  const hostAction = async (patch: Record<string, unknown>, done: string) => {
    setBusy(true);
    try {
      setGame(await updateGame(id, patch));
      setToast({ title: done });
    } catch (e) {
      setToast({ title: '沒有改成功', sub: e instanceof Error ? e.message : '' });
    } finally {
      setBusy(false);
    }
  };

  if (loadError && !game) {
    return (
      <div className="container mx-auto min-h-[80vh] max-w-lg px-4 pt-12 text-center">
        <h1 className="text-xl font-black text-neutral-900">找不到這一團</h1>
        <p className="mt-2 text-neutral-600">{loadError}</p>
        <Link to="/play/" className="mt-6 inline-flex h-11 items-center rounded-2xl bg-neutral-900 px-5 font-bold text-white">回揪團大廳</Link>
      </div>
    );
  }
  if (!game) {
    return <div className="min-h-[100vh] bg-gradient-to-b from-[#2f6fd6] via-[#2f6fd6] to-white" aria-busy="true" />;
  }

  const filled = game.confirmed.length;
  const full = filled >= game.capacity;
  const myStatus = game.me?.status;
  const inGame = myStatus === 'confirmed' || myStatus === 'waitlist';
  // 團主本人不能退出（要取消整團）；持有管理連結的副團主若也報名了，照樣可以取消自己的名額
  const iAmHostPlayer = game.confirmed.some((p) => p.isMe && p.isHost);
  const isOpen = game.status === 'open' && game.startsAt > Date.now();
  const per = perPerson(game, Math.max(filled, 1));
  const lat = court?.location.lat, lng = court?.location.lng;
  const closedText = game.status === 'cancelled'
    ? game.cancelReason === 'weather' ? '團主因天氣取消了這一團' : '團主取消了這一團'
    : game.status === 'auto_cancelled' ? '開打前人數不足，系統自動取消了這一團'
    : game.status === 'finished' || game.startsAt <= Date.now() ? '這一團已經開打或結束了' : null;

  return (
    <div className="min-h-screen bg-neutral-50 pb-36">
      {/* 球場藍的 hero */}
      <header className="relative bg-gradient-to-br from-[#2f6fd6] to-[#1d4c9e] pb-16 pt-6 text-white md:pt-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_100%_0%,rgba(217,242,63,.28),transparent_55%)]" aria-hidden />
        <div className="container relative mx-auto max-w-2xl px-4">
          <div className="mb-4 flex items-center justify-between">
            <button type="button" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/play/'))} className="rounded-xl bg-white/15 px-3 py-2 text-sm font-bold backdrop-blur">← 揪團大廳</button>
            <div className="flex gap-2">
              {lat && lng && (
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`} target="_blank" rel="noopener" className="rounded-xl bg-white/15 px-3 py-2 text-sm font-bold backdrop-blur">導航</a>
              )}
              <button type="button" onClick={share} className="rounded-xl bg-white/15 px-3 py-2 text-sm font-bold backdrop-blur">分享</button>
            </div>
          </div>
          <span className="inline-block rounded-full bg-white/15 px-3 py-1 font-mono text-[13px] font-extrabold tracking-wide">
            {dayLabel(game.startsAt)} {hm(game.startsAt)}–{hm(game.startsAt + game.durationMin * 60000)}
          </span>
          <h1 className="mt-2 text-2xl font-black leading-snug md:text-3xl">{game.title}</h1>
          <p className="mt-1 text-sm text-white/85">
            {court ? <Link to={`/courts/${courtSlug(court.id)}/`} className="underline decoration-white/40 underline-offset-2">{game.court.name}</Link> : game.court.name}
            {game.court.district ? ` · ${game.court.city}${game.court.district}` : ''}
          </p>
          {isOpen && <Countdown to={game.startsAt} />}
        </div>
      </header>

      <div className="container mx-auto -mt-12 max-w-2xl space-y-3 px-4">
        {closedText && (
          <div className="relative rounded-2xl bg-neutral-900 p-4 text-white shadow-lg"><b>{closedText}</b></div>
        )}

        <section className="relative rounded-3xl bg-white p-4 shadow-sm" aria-labelledby="seats">
          <div className="mb-3 flex items-baseline gap-2">
            <h2 id="seats" className="font-black text-neutral-900">場上座位</h2>
            <span className="ml-auto text-xs text-neutral-500"><b className="font-mono text-neutral-900">{filled}</b> / {game.capacity} 人 · 最少 {game.minPlayers} 人成團</span>
          </div>
          <CourtSeats players={game.confirmed} courts={game.courtsBooked} capacity={game.capacity} />
          {isOpen && filled < game.minPlayers && (
            <p className="mt-3 text-xs text-amber-700">還差 {game.minPlayers - filled} 人成團。開打前 3 小時還沒湊到，系統會自動取消並通知大家。</p>
          )}
        </section>

        <section className="rounded-3xl bg-white p-4 shadow-sm" aria-labelledby="rack">
          <div className="mb-2 flex items-baseline">
            <h2 id="rack" className="font-black text-neutral-900">候補球拍架</h2>
            <span className="ml-auto text-xs text-neutral-500">{game.waitlist.length} 人排隊中</span>
          </div>
          <PaddleRack players={game.waitlist} />
        </section>

        <section className="rounded-3xl bg-white p-4 shadow-sm" aria-labelledby="prep">
          <h2 id="prep" className="mb-3 font-black text-neutral-900">行前準備</h2>
          <ul className="grid gap-2 text-sm">
            <li className="flex items-center gap-3 rounded-2xl bg-neutral-50 p-3">
              <span className="text-lg" aria-hidden>🥅</span>
              <span className="flex-1"><b className="block text-neutral-900">球網</b><small className="text-neutral-500">{needsNet(game.court.net) ? (game.court.net === 'self' ? '這座球場要自備球網，請跟團主確認誰帶' : '場地是移動式網，需要有人帶或現場架') : game.court.net === 'provided' ? '場館提供' : '常設球網'}</small></span>
              {needsNet(game.court.net) && <span className="rounded-lg bg-orange-500 px-2 py-1 text-[11px] font-black text-white">要確認</span>}
            </li>
            <li className="flex items-center gap-3 rounded-2xl bg-neutral-50 p-3">
              <span className="text-lg" aria-hidden>🟡</span>
              <span className="flex-1"><b className="block text-neutral-900">球</b><small className="text-neutral-500">{game.court.type === 'indoor' ? '室內球（26 孔，較軟）' : '戶外球（40 孔，較硬、抗風）'}</small></span>
            </li>
            <li className="flex items-center gap-3 rounded-2xl bg-neutral-50 p-3">
              <span className="text-lg" aria-hidden>👟</span>
              <span className="flex-1"><b className="block text-neutral-900">鞋子</b><small className="text-neutral-500">穿網球鞋或室內球鞋，跑鞋側向支撐不夠容易扭傷</small></span>
            </li>
          </ul>
        </section>

        <section className="rounded-3xl bg-white p-4 shadow-sm" aria-labelledby="fee">
          <div className="mb-2 flex items-baseline">
            <h2 id="fee" className="font-black text-neutral-900">費用</h2>
            <span className="ml-auto text-xs text-neutral-500">現場付給團主，本站不經手款項</span>
          </div>
          {game.feeTotal ? (
            <div className="flex items-center gap-3">
              <b className="font-mono text-3xl font-extrabold tabular-nums text-neutral-900">${per}<small className="font-sans text-sm font-medium text-neutral-500"> / 人</small></b>
              <span className="text-xs text-neutral-500">場租 ${game.feeTotal} ÷ 目前 {filled} 人<br />人越多越便宜，會即時更新</span>
            </div>
          ) : (
            <b className="text-2xl font-black text-emerald-600">免費</b>
          )}
          {game.feeNote && <p className="mt-2 text-sm text-neutral-600">{game.feeNote}</p>}
        </section>

        <section className="rounded-3xl bg-white p-4 shadow-sm" aria-labelledby="rules">
          <h2 id="rules" className="mb-3 font-black text-neutral-900">規則</h2>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            {[
              ['程度', levelText(game)],
              ['賽制', FORMAT_LABEL[game.format].name],
              ['計分', SCORING_LABEL[game.scoring]],
              ['取消截止', `${dayLabel(game.cancelDeadline)} ${hm(game.cancelDeadline)}`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-neutral-50 px-3 py-2"><dt className="text-[11px] text-neutral-500">{k}</dt><dd className="font-bold text-neutral-900">{v}</dd></div>
            ))}
          </dl>
          {game.beginner && <p className="mt-2 text-sm text-lime-800">這一團標示為新手友善，節奏會放慢一點。</p>}
          {game.note && <p className="mt-2 whitespace-pre-line text-sm text-neutral-700">{game.note}</p>}
        </section>

        {game.host && (
          <section className="rounded-3xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <PaddleAvatar name={game.host.nickname} seed={game.host.avatarSeed} size={36} />
              <div className="flex-1">
                <b className="block text-neutral-900">團主 {game.host.nickname}</b>
                <small className="text-neutral-500">在本站開過 {game.host.gamesHosted ?? 1} 團{game.recurWeekly ? ' · 每週固定團' : ''}</small>
              </div>
              {game.viewerIsHost && <button type="button" onClick={() => setHostOpen(true)} className="rounded-xl bg-neutral-900 px-3 py-2 text-xs font-black text-white">管理這一團</button>}
            </div>
            {game.communityUrl && (
              <a href={game.communityUrl} target="_blank" rel="noopener nofollow" className="mt-3 flex items-center gap-2 rounded-xl bg-[#e7f9ee] px-3 py-2.5 text-[13px] font-bold text-[#067a3a]">
                💬 團主的 LINE 社群：聊天、臨時聯絡都在這裡
              </a>
            )}
          </section>
        )}

        <div className="flex flex-wrap justify-center gap-4 pt-2 text-xs text-neutral-500">
          <button type="button" onClick={downloadIcs} className="underline underline-offset-2">加到行事曆</button>
          <button type="button" onClick={() => copyLink(shareUrl, '報名連結')} className="underline underline-offset-2">複製報名連結</button>
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={async () => {
              if (!getCachedMe()) return setToast({ title: '要先報名過任何一團才能檢舉', sub: '這是為了防止惡意檢舉' });
              const reason = window.prompt('檢舉原因（例如：廣告、不實資訊、騷擾）');
              if (!reason) return;
              try {
                await reportGame(id, reason);
                setToast({ title: '已收到檢舉', sub: '累積多人檢舉後會自動隱藏' });
              } catch (e) {
                setToast({ title: '檢舉沒有送出', sub: e instanceof PlayApiError ? e.message : '' });
              }
            }}
          >
            檢舉這一團
          </button>
        </div>
      </div>

      {/* 底部固定行動列（拇指區） */}
      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-neutral-50 via-neutral-50/95 to-transparent px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-6">
          <div className="mx-auto flex max-w-2xl gap-2">
            {iAmHostPlayer ? (
              <button type="button" onClick={share} className="h-[52px] flex-1 rounded-2xl bg-[#06c755] text-base font-black text-white shadow-lg shadow-[#06c755]/30">分享到 LINE 揪人</button>
            ) : inGame ? (
              <>
                <button type="button" disabled={busy} onClick={doLeave} className="h-[52px] flex-1 rounded-2xl bg-white text-base font-bold text-neutral-800 shadow">
                  {myStatus === 'waitlist' ? `取消候補（#${game.me?.position}）` : '取消報名'}
                </button>
                <button type="button" onClick={share} className="h-[52px] rounded-2xl bg-[#06c755] px-5 text-base font-black text-white shadow-lg shadow-[#06c755]/30">分享</button>
              </>
            ) : (
              <>
                <button type="button" disabled={busy} onClick={onJoinClick}
                  className={`h-[52px] flex-1 rounded-2xl text-base font-black shadow-lg transition disabled:opacity-60 ${full ? 'bg-lime-300 text-lime-950 shadow-lime-300/30' : 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-teal-500/25'}`}>
                  {busy ? '處理中…' : full ? `掛上球拍架（候補 #${game.waitlist.length + 1}）` : `報名 · 還有 ${game.capacity - filled} 位`}
                </button>
                <button type="button" onClick={share} aria-label="分享" className="h-[52px] w-[52px] rounded-2xl bg-white text-lg shadow">↗</button>
              </>
            )}
          </div>
        </div>
      )}

      <ProfileSheet
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        title={full ? '掛上球拍架' : '報名這一團'}
        confirmLabel={full ? '確認候補' : '確認報名'}
        tone={full ? 'wait' : 'join'}
        note={`開打前 ${game.cancelHours} 小時以前取消都不留紀錄，之後取消會記一次「遲取消」。`}
        busy={busy}
        error={sheetError}
        onConfirm={(p) => doJoin(p)}
      />

      <Sheet open={shareOpen} onClose={() => { setShareOpen(false); params.delete('created'); setParams(params, { replace: true }); }} label="開團完成">
        <div className="text-center">
          <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-500 text-3xl text-white shadow-lg">✓</div>
          <h2 className="text-lg font-black text-neutral-900">開好了！把它丟進 LINE 群組吧</h2>
          <p className="mt-1 text-sm text-neutral-500">球友點開連結就能報名，不用加好友也不用下載 App。</p>
        </div>
        <button type="button" onClick={share} className="mt-5 h-[52px] w-full rounded-2xl bg-[#06c755] text-base font-black text-white">分享到 LINE 群組</button>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => copyLink(shareUrl, '報名連結')} className="h-11 rounded-2xl bg-neutral-100 font-bold text-neutral-800">複製連結</button>
          <button type="button" onClick={downloadIcs} className="h-11 rounded-2xl bg-neutral-100 font-bold text-neutral-800">加到行事曆</button>
        </div>
        <p className="mt-4 rounded-2xl bg-neutral-50 p-3 text-xs text-neutral-600">你是團主，這支手機就能管理這一團。換手機或要讓副團主一起管，按「管理這一團」→「複製管理連結」。</p>
      </Sheet>

      <Sheet open={hostOpen} onClose={() => setHostOpen(false)} label="管理這一團">
        <h2 className="text-lg font-black text-neutral-900">管理這一團</h2>
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-neutral-50 p-3">
          <span><b className="block text-sm text-neutral-900">人數上限</b><small className="text-xs text-neutral-500">調高時，候補的人自動補上</small></span>
          <span className="flex items-center gap-3">
            <button type="button" disabled={busy} aria-label="減少人數上限" onClick={() => hostAction({ capacity: game.capacity - 1 }, '已調整人數上限')} className="grid h-9 w-9 place-items-center rounded-xl bg-white text-xl font-bold shadow-sm">−</button>
            <b className="min-w-[28px] text-center font-mono text-xl">{game.capacity}</b>
            <button type="button" disabled={busy} aria-label="增加人數上限" onClick={() => hostAction({ capacity: game.capacity + 1 }, '已調整人數上限')} className="grid h-9 w-9 place-items-center rounded-xl bg-white text-xl font-bold shadow-sm">+</button>
          </span>
        </div>
        <button type="button" onClick={() => {
          const key = getManageKey(id);
          if (key) copyLink(`https://picklemastertw.com/play/?g=${id}&k=${key}`, '管理連結');
          else setToast({ title: '這支手機沒有管理連結', sub: '請用開團的那支手機複製' });
        }} className="mt-2 h-11 w-full rounded-2xl bg-neutral-100 font-bold text-neutral-800">複製管理連結（給副團主或換手機）</button>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" disabled={busy} onClick={() => window.confirm('確定因為天氣取消這一團？報名的人會在團頁看到取消通知。') && hostAction({ status: 'cancelled', cancelReason: 'weather' }, '已因天氣取消')} className="h-11 rounded-2xl bg-amber-50 font-bold text-amber-800">雨天／高溫取消</button>
          <button type="button" disabled={busy} onClick={() => window.confirm('確定取消這一團？') && hostAction({ status: 'cancelled', cancelReason: 'host', endSeries: true }, '已取消這一團')} className="h-11 rounded-2xl bg-red-50 font-bold text-red-700">取消這一團</button>
        </div>
        <p className="mt-3 text-xs text-neutral-500">因天氣取消不會記入團主的取消紀錄。每週固定團選「取消這一團」會一併結束之後的場次。</p>
      </Sheet>

      <Toast msg={toast} onDone={() => setToast(null)} />
    </div>
  );
}
