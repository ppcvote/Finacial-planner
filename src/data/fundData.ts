// src/data/fundData.ts

export const fundDatabase = {
  // --- 1. 配息型：安聯美元 ---
  "USDEQ3490": {
    id: "USDEQ3490",
    name: "安聯收益成長-AM穩定月收 (美元)",
    currency: "USD",
    type: "income",
    inceptionDate: "2012-10-16",
    startNav: 10.0,
    currentNav: 8.42,
    avgYield: 8.5, 
    desc: "股債平衡策略，適合持有美元資產的穩健投資人。",
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
      { year: 2021, nav: 10.20, rate: 27.8 },
      { year: 2022, nav: 8.10,  rate: 29.7 },
      { year: 2023, nav: 8.30,  rate: 31.1 },
      { year: 2024, nav: 8.42,  rate: 32.4 },
    ]
  },
  // --- 2. 配息型：安聯台幣 ---
  "USDEQ5220": {
    id: "USDEQ5220",
    name: "安聯收益成長-AM穩定月收 (台幣)",
    currency: "TWD",
    type: "income",
    inceptionDate: "2014-05-27",
    startNav: 10.0,
    currentNav: 7.85,
    avgYield: 9.2,
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
  },
  // --- 3. 成長型：模擬0940 ---
  "NTDEQ0940": {
    id: "NTDEQ0940",
    name: "元大台灣價值高息 (模擬0940)",
    currency: "TWD",
    type: "growth",
    inceptionDate: "2024-03-11",
    startNav: 10.0,
    currentNav: 10.8,
    avgYield: 4.0,
    desc: "鎖定高價值成長股，波動較大但具資本利得潛力。",
    historyNodes: [
      { year: 2024, nav: 10.00, rate: 1 },
      { year: 2024.5, nav: 9.60, rate: 1 },
      { year: 2025, nav: 10.80, rate: 1 },
    ]
  },
  // --- 4. 成長型：模擬0930 ---
  "NTDEQ0930": {
    id: "NTDEQ0930",
    name: "永豐ESG低碳高息 (模擬0930)",
    currency: "TWD",
    type: "growth",
    inceptionDate: "2023-07-13",
    startNav: 15.0,
    currentNav: 19.5,
    avgYield: 5.0,
    desc: "結合ESG與低碳趨勢的成長型標的。",
    historyNodes: [
      { year: 2023, nav: 15.00, rate: 1 },
      { year: 2024, nav: 17.80, rate: 1 },
      { year: 2025, nav: 19.50, rate: 1 },
    ]
  },
  // --- 5. 成長型：模擬0050 ---
  "NTDMD0020": {
    id: "NTDMD0020",
    name: "元大台灣50 (模擬0050)",
    currency: "TWD",
    type: "growth",
    inceptionDate: "2003-06-25",
    startNav: 36.9,
    currentNav: 185.0,
    avgYield: 3.5,
    desc: "追蹤台灣市值前50大企業，長期隨經濟成長。",
    historyNodes: [
      { year: 2003, nav: 36.9, rate: 1 },
      { year: 2008, nav: 30.5, rate: 1 },
      { year: 2012, nav: 53.2, rate: 1 },
      { year: 2016, nav: 72.8, rate: 1 },
      { year: 2019, nav: 96.5, rate: 1 },
      { year: 2021, nav: 140.0, rate: 1 },
      { year: 2022, nav: 110.0, rate: 1 },
      { year: 2023, nav: 130.0, rate: 1 },
      { year: 2024, nav: 165.0, rate: 1 },
      { year: 2025, nav: 185.0, rate: 1 },
    ]
  }
};

// 輔助函式：產生月度數據 (含配息模擬)
export const generateFundHistory = (fundId: string, initialAmountTwd: number) => {
  const fund = fundDatabase[fundId as keyof typeof fundDatabase];
  if (!fund) return [];

  const nodes = fund.historyNodes;
  const result = [];
  
  const startNode = nodes[0];
  const startRate = startNode.rate;
  // 計算初始單位數
  const initialAmountFundCurrency = fund.currency === 'USD' ? initialAmountTwd / startRate : initialAmountTwd;
  const currentUnits = initialAmountFundCurrency / startNode.nav;
  let cumulativeDividendsTwd = 0;

  for (let i = 0; i < nodes.length - 1; i++) {
    const nodeA = nodes[i];
    const nodeB = nodes[i+1];
    
    // 模擬這一年中間的 12 個月
    for (let m = 0; m < 12; m++) {
      const progress = m / 12;
      const currentNav = nodeA.nav + (nodeB.nav - nodeA.nav) * progress;
      const currentRate = nodeA.rate + (nodeB.rate - nodeA.rate) * progress;
      
      // 計算當月配息
      const monthlyDivPerUnit = (currentNav * (fund.avgYield / 100)) / 12; 
      const monthlyDivTotalFundCurrency = currentUnits * monthlyDivPerUnit;
      const monthlyDivTwd = fund.currency === 'USD' ? monthlyDivTotalFundCurrency * currentRate : monthlyDivTotalFundCurrency;
      cumulativeDividendsTwd += monthlyDivTwd;

      // 計算當下本金價值
      const assetValueFundCurrency = currentUnits * currentNav;
      const assetValueTwd = fund.currency === 'USD' ? assetValueFundCurrency * currentRate : assetValueFundCurrency;

      result.push({
        date: `${Math.floor(nodeA.year + progress)}-${String(m+1).padStart(2, '0')}`,
        year: nodeA.year + progress,
        nav: currentNav,
        rate: currentRate,
        assetValueTwd: Math.round(assetValueTwd),
        cumulativeDividends: Math.round(cumulativeDividendsTwd),
        totalReturn: Math.round(assetValueTwd + cumulativeDividendsTwd)
      });
    }
  }
  
  // 最後一個節點
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