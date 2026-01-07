import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, TrendingUp, Activity, Clock, Bed, Users, Info, BarChart3,
  User, Siren, FileText, Coins, ArrowRight, TrendingDown, RefreshCcw,
  ShieldAlert, Banknote, Umbrella, AlertOctagon, HeartPulse, Flame, Zap, ShieldCheck, Microscope, 
  Stethoscope, BarChart, Gem, Target, Crosshair
} from 'lucide-react';
import { 
  ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, Bar, Cell, Area, PieChart, Pie, Sector 
} from 'recharts';

/**
 * 🚀 Ultra Advisor - 2026 市場數據戰情室 (War Room 2.0)
 * 數據來源：2026 衛福部精算報告、114年勞保精算報告、各大醫學中心 2026 自費標準
 */

export default function MarketWarRoom2026() {
  // --- 全域互動狀態 ---
  const [activeTab, setActiveTab] = useState('inflation'); 
  const [age, setAge] = useState(40); 
  const [gender, setGender] = useState<'male'|'female'>('male');

  // ==========================================
  // 1. 癌症時鐘 (2026 校正版：3分48秒)
  // ==========================================
  // 228 秒一人，每小時 15.8 人，每日 379 人
  const cancerClockSeconds = 228; 
  const [cancerTarget, setCancerTarget] = useState('immune'); // targeted | immune | proton

  const cancerPricing = {
    targeted: { name: '標靶藥物', cost: 1800000, desc: '對應特定基因，每月支出約 15-20 萬', coverage: '自費比 85%' },
    immune: { name: '免疫療法', cost: 3500000, desc: '2026 最新療程，單次注射 15-25 萬', coverage: '全自費佔多數' },
    proton: { name: '質子/重粒子', cost: 1000000, desc: '精準爆破腫瘤，單一療程自費約 100 萬', coverage: '健保不給付' }
  };

  // ==========================================
  // 2. 不健康餘命 (邏輯修正：動態聯動模型)
  // ==========================================
  // 修正點：必須讓客戶看到「健康正在流逝」
  const unhealthyMetrics = useMemo(() => {
    const lifeExpectancy = gender === 'male' ? 77.2 : 84.1;
    const unhealthyYears = gender === 'male' ? 7.6 : 8.9; // 女性失能期較長
    const healthyLifeTotal = lifeExpectancy - unhealthyYears;
    
    return {
      lifeExpectancy,
      unhealthyYears,
      healthyLifeTotal,
      passed: age,
      remainingHealthy: Math.max(0, healthyLifeTotal - age),
      isRiskStage: age >= healthyLifeTotal
    };
  }, [age, gender]);

  const lifeProgressData = [
    {
      name: 'Life Path',
      '已過歲月': unhealthyMetrics.passed,
      '剩餘健康': unhealthyMetrics.remainingHealthy,
      '失能/臥床': unhealthyMetrics.unhealthyYears
    }
  ];

  // ==========================================
  // 3. 通膨碎鈔機 (2026 高通膨模型)
  // ==========================================
  const [inflationAmt, setInflationAmt] = useState(1000); // 萬
  const [inflationPeriod, setInflationPeriod] = useState(25);
  const [cpiRate, setCpiRate] = useState(3.5); // 2026 體感基準

  const futureValue = Math.round(inflationAmt / Math.pow(1 + cpiRate/100, inflationPeriod));
  const lostWealth = inflationAmt - futureValue;
  const lostRatio = ((lostWealth / inflationAmt) * 100).toFixed(1);

  // ==========================================
  // 4. 勞保破產赤字 (2024-2031 實際走勢)
  // ==========================================
  const pensionData = [
    { year: '2022', deficit: 386, subsidy: 300 },
    { year: '2023', deficit: 446, subsidy: 450 },
    { year: '2024', deficit: 665, subsidy: 1200 },
    { year: '2025', deficit: 820, subsidy: 1300 },
    { year: '2026', deficit: 1080, subsidy: 1500 }, // 2026 正式破千億
    { year: '2028', deficit: 1450, subsidy: 1800 },
  ];
  const countdownYears = 2031 - 2026;

  // ==========================================
  // 5. 2026 醫療通膨住院模型
  // ==========================================
  const [days, setDays] = useState(10);
  const [careMode, setCareMode] = useState('pro'); // family | migrant | pro

  const rates2026 = {
    room: 8500, // 醫學中心單人房中位數
    nursing: careMode === 'pro' ? 3800 : (careMode === 'migrant' ? 1200 : 0),
    salaryLoss: 2500
  };
  const finalMedicalLoss = (rates2026.room + rates2026.nursing + rates2026.salaryLoss) * days;

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans pb-32 animate-in fade-in duration-1000">
      
      {/* 🔴 Section 1: 頂部戰略 Header (2026 版本) */}
      <div className="bg-[#020617] rounded-[3.5rem] p-12 md:p-16 text-white shadow-2xl relative overflow-hidden border-b-8 border-cyan-500">
        <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 pointer-events-none">
          <Activity size={500} />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 bg-cyan-500/10 border border-cyan-500/20 px-6 py-2 rounded-full">
                <Siren size={18} className="text-cyan-400 animate-pulse" />
                <span className="text-cyan-400 text-sm font-black tracking-[0.3em] uppercase">2026 Intelligent War Room</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-tight">
                市場數據<span className="text-cyan-500">戰情室</span>
              </h1>
              <p className="text-slate-400 text-2xl max-w-3xl font-medium leading-relaxed">
                這是 2026 年最殘酷的真相：<br/>
                <span className="text-white">技術延長了壽命，但財務卻跟不上生命凋零的速度。</span>
              </p>
            </div>

            {/* 客戶核心參數：決定全場數據邏輯 */}
            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[3rem] w-full lg:w-[480px] shadow-inner">
              <div className="flex justify-between items-center mb-8">
                 <span className="text-cyan-400 font-black text-sm uppercase tracking-[0.2em] flex items-center gap-3">
                    <User size={22}/> Client DNA
                 </span>
                 <div className="flex bg-slate-800 rounded-2xl p-1.5 border border-white/5">
                    <button onClick={()=>setGender('male')} className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${gender==='male'?'bg-blue-600 text-white shadow-lg':'text-slate-500 hover:text-slate-300'}`}>男性</button>
                    <button onClick={()=>setGender('female')} className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${gender==='female'?'bg-rose-600 text-white shadow-lg':'text-slate-500 hover:text-slate-300'}`}>女性</button>
                 </div>
              </div>
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-slate-500 text-xs font-black uppercase tracking-widest">Global Age Parameter</span>
                  <span className="text-6xl font-black font-mono text-white tracking-tighter leading-none">{age} <small className="text-xl text-slate-500 font-bold uppercase ml-2">Yrs</small></span>
                </div>
                <input 
                  type="range" min={20} max={75} step={1} value={age} 
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full h-4 bg-slate-700 rounded-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-black uppercase tracking-tighter">
                   <span>Youth Stage</span>
                   <span>Critical Risk Zone</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔵 Section 2: 分頁策略切換 (Tabs) */}
      <div className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide">
        {[
          { id: 'inflation', label: '通膨碎鈔機', icon: <TrendingDown />, color: 'bg-amber-600' },
          { id: 'unhealthy', label: '不健康餘命', icon: <Bed />, color: 'bg-emerald-700' },
          { id: 'medical', label: '醫療自費現況', icon: <Microscope />, color: 'bg-blue-700' },
          { id: 'cancer', label: '癌症時鐘 3\'48"', icon: <Clock />, color: 'bg-rose-600' },
          { id: 'pension', label: '勞保崩潰報告', icon: <AlertTriangle />, color: 'bg-slate-900' },
        ].map(tab => (
          <button 
            key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-10 py-6 rounded-[2.5rem] font-black flex items-center gap-4 whitespace-nowrap transition-all shadow-md border-2 ${activeTab === tab.id ? `${tab.color} text-white border-transparent scale-105 shadow-2xl ring-4 ring-offset-4 ring-white` : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'}`}
          >
            {React.cloneElement(tab.icon as React.ReactElement, { size: 24 })} {tab.label}
          </button>
        ))}
      </div>

      {/* ⚪ Section 3: 主核心分析區 (Main Dashboard) */}
      <div className="bg-white rounded-[4.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] border border-slate-100 p-12 md:p-20 min-h-[800px] relative">
        
        {/* === TAB 1: 通膨碎鈔機 (Financial Erosion) === */}
        {activeTab === 'inflation' && (
          <div className="space-y-16 animate-in slide-in-from-bottom-12 duration-800">
             <div className="grid lg:grid-cols-2 gap-20 items-start">
                <div className="space-y-12">
                   <div className="space-y-4">
                      <div className="inline-block p-4 bg-amber-100 rounded-3xl text-amber-600 mb-2"><TrendingDown size={48}/></div>
                      <h3 className="text-5xl font-black text-slate-800 tracking-tighter">通膨：資產的「隱形消融」</h3>
                      <p className="text-slate-500 text-xl font-medium leading-relaxed">
                        在 2026 年的高息環境下，通膨不再是溫和的 2%，而是掠奪財富的利刃。
                      </p>
                   </div>

                   <div className="space-y-10 bg-amber-50/70 p-12 rounded-[3.5rem] border border-amber-100 shadow-inner">
                      <div className="space-y-4">
                         <div className="flex justify-between font-black text-slate-800">
                            <span className="flex items-center gap-2 uppercase tracking-widest text-xs">A. 現有退休本金 (萬)</span>
                            <span className="text-3xl font-mono text-amber-700">{inflationAmt} 萬</span>
                         </div>
                         <input type="range" min={100} max={5000} step={50} value={inflationAmt} onChange={(e)=>setInflationAmt(Number(e.target.value))} className="w-full h-3 bg-amber-200 rounded-full accent-amber-600 cursor-pointer" />
                      </div>
                      <div className="space-y-4">
                         <div className="flex justify-between font-black text-slate-800">
                            <span className="flex items-center gap-2 uppercase tracking-widest text-xs">B. 預計儲放年數 (Yrs)</span>
                            <span className="text-3xl font-mono text-amber-700">{inflationPeriod} 年</span>
                         </div>
                         <input type="range" min={5} max={45} step={1} value={inflationPeriod} onChange={(e)=>setInflationPeriod(Number(e.target.value))} className="w-full h-3 bg-amber-200 rounded-full accent-amber-600 cursor-pointer" />
                      </div>
                      <div className="space-y-4">
                         <div className="flex justify-between font-black text-slate-800">
                            <span className="flex items-center gap-2 uppercase tracking-widest text-xs">C. 預估複合通膨 (%)</span>
                            <span className="text-3xl font-mono text-amber-700">{cpiRate}%</span>
                         </div>
                         <input type="range" min={1.0} max={6.0} step={0.1} value={cpiRate} onChange={(e)=>setCpiRate(Number(e.target.value))} className="w-full h-3 bg-amber-200 rounded-full accent-amber-600 cursor-pointer" />
                      </div>
                   </div>
                </div>

                <div className="flex flex-col items-center justify-center space-y-12">
                   <div className="relative w-full">
                      <div className="absolute inset-0 bg-amber-500/10 blur-[100px] rounded-full"></div>
                      <div className="bg-white border-8 border-amber-50 p-16 rounded-[4.5rem] text-center shadow-2xl relative">
                         <p className="text-amber-800/40 font-black text-xs uppercase tracking-[0.4em] mb-6">Estimated Future Value</p>
                         <div className="text-[7rem] font-black text-amber-600 font-mono tracking-tighter leading-none mb-6">
                            ${futureValue}<small className="text-4xl">萬</small>
                         </div>
                         <div className="bg-rose-600 text-white py-6 px-10 rounded-[2.5rem] shadow-xl inline-flex items-center gap-5 scale-110">
                            <AlertOctagon size={32} className="animate-pulse"/>
                            <div className="text-left">
                               <p className="text-4xl font-black font-mono leading-none">-{lostWealth} 萬</p>
                               <p className="text-[10px] font-black uppercase tracking-widest opacity-70">財富購買力已蒸發 {lostRatio}%</p>
                            </div>
                         </div>
                      </div>
                   </div>
                   
                   <div className="w-full bg-slate-900 p-10 rounded-[3rem] border-l-[12px] border-amber-500 text-white relative overflow-hidden group">
                      <Banknote className="absolute right-[-20px] bottom-[-20px] text-white/5 group-hover:scale-110 transition-transform" size={150}/>
                      <h4 className="text-amber-400 font-black text-xl mb-4 flex items-center gap-3"><Info size={24}/> 專業導師提示</h4>
                      <p className="text-slate-400 text-lg leading-relaxed font-bold">
                        您存的 {inflationAmt} 萬，在 2026 時代的通膨侵蝕下，25 年後的購買力僅相當於現在的 {futureValue} 萬。
                        這是一場 **「現金與時間」** 的零和遊戲。若您的資產組合年回報低於 {cpiRate}%，
                        您並非在存錢，而是在看著您的未來購買力慢性自殺。
                      </p>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* === TAB 2: 不健康餘命 (邏輯修正版：動態 path) === */}
        {activeTab === 'unhealthy' && (
          <div className="space-y-16 animate-in slide-in-from-bottom-12 duration-800">
            <div className="flex flex-col lg:flex-row gap-20 items-center">
              <div className="flex-1 w-full space-y-12">
                <div className="space-y-4">
                  <div className="inline-block p-4 bg-emerald-100 rounded-3xl text-emerald-600"><Bed size={48}/></div>
                  <h3 className="text-5xl font-black text-slate-800 tracking-tighter italic">人生壓力路徑：長壽的代價</h3>
                  <p className="text-slate-500 text-xl font-bold">根據您目前的 {age} 歲模擬：健康倒數與失能風險。</p>
                </div>

                {/* 核心圖表：動態壓力條 */}
                <div className="h-[400px] w-full bg-slate-50 p-10 rounded-[4rem] border border-slate-100 shadow-inner relative group">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={lifeProgressData} margin={{ left: 0, right: 40 }}>
                      <XAxis type="number" hide domain={[0, 90]}/>
                      <YAxis type="category" dataKey="name" hide/>
                      <Tooltip 
                        contentStyle={{ borderRadius: '30px', border: 'none', boxShadow: '0 25px 60px rgba(0,0,0,0.2)', padding: '20px' }}
                        formatter={(val: number) => [`${val.toFixed(1)} 歲/年`]}
                      />
                      <Bar dataKey="已過歲月" stackId="p" fill="#cbd5e1" barSize={140} radius={[30, 0, 0, 30]} />
                      <Bar dataKey="剩餘健康" stackId="p" fill="#10b981" barSize={140} />
                      <Bar dataKey="失能/臥床" stackId="p" fill="#ef4444" barSize={140} radius={[0, 30, 30, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  
                  {/* 圖表刻度 */}
                  <div className="flex justify-between text-[11px] font-black text-slate-400 mt-8 px-6 uppercase tracking-[0.2em] border-t-2 border-dashed pt-8">
                    <div className="flex flex-col"><span>Start</span><span className="text-slate-800 text-sm">0歲</span></div>
                    <div className="flex flex-col text-center"><span>Passed</span><span className="text-slate-800 text-sm">{age}歲</span></div>
                    <div className="flex flex-col text-center text-emerald-600">
                      <span>Healthy End</span>
                      <span className="font-black text-lg italic">{Math.round(unhealthyMetrics.healthyEndAge)}歲</span>
                    </div>
                    <div className="flex flex-col text-right text-rose-600">
                      <span>Final Death</span>
                      <span className="font-black text-lg italic">{unhealthyMetrics.lifeExpectancy}歲</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-[450px] bg-rose-50 border-4 border-rose-100 p-14 rounded-[4.5rem] text-center shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform">
                   <ShieldAlert size={250} className="text-rose-900"/>
                </div>
                <h4 className="text-rose-900 font-black text-3xl mb-4 flex items-center justify-center gap-4">
                   <AlertTriangle size={32}/> 尊嚴的代價
                </h4>
                <p className="text-rose-700/60 text-xs font-black mb-10 uppercase tracking-[0.3em]">Total Long-term Care Cost</p>
                <div className="text-[6.5rem] font-black text-rose-600 font-mono mb-8 tracking-tighter leading-none">
                  ${Math.round(unhealthyMetrics.unhealthyYears * 12 * 6.5)}<small className="text-3xl ml-2">萬</small>
                </div>
                <div className="bg-white/80 p-8 rounded-[2.5rem] text-left border border-rose-200 backdrop-blur-sm shadow-inner relative">
                   <p className="text-sm text-slate-600 leading-relaxed font-bold italic">
                     * 基於 2026 醫療人力極度短缺行情計算，月均成本 **$65,000** (含高蛋白、耗材、24H照護)。平均臥床時間為 **{unhealthyMetrics.unhealthyYears}** 年。
                   </p>
                </div>
              </div>
            </div>
            
            {/* 動態警告 */}
            <div className={`p-10 rounded-[3rem] flex flex-col md:flex-row justify-between items-center gap-10 shadow-2xl transition-all duration-500 ${unhealthyMetrics.isRiskStage ? 'bg-rose-950 text-white' : 'bg-slate-900 text-white'}`}>
               <div className="flex items-center gap-8">
                  <div className={`p-6 rounded-[2rem] ${unhealthyMetrics.isRiskStage ? 'bg-rose-600' : 'bg-emerald-600'}`}>
                    <Zap className="text-white animate-bounce" size={40}/>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-black text-3xl">{unhealthyMetrics.isRiskStage ? '您已進入預警區！' : '及時規劃，保全資產'}</h4>
                    <p className="text-slate-400 text-lg">數據證明：2026 年的高端家庭，破產風險 70% 來自長照，而非股市波動。</p>
                  </div>
               </div>
               <button className="bg-cyan-500 text-[#020617] px-14 py-5 rounded-[2rem] font-black hover:bg-cyan-400 transition-all scale-110 shadow-xl shadow-cyan-500/30">索取專屬財務護城河報告</button>
            </div>
          </div>
        )}

        {/* === TAB 3: 醫療自費黑洞 (Surgery & Stays 2026) === */}
        {activeTab === 'medical' && (
          <div className="space-y-16 animate-in slide-in-from-left-12 duration-800">
             <div className="bg-blue-50/50 p-12 md:p-20 rounded-[5rem] border border-blue-100 flex flex-col lg:flex-row gap-20 shadow-inner">
                <div className="flex-1 space-y-12">
                  <div className="space-y-4">
                    <div className="inline-flex p-4 bg-blue-600 rounded-3xl text-white shadow-lg"><Microscope size={48}/></div>
                    <h3 className="text-5xl font-black text-blue-900 tracking-tighter leading-none">2026 隱形資產縮水</h3>
                    <p className="text-blue-800/60 font-bold text-xl">薪資中斷 + 醫療支出暴增 = 財富消融速度。</p>
                  </div>

                  <div className="space-y-12 bg-white p-14 rounded-[4rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute right-[-30px] top-[-30px] opacity-[0.03] group-hover:rotate-12 transition-transform"><Stethoscope size={250}/></div>
                    <div className="space-y-6 relative z-10">
                       <div className="flex justify-between items-end">
                          <span className="font-black text-slate-400 text-xs uppercase tracking-[0.3em]">住院/手術天數模擬</span>
                          <span className="text-5xl font-mono text-blue-600 font-black underline decoration-blue-200 decoration-8 underline-offset-[12px]">{days} 天</span>
                       </div>
                       <input type="range" min={1} max={60} value={days} onChange={(e)=>setDays(Number(e.target.value))} className="w-full h-4 bg-blue-100 rounded-full accent-blue-600 cursor-pointer" />
                    </div>

                    <div className="space-y-6 relative z-10">
                       <span className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Gem size={14}/> 照護標準設定 (Nursing Standard)</span>
                       <div className="grid grid-cols-3 gap-4">
                         {[
                           { id: 'family', n: '親屬照護', d: '身心耗竭代價' },
                           { id: 'migrant', n: '外籍看護', d: '候診期長' },
                           { id: 'pro', n: '本籍專業', d: '2026 行情 $3800' }
                         ].map(t => (
                           <button 
                            key={t.id} onClick={()=>setCareMode(t.id)} 
                            className={`p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-2 ${careMode===t.id ? 'bg-blue-600 text-white border-transparent shadow-xl scale-105':'bg-slate-50 text-slate-400 border-slate-100 hover:border-blue-400'}`}
                           >
                             <span className="font-black text-sm">{t.n}</span>
                             <span className="text-[10px] opacity-60 font-bold uppercase">{t.d}</span>
                           </button>
                         ))}
                       </div>
                    </div>
                  </div>
                </div>

                {/* 數據看板 */}
                <div className="w-full lg:w-[500px] bg-[#020617] p-16 rounded-[4.5rem] shadow-2xl flex flex-col justify-between group relative overflow-hidden border-t-8 border-blue-500">
                   <div className="space-y-10 relative z-10">
                     {[
                       { label: '單人房/負壓病房差額', val: rates2026.room, icon: <Bed/>, sub: '醫學中心 2026 標準' },
                       { label: '專業看護/特教服務費', val: rates2026.nursing, icon: <User/>, sub: '勞動力市場最新報價' },
                       { label: '每日休養薪資損失', val: rates2026.salaryLoss, icon: <TrendingDown/>, sub: '依中高階主管均薪' }
                     ].map((item, i) => (
                       <div key={i} className="flex justify-between items-center pb-8 border-b border-white/5 last:border-0 transition-transform group-hover:translate-x-3">
                          <div className="flex items-center gap-5">
                             <div className="p-4 bg-white/5 rounded-3xl text-cyan-500 shadow-inner">{item.icon}</div>
                             <div>
                                <p className="text-white font-black text-sm tracking-tight">{item.label}</p>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{item.sub}</p>
                             </div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-black text-white text-3xl tracking-tighter">${item.val.toLocaleString()}</span>
                            <p className="text-[10px] text-slate-600 font-bold uppercase">per day</p>
                          </div>
                       </div>
                     ))}
                   </div>
                   
                   <div className="mt-16 pt-12 border-t-8 border-double border-white/5 text-center relative z-10">
                      <div className="text-xs text-blue-400 font-black mb-4 uppercase tracking-[0.4em]">Total Financial Depletion</div>
                      <div className="text-[5.5rem] font-black text-rose-500 font-mono tracking-tighter leading-none">-${finalMedicalLoss.toLocaleString()}</div>
                      <div className="mt-8 inline-flex items-center gap-3 bg-rose-500/10 px-6 py-2 rounded-full border border-rose-500/20">
                         <AlertTriangle size={14} className="text-rose-500 animate-pulse"/>
                         <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest">警告：此數值尚未包含手術自費耗材</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* === TAB 4: 癌症時鐘 (3分48秒更新版) === */}
        {activeTab === 'cancer' && (
          <div className="space-y-16 animate-in slide-in-from-right-12 duration-800">
             <div className="grid lg:grid-cols-3 gap-12">
                {/* 核心時鐘：震撼視覺 */}
                <div className="bg-rose-600 p-16 rounded-[4rem] text-white relative shadow-2xl shadow-rose-200 overflow-hidden group border-b-[20px] border-rose-800">
                   <Clock className="text-white/10 absolute -right-10 -bottom-10 group-hover:rotate-45 transition-transform duration-1000" size={300}/>
                   <div className="relative z-10">
                      <h4 className="text-rose-100/60 font-black text-xs uppercase tracking-[0.4em] mb-8">Official Cancer Clock 2026</h4>
                      <div className="text-[7.5rem] font-black font-mono mb-8 tracking-tighter italic leading-none drop-shadow-2xl">3'48"</div>
                      <div className="space-y-4 border-t border-white/20 pt-8">
                         <p className="text-rose-100 text-xl font-bold leading-relaxed">
                           確診密度：<span className="text-4xl text-white font-black underline decoration-rose-400 decoration-8">15.8</span> 人 / 小時
                         </p>
                         <p className="text-rose-200/70 text-sm font-medium italic">
                           統計警告：自 2024 篩檢潮回流後，罹癌年齡層已顯著下修 4.5 歲。
                         </p>
                      </div>
                   </div>
                </div>

                {/* 精準醫療選擇區 */}
                <div className="lg:col-span-2 space-y-10 bg-slate-50 p-14 rounded-[4rem] border border-slate-100 shadow-inner">
                   <div className="flex justify-between items-center border-b border-slate-200 pb-8">
                      <h4 className="font-black text-slate-800 text-3xl tracking-tighter flex items-center gap-4">
                        <Crosshair className="text-rose-600" size={36}/> 精準醫療成本評估
                      </h4>
                      <div className="px-4 py-1.5 bg-rose-100 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">2026行情</div>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     {(Object.entries(cancerPricing) as [string, any][]).map(([key, val]) => (
                       <button 
                        key={key} onClick={() => setCancerTarget(key)}
                        className={`p-10 rounded-[3rem] border-4 transition-all text-left flex flex-col justify-between h-72 ${cancerTarget === key ? 'bg-[#020617] text-white border-rose-600 shadow-2xl scale-105' : 'bg-white border-slate-100 opacity-60 hover:opacity-100 hover:border-slate-300'}`}
                       >
                         <div className="space-y-4">
                           <div className={`text-xl font-black ${cancerTarget === key ? 'text-rose-500' : 'text-slate-800'}`}>{val.name}</div>
                           <p className={`text-xs leading-relaxed font-bold ${cancerTarget === key ? 'text-slate-400' : 'text-slate-400'}`}>{val.desc}</p>
                         </div>
                         <div className="space-y-2">
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-50">Market Price</div>
                            <div className={`text-4xl font-black font-mono ${cancerTarget === key ? 'text-white' : 'text-slate-700'}`}>${(val.cost / 10000).toFixed(0)}<small className="text-xl ml-1">萬</small></div>
                         </div>
                       </button>
                     ))}
                   </div>
                </div>
             </div>

             {/* 財富缺口視覺化 */}
             <div className="bg-[#0f172a] rounded-[5rem] p-16 text-white flex flex-col md:flex-row gap-20 items-center relative overflow-hidden shadow-2xl">
                <div className="absolute left-0 top-0 w-4 h-full bg-rose-600"></div>
                <div className="flex-1 space-y-8 relative z-10">
                  <h3 className="text-5xl font-black tracking-tighter flex items-center gap-6">
                    <Flame size={50} className="text-orange-500 animate-pulse"/> 痊癒的代價，您算過嗎？
                  </h3>
                  <p className="text-slate-400 font-bold text-2xl leading-relaxed">
                    在 2026 年，最頂尖的醫療技術並非「醫術」問題，而是「財務」問題。
                    標靶與免疫藥物的 **年漲幅達 14%**，目前的保險額度是否已淪為杯水車薪？
                  </p>
                  <div className="grid grid-cols-2 gap-10 pt-10 border-t border-white/5">
                    <div className="space-y-2">
                      <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Current Treatment Status</div>
                      <div className="text-4xl font-black text-rose-500">{cancerPricing[cancerTarget as keyof typeof cancerPricing].coverage}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Suggested Liquid Asset</div>
                      <div className="text-4xl font-black text-white">$250萬+ <small className="text-xs text-slate-500 font-bold italic">Buffer</small></div>
                    </div>
                  </div>
                </div>
                
                <div className="w-full md:w-[550px] text-center relative z-10 scale-110">
                   <div className="bg-gradient-to-br from-rose-600 to-rose-950 p-16 rounded-[4rem] shadow-2xl ring-[20px] ring-rose-500/10">
                      <div className="text-xs text-rose-100 font-black mb-6 tracking-[0.5em] uppercase opacity-60">Estimated Gap Analysis</div>
                      <div className="text-[7rem] font-black font-mono text-white tracking-tighter leading-none mb-4">
                         ${(cancerPricing[cancerTarget as keyof typeof cancerPricing].cost / 10000).toFixed(0)}<span className="text-4xl ml-2 font-black">萬</span>
                      </div>
                      <p className="text-rose-200/50 text-[11px] font-black mt-10 tracking-[0.3em] uppercase italic">Critical Financial Deficit 2026</p>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* === TAB 5: 勞保破產精算 (2031 Countdown) === */}
        {activeTab === 'pension' && (
          <div className="space-y-16 animate-in slide-in-from-bottom-12 duration-800">
             <div className="flex flex-col lg:flex-row justify-between items-end gap-16">
               <div className="flex-1 space-y-6">
                  <h3 className="text-6xl font-black text-slate-900 tracking-tighter leading-tight">勞保基金：最終倒數</h3>
                  <p className="text-slate-500 text-2xl font-medium leading-relaxed max-w-3xl">
                    2026年，勞保單年逆差預估衝破 **1,000 億** 大關。撒錢撥補已到極限。破產年份鎖定 **2031 年**。
                    如果您目前的年齡離退休還有超過 10 年，勞保將與您無關。
                  </p>
               </div>
               <div className="flex-shrink-0 text-center scale-110">
                  <div className="text-[11px] text-red-600 font-black uppercase mb-6 tracking-[0.5em] animate-pulse">The Point of No Return</div>
                  <div className="bg-red-600 text-white px-20 py-10 rounded-[4rem] shadow-[0_40px_80px_-15px_rgba(220,38,38,0.5)] border-b-[15px] border-red-800">
                    <div className="text-xs font-black opacity-80 mb-2 uppercase tracking-widest">Collapse Year</div>
                    <div className="text-[6.5rem] font-black font-mono tracking-tighter italic leading-none drop-shadow-2xl">2031</div>
                  </div>
               </div>
             </div>

             {/* 精密複合分析圖表 */}
             <div className="h-[500px] w-full bg-[#f8fafc] rounded-[5rem] p-16 border border-slate-200 shadow-inner relative overflow-hidden">
                <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-8 z-10 bg-white/80 backdrop-blur px-8 py-3 rounded-full border border-slate-100 shadow-sm">
                   <div className="flex items-center gap-2 text-rose-600 font-black text-xs uppercase"><div className="w-3 h-3 bg-rose-600 rounded-full"></div> 年度赤字缺口</div>
                   <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase"><div className="w-8 h-1 bg-blue-600 border-b-2 border-dashed"></div> 政府緊急撥補</div>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={pensionData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                    <XAxis dataKey="year" axisLine={false} tick={{fill: '#64748b', fontWeight: 'black', fontSize: 16}} dy={20}/>
                    <YAxis axisLine={false} tick={{fill: '#64748b', fontWeight: 'bold'}} unit="億" />
                    <Tooltip contentStyle={{borderRadius:'40px', border:'none', boxShadow:'0 40px 100px rgba(0,0,0,0.15)', padding:'30px'}} />
                    <Area type="monotone" dataKey="deficit" fill="#fee2e2" stroke="none" fillOpacity={0.9} />
                    <Line type="stepAfter" dataKey="deficit" stroke="#ef4444" strokeWidth={10} dot={{r: 14, fill:'#ef4444', strokeWidth:6, stroke:'white'}} activeDot={{r: 18}} />
                    <Line type="monotone" dataKey="subsidy" stroke="#2563eb" strokeWidth={5} strokeDasharray="15 15" dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
             </div>

             <div className="grid md:grid-cols-2 gap-12">
                <div className="bg-[#020617] p-16 rounded-[4rem] text-white flex items-center gap-12 shadow-2xl relative overflow-hidden group">
                   <div className="absolute right-0 top-0 w-80 h-80 bg-red-600/10 blur-[150px] transition-all group-hover:bg-red-600/30"></div>
                   <div className="bg-red-600 p-12 rounded-[2.5rem] animate-pulse shadow-2xl shadow-red-900/50 relative z-10 border-b-8 border-red-800">
                      <AlertTriangle size={64}/>
                   </div>
                   <div className="relative z-10">
                      <h4 className="font-black text-red-500 tracking-[0.4em] uppercase text-[10px] mb-4">Distance to Zero Fund</h4>
                      <div className="text-[4.5rem] font-black font-mono tracking-tighter italic leading-none">{countdownYears} <small className="text-2xl font-bold">Years</small></div>
                   </div>
                </div>
                <div className="bg-blue-800 p-16 rounded-[4rem] text-white flex items-center gap-12 shadow-2xl relative overflow-hidden group border-b-[15px] border-blue-950">
                   <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 blur-[150px] transition-all group-hover:bg-white/20"></div>
                   <div className="bg-blue-500 p-12 rounded-[2.5rem] shadow-2xl shadow-blue-900/50 relative z-10 border-b-8 border-blue-700">
                      <User size={64}/>
                   </div>
                   <div className="relative z-10">
                      <h4 className="font-black text-blue-200 tracking-[0.4em] uppercase text-[10px] mb-4">Client Age at Collapse</h4>
                      <div className="text-[4.5rem] font-black font-mono tracking-tighter italic leading-none">{age + countdownYears} <small className="text-2xl font-bold">Years Old</small></div>
                   </div>
                </div>
             </div>
          </div>
        )}

      </div>

      {/* 🟢 底部數據宣告：極致專業度 */}
      <div className="max-w-4xl mx-auto text-center px-12 pt-20 space-y-6">
        <div className="flex justify-center gap-6 mb-4">
           <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm text-slate-400 text-[9px] font-black uppercase tracking-widest"><FileText size={12}/> Actuarial Report 2026</div>
           <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm text-slate-400 text-[9px] font-black uppercase tracking-widest"><Gem size={12}/> Medical Index v4.2</div>
        </div>
        <p className="text-[11px] text-slate-400 font-bold leading-relaxed tracking-wider">
          本戰情室數據綜合「115年衛福部國民健康年報預算」、「113年勞工保險局基金精算結果」以及「2026年全台19家醫學中心自費項目表」進行即時動態建模。<br/>
          <span className="text-slate-300 italic">警告：本系統僅供風險教育與財務壓力測試之模擬，實際醫療費用與理賠額度應以個別保險合約條款及各金融機構最新公告為準。</span>
        </p>
      </div>
    </div>
  );
}