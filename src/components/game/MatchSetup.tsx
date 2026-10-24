import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AI_PROFILES, type Difficulty } from './engine/ai';
import { PADDLES, SPECIALS } from './engine/paddles';
import { SKILLS } from './engine/skills';
import { CHARACTERS, type CharacterDef, characterById } from './characters';
import type { Settings } from './GameScreens';
import { VenueThumb } from './VenueThumb';
import { VENUES, venueById } from './venues';

type Tab = 'player' | 'partner' | 'paddle' | 'venue';

const DIFFS: Difficulty[] = ['rookie', 'club', 'pro'];

/** 小頭像：有去背半身像就用，沒有就用球衣色塊＋號碼 */
const Face = ({ c }: { c: CharacterDef }) =>
  c.portrait ? (
    <img src={c.portrait} alt="" className="h-full w-full object-cover object-top" draggable={false} />
  ) : (
    <div className="flex h-full w-full items-end justify-center" style={{ background: `linear-gradient(180deg, ${c.shirt}55, ${c.shirt})` }}>
      <span className="mb-1 font-display text-2xl font-black text-white/90">{c.number}</span>
    </div>
  );

interface Props {
  settings: Settings;
  onChange: (s: Settings) => void;
  onBack: () => void;
  /** 開打：帶著畫面上看到的最終設定（例如沒點過隊友時預設的那位） */
  onStart: (s: Settings) => void;
  /** 打開完整的選角／選拍畫面（3D 預覽與詳細數值） */
  onDetail: (kind: 'character' | 'partner' | 'paddle') => void;
}

/**
 * 對戰準備：選手、（雙打的隊友）、球拍、場地都在這一頁切分頁挑，背景的 3D 示範會跟著換成你選的選手與場地。
 * 想看詳細數值再點「詳細」進原本的選角／選拍畫面。
 */
