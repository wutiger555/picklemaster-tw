
import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';

const Paddle = ({ angle }: { angle: number }) => {
    // Convert angle to radians (0 is vertical, positive is open face/up, negative is closed face/down)
    const rotationX = THREE.MathUtils.degToRad(-angle);

    return (
        <group rotation={[rotationX, 0, 0]}>
            {/* Paddle Face */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[2, 2.5, 0.1]} />
                <meshStandardMaterial color="#ef4444" />
            </mesh>
            {/* Handle */}
            <mesh position={[0, -1.75, 0]}>
                <cylinderGeometry args={[0.15, 0.15, 1.5]} />
                <meshStandardMaterial color="#1f2937" />
            </mesh>
        </group>
    );
};

const BallTrajectory = ({ angle }: { angle: number }) => {
    // Calculate trajectory vector based on angle
    // 0 degrees (vertical paddle) -> Horizontal launch (0 degrees)
    // 45 degrees (open paddle) -> 45 degrees launch
    const launchAngleRad = THREE.MathUtils.degToRad(angle);

    // Let's just draw a straight arrow for the "Launch Direction" first, maybe clearer for "Angle" concept
    // If paddle rotates back (open face), normal points up/back. 
    // Let's align coordinates: 
    // Paddle at origin. Camera looking at it from side.
    // +Y is Up. +Z is Right (Forward). +X is Out of screen.

    // Re-doing coordinate system for Side View
    // Paddle rotation: Rotate around X axis. 
    // 0 deg = Vertical. Normal points to +Z.
    // +45 deg = Open face. Normal points to +Z and +Y.

    const normalY = Math.sin(launchAngleRad);
    const normalZ = Math.cos(launchAngleRad);

    const linePoints = [
        new THREE.Vector3(0, 0, 0.1),
        new THREE.Vector3(0, normalY * 3, normalZ * 3 + 0.1)
    ];

    return (
        <group>
            <Line points={linePoints} color="yellow" lineWidth={3} />
            <mesh position={[0, normalY * 3, normalZ * 3 + 0.1]}>
                <sphereGeometry args={[0.1]} />
                <meshBasicMaterial color="yellow" />
            </mesh>
        </group>
    );
};

const Scene = ({ angle }: { angle: number }) => {
    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <Paddle angle={angle} />
            <BallTrajectory angle={angle} />
            <gridHelper args={[20, 20]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 5]} />
            <OrbitControls enableZoom={false} minPolarAngle={Math.PI / 2} maxPolarAngle={Math.PI / 2} />
        </>
    );
};

export default function PaddleAngleVisualizer() {
    const [angle, setAngle] = useState(0);

    return (
        <div className="flex flex-col items-center bg-neutral-900 rounded-xl p-6 text-white">
            <h3 className="text-xl font-bold mb-4">球拍角度與飛行軌跡</h3>
            <div className="w-full h-[300px] bg-neutral-800 rounded-lg mb-6 overflow-hidden relative">
                <div className="absolute top-4 left-4 z-10 bg-black/50 p-2 rounded text-sm">
                    <p>角度: {angle}°</p>
                    <p className="text-yellow-400">
                        {angle > 15 ? '高吊球 / 容易出界' : angle < -10 ? '殺球 / 掛網' : '平擊 / 抽球'}
                    </p>
                </div>
                <Canvas camera={{ position: [5, 0, 0], fov: 50 }}>
                    <Scene angle={angle} />
                </Canvas>
            </div>

            <div className="w-full max-w-md space-y-4">
                <div className="flex justify-between text-sm text-gray-400">
                    <span>關閉 (壓球)</span>
                    <span>垂直 (平擊)</span>
                    <span>開放 (高球)</span>
                </div>
                <input
                    type="range"
                    min="-45"
                    max="45"
                    value={angle}
                    onChange={(e) => setAngle(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
                <p className="text-sm text-gray-300 mt-2">
                    💡 <strong>新手常見問題：</strong> 球飛太高通常是因為球拍面太過「開放」（向上仰）。試著在擊球瞬間保持拍面垂直，就能打出強勁的平擊球。
                </p>
            </div>
        </div>
    );
}
