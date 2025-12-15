// src/data/fundData.ts

export const fundDatabase = {
  // ==========================================
  // 1. 境外基金 - 配息型 (Income)
  // ==========================================
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
      { year: 2014, nav: 10.60, rate: 30.3 },
      { year: 2016, nav: 9.60,  rate: 32.2 },
      { year: 2018, nav: 8.80,  rate: 30.1 },
      { year: 2020, nav: 9.80,  rate: 29.5 },
      { year: 2021, nav: 10.20, rate: 27.8 },
      { year: 2022, nav: 8.10,  rate: 29.7 },
      { year: 2023, nav: 8.30,  rate: 31.1 },
      { year: 2024, nav: 8.42,  rate: 32.4 },
    ]
  },
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
      { year: 2016, nav: 8.90,  rate: 1 },
      { year: 2018, nav: 8.10,  rate: 1 },
      { year: 2020, nav: 8.90,  rate: 1 },
      { year: 2021, nav: 9.30,  rate: 1 },
      { year: 2022, nav: 7.20,  rate: 1 },
      { year: 2024, nav: 7.85,  rate: 1 },
    ]
  },
  // [新增] 貝萊德世界科技 (配息版)
  "MLE24": {
    id: "MLE24",
    name: "貝萊德世界科技基金A10 (美元配息)",
    currency: "USD",
    type: "income", 
    inceptionDate: "2019-12-18", 
    startNav: 10.0,
    currentNav: 13.5, 
    avgYield: 6.5, 
    desc: "科技股的高成長爆發力 + 月配息現金流，適合積極型領息族。",
    historyNodes: [
      { year: 2019, nav: 10.0, rate: 30.1 },
      { year: 2020, nav: 14.5, rate: 28.5 }, 
      { year: 2021, nav: 16.2, rate: 27.8 }, 
      { year: 2022, nav: 9.8,  rate: 29.7 }, 
      { year: 2023, nav: 12.5, rate: 31.1 }, 
      { year: 2024, nav: 13.5, rate: 32.4 }, 
    ]
  },
  // [新增] 摩根多重收益
  "JPF11": {
    id: "JPF11",
    name: "摩根多重收益基金-A股 (美元對沖)",
    currency: "USD",
    type: "income",
    inceptionDate: "2012-01-13",
    startNav: 10.0,
    currentNav: 8.35,
    avgYield: 7.8, 
    desc: "廣納全球收益資產，波動相對股票低，追求長期穩健現金流。",
    historyNodes: [
      { year: 2012, nav: 10.0, rate: 29.8 },
      { year: 2014, nav: 10.5, rate: 30.3 },
      { year: 2016, nav: 9.8,  rate: 32.2 },
      { year: 2018, nav: 9.2,  rate: 30.1 },
      { year: 2020, nav: 9.5,  rate: 29.5 },
      { year: 2021, nav: 10.1, rate: 27.8 },
      { year: 2022, nav: 8.2,  rate: 29.7 },
      { year: 2023, nav: 8.3,  rate: 31.1 },
      { year: 2024, nav: 8.35, rate: 32.4 },
    ]
  },

  // ==========================================
  // 2. 台股基金 - 成長型 (Growth)
  // ==========================================
  "NTDEQ0930": {
    id: "NTDEQ0930",
    name: "安聯台灣科技基金",
    currency: "TWD",
    type: "growth", 
    inceptionDate: "2001-07-01", 
    startNav: 10.0,
    currentNav: 155.0, 
    avgYield: 0, // 成長型不配息
    desc: "鎖定高科技成長股，淨值波動大但長期爆發力極強，不配息。",
    historyNodes: [
      { year: 2001, nav: 10.0, rate: 1 },
      { year: 2004, nav: 12.5, rate: 1 },
      { year: 2008, nav: 8.5, rate: 1 },  
      { year: 2012, nav: 18.0, rate: 1 },
      { year: 2016, nav: 35.0, rate: 1 },
      { year: 2019, nav: 55.0, rate: 1 },
      { year: 2020, nav: 85.0, rate: 1 }, 
      { year: 2021, nav: 110.0, rate: 1 },
      { year: 2022, nav: 80.0, rate: 1 }, 
      { year: 2023, nav: 120.0, rate: 1 },
      { year: 2024, nav: 155.0, rate: 1 }, 
    ]
  },
  "NTDEQ0940": {
    id: "NTDEQ0940",
    name: "安聯台灣大壩基金-A類型-新臺幣",
    currency: "TWD",
    type: "growth", 
    inceptionDate: "2000-04-11", 
    startNav: 10.0,
    currentNav: 110.0, 
    avgYield: 0, // 成長型不配息
    desc: "投資台股績優權值股與高成長潛力股，追求長期資本增值，不配息。",
    historyNodes: [
      { year: 2000, nav: 10.0, rate: 1 },
      { year: 2008, nav: 9.0, rate: 1 },
      { year: 2012, nav: 15.0, rate: 1 },
      { year: 2016, nav: 28.0, rate: 1 },
      { year: 2019, nav: 45.0, rate: 1 },
      { year: 2021, nav: 80.0, rate: 1 },
      { year: 2022, nav: 65.0, rate: 1 },
      { year: 2023, nav: 85.0, rate: 1 },
      { year: 2024, nav: 110.0, rate: 1 },
    ]
  },

  // ==========================================
  // 3. 投資型保單帳戶 - 平衡型
  // ==========================================
  "NTDMD0020": {
    id: "NTDMD0020",
    name: "台幣環球股債均衡組合(月撥回資產)",
    currency: "TWD",
    type: "income", 
    inceptionDate: "2015-01-01", 
    startNav: 10.0,
    currentNav: 8.8, 
    avgYield: 5.5, 
    desc: "安聯人壽委託管理帳戶，股債平衡配置，每月撥回現金流。",
    historyNodes: [
      { year: 2015, nav: 10.0, rate: 1 },
      { year: 2016, nav: 9.8, rate: 1 },
      { year: 2017, nav: 10.2, rate: 1 },
      { year: 2018, nav: 9.2, rate: 1 },
      { year: 2019, nav: 9.6, rate: 1 },
      { year: 2020, nav: 9.9, rate: 1 },
      { year: 2021, nav: 10.5, rate: 1 },
      { year: 2022, nav: 8.5, rate: 1 }, 
      { year: 2023, nav: 8.7, rate: 1 },
      { year: 2024, nav: 8.8, rate: 1 },
    ]
  }
};

