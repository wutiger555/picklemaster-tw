import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Grip3DVisualizer from '../learning/visuals/Grip3DVisualizer';

interface GripStyle {
  id: 'eastern' | 'western' | 'continental';
  name: string;
  nameEn: string;
  description: string;
  proTip: string;
}

const GripVisualization = () => {
  const [selectedGrip, setSelectedGrip] = useState<'eastern' | 'western' | 'continental'>('eastern');

  const gripStyles: GripStyle[] = [
    {
      id: 'eastern',
      name: '東方式握法',
      nameEn: 'Eastern Grip',
      description: '最適合新手的萬用握法，像跟球拍握手一樣自然。',
      proTip: '將手掌平貼在拍面上，然後滑下來握住握把，這就是最標準的東方式。',
    },
    {
      id: 'continental',
      name: '大陸式握法',
      nameEn: 'Continental Grip',
      description: '適合發球、截擊和高壓扣殺，手掌主要接觸握把上方。',
      proTip: '想像你要用球拍側面去釘釘子（像拿鐵鎚一樣），這就是大陸式。',
    },
    {
      id: 'western',
      name: '西方式握法',
      nameEn: 'Western Grip',
      description: '適合打出強烈上旋球，手掌位置在握把下方。',
      proTip: '想像你要從地上撿起球拍，手掌完全在握把下方，這就是西方式。',
    },
  ];

  const currentGrip = gripStyles.find((g) => g.id === selectedGrip)!;

  return (
    <div className="w-full">
      {/* Grip Selector Tabs */}
      <div className="flex border-b border-gray-100 mb-6">
        {gripStyles.map((grip) => (
          <button
            key={grip.id}
            onClick={() => setSelectedGrip(grip.id)}
            className={`flex-1 py-3 text-sm font-bold transition-colors relative ${selectedGrip === grip.id
                ? 'text-blue-600'
                : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            {grip.name}
            {selectedGrip === grip.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
              />
            )}
          </button>
        ))}
      </div>

      <div>
        {/* 3D Visualizer */}
        <div className="mb-6">
          <Grip3DVisualizer gripType={selectedGrip} />
        </div>

        {/* Description & Tip */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedGrip}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-4">
              <h4 className="text-xl font-black text-gray-900 mb-1">
                {currentGrip.name} <span className="text-sm font-normal text-gray-500">({currentGrip.nameEn})</span>
              </h4>
              <p className="text-gray-600">{currentGrip.description}</p>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
              <p className="text-sm text-yellow-800">
                <strong>💡 記憶訣竅：</strong> {currentGrip.proTip}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GripVisualization;
