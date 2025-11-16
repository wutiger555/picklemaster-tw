import { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// 真實比例的 3D 人形模型
// 參考：成人平均身高 170cm，使用真實人體比例建模
function PlayerModel({ technique, step }: { technique: string; step: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const leftShoulderRef = useRef<THREE.Group>(null);
  const leftElbowRef = useRef<THREE.Group>(null);
  const rightShoulderRef = useRef<THREE.Group>(null);
  const rightElbowRef = useRef<THREE.Group>(null);
  const leftHipRef = useRef<THREE.Group>(null);
  const leftKneeRef = useRef<THREE.Group>(null);
  const rightHipRef = useRef<THREE.Group>(null);
  const rightKneeRef = useRef<THREE.Group>(null);

  // 根據技術和步驟設定詳細姿勢（基於 USA Pickleball 官方規範和真實動作）
  const getPose = () => {
    if (technique === 'serve') {
      switch (step) {
        case 0: // 準備姿勢
          return {
            torsoRotation: { x: 0, y: 0, z: 0 },
            leftShoulder: { x: 0, y: 0, z: 0.3 },
            leftElbow: { x: 0, y: 0, z: 1.2 },
            rightShoulder: { x: 0.2, y: 0, z: -0.4 },
            rightElbow: { x: 1.0, y: 0, z: 0 },
            leftHip: { x: 0.1, y: 0, z: 0 },
            leftKnee: { x: 0.2, y: 0, z: 0 },
            rightHip: { x: 0.1, y: 0, z: 0 },
            rightKnee: { x: 0.2, y: 0, z: 0 },
            paddleRotation: { x: 0, y: 0, z: 0 },
          };
        case 1: // 後擺動作
          return {
            torsoRotation: { x: 0.15, y: -0.4, z: 0 },
            leftShoulder: { x: -0.3, y: 0, z: 0.5 },
            leftElbow: { x: 0.8, y: 0, z: 1.5 },
            rightShoulder: { x: 0.3, y: 0, z: -0.5 },
            rightElbow: { x: 1.2, y: 0, z: 0 },
            leftHip: { x: 0.15, y: 0, z: 0.1 },
            leftKnee: { x: 0.3, y: 0, z: 0 },
            rightHip: { x: 0.05, y: 0, z: -0.1 },
            rightKnee: { x: 0.15, y: 0, z: 0 },
            paddleRotation: { x: -Math.PI / 6, y: 0, z: -Math.PI / 4 },
          };
        case 2: // 擊球瞬間（關鍵：由下往上）
          return {
            torsoRotation: { x: -0.2, y: 0.3, z: 0 },
            leftShoulder: { x: 0.4, y: 0, z: 0.2 },
            leftElbow: { x: -0.3, y: 0, z: 0.8 },
            rightShoulder: { x: 0.1, y: 0, z: -0.3 },
            rightElbow: { x: 0.8, y: 0, z: 0 },
            leftHip: { x: 0.2, y: 0, z: 0.15 },
            leftKnee: { x: 0.4, y: 0, z: 0 },
            rightHip: { x: 0.1, y: 0, z: -0.15 },
            rightKnee: { x: 0.25, y: 0, z: 0 },
            paddleRotation: { x: Math.PI / 4, y: 0, z: Math.PI / 8 },
          };
        case 3: // 跟進動作
          return {
            torsoRotation: { x: -0.25, y: 0.5, z: 0 },
            leftShoulder: { x: 0.6, y: 0, z: 0 },
            leftElbow: { x: -0.5, y: 0, z: 0.4 },
            rightShoulder: { x: 0, y: 0, z: -0.2 },
            rightElbow: { x: 0.6, y: 0, z: 0 },
            leftHip: { x: 0.2, y: 0, z: 0.2 },
            leftKnee: { x: 0.35, y: 0, z: 0 },
            rightHip: { x: 0.15, y: 0, z: -0.1 },
            rightKnee: { x: 0.3, y: 0, z: 0 },
            paddleRotation: { x: Math.PI / 3, y: 0, z: Math.PI / 6 },
          };
        default:
          return {
            torsoRotation: { x: 0, y: 0, z: 0 },
            leftShoulder: { x: 0, y: 0, z: 0.3 },
            leftElbow: { x: 0, y: 0, z: 1.2 },
            rightShoulder: { x: 0.2, y: 0, z: -0.4 },
            rightElbow: { x: 1.0, y: 0, z: 0 },
            leftHip: { x: 0.1, y: 0, z: 0 },
            leftKnee: { x: 0.2, y: 0, z: 0 },
            rightHip: { x: 0.1, y: 0, z: 0 },
            rightKnee: { x: 0.2, y: 0, z: 0 },
            paddleRotation: { x: 0, y: 0, z: 0 },
          };
      }
    } else if (technique === 'volley') {
      switch (step) {
        case 0: // 準備站位
          return {
            torsoRotation: { x: 0.1, y: 0, z: 0 },
            leftShoulder: { x: 0.2, y: 0, z: 0.4 },
            leftElbow: { x: -0.2, y: 0, z: 1.0 },
            rightShoulder: { x: 0.2, y: 0, z: -0.4 },
            rightElbow: { x: 1.0, y: 0, z: 0 },
            leftHip: { x: 0.15, y: 0, z: 0 },
            leftKnee: { x: 0.3, y: 0, z: 0 },
            rightHip: { x: 0.15, y: 0, z: 0 },
            rightKnee: { x: 0.3, y: 0, z: 0 },
            paddleRotation: { x: Math.PI / 6, y: 0, z: 0 },
          };
        case 1: // 預判來球
          return {
            torsoRotation: { x: 0.15, y: -0.3, z: 0 },
            leftShoulder: { x: 0.1, y: 0, z: 0.5 },
            leftElbow: { x: -0.1, y: 0, z: 1.1 },
            rightShoulder: { x: 0.3, y: 0, z: -0.5 },
            rightElbow: { x: 1.1, y: 0, z: 0 },
            leftHip: { x: 0.2, y: 0, z: 0.1 },
            leftKnee: { x: 0.4, y: 0, z: 0 },
            rightHip: { x: 0.1, y: 0, z: -0.1 },
            rightKnee: { x: 0.25, y: 0, z: 0 },
            paddleRotation: { x: Math.PI / 5, y: 0, z: -Math.PI / 8 },
          };
        case 2: // 快速反應擊球
          return {
            torsoRotation: { x: -0.1, y: 0.4, z: 0 },
            leftShoulder: { x: 0.5, y: 0, z: 0.2 },
            leftElbow: { x: -0.4, y: 0, z: 0.7 },
            rightShoulder: { x: 0.1, y: 0, z: -0.3 },
            rightElbow: { x: 0.8, y: 0, z: 0 },
            leftHip: { x: 0.2, y: 0, z: 0.15 },
            leftKnee: { x: 0.4, y: 0, z: 0 },
            rightHip: { x: 0.15, y: 0, z: -0.1 },
            rightKnee: { x: 0.3, y: 0, z: 0 },
            paddleRotation: { x: Math.PI / 4, y: 0, z: Math.PI / 6 },
          };
        case 3: // 回位
          return {
            torsoRotation: { x: 0.05, y: 0, z: 0 },
            leftShoulder: { x: 0.2, y: 0, z: 0.3 },
            leftElbow: { x: -0.2, y: 0, z: 1.0 },
            rightShoulder: { x: 0.2, y: 0, z: -0.4 },
            rightElbow: { x: 1.0, y: 0, z: 0 },
            leftHip: { x: 0.15, y: 0, z: 0 },
            leftKnee: { x: 0.3, y: 0, z: 0 },
            rightHip: { x: 0.15, y: 0, z: 0 },
            rightKnee: { x: 0.3, y: 0, z: 0 },
            paddleRotation: { x: Math.PI / 6, y: 0, z: 0 },
          };
        default:
          return {
            torsoRotation: { x: 0, y: 0, z: 0 },
            leftShoulder: { x: 0, y: 0, z: 0.3 },
            leftElbow: { x: 0, y: 0, z: 1.2 },
            rightShoulder: { x: 0.2, y: 0, z: -0.4 },
            rightElbow: { x: 1.0, y: 0, z: 0 },
            leftHip: { x: 0.1, y: 0, z: 0 },
            leftKnee: { x: 0.2, y: 0, z: 0 },
            rightHip: { x: 0.1, y: 0, z: 0 },
            rightKnee: { x: 0.2, y: 0, z: 0 },
            paddleRotation: { x: 0, y: 0, z: 0 },
          };
      }
    }
    return {
      torsoRotation: { x: 0, y: 0, z: 0 },
      leftShoulder: { x: 0, y: 0, z: 0.3 },
      leftElbow: { x: 0, y: 0, z: 1.2 },
      rightShoulder: { x: 0.2, y: 0, z: -0.4 },
      rightElbow: { x: 1.0, y: 0, z: 0 },
      leftHip: { x: 0.1, y: 0, z: 0 },
      leftKnee: { x: 0.2, y: 0, z: 0 },
      rightHip: { x: 0.1, y: 0, z: 0 },
      rightKnee: { x: 0.2, y: 0, z: 0 },
      paddleRotation: { x: 0, y: 0, z: 0 },
    };
  };

  const targetPose = getPose();

  useFrame(() => {
    const lerpFactor = 0.08;

    if (torsoRef.current) {
      torsoRef.current.rotation.x += (targetPose.torsoRotation.x - torsoRef.current.rotation.x) * lerpFactor;
      torsoRef.current.rotation.y += (targetPose.torsoRotation.y - torsoRef.current.rotation.y) * lerpFactor;
      torsoRef.current.rotation.z += (targetPose.torsoRotation.z - torsoRef.current.rotation.z) * lerpFactor;
    }

    if (leftShoulderRef.current) {
      leftShoulderRef.current.rotation.x += (targetPose.leftShoulder.x - leftShoulderRef.current.rotation.x) * lerpFactor;
      leftShoulderRef.current.rotation.y += (targetPose.leftShoulder.y - leftShoulderRef.current.rotation.y) * lerpFactor;
      leftShoulderRef.current.rotation.z += (targetPose.leftShoulder.z - leftShoulderRef.current.rotation.z) * lerpFactor;
    }

    if (leftElbowRef.current) {
      leftElbowRef.current.rotation.x += (targetPose.leftElbow.x - leftElbowRef.current.rotation.x) * lerpFactor;
      leftElbowRef.current.rotation.z += (targetPose.leftElbow.z - leftElbowRef.current.rotation.z) * lerpFactor;
    }

    if (rightShoulderRef.current) {
      rightShoulderRef.current.rotation.x += (targetPose.rightShoulder.x - rightShoulderRef.current.rotation.x) * lerpFactor;
      rightShoulderRef.current.rotation.z += (targetPose.rightShoulder.z - rightShoulderRef.current.rotation.z) * lerpFactor;
    }

    if (rightElbowRef.current) {
      rightElbowRef.current.rotation.x += (targetPose.rightElbow.x - rightElbowRef.current.rotation.x) * lerpFactor;
    }

    if (leftHipRef.current) {
      leftHipRef.current.rotation.x += (targetPose.leftHip.x - leftHipRef.current.rotation.x) * lerpFactor;
      leftHipRef.current.rotation.z += (targetPose.leftHip.z - leftHipRef.current.rotation.z) * lerpFactor;
    }

    if (leftKneeRef.current) {
      leftKneeRef.current.rotation.x += (targetPose.leftKnee.x - leftKneeRef.current.rotation.x) * lerpFactor;
    }

    if (rightHipRef.current) {
      rightHipRef.current.rotation.x += (targetPose.rightHip.x - rightHipRef.current.rotation.x) * lerpFactor;
      rightHipRef.current.rotation.z += (targetPose.rightHip.z - rightHipRef.current.rotation.z) * lerpFactor;
    }

    if (rightKneeRef.current) {
      rightKneeRef.current.rotation.x += (targetPose.rightKnee.x - rightKneeRef.current.rotation.x) * lerpFactor;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 軀幹 - 使用真實比例 */}
      <group ref={torsoRef} position={[0, 1.0, 0]}>
        {/* 胸部/上軀幹 */}
        <mesh position={[0, 0.25, 0]} castShadow>
          <capsuleGeometry args={[0.22, 0.4, 16, 32]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>

        {/* 腹部/下軀幹 */}
        <mesh position={[0, -0.15, 0]} castShadow>
          <capsuleGeometry args={[0.18, 0.3, 16, 32]} />
          <meshStandardMaterial color="#2563eb" />
        </mesh>

        {/* 頸部 */}
        <mesh position={[0, 0.55, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.09, 0.12, 16]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>

        {/* 頭部 - 橢圓形更真實 */}
        <mesh position={[0, 0.72, 0]} castShadow>
          <sphereGeometry args={[0.16, 32, 32]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>

        {/* 臉部特徵（簡化） */}
        <mesh position={[0, 0.72, 0.15]} castShadow>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>

        {/* 左肩膀（持拍手）*/}
        <group ref={leftShoulderRef} position={[-0.28, 0.35, 0]}>
          {/* 肩關節 */}
          <mesh castShadow>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial color="#60a5fa" />
          </mesh>

          {/* 上臂 */}
          <mesh position={[0, -0.18, 0]} castShadow>
            <capsuleGeometry args={[0.06, 0.28, 12, 24]} />
            <meshStandardMaterial color="#3b82f6" />
          </mesh>

          {/* 左手肘 */}
          <group ref={leftElbowRef} position={[0, -0.36, 0]}>
            {/* 肘關節 */}
            <mesh castShadow>
              <sphereGeometry args={[0.065, 16, 16]} />
              <meshStandardMaterial color="#93c5fd" />
            </mesh>

            {/* 前臂 */}
            <mesh position={[0, -0.16, 0]} castShadow>
              <capsuleGeometry args={[0.055, 0.26, 12, 24]} />
              <meshStandardMaterial color="#60a5fa" />
            </mesh>

            {/* 手腕 */}
            <mesh position={[0, -0.32, 0]} castShadow>
              <sphereGeometry args={[0.05, 12, 12]} />
              <meshStandardMaterial color="#93c5fd" />
            </mesh>

            {/* 手掌 */}
            <mesh position={[0, -0.4, 0]} rotation={[0, 0, 0]} castShadow>
              <boxGeometry args={[0.08, 0.12, 0.04]} />
              <meshStandardMaterial color="#f59e0b" />
            </mesh>

            {/* 球拍 - 正確的扁平橢圓形（參考 FloatingPickleball.tsx）*/}
            <group position={[0, -0.52, 0]} rotation={[targetPose.paddleRotation.x, targetPose.paddleRotation.y, targetPose.paddleRotation.z]}>
              {/* 拍面 - 扁平矩形 */}
              <mesh castShadow>
                <boxGeometry args={[0.18, 0.24, 0.015]} />
                <meshStandardMaterial color="#2563eb" roughness={0.35} metalness={0.15} />
              </mesh>

              {/* 拍面邊框 */}
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.185, 0.245, 0.012]} />
                <meshStandardMaterial color="#1e3a8a" roughness={0.4} />
              </mesh>

              {/* 拍面蜂窩紋理（簡化版）*/}
              {[...Array(5)].map((_, row) => (
                [...Array(4)].map((_, col) => {
                  const x = -0.075 + col * 0.05;
                  const y = -0.1 + row * 0.05;
                  const offsetX = row % 2 === 0 ? 0 : 0.025;

                  return (
                    <mesh
                      key={`hex-${row}-${col}`}
                      position={[x + offsetX, y, 0.008]}
                    >
                      <circleGeometry args={[0.018, 6]} />
                      <meshStandardMaterial color="#3b82f6" roughness={0.3} />
                    </mesh>
                  );
                })
              )).flat()}

              {/* 握把 */}
              <group position={[0, -0.18, 0]}>
                <mesh rotation={[0, 0, 0]} castShadow>
                  <cylinderGeometry args={[0.015, 0.018, 0.12, 12]} />
                  <meshStandardMaterial color="#1f2937" roughness={0.85} />
                </mesh>

                {/* 握把纏帶紋理 */}
                {[...Array(6)].map((_, i) => (
                  <mesh
                    key={`grip-${i}`}
                    position={[0, -0.05 + i * 0.02, 0]}
                    rotation={[0, 0, 0]}
                  >
                    <cylinderGeometry args={[0.016, 0.016, 0.008, 12]} />
                    <meshStandardMaterial color={i % 2 === 0 ? '#374151' : '#1f2937'} roughness={0.9} />
                  </mesh>
                ))}

                {/* 握把端蓋 */}
                <mesh position={[0, -0.065, 0]}>
                  <cylinderGeometry args={[0.02, 0.018, 0.01, 12]} />
                  <meshStandardMaterial color="#111827" />
                </mesh>
              </group>
            </group>
          </group>
        </group>

        {/* 右肩膀 */}
        <group ref={rightShoulderRef} position={[0.28, 0.35, 0]}>
          {/* 肩關節 */}
          <mesh castShadow>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial color="#60a5fa" />
          </mesh>

          {/* 上臂 */}
          <mesh position={[0, -0.18, 0]} castShadow>
            <capsuleGeometry args={[0.06, 0.28, 12, 24]} />
            <meshStandardMaterial color="#3b82f6" />
          </mesh>

          {/* 右手肘 */}
          <group ref={rightElbowRef} position={[0, -0.36, 0]}>
            {/* 肘關節 */}
            <mesh castShadow>
              <sphereGeometry args={[0.065, 16, 16]} />
              <meshStandardMaterial color="#93c5fd" />
            </mesh>

            {/* 前臂 */}
            <mesh position={[0, -0.16, 0]} castShadow>
              <capsuleGeometry args={[0.055, 0.26, 12, 24]} />
              <meshStandardMaterial color="#60a5fa" />
            </mesh>

            {/* 手 */}
            <mesh position={[0, -0.35, 0]} castShadow>
              <boxGeometry args={[0.08, 0.12, 0.04]} />
              <meshStandardMaterial color="#f59e0b" />
            </mesh>
          </group>
        </group>
      </group>

      {/* 臀部 */}
      <mesh position={[0, 0.58, 0]} castShadow>
        <capsuleGeometry args={[0.16, 0.1, 16, 24]} />
        <meshStandardMaterial color="#1e40af" />
      </mesh>

      {/* 左腿 */}
      <group ref={leftHipRef} position={[-0.12, 0.52, 0]}>
        {/* 髖關節 */}
        <mesh castShadow>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#1e3a8a" />
        </mesh>

        {/* 大腿 */}
        <mesh position={[0, -0.22, 0]} castShadow>
          <capsuleGeometry args={[0.075, 0.36, 12, 24]} />
          <meshStandardMaterial color="#1e40af" />
        </mesh>

        {/* 左膝蓋 */}
        <group ref={leftKneeRef} position={[0, -0.44, 0]}>
          {/* 膝關節 */}
          <mesh castShadow>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color="#1e3a8a" />
          </mesh>

          {/* 小腿 */}
          <mesh position={[0, -0.2, 0]} castShadow>
            <capsuleGeometry args={[0.06, 0.32, 12, 24]} />
            <meshStandardMaterial color="#2563eb" />
          </mesh>

          {/* 腳踝 */}
          <mesh position={[0, -0.38, 0]} castShadow>
            <sphereGeometry args={[0.055, 12, 12]} />
            <meshStandardMaterial color="#1e3a8a" />
          </mesh>

          {/* 腳 */}
          <mesh position={[0, -0.44, 0.05]} castShadow>
            <boxGeometry args={[0.08, 0.06, 0.16]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
        </group>
      </group>

      {/* 右腿 */}
      <group ref={rightHipRef} position={[0.12, 0.52, 0]}>
        {/* 髖關節 */}
        <mesh castShadow>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#1e3a8a" />
        </mesh>

        {/* 大腿 */}
        <mesh position={[0, -0.22, 0]} castShadow>
          <capsuleGeometry args={[0.075, 0.36, 12, 24]} />
          <meshStandardMaterial color="#1e40af" />
        </mesh>

        {/* 右膝蓋 */}
        <group ref={rightKneeRef} position={[0, -0.44, 0]}>
          {/* 膝關節 */}
          <mesh castShadow>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color="#1e3a8a" />
          </mesh>

          {/* 小腿 */}
          <mesh position={[0, -0.2, 0]} castShadow>
            <capsuleGeometry args={[0.06, 0.32, 12, 24]} />
            <meshStandardMaterial color="#2563eb" />
          </mesh>

          {/* 腳踝 */}
          <mesh position={[0, -0.38, 0]} castShadow>
            <sphereGeometry args={[0.055, 12, 12]} />
            <meshStandardMaterial color="#1e3a8a" />
          </mesh>

          {/* 腳 */}
          <mesh position={[0, -0.44, 0.05]} castShadow>
            <boxGeometry args={[0.08, 0.06, 0.16]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
        </group>
      </group>

      {/* 腳部位置標記 */}
      {technique === 'serve' && step === 0 && (
        <Html position={[0, -0.35, 0]} center>
          <div className="bg-court-500 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
            🦶 雙腳站穩
          </div>
        </Html>
      )}

      {/* 擊球點標註 */}
      {step === 2 && (
        <>
          <Html position={[-0.4, 0.65, 0]} center>
            <div className="bg-pickleball-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shadow-lg">
              🏓 擊球點（低於腰部）
            </div>
          </Html>
          <Html position={[0, 0.3, 0]} center>
            <div className="bg-sport-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
              ⚖️ 重心前移
            </div>
          </Html>
          <Html position={[-0.5, 1.1, 0]} center>
            <div className="bg-court-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shadow-lg">
              📐 拍面由下往上
            </div>
          </Html>
        </>
      )}

      {/* 後擺標註 */}
      {technique === 'serve' && step === 1 && (
        <Html position={[-0.5, 0.9, 0]} center>
          <div className="bg-pickleball-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shadow-lg">
            ↙️ 後擺準備
          </div>
        </Html>
      )}

      {/* 跟進標註 */}
      {technique === 'serve' && step === 3 && (
        <Html position={[-0.5, 1.2, 0]} center>
          <div className="bg-sport-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shadow-lg">
            ↗️ 順勢跟進
          </div>
        </Html>
      )}
    </group>
  );
}

// 球場地板 - 正確的匹克球場規格
// 44英尺長 x 20英尺寬 (13.41m x 6.10m)
// 比例：44:20 = 2.2:1
function Court() {
  // 使用比例尺：1單位 = 1英尺 / 4 = 0.25 (縮小以適應畫面)
  const scale = 0.22;
  const courtLength = 44 * scale; // 9.68
  const courtWidth = 20 * scale; // 4.4
  const kitchenLength = 7 * scale; // 1.54

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      {/* 球場地面 */}
      <mesh receiveShadow>
        <planeGeometry args={[courtWidth, courtLength]} />
        <meshStandardMaterial color="#15803d" />
      </mesh>

      {/* 球場外框（邊線和底線）- 白色 */}
      <lineSegments position={[0, 0, 0.01]}>
        <edgesGeometry
          attach="geometry"
          args={[new THREE.PlaneGeometry(courtWidth, courtLength)]}
        />
        <lineBasicMaterial color="#ffffff" linewidth={3} />
      </lineSegments>

      {/* 球網（中線）*/}
      <mesh position={[0, 0, 0.015]}>
        <boxGeometry args={[courtWidth + 0.1, 0.08, 0.02]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* 上半場廚房區線 */}
      <mesh position={[0, kitchenLength, 0.01]}>
        <boxGeometry args={[courtWidth, 0.04, 0.01]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* 下半場廚房區線 */}
      <mesh position={[0, -kitchenLength, 0.01]}>
        <boxGeometry args={[courtWidth, 0.04, 0.01]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* 中線（分隔發球區）- 虛線效果 */}
      {/* 上半場中線 */}
      {[...Array(15)].map((_, i) => (
        <mesh
          key={`top-${i}`}
          position={[0, kitchenLength + (courtLength / 2 - kitchenLength) / 15 * (i + 0.5), 0.01]}
        >
          <boxGeometry args={[0.04, (courtLength / 2 - kitchenLength) / 30, 0.01]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* 下半場中線 */}
      {[...Array(15)].map((_, i) => (
        <mesh
          key={`bottom-${i}`}
          position={[0, -kitchenLength - (courtLength / 2 - kitchenLength) / 15 * (i + 0.5), 0.01]}
        >
          <boxGeometry args={[0.04, (courtLength / 2 - kitchenLength) / 30, 0.01]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* 廚房區標記（半透明黃色區域）*/}
      <mesh position={[0, kitchenLength / 2, 0.005]}>
        <planeGeometry args={[courtWidth - 0.05, kitchenLength]} />
        <meshStandardMaterial color="#fbbf24" opacity={0.15} transparent />
      </mesh>
      <mesh position={[0, -kitchenLength / 2, 0.005]}>
        <planeGeometry args={[courtWidth - 0.05, kitchenLength]} />
        <meshStandardMaterial color="#fbbf24" opacity={0.15} transparent />
      </mesh>
    </group>
  );
}

// 3D 場景組件
function Scene({ technique, step }: { technique: string; step: number }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[4, 3, 4]} />
      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={8}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
      />

      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={0.5} />

      <Suspense fallback={null}>
        <PlayerModel technique={technique} step={step} />
        <Court />
      </Suspense>
    </>
  );
}

const TechniqueViewer3D = () => {
  const [selectedTechnique, setSelectedTechnique] = useState('serve');
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // 資料來源：USA Pickleball Official Rulebook 2024
  const techniques = [
    {
      id: 'serve',
      name: '發球技術',
      icon: '🎾',
      steps: [
        {
          name: '準備姿勢',
          description: '站在底線後，雙腳與肩同寬，身體放鬆面向球場',
          keyPoints: [
            '🦶 至少一隻腳在底線後方',
            '⚖️ 重心均勻分配於雙腳',
            '👀 視線注視對角發球區',
            '🏓 球拍自然握持，手腕放鬆',
          ],
          source: 'USA Pickleball Official Rulebook 2024, Section 4.A.4',
        },
        {
          name: '後擺動作',
          description: '球拍向後下方擺動，為擊球蓄積力量',
          keyPoints: [
            '↙️ 球拍向身體後方擺動',
            '🔄 身體微微轉向持拍側',
            '⬇️ 球拍頭部位置低於手腕',
            '💪 手臂保持放鬆，不要過度用力',
          ],
          source: 'USA Pickleball Official Rulebook 2024, Section 4.A.5',
        },
        {
          name: '擊球瞬間',
          description: '由下往上擊球，擊球點必須低於腰部高度',
          keyPoints: [
            '🏓 擊球點必須低於腰部',
            '📐 球拍面由下往上揮動',
            '⬆️ 擊球時手臂向上延伸',
            '🎯 球必須越過廚房線落在對角區',
            '⚠️ 手腕不能高於肘部（規則限制）',
          ],
          source: 'USA Pickleball Official Rulebook 2024, Section 4.A.5-7',
        },
        {
          name: '跟進動作',
          description: '球拍順勢向前上方跟進，保持身體平衡',
          keyPoints: [
            '↗️ 球拍自然向目標方向延伸',
            '🏃 重心隨擊球動作向前移動',
            '⚖️ 保持身體平衡，準備下一步移動',
            '👀 眼睛追蹤球的飛行軌跡',
          ],
          source: 'USA Pickleball Official Rulebook 2024, Section 4.L',
        },
      ],
    },
    {
      id: 'volley',
      name: '截擊技術',
      icon: '⚡',
      steps: [
        {
          name: '準備站位',
          description: '站在非截擊區外，雙腳微彎保持警覺',
          keyPoints: [
            '📍 必須站在廚房區外',
            '⚖️ 重心略微下降，雙腳與肩同寬',
            '🏓 球拍舉至胸前高度',
            '👀 注視對方與來球',
          ],
          source: 'USA Pickleball Official Rulebook 2024, Section 9',
        },
        {
          name: '預判來球',
          description: '觀察對方動作，預判球的方向和速度',
          keyPoints: [
            '👁️ 觀察對方擊球動作',
            '🧠 預判球的落點和速度',
            '🦶 調整步伐準備移動',
            '⚡ 保持反應準備狀態',
          ],
          source: 'USA Pickleball Official Rulebook 2024, Section 7',
        },
        {
          name: '快速反應',
          description: '短促有力的擊球動作，在空中截擊來球',
          keyPoints: [
            '⚡ 動作要快速簡潔',
            '💪 使用前臂和手腕發力',
            '🎯 控制球的方向和力道',
            '❌ 確保雙腳未觸碰廚房區',
          ],
          source: 'USA Pickleball Official Rulebook 2024, Section 9.B',
        },
        {
          name: '回位準備',
          description: '擊球後立即調整位置，準備下一球',
          keyPoints: [
            '🏃 快速回到準備位置',
            '⚖️ 保持平衡和警覺',
            '👀 注視對方和球的動向',
            '🎯 維持在最佳防守位置',
          ],
          source: 'USA Pickleball Official Rulebook 2024, Section 9',
        },
      ],
    },
  ];

  const currentTechnique = techniques.find(t => t.id === selectedTechnique) || techniques[0];

  const nextStep = () => {
    if (currentStep < currentTechnique.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const playAnimation = () => {
    setIsPlaying(true);
    setCurrentStep(0);

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= currentTechnique.steps.length - 1) {
          setIsPlaying(false);
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl p-4 md:p-8">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-sport-600 to-court-600">
          3D 技術動作教學
        </h2>
        <p className="text-center text-gray-600 mb-8">
          360 度觀看動作分解 • 拖動旋轉視角
        </p>

        {/* 技術選擇 */}
        <div className="flex justify-center space-x-4 mb-6">
          {techniques.map((tech) => (
            <button
              key={tech.id}
              onClick={() => {
                setSelectedTechnique(tech.id);
                setCurrentStep(0);
                setIsPlaying(false);
              }}
              className={`
                px-6 py-3 rounded-full font-bold transition-all duration-300 flex items-center space-x-2
                ${selectedTechnique === tech.id
                  ? 'bg-gradient-to-r from-sport-500 to-court-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <span className="text-xl">{tech.icon}</span>
              <span>{tech.name}</span>
            </button>
          ))}
        </div>

        {/* 3D 視圖 */}
        <div className="relative w-full h-[500px] bg-gradient-to-b from-sport-50 to-court-50 rounded-2xl overflow-hidden mb-6">
          <Canvas shadows>
            <Scene technique={selectedTechnique} step={currentStep} />
          </Canvas>

          {/* 提示文字 */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg">
            <p className="text-sm font-semibold text-gray-700 flex items-center">
              <span className="mr-2">🖱️</span>
              拖動旋轉 • 滾輪縮放
            </p>
          </div>
        </div>

        {/* 步驟說明與關鍵點 */}
        <div className="bg-gradient-to-br from-pickleball-50 to-sport-50 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-gray-800">
              步驟 {currentStep + 1}: {currentTechnique.steps[currentStep].name}
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 font-semibold">
                {currentStep + 1} / {currentTechnique.steps.length}
              </span>
            </div>
          </div>
          <p className="text-gray-700 text-base mb-4">
            {currentTechnique.steps[currentStep].description}
          </p>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <p className="text-sm font-semibold text-gray-600 mb-3">🔑 關鍵要點：</p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {currentTechnique.steps[currentStep].keyPoints.map((point: string, index: number) => (
                <li key={index} className="flex items-start text-sm text-gray-700 bg-white rounded-lg p-3 shadow-sm">
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            {currentTechnique.steps[currentStep].source && (
              <p className="text-xs text-gray-400 mt-4 italic">
                資料來源：{currentTechnique.steps[currentStep].source}
              </p>
            )}
          </div>
        </div>

        {/* 控制按鈕 */}
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={prevStep}
            disabled={currentStep === 0 || isPlaying}
            className={`
              px-6 py-3 rounded-full font-bold transition-all duration-300 flex items-center space-x-2
              ${currentStep === 0 || isPlaying
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700'
              }
            `}
          >
            <span>← 上一步</span>
          </button>

          <button
            onClick={playAnimation}
            disabled={isPlaying}
            className={`
              px-8 py-3 rounded-full font-bold transition-all duration-300 flex items-center space-x-2
              ${isPlaying
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-pickleball-500 to-sport-500 hover:shadow-lg hover:scale-105'
              } text-white
            `}
          >
            <span>{isPlaying ? '播放中...' : '自動播放'}</span>
            {!isPlaying && <span>▶️</span>}
          </button>

          <button
            onClick={nextStep}
            disabled={currentStep === currentTechnique.steps.length - 1 || isPlaying}
            className={`
              px-6 py-3 rounded-full font-bold transition-all duration-300 flex items-center space-x-2
              ${currentStep === currentTechnique.steps.length - 1 || isPlaying
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700'
              }
            `}
          >
            <span>下一步 →</span>
          </button>
        </div>

        {/* 步驟指示器 */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
          {currentTechnique.steps.map((step, index) => (
            <motion.div
              key={index}
              onClick={() => !isPlaying && setCurrentStep(index)}
              whileHover={!isPlaying ? { scale: 1.05 } : {}}
              className={`
                p-4 rounded-xl text-center transition-all duration-300 cursor-pointer
                ${index === currentStep
                  ? 'bg-gradient-to-br from-sport-500 to-court-500 text-white shadow-lg'
                  : index < currentStep
                  ? 'bg-court-200 text-gray-700'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }
              `}
            >
              <div className="font-bold text-sm mb-1">{index + 1}</div>
              <div className="text-xs">{step.name}</div>
            </motion.div>
          ))}
        </div>

        {/* 重要規則提醒 */}
        {selectedTechnique === 'serve' && (
          <div className="mt-8 bg-gradient-to-r from-pickleball-50 to-sport-50 rounded-2xl p-6 border-2 border-pickleball-200">
            <div className="flex items-start space-x-3">
              <span className="text-3xl">⚠️</span>
              <div>
                <h4 className="font-bold text-gray-800 mb-3 text-lg">下手發球規則（Underhand Serve）</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p className="flex items-start">
                    <span className="mr-2">🏓</span>
                    <span><strong>擊球點位置：</strong>擊球時，球必須在腰部以下。腰部定義為肚臍的位置。</span>
                  </p>
                  <p className="flex items-start">
                    <span className="mr-2">📐</span>
                    <span><strong>球拍角度：</strong>擊球時，球拍頭部（拍面頂端）不能高於手腕。球拍面必須由下往上揮動。</span>
                  </p>
                  <p className="flex items-start">
                    <span className="mr-2">⚖️</span>
                    <span><strong>手腕位置：</strong>擊球瞬間，持拍手的手腕不能高於肘部。</span>
                  </p>
                  <p className="flex items-start">
                    <span className="mr-2">🦶</span>
                    <span><strong>腳部位置：</strong>發球時至少一隻腳必須在底線後方，不能踩踏或越過底線。</span>
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-4 italic">
                  USA Pickleball Official Rulebook 2024, Section 4.A.5-7
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 截擊規則提醒 */}
        {selectedTechnique === 'volley' && (
          <div className="mt-8 bg-gradient-to-r from-sport-50 to-court-50 rounded-2xl p-6 border-2 border-sport-200">
            <div className="flex items-start space-x-3">
              <span className="text-3xl">🚫</span>
              <div>
                <h4 className="font-bold text-gray-800 mb-3 text-lg">非截擊區規則（Kitchen Rules）</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p className="flex items-start">
                    <span className="mr-2">❌</span>
                    <span><strong>禁止截擊：</strong>不能站在廚房區（非截擊區）內進行截擊（volley）。</span>
                  </p>
                  <p className="flex items-start">
                    <span className="mr-2">🦶</span>
                    <span><strong>腳部限制：</strong>雙腳都不能觸碰廚房區線或進入廚房區。壓線也算犯規。</span>
                  </p>
                  <p className="flex items-start">
                    <span className="mr-2">🏃</span>
                    <span><strong>慣性動作：</strong>截擊後的慣性動作如果讓你踏入廚房區也算犯規。</span>
                  </p>
                  <p className="flex items-start">
                    <span className="mr-2">✅</span>
                    <span><strong>允許擊球：</strong>球彈地後可以進入廚房區擊球，但必須重新建立站位（雙腳觸地於區外）才能再次截擊。</span>
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-4 italic">
                  USA Pickleball Official Rulebook 2024, Section 9
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechniqueViewer3D;
