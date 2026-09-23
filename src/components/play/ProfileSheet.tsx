import { useEffect, useState } from 'react';
import { Sheet } from './Sheet';
import PaddleAvatar from './PaddleAvatar';
import { LEVEL_OPTIONS } from './playFormat';
import { getCachedMe, type Level } from '../../utils/playApi';

export interface Profile {
  nickname: string;
  avatarSeed: number;
  level: Level | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  confirmLabel: string;
  /** 報名時提醒取消規則 */
  note?: string;
  tone?: 'join' | 'wait';
  busy?: boolean;
  error?: string | null;
  onConfirm: (p: Profile) => void;
}

// 第一次只要一個暱稱；之後自動帶入，按一下就好。不用註冊、不用密碼。
export default function ProfileSheet({ open, onClose, title, confirmLabel, note, tone = 'join', busy, error, onConfirm }: Props) {
  const cached = getCachedMe();
  const [nickname, setNickname] = useState(cached?.nickname ?? '');
  const [seed, setSeed] = useState(cached?.avatarSeed ?? 0);
  const [level, setLevel] = useState<Level | null>(cached?.level ?? null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    const me = getCachedMe();
    if (me) {
      setNickname(me.nickname);
      setSeed(me.avatarSeed);
      setLevel(me.level);
    }
    setTouched(false);
  }, [open]);

  const trimmed = nickname.trim();
  const invalid = touched && !trimmed;

  return (
    <Sheet open={open} onClose={onClose} label={title}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setTouched(true);
          if (!trimmed || busy) return;
          onConfirm({ nickname: trimmed, avatarSeed: seed, level });
        }}
      >
        <h2 className="text-lg font-black text-neutral-900">{title}</h2>
        <p className="mb-4 text-[13px] text-neutral-500">{cached ? '歡迎回來，確認一下就好。' : '第一次使用只要取個暱稱，不用註冊、不用密碼。'}</p>

        <div className="mb-4 flex items-center gap-4">
          <PaddleAvatar name={trimmed || '球友'} seed={seed} size={52} />
          <div className="flex-1">
            <label htmlFor="play-nickname" className="mb-1 block text-xs font-bold text-neutral-500">球場上大家怎麼叫你？</label>
            <input
              id="play-nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onBlur={() => setTouched(true)}
              maxLength={12}
              autoComplete="nickname"
              placeholder="例如：阿哲、Leo"
              aria-invalid={invalid}
              className={`h-12 w-full rounded-2xl border-[1.5px] bg-neutral-50 px-4 text-base text-neutral-900 outline-none focus:border-teal-500 ${invalid ? 'border-red-500' : 'border-neutral-200'}`}
            />
            {invalid && <p className="mt-1 text-xs text-red-600">請填一個暱稱，1 到 12 個字</p>}
            <button type="button" onClick={() => setSeed((s) => s + 1)} className="mt-1.5 text-xs font-bold text-teal-700">
              ↻ 換一支球拍頭像
            </button>
          </div>
        </div>

        <fieldset className="mb-4">
          <legend className="mb-1.5 text-xs font-bold text-neutral-500">你的程度（選填，只用來配對）</legend>
          <div className="flex flex-wrap gap-1.5">
            {LEVEL_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                aria-pressed={level === o.value}
                onClick={() => setLevel(level === o.value ? null : o.value)}
                className={`rounded-xl border-[1.5px] px-3 py-2 text-[13px] font-bold ${level === o.value ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-transparent bg-neutral-100 text-neutral-700'}`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <a href="/ratings/" target="_blank" rel="noopener" className="mt-1.5 inline-block text-xs text-teal-700 underline underline-offset-2">不確定自己幾級？看程度說明</a>
        </fieldset>

        {note && <p className="mb-3 rounded-xl bg-neutral-50 px-3 py-2 text-xs text-neutral-600">{note}</p>}
        {error && <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className={`h-[52px] w-full rounded-2xl text-base font-black shadow-lg transition disabled:opacity-60 ${tone === 'wait' ? 'bg-lime-300 text-lime-950 shadow-lime-300/30' : 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-teal-500/25'}`}
        >
          {busy ? '處理中…' : confirmLabel}
        </button>
        <p className="mt-2.5 text-center text-[11px] text-neutral-400">
          送出即表示你已年滿 18 歲，並同意<a href="/privacy-policy/" className="underline">隱私權政策</a>。只存暱稱與這支手機的隨機代號。
        </p>
      </form>
    </Sheet>
  );
}
