import React from 'react';
import { Wallet, Calculator } from 'lucide-react';
import { ResponsiveContainer, ComposedChart, Area, Line, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { calculateMonthlyPayment, calculateMonthlyIncome } from '../utils';

// ------------------------------------------------------------------
// 核心模組: 百萬禮物專案 (獨立模組)
// ------------------------------------------------------------------

const MillionDollarGiftTool = ({ data, setData }) => {
  const safeData = {
    loanAmount: Number(data?.loanAmount) || 100,
    loanTerm: Number(data?.loanTerm) || 7,
    loanRate: Number(data?.loanRate) || 2.8,
    investReturnRate: Number(data?.investReturnRate) || 6
  };
  const { loanAmount, loanTerm, loanRate, investReturnRate } = safeData;

  const targetAmount = loanAmount * 3; 
  const monthlyLoanPayment = calculateMonthlyPayment(loanAmount, loanRate, loanTerm);
  const monthlyInvestIncomeSingle = calculateMonthlyIncome(loanAmount, investReturnRate);
  
  // 第一階段：月付 - 1倍配息
  const phase1_NetOut = monthlyLoanPayment - monthlyInvestIncomeSingle;
  // 第二階段：月付 - 2倍配息
  const phase2_NetOut = monthlyLoanPayment - (monthlyInvestIncomeSingle * 2);
  // 第三階段：月付 - 3倍配息 (通常是負的，代表領錢)
  const phase3_NetOut = monthlyLoanPayment - (monthlyInvestIncomeSingle * 3);
  
  const standardTotalCost = 3000000; 
  const standardMonthlySaving = standardTotalCost / (15 * 12); 

  const generateChartData = () => {
    const dataArr = [];
    let cumulativeStandard = 0;
    let cumulativeProjectCost = 0;
    let projectAssetValue = 0;
    
    for (let year = 1; year <= 15; year++) {
      cumulativeStandard += standardMonthlySaving * 12;
      
      if (year <= 7) {
        cumulativeProjectCost += phase1_NetOut * 12;
        projectAssetValue = loanAmount * 10000;
      } else if (year <= 14) {
        cumulativeProjectCost += phase2_NetOut * 12;
        projectAssetValue = loanAmount * 2 * 10000;
      } else {
        cumulativeProjectCost += phase3_NetOut * 12; 
        projectAssetValue = loanAmount * 3 * 10000;
      }

      dataArr.push({
        year: `第${year}年`,
        一般存錢成本: Math.round(cumulativeStandard / 10000),
        專案實付成本: Math.round(cumulativeProjectCost / 10000),
        專案持有資產: Math.round(projectAssetValue / 10000),
      });
    }
    return dataArr;
  };

  const updateField = (field, value) => { setData({ ...safeData, [field]: value }); };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg print-break-inside">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Wallet className="text-blue-200" /> 百萬禮物專案</h3>
        <p className="text-blue-100 opacity-90">透過三次槓桿循環，用時間換取 300 萬資產。</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4 print-break-inside">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2"><Calculator size={18} /> 參數設定</h4>
            <div className="space-y-6">
               {[
                 { label: "單次借貸額度 (萬)", field: "loanAmount", min: 50, max: 500, step: 10, val: loanAmount, color: "blue" },
                 { label: "信貸利率 (%)", field: "loanRate", min: 1.5, max: 15.0, step: 0.1, val: loanRate, color: "blue" },
                 { label: "配息率 (%)", field: "investReturnRate", min: 3, max: 12, step: 0.5, val: investReturnRate, color: "green" }
               ].map((item) => (
                 <div key={item.field}>
                   <div className="flex justify-between mb-2">
                     <label className="text-sm font-medium text-slate-600">{item.label}</label>
                     <span className={`font-mono font-bold text-${item.color}-600`}>{item.val}</span>
                   </div>
                   <input type="range" min={item.min} max={item.max} step={item.step} value={item.val} onChange={(e) => updateField(item.field, Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                 </div>
               ))}
            </div>
          </div>
          
          <div className="hidden print-only border p-4 mb-4 rounded border-slate-300">
             <h3 className="font-bold mb-2">規劃參數</h3>
             <div className="grid grid-cols-2 gap-2 text-sm"><div>信貸額度：{loanAmount} 萬</div><div>信貸利率：{loanRate} %</div><div>配息率：{investReturnRate} %</div><div>總目標：{targetAmount} 萬</div></div>
          </div>

          <div className="bg-white rounded-xl shadow border border-slate-200 p-5 print-break-inside">
              <div className="text-sm text-slate-500 mb-4 text-center">一般存錢月存金額 <span className="line-through decoration-slate-400 font-bold ml-2">${Math.round(standardMonthlySaving).toLocaleString()}</span></div>
              <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="flex justify-between items-center text-sm"><span className="text-slate-600 font-medium">1. 信貸每月還款</span><span className="text-red-500 font-bold font-mono">-${Math.round(monthlyLoanPayment).toLocaleString()}</span></div>
                <div className="flex justify-between items-center text-sm"><span className="text-slate-600 font-medium">2. 扣除每月配息</span><span className="text-green-600 font-bold font-mono">+${Math.round(monthlyInvestIncomeSingle).toLocaleString()}</span></div>
                <div className="border-t border-slate-200 my-2"></div>
                <div className="flex justify-between items-end"><span className="text-blue-700 font-bold">3. 實質每月應負</span><span className="text-3xl font-black text-blue-600 font-mono">${Math.round(phase1_NetOut).toLocaleString()}</span></div>
              </div>
              <div className="mt-4 text-center"><div className="text-xs bg-green-100 text-green-700 py-1.5 px-3 rounded-full inline-block font-bold">比一般存錢每月省下 ${Math.round(standardMonthlySaving - phase1_NetOut).toLocaleString()}</div></div>
          </div>
        </div>

        {/* ------------------- UPDATED CHART & CARDS AREA ------------------- */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-[350px] print-break-inside">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={generateChartData()} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAssetGift" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis unit="萬" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend />
                <Area type="monotone" dataKey="專案持有資產" stroke="#3b82f6" fill="url(#colorAssetGift)" strokeWidth={2} />
                <Bar dataKey="一般存錢成本" fill="#cbd5e1" barSize={12} radius={[4,4,0,0]} />
                <Line type="monotone" dataKey="專案實付成本" stroke="#f59e0b" strokeWidth={3} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* 新增：三階段摘要卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print-break-inside">
             {/* 第一個 7 年 */}
             <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-100 rounded-full opacity-50 group-hover:scale-150 transition-transform"></div>
                <div className="relative">
                  <div className="text-blue-800 font-bold text-lg mb-1 flex items-center gap-2">
                    <span className="bg-blue-200 text-blue-800 text-xs px-2 py-0.5 rounded-full">累積期</span>
                    第一個 7 年
                  </div>
                  <div className="text-xs text-slate-500 mb-2 font-medium">扣掉配息後只須要存</div>
                  <div className="text-3xl font-black text-blue-600 font-mono tracking-tight">
                     ${Math.round(phase1_NetOut).toLocaleString()}
                  </div>
                  <div className="mt-2 text-xs text-blue-400">建立資產基礎</div>
                </div>
             </div>

             {/* 第二個 7 年 */}
             <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-indigo-100 rounded-full opacity-50 group-hover:scale-150 transition-transform"></div>
                <div className="relative">
                  <div className="text-indigo-800 font-bold text-lg mb-1 flex items-center gap-2">
                    <span className="bg-indigo-200 text-indigo-800 text-xs px-2 py-0.5 rounded-full">成長期</span>
                    第二個 7 年
                  </div>
                  <div className="text-xs text-slate-500 mb-2 font-medium">扣掉配息後只須要存</div>
                  <div className="text-3xl font-black text-indigo-600 font-mono tracking-tight">
                     ${Math.max(0, Math.round(phase2_NetOut)).toLocaleString()}
                  </div>
                   <div className="mt-2 text-xs text-indigo-400">
                    {phase2_NetOut < phase1_NetOut ? `壓力減輕 ${Math.round((1 - phase2_NetOut/phase1_NetOut)*100)}%` : '持續累積'}
                  </div>
                </div>
             </div>

             {/* 第三個 7 年 */}
             <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-100 rounded-full opacity-50 group-hover:scale-150 transition-transform"></div>
                <div className="relative">
                  <div className="text-amber-800 font-bold text-lg mb-1 flex items-center gap-2">
                    <span className="bg-amber-200 text-amber-800 text-xs px-2 py-0.5 rounded-full">收穫期</span>
                    第三個 7 年
                  </div>
                  <div className="text-xs text-slate-500 mb-2 font-medium">一開始就可以領多少錢</div>
                  <div className={`text-3xl font-black font-mono tracking-tight ${phase3_NetOut <= 0 ? 'text-green-600' : 'text-amber-600'}`}>
                     {phase3_NetOut <= 0 
                       ? `+$${Math.abs(Math.round(phase3_NetOut)).toLocaleString()}` 
                       : `-$${Math.round(phase3_NetOut).toLocaleString()}`
                     }
                  </div>
                  <div className="mt-2 text-xs text-amber-600 font-bold">
                    {phase3_NetOut <= 0 ? '目標達成，被動收入啟動' : '仍需負擔部分金額'}
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MillionDollarGiftTool;