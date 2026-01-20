/**
 * 自動生成 sitemap.xml
 * 從 src/data/blog/articles/ 讀取所有文章並生成 sitemap
 *
 * 使用方式: node scripts/generate-sitemap.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://ultra-advisor.tw';
const TODAY = new Date().toISOString().split('T')[0];

// 靜態頁面配置
const staticPages = [
  { path: '/', priority: 1.0, changefreq: 'weekly' },
  { path: '/calculator', priority: 0.95, changefreq: 'weekly' },
  { path: '/blog', priority: 0.9, changefreq: 'weekly' },
  { path: '/register', priority: 0.8, changefreq: 'monthly' },
  { path: '/login', priority: 0.6, changefreq: 'monthly' },
];

async function generateSitemap() {
  const articlesDir = path.join(__dirname, '../src/data/blog/articles');

  // 讀取所有文章檔案
  const articleFiles = fs.readdirSync(articlesDir)
    .filter(f => f.endsWith('.ts') && !f.startsWith('_'));

  const articles = [];

  for (const file of articleFiles) {
    const content = fs.readFileSync(path.join(articlesDir, file), 'utf-8');

    // 解析 slug
    const slugMatch = content.match(/slug:\s*['"]([^'"]+)['"]/);
    // 解析 featured
    const featuredMatch = content.match(/featured:\s*(true|false)/);

    if (slugMatch) {
      articles.push({
        slug: slugMatch[1],
        featured: featuredMatch ? featuredMatch[1] === 'true' : false,
      });
    }
  }

  // 生成 XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  // 靜態頁面
  for (const page of staticPages) {
    xml += `  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>

`;
  }

  xml += `  <!-- ==================== 部落格文章 ==================== -->

`;

  // 文章頁面
  for (const article of articles) {
    const priority = article.featured ? 0.85 : 0.8;
    xml += `  <url>
    <loc>${SITE_URL}/blog/${article.slug}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>

`;
  }

  xml += `</urlset>
`;

  // 寫入檔案
  const outputPath = path.join(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(outputPath, xml, 'utf-8');

  console.log(`✅ Sitemap 已生成: ${outputPath}`);
  console.log(`   - 靜態頁面: ${staticPages.length}`);
  console.log(`   - 文章數量: ${articles.length}`);
}

generateSitemap().catch(console.error);