// =========================================================
// 計算邏輯 1：單筆投入 (Lump Sum)
// =========================================================
export const generateFundHistory = (fundId: string, initialAmountTwd: number) => {
  const fund = fundDatabase[fundId as keyof typeof fundDatabase];
  if (!fund) return [];

  const nodes = fund.historyNodes;
  const result = [];
  
  const startNode = nodes[0];
  const initialUnits = initialAmountTwd / (startNode.rate * startNode.nav);
  let cumulativeDividendsTwd = 0;

  for (let i = 0; i < nodes.length - 1; i++) {
    const nodeA = nodes[i];
    const nodeB = nodes[i+1];
    
    for (let m = 0; m < 12; m++) {
      const progress = m / 12;
      const currentNav = nodeA.nav + (nodeB.nav - nodeA.nav) * progress;
      const currentRate = nodeA.rate + (nodeB.rate - nodeA.rate) * progress;
      
      let monthlyDivTwd = 0;
      if (fund.avgYield > 0) {
        const monthlyDivPerUnit = (currentNav * (fund.avgYield / 100)) / 12; 
        const monthlyDivTotalFundCurrency = initialUnits * monthlyDivPerUnit;
        monthlyDivTwd = fund.currency === 'USD' ? monthlyDivTotalFundCurrency * currentRate : monthlyDivTotalFundCurrency;
        cumulativeDividendsTwd += monthlyDivTwd;
      }

      const assetValueFundCurrency = initialUnits * currentNav;
      const assetValueTwd = fund.currency === 'USD' ? assetValueFundCurrency * currentRate : assetValueFundCurrency;

      result.push({
        date: `${Math.floor(nodeA.year + progress)}-${String(m+1).padStart(2, '0')}`,
        year: nodeA.year + progress,
        nav: currentNav,
        rate: currentRate,
        investedPrincipal: initialAmountTwd, // 單筆投入本金不變
        assetValueTwd: Math.round(assetValueTwd),
        cumulativeDividends: Math.round(cumulativeDividendsTwd),
        totalReturn: Math.round(assetValueTwd + cumulativeDividendsTwd)
      });
    }
  }
  
  const lastNode = nodes[nodes.length-1];
  const lastAssetTwd = fund.currency === 'USD' ? (initialUnits * lastNode.nav) * lastNode.rate : (initialUnits * lastNode.nav);
    
  result.push({
    date: `${lastNode.year}-12`,
    year: lastNode.year,
    nav: lastNode.nav,
    rate: lastNode.rate,
    investedPrincipal: initialAmountTwd,
    assetValueTwd: Math.round(lastAssetTwd),
    cumulativeDividends: Math.round(cumulativeDividendsTwd),
    totalReturn: Math.round(lastAssetTwd + cumulativeDividendsTwd)
  });

  return result;
};

