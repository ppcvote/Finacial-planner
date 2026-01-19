/**
 * Ultra Advisor - 部落格文章資料中心
 *
 * 新架構說明：
 * - 每篇文章獨立一個 .ts 檔案，放在 articles/ 資料夾
 * - 檔名格式：{id}-{slug}.ts
 * - 新增文章只需：1) 建立新檔案 2) 在此檔案 import 並加入陣列
 *
 * 檔案位置：src/data/blog/index.ts
 */

import { BlogArticle } from './types';

// ============ 匯入所有文章 ============
// 文章 1-11：原有文章
import { article as article01 } from './articles/01-mortgage-principal-vs-equal-payment';
import { article as article02 } from './articles/02-retirement-planning-basics';
import { article as article03 } from './articles/03-estate-tax-planning-2026';
import { article as article04 } from './articles/04-compound-interest-power';
import { article as article05 } from './articles/05-how-to-use-mortgage-calculator';
import { article as article06 } from './articles/06-gift-tax-annual-exemption';
import { article as article07 } from './articles/07-financial-advisor-data-visualization-sales';
import { article as article08 } from './articles/08-insurance-advisor-coverage-gap-analysis';
import { article as article09 } from './articles/09-wealth-manager-high-net-worth-clients';
import { article as article10 } from './articles/10-financial-advisor-digital-transformation-2026';
import { article as article11 } from './articles/11-financial-health-check-client-trust';
// 文章 12-16：新增文章
import { article as article12 } from './articles/12-bank-mortgage-rates-comparison-2026';
import { article as article13 } from './articles/13-financial-advisor-objection-handling-scripts';
import { article as article14 } from './articles/14-estate-tax-vs-gift-tax-comparison';
import { article as article15 } from './articles/15-tax-season-2026-advisor-tips';
import { article as article16 } from './articles/16-financial-advisor-income-survey-2026';
// 文章 17-21：2026 金融從業人員工具庫
import { article as article17 } from './articles/17-credit-card-installment-2026';
import { article as article18 } from './articles/18-labor-insurance-pension-2026';
import { article as article19 } from './articles/19-estate-gift-tax-quick-reference-2026';
import { article as article20 } from './articles/20-property-tax-self-use-residence-2026';
import { article as article21 } from './articles/21-bank-deposit-rates-comparison-2026';
// 文章 22-26：2026 金融從業人員工具庫（續）
import { article as article22 } from './articles/22-nhi-supplementary-premium-2026';
import { article as article23 } from './articles/23-savings-insurance-vs-deposit-2026';
import { article as article24 } from './articles/24-mortgage-refinance-cost-2026';
import { article as article25 } from './articles/25-income-tax-brackets-2026';
import { article as article26 } from './articles/26-high-dividend-etf-calendar-2026';

// ============ 匯出文章陣列 ============
export const blogArticles: BlogArticle[] = [
  article01,
  article02,
  article03,
  article04,
  article05,
  article06,
  article07,
  article08,
  article09,
  article10,
  article11,
  article12,
  article13,
  article14,
  article15,
  article16,
  article17,
  article18,
  article19,
  article20,
  article21,
  article22,
  article23,
  article24,
  article25,
  article26,
];

// ============ 匯出輔助函數 ============
export const getArticleBySlug = (slug: string): BlogArticle | undefined => {
  return blogArticles.find(article => article.slug === slug);
};

export const getArticlesByCategory = (category: string): BlogArticle[] => {
  if (category === 'all') return blogArticles;
  return blogArticles.filter(article => article.category === category);
};

export const getFeaturedArticles = (): BlogArticle[] => {
  return blogArticles.filter(article => article.featured);
};

export const searchArticles = (query: string): BlogArticle[] => {
  const lowerQuery = query.toLowerCase();
  return blogArticles.filter(article =>
    article.title.toLowerCase().includes(lowerQuery) ||
    article.excerpt.toLowerCase().includes(lowerQuery) ||
    article.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

// 重新匯出類型
export type { BlogArticle } from './types';
