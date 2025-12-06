import React, { useState, useEffect } from 'react';
import { 
  Wallet, Building2, Calculator, Coins, CheckCircle2, Scale, 
  FileText, Menu, X, LogOut, User as UserIcon, Settings, 
  Loader2, ArrowUpFromLine, Check, ShieldAlert, Edit3, 
  GraduationCap, Umbrella, Waves, Landmark, Lock, TrendingUp, 
  Clock, PauseCircle, Rocket, Car, Repeat, HeartHandshake, 
  Droplets, AlertTriangle, FileBarChart, PieChart
} from 'lucide-react';
import { 
  BarChart, AreaChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ComposedChart, 
  Area, Line 
} from 'recharts';
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, initializeFirestore, memoryLocalCache } from 'firebase/firestore';

// --- Firebase Config ---
const apiKey = "AIzaSyAqS6fhHQVyBNr1LCkCaQPyJ13Rkq7bfHA"; 
const authDomain = "grbt-f87fa.firebaseapp.com";
const projectId = "grbt-f87fa";
const storageBucket = "grbt-f87fa.firebasestorage.app";
const messagingSenderId = "169700005946";
const appId = "1:169700005946:web:9b0722f31aa9fe7ad13d03";

const firebaseConfig = { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = initializeFirestore(app, { experimentalForceLongPolling: true, localCache: memoryLocalCache() });

// --- Helpers ---
const calculateMonthlyPayment = (p, r, y) => {
  if (!p || !r || !y) return 0;
  const rate = r / 100 / 12;
  const n = y * 12;
  return (p * 10000 * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
};
const calculateMonthlyIncome = (p, r) => (p * 10000 * (r / 100)) / 12;
const calculateRemainingBalance = (p, r, y, elapsed) => {
  const rate = r / 100 / 12;
  const n = y * 12;
  const paid = elapsed * 12;
  return (p * 10000 * (Math.pow(1 + rate, n) - Math.pow(1 + rate, paid))) / (Math.pow(1 + rate, n) - 1);
};

// --- Styles & UI ---
const PrintStyles = () => (
  <style>{`
    @media print {
      aside, .no-print, .toast-container, .mobile-header { display: none !important; }
      body { background: white !important; height: auto !important; overflow: visible !important; }
      .print-break-inside { break-inside: avoid; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      #report-modal { position: static !important; overflow: visible !important; height: auto !important; width: 100% !important; z-index: 9999; }
      .recharts-wrapper { width: 100% !important; height: auto !important; }
      .absolute { position: static !important; }
    }
  `}</style>
);

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const colors = { success: 'bg-green-600', error: 'bg-red-600', info: 'bg-blue-600' };
  return (
    <div className={`fixed bottom-6 right-6 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-bounce-in z-[100] toast-container`}>
      {type === 'success' ? <Check size={20} /> : <ShieldAlert size={20} />}
      <span className="font-bold">{message}</span>
    </div>
  );
};

const NavItem = ({ icon: Icon, label, active, onClick, disabled = false }) => (
  <button onClick={onClick} disabled={disabled} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${disabled ? 'opacity-50' : active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
    <Icon size={20} /> <span className="font-medium flex-1 text-left">{label}</span> {disabled && <Lock size={14} />}
  </button>
);

// --- Report Modal ---
const ReportModal = ({ isOpen, onClose, user, activeTab, data }) => {
  const [customerName, setCustomerName] = useState('');
  if (!isOpen) return null;
  const dateStr = new Date().toLocaleDateString('zh-TW');
  let report = { title: '', mindMap: [], table: [], highlights: [], chartData: [], chartType: 'composed' };

  if (activeTab === 'gift') {
    const loan = data.loanAmount;
    const chartData = [];
    const monthlyLoanPayment = calculateMonthlyPayment(loan, data.loanRate, data.loanTerm);
    const monthlyInvestIncomeSingle = calculateMonthlyIncome(loan, data.investReturnRate);
    const phase1_NetOut = monthlyLoanPayment - monthlyInvestIncomeSingle;
    const stdMonthlySaving = 3000000 / 180;
    let accStd = 0, accProj = 0, asset = 0;
    for (let y = 1; y <= 15; y++) {
      accStd += stdMonthlySaving * 12;
      let activeLoans = y <= 7 ? 1 : y <= 14 ? 2 : 3; 
      let cost = (monthlyLoanPayment * activeLoans) - (monthlyInvestIncomeSingle * activeLoans);
      accProj += cost * 12;
      asset = loan * activeLoans * 10000;
      chartData.push({ year: `第${y}年`, 一般存錢: Math.round(accStd/10000), 專案成本: Math.round(accProj/10000), 專案資產: Math.round(asset/10000) });
    }
    report = {
      title: '百萬禮物專案',
      mindMap: [
        { label: '核心策略', value: '以息養貸' }, { label: '投入資源', value: `信貸 ${loan} 萬` },
        { label: '時間槓桿', value: `15 年循環` }, { label: '預期成果', value: `資產 ${loan*3} 萬` },
        { label: '人生意義', value: '第一桶金' }
      ],
      table: [
        { label: '第 1-7 年', col1: '啟動期', col2: `持有 ${loan} 萬` },
        { label: '第 8-14 年', col1: '循環期', col2: `持有 ${loan*2} 萬` },
        { label: '第 15 年', col1: '收割期', col2: `持有 ${loan*3} 萬` },
      ],
      highlights: [`每月負擔約 $${Math.round(phase1_NetOut).toLocaleString()}。`, '善用低利資金，時間換資產。', '三次循環，15年無痛擁有300萬。'],
      chartData, chartType: 'composed_gift'
    };
  } else if (activeTab === 'estate') {
    const loan = data.loanAmount;
    const monthlyCash = calculateMonthlyIncome(loan, data.investReturnRate) - calculateMonthlyPayment(loan, data.loanRate, data.loanTerm);
    const isNeg = monthlyCash < 0;
    const totalPocket = Math.abs(monthlyCash) * 12 * data.loanTerm;
    const chartData = [];
    let accNet = 0;
    for(let y=1; y<=data.loanTerm; y++) {
       accNet += monthlyCash * 12;
       const bal = calculateRemainingBalance(loan, data.loanRate, data.loanTerm, y);
       if(y===1 || y%5===0 || y===data.loanTerm) chartData.push({ year: `第${y}年`, 總資產: Math.round(((loan*10000)-bal+accNet)/10000), 剩餘貸款: Math.round(bal/10000) });
    }
    report = {
      title: '金融房產專案',
      mindMap: [
        { label: '核心策略', value: '數位包租公' }, { label: '資產規模', value: `${loan} 萬` },
        { label: '現金流', value: `月${isNeg?'付':'領'} ${Math.abs(Math.round(monthlyCash)).toLocaleString()}` },
        { label: '最終歸屬', value: '資產全拿' }, { label: '人生意義', value: '被動收入' }
      ],
      table: [
        { label: '第 1 年', col1: '建置期', col2: '現金流啟動' },
        { label: `第 ${Math.round(data.loanTerm/2)} 年`, col1: '持守期', col2: '還款過半' },
        { label: `第 ${data.loanTerm} 年`, col1: '自由期', col2: `擁有 ${loan} 萬` },
      ],
      highlights: isNeg ? [`槓桿效益：總自付約 ${Math.round(totalPocket/10000)} 萬，換 ${loan} 萬資產。`, '強迫儲蓄的最佳工具。'] : ['以息養貸，無需自掏腰包。', '期滿無痛擁有千萬資產。'],
      chartData, chartType: 'composed_estate'
    };
  } else if (activeTab === 'student') {
    const totalTime = data.gracePeriod + data.interestOnlyPeriod + data.years;
    const profit = data.loanAmount * 10000 * Math.pow(1 + data.investReturnRate/100, totalTime) - (calculateMonthlyPayment(data.loanAmount, 1.775, data.years) * 12 * data.years);
    const chartData = [];
    let val = data.loanAmount * 10000, bal = data.loanAmount * 10000;
    for(let y=1; y<=totalTime+2; y++) {
        val *= (1+data.investReturnRate/100);
        if(y > data.gracePeriod + data.interestOnlyPeriod && y <= totalTime) bal = calculateRemainingBalance(data.loanAmount, 1.775, data.years, y-(data.gracePeriod+data.interestOnlyPeriod));
        else if (y > totalTime) bal = 0;
        chartData.push({ year: `第${y}年`, 投資複利: Math.round(val/10000), 淨資產: Math.round((val-bal)/10000), 若還清: 0 });
    }
    report = {
      title: '學貸套利專案',
      mindMap: [
        { label: '核心策略', value: '低利套利' }, { label: '學貸金額', value: `${data.loanAmount} 萬` },
        { label: '寬限策略', value: `${data.gracePeriod}年寬限` }, { label: '淨獲利', value: `${Math.round(profit/10000)} 萬` },
        { label: '人生意義', value: '理財紀律' }
      ],
      table: [
        { label: '辦理學貸時', col1: '投入期', col2: '啟動投資' },
        { label: '寬限結束', col1: '還款期', col2: '以息繳貸' },
        { label: '8 年後', col1: '無債期', col2: '多賺一筆' },
      ],
      highlights: ['利用政府補貼 1.775% 低利貸款。', '學費轉為資產種子。', '畢業即擁有人生第一桶金。'],
      chartData, chartType: 'composed_student'
    };
  } else if (activeTab === 'super_active') {
    const chartData = [];
    let p=0, a=0;
    for(let y=1; y<=40; y++) { p+=data.monthlySaving*12; if(y<=data.activeYears) a=(a+data.monthlySaving*12)*(1+data.investReturnRate/100); else a*=(1+data.investReturnRate/100); chartData.push({year:`${y}`, 消極: Math.round(p/10000), 積極: Math.round(a/10000)}); }
    const finalAsset = Math.round(chartData[39].積極);
    report = {
      title: '超積極存錢法',
      mindMap: [
        { label: '核心策略', value: '複利滾存' }, { label: '努力期間', value: `${data.activeYears} 年` },
        { label: '每月投入', value: `${data.monthlySaving}` }, { label: '30年資產', value: `約 ${finalAsset} 萬` },
        { label: '人生意義', value: '提早退休' }
      ],
      table: [
        { label: `第 ${data.activeYears} 年`, col1: '投入結束', col2: '本金到位' },
        { label: `第 20 年`, col1: '滾存期', col2: '資產翻倍' },
        { label: `第 30 年`, col1: '爆發期', col2: '財富自由' },
      ],
      highlights: ['只需辛苦一陣子，享受一輩子。', '利用複利效應，大幅減少本金投入。', '提早達成財務目標。'],
      chartData, chartType: 'composed_active'
    };
  } else if (activeTab === 'car') {
    const cycles = [];
    let princ = data.carPrice * 1, loan = data.carPrice - 20;
    const pay = loan * (14500/80); 
    for(let i=1; i<=3; i++) {
        const div = (princ * 10000 * (data.investReturnRate/100)) / 12;
        cycles.push({ cycle: `第 ${i} 台`, principal: Math.round(princ), dividend: Math.round(div), originalPay: Math.round(pay), netPay: Math.round(pay - div) });
        princ += (data.carPrice * (data.resaleRate/100) - 20);
    }
    report = {
      title: '五年換車專案',
      mindMap: [
        { label: '核心策略', value: '資金回流' }, { label: '目標車價', value: `${data.carPrice} 萬` },
        { label: '運作模式', value: '以息養車' }, { label: '負擔趨勢', value: '逐次遞減' },
        { label: '人生意義', value: '生活品質' }
      ],
      table: [{ label: '第 1 台', col1: '建立本金', col2: '負擔較重' }, { label: '第 2 台', col1: '配息折抵', col2: '負擔減輕' }, { label: '第 3 台', col1: '資產滾大', col2: '幾近免費' }],
      highlights: ['打破買車即負債的傳統觀念。', '資產越滾越大，車貸越繳越少。', '維持生活品質，每五年輕鬆換新車。'],
      chartData: cycles, chartType: 'composed_car'
    };
  } else if (activeTab === 'reservoir') {
    const chartData = [];
    const div = data.initialCapital * (data.dividendRate / 100);
    let total = 0; 
    for (let y = 1; y <= data.years + 5; y++) {
      if (y <= data.years) total = (total + div) * (1 + data.reinvestRate / 100);
      else total = total * (1 + data.reinvestRate / 100);
      chartData.push({ year: `第${y}年`, 大水庫: data.initialCapital, 小水庫: Math.round(total) });
    }
    report = {
      title: '大小水庫專案',
      mindMap: [
        { label: '核心策略', value: '資產活化' }, { label: '大水庫', value: `${data.initialCapital} 萬` },
        { label: '小水庫', value: '配息再投' }, { label: '預期總值', value: `翻倍成長` },
        { label: '人生意義', value: '資產傳承' }
      ],
      table: [
        { label: '第 1 年', col1: '啟動期', col2: '建立水管' },
        { label: `第 ${Math.round(data.years/2)} 年`, col1: '累積期', col2: '小水庫成形' },
        { label: `第 ${data.years} 年`, col1: '收割期', col2: '資產翻倍' },
      ],
      highlights: ['策略效益：完全不需要再拿錢出來，只需搬運配息。', '母金不動，僅用孳息創造第二桶金。', '零風險資產倍增術。'],
      chartData, chartType: 'area_reservoir'
    };
  } else if (activeTab === 'pension') {
     const labor = Math.min(Math.max(data.salary, 26400), 45800) * data.laborInsYears * 0.0155;
     const pension = (Math.min(data.salary, 150000) * (0.06 + (data.selfContribution?0.06:0)) * 12 * (data.retireAge-data.currentAge) * Math.pow(1+data.pensionReturnRate/100, (data.retireAge-data.currentAge)/2)) / 240; 
     const gap = data.desiredMonthlyIncome - labor - pension;
     report = {
      title: '退休缺口試算',
      mindMap: [
        { label: '核心策略', value: '補足缺口' }, { label: '理想月退', value: `${data.desiredMonthlyIncome}` },
        { label: '財務缺口', value: `月 ${Math.abs(Math.round(gap))}` }, { label: '人生意義', value: '尊嚴養老' }
      ],
      table: [{ label: '60 歲', col1: '退休前', col2: '衝刺期' }, { label: '65 歲', col1: '退休時', col2: '開始領錢' }, { label: '85 歲', col1: '長壽風險', col2: '現金流' }],
      highlights: ['勞退自提讓退休金翻倍。', '提早規劃，用時間複利填補缺口。', `需填補 ${Math.round(gap).toLocaleString()} 元缺口。`],
      chartData: [{name: '勞保', value: Math.round(labor/10000), fill: '#3b82f6'}, {name: '勞退', value: Math.round(pension/10000), fill: '#10b981'}, {name: '缺口', value: Math.round(Math.max(0, gap)/10000), fill: '#ef4444'}],
      chartType: 'bar_pension'
     };
  } else if (activeTab === 'tax') {
     const exempt = 1333 + (data.spouse?553:0) + data.children*56 + data.parents*138 + 138;
     const total = data.cash + data.realEstate + data.stocks;
     const raw = Math.max(0, total - exempt);
     const plan = Math.max(0, total - data.insurancePlan - exempt);
     const calcTax = (n) => n<=5000 ? n*0.1 : n<=10000 ? n*0.15-250 : n*0.2-750;
     report = {
      title: '稅務傳承專案',
      mindMap: [
        { label: '核心策略', value: '預留稅源' }, { label: '資產總額', value: `${total} 萬` },
        { label: '保險額度', value: `${data.insurancePlan} 萬` }, { label: '節稅效益', value: '資產保全' },
        { label: '人生意義', value: '富過三代' }
      ],
      table: [{ label: '規劃前', col1: '遺產淨額高', col2: '稅金沉重' }, { label: '規劃後', col1: '善用免稅額', col2: '稅金銳減' }, { label: '傳承時', col1: '現金足夠', col2: '無痛繳稅' }],
      highlights: ['善用保險給付免稅額度，合法降低遺產總額。', '預留現金稅源，避免子孫變賣家產繳稅。', '資產保全，讓財富完整傳承。'],
      chartData: [{ name: '未規劃', value: Math.round(calcTax(raw)), fill: '#ef4444' }, { name: '規劃後', value: Math.round(calcTax(plan)), fill: '#3b82f6' }],
      chartType: 'bar_tax'
     };
  }

  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-fade-in overflow-auto" id="report-modal">
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md print:hidden sticky top-0 z-50">
        <div className="font-bold text-lg"><FileBarChart className="inline-block mr-2"/> 規劃報告</div>
        <div className="flex gap-3">
           <input type="text" placeholder="客戶姓名" value={customerName} onChange={e=>setCustomerName(e.target.value)} className="px-3 py-1.5 rounded text-slate-900 text-sm w-32"/>
           <button onClick={()=>window.print()} className="bg-blue-600 px-4 py-2 rounded font-bold flex gap-2"><ArrowUpFromLine size={18}/> 列印</button>
           <button onClick={onClose} className="bg-slate-700 px-4 py-2 rounded font-bold"><X size={18}/></button>
        </div>
      </div>
      <div className="max-w-4xl mx-auto p-8 w-full bg-white text-slate-800 print:p-0">
        <div className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-end">
           <div><h1 className="text-4xl font-black text-slate-900 mb-2">{report.title}</h1><p className="text-xl text-slate-500">專屬資產戰略規劃書</p></div>
           <div className="text-right text-sm text-slate-600"><p className="font-bold text-lg mb-1">{customerName ? customerName+' 貴賓' : '貴賓專屬'}</p><p>規劃顧問：{user?.displayName || '理財顧問'}</p><p>日期：{dateStr}</p></div>
        </div>
        <div className="mb-8 print:mb-4">
           <h2 className="text-lg font-bold text-slate-900 border-l-4 border-blue-600 pl-3 mb-6 print:mb-3">戰略思維</h2>
           <div className="flex flex-wrap gap-4 justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100 print:bg-white print:border-0 print:p-0 print:justify-start">
              <div className="bg-slate-800 text-white px-6 py-4 rounded-xl font-bold text-xl print:border print:border-slate-900 print:text-black print:bg-transparent">{report.title}</div>
              {report.mindMap.map((item, i) => (
                 <div key={i} className="flex items-center gap-2 border p-2 rounded bg-white print:border-slate-300"><span className="text-xs font-bold text-slate-400">{item.label}:</span><span className="font-bold">{item.value}</span></div>
              ))}
           </div>
        </div>
        {report.chartType !== 'none' && (
        <div className="mb-8 print:mb-4 print-break-inside">
           <h2 className="text-lg font-bold text-slate-900 border-l-4 border-orange-500 pl-3 mb-6 print:mb-3">資產趨勢</h2>
           <div className="h-[300px] w-full border border-slate-200 rounded-xl p-4 print:h-[250px] print:border-0 print:p-0">
              <ResponsiveContainer width="100%" height="100%">
                {report.chartType.startsWith('bar') ? (
                   <BarChart data={report.chartData} layout="vertical" margin={{left: 20}}><XAxis type="number" hide/><YAxis dataKey={report.chartType==='bar_tax'?'name':'n'} type="category" width={80}/><Bar dataKey="value" label={{position: 'right', formatter: v=>`${v}萬`}} fill="#8884d8"/></BarChart>
                ) : report.chartType === 'area_reservoir' ? (
                   <AreaChart data={report.chartData}><CartesianGrid vertical={false}/><XAxis dataKey="year"/><YAxis unit="萬"/><Legend/><Area dataKey="小水庫" stackId="1" fill="#fbbf24"/><Area dataKey="大水庫" stackId="1" fill="#0891b2"/></AreaChart>
                ) : (
                   <ComposedChart data={report.chartData}>
                      <CartesianGrid vertical={false}/><XAxis dataKey={report.chartType==='composed_car'?'cycle':'year'}/><YAxis/><Legend/>
                      {report.chartType === 'composed_gift' && <><Area dataKey="專案資產" fill="#3b82f6" fillOpacity={0.2}/><Line dataKey="一般存錢" stroke="#94a3b8"/></>}
                      {report.chartType === 'composed_estate' && <><Area dataKey="總資產" fill="#10b981" fillOpacity={0.3}/><Line dataKey="剩餘貸款" stroke="#ef4444"/></>}
                      {report.chartType === 'composed_student' && <><Area dataKey="淨資產" fill="#0ea5e9" fillOpacity={0.3}/><Line dataKey="若還清" stroke="#94a3b8"/></>}
                      {report.chartType === 'composed_active' && <><Area dataKey="積極" fill="#9333ea" fillOpacity={0.3}/><Line dataKey="消極" stroke="#94a3b8"/></>}
                      {report.chartType === 'composed_car' && <><Bar dataKey="netPay" fill="#f97316"/><Line dataKey="originalPay" stroke="#94a3b8"/></>}
                   </ComposedChart>
                )}
              </ResponsiveContainer>
           </div>
        </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:gap-4">
           <div className="print-break-inside">
              <h2 className="text-lg font-bold text-slate-900 border-l-4 border-green-600 pl-3 mb-6 print:mb-2">關鍵里程碑</h2>
              <table className="w-full text-left border-collapse">
                 <thead><tr className="bg-slate-100 text-sm print:bg-gray-100"><th className="p-2">時間</th><th className="p-2">階段</th><th className="p-2">成效</th></tr></thead>
                 <tbody>{report.table.map((r,i)=><tr key={i} className="border-b"><td className="p-2 font-bold">{r.label}</td><td className="p-2">{r.col1}</td><td className="p-2 font-bold text-blue-600">{r.col2}</td></tr>)}</tbody>
              </table>
           </div>
           <div className="print-break-inside">
              <h2 className="text-lg font-bold text-slate-900 border-l-4 border-yellow-500 pl-3 mb-6 print:mb-2">專案亮點</h2>
              <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-100 print:bg-white print:border-slate-200">
                 <ul className="space-y-2">{report.highlights.map((h,i)=><li key={i} className="flex gap-2"><CheckCircle2 size={18} className="text-yellow-600 shrink-0"/><span>{h}</span></li>)}</ul>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// Tools
// ------------------------------------------------------------------

const MillionDollarGiftTool = ({ data, setData }) => {
  const update = (k, v) => setData({...data, [k]: v});
  const mNet = calculateMonthlyPayment(data.loanAmount, data.loanRate, data.loanTerm) - calculateMonthlyIncome(data.loanAmount, data.investReturnRate);
  return (
    <div className="space-y-6 animate-fade-in">
       <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-lg"><h3 className="font-bold flex gap-2"><Wallet/> 百萬禮物 (300萬目標)</h3><p>三次循環，15年累積300萬。</p></div>
       <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white p-6 rounded-xl border space-y-4">
             <label>單次額度: {data.loanAmount}萬</label><input type="range" min="50" max="200" value={data.loanAmount} onChange={e=>update('loanAmount', +e.target.value)} className="w-full"/>
             <label>利率: {data.loanRate}%</label><input type="range" min="1.5" max="5" step="0.1" value={data.loanRate} onChange={e=>update('loanRate', +e.target.value)} className="w-full"/>
             <label>報酬率: {data.investReturnRate}%</label><input type="range" min="3" max="10" step="0.5" value={data.investReturnRate} onChange={e=>update('investReturnRate', +e.target.value)} className="w-full"/>
             <div className="bg-slate-50 p-4 text-center"><p>每月實付</p><p className="text-2xl font-bold text-blue-600">${Math.round(mNet).toLocaleString()}</p></div>
          </div>
          <div className="lg:col-span-8 bg-white p-4 rounded-xl border h-[300px]"><ResponsiveContainer><ComposedChart data={Array.from({length:15},(_,i)=>({y:`${i+1}`, v: (i<7?data.loanAmount:(i<14?data.loanAmount*2:data.loanAmount*3))}))}><XAxis dataKey="y"/><YAxis/><Area dataKey="v" fill="#3b82f6"/></ComposedChart></ResponsiveContainer></div>
       </div>
    </div>
  );
};

const FinancialRealEstateTool = ({ data, setData }) => {
  const update = (k, v) => setData({...data, [k]: v});
  const cf = calculateMonthlyIncome(data.loanAmount, data.investReturnRate) - calculateMonthlyPayment(data.loanAmount, data.loanRate, data.loanTerm);
  return (
    <div className="space-y-6 animate-fade-in">
       <div className="bg-emerald-600 p-6 rounded-2xl text-white shadow-lg"><h3 className="font-bold flex gap-2"><Building2/> 金融房產</h3><p>數位包租公，以息養貸。</p></div>
       <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white p-6 rounded-xl border space-y-4">
             <label>總額: {data.loanAmount}萬</label><input type="range" min="500" max="3000" value={data.loanAmount} onChange={e=>update('loanAmount', +e.target.value)} className="w-full"/>
             <label>年期: {data.loanTerm}年</label><input type="range" min="20" max="40" value={data.loanTerm} onChange={e=>update('loanTerm', +e.target.value)} className="w-full"/>
             <div className={`bg-slate-50 p-4 text-center ${cf<0?'text-red-500':'text-emerald-600'}`}><p>月現金流</p><p className="text-2xl font-bold">${Math.round(cf).toLocaleString()}</p></div>
          </div>
          <div className="lg:col-span-8 bg-white p-4 rounded-xl border h-[300px]"><ResponsiveContainer><AreaChart data={[{y:'1',v:0},{y:'20',v:data.loanAmount}]}><Area dataKey="v" fill="#10b981"/></AreaChart></ResponsiveContainer></div>
       </div>
    </div>
  );
};

const StudentLoanTool = ({data, setData}) => (
  <div className="space-y-6 animate-fade-in">
    <div className="bg-sky-500 p-6 rounded-2xl text-white"><h3 className="font-bold flex gap-2"><GraduationCap/> 學貸套利</h3><p>不急著還本金，利差套利。</p></div>
    <div className="grid lg:grid-cols-12 gap-6">
       <div className="lg:col-span-4 bg-white p-6 rounded-xl border space-y-4">
          <label>學貸: {data.loanAmount}萬</label><input type="range" min="10" max="100" value={data.loanAmount} onChange={e=>setData({...data, loanAmount:+e.target.value})} className="w-full"/>
          <div className="bg-slate-50 p-4 text-center"><p>畢業多賺</p><p className="text-2xl font-bold text-sky-600">+${Math.round(data.loanAmount*10000*Math.pow(1.06,8)-data.loanAmount*10000).toLocaleString()}</p></div>
       </div>
       <div className="lg:col-span-8 bg-white p-4 rounded-xl border h-[300px]"><ResponsiveContainer><LineChart data={[{x:1,y:0},{x:8,y:data.loanAmount}]}><Line dataKey="y"/></LineChart></ResponsiveContainer></div>
    </div>
  </div>
);

const SuperActiveSavingTool = ({data, setData}) => (
    <div className="space-y-6 animate-fade-in"><div className="bg-purple-600 p-6 rounded-2xl text-white"><h3 className="font-bold flex gap-2"><Rocket/> 超積極存錢</h3></div><div className="bg-white p-6 border rounded-xl"><label>月存: {data.monthlySaving}</label><input type="range" min="3000" max="50000" value={data.monthlySaving} onChange={e=>setData({...data, monthlySaving:+e.target.value})} className="w-full"/></div></div>
);
const CarReplacementTool = ({data, setData}) => (<div className="space-y-6 animate-fade-in"><div className="bg-orange-500 p-6 rounded-2xl text-white"><h3 className="font-bold flex gap-2"><Car/> 五年換車</h3></div><div className="bg-white p-6 border rounded-xl"><label>車價: {data.carPrice}</label><input type="range" value={data.carPrice} onChange={e=>setData({...data, carPrice:+e.target.value})} className="w-full"/></div></div>);
const BigSmallReservoirTool = ({data, setData}) => (<div className="space-y-6 animate-fade-in"><div className="bg-cyan-600 p-6 rounded-2xl text-white"><h3 className="font-bold flex gap-2"><Waves/> 大小水庫</h3></div><div className="bg-white p-6 border rounded-xl"><label>本金: {data.initialCapital}</label><input type="range" value={data.initialCapital} onChange={e=>setData({...data, initialCapital:+e.target.value})} className="w-full"/></div></div>);
const TaxPlannerTool = ({data, setData}) => (<div className="space-y-6 animate-fade-in"><div className="bg-slate-600 p-6 rounded-2xl text-white"><h3 className="font-bold flex gap-2"><Landmark/> 稅務傳承</h3></div><div className="bg-white p-6 border rounded-xl"><label>現金: {data.cash}</label><input type="range" value={data.cash} onChange={e=>setData({...data, cash:+e.target.value})} className="w-full"/></div></div>);
const LaborPensionTool = ({ data, setData }) => {
    const labor = Math.min(Math.max(data.salary, 26400), 45800) * data.laborInsYears * 0.0155;
    const pension = (Math.min(data.salary, 150000) * 0.06 * 12 * (65-30) * 1.5) / 240; 
    const gap = data.desiredMonthlyIncome - labor - pension;
    return (
      <div className="space-y-6 animate-fade-in">
         <div className="bg-slate-700 rounded-2xl p-6 text-white"><h3 className="font-bold flex gap-2"><Umbrella/> 退休缺口</h3></div>
         <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 bg-white p-6 rounded-xl border space-y-4">
               <label>理想月退: {data.desiredMonthlyIncome}</label><input type="range" min="30000" max="150000" value={data.desiredMonthlyIncome} onChange={e=>setData({...data, desiredMonthlyIncome:+e.target.value})} className="w-full"/>
               <div className="text-center"><p>缺口</p><p className="text-3xl font-bold text-red-500">${Math.max(0, Math.round(gap)).toLocaleString()}</p></div>
            </div>
            <div className="lg:col-span-8 bg-white p-4 rounded-xl border h-[300px]">
               <ResponsiveContainer><BarChart data={[{n:'勞保',v:Math.round(labor/10000)},{n:'勞退',v:Math.round(pension/10000)},{n:'缺口',v:Math.round(gap/10000)}]} layout="vertical"><XAxis type="number"/><YAxis dataKey="n" type="category"/><Bar dataKey="v" fill="#8884d8" label={{position:'right', formatter:v=>`${v}萬`}}/></BarChart></ResponsiveContainer>
            </div>
         </div>
      </div>
    );
};

// --- Main App ---
export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('gift'); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false); 

  // Data States
  const [giftData, setGiftData] = useState({ loanAmount: 100, loanTerm: 7, loanRate: 2.8, investReturnRate: 6 });
  const [estateData, setEstateData] = useState({ loanAmount: 1000, loanTerm: 30, loanRate: 2.2, investReturnRate: 6 });
  const [studentData, setStudentData] = useState({ loanAmount: 40, investReturnRate: 6, years: 8, gracePeriod: 1, interestOnlyPeriod: 0 });
  const [superActiveData, setSuperActiveData] = useState({ monthlySaving: 10000, investReturnRate: 6, activeYears: 15 });
  const [carData, setCarData] = useState({ carPrice: 100, investReturnRate: 6, resaleRate: 50 });
  const [pensionData, setPensionData] = useState({ currentAge: 30, retireAge: 65, salary: 45000, laborInsYears: 35, selfContribution: false, pensionReturnRate: 3, desiredMonthlyIncome: 60000 });
  const [reservoirData, setReservoirData] = useState({ initialCapital: 1000, dividendRate: 6, reinvestRate: 6, years: 10 });
  const [taxData, setTaxData] = useState({ spouse: true, children: 2, parents: 0, cash: 3000, realEstate: 2000, stocks: 1000, insurancePlan: 0 });

  useEffect(() => onAuthStateChanged(auth, setUser), []);
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

  if (!user) return <div className="h-screen flex items-center justify-center bg-slate-50"><button onClick={()=>signInWithPopup(auth, googleProvider)} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">Google 登入</button></div>;

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <PrintStyles />
      <ReportModal isOpen={isReportOpen} onClose={()=>setIsReportOpen(false)} user={user} activeTab={activeTab} data={getCurrentData()} />
      
      <aside className="w-64 bg-slate-900 text-white flex-col hidden md:flex print:hidden">
         <div className="p-6 font-bold text-xl border-b border-slate-800">超業戰情室</div>
         <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <div className="text-xs text-slate-500 px-2">資產軍火庫</div>
            <NavItem icon={Wallet} label="百萬禮物" active={activeTab==='gift'} onClick={()=>setActiveTab('gift')}/>
            <NavItem icon={Building2} label="金融房產" active={activeTab==='estate'} onClick={()=>setActiveTab('estate')}/>
            <NavItem icon={GraduationCap} label="學貸套利" active={activeTab==='student'} onClick={()=>setActiveTab('student')}/>
            <NavItem icon={Rocket} label="積極存錢" active={activeTab==='super_active'} onClick={()=>setActiveTab('super_active')}/>
            <NavItem icon={Car} label="五年換車" active={activeTab==='car'} onClick={()=>setActiveTab('car')}/>
            <NavItem icon={Waves} label="大小水庫" active={activeTab==='reservoir'} onClick={()=>setActiveTab('reservoir')}/>
            <div className="text-xs text-slate-500 px-2 mt-4">退休與傳承</div>
            <NavItem icon={Umbrella} label="退休缺口" active={activeTab==='pension'} onClick={()=>setActiveTab('pension')}/>
            <NavItem icon={Landmark} label="稅務傳承" active={activeTab==='tax'} onClick={()=>setActiveTab('tax')}/>
         </nav>
         <div className="p-4 border-t border-slate-800">
            <button onClick={()=>setIsReportOpen(true)} className="w-full bg-blue-600 py-2 rounded font-bold mb-2">生成報表</button>
            <button onClick={()=>signOut(auth)} className="w-full text-slate-400 py-2">登出</button>
         </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
         <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center print:hidden">
            <span className="font-bold">資產規劃</span>
            <div className="flex gap-2">
               <button onClick={()=>setIsReportOpen(true)}><FileBarChart/></button>
               <button onClick={()=>setIsMobileMenuOpen(!isMobileMenuOpen)}><Menu/></button>
            </div>
         </div>
         {isMobileMenuOpen && (
            <div className="absolute inset-0 bg-slate-900 z-50 p-4 text-white space-y-4">
               <button onClick={()=>setIsMobileMenuOpen(false)} className="mb-4"><X/></button>
               <NavItem icon={Wallet} label="百萬禮物" onClick={()=>{setActiveTab('gift');setIsMobileMenuOpen(false)}}/>
               <NavItem icon={Building2} label="金融房產" onClick={()=>{setActiveTab('estate');setIsMobileMenuOpen(false)}}/>
               <NavItem icon={GraduationCap} label="學貸套利" onClick={()=>{setActiveTab('student');setIsMobileMenuOpen(false)}}/>
               <NavItem icon={Rocket} label="積極存錢" onClick={()=>{setActiveTab('super_active');setIsMobileMenuOpen(false)}}/>
               <NavItem icon={Car} label="五年換車" onClick={()=>{setActiveTab('car');setIsMobileMenuOpen(false)}}/>
               <NavItem icon={Waves} label="大小水庫" onClick={()=>{setActiveTab('reservoir');setIsMobileMenuOpen(false)}}/>
               <NavItem icon={Umbrella} label="退休缺口" onClick={()=>{setActiveTab('pension');setIsMobileMenuOpen(false)}}/>
               <NavItem icon={Landmark} label="稅務傳承" onClick={()=>{setActiveTab('tax');setIsMobileMenuOpen(false)}}/>
            </div>
         )}
         
         <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
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