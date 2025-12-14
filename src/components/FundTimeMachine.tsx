import React, { useState, useMemo } from 'react';
import { 
  History, 
  TrendingUp, 
  Coins, 
  LineChart as LineChartIcon,
  Info
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { fundDatabase, generateFundHistory } from '../data/fundData';

// 定義元件 (先用 const 定義)
const FundTimeMachine = () => {
  const [selectedFund, setSelectedFund] = useState("USDEQ3490");
  const [initialAmount, setInitialAmount] = useState(100); // 萬

  // 取得基金資訊
  const fundInfo = fundDatabase[selectedFund as keyof typeof fundDatabase];

  // 產生回測數據 (Memo起來避免重複計算)
  const data = useMemo(() => {
    return generateFundHistory(selectedFund, initialAmount * 10000);
  }, [selectedFund, initialAmount]);

  if (!data || data.length === 0) return <div className="p-8 text-center text-slate-500">數據載入中...</div>;

  const finalResult = data[data.length - 1];
  const totalReturnRate = ((finalResult.totalReturn - (initialAmount * 10000)) / (initialAmount * 10000)) * 100;

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-20">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <History size={180} />
        </div>
        <div className="relative z-10">
           <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 flex items-center gap-3">
             <LineChartIcon className="text-emerald-400" size={36}/> 基金時光機
           </h1>
           <p className="text-emerald-200 text-lg max-w-xl">
             如果當年您就開始投資，現在會變怎樣？
             <br/>透過真實數據回測，見證「時間+複利」的威力。
           </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* 左側：控制面板 */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                 <Coins size={20} className="text-emerald-600"/> 設定回測參數
              </h3>

              {/* 1. 選擇基金 */}
              <div>
                 <label className="text-xs font-bold text-slate-500 mb-2 block">選擇基金標的</label>
                 <div className="grid grid-cols-1 gap-2">
                    {Object.values(fundDatabase).map((fund) => (
                       <button
                         key={fund.id}
                         onClick={() => setSelectedFund(fund.id)}
                         className={`p-3 rounded-xl border text-left transition-all ${selectedFund === fund.id ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                       >
                          <div className="flex justify-between items-center">
                             <span className={`font-bold ${selectedFund === fund.id ? 'text-emerald-700' : 'text-slate-700'}`}>{fund.id}</span>
                             <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500">{fund.currency}</span>
                          </div>
                          <div className="text-sm text-slate-600 mt-1">{fund.name}</div>
                       </button>
                    ))}
                 </div>
              </div>

              {/* 2. 投入金額 */}
              <div>
                 <label className="text-xs font-bold text-slate-500 mb-2 block">成立日單筆投入 (萬台幣)</label>
                 <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-black text-slate-700">{initialAmount} 萬</span>
                 </div>
                 <input 
                   type="range" min={10} max={1000} step={10}
                   value={initialAmount}
                   onChange={(e) => setInitialAmount(Number(e.target.value))}
                   className="w-full h-2 bg-emerald-100 rounded-lg accent-emerald-600 cursor-pointer"
                 />
              </div>

              {/* 資訊卡 */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm space-y-2">
                 <div className="flex justify-between">
                    <span className="text-slate-500">成立日期</span>
                    <span className="font-bold text-slate-700">{fundInfo.inceptionDate}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-slate-500">成立時淨值</span>
                    <span className="font-bold text-slate-700">${fundInfo.startNav} {fundInfo.currency}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-slate-500">目前淨值 (估)</span>
                    <span className="font-bold text-slate-700">${fundInfo.currentNav} {fundInfo.currency}</span>
                 </div>
              </div>
           </div>
        </div>

        {/* 右側：結果展示 */}
        <div className="lg:col-span-8 space-y-6">
           
           {/* 總結算卡片 */}
           <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                 <div className="text-xs text-slate-500 font-bold mb-1">目前本金價值 (資本利得)</div>
                 <div className={`text-2xl font-black font-mono ${finalResult.assetValueTwd >= initialAmount*10000 ? 'text-red-500' : 'text-green-600'}`}>
                    ${(finalResult.assetValueTwd / 10000).toFixed(1)} 萬
                 </div>
                 <div className="text-xs text-slate-400 mt-1">
                    {finalResult.assetValueTwd >= initialAmount*10000 ? '▲ 本金增值' : '▼ 淨值波動(含匯差)'}
                 </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm bg-emerald-50/30">
                 <div className="text-xs text-emerald-600 font-bold mb-1">累積領取配息 (現金流)</div>
                 <div className="text-2xl font-black text-emerald-600 font-mono">
                    +${(finalResult.cumulativeDividends / 10000).toFixed(1)} 萬
                 </div>
                 <div className="text-xs text-emerald-500 mt-1">
                    現金已落袋
                 </div>
              </div>

              <div className="bg-slate-800 p-5 rounded-2xl text-white shadow-lg">
                 <div className="text-xs text-slate-400 font-bold mb-1">總資產 (本金+配息)</div>
                 <div className="text-3xl font-black text-yellow-400 font-mono">
                    ${(finalResult.totalReturn / 10000).toFixed(1)} 萬
                 </div>
                 <div className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                    總報酬率 <span className="text-yellow-400 font-bold">+{totalReturnRate.toFixed(1)}%</span>
                 </div>
              </div>
           </div>

           {/* 圖表區 */}
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[400px]">
              <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                 <TrendingUp size={20}/> 資產成長走勢圖 (含息)
              </h4>
              <ResponsiveContainer width="100%" height="90%">
                 <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                       <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                       </linearGradient>
                       <linearGradient id="colorDiv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <XAxis dataKey="year" type="number" domain={['dataMin', 'dataMax']} tickFormatter={(tick) => tick.toFixed(0)} tick={{fontSize:12}} />
                    <YAxis tickFormatter={(val) => `${(val/10000).toFixed(0)}萬`} width={60} tick={{fontSize:12}} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                    <Tooltip 
                       labelFormatter={(val) => `${Math.floor(val)}年`}
                       formatter={(value: number) => [`$${Math.round(value/10000)}萬`, '']}
                       contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="totalReturn" name="總資產 (含息)" stackId="1" stroke="#10b981" fill="url(#colorTotal)" strokeWidth={3} />
                    <Area type="monotone" dataKey="cumulativeDividends" name="累積配息" stackId="2" stroke="#f59e0b" fill="none" strokeWidth={2} strokeDasharray="5 5"/>
                 </AreaChart>
              </ResponsiveContainer>
           </div>

           {/* 備註 */}
           <div className="text-right">
              <span className="text-[10px] text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 inline-flex items-center gap-1.5">
                 <Info size={12}/> 
                 本試算基於 {fundInfo.inceptionDate} 至 2024 年底之歷史淨值與匯率概算，過去績效不代表未來收益。
              </span>
           </div>

        </div>
      </div>
    </div>
  );
};

// [修正關鍵] 顯式導出 Default，確保 App.tsx 能抓到
export default FundTimeMachine;