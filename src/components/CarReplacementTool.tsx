import React from 'react';
import { Car, Calculator } from 'lucide-react';
import { ResponsiveContainer, ComposedChart, Line, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export const CarReplacementTool = ({ data, setData }: any) => {
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