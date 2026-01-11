import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, TrendingUp, TrendingDown, ShieldAlert, Clock, 
  ChevronRight, Users, Rocket, Target, Zap, 
  CheckCircle2, ArrowRight, 
  Sparkles, Crown, Award, Star, Calculator,
  PieChart, DollarSign, Gift, Shield, LineChart, LogIn,
  BarChart3, PlayCircle, TriangleAlert
} from 'lucide-react';

const LOGO_URL = "https://lh3.googleusercontent.com/d/1CEFGRByRM66l-4sMMM78LUBUvAMiAIaJ";
const COMMUNITY_LINK = "https://line.me/ti/g2/9Cca20iCP8J0KrmVRg5GOe1n5dSatYKO8ETTHw?utm_source=invitation&utm_medium=link_copy&utm_campaign=default";
const LINE_OFFICIAL_ACCOUNT = "https://lin.ee/RFE8A5A";

const BetaCountdown = () => {
  const [slots, setSlots] = useState(80);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setSlots(prev => prev > 50 ? prev - 1 : prev);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="inline-flex items-center gap-3 bg-red-600/10 border border-red-500/30 
                    px-5 py-2.5 rounded-full backdrop-blur-sm">
      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      <span className="text-red-400 font-black text-xs uppercase tracking-widest">
        🔥 內測限量 100 名 · 剩餘 <span className="text-red-300 text-sm">{slots}</span> 位
      </span>
    </div>
  );
};

const OptimizedHeroSection = ({ onFreeTrial, onWatchDemo }) => {
  return (
    <section className="relative min-h-screen bg-[#050b14] 
                        bg-[linear-gradient(rgba(77,163,255,0.05)_1px,transparent_1px),
                           linear-gradient(90deg,rgba(77,163,255,0.05)_1px,transparent_1px)]
                        bg-[length:40px_40px] flex items-center justify-center px-4 py-20">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-10">
        
        <div className="flex justify-center animate-fade-in">
          <BetaCountdown />
        </div>

        <div className="space-y-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white 
                         leading-tight tracking-tighter">
            讓每個顧問都有
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 
                           bg-clip-text text-transparent">
              AI 軍師
            </span>
            的超級武器
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-300 font-bold tracking-wide">
            3 分鐘成交，不再土法煉鋼
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto animate-fade-in" 
             style={{animationDelay: '0.4s'}}>
          {[
            { icon: Target, text: "平均每月多成交 3 單", color: "blue" },
            { icon: Clock, text: "節省 15 小時試算時間", color: "amber" },
            { icon: TrendingUp, text: "客戶滿意度 +40%", color: "emerald" }
          ].map((item, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-700/50 
                                   rounded-2xl p-4 backdrop-blur-sm">
              <item.icon className={`text-${item.color}-400 mx-auto mb-2`} size={24} />
              <p className="text-slate-300 text-sm font-bold">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-5 justify-center items-center 
                       animate-fade-in" style={{animationDelay: '0.6s'}}>
          
          <button 
            onClick={onFreeTrial}
            className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 to-blue-500 
                     text-white rounded-2xl font-black text-lg shadow-[0_0_40px_rgba(59,130,246,0.5)]
                     hover:shadow-[0_0_60px_rgba(59,130,246,0.7)] transition-all duration-300
                     hover:-translate-y-1 flex items-center gap-3">
            <Sparkles className="group-hover:rotate-12 transition-transform" size={24} />
            免費獲取 Ultra888 金鑰
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
          </button>

          <button 
            onClick={onWatchDemo}
            className="px-10 py-5 bg-transparent border-2 border-blue-400 text-blue-300 
                     rounded-2xl font-bold text-lg hover:bg-blue-400/10 transition-all
                     flex items-center gap-3">
            <PlayCircle size={20} />
            觀看 60 秒示範
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 
                       text-slate-500 text-sm animate-fade-in" style={{animationDelay: '0.8s'}}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-emerald-400" size={16} />
            <span>7 天免費完整體驗</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-emerald-400" size={16} />
            <span>不需信用卡</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-emerald-400" size={16} />
            <span>隨時可升級</span>
          </div>
        </div>

      </div>
    </section>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [logoError, setLogoError] = useState(false);

  const handleFreeTrial = () => {
    window.open(LINE_OFFICIAL_ACCOUNT, '_blank');
  };

  const handleWatchDemo = () => {
    alert('Demo 影片功能開發中...');
  };

  const handleLogin = () => {
    navigate('/secret-admin-ultra-2026');
  };

  const MarketTicker = () => {
    const [seconds, setSeconds] = useState(228);
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

  return (
    <div className="min-h-screen bg-[#050b14] text-white font-sans">
      
      <MarketTicker />

      <header className="sticky top-0 z-40 bg-[#050b14]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer">
            <img 
              src={logoError ? "https://placehold.co/40x40/3b82f6/white?text=UA" : LOGO_URL}
              alt="Ultra Advisor"
              className="h-10 w-auto"
              onError={() => setLogoError(true)}
            />
            <span className="text-xl font-black tracking-tight">
              <span style={{color: '#FF3A3A'}}>Ultra</span>
              <span className="text-blue-400">Advisor</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href={COMMUNITY_LINK} target="_blank" rel="noopener noreferrer" 
               className="text-slate-400 hover:text-blue-400 font-bold transition-colors">
              社群
            </a>
            
            <button 
              onClick={handleLogin}
              className="flex items-center gap-2 text-slate-400 hover:text-white font-bold transition-colors">
              <LogIn size={18} />
              登入系統
            </button>
            
            <button 
              onClick={handleFreeTrial}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold 
                       transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              免費試用
            </button>
          </nav>

          <div className="md:hidden flex items-center gap-3">
            <button 
              onClick={handleLogin}
              className="text-slate-400 hover:text-white font-bold text-sm">
              登入
            </button>
            <button 
              onClick={handleFreeTrial}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-sm
                       transition-all">
              試用
            </button>
          </div>
        </div>
      </header>

      <main>
        <OptimizedHeroSection 
          onFreeTrial={handleFreeTrial}
          onWatchDemo={handleWatchDemo}
        />

        <section className="py-32 bg-gradient-to-b from-slate-950 to-blue-950/20">
          <div className="max-w-4xl mx-auto text-center px-6">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight">
              準備好升級你的
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                顧問武器庫
              </span>
              了嗎？
            </h2>
            <p className="text-slate-400 text-xl mb-12">
              加入 20+ 位菁英顧問行列，開始你的 7 天免費試用
            </p>
            <button 
              onClick={handleFreeTrial}
              className="px-12 py-6 bg-gradient-to-r from-blue-600 to-blue-500 
                       text-white rounded-2xl font-black text-xl 
                       shadow-[0_0_50px_rgba(59,130,246,0.5)]
                       hover:shadow-[0_0_80px_rgba(59,130,246,0.7)] 
                       transition-all hover:-translate-y-2 inline-flex items-center gap-3">
              <Sparkles size={28} />
              立即獲取 Ultra888 金鑰
              <ArrowRight size={24} />
            </button>
            <p className="text-slate-500 text-sm mt-6">
              ✓ 7 天免費 ✓ 不需信用卡 ✓ 隨時可取消
            </p>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 border-t border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-600 text-sm font-bold">
            © 2026 UltraAdvisor. 讓數據為你說話，讓 AI 當你的軍師。
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
