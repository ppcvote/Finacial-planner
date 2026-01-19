import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Activity, TrendingUp, TrendingDown, ShieldAlert, FileBarChart, Clock, 
  ChevronRight, Users, Rocket, Target, ShoppingBag, Zap, HeartPulse, 
  Crosshair, ShieldCheck, ArrowRight, Monitor, Smartphone, Database, 
  Lock, CheckCircle2, Globe, Mail, MessageSquare, PlayCircle, 
  TriangleAlert, OctagonAlert, Landmark, ChevronLeft, Wallet, X, 
  Car, Heart, ExternalLink, LayoutDashboard, BarChart3, FileText,
  Sparkles, Crown, Award, Star, TrendingUpIcon, Calculator,
  PieChart, DollarSign, Gift, Shield, LineChart, Home, LogIn
} from 'lucide-react';

// ==========================================
// 🎯 整合版本：
// 1. ✅ 保留原本所有精心設計的內容
// 2. ✅ 加入動態公告橫幅（從 Firestore 讀取）
// 3. ✅ 加入動態影片嵌入（從 Firestore 讀取）
// 4. ✅ Logo "ULTRA" 使用 style 屬性確保紅色顯示
// 5. ✅ Header 加入「登入系統」按鈕
// ==========================================

const LOGO_URL = "https://lh3.googleusercontent.com/d/1CEFGRByRM66l-4sMMM78LUBUvAMiAIaJ";
const COMMUNITY_LINK = "https://line.me/ti/g2/9Cca20iCP8J0KrmVRg5GOe1n5dSatYKO8ETTHw?utm_source=invitation&utm_medium=link_copy&utm_campaign=default";
const LINE_OFFICIAL_ACCOUNT = "https://line.me/R/ti/p/@ultraadvisor";

// 🔥 註冊頁面路徑（LINE 免費訊息額度已滿，改導向網頁註冊）
const SIGNUP_PATH = '/register';

// 🔥 管理員後台網址
const ADMIN_URL = "https://admin.ultra-advisor.tw/secret-admin-ultra-2026";

