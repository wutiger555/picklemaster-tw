import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function CourtPositionVisualizer() {
    const [step, setStep] = useState(0);

    const steps = [
        {
            title: "1. 發球與接發球",
            description: "發球方（綠色）在底線發球。接發球方（藍色）一人在底線準備接球，一人已在網前。",
            positions: {
                server: { x: 80, y: 90 },
                partner: { x: 20, y: 90 },
                receiver: { x: 80, y: 10 },
                receiverPartner: { x: 20, y: 30 } // At NVZ line
            },
            ball: { x: 80, y: 90 }
        },
        {
            title: "2. 接發球回擊",
            description: "接發球方將球深打回發球方底線，並隨球上網。",
            positions: {
                server: { x: 80, y: 90 }, // Stay back
                partner: { x: 20, y: 90 }, // Stay back
                receiver: { x: 80, y: 30 }, // Moving to NVZ
                receiverPartner: { x: 20, y: 30 } // At NVZ
            },
            ball: { x: 80, y: 85 } // Ball landing deep
        },
        {
            title: "3. 第三球 (關鍵時刻)",
            description: "發球方必須打出「第三球小球 (Drop Shot)」，將球輕輕放入對方廚房區。",
            positions: {
                server: { x: 80, y: 90 },
                partner: { x: 20, y: 90 },
                receiver: { x: 80, y: 30 }, // At NVZ
                receiverPartner: { x: 20, y: 30 } // At NVZ
            },
            ball: { x: 20, y: 35 } // Ball landing in kitchen
        },
        {
            title: "4. 隨球上網",
            description: "確認第三球成功進入廚房區後，發球方迅速移動到網前（過渡區）。",
            positions: {
                server: { x: 80, y: 30 }, // Moved to NVZ
                partner: { x: 20, y: 30 }, // Moved to NVZ
                receiver: { x: 80, y: 30 },
                receiverPartner: { x: 20, y: 30 }
            },
            ball: { x: 20, y: 35 }
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setStep((prev) => (prev + 1) % steps.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    const currentStep = steps[step];

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-neutral-200">
            <h3 className="text-xl font-bold mb-4 text-neutral-900">雙打戰術：第三球與上網</h3>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Court Visualization */}
                <div className="relative w-full md:w-1/2 aspect-[1/1.5] bg-blue-50 rounded-lg border-2 border-blue-800 overflow-hidden">
                    {/* Court Lines */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-white transform -translate-x-1/2"></div>
                    <div className="absolute top-[35%] left-0 right-0 h-[2px] bg-white"></div> {/* NVZ Top */}
                    <div className="absolute bottom-[35%] left-0 right-0 h-[2px] bg-white"></div> {/* NVZ Bottom */}
                    <div className="absolute top-1/2 left-0 right-0 h-[4px] bg-neutral-400/50 z-10"></div> {/* Net */}

                    {/* Kitchen Zones Color */}
                    <div className="absolute top-[35%] bottom-[35%] left-0 right-0 bg-orange-100/30"></div>

                    {/* Players */}
                    {/* Server Team (Green) */}
                    <motion.div
                        className="absolute w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-md z-20"
                        animate={{ left: `${currentStep.positions.server.x}%`, top: `${currentStep.positions.server.y}%` }}
                        transition={{ duration: 1 }}
                    />
                    <motion.div
                        className="absolute w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-md z-20"
                        animate={{ left: `${currentStep.positions.partner.x}%`, top: `${currentStep.positions.partner.y}%` }}
                        transition={{ duration: 1 }}
                    />

                    {/* Receiver Team (Blue) */}
                    <motion.div
                        className="absolute w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-md z-20"
                        animate={{ left: `${currentStep.positions.receiver.x}%`, top: `${currentStep.positions.receiver.y}%` }}
                        transition={{ duration: 1 }}
                    />
                    <motion.div
                        className="absolute w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-md z-20"
                        animate={{ left: `${currentStep.positions.receiverPartner.x}%`, top: `${currentStep.positions.receiverPartner.y}%` }}
                        transition={{ duration: 1 }}
                    />

                    {/* Ball */}
                    <motion.div
                        className="absolute w-3 h-3 bg-yellow-400 rounded-full border border-yellow-600 z-30"
                        animate={{ left: `${currentStep.ball.x}%`, top: `${currentStep.ball.y}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                {/* Step Info */}
                <div className="w-full md:w-1/2 flex flex-col justify-center">
                    <div className="space-y-4">
                        {steps.map((s, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-lg border-l-4 transition-all cursor-pointer ${index === step
                                        ? 'bg-blue-50 border-blue-500 shadow-sm'
                                        : 'bg-transparent border-transparent hover:bg-neutral-50'
                                    }`}
                                onClick={() => setStep(index)}
                            >
                                <h4 className={`font-bold mb-1 ${index === step ? 'text-blue-800' : 'text-neutral-500'}`}>
                                    {s.title}
                                </h4>
                                <p className={`text-sm ${index === step ? 'text-blue-700' : 'text-neutral-400'}`}>
                                    {s.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 p-4 bg-yellow-50 rounded-lg text-sm text-yellow-800">
                        💡 <strong>戰術重點：</strong> 為什麼要打第三球小球？因為如果直接用力抽球，對方已經在網前等著截擊，很容易被打死。把球輕輕放入廚房，迫使對方把球挑高，我們就有時間安全上網。
                    </div>
                </div>
            </div>
        </div>
    );
}
