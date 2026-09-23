import type { ContentfulStatusCode } from 'hono/utils/http-status';

// 錯誤訊息寫給球友看：說清楚哪裡不對、怎麼修
export class ApiError extends Error {
  constructor(
    public status: ContentfulStatusCode,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

export const bad = (code: string, message: string) => new ApiError(400, code, message);
export const unauthorized = () => new ApiError(401, 'unauthorized', '找不到你的球友身分，請重新整理後再試一次');
export const forbidden = (message = '只有團主可以做這件事') => new ApiError(403, 'forbidden', message);
export const notFound = (message = '找不到這一團，可能已經被刪除') => new ApiError(404, 'not_found', message);
export const conflict = (code: string, message: string) => new ApiError(409, code, message);
