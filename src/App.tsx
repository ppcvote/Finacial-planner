import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Wallet, Building2, Coins, Check, ShieldAlert, Menu, X, LogOut, FileBarChart, 
  GraduationCap, Umbrella, Waves, Landmark, Lock, Rocket, Car, Loader2,
  ChevronLeft, Users, ShieldCheck, Activity, History, LayoutDashboard,
  TrendingUp, Zap, HeartPulse, ArrowRight, Globe, Mail, MessageSquare, ExternalLink
} from 'lucide-react';

import { initializeApp } from 'firebase/app';
import { 
  getAuth, signOut, onAuthStateChanged, signInAnonymously, signInWithCustomToken 
} from 'firebase/auth';
import { 
  getFirestore, doc, setDoc, onSnapshot, Timestamp, getDoc, collection, query 
} from 'firebase/firestore';

/**
 * ============================================================================
 * FIREBASE 初始化與配置
 * ============================================================================
 */
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

/**
 * ============================================================================
 * 模擬組件 (原本在外部檔案，現整合至此以解決解析錯誤)
 * ============================================================================
 */

// 1. 模擬工具組件 (實際開發中應填入具體邏輯)
const ToolPlaceholder = ({ title }) => (
  <div className="p-8 bg-slate-900/50 rounded-[2rem] border border-white/5 text-center">
    <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-500">
      <Zap size={32} />
    </div>
    <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
    <p className="text-slate-400 italic">此模組正在整合數據中...</p>
  </div>
);

// 這些組件在實際情況下應該包含各自的完整代碼
const FinancialRealEstateTool = ({ data, setData }) => <ToolPlaceholder title="金融房產專案" />;
const StudentLoanTool = ({ data, setData }) => <ToolPlaceholder title="學貸活化專案" />;
const SuperActiveSavingTool = ({ data, setData }) => <ToolPlaceholder title="超積極存錢法" />;
const CarReplacementTool = ({ data, setData }) => <ToolPlaceholder title="五年換車專案" />;
const LaborPensionTool = ({ data, setData }) => <ToolPlaceholder title="退休缺口試算" />;
const BigSmallReservoirTool = ({ data, setData }) => <ToolPlaceholder title="大小水庫專案" />;
const TaxPlannerTool = ({ data, setData }) => <ToolPlaceholder title="稅務傳承專案" />;
const MillionDollarGiftTool = ({ data, setData }) => <ToolPlaceholder title="百萬禮物專案" />;
const FreeDashboardTool = ({ allData, setAllData, savedLayout, onSaveLayout }) => <ToolPlaceholder title="自由組合戰情室" />;
const MarketDataZone = () => <ToolPlaceholder title="市場數據戰情室" />;
const GoldenSafeVault = ({ data, setData }) => <ToolPlaceholder title="黃金保險箱理論" />;
const FundTimeMachine = () => <ToolPlaceholder title="基金時光機" />;
const SplashScreen = () => (
  <div className="h-screen bg-slate-950 flex items-center justify-center">
    <div className="text-center animate-pulse">
      <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/50">
        <Activity className="text-white" size={40} />
      </div>
      <h1 className="text-white text-2xl font-black tracking-tighter italic uppercase">UltraAdvisor</h1>
    </div>
  </div>
);

// 2. 登入頁面
const LoginPage = ({ onLoginSuccess }) => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white text-center">
     <div className="max-w-md w-full space-y-6">
        <h2 className="text-3xl font-black">顧問登入</h2>
        <p className="text-slate-400">進入 UltraAdvisor 數位戰情室</p>
        <button onClick={() => onLoginSuccess()} className="w-full bg-blue-600 py-4 rounded-2xl font-black shadow-lg hover:bg-blue-500 transition-all">
          模擬登入 (進入後台)
        </button>
     </div>
  </div>
);

