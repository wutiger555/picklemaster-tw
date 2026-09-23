import type { D1Migration } from 'cloudflare:test';
import type { Env as WorkerEnv } from '../src/env';

// 讓 cloudflare:workers 的 env 帶上 Worker 的綁定與測試用的 migration
declare global {
  namespace Cloudflare {
    interface Env extends WorkerEnv {
      TEST_MIGRATIONS: D1Migration[];
    }
  }
}
