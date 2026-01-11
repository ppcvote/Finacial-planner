import React, { useState, useEffect, useRef } from 'react';
import { 
  Wallet, Building2, Coins, Check, ShieldAlert, Menu, X, LogOut, FileBarChart, 
  GraduationCap, Umbrella, Waves, Landmark, Lock, Rocket, Car, Loader2,
  ChevronLeft, Users, ShieldCheck, Activity, History, LayoutDashboard
} from 'lucide-react';

import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, onSnapshot, Timestamp, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// 組件匯入
import { LoginPage } from './components/auth/LoginPage';
import { SecretSignupPage } from './components/auth/SecretSignupPage';
import { LandingPage } from './components/LandingPage'; 

import ReportModal from './components/ReportModal';
import ClientDashboard from './components/ClientDashboard';
import SplashScreen from './components/SplashScreen'; 

import { FinancialRealEstateTool } from './components/FinancialRealEstateTool';
import { StudentLoanTool } from './components/StudentLoanTool';
import { SuperActiveSavingTool } from './components/SuperActiveSavingTool';
import { CarReplacementTool } from './components/CarReplacementTool';
import { LaborPensionTool } from './components/LaborPensionTool';
import { BigSmallReservoirTool } from './components/BigSmallReservoirTool';
import { TaxPlannerTool } from './components/TaxPlannerTool';
import MillionDollarGiftTool from './components/MillionDollarGiftTool';
import FreeDashboardTool from './components/FreeDashboardTool';
import MarketDataZone from './components/MarketDataZone'; 
import GoldenSafeVault from './components/GoldenSafeVault'; 
import FundTimeMachine from './components/FundTimeMachine'; 
import AccountSettings from './pages/AccountSettings';

// 在路由配置中加入

const generateSessionId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

const PrintStyles = () => (
  <style>{`
    @media print {
      aside, main, .no-print, .toast-container, .mobile-header, .print-hidden-bar { display: none !important; }
      body { background: white !important; height: auto !important; overflow: visible !important; }
      .print-break-inside { break-inside: avoid; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      #report-modal { position: static !important; overflow: visible !important; height: auto !important; width: 100% !important; z-index: 9999; }
      .absolute { position: static !important; }
      .print\\:block { display: block !important; }
      .print\\:grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
      ::-webkit-scrollbar { display: none; }
    }
  `}</style>
);

const Toast = ({ message, type = 'success', onClose }: { message: string, type: string, onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => { onClose(); }, 4000); 
    return () => clearTimeout(timer);
  }, [onClose]);
  const bgColors: Record<string, string> = { success: 'bg-green-600', error: 'bg-red-600', info: 'bg-blue-600' };
  return (
    <div className={`fixed bottom-6 right-6 ${bgColors[type] || 'bg-blue-600'} text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-bounce-in z-[200] toast-container max-w-[90vw]`}>
      {type === 'success' && <Check size={20} className="shrink-0" />}
      {type === 'error' && <ShieldAlert size={20} className="shrink-0" />}
      <span className="font-bold text-sm md:text-base break-words">{message}</span>
    </div>
  );
};

const NavItem = ({ icon: Icon, label, active, onClick, disabled = false }: any) => (
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

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true); 
  const [minSplashTimePassed, setMinSplashTimePassed] = useState(false); 
  
  // 新增：控制登入頁面顯示邏輯
