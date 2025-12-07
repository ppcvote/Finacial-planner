import React, { useState } from 'react';
import { 
  Wallet, 
  Calculator, 
  Gift, 
  Repeat, 
  TrendingUp, 
  CheckCircle2, 
  RefreshCw,
  PiggyBank,
  Coins,
  ArrowRightLeft
} from 'lucide-react';
import { ResponsiveContainer, ComposedChart, Area, Line, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

// --- 內建計算函式 ---
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
  // 假設投資配息為年化配息率 / 12，且是針對 principal * 10000 (萬轉元)
  return (p * 10000 * (r / 100)) / 12; 
};

// ------------------------------------------------------------------
// 輔助組件: 循環結果卡片 (統一化樣式)
// ------------------------------------------------------------------
const ResultCard = ({ phase, period, netOut, asset, totalOut, netProfitTotal, isFinal = false, loanTerm, isCompoundMode }: any) => {
    const color = phase === 1 ? 'blue' : phase === 2 ? 'indigo' : 'purple';
    const bgColor = phase === 1 ? 'bg-blue-50' : phase === 2 ? 'bg-indigo-50' : 'bg-purple-50';
    const borderColor = phase === 1 ? 'border-blue-200' : phase === 2 ? 'border-indigo-200' : 'border-purple-200';
    const icon = phase === 1 ? '01' : phase === 2 ? '02' : '03';

    return (
      <div className={`p-6 rounded-2xl shadow-lg border ${borderColor} ${bgColor} flex flex-col justify-between`}>
        <div>
            <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
            <h3 className={`font-black text-xl text-${color}-700`}>階段 {icon}</h3>
            <span className="text-xs font-bold text-slate-500">{period}</span>
            </div>
            
            <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 font-medium">
                    {isCompoundMode ? '每月全額負擔' : '每月實質淨負擔'}
                </span>
                <span className={`text-xl font-bold font-mono ${netOut > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${Math.round(netOut).toLocaleString()}
                </span>
            </div>
            
            <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100">
                <span className="text-slate-600 font-medium">期末資產規模 (萬)</span>
                <span className="text-2xl font-black text-indigo-700 font-mono">{asset.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 font-medium">本期實質總付出 (萬)</span>
                <span className={`text-lg font-bold font-mono ${totalOut > 0 ? 'text-red-500' : 'text-green-600'}`}>
                    {totalOut.toLocaleString()} 萬
                </span>
            </div>
            </div>
        </div>

        {isFinal && (
            <div className="mt-4 pt-3 border-t-2 border-dashed border-gray-300">
            <div className="flex justify-between items-center">
                <span className="text-slate-700 font-bold">總淨獲利</span>
                <span className={`text-2xl font-black font-mono ${netProfitTotal > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {netProfitTotal.toLocaleString()} 萬
                </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 text-right">({loanTerm * 3}年總資產 - 總成本)</p>
            </div>
        )}
      </div>
    );
  };
// ------------------------------------------------------------------