// =========================================================
// 計算邏輯 2：定期定額 (DCA)
// =========================================================
export const generateDCAHistory = (fundId: string, monthlyAmountTwd: number) => {
  const fund = fundDatabase[fundId as keyof typeof fundDatabase];
  if (!fund) return [];

  const nodes = fund.historyNodes;
  const result = [];
  
  let totalUnits = 0;
  let cumulativeDividendsTwd = 0;
  let totalInvestedPrincipal = 0;

  for (let i = 0; i < nodes.length - 1; i++) {
    const nodeA = nodes[i];
    const nodeB = nodes[i+1];
    
    for (let m = 0; m < 12; m++) {
      const progress = m / 12;
      const currentNav = nodeA.nav + (nodeB.nav - nodeA.nav) * progress;
      const currentRate = nodeA.rate + (nodeB.rate - nodeA.rate) * progress;
      
      // 1. 每月買入 (DCA)
      const investedThisMonth = monthlyAmountTwd;
      totalInvestedPrincipal += investedThisMonth;
      
      const amountFundCurrency = fund.currency === 'USD' ? investedThisMonth / currentRate : investedThisMonth;
      const unitsBought = amountFundCurrency / currentNav;
      totalUnits += unitsBought;

      // 2. 計算配息
      let monthlyDivTwd = 0;
      if (fund.avgYield > 0) {
        const monthlyDivPerUnit = (currentNav * (fund.avgYield / 100)) / 12; 
        const monthlyDivTotalFundCurrency = totalUnits * monthlyDivPerUnit;
        monthlyDivTwd = fund.currency === 'USD' ? monthlyDivTotalFundCurrency * currentRate : monthlyDivTotalFundCurrency;
        cumulativeDividendsTwd += monthlyDivTwd;
      }

      // 3. 計算當下總市值
      const assetValueFundCurrency = totalUnits * currentNav;
      const assetValueTwd = fund.currency === 'USD' ? assetValueFundCurrency * currentRate : assetValueFundCurrency;

      result.push({
        date: `${Math.floor(nodeA.year + progress)}-${String(m+1).padStart(2, '0')}`,
        year: nodeA.year + progress,
        nav: currentNav,
        rate: currentRate,
        investedPrincipal: totalInvestedPrincipal,
        assetValueTwd: Math.round(assetValueTwd),
        cumulativeDividends: Math.round(cumulativeDividendsTwd),
        totalReturn: Math.round(assetValueTwd + cumulativeDividendsTwd)
      });
    }
  }
  
  const lastNode = nodes[nodes.length-1];
  const lastAssetTwd = fund.currency === 'USD' ? (totalUnits * lastNode.nav) * lastNode.rate : (totalUnits * lastNode.nav);
    
  result.push({
    date: `${lastNode.year}-12`,
    year: lastNode.year,
    nav: lastNode.nav,
    rate: lastNode.rate,
    investedPrincipal: totalInvestedPrincipal,
    assetValueTwd: Math.round(lastAssetTwd),
    cumulativeDividends: Math.round(cumulativeDividendsTwd),
    totalReturn: Math.round(lastAssetTwd + cumulativeDividendsTwd)
  });

  return result;
};