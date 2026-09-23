import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SEOHead from '../../components/common/SEOHead';
import PlayLobby from './PlayLobby';
import PlayGame from './PlayGame';
import PlayCreate from './PlayCreate';
import PlayMe from './PlayMe';

// 整個揪團功能只有 /play/ 一條路由（有預渲染、HTTP 200），用 query 切換畫面：
//   ?g=<id>  團頁（使用者建立、會過期的內容 → noindex，canonical 回 /play/）
//   ?new     開團
//   ?me      我的團（即將開打的團、球友名片、換手機、刪除資料）
// 分享到 LINE 的連結就是 /play/?g=<id>，LINE 預覽卡顯示 /play/ 的統一卡片（og/play.png）。
export default function Play() {
  const [params] = useSearchParams();
  const gameId = params.get('g');
  const view = params.has('new') ? 'new' : params.has('me') ? 'me' : gameId ? 'game' : 'lobby';

  useEffect(() => {
    if (view === 'lobby') return;
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, [view]);

  return (
    <>
      <SEOHead page="play" />
      {view === 'game' && gameId ? <PlayGame id={gameId} /> : view === 'new' ? <PlayCreate /> : view === 'me' ? <PlayMe /> : <PlayLobby />}
    </>
  );
}
