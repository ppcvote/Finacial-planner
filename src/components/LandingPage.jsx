import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  FileBarChart, 
  Clock, 
  ChevronRight, 
  Users, 
  Rocket, 
  Target, 
  ShoppingBag, 
  Zap, 
  HeartPulse, 
  Crosshair, 
  ShieldCheck, 
  ArrowRight,
  Monitor, 
  Smartphone, 
  Database, 
  Lock, 
  CheckCircle2,
  Globe, 
  Mail, 
  MessageSquare, 
  PlayCircle, 
  TriangleAlert, // 更新後的名稱
  OctagonAlert,  // 更新後的名稱
  Landmark, 
  ChevronLeft, 
  Wallet
} from 'lucide-react';

// --- 子組件：頂部跑馬燈 ---
const MarketTicker = () => {
  const [seconds, setSeconds] = useState(228); // 3分48秒
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => (prev <= 1 ? 228 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m} 分 ${rs < 10 ? '0' : ''}${rs} 秒`;
  };

  return (
    <div className="bg-red-600 text-white py-2 overflow-hidden whitespace-nowrap relative z-50 shadow-lg">
      <div className="flex animate-marquee items-center gap-12 font-black text-[10px] md:text-xs uppercase tracking-widest">
        <span className="flex items-center gap-2"><Clock size={14}/> 2026 癌症時鐘倒數：{formatTime(seconds)}</span>
        <span className="flex items-center gap-2"><TriangleAlert size={14}/> 2026 預估醫療通膨：+15.8%</span>
        <span className="flex items-center gap-2"><TrendingUp size={14}/> 實質體感通膨：4.5% 起</span>
        <span className="flex items-center gap-2"><ShieldAlert size={14}/> 勞保破產倒數：2031 臨界點</span>
        <span className="flex items-center gap-2"><Clock size={14}/> 2026 癌症時鐘倒數：{formatTime(seconds)}</span>
        <span className="flex items-center gap-2"><TriangleAlert size={14}/> 2026 預估醫療通膨：+15.8%</span>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

// --- 子組件：戰略卡片 ---
const FeatureCard = ({ icon: Icon, title, desc, tags, color }) => (
  <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-[2.5rem] hover:border-blue-500/50 transition-all group hover:-translate-y-2 shadow-2xl backdrop-blur-sm">
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-2xl ${color} ring-4 ring-white/5`}>
      <Icon size={32} className="text-white" />
    </div>
    <h3 className="text-2xl font-bold text-white mb-4 tracking-tight group-hover:text-blue-400 transition-colors">{title}</h3>
    <p className="text-slate-400 text-base leading-relaxed mb-8">{desc}</p>
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, i) => (
        <span key={i} className="text-[10px] font-black px-3 py-1 bg-slate-950 text-slate-500 rounded-full border border-slate-800 uppercase tracking-widest">
          {tag}
        </span>
      ))}
    </div>
  </div>
);

// --- 子組件：章節標題 ---
const SectionHeader = ({ badge, title, subtitle }) => (
  <div className="text-center mb-20 space-y-6">
    <span className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] rounded-full shadow-inner">
      {badge}
    </span>
    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight">{title}</h2>
    <p className="text-slate-400 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">{subtitle}</p>
  </div>
);

