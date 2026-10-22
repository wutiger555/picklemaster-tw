/**
 * 建置遊戲選手素材（Quaternius CC0）：
 *   - Universal Base Characters [Standard]：Superhero_Male_FullBody（glTF）＋頭髮
 *   - Universal Animation Library 1 [Standard]：Unreal 骨架 FBX（移動、跳、蹲、揮擊）
 *   - Universal Animation Library 2 [Standard]：Unreal 骨架 GLB（揮砍、過頂投擲、擊退、滑步）
 * 三者都是同一套 Unreal 命名骨架，動作可以直接套用，不需要重定向。
 * 另外可選擇加入 Mixamo 動作（FBX，Mixamo 骨架），會重定向到上面的骨架（見 MIXAMO_CLIPS）。
 *
 * 用法（macOS，需要 sips）：
 *   node scripts/build-athlete-assets.mjs <UBC 解壓目錄> <UAL1 解壓目錄> <UAL2 解壓目錄> [Mixamo FBX 目錄]
 * 輸出到 public/game/athlete/。
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const [ubcDir, ual1Dir, ual2Dir, mixamoDir] = process.argv.slice(2);
if (!ubcDir || !ual1Dir || !ual2Dir) {
  console.error('usage: node scripts/build-athlete-assets.mjs <UBC> <UAL1> <UAL2>');
  process.exit(1);
}
const OUT = path.resolve('public/game/athlete');
fs.mkdirSync(OUT, { recursive: true });

const find = (dir, name) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      const r = find(p, name);
      if (r) return r;
    } else if (e.name === name) return p;
  }
  return null;
};

/** 貼圖縮到指定尺寸並轉 JPG（法線、粗糙度用較高品質） */
const toJpg = (src, dst, size, quality) => {
  // 素材包的 glTF 有些檔名多了 "_png"（實際檔案沒有），找不到就去掉再試
  if (!fs.existsSync(src)) src = src.replace('_png.png', '.png');
  if (!fs.existsSync(src)) throw new Error(`texture missing: ${src}`);
  execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', String(quality), '-Z', String(size), src, '--out', dst], {
    stdio: 'ignore',
  });
};

// ───────────────────────── 人物模型 ─────────────────────────
const bodyGltf = find(ubcDir, 'Superhero_Male_FullBody.gltf');
const baseDir = path.dirname(bodyGltf);
const gltf = JSON.parse(fs.readFileSync(bodyGltf, 'utf8'));
const imgMap = {
  'T_Superhero_Male_Dark.png': ['body_albedo.jpg', 1024, 88],
  'T_Superhero_Male_Normal.png': ['body_normal.jpg', 1024, 90],
  'T_Superhero_Male_Roughness.png': ['body_rough.jpg', 512, 80],
  'T_Eye_Brown.png': ['eye_albedo.jpg', 256, 88],
  'T_Eye_Normal_png.png': ['eye_normal.jpg', 128, 90],
  'T_Hair_1_BaseColor.png': ['hair1_albedo.jpg', 512, 85],
  'T_Hair_1_Normal_png.png': ['hair1_normal.jpg', 512, 88],
};
for (const img of gltf.images) {
  const m = imgMap[img.uri];
  if (!m) throw new Error(`unexpected image ${img.uri}`);
  toJpg(path.join(baseDir, img.uri), path.join(OUT, m[0]), m[1], m[2]);
  img.uri = m[0];
  img.mimeType = 'image/jpeg';
}
fs.copyFileSync(path.join(baseDir, gltf.buffers[0].uri), path.join(OUT, 'body.bin'));
gltf.buffers[0].uri = 'body.bin';
fs.writeFileSync(path.join(OUT, 'body.gltf'), JSON.stringify(gltf));

// 頭髮（綁在頭部骨頭上的版本）
const hairs = ['Hair_SimpleParted', 'Hair_Buzzed', 'Hair_Long', 'Hair_Buns'];
for (const h of hairs) {
  const p = [...walk(ubcDir)].find((f) => f.endsWith(`${h}.gltf`) && f.includes('Rigged to Head Bone'));
  if (!p) throw new Error(`hair ${h} not found`);
  const dir = path.dirname(p);
  const j = JSON.parse(fs.readFileSync(p, 'utf8'));
  for (const img of j.images ?? []) {
    const isNormal = img.uri.toLowerCase().includes('normal');
    const name = `${h.toLowerCase()}_${isNormal ? 'normal' : 'albedo'}.jpg`;
    toJpg(path.join(dir, img.uri), path.join(OUT, name), 512, isNormal ? 88 : 85);
    img.uri = name;
    img.mimeType = 'image/jpeg';
  }
  fs.copyFileSync(path.join(dir, j.buffers[0].uri), path.join(OUT, `${h.toLowerCase()}.bin`));
  j.buffers[0].uri = `${h.toLowerCase()}.bin`;
  fs.writeFileSync(path.join(OUT, `${h.toLowerCase()}.gltf`), JSON.stringify(j));
}

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

