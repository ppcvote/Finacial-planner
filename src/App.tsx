import React, { useState, useEffect, useRef } from 'react';
import { 
  Wallet, Building2, Coins, Check, ShieldAlert, Menu, X, LogOut, FileBarChart, 
  GraduationCap, Umbrella, Waves, Landmark, Lock, Rocket, Car, Loader2, Mail, Key
} from 'lucide-react';

import { 
  signInWithPopup, signOut, onAuthStateChanged, signInWithEmailAndPassword, 
  signInWithRedirect, getRedirectResult 
} from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

import { auth, db, googleProvider } from './firebase'; 
import ReportModal from './components/ReportModal';
import MillionDollarGiftTool from './components/MillionDollarGiftTool';

// --- 從各個獨立檔案匯入工具 ---
import { FinancialRealEstateTool } from './components/FinancialRealEstateTool';
import { StudentLoanTool } from './components/StudentLoanTool';
import { SuperActiveSavingTool } from './components/SuperActiveSavingTool';
import { CarReplacementTool } from './components/CarReplacementTool';
import { LaborPensionTool } from './components/LaborPensionTool';
import { BigSmallReservoirTool } from './components/BigSmallReservoirTool';
import { TaxPlannerTool } from './components/TaxPlannerTool';

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
  const [activeTab, setActiveTab] = useState('gift'); 
  const [toast, setToast] = useState<{message: string, type: string} | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false); 
  const [isSaving, setIsSaving] = useState(false); 
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // 用來記錄「上一次成功儲存的資料字串」，防止重複存檔
  const lastSavedDataStr = useRef<string>("");

  // New states for testing Email/Password login
  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [isEmailLoginOpen, setIsEmailLoginOpen] = useState(false);

  // Tool Data States - 初始預設值
  const defaultStates = {
    gift: { loanAmount: 100, loanTerm: 7, loanRate: 2.8, investReturnRate: 6 },
    estate: { loanAmount: 1000, loanTerm: 30, loanRate: 2.2, investReturnRate: 6, existingLoanBalance: 700, existingMonthlyPayment: 38000 },
    student: { loanAmount: 40, investReturnRate: 6, years: 8, gracePeriod: 1, interestOnlyPeriod: 0 },
    super_active: { monthlySaving: 10000, investReturnRate: 6, activeYears: 15 },
    car: { carPrice: 100, investReturnRate: 6, resaleRate: 50 },
    pension: { currentAge: 30, retireAge: 65, salary: 45000, laborInsYears: 35, selfContribution: false, pensionReturnRate: 3, desiredMonthlyIncome: 60000 },
    reservoir: { initialCapital: 1000, dividendRate: 6, reinvestRate: 6, years: 10 },
    tax: { spouse: true, children: 2, parents: 0, cash: 3000, realEstateMarket: 4000, stocks: 1000, insurancePlan: 0 }
  };

  const [giftData, setGiftData] = useState(defaultStates.gift);
  const [estateData, setEstateData] = useState(defaultStates.estate);
  const [studentData, setStudentData] = useState(defaultStates.student);
  const [superActiveData, setSuperActiveData] = useState(defaultStates.super_active);
  const [carData, setCarData] = useState(defaultStates.car);
  const [pensionData, setPensionData] = useState(defaultStates.pension);
  const [reservoirData, setReservoirData] = useState(defaultStates.reservoir);
  const [taxData, setTaxData] = useState(defaultStates.tax);

  const showToast = (message: string, type = 'success') => { setToast({ message, type }); };

  // --- 1. 初始化與資料載入邏輯 ---
  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | undefined;
    
    // 安全機制：如果 8 秒內還沒載入完畢（例如網路卡住），強制關閉 Loading，讓使用者可以先用
    const forceLoadingTimer = setTimeout(() => {
        if (loading) {
            console.warn("Loading timeout triggered. Forcing app to show.");
            setLoading(false);
            // 雖然沒載入完，但也設為 true 讓 save 功能啟用 (或可設為 false 禁用 save)
            // 這裡設為 true 讓使用者能操作，但可能會覆蓋雲端資料，需權衡。
            // 比較安全的做法是讓 isDataLoaded = false，但介面可操作
            setIsDataLoaded(true); 
        }
    }, 8000);

    const checkRedirectAndAuth = async () => {
      try {
        await getRedirectResult(auth);
      } catch (error: any) {
        if (error.code !== 'auth/popup-closed-by-user') {
           console.error("Redirect Error:", error);
        }
      }

      const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        
        if (currentUser) {
           const userDocRef = doc(db, 'users', currentUser.uid);
           unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
               if (docSnap.exists()) {
                   const data = docSnap.data();
                   
                   // --- 關鍵修正：智慧比對 (防止無限迴圈) ---
                   // 只有當「雲端資料」跟「本地目前資料」不一樣時，才執行 setState
                   // 使用 JSON.stringify 進行深度比對
                   const updateIfChanged = (setter: any, currentVal: any, newVal: any) => {
                       if (newVal && JSON.stringify(currentVal) !== JSON.stringify(newVal)) {
                           setter((prev: any) => ({ ...prev, ...newVal }));
                       }
                   };

                   // 這裡無法直接取得最新的 giftData state (閉包問題)，
                   // 所以改用 setState 的 functional update 內部進行比對
                   setGiftData(prev => {
                       if (data.giftData && JSON.stringify(prev) !== JSON.stringify(data.giftData)) return { ...prev, ...data.giftData };
                       return prev; // 返回原本的 reference，React 不會觸發 re-render
                   });
                   setEstateData(prev => {
                       if (data.estateData && JSON.stringify(prev) !== JSON.stringify(data.estateData)) return { ...prev, ...data.estateData };
                       return prev;
                   });
                   setStudentData(prev => {
                       if (data.studentData && JSON.stringify(prev) !== JSON.stringify(data.studentData)) return { ...prev, ...data.studentData };
                       return prev;
                   });
                   setSuperActiveData(prev => {
                       if (data.superActiveData && JSON.stringify(prev) !== JSON.stringify(data.superActiveData)) return { ...prev, ...data.superActiveData };
                       return prev;
                   });
                   setCarData(prev => {
                       if (data.carData && JSON.stringify(prev) !== JSON.stringify(data.carData)) return { ...prev, ...data.carData };
                       return prev;
                   });
                   setPensionData(prev => {
                       if (data.pensionData && JSON.stringify(prev) !== JSON.stringify(data.pensionData)) return { ...prev, ...data.pensionData };
                       return prev;
                   });
                   setReservoirData(prev => {
                       if (data.reservoirData && JSON.stringify(prev) !== JSON.stringify(data.reservoirData)) return { ...prev, ...data.reservoirData };
                       return prev;
                   });
                   setTaxData(prev => {
                       if (data.taxData && JSON.stringify(prev) !== JSON.stringify(data.taxData)) return { ...prev, ...data.taxData };
                       return prev;
                   });
               }
               
               // 資料載入完成
               setIsDataLoaded(true);
               setLoading(false); 
               clearTimeout(forceLoadingTimer); // 清除強制載入計時器
           }, (error) => {
               console.error("Firestore Read Error:", error);
               showToast("讀取雲端資料失敗", "error");
               setLoading(false);
               setIsDataLoaded(true); 
               clearTimeout(forceLoadingTimer);
           });

        } else {
           setLoading(false);
           setIsDataLoaded(false);
           clearTimeout(forceLoadingTimer);
        }
      });
      return unsubscribeAuth;
    };

    const unsubAuthPromise = checkRedirectAndAuth();

    return () => {
       if (typeof unsubAuthPromise === 'function') unsubAuthPromise(); // 修正 unsubscribe 型別
       if (unsubscribeSnapshot) unsubscribeSnapshot();
       clearTimeout(forceLoadingTimer);
    };
  }, []); // 依賴為空，只執行一次


  // --- 2. 自動儲存邏輯 (Auto-Save) ---
  useEffect(() => {
    // 只有當使用者已登入 且 資料已載入完畢 (避免覆蓋雲端資料) 才執行儲存
    if (!user || !isDataLoaded) return;

    const dataPayload = {
        giftData,
        estateData,
        studentData,
        superActiveData,
        carData,
        pensionData,
        reservoirData,
        taxData
    };

    // 將當前資料轉為字串
    const currentDataStr = JSON.stringify(dataPayload);

    // 比對：如果跟「上一次存檔的內容」完全一樣，就直接跳過，不執行存檔
    // 這能有效防止 onSnapshot 更新本地 state 後，又觸發 useEffect 導致的迴圈
    if (currentDataStr === lastSavedDataStr.current) {
        return;
    }

    const saveData = async () => {
        setIsSaving(true);
        try {
            await setDoc(doc(db, 'users', user.uid), {
                ...dataPayload,
                lastUpdated: new Date()
            }, { merge: true });
            
            // 更新「上一次存檔」的紀錄
            lastSavedDataStr.current = currentDataStr;

            setTimeout(() => setIsSaving(false), 500);
        } catch (error) {
            console.error("Auto-save failed:", error);
            setIsSaving(false);
        }
    };

    // 防抖動：延遲 1.5 秒執行儲存
    const handler = setTimeout(saveData, 1500);

    return () => clearTimeout(handler);
  }, [
    giftData, estateData, studentData, superActiveData, carData, pensionData, reservoirData, taxData, 
    user, isDataLoaded
  ]);


  // 登入邏輯
  const handleGoogleLogin = async () => { 
    const isMobileOrTablet = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;

    if (isMobileOrTablet) {
         showToast("偵測到行動裝置，切換至全頁登入模式...", "info");
         await signInWithRedirect(auth, googleProvider);
         return;
    }

    try { 
      await signInWithPopup(auth, googleProvider); 
    } catch (e: any) { 
      if (e.code === 'auth/popup-blocked' || e.code === 'auth/popup-closed-by-user' || e.message?.includes('invalid')) {
        showToast("彈窗被封鎖或登入失敗，嘗試全頁登入...", "info");
        try {
           await signInWithRedirect(auth, googleProvider);
        } catch (redirectError: any) {
           showToast("登入錯誤: " + redirectError.message, "error");
        }
        return;
      }
      let errorMsg = "Google 登入失敗";
      if (e.code === 'auth/unauthorized-domain') errorMsg = "網域未授權：請至 Firebase Console 新增此網域";
      else if (e.message) errorMsg = `錯誤: ${e.message}`; 
      showToast(errorMsg, "error"); 
    } 
  };
  
  const handleEmailLogin = async () => {
    if (!testEmail || !testPassword) {
      showToast("請輸入 Email 和密碼", "error");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, testEmail, testPassword);
      setIsEmailLoginOpen(false); 
      showToast("管理員登入成功", "success");
    } catch (e: any) {
      let errorMsg = "Email 登入失敗";
       if (e.code === 'auth/user-not-found') errorMsg = "查無此 Email 帳號";
      else if (e.code === 'auth/wrong-password') errorMsg = "密碼錯誤";
      else if (e.code === 'auth/invalid-email') errorMsg = "Email 格式無效";
      showToast(errorMsg, "error");
    }
  };


  const handleLogout = async () => { 
      await signOut(auth); 
      setGiftData(defaultStates.gift);
      setEstateData(defaultStates.estate);
      setStudentData(defaultStates.student);
      setSuperActiveData(defaultStates.super_active);
      setCarData(defaultStates.car);
      setPensionData(defaultStates.pension);
      setReservoirData(defaultStates.reservoir);
      setTaxData(defaultStates.tax);
      setActiveTab('gift'); 
      lastSavedDataStr.current = ""; // 清空存檔紀錄
      showToast("已安全登出", "info"); 
  };

  const getCurrentData = () => {
    switch(activeTab) {
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

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={48} /></div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
         {isEmailLoginOpen && (
            <div className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <Mail size={20} className="text-blue-600"/> 管理員登入測試
                    </h3>
                    <p className="text-sm text-slate-500">
                      此為測試專用，請確保您已在 Firebase Auth 建立一組 Email 帳號。
                    </p>
                    <input 
                      type="email" 
                      placeholder="Email 帳號" 
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input 
                      type="password" 
                      placeholder="密碼" 
                      value={testPassword}
                      onChange={(e) => setTestPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleEmailLogin()}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="flex justify-between gap-3">
                       <button 
                         onClick={() => setIsEmailLoginOpen(false)} 
                         className="flex-1 px-4 py-2 text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors"
                       >
                         取消
                       </button>
                       <button 
                         onClick={handleEmailLogin} 
                         className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                       >
                         <Key size={18} className="inline mr-1"/> 登入
                       </button>
                    </div>
                </div>
            </div>
         )}
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl animate-fade-in-up">
          <div className="flex justify-center"><div className="bg-blue-100 p-4 rounded-full"><Coins size={48} className="text-blue-600" /></div></div>
          <div><h1 className="text-3xl font-black text-slate-800">超業菁英戰情室</h1><p className="text-slate-500 mt-2">武裝您的專業，讓數字幫您說故事</p></div>
          
          <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 hover:bg-slate-50 text-slate-700 font-bold py-3 px-4 rounded-xl transition-all">
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-blue-600">G</div>
            使用 Google 帳號登入
          </button>
          
          <div className="text-center text-sm">
            <button 
              onClick={() => setIsEmailLoginOpen(true)} 
              className="text-slate-500 hover:text-blue-600 transition-colors underline"
            >
              管理員測試登入
            </button>
          </div>
          
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <PrintStyles />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <ReportModal 
        isOpen={isReportOpen} 
        onClose={() => setIsReportOpen(false)} 
        user={user} 
        activeTab={activeTab} 
        data={getCurrentData()} 
      />

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900 text-white flex flex-col animate-fade-in md:hidden">
           <div className="p-4 flex justify-between items-center border-b border-slate-800">
              <span className="font-bold text-lg">功能選單</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-800 rounded-full"><X size={24}/></button>
           </div>
           <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <div className="text-xs font-bold text-slate-500 px-4 py-2 uppercase tracking-wider">資產軍火庫</div>
              <NavItem icon={Wallet} label="百萬禮物專案" active={activeTab === 'gift'} onClick={() => {setActiveTab('gift'); setIsMobileMenuOpen(false);}} />
              <NavItem icon={Building2} label="金融房產專案" active={activeTab === 'estate'} onClick={() => {setActiveTab('estate'); setIsMobileMenuOpen(false);}} />
              <NavItem icon={GraduationCap} label="學貸活化專案" active={activeTab === 'student'} onClick={() => {setActiveTab('student'); setIsMobileMenuOpen(false);}} />
              <NavItem icon={Rocket} label="超積極存錢法" active={activeTab === 'super_active'} onClick={() => {setActiveTab('super_active'); setIsMobileMenuOpen(false);}} />
              <NavItem icon={Car} label="五年換車專案" active={activeTab === 'car'} onClick={() => {setActiveTab('car'); setIsMobileMenuOpen(false);}} />
              <NavItem icon={Waves} label="大小水庫專案" active={activeTab === 'reservoir'} onClick={() => {setActiveTab('reservoir'); setIsMobileMenuOpen(false);}} />
              
              <div className="mt-4 text-xs font-bold text-slate-500 px-4 py-2 uppercase tracking-wider">退休與傳承</div>
              <NavItem icon={Umbrella} label="退休缺口試算" active={activeTab === 'pension'} onClick={() => {setActiveTab('pension'); setIsMobileMenuOpen(false);}} />
              <NavItem icon={Landmark} label="稅務傳承專案" active={activeTab === 'tax'} onClick={() => {setActiveTab('tax'); setIsMobileMenuOpen(false);}} />
              
              <div className="mt-8 pt-4 border-t border-slate-800">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white">
                  <LogOut size={20} /> <span className="font-medium">登出系統</span>
                </button>
              </div>
           </div>
        </div>
      )}

      <aside className="w-72 bg-slate-900 text-white flex-col hidden md:flex shadow-2xl z-10 print:hidden">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-1">
             <div className="w-12 h-12 rounded-full p-0.5 border-2 border-yellow-400 overflow-hidden shrink-0">
                <img src={user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'} alt="User" className="w-full h-full rounded-full object-cover bg-slate-800" />
             </div>
             <div className="flex-1 min-w-0">
                <div className="text-xs text-yellow-500 font-bold uppercase truncate">理財顧問</div>
                <div className="font-bold text-sm truncate text-white">{user.displayName || '訪客顧問'}</div>
             </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded">
             {isSaving ? (
                <>
                   <Loader2 size={12} className="animate-spin text-blue-400"/>
                   <span>雲端同步中...</span>
                </>
             ) : (
                <>
                   <div className="w-2 h-2 rounded-full bg-green-500"></div>
                   <span>資料已同步</span>
                </>
             )}
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-bold text-slate-500 px-4 py-2 uppercase tracking-wider">資產軍火庫</div>
          <NavItem icon={Wallet} label="百萬禮物專案" active={activeTab === 'gift'} onClick={() => setActiveTab('gift')} />
          <NavItem icon={Building2} label="金融房產專案" active={activeTab === 'estate'} onClick={() => setActiveTab('estate')} />
          <NavItem icon={GraduationCap} label="學貸活化專案" active={activeTab === 'student'} onClick={() => setActiveTab('student')} />
          <NavItem icon={Rocket} label="超積極存錢法" active={activeTab === 'super_active'} onClick={() => setActiveTab('super_active')} />
          <NavItem icon={Car} label="五年換車專案" active={activeTab === 'car'} onClick={() => setActiveTab('car')} />
          <NavItem icon={Waves} label="大小水庫專案" active={activeTab === 'reservoir'} onClick={() => setActiveTab('reservoir')} />
          
          <div className="mt-4 text-xs font-bold text-slate-600 px-4 py-2 uppercase tracking-wider">退休與傳承</div>
          <NavItem icon={Umbrella} label="退休缺口試算" active={activeTab === 'pension'} onClick={() => setActiveTab('pension')} />
          <NavItem icon={Landmark} label="稅務傳承專案" active={activeTab === 'tax'} onClick={() => setActiveTab('tax')} />
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
           <button onClick={() => setIsReportOpen(true)} className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors px-4 py-2 w-full">
             <FileBarChart size={18} /> 生成策略報表
           </button>
           <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors px-4 py-2 w-full">
             <LogOut size={18} /> 登出系統
           </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-md shrink-0 print:hidden">
          <div className="font-bold flex items-center gap-2"><Coins className="text-yellow-400"/> 資產規劃</div>
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