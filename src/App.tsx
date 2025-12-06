import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wallet, Building2, Calculator, Coins, CheckCircle2, Scale, Save, FileText, Menu, X, Trash2, LogOut, User as UserIcon, Settings, Loader2, ArrowUpFromLine, Check, ShieldAlert, Edit3, GraduationCap, Umbrella, Waves, Landmark, Lock, TrendingUp, Clock, PauseCircle, Rocket, Car, Repeat, HeartHandshake, Droplets, AlertTriangle, FileBarChart, PieChart
} from 'lucide-react';
import { 
  BarChart, AreaChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area, Line 
} from 'recharts';

// --- Firebase 模組整合 ---
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, initializeFirestore, memoryLocalCache } from 'firebase/firestore';

// ============================================================================
// #REGION: CONFIG & MATH HELPERS
// ============================================================================

const apiKey = "AIzaSyAqS6fhHQVyBNr1LCkCaQPyJ13Rkq7bfHA"; 
const authDomain = "grbt-f87fa.firebaseapp.com";
const projectId = "grbt-f87fa";
const storageBucket = "grbt-f87fa.firebasestorage.app";
const messagingSenderId = "169700005946";
const appId = "1:169700005946:web:9b0722f31aa9fe7ad13d03";

const firebaseConfig = { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId, measurementId: "G-58N4KK9M5W" };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = initializeFirestore(app, { experimentalForceLongPolling: true, localCache: memoryLocalCache() });

// 通用數學函式
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

// ============================================================================
// #REGION: REPORT GENERATION LOGIC
// ============================================================================

