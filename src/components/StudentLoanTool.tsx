import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Zap,
  ArrowRightLeft,
  PiggyBank,
  X,
  Crown,
  Lock,
  Sparkles
} from 'lucide-react';
import { useMembership } from '../hooks/useMembership';
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
export const StudentLoanTool = ({ data, setData, userId }: any) => {
  // 會員權限判斷
  const { tier } = useMembership(userId || null);
  const isPaidMember = tier === 'founder' || tier === 'paid';

  // --- 隱藏小抄狀態 ---
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const clickTimer = useRef<NodeJS.Timeout | null>(null);

  // --- 首次進入提示狀態 ---
  const [showTripleClickHint, setShowTripleClickHint] = useState(false);
  const HINT_STORAGE_KEY = 'ua_student_loan_cheatsheet_hint_seen';

  // 三連點觸發函式
  const handleSecretClick = () => {
    setClickCount(prev => prev + 1);
    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => setClickCount(0), 800);
    if (clickCount >= 2) {
      setShowCheatSheet(true);
      setClickCount(0);
    }
  };

  // ESC 鍵關閉
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowCheatSheet(false);
        setShowTripleClickHint(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 首次進入頁面顯示提示
  useEffect(() => {
    const hasSeenHint = localStorage.getItem(HINT_STORAGE_KEY);
    if (!hasSeenHint) {
      const timer = setTimeout(() => {
        setShowTripleClickHint(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // 關閉提示並記錄已看過
  const dismissHint = () => {
    setShowTripleClickHint(false);
    localStorage.setItem(HINT_STORAGE_KEY, 'true');
  };

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

  // --- 計算各階段的月付金數值 (用於顯示) ---
  const monthlyInterest = Math.round(loanAmount * 10000 * (loanRate / 100 / 12));
  const monthlyPMT = Math.round(calculateMonthlyPayment(loanAmount, loanRate, years));

  // --- 核心計算引擎 ---
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
        const investmentProfit = investmentValue * monthlyRate;
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
  
  // 2. 抓取「本息攤還期」第一年的數據來計算防禦率
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

  const [tempLoanAmount, setTempLoanAmount] = useState<string | number>(loanAmount);
  const [tempSemesters, setTempSemesters] = useState<string | number>(semesters);
  const [tempInvestReturnRate, setTempInvestReturnRate] = useState<string | number>(investReturnRate);
  const [tempGracePeriod, setTempGracePeriod] = useState<string | number>(gracePeriod);
  const [tempInterestOnlyPeriod, setTempInterestOnlyPeriod] = useState<string | number>(interestOnlyPeriod);

  // 同步外部資料變化
  React.useEffect(() => { setTempSemesters(semesters); }, [semesters]);
  React.useEffect(() => { setTempInvestReturnRate(investReturnRate); }, [investReturnRate]);
  React.useEffect(() => { setTempGracePeriod(gracePeriod); }, [gracePeriod]);
  React.useEffect(() => { setTempInterestOnlyPeriod(interestOnlyPeriod); }, [interestOnlyPeriod]);

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

  const finalizeSemesters = () => {
    let val = Number(tempSemesters) || 8;
    val = Math.max(1, Math.min(20, Math.round(val)));
    setTempSemesters(val);
    setData({ ...safeData, semesters: val });
  };

  const finalizeInvestReturnRate = () => {
    let val = Number(tempInvestReturnRate) || 6;
    val = Math.max(3, Math.min(10, val));
    val = Math.round(val * 10) / 10; // 保留一位小數
    setTempInvestReturnRate(val);
    setData({ ...safeData, investReturnRate: val });
  };

  const finalizeGracePeriod = () => {
    let val = Number(tempGracePeriod) || 1;
    const maxGrace = isQualified ? 12 : 1;
    val = Math.max(0, Math.min(maxGrace, Math.round(val)));
    setTempGracePeriod(val);
    setData({ ...safeData, gracePeriod: val });
  };

  const finalizeInterestOnlyPeriod = () => {
    let val = Number(tempInterestOnlyPeriod) || 0;
    val = Math.max(0, Math.min(12, Math.round(val)));
    setTempInterestOnlyPeriod(val);
    setData({ ...safeData, interestOnlyPeriod: val });
  };

  const handleKeyDown = (finalizer: () => void) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      finalizer();
      e.currentTarget.blur();
    }
  };

  // 圖表分區顏色與定義
  const phases = [
      { name: '在學期', color: '#3b82f6', range: [0.5, studyYears + 0.5], pay: 0, strategy: '本金投入・複利內滾' },
      { name: '寬限期', color: '#84cc16', range: [studyYears + 0.5, graceEndYear + 0.5], pay: 0, strategy: '獲利內滾・擴大基數' },
      { name: '只繳息期', color: '#f59e0b', range: [graceEndYear + 0.5, interestOnlyEndYear + 0.5], pay: monthlyInterest, strategy: '配息繳息・不足扣本' },
      { name: '本息攤還期', color: '#06b6d4', range: [interestOnlyEndYear + 0.5, repaymentEndYear + 0.5], pay: monthlyPMT, strategy: '資產扣繳・無痛還款' },
  ];

  return (
    <div className="space-y-8 animate-fade-in font-sans text-slate-800">
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden print-break-inside">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <GraduationCap size={180} />
        </div>
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-sm">
              Financial Strategy
            </span>
            {/* 🔥 這個標籤是秘密觸發點 + 首次提示 */}
            <div className="relative">
              <span
                onClick={handleSecretClick}
                className="bg-green-400/20 text-green-100 px-3 py-1 rounded-full text-xs font-bold tracking-wider backdrop-blur-sm border border-green-400/30 cursor-default select-none"
              >
                2025 新制對應
              </span>
              {/* 首次進入提示氣泡 - 顯示在右側 */}
              {showTripleClickHint && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 animate-pulse">
                  <div className="relative bg-slate-900 text-white px-4 py-2 rounded-lg shadow-xl whitespace-nowrap">
                    <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-slate-900" />
                    <p className="text-sm font-bold flex items-center gap-2">
                      <span className="text-yellow-400">💡</span>
                      點三下可開啟業務小抄
                    </p>
                    <button
                      onClick={dismissHint}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight flex items-center gap-3">
            學貸活化專案
          </h1>
          <p className="text-blue-100 text-lg opacity-90 max-w-2xl">
            將學貸視為低利融資，利用「緩繳本息」與「只繳息期」新規，創造資產與負債的正向收益差額。
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
                       inputMode="numeric"
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
                 <div className="flex justify-between items-center mb-2">
                   <label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                     <Clock size={14}/> 貸款學期數
                   </label>
                   <div className="flex items-center gap-0.5">
                     <input
                       type="number" min={1} max={20} step={1}
                       inputMode="numeric"
                       value={tempSemesters}
                       onChange={(e) => setTempSemesters(e.target.value === '' ? '' : e.target.value)}
                       onBlur={finalizeSemesters}
                       onKeyDown={handleKeyDown(finalizeSemesters)}
                       className="w-12 text-right bg-transparent border-b-2 border-transparent hover:border-teal-300 focus:border-teal-500 focus:outline-none font-mono font-bold text-teal-600 text-lg transition-colors"
                     />
                     <span className="text-sm text-slate-400">學期</span>
                   </div>
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
                 <div className="flex justify-between items-center mb-2">
                   <label className="text-sm font-medium text-slate-600">預期年化報酬率</label>
                   <div className="flex items-center gap-0.5">
                     <input
                       type="number" min={3} max={10} step={0.5}
                       inputMode="decimal"
                       value={tempInvestReturnRate}
                       onChange={(e) => setTempInvestReturnRate(e.target.value === '' ? '' : e.target.value)}
                       onBlur={finalizeInvestReturnRate}
                       onKeyDown={handleKeyDown(finalizeInvestReturnRate)}
                       className="w-12 text-right bg-transparent border-b-2 border-transparent hover:border-emerald-300 focus:border-emerald-500 focus:outline-none font-mono font-bold text-emerald-600 text-lg transition-colors"
                     />
                     <span className="text-emerald-400">%</span>
                   </div>
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
                        <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                            <span>寬限期 (緩繳本息)</span>
                            <div className="flex items-center gap-0.5">
                              <input
                                type="number" min={0} max={isQualified ? 12 : 1} step={1}
                                inputMode="numeric"
                                value={tempGracePeriod}
                                onChange={(e) => setTempGracePeriod(e.target.value === '' ? '' : e.target.value)}
                                onBlur={finalizeGracePeriod}
                                onKeyDown={handleKeyDown(finalizeGracePeriod)}
                                className="w-10 text-right bg-transparent border-b border-transparent hover:border-cyan-300 focus:border-cyan-500 focus:outline-none font-bold text-cyan-700 transition-colors"
                              />
                              <span className="text-cyan-600">年</span>
                            </div>
                        </div>
                        <input
                            type="range" min={0} max={isQualified ? 12 : 1} step={1}
                            value={gracePeriod}
                            onChange={(e) => updateField('gracePeriod', Number(e.target.value))}
                            className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${isQualified ? 'bg-cyan-200 accent-cyan-600' : 'bg-slate-200 accent-slate-400'}`}
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                            {isQualified ? '含新制最多申請 12 次' : '一般戶僅畢業後 1 年'}
                        </p>
                    </div>

                    {/* 只繳息期 */}
                    <div>
                        <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                            <span>只繳息期</span>
                            <div className="flex items-center gap-0.5">
                              <input
                                type="number" min={0} max={12} step={1}
                                inputMode="numeric"
                                value={tempInterestOnlyPeriod}
                                onChange={(e) => setTempInterestOnlyPeriod(e.target.value === '' ? '' : e.target.value)}
                                onBlur={finalizeInterestOnlyPeriod}
                                onKeyDown={handleKeyDown(finalizeInterestOnlyPeriod)}
                                className="w-10 text-right bg-transparent border-b border-transparent hover:border-orange-300 focus:border-orange-500 focus:outline-none font-bold text-orange-700 transition-colors"
                              />
                              <span className="text-orange-600">年</span>
                            </div>
                        </div>
                        <input
                            type="range" min={0} max={12} step={1}
                            value={interestOnlyPeriod}
                            onChange={(e) => updateField('interestOnlyPeriod', Number(e.target.value))}
                            className="w-full h-1.5 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">新制最長可申請 12 年</p>
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
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[500px] print-break-inside relative">
            <h4 className="font-bold text-slate-700 mb-4 pl-2 border-l-4 border-blue-500">資產成長趨勢模擬</h4>
            <ResponsiveContainer width="100%" height="90%">
              <ComposedChart data={dataArr} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                {/* 背景色塊 */}
                {phases.map((p, i) => (
                    // 只有當該階段長度 > 0 時才渲染，避免重疊錯誤
                    p.range[1] > p.range[0] && (
                        <ReferenceArea key={i} x1={p.range[0]} x2={p.range[1]} fill={p.color} fillOpacity={0.1} />
                    )
                ))}

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
          </div>

          {/* 新增：資金流動相位卡 (Phase Cards) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {phases.map((phase, idx) => {
                  const isActive = phase.range[1] > phase.range[0]; // 判斷該階段是否存在
                  if (!isActive) return null;
                  
                  return (
                    <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-0 left-0 w-1 h-full" style={{backgroundColor: phase.color}}></div>
                        <div className="ml-2">
                            <h5 className="text-xs font-bold text-slate-500 mb-1">{phase.name}</h5>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xs text-slate-400">銀行月繳</span>
                                <span className={`font-mono font-bold text-lg ${phase.pay > 0 ? 'text-slate-700' : 'text-slate-300'}`}>
                                    ${phase.pay.toLocaleString()}
                                </span>
                            </div>
                            <div className="mt-2 pt-2 border-t border-slate-100">
                                <p className="text-[10px] font-bold" style={{color: phase.color}}>
                                    {phase.strategy}
                                </p>
                            </div>
                        </div>
                    </div>
                  );
              })}
          </div>

          {/* 戰略儀表板 (Dashboard) */}
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

             {/* 卡片 2: 學費套利成效 (取代新制政策紅利) */}
             <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl shadow-sm border border-emerald-100 p-4 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-2 opacity-10">
                     <PiggyBank size={60} className="text-emerald-600"/>
                 </div>
                 <div className="flex items-center gap-2 mb-3">
                     <CheckCircle2 size={18} className="text-emerald-600"/>
                     <span className="text-sm font-bold text-emerald-900">學費活化成效</span>
                 </div>
                 
                 <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">原本應付學費</span>
                        <span className="font-mono font-bold text-slate-400 line-through decoration-red-400">
                            ${loanAmount} 萬
                        </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-emerald-700">不僅免付，還倒賺</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black font-mono text-emerald-600">
                                +${currentFinalAsset.toLocaleString()}
                            </span>
                            <span className="text-sm font-bold text-emerald-500">萬</span>
                        </div>
                    </div>
                 </div>
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
          
          <div className="mt-6 p-4 bg-slate-800 rounded-xl text-center shadow-lg">
             <p className="text-slate-300 italic text-sm">
               「學貸活化專案不是為了讓你不還錢，而是讓你用更聰明的方式，把負債變成人生第一筆投資本金。」
             </p>
           </div>
        </div>

        <div className="space-y-4">
           <div className="flex items-center gap-2 mb-2">
             <Landmark className="text-emerald-600" size={24} />
             <h3 className="text-xl font-bold text-slate-800">專案四大效益</h3>
           </div>
           <div className="grid grid-cols-1 gap-3">
              {[
                { title: "低成本融資", desc: "學貸利率極低，使您有機會利用收益差額創造正向收益，解決學費資金壓力。" },
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

           {/* 進階功能入口 - 基金戰情室 */}
           <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-sm border border-slate-700 p-4 text-white mt-4">
             <h4 className="font-bold mb-3 text-sm flex items-center gap-1">
               <Landmark size={14} className="text-amber-400"/> 投資標的研究
             </h4>
             <p className="text-[11px] text-slate-300 mb-3">
               深入分析穩健配息基金、ETF 等標的，找出適合學貸活化的投資組合
             </p>
             <button
               className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500
                          hover:from-amber-600 hover:to-orange-600 rounded-lg font-bold
                          text-sm flex items-center justify-center gap-2 transition-all shadow-lg"
               onClick={() => alert('此功能僅限付費會員使用，敬請期待！')}
             >
               <Sparkles size={16} />
               進入基金戰情室
               <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-[10px]">PRO</span>
             </button>
             <p className="text-[10px] text-slate-500 mt-2 text-center">
               付費會員專屬功能
             </p>
           </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 隱藏小抄面板 */}
      {/* ============================================================ */}
      {showCheatSheet && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* 背景遮罩 */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setShowCheatSheet(false)}
          />

          {/* 側邊面板 */}
          <div className="relative w-full max-w-md bg-slate-900 text-white shadow-2xl overflow-y-auto">
            {/* 標題列 */}
            <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-4 flex justify-between items-center z-10">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  業務小抄
                  {isPaidMember && <Crown size={16} className="text-amber-400" />}
                </h3>
                <p className="text-xs text-slate-400">按 ESC 關閉</p>
              </div>
              <button onClick={() => setShowCheatSheet(false)} className="p-2 hover:bg-slate-700 rounded-lg">
                <X size={20}/>
              </button>
            </div>

            {/* 內容區域 - 根據會員等級顯示 */}
            <div className="relative">
              {/* 非付費會員：模糊遮罩 */}
              {!isPaidMember && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-md">
                  <div className="text-center p-8">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      <Lock size={40} className="text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">會員專屬功能</h4>
                    <p className="text-slate-400 text-sm mb-4">
                      業務小抄是付費會員專屬功能<br/>
                      升級後即可解鎖完整話術庫
                    </p>
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg text-white font-bold text-sm">
                        <Crown size={16} />
                        升級成為付費會員
                      </div>
                      <p className="text-[10px] text-slate-500">
                        解鎖所有工具與進階功能
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 小抄內容（非付費會員會模糊） */}
              <div className={`p-4 space-y-6 text-sm ${!isPaidMember ? 'blur-sm pointer-events-none select-none' : ''}`}>

                {/* ========== 1. 當前數據 ========== */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-800 p-2 rounded">
                    <span className="text-slate-500">學貸總額</span>
                    <p className="font-bold text-blue-400">{loanAmount} 萬</p>
                  </div>
                  <div className="bg-slate-800 p-2 rounded">
                    <span className="text-slate-500">學貸利率</span>
                    <p className="font-bold text-slate-400">{loanRate}%</p>
                  </div>
                  <div className="bg-slate-800 p-2 rounded">
                    <span className="text-slate-500">預期報酬率</span>
                    <p className="font-bold text-emerald-400">{investReturnRate}%</p>
                  </div>
                  <div className="bg-slate-800 p-2 rounded">
                    <span className="text-slate-500">收益差額</span>
                    <p className="font-bold text-emerald-400">+{(investReturnRate - loanRate).toFixed(2)}%</p>
                  </div>
                  <div className="bg-slate-800 p-2 rounded">
                    <span className="text-slate-500">現金流防禦率</span>
                    <p className={`font-bold ${coverageRatio >= 100 ? 'text-green-400' : 'text-amber-400'}`}>
                      {coverageRatio >= 999 ? '∞' : Math.round(coverageRatio)}%
                    </p>
                  </div>
                  <div className="bg-slate-800 p-2 rounded">
                    <span className="text-slate-500">期滿淨資產</span>
                    <p className="font-bold text-yellow-400">+{currentFinalAsset} 萬</p>
                  </div>
                </div>

                {/* ========== 2. 開場話術 ========== */}
                <div>
                  <h4 className="font-bold text-emerald-400 mb-2">🎬 開場</h4>
                  <div className="bg-slate-800 p-3 rounded text-xs space-y-2">
                    <p className="text-slate-300">「你有想過，<b className="text-white">學貸</b>其實是人生中利率最低的貸款之一嗎？」</p>
                    <p className="text-slate-300">「大部分人急著把學貸繳掉，但聰明人會把它變成<b className="text-white">人生的第一筆投資本金</b>。」</p>
                  </div>
                </div>

                {/* ========== 3. 核心賣點 ========== */}
                <div>
                  <h4 className="font-bold text-amber-400 mb-2">💡 核心賣點</h4>
                  <div className="space-y-2 text-xs">
                    <div className="bg-slate-800 p-2 rounded">
                      <p className="text-emerald-300 font-bold">收益差額</p>
                      <p className="text-slate-400">「學貸只要 {loanRate}%，投資預期 {investReturnRate}%，中間差 {(investReturnRate - loanRate).toFixed(1)}% 就是你的獲利空間」</p>
                    </div>
                    <div className="bg-slate-800 p-2 rounded">
                      <p className="text-blue-300 font-bold">時間複利</p>
                      <p className="text-slate-400">「越早開始投資，複利效果越驚人。同樣的錢，晚 5 年開始差距可達數十萬」</p>
                    </div>
                    <div className="bg-slate-800 p-2 rounded">
                      <p className="text-purple-300 font-bold">2025 新制紅利</p>
                      <p className="text-slate-400">「新制緩繳最長 12 年、只繳息最長 12 年，等於有超過 20 年的複利時間」</p>
                    </div>
                  </div>
                </div>

                {/* ========== 4. 異議處理 ========== */}
                <div>
                  <h4 className="font-bold text-rose-400 mb-2">🛡️ 異議處理</h4>
                  <div className="space-y-2 text-xs">
                    <div className="bg-slate-800 p-2 rounded">
                      <p className="text-rose-300 font-bold">「借錢投資不好吧？」</p>
                      <p className="text-slate-400">→ 「這不是額外借錢，而是把原本要付的學費『延後支付』，用時間差創造價值」</p>
                    </div>
                    <div className="bg-slate-800 p-2 rounded">
                      <p className="text-rose-300 font-bold">「投資會賠錢怎麼辦？」</p>
                      <p className="text-slate-400">→ 「選擇穩健的配息基金，長期年化報酬通常在 5-7%，遠高於學貸 {loanRate}%」</p>
                    </div>
                    <div className="bg-slate-800 p-2 rounded">
                      <p className="text-rose-300 font-bold">「我想早點還清沒有負債」</p>
                      <p className="text-slate-400">→ 「心情上理解，但數學上不划算。{(investReturnRate - loanRate).toFixed(1)}% 的收益差額，{totalDuration} 年後可多累積 {currentFinalAsset} 萬」</p>
                    </div>
                  </div>
                </div>

                {/* ========== 5. 收尾金句 ========== */}
                <div>
                  <h4 className="font-bold text-purple-400 mb-2">✨ 收尾金句</h4>
                  <div className="space-y-2 text-xs">
                    <div className="bg-purple-900/30 p-2 rounded border border-purple-700 text-center italic">
                      「把負債變資產，這才是富人思維」
                    </div>
                    <div className="bg-purple-900/30 p-2 rounded border border-purple-700 text-center italic">
                      「同樣是還學貸，聰明人會順便存下人生第一桶金」
                    </div>
                    <div className="bg-purple-900/30 p-2 rounded border border-purple-700 text-center italic">
                      「現在開始，{totalDuration} 年後你會感謝今天的自己」
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 增加 export default 以防 App.tsx 使用預設導入
export default StudentLoanTool;