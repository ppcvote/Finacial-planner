import React, { useState } from 'react';
import { 
  Car, 
  Calculator, 
  RefreshCw, 
  TrendingUp, 
  DollarSign, 
  ArrowRight,
  Settings,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  Gauge,
  Wallet,
  CheckCircle2,
  Landmark
} from 'lucide-react';
import { ResponsiveContainer, ComposedChart, Bar, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Area } from 'recharts';

// --- 內建計算函式 ---
const calculateMonthlyPayment = (principal: number, rate: number, years: number) => {
  const p = Number(principal) || 0;
  const rVal = Number(rate) || 0;
  const y = Number(years) || 0;
  const r = rVal / 100 / 12;
  const n = y * 12;
  if (rVal === 0) return (p * 10000) / (n || 1);
  const result = (p * 10000 * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return isNaN(result) ? 0 : result;
};

const calculateMonthlyIncome = (principal: number, rate: number) => {
  const p = Number(principal) || 0;
  const r = Number(rate) || 0;
  return (p * 10000 * (r / 100)) / 12;
};

const calculateRemainingBalance = (principal: number, rate: number, totalYears: number, yearsElapsed: number) => {
  const pVal = Number(principal) || 0;
  const rVal = Number(rate) || 0;
  const totalY = Number(totalYears) || 0;
  const elapsed = Number(yearsElapsed) || 0;
  const r = rVal / 100 / 12;
  const n = totalY * 12;
  const p = elapsed * 12;
  if (rVal === 0) return Math.max(0, pVal * 10000 * (1 - p/(n || 1)));
  // 等額本息剩餘本金公式
  const balance = (pVal * 10000) * (Math.pow(1 + r, n) - Math.pow(1 + r, p)) / (Math.pow(1 + r, n) - 1);
  return Math.max(0, isNaN(balance) ? 0 : balance);
};

export const CarReplacementTool = ({ data, setData }: any) => {
  const safeData = {
    carPrice: Number(data?.carPrice) || 100, // 萬 (第一台)
    investReturnRate: Number(data?.investReturnRate) || 6, // %
    loanRate: Number(data?.loanRate) || 3.5, // %
    loanTerm: Number(data?.loanTerm) || 7, // 年
    residualRate: Number(data?.residualRate) || 50, // % (換車時殘值)
    cycleYears: Number(data?.cycleYears) || 5, // 換車週期 (年)
    // 第2、3台車的目標價格 (若為 0 則自動計算)
    carPrice2: Number(data?.carPrice2) || 0, 
    carPrice3: Number(data?.carPrice3) || 0,
  };
  const { carPrice, investReturnRate, loanRate, loanTerm, residualRate, cycleYears, carPrice2, carPrice3 } = safeData;

  const [showAdvanced, setShowAdvanced] = useState(false);

  // --- 核心計算邏輯 (三階段演進) ---
  const cycles = [];
  
  // 總計畫年限
  const totalProjectYears = cycleYears * 3;
  
  // 初始資本 = 第一台車原本要花的錢
  let currentPrincipal = carPrice; 
  
  for(let i = 1; i <= 3; i++) {
      // 1. 決定該輪的「目標車價」與「投入本金」
      let targetCarPrice = 0;
      if (i === 1) targetCarPrice = carPrice;
      else if (i === 2) targetCarPrice = carPrice2 > 0 ? carPrice2 : currentPrincipal;
      else if (i === 3) targetCarPrice = carPrice3 > 0 ? carPrice3 : currentPrincipal;

      // 投資金額 = 目前手上的本金
      const investedAmount = currentPrincipal;
      
      // 2. 計算月流
      const monthlyPayment = calculateMonthlyPayment(targetCarPrice, loanRate, loanTerm);
      const monthlyIncome = calculateMonthlyIncome(investedAmount, investReturnRate);
      const netMonthlyPayment = monthlyPayment - monthlyIncome;
      
      // 3. 期末結算 (根據 cycleYears)
      // 殘值回流
      const residualValueWan = targetCarPrice * (residualRate / 100); 
      
      // 剩餘貸款 (若 cycleYears < loanTerm，則需清償)
      const remainingLoanYuan = calculateRemainingBalance(targetCarPrice, loanRate, loanTerm, cycleYears);
      
      // 賣車淨拿現金 (元) = 殘值 - 剩餘貸款
      const netCashFromCarYuan = (residualValueWan * 10000) - remainingLoanYuan; 
      
      // 下一輪本金 (萬)
      const nextPrincipalRaw = (investedAmount * 10000) + netCashFromCarYuan;
      const nextPrincipalWan = Math.round(nextPrincipalRaw / 10000);

      cycles.push({
          cycle: i,
          carBudget: Math.round(targetCarPrice),
          investedCapital: Math.round(investedAmount),
          monthlyPay: Math.round(monthlyPayment),
          monthlyIncome: Math.round(monthlyIncome),
          netPay: Math.round(netMonthlyPayment),
          residualValue: Math.round(residualValueWan * 10000),
          remainingLoan: Math.round(remainingLoanYuan),
          netCashBack: Math.round(netCashFromCarYuan / 10000),
          totalAssetEnd: nextPrincipalWan
      });

      // 更新下一輪本金
      currentPrincipal = nextPrincipalWan;
  }

  // --- 圖表數據 ---
  // 傳統買車：假設最後一台車也折舊了
  const lastCarResidual = cycles[2].carBudget * (residualRate/100) * 0.5; 
  
  const comparisonData = [
      {
          name: '傳統買車',
          value: Math.round(lastCarResidual), 
          desc: '僅剩殘值'
      },
      {
          name: '專案換車',
          value: cycles[2].totalAssetEnd, 
          desc: '本金全保留'
      }
  ];

  // --- 更新欄位 ---
  const updateField = (field: string, value: number) => { 
      let newValue = Number(value);
      if (field.includes('Price')) {
          newValue = Math.min(500, newValue);
      }
      setData({ ...safeData, [field]: newValue }); 
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans text-slate-800">
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden print-break-inside">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Car size={180} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-sm">
              Smart Mobility
            </span>
            <span className="bg-yellow-400/20 text-yellow-100 px-3 py-1 rounded-full text-xs font-bold tracking-wider backdrop-blur-sm border border-yellow-400/30">
              資金回流・資產升級
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight flex items-center gap-3">
            {cycleYears}年換車專案
          </h1>
          <p className="text-orange-100 text-lg opacity-90 max-w-2xl">
            打破「買車即負債」的魔咒。每 {cycleYears} 年輕鬆換新車，利用時間與複利，讓資產不減反增。
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* 左側：參數設定 */}
        <div className="lg:col-span-4 space-y-6 print-break-inside">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
              <Calculator size={20} className="text-orange-600"/> 
              購車參數
            </h4>
            <div className="space-y-6">
               {/* 初始車價 */}
               <div>
                   <div className="flex justify-between items-center mb-2">
                       <label className="text-sm font-medium text-slate-600">第一台車價 (萬)</label>
                       <div className="flex items-center">
                           <input 
                               type="number" min={50} max={500} step={10} 
                               value={carPrice} 
                               onChange={(e) => updateField('carPrice', Number(e.target.value))} 
                               className="w-16 text-right bg-transparent border-none p-0 font-mono font-bold text-orange-600 text-lg focus:ring-0"
                           />
                           <span className="font-mono font-bold text-orange-600 text-lg ml-1">萬</span>
                       </div>
                   </div>
                   <input type="range" min={50} max={500} step={10} value={carPrice} onChange={(e) => updateField('carPrice', Number(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg accent-orange-600" />
               </div>

               {/* 投資報酬率 */}
               <div>
                 <div className="flex justify-between mb-1">
                     <label className="text-sm font-medium text-slate-600">投資年化報酬 (%)</label>
                     <span className="font-mono font-bold text-green-600 text-lg">{investReturnRate.toFixed(1)}%</span>
                 </div>
                 <input type="range" min={3} max={12} step={0.1} value={investReturnRate} onChange={(e) => updateField('investReturnRate', Number(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg accent-green-600" />
               </div>

               {/* 進階設定 Toggle */}
               <button 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                    showAdvanced 
                      ? 'bg-orange-50 border-orange-200 text-orange-800' 
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
               >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Settings size={16} />
                    進階設定 (週期、貸款、殘值)
                  </div>
                  {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
               </button>

               {/* 進階設定 Panel */}
               {showAdvanced && (
                 <div className="space-y-4 animate-in slide-in-from-top-2 duration-300 pt-2 border-t border-orange-100">
                    
                    {/* 新增：換車週期 */}
                    <div className="bg-orange-100/50 p-3 rounded-xl border border-orange-200">
                        <div className="flex justify-between text-xs text-orange-800 mb-1">
                            <span className="font-bold flex items-center gap-1"><RefreshCw size={12}/> 換車週期 (年)</span>
                            <span className="font-bold text-lg">{cycleYears} 年</span>
                        </div>
                        <input type="range" min={2} max={10} step={1} value={cycleYears} onChange={(e) => updateField('cycleYears', Number(e.target.value))} className="w-full h-2 bg-orange-200 rounded-lg accent-orange-600" />
                        <div className="flex justify-between text-[10px] text-orange-600/70 mt-1">
                            <span>頻繁換車</span>
                            <span>長期持有</span>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>車貸利率 (%)</span>
                            <span className="font-bold text-slate-700">{loanRate}%</span>
                        </div>
                        <input type="range" min={2} max={8} step={0.1} value={loanRate} onChange={(e) => updateField('loanRate', Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg accent-slate-600" />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>車貸年限 (年)</span>
                            <span className="font-bold text-slate-700">{loanTerm} 年</span>
                        </div>
                        <input type="range" min={3} max={7} step={1} value={loanTerm} onChange={(e) => updateField('loanTerm', Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg accent-slate-600" />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>換車時殘值率 (%)</span>
                            <span className="font-bold text-slate-700">{residualRate}%</span>
                        </div>
                        <input type="range" min={10} max={80} step={5} value={residualRate} onChange={(e) => updateField('residualRate', Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg accent-slate-600" />
                    </div>

                    <div className="pt-2 border-t border-orange-200">
                        <p className="text-xs font-bold text-orange-800 mb-2">後續換車目標 (0為自動計算)</p>
                        
                        <div className="mb-2">
                            <div className="flex justify-between text-xs text-slate-500 mb-1">
                                <span>第 2 台車預算 (萬)</span>
                                <span className="font-bold text-slate-700">{carPrice2 === 0 ? '自動 (依資產)' : carPrice2}</span>
                            </div>
                            <input type="range" min={0} max={500} step={10} value={carPrice2} onChange={(e) => updateField('carPrice2', Number(e.target.value))} className="w-full h-1.5 bg-orange-200 rounded-lg accent-orange-500" />
                        </div>

                        <div>
                            <div className="flex justify-between text-xs text-slate-500 mb-1">
                                <span>第 3 台車預算 (萬)</span>
                                <span className="font-bold text-slate-700">{carPrice3 === 0 ? '自動 (依資產)' : carPrice3}</span>
                            </div>
                            <input type="range" min={0} max={500} step={10} value={carPrice3} onChange={(e) => updateField('carPrice3', Number(e.target.value))} className="w-full h-1.5 bg-orange-200 rounded-lg accent-orange-500" />
                        </div>
                    </div>
                 </div>
               )}
            </div>
          </div>

          {/* 儀表板：單一循環結構 */}
          <div className="bg-slate-800 rounded-2xl p-6 shadow-lg text-white relative overflow-hidden">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
                  <Gauge size={20} className="text-yellow-400"/>
                  <span className="font-bold">月現金流引擎 (第一台)</span>
              </div>
              <div className="flex justify-between items-end mb-2">
                  <div className="text-left">
                      <div className="text-xs text-slate-400 mb-1">投資配息</div>
                      <div className="text-xl font-bold text-green-400">+${cycles[0].monthlyIncome.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                      <div className="text-xs text-slate-400 mb-1">車貸月付</div>
                      <div className="text-xl font-bold text-red-400">-${cycles[0].monthlyPay.toLocaleString()}</div>
                  </div>
              </div>
              
              {/* Progress Bar Style Net Pay */}
              <div className="relative h-4 bg-slate-700 rounded-full mt-2 mb-4 overflow-hidden">
                  <div className="absolute top-0 left-0 h-full bg-green-500/30 w-full"></div>
                  <div className="absolute top-0 right-0 h-full bg-red-500/30" style={{width: `${Math.min(100, (cycles[0].monthlyPay / (cycles[0].monthlyPay + cycles[0].monthlyIncome)) * 100)}%`}}></div>
              </div>

              <div className="bg-slate-700/50 rounded-xl p-3 flex justify-between items-center border border-slate-600">
                  <span className="text-sm font-bold text-slate-300">實質月付金</span>
                  <span className={`text-2xl font-black font-mono ${cycles[0].netPay > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                      {cycles[0].netPay > 0 ? '-' : '+'}${Math.abs(cycles[0].netPay).toLocaleString()}
                  </span>
              </div>
              {cycles[0].netPay <= 0 && (
                  <div className="mt-2 text-center text-xs text-green-400 font-bold bg-green-900/30 py-1 rounded">
                      🎉 恭喜！您已實現免費開車
                  </div>
              )}
          </div>
        </div>

        {/* 右側：演進圖與對比 */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 三階段演進卡片 - 版面修正 (文字不被吃掉) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 print-break-inside">
             <div className="flex justify-between items-center mb-6 pl-2 border-l-4 border-orange-500">
                <h4 className="font-bold text-slate-700">三階段換車演進圖 ({totalProjectYears}年計畫)</h4>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">資金自動滾雪球</span>
             </div>
             
             {/* 容器改用 flex 確保寬度平均，並增加 gap */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                 {/* 連接箭頭 (Desktop Only) */}
                 <div className="hidden md:block absolute top-1/2 left-1/3 -translate-y-1/2 -translate-x-1/2 z-10 text-slate-300 bg-white rounded-full p-1">
                     <ArrowRight size={24} strokeWidth={3} />
                 </div>
                 <div className="hidden md:block absolute top-1/2 left-2/3 -translate-y-1/2 -translate-x-1/2 z-10 text-slate-300 bg-white rounded-full p-1">
                     <ArrowRight size={24} strokeWidth={3} />
                 </div>

                 {cycles.map((cycle, idx) => (
                     <div key={idx} className={`relative flex flex-col p-4 rounded-xl border-2 transition-all h-full ${idx === 2 ? 'border-orange-400 bg-orange-50' : 'border-slate-100 bg-slate-50'}`}>
                         
                         <div className="flex justify-center mb-2">
                            <span className="bg-white px-3 py-1 text-xs font-bold text-slate-500 border border-slate-200 rounded-full shadow-sm">
                                第 {cycle.cycle} 台車
                            </span>
                         </div>
                         
                         <div className="text-center mb-3">
                             <p className="text-xs text-slate-500 mb-1">購車預算</p>
                             <p className={`text-2xl font-black font-mono ${idx===2 ? 'text-orange-600' : 'text-slate-700'}`}>
                                 {cycle.carBudget} 萬
                             </p>
                             <p className="text-[10px] text-slate-400">(本金 {cycle.investedCapital} 萬)</p>
                         </div>
                         
                         <div className="space-y-2 text-sm border-t border-slate-200/60 pt-3 mt-auto w-full">
                             <div className="flex justify-between items-center w-full">
                                 <span className="text-slate-500 text-xs">實質月付</span>
                                 <span className={`font-bold font-mono ${cycle.netPay > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                     ${cycle.netPay.toLocaleString()}
                                 </span>
                             </div>
                             <div className="flex justify-between items-center w-full">
                                 <span className="text-slate-500 text-xs">{cycleYears}年後資產</span>
                                 <span className="font-bold font-mono text-slate-700">{cycle.totalAssetEnd} 萬</span>
                             </div>
                         </div>
                         
                         {idx < 2 && (
                             <div className={`mt-3 text-[10px] text-center w-full py-1 rounded font-bold ${cycle.netCashBack >= 0 ? 'text-slate-500 bg-white/60' : 'text-red-500 bg-red-100/50'}`}>
                                 {cycle.netCashBack >= 0 ? `舊車回流 +${cycle.netCashBack}萬` : `需補貼 -${Math.abs(cycle.netCashBack)}萬`}
                             </div>
                         )}
                         {idx === 2 && (
                             <div className="mt-3 text-[10px] text-center text-orange-600 font-bold bg-white/50 rounded py-1 border border-orange-100 w-full">
                                 資產大爆發 🚀
                             </div>
                         )}
                     </div>
                 ))}
             </div>
          </div>

          {/* 資產殘值對比圖 - 修正版面與標籤 */}
          <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[300px] flex flex-col">
                  <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                      <Wallet size={18} className="text-orange-500"/> {totalProjectYears}年後資產保留狀況
                  </h4>
                  <div className="flex-1 w-full">
                    {/* 更新：增加 margin.right 以容納標籤，減少 margin.left 去除空白 */}
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={comparisonData} layout="vertical" margin={{top: 20, right: 80, left: 10, bottom: 20}}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9"/>
                            <XAxis type="number" hide />
                            {/* 更新：縮小 Y 軸寬度，讓文字更靠左 */}
                            <YAxis dataKey="name" type="category" tick={{fontSize: 14, fontWeight: 'bold'}} width={70} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px'}} />
                            <Bar dataKey="value" barSize={40} radius={[0, 8, 8, 0]} label={{ position: 'right', fill: '#64748b', fontWeight: 'bold', formatter: (val) => `$${val}萬` }}>
                                {comparisonData.map((entry, index) => (
                                    <cell key={`cell-${index}`} fill={index === 0 ? '#94a3b8' : '#f97316'} />
                                ))}
                            </Bar>
                        </ComposedChart>
                    </ResponsiveContainer>
                  </div>
              </div>

              {/* 文字總結 */}
              <div className="bg-slate-800 rounded-2xl p-6 text-white flex flex-col justify-center space-y-4 shadow-lg">
                  <h3 className="text-xl font-bold text-yellow-400 mb-2">為什麼選擇專案換車？</h3>
                  <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 text-red-400 font-bold">X</div>
                      <div>
                          <p className="font-bold text-slate-200">傳統買車</p>
                          <p className="text-sm text-slate-400">{totalProjectYears} 年花了 300 萬以上換 3 台車，最後手上只剩一堆維修單據與一台老舊的中古車。</p>
                      </div>
                  </div>
                  <div className="w-full h-px bg-slate-700"></div>
                  <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 text-green-400 font-bold">O</div>
                      <div>
                          <p className="font-bold text-white">專案換車</p>
                          <p className="text-sm text-slate-300">{totalProjectYears} 年同樣換 3 台車，但您的本金毫髮無傷，甚至滾出 <span className="text-yellow-400 font-bold">${cycles[2].totalAssetEnd}萬</span> 的現金資產。</p>
                      </div>
                  </div>
              </div>
          </div>

        </div>
      </div>
      
      {/* 底部策略區 (執行三部曲 + 專案四大效益) */}
      <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-slate-200 print-break-inside">
        
        {/* 1. 執行三部曲 */}
        <div className="space-y-4 lg:col-span-1">
          <div className="flex items-center gap-2 mb-2">
             <RefreshCw className="text-orange-600" size={24} />
             <h3 className="text-xl font-bold text-slate-800">執行三部曲</h3>
          </div>
          
          <div className="space-y-3">
             <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-orange-200 transition-colors">
                <div className="mt-1 min-w-[3rem] h-12 rounded-xl bg-orange-50 text-orange-600 flex flex-col items-center justify-center font-bold text-xs">
                   <span className="text-lg">01</span>
                   <span>保留</span>
                </div>
                <div>
                   <h4 className="font-bold text-slate-800 flex items-center gap-2">本金保留 (第1年)</h4>
                   <p className="text-sm text-slate-600 mt-1">不直接花掉現金買車，而是將購車款全數投資，並辦理車貸。讓資產留在身邊生息。</p>
                </div>
             </div>

             <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-red-200 transition-colors">
                <div className="mt-1 min-w-[3rem] h-12 rounded-xl bg-red-50 text-red-600 flex flex-col items-center justify-center font-bold text-xs">
                   <span className="text-lg">02</span>
                   <span>套利</span>
                </div>
                <div>
                   <h4 className="font-bold text-slate-800 flex items-center gap-2">以息養車 (第1-{cycleYears}年)</h4>
                   <p className="text-sm text-slate-600 mt-1">利用投資產生的配息來支付車貸月付金，大幅降低每月的養車現金流壓力。</p>
                </div>
             </div>

             <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-yellow-200 transition-colors">
                <div className="mt-1 min-w-[3rem] h-12 rounded-xl bg-yellow-50 text-yellow-600 flex flex-col items-center justify-center font-bold text-xs">
                   <span className="text-lg">03</span>
                   <span>升級</span>
                </div>
                <div>
                   <h4 className="font-bold text-slate-800 flex items-center gap-2">殘值回流 (第{cycleYears}年)</h4>
                   <p className="text-sm text-slate-600 mt-1">賣掉舊車拿回殘值，加上原本的投資本金，雪球越滾越大，下一台車可以換得更好。</p>
                </div>
             </div>
          </div>
          
          <div className="mt-6 p-4 bg-slate-800 rounded-xl text-center shadow-lg">
             <p className="text-slate-300 italic text-sm">
               「聰明人買的是資產，用資產產生的現金流來支付消費。這就是富人越開好車越有錢的秘密。」
             </p>
           </div>
        </div>

        {/* 2. 專案效益 */}
        <div className="space-y-4 lg:col-span-1">
           <div className="flex items-center gap-2 mb-2">
             <Landmark className="text-orange-600" size={24} />
             <h3 className="text-xl font-bold text-slate-800">專案四大效益</h3>
           </div>
           
           <div className="grid grid-cols-1 gap-3">
              {[
                { title: "永遠開新車", desc: "每五年更換新車，享受最新科技與安全配備，同時避免老車高昂的維修費用。" },
                { title: "資產不歸零", desc: "打破買車就是負資產的宿命，讓您的購車本金透過投資持續增值，錢不再花掉就沒了。" },
                { title: "現金流友善", desc: "透過配息補貼，每月實際從口袋拿出的錢大幅減少，維持生活品質。" },
                { title: "越換越輕鬆", desc: "隨著每一次換車的殘值回流，您的投資本金越來越大，配息越來越多，最終實現免費開車。" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-orange-50/50 transition-colors">
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