// ───────────────────────── 動作 ─────────────────────────
// 下半身與整體基底（揮拍姿勢由程式解算，不用動作檔）
const UAL1_CLIPS = ['Idle_Loop', 'Jog_Fwd_Loop', 'Sprint_Loop', 'Crouch_Idle_Loop', 'Jump_Loop'];
const UAL2_CLIPS = ['Hit_Knockback', 'Yes', 'Idle_No_Loop'];

const FINGER = /^(index|middle|pinky|ring|thumb)_|_leaf_|^ball_|^foot_end/;

const toAB = (buf) => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

/**
 * 只保留骨頭旋轉（四元數），外加骨盆位置（換算成公尺）；降到 30 fps、數值四捨五入，檔案才不會太大。
 */
const slim = (clip, posScale) => {
  const tracks = [];
  for (const t of clip.tracks) {
    const [bone, prop] = t.name.split('.');
    // 手指（每手 20 根）佔了大半檔案，打球用不到：手部改用固定握拍姿勢
    // root 在所有動作裡都不動；FBX 的 root 又少了座標軸轉換，留著反而會把人放倒
    if (FINGER.test(bone) || bone === 'Rig' || bone === 'root') continue;
    if (prop === 'quaternion') tracks.push(t);
    else if (prop === 'position' && bone === 'pelvis') {
      const v = Float32Array.from(t.values, (x) => x * posScale);
      tracks.push(new THREE.VectorKeyframeTrack(t.name, t.times, v));
    }
  }
  const c = new THREE.AnimationClip(clip.name.replace(/^.*\|/, ''), clip.duration, tracks);
  c.optimize();
  const json = THREE.AnimationClip.toJSON(c);
  for (const tr of json.tracks) {
    // 降取樣到 30 fps
    const stride = tr.type === 'quaternion' ? 4 : 3;
    const keepT = [];
    const keepV = [];
    let last = -1;
    tr.times.forEach((tm, i) => {
      if (i === 0 || i === tr.times.length - 1 || tm - last >= 1 / 30 - 1e-4) {
        keepT.push(+tm.toFixed(4));
        for (let k = 0; k < stride; k++) keepV.push(+tr.values[i * stride + k].toFixed(4));
        last = tm;
      }
    });
    tr.times = keepT;
    tr.values = keepV;
  }
  return json;
};

const out = [];
{
  const fbxPath = find(ual1Dir, 'AL_Standard.fbx');
  const obj = new FBXLoader().parse(toAB(fs.readFileSync(fbxPath)), '');
  // 骨盆位移已經是公尺（骨架根節點自帶 0.01 縮放），不用再換算
  for (const name of UAL1_CLIPS) {
    const clip = obj.animations.find((a) => a.name.endsWith(`|${name}`) || a.name === name);
    if (!clip) throw new Error(`UAL1 clip ${name} missing`);
    out.push(slim(clip, 1));
  }
}
{
  const glbPath = find(ual2Dir, 'UAL2_Standard.glb');
  const gl = await new Promise((res, rej) => new GLTFLoader().parse(toAB(fs.readFileSync(glbPath)), '', res, rej));
  for (const name of UAL2_CLIPS) {
    const clip = gl.animations.find((a) => a.name === name);
    if (!clip) throw new Error(`UAL2 clip ${name} missing`);
    out.push(slim(clip, 1));
  }
}
// ───────────────────────── Mixamo 動作（重定向） ─────────────────────────
/**
 * 檔名 → 輸出名稱。mirror：左右鏡像；inPlace：去掉水平位移（保留上下）。
 * 守門員側併步原本往右跨，鏡像得到往左；慶祝舞、必殺技身段都改成原地。
 */
