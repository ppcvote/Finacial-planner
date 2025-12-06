import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Building2, 
  Calculator, 
  Coins, 
  CheckCircle2, 
  Scale, 
  Save, 
  FileText, 
  Menu, 
  X, 
  Trash2, 
  LogOut, 
  User as UserIcon, 
  Settings, 
  Loader2, 
  ArrowUpFromLine,
  Check,
  ShieldAlert,
  Edit3,
  GraduationCap,
  Umbrella,
  Waves,
  Landmark,
  Lock,
  TrendingUp,
  Clock,
  PauseCircle,
  Rocket,
  Car,
  Repeat,
  HeartHandshake,
  Droplets,
  AlertTriangle,
  FileBarChart
} from 'lucide-react';
import { 
  BarChart, 
  AreaChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Line 
} from 'recharts';

// --- Firebase 模組整合 ---
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  getDocs, 
  deleteDoc, 
  doc, 
  orderBy, 
  setDoc, 
  getDoc, 
  initializeFirestore, 
  memoryLocalCache 
} from 'firebase/firestore';

// ------------------------------------------------------------------
// Firebase 設定區域
// ------------------------------------------------------------------
const apiKey = "AIzaSyAqS6fhHQVyBNr1LCkCaQPyJ13Rkq7bfHA"; 
const authDomain = "grbt-f87fa.firebaseapp.com";
const projectId = "grbt-f87fa";
const storageBucket = "grbt-f87fa.firebasestorage.app";
const messagingSenderId = "169700005946";
const appId = "1:169700005946:web:9b0722f31aa9fe7ad13d03";

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: authDomain,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId: messagingSenderId,
  appId: appId,
  measurementId: "G-58N4KK9M5W"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true, 
  localCache: memoryLocalCache(), 
});

// ------------------------------------------------------------------
// 輔助函數
// ------------------------------------------------------------------

const withTimeout = (promise, ms, errorMessage) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(errorMessage)), ms)
    )
  ]);
};

