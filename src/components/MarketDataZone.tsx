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
  Banknote, // 確保有替代方案，若無則用 Coins
  Umbrella,
  AlertOctagon
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, Cell } from 'recharts';

export default function MarketDataZone() {
  // 預設顯示最痛的「通膨」作為首頁
  const [activeTab, setActiveTab] = useState('inflation'); 
  
  // 共用參數：客戶年齡
  const [age, setAge] = useState(40); 
  
  // ==========================================
  // 1. 不健康餘命 (Unhealthy Years) 資料與邏輯
  // ==========================================
  const [gender, setGender] = useState<'male'|'female'>('male');
  const [monthlyCareCost, setMonthlyCareCost] = useState(50000); 
  
  // 衛福部 112年統計：男平均壽命 76.9 / 女 83.7
  const lifeExpectancy = gender === 'male' ? 76.9 : 83.7;
  // 不健康餘命平均約 7.78 年 (近 8 年)
  const unhealthyYears = 7.8; 
  const healthyLife = lifeExpectancy - unhealthyYears;
  
  // 計算總長照費用 (不含通膨)
  const totalCareCost = Math.round(monthlyCareCost * 12 * unhealthyYears);
  
  // 圖表數據
  const lifeData = [
    { name: '人生階段', 健康生活: healthyLife, 臥床失能: unhealthyYears }
  ];

  // ==========================================
  // 2. 通膨碎鈔機 (Inflation Shredder) 資料與邏輯
  // ==========================================
  const [inflationPrincipal, setInflationPrincipal] = useState(1000); // 萬
  const [inflationYears, setInflationYears] = useState(20);
  const [inflationRate, setInflationRate] = useState(3.0); // %
  
  // 計算實質購買力：PV = FV / (1+r)^n
  const purchasingPower = Math.round(inflationPrincipal / Math.pow(1 + inflationRate/100, inflationYears));
  const vanishedWealth = inflationPrincipal - purchasingPower;
  const vanishedPercent = ((vanishedWealth / inflationPrincipal) * 100).toFixed(1);

  // ==========================================
  // 3. 勞保破產 (Pension Crisis) 資料與邏輯
  // ==========================================
  const laborData = [
    { year: '2017', 逆差: 275 },
    { year: '2018', 逆差: 251 },
    { year: '2020', 逆差: 487 },
    { year: '2022', 逆差: 386 },
    { year: '2023', 逆差: 446 },
    { year: '2024', 逆差: 665 },
  ];
  const currentYear = new Date().getFullYear();
  const bankruptYear = 2031; // 最新精算報告延後至 2031
  const yearsLeft = Math.max(0, bankruptYear - currentYear);
  const ageAtBankrupt = age + yearsLeft;

  // ==========================================
  // 4. 醫療通膨 (Medical Inflation) 資料
  // ==========================================
  const medicalCostData = [
    { name: '每日薪資(均)', cost: 1800, type: '收入' },
    { name: '雙人房差額', cost: 2500, type: '支出' },
    { name: '單人房差額', cost: 6000, type: '支出' },
    { name: '全日看護', cost: 2800, type: '支出' },
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-20">
      
      {/* --------------------------------------------------------------------------- */}
      {/* 頂部 Header 區塊 */}
      {/* --------------------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <BarChart3 size={180} />
        </div>
        <div className="relative z-10">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                 <div className="flex items-center gap-2 mb-2">
                    <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded tracking-wider border border-cyan-500/30">
                       MARKET REALITY CHECK
                    </span>
                 </div>
                 <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 flex items-center gap-3">
                   <Activity className="text-cyan-400" size={36}/> 市場數據戰情室
                 </h1>
                 <p className="text-slate-400 text-lg max-w-xl">
                   數據不會說謊，但數據會示警。這裡匯集了內政部、主計處與衛福部最新的官方統計，讓數字告訴您未來的風險。
                 </p>
              </div>

              {/* 年齡輸入區 (全域共用) */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl w-full md:w-auto min-w-[280px]">
                 <div className="flex items-center gap-2 mb-2 text-cyan-300 font-bold text-sm">
                    <User size={16}/> 設定您的目前年齡
                 </div>
                 <div className="flex items-center gap-4">
                    <input 
                      type="range" min={20} max={70} step={1} 
                      value={age} 
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="flex-1 h-2 bg-slate-600 rounded-lg accent-cyan-400 cursor-pointer"
                    />
                    <span className="text-3xl font-black font-mono">{age} <span className="text-sm text-slate-400 font-normal">歲</span></span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------------- */}
      {/* 分頁切換 Tabs */}
      {/* --------------------------------------------------------------------------- */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <button 
          onClick={() => setActiveTab('inflation')}
          className={`px-5 py-3 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all shadow-sm ${activeTab === 'inflation' ? 'bg-amber-500 text-white shadow-lg ring-2 ring-amber-200' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
        >
          <TrendingDown size={20}/> 通膨碎鈔機
        </button>
        <button 
          onClick={() => setActiveTab('unhealthy')}
          className={`px-5 py-3 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all shadow-sm ${activeTab === 'unhealthy' ? 'bg-slate-700 text-white shadow-lg ring-2 ring-slate-400' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
        >
          <Bed size={20} className={activeTab === 'unhealthy' ? 'text-rose-300' : ''}/> 不健康餘命
        </button>
        <button 
          onClick={() => setActiveTab('pension')}
          className={`px-5 py-3 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all shadow-sm ${activeTab === 'pension' ? 'bg-red-600 text-white shadow-lg ring-2 ring-red-200' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
        >
          <TrendingUp size={20}/> 勞保破產危機
        </button>
        <button 
          onClick={() => setActiveTab('medical')}
          className={`px-5 py-3 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all shadow-sm ${activeTab === 'medical' ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-200' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
        >
          <Activity size={20}/> 醫療通膨現況
        </button>
        <button 
          onClick={() => setActiveTab('cancer')}
          className={`px-5 py-3 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all shadow-sm ${activeTab === 'cancer' ? 'bg-orange-500 text-white shadow-lg ring-2 ring-orange-200' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
        >
          <Clock size={20}/> 癌症時鐘
        </button>
      </div>

      {/* --------------------------------------------------------------------------- */}
      {/* 內容顯示區 Content Area */}
      {/* --------------------------------------------------------------------------- */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8 min-h-[500px]">
        
        {/* =================================================================================== */}
        {/* Tab 1: 通膨碎鈔機 (The Inflation Shredder) */}
        {/* =================================================================================== */}
        {activeTab === 'inflation' && (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* 上半部：控制面板與視覺對比 */}
              <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100 flex flex-col lg:flex-row gap-10">
                 
                 {/* 左側：參數滑桿 */}
                 <div className="flex-1 space-y-6">
                    <div>
                        <div className="flex justify-between text-sm mb-2 text-amber-900 font-bold">
                           <span className="flex items-center gap-2"><Coins size={16}/> 預計準備退休金 (本金)</span>
                           <span className="text-xl font-mono">{inflationPrincipal} 萬</span>
                        </div>
                        <input 
                           type="range" min={100} max={5000} step={50} 
                           value={inflationPrincipal} 
                           onChange={(e) => setInflationPrincipal(Number(e.target.value))}
                           className="w-full h-3 bg-amber-200 rounded-lg accent-amber-600 cursor-pointer"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-2 text-amber-900 font-bold">
                           <span className="flex items-center gap-2"><Clock size={16}/> 閒置年數 (定存/現金)</span>
                           <span className="text-xl font-mono">{inflationYears} 年</span>
                        </div>
                        <input 
                           type="range" min={5} max={40} step={1} 
                           value={inflationYears} 
                           onChange={(e) => setInflationYears(Number(e.target.value))}
                           className="w-full h-3 bg-amber-200 rounded-lg accent-amber-600 cursor-pointer"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-2 text-amber-900 font-bold">
                           <span className="flex items-center gap-2"><TrendingUp size={16}/> 平均通膨率 (CPI)</span>
                           <span className="text-xl font-mono">{inflationRate}%</span>
                        </div>
                        <input 
                           type="range" min={1.0} max={6.0} step={0.1} 
                           value={inflationRate} 
                           onChange={(e) => setInflationRate(Number(e.target.value))}
                           className="w-full h-3 bg-amber-200 rounded-lg accent-amber-600 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-amber-700/60 mt-1 font-bold">
                           <span>官方統計 (2%)</span>
                           <span>長期平均 (3%)</span>
                           <span>體感通膨 (4%+)</span>
                        </div>
                    </div>
                 </div>

                 {/* 右側：碎鈔機視覺效果 */}
                 <div className="flex-1 flex flex-col items-center justify-center relative">
                    <div className="w-full flex justify-between items-center mb-4 px-4">
                       <div className="text-center">
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Nominal Value</p>
                          <p className="text-sm text-slate-400 font-bold">名目本金</p>
                          <p className="text-3xl font-black text-slate-700 font-mono mt-1">{inflationPrincipal}萬</p>
                       </div>
                       <div className="flex-1 border-t-2 border-dashed border-slate-300 mx-6 relative top-4"></div>
                       <div className="text-center">
                          <p className="text-xs text-amber-600 font-bold uppercase tracking-wider mb-1">Real Value</p>
                          <p className="text-sm text-amber-500 font-bold">實質購買力</p>
                          <p className="text-3xl font-black text-amber-600 font-mono mt-1">{purchasingPower}萬</p>
                       </div>
                    </div>

                    {/* 碎紙機動畫意象 Container */}
                    <div className="bg-white border-2 border-slate-100 rounded-2xl p-6 w-full text-center shadow-inner relative overflow-hidden group hover:shadow-md transition-all">
                       <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 to-red-500"></div>
                       <div className="flex flex-col items-center gap-3">
                          <Coins size={56} className="text-slate-300"/>
                          <ArrowRight size={24} className="text-slate-300 rotate-90"/>
                          <RefreshCcw size={40} className="text-red-500 animate-spin-slow duration-[3000ms]"/>
                          <ArrowRight size={24} className="text-slate-300 rotate-90"/>
                          
                          {/* 結果顯示 */}
                          <div className="bg-red-50 px-6 py-3 rounded-xl border border-red-100 animate-pulse w-full">
                             <div className="flex items-center justify-center gap-2 mb-1">
                                <AlertOctagon size={14} className="text-red-500"/>
                                <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Vanished Wealth</p>
                             </div>
                             <p className="text-4xl font-black text-red-600 font-mono tracking-tighter">-{vanishedWealth} 萬</p>
                             <p className="text-sm text-red-400 font-bold mt-1">資產縮水 {vanishedPercent}%</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* 下半部：顧問觀點 */}
              <div className="bg-white p-6 rounded-2xl border-l-4 border-amber-500 shadow-sm flex gap-5 items-start">
                 <div className="bg-amber-100 p-3 rounded-full shrink-0">
                    <TrendingDown className="text-amber-600" size={24}/>
                 </div>
                 <div>
                    <h4 className="font-bold text-slate-800 text-lg mb-2">為什麼這很可怕？</h4>
                    <p className="text-slate-600 leading-relaxed">
                       「您現在存的 {inflationPrincipal} 萬，在 {inflationYears} 年後，只能買到相當於現在 {purchasingPower} 萬價值的東西。
                       如果您只把錢放定存（利率追不上通膨），等於每年主動讓資產縮水。
                       <br/><br/>
                       <strong>抗通膨不是『投資致富』，而是『資產保值』的基本功。</strong>」
                    </p>
                 </div>
              </div>
              
              <div className="text-right">
                 <span className="text-[10px] text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 inline-flex items-center gap-1.5 hover:bg-slate-100 transition-colors">
                    <FileText size={12}/> 資料來源：主計總處消費者物價指數 (CPI) 購買力換算模型
                 </span>
              </div>
           </div>
        )}

        {/* =================================================================================== */}
        {/* Tab 2: 不健康餘命 (Unhealthy Years) */}
        {/* =================================================================================== */}
        {activeTab === 'unhealthy' && (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* 控制區 */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                 {/* 性別選擇 */}
                 <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-slate-600">您的生理性別：</span>
                    <div className="flex bg-white rounded-xl p-1.5 border border-slate-200 shadow-sm">
                       <button 
                         onClick={() => setGender('male')}
                         className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${gender === 'male' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                       >
                         男性
                       </button>
                       <button 
                         onClick={() => setGender('female')}
                         className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${gender === 'female' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                       >
                         女性
                       </button>
                    </div>
                 </div>

                 {/* 費用設定 */}
                 <div className="flex-1 w-full md:w-auto">
                    <div className="flex justify-between text-sm mb-2">
                       <span className="font-bold text-slate-600 flex items-center gap-2"><Coins size={16}/> 預估每月照護費用</span>
                       <span className="font-mono font-bold text-rose-600 text-lg">${monthlyCareCost.toLocaleString()}</span>
                    </div>
                    <input 
                      type="range" min={30000} max={100000} step={1000} 
                      value={monthlyCareCost} 
                      onChange={(e) => setMonthlyCareCost(Number(e.target.value))}
                      className="w-full h-3 bg-rose-100 rounded-lg accent-rose-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-bold">
                       <span>居家照顧 ($3萬)</span>
                       <span>機構安養 ($5萬)</span>
                       <span>VIP照護 ($10萬)</span>
                    </div>
                 </div>
              </div>

              {/* 視覺化圖表區 */}
              <div className="grid md:grid-cols-2 gap-8 items-center">
                 
                 {/* 長條圖 */}
                 <div className="h-[220px]">
                    <h4 className="text-sm font-bold text-slate-500 mb-4 text-center flex items-center justify-center gap-2">
                        <User size={16}/> 您的人生長度預估 ({gender === 'male' ? '男' : '女'})
                    </h4>
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart layout="vertical" data={lifeData} margin={{top: 0, right: 30, left: 30, bottom: 0}}>
                          <XAxis type="number" hide domain={[0, 100]}/>
                          <YAxis type="category" dataKey="name" hide/>
                          <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border:'none', boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}}/>
                          <Legend iconType="circle"/>
                          <Bar dataKey="健康生活" stackId="a" fill="#10b981" radius={[8, 0, 0, 8]} barSize={50} label={{position: 'center', fill: 'white', fontWeight: 'bold', fontSize:12, formatter: (val:any) => `${val.toFixed(1)}歲`}}>
                          </Bar>
                          <Bar dataKey="臥床失能" stackId="a" fill="#94a3b8" radius={[0, 8, 8, 0]} barSize={50} label={{position: 'center', fill: 'white', fontWeight: 'bold', fontSize:14, formatter: (val:any) => `${val}年`}}>
                             <Cell fill="#cbd5e1" />{/* 灰色代表失能 */}
                          </Bar>
                       </BarChart>
                    </ResponsiveContainer>
                    <div className="flex justify-between text-xs text-slate-400 px-4 mt-[-10px] font-mono">
                       <span>0歲</span>
                       <span className="pl-16">健康餘命</span>
                       <span>平均壽命 {lifeExpectancy}歲</span>
                    </div>
                 </div>

                 {/* 殘酷結論卡片 */}
                 <div className="bg-rose-50 border border-rose-100 p-8 rounded-3xl text-center relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                       <Coins size={140} className="text-rose-900"/>
                    </div>
                    
                    <h4 className="text-sm font-bold text-rose-800 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                       <ShieldAlert size={16}/> The Cost of Dignity
                    </h4>
                    <div className="text-xs text-rose-500 font-bold mb-4">
                       預估尊嚴總價 (不含通膨)
                    </div>
                    
                    <div className="text-5xl font-black text-rose-600 font-mono mb-4 tracking-tighter">
                       ${(totalCareCost / 10000).toFixed(0)} <span className="text-2xl text-rose-400">萬</span>
                    </div>
                    
                    <div className="bg-white/80 p-4 rounded-xl text-left border border-rose-100/50 backdrop-blur-sm">
                        <p className="text-sm text-slate-600 leading-relaxed">
                        統計顯示，國人平均需被照顧 <strong>{unhealthyYears}</strong> 年。
                        如果這 <strong>{totalCareCost.toLocaleString()}元</strong> 不想讓子女買單，
                        您現在的退休金準備夠了嗎？
                        </p>
                    </div>
                 </div>
              </div>

              {/* 來源 */}
              <div className="text-right border-t border-slate-100 pt-4">
                 <span className="text-[10px] text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 inline-flex items-center gap-1.5 hover:bg-slate-100 transition-colors">
                    <FileText size={12}/> 資料來源：內政部 112年簡易生命表 / 衛福部 112年國人健康平均餘命統計
                 </span>
              </div>
           </div>
        )}

        {/* =================================================================================== */}
        {/* Tab 3: 勞保危機 (Pension Crisis) */}
        {/* =================================================================================== */}
        {activeTab === 'pension' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-100 pb-6 gap-6">
                <div>
                   <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                      <AlertTriangle className="text-red-500" size={28}/> 勞保收支逆差創新高
                   </h3>
                   <p className="text-slate-500 mt-2">2024年逆差達 665 億，政府精算報告估計 2031 年基金恐用罄。</p>
                </div>
                
                {/* 倒數計時卡片 */}
                <div className="bg-red-50 border border-red-100 px-6 py-4 rounded-2xl text-right min-w-[200px] shadow-sm">
                   <div className="text-xs text-red-400 font-bold uppercase flex items-center justify-end gap-1 mb-1">
                      <Siren size={14}/> 您的暴險倒數
                   </div>
                   <div className="text-4xl font-black text-red-600 font-mono mb-1">
                      剩 {yearsLeft} 年
                   </div>
                   <div className="text-sm text-red-800 font-bold bg-red-100 px-2 py-0.5 rounded inline-block">
                      屆時您將 {ageAtBankrupt} 歲
                   </div>
                </div>
             </div>

             <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={laborData} margin={{top: 20, right: 30, left: 10, bottom: 0}}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                      <XAxis dataKey="year" tick={{fill: '#64748b', fontWeight:'bold'}} axisLine={false} tickLine={false} dy={10}/>
                      <YAxis tick={{fill: '#64748b', fontWeight:'bold'}} axisLine={false} tickLine={false} unit="億"/>
                      <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', padding:'12px'}}/>
                      <Legend verticalAlign="top" height={36}/>
                      <Line type="monotone" dataKey="逆差" name="收支逆差 (億)" stroke="#ef4444" strokeWidth={4} dot={{r: 6, fill:'#ef4444', strokeWidth:2, stroke:'white'}} activeDot={{r: 8}}/>
                   </LineChart>
                </ResponsiveContainer>
             </div>
             
             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col gap-3">
                <div className="flex gap-4 items-start">
                    <div className="bg-white p-2 rounded-full border border-slate-100 shadow-sm shrink-0">
                        <Info className="text-slate-500" size={24}/>
                    </div>
                    <div>
                    <h4 className="font-bold text-slate-800 text-lg mb-1">顧問觀點：</h4>
                    <p className="text-slate-600 leading-relaxed">
                        當您 {ageAtBankrupt} 歲時，勞保基金將面臨破產或是大幅改革（少領/多繳）。
                        這意味著您現在規劃的退休金，必須假設<strong>「沒有勞保」也能活下去</strong>，才是最安全的策略。
                        依靠政府退休金就像住在海砂屋，您知道它遲早會垮，只是不知道是哪一天。
                    </p>
                    </div>
                </div>
                {/* 來源標註 */}
                <div className="w-full text-right mt-2">
                    <span className="text-[10px] text-slate-400 bg-white px-3 py-1.5 rounded-full border border-slate-100 inline-flex items-center gap-1.5 hover:bg-slate-100 transition-colors">
                        <FileText size={12}/> 資料來源：勞動部勞工保險局 2024年財務精算報告
                    </span>
                </div>
             </div>
          </div>
        )}

        {/* =================================================================================== */}
        {/* Tab 4: 醫療通膨 (Medical Inflation) */}
        {/* =================================================================================== */}
        {activeTab === 'medical' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="grid md:grid-cols-2 gap-8">
                {/* 左邊：對比圖 */}
                <div>
                   <h3 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                      <Banknote className="text-emerald-500"/> 日薪 vs. 日醫療費
                   </h3>
                   <p className="text-slate-500 mb-6">健保自付額上限調高，生病最可怕的是「收入中斷」加上「支出不斷」。</p>
                   
                   <div className="space-y-6">
                      {medicalCostData.map((item, idx) => (
                         <div key={idx}>
                            <div className="flex justify-between text-sm mb-2">
                               <span className="font-bold text-slate-700">{item.name}</span>
                               <span className={`font-mono font-bold text-lg ${item.type === '收入' ? 'text-emerald-600' : 'text-blue-600'}`}>${item.cost.toLocaleString()}</span>
                            </div>
                            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                               <div 
                                 className={`h-full ${item.type === '收入' ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                                 style={{width: `${Math.min(100, (item.cost / 6000) * 100)}%`}}
                               ></div>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>

                {/* 右邊：住院試算卡片 */}
                <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 flex flex-col justify-center relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                       <Bed size={150} className="text-blue-900"/>
                    </div>
                    
                    <h4 className="font-bold text-blue-900 mb-6 flex items-center gap-3 text-xl">
                       <Bed size={24}/> 住院五天要花多少？
                    </h4>
                    
                    <div className="space-y-4 bg-white/60 p-4 rounded-2xl backdrop-blur-sm border border-blue-100">
                       <div className="flex justify-between text-sm border-b border-blue-200/50 pb-3">
                          <span className="text-blue-800 font-medium">單人房差額 (5天)</span>
                          <span className="font-bold text-blue-900 text-lg">$30,000</span>
                       </div>
                       <div className="flex justify-between text-sm border-b border-blue-200/50 pb-3">
                          <span className="text-blue-800 font-medium">全日看護費 (5天)</span>
                          <span className="font-bold text-blue-900 text-lg">$14,000</span>
                       </div>
                       <div className="flex justify-between text-sm border-b border-blue-200/50 pb-3">
                          <span className="text-blue-800 font-medium">薪資損失 (5天)</span>
                          <span className="font-bold text-blue-900 text-lg">$9,000</span>
                       </div>
                       <div className="flex justify-between text-xl pt-2">
                          <span className="font-black text-blue-900">總計損失</span>
                          <span className="font-black text-red-500">-$53,000</span>
                       </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-blue-200 text-right">
                        <span className="text-[10px] text-blue-400 bg-white/50 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 hover:bg-white transition-colors">
                            <FileText size={12}/> 資料來源：衛福部健保署 2024年住院自付額標準 / 各大醫院公告
                        </span>
                    </div>
                </div>
             </div>
          </div>
        )}

        {/* =================================================================================== */}
        {/* Tab 5: 癌症時鐘 (Cancer Clock) */}
        {/* =================================================================================== */}
        {activeTab === 'cancer' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             
             {/* 上半部：三大指標卡片 */}
             <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 text-center hover:shadow-md transition-shadow">
                   <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Clock size={28}/>
                   </div>
                   <h4 className="text-sm font-bold text-slate-600 mb-1">癌症時鐘</h4>
                   <p className="text-3xl font-black text-orange-600 mb-1">4分19秒</p>
                   <p className="text-xs text-slate-400 font-medium bg-white px-2 py-1 rounded-full inline-block">就有一人罹癌</p>
                </div>
                
                <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100 text-center hover:shadow-md transition-shadow">
                   <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Activity size={28}/>
                   </div>
                   <h4 className="text-sm font-bold text-slate-600 mb-1">十大死因榜首</h4>
                   <p className="text-3xl font-black text-rose-600 mb-1">連續42年</p>
                   <p className="text-xs text-slate-400 font-medium bg-white px-2 py-1 rounded-full inline-block">癌症居冠</p>
                </div>
                
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 text-center hover:shadow-md transition-shadow">
                   <div className="w-14 h-14 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Users size={28}/>
                   </div>
                   <h4 className="text-sm font-bold text-slate-600 mb-1">長照平均花費</h4>
                   <p className="text-3xl font-black text-slate-700 mb-1">4.5萬 <span className="text-sm text-slate-500">/月</span></p>
                   <p className="text-xs text-slate-400 font-medium bg-white px-2 py-1 rounded-full inline-block">不含一次性設備支出</p>
                </div>
             </div>

             {/* 下半部：長照總開銷圖表 */}
             <div className="bg-slate-800 text-white p-8 rounded-3xl shadow-xl mt-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Umbrella size={200}/>
                </div>
                
                <h4 className="font-bold text-xl mb-6 flex items-center gap-3 relative z-10">
                   <Info className="text-yellow-400"/> 長照十年總開銷試算
                </h4>
                
                <div className="flex flex-col gap-6 relative z-10">
                   <div className="flex items-center gap-4">
                      <div className="w-20 text-sm text-slate-400 font-bold">居家照顧</div>
                      <div className="flex-1 bg-slate-700 h-5 rounded-full overflow-hidden shadow-inner">
                         <div className="bg-blue-500 h-full w-[40%] flex items-center justify-end px-2 text-[10px] font-bold">40%</div>
                      </div>
                      <div className="w-24 text-right font-mono font-bold text-lg">$360萬</div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-20 text-sm text-slate-400 font-bold">機構安養</div>
                      <div className="flex-1 bg-slate-700 h-5 rounded-full overflow-hidden shadow-inner">
                         <div className="bg-orange-500 h-full w-[60%] flex items-center justify-end px-2 text-[10px] font-bold text-black/50">60%</div>
                      </div>
                      <div className="w-24 text-right font-mono font-bold text-orange-400 text-lg">$600萬</div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-20 text-sm text-slate-400 font-bold">外籍看護</div>
                      <div className="flex-1 bg-slate-700 h-5 rounded-full overflow-hidden shadow-inner">
                         <div className="bg-emerald-500 h-full w-[30%] flex items-center justify-end px-2 text-[10px] font-bold text-black/50">30%</div>
                      </div>
                      <div className="w-24 text-right font-mono font-bold text-lg">$300萬</div>
                   </div>
                </div>
                
                {/* 來源標註 */}
                <div className="mt-8 pt-4 border-t border-slate-700 flex justify-between items-center text-xs text-slate-400 relative z-10">
                    <span className="italic">*估算長照平均存活年數約 7-10 年</span>
                    <span className="bg-slate-700/50 px-3 py-1.5 rounded-full inline-flex items-center gap-2 border border-slate-600">
                        <FileText size={12}/> 資料來源：衛福部 112年死因統計 / 國健署癌症登記報告 / 家總
                    </span>
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}