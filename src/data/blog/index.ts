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
// 文章 27：數位存款
import { article as article27 } from './articles/27-digital-deposit-vs-insurance-value-2026';
// 文章 28：以房養老
import { article as article28 } from './articles/28-reverse-mortgage-vs-professional-planning-2026';
// 文章 29：年後轉職
import { article as article29 } from './articles/29-career-change-finance-insurance-salary-2026';
// 文章 30：社群媒體經營
import { article as article30 } from './articles/30-social-media-marketing-financial-advisor-2026';
// 文章 31：財務顧問生存指南
import { article as article31 } from './articles/31-financial-advisor-survival-2026';
// 文章 32：心態
import { article as article32 } from './articles/32-mindset-financial-advisor-2026';
// 文章 33：筆記的重要性
import { article as article33 } from './articles/33-note-taking-financial-advisor-2026';
// 文章 34：現金流
import { article as article34 } from './articles/34-cash-flow-rich-poor-2026';
// 文章 35：ESBI 現金流象限
import { article as article35 } from './articles/35-esbi-cashflow-quadrant-2026';
// 文章 36：客戶拖延的代價
import { article as article36 } from './articles/36-client-procrastination-cost-2026';
// 文章 37：綜所稅＋最低稅負制
import { article as article37 } from './articles/37-income-tax-amt-guide-2026';
// 文章 38：安聯全球收益成長基金暫停申購
import { article as article38 } from './articles/38-allianz-global-income-growth-suspended-2026';
// 文章 39：勞保年金 vs 一次領
import { article as article39 } from './articles/39-labor-insurance-pension-lump-sum-vs-annuity-2026';
// 文章 40：新青安貸款
import { article as article40 } from './articles/40-new-youth-housing-loan-2026';
// 文章 41：勞退自提 6%
import { article as article41 } from './articles/41-labor-pension-voluntary-contribution-2026';
// 文章 42：定期定額 vs 單筆投入
import { article as article42 } from './articles/42-dca-vs-lump-sum-investment-2026';

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
  article27,
  article28,
  article29,
  article30,
  article31,
  article32,
  article33,
  article34,
  article35,
  article36,
  article37,
  article38,
  article39,
  article40,
  article41,
  article42,
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