const MillionDollarGiftTool = ({ data, setData }: any) => {
  const safeData = {
    loanAmount: Number(data?.loanAmount) || 100,
    loanTerm: Number(data?.loanTerm) || 7, // 假設信貸期數為 7 年
    loanRate: Number(data?.loanRate) || 2.8,
    investReturnRate: Number(data?.investReturnRate) || 6
  };
  const { loanAmount, loanTerm, loanRate, investReturnRate } = safeData;

  // 新增狀態：是否開啟複利模式 (回滾利息)
  const [isCompoundMode, setIsCompoundMode] = useState(false);

  // --- 計算邏輯 ---
  const monthlyLoanPayment = calculateMonthlyPayment(loanAmount, loanRate, loanTerm);
  const monthlyInvestIncomeSingle = calculateMonthlyIncome(loanAmount, investReturnRate);
  
  // 計算各階段的資產成長與現金流
  let phase1_Asset, phase2_Asset, phase3_Asset;
  let phase1_NetOut, phase2_NetOut, phase3_NetOut;

  // 輔助計算：複利終值因子 (單一週期)
  // 若是複利模式，資產會成長：Principal * (1 + monthlyRate)^(years*12)
  // 這裡簡化假設：每年複利一次或每月複利 (使用月利率較準)
  const monthlyRate = investReturnRate / 100 / 12;
  const totalMonthsPerCycle = loanTerm * 12;
  const compoundFactor = Math.pow(1 + monthlyRate, totalMonthsPerCycle);

  if (isCompoundMode) {
      // --- 複利模式 (利息滾入本金，不拿出來繳貸) ---
      // 負擔：使用者需全額支付貸款月付金
      phase1_NetOut = monthlyLoanPayment;
      phase2_NetOut = monthlyLoanPayment; 
      phase3_NetOut = monthlyLoanPayment; 
      
      // 資產：期初本金 * 複利因子
      // 第一階段結束：本金100 -> 滾存
      phase1_Asset = Math.round(loanAmount * compoundFactor);
      
      // 第二階段結束：(第一階段資產 + 新貸100) -> 滾存
      phase2_Asset = Math.round((phase1_Asset + loanAmount) * compoundFactor);
      
      // 第三階段結束：(第二階段資產 + 新貸100) -> 滾存
      phase3_Asset = Math.round((phase2_Asset + loanAmount) * compoundFactor);

  } else {
      // --- 現金流模式 (以息養貸) ---
      // 負擔：貸款月付金 - 配息
      phase1_NetOut = monthlyLoanPayment - monthlyInvestIncomeSingle;
      phase2_NetOut = monthlyLoanPayment - (monthlyInvestIncomeSingle * 2);
      phase3_NetOut = monthlyLoanPayment - (monthlyInvestIncomeSingle * 3);

      // 資產：線性疊加 (配息領出，本金不變)
      phase1_Asset = loanAmount * 1;
      phase2_Asset = loanAmount * 2;
      phase3_Asset = loanAmount * 3;
  }

  // --- 總付出計算邏輯 (萬為單位) ---
  const monthsPerCycle = loanTerm * 12;

  const totalCashOut_T0_T7_Raw = phase1_NetOut * monthsPerCycle;
  const totalCashOut_T0_T7_Wan = Math.round(totalCashOut_T0_T7_Raw / 10000);

  const totalCashOut_T7_T14_Raw = phase2_NetOut * monthsPerCycle;
  const totalCashOut_T7_T14_Wan = Math.round(totalCashOut_T7_T14_Raw / 10000);

  const totalCashOut_T14_T21_Raw = phase3_NetOut * monthsPerCycle;
  const totalCashOut_T14_T21_Wan = Math.round(totalCashOut_T14_T21_Raw / 10000);
  
  // 21 年總實質付出 (T0-T21)
  const totalProjectCost_Wan = totalCashOut_T0_T7_Wan + totalCashOut_T7_T14_Wan + totalCashOut_T14_T21_Wan;
  
  // 21 年後的最終資產 (第三階段結束)
  const finalAssetValue_Wan = phase3_Asset;
  
  // 21 年淨獲利 (資產 - 總實質付出)
  const netProfit_Wan = finalAssetValue_Wan - totalProjectCost_Wan;
  
  // --- 一般存錢成本比較 ---
  // 目標：要達到「專案最終資產 (finalAssetValue_Wan)」，一般存錢需要存多少？
  // 這裡定義「一般存錢成本」=「目標資產金額」 (假設一般存錢無利息，或利息極低被通膨抵銷，呈現最保守比較)
  const standardCost_Wan = finalAssetValue_Wan;

  // 節省金額
  const savedAmount_Wan = standardCost_Wan - totalProjectCost_Wan;

  // --- 圖表數據生成 ---
  const generateChartData = () => {
    const dataArr = [];
    let cumulativeStandard = 0;
    let cumulativeProjectCost = 0;
    
    // 一般存錢每月需存金額 (為了在 totalYears 達到 finalAssetValue_Wan)
    const totalYears = loanTerm * 3; 
    const standardMonthlySaving = (finalAssetValue_Wan * 10000) / (totalYears * 12); 

    // 模擬資產成長曲線 (用於圖表顯示)
    let currentAssetValue = 0;

    for (let year = 1; year <= totalYears; year++) {
      // 一般存錢累積
      cumulativeStandard += standardMonthlySaving * 12;
      
      let currentPhaseNetOut;
      
      // 計算該年度的資產價值與成本
      if (year <= loanTerm) {
        currentPhaseNetOut = phase1_NetOut;
        if(isCompoundMode) {
            // 簡化模擬：每年成長
            currentAssetValue = (loanAmount * 10000) * Math.pow(1 + monthlyRate, year * 12);
        } else {
            currentAssetValue = loanAmount * 10000;
        }
      } else if (year <= loanTerm * 2) {
        currentPhaseNetOut = phase2_NetOut;
        if(isCompoundMode) {
             const prevAsset = phase1_Asset * 10000;
             const yearsInPhase2 = year - loanTerm;
             currentAssetValue = (prevAsset + loanAmount * 10000) * Math.pow(1 + monthlyRate, yearsInPhase2 * 12);
        } else {
            currentAssetValue = loanAmount * 2 * 10000;
        }
      } else {
        currentPhaseNetOut = phase3_NetOut; 
        if(isCompoundMode) {
            const prevAsset = phase2_Asset * 10000;
            const yearsInPhase3 = year - loanTerm * 2;
            currentAssetValue = (prevAsset + loanAmount * 10000) * Math.pow(1 + monthlyRate, yearsInPhase3 * 12);
        } else {
            currentAssetValue = loanAmount * 3 * 10000;
        }
      }

      cumulativeProjectCost += currentPhaseNetOut * 12;
      
      dataArr.push({
        year: `第${year}年`,
        一般存錢累積: Math.round(cumulativeStandard / 10000),
        專案實付成本: Math.round(cumulativeProjectCost / 10000),
        專案持有資產: Math.round(currentAssetValue / 10000),
      });
    }
    return dataArr;
  };

  const updateField = (field: string, value: number) => { 
      if (field === 'investReturnRate') {
          setData({ ...safeData, [field]: Number(value.toFixed(1)) });
      } else {
          if (field === 'loanAmount') {
             const clampedValue = Math.max(10, Math.min(500, Number(value)));
             setData({ ...safeData, [field]: Math.round(clampedValue) }); 
          } else {
            setData({ ...safeData, [field]: Number(value) }); 
          }
      }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans text-slate-800">
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden print-break-inside">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Gift size={180} />
        </div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-sm">
                    Asset Accumulation
                    </span>
                    <span className="bg-yellow-400/20 text-yellow-100 px-3 py-1 rounded-full text-xs font-bold tracking-wider backdrop-blur-sm border border-yellow-400/30">
                    循環槓桿・資產倍增
                    </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight flex items-center gap-3">
                    百萬禮物專案
                </h1>
                <p className="text-indigo-100 text-lg opacity-90 max-w-2xl">
                    透過三次循環操作，用時間換取資產。送給未來的自己，或是孩子最棒的成年禮。
                </p>
              </div>

              {/* Toggle Switch */}
              <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-xl border border-white/20 flex gap-1 self-start md:self-center">
                  <button 
                     onClick={() => setIsCompoundMode(false)}
                     className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${!isCompoundMode ? 'bg-white text-indigo-600 shadow-sm' : 'text-indigo-100 hover:bg-white/10'}`}
                  >
                     <Coins size={16}/> 現金流模式 (領息)
                  </button>
                  <button 
                     onClick={() => setIsCompoundMode(true)}
                     className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${isCompoundMode ? 'bg-white text-purple-600 shadow-sm' : 'text-purple-100 hover:bg-white/10'}`}
                  >
                     <RefreshCw size={16}/> 複利模式 (滾入)
                  </button>
              </div>
          </div>
        </div>
      </div>

      {/* --- 新增：成本效益比較卡片區 --- */}
      <div className="grid md:grid-cols-3 gap-6 print-break-inside">
         {/* 卡片 1: 一般存錢成本 */}
         <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden group hover:border-slate-300 transition-all">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <PiggyBank size={80} className="text-slate-600"/>
             </div>
             <h3 className="text-slate-500 text-sm font-bold mb-1">獲得相同資產 - 一般存錢成本</h3>
             <div className="text-xs text-slate-400 mb-4">目標資產：{finalAssetValue_Wan} 萬</div>
             <p className="text-3xl font-black text-slate-700 font-mono">
                 ${standardCost_Wan.toLocaleString()} <span className="text-lg text-slate-500">萬</span>
             </p>
             <p className="text-xs text-slate-500 mt-2 bg-slate-100 inline-block px-2 py-1 rounded">
                需準備全額本金
             </p>
         </div>

         {/* 卡片 2: 專案成本 */}
         <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden group hover:border-indigo-300 transition-all">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Wallet size={80} className="text-indigo-600"/>
             </div>
             <h3 className="text-indigo-600 text-sm font-bold mb-1">百萬禮物專案 - 實付成本</h3>
             <div className="text-xs text-indigo-400 mb-4">累積 {loanTerm*3} 年總支出</div>
             <p className="text-3xl font-black text-indigo-600 font-mono">
                 ${totalProjectCost_Wan.toLocaleString()} <span className="text-lg text-indigo-400">萬</span>
             </p>
             <p className="text-xs text-indigo-600 mt-2 bg-indigo-50 inline-block px-2 py-1 rounded">
                槓桿效益：用小錢換大錢
             </p>
         </div>

         {/* 卡片 3: 差額 (省下/獲利) */}
         <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 shadow-sm border border-emerald-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingUp size={80} className="text-emerald-600"/>
             </div>
             <h3 className="text-emerald-700 text-sm font-bold mb-1">專案創造價值 (省下本金)</h3>
             <div className="text-xs text-emerald-600/70 mb-4">一般存錢 vs 專案成本</div>
             <p className="text-4xl font-black text-emerald-600 font-mono">
                 ${savedAmount_Wan.toLocaleString()} <span className="text-lg text-emerald-500">萬</span>
             </p>
             <p className="text-xs text-emerald-700 mt-2 bg-emerald-100/50 inline-block px-2 py-1 rounded font-bold">
                您的獲利空間
             </p>
         </div>
      </div>


      <div className="grid lg:grid-cols-12 gap-8">
        {/* 左側：參數設定與摘要 */}
        <div className="lg:col-span-4 space-y-6 print-break-inside">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
              <Calculator size={20} className="text-indigo-600"/> 
              參數設定
            </h4>
            <div className="space-y-6">
               
               {/* --- 1. 單次借貸額度 --- */}
               <div>
                   <div className="flex justify-between items-center mb-2">
                       <label className="text-sm font-medium text-slate-600">單次借貸額度 (萬)</label>
                       <div className="flex items-center">
                           <input 
                               type="number" 
                               min={10} 
                               max={500} 
                               step={1}
                               value={loanAmount} 
                               onChange={(e) => updateField('loanAmount', Number(e.target.value))} 
                               className="w-16 text-right bg-transparent border-none p-0 font-mono font-bold text-blue-600 text-lg focus:ring-0 focus:border-blue-500 focus:bg-blue-50/50 rounded"
                               style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                           />
                           <span className="font-mono font-bold text-blue-600 text-lg ml-1">萬</span>
                       </div>
                   </div>
                   <input 
                       type="range" 
                       min={10} 
                       max={500} 
                       step={1}
                       value={loanAmount} 
                       onChange={(e) => updateField('loanAmount', Number(e.target.value))} 
                       className={`w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700 transition-all`} 
                   />
               </div>

               {/* 其他參數 */}
               {[
                 { label: "信貸利率 (%)", field: "loanRate", min: 1.5, max: 15.0, step: 0.1, val: loanRate, color: "indigo", unit: "%" },
                 { label: "投資年化報酬 (%)", field: "investReturnRate", min: 3, max: 12, step: 0.1, val: investReturnRate, color: "purple", unit: "%" }
               ].map((item) => (
                 <div key={item.field}>
                   <div className="flex justify-between mb-2">
                     <label className="text-sm font-medium text-slate-600">{item.label}</label>
                     <span className={`font-mono font-bold text-${item.color}-600 text-lg`}>{item.val.toFixed(1)}{item.unit}</span>
                   </div>
                   <input type="range" min={item.min} max={item.max} step={item.step} value={item.val} onChange={(e) => updateField(item.field, Number(e.target.value))} className={`w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-${item.color}-600 hover:accent-${item.color}-700 transition-all`} />
                 </div>
               ))}
            </div>
            
            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
               <div>
                  <div className="text-xs text-slate-500 mb-1">最終資產目標</div>
                  <div className="text-lg font-bold text-indigo-600">{finalAssetValue_Wan.toLocaleString()} 萬</div>
               </div>
               <div>
                   <div className="text-xs text-slate-500 mb-1">專案總時程</div>
                   <div className="text-lg font-bold text-slate-700">{loanTerm * 3} 年</div>
               </div>
            </div>
          </div>
        </div>

        {/* 右側：圖表展示 */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[400px] print-break-inside relative">
             <div className="flex justify-between items-center mb-4 pl-2 border-l-4 border-indigo-500">
                <h4 className="font-bold text-slate-700">資產累積三階段 ({loanTerm * 3}年趨勢)</h4>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                    目前模式：{isCompoundMode ? '複利滾存' : '現金流領息'}
                </span>
             </div>
            <ResponsiveContainer width="100%" height="90%">
              <ComposedChart data={generateChartData()} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorAssetGift" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis unit="萬" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}} itemStyle={{padding: '2px 0'}} />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="專案持有資產" stroke="#6366f1" fill="url(#colorAssetGift)" strokeWidth={3} />
                <Bar dataKey="一般存錢累積" fill="#cbd5e1" barSize={12} radius={[4,4,0,0]} />
                <Line type="monotone" dataKey="專案實付成本" stroke="#f59e0b" strokeWidth={3} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- 三個循環的結果對比區 --- */}
      <div className="pt-6 border-t border-slate-200">
         <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Repeat className="text-indigo-600" size={24} /> 三循環成果關鍵指標
         </h2>
         <div className="grid md:grid-cols-3 gap-6">
            <ResultCard 
               phase={1} 
               period={`T0 - T${loanTerm} (累積期)`}
               netOut={phase1_NetOut}
               asset={phase1_Asset}
               totalOut={totalCashOut_T0_T7_Wan}
               loanTerm={loanTerm}
               isCompoundMode={isCompoundMode}
            />
            <ResultCard 
               phase={2} 
               period={`T${loanTerm} - T${loanTerm * 2} (成長期)`}
               netOut={phase2_NetOut}
               asset={phase2_Asset}
               totalOut={totalCashOut_T7_T14_Wan}
               loanTerm={loanTerm}
               isCompoundMode={isCompoundMode}
            />
            <ResultCard 
               phase={3} 
               period={`T${loanTerm * 2} - T${loanTerm * 3} (收穫期)`}
               netOut={phase3_NetOut}
               asset={phase3_Asset}
               totalOut={totalCashOut_T14_T21_Wan}
               netProfitTotal={netProfit_Wan}
               isFinal={true}
               loanTerm={loanTerm}
               isCompoundMode={isCompoundMode}
            />
         </div>
      </div>

      {/* Strategy Section: 策略說明 */}
      <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-slate-200 print-break-inside">
        
        {/* 1. 執行循環 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
             <RefreshCw className="text-indigo-600" size={24} />
             <h3 className="text-xl font-bold text-slate-800">執行三部曲 ({loanTerm * 3}年計畫)</h3>
          </div>
          
          <div className="space-y-3">
             <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-blue-200 transition-colors">
                <div className="mt-1 min-w-[3rem] h-12 rounded-xl bg-blue-50 text-blue-600 flex flex-col items-center justify-center font-bold text-xs">
                   <span className="text-lg">01</span>
                   <span>啟動</span>
                </div>
                <div>
                   <h4 className="font-bold text-slate-800 flex items-center gap-2">累積期 (第1-{loanTerm}年)</h4>
                   <p className="text-sm text-slate-600 mt-1">借入第一筆資金。{isCompoundMode ? '將配息全數滾入再投資，加速本金累積。' : '配息幫忙繳部分貸款，只需負擔差額，無痛累積。'}</p>
                </div>
             </div>

             <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-indigo-200 transition-colors">
                <div className="mt-1 min-w-[3rem] h-12 rounded-xl bg-indigo-50 text-indigo-600 flex flex-col items-center justify-center font-bold text-xs">
                   <span className="text-lg">02</span>
                   <span>成長</span>
                </div>
                <div>
                   <h4 className="font-bold text-slate-800 flex items-center gap-2">循環期 (第{loanTerm + 1}-{loanTerm * 2}年)</h4>
                   <p className="text-sm text-slate-600 mt-1">償還第一筆後再次借出，資產規模翻倍。{isCompoundMode ? '複利效應開始顯著發威。' : '雙倍配息讓月付金大幅降低。'}</p>
                </div>
             </div>

             <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-purple-200 transition-colors">
                <div className="mt-1 min-w-[3rem] h-12 rounded-xl bg-purple-50 text-purple-600 flex flex-col items-center justify-center font-bold text-xs">
                   <span className="text-lg">03</span>
                   <span>收割</span>
                </div>
                <div>
                   <h4 className="font-bold text-slate-800 flex items-center gap-2">收穫期 (第{loanTerm * 2 + 1}-{loanTerm * 3}年)</h4>
                   <p className="text-sm text-slate-600 mt-1">第三次操作。{isCompoundMode ? '資產呈現指數級爆發，創造驚人財富。' : '三份配息通常已超過貸款月付，產生正向現金流。'}</p>
                </div>
             </div>
          </div>
        </div>

        {/* 2. 專案效益 */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 mb-2">
             <TrendingUp className="text-indigo-600" size={24} />
             <h3 className="text-xl font-bold text-slate-800">專案四大效益</h3>
           </div>
           
           <div className="grid grid-cols-1 gap-3">
              {[
                { title: "時間槓桿", desc: `不需等到存夠錢才投資，直接借入未來財富，讓複利效應提早${loanTerm}年啟動。` },
                { title: "強迫儲蓄", desc: "將「隨意花費」轉為「固定還款」，每月收到帳單就是最好的存錢提醒。" },
                { title: isCompoundMode ? "複利爆發" : "無痛累積", desc: isCompoundMode ? "透過股息再投入，讓資產像滾雪球般越滾越大，發揮複利最大威力。" : "利用配息Cover大部分還款，用比一般存錢更少的現金流，換取更大的資產。" },
                { title: "信用培養", desc: `長達${loanTerm * 3}年的優良還款紀錄，將使您成為銀行眼中的頂級優質客戶。` }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-indigo-50/50 transition-colors">
                  <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-bold text-slate-800">{item.title}</h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
           </div>

           <div className="mt-6 p-4 bg-slate-800 rounded-xl text-center shadow-lg">
             <p className="text-slate-300 italic text-sm">
               「給孩子的不是一筆錢，而是一套會長大的資產，以及受用一生的理財智慧。」
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MillionDollarGiftTool;