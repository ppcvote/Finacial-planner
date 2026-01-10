// 这是一个 Vercel Serverless Function
// 部署后，前端可以通过 /api/market 访问
import yahooFinance from 'yahoo-finance2';

export default async function handler(req, res) {
  // 设置 CORS 允许前端访问
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 抓取关键指标
    // ^TWII: 台湾加权指数
    // TWD=X: 美元/台币汇率
    // ^GSPC: S&P 500
    // ^TNX: 10年期美债收益率
    const results = await yahooFinance.quote(['^TWII', 'TWD=X', '^GSPC', '^TNX']);

    // 格式化数据回传给前端
    const data = results.map(item => ({
      symbol: item.symbol,
      shortName: item.shortName || item.longName,
      price: item.regularMarketPrice,
      change: item.regularMarketChange,
      changePercent: item.regularMarketChangePercent,
      time: item.regularMarketTime,
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Yahoo Finance API Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch market data' });
  }
}