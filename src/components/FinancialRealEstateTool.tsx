import React from 'react';
import { Building2, Calculator, Scale } from 'lucide-react';
import { ResponsiveContainer, ComposedChart, Area, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { calculateMonthlyPayment, calculateMonthlyIncome, calculateRemainingBalance } from '../utils';

export const FinancialRealEstateTool = ({ data, setData }: any) => {
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
  
  const finalAssetValue = loanAmount * 10000;

  const generateHouseChartData = () => {
    const dataArr = [];
    let cumulativeNetIncome = 0; 
    for (let year = 1; year <= loanTerm; year++) {
      cumulativeNetIncome += monthlyCashFlow * 12;
      const remainingLoan = calculateRemainingBalance(loanAmount, loanRate, loanTerm, year);
      const assetEquity = (loanAmount * 10000) - remainingLoan;
      const financialTotalWealth = assetEquity + cumulativeNetIncome;
      const step = loanTerm > 20 ? 3 : 1; 
      if (year === 1 || year % step === 0 || year === loanTerm) {
         dataArr.push({ year: `第${year}年`, 總資產價值: Math.round(financialTotalWealth / 10000), 剩餘貸款: Math.round(remainingLoan / 10000) });
      }
    }
    return dataArr;
  };

  const updateField = (field: string, value: number) => { setData({ ...safeData, [field]: value }); };

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

          {/* 金融房產專案 - 核心總結卡片 */}
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