const calculateMonthlyPayment = (principal, rate, years) => {
  const p = Number(principal) || 0;
  const rVal = Number(rate) || 0;
  const y = Number(years) || 0;
  const r = rVal / 100 / 12;
  const n = y * 12;
  if (rVal === 0) return (p * 10000) / (n || 1);
  const result = (p * 10000 * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return isNaN(result) ? 0 : result;
};

const calculateMonthlyIncome = (principal, rate) => {
  const p = Number(principal) || 0;
  const r = Number(rate) || 0;
  return (p * 10000 * (r / 100)) / 12;
};

const calculateRemainingBalance = (principal, rate, totalYears, yearsElapsed) => {
  const pVal = Number(principal) || 0;
  const rVal = Number(rate) || 0;
  const totalY = Number(totalYears) || 0;
  const elapsed = Number(yearsElapsed) || 0;
  const r = rVal / 100 / 12;
  const n = totalY * 12;
  const p = elapsed * 12;
  if (rVal === 0) return pVal * 10000 * (1 - p/(n || 1));
  const balance = (pVal * 10000 * (Math.pow(1 + r, n) - Math.pow(1 + r, p))) / (Math.pow(1 + r, n) - 1);
  return Math.max(0, isNaN(balance) ? 0 : balance);
};

// ------------------------------------------------------------------
// Report Component (New)
// ------------------------------------------------------------------

const ReportModal = ({ isOpen, onClose, user, activeTab, data }) => {
  const [customerName, setCustomerName] = useState('');
  
  if (!isOpen) return null;

  const dateStr = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
  
  // Generate Mind Map & Table Data based on activeTab
  let reportContent = { title: '', mindMap: [], table: [] };

  // --- Logic Extraction for Report ---
  if (activeTab === 'gift') {
    const loan = data.loanAmount;
    const profit = Math.round(loan * 2 * 10000); // Rough estimate of final asset
    reportContent = {
      title: '百萬禮物專案',
      mindMap: [
        { label: '核心策略', value: '以息養貸' },
        { label: '投入資源', value: `信貸 ${loan} 萬` },
        { label: '時間槓桿', value: `${data.loanTerm} 年循環` },
        { label: '預期成果', value: `資產 ${loan*2} 萬` },
        { label: '人生意義', value: '第一桶金' }
      ],
      table: [
        { label: '第 1 年', col1: '啟動期', col2: '建立信用' },
        { label: '第 7 年', col1: '循環期', col2: `資產 ${loan} 萬` },
        { label: '第 14 年', col1: '收割期', col2: `資產 ${loan*2} 萬` },
      ]
    };
  } else if (activeTab === 'estate') {
    const loan = data.loanAmount;
    const monthlyCash = Math.round(calculateMonthlyIncome(loan, data.investReturnRate) - calculateMonthlyPayment(loan, data.loanRate, data.loanTerm));
    reportContent = {
      title: '金融房產專案',
      mindMap: [
        { label: '核心策略', value: '數位包租公' },
        { label: '資產規模', value: `${loan} 萬` },
        { label: '現金流', value: `月領 ${monthlyCash.toLocaleString()}` },
        { label: '最終歸屬', value: '資產全拿' },
        { label: '人生意義', value: '被動收入' }
      ],
      table: [
        { label: '第 1 年', col1: '建置期', col2: '現金流啟動' },
        { label: `第 ${Math.round(data.loanTerm/2)} 年`, col1: '持守期', col2: '還款過半' },
        { label: `第 ${data.loanTerm} 年`, col1: '自由期', col2: `擁有 ${loan} 萬` },
      ]
    };
  } else if (activeTab === 'student') {
     const profit = Math.round(data.loanAmount * 10000 * Math.pow((1 + data.investReturnRate/100), data.years + data.gracePeriod) - (calculateMonthlyPayment(data.loanAmount, 1.775, data.years) * 12 * data.years));
     reportContent = {
      title: '學貸套利專案',
      mindMap: [
        { label: '核心策略', value: '低利套利' },
        { label: '學貸金額', value: `${data.loanAmount} 萬` },
        { label: '寬限策略', value: `${data.gracePeriod}年寬限` },
        { label: '淨獲利', value: `${Math.round(profit/10000)} 萬` },
        { label: '人生意義', value: '理財紀律' }
      ],
      table: [
        { label: '畢業時', col1: '負債期', col2: '啟動投資' },
        { label: '寬限結束', col1: '還款期', col2: '以息繳貸' },
        { label: '8 年後', col1: '無債期', col2: '多賺一筆' },
      ]
    };
  } else if (activeTab === 'super_active') {
    const finalAsset = Math.round((data.monthlySaving * 12 * data.activeYears) * Math.pow(1 + data.investReturnRate/100, 40 - data.activeYears + (data.activeYears/2)) / 10000); // Rough approximation
    reportContent = {
      title: '超積極存錢法',
      mindMap: [
        { label: '核心策略', value: '複利滾存' },
        { label: '努力期間', value: `${data.activeYears} 年` },
        { label: '每月投入', value: `${data.monthlySaving}` },
        { label: '30年資產', value: `約 ${finalAsset} 萬` },
        { label: '人生意義', value: '提早退休' }
      ],
      table: [
        { label: `第 ${data.activeYears} 年`, col1: '投入結束', col2: '本金到位' },
        { label: `第 20 年`, col1: '滾存期', col2: '資產翻倍' },
        { label: `第 30 年`, col1: '爆發期', col2: '財富自由' },
      ]
    };
  } else if (activeTab === 'car') {
    reportContent = {
      title: '五年換車專案',
      mindMap: [
        { label: '核心策略', value: '資金回流' },
        { label: '目標車價', value: `${data.carPrice} 萬` },
        { label: '運作模式', value: '以息養車' },
        { label: '負擔趨勢', value: '逐次遞減' },
        { label: '人生意義', value: '生活品質' }
      ],
      table: [
        { label: '第 1 台', col1: '建立本金', col2: '負擔較重' },
        { label: '第 2 台', col1: '配息折抵', col2: '負擔減輕' },
        { label: '第 3 台', col1: '資產滾大', col2: '幾近免費' },
      ]
    };
  } else if (activeTab === 'reservoir') {
    const total = Math.round(data.initialCapital * (1 + (data.years * data.dividendRate/100 * Math.pow(1+data.reinvestRate/100, data.years/2))) ); // Rough
    reportContent = {
      title: '大小水庫專案',
      mindMap: [
        { label: '核心策略', value: '資產活化' },
        { label: '大水庫', value: `${data.initialCapital} 萬` },
        { label: '小水庫', value: '配息再投' },
        { label: '預期總值', value: `翻倍成長` },
        { label: '人生意義', value: '資產傳承' }
      ],
      table: [
        { label: '第 1 年', col1: '啟動期', col2: '建立水管' },
        { label: `第 ${Math.round(data.years/2)} 年`, col1: '累積期', col2: '小水庫成形' },
        { label: `第 ${data.years} 年`, col1: '收割期', col2: '資產翻倍' },
      ]
    };
  } else if (activeTab === 'pension') {
     const gap = data.desiredMonthlyIncome - ((Math.min(data.salary, 45800)*data.laborInsYears*0.0155) + (data.salary*0.06*12*30*(Math.pow(1.03,30)-1)/0.03/240)); // Rough
     reportContent = {
      title: '退休缺口試算',
      mindMap: [
        { label: '核心策略', value: '補足缺口' },
        { label: '理想月退', value: `${data.desiredMonthlyIncome}` },
        { label: '政府給付', value: '嚴重不足' },
        { label: '財務缺口', value: `每月 ${Math.abs(Math.round(gap))}` },
        { label: '人生意義', value: '尊嚴養老' }
      ],
      table: [
        { label: '60 歲', col1: '退休前', col2: '最後衝刺' },
        { label: '65 歲', col1: '退休時', col2: '開始領錢' },
        { label: '85 歲', col1: '長壽風險', col2: '現金流不斷' },
      ]
    };
  } else if (activeTab === 'tax') {
     reportContent = {
      title: '稅務傳承專案',
      mindMap: [
        { label: '核心策略', value: '預留稅源' },
        { label: '資產總額', value: `${data.cash + data.realEstate + data.stocks} 萬` },
        { label: '保險額度', value: `${data.insurancePlan} 萬` },
        { label: '節稅效益', value: '資產保全' },
        { label: '人生意義', value: '富過三代' }
      ],
      table: [
        { label: '規劃前', col1: '遺產淨額高', col2: '稅金沉重' },
        { label: '規劃後', col1: '善用免稅額', col2: '稅金銳減' },
        { label: '傳承時', col1: '現金足夠', col2: '無痛繳稅' },
      ]
    };
  }

  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-fade-in overflow-auto print:overflow-visible">
      {/* Print Controls (Hidden on Print) */}
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md print:hidden sticky top-0 z-50">
        <div className="font-bold text-lg">
           <FileBarChart className="inline-block mr-2"/> 規劃報告預覽
        </div>
        <div className="flex gap-3">
           <input 
             type="text" 
             placeholder="輸入客戶姓名" 
             value={customerName}
             onChange={e => setCustomerName(e.target.value)}
             className="px-3 py-1.5 rounded text-slate-900 outline-none text-sm w-32 md:w-48"
           />
           <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded font-bold flex items-center gap-2">
             <ArrowUpFromLine size={18} /> 列印 / 存為 PDF
           </button>
           <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded font-bold">
             <X size={18} /> 關閉
           </button>
        </div>
      </div>

      {/* Report Content */}
      <div className="max-w-4xl mx-auto p-8 w-full bg-white text-slate-800 print:p-0">
        
        {/* Header */}
        <div className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-end">
           <div>
              <h1 className="text-4xl font-black text-slate-900 mb-2">{reportContent.title}</h1>
              <p className="text-xl text-slate-500 font-medium">專屬資產戰略規劃書</p>
           </div>
           <div className="text-right text-sm text-slate-600">
              <p className="font-bold text-lg mb-1">{customerName ? customerName + ' 貴賓' : '貴賓專屬'}</p>
              <p>規劃顧問：{user?.displayName || '專業理財顧問'}</p>
              <p>規劃日期：{dateStr}</p>
           </div>
        </div>

        {/* Mind Map Section */}
        <div className="mb-12">
           <h2 className="text-lg font-bold text-slate-900 border-l-4 border-blue-600 pl-3 mb-6">戰略思維導圖</h2>
           <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 print:bg-white print:border-slate-300">
              {/* Central Node */}
              <div className="bg-slate-800 text-white px-6 py-4 rounded-xl font-bold text-xl shadow-lg print:shadow-none print:border print:border-slate-900 print:text-black">
                 {reportContent.title}
              </div>
              
              {/* Branches */}
              <div className="flex flex-col gap-4 w-full md:w-auto">
                 {reportContent.mindMap.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                       <div className="hidden md:block w-8 h-0.5 bg-slate-300"></div>
                       <div className="flex-1 bg-white border border-slate-200 p-3 rounded-lg shadow-sm flex justify-between items-center min-w-[200px] print:shadow-none print:border-slate-400">
                          <span className="text-xs font-bold text-slate-400 uppercase">{item.label}</span>
                          <span className="font-bold text-slate-800">{item.value}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Table Section */}
        <div className="mb-12">
           <h2 className="text-lg font-bold text-slate-900 border-l-4 border-green-600 pl-3 mb-6">關鍵里程碑</h2>
           <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-slate-100 text-slate-600 text-sm">
                       <th className="p-4 border-b border-slate-200">時間點</th>
                       <th className="p-4 border-b border-slate-200">階段目標</th>
                       <th className="p-4 border-b border-slate-200">預期成效</th>
                    </tr>
                 </thead>
                 <tbody>
                    {reportContent.table.map((row, idx) => (
                       <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 print:hover:bg-white">
                          <td className="p-4 font-bold text-slate-800">{row.label}</td>
                          <td className="p-4 text-slate-600">{row.col1}</td>
                          <td className="p-4 font-bold text-blue-600">{row.col2}</td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 mt-12 border-t border-slate-100 pt-6 print:text-slate-600">
           <p>本報告僅供參考，實際投資效益與稅務金額請以正式合約與當時法規為準。</p>
           <p className="mt-1">© {new Date().getFullYear()} 超業菁英戰情室 • Professional Financial Planning</p>
        </div>

      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// UI Components
// ------------------------------------------------------------------

const PrintStyles = () => (
  <style>{`
    @media print {
      aside, .no-print, .toast-container, .mobile-header, .mobile-menu { display: none !important; }
      body, main { background: white !important; height: auto !important; overflow: visible !important; }
      .print-break-inside { break-inside: avoid; }
      .shadow-lg, .shadow-sm { box-shadow: none !important; border: 1px solid #ddd !important; }
      .text-white { color: black !important; }
      .bg-gradient-to-r, .bg-gradient-to-br { background: none !important; background-color: #f0f9ff !important; color: black !important; }
      header { display: none !important; } 
      .print-header { display: block !important; margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
      .recharts-wrapper { width: 100% !important; height: auto !important; }
    }
  `}</style>
);

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => { onClose(); }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600'
  };

  return (
    <div className={`fixed bottom-6 right-6 ${bgColors[type]} text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-bounce-in z-[100] toast-container`}>
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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('gift'); 
  const [toast, setToast] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false); // Report Modal State

  const [giftData, setGiftData] = useState({ loanAmount: 100, loanTerm: 7, loanRate: 2.8, investReturnRate: 6 });
  const [estateData, setEstateData] = useState({ loanAmount: 1000, loanTerm: 30, loanRate: 2.2, investReturnRate: 6 });
  const [studentData, setStudentData] = useState({ loanAmount: 40, investReturnRate: 6, years: 8, gracePeriod: 1, interestOnlyPeriod: 0 });
  const [superActiveData, setSuperActiveData] = useState({ monthlySaving: 10000, investReturnRate: 6, activeYears: 15 });
  const [carData, setCarData] = useState({ carPrice: 100, investReturnRate: 6, resaleRate: 50 });
  const [pensionData, setPensionData] = useState({ currentAge: 30, retireAge: 65, salary: 45000, laborInsYears: 35, selfContribution: false, pensionReturnRate: 3, desiredMonthlyIncome: 60000 });
  const [reservoirData, setReservoirData] = useState({ initialCapital: 1000, dividendRate: 6, reinvestRate: 6, years: 10 });
  const [taxData, setTaxData] = useState({ spouse: true, children: 2, parents: 0, cash: 3000, realEstate: 2000, stocks: 1000, insurancePlan: 0 });

  const [userProfile, setUserProfile] = useState({ displayName: '', title: '' });
  const [savedFiles, setSavedFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        setUserProfile({ 
            displayName: currentUser.displayName || '', 
            title: '理財顧問' 
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const showToast = (message, type = 'success') => { setToast({ message, type }); };
  const handleLogin = async () => { try { await signInWithPopup(auth, googleProvider); } catch (e) { showToast("登入失敗", "error"); } };
  const handleLogout = async () => { await signOut(auth); setSavedFiles([]); setActiveTab('gift'); showToast("已安全登出", "info"); };

  const handleSavePlan = async () => {
    if (!user) return;
    const name = prompt("請輸入規劃名稱：");
    if (!name) return;

    let currentData = {};
    if (activeTab === 'gift') currentData = giftData;
    else if (activeTab === 'estate') currentData = estateData;
    else if (activeTab === 'student') currentData = studentData;
    else if (activeTab === 'super_active') currentData = superActiveData;
    else if (activeTab === 'car') currentData = carData;
    else if (activeTab === 'pension') currentData = pensionData;
    else if (activeTab === 'reservoir') currentData = reservoirData;
    else if (activeTab === 'tax') currentData = taxData;

    const newPlan = {
      name,
      date: new Date().toLocaleDateString(),
      type: activeTab,
      data: currentData
    };

    try {
      await withTimeout(addDoc(collection(db, "users", user.uid, "plans"), newPlan), 15000, "Timeout");
      showToast("規劃已儲存！", "success");
      loadFiles(); 
    } catch (e) { showToast("儲存失敗", "error"); }
  };

  const loadFiles = async () => {
    if (!user) return;
    setIsLoadingFiles(true);
    try {
      const q = query(collection(db, "users", user.uid, "plans"), orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      setSavedFiles(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { showToast("讀取失敗", "error"); }
    finally { setIsLoadingFiles(false); }
  };

  const handleLoadFile = (file) => {
    if (file.type === 'gift') setGiftData(file.data);
    else if (file.type === 'estate') setEstateData(file.data);
    else if (file.type === 'student') setStudentData(file.data);
    else if (file.type === 'super_active') setSuperActiveData(file.data);
    else if (file.type === 'car') setCarData(file.data);
    else if (file.type === 'pension') setPensionData(file.data);
    else if (file.type === 'reservoir') setReservoirData(file.data);
    else if (file.type === 'tax') setTaxData(file.data);
    
    setActiveTab(file.type);
    showToast(`已載入：${file.name}`, "success");
    setIsMobileMenuOpen(false); // Close menu on load
  };

  const handleDeleteFile = async (id, e) => {
    e.stopPropagation();
    if(!confirm("確定刪除？")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "plans", id));
      setSavedFiles(prev => prev.filter(f => f.id !== id));
      showToast("檔案已刪除", "success");
    } catch (e) { showToast("刪除失敗", "error"); }
  };

  // Helper to get current active data
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
      
      {/* Report Modal */}
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
              
              <div className="mt-8 text-xs font-bold text-slate-500 px-4 py-2 uppercase tracking-wider">資料管理</div>
              <NavItem icon={FileText} label="已存規劃檔案" active={activeTab === 'files'} onClick={() => { setActiveTab('files'); loadFiles(); }} />
              
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
                <div className="text-xs text-yellow-500 font-bold uppercase truncate">{userProfile.title || '理財顧問'}</div>
                <div className="font-bold text-sm truncate text-white">{userProfile.displayName || user.displayName}</div>
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
          
          <div className="mt-8 text-xs font-bold text-slate-500 px-4 py-2 uppercase tracking-wider">資料管理</div>
          <NavItem icon={FileText} label="已存規劃檔案" active={activeTab === 'files'} onClick={() => { setActiveTab('files'); loadFiles(); }} />
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
           {activeTab !== 'files' && (
             <button onClick={() => setIsReportOpen(true)} className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors px-4 py-2 w-full">
               <FileBarChart size={18} /> 生成策略報表
             </button>
           )}
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
            {activeTab !== 'files' && (
              <button onClick={() => setIsReportOpen(true)} className="p-2 bg-slate-800 rounded-lg active:bg-slate-700">
                <FileBarChart size={24} />
              </button>
            )}
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-slate-800 rounded-lg active:bg-slate-700">
              <Menu size={24} />
            </button>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
           {/* Save Button */}
           {(activeTab !== 'files') && (
             <button 
               onClick={handleSavePlan}
               className="fixed bottom-6 right-6 md:absolute md:top-8 md:right-8 md:bottom-auto bg-slate-900 text-white p-3 md:px-5 md:py-2 rounded-full md:rounded-lg shadow-lg hover:bg-slate-700 transition-all flex items-center gap-2 z-50 group print:hidden"
             >
               <Save size={20} />
               <span className="hidden md:inline font-bold">儲存目前規劃</span>
             </button>
           )}

           <div className="max-w-5xl mx-auto pb-20 md:pb-0">
             {activeTab === 'gift' && <MillionDollarGiftTool data={giftData} setData={setGiftData} />}
             {activeTab === 'estate' && <FinancialRealEstateTool data={estateData} setData={setEstateData} />}
             {activeTab === 'student' && <StudentLoanTool data={studentData} setData={setStudentData} />}
             {activeTab === 'super_active' && <SuperActiveSavingTool data={superActiveData} setData={setSuperActiveData} />}
             {activeTab === 'car' && <CarReplacementTool data={carData} setData={setCarData} />}
             {activeTab === 'reservoir' && <BigSmallReservoirTool data={reservoirData} setData={setReservoirData} />}
             {activeTab === 'pension' && <LaborPensionTool data={pensionData} setData={setPensionData} />}
             {activeTab === 'tax' && <TaxPlannerTool data={taxData} setData={setTaxData} />}

             {activeTab === 'files' && (
                <div className="animate-fade-in">
                   <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><FileText /> 客戶規劃檔案庫</h2>
                   {isLoadingFiles ? (
                     <div className="text-center py-12 text-slate-400">載入中...</div>
                   ) : savedFiles.length === 0 ? (
                     <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-slate-200">
                        <Wallet size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500">目前沒有儲存的規劃</p>
                        <p className="text-sm text-slate-400 mt-1">在工具頁面點擊「儲存」即可建立檔案</p>
                     </div>
                   ) : (
                     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                       {savedFiles.map(file => (
                         <div key={file.id} onClick={() => handleLoadFile(file)} className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group relative">
                            <div className="flex justify-between items-start mb-3">
                               <div className={`p-2 rounded-lg ${
                                 file.type === 'gift' ? 'bg-blue-100 text-blue-600' : 
                                 file.type === 'estate' ? 'bg-emerald-100 text-emerald-600' :
                                 file.type === 'super_active' ? 'bg-purple-100 text-purple-600' :
                                 file.type === 'car' ? 'bg-orange-100 text-orange-600' :
                                 file.type === 'reservoir' ? 'bg-cyan-100 text-cyan-600' :
                                 file.type === 'pension' ? 'bg-slate-200 text-slate-700' :
                                 file.type === 'tax' ? 'bg-zinc-200 text-zinc-700' :
                                 'bg-sky-100 text-sky-600'
                               }`}>
                                  {file.type === 'gift' ? <Wallet size={20} /> : 
                                   file.type === 'estate' ? <Building2 size={20} /> :
                                   file.type === 'super_active' ? <Rocket size={20} /> :
                                   file.type === 'car' ? <Car size={20} /> :
                                   file.type === 'reservoir' ? <Waves size={20} /> :
                                   file.type === 'pension' ? <Umbrella size={20} /> :
                                   file.type === 'tax' ? <Landmark size={20} /> :
                                   <GraduationCap size={20} />}
                               </div>
                               <button onClick={(e) => handleDeleteFile(file.id, e)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                            </div>
                            <h3 className="font-bold text-slate-800 text-lg mb-1">{file.name}</h3>
                            <p className="text-xs text-slate-400">{file.date} • {
                                file.type === 'gift' ? '百萬禮物' : 
                                file.type === 'estate' ? '金融房產' : 
                                file.type === 'super_active' ? '超積極存錢' :
                                file.type === 'car' ? '五年換車' :
                                file.type === 'reservoir' ? '大小水庫' :
                                file.type === 'pension' ? '退休缺口' :
                                file.type === 'tax' ? '稅務傳承' :
                                '學貸套利'
                            }</p>
                         </div>
                       ))}
                     </div>
                   )}
                </div>
             )}
           </div>
        </div>
      </main>
    </div>
  );
}