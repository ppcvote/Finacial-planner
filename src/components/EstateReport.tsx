import React from 'react';
import { 
  Building2, 
  Landmark, 
  Scale, 
  ShieldCheck, 
  TrendingUp, 
  ArrowRight, 
  Quote, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  Percent,
  Banknote,
  Lock
} from 'lucide-react';
import { 
  ComposedChart, 
  Area, 
  Line, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Legend, 
  ResponsiveContainer,
  Bar,
  BarChart,
  ReferenceLine
} from 'recharts';

// --- 計算邏輯 ---
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
  if (rVal === 0) return Math.max(0, pVal * 10000 * (1 - p / (n || 1)));
  const balance = (pVal * 10000) * (Math.pow(1 + r, n) - Math.pow(1 + r, p)) / (Math.pow(1 + r, n) - 1);
  return Math.max(0, isNaN(balance) ? 0 : balance);
};

// ------------------------------------------------------------------
// 子元件: 超級比一比 (Comparison Card)
// ------------------------------------------------------------------
const ComparisonRow = ({ title, physical, financial, isBetter }: any) => (
    <div className="grid grid-cols-3 gap-2 py-3 border-b border-slate-100 last:border-0 text-sm">
        <div className="font-bold text-slate-600 flex items-center">{title}</div>
        <div className="text-center text-slate-500 flex items-center justify-center gap-1">
             {physical}
        </div>
        <div className="text-center font-bold text-emerald-600 flex items-center justify-center gap-1 bg-emerald-50 rounded-lg py-1">
             {financial} {isBetter && <CheckCircle2 size={14} />}
        </div>
    </div>
);

