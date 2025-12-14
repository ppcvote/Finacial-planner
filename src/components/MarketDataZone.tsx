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
  FileText
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function MarketDataZone() {
  const [activeTab, setActiveTab] = useState('pension');
  const [age, setAge] = useState(35); // 預設客戶年齡

  // 1. 勞保虧損數據 (2024年最新逆差 665億)
  const laborData = [
    { year: '2017', 逆差: 275 },
    { year: '2018', 逆差: 251 },
    { year: '2020', 逆差: 487 },
    { year: '2022', 逆差: 386 },
    { year: '2023', 逆差: 446 },
    { year: '2024', 逆差: 665 },
  ];

  // 2. 醫療/長照費用數據
  const medicalCostData = [
    { name: '每日薪資(均)', cost: 1800, type: '收入' },
    { name: '雙人房差額', cost: 2500, type: '支出' },
    { name: '單人房差額', cost: 6000, type: '支出' },
    { name: '全日看護', cost: 2800, type: '支出' },
  ];

  // 動態計算：勞保破產倒數
  const currentYear = new Date().getFullYear();
  const bankruptYear = 2031;
  const yearsLeft = Math.max(0, bankruptYear - currentYear);
  const ageAtBankrupt = age + yearsLeft;

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-20">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <BarChart3 size={180} />
        </div>
        <div className="relative z-10">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                 <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 flex items-center gap-3">
                   <Activity className="text-cyan-400" size={36}/> 市場數據戰情室
                 </h1>
                 <p className="text-slate-400 text-lg max-w-xl">
                   數據不會說謊，但數據會示警。這裡匯集了台灣最新的退休、醫療與長照官方統計。
                 </p>
              </div>

              {/* 年齡輸入區 (Personalization) */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl w-full md:w-auto min-w-[280px]">
                 <div className="flex items-center gap-2 mb-2 text-cyan-300 font-bold text-sm">
                    <User size={16}/> 設定您的目前年齡
                 </div>
                 <div className="flex items-center gap-4">
                    <input 
                      type="range" min={20} max={70} step={1} 
                      value={age} 
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="flex-1 h-2 bg-slate-600 rounded-lg accent-cyan-400"
                    />
                    <span className="text-3xl font-black font-mono">{age} <span className="text-sm text-slate-400 font-normal">歲</span></span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button 
          onClick={() => setActiveTab('pension')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all ${activeTab === 'pension' ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
        >
          <TrendingUp size={18}/> 勞保破產危機
        </button>
        <button 
          onClick={() => setActiveTab('medical')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all ${activeTab === 'medical' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
        >
          <Bed size={18}/> 醫療通膨現況
        </button>
        <button 
          onClick={() => setActiveTab('cancer')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all ${activeTab === 'cancer' ? 'bg-orange-500 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
        >
          <Clock size={18}/> 癌症與長照
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 min-h-[400px]">
        
        {/* --- Tab 1: 勞保危機 (連結年齡) --- */}
        {activeTab === 'pension' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
             <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-100 pb-4 gap-4">
                <div>
                   <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <AlertTriangle className="text-red-500"/> 勞保收支逆差創新高
                   </h3>
                   <p className="text-sm text-slate-500 mt-1">2024年逆差達 665 億，精算報告估計 2031 年基金恐用罄。</p>
                </div>
                
                {/* 倒數計時卡片 */}
                <div className="bg-red-50 border border-red-100 px-4 py-2 rounded-xl text-right">
                   <div className="text-xs text-red-400 font-bold uppercase flex items-center justify-end gap-1">
                      <Siren size={12}/> 您的暴險倒數
                   </div>
                   <div className="text-2xl font-black text-red-600 font-mono">
                      剩 {yearsLeft} 年
                   </div>
                   <div className="text-xs text-red-800 font-bold">
                      屆時您將 {ageAtBankrupt} 歲
                   </div>
                </div>
             </div>

             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={laborData} margin={{top: 20, right: 30, left: 0, bottom: 0}}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                      <XAxis dataKey="year" tick={{fill: '#64748b'}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fill: '#64748b'}} axisLine={false} tickLine={false} unit="億"/>
                      <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}/>
                      <Legend />
                      <Line type="monotone" dataKey="逆差" name="收支逆差 (億)" stroke="#ef4444" strokeWidth={4} dot={{r: 6}} activeDot={{r: 8}}/>
                   </LineChart>
                </ResponsiveContainer>
             </div>
             
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-2">
                <div className="flex gap-4 items-start">
                    <Info className="text-slate-500 shrink-0 mt-1" size={20}/>
                    <div>
                    <h4 className="font-bold text-slate-700 text-sm">數據解讀：</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        當您 {ageAtBankrupt} 歲時，勞保基金將面臨破產或是大幅改革（少領/多繳）。這意味著您現在規劃的退休金，必須假設「沒有勞保」也能活下去，才是最安全的策略。
                    </p>
                    </div>
                </div>
                {/* 來源標註 */}
                <div className="w-full text-right mt-2">
                    <span className="text-[10px] text-slate-400 bg-white px-2 py-1 rounded border border-slate-100 inline-flex items-center gap-1">
                        <FileText size={10}/> 資料來源：勞動部勞工保險局 2024年財務精算報告
                    </span>
                </div>
             </div>
          </div>
        )}

        {/* --- Tab 2: 醫療通膨 --- */}
        {activeTab === 'medical' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
             <div className="grid md:grid-cols-2 gap-6">
                <div>
                   <h3 className="text-xl font-bold text-slate-800 mb-2">日薪 vs. 日醫療費</h3>
                   <p className="text-sm text-slate-500 mb-6">健保自付額上限調高，生病最可怕的是「收入中斷」加上「支出不斷」。</p>
                   <div className="space-y-4">
                      {medicalCostData.map((item, idx) => (
                         <div key={idx}>
                            <div className="flex justify-between text-sm mb-1">
                               <span className="font-bold text-slate-700">{item.name}</span>
                               <span className={`font-mono font-bold ${item.type === '收入' ? 'text-emerald-600' : 'text-blue-600'}`}>${item.cost.toLocaleString()}</span>
                            </div>
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                               <div 
                                 className={`h-full ${item.type === '收入' ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                                 style={{width: `${(item.cost / 6000) * 100}%`}}
                               ></div>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex flex-col justify-center">
                    <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                       <Bed size={20}/> 住院五天要花多少？
                    </h4>
                    <div className="space-y-3">
                       <div className="flex justify-between text-sm border-b border-blue-200 pb-2">
                          <span className="text-blue-800">單人房差額 (5天)</span>
                          <span className="font-bold text-blue-900">$30,000</span>
                       </div>
                       <div className="flex justify-between text-sm border-b border-blue-200 pb-2">
                          <span className="text-blue-800">全日看護費 (5天)</span>
                          <span className="font-bold text-blue-900">$14,000</span>
                       </div>
                       <div className="flex justify-between text-sm border-b border-blue-200 pb-2">
                          <span className="text-blue-800">薪資損失 (5天)</span>
                          <span className="font-bold text-blue-900">$9,000</span>
                       </div>
                       <div className="flex justify-between text-lg pt-2">
                          <span className="font-black text-blue-900">總計損失</span>
                          <span className="font-black text-red-500">-$53,000</span>
                       </div>
                    </div>
                    {/* 來源標註 */}
                    <div className="mt-6 pt-4 border-t border-blue-200 text-right">
                        <span className="text-[10px] text-blue-400 bg-white/50 px-2 py-1 rounded inline-flex items-center gap-1">
                            <FileText size={10}/> 資料來源：衛福部健保署 2024年住院自付額標準 / 各大醫院公告
                        </span>
                    </div>
                </div>
             </div>
          </div>
        )}

        {/* --- Tab 3: 癌症與長照 --- */}
        {activeTab === 'cancer' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
             <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100 text-center">
                   <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock size={24}/>
                   </div>
                   <h4 className="text-sm font-bold text-slate-600">癌症時鐘</h4>
                   <p className="text-2xl font-black text-orange-600 mt-1">4分19秒</p>
                   <p className="text-xs text-slate-400 mt-1">就有一人罹癌</p>
                </div>
                <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100 text-center">
                   <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Activity size={24}/>
                   </div>
                   <h4 className="text-sm font-bold text-slate-600">十大死因榜首</h4>
                   <p className="text-2xl font-black text-rose-600 mt-1">連續42年</p>
                   <p className="text-xs text-slate-400 mt-1">癌症居冠</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center">
                   <div className="w-12 h-12 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users size={24}/>
                   </div>
                   <h4 className="text-sm font-bold text-slate-600">長照平均花費</h4>
                   <p className="text-2xl font-black text-slate-700 mt-1">4.5萬 <span className="text-sm">/月</span></p>
                   <p className="text-xs text-slate-400 mt-1">不含一次性設備支出</p>
                </div>
             </div>

             <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-lg mt-4">
                <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                   <Info className="text-yellow-400"/> 長照十年總開銷試算
                </h4>
                <div className="flex flex-col gap-4">
                   <div className="flex items-center gap-4">
                      <div className="w-16 text-sm text-slate-400">居家照顧</div>
                      <div className="flex-1 bg-slate-700 h-4 rounded-full overflow-hidden">
                         <div className="bg-blue-500 h-full w-[40%]"></div>
                      </div>
                      <div className="w-20 text-right font-mono font-bold">$360萬</div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-16 text-sm text-slate-400">機構安養</div>
                      <div className="flex-1 bg-slate-700 h-4 rounded-full overflow-hidden">
                         <div className="bg-orange-500 h-full w-[60%]"></div>
                      </div>
                      <div className="w-20 text-right font-mono font-bold text-orange-400">$600萬</div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-16 text-sm text-slate-400">外籍看護</div>
                      <div className="flex-1 bg-slate-700 h-4 rounded-full overflow-hidden">
                         <div className="bg-emerald-500 h-full w-[30%]"></div>
                      </div>
                      <div className="w-20 text-right font-mono font-bold">$300萬</div>
                   </div>
                </div>
                
                {/* 來源標註 */}
                <div className="mt-6 pt-4 border-t border-slate-700 flex justify-between items-center text-xs text-slate-400">
                    <span>*估算長照平均存活年數約 7-10 年</span>
                    <span className="bg-slate-700 px-2 py-1 rounded inline-flex items-center gap-1">
                        <FileText size={10}/> 資料來源：衛福部 112年死因統計 / 國健署癌症登記報告 / 家總
                    </span>
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}