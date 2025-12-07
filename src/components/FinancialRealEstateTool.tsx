import React, { useState } from 'react';
import { 
  Building2, 
  Calculator, 
  Scale, 
  Landmark, 
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  RefreshCw,
  Settings,    // 新增
  ChevronDown, // 新增
  ChevronUp,   // 新增
  ArrowRightLeft, // 新增
  PiggyBank    // 新增
} from 'lucide-react';
import { ResponsiveContainer, ComposedChart, Area, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

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
  return (p * 10000 * (r / 100)) / 12;
};

const calculateRemainingBalance = (principal: number, rate: number, totalYears: number, yearsElapsed: number) => {
  const pVal = Number(principal) || 0;
  const rVal = Number(rate) || 0;
  const totalY = Number(totalYears) || 0;
  const elapsed = Number(yearsElapsed) || 0;
  const r = rVal / 100 / 12;
  const n = totalY * 12;
  const p = elapsed * 12;
  // 檢查是否已過期或利率為零
  if (elapsed >= totalY || rVal === 0) return Math.max(0, pVal * 10000 * (1 - p / (n || 1)));
  
  // 剩餘本金公式 (等額本息)
  const balance = (pVal * 10000) * (Math.pow(1 + r, n) - Math.pow(1 + r, p)) / (Math.pow(1 + r, n) - 1);
  return Math.max(0, isNaN(balance) ? 0 : balance);
};

// ------------------------------------------------------------------
// 核心模組: 金融房產專案 (視覺升級版 + 轉增貸功能)
// ------------------------------------------------------------------

