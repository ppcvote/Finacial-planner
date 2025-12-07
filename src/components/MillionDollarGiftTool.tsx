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
  Settings,    // 新增
  ChevronDown, // 新增
  ChevronUp    // 新增
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
const ResultCard = ({ phase, period, netOut, asset, totalOut, netProfitTotal, isFinal = false, loanTerm, isCompoundMode, loanAmount, rate }: any) => {
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
                 <span className="text-slate-600 font-medium">新增貸款 / 利率</span>
                 <span className={`font-bold text-${color}-600`}>{loanAmount}萬 / {rate}%</span>
            </div>

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
    investReturnRate: Number(data?.investReturnRate) || 6,
    // 進階參數：若無設定，預設為 undefined，計算時會 fallback 回第一循環的數值
    cycle2Loan: data?.cycle2Loan !== undefined ? Number(data.cycle2Loan) : undefined,
    cycle2Rate: data?.cycle2Rate !== undefined ? Number(data.cycle2Rate) : undefined,
    cycle3Loan: data?.cycle3Loan !== undefined ? Number(data.cycle3Loan) : undefined,
    cycle3Rate: data?.cycle3Rate !== undefined ? Number(data.cycle3Rate) : undefined,
  };
  
  const { loanAmount, loanTerm, loanRate, investReturnRate } = safeData;

  // 決定實際使用的參數 (若進階參數未設定，則使用第一循環參數)
  const c2Loan = safeData.cycle2Loan !== undefined ? safeData.cycle2Loan : loanAmount;
  const c2Rate = safeData.cycle2Rate !== undefined ? safeData.cycle2Rate : loanRate;
  const c3Loan = safeData.cycle3Loan !== undefined ? safeData.cycle3Loan : loanAmount;
  const c3Rate = safeData.cycle3Rate !== undefined ? safeData.cycle3Rate : loanRate;

  // 新增狀態：是否開啟複利模式 (回滾利息)
  const [isCompoundMode, setIsCompoundMode] = useState(false);
  // 新增狀態：是否顯示進階設定
  const [showAdvanced, setShowAdvanced] = useState(false);

  // --- 計算邏輯 (針對每一筆貸款獨立計算) ---
  
  // 1. 各筆貸款的月付金
  const payment1 = calculateMonthlyPayment(loanAmount, loanRate, loanTerm);
  const payment2 = calculateMonthlyPayment(c2Loan, c2Rate, loanTerm);
  const payment3 = calculateMonthlyPayment(c3Loan, c3Rate, loanTerm);

  // 2. 各筆貸款對應的月配息 (假設投入金額 = 貸款金額)
  const income1 = calculateMonthlyIncome(loanAmount, investReturnRate);
  const income2 = calculateMonthlyIncome(c2Loan, investReturnRate);
  const income3 = calculateMonthlyIncome(c3Loan, investReturnRate);
  
  // 3. 計算各階段的資產與現金流
  let phase1_Asset, phase2_Asset, phase3_Asset;
  let phase1_NetOut, phase2_NetOut, phase3_NetOut;

  // 輔助計算：複利終值因子 (單一週期)
  const monthlyRate = investReturnRate / 100 / 12;
  const totalMonthsPerCycle = loanTerm * 12;
  const compoundFactor = Math.pow(1 + monthlyRate, totalMonthsPerCycle);

  if (isCompoundMode) {
      // --- 複利模式 ---
      // 負擔：使用者需全額支付貸款月付金 (不拿配息出來)
      phase1_NetOut = payment1;
      phase2_NetOut = payment1 + payment2; // 假設第一筆續貸或重貸? 這裡簡化為累積負債概念：手上同時背負的貸款
      // 但專案邏輯通常是：還完第一筆，再借第二筆。
      // 如果是「循環」，代表 T7 時第一筆已還完。
      // 所以 Phase 2 的負擔應該只有 payment2 (因為 Loan1 已清償)
      // Phase 3 的負擔應該只有 payment3 (因為 Loan2 已清償)
      
      // 修正邏輯：這是「循環」操作，前債已清。
      phase1_NetOut = payment1;
      phase2_NetOut = payment2; 
      phase3_NetOut = payment3; 
      
      // 資產：期初本金 * 複利因子
      // Phase 1 結束資產
      phase1_Asset = Math.round(loanAmount * compoundFactor);
      
      // Phase 2 結束資產 = (Phase 1 結束資產 + Phase 2 新本金) * 複利
      phase2_Asset = Math.round((phase1_Asset + c2Loan) * compoundFactor);
      
      // Phase 3 結束資產 = (Phase 2 結束資產 + Phase 3 新本金) * 複利
      phase3_Asset = Math.round((phase2_Asset + c3Loan) * compoundFactor);

  } else {
      // --- 現金流模式 (以息養貸) ---
      // 資產累積 (線性)：本金不變，配息領出繳貸
      // P1 結束時持有: Loan1
      // P2 結束時持有: Loan1 + Loan2
      // P3 結束時持有: Loan1 + Loan2 + Loan3
      
      phase1_Asset = loanAmount;
      phase2_Asset = loanAmount + c2Loan;
      phase3_Asset = loanAmount + c2Loan + c3Loan;

      // 負擔：
      // Phase 1: 繳 Loan1, 領 Income1
      phase1_NetOut = payment1 - income1;

      // Phase 2: 繳 Loan2 (Loan1已還完), 領 Income1 + Income2 (Loan1留下的資產繼續配息)
      phase2_NetOut = payment2 - (income1 + income2);

      // Phase 3: 繳 Loan3, 領 Income1 + Income2 + Income3
      phase3_NetOut = payment3 - (income1 + income2 + income3);
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
  const standardCost_Wan = finalAssetValue_Wan; // 目標資產
  const savedAmount_Wan = standardCost_Wan - totalProjectCost_Wan;

  // --- 每月平均需要存多少 ---
  const totalYears = loanTerm * 3;
  const monthlyStandardSaving = Math.round((finalAssetValue_Wan * 10000) / (totalYears * 12));
  const monthlyProjectCost = Math.round((totalProjectCost_Wan * 10000) / (totalYears * 12));


  // --- 圖表數據生成 ---
  const generateChartData = () => {
    const dataArr = [];
    let cumulativeStandard = 0;
    let cumulativeProjectCost = 0;
    
    // 一般存錢每月需存金額
    const standardMonthlySaving = (finalAssetValue_Wan * 10000) / (totalYears * 12); 

    // 模擬資產成長曲線 (用於圖表顯示)
    let currentAssetValue = 0;

    for (let year = 1; year <= totalYears; year++) {
      // 一般存錢累積
      cumulativeStandard += standardMonthlySaving * 12;
      
      let currentPhaseNetOut;
      
      // 計算該年度的資產價值與成本
      if (year <= loanTerm) {
        // Phase 1
        currentPhaseNetOut = phase1_NetOut;
        if(isCompoundMode) {
            currentAssetValue = (loanAmount * 10000) * Math.pow(1 + monthlyRate, year * 12);
        } else {
            currentAssetValue = loanAmount * 10000;
        }
      } else if (year <= loanTerm * 2) {
        // Phase 2
        currentPhaseNetOut = phase2_NetOut;
        if(isCompoundMode) {
             const prevAsset = phase1_Asset * 10000; // T7 結束時的金額
             const yearsInPhase2 = year - loanTerm;
             // Phase 2 起點本金 = Phase 1 結束 + 新增 c2Loan
             const startPrincipalP2 = prevAsset + (c2Loan * 10000);
             currentAssetValue = startPrincipalP2 * Math.pow(1 + monthlyRate, yearsInPhase2 * 12);
        } else {
            currentAssetValue = (loanAmount + c2Loan) * 10000;
        }
      } else {
        // Phase 3
        currentPhaseNetOut = phase3_NetOut; 
        if(isCompoundMode) {
            const prevAsset = phase2_Asset * 10000;
            const yearsInPhase3 = year - loanTerm * 2;
            const startPrincipalP3 = prevAsset + (c3Loan * 10000);
            currentAssetValue = startPrincipalP3 * Math.pow(1 + monthlyRate, yearsInPhase3 * 12);
        } else {
            currentAssetValue = (loanAmount + c2Loan + c3Loan) * 10000;
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
      if (field === 'investReturnRate' || field.includes('Rate')) {
          setData({ ...safeData, [field]: Number(value.toFixed(1)) });
      } else {
          if (field.includes('Amount') || field.includes('Loan')) {
             const clampedValue = Math.max(10, Math.min(1000, Number(value)));
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

      {/* --- 成本效益比較卡片區 --- */}
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
             <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                   需準備全額本金
                </span>
                <span className="text-sm font-bold text-slate-600">
                   月存 ${monthlyStandardSaving.toLocaleString()}
                </span>
             </div>
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
             <div className="mt-3 flex items-center justify-between border-t border-indigo-50 pt-3">
                <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                   槓桿效益
                </span>
                <span className="text-sm font-bold text-indigo-600">
                   平均月存 ${monthlyProjectCost.toLocaleString()}
                </span>
             </div>
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
               
               {/* --- 基礎設定 --- */}
               <div className="pb-4 border-b border-slate-100">
                   <div className="flex items-center gap-2 mb-3">
                       <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">1</span>
                       <span className="text-sm font-bold text-slate-700">第一循環 (基礎設定)</span>
                   </div>

                   {/* 金額 */}
                   <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-sm font-medium text-slate-600">單次借貸額度 (萬)</label>
                            <div className="flex items-center">
                                <input 
                                    type="number" 
                                    min={10} 
                                    max={1000} 
                                    step={10}
                                    value={loanAmount} 
                                    onChange={(e) => updateField('loanAmount', Number(e.target.value))} 
                                    className="w-16 text-right bg-transparent border-none p-0 font-mono font-bold text-blue-600 text-lg focus:ring-0 focus:border-blue-500 focus:bg-blue-50/50 rounded"
                                />
                                <span className="font-mono font-bold text-blue-600 text-lg ml-1">萬</span>
                            </div>
                        </div>
                        <input 
                            type="range" 
                            min={10} 
                            max={500} 
                            step={10}
                            value={loanAmount} 
                            onChange={(e) => updateField('loanAmount', Number(e.target.value))} 
                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                        />
                   </div>

                   {/* 利率 */}
                   <div>
                        <div className="flex justify-between mb-1">
                            <label className="text-sm font-medium text-slate-600">信貸利率 (%)</label>
                            <span className="font-mono font-bold text-indigo-600 text-lg">{loanRate.toFixed(1)}%</span>
                        </div>
                        <input 
                            type="range" 
                            min={1.5} 
                            max={10.0} 
                            step={0.1} 
                            value={loanRate} 
                            onChange={(e) => updateField('loanRate', Number(e.target.value))} 
                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                        />
                   </div>
               </div>
               
               {/* 投資報酬率 (共用) */}
               <div>
                 <div className="flex justify-between mb-1">
                     <label className="text-sm font-medium text-slate-600">投資年化報酬 (%)</label>
                     <span className="font-mono font-bold text-purple-600 text-lg">{investReturnRate.toFixed(1)}%</span>
                 </div>
                 <input type="range" min={3} max={12} step={0.1} value={investReturnRate} onChange={(e) => updateField('investReturnRate', Number(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600" />
               </div>

               {/* --- 進階設定按鈕 --- */}
               <button 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                    showAdvanced 
                      ? 'bg-slate-50 border-slate-300 text-slate-800' 
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
               >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Settings size={16} />
                    進階設定 (後續循環參數)
                  </div>
                  {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
               </button>

               {/* --- 進階設定面板 --- */}
               {showAdvanced && (
                 <div className="space-y-6 animate-in slide-in-from-top-2 duration-300 pt-2">
                    
                    {/* 第二循環 */}
                    <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">2</span>
                            <span className="text-sm font-bold text-indigo-900">第二循環參數</span>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-xs text-slate-500 mb-1">
                                    <span>貸款金額</span>
                                    <span className="font-bold text-indigo-700">{c2Loan} 萬</span>
                                </div>
                                <input 
                                    type="range" min={10} max={500} step={10} 
                                    value={c2Loan} 
                                    onChange={(e) => updateField('cycle2Loan', Number(e.target.value))} 
                                    className="w-full h-1.5 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                                />
                            </div>
                            <div>
                                <div className="flex justify-between text-xs text-slate-500 mb-1">
                                    <span>貸款利率</span>
                                    <span className="font-bold text-indigo-700">{c2Rate}%</span>
                                </div>
                                <input 
                                    type="range" min={1.5} max={10} step={0.1} 
                                    value={c2Rate} 
                                    onChange={(e) => updateField('cycle2Rate', Number(e.target.value))} 
                                    className="w-full h-1.5 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* 第三循環 */}
                    <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">3</span>
                            <span className="text-sm font-bold text-purple-900">第三循環參數</span>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-xs text-slate-500 mb-1">
                                    <span>貸款金額</span>
                                    <span className="font-bold text-purple-700">{c3Loan} 萬</span>
                                </div>
                                <input 
                                    type="range" min={10} max={500} step={10} 
                                    value={c3Loan} 
                                    onChange={(e) => updateField('cycle3Loan', Number(e.target.value))} 
                                    className="w-full h-1.5 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600" 
                                />
                            </div>
                            <div>
                                <div className="flex justify-between text-xs text-slate-500 mb-1">
                                    <span>貸款利率</span>
                                    <span className="font-bold text-purple-700">{c3Rate}%</span>
                                </div>
                                <input 
                                    type="range" min={1.5} max={10} step={0.1} 
                                    value={c3Rate} 
                                    onChange={(e) => updateField('cycle3Rate', Number(e.target.value))} 
                                    className="w-full h-1.5 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600" 
                                />
                            </div>
                        </div>
                    </div>

                 </div>
               )}

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
                <div className="flex gap-2">
                    {showAdvanced && (
                         <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                            已啟用進階設定
                        </span>
                    )}
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                        模式：{isCompoundMode ? '複利滾存' : '現金流領息'}
                    </span>
                </div>
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
               loanAmount={loanAmount}
               rate={loanRate}
            />
            <ResultCard 
               phase={2} 
               period={`T${loanTerm} - T${loanTerm * 2} (成長期)`}
               netOut={phase2_NetOut}
               asset={phase2_Asset}
               totalOut={totalCashOut_T7_T14_Wan}
               loanTerm={loanTerm}
               isCompoundMode={isCompoundMode}
               loanAmount={c2Loan}
               rate={c2Rate}
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
               loanAmount={c3Loan}
               rate={c3Rate}
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
                   <p className="text-sm text-slate-600 mt-1">償還第一筆後再次借出{c2Loan}萬，資產規模翻倍。{isCompoundMode ? '複利效應開始顯著發威。' : '雙倍配息讓月付金大幅降低。'}</p>
                </div>
             </div>

             <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-purple-200 transition-colors">
                <div className="mt-1 min-w-[3rem] h-12 rounded-xl bg-purple-50 text-purple-600 flex flex-col items-center justify-center font-bold text-xs">
                   <span className="text-lg">03</span>
                   <span>收割</span>
                </div>
                <div>
                   <h4 className="font-bold text-slate-800 flex items-center gap-2">收穫期 (第{loanTerm * 2 + 1}-{loanTerm * 3}年)</h4>
                   <p className="text-sm text-slate-600 mt-1">第三次操作投入{c3Loan}萬。{isCompoundMode ? '資產呈現指數級爆發，創造驚人財富。' : '三份配息通常已超過貸款月付，產生正向現金流。'}</p>
                </div>
             </div>
          </div>

          {/* 金句卡片移至此處 */}
          <div className="mt-2 p-4 bg-slate-800 rounded-xl text-center shadow-lg">
             <p className="text-slate-300 italic text-sm">
               「給孩子的不是一筆錢，而是一套會長大的資產，以及受用一生的理財智慧。」
             </p>
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
        </div>
      </div>
    </div>
  );
};

export default MillionDollarGiftTool;