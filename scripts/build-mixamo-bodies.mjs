/**
 * 把 Mixamo 角色（FBX）轉成網頁用的 glTF：真實比例的身體，給照片角色用。
 *   - 用 assimp 轉 glTF，去掉原本附帶的動作（動作在執行時從選手動作庫重定向）
 *   - 4096² PNG 貼圖縮成 JPG（身體 2048、法線 1024、頭髮 512），只留用得到的資料
 *
 * 用法（macOS，需要 assimp 與 sips）：
 *   node scripts/build-mixamo-bodies.mjs <Mixamo FBX 目錄>
 * 輸出到 public/game/bodies/<id>/。
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const [srcDir] = process.argv.slice(2);
if (!srcDir) {
  console.error('usage: node scripts/build-mixamo-bodies.mjs <Mixamo FBX dir>');
  process.exit(1);
}

const BODIES = [
  { id: 'sporty', file: 'Great Sword Idle (2).fbx' },
  { id: 'hoodie', file: 'Great Sword Idle (3).fbx' },
];

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mixamo-'));

for (const body of BODIES) {
  const out = path.resolve('public/game/bodies', body.id);
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  const raw = path.join(tmp, `${body.id}.gltf`);
  execFileSync('assimp', ['export', path.join(srcDir, body.file), raw, '-f', 'gltf2'], { stdio: 'ignore' });
  const g = JSON.parse(fs.readFileSync(raw, 'utf8'));
  const dataOf = (uri) => Buffer.from(uri.slice(uri.indexOf(',') + 1), 'base64');
  const buf0 = g.buffers[0].uri;
  const src = buf0.startsWith('data:') ? dataOf(buf0) : fs.readFileSync(path.join(tmp, buf0));

  // ── 貼圖：依用途縮小、轉 JPG；用不到的（高光）丟掉
  delete g.extensionsUsed;
  for (const m of g.materials) delete m.extensions;
  const used = new Set();
  for (const m of g.materials) {
    if (m.pbrMetallicRoughness?.baseColorTexture) used.add(m.pbrMetallicRoughness.baseColorTexture.index);
    if (m.normalTexture) used.add(m.normalTexture.index);
  }
  const images = [];
  const texMap = new Map();
  g.textures.forEach((t, i) => {
    if (!used.has(i)) return;
    const img = g.images[t.source];
    const base = path.basename(img.name).replace(/\.png$/i, '').toLowerCase();
    const isNormal = /normal/.test(base);
    const isHair = g.materials.some((m) => /hair/i.test(m.name) && m.pbrMetallicRoughness?.baseColorTexture?.index === i);
    const size = isNormal ? 1024 : isHair ? 512 : 2048;
    const png = path.join(tmp, `${body.id}-${base}.png`);
    fs.writeFileSync(png, dataOf(img.uri));
    const name = `${base}.jpg`;
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', isNormal ? '90' : '86', '-Z', String(size), png, '--out', path.join(out, name)], {
      stdio: 'ignore',
    });
    texMap.set(i, images.length);
    images.push({ uri: name, mimeType: 'image/jpeg' });
  });
  g.images = images;
  g.textures = [...texMap.keys()].map((i) => ({ source: texMap.get(i), sampler: 0 }));
  g.samplers = [{ magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 10497 }];
  const reTex = (ref) => ref && (ref.index = [...texMap.keys()].indexOf(ref.index));
  for (const m of g.materials) {
    reTex(m.pbrMetallicRoughness?.baseColorTexture);
    reTex(m.normalTexture);
  }

  // ── 去掉動作，只搬用得到的 accessor 到新的 buffer
  delete g.animations;
  const keep = new Set();
  for (const m of g.meshes) {
    for (const p of m.primitives) {
      Object.values(p.attributes).forEach((a) => keep.add(a));
      if (p.indices !== undefined) keep.add(p.indices);
    }
  }
  for (const s of g.skins ?? []) if (s.inverseBindMatrices !== undefined) keep.add(s.inverseBindMatrices);
  const chunks = [];
  let offset = 0;
  const views = [];
  const accessors = [];
  const accMap = new Map();
  g.accessors.forEach((a, i) => {
    if (!keep.has(i)) return;
    const v = g.bufferViews[a.bufferView];
    const bytes = src.subarray((v.byteOffset ?? 0) + 0, (v.byteOffset ?? 0) + v.byteLength);
    const pad = (4 - (offset % 4)) % 4;
    if (pad) chunks.push(Buffer.alloc(pad));
    offset += pad;
    views.push({ buffer: 0, byteOffset: offset, byteLength: v.byteLength, ...(v.byteStride ? { byteStride: v.byteStride } : {}), ...(v.target ? { target: v.target } : {}) });
    chunks.push(bytes);
    offset += v.byteLength;
    accMap.set(i, accessors.length);
    accessors.push({ ...a, bufferView: views.length - 1 });
  });
  const bin = Buffer.concat(chunks);
  fs.writeFileSync(path.join(out, 'body.bin'), bin);
  g.buffers = [{ uri: 'body.bin', byteLength: bin.length }];
  g.bufferViews = views;
  g.accessors = accessors;
  for (const m of g.meshes) {
    for (const p of m.primitives) {
      delete p.extensions;
      for (const k of Object.keys(p.attributes)) p.attributes[k] = accMap.get(p.attributes[k]);
      if (p.indices !== undefined) p.indices = accMap.get(p.indices);
    }
  }
  for (const s of g.skins ?? []) if (s.inverseBindMatrices !== undefined) s.inverseBindMatrices = accMap.get(s.inverseBindMatrices);
  fs.writeFileSync(path.join(out, 'body.gltf'), JSON.stringify(g));
  fs.writeFileSync(
    path.join(out, 'LICENSE.txt'),
    `Character from Adobe Mixamo (https://www.mixamo.com), converted for this game.\nUsed under the Mixamo terms; do not redistribute separately.\n`,
  );
  for (const f of fs.readdirSync(out)) console.log(body.id.padEnd(8), f.padEnd(28), (fs.statSync(path.join(out, f)).size / 1024).toFixed(0), 'KB');
}
fs.rmSync(tmp, { recursive: true, force: true });
