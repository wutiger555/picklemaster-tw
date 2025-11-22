import { useState } from 'react';
import { motion } from 'framer-motion';

type Scenario = 'nasty_nelson' | 'body_shot';

export default function RuleScenarioVisualizer() {
    const [scenario, setScenario] = useState<Scenario>('nasty_nelson');

    const scenarios = {
        nasty_nelson: {
            title: "發球打到人 (Nasty Nelson)",
            description: "發球時，如果球在落地前打到接發球方（或其搭檔）的身體或衣服...",
            result: "發球方得分！",
            explanation: "接發球方必須讓球先落地才能回擊。如果在落地前被球打到（即使站在界外），視為接球失誤。",
            animation: {
                server: { x: 20, y: 80 },
                receiver: { x: 80, y: 20 },
                receiverPartner: { x: 20, y: 30 }, // Standing near NVZ line
                ballPath: "M 20,80 L 20,30", // Hits partner
                hitPoint: { x: 20, y: 30 }
            }
        },
        body_shot: {
            title: "身體觸球 (Body Shot)",
            description: "比賽進行中，如果球打到對手的身體、衣服或帽子...",
            result: "擊球方得分！",
            explanation: "無論對手是站在界內還是界外，只要球觸碰到身體，都算對手失誤（未能用球拍回擊）。",
            animation: {
                server: { x: 50, y: 90 },
                receiver: { x: 90, y: 50 }, // Standing out of bounds
                receiverPartner: { x: 20, y: 20 },
                ballPath: "M 50,90 L 90,50", // Hits receiver out of bounds
                hitPoint: { x: 90, y: 50 }
            }
        }
    };

    const current = scenarios[scenario];

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-neutral-200">
            <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
                <button
                    onClick={() => setScenario('nasty_nelson')}
                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${scenario === 'nasty_nelson' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                >
                    發球打到人
                </button>
                <button
                    onClick={() => setScenario('body_shot')}
                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${scenario === 'body_shot' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                >
                    身體觸球
                </button>
            </div>

            <h3 className="text-xl font-bold mb-2 text-neutral-900">{current.title}</h3>

            {/* Visualization */}
            <div className="relative w-full aspect-[1.5/1] bg-green-50 rounded-lg border-2 border-green-800 overflow-hidden mb-6">
                {/* Court Lines */}
                <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-white transform -translate-x-1/2"></div>
                <div className="absolute top-1/2 left-0 right-0 h-[4px] bg-neutral-400/50"></div>

                {/* Players */}
                <div className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white" style={{ left: `${current.animation.server.x}%`, top: `${current.animation.server.y}%` }} />
                <div className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white" style={{ left: `${current.animation.receiver.x}%`, top: `${current.animation.receiver.y}%` }} />
                <div className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white" style={{ left: `${current.animation.receiverPartner.x}%`, top: `${current.animation.receiverPartner.y}%` }} />

                {/* Ball Path */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <motion.path
                        key={scenario}
                        d={current.animation.ballPath}
                        fill="none"
                        stroke="#fbbf24"
                        strokeWidth="3"
                        strokeDasharray="5 5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
                    />
                    {/* Hit Marker */}
                    <motion.circle
                        key={scenario + 'hit'}
                        cx={`${current.animation.hitPoint.x}%`}
                        cy={`${current.animation.hitPoint.y}%`}
                        r="10"
                        fill="none"
                        stroke="red"
                        strokeWidth="2"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1.5, opacity: [0, 1, 0] }}
                        transition={{ duration: 1, delay: 1, repeat: Infinity, repeatDelay: 1 }}
                    />
                </svg>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                <p className="text-gray-700 mb-2 text-sm">{current.description}</p>
                <p className="font-black text-lg text-purple-800 mb-2">{current.result}</p>
                <p className="text-sm text-gray-600">{current.explanation}</p>
            </div>
        </div>
    );
}
