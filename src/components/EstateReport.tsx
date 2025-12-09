import React from 'react';
import { 
  Building2, Landmark, Scale, ShieldCheck, TrendingUp, ArrowRight, Quote, CheckCircle2,
  XCircle, AlertTriangle, Percent, Banknote, Lock, Clock, PieChart, ArrowDownRight, Wallet, ArrowDown
} from 'lucide-react';
import { 
  ComposedChart, Area, Line, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer, Bar, Pie, Cell, Tooltip as RechartsTooltip
} from 'recharts';

// ------------------------------------------------------------------
// --- 計算邏輯 (本地獨立計算，確保與介面一致) ---
// ------------------------------------------------------------------
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
  if (elapsed >= totalY || rVal === 0) return Math.max(0, pVal * 10000 * (1 - p / (n || 1)));
  const balance = (pVal * 10000) * (Math.pow(1 + r, n) - Math.pow(1 + r, p)) / (Math.pow(1 + r, n) - 1);
  return Math.max(0, isNaN(balance) ? 0 : balance);
};

// ------------------------------------------------------------------
// 子元件: 超級比一比 (Comparison Card) - 極致緊湊版
// ------------------------------------------------------------------
const ComparisonRow = ({ title, physical, financial, isBetter }: any) => (
    <div className="grid grid-cols-3 gap-1 py-2 print:py-1 border-b border-slate-100 last:border-0 text-sm print:text-[10px] items-center">
        <div className="font-bold text-slate-600 flex items-center">{title}</div>
        <div className="text-center text-slate-500 flex items-center justify-center gap-1 scale-90 origin-center">
             {physical}
        </div>
        <div className="text-center font-bold text-emerald-600 flex items-center justify-center gap-1 bg-emerald-50 rounded-lg py-0.5 print:bg-transparent">
             {financial} {isBetter && <CheckCircle2 size={12} className="print:w-3 print:h-3" />}
        </div>
    </div>
);

