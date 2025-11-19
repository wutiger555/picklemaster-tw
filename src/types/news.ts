export type NewsCategory = 'Taiwan' | 'International' | 'Equipment' | 'Tournament' | 'Courts';

export interface NewsItem {
    id: string;
    title: string;
    summary: string;
    date: string;
    category: NewsCategory;
    image: string;
    source: string;
    link: string;
    content?: string; // 詳細內容 (HTML/Markdown)
    archived?: boolean; // 是否已歸檔
    tags?: string[]; // 標籤
}
