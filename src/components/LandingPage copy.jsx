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
  TriangleAlert,
  OctagonAlert,
  Landmark, 
  ChevronLeft, 
  Wallet,
  X,
  Car,
  Heart,
  ExternalLink,
  LayoutDashboard,
  BarChart3,
  FileText
} from 'lucide-react';

// --- 配置區 ---
const LOGO_URL = "https://lh3.googleusercontent.com/d/1CEFGRByRM66l-4sMMM78LUBUvAMiAIaJ"; 
const COMMUNITY_LINK = "https://line.me/ti/g2/9Cca20iCP8J0KrmVRg5GOe1n5dSatYKO8ETTHw?utm_source=invitation&utm_medium=link_copy&utm_campaign=default";

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
  <div className="text-center mb-20 space-y-6 px-4">
    <span className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] rounded-full shadow-inner">
      {badge}
    </span>
    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight">{title}</h2>
    <p className="text-slate-400 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">{subtitle}</p>
  </div>
);

// --- 視圖組件：戰略工具 ---
const ToolsView = () => (
  <div className="max-w-7xl mx-auto px-6 py-20">
    <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6 px-4">
      <div className="space-y-4">
        <span className="text-blue-500 font-black tracking-widest uppercase text-xs">Tactical Arsenal</span>
        <h2 className="text-5xl font-black text-white">戰略工具箱</h2>
      </div>
      <p className="text-slate-400 max-w-md">專業顧問必備的創富與守富工具，將生硬的數字轉化為可執行的計畫。</p>
    </div>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
      {[
        { icon: Rocket, title: "學貸活化系統", desc: "低利資產的二次生命，創造套利空間。", tag: "創富" },
        { icon: Landmark, title: "房產轉增貸工具", desc: "活化房地產死錢，重新配置高報酬標的。", tag: "槓桿" },
        { icon: Wallet, title: "超積極存錢法", desc: "精準配置現金流，對抗通膨侵蝕。", tag: "配置" },
        { icon: ShieldCheck, title: "大小水庫母子系統", desc: "守富防禦的核心，確保風險中資產穩健。", tag: "守富" },
        { icon: Car, title: "五年換車計畫", desc: "資產配置與夢想實現的平衡點。", tag: "生活" },
        { icon: HeartPulse, title: "長照尊嚴準備金", desc: "精算未來醫療成本，守護晚年尊嚴。", tag: "醫療" }
      ].map((tool, i) => (
        <div key={i} className="bg-slate-900 border border-white/5 p-8 rounded-[2rem] hover:border-blue-500/50 transition-all group shadow-xl">
          <div className="w-14 h-14 bg-blue-600/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <tool.icon className="text-blue-500" size={28} />
          </div>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{tool.title}</h3>
            <span className="text-[10px] font-black px-2 py-0.5 bg-slate-800 text-slate-400 rounded uppercase">{tool.tag}</span>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">{tool.desc}</p>
          <button className="w-full py-3 bg-slate-800 hover:bg-blue-600 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
            啟動工具 <ChevronRight size={16} />
          </button>
        </div>
      ))}
    </div>
  </div>
);