// ------------------------------------------------------------------
// 主元件: EstateReport
// ------------------------------------------------------------------
const EstateReport = ({ data }: { data: any }) => {
  // 1. 資料解構 (若無資料則使用預設值)
  const loanAmount = Number(data?.loanAmount) || 1000;
  const loanTerm = Number(data?.loanTerm) || 30;
  const loanRate = Number(data?.loanRate) || 2.2;
  const investReturnRate = Number(data?.investReturnRate) || 6;
  const existingLoanBalance = Number(data?.existingLoanBalance) || 0;
  const existingMonthlyPayment = Number(data?.existingMonthlyPayment) || 0;
  
  // [關鍵修正]: 優先讀取 isRefinanceMode
  const isRefinance = data?.isRefinanceMode ?? (data?.isRefinance ?? false);
  const cashOutAmount = isRefinance ? Math.max(0, loanAmount - existingLoanBalance) : 0;

  // 2. 核心計算
  const monthlyPayment = calculateMonthlyPayment(loanAmount, loanRate, loanTerm);
  
  // 轉增貸模式計算
  const monthlyInvestIncomeFromCashOut = calculateMonthlyIncome(cashOutAmount, investReturnRate);
  const netNewMonthlyPayment = monthlyPayment - monthlyInvestIncomeFromCashOut;
  const monthlySavings = existingMonthlyPayment - netNewMonthlyPayment;
  const totalSavingsOverTerm = monthlySavings * 12 * loanTerm;
  const totalBenefitRefinance = totalSavingsOverTerm + (cashOutAmount * 10000);

  // 一般模式計算
  const monthlyIncomeFull = calculateMonthlyIncome(loanAmount, investReturnRate);
  const netCashFlow = monthlyIncomeFull - monthlyPayment;
  const isPositiveFlow = netCashFlow >= 0;
  const totalNetCashFlow = netCashFlow * 12 * loanTerm;
  const totalAssetValue = loanAmount * 10000; // 假設本金不變
  const totalBenefitStandard = totalAssetValue + totalNetCashFlow;
  
  // 3. 圖表數據
  const generateChartData = () => {
    const dataArr = [];
    const step = Math.max(1, Math.floor(loanTerm / 15));

    for (let year = 1; year <= loanTerm; year++) {
      if (year === 1 || year % step === 0 || year === loanTerm) {
        const remainingLoan = calculateRemainingBalance(loanAmount, loanRate, loanTerm, year);
        
        if (isRefinance) {
            const cumulativeSavings = monthlySavings * 12 * year;
            dataArr.push({
                year: `${year}`,
                累積效益: Math.round(cumulativeSavings / 10000), // 省下的錢
                轉貸現金: Math.round(cashOutAmount), // 增貸出來的錢(定值)
                剩餘貸款: Math.round(remainingLoan / 10000)
            });
        } else {
            // 一般模式：顯示資產與淨值
            const equity = (loanAmount * 10000) - remainingLoan;
            const cumulativeFlow = netCashFlow * 12 * year;
            const netWorth = equity + cumulativeFlow; // 總權益 = 淨值 + 累積現金流
            
            dataArr.push({
                year: `${year}`,
                總權益: Math.round(netWorth / 10000), // 修正為總權益
                剩餘貸款: Math.round(remainingLoan / 10000),
                淨值: Math.round(equity / 10000),
                累積現金流: Math.round(cumulativeFlow / 10000)
            });
        }
      }
    }
    return dataArr;
  };
  const chartData = generateChartData();
  
  // 資產活化圓餅圖數據
  const activationData = [
      { name: '原本房貸', value: existingLoanBalance, color: '#94a3b8' },
      { name: '活化資金 (增貸)', value: cashOutAmount, color: '#f97316' }
  ];

  // 4. 壓力測試數據
  const spread = investReturnRate - loanRate;
  const breakEvenRate = investReturnRate;

  // LOGO 設定
  const LOGO_URL = "/logo.png";

  return (
    <div className="font-sans text-slate-800 space-y-6 print:space-y-2 relative text-sm print:text-xs">
      
      {/* 浮水印 */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[50] overflow-hidden mix-blend-multiply print:fixed print:top-1/2 print:left-1/2 print:-translate-x-1/2 print:-translate-y-1/2">
          <div className="opacity-[0.08] transform -rotate-12">
              <img 
                src={LOGO_URL}
                alt="Watermark" 
                className="w-[500px] h-auto grayscale object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
          </div>
      </div>

      {/* 1. Header (高度縮減) */}
      <div className="relative z-10 flex items-center justify-between border-b-2 border-emerald-100 pb-4 print:pb-1 print-break-inside bg-white/50 backdrop-blur-sm">
         <div className="flex items-center gap-3">
             <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                 <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain p-1" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
             </div>
             <div>
                 <span className="text-[10px] font-bold text-emerald-600 tracking-widest uppercase block mb-0.5">Financial Real Estate</span>
                 <h1 className="text-3xl font-black text-slate-900 mb-0.5 print:text-xl leading-none">金融房產專案</h1>
                 <p className="text-xs text-slate-500 font-medium print:text-[10px]">打造不需修繕、自動收租的數位級資產</p>
             </div>
         </div>
         <div className="text-right hidden print:block">
             <p className="text-[10px] text-slate-400">專案代碼</p>
             <p className="text-sm font-mono font-bold text-slate-700">RE-{loanAmount}W-{loanTerm}Y</p>
         </div>
      </div>

      {/* 2. 核心戰略：超級比一比 (緊湊版) */}
      <div className="relative z-10 bg-slate-50 rounded-2xl p-4 border border-slate-200 print-break-inside print:p-2 print:rounded-lg">
          <div className="flex items-center justify-between mb-3 print:mb-1">
              <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2 print:text-sm">
                  <Scale size={20} className="text-emerald-500 print:w-3.5 print:h-3.5"/>
                  投資模式超級比一比
              </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2 print:grid-cols-2">
              {/* 左側：傳統房東 */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 print:p-1.5 opacity-80 grayscale-[0.3]">
                  <div className="flex items-center gap-2 mb-2 print:mb-1 border-b border-slate-100 pb-1">
                      <Building2 className="text-slate-400 print:w-3.5 print:h-3.5" size={16}/>
                      <h3 className="font-bold text-slate-600 print:text-xs">傳統實體房產</h3>
                  </div>
                  <div className="space-y-0.5">
                      <ComparisonRow title="自備頭期" physical="20% - 30%" financial="--" />
                      <ComparisonRow title="管理維護" physical="修繕、找房客" financial="--" />
                      <ComparisonRow title="變現速度" physical="3月-半年" financial="--" />
                      <ComparisonRow title="交易成本" physical="仲介費、稅" financial="--" />
                  </div>
              </div>

              {/* 右側：數位包租公 */}
              <div className="bg-white p-3 rounded-xl border-2 border-emerald-500 shadow-sm print:shadow-none print:p-1.5 relative overflow-hidden print:border">
                  <div className="flex items-center gap-2 mb-2 print:mb-1 border-b border-emerald-100 pb-1">
                      <Landmark className="text-emerald-600 print:w-3.5 print:h-3.5" size={16}/>
                      <h3 className="font-bold text-emerald-700 print:text-xs">金融房產 (本專案)</h3>
                  </div>
                  <div className="space-y-0.5">
                      <ComparisonRow title="自備頭期" physical="--" financial="0% (全額融資)" isBetter={true} />
                      <ComparisonRow title="管理維護" physical="--" financial="0 (全自動)" isBetter={true} />
                      <ComparisonRow title="變現速度" physical="--" financial="T+3 (三天)" isBetter={true} />
                      <ComparisonRow title="交易成本" physical="--" financial="極低 (手續費)" isBetter={true} />
                  </div>
              </div>
          </div>
      </div>
      
      {/* 2.5 財務結構與效益分析 (雙模式支援) */}
      <div className="relative z-10 print-break-inside">
             <h2 className="text-lg font-bold text-slate-700 mb-3 flex items-center gap-2 print:text-sm print:mb-1.5">
                  <Wallet size={20} className="text-orange-500 print:w-3.5 print:h-3.5"/>
                  {isRefinance ? "財務負擔瘦身與資產活化分析" : "現金流結構與槓桿效益分析"}
              </h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2 print:grid-cols-2">
                 {/* 左側卡片 */}
                 {isRefinance ? (
                    // 轉增貸: 月付金對照
                     <div className="bg-white rounded-xl border border-slate-200 p-4 print:p-2 shadow-sm">
                         <h4 className="font-bold text-slate-600 mb-2 text-center print:text-xs">月付金變化對照</h4>
                         <div className="flex items-center justify-between gap-1">
                             <div className="text-center">
                                 <div className="text-[10px] text-slate-400 mb-0.5">原月付金</div>
                                 <div className="text-lg font-bold text-slate-400 line-through decoration-red-400 decoration-2 print:text-sm">
                                     ${Math.round(existingMonthlyPayment).toLocaleString()}
                                 </div>
                             </div>
                             <ArrowRight className="text-slate-300 w-4 h-4" />
                             <div className="text-center">
                                 <div className="text-[10px] text-slate-400 mb-0.5">整合後月付</div>
                                 <div className="text-xl font-black text-emerald-600 print:text-base">
                                     ${Math.round(netNewMonthlyPayment).toLocaleString()}
                                 </div>
                             </div>
                         </div>
                         <div className="mt-2 bg-orange-50 rounded-lg p-2 text-center border border-orange-100">
                             <p className="text-[10px] text-orange-800 font-bold">每月省下現金流</p>
                             <p className="text-xl font-black text-orange-600 font-mono print:text-base">
                                 ${Math.round(monthlySavings).toLocaleString()}
                             </p>
                         </div>
                     </div>
                 ) : (
                    // 一般模式: 現金流結構
                    <div className="bg-white rounded-xl border border-slate-200 p-4 print:p-2 shadow-sm">
                        <h4 className="font-bold text-slate-600 mb-2 text-center print:text-xs">每月現金流結構</h4>
                        <div className="space-y-1">
                             <div className="flex justify-between items-center text-xs print:text-[10px]">
                                 <span className="text-slate-500">配息收入</span>
                                 <span className="font-bold text-emerald-600">+${Math.round(monthlyIncomeFull).toLocaleString()}</span>
                             </div>
                             <div className="flex justify-between items-center text-xs print:text-[10px]">
                                 <span className="text-slate-500">房貸支出</span>
                                 <span className="font-bold text-red-400">-${Math.round(monthlyPayment).toLocaleString()}</span>
                             </div>
                             <div className="border-t border-slate-100 pt-1 mt-1 flex justify-between items-center">
                                 <span className="font-bold text-slate-700 text-xs print:text-[10px]">淨現金流</span>
                                 <span className={`font-black text-lg print:text-sm ${isPositiveFlow ? 'text-emerald-600' : 'text-red-500'}`}>
                                     {isPositiveFlow ? '+' : ''}${Math.round(netCashFlow).toLocaleString()}
                                 </span>
                             </div>
                        </div>
                    </div>
                 )}

                 {/* 右側卡片 */}
                 {isRefinance ? (
                     // 轉增貸: 資產活化圓餅圖
                     <div className="bg-white rounded-xl border border-slate-200 p-3 print:p-2 shadow-sm flex items-center justify-between relative overflow-hidden">
                         <div className="z-10 w-[55%]">
                             <h4 className="font-bold text-slate-600 mb-1 print:text-xs">資產活化結構</h4>
                             <p className="text-[10px] text-slate-400 leading-tight mb-2">
                                 將沉睡的房屋價值喚醒，轉化為生產力資產。
                             </p>
                             <div className="space-y-1">
                                 <div className="flex items-center gap-1 text-[10px]">
                                     <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                     <span className="text-slate-500">原房貸 (負債)</span>
                                 </div>
                                 <div className="flex items-center gap-1 text-[10px]">
                                     <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                                     <span className="font-bold text-orange-600">活化資金 (資產)</span>
                                 </div>
                             </div>
                         </div>
                         <div className="w-[45%] h-[100px] print:h-[80px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={activationData} 
                                        cx="50%" cy="50%" 
                                        innerRadius={20} outerRadius={35} 
                                        paddingAngle={5} 
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {activationData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute bottom-1 right-2 text-[10px] font-bold text-orange-500 bg-orange-50 px-1 rounded">
                                活化 ${cashOutAmount} 萬
                            </div>
                         </div>
                     </div>
                 ) : (
                    // 一般模式: 槓桿效益分析
                    <div className="bg-white rounded-xl border border-slate-200 p-4 print:p-2 shadow-sm relative overflow-hidden flex flex-col justify-center">
                        <h4 className="font-bold text-slate-600 mb-2 text-center print:text-xs">槓桿套利效益 (以息養貸)</h4>
                        <div className="flex items-end justify-center gap-6 h-16 print:h-14 mt-1">
                             {/* Loan Rate Bar */}
                             <div className="w-10 bg-slate-200 rounded-t-lg relative h-1/3 flex items-end justify-center">
                                 <span className="absolute -top-4 text-slate-500 font-bold text-xs">{loanRate}%</span>
                                 <div className="text-[10px] text-slate-500 mb-0.5">成本</div>
                             </div>
                             <ArrowRight size={16} className="text-slate-300 mb-4" />
                             {/* Return Rate Bar */}
                             <div className="w-10 bg-emerald-100 rounded-t-lg relative h-full flex items-end justify-center">
                                 <div className="absolute bottom-0 w-full bg-emerald-500 rounded-t-lg" style={{height: '100%'}}></div>
                                 <span className="absolute -top-4 text-emerald-600 font-bold text-xs">{investReturnRate}%</span>
                                 <div className="relative z-10 text-[10px] text-white mb-0.5 font-bold">收益</div>
                             </div>
                        </div>
                         <div className="mt-2 text-center bg-emerald-50 rounded py-1">
                             <span className="text-[10px] text-slate-500">利差空間 </span>
                             <span className="font-bold text-emerald-600 text-sm">{(investReturnRate - loanRate).toFixed(1)}%</span>
                         </div>
                    </div>
                 )}
             </div>
      </div>

      {/* 3. 執行三部曲 (The Roadmap) - 修正上方留白 */}
      <div className="relative z-10 print-break-inside">
          <h2 className="text-lg font-bold text-slate-700 mb-3 flex items-center gap-2 print:text-sm print:mb-1.5">
              <ArrowRight size={20} className="text-emerald-600 print:w-3.5 print:h-3.5"/>
              執行藍圖 (SOP)
          </h2>
          <div className="flex flex-col md:flex-row gap-4 print:flex-row print:gap-2">
              {[
                  { step: '01', title: isRefinance ? '盤點' : '建置', desc: isRefinance ? '評估房屋增值，轉貸取出閒置資金。' : '透過低利融資取得資金，單筆投入。', icon: Building2 },
                  { step: '02', title: '持守', desc: '讓配息自動償還貸款，時間是好朋友。', icon: Lock },
                  { step: '03', title: '自由', desc: '期滿貸款清償，資產與現金流歸您所有。', icon: TrendingUp }
              ].map((item, idx) => (
                  <div key={idx} className="flex-1 bg-white p-3 pt-4 rounded-xl border border-slate-200 flex flex-col relative print:p-2 print:pt-3">
                      <div className="absolute top-2 right-2 opacity-10">
                          <item.icon size={32} className="text-emerald-600 print:w-5 print:h-5"/>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded w-fit mb-1.5">Step {item.step}</span>
                      <h4 className="font-bold text-base text-slate-700 mb-1 print:text-xs">{item.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed print:text-[10px] print:leading-tight">{item.desc}</p>
                  </div>
              ))}
          </div>
      </div>

      {/* 4. 資產成長趨勢 (圖表縮小高度) */}
      <div className="relative z-10 space-y-2 print-break-inside">
          <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2 print:text-sm">
                  <TrendingUp size={20} className="text-emerald-600 print:w-3.5 print:h-3.5"/>
                  {isRefinance ? "轉增貸效益模擬" : "資產淨值成長模擬"}
              </h2>
              <div className="text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                  {loanTerm} 年期 / {loanRate}% / {investReturnRate}%
              </div>
          </div>
          
          <div className="h-[250px] w-full border border-slate-100 rounded-xl p-3 bg-white shadow-sm print:h-[180px] print:p-1">
              <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="year" tick={{fontSize: 9}} tickLine={false} axisLine={false}/>
                      <YAxis yAxisId="left" unit="萬" tick={{fontSize: 9}} width={25} tickLine={false} axisLine={false}/>
                      <YAxis yAxisId="right" orientation="right" unit="萬" tick={{fontSize: 9}} width={25} hide />
                      <Legend wrapperStyle={{ fontSize: '9px', paddingTop: '2px' }} iconSize={8}/>
                      
                      {isRefinance ? (
                          <>
                            <Area yAxisId="left" type="monotone" name="累積節省" dataKey="累積效益" stroke="#f97316" fill="#f97316" fillOpacity={0.1} strokeWidth={2} isAnimationActive={false}/>
                            <Line yAxisId="left" type="monotone" name="貸款餘額" dataKey="剩餘貸款" stroke="#94a3b8" strokeWidth={2} dot={false} strokeDasharray="5 5" isAnimationActive={false}/>
                          </>
                      ) : (
                          <>
                            <Area yAxisId="left" type="monotone" name="總權益" dataKey="總權益" stroke="#10b981" fill="#ecfdf5" strokeWidth={2} isAnimationActive={false}/>
                            <Line yAxisId="left" type="monotone" name="貸款餘額" dataKey="剩餘貸款" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="5 5" isAnimationActive={false}/>
                          </>
                      )}
                  </ComposedChart>
              </ResponsiveContainer>
          </div>

          {/* 4.5 專案總結 (Project Summary) - 緊湊版 */}
          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 print:p-2 print:border-slate-200">
              <h4 className="text-xs font-bold text-emerald-800 mb-2 flex items-center gap-2 print:mb-1">
                  <Banknote size={14} className="print:w-3 print:h-3"/>
                  {loanTerm} 年期滿總結算
              </h4>
              <div className="flex items-center justify-between gap-2">
                  {isRefinance ? (
                      <>
                          <div className="flex-1 text-center border-r border-emerald-200 print:border-slate-300">
                              <p className="text-[10px] text-slate-500 mb-0.5">累積節省利息</p>
                              <p className="text-lg font-black text-emerald-600 print:text-xs">${Math.round(totalSavingsOverTerm/10000).toLocaleString()} 萬</p>
                          </div>
                          <div className="flex-1 text-center border-r border-emerald-200 print:border-slate-300">
                              <p className="text-[10px] text-slate-500 mb-0.5">轉貸取得現金</p>
                              <p className="text-lg font-black text-orange-500 print:text-xs">${cashOutAmount} 萬</p>
                          </div>
                          <div className="flex-1 text-center">
                              <p className="text-[10px] text-slate-500 mb-0.5">專案總效益</p>
                              <p className="text-xl font-black text-emerald-700 print:text-sm">${Math.round(totalBenefitRefinance/10000).toLocaleString()} 萬</p>
                          </div>
                      </>
                  ) : (
                      <>
                          <div className="flex-1 text-center border-r border-emerald-200 print:border-slate-300">
                              <p className="text-[10px] text-slate-500 mb-0.5">累積淨現金流</p>
                              <p className={`text-lg font-black print:text-xs ${totalNetCashFlow >= 0 ? 'text-emerald-600' : 'text-orange-500'}`}>
                                  {totalNetCashFlow >= 0 ? '+' : ''}{Math.round(totalNetCashFlow/10000).toLocaleString()} 萬
                              </p>
                          </div>
                          <div className="flex-1 text-center border-r border-emerald-200 print:border-slate-300">
                              <p className="text-[10px] text-slate-500 mb-0.5">期滿擁有資產</p>
                              <p className="text-lg font-black text-blue-600 print:text-xs">${loanAmount} 萬</p>
                          </div>
                          <div className="flex-1 text-center">
                              <p className="text-[10px] text-slate-500 mb-0.5">總身價</p>
                              <p className="text-xl font-black text-emerald-700 print:text-sm">${Math.round((totalAssetValue + totalNetCashFlow)/10000).toLocaleString()} 萬</p>
                          </div>
                      </>
                  )}
              </div>
          </div>
      </div>

      {/* 強制分頁：第三頁開始 */}
      <div className="hidden print:block break-before-page"></div>

      {/* 5. 資金防護機制 (Risk & Defense) - 第三頁 */}
      <div className="relative z-10 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm print:shadow-none print:p-4 print:border print:mt-6">
          <h3 className="font-bold text-slate-800 text-lg mb-3 flex items-center gap-2 print:text-base">
              <Lock size={20} className="text-blue-600 print:w-4 print:h-4"/> 資金流動性與安心防護
          </h3>
          <div className="flex flex-col md:flex-row gap-6 print:gap-4">
              <div className="flex-1 space-y-3 print:space-y-2">
                  <p className="text-sm text-slate-600 leading-relaxed print:text-xs">
                      本計畫運用「投資型保單」進行資產配置，兼顧了資金的流動性需求。若在計畫期間有臨時急用（如購屋頭期款、醫療週轉），無需解約即可調度資金。
                  </p>
                  <div className="flex gap-2">
                      <span className="text-xs font-bold text-white bg-blue-500 px-2 py-1 rounded print:py-0.5 print:px-1.5 print:text-[10px]">保單貸款</span>
                      <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded border border-blue-200 print:py-0.5 print:px-1.5 print:text-[10px]">緊急預備金功能</span>
                  </div>
              </div>
              <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100 text-sm space-y-2 print:p-3 print:space-y-1">
                  <div className="flex justify-between items-center">
                      <span className="text-slate-500 flex items-center gap-1 print:text-[10px]"><Banknote size={14} className="print:w-3 print:h-3"/> 最高借貸成數</span>
                      <span className="font-bold text-slate-700 print:text-xs">保單價值 50%</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-slate-500 flex items-center gap-1 print:text-[10px]"><Percent size={14} className="print:w-3 print:h-3"/> 借貸利率</span>
                      <span className="font-bold text-slate-700 print:text-xs">約 4% (浮動)</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-slate-500 flex items-center gap-1 print:text-[10px]"><Clock size={14} className="print:w-3 print:h-3"/> 還款方式</span>
                      <span className="font-bold text-slate-700 print:text-xs">彈性 (可只繳息)</span>
                  </div>
              </div>
          </div>
      </div>

      {/* 6. 升息防禦力分析 */}
      <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 print:p-4">
          <h3 className="font-bold text-emerald-800 text-lg mb-4 flex items-center gap-2 print:text-base print:mb-2">
              <ShieldCheck size={20} className="text-emerald-600 print:w-4 print:h-4"/> 升息防禦力壓力測試
          </h3>
          
          <div className="flex items-end gap-2 mb-2">
              <div className="flex-1">
                  <div className="flex justify-between text-xs text-slate-500 mb-1 print:text-[10px]">
                      <span>目前貸款利率 {loanRate}%</span>
                      <span>損益兩平點 {breakEvenRate}%</span>
                  </div>
                  <div className="w-full bg-white h-4 rounded-full overflow-hidden flex relative border border-emerald-200">
                      <div className="h-full bg-emerald-500" style={{ width: `${(loanRate / breakEvenRate) * 100}%` }}></div>
                      <div className="h-full bg-emerald-300/50" style={{ width: `${(spread / breakEvenRate) * 100}%` }}></div>
                      <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10" style={{ left: `${((loanRate + 1) / breakEvenRate) * 100}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>0%</span>
                      <span className="text-red-500 font-bold">▲ 升息1% 仍在安全範圍</span>
                      <span>{breakEvenRate}%</span>
                  </div>
              </div>
              <div className="text-right pl-4">
                  <span className="block text-xs text-slate-500 print:text-[10px]">利差安全氣囊</span>
                  <span className="font-bold text-2xl text-emerald-600 font-mono print:text-lg">{spread.toFixed(1)}%</span>
              </div>
          </div>
      </div>

      {/* 7. 顧問總結 */}
      <div className="relative z-10 bg-slate-50 p-6 rounded-2xl border-l-4 border-emerald-500 print-break-inside print:p-4">
          <div className="flex gap-4 mb-2">
               <Quote className="text-emerald-300 shrink-0" size={32} />
               <div>
                   <h3 className="font-bold text-slate-800 text-lg mb-1 print:text-base">顧問觀點</h3>
                   <p className="text-slate-600 text-sm leading-relaxed mb-1 print:text-xs">
                       「富人買資產，窮人買負債，中產階級買他們以為是資產的負債。金融房產專案，讓您用銀行的錢，買進真正的資產。」
                   </p>
               </div>
          </div>
      </div>

    </div>
  );
};

export default EstateReport;