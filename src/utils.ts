// ------------------------------------------------------------------
// 輔助計算函數
// ------------------------------------------------------------------

export const calculateMonthlyPayment = (principal: number, rate: number, years: number) => {
  const p = Number(principal) || 0;
  const rVal = Number(rate) || 0;
  const y = Number(years) || 0;
  const r = rVal / 100 / 12;
  const n = y * 12;
  if (rVal === 0) return (p * 10000) / (n || 1);
  const result = (p * 10000 * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return isNaN(result) ? 0 : result;
};

export const calculateMonthlyIncome = (principal: number, rate: number) => {
  const p = Number(principal) || 0;
  const r = Number(rate) || 0;
  return (p * 10000 * (r / 100)) / 12;
};

export const calculateRemainingBalance = (principal: number, rate: number, totalYears: number, yearsElapsed: number) => {
  const pVal = Number(principal) || 0;
  const rVal = Number(rate) || 0;
  const totalY = Number(totalYears) || 0;
  const elapsed = Number(yearsElapsed) || 0;
  const r = rVal / 100 / 12;
  const n = totalY * 12;
  const p = elapsed * 12;
  if (rVal === 0) return pVal * 10000 * (1 - p/(n || 1));
  const balance = (pVal * 10000 * (Math.pow(1 + r, n) - Math.pow(1 + r, p))) / (Math.pow(1 + r, n) - 1);
  return Math.max(0, isNaN(balance) ? 0 : balance);
};
// ... (保留原本上方的 calculateMonthlyPayment 等基礎函式) ...

// ------------------------------------------------------------------
// 專案計算核心：金融房產專案 (Estate Project)
// ------------------------------------------------------------------
export const calculateEstateProject = (data: any) => {
  // 1. 資料解構與預設值安全處理
  const loanAmount = Number(data?.loanAmount) || 1000;
  const loanTerm = Number(data?.loanTerm) || 30;
  const loanRate = Number(data?.loanRate) || 2.2;
  const investReturnRate = Number(data?.investReturnRate) || 6;
  const existingLoanBalance = Number(data?.existingLoanBalance) || 0;
  const existingMonthlyPayment = Number(data?.existingMonthlyPayment) || 0;

  // 判斷模式
  const isRefinance = existingLoanBalance > 0 && existingLoanBalance < loanAmount;
  const cashOutAmount = isRefinance ? loanAmount - existingLoanBalance : 0;

  // 2. 核心計算
  // 基礎房貸月付
  const monthlyPayment = calculateMonthlyPayment(loanAmount, loanRate, loanTerm);
  // 全額投資配息
  const monthlyIncomeFull = calculateMonthlyIncome(loanAmount, investReturnRate);

  // --- 轉增貸模式數據 ---
  const monthlyInvestIncomeFromCashOut = calculateMonthlyIncome(cashOutAmount, investReturnRate);
  const netNewMonthlyPayment = monthlyPayment - monthlyInvestIncomeFromCashOut;
  const monthlySavings = existingMonthlyPayment - netNewMonthlyPayment;
  const totalSavingsOverTerm = monthlySavings * 12 * loanTerm;
  // 轉增貸總效益 = 省下的利息 + 多拿的現金
  const totalBenefitRefinance = totalSavingsOverTerm + (cashOutAmount * 10000);

  // --- 原始模式數據 ---
  const netCashFlow = monthlyIncomeFull - monthlyPayment;
  const isPositiveFlow = netCashFlow >= 0;
  const totalNetCashFlow = netCashFlow * 12 * loanTerm;
  const totalOutOfPocketOriginal = isPositiveFlow ? 0 : Math.abs(netCashFlow) * 12 * loanTerm;
  const totalAssetValue = loanAmount * 10000;
  // 原始總效益 = 房子價值 + 淨現金流
  const totalBenefitStandard = totalAssetValue + totalNetCashFlow;

  // 3. 圖表數據生成
  const chartData = [];
  const step = Math.max(1, Math.floor(loanTerm / 15));

  for (let year = 1; year <= loanTerm; year++) {
    if (year === 1 || year % step === 0 || year === loanTerm) {
      const remainingLoan = calculateRemainingBalance(loanAmount, loanRate, loanTerm, year);
      
      if (isRefinance) {
          const cumulativeSavings = monthlySavings * 12 * year;
          chartData.push({
              year: `${year}`,
              累積效益: Math.round(cumulativeSavings / 10000),
              轉貸現金: Math.round(cashOutAmount),
              剩餘貸款: Math.round(remainingLoan / 10000)
          });
      } else {
          const equity = (loanAmount * 10000) - remainingLoan;
          const cumulativeFlow = netCashFlow * 12 * year;
          chartData.push({
              year: `${year}`,
              總資產: Math.round(loanAmount),
              剩餘貸款: Math.round(remainingLoan / 10000),
              淨值: Math.round(equity / 10000),
              累積現金流: Math.round(cumulativeFlow / 10000)
          });
      }
    }
  }

  // 4. 壓力測試數據
  const spread = investReturnRate - loanRate;
  const breakEvenRate = investReturnRate;

  // 回傳所有 UI 需要的數據包
  return {
    // 參數
    loanAmount, loanTerm, loanRate, investReturnRate, isRefinance, cashOutAmount, existingMonthlyPayment,
    // 計算結果
    monthlyPayment, monthlyIncomeFull, netCashFlow, isPositiveFlow, 
    netNewMonthlyPayment, monthlySavings,
    // 總結算
    totalSavingsOverTerm, totalBenefitRefinance,
    totalNetCashFlow, totalOutOfPocketOriginal, totalAssetValue, totalBenefitStandard,
    // 圖表與風險
    chartData, spread, breakEvenRate
  };
};
