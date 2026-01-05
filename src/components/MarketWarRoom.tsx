import React, { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, Loader2, Calculator, Percent, Home, TrendingUp, PieChart, Coins, Edit2 } from 'lucide-react';
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

  // --- 3. IRR 報酬試算狀態 ---
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
    <div className="flex flex-col lg:flex-row items-start justify-center gap-10 p-6 lg:p-12 bg-black min-h-screen text-white font-sans">
      
      {/* 左側：智庫圖卡 */}
      <div className="w-full max-w-[360px] flex flex-col gap-6">
        <div className="flex gap-3">
          <button onClick={() => fetchAIInsight(true)} className="flex-1 bg-gray-900 border border-gray-700 py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"><RefreshCw size={14} />換主題</button>
          <button onClick={handleDownload} className="flex-1 bg-amber-600 py-3 rounded-xl font-bold shadow-lg shadow-amber-900/20 transition-all active:scale-95">{isGenerating ? '生成中...' : '儲存高清圖'}</button>
        </div>
        
        <div ref={storyRef} className="relative aspect-[9/16] bg-[#080808] p-7 border border-white/5 shadow-2xl overflow-hidden flex flex-col">
          {isLoadingAI && <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center"><Loader2 className="animate-spin text-amber-500" /></div>}
          
          {/* 右上角品牌標示 */}
          <div className="absolute top-4 right-5 z-20 flex items-center gap-1.5">
            <span className="text-white/20 text-[6px] uppercase tracking-[0.2em]">Ultra Advisor</span>
            <div className="w-3.5 h-3.5 bg-amber-500 rounded-full flex items-center justify-center">
              <img src="/logo.png" className="w-2 h-2 invert" />
            </div>
          </div>

          {/* 1. 標題區域 */}
          <div className="relative z-10 mt-0 flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-[1px] w-4 bg-amber-500"></div>
              <span className="text-amber-500 text-[7px] tracking-[0.3em] font-black uppercase">Ultra Insight</span>
            </div>
            <h1 className="text-xl font-black mb-1 leading-tight tracking-tight">{dailyData?.title || " "}</h1>
            <p className="text-amber-200/30 text-[9px] font-bold tracking-wide">{dailyData?.subtitle || " "}</p>
          </div>

          {/* 2. 圖表區域 - 鎖定高度並加上視覺基準線 */}
          <div className="relative z-10 my-4 flex-shrink-0 min-h-[110px] flex flex-col items-center justify-center overflow-hidden">
            <div 
              className="w-full h-full flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: dailyData?.visualChart }} 
            />
            {/* 視覺基準線：讓圖表有落地感 */}
            <div className="absolute bottom-1 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>

          {/* 3. 觀念清單 - 控制間距 */}
          <div className="relative z-10 flex-1 flex flex-col justify-start gap-4 pt-1 px-1">
            {dailyData?.concepts?.map((c: any, i: number) => (
              <div key={i} className="flex gap-3 border-b border-white/5 pb-2 last:border-0">
                <div className="text-amber-500 text-[8px] font-black w-5 flex-shrink-0 pt-0.5">{c.tag || (i+1)}</div>
                <p className="text-[11px] text-gray-300 leading-relaxed font-medium">{c.content}</p>
              </div>
            ))}
          </div>

          {/* 4. 結語 */}
          <div className="relative z-10 mt-3 mb-6 border-l border-amber-600/40 pl-3 py-0.5">
            <p className="text-[9px] text-gray-500 italic leading-snug">
              "{dailyData?.conclusion}"
            </p>
          </div>

          {/* 5. 個人資訊 - 極致壓低與縮小 */}
          <div className="relative z-10 mt-auto pb-1 flex justify-between items-end border-t border-white/5 pt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 bg-gray-800 rounded flex items-center justify-center border border-white/5">
                <img src="/logo.png" className="w-2.5 h-2.5 opacity-40" alt="logo" />
              </div>
              <div>
                <p className="text-[9px] font-black text-white leading-none mb-0.5 tracking-tight">{advisorName}</p>
                <p className="text-[4.5px] text-gray-600 uppercase tracking-widest font-bold">Wealth Strategy Elite</p>
              </div>
            </div>
            <div className="pb-0.5">
               <p className="text-[6px] text-amber-900/40 font-black tracking-tighter uppercase">#UltraAdvisor</p>
            </div>
          </div>
        </div>
      </div>

      {/* 右側：三合一閃算機 */}
      <div className="w-full max-w-[420px] bg-gray-900/30 p-8 rounded-[2.5rem] border border-gray-800 backdrop-blur-xl shadow-2xl">
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
              <div><label className="text-[10px] text-gray-500 font-black mb-2 block tracking-widest uppercase">貸款總額</label><input type="number" value={loanAmount} onChange={e=>setLoanAmount(Number(e.target.value))} className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 px-4 text-amber-500 font-black outline-none focus:border-amber-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] text-gray-500 font-black mb-2 block tracking-widest uppercase">利率 %</label><input type="number" value={loanRate} onChange={e=>setLoanRate(Number(e.target.value))} className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 px-4 outline-none focus:border-amber-500" /></div>
                <div><label className="text-[10px] text-gray-500 font-black mb-2 block tracking-widest uppercase">年期</label><input type="number" value={loanYears} onChange={e=>setLoanYears(Number(e.target.value))} className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 px-4 outline-none focus:border-amber-500" /></div>
              </div>
              <div className="pt-6 border-t border-white/5"><p className="text-gray-500 text-xs font-bold mb-1 uppercase tracking-wider">每月應付金額</p><p className="text-4xl font-black text-white">{getLoanResult().monthly.toLocaleString()} <small className="text-xs font-bold text-amber-600 tracking-tighter">TWD</small></p></div>
            </div>
          )}

          {calcMode === 'savings' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] text-gray-500 font-black mb-2 block tracking-widest uppercase">初始投入</label><input type="number" value={initialCapital} onChange={e=>setInitialCapital(Number(e.target.value))} className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 px-4 outline-none focus:border-amber-500" /></div>
                <div><label className="text-[10px] text-gray-500 font-black mb-2 block tracking-widest uppercase">每月投放</label><input type="number" value={monthlyInvest} onChange={e=>setMonthlyInvest(Number(e.target.value))} className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 px-4 outline-none focus:border-amber-500" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] text-gray-500 font-black mb-2 block tracking-widest uppercase">年報酬率 %</label><input type="number" value={expectedRate} onChange={e=>setExpectedRate(Number(e.target.value))} className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 px-4 outline-none focus:border-amber-500" /></div>
                <div><label className="text-[10px] text-gray-500 font-black mb-2 block tracking-widest uppercase">投資年期</label><input type="number" value={investYears} onChange={e=>setInvestYears(Number(e.target.value))} className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 px-4 outline-none focus:border-amber-500" /></div>
              </div>
              <div className="pt-6 border-t border-white/5"><p className="text-gray-500 text-xs font-bold mb-1 uppercase tracking-wider">期末資產總值</p><p className="text-4xl font-black text-amber-500">{getSavingsResult().total.toLocaleString()} <small className="text-xs font-bold tracking-tighter">TWD</small></p></div>
            </div>
          )}

          {calcMode === 'irr' && (
            <div className="space-y-4">
              <div><label className="text-[10px] text-gray-500 font-black mb-2 block tracking-widest uppercase">累積總繳保費</label><input type="number" value={totalPremium} onChange={e=>setTotalPremium(Number(e.target.value))} className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 px-4 text-white font-bold outline-none focus:border-amber-500" /></div>
              <div><label className="text-[10px] text-gray-500 font-black mb-2 block tracking-widest uppercase">預期領回金額</label><input type="number" value={maturityValue} onChange={e=>setMaturityValue(Number(e.target.value))} className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 px-4 text-amber-500 font-black outline-none focus:border-amber-500" /></div>
              <div><label className="text-[10px] text-gray-500 font-black mb-2 block tracking-widest uppercase">計算年期</label><input type="number" value={irrYears} onChange={e=>setIrrYears(Number(e.target.value))} className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 px-4 outline-none focus:border-amber-500" /></div>
              <div className="pt-6 border-t border-white/5"><p className="text-gray-500 text-xs font-bold mb-1 uppercase tracking-wider">年化報酬率 (IRR)</p><p className="text-4xl font-black text-amber-500">{getIrrResult()} <small className="text-xs font-bold">%</small></p></div>
            </div>
          )}
        </div>

        {/* 品牌與個人設定 */}
        <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Edit2 size={14} className="text-amber-500" />
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">圖卡品牌設定</span>
          </div>
          <div>
            <label className="text-[10px] text-gray-400 mb-2 block uppercase font-bold tracking-tighter">顧問姓名顯示</label>
            <input 
              type="text" 
              value={advisorName}
              onChange={(e) => setAdvisorName(e.target.value)}
              placeholder="輸入你的姓名或職稱"
              className="w-full bg-black/30 border border-gray-800 rounded-xl py-2 px-4 text-sm text-white focus:border-amber-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="mt-6 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 text-[11px] text-gray-500 leading-relaxed italic">
          💡 <span className="font-black text-amber-600">系統提示：</span>
          {calcMode === 'irr' ? '儲蓄險的價值在於穩定，IRR 是衡量這份穩定最公正的尺。' : '精確的數字是建立客戶信任的第一步。'}
        </div>
      </div>
    </div>
  );
};

export default UltraProDashboard;