import type { ReactNode } from 'react';
import StrokeDemo from './StrokeDemo';
import TrajectoryLab from './TrajectoryLab';
import TacticsPlay from './TacticsPlay';
import GripExplorer from './GripExplorer';
import { BACKHAND_DRIVE, DINK, FOREHAND_DRIVE, RESET, SERVE, VOLLEY } from './strokeConfig';
import { ATP_PLAY, DINK_PLAY, ERNE_PLAY, RETURN_PLAY, STACKING_PLAY, THIRD_SHOT_PLAY } from './tactics';

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
      node: <TacticsPlay play={THIRD_SHOT_PLAY} />,
    },
  ],
  'continental-grip': [
    {
      badge: 'INTERACTIVE',
      title: '握拍對照器',
      desc: '切換三種握法，看虎口壓在拍柄哪一面，以及同一個握法打正手和反手時拍面會變成什麼角度。',
      node: <GripExplorer />,
    },
  ],
  dink: [
    {
      badge: '3D MOTION',
      title: '3D 動作示範',
      desc: '看 dink 怎麼「用腳不用手」：膝蓋彎低、引拍極小、拍面朝上把球舉過網。',
      node: <StrokeDemo cfg={DINK} />,
    },
    {
      badge: 'TACTICS',
      title: '路線比較：直線還是對角',
      desc: '同樣站在廚房線，直線和對角 dink 差在哪裡？球太高又會發生什麼事？',
      node: <TacticsPlay play={DINK_PLAY} />,
    },
  ],
  'backhand-drive': [
    {
      badge: '3D MOTION',
      title: '3D 動作示範',
      desc: '雙手反手抽球的完整動作：轉體側身、短引拍、由低往高掃擊。預設從背後看，可以切換視角。',
      node: <StrokeDemo cfg={BACKHAND_DRIVE} />,
    },
  ],
  serve: [
    {
      badge: '3D MOTION',
      title: '3D 動作示範',
      desc: '低手發球的合法動作：放球、鐘擺式引拍、腰部以下擊球、往前上方送。停在「腰下擊球」對照擊球點高度。',
      node: <StrokeDemo cfg={SERVE} />,
    },
  ],
  'return-of-serve': [
    {
      badge: 'TACTICS',
      title: '戰術動畫：接發球之後怎麼佔上風',
      desc: '從預備站位到兩人站上廚房線，最後一步看看接發球打太短會發生什麼事。',
      node: <TacticsPlay play={RETURN_PLAY} />,
    },
  ],
  volley: [
    {
      badge: '3D MOTION',
      title: '3D 動作示範',
      desc: '網前截擊幾乎不引拍：拍頭朝上、拍面提早對準，在身體前方短促一推。',
      node: <StrokeDemo cfg={VOLLEY} />,
    },
  ],
  reset: [
    {
      badge: '3D MOTION',
      title: '3D 動作示範',
      desc: '被困在場中間、對手重抽過來時，怎麼蹲低、放鬆握拍，把快球卸成落進廚房的軟球。',
      node: <StrokeDemo cfg={RESET} />,
    },
  ],
  erne: [
    {
      badge: 'TACTICS',
      title: '戰術動畫：Erne 怎麼繞過廚房',
      desc: '從看出訊號、繞到場外，到網柱旁截擊下壓，一步一步看走位。',
      node: <TacticsPlay play={ERNE_PLAY} />,
    },
  ],
  atp: [
    {
      badge: 'TACTICS',
      title: '戰術動畫：繞柱球的路線',
      desc: '球被打寬之後，怎麼跑到網柱外，讓球從網柱旁邊繞進對方場地。',
      node: <TacticsPlay play={ATP_PLAY} />,
    },
  ],
  stacking: [
    {
      badge: 'TACTICS',
      title: '戰術動畫：發球方與接發球方疊站',
      desc: '疊站讓你固定站在想要的半場。看發球方和接發球方各自怎麼站、什麼時候換位。',
      node: <TacticsPlay play={STACKING_PLAY} />,
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
