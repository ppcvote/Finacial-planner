import React, { useState, useEffect, useRef } from 'react';
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
  Edit3
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

// 使用記憶體快取 + 強制長輪詢
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

// 計算函數 (完全保留您的邏輯)
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

// --- 樣式注入 (確保列印功能正常) ---
const PrintStyles = () => (
  <style>{`
    @media print {
      aside, .no-print, .toast-container { display: none !important; }
      body, main { background: white !important; height: auto !important; overflow: visible !important; }
      .print-break-inside { break-inside: avoid; }
      .shadow-lg, .shadow-sm { box-shadow: none !important; border: 1px solid #ddd !important; }
      .text-white { color: black !important; }
      .bg-gradient-to-r, .bg-gradient-to-br { background: none !important; background-color: #f0f9ff !important; color: black !important; }
      header { display: none !important; } /* 隱藏 App Header */
      .print-header { display: block !important; margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
    }
    .print-header { display: none; }
  `}</style>
);

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
    <div className={`fixed bottom-6 right-6 ${bgColors[type]} text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-bounce-in z-[100] toast-container`}>
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

// Profile Edit Modal (Simplified)
const ProfileModal = ({ isOpen, onClose, profile, onSave, loading }) => {
  const [formData, setFormData] = useState(profile);
  
  useEffect(() => { if(isOpen) setFormData(profile); }, [isOpen, profile]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 space-y-4">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
           <Edit3 size={20} /> 修改顯示資料
        </h3>
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
           <button onClick={() => onSave(formData)} disabled={loading} className="flex-1 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 disabled:opacity-50">
             {loading ? '儲存中...' : '確認修改'}
           </button>
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// Main Features (Calculators) - Using YOUR Original Logic
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
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
          <Wallet className="text-blue-200" />
          百萬禮物專案
        </h3>
        <p className="text-blue-100 opacity-90">
          透過 7 年一輪的小額槓桿循環，用時間換取資產。
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Input Control */}
        <div className="lg:col-span-4 space-y-4 print-break-inside">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
              <Calculator size={18} /> 參數設定
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
          </div>
          
          {/* Print Only Parameters */}
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

        {/* Visualization */}
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
  const isNegativeCashFlow = monthlyCashFlow < 0; // 重要：判斷是否為負現金流
  const totalOutOfPocket = Math.abs(monthlyCashFlow) * 12 * loanTerm; // 計算總自付額

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
        <div className="lg:col-span-4 space-y-4 print-break-inside">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
              <Calculator size={18} /> 資產參數
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
          
          {/* Print Only Parameters */}
          <div className="hidden print-only border p-4 mb-4 rounded border-slate-300">
             <h3 className="font-bold mb-2">房產參數</h3>
             <div className="grid grid-cols-2 gap-2 text-sm"><div>貸款總額：{loanAmount} 萬</div><div>年期：{loanTerm} 年</div><div>貸款利率：{loanRate} %</div><div>配息率：{investReturnRate} %</div></div>
          </div>

          {/* 重要：恢復您原始的詳細分析區塊 */}
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
                     {/* 恢復槓桿效益分析區塊 */}
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

        {/* Visualization */}
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
  const [activeTab, setActiveTab] = useState('gift'); 
  const [toast, setToast] = useState(null);

  // Data State
  const [giftData, setGiftData] = useState({ loanAmount: 100, loanTerm: 7, loanRate: 2.8, investReturnRate: 6 });
  const [estateData, setEstateData] = useState({ loanAmount: 1000, loanTerm: 30, loanRate: 2.2, investReturnRate: 6 });
  const [userProfile, setUserProfile] = useState({ displayName: '', title: '' }); // Simplified Profile
  
  // UI State
  const [savedFiles, setSavedFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isProfileSaving, setIsProfileSaving] = useState(false);

  // --- Auth & Initial Load ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        // Load Profile (Simple Name & Title)
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
      loadFiles(); 
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
      setIsProfileSaving(true);
      try {
        await setDoc(doc(db, "users", user.uid), { profile: newProfile }, { merge: true });
        setUserProfile(newProfile);
        setIsProfileModalOpen(false);
        showToast("顯示名稱已更新", "success");
      } catch (e) { showToast("更新失敗", "error"); }
      finally { setIsProfileSaving(false); }
  };

  const handlePrint = () => {
    window.print();
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
      <PrintStyles />
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Profile Modal */}
      <ProfileModal 
         isOpen={isProfileModalOpen} 
         onClose={() => setIsProfileModalOpen(false)} 
         profile={userProfile} 
         onSave={handleSaveProfile} 
         loading={isProfileSaving}
      />

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
          <div className="text-xs font-bold text-slate-500 px-4 py-2 uppercase tracking-wider">銷售工具</div>
          <NavItem icon={Wallet} label="百萬禮物專案" active={activeTab === 'gift'} onClick={() => setActiveTab('gift')} />
          <NavItem icon={Building2} label="金融房產專案" active={activeTab === 'estate'} onClick={() => setActiveTab('estate')} />
          
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
                 <p className="text-sm text-gray-500">規劃專案：{activeTab === 'gift' ? '百萬禮物專案' : '金融房產專案'}</p>
              </div>
              <div className="text-right">
                 <p className="font-bold">{userProfile.displayName}</p>
                 <p className="text-sm text-gray-500">{userProfile.title}</p>
              </div>
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
           {/* Save Button (Floating) */}
           {(activeTab === 'gift' || activeTab === 'estate') && (
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
           </div>
        </div>
      </main>
    </div>
  );
}