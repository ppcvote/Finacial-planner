import React, { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, Loader2, Calculator, Percent, Home, TrendingUp, PieChart, Coins, Edit2 } from 'lucide-react';
import html2canvas from 'html2canvas';

// 🚀 新增：數據驅動的動態渲染引擎
const DynamicChart = ({ data }: { data: any }) => {
  if (!data || !data.values) return <div className="h-[110px]" />;
  const { type, values } = data;
  const width = 300;
  const height = 100;
  const padding = 20;

  // 轉換座標點
  const points = values.map((v: number, i: number) => ({
    x: padding + (i * (width - padding * 2)) / (values.length - 1),
    y: height - padding - (v / 100) * (height - padding * 2)
  }));

  // 生成平滑貝茲曲線路徑
  const getPath = () => {
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cpX = (curr.x + next.x) / 2;
      d += ` C ${cpX} ${curr.y}, ${cpX} ${next.y}, ${next.x} ${next.y}`;
    }
    return d;
  };

  return (
    <div className="relative w-full h-[120px] flex items-center justify-center bg-white/[0.01] rounded-2xl border border-white/5 overflow-hidden">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="z-10">
        {type === 'structure' ? (
          values.map((v: number, i: number) => (
            <rect key={i} x={points[i].x - 12} y={points[i].y} width="24" height={height - padding - points[i].y} fill={i === values.length - 1 ? "#D4AF37" : "#444444"} rx="3" />
          ))
        ) : (
          <>
            <path d={getPath()} stroke="#D4AF37" strokeWidth="4" fill="none" strokeLinecap="round" />
            <circle cx={points[points.length-1].x} cy={points[points.length-1].y} r="3" fill="#D4AF37" className="animate-pulse" />
          </>
        )}
      </svg>
      {/* 底部基準線 */}
      <div className="absolute bottom-4 w-[85%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
    </div>
  );
};