// 將報表邏輯獨立出來，減少組件負擔
const getReportData = (activeTab, data) => {
  let reportContent = { title: '', mindMap: [], table: [], highlights: [], chartData: [], chartType: 'composed' };

  if (activeTab === 'gift') {
    const loan = data.loanAmount;
    const monthlyLoanPayment = calculateMonthlyPayment(loan, data.loanRate, data.loanTerm);
    const monthlyInvestIncomeSingle = calculateMonthlyIncome(loan, data.investReturnRate);
    const phase1_NetOut = monthlyLoanPayment - monthlyInvestIncomeSingle;
    const standardMonthlySaving = 3000000 / (15 * 12); 

    const chartData = [];
    let cumulativeStandard = 0;
    let cumulativeProjectCost = 0;
    let projectAssetValue = 0;
    const phase2_NetOut = monthlyLoanPayment - (monthlyInvestIncomeSingle * 2);
    const phase3_NetOut = monthlyLoanPayment - (monthlyInvestIncomeSingle * 3);

    for (let year = 1; year <= 15; year++) {
      cumulativeStandard += standardMonthlySaving * 12;
      if (year <= 7) {
        cumulativeProjectCost += phase1_NetOut * 12;
        projectAssetValue = loan * 10000;
      } else if (year <= 14) {
        cumulativeProjectCost += phase2_NetOut * 12;
        projectAssetValue = loan * 2 * 10000;
      } else {
        cumulativeProjectCost += phase3_NetOut * 12; 
        projectAssetValue = loan * 3 * 10000;
      }
      chartData.push({
        year: `第${year}年`,
        一般存錢成本: Math.round(cumulativeStandard / 10000),
        專案實付成本: Math.round(cumulativeProjectCost / 10000),
        專案持有資產: Math.round(projectAssetValue / 10000),
      });
    }

    reportContent = {
      title: '百萬禮物專案',
      mindMap: [
        { label: '核心策略', value: '以息養貸' },
        { label: '投入資源', value: `信貸 ${loan} 萬` },
        { label: '預期成果', value: `資產 300 萬` },
        { label: '人生意義', value: '第一桶金' }
      ],
      table: [
        { label: '第 1-7 年', col1: '啟動期 (100萬)', col2: '建立信用與資產' },
        { label: '第 8-14 年', col1: '循環期 (200萬)', col2: '資產翻倍' },
        { label: '第 15 年', col1: '收割期 (300萬)', col2: '配息完全覆蓋' },
      ],
      highlights: [
        `每月僅需負擔約 $${Math.round(phase1_NetOut).toLocaleString()}，比一般存錢更輕鬆。`,
        '善用銀行低利資金，用時間換取資產增值。',
        '透過三次循環，15年後無痛擁有300萬資產。'
      ],
      chartData: chartData,
      chartType: 'composed_gift'
    };
  } else if (activeTab === 'estate') {
    const loan = data.loanAmount;
    const monthlyLoanPayment = calculateMonthlyPayment(loan, data.loanRate, data.loanTerm);
    const monthlyInvestIncome = calculateMonthlyIncome(loan, data.investReturnRate);
    const monthlyCashFlow = monthlyInvestIncome - monthlyLoanPayment;
    const isNegativeCashFlow = monthlyCashFlow < 0;
    const totalOutOfPocket = Math.abs(monthlyCashFlow) * 12 * data.loanTerm;

    const chartData = [];
    let cumulativeNetIncome = 0; 
    for (let year = 1; year <= data.loanTerm; year++) {
      cumulativeNetIncome += monthlyCashFlow * 12;
      const remainingLoan = calculateRemainingBalance(loan, data.loanRate, data.loanTerm, year);
      const assetEquity = (loan * 10000) - remainingLoan;
      const financialTotalWealth = assetEquity + cumulativeNetIncome;
      const step = data.loanTerm > 20 ? 3 : 1; 
      if (year === 1 || year % step === 0 || year === data.loanTerm) {
         chartData.push({ year: `第${year}年`, 總資產價值: Math.round(financialTotalWealth / 10000), 剩餘貸款: Math.round(remainingLoan / 10000) });
      }
    }

    reportContent = {
      title: '金融房產專案',
      mindMap: [
        { label: '核心策略', value: '數位包租公' },
        { label: '資產規模', value: `${loan} 萬` },
        { label: '現金流', value: `月${isNegativeCashFlow ? '付' : '領'} ${Math.abs(Math.round(monthlyCashFlow)).toLocaleString()}` },
        { label: '最終歸屬', value: '資產全拿' }
      ],
      table: [
        { label: '第 1 年', col1: '建置期', col2: '現金流啟動' },
        { label: `第 ${Math.round(data.loanTerm/2)} 年`, col1: '持守期', col2: '還款過半' },
        { label: `第 ${data.loanTerm} 年`, col1: '自由期', col2: `擁有 ${loan} 萬` },
      ],
      highlights: isNegativeCashFlow ? [
        `槓桿效益驚人：${data.loanTerm}年總自付約 ${Math.round(totalOutOfPocket/10000)} 萬，卻換取 ${loan} 萬資產。`,
        `如同買房，房客(配息)幫您繳了大部分房貸(本息)。`,
        `用小錢換大資產，強迫儲蓄的最佳工具。`
      ] : [
        '以息養貸，完全無需自掏腰包。',
        '每月還能創造額外現金流，生活品質提升。'
      ],
      chartData: chartData,
      chartType: 'composed_estate'
    };
  } else if (activeTab === 'student') {
     const profit = Math.round(data.loanAmount * 10000 * Math.pow((1 + data.investReturnRate/100), data.years + data.gracePeriod) - (calculateMonthlyPayment(data.loanAmount, 1.775, data.years) * 12 * data.years));
     const totalDuration = data.gracePeriod + data.interestOnlyPeriod + data.years;
     const chartData = [];
     let investmentValue = data.loanAmount * 10000;
     let remainingLoan = data.loanAmount * 10000;
     for (let year = 1; year <= totalDuration + 2; year++) { 
        investmentValue = investmentValue * (1 + data.investReturnRate / 100);
        if (year <= data.gracePeriod + data.interestOnlyPeriod) remainingLoan = data.loanAmount * 10000;
        else if (year <= totalDuration) remainingLoan = calculateRemainingBalance(data.loanAmount, 1.775, data.years, year - (data.gracePeriod + data.interestOnlyPeriod));
        else remainingLoan = 0;
        chartData.push({
            year: `第${year}年`,
            投資複利價值: Math.round(investmentValue / 10000),
            淨資產: Math.round((investmentValue - remainingLoan) / 10000),
            若直接繳掉: 0,
        });
     }
     reportContent = {
      title: '學貸套利專案',
      mindMap: [
        { label: '核心策略', value: '低利套利' },
        { label: '學貸金額', value: `${data.loanAmount} 萬` },
        { label: '淨獲利', value: `${Math.round(profit/10000)} 萬` },
        { label: '人生意義', value: '理財紀律' }
      ],
      table: [
        { label: '辦理學貸時', col1: '投入期', col2: '啟動投資規劃' }, 
        { label: '寬限結束', col1: '還款期', col2: '以息繳貸' },
        { label: '8 年後', col1: '無債期', col2: '多賺一筆' },
      ],
      highlights: ['學費不繳掉，轉為資產種子。', '不急著還本金，讓時間複利為您工作。', '畢業即擁有人生第一桶金。'],
      chartData: chartData,
      chartType: 'composed_student'
    };
  } else if (activeTab === 'super_active') {
    const chartData = [];
    let pAcc = 0; 
    let aInv = 0; 
    const totalYears = 40;
    for (let year = 1; year <= totalYears; year++) {
        pAcc += data.monthlySaving * 12;
        if (year <= data.activeYears) aInv = (aInv + data.monthlySaving * 12) * (1 + data.investReturnRate / 100);
        else aInv = aInv * (1 + data.investReturnRate / 100);
        chartData.push({ year: `第${year}年`, 消極存錢: Math.round(pAcc / 10000), 積極存錢: Math.round(aInv / 10000) });
    }
    const finalAsset = Math.round(chartData[39].積極存錢);
    reportContent = {
      title: '超積極存錢法',
      mindMap: [
        { label: '核心策略', value: '複利滾存' },
        { label: '努力期間', value: `${data.activeYears} 年` },
        { label: '30年資產', value: `約 ${finalAsset} 萬` },
        { label: '人生意義', value: '提早退休' }
      ],
      table: [
        { label: `第 ${data.activeYears} 年`, col1: '投入結束', col2: '本金到位' },
        { label: `第 20 年`, col1: '滾存期', col2: '資產翻倍' },
        { label: `第 30 年`, col1: '爆發期', col2: '財富自由' },
      ],
      highlights: ['關鍵效益：相比苦存40年，您只需專注存錢15年。', '利用複利效應，大幅減少本金投入。', '提早達成財務目標。'],
      chartData: chartData,
      chartType: 'composed_active'
    };
  } else if (activeTab === 'car') {
    const cycles = [];
    let policyPrincipal = data.carPrice * 1; 
    const loanAmount = data.carPrice - 20;
    const loanMonthlyPayment = loanAmount * (14500/80); 
    for(let i=1; i<=3; i++) {
        const monthlyDividend = (policyPrincipal * 10000 * (data.investReturnRate/100)) / 12;
        const netMonthlyPayment = loanMonthlyPayment - monthlyDividend;
        cycles.push({
            cycle: `第 ${i} 台車`,
            principal: Math.round(policyPrincipal),
            dividend: Math.round(monthlyDividend),
            originalPay: Math.round(loanMonthlyPayment),
            netPay: Math.round(netMonthlyPayment)
        });
        const resaleValue = data.carPrice * (data.resaleRate/100);
        policyPrincipal += (resaleValue - 20);
    }
    reportContent = {
      title: '五年換車專案',
      mindMap: [
        { label: '核心策略', value: '資金回流' },
        { label: '目標車價', value: `${data.carPrice} 萬` },
        { label: '負擔趨勢', value: '逐次遞減' },
        { label: '人生意義', value: '生活品質' }
      ],
      table: [
        { label: '第 1 台', col1: '建立本金', col2: '負擔較重' },
        { label: '第 2 台', col1: '配息折抵', col2: '負擔減輕' },
        { label: '第 3 台', col1: '資產滾大', col2: '幾近免費' },
      ],
      highlights: ['打破買車即負債的傳統觀念。', '透過「舊車換新車」的資金回流。', '維持生活品質，每五年輕鬆換新車。'],
      chartData: cycles,
      chartType: 'composed_car'
    };
  } else if (activeTab === 'reservoir') {
    const chartData = [];
    const annualDividend = data.initialCapital * (data.dividendRate / 100);
    let reinvestedTotal = 0; 
    for (let year = 1; year <= data.years + 5; year++) {
      if (year <= data.years) reinvestedTotal = (reinvestedTotal + annualDividend) * (1 + data.reinvestRate / 100);
      else reinvestedTotal = reinvestedTotal * (1 + data.reinvestRate / 100);
      chartData.push({ year: `第${year}年`, 大水庫本金: data.initialCapital, 小水庫累積: Math.round(reinvestedTotal) });
    }
    reportContent = {
      title: '大小水庫專案',
      mindMap: [
        { label: '核心策略', value: '資產活化' },
        { label: '大水庫', value: `${data.initialCapital} 萬` },
        { label: '小水庫', value: '配息再投' },
        { label: '人生意義', value: '資產傳承' }
      ],
      table: [
        { label: '第 1 年', col1: '啟動期', col2: '建立水管' },
        { label: `第 ${Math.round(data.years/2)} 年`, col1: '累積期', col2: '小水庫成形' },
        { label: `第 ${data.years} 年`, col1: '收割期', col2: '資產翻倍' },
      ],
      highlights: ['完全不需要再拿錢出來，只需搬運配息。', '母金不動，僅用孳息創造第二桶金。', '零風險資產倍增術。'],
      chartData: chartData,
      chartType: 'area_reservoir'
    };
  } else if (activeTab === 'pension') {
     const laborInsBase = Math.min(Math.max(data.salary, 26400), 45800); 
     const laborInsMonthly = laborInsBase * data.laborInsYears * 0.0155;
     const monthlyContribution = Math.min(data.salary, 150000) * (0.06 + (data.selfContribution ? 0.06 : 0));
     const monthsToRetire = (data.retireAge - data.currentAge) * 12;
     const monthlyRate = data.pensionReturnRate / 100 / 12;
     const pensionTotal = monthlyContribution * ((Math.pow(1 + monthlyRate, monthsToRetire) - 1) / monthlyRate);
     const pensionMonthly = pensionTotal / 240; 
     const gap = data.desiredMonthlyIncome - (laborInsMonthly + pensionMonthly);
     reportContent = {
      title: '退休缺口試算',
      mindMap: [
        { label: '核心策略', value: '補足缺口' },
        { label: '理想月退', value: `${data.desiredMonthlyIncome}` },
        { label: '財務缺口', value: `每月 ${Math.abs(Math.round(gap))}` },
        { label: '人生意義', value: '尊嚴養老' }
      ],
      table: [
        { label: '60 歲', col1: '退休前', col2: '最後衝刺' },
        { label: '65 歲', col1: '退休時', col2: '開始領錢' },
        { label: '85 歲', col1: '長壽風險', col2: '現金流不斷' },
      ],
      highlights: ['政府退休金僅能維持基本溫飽。', `勞退自提讓您的退休金翻倍！`, '提早規劃，用時間複利填補缺口。'],
      chartData: [
        { name: '勞保年金', value: Math.round(laborInsMonthly), fill: '#3b82f6' },
        { name: '勞退月領', value: Math.round(pensionMonthly), fill: '#10b981' },
        { name: '退休缺口', value: Math.max(0, Math.round(gap)), fill: '#ef4444' },
      ],
      chartType: 'bar_pension'
    };
  } else if (activeTab === 'tax') {
     const totalAssets = data.cash + data.realEstate + data.stocks;
     const exemption = 1333 + (data.spouse ? 553 : 0) + (data.children * 56) + (data.parents * 138) + 138;
     const netEstateRaw = Math.max(0, totalAssets - exemption);
     const netEstatePlanned = Math.max(0, Math.max(0, totalAssets - data.insurancePlan) - exemption);
     const calculateTax = (net) => { if (net <= 5000) return net * 0.1; if (net <= 10000) return net * 0.15 - 250; return net * 0.2 - 750; };
     const taxRaw = calculateTax(netEstateRaw);
     const taxPlanned = calculateTax(netEstatePlanned);
     reportContent = {
      title: '稅務傳承專案',
      mindMap: [
        { label: '核心策略', value: '預留稅源' },
        { label: '資產總額', value: `${totalAssets} 萬` },
        { label: '節稅效益', value: '資產保全' },
        { label: '人生意義', value: '富過三代' }
      ],
      table: [
        { label: '規劃前', col1: '遺產淨額高', col2: '稅金沉重' },
        { label: '規劃後', col1: '善用免稅額', col2: '稅金銳減' },
        { label: '傳承時', col1: '現金足夠', col2: '無痛繳稅' },
      ],
      highlights: ['善用保險給付免稅額度(3330萬)。', '預留現金稅源，避免子孫變賣家產繳稅。', '注意實質課稅原則。'],
      chartData: [{ name: '未規劃稅金', value: Math.round(taxRaw), fill: '#ef4444' }, { name: '規劃後稅金', value: Math.round(taxPlanned), fill: '#3b82f6' }],
      chartType: 'bar_tax'
    };
  }
  return reportContent;
};

