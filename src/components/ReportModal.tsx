import React, { useState, useEffect } from 'react';
import { FileBarChart, ArrowUpFromLine, X, CheckCircle2, User, Calendar, PenTool } from 'lucide-react';
import { 
  BarChart, AreaChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, ComposedChart, Area, Line 
} from 'recharts';
import { calculateMonthlyPayment, calculateMonthlyIncome, calculateRemainingBalance } from '../utils';

// ------------------------------------------------------------------
// Report Component (報表元件 - PDF 建議書引擎)
// ------------------------------------------------------------------

const ReportModal = ({ isOpen, onClose, user, client, activeTab, data }: any) => {
  const [advisorNote, setAdvisorNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(true);

  // 當開啟時，自動帶入客戶備註(如果有的話)或清空
  useEffect(() => {
      if(isOpen) {
          setAdvisorNote('');
          setShowNoteInput(true);
      }
  }, [isOpen]);
  
  if (!isOpen) return null;

  const dateStr = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
  
  // --- 報表內容生成邏輯 (維持原有的計算，這部分不變) ---
  let reportContent = { title: '', mindMap: [] as any[], table: [] as any[], highlights: [] as any[], chartData: [] as any[], chartType: 'composed' };

  if (activeTab === 'gift') {
    const loan = data.loanAmount;
    const monthlyLoanPayment = calculateMonthlyPayment(loan, data.loanRate, data.loanTerm);
    const monthlyInvestIncomeSingle = calculateMonthlyIncome(loan, data.investReturnRate);
    const phase1_NetOut = monthlyLoanPayment - monthlyInvestIncomeSingle;
    const standardTotalCost = 3000000; 
    const standardMonthlySaving = standardTotalCost / (15 * 12); 

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
     const totalAssets = data.cash + data.realEstateMarket + data.stocks;
     const netEstateRaw = Math.max(0, totalAssets - totalDeductions);
     const plannedAssets = Math.max(0, totalAssets - data.insurancePlan);
     const netEstatePlanned = Math.max(0, plannedAssets - totalDeductions);
     const calculateTax = (netEstate: number) => {
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

  // 自動列印邏輯
  const handlePrint = () => {
      setShowNoteInput(false); // 隱藏輸入框，只顯示文字
      setTimeout(() => {
          window.print();
          setShowNoteInput(true); // 列印後恢復輸入框
      }, 300);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" id="report-modal-overlay">
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          #report-modal-overlay { position: static; background: white; padding: 0; display: block; }
          .no-print { display: none !important; }
          .print-page { 
             width: 210mm; 
             min-height: 297mm; 
             padding: 20mm; 
             margin: 0 auto; 
             background: white; 
             box-shadow: none;
             page-break-after: always;
             position: relative;
          }
          .print-break-inside { break-inside: avoid; }
        }
      `}</style>

      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative print:w-full print:max-w-none print:max-h-none print:shadow-none print:rounded-none">
        
        {/* Controls (No Print) */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 p-4 flex justify-between items-center no-print">
           <h3 className="font-bold text-slate-700 flex items-center gap-2">
               <FileBarChart size={20} className="text-blue-600"/> 報表預覽
           </h3>
           <div className="flex gap-2">
               <button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors">
                   <ArrowUpFromLine size={18}/> 列印 / 下載 PDF
               </button>
               <button onClick={onClose} className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-lg transition-colors">
                   <X size={20}/>
               </button>
           </div>
        </div>

        {/* --- A4 頁面內容 --- */}
        <div className="print-page p-12 bg-white text-slate-800">
            
            {/* 1. 封面頁頭 (Header) */}
            <div className="flex justify-between items-start border-b-4 border-slate-800 pb-6 mb-8">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">{reportContent.title}</h1>
                    <p className="text-xl text-slate-500 font-bold">資產配置戰略規劃書</p>
                </div>
                <div className="text-right">
                    <div className="bg-slate-100 px-4 py-2 rounded-lg mb-2 inline-block">
                        <span className="text-xs text-slate-400 block text-left">尊榮貴賓</span>
                        <span className="text-lg font-bold text-slate-800 flex items-center gap-2 justify-end">
                            <User size={16}/> {client?.name || '貴賓'}
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 flex items-center justify-end gap-1">
                        <Calendar size={14}/> {dateStr}
                    </p>
                </div>
            </div>

            {/* 2. 關鍵數據總覽 (Mind Map) */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
                {reportContent.mindMap.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                        <span className="text-xs font-bold text-slate-400 block mb-1">{item.label}</span>
                        <span className="font-bold text-slate-800 text-lg block truncate">{item.value}</span>
                    </div>
                ))}
            </div>

            {/* 3. 圖表區域 (Chart) */}
            <div className="mb-8 print-break-inside">
                <h2 className="text-lg font-bold text-slate-800 border-l-4 border-blue-600 pl-3 mb-4">資產趨勢分析</h2>
                <div className="h-[350px] w-full border border-slate-200 rounded-xl p-4 bg-white">
                    <ResponsiveContainer width="100%" height="100%">
                        {/* 根據 chartType 渲染不同圖表 (簡化版，邏輯同前) */}
                        <ComposedChart data={reportContent.chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="year" tick={{fontSize: 12}} />
                            <YAxis unit="萬" tick={{fontSize: 12}} />
                            <Legend />
                            {/* 通用渲染邏輯：依賴 reportContent 的結構，這裡簡化處理 */}
                            <Area type="monotone" dataKey={Object.keys(reportContent.chartData[0] || {})[2]} stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                            <Line type="monotone" dataKey={Object.keys(reportContent.chartData[0] || {})[1]} stroke="#f59e0b" strokeWidth={2} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 4. 數據表格與亮點 (Table & Highlights) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="print-break-inside">
                    <h2 className="text-lg font-bold text-slate-800 border-l-4 border-emerald-500 pl-3 mb-4">執行階段</h2>
                    <table className="w-full text-sm text-left border-collapse border border-slate-200 rounded-lg overflow-hidden">
                        <thead className="bg-slate-100 text-slate-600">
                            <tr>
                                <th className="p-3 border-b">時間點</th>
                                <th className="p-3 border-b">階段</th>
                                <th className="p-3 border-b">目標</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportContent.table.map((row, idx) => (
                                <tr key={idx} className="border-b border-slate-100 last:border-0">
                                    <td className="p-3 font-bold">{row.label}</td>
                                    <td className="p-3 text-slate-600">{row.col1}</td>
                                    <td className="p-3 font-bold text-emerald-600">{row.col2}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="print-break-inside">
                    <h2 className="text-lg font-bold text-slate-800 border-l-4 border-amber-500 pl-3 mb-4">專案亮點</h2>
                    <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
                        <ul className="space-y-3">
                            {reportContent.highlights.map((item, idx) => (
                                <li key={idx} className="flex gap-2 items-start text-sm text-slate-700">
                                    <CheckCircle2 size={16} className="text-amber-600 shrink-0 mt-0.5"/>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* 5. 顧問結語區 (Advisor Note) */}
            <div className="mt-auto pt-6 border-t-2 border-slate-100 print-break-inside">
                <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <PenTool size={18} className="text-slate-400"/> 顧問建議與結語
                </h2>
                {showNoteInput ? (
                    <textarea 
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] text-slate-700 leading-relaxed no-print placeholder:text-slate-400"
                        placeholder="請輸入給客戶的專屬建議與總結..."
                        value={advisorNote}
                        onChange={(e) => setAdvisorNote(e.target.value)}
                    />
                ) : (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 leading-relaxed min-h-[100px] whitespace-pre-wrap">
                        {advisorNote || "（顧問未填寫結語）"}
                    </div>
                )}
            </div>

            {/* 6. Footer (顧問簽名) */}
            <div className="mt-8 flex justify-between items-end text-xs text-slate-400">
                <div>
                    <p>本報告僅供財務規劃參考，實際投資效益請詳閱公開說明書。</p>
                    <p>Ultra Advisor 系統自動生成 • {new Date().getFullYear()}</p>
                </div>
                <div className="text-right">
                    <p className="mb-1">規劃顧問</p>
                    <p className="text-lg font-bold text-slate-800">{user?.displayName || '專業理財顧問'}</p>
                    {/* 若有 Email 也可顯示 */}
                    {user?.email && <p>{user.email}</p>}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default ReportModal;
