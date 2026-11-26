/**
 * 用 esbuild 把 TS 腳本打包成一個 CommonJS 檔再跑（引擎是純 TS，沒有瀏覽器依賴）。
 * 用法：node scripts/game-reference/run.mjs <entry.ts> [args...]
 */
import { build } from 'esbuild';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const [entry, ...args] = process.argv.slice(2);
if (!entry) {
  console.error('用法：node scripts/game-reference/run.mjs <entry.ts> [args...]');
  process.exit(2);
}
const dir = mkdtempSync(join(tmpdir(), 'pm-sim-'));
const out = join(dir, 'bundle.cjs');
await build({
  entryPoints: [entry],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node20',
  outfile: out,
  logLevel: 'warning',
  define: { 'import.meta.env.BASE_URL': '"/"', 'import.meta.env.DEV': 'false' },
});
// 打包後 __dirname 會指到暫存夾，repo 根目錄用環境變數傳進去
const root = fileURLToPath(new URL('../..', import.meta.url));
const r = spawnSync(process.execPath, [out, ...args], { stdio: 'inherit', env: { ...process.env, PM_ROOT: root } });
process.exit(r.status ?? 1);