// 3. 秘密註冊頁面
const SecretSignupPage = ({ onSignupSuccess }) => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white text-center">
    <div className="max-w-md w-full space-y-6">
      <h2 className="text-3xl font-black text-blue-500 tracking-tighter italic">ADMIN ACTIVATION</h2>
      <button onClick={() => onSignupSuccess()} className="w-full bg-slate-800 py-4 rounded-2xl font-black border border-blue-500/30">
        點擊啟動管理權限
      </button>
    </div>
  </div>
);

// 4. 官網 LandingPage
const LandingPage = ({ onStart, onSignup, onHome }) => {
  const LOGO_URL = "https://lh3.googleusercontent.com/d/1CEFGRByRM66l-4sMMM78LUBUvAMiAIaJ";
  const [showSignupModal, setShowSignupModal] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans overflow-x-hidden relative">
      <nav className="border-b border-white/5 backdrop-blur-2xl sticky top-0 z-[100] bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={onHome}>
            <div className="h-10 overflow-hidden rounded-lg">
              <img src={LOGO_URL} alt="Logo" className="h-full w-auto object-contain" />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter italic uppercase">Ultra<span className="text-blue-500">Advisor</span></span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={onStart} className="hidden sm:block text-slate-400 hover:text-white font-bold text-sm uppercase">登入系統</button>
            <button onClick={() => setShowSignupModal(true)} className="bg-white text-slate-950 px-8 py-3 rounded-full font-black text-sm hover:bg-blue-600 hover:text-white transition-all">立刻開通</button>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-40 text-center px-4">
        <div className="max-w-7xl mx-auto space-y-10 relative">
          <h1 className="text-6xl md:text-9xl font-black text-white leading-tight tracking-tighter">讓數據說話 <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500">讓戰略成真</span></h1>
          <p className="text-slate-400 max-w-3xl mx-auto text-lg md:text-2xl font-medium">UltraAdvisor 專為頂級金融顧問設計。整合最新數據，轉化為視覺戰報。</p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 pt-12">
            <button onClick={() => setShowSignupModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-6 rounded-[2.5rem] font-black text-xl flex items-center gap-4 group">獲取開通金鑰 <ArrowRight className="group-hover:translate-x-2 transition-transform"/></button>
          </div>
        </div>
      </section>

      {showSignupModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setShowSignupModal(false)} />
          <div className="relative bg-white rounded-[2rem] shadow-2xl overflow-hidden max-w-[440px] w-full flex flex-col">
            <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-100">
              <span className="text-slate-900 font-black text-xs uppercase tracking-widest px-3 py-1 bg-blue-100 rounded-full">立即獲取金鑰</span>
              <button onClick={() => setShowSignupModal(false)} className="p-2 hover:bg-slate-200 rounded-full group"><X size={24} className="text-slate-400 group-hover:text-slate-900" /></button>
            </div>
            <div className="bg-white flex justify-center py-2 px-4 overflow-y-auto max-h-[80vh]">
               <iframe src="https://portaly.cc/embed/GinRollBT/product/WsaTvEYOA1yqAQYzVZgy" width="400" height="620" style={{ border: 0, borderRadius: '12px' }} frameBorder="0" loading="lazy" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 5. 報表視窗
const ReportModal = ({ isOpen, onClose, user, client, activeTab, data }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-4xl h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden">
        <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
          <h2 className="font-black text-xl text-slate-900">戰略規劃報表</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full"><X /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-12 text-slate-800 space-y-8">
           <div className="border-b-4 border-blue-600 pb-4">
              <h1 className="text-4xl font-black">UltraAdvisor Report</h1>
              <p className="font-bold text-slate-500">CLIENT: {client?.name}</p>
           </div>
           <p className="text-lg italic">「本報表由 2026 最新財務模型生成，旨在提供最佳資產配置決策。」</p>
           <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <h3 className="font-bold text-blue-600 mb-2">當前分析模組</h3>
              <p className="font-black text-2xl">{activeTab}</p>
           </div>
        </div>
      </div>
    </div>
  );
};

/**
 * ============================================================================
 * 通用子組件
 * ============================================================================
 */

const PrintStyles = () => (
  <style>{`
    @media print {
      aside, main, .no-print, .toast-container, .mobile-header, .print-hidden-bar { display: none !important; }
      body { background: white !important; height: auto !important; overflow: visible !important; }
      #report-modal { position: static !important; overflow: visible !important; height: auto !important; width: 100% !important; z-index: 9999; }
    }
  `}</style>
);

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => { onClose(); }, 4000); 
    return () => clearTimeout(timer);
  }, [onClose]);
  const bgColors = { success: 'bg-green-600', error: 'bg-red-600', info: 'bg-blue-600' };
  return (
    <div className={`fixed bottom-6 right-6 ${bgColors[type] || 'bg-blue-600'} text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-bounce-in z-[100] toast-container max-w-[90vw]`}>
      <span className="font-bold text-sm md:text-base break-words">{message}</span>
    </div>
  );
};

