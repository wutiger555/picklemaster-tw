import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CourtPositionVisualizer() {
    const [step, setStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const steps = [
        {
            title: "0. 準備發球 (Preparation)",
            description: "發球方 (綠) 在右發球區準備。接發球方 (藍) 位於對角線 (左發球區)。",
            positions: {
                server: { x: 75, y: 92 },
                partner: { x: 25, y: 92 },
                receiver: { x: 25, y: 8 },
                receiverPartner: { x: 75, y: 32 }
            },
            ball: { x: 75, y: 90 }
        },
        {
            title: "1. 發球 (The Serve)",
            description: "依照規則，球必須「對角」飛行，並落在對方發球區內（不能進廚房）。",
            positions: {
                server: { x: 75, y: 92 },
                partner: { x: 25, y: 92 },
                receiver: { x: 25, y: 8 },
                receiverPartner: { x: 75, y: 32 }
            },
            ball: { x: 25, y: 15 } // Lands in receiver's court
        },
        {
            title: "2. 接發球回擊 (Return)",
            description: "接發球方將球深打回底線，並迅速隨球上網 (Serve & Volley? No, Return & Volley)。",
            positions: {
                server: { x: 75, y: 92 },
                partner: { x: 25, y: 92 },
                receiver: { x: 25, y: 32 }, // Moving to NVZ
                receiverPartner: { x: 75, y: 32 }
            },
            ball: { x: 75, y: 90 } // Lands deep in server's court
        },
        {
            title: "3. 第三球過渡 (3rd Shot Drop)",
            description: "發球方擊出「第三球小球」，將球輕放進對方廚房，迫使對方無法殺球，爭取上網時間。",
            positions: {
                server: { x: 75, y: 55 }, // Approaches NVZ
                partner: { x: 25, y: 55 }, // Approaches NVZ
                receiver: { x: 25, y: 32 },
                receiverPartner: { x: 75, y: 32 }
            },
            ball: { x: 25, y: 36 } // Lands in kitchen
        },
        {
            title: "4. 四人網前對決 (Dinking)",
            description: "雙方皆站穩廚房線，展開耐心的網前小球 (Dink) 拉鋸戰。",
            positions: {
                server: { x: 75, y: 68 }, // At NVZ
                partner: { x: 25, y: 68 }, // At NVZ
                receiver: { x: 25, y: 32 },
                receiverPartner: { x: 75, y: 32 }
            },
            ball: { x: 75, y: 62 } // Ball in play near net
        }
    ];

    const togglePlay = () => {
        if (isPlaying) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsPlaying(false);
        } else {
            setIsPlaying(true);
        }
    };

    useEffect(() => {
        if (isPlaying) {
            timerRef.current = setInterval(() => {
                setStep((prev) => (prev + 1) % steps.length);
            }, 3000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isPlaying]);

    // Reset loop when manually changing steps
    const handleManualStepChange = (index: number) => {
        setStep(index);
        setIsPlaying(false);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const currentStep = steps[step];

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-neutral-100">
            {/* Header / Toolbar */}
            <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200 flex items-center justify-between flex-wrap gap-4">
                <h3 className="font-bold text-neutral-800 flex items-center gap-2 text-lg">
                    <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                    雙打戰術演示
                </h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleManualStepChange((step - 1 + steps.length) % steps.length)}
                        className="p-2 rounded-full hover:bg-neutral-200 text-neutral-600 transition-colors"
                        aria-label="Previous Step"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button
                        onClick={togglePlay}
                        className={`p-3 rounded-full font-bold transition-all shadow-md flex items-center justify-center w-12 h-12 ${isPlaying ? 'bg-amber-100 text-amber-600' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                        aria-label={isPlaying ? "Pause" : "Play"}
                    >
                        {isPlaying ? (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
                        ) : (
                            <svg className="w-6 h-6 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        )}
                    </button>
                    <button
                        onClick={() => handleManualStepChange((step + 1) % steps.length)}
                        className="p-2 rounded-full hover:bg-neutral-200 text-neutral-600 transition-colors"
                        aria-label="Next Step"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row">
                {/* Visualizer Area */}
                <div className="relative w-full lg:w-3/5 bg-slate-50 border-r border-neutral-100 p-8 min-h-[400px] flex items-center justify-center">
                    <div className="relative w-full max-w-sm aspect-[1/1.5] bg-[#3b82f6] rounded-lg shadow-2xl border-4 border-[#3b82f6] overflow-hidden select-none">
                        {/* Court Surface */}
                        <div className="absolute inset-0 bg-blue-500/20"></div>

                        {/* White Lines */}
                        <div className="absolute inset-0 border-[2px] border-white/90 m-1"></div> {/* Sidelines */}

                        {/* Kitchen (NVZ) - Exact 7ft marked at ~34% */}
                        <div className="absolute top-[34%] bottom-[34%] left-1 right-1 bg-amber-500/20 border-t-2 border-b-2 border-white/90"></div>

                        {/* Center Lines (Service Courts only) */}
                        {/* Top Center Line */}
                        <div className="absolute top-1 h-[34%] left-1/2 w-[2px] bg-white/90 transform -translate-x-1/2"></div>
                        {/* Bottom Center Line */}
                        <div className="absolute bottom-1 h-[34%] left-1/2 w-[2px] bg-white/90 transform -translate-x-1/2"></div>

                        {/* Net */}
                        <div className="absolute top-1/2 left-0 right-0 h-[4px] bg-white/40 backdrop-blur-sm z-10 transform -translate-y-1/2 shadow-sm flex items-center justify-center">
                            <div className="w-full h-[1px] bg-white/80"></div>
                        </div>

                        {/* Players */}
                        {/* Server Team (Green) */}
                        <motion.div
                            className="absolute z-20"
                            animate={{ left: `${currentStep.positions.server.x}%`, top: `${currentStep.positions.server.y}%` }}
                            transition={{ type: "spring", stiffness: 80, damping: 15 }}
                        >
                            <div className="w-5 h-5 md:w-6 md:h-6 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 rounded-full border-2 border-white shadow-lg relative ring-2 ring-emerald-500/30">
                                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-emerald-800 font-bold whitespace-nowrap bg-white/90 px-2 py-0.5 rounded-full shadow-sm">發球方</span>
                            </div>
                        </motion.div>
                        <motion.div
                            className="absolute z-20"
                            animate={{ left: `${currentStep.positions.partner.x}%`, top: `${currentStep.positions.partner.y}%` }}
                            transition={{ type: "spring", stiffness: 80, damping: 15 }}
                        >
                            <div className="w-5 h-5 md:w-6 md:h-6 -translate-x-1/2 -translate-y-1/2 bg-emerald-400 rounded-full border-2 border-white shadow-lg opacity-90" />
                        </motion.div>

                        {/* Receiver Team (Blue) */}
                        <motion.div
                            className="absolute z-20"
                            animate={{ left: `${currentStep.positions.receiver.x}%`, top: `${currentStep.positions.receiver.y}%` }}
                            transition={{ type: "spring", stiffness: 80, damping: 15 }}
                        >
                            <div className="w-5 h-5 md:w-6 md:h-6 -translate-x-1/2 -translate-y-1/2 bg-blue-500 rounded-full border-2 border-white shadow-lg relative ring-2 ring-blue-500/30">
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-blue-800 font-bold whitespace-nowrap bg-white/90 px-2 py-0.5 rounded-full shadow-sm">接發方</span>
                            </div>
                        </motion.div>
                        <motion.div
                            className="absolute z-20"
                            animate={{ left: `${currentStep.positions.receiverPartner.x}%`, top: `${currentStep.positions.receiverPartner.y}%` }}
                            transition={{ type: "spring", stiffness: 80, damping: 15 }}
                        >
                            <div className="w-5 h-5 md:w-6 md:h-6 -translate-x-1/2 -translate-y-1/2 bg-blue-400 rounded-full border-2 border-white shadow-lg opacity-90" />
                        </motion.div>

                        {/* Ball */}
                        <motion.div
                            className="absolute z-30 pointer-events-none"
                            animate={{ left: `${currentStep.ball.x}%`, top: `${currentStep.ball.y}%` }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                        >
                            <div className="w-3 h-3 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 rounded-full border border-yellow-500 shadow-md relative">
                                <div className="absolute inset-0 bg-white opacity-60 rounded-full transform scale-50 -translate-y-0.5"></div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Info Area */}
                <div className="w-full lg:w-2/5 p-6 flex flex-col bg-white">
                    <div className="flex-1 space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {steps.map((s, index) => (
                            <button
                                key={index}
                                onClick={() => handleManualStepChange(index)}
                                className={`w-full text-left p-4 rounded-xl transition-all duration-300 border ${index === step
                                    ? 'bg-gradient-to-r from-emerald-50 to-white border-emerald-200 shadow-md scale-[1.02] z-10'
                                    : 'bg-transparent border-transparent hover:bg-neutral-50 text-neutral-500'
                                    }`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className={`font-bold text-xs tracking-wider uppercase ${index === step ? 'text-emerald-600' : 'text-neutral-400'}`}>STEP {index}</span>
                                    {index === step && <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>}
                                </div>
                                <h4 className={`font-bold text-base mb-1 ${index === step ? 'text-neutral-900' : 'opacity-70'}`}>
                                    {s.title.split(')')[0] + ')'}
                                </h4>
                                <AnimatePresence>
                                    {index === step && (
                                        <motion.p
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="text-sm text-neutral-600 leading-relaxed overflow-hidden"
                                        >
                                            {s.description}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </button>
                        ))}
                    </div>

                    {/* Pro Tip Box */}
                    <div className="mt-4 bg-amber-50 rounded-xl p-4 border border-amber-100 flex items-start gap-3">
                        <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600 shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h5 className="font-bold text-amber-900 text-sm mb-0.5">教練觀點</h5>
                            <p className="text-xs text-amber-800/80 leading-relaxed">
                                這套戰術的核心在於<strong>「搶網」</strong>。接發球後迅速隨球上網，利用第三球小球安全過渡，是雙打致勝關鍵。
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
