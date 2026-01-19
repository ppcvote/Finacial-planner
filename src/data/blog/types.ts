/**
 * Ultra Advisor - 部落格文章類型定義
 *
 * 檔案位置：src/data/blog/types.ts
 */

export interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  readTime: number;
  publishDate: string;
  author: string;
  featured?: boolean;
  // SEO Meta
  metaTitle: string;
  metaDescription: string;
  // 完整文章內容（HTML 格式）
  content: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  icon: string; // icon name for dynamic import
}