const NavItem = ({ icon: Icon, label, active, onClick, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      disabled ? 'opacity-50 cursor-not-allowed text-slate-500' : active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium flex-1 text-left">{label}</span>
    {disabled && <Lock size={14} className="opacity-50" />}
  </button>
);

/**
 * ============================================================================
 * APP 主組件
 * ============================================================================
 */

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [minSplashTimePassed, setMinSplashTimePassed] = useState(false); 
  
  const [isSecretSignupRoute, setIsSecretSignupRoute] = useState(false); 
  const [isLoginRoute, setIsLoginRoute] = useState(false);

  const [clientLoading, setClientLoading] = useState(false); 
  const [currentClient, setCurrentClient] = useState(null);
  const [activeTab, setActiveTab] = useState('golden_safe'); 
  const [toast, setToast] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false); 
  const [isSaving, setIsSaving] = useState(false); 
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const lastSavedDataStr = useRef("");

  const defaultStates = {
    golden_safe: { mode: 'time', amount: 60000, years: 10, rate: 6, isLocked: false }, 
    gift: { loanAmount: 100, loanTerm: 7, loanRate: 2.8, investReturnRate: 6 },
    estate: { loanAmount: 1000, loanTerm: 30, loanRate: 2.2, investReturnRate: 6, existingLoanBalance: 700, existingMonthlyPayment: 38000 },
    student: { loanAmount: 40, investReturnRate: 6, years: 8, gracePeriod: 1, interestOnlyPeriod: 0, isQualified: false },
    super_active: { monthlySaving: 10000, investReturnRate: 6, activeYears: 15 },
    car: { carPrice: 100, investReturnRate: 6, resaleRate: 50, cycleYears: 5 },
    pension: { currentAge: 30, retireAge: 65, salary: 45000, laborInsYears: 35, selfContribution: false, pensionReturnRate: 3, desiredMonthlyIncome: 60000 },
    reservoir: { initialCapital: 1000, dividendRate: 5, reinvestRate: 8, years: 20 },
    tax: { spouse: true, children: 2, minorYearsTotal: 0, parents: 0, cash: 3000, realEstateMarket: 4000, stocks: 1000, insurancePlan: 0 },
    free_dashboard: { layout: [null, null, null, null] }
  };

  const [goldenSafeData, setGoldenSafeData] = useState(defaultStates.golden_safe); 
  const [giftData, setGiftData] = useState(defaultStates.gift);
  const [estateData, setEstateData] = useState(defaultStates.estate);
  const [studentData, setStudentData] = useState(defaultStates.student);
  const [superActiveData, setSuperActiveData] = useState(defaultStates.super_active);
  const [carData, setCarData] = useState(defaultStates.car);
  const [pensionData, setPensionData] = useState(defaultStates.pension);
  const [reservoirData, setReservoirData] = useState(defaultStates.reservoir);
  const [taxData, setTaxData] = useState(defaultStates.tax);
  const [freeDashboardLayout, setFreeDashboardLayout] = useState(defaultStates.free_dashboard.layout);

  const showToast = (message, type = 'success') => { setToast({ message, type }); };

  const navigateTo = (path, action) => {
    window.history.pushState({ path }, '', path);
    action();
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setIsSecretSignupRoute(path === '/signup-secret');
      setIsLoginRoute(path === '/login');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/signup-secret') setIsSecretSignupRoute(true);
    else if (path === '/login') setIsLoginRoute(true);
    const timer = setTimeout(() => { setMinSplashTimePassed(true); }, 2000); 
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (!currentUser) {
          setCurrentClient(null);
          setIsDataLoaded(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
      if (!user || !currentClient) {
          setIsDataLoaded(false);
          return;
      }
      setClientLoading(true);
      const clientDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'clients', currentClient.id);
      const unsubscribeClient = onSnapshot(clientDocRef, (docSnap) => {
          if (docSnap.exists()) {
              const data = docSnap.data();
              if (data.goldenSafeData) setGoldenSafeData(prev => ({...prev, ...data.goldenSafeData}));
              if (data.giftData) setGiftData(prev => ({...prev, ...data.giftData}));
              if (data.estateData) setEstateData(prev => ({...prev, ...data.estateData}));
              if (data.studentData) setStudentData(prev => ({...prev, ...data.studentData}));
              if (data.superActiveData) setSuperActiveData(prev => ({...prev, ...data.superActiveData}));
              if (data.carData) setCarData(prev => ({...prev, ...data.carData}));
              if (data.pensionData) setPensionData(prev => ({...prev, ...data.pensionData}));
              if (data.reservoirData) setReservoirData(prev => ({...prev, ...data.reservoirData}));
              if (data.taxData) setTaxData(prev => ({...prev, ...data.taxData}));
              if (data.freeDashboardLayout) setFreeDashboardLayout(data.freeDashboardLayout);
          }
          setClientLoading(false);
          setIsDataLoaded(true); 
      }, (err) => {
          console.error("Client Load Error:", err);
          showToast("讀取客戶資料失敗", "error");
          setClientLoading(false);
      });
      return () => unsubscribeClient();
  }, [currentClient?.id, user]); 

  const handleLogout = async () => { 
      await signOut(auth); 
      setCurrentClient(null);
      setIsDataLoaded(false);
      showToast("已安全登出", "info"); 
  };

  const handleBackToDashboard = () => {
      setIsDataLoaded(false);
      setCurrentClient(null);
  };

  const getCurrentData = () => {
    switch(activeTab) {
      case 'golden_safe': return goldenSafeData; 
      case 'gift': return giftData;
      case 'estate': return estateData;
      case 'student': return studentData;
      case 'super_active': return superActiveData;
      case 'car': return carData;
      case 'reservoir': return reservoirData;
      case 'pension': return pensionData;
      case 'tax': return taxData;
      default: return {};
    }
  };

  if (loading || !minSplashTimePassed) return <SplashScreen />;

  if (isSecretSignupRoute) {
      return <SecretSignupPage onSignupSuccess={() => {
          setIsSecretSignupRoute(false);
          window.location.href = '/'; 
      }} />;
  }

  if (!user || user.isAnonymous) {
      if (isLoginRoute) {
        return <LoginPage onLoginSuccess={() => {
            setIsLoginRoute(false);
            window.history.pushState({}, '', '/');
        }} />;
      }
      return (
        <LandingPage 
          onStart={() => navigateTo('/login', () => setIsLoginRoute(true))} 
          onSignup={() => navigateTo('/signup-secret', () => setIsSecretSignupRoute(true))}
          onHome={() => navigateTo('/', () => { setIsLoginRoute(false); setIsSecretSignupRoute(false); })}
        />
      );
  }

  if (!currentClient) {
      return (
          <>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="flex flex-col h-screen bg-slate-950">
                <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md shrink-0">
                    <div className="font-bold flex items-center gap-2 uppercase tracking-tighter"><Coins className="text-yellow-400"/> UltraAdvisor 戰情室</div>
                    <button onClick={handleLogout} className="text-sm bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2">
                        <LogOut size={16}/> 登出
                    </button>
                </div>
                <div className="flex-1 flex items-center justify-center p-6">
                   <div className="bg-slate-900 border border-white/5 p-12 rounded-[3rem] max-w-lg w-full text-center space-y-8 shadow-2xl">
                      <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center mx-auto text-blue-500"><Users size={40}/></div>
                      <h2 className="text-3xl font-black text-white">選擇要規劃的客戶</h2>
                      <button onClick={() => setCurrentClient({ id: 'demo-client', name: '王大明' })} className="w-full bg-slate-800 hover:bg-blue-600 text-white p-5 rounded-2xl font-bold transition-all">
                        王大明 (Demo 客戶)
                      </button>
                   </div>
                </div>
            </div>
          </>
      );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden relative">
      <PrintStyles />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* 手機版側邊欄 */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[200] md:hidden">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="absolute top-0 right-0 w-80 h-full bg-slate-900 p-6 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-8">
              <span className="font-black text-white italic">MENU</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-800 rounded-lg text-slate-400"><X size={24}/></button>
            </div>
            <nav className="space-y-4 overflow-y-auto">
              <NavItem icon={LayoutDashboard} label="自由組合戰情室" active={activeTab === 'free_dashboard'} onClick={() => {setActiveTab('free_dashboard'); setIsMobileMenuOpen(false);}} />
              <NavItem icon={ShieldCheck} label="黃金保險箱理論" active={activeTab === 'golden_safe'} onClick={() => {setActiveTab('golden_safe'); setIsMobileMenuOpen(false);}} />
              <NavItem icon={Activity} label="市場數據戰情室" active={activeTab === 'market_data'} onClick={() => {setActiveTab('market_data'); setIsMobileMenuOpen(false);}} />
              <div className="h-px bg-slate-800 my-2"></div>
              <NavItem icon={Wallet} label="百萬禮物專案" active={activeTab === 'gift'} onClick={() => {setActiveTab('gift'); setIsMobileMenuOpen(false);}} />
              <NavItem icon={Building2} label="金融房產專案" active={activeTab === 'estate'} onClick={() => {setActiveTab('estate'); setIsMobileMenuOpen(false);}} />
              <NavItem icon={GraduationCap} label="學貸活化專案" active={activeTab === 'student'} onClick={() => {setActiveTab('student'); setIsMobileMenuOpen(false);}} />
            </nav>
          </aside>
        </div>
      )}

      <ReportModal 
        isOpen={isReportOpen} 
        onClose={() => setIsReportOpen(false)} 
        user={user} 
        client={currentClient}
        activeTab={activeTab} 
        data={getCurrentData()} 
      />

      <aside className="w-72 bg-slate-900 text-white flex-col hidden md:flex shadow-2xl z-10 print:hidden">
        <div className="p-4 border-b border-slate-800">
            <button onClick={handleBackToDashboard} className="w-full flex items-center gap-2 text-slate-400 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-lg transition-all mb-4">
              <ChevronLeft size={18}/> 返回客戶列表
            </button>
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shrink-0">{currentClient.name.charAt(0)}</div>
              <div className="font-bold truncate text-white">{currentClient.name}</div>
            </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem icon={LayoutDashboard} label="自由組合戰情室" active={activeTab === 'free_dashboard'} onClick={() => setActiveTab('free_dashboard')} />
          <NavItem icon={ShieldCheck} label="黃金保險箱理論" active={activeTab === 'golden_safe'} onClick={() => setActiveTab('golden_safe')} />
          <NavItem icon={Activity} label="市場數據戰情室" active={activeTab === 'market_data'} onClick={() => setActiveTab('market_data')} />
          <NavItem icon={History} label="基金時光機" active={activeTab === 'fund_machine'} onClick={() => setActiveTab('fund_machine')} />
          <div className="h-px bg-slate-800 my-4"></div>
          <NavItem icon={Wallet} label="百萬禮物專案" active={activeTab === 'gift'} onClick={() => setActiveTab('gift')} />
          <NavItem icon={Building2} label="金融房產專案" active={activeTab === 'estate'} onClick={() => setActiveTab('estate')} />
          <NavItem icon={GraduationCap} label="學貸活化專案" active={activeTab === 'student'} onClick={() => setActiveTab('student')} />
          <NavItem icon={Rocket} label="超積極存錢法" active={activeTab === 'super_active'} onClick={() => setActiveTab('super_active')} />
          <NavItem icon={Waves} label="大小水庫專案" active={activeTab === 'reservoir'} onClick={() => setActiveTab('reservoir')} />
          <NavItem icon={Car} label="五年換車專案" active={activeTab === 'car'} onClick={() => setActiveTab('car')} />
          <NavItem icon={Umbrella} label="退休缺口試算" active={activeTab === 'pension'} onClick={() => setActiveTab('pension')} />
          <NavItem icon={Landmark} label="稅務傳承專案" active={activeTab === 'tax'} onClick={() => setActiveTab('tax')} />
        </nav>
        <div className="p-4 border-t border-slate-800">
           <button onClick={() => setIsReportOpen(true)} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-3 rounded-xl w-full shadow-lg shadow-blue-900/50">
             <FileBarChart size={18} /> 生成策略報表
           </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-950">
        <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-md shrink-0 z-20">
          <div className="font-bold flex items-center gap-2 uppercase tracking-tighter">
              <Users size={20} className="text-blue-400"/>
              <span>{currentClient.name}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsReportOpen(true)} className="p-2 bg-slate-800 rounded-lg"><FileBarChart size={24} /></button>
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-slate-800 rounded-lg"><Menu size={24} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
           <div className="max-w-5xl mx-auto pb-20 md:pb-0">
             {activeTab === 'market_data' && <MarketDataZone />}
             {activeTab === 'golden_safe' && <GoldenSafeVault data={goldenSafeData} setData={setGoldenSafeData} />}
             {activeTab === 'fund_machine' && <FundTimeMachine />}
             {activeTab === 'gift' && <MillionDollarGiftTool data={giftData} setData={setGiftData} />}
             {activeTab === 'estate' && <FinancialRealEstateTool data={estateData} setData={setEstateData} />}
             {activeTab === 'student' && <StudentLoanTool data={studentData} setData={setStudentData} />}
             {activeTab === 'super_active' && <SuperActiveSavingTool data={superActiveData} setData={setSuperActiveData} />}
             {activeTab === 'car' && <CarReplacementTool data={carData} setData={setCarData} />}
             {activeTab === 'reservoir' && <BigSmallReservoirTool data={reservoirData} setData={setReservoirData} />}
             {activeTab === 'pension' && <LaborPensionTool data={pensionData} setData={setPensionData} />}
             {activeTab === 'tax' && <TaxPlannerTool data={taxData} setData={setTaxData} />}
             {activeTab === 'free_dashboard' && (
                <FreeDashboardTool 
                  allData={{goldenSafeData, giftData, estateData, studentData, superActiveData, carData, pensionData, reservoirData, taxData}} 
                  setAllData={{goldenSafeData: setGoldenSafeData, giftData: setGiftData, estateData: setEstateData, studentData: setStudentData, superActiveData: setSuperActiveData, carData: setCarData, pensionData: setPensionData, reservoirData: setReservoirData, taxData: setTaxData}} 
                  savedLayout={freeDashboardLayout} 
                  onSaveLayout={setFreeDashboardLayout} 
                />
             )}
           </div>
        </div>
      </main>
    </div>
  );
}