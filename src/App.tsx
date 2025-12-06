import React, { useState, useEffect } from 'react';
import { 
  Wallet, Building2, Coins, Check, ShieldAlert, Menu, X, LogOut, FileBarChart, ArrowUpFromLine, 
  GraduationCap, Umbrella, Waves, Landmark, Lock, Rocket, Car, Loader2,
  Clock, PauseCircle, Calculator, TrendingUp, ShieldCheck, ArrowRight, Target, PiggyBank, CheckCircle2, RefreshCw,
  Gift, Scale, Repeat
} from 'lucide-react';
import { 
  ResponsiveContainer, ComposedChart, Area, Line, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, BarChart, AreaChart 
} from 'recharts';

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// ------------------------------------------------------------------
// 1. Firebase Configuration (整合 src/firebase.ts)
// ------------------------------------------------------------------
const apiKey = "AIzaSyAqS6fhHQVyBNr1LCkCaQPyJ13Rkq7bfHA"; 
const authDomain = "grbt-f87fa.firebaseapp.com";
const projectId = "grbt-f87fa";
const storageBucket = "grbt-f87fa.firebasestorage.app";
const messagingSenderId = "169700005946";
const appId = "1:169700005946:web:9b0722f31aa9fe7ad13d03";

// @ts-ignore
const firebaseConfig = typeof __firebase_config !== 'undefined' 
// @ts-ignore
  ? JSON.parse(__firebase_config) 
  : {
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
const db = getFirestore(app);

// ------------------------------------------------------------------
// 2. Utils (整合 src/utils.ts)
// ------------------------------------------------------------------
const calculateMonthlyPayment = (principal: number, rate: number, years: number) => {
  const p = Number(principal) || 0;
  const rVal = Number(rate) || 0;
  const y = Number(years) || 0;
  const r = rVal / 100 / 12;
  const n = y * 12;
  if (rVal === 0) return (p * 10000) / (n || 1);
  const result = (p * 10000 * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return isNaN(result) ? 0 : result;
};

const calculateMonthlyIncome = (principal: number, rate: number) => {
  const p = Number(principal) || 0;
  const r = Number(rate) || 0;
  return (p * 10000 * (r / 100)) / 12;
};

const calculateRemainingBalance = (principal: number, rate: number, totalYears: number, yearsElapsed: number) => {
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
// 3. Components (整合所有工具元件)
// ------------------------------------------------------------------

// --- [新版] 學貸活化專案 ---
const StudentLoanTool = ({ data, setData }: any) => {
  const safeData = {
    loanAmount: Number(data?.loanAmount) || 40,
    loanRate: 1.775,
    investReturnRate: Number(data?.investReturnRate) || 6,
    years: Number(data?.years) || 8,
    gracePeriod: Number(data?.gracePeriod) || 1,
    interestOnlyPeriod: Number(data?.interestOnlyPeriod) || 0
  };
  const { loanAmount, loanRate, investReturnRate, years, gracePeriod, interestOnlyPeriod } = safeData;
  const totalDuration = gracePeriod + interestOnlyPeriod + years;

  const generateChartData = () => {
    const dataArr = [];
    const initialCapital = loanAmount * 10000; 
    let investmentValue = initialCapital;
    let remainingLoan = loanAmount * 10000;
    for (let year = 1; year <= totalDuration + 2; year++) { 
      investmentValue = investmentValue * (1 + investReturnRate / 100);
      if (year <= gracePeriod) {
         remainingLoan = loanAmount * 10000;
      } else if (year <= gracePeriod + interestOnlyPeriod) {
         remainingLoan = loanAmount * 10000;
      } else if (year <= totalDuration) {
         const repaymentYearIndex = year - (gracePeriod + interestOnlyPeriod);
         remainingLoan = calculateRemainingBalance(loanAmount, loanRate, years, repaymentYearIndex);
      } else {
         remainingLoan = 0;
      }
      dataArr.push({
        year: `第${year}年`,
        投資複利價值: Math.round(investmentValue / 10000),
        淨資產: Math.round((investmentValue - remainingLoan) / 10000),
        若直接繳掉: 0,
      });
    }
    return dataArr;
  };
  
  const monthlyInterestOnly = (loanAmount * 10000 * (loanRate / 100)) / 12; 
  const monthlyPaymentP_I = calculateMonthlyPayment(loanAmount, loanRate, years);
  const finalInvestValue = loanAmount * 10000 * Math.pow((1 + investReturnRate/100), totalDuration);
  const totalCost = (monthlyInterestOnly * 12 * interestOnlyPeriod) + (monthlyPaymentP_I * 12 * years);
  const pureProfit = finalInvestValue - totalCost;

  return (
    <div className="space-y-8 animate-fade-in font-sans text-slate-800">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden print-break-inside">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><GraduationCap size={180} /></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-sm">Financial Strategy</span>
            <span className="bg-green-400/20 text-green-100 px-3 py-1 rounded-full text-xs font-bold tracking-wider backdrop-blur-sm border border-green-400/30">低風險・高流動性</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight flex items-center gap-3">學貸活化專案 <span className="text-lg opacity-70 font-normal mt-2">(原學貸套利)</span></h1>
          <p className="text-blue-100 text-lg opacity-90 max-w-2xl">將學貸從「負債」轉化為人生第一筆「低成本融資」。透過時間差與利差，在還款期間保持資金流動性，創造資產增值。</p>
        </div>
      </div>
      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6 print-break-inside">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2"><Calculator size={20} className="text-blue-600"/> 參數設定</h4>
            <div className="space-y-6">
               <div>
                 <div className="flex justify-between mb-2"><label className="text-sm font-medium text-slate-600">學貸總額 (萬)</label><span className="font-mono font-bold text-blue-600 text-lg">{loanAmount}</span></div>
                 <input type="range" min={10} max={100} step={5} value={loanAmount} onChange={(e) => setData({ ...safeData, loanAmount: Number(e.target.value) })} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
               </div>
               <div>
                 <div className="flex justify-between mb-2"><label className="text-sm font-medium text-slate-600 flex items-center gap-1"><Clock size={14}/> 畢業後寬限期 (年)</label><span className="font-mono font-bold text-cyan-600 text-lg">{gracePeriod} 年</span></div>
                 <input type="range" min={0} max={3} step={1} value={gracePeriod} onChange={(e) => setData({ ...safeData, gracePeriod: Number(e.target.value) })} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
               </div>
               <div>
                 <div className="flex justify-between mb-2"><label className="text-sm font-medium text-slate-600 flex items-center gap-1"><PauseCircle size={14}/> 申請只繳息期 (年)</label><span className="font-mono font-bold text-orange-500 text-lg">{interestOnlyPeriod} 年</span></div>
                 <input type="range" min={0} max={4} step={1} value={interestOnlyPeriod} onChange={(e) => setData({ ...safeData, interestOnlyPeriod: Number(e.target.value) })} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-500" />
               </div>
               <div>
                 <div className="flex justify-between mb-2"><label className="text-sm font-medium text-slate-600">預期年化報酬率 (%)</label><span className="font-mono font-bold text-emerald-600 text-lg">{investReturnRate}</span></div>
                 <input type="range" min={3} max={10} step={0.5} value={investReturnRate} onChange={(e) => setData({ ...safeData, investReturnRate: Number(e.target.value) })} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
               </div>
            </div>
            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-slate-500">目前學貸利率</span><span className="font-bold text-slate-700">{loanRate}%</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">資金活化總期程</span><span className="font-bold text-blue-600">{totalDuration} 年</span></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow border border-slate-200 p-6 flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-cyan-400"></div>
             <div className="text-center mb-4 w-full">
               <div className="flex justify-between items-center mb-2 px-2"><span className="text-slate-500 text-sm">若直接繳掉學費</span><span className="text-slate-400 font-bold text-sm">資產歸零</span></div>
               <div className="w-full h-px bg-slate-100"></div>
             </div>
             <div className="text-center">
               <p className="text-slate-500 text-sm font-medium mb-1">若採用活化專案，{totalDuration}年後淨賺</p>
               <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 font-mono">+${Math.round(pureProfit / 10000)}萬</p>
               <div className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-bold"><TrendingUp size={12}/> 資產增加 {Math.round((pureProfit / (loanAmount*10000)) * 100)}%</div>
             </div>
          </div>
        </div>
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[500px] print-break-inside relative">
            <h4 className="font-bold text-slate-700 mb-4 pl-2 border-l-4 border-blue-500">資產成長趨勢模擬</h4>
            <ResponsiveContainer width="100%" height="90%">
              <ComposedChart data={generateChartData()} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <defs><linearGradient id="colorInvest" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/><stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis unit="萬" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}} itemStyle={{padding: '2px 0'}} />
                <Legend iconType="circle" />
                <Area type="monotone" name="活化專案淨資產" dataKey="淨資產" stroke="#0ea5e9" fill="url(#colorInvest)" strokeWidth={3} />
                <Line type="monotone" name="投資複利總值" dataKey="投資複利價值" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                <Line type="monotone" name="直接繳掉 (資產歸零)" dataKey="若直接繳掉" stroke="#ef4444" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-slate-200 print-break-inside">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2"><RefreshCw className="text-blue-600" size={24} /><h3 className="text-xl font-bold text-slate-800">執行三部曲</h3></div>
          <div className="space-y-3">
             <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm"><div className="mt-1 min-w-[2.5rem] h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">01</div><div><h4 className="font-bold text-slate-800 flex items-center gap-2">保留本金 <Wallet size={16} className="text-slate-400"/></h4><p className="text-sm text-slate-600 mt-1">申請學貸，在寬限期與免息期間不急於償還。將這筆錢視為您的「種子基金」。</p></div></div>
             <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm"><div className="mt-1 min-w-[2.5rem] h-10 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">02</div><div><h4 className="font-bold text-slate-800 flex items-center gap-2">穩健投資 <TrendingUp size={16} className="text-slate-400"/></h4><p className="text-sm text-slate-600 mt-1">投入高活存數位帳戶或低波動 ETF，獲取大於學貸利率 (1.65%) 的報酬，賺取無風險利差。</p></div></div>
             <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm"><div className="mt-1 min-w-[2.5rem] h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">03</div><div><h4 className="font-bold text-slate-800 flex items-center gap-2">分期還款 <ShieldCheck size={16} className="text-slate-400"/></h4><p className="text-sm text-slate-600 mt-1">利用投資收益或本金分期繳納。這不僅減輕壓力，更重要的是能建立良好的銀行信用紀錄。</p></div></div>
          </div>
        </div>
        <div className="space-y-4">
           <div className="flex items-center gap-2 mb-2"><PiggyBank className="text-blue-600" size={24} /><h3 className="text-xl font-bold text-slate-800">專案四大效益</h3></div>
           <div className="grid grid-cols-1 gap-3">
              {[
                { title: "信用加分", desc: "透過長期按時還款，在聯徵中心建立完美的信用履歷，有利未來房貸/信貸條件。" },
                { title: "無風險利差", desc: "利用數位帳戶高利活存（約 2%）與學貸低利（約 1.775%）間的差距獲利。" },
                { title: "緊急預備金", desc: "不一次將現金還光，手邊隨時保有數十萬的可動用資金，以備不時之需。" },
                { title: "理財紀律", desc: "養成「分離帳戶」與「專款專用」的習慣，是理財新手的最佳實戰演練。" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-blue-50/50 transition-colors"><CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20} /><div><h4 className="font-bold text-slate-800">{item.title}</h4><p className="text-sm text-slate-600 mt-1 leading-relaxed">{item.desc}</p></div></div>
              ))}
           </div>
           <div className="mt-6 p-4 bg-slate-800 rounded-xl text-center shadow-lg"><p className="text-slate-300 italic text-sm">「學貸活化專案不是為了讓你不還錢，而是讓你用更聰明的方式，把負債變成人生第一筆投資本金。」</p></div>
        </div>
      </div>
    </div>
  );
};

// --- [新版] 百萬禮物專案 ---
const MillionDollarGiftTool = ({ data, setData }: any) => {
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
  const phase3_NetOut = monthlyLoanPayment - (monthlyInvestIncomeSingle * 3);
  const standardMonthlySaving = (targetAmount * 10000) / (15 * 12); 

  const generateChartData = () => {
    const dataArr = [];
    let cumulativeStandard = 0;
    let cumulativeProjectCost = 0;
    let projectAssetValue = 0;
    for (let year = 1; year <= 15; year++) {
      cumulativeStandard += standardMonthlySaving * 12;
      if (year <= 7) {
        cumulativeProjectCost += phase1_NetOut * 12;
        projectAssetValue = loanAmount * 10000;
      } else if (year <= 14) {
        cumulativeProjectCost += phase2_NetOut * 12;
        projectAssetValue = loanAmount * 2 * 10000;
      } else {
        cumulativeProjectCost += phase3_NetOut * 12; 
        projectAssetValue = loanAmount * 3 * 10000;
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

  const updateField = (field: string, value: number) => { setData({ ...safeData, [field]: value }); };

  return (
    <div className="space-y-8 animate-fade-in font-sans text-slate-800">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden print-break-inside">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><Gift size={180} /></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3"><span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-sm">Asset Accumulation</span><span className="bg-yellow-400/20 text-yellow-100 px-3 py-1 rounded-full text-xs font-bold tracking-wider backdrop-blur-sm border border-yellow-400/30">循環槓桿・資產倍增</span></div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight flex items-center gap-3">百萬禮物專案</h1>
          <p className="text-indigo-100 text-lg opacity-90 max-w-2xl">透過三次循環操作，用時間換取 {targetAmount} 萬資產。送給未來的自己，或是孩子最棒的成年禮。</p>
        </div>
      </div>
      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6 print-break-inside">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2"><Calculator size={20} className="text-indigo-600"/> 參數設定</h4>
            <div className="space-y-6">
               {[
                 { label: "單次借貸額度 (萬)", field: "loanAmount", min: 50, max: 500, step: 10, val: loanAmount, color: "blue" },
                 { label: "信貸利率 (%)", field: "loanRate", min: 1.5, max: 15.0, step: 0.1, val: loanRate, color: "indigo" },
                 { label: "投資配息率 (%)", field: "investReturnRate", min: 3, max: 12, step: 0.5, val: investReturnRate, color: "purple" }
               ].map((item) => (
                 <div key={item.field}><div className="flex justify-between mb-2"><label className="text-sm font-medium text-slate-600">{item.label}</label><span className={`font-mono font-bold text-${item.color}-600 text-lg`}>{item.val}</span></div><input type="range" min={item.min} max={item.max} step={item.step} value={item.val} onChange={(e) => updateField(item.field, Number(e.target.value))} className={`w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-${item.color}-600`} /></div>
               ))}
            </div>
            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-4"><div><div className="text-xs text-slate-500 mb-1">總目標資產</div><div className="text-lg font-bold text-indigo-600">{targetAmount} 萬</div></div><div><div className="text-xs text-slate-500 mb-1">專案總時程</div><div className="text-lg font-bold text-slate-700">15 年</div></div></div>
          </div>
          <div className="bg-white rounded-2xl shadow border border-slate-200 p-6 print-break-inside">
              <div className="text-sm text-slate-500 mb-4 text-center">若用一般存錢，每月需存 <span className="line-through decoration-slate-400 font-bold ml-1">${Math.round(standardMonthlySaving).toLocaleString()}</span></div>
              <div className="space-y-4 bg-indigo-50/50 p-5 rounded-xl border border-indigo-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-100 rounded-bl-full -mr-8 -mt-8 opacity-50"></div>
                <div className="flex justify-between items-center text-sm"><span className="text-slate-600 font-medium">1. 信貸每月還款</span><span className="text-red-500 font-bold font-mono">-${Math.round(monthlyLoanPayment).toLocaleString()}</span></div>
                <div className="flex justify-between items-center text-sm"><span className="text-slate-600 font-medium">2. 扣除每月配息</span><span className="text-green-600 font-bold font-mono">+${Math.round(monthlyInvestIncomeSingle).toLocaleString()}</span></div>
                <div className="border-t border-indigo-200 my-2 border-dashed"></div>
                <div className="flex justify-between items-end"><span className="text-indigo-800 font-bold">3. 實質每月應負</span><span className="text-3xl font-black text-indigo-600 font-mono">${Math.round(phase1_NetOut).toLocaleString()}</span></div>
              </div>
              <div className="mt-4 text-center"><div className="text-xs bg-green-100 text-green-700 py-1.5 px-3 rounded-full inline-flex items-center gap-1 font-bold"><TrendingUp size={12}/> 每月省下 ${Math.round(standardMonthlySaving - phase1_NetOut).toLocaleString()}</div></div>
          </div>
        </div>
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[500px] print-break-inside relative">
             <h4 className="font-bold text-slate-700 mb-4 pl-2 border-l-4 border-indigo-500">資產累積三階段</h4>
            <ResponsiveContainer width="100%" height="90%">
              <ComposedChart data={generateChartData()} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <defs><linearGradient id="colorAssetGift" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis unit="萬" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}} itemStyle={{padding: '2px 0'}} />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="專案持有資產" stroke="#6366f1" fill="url(#colorAssetGift)" strokeWidth={3} />
                <Bar dataKey="一般存錢成本" fill="#cbd5e1" barSize={12} radius={[4,4,0,0]} />
                <Line type="monotone" dataKey="專案實付成本" stroke="#f59e0b" strokeWidth={3} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-slate-200 print-break-inside">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2"><RefreshCw className="text-indigo-600" size={24} /><h3 className="text-xl font-bold text-slate-800">執行三部曲 (15年計畫)</h3></div>
          <div className="space-y-3">
             <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm"><div className="mt-1 min-w-[3rem] h-12 rounded-xl bg-blue-50 text-blue-600 flex flex-col items-center justify-center font-bold text-xs"><span className="text-lg">01</span><span>啟動</span></div><div><h4 className="font-bold text-slate-800 flex items-center gap-2">累積期 (第1-7年)</h4><p className="text-sm text-slate-600 mt-1">借入第一筆資金，投入配息商品。配息幫忙繳部分貸款，您只需負擔差額，無痛累積第一桶金。</p></div></div>
             <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm"><div className="mt-1 min-w-[3rem] h-12 rounded-xl bg-indigo-50 text-indigo-600 flex flex-col items-center justify-center font-bold text-xs"><span className="text-lg">02</span><span>成長</span></div><div><h4 className="font-bold text-slate-800 flex items-center gap-2">循環期 (第8-14年)</h4><p className="text-sm text-slate-600 mt-1">第一筆還完後再次借出，資產翻倍。此時雙份配息讓您的月付金大幅降低，甚至接近零。</p></div></div>
             <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm"><div className="mt-1 min-w-[3rem] h-12 rounded-xl bg-purple-50 text-purple-600 flex flex-col items-center justify-center font-bold text-xs"><span className="text-lg">03</span><span>收割</span></div><div><h4 className="font-bold text-slate-800 flex items-center gap-2">收穫期 (第15年起)</h4><p className="text-sm text-slate-600 mt-1">第三次操作，資產達標。三份配息通常已超過貸款月付，開始產生正向現金流，或選擇結清享受成果。</p></div></div>
          </div>
        </div>
        <div className="space-y-4">
           <div className="flex items-center gap-2 mb-2"><Target className="text-indigo-600" size={24} /><h3 className="text-xl font-bold text-slate-800">專案四大效益</h3></div>
           <div className="grid grid-cols-1 gap-3">
              {[
                { title: "時間槓桿", desc: "不需等到存夠錢才投資，直接借入未來財富，讓複利效應提早7年啟動。" },
                { title: "強迫儲蓄", desc: "將「隨意花費」轉為「固定還款」，每月收到帳單就是最好的存錢提醒。" },
                { title: "無痛累積", desc: "利用配息Cover大部分還款，用比一般存錢更少的現金流，換取更大的資產。" },
                { title: "信用培養", desc: "長達15年的優良還款紀錄，將使您成為銀行眼中的頂級優質客戶。" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-indigo-50/50 transition-colors"><CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20} /><div><h4 className="font-bold text-slate-800">{item.title}</h4><p className="text-sm text-slate-600 mt-1 leading-relaxed">{item.desc}</p></div></div>
              ))}
           </div>
           <div className="mt-6 p-4 bg-slate-800 rounded-xl text-center shadow-lg"><p className="text-slate-300 italic text-sm">「給孩子的不是一筆錢，而是一套會長大的資產，以及受用一生的理財智慧。」</p></div>
        </div>
      </div>
    </div>
  );
};

// --- [新版] 金融房產專案 ---
const FinancialRealEstateTool = ({ data, setData }: any) => {
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
  const totalOutOfPocket = isNegativeCashFlow ? Math.abs(monthlyCashFlow) * 12 * loanTerm : 0;
  
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

  const updateField = (field: string, value: number) => { setData({ ...safeData, [field]: value }); };

  return (
    <div className="space-y-8 animate-fade-in font-sans text-slate-800">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden print-break-inside">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><Building2 size={180} /></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3"><span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-sm">Passive Income</span><span className="bg-orange-400/20 text-orange-100 px-3 py-1 rounded-full text-xs font-bold tracking-wider backdrop-blur-sm border border-orange-400/30">以息養貸・數位包租公</span></div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight flex items-center gap-3">金融房產專案</h1>
          <p className="text-emerald-100 text-lg opacity-90 max-w-2xl">利用長年期低利貸款，打造不需修繕、不需找房客的「數位房地產」。讓配息自動幫您繳房貸。</p>
        </div>
      </div>
      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6 print-break-inside">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2"><Calculator size={20} className="text-emerald-600"/> 參數設定</h4>
            <div className="space-y-6">
               {[
                 { label: "資產/貸款總額 (萬)", field: "loanAmount", min: 500, max: 3000, step: 100, val: loanAmount, color: "emerald" },
                 { label: "貸款年期 (年)", field: "loanTerm", min: 20, max: 40, step: 1, val: loanTerm, color: "teal" },
                 { label: "貸款利率 (%)", field: "loanRate", min: 1.5, max: 4.0, step: 0.1, val: loanRate, color: "emerald" },
                 { label: "投資配息率 (%)", field: "investReturnRate", min: 3, max: 10, step: 0.5, val: investReturnRate, color: "blue" }
               ].map((item) => (
                 <div key={item.field}><div className="flex justify-between mb-2"><label className="text-sm font-medium text-slate-600">{item.label}</label><span className={`font-mono font-bold text-${item.color}-600 text-lg`}>{item.val}</span></div><input type="range" min={item.min} max={item.max} step={item.step} value={item.val} onChange={(e) => updateField(item.field, Number(e.target.value))} className={`w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-${item.color}-600`} /></div>
               ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow border border-slate-200 p-6 print-break-inside">
              <h3 className="text-center font-bold text-slate-700 mb-4 flex items-center justify-center gap-2"><Scale size={18}/> 每月現金流試算</h3>
              <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center text-sm"><span className="text-slate-600 font-medium">1. 每月配息收入</span><span className="font-mono text-emerald-600 font-bold">+${Math.round(monthlyInvestIncome).toLocaleString()}</span></div>
                <div className="flex justify-between items-center text-sm"><span className="text-slate-600 font-medium">2. 扣除貸款支出</span><span className="font-mono text-red-500 font-bold">-${Math.round(monthlyLoanPayment).toLocaleString()}</span></div>
                <div className="border-t border-slate-200 my-2"></div>
                {isNegativeCashFlow ? (
                   <div className="text-center animate-pulse-soft">
                     <div className="text-xs text-slate-400 mb-1">每月需自行負擔</div>
                     <div className="text-4xl font-black text-red-500 font-mono">-${Math.abs(Math.round(monthlyCashFlow)).toLocaleString()}</div>
                     <div className="mt-4 bg-orange-50 rounded-lg p-3 border border-orange-100"><div className="text-xs text-orange-800 font-bold mb-1">槓桿效益分析</div><div className="text-xs text-orange-700">總共只付出 <span className="font-bold underline">${Math.round(totalOutOfPocket/10000)}萬</span></div><div className="text-xs text-orange-700">換取 <span className="font-bold text-lg">${loanAmount}萬</span> 原始資產</div></div>
                   </div>
                ) : (
                   <div className="text-center">
                     <div className="text-xs text-slate-400 mb-1">每月淨現金流</div>
                     <div className="text-4xl font-black text-emerald-600 font-mono">+${Math.round(monthlyCashFlow).toLocaleString()}</div>
                     <div className="mt-4 bg-emerald-100 rounded-lg p-2 text-xs text-emerald-800 font-bold">🎉 完全由資產養貸，還有找！</div>
                   </div>
                )}
              </div>
          </div>
        </div>
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[500px] print-break-inside relative">
             <h4 className="font-bold text-slate-700 mb-4 pl-2 border-l-4 border-emerald-500">資產淨值成長模擬</h4>
            <ResponsiveContainer width="100%" height="90%">
              <ComposedChart data={generateHouseChartData()} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <defs><linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis unit="萬" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}} itemStyle={{padding: '2px 0'}} />
                <Legend iconType="circle" />
                <Area type="monotone" name="總資產價值" dataKey="總資產價值" stroke="#10b981" fill="url(#colorWealth)" strokeWidth={3} />
                <Line type="monotone" name="剩餘貸款餘額" dataKey="剩餘貸款" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-slate-200 print-break-inside">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2"><RefreshCw className="text-emerald-600" size={24} /><h3 className="text-xl font-bold text-slate-800">執行三部曲</h3></div>
          <div className="space-y-3">
             <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-emerald-200 transition-colors"><div className="mt-1 min-w-[3rem] h-12 rounded-xl bg-emerald-50 text-emerald-600 flex flex-col items-center justify-center font-bold text-xs"><span className="text-lg">01</span><span>建置</span></div><div><h4 className="font-bold text-slate-800 flex items-center gap-2">建置期 (第1年)</h4><p className="text-sm text-slate-600 mt-1">透過銀行融資取得大筆資金，單筆投入穩健配息資產。就像買房出租，但省去頭期款與管理麻煩。</p></div></div>
             <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-teal-200 transition-colors"><div className="mt-1 min-w-[3rem] h-12 rounded-xl bg-teal-50 text-teal-600 flex flex-col items-center justify-center font-bold text-xs"><span className="text-lg">02</span><span>持守</span></div><div><h4 className="font-bold text-slate-800 flex items-center gap-2">持守期 (第2-{loanTerm}年)</h4><p className="text-sm text-slate-600 mt-1">讓資產產生的配息自動償還貸款本息。您只需補貼少許差額(甚至有找)，時間是您最好的朋友。</p></div></div>
             <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-green-200 transition-colors"><div className="mt-1 min-w-[3rem] h-12 rounded-xl bg-green-50 text-green-600 flex flex-col items-center justify-center font-bold text-xs"><span className="text-lg">03</span><span>自由</span></div><div><h4 className="font-bold text-slate-800 flex items-center gap-2">自由期 (期滿)</h4><p className="text-sm text-slate-600 mt-1">貸款完全清償。此刻起，這筆千萬資產與每月的配息收入完全屬於您，成為真正的被動收入。</p></div></div>
          </div>
        </div>
        <div className="space-y-4">
           <div className="flex items-center gap-2 mb-2"><Landmark className="text-emerald-600" size={24} /><h3 className="text-xl font-bold text-slate-800">專案四大效益</h3></div>
           <div className="grid grid-cols-1 gap-3">
              {[
                { title: "數位包租公", desc: "如同擁有房產收租，但沒有空租期、修繕費、稅金與惡房客的煩惱。" },
                { title: "抗通膨", desc: "利用負債對抗通膨。隨著時間推移，貨幣貶值，您償還的貸款實質價值在下降，但資產在增值。" },
                { title: "資產擁有權", desc: "與租房不同，付出的每一分錢最後都換來實實在在的資產，而不只是消費。" },
                { title: "極低門檻", desc: "不需要數百萬頭期款，只需良好的信用與穩定的現金流即可啟動千萬資產計畫。" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-emerald-50/50 transition-colors"><CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20} /><div><h4 className="font-bold text-slate-800">{item.title}</h4><p className="text-sm text-slate-600 mt-1 leading-relaxed">{item.desc}</p></div></div>
              ))}
           </div>
           <div className="mt-6 p-4 bg-slate-800 rounded-xl text-center shadow-lg"><p className="text-slate-300 italic text-sm">「富人買資產，窮人買負債，中產階級買他們以為是資產的負債。金融房產，是真正的資產。」</p></div>
        </div>
      </div>
    </div>
  );
};

// --- 其他標準元件 ---
const SuperActiveSavingTool = ({ data, setData }: any) => {
  const safeData = { monthlySaving: Number(data?.monthlySaving)||10000, investReturnRate: Number(data?.investReturnRate)||6, activeYears: Number(data?.activeYears)||15, totalYears: 40 };
  const fullChartData = [];
  let pAcc = 0; let aInv = 0;
  for (let year = 1; year <= safeData.totalYears; year++) {
      pAcc += safeData.monthlySaving * 12;
      if (year <= safeData.activeYears) aInv = (aInv + safeData.monthlySaving * 12) * (1 + safeData.investReturnRate / 100);
      else aInv = aInv * (1 + safeData.investReturnRate / 100);
      fullChartData.push({ year: `第${year}年`, 消極存錢: Math.round(pAcc / 10000), 積極存錢: Math.round(aInv / 10000) });
  }
  return <div className="space-y-6"><div className="bg-purple-600 text-white p-6 rounded-2xl"><h3 className="font-bold">超積極存錢法</h3><p>辛苦{safeData.activeYears}年，換來提早退休。</p></div><div className="h-[300px]"><ResponsiveContainer><ComposedChart data={