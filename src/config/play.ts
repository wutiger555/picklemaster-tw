// 揪團約打（/play/）的外部設定。
//
// API 在 Cloudflare Worker（worker/），本機開發時用 `npm run dev --prefix worker` 起在 8787，
// 並在 .env.development.local 設 VITE_PLAY_API=http://localhost:8787。
// 不要寫在 .env.local：那份連 `npm run build` 都會讀，本機部署會把 localhost 打包進正式站。
export const PLAY_API: string = import.meta.env.VITE_PLAY_API || 'https://picklemaster-play.PENDING.workers.dev'; // Phase 0 部署後填入實際網址

// 分享到 LINE 的連結直接用主站網址。LINE 預覽卡顯示 /play/ 的統一卡片，
// 團名、時間、球場寫在分享訊息的文字裡。
export const shareUrlFor = (gameId: string) => `https://picklemastertw.com/play/?g=${encodeURIComponent(gameId)}`;

// Turnstile 無感驗證的 site key（公開值）。留空時不載入 Turnstile —— 只有本機開發會這樣，
// 正式環境的 Worker 設為 enforce，沒有驗證就不給寫入。
export const TURNSTILE_SITE_KEY: string = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';
