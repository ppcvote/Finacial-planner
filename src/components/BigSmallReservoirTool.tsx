import React from 'react';
import { Waves, Calculator } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export const BigSmallReservoirTool = ({ data, setData }: any) => {
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