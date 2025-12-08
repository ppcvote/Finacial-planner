import React from 'react';
import { 
  Gift, 
  TrendingUp, 
  PiggyBank, 
  Clock, 
  ArrowRight,
  Target,
  Quote,
  ShieldAlert,
  Banknote,
  Percent
} from 'lucide-react';
import { 
  ComposedChart, 
  Area, 
  Line, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// --- 重用計算邏輯 ---
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
// 子元件: ResultCard (三循環關鍵指標卡片)
// ------------------------------------------------------------------
const ResultCard = ({ phase, title, subTitle, netOut, asset, totalOut, loanAmount, isLast = false }: any) => {
    const colorClass = phase === 1 ? 'text-blue-600' : phase === 2 ? 'text-indigo-600' : 'text-purple-600';
    const bgClass = phase === 1 ? 'bg-blue-50 border-blue-200' : phase === 2 ? 'bg-indigo-50 border-indigo-200' : 'bg-purple-50 border-purple-200';
    const badgeClass = phase === 1 ? 'bg-blue-100 text-blue-700' : phase === 2 ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700';

    return (
        // 修改：print:p-3 適度縮小內距，但保持足夠呼吸空間
        <div className={`flex-1 p-4 print:p-3 rounded-xl border ${bgClass} relative`}>
            {/* 連接箭頭：print:flex 確保列印時顯示箭頭，增加連貫感 */}
            {!isLast && (
                <div className="hidden md:flex print:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 bg-white border border-slate-200 rounded-full items-center justify-center text-slate-400 print:w-5 print:h-5">
                    <ArrowRight size={14} className="print:w-3 print:h-3"/>
                </div>
            )}
            
            {/* Header */}
            <div className="flex justify-between items-start mb-3 print:mb-2">
                <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeClass} mb-1 inline-block`}>
                        Step 0{phase}
                    </span>
                    <h4 className={`font-bold text-lg print:text-base ${colorClass}`}>{title}</h4>
                    <p className="text-xs text-slate-500">{subTitle}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-400">本階段投入</p>
                    <p className="font-bold text-slate-700 print:text-sm">{loanAmount} 萬</p>
                </div>
            </div>

            {/* Body */}
            <div className="space-y-2 border-t border-slate-200/50 pt-3 print:pt-2">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">每月實質負擔</span>
                    <span className={`font-bold ${netOut > 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                        ${Math.round(netOut).toLocaleString()}
                    </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">累積實付成本</span>
                    <span className="font-bold text-slate-600">
                        {Math.round(totalOut).toLocaleString()} 萬
                    </span>
                </div>
                {/* Footer */}
                <div className="flex justify-between items-center pt-2 mt-1 border-t border-dashed border-slate-300">
                    <span className="text-slate-600 font-bold print:text-[10px]">期末資產規模</span>
                    <span className={`text-xl font-black ${colorClass} print:text-base`}>
                        {Math.round(asset).toLocaleString()} <span className="text-xs">萬</span>
                    </span>
                </div>
            </div>
        </div>
    );
};

// ------------------------------------------------------------------
// 主元件: GiftReport
// ------------------------------------------------------------------
const GiftReport = ({ data }: { data: any }) => {
  const loanAmount = Number(data?.loanAmount) || 100;
  const loanTerm = Number(data?.loanTerm) || 7;
  const loanRate = Number(data?.loanRate) || 2.8;
  const investReturnRate = Number(data?.investReturnRate) || 6;
  const isCompoundMode = data?.isCompoundMode || false; 

  const c2Loan = data?.cycle2Loan !== undefined ? Number(data.cycle2Loan) : loanAmount;
  const c2Rate = data?.cycle2Rate !== undefined ? Number(data.cycle2Rate) : loanRate;
  const c3Loan = data?.cycle3Loan !== undefined ? Number(data.cycle3Loan) : loanAmount;
  const c3Rate = data?.cycle3Rate !== undefined ? Number(data.cycle3Rate) : loanRate;

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

  const totalYears = loanTerm * 3;
  const totalCashOut_T0_T7_Wan = Math.round(phase1_NetOut * totalMonthsPerCycle / 10000);
  const totalCashOut_T7_T14_Wan = Math.round(phase2_NetOut * totalMonthsPerCycle / 10000);
  
  const totalCostRaw = (phase1_NetOut + phase2_NetOut + phase3_NetOut) * totalMonthsPerCycle;
  const totalProjectCost_Wan = Math.round(totalCostRaw / 10000);
  const finalAssetValue_Wan = phase3_Asset;
  const netProfit_Wan = finalAssetValue_Wan - totalProjectCost_Wan;
  const avgMonthlyCost = Math.round((phase1_NetOut + phase2_NetOut + phase3_NetOut) / 3);
  
  const monthlyStandardSaving = Math.round((finalAssetValue_Wan * 10000) / (totalYears * 12));

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

  return (
    <div className="font-sans text-slate-800 space-y-8 print:space-y-6">
      
      {/* 1. Header (Cover Page 已有大標題，這裡作為內容頁 Header) */}
      <div className="flex items-center justify-between border-b-2 border-indigo-100 pb-6 print:pb-3 print-break-inside">
         <div>
             <div className="flex items-center gap-2 mb-2">
                 <Gift className="text-indigo-600" size={28} />
                 <span className="text-sm font-bold text-indigo-600 tracking-widest uppercase">Wealth Legacy Project</span>
             </div>
             <h1 className="text-4xl font-black text-slate-900 mb-2 print:text-2xl">百萬禮物專案</h1>
             <p className="text-lg text-slate-500 font-medium print:text-sm">給未來的自己與孩子，一份增值 300% 的成年禮</p>
         </div>
         <div className="text-right hidden print:block">
             <p className="text-sm text-slate-400">專案代碼</p>
             <p className="text-xl font-mono font-bold text-slate-700 print:text-sm">GIFT-{loanTerm*3}Y-{finalAssetValue_Wan}W</p>
         </div>
      </div>

      {/* 2. 核心比較 (The Hook) */}
      <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 print-break-inside print:p-4">
          <h2 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2 print:text-base print:mb-3">
              <Target size={24} className="text-rose-500 print:w-5 print:h-5"/>
              效益成本分析
          </h2>
          
          <div className="grid grid-cols-2 gap-12 print:gap-4">
              {/* 左邊：一般存錢 */}
              <div className="relative p-6 rounded-2xl border-2 border-dashed border-slate-300 bg-white opacity-80 print:p-3">
                  <div className="absolute -top-3 left-6 bg-slate-500 text-white px-3 py-1 rounded-full text-xs font-bold print:border print:border-slate-300 print:text-[10px] print:py-0.5">
                      傳統模式
                  </div>
                  <div className="flex justify-between items-end mb-4 print:mb-2">
                      <div className="text-slate-500 font-bold print:text-xs">目標累積</div>
                      <div className="text-2xl font-black text-slate-600 print:text-lg">{finalAssetValue_Wan} 萬</div>
                  </div>
                  <div className="space-y-4 print:space-y-1">
                      <div className="flex justify-between items-center text-sm print:text-xs">
                           <span>準備本金</span>
                           <span className="font-bold text-slate-700">{finalAssetValue_Wan} 萬</span>
                      </div>
                      <div className="flex justify-between items-center text-sm print:text-xs">
                           <span>每月負擔</span>
                           <span className="font-bold text-slate-700">${monthlyStandardSaving.toLocaleString()}</span>
                      </div>
                      <div className="pt-4 border-t border-slate-100 mt-2 print:mt-1 print:pt-1">
                           <div className="text-center text-slate-400 text-sm font-medium print:text-[10px]">完全依靠勞力存錢</div>
                      </div>
                  </div>
              </div>

              {/* 右邊：百萬禮物專案 */}
              <div className="relative p-6 rounded-2xl border-2 border-indigo-500 bg-white shadow-xl transform scale-105 print:scale-100 print:shadow-none print:p-3 print:border">
                  <div className="absolute -top-3 left-6 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md print:shadow-none print:text-[10px] print:py-0.5">
                      專案模式
                  </div>
                  <div className="flex justify-between items-end mb-4 print:mb-2">
                      <div className="text-indigo-600 font-bold print:text-xs">目標累積</div>
                      <div className="text-3xl font-black text-indigo-700 print:text-lg">{finalAssetValue_Wan} 萬</div>
                  </div>
                  <div className="space-y-4 print:space-y-1">
                      <div className="flex justify-between items-center text-sm print:text-xs">
                           <span className="text-slate-600">實付成本</span>
                           <span className="font-bold text-indigo-700">{totalProjectCost_Wan} 萬 <span className="text-xs text-rose-500 ml-1">(-{finalAssetValue_Wan - totalProjectCost_Wan}萬)</span></span>
                      </div>
                      <div className="flex justify-between items-center text-sm print:text-xs">
                           <span className="text-slate-600">每月負擔</span>
                           <span className="font-bold text-indigo-700">${avgMonthlyCost.toLocaleString()} <span className="text-xs text-green-600 ml-1">(省 {Math.round(monthlyStandardSaving - avgMonthlyCost).toLocaleString()})</span></span>
                      </div>
                      <div className="pt-4 border-t border-indigo-50 mt-2 print:mt-1 print:pt-1">
                           <div className="text-center text-indigo-600 text-sm font-bold flex items-center justify-center gap-2 print:text-[10px]">
                               <TrendingUp size={16} className="print:w-3 print:h-3"/> 獲利空間 {Math.round((netProfit_Wan / totalProjectCost_Wan) * 100)}%
                           </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* 3. 三循環成果關鍵指標 (The Roadmap) - 放在 Benefit 之後 */}
      <div className="print-break-inside">
          <h2 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2 print:text-base print:mb-3">
              <ArrowRight size={24} className="text-indigo-600 print:w-5 print:h-5"/>
              執行藍圖 (三階段演進)
          </h2>
          
          {/* 修改重點：print:flex-row 強制水平排列 */}
          <div className="flex flex-col md:flex-row gap-4 print:flex-row print:gap-3">
              <ResultCard 
                  phase={1} title="累積期" subTitle={`Year 1 - ${loanTerm}`}
                  loanAmount={loanAmount} netOut={phase1_NetOut}
                  totalOut={totalCashOut_T0_T7_Wan} asset={phase1_Asset}
              />
              <ResultCard 
                  phase={2} title="成長期" subTitle={`Year ${loanTerm+1} - ${loanTerm*2}`}
                  loanAmount={c2Loan} netOut={phase2_NetOut}
                  totalOut={totalCashOut_T0_T7_Wan + totalCashOut_T7_T14_Wan} asset={phase2_Asset}
              />
              <ResultCard 
                  phase={3} title="收割期" subTitle={`Year ${loanTerm*2+1} - ${loanTerm*3}`}
                  loanAmount={c3Loan} netOut={phase3_NetOut}
                  totalOut={totalProjectCost_Wan} asset={phase3_Asset}
                  isLast={true}
              />
          </div>
      </div>

      {/* 4. 視覺化圖表 */}
      <div className="space-y-4 print-break-inside">
          <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2 print:text-base print:mb-2">
              <TrendingUp size={24} className="text-indigo-600 print:w-5 print:h-5"/>
              資產成長模擬 ({totalYears}年趨勢)
          </h2>
          {/* 修改：高度設為 280px，不需太小，因為卡片已經並排省下很多空間 */}
          <div className="h-[320px] w-full border border-slate-100 rounded-2xl p-4 bg-white shadow-sm print:h-[280px] print:p-2">
              <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="year" tick={{fontSize: 10}} label={{ value: '年度', position: 'insideBottomRight', offset: -5, fontSize: 10 }} />
                      <YAxis unit="萬" tick={{fontSize: 10}} width={30} />
                      <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }}/>
                      <Area type="monotone" dataKey="資產價值" name="專案資產" stroke="#4f46e5" fill="#e0e7ff" strokeWidth={3} isAnimationActive={false}/>
                      <Line type="monotone" dataKey="實付成本" name="專案成本" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false}/>
                      <Line type="monotone" dataKey="一般存錢" name="傳統存錢" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} dot={false} isAnimationActive={false}/>
                  </ComposedChart>
              </ResponsiveContainer>
          </div>
      </div>

      {/* 強制分頁點：確保第三頁從這裡開始 */}
      <div className="hidden print:block break-before-page"></div>

      {/* 5. 資金防護機制 (Risk & Defense) - 第三頁內容 */}
      <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 print-break-inside print:mt-8">
          <h3 className="font-bold text-emerald-800 text-lg mb-3 flex items-center gap-2">
              <ShieldAlert size={20}/> 資金流動性與安心防護
          </h3>
          <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-3">
                  <p className="text-sm text-emerald-700 leading-relaxed">
                      本計畫運用「投資型保單」進行資產配置。除了追求資產增值外，也兼顧了資金的流動性需求。若在計畫期間有臨時急用（如購屋頭期款、醫療週轉），無需解約即可調度資金。
                  </p>
                  <div className="flex gap-2">
                      <span className="text-xs font-bold text-white bg-emerald-500 px-2 py-1 rounded">保單貸款</span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded border border-emerald-200">緊急預備金功能</span>
                  </div>
              </div>
              <div className="flex-1 bg-white/60 rounded-xl p-4 border border-emerald-100 text-sm space-y-2">
                  <div className="flex justify-between items-center">
                      <span className="text-slate-600 flex items-center gap-1"><Banknote size={14}/> 最高借貸成數</span>
                      <span className="font-bold text-slate-700">保單價值 50%</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-slate-600 flex items-center gap-1"><Percent size={14}/> 借貸利率</span>
                      <span className="font-bold text-slate-700">約 4% (浮動)</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-slate-600 flex items-center gap-1"><Clock size={14}/> 還款方式</span>
                      <span className="font-bold text-slate-700">彈性 (可只繳息)</span>
                  </div>
              </div>
          </div>
          <p className="text-xs text-emerald-600/70 mt-3 pt-3 border-t border-emerald-200">
              * 顧問叮嚀：從銀行借貸出來的資金在期滿前屬於槓桿部位，建議保單貸款功能僅作為「緊急預備金」使用，確保計畫完整執行。
          </p>
      </div>

      {/* 6. 顧問總結 */}
      <div className="bg-slate-50 p-6 rounded-2xl border-l-4 border-indigo-500 print-break-inside">
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
