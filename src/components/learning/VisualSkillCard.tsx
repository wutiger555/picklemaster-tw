import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VisualSkillCardProps {
    title: string;
    problem: string;
    icon: string;
    color: string;
    description: string;
    proTip: string;
    children: React.ReactNode;
    className?: string;
}

export default function VisualSkillCard({
    title,
    problem,
    icon,
    color,
    description,
    proTip,
    children,
    className = ''
}: VisualSkillCardProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div
            layout
            className={`bg-white rounded-3xl overflow-hidden shadow-lg border-2 transition-colors duration-300 ${isOpen ? `border-${color}-500` : 'border-transparent hover:border-gray-200'
                } ${className}`}
        >
            <motion.div
                layout="position"
                className={`p-6 cursor-pointer ${isOpen ? `bg-${color}-50` : 'bg-white'}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-${color}-100 text-${color}-600`}>
                        {icon}
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${isOpen
                            ? `bg-${color}-500 text-white`
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {isOpen ? '收起教學' : '開始互動'}
                    </motion.button>
                </div>

                <h3 className="text-xl font-black text-gray-900 mb-1">{title}</h3>
                <p className={`text-sm font-medium mb-3 text-${color}-600`}>
                    🤔 {problem}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                    {description}
                </p>
            </motion.div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-gray-100"
                    >
                        <div className="p-6">
                            {/* Visualizer Container */}
                            <div className="mb-6 rounded-xl overflow-hidden shadow-inner bg-gray-50">
                                {children}
                            </div>

                            {/* Pro Tip */}
                            <div className={`bg-${color}-50 p-4 rounded-xl flex items-start space-x-3`}>
                                <span className="text-xl">💡</span>
                                <div>
                                    <h4 className={`font-bold text-${color}-900 text-sm mb-1`}>Pro Tip</h4>
                                    <p className={`text-${color}-800 text-sm`}>{proTip}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
