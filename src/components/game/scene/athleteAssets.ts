import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * 選手素材（Quaternius CC0）：人物模型、頭髮、動作。
 * 由 scripts/build-athlete-assets.mjs 產生到 public/game/athlete/。
 * 用模組層級的快取：同一份素材只載一次，雙方選手與選角預覽共用。
 */

const base = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/game/athlete`;

export type HairStyle = 'simpleparted' | 'buzzed' | 'long' | 'buns';

export interface AthleteAssets {
  body: GLTF;
  clips: Map<string, THREE.AnimationClip>;
}

type Entry<T> = { status: 'pending'; promise: Promise<T> } | { status: 'done'; value: T } | { status: 'error'; error: unknown };
const cache = new Map<string, Entry<unknown>>();

/** 極簡版 suspense 資源：第一次丟出 promise，載好之後回傳結果 */
export const suspend = <T>(key: string, load: () => Promise<T>): T => {
  let e = cache.get(key) as Entry<T> | undefined;
  if (!e) {
    const promise = load().then(
      (value) => cache.set(key, { status: 'done', value }),
      (error) => cache.set(key, { status: 'error', error }),
    );
    e = { status: 'pending', promise: promise as Promise<T> };
    cache.set(key, e);
  }
  if (e.status === 'pending') throw e.promise;
  if (e.status === 'error') throw e.error;
  return e.value;
};

const gltfLoader = new GLTFLoader();
export const loadGltf = (url: string) => gltfLoader.loadAsync(url);

export const useAthleteAssets = (): AthleteAssets =>
  suspend('athlete', async () => {
    const [body, json] = await Promise.all([
      loadGltf(`${base}/body.gltf`),
      fetch(`${base}/anims.json`).then((r) => r.json() as Promise<object[]>),
    ]);
    const clips = new Map<string, THREE.AnimationClip>();
    for (const j of json) {
      const clip = THREE.AnimationClip.parse(j);
      clips.set(clip.name, clip);
    }
    return { body, clips };
  });

export const useHair = (style: HairStyle | null): GLTF | null =>
  style === null ? null : suspend(`hair-${style}`, () => loadGltf(`${base}/hair_${style}.gltf`));

/** 一般圖片（照片臉） */
export const useImage = (url: string | null): HTMLImageElement | null =>
  url === null
    ? null
    : suspend(`img-${url}`, () => {
        const img = new Image();
        img.src = url;
        return img.decode().then(() => img);
      });
