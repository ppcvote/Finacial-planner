import React from 'react';
import { 
  Rocket, 
  Calculator, 
  Clock, 
  Coins, 
  TrendingUp, 
  ThumbsUp, 
  ArrowRight, 
  Zap, 
  Hourglass,
  PiggyBank
} from 'lucide-react';
import { ResponsiveContainer, ComposedChart, Area, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ReferenceLine, ReferenceArea } from 'recharts';

export const SuperActiveSavingTool = ({ data, setData }: any) => {
  const safeData = {
    monthlySaving: Number(data?.monthlySaving) || 10000,
    investReturnRate: Number(data?.investReturnRate) || 6,
    activeYears: Number(data?.activeYears) || 15,
    totalYears: 40 // 固定比較基準：一般人工作40年 (25歲-65歲)
  };
  const { monthlySaving, investReturnRate, activeYears, totalYears } = safeData;

  // --- 計算邏輯 ---
  
  const fullChartData = [];
  let pAcc = 0; // 消極累積 (勞力存錢 - 不投資或極低定存，這裡假設 0% 凸顯本金差異，或可視為被通膨抵銷)
  let aInv = 0; // 積極累積 (複利存錢)
  
  for (let year = 1; year <= totalYears; year++) {
      // 消極模式：每年乖乖存錢，存滿 40 年
      pAcc += monthlySaving * 12;
      
      // 積極模式：只存 activeYears 年，之後就讓錢自己滾
      if (year <= activeYears) {
          // 奮鬥期：本金投入 + 獲利
          aInv = (aInv + monthlySaving * 12) * (1 + investReturnRate / 100);
      } else {
          // 躺平期 (Coasting)：不再投入本金，純靠複利
          aInv = aInv * (1 + investReturnRate / 100);
      }
      
      fullChartData.push({
          year: year,
          yearLabel: `第${year}年`,
          消極存錢: Math.round(pAcc / 10000),
          積極存錢: Math.round(aInv / 10000),
          phase: year <= activeYears ? '奮鬥期' : '複利期'
      });
  }

  // --- 關鍵指標計算 ---
  
  // 1. 本金對比
  const totalPrincipalPassive = monthlySaving * 12 * totalYears; // 勞力存錢總本金 (存40年)
  const totalPrincipalActive = monthlySaving * 12 * activeYears; // 積極存錢總本金 (存15年)
  const savedPrincipal = totalPrincipalPassive - totalPrincipalActive; // 省下的本金

  // 2. 最終資產
  const finalPassiveAsset = pAcc;
  const finalActiveAsset = aInv;
  const activeWan = Math.round(finalActiveAsset / 10000);
  const passiveWan = Math.round(finalPassiveAsset / 10000);

  // 3. 被動收入轉化 (假設退休後以 5% 提領率或配息率計算)
  const safeWithdrawalRate = 0.05; 
  const monthlyPassiveIncome = Math.round((finalActiveAsset * safeWithdrawalRate) / 12);

  const updateField = (field: string, value: number) => { setData({ ...safeData, [field]: value }); };

  return (
    <div className="space-y-8 animate-fade-in font-sans text-slate-800">
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden print-break-inside">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Rocket size={180} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-sm">
              FIRE Movement
            </span>
            <span className="bg-yellow-400/20 text-yellow-100 px-3 py-1 rounded-full text-xs font-bold tracking-wider backdrop-blur-sm border border-yellow-400/30">
              先苦後甘・複利效應
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight flex items-center gap-3">
            超積極存錢法
          </h1>
          <p className="text-violet-100 text-lg opacity-90 max-w-2xl">
            辛苦 {activeYears} 年，換來 {totalYears - activeYears} 年的資產自動導航。用複利對抗勞力，讓錢為您工作。
          </p>
        </div>
      </div>

      {/* --- 核心效益卡片區 (新增) --- */}
      <div className="grid md:grid-cols-3 gap-6 print-break-inside">
         
         {/* 卡片 1: 本金效率 (省下多少錢) */}
         <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden group hover:border-violet-300 transition-all">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <PiggyBank size={80} className="text-violet-600"/>
             </div>
             <h3 className="text-violet-600 text-sm font-bold mb-1 flex items-center gap-2">
                <ThumbsUp size={16}/> 本金投入效率
             </h3>
             <div className="text-xs text-slate-400 mb-4">比起傻傻存40年，您少付了...</div>
             <p className="text-4xl font-black text-violet-600 font-mono">
                 ${Math.round(savedPrincipal/10000).toLocaleString()} <span className="text-lg text-violet-400">萬</span>
             </p>
             <div className="mt-3 text-xs text-slate-500 bg-violet-50 p-2 rounded-lg">
                僅需投入 <strong>${Math.round(totalPrincipalActive/10000)}萬</strong> 本金<br/>
                (傳統存法需投入 ${Math.round(totalPrincipalPassive/10000)}萬)
             </div>
         </div>

         {/* 卡片 2: 時間自由 (省下多少年) */}
         <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden group hover:border-fuchsia-300 transition-all">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Hourglass size={80} className="text-fuchsia-600"/>
             </div>
             <h3 className="text-fuchsia-600 text-sm font-bold mb-1 flex items-center gap-2">
                <Clock size={16}/> 提早贖回自由
             </h3>
             <div className="text-xs text-slate-400 mb-4">資產自動增長，不需再投入</div>
             <p className="text-4xl font-black text-fuchsia-600 font-mono">
                 {totalYears - activeYears} <span className="text-lg text-fuchsia-400">年</span>
             </p>
             <div className="mt-3 text-xs text-slate-500 bg-fuchsia-50 p-2 rounded-lg">
                <div className="flex justify-between mb-1">
                    <span>奮鬥期:</span>
                    <span className="font-bold text-slate-700">{activeYears} 年</span>
                </div>
                <div className="flex justify-between">
                    <span>躺平複利期:</span>
                    <span className="font-bold text-fuchsia-600">{totalYears - activeYears} 年</span>
                </div>
             </div>
         </div>

         {/* 卡片 3: 終值月薪 (被動收入) */}
         <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-2xl p-6 shadow-sm border border-violet-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Coins size={80} className="text-violet-600"/>
             </div>
             <h3 className="text-violet-700 text-sm font-bold mb-1 flex items-center gap-2">
                <TrendingUp size={16}/> 40年後期滿月薪
             </h3>
             <div className="text-xs text-violet-600/70 mb-4">資產創造的永久被動收入</div>
             <p className="text-4xl font-black text-violet-600 font-mono">
                 ${monthlyPassiveIncome.toLocaleString()} <span className="text-lg text-violet-500">/月</span>
             </p>
             <div className="mt-3 text-xs text-violet-800 bg-white/60 p-2 rounded-lg backdrop-blur-sm border border-violet-100">
                <div className="flex justify-between">
                    <span>最終總資產:</span>
                    <span className="font-bold">${activeWan.toLocaleString()} 萬</span>
                </div>
             </div>
         </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* 左側：參數設定 */}
        <div className="lg:col-span-4 space-y-6 print-break-inside">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2"><Calculator size={20} className="text-violet-600"/> 參數設定</h4>
            <div className="space-y-6">
               {[
                 { label: "每月存錢金額", field: "monthlySaving", min: 3000, max: 100000, step: 1000, val: monthlySaving, color: "violet", unit: "元" },
                 { label: "只需辛苦幾年 (奮鬥期)", field: "activeYears", min: 5, max: 25, step: 1, val: activeYears, color: "fuchsia", unit: "年" },
                 { label: "投資年化報酬率", field: "investReturnRate", min: 3, max: 12, step: 0.5, val: investReturnRate, color: "emerald", unit: "%" }
               ].map((item) => (
                 <div key={item.field}>
                   <div className="flex justify-between mb-2">
                     <label className="text-sm font-medium text-slate-600">{item.label}</label>
                     <span className={`font-mono font-bold text-${item.color}-600 text-lg`}>
                        {item.field === 'monthlySaving' ? '$' : ''}{item.val.toLocaleString()}{item.unit ? item.unit : ''}
                     </span>
                   </div>
                   <input 
                      type="range" 
                      min={item.min} 
                      max={item.max} 
                      step={item.step} 
                      value={item.val} 
                      onChange={(e) => updateField(item.field, Number(e.target.value))} 
                      className={`w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-${item.color}-600 hover:accent-${item.color}-700 transition-all`} 
                   />
                 </div>
               ))}
            </div>

            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h5 className="font-bold text-slate-700 text-sm mb-3">策略路徑預覽</h5>
                <div className="flex items-center gap-3 text-xs mb-2">
                    <div className="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold">1</div>
                    <div className="flex-1">
                        <span className="font-bold text-slate-700">前 {activeYears} 年 (主動投入)</span>
                        <p className="text-slate-500">每月存 ${monthlySaving.toLocaleString()}，本金+複利雙引擎。</p>
                    </div>
                </div>
                <div className="w-0.5 h-4 bg-slate-300 ml-3 my-1"></div>
                <div className="flex items-center gap-3 text-xs">
                    <div className="w-6 h-6 rounded-full bg-fuchsia-500 text-white flex items-center justify-center font-bold">2</div>
                    <div className="flex-1">
                        <span className="font-bold text-slate-700">後 {totalYears - activeYears} 年 (自動導航)</span>
                        <p className="text-slate-500">停止投入本金 $0，靠複利讓資產翻倍再翻倍。</p>
                    </div>
                </div>
            </div>
          </div>
          
          {/* 對比小結 */}
          <div className="bg-white rounded-2xl shadow border border-slate-200 p-6 space-y-4">
             <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div className="text-left">
                    <p className="text-xs text-slate-500">消極存錢 (存40年)</p>
                    <p className="text-lg font-bold text-slate-600">${passiveWan.toLocaleString()}萬</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-violet-600 font-bold">積極存錢 (存{activeYears}年)</p>
                    <p className="text-2xl font-black text-violet-600 font-mono">${activeWan.toLocaleString()}萬</p>
                </div>
             </div>
             
             <div className="text-center">
                 <p className="text-sm text-slate-600 font-medium">資產差距倍數</p>
                 <p className="text-3xl font-black text-emerald-500 font-mono mt-1">
                    {(finalActiveAsset / finalPassiveAsset).toFixed(1)} <span className="text-lg">倍</span>
                 </p>
                 <p className="text-xs text-slate-400 mt-1">越早開始，複利效應越驚人</p>
             </div>
          </div>
        </div>

        {/* 右側：圖表展示 */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[500px] print-break-inside relative">
             <div className="flex justify-between items-center mb-4 pl-2 border-l-4 border-violet-500">
                <h4 className="font-bold text-slate-700">資產成長曲線：勞力 vs 複利</h4>
                <div className="flex gap-4 text-xs font-bold">
                    <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-violet-500"></span> 積極資產 (複利)
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-slate-400"></span> 消極本金 (勞力)
                    </div>
                </div>
             </div>

            <ResponsiveContainer width="100%" height="90%">
              <ComposedChart data={fullChartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                    dataKey="year" 
                    type="number" 
                    domain={[0, totalYears]} 
                    tick={{fontSize: 12, fill: '#64748b'}} 
                    axisLine={false} 
                    tickLine={false}
                    tickFormatter={(val) => `第${val}年`}
                />
                <YAxis unit="萬" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}} 
                    itemStyle={{padding: '2px 0'}}
                    labelFormatter={(val) => `第 ${val} 年 (${val <= activeYears ? '奮鬥期' : '複利期'})`}
                    formatter={(value, name) => [
                        <span className="font-bold text-base">{value}萬</span>, 
                        name
                    ]}
                />
                <Legend iconType="circle" />

                {/* 背景色塊區分：奮鬥期 vs 躺平期 */}
                <ReferenceArea x1={0} x2={activeYears} fill="#8b5cf6" fillOpacity={0.05} />
                <ReferenceArea x1={activeYears} x2={totalYears} fill="#d946ef" fillOpacity={0.05} />
                
                {/* 分界線 */}
                <ReferenceLine x={activeYears} stroke="#d946ef" strokeDasharray="3 3" label={{ position: 'top', value: '停止投入本金', fill: '#d946ef', fontSize: 12 }} />

                <Area 
                    type="monotone" 
                    name="積極存錢 (複利)" 
                    dataKey="積極存錢" 
                    stroke="#8b5cf6" 
                    fill="url(#colorActive)" 
                    strokeWidth={3} 
                />
                <Line 
                    type="monotone" 
                    name="消極存錢 (勞力)" 
                    dataKey="消極存錢" 
                    stroke="#94a3b8" 
                    strokeWidth={2} 
                    strokeDasharray="5 5" 
                    dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
            
            {/* 圖表底部說明 */}
            <div className="absolute bottom-4 left-0 right-0 px-6 flex justify-between text-xs text-slate-400 pointer-events-none">
                <div className="text-left w-1/3">
                    <span className="text-violet-500 font-bold">奮鬥期 (前{activeYears}年)</span>
                    <br/>每月投入 ${monthlySaving.toLocaleString()}
                </div>
                <div className="text-right w-1/3">
                    <span className="text-fuchsia-500 font-bold">複利期 (後{totalYears - activeYears}年)</span>
                    <br/>每月投入 $0，資產自動增長
                </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 底部行動呼籲區 */}
      <div className="mt-8 bg-slate-800 rounded-3xl p-8 text-center shadow-lg relative overflow-hidden print-break-inside">
         <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h3 className="text-2xl font-bold text-white">您想選擇哪一種人生？</h3>
            <div className="flex flex-col md:flex-row gap-4 justify-center mt-6">
                <div className="flex-1 bg-slate-700/50 p-4 rounded-xl border border-slate-600 text-slate-300">
                    <p className="font-bold mb-2">😭 方案 A：勞碌人生</p>
                    <p className="text-sm">工作 40 年，總投入 {Math.round(totalPrincipalPassive/10000)} 萬本金</p>
                    <p className="text-sm mt-1">最後資產：{passiveWan} 萬</p>
                </div>
                <div className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 p-4 rounded-xl shadow-lg text-white transform scale-105 border border-white/20">
                    <p className="font-bold mb-2">🚀 方案 B：複利人生</p>
                    <p className="text-sm">工作 {activeYears} 年，總投入 {Math.round(totalPrincipalActive/10000)} 萬本金</p>
                    <p className="text-sm mt-1">最後資產：{activeWan} 萬</p>
                </div>
            </div>
            <p className="text-slate-400 text-sm mt-6">
                「種一棵樹最好的時間是十年前，其次是現在。」現在開始，讓複利成為您最好的朋友。
            </p>
         </div>
      </div>
    </div>
  );
};