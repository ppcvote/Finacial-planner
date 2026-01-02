import React, { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, Loader2, Calculator, Percent, Home, TrendingUp, PieChart, Coins } from 'lucide-react';
import html2canvas from 'html2canvas';

const UltraProDashboard = ({ user, userName }: { user: any; userName?: any }) => {
  // --- 智庫圖卡狀態 ---
  const storyRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(true);
  const [dailyData, setDailyData] = useState<any>(null);
  const [advisorName, setAdvisorName] = useState(user?.displayName || userName || '專業財務顧問');

  // --- 閃算機切換狀態 ---
  const [calcMode, setCalcMode] = useState<'loan' | 'savings' | 'irr'>('loan');

  // --- 1. 貸款試算狀態 ---
  const [loanAmount, setLoanAmount] = useState<number>(10000000);
  const [loanRate, setLoanRate] = useState<number>(2.2);
  const [loanYears, setLoanYears] = useState<number>(30);

  // --- 2. 複利試算狀態 ---
  const [initialCapital, setInitialCapital] = useState<number>(1000000);
  const [monthlyInvest, setMonthlyInvest] = useState<number>(10000);
  const [expectedRate, setExpectedRate] = useState<number>(6);
  const [investYears, setInvestYears] = useState<number>(20);

  // --- 3. IRR 報酬試算狀態 (儲蓄險專用) ---
  const [totalPremium, setTotalPremium] = useState<number>(1000000);
  const [maturityValue, setMaturityValue] = useState<number>(1350000);
  const [irrYears, setIrrYears] = useState<number>(10);

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
      setDailyData(Array.isArray(data) ? data[0] : data);
    } catch (error) {
      setDailyData({
        title: "複利不是奇蹟，是數學",
        subtitle: "看懂的人在賺錢，看不懂的人在打工",
        concepts: [{ tag: "觀念", content: "薪資永遠追不上通膨與房價" }, { tag: "槓桿", content: "負債是窮人的枷鎖，槓桿是富人的階梯" }, { tag: "成本", content: "時間是投資中最貴的成本" }],
        conclusion: "現在就開始規劃，不要讓未來的你後悔。",
        author: "Ultra Advisor"
      });
    } finally { setIsLoadingAI(false); }
  };

  useEffect(() => { fetchAIInsight(); }, []);

  // --- 邏輯計算 ---
  const getLoanResult = () => {
    const i = loanRate / 100 / 12;
    const n = loanYears * 12;
    const m = i === 0 ? loanAmount / n : (loanAmount * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
    return { monthly: Math.round(m), totalInterest: Math.round(m * n - loanAmount) };
  };

  const getSavingsResult = () => {
    const r = expectedRate / 100 / 12;
    const n = investYears * 12;
    const fv = initialCapital * Math.pow(1 + r, n) + (r === 0 ? monthlyInvest * n : monthlyInvest * ((Math.pow(1 + r, n) - 1) / r));
    const cost = initialCapital + monthlyInvest * n;
    return { total: Math.round(fv), profit: Math.round(fv - cost) };
  };

  const getIrrResult = () => {
    if (totalPremium <= 0 || maturityValue <= 0 || irrYears <= 0) return 0;
    const irr = (Math.pow(maturityValue / totalPremium, 1 / irrYears) - 1) * 100;
    return irr.toFixed(2);
  };

  const handleDownload = async () => {
    if (!storyRef.current) return;
    setIsGenerating(true);
    const canvas = await html2canvas(storyRef.current, { scale: 3, useCORS: true, backgroundColor: "#080808" });
    const link = document.createElement('a');
    link.download = `Ultra_Insight_${new Date().getTime()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setIsGenerating(false);
  };

  return (
    <div className="flex flex-col lg:flex-row items-start justify-center gap-10 p-6 lg:p-12 bg-black min-h-screen text-white">
      
      {/* 左側：智庫圖卡 */}
      <div className="w-full max-w-[360px] flex flex-col gap-6">
        <div className="flex gap-3">
          <button onClick={() => fetchAIInsight(true)} className="flex-1 bg-gray-900 border border-gray-700 py-3 rounded-xl flex items-center justify-center gap-2"><RefreshCw size={14} />換主題</button>
          <button onClick={handleDownload} className="flex-1 bg-amber-600 py-3 rounded-xl font-bold">{isGenerating ? '生成中...' : '儲存高清圖'}</button>
        </div>
        <div ref={storyRef} className="relative aspect-[9/16] bg-[#080808] p-8 border border-white/5 shadow-2xl overflow-hidden flex flex-col">
          {isLoadingAI && <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center"><Loader2 className="animate-spin text-amber-500" /></div>}
          <div className="absolute top-6 right-6 z-20 flex items-center gap-1"><span className="text-white/30 text-[7px] uppercase tracking-widest">Ultra Advisor</span><div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center"><img src="/logo.png" className="w-3 h-3 invert" /></div></div>
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

      {/* 右側：三合一閃算機 */}
      <div className="w-full max-w-[420px] bg-gray-900/30 p-8 rounded-[2.5rem] border border-gray-800 backdrop-blur-xl">
        <div className="flex bg-black/40 p-1 rounded-2xl mb-8 overflow-x-auto">
          {[ {id:'loan', n:'貸款', i:<Home size={14}/>}, {id:'savings', n:'複利', i:<TrendingUp size={14}/>}, {id:'irr', n:'年化', i:<Coins size={14}/>} ].map(t => (
            <button key={t.id} onClick={() => setCalcMode(t.id as any)} className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-xl transition-all whitespace-nowrap ${calcMode === t.id ? 'bg-amber-600 text-white shadow-lg' : 'text-gray-500'}`}>
              {t.i} <span className="text-[11px] font-bold">{t.n}</span>
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {calcMode === 'loan' && (
            <div className="space-y-4">
              <div><label className="text-[10px] text-gray-500 font-black mb-2 block tracking-widest">貸款總額</label><input type="number" value={loanAmount} onChange={e=>setLoanAmount(Number(e.target.value))} className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 px-4 text-amber-500 font-black" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] text-gray-500 font-black mb-2 block tracking-widest">利率 %</label><input type="number" value={loanRate} onChange={e=>setLoanRate(Number(e.target.value))} className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 px-4" /></div>
                <div><label className="text-[10px] text-gray-500 font-black mb-2 block tracking-widest">年期</label><input type="number" value={loanYears} onChange={e=>setLoanYears(Number(e.target.value))} className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 px-4" /></div>
              </div>
              <div className="pt-4 border-t border-white/5"><p className="text-gray-400 text-sm">每月應付</p><p className="text-3xl font-black text-white">{getLoanResult().monthly.toLocaleString()} <small className="text-xs">元</small></p></div>
            </div>
          )}

          {calcMode === 'savings' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] text-gray-500 font-black mb-2 block tracking-widest">初始投入</label><input type="number" value={initialCapital} onChange={e=>setInitialCapital(Number(e.target.value))} className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 px-4" /></div>
                <div><label className="text-[10px] text-gray-500 font-black mb-2 block tracking-widest">月月投</label><input type="number" value={monthlyInvest} onChange={e=>setMonthlyInvest(Number(e.target.value))} className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 px-4" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] text-gray-500 font-black mb-2 block tracking-widest">預期投報 %</label><input type="number" value={expectedRate} onChange={e=>setExpectedRate(Number(e.target.value))} className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 px-4" /></div>
                <div><label className="text-[10px] text-gray-500 font-black mb-2 block tracking-widest">年期</label><input type="number" value={investYears} onChange={e=>setInvestYears(Number(e.target.value))} className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 px-4" /></div>
              </div>
              <div className="pt-4 border-t border-white/5"><p className="text-gray-400 text-sm">期末總值</p><p className="text-3xl font-black text-amber-500">{getSavingsResult().total.toLocaleString()} <small className="text-xs">元</small></p></div>
            </div>
          )}

          {calcMode === 'irr' && (
            <div className="space-y-4">
              <div><label className="text-[10px] text-gray-500 font-black mb-2 block tracking-widest">總繳保費 / 投入成本</label><input type="number" value={totalPremium} onChange={e=>setTotalPremium(Number(e.target.value))} className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 px-4 text-white font-bold" /></div>
              <div><label className="text-[10px] text-gray-500 font-black mb-2 block tracking-widest">期末領回金額</label><input type="number" value={maturityValue} onChange={e=>setMaturityValue(Number(e.target.value))} className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 px-4 text-amber-500 font-black" /></div>
              <div><label className="text-[10px] text-gray-500 font-black mb-2 block tracking-widest">持有年期 (含繳費期)</label><input type="number" value={irrYears} onChange={e=>setIrrYears(Number(e.target.value))} className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 px-4" /></div>
              <div className="pt-4 border-t border-white/5"><p className="text-gray-400 text-sm">年化報酬率 (IRR)</p><p className="text-3xl font-black text-amber-500">{getIrrResult()} <small className="text-xs">%</small></p></div>
            </div>
          )}
        </div>

        <div className="mt-8 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 text-[11px] text-gray-400 leading-relaxed">
          💡 <span className="font-black text-amber-500">Ultra 分析：</span> 
          {calcMode === 'irr' ? '儲蓄險的重點不在預定利率，而在領回時的實質 IRR。若此數值高於定存與通膨，則是穩健的資產水庫。' : '資產配置的精髓在於平衡。'}
        </div>
      </div>
    </div>
  );
};

export default UltraProDashboard;