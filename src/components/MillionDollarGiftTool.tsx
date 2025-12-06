import React from 'react';
import { 
  Wallet, 
  Calculator, 
  Gift, 
  Repeat, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  PiggyBank,
  RefreshCw,
  Target
} from 'lucide-react';
import { ResponsiveContainer, ComposedChart, Area, Line, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

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
  // 假設投資配息為年化配息率 / 12，且是針對 principal * 10000 (萬轉元)
  return (p * 10000 * (r / 100)) / 12; 
};

// ------------------------------------------------------------------
// 核心模組: 百萬禮物專案 (視覺升級版)
// ------------------------------------------------------------------

const MillionDollarGiftTool = ({ data, setData }: any) => {
  const safeData = {
    loanAmount: Number(data?.loanAmount) || 100,
    loanTerm: Number(data?.loanTerm) || 7, // 假設信貸期數為 7 年
    loanRate: Number(data?.loanRate) || 2.8,
    investReturnRate: Number(data?.investReturnRate) || 6
  };
  const { loanAmount, loanTerm, loanRate, investReturnRate } = safeData;

  // 目標金額是單次借貸的 3 倍 (例如借 100 萬，目標就是 300 萬)
  const targetAmount = loanAmount * 3; 
  
  const monthlyLoanPayment = calculateMonthlyPayment(loanAmount, loanRate, loanTerm);
  const monthlyInvestIncomeSingle = calculateMonthlyIncome(loanAmount, investReturnRate);
  
  // 第一階段 (T0-T7): 月付 - 1倍配息
  const phase1_NetOut = monthlyLoanPayment - monthlyInvestIncomeSingle;
  // 第二階段 (T7-T14): 月付 - 2倍配息 (資產翻倍，配息也翻倍)
  const phase2_NetOut = monthlyLoanPayment - (monthlyInvestIncomeSingle * 2);
  // 第三階段 (T14-T21): 月付 - 3倍配息 (資產三倍)
  const phase3_NetOut = monthlyLoanPayment - (monthlyInvestIncomeSingle * 3);

  // --- 新增計算邏輯 ---
  // 這七年 (T0-T7) 總付出的實質本金 (元)
  const totalCashOut_T0_T7_Raw = phase1_NetOut * loanTerm * 12;
  const totalCashOut_T0_T7_Wan = Math.round(totalCashOut_T0_T7_Raw / 10000);

  // 下個七年 (T7-T14) 總付出的實質本金 (元)
  const totalCashOut_T7_T14_Raw = phase2_NetOut * loanTerm * 12;
  const totalCashOut_T7_T14_Wan = Math.round(totalCashOut_T7_T14_Raw / 10000);
  
  // 14 年總實質付出 (T0-T14)
  const totalCashOut_14_Years_Wan = totalCashOut_T0_T7_Wan + totalCashOut_T7_T14_Wan;
  
  // 14 年後的資產 (第二階段結束)
  const finalAssetValue_T14_Wan = loanAmount * 2;
  
  // 14 年淨獲利 (資產 - 總實質付出)
  const netProfit_T14_Wan = finalAssetValue_T14_Wan - totalCashOut_14_Years_Wan;
  
  // 修正：一般存錢的總目標應該等於專案的目標金額 (萬 -> 元)
  const standardTotalCost = targetAmount * 10000; 
  // 假設一般存錢是 15 年達標
  const standardMonthlySaving = standardTotalCost / (15 * 12); 

  const generateChartData = () => {
    const dataArr = [];
    let cumulativeStandard = 0;
    let cumulativeProjectCost = 0;
    let projectAssetValue = 0;
    
    // 總共計算 3 個循環 (21 年)
    const totalYears = loanTerm * 3; 

    for (let year = 1; year <= totalYears; year++) {
      // 假設一般存錢仍在進行
      cumulativeStandard += standardMonthlySaving * 12;
      
      if (year <= loanTerm) {
        // Phase 1: 1倍資產, 1倍配息
        cumulativeProjectCost += phase1_NetOut * 12;
        projectAssetValue = loanAmount * 1 * 10000;
      } else if (year <= loanTerm * 2) {
        // Phase 2: 2倍資產, 2倍配息
        cumulativeProjectCost += phase2_NetOut * 12;
        projectAssetValue = loanAmount * 2 * 10000;
      } else if (year <= loanTerm * 3) {
        // Phase 3: 3倍資產, 3倍配息
        cumulativeProjectCost += phase3_NetOut * 12; 
        projectAssetValue = loanAmount * 3 * 10000;
      } else {
        projectAssetValue = loanAmount * 3 * 10000;
      }

      dataArr.push({
        year: `第${year}年`,
        一般存錢成本: Math.round(cumulativeStandard / 10000),
        專案實付成本: Math.round(cumulativeProjectCost / 10000),
        專案持有資產: Math.round(projectAssetValue / 10000),
      });
    }
    return dataArr;
  };

  const updateField = (field: string, value: number) => { 
      // 確保配息率保留一位小數
      if (field === 'investReturnRate') {
          setData({ ...safeData, [field]: Number(value.toFixed(1)) });
      } else {
          setData({ ...safeData, [field]: value }); 
      }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans text-slate-800">
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden print-break-inside">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Gift size={180} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-sm">
              Asset Accumulation
            </span>
            <span className="bg-yellow-400/20 text-yellow-100 px-3 py-1 rounded-full text-xs font-bold tracking-wider backdrop-blur-sm border border-yellow-400/30">
              循環槓桿・資產倍增
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight flex items-center gap-3">
            百萬禮物專案
          </h1>
          <p className="text-indigo-100 text-lg opacity-90 max-w-2xl">
            透過三次循環操作，用時間換取 {targetAmount} 萬資產。送給未來的自己，或是孩子最棒的成年禮。
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* 左側：參數設定與摘要 */}
        <div className="lg:col-span-4 space-y-6 print-break-inside">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
              <Calculator size={20} className="text-indigo-600"/> 
              參數設定
            </h4>
            <div className="space-y-6">
               {[
                 { label: "單次借貸額度 (萬)", field: "loanAmount", min: 50, max: 500, step: 10, val: loanAmount, color: "blue" },
                 { label: "信貸利率 (%)", field: "loanRate", min: 1.5, max: 15.0, step: 0.1, val: loanRate, color: "indigo" },
                 // --- 調整投資配息率級距為 0.1 ---
                 { label: "投資配息率 (%)", field: "investReturnRate", min: 3, max: 12, step: 0.1, val: investReturnRate, color: "purple" }
               ].map((item) => (
                 <div key={item.field}>
                   <div className="flex justify-between mb-2">
                     <label className="text-sm font-medium text-slate-600">{item.label}</label>
                     <span className={`font-mono font-bold text-${item.color}-600 text-lg`}>{item.val.toFixed(item.step === 0.1 ? 1 : 0)}</span>
                   </div>
                   <input type="range" min={item.min} max={item.max} step={item.step} value={item.val} onChange={(e) => updateField(item.field, Number(e.target.value))} className={`w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-${item.color}-600 hover:accent-${item.color}-700 transition-all`} />
                 </div>
               ))}
            </div>
            
            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
               <div>
                  <div className="text-xs text-slate-500 mb-1">總目標資產</div>
                  <div className="text-lg font-bold text-indigo-600">{targetAmount} 萬</div>
               </div>
               <div>
                   <div className="text-xs text-slate-500 mb-1">專案總時程</div>
                   <div className="text-lg font-bold text-slate-700">{loanTerm * 3} 年 (3 循環)</div>
               </div>
            </div>
          </div>
          
          {/* --- Phase 1 與 Phase 2 成果對比卡片 (並排) --- */}
          <div className="grid grid-cols-1 gap-4 print-break-inside">
             {/* Phase 1 (T0-T7) 結果卡 (原來的計算區) */}
             <div className="bg-white rounded-2xl shadow border border-slate-200 p-6">
                <div className="text-sm text-slate-500 mb-4 text-center">
                   第一循環 (T0 - T{loanTerm}) 實質付出分析
                </div>
                <div className="space-y-4 bg-indigo-50/50 p-5 rounded-xl border border-indigo-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-100 rounded-bl-full -mr-8 -mt-8 opacity-50"></div>
                    
                    <div className="flex justify-between items-center text-sm"><span className="text-slate-600 font-medium">1. 信貸每月還款</span><span className="text-red-500 font-bold font-mono">-${Math.round(monthlyLoanPayment).toLocaleString()}</span></div>
                    <div className="flex justify-between items-center text-sm"><span className="text-slate-600 font-medium">2. 扣除每月配息 (1X)</span><span className="text-green-600 font-bold font-mono">+${Math.round(monthlyInvestIncomeSingle).toLocaleString()}</span></div>
                    <div className="border-t border-indigo-200 my-2 border-dashed"></div>
                    <div className="flex justify-between items-end">
                      <span className="text-indigo-800 font-bold">3. 實質每月應負</span>
                      <span className="text-3xl font-black text-indigo-600 font-mono">${Math.round(phase1_NetOut).toLocaleString()}</span>
                    </div>
                </div>
                {/* --- 需求 1: 這7年總付出的金額 --- */}
                <div className="mt-4 text-center">
                    <p className="text-sm font-bold text-red-600 italic">
                        這 {loanTerm} 年總實質付出：<span className="text-lg">{totalCashOut_T0_T7_Wan.toLocaleString()}</span> 萬
                    </p>
                </div>
             </div>
             
             {/* --- 需求 2: 下個七年 (T7-T14) 計算結果方塊 --- */}
             <div className="bg-white rounded-2xl shadow border border-slate-200 p-6 bg-purple-50 border-purple-200">
                <h3 className="text-center font-bold text-purple-700 mb-4 flex items-center justify-center gap-2">
                    <Repeat size={18} /> 第二循環 (T{loanTerm} - T{loanTerm * 2}) 成果
                </h3>
                <div className="space-y-3">
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-purple-600 font-medium">1. 實質每月應負 (2X 配息折抵)</span>
                      <span className="text-xl font-bold font-mono text-purple-600">${Math.round(phase2_NetOut).toLocaleString()}</span>
                   </div>
                   <div className="border-t border-purple-200 my-2 border-dashed"></div>
                   <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">2. 總資產規模 (T{loanTerm * 2})</span>
                      <span className="text-2xl font-black text-indigo-700 font-mono">{finalAssetValue_T14_Wan.toLocaleString()} 萬</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">3. T{loanTerm}-T{loanTerm * 2} 總實質付出</span>
                      <span className={`text-lg font-bold font-mono ${totalCashOut_T7_T14_Wan > 0 ? 'text-red-500' : 'text-green-600'}`}>
                         {totalCashOut_T7_T14_Wan.toLocaleString()} 萬
                      </span>
                   </div>
                   <div className="flex justify-between items-center pt-2 border-t border-purple-200">
                      <span className="text-slate-700 font-bold">4. 總計 {loanTerm * 2} 年淨獲利</span>
                      <span className={`text-2xl font-black font-mono ${netProfit_T14_Wan > 0 ? 'text-green-600' : 'text-red-500'}`}>
                         {netProfit_T14_Wan.toLocaleString()} 萬
                      </span>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* 右側：圖表展示 */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[500px] print-break-inside relative">
             <h4 className="font-bold text-slate-700 mb-4 pl-2 border-l-4 border-indigo-500">資產累積三階段 ({loanTerm * 3}年趨勢)</h4>
            <ResponsiveContainer width="100%" height="90%">
              <ComposedChart data={generateChartData()} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorAssetGift" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis unit="萬" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}} itemStyle={{padding: '2px 0'}} />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="專案持有資產" stroke="#6366f1" fill="url(#colorAssetGift)" strokeWidth={3} />
                <Bar dataKey="一般存錢成本" fill="#cbd5e1" barSize={12} radius={[4,4,0,0]} />
                <Line type="monotone" dataKey="專案實付成本" stroke="#f59e0b" strokeWidth={3} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Strategy Section: 策略說明 */}
      <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-slate-200 print-break-inside">
        
        {/* 1. 執行循環 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
             <RefreshCw className="text-indigo-600" size={24} />
             <h3 className="text-xl font-bold text-slate-800">執行三部曲 ({loanTerm * 3}年計畫)</h3>
          </div>
          
          <div className="space-y-3">
             <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-blue-200 transition-colors">
                <div className="mt-1 min-w-[3rem] h-12 rounded-xl bg-blue-50 text-blue-600 flex flex-col items-center justify-center font-bold text-xs">
                   <span className="text-lg">01</span>
                   <span>啟動</span>
                </div>
                <div>
                   <h4 className="font-bold text-slate-800 flex items-center gap-2">累積期 (第1-{loanTerm}年)</h4>
                   <p className="text-sm text-slate-600 mt-1">借入第一筆資金，投入配息商品。配息幫忙繳部分貸款，您只需負擔差額，無痛累積第一桶金。</p>
                   <div className="mt-2 text-xs font-bold text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded">持有資產：{loanAmount} 萬</div>
                </div>
             </div>

             <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-indigo-200 transition-colors">
                <div className="mt-1 min-w-[3rem] h-12 rounded-xl bg-indigo-50 text-indigo-600 flex flex-col items-center justify-center font-bold text-xs">
                   <span className="text-lg">02</span>
                   <span>成長</span>
                </div>
                <div>
                   <h4 className="font-bold text-slate-800 flex items-center gap-2">循環期 (第{loanTerm + 1}-{loanTerm * 2}年)</h4>
                   <p className="text-sm text-slate-600 mt-1">第一筆還完後再次借出，資產翻倍。此時雙份配息讓您的月付金大幅降低，甚至接近零。</p>
                   <div className="mt-2 text-xs font-bold text-indigo-600 bg-indigo-50 inline-block px-2 py-1 rounded">持有資產：{loanAmount*2} 萬</div>
                </div>
             </div>

             <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-purple-200 transition-colors">
                <div className="mt-1 min-w-[3rem] h-12 rounded-xl bg-purple-50 text-purple-600 flex flex-col items-center justify-center font-bold text-xs">
                   <span className="text-lg">03</span>
                   <span>收割</span>
                </div>
                <div>
                   <h4 className="font-bold text-slate-800 flex items-center gap-2">收穫期 (第{loanTerm * 2 + 1}年起)</h4>
                   <p className="text-sm text-slate-600 mt-1">第三次操作，資產達標。三份配息通常已超過貸款月付，開始產生正向現金流，或選擇結清享受成果。</p>
                   <div className="mt-2 text-xs font-bold text-purple-600 bg-purple-50 inline-block px-2 py-1 rounded">持有資產：{loanAmount*3} 萬</div>
                </div>
             </div>
          </div>
        </div>

        {/* 2. 專案效益 */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 mb-2">
             <Target className="text-indigo-600" size={24} />
             <h3 className="text-xl font-bold text-slate-800">專案四大效益</h3>
           </div>
           
           <div className="grid grid-cols-1 gap-3">
              {[
                { title: "時間槓桿", desc: `不需等到存夠錢才投資，直接借入未來財富，讓複利效應提早${loanTerm}年啟動。` },
                { title: "強迫儲蓄", desc: "將「隨意花費」轉為「固定還款」，每月收到帳單就是最好的存錢提醒。" },
                { title: "無痛累積", desc: "利用配息Cover大部分還款，用比一般存錢更少的現金流，換取更大的資產。" },
                { title: "信用培養", desc: `長達${loanTerm * 3}年的優良還款紀錄，將使您成為銀行眼中的頂級優質客戶。` }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-indigo-50/50 transition-colors">
                  <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-bold text-slate-800">{item.title}</h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
           </div>

           <div className="mt-6 p-4 bg-slate-800 rounded-xl text-center shadow-lg">
             <p className="text-slate-300 italic text-sm">
               「給孩子的不是一筆錢，而是一套會長大的資產，以及受用一生的理財智慧。」
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MillionDollarGiftTool;