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
  FileBarChart,
  PieChart
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
// Report Component
// ------------------------------------------------------------------

const ReportModal = ({ isOpen, onClose, user, activeTab, data }) => {
  const [customerName, setCustomerName] = useState('');
  
  if (!isOpen) return null;

  const dateStr = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
  
  let reportContent = { title: '', mindMap: [], table: [], highlights: [], chartData: [], chartType: 'composed' };

  // --- Logic Extraction for Report ---
  if (activeTab === 'gift') {
    const loan = data.loanAmount;
    const monthlyLoanPayment = calculateMonthlyPayment(loan, data.loanRate, data.loanTerm);
    const monthlyInvestIncomeSingle = calculateMonthlyIncome(loan, data.investReturnRate);
    const phase1_NetOut = monthlyLoanPayment - monthlyInvestIncomeSingle;
    const standardTotalCost = 3000000; 
    const standardMonthlySaving = standardTotalCost / (15 * 12); 
    const monthlySaved = Math.round(standardMonthlySaving - phase1_NetOut);

    // Chart - Logic Update: Goal is 300万 (3 * loanAmount)
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
        { label: '時間槓桿', value: `15 年循環` },
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
        '透過三次循環，15年後無痛擁有300萬資產。',
        '強迫儲蓄效應，避免資金隨意花費。'
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
        { label: '最終歸屬', value: '資產全拿' },
        { label: '人生意義', value: '被動收入' }
      ],
      table: [
        { label: '第 1 年', col1: '建置期', col2: '現金流啟動' },
        { label: `第 ${Math.round(data.loanTerm/2)} 年`, col1: '持守期', col2: '還款過半' },
        { label: `第 ${data.loanTerm} 年`, col1: '自由期', col2: `擁有 ${loan} 萬` },
      ],
      highlights: isNegativeCashFlow ? [
        `槓桿效益驚人：${data.loanTerm}年總自付約 ${Math.round(totalOutOfPocket/10000)} 萬，卻換取 ${loan} 萬資產。`,
        `如同買房，房客(配息)幫您繳了大部分房貸(本息)。`,
        `用小錢換大資產，強迫儲蓄的最佳工具。`,
        `期滿後資產完全屬於您，並持續產生被動收入。`
      ] : [
        '以息養貸，完全無需自掏腰包。',
        '每月還能創造額外現金流，生活品質提升。',
        '期滿後無痛擁有千萬資產。'
      ],
      chartData: chartData,
      chartType: 'composed_estate'
    };
  } else if (activeTab === 'student') {
     const profit = Math.round(data.loanAmount * 10000 * Math.pow((1 + data.investReturnRate/100), data.years + data.gracePeriod) - (calculateMonthlyPayment(data.loanAmount, 1.775, data.years) * 12 * data.years));
     
     const chartData = [];
     const totalDuration = data.gracePeriod + data.interestOnlyPeriod + data.years;
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
        { label: '寬限策略', value: `${data.gracePeriod}年寬限` },
        { label: '淨獲利', value: `${Math.round(profit/10000)} 萬` },
        { label: '人生意義', value: '理財紀律' }
      ],
      table: [
        { label: '辦理學貸時', col1: '投入期', col2: '啟動投資規劃' }, 
        { label: '寬限結束', col1: '還款期', col2: '以息繳貸' },
        { label: '8 年後', col1: '無債期', col2: '多賺一筆' },
      ],
      highlights: [
          '學費不繳掉，轉為資產種子。',
          '不急著還本金，讓時間複利為您工作。',
          '畢業即擁有人生第一桶金，贏在起跑點。',
          '培養「理財大於還債」的富人思維。'
      ],
      chartData: chartData,
      chartType: 'composed_student'
    };
  } else if (activeTab === 'super_active') {
    const chartData = [];
    let passiveAccumulation = 0; 
    let activeInvestment = 0; 
    // Generate 40 years data for chart
    for (let year = 1; year <= 40; year++) {
        passiveAccumulation += data.monthlySaving * 12;
        if (year <= data.activeYears) activeInvestment = (activeInvestment + data.monthlySaving * 12) * (1 + data.investReturnRate / 100);
        else activeInvestment = activeInvestment * (1 + data.investReturnRate / 100);
        
        chartData.push({
            year: `第${year}年`,
            消極存錢: Math.round(passiveAccumulation / 10000),
            積極存錢: Math.round(activeInvestment / 10000),
        });
    }

    const finalAsset = Math.round(chartData[39].積極存錢);
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
      ],
      highlights: [
          '關鍵效益：相比苦存40年，您只需專注存錢15年。',
          '利用複利效應，大幅減少本金投入。',
          '提早達成財務目標，擁有更多人生選擇權。',
          '只需辛苦一陣子，享受一輩子。'
      ],
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
        const surplus = resaleValue - 20;
        policyPrincipal += surplus;
    }

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
      ],
      highlights: [
          '關鍵思維：不要讓錢花掉就沒了。',
          '打破買車即負債的傳統觀念。',
          '透過「舊車換新車」的資金回流，讓資產雪球越滾越大。',
          '維持生活品質，每五年輕鬆換新車。'
      ],
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
      chartData.push({
        year: `第${year}年`,
        大水庫本金: data.initialCapital,
        小水庫累積: Math.round(reinvestedTotal),
      });
    }

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
      ],
      highlights: [
          '策略效益：完全不需要再拿錢出來，只需搬運配息。',
          '母金不動，僅用孳息創造第二桶金。',
          '零風險資產倍增術，母錢生子錢，子錢再生孫錢。',
          '適合保守型高資產客戶，穩健傳承。'
      ],
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
        { label: '政府給付', value: '嚴重不足' },
        { label: '財務缺口', value: `每月 ${Math.abs(Math.round(gap))}` },
        { label: '人生意義', value: '尊嚴養老' }
      ],
      table: [
        { label: '60 歲', col1: '退休前', col2: '最後衝刺' },
        { label: '65 歲', col1: '退休時', col2: '開始領錢' },
        { label: '85 歲', col1: '長壽風險', col2: '現金流不斷' },
      ],
      highlights: [
          '專家解讀：政府退休金僅能維持基本溫飽，無法享受生活。',
          `勞退自提讓您的退休金翻倍！(若無自提，退休金將少一半)`,
          '提早規劃，用時間複利填補缺口。',
          `想要過上理想生活，您現在必須開始填補這 $${Math.max(0, Math.round(gap)).toLocaleString()} 元的缺口。`
      ],
      chartData: [
        { name: '勞保年金', value: Math.round(laborInsMonthly), fill: '#3b82f6' },
        { name: '勞退月領', value: Math.round(pensionMonthly), fill: '#10b981' },
        { name: '退休缺口', value: Math.max(0, Math.round(gap)), fill: '#ef4444' },
      ],
      chartType: 'bar_pension'
    };
  } else if (activeTab === 'tax') {
     const exemption = 1333; 
     const deductionSpouse = data.spouse ? 553 : 0;
     const deductionChildren = data.children * 56;
     const deductionParents = data.parents * 138;
     const deductionFuneral = 138; 
     const totalDeductions = exemption + deductionSpouse + deductionChildren + deductionParents + deductionFuneral;
     const totalAssets = data.cash + data.realEstate + data.stocks;
     const netEstateRaw = Math.max(0, totalAssets - totalDeductions);
     const plannedAssets = Math.max(0, totalAssets - data.insurancePlan);
     const netEstatePlanned = Math.max(0, plannedAssets - totalDeductions);
     const calculateTax = (netEstate) => {
        if (netEstate <= 5000) return netEstate * 0.10;
        if (netEstate <= 10000) return netEstate * 0.15 - 250;
        return netEstate * 0.20 - 750;
     };
     const taxRaw = calculateTax(netEstateRaw);
     const taxPlanned = calculateTax(netEstatePlanned);

     reportContent = {
      title: '稅務傳承專案',
      mindMap: [
        { label: '核心策略', value: '預留稅源' },
        { label: '資產總額', value: `${totalAssets} 萬` },
        { label: '保險額度', value: `${data.insurancePlan} 萬` },
        { label: '節稅效益', value: '資產保全' },
        { label: '人生意義', value: '富過三代' }
      ],
      table: [
        { label: '規劃前', col1: '遺產淨額高', col2: '稅金沉重' },
        { label: '規劃後', col1: '善用免稅額', col2: '稅金銳減' },
        { label: '傳承時', col1: '現金足夠', col2: '無痛繳稅' },
      ],
      highlights: [
          '善用保險給付免稅額度(3330萬)，合法降低遺產總額。',
          '預留現金稅源，避免子孫變賣家產繳稅。',
          '資產保全，讓財富完整傳承給下一代。',
          '注意實質課稅原則，避免重病/高齡/短期投保。'
      ],
      chartData: [
        { name: '未規劃稅金', value: Math.round(taxRaw), fill: '#ef4444' },
        { name: '規劃後稅金', value: Math.round(taxPlanned), fill: '#3b82f6' },
      ],
      chartType: 'bar_tax'
    };
  }

  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-fade-in overflow-auto" id="report-modal">
      {/* Print Controls (Hidden on Print) */}
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md print-hidden-bar sticky top-0 z-50">
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
      <div className="max-w-4xl mx-auto p-8 w-full bg-white text-slate-800 print:p-0 print:max-w-none">
        
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

        {/* Mind Map Section - Compact for Print */}
        <div className="mb-8 print:mb-4">
           <h2 className="text-lg font-bold text-slate-900 border-l-4 border-blue-600 pl-3 mb-6 print:mb-3">戰略思維導圖</h2>
           <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 print:bg-white print:border-0 print:p-0 print:gap-2 print:flex-row print:justify-start print:flex-wrap">
              {/* Central Node */}
              <div className="bg-slate-800 text-white px-6 py-4 rounded-xl font-bold text-xl shadow-lg print:shadow-none print:border print:border-slate-900 print:text-black print:bg-transparent print:px-4 print:py-2">
                 {reportContent.title}
              </div>
              
              {/* Branches */}
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

        {/* Chart Section - Smaller height for Print */}
        <div className="mb-8 print:mb-4 print-break-inside">
           <h2 className="text-lg font-bold text-slate-900 border-l-4 border-orange-500 pl-3 mb-6 print:mb-3">資產趨勢分析</h2>
           <div className="h-[300px] w-full border border-slate-200 rounded-xl p-4 print:h-[250px] print:border-0 print:p-0">
              <ResponsiveContainer width="100%" height="100%">
                {reportContent.chartType === 'area_reservoir' ? (
                   <AreaChart data={reportContent.chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="year" tick={{fontSize: 12}} />
                      <YAxis unit="萬" tick={{fontSize: 12}} />
                      <Legend />
                      <Area type="monotone" dataKey="小水庫累積" stackId="1" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="大水庫本金" stackId="1" stroke="#0891b2" fill="#0891b2" fillOpacity={0.6} />
                   </AreaChart>
                ) : reportContent.chartType === 'bar_pension' || reportContent.chartType === 'bar_tax' ? (
                   <BarChart data={[{ name: 'Analysis', ...reportContent.chartData.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.value }), {}) }]} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" hide width={80} />
                      <Legend />
                      {reportContent.chartData.map((d, i) => (
                         <Bar key={i} dataKey={d.name} fill={d.fill} barSize={40} label={{ position: 'right', fill: '#64748b', fontWeight: 'bold', formatter: (val) => `$${val}萬` }} />
                      ))}
                   </BarChart>
                ) : reportContent.chartType === 'composed_car' ? (
                   <ComposedChart data={reportContent.chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="cycle" tick={{fontSize: 12}} />
                      <YAxis unit="元" tick={{fontSize: 12}} />
                      <Legend />
                      <Bar dataKey="netPay" name="實際月付金" fill="#f97316" barSize={40} />
                      <Line type="monotone" dataKey="originalPay" name="原車貸月付" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" />
                   </ComposedChart>
                ) : (
                   <ComposedChart data={reportContent.chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="year" tick={{fontSize: 12}} />
                      <YAxis unit="萬" tick={{fontSize: 12}} />
                      <Legend />
                      {/* Dynamic chart based on type */}
                      {reportContent.chartType === 'composed_gift' && (
                         <>
                           <Area type="monotone" dataKey="專案持有資產" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                           <Line type="monotone" dataKey="專案實付成本" stroke="#f59e0b" strokeWidth={3} />
                         </>
                      )}
                      {reportContent.chartType === 'composed_estate' && (
                         <>
                           <Area type="monotone" name="總資產價值" dataKey="總資產價值" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                           <Line type="monotone" name="剩餘房貸" dataKey="剩餘貸款" stroke="#ef4444" strokeWidth={1} />
                         </>
                      )}
                      {reportContent.chartType === 'composed_student' && (
                         <>
                           <Area type="monotone" name="套利淨資產" dataKey="淨資產" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} />
                           <Line type="monotone" name="直接繳掉" dataKey="若直接繳掉" stroke="#ef4444" strokeWidth={2} />
                         </>
                      )}
                      {reportContent.chartType === 'composed_active' && (
                         <>
                           <Area type="monotone" name="積極存錢" dataKey="積極存錢" stroke="#9333ea" fill="#9333ea" fillOpacity={0.3} />
                           <Line type="monotone" name="消極存錢" dataKey="消極存錢" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" />
                         </>
                      )}
                   </ComposedChart>
                )}
              </ResponsiveContainer>
           </div>
        </div>

        {/* Highlights & Table Section - Ensure visible in Print */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 print:grid-cols-1 print:gap-4 print:block">
           <div className="print:mb-4 print-break-inside">
              <h2 className="text-lg font-bold text-slate-900 border-l-4 border-green-600 pl-3 mb-6 print:mb-2">關鍵里程碑</h2>
              <div className="rounded-xl border border-slate-200 overflow-hidden print:border-0">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-slate-100 text-slate-600 text-sm print:bg-gray-100">
                          <th className="p-3 border-b border-slate-200 print:p-2">時間點</th>
                          <th className="p-3 border-b border-slate-200 print:p-2">階段目標</th>
                          <th className="p-3 border-b border-slate-200 print:p-2">預期成效</th>
                       </tr>
                    </thead>
                    <tbody>
                       {reportContent.table.map((row, idx) => (
                          <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 print:hover:bg-white">
                             <td className="p-3 font-bold text-slate-800 print:p-2">{row.label}</td>
                             <td className="p-3 text-slate-600 print:p-2">{row.col1}</td>
                             <td className="p-3 font-bold text-blue-600 print:p-2">{row.col2}</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
           
           <div className="print-break-inside">
              <h2 className="text-lg font-bold text-slate-900 border-l-4 border-yellow-500 pl-3 mb-6 print:mb-2">專案優勢分析</h2>
              <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-100 h-full print:bg-white print:border print:border-slate-200 print:p-4">
                 <ul className="space-y-4 print:space-y-2">
                    {reportContent.highlights.map((item, idx) => (
                       <li key={idx} className="flex gap-3 items-start">
                          <CheckCircle2 className="text-yellow-600 shrink-0 mt-0.5 print:text-black" size={20} />
                          <span className="text-slate-800 font-medium">{item}</span>
                       </li>
                    ))}
                 </ul>
              </div>
           </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 mt-12 border-t border-slate-100 pt-6 print:text-slate-600 print:mt-4 print:pt-2">
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
      aside, main, .no-print, .toast-container, .mobile-header, .print-hidden-bar { display: none !important; }
      body { background: white !important; height: auto !important; overflow: visible !important; }
      .print-break-inside { break-inside: avoid; }
      /* Force background colors to print */
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      /* Ensure modal content flows normally */
      #report-modal { position: static !important; overflow: visible !important; height: auto !important; width: 100% !important; z-index: 9999; }
      .absolute { position: static !important; }
      /* Reset layout for print to ensure visibility */
      .print\\:block { display: block !important; }
      .print\\:grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
      /* Hide scrollbars in print */
      ::-webkit-scrollbar { display: none; }
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
// 核心模組 1: 百萬禮物專案 (已修正)
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
  const phase3_NetOut = monthlyLoanPayment - (monthlyInvestIncomeSingle * 3);
  
  const standardTotalCost = 3000000; 
  const standardMonthlySaving = standardTotalCost / (15 * 12); 

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

  const updateField = (field, value) => { setData({ ...safeData, [field]: value }); };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg print-break-inside">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Wallet className="text-blue-200" /> 百萬禮物專案</h3>
        <p className="text-blue-100 opacity-90">透過三次槓桿循環，用時間換取 300 萬資產。</p>
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
          {/* 原本的圖表區塊 */}
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

          {/* 新增：三階段摘要卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print-break-inside">
             {/* 第一個 7 年 */}
             <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-100 rounded-full opacity-50 group-hover:scale-150 transition-transform"></div>
                <div className="relative">
                  <div className="text-blue-800 font-bold text-lg mb-1 flex items-center gap-2">
                    <span className="bg-blue-200 text-blue-800 text-xs px-2 py-0.5 rounded-full">累積期</span>
                    第一個 7 年
                  </div>
                  <div className="text-xs text-slate-500 mb-2 font-medium">扣掉配息後只須要存</div>
                  <div className="text-3xl font-black text-blue-600 font-mono tracking-tight">
                     ${Math.round(phase1_NetOut).toLocaleString()}
                  </div>
                  <div className="mt-2 text-xs text-blue-400">建立資產基礎</div>
                </div>
             </div>

             {/* 第二個 7 年 */}
             <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-indigo-100 rounded-full opacity-50 group-hover:scale-150 transition-transform"></div>
                <div className="relative">
                  <div className="text-indigo-800 font-bold text-lg mb-1 flex items-center gap-2">
                    <span className="bg-indigo-200 text-indigo-800 text-xs px-2 py-0.5 rounded-full">成長期</span>
                    第二個 7 年
                  </div>
                  <div className="text-xs text-slate-500 mb-2 font-medium">扣掉配息後只須要存</div>
                  <div className="text-3xl font-black text-indigo-600 font-mono tracking-tight">
                     ${Math.max(0, Math.round(phase2_NetOut)).toLocaleString()}
                  </div>
                   <div className="mt-2 text-xs text-indigo-400">
                    {phase2_NetOut < phase1_NetOut ? `壓力減輕 ${Math.round((1 - phase2_NetOut/phase1_NetOut)*100)}%` : '持續累積'}
                  </div>
                </div>
             </div>

             {/* 第三個 7 年 */}
             <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-100 rounded-full opacity-50 group-hover:scale-150 transition-transform"></div>
                <div className="relative">
                  <div className="text-amber-800 font-bold text-lg mb-1 flex items-center gap-2">
                    <span className="bg-amber-200 text-amber-800 text-xs px-2 py-0.5 rounded-full">收穫期</span>
                    第三個 7 年
                  </div>
                  <div className="text-xs text-slate-500 mb-2 font-medium">一開始就可以領多少錢</div>
                  <div className={`text-3xl font-black font-mono tracking-tight ${phase3_NetOut <= 0 ? 'text-green-600' : 'text-amber-600'}`}>
                     {phase3_NetOut <= 0 
                       ? `+$${Math.abs(Math.round(phase3_NetOut)).toLocaleString()}` 
                       : `-$${Math.round(phase3_NetOut).toLocaleString()}`
                     }
                  </div>
                  <div className="mt-2 text-xs text-amber-600 font-bold">
                    {phase3_NetOut <= 0 ? '目標達成，被動收入啟動' : '仍需負擔部分金額'}
                  </div>
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
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-[350px] print-break-inside">
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
  
  const finalInvestValue = loanAmount * 10000 * Math.pow((1 + investReturnRate/100), totalDuration);
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
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-[400px] print-break-inside">
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
        </div>
      </div>
    </div>
  );
};

const SuperActiveSavingTool = ({ data, setData }) => {
  const safeData = {
    monthlySaving: Number(data?.monthlySaving) || 10000,
    investReturnRate: Number(data?.investReturnRate) || 6,
    activeYears: Number(data?.activeYears) || 15,
    totalYears: 40 // 固定比較基準
  };
  const { monthlySaving, investReturnRate, activeYears, totalYears } = safeData;

  // --- 計算邏輯 (修正部分) ---
  const fullChartData = [];
  let pAcc = 0; // 消極累積
  let aInv = 0; // 積極累積
  
  for (let year = 1; year <= totalYears; year++) {
      pAcc += monthlySaving * 12;
      
      if (year <= activeYears) {
          // 投入期：本金 + 利息
          aInv = (aInv + monthlySaving * 12) * (1 + investReturnRate / 100);
      } else {
          // 複利期：只滚利息
          aInv = aInv * (1 + investReturnRate / 100);
      }
      
      fullChartData.push({
          year: `第${year}年`,
          消極存錢: Math.round(pAcc / 10000),
          積極存錢: Math.round(aInv / 10000),
      });
  }

  const finalPassive = pAcc;
  const finalAsset = Math.round(aInv / 10000);
  const totalPrincipalActive = monthlySaving * 12 * activeYears;
  const totalPrincipalPassive = monthlySaving * 12 * totalYears;

  const updateField = (field, value) => {
    setData({ ...safeData, [field]: value });
  };

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
               {[
                 { label: "每月存錢金額", field: "monthlySaving", min: 3000, max: 50000, step: 1000, val: monthlySaving, color: "purple" },
                 { label: "只需辛苦 (年)", field: "activeYears", min: 5, max: 25, step: 1, val: activeYears, color: "pink" },
                 { label: "投資報酬率 (%)", field: "investReturnRate", min: 3, max: 12, step: 0.5, val: investReturnRate, color: "green" }
               ].map((item) => (
                 <div key={item.field}>
                   <div className="flex justify-between mb-2">
                     <label className="text-sm font-medium text-slate-600">{item.label}</label>
                     <span className={`font-mono font-bold text-${item.color}-600`}>{item.field === 'monthlySaving' ? '$' : ''}{item.val.toLocaleString()}</span>
                   </div>
                   <input type="range" min={item.min} max={item.max} step={item.step} value={item.val} onChange={(e) => updateField(item.field, Number(e.target.value))} className={`w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-${item.color}-600`} />
                 </div>
               ))}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow border border-slate-200 p-6">
             <div className="text-center mb-4">
               <p className="text-slate-500 text-sm">消極存錢 (存40年)</p>
               <p className="text-xl font-bold text-slate-600">${Math.round(finalPassive/10000)}萬</p>
               <p className="text-xs text-slate-400 mt-1">本金投入 ${Math.round(totalPrincipalPassive/10000)}萬</p>
             </div>
             <div className="border-t border-slate-100 my-4"></div>
             <div className="text-center">
               <p className="text-slate-500 text-sm">積極存錢 (存{activeYears}年)</p>
               <p className="text-3xl font-black text-purple-600 font-mono">${finalAsset}萬</p>
               <p className="text-xs text-slate-400 mt-1">
                 本金投入 ${Math.round(totalPrincipalActive/10000)}萬 
                 <span className="text-green-600 font-bold ml-1">(省下 ${Math.round((totalPrincipalPassive - totalPrincipalActive)/10000)}萬)</span>
               </p>
             </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-[400px] print-break-inside">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={fullChartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
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
        </div>
      </div>
    </div>
  );
};

const CarReplacementTool = ({ data, setData }) => {
  const safeData = {
    carPrice: Number(data?.carPrice) || 100, // 萬
    investReturnRate: Number(data?.investReturnRate) || 6, // %
    resaleRate: Number(data?.resaleRate) || 50 // %
  };
  const { carPrice, investReturnRate, resaleRate } = safeData;

  const downPayment = 20; 
  const loanAmount = carPrice - downPayment; 
  const loanMonthlyPayment = loanAmount * (14500/80); 

  const generateCycles = () => {
    const cycles = [];
    let policyPrincipal = carPrice * 1; 
    
    for(let i=1; i<=3; i++) {
        const monthlyDividend = (policyPrincipal * 10000 * (investReturnRate/100)) / 12;
        const netMonthlyPayment = loanMonthlyPayment - monthlyDividend;
        
        cycles.push({
            cycle: `第 ${i} 台車`,
            principal: Math.round(policyPrincipal),
            dividend: Math.round(monthlyDividend),
            originalPay: Math.round(loanMonthlyPayment),
            netPay: Math.round(netMonthlyPayment)
        });

        const resaleValue = carPrice * (resaleRate/100);
        const surplus = resaleValue - downPayment;
        policyPrincipal += surplus;
    }
    return cycles;
  };

  const cyclesData = generateCycles();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg print-break-inside">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Car className="text-orange-100" /> 五年換車專案</h3>
        <p className="text-orange-100 opacity-90">只存一次錢，運用時間複利與車輛殘值，實現每5年輕鬆換新車。</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4 print-break-inside">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2"><Calculator size={18} /> 參數設定</h4>
            <div className="space-y-6">
               {[
                 { label: "目標車價 (萬)", field: "carPrice", min: 60, max: 300, step: 10, val: carPrice, color: "orange" },
                 { label: "投資報酬率 (%)", field: "investReturnRate", min: 3, max: 10, step: 0.5, val: investReturnRate, color: "green" },
                 { label: "5年後中古殘值 (%)", field: "resaleRate", min: 30, max: 70, step: 5, val: resaleRate, color: "blue" }
               ].map((item) => (
                 <div key={item.field}>
                   <div className="flex justify-between mb-2">
                     <label className="text-sm font-medium text-slate-600">{item.label}</label>
                     <span className={`font-mono font-bold text-${item.color}-600`}>{item.val}</span>
                   </div>
                   <input type="range" min={item.min} max={item.max} step={item.step} value={item.val} onChange={(e) => setData({ ...safeData, [item.field]: Number(e.target.value) })} className={`w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-${item.color}-600`} />
                 </div>
               ))}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow border border-slate-200 p-6">
             <div className="text-center mb-4">
                <p className="text-slate-500 text-sm">傳統買車 (第3台)</p>
                <p className="text-xl font-bold text-slate-600">月付 ${Math.round(cyclesData[0].originalPay).toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-1">永遠在付全額車貸</p>
             </div>
             <div className="border-t border-slate-100 my-4"></div>
             <div className="text-center">
                <p className="text-slate-500 text-sm">專案換車 (第3台)</p>
                <p className="text-3xl font-black text-orange-600 font-mono">月付 ${cyclesData[2].netPay.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-1">越換越輕鬆，負擔減少 {Math.round((1 - cyclesData[2].netPay/cyclesData[0].originalPay)*100)}%</p>
             </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-[350px] print-break-inside">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={cyclesData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorNetPay" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/><stop offset="95%" stopColor="#f97316" stopOpacity={0.4}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="cycle" tick={{fontSize: 14, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                <YAxis unit="元" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend />
                <Bar dataKey="netPay" name="實際月付金" fill="url(#colorNetPay)" barSize={40} radius={[8, 8, 0, 0]} label={{ position: 'top', fill: '#f97316', fontSize: 12, fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="originalPay" name="原車貸月付" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" />
                <Line type="monotone" dataKey="dividend" name="保單配息折抵" stroke="#22c55e" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const LaborPensionTool = ({ data, setData }) => {
  const safeData = {
    currentAge: Number(data?.currentAge) || 30,
    retireAge: Number(data?.retireAge) || 65,
    salary: Number(data?.salary) || 45000,
    laborInsYears: Number(data?.laborInsYears) || 35, 
    selfContribution: Boolean(data?.selfContribution),
    pensionReturnRate: Number(data?.pensionReturnRate) || 3, 
    desiredMonthlyIncome: Number(data?.desiredMonthlyIncome) || 50000
  };
  const { currentAge, retireAge, salary, laborInsYears, selfContribution, pensionReturnRate, desiredMonthlyIncome } = safeData;

  const laborInsBase = Math.min(Math.max(salary, 26400), 45800); 
  const laborInsMonthly = laborInsBase * laborInsYears * 0.0155;

  const laborPensionWage = Math.min(salary, 150000); 
  const monthlyContribution = laborPensionWage * (0.06 + (selfContribution ? 0.06 : 0));
  const yearsToRetire = retireAge - currentAge;
  const monthsToRetire = yearsToRetire * 12;
  
  const monthlyRate = pensionReturnRate / 100 / 12;
  const pensionTotal = monthlyContribution * ((Math.pow(1 + monthlyRate, monthsToRetire) - 1) / monthlyRate);
  
  const pensionMonthly = pensionTotal / 240; 

  const totalGovPension = laborInsMonthly + pensionMonthly;
  const gap = desiredMonthlyIncome - totalGovPension;

  const chartData = [
    { name: '勞保年金', value: Math.round(laborInsMonthly), fill: '#3b82f6' },
    { name: '勞退月領', value: Math.round(pensionMonthly), fill: '#10b981' },
    { name: '退休缺口', value: Math.max(0, Math.round(gap)), fill: '#ef4444' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-2xl p-6 text-white shadow-lg print-break-inside">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Umbrella className="text-slate-200" /> 退休缺口試算</h3>
        <p className="text-slate-300 opacity-90">政府給的夠用嗎？30秒算出你的退休生活品質。</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4 print-break-inside">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2"><Calculator size={18} /> 個人參數</h4>
            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-xs font-bold text-slate-500">目前年齡</label>
                   <input type="number" value={currentAge} onChange={(e) => setData({ ...safeData, currentAge: Number(e.target.value) })} className="w-full p-2 border rounded mt-1" />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-slate-500">預計退休</label>
                   <input type="number" value={retireAge} onChange={(e) => setData({ ...safeData, retireAge: Number(e.target.value) })} className="w-full p-2 border rounded mt-1" />
                 </div>
               </div>

               <div>
                 <div className="flex justify-between mb-2">
                   <label className="text-sm font-medium text-slate-600">目前投保薪資</label>
                   <span className="font-mono font-bold text-slate-700">${salary.toLocaleString()}</span>
                 </div>
                 <input type="range" min={26400} max={150000} step={1000} value={salary} onChange={(e) => setData({ ...safeData, salary: Number(e.target.value) })} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600" />
               </div>

               <div>
                 <div className="flex justify-between mb-2">
                   <label className="text-sm font-medium text-slate-600">勞保累積年資</label>
                   <span className="font-mono font-bold text-slate-700">{laborInsYears} 年</span>
                 </div>
                 <input type="range" min={15} max={45} step={1} value={laborInsYears} onChange={(e) => setData({ ...safeData, laborInsYears: Number(e.target.value) })} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500" />
               </div>

               <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-sm font-bold text-slate-600">勞退自提 6%</span>
                  <button 
                    onClick={() => setData({ ...safeData, selfContribution: !selfContribution })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${selfContribution ? 'bg-green-500' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${selfContribution ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
               </div>

               <div>
                 <div className="flex justify-between mb-2">
                   <label className="text-sm font-medium text-slate-600">理想退休月收</label>
                   <span className="font-mono font-bold text-red-500">${desiredMonthlyIncome.toLocaleString()}</span>
                 </div>
                 <input type="range" min={30000} max={150000} step={5000} value={desiredMonthlyIncome} onChange={(e) => setData({ ...safeData, desiredMonthlyIncome: Number(e.target.value) })} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500" />
               </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow border border-slate-200 p-6">
             <div className="text-center mb-4">
                <p className="text-slate-500 text-sm">政府給你的 (每月)</p>
                <p className="text-2xl font-bold text-slate-700">${Math.round(totalGovPension).toLocaleString()}</p>
             </div>
             <div className="border-t border-slate-100 my-4"></div>
             <div className="text-center">
                <p className="text-slate-500 text-sm">財務缺口 (每月)</p>
                <p className="text-4xl font-black text-red-500 font-mono">${Math.max(0, Math.round(gap)).toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-1">不工作時，你每個月少這些錢</p>
             </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[450px]">
             <h4 className="font-bold text-slate-700 mb-4 pl-2">退休金結構分析</h4>
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ name: '月收入', ...chartData.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.value }), {}) }]} margin={{ top: 20, right: 40, left: 40, bottom: 5 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tick={{fontSize: 14}} axisLine={false} tickLine={false} width={100} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Legend />
                  {chartData.map((d, i) => (
                     <Bar key={i} dataKey={d.name} fill={d.fill} barSize={40} label={{ position: 'right', fill: '#64748b', fontWeight: 'bold', formatter: (val) => `$${val}萬` }} />
                  ))}
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const BigSmallReservoirTool = ({ data, setData }) => {
  const safeData = {
    initialCapital: Number(data?.initialCapital) || 1000, // 萬
    dividendRate: Number(data?.dividendRate) || 6, // %
    reinvestRate: Number(data?.reinvestRate) || 6, // %
    years: Number(data?.years) || 10 // 年
  };
  const { initialCapital, dividendRate, reinvestRate, years } = safeData;

  const annualDividend = initialCapital * (dividendRate / 100);

  const generateChartData = () => {
    const dataArr = [];
    let reinvestedTotal = 0; // 累積的小水庫資產

    for (let year = 1; year <= years + 5; year++) {
      if (year <= years) {
         reinvestedTotal = (reinvestedTotal + annualDividend) * (1 + reinvestRate / 100);
      } else {
         reinvestedTotal = reinvestedTotal * (1 + reinvestRate / 100);
      }

      dataArr.push({
        year: `第${year}年`,
        大水庫本金: initialCapital,
        小水庫累積: Math.round(reinvestedTotal),
        total: initialCapital + Math.round(reinvestedTotal)
      });
    }
    return dataArr;
  };

  const chartData = generateChartData();
  const finalSmallReservoir = chartData[years-1]?.小水庫累積 || 0;
  const totalAsset = initialCapital + finalSmallReservoir;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg print-break-inside">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Waves className="text-cyan-200" /> 大小水庫專案</h3>
        <p className="text-cyan-100 opacity-90">資產活化術：母錢生子錢，子錢再生孫錢。十年翻倍計畫。</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4 print-break-inside">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2"><Calculator size={18} /> 參數設定</h4>
            <div className="space-y-6">
               <div>
                 <div className="flex justify-between mb-2">
                   <label className="text-sm font-medium text-slate-600">大水庫本金 (萬)</label>
                   <span className="font-mono font-bold text-blue-600">${initialCapital}</span>
                 </div>
                 <input type="range" min={100} max={5000} step={50} value={initialCapital} onChange={(e) => setData({ ...safeData, initialCapital: Number(e.target.value) })} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
               </div>

               <div>
                 <div className="flex justify-between mb-2">
                   <label className="text-sm font-medium text-slate-600">大水庫配息率 (%)</label>
                   <span className="font-mono font-bold text-cyan-600">{dividendRate}%</span>
                 </div>
                 <input type="range" min={3} max={10} step={0.5} value={dividendRate} onChange={(e) => setData({ ...safeData, dividendRate: Number(e.target.value) })} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                 <p className="text-xs text-slate-400 mt-1">每年產生 ${annualDividend}萬 現金流</p>
               </div>

               <div>
                 <div className="flex justify-between mb-2">
                   <label className="text-sm font-medium text-slate-600">小水庫滾存率 (%)</label>
                   <span className="font-mono font-bold text-orange-500">{reinvestRate}%</span>
                 </div>
                 <input type="range" min={3} max={12} step={0.5} value={reinvestRate} onChange={(e) => setData({ ...safeData, reinvestRate: Number(e.target.value) })} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500" />
               </div>
               
               <div>
                 <div className="flex justify-between mb-2">
                   <label className="text-sm font-medium text-slate-600">規劃年期 (年)</label>
                   <span className="font-mono font-bold text-slate-700">{years} 年</span>
                 </div>
                 <input type="range" min={5} max={20} step={1} value={years} onChange={(e) => setData({ ...safeData, years: Number(e.target.value) })} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-500" />
               </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow border border-slate-200 p-6">
             <div className="text-center mb-4">
                <p className="text-slate-500 text-sm">目前資產</p>
                <p className="text-2xl font-bold text-slate-700">${initialCapital}萬</p>
             </div>
             <div className="border-t border-slate-100 my-4"></div>
             <div className="text-center">
                <p className="text-slate-500 text-sm">{years}年後總資產</p>
                <p className="text-4xl font-black text-cyan-600 font-mono">${totalAsset}萬</p>
                <p className="text-xs text-slate-400 mt-1">
                   本金${initialCapital} + 小水庫${finalSmallReservoir}
                </p>
             </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[450px]">
             <h4 className="font-bold text-slate-700 mb-4 pl-2">資產堆疊增長圖</h4>
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorBig" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0891b2" stopOpacity={0.8}/><stop offset="95%" stopColor="#0891b2" stopOpacity={0.4}/></linearGradient>
                    <linearGradient id="colorSmall" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8}/><stop offset="95%" stopColor="#fbbf24" stopOpacity={0.4}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="year" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis unit="萬" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Legend />
                  <Area type="monotone" dataKey="小水庫累積" stackId="1" stroke="#fbbf24" fill="url(#colorSmall)" />
                  <Area type="monotone" dataKey="大水庫本金" stackId="1" stroke="#0891b2" fill="url(#colorBig)" />
                </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const TaxPlannerTool = ({ data, setData }) => {
  const safeData = {
    spouse: Boolean(data?.spouse), // 有無配偶
    children: Number(data?.children) || 2, // 子女人數
    parents: Number(data?.parents) || 0, // 父母人數
    cash: Number(data?.cash) || 3000, // 現金 (萬)
    realEstate: Number(data?.realEstate) || 2000, // 不動產 (萬)
    stocks: Number(data?.stocks) || 1000, // 股票 (萬)
    insurancePlan: Number(data?.insurancePlan) || 0 // 規劃移轉至保險的金額 (萬)
  };
  const { spouse, children, parents, cash, realEstate, stocks, insurancePlan } = safeData;

  const totalAssets = cash + realEstate + stocks;
  
  const exemption = 1333; // 免稅額
  const deductionSpouse = spouse ? 553 : 0;
  const deductionChildren = children * 56;
  const deductionParents = parents * 138;
  const deductionFuneral = 138; // 喪葬費
  
  const totalDeductions = exemption + deductionSpouse + deductionChildren + deductionParents + deductionFuneral;

  const netEstateRaw = Math.max(0, totalAssets - totalDeductions);
  
  const plannedAssets = Math.max(0, totalAssets - insurancePlan);
  const netEstatePlanned = Math.max(0, plannedAssets - totalDeductions);

  const calculateTax = (netEstate) => {
    if (netEstate <= 5000) return netEstate * 0.10;
    if (netEstate <= 10000) return netEstate * 0.15 - 250;
    return netEstate * 0.20 - 750;
  };

  const taxRaw = calculateTax(netEstateRaw);
  const taxPlanned = calculateTax(netEstatePlanned);
  const taxSaved = taxRaw - taxPlanned;

  const chartData = [
    { name: '未規劃稅金', value: Math.round(taxRaw), fill: '#ef4444' },
    { name: '規劃後稅金', value: Math.round(taxPlanned), fill: '#3b82f6' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-slate-600 to-zinc-700 rounded-2xl p-6 text-white shadow-lg print-break-inside">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Landmark className="text-slate-200" /> 稅務傳承專案</h3>
        <p className="text-slate-300 opacity-90">善用保險免稅額度，合法預留稅源，讓資產無痛傳承。</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4 print-break-inside">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 no-print">
            <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2"><Calculator size={18} /> 資產與家庭</h4>
            <div className="space-y-6">
               <div className="space-y-3">
                 <div className="flex items-center justify-between">
                   <label className="text-sm text-slate-600">配偶健在</label>
                   <input type="checkbox" checked={spouse} onChange={(e) => setData({...safeData, spouse: e.target.checked})} className="w-5 h-5 accent-slate-600" />
                 </div>
                 <div className="flex items-center justify-between">
                   <label className="text-sm text-slate-600">子女人數</label>
                   <input type="number" min={0} max={10} value={children} onChange={(e) => setData({...safeData, children: Number(e.target.value)})} className="w-16 p-1 border rounded text-right" />
                 </div>
               </div>

               <div>
                 <div className="flex justify-between mb-2">
                   <label className="text-sm font-medium text-slate-600">現金存款 (萬)</label>
                   <span className="font-mono font-bold text-slate-700">${cash}</span>
                 </div>
                 <input type="range" min={0} max={10000} step={100} value={cash} onChange={(e) => setData({ ...safeData, cash: Number(e.target.value) })} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600" />
               </div>
               
               <div>
                 <div className="flex justify-between mb-2">
                   <label className="text-sm font-medium text-slate-600">不動產現值 (萬)</label>
                   <span className="font-mono font-bold text-slate-700">${realEstate}</span>
                 </div>
                 <input type="range" min={0} max={10000} step={100} value={realEstate} onChange={(e) => setData({ ...safeData, realEstate: Number(e.target.value) })} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600" />
               </div>

               <div className="pt-4 border-t border-slate-100">
                 <div className="flex justify-between mb-2">
                   <label className="text-sm font-bold text-blue-600 flex items-center gap-1"><ShieldAlert size={14}/> 規劃轉入保險 (萬)</label>
                   <span className="font-mono font-bold text-blue-600">${insurancePlan}</span>
                 </div>
                 <input type="range" min={0} max={Math.min(cash, 3330)} step={100} value={insurancePlan} onChange={(e) => setData({ ...safeData, insurancePlan: Number(e.target.value) })} className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                 <p className="text-xs text-slate-400 mt-1">最高 3,330 萬 (最低稅負制免稅額)</p>
               </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow border border-slate-200 p-6">
             <div className="text-center mb-4">
                <p className="text-slate-500 text-sm">原本應繳稅金</p>
                <p className="text-2xl font-bold text-red-500">${Math.round(taxRaw).toLocaleString()}萬</p>
             </div>
             <div className="border-t border-slate-100 my-4"></div>
             <div className="text-center">
                <p className="text-slate-500 text-sm">節稅效益</p>
                <p className="text-4xl font-black text-green-600 font-mono">省 ${Math.round(taxSaved).toLocaleString()}萬</p>
                <p className="text-xs text-slate-400 mt-1">
                   規劃後稅金僅需 ${Math.round(taxPlanned).toLocaleString()}萬
                </p>
             </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[400px]">
             <h4 className="font-bold text-slate-700 mb-4 pl-2">遺產稅負擔對比</h4>
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tick={{fontSize: 14}} axisLine={false} tickLine={false} width={100} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="value" barSize={40} radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#64748b', fontWeight: 'bold', formatter: (val) => `$${val}萬` }}>
                  </Bar>
                </BarChart>
             </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
             <div className="bg-slate-50 p-4 rounded-lg text-center border border-slate-200">
                <div className="text-xs text-slate-500 font-bold mb-1">資產總額</div>
                <div className="text-xl font-bold text-slate-700">${totalAssets}萬</div>
             </div>
             <div className="bg-slate-50 p-4 rounded-lg text-center border border-slate-200">
                <div className="text-xs text-slate-500 font-bold mb-1">免稅額+扣除額</div>
                <div className="text-xl font-bold text-slate-700">${totalDeductions}萬</div>
             </div>
             <div className="bg-slate-50 p-4 rounded-lg text-center border border-slate-200">
                <div className="text-xs text-slate-500 font-bold mb-1">遺產淨額 (未規劃)</div>
                <div className="text-xl font-bold text-slate-700">${netEstateRaw}萬</div>
             </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex gap-3">
             <AlertTriangle className="text-yellow-600 flex-shrink-0" />
             <div className="text-xs text-yellow-800 space-y-1">
               <p className="font-bold">實質課稅原則提醒 (八大態樣)：</p>
               <ul className="list-disc pl-4 opacity-90">
                 <li>重病投保、高齡投保、短期投保、躉繳投保、舉債投保、鉅額投保、保費略高於保額、保費等於保額。</li>
                 <li>以上情況可能被國稅局視為惡意避稅，仍需計入遺產總額課稅。建議及早規劃，分散風險。</li>
               </ul>
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false); 

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

  const showToast = (message, type = 'success') => { setToast({ message, type }); };
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