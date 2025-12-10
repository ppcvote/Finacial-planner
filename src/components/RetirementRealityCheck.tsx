import React, { useState, useMemo, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { 
  Calculator, TrendingUp, AlertTriangle, CheckCircle2, 
  HelpCircle, RefreshCcw, ArrowRight, Wallet 
} from 'lucide-react';

// --- 1. 狠話生成引擎 (Insight Engine) ---
// 根據缺口比例生成對應的行銷語言，推動成交
const getInsightMessage = (gap: number, totalNeeded: number, age: number) => {
  const gapPercentage = totalNeeded > 0 ? (gap / totalNeeded) * 100 : 0;

  if (gap <= 0) return { 
    level: 'success',
    title: '資產護城河堅不可摧',
    text: "您的準備相當充裕！現在可以將焦點轉向「資產傳承」與「稅務規劃」，確保富過三代。",
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: CheckCircle2
  };
  
  if (gapPercentage < 30) return { 
    level: 'warning',
    title: '警報：醫療通膨風險',
    text: `雖然接近目標，但您可能低估了老年醫療與長照費用。建議利用「增額分紅」工具修補這 ${(gap / 10000).toFixed(0)} 萬的缺口。`,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: HelpCircle
  };

  if (gapPercentage >= 30 && age > 45) return { 
    level: 'danger',
    title: '殘酷事實：退休生活將被迫打折',
    text: `依照目前速度，您的退休生活品質將被迫打 3 折。這不是退休，這是「延遲破產」。如果不現在行動，您必須延後 7 年才能退休。`,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    icon: AlertTriangle
  };

  return { 
    level: 'alert',
    title: '資金缺口嚴重預警',
    text: `您的資金缺口高達 ${(gap / 10000).toFixed(0)} 萬。光靠定存無法解決問題，您需要透過「時間複利」與「強迫儲蓄」來建立保底資產。`,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    icon: AlertTriangle
  };
};

// --- 2. 計算核心 Hook (Logic Layer) ---
const useRetirementCalculation = (initialInputs: any) => {
  const [inputs, setInputs] = useState(initialInputs);

  const results = useMemo(() => {
    const { currentAge, retireAge, monthlyExpense, currentSavings, roi, inflation } = inputs;
    
    const lifeExpectancy = 85; 
    const yearsToGrow = Math.max(0, retireAge - currentAge);
    const yearsInRetirement = Math.max(0, lifeExpectancy - retireAge);
    
    // 1. 計算退休時，每月真正需要的錢 (考慮通膨)
    const futureMonthlyExpense = monthlyExpense * Math.pow(1 + inflation / 100, yearsToGrow);
    
    // 2. 退休總需求 (簡單估算：月開銷 * 12 * 退休年數)
    const totalNeeded = futureMonthlyExpense * 12 * yearsInRetirement;

    // 3. 目前資產的未來價值 (Future Value)
    const futureSavings = currentSavings * Math.pow(1 + roi / 100, yearsToGrow);

    // 4. 缺口
    const gap = Math.max(0, totalNeeded - futureSavings);

    // 5. 生成圖表數據 (Area Chart 需要隨時間變化的數據)
    const chartData = [];
    let currentAsset = currentSavings;
    
    // 模擬從現在到 85 歲
    for (let age = currentAge; age <= lifeExpectancy; age++) {
      const isRetired = age >= retireAge;
      
      // 資產增長 (複利)
      if (!isRetired) {
        currentAsset = currentAsset * (1 + roi / 100); 
        // 這裡可以加入「每年投入」的邏輯，目前簡化為單筆複利
      } else {
        // 退休後資產繼續滾存，但要扣除開銷
        currentAsset = (currentAsset * (1 + roi / 100)) - (futureMonthlyExpense * 12);
      }

      // 需求曲線 (累積需要的錢) -> 這裡用簡化的視覺邏輯：
      // 綠色面積 = 我有的錢
      // 紅色面積 = 我需要的錢 (如果是負債狀態)
      
      // 為了 AreaChart 視覺效果，我們設計兩條線：
      // "Target": 理想資金水位 (遞減，直到 85 歲歸零)
      // "Actual": 實際資金水位
      
      chartData.push({
        age,
        asset: Math.max(0, Math.round(currentAsset / 10000)), // 單位：萬
        gap: currentAsset < 0 ? Math.abs(Math.round(currentAsset / 10000)) : 0
      });
    }

    return { totalNeeded, futureSavings, gap, futureMonthlyExpense, chartData };
  }, [inputs]);

  return { inputs, setInputs, results };
};

// --- 3. UI Component (View Layer) ---
export default function RetirementRealityCheck() {
  const { inputs, setInputs, results } = useRetirementCalculation({
    currentAge: 35,
    retireAge: 65,
    monthlyExpense: 40000,
    currentSavings: 1000000,
    roi: 5,
    inflation: 2
  });

  const insight = getInsightMessage(results.gap, results.totalNeeded, inputs.currentAge);
  const InsightIcon = insight.icon;

  const handleInput = (key: string, value: number) => {
    setInputs((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans text-slate-800 pb-20">
      
      {/* 1. Header with Tough Love Theme */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Calculator size={300} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wider">ULTRA ADVISOR</span>
               <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Interactive Tool</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2">退休現實檢測器</h1>
            <p className="text-slate-400 text-sm max-w-md">
              數據不會說謊。輸入您的現況，系統將立即運算您的「資產壽命」。
            </p>
          </div>
          
          {/* 關鍵數字摘要 */}
          <div className="flex gap-6 text-right">
             <div>
                <div className="text-xs text-slate-500 font-bold uppercase">準備缺口 (Gap)</div>
                <div className={`text-3xl font-black font-mono ${results.gap > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                   ${Math.round(results.gap / 10000).toLocaleString()} <span className="text-sm">萬</span>
                </div>
             </div>
             <div>
                 <div className="text-xs text-slate-500 font-bold uppercase">通膨後月開銷</div>
                 <div className="text-2xl font-bold font-mono text-white">
                    ${Math.round(results.futureMonthlyExpense).toLocaleString()}
                 </div>
             </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Left: Input Control Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
              <RefreshCcw size={18} className="text-slate-400"/> 參數設定
            </h3>
            
            <div className="space-y-6">
              {/* 年齡滑桿 */}
              <InputSlider 
                label="目前年齡" 
                value={inputs.currentAge} 
                min={20} max={60} unit="歲"
                onChange={(v) => handleInput('currentAge', v)} 
              />
              
              <InputSlider 
                label="預計退休年齡" 
                value={inputs.retireAge} 
                min={45} max={75} unit="歲"
                onChange={(v) => handleInput('retireAge', v)} 
              />
              
              <hr className="border-slate-100"/>

              {/* 金額設定 */}
              <div className="space-y-1">
                 <div className="flex justify-between text-sm">
                    <span className="font-bold text-slate-600">目前已有儲蓄</span>
                    <span className="font-mono font-bold text-blue-600">${inputs.currentSavings.toLocaleString()}</span>
                 </div>
                 <input 
                   type="range" min={0} max={10000000} step={100000}
                   value={inputs.currentSavings}
                   onChange={(e) => handleInput('currentSavings', Number(e.target.value))}
                   className="w-full h-2 bg-slate-100 rounded-lg accent-blue-600"
                 />
              </div>

              <div className="space-y-1">
                 <div className="flex justify-between text-sm">
                    <span className="font-bold text-slate-600">退休後月花費 (現值)</span>
                    <span className="font-mono font-bold text-rose-500">${inputs.monthlyExpense.toLocaleString()}</span>
                 </div>
                 <input 
                   type="range" min={10000} max={150000} step={1000}
                   value={inputs.monthlyExpense}
                   onChange={(e) => handleInput('monthlyExpense', Number(e.target.value))}
                   className="w-full h-2 bg-slate-100 rounded-lg accent-rose-500"
                 />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <InputNumber label="投資報酬率 %" value={inputs.roi} onChange={(v) => handleInput('roi', v)} step={0.5} />
                 <InputNumber label="預估通膨率 %" value={inputs.inflation} onChange={(v) => handleInput('inflation', v)} step={0.5} />
              </div>
            </div>
          </div>

          {/* Tough Love Message Card */}
          <div className={`${insight.bg} border ${insight.border} rounded-2xl p-5 shadow-sm transition-all duration-500`}>
             <div className="flex gap-3">
                <div className={`p-2 rounded-full h-fit bg-white ${insight.color}`}>
                   <InsightIcon size={24} />
                </div>
                <div>
                   <h4 className={`font-bold text-sm mb-1 ${insight.color}`}>{insight.title}</h4>
                   <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {insight.text}
                   </p>
                </div>
             </div>
          </div>
        </div>

        {/* Right: Visualization */}
        <div className="lg:col-span-8">
           <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-[500px] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-slate-800">資產壽命趨勢圖</h3>
                 <div className="flex gap-4 text-xs font-bold">
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div> 資產餘額</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-rose-500 rounded-full"></div> 資金缺口</div>
                 </div>
              </div>

              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={results.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAsset" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorGap" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                       dataKey="age" 
                       tickLine={false} axisLine={false} 
                       tick={{fontSize: 12, fill: '#94a3b8'}}
                       label={{ value: '年齡', position: 'insideBottomRight', offset: -5 }}
                    />
                    <YAxis 
                       hide 
                       domain={['auto', 'auto']}
                    />
                    <Tooltip 
                       contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                    <ReferenceLine x={inputs.retireAge} stroke="#64748b" strokeDasharray="3 3" label={{ position: 'top', value: '退休', fill: '#64748b', fontSize: 12 }} />
                    
                    <Area 
                       type="monotone" 
                       dataKey="asset" 
                       stroke="#10b981" 
                       strokeWidth={3}
                       fillOpacity={1} 
                       fill="url(#colorAsset)" 
                       name="資產餘額 (萬)"
                       animationDuration={1000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 p-4 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                 <div className="text-xs text-slate-500">
                    <span className="font-bold text-slate-700">圖表解讀：</span> 
                    當綠色曲線歸零，代表您的退休金已耗盡。
                 </div>
                 {results.gap > 0 && (
                     <button className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-rose-200">
                        <TrendingUp size={14}/>
                        一鍵生成補救計畫
                     </button>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---
const InputSlider = ({ label, value, min, max, unit, onChange }: any) => (
  <div>
     <div className="flex justify-between text-sm mb-1">
        <span className="font-bold text-slate-600">{label}</span>
        <span className="font-mono font-bold text-slate-800">{value} <span className="text-xs text-slate-400">{unit}</span></span>
     </div>
     <input 
       type="range" min={min} max={max} step={1}
       value={value}
       onChange={(e) => onChange(Number(e.target.value))}
       className="w-full h-2 bg-slate-200 rounded-lg accent-slate-600"
     />
  </div>
);

const InputNumber = ({ label, value, onChange, step }: any) => (
  <div>
     <label className="text-xs font-bold text-slate-500 mb-1 block">{label}</label>
     <input 
        type="number" step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
     />
  </div>
);