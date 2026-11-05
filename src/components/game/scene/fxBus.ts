import type { GameEvent } from '../engine/game';

/** 場景事件匯流排：Rig 把引擎事件丟進來，特效在自己的 useFrame 裡消化 */
export interface FxBus {
  queue: GameEvent[];
}
export const createFxBus = (): FxBus => ({ queue: [] });