const [needsLoginInteraction, setNeedsLoginInteraction] = useState(() => {
  // 混合模式邏輯
  if (!user) return true; // 未登入一定要顯示登入頁
  
  // 判斷是否為試用用戶（這裡需要根據你的實際邏輯調整）
  // 假設試用用戶沒有 subscriptionStatus 或為 'trial'
  const isTrialUser = !user.subscriptionStatus || user.subscriptionStatus === 'trial';
  
  if (isTrialUser) {
    // 試用用戶：每次都顯示
    return true;
  } else {
    // 付費用戶：檢查 24 小時內是否已顯示過
    const lastShown = sessionStorage.getItem('last_login_page_shown');
    const now = Date.now();
    if (!lastShown) return true;
    
    const hoursSinceLastShown = (now - parseInt(lastShown)) / (1000 * 60 * 60);
    return hoursSinceLastShown > 24; // 超過 24 小時就顯示
  }
});
 
  // 路由與同步狀態
  const [isSecretSignupRoute, setIsSecretSignupRoute] = useState(false); 
  const [isLoginRoute, setIsLoginRoute] = useState(false);
  const [clientLoading, setClientLoading] = useState(false); 
  const [currentClient, setCurrentClient] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('golden_safe'); 
  const [toast, setToast] = useState<{message: string, type: string} | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false); 
  const [isSaving, setIsSaving] = useState(false); 
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  const lastSavedDataStr = useRef<string>("");
  const isRegistering = useRef(false);

  // 工具數據狀態
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
  const [freeDashboardLayout, setFreeDashboardLayout] = useState<(string | null)[]>(defaultStates.free_dashboard.layout);

  const showToast = (message: string, type = 'success') => { setToast({ message, type }); };

  // ==========================================
  // 1. 安全機制：雙裝置限制邏輯
  // ==========================================
  const registerDeviceSession = async (uid: string) => {
    isRegistering.current = true;
    const newSessionId = generateSessionId();
    localStorage.setItem('my_app_session_id', newSessionId);
    
    const metaRef = doc(db, 'users', uid, 'system', 'metadata');
    try {
      const docSnap = await getDoc(metaRef);
      let activeSessions: string[] = [];
      if (docSnap.exists() && docSnap.data().activeSessions) {
        activeSessions = docSnap.data().activeSessions;
      }
      activeSessions.push(newSessionId);
      if (activeSessions.length > 2) activeSessions = activeSessions.slice(-2);
      
      await setDoc(metaRef, { 
        activeSessions, 
        lastLoginTime: Timestamp.now(), 
        deviceInfo: navigator.userAgent 
      }, { merge: true });
    } catch (error) {
      console.error("Session update failed:", error);
    } finally {
      setTimeout(() => { isRegistering.current = false; }, 1500);
    }
  };

  useEffect(() => {
    if (isSecretSignupRoute || !user) return;
    const localSessionId = localStorage.getItem('my_app_session_id');
    if (isRegistering.current || !localSessionId) return;

    const userMetaRef = doc(db, 'users', user.uid, 'system', 'metadata');
    const unsubscribe = onSnapshot(userMetaRef, async (docSnap) => {
      if (isRegistering.current) return;
      if (docSnap.exists()) {
        const activeSessions = docSnap.data().activeSessions || [];
        if (activeSessions.length > 0 && !activeSessions.includes(localSessionId)) {
          localStorage.removeItem('my_app_session_id');
          await signOut(auth);
          alert("裝置數量超過限制：您的帳號已在其他裝置登入，此連線已自動登出。");
          window.location.reload();
        }
      }
    });
    return () => unsubscribe();
  }, [user, isSecretSignupRoute]);

  // ==========================================
  // 2. 性能優化：Firestore 防抖寫入
  // ==========================================
  const cleanDataForFirebase = (obj: any) => {
    return JSON.parse(JSON.stringify(obj, (key, value) => value === undefined ? null : value));
  };

  useEffect(() => {
    if (!user || !currentClient || !isDataLoaded) return;

    const dataPayload = {
        goldenSafeData, giftData, estateData, studentData, superActiveData, 
        carData, pensionData, reservoirData, taxData, freeDashboardLayout 
    };
    
    const currentDataStr = JSON.stringify(dataPayload);
    if (currentDataStr === lastSavedDataStr.current) return;

    const saveData = async () => {
        setIsSaving(true);
        try {
            const cleanedPayload = cleanDataForFirebase(dataPayload);
            await setDoc(doc(db, 'users', user.uid, 'clients', currentClient.id), {
                ...cleanedPayload,
                updatedAt: Timestamp.now()
            }, { merge: true });
            lastSavedDataStr.current = currentDataStr;
            setTimeout(() => setIsSaving(false), 500);
        } catch (error) {
            console.error("Auto-save failed:", error);
            setIsSaving(false);
        }
    };

    // 防抖：1.5 秒內無新變動才寫入
    const handler = setTimeout(saveData, 1500);
    return () => clearTimeout(handler);
  }, [
    goldenSafeData, giftData, estateData, studentData, superActiveData, 
    carData, pensionData, reservoirData, taxData, freeDashboardLayout,
    user, currentClient, isDataLoaded
  ]);

  // ==========================================
  // 3. UI 修復：手機選單背景滾動鎖定
  // ==========================================
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  // 其他業務邏輯
  const navigateTo = (path: string, action: () => void) => {
    window.history.pushState({ path }, '', path);
    action();
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setIsSecretSignupRoute(path === '/signup-secret');
      setIsLoginRoute(path === '/login');
      if (path === '/') { setIsSecretSignupRoute(false); setIsLoginRoute(false); }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/signup-secret') setIsSecretSignupRoute(true);
    else if (path === '/login') setIsLoginRoute(true);
    const timer = setTimeout(() => { setMinSplashTimePassed(true); }, 3000); 
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (!currentUser) { setCurrentClient(null); setIsDataLoaded(false); }
    });
    return () => unsubscribe();
  }, []);

  // 客戶資料監聽
  useEffect(() => {
      if (!user || !currentClient) { setIsDataLoaded(false); return; }
      setClientLoading(true);
      const clientDocRef = doc(db, 'users', user.uid, 'clients', currentClient.id);
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
      });
      return () => unsubscribeClient();
  }, [currentClient?.id, user]); 

  const handleLogout = async () => { 
      localStorage.removeItem('my_app_session_id');
      await signOut(auth); 
      setCurrentClient(null);
      setIsDataLoaded(false);
      showToast("已安全登出", "info"); 
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
          alert("🎉 帳號開通成功！");
          setIsSecretSignupRoute(false);
          window.location.href = '/'; 
      }} />;
  }

 if (!user || needsLoginInteraction) {
  // 已登入但需要展示歡迎頁 or 未登入需要登入
  if (isLoginRoute || user) {
    return <LoginPage 
      user={user}  // 傳入用戶資訊（已登入時會有值）
      onLoginSuccess={() => {
        // 記錄本次顯示時間
        sessionStorage.setItem('last_login_page_shown', Date.now().toString());
        
        // 標記不再需要顯示登入頁
        setNeedsLoginInteraction(false);
        
        // 如果是新登入（之前沒有 user），註冊裝置
        if (!user && auth.currentUser) {
          registerDeviceSession(auth.currentUser.uid);
        }
        
        // 清除登入路由狀態
        setIsLoginRoute(false);
        window.history.pushState({}, '', '/');
      }} 
    />;
  }
  // 未登入且不在登入路由 → 顯示 Landing Page
  return <LandingPage 
    onStart={() => navigateTo('/login', () => setIsLoginRoute(true))} 
    onSignup={() => navigateTo('/signup-secret', () => setIsSecretSignupRoute(true))}
    onHome={() => navigateTo('/', () => { setIsLoginRoute(false); setIsSecretSignupRoute(false); })}
 />;
}
  if (!currentClient) {
      return (
          <>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="flex flex-col h-screen overflow-hidden">
                <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md shrink-0">
                    <div className="font-bold flex items-center gap-2 uppercase tracking-tighter"><Coins className="text-yellow-400"/> UltraAdvisor 戰情室</div>
                    <button onClick={handleLogout} className="text-sm bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2">
                        <LogOut size={16}/> 登出
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <ClientDashboard user={user} onSelectClient={setCurrentClient} />
                </div>
            </div>
          </>
      );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <PrintStyles />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {clientLoading && (
          <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                  <Loader2 className="animate-spin text-blue-600 mx-auto mb-2" size={40}/>
                  <p className="text-slate-600 font-bold">正在讀取 {currentClient.name} 的檔案...</p>
              </div>
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

      {/* 手機版側邊選單 */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[150] md:hidden">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm animate-fade-in" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-72 bg-slate-900 text-white flex flex-col shadow-2xl animate-slide-in">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <span className="font-bold">選單</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-slate-800 rounded-full"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <button onClick={() => { setCurrentClient(null); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-2 text-slate-400 hover:text-white hover:bg-slate-800 px-3 py-3 rounded-lg mb-4 border border-slate-800">
                <ChevronLeft size={18}/> 返回客戶列表
              </button>
              <div className="text-xs font-bold text-yellow-400 px-4 py-2 uppercase tracking-wider flex items-center gap-2 mt-2">觀念與診斷</div>
              <NavItem icon={LayoutDashboard} label="自由組合戰情室" active={activeTab === 'free_dashboard'} onClick={() => { setActiveTab('free_dashboard'); setIsMobileMenuOpen(false); }} />
              <NavItem icon={ShieldCheck} label="黃金保險箱理論" active={activeTab === 'golden_safe'} onClick={() => { setActiveTab('golden_safe'); setIsMobileMenuOpen(false); }} />
              <NavItem icon={Activity} label="市場數據戰情室" active={activeTab === 'market_data'} onClick={() => { setActiveTab('market_data'); setIsMobileMenuOpen(false); }} />
              <NavItem icon={History} label="基金時光機" active={activeTab === 'fund_machine'} onClick={() => { setActiveTab('fund_machine'); setIsMobileMenuOpen(false); }} />
              <div className="text-xs font-bold text-emerald-400 px-4 py-2 uppercase tracking-wider flex items-center gap-2 mt-4">創富：槓桿與套利</div>
              <NavItem icon={Wallet} label="百萬禮物專案" active={activeTab === 'gift'} onClick={() => { setActiveTab('gift'); setIsMobileMenuOpen(false); }} />
              <NavItem icon={Building2} label="金融房產專案" active={activeTab === 'estate'} onClick={() => { setActiveTab('estate'); setIsMobileMenuOpen(false); }} />
              <NavItem icon={GraduationCap} label="學貸活化專案" active={activeTab === 'student'} onClick={() => { setActiveTab('student'); setIsMobileMenuOpen(false); }} />
              <NavItem icon={Rocket} label="超積極存錢法" active={activeTab === 'super_active'} onClick={() => { setActiveTab('super_active'); setIsMobileMenuOpen(false); }} />
              <div className="text-xs font-bold text-blue-400 px-4 py-2 uppercase tracking-wider flex items-center gap-2 mt-4">守富：現金流防禦</div>
              <NavItem icon={Waves} label="大小水庫專案" active={activeTab === 'reservoir'} onClick={() => { setActiveTab('reservoir'); setIsMobileMenuOpen(false); }} />
              <NavItem icon={Car} label="五年換車專案" active={activeTab === 'car'} onClick={() => { setActiveTab('car'); setIsMobileMenuOpen(false); }} />
              <NavItem icon={Umbrella} label="退休缺口試算" active={activeTab === 'pension'} onClick={() => { setActiveTab('pension'); setIsMobileMenuOpen(false); }} />
              <div className="text-xs font-bold text-purple-400 px-4 py-2 uppercase tracking-wider flex items-center gap-2 mt-4">傳富：稅務與傳承</div>
              <NavItem icon={Landmark} label="稅務傳承專案" active={activeTab === 'tax'} onClick={() => { setActiveTab('tax'); setIsMobileMenuOpen(false); }} />
            </div>
            <div className="p-4 border-t border-slate-800">
              <button onClick={() => { setIsReportOpen(true); setIsMobileMenuOpen(false); }} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-50 text-white font-bold px-4 py-3 rounded-xl w-full">
                <FileBarChart size={18} /> 生成策略報表
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* 桌面版側邊欄 */}
      <aside className="w-72 bg-slate-900 text-white flex-col hidden md:flex shadow-2xl z-10 print:hidden">
        <div className="p-4 border-b border-slate-800">
            <button onClick={() => setCurrentClient(null)} className="w-full flex items-center gap-2 text-slate-400 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-lg transition-all mb-4">
              <ChevronLeft size={18}/> 返回客戶列表
            </button>
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg text-white shrink-0">
                {currentClient.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-blue-400 font-bold uppercase truncate">正在規劃</div>
                <div className="font-bold text-sm truncate text-white">{currentClient.name}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 bg-black/20 px-2 py-1 rounded">
              {isSaving ? (
                <><Loader2 size={12} className="animate-spin text-blue-400"/><span>儲存中...</span></>
              ) : (
                <><div className="w-2 h-2 rounded-full bg-green-500"></div><span>已同步</span></>
              )}
            </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-bold text-yellow-400 px-4 py-2 uppercase tracking-wider mt-2">觀念與診斷</div>
          <NavItem icon={LayoutDashboard} label="自由組合戰情室" active={activeTab === 'free_dashboard'} onClick={() => setActiveTab('free_dashboard')} />
          <NavItem icon={ShieldCheck} label="黃金保險箱理論" active={activeTab === 'golden_safe'} onClick={() => setActiveTab('golden_safe')} />
          <NavItem icon={Activity} label="市場數據戰情室" active={activeTab === 'market_data'} onClick={() => setActiveTab('market_data')} />
          <NavItem icon={History} label="基金時光機" active={activeTab === 'fund_machine'} onClick={() => setActiveTab('fund_machine')} />
          <div className="text-xs font-bold text-emerald-400 px-4 py-2 uppercase tracking-wider mt-4">創富：槓桿與套利</div>
          <NavItem icon={Wallet} label="百萬禮物專案" active={activeTab === 'gift'} onClick={() => setActiveTab('gift')} />
          <NavItem icon={Building2} label="金融房產專案" active={activeTab === 'estate'} onClick={() => setActiveTab('estate')} />
          <NavItem icon={GraduationCap} label="學貸活化專案" active={activeTab === 'student'} onClick={() => setActiveTab('student')} />
          <NavItem icon={Rocket} label="超積極存錢法" active={activeTab === 'super_active'} onClick={() => setActiveTab('super_active')} />
          <div className="text-xs font-bold text-blue-400 px-4 py-2 uppercase tracking-wider mt-4">守富：現金流防禦</div>
          <NavItem icon={Waves} label="大小水庫專案" active={activeTab === 'reservoir'} onClick={() => setActiveTab('reservoir')} />
          <NavItem icon={Car} label="五年換車專案" active={activeTab === 'car'} onClick={() => setActiveTab('car')} />
          <NavItem icon={Umbrella} label="退休缺口試算" active={activeTab === 'pension'} onClick={() => setActiveTab('pension')} />
          <div className="text-xs font-bold text-purple-400 px-4 py-2 uppercase tracking-wider mt-4">傳富：稅務與傳承</div>
          <NavItem icon={Landmark} label="稅務傳承專案" active={activeTab === 'tax'} onClick={() => setActiveTab('tax')} />
        </nav>
        <div className="p-4 border-t border-slate-800">
           <button onClick={() => setIsReportOpen(true)} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-50 text-white font-bold px-4 py-3 rounded-xl w-full transition-all shadow-lg shadow-blue-900/50">
             <FileBarChart size={18} /> 生成策略報表
           </button>
        </div>
      </aside>

      {/* 主內容區塊 */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-md shrink-0 print:hidden">
          <div className="font-bold flex items-center gap-2 uppercase tracking-tighter">
              <Users size={20} className="text-blue-400"/>
              <span>{currentClient.name}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsReportOpen(true)} className="p-2 bg-slate-800 rounded-lg active:bg-slate-700"><FileBarChart size={24} /></button>
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-slate-800 rounded-lg active:bg-slate-700"><Menu size={24} /></button>
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

      <style>{`
        @keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slide-in { animation: slide-in 0.3s ease-out forwards; }
        .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
}