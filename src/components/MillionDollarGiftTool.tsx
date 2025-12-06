import React from 'react';
import { 
  Wallet, 
  Calculator, 
  Gift, 
  Repeat, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
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
// 輔助組件: 循環結果卡片 (統一化樣式)
// ------------------------------------------------------------------
const ResultCard = ({ phase, period, netOut, asset, totalOut, netProfitTotal, isFinal = false, loanTerm }: any) => {
    const color = phase === 1 ? 'blue' : phase === 2 ? 'indigo' : 'purple';
    const bgColor = phase === 1 ? 'bg-blue-50' : phase === 2 ? 'bg-indigo-50' : 'bg-purple-50';
    const borderColor = phase === 1 ? 'border-blue-200' : phase === 2 ? 'border-indigo-200' : 'border-purple-200';
    const icon = phase === 1 ? '01' : phase === 2 ? '02' : '03';

    return (
      <div className={`p-6 rounded-2xl shadow-lg border ${borderColor} ${bgColor}`}>
        <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
           <h3 className={`font-black text-xl text-${color}-700`}>階段 {icon}</h3>
           <span className="text-sm font-bold text-slate-500">{period}</span>
        </div>
        
        <div className="space-y-3">
           <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 font-medium">實質每月淨負擔</span>
              <span className={`text-xl font-bold font-mono ${netOut > 0 ? 'text-red-600' : 'text-green-600'}`}>
                 ${Math.round(netOut).toLocaleString()}
              </span>
           </div>
           
           <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100">
              <span className="text-slate-600 font-medium">期末資產規模 (萬)</span>
              <span className="text-2xl font-black text-indigo-700 font-mono">{asset.toLocaleString()}</span>
           </div>
           
           <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 font-medium">本期實質總付出 (萬)</span>
              <span className={`text-lg font-bold font-mono ${totalOut > 0 ? 'text-red-500' : 'text-green-600'}`}>
                 {totalOut.toLocaleString()} 萬
              </span>
           </div>

           {isFinal && (
             <div className="flex justify-between items-center pt-3 border-t-2 border-dashed border-gray-300 mt-4">
                <span className="text-slate-700 font-bold">總計 {loanTerm * 3} 年淨獲利</span>
                <span className={`text-3xl font-black font-mono ${netProfitTotal > 0 ? 'text-green-600' : 'text-red-500'}`}>
                   {netProfitTotal.toLocaleString()} 萬
                </span>
             </div>
           )}
        </div>
      </div>
    );
  };
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

  // --- 總付出計算邏輯 (萬為單位) ---
  const monthsPerCycle = loanTerm * 12;

  // T0-T7 總實質付出
  const totalCashOut_T0_T7_Raw = phase1_NetOut * monthsPerCycle;
  const totalCashOut_T0_T7_Wan = Math.round(totalCashOut_T0_T7_Raw / 10000);

  // T7-T14 總實質付出
  const totalCashOut_T7_T14_Raw = phase2_NetOut * monthsPerCycle;
  const totalCashOut_T7_T14_Wan = Math.round(totalCashOut_T7_T14_Raw / 10000);

  // T14-T21 總實質付出
  const totalCashOut_T14_T21_Raw = phase3_NetOut * monthsPerCycle;
  const totalCashOut_T14_T21_Wan = Math.round(totalCashOut_T14_T21_Raw / 10000);
  
  // 21 年總實質付出 (T0-T21)
  const totalCashOut_21_Years_Wan = totalCashOut_T0_T7_Wan + totalCashOut_T7_T14_Wan + totalCashOut_T14_T21_Wan;
  
  // 21 年後的資產 (第三階段結束)
  const finalAssetValue_T21_Wan = loanAmount * 3;
  
  // 21 年淨獲利 (資產 - 總實質付出)
  const netProfit_21_Years_Wan = finalAssetValue_T21_Wan - totalCashOut_21_Years_Wan;
  
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
      
      let currentPhaseNetOut;
      if (year <= loanTerm) {
        currentPhaseNetOut = phase1_NetOut;
        projectAssetValue = loanAmount * 1 * 10000;
      } else if (year <= loanTerm * 2) {
        currentPhaseNetOut = phase2_NetOut;
        projectAssetValue = loanAmount * 2 * 10000;
      } else {
        currentPhaseNetOut = phase3_NetOut; 
        projectAssetValue = loanAmount * 3 * 10000;
      }

      cumulativeProjectCost += currentPhaseNetOut * 12;
      
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
          // loanAmount 級距調整為 1 萬
          setData({ ...safeData, [field]: Number(value) }); 
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
                 // --- 修正單次借貸額度級距為 1 萬 ---
                 { label: "單次借貸額度 (萬)", field: "loanAmount", min: 10, max: 500, step: 1, val: loanAmount, color: "blue", unit: " 萬" },
                 { label: "信貸利率 (%)", field: "loanRate", min: 1.5, max: 15.0, step: 0.1, val: loanRate, color: "indigo", unit: "%" },
                 // --- 投資配息率級距為 0.1 ---
                 { label: "投資配息率 (%)", field: "investReturnRate", min: 3, max: 12, step: 0.1, val: investReturnRate, color: "purple", unit: "%" }
               ].map((item) => (
                 <div key={item.field}>
                   <div className="flex justify-between mb-2">
                     <label className="text-sm font-medium text-slate-600">{item.label}</label>
                     <span className={`font-mono font-bold text-${item.color}-600 text-lg`}>{item.val.toFixed(item.step === 0.1 ? 1 : 0)}{item.unit}</span>
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
                   <div className="text-lg font-bold text-slate-700">{loanTerm * 3} 年</div>
               </div>
            </div>
          </div>
        </div>

        {/* 右側：圖表展示 - 調整高度讓版面更舒適 */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[400px] print-break-inside relative">
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

      {/* --- 新增：三個循環的結果對比區 (統一化樣式) --- */}
      <div className="pt-6 border-t border-slate-200">
         <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Repeat className="text-indigo-600" size={24} /> 三循環成果關鍵指標
         </h2>
         <div className="grid md:grid-cols-3 gap-6">
            <ResultCard 
               phase={1} 
               period={`T0 - T${loanTerm} (累積期)`}
               netOut={phase1_NetOut}
               asset={loanAmount * 1}
               totalOut={totalCashOut_T0_T7_Wan}
               loanTerm={loanTerm}
            />
            <ResultCard 
               phase={2} 
               period={`T${loanTerm} - T${loanTerm * 2} (成長期)`}
               netOut={phase2_NetOut}
               asset={loanAmount * 2}
               totalOut={totalCashOut_T7_T14_Wan}
               loanTerm={loanTerm}
            />
            <ResultCard 
               phase={3} 
               period={`T${loanTerm * 2} - T${loanTerm * 3} (收穫期)`}
               netOut={phase3_NetOut}
               asset={loanAmount * 3}
               totalOut={totalCashOut_T14_T21_Wan}
               netProfitTotal={netProfit_21_Years_Wan}
               isFinal={true}
               loanTerm={loanTerm}
            />
         </div>
         <div className="text-center mt-6 p-4 bg-white rounded-xl shadow border border-slate-200">
             <p className="text-xl font-bold text-slate-700">總結：{loanTerm * 3} 年總計實質付出 <span className="text-red-600">${totalCashOut_21_Years_Wan.toLocaleString()} 萬</span>，最終換取 <span className="text-green-600">${finalAssetValue_T21_Wan.toLocaleString()} 萬</span> 資產！</p>
         </div>
      </div>

      {/* Strategy Section: 策略說明 (保持原位，用於版面平衡) */}
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
                   <h4 className="font-bold text-slate-800 flex items-center gap-2">收穫期 (第{loanTerm * 2 + 1}-{loanTerm * 3}年)</h4>
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