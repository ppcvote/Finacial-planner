import React, { useState, useMemo } from 'react';
import { 
  History, 
  TrendingUp, 
  Coins, 
  LineChart as LineChartIcon,
  Info,
  Zap,
  PiggyBank,
  CalendarDays,
  Target
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { fundDatabase, generateFundHistory, generateDCAHistory } from '../data/fundData';

const FundTimeMachine = () => {
  const [mode, setMode] = useState<'lump' | 'dca'>('lump'); // [新增] 模式切換
  const [selectedFund, setSelectedFund] = useState("USDEQ3490");
  const [amount, setAmount] = useState(100); // 萬 (單筆)
  const [monthlyAmount, setMonthlyAmount] = useState(10000); // 元 (DCA)

  // 取得基金資訊
  const fundInfo = fundDatabase[selectedFund as keyof typeof fundDatabase];
  const isGrowth = fundInfo.type === 'growth';

  // 定義顏色主題
  const theme = {
    bgGradient: isGrowth ? 'from-blue-800 to-indigo-900' : 'from-emerald-800 to-teal-900',
    iconColor: isGrowth ? 'text-blue-400' : 'text-emerald-400',
    accentColor: isGrowth ? 'text-blue-600' : 'text-emerald-600',
    sliderBg: isGrowth ? 'bg-blue-100' : 'bg-emerald-100',
    sliderAccent: isGrowth ? 'accent-blue-600' : 'accent-emerald-600',
    selectedBorder: isGrowth ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50' : 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50',
    chartStroke: isGrowth ? '#3b82f6' : '#10b981', 
    chartFill: isGrowth ? '#3b82f6' : '#10b981',
    chartDivStroke: isGrowth ? '#a855f7' : '#f59e0b',
    chartPrincipal: '#94a3b8' // 本金線顏色
  };

  // 產生回測數據 (根據模式選擇不同函式)
  const data = useMemo(() => {
    if (mode === 'lump') {
      return generateFundHistory(selectedFund, amount * 10000);
    } else {
      return generateDCAHistory(selectedFund, monthlyAmount);
    }
  }, [mode, selectedFund, amount, monthlyAmount]);

  if (!data || data.length === 0) return <div className="p-8 text-center text-slate-500">數據載入中...</div>;

  const finalResult = data[data.length - 1];
  const totalPrincipal = finalResult.investedPrincipal;
  const totalReturnRate = ((finalResult.totalReturn - totalPrincipal) / totalPrincipal) * 100;

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-20">
      
      {/* Header */}
      <div className={`bg-gradient-to-r ${theme.bgGradient} rounded-3xl p-8 text-white shadow-lg relative overflow-hidden transition-colors duration-500`}>
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <History size={180} />
        </div>
        <div className="relative z-10">
           <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-wider border uppercase ${isGrowth ? 'bg-blue-500/20 text-blue-200 border-blue-400/30' : 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'}`}>
                 {isGrowth ? 'Capital Growth' : 'Income & Stability'}
              </span>
           </div>
           <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 flex items-center gap-3">
             <LineChartIcon className={theme.iconColor} size={36}/> 
             {isGrowth ? '成長型資產回測' : '配息型資產回測'}
           </h1>
           <p className="text-white/80 text-lg max-w-xl">
             {mode === 'lump' 
                ? '回測單筆投入的複利效應。時間是財富最好的朋友。' 
                : '回測定期定額的累積力量。紀律投資，無懼市場波動。'}
           </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* 左側：控制面板 */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
              
              {/* 模式切換 */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                 <button 
                   onClick={() => setMode('lump')}
                   className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${mode === 'lump' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                    <Target size={16}/> 單筆投入
                 </button>
                 <button 
                   onClick={() => setMode('dca')}
                   className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${mode === 'dca' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                    <CalendarDays size={16}/> 定期定額
                 </button>
              </div>

              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                 <Coins size={20} className={theme.accentColor}/> 設定參數
              </h3>

              {/* 1. 選擇基金 */}
              <div>
                 <label className="text-xs font-bold text-slate-500 mb-2 block">選擇基金標的</label>
                 <div className="grid grid-cols-1 gap-2">
                    {Object.values(fundDatabase).map((fund) => {
                       const isThisGrowth = fund.type === 'growth';
                       return (
                        <button
                          key={fund.id}
                          onClick={() => setSelectedFund(fund.id)}
                          className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${selectedFund === fund.id ? theme.selectedBorder : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                        >
                            <div className="flex justify-between items-center relative z-10">
                              <span className={`font-bold ${selectedFund === fund.id ? (isThisGrowth ? 'text-blue-700' : 'text-emerald-700') : 'text-slate-700'}`}>{fund.id}</span>
                              <div className="flex gap-1">
                                <span className={`text-[10px] px-2 py-1 rounded font-bold ${isThisGrowth ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                    {isThisGrowth ? '⚡ 成長' : '💰 配息'}
                                </span>
                                <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500">{fund.currency}</span>
                              </div>
                            </div>
                            <div className="text-sm text-slate-600 mt-1 relative z-10">{fund.name}</div>
                        </button>
                       )
                    })}
                 </div>
              </div>

              {/* 2. 投入金額 (根據模式變換) */}
              <div>
                 <label className="text-xs font-bold text-slate-500 mb-2 block">
                    {mode === 'lump' ? '成立日單筆投入 (萬)' : '每月定期定額 (元)'}
                 </label>
                 <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-black text-slate-700">
                        {mode === 'lump' ? `${amount} 萬` : `$${monthlyAmount.toLocaleString()}`}
                    </span>
                 </div>
                 
                 {mode === 'lump' ? (
                    <input 
                      type="range" min={10} max={1000} step={10}
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className={`w-full h-2 rounded-lg cursor-pointer ${theme.sliderBg} ${theme.sliderAccent}`}
                    />
                 ) : (
                    <input 
                      type="range" min={3000} max={50000} step={1000}
                      value={monthlyAmount}
                      onChange={(e) => setMonthlyAmount(Number(e.target.value))}
                      className={`w-full h-2 rounded-lg cursor-pointer ${theme.sliderBg} ${theme.sliderAccent}`}
                    />
                 )}
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
                 <div className="pt-2 mt-2 border-t border-slate-200 text-xs text-slate-500 leading-relaxed">
                    {fundInfo.desc}
                 </div>
              </div>
           </div>
        </div>

        {/* 右側：結果展示 */}
        <div className="lg:col-span-8 space-y-6">
           
           {/* 總結算卡片 */}
           <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                 <div className="text-xs text-slate-500 font-bold mb-1">
                    {mode === 'lump' ? '單筆投入本金' : '累積投入本金'}
                 </div>
                 <div className="text-xl font-bold font-mono text-slate-600">
                    ${(totalPrincipal / 10000).toFixed(1)} 萬
                 </div>
                 <div className="text-xs text-slate-400 mt-1">
                    {mode === 'lump' ? '一次性投入' : '每月持續累積'}
                 </div>
              </div>

              <div className={`bg-white p-5 rounded-2xl border shadow-sm relative overflow-hidden ${isGrowth ? 'border-blue-200 bg-blue-50/30' : 'border-emerald-200 bg-emerald-50/30'}`}>
                 <div className={`text-xs font-bold mb-1 ${isGrowth ? 'text-blue-600' : 'text-emerald-600'}`}>累積領取配息 (現金流)</div>
                 <div className={`text-2xl font-black font-mono ${isGrowth ? 'text-blue-600' : 'text-emerald-600'}`}>
                    +${(finalResult.cumulativeDividends / 10000).toFixed(1)} 萬
                 </div>
                 <div className={`text-xs mt-1 ${isGrowth ? 'text-blue-500' : 'text-emerald-500'}`}>
                    {finalResult.cumulativeDividends === 0 ? '本基金不配息 (累積淨值)' : '現金已落袋'}
                 </div>
                 <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                    {isGrowth ? <Zap size={60} className="text-blue-600"/> : <PiggyBank size={60} className="text-emerald-600"/>}
                 </div>
              </div>

              <div className="bg-slate-800 p-5 rounded-2xl text-white shadow-lg relative overflow-hidden">
                 <div className="text-xs text-slate-400 font-bold mb-1">總資產 (本金+配息)</div>
                 <div className="text-3xl font-black text-yellow-400 font-mono">
                    ${(finalResult.totalReturn / 10000).toFixed(1)} 萬
                 </div>
                 <div className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                    總報酬率 <span className="text-yellow-400 font-bold">+{totalReturnRate.toFixed(1)}%</span>
                 </div>
                 <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                    <Coins size={60} className="text-yellow-400"/>
                 </div>
              </div>
           </div>

           {/* 圖表區 */}
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[450px]">
              <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                 <TrendingUp size={20} className={theme.accentColor}/> 資產成長走勢圖 (含息)
              </h4>
              <ResponsiveContainer width="100%" height="90%">
                 <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                       <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.chartFill} stopOpacity={0.2}/>
                          <stop offset="95%" stopColor={theme.chartFill} stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <XAxis dataKey="year" type="number" domain={['dataMin', 'dataMax']} tickFormatter={(tick) => tick.toFixed(0)} tick={{fontSize:12}} />
                    <YAxis tickFormatter={(val) => `${(val/10000).toFixed(0)}萬`} width={60} tick={{fontSize:12}} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                    <Tooltip 
                       labelFormatter={(val) => `${Math.floor(val)}年`}
                       formatter={(value: number, name: string) => [
                           `$${(value/10000).toFixed(1)}萬`, 
                           name === 'totalReturn' ? '總資產' : (name === 'investedPrincipal' ? '投入本金' : '累積配息')
                       ]}
                       contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}}
                    />
                    <Legend />
                    {/* 總資產區域 */}
                    <Area type="monotone" dataKey="totalReturn" name="總資產 (含息)" stackId="1" stroke={theme.chartStroke} fill="url(#colorTotal)" strokeWidth={3} />
                    
                    {/* 本金線 (DCA時特別重要) */}
                    <Area type="monotone" dataKey="investedPrincipal" name="投入本金" stackId="3" stroke={theme.chartPrincipal} fill="none" strokeWidth={2} strokeDasharray="3 3"/>
                    
                    {/* 配息線 */}
                    <Area type="monotone" dataKey="cumulativeDividends" name="累積配息" stackId="2" stroke={theme.chartDivStroke} fill="none" strokeWidth={2} strokeDasharray="5 5"/>
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

export default FundTimeMachine;