// ============================================================================
// #REGION: REPORT MODAL COMPONENT
// ============================================================================

const ReportModal = ({ isOpen, onClose, user, activeTab, data }) => {
  const [customerName, setCustomerName] = useState('');
  if (!isOpen) return null;
  const dateStr = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const reportContent = useMemo(() => getReportData(activeTab, data), [activeTab, data]);

  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-fade-in overflow-auto" id="report-modal">
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md print-hidden-bar sticky top-0 z-50">
        <div className="font-bold text-lg"><FileBarChart className="inline-block mr-2"/> 規劃報告預覽</div>
        <div className="flex gap-3">
           <input type="text" placeholder="輸入客戶姓名" value={customerName} onChange={e => setCustomerName(e.target.value)} className="px-3 py-1.5 rounded text-slate-900 outline-none text-sm w-32 md:w-48"/>
           <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded font-bold flex items-center gap-2"><ArrowUpFromLine size={18} /> 列印 / PDF</button>
           <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded font-bold"><X size={18} /> 關閉</button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-8 w-full bg-white text-slate-800 print:p-0 print:max-w-none">
        <div className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-end">
           <div><h1 className="text-4xl font-black text-slate-900 mb-2">{reportContent.title}</h1><p className="text-xl text-slate-500 font-medium">專屬資產戰略規劃書</p></div>
           <div className="text-right text-sm text-slate-600"><p className="font-bold text-lg mb-1">{customerName ? customerName + ' 貴賓' : '貴賓專屬'}</p><p>規劃顧問：{user?.displayName || '專業理財顧問'}</p><p>規劃日期：{dateStr}</p></div>
        </div>

        <div className="mb-8 print:mb-4">
           <h2 className="text-lg font-bold text-slate-900 border-l-4 border-blue-600 pl-3 mb-6 print:mb-3">戰略思維導圖</h2>
           <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 print:bg-white print:border-0 print:p-0 print:gap-2 print:flex-row print:justify-start print:flex-wrap">
              <div className="bg-slate-800 text-white px-6 py-4 rounded-xl font-bold text-xl shadow-lg print:shadow-none print:border print:border-slate-900 print:text-black print:bg-transparent print:px-4 print:py-2">{reportContent.title}</div>
              <div className="flex flex-col gap-4 w-full md:w-auto print:flex-row print:flex-wrap print:gap-2 print:w-full">
                 {reportContent.mindMap.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 print:gap-1 print:border print:border-slate-300 print:rounded print:p-2">
                       <div className="hidden md:block w-8 h-0.5 bg-slate-300 print:hidden"></div>
                       <div className="flex-1 bg-white border border-slate-200 p-3 rounded-lg shadow-sm flex justify-between items-center min-w-[200px] print:shadow-none print:border-0 print:p-0 print:min-w-0 print:gap-2">
                          <span className="text-xs font-bold text-slate-400 uppercase print:text-slate-600">{item.label}:</span>
                          <span className="font-bold text-slate-800">{item.value}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="mb-8 print:mb-4 print-break-inside">
           <h2 className="text-lg font-bold text-slate-900 border-l-4 border-orange-500 pl-3 mb-6 print:mb-3">資產趨勢分析</h2>
           <div className="h-[300px] w-full border border-slate-200 rounded-xl p-4 print:h-[250px] print:border-0 print:p-0">
              <ResponsiveContainer width="100%" height="100%">
                {reportContent.chartType === 'area_reservoir' ? (
                   <AreaChart data={reportContent.chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="year" tick={{fontSize: 12}} /><YAxis unit="萬" tick={{fontSize: 12}} /><Legend />
                      <Area type="monotone" dataKey="小水庫累積" stackId="1" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.6} /><Area type="monotone" dataKey="大水庫本金" stackId="1" stroke="#0891b2" fill="#0891b2" fillOpacity={0.6} />
                   </AreaChart>
                ) : reportContent.chartType.startsWith('bar') ? (
                   <BarChart data={[{ name: 'Analysis', ...reportContent.chartData.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.value }), {}) }]} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" hide /><YAxis dataKey="name" type="category" hide width={80} /><Legend />
                      {reportContent.chartData.map((d, i) => (<Bar key={i} dataKey={d.name} fill={d.fill} barSize={40} label={{ position: 'right', fill: '#64748b', fontWeight: 'bold', formatter: (val) => `$${val}萬` }} />))}
                   </BarChart>
                ) : (
                   <ComposedChart data={reportContent.chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey={reportContent.chartType==='composed_car'?'cycle':'year'} tick={{fontSize: 12}} /><YAxis unit={reportContent.chartType==='composed_car'?'元':'萬'} tick={{fontSize: 12}} /><Legend />
                      {reportContent.chartType === 'composed_gift' && (<><Area type="monotone" dataKey="專案持有資產" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} /><Line type="monotone" dataKey="專案實付成本" stroke="#f59e0b" strokeWidth={3} /></>)}
                      {reportContent.chartType === 'composed_estate' && (<><Area type="monotone" name="總資產價值" dataKey="總資產價值" stroke="#10b981" fill="#10b981" fillOpacity={0.3} /><Line type="monotone" name="剩餘房貸" dataKey="剩餘貸款" stroke="#ef4444" strokeWidth={1} /></>)}
                      {reportContent.chartType === 'composed_student' && (<><Area type="monotone" name="套利淨資產" dataKey="淨資產" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} /><Line type="monotone" name="直接繳掉" dataKey="若直接繳掉" stroke="#ef4444" strokeWidth={2} /></>)}
                      {reportContent.chartType === 'composed_active' && (<><Area type="monotone" name="積極存錢" dataKey="積極存錢" stroke="#9333ea" fill="#9333ea" fillOpacity={0.3} /><Line type="monotone" name="消極存錢" dataKey="消極存錢" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" /></>)}
                      {reportContent.chartType === 'composed_car' && (<><Bar dataKey="netPay" name="實際月付金" fill="#f97316" barSize={40} /><Line type="monotone" dataKey="originalPay" name="原車貸月付" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" /></>)}
                   </ComposedChart>
                )}
              </ResponsiveContainer>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 print:grid-cols-1 print:gap-4 print:block">
           <div className="print:mb-4 print-break-inside">
              <h2 className="text-lg font-bold text-slate-900 border-l-4 border-green-600 pl-3 mb-6 print:mb-2">關鍵里程碑</h2>
              <div className="rounded-xl border border-slate-200 overflow-hidden print:border-0">
                 <table className="w-full text-left border-collapse">
                    <thead><tr className="bg-slate-100 text-slate-600 text-sm print:bg-gray-100"><th className="p-3 border-b border-slate-200 print:p-2">時間點</th><th className="p-3 border-b border-slate-200 print:p-2">階段目標</th><th className="p-3 border-b border-slate-200 print:p-2">預期成效</th></tr></thead>
                    <tbody>{reportContent.table.map((row, idx) => (<tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 print:hover:bg-white"><td className="p-3 font-bold text-slate-800 print:p-2">{row.label}</td><td className="p-3 text-slate-600 print:p-2">{row.col1}</td><td className="p-3 font-bold text-blue-600 print:p-2">{row.col2}</td></tr>))}</tbody>
                 </table>
              </div>
           </div>
           <div className="print-break-inside">
              <h2 className="text-lg font-bold text-slate-900 border-l-4 border-yellow-500 pl-3 mb-6 print:mb-2">專案優勢分析</h2>
              <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-100 h-full print:bg-white print:border print:border-slate-200 print:p-4">
                 <ul className="space-y-4 print:space-y-2">{reportContent.highlights.map((item, idx) => (<li key={idx} className="flex gap-3 items-start"><CheckCircle2 className="text-yellow-600 shrink-0 mt-0.5 print:text-black" size={20} /><span className="text-slate-800 font-medium">{item}</span></li>))}</ul>
              </div>
           </div>
        </div>
        <div className="text-center text-xs text-slate-400 mt-12 border-t border-slate-100 pt-6 print:text-slate-600 print:mt-4 print:pt-2"><p>本報告僅供參考，實際投資效益與稅務金額請以正式合約與當時法規為準。</p><p className="mt-1">© {new Date().getFullYear()} 超業菁英戰情室 • Professional Financial Planning</p></div>
      </div>
    </div>
  );
};

// ============================================================================
// #REGION: UI UTILS & TOOLS
// ============================================================================

const PrintStyles = () => (
  <style>{`@media print { aside, main, .no-print, .toast-container, .mobile-header, .print-hidden-bar { display: none !important; } body { background: white !important; height: auto !important; overflow: visible !important; } .print-break-inside { break-inside: avoid; } * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } #report-modal { position: static !important; overflow: visible !important; height: auto !important; width: 100% !important; z-index: 9999; } .absolute { position: static !important; } .print\\:block { display: block !important; } .print\\:grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; } ::-webkit-scrollbar { display: none; } }`}</style>
);

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => { const timer = setTimeout(() => { onClose(); }, 3000); return () => clearTimeout(timer); }, [onClose]);
  return (<div className={`fixed bottom-6 right-6 ${type==='success'?'bg-green-600':type==='error'?'bg-red-600':'bg-blue-600'} text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-bounce-in z-[100] toast-container`}>{type==='success'&&<Check size={20}/>}{type==='error'&&<ShieldAlert size={20}/>}<span className="font-bold">{message}</span></div>);
};

const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><Icon size={20} /><span className="font-medium flex-1 text-left">{label}</span></button>
);

