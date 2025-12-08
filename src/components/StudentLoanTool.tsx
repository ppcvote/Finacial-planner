import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  Clock, 
  PauseCircle, 
  Calculator, 
  Wallet, 
  TrendingUp, 
  ShieldCheck, 
  Target, 
  CheckCircle2,
  RefreshCw,
  Landmark,
  Settings,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { ResponsiveContainer, ComposedChart, Area, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ReferenceArea } from 'recharts';

// --- 輔助函式 ---

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

const formatXAxisTick = (value: any) => {
    return `第${value}年`;
};

// --- 主組件 ---
export const StudentLoanTool = ({ data, setData }: any) => {
  // 1. 資料處理與預設值
  const safeData = {
    loanAmount: Number(data?.loanAmount) || 40,
    loanRate: 1.775, // 固定利率 1.775%
    investReturnRate: Number(data?.investReturnRate) || 6,
    semesters: Number(data?.semesters) || 8, // 貸款學期數
    years: 8, // 本息攤還期固定 8 年
    gracePeriod: Number(data?.gracePeriod) || 1, 
    interestOnlyPeriod: Number(data?.interestOnlyPeriod) || 0,
    isQualified: Boolean(data?.isQualified) // 是否符合緩繳資格 (2025新制)
  };
  const { loanAmount, loanRate, investReturnRate, semesters, years, gracePeriod, interestOnlyPeriod, isQualified } = safeData;

  const [showAdvanced, setShowAdvanced] = useState(false);

  // 期間切分
  const studyYears = Math.ceil(semesters / 2); // 在學年數
  const graceEndYear = studyYears + gracePeriod;
  const interestOnlyEndYear = graceEndYear + interestOnlyPeriod;
  const repaymentEndYear = interestOnlyEndYear + years;
  const totalDuration = repaymentEndYear;
  
  // 每學期投入的學費現金流 (總額 / 學期數 / 每學期月數(6))
  const monthlySavingPerSemester = (loanAmount * 10000) / semesters / 6; 
  const totalPrincipalPaid = loanAmount * 10000;

  // --- 核心計算引擎 (支援 策略 vs 基準 對比) ---
  const runSimulation = (simGrace: number, simInterestOnly: number) => {
      const simGraceEnd = studyYears + simGrace;
      const simInterestOnlyEnd = simGraceEnd + simInterestOnly;
      const simRepaymentEnd = simInterestOnlyEnd + years;
      const simTotalDuration = simRepaymentEnd;

      let investmentValue = 0; 
      let remainingLoan = loanAmount * 10000;
      let cumulativeInvestmentPrincipal = 0; 
      
      const monthlyPaymentP_I = calculateMonthlyPayment(loanAmount, loanRate, years);
      const monthlyRate = investReturnRate / 100 / 12;
      const loanMonthlyRate = loanRate / 100 / 12;

      // 圖表數據陣列
      const chartData = [];
      
      // 為了從第1個月算到最後
      for (let month = 1; month <= simTotalDuration * 12; month++) { 
        const year = Math.ceil(month / 12);

        // 1. 每學期初投入一次「學費」 (僅在學期間)
        if ((month - 1) % 6 === 0 && year <= studyYears && cumulativeInvestmentPrincipal < totalPrincipalPaid) {
            const semesterInput = monthlySavingPerSemester * 6;
            investmentValue += semesterInput; 
            cumulativeInvestmentPrincipal += semesterInput;
        }
        
        // 2. 計算當月需繳金額 (Outflow)
        let monthlyOutflow = 0;
        let phase = '';

        if (year <= studyYears) {
            phase = '在學期';
            monthlyOutflow = 0; // 不需繳款
        } else if (year <= simGraceEnd) {
            phase = '寬限期';
            monthlyOutflow = 0; // 不需繳款 (緩繳本息)
        } else if (year <= simInterestOnlyEnd) {
            phase = '只繳息期';
            monthlyOutflow = remainingLoan * loanMonthlyRate; // 只繳利息
        } else if (year <= simRepaymentEnd) {
            phase = '本息攤還期';
            monthlyOutflow = monthlyPaymentP_I; // 本息均攤
            
            // 更新剩餘貸款
            const interestPart = remainingLoan * loanMonthlyRate;
            const principalPart = monthlyOutflow - interestPart;
            remainingLoan = Math.max(0, remainingLoan - principalPart);
        } else {
            phase = '期滿';
            monthlyOutflow = 0;
            remainingLoan = 0;
        }

        // 3. 資產滾動 (先扣除支出，剩餘的複利；若不足扣，則資產減少)
        // 邏輯：投資收益 - 支出。
        // 資產 = 資產 * (1+月報酬) - 月支出
        // 改良：假設月支出是從投資帳戶出的 (配息不夠就賣本金)
        
        // 先計算單月投資獲利
        const investmentProfit = investmentValue * monthlyRate;
        
        // 總資產變化 = (原資產 + 獲利) - 支出
        investmentValue = (investmentValue + investmentProfit) - monthlyOutflow;

        // 4. 記錄年度數據 (每年最後一個月)
        if (month % 12 === 0 || month === simTotalDuration * 12) {
            chartData.push({
                year: year,
                yearLabel: `第${year}年`,
                投資複利價值: Math.round(investmentValue / 10000),
                淨資產: Math.round((investmentValue - remainingLoan) / 10000),
                若直接繳掉: 0, // 對照組永遠是 0
                monthlyOutflow: monthlyOutflow, // 記錄當下月付金供分析
                investmentProfit: investmentProfit // 記錄當下月配息供分析
            });
        }
      }

      return { 
          finalAsset: Math.round(investmentValue / 10000),
          chartData 
      };
  };

  // 1. 執行目前設定的模擬
  const { finalAsset: currentFinalAsset, chartData: dataArr } = runSimulation(gracePeriod, interestOnlyPeriod);
  
  // 2. 執行基準模擬 (Old School: 1年寬限 + 0年只繳息) 用於計算政策紅利
  const { finalAsset: baselineFinalAsset } = runSimulation(1, 0);
  
  // 3. 計算關鍵指標
  const policyBonus = currentFinalAsset - baselineFinalAsset; // 政策紅利
  
  // 抓取「本息攤還期」第一年的數據來計算防禦率
  const repaymentStartYearIdx = dataArr.findIndex(d => d.year === interestOnlyEndYear + 1);
  const repaymentData = repaymentStartYearIdx !== -1 ? dataArr[repaymentStartYearIdx] : null;
  
  // 現金流防禦率 = (月配息 / 月付金) * 100%
  let coverageRatio = 0;
  if (repaymentData && repaymentData.monthlyOutflow > 0) {
      coverageRatio = (repaymentData.investmentProfit / repaymentData.monthlyOutflow) * 100;
  } else if (repaymentData && repaymentData.monthlyOutflow === 0) {
      coverageRatio = 999; // 無需繳款
  }

  // --- X軸 ticks 生成 (整數年) ---
  const xAxisTicks = Array.from({length: totalDuration}, (_, i) => i + 1);

  // --- UI 更新 ---
  const updateField = (field: string, value: any) => { 
    if (field === 'isQualified') {
        setData({ ...safeData, isQualified: value });
        // 若關閉資格，需檢查寬限期是否超過 1 年
        if (!value && gracePeriod > 1) {
            setData(prev => ({ ...prev, gracePeriod: 1, isQualified: false }));
        }
        return;
    }

    let newValue = Number(value);
    if (field === 'loanAmount') {
      const clampedValue = Math.max(10, Math.min(300, newValue));
      setData({ ...safeData, [field]: Math.round(clampedValue) });
      setTempLoanAmount(Math.round(clampedValue));
    } else {
      setData({ ...safeData, [field]: newValue }); 
    }
  };

  const [tempLoanAmount, setTempLoanAmount] = useState(loanAmount);
  
  const handleLoanAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? '' : Number(e.target.value);
    setTempLoanAmount(value as number);
  };

  const finalizeLoanAmount = () => {
    let finalValue = isNaN(tempLoanAmount as number) || tempLoanAmount === 0 ? 40 : (tempLoanAmount as number);
    finalValue = Math.max(10, Math.min(300, finalValue));
    finalValue = Math.round(finalValue);
    setData({ ...safeData, loanAmount: finalValue });
    setTempLoanAmount(finalValue); 
  };

  // 圖表分區顏色
  const phaseColors = {
    '在學期': '#3b82f6', 
    '寬限期': '#84cc16', 
    '只繳息期': '#f59e0b', 
    '本息攤還期': '#06b6d4', 
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans text-slate-800">
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden print-break-inside">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <GraduationCap size={180} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-sm">
              Financial Strategy
            </span>
            <span className="bg-green-400/20 text-green-100 px-3 py-1 rounded-full text-xs font-bold tracking-wider backdrop-blur-sm border border-green-400/30">
              2025 新制對應
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight flex items-center gap-3">
            學貸活化專案
          </h1>
          <p className="text-blue-100 text-lg opacity-90 max-w-2xl">
            將學貸視為低利融資，利用「緩繳本息」與「只繳息期」新規，創造資產與負債的正向利差。
          </p>
        </div>
      </div>

      {/* Calculator Section */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* 左側：參數設定 */}
        <div className="lg:col-span-4 space-y-6 print-break-inside">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
              <Calculator size={20} className="text-blue-600"/> 
              參數設定
            </h4>
            <div className="space-y-6">
               
               {/* 1. 學貸總額 */}
               <div>
                 <div className="flex justify-between items-center mb-2">
                   <label className="text-sm font-medium text-slate-600">學貸總額 (萬)</label>
                   <div className="flex items-center">
                     <input 
                       type="number" min={10} max={300} step={1}
                       value={tempLoanAmount}
                       onChange={handleLoanAmountInput}
                       onBlur={finalizeLoanAmount}
                       onKeyDown={(e) => { if (e.key === 'Enter') finalizeLoanAmount(); }}
                       className="w-20 text-right bg-transparent border-none p-0 font-mono font-bold text-blue-600 text-lg focus:ring-0 focus:border-blue-500 focus:bg-blue-50/50 rounded"
                     />
                     <span className="font-mono font-bold text-blue-600 text-lg ml-1">萬</span>
                   </div>
                 </div>
                 <input
                   type="range" min={10} max={300} step={1} 
                   value={loanAmount}
                   onChange={(e) => updateField('loanAmount', Number(e.target.value))}
                   className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700 transition-all"
                 />
               </div>

               {/* 2. 貸款學期數 */}
               <div>
                 <div className="flex justify-between mb-2">
                   <label className="text-sm font-medium text-slate-600 flex itemscenter gap-1">
                     <Clock size={14}/> 貸款學期數
                   </label>
                   <span className="font-mono font-bold text-teal-600 text-lg">{semesters} 學期</span>
                 </div>
                 <input
                   type="range" min={1} max={20} step={1}
                   value={semesters}
                   onChange={(e) => updateField('semesters', Number(e.target.value))}
                   className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-500 hover:accent-teal-600 transition-all"
                 />
               </div>

               {/* 3. 預期年化報酬率 */}
               <div>
                 <div className="flex justify-between mb-2">
                   <label className="text-sm font-medium text-slate-600">預期年化報酬率 (%)</label>
                   <span className="font-mono font-bold text-emerald-600 text-lg">
                     {investReturnRate.toFixed(1)}
                   </span>
                 </div>
                 <input
                   type="range" min={3} max={10} step={0.5}
                   value={investReturnRate}
                   onChange={(e) => updateField('investReturnRate', Number(e.target.value))}
                   className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600 hover:accent-emerald-700 transition-all"
                 />
               </div>

               {/* 進階設定 Toggle */}
               <button 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                    showAdvanced 
                      ? 'bg-blue-50 border-blue-200 text-blue-800' 
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
               >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Settings size={16} />
                    進階設定 (寬限期/只繳息)
                  </div>
                  {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
               </button>

               {/* 進階設定 Panel */}
               {showAdvanced && (
                 <div className="space-y-4 animate-in slide-in-from-top-2 duration-300 pt-2 border-t border-blue-100">
                    
                    {/* 緩繳資格開關 */}
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                            <ShieldCheck size={14}/> 符合緩繳資格 (低所得/特殊)
                        </label>
                        <button 
                            onClick={() => updateField('isQualified', !isQualified)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isQualified ? 'bg-blue-500' : 'bg-slate-300'}`}
                        >
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isQualified ? 'translate-x-4' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {/* 寬限期 */}
                    <div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>寬限期 (緩繳本息)</span>
                            <span className="font-bold text-cyan-700">{gracePeriod} 年</span>
                        </div>
                        <input 
                            type="range" min={0} max={isQualified ? 9 : 1} step={1} 
                            value={gracePeriod} 
                            onChange={(e) => updateField('gracePeriod', Number(e.target.value))} 
                            className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${isQualified ? 'bg-cyan-200 accent-cyan-600' : 'bg-slate-200 accent-slate-400'}`}
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                            {isQualified ? '含新制最多申請 8 次' : '一般戶僅畢業後 1 年'}
                        </p>
                    </div>

                    {/* 只繳息期 */}
                    <div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>只繳息期</span>
                            <span className="font-bold text-orange-700">{interestOnlyPeriod} 年</span>
                        </div>
                        <input 
                            type="range" min={0} max={8} step={1} 
                            value={interestOnlyPeriod} 
                            onChange={(e) => updateField('interestOnlyPeriod', Number(e.target.value))} 
                            className="w-full h-1.5 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-500" 
                        />
                        <p className="text-[10px] text-slate-400 mt-1">新制最長可申請 8 年</p>
                    </div>
                 </div>
               )}
            </div>
            
            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">目前學貸利率</span>
                <span className="font-bold text-slate-700">{loanRate.toFixed(3)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">資金活化總期程</span>
                <span className="font-bold text-blue-600">{totalDuration} 年</span>
              </div>
            </div>
          </div>
        </div>

        {/* 右側：圖表與卡片 */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[450px] print-break-inside relative">
            <h4 className="font-bold text-slate-700 mb-4 pl-2 border-l-4 border-blue-500">資產成長趨勢模擬</h4>
            <ResponsiveContainer width="100%" height="90%">
              <ComposedChart data={dataArr} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                {/* 背景色塊 */}
                <ReferenceArea x1={0.5} x2={studyYears + 0.5} fill={phaseColors['在學期']} fillOpacity={0.15} />
                {gracePeriod > 0 && (
                  <ReferenceArea x1={studyYears + 0.5} x2={graceEndYear + 0.5} fill={phaseColors['寬限期']} fillOpacity={0.15} />
                )}
                {interestOnlyEndYear > graceEndYear && (
                  <ReferenceArea x1={graceEndYear + 0.5} x2={interestOnlyEndYear + 0.5} fill={phaseColors['只繳息期']} fillOpacity={0.15} />
                )}
                <ReferenceArea x1={interestOnlyEndYear + 0.5} x2={repaymentEndYear + 0.5} fill={phaseColors['本息攤還期']} fillOpacity={0.15} />

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                
                <XAxis 
                  type="number" 
                  dataKey="year" 
                  domain={[0.5, totalDuration + 0.5]} 
                  ticks={xAxisTicks} 
                  allowDecimals={false}
                  tickFormatter={formatXAxisTick} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  axisLine={false} 
                  tickLine={false}
                />
                
                <YAxis unit="萬" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }} 
                  itemStyle={{ padding: '2px 0' }}
                  labelFormatter={(value) => `第${value}年`}
                />
                <Legend iconType="circle" />
                
                <Line type="monotone" name="活化專案淨資產" dataKey="淨資產" stroke="#0ea5e9" strokeWidth={3} />
                <Line type="monotone" name="若直接繳掉" dataKey="若直接繳掉" stroke="#94a3b8" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                <Line type="monotone" name="投資複利總值" dataKey="投資複利價值" stroke="#10b981" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
            
            <div className="flex justify-center gap-4 mt-2 text-sm">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500/20"></span> 在學期</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-lime-500/20"></span> 寬限期</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500/20"></span> 只繳息期</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-cyan-500/20"></span> 本息攤還期</span>
            </div>
          </div>

          {/* 新增：戰略儀表板 (Dashboard) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             
             {/* 卡片 1: 現金流防禦率 */}
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 relative overflow-hidden">
                 <div className="flex items-center gap-2 mb-2">
                     <ShieldCheck size={18} className={coverageRatio >= 100 ? "text-green-500" : "text-amber-500"}/>
                     <span className="text-sm font-bold text-slate-700">現金流防禦率</span>
                 </div>
                 <div className="flex items-end gap-2">
                     <span className={`text-3xl font-black font-mono ${coverageRatio >= 100 ? "text-green-600" : "text-amber-500"}`}>
                         {coverageRatio >= 999 ? "∞" : Math.round(coverageRatio)}%
                     </span>
                     {coverageRatio < 100 && (
                         <span className="text-xs text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded mb-1">需補貼</span>
                     )}
                 </div>
                 <p className="text-xs text-slate-400 mt-2">
                     {coverageRatio >= 100 
                        ? "配息足以支付學貸，全自動扣繳。" 
                        : "配息可抵銷部分學貸，降低還款壓力。"}
                 </p>
                 {/* Progress Bar */}
                 <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3">
                     <div 
                        className={`h-1.5 rounded-full ${coverageRatio >= 100 ? "bg-green-500" : "bg-amber-500"}`} 
                        style={{width: `${Math.min(100, coverageRatio)}%`}}
                     ></div>
                 </div>
             </div>

             {/* 卡片 2: 新制政策紅利 */}
             <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl shadow-sm border border-indigo-100 p-4 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-2 opacity-10">
                     <RefreshCw size={60} className="text-indigo-600"/>
                 </div>
                 <div className="flex items-center gap-2 mb-2">
                     <Zap size={18} className="text-indigo-600"/>
                     <span className="text-sm font-bold text-indigo-900">新制政策紅利</span>
                 </div>
                 <div className="flex items-end gap-2">
                     <span className="text-3xl font-black font-mono text-indigo-700">
                         +${policyBonus.toLocaleString()}
                     </span>
                     <span className="text-sm font-bold text-indigo-500 mb-1">萬</span>
                 </div>
                 <p className="text-xs text-indigo-600/80 mt-2 leading-relaxed">
                     相比傳統還款 (1年寬限+0年只繳息)，善用拖延戰術多賺的複利。
                 </p>
             </div>

             {/* 卡片 3: 人生起跑點 (結局對比) */}
             <div className="bg-slate-800 rounded-2xl shadow-sm p-4 text-white relative">
                 <div className="flex items-center gap-2 mb-3">
                     <Target size={18} className="text-yellow-400"/>
                     <span className="text-sm font-bold">10年後資產結局</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                     <div className="text-slate-400">一般人</div>
                     <div className="font-mono text-slate-400">$0</div>
                 </div>
                 <div className="w-full bg-slate-700 h-px my-2"></div>
                 <div className="flex justify-between items-center">
                     <div className="font-bold text-yellow-400">您的資產</div>
                     <div className="font-mono font-black text-2xl text-yellow-400">
                         ${currentFinalAsset.toLocaleString()} <span className="text-sm">萬</span>
                     </div>
                 </div>
             </div>

          </div>
        </div>
      </div>
      
      {/* 底部策略區 */}
      <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-slate-200 print-break-inside">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
             <RefreshCw className="text-blue-600" size={24} />
             <h3 className="text-xl font-bold text-slate-800">執行三部曲</h3>
          </div>
          <div className="space-y-3">
             <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                <div className="mt-1 min-w-[2.5rem] h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">01</div>
                <div>
                   <h4 className="font-bold text-slate-800 flex items-center gap-2">保留本金 <Wallet size={16} className="text-slate-400"/></h4>
                   <p className="text-sm text-slate-600 mt-1">辦理學貸，將「原本要繳的學費」作為種子基金，按學期投入穩定投資，開始累積資產。</p>
                </div>
             </div>
             <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                <div className="mt-1 min-w-[2.5rem] h-10 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">02</div>
                <div>
                   <h4 className="font-bold text-slate-800 flex items-center gap-2">以息繳息 <TrendingUp size={16} className="text-slate-400"/></h4>
                   <p className="text-sm text-slate-600 mt-1">申請緩繳與只繳息，利用配息支付利息，若配息不足則由本金自動扣除，生活零負擔。</p>
                </div>
             </div>
             <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                <div className="mt-1 min-w-[2.5rem] h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">03</div>
                <div>
                   <h4 className="font-bold text-slate-800 flex items-center gap-2">資產攤還 <ShieldCheck size={16} className="text-slate-400"/></h4>
                   <p className="text-sm text-slate-600 mt-1">進入本息攤還期後，讓資產池自動扣繳學貸。期滿後，您將驚喜地發現帳戶裡還有一筆可觀的財富。</p>
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-4">
           <div className="flex items-center gap-2 mb-2">
             <Landmark className="text-emerald-600" size={24} />
             <h3 className="text-xl font-bold text-slate-800">專案四大效益</h3>
           </div>
           <div className="grid grid-cols-1 gap-3">
              {[
                { title: "低成本融資", desc: "學貸利率極低，使您有機會利用利差創造正向收益，解決學費資金壓力。" },
                { title: "資產先行", desc: "在同儕還在為學費煩惱時，您已經啟動了投資複利，贏在人生的起跑點。" },
                { title: "緊急預備金", desc: "不急著繳掉學費，手邊保留大量現金，應付求學或剛畢業時的突發狀況。" },
                { title: "理財紀律", desc: "將學費轉化為定期投資/還款的紀律，培養受用一生的富人思維。" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-blue-50/50 transition-colors">
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

export default StudentLoanTool;
