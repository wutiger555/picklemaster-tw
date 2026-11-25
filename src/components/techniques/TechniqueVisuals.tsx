import type { ReactNode } from 'react';
import StrokeDemo from './StrokeDemo';
import TrajectoryLab from './TrajectoryLab';
import ThirdShotPlay from './ThirdShotPlay';
import { FOREHAND_DRIVE } from './strokeConfig';

/** 技巧頁的動態示範：依技巧 slug 掛上 3D 動作、球路實驗室、戰術動畫 */

interface Visual {
  badge: string;
  title: string;
  desc: string;
  node: ReactNode;
}

const VISUALS: Record<string, Visual[]> = {
  'forehand-drive': [
    {
      badge: '3D MOTION',
      title: '3D 動作示範',
      desc: '慢動作拆解一次完整的正手抽球。切換視角看轉肩與重心轉移，拖時間軸停在任何一個瞬間。',
      node: <StrokeDemo cfg={FOREHAND_DRIVE} />,
    },
  ],
  'third-shot-drop': [
    {
      badge: 'BALL FLIGHT LAB',
      title: '球路實驗室',
      desc: '拖拉弧線最高點和落點，用真實球體物理看這一球會不會掛網、對手能不能攻擊、你有多少時間上網。',
      node: <TrajectoryLab />,
    },
    {
      badge: 'TACTICS',
      title: '戰術動畫：第三球怎麼扭轉開局',
      desc: '雙打從發球到四人都站上廚房線，一步一步看站位和球路。',
      node: <ThirdShotPlay />,
    },
  ],
};

const TechniqueVisuals = ({ slug }: { slug: string }) => {
  const list = VISUALS[slug];
  if (!list) return null;
  return (
    <>
      {list.map((v) => (
        <section key={v.title} className="bg-white rounded-2xl border border-neutral-100 p-5 md:p-8 mb-6 shadow-sm">
          <span className="inline-block text-[11px] font-bold tracking-[0.2em] uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full mb-3">{v.badge}</span>
          <h2 className="text-2xl font-bold text-neutral-900 mb-1.5">{v.title}</h2>
          <p className="text-neutral-600 leading-relaxed mb-5">{v.desc}</p>
          {v.node}
        </section>
      ))}
    </>
  );
};

export default TechniqueVisuals;
