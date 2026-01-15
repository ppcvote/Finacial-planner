import React, { useState, useEffect, useMemo } from 'react';
import { 
  Lock, Unlock, ShieldCheck, TrendingUp, Hourglass, 
  Coins, AlertTriangle, Skull, Activity, Ban
} from 'lucide-react';

export default function GoldenSafeVault({ data, setData }: any) {
  // 預設值
  const safeData = data || { 
    mode: 'time', 
    amount: 60000, 
    years: 10,
    rate: 6,
    isLocked: false 
  };

  const [localLocked, setLocalLocked] = useState(safeData.isLocked);
  const [animateValue, setAnimateValue] = useState(0);
  const [activeDisaster, setActiveDisaster] = useState<string | null>(null);

  // 1. 基礎計算 (無風險時的資產)
  const baseValue = useMemo(() => {
    const { mode, amount, years, rate } = safeData;
    const r = rate / 100;
    let val = 0;
    if (mode === 'asset') {
      val = Math.round(amount * Math.pow(1 + r, years));
    } else {
      val = Math.round(amount * ((Math.pow(1 + r, years) - 1) / r) * (1+r));
    }
    return val;
  }, [safeData]);

  // 2. 最終價值計算 (考慮鎖定成本 與 災難損失)
  const finalDisplayValue = useMemo(() => {
    // A. 如果已上鎖：扣除 10% 成本，但免疫所有災害
    if (localLocked) {
      return Math.round(baseValue * 0.9);
    }

    // B. 如果沒上鎖：根據災害扣血
    switch (activeDisaster) {
      case 'medical': // 重大傷病：直接噴 200 萬
        return Math.max(0, baseValue - 2000000);
      case 'market': // 市場崩盤：資產縮水 30%
        return Math.round(baseValue * 0.7);
      case 'tax': // 遺產稅/債務：扣除 100 萬 (範例)
        return Math.max(0, baseValue - 1000000);
      default: // 平安無事
        return baseValue;
    }
  }, [baseValue, localLocked, activeDisaster]);

  const principal = safeData.mode === 'asset' ? safeData.amount : safeData.amount * safeData.years;

  // 動畫效果
  useEffect(() => {
    let start = animateValue; // 從當前數值開始，不歸零
    const end = finalDisplayValue;
    const change = end - start;
    const duration = 500;
    let startTime: number | null = null;

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      // Easing function for smoother animation
      const ease = 1 - Math.pow(1 - progress, 3); 
      
      setAnimateValue(Math.round(start + change * ease));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [finalDisplayValue]);

  // 同步鎖定狀態
  useEffect(() => {
     if (localLocked !== safeData.isLocked) {
        setData({ ...safeData, isLocked: localLocked });
     }
     // 上鎖時自動清除災難狀態 (因為免疫)
     if (localLocked) setActiveDisaster(null);
  }, [localLocked]);

  const handleUpdate = (key: string, value: any) => {
    setData({ ...safeData, [key]: value, isLocked: false });
    setLocalLocked(false);
    setActiveDisaster(null);
  };

  const toggleDisaster = (type: string) => {
    if (localLocked) return; // 上鎖時按災難沒反應 (或顯示防禦特效)
    setActiveDisaster(activeDisaster === type ? null : type);
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
             存錢沒有奇蹟，只有路徑。最重要的是：您的保險箱上鎖了嗎？
           </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left: Settings */}
        <div className="lg:col-span-4 space-y-6">
           {/* 路徑選擇 */}
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

           {/* 參數滑桿 */}
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

        {/* Right: The Vault Visual & Risk Test */}
        <div className="lg:col-span-8 flex flex-col gap-6">
           
           {/* Visual Area */}
           <div className={`relative flex-1 rounded-3xl p-8 flex flex-col items-center justify-center transition-all duration-500 border-4 ${
               localLocked ? 'bg-slate-900 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.3)]' 
               : activeDisaster ? 'bg-red-50 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]'
               : 'bg-white border-slate-200 shadow-sm'
           }`}>
              
              {/* Status Badge */}
              <div className={`absolute top-6 right-6 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                  localLocked ? 'bg-yellow-500 text-black' 
                  : activeDisaster ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-slate-100 text-slate-400'
              }`}>
                 {localLocked ? 'SECURED / 已上鎖' 
                  : activeDisaster ? 'WARNING / 資產流失中' 
                  : 'UNSECURED / 風險敞開'}
              </div>

              {/* Main Icon */}
              <div className="relative mb-8 mt-4">
                 <div className={`transition-all duration-700 transform ${localLocked ? 'scale-110' : activeDisaster ? 'scale-90 opacity-80' : 'scale-100'}`}>
                    {localLocked ? (
                       <ShieldCheck size={180} className="text-yellow-500" />
                    ) : activeDisaster ? (
                       <AlertTriangle size={180} className="text-red-500 animate-bounce" />
                    ) : (
                       <Unlock size={180} className="text-slate-300" />
                    )}
                 </div>
                 
                 {/* 上鎖特效 */}
                 {localLocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-full bg-yellow-400/20 rounded-full animate-ping"></div>
                    </div>
                 )}
              </div>

              {/* Money Display */}
              <div className="text-center space-y-2 z-10">
                 <p className={`text-sm font-bold uppercase tracking-widest ${
                     localLocked ? 'text-yellow-500' : activeDisaster ? 'text-red-500' : 'text-slate-400'
                 }`}>
                    {localLocked ? '資產實名制 (已扣除10%保全成本)' : activeDisaster ? '資產遭受重創' : '預估總資產'}
                 </p>
                 
                 <div className={`text-5xl md:text-7xl font-black font-mono tracking-tighter transition-colors duration-300 ${
                     localLocked ? 'text-white' : activeDisaster ? 'text-red-600' : 'text-slate-700'
                 }`}>
                    ${animateValue.toLocaleString()}
                 </div>

                 {/* 損失金額提示 */}
                 {activeDisaster && !localLocked && (
                     <div className="text-red-500 font-bold bg-red-100 px-3 py-1 rounded-full inline-block animate-pulse">
                        損失: -${(baseValue - finalDisplayValue).toLocaleString()}
                     </div>
                 )}

                 <div className="flex items-center justify-center gap-4 mt-2 text-sm font-medium opacity-80">
                    <span className={localLocked ? 'text-slate-400' : 'text-slate-500'}>
                       本金: ${principal.toLocaleString()}
                    </span>
                    {/* 上鎖後利息當然也變少，因為本體變少了，但這是為了安全 */}
                 </div>
              </div>
           </div>

           {/* --- 壓力測試控制台 --- */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                 <Activity className="text-rose-500"/> 資產壓力測試 (Stress Test)
              </h4>
              
              <div className="flex flex-col md:flex-row gap-4">
                 
                 {/* 災難按鈕群 (左側) */}
                 <div className="flex-1 grid grid-cols-3 gap-2">
                    <button 
                       onClick={() => toggleDisaster('medical')}
                       disabled={localLocked}
                       className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                           localLocked ? 'opacity-30 cursor-not-allowed border-slate-100' 
                           : activeDisaster === 'medical' ? 'border-red-500 bg-red-50 text-red-600' 
                           : 'border-slate-100 hover:border-red-200 text-slate-500 hover:bg-red-50/30'
                       }`}
                    >
                       <Activity size={24}/>
                       <span className="text-xs font-bold">重大傷病</span>
                       {!localLocked && <span className="text-[10px] text-red-400">-200萬</span>}
                    </button>

                    <button 
                       onClick={() => toggleDisaster('market')}
                       disabled={localLocked}
                       className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                           localLocked ? 'opacity-30 cursor-not-allowed border-slate-100' 
                           : activeDisaster === 'market' ? 'border-red-500 bg-red-50 text-red-600' 
                           : 'border-slate-100 hover:border-red-200 text-slate-500 hover:bg-red-50/30'
                       }`}
                    >
                       <TrendingUp size={24} className="rotate-180"/>
                       <span className="text-xs font-bold">市場崩盤</span>
                       {!localLocked && <span className="text-[10px] text-red-400">-30%</span>}
                    </button>

                    <button 
                       onClick={() => toggleDisaster('tax')}
                       disabled={localLocked}
                       className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                           localLocked ? 'opacity-30 cursor-not-allowed border-slate-100' 
                           : activeDisaster === 'tax' ? 'border-red-500 bg-red-50 text-red-600' 
                           : 'border-slate-100 hover:border-red-200 text-slate-500 hover:bg-red-50/30'
                       }`}
                    >
                       <Ban size={24}/>
                       <span className="text-xs font-bold">稅務/債務</span>
                       {!localLocked && <span className="text-[10px] text-red-400">-100萬</span>}
                    </button>
                 </div>

                 {/* 上鎖按鈕 (右側 - 關鍵行動) */}
                 <button 
                    onClick={() => setLocalLocked(!localLocked)}
                    className={`md:w-1/3 px-6 py-4 rounded-xl font-bold text-lg flex flex-col items-center justify-center gap-1 transition-all shadow-xl ${
                       localLocked 
                       ? 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200' 
                       : 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white hover:from-yellow-600 hover:to-amber-700 shadow-yellow-200 scale-105'
                    }`}
                 >
                    <div className="flex items-center gap-2">
                        {localLocked ? <Unlock size={20}/> : <Lock size={20}/>}
                        <span>{localLocked ? '解除鎖定' : '立即上鎖'}</span>
                    </div>
                    {!localLocked && <span className="text-xs opacity-90 font-normal">只需提撥 10% 成本</span>}
                 </button>

              </div>
              
              {/* 互動反饋訊息 */}
              <div className="mt-4 text-center h-6">
                 {localLocked ? (
                    <p className="text-sm font-bold text-emerald-600 flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                       <ShieldCheck size={16}/> 
                       防護網已啟動！無論發生什麼災難，您的 {(Math.round(baseValue * 0.9 / 10000))} 萬資產都將毫髮無傷。
                    </p>
                 ) : activeDisaster ? (
                    <p className="text-sm font-bold text-red-500 flex items-center justify-center gap-2 animate-bounce">
                       <AlertTriangle size={16}/> 
                       警報！您的保險箱門戶大開，資產正在流失給醫生或政府！
                    </p>
                 ) : (
                    <p className="text-sm text-slate-400">
                       試試看點擊左側災難，看看您的資產是否安全？
                    </p>
                 )}
              </div>

           </div>
        </div>

      </div>
    </div>
  );
}