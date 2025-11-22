import { useState } from 'react';
import { motion } from 'framer-motion';

type ShotType = 'dink' | 'drive' | 'lob';

export default function TrajectoryVisualizer() {
    const [activeShot, setActiveShot] = useState<ShotType>('dink');

    const shots = {
        dink: {
            label: '丁克球 (Dink)',
            description: '輕輕將球打入對方的廚房區（非截擊區）。目的是迫使對方向上擊球，製造進攻機會。',
            path: "M 50,250 Q 200,100 350,280", // High arc, lands short
            color: "#10b981", // Emerald
            target: "廚房區內",
            height: "低 (剛好過網)",
        },
        drive: {
            label: '抽球 (Drive)',
            description: '從底線用力平擊球，球速快、弧度低。目的是壓制對方，使其難以截擊。',
            path: "M 50,250 Q 400,150 750,250", // Flat arc, lands deep
            color: "#3b82f6", // Blue
            target: "底線深處",
            height: "中 (貼網飛行)",
        },
        lob: {
            label: '高吊球 (Lob)',
            description: '將球高高打向對方後場。目的是迫使對方後退，奪回網前位置。',
            path: "M 50,250 Q 400,-50 750,250", // Very high arc, lands deep
            color: "#8b5cf6", // Purple
            target: "底線深處",
            height: "高 (越過對手頭頂)",
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-neutral-200">
            <h3 className="text-xl font-bold mb-6 text-neutral-900">球路軌跡比較</h3>

            {/* Visualization Area */}
            <div className="relative w-full h-[300px] bg-neutral-50 rounded-lg border border-neutral-200 mb-6 overflow-hidden">
                {/* Net */}
                <div className="absolute left-1/2 bottom-0 w-1 h-20 bg-neutral-400 transform -translate-x-1/2"></div>
                <div className="absolute left-1/2 bottom-20 w-full h-[1px] border-t border-dashed border-neutral-300 transform -translate-x-1/2"></div>

                {/* Court Lines */}
                <div className="absolute bottom-0 w-full h-[1px] bg-neutral-300"></div>

                {/* Zones Labels */}
                <div className="absolute bottom-2 left-10 text-xs text-neutral-400">我方底線</div>
                <div className="absolute bottom-2 left-[35%] text-xs text-neutral-400">廚房區</div>
                <div className="absolute bottom-2 right-[35%] text-xs text-neutral-400">廚房區</div>
                <div className="absolute bottom-2 right-10 text-xs text-neutral-400">對方底線</div>

                {/* SVG Trajectory */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 300">
                    <motion.path
                        d={shots[activeShot].path}
                        fill="none"
                        stroke={shots[activeShot].color}
                        strokeWidth="4"
                        strokeDasharray="10 5"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
                    />
                    {/* Ball */}
                    <motion.circle
                        r="6"
                        fill="#fbbf24"
                        initial={{ offsetDistance: "0%" }}
                        animate={{ offsetDistance: "100%" }}
                        style={{ offsetPath: `path("${shots[activeShot].path}")` }}
                        transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
                    />
                </svg>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {(Object.keys(shots) as ShotType[]).map((type) => (
                    <button
                        key={type}
                        onClick={() => setActiveShot(type)}
                        className={`p-3 rounded-lg text-sm font-bold transition-all ${activeShot === type
                                ? 'bg-neutral-900 text-white shadow-md'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                            }`}
                    >
                        {shots[type].label}
                    </button>
                ))}
            </div>

            {/* Info Box */}
            <div className="bg-neutral-50 p-4 rounded-lg border-l-4" style={{ borderColor: shots[activeShot].color }}>
                <h4 className="font-bold text-neutral-900 mb-2">{shots[activeShot].label}</h4>
                <p className="text-neutral-600 text-sm mb-3">{shots[activeShot].description}</p>
                <div className="flex space-x-6 text-sm">
                    <div>
                        <span className="text-neutral-400 block text-xs">落點目標</span>
                        <span className="font-semibold text-neutral-800">{shots[activeShot].target}</span>
                    </div>
                    <div>
                        <span className="text-neutral-400 block text-xs">飛行高度</span>
                        <span className="font-semibold text-neutral-800">{shots[activeShot].height}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
