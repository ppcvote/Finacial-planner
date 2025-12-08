import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; 
import { FileBarChart, ArrowUpFromLine, X, CheckCircle2, User, Calendar, PenTool, Phone, Mail, ShieldCheck } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, ComposedChart, Line, Bar, BarChart 
} from 'recharts';
import { calculateMonthlyPayment, calculateMonthlyIncome, calculateRemainingBalance } from '../utils';

// ------------------------------------------------------------------
// Report Component (專業建議書引擎 V3.1 - Fix Crash)
// ------------------------------------------------------------------

const ReportModal = ({ isOpen, onClose, user, client, activeTab, data }: any) => {
  const [advisorNote, setAdvisorNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(true);

  useEffect(() => {
      if(isOpen) {
          setAdvisorNote('');
          setShowNoteInput(true);
      }
  }, [isOpen]);
  
  if (!isOpen) return null;

  const dateStr = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
  
  // --- 報表內容生成邏輯 ---
  let reportContent = { title: '', mindMap: [] as any[], table: [] as any[], highlights: [] as any[], chartData: [] as any[], chartType: 'composed' };

  if (activeTab === 'gift') {
    const loan = data.loanAmount;
    const monthlyLoanPayment = calculateMonthlyPayment(loan, data.loanRate, data.loanTerm);
    const monthlyInvestIncomeSingle = calculateMonthlyIncome(loan, data.investReturnRate);
    const phase1_NetOut = monthlyLoanPayment - monthlyInvestIncomeSingle;
    
    const chartData = [];
    let cumulativeStandard = 0;
    let cumulativeProjectCost = 0;
    const standardMonthlySaving = (loan * 3 * 10000) / (15 * 12); 
    const phase2_NetOut = monthlyLoanPayment - (monthlyInvestIncomeSingle * 2);
    const phase3_NetOut = monthlyLoanPayment - (monthlyInvestIncomeSingle * 3);

    for (let year = 1; year <= 15; year++) {
      cumulativeStandard += standardMonthlySaving * 12;
      let assetVal = 0;
      if (year <= 7) {
        cumulativeProjectCost += phase1_NetOut * 12;
        assetVal = loan * 10000;
      } else if (year <= 14) {
        cumulativeProjectCost += phase2_NetOut * 12;
        assetVal = loan * 2 * 10000;
      } else {
        cumulativeProjectCost += phase3_NetOut * 12; 
        assetVal = loan * 3 * 10000;
      }
      chartData.push({
        year: `第${year}年`,
        一般存錢成本: Math.round(cumulativeStandard / 10000),
        專案實付成本: Math.round(cumulativeProjectCost / 10000),
        專案持有資產: Math.round(assetVal / 10000),
      });
    }

    reportContent = {
      title: '百萬禮物專案',
      mindMap: [
        { label: '核心策略', value: '以息養貸' },
        { label: '投入資源', value: `信貸 ${loan} 萬` },
        { label: '時間槓桿', value: `15 年循環` },
        { label: '預期成果', value: `資產 ${loan*3} 萬` },
        { label: '人生意義', value: '第一桶金' }
      ],
      table: [
        { label: '第 1-7 年', col1: '啟動期', col2: `資產 ${loan} 萬` },
        { label: '第 8-14 年', col1: '循環期', col2: `資產 ${loan*2} 萬` },
        { label: '第 15 年', col1: '收割期', col2: `資產 ${loan*3} 萬` },
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
      if (year === 1 || year % 2 === 0 || year === data.loanTerm) {
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
      title: '學貸活化專案',
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
    for (let year = 1; year <= 40; year++) {
        passiveAccumulation += data.monthlySaving * 12;
        if (year <= data.activeYears) activeInvestment = (activeInvestment + data.monthlySaving * 12) * (1 + data.investReturnRate / 100);
        else activeInvestment = activeInvestment * (1 + data.investReturnRate / 100);
        
        if(year % 2 === 0) {
            chartData.push({
                year: `第${year}年`,
                消極存錢: Math.round(passiveAccumulation / 10000),
                積極存錢: Math.round(activeInvestment / 10000),
            });
        }
    }

    const finalAsset = Math.round(activeInvestment / 10000);
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
    let policyPrincipal = data.carPrice; 
    const loanAmount = data.carPrice;
    const loanMonthlyPayment = calculateMonthlyPayment(loanAmount, data.loanRate, data.loanTerm);

    for(let i=1; i<=3; i++) {
        let targetCarPrice = i === 1 ? data.carPrice : (i === 2 ? (data.carPrice2 || policyPrincipal) : (data.carPrice3 || policyPrincipal));
        const monthlyDividend = (policyPrincipal * 10000 * (data.investReturnRate/100)) / 12;
        const netMonthlyPayment = loanMonthlyPayment - monthlyDividend;
        
        cycles.push({
            cycle: `第 ${i} 台車`,
            principal: Math.round(policyPrincipal),
            dividend: Math.round(monthlyDividend),
            originalPay: Math.round(loanMonthlyPayment),
            netPay: Math.round(netMonthlyPayment)
        });

        const residualValue = targetCarPrice * (data.residualRate / 100);
        const remainingLoan = calculateRemainingBalance(targetCarPrice, data.loanRate, data.loanTerm, data.cycleYears);
        const netCash = (residualValue * 10000) - remainingLoan;
        policyPrincipal = policyPrincipal + (netCash/10000);
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
    
    chartData.push({
        year: 0,
        大水庫本金: data.initialCapital,
        小水庫累積: 0
    });

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
     const gap = Math.max(0, data.desiredMonthlyIncome - (laborInsMonthly + pensionMonthly));

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
     const deductionChildren = (data.children * 56) + (data.minorYearsTotal * 56);
     const deductionParents = data.parents * 138;
     const deductionFuneral = 138; 
     const totalDeductions = exemption + deductionSpouse + deductionChildren + deductionParents + deductionFuneral;
     const totalAssets = data.cash + data.realEstateMarket + data.stocks;
     const netEstateRaw = Math.max(0, totalAssets - totalDeductions);
     const plannedAssets = Math.max(0, totalAssets - data.insurancePlan);
     const netEstatePlanned = Math.max(0, plannedAssets - totalDeductions);
     const calculateTax = (netEstate: number) => {
        if (netEstate <= 5621) return netEstate * 0.10;
        if (netEstate <= 11242) return netEstate * 0.15 - 250;
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

  // 自動列印邏輯
  const handlePrint = () => {
      setShowNoteInput(false); 
      setTimeout(() => {
          window.print();
          setShowNoteInput(true);
      }, 500);
  };

  // 決定 React Portal 的掛載點 (直接掛在 body 下)
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm overflow-y-auto no-scroll-print" id="report-modal-root">
      {/* 注入列印專用樣式 */}
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { 
             margin: 0; 
             padding: 0; 
             -webkit-print-color-adjust: exact !important; 
             print-color-adjust: exact !important; 
             background: white !important;
             overflow: visible !important;
          }
          
          /* 隱藏 App 的所有內容 */
          #root, .toast-container { display: none !important; }
          
          /* 顯示 Report Portal */
          #report-modal-root { 
            position: absolute !important; 
            top: 0 !important; 
            left: 0 !important; 
            width: 100% !important; 
            height: auto !important; 
            background: white !important; 
            padding: 0 !important; 
            overflow: visible !important;
            display: block !important;
            z-index: 99999 !important;
          }
          
          .no-print { display: none !important; }
          
          /* 報表頁面設定 */
          .print-page { 
             width: 210mm; 
             min-height: 297mm; 
             padding: 20mm; 
             margin: 0 auto; 
             background: white; 
             box-shadow: none;
             position: relative;
             page-break-after: always; /* 強制分頁 */
          }
          
          .print-page:last-child { page-break-after: auto; }
          .print-break-inside { break-inside: avoid; }
        }
      `}</style>

      <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl flex flex-col relative print:w-full print:max-w-none print:shadow-none print:rounded-none">
        
        {/* Controls (No Print) */}
        <div className="sticky top-0 z-50 bg-white border-b border-slate-200 p-4 flex justify-between items-center no-print rounded-t-xl">
           <h3 className="font-bold text-slate-700 flex items-center gap-2">
               <FileBarChart size={20} className="text-blue-600"/> 策略建議書預覽
           </h3>
           <div className="flex gap-2">
               <button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm">
                   <ArrowUpFromLine size={18}/> 列印建議書
               </button>
               <button onClick={onClose} className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-lg transition-colors">
                   <X size={20}/>
               </button>
           </div>
        </div>

        {/* --- 報表內容容器 --- */}
        <div className="print-content">

            {/* === 第一頁：封面 (Cover Page) === */}
            <div className="print-page cover-page flex flex-col justify-between bg-white relative overflow-hidden">
                {/* 裝飾背景 */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-bl-[100%] z-0"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-slate-50 rounded-tr-[100%] z-0"></div>

                <div className="pt-24 px-12 relative z-10">
                    <p className="text-blue-600 font-bold tracking-[0.2em] text-sm mb-6 uppercase">Exclusive Financial Proposal</p>
                    <h1 className="text-5xl font-black text-slate-900 leading-tight mb-8 tracking-tight">{reportContent.title}</h1>
                    <div className="h-1.5 w-24 bg-blue-600 mb-8 rounded-full"></div>
                    <p className="text-2xl text-slate-500 font-medium">專屬資產配置戰略規劃書</p>
                </div>

                <div className="flex-1 flex items-center justify-center opacity-5 grayscale relative z-10">
                     <ShieldCheck size={350} strokeWidth={0.5}/>
                </div>

                <div className="pb-24 px-12 relative z-10">
                    <div className="grid grid-cols-2 gap-12 border-t border-slate-200 pt-12">
                        <div>
                            <p className="text-xs text-slate-400 font-bold mb-2 uppercase tracking-wider">Prepared For</p>
                            <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                                <User className="text-blue-600" size={28}/> {client?.name || '尊榮貴賓'}
                            </h2>
                            <p className="text-slate-500 mt-2 flex items-center gap-2">
                                <Calendar size={14}/> {dateStr}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold mb-2 uppercase tracking-wider">Financial Advisor</p>
                            <h2 className="text-2xl font-bold text-slate-800">{user?.displayName || '專業理財顧問'}</h2>
                            {user?.email && (
                                <p className="text-slate-500 mt-2 flex items-center gap-2 text-sm">
                                    <Mail size={14}/> {user.email}
                                </p>
                            )}
                            <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm">
                                <Phone size={14}/> 09xx-xxx-xxx
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* === 第二頁：內容分析 (Content Page) === */}
            <div className="print-page">
                
                {/* Header */}
                <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-10">
                    <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Ultra Advisor System</span>
                    <span className="text-[10px] font-bold text-slate-400">Page 2</span>
                </div>

                {/* 1. 核心數據 (Cards) */}
                <div className="mb-10">
                    <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                        <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                        核心戰略指標
                    </h3>
                    <div className="grid grid-cols-5 gap-3">
                        {reportContent.mindMap.map((item, idx) => (
                            <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                                <span className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-wide">{item.label}</span>
                                <span className="font-bold text-slate-800 text-sm block truncate">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. 圖表區域 (Chart) - Animation Disabled */}
                <div className="mb-10 print-break-inside">
                    <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                        <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                        資產趨勢模擬
                    </h3>
                    <div className="h-[320px] w-full border border-slate-100 rounded-2xl p-6 bg-white shadow-sm">
                        <ResponsiveContainer width="100%" height="100%">
                            {reportContent.chartType === 'area_reservoir' ? (
                               <AreaChart data={reportContent.chartData}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                                  <XAxis dataKey="year" tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                                  <YAxis tick={{fontSize: 10, fill: '#94a3b8'}} width={35} axisLine={false} tickLine={false} />
                                  <Legend wrapperStyle={{fontSize: '10px', paddingTop: '10px'}}/>
                                  {/* 大水庫在下 (底層) */}
                                  <Area type="monotone" dataKey="大水庫本金" stackId="1" stroke="#0891b2" fill="#0891b2" fillOpacity={0.1} isAnimationActive={false} />
                                  {/* 小水庫在上 (獲利層) */}
                                  <Area type="monotone" dataKey="小水庫累積" stackId="1" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.6} isAnimationActive={false} />
                               </AreaChart>
                            ) : reportContent.chartType === 'composed_gift' ? (
                               <ComposedChart data={reportContent.chartData}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                                  <XAxis dataKey="year" tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                                  <YAxis tick={{fontSize: 10, fill: '#94a3b8'}} width={35} axisLine={false} tickLine={false} />
                                  <Legend wrapperStyle={{fontSize: '10px', paddingTop: '10px'}}/>
                                  <Area type="monotone" dataKey="專案持有資產" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} isAnimationActive={false}/>
                                  <Line type="monotone" dataKey="專案實付成本" stroke="#f59e0b" strokeWidth={2} isAnimationActive={false} dot={false}/>
                               </ComposedChart>
                            ) : reportContent.chartType === 'composed_car' ? (
                               <ComposedChart data={reportContent.chartData}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                                  <XAxis dataKey="cycle" tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                                  <YAxis tick={{fontSize: 10, fill: '#94a3b8'}} width={35} axisLine={false} tickLine={false} />
                                  <Legend wrapperStyle={{fontSize: '10px', paddingTop: '10px'}}/>
                                  <Bar dataKey="netPay" name="實際月付金" fill="#f97316" barSize={40} isAnimationActive={false} />
                                  <Line type="monotone" dataKey="originalPay" name="原車貸月付" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" isAnimationActive={false} dot={false}/>
                               </ComposedChart>
                            ) : reportContent.chartType === 'bar_pension' || reportContent.chartType === 'bar_tax' ? (
                               <BarChart data={reportContent.chartData} layout="vertical">
                                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9"/>
                                  <XAxis type="number" hide />
                                  <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 11, fontWeight: 'bold', fill:'#475569'}} axisLine={false} tickLine={false} />
                                  <Legend wrapperStyle={{fontSize: '10px', paddingTop: '10px'}}/>
                                  <Bar dataKey="value" fill="#3b82f6" barSize={30} radius={[0, 4, 4, 0]} isAnimationActive={false} label={{ position: 'right', fill: '#64748b', fontSize: 10, formatter: (val: any) => `$${val.toLocaleString()}` }}>
                                    {/* 手動指定顏色 */}
                                    {reportContent.chartData.map((entry: any, index: number) => (
                                        <div key={index} style={{display:'none'}} /> // Dummy for loop
                                    ))}
                                  </Bar>
                               </BarChart>
                            ) : (
                                // 通用圖表
                                <ComposedChart data={reportContent.chartData}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                                  <XAxis dataKey="year" tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                                  <YAxis tick={{fontSize: 10, fill: '#94a3b8'}} width={35} axisLine={false} tickLine={false} />
                                  <Legend wrapperStyle={{fontSize: '10px', paddingTop: '10px'}}/>
                                  {Object.keys(reportContent.chartData[0] || {}).slice(1).map((key, i) => (
                                      <Area key={i} type="monotone" dataKey={key} fill={['#8884d8', '#82ca9d', '#ffc658'][i % 3]} stroke="none" fillOpacity={0.2} isAnimationActive={false}/>
                                  ))}
                                </ComposedChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. 表格與亮點 */}
                <div className="grid grid-cols-2 gap-8 mb-8 print-break-inside">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                           <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
                           執行階段
                        </h3>
                        <div className="rounded-xl border border-slate-200 overflow-hidden">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-slate-50 text-slate-500 font-bold">
                                    <tr>
                                        <th className="p-3 border-b border-slate-200">時間</th>
                                        <th className="p-3 border-b border-slate-200">階段</th>
                                        <th className="p-3 border-b border-slate-200">目標</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportContent.table.map((row, idx) => (
                                        <tr key={idx} className="border-b border-slate-100 last:border-0">
                                            <td className="p-3 font-bold text-slate-700">{row.label}</td>
                                            <td className="p-3 text-slate-500">{row.col1}</td>
                                            <td className="p-3 font-bold text-blue-600">{row.col2}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                           <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                           專案亮點
                        </h3>
                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 h-full">
                            <ul className="space-y-3">
                                {reportContent.highlights.map((item, idx) => (
                                    <li key={idx} className="flex gap-2 items-start text-xs text-slate-700 leading-relaxed">
                                        <CheckCircle2 size={14} className="text-purple-600 shrink-0 mt-0.5"/>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 4. 顧問結語區 */}
                <div className="mt-auto border-t-2 border-slate-100 pt-8 print-break-inside">
                    <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <PenTool size={18} className="text-slate-400"/> 顧問建議
                    </h3>
                    {showNoteInput ? (
                        <textarea 
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 min-h-[120px] outline-none focus:ring-2 focus:ring-blue-500 no-print"
                            placeholder="請在此輸入給客戶的專屬建議，例如：建議優先處理退休規劃..."
                            value={advisorNote}
                            onChange={(e) => setAdvisorNote(e.target.value)}
                        />
                    ) : (
                        <div className="p-6 bg-slate-50/50 rounded-xl border border-slate-100 text-sm text-slate-700 leading-loose whitespace-pre-wrap min-h-[100px]">
                            {advisorNote || "（本計畫建議內容僅供參考，實際執行細節請諮詢您的專屬顧問）"}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-12 text-center text-[10px] text-slate-300 border-t border-slate-50 pt-4">
                    <p>免責聲明：本報告所載資料僅供財務規劃參考，不構成任何投資建議。投資有風險，請謹慎評估。</p>
                    <p>© {new Date().getFullYear()} Ultra Advisor System • Generated for {client?.name}</p>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default ReportModal;
