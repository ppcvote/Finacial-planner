import React, { useState } from 'react';
import { 
  GraduationCap, 
  Clock, 
  PauseCircle, 
  Calculator, 
  Wallet, 
  TrendingUp, 
  ShieldCheck, 
  Target, 
  PiggyBank, 
  CheckCircle2,
  RefreshCw,
  Landmark
} from 'lucide-react';
import { ResponsiveContainer, ComposedChart, Area, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ReferenceArea } from 'recharts';

// --- 內建計算函式 (避免外部引用錯誤) ---
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
  if (rVal === 0) return pVal * 10000 * (1 - p/(n || 1));
  const balance = (pVal * 10000) * (Math.pow(1 + r, n) - Math.pow(1 + r, p)) / (Math.pow(1 + r, n) - 1);
  return Math.max(0, isNaN(balance) ? 0 : balance);
};

// --- 輔助函式 (修正: 移至組件外部，解決 ReferenceError) ---
const formatXAxisTick = (value) => {
    // 這裡我們直接使用 dataArr 中的 yearLabel
    // 由於 dataArr 存在於組件內部，我們必須在這裡簡化邏輯，只格式化數字
    return `第${value}年`;
};


export const StudentLoanTool = ({ data, setData }: any) => {
  // --- 1. 資料處理與計算邏輯 ---
  const safeData = {
    loanAmount: Number(data?.loanAmount) || 40,
    loanRate: 1.775, // 固定利率 1.775%
    investReturnRate: Number(data?.investReturnRate) || 6,
    semesters: Number(data?.semesters) || 8, // 貸款學期數
    years: 8, // 本息攤還期固定 8 年
    gracePeriod: Number(data?.gracePeriod) || 1, 
    interestOnlyPeriod: Number(data?.interestOnlyPeriod) || 0 
  };
  const { loanAmount, loanRate, investReturnRate, semesters, years, gracePeriod, interestOnlyPeriod } = safeData;

  // 修正編譯錯誤：將分界變數定義在函數外 (或使用 useMemo，但簡單計算放外邊即可)
  const studyYears = Math.ceil(semesters / 2); // 在學年數 (學貸發放期間)
  const graceEndYear = studyYears + gracePeriod;
  const interestOnlyEndYear = graceEndYear + interestOnlyPeriod;
  const repaymentEndYear = interestOnlyEndYear + years;
  const totalDuration = repaymentEndYear;
  
  // 每學期投入的學費現金流 (總額 / 學期數 / 每學期月數(6))
  const monthlySavingPerSemester = (loanAmount * 10000) / semesters / 6; 
  const totalPrincipalPaid = loanAmount * 10000; // 學生總共投入的本金 (元)

  const generateChartData = () => {
    const dataArr = [];
    let investmentValue = 0; 
    let remainingLoan = loanAmount * 10000;
    
    let cumulativeInvestmentPrincipal = 0; 
    let accumulatedInterest = 0; 

    const monthlyInterestOnly = (loanAmount * 10000 * (loanRate / 100)) / 12; 
    const monthlyPaymentP_I = calculateMonthlyPayment(loanAmount, loanRate, years);
    const monthlyRate = investReturnRate / 100 / 12;

    for (let month = 1; month <= totalDuration * 12; month++) { 
      const year = Math.ceil(month / 12);

      // 1. 計算學費現金流投入 (假設每學期初投入)
      if ((month - 1) % 6 === 0 && cumulativeInvestmentPrincipal < totalPrincipalPaid) {
         if (year <= studyYears) { 
             const semesterInput = monthlySavingPerSemester * 6;
             investmentValue += semesterInput; 
             cumulativeInvestmentPrincipal += semesterInput;
         }
      }
      
      // 2. 投資複利成長 (每月)
      investmentValue = investmentValue * (1 + monthlyRate);
      
      // 3. 貸款階段和還款成本計算
      let monthlyRepayment = 0;
      let repaymentPhase = '在學期'; 
      let repaymentYearIndex;

      if (year <= studyYears) {
         repaymentPhase = '在學期';
         remainingLoan = loanAmount * 10000;
      } else if (year <= graceEndYear) {
         repaymentPhase = '寬限期';
         remainingLoan = loanAmount * 10000;
      } else if (year <= interestOnlyEndYear) {
         repaymentPhase = '只繳息期';
         remainingLoan = loanAmount * 10000;
         monthlyRepayment = monthlyInterestOnly;
         accumulatedInterest += monthlyRepayment;
      } else if (year <= repaymentEndYear) {
         repaymentPhase = '本息攤還期';
         repaymentYearIndex = year - interestOnlyEndYear; // 攤還期從 interestOnlyEndYear+1 開始計數
         remainingLoan = calculateRemainingBalance(loanAmount, loanRate, years, repaymentYearIndex);
         monthlyRepayment = monthlyPaymentP_I;
         accumulatedInterest += monthlyRepayment; 
      } else {
         remainingLoan = 0;
         repaymentPhase = '期滿';
      }
      
      // 4. 淨資產計算: 投資價值 - 剩餘貸款
      const netWorth = investmentValue - remainingLoan;

      // 5. 圖表數據點 (每年紀錄一次)
      if (month % 12 === 0 || month === totalDuration * 12) { 
        dataArr.push({
          year: year, // 修正: 使用數字作為 X 軸數據
          yearLabel: `第${year}年`, // 額外標籤用於 Tooltip 和格式化
          投資複利價值: Math.round(investmentValue / 10000),
          淨資產: Math.round(netWorth / 10000),
          若直接繳掉: 0, 
          phase: repaymentPhase, 
          repaymentYear: year, 
        });
      }
    }
    
    // 總還款成本 (萬)
    const totalLoanRepaymentWan = Math.round(accumulatedInterest / 10000); 

    // 淨獲利 = 最終資產 (萬) - 總投入本金 (萬)
    const finalInvestValueWan = Math.round(investmentValue / 10000);
    const cumulativeInvestmentPrincipalWan = Math.round(totalPrincipalPaid / 10000); 

    const pureProfitWan = finalInvestValueWan - cumulativeInvestmentPrincipalWan;

    return { dataArr, finalInvestValueWan, cumulativeInvestmentPrincipalWan, totalLoanRepaymentWan, pureProfitWan };
  };
  
  const { dataArr, finalInvestValueWan, cumulativeInvestmentPrincipalWan, totalLoanRepaymentWan, pureProfitWan } = generateChartData();

  // 為了讓 ReferenceArea 覆蓋整個 Y 軸範圍，我們需要找到 Y 軸的實際最大/最小值
  const getMinMaxY = () => {
    if (dataArr.length === 0) return { min: -10, max: 10 };
    const allValues = dataArr.flatMap(d => [d.淨資產, d.投資複利價值, d.若直接繳掉]);
    // 稍微擴展範圍以避免邊緣裁切
    const min = Math.min(...allValues, 0) - 10; 
    const max = Math.max(...allValues, 10) + 10;
    return { min, max };
  };
  const { min: yMin, max: yMax } = getMinMaxY();
  
  // 找出各階段結束點的索引 (Index)
  const getPhaseIndex = (year) => {
    // 由於 XAxis 是數值軸，使用 year 數值本身作為 x1/x2 參數
    return year; 
  };
  
  // 修正：使用 year 數值作為 ReferenceArea 的 x1/x2 數值
  const studyEndIndex = getPhaseIndex(studyYears);
  const graceEndIndex = getPhaseIndex(graceEndYear);
  const interestOnlyEndIndex = getPhaseIndex(interestOnlyEndYear);
  const repaymentEndIndex = getPhaseIndex(repaymentEndYear);


  // 數字輸入框連動滑桿的處理
  const [tempLoanAmount, setTempLoanAmount] = useState(loanAmount);
  
  const handleLoanAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 允許輸入任何數字，不立即限制
    const value = e.target.value === '' ? '' : Number(e.target.value);
    setTempLoanAmount(value as number); // 更新輸入框的暫存值
  };

  const finalizeLoanAmount = () => {
    // 檢查並限制輸入值
    let finalValue = isNaN(tempLoanAmount as number) || tempLoanAmount === 0 ? 40 : tempLoanAmount as number;
    finalValue = Math.max(10, Math.min(100, finalValue));
    finalValue = Math.round(finalValue);
    // 更新正式的 data state (觸發計算)
    setData({ ...safeData, loanAmount: finalValue });
    setTempLoanAmount(finalValue); 
  };

  // 圖表分區的顏色定義
  const phaseColors = {
      '在學期': '#3b82f633', // 藍色 (Blue-500, 20%)
      '寬限期': '#84cc1633', // 綠色 (Lime-500, 20%)
      '只繳息期': '#f59e0b33', // 橘色 (Amber-500, 20%)
      '本息攤還期': '#06b6d433', // 青色 (Cyan-500, 20%)
  };
  


  return (
    <div className="space-y-8 animate-fade-in font-sans text-slate-800">
      
      {/* Header Section: 專案標題與核心價值 */}
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
              低風險・時間複利
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight flex items-center gap-3">
            學貸活化專案
          </h1>
          <p className="text-blue-100 text-lg opacity-90 max-w-2xl">
            將學貸視為低利融資，把「原本該繳的學費」投入投資，讓時間複利為您賺取人生第一桶金。
          </p>
        </div>
      </div>

      {/* Calculator Section: 互動試算區 */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* 左側：參數設定與關鍵指標 */}
        <div className="lg:col-span-4 space-y-6 print-break-inside">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
              <Calculator size={20} className="text-blue-600"/> 
              參數設定
            </h4>
            <div className="space-y-6">
               
               {/* 1. 學貸總額 (數字輸入與滑桿連動) */}
               <div>
                   <div className="flex justify-between items-center mb-2">
                       <label className="text-sm font-medium text-slate-600">學貸總額 (萬)</label>
                       <div className="flex items-center">
                           <input 
                               type="number" 
                               min={10} 
                               max={100} 
                               step={1}
                               value={tempLoanAmount} // 使用暫存值
                               onChange={handleLoanAmountInput}
                               onBlur={finalizeLoanAmount}
                               onKeyDown={(e) => { if (e.key === 'Enter') finalizeLoanAmount(); }}
                               className="w-16 text-right bg-transparent border-none p-0 font-mono font-bold text-blue-600 text-lg focus:ring-0 focus:border-blue-500 focus:bg-blue-50/50 rounded"
                               style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                           />
                           <span className="font-mono font-bold text-blue-600 text-lg ml-1">萬</span>
                       </div>
                   </div>
                   {/* 修正 1: 調整學貸總額滑桿級距為 1 */}
                   <input type="range" min={10} max={100} step={1} value={loanAmount} onChange={(e) => updateField('loanAmount', Number(e.target.value))} className={`w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700 transition-all`} />
               </div>

               {/* 2. 貸款學期數 (修正級距和範圍) */}
               <div>
                 <div className="flex justify-between mb-2">
                   <label className="text-sm font-medium text-slate-600 flex items-center gap-1"><Clock size={14}/> 貸款學期數</label>
                   <span className="font-mono font-bold text-teal-600 text-lg">{semesters} 學期</span>
                 </div>
                 <input type="range" min={1} max={20} step={1} value={semesters} onChange={(e) => updateField('semesters', Number(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-500 hover:accent-teal-600 transition-all" />
                 <p className="text-xs text-slate-400 mt-1">例如：四年制大學為 8 學期</p>
               </div>

               {/* 3. 畢業後寬限期 */}
               <div>
                 <div className="flex justify-between mb-2">
                   <label className="text-sm font-medium text-slate-600 flex items-center gap-1"><Clock size={14}/> 畢業後寬限期 (年)</label>
                   <span className="font-mono font-bold text-cyan-600 text-lg">{gracePeriod} 年</span>
                 </div>
                 <input type="range" min={0} max={3} step={1} value={gracePeriod} onChange={(e) => updateField('gracePeriod', Number(e.target.value))} className={`w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-600 transition-all`} />
                 <p className="text-xs text-slate-400 mt-1">期間免還本息，通常為 1 年</p>
               </div>

               {/* 4. 申請只繳息期 */}
               <div>
                 <div className="flex justify-between mb-2">
                   <label className="text-sm font-medium text-slate-600 flex items-center gap-1"><PauseCircle size={14}/> 申請只繳息期 (年)</label>
                   <span className="font-mono font-bold text-orange-500 text-lg">{interestOnlyPeriod} 年</span>
                 </div>
                 <input type="range" min={0} max={4} step={1} value={interestOnlyPeriod} onChange={(e) => updateField('interestOnlyPeriod', Number(e.target.value))} className={`w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-600 transition-all`} />
                 <p className="text-xs text-slate-400 mt-1">一般戶最多申請 4 年</p>
               </div>

               {/* 5. 預期年化報酬率 */}
               <div>
                 <div className="flex justify-between mb-2">
                   <label className="text-sm font-medium text-slate-600">預期年化報酬率 (%)</label>
                   <span className="font-mono font-bold text-emerald-600 text-lg">{investReturnRate.toFixed(1)}</span>
                 </div>
                 <input type="range" min={3} max={10} step={0.5} value={investReturnRate} onChange={(e) => updateField('investReturnRate', Number(e.target.value))} className={`w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600 hover:accent-emerald-700 transition-all`} />
               </div>
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
          
          {/* 效益摘要卡 */}
          <div className="bg-white rounded-2xl shadow border border-slate-200 p-6 flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-cyan-400"></div>
             <div className="text-center mb-4 w-full">
               <div className="flex justify-between items-center mb-2 px-2">
                  <span className="text-slate-500 text-sm">總還款額度</span>
                  <span className="text-red-500 font-bold text-lg">${totalLoanRepaymentWan.toLocaleString()}萬</span>
               </div>
               <div className="w-full h-px bg-slate-100"></div>
             </div>
             
             <div className="text-center">
               <p className="text-slate-500 text-sm font-medium mb-1">總累積淨獲利</p>
               <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 font-mono">
                 +${pureProfitWan.toLocaleString()}萬
               </p>
               <div className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-bold">
                  <TrendingUp size={12}/> 
                  最終資產價值: ${finalInvestValueWan.toLocaleString()}萬
               </div>
             </div>
          </div>
        </div>

        {/* 右側：圖表展示 */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[500px] print-break-inside relative">
            <h4 className="font-bold text-slate-700 mb-4 pl-2 border-l-4 border-blue-500">資產成長趨勢模擬</h4>
            <ResponsiveContainer width="100%" height="90%">
              <ComposedChart data={dataArr} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                
                {/* 修正 2: ReferenceArea 渲染，使用數值軸的精確位置 */}
                
                {/* 在學期 (Start Year 1 to studyYears) */}
                {studyYears > 0 && 
                  <ReferenceArea 
                    key="study"
                    x1={1} 
                    x2={studyYears + 0.5} // 擴展到下一個數據點中間
                    fill={phaseColors['在學期']}
                    fillOpacity={1}
                    stroke="none"
                    y1="dataMin" y2="dataMax" 
                  />
                }
                
                {/* 寬限期 (studyYears + 1 to graceEndYear) */}
                {gracePeriod > 0 && 
                  <ReferenceArea 
                    key="grace"
                    x1={studyYears + 0.5} 
                    x2={graceEndYear + 0.5} 
                    fill={phaseColors['寬限期']}
                    fillOpacity={1}
                    stroke="none"
                    y1="dataMin" y2="dataMax"
                  />
                }
                
                {/* 只繳息期 (graceEndYear + 1 to interestOnlyEndYear) */}
                {interestOnlyEndYear > graceEndYear && 
                  <ReferenceArea 
                    key="interest"
                    x1={graceEndYear + 0.5} 
                    x2={interestOnlyEndYear + 0.5}
                    fill={phaseColors['只繳息期']}
                    fillOpacity={1}
                    stroke="none"
                    y1="dataMin" y2="dataMax" 
                  />
                }
                
                {/* 本息攤還期 (interestOnlyEndYear + 1 to repaymentEndYear) */}
                {repaymentEndYear > interestOnlyEndYear && 
                  <ReferenceArea 
                    key="repayment"
                    x1={interestOnlyEndYear + 0.5} 
                    x2={repaymentEndYear + 0.5}
                    fill={phaseColors['本息攤還期']}
                    fillOpacity={1}
                    stroke="none"
                    y1="dataMin" y2="dataMax" 
                  />
                }


                <defs>
                  <linearGradient id="colorInvest" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                {/* XAxis type="number" dataKey="year" and use tickFormatter for labels */}
                <XAxis 
                    dataKey="year" 
                    type="number" 
                    domain={[1, totalDuration]}
                    allowDecimals={false}
                    tickFormatter={formatXAxisTick} 
                    tick={{fontSize: 12, fill: '#64748b'}} 
                    axisLine={false} 
                    tickLine={false}
                /> 
                <YAxis unit="萬" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} domain={['dataMin', 'dataMax']}/>
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}} 
                  itemStyle={{padding: '2px 0'}}
                  // 顯示 yearLabel 而非 year number
                  labelFormatter={(value) => `第${value}年`} 
                />
                <Legend iconType="circle" />
                <Line type="monotone" name="活化專案淨資產" dataKey="淨資產" stroke="#0ea5e9" fill="url(#colorInvest)" strokeWidth={3} />
                {/* 修正 4: 若直接繳掉的資產始終為 0 */}
                <Line type="monotone" name="若直接繳掉 (資產歸零)" dataKey="若直接繳掉" stroke="#94a3b8" strokeWidth={2} dot={false} strokeDasharray="4 4" />
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
        </div>
      </div>
      
      {/* 底部策略區 (執行三部曲 + 專案四大效益) */}
      <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-slate-200 print-break-inside">
        
        {/* 1. 執行三部曲 */}
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
                   <p className="text-sm text-slate-600 mt-1">在寬限/只繳息期間，利用投資收益支付學貸利息，確保現金流壓力趨近於零。</p>
                </div>
             </div>

             <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                <div className="mt-1 min-w-[2.5rem] h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">03</div>
                <div>
                   <h4 className="font-bold text-slate-800 flex items-center gap-2">資產攤還 <ShieldCheck size={16} className="text-slate-400"/></h4>
                   <p className="text-sm text-slate-600 mt-1">進入本息攤還期後，運用累積的資產和收益支付本息，讓學貸在期滿時清償，同時多出一筆錢。</p>
                </div>
             </div>
          </div>
        </div>

        {/* 2. 專案效益 */}
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

           <div className="mt-6 p-4 bg-slate-800 rounded-xl text-center shadow-lg">
             <p className="text-slate-300 italic text-sm">
               「學貸活化專案不是為了讓你不還錢，而是讓你用更聰明的方式，把負債變成人生第一筆投資本金。」
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};