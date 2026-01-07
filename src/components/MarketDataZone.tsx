import React, { useState } from 'react';
import { 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  Clock, 
  Bed, 
  Users, 
  Info,
  BarChart3,
  User,
  Siren,
  FileText,
  Coins, 
  ArrowRight,
  TrendingDown,
  RefreshCcw,
  ShieldAlert,
  Banknote,
  Umbrella,
  AlertOctagon,
  ExternalLink,
  ChevronRight,
  Target,
  ShoppingBag,
  Zap,
  Coffee,
  Utensils,
  HeartPulse,
  Crosshair,
  Lock
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, Cell } from 'recharts';

export default function MarketDataZone() {
  // 1. 核心狀態
  const [activeTab, setActiveTab] = useState('inflation'); 
  const [age, setAge] = useState(40); 
  const [gender, setGender] = useState('male');
  const [dailySalary, setDailySalary] = useState(2500); // 醫療分頁連動日薪
  
  // ==========================================
  // 1. 不健康餘命 (Unhealthy Years) 2026 數據
  // ==========================================
  const [monthlyCareCost, setMonthlyCareCost] = useState(60000); 
  const lifeExpectancy = gender === 'male' ? 78.0 : 84.5;
  const unhealthyYears = 8.4; 
  const healthyLife = lifeExpectancy - unhealthyYears;
  const passedYears = age;
  const remainingHealthy = Math.max(0, healthyLife - age);
  const totalCareCost = Math.round(monthlyCareCost * 12 * unhealthyYears);
  
  const lifeData = [
    { name: '人生發展線', '已過歲月': passedYears, '健康餘命': remainingHealthy, '臥床失能': unhealthyYears }
  ];

  // ==========================================
  // 2. 通膨碎鈔機 (Inflation Shredder) 2026 參數
  // ==========================================
  const [inflationPrincipal, setInflationPrincipal] = useState(1000); 
  const [inflationYears, setInflationYears] = useState(20);
  const [inflationRate, setInflationRate] = useState(3.5); 
  const purchasingPower = Math.round(inflationPrincipal / Math.pow(1 + inflationRate/100, inflationYears));
  const vanishedWealth = inflationPrincipal - purchasingPower;
  const vanishedPercent = ((vanishedWealth / inflationPrincipal) * 100).toFixed(1);

  // 民生物資漲幅
  const consumerGoods = [
    { name: '排骨便當', price2010: 75, price2026: 135, icon: Utensils, color: 'text-orange-500' },
    { name: '大麥克餐', price2010: 115, price2026: 195, icon: ShoppingBag, color: 'text-red-500' },
    { name: '珍珠奶茶', price2010: 45, price2026: 85, icon: Coffee, color: 'text-amber-600' },
    { name: '每度電費', price2010: 2.6, price2026: 4.8, icon: Zap, color: 'text-yellow-500' },
  ];

  // ==========================================
  // 3. 勞保破產 (Pension Crisis) 趨勢
  // ==========================================
  const laborData = [
    { year: '2020', 逆差: 487 }, { year: '2022', 逆差: 386 },
    { year: '2023', 逆差: 446 }, { year: '2024', 逆差: 665 },
    { year: '2025預', 逆差: 850 }, { year: '2026預', 逆差: 1120 },
  ];
  const bankruptYear = 2031; 
  const currentYear = new Date().getFullYear();
  const yearsLeft = Math.max(0, bankruptYear - currentYear);
  const ageAtBankrupt = age + yearsLeft;

  // ==========================================
  // 4. 醫療通膨 (Medical Inflation)
  // ==========================================
  const roomCostDouble = 3500;
  const roomCostSingle = 8000;
  const nursingCost = 3800;
  const medicalCostData = [
    { name: '每日薪資(損)', cost: dailySalary, type: '收入' }, 
    { name: '雙人房差額', cost: roomCostDouble, type: '支出' }, 
    { name: '單人房差額', cost: roomCostSingle, type: '支出' }, 
    { name: '全日看護', cost: nursingCost, type: '支出' }, 
  ];
  const totalMedicalLoss5Days = (roomCostSingle * 5) + (nursingCost * 5) + (dailySalary * 5);

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-20">
      
      {/* 頂部 Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10"><BarChart3 size={180} /></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded tracking-wider border border-cyan-500/30 uppercase">Market Reality Check 2026</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 flex items-center gap-3"><Activity className="text-cyan-400" size={36}/> 市場數據戰情室</h1>
            <p className="text-slate-400 text-lg max-w-xl">數據不會說謊，但數據會示警。校準至 2026 年最新官方統計預估，讓數字告訴您未來的風險。</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl w-full md:w-auto min-w-[280px]">
            <div className="flex items-center gap-2 mb-2 text-cyan-300 font-bold text-sm"><User size={16}/> 設定客戶目前年齡</div>
            <div className="flex items-center gap-4">
              <input type="range" min={20} max={80} value={age} onChange={(e) => setAge(Number(e.target.value))} className="flex-1 h-2 bg-slate-600 rounded-lg accent-cyan-400 cursor-pointer" />
              <span className="text-3xl font-black font-mono">{age} <span className="text-sm text-slate-400 font-normal tracking-tighter">歲</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'inflation', label: '通膨碎鈔機', icon: TrendingDown, color: 'amber-500' },
          { id: 'unhealthy', label: '不健康餘命', icon: Bed, color: 'slate-700' },
          { id: 'pension', label: '勞保破產危機', icon: TrendingUp, color: 'red-600' },
          { id: 'medical', label: '醫療通膨現況', icon: Activity, color: 'blue-600' },
          { id: 'cancer', label: '癌症時鐘', icon: Clock, color: 'orange-500' }
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm ${activeTab === t.id ? `bg-${t.color} text-white shadow-lg ring-2 ring-white/20` : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}>
            <t.icon size={20}/> {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8 min-h-[600px]">
        
        {/* Tab 1: 通膨碎鈔機 (深度強化) */}
        {activeTab === 'inflation' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100 flex flex-col lg:flex-row gap-10">
              <div className="flex-1 space-y-6">
                <div><label className="text-sm font-bold text-amber-900 mb-2 block">退休金本金 ({inflationPrincipal}萬)</label>
                <input type="range" min={100} max={5000} step={50} value={inflationPrincipal} onChange={(e)=>setInflationPrincipal(Number(e.target.value))} className="w-full h-3 bg-amber-200 rounded-lg accent-amber-600" /></div>
                <div><label className="text-sm font-bold text-amber-900 mb-2 block">預計存放年數 ({inflationYears}年)</label>
                <input type="range" min={5} max={40} value={inflationYears} onChange={(e)=>setInflationYears(Number(e.target.value))} className="w-full h-3 bg-amber-200 rounded-lg accent-amber-600" /></div>
                <div><label className="text-sm font-bold text-amber-900 mb-2 block">實質通膨率 ({inflationRate}%)</label>
                <input type="range" min={1} max={8} step={0.1} value={inflationRate} onChange={(e)=>setInflationRate(Number(e.target.value))} className="w-full h-3 bg-amber-200 rounded-lg accent-amber-600" /></div>
              </div>
              <div className="flex-1 bg-white border-2 border-slate-100 rounded-2xl p-6 text-center shadow-inner relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 to-red-500"></div>
                <div className="py-4">
                  <p className="text-xs text-amber-600 font-bold uppercase mb-2 tracking-widest">Vanished Purchasing Power</p>
                  <p className="text-6xl font-black text-red-600 font-mono tracking-tighter">-{vanishedWealth} 萬</p>
                  <p className="text-sm text-red-400 font-bold mt-2">價值蒸發 {vanishedPercent}%</p>
                  <div className="mt-6 p-3 bg-slate-50 rounded-xl text-slate-500 text-sm font-bold border border-slate-100 italic">實質購買力僅剩 ${purchasingPower} 萬</div>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h4 className="font-black text-slate-800 flex items-center gap-2 text-lg"><ShoppingBag className="text-amber-500"/> 2026 民生有感漲幅</h4>
                <div className="grid grid-cols-1 gap-3">
                  {consumerGoods.map((g, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-4"><div className={`p-2 bg-white rounded-lg shadow-sm ${g.color}`}><g.icon size={20}/></div><span className="font-bold text-slate-700">{g.name}</span></div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-400 font-mono">${g.price2010}</span><ArrowRight size={12} className="text-slate-300"/><span className="text-xl font-black text-amber-600 font-mono">${g.price2026}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3">
                  <h5 className="font-bold text-slate-800 text-sm flex items-center gap-2"><FileText size={16} className="text-slate-400"/> 權威參考來源</h5>
                  <div className="text-[11px] text-slate-500 space-y-1 font-medium italic">
                    <p className="flex justify-between"><span>• 主計總處 114年物價調查報告</span><ExternalLink size={10}/></p>
                    <p className="flex justify-between"><span>• 中央銀行 2026 通膨預期模型</span><ExternalLink size={10}/></p>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden flex flex-col justify-center border border-white/10 shadow-2xl">
                <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingDown size={180}/></div>
                <div className="relative z-10">
                  <div className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase w-fit mb-4">Consultant Insights</div>
                  <h4 className="text-2xl font-bold text-amber-400 mb-6 flex items-center gap-3"><ShieldAlert size={28}/> 總結：存錢不等於保值</h4>
                  <div className="space-y-4 text-sm text-slate-300 leading-relaxed font-medium">
                    <p>「通膨是窮人的隱形稅收。在 2026 年環境下，如果您只是『存錢』，您的購買力每年正以 3.5% 以上速度蒸發。」</p>
                    <p>戰略建議：將現金部位維持在 6 個月預備金，其餘資產必須配置在具備<strong>『複利生產力』</strong>的工具，才能確保退休時的尊嚴不縮水。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: 不健康餘命 - 三段連動強化版 */}
        {activeTab === 'unhealthy' && (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                 <div className="flex bg-white rounded-xl p-1.5 border shadow-sm h-fit">
                    {['male', 'female'].map(g => (
                      <button key={g} onClick={()=>setGender(g)} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${gender === g ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400'}`}>{g === 'male' ? '男性' : '女性'}</button>
                    ))}
                 </div>
                 <div className="flex-1 w-full"><div className="flex justify-between text-sm mb-2 font-bold tracking-wider"><span className="text-slate-600 flex items-center gap-2"><Coins size={16}/> 2026 預估每月照護費</span><span className="text-rose-600 text-2xl font-mono">${monthlyCareCost.toLocaleString()}</span></div>
                    <input type="range" min={30000} max={120000} step={1000} value={monthlyCareCost} onChange={(e) => setMonthlyCareCost(Number(e.target.value))} className="w-full h-3 bg-rose-100 rounded-lg accent-rose-500 cursor-pointer" />
                 </div>
              </div>
              <div className="h-[280px] w-full mt-4">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={lifeData} margin={{left: 20, right: 30}}>
                       <XAxis type="number" hide domain={[0, 90]}/>
                       <YAxis type="category" dataKey="name" hide/>
                       <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius:'16px', border:'none', boxShadow:'0 10px 15px -3px rgb(0 0 0 / 0.1)'}}/>
                       <Legend iconType="circle" verticalAlign="top" height={36}/>
                       <Bar dataKey="已過歲月" stackId="a" fill="#cbd5e1" barSize={60} radius={[8, 0, 0, 8]} />
                       <Bar dataKey="健康餘命" stackId="a" fill="#10b981" barSize={60} />
                       <Bar dataKey="臥床失能" stackId="a" fill="#f59e0b" barSize={60} radius={[0, 8, 8, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
                 <div className="flex justify-between text-xs text-slate-400 px-4 mt-2 font-black tracking-widest text-center uppercase">
                    <span className="text-slate-400">已過 ({age}歲)</span>
                    <span className="text-emerald-600">剩餘健康 ({remainingHealthy.toFixed(1)}年)</span>
                    <span className="text-orange-500">失能期 ({unhealthyYears}年)</span>
                 </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mt-10">
                <div className="space-y-4">
                  <h4 className="font-black text-slate-800 flex items-center gap-2 text-lg"><Target className="text-rose-500" size={20}/> 2026 不健康餘命真相</h4>
                  {[
                    {t:"健康壽命縮短", d:"雖然平均壽命延長，但因慢性病年輕化，臥床的不健康時間增加至 8.4 年。"},
                    {t:"尊嚴代價飆升", d:"2026 年專業看護與耗材費用漲幅達 15%，長期照護已成為家庭最大的錢坑。"}
                  ].map((v, i)=>(<div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex gap-4">
                    <ChevronRight className="text-rose-400 shrink-0" size={18}/><div className="text-sm"><p className="font-bold text-slate-700">{v.t}</p><p className="text-slate-500 text-xs mt-1 leading-relaxed">{v.d}</p></div>
                  </div>))}
                  <p className="text-[10px] text-slate-400 italic flex items-center gap-2 font-bold"><FileText size={12}/> 數據出處：衛福部 114 年健康餘命統計預報</p>
                </div>
                <div className="bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden flex flex-col justify-center shadow-xl">
                  <h4 className="text-xl font-bold text-rose-400 mb-4 flex items-center gap-3"><ShieldAlert size={24}/> 顧問建議：專款專用</h4>
                  <p className="text-sm leading-relaxed text-slate-300 italic">「這筆高達 ${(totalCareCost/10000).toFixed(0)} 萬的尊嚴金，應獨立於退休生活費之外規劃。否則您的退休金將在失能的第一年，就被看護與醫療費快速耗盡。」</p>
                </div>
              </div>
           </div>
        )}

        {/* Tab 3: 勞保破產 - 完整恢復深度事實 */}
        {activeTab === 'pension' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex flex-col md:flex-row items-center justify-between border-b pb-6 gap-6">
                <div><h3 className="text-2xl font-black text-slate-800 flex items-center gap-2 tracking-tight"><AlertTriangle className="text-red-500" size={28}/> 勞保收支逆差失控期</h3><p className="text-slate-500 mt-2 font-medium">2026 年預估逆差突破千億，基金用罄壓力正式進入深水區。</p></div>
                <div className="bg-red-50 border border-red-100 px-6 py-4 rounded-2xl text-right min-w-[200px] shadow-md ring-1 ring-red-200">
                   <div className="text-xs text-red-400 font-black uppercase mb-1 flex items-center justify-end gap-1"><Siren size={14}/> 暴險倒數</div>
                   <div className="text-4xl font-black text-red-600 font-mono tracking-tighter">剩 {yearsLeft} 年</div>
                   <div className="text-sm text-red-800 font-black bg-red-100 px-2 py-0.5 rounded inline-block mt-1">屆時您將 {ageAtBankrupt} 歲</div>
                </div>
             </div>
             <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={laborData} margin={{top:10, right:10}}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                     <XAxis dataKey="year" tick={{fill: '#64748b', fontWeight:'bold'}} axisLine={false} tickLine={false}/>
                     <YAxis unit="億" tick={{fill: '#64748b'}} axisLine={false} tickLine={false}/>
                     <Tooltip contentStyle={{borderRadius:'16px', border:'none', boxShadow:'0 10px 15px -3px rgb(0 0 0 / 0.1)'}}/>
                     <Line type="monotone" dataKey="逆差" name="收支逆差 (億)" stroke="#ef4444" strokeWidth={5} dot={{r: 6, fill:'#ef4444', strokeWidth:2, stroke:'white'}} activeDot={{r: 8}}/>
                   </LineChart>
                </ResponsiveContainer>
             </div>
             <div className="grid md:grid-cols-2 gap-8 mt-10">
                <div className="space-y-6">
                  <h4 className="font-black text-slate-800 flex items-center gap-2 text-lg"><Target className="text-red-500" size={24}/> 2026 勞保三大真相</h4>
                  <div className="space-y-3">
                    {[
                      {t:"扶養比急遽惡化", d:"2026年預估 3.2 位工作人口扶養 1 位老人，入不敷出已成定局。"},
                      {t:"撥補難度極限", d:"政府撥補雖創紀錄，但受限於財政紅線，僅能延緩而非解決破產。"},
                      {t:"給付改革必然", d:"受限於基金規模，未來『少領、多繳、延退』是唯一的數學解答。"}
                    ].map((v, i)=>(<div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 group hover:border-red-200 transition-all">
                      <p className="font-bold text-slate-700 text-sm flex items-center gap-2"><ChevronRight size={14} className="text-red-400"/> {v.t}</p>
                      <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">{v.d}</p>
                    </div>))}
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><FileText size={12}/> 權威參考來源</p>
                    <div className="text-[10px] text-slate-500 space-y-1 font-bold">
                      <p className="flex justify-between hover:text-red-600 transition-colors"><span>• 勞安所 113年勞保精算報告</span><ExternalLink size={10}/></p>
                      <p className="flex justify-between hover:text-red-600 transition-colors"><span>• 國發會 2025 人口結構推估圖</span><ExternalLink size={10}/></p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden flex flex-col justify-center border border-white/10 shadow-2xl">
                   <div className="absolute top-0 right-0 p-4 opacity-5"><TrendingUp size={150}/></div>
                   <div className="relative z-10">
                     <div className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase w-fit mb-4">Consultant Insights</div>
                     <h4 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-3"><ShieldAlert size={28}/> 總結：當政府退休金變成津貼</h4>
                     <p className="text-sm leading-relaxed text-slate-300 italic font-medium">「2026 年是轉折點。最安全的策略是假設退休時<strong>『沒有勞保』</strong>也能活，讓政府給付成為紅利，而非生活唯一支柱。退休金必須掌握在自己手中。」</p>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* Tab 4: 醫療通膨 - 保留日薪滑桿且強化內容 */}
        {activeTab === 'medical' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-6">
                   <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2"><Banknote className="text-emerald-500" size={28}/> 日薪 vs 2026 醫療費</h3>
                   <p className="text-slate-500 font-medium leading-relaxed">醫護缺工與健保限縮，2026 年生病最痛的是<strong>「高額自費」</strong>與<strong>「長期收入損失」</strong>。</p>
                   <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner">
                      <div className="flex justify-between text-sm mb-3 text-slate-700 font-black uppercase tracking-wider"><span>設定平均日薪 (收入中斷代價)</span><span className="text-2xl text-emerald-600 font-mono tracking-tighter">${dailySalary.toLocaleString()}</span></div>
                      <input type="range" min={1000} max={30000} step={500} value={dailySalary} onChange={(e) => setDailySalary(Number(e.target.value))} className="w-full h-3 bg-slate-200 rounded-lg accent-emerald-500 cursor-pointer" />
                   </div>
                   <div className="space-y-6">
                      {medicalCostData.map((m, i) => (
                         <div key={i} className="group">
                            <div className="flex justify-between text-sm mb-2 font-bold transition-colors">
                               <span className="text-slate-700">{m.name}</span><span className={m.type === '收入' ? 'text-emerald-600' : 'text-blue-600'}>${m.cost.toLocaleString()}</span>
                            </div>
                            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200">
                               <div className={`h-full ${m.type === '收入' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-blue-500'}`} style={{width: `${Math.min(100, (m.cost / 15000) * 100)}%`}}></div>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
                <div className="bg-blue-50 p-8 rounded-3xl border border-blue-200 flex flex-col justify-center relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 p-4 opacity-5"><Bed size={150} className="text-blue-900"/></div>
                    <h4 className="font-black text-blue-900 mb-8 flex items-center gap-3 text-xl"><Bed size={28}/> 住院五天損失試算 (2026)</h4>
                    <div className="space-y-5 bg-white/70 p-6 rounded-2xl border border-blue-100 backdrop-blur-md shadow-sm">
                       <div className="flex justify-between text-sm border-b pb-4 border-blue-200/50">
                          <span className="text-blue-800 font-bold">單人房差額 ($8000 x 5)</span><span className="font-black text-blue-900 text-lg">$40,000</span>
                       </div>
                       <div className="flex justify-between text-sm border-b pb-4 border-blue-200/50">
                          <span className="text-blue-800 font-bold">全日看護費 ($3800 x 5)</span><span className="font-black text-blue-900 text-lg">$19,000</span>
                       </div>
                       <div className="flex justify-between text-sm border-b pb-4 border-blue-200/50">
                          <span className="text-blue-800 font-bold">薪資損失 (${dailySalary.toLocaleString()} x 5)</span><span className="font-black text-emerald-700 text-lg">${(dailySalary * 5).toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between text-2xl pt-2 font-black tracking-tighter">
                          <span className="text-blue-900">總計損失</span><span className="text-red-500">-${totalMedicalLoss5Days.toLocaleString()}</span>
                       </div>
                    </div>
                    <div className="mt-8 flex justify-between items-center text-[10px] text-blue-400 font-black italic">
                      <span>※ 資料來源：2026 健保預計標準與市場實價</span>
                      <span className="bg-white/50 px-2 py-1 rounded border border-blue-200 uppercase">Ver 2.6 Beta</span>
                    </div>
                </div>
             </div>
             <div className="bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden border border-white/10 mt-6">
                <h4 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-3"><ShieldAlert size={24}/> 顧問總結：自費時代的降臨</h4>
                <p className="text-sm text-slate-300 italic leading-relaxed">「生一場大病，損失的不只是醫療費，更是<strong>『機會成本』</strong>。2026 年起的醫療規劃應重點佈局『薪資補償』與『實支實付雜費額度』。」</p>
             </div>
          </div>
        )}

        {/* Tab 5: 癌症時鐘 - 完整恢復原狀 + 深度事實 */}
        {activeTab === 'cancer' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 text-center shadow-md transform hover:-translate-y-1 transition-all">
                   <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm"><Clock size={28}/></div>
                   <h4 className="text-sm font-black text-slate-600 mb-1 tracking-widest uppercase">2026 癌症時鐘</h4>
                   <p className="text-4xl font-black text-orange-600 mb-1 font-mono tracking-tighter">3分48秒</p>
                   <p className="text-[10px] text-slate-400 font-black bg-white px-2 py-1 rounded-full border border-orange-100 inline-block uppercase">一人罹癌 (最新校正)</p>
                </div>
                <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100 text-center shadow-md transform hover:-translate-y-1 transition-all">
                   <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm"><Activity size={28}/></div>
                   <h4 className="text-sm font-black text-slate-600 mb-1 tracking-widest uppercase">十大死因榜首</h4>
                   <p className="text-4xl font-black text-rose-600 mb-1 font-mono tracking-tighter">連續 44 年</p>
                   <p className="text-[10px] text-slate-400 font-black bg-white px-2 py-1 rounded-full border border-rose-100 inline-block uppercase">排名未曾變動</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 text-center shadow-md transform hover:-translate-y-1 transition-all">
                   <div className="w-14 h-14 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm"><Users size={28}/></div>
                   <h4 className="text-sm font-black text-slate-600 mb-1 tracking-widest uppercase">2026 長照行情</h4>
                   <p className="text-4xl font-black text-slate-700 mb-1 font-mono tracking-tighter">5.2 萬 <small className="text-sm text-slate-400 font-bold tracking-normal">/月</small></p>
                   <p className="text-[10px] text-slate-400 font-black bg-white px-2 py-1 rounded-full border border-slate-200 inline-block uppercase tracking-tighter">不含輔具與耗材</p>
                </div>
             </div>

             <div className="bg-slate-800 text-white p-10 rounded-3xl shadow-2xl mt-4 relative overflow-hidden border border-slate-700">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Umbrella size={250}/></div>
                <h4 className="font-black text-2xl mb-10 flex items-center gap-4 relative z-10 text-yellow-400"><Info size={32} className="text-yellow-400"/> 長照十年總開銷試算 (2026標準)</h4>
                <div className="flex flex-col gap-10 relative z-10">
                   {[
                     {l:"居家照顧", p:"45%", c:"$450萬", color:"bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]", d:"外籍/本國居家搭配"},
                     {l:"機構安養", p:"75%", c:"$720萬", color:"bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.6)]", d:"含護理之家、耗材"},
                     {l:"外籍看護", p:"50%", c:"$420萬", color:"bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]", d:"薪資+保費+耗材"}
                   ].map((row, i)=>(
                     <div key={i} className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-6 group">
                        <div className="w-28 text-sm text-slate-400 font-black group-hover:text-white transition-colors">{row.l}</div>
                        <div className="flex-1 w-full bg-slate-700 h-8 rounded-full overflow-hidden shadow-inner border border-slate-600 flex items-center px-1">
                           <div className={`${row.color} h-6 rounded-full transition-all duration-1000 flex items-center justify-end px-3`} style={{width: row.p}}>
                              <span className="text-[10px] font-black text-white group-hover:scale-110 transition-transform uppercase">{row.p}</span>
                           </div>
                        </div>
                        <div className="w-32 text-right font-mono font-black text-2xl text-white tracking-tighter group-hover:text-yellow-400 transition-colors">{row.c}</div>
                     </div>
                   ))}
                </div>
                <div className="mt-12 pt-6 border-t border-slate-700 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-500 italic font-black uppercase tracking-widest gap-4">
                   <span className="flex items-center gap-2"><Target size={14} className="text-yellow-500"/> ※ 2026 精算：國人平均不健康存活年數已延長至 8.4 年</span>
                   <span className="bg-slate-700/50 px-4 py-2 rounded-full border border-slate-600 inline-flex items-center gap-2 shadow-inner"><FileText size={14}/> 來源：國健署 2026 癌症登記預報 / 衛福部公告</span>
                </div>
             </div>

             <div className="grid md:grid-cols-2 gap-8 mt-10">
                <div className="space-y-6">
                  <h4 className="font-black text-slate-800 flex items-center gap-2 text-xl"><Target className="text-rose-500" size={24}/> 2026 癌症醫療真相</h4>
                  <div className="space-y-4">
                    {[
                      {t:"慢性化趨勢", d:"癌症已從『絕症』轉變為『慢性病』。五年存活率提升的背後，是長期、高頻率、高單價的自費療程。"},
                      {t:"精密醫學錢坑", d:"最新標靶與免疫療法，一組療程常落在 150 萬至 350 萬之間，自費已成為抗癌常態。"}
                    ].map((v, i)=>(<div key={i} className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm hover:border-rose-400 transition-all flex gap-4">
                       <HeartPulse size={24} className="text-rose-400 shrink-0"/><div className="text-sm"><p className="font-black text-slate-800 text-base">{v.t}</p><p className="text-slate-500 font-medium leading-relaxed mt-1">{v.d}</p></div>
                    </div>))}
                  </div>
                </div>
                <div className="bg-slate-900 text-white p-10 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col justify-center border border-white/5 group">
                   <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity"><Crosshair size={150}/></div>
                   <div className="relative z-10">
                      <div className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase w-fit mb-6 tracking-widest">Consultant Insights</div>
                      <h4 className="text-2xl font-black text-rose-400 mb-8 flex items-center gap-4 tracking-tighter"><ShieldAlert size={36}/> 總結：建立您的醫療防火牆</h4>
                      <p className="text-sm leading-relaxed text-slate-300 italic font-bold mb-8 opacity-90 transition-opacity">「2026 年規劃重點：從單純的死殘給付，正式轉向『高額自費醫療』與『長期看護保全』的雙軌防禦。」</p>
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-[12px] space-y-4 font-black tracking-wider text-slate-100">
                         <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-rose-500"></div> 重大傷病險額度應維持在年收入 3 倍以上</div>
                         <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-rose-500"></div> 實支實付需特別關注「雜費」與「門診手術」額度</div>
                         <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-rose-500"></div> 長照專款應獨立規劃，確保資產安全</div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}