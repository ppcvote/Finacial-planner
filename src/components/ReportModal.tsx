import React, { useState } from 'react';
import { FileBarChart, ArrowUpFromLine, X, CheckCircle2 } from 'lucide-react';
import { 
  BarChart, AreaChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, ComposedChart, Area, Line 
} from 'recharts';
import { calculateMonthlyPayment, calculateMonthlyIncome, calculateRemainingBalance } from '../utils';

// ------------------------------------------------------------------
// Report Component (報表元件)
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

export default ReportModal;