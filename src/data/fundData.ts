// src/data/fundData.ts

export const fundDatabase = {
  "USDEQ3490": {
    id: "USDEQ3490",
    name: "安聯收益成長-AM穩定月收 (美元)",
    currency: "USD",
    inceptionDate: "2012-10-16",
    startNav: 10.0,
    currentNav: 8.42, // 2024年底參考價
    avgYield: 8.5, // 平均年化配息率 %
    desc: "股債平衡策略，適合持有美元資產的穩健投資人。",
    // 模擬歷史匯率 (USD/TWD) 與 淨值走勢
    historyNodes: [
      { year: 2012, nav: 10.00, rate: 29.3 },
      { year: 2013, nav: 10.80, rate: 29.6 },
      { year: 2014, nav: 10.60, rate: 30.3 },
      { year: 2015, nav: 9.80,  rate: 31.5 },
      { year: 2016, nav: 9.60,  rate: 32.2 },
      { year: 2017, nav: 9.90,  rate: 30.4 },
      { year: 2018, nav: 8.80,  rate: 30.1 },
      { year: 2019, nav: 9.50,  rate: 30.8 },
      { year: 2020, nav: 9.80,  rate: 29.5 },
      { year: 2021, nav: 10.20, rate: 27.8 }, // 台幣最強時
      { year: 2022, nav: 8.10,  rate: 29.7 }, // 股債雙殺
      { year: 2023, nav: 8.30,  rate: 31.1 },
      { year: 2024, nav: 8.42,  rate: 32.4 }, // 現在
    ]
  },
  "USDEQ5220": {
    id: "USDEQ5220",
    name: "安聯收益成長-AM穩定月收 (台幣)",
    currency: "TWD",
    inceptionDate: "2014-05-27",
    startNav: 10.0,
    currentNav: 7.85, // 台幣級別因高配息，淨值修正較多
    avgYield: 9.2, // 台幣級別配息率通常較高
    desc: "含匯率避險，直接以台幣收息，適合無美元需求者。",
    historyNodes: [
      { year: 2014, nav: 10.00, rate: 1 },
      { year: 2015, nav: 9.20,  rate: 1 },
      { year: 2016, nav: 8.90,  rate: 1 },
      { year: 2017, nav: 9.10,  rate: 1 },
      { year: 2018, nav: 8.10,  rate: 1 },
      { year: 2019, nav: 8.60,  rate: 1 },
      { year: 2020, nav: 8.90,  rate: 1 },
      { year: 2021, nav: 9.30,  rate: 1 },
      { year: 2022, nav: 7.20,  rate: 1 },
      { year: 2023, nav: 7.50,  rate: 1 },
      { year: 2024, nav: 7.85,  rate: 1 },
    ]
  }
};

// 輔助函式：產生月度數據 (含配息模擬)
export const generateFundHistory = (fundId: string, initialAmountTwd: number) => {
  const fund = fundDatabase[fundId as keyof typeof fundDatabase];
  if (!fund) return [];

  const nodes = fund.historyNodes;
  const result = [];
  let currentUnits = 0;
  let cumulativeDividendsTwd = 0;
  
  // 1. 決定進場點 (以成立日開始)
  const startNode = nodes[0];
  const startRate = startNode.rate;
  // 如果是美元基金，要把台幣本金換成美元，再除以淨值算出單位數
  const initialAmountFundCurrency = fund.currency === 'USD' ? initialAmountTwd / startRate : initialAmountTwd;
  currentUnits = initialAmountFundCurrency / startNode.nav;

  // 2. 逐年生成數據 (每月)
  for (let i = 0; i < nodes.length - 1; i++) {
    const nodeA = nodes[i];
    const nodeB = nodes[i+1];
    
    // 模擬這一年中間的 12 個月
    for (let m = 0; m < 12; m++) {
      const progress = m / 12;
      // 線性插值計算當月淨值與匯率
      const currentNav = nodeA.nav + (nodeB.nav - nodeA.nav) * progress;
      const currentRate = nodeA.rate + (nodeB.rate - nodeA.rate) * progress;
      
      // 計算當月配息 (模擬：淨值 * 年化配息率 / 12)
      // 這裡加入一點隨機波動讓數據看起來更真實
      const monthlyDivPerUnit = (currentNav * (fund.avgYield / 100)) / 12; 
      const monthlyDivTotalFundCurrency = currentUnits * monthlyDivPerUnit;
      
      // 換算回台幣配息
      const monthlyDivTwd = fund.currency === 'USD' ? monthlyDivTotalFundCurrency * currentRate : monthlyDivTotalFundCurrency;
      cumulativeDividendsTwd += monthlyDivTwd;

      // 計算當下本金價值 (台幣)
      const assetValueFundCurrency = currentUnits * currentNav;
      const assetValueTwd = fund.currency === 'USD' ? assetValueFundCurrency * currentRate : assetValueFundCurrency;

      result.push({
        date: `${nodeA.year}-${String(m+1).padStart(2, '0')}`,
        year: nodeA.year + progress,
        nav: currentNav,
        rate: currentRate,
        assetValueTwd: Math.round(assetValueTwd),
        cumulativeDividends: Math.round(cumulativeDividendsTwd),
        totalReturn: Math.round(assetValueTwd + cumulativeDividendsTwd)
      });
    }
  }
  
  // 加入最後一個節點 (Current)
  const lastNode = nodes[nodes.length-1];
  const lastAssetTwd = fund.currency === 'USD' 
    ? (currentUnits * lastNode.nav) * lastNode.rate 
    : (currentUnits * lastNode.nav);
    
  result.push({
    date: `${lastNode.year}-12`,
    year: lastNode.year,
    nav: lastNode.nav,
    rate: lastNode.rate,
    assetValueTwd: Math.round(lastAssetTwd),
    cumulativeDividends: Math.round(cumulativeDividendsTwd),
    totalReturn: Math.round(lastAssetTwd + cumulativeDividendsTwd)
  });

  return result;
};