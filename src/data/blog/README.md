# Ultra Advisor 部落格文章規格書

## 目錄結構

```
src/data/blog/
├── README.md           # 本規格書
├── types.ts            # BlogArticle 介面定義
├── index.ts            # 匯出所有文章與輔助函數
└── articles/           # 文章資料夾
    ├── 01-mortgage-principal-vs-equal-payment.ts
    ├── 02-retirement-planning-basics.ts
    └── ...
```

## 新增文章步驟

### 1. 建立文章檔案

在 `articles/` 資料夾建立新檔案，檔名格式：`{序號}-{slug}.ts`

```typescript
// 範例：articles/17-new-article-topic.ts
import { BlogArticle } from '../types';

export const article: BlogArticle = {
  id: '17',
  slug: 'new-article-topic',
  title: '文章標題【2026 最新】',
  excerpt: '文章摘要，約 50-80 字...',
  category: 'mortgage',  // 見下方分類說明
  tags: ['標籤1', '標籤2', '標籤3'],
  readTime: 8,  // 預估閱讀分鐘數
  publishDate: '2026-01-20',
  author: 'Ultra Advisor 理財團隊',
  featured: false,  // 是否為精選文章
  metaTitle: 'SEO 標題 | Ultra Advisor',
  metaDescription: 'SEO 描述，約 120-160 字...',
  content: `
    <article class="prose prose-invert max-w-none">
      <!-- 文章內容 -->
    </article>
  `
};
```

### 2. 註冊到 index.ts

```typescript
// 在 index.ts 新增 import
import { article as article17 } from './articles/17-new-article-topic';

// 在 blogArticles 陣列加入
export const blogArticles: BlogArticle[] = [
  // ... 現有文章
  article17,
];
```

### 3. 更新 sitemap.xml

在 `public/sitemap.xml` 新增：

```xml
<url>
  <loc>https://ultra-advisor.tw/blog/new-article-topic</loc>
  <lastmod>2026-01-20</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>  <!-- 精選文章用 0.85 -->
</url>
```

---

## 文章分類 (category)

| ID | 名稱 | 說明 |
|---|---|---|
| `mortgage` | 房貸知識 | 房貸計算、還款方式、銀行利率 |
| `retirement` | 退休規劃 | 退休金計算、退休準備 |
| `tax` | 稅務規劃 | 遺產稅、贈與稅、報稅技巧 |
| `investment` | 投資理財 | 複利、資產配置 |
| `sales` | 銷售技巧 | 話術、客戶開發、成交技巧 |

---

## SEO 規範

### 標題 (title)
- 長度：25-35 字
- 格式：`主題關鍵字：副標題【2026 最新/完整指南】`
- 範例：`本金均攤 vs 本息均攤：房貸還款方式完整比較【2026 最新】`

### SEO 標題 (metaTitle)
- 長度：50-60 字元
- 格式：`主要關鍵字 | 次要關鍵字 | Ultra Advisor`
- 範例：`本金均攤 vs 本息均攤完整比較 | 房貸還款方式怎麼選？【2026】`

### SEO 描述 (metaDescription)
- 長度：120-160 字元
- 包含主要關鍵字 1-2 次
- 包含行動呼籲 (CTA)
- 範例：`詳細比較本金均攤與本息均攤的利息差異、月付金變化、適合對象。附實際案例計算，幫助您選擇最省息的房貸還款方式。`

### 摘要 (excerpt)
- 長度：50-80 字
- 用於文章列表卡片顯示
- 清楚說明文章價值

### 標籤 (tags)
- 數量：4-8 個
- 包含主要關鍵字、長尾關鍵字、相關詞彙
- 範例：`['房貸', '本金均攤', '本息均攤', '還款方式', '房貸利率', '房貸計算']`

---

## 文章內容結構

### 推薦的 HTML 結構

```html
<article class="prose prose-invert max-w-none">
  <!-- 引言：說明文章價值 -->
  <p class="lead text-xl text-slate-300 mb-8">
    引言內容，約 80-120 字...
  </p>

  <!-- 目錄對應的標題使用 id -->
  <h2 id="section-1">一、第一段標題</h2>
  <p>內容...</p>

  <h3>小標題</h3>
  <p>內容...</p>
  <ul>
    <li>重點 1</li>
    <li>重點 2</li>
  </ul>

  <!-- 重點提示框 -->
  <div class="bg-blue-900/30 border border-blue-500/30 rounded-2xl p-6 my-8">
    <h4 class="text-blue-400 font-bold mb-3">💡 快速理解</h4>
    <p class="text-slate-300 mb-0">
      重點摘要內容...
    </p>
  </div>

  <h2 id="section-2">二、第二段標題</h2>
  <!-- 比較表格 -->
  <table>
    <thead>
      <tr>
        <th>比較項目</th>
        <th>選項 A</th>
        <th>選項 B</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>項目名稱</td>
        <td>內容</td>
        <td>內容</td>
      </tr>
    </tbody>
  </table>

  <!-- 數據重點框（綠色） -->
  <div class="bg-green-900/30 border border-green-500/30 rounded-2xl p-6 my-8">
    <h4 class="text-green-400 font-bold mb-3">💰 重要數據</h4>
    <p class="text-slate-300 mb-0">
      數據內容...
    </p>
  </div>

  <!-- 工具導流 CTA -->
  <div class="bg-blue-900/30 border border-blue-500/30 rounded-2xl p-6 my-8">
    <h4 class="text-blue-400 font-bold mb-3">🛠️ 免費試算工具</h4>
    <p class="text-slate-300 mb-4">
      工具說明...
    </p>
    <a href="/calculator" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-colors">
      免費使用計算機 →
    </a>
  </div>

  <!-- 結語 -->
  <h2 id="conclusion">結語</h2>
  <p>總結內容...</p>

  <!-- 更新日期與免責聲明 -->
  <p class="text-slate-500 text-sm mt-12">
    最後更新：2026 年 1 月 XX 日<br/>
    本文為知識分享，實際情況請以官方公告為準。
  </p>
</article>
```

### 提示框樣式

| 類型 | 背景色 | 文字色 | 用途 |
|---|---|---|---|
| 藍色 | `bg-blue-900/30` | `text-blue-400` | 知識重點、快速理解 |
| 綠色 | `bg-green-900/30` | `text-green-400` | 數據、省錢金額 |
| 黃色 | `bg-yellow-900/30` | `text-yellow-400` | 注意事項、警告 |
| 紫色 | `bg-purple-900/30` | `text-purple-400` | 專業技巧、進階內容 |

---

## 文章類型範本

### 類型 A：比較型文章
適用：`A vs B 比較`、`哪個好？`

結構：
1. 引言
2. A 的定義與特點
3. B 的定義與特點
4. 比較表格
5. 實際案例試算
6. 適合對象分析
7. 選擇建議
8. 結語 + 工具導流

### 類型 B：指南型文章
適用：`完整指南`、`一次看懂`

結構：
1. 引言
2. 基本概念
3. 詳細步驟（分點說明）
4. 常見問題 FAQ
5. 專家建議
6. 結語 + 工具導流

### 類型 C：清單型文章
適用：`X 個方法`、`必知 X 件事`

結構：
1. 引言
2. 清單項目 1-X（每項含標題、說明、範例）
3. 重點整理表格
4. 結語 + 工具導流

### 類型 D：實務技巧型（針對顧問）
適用：`話術`、`成交技巧`、`客戶開發`

結構：
1. 引言（痛點共鳴）
2. 技巧/話術 1-X
3. 情境範例對話
4. 常見異議處理
5. 行動清單
6. 結語 + 工具導流

---

## 圖片規範

### 文章封面圖（未來擴充）
- 尺寸：1200 x 630 px（Open Graph 標準）
- 格式：WebP 或 PNG
- 檔名：`{slug}-cover.webp`
- 位置：`public/images/blog/`

### 內文圖片
- 最大寬度：800px
- 格式：WebP 優先
- 加上 `alt` 屬性
- 使用 lazy loading

---

## 精選文章 (featured)

精選文章會顯示在：
- 部落格首頁頂部輪播
- 文章列表優先顯示

設定條件：
- 內容品質高、資訊完整
- SEO 目標關鍵字排名潛力大
- 與工具有導流價值

目前精選文章建議維持 4-6 篇。

---

## 輔助函數

```typescript
import {
  blogArticles,           // 所有文章陣列
  getArticleBySlug,       // 依 slug 取得單篇文章
  getArticlesByCategory,  // 依分類篩選
  getFeaturedArticles,    // 取得精選文章
  searchArticles,         // 搜尋文章
  BlogArticle             // 類型定義
} from '../data/blog';
```

---

## 檢查清單

新增文章前請確認：

- [ ] slug 不與現有文章重複
- [ ] 標題包含主要關鍵字
- [ ] metaTitle 長度 50-60 字元
- [ ] metaDescription 長度 120-160 字元
- [ ] tags 包含 4-8 個相關標籤
- [ ] category 使用正確的分類 ID
- [ ] 內容包含至少一個工具導流 CTA
- [ ] 已加入 index.ts 的 import 和陣列
- [ ] 已更新 sitemap.xml

---

## 維護紀錄

| 日期 | 版本 | 更新內容 |
|---|---|---|
| 2026-01-19 | 1.0 | 建立規格書，文章架構重構完成 |
