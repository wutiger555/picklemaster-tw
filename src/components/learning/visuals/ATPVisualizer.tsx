import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ATPVisualizer() {
    const [isATP, setIsATP] = useState(false);

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-neutral-200">
            <h3 className="text-xl font-bold mb-4 text-neutral-900">繞柱球 (ATP) 示意圖</h3>

            <div className="relative w-full aspect-[1.5/1] bg-blue-50 rounded-lg border-2 border-blue-800 overflow-hidden mb-6">
                {/* Court Lines */}
                <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-white transform -translate-x-1/2"></div>
                <div className="absolute top-1/2 left-0 right-0 h-[4px] bg-neutral-400 z-10"></div> {/* Net */}

                {/* Net Post */}
                <div className="absolute top-1/2 left-[-10px] w-4 h-4 bg-black rounded-full z-20"></div>
                <div className="absolute top-1/2 right-[-10px] w-4 h-4 bg-black rounded-full z-20"></div>

                {/* Ball Path */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
                    <motion.path
                        d={isATP
                            ? "M 100,250 Q 5,150 100,50" // ATP Path: Curves outside left post
                            : "M 100,250 Q 100,150 100,50" // Normal Path: Straight over net
                        }
                        fill="none"
                        stroke={isATP ? "#ef4444" : "#10b981"}
                        strokeWidth="4"
                        strokeDasharray="8 4"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
                    />
                    {/* Ball */}
                    <motion.circle
                        r="6"
                        fill="#fbbf24"
                        initial={{ offsetDistance: "0%" }}
                        animate={{ offsetDistance: "100%" }}
                        style={{ offsetPath: `path("${isATP ? "M 100,250 Q 5,150 100,50" : "M 100,250 Q 100,150 100,50"}")` }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
                    />
                </svg>

                {/* Labels */}
                <div className="absolute bottom-2 left-2 text-xs text-gray-500">我方底線</div>
                <div className="absolute top-2 left-2 text-xs text-gray-500">對方底線</div>
            </div>

            <div className="flex justify-center space-x-4">
                <button
                    onClick={() => setIsATP(false)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${!isATP ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                >
                    一般回球 (過網)
                </button>
                <button
                    onClick={() => setIsATP(true)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${isATP ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                >
                    ATP 繞柱球 (繞網)
                </button>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-700">
                <p>
                    <strong>規則說明：</strong>
                    {isATP
                        ? " ATP (Around the Post) 是合法的！只要球成功繞過網柱並落在對方界內，即使球的高度低於網子頂端也是有效得分。"
                        : " 一般回球必須從網子「上方」越過。"}
                </p>
            </div>
        </div>
    );
}
