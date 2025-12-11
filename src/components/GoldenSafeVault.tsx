import React, { useState, useEffect } from 'react';
import { 
  Lock, Unlock, ShieldCheck, TrendingUp, Hourglass, 
  Coins, ArrowRight, AlertTriangle
} from 'lucide-react';

// [修正] 改回 export default，這是最穩的寫法
export default function GoldenSafeVault({ data, setData }: any) {
  // 預設值
  const safeData = data || { 
    mode: 'time', // 'time' (時間存錢) | 'asset' (資產存錢)
    amount: 60000, // 年存 or 單筆
    years: 10,
    rate: 6,
    isLocked: false 
  };

  const [localLocked, setLocalLocked] = useState(safeData.isLocked);
  const [animateValue, setAnimateValue] = useState(0);

  // 計算邏輯
  const finalValue = React.useMemo(() => {
    const { mode, amount, years, rate } = safeData;
    const r = rate / 100;
    if (mode === 'asset') {
      // 單筆複利
      return Math.round(amount * Math.pow(1 + r, years));
    } else {
      // 定期定額 (年金終值)
      return Math.round(amount * ((Math.pow(1 + r, years) - 1) / r) * (1+r));
    }
  }, [safeData]);

  const principal = safeData.mode === 'asset' ? safeData.amount : safeData.amount * safeData.years;
  const interest = finalValue - principal;

  // 動畫效果
  useEffect(() => {
    let start = 0;
    const end = finalValue;
    const duration = 1000;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setAnimateValue(end);
        clearInterval(timer);
      } else {
        setAnimateValue(Math.round(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [finalValue, safeData.mode]);

  // 同步鎖定狀態
  useEffect(() => {
     if (localLocked !== safeData.isLocked) {
        setData({ ...safeData, isLocked: localLocked });
     }
  }, [localLocked]);

  const handleUpdate = (key: string, value: any) => {
    setData({ ...safeData, [key]: value, isLocked: false });
    setLocalLocked(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20 font-sans">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <ShieldCheck size={200} />
        </div>
        <div className="relative z-10 text-center md:text-left">
           <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 text-yellow-500 flex items-center gap-3 justify-center md:justify-start">
             <Lock size={36}/> 黃金保險箱理論
           </h1>
           <p className="text-slate-300 text-lg max-w-2xl mx-auto md:mx-0">
             存錢沒有奇蹟，只有路徑。您想用「時間」還是「資產」來打造您的金庫？
           </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left: Control Panel */}
        <div className="lg:col-span-4 space-y-6">
           {/* 1. 選擇路徑 */}
           <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 flex">
              <button 
                onClick={() => handleUpdate('mode', 'time')}
                className={`flex-1 py-4 rounded-xl flex flex-col items-center gap-2 transition-all ${safeData.mode === 'time' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                 <Hourglass size={24}/>
                 <span className="font-bold text-sm">用時間存錢</span>
              </button>
              <button 
                onClick={() => handleUpdate('mode', 'asset')}
                className={`flex-1 py-4 rounded-xl flex flex-col items-center gap-2 transition-all ${safeData.mode === 'asset' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                 <Coins size={24}/>
                 <span className="font-bold text-sm">用資產存錢</span>
              </button>
           </div>

           {/* 2. 輸入參數 */}
           <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                 <TrendingUp size={18}/> 設定參數
              </h3>
              
              <div>
                 <label className="text-xs font-bold text-slate-500 mb-1 block">
                    {safeData.mode === 'time' ? '每年存入金額' : '單筆投入本金'}
                 </label>
                 <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold">$</span>
                    <input 
                      type="number" 
                      value={safeData.amount}
                      onChange={(e) => handleUpdate('amount', Number(e.target.value))}
                      className="w-full pl-8 p-2 border border-slate-200 rounded-lg font-bold text-xl text-slate-800 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                 </div>
                 <input 
                   type="range" min={10000} max={5000000} step={10000}
                   value={safeData.amount}
                   onChange={(e) => handleUpdate('amount', Number(e.target.value))}
                   className="w-full h-2 bg-slate-100 rounded-lg accent-slate-600 mt-2"
                 />
              </div>

              <div>
                 <div className="flex justify-between mb-1">
                    <label className="text-xs font-bold text-slate-500">滾存時間</label>
                    <span className="font-bold text-slate-700">{safeData.years} 年</span>
                 </div>
                 <input 
                   type="range" min={5} max={30} step={1}
                   value={safeData.years}
                   onChange={(e) => handleUpdate('years', Number(e.target.value))}
                   className="w-full h-2 bg-slate-100 rounded-lg accent-slate-600"
                 />
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl text-center">
                 <p className="text-xs text-slate-500 mb-1">預估平均年化報酬</p>
                 <p className="text-2xl font-black text-slate-700">{safeData.rate}%</p>
              </div>
           </div>
        </div>

        {/* Right: The Vault Visual */}
        <div className="lg:col-span-8 flex flex-col gap-6">
           
           <div className={`relative flex-1 rounded-3xl p-8 flex flex-col items-center justify-center transition-all duration-700 border-4 ${localLocked ? 'bg-slate-900 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.3)]' : 'bg-white border-slate-200 shadow-sm'}`}>
              
              <div className={`absolute top-6 right-6 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${localLocked ? 'bg-yellow-500 text-black' : 'bg-slate-100 text-slate-400'}`}>
                 {localLocked ? 'SECURED / 已上鎖' : 'UNSECURED / 風險敞開'}
              </div>

              <div className="relative mb-8 mt-4">
                 <div className={`transition-all duration-700 transform ${localLocked ? 'scale-110' : 'scale-100'}`}>
                    {localLocked ? (
                       <ShieldCheck size={180} className="text-yellow-500 animate-pulse-soft" />
                    ) : (
                       <Unlock size={180} className="text-slate-300" />
                    )}
                 </div>
                 {localLocked && (
                    <>
                      <div className="absolute top-0 right-0 w-4 h-4 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
                      <div className="absolute bottom-10 left-0 w-3 h-3 bg-yellow-200 rounded-full animate-ping opacity-50 delay-75"></div>
                    </>
                 )}
              </div>

              <div className="text-center space-y-2 z-10">
                 <p className={`text-sm font-bold uppercase tracking-widest ${localLocked ? 'text-yellow-500' : 'text-slate-400'}`}>
                    Total Asset Value
                 </p>
                 <div className={`text-5xl md:text-7xl font-black font-mono tracking-tighter transition-colors duration-500 ${localLocked ? 'text-white' : 'text-slate-700'}`}>
                    ${animateValue.toLocaleString()}
                 </div>
                 <div className="flex items-center justify-center gap-4 mt-2 text-sm font-medium opacity-80">
                    <span className={localLocked ? 'text-slate-400' : 'text-slate-500'}>
                       本金: ${principal.toLocaleString()}
                    </span>
                    <span className={`${localLocked ? 'text-emerald-400' : 'text-emerald-600'} flex items-center gap-1`}>
                       <TrendingUp size={14}/> 利息: +${interest.toLocaleString()}
                    </span>
                 </div>
              </div>

              {!localLocked && (
                 <div className="absolute bottom-6 flex gap-3 opacity-60">
                    <div className="px-3 py-1 bg-rose-100 text-rose-500 text-xs font-bold rounded-full flex items-center gap-1 animate-bounce">
                       <AlertTriangle size={10}/> 醫療支出
                    </div>
                    <div className="px-3 py-1 bg-rose-100 text-rose-500 text-xs font-bold rounded-full flex items-center gap-1 animate-bounce delay-100">
                       <AlertTriangle size={10}/> 稅務風險
                    </div>
                    <div className="px-3 py-1 bg-rose-100 text-rose-500 text-xs font-bold rounded-full flex items-center gap-1 animate-bounce delay-200">
                       <AlertTriangle size={10}/> 投資失利
                    </div>
                 </div>
              )}
           </div>

           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                 <h4 className={`font-bold text-lg mb-1 ${localLocked ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {localLocked ? '資產防護網已啟動' : '警告：您的金庫門戶大開'}
                 </h4>
                 <p className="text-sm text-slate-500">
                    {localLocked 
                       ? '透過法律合約與保險機制，您的資產已完成「實名制」鎖定，無人能奪。' 
                       : '雖然累積了財富，但若發生「癌症、失能、遺產稅」等風險，這筆錢將屬於醫生或政府。'}
                 </p>
              </div>
              
              <button 
                 onClick={() => setLocalLocked(!localLocked)}
                 className={`px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 transition-all transform active:scale-95 shadow-xl ${
                    localLocked 
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200' 
                    : 'bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 shadow-rose-200'
                 }`}
              >
                 {localLocked ? (
                    <>
                       <Unlock size={20}/> 解除鎖定
                    </>
                 ) : (
                    <>
                       <Lock size={20}/> 立即上鎖
                    </>
                 )}
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}