import React, { useState, useEffect, useRef } from 'react';
import { 
  PiggyBank, 
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
  Printer, 
  LogOut, 
  User as UserIcon, 
  Settings, 
  Camera, 
  Smartphone, 
  Loader2, 
  Focus,   
  ArrowUpFromLine,
  Check,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { 
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
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';

// ------------------------------------------------------------------
// Firebase 設定區域 (已修復 API Key)
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

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// 使用記憶體快取 + 強制長輪詢
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true, 
  localCache: memoryLocalCache(), 
});

const storage = getStorage(app);

// ------------------------------------------------------------------
// 輔助函數與工具
// ------------------------------------------------------------------

const withTimeout = (promise, ms, errorMessage) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(errorMessage)), ms)
    )
  ]);
};

// 圖片壓縮
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => reject(new Error("Compression timeout")), 5000);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result;
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 300; 
          const scaleSize = MAX_WIDTH / img.width;
          const finalWidth = img.width > MAX_WIDTH ? MAX_WIDTH : img.width;
          const finalHeight = img.width > MAX_WIDTH ? img.height * scaleSize : img.height;
          canvas.width = finalWidth;
          canvas.height = finalHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
              ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
              canvas.toBlob((blob) => {
                  clearTimeout(timeoutId);
                  if (blob) resolve(blob);
                  else reject(new Error("Compression failed"));
              }, 'image/jpeg', 0.7);
          } else {
              clearTimeout(timeoutId);
              reject(new Error("Canvas context not found"));
          }
        } catch (e) {
          clearTimeout(timeoutId);
          reject(e);
        }
      };
      img.onerror = (error) => {
        clearTimeout(timeoutId);
        reject(error);
      }
    };
    reader.onerror = (error) => {
      clearTimeout(timeoutId);
      reject(error);
    }
  });
};

// 計算函數
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
// UI Components
// ------------------------------------------------------------------

// Toast Component
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600'
  };

  return (
    <div className={`fixed bottom-6 right-6 ${bgColors[type]} text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-bounce-in z-[100]`}>
      {type === 'success' && <Check size={20} />}
      {type === 'error' && <ShieldAlert size={20} />}
      <span className="font-bold">{message}</span>
    </div>
  );
};

// Sidebar Nav Item
const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

// ------------------------------------------------------------------
// Main Features (Calculators)
// ------------------------------------------------------------------

