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

  // 計算比率與定位
  const workRatio = activeYears / totalYears;
  const freedomRatio = 1 - workRatio;
  const freedomCenterPercent = (workRatio + (freedomRatio / 2)) * 100;

  return (
    // [調整]: print:space-y-2 (極致緊湊), print:text-xs (縮小字體)
    <div className="font-sans text-slate-800 space-y-4 print:space-y-2 relative text-sm print:text-xs">
      
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

      {/* 1. Header (極致微縮) */}
      <div className="relative z-10 flex items-center justify-between border-b-2 border-fuchsia-100 pb-2 print:pb-2 print-break-inside bg-white/50 backdrop-blur-sm">
         <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                 <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-1" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                 <Rocket className="text-fuchsia-600 hidden" size={32} /> 
             </div>
             <div>
                 <span className="text-[10px] font-bold text-fuchsia-600 tracking-widest uppercase block mb-0.5 print:text-[9px]">FIRE Movement Plan</span>
                 <h1 className="text-2xl font-black text-slate-900 mb-0.5 print:text-lg leading-none">超積極存錢法</h1>
                 <p className="text-xs text-slate-500 font-medium print:text-[9px]">用最短的時間，換取最長的人生自由</p>
             </div>
         </div>
         <div className="text-right hidden print:block">
             <p className="text-[9px] text-slate-400">專案代碼</p>
             <p className="text-xs font-mono font-bold text-slate-700">FIRE-{activeYears}Y-{investReturnRate}%</p>
         </div>
      </div>

      {/* 2. 核心分析：人生自由度量表 (修正定位：絕對座標) */}
      <div className="relative z-10 bg-slate-50 rounded-xl p-3 border border-slate-200 print-break-inside print:p-2">
          <div className="flex items-center justify-between mb-2 print:mb-2">
              <h2 className="text-base font-bold text-slate-700 flex items-center gap-2 print:text-sm">
                  <Smile size={18} className="text-fuchsia-500 print:w-3.5 print:h-3.5"/>
                  人生自由度量表
              </h2>
              <span className="text-[9px] bg-fuchsia-100 text-fuchsia-700 px-1.5 py-0.5 rounded-full font-bold">
                  以 40 年職涯為基準
              </span>
          </div>

          {/* Wrapper: 高度固定，無Padding，確保絕對定位準確 */}
          <div className="relative w-full h-10 mt-3 print:h-8 print:mt-2">
              
              {/* 進度條 (背景) */}
              <div className="absolute top-1/2 left-0 w-full h-4 bg-slate-200 rounded-full overflow-hidden flex -translate-y-1/2">
                  <div 
                    className="h-full bg-slate-600 flex items-center justify-center text-[9px] text-white font-bold tracking-wider" 
                    style={{width: `${workRatio * 100}%`}}
                  >
                      WORK
                  </div>
                  <div 
                    className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center text-[9px] text-white font-bold tracking-wider" 
                    style={{width: `${freedomRatio * 100}%`}}
                  >
                      FREEDOM
                  </div>
              </div>

              {/* 分隔線與標籤 (絕對定位) */}
              <div 
                className="absolute top-0 h-full flex flex-col items-center pointer-events-none"
                style={{left: `${workRatio * 100}%`, transform: 'translateX(-50%)'}}
              >
                  {/* 上方標籤 */}
                  <div className="bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded mb-0.5 whitespace-nowrap font-bold shadow-sm -mt-2">
                      {activeYears} 年
                  </div>
                  {/* 垂直線 */}
                  <div className="w-0.5 flex-1 bg-white outline outline-1 outline-slate-800/30 z-20"></div>
              </div>

              {/* 下方文字 (絕對定位) */}
              <div 
                className="absolute -bottom-1 transform -translate-x-1/2 whitespace-nowrap"
                style={{left: `${freedomCenterPercent}%`}}
              >
                  <p className="text-fuchsia-600 font-bold text-[10px] flex items-center justify-center gap-1 print:text-[9px]">
                      <Star size={10} fill="currentColor"/> 
                      恭喜！贖回 {totalYears - activeYears} 年人生
                  </p>
              </div>
          </div>
      </div>

      {/* 3. 終局月薪與貢獻分析 (緊湊版) */}
      <div className="grid grid-cols-2 gap-3 print:gap-2 print-break-inside">
          
          {/* 左：終局月薪支票 */}
          <div className="bg-white rounded-xl border border-violet-200 p-0 shadow-sm relative overflow-hidden print:border-slate-300">
              <div className="bg-violet-50/50 p-2 border-b border-violet-100 flex justify-between items-center print:bg-slate-50 print:border-slate-200">
                  <span className="text-[9px] font-bold text-violet-400 tracking-widest print:text-slate-400">PASSIVE INCOME CHECK</span>
                  <span className="text-[9px] font-mono text-slate-400">NO. 000{activeYears}888</span>
              </div>
              <div className="p-3 space-y-1 relative print:p-2">
                  <div className="absolute top-1/2 right-2 transform -translate-y-1/2 opacity-5 print:hidden">
                      <Coins size={60} className="text-violet-600"/>
                  </div>
                  <div className="flex justify-between items-end border-b border-slate-100 pb-1">
                      <span className="text-[9px] text-slate-400">Pay to</span>
                      <span className="font-bold text-slate-700 text-xs italic">未來的您</span>
                  </div>
                  <div className="flex justify-between items-end">
                      <div className="text-xl font-black text-violet-600 font-mono print:text-slate-800 print:text-lg">
                          ${monthlyPassiveIncome.toLocaleString()}
                      </div>
                      <span className="text-[9px] text-slate-400 mb-0.5">/ 月</span>
                  </div>
                  <div className="text-[9px] text-slate-400 pt-1 flex items-center gap-1">
                      <CheckCircle2 size={10} className="text-violet-500"/>
                      <span>永久發放，不需工作</span>
                  </div>
              </div>
          </div>

          {/* 右：勞力 vs 複利 */}
          <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-sm relative flex items-center justify-between print:p-2">
              <div className="w-[55%] z-10 pl-1">
                  <h4 className="font-bold text-slate-700 mb-1 text-[10px]">財富組成</h4>
                  <div className="space-y-1">
                      <div className="flex items-start gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1"></div>
                          <div>
                              <p className="text-[9px] text-slate-500 leading-none">本金(勞力)</p>
                              <p className="text-[10px] font-bold text-slate-700 leading-tight">${Math.round(totalPrincipalActive/10000).toLocaleString()} 萬</p>
                          </div>
                      </div>
                      <div className="flex items-start gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 mt-1"></div>
                          <div>
                              <p className="text-[9px] text-slate-500 leading-none">複利(獲利)</p>
                              <p className="text-[10px] font-black text-fuchsia-600 leading-tight">${Math.round(totalInterest/10000).toLocaleString()} 萬</p>
                          </div>
                      </div>
                  </div>
              </div>
              
              <div className="w-[45%] h-[80px] relative print:h-[70px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                          <Pie 
                              data={contributionData} 
                              cx="50%" cy="50%" 
                              innerRadius={15} outerRadius={30} 
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

      {/* 4. 執行藍圖 (Rocket Launch) - 緊湊版 */}
      <div className="relative z-10 print-break-inside">
          <h2 className="text-base font-bold text-slate-700 mb-2 flex items-center gap-2 print:text-sm print:mb-1">
              <Rocket size={18} className="text-violet-600 print:w-3.5 print:h-3.5"/>
              執行藍圖 (火箭升空計畫)
          </h2>
          <div className="grid grid-cols-3 gap-2 print:gap-2">
              {[
                  { name: '第一階段：點火', desc: '累積本金，抵抗地心引力。', sub: `前 ${activeYears} 年`, color: 'bg-slate-50 text-slate-700 border-slate-200' },
                  { name: '第二階段：加速', desc: '複利引擎啟動，速度加快。', sub: '資產翻倍期', color: 'bg-violet-50 text-violet-700 border-violet-200' },
                  { name: '第三階段：巡航', desc: '關閉引擎，靠慣性飛行。', sub: `後 ${totalYears - activeYears} 年`, color: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200' },
              ].map((p, i) => (
                  <div key={i} className={`rounded-xl border p-2 text-center ${p.color} print:p-1.5 flex flex-col justify-between h-full`}>
                      <div>
                          <p className="text-[9px] opacity-60 mb-0.5 font-bold uppercase">{p.sub}</p>
                          <h4 className="font-bold text-xs mb-0.5 print:text-[10px]">{p.name}</h4>
                          <p className="text-[10px] opacity-90 leading-tight print:leading-none">{p.desc}</p>
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* 5. 資產趨勢圖 (Active vs Passive) - 高度縮減至 200px */}
      <div className="relative z-10 space-y-2 print-break-inside">
          <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-slate-700 flex items-center gap-2 print:text-sm">
                  <TrendingUp size={18} className="text-violet-600 print:w-3.5 print:h-3.5"/>
                  資產成長模擬
              </h2>
              <div className="text-[9px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                  {activeYears}年積極 / {totalYears}年總期程
              </div>
          </div>
          
          {/* [調整]: 高度 200px */}
          <div className="h-[220px] w-full border border-slate-100 rounded-xl p-2 bg-white shadow-sm print:h-[200px] print:p-1">
              <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={fullChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="year" tick={{fontSize: 9}} tickLine={false} axisLine={false} interval={4}/>
                      <YAxis unit="萬" tick={{fontSize: 9}} width={30} tickLine={false} axisLine={false}/>
                      <Legend wrapperStyle={{ fontSize: '9px', paddingTop: '2px' }} iconSize={8}/>
                      
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

      {/* 6. 專案亮點 (List) - 緊湊 */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 print:p-2 print-break-inside">
          <h3 className="font-bold text-slate-700 text-xs mb-1.5 flex items-center gap-2 print:text-sm">
              <Zap size={14} className="text-yellow-500"/> 專案執行亮點
          </h3>
          <ul className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-600 leading-tight">
              <li className="flex items-start gap-1"><CheckCircle2 size={10} className="text-fuchsia-500 mt-0.5 shrink-0"/> <span>本金極省：少付了 ${(Math.round(savedPrincipal/10000)).toLocaleString()} 萬本金。</span></li>
              <li className="flex items-start gap-1"><CheckCircle2 size={10} className="text-fuchsia-500 mt-0.5 shrink-0"/> <span>縮短工時：只需努力 {activeYears} 年，提早贖回自由。</span></li>
              <li className="flex items-start gap-1"><CheckCircle2 size={10} className="text-fuchsia-500 mt-0.5 shrink-0"/> <span>抗通膨：透過長期投資複利，避免存款越存越薄。</span></li>
              <li className="flex items-start gap-1"><CheckCircle2 size={10} className="text-fuchsia-500 mt-0.5 shrink-0"/> <span>選擇權：工作是為了興趣而非生存。</span></li>
          </ul>
      </div>

      {/* 7. 顧問總結 (Footer) */}
      <div className="relative z-10 bg-slate-50 p-3 rounded-xl border-l-4 border-violet-500 print-break-inside print:p-2 print:mt-2">
          <div className="flex gap-2">
               <Quote className="text-violet-300 shrink-0" size={20} />
               <div>
                   <h3 className="font-bold text-slate-800 text-xs mb-0.5">顧問觀點</h3>
                   <p className="text-slate-600 text-[10px] leading-relaxed">
                       「複利是世界第八大奇蹟。了解它的人賺取它，不了解它的人支付它。超積極存錢法不是要您當苦行僧，而是要您『先苦後甘』，讓時間成為您最忠實的員工。」
                   </p>
               </div>
          </div>
      </div>

    </div>
  );
};

export default SuperActiveReport;