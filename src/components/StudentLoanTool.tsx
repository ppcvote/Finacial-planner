import React, { useState } from 'react';
import { 
  GraduationCap, 
  Clock, 
  PauseCircle, 
  Calculator, 
  Wallet, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight, 
  Target, 
  PiggyBank, 
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { ResponsiveContainer, ComposedChart, Area, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

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

const calculateRemainingBalance = (principal: number, rate: number, totalYears: number, yearsElapsed: number) => {
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

export const StudentLoanTool = ({ data, setData }: any) => {
  // --- 1. 資料處理與計算邏輯 ---
  const safeData = {
    loanAmount: Number(data?.loanAmount) || 40,
    loanRate: 1.775, // 固定利率 1.775%
    investReturnRate: Number(data?.investReturnRate) || 6,
    years: Number(data?.years) || 8,
    gracePeriod: Number(data?.gracePeriod) || 1, // 寬限期預設 1 年
    interestOnlyPeriod: Number(data?.interestOnlyPeriod) || 0 // 只繳息期預設 0 年
  };
  const { loanAmount, loanRate, investReturnRate, years, gracePeriod, interestOnlyPeriod } = safeData;

  // 總時程 = 寬限期(1) + 只繳息期(0~4) + 本息攤還期(8)
  const totalDuration = gracePeriod + interestOnlyPeriod + years;

  const generateChartData = () => {
    const dataArr = [];
    const initialCapital = loanAmount * 10000; 
    
    let investmentValue = initialCapital;
    let remainingLoan = loanAmount * 10000;

    for (let year = 1; year <= totalDuration + 2; year++) { 
      // 1. 投資複利成長
      investmentValue = investmentValue * (1 + investReturnRate / 100);
      
      // 2. 貸款餘額計算
      if (year <= gracePeriod) {
         remainingLoan = loanAmount * 10000;
      } else if (year <= gracePeriod + interestOnlyPeriod) {
         remainingLoan = loanAmount * 10000;
      } else if (year <= totalDuration) {
         const repaymentYearIndex = year - (gracePeriod + interestOnlyPeriod);
         remainingLoan = calculateRemainingBalance(loanAmount, loanRate, years, repaymentYearIndex);
      } else {
         remainingLoan = 0;
      }
      
      const netWorth = investmentValue - remainingLoan;

      dataArr.push({
        year: `第${year}年`,
        投資複利價值: Math.round(investmentValue / 10000),
        淨資產: Math.round(netWorth / 10000),
        若直接繳掉: 0,
      });
    }
    return dataArr;
  };
  
  const monthlyInterestOnly = (loanAmount * 10000 * (loanRate / 100)) / 12; 
  const monthlyPaymentP_I = calculateMonthlyPayment(loanAmount, loanRate, years);
  const finalInvestValue = loanAmount * 10000 * Math.pow((1 + investReturnRate/100), totalDuration);
  const totalInterestOnlyCost = monthlyInterestOnly * 12 * interestOnlyPeriod;
  const totalAmortizationCost = monthlyPaymentP_I * 12 * years;
  const totalCost = totalInterestOnlyCost + totalAmortizationCost;
  const pureProfit = finalInvestValue - totalCost;

  // --- 2. UI 渲染 ---
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
              低風險・高流動性
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight flex items-center gap-3">
            學貸活化專案 <span className="text-lg opacity-70 font-normal mt-2">(原學貸套利)</span>
          </h1>
          <p className="text-blue-100 text-lg opacity-90 max-w-2xl">
            將學貸從「負債」轉化為人生第一筆「低成本融資」。透過時間差與利差，在還款期間保持資金流動性，創造資產增值。
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
               <div>
                 <div className="flex justify-between mb-2">
                   <label className="text-sm font-medium text-slate-600">學貸總額 (萬)</label>
                   <span className="font-mono font-bold text-blue-600 text-lg">{loanAmount}</span>
                 </div>
                 <input type="range" min={10} max={100} step={5} value={loanAmount} onChange={(e) => setData({ ...safeData, loanAmount: Number(e.target.value) })} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700 transition-all" />
               </div>

               <div>
                 <div className="flex justify-between mb-2">
                   <label className="text-sm font-medium text-slate-600 flex items-center gap-1"><Clock size={14}/> 畢業後寬限期 (年)</label>
                   <span className="font-mono font-bold text-cyan-600 text-lg">{gracePeriod} 年</span>
                 </div>
                 <input type="range" min={0} max={3} step={1} value={gracePeriod} onChange={(e) => setData({ ...safeData, gracePeriod: Number(e.target.value) })} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-600 transition-all" />
                 <p className="text-xs text-slate-400 mt-1">通常為畢業後 1 年，期間免還本息</p>
               </div>

               <div>
                 <div className="flex justify-between mb-2">
                   <label className="text-sm font-medium text-slate-600 flex items-center gap-1"><PauseCircle size={14}/> 申請只繳息期 (年)</label>
                   <span className="font-mono font-bold text-orange-500 text-lg">{interestOnlyPeriod} 年</span>
                 </div>
                 <input type="range" min={0} max={4} step={1} value={interestOnlyPeriod} onChange={(e) => setData({ ...safeData, interestOnlyPeriod: Number(e.target.value) })} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-600 transition-all" />
                 <p className="text-xs text-slate-400 mt-1">一般戶最多申請 4 年，期間本金不還</p>
               </div>

               <div>
                 <div className="flex justify-between mb-2">
                   <label className="text-sm font-medium text-slate-600">預期年化報酬率 (%)</label>
                   <span className="font-mono font-bold text-emerald-600 text-lg">{investReturnRate}</span>
                 </div>
                 <input type="range" min={3} max={10} step={0.5} value={investReturnRate} onChange={(e) => setData({ ...safeData, investReturnRate: Number(e.target.value) })} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600 hover:accent-emerald-700 transition-all" />
               </div>
            </div>
            
            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex justify-between text-sm">
                   <span className="text-slate-500">目前學貸利率</span>
                   <span className="font-bold text-slate-700">{loanRate}%</span>
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
                  <span className="text-slate-500 text-sm">若直接繳掉學費</span>
                  <span className="text-slate-400 font-bold text-sm">資產歸零</span>
               </div>
               <div className="w-full h-px bg-slate-100"></div>
             </div>
             
             <div className="text-center">
               <p className="text-slate-500 text-sm font-medium mb-1">若採用活化專案，{totalDuration}年後淨賺</p>
               <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 font-mono">
                 +${Math.round(pureProfit / 10000)}萬
               </p>
               <div className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-bold">
                  <TrendingUp size={12}/> 
                  資產增加 {Math.round((pureProfit / (loanAmount*10000)) * 100)}%
               </div>
             </div>
          </div>
        </div>

        {/* 右側：圖表展示 */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[500px] print-break-inside relative">
            <h4 className="font-bold text-slate-700 mb-4 pl-2 border-l-4 border-blue-500">資產成長趨勢模擬</h4>
            <ResponsiveContainer width="100%" height="90%">
              <ComposedChart data={generateChartData()} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorInvest" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis unit="萬" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}} 
                  itemStyle={{padding: '2px 0'}}
                />
                <Legend iconType="circle" />
                <Area type="monotone" name="活化專案淨資產" dataKey="淨資產" stroke="#0ea5e9" fill="url(#colorInvest)" strokeWidth={3} />
                <Line type="monotone" name="投資複利總值" dataKey="投資複利價值" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                <Line type="monotone" name="直接繳掉 (資產歸零)" dataKey="若直接繳掉" stroke="#ef4444" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Strategy Section: 策略說明 (整合自總結卡) */}
      <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-slate-200 print-break-inside">
        
        {/* 1. 執行循環 */}
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
                   <p className="text-sm text-slate-600 mt-1">申請學貸，在寬限期與免息期間不急於償還。將這筆錢視為您的「種子基金」。</p>
                </div>
             </div>

             <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                <div className="mt-1 min-w-[2.5rem] h-10 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">02</div>
                <div>
                   <h4 className="font-bold text-slate-800 flex items-center gap-2">穩健投資 <TrendingUp size={16} className="text-slate-400"/></h4>
                   <p className="text-sm text-slate-600 mt-1">投入高活存數位帳戶或低波動 ETF，獲取大於學貸利率 (1.65%) 的報酬，賺取無風險利差。</p>
                </div>
             </div>

             <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                <div className="mt-1 min-w-[2.5rem] h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">03</div>
                <div>
                   <h4 className="font-bold text-slate-800 flex items-center gap-2">分期還款 <ShieldCheck size={16} className="text-slate-400"/></h4>
                   <p className="text-sm text-slate-600 mt-1">利用投資收益或本金分期繳納。這不僅減輕壓力，更重要的是能建立良好的銀行信用紀錄。</p>
                </div>
             </div>
          </div>
        </div>

        {/* 2. 專案效益 */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 mb-2">
             <PiggyBank className="text-blue-600" size={24} />
             <h3 className="text-xl font-bold text-slate-800">專案四大效益</h3>
           </div>
           
           <div className="grid grid-cols-1 gap-3">
              {[
                { title: "信用加分", desc: "透過長期按時還款，在聯徵中心建立完美的信用履歷，有利未來房貸/信貸條件。" },
                { title: "無風險利差", desc: "利用數位帳戶高利活存（約 2%）與學貸低利（約 1.775%）間的差距獲利。" },
                { title: "緊急預備金", desc: "不一次將現金還光，手邊隨時保有數十萬的可動用資金，以備不時之需。" },
                { title: "理財紀律", desc: "養成「分離帳戶」與「專款專用」的習慣，是理財新手的最佳實戰演練。" }
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