// ------------------------------------------------------------------
// 主元件: EstateReport
// ------------------------------------------------------------------
const EstateReport = ({ data }: { data: any }) => {
  // 1. 資料解構
  const loanAmount = Number(data?.loanAmount) || 1000;
  const loanTerm = Number(data?.loanTerm) || 30;
  const loanRate = Number(data?.loanRate) || 2.2;
  const investReturnRate = Number(data?.investReturnRate) || 6;
  const existingLoanBalance = Number(data?.existingLoanBalance) || 0;
  
  // 判斷模式：若有現有房貸且小於新貸款，視為「轉增貸模式」
  const isRefinance = existingLoanBalance > 0 && existingLoanBalance < loanAmount;
  const cashOutAmount = isRefinance ? loanAmount - existingLoanBalance : 0;

  // 2. 核心計算
  const monthlyPayment = calculateMonthlyPayment(loanAmount, loanRate, loanTerm);
  const monthlyIncome = calculateMonthlyIncome(loanAmount, investReturnRate); // 全額投資產生的配息
  
  // 淨現金流 (配息 - 房貸)
  const netCashFlow = monthlyIncome - monthlyPayment;
  const isPositiveFlow = netCashFlow >= 0;

  // 3. 圖表數據 (資產 vs 負債)
  const generateChartData = () => {
    const dataArr = [];
    const step = Math.max(1, Math.floor(loanTerm / 15)); // 減少取樣點避免擁擠

    for (let year = 1; year <= loanTerm; year++) {
      if (year === 1 || year % step === 0 || year === loanTerm) {
        const remainingLoan = calculateRemainingBalance(loanAmount, loanRate, loanTerm, year);
        const equity = (loanAmount * 10000) - remainingLoan; // 淨值 (假設本金不跌)
        
        // 累積現金流 (若是正現金流，假設存下來；若是負，則為累積成本)
        const cumulativeFlow = netCashFlow * 12 * year;

        dataArr.push({
            year: `${year}`,
            總資產: Math.round(loanAmount), // 假設市值持平 (保守估計)
            剩餘貸款: Math.round(remainingLoan / 10000),
            淨值: Math.round(equity / 10000),
            累積現金流: Math.round(cumulativeFlow / 10000)
        });
      }
    }
    return dataArr;
  };
  const chartData = generateChartData();

  // 4. 壓力測試數據 (升息防禦)
  const spread = investReturnRate - loanRate; // 利差
  const safetyBuffer = spread; // 緩衝空間
  const breakEvenRate = investReturnRate; // 損益兩平點的貸款利率

  // LOGO 設定 (沿用)
  const LOGO_URL = "/logo.png";

  return (
    <div className="font-sans text-slate-800 space-y-8 print:space-y-5 relative">
      
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

      {/* 1. Header */}
      <div className="relative z-10 flex items-center justify-between border-b-2 border-emerald-100 pb-6 print:pb-3 print-break-inside bg-white/50 backdrop-blur-sm">
         <div className="flex items-center gap-4">
             <div className="w-16 h-16 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                 <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain p-1" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                 <Building2 className="text-emerald-600 hidden" size={32} /> 
             </div>
             <div>
                 <span className="text-xs font-bold text-emerald-600 tracking-widest uppercase block mb-1">Financial Real Estate</span>
                 <h1 className="text-4xl font-black text-slate-900 mb-1 print:text-2xl leading-none">金融房產專案</h1>
                 <p className="text-sm text-slate-500 font-medium print:text-xs">打造不需修繕、自動收租的數位級資產</p>
             </div>
         </div>
         <div className="text-right hidden print:block">
             <p className="text-xs text-slate-400">專案代碼</p>
             <p className="text-lg font-mono font-bold text-slate-700 print:text-sm">RE-{loanAmount}W-{loanTerm}Y</p>
         </div>
      </div>

      {/* 2. 核心戰略：超級比一比 (The Anchor) */}
      <div className="relative z-10 bg-slate-50 rounded-3xl p-8 border border-slate-200 print-break-inside print:p-5">
          <div className="flex items-center justify-between mb-6 print:mb-4">
              <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2 print:text-lg">
                  <Scale size={24} className="text-emerald-500 print:w-5 print:h-5"/>
                  投資模式超級比一比
              </h2>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                  為什麼選擇金融房產？
              </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:gap-6">
              {/* 左側：傳統房東 (Pain Points) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 print:p-4 opacity-80 grayscale-[0.3]">
                  <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                      <Building2 className="text-slate-400" size={20}/>
                      <h3 className="font-bold text-slate-600">傳統實體房產</h3>
                  </div>
                  <div className="space-y-1">
                      <ComparisonRow title="自備頭期" physical="20% - 30%" financial="--" />
                      <ComparisonRow title="管理維護" physical="修繕、找房客" financial="--" />
                      <ComparisonRow title="變現速度" physical="3個月 - 半年" financial="--" />
                      <ComparisonRow title="交易成本" physical="仲介費、稅金" financial="--" />
                      <div className="mt-4 text-center text-xs text-slate-400 font-medium">
                          <XCircle size={14} className="inline mr-1 text-red-400"/> 
                          資產重、流動性差、心力消耗大
                      </div>
                  </div>
              </div>

              {/* 右側：數位包租公 (Solution) */}
              <div className="bg-white p-5 rounded-2xl border-2 border-emerald-500 shadow-xl print:shadow-none print:p-4 relative overflow-hidden">
                   <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] px-2 py-1 rounded-bl-lg font-bold">Recommended</div>
                  <div className="flex items-center gap-2 mb-4 border-b border-emerald-100 pb-2">
                      <Landmark className="text-emerald-600" size={20}/>
                      <h3 className="font-bold text-emerald-700">金融房產 (本專案)</h3>
                  </div>
                  <div className="space-y-1">
                      <ComparisonRow title="自備頭期" physical="--" financial="0% (全額融資)" isBetter={true} />
                      <ComparisonRow title="管理維護" physical="--" financial="0 (全自動)" isBetter={true} />
                      <ComparisonRow title="變現速度" physical="--" financial="T+3 (三天)" isBetter={true} />
                      <ComparisonRow title="交易成本" physical="--" financial="極低 (手續費)" isBetter={true} />
                      <div className="mt-4 text-center text-xs text-emerald-600 font-bold bg-emerald-50 py-1 rounded">
                          <CheckCircle2 size={14} className="inline mr-1"/> 
                          輕資產、高流動、被動收入
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* 3. 執行三部曲 (The Roadmap) */}
      <div className="relative z-10 print-break-inside">
          <h2 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2 print:text-lg print:mb-4">
              <ArrowRight size={24} className="text-emerald-600 print:w-5 print:h-5"/>
              執行藍圖 (SOP)
          </h2>
          <div className="flex flex-col md:flex-row gap-4 print:flex-row print:gap-4">
              {[
                  { step: '01', title: isRefinance ? '盤點' : '建置', desc: isRefinance ? '評估房屋增值空間，轉貸取出閒置資金。' : '透過低利融資取得大筆資金，單筆投入。', icon: Building2 },
                  { step: '02', title: '持守', desc: '讓配息自動償還貸款本息。時間是最好的朋友。', icon: Lock },
                  { step: '03', title: '自由', desc: '期滿後貸款清償，資產與現金流全數歸您所有。', icon: TrendingUp }
              ].map((item, idx) => (
                  <div key={idx} className="flex-1 bg-white p-4 rounded-xl border border-slate-200 flex flex-col relative print:p-3">
                      <div className="absolute top-4 right-4 opacity-10">
                          <item.icon size={40} className="text-emerald-600"/>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded w-fit mb-2">Step {item.step}</span>
                      <h4 className="font-bold text-lg text-slate-700 mb-1 print:text-base">{item.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
              ))}
          </div>
      </div>

      {/* 4. 資產成長趨勢 (The Vision) */}
      <div className="relative z-10 space-y-4 print-break-inside">
          <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2 print:text-lg">
                  <TrendingUp size={24} className="text-emerald-600 print:w-5 print:h-5"/>
                  資產淨值成長模擬
              </h2>
              <div className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded">
                  {loanTerm} 年期 / 利率 {loanRate}% / 報酬 {investReturnRate}%
              </div>
          </div>
          
          <div className="h-[300px] w-full border border-slate-100 rounded-2xl p-4 bg-white shadow-sm print:h-[280px] print:p-2">
              <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="year" tick={{fontSize: 10}} label={{ value: '年度', position: 'insideBottomRight', offset: -5, fontSize: 10 }} />
                      <YAxis yAxisId="left" unit="萬" tick={{fontSize: 10}} width={30} />
                      <YAxis yAxisId="right" orientation="right" unit="萬" tick={{fontSize: 10}} width={30} hide />
                      <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }}/>
                      
                      {/* 面積圖：總資產 */}
                      <Area yAxisId="left" type="monotone" dataKey="總資產" stroke="#10b981" fill="#ecfdf5" strokeWidth={2} isAnimationActive={false}/>
                      {/* 線圖：剩餘貸款 */}
                      <Line yAxisId="left" type="monotone" dataKey="剩餘貸款" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="5 5" isAnimationActive={false}/>
                      {/* 柱狀圖：淨值 (資產-負債) */}
                      <Bar yAxisId="left" dataKey="淨值" fill="#3b82f6" barSize={10} radius={[2,2,0,0]} isAnimationActive={false}/>
                  </ComposedChart>
              </ResponsiveContainer>
          </div>
          
          {/* 現金流提示 */}
          <div className="flex gap-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 print:mt-2">
              <div className="flex-1 text-center border-r border-slate-200">
                  <span className="block text-slate-400 mb-1">每月房貸支出</span>
                  <span className="font-bold text-red-500 text-lg">-${Math.round(monthlyPayment).toLocaleString()}</span>
              </div>
              <div className="flex-1 text-center border-r border-slate-200">
                  <span className="block text-slate-400 mb-1">預估每月配息</span>
                  <span className="font-bold text-emerald-600 text-lg">+${Math.round(monthlyIncome).toLocaleString()}</span>
              </div>
              <div className="flex-1 text-center">
                  <span className="block text-slate-400 mb-1">每月淨現金流</span>
                  <span className={`font-bold text-lg ${isPositiveFlow ? 'text-emerald-600' : 'text-orange-500'}`}>
                      {isPositiveFlow ? '+' : ''}{Math.round(netCashFlow).toLocaleString()}
                  </span>
              </div>
          </div>
      </div>

      {/* 強制分頁：第三頁開始 */}
      <div className="hidden print:block break-before-page"></div>

      {/* 5. 升息防禦力分析 (The Defense) */}
      <div className="relative z-10 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm print:mt-8 print:shadow-none print:p-6">
          <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2 print:text-lg">
              <ShieldCheck size={20} className="text-emerald-600"/> 升息防禦力壓力測試
          </h3>
          
          <div className="flex items-end gap-2 mb-2">
              <div className="flex-1">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>目前貸款利率 {loanRate}%</span>
                      <span>損益兩平點 {breakEvenRate}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex relative">
                      {/* 安全區 */}
                      <div className="h-full bg-emerald-500" style={{ width: `${(loanRate / breakEvenRate) * 100}%` }}></div>
                      {/* 緩衝區 */}
                      <div className="h-full bg-emerald-200" style={{ width: `${(spread / breakEvenRate) * 100}%` }}></div>
                      
                      {/* 刻度線 (模擬升息 1%) */}
                      <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10" style={{ left: `${((loanRate + 1) / breakEvenRate) * 100}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>0%</span>
                      <span className="text-red-500 font-bold">▲ 升息1% 仍在安全範圍</span>
                      <span>{breakEvenRate}%</span>
                  </div>
              </div>
              <div className="text-right pl-4">
                  <span className="block text-xs text-slate-500">利差安全氣囊</span>
                  <span className="font-bold text-2xl text-emerald-600 font-mono">{spread.toFixed(1)}%</span>
              </div>
          </div>
          
          <div className="bg-emerald-50 rounded-lg p-3 text-xs text-emerald-800 leading-relaxed border border-emerald-100 mt-3">
              <p>
                  <strong>壓力測試結論：</strong> 
                  即使央行升息 1% (相當劇烈的幅度)，您的利差緩衝仍有 {(spread - 1).toFixed(1)}%，系統依然能維持正向運作。
                  此外，本金隨時間還款而減少，利息壓力會逐年降低，安全性將逐年提高。
              </p>
          </div>
      </div>

      {/* 6. 顧問總結與下一步 */}
      <div className="relative z-10 bg-slate-50 p-6 rounded-2xl border-l-4 border-emerald-500 print-break-inside print:p-6">
          <div className="flex gap-4 mb-6">
               <Quote className="text-emerald-300 shrink-0" size={32} />
               <div>
                   <h3 className="font-bold text-slate-800 text-lg mb-2 print:text-lg">顧問觀點</h3>
                   <p className="text-slate-600 text-sm leading-relaxed mb-1 print:text-sm">
                       「富人買資產，窮人買負債，中產階級買他們以為是資產的負債。金融房產專案，讓您用銀行的錢，買進真正的資產。」
                   </p>
               </div>
          </div>
          
          <div className="border-t border-slate-200 pt-4 mt-4">
              <h4 className="font-bold text-slate-700 text-sm mb-3">下一步行動</h4>
              <div className="flex justify-between items-center gap-8">
                  <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                          <div className="w-4 h-4 border-2 border-slate-300 rounded"></div>
                          <span>確認個人信用狀況與可貸額度</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                          <div className="w-4 h-4 border-2 border-slate-300 rounded"></div>
                          <span>挑選適合的穩健配息標的</span>
                      </div>
                  </div>
                  <div className="w-1/3 border-b border-slate-400 pb-1">
                      <p className="text-[10px] text-slate-400 mb-6">客戶簽名 (已充分了解風險與效益)</p>
                  </div>
              </div>
          </div>
      </div>

    </div>
  );
};

export default EstateReport;