// --- 主組件：具名匯出 (加入 onHome prop 以便點擊 Logo 回到官網) ---
export function LandingPage({ onStart, onSignup, onHome }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-600 selection:text-white font-sans overflow-x-hidden animate-fade-in">
      
      <MarketTicker />

      {/* Navigation */}
      <nav className="border-b border-white/5 backdrop-blur-2xl sticky top-0 z-[100] bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo - 加入點擊事件 */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={onHome}
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-2xl shadow-blue-600/40 group-hover:scale-110 transition-transform">
              <Activity className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter italic uppercase">
              Ultra<span className="text-blue-500">Advisor</span>
            </span>
          </div>
          
          <div className="hidden lg:flex items-center gap-10">
            {['戰略工具', '數據中心', '智慧報表', '顧問社群'].map(item => (
              <a key={item} href="#" className="text-sm font-bold text-slate-400 hover:text-white transition-all tracking-tight relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></span>
              </a>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={onStart} 
              className="hidden sm:block text-slate-400 hover:text-white font-bold text-sm transition-colors tracking-widest uppercase"
            >
              登入系統
            </button>
            <button 
              onClick={onSignup}
              className="bg-white text-slate-950 px-8 py-3 rounded-full font-black text-sm hover:bg-blue-600 hover:text-white transition-all shadow-2xl shadow-white/5 active:scale-95"
            >
              立刻開通
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-40 overflow-hidden text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none opacity-50"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-10">
          <div className="space-y-8">
            <span className="inline-flex items-center gap-3 px-5 py-2 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] shadow-xl">
              <Zap size={14} className="animate-pulse fill-blue-400" /> 下一代財務顧問的數位武裝
            </span>
            <h1 className="text-6xl md:text-9xl font-black text-white leading-[0.9] tracking-tighter">
              讓數據說話 <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500">讓戰略成真</span>
            </h1>
            <p className="text-slate-400 max-w-3xl mx-auto text-lg md:text-2xl font-medium leading-relaxed opacity-80">
              UltraAdvisor 專為頂級顧問設計。整合 2026 最新官方數據，將複雜的財務邏輯轉化為極具視覺衝擊力的決策戰報。
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 pt-12 px-4">
            <button 
              onClick={onSignup}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-12 py-6 rounded-[2.5rem] font-black text-xl shadow-2xl shadow-blue-600/40 flex items-center justify-center gap-4 group transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            >
              註冊試用體驗 <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* 市場數據預警區 (數據同步 2026) */}
      <section className="py-32 bg-slate-900/40 border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <SectionHeader 
            badge="2026 Crisis Report"
            title="數據不會說謊，它會示警"
            subtitle="整合 2026 最新官方數據模型，將殘酷的社會趨勢轉化為顧問談案的最強依據。"
          />
          <div className="grid md:grid-cols-3 gap-10 px-4">
            {/* 癌症時鐘 */}
            <div className="bg-gradient-to-br from-red-600/10 to-slate-900 border border-red-600/20 p-12 rounded-[4rem] text-center space-y-8 shadow-2xl hover:scale-105 transition-transform group">
              <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(220,38,38,0.3)] group-hover:scale-110 transition-transform"><Clock className="text-white" size={48} /></div>
              <h3 className="text-2xl font-black text-white tracking-widest uppercase">2026 癌症時鐘</h3>
              <div className="text-6xl font-black text-red-500 font-mono tracking-tighter animate-pulse">3分48秒</div>
              <p className="text-slate-400 text-sm leading-relaxed italic font-medium">每 3'48" 即有一人罹癌。癌症不再是終點，而是「資產風險」的起點。</p>
            </div>
            {/* 不健康餘命 */}
            <div className="bg-gradient-to-br from-amber-600/10 to-slate-900 border border-amber-600/20 p-12 rounded-[4rem] text-center space-y-8 shadow-2xl hover:scale-105 transition-transform group">
              <div className="w-24 h-24 bg-amber-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(217,119,6,0.3)] group-hover:scale-110 transition-transform"><Users className="text-white" size={48} /></div>
              <h3 className="text-2xl font-black text-white tracking-widest uppercase">不健康餘命</h3>
              <div className="text-6xl font-black text-amber-500 font-mono tracking-tighter">8.4 年</div>
              <p className="text-slate-400 text-sm leading-relaxed italic font-medium">生命末期的失能狀態。2026 最新精算，個人平均需準備高昂的尊嚴金。</p>
            </div>
            {/* 勞保危機 */}
            <div className="bg-gradient-to-br from-blue-600/10 to-slate-900 border border-blue-600/20 p-12 rounded-[4rem] text-center space-y-8 shadow-2xl hover:scale-105 transition-transform group">
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(37,99,235,0.3)] group-hover:scale-110 transition-transform"><OctagonAlert className="text-white" size={48} /></div>
              <h3 className="text-2xl font-black text-white tracking-widest uppercase">勞保破產倒數</h3>
              <div className="text-6xl font-black text-blue-500 font-mono tracking-tighter">2031 年</div>
              <p className="text-slate-400 text-sm leading-relaxed italic font-medium">退休即懸崖。規劃必須建立在「沒有勞保也能活」的資產自理前提。</p>
            </div>
          </div>
        </div>
      </section>

      {/* 核心工具箱展示 */}
      <section className="py-40">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader 
            badge="Strategic Toolbox"
            title="顧問專屬的三大戰略系統"
            subtitle="將生硬的數字轉化為可執行的致富計畫。"
          />
          <div className="grid md:grid-cols-3 gap-10 px-4">
            <FeatureCard 
              icon={Rocket}
              title="創富：槓桿與套利"
              desc="學貸活化、房產轉增貸、超積極存錢法。利用 2026 市場利率波動，實現資產階級躍遷。"
              tags={['百萬禮物', 'RE活化', '低利套利']}
              color="bg-blue-600 shadow-blue-600/30"
            />
            <FeatureCard 
              icon={ShieldCheck}
              title="守富：現金流防禦"
              desc="建立大小水庫母子系統，規劃五年換車與長照準備。確保資產在風險中依然穩健成長。"
              tags={['大小水庫', '尊嚴準備', '退休缺口']}
              color="bg-emerald-600 shadow-emerald-600/30"
            />
            <FeatureCard 
              icon={Landmark}
              title="傳富：稅務與傳承"
              desc="針對 2026 最新稅法，進行遺產稅流動性缺口測試，實現財富完美、安全地落地。"
              tags={['稅務預估', '缺口測試', '傳承戰略']}
              color="bg-purple-600 shadow-purple-600/30"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-white/5 py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-16 relative z-10 text-sm">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg"><Activity className="text-white" size={18} /></div>
              <span className="text-xl font-black text-white tracking-tighter italic uppercase">UltraAdvisor</span>
            </div>
            <p className="text-slate-500 font-bold leading-relaxed">下一代顧問的數位戰情室。整合 2026 最強財務模型與戰略系統。</p>
          </div>
          <div><h4 className="text-white font-black mb-8 tracking-widest uppercase text-xs opacity-40">核心戰略</h4><ul className="space-y-4 text-slate-500 font-bold"><li>創富：槓桿套利系統</li><li>守富：現金流防禦系統</li><li>傳富：稅務與傳承系統</li></ul></div>
          <div><h4 className="text-white font-black mb-8 tracking-widest uppercase text-xs opacity-40">數據中心</h4><ul className="space-y-4 text-slate-500 font-bold"><li>2026 癌症時鐘模型</li><li>醫療通膨實時數據</li><li>勞保破產精算報告</li></ul></div>
          <div><h4 className="text-white font-black mb-8 tracking-widest uppercase text-xs opacity-40">聯繫我們</h4><div className="flex gap-5"><Globe size={20} className="text-slate-500 hover:text-blue-400 cursor-pointer"/><Mail size={20} className="text-slate-500 hover:text-blue-400 cursor-pointer"/><MessageSquare size={20} className="text-slate-500 hover:text-blue-400 cursor-pointer"/></div></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">© 2026 UltraAdvisor Pro. All rights reserved.</p>
        </div>
      </footer>

      {/* 全域動畫 */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}

// --- 預設匯出 ---
export default LandingPage;