export interface Env {
  DB: D1Database;
  /** 簽發球友 token 與雜湊 IP 用的密鑰（wrangler secret） */
  TOKEN_SECRET: string;
  /** Turnstile 伺服器端密鑰（wrangler secret） */
  TURNSTILE_SECRET?: string;
  /** enforce：一定驗證（缺密鑰直接拒絕）；off：只給本機與測試用 */
  TURNSTILE_MODE: 'enforce' | 'off';
  /** 主站網址，分享頁轉址用 */
  SITE_ORIGIN: string;
  /** 允許呼叫 API 的來源，逗號分隔 */
  ALLOWED_ORIGINS: string;
}

export type AppEnv = { Bindings: Env; Variables: { playerId: string | null } };
