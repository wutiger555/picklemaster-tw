/**
 * 建置 VRM 角色（100Avatars 系列，CC0）：從 Arweave 下載 .vrm（就是 glTF 二進位檔），
 * 貼圖縮成 1024² JPG 後重新打包成 GLB，輸出到 public/game/vrm/<id>.glb。
 * 骨架對應（VRM humanoid）原封不動保留在 extensions.VRM 裡，執行時用它把骨頭改名成選手動作庫的名稱。
 *
 * 角色清單在下面的 AVATARS；來源索引：https://github.com/ToxSam/open-source-avatars（data/avatars/100avatars-r*.json）。
 *
 * 用法（macOS，需要 sips）：
 *   node scripts/build-vrm-characters.mjs [只建這些 id…]
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const AVATARS = [
  { id: 'cucumber', name: '085 Cucumber', url: 'https://arweave.net/CI15ScQv7owEU6VPq9zJTRizjwxggGk0nCdz7r1uy58' },
  { id: 'bao', name: '209 BaoSamurai', url: 'https://arweave.net/wmTy-SEXxmlp847i1U1m2GziSGp-4T8qrZ77A32LlY8' },
  { id: 'tiger', name: '283 CoolTiger', url: 'https://arweave.net/2EQ5wsstsJaFOG9LXq_gVFKKgM8bnfPa3axYJ-VS1ug' },
  { id: 'beachking', name: '234 BeachKing', url: 'https://arweave.net/uKhDMselhdUyeJKjelpuVsL8s-a9v_Wqq75TQfCfnos' },
  { id: 'mecha', name: '239 SportMecha', url: 'https://arweave.net/xpx3cF_x4G4FUW-oIx7c2LiSUPigXK74fLHXgJ2w6lA' },
  { id: 'anna', name: '270 Anna', url: 'https://arweave.net/RqDioyluCcxDNHFPoXLUlbEQjhP1Fy9HtaGzLFVh0mE' },
];

const TEX_SIZE = 1024;
const JPG_QUALITY = 82;
const OUT = path.resolve('public/game/vrm');
const only = process.argv.slice(2);
fs.mkdirSync(OUT, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vrm-'));

const pad4 = (n) => (n + 3) & ~3;

const readGlb = (buf) => {
  if (buf.toString('ascii', 0, 4) !== 'glTF') throw new Error('not a GLB');
  const jsonLen = buf.readUInt32LE(12);
  const json = JSON.parse(buf.toString('utf8', 20, 20 + jsonLen));
  const binStart = 20 + jsonLen;
  const binLen = buf.readUInt32LE(binStart);
  return { json, bin: buf.subarray(binStart + 8, binStart + 8 + binLen) };
};

const writeGlb = (json, bin) => {
  let jsonBuf = Buffer.from(JSON.stringify(json), 'utf8');
  jsonBuf = Buffer.concat([jsonBuf, Buffer.alloc(pad4(jsonBuf.length) - jsonBuf.length, 0x20)]);
  const binPadded = Buffer.concat([bin, Buffer.alloc(pad4(bin.length) - bin.length)]);
  const header = Buffer.alloc(12);
  header.write('glTF', 0, 'ascii');
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(12 + 8 + jsonBuf.length + 8 + binPadded.length, 8);
  const chunk = (len, type) => {
    const b = Buffer.alloc(8);
    b.writeUInt32LE(len, 0);
    b.write(type, 4, 'ascii');
    return b;
  };
  return Buffer.concat([header, chunk(jsonBuf.length, 'JSON'), jsonBuf, chunk(binPadded.length, 'BIN\0'), binPadded]);
};

/** 拿掉沒人引用的 accessor 與 bufferView，重新編號 */
const compact = (json) => {
  const usedAcc = new Set();
  for (const mesh of json.meshes) {
    for (const prim of mesh.primitives) {
      Object.values(prim.attributes).forEach((a) => usedAcc.add(a));
      if (prim.indices !== undefined) usedAcc.add(prim.indices);
    }
  }
  for (const skin of json.skins ?? []) if (skin.inverseBindMatrices !== undefined) usedAcc.add(skin.inverseBindMatrices);
  const accMap = new Map();
  const accessors = [];
  json.accessors.forEach((a, i) => {
    if (!usedAcc.has(i)) return;
    accMap.set(i, accessors.length);
    accessors.push(a);
  });
  json.accessors = accessors;
  for (const mesh of json.meshes) {
    for (const prim of mesh.primitives) {
      for (const k of Object.keys(prim.attributes)) prim.attributes[k] = accMap.get(prim.attributes[k]);
      if (prim.indices !== undefined) prim.indices = accMap.get(prim.indices);
    }
  }
  for (const skin of json.skins ?? []) if (skin.inverseBindMatrices !== undefined) skin.inverseBindMatrices = accMap.get(skin.inverseBindMatrices);

  const usedBv = new Set([...json.accessors.map((a) => a.bufferView), ...json.images.map((im) => im.bufferView)].filter((v) => v !== undefined));
  const bvMap = new Map();
  const views = [];
  json.bufferViews.forEach((v, i) => {
    if (!usedBv.has(i)) return;
    bvMap.set(i, views.length);
    views.push(v);
  });
  json.bufferViews = views;
  for (const a of json.accessors) if (a.bufferView !== undefined) a.bufferView = bvMap.get(a.bufferView);
  for (const im of json.images) if (im.bufferView !== undefined) im.bufferView = bvMap.get(im.bufferView);
};

