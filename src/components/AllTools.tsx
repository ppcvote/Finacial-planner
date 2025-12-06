import React from 'react';
import { Building2, Calculator, Scale, GraduationCap, Clock, PauseCircle, Rocket, Car, Waves, Landmark, ShieldAlert, Umbrella } from 'lucide-react';
import { ResponsiveContainer, ComposedChart, Area, Line, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, BarChart, AreaChart } from 'recharts';
import { calculateMonthlyPayment, calculateMonthlyIncome, calculateRemainingBalance } from '../utils';

// 這個檔案集中了除百萬禮物外的所有工具，您可以隨時將它們再獨立拆分

export const FinancialRealEstateTool = ({ data, setData }) => {
  const safeData = {
    loanAmount: Number(data?.loanAmount) || 1000,
    loanTerm: Number(data?.loanTerm) || 30,
    loanRate: Number(data?.loanRate) || 2.2,
    investReturnRate: Number(data?.investReturnRate) || 6
  };
  const { loanAmount, loanTerm, loanRate, investReturnRate } = safeData;

  const monthlyLoanPayment = calculateMonthlyPayment(loanAmount, loanRate, loanTerm);
  const monthlyInvestIncome = calculateMonthlyIncome(loanAmount, investReturnRate);
  const monthlyCashFlow = monthlyInvestIncome - monthlyLoanPayment;
  const isNegativeCashFlow = monthlyCashFlow < 0; 
  const totalOutOfPocket = isNegativeCashFlow ? Math.abs(monthlyCashFlow) * 12 * loanTerm : 0;
  
  // 計算期滿後的總資產價值 (本金 + 累積的正現金流 或 扣除負現金流後的淨值，但這邊強調"擁有的資產")
  // 邏輯：期滿時，貸款為0，擁有的資產為 loanAmount (假設本金不變)，加上累積的現金流(如果是正的)
  // 若是負現金流，其實資產還是 loanAmount，只是過程有付出。
  // 為了簡單有力，這裡顯示「期滿資產現值」(假設本金沒虧損)
  const finalAssetValue = loanAmount * 10000;

  const generateHouseChartData = () => {
    const dataArr = [];
    let cumulativeNetIncome = 0; 
    for (let year = 1; year <= loanTerm; year++) {
      cumulativeNetIncome += monthlyCashFlow * 12;
      const remainingLoan = calculateRemainingBalance(loanAmount, loanRate, loanTerm, year);
      const assetEquity = (loanAmount * 10000) - remainingLoan;
      // 這裡顯示的是「淨資產」概念：(資產市值 - 剩餘貸款) + 累積現金流
      const financialTotalWealth = assetEquity + cumulativeNetIncome;
      const step = loanTerm > 20 ? 3 : 1; 
      if (year === 1 || year % step === 0 || year === loanTerm) {
         dataArr.push({ year: `第${year}年`, 總資產價值: Math.round(financialTotalWealth / 10000), 剩餘貸款: Math.round(remainingLoan / 10000) });
      }
    }
    return dataArr;
  };

  const updateField = (field, value) => { setData({ ...safeData, [field]: value }); };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg print-break-inside">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Building2 className="text-emerald-200" /> 金融房產專案</h3>
        <p className="text-emerald-100 opacity-90">以息養貸，利用長年期貸款讓資產自動增值，打造數位包租公模式。</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4 print-break-inside">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2"><Calculator size={18} /> 資產參數</h4>
            <div className="space-y-6">
               {[
                 { label: "資產/貸款總額 (萬)", field: "loanAmount", min: 500, max: 3000, step: 100, val: loanAmount, color: "emerald" },
                 { label: "貸款年期 (年)", field: "loanTerm", min: 20, max: 40, step: 1, val: loanTerm, color: "emerald" },
                 { label: "貸款利率 (%)", field: "loanRate", min: 1.5, max: 4.0, step: 0.1, val: loanRate, color: "emerald" },
                 { label: "配息率 (%)", field: "investReturnRate", min: 3, max: 10, step: 0.5, val: investReturnRate, color: "blue" }
               ].map((item) => (
                 <div key={item.field}>
                   <div className="flex justify-between mb-2">
                     <label className="text-sm font-medium text-slate-600">{item.label}</label>
                     <span className={`font-mono font-bold text-${item.color}-600`}>{item.val}</span>
                   </div>
                   <input type="range" min={item.min} max={item.max} step={item.step} value={item.val} onChange={(e) => setData({ ...safeData, [item.field]: Number(e.target.value) })} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
                 </div>
               ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow border border-slate-200 p-6 print-break-inside">
              <h3 className="text-center font-bold text-slate-700 mb-4">每月現金流試算</h3>
              <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="flex justify-between items-center text-sm"><span className="text-slate-600 font-medium">1. 每月配息收入</span><span className="font-mono text-emerald-600 font-bold">+${Math.round(monthlyInvestIncome).toLocaleString()}</span></div>
                <div className="flex justify-between items-center text-sm"><span className="text-slate-600 font-medium">2. 扣除貸款支出</span><span className="font-mono text-red-500 font-bold">-${Math.round(monthlyLoanPayment).toLocaleString()}</span></div>
                <div className="border-t border-slate-200 my-2"></div>
                {isNegativeCashFlow ? (
                   <div className="text-center">
                     <div className="text-xs text-slate-400 mb-1">每月需負擔</div>
                     <div className="text-3xl font-black text-red-500 font-mono">-${Math.abs(Math.round(monthlyCashFlow)).toLocaleString()}</div>
                     <div className="mt-4 bg-orange-50 rounded-lg p-3 border border-orange-100">
                        <div className="flex items-center justify-center gap-2 text-orange-800 font-bold text-sm mb-1"><Scale className="w-4 h-4" /> 槓桿效益分析</div>
                        <div className="text-xs text-orange-700 mb-2">{loanTerm}年總共只付出 <span className="font-bold underline">${Math.round(totalOutOfPocket/10000)}萬</span></div>
                        <div className="text-xs bg-white rounded py-1 px-2 text-orange-800 border border-orange-200">換取 <span className="font-bold text-lg">${loanAmount}萬</span> 原始資產</div>
                     </div>
                   </div>
                ) : (
                   <div className="text-center">
                     <div className="text-xs text-slate-400 mb-1">每月淨現金流</div>
                     <div className="text-3xl font-black text-emerald-600 font-mono">+${Math.round(monthlyCashFlow).toLocaleString()}</div>
                     <div className="text-xs mt-2 text-slate-500">完全由資產養貸，還有找！</div>
                   </div>
                )}
              </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-[350px] print-break-inside">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={generateHouseChartData()} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs><linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis unit="萬" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend />
                <Area type="monotone" name="總資產價值" dataKey="總資產價值" stroke="#10b981" fill="url(#colorWealth)" strokeWidth={3} />
                <Line type="monotone" name="剩餘房貸" dataKey="剩餘貸款" stroke="#ef4444" strokeWidth={1} dot={false} opacity={0.5} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* 新增：金融房產專案 - 核心總結卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print-break-inside">
             {/* Card 1: 過程 (現金流) */}
             <div className={`border rounded-xl p-5 relative overflow-hidden group hover:shadow-md transition-all ${isNegativeCashFlow ? 'bg-orange-50 border-orange-100' : 'bg-emerald-50 border-emerald-100'}`}>
                <div className="relative">
                  <div className={`font-bold text-lg mb-1 flex items-center gap-2 ${isNegativeCashFlow ? 'text-orange-800' : 'text-emerald-800'}`}>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isNegativeCashFlow ? 'bg-orange-200' : 'bg-emerald-200'}`}>過程</span>
                    每月現金流
                  </div>
                  <div className="text-xs text-slate-500 mb-2 font-medium">
                    {isNegativeCashFlow ? '每月僅需負擔' : '每月被動收入'}
                  </div>
                  <div className={`text-3xl font-black font-mono tracking-tight ${isNegativeCashFlow ? 'text-orange-600' : 'text-emerald-600'}`}>
                     {isNegativeCashFlow ? '-' : '+'}${Math.abs(Math.round(monthlyCashFlow)).toLocaleString()}
                  </div>
                  <div className="mt-2 text-xs font-bold text-slate-500">
                    {isNegativeCashFlow ? '房客(配息)幫您繳了大半房貸' : '無痛養房，資金完全自給自足'}
                  </div>
                </div>
             </div>

             {/* Card 2: 投入 (槓桿成本) */}
             <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 relative overflow-hidden group hover:shadow-md transition-all">
                <div className="relative">
                  <div className="text-slate-800 font-bold text-lg mb-1 flex items-center gap-2">
                    <span className="bg-slate-200 text-slate-800 text-xs px-2 py-0.5 rounded-full">投入</span>
                    總自付成本
                  </div>
                  <div className="text-xs text-slate-500 mb-2 font-medium">{loanTerm} 年總計投入</div>
                  <div className="text-3xl font-black text-slate-700 font-mono tracking-tight">
                     ${Math.round(totalOutOfPocket).toLocaleString()}
                  </div>
                   <div className="mt-2 text-xs text-slate-500">
                    <span className="text-emerald-600 font-bold bg-emerald-100 px-1 py-0.5 rounded mr-1">
                      {totalOutOfPocket > 0 ? `槓桿 ${(loanAmount * 10000 / totalOutOfPocket).toFixed(1)} 倍` : '無限大'}
                    </span>
                    以小博大換取 {loanAmount} 萬資產
                  </div>
                </div>
             </div>

             {/* Card 3: 終局 (資產歸屬) */}
             <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-100 rounded-full opacity-50 group-hover:scale-150 transition-transform"></div>
                <div className="relative">
                  <div className="text-emerald-800 font-bold text-lg mb-1 flex items-center gap-2">
                    <span className="bg-emerald-200 text-emerald-800 text-xs px-2 py-0.5 rounded-full">終局</span>
                    期滿擁有資產
                  </div>
                  <div className="text-xs text-slate-500 mb-2 font-medium">貸款還清，資產全拿</div>
                  <div className="text-3xl font-black text-emerald-600 font-mono tracking-tight">
                     ${(finalAssetValue / 10000).toLocaleString()}萬
                  </div>
                  <div className="mt-2 text-xs text-emerald-600 font-bold">
                    資產完全屬於您 + 終身領息
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const StudentLoanTool = ({ data, setData }) => {
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg print-break-inside">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><GraduationCap className="text-sky-100" /> 學貸套利專案 (進階版)</h3>
        <p className="text-sky-100 opacity-90">善用「寬限期」與「只繳息期」延長資金壽命，最大化複利效應。</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4 print-break-inside">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2"><Calculator size={18} /> 參數設定</h4>
            <div className="space-y-6">
               <div>
                 <div className="flex justify-between mb-2">
                   <label className="text-sm font-medium text-slate-600">學貸總額 (萬)</label>
                   <span className="font-mono font-bold text-blue-600">{loanAmount}</span>
                 </div>
                 <input type="range" min={10} max={100} step={5} value={loanAmount} onChange={(e) => setData({ ...safeData, loanAmount: Number(e.target.value) })} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
               </div>

               <div>
                 <div className="flex justify-between mb-2">
                   <label className="text-sm font-medium text-slate-600 flex items-center gap-1"><Clock size={14}/> 畢業後寬限期 (年)</label>
                   <span className="font-mono font-bold text-sky-600">{gracePeriod} 年</span>
                 </div>
                 <input type="range" min={0} max={3} step={1} value={gracePeriod} onChange={(e) => setData({ ...safeData, gracePeriod: Number(e.target.value) })} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500" />
                 <p className="text-xs text-slate-400 mt-1">通常為畢業後 1 年</p>
               </div>

               <div>
                 <div className="flex justify-between mb-2">
                   <label className="text-sm font-medium text-slate-600 flex items-center gap-1"><PauseCircle size={14}/> 申請只繳息期 (年)</label>
                   <span className="font-mono font-bold text-orange-500">{interestOnlyPeriod} 年</span>
                 </div>
                 <input type="range" min={0} max={4} step={1} value={interestOnlyPeriod} onChange={(e) => setData({ ...safeData, interestOnlyPeriod: Number(e.target.value) })} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                 <p className="text-xs text-slate-400 mt-1">一般戶最多可申請 4 年，期間本金不還</p>
               </div>

               <div>
                 <div className="flex justify-between mb-2">
                   <label className="text-sm font-medium text-slate-600">投資報酬率 (%)</label>
                   <span className="font-mono font-bold text-green-600">{investReturnRate}</span>
                 </div>
                 <input type="range" min={3} max={10} step={0.5} value={investReturnRate} onChange={(e) => setData({ ...safeData, investReturnRate: Number(e.target.value) })} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600" />
               </div>
            </div>
            
            <div className="mt-6 p-3 bg-slate-100 rounded-lg">
                <div className="flex justify-between text-sm mb-1">
                   <span className="text-slate-500">固定利率</span>
                   <span className="font-bold text-slate-700">{loanRate}%</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                   <span className="text-slate-500">總資金運用期</span>
                   <span className="font-bold text-blue-600">{totalDuration} 年</span>
                </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow border border-slate-200 p-6">
             <div className="text-center mb-4">
               <p className="text-slate-500 text-sm">若直接繳掉學費</p>
               <p className="text-xl font-bold text-slate-400">資產歸零</p>
             </div>
             <div className="border-t border-slate-100 my-4"></div>
             <div className="text-center">
               <p className="text-slate-500 text-sm">若利用學貸套利</p>
               <p className="text-3xl font-black text-sky-600 font-mono">+${Math.round(pureProfit / 10000)}萬</p>
               <p className="text-xs text-slate-400 mt-1">{totalDuration}年後 淨賺金額</p>
             </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-[400px] print-break-inside">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={generateChartData()} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <defs><linearGradient id="colorInvest" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/><stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis unit="萬" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend />
                <Area type="monotone" name="套利淨資產" dataKey="淨資產" stroke="#0ea5e9" fill="url(#colorInvest)" strokeWidth={3} />
                <Line type="monotone" name="投資複利總值" dataKey="投資複利價值" stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 3" />
                <Line type="monotone" name="直接繳掉 (資產=0)" dataKey="若直接繳掉" stroke="#ef4444" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SuperActiveSavingTool = ({ data, setData }) => {
  const safeData = {
    monthlySaving: Number(data?.monthlySaving) || 10000,
    investReturnRate: Number(data?.investReturnRate) || 6,
    activeYears: Number(data?.activeYears) || 15,
    totalYears: 40 // 固定比較基準
  };
  const { monthlySaving, investReturnRate, activeYears, totalYears } = safeData;

  const fullChartData = [];
  let pAcc = 0; // 消極累積
  let aInv = 0; // 積極累積
  
  for (let year = 1; year <= totalYears; year++) {
      pAcc += monthlySaving * 12;
      if (year <= activeYears) {
          aInv = (aInv + monthlySaving * 12) * (1 + investReturnRate / 100);
      } else {
          aInv = aInv * (1 + investReturnRate / 100);
      }
      
      fullChartData.push({
          year: `第${year}年`,
          消極存錢: Math.round(pAcc / 10000),
          積極存錢: Math.round(aInv / 10000),
      });
  }

  const finalPassive = pAcc;
  const finalAsset = Math.round(aInv / 10000);
  const totalPrincipalActive = monthlySaving * 12 * activeYears;
  const totalPrincipalPassive = monthlySaving * 12 * totalYears;
  const updateField = (field, value) => { setData({ ...safeData, [field]: value }); };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-lg print-break-inside">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Rocket className="text-purple-200" /> 超積極存錢法</h3>
        <p className="text-purple-100 opacity-90">辛苦 15 年，換來提早 10 年的財富自由。用複利對抗勞力。</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4 print-break-inside">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2"><Calculator size={18} /> 參數設定</h4>
            <div className="space-y-6">
               {[
                 { label: "每月存錢金額", field: "monthlySaving", min: 3000, max: 50000, step: 1000, val: monthlySaving, color: "purple" },
                 { label: "只需辛苦 (年)", field: "activeYears", min: 5, max: 25, step: 1, val: activeYears, color: "pink" },
                 { label: "投資報酬率 (%)", field: "investReturnRate", min: 3, max: 12, step: 0.5, val: investReturnRate, color: "green" }
               ].map((item) => (
                 <div key={item.field}>
                   <div className="flex justify-between mb-2">
                     <label className="text-sm font-medium text-slate-600">{item.label}</label>
                     <span className={`font-mono font-bold text-${item.color}-600`}>{item.field === 'monthlySaving' ? '$' : ''}{item.val.toLocaleString()}</span>
                   </div>
                   <input type="range" min={item.min} max={item.max} step={item.step} value={item.val} onChange={(e) => updateField(item.field, Number(e.target.value))} className={`w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-${item.color}-600`} />
                 </div>
               ))}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow border border-slate-200 p-6">
             <div className="text-center mb-4">
               <p className="text-slate-500 text-sm">消極存錢 (存40年)</p>
               <p className="text-xl font-bold text-slate-600">${Math.round(finalPassive/10000)}萬</p>
             </div>
             <div className="border-t border-slate-100 my-4"></div>
             <div className="text-center">
               <p className="text-slate-500 text-sm">積極存錢 (存{activeYears}年)</p>
               <p className="text-3xl font-black text-purple-600 font-mono">${finalAsset}萬</p>
               <p className="text-xs text-slate-400 mt-1">
                 省下 ${Math.round((totalPrincipalPassive - totalPrincipalActive)/10000)}萬 本金
               </p>
             </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-[400px] print-break-inside">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={fullChartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#9333ea" stopOpacity={0.3}/><stop offset="95%" stopColor="#9333ea" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis unit="萬" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend />
                <Area type="monotone" name="積極存錢 (複利)" dataKey="積極存錢" stroke="#9333ea" fill="url(#colorActive)" strokeWidth={3} />
                <Line type="monotone" name="消極存錢 (勞力)" dataKey="消極存錢" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CarReplacementTool = ({ data, setData }) => {
  const safeData = {
    carPrice: Number(data?.carPrice) || 100, // 萬
    investReturnRate: Number(data?.investReturnRate) || 6, // %
    resaleRate: Number(data?.resaleRate) || 50 // %
  };
  const { carPrice, investReturnRate, resaleRate } = safeData;

  const downPayment = 20; 
  const loanAmount = carPrice - downPayment; 
  const loanMonthlyPayment = loanAmount * (14500/80); 

  const generateCycles = () => {
    const cycles = [];
    let policyPrincipal = carPrice * 1; 
    
    for(let i=1; i<=3; i++) {
        const monthlyDividend = (policyPrincipal * 10000 * (investReturnRate/100)) / 12;
        const netMonthlyPayment = loanMonthlyPayment - monthlyDividend;
        
        cycles.push({
            cycle: `第 ${i} 台車`,
            principal: Math.round(policyPrincipal),
            dividend: Math.round(monthlyDividend),
            originalPay: Math.round(loanMonthlyPayment),
            netPay: Math.round(netMonthlyPayment)
        });

        const resaleValue = data.carPrice * (data.resaleRate/100);
        const surplus = resaleValue - downPayment;
        policyPrincipal += surplus;
    }
    return cycles;
  };

  const cyclesData = generateCycles();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg print-break-inside">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Car className="text-orange-100" /> 五年換車專案</h3>
        <p className="text-orange-100 opacity-90">只存一次錢，運用時間複利與車輛殘值，實現每5年輕鬆換新車。</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4 print-break-inside">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2"><Calculator size={18} /> 參數設定</h4>
            <div className="space-y-6">
               {[
                 { label: "目標車價 (萬)", field: "carPrice", min: 60, max: 300, step: 10, val: carPrice, color: "orange" },
                 { label: "投資報酬率 (%)", field: "investReturnRate", min: 3, max: 10, step: 0.5, val: investReturnRate, color: "green" },
                 { label: "5年後中古殘值 (%)", field: "resaleRate", min: 30, max: 70, step: 5, val: resaleRate, color: "blue" }
               ].map((item) => (
                 <div key={item.field}>
                   <div className="flex justify-between mb-2">
                     <label className="text-sm font-medium text-slate-600">{item.label}</label>
                     <span className={`font-mono font-bold text-${item.color}-600`}>{item.val}</span>
                   </div>
                   <input type="range" min={item.min} max={item.max} step={item.step} value={item.val} onChange={(e) => setData({ ...safeData, [item.field]: Number(e.target.value) })} className={`w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-${item.color}-600`} />
                 </div>
               ))}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow border border-slate-200 p-6">
             <div className="text-center mb-4">
                <p className="text-slate-500 text-sm">傳統買車 (第3台)</p>
                <p className="text-xl font-bold text-slate-600">月付 ${Math.round(cyclesData[0].originalPay).toLocaleString()}</p>
             </div>
             <div className="border-t border-slate-100 my-4"></div>
             <div className="text-center">
                <p className="text-slate-500 text-sm">專案換車 (第3台)</p>
                <p className="text-3xl font-black text-orange-600 font-mono">月付 ${cyclesData[2].netPay.toLocaleString()}</p>
             </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-[350px] print-break-inside">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={cyclesData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorNetPay" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/><stop offset="95%" stopColor="#f97316" stopOpacity={0.4}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="cycle" tick={{fontSize: 14, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                <YAxis unit="元" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend />
                <Bar dataKey="netPay" name="實際月付金" fill="url(#colorNetPay)" barSize={40} radius={[8, 8, 0, 0]} label={{ position: 'top', fill: '#f97316', fontSize: 12, fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="originalPay" name="原車貸月付" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export const LaborPensionTool = ({ data, setData }) => {
  const safeData = {
    currentAge: Number(data?.currentAge) || 30,
    retireAge: Number(data?.retireAge) || 65,
    salary: Number(data?.salary) || 45000,
    laborInsYears: Number(data?.laborInsYears) || 35, 
    selfContribution: Boolean(data?.selfContribution),
    pensionReturnRate: Number(data?.pensionReturnRate) || 3, 
    desiredMonthlyIncome: Number(data?.desiredMonthlyIncome) || 50000
  };
  const { currentAge, retireAge, salary, laborInsYears, selfContribution, pensionReturnRate, desiredMonthlyIncome } = safeData;

  const laborInsBase = Math.min(Math.max(salary, 26400), 45800); 
  const laborInsMonthly = laborInsBase * data.laborInsYears * 0.0155;
  const monthlyContribution = Math.min(data.salary, 150000) * (0.06 + (data.selfContribution ? 0.06 : 0));
  const monthsToRetire = (data.retireAge - data.currentAge) * 12;
  const monthlyRate = data.pensionReturnRate / 100 / 12;
  const pensionTotal = monthlyContribution * ((Math.pow(1 + monthlyRate, monthsToRetire) - 1) / monthlyRate);
  const pensionMonthly = pensionTotal / 240; 
  const gap = data.desiredMonthlyIncome - (laborInsMonthly + pensionMonthly);

  const chartData = [
    { name: '勞保年金', value: Math.round(laborInsMonthly), fill: '#3b82f6' },
    { name: '勞退月領', value: Math.round(pensionMonthly), fill: '#10b981' },
    { name: '退休缺口', value: Math.max(0, Math.round(gap)), fill: '#ef4444' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-2xl p-6 text-white shadow-lg print-break-inside">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Umbrella className="text-slate-200" /> 退休缺口試算</h3>
        <p className="text-slate-300 opacity-90">政府給的夠用嗎？30秒算出你的退休生活品質。</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4 print-break-inside">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2"><Calculator size={18} /> 個人參數</h4>
            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-xs font-bold text-slate-500">目前年齡</label>
                   <input type="number" value={currentAge} onChange={(e) => setData({ ...safeData, currentAge: Number(e.target.value) })} className="w-full p-2 border rounded mt-1" />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-slate-500">預計退休</label>
                   <input type="number" value={retireAge} onChange={(e) => setData({ ...safeData, retireAge: Number(e.target.value) })} className="w-full p-2 border rounded mt-1" />
                 </div>
               </div>
               
               {/* 簡化顯示，只保留核心輸入 */}
               <div>
                 <label className="text-sm font-medium text-slate-600">目前投保薪資: ${salary}</label>
                 <input type="range" min={26400} max={150000} step={1000} value={salary} onChange={(e) => setData({ ...safeData, salary: Number(e.target.value) })} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600" />
               </div>
               
               <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-sm font-bold text-slate-600">勞退自提 6%</span>
                  <button onClick={() => setData({ ...safeData, selfContribution: !selfContribution })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${selfContribution ? 'bg-green-500' : 'bg-slate-300'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${selfContribution ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
               </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow border border-slate-200 p-6">
             <div className="text-center">
                <p className="text-slate-500 text-sm">財務缺口 (每月)</p>
                <p className="text-4xl font-black text-red-500 font-mono">${Math.max(0, Math.round(gap)).toLocaleString()}</p>
             </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[450px]">
             <h4 className="font-bold text-slate-700 mb-4 pl-2">退休金結構分析</h4>
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ name: '月收入', ...chartData.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.value }), {}) }]} margin={{ top: 20, right: 40, left: 40, bottom: 5 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tick={{fontSize: 14}} axisLine={false} tickLine={false} width={100} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Legend />
                  {chartData.map((d, i) => (
                     <Bar key={i} dataKey={d.name} fill={d.fill} barSize={40} label={{ position: 'right', fill: '#64748b', fontWeight: 'bold', formatter: (val) => `$${val}萬` }} />
                  ))}
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BigSmallReservoirTool = ({ data, setData }) => {
  const safeData = {
    initialCapital: Number(data?.initialCapital) || 1000, // 萬
    dividendRate: Number(data?.dividendRate) || 6, // %
    reinvestRate: Number(data?.reinvestRate) || 6, // %
    years: Number(data?.years) || 10 // 年
  };
  const { initialCapital, dividendRate, reinvestRate, years } = safeData;

  const annualDividend = data.initialCapital * (data.dividendRate / 100);

  const generateChartData = () => {
    const dataArr = [];
    let reinvestedTotal = 0; 
    for (let year = 1; year <= data.years + 5; year++) {
      if (year <= data.years) reinvestedTotal = (reinvestedTotal + annualDividend) * (1 + data.reinvestRate / 100);
      else reinvestedTotal = reinvestedTotal * (1 + data.reinvestRate / 100);
      dataArr.push({
        year: `第${year}年`,
        大水庫本金: data.initialCapital,
        小水庫累積: Math.round(reinvestedTotal),
      });
    }
    return dataArr;
  };
  
  const chartData = generateChartData();
  const totalAsset = initialCapital + chartData[years-1]?.小水庫累積 || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg print-break-inside">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Waves className="text-cyan-200" /> 大小水庫專案</h3>
        <p className="text-cyan-100 opacity-90">資產活化術：母錢生子錢，子錢再生孫錢。</p>
      </div>
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4 print-break-inside">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2"><Calculator size={18} /> 參數設定</h4>
            {/* 簡化顯示 */}
            <div className="space-y-6">
                <div>
                   <label>大水庫本金: ${initialCapital}</label>
                   <input type="range" min={100} max={5000} step={50} value={initialCapital} onChange={(e) => setData({ ...safeData, initialCapital: Number(e.target.value) })} className="w-full h-2 bg-slate-200 rounded-lg accent-blue-600" />
                </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow border border-slate-200 p-6">
             <div className="text-center">
                <p className="text-slate-500 text-sm">{years}年後總資產</p>
                <p className="text-4xl font-black text-cyan-600 font-mono">${totalAsset}萬</p>
             </div>
          </div>
        </div>
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[450px]">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorBig" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0891b2" stopOpacity={0.8}/><stop offset="95%" stopColor="#0891b2" stopOpacity={0.4}/></linearGradient>
                    <linearGradient id="colorSmall" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8}/><stop offset="95%" stopColor="#fbbf24" stopOpacity={0.4}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="year" tick={{fontSize: 12}} />
                  <YAxis unit="萬" tick={{fontSize: 12}} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="小水庫累積" stackId="1" stroke="#fbbf24" fill="url(#colorSmall)" />
                  <Area type="monotone" dataKey="大水庫本金" stackId="1" stroke="#0891b2" fill="url(#colorBig)" />
                </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TaxPlannerTool = ({ data, setData }) => {
  const safeData = {
    spouse: Boolean(data?.spouse), // 有無配偶
    children: Number(data?.children) || 2, // 子女人數
    parents: Number(data?.parents) || 0, // 父母人數
    cash: Number(data?.cash) || 3000, // 現金 (萬)
    realEstate: Number(data?.realEstate) || 2000, // 不動產 (萬)
    stocks: Number(data?.stocks) || 1000, // 股票 (萬)
    insurancePlan: Number(data?.insurancePlan) || 0 // 規劃移轉至保險的金額 (萬)
  };
  const { spouse, children, parents, cash, realEstate, stocks, insurancePlan } = safeData;

  const totalAssets = cash + realEstate + stocks;
  const exemption = 1333; 
  const deductionSpouse = data.spouse ? 553 : 0;
  const deductionChildren = data.children * 56;
  const deductionParents = data.parents * 138;
  const deductionFuneral = 138; 
  const totalDeductions = exemption + deductionSpouse + deductionChildren + deductionParents + deductionFuneral;
  const netEstateRaw = Math.max(0, totalAssets - totalDeductions);
  const plannedAssets = Math.max(0, totalAssets - data.insurancePlan);
  const netEstatePlanned = Math.max(0, plannedAssets - totalDeductions);
  const calculateTax = (netEstate) => {
    if (netEstate <= 5000) return netEstate * 0.10;
    if (netEstate <= 10000) return netEstate * 0.15 - 250;
    return netEstate * 0.20 - 750;
  };
  const taxRaw = calculateTax(netEstateRaw);
  const taxPlanned = calculateTax(netEstatePlanned);

  const chartData = [
    { name: '未規劃稅金', value: Math.round(taxRaw), fill: '#ef4444' },
    { name: '規劃後稅金', value: Math.round(taxPlanned), fill: '#3b82f6' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-slate-600 to-zinc-700 rounded-2xl p-6 text-white shadow-lg print-break-inside">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Landmark className="text-slate-200" /> 稅務傳承專案</h3>
        <p className="text-slate-300 opacity-90">善用保險免稅額度，合法預留稅源。</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4 print-break-inside">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2"><Calculator size={18} /> 資產與家庭</h4>
            <div className="space-y-6">
               <div className="space-y-3">
                 <div className="flex items-center justify-between">
                   <label className="text-sm text-slate-600">配偶健在</label>
                   <input type="checkbox" checked={spouse} onChange={(e) => setData({...safeData, spouse: e.target.checked})} className="w-5 h-5 accent-slate-600" />
                 </div>
                 {/* 省略部分輸入框以節省空間 */}
               </div>
               
               <div className="pt-4 border-t border-slate-100">
                 <div className="flex justify-between mb-2">
                   <label className="text-sm font-bold text-blue-600 flex items-center gap-1"><ShieldAlert size={14}/> 規劃轉入保險 (萬)</label>
                   <span className="font-mono font-bold text-blue-600">${insurancePlan}</span>
                 </div>
                 <input type="range" min={0} max={Math.min(cash, 3330)} step={100} value={insurancePlan} onChange={(e) => setData({ ...safeData, insurancePlan: Number(e.target.value) })} className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
               </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow border border-slate-200 p-6">
             <div className="text-center mb-4">
                <p className="text-slate-500 text-sm">節稅效益</p>
                <p className="text-4xl font-black text-green-600 font-mono">省 ${Math.round(taxRaw - taxPlanned).toLocaleString()}萬</p>
             </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[400px]">
             <h4 className="font-bold text-slate-700 mb-4 pl-2">遺產稅負擔對比</h4>
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tick={{fontSize: 14}} axisLine={false} tickLine={false} width={100} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="value" barSize={40} radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#64748b', fontWeight: 'bold', formatter: (val) => `$${val}萬` }}>
                  </Bar>
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};