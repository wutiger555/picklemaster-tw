/**
 * 幫 VRM 角色算繪選角用的半身像（透明背景），輸出 public/game/characters/<id>-portrait.webp，
 * 格式比照照片角色的去背半身像（512×536）。
 *
 * 用無頭 Chrome（Playwright）載入 scripts/build-vrm-characters.mjs 產生的 GLB，
 * 擺成雙手自然下垂、身體微側的姿勢再拍。three 直接從 node_modules 讀，不經過開發伺服器。
 *
 * 用法（需要全域安裝的 playwright 與 cwebp）：
 *   node scripts/render-vrm-portraits.mjs [只算這些 id…]
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const globalRoot = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim();
const { chromium } = require(path.join(globalRoot, 'playwright'));

const ROOT = path.resolve('.');
const VRM_DIR = path.join(ROOT, 'public/game/vrm');
const OUT_DIR = path.join(ROOT, 'public/game/characters');
const W = 512;
const H = 536;
const only = process.argv.slice(2);
const ids = fs
  .readdirSync(VRM_DIR)
  .filter((f) => f.endsWith('.glb'))
  .map((f) => f.replace(/\.glb$/, ''))
  .filter((id) => !only.length || only.includes(id));

const PAGE = `<!doctype html><html><head><meta charset="utf-8">
<script type="importmap">{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script>
</head><body style="margin:0;background:transparent"><script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
r.setPixelRatio(1);
r.setSize(${W * 2}, ${H * 2});
r.outputColorSpace = THREE.SRGBColorSpace;
r.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(r.domElement);
window.shoot = async (id) => {
  const gltf = await new GLTFLoader().loadAsync('/vrm/' + id + '.glb');
  const human = gltf.parser.json.extensions.VRM.humanoid.humanBones;
  const node = async (bone) => {
    const b = human.find((h) => h.bone === bone);
    return b ? gltf.parser.getDependency('node', b.node) : null;
  };
  // VRM 0.x 面向 -Z：雙手從 T-pose 放下來（左手在 -X，繞 Z 正轉；右手反過來），手肘微彎
  const tilt = (o, axis, a) => o && o.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(axis, a));
  const Z = new THREE.Vector3(0, 0, 1);
  const Y = new THREE.Vector3(0, 1, 0);
  tilt(await node('leftUpperArm'), Z, 1.15);
  tilt(await node('rightUpperArm'), Z, -1.15);
  tilt(await node('leftLowerArm'), Y, -0.35);
  tilt(await node('rightLowerArm'), Y, 0.35);
  const scene = new THREE.Scene();
  const root = new THREE.Group();
  root.rotation.y = Math.PI - 0.32;
  root.add(gltf.scene);
  scene.add(root);
  gltf.scene.traverse((o) => {
    if (!o.isMesh) return;
    o.frustumCulled = false;
    o.material = new THREE.MeshStandardMaterial({ map: o.material.map, roughness: 0.7, metalness: 0 });
  });
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const head = (await node('head')).getWorldPosition(new THREE.Vector3());
  // 取景：頭頂到胸口（頭骨往下約 1.4 個頭高），和照片半身像一樣頭佔上半部
  const top = box.max.y;
  const bottom = Math.max(box.min.y, head.y - Math.max(0.42, (top - head.y) * 1.4));
  const h = (top - bottom) * 1.08;
  const cam = new THREE.PerspectiveCamera(22, ${W} / ${H}, 0.05, 50);
  const dist = h / 2 / Math.tan((22 * Math.PI) / 360);
  const cy = (top + bottom) / 2 - h * 0.02;
  cam.position.set(head.x, cy + h * 0.06, head.z + dist);
  cam.lookAt(head.x, cy, head.z);
  scene.add(new THREE.HemisphereLight('#ffffff', '#3f4a5c', 1.6));
  const key = new THREE.DirectionalLight('#ffffff', 3.2);
  key.position.set(1.5, 3, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight('#9ad8ff', 2.4);
  rim.position.set(-3, 2.5, -2);
  scene.add(rim);
  const warm = new THREE.DirectionalLight('#ffe6cc', 1.1);
  warm.position.set(-2, 1.5, 3);
  scene.add(warm);
  r.setClearColor(0x000000, 0);
  r.render(scene, cam);
  return r.domElement.toDataURL('image/png');
};
window.ready = true;
</script></body></html>`;

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal'] });
const page = await browser.newPage();
await page.route('http://portrait.local/**', (route) => {
  const p = decodeURIComponent(new URL(route.request().url()).pathname);
  if (p === '/') return route.fulfill({ contentType: 'text/html', body: PAGE });
  const file = p.startsWith('/three/') ? path.join(ROOT, 'node_modules', p) : path.join(VRM_DIR, p.replace(/^\/vrm\//, ''));
  if (!fs.existsSync(file)) return route.fulfill({ status: 404, body: '' });
  return route.fulfill({ contentType: file.endsWith('.js') ? 'text/javascript' : 'application/octet-stream', body: fs.readFileSync(file) });
});
await page.goto('http://portrait.local/');
await page.waitForFunction(() => window.ready);

for (const id of ids) {
  const url = await page.evaluate((i) => window.shoot(i), id);
  const png = path.join(OUT_DIR, `${id}-portrait.png`);
  fs.writeFileSync(png, Buffer.from(url.split(',')[1], 'base64'));
  const webp = path.join(OUT_DIR, `${id}-portrait.webp`);
  execFileSync('cwebp', ['-quiet', '-q', '85', '-alpha_q', '90', '-resize', String(W), String(H), png, '-o', webp]);
  fs.rmSync(png);
  console.log(`${id}: ${(fs.statSync(webp).size / 1024).toFixed(0)} KB`);
}
await browser.close();
