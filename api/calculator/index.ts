import type { VercelRequest, VercelResponse } from '@vercel/node';

// 傲創計算機的 SEO metadata
const calculatorMeta = {
  title: '傲創計算機 | 免費房貸計算機 - Ultra Advisor',
  description: '免費房貸計算機：支援本息均攤、本金均攤、額外還款試算、通脹貼現分析。專業視覺化圖表，幫你精算每一分利息。',
  ogImage: 'og-tools.png',
  url: 'https://ultra-advisor.tw/calculator'
};

// 爬蟲 User-Agent 檢測
const crawlerPatterns = [
  'facebookexternalhit',
  'Facebot',
  'LinkedInBot',
  'Twitterbot',
  'Slackbot-LinkExpanding',
  'WhatsApp/',
  'TelegramBot',
  'Discordbot',
  'Pinterestbot',
  'Googlebot',
  'bingbot',
];

function isCrawler(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  const hasBrowserEngine = ua.includes('safari') || ua.includes('chrome') || ua.includes('firefox');
  const isKnownBot = crawlerPatterns.some(pattern => ua.includes(pattern.toLowerCase()));

  if (hasBrowserEngine && !isKnownBot) {
    return false;
  }

  return isKnownBot;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userAgent = req.headers['user-agent'] || '';

  // 一般用戶：返回 index.html
  if (!isCrawler(userAgent)) {
    try {
      const indexHtmlResponse = await fetch('https://ultra-advisor.tw/index.html');
      let indexHtml = await indexHtmlResponse.text();

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.status(200).send(indexHtml);
    } catch (error) {
      const fallbackHtml = `<!DOCTYPE html>
<html><head>
<meta http-equiv="refresh" content="0;url=/index.html">
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
  <title>${calculatorMeta.title}</title>
  <meta name="description" content="${calculatorMeta.description}">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${calculatorMeta.url}">
  <meta property="og:title" content="${calculatorMeta.title}">
  <meta property="og:description" content="${calculatorMeta.description}">
  <meta property="og:image" content="https://ultra-advisor.tw/${calculatorMeta.ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="zh_TW">
  <meta property="og:site_name" content="Ultra Advisor">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${calculatorMeta.url}">
  <meta name="twitter:title" content="${calculatorMeta.title}">
  <meta name="twitter:description" content="${calculatorMeta.description}">
  <meta name="twitter:image" content="https://ultra-advisor.tw/${calculatorMeta.ogImage}">

  <link rel="canonical" href="${calculatorMeta.url}">
</head>
<body>
  <h1>${calculatorMeta.title}</h1>
  <p>${calculatorMeta.description}</p>
  <p>前往使用：<a href="${calculatorMeta.url}">${calculatorMeta.url}</a></p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(crawlerHtml);
}
