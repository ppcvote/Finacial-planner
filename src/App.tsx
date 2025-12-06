import React, { useState, useEffect } from 'react';
import { 
  Wallet, Building2, Coins, Check, ShieldAlert, Menu, X, LogOut, FileBarChart, ArrowUpFromLine, 
  GraduationCap, Umbrella, Waves, Landmark, Lock, Rocket, Car, Loader2
} from 'lucide-react';

import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// --- 重要：現在我們從各個檔案匯入工具，而不是全部寫在這裡 ---
import { auth, db, googleProvider } from './firebase'; // 確保您有建立 firebase.ts
import ReportModal from './components/ReportModal';
import MillionDollarGiftTool from './components/MillionDollarGiftTool';
import { 
  FinancialRealEstateTool, StudentLoanTool, SuperActiveSavingTool, CarReplacementTool, 
  LaborPensionTool, BigSmallReservoirTool, TaxPlannerTool 
} from './components/AllTools';

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

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => { onClose(); }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors: Record<string, string> = { success: 'bg-green-600', error: 'bg-red-600', info: 'bg-blue-600' };

  return (
    <div className={`fixed bottom-6 right-6 ${bgColors[type] || 'bg-blue-600'} text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-bounce-in z-[100] toast-container`}>
      {type === 'success' && <Check size={20} />}
      {type === 'error' && <ShieldAlert size={20} />}
      <span className="font-bold">{message}</span>
    </div>
  );
};

const NavItem = ({ icon: Icon, label, active, onClick, disabled = false }) => (
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

  // Tool Data States
  const [giftData, setGiftData] = useState({ loanAmount: 100, loanTerm: 7, loanRate: 2.8, investReturnRate: 6 });
  const [estateData, setEstateData] = useState({ loanAmount: 1000, loanTerm: 30, loanRate: 2.2, investReturnRate: 6 });
  const [studentData, setStudentData] = useState({ loanAmount: 40, investReturnRate: 6, years: 8, gracePeriod: 1, interestOnlyPeriod: 0 });
  const [superActiveData, setSuperActiveData] = useState({ monthlySaving: 10000, investReturnRate: 6, activeYears: 15 });
  const [carData, setCarData] = useState({ carPrice: 100, investReturnRate: 6, resaleRate: 50 });
  const [pensionData, setPensionData] = useState({ currentAge: 30, retireAge: 65, salary: 45000, laborInsYears: 35, selfContribution: false, pensionReturnRate: 3, desiredMonthlyIncome: 60000 });
  const [reservoirData, setReservoirData] = useState({ initialCapital: 1000, dividendRate: 6, reinvestRate: 6, years: 10 });
  const [taxData, setTaxData] = useState({ spouse: true, children: 2, parents: 0, cash: 3000, realEstate: 2000, stocks: 1000, insurancePlan: 0 });

  const [userProfile, setUserProfile] = useState({ displayName: '', title: '' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists() && userDoc.data().profile) {
            setUserProfile(userDoc.data().profile);
          } else {
            setUserProfile({ displayName: currentUser.displayName || '', title: '理財顧問' });
          }
        } catch (e) { console.error(e); }
      }
    });
    return () => unsubscribe();
  }, []);

  const showToast = (message: string, type = 'success') => { setToast({ message, type }); };
  const handleLogin = async () => { try { await signInWithPopup(auth, googleProvider); } catch (e) { showToast("登入失敗", "error"); } };
  const handleLogout = async () => { await signOut(auth); setActiveTab('gift'); showToast("已安全登出", "info"); };

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
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl animate-fade-in-up">
          <div className="flex justify-center"><div className="bg-blue-100 p-4 rounded-full"><Coins size={48} className="text-blue-600" /></div></div>
          <div><h1 className="text-3xl font-black text-slate-800">超業菁英戰情室</h1><p className="text-slate-500 mt-2">武裝您的專業，讓數字幫您說故事</p></div>
          <button onClick={handleLogin} className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 hover:bg-slate-50 text-slate-700 font-bold py-3 px-4 rounded-xl transition-all"><div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-blue-600">G</div>使用 Google 帳號登入</button>
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

      {/* Mobile Menu Overlay */}
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
              <NavItem icon={GraduationCap} label="學貸套利專案" active={activeTab === 'student'} onClick={() => {setActiveTab('student'); setIsMobileMenuOpen(false);}} />
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

      {/* Sidebar (Desktop) */}
      <aside className="w-72 bg-slate-900 text-white flex-col hidden md:flex shadow-2xl z-10 print:hidden">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-1">
             <div className="w-12 h-12 rounded-full p-0.5 border-2 border-yellow-400 overflow-hidden shrink-0">
                <img src={user.photoURL} alt="User" className="w-full h-full rounded-full object-cover bg-slate-800" />
             </div>
             <div className="flex-1 min-w-0">
                <div className="text-xs text-yellow-500 font-bold uppercase truncate">理財顧問</div>
                <div className="font-bold text-sm truncate text-white">{user.displayName}</div>
             </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-bold text-slate-500 px-4 py-2 uppercase tracking-wider">資產軍火庫</div>
          <NavItem icon={Wallet} label="百萬禮物專案" active={activeTab === 'gift'} onClick={() => setActiveTab('gift')} />
          <NavItem icon={Building2} label="金融房產專案" active={activeTab === 'estate'} onClick={() => setActiveTab('estate')} />
          <NavItem icon={GraduationCap} label="學貸套利專案" active={activeTab === 'student'} onClick={() => setActiveTab('student')} />
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
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
        
        {/* Content Area */}
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