/** PNG 貼圖縮小、轉 JPG（材質都是不透明的，用不到 alpha） */
const shrink = (bytes, key) => {
  const src = path.join(tmp, `${key}.png`);
  const dst = path.join(tmp, `${key}.jpg`);
  fs.writeFileSync(src, bytes);
  execFileSync('sips', ['-Z', String(TEX_SIZE), '-s', 'format', 'jpeg', '-s', 'formatOptions', String(JPG_QUALITY), src, '--out', dst], {
    stdio: 'ignore',
  });
  return fs.readFileSync(dst);
};

for (const av of AVATARS) {
  if (only.length && !only.includes(av.id)) continue;
  const res = await fetch(av.url);
  if (!res.ok) throw new Error(`${av.id}: HTTP ${res.status}`);
  const { json, bin } = readGlb(Buffer.from(await res.arrayBuffer()));
  const meta = json.extensions?.VRM?.meta ?? {};
  if (meta.licenseName !== 'CC0') throw new Error(`${av.id}: license is ${meta.licenseName}, not CC0`);
  if (json.materials.some((m) => m.alphaMode && m.alphaMode !== 'OPAQUE')) throw new Error(`${av.id}: has transparent materials`);

  // 遊戲用不到表情（morph target，佔檔案七到九成）、第二組 UV、搖晃骨（髮尾、衣角）：拿掉
  for (const mesh of json.meshes) {
    for (const prim of mesh.primitives) {
      delete prim.targets;
      delete prim.attributes.TEXCOORD_1;
      if (prim.extras) delete prim.extras.targetNames;
    }
    delete mesh.weights;
    if (mesh.extras) delete mesh.extras.targetNames;
  }
  const vrm = json.extensions.VRM;
  vrm.blendShapeMaster = { blendShapeGroups: [] };
  vrm.secondaryAnimation = { boneGroups: [], colliderGroups: [] };
  compact(json);

  // 每個 bufferView 依序重排；圖片的 bufferView 換成縮小後的 JPG
  const replaced = new Map();
  json.images.forEach((img, i) => {
    if (img.bufferView === undefined) return;
    const v = json.bufferViews[img.bufferView];
    replaced.set(img.bufferView, shrink(bin.subarray(v.byteOffset ?? 0, (v.byteOffset ?? 0) + v.byteLength), `${av.id}-${i}`));
    img.mimeType = 'image/jpeg';
  });
  const parts = [];
  let offset = 0;
  json.bufferViews.forEach((v, i) => {
    const data = replaced.get(i) ?? bin.subarray(v.byteOffset ?? 0, (v.byteOffset ?? 0) + v.byteLength);
    const start = pad4(offset);
    if (start > offset) parts.push(Buffer.alloc(start - offset));
    v.byteOffset = start;
    v.byteLength = data.length;
    parts.push(data);
    offset = start + data.length;
  });
  const newBin = Buffer.concat(parts);
  json.buffers = [{ byteLength: newBin.length }];
  // 執行時會換成會受光的標準材質，不需要 unlit 擴充
  for (const m of json.materials) delete m.extensions?.KHR_materials_unlit;
  json.extensionsUsed = (json.extensionsUsed ?? []).filter((e) => e !== 'KHR_materials_unlit');
  json.extensionsRequired = (json.extensionsRequired ?? []).filter((e) => e !== 'KHR_materials_unlit');
  if (!json.extensionsRequired.length) delete json.extensionsRequired;

  const out = writeGlb(json, newBin);
  fs.writeFileSync(path.join(OUT, `${av.id}.glb`), out);
  console.log(`${av.id}: ${(out.length / 1024).toFixed(0)} KB`);
}

fs.writeFileSync(
  path.join(OUT, 'LICENSE.txt'),
  [
    'Characters from the 100Avatars series (https://github.com/kourtincat/100Avatars),',
    'released under CC0 1.0 Universal (each model also states CC0 in its VRM metadata).',
    'Index: https://github.com/ToxSam/open-source-avatars',
    '',
    ...AVATARS.map((a) => `${a.id}.glb  ← ${a.name}  ${a.url}`),
    '',
  ].join('\n'),
);
fs.rmSync(tmp, { recursive: true, force: true });
