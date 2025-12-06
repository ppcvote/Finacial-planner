import React from 'react';
import { Landmark, Calculator, ShieldAlert } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

export const TaxPlannerTool = ({ data, setData }: any) => {
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
  const calculateTax = (netEstate: number) => {
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