import React, { useState, useEffect, useRef } from 'react';
import { 
  Wallet, Building2, Coins, Check, ShieldAlert, Menu, X, LogOut, FileBarChart, 
  GraduationCap, Umbrella, Waves, Landmark, Lock, Rocket, Car, Loader2,
  ChevronLeft, Users, ShieldCheck, Activity, History, LayoutDashboard
} from 'lucide-react';

import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, onSnapshot, Timestamp, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// [修正] 改為具名匯入 (加上花括號)
import { LoginPage } from './components/auth/LoginPage';
import { SecretSignupPage } from './components/auth/SecretSignupPage';

import ReportModal from './components/ReportModal';
import ClientDashboard from './components/ClientDashboard';
import SplashScreen from './components/SplashScreen'; 

// --- 工具元件 ---
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

// ------------------------------------------------------------------
// Helper: 產生隨機 Session ID
// ------------------------------------------------------------------
const generateSessionId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

// ------------------------------------------------------------------
// UI Components
// ------------------------------------------------------------------
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
    <div className={`fixed bottom-6 right-6 ${bgColors[type] || 'bg-blue-600'} text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-bounce-in z-[100] toast-container max-w-[90vw]`}>
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
      disabled 
      ? 'opacity-50 cursor-not-allowed text-slate-500' 
      : active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium flex-1 text-left">{label}</span>
    {disabled && <Lock size={14} className="opacity-50" />}
  </button>
);

