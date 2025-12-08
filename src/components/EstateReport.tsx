import React from 'react';
import { 
  Building2, Landmark, Scale, ShieldCheck, TrendingUp, ArrowRight, Quote, CheckCircle2,
  XCircle, AlertTriangle, Percent, Banknote, Lock, Coins, PiggyBank, Wallet, Clock
} from 'lucide-react';
import { 
  ComposedChart, Area, Line, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer, Bar
} from 'recharts';

// [修改] 引入計算核心
import { calculateEstateProject } from '../utils';

const ComparisonRow = ({ title, physical, financial, isBetter }: any) => (
    <div className="grid grid-cols-3 gap-2 py-3 print:py-1 border-b border-slate-100 last:border-0 text-sm print:text-[10px] items-center">
        <div className="font-bold text-slate-600 flex items-center">{title}</div>
        <div className="text-center text-slate-500 flex items-center justify-center gap-1">{physical}</div>
        <div className="text-center font-bold text-emerald-600 flex items-center justify-center gap-1 bg-emerald-50 rounded-lg py-1 print:py-0">
             {financial} {isBetter && <CheckCircle2 size={14} className="print:w-3 print:h-3" />}
        </div>
    </div>
);

const EstateReport = ({ data }: { data: any }) => {
  // 1. 取得計算結果 (Single Source of Truth)
  const result = calculateEstateProject(data);
  const {
      loanAmount, loanTerm, loanRate, investReturnRate, 
      isRefinance, cashOutAmount, 
      monthlyPayment, monthlyIncomeFull, netCashFlow, isPositiveFlow, 
      monthlySavings, totalSavingsOverTerm,
      totalNetCashFlow, totalBenefitRefinance, totalAssetValue, totalBenefitStandard,
      chartData, spread, breakEvenRate
  } = result;

  // LOGO 設定
  const LOGO_URL = "/logo.png";

  return (
    <div className="font-sans text-slate-800 space-y-8 print:space-y-4 relative">
      
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[50] overflow-hidden mix-blend-multiply print:fixed print:top-1/2 print:left-1/2 print:-translate-x-1/2 print:-translate-y-1/2">
          <div className="opacity-[0.08] transform -rotate-12">
              <img src={LOGO_URL} alt="Watermark" className="w-[500px] h-auto grayscale object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
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

      {/* 2. 核心戰略：超級比一比 */}
      <div className="relative z-10 bg-slate-50 rounded-3xl p-8 border border-slate-200 print-break-inside print:p-2">
          <div className="flex items-center justify-between mb-6 print:mb-1">
              <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2 print:text-base">
                  <Scale size={24} className="text-emerald-500 print:w-4 print:h-4"/>
                  投資模式超級比一比
              </h2>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded print:py-0 print:text-[10px]">
                  為什麼選擇金融房產？
              </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:gap-2 print:grid-cols-2">
              {/* 左側：傳統房東 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 print:p-2 opacity-80 grayscale-[0.3]">
                  <div className="flex items-center gap-2 mb-4 print:mb-1 border-b border-slate-100 pb-2">
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
              <div className="bg-white p-5 rounded-2xl border-2 border-emerald-500 shadow-xl print:shadow-none print:p-2 relative overflow-hidden print:border">
                   <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] px-2 py-1 rounded-bl-lg font-bold print:py-0 print:px-1">Recommended</div>
                  <div className="flex items-center gap-2 mb-4 print:mb-1 border-b border-emerald-100 pb-2">
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
          <h2 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2 print:text-base print:mb-2">
              <ArrowRight size={24} className="text-emerald-600 print:w-4 print:h-4"/>
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

      {/* 4. 資產成長趨勢 (The Vision) 與 專案總結 */}
      <div className="relative z-10 space-y-4 print-break-inside">
          <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2 print:text-base">
                  <TrendingUp size={24} className="text-emerald-600 print:w-4 print:h-4"/>
                  {isRefinance ? "轉增貸效益模擬" : "資產淨值成長模擬"}
              </h2>
              <div className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded print:text-[10px]">
                  {loanTerm} 年期 / 利率 {loanRate}% / 報酬 {investReturnRate}%
              </div>
          </div>
          
          <div className="h-[300px] w-full border border-slate-100 rounded-2xl p-4 bg-white shadow-sm print:h-[220px] print:p-2">
              <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="year" tick={{fontSize: 10}} label={{ value: '年度', position: 'insideBottomRight', offset: -5, fontSize: 10 }} />
                      <YAxis yAxisId="left" unit="萬" tick={{fontSize: 10}} width={30} />
                      <YAxis yAxisId="right" orientation="right" unit="萬" tick={{fontSize: 10}} width={30} hide />
                      <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }}/>
                      
                      {isRefinance ? (
                          <>
                            <Area yAxisId="left" type="monotone" name="累積節省金額" dataKey="累積效益" stroke="#f97316" fill="#f97316" fillOpacity={0.1} strokeWidth={2} isAnimationActive={false}/>
                            <Line yAxisId="left" type="monotone" name="剩餘貸款" dataKey="剩餘貸款" stroke="#94a3b8" strokeWidth={2} dot={false} strokeDasharray="5 5" isAnimationActive={false}/>
                          </>
                      ) : (
                          <>
                            <Area yAxisId="left" type="monotone" name="總資產" dataKey="總資產" stroke="#10b981" fill="#ecfdf5" strokeWidth={2} isAnimationActive={false}/>
                            <Line yAxisId="left" type="monotone" name="剩餘貸款" dataKey="剩餘貸款" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="5 5" isAnimationActive={false}/>
                            <Bar yAxisId="left" dataKey="淨值" fill="#3b82f6" barSize={10} radius={[2,2,0,0]} isAnimationActive={false}/>
                          </>
                      )}
                  </ComposedChart>
              </ResponsiveContainer>
          </div>

          {/* 4.5 專案總結 (Project Summary) - 新增區塊 */}
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 print:p-2 print:border-slate-200">
              <h4 className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2 print:text-xs print:mb-2">
                  <Banknote size={16} className="print:w-3 print:h-3"/>
                  {loanTerm} 年期滿總結算
              </h4>
              <div className="flex items-center justify-between gap-4">
                  {isRefinance ? (
                      // 轉增貸模式總結
                      <>
                          <div className="flex-1 text-center border-r border-emerald-200 print:border-slate-300">
                              <p className="text-xs text-slate-500 mb-1 print:text-[10px]">累積節省利息</p>
                              <p className="text-xl font-black text-emerald-600 print:text-sm">${Math.round(totalSavingsOverTerm/10000).toLocaleString()} 萬</p>
                          </div>
                          <div className="flex-1 text-center border-r border-emerald-200 print:border-slate-300">
                              <p className="text-xs text-slate-500 mb-1 print:text-[10px]">轉貸取得現金</p>
                              <p className="text-xl font-black text-orange-500 print:text-sm">${cashOutAmount} 萬</p>
                          </div>
                          <div className="flex-1 text-center">
                              <p className="text-xs text-slate-500 mb-1 print:text-[10px]">專案總效益</p>
                              <p className="text-2xl font-black text-emerald-700 print:text-base">${Math.round(totalBenefitRefinance/10000).toLocaleString()} 萬</p>
                          </div>
                      </>
                  ) : (
                      // 一般模式總結
                      <>
                          <div className="flex-1 text-center border-r border-emerald-200 print:border-slate-300">
                              <p className="text-xs text-slate-500 mb-1 print:text-[10px]">累積淨領現金流</p>
                              <p className={`text-xl font-black print:text-sm ${totalNetCashFlow >= 0 ? 'text-emerald-600' : 'text-orange-500'}`}>
                                  {totalNetCashFlow >= 0 ? '+' : ''}{Math.round(totalNetCashFlow/10000).toLocaleString()} 萬
                              </p>
                          </div>
                          <div className="flex-1 text-center border-r border-emerald-200 print:border-slate-300">
                              <p className="text-xs text-slate-500 mb-1 print:text-[10px]">期滿擁有資產</p>
                              <p className="text-xl font-black text-blue-600 print:text-sm">${loanAmount} 萬</p>
                          </div>
                          <div className="flex-1 text-center">
                              <p className="text-xs text-slate-500 mb-1 print:text-[10px]">總身價 (資產+現金)</p>
                              <p className="text-2xl font-black text-emerald-700 print:text-base">${Math.round(totalBenefitStandard/10000).toLocaleString()} 萬</p>
                          </div>
                      </>
                  )}
              </div>
          </div>
      </div>

      {/* 強制分頁：第三頁開始 */}
      <div className="hidden print:block break-before-page"></div>

      {/* 5. 資金防護機制 (Risk & Defense) - 第三頁 */}
      <div className="relative z-10 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm print:shadow-none print:p-4 print:border print:mt-8">
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
          <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100 print:text-[10px] print:mt-2 print:pt-2">
              * 顧問叮嚀：從銀行借貸出來的資金在期滿前屬於槓桿部位，建議保單貸款功能僅作為「緊急預備金」使用，確保計畫完整執行。
          </p>
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
          <div className="bg-emerald-100/50 rounded-lg p-3 text-xs text-emerald-800 leading-relaxed border border-emerald-100 mt-3 print:mt-2">
              <p>
                  <strong>壓力測試結論：</strong> 
                  即使央行升息 1% (相當劇烈的幅度)，您的利差緩衝仍有 {(spread - 1).toFixed(1)}%，系統依然能維持正向運作。
                  此外，本金隨時間還款而減少，利息壓力會逐年降低，安全性將逐年提高。
              </p>
          </div>
      </div>

      {/* 7. 顧問總結 */}
      <div className="relative z-10 bg-slate-50 p-6 rounded-2xl border-l-4 border-emerald-500 print-break-inside print:p-4">
          <div className="flex gap-4 mb-6">
               <Quote className="text-emerald-300 shrink-0" size={32} />
               <div>
                   <h3 className="font-bold text-slate-800 text-lg mb-2 print:text-base">顧問觀點</h3>
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
