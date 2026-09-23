const enc = new TextEncoder();

export function base64url(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64url(s: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]*$/.test(s)) return null;
  const pad = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4);
  try {
    return Uint8Array.from(atob(pad), (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

export function randomBytes(n: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(n));
}

// Crockford base32（小寫，去掉 i l o u），網址好讀也不易看錯
const B32 = '0123456789abcdefghjkmnpqrstvwxyz';
export function randomCode(len: number, alphabet = B32): string {
  const bytes = randomBytes(len);
  let out = '';
  for (let i = 0; i < len; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

export async function sha256hex(s: string): Promise<string> {
  const d = await crypto.subtle.digest('SHA-256', enc.encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

// 球友 token：v1.<playerId>.<HMAC>。沒有過期時間——身分就是這支手機，
// 要作廢就讓使用者刪除資料或轉移球友碼（轉移後舊裝置仍持有 token，這是刻意的：兩台都能用）。
export async function signToken(secret: string, playerId: string): Promise<string> {
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(`v1.${playerId}`));
  return `v1.${playerId}.${base64url(new Uint8Array(sig))}`;
}

export async function verifyToken(secret: string, token: string): Promise<string | null> {
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'v1' || !parts[1]) return null;
  const sig = fromBase64url(parts[2]);
  if (!sig) return null;
  // subtle.verify 是常數時間比對
  const ok = await crypto.subtle.verify('HMAC', await hmacKey(secret), sig, enc.encode(`v1.${parts[1]}`));
  return ok ? parts[1] : null;
}
