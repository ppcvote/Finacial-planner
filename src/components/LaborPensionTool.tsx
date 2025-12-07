import React, { useState, useMemo } from 'react';
import { 
  Umbrella, 
  Calculator, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Smile, 
  Frown, 
  CheckCircle2, 
  ArrowRight,
  PiggyBank,
  ShieldCheck,
  Landmark,
  Coins
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ReferenceLine, Cell } from 'recharts';

export const LaborPensionTool = ({ data, setData }: any) => {
  const safeData = {
    currentAge: Number(data?.currentAge) || 30,
    retireAge: Number(data?.retireAge) || 65,
    salary: Number(data?.salary) || 45000,
    laborInsYears: Number(data?.laborInsYears) || 35, 
    selfContribution: Boolean(data?.selfContribution),
    pensionReturnRate: Number(data?.pensionReturnRate) || 3, 
    desiredMonthlyIncome: Number(data?.desiredMonthlyIncome) || 60000,
    inflationRate: Number(data?.inflationRate) || 2 // 通膨率
  };
  const { currentAge, retireAge, salary, laborInsYears, selfContribution, pensionReturnRate, desiredMonthlyIncome, inflationRate } = safeData;

  // --- 計算核心 ---
  
  const calculations = useMemo(() => {
      // 1. 勞保年金 (Labor Insurance)
      // 簡單公式：最高投保薪資 * 年資 * 1.55%
      // 2024年最高投保薪資級距 45,800
      const maxLaborInsSalary = 45800;
      const laborInsBase = Math.min(Math.max(salary, 26400), maxLaborInsSalary);
      const laborInsMonthly = Math.round(laborInsBase * laborInsYears * 0.0155);

      // 2. 勞退新制 (Labor Pension)
      // 雇主提繳 6% + 自提 0~6%
      // 勞退投保薪資級距 (簡易對應：取大於薪資的最小級距，這裡簡化直接用薪資，上限15萬)
      const pensionBase = Math.min(salary, 150000);
      const contributionRate = 0.06 + (selfContribution ? 0.06 : 0);
      const monthlyContribution = Math.round(pensionBase * contributionRate);
      
      const yearsToInvest = retireAge - currentAge;
      const monthsToInvest = yearsToInvest * 12;
      const monthlyRate = pensionReturnRate / 100 / 12;
      
      // 未來值公式：PMT * [((1+r)^n - 1) / r]
      const pensionFutureValue = monthlyContribution * ((Math.pow(1 + monthlyRate, monthsToInvest) - 1) / monthlyRate);
      
      // 假設退休後餘命 20 年 (240個月) 領完
      const pensionMonthly = Math.round(pensionFutureValue / 240);

      // 3. 自提節稅效益 (簡易估算)
      // 假設稅率 5% (最保守估計)
      const annualTaxSaving = selfContribution ? Math.round(pensionBase * 0.06 * 12 * 0.05) : 0;

      // 4. 缺口計算
      const totalPension = laborInsMonthly + pensionMonthly;
      const gap = Math.max(0, desiredMonthlyIncome - totalPension);

      // 5. 延遲成本 (若晚 10 年開始補缺口)
      // 計算現在開始每月需存多少 (年報酬假設 6%)
      const investRateForGap = 0.06 / 12;
      const targetGapFund = gap * 240; // 粗略估計退休時需要的缺口總準備金 (不含通膨)
      
      // 現在開始 (n = yearsToInvest * 12)
      // PMT = FV * r / ((1+r)^n - 1)
      const monthlySaveNow = Math.round(targetGapFund * investRateForGap / (Math.pow(1 + investRateForGap, monthsToInvest) - 1));
      
      // 10年後開始 (n = (yearsToInvest - 10) * 12)
      const monthsToInvestLater = (yearsToInvest - 10) * 12;
      const monthlySaveLater = monthsToInvestLater > 0 
        ? Math.round(targetGapFund * investRateForGap / (Math.pow(1 + investRateForGap, monthsToInvestLater) - 1))
        : 0;

      return {
          laborInsMonthly,
          pensionMonthly,
          totalPension,
          gap,
          annualTaxSaving,
          monthlySaveNow,
          monthlySaveLater
      };
  }, [salary, laborInsYears, selfContribution, pensionReturnRate, currentAge, retireAge, desiredMonthlyIncome]);

  const chartData = [
    {
      name: '退休金結構',
      勞保年金: calculations.laborInsMonthly,
      勞退月領: calculations.pensionMonthly,
      財務缺口: calculations.gap,
    }
  ];

  // --- UI 更新 ---
  const updateField = (field: string, value: number) => { 
      setData({ ...safeData, [field]: value }); 
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans text-slate-800">
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden print-break-inside">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Umbrella size={180} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-sm">
              Retirement Planning
            </span>
            <span className="bg-rose-400/20 text-rose-100 px-3 py-1 rounded-full text-xs font-bold tracking-wider backdrop-blur-sm border border-rose-400/30">
              現實喚醒・補足缺口
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight flex items-center gap-3">
            退休缺口試算
          </h1>
          <p className="text-slate-300 text-lg opacity-90 max-w-2xl">
            別讓「覺得還久」成為您晚年最大的遺憾。精算三大支柱，找出潛藏的財務黑洞。
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* 左側：參數設定 */}
        <div className="lg:col-span-4 space-y-6 print-break-inside">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
              <Calculator size={20} className="text-slate-600"/> 
              個人參數
            </h4>
            <div className="space-y-6">
               
               {/* 年齡設定 */}
               <div className="grid grid-cols-2 gap-4">
                   <div>
                       <label className="text-xs font-bold text-slate-500 mb-1 block">目前年齡</label>
                       <div className="relative">
                           <input type="number" value={currentAge} onChange={(e) => updateField('currentAge', Number(e.target.value))} className="w-full p-2 border rounded-lg font-bold text-slate-700 bg-slate-50 border-slate-200" />
                           <span className="absolute right-3 top-2 text-slate-400 text-xs">歲</span>
                       </div>
                   </div>
                   <div>
                       <label className="text-xs font-bold text-slate-500 mb-1 block">預計退休</label>
                       <div className="relative">
                           <input type="number" value={retireAge} onChange={(e) => updateField('retireAge', Number(e.target.value))} className="w-full p-2 border rounded-lg font-bold text-blue-600 bg-blue-50 border-blue-200" />
                           <span className="absolute right-3 top-2 text-slate-400 text-xs">歲</span>
                       </div>
                   </div>
               </div>

               {/* 薪資與年資 */}
               <div>
                   <div className="flex justify-between items-center mb-2">
                       <label className="text-sm font-medium text-slate-600">目前月薪</label>
                       <span className="font-mono font-bold text-slate-700 text-lg">${salary.toLocaleString()}</span>
                   </div>
                   <input type="range" min={26400} max={150000} step={1000} value={salary} onChange={(e) => updateField('salary', Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg accent-slate-600" />
               </div>

               <div>
                   <div className="flex justify-between items-center mb-2">
                       <label className="text-sm font-medium text-slate-600">預計勞保年資</label>
                       <span className="font-mono font-bold text-slate-700 text-lg">{laborInsYears} 年</span>
                   </div>
                   <input type="range" min={15} max={45} step={1} value={laborInsYears} onChange={(e) => updateField('laborInsYears', Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg accent-slate-600" />
               </div>

               {/* 理想退休金 */}
               <div className="pt-4 border-t border-slate-100">
                   <div className="flex justify-between items-center mb-2">
                       <label className="text-sm font-bold text-rose-600 flex items-center gap-1"><Smile size={14}/> 理想退休月薪</label>
                       <span className="font-mono font-bold text-rose-600 text-lg">${desiredMonthlyIncome.toLocaleString()}</span>
                   </div>
                   <input type="range" min={30000} max={150000} step={2000} value={desiredMonthlyIncome} onChange={(e) => updateField('desiredMonthlyIncome', Number(e.target.value))} className="w-full h-2 bg-rose-100 rounded-lg accent-rose-500" />
               </div>

               {/* 勞退自提開關 */}
               <div className={`p-4 rounded-xl border transition-all ${selfContribution ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                      <div>
                          <span className={`block font-bold ${selfContribution ? 'text-emerald-700' : 'text-slate-600'}`}>勞退自提 6%</span>
                          <span className="text-xs text-slate-500">強迫儲蓄 + 節稅</span>
                      </div>
                      <button 
                        onClick={() => setData({ ...safeData, selfContribution: !selfContribution })} 
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${selfContribution ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${selfContribution ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                  </div>
                  {selfContribution && (
                      <div className="mt-2 text-xs text-emerald-600 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                          <CheckCircle2 size={12}/> 預估年省稅金 ${calculations.annualTaxSaving.toLocaleString()}
                      </div>
                  )}
               </div>

            </div>
          </div>
        </div>

        {/* 右側：金字塔分析 */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 金字塔圖表 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[450px] print-break-inside relative flex flex-col md:flex-row gap-6">
             {/* Chart Area */}
             <div className="flex-1 h-full relative">
                <div className="flex justify-between items-center mb-4 pl-2 border-l-4 border-rose-500">
                    <h4 className="font-bold text-slate-700">退休金結構金字塔</h4>
                    <span className="text-xs text-slate-400">單位：新台幣/月</span>
                </div>
                <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={false} axisLine={false} />
                        <YAxis unit="元" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                        <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}}
                            formatter={(value: number) => `$${value.toLocaleString()}`}
                        />
                        <Legend />
                        <ReferenceLine y={desiredMonthlyIncome} stroke="#e11d48" strokeDasharray="3 3" label={{ position: 'right', value: '理想目標', fill: '#e11d48', fontSize: 12, fontWeight: 'bold' }} />
                        
                        {/* Stacked Bars simulating a Pyramid hierarchy */}
                        <Bar dataKey="財務缺口" stackId="a" fill="#f43f5e" barSize={80} name="缺口 (需自行準備)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="勞退月領" stackId="a" fill={selfContribution ? "#10b981" : "#3b82f6"} barSize={100} name={selfContribution ? "勞退 (含自提)" : "勞退 (僅雇主)"} />
                        <Bar dataKey="勞保年金" stackId="a" fill="#94a3b8" barSize={120} name="勞保年金 (基礎)" radius={[0, 0, 4, 4]} />
                    </BarChart>
                </ResponsiveContainer>
             </div>

             {/* Info Column */}
             <div className="md:w-1/3 flex flex-col justify-center space-y-4">
                 
                 {/* Gap Card */}
                 <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 text-center animate-pulse-soft">
                     <div className="flex items-center justify-center gap-2 mb-1">
                         <AlertTriangle size={18} className="text-rose-500"/>
                         <span className="text-sm font-bold text-rose-800">每月缺口</span>
                     </div>
                     <p className="text-3xl font-black text-rose-600 font-mono">
                         ${calculations.gap.toLocaleString()}
                     </p>
                     <p className="text-xs text-rose-400 mt-2">不補足只能「生存」，無法「生活」</p>
                 </div>

                 {/* Coverage Stats */}
                 <div className="space-y-2">
                     <div className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded-lg">
                         <span className="text-slate-500">政府給付總和</span>
                         <span className="font-bold text-slate-700">${calculations.totalPension.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded-lg">
                         <span className="text-slate-500">所得替代率</span>
                         <span className="font-bold text-blue-600">{Math.round(calculations.totalPension / salary * 100)}%</span>
                     </div>
                 </div>

             </div>
          </div>

          {/* 生活品質預覽 (Lifestyle Preview) */}
          <div className="grid md:grid-cols-2 gap-6">
              {/* 現狀 */}
              <div className="bg-slate-100 rounded-2xl p-5 border border-slate-200 opacity-70 grayscale hover:grayscale-0 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                      <div className="bg-slate-300 text-white px-2 py-1 rounded text-xs font-bold">現狀預估</div>
                      <Frown size={32} className="text-slate-400"/>
                  </div>
                  <p className="text-2xl font-bold text-slate-600 mb-1">${calculations.totalPension.toLocaleString()} <span className="text-sm font-normal">/月</span></p>
                  <p className="text-sm text-slate-500 font-bold mb-4">勉強溫飽型</p>
                  <ul className="text-xs text-slate-500 space-y-2">
                      <li className="flex gap-2"><span className="text-slate-400">●</span> 僅能應付基本食宿開銷</li>
                      <li className="flex gap-2"><span className="text-slate-400">●</span> 生病需依賴子女或政府補助</li>
                      <li className="flex gap-2"><span className="text-slate-400">●</span> 無法負擔旅遊或休閒娛樂</li>
                  </ul>
              </div>

              {/* 理想 */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100 shadow-md">
                  <div className="flex justify-between items-start mb-4">
                      <div className="bg-emerald-500 text-white px-2 py-1 rounded text-xs font-bold">理想目標</div>
                      <Smile size={32} className="text-emerald-500"/>
                  </div>
                  <p className="text-2xl font-bold text-emerald-700 mb-1">${desiredMonthlyIncome.toLocaleString()} <span className="text-sm font-normal">/月</span></p>
                  <p className="text-sm text-emerald-600 font-bold mb-4">尊嚴享樂型</p>
                  <ul className="text-xs text-emerald-700/80 space-y-2">
                      <li className="flex gap-2"><CheckCircle2 size={14} className="text-emerald-500"/> 飲食自由，偶爾享受大餐</li>
                      <li className="flex gap-2"><CheckCircle2 size={14} className="text-emerald-500"/> 每年一次國外旅遊</li>
                      <li className="flex gap-2"><CheckCircle2 size={14} className="text-emerald-500"/> 擁有高品質醫療照護能力</li>
                  </ul>
              </div>
          </div>

        </div>
      </div>
      
      {/* 底部策略區：延遲成本與總結 */}
      <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-slate-200 print-break-inside">
        
        {/* 1. 延遲成本 (急迫性) */}
        <div className="space-y-4 lg:col-span-1">
          <div className="flex items-center gap-2 mb-2">
             <Clock className="text-rose-500" size={24} />
             <h3 className="text-xl font-bold text-slate-800">時間就是金錢：延遲成本分析</h3>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="text-sm text-slate-500 mb-4">為了補足 <strong>${calculations.gap.toLocaleString()}</strong> 的缺口，您需要每月投資：</p>
              
              <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1">
                      <div className="text-xs text-emerald-600 font-bold mb-1">現在開始</div>
                      <div className="h-10 bg-emerald-100 rounded-lg flex items-center px-3 border border-emerald-200">
                          <span className="font-mono font-bold text-emerald-700 text-lg">${calculations.monthlySaveNow.toLocaleString()}</span>
                      </div>
                  </div>
                  <ArrowRight className="text-slate-300" />
                  <div className="flex-1">
                      <div className="text-xs text-rose-500 font-bold mb-1">拖延 10 年</div>
                      <div className="h-10 bg-rose-100 rounded-lg flex items-center px-3 border border-rose-200">
                          <span className="font-mono font-bold text-rose-700 text-lg">${calculations.monthlySaveLater.toLocaleString()}</span>
                      </div>
                  </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <p className="text-slate-700 text-sm font-bold">
                      您的猶豫，讓負擔加重了 <span className="text-rose-600">{Math.round(calculations.monthlySaveLater / calculations.monthlySaveNow * 100 / 100)} 倍</span>
                  </p>
              </div>
          </div>
          
          <div className="mt-4 p-4 bg-slate-800 rounded-xl text-center shadow-lg">
             <p className="text-slate-300 italic text-sm">
               「退休規劃就像種樹，最好的時間是20年前，其次是現在。別讓未來的你，討厭現在不努力的自己。」
             </p>
           </div>
        </div>

        {/* 2. 行動方案 */}
        <div className="space-y-4 lg:col-span-1">
           <div className="flex items-center gap-2 mb-2">
             <ShieldCheck className="text-emerald-600" size={24} />
             <h3 className="text-xl font-bold text-slate-800">退休救援三部曲</h3>
           </div>
           
           <div className="grid grid-cols-1 gap-3">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-blue-300 transition-colors cursor-pointer" onClick={() => setData({ ...safeData, selfContribution: true })}>
                  <div className="mt-1 min-w-[2rem] h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">1</div>
                  <div>
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">啟動自提 <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">最無痛</span></h4>
                    <p className="text-sm text-slate-600 mt-1">立即向公司申請勞退自提 6%，強迫儲蓄兼節稅，直接墊高金字塔中層基礎。</p>
                  </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-rose-300 transition-colors">
                  <div className="mt-1 min-w-[2rem] h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs">2</div>
                  <div>
                    <h4 className="font-bold text-slate-800">精算缺口</h4>
                    <p className="text-sm text-slate-600 mt-1">面對現實，找出每月需補足的金額（如左表所示），設立專款專用的退休帳戶。</p>
                  </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-emerald-300 transition-colors">
                  <div className="mt-1 min-w-[2rem] h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">3</div>
                  <div>
                    <h4 className="font-bold text-slate-800">積極投資</h4>
                    <p className="text-sm text-slate-600 mt-1">退休金是長跑，利用「時間複利」將每月投入放大。搭配大小水庫專案，打造永續現金流。</p>
                  </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};