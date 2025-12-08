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
// 子元件: 超級比一比 (Comparison Card) - 緊湊版
// ------------------------------------------------------------------
const ComparisonRow = ({ title, physical, financial, isBetter }: any) => (
    // 修改：print:py-1 縮小行距，print:text-xs 縮小字體
    <div className="grid grid-cols-3 gap-2 py-3 print:py-1 border-b border-slate-100 last:border-0 text-sm print:text-xs items-center">
        <div className="font-bold text-slate-600 flex items-center">{title}</div>
        <div className="text-center text-slate-500 flex items-center justify-center gap-1">
             {physical}
        </div>
        <div className="text-center font-bold text-emerald-600 flex items-center justify-center gap-1 bg-emerald-50 rounded-lg py-1 print:py-0.5">
             {financial} {isBetter && <CheckCircle2 size={14} className="print:w-3 print:h-3" />}
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
  
  const isRefinance = existingLoanBalance > 0 && existingLoanBalance < loanAmount;
  const cashOutAmount = isRefinance ? loanAmount - existingLoanBalance : 0;

  // 2. 核心計算
  const monthlyPayment = calculateMonthlyPayment(loanAmount, loanRate, loanTerm);
  const monthlyIncome = calculateMonthlyIncome(loanAmount, investReturnRate);
  const netCashFlow = monthlyIncome - monthlyPayment;
  const isPositiveFlow = netCashFlow >= 0;

  // 3. 圖表數據
  const generateChartData = () => {
    const dataArr = [];
    const step = Math.max(1, Math.floor(loanTerm / 15));

    for (let year = 1; year <= loanTerm; year++) {
      if (year === 1 || year % step === 0 || year === loanTerm) {
        const remainingLoan = calculateRemainingBalance(loanAmount, loanRate, loanTerm, year);
        const equity = (loanAmount * 10000) - remainingLoan;
        const cumulativeFlow = netCashFlow * 12 * year;

        dataArr.push({
            year: `${year}`,
            總資產: Math.round(loanAmount),
            剩餘貸款: Math.round(remainingLoan / 10000),
            淨值: Math.round(equity / 10000),
            累積現金流: Math.round(cumulativeFlow / 10000)
        });
      }
    }
    return dataArr;
  };
  const chartData = generateChartData();

  // 4. 壓力測試數據
  const spread = investReturnRate - loanRate;
  const breakEvenRate = investReturnRate;

  // LOGO 設定
  const LOGO_URL = "/logo.png";

  return (
    // 修改：print:space-y-4 讓整體更緊湊
    <div className="font-sans text-slate-800 space-y-8 print:space-y-4 relative">
      
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
      <div className="relative z-10 flex items-center justify-between border-b-2 border-emerald-100 pb-6 print:pb-2 print-break-inside bg-white/50 backdrop-blur-sm">
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
      {/* 修改：print:p-3 縮小內距 */}
      <div className="relative z-10 bg-slate-50 rounded-3xl p-8 border border-slate-200 print-break-inside print:p-3">
          <div className="flex items-center justify-between mb-6 print:mb-2">
              <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2 print:text-base">
                  <Scale size={24} className="text-emerald-500 print:w-4 print:h-4"/>
                  投資模式超級比一比
              </h2>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded print:py-0 print:text-[10px]">
                  為什麼選擇金融房產？
              </span>
          </div>

          {/* 修改：print:gap-3 縮小左右卡片間距 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:gap-3">
              {/* 左側：傳統房東 */}
              {/* 修改：print:p-2 縮小卡片內距 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 print:p-2 opacity-80 grayscale-[0.3]">
                  <div className="flex items-center gap-2 mb-4 print:mb-2 border-b border-slate-100 pb-2">
                      <Building2 className="text-slate-400 print:w-4 print:h-4" size={20}/>
                      <h3 className="font-bold text-slate-600 print:text-sm">傳統實體房產</h3>
                  </div>
                  <div className="space-y-1">
                      <ComparisonRow title="自備頭期" physical="20% - 30%" financial="--" />
                      <ComparisonRow title="管理維護" physical="修繕、找房客" financial="--" />
                      <ComparisonRow title="變現速度" physical="3個月 - 半年" financial="--" />
                      <ComparisonRow title="交易成本" physical="仲介費、稅金" financial="--" />
                      <div className="mt-4 print:mt-1 text-center text-xs text-slate-400 font-medium print:text-[10px]">
                          <XCircle size={14} className="inline mr-1 text-red-400 print:w-3 print:h-3"/> 
                          資產重、流動性差、心力消耗大
                      </div>
                  </div>
              </div>

              {/* 右側：數位包租公 */}
              {/* 修改：print:p-2 縮小卡片內距 */}
              <div className="bg-white p-5 rounded-2xl border-2 border-emerald-500 shadow-xl print:shadow-none print:p-2 relative overflow-hidden print:border">
                   <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] px-2 py-1 rounded-bl-lg font-bold print:py-0 print:px-1">Recommended</div>
                  <div className="flex items-center gap-2 mb-4 print:mb-2 border-b border-emerald-100 pb-2">
                      <Landmark className="text-emerald-600 print:w-4 print:h-4" size={20}/>
                      <h3 className="font-bold text-emerald-700 print:text-sm">金融房產 (本專案)</h3>
                  </div>
                  <div className="space-y-1">
                      <ComparisonRow title="自備頭期" physical="--" financial="0% (全額融資)" isBetter={true} />
                      <ComparisonRow title="管理維護" physical="--" financial="0 (全自動)" isBetter={true} />
                      <ComparisonRow title="變現速度" physical="--" financial="T+3 (三天)" isBetter={true} />
                      <ComparisonRow title="交易成本" physical="--" financial="極低 (手續費)" isBetter={true} />
                      <div className="mt-4 print:mt-1 text-center text-xs text-emerald-600 font-bold bg-emerald-50 py-1 rounded print:py-0.5 print:text-[10px]">
                          <CheckCircle2 size={14} className="inline mr-1 print:w-3 print:h-3"/> 
                          輕資產、高流動、被動收入
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* 3. 執行三部曲 (The Roadmap) */}
      <div className="relative z-10 print-break-inside">
          <h2 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2 print:text-lg print:mb-2">
              <ArrowRight size={24} className="text-emerald-600 print:w-5 print:h-5"/>
              執行藍圖 (SOP)
          </h2>
          <div className="flex flex-col md:flex-row gap-4 print:flex-row print:gap-2">
              {[
                  { step: '01', title: isRefinance ? '盤點' : '建置', desc: isRefinance ? '評估房屋增值空間，轉貸取出閒置資金。' : '透過低利融資取得大筆資金，單筆投入。', icon: Building2 },
                  { step: '02', title: '持守', desc: '讓配息自動償還貸款本息。時間是最好的朋友。', icon: Lock },
                  { step: '03', title: '自由', desc: '期滿後貸款清償，資產與現金流全數歸您所有。', icon: TrendingUp }
              ].map((item, idx) => (
                  <div key={idx} className="flex-1 bg-white p-4 rounded-xl border border-slate-200 flex flex-col relative print:p-2">
                      <div className="absolute top-4 right-4 opacity-10 print:top-2 print:right-2">
                          <item.icon size={40} className="text-emerald-600 print:w-6 print:h-6"/>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded w-fit mb-2 print:mb-1 print:text-[10px] print:py-0">Step {item.step}</span>
                      <h4 className="font-bold text-lg text-slate-700 mb-1 print:text-sm">{item.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed print:text-[10px]">{item.desc}</p>
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
              <div className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded print:text-[10px]">
                  {loanTerm} 年期 / 利率 {loanRate}% / 報酬 {investReturnRate}%
              </div>
          </div>
          
          {/* 修改：高度設為 220px 確保擠進第二頁 */}
          <div className="h-[300px] w-full border border-slate-100 rounded-2xl p-4 bg-white shadow-sm print:h-[220px] print:p-2">
              <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="year" tick={{fontSize: 10}} label={{ value: '年度', position: 'insideBottomRight', offset: -5, fontSize: 10 }} />
                      <YAxis yAxisId="left" unit="萬" tick={{fontSize: 10}} width={30} />
                      <YAxis yAxisId="right" orientation="right" unit="萬" tick={{fontSize: 10}} width={30} hide />
                      <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }}/>
                      
                      <Area yAxisId="left" type="monotone" dataKey="總資產" stroke="#10b981" fill="#ecfdf5" strokeWidth={2} isAnimationActive={false}/>
                      <Line yAxisId="left" type="monotone" dataKey="剩餘貸款" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="5 5" isAnimationActive={false}/>
                      <Bar yAxisId="left" dataKey="淨值" fill="#3b82f6" barSize={10} radius={[2,2,0,0]} isAnimationActive={false}/>
                  </ComposedChart>
              </ResponsiveContainer>
          </div>
          
          {/* 現金流提示 */}
          <div className="flex gap-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 print:mt-2 print:p-2 print:text-[10px]">
              <div className="flex-1 text-center border-r border-slate-200">
                  <span className="block text-slate-400 mb-1">每月房貸支出</span>
                  <span className="font-bold text-red-500 text-lg print:text-sm">-${Math.round(monthlyPayment).toLocaleString()}</span>