// ------------------------------------------------------------------
// Main App Shell
// ------------------------------------------------------------------

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true); 
  const [minSplashTimePassed, setMinSplashTimePassed] = useState(false); 
  const [isSecretSignupRoute, setIsSecretSignupRoute] = useState(false); 

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

  // Tool Data States
  const defaultStates = {
    golden_safe: { mode: 'time', amount: 60000, years: 10, rate: 6, isLocked: false }, 
    market_data: {}, 
    fund_machine: {}, 
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

  // =================================================================
  // [核心] 安全機制：雙裝置限制 (Max 2 Concurrent Sessions)
  // =================================================================
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
        if (activeSessions.length > 2) {
            activeSessions = activeSessions.slice(activeSessions.length - 2);
        }
        await setDoc(metaRef, {
            activeSessions: activeSessions,
            lastLoginTime: Timestamp.now(),
            deviceInfo: navigator.userAgent
        }, { merge: true });
    } catch (error) {
        console.error("Session update failed:", error);
    } finally {
        setTimeout(() => { isRegistering.current = false; }, 1500); 
    }
  };

  // 裝置踢出監聽器
  useEffect(() => {
    if (!user) return;
    const localSessionId = localStorage.getItem('my_app_session_id');
    
    if (isRegistering.current) return;

    if (!localSessionId) {
        console.warn("Detected legacy session, forcing logout for upgrade.");
        signOut(auth).then(() => {
        });
        return;
    }

    const userMetaRef = doc(db, 'users', user.uid, 'system', 'metadata');
    const unsubscribe = onSnapshot(userMetaRef, async (docSnap) => {
        if (isRegistering.current) return;
        if (docSnap.exists()) {
            const data = docSnap.data();
            const activeSessions: string[] = data.activeSessions || [];
            if (activeSessions.length > 0 && !activeSessions.includes(localSessionId)) {
                console.warn("裝置數量超過限制，此裝置已被登出");
                localStorage.removeItem('my_app_session_id');
                await signOut(auth);
                alert("您的帳號已在第 3 台裝置登入。\n系統限制同時使用 2 台裝置。\n此舊連線已自動登出。");
                window.location.reload();
            }
        }
    });
    return () => unsubscribe();
  }, [user]);

  // =================================================================

  // 初始化檢查路由
  useEffect(() => {
    if (window.location.pathname === '/signup-secret') {
        setIsSecretSignupRoute(true);
    }
    const timer = setTimeout(() => { setMinSplashTimePassed(true); }, 3000); 
    return () => clearTimeout(timer);
  }, []);

  // 監聽 Auth 狀態
  useEffect(() => {
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

  // --- 客戶資料載入 ---
  useEffect(() => {
      if (!user || !currentClient) {
          setIsDataLoaded(false);
          return;
      }
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
              setCurrentClient((prev: any) => ({ ...prev, name: data.name, note: data.note }));
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

  // --- 自動儲存 ---
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
            await setDoc(doc(db, 'users', user.uid, 'clients', currentClient.id), {
                ...dataPayload,
                updatedAt: Timestamp.now()
            }, { merge: true });
            lastSavedDataStr.current = currentDataStr;
            setTimeout(() => setIsSaving(false), 500);
        } catch (error) {
            console.error("Auto-save failed:", error);
            setIsSaving(false);
        }
    };
    const handler = setTimeout(saveData, 1500);
    return () => clearTimeout(handler);
  }, [
    goldenSafeData, giftData, estateData, studentData, superActiveData, 
    carData, pensionData, reservoirData, taxData, freeDashboardLayout,
    user, currentClient, isDataLoaded
  ]);

  const handleLogout = async () => { 
      localStorage.removeItem('my_app_session_id');
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
      case 'market_data': return {}; 
      case 'fund_machine': return {}; 
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

  // --- 畫面渲染邏輯 ---

  if (loading || !minSplashTimePassed) return <SplashScreen />;

  // 情境 1: 未登入
  if (!user) {
      // 判斷是否走後門 (秘密連結)
      if (isSecretSignupRoute) {
          return <SecretSignupPage onSignupSuccess={() => {
              // 1. 彈出成功視窗 (給予明確回饋)
              alert("🎉 帳號開通成功！\n\n系統將自動導向至您的專屬戰情室。");
              
              // 2. 註冊裝置 Session
              if (auth.currentUser) registerDeviceSession(auth.currentUser.uid);
              
              // 3. [暴力解法] 強制瀏覽器重新整理並回到首頁 (清除網址列的 /signup-secret)
              // 這樣能保證 100% 進入登入後狀態
              window.location.href = '/'; 
          }} />;
      }
      // 否則顯示一般登入頁
      return <LoginPage onLoginSuccess={() => {
          if (auth.currentUser) registerDeviceSession(auth.currentUser.uid);
      }} />;
  }

  if (!currentClient) {
      return (
          <>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="flex flex-col h-screen">
                <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md shrink-0">
                    <div className="font-bold flex items-center gap-2"><Coins className="text-yellow-400"/> 資產規劃戰情室</div>
                    <button onClick={handleLogout} className="text-sm bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2">
                        <LogOut size={16}/> 登出
                    </button>
                </div>
                <ClientDashboard user={user} onSelectClient={setCurrentClient} />
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

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900 text-white flex flex-col animate-fade-in md:hidden">
           {/* Mobile Menu ... */}
           <div className="p-4 flex justify-between items-center border-b border-slate-800">
              <span className="font-bold text-lg">功能選單</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-800 rounded-full"><X size={24}/></button>
           </div>
           <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <button onClick={handleBackToDashboard} className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl flex items-center gap-2 font-bold mb-4">
                  <ChevronLeft size={20}/> 返回客戶列表
              </button>
              <div className="text-xs font-bold text-yellow-400 px-4 py-2 uppercase tracking-wider flex items-center gap-2 mt-2">
                 <ShieldCheck size={14}/> 觀念與診斷
              </div>
              <NavItem icon={LayoutDashboard} label="自由組合戰情室" active={activeTab === 'free_dashboard'} onClick={() => {setActiveTab('free_dashboard'); setIsMobileMenuOpen(false);}} />
              <NavItem icon={ShieldCheck} label="黃金保險箱理論" active={activeTab === 'golden_safe'} onClick={() => {setActiveTab('golden_safe'); setIsMobileMenuOpen(false);}} />
              <NavItem icon={Activity} label="市場數據戰情室" active={activeTab === 'market_data'} onClick={() => {setActiveTab('market_data'); setIsMobileMenuOpen(false);}} />
              <NavItem icon={History} label="基金時光機" active={activeTab === 'fund_machine'} onClick={() => {setActiveTab('fund_machine'); setIsMobileMenuOpen(false);}} />

              <div className="text-xs font-bold text-emerald-400 px-4 py-2 uppercase tracking-wider flex items-center gap-2 mt-4">
                 <Rocket size={14}/> 創富：槓桿與套利
              </div>
              <NavItem icon={Wallet} label="百萬禮物專案" active={activeTab === 'gift'} onClick={() => {setActiveTab('gift'); setIsMobileMenuOpen(false);}} />
              <NavItem icon={Building2} label="金融房產專案" active={activeTab === 'estate'} onClick={() => {setActiveTab('estate'); setIsMobileMenuOpen(false);}} />
              <NavItem icon={GraduationCap} label="學貸活化專案" active={activeTab === 'student'} onClick={() => {setActiveTab('student'); setIsMobileMenuOpen(false);}} />
              <NavItem icon={Rocket} label="超積極存錢法" active={activeTab === 'super_active'} onClick={() => {setActiveTab('super_active'); setIsMobileMenuOpen(false);}} />
              
              <div className="text-xs font-bold text-blue-400 px-4 py-2 uppercase tracking-wider flex items-center gap-2 mt-4">
                 <ShieldAlert size={14}/> 守富：現金流防禦
              </div>
              <NavItem icon={Waves} label="大小水庫專案" active={activeTab === 'reservoir'} onClick={() => {setActiveTab('reservoir'); setIsMobileMenuOpen(false);}} />
              <NavItem icon={Car} label="五年換車專案" active={activeTab === 'car'} onClick={() => {setActiveTab('car'); setIsMobileMenuOpen(false);}} />
              <NavItem icon={Umbrella} label="退休缺口試算" active={activeTab === 'pension'} onClick={() => {setActiveTab('pension'); setIsMobileMenuOpen(false);}} />

              <div className="text-xs font-bold text-purple-400 px-4 py-2 uppercase tracking-wider flex items-center gap-2 mt-4">
                 <Landmark size={14}/> 傳富：稅務與傳承
              </div>
              <NavItem icon={Landmark} label="稅務傳承專案" active={activeTab === 'tax'} onClick={() => {setActiveTab('tax'); setIsMobileMenuOpen(false);}} />
           </div>
        </div>
      )}

      {/* Sidebar (Desktop) */}
      <aside className="w-72 bg-slate-900 text-white flex-col hidden md:flex shadow-2xl z-10 print:hidden">
        <div className="p-4 border-b border-slate-800">
           <button 
             onClick={handleBackToDashboard}
             className="w-full flex items-center gap-2 text-slate-400 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-lg transition-all mb-4"
           >
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
                <>
                   <Loader2 size={12} className="animate-spin text-blue-400"/>
                   <span>儲存中...</span>
                </>
             ) : (
                <>
                   <div className="w-2 h-2 rounded-full bg-green-500"></div>
                   <span>已同步</span>
                </>
             )}
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-bold text-yellow-400 px-4 py-2 uppercase tracking-wider flex items-center gap-2 mt-2">
             <ShieldCheck size={14}/> 觀念與診斷
          </div>
          <NavItem icon={LayoutDashboard} label="自由組合戰情室" active={activeTab === 'free_dashboard'} onClick={() => setActiveTab('free_dashboard')} />
          <NavItem icon={ShieldCheck} label="黃金保險箱理論" active={activeTab === 'golden_safe'} onClick={() => setActiveTab('golden_safe')} />
          <NavItem icon={Activity} label="市場數據戰情室" active={activeTab === 'market_data'} onClick={() => setActiveTab('market_data')} />
          <NavItem icon={History} label="基金時光機" active={activeTab === 'fund_machine'} onClick={() => setActiveTab('fund_machine')} />

          <div className="text-xs font-bold text-emerald-400 px-4 py-2 uppercase tracking-wider flex items-center gap-2 mt-4">
             <Rocket size={14}/> 創富：槓桿與套利
          </div>
          <NavItem icon={Wallet} label="百萬禮物專案" active={activeTab === 'gift'} onClick={() => setActiveTab('gift')} />
          <NavItem icon={Building2} label="金融房產專案" active={activeTab === 'estate'} onClick={() => setActiveTab('estate')} />
          <NavItem icon={GraduationCap} label="學貸活化專案" active={activeTab === 'student'} onClick={() => setActiveTab('student')} />
          <NavItem icon={Rocket} label="超積極存錢法" active={activeTab === 'super_active'} onClick={() => setActiveTab('super_active')} />
          
          <div className="text-xs font-bold text-blue-400 px-4 py-2 uppercase tracking-wider flex items-center gap-2 mt-4">
             <ShieldAlert size={14}/> 守富：現金流防禦
          </div>
          <NavItem icon={Waves} label="大小水庫專案" active={activeTab === 'reservoir'} onClick={() => setActiveTab('reservoir')} />
          <NavItem icon={Car} label="五年換車專案" active={activeTab === 'car'} onClick={() => setActiveTab('car')} />
          <NavItem icon={Umbrella} label="退休缺口試算" active={activeTab === 'pension'} onClick={() => setActiveTab('pension')} />

          <div className="text-xs font-bold text-purple-400 px-4 py-2 uppercase tracking-wider flex items-center gap-2 mt-4">
             <Landmark size={14}/> 傳富：稅務與傳承
          </div>
          <NavItem icon={Landmark} label="稅務傳承專案" active={activeTab === 'tax'} onClick={() => setActiveTab('tax')} />
        </nav>

        <div className="p-4 border-t border-slate-800">
           <button onClick={() => setIsReportOpen(true)} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-3 rounded-xl w-full transition-all shadow-lg shadow-blue-900/50">
             <FileBarChart size={18} /> 生成策略報表
           </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-md shrink-0 print:hidden">
          <div className="font-bold flex items-center gap-2">
              <Users size={20} className="text-blue-400"/>
              <span>{currentClient.name}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsReportOpen(true)} className="p-2 bg-slate-800 rounded-lg active:bg-slate-700">
              <FileBarChart size={24} />
            </button>
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-slate-800 rounded-lg active:bg-slate-700">
              <Menu size={24} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
           <div className="max-w-5xl mx-auto pb-20 md:pb-0">
             {activeTab === 'free_dashboard' && (
                <FreeDashboardTool 
                   allData={{
                      goldenSafeData, giftData, estateData, studentData, superActiveData, 
                      carData, pensionData, reservoirData, taxData
                   }}
                   setAllData={{
                      goldenSafeData: setGoldenSafeData,
                      giftData: setGiftData,
                      estateData: setEstateData,
                      studentData: setStudentData,
                      superActiveData: setSuperActiveData,
                      carData: setCarData,
                      pensionData: setPensionData,
                      reservoirData: setReservoirData,
                      taxData: setTaxData
                   }}
                   savedLayout={freeDashboardLayout}
                   onSaveLayout={setFreeDashboardLayout}
                />
             )}
             {activeTab === 'golden_safe' && <GoldenSafeVault data={goldenSafeData} setData={setGoldenSafeData} />}
             {activeTab === 'market_data' && <MarketDataZone />}
             {activeTab === 'fund_machine' && <FundTimeMachine />}
             
             {activeTab === 'gift' && <MillionDollarGiftTool data={giftData} setData={setGiftData} />}
             {activeTab === 'estate' && <FinancialRealEstateTool data={estateData} setData={setEstateData} />}
             {activeTab === 'student' && <StudentLoanTool data={studentData} setData={setStudentData} />}
             {activeTab === 'super_active' && <SuperActiveSavingTool data={superActiveData} setData={setSuperActiveData} />}
             {activeTab === 'car' && <CarReplacementTool data={carData} setData={setCarData} />}
             {activeTab === 'reservoir' && <BigSmallReservoirTool data={reservoirData} setData={setReservoirData} />}
             {activeTab === 'pension' && <LaborPensionTool data={pensionData} setData={setPensionData} />}
             {activeTab === 'tax' && <TaxPlannerTool data={taxData} setData={setTaxData} />}
           </div>
        </div>
      </main>
    </div>
  );
}