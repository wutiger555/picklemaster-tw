// 球場名稱轉 URL slug
// 例如「臺北市網球中心匹克球場」→ court-52 (用 id) 或拼音 slug

export const courtSlug = (id: number | string): string => `court-${id}`;

export const parseCourtSlug = (slug: string): number | null => {
  const match = slug.match(/^court-(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
};