export const MatchSetup = ({ settings, onChange, onBack, onStart, onDetail }: Props) => {
  const doubles = settings.mode === 'match' && !!settings.doubles;
  const [tab, setTab] = useState<Tab>('player');
  const me = characterById(settings.character);
  const partner = doubles ? characterById(settings.partner && settings.partner !== me.id ? settings.partner : CHARACTERS.find((c) => c.id !== me.id)!.id) : null;
  const paddle = PADDLES.find((p) => p.id === settings.paddle) ?? PADDLES[0];
  const venue = venueById(settings.venue);
  const tabs: { id: Tab; label: string; value: string }[] = [
    { id: 'player', label: '選手', value: me.name },
    ...(doubles && partner ? [{ id: 'partner' as Tab, label: '隊友', value: partner.name }] : []),
    { id: 'paddle', label: '球拍', value: paddle.name },
    { id: 'venue', label: '場地', value: venue.short },
  ];
  const title = settings.mode === 'dink' ? 'Dink 挑戰' : doubles ? '雙打比賽' : '單打比賽';

  const roster = (selected: string, exclude: string | null, pick: (id: string) => void) => (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 [@media(max-height:500px)]:grid-cols-8">
      {CHARACTERS.filter((c) => c.id !== exclude).map((c) => {
        const sel = c.id === selected;
        return (
          <motion.button
            key={c.id}
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={() => pick(c.id)}
            aria-pressed={sel}
            className={`relative aspect-[3/4] overflow-hidden rounded-xl ring-2 transition-all ${sel ? 'ring-amber-300 shadow-lg shadow-amber-400/30' : 'ring-white/10 hover:ring-white/30'}`}
          >
            <Face c={c} />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 to-transparent px-1 pb-1 pt-4 text-center text-[11px] font-black text-white">{c.name}</span>
          </motion.button>
        );
      })}
    </div>
  );

  const charInfo = (c: CharacterDef, kind: 'character' | 'partner') => (
    <div className="mb-2 flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-black text-white">{c.name}</span>
          <span className="truncate text-xs font-semibold text-emerald-300">{c.title}</span>
        </div>
        {settings.specials && c.skill && (
          <div className="truncate text-[11px] text-white/60">
            <b style={{ color: SKILLS[c.skill].color }}>絕招・{SKILLS[c.skill].name}</b>
          </div>
        )}
      </div>
      <button type="button" onClick={() => onDetail(kind)} className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20">
        詳細 ›
      </button>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-30 flex flex-col">
      {/* 上方透出 3D 示範，下方是選單面板 */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-slate-950/10 landscape:bg-gradient-to-r landscape:from-slate-950/95 landscape:via-slate-950/75 landscape:to-transparent" />
      <div className="relative flex min-h-0 w-full flex-1 flex-col px-4 pb-4 pt-[max(0.75rem,env(safe-area-inset-top))] landscape:max-w-xl landscape:md:max-w-2xl">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack} className="rounded-full bg-slate-900/80 px-3 py-1.5 text-sm font-bold text-white ring-1 ring-white/10 backdrop-blur-md hover:bg-slate-800">
            ← 返回
          </button>
          <div>
            <div className="text-[10px] font-bold tracking-[0.3em] text-emerald-300">MATCH SETUP</div>
            <div className="font-display text-xl font-black text-white">{title}</div>
          </div>
        </div>

        <div className="min-h-[14vh] flex-1 landscape:min-h-2 landscape:flex-none" />

        {/* 分頁：每個分頁直接顯示目前選了誰 */}
        <div className="mt-3 grid gap-1.5 rounded-2xl bg-slate-950/70 p-1 ring-1 ring-white/10 backdrop-blur-md" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`min-w-0 rounded-xl px-2 py-1.5 text-center transition-colors ${tab === t.id ? 'bg-white text-slate-950' : 'text-white/70 hover:text-white'}`}
            >
              <span className="block text-[10px] font-bold opacity-70">{t.label}</span>
              <span className="block truncate text-sm font-black">{t.value}</span>
            </button>
          ))}
        </div>

        <div className="mt-2.5 min-h-0 overflow-y-auto overscroll-contain rounded-2xl bg-slate-900/70 p-3 ring-1 ring-white/10 backdrop-blur-md [@media(max-height:500px)]:max-h-[42vh]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={tab} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.15 }}>
              {tab === 'player' && (
                <>
                  {charInfo(me, 'character')}
                  {roster(me.id, null, (id) => onChange({ ...settings, character: id, partner: settings.partner === id ? undefined : settings.partner }))}
                </>
              )}
              {tab === 'partner' && partner && (
                <>
                  {charInfo(partner, 'partner')}
                  {roster(partner.id, me.id, (id) => onChange({ ...settings, partner: id }))}
                </>
              )}
              {tab === 'paddle' && (
                <>
                  <div className="mb-2 flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-lg font-black text-white">{paddle.name}</div>
                      <div className="truncate text-[11px] text-white/60">
                        {paddle.model}
                        {settings.specials && (
                          <b className="ml-1.5" style={{ color: SPECIALS[paddle.special].color }}>
                            必殺・{SPECIALS[paddle.special].name}
                          </b>
                        )}
                      </div>
                    </div>
                    <button type="button" onClick={() => onDetail('paddle')} className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20">
                      詳細 ›
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {PADDLES.map((p) => {
                      const sel = p.id === paddle.id;
                      return (
                        <motion.button
                          key={p.id}
                          type="button"
                          whileTap={{ scale: 0.96 }}
                          onClick={() => onChange({ ...settings, paddle: p.id })}
                          aria-pressed={sel}
                          className={`flex items-center gap-2.5 rounded-xl p-2 text-left ring-2 transition-all ${sel ? 'bg-white/10 ring-amber-300' : 'bg-white/5 ring-white/10 hover:ring-white/30'}`}
                        >
                          {/* 拍面配色小樣 */}
                          <span className="relative h-11 w-8 shrink-0 rounded-[40%_40%_30%_30%] ring-1 ring-white/20" style={{ background: `linear-gradient(160deg, ${p.look.primary}, ${p.look.base} 70%)` }}>
                            <span className="absolute -bottom-2 left-1/2 h-3 w-1.5 -translate-x-1/2 rounded-b" style={{ background: p.look.grip }} />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-black text-white">{p.name}</span>
                            <span className="block truncate text-[10px] text-white/55">
                              {p.brand} · 力 {p.rating.power} 控 {p.rating.control}
                            </span>
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </>
              )}
              {tab === 'venue' && (
                <div className="grid grid-cols-2 gap-2">
                  {VENUES.map((v) => {
                    const sel = v.id === venue.id;
                    return (
                      <motion.button
                        key={v.id}
                        type="button"
                        whileTap={{ scale: 0.96 }}
                        onClick={() => onChange({ ...settings, venue: v.id, venuePicked: true })}
                        aria-pressed={sel}
                        className={`overflow-hidden rounded-xl text-left ring-2 transition-all ${sel ? 'ring-amber-300' : 'ring-white/10 hover:ring-white/30'}`}
                      >
                        <div className={`h-16 transition-opacity [@media(max-height:500px)]:h-12 ${sel ? 'opacity-100' : 'opacity-70'}`}>
                          <VenueThumb venue={v.id} />
                        </div>
                        <div className="bg-slate-950/60 px-2.5 py-1.5">
                          <div className="truncate text-sm font-bold text-white">{v.title}</div>
                          <div className="truncate text-[10px] text-white/55">{v.desc}</div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 對手程度＋開打 */}
        <div className="mt-2.5 flex items-center gap-2">
          <div className="flex shrink-0 rounded-full bg-slate-950/70 p-1 ring-1 ring-white/10 backdrop-blur-md">
            {DIFFS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => onChange({ ...settings, difficulty: d })}
                className={`rounded-full px-2.5 py-1.5 text-xs font-black transition-colors ${settings.difficulty === d ? 'bg-orange-400 text-slate-950' : 'text-white/65 hover:text-white'}`}
              >
                {AI_PROFILES[d].label}
              </button>
            ))}
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => onStart(partner ? { ...settings, partner: partner.id } : settings)}
            className={`flex-1 rounded-2xl bg-gradient-to-r py-3 text-lg font-black shadow-xl ${
              settings.specials ? 'from-emerald-400 to-teal-500 text-emerald-950 shadow-emerald-500/25' : 'from-sky-300 to-sky-500 text-sky-950 shadow-sky-500/25'
            }`}
          >
            開打 ▶
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
