import React, { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, Loader2, Calculator, Percent, Home, TrendingUp, PieChart } from 'lucide-react';
import html2canvas from 'html2canvas';

const UltraProDashboard = ({ user, userName }: { user: any; userName?: any }) => {
  // --- 智庫圖卡狀態 ---
  const storyRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(true);
  const [dailyData, setDailyData] = useState<any>(null);
  const [advisorName, setAdvisorName] = useState(user?.displayName || userName || '專業財務顧問');

  // --- 閃算機切換狀態 ---
  const [calcMode, setCalcMode] = useState<'loan' | 'savings'>('loan');

  // --- 1. 貸款試算狀態 ---
  const [loanAmount, setLoanAmount] = useState<number>(10000000);
  const [loanRate, setLoanRate] = useState<number>(2.2);
  const [loanYears, setLoanYears] = useState<number>(30);

  // --- 2. 複利試算狀態 ---
  const [initialCapital, setInitialCapital] = useState<number>(1000000);
  const [monthlyInvest, setMonthlyInvest] = useState<number>(10000);
  const [expectedRate, setExpectedRate] = useState<number>(6);
  const [investYears, setInvestYears] = useState<number>(20);

  // --- 智庫 API 邏輯 ---
  const fetchAIInsight = async (force = false) => {
    setIsLoadingAI(true);
    if (force) setDailyData(null);
    const BASE_URL = "https://us-central1-grbt-f87fa.cloudfunctions.net/getDailyInsight";
    const API_URL = `${BASE_URL}?t=${new Date().getTime()}`;
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("API 請求失敗");
      const data = await response.json();
      const finalData = Array.isArray(data) ? data[0] : data;
      setDailyData(finalData);
    } catch (error) {
      setDailyData({
        title: "複利不是奇蹟，是數學",
        subtitle: "看懂的人在賺錢，看不懂的人在打工",
        concepts: [
          { tag: "觀念", content: "薪資永遠追不上通膨與房價" },
          { tag: "槓桿", content: "負債是窮人的枷鎖，槓桿是富人的階梯" },
          { tag: "成本", content: "時間是投資中最貴的成本" }
        ],
        conclusion: "現在就開始規劃，不要讓未來的你後悔。",
        author: "Ultra Advisor"
      });
    } finally { setIsLoadingAI(false); }
  };

  useEffect(() => { fetchAIInsight(); }, []);

  // --- 邏輯計算：貸款月付 ---
  const calculateLoan = () => {
    const monthlyRate = loanRate / 100 / 12;
    const months = loanYears * 12;
    if (monthlyRate === 0) return { monthly: loanAmount / months, totalInterest: 0 };
    const monthly = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalInterest = monthly * months - loanAmount;
    return { monthly: Math.round(monthly), totalInterest: Math.round(totalInterest) };
  };

  // --- 邏輯計算：複利增長 ---
  const calculateSavings = () => {
    const r = expectedRate / 100 / 12;
    const n = investYears * 12;
    const FV_initial = initialCapital * Math.pow(1 + r, n);
    const FV_monthly = r === 0 ? monthlyInvest * n : monthlyInvest * ((Math.pow(1 + r, n) - 1) / r);
    const totalCapital = initialCapital + (monthlyInvest * n);
    return { totalValue: Math.round(FV_initial + FV_monthly), totalCapital };
  };

  const loanResult = calculateLoan();
  const savingsResult = calculateSavings();

  return (
    <div className="flex flex-col lg:flex-row items-start justify-center gap-10 p-6 lg:p-12 bg-black min-h-screen text-white font-sans">
      
      {/* 左側：智庫圖卡區 (維持專業視覺) */}
      <div className="flex flex-col items-center gap-6 w-full max-w-[360px]">
        <div className="flex gap-3 w-full">
          <button onClick={() => fetchAIInsight(true)} className="flex-1 flex items-center justify-center gap-2 bg-gray-900 border border-gray-700 py-3 rounded-xl"><RefreshCw size={16} /><span className="text-xs">換個主題</span></button>
          <button className="flex-1 bg-amber-600 py-3 rounded-xl font-bold">儲存高清圖</button>
        </div>
        <div ref={storyRef} className="relative w-full aspect-[9/16] bg-[#080808] p-8 border border-white/5 shadow-2xl overflow-hidden flex flex-col">
          {isLoadingAI && <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center"><Loader2 className="animate-spin text-amber-500" /></div>}
          <div className="absolute top-6 right-6 z-20 flex items-center gap-1"><span className="text-white/30 text-[7px] uppercase tracking-widest">Ultra Advisor</span><div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center"><img src="/logo.png" className="w-3 h-3" /></div></div>
          <div className="relative z-10 mt-2">
            <h1 className="text-2xl font-black mb-2">{dailyData?.title}</h1>
            <p className="text-amber-200/40 text-[10px] font-bold">{dailyData?.subtitle}</p>
          </div>
          <div className="relative z-10 my-4 py-4 bg-white/5 rounded-xl border border-white/5" dangerouslySetInnerHTML={{ __html: dailyData?.visualChart }} />
          <div className="relative z-10 flex-1 flex flex-col justify-center gap-4">
            {dailyData?.concepts?.map((c: any, i: number) => (
              <div key={i} className="flex gap-4 border-b border-white/5 pb-2"><div className="text-amber-500 text-[9px] font-black">{c.tag}</div><p className="text-[12px] text-gray-300">{c.content}</p></div>
            ))}
          </div>
          <div className="relative z-10 mt-auto pt-4 border-t border-white/10 text-[11px] text-gray-400 italic">"{dailyData?.conclusion}"</div>
        </div>
      </div>

      {/* --- 右側：客戶財務閃算機 --- */}
      <div className="w-full max-w-[420px] bg-gray-900/30 p-8 rounded-[2.5rem] border border-gray-800 backdrop-blur-xl">
        {/* 切換 Tab */}
        <div className="flex bg-black/40 p-1 rounded-2xl mb-8">
          <button onClick={() => setCalcMode('loan')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${calcMode === 'loan' ? 'bg-amber-600 text-white shadow-lg' : 'text-gray-500'}`}>
            <Home size={16} /> <span className="text-xs font-bold">貸款月付</span>
          </button>
          <button onClick={() => setCalcMode('savings')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${calcMode === 'savings' ? 'bg-amber-600 text-white shadow-lg' : 'text-gray-500'}`}>
            <TrendingUp size={16} /> <span className="text-xs font-bold">複利增值</span>
          </button>
        </div>

        {calcMode === 'loan' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <label className="text-[10px] text-gray-500 font-black tracking-widest">貸款總額 (TWD)</label>
              <input type="number" value={loanAmount} onChange={(e)=>setLoanAmount(Number(e.target.value))} className="w-full bg-black/50 border border-gray-700 rounded-xl py-4 px-4 text-xl font-black text-amber-500 outline-none" />
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] text-gray-500 font-black tracking-widest">年利率 (%)</label><input type="number" value={loanRate} onChange={(e)=>setLoanRate(Number(e.target.value))} className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 px-4 text-white font-bold" /></div>
                <div><label className="text-[10px] text-gray-500 font-black tracking-widest">年期</label><input type="number" value={loanYears} onChange={(e)=>setLoanYears(Number(e.target.value))} className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 px-4 text-white font-bold" /></div>
              </div>
            </div>
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex justify-between items-end"><span className="text-gray-400 text-sm">每月應付</span><span className="text-3xl font-black text-white">{loanResult.monthly.toLocaleString()} <small className="text-xs text-amber-500">元</small></span></div>
              <div className="flex justify-between items-end"><span className="text-gray-400 text-sm">累積總利息</span><span className="text-lg font-black text-gray-300">{loanResult.totalInterest.toLocaleString()} <small className="text-xs">元</small></span></div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <div><label className="text-[10px] text-gray-500 font-black tracking-widest">初始投入資金</label><input type="number" value={initialCapital} onChange={(e)=>setInitialCapital(Number(e.target.value))} className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 px-4 text-white font-bold" /></div>
              <div><label className="text-[10px] text-gray-500 font-black tracking-widest">每月額外投入</label><input type="number" value={monthlyInvest} onChange={(e)=>setMonthlyInvest(Number(e.target.value))} className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 px-4 text-white font-bold" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] text-gray-500 font-black tracking-widest">年化報酬率 (%)</label><input type="number" value={expectedRate} onChange={(e)=>setExpectedRate(Number(e.target.value))} className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 px-4 text-white font-bold" /></div>
                <div><label className="text-[10px] text-gray-500 font-black tracking-widest">投資年期</label><input type="number" value={investYears} onChange={(e)=>setInvestYears(Number(e.target.value))} className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 px-4 text-white font-bold" /></div>
              </div>
            </div>
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex justify-between items-end"><span className="text-gray-400 text-sm">{investYears} 年後總價值</span><span className="text-3xl font-black text-amber-500">{savingsResult.totalValue.toLocaleString()} <small className="text-xs">元</small></span></div>
              <div className="flex justify-between items-end"><span className="text-gray-400 text-sm">投入成本 / 累積收益</span><span className="text-sm font-bold text-gray-400">{savingsResult.totalCapital.toLocaleString()} / <span className="text-white">{(savingsResult.totalValue - savingsResult.totalCapital).toLocaleString()}</span></span></div>
            </div>
          </div>
        )}
        <div className="mt-8 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
          <p className="text-[11px] text-gray-400 leading-relaxed">💡 <span className="font-black text-amber-500">Ultra 分析：</span> {calcMode === 'loan' ? '利息支出是資產的滲漏，透過提前還款或轉貸優化，可大幅縮短資產負債表的負擔。' : '時間是複利最好的燃料。及早開始讓這張雪球滾動，未來的被動收入將取代你的薪資。'}</p>
        </div>
      </div>
    </div>
  );
};

export default UltraProDashboard;