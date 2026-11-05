import { forwardRef, useMemo } from 'react';
import * as THREE from 'three';
import type { PaddleSpec } from '../engine/paddles';
import { RAW_FACE, gripTexture, paddleFaceTexture } from './textures';

import { HANDLE_LEN, HANDLE_R } from './paddleGeometry';

/**
 * 依拍型畫出拍面外框。原點在拍面底部中央（接握把處），往 +Y 延伸。
 * 長拍窄長、寬拍上緣更圓、混合拍介於兩者。
 */
const outline = (spec: PaddleSpec) => {
  const faceLen = spec.length - HANDLE_LEN;
  const w = spec.width / 2;
  const top = faceLen;
  const cornerTop = spec.shape === 'widebody' ? w * 0.55 : spec.shape === 'elongated' ? w * 0.32 : w * 0.42;
  const cornerBot = w * 0.3;
  const throatW = HANDLE_R * 1.35;
  const s = new THREE.Shape();
  s.moveTo(-throatW, 0);
  // 下緣從握把頸部往外展開
  s.quadraticCurveTo(-w * 0.7, 0.004, -w + cornerBot * 0.4, cornerBot * 0.55);
  s.quadraticCurveTo(-w, cornerBot * 0.9, -w, cornerBot + 0.012);
  s.lineTo(-w, top - cornerTop);
  s.quadraticCurveTo(-w, top, -w + cornerTop, top);
  s.lineTo(w - cornerTop, top);
  s.quadraticCurveTo(w, top, w, top - cornerTop);
  s.lineTo(w, cornerBot + 0.012);
  s.quadraticCurveTo(w, cornerBot * 0.9, w - cornerBot * 0.4, cornerBot * 0.55);
  s.quadraticCurveTo(w * 0.7, 0.004, throatW, 0);
  s.closePath();
  return { shape: s, faceLen };
};

/**
 * 擠出幾何的正反面 UV 依外框邊界正規化，貼圖才會完整貼滿拍面。
 * 背面（z < 0）左右翻過來，從背面看字才不會是反的。
 */
const normalizeUV = (geo: THREE.BufferGeometry, w: number, h: number) => {
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) {
    const u = pos.getX(i) / w;
    uv.setXY(i, pos.getZ(i) < 0 ? 0.5 - u : u + 0.5, pos.getY(i) / h);
  }
  uv.needsUpdate = true;
};

interface Props {
  spec: PaddleSpec;
  /** 必殺蓄勢時拍面發光 */
  glow?: number;
}

/**
 * 球拍模型。原點在握把中段（手握的位置），拍面朝 +Y、拍面法線為 ±Z。
 */
export const PaddleModel = forwardRef<THREE.Group, Props>(({ spec, glow = 0 }, ref) => {
  const parts = useMemo(() => {
    const { shape, faceLen } = outline(spec);
    const thick = spec.thickness / 1000;
    const face = new THREE.ExtrudeGeometry(shape, {
      depth: thick,
      bevelEnabled: true,
      bevelThickness: 0.0012,
      bevelSize: 0.0012,
      bevelSegments: 2,
      curveSegments: 18,
    });
    face.translate(0, 0, -thick / 2);
    normalizeUV(face, spec.width, faceLen);
    face.computeVertexNormals();

    // 包邊條：沿外框（略過握把頸部）的圓管
    const pts = shape.getSpacedPoints(160).filter((p) => p.y > 0.012 || Math.abs(p.x) > spec.width * 0.3);
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p.x, p.y, 0)));
    const guard = new THREE.TubeGeometry(curve, 200, thick / 2 + 0.0016, 8, false);

    const handle = new THREE.CylinderGeometry(HANDLE_R, HANDLE_R * 1.04, HANDLE_LEN, 8, 1);
    const butt = new THREE.CylinderGeometry(HANDLE_R * 1.25, HANDLE_R * 1.1, 0.012, 16);
    const throat = new THREE.CylinderGeometry(HANDLE_R * 1.05, HANDLE_R * 1.45, 0.03, 8);
    return { face, guard, handle, butt, throat, faceLen };
  }, [spec]);

  const faceTex = paddleFaceTexture(spec);
  const grip = useMemo(() => {
    const t = gripTexture(spec.look.grip).clone();
    t.repeat.set(1, 3);
    t.needsUpdate = true;
    return t;
  }, [spec.look.grip]);
  const glowColor = useMemo(() => new THREE.Color(spec.look.primary), [spec.look.primary]);

  // 握把中段在原點；拍面底部在握把上端
  const handleTop = HANDLE_LEN / 2;
  return (
    <group ref={ref}>
      <mesh geometry={parts.handle} castShadow>
        <meshStandardMaterial map={grip} roughness={0.85} />
      </mesh>
      <mesh geometry={parts.butt} position={[0, -HANDLE_LEN / 2 - 0.006, 0]}>
        <meshStandardMaterial color={spec.look.primary} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh geometry={parts.throat} position={[0, handleTop + 0.005, 0]}>
        <meshStandardMaterial color={spec.look.edge} roughness={0.4} />
      </mesh>
      <group position={[0, handleTop, 0]}>
        <mesh geometry={parts.face} castShadow>
          {/* 第 0 組＝正反面（貼圖）、第 1 組＝側邊 */}
          <meshStandardMaterial
            attach="material-0"
            map={faceTex}
            roughness={RAW_FACE.has(spec.look.pattern) ? 0.75 : spec.look.pattern === 'gloss' ? 0.2 : 0.38}
            metalness={0.25}
            emissive={glowColor}
            emissiveIntensity={glow}
          />
          <meshStandardMaterial attach="material-1" color={spec.look.edge} roughness={0.5} />
        </mesh>
        <mesh geometry={parts.guard} castShadow>
          <meshStandardMaterial color={spec.look.edge} roughness={0.35} metalness={0.4} emissive={glowColor} emissiveIntensity={glow * 0.6} />
        </mesh>
      </group>
    </group>
  );
});
PaddleModel.displayName = 'PaddleModel';

