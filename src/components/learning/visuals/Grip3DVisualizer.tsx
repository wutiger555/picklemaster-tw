import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

interface Grip3DProps {
    gripType: 'eastern' | 'western' | 'continental';
}

const GripTape = () => {
    const curve = useMemo(() => {
        const points = [];
        const turns = 14; // More turns for tighter wrap
        const height = 4.1; // Slightly longer to cover ends
        const radius = 0.78; // Path radius

        for (let i = 0; i <= 120; i++) {
            const t = i / 120;
            const angle = t * Math.PI * 2 * turns;
            const y = (t - 0.5) * height;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            points.push(new THREE.Vector3(x, y, z));
        }
        return new THREE.CatmullRomCurve3(points);
    }, []);

    return (
        <mesh>
            {/* Tube radius 0.12, Path radius 0.78 -> Inner surface ~0.66 */}
            <tubeGeometry args={[curve, 300, 0.12, 8, false]} />
            <meshStandardMaterial
                color="#f3f4f6"
                roughness={0.9}
                bumpScale={0.02}
            />
        </mesh>
    );
};

const Handle = ({ gripType }: { gripType: string }) => {
    const groupRef = useRef<THREE.Group>(null);

    // Auto-rotate to show the handle
    useFrame((state) => {
        if (groupRef.current) {
            // Gentle floating animation
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
        }
    });

    return (
        <group ref={groupRef} rotation={[0, 0, 0]}>

            {/* Base Handle (Octagonal Core) - Vertical (Y-axis) */}
            <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.65, 0.65, 4, 8]} />
                <meshStandardMaterial color="#111827" />
            </mesh>

            {/* Spiral Grip Tape - Already Y-axis aligned */}
            <group rotation={[0, 0, 0]}>
                <GripTape />
            </group>

            {/* Butt Cap (Bottom) - Vertical */}
            <mesh position={[0, -2.1, 0]}>
                <cylinderGeometry args={[0.9, 0.8, 0.3, 8]} />
                <meshStandardMaterial color="#111827" roughness={0.5} />
            </mesh>

            {/* Logo on Butt Cap - Facing Down (-Y) */}
            <mesh position={[0, -2.26, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.6, 32]} />
                <meshStandardMaterial color="#3b82f6" />
            </mesh>

            {/* Rubber Collar (Top) - Vertical */}
            <mesh position={[0, 2.1, 0]}>
                <cylinderGeometry args={[0.8, 0.85, 0.3, 32]} />
                <meshStandardMaterial color="#111827" roughness={0.4} />
            </mesh>

            {/* Highlight Strips for Bevels */}
            {/* Rotated around Y axis to point to correct bevel */}
            <group rotation={[0, -getRotationForGrip(gripType), 0]}>
                {/* The "V" Marker - Long on Y axis */}
                <mesh position={[0.95, 0, 0]}>
                    <boxGeometry args={[0.05, 3.5, 0.4]} />
                    <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.8} />
                </mesh>

                {/* Label for the V */}
                <Html position={[1.3, 0, 0]} center>
                    <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap shadow-lg border border-red-400">
                        V 字對準這裡
                    </div>
                </Html>
            </group>

            {/* Paddle Neck/Face hint */}
            <group position={[0, 2.5, 0]}>
                {/* Neck */}
                <mesh position={[0, 0.5, 0]}>
                    <boxGeometry args={[1.2, 1.5, 0.2]} />
                    <meshStandardMaterial color="#1f2937" />
                </mesh>
                {/* Face start */}
                <mesh position={[0, 2, 0]}>
                    <boxGeometry args={[3, 2, 0.15]} />
                    <meshStandardMaterial color="#374151" />
                </mesh>
            </group>
        </group>
    );
};

const getRotationForGrip = (type: string) => {
    // Angles to place the marker at the correct position (Right side of screen is 0)
    // We assume the camera looks down the handle or from side.
    // Let's align so:
    // Eastern (Bevel 3, Right side): 0 radians.
    // Continental (Bevel 2, Top-Right): 45 deg = PI/4.
    // Western (Bevel 5, Bottom): -90 deg = -PI/2.

    switch (type) {
        case 'eastern': return 0;
        case 'continental': return Math.PI / 4;
        case 'western': return -Math.PI / 2;
        default: return 0;
    }
};

export default function Grip3DVisualizer({ gripType }: Grip3DProps) {
    return (
        <div className="w-full h-[400px] bg-gray-100 rounded-xl overflow-hidden relative border border-gray-200">
            <div className="absolute top-4 left-4 z-10 text-gray-500 text-sm font-medium bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm">
                <p>🎥 拖曳旋轉查看</p>
            </div>
            <Canvas camera={{ position: [0, 0, 7], fov: 40 }}>
                <ambientLight intensity={0.8} />
                <pointLight position={[10, 10, 10]} intensity={1.2} />
                <pointLight position={[-10, 5, 10]} intensity={0.8} />
                <pointLight position={[0, -10, 5]} intensity={0.5} />
                <Handle gripType={gripType} />
                <OrbitControls enableZoom={false} />
            </Canvas>
        </div>
    );
}
