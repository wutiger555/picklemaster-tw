import type { PaddleSpec } from '../engine/paddles';

/** 握把長度（約 5.25 吋）與截面半徑（周長約 4.25 吋） */
export const HANDLE_LEN = 0.133;
export const HANDLE_R = 0.0172;

/** 拍面中心（甜區）相對握把原點的位置，給揮拍軌跡特效用 */
export const sweetSpotY = (spec: PaddleSpec) => HANDLE_LEN / 2 + (spec.length - HANDLE_LEN) * 0.55;
