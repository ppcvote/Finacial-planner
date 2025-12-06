import React from 'react';
import { Umbrella, Calculator } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

// 注意：這裡必須是 export const，不是 export default
export const LaborPensionTool = ({ data, setData }: any) => {
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