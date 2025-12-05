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
  Rocket
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

// --- Firebase 模組整合 (維持不變) ---
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

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const db = initializeFirestore(app, {
  experimentalForceLongPolling: true, 
  localCache: memoryLocalCache(), 
});

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

const PrintStyles = () => (
  <style>{`
    @media print {
      aside, .no-print, .toast-container { display: none !important; }
      body, main { background: white !important; height: auto !important; overflow: visible !important; }
      .print-break-inside { break-inside: avoid; }
      .shadow-lg, .shadow-sm { box-shadow: none !important; border: 1px solid #ddd !important; }
      .text-white { color: black !important; }
      .bg-gradient-to-r, .bg-gradient-to-br { background: none !important; background-color: #f0f9ff !important; color: black !important; }
      header { display: none !important; } 
      .print-header { display: block !important; margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
      .recharts-wrapper { width: 100% !important; height: auto !important; }
    }
    .print-header { display: none; }
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

const ProfileModal = ({ isOpen, onClose, profile, onSave, loading }) => {
  const [formData, setFormData] = useState(profile);
  useEffect(() => { if(isOpen) setFormData(profile); }, [isOpen, profile]);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 space-y-4">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Edit3 size={20} /> 修改顯示資料</h3>
        <div>
           <label className="block text-sm font-bold text-slate-700 mb-1">顯示名稱</label>
           <input type="text" value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="您的姓名" />
        </div>
        <div>
           <label className="block text-sm font-bold text-slate-700 mb-1">專業職稱</label>
           <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="例如：資深理財顧問" />
        </div>
        <div className="flex gap-2 mt-4">
           <button onClick={onClose} className="flex-1 py-2 border border-slate-300 rounded-lg text-slate-600 font-bold hover:bg-slate-50">取消</button>
           <button onClick={() => onSave(formData)} disabled={loading} className="flex-1 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 disabled:opacity-50">{loading ? '儲存中...' : '確認修改'}</button>
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// 核心模組 1: 百萬禮物專案
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg print-break-inside">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Wallet className="text-blue-200" /> 百萬禮物專案</h3>
        <p className="text-blue-100 opacity-90">透過 7 年一輪的小額槓桿循環，用時間換取資產。</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4 print-break-inside">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2"><Calculator size={18} /> 參數設定</h4>
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
                   <input type="range" min={item.min} max={item.max} step={item.step} value={item.val} onChange={(e) => updateField(item.field, Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                 </div>
               ))}
            </div>
          </div>
          
          <div className="hidden print-only border p-4 mb-4 rounded border-slate-300">
             <h3 className="font-bold mb-2">規劃參數</h3>
             <div className="grid grid-cols-2 gap-2 text-sm"><div>信貸額度：{loanAmount} 萬</div><div>信貸利率：{loanRate} %</div><div>配息率：{investReturnRate} %</div><div>總目標：{targetAmount} 萬</div></div>
          </div>

          <div className="bg-white rounded-xl shadow border border-slate-200 p-5 print-break-inside">
              <div className="text-sm text-slate-500 mb-4 text-center">一般存錢月存金額 <span className="line-through decoration-slate-400 font-bold ml-2">${Math.round(standardMonthlySaving).toLocaleString()}</span></div>
              <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="flex justify-between items-center text-sm"><span className="text-slate-600 font-medium">1. 信貸每月還款</span><span className="text-red-500 font-bold font-mono">-${Math.round(monthlyLoanPayment).toLocaleString()}</span></div>
                <div className="flex justify-between items-center text-sm"><span className="text-slate-600 font-medium">2. 扣除每月配息</span><span className="text-green-600 font-bold font-mono">+${Math.round(monthlyInvestIncomeSingle).toLocaleString()}</span></div>
                <div className="border-t border-slate-200 my-2"></div>
                <div className="flex justify-between items-end"><span className="text-blue-700 font-bold">3. 實質每月應負</span><span className="text-3xl font-black text-blue-600 font-mono">${Math.round(phase1_NetOut).toLocaleString()}</span></div>
              </div>
              <div className="mt-4 text-center"><div className="text-xs bg-green-100 text-green-700 py-1.5 px-3 rounded-full inline-block font-bold">比一般存錢每月省下 ${Math.round(standardMonthlySaving - phase1_NetOut).toLocaleString()}</div></div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-2 gap-4 print-break-inside">
             <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500">
               <div className="text-xs text-slate-500 font-bold mb-1">第一階段 (1-7年)</div>
               <div className="flex justify-between items-end"><span className="text-2xl font-bold text-slate-800">${Math.round(phase1_NetOut).toLocaleString()}</span><span className="text-xs text-slate-400">/月</span></div><div className="text-xs text-slate-500 mt-2">擁有 {loanAmount} 萬資產</div>
             </div>
             <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-indigo-500">
               <div className="text-xs text-slate-500 font-bold mb-1">第二階段 (8-14年)</div>
               <div className="flex justify-between items-end"><span className={`text-2xl font-bold ${phase2_NetOut < 0 ? 'text-green-600' : 'text-slate-800'}`}>{phase2_NetOut < 0 ? `+${Math.abs(Math.round(phase2_NetOut)).toLocaleString()}` : `$${Math.round(phase2_NetOut).toLocaleString()}`}</span><span className="text-xs text-slate-400">/月</span></div><div className="text-xs text-slate-500 mt-2">擁有 {loanAmount * 2} 萬資產</div>
             </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-[350px] print-break-inside">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={generateChartData()} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAssetGift" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis unit="萬" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
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

// ------------------------------------------------------------------
// 核心模組 2: 金融房產專案
// ------------------------------------------------------------------

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
  const isNegativeCashFlow = monthlyCashFlow < 0; 
  const totalOutOfPocket = Math.abs(monthlyCashFlow) * 12 * loanTerm; 

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

  const chartData = generateHouseChartData();
  const finalData = chartData[chartData.length - 1];
  const updateField = (field, value) => { setData({ ...safeData, [field]: value }); };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg print-break-inside">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Building2 className="text-emerald-200" /> 金融房產專案</h3>
        <p className="text-emerald-100 opacity-90">以息養貸，利用長年期貸款讓資產自動增值，打造數位包租公模式。</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4 print-break-inside">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2"><Calculator size={18} /> 資產參數</h4>
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
                   <input type="range" min={item.min} max={item.max} step={item.step} value={item.val} onChange={(e) => setData({ ...safeData, [item.field]: Number(e.target.value) })} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
                 </div>
               ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow border border-slate-200 p-6 print-break-inside">
              <h3 className="text-center font-bold text-slate-700 mb-4">每月現金流試算</h3>
              <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="flex justify-between items-center text-sm"><span className="text-slate-600 font-medium">1. 每月配息收入</span><span className="font-mono text-emerald-600 font-bold">+${Math.round(monthlyInvestIncome).toLocaleString()}</span></div>
                <div className="flex justify-between items-center text-sm"><span className="text-slate-600 font-medium">2. 扣除貸款支出</span><span className="font-mono text-red-500 font-bold">-${Math.round(monthlyLoanPayment).toLocaleString()}</span></div>
                <div className="border-t border-slate-200 my-2"></div>
                {isNegativeCashFlow ? (
                   <div className="text-center">
                     <div className="text-xs text-slate-400 mb-1">每月需負擔</div>
                     <div className="text-3xl font-black text-red-500 font-mono">-${Math.abs(Math.round(monthlyCashFlow)).toLocaleString()}</div>
                     <div className="mt-4 bg-orange-50 rounded-lg p-3 border border-orange-100">
                        <div className="flex items-center justify-center gap-2 text-orange-800 font-bold text-sm mb-1"><Scale className="w-4 h-4" /> 槓桿效益分析</div>
                        <div className="text-xs text-orange-700 mb-2">{loanTerm}年總共只付出 <span className="font-bold underline">${Math.round(totalOutOfPocket/10000)}萬</span></div>
                        <div className="text-xs bg-white rounded py-1 px-2 text-orange-800 border border-orange-200">換取 <span className="font-bold text-lg">${loanAmount}萬</span> 原始資產</div>
                     </div>
                   </div>
                ) : (
                   <div className="text-center">
                     <div className="text-xs text-slate-400 mb-1">每月淨現金流</div>
                     <div className="text-3xl font-black text-emerald-600 font-mono">+${Math.round(monthlyCashFlow).toLocaleString()}</div>
                     <div className="text-xs mt-2 text-slate-500">完全由資產養貸，還有找！</div>
                   </div>
                )}
              </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden print-break-inside">
             <div className="absolute top-0 right-0 p-8 opacity-10"><Coins size={120} /></div>
             <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><CheckCircle2 className="text-emerald-300" />{loanTerm} 年期滿總結算</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
               <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-emerald-400/30">
                 <div className="text-emerald-200 text-xs mb-1">1. 房貸結清</div><div className="text-2xl font-bold">0</div><div className="text-xs text-emerald-200 mt-1 opacity-75">無債一身輕</div>
               </div>
               <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-emerald-400/30">
                 <div className="text-emerald-200 text-xs mb-1">2. 本金歸你</div><div className="text-2xl font-bold">{loanAmount} <span className="text-sm font-normal">萬</span></div><div className="text-xs text-emerald-200 mt-1 opacity-75">資產保留</div>
               </div>
               <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-yellow-300/50 shadow-lg">
                 <div className="text-yellow-200 text-xs mb-1 font-bold">3. 總效益</div><div className="text-3xl font-black text-yellow-300">{finalData ? finalData.總資產價值 : 0} <span className="text-sm font-normal text-white">萬</span></div>
               </div>
             </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-[320px] print-break-inside">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={generateHouseChartData()} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs><linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis unit="萬" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
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
// 核心模組 3: 學貸套利專案 (進階版：含寬限期與只繳息期)
// ------------------------------------------------------------------

const StudentLoanTool = ({ data, setData }) => {
  const safeData = {
    loanAmount: Number(data?.loanAmount) || 40,
    loanRate: 1.775, // 固定利率 1.775%
    investReturnRate: Number(data?.investReturnRate) || 6,
    years: Number(data?.years) || 8,
    gracePeriod: Number(data?.gracePeriod) || 1, // 寬限期預設 1 年
    interestOnlyPeriod: Number(data?.interestOnlyPeriod) || 0 // 只繳息期預設 0 年
  };
  const { loanAmount, loanRate, investReturnRate, years, gracePeriod, interestOnlyPeriod } = safeData;

  const monthlyPaymentP_I = calculateMonthlyPayment(loanAmount, loanRate, years); // 本息攤還金額
  const monthlyInterestOnly = (loanAmount * 10000 * (loanRate / 100)) / 12; // 只繳息金額

  // 總時程 = 寬限期(1) + 只繳息期(0~4) + 本息攤還期(8)
  // 注意：寬限期與只繳息期，通常是「外加」於還款期的，即還款期限順延。
  // 本金還款期 years 固定為 8 年(或其他設定值)。
  const totalDuration = gracePeriod + interestOnlyPeriod + years;

  const generateChartData = () => {
    const dataArr = [];
    const initialCapital = loanAmount * 10000; 
    
    let investmentValue = initialCapital;
    let remainingLoan = loanAmount * 10000;
    
    // 情境：直接還清 (基準線)
    // 假設一開始就有這筆錢(40萬)。如果選擇還清，資產=0。如果選擇投資，資產=投資值-負債。

    for (let year = 1; year <= totalDuration + 2; year++) { 
      // 1. 投資複利成長
      investmentValue = investmentValue * (1 + investReturnRate / 100);
      
      // 2. 貸款餘額計算
      if (year <= gracePeriod) {
         // 寬限期：不還本，通常也不繳息(或政府補貼)。本金不變。
         // 這裡假設這段期間不用從口袋拿錢出來。
         remainingLoan = loanAmount * 10000;
      } else if (year <= gracePeriod + interestOnlyPeriod) {
         // 只繳息期：只還利息，本金不變。
         remainingLoan = loanAmount * 10000;
      } else if (year <= totalDuration) {
         // 本息攤還期：開始還本金
         const repaymentYearIndex = year - (gracePeriod + interestOnlyPeriod);
         remainingLoan = calculateRemainingBalance(loanAmount, loanRate, years, repaymentYearIndex);
      } else {
         remainingLoan = 0;
      }
      
      const netWorth = investmentValue - remainingLoan;

      // 標註階段
      let phase = "";
      if (year <= gracePeriod) phase = "寬限期";
      else if (year <= gracePeriod + interestOnlyPeriod) phase = "只繳息";
      else if (year <= totalDuration) phase = "攤還期";
      else phase = "自由期";

      dataArr.push({
        year: `第${year}年`,
        投資複利價值: Math.round(investmentValue / 10000),
        淨資產: Math.round(netWorth / 10000),
        若直接繳掉: 0,
        phase: phase
      });
    }
    return dataArr;
  };
  
  // 計算最終獲利 (專案結束時)
  const finalInvestValue = loanAmount * 10000 * Math.pow((1 + investReturnRate/100), totalDuration);
  
  // 總支出成本 = (寬限期0) + (只繳息期利息總和) + (本息攤還期總額)
  // 假設寬限期利息由政府補貼(不計入成本)或暫時不計
  const totalInterestOnlyCost = monthlyInterestOnly * 12 * interestOnlyPeriod;
  const totalAmortizationCost = monthlyPaymentP_I * 12 * years;
  const totalCost = totalInterestOnlyCost + totalAmortizationCost;
  
  const pureProfit = finalInvestValue - totalCost;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg print-break-inside">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><GraduationCap className="text-sky-100" /> 學貸套利專案 (進階版)</h3>
        <p className="text-sky-100 opacity-90">善用「寬限期」與「只繳息期」延長資金壽命，最大化複利效應。</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4 print-break-inside">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2"><Calculator size={18} /> 參數設定</h4>
            <div className="space-y-6">
               <div>
                 <div className="flex justify-between mb-2">
                   <label className="text-sm font-medium text-slate-600">學貸總額 (萬)</label>
                   <span className="font-mono font-bold text-blue-600">{loanAmount}</span>
                 </div>
                 <input type="range" min={10} max={100} step={5} value={loanAmount} onChange={(e) => setData({ ...safeData, loanAmount: Number(e.target.value) })} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
               </div>

               <div>
                 <div className="flex justify-between mb-2">
                   <label className="text-sm font-medium text-slate-600 flex items-center gap-1"><Clock size={14}/> 畢業後寬限期 (年)</label>
                   <span className="font-mono font-bold text-sky-600">{gracePeriod} 年</span>
                 </div>
                 <input type="range" min={0} max={3} step={1} value={gracePeriod} onChange={(e) => setData({ ...safeData, gracePeriod: Number(e.target.value) })} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500" />
                 <p className="text-xs text-slate-400 mt-1">通常為畢業後 1 年</p>
               </div>

               <div>
                 <div className="flex justify-between mb-2">
                   <label className="text-sm font-medium text-slate-600 flex items-center gap-1"><PauseCircle size={14}/> 申請只繳息期 (年)</label>
                   <span className="font-mono font-bold text-orange-500">{interestOnlyPeriod} 年</span>
                 </div>
                 <input type="range" min={0} max={4} step={1} value={interestOnlyPeriod} onChange={(e) => setData({ ...safeData, interestOnlyPeriod: Number(e.target.value) })} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                 <p className="text-xs text-slate-400 mt-1">一般戶最多可申請 4 年，期間本金不還</p>
               </div>

               <div>
                 <div className="flex justify-between mb-2">
                   <label className="text-sm font-medium text-slate-600">投資報酬率 (%)</label>
                   <span className="font-mono font-bold text-green-600">{investReturnRate}</span>
                 </div>
                 <input type="range" min={3} max={10} step={0.5} value={investReturnRate} onChange={(e) => setData({ ...safeData, investReturnRate: Number(e.target.value) })} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600" />
               </div>
            </div>
            
            <div className="mt-6 p-3 bg-slate-100 rounded-lg">
                <div className="flex justify-between text-sm mb-1">
                   <span className="text-slate-500">固定利率</span>
                   <span className="font-bold text-slate-700">{loanRate}%</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                   <span className="text-slate-500">總資金運用期</span>
                   <span className="font-bold text-blue-600">{totalDuration} 年</span>
                </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow border border-slate-200 p-6">
             <div className="text-center mb-4">
               <p className="text-slate-500 text-sm">若直接繳掉學費</p>
               <p className="text-xl font-bold text-slate-400">資產歸零</p>
             </div>
             <div className="border-t border-slate-100 my-4"></div>
             <div className="text-center">
               <p className="text-slate-500 text-sm">若利用學貸套利</p>
               <p className="text-3xl font-black text-sky-600 font-mono">+${Math.round(pureProfit / 10000)}萬</p>
               <p className="text-xs text-slate-400 mt-1">{totalDuration}年後 淨賺金額</p>
             </div>
             
             <div className="mt-4 bg-sky-50 p-3 rounded-lg border border-sky-100 text-xs text-sky-800 space-y-2">
               <div>
                 <span className="font-bold">💡 策略分析：</span>
                 <ul className="list-disc pl-4 mt-1 space-y-1">
                    {gracePeriod > 0 && <li>利用<span className="font-bold">{gracePeriod}年寬限期</span>，前{gracePeriod}年完全免費持有資金。</li>}
                    {interestOnlyPeriod > 0 && <li>申請<span className="font-bold">{interestOnlyPeriod}年只繳息</span>，每月僅需付約 <span className="font-bold text-red-500">${Math.round(monthlyInterestOnly)}</span> 利息，本金繼續滾複利。</li>}
                    <li>利用時間差，創造 <span className="font-bold">${Math.round(pureProfit / 10000)}萬</span> 的淨財富。</li>
                 </ul>
               </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[450px]">
             <h4 className="font-bold text-slate-700 mb-4 pl-2">資產累積 vs 負債遞減圖</h4>
             <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={generateChartData()} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <defs><linearGradient id="colorInvest" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/><stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis unit="萬" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend />
                <Area type="monotone" name="套利淨資產" dataKey="淨資產" stroke="#0ea5e9" fill="url(#colorInvest)" strokeWidth={3} />
                <Line type="monotone" name="投資複利總值" dataKey="投資複利價值" stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 3" />
                <Line type="monotone" name="直接繳掉 (資產=0)" dataKey="若直接繳掉" stroke="#ef4444" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
             <div className="bg-slate-50 p-4 rounded-lg text-center">
                <div className="text-xs text-slate-500">總利息成本</div>
                <div className="font-bold text-red-500">${Math.round(totalCost - loanAmount*10000).toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 mt-1">含只繳息期利息</div>
             </div>
             <div className="bg-slate-50 p-4 rounded-lg text-center">
                <div className="text-xs text-slate-500">投資複利獲利</div>
                <div className="font-bold text-green-600">+${Math.round(finalInvestValue - loanAmount*10000).toLocaleString()}</div>
             </div>
             <div className="bg-slate-100 p-4 rounded-lg text-center border-l-4 border-sky-500">
                <div className="text-xs text-slate-500">淨賺利差</div>
                <div className="font-bold text-sky-700">+${Math.round(pureProfit).toLocaleString()}</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// 核心模組 4: 超積極存錢法
// ------------------------------------------------------------------

const SuperActiveSavingTool = ({ data, setData }) => {
  const safeData = {
    monthlySaving: Number(data?.monthlySaving) || 10000,
    investReturnRate: Number(data?.investReturnRate) || 6,
    activeYears: Number(data?.activeYears) || 15,
    totalYears: 40 // 固定比較基準
  };
  const { monthlySaving, investReturnRate, activeYears, totalYears } = safeData;

  const generateChartData = () => {
    const dataArr = [];
    let passiveAccumulation = 0; // 消極存錢 (銀行)
    let activeInvestment = 0; // 積極存錢 (複利)

    for (let year = 1; year <= totalYears; year++) {
      // 1. 消極存錢：每年存 12 萬，存 40 年
      passiveAccumulation += monthlySaving * 12;

      // 2. 積極存錢：前 15 年存，之後不存只滾複利
      if (year <= activeYears) {
        // 年金複利公式：每年投入 + 獲利
        activeInvestment = (activeInvestment + monthlySaving * 12) * (1 + investReturnRate / 100);
      } else {
        // 複利滾存：不再投入，純滾動
        activeInvestment = activeInvestment * (1 + investReturnRate / 100);
      }

      dataArr.push({
        year: `第${year}年`,
        消極存錢: Math.round(passiveAccumulation / 10000),
        積極存錢: Math.round(activeInvestment / 10000),
      });
    }
    return dataArr;
  };

  const chartData = generateChartData();
  const finalPassive = chartData[chartData.length - 1].消極存錢;
  const finalActive = chartData[chartData.length - 1].積極存錢;
  
  // 計算積極存錢法何時超越消極存錢法的最終目標 (40年消極存錢的總額)
  const targetAmount = monthlySaving * 12 * totalYears; // 480萬
  const crossOverYearItem = chartData.find(d => d.積極存錢 >= targetAmount / 10000);
  const crossOverYear = crossOverYearItem ? crossOverYearItem.year : "未達標";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-lg print-break-inside">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Rocket className="text-purple-200" /> 超積極存錢法</h3>
        <p className="text-purple-100 opacity-90">辛苦 15 年，換來提早 10 年的財富自由。用複利對抗勞力。</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4 print-break-inside">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2"><Calculator size={18} /> 參數設定</h4>
            <div className="space-y-6">
               <div>
                 <div className="flex justify-between mb-2">
                   <label className="text-sm font-medium text-slate-600">每月存錢金額</label>
                   <span className="font-mono font-bold text-purple-600">${monthlySaving.toLocaleString()}</span>
                 </div>
                 <input type="range" min={3000} max={50000} step={1000} value={monthlySaving} onChange={(e) => setData({ ...safeData, monthlySaving: Number(e.target.value) })} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600" />
               </div>

               <div>
                 <div className="flex justify-between mb-2">
                   <label className="text-sm font-medium text-slate-600">只需辛苦 (年)</label>
                   <span className="font-mono font-bold text-pink-600">{activeYears} 年</span>
                 </div>
                 <input type="range" min={5} max={25} step={1} value={activeYears} onChange={(e) => setData({ ...safeData, activeYears: Number(e.target.value) })} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-500" />
               </div>

               <div>
                 <div className="flex justify-between mb-2">
                   <label className="text-sm font-medium text-slate-600">投資報酬率 (%)</label>
                   <span className="font-mono font-bold text-green-600">{investReturnRate}</span>
                 </div>
                 <input type="range" min={3} max={12} step={0.5} value={investReturnRate} onChange={(e) => setData({ ...safeData, investReturnRate: Number(e.target.value) })} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600" />
               </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow border border-slate-200 p-6">
             <div className="text-center mb-4">
               <p className="text-slate-500 text-sm">消極存錢 (存40年)</p>
               <p className="text-xl font-bold text-slate-600">${finalPassive}萬</p>
               <p className="text-xs text-slate-400 mt-1">本金投入 ${Math.round(monthlySaving*12*totalYears/10000)}萬</p>
             </div>
             <div className="border-t border-slate-100 my-4"></div>
             <div className="text-center">
               <p className="text-slate-500 text-sm">積極存錢 (存{activeYears}年)</p>
               <p className="text-3xl font-black text-purple-600 font-mono">${finalActive}萬</p>
               <p className="text-xs text-slate-400 mt-1">本金投入 ${Math.round(monthlySaving*12*activeYears/10000)}萬 (省下 ${(monthlySaving*12*(totalYears-activeYears)/10000)}萬)</p>
             </div>
             
             <div className="mt-4 bg-purple-50 p-3 rounded-lg border border-purple-100 text-xs text-purple-800 space-y-2">
                <span className="font-bold">💡 關鍵效益：</span>
                <p>相比於苦存 40 年，您只需專注存錢 {activeYears} 年，靠著複利效果，資產在 {crossOverYear} 就能追上消極存錢 40 年的總額。</p>
             </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[450px]">
             <h4 className="font-bold text-slate-700 mb-4 pl-2">資產累積速度對比</h4>
             <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#9333ea" stopOpacity={0.3}/><stop offset="95%" stopColor="#9333ea" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis unit="萬" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend />
                <Area type="monotone" name="積極存錢 (複利)" dataKey="積極存錢" stroke="#9333ea" fill="url(#colorActive)" strokeWidth={3} />
                <Line type="monotone" name="消極存錢 (勞力)" dataKey="消極存錢" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
             <div className="bg-slate-50 p-4 rounded-lg text-center">
                <div className="text-xs text-slate-500">節省本金</div>
                <div className="font-bold text-green-600">${Math.round((monthlySaving*12*(totalYears-activeYears))/10000)}萬</div>
                <div className="text-[10px] text-slate-400 mt-1">少奮鬥 {totalYears - activeYears} 年</div>
             </div>
             <div className="bg-slate-50 p-4 rounded-lg text-center">
                <div className="text-xs text-slate-500">第 30 年資產</div>
                <div className="font-bold text-purple-600">${chartData[29]?.積極存錢}萬</div>
                <div className="text-[10px] text-slate-400 mt-1">對比消極法 ${chartData[29]?.消極存錢}萬</div>
             </div>
             <div className="bg-slate-100 p-4 rounded-lg text-center border-l-4 border-purple-500">
                <div className="text-xs text-slate-500">最終獲利倍數</div>
                <div className="font-bold text-purple-700">{(finalActive/Math.round(monthlySaving*12*activeYears/10000)).toFixed(1)} 倍</div>
                <div className="text-[10px] text-slate-400 mt-1">本金翻倍率</div>
             </div>
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
  const [activeTab, setActiveTab] = useState('gift'); 
  const [toast, setToast] = useState(null);

  const [giftData, setGiftData] = useState({ loanAmount: 100, loanTerm: 7, loanRate: 2.8, investReturnRate: 6 });
  const [estateData, setEstateData] = useState({ loanAmount: 1000, loanTerm: 30, loanRate: 2.2, investReturnRate: 6 });
  const [studentData, setStudentData] = useState({ loanAmount: 40, investReturnRate: 6, years: 8, gracePeriod: 1, interestOnlyPeriod: 0 });
  const [superActiveData, setSuperActiveData] = useState({ monthlySaving: 10000, investReturnRate: 6, activeYears: 15 });
  
  const [userProfile, setUserProfile] = useState({ displayName: '', title: '' });
  
  const [savedFiles, setSavedFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isProfileSaving, setIsProfileSaving] = useState(false);

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
    
    setActiveTab(file.type);
    showToast(`已載入：${file.name}`, "success");
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

  const handleSaveProfile = async (newProfile) => {
      setIsProfileSaving(true);
      try {
        await setDoc(doc(db, "users", user.uid), { profile: newProfile }, { merge: true });
        setUserProfile(newProfile);
        setIsProfileModalOpen(false);
        showToast("資料已更新", "success");
      } catch (e) { showToast("更新失敗", "error"); }
      finally { setIsProfileSaving(false); }
  };

  const handlePrint = () => { window.print(); };

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
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} profile={userProfile} onSave={handleSaveProfile} loading={isProfileSaving} />

      {/* Sidebar */}
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
             <button onClick={() => setIsProfileModalOpen(true)} className="text-slate-400 hover:text-white transition-colors"><Edit3 size={16} /></button>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-bold text-slate-500 px-4 py-2 uppercase tracking-wider">資產軍火庫</div>
          <NavItem icon={Wallet} label="百萬禮物專案" active={activeTab === 'gift'} onClick={() => setActiveTab('gift')} />
          <NavItem icon={Building2} label="金融房產專案" active={activeTab === 'estate'} onClick={() => setActiveTab('estate')} />
          <NavItem icon={GraduationCap} label="學貸套利專案" active={activeTab === 'student'} onClick={() => setActiveTab('student')} />
          <NavItem icon={Rocket} label="超積極存錢法" active={activeTab === 'super_active'} onClick={() => setActiveTab('super_active')} />
          
          <div className="mt-4 text-xs font-bold text-slate-600 px-4 py-2 uppercase tracking-wider">開發中模組</div>
          <NavItem icon={Umbrella} label="退休升級專案" disabled />
          <NavItem icon={Waves} label="大小水庫專案" disabled />
          <NavItem icon={Landmark} label="稅務專案" disabled />
          
          <div className="mt-8 text-xs font-bold text-slate-500 px-4 py-2 uppercase tracking-wider">資料管理</div>
          <NavItem icon={FileText} label="已存規劃檔案" active={activeTab === 'files'} onClick={() => { setActiveTab('files'); loadFiles(); }} />
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
           <button onClick={handlePrint} className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors px-4 py-2 w-full">
             <ArrowUpFromLine size={18} /> 匯出報表
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
            <button onClick={() => setActiveTab(activeTab === 'gift' ? 'estate' : 'gift')} className="p-2 bg-slate-800 rounded-lg"><Calculator size={20}/></button>
            <button onClick={() => { setActiveTab('files'); loadFiles(); }} className="p-2 bg-slate-800 rounded-lg"><FileText size={20}/></button>
            <button onClick={() => setIsProfileModalOpen(true)} className="p-2 bg-slate-800 rounded-lg"><Settings size={20}/></button>
          </div>
        </div>
        
        {/* Print Header */}
        <div className="print-header hidden">
           <div className="flex justify-between items-end">
              <div>
                 <h1 className="text-2xl font-bold">資產規劃建議書</h1>
                 <p className="text-sm text-gray-500">規劃專案：{
                   activeTab === 'gift' ? '百萬禮物專案' : 
                   activeTab === 'estate' ? '金融房產專案' : 
                   activeTab === 'student' ? '學貸套利專案' :
                   '超積極存錢法'
                 }</p>
              </div>
              <div className="text-right">
                 <p className="font-bold">{userProfile.displayName}</p>
                 <p className="text-sm text-gray-500">{userProfile.title}</p>
              </div>
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
                                 'bg-sky-100 text-sky-600'
                               }`}>
                                  {file.type === 'gift' ? <Wallet size={20} /> : 
                                   file.type === 'estate' ? <Building2 size={20} /> :
                                   file.type === 'super_active' ? <Rocket size={20} /> :
                                   <GraduationCap size={20} />}
                               </div>
                               <button onClick={(e) => handleDeleteFile(file.id, e)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                            </div>
                            <h3 className="font-bold text-slate-800 text-lg mb-1">{file.name}</h3>
                            <p className="text-xs text-slate-400">{file.date} • {
                                file.type === 'gift' ? '百萬禮物' : 
                                file.type === 'estate' ? '金融房產' : 
                                file.type === 'super_active' ? '超積極存錢' :
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