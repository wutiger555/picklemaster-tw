import { useEffect, useRef } from 'react';
import type { InputState } from './engine/game';
import type { ShotButton } from './engine/shots';

/** 鍵盤對應：移動 WASD / 方向鍵；擊球 J K L（或 Z X C）；必殺 空白鍵（或 I）；撲接 Shift（或 ;） */
const SHOT_KEYS: Record<string, ShotButton> = {
  KeyJ: 'soft',
  KeyZ: 'soft',
  KeyK: 'drive',
  KeyX: 'drive',
  KeyL: 'lob',
  KeyC: 'lob',
};
const MOVE_KEYS: Record<string, [number, number]> = {
  KeyW: [0, 1],
  ArrowUp: [0, 1],
  KeyS: [0, -1],
  ArrowDown: [0, -1],
  KeyA: [-1, 0],
  ArrowLeft: [-1, 0],
  KeyD: [1, 0],
  ArrowRight: [1, 0],
};

/** 觸控搖桿與按鈕寫進來的狀態 */
export interface TouchInput {
  moveX: number;
  moveY: number;
  held: ShotButton | null;
  /** 必殺鍵被點了一下（讀取後清除） */
  special: boolean;
  /** 絕招鍵被點了一下（讀取後清除） */
  skill: boolean;
  /** 撲接鍵被點了一下（讀取後清除） */
  dive: boolean;
}

/**
 * 把鍵盤與觸控合併成引擎每幀讀取的輸入。
 * 用 ref 而不是 state：輸入每幀都在變，不需要觸發 React 重繪。
 */
export const useGameInput = (enabled: boolean, onPause: () => void) => {
  const keys = useRef(new Set<string>());
  const shotOrder = useRef<string[]>([]);
  const touch = useRef<TouchInput>({ moveX: 0, moveY: 0, held: null, special: false, skill: false, dive: false });
  const specialTap = useRef(false);
  const skillTap = useRef(false);
  const diveTap = useRef(false);
  const input = useRef<InputState>({ moveX: 0, moveY: 0, held: null });
  const pauseRef = useRef(onPause);
  pauseRef.current = onPause;

  useEffect(() => {
    if (!enabled) return;
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Escape' || e.code === 'KeyP') {
        pauseRef.current();
        return;
      }
      if (MOVE_KEYS[e.code] || SHOT_KEYS[e.code] || e.code === 'Space') e.preventDefault();
      if (e.repeat) return;
      if (e.code === 'Space' || e.code === 'KeyI') specialTap.current = true;
      if (e.code === 'KeyU' || e.code === 'KeyO') skillTap.current = true;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'Semicolon') diveTap.current = true;
      keys.current.add(e.code);
      if (SHOT_KEYS[e.code]) shotOrder.current.push(e.code);
    };
    const up = (e: KeyboardEvent) => {
      keys.current.delete(e.code);
      shotOrder.current = shotOrder.current.filter((k) => k !== e.code);
    };
    const blur = () => {
      keys.current.clear();
      shotOrder.current = [];
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
      blur();
    };
  }, [enabled]);

  /** 每幀呼叫一次，回傳合併後的輸入 */
  const read = () => {
    let mx = 0;
    let my = 0;
    for (const k of keys.current) {
      const m = MOVE_KEYS[k];
      if (m) {
        mx += m[0];
        my += m[1];
      }
    }
    mx = Math.max(-1, Math.min(1, mx + touch.current.moveX));
    my = Math.max(-1, Math.min(1, my + touch.current.moveY));
    const lastShot = shotOrder.current[shotOrder.current.length - 1];
    const i = input.current;
    i.moveX = mx;
    i.moveY = my;
    i.held = (lastShot ? SHOT_KEYS[lastShot] : null) ?? touch.current.held;
    // 必殺鍵：按下的那一幀送出 true，下一幀自動放開
    i.special = specialTap.current || touch.current.special;
    specialTap.current = false;
    touch.current.special = false;
    i.skill = skillTap.current || touch.current.skill;
    skillTap.current = false;
    touch.current.skill = false;
    i.dive = diveTap.current || touch.current.dive;
    diveTap.current = false;
    touch.current.dive = false;
    return i;
  };

  return { read, touch };
};
