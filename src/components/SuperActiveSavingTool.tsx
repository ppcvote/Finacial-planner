import React from 'react';
import { Rocket, Calculator } from 'lucide-react';
import { ResponsiveContainer, ComposedChart, Area, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export const SuperActiveSavingTool = ({ data, setData }: any) => {
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
  const updateField = (field: string, value: number) => { setData({ ...safeData, [field]: value }); };

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