import React from 'react';
import { 
  Building2, 
  Calculator, 
  Scale, 
  Landmark, 
  ArrowRight,
  TrendingUp,
  PiggyBank,
  CheckCircle2,
  RefreshCw,
  Wallet
} from 'lucide-react';
import { ResponsiveContainer, ComposedChart, Area, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

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
  // 檢查是否已過期或利率為零
  if (elapsed >= totalY || rVal === 0) return Math.max(0, pVal * 10000 * (1 - p / (n || 1)));
  
  // 剩餘本金公式 (等額本息)
  const balance = (pVal * 10000) * (Math.pow(1 + r, n) - Math.pow(1 + r, p)) / (Math.pow(1 + r, n) - 1);
  return Math.max(0, isNaN(balance) ? 0 : balance);
};

// ------------------------------------------------------------------
// 核心模組: 金融房產專案 (視覺升級版)
// ------------------------------------------------------------------

export const FinancialRealEstateTool = ({ data, setData }: any) => {
  const safeData = {
    loanAmount: Number(data?.loanAmount) || 1000,
    loanTerm: Number(data?.loanTerm) || 30,
    loanRate: Number(data?.loanRate) || 2.2,
    investReturnRate: Number(data?.investReturnRate) || 6
  };
  const { loanAmount, loanTerm, loanRate, investReturnRate } = safeData;

  const monthlyLoanPayment = calculateMonthlyPayment(loanAmount, loanRate, loanTerm);
  const monthlyInvestIncome = calculateMonthlyIncome(loanAmount, investReturnRate);
  const monthlyCashFlow = monthlyInvestIncome - monthlyLoanPayment;
  const isNegativeCashFlow = monthlyCashFlow < 0; 
  
  // 總自付成本 (用於負現金流的情況)
  const totalOutOfPocket = isNegativeCashFlow ? Math.abs(monthlyCashFlow) * 12 * loanTerm : 0;
  
  // --- 計算 20 年淨利潤 ---
  const targetYear = 20;
  const months20 = targetYear * 12;
  
  // 1. 20年後的剩餘貸款 (若貸款年期大於20年)
  const remainingLoan20 = calculateRemainingBalance(loanAmount, loanRate, loanTerm, Math.min(loanTerm, targetYear));

  // 2. 20年累積的淨現金流 (元)
  const cumulativeNetIncome20 = monthlyCashFlow * months20;

  // 3. 20年後的股權 (Asset Value - Remaining Loan)
  const assetEquity20 = (loanAmount * 10000) - remainingLoan20;

  // 4. 20年後的總資產價值 (萬) = (股權 + 累積淨現金流) / 10000
  const totalWealth20Wan = Math.round((assetEquity20 + cumulativeNetIncome20) / 10000);
  
  // 5. 20年總淨利潤 (萬) = 總資產價值 - 初始貸款總額 (萬)
  const totalProfit20Wan = Math.round(totalWealth20Wan - loanAmount);
  // --- 結束 20 年淨利潤計算 ---


  const generateHouseChartData = () => {
    const dataArr = [];
    let cumulativeNetIncome = 0; 
    const step = loanTerm > 20 ? 3 : 1; 
    
    for (let year = 1; year <= loanTerm; year++) {
      cumulativeNetIncome += monthlyCashFlow * 12;
      const remainingLoan = calculateRemainingBalance(loanAmount, loanRate, loanTerm, year);
      const assetEquity = (loanAmount * 10000) - remainingLoan;
      // 總資產價值 = 累積股權 + 累積淨現金流
      const financialTotalWealth = assetEquity + cumulativeNetIncome;
      
      if (year === 1 || year % step === 0 || year === loanTerm) {
         dataArr.push({ 
            year: `第${year}年`, 
            總資產價值: Math.round(financialTotalWealth / 10000), 
            剩餘貸款: Math.round(remainingLoan / 10000) 
         });
      }
    }
    return dataArr;
  };

  const updateField = (field: string, value: number) => { 
      let newValue = Number(value);

      if (field === 'loanAmount') {
          // 確保 loanAmount 在 500 到 3000 之間，且為整數
          const clampedValue = Math.max(500, Math.min(3000, newValue));
          setData({ ...safeData, [field]: Math.round(clampedValue) });
      } else if (field === 'investReturnRate' || field === 'loanRate') {
          // 確保利率級距為 0.1
          setData({ ...safeData, [field]: Number(newValue.toFixed(1)) });
      } else {
          setData({ ...safeData, [field]: newValue }); 
      }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans text-slate-800">
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden print-break-inside">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Building2 size={180} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-sm">
              Passive Income
            </span>
            <span className="bg-orange-400/20 text-orange-100 px-3 py-1 rounded-full text-xs font-bold tracking-wider backdrop-blur-sm border border-orange-400/30">
              以息養貸・數位包租公
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight flex items-center gap-3">
            金融房產專案
          </h1>
          <p className="text-emerald-100 text-lg opacity-90 max-w-2xl">
            利用長年期低利貸款，打造不需修繕、不需找房客的「數位房地產」。讓配息自動幫您繳房貸。
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* 左側：參數設定與摘要 */}
        <div className="lg:col-span-4 space-y-6 print-break-inside">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
              <Calculator size={20} className="text-emerald-600"/> 
              參數設定
            </h4>
            <div className="space-y-6">
               
               {/* 1. 資產/貸款總額 (萬) - 數字輸入與滑桿連動 */}
               <div>
                   <div className="flex justify-between items-center mb-2">
                       <label className="text-sm font-medium text-slate-600">資產/貸款總額 (萬)</label>
                       <div className="flex items-center">
                           <input 
                               type="number" 
                               min={500} 
                               max={3000} 
                               step={1} // 級距調整為 1 萬
                               value={loanAmount} 
                               onChange={(e) => updateField('loanAmount', Number(e.target.value))} 
                               className="w-20 text-right bg-transparent border-none p-0 font-mono font-bold text-emerald-600 text-lg focus:ring-0 focus:border-emerald-500 focus:bg-emerald-50/50 rounded"
                               style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                           />
                           <span className="font-mono font-bold text-emerald-600 text-lg ml-1">萬</span>
                       </div>
                   </div>
                   <input 
                       type="range" 
                       min={500} 
                       max={3000} 
                       step={1} 
                       value={loanAmount} 
                       onChange={(e) => updateField('loanAmount', Number(e.target.value))} 
                       className={`w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600 hover:accent-emerald-700 transition-all`} 
                   />
                   <p className="text-xs text-slate-400 mt-1">範圍: 500 萬 ~ 3000 萬</p>
               </div>
               
               {/* 2. 貸款年期 */}
               <div>
                 <div className="flex justify-between mb-2">
                     <label className="text-sm font-medium text-slate-600">貸款年期 (年)</label>
                     <span className={`font-mono font-bold text-teal-600 text-lg`}>{loanTerm}</span>
                   </div>
                   <input type="range" min={20} max={40} step={1} value={loanTerm} onChange={(e) => updateField('loanTerm', Number(e.target.value))} className={`w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600 hover:accent-teal-700 transition-all`} />
               </div>

               {/* 3. 貸款利率 */}
               <div>
                 <div className="flex justify-between mb-2">
                     <label className="text-sm font-medium text-slate-600">貸款利率 (%)</label>
                     <span className={`font-mono font-bold text-emerald-600 text-lg`}>{loanRate.toFixed(1)}</span>
                   </div>
                   <input type="range" min={1.5} max={4.0} step={0.1} value={loanRate} onChange={(e) => updateField('loanRate', Number(e.target.value))} className={`w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600 hover:accent-emerald-700 transition-all`} />
               </div>
               
               {/* 4. 投資配息率 - 級距調整為 0.1 */}
               <div>
                 <div className="flex justify-between mb-2">
                     <label className="text-sm font-medium text-slate-600">投資配息率 (%)</label>
                     <span className={`font-mono font-bold text-blue-600 text-lg`}>{investReturnRate.toFixed(1)}</span>
                   </div>
                   <input type="range" min={3} max={10} step={0.1} value={investReturnRate} onChange={(e) => updateField('investReturnRate', Number(e.target.value))} className={`w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700 transition-all`} />
               </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow border border-slate-200 p-6 print-break-inside">
              <h3 className="text-center font-bold text-slate-700 mb-4 flex items-center justify-center gap-2"><Scale size={18}/> 每月現金流試算</h3>
              <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center text-sm"><span className="text-slate-600 font-medium">1. 每月配息收入</span><span className="font-mono text-emerald-600 font-bold">+${Math.round(monthlyInvestIncome).toLocaleString()}</span></div>
                <div className="flex justify-between items-center text-sm"><span className="text-slate-600 font-medium">2. 扣除貸款支出</span><span className="font-mono text-red-500 font-bold">-${Math.round(monthlyLoanPayment).toLocaleString()}</span></div>
                <div className="border-t border-slate-200 my-2"></div>
                
                {isNegativeCashFlow ? (
                   <div className="text-center animate-pulse-soft">
                     <div className="text-xs text-slate-400 mb-1">每月需自行負擔</div>
                     <div className="text-4xl font-black text-red-500 font-mono">-${Math.abs(Math.round(monthlyCashFlow)).toLocaleString()}</div>
                     <div className="mt-4 bg-orange-50 rounded-lg p-3 border border-orange-100">
                        <div className="text-xs text-orange-800 font-bold mb-1">槓桿效益分析</div>
                        <div className="text-xs text-orange-700">總共只付出 <span className="font-bold underline">${Math.round(totalOutOfPocket/10000)}萬</span></div>
                        <div className="text-xs text-orange-700">換取 <span className="font-bold text-lg">${loanAmount}萬</span> 原始資產</div>
                     </div>
                   </div>
                ) : (
                   <div className="text-center">
                     <div className="text-xs text-slate-400 mb-1">每月淨現金流</div>
                     <div className="text-4xl font-black text-emerald-600 font-mono">+${Math.round(monthlyCashFlow).toLocaleString()}</div>
                     <div className="mt-4 bg-emerald-100 rounded-lg p-2 text-xs text-emerald-800 font-bold">
                        🎉 完全由資產養貸，還有找！
                     </div>
                   </div>
                )}
              </div>
          </div>
        </div>

        {/* 右側：圖表展示 */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[400px] print-break-inside relative">
             <h4 className="font-bold text-slate-700 mb-4 pl-2 border-l-4 border-emerald-500">資產淨值成長模擬</h4>
            <ResponsiveContainer width="100%" height="90%">
              <ComposedChart data={generateHouseChartData()} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <defs><linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis unit="萬" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}} itemStyle={{padding: '2px 0'}} />
                <Legend iconType="circle" />
                <Area type="monotone" name="總資產價值" dataKey="總資產價值" stroke="#10b981" fill="url(#colorWealth)" strokeWidth={3} />
                <Line type="monotone" name="剩餘貸款餘額" dataKey="剩餘貸款" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* 新增：20 年總淨利潤卡片 (排版調整) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white rounded-2xl shadow-lg border border-teal-200 p-6 print-break-inside">
             <h3 className="text-xl font-bold text-teal-700 mb-2 flex items-center gap-2">
                 <TrendingUp size={24} /> 20 年累積總效益
             </h3>
             <div className="text-center">
                 <p className="text-slate-500 text-sm font-medium mb-1">
                     專案執行 {targetYear} 年後淨獲利 (股權 + 淨現金流)
                 </p>
                 <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-green-600 font-mono">
                     +${totalProfit20Wan.toLocaleString()} 萬
                 </p>
                 <div className="mt-2 text-xs text-slate-500">
                     總資產價值: ${totalWealth20Wan.toLocaleString()} 萬
                 </div>
             </div>
          </div>
          
          <div className="md:col-span-2 bg-slate-50 rounded-2xl border border-slate-100 p-6 space-y-3 print-break-inside">
             <h3 className="text-xl font-bold text-slate-700 mb-3 flex items-center gap-2">
                 <Scale size={20} /> 關鍵數據
             </h3>
             <div className="grid grid-cols-2 gap-4 text-sm">
                 <div className="flex justify-between"><span className="text-slate-500">初始貸款總額</span><span className="font-bold text-slate-700">{loanAmount.toLocaleString()} 萬</span></div>
                 <div className="flex justify-between"><span className="text-slate-500">20年後剩餘貸款</span><span className="font-bold text-red-500">{Math.round(remainingLoan20 / 10000).toLocaleString()} 萬</span></div>
                 <div className="flex justify-between"><span className="text-slate-500">20年累積淨現金流</span><span className="font-bold text-green-600">{Math.round(cumulativeNetIncome20 / 10000).toLocaleString()} 萬</span></div>
                 <div className="flex justify-between"><span className="text-slate-500">20年股權累積</span><span className="font-bold text-teal-600">{Math.round(assetEquity20 / 10000).toLocaleString()} 萬</span></div>
             </div>
          </div>
      </div>


      {/* Strategy Section: 策略說明 */}
      <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-slate-200 print-break-inside">
        
        {/* 1. 執行循環 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
             <RefreshCw className="text-emerald-600" size={24} />
             <h3 className="text-xl font-bold text-slate-800">執行三部曲</h3>
          </div>
          
          <div className="space-y-3">
             <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-emerald-200 transition-colors">
                <div className="mt-1 min-w-[3rem] h-12 rounded-xl bg-emerald-50 text-emerald-600 flex flex-col items-center justify-center font-bold text-xs">
                   <span className="text-lg">01</span>
                   <span>建置</span>
                </div>
                <div>
                   <h4 className="font-bold text-slate-800 flex items-center gap-2">建置期 (第1年)</h4>
                   <p className="text-sm text-slate-600 mt-1">透過銀行融資取得大筆資金，單筆投入穩健配息資產。就像買房出租，但省去頭期款與管理麻煩。</p>
                </div>
             </div>

             <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-teal-200 transition-colors">
                <div className="mt-1 min-w-[3rem] h-12 rounded-xl bg-teal-50 text-teal-600 flex flex-col items-center justify-center font-bold text-xs">
                   <span className="text-lg">02</span>
                   <span>持守</span>
                </div>
                <div>
                   <h4 className="font-bold text-slate-800 flex items-center gap-2">持守期 (第2-{loanTerm}年)</h4>
                   <p className="text-sm text-slate-600 mt-1">讓資產產生的配息自動償還貸款本息。您只需補貼少許差額(甚至有找)，時間是您最好的朋友。</p>
                </div>
             </div>

             <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-green-200 transition-colors">
                <div className="mt-1 min-w-[3rem] h-12 rounded-xl bg-green-50 text-green-600 flex flex-col items-center justify-center font-bold text-xs">
                   <span className="text-lg">03</span>
                   <span>自由</span>
                </div>
                <div>
                   <h4 className="font-bold text-slate-800 flex items-center gap-2">自由期 (期滿)</h4>
                   <p className="text-sm text-slate-600 mt-1">貸款完全清償。此刻起，這筆千萬資產與每月的配息收入完全屬於您，成為真正的被動收入。</p>
                </div>
             </div>
          </div>
        </div>

        {/* 2. 專案效益 */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 mb-2">
             <Landmark className="text-emerald-600" size={24} />
             <h3 className="text-xl font-bold text-slate-800">專案四大效益</h3>
           </div>
           
           <div className="grid grid-cols-1 gap-3">
              {[
                { title: "數位包租公", desc: "如同擁有房產收租，但沒有空租期、修繕費、稅金與惡房客的煩惱。" },
                { title: "抗通膨", desc: "利用負債對抗通膨。隨著時間推移，貨幣貶值，您償還的貸款實質價值在下降，但資產在增值。" },
                { title: "資產擁有權", desc: "與租房不同，付出的每一分錢最後都換來實實在在的資產，而不只是消費。" },
                { title: "極低門檻", desc: "不需要數百萬頭期款，只需良好的信用與穩定的現金流即可啟動千萬資產計畫。" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-emerald-50/50 transition-colors">
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
               「富人買資產，窮人買負債，中產階級買他們以為是資產的負債。金融房產，是真正的資產。」
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};