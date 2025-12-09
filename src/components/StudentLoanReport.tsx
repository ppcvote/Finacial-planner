import React from 'react';
import { 
  GraduationCap, TrendingUp, ShieldCheck, Target, ArrowRight, Quote, 
  PiggyBank, Landmark, Zap, Scale, Wallet, CheckCircle2
} from 'lucide-react';
import { 
  ComposedChart, Area, Line, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer, ReferenceArea 
} from 'recharts';

// ------------------------------------------------------------------
// --- 計算邏輯 (本地獨立計算) ---
// ------------------------------------------------------------------
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

// ------------------------------------------------------------------
// 主元件: StudentLoanReport
// ------------------------------------------------------------------
const StudentLoanReport = ({ data }: { data: any }) => {
  // 1. 資料解構
  const loanAmount = Number(data?.loanAmount) || 40;
  const loanRate = 1.775; // 固定
  const investReturnRate = Number(data?.investReturnRate) || 6;
  const semesters = Number(data?.semesters) || 8;
  const years = 8;
  const gracePeriod = Number(data?.gracePeriod) || 1;
  const interestOnlyPeriod = Number(data?.interestOnlyPeriod) || 0;
  // const isQualified = Boolean(data?.isQualified); // 報表端雖不直接調整，但邏輯已內含於 gracePeriod 數值中

  // 2. 核心模擬運算 (與 Tool 一致)
  const studyYears = Math.ceil(semesters / 2);
  const graceEndYear = studyYears + gracePeriod;
  const interestOnlyEndYear = graceEndYear + interestOnlyPeriod;
  const repaymentEndYear = interestOnlyEndYear + years;
  const totalDuration = repaymentEndYear;
  
  const monthlySavingPerSemester = (loanAmount * 10000) / semesters / 6; 
  const totalPrincipalPaid = loanAmount * 10000;
  const monthlyPaymentP_I = calculateMonthlyPayment(loanAmount, loanRate, years);
  const monthlyRate = investReturnRate / 100 / 12;
  const loanMonthlyRate = loanRate / 100 / 12;

  let investmentValue = 0; 
  let remainingLoan = loanAmount * 10000;
  let cumulativeInvestmentPrincipal = 0;
  let totalInterestPaid = 0; // 累計支付利息
  let totalInvestmentProfit = 0; // 累計投資獲利
  
  // 用於圖表與分析的數據
  const chartData = [];
  let repaymentPhaseData = null; // 用於抓取還款期第一年的數據

  for (let month = 1; month <= totalDuration * 12; month++) { 
    const year = Math.ceil(month / 12);

    // 資金投入
    if ((month - 1) % 6 === 0 && year <= studyYears && cumulativeInvestmentPrincipal < totalPrincipalPaid) {
        const semesterInput = monthlySavingPerSemester * 6;
        investmentValue += semesterInput; 
        cumulativeInvestmentPrincipal += semesterInput;
    }
    
    // 支出計算
    let monthlyOutflow = 0;
    if (year <= studyYears) {
        monthlyOutflow = 0; 
    } else if (year <= graceEndYear) {
        monthlyOutflow = 0;
    } else if (year <= interestOnlyEndYear) {
        monthlyOutflow = remainingLoan * loanMonthlyRate;
        totalInterestPaid += monthlyOutflow;
    } else if (year <= repaymentEndYear) {
        monthlyOutflow = monthlyPaymentP_I;
        const interestPart = remainingLoan * loanMonthlyRate;
        totalInterestPaid += interestPart;
        const principalPart = monthlyOutflow - interestPart;
        remainingLoan = Math.max(0, remainingLoan - principalPart);
        
        // 抓取還款期第一個月的數據做為代表
        if (!repaymentPhaseData) {
            repaymentPhaseData = {
                monthlyOutflow,
                monthlyProfit: investmentValue * monthlyRate
            };
        }
    } else {
        monthlyOutflow = 0;
        remainingLoan = 0;
    }

    // 獲利計算
    const currentProfit = investmentValue * monthlyRate;
    totalInvestmentProfit += currentProfit;
    investmentValue = (investmentValue + currentProfit) - monthlyOutflow;

    if (month % 12 === 0 || month === totalDuration * 12) {
        chartData.push({
            year: year,
            淨資產: Math.round((investmentValue - remainingLoan) / 10000),
            投資複利: Math.round(investmentValue / 10000),
            一般人: 0
        });
    }
  }

  const finalNetAsset = Math.round(investmentValue / 10000);
  const totalInterestPaidWan = Math.round(totalInterestPaid / 10000);
  const totalProfitWan = Math.round(totalInvestmentProfit / 10000);
  const netArbitrageWan = totalProfitWan - totalInterestPaidWan; // 淨套利金額

  // 防護罩計算
  let coverageRatio = 0;
  let monthlyPocketMoney = 0; // 每月需自掏腰包
  if (repaymentPhaseData) {
      coverageRatio = (repaymentPhaseData.monthlyProfit / repaymentPhaseData.monthlyOutflow) * 100;
      monthlyPocketMoney = Math.max(0, repaymentPhaseData.monthlyOutflow - repaymentPhaseData.monthlyProfit);
  }

  // 圖表分區 (用於 ReferenceArea)
  const phases = [
      { name: '在學', color: '#eff6ff', range: [0, studyYears] }, // blue-50
      { name: '寬限', color: '#f0fdf4', range: [studyYears, graceEndYear] }, // green-50
      { name: '只繳息', color: '#fffbeb', range: [graceEndYear, interestOnlyEndYear] }, // amber-50
      { name: '攤還', color: '#ecfeff', range: [interestOnlyEndYear, repaymentEndYear] }, // cyan-50
  ];

  return (
    <div className="font-sans text-slate-800 space-y-6 print:space-y-4 relative text-sm print:text-xs">
      
      {/* 浮水印 */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[50] overflow-hidden mix-blend-multiply print:fixed print:top-1/2 print:left-1/2 print:-translate-x-1/2 print:-translate-y-1/2">
          <div className="opacity-[0.08] transform -rotate-12">
              <img 
                src="/logo.png" 
                alt="Watermark" 
                className="w-[500px] h-auto grayscale object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
          </div>
      </div>

      {/* 1. Header */}
      <div className="relative z-10 flex items-center justify-between border-b-2 border-blue-100 pb-4 print:pb-2 print-break-inside bg-white/50 backdrop-blur-sm">
         <div className="flex items-center gap-3">
             <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                 <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-1" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                 <GraduationCap className="text-blue-600 hidden" size={32} /> 
             </div>
             <div>
                 <span className="text-[10px] font-bold text-blue-600 tracking-widest uppercase block mb-0.5">Student Loan Arbitrage</span>
                 <h1 className="text-3xl font-black text-slate-900 mb-0.5 print:text-xl leading-none">學貸活化專案</h1>
                 <p className="text-xs text-slate-500 font-medium print:text-[10px]">將學貸轉化為人生第一筆獲利資產</p>
             </div>
         </div>
         <div className="text-right hidden print:block">
             <p className="text-[10px] text-slate-400">專案代碼</p>
             <p className="text-sm font-mono font-bold text-slate-700">SL-{loanAmount}W-{loanRate}%</p>
         </div>
      </div>

      {/* 2. 核心分析：學費歸零計畫表 (New Section A) */}
      <div className="relative z-10 bg-slate-50 rounded-2xl p-4 border border-slate-200 print-break-inside print:p-3">
          <div className="flex items-center justify-between mb-3 print:mb-2">
              <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2 print:text-sm">
                  <Scale size={20} className="text-blue-500 print:w-3.5 print:h-3.5"/>
                  學費歸零損益表
              </h2>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                  期間總結算 ({totalDuration}年)
              </span>
          </div>

          <div className="grid grid-cols-3 gap-4 divide-x divide-slate-200">
              <div className="text-center px-2">
                  <p className="text-[10px] text-slate-500 mb-1">累積支付利息 (成本)</p>
                  <p className="text-xl font-bold text-slate-400 print:text-base">-${totalInterestPaidWan} <span className="text-xs">萬</span></p>
              </div>
              <div className="text-center px-2">
                  <p className="text-[10px] text-slate-500 mb-1">累積投資獲利 (收入)</p>
                  <p className="text-xl font-bold text-emerald-500 print:text-base">+${totalProfitWan} <span className="text-xs">萬</span></p>
              </div>
              <div className="text-center px-2">
                  <p className="text-[10px] text-slate-500 mb-1">淨套利獲利</p>
                  <div className="flex items-center justify-center gap-1">
                      <p className="text-2xl font-black text-blue-600 print:text-lg">+${netArbitrageWan}</p>
                      <span className="text-xs font-bold text-blue-600">萬</span>
                  </div>
                  <p className="text-[9px] text-blue-400 mt-0.5">學費不僅免費，還倒賺</p>
              </div>
          </div>
      </div>

      {/* 3. 防護罩與資產差距 (New Section B & C) */}
      <div className="grid grid-cols-2 gap-4 print:gap-3 print-break-inside">
          
          {/* 左：還款防護罩 */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 print:p-3 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck size={18} className="text-emerald-500 print:w-4 print:h-4"/>
                  <h3 className="font-bold text-slate-700 print:text-sm">還款防護罩</h3>
              </div>
              
              <div className="flex items-end gap-2 mb-2">
                  <span className="text-3xl font-black font-mono text-emerald-600 print:text-2xl">
                      {Math.round(coverageRatio)}%
                  </span>
                  <span className="text-[10px] text-slate-400 mb-1.5">配息覆蓋率</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full mb-3">
                  <div 
                    className="h-2 rounded-full bg-emerald-500 transition-all duration-500" 
                    style={{width: `${Math.min(100, coverageRatio)}%`}}
                  ></div>
              </div>

              <div className="text-xs text-slate-600 bg-emerald-50 rounded-lg p-2 print:text-[10px]">
                  {coverageRatio >= 100 ? (
                      <span className="font-bold text-emerald-700">恭喜！配息已完全覆蓋學貸，達成自動還款。</span>
                  ) : (
                      <>
                        <span>畢業後每月僅需自付 </span>
                        <span className="font-bold text-red-500 underline">${monthlyPocketMoney.toLocaleString()}</span>
                        <span>，大幅低於同學的負擔。</span>
                      </>
                  )}
              </div>
          </div>

          {/* 右：黃金十年差距 */}
          <div className="bg-slate-800 rounded-xl p-4 print:p-3 shadow-sm text-white relative">
              <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={18} className="text-yellow-400 print:w-4 print:h-4"/>
                  <h3 className="font-bold text-white print:text-sm">黃金十年資產差距</h3>
              </div>

              <div className="space-y-4">
                  <div className="flex justify-between items-center">
                      <div className="text-xs text-slate-400">一般人 (直接繳掉)</div>
                      <div className="font-mono text-slate-400">$0</div>
                  </div>
                  <div className="w-full bg-slate-600 h-px"></div>
                  <div className="flex justify-between items-center">
                      <div className="font-bold text-yellow-400 text-sm">您的資產 (專案結餘)</div>
                      <div className="font-mono font-black text-2xl text-yellow-400 print:text-xl">
                          ${finalNetAsset} <span className="text-sm">萬</span>
                      </div>
                  </div>
              </div>
              
              <div className="absolute bottom-2 right-2 opacity-10">
                  <PiggyBank size={60} />
              </div>
          </div>
      </div>

      {/* 4. 執行藍圖 (Phase Cards) */}
      <div className="relative z-10 print-break-inside">
          <h2 className="text-lg font-bold text-slate-700 mb-3 flex items-center gap-2 print:text-sm print:mb-2">
              <ArrowRight size={20} className="text-blue-600 print:w-3.5 print:h-3.5"/>
              執行藍圖 (SOP)
          </h2>
          <div className="grid grid-cols-4 gap-2">
              {[
                  { name: '在學期', desc: '累積本金', sub: '借款投入', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                  { name: '寬限期', desc: '複利滾存', sub: '只進不出', color: 'bg-green-50 text-green-700 border-green-200' },
                  { name: '只繳息', desc: '最低支出', sub: '配息Cover', color: 'bg-amber-50 text-amber-700 border-amber-200' },
                  { name: '攤還期', desc: '資產償債', sub: '無痛結清', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
              ].map((p, i) => (
                  <div key={i} className={`rounded-lg border p-2 text-center ${p.color} print:p-1.5`}>
                      <p className="text-[10px] opacity-70 mb-0.5">{p.sub}</p>
                      <h4 className="font-bold text-sm mb-0.5 print:text-xs">{p.name}</h4>
                      <p className="text-xs font-bold print:text-[10px]">{p.desc}</p>
                  </div>
              ))}
          </div>
      </div>

      {/* 5. 資產趨勢圖 */}
      <div className="relative z-10 space-y-2 print-break-inside">
          <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2 print:text-sm">
                  <TrendingUp size={20} className="text-blue-600 print:w-3.5 print:h-3.5"/>
                  資產成長模擬
              </h2>
              <div className="text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                  {semesters}學期 / 利率 {loanRate}%
              </div>
          </div>
          
          <div className="h-[250px] w-full border border-slate-100 rounded-xl p-3 bg-white shadow-sm print:h-[200px] print:p-2">
              <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                      {phases.map((p, i) => (
                          <ReferenceArea key={i} x1={p.range[0]} x2={p.range[1]} fill={p.color} fillOpacity={0.5} stroke="none"/>
                      ))}
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="year" tick={{fontSize: 9}} tickLine={false} axisLine={false} interval={1}/>
                      <YAxis unit="萬" tick={{fontSize: 9}} width={25} tickLine={false} axisLine={false}/>
                      <Legend wrapperStyle={{ fontSize: '9px', paddingTop: '2px' }} iconSize={8}/>
                      
                      <Line type="monotone" dataKey="投資複利" name="總資產" stroke="#10b981" strokeWidth={2} dot={false}/>
                      <Area type="monotone" dataKey="淨資產" name="淨值(扣債)" stroke="#0ea5e9" fill="#e0f2fe" strokeWidth={2}/>
                      <Line type="monotone" dataKey="一般人" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1} dot={false}/>
                  </ComposedChart>
              </ResponsiveContainer>
          </div>
      </div>

      {/* 6. 專案亮點 (List) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 print:p-3 print-break-inside">
          <h3 className="font-bold text-slate-700 text-sm mb-3 flex items-center gap-2">
              <Zap size={16} className="text-yellow-500"/> 專案執行亮點
          </h3>
          <ul className="grid grid-cols-2 gap-2 text-xs text-slate-600 print:text-[10px]">
              <li className="flex items-start gap-1.5"><CheckCircle2 size={12} className="text-green-500 mt-0.5 shrink-0"/> <span>利用「緩繳期」與「只繳息」新規，極大化利差效益。</span></li>
              <li className="flex items-start gap-1.5"><CheckCircle2 size={12} className="text-green-500 mt-0.5 shrink-0"/> <span>將學費轉為「定期定額」投資，強迫儲蓄累積資產。</span></li>
              <li className="flex items-start gap-1.5"><CheckCircle2 size={12} className="text-green-500 mt-0.5 shrink-0"/> <span>建立良好信用紀錄，畢業即擁有第一桶金與銀行信用。</span></li>
              <li className="flex items-start gap-1.5"><CheckCircle2 size={12} className="text-green-500 mt-0.5 shrink-0"/> <span>保留現金流彈性，應對求學或剛就業時的突發需求。</span></li>
          </ul>
      </div>

      {/* 7. 顧問總結 */}
      <div className="relative z-10 bg-slate-50 p-4 rounded-xl border-l-4 border-blue-500 print-break-inside print:p-3 print:mt-4">
          <div className="flex gap-3">
               <Quote className="text-blue-300 shrink-0" size={24} />
               <div>
                   <h3 className="font-bold text-slate-800 text-sm mb-1">顧問觀點</h3>
                   <p className="text-slate-600 text-xs leading-relaxed">
                       「學貸是多數人這輩子唯一能借到這麼低利、條件這麼寬鬆的資金。懂得善用這筆『天使資金』，將負債轉化為生息資產，是您邁向財富自由的第一堂必修課。」
                   </p>
               </div>
          </div>
      </div>

    </div>
  );
};

export default StudentLoanReport;