const MIXAMO_CLIPS = [
  { file: 'Goalkeeper Sidestep.fbx', name: 'Mx_SideStep_R', inPlace: true },
  { file: 'Goalkeeper Sidestep.fbx', name: 'Mx_SideStep_L', inPlace: true, mirror: true },
  { file: 'Hip Hop Dancing.fbx', name: 'Mx_HipHop', inPlace: true },
  { file: 'Shuffling.fbx', name: 'Mx_Shuffle', inPlace: true },
  { file: 'Flying Knee Punch Combo.fbx', name: 'Mx_KneeCombo', inPlace: true },
  { file: 'Great Sword Slash.fbx', name: 'Mx_BigSlash', inPlace: true },
  { file: 'Standing Melee Attack Downward.fbx', name: 'Mx_Downward', inPlace: true },
  { file: 'Sword And Shield Attack.fbx', name: 'Mx_ShieldStrike', inPlace: true },
  { file: 'Great Sword Idle.fbx', name: 'Mx_PowerIdle', inPlace: true },
];
/** Mixamo 骨頭（去掉 mixamorig 前綴）→ Unreal 骨頭 */
const MIXAMO_BONES = {
  Hips: 'pelvis',
  Spine: 'spine_01',
  Spine1: 'spine_02',
  Spine2: 'spine_03',
  Neck: 'neck_01',
  Head: 'Head',
  LeftShoulder: 'clavicle_l',
  LeftArm: 'upperarm_l',
  LeftForeArm: 'lowerarm_l',
  LeftHand: 'hand_l',
  RightShoulder: 'clavicle_r',
  RightArm: 'upperarm_r',
  RightForeArm: 'lowerarm_r',
  RightHand: 'hand_r',
  LeftUpLeg: 'thigh_l',
  LeftLeg: 'calf_l',
  LeftFoot: 'foot_l',
  RightUpLeg: 'thigh_r',
  RightLeg: 'calf_r',
  RightFoot: 'foot_r',
};

