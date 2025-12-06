import React from 'react';
import { GraduationCap, Clock, PauseCircle, Calculator } from 'lucide-react';
import { ResponsiveContainer, ComposedChart, Area, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { calculateMonthlyPayment, calculateRemainingBalance } from '../utils';

export const StudentLoanTool = ({ data, setData }: any) => {
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