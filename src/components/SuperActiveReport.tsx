import React from 'react';
import { 
  Rocket, TrendingUp, Clock, Target, ArrowRight, Quote, 
  PiggyBank, Zap, Scale, Wallet, CheckCircle2, Smile, Coins, Star
} from 'lucide-react';
import { 
  ComposedChart, Area, Line, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer, ReferenceArea, PieChart, Pie, Cell
} from 'recharts';

// ------------------------------------------------------------------
// 主元件: SuperActiveReport
// ------------------------------------------------------------------
const SuperActiveReport = ({ data }: { data: any }) => {
  // 1. 資料解構
  const monthlySaving = Number(data?.monthlySaving) || 10000;
  const investReturnRate = Number(data?.investReturnRate) || 6;
  const activeYears = Number(data?.activeYears) || 15;
  const totalYears = 40; // 基準：25-65歲

  // 2. 核心模擬運算
  const fullChartData = [];
  let pAcc = 0; // 消極累積 (勞力)
  let aInv = 0; // 積極累積 (複利)
  
  for (let year = 1; year <= totalYears; year++) {
      // 消極：每年存滿
      pAcc += monthlySaving * 12;
      
      // 積極：只存 activeYears
      if (year <= activeYears) {
          aInv = (aInv + monthlySaving * 12) * (1 + investReturnRate / 100);
      } else {
          aInv = aInv * (1 + investReturnRate / 100);
      }
      
      if (year % 5 === 0 || year === 1 || year === activeYears || year === totalYears) {
        fullChartData.push({
            year: year,
            消極存錢: Math.round(pAcc / 10000),
            積極存錢: Math.round(aInv / 10000),
            phase: year <= activeYears ? '奮鬥期' : '複利期'
        });
      }
  }

  // 3. 關鍵指標
  const totalPrincipalPassive = monthlySaving * 12 * totalYears;
  const totalPrincipalActive = monthlySaving * 12 * activeYears;
  const savedPrincipal = totalPrincipalPassive - totalPrincipalActive;
  const finalActiveAsset = Math.round(aInv);
  const finalPassiveAsset = Math.round(pAcc);
  
  // 被動收入 (4%法則 / 5%提領)
  const safeWithdrawalRate = 0.05; 
  const monthlyPassiveIncome = Math.round((finalActiveAsset * safeWithdrawalRate) / 12);

  // 勞力 vs 複利 數據
  const totalInterest = finalActiveAsset - totalPrincipalActive;
  const contributionData = [
      { name: '您的本金 (勞力)', value: totalPrincipalActive, color: '#a78bfa' }, // violet-400
      { name: '市場複利 (獲利)', value: totalInterest, color: '#e879f9' } // fuchsia-400
  ];

  return (
    <div className="font-sans text-slate-800 space-y-5 print:space-y-4 relative text-sm print:text-xs">
      
      {/* 浮水印 */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[50] overflow-hidden mix-blend-multiply print:fixed print:top-1/2 print:left-1/2 print:-translate-x-1/2 print:-translate-y-1/2">
          <div className="opacity-[0.08] transform -rotate-12">
              <img 
                src="/logo.png" 
                alt="Watermark" 
                className="w-[500px] h-auto grayscale object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
          </div>
      </div>

      {/* 1. Header */}
      <div className="relative z-10 flex items-center justify-between border-b-2 border-fuchsia-100 pb-4 print:pb-2 print-break-inside bg-white/50 backdrop-blur-sm">
         <div className="flex items-center gap-3">
             <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                 <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-1" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                 <Rocket className="text-fuchsia-600 hidden" size={32} /> 
             </div>
             <div>
                 <span className="text-[10px] font-bold text-fuchsia-600 tracking-widest uppercase block mb-0.5">FIRE Movement Plan</span>
                 <h1 className="text-3xl font-black text-slate-900 mb-0.5 print:text-2xl leading-none">超積極存錢法</h1>
                 <p className="text-xs text-slate-500 font-medium print:text-[10px]">用最短的時間，換取最長的人生自由</p>
             </div>
         </div>
         <div className="text-right hidden print:block">
             <p className="text-[10px] text-slate-400">專案代碼</p>
             <p className="text-sm font-mono font-bold text-slate-700">FIRE-{activeYears}Y-{investReturnRate}%</p>
         </div>
      </div>

      {/* 2. 核心分析：人生自由度量表 (New Section A) */}
      <div className="relative z-10 bg-slate-50 rounded-2xl p-5 border border-slate-200 print-break-inside print:p-4">
          <div className="flex items-center justify-between mb-4 print:mb-3">
              <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2 print:text-base">
                  <Smile size={20} className="text-fuchsia-500 print:w-4 print:h-4"/>
                  人生自由度量表
              </h2>
              <span className="text-[10px] bg-fuchsia-100 text-fuchsia-700 px-2 py-0.5 rounded-full font-bold">
                  以 40 年職涯為基準
              </span>
          </div>

          <div className="relative pt-6 pb-2 px-2">
              {/* 進度條背景 */}
              <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden flex relative">
                  {/* 工作期 */}
                  <div 
                    className="h-full bg-slate-600 flex items-center justify-center text-[9px] text-white font-bold tracking-wider relative z-10" 
                    style={{width: `${(activeYears / totalYears) * 100}%`}}
                  >
                      WORK
                  </div>
                  {/* 自由期 */}
                  <div 
                    className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center text-[9px] text-white font-bold tracking-wider relative z-10" 
                    style={{width: `${((totalYears - activeYears) / totalYears) * 100}%`}}
                  >
                      FREEDOM
                  </div>
              </div>

              {/* 標籤指針 - 工作期結束 */}
              <div 
                className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center"
                style={{left: `${(activeYears / totalYears) * 100}%`}}
              >
                  <div className="bg-slate-700 text-white text-[10px] px-1.5 py-0.5 rounded mb-1 whitespace-nowrap font-bold shadow-sm">
                      {activeYears} 年
                  </div>
                  <div className="w-0.5 h-7 bg-slate-700/50"></div>
              </div>

              {/* 標籤指針 - 自由期長度 */}
              <div 
                className="absolute top-8 left-1/2 transform -translate-x-1/2 w-full text-center"
                style={{paddingLeft: `${(activeYears / totalYears) * 50}%`}}
              >
                  <p className="text-fuchsia-600 font-bold text-sm flex items-center justify-center gap-1">
                      <Star size={14} fill="currentColor"/> 
                      恭喜！您成功贖回了 {totalYears - activeYears} 年的人生使用權
                  </p>
              </div>
          </div>
      </div>

      {/* 3. 終局月薪與貢獻分析 (New Section B & C) */}
      <div className="grid grid-cols-2 gap-4 print:gap-4 print-break-inside">
          
          {/* 左：終局月薪支票 */}
          <div className="bg-white rounded-xl border border-violet-200 p-0 shadow-sm relative overflow-hidden print:border-slate-300">
              {/* 支票頭 */}
              <div className="bg-violet-50/50 p-3 border-b border-violet-100 flex justify-between items-center print:bg-slate-50 print:border-slate-200">
                  <span className="text-[10px] font-bold text-violet-400 tracking-widest print:text-slate-400">PASSIVE INCOME CHECK</span>
                  <span className="text-[10px] font-mono text-slate-400">NO. 000{activeYears}888</span>
              </div>
              {/* 支票內容 */}
              <div className="p-4 space-y-3 relative">
                  <div className="absolute top-1/2 right-4 transform -translate-y-1/2 opacity-5 print:hidden">
                      <Coins size={100} className="text-violet-600"/>
                  </div>
                  <div className="flex justify-between items-end border-b border-slate-100 pb-1">
                      <span className="text-[10px] text-slate-400">Pay to the order of</span>
                      <span className="font-bold text-slate-700 text-sm italic">未來的您 (Future You)</span>
                  </div>
                  <div className="flex justify-between items-end">
                      <div className="text-3xl font-black text-violet-600 font-mono print:text-slate-800">
                          ${monthlyPassiveIncome.toLocaleString()}
                      </div>
                      <span className="text-xs text-slate-400 mb-1">/ 月 (Monthly)</span>
                  </div>
                  <div className="text-[10px] text-slate-400 pt-2 flex items-center gap-1">
                      <CheckCircle2 size={10} className="text-violet-500"/>
                      <span>永久發放，不需工作 (Forever)</span>
                  </div>
              </div>
          </div>

          {/* 右：勞力 vs 複利 (Pie Chart) */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm relative flex items-center justify-between print:p-3">
              <div className="w-[55%] z-10">
                  <h4 className="font-bold text-slate-700 mb-2 text-sm print:text-xs">財富組成分析</h4>
                  <div className="space-y-2">
                      <div className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-violet-400 mt-1"></div>
                          <div>
                              <p className="text-[10px] text-slate-500">您的本金 (勞力)</p>
                              <p className="text-xs font-bold text-slate-700">${Math.round(totalPrincipalActive/10000).toLocaleString()} 萬</p>
                          </div>
                      </div>
                      <div className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-fuchsia-400 mt-1"></div>
                          <div>
                              <p className="text-[10px] text-slate-500">市場複利 (獲利)</p>
                              <p className="text-sm font-black text-fuchsia-600">${Math.round(totalInterest/10000).toLocaleString()} 萬</p>
                          </div>
                      </div>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-2">
                      資產放大 <span className="font-bold text-fuchsia-500">{(finalActiveAsset / totalPrincipalActive).toFixed(1)} 倍</span>
                  </p>
              </div>
              
              <div className="w-[45%] h-[120px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                          <Pie 
                              data={contributionData} 
                              cx="50%" cy="50%" 
                              innerRadius={25} outerRadius={40} 
                              paddingAngle={5} 
                              dataKey="value"
                              stroke="none"
                          >
                              {contributionData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                          </Pie>
                      </PieChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </div>

      {/* 4. 執行藍圖 (Rocket Launch) */}
      <div className="relative z-10 print-break-inside">
          <h2 className="text-lg font-bold text-slate-700 mb-3 flex items-center gap-2 print:text-base print:mb-2">
              <Rocket size={20} className="text-violet-600 print:w-4 print:h-4"/>
              執行藍圖 (火箭升空計畫)
          </h2>
          <div className="grid grid-cols-3 gap-3 print:gap-3">
              {[
                  { name: '第一階段：點火', desc: '累積本金，抵抗地心引力。', sub: `前 ${activeYears} 年`, color: 'bg-slate-50 text-slate-700 border-slate-200' },
                  { name: '第二階段：加速', desc: '複利引擎啟動，速度加快。', sub: '資產翻倍期', color: 'bg-violet-50 text-violet-700 border-violet-200' },
                  { name: '第三階段：巡航', desc: '關閉引擎，靠慣性飛行。', sub: `後 ${totalYears - activeYears} 年`, color: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200' },
              ].map((p, i) => (
                  <div key={i} className={`rounded-xl border p-3 text-center ${p.color} print:p-2.5 flex flex-col justify-between h-full`}>
                      <div>
                          <p className="text-[10px] opacity-60 mb-1 font-bold uppercase">{p.sub}</p>
                          <h4 className="font-bold text-sm mb-1.5 print:text-xs">{p.name}</h4>
                          <p className="text-xs opacity-90 leading-relaxed print:text-[10px]">{p.desc}</p>
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* 5. 資產趨勢圖 (Active vs Passive) */}
      <div className="relative z-10 space-y-3 print-break-inside">
          <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2 print:text-base">
                  <TrendingUp size={20} className="text-violet-600 print:w-4 print:h-4"/>
                  資產成長模擬
              </h2>
              <div className="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded">
                  {activeYears}年積極 / {totalYears}年總期程
              </div>
          </div>
          
          <div className="h-[250px] w-full border border-slate-100 rounded-xl p-4 bg-white shadow-sm print:h-[220px] print:p-3">
              <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={fullChartData} margin={{ top: 15, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="year" tick={{fontSize: 10}} tickLine={false} axisLine={false} interval={4}/>
                      <YAxis unit="萬" tick={{fontSize: 10}} width={35} tickLine={false} axisLine={false}/>
                      <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} iconSize={10}/>
                      
                      <ReferenceArea x1={0} x2={activeYears} fill="#8b5cf6" fillOpacity={0.05} />
                      <Area 
                        type="monotone" 
                        name="積極存錢 (複利)" 
                        dataKey="積極存錢" 
                        stroke="#8b5cf6" 
                        fill="#f3e8ff" 
                        strokeWidth={2.5} 
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
          </div>
      </div>

      {/* 6. 專案亮點 (List) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 print:p-3 print-break-inside">
          <h3 className="font-bold text-slate-700 text-sm mb-3 flex items-center gap-2">
              <Zap size={16} className="text-yellow-500"/> 專案執行亮點
          </h3>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-600 print:text-[11px]">
              <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-fuchsia-500 mt-0.5 shrink-0"/> <span>本金極省：相比傳統存法，少付了 ${(Math.round(savedPrincipal/10000)).toLocaleString()} 萬本金。</span></li>
              <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-fuchsia-500 mt-0.5 shrink-0"/> <span>縮短工時：只需努力 {activeYears} 年，提早贖回人生自由。</span></li>
              <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-fuchsia-500 mt-0.5 shrink-0"/> <span>抗通膨：透過長期投資複利，避免存款越存越薄。</span></li>
              <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-fuchsia-500 mt-0.5 shrink-0"/> <span>選擇權：工作是為了興趣而非生存，擁有隨時說「不」的權利。</span></li>
          </ul>
      </div>

      {/* 7. 顧問總結 (Footer) */}
      <div className="relative z-10 bg-slate-50 p-4 rounded-xl border-l-4 border-violet-500 print-break-inside print:p-3 print:mt-4">
          <div className="flex gap-3">
               <Quote className="text-violet-300 shrink-0" size={24} />
               <div>
                   <h3 className="font-bold text-slate-800 text-sm mb-1">顧問觀點</h3>
                   <p className="text-slate-600 text-xs leading-relaxed">
                       「複利是世界第八大奇蹟。了解它的人賺取它，不了解它的人支付它。超積極存錢法不是要您當苦行僧，而是要您『先苦後甘』，讓時間成為您最忠實的員工。」
                   </p>
               </div>
          </div>
      </div>

    </div>
  );
};

export default SuperActiveReport;