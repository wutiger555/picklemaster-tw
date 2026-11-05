import * as THREE from 'three';

/** 椰子葉：一片往外上揚、再往下垂的長條（新生公園的大王椰子、海邊的椰子樹共用） */
export const buildPalmFrond = () => {
  const len = 3.6;
  const geo = new THREE.PlaneGeometry(1.2, len, 1, 10);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) + len / 2;
    const x = pos.getX(i);
    // 先往外上揚，再往下垂
    pos.setXYZ(i, x * (0.4 + (y / len) * 0.6), y * 0.55 - y * y * 0.17, y * 0.92);
  }
  geo.computeVertexNormals();
  return geo;
};