if (mixamoDir) {
  // FBX 內嵌貼圖會用到瀏覽器物件；這裡只要骨架與動作，給個空殼就好
  globalThis.window ??= globalThis;
  const fakeEl = () => ({ style: {}, addEventListener() {}, removeEventListener() {}, setAttribute() {}, getContext: () => null });
  globalThis.document ??= { createElementNS: fakeEl, createElement: fakeEl };
  URL.createObjectURL = () => 'blob:';

  // 目標骨架（綁定姿勢 = T-pose，面向 +Z）
  const tNodes = gltf.nodes.map((n) => {
    const o = new THREE.Object3D();
    o.name = n.name;
    if (n.translation) o.position.fromArray(n.translation);
    if (n.rotation) o.quaternion.fromArray(n.rotation);
    if (n.scale) o.scale.fromArray(n.scale);
    return o;
  });
  gltf.nodes.forEach((n, i) => (n.children ?? []).forEach((c) => tNodes[i].add(tNodes[c])));
  const tRoot = new THREE.Group();
  gltf.scenes[0].nodes.forEach((i) => tRoot.add(tNodes[i]));
  tRoot.updateMatrixWorld(true);
  const tBone = (n) => tRoot.getObjectByName(n);
  const tRestQ = new Map();
  tRoot.traverse((o) => tRestQ.set(o.name, o.getWorldQuaternion(new THREE.Quaternion())));
  const pelvisRestY = tBone('pelvis').getWorldPosition(new THREE.Vector3()).y;
  const rootInv = tBone('pelvis').parent.matrixWorld.clone().invert();
  // 依階層由上而下（父骨頭先算）
  const targets = Object.values(MIXAMO_BONES);
  const order = [];
  tBone('pelvis').traverse((o) => targets.includes(o.name) && order.push(o.name));

  const mirrorQ = (q) => q.set(q.x, -q.y, -q.z, q.w);
  const swapLR = (n) => (n.startsWith('Left') ? 'Right' + n.slice(4) : n.startsWith('Right') ? 'Left' + n.slice(5) : n);
  const cache = new Map();

  for (const spec of MIXAMO_CLIPS) {
    const fbxPath = path.join(mixamoDir, spec.file);
    if (!fs.existsSync(fbxPath)) {
      console.warn(`skip ${spec.file} (not found)`);
      continue;
    }
    let src = cache.get(fbxPath);
    if (!src) {
      src = new FBXLoader().parse(toAB(fs.readFileSync(fbxPath)), '');
      cache.set(fbxPath, src);
    }
    const meshes = [];
    src.traverse((o) => o.isSkinnedMesh && meshes.push(o));
    const skel = meshes[0].skeleton;
    const sBone = new Map();
    for (const b of skel.bones) {
      const k = b.name.replace(/^mixamorig\d*:?/, '');
      if (MIXAMO_BONES[k] && !sBone.has(k)) sBone.set(k, b);
    }
    const clip = src.animations.find((c) => c.tracks.length);
    const mixer = new THREE.AnimationMixer(src);
    // 綁定姿勢（T-pose）
    skel.pose();
    src.updateMatrixWorld(true);
    const sRestQ = new Map([...sBone].map(([k, b]) => [k, b.getWorldQuaternion(new THREE.Quaternion())]));
    const scale = pelvisRestY / sBone.get('Hips').getWorldPosition(new THREE.Vector3()).y;
    const action = mixer.clipAction(clip).play();

    const fps = 30;
    const n = Math.max(2, Math.round(clip.duration * fps) + 1);
    const times = [];
    const quat = new Map(order.map((b) => [b, []]));
    const posRaw = [];
    const wq = new Map();
    for (let i = 0; i < n; i++) {
      const t = Math.min(clip.duration, i / fps);
      times.push(+t.toFixed(4));
      action.time = t;
      mixer.update(0);
      src.updateMatrixWorld(true);
      // 世界座標下「相對 T-pose 的旋轉」照搬到目標骨頭
      wq.clear();
      for (const [k, b] of sBone) {
        const delta = b.getWorldQuaternion(new THREE.Quaternion()).multiply(sRestQ.get(k).clone().invert());
        const tk = spec.mirror ? swapLR(k) : k;
        if (spec.mirror) mirrorQ(delta);
        wq.set(MIXAMO_BONES[tk], delta.multiply(tRestQ.get(MIXAMO_BONES[tk])));
      }
      for (const name of order) {
        const bone = tBone(name);
        const parentW = wq.get(bone.parent.name) ?? tRestQ.get(bone.parent.name);
        const local = parentW.clone().invert().multiply(wq.get(name));
        quat.get(name).push(...local.toArray().map((v) => +v.toFixed(4)));
      }
      const hp = sBone.get('Hips').getWorldPosition(new THREE.Vector3()).multiplyScalar(scale);
      if (spec.mirror) hp.x = -hp.x;
      posRaw.push(hp);
    }
    // 原地：扣掉起點到終點的水平線性位移，只留身體晃動
    const p0 = posRaw[0].clone();
    const p1 = posRaw[n - 1].clone();
    const pos = [];
    posRaw.forEach((p, i) => {
      const k = i / (n - 1);
      const q = p.clone();
      if (spec.inPlace) {
        q.x -= p0.x + (p1.x - p0.x) * k;
        q.z -= p0.z + (p1.z - p0.z) * k;
      }
      q.applyMatrix4(rootInv);
      pos.push(...q.toArray().map((v) => +v.toFixed(4)));
    });
    const tracks = order.map((name) => ({ name: `${name}.quaternion`, type: 'quaternion', times, values: quat.get(name) }));
    tracks.push({ name: 'pelvis.position', type: 'vector', times, values: pos });
    out.push({ name: spec.name, duration: +clip.duration.toFixed(4), tracks, uuid: spec.name, blendMode: 2500 });
    console.log('mixamo', spec.name, clip.duration.toFixed(2) + 's');
  }
}

fs.writeFileSync(path.join(OUT, 'anims.json'), JSON.stringify(out));

fs.writeFileSync(
  path.join(OUT, 'LICENSE.txt'),
  'Models and animations by Quaternius (https://quaternius.com), CC0 1.0 Universal.\n' +
    'Universal Base Characters, Universal Animation Library 1 & 2 (Standard).\n' +
    (mixamoDir
      ? '\nAnimations prefixed "Mx_" in anims.json are from Adobe Mixamo (https://www.mixamo.com), retargeted for this game.\n' +
        'They are used under the Mixamo terms and are NOT covered by CC0; do not redistribute them separately.\n'
      : ''),
);
for (const f of fs.readdirSync(OUT)) console.log(f.padEnd(28), (fs.statSync(path.join(OUT, f)).size / 1024).toFixed(0), 'KB');
