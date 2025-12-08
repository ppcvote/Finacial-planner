import React, { useState } from 'react';
import { 
  Waves, 
  Calculator, 
  ArrowRight, 
  Database, 
  TrendingUp, 
  Droplets, 
  Settings, 
  ChevronDown, 
  ChevronUp,
  RefreshCw,
  CheckCircle2,
  Landmark,
  Coins
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ReferenceLine } from 'recharts';

export const BigSmallReservoirTool = ({ data, setData }: any) => {
  const safeData = {
    initialCapital: Number(data?.initialCapital) || 1000, // 萬 (大水庫本金)
    dividendRate: Number(data?.dividendRate) || 5, // % (大水庫配息率)
    reinvestRate: Number(data?.reinvestRate) || 8, // % (小水庫再投報率)
    years: Number(data?.years) || 20 // 年
  };
  const { initialCapital, dividendRate, reinvestRate, years } = safeData;

  const [showAdvanced, setShowAdvanced] = useState(false);

  // --- 計算邏輯 ---
  const generateData = () => {
    const dataArr = [];
    let smallReservoir = 0; // 小水庫累積金額 (複利池)
    let totalDividendsReceived = 0; // 對照組：單利累積
    let doubleYear = null; // 翻倍點

    for (let year = 1; year <= years + 5; year++) { 
      // 1. 大水庫產生配息 (本金 * 配息率)
      // 大水庫本金恆定不變，配息全部移出
      const annualDividend = initialCapital * (dividendRate / 100);
      
      // 2. 小水庫成長 ( (去年小水庫 + 今年配息) * 再投資回報 )
      if (year <= years) {
          smallReservoir = (smallReservoir + annualDividend) * (1 + reinvestRate / 100);
          totalDividendsReceived += annualDividend;
      } else {
          // 期滿後不再投入配息，讓小水庫自己滾
          smallReservoir = smallReservoir * (1 + reinvestRate / 100);
      }

      // 檢查翻倍點 (小水庫 >= 大水庫本金)
      if (smallReservoir >= initialCapital && doubleYear === null) {
          doubleYear = year;
      }

      dataArr.push({
        year: year,
        yearLabel: `第${year}年`,
        大水庫本金: initialCapital, // 恆定
        小水庫累積: Math.round(smallReservoir), // 成長
        總資產: Math.round(initialCapital + smallReservoir),
        單純領息累積: Math.round(initialCapital + totalDividendsReceived)
      });
    }
    return { dataArr, doubleYear };
  };
  
  const { dataArr, doubleYear } = generateData();
  const currentData = dataArr[Math.min(years, dataArr.length) - 1]; // 取當前設定年份的數據
  
  // 資產總值
  const totalAsset = currentData.總資產;
  const profit = currentData.小水庫累積;

  // --- UI 更新 ---
  const updateField = (field: string, value: number) => { 
      let newValue = Number(value);
      if (field === 'initialCapital') newValue = Math.max(100, Math.min(10000, newValue));
      setData({ ...safeData, [field]: newValue }); 
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans text-slate-800">
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden print-break-inside">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Waves size={180} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-sm">
              Asset Allocation
            </span>
            <span className="bg-amber-400/20 text-amber-100 px-3 py-1 rounded-full text-xs font-bold tracking-wider backdrop-blur-sm border border-amber-400/30">
              母子基金・自動平衡
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight flex items-center gap-3">
            大小水庫專案
          </h1>
          <p className="text-cyan-100 text-lg opacity-90 max-w-2xl">
            構建生生不息的現金流系統。大水庫穩健生息，小水庫積極複利，讓資產像水流一樣源源不絕。
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* 左側：參數設定 */}
        <div className="lg:col-span-4 space-y-6 print-break-inside">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
              <Calculator size={20} className="text-cyan-600"/> 
              水庫參數
            </h4>
            <div className="space-y-6">
               {/* 大水庫本金 */}
               <div>
                   <div className="flex justify-between items-center mb-2">
                       <label className="text-sm font-medium text-slate-600">大水庫本金 (萬)</label>
                       <div className="flex items-center">
                           <input 
                               type="number" min={100} max={5000} step={50} 
                               value={initialCapital} 
                               onChange={(e) => updateField('initialCapital', Number(e.target.value))} 
                               className="w-20 text-right bg-transparent border-none p-0 font-mono font-bold text-cyan-600 text-lg focus:ring-0"
                           />
                           <span className="font-mono font-bold text-cyan-600 text-lg ml-1">萬</span>
                       </div>
                   </div>
                   <input type="range" min={100} max={5000} step={50} value={initialCapital} onChange={(e) => updateField('initialCapital', Number(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg accent-cyan-600" />
               </div>

               {/* 運作時間 */}
               <div>
                 <div className="flex justify-between mb-1">
                     <label className="text-sm font-medium text-slate-600">運作時間 (年)</label>
                     <span className="font-mono font-bold text-blue-600 text-lg">{years} 年</span>
                 </div>
                 <input type="range" min={5} max={40} step={1} value={years} onChange={(e) => updateField('years', Number(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg accent-blue-600" />
               </div>

               {/* 進階設定 Toggle */}
               <button 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                    showAdvanced 
                      ? 'bg-amber-50 border-amber-200 text-amber-800' 
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
               >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Settings size={16} />
                    進階設定 (雙引擎利率)
                  </div>
                  {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
               </button>

               {/* 進階設定 Panel */}
               {showAdvanced && (
                 <div className="space-y-4 animate-in slide-in-from-top-2 duration-300 pt-2 border-t border-amber-100">
                    <div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span className="flex items-center gap-1"><Database size={12} className="text-cyan-500"/> 大水庫配息率 (%)</span>
                            <span className="font-bold text-cyan-700">{dividendRate}%</span>
                        </div>
                        <input type="range" min={2} max={15} step={0.5} value={dividendRate} onChange={(e) => updateField('dividendRate', Number(e.target.value))} className="w-full h-1.5 bg-cyan-100 rounded-lg accent-cyan-600" />
                        <p className="text-[10px] text-slate-400 mt-1">建議配置：穩健型標的 (如債券、定存股)</p>
                    </div>
                    <div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span className="flex items-center gap-1"><TrendingUp size={12} className="text-amber-500"/> 小水庫再投報率 (%)</span>
                            <span className="font-bold text-amber-700">{reinvestRate}%</span>
                        </div>
                        <input type="range" min={4} max={30} step={0.5} value={reinvestRate} onChange={(e) => updateField('reinvestRate', Number(e.target.value))} className="w-full h-1.5 bg-amber-100 rounded-lg accent-amber-500" />
                        <p className="text-[10px] text-slate-400 mt-1">建議配置：成長型標的 (如股票型 ETF)</p>
                    </div>
                 </div>
               )}
            </div>
          </div>

          {/* 水利工程示意圖 (Flow System) */}
          <div className="bg-slate-800 rounded-2xl p-6 shadow-lg text-white relative overflow-hidden">
              <div className="flex items-center gap-2 mb-6 border-b border-slate-700 pb-2">
                  <RefreshCw size={20} className="text-cyan-400"/>
                  <span className="font-bold">資金流動系統</span>
              </div>
              
              <div className="flex justify-between items-center relative">
                  {/* Big Reservoir */}
                  <div className="flex flex-col items-center z-10 w-1/3">
                      <div className="w-16 h-20 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-lg border-2 border-blue-300 shadow-[0_0_15px_rgba(34,211,238,0.5)] flex items-end justify-center pb-2 relative">
                          <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                          <Database size={32} className="text-white drop-shadow-md"/>
                      </div>
                      <p className="mt-2 text-sm font-bold text-cyan-300">大水庫</p>
                      <p className="text-xs text-slate-400">本金 {initialCapital} 萬 (恆定)</p>
                  </div>

                  {/* Flow Arrow */}
                  <div className="flex-1 flex flex-col items-center -mt-6">
                      <div className="text-xs text-cyan-200 mb-1 font-mono">配息 {dividendRate}%</div>
                      <div className="h-1 w-full bg-cyan-500/30 rounded-full relative overflow-hidden">
                          <div className="absolute top-0 left-0 h-full w-1/2 bg-cyan-400 animate-[shimmer_1.5s_infinite]"></div>
                      </div>
                      <div className="mt-1">
                          <Droplets size={16} className="text-cyan-400 animate-bounce"/>
                      </div>
                  </div>

                  {/* Small Reservoir */}
                  <div className="flex flex-col items-center z-10 w-1/3">
                      <div className="w-16 h-20 bg-slate-700 rounded-lg border-2 border-amber-400/50 flex flex-col justify-end relative overflow-hidden">
                          {/* 水位上升動畫模擬 - 根據獲利與本金比例顯示 */}
                          <div 
                            className="w-full bg-gradient-to-t from-amber-500 to-yellow-300 transition-all duration-1000" 
                            style={{height: `${Math.min(100, (profit / initialCapital) * 100)}%`}}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                              <Coins size={32} className="text-white/90 drop-shadow-md"/>
                          </div>
                      </div>
                      <p className="mt-2 text-sm font-bold text-amber-400">小水庫</p>
                      <p className="text-xs text-slate-400">複利 {reinvestRate}%</p>
                  </div>
              </div>

              <div className="mt-6 bg-slate-700/50 rounded-xl p-3 border border-slate-600">
                  <div className="flex justify-between items-center text-sm mb-1">
                      <span className="text-slate-300">目前流速 (年配息)</span>
                      <span className="text-cyan-300 font-mono font-bold">${Math.round(initialCapital * dividendRate / 100)}萬/年</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-300">小水庫累積</span>
                      <span className="text-amber-400 font-mono font-bold">${profit}萬</span>
                  </div>
              </div>
          </div>
        </div>

        {/* 右側：圖表與分析 */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 堆疊面積圖 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[450px] print-break-inside relative">
             <div className="flex justify-between items-center mb-4 pl-2 border-l-4 border-cyan-500">
                <h4 className="font-bold text-slate-700">資產堆疊成長模擬</h4>
                <div className="flex gap-3 text-xs">
                    <span className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-400 rounded-full"></div> 小水庫 (獲利成長)</span>
                    <span className="flex items-center gap-1"><div className="w-3 h-3 bg-cyan-600 rounded-full"></div> 大水庫 (本金恆定)</span>
                </div>
             </div>
             
            <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={dataArr} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorBig" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0891b2" stopOpacity={0.8}/><stop offset="95%" stopColor="#0891b2" stopOpacity={0.6}/></linearGradient>
                    <linearGradient id="colorSmall" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#fbbf24" stopOpacity={0.9}/><stop offset="95%" stopColor="#fbbf24" stopOpacity={0.6}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="year" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={(val) => `第${val}年`} />
                  <YAxis unit="萬" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}} 
                    labelFormatter={(val) => `第 ${val} 年`}
                    formatter={(value, name) => [`${value}萬`, name]}
                  />
                  <Legend iconType="circle"/>
                  
                  {/* 標示翻倍點 */}
                  {doubleYear && doubleYear <= years + 5 && (
                      <ReferenceLine x={doubleYear} stroke="#fbbf24" strokeDasharray="3 3" label={{ position: 'top', value: '資產翻倍點', fill: '#d97706', fontSize: 12, fontWeight: 'bold' }} />
                  )}

                  <Area type="monotone" dataKey="小水庫累積" stackId="1" stroke="#f59e0b" fill="url(#colorSmall)" />
                  <Area type="monotone" dataKey="大水庫本金" stackId="1" stroke="#0e7490" fill="url(#colorBig)" />
                </AreaChart>
             </ResponsiveContainer>
          </div>

          {/* 核心效益對比區 */}
          <div className="grid md:grid-cols-2 gap-6">
              
              {/* 左：殺雞取卵 vs 養雞生蛋 */}
              <div className="bg-white rounded-2xl shadow border border-slate-200 p-6 flex flex-col justify-between">
                  <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                      <TrendingUp size={18} className="text-red-500"/> 資產增值對比
                  </h3>
                  
                  <div className="space-y-4">
                      {/* 情境 A */}
                      <div>
                          <div className="flex justify-between text-xs text-slate-500 mb-1">
                              <span>情境 A：花掉配息 (單利)</span>
                              <span>${initialCapital} 萬</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-3">
                              <div className="bg-slate-400 h-3 rounded-full" style={{width: `${(initialCapital / totalAsset) * 100}%`}}></div>
                          </div>
                      </div>

                      {/* 情境 B */}
                      <div>
                          <div className="flex justify-between text-xs text-slate-500 mb-1">
                              <span className="font-bold text-cyan-700">情境 B：大小水庫 (複利)</span>
                              <span className="font-bold text-cyan-700">${totalAsset} 萬</span>
                          </div>
                          <div className="w-full bg-cyan-100 rounded-full h-3 relative overflow-hidden">
                              <div className="absolute top-0 left-0 h-3 bg-cyan-600 rounded-l-full" style={{width: `${(initialCapital / totalAsset) * 100}%`}}></div>
                              <div className="absolute top-0 h-3 bg-amber-400 rounded-r-full" style={{left: `${(initialCapital / totalAsset) * 100}%`, width: `${(profit / totalAsset) * 100}%`}}></div>
                          </div>
                      </div>
                  </div>

                  <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100 text-center">
                      <p className="text-xs text-amber-800 font-bold">小水庫為您多賺了</p>
                      <p className="text-3xl font-black text-amber-500 font-mono mt-1">+${profit} 萬</p>
                  </div>
              </div>

              {/* 右：第 2 桶金進度 */}
              <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl shadow border border-slate-200 p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-5">
                      <Coins size={120} className="text-amber-500"/>
                  </div>
                  <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-green-500"/> 第 2 桶金里程碑
                  </h3>
                  
                  {doubleYear ? (
                      <div className="text-center py-4">
                          <p className="text-sm text-slate-500">按照目前速度，您將在</p>
                          <div className="flex justify-center items-baseline gap-2 my-2">
                              <span className="text-5xl font-black text-cyan-600 font-mono">第 {doubleYear} 年</span>
                          </div>
                          <p className="text-sm text-slate-600 font-bold">
                              免費擁有另一個 {initialCapital} 萬！
                          </p>
                          <p className="text-xs text-slate-400 mt-2">
                              (小水庫金額 ≥ 大水庫本金)
                          </p>
                      </div>
                  ) : (
                      <div className="text-center py-8 text-slate-400">
                          <p>增加年限或提高報酬率</p>
                          <p>以查看翻倍時間</p>
                      </div>
                  )}
              </div>
          </div>

        </div>
      </div>
      
      {/* 底部策略區 */}
      <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-slate-200 print-break-inside">
        
        {/* 1. 運作機制 */}
        <div className="space-y-4 lg:col-span-1">
          <div className="flex items-center gap-2 mb-2">
             <RefreshCw className="text-cyan-600" size={24} />
             <h3 className="text-xl font-bold text-slate-800">運作機制說明</h3>
          </div>
          
          <div className="space-y-3">
             <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-cyan-200 transition-colors">
                <div className="mt-1 min-w-[3rem] h-12 rounded-xl bg-cyan-50 text-cyan-600 flex flex-col items-center justify-center font-bold text-xs">
                   <span className="text-lg">01</span>
                   <span>大水庫</span>
                </div>
                <div>
                   <h4 className="font-bold text-slate-800 flex items-center gap-2">母錢 (本金池)</h4>
                   <p className="text-sm text-slate-600 mt-1">投入穩健、波動小、固定配息的工具。重點在於「保本」與「產生現金流」，而非追求高報酬。</p>
                </div>
             </div>

             <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-amber-200 transition-colors">
                <div className="mt-1 min-w-[3rem] h-12 rounded-xl bg-amber-50 text-amber-600 flex flex-col items-center justify-center font-bold text-xs">
                   <span className="text-lg">02</span>
                   <span>水管</span>
                </div>
                <div>
                   <h4 className="font-bold text-slate-800 flex items-center gap-2">自動轉存 (紀律)</h4>
                   <p className="text-sm text-slate-600 mt-1">建立機制，將大水庫產生的配息，第一時間自動投入小水庫，避免被隨意花掉。</p>
                </div>
             </div>

             <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-blue-200 transition-colors">
                <div className="mt-1 min-w-[3rem] h-12 rounded-xl bg-blue-50 text-blue-600 flex flex-col items-center justify-center font-bold text-xs">
                   <span className="text-lg">03</span>
                   <span>小水庫</span>
                </div>
                <div>
                   <h4 className="font-bold text-slate-800 flex items-center gap-2">子錢 (獲利池)</h4>
                   <p className="text-sm text-slate-600 mt-1">因為是「零成本」的錢，可以投入較高風險、高成長的標的。利用時間複利，讓子錢再生孫錢。</p>
                </div>
             </div>
          </div>
          
          <div className="mt-6 p-4 bg-slate-800 rounded-xl text-center shadow-lg">
             <p className="text-slate-300 italic text-sm">
               「不要吃掉種子，要讓種子長成大樹。大水庫是您的糧倉，小水庫是您的果園。」
             </p>
           </div>
        </div>

        {/* 2. 專案效益 */}
        <div className="space-y-4 lg:col-span-1">
           <div className="flex items-center gap-2 mb-2">
             <Landmark className="text-cyan-600" size={24} />
             <h3 className="text-xl font-bold text-slate-800">專案四大效益</h3>
           </div>
           
           <div className="grid grid-cols-1 gap-3">
              {[
                { title: "本金零風險", desc: "投入小水庫的每一分錢都是賺來的，即使市場大跌，您的大水庫本金依然完好無損，心理壓力極低。" },
                { title: "自動養大", desc: "不需額外投入薪水，光靠資產本身產生的現金流，就能在十幾年後自動變出另一筆鉅款。" },
                { title: "攻守兼備", desc: "大水庫負責防守（提供穩定現金流），小水庫負責進攻（博取超額報酬），是完美的資產配置。" },
                { title: "資產傳承", desc: "您可以選擇花掉小水庫的獲利享受人生，而將完整的大水庫本金傳承給下一代。" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-cyan-50/50 transition-colors">
                  <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-bold text-slate-800">{item.title}</h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};