// --- TOOLS 1-8 ---

const MillionDollarGiftTool = ({ data, setData }) => {
  const { chartData } = getReportData('gift', data);
  const phase1_NetOut = calculateMonthlyPayment(data.loanAmount, data.loanRate, data.loanTerm) - calculateMonthlyIncome(data.loanAmount, data.investReturnRate);
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg"><h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Wallet /> 百萬禮物專案</h3><p className="opacity-90">透過三次槓桿循環，用時間換取 300 萬資產。</p></div>
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2"><Calculator size={18} /> 參數設定</h4>
            <div className="space-y-6">
               {[ { l: "單次借貸額度 (萬)", f: "loanAmount", min: 50, max: 500, c: "blue" }, { l: "信貸利率 (%)", f: "loanRate", min: 1.5, max: 15.0, step: 0.1, c: "blue" }, { l: "配息率 (%)", f: "investReturnRate", min: 3, max: 12, step: 0.5, c: "green" } ].map((item) => (
                 <div key={item.f}><div className="flex justify-between mb-2"><label className="text-sm font-medium text-slate-600">{item.l}</label><span className={`font-mono font-bold text-${item.c}-600`}>{data[item.f]}</span></div><input type="range" min={item.min} max={item.max} step={item.step||10} value={data[item.f]} onChange={(e) => setData({ ...data, [item.f]: Number(e.target.value) })} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" /></div>
               ))}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow border border-slate-200 p-5"><div className="text-center"><div className="text-xs bg-green-100 text-green-700 py-1.5 px-3 rounded-full inline-block font-bold">實質每月應負 ${Math.round(phase1_NetOut).toLocaleString()}</div></div></div>
        </div>
        <div className="lg:col-span-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-[350px]">
           <ResponsiveContainer width="100%" height="100%"><ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="year" /><YAxis unit="萬" /><Tooltip /><Legend /><Area type="monotone" dataKey="專案持有資產" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} /><Bar dataKey="一般存錢成本" fill="#cbd5e1" barSize={12} /><Line type="monotone" dataKey="專案實付成本" stroke="#f59e0b" strokeWidth={3} /></ComposedChart></ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const FinancialRealEstateTool = ({ data, setData }) => {
  const { chartData, highlights } = getReportData('estate', data);
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg"><h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Building2 /> 金融房產專案</h3><p className="opacity-90">以息養貸，打造數位包租公模式。</p></div>
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2"><Calculator size={18} /> 資產參數</h4>
            <div className="space-y-6">
               {[{ l: "資產/貸款總額 (萬)", f: "loanAmount", min: 500, max: 3000, step: 100 }, { l: "貸款年期 (年)", f: "loanTerm", min: 20, max: 40, step: 1 }, { l: "貸款利率 (%)", f: "loanRate", min: 1.5, max: 4.0, step: 0.1 }, { l: "配息率 (%)", f: "investReturnRate", min: 3, max: 10, step: 0.5 }].map((item) => (
                 <div key={item.f}><div className="flex justify-between mb-2"><label className="text-sm font-medium text-slate-600">{item.l}</label><span className="font-mono font-bold text-emerald-600">{data[item.f]}</span></div><input type="range" min={item.min} max={item.max} step={item.step} value={data[item.f]} onChange={(e) => setData({ ...data, [item.f]: Number(e.target.value) })} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" /></div>
               ))}
            </div>
            <div className="mt-4 p-4 bg-emerald-50 rounded text-sm text-emerald-800 font-medium">{highlights[0]}</div>
        </div>
        <div className="lg:col-span-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-[350px]">
            <ResponsiveContainer width="100%" height="100%"><ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="year" /><YAxis unit="萬" /><Tooltip /><Legend /><Area type="monotone" name="總資產價值" dataKey="總資產價值" stroke="#10b981" fill="#10b981" fillOpacity={0.3} /><Line type="monotone" name="剩餘房貸" dataKey="剩餘貸款" stroke="#ef4444" strokeWidth={1} /></ComposedChart></ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StudentLoanTool = ({ data, setData }) => {
  const { chartData } = getReportData('student', data);
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg"><h3 className="text-xl font-bold mb-2 flex items-center gap-2"><GraduationCap /> 學貸套利專案</h3><p className="opacity-90">善用「寬限期」與「只繳息期」延長資金壽命。</p></div>
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2"><Calculator size={18} /> 參數設定</h4>
            <div className="space-y-6">
               {[{ l: "學貸總額 (萬)", f: "loanAmount", min: 10, max: 100, step: 5 }, { l: "寬限期 (年)", f: "gracePeriod", min: 0, max: 3, step: 1 }, { l: "只繳息期 (年)", f: "interestOnlyPeriod", min: 0, max: 4, step: 1 }, { l: "投報率 (%)", f: "investReturnRate", min: 3, max: 10, step: 0.5 }].map((item) => (
                 <div key={item.f}><div className="flex justify-between mb-2"><label className="text-sm font-medium text-slate-600">{item.l}</label><span className="font-mono font-bold text-sky-600">{data[item.f]}</span></div><input type="range" min={item.min} max={item.max} step={item.step} value={data[item.f]} onChange={(e) => setData({ ...data, [item.f]: Number(e.target.value) })} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500" /></div>
               ))}
            </div>
        </div>
        <div className="lg:col-span-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-[350px]">
           <ResponsiveContainer width="100%" height="100%"><ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="year" /><YAxis unit="萬" /><Tooltip /><Legend /><Area type="monotone" name="套利淨資產" dataKey="淨資產" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} /><Line type="monotone" name="若直接繳掉" dataKey="若直接繳掉" stroke="#ef4444" strokeWidth={2} /></ComposedChart></ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const SuperActiveSavingTool = ({ data, setData }) => {
  const { chartData } = getReportData('super_active', data);
  const finalAsset = chartData[chartData.length-1].積極存錢;
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-lg"><h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Rocket /> 超積極存錢法</h3><p className="opacity-90">辛苦 15 年，換來提早 10 年的財富自由。</p></div>
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2"><Calculator size={18} /> 參數設定</h4>
            <div className="space-y-6">
               {[{ l: "每月存錢", f: "monthlySaving", min: 3000, max: 50000, step: 1000 }, { l: "只需辛苦 (年)", f: "activeYears", min: 5, max: 25, step: 1 }, { l: "投報率 (%)", f: "investReturnRate", min: 3, max: 12, step: 0.5 }].map((item) => (
                 <div key={item.f}><div className="flex justify-between mb-2"><label className="text-sm font-medium text-slate-600">{item.l}</label><span className="font-mono font-bold text-purple-600">{data[item.f]}</span></div><input type="range" min={item.min} max={item.max} step={item.step} value={data[item.f]} onChange={(e) => setData({ ...data, [item.f]: Number(e.target.value) })} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600" /></div>
               ))}
            </div>
            <div className="mt-6 text-center"><p className="text-sm text-slate-500">30年後預估資產</p><p className="text-3xl font-black text-purple-600 font-mono">${finalAsset}萬</p></div>
        </div>
        <div className="lg:col-span-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-[350px]">
           <ResponsiveContainer width="100%" height="100%"><ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="year" /><YAxis unit="萬" /><Tooltip /><Legend /><Area type="monotone" name="積極存錢" dataKey="積極存錢" stroke="#9333ea" fill="#9333ea" fillOpacity={0.3} /><Line type="monotone" name="消極存錢" dataKey="消極存錢" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" /></ComposedChart></ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const CarReplacementTool = ({ data, setData }) => {
  const { chartData } = getReportData('car', data);
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg"><h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Car /> 五年換車專案</h3><p className="opacity-90">運用時間複利與車輛殘值，每5年輕鬆換新車。</p></div>
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2"><Calculator size={18} /> 參數設定</h4>
            <div className="space-y-6">
               {[{ l: "目標車價 (萬)", f: "carPrice", min: 60, max: 300, step: 10 }, { l: "投報率 (%)", f: "investReturnRate", min: 3, max: 10, step: 0.5 }, { l: "5年殘值 (%)", f: "resaleRate", min: 30, max: 70, step: 5 }].map((item) => (
                 <div key={item.f}><div className="flex justify-between mb-2"><label className="text-sm font-medium text-slate-600">{item.l}</label><span className="font-mono font-bold text-orange-600">{data[item.f]}</span></div><input type="range" min={item.min} max={item.max} step={item.step} value={data[item.f]} onChange={(e) => setData({ ...data, [item.f]: Number(e.target.value) })} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600" /></div>
               ))}
            </div>
        </div>
        <div className="lg:col-span-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-[350px]">
           <ResponsiveContainer width="100%" height="100%"><ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="cycle" /><YAxis unit="元" /><Tooltip /><Legend /><Bar dataKey="netPay" name="實際月付金" fill="#f97316" barSize={40} /><Line type="monotone" dataKey="originalPay" name="原車貸月付" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" /></ComposedChart></ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const BigSmallReservoirTool = ({ data, setData }) => {
  const { chartData } = getReportData('reservoir', data);
  const totalAsset = chartData[chartData.length-1].total || 0;
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg"><h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Waves /> 大小水庫專案</h3><p className="opacity-90">母錢生子錢，子錢再生孫錢。</p></div>
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2"><Calculator size={18} /> 參數設定</h4>
            <div className="space-y-6">
               {[{ l: "大水庫本金 (萬)", f: "initialCapital", min: 100, max: 5000, step: 50 }, { l: "大水庫配息 (%)", f: "dividendRate", min: 3, max: 10, step: 0.5 }, { l: "小水庫滾存 (%)", f: "reinvestRate", min: 3, max: 12, step: 0.5 }, { l: "年期", f: "years", min: 5, max: 20, step: 1 }].map((item) => (
                 <div key={item.f}><div className="flex justify-between mb-2"><label className="text-sm font-medium text-slate-600">{item.l}</label><span className="font-mono font-bold text-cyan-600">{data[item.f]}</span></div><input type="range" min={item.min} max={item.max} step={item.step} value={data[item.f]} onChange={(e) => setData({ ...data, [item.f]: Number(e.target.value) })} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600" /></div>
               ))}
            </div>
        </div>
        <div className="lg:col-span-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-[350px]">
           <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="year" /><YAxis unit="萬" /><Tooltip /><Legend /><Area type="monotone" dataKey="小水庫累積" stackId="1" stroke="#fbbf24" fill="#fbbf24" /><Area type="monotone" dataKey="大水庫本金" stackId="1" stroke="#0891b2" fill="#0891b2" /></AreaChart></ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const LaborPensionTool = ({ data, setData }) => {
  const { chartData } = getReportData('pension', data);
  const gap = chartData.find(d => d.name === '退休缺口')?.value || 0;
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-2xl p-6 text-white shadow-lg"><h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Umbrella /> 退休缺口試算</h3><p className="opacity-90">30秒算出你的退休生活品質。</p></div>
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2"><Calculator size={18} /> 參數設定</h4>
            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-bold text-slate-500">年齡</label><input type="number" value={data.currentAge} onChange={e=>setData({...data, currentAge: Number(e.target.value)})} className="w-full p-2 border rounded"/></div><div><label className="text-xs font-bold text-slate-500">退休</label><input type="number" value={data.retireAge} onChange={e=>setData({...data, retireAge: Number(e.target.value)})} className="w-full p-2 border rounded"/></div></div>
               {[{ l: "投保薪資", f: "salary", min: 26400, max: 150000, step: 1000 }, { l: "勞保年資", f: "laborInsYears", min: 15, max: 45, step: 1 }, { l: "理想月退", f: "desiredMonthlyIncome", min: 30000, max: 150000, step: 5000 }].map((item) => (
                 <div key={item.f}><div className="flex justify-between mb-2"><label className="text-sm font-medium text-slate-600">{item.l}</label><span className="font-mono font-bold text-slate-700">{data[item.f]}</span></div><input type="range" min={item.min} max={item.max} step={item.step} value={data[item.f]} onChange={(e) => setData({ ...data, [item.f]: Number(e.target.value) })} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600" /></div>
               ))}
               <div className="flex items-center justify-between p-3 bg-slate-50 rounded border"><span className="text-sm font-bold">勞退自提 6%</span><button onClick={()=>setData({...data, selfContribution: !data.selfContribution})} className={`h-6 w-11 rounded-full transition-colors ${data.selfContribution?'bg-green-500':'bg-slate-300'}`}><span className={`block h-4 w-4 rounded-full bg-white transform transition-transform ${data.selfContribution?'translate-x-6 translate-y-1':'translate-x-1 translate-y-1'}`}/></button></div>
            </div>
            <div className="mt-4 text-center"><p className="text-sm text-slate-500">財務缺口 (每月)</p><p className="text-4xl font-black text-red-500 font-mono">${gap.toLocaleString()}</p></div>
        </div>
        <div className="lg:col-span-8 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[450px]">
           <ResponsiveContainer width="100%" height="100%"><BarChart data={[{ name: 'Analysis', ...chartData.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.value }), {}) }]} layout="vertical"><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" hide /><YAxis dataKey="name" type="category" hide width={100} /><Legend />{chartData.map((d, i) => (<Bar key={i} dataKey={d.name} fill={d.fill} barSize={40} label={{ position: 'right', fill: '#64748b', fontWeight: 'bold', formatter: (val) => `$${val}萬` }} />))}</BarChart></ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const TaxPlannerTool = ({ data, setData }) => {
  const { chartData } = getReportData('tax', data);
  const taxSaved = chartData[0].value - chartData[1].value;
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-slate-600 to-zinc-700 rounded-2xl p-6 text-white shadow-lg"><h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Landmark /> 稅務傳承專案</h3><p className="opacity-90">善用保險免稅額度，讓資產無痛傳承。</p></div>
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2"><Calculator size={18} /> 資產與家庭</h4>
            <div className="space-y-6">
               <div className="space-y-3"><div className="flex items-center justify-between"><label className="text-sm text-slate-600">配偶健在</label><input type="checkbox" checked={data.spouse} onChange={(e) => setData({...data, spouse: e.target.checked})} className="w-5 h-5 accent-slate-600" /></div><div className="flex items-center justify-between"><label className="text-sm text-slate-600">子女人數</label><input type="number" min={0} max={10} value={data.children} onChange={(e) => setData({...data, children: Number(e.target.value)})} className="w-16 p-1 border rounded text-right" /></div></div>
               {[{ l: "現金存款 (萬)", f: "cash", min: 0, max: 10000, step: 100 }, { l: "不動產現值 (萬)", f: "realEstate", min: 0, max: 10000, step: 100 }, { l: "轉入保險 (萬)", f: "insurancePlan", min: 0, max: 3330, step: 100 }].map((item) => (
                 <div key={item.f}><div className="flex justify-between mb-2"><label className="text-sm font-medium text-slate-600">{item.l}</label><span className="font-mono font-bold text-slate-700">${data[item.f]}</span></div><input type="range" min={item.min} max={item.max} step={item.step} value={data[item.f]} onChange={(e) => setData({ ...data, [item.f]: Number(e.target.value) })} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600" /></div>
               ))}
            </div>
            <div className="mt-4 text-center"><p className="text-sm text-slate-500">節稅效益</p><p className="text-4xl font-black text-green-600 font-mono">省 ${taxSaved}萬</p></div>
        </div>
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[300px]">
             <ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} layout="vertical"><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" hide /><YAxis dataKey="name" type="category" hide width={100} /><Legend /><Bar dataKey="value" barSize={40} label={{ position: 'right', fill: '#64748b', fontWeight: 'bold' }} /></BarChart></ResponsiveContainer>
          </div>
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex gap-3"><AlertTriangle className="text-yellow-600 flex-shrink-0" /><div className="text-xs text-yellow-800"><p className="font-bold">實質課稅原則提醒：</p>注意重病、高齡、短期、躉繳、舉債、鉅額投保等特徵，避免被視為惡意避稅。</div></div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// #REGION: MAIN APP SHELL
// ============================================================================

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('gift'); 
  const [toast, setToast] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false); 

  // State Definitions
  const [giftData, setGiftData] = useState({ loanAmount: 100, loanTerm: 7, loanRate: 2.8, investReturnRate: 6 });
  const [estateData, setEstateData] = useState({ loanAmount: 1000, loanTerm: 30, loanRate: 2.2, investReturnRate: 6 });
  const [studentData, setStudentData] = useState({ loanAmount: 40, investReturnRate: 6, years: 8, gracePeriod: 1, interestOnlyPeriod: 0 });
  const [superActiveData, setSuperActiveData] = useState({ monthlySaving: 10000, investReturnRate: 6, activeYears: 15 });
  const [carData, setCarData] = useState({ carPrice: 100, investReturnRate: 6, resaleRate: 50 });
  const [pensionData, setPensionData] = useState({ currentAge: 30, retireAge: 65, salary: 45000, laborInsYears: 35, selfContribution: false, pensionReturnRate: 3, desiredMonthlyIncome: 60000 });
  const [reservoirData, setReservoirData] = useState({ initialCapital: 1000, dividendRate: 6, reinvestRate: 6, years: 10 });
  const [taxData, setTaxData] = useState({ spouse: true, children: 2, parents: 0, cash: 3000, realEstate: 2000, stocks: 1000, insurancePlan: 0 });

  useEffect(() => { const unsubscribe = onAuthStateChanged(auth, u => { setUser(u); setLoading(false); }); return () => unsubscribe(); }, []);
  const showToast = (message, type = 'success') => { setToast({ message, type }); };
  const handleLogin = async () => { try { await signInWithPopup(auth, googleProvider); } catch (e) { showToast("登入失敗", "error"); } };
  const handleLogout = async () => { await signOut(auth); setActiveTab('gift'); showToast("已安全登出", "info"); };

  const getCurrentData = () => {
    switch(activeTab) {
      case 'gift': return giftData; case 'estate': return estateData; case 'student': return studentData;
      case 'super_active': return superActiveData; case 'car': return carData; case 'reservoir': return reservoirData;
      case 'pension': return pensionData; case 'tax': return taxData; default: return {};
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={48} /></div>;
  if (!user) return (<div className="min-h-screen bg-slate-900 flex items-center justify-center p-4"><div className="bg-white rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl animate-fade-in-up"><div className="flex justify-center"><div className="bg-blue-100 p-4 rounded-full"><Coins size={48} className="text-blue-600" /></div></div><div><h1 className="text-3xl font-black text-slate-800">超業菁英戰情室</h1><p className="text-slate-500 mt-2">武裝您的專業，讓數字幫您說故事</p></div><button onClick={handleLogin} className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 hover:bg-slate-50 text-slate-700 font-bold py-3 px-4 rounded-xl transition-all"><div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-blue-600">G</div>使用 Google 帳號登入</button></div></div>);

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <PrintStyles />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <ReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} user={user} activeTab={activeTab} data={getCurrentData()} />
      {isMobileMenuOpen && (<div className="fixed inset-0 z-50 bg-slate-900 text-white flex flex-col md:hidden"><div className="p-4 flex justify-between items-center border-b border-slate-800"><span className="font-bold text-lg">選單</span><button onClick={() => setIsMobileMenuOpen(false)}><X size={24}/></button></div><div className="flex-1 p-4 space-y-2"><NavItem icon={Wallet} label="百萬禮物" active={activeTab === 'gift'} onClick={() => {setActiveTab('gift'); setIsMobileMenuOpen(false);}} /><button onClick={handleLogout} className="w-full text-left p-3">登出</button></div></div>)}

      <aside className="w-72 bg-slate-900 text-white flex-col hidden md:flex shadow-2xl z-10 print:hidden">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3"><div className="w-12 h-12 rounded-full border-2 border-yellow-400 overflow-hidden"><img src={user.photoURL} className="w-full h-full" /></div><div><div className="text-xs text-yellow-500 font-bold">理財顧問</div><div className="font-bold text-sm truncate w-32">{user.displayName}</div></div></div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-bold text-slate-500 px-4 py-2 uppercase">資產軍火庫</div>
          <NavItem icon={Wallet} label="百萬禮物專案" active={activeTab === 'gift'} onClick={() => setActiveTab('gift')} />
          <NavItem icon={Building2} label="金融房產專案" active={activeTab === 'estate'} onClick={() => setActiveTab('estate')} />
          <NavItem icon={GraduationCap} label="學貸套利專案" active={activeTab === 'student'} onClick={() => setActiveTab('student')} />
          <NavItem icon={Rocket} label="超積極存錢法" active={activeTab === 'super_active'} onClick={() => setActiveTab('super_active')} />
          <NavItem icon={Car} label="五年換車專案" active={activeTab === 'car'} onClick={() => setActiveTab('car')} />
          <NavItem icon={Waves} label="大小水庫專案" active={activeTab === 'reservoir'} onClick={() => setActiveTab('reservoir')} />
          <div className="mt-4 text-xs font-bold text-slate-600 px-4 py-2 uppercase">退休與傳承</div>
          <NavItem icon={Umbrella} label="退休缺口試算" active={activeTab === 'pension'} onClick={() => setActiveTab('pension')} />
          <NavItem icon={Landmark} label="稅務傳承專案" active={activeTab === 'tax'} onClick={() => setActiveTab('tax')} />
        </nav>
        <div className="p-4 border-t border-slate-800 space-y-2"><button onClick={() => setIsReportOpen(true)} className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors px-4 py-2 w-full"><FileBarChart size={18} /> 生成策略報表</button><button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors px-4 py-2 w-full"><LogOut size={18} /> 登出系統</button></div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-md shrink-0 print:hidden"><div className="font-bold flex items-center gap-2"><Coins className="text-yellow-400"/> 資產規劃</div><div className="flex gap-2"><button onClick={() => setIsReportOpen(true)} className="p-2 bg-slate-800 rounded-lg"><FileBarChart size={24} /></button><button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-slate-800 rounded-lg"><Menu size={24} /></button></div></div>
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