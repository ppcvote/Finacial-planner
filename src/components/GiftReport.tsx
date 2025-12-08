import React from 'react';
import { 
  Gift, 
  TrendingUp, 
  PiggyBank, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  Target,
  Quote
} from 'lucide-react';
import { 
  ComposedChart, 
  Area, 
  Line, 
  Bar, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// --- 重用計算邏輯 (Pure Functions) ---
const calculateMonthlyPayment = (principal: number, rate: number, years: number) => {
  const p = Number(principal) || 0;
  const rVal = Number(rate) || 0;
  const y = Number(years) || 0;
  const r = rVal / 100 / 12;
  const n = y * 12;
  if (rVal === 0) return (p * 10000) / (n || 1);
  const result = (p * 10000 * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return isNaN(result) ? 0 : result;
};

const calculateMonthlyIncome = (principal: number, rate: number) => {
  const p = Number(principal) || 0;
  const r = Number(rate) || 0;
  return (p * 10000 * (r / 100)) / 12; 
};

// ------------------------------------------------------------------
// 專屬元件: GiftReport
// ------------------------------------------------------------------
const GiftReport = ({ data }: { data: any }) => {
  // 1. 資料解構與預設值
  const loanAmount = Number(data?.loanAmount) || 100;
  const loanTerm = Number(data?.loanTerm) || 7;
  const loanRate = Number(data?.loanRate) || 2.8;
  const investReturnRate = Number(data?.investReturnRate) || 6;
  const isCompoundMode = data?.isCompoundMode || false; // 接收外部傳入的模式

  // 進階參數
  const c2Loan = data?.cycle2Loan !== undefined ? Number(data.cycle2Loan) : loanAmount;
  const c2Rate = data?.cycle2Rate !== undefined ? Number(data.cycle2Rate) : loanRate;
  const c3Loan = data?.cycle3Loan !== undefined ? Number(data.cycle3Loan) : loanAmount;
  const c3Rate = data?.cycle3Rate !== undefined ? Number(data.cycle3Rate) : loanRate;

  // 2. 核心計算 (與原工具邏輯一致)
  const payment1 = calculateMonthlyPayment(loanAmount, loanRate, loanTerm);
  const payment2 = calculateMonthlyPayment(c2Loan, c2Rate, loanTerm);
  const payment3 = calculateMonthlyPayment(c3Loan, c3Rate, loanTerm);

  const income1 = calculateMonthlyIncome(loanAmount, investReturnRate);
  const income2 = calculateMonthlyIncome(c2Loan, investReturnRate);
  const income3 = calculateMonthlyIncome(c3Loan, investReturnRate);

  let phase1_NetOut, phase2_NetOut, phase3_NetOut;
  let phase1_Asset, phase2_Asset, phase3_Asset;
  const monthlyRate = investReturnRate / 100 / 12;
  const totalMonthsPerCycle = loanTerm * 12;
  const compoundFactor = Math.pow(1 + monthlyRate, totalMonthsPerCycle);

  if (isCompoundMode) {
      phase1_NetOut = payment1;
      phase2_NetOut = payment2;
      phase3_NetOut = payment3;
      phase1_Asset = Math.round(loanAmount * compoundFactor);
      phase2_Asset = Math.round((phase1_Asset + c2Loan) * compoundFactor);
      phase3_Asset = Math.round((phase2_Asset + c3Loan) * compoundFactor);
  } else {
      phase1_Asset = loanAmount;
      phase2_Asset = loanAmount + c2Loan;
      phase3_Asset = loanAmount + c2Loan + c3Loan;
      phase1_NetOut = payment1 - income1;
      phase2_NetOut = payment2 - (income1 + income2);
      phase3_NetOut = payment3 - (income1 + income2 + income3);
  }

  // 總結數據
  const totalYears = loanTerm * 3;
  const monthsPerCycle = loanTerm * 12;
  
  const totalCostRaw = (phase1_NetOut + phase2_NetOut + phase3_NetOut) * monthsPerCycle;
  const totalProjectCost_Wan = Math.round(totalCostRaw / 10000);
  const finalAssetValue_Wan = phase3_Asset;
  const netProfit_Wan = finalAssetValue_Wan - totalProjectCost_Wan;
  const avgMonthlyCost = Math.round((phase1_NetOut + phase2_NetOut + phase3_NetOut) / 3);
  
  // 一般存錢比較
  const monthlyStandardSaving = Math.round((finalAssetValue_Wan * 10000) / (totalYears * 12));

  // 3. 圖表數據生成
  const generateChartData = () => {
    const dataArr = [];
    let cumulativeStandard = 0;
    let cumulativeProjectCost = 0;
    const standardSavingPerMonth = (finalAssetValue_Wan * 10000) / (totalYears * 12); 

    for (let year = 1; year <= totalYears; year++) {
      cumulativeStandard += standardSavingPerMonth * 12;
      
      let currentYearNetOut = 0;
      let currentAssetValue = 0;

      if (year <= loanTerm) {
        currentYearNetOut = phase1_NetOut;
        currentAssetValue = isCompoundMode ? (loanAmount * 10000) * Math.pow(1 + monthlyRate, year * 12) : loanAmount * 10000;
      } else if (year <= loanTerm * 2) {
        currentYearNetOut = phase2_NetOut;
        if(isCompoundMode) {
             const prevAsset = phase1_Asset * 10000;
             const yearsInPhase2 = year - loanTerm;
             const startPrincipalP2 = prevAsset + (c2Loan * 10000);
             currentAssetValue = startPrincipalP2 * Math.pow(1 + monthlyRate, yearsInPhase2 * 12);
        } else {
             currentAssetValue = (loanAmount + c2Loan) * 10000;
        }
      } else {
        currentYearNetOut = phase3_NetOut;
        if(isCompoundMode) {
            const prevAsset = phase2_Asset * 10000;
            const yearsInPhase3 = year - loanTerm * 2;
            const startPrincipalP3 = prevAsset + (c3Loan * 10000);
            currentAssetValue = startPrincipalP3 * Math.pow(1 + monthlyRate, yearsInPhase3 * 12);
        } else {
            currentAssetValue = (loanAmount + c2Loan + c3Loan) * 10000;
        }
      }

      cumulativeProjectCost += currentYearNetOut * 12;
      
      // 減少取樣點以優化圖表顯示 (每2年或重要節點)
      // 但為了Recharts平滑，這裡還是每年推入
      dataArr.push({
        year: `${year}`,
        一般存錢: Math.round(cumulativeStandard / 10000),
        實付成本: Math.round(cumulativeProjectCost / 10000),
        資產價值: Math.round(currentAssetValue / 10000),
      });
    }
    return dataArr;
  };

  const chartData = generateChartData();

  // --- UI Render ---
  return (
    <div className="font-sans text-slate-800 space-y-8">
      
      {/* 1. Header: 願景與標題 */}
      <div className="flex items-center justify-between border-b-2 border-indigo-100 pb-6">
         <div>
             <div className="flex items-center gap-2 mb-2">
                 <Gift className="text-indigo-600" size={28} />
                 <span className="text-sm font-bold text-indigo-600 tracking-widest uppercase">Wealth Legacy Project</span>
             </div>
             <h1 className="text-4xl font-black text-slate-900 mb-2">百萬禮物專案</h1>
             <p className="text-lg text-slate-500 font-medium">給未來的自己與孩子，一份增值 300% 的成年禮</p>
         </div>
         <div className="text-right hidden print:block">
             <p className="text-sm text-slate-400">專案代碼</p>
             <p className="text-xl font-mono font-bold text-slate-700">GIFT-{loanTerm*3}Y-{finalAssetValue_Wan}W</p>
         </div>
      </div>

      {/* 2. 核心比較 (The Hook): 做與不做的差別 */}
      <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2">
              <Target size={24} className="text-rose-500"/>
              為何選擇這個專案？ (效益與成本分析)
          </h2>
          
          <div className="grid grid-cols-2 gap-12">
              {/* 左邊：一般存錢 */}
              <div className="relative p-6 rounded-2xl border-2 border-dashed border-slate-300 bg-white opacity-80">
                  <div className="absolute -top-3 left-6 bg-slate-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      傳統模式
                  </div>
                  <div className="flex justify-between items-end mb-4">
                      <div className="text-slate-500 font-bold">目標累積</div>
                      <div className="text-2xl font-black text-slate-600">{finalAssetValue_Wan} 萬</div>
                  </div>
                  <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                           <span>準備本金</span>
                           <span className="font-bold text-slate-700">{finalAssetValue_Wan} 萬</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                           <span>每月負擔</span>
                           <span className="font-bold text-slate-700">${monthlyStandardSaving.toLocaleString()}</span>
                      </div>
                      <div className="pt-4 border-t border-slate-100 mt-2">
                           <div className="text-center text-slate-400 text-sm font-medium">完全依靠勞力存錢</div>
                      </div>
                  </div>
              </div>

              {/* 右邊：百萬禮物專案 */}
              <div className="relative p-6 rounded-2xl border-2 border-indigo-500 bg-white shadow-xl transform scale-105 print:scale-100 print:shadow-none">
                  <div className="absolute -top-3 left-6 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                      專案模式
                  </div>
                  <div className="flex justify-between items-end mb-4">
                      <div className="text-indigo-600 font-bold">目標累積</div>
                      <div className="text-3xl font-black text-indigo-700">{finalAssetValue_Wan} 萬</div>
                  </div>
                  <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                           <span className="text-slate-600">實付成本</span>
                           <span className="font-bold text-indigo-700">{totalProjectCost_Wan} 萬 <span className="text-xs text-rose-500 ml-1">(-{finalAssetValue_Wan - totalProjectCost_Wan}萬)</span></span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                           <span className="text-slate-600">每月負擔</span>
                           <span className="font-bold text-indigo-700">${avgMonthlyCost.toLocaleString()} <span className="text-xs text-green-600 ml-1">(省 {Math.round(monthlyStandardSaving - avgMonthlyCost).toLocaleString()})</span></span>
                      </div>
                      <div className="pt-4 border-t border-indigo-50 mt-2">
                           <div className="text-center text-indigo-600 text-sm font-bold flex items-center justify-center gap-2">
                               <TrendingUp size={16}/> 獲利空間 {Math.round((netProfit_Wan / totalProjectCost_Wan) * 100)}%
                           </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* 3. 視覺化圖表: 財富剪刀差 */}
      <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
              <TrendingUp size={24} className="text-indigo-600"/>
              資產成長模擬 ({totalYears}年趨勢)
          </h2>
          <div className="h-[320px] w-full border border-slate-100 rounded-2xl p-4 bg-white shadow-sm print:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="year" tick={{fontSize: 10}} label={{ value: '年度', position: 'insideBottomRight', offset: -10, fontSize: 10 }} />
                      <YAxis unit="萬" tick={{fontSize: 10}} width={40} />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}/>
                      <Area type="monotone" dataKey="資產價值" name="專案資產" stroke="#4f46e5" fill="#e0e7ff" strokeWidth={3} isAnimationActive={false}/>
                      <Line type="monotone" dataKey="實付成本" name="專案成本" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false}/>
                      <Line type="monotone" dataKey="一般存錢" name="傳統存錢" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} dot={false} isAnimationActive={false}/>
                  </ComposedChart>
              </ResponsiveContainer>
          </div>
          <p className="text-xs text-center text-slate-400">
              *圖表為模擬試算，實際報酬依市場波動而定。黃線(成本)與紫區塊(資產)之間的距離，即為您的財富增長空間。
          </p>
      </div>

      {/* 4. 執行路徑 (Roadmap) */}
      <div>
          <h2 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2">
              <ArrowRight size={24} className="text-indigo-600"/>
              執行三部曲
          </h2>
          <div className="grid grid-cols-3 gap-4">
              {/* Phase 1 */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                      <span className="text-3xl font-black text-blue-100 mr-2 mt-2">1</span>
                  </div>
                  <div className="relative z-10">
                      <h3 className="text-blue-600 font-bold text-lg mb-1">累積期</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">Year 1 - {loanTerm}</p>
                      <div className="text-sm text-slate-600 space-y-2">
                          <p>借入第一筆資金 {loanAmount} 萬</p>
                          <p className="font-medium text-slate-800">資產從 0 變 {phase1_Asset} 萬</p>
                      </div>
                  </div>
              </div>

              {/* Phase 2 */}
              <div className="bg-white p-5 rounded-xl border border-indigo-200 relative overflow-hidden shadow-sm">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center">
                      <span className="text-3xl font-black text-indigo-100 mr-2 mt-2">2</span>
                  </div>
                  <div className="relative z-10">
                      <h3 className="text-indigo-600 font-bold text-lg mb-1">成長期</h3>
                      <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider mb-3">Year {loanTerm+1} - {loanTerm*2}</p>
                      <div className="text-sm text-slate-600 space-y-2">
                          <p>償還後再借 {c2Loan} 萬</p>
                          <p className="font-medium text-slate-800">資產翻倍至 {phase2_Asset} 萬</p>
                      </div>
                  </div>
              </div>

              {/* Phase 3 */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-5 rounded-xl text-white relative overflow-hidden shadow-lg">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                      <span className="text-3xl font-black text-white/20 mr-2 mt-2">3</span>
                  </div>
                  <div className="relative z-10">
                      <h3 className="text-white font-bold text-lg mb-1">收割期</h3>
                      <p className="text-xs text-indigo-200 font-bold uppercase tracking-wider mb-3">Year {loanTerm*2+1} - {loanTerm*3}</p>
                      <div className="text-sm text-indigo-100 space-y-2">
                          <p>第三筆資金注入</p>
                          <p className="font-bold text-white text-lg">擁有 {phase3_Asset} 萬資產</p>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* 5. 顧問總結與行動呼籲 */}
      <div className="bg-slate-50 p-6 rounded-2xl border-l-4 border-indigo-500 mt-8">
          <div className="flex gap-4">
               <Quote className="text-indigo-300 shrink-0" size={32} />
               <div>
                   <h3 className="font-bold text-slate-800 text-lg mb-2">顧問觀點</h3>
                   <p className="text-slate-600 text-sm leading-relaxed mb-4">
                       「財富自由不是靠省吃儉用，而是靠『資產積累』。百萬禮物專案的核心，在於利用銀行低利資金與時間複利，讓您用『打折』的成本，買到未來的財富。」
                   </p>
                   <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                       <Clock size={16} />
                       <span>時間是這個計畫最貴的成本，越早啟動，複利效應越驚人。</span>
                   </div>
               </div>
          </div>
      </div>

    </div>
  );
};

export default GiftReport;