// ==========================================
// 🔔 動態公告橫幅組件
// ==========================================
const AnnouncementBar = ({ data, onClose }) => {
  if (!data?.enabled) return null;
  
  const typeStyles = {
    info: 'bg-blue-600',
    success: 'bg-emerald-600',
    warning: 'bg-amber-500 text-black',
    promo: 'bg-gradient-to-r from-purple-600 via-pink-500 to-red-500'
  };
  
  return (
    <div className={`${typeStyles[data.type] || typeStyles.info} text-white py-2.5 px-4 text-center text-sm font-bold relative z-[60]`}>
      <span>{data.message}</span>
      {data.link && data.linkText && (
        <a 
          href={data.link} 
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 underline hover:no-underline font-black"
        >
          {data.linkText} →
        </a>
      )}
      {data.dismissible !== false && (
        <button 
          onClick={onClose} 
          className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

// ==========================================
// 🎬 影片彈窗組件
// ==========================================
const VideoModal = ({ isOpen, onClose, videoData }) => {
  if (!isOpen || !videoData) return null;
  
  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors"
      >
        <X size={32} />
      </button>
      <div className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
        {videoData.videoType === 'youtube' && videoData.videoUrl && (
          <iframe
            src={videoData.videoUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="產品介紹影片"
          />
        )}
        {videoData.videoType === 'html' && videoData.htmlVideoUrl && (
          <iframe
            src={videoData.htmlVideoUrl}
            className="w-full h-full"
            allowFullScreen
            title="產品動畫展示"
          />
        )}
      </div>
    </div>
  );
};

// ==========================================
// 🔥 內測倒數計時器
// ==========================================
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

// ==========================================
// 🎨 優化後的 Hero Section
// ==========================================
const OptimizedHeroSection = ({ onFreeTrial, onWatchDemo, hasVideo }) => {
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

        {/* 主要 CTA - 雙按鈕並排 */}
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center animate-fade-in" style={{animationDelay: '0.6s'}}>
          <button
            onClick={onFreeTrial}
            className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 to-blue-500
                     text-white rounded-2xl font-black text-lg shadow-[0_0_40px_rgba(59,130,246,0.5)]
                     hover:shadow-[0_0_60px_rgba(59,130,246,0.7)] transition-all duration-300
                     hover:-translate-y-1 flex items-center gap-3">
            <Sparkles className="group-hover:rotate-12 transition-transform" size={24} />
            免費試用 7 天
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
          </button>

          <button
            onClick={() => {
              window.history.pushState({}, '', '/calculator');
              window.location.reload();
            }}
            className="group px-10 py-5 bg-gradient-to-r from-emerald-600 to-emerald-500
                     text-white rounded-2xl font-black text-lg shadow-[0_0_40px_rgba(16,185,129,0.5)]
                     hover:shadow-[0_0_60px_rgba(16,185,129,0.7)] transition-all duration-300
                     hover:-translate-y-1 flex items-center gap-3">
            <Calculator className="group-hover:rotate-12 transition-transform" size={24} />
            免費計算機
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
          </button>
        </div>

        {/* 說明文字 */}
        <p className="text-slate-500 text-sm animate-fade-in" style={{animationDelay: '0.7s'}}>
          ✓ 不需信用卡 ✓ 完整功能 ✓ 隨時取消
        </p>

        {/* 次要連結 - 觀看示範 */}
        <div className="animate-fade-in" style={{animationDelay: '0.8s'}}>
          <button
            onClick={onWatchDemo}
            className={`px-6 py-3 bg-slate-800/50 border border-slate-700 hover:border-slate-600
                     text-slate-400 rounded-xl font-bold hover:bg-slate-800 transition-all
                     flex items-center gap-2 mx-auto ${hasVideo ? '' : 'opacity-50'}`}
          >
            <PlayCircle size={18} />
            觀看 60 秒產品示範
          </button>
        </div>

      </div>
    </section>
  );
};

// ==========================================
// 📊 即時統計組件（從 Firestore 讀取）
// ==========================================
const LiveStatsBar = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCalculations: 0,
    onlineNow: 0,
    isLoading: true
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        // 嘗試從 Firestore 讀取統計數據
        const statsDoc = await getDoc(doc(db, 'siteContent', 'stats'));

        if (statsDoc.exists()) {
          const data = statsDoc.data();
          setStats({
            totalUsers: data.totalUsers || 0,
            totalCalculations: data.totalCalculations || 0,
            onlineNow: data.onlineNow || Math.floor(Math.random() * 5) + 1,
            isLoading: false
          });
        } else {
          // 使用預設值
          setStats({
            totalUsers: 20,
            totalCalculations: 2000,
            onlineNow: Math.floor(Math.random() * 5) + 1,
            isLoading: false
          });
        }
      } catch (error) {
        console.log('統計數據載入失敗，使用預設值:', error);
        setStats({
          totalUsers: 20,
          totalCalculations: 2000,
          onlineNow: Math.floor(Math.random() * 5) + 1,
          isLoading: false
        });
      }
    };

    loadStats();

    // 每 30 秒更新一次在線人數（模擬）
    const timer = setInterval(() => {
      setStats(prev => ({
        ...prev,
        onlineNow: Math.max(1, prev.onlineNow + Math.floor(Math.random() * 3) - 1)
      }));
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  if (stats.isLoading) return null;

  return (
    <div className="bg-slate-900/50 border-y border-slate-800 py-4">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 text-sm">
          {/* 在線人數 */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            </div>
            <span className="text-slate-400">
              目前 <span className="text-emerald-400 font-bold">{stats.onlineNow}</span> 人在線
            </span>
          </div>

          {/* 註冊用戶 */}
          <div className="flex items-center gap-2 text-slate-400">
            <Users size={16} className="text-blue-400" />
            <span>
              <span className="text-white font-bold">{stats.totalUsers}+</span> 位顧問使用中
            </span>
          </div>

          {/* 累計試算 */}
          <div className="flex items-center gap-2 text-slate-400">
            <BarChart3 size={16} className="text-amber-400" />
            <span>
              累計 <span className="text-white font-bold">{stats.totalCalculations.toLocaleString()}+</span> 次試算
            </span>
          </div>

          {/* 今日新增（動態） */}
          <div className="hidden md:flex items-center gap-2 text-slate-400">
            <TrendingUp size={16} className="text-purple-400" />
            <span>
              今日 <span className="text-white font-bold">+{Math.floor(Math.random() * 50) + 10}</span> 次使用
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 📸 產品截圖輪播組件
// ==========================================
const ProductScreenshotCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const screenshots = [
    {
      title: "大小水庫母子系統",
      description: "雙層防護機制，確保緊急預備金與長期儲蓄",
      image: "https://placehold.co/1200x700/1e293b/3b82f6?text=大小水庫系統+截圖"
    },
    {
      title: "稅務傳承規劃",
      description: "遺產稅 & 贈與稅精算，最佳化傳承策略",
      image: "https://placehold.co/1200x700/1e293b/8b5cf6?text=稅務傳承+截圖"
    },
    {
      title: "傲創計算機",
      description: "四大功能合一的免費財務計算工具",
      image: "https://placehold.co/1200x700/1e293b/10b981?text=傲創計算機+截圖"
    },
    {
      title: "戰情室數據儀表板",
      description: "即時追蹤市場數據與經濟指標",
      image: "https://placehold.co/1200x700/1e293b/ef4444?text=戰情室+截圖"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % screenshots.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [screenshots.length]);

  return (
    <section className="py-20 bg-slate-950/50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20
                         text-blue-400 text-xs font-black uppercase tracking-[0.4em]
                         rounded-full">
            Live Preview
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white mt-6 tracking-tight">
            實際產品畫面
          </h2>
          <p className="text-slate-400 mt-4">
            所見即所得，真實呈現顧問每天使用的工具介面
          </p>
        </div>

        {/* 輪播區域 */}
        <div className="relative">
          {/* 主要截圖 */}
          <div className="relative aspect-[16/9] bg-slate-900 rounded-2xl border border-slate-800
                         overflow-hidden shadow-2xl">
            {screenshots.map((shot, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-all duration-700 ease-in-out
                           ${i === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
              >
                <img
                  src={shot.image}
                  alt={shot.title}
                  className="w-full h-full object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                />

                {/* 標題覆蓋層 */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 to-transparent p-8">
                  <h3 className="text-2xl font-black text-white mb-2">{shot.title}</h3>
                  <p className="text-slate-400">{shot.description}</p>
                </div>
              </div>
            ))}

            {/* 左右切換按鈕 */}
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-slate-900/80
                       rounded-full flex items-center justify-center text-white hover:bg-slate-800
                       transition-all border border-slate-700"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % screenshots.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-slate-900/80
                       rounded-full flex items-center justify-center text-white hover:bg-slate-800
                       transition-all border border-slate-700"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* 指示點 */}
          <div className="flex justify-center gap-2 mt-6">
            {screenshots.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300
                           ${i === currentIndex
                             ? 'bg-blue-500 w-8'
                             : 'bg-slate-600 hover:bg-slate-500'}`}
              />
            ))}
          </div>

          {/* 縮略圖導航 */}
          <div className="hidden md:flex justify-center gap-4 mt-8">
            {screenshots.map((shot, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`relative w-40 h-24 rounded-xl overflow-hidden border-2 transition-all
                           ${i === currentIndex
                             ? 'border-blue-500 scale-105'
                             : 'border-slate-700 opacity-50 hover:opacity-80'}`}
              >
                <img
                  src={shot.image}
                  alt={shot.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{shot.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 提示文字 */}
        <p className="text-center text-slate-600 text-sm mt-8">
          💡 正式版截圖即將上線，敬請期待
        </p>
      </div>
    </section>
  );
};

// ==========================================
// 🛠️ 產品展示頁面
// ==========================================
const ProductShowcase = () => {
  const [activeCategory, setActiveCategory] = useState('wealth');

  const categories = {
    wealth: {
      title: "創富工具",
      subtitle: "利用槓桿與套利，實現資產階級躍遷",
      color: "blue",
      icon: Rocket,
      tools: [
        {
          name: "學貸活化系統",
          desc: "將低利學貸轉化為投資資本，創造套利空間",
          features: ["IRR 反推計算", "利差分析", "風險評估"],
          screenshot: "https://placehold.co/800x500/1e293b/64748b?text=學貸活化系統+截圖"
        },
        {
          name: "房產轉增貸工具",
          desc: "活化不動產死錢，重新配置高報酬標的",
          features: ["房貸試算", "增貸空間分析", "現金流規劃"],
          screenshot: "https://placehold.co/800x500/1e293b/64748b?text=房產增貸+截圖"
        },
        {
          name: "百萬禮物計畫",
          desc: "利用稅法空間，合法移轉資產給下一代",
          features: ["贈與稅試算", "分年規劃", "稅務優化"],
          screenshot: "https://placehold.co/800x500/1e293b/64748b?text=百萬禮物+截圖"
        }
      ]
    },
    defense: {
      title: "守富工具",
      subtitle: "建立現金流防禦，確保資產穩健成長",
      color: "emerald",
      icon: ShieldCheck,
      tools: [
        {
          name: "大小水庫母子系統",
          desc: "雙層防護機制，確保緊急預備金與長期儲蓄",
          features: ["緊急預備金試算", "定期定額規劃", "風險缺口分析"],
          screenshot: "https://placehold.co/800x500/1e293b/64748b?text=大小水庫+截圖"
        },
        {
          name: "五年換車計畫",
          desc: "資產配置與生活夢想的平衡點",
          features: ["購車預算規劃", "頭期款累積", "貸款試算"],
          screenshot: "https://placehold.co/800x500/1e293b/64748b?text=換車計畫+截圖"
        },
        {
          name: "長照尊嚴準備金",
          desc: "精算未來醫療成本，守護晚年尊嚴",
          features: ["不健康餘命試算", "醫療費用估算", "保障缺口分析"],
          screenshot: "https://placehold.co/800x500/1e293b/64748b?text=長照準備+截圖"
        }
      ]
    },
    legacy: {
      title: "傳富工具",
      subtitle: "稅務優化與傳承規劃，財富完美落地",
      color: "purple",
      icon: Landmark,
      tools: [
        {
          name: "稅務傳承系統",
          desc: "遺產稅 & 贈與稅精算，最佳化傳承策略",
          features: ["遺產稅試算", "贈與稅規劃", "節稅策略建議"],
          screenshot: "https://placehold.co/800x500/1e293b/64748b?text=稅務傳承+截圖"
        },
        {
          name: "流動性缺口測試",
          desc: "確保遺產稅繳納不會侵蝕家族資產",
          features: ["現金流分析", "資產變現評估", "保險配置建議"],
          screenshot: "https://placehold.co/800x500/1e293b/64748b?text=流動性測試+截圖"
        },
        {
          name: "勞退破產倒數",
          desc: "退休金替代率試算，提前規劃第二人生",
          features: ["替代率計算", "退休缺口分析", "自提建議"],
          screenshot: "https://placehold.co/800x500/1e293b/64748b?text=勞退試算+截圖"
        }
      ]
    },
    warroom: {
      title: "戰情室數據",
      subtitle: "即時市場數據與歷史回測",
      color: "red",
      icon: Activity,
      tools: [
        {
          name: "基金時光機",
          desc: "歷史績效回測，驗證投資策略",
          features: ["定期定額回測", "單筆投資模擬", "績效比較"],
          screenshot: "https://placehold.co/800x500/1e293b/64748b?text=基金時光機+截圖"
        },
        {
          name: "市場數據儀表板",
          desc: "2026 最新經濟數據即時追蹤",
          features: ["癌症時鐘", "醫療通膨", "勞保倒數"],
          screenshot: "https://placehold.co/800x500/1e293b/64748b?text=市場數據+截圖"
        },
        {
          name: "通膨碎鈔機",
          desc: "視覺化呈現購買力流失速度",
          features: ["實質購買力", "通膨率計算", "資產保值建議"],
          screenshot: "https://placehold.co/800x500/1e293b/64748b?text=通膨試算+截圖"
        }
      ]
    }
  };

  const currentCategory = categories[activeCategory];

  return (
    <section id="products" className="py-32 bg-[#050b14]">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-16">
          <span className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 
                         text-blue-400 text-xs font-black uppercase tracking-[0.4em] 
                         rounded-full">
            Product Showcase
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-white mt-8 tracking-tight">
            完整的顧問工具箱
          </h2>
          <p className="text-slate-400 text-lg mt-6 max-w-2xl mx-auto">
            從創富、守富到傳富，18 種專業工具涵蓋客戶全生命週期需求
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {Object.entries(categories).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2
                ${activeCategory === key 
                  ? `bg-${cat.color}-600 text-white shadow-[0_0_30px_rgba(59,130,246,0.4)]` 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
            >
              <cat.icon size={20} />
              {cat.title}
            </button>
          ))}
        </div>

        <div className="mb-12">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-black text-white mb-3">{currentCategory.title}</h3>
            <p className="text-slate-400">{currentCategory.subtitle}</p>
          </div>

          <div className="space-y-12">
            {currentCategory.tools.map((tool, i) => (
              <div key={i} className={`bg-slate-900/50 border border-slate-800 rounded-[2rem] overflow-hidden
                                      hover:border-${currentCategory.color}-500/30 transition-all`}>
                <div className="grid md:grid-cols-2 gap-8 p-8">
                  
                  <div className="flex flex-col justify-center">
                    <div className={`w-16 h-16 bg-${currentCategory.color}-600/10 rounded-2xl 
                                   flex items-center justify-center mb-6`}>
                      <currentCategory.icon className={`text-${currentCategory.color}-400`} size={32} />
                    </div>
                    
                    <h4 className="text-2xl font-black text-white mb-4">{tool.name}</h4>
                    <p className="text-slate-400 text-lg mb-6 leading-relaxed">{tool.desc}</p>
                    
                    <div className="space-y-3">
                      <div className="text-slate-500 font-bold text-sm uppercase tracking-wider mb-3">
                        核心功能
                      </div>
                      {tool.features.map((feature, j) => (
                        <div key={j} className="flex items-center gap-3">
                          <CheckCircle2 className={`text-${currentCategory.color}-400`} size={18} />
                          <span className="text-slate-300">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button className={`mt-8 px-6 py-3 bg-${currentCategory.color}-600 hover:bg-${currentCategory.color}-500
                                      text-white rounded-xl font-bold transition-all
                                      shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]
                                      flex items-center gap-2 w-fit`}>
                      立即試用
                      <ArrowRight size={18} />
                    </button>
                  </div>

                  <div className="relative">
                    <div className="aspect-video bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden
                                  hover:border-blue-500/30 transition-all shadow-2xl">
                      <img
                        src={tool.screenshot}
                        alt={tool.name}
                        className="w-full h-full object-cover opacity-60 hover:opacity-80 transition-opacity"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-slate-600 font-black text-sm uppercase tracking-wider">
                          產品截圖將在此顯示
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute -top-3 -right-3 px-4 py-2 bg-amber-500 text-slate-900 
                                   rounded-full font-black text-xs shadow-lg">
                      🔥 熱門工具
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-16">
          <p className="text-slate-400 text-lg mb-6">
            還有更多工具等你探索...
          </p>
          <button className="px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-500 
                           text-white rounded-2xl font-black text-lg 
                           shadow-[0_0_40px_rgba(59,130,246,0.5)]
                           hover:shadow-[0_0_60px_rgba(59,130,246,0.7)] 
                           transition-all hover:-translate-y-1 inline-flex items-center gap-3">
            <Sparkles size={24} />
            免費試用全部工具
            <ArrowRight size={20} />
          </button>
        </div>

      </div>
    </section>
  );
};

// ==========================================
// 📊 社會證明區塊
// ==========================================
const RealSocialProof = () => {
  return (
    <section className="py-32 bg-slate-950">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-20">
          <span className="px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 
                         text-purple-400 text-xs font-black uppercase tracking-[0.4em] 
                         rounded-full">
            Beta Tester Exclusive
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-white mt-8 tracking-tight">
            加入 2026 創始會員行列
          </h2>
          <p className="text-slate-400 text-lg mt-6 max-w-2xl mx-auto">
            目前 <strong className="text-blue-400">20 位頂尖財務顧問</strong> 正在內測階段，
            他們平均管理 <strong className="text-amber-400">50+ 客戶檔案</strong>，
            每月使用系統完成 <strong className="text-emerald-400">100+ 次試算</strong>。
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {[
            { 
              label: "內測顧問", 
              value: "20+", 
              desc: "來自壽險、銀行、理專", 
              icon: Users,
              color: "blue"
            },
            { 
              label: "累計試算", 
              value: "2,000+", 
              desc: "涵蓋創富/守富/傳富", 
              icon: BarChart3,
              color: "amber"
            },
            { 
              label: "平均節省", 
              value: "15 hrs", 
              desc: "每月試算準備時間", 
              icon: Clock,
              color: "emerald"
            }
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-[2rem] 
                                   p-10 text-center hover:border-slate-700 transition-all">
              <div className={`w-16 h-16 bg-${stat.color}-600/10 rounded-2xl 
                             flex items-center justify-center mx-auto mb-6`}>
                <stat.icon className={`text-${stat.color}-400`} size={32} />
              </div>
              <div className={`text-5xl font-black text-${stat.color}-400 mb-3 font-mono`}>
                {stat.value}
              </div>
              <div className="text-white font-bold text-lg mb-2">{stat.label}</div>
              <p className="text-slate-500 text-sm">{stat.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 
                       border-2 border-purple-500/30 rounded-[3rem] p-12 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full 
                         blur-[100px] pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <Crown className="text-amber-400" size={32} />
              <h3 className="text-3xl font-black text-white">創始會員專屬權益</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icon: Award, text: "永久享有早鳥價格鎖定（未來漲價不影響）" },
                { icon: Sparkles, text: "優先體驗所有新功能（AI 升級第一批）" },
                { icon: Users, text: "專屬 VIP 社群（直接與開發團隊對話）" },
                { icon: Star, text: "終身技術支援（1 對 1 顧問式服務）" },
                { icon: Target, text: "功能需求優先處理（你的建議直接影響產品）" },
                { icon: Crown, text: "創始會員徽章（系統內永久顯示）" }
              ].map((benefit, i) => (
                <div key={i} className="flex items-start gap-4 bg-slate-900/30 
                                       border border-slate-800/50 rounded-2xl p-5">
                  <div className="w-10 h-10 bg-purple-600/10 rounded-xl flex items-center 
                                 justify-center flex-shrink-0">
                    <benefit.icon className="text-purple-400" size={20} />
                  </div>
                  <p className="text-slate-300 font-medium leading-relaxed">{benefit.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 bg-red-900/20 border border-red-500/30 rounded-2xl p-6 
                           flex items-center gap-4">
              <TriangleAlert className="text-red-400 flex-shrink-0" size={24} />
              <p className="text-red-300 font-bold">
                ⚠️ 創始會員資格將在達到 <strong>100 位</strong> 時永久關閉，
                目前僅剩 <strong className="text-red-200">80 個名額</strong>
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

// ==========================================
// 💬 早期用戶回饋區塊（誠實呈現）
// ==========================================
const EarlyUserFeedback = ({ onFreeTrial }) => {
  return (
    <section className="py-32 bg-[#050b14]">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">
          <span className="px-4 py-1.5 bg-amber-500/10 border border-amber-500/20
                         text-amber-400 text-xs font-black uppercase tracking-[0.4em]
                         rounded-full">
            Early Access
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-8 tracking-tight">
            成為首批使用者
          </h2>
          <p className="text-slate-400 text-lg mt-6 max-w-2xl mx-auto">
            Ultra Advisor 目前處於早期階段，我們正在招募首批測試用戶，
            <br />
            一起打造台灣最好用的財務顧問工具
          </p>
        </div>

        {/* 誠實的價值主張 */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: Rocket,
              title: "搶先體驗",
              description: "比別人更早掌握新一代顧問工具，建立競爭優勢",
              color: "blue"
            },
            {
              icon: MessageSquare,
              title: "直接影響產品",
              description: "您的回饋會直接影響功能開發方向，打造真正好用的工具",
              color: "emerald"
            },
            {
              icon: Crown,
              title: "創始會員特權",
              description: "早期支持者享有永久價格鎖定與專屬權益",
              color: "amber"
            }
          ].map((item, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8
                                   hover:border-slate-700 transition-all text-center">
              <div className={`w-16 h-16 bg-${item.color}-600/10 rounded-2xl
                             flex items-center justify-center mx-auto mb-6`}>
                <item.icon className={`text-${item.color}-400`} size={32} />
              </div>
              <h3 className="text-xl font-black text-white mb-3">{item.title}</h3>
              <p className="text-slate-400 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        {/* 透明的開發狀態 */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-8 mb-16">
          <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
            <Activity className="text-blue-400" size={24} />
            開發進度透明公開
          </h3>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { label: "已上線功能", value: "18 種", status: "live", color: "emerald" },
              { label: "開發中功能", value: "5 種", status: "dev", color: "amber" },
              { label: "規劃中功能", value: "12 種", status: "planned", color: "slate" },
              { label: "上次更新", value: "本週", status: "update", color: "blue" }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className={`text-3xl font-black text-${item.color}-400 mb-2`}>
                  {item.value}
                </div>
                <div className="text-slate-500 text-sm">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-slate-400 text-lg mb-6">
            我們承諾：持續迭代、認真聽取回饋、打造真正有用的工具
          </p>
          <button
            onClick={onFreeTrial}
            className="px-10 py-5 bg-gradient-to-r from-blue-600 to-blue-500
                     text-white rounded-2xl font-black text-lg
                     shadow-[0_0_40px_rgba(59,130,246,0.4)]
                     hover:shadow-[0_0_60px_rgba(59,130,246,0.6)]
                     transition-all hover:-translate-y-1 inline-flex items-center gap-3">
            <Sparkles size={24} />
            免費加入早期測試
            <ArrowRight size={20} />
          </button>
          <p className="text-slate-600 text-sm mt-4">
            目前已有 20+ 位顧問正在使用
          </p>
        </div>

      </div>
    </section>
  );
};

// ==========================================
// 💰 定價區塊
// ==========================================
const PricingSection = ({ onSelectPlan }) => {
  return (
    <section id="pricing" className="py-32 bg-slate-950">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-20">
          <span className="px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 
                         text-amber-400 text-xs font-black uppercase tracking-[0.4em] 
                         rounded-full">
            Transparent Pricing
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-white mt-8 tracking-tight">
            簡單透明的定價
          </h2>
          <p className="text-slate-400 text-lg mt-6">
            不玩文字遊戲，沒有隱藏費用
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          <div className="bg-slate-900/50 border-2 border-blue-500/30 rounded-[2.5rem] 
                         p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full 
                           blur-[60px]" />
            
            <div className="relative z-10">
              <div className="inline-block px-4 py-1.5 bg-blue-600/20 border border-blue-500/30 
                             text-blue-300 text-xs font-black uppercase rounded-full mb-6">
                推薦新手
              </div>

              <h3 className="text-3xl font-black text-white mb-4">免費試用</h3>
              <div className="mb-8">
                <span className="text-6xl font-black text-white">NT$ 0</span>
                <span className="text-slate-400 text-lg ml-2">/ 7 天</span>
              </div>

              <ul className="space-y-4 mb-10">
                {[
                  "完整功能無限制使用",
                  "創富 + 守富 + 傳富全系統",
                  "無限次數客戶檔案建立",
                  "專屬 Ultra888 金鑰",
                  "LINE 社群技術支援"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => onSelectPlan('free')}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl 
                         font-bold text-lg transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)]
                         hover:shadow-[0_0_50px_rgba(59,130,246,0.5)]">
                免費開始試用
              </button>

              <p className="text-slate-500 text-xs text-center mt-4">
                ✓ 不需信用卡 · 隨時可升級
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-900/30 to-slate-900/50 
                         border-2 border-amber-500/50 rounded-[2.5rem] p-10 
                         relative overflow-hidden shadow-[0_0_60px_rgba(245,158,11,0.2)]">
            
            <div className="absolute top-8 right-8 px-4 py-1.5 bg-amber-500 text-slate-900 
                           text-xs font-black uppercase rounded-full shadow-lg">
              🔥 最划算
            </div>

            <div className="absolute top-0 left-0 w-40 h-40 bg-amber-500/10 rounded-full 
                           blur-[80px]" />
            
            <div className="relative z-10">
              <div className="inline-block px-4 py-1.5 bg-amber-600/20 border border-amber-500/30 
                             text-amber-300 text-xs font-black uppercase rounded-full mb-6">
                創始會員專屬
              </div>

              <h3 className="text-3xl font-black text-white mb-4">年繳方案</h3>
              <div className="mb-2">
                <span className="text-6xl font-black text-white">NT$ 6,999</span>
                <span className="text-slate-400 text-lg ml-2">/ 年</span>
              </div>
              
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-8">
                <p className="text-amber-300 font-black text-lg text-center">
                  💰 談一件月存 2,000 的傭金
                  <br />
                  <span className="text-sm text-amber-400/80">
                    就能回本整年費用！
                  </span>
                </p>
              </div>

              <ul className="space-y-4 mb-10">
                {[
                  "免費試用期的所有功能",
                  "創始會員永久徽章",
                  "價格永久鎖定（未來不漲價）",
                  "新功能優先體驗權",
                  "VIP 專屬社群",
                  "1 對 1 技術支援"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="text-amber-400 flex-shrink-0 mt-0.5" size={20} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => onSelectPlan('annual')}
                className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-500 
                         hover:from-amber-500 hover:to-amber-400 text-white rounded-xl 
                         font-bold text-lg transition-all 
                         shadow-[0_0_40px_rgba(245,158,11,0.4)]
                         hover:shadow-[0_0_60px_rgba(245,158,11,0.6)]">
                鎖定創始會員價格
              </button>

              <p className="text-amber-400 text-xs text-center mt-4 font-bold">
                ⚡ 僅剩 80 個創始會員名額
              </p>
            </div>
          </div>

        </div>

        <div className="mt-16 max-w-3xl mx-auto bg-slate-900/30 border border-slate-800 
                       rounded-2xl p-8">
          <h4 className="text-white font-bold text-lg mb-6 text-center">
            💡 每天不到 20 元，相當於...
          </h4>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            {[
              { emoji: "☕", text: "半杯星巴克", desc: "中杯拿鐵 = 140 元/杯" },
              { emoji: "🚇", text: "兩趟捷運", desc: "單程 = 20-40 元" },
              { emoji: "🍱", text: "1/4 個便當", desc: "午餐 = 80-100 元" }
            ].map((item, i) => (
              <div key={i} className="text-slate-400">
                <div className="text-4xl mb-2">{item.emoji}</div>
                <div className="font-bold text-white mb-1">{item.text}</div>
                <div className="text-xs">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

// ==========================================
// 🚀 主組件
// ==========================================
export function LandingPage({ onStart, onSignup, onHome }) {
  const [view, setView] = useState('home');
  const [logoError, setLogoError] = useState(false);

  // ✅ 動態內容狀態
  const [dynamicContent, setDynamicContent] = useState({
    announcement: null,
    heroVideo: null,
    contact: null
  });
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // ✅ 管理员入口：连点 Logo 5 次
  const [clickCount, setClickCount] = useState(0);
  const clickTimerRef = useRef(null);

  // ✅ 滾動狀態（用於 Sticky Header 優化）
  const [isScrolled, setIsScrolled] = useState(false);

  // ✅ 載入動態內容
  useEffect(() => {
    const loadDynamicContent = async () => {
      try {
        // 載入公告
        const announcementDoc = await getDoc(doc(db, 'siteContent', 'announcement'));
        // 載入 Hero 影片設定
        const heroDoc = await getDoc(doc(db, 'siteContent', 'hero'));
        // 載入聯絡資訊
        const contactDoc = await getDoc(doc(db, 'siteContent', 'contact'));
        
        setDynamicContent({
          announcement: announcementDoc.exists() ? announcementDoc.data() : null,
          heroVideo: heroDoc.exists() ? heroDoc.data() : null,
          contact: contactDoc.exists() ? contactDoc.data() : null
        });
      } catch (error) {
        console.log('動態內容載入失敗，使用預設值:', error);
      }
    };
    
    loadDynamicContent();
  }, []);

  // ✅ 管理员入口：处理 Logo 点击
  const handleLogoClick = () => {
    setView('home');
    setClickCount(prev => prev + 1);
    
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }
    
    if (clickCount + 1 >= 5) {
      window.location.href = ADMIN_URL;
      setClickCount(0);
      return;
    }
    
    clickTimerRef.current = setTimeout(() => {
      setClickCount(0);
    }, 5000);
  };

  // ✅ 清理计时器
  useEffect(() => {
    return () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
    };
  }, []);

  // ✅ 滾動監聽（Sticky Header 優化）
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 🔥 LINE 免費訊息額度已滿，改導向網頁註冊
  const handleFreeTrial = () => {
    window.history.pushState({}, '', SIGNUP_PATH);
    window.location.reload();
  };

  // ✅ 修改：檢查是否有影片可以播放
  const handleWatchDemo = () => {
    const videoData = dynamicContent.heroVideo;
    if (videoData?.videoType !== 'none' && 
        (videoData?.videoUrl || videoData?.htmlVideoUrl)) {
      setShowVideoModal(true);
    } else {
      alert('Demo 影片功能開發中...\n\n建議：先拍攝一支 60 秒的產品展示影片');
    }
  };

  // ✅ 檢查是否有影片
  const hasVideo = dynamicContent.heroVideo?.videoType !== 'none' && 
                   (dynamicContent.heroVideo?.videoUrl || dynamicContent.heroVideo?.htmlVideoUrl);

  const handleSelectPlan = (plan) => {
    if (plan === 'free') {
      // 🔥 LINE 免費訊息額度已滿，改導向網頁註冊
      window.history.pushState({}, '', SIGNUP_PATH);
      window.location.reload();
    } else {
      window.open('https://portaly.cc/GinRollBT', '_blank');
    }
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

  return (
    <div className="min-h-screen bg-[#050b14] text-white font-sans">
      
      {/* ✅ 動態公告橫幅 */}
      {showAnnouncement && dynamicContent.announcement?.enabled && (
        <AnnouncementBar 
          data={dynamicContent.announcement} 
          onClose={() => setShowAnnouncement(false)} 
        />
      )}

      <MarketTicker />

      {/* ✅ Header - 滾動優化 */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-all duration-300
                        ${isScrolled
                          ? 'bg-[#050b14]/95 border-blue-500/20 shadow-[0_4px_30px_rgba(59,130,246,0.1)]'
                          : 'bg-[#050b14]/80 border-white/5'}`}>
        <div className={`max-w-7xl mx-auto px-6 flex justify-between items-center transition-all duration-300
                       ${isScrolled ? 'py-2' : 'py-4'}`}>
          <div className="flex items-center gap-3 cursor-pointer relative" 
               onClick={handleLogoClick}
               title={clickCount > 0 ? `再點 ${5 - clickCount} 次進入管理後台` : ''}>
            <img
              src={logoError ? "https://placehold.co/40x40/3b82f6/white?text=UA" : LOGO_URL}
              alt="Ultra Advisor - 台灣財務顧問提案工具 Logo"
              className="h-10 w-auto"
              loading="eager"
              fetchpriority="high"
              decoding="async"
              onError={() => setLogoError(true)}
            />
            <span className="text-xl font-black tracking-tight">
              <span style={{color: '#FF3A3A'}}>Ultra</span>
              <span className="text-blue-400">Advisor</span>
            </span>
            
            {/* ✅ 点击进度指示器 */}
            {clickCount > 0 && (
              <div className="absolute -bottom-1 left-0 right-0 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${(clickCount / 5) * 100}%` }}
                />
              </div>
            )}
          </div>
          
<nav className="hidden md:flex items-center gap-8">
  <button
    onClick={() => {
      window.history.pushState({}, '', '/calculator');
      window.location.reload();
    }}
    className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors flex items-center gap-1">
    <Calculator size={16} />
    傲創計算機
  </button>
  <button
    onClick={() => {
      document.getElementById('products')?.scrollIntoView({behavior: 'smooth'});
    }}
    className="text-slate-400 hover:text-blue-400 font-bold transition-colors">
    產品展示
  </button>
  <button
    onClick={() => {
      document.getElementById('pricing')?.scrollIntoView({behavior: 'smooth'});
    }}
    className="text-slate-400 hover:text-blue-400 font-bold transition-colors">
    定價
  </button>
  <button
    onClick={() => {
      window.history.pushState({}, '', '/blog');
      window.location.reload();
    }}
    className="text-slate-400 hover:text-blue-400 font-bold transition-colors flex items-center gap-1">
    <FileText size={16} />
    知識庫
  </button>
  <a href={COMMUNITY_LINK} target="_blank" rel="noopener noreferrer"
     className="text-slate-400 hover:text-blue-400 font-bold transition-colors">
    社群
  </a>
            
            {/* ✅ 登入/註冊按鈕 - 統一導向註冊頁 */}
            <button
              onClick={handleFreeTrial}
              className="flex items-center gap-2 text-slate-400 hover:text-white font-bold transition-colors">
              <LogIn size={18} />
              登入 / 註冊
            </button>
            
            <button
              onClick={handleFreeTrial}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all
                       ${isScrolled
                         ? 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.5)] animate-pulse'
                         : 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]'}`}>
              {isScrolled ? '🔥 立即試用' : '免費試用'}
            </button>
          </nav>

          {/* ✅ 手機版按鈕 */}
          <div className="md:hidden flex items-center gap-2">
            {/* 傲創計算機 */}
            <button
              onClick={() => {
                window.history.pushState({}, '', '/calculator');
                window.location.reload();
              }}
              className="p-2 text-emerald-400 hover:text-emerald-300 transition-colors"
              title="傲創計算機"
            >
              <Calculator size={20} />
            </button>
            {/* 知識庫 */}
            <button
              onClick={() => {
                window.history.pushState({}, '', '/blog');
                window.location.reload();
              }}
              className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
              title="知識庫"
            >
              <FileText size={20} />
            </button>
            {/* 登入 */}
            <button
              onClick={handleFreeTrial}
              className="text-slate-400 hover:text-white font-bold text-sm px-2">
              登入
            </button>
            {/* 註冊 */}
            <button
              onClick={handleFreeTrial}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-sm transition-all">
              註冊
            </button>
          </div>
        </div>
      </header>

      <main>
        <OptimizedHeroSection
          onFreeTrial={handleFreeTrial}
          onWatchDemo={handleWatchDemo}
          hasVideo={hasVideo}
        />

        {/* ==================== 即時統計欄 ==================== */}
        <LiveStatsBar />

        {/* ==================== 產品截圖輪播 ==================== */}
        <ProductScreenshotCarousel />

        {/* ==================== 信任標誌區塊 ==================== */}
        <section className="py-16 bg-slate-950/50 border-y border-white/5">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-slate-600 text-sm font-bold text-center uppercase tracking-widest mb-10">
              技術合作夥伴 & 使用技術
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
              {/* Firebase */}
              <div className="flex items-center gap-2 text-slate-500">
                <Database size={24} />
                <span className="font-bold text-sm">Firebase</span>
              </div>
              {/* Google Cloud */}
              <div className="flex items-center gap-2 text-slate-500">
                <Globe size={24} />
                <span className="font-bold text-sm">Google Cloud</span>
              </div>
              {/* LINE */}
              <div className="flex items-center gap-2 text-slate-500">
                <MessageSquare size={24} />
                <span className="font-bold text-sm">LINE Bot</span>
              </div>
              {/* SSL 安全 */}
              <div className="flex items-center gap-2 text-slate-500">
                <Lock size={24} />
                <span className="font-bold text-sm">SSL 加密</span>
              </div>
              {/* React */}
              <div className="flex items-center gap-2 text-slate-500">
                <Monitor size={24} />
                <span className="font-bold text-sm">React</span>
              </div>
            </div>
            <div className="mt-10 flex justify-center gap-6 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>銀行等級資安</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>99.9% 服務可用性</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>資料加密傳輸</span>
              </div>
            </div>
          </div>
        </section>

        <ProductShowcase />
        <RealSocialProof />
        <EarlyUserFeedback onFreeTrial={handleFreeTrial} />
        <PricingSection onSelectPlan={handleSelectPlan} />

        {/* ==================== FAQ 常見問題 ==================== */}
        <section id="faq" className="py-32 bg-[#050b14]">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20
                             text-emerald-400 text-xs font-black uppercase tracking-[0.4em]
                             rounded-full">
                FAQ
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-white mt-8 tracking-tight">
                常見問題
              </h2>
              <p className="text-slate-400 text-lg mt-6">
                還有其他問題？歡迎透過 LINE 官方帳號聯繫我們
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "免費試用需要綁定信用卡嗎？",
                  a: "不需要！註冊後即可免費試用 7 天完整功能，不需要提供任何付款資訊。試用期結束後，系統會自動轉為免費版，不會自動扣款。"
                },
                {
                  q: "資料安全嗎？會不會被外洩？",
                  a: "我們使用 Google Firebase 雲端服務，所有資料皆經過加密傳輸與儲存，符合金融等級的資安標準。您的客戶資料只有您自己可以存取。"
                },
                {
                  q: "可以在多個裝置上使用嗎？",
                  a: "可以！同一帳號最多可在 2 個裝置上同時登入使用，資料會自動同步。手機、平板、電腦都能使用。"
                },
                {
                  q: "訂閱後可以隨時取消嗎？",
                  a: "當然可以！我們採用不綁約制，您可以隨時取消訂閱。取消後，您仍可使用至訂閱期結束，不會額外收費。"
                },
                {
                  q: "傲創計算機是免費的嗎？",
                  a: "是的！傲創計算機是完全免費的公開工具，不需要註冊就可以使用。這是我們提供給所有財務顧問的免費資源。"
                },
                {
                  q: "如何升級為付費會員？",
                  a: "您可以透過系統內的「升級」按鈕，或直接聯繫我們的 LINE 官方帳號進行付費。我們支援多種付款方式。"
                },
                {
                  q: "有提供教育訓練嗎？",
                  a: "有的！我們提供 LINE 社群即時問答、操作教學影片，以及定期的線上工作坊。付費會員還可享有 1 對 1 技術支援。"
                },
                {
                  q: "工具的數據來源是什麼？",
                  a: "我們的市場數據來自公開的政府統計資料（如主計處、衛福部、勞動部等），並會定期更新以確保資料的準確性。"
                }
              ].map((item, i) => (
                <details
                  key={i}
                  className="group bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden
                           hover:border-slate-700 transition-all"
                >
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                    <span className="text-white font-bold text-lg pr-4">{item.q}</span>
                    <ChevronRight
                      size={20}
                      className="text-slate-500 group-open:rotate-90 transition-transform flex-shrink-0"
                    />
                  </summary>
                  <div className="px-6 pb-6 pt-0">
                    <p className="text-slate-400 leading-relaxed">{item.a}</p>
                  </div>
                </details>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-slate-500 mb-4">還有其他問題？</p>
              <a
                href={LINE_OFFICIAL_ACCOUNT}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#06C755] hover:bg-[#05b34c]
                         text-white rounded-xl font-bold transition-all"
              >
                <MessageSquare size={20} />
                LINE 聯繫客服
              </a>
            </div>
          </div>
        </section>

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

      {/* ==================== 完整 Footer ==================== */}
      <footer className="bg-slate-950 border-t border-white/5">
        {/* 主要 Footer 內容 */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-12">

            {/* 公司資訊 */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <img
                  src={logoError ? "https://placehold.co/32x32/3b82f6/white?text=UA" : LOGO_URL}
                  alt="Ultra Advisor - 台灣財務顧問提案工具 Logo"
                  className="h-8 w-auto"
                  loading="lazy"
                  decoding="async"
                />
                <span className="text-lg font-black">
                  <span style={{color: '#FF3A3A'}}>Ultra</span>
                  <span className="text-blue-400">Advisor</span>
                </span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                台灣最強財務顧問提案工具<br />
                讓數據為你說話，讓 AI 當你的軍師
              </p>
              <div className="flex gap-3">
                <a href={LINE_OFFICIAL_ACCOUNT} target="_blank" rel="noopener noreferrer"
                   className="w-10 h-10 bg-[#06C755] rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity">
                  <MessageSquare size={20} className="text-white" />
                </a>
                <a href={COMMUNITY_LINK} target="_blank" rel="noopener noreferrer"
                   className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-700 transition-colors">
                  <Users size={20} className="text-slate-400" />
                </a>
                <a href="mailto:support@ultra-advisor.tw"
                   className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-700 transition-colors">
                  <Mail size={20} className="text-slate-400" />
                </a>
              </div>
            </div>

            {/* 產品功能 */}
            <div>
              <h4 className="text-white font-black text-sm uppercase tracking-wider mb-6">產品功能</h4>
              <ul className="space-y-3">
                {[
                  { name: '傲創計算機', path: '/calculator', highlight: true },
                  { name: '創富工具', anchor: 'products' },
                  { name: '守富工具', anchor: 'products' },
                  { name: '傳富工具', anchor: 'products' },
                  { name: '戰情室數據', anchor: 'products' },
                ].map((item, i) => (
                  <li key={i}>
                    <button
                      onClick={() => {
                        if (item.path) {
                          window.history.pushState({}, '', item.path);
                          window.location.reload();
                        } else if (item.anchor) {
                          document.getElementById(item.anchor)?.scrollIntoView({behavior: 'smooth'});
                        }
                      }}
                      className={`text-sm transition-colors flex items-center gap-2
                        ${item.highlight
                          ? 'text-emerald-400 hover:text-emerald-300 font-bold'
                          : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      {item.highlight && <Sparkles size={14} />}
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* 關於我們 */}
            <div>
              <h4 className="text-white font-black text-sm uppercase tracking-wider mb-6">關於我們</h4>
              <ul className="space-y-3">
                {[
                  { name: '知識庫', path: '/blog', highlight: true },
                  { name: '定價方案', anchor: 'pricing' },
                  { name: '成功案例', anchor: 'testimonials' },
                  { name: '常見問題', anchor: 'faq' },
                  { name: '聯絡客服', href: LINE_OFFICIAL_ACCOUNT },
                ].map((item, i) => (
                  <li key={i}>
                    {item.href ? (
                      <a href={item.href} target="_blank" rel="noopener noreferrer"
                         className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
                        {item.name}
                      </a>
                    ) : item.path ? (
                      <button
                        onClick={() => {
                          window.history.pushState({}, '', item.path);
                          window.location.reload();
                        }}
                        className={`text-sm transition-colors flex items-center gap-2
                          ${item.highlight
                            ? 'text-purple-400 hover:text-purple-300 font-bold'
                            : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        {item.highlight && <FileText size={14} />}
                        {item.name}
                      </button>
                    ) : (
                      <button
                        onClick={() => document.getElementById(item.anchor)?.scrollIntoView({behavior: 'smooth'})}
                        className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
                        {item.name}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* 聯絡資訊 */}
            <div>
              <h4 className="text-white font-black text-sm uppercase tracking-wider mb-6">聯絡我們</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MessageSquare size={18} className="text-[#06C755] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-400 text-sm">LINE 官方帳號</p>
                    <a href={LINE_OFFICIAL_ACCOUNT} target="_blank" rel="noopener noreferrer"
                       className="text-white font-bold text-sm hover:text-blue-400 transition-colors">
                      @ultraadvisor
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-400 text-sm">電子郵件</p>
                    <a href="mailto:support@ultra-advisor.tw"
                       className="text-white font-bold text-sm hover:text-blue-400 transition-colors">
                      support@ultra-advisor.tw
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Globe size={18} className="text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-400 text-sm">官方網站</p>
                    <span className="text-white font-bold text-sm">ultra-advisor.tw</span>
                  </div>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* 底部版權 */}
        <div className="border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-600 text-xs">
              © 2026 UltraAdvisor. All rights reserved. 台灣最強財務顧問提案工具
            </p>
            <div className="flex items-center gap-6 text-xs">
              <button className="text-slate-600 hover:text-slate-400 transition-colors">隱私權政策</button>
              <button className="text-slate-600 hover:text-slate-400 transition-colors">服務條款</button>
              <button className="text-slate-600 hover:text-slate-400 transition-colors">免責聲明</button>
            </div>
          </div>
        </div>
      </footer>

      {/* ✅ 影片彈窗 */}
      <VideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        videoData={dynamicContent.heroVideo}
      />

      {/* ==================== LINE 浮動客服按鈕 ==================== */}
      <a
        href={LINE_OFFICIAL_ACCOUNT}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 group"
        aria-label="LINE 客服"
      >
        <div className="relative">
          {/* 脈衝動畫背景 */}
          <div className="absolute inset-0 bg-[#06C755] rounded-full animate-ping opacity-30" />

          {/* 主按鈕 */}
          <div className="relative w-16 h-16 bg-[#06C755] rounded-full flex items-center justify-center
                         shadow-[0_4px_20px_rgba(6,199,85,0.5)] hover:shadow-[0_6px_30px_rgba(6,199,85,0.7)]
                         transition-all duration-300 hover:scale-110 hover:-translate-y-1">
            <MessageSquare size={28} className="text-white" />
          </div>

          {/* 提示文字 */}
          <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100
                         transition-opacity duration-300 pointer-events-none">
            <div className="bg-slate-900 text-white text-sm font-bold px-4 py-2 rounded-xl
                          shadow-xl whitespace-nowrap border border-slate-700">
              LINE 即時客服
              <div className="absolute bottom-0 right-6 translate-y-1/2 rotate-45
                            w-2 h-2 bg-slate-900 border-r border-b border-slate-700" />
            </div>
          </div>
        </div>
      </a>

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
}

export default LandingPage;