const MillionDollarGiftTool = ({ data, setData }) => {
  const safeData = {
    loanAmount: Number(data?.loanAmount) || 100,
    loanTerm: Number(data?.loanTerm) || 7,
    loanRate: Number(data?.loanRate) || 2.8,
    investReturnRate: Number(data?.investReturnRate) || 6
  };
  const { loanAmount, loanTerm, loanRate, investReturnRate } = safeData;

  const targetAmount = loanAmount * 3; 
  const monthlyLoanPayment = calculateMonthlyPayment(loanAmount, loanRate, loanTerm);
  const monthlyInvestIncomeSingle = calculateMonthlyIncome(loanAmount, investReturnRate);
  const phase1_NetOut = monthlyLoanPayment - monthlyInvestIncomeSingle;
  const phase2_NetOut = monthlyLoanPayment - (monthlyInvestIncomeSingle * 2);
  const standardTotalCost = targetAmount * 10000; 
  const standardMonthlySaving = standardTotalCost / (loanTerm * 2 * 12);

  const generateChartData = () => {
    const dataArr = [];
    let cumulativeStandard = 0;
    let cumulativeProjectCost = 0;
    let projectAssetValue = 0;
    for (let year = 1; year <= 14; year++) {
      cumulativeStandard += standardMonthlySaving * 12;
      if (year <= 7) {
        cumulativeProjectCost += phase1_NetOut * 12;
        projectAssetValue = loanAmount * 10000;
      } else {
        cumulativeProjectCost += phase2_NetOut * 12;
        projectAssetValue = loanAmount * 2 * 10000;
      }
      dataArr.push({
        year: `第${year}年`,
        一般存錢成本: Math.round(cumulativeStandard / 10000),
        專案實付成本: Math.round(cumulativeProjectCost / 10000),
        專案持有資產: Math.round(projectAssetValue / 10000),
      });
    }
    return dataArr;
  };

  const updateField = (field, value) => { setData({ ...safeData, [field]: value }); };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
          <Wallet className="text-blue-200" />
          百萬禮物專案
        </h3>
        <p className="text-blue-100 opacity-90">
          透過 7 年一輪的小額槓桿循環，用時間換取資產，輕鬆累積第一桶金。
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Input Control */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
              <Settings size={18} /> 參數設定
            </h4>
            <div className="space-y-6">
               {[
                 { label: "單次借貸額度 (萬)", field: "loanAmount", min: 50, max: 500, step: 10, val: loanAmount, color: "blue" },
                 { label: "信貸利率 (%)", field: "loanRate", min: 1.5, max: 15.0, step: 0.1, val: loanRate, color: "blue" },
                 { label: "配息率 (%)", field: "investReturnRate", min: 3, max: 12, step: 0.5, val: investReturnRate, color: "green" }
               ].map((item) => (
                 <div key={item.field}>
                   <div className="flex justify-between mb-2">
                     <label className="text-sm font-medium text-slate-600">{item.label}</label>
                     <span className={`font-mono font-bold text-${item.color}-600`}>{item.val}</span>
                   </div>
                   <input 
                      type="range" 
                      min={item.min} 
                      max={item.max} 
                      step={item.step} 
                      value={item.val} 
                      onChange={(e) => updateField(item.field, Number(e.target.value))} 
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                    />
                 </div>
               ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100">
               <div className="text-center">
                  <p className="text-xs text-slate-400 mb-1">一般存錢需月存</p>
                  <p className="text-lg font-bold text-slate-400 line-through">${Math.round(standardMonthlySaving).toLocaleString()}</p>
               </div>
               <div className="mt-2 text-center bg-green-50 rounded-lg p-3 border border-green-100">
                  <p className="text-xs text-green-700 font-bold mb-1">專案效益</p>
                  <p className="text-sm text-green-800">
                    每月省下 <span className="font-bold text-lg">${Math.round(standardMonthlySaving - phase1_NetOut).toLocaleString()}</span>
                  </p>
               </div>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500">
               <div className="text-xs text-slate-500 font-bold uppercase mb-2">第一階段 (1-7年)</div>
               <div className="flex items-baseline gap-1">
                 <span className="text-3xl font-bold text-slate-800">${Math.round(phase1_NetOut).toLocaleString()}</span>
                 <span className="text-sm text-slate-400">/月</span>
               </div>
               <div className="text-xs text-slate-500 mt-2">擁有 {loanAmount} 萬資產</div>
             </div>
             <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-indigo-500">
               <div className="text-xs text-slate-500 font-bold uppercase mb-2">第二階段 (8-14年)</div>
               <div className="flex items-baseline gap-1">
                 <span className={`text-3xl font-bold ${phase2_NetOut < 0 ? 'text-green-600' : 'text-slate-800'}`}>
                   {phase2_NetOut < 0 ? '+' : ''}{Math.abs(Math.round(phase2_NetOut)).toLocaleString()}
                 </span>
                 <span className="text-sm text-slate-400">/月</span>
               </div>
               <div className="text-xs text-slate-500 mt-2">擁有 {loanAmount * 2} 萬資產</div>
             </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={generateChartData()} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAssetGift" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis unit="萬" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                />
                <Legend />
                <Area type="monotone" dataKey="專案持有資產" stroke="#3b82f6" fill="url(#colorAssetGift)" strokeWidth={2} />
                <Bar dataKey="一般存錢成本" fill="#cbd5e1" barSize={12} radius={[4,4,0,0]} />
                <Line type="monotone" dataKey="專案實付成本" stroke="#f59e0b" strokeWidth={3} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const FinancialRealEstateTool = ({ data, setData }) => {
  const safeData = {
    loanAmount: Number(data?.loanAmount) || 1000,
    loanTerm: Number(data?.loanTerm) || 30,
    loanRate: Number(data?.loanRate) || 2.2,
    investReturnRate: Number(data?.investReturnRate) || 6
  };
  const { loanAmount, loanTerm, loanRate, investReturnRate } = safeData;

  const monthlyLoanPayment = calculateMonthlyPayment(loanAmount, loanRate, loanTerm);
  const monthlyInvestIncome = calculateMonthlyIncome(loanAmount, investReturnRate);
  const monthlyCashFlow = monthlyInvestIncome - monthlyLoanPayment;
  const generateHouseChartData = () => {
    const dataArr = [];
    let cumulativeNetIncome = 0; 
    for (let year = 1; year <= loanTerm; year++) {
      cumulativeNetIncome += monthlyCashFlow * 12;
      const remainingLoan = calculateRemainingBalance(loanAmount, loanRate, loanTerm, year);
      const assetEquity = (loanAmount * 10000) - remainingLoan;
      const financialTotalWealth = assetEquity + cumulativeNetIncome;
      const step = loanTerm > 20 ? 3 : 1; 
      if (year === 1 || year % step === 0 || year === loanTerm) {
         dataArr.push({ year: `第${year}年`, 總資產價值: Math.round(financialTotalWealth / 10000), 剩餘貸款: Math.round(remainingLoan / 10000) });
      }
    }
    return dataArr;
  };
  const updateField = (field, value) => { setData({ ...safeData, [field]: value }); };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
          <Building2 className="text-emerald-200" />
          金融房產專案
        </h3>
        <p className="text-emerald-100 opacity-90">
          以息養貸，利用長年期貸款讓資產自動增值，打造數位包租公模式。
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Input */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
              <Settings size={18} /> 資產參數
            </h4>
            <div className="space-y-6">
               {[
                 { label: "資產/貸款總額 (萬)", field: "loanAmount", min: 500, max: 3000, step: 100, val: loanAmount, color: "emerald" },
                 { label: "貸款年期 (年)", field: "loanTerm", min: 20, max: 40, step: 1, val: loanTerm, color: "emerald" },
                 { label: "貸款利率 (%)", field: "loanRate", min: 1.5, max: 4.0, step: 0.1, val: loanRate, color: "emerald" },
                 { label: "配息率 (%)", field: "investReturnRate", min: 3, max: 10, step: 0.5, val: investReturnRate, color: "blue" }
               ].map((item) => (
                 <div key={item.field}>
                   <div className="flex justify-between mb-2">
                     <label className="text-sm font-medium text-slate-600">{item.label}</label>
                     <span className={`font-mono font-bold text-${item.color}-600`}>{item.val}</span>
                   </div>
                   <input 
                      type="range" 
                      min={item.min} 
                      max={item.max} 
                      step={item.step} 
                      value={item.val} 
                      onChange={(e) => updateField(item.field, Number(e.target.value))} 
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" 
                    />
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-around gap-6">
             <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">每月配息收入</p>
                <p className="text-2xl font-bold text-emerald-600 font-mono">+${Math.round(monthlyInvestIncome).toLocaleString()}</p>
             </div>
             <div className="text-slate-300 hidden md:block"><ArrowUpFromLine className="rotate-90"/></div>
             <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">每月貸款支出</p>
                <p className="text-2xl font-bold text-red-500 font-mono">-${Math.round(monthlyLoanPayment).toLocaleString()}</p>
             </div>
             <div className="w-px h-12 bg-slate-200 hidden md:block"></div>
             <div className="text-center bg-slate-50 px-6 py-3 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">每月淨現金流</p>
                <p className={`text-3xl font-black font-mono ${monthlyCashFlow >= 0 ? 'text-blue-600' : 'text-orange-500'}`}>
                   {monthlyCashFlow >= 0 ? '+' : '-'}${Math.abs(Math.round(monthlyCashFlow)).toLocaleString()}
                </p>
             </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={generateHouseChartData()} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis unit="萬" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip 
                   contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                />
                <Legend />
                <Area type="monotone" name="總資產價值" dataKey="總資產價值" stroke="#10b981" fill="url(#colorWealth)" strokeWidth={3} />
                <Line type="monotone" name="剩餘房貸" dataKey="剩餘貸款" stroke="#ef4444" strokeWidth={1} dot={false} opacity={0.5} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// Main App Shell
// ------------------------------------------------------------------

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('gift'); // 'gift', 'estate', 'files', 'settings'
  const [toast, setToast] = useState(null);

  // Data State
  const [giftData, setGiftData] = useState({ loanAmount: 100, loanTerm: 7, loanRate: 2.8, investReturnRate: 6 });
  const [estateData, setEstateData] = useState({ loanAmount: 1000, loanTerm: 30, loanRate: 2.2, investReturnRate: 6 });
  const [userProfile, setUserProfile] = useState({ displayName: '', title: '', lineId: '', photoUrl: '' });
  
  // Files State
  const [savedFiles, setSavedFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  // --- Auth & Initial Load ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        // Load Profile
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists() && userDoc.data().profile) {
            setUserProfile(userDoc.data().profile);
          } else {
            setUserProfile({ displayName: currentUser.displayName || '', title: '理財規劃師', lineId: '', photoUrl: currentUser.photoURL || '' });
          }
        } catch (e) { console.error(e); }
      }
    });
    return () => unsubscribe();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // --- Actions ---
  const handleLogin = async () => {
    try { await signInWithPopup(auth, googleProvider); } 
    catch (e) { showToast("登入失敗", "error"); }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setSavedFiles([]);
    setActiveTab('gift');
    showToast("已安全登出", "info");
  };

  const handleSavePlan = async () => {
    if (!user) return;
    const name = prompt("請輸入規劃名稱 (例如：陳先生-退休規劃)：");
    if (!name) return;

    const newPlan = {
      name,
      date: new Date().toLocaleDateString(),
      type: activeTab === 'gift' ? 'gift' : 'estate',
      data: activeTab === 'gift' ? { ...giftData } : { ...estateData }
    };

    try {
      await withTimeout(addDoc(collection(db, "users", user.uid, "plans"), newPlan), 15000, "Timeout");
      showToast("規劃已儲存到雲端！", "success");
      loadFiles(); // Refresh list
    } catch (e) {
      showToast("儲存失敗，請檢查網路", "error");
    }
  };

  const loadFiles = async () => {
    if (!user) return;
    setIsLoadingFiles(true);
    try {
      const q = query(collection(db, "users", user.uid, "plans"), orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      const files = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setSavedFiles(files);
    } catch (e) { showToast("讀取失敗", "error"); }
    finally { setIsLoadingFiles(false); }
  };

  const handleLoadFile = (file) => {
    if (file.type === 'gift') {
      setGiftData(file.data);
      setActiveTab('gift');
    } else {
      setEstateData(file.data);
      setActiveTab('estate');
    }
    showToast(`已載入：${file.name}`, "success");
  };

  const handleDeleteFile = async (id, e) => {
    e.stopPropagation();
    if(!confirm("確定刪除此檔案？")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "plans", id));
      setSavedFiles(prev => prev.filter(f => f.id !== id));
      showToast("檔案已刪除", "success");
    } catch (e) { showToast("刪除失敗", "error"); }
  };

  const handleSaveProfile = async (newProfile) => {
      try {
        await setDoc(doc(db, "users", user.uid), { profile: newProfile }, { merge: true });
        setUserProfile(newProfile);
        showToast("名片設定已更新", "success");
      } catch (e) { showToast("更新失敗", "error"); }
  };

  // --- Render ---

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
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white flex-col hidden md:flex shadow-2xl z-10">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-1">
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 p-0.5">
                <img src={userProfile.photoUrl || user.photoURL} alt="User" className="w-full h-full rounded-full object-cover bg-slate-800" />
             </div>
             <div>
                <div className="text-xs text-yellow-500 font-bold uppercase">{userProfile.title || '理財顧問'}</div>
                <div className="font-bold text-sm">{userProfile.displayName || user.displayName}</div>
             </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-bold text-slate-500 px-4 py-2 uppercase tracking-wider">銷售工具</div>
          <NavItem icon={Wallet} label="百萬禮物專案" active={activeTab === 'gift'} onClick={() => setActiveTab('gift')} />
          <NavItem icon={Building2} label="金融房產專案" active={activeTab === 'estate'} onClick={() => setActiveTab('estate')} />
          
          <div className="mt-8 text-xs font-bold text-slate-500 px-4 py-2 uppercase tracking-wider">資料管理</div>
          <NavItem icon={FileText} label="已存規劃檔案" active={activeTab === 'files'} onClick={() => { setActiveTab('files'); loadFiles(); }} />
          <NavItem icon={Settings} label="個人名片設定" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="p-4 border-t border-slate-800">
           <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors px-4 py-2 w-full">
             <LogOut size={18} /> 登出系統
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-md shrink-0">
          <div className="font-bold flex items-center gap-2"><Coins className="text-yellow-400"/> 資產規劃</div>
          <div className="flex gap-2">
            <button onClick={() => setActiveTab(activeTab === 'gift' ? 'estate' : 'gift')} className="p-2 bg-slate-800 rounded-lg"><Calculator size={20}/></button>
            <button onClick={() => { setActiveTab('files'); loadFiles(); }} className="p-2 bg-slate-800 rounded-lg"><FileText size={20}/></button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
           {/* Save Button (Floating) */}
           {(activeTab === 'gift' || activeTab === 'estate') && (
             <button 
               onClick={handleSavePlan}
               className="fixed bottom-6 right-6 md:absolute md:top-8 md:right-8 md:bottom-auto bg-slate-900 text-white p-3 md:px-5 md:py-2 rounded-full md:rounded-lg shadow-lg hover:bg-slate-700 transition-all flex items-center gap-2 z-50 group"
             >
               <Save size={20} />
               <span className="hidden md:inline font-bold">儲存目前規劃</span>
             </button>
           )}

           <div className="max-w-5xl mx-auto pb-20 md:pb-0">
             {activeTab === 'gift' && <MillionDollarGiftTool data={giftData} setData={setGiftData} />}
             
             {activeTab === 'estate' && <FinancialRealEstateTool data={estateData} setData={setEstateData} />}

             {activeTab === 'files' && (
                <div className="animate-fade-in">
                   <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><FileText /> 客戶規劃檔案庫</h2>
                   {isLoadingFiles ? (
                     <div className="text-center py-12 text-slate-400">載入中...</div>
                   ) : savedFiles.length === 0 ? (
                     <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-slate-200">
                        <PiggyBank size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500">目前沒有儲存的規劃</p>
                        <p className="text-sm text-slate-400 mt-1">在工具頁面點擊「儲存」即可建立檔案</p>
                     </div>
                   ) : (
                     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                       {savedFiles.map(file => (
                         <div key={file.id} onClick={() => handleLoadFile(file)} className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group relative">
                            <div className="flex justify-between items-start mb-3">
                               <div className={`p-2 rounded-lg ${file.type === 'gift' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                  {file.type === 'gift' ? <Wallet size={20} /> : <Building2 size={20} />}
                               </div>
                               <button onClick={(e) => handleDeleteFile(file.id, e)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                            </div>
                            <h3 className="font-bold text-slate-800 text-lg mb-1">{file.name}</h3>
                            <p className="text-xs text-slate-400">{file.date} • {file.type === 'gift' ? '百萬禮物' : '金融房產'}</p>
                         </div>
                       ))}
                     </div>
                   )}
                </div>
             )}

             {activeTab === 'settings' && (
               <div className="animate-fade-in max-w-2xl mx-auto">
                  <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Settings /> 個人數位名片設定</h2>
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                     {/* Photo Upload - Simplified Logic */}
                     <div className="flex justify-center">
                        <div className="relative group cursor-pointer w-32 h-32">
                           <img src={userProfile.photoUrl || user.photoURL} className={`w-full h-full rounded-full object-cover border-4 border-slate-100 shadow-lg ${userProfile.photoPosition === 'top' ? 'object-top' : 'object-center'}`} />
                           <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-white text-xs">更換頭像請洽管理員</span>
                           </div>
                        </div>
                     </div>
                     <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">顯示名稱</label>
                          <input type="text" value={userProfile.displayName} onChange={e => setUserProfile({...userProfile, displayName: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">專業職稱</label>
                          <input type="text" value={userProfile.title} onChange={e => setUserProfile({...userProfile, title: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-slate-700 mb-2">LINE ID</label>
                          <input type="text" value={userProfile.lineId} onChange={e => setUserProfile({...userProfile, lineId: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                     </div>
                     <button onClick={() => handleSaveProfile(userProfile)} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 shadow-lg mt-4">儲存設定</button>
                  </div>
               </div>
             )}
           </div>
        </div>
      </main>
      
      {/* Print Styles */}
      <style>{`
        @media print {
          aside, button, .no-print { display: none !important; }
          body, main { background: white !important; height: auto !important; overflow: visible !important; }
          .shadow-lg, .shadow-sm { box-shadow: none !important; border: 1px solid #ddd !important; }
          .text-white { color: black !important; }
          .bg-gradient-to-r { background: none !important; color: black !important; border-bottom: 2px solid #000; }
        }
      `}</style>
    </div>
  );
}