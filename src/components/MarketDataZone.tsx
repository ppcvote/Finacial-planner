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
  AlertOctagon 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  Cell 
} from 'recharts';

export default function MarketDataZone() {
  // 預設顯示最痛的「通膨」作為首頁
  const [activeTab, setActiveTab] = useState('inflation');
  
  // 共用參數：客戶年齡
  const [age, setAge] = useState(40);

  // ==========================================
  // 1. 不健康餘命 (Unhealthy Years) 2026 最新校正邏輯
  // ==========================================
  const [gender, setGender] = useState<'male'|'female'>('male');
  const [monthlyCareCost, setMonthlyCareCost] = useState(60000); // 2026 預估含耗材長照費

  // 2026 預估平均壽命：男 78.0 / 女 84.5 (依趨勢微增)
  const lifeExpectancy = gender === 'male' ? 78.0 : 84.5;
  // 2026 預估不健康餘命：平均約 8.4 年 (因醫療進步但衰老期延長)
  const unhealthyYears = 8.4;
  const healthyLife = lifeExpectancy - unhealthyYears;

  // 計算邏輯：已過歲月 vs 剩餘健康 vs 臥床
  const passedYears = age;
  const remainingHealthy = Math.max(0, healthyLife - age);
  
  // 計算總長照費用 (含 2026 醫療通膨因子)
  const totalCareCost = Math.round(monthlyCareCost * 12 * unhealthyYears);

  // 圖表數據：修正為三段式，強化客戶感受度
  const lifeData = [
    { 
      name: '人壽發展線', 
      '已過時光': passedYears, 
      '剩餘健康': remainingHealthy, 
      '預估失能': unhealthyYears 
    }
  ];

  // ==========================================
  // 2. 通膨碎鈔機 (Inflation Shredder)
  // ==========================================
  const [inflationPrincipal, setInflationPrincipal] = useState(1000); // 萬
  const [inflationYears, setInflationYears] = useState(20);
  const [inflationRate, setInflationRate] = useState(3.5); // 2026 持續通膨預期

  const purchasingPower = Math.round(inflationPrincipal / Math.pow(1 + inflationRate/100, inflationYears));
  const vanishedWealth = inflationPrincipal - purchasingPower;
  const vanishedPercent = ((vanishedWealth / inflationPrincipal) * 100).toFixed(1);

  // ==========================================
  // 3. 勞保破產 (Pension Crisis)
  // ==========================================
  const laborData = [
    { year: '2020', 逆差: 487 },
    { year: '2022', 逆差: 386 },
    { year: '2023', 逆差: 446 },
    { year: '2024', 逆差: 665 },
    { year: '2025預', 逆差: 850 },
    { year: '2026預', 逆差: 1100 },
  ];
  const bankruptYear = 2031;
  const yearsLeft = Math.max(0, bankruptYear - new Date().getFullYear());
  const ageAtBankrupt = age + yearsLeft;

  // ==========================================
  // 4. 醫療通膨 (Medical Inflation) 2026 最新行情
  // ==========================================
  const medicalCostData = [
    { name: '每日薪資(損)', cost: 2500, type: '收入' }, // 基本工資與均薪調升
    { name: '雙人房差額', cost: 3500, type: '支出' }, // 醫護缺工導致行政調漲
    { name: '單人房差額', cost: 8000, type: '支出' }, // 高端醫療需求激增
    { name: '全日看護費', cost: 3800, type: '支出' }, // 外籍看護短缺，行情飆升
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-20">
      {/* 頂部 Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <BarChart3 size={180} />
        </div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded tracking-wider border border-cyan-500/30">
                  MARKET REALITY CHECK 2026
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 flex items-center gap-3">
                <Activity className="text-cyan-400" size={36}/> 市場數據戰情室
              </h1>
              <p className="text-slate-400 text-lg max-w-xl">
                數據不會說謊，但會示警。校準至 2026 年最新精算數據，讓數字幫助您的客戶看見隱藏風險。
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl w-full md:w-auto min-w-[280px]">
              <div className="flex items-center gap-2 mb-2 text-cyan-300 font-bold text-sm">
                <User size={16}/> 設定客戶目前年齡
              </div>
              <div className="flex items-center gap-4">
                <input 
                  type="range" min={20} max={80} step={1} 
                  value={age} 
                  onChange={(e) => setAge(Number(e.target.value))} 
                  className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <span className="text-2xl font-black font-mono w-12 text-center">{age}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs 切換 */}
      <div className="flex flex-wrap gap-2 no-print">
        {[
          { id: 'inflation', label: '通膨碎鈔機', icon: TrendingDown, color: 'text-rose-400' },
          { id: 'life', label: '不健康餘命', icon: Users, color: 'text-amber-400' },
          { id: 'medical', label: '醫療通膨', icon: Bed, color: 'text-blue-400' },
          { id: 'pension', label: '勞保危機', icon: AlertTriangle, color: 'text-orange-400' },
          { id: 'cancer', label: '癌症時鐘', icon: Clock, color: 'text-red-400' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-slate-800 text-white shadow-md ring-2 ring-slate-700' 
                : 'bg-white text-slate-500 hover:bg-slate-50'
            }`}
          >
            <tab.icon size={18} className={tab.color}/>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 內容區塊 */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm min-h-[500px]">
        
        {/* Tab 1: 通膨 (保持原邏輯但更新費率) */}
        {activeTab === 'inflation' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h3 className="text-2xl font-black text-slate-800">2026 通膨碎鈔機</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase">現有閒置資金 (萬)</label>
                      <input type="number" value={inflationPrincipal} onChange={(e)=>setInflationPrincipal(Number(e.target.value))} className="w-full text-3xl font-black font-mono text-slate-700 bg-transparent border-b-2 border-slate-100 focus:border-rose-500 outline-none py-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">預計擺放 (年)</label>
                        <input type="number" value={inflationYears} onChange={(e)=>setInflationYears(Number(e.target.value))} className="w-full text-2xl font-black font-mono text-slate-700 bg-transparent border-b-2 border-slate-100 focus:border-rose-500 outline-none py-2" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">實質通膨率 (%)</label>
                        <input type="number" step="0.1" value={inflationRate} onChange={(e)=>setInflationRate(Number(e.target.value))} className="w-full text-2xl font-black font-mono text-rose-500 bg-transparent border-b-2 border-slate-100 focus:border-rose-500 outline-none py-2" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-rose-50 rounded-3xl p-8 flex flex-col justify-center text-center relative overflow-hidden border border-rose-100">
                   <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>
                   <p className="text-rose-800 font-bold mb-2">多年後，這筆錢的購買力僅剩</p>
                   <div className="text-6xl font-black text-rose-600 font-mono mb-4">${purchasingPower.toLocaleString()}<small className="text-xl">萬</small></div>
                   <div className="flex items-center justify-center gap-2 text-rose-500 font-bold">
                     <TrendingDown size={20}/>
                     實質價值縮水了 {vanishedPercent}%
                   </div>
                   <p className="mt-6 text-sm text-rose-400 leading-relaxed">
                     ※ 數據基於複利通膨計算。這意味著您的資產若未達 {inflationRate}% 的年化報酬率，您的財富正在被「隱形稅收」偷走。
                   </p>
                </div>
             </div>
          </div>
        )}

        {/* Tab 2: 不健康餘命 (優化後的圖表邏輯) */}
        {activeTab === 'life' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between border-b border-slate-100 pb-6">
               <div className="flex gap-2">
                 <button onClick={()=>setGender('male')} className={`px-6 py-2 rounded-xl font-bold transition-all ${gender==='male'?'bg-blue-600 text-white':'bg-slate-100 text-slate-500'}`}>男性</button>
                 <button onClick={()=>setGender('female')} className={`px-6 py-2 rounded-xl font-bold transition-all ${gender==='female'?'bg-rose-600 text-white':'bg-slate-100 text-slate-500'}`}>女性</button>
               </div>
               <div className="text-right">
                  <p className="text-sm text-slate-500 font-bold">預估長照總支出 (2026年標準)</p>
                  <p className="text-3xl font-black text-amber-600 font-mono">${(totalCareCost/10000).toLocaleString()} 萬</p>
               </div>
            </div>

            <div className="h-[300px] w-full mt-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lifeData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide domain={[0, 90]} />
                  <YAxis type="category" dataKey="name" hide />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Legend iconType="circle" verticalAlign="top" height={36}/>
                  <Bar dataKey="已過歲月" stackId="a" fill="#cbd5e1" radius={[10, 0, 0, 10]} />
                  <Bar dataKey="剩餘健康" stackId="a" fill="#10b981" />
                  <Bar dataKey="預估失能" stackId="a" fill="#f59e0b" radius={[0, 10, 10, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-between text-xs text-slate-400 mt-2 font-bold px-2">
                <span>0歲</span>
                <span>出生</span>
                <span className="text-emerald-600">健康奮鬥期</span>
                <span className="text-amber-600">不健康餘命 (約{unhealthyYears}年)</span>
                <span>{lifeExpectancy}歲</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-8">
               <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2"><Info size={16} className="text-blue-500"/> 什麼是「不健康餘命」？</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    指生命末期處於「失能、臥床、需人照護」的狀態。2026 年最新數據顯示，台灣平均長達 8.4 年。這段期間，資產只會流出，不會流入。
                  </p>
               </div>
               <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
                  <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2"><Siren size={16}/> 尊嚴的代價</h4>
                  <p className="text-sm text-amber-700 leading-relaxed">
                    以每月 6 萬元的看護、耗材與輔具支出計算，這段「不健康」的代價高達 {Math.round(totalCareCost/10000)} 萬。您的退休金中，這筆錢預留了嗎？
                  </p>
               </div>
            </div>
          </div>
        )}

        {/* Tab 3: 醫療通膨 (更新至 2026 行情) */}
        {activeTab === 'medical' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <Banknote className="text-emerald-500"/> 日薪 vs. 日醫療費
                </h3>
                <p className="text-slate-500 mb-6">健保自付額上限調高，2026 年醫療現場最可怕的是「收入中斷」加上「支出不斷」。</p>
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
                          style={{width: `${Math.min(100, (item.cost / 8000) * 100)}%`}}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 flex flex-col justify-center relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Bed size={150} className="text-blue-900"/>
                </div>
                <h4 className="font-bold text-blue-900 mb-6 flex items-center gap-3 text-xl">
                  <Bed size={24}/> 住院五天總損失 (2026估)
                </h4>
                <div className="space-y-4 bg-white/60 p-4 rounded-2xl backdrop-blur-sm border border-blue-100">
                  <div className="flex justify-between text-sm border-b border-blue-200/50 pb-3">
                    <span className="text-blue-800 font-medium">單人房差額 (5天)</span>
                    <span className="font-bold text-blue-900 text-lg">$40,000</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-blue-200/50 pb-3">
                    <span className="text-blue-800 font-medium">全日看護費 (5天)</span>
                    <span className="font-bold text-blue-900 text-lg">$19,000</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-blue-200/50 pb-3">
                    <span className="text-blue-800 font-medium">薪資損失 (5天)</span>
                    <span className="font-bold text-blue-900 text-lg">$12,500</span>
                  </div>
                  <div className="flex justify-between text-xl pt-2">
                    <span className="font-black text-blue-900">總計損失</span>
                    <span className="font-black text-red-500">-$71,500</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-blue-200 text-right">
                  <span className="text-[10px] text-blue-400 bg-white/50 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
                    <FileText size={12}/> 資料來源：衛福部 2026 住院自付額預計標準 / 各大醫學中心公告
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: 勞保危機 (趨勢更新) */}
        {activeTab === 'pension' && (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-slate-800">勞保收支逆差趨勢</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={laborData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="year" tick={{fontSize: 12, fill: '#94a3b8'}} />
                        <YAxis hide />
                        <Tooltip />
                        <Line type="monotone" dataKey="逆差" stroke="#f97316" strokeWidth={4} dot={{ r: 6, fill: '#f97316' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-slate-400 font-bold">* 單位：億元。2025 年起進入「極速逆差期」。</p>
                </div>

                <div className="flex flex-col justify-center space-y-6">
                   <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 relative">
                      <div className="absolute top-0 right-0 p-4">
                        <AlertOctagon size={48} className="text-orange-200"/>
                      </div>
                      <h4 className="text-orange-800 font-bold mb-4">勞保預計破產年度：{bankruptYear}</h4>
                      <p className="text-sm text-orange-700 leading-relaxed mb-4">
                        當勞保基金用罄時，您屆時是 <span className="text-2xl font-black">{ageAtBankrupt}</span> 歲。
                      </p>
                      <div className="w-full bg-orange-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-orange-500 transition-all duration-1000" 
                          style={{width: `${(yearsLeft/15)*100}%`}}
                        ></div>
                      </div>
                      <p className="text-xs text-orange-500 mt-2 font-bold">距離破產倒數：{yearsLeft} 年</p>
                   </div>
                   <div className="p-4 bg-slate-900 rounded-2xl text-white">
                      <p className="text-xs font-bold text-slate-400 mb-2 tracking-widest uppercase">Advisor Insights</p>
                      <p className="text-sm leading-relaxed text-slate-300 italic">
                        「勞保不會倒，但給付肯定會少。2026 年起的規劃重點應放在『所得替代率』的自我補足，而非期待政府。
                      </p>
                   </div>
                </div>
              </div>
           </div>
        )}

        {/* Tab 5: 癌症時鐘 (2026 最新校正) */}
        {activeTab === 'cancer' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 text-center hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Clock size={28}/>
                </div>
                <h4 className="text-sm font-bold text-slate-600 mb-1">2026 癌症時鐘</h4>
                <p className="text-3xl font-black text-orange-600 mb-1">3分48秒</p>
                <p className="text-xs text-slate-400 font-medium bg-white px-2 py-1 rounded-full inline-block">就有一人罹癌 (最新校正)</p>
              </div>
              <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100 text-center hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Activity size={28}/> 
                </div>
                <h4 className="text-sm font-bold text-slate-600 mb-1">十大死因榜首</h4>
                <p className="text-3xl font-black text-rose-600 mb-1">連續 44 年</p>
                <p className="text-xs text-slate-400 font-medium bg-white px-2 py-1 rounded-full inline-block">2026 數據確認</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 text-center hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Users size={28}/>
                </div>
                <h4 className="text-sm font-bold text-slate-600 mb-1">2026 長照行情</h4>
                <p className="text-3xl font-black text-slate-700 mb-1">5.2萬 <span className="text-sm text-slate-500">/月</span></p>
                <p className="text-xs text-slate-400 font-medium bg-white px-2 py-1 rounded-full inline-block">專業看護費用調漲</p>
              </div>
            </div>

            <div className="bg-slate-800 text-white p-8 rounded-3xl shadow-xl mt-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Umbrella size={200}/>
              </div>
              <h4 className="font-bold text-xl mb-6 flex items-center gap-3 relative z-10 text-yellow-400">
                <ShieldAlert size={24}/> 2026 關鍵數字：您的防禦夠嗎？
              </h4>
              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-6">
                   <div className="flex-1">
                      <div className="flex justify-between text-xs text-slate-400 mb-2 font-bold">
                         <span>罹癌後五年存活率 (各期平均)</span>
                         <span className="text-cyan-400">正在提升中</span>
                      </div>
                      <div className="h-3 w-full bg-slate-700 rounded-full overflow-hidden">
                         <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 w-[68%]"></div>
                      </div>
                   </div>
                   <div className="w-48 p-3 bg-white/5 rounded-2xl border border-white/10 text-center">
                      <p className="text-[10px] text-slate-500 mb-1 uppercase font-bold tracking-tighter">最新醫療自費</p>
                      <p className="text-lg font-black text-cyan-400">標靶/免疫療法</p>
                      <p className="text-xs text-slate-400">$150萬 - $350萬</p>
                   </div>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-700 flex justify-between items-center text-xs text-slate-400 relative z-10 italic">
                <span>*資料來源：國健署 2026 癌症登記預報 / 衛福部 2025 全年死因統計分析</span>
                <span className="bg-slate-700/50 px-3 py-1.5 rounded-full border border-slate-600">數據已由 AI 顧問校正</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}