const UltraProDashboard = ({ user, userName }: { user: any; userName?: any }) => {
  const storyRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(true);
  const [dailyData, setDailyData] = useState<any>(null);
  const [advisorName, setAdvisorName] = useState(user?.displayName || userName || '專業財務顧問');
  const [calcMode, setCalcMode] = useState<'loan' | 'savings' | 'irr'>('loan');

  // --- 試算數據狀態 ---
  const [loanAmount, setLoanAmount] = useState<number>(10000000);
  const [loanRate, setLoanRate] = useState<number>(2.2);
  const [loanYears, setLoanYears] = useState<number>(30);
  const [initialCapital, setInitialCapital] = useState<number>(1000000);
  const [monthlyInvest, setMonthlyInvest] = useState<number>(10000);
  const [expectedRate, setExpectedRate] = useState<number>(6);
  const [investYears, setInvestYears] = useState<number>(20);
  const [totalPremium, setTotalPremium] = useState<number>(1000000);
  const [maturityValue, setMaturityValue] = useState<number>(1350000);
  const [irrYears, setIrrYears] = useState<number>(10);

  const fetchAIInsight = async (force = false) => {
    setIsLoadingAI(true);
    if (force) setDailyData(null);
    const API_URL = `https://us-central1-grbt-f87fa.cloudfunctions.net/getDailyInsight?t=${Date.now()}`;
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setDailyData(Array.isArray(data) ? data[0] : data);
    } catch (error) {
      console.error(error);
    } finally { setIsLoadingAI(false); }
  };

  useEffect(() => { fetchAIInsight(); }, []);

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
    return { total: Math.round(fv) };
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
    link.download = `Ultra_Insight_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setIsGenerating(false);
  };

  return (
    <div className="flex flex-col lg:flex-row items-start justify-center gap-10 p-6 lg:p-12 bg-black min-h-screen text-white font-sans">
      
      {/* 左側：智庫圖卡 */}
      <div className="w-full max-w-[360px] flex flex-col gap-6">
        <div className="flex gap-3">
          <button onClick={() => fetchAIInsight(true)} className="flex-1 bg-gray-900 border border-gray-700 py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95"><RefreshCw size={14} />換主題</button>
          <button onClick={handleDownload} className="flex-1 bg-amber-600 py-3 rounded-xl font-bold shadow-lg shadow-amber-900/20 active:scale-95">{isGenerating ? '生成中...' : '儲存高清圖'}</button>
        </div>
        
        <div ref={storyRef} className="relative aspect-[9/16] bg-[#080808] p-8 border border-white/5 shadow-2xl overflow-hidden flex flex-col">
          {isLoadingAI && <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center"><Loader2 className="animate-spin text-amber-500" /></div>}
          
          <div className="absolute top-5 right-6 z-20 flex items-center gap-1.5 opacity-50">
            <span className="text-white/30 text-[7px] uppercase tracking-[0.2em]">Ultra Advisor</span>
            <div className="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center p-[1px]"><img src="/logo.png" className="w-2.5 h-2.5 invert" alt="logo" /></div>
          </div>

          <div className="relative z-10 mt-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-[1px] w-5 bg-amber-500"></div>
              <span className="text-amber-500 text-[8px] tracking-[0.4em] font-black uppercase">Ultra Insight</span>
            </div>
            <h1 className="text-2xl font-black mb-1.5 leading-tight tracking-tight">{dailyData?.title}</h1>
            <p className="text-amber-200/30 text-[10px] font-bold tracking-wide">{dailyData?.subtitle}</p>
          </div>

          {/* 渲染動態圖表 */}
          <div className="my-5">
            <DynamicChart data={dailyData?.visualData} />
          </div>

          <div className="relative z-10 flex-1 flex flex-col justify-start gap-4 px-1">
            {dailyData?.concepts?.map((c: any, i: number) => (
              <div key={i} className="flex gap-4 items-start border-b border-white/5 pb-2 last:border-0">
                <div className="flex-shrink-0 w-6 h-6 rounded-full border border-amber-500/40 flex items-center justify-center text-amber-500 text-[9px] font-black bg-amber-500/5">{c.tag}</div>
                <p className="text-[12px] text-gray-300 font-medium leading-relaxed">{c.content}</p>
              </div>
            ))}
          </div>

          <div className="relative z-10 mt-4 mb-6 border-l border-amber-600/40 pl-3 py-0.5">
            <p className="text-[10px] text-gray-500 italic leading-snug">"{dailyData?.conclusion}"</p>
          </div>

          <div className="relative z-10 mt-auto pt-3 border-t border-white/10 flex justify-between items-end opacity-80">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center border border-white/10"><img src="/logo.png" className="w-3 h-3 opacity-50" alt="logo" /></div>
              <div>
                <p className="text-[10px] font-black text-white leading-none mb-1 tracking-tight">{advisorName}</p>
                <p className="text-[5px] text-gray-600 uppercase tracking-widest font-bold tracking-tighter">Wealth Strategy Elite</p>
              </div>
            </div>
            <p className="text-[6px] text-amber-900/40 font-black tracking-tighter uppercase">#UltraAdvisor</p>
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
              <div className="pt-6 border-t border-white/5 text-3xl font-black text-white">{getLoanResult().monthly.toLocaleString()} <small className="text-xs text-amber-600">TWD</small></div>
            </div>
          )}

          {calcMode === 'savings' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] text-gray-500 font-black mb-2 block tracking-widest uppercase">初始投入</label><input type="number" value={initialCapital} onChange={e=>setInitialCapital(Number(e.target.value))} className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 px-4 outline-none focus:border-amber-500" /></div>
                <div><label className="text-[10px] text-gray-500 font-black mb-2 block tracking-widest uppercase">每月投放</label><input type="number" value={monthlyInvest} onChange={e=>setMonthlyInvest(Number(e.target.value))} className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 px-4 outline-none focus:border-amber-500" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] text-gray-500 font-black mb-2 block tracking-widest uppercase">報酬率 %</label><input type="number" value={expectedRate} onChange={e=>setExpectedRate(Number(e.target.value))} className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 px-4 outline-none focus:border-amber-500" /></div>
                <div><label className="text-[10px] text-gray-500 font-black mb-2 block tracking-widest uppercase">年期</label><input type="number" value={investYears} onChange={e=>setInvestYears(Number(e.target.value))} className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 px-4 outline-none focus:border-amber-500" /></div>
              </div>
              <div className="pt-6 border-t border-white/5 text-3xl font-black text-amber-500">{getSavingsResult().total.toLocaleString()} <small className="text-xs">TWD</small></div>
            </div>
          )}

          {calcMode === 'irr' && (
            <div className="space-y-4">
              <div><label className="text-[10px] text-gray-500 font-black mb-2 block tracking-widest uppercase">總繳保費</label><input type="number" value={totalPremium} onChange={e=>setTotalPremium(Number(e.target.value))} className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 px-4 text-white font-bold outline-none focus:border-amber-500" /></div>
              <div><label className="text-[10px] text-gray-500 font-black mb-2 block tracking-widest uppercase">期末領回</label><input type="number" value={maturityValue} onChange={e=>setMaturityValue(Number(e.target.value))} className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 px-4 text-amber-500 font-black outline-none focus:border-amber-500" /></div>
              <div><label className="text-[10px] text-gray-500 font-black mb-2 block tracking-widest uppercase">年期</label><input type="number" value={irrYears} onChange={e=>setIrrYears(Number(e.target.value))} className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 px-4 outline-none focus:border-amber-500" /></div>
              <div className="pt-6 border-t border-white/5 text-4xl font-black text-amber-500">{getIrrResult()} <small className="text-xs font-bold">%</small></div>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Edit2 size={14} className="text-amber-500" />
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">圖卡品牌設定</span>
          </div>
          <input type="text" value={advisorName} onChange={(e) => setAdvisorName(e.target.value)} className="w-full bg-black/30 border border-gray-800 rounded-xl py-2 px-4 text-sm text-white focus:border-amber-500 outline-none" />
        </div>
      </div>
    </div>
  );
};

export default UltraProDashboard;