export const FinancialRealEstateTool = ({ data, setData }: any) => {
  const safeData = {
    loanAmount: Number(data?.loanAmount) || 1000,
    loanTerm: Number(data?.loanTerm) || 30,
    loanRate: Number(data?.loanRate) || 2.2,
    investReturnRate: Number(data?.investReturnRate) || 6,
    // 轉增貸參數
    existingLoanBalance: data?.existingLoanBalance !== undefined ? Number(data.existingLoanBalance) : 700,
    existingMonthlyPayment: data?.existingMonthlyPayment !== undefined ? Number(data.existingMonthlyPayment) : 38000,
  };
  const { loanAmount, loanTerm, loanRate, investReturnRate, existingLoanBalance, existingMonthlyPayment } = safeData;

  // 使用 state 來儲存正在輸入的 loanAmount，避免 onChange 時立即更新計算
  const [tempLoanAmount, setTempLoanAmount] = useState(loanAmount);
  // 新增狀態：是否顯示進階設定 (轉增貸)
  const [showAdvanced, setShowAdvanced] = useState(false);
  // 新增狀態：是否啟用轉增貸模式
  const [isRefinanceMode, setIsRefinanceMode] = useState(false);

  // --- 計算邏輯 ---
  
  // 1. 新貸款 (總額) 的月付金
  const newLoanMonthlyPayment = calculateMonthlyPayment(loanAmount, loanRate, loanTerm);

  // 2. 轉增貸模式計算
  // 增貸現金 = 新貸款總額 - 現有餘額
  const cashOutAmount = Math.max(0, loanAmount - existingLoanBalance);
  
  // 增貸部分的投資收益 (只有增貸出來的錢拿去投資)
  const monthlyInvestIncomeFromCashOut = calculateMonthlyIncome(cashOutAmount, investReturnRate);

  // 整合後新月付 = 新貸款月付 - 增貸投資收益
  // (概念：用增貸出來的獲利，去補貼整個新房貸)
  const netNewMonthlyPayment = newLoanMonthlyPayment - monthlyInvestIncomeFromCashOut;

  // 3. 原始模式計算 (全額投資)
  const monthlyInvestIncomeFull = calculateMonthlyIncome(loanAmount, investReturnRate);
  const monthlyCashFlowOriginal = monthlyInvestIncomeFull - newLoanMonthlyPayment;
  const isNegativeCashFlowOriginal = monthlyCashFlowOriginal < 0; 
  const totalOutOfPocketOriginal = isNegativeCashFlowOriginal ? Math.abs(monthlyCashFlowOriginal) * 12 * loanTerm : 0;

  // --- 用於顯示的變數 (根據模式切換) ---
  const displayMonthlyCashFlow = isRefinanceMode 
      ? (existingMonthlyPayment - netNewMonthlyPayment) // 轉增貸：省下的錢 (正數代表少繳)
      : monthlyCashFlowOriginal; // 原始：淨現金流

  // 總累積效益計算
  const cumulativeNetIncomeTarget = isRefinanceMode
      ? (existingMonthlyPayment - netNewMonthlyPayment) * loanTerm * 12 // 累積省下的錢
      : monthlyCashFlowOriginal * loanTerm * 12;

  const totalWealthTargetWan = isRefinanceMode
      ? Math.round((cashOutAmount + cumulativeNetIncomeTarget/10000)) // 增貸現金 + 省下的錢 (簡化算法)
      : Math.round(loanAmount + (cumulativeNetIncomeTarget / 10000));
  
  // --- 圖表數據 ---
  const generateHouseChartData = () => {
    const dataArr = [];
    let cumulative = 0; 
    const step = loanTerm > 20 ? 3 : 1; 
    
    for (let year = 1; year <= loanTerm; year++) {
      const remainingLoan = calculateRemainingBalance(loanAmount, loanRate, loanTerm, year);
      
      if (isRefinanceMode) {
          // 轉增貸模式圖表：顯示「原貸款餘額」與「新貸款餘額(扣除投資收益補貼效應)」的對比?
          // 或者顯示「累積省下的現金」
          cumulative += (existingMonthlyPayment - netNewMonthlyPayment) * 12;
          
          if (year === 1 || year % step === 0 || year === loanTerm) {
            dataArr.push({ 
                year: `第${year}年`, 
                累積節省金額: Math.round(cumulative / 10000),
                新貸款餘額: Math.round(remainingLoan / 10000) 
            });
          }
      } else {
          // 原始模式圖表
          cumulative += monthlyCashFlowOriginal * 12;
          const assetEquity = (loanAmount * 10000) - remainingLoan;
          const financialTotalWealth = assetEquity + cumulative;
          
          if (year === 1 || year % step === 0 || year === loanTerm) {
             dataArr.push({ 
                year: `第${year}年`, 
                總資產價值: Math.round(financialTotalWealth / 10000), 
                剩餘貸款: Math.round(remainingLoan / 10000) 
             });
          }
      }
    }
    return dataArr;
  };

  const updateField = (field: string, value: number) => { 
      let newValue = Number(value);

      if (field === 'loanAmount') {
          const clampedValue = Math.max(100, Math.min(5000, newValue));
          setTempLoanAmount(Math.round(clampedValue));
          setData({ ...safeData, [field]: Math.round(clampedValue) });
      } else if (field === 'investReturnRate' || field === 'loanRate') {
          setData({ ...safeData, [field]: Number(newValue.toFixed(1)) });
      } else {
          setData({ ...safeData, [field]: newValue }); 
      }
  };
  
  const handleLoanAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? '' : Number(e.target.value);
    setTempLoanAmount(value as number);
  };

  const finalizeLoanAmount = () => {
    let finalValue = isNaN(tempLoanAmount) || tempLoanAmount === 0 ? 100 : tempLoanAmount;
    finalValue = Math.max(100, Math.min(5000, finalValue));
    finalValue = Math.round(finalValue);
    setData({ ...safeData, loanAmount: finalValue });
    setTempLoanAmount(finalValue); 
  };


  return (
    <div className="space-y-8 animate-fade-in font-sans text-slate-800">
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden print-break-inside">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Building2 size={180} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-sm">
              Passive Income
            </span>
            <span className="bg-orange-400/20 text-orange-100 px-3 py-1 rounded-full text-xs font-bold tracking-wider backdrop-blur-sm border border-orange-400/30">
              以息養貸・數位包租公
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight flex items-center gap-3">
            金融房產專案
          </h1>
          <p className="text-emerald-100 text-lg opacity-90 max-w-2xl">
            {isRefinanceMode 
              ? "將不動產增值部分轉為現金，並透過投資收益降低月付金，實現資產活化與債務瘦身。" 
              : "利用長年期低利貸款，打造不需修繕、不需找房客的「數位房地產」。讓配息自動幫您繳房貸。"}
          </p>
        </div>
      </div>

      {/* Calculator Section */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* 左側：參數設定 */}
        <div className="lg:col-span-4 space-y-6 print-break-inside">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
              <Calculator size={20} className="text-emerald-600"/> 
              參數設定
            </h4>
            <div className="space-y-6">
               
               {/* 1. 資產/貸款總額 */}
               <div>
                   <div className="flex justify-between items-center mb-2">
                       <label className="text-sm font-medium text-slate-600">
                          {isRefinanceMode ? "轉增貸後總額 (萬)" : "資產/貸款總額 (萬)"}
                       </label>
                       <div className="flex items-center">
                           <input 
                               type="number" 
                               min={100} 
                               max={5000} 
                               step={10} 
                               value={tempLoanAmount} 
                               onChange={handleLoanAmountInput}
                               onBlur={finalizeLoanAmount}
                               onKeyDown={(e) => { if (e.key === 'Enter') { finalizeLoanAmount(); e.currentTarget.blur(); } }}
                               className="w-20 text-right bg-transparent border-none p-0 font-mono font-bold text-emerald-600 text-lg focus:ring-0 focus:border-emerald-500 focus:bg-emerald-50/50 rounded"
                           />
                           <span className="font-mono font-bold text-emerald-600 text-lg ml-1">萬</span>
                       </div>
                   </div>
                   <input 
                       type="range" min={100} max={5000} step={10} 
                       value={loanAmount} 
                       onChange={(e) => updateField('loanAmount', Number(e.target.value))} 
                       className={`w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600 hover:accent-emerald-700 transition-all`} 
                   />
               </div>
               
               {/* 2. 貸款年期 */}
               <div>
                 <div className="flex justify-between mb-2">
                     <label className="text-sm font-medium text-slate-600">貸款年期 (年)</label>
                     <span className={`font-mono font-bold text-teal-600 text-lg`}>{loanTerm}</span>
                   </div>
                   <input type="range" min={20} max={40} step={1} value={loanTerm} onChange={(e) => updateField('loanTerm', Number(e.target.value))} className={`w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600 hover:accent-teal-700 transition-all`} />
               </div>

               {/* 3. 貸款利率 */}
               <div>
                 <div className="flex justify-between mb-2">
                     <label className="text-sm font-medium text-slate-600">貸款利率 (%)</label>
                     <span className={`font-mono font-bold text-emerald-600 text-lg`}>{loanRate.toFixed(1)}</span>
                   </div>
                   <input type="range" min={1.5} max={4.0} step={0.1} value={loanRate} onChange={(e) => updateField('loanRate', Number(e.target.value))} className={`w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600 hover:accent-emerald-700 transition-all`} />
               </div>
               
               {/* 4. 投資配息率 */}
               <div>
                 <div className="flex justify-between mb-2">
                     <label className="text-sm font-medium text-slate-600">投資配息率 (%)</label>
                     <span className={`font-mono font-bold text-blue-600 text-lg`}>{investReturnRate.toFixed(1)}</span>
                   </div>
                   <input type="range" min={3} max={10} step={0.1} value={investReturnRate} onChange={(e) => updateField('investReturnRate', Number(e.target.value))} className={`w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700 transition-all`} />
               </div>

               {/* --- 進階設定 (轉增貸) --- */}
               <button 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                    showAdvanced || isRefinanceMode
                      ? 'bg-orange-50 border-orange-200 text-orange-800' 
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
               >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Settings size={16} />
                    進階設定 (轉增貸試算)
                  </div>
                  {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
               </button>

               {(showAdvanced || isRefinanceMode) && (
                 <div className="space-y-4 animate-in slide-in-from-top-2 duration-300 pt-2 border-t border-orange-100">
                    
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <RefreshCw size={16} className="text-orange-500"/> 啟用轉增貸模式
                        </label>
                        <button 
                            onClick={() => setIsRefinanceMode(!isRefinanceMode)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isRefinanceMode ? 'bg-orange-500' : 'bg-slate-300'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isRefinanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {isRefinanceMode && (
                        <div className="space-y-4 bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                            <div>
                                <div className="flex justify-between text-xs text-slate-500 mb-1">
                                    <span>現有房貸餘額 (萬)</span>
                                    <span className="font-bold text-orange-700">{existingLoanBalance} 萬</span>
                                </div>
                                <input 
                                    type="range" min={0} max={loanAmount} step={10} 
                                    value={existingLoanBalance} 
                                    onChange={(e) => updateField('existingLoanBalance', Number(e.target.value))} 
                                    className="w-full h-1.5 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-500" 
                                />
                            </div>
                            <div>
                                <div className="flex justify-between text-xs text-slate-500 mb-1">
                                    <span>現有月付金 (元)</span>
                                    <span className="font-bold text-orange-700">${existingMonthlyPayment.toLocaleString()}</span>
                                </div>
                                <input 
                                    type="range" min={5000} max={150000} step={100} 
                                    value={existingMonthlyPayment} 
                                    onChange={(e) => updateField('existingMonthlyPayment', Number(e.target.value))} 
                                    className="w-full h-1.5 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-500" 
                                />
                            </div>
                            
                            <div className="pt-2 border-t border-orange-200 text-xs text-orange-800 space-y-1">
                                <div className="flex justify-between">
                                    <span>增貸現金 (新貸-舊貸):</span>
                                    <span className="font-bold">{cashOutAmount} 萬</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>增貸產生配息:</span>
                                    <span className="font-bold">+${Math.round(monthlyInvestIncomeFromCashOut).toLocaleString()}/月</span>
                                </div>
                            </div>
                        </div>
                    )}
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* 右側：圖表展示 */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[400px] print-break-inside relative">
             <div className="flex justify-between items-center mb-4 pl-2 border-l-4 border-emerald-500">
                <h4 className="font-bold text-slate-700">
                    {isRefinanceMode ? "轉增貸效益模擬" : "資產淨值成長模擬"}
                </h4>
                {isRefinanceMode && (
                    <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded">
                        轉增貸模式
                    </span>
                )}
             </div>
            <ResponsiveContainer width="100%" height="90%">
              <ComposedChart data={generateHouseChartData()} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <defs><linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis unit="萬" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}} itemStyle={{padding: '2px 0'}} />
                <Legend iconType="circle" />
                {isRefinanceMode ? (
                   <>
                     <Area type="monotone" name="累積節省金額" dataKey="累積節省金額" stroke="#f97316" fill="#f97316" fillOpacity={0.2} strokeWidth={3} />
                     <Line type="monotone" name="新貸款餘額" dataKey="新貸款餘額" stroke="#64748b" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                   </>
                ) : (
                   <>
                     <Area type="monotone" name="總資產價值" dataKey="總資產價值" stroke="#10b981" fill="url(#colorWealth)" strokeWidth={3} />
                     <Line type="monotone" name="剩餘貸款餘額" dataKey="剩餘貸款" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                   </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* --- 關鍵指標區域 (根據模式切換顯示) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-200">
         
         {isRefinanceMode ? (
            // --- 轉增貸模式的結果卡片 ---
            <>
               <div className="md:col-span-1 bg-white rounded-2xl shadow border border-orange-200 p-6 print-break-inside">
                  <h3 className="text-center font-bold text-slate-700 mb-4 flex items-center justify-center gap-2">
                      <Scale size={18}/> 轉增貸前後月付金對比
                  </h3>
                  
                  <div className="flex items-center justify-between gap-2 mb-6">
                      <div className="text-center w-1/3">
                          <div className="text-xs text-slate-500 mb-1">原月付金</div>
                          <div className="text-xl font-bold text-slate-400 line-through">
                              ${Math.round(existingMonthlyPayment).toLocaleString()}
                          </div>
                      </div>
                      <div className="flex flex-col items-center justify-center text-orange-500">
                          <ArrowRight size={24} />
                      </div>
                      <div className="text-center w-1/3">
                          <div className="text-xs text-slate-500 mb-1">整合後月付</div>
                          <div className="text-2xl font-black text-emerald-600">
                              ${Math.round(netNewMonthlyPayment).toLocaleString()}
                          </div>
                      </div>
                  </div>

                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 text-center">
                       <p className="text-sm text-emerald-800 font-bold mb-1">每月減輕負擔</p>
                       <p className="text-4xl font-black text-emerald-600 font-mono">
                           ${Math.round(existingMonthlyPayment - netNewMonthlyPayment).toLocaleString()}
                       </p>
                       <p className="text-xs text-emerald-600/70 mt-2">
                           一年省下 ${(Math.round(existingMonthlyPayment - netNewMonthlyPayment) * 12).toLocaleString()}
                       </p>
                  </div>
               </div>

               <div className="md:col-span-1 bg-white rounded-2xl shadow border border-slate-200 p-6 print-break-inside space-y-4">
                  <h3 className="text-center font-bold text-slate-700 flex items-center justify-center gap-2">
                      <PiggyBank size={18}/> 資金運用效益
                  </h3>
                  <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <span className="text-sm font-medium text-slate-600">手邊多出現金 (增貸)</span>
                          <span className="font-bold text-orange-600 text-lg">{cashOutAmount} 萬</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <span className="text-sm font-medium text-slate-600">投資創造被動收入</span>
                          <span className="font-bold text-blue-600 text-lg">+${Math.round(monthlyInvestIncomeFromCashOut).toLocaleString()}/月</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <span className="text-sm font-medium text-slate-600">新房貸月付金</span>
                          <span className="font-bold text-slate-700 text-lg">${Math.round(newLoanMonthlyPayment).toLocaleString()}/月</span>
                      </div>
                  </div>
                  <div className="text-center text-xs text-slate-400 mt-2">
                      * 計算公式：新月付金 - (增貸現金 × 報酬率 ÷ 12) = 整合後月付
                  </div>
               </div>
            </>
         ) : (
            // --- 原始模式的結果卡片 ---
            <>
                <div className="md:col-span-1 bg-white rounded-2xl shadow border border-slate-200 p-6 print-break-inside">
                    <h3 className="text-center font-bold text-slate-700 mb-4 flex items-center justify-center gap-2"><Scale size={18}/> 每月現金流試算</h3>
                    <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                        <div className="flex justify-between items-center text-sm"><span className="text-slate-600 font-medium">1. 每月配息收入</span><span className="font-mono text-emerald-600 font-bold">+${Math.round(monthlyInvestIncomeFull).toLocaleString()}</span></div>
                        <div className="flex justify-between items-center text-sm"><span className="text-slate-600 font-medium">2. 扣除貸款支出</span><span className="font-mono text-red-500 font-bold">-${Math.round(newLoanMonthlyPayment).toLocaleString()}</span></div>
                        <div className="border-t border-slate-200 my-2"></div>
                        
                        {isNegativeCashFlowOriginal ? (
                        <div className="text-center animate-pulse-soft">
                            <div className="text-xs text-slate-400 mb-1">每月需自行負擔</div>
                            <div className="text-4xl font-black text-red-500 font-mono">-${Math.abs(Math.round(monthlyCashFlowOriginal)).toLocaleString()}</div>
                            <div className="mt-4 bg-orange-50 rounded-lg p-3 border border-orange-100">
                                <div className="text-xs text-orange-800 font-bold mb-1">槓桿效益分析</div>
                                <div className="text-xs text-orange-700">總共只付出 <span className="font-bold underline">${Math.round(totalOutOfPocketOriginal/10000).toLocaleString()}萬</span></div>
                                <div className="text-xs text-orange-700">換取 <span className="font-bold text-lg">${loanAmount}萬</span> 原始資產</div>
                            </div>
                        </div>
                        ) : (
                        <div className="text-center">
                            <div className="text-xs text-slate-400 mb-1">每月淨現金流</div>
                            <div className="text-4xl font-black text-emerald-600 font-mono">+${Math.round(monthlyCashFlowOriginal).toLocaleString()}</div>
                            <div className="mt-4 bg-emerald-100 rounded-lg p-2 text-xs text-emerald-800 font-bold">
                                🎉 完全由資產養貸，還有找！
                            </div>
                        </div>
                        )}
                    </div>
                </div>

                <div className="md:col-span-1 print-break-inside space-y-6">
                    <div className="bg-white rounded-2xl shadow-lg border border-teal-200 p-6 h-full">
                        <h3 className="text-xl font-bold text-teal-700 mb-2 flex items-center gap-2">
                            <TrendingUp size={24} /> 總貸款期 ({loanTerm}年) 累積總效益
                        </h3>
                        <div className="text-center h-full flex flex-col justify-center">
                            <p className="text-slate-500 text-sm font-medium mb-1">
                                期滿後總累積效益 (淨現金流總和 + 初始貸款總額)
                            </p>
                            <p className={`text-5xl font-black font-mono ${totalWealthTargetWan >= loanAmount ? 'text-green-600' : 'text-red-500'}`}>
                                ${totalWealthTargetWan.toLocaleString()} 萬
                            </p>
                        </div>
                    </div>
                </div>
            </>
         )}
      </div>
      
      {/* 底部策略區 (執行三部曲 + 專案四大效益) */}
      <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-slate-200 print-break-inside">
        
        {/* 1. 執行循環 */}
        <div className="space-y-4 lg:col-span-1">
          <div className="flex items-center gap-2 mb-2">
             <RefreshCw className="text-emerald-600" size={24} />
             <h3 className="text-xl font-bold text-slate-800">
                 {isRefinanceMode ? "轉增貸致富三步" : "執行三部曲"}
             </h3>
          </div>
          
          <div className="space-y-3">
             <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-emerald-200 transition-colors">
                <div className="mt-1 min-w-[3rem] h-12 rounded-xl bg-emerald-50 text-emerald-600 flex flex-col items-center justify-center font-bold text-xs">
                   <span className="text-lg">01</span>
                   <span>{isRefinanceMode ? "盤點" : "建置"}</span>
                </div>
                <div>
                   <h4 className="font-bold text-slate-800 flex items-center gap-2">
                       {isRefinanceMode ? "盤點現有房貸" : "建置期 (第1年)"}
                   </h4>
                   <p className="text-sm text-slate-600 mt-1">
                       {isRefinanceMode 
                         ? "檢視目前房貸餘額與已增值的房價，找出隱藏在房子裡的閒置資金。"
                         : "透過銀行融資取得大筆資金，單筆投入穩健配息資產。就像買房出租，但省去頭期款與管理麻煩。"}
                   </p>
                </div>
             </div>

             <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-teal-200 transition-colors">
                <div className="mt-1 min-w-[3rem] h-12 rounded-xl bg-teal-50 text-teal-600 flex flex-col items-center justify-center font-bold text-xs">
                   <span className="text-lg">02</span>
                   <span>{isRefinanceMode ? "增貸" : "持守"}</span>
                </div>
                <div>
                   <h4 className="font-bold text-slate-800 flex items-center gap-2">
                        {isRefinanceMode ? "轉貸增值" : "持守期 (第2年起)"}
                   </h4>
                   <p className="text-sm text-slate-600 mt-1">
                        {isRefinanceMode 
                         ? "透過轉貸將增值部分套現，同時爭取更長的年限與更低的利率，降低還款壓力。"
                         : "讓資產產生的配息自動償還貸款本息。您只需補貼少許差額(甚至有找)，時間是您最好的朋友。"}
                   </p>
                </div>
             </div>

             <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-green-200 transition-colors">
                <div className="mt-1 min-w-[3rem] h-12 rounded-xl bg-green-50 text-green-600 flex flex-col items-center justify-center font-bold text-xs">
                   <span className="text-lg">03</span>
                   <span>{isRefinanceMode ? "套利" : "自由"}</span>
                </div>
                <div>
                   <h4 className="font-bold text-slate-800 flex items-center gap-2">
                       {isRefinanceMode ? "配息減壓" : "自由期 (期滿)"}
                   </h4>
                   <p className="text-sm text-slate-600 mt-1">
                        {isRefinanceMode
                         ? "將增貸資金投入穩健標的，利用產生的配息來支付房貸，實現月付金大瘦身。"
                         : "貸款完全清償。此刻起，這筆千萬資產與每月的配息收入完全屬於您，成為真正的被動收入。"}
                   </p>
                </div>
             </div>
          </div>
          
          <div className="mt-6 p-4 bg-slate-800 rounded-xl text-center shadow-lg">
             <p className="text-slate-300 italic text-sm">
               {isRefinanceMode 
                 ? "「房子不只是拿來住的，更是您的提款機。別讓您的資產在牆壁裡睡覺。」"
                 : "「富人買資產，窮人買負債，中產階級買他們以為是資產的負債。金融房產，是真正的資產。」"}
             </p>
           </div>
        </div>

        {/* 2. 專案效益 */}
        <div className="space-y-4 lg:col-span-1">
           <div className="flex items-center gap-2 mb-2">
             <Landmark className="text-emerald-600" size={24} />
             <h3 className="text-xl font-bold text-slate-800">專案四大效益</h3>
           </div>
           
           <div className="grid grid-cols-1 gap-3">
              {[
                { title: "資產活化", desc: "將不動產的「死錢」變成「活錢」，增加資金運用彈性。" },
                { title: "降低月付", desc: "利用增貸資金創造的被動收入來補貼房貸，顯著降低每月負擔。" },
                { title: "抗通膨", desc: "利用負債對抗通膨。隨著時間推移，貨幣貶值，但您持有的實體與金融資產在增值。" },
                { title: "整合負債", desc: "可順便將高利信貸、卡債整合進低利的房貸中，一舉數得。" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-emerald-50/50 transition-colors">
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