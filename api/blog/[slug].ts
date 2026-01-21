import type { VercelRequest, VercelResponse } from '@vercel/node';

// 文章 metadata（從 functions/index.js 同步）
const articleMetadata: Record<string, { title: string; category: string; description: string }> = {
  'mortgage-principal-vs-equal-payment': { title: '房貸還款方式比較：本金均攤 vs 本息均攤', category: 'mortgage', description: '詳細比較本金均攤與本息均攤的利息差異、月付金變化、適合對象。' },
  'retirement-planning-basics': { title: '退休規劃入門：如何計算退休金缺口', category: 'retirement', description: '退休規劃基礎概念，計算勞保勞退給付、退休金缺口分析方法。' },
  'estate-tax-planning-2026': { title: '2026 遺產稅規劃全攻略', category: 'tax', description: '最新遺產稅免稅額、稅率級距、節稅策略完整解析。' },
  'compound-interest-power': { title: '複利的威力：讓時間成為你的朋友', category: 'investment', description: '深入淺出解釋複利效應，投資理財必懂的核心概念。' },
  'how-to-use-mortgage-calculator': { title: '如何使用房貸計算機做專業提案', category: 'tools', description: 'Ultra Advisor 房貸計算機完整教學，提升提案效率。' },
  'gift-tax-annual-exemption': { title: '贈與稅免稅額完整攻略', category: 'tax', description: '244 萬免稅額如何運用？分年贈與策略完整解析。' },
  'financial-advisor-data-visualization-sales': { title: '財務顧問數據視覺化銷售法', category: 'sales', description: '運用數據圖表提升說服力的進階銷售技巧。' },
  'insurance-advisor-coverage-gap-analysis': { title: '保險顧問保障缺口分析實戰', category: 'sales', description: '如何用數據發現客戶的保障缺口並提供解決方案。' },
  'wealth-manager-high-net-worth-clients': { title: '高資產客戶經營心法', category: 'sales', description: '如何服務高資產客戶，建立長期信任關係。' },
  'financial-advisor-digital-transformation-2026': { title: '2026 財務顧問數位轉型指南', category: 'tools', description: '數位工具提升效率，打造個人品牌的實戰策略。' },
  'financial-health-check-client-trust': { title: '財務健檢：建立客戶信任的第一步', category: 'sales', description: '透過財務健檢服務開發新客戶的完整流程。' },
  'bank-mortgage-rates-comparison-2026': { title: '2026 各銀行房貸利率比較表', category: 'mortgage', description: '公股銀行、民營銀行房貸利率完整比較，教你找到最低利率。' },
  'financial-advisor-objection-handling-scripts': { title: '財務顧問異議處理話術大全', category: 'sales', description: '常見客戶異議的專業回應方式。' },
  'estate-tax-vs-gift-tax-comparison': { title: '遺產稅 vs 贈與稅完整比較', category: 'tax', description: '搞懂遺產稅和贈與稅的差異，選擇最適合的傳承方式。' },
  'tax-season-2026-advisor-tips': { title: '2026 報稅季財務顧問必知重點', category: 'tax', description: '報稅季節的客戶服務重點與商機。' },
  'financial-advisor-income-survey-2026': { title: '2026 財務顧問薪資調查', category: 'tools', description: '台灣財務顧問市場薪資水平與發展趨勢分析。' },
  'credit-card-installment-2026': { title: '2026 信用卡分期利率試算', category: 'investment', description: '信用卡分期 12 期年化利率高達 14.8%，等於借年利率 14.8% 的錢。' },
  'labor-insurance-pension-2026': { title: '2026 勞保勞退給付速算', category: 'retirement', description: '勞保年金平均月領 1.9 萬、勞退月領約 2,400 元，合計替代率僅 40%。' },
  'estate-gift-tax-quick-reference-2026': { title: '2026 遺產稅贈與稅速查表', category: 'tax', description: '遺產稅免稅額 1,333 萬、贈與稅每年 244 萬免稅，超過部分 10%～20% 課稅。' },
  'property-tax-self-use-residence-2026': { title: '2026 房屋稅地價稅自用住宅條件', category: 'tax', description: '自用住宅優惠稅率：房屋稅 1%、地價稅 0.2%，需本人或配偶設籍。' },
  'bank-deposit-rates-comparison-2026': { title: '2026 各銀行定存利率比較', category: 'investment', description: '2026 年定存最高利率 2.15%，活存最高 2.6%，比較 15 家銀行利率。' },
  'nhi-supplementary-premium-2026': { title: '2026 二代健保補充保費完整攻略', category: 'tax', description: '股利超過 2 萬就要扣 2.11% 補充保費，年度上限 1000 萬。' },
  'savings-insurance-vs-deposit-2026': { title: '2026 儲蓄險 vs 定存比較', category: 'investment', description: '儲蓄險 IRR 約 2%～2.5%、定存約 1.5%～1.8%，但流動性差很多。' },
  'mortgage-refinance-cost-2026': { title: '2026 房貸轉貸成本試算', category: 'mortgage', description: '房貸轉貸成本約 2.5～3 萬元，利差要多少才划算？' },
  'income-tax-brackets-2026': { title: '2026 所得稅級距與扣除額速查表', category: 'tax', description: '2026 年報稅免稅額 10.1 萬、標準扣除額 13.6 萬、薪資扣除額 22.7 萬。' },
  'high-dividend-etf-calendar-2026': { title: '2026 台股高股息 ETF 配息月曆', category: 'investment', description: '0056、00878、00919 配息時間、殖利率、選股邏輯分析，教你月月領息。' },
  'digital-deposit-vs-insurance-value-2026': { title: '數位存款是什麼？銀行現金 vs 保單價值 vs 投資帳戶', category: 'investment', description: '同樣 100 萬，放銀行、放保單、放投資帳戶結果差很多！一篇搞懂數位存款概念。' },
  'reverse-mortgage-vs-professional-planning-2026': { title: '以房養老該去銀行辦嗎？專業規劃比直接貸款更重要', category: 'retirement', description: '以房養老直接去銀行辦？小心長壽風險讓你老後沒保障！找專業財務顧問規劃，搭配足額壽險才是正解。' },
  'career-change-finance-insurance-salary-2026': { title: '年後轉職潮來了！如何挑選行業？金融保險業薪資到底有多高？', category: 'sales', description: '2026 最新數據：金融保險業平均月薪 82,000 元穩居各行業之首！年後轉職該如何挑選行業？完整分析優缺點。' },
  'social-media-marketing-financial-advisor-2026': { title: '社群媒體經營對財務顧問有多重要？2026 最新數據告訴你', category: 'sales', description: '75% 高資產客戶透過社群認識顧問！2026 最新數據揭密：社群媒體經營已成為財務顧問必備技能，不做社群等於放棄一半客戶。' },
  'financial-advisor-survival-2026': { title: '2026 年財務顧問如何不被淘汰？持續學習 + 善用工具是關鍵', category: 'sales', description: '金融業變化越來越快，AI 工具崛起、客戶要求提高、市場競爭加劇。2026 年，財務顧問該怎麼做才能不被淘汰？' },
  'mindset-financial-advisor-2026': { title: '心態，決定你在這行能走多遠', category: 'sales', description: '技巧可以學，話術可以練，但心態不對，一切都是白搭。為什麼有人做三個月就陣亡，有人卻能做十年以上？' },
  'note-taking-financial-advisor-2026': { title: '為什麼頂尖顧問都在做筆記？', category: 'sales', description: '聽了很多課、看了很多書，但為什麼還是覺得沒進步？因為你只有「學」，沒有「習」。筆記，就是把學變成習的關鍵。' },
};

// 分類對應的 OG 圖片
const categoryOgImages: Record<string, string> = {
  mortgage: 'og-mortgage.png',
  retirement: 'og-retirement.png',
  tax: 'og-tax.png',
  investment: 'og-investment.png',
  tools: 'og-tools.png',
  sales: 'og-sales.png',
};

// 爬蟲 User-Agent 檢測（只檢測真正的爬蟲，不包含用戶瀏覽器）
// LINE 內建瀏覽器不是爬蟲，它的 UA 包含 "Line/" 但也包含 "Safari" 或 "Chrome"
const crawlerPatterns = [
  'facebookexternalhit',
  'Facebot',
  'LinkedInBot',
  'Twitterbot',
  'Slackbot-LinkExpanding',
  'WhatsApp/',  // WhatsApp 爬蟲（注意斜線，避免誤判）
  'TelegramBot',
  'Discordbot',
  'Pinterestbot',
  'Googlebot',
  'bingbot',
];

function isCrawler(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();

  // 如果包含真實瀏覽器引擎（Safari/Chrome/Firefox），而且不是已知爬蟲，就不是爬蟲
  const hasBrowserEngine = ua.includes('safari') || ua.includes('chrome') || ua.includes('firefox');
  const isKnownBot = crawlerPatterns.some(pattern => ua.includes(pattern.toLowerCase()));

  if (hasBrowserEngine && !isKnownBot) {
    return false; // 真實瀏覽器，不是爬蟲
  }

  return isKnownBot;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userAgent = req.headers['user-agent'] || '';
  const { slug } = req.query;
  const slugStr = Array.isArray(slug) ? slug[0] : slug || '';

  const article = articleMetadata[slugStr];
  const finalArticle = article || {
    title: 'Ultra Advisor 知識庫',
    category: 'tools',
    description: '專業財務顧問工具與理財知識，幫助您做出更好的財務決策。',
  };
  const ogImage = categoryOgImages[finalArticle.category] || 'og-image.png';
  const fullUrl = `https://ultra-advisor.tw/blog/${slugStr}`;

  // 一般用戶（包括 LINE 內建瀏覽器）：fetch index.html 並返回
  if (!isCrawler(userAgent)) {
    try {
      // 從 Vercel 靜態檔案取得 index.html
      const indexHtmlResponse = await fetch('https://ultra-advisor.tw/index.html');
      let indexHtml = await indexHtmlResponse.text();

      // 注入 __BLOG_ROUTE__ flag，讓 main.tsx 知道要渲染 BlogPage
      indexHtml = indexHtml.replace(
        '<script>',
        '<script>window.__BLOG_ROUTE__ = true;</script><script>'
      );

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.status(200).send(indexHtml);
    } catch (error) {
      // 如果 fetch 失敗，返回簡單的重導向頁面
      const fallbackHtml = `<!DOCTYPE html>
<html><head>
<meta http-equiv="refresh" content="0;url=/index.html#/blog/${slugStr}">
<script>window.location.href = '/index.html';</script>
</head><body>正在載入...</body></html>`;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(200).send(fallbackHtml);
    }
    return;
  }

  // 爬蟲：返回帶有完整 OG meta 的靜態 HTML
  const crawlerHtml = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${finalArticle.title} | Ultra Advisor</title>
  <meta name="description" content="${finalArticle.description}">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${fullUrl}">
  <meta property="og:title" content="${finalArticle.title}">
  <meta property="og:description" content="${finalArticle.description}">
  <meta property="og:image" content="https://ultra-advisor.tw/${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="zh_TW">
  <meta property="og:site_name" content="Ultra Advisor">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${fullUrl}">
  <meta name="twitter:title" content="${finalArticle.title}">
  <meta name="twitter:description" content="${finalArticle.description}">
  <meta name="twitter:image" content="https://ultra-advisor.tw/${ogImage}">

  <link rel="canonical" href="${fullUrl}">
</head>
<body>
  <h1>${finalArticle.title}</h1>
  <p>${finalArticle.description}</p>
  <p>閱讀完整文章：<a href="${fullUrl}">${fullUrl}</a></p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(crawlerHtml);
}