// --- 視圖組件：數據中心 ---
const DataView = () => (
  <div className="max-w-7xl mx-auto px-6 py-20">
    <SectionHeader badge="Global Data Insights" title="智慧數據戰情室" subtitle="整合 2026 全球經濟趨勢與實質通膨熱點。" />
    <div className="grid lg:grid-cols-3 gap-10 px-4">
      <div className="lg:col-span-2 space-y-10">
        <div className="bg-slate-900 border border-white/5 p-8 rounded-[3rem] relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10"><BarChart3 size={120} /></div>
          <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3"><Globe className="text-blue-500" size={24} /> 2026 全球經濟趨勢追蹤</h3>
          <div className="h-64 flex items-end gap-3 justify-between">
            {[60, 40, 80, 50, 90, 70, 85].map((h, i) => (
              <div key={i} className="flex-1 bg-blue-600/20 rounded-t-lg relative group">
                <div style={{ height: `${h}%` }} className="bg-blue-600 rounded-t-lg transition-all group-hover:bg-blue-400"></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-6 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            <span>醫療</span><span>科技</span><span>能源</span><span>消費</span><span>基建</span><span>金融</span><span>房產</span>
          </div>
        </div>
      </div>
      <div className="bg-blue-600/5 border border-blue-500/20 p-8 rounded-[3rem] space-y-8 shadow-2xl">
        <h3 className="text-xl font-bold text-white flex items-center gap-3"><Zap size={20} className="text-blue-500" /> 智慧決策引擎</h3>
        <p className="text-sm text-slate-400 leading-relaxed">利用 AI 整合最新市場變數，提供即時數據支撐。</p>
        <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-lg shadow-blue-500/30 transition-all active:scale-95">
          <Zap size={18} /> 獲取即時洞察
        </button>
      </div>
    </div>
  </div>
);

// --- 視圖組件：戰略報表 ---
const ReportsView = () => (
  <div className="max-w-7xl mx-auto px-6 py-20 text-center">
    <SectionHeader badge="Visual Strategy" title="讓專業被看見" subtitle="將財務計畫轉化為視覺說服力的戰略報表。" />
    <div className="relative group max-w-4xl mx-auto px-4">
      <div className="bg-white rounded-[2rem] shadow-[0_0_100px_rgba(59,130,246,0.1)] p-8 md:p-12 text-slate-800 text-left space-y-10 border border-slate-200">
        <div className="flex justify-between items-center border-b pb-8 border-slate-100">
          <div>
            <h4 className="text-3xl font-black italic uppercase tracking-tighter">Ultra<span className="text-blue-600">Report</span></h4>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Confidential Strategic Analysis</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-12 text-slate-200">
          <div className="h-40 bg-slate-50 rounded-2xl flex items-center justify-center"><BarChart3 size={80} /></div>
          <div className="h-40 bg-slate-50 rounded-2xl flex items-center justify-center"><ShieldCheck size={80} /></div>
        </div>
        <div className="p-8 bg-blue-600 rounded-3xl text-white shadow-xl">
          <p className="text-lg font-medium italic leading-relaxed">「根據 2026 數據，建議啟動學貸套利資產活化計畫。」</p>
        </div>
      </div>
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center rounded-[2rem] opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
        <button className="bg-white text-slate-950 px-10 py-5 rounded-full font-black text-lg flex items-center gap-3">
          <FileText className="text-blue-600" /> 立即生成報表
        </button>
      </div>
    </div>
  </div>
);

// --- 主組件 ---
export function LandingPage({ onStart, onHome }) {
  const [view, setView] = useState('home');
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  const communityLink = "https://line.me/ti/g2/9Cca20iCP8J0KrmVRg5GOe1n5dSatYKO8ETTHw?utm_source=invitation&utm_medium=link_copy&utm_campaign=default";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-600 selection:text-white font-sans overflow-x-hidden relative">
      
      {/* 所有的頁面內容放入此動畫容器中 */}
      <div className="animate-fade-in flex flex-col min-h-screen">
        <MarketTicker />

        {/* Navigation */}
        <nav className="border-b border-white/5 backdrop-blur-2xl sticky top-0 z-[100] bg-slate-950/80">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            {/* LOGO 顯示區塊 */}
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={() => { setView('home'); if(onHome) onHome(); }}
            >
              <div className="h-10 transition-transform group-hover:scale-105 overflow-hidden rounded-lg">
                <img 
                  src={logoError ? "https://placehold.co/100x100/3b82f6/white?text=LOGO" : LOGO_URL} 
                  alt="Logo" 
                  className="h-full w-auto object-contain"
                  onError={() => setLogoError(true)}
                />
              </div>
              <span className="text-2xl font-black text-white tracking-tighter italic uppercase">
                Ultra<span className="text-blue-500">Advisor</span>
              </span>
            </div>
            
            <div className="hidden lg:flex items-center gap-10">
              {[
                { id: 'tools', label: '戰略工具' },
                { id: 'data', label: '數據中心' },
                { id: 'reports', label: '智慧報表' }
              ].map(item => (
                <button 
                  key={item.id} 
                  onClick={() => setView(item.id)}
                  className={`text-sm font-bold transition-all tracking-tight relative group ${
                    view === item.id ? 'text-blue-500' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-blue-500 transition-all ${view === item.id ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                </button>
              ))}
              {/* 顧問社群連結 */}
              <a 
                href={communityLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-all tracking-tight relative group flex items-center gap-1"
              >
                顧問社群
                <ExternalLink size={12} />
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all group-hover:w-full"></span>
              </a>
            </div>

            <div className="flex items-center gap-4 md:gap-6">
              {/* 關鍵修復：移除 hidden sm:block，並調整手機版文字大小 */}
              <button 
                onClick={onStart} 
                className="text-slate-400 hover:text-white font-bold text-[10px] md:text-sm transition-colors tracking-widest uppercase whitespace-nowrap"
              >
                登入系統
              </button>
              <button 
                onClick={() => setShowSignupModal(true)}
                className="bg-white text-slate-950 px-5 md:px-8 py-2 md:py-3 rounded-full font-black text-[10px] md:text-sm hover:bg-blue-600 hover:text-white transition-all shadow-2xl shadow-white/5 active:scale-95 whitespace-nowrap"
              >
                立刻開通
              </button>
            </div>
          </div>
        </nav>

        {/* 根據 view 渲染不同區塊 */}
        <main className="flex-grow">
          {view === 'home' && (
            <>
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
                      UltraAdvisor 專為頂級金融顧問設計。整合 2026 最新官方數據，將複雜的財務邏輯轉化為極具視覺衝擊力的決策戰報。
                    </p>
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-center gap-8 pt-12 px-4">
                    <div className="flex flex-col gap-4 items-center">
                      <button 
                        onClick={() => setShowSignupModal(true)}
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-12 py-6 rounded-[2.5rem] font-black text-xl shadow-2xl shadow-blue-600/40 flex items-center justify-center gap-4 group transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                      >
                        獲取開通金鑰 <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                      </button>
                      {/* 手機版輔助登入連結 */}
                      <button 
                        onClick={onStart} 
                        className="md:hidden text-slate-500 font-bold text-xs hover:text-blue-400 underline underline-offset-4"
                      >
                        已有帳號？登入系統
                      </button>
                    </div>
                    <button 
                      onClick={() => setView('tools')}
                      className="w-full md:w-auto bg-slate-900 border border-slate-800 text-white px-12 py-6 rounded-[2.5rem] font-black text-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
                    >
                      探索功能區塊 <LayoutDashboard size={20} />
                    </button>
                  </div>
                </div>
              </section>

              {/* 市場數據預警區 */}
              <section className="py-32 bg-slate-900/40 border-y border-white/5 relative">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                  <SectionHeader 
                    badge="2026 Crisis Report"
                    title="數據不會說謊，它會示警"
                    subtitle="整合 2026 最新官方數據模型，將殘酷的社會趨勢轉化為顧問談案的最強依據。"
                  />
                  <div className="grid md:grid-cols-3 gap-10 px-4">
                    <div className="bg-gradient-to-br from-red-600/10 to-slate-900 border border-red-600/20 p-12 rounded-[4rem] text-center space-y-8 shadow-2xl hover:scale-105 transition-transform group">
                      <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(220,38,38,0.3)] group-hover:scale-110 transition-transform"><Clock className="text-white" size={48} /></div>
                      <h3 className="text-2xl font-black text-white tracking-widest uppercase">2026 癌症時鐘</h3>
                      <div className="text-6xl font-black text-red-500 font-mono tracking-tighter animate-pulse">3分48秒</div>
                      <p className="text-slate-400 text-sm leading-relaxed italic font-medium">每 3'48" 即有一人罹癌。癌症不再是終點，而是「資產風險」的起點。</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-600/10 to-slate-900 border border-amber-600/20 p-12 rounded-[4rem] text-center space-y-8 shadow-2xl hover:scale-105 transition-transform group">
                      <div className="w-24 h-24 bg-amber-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(217,119,6,0.3)] group-hover:scale-110 transition-transform"><Users className="text-white" size={48} /></div>
                      <h3 className="text-2xl font-black text-white tracking-widest uppercase">不健康餘命</h3>
                      <div className="text-6xl font-black text-amber-500 font-mono tracking-tighter">8.4 年</div>
                      <p className="text-slate-400 text-sm leading-relaxed italic font-medium">生命末期的失能狀態。2026 最新精算，個人平均需準備高昂的尊嚴金。</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-600/10 to-slate-900 border border-blue-600/20 p-12 rounded-[4rem] text-center space-y-8 shadow-2xl hover:scale-105 transition-transform group">
                      <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(37,99,235,0.3)] group-hover:scale-110 transition-transform"><OctagonAlert className="text-white" size={48} /></div>
                      <h3 className="text-2xl font-black text-white tracking-widest uppercase">勞保破產倒數</h3>
                      <div className="text-6xl font-black text-blue-500 font-mono tracking-tighter">2031 年</div>
                      <p className="text-slate-400 text-sm leading-relaxed italic font-medium">退休即懸崖。規劃必須建立在「沒有勞保也能活」的資產自理前提。</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 核心工具箱 */}
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
                      tags={['大小水庫', '尊嚴準備', '退休開口']}
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
            </>
          )}
          {view === 'tools' && <ToolsView />}
          {view === 'data' && <DataView />}
          {view === 'reports' && <ReportsView />}
        </main>

        {/* Footer */}
        <footer className="bg-slate-950 border-t border-white/5 py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-16 relative z-10 text-sm">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="h-8 overflow-hidden rounded">
                  <img 
                    src={logoError ? "https://placehold.co/100x100/3b82f6/white?text=LOGO" : LOGO_URL} 
                    alt="Logo" 
                    className="h-full w-auto brightness-110"
                    onError={() => setLogoError(true)}
                  />
                </div>
                <span className="text-xl font-black text-white tracking-tighter italic uppercase">UltraAdvisor</span>
              </div>
              <p className="text-slate-500 font-bold leading-relaxed">下一代顧問的數位戰情室。整合 2026 最強財務模型與戰略系統。</p>
            </div>
            <div><h4 className="text-white font-black mb-8 tracking-widest uppercase text-xs opacity-40">核心戰略</h4><ul className="space-y-4 text-slate-500 font-bold cursor-pointer"><li onClick={() => setView('tools')}>創富：槓桿套利系統</li><li onClick={() => setView('tools')}>守富：現金流防禦系統</li><li onClick={() => setView('tools')}>傳富：稅務與傳承系統</li></ul></div>
            <div><h4 className="text-white font-black mb-8 tracking-widest uppercase text-xs opacity-40">數據中心</h4><ul className="space-y-4 text-slate-500 font-bold cursor-pointer"><li onClick={() => setView('data')}>2026 癌症時鐘模型</li><li onClick={() => setView('data')}>醫療通膨實時數據</li><li onClick={() => setView('data')}>勞保破產精算報告</li></ul></div>
            <div><h4 className="text-white font-black mb-8 tracking-widest uppercase text-xs opacity-40">聯繫我們</h4><div className="flex gap-5"><Globe size={20} className="text-slate-500 hover:text-blue-400 cursor-pointer"/><Mail size={20} className="text-slate-500 hover:text-blue-400 cursor-pointer"/><MessageSquare size={20} className="text-slate-500 hover:text-blue-400 cursor-pointer"/></div></div>
          </div>
          <div className="max-w-7xl mx-auto px-6 mt-24 pt-10 border-t border-white/5 flex justify-between items-center relative z-10">
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">© 2026 UltraAdvisor Pro. All rights reserved.</p>
          </div>
        </footer>
      </div>

      {/* --- 註冊試用彈窗 (Iframe) --- */}
      {showSignupModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" 
            onClick={() => setShowSignupModal(false)}
          />
          <div className="relative bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-w-[440px] w-full flex flex-col">
            <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-100">
              <span className="text-slate-900 font-black text-xs uppercase tracking-widest px-3 py-1 bg-blue-100 rounded-full">立即獲取金鑰</span>
              <button 
                onClick={() => setShowSignupModal(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors group"
              >
                <X size={24} className="text-slate-400 group-hover:text-slate-900" />
              </button>
            </div>
            <div className="bg-white flex justify-center py-2 px-4 overflow-y-auto max-h-[80vh]">
               <iframe 
                src="https://portaly.cc/embed/GinRollBT/product/WsaTvEYOA1yqAQYzVZgy" 
                width="400" 
                height="620" 
                style={{ border: 0, borderRadius: '12px' }} 
                frameBorder="0" 
                loading="lazy"
                title="Register"
              />
            </div>
            <div className="p-4 bg-slate-50 text-center">
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">完成註冊後即可獲得 2026 戰略工具使用權</p>
            </div>
          </div>
        </div>
      )}

      {/* 全域動畫 */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes zoom-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .zoom-in {
          animation: zoom-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}

// 輔助組件：外部連結圖示
const ExternalLinkIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
);

/**
 * App 組件
 */
export default function App() {
  const handleStart = () => {
    console.log("導向登入頁面...");
  };

  return <LandingPage onStart={handleStart} />;
}