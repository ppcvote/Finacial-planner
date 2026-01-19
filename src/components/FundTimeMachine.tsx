import { useState, useMemo, useEffect, useRef } from 'react';
import {
  History,
  TrendingUp,
  TrendingDown,
  Coins,
  LineChart as LineChartIcon,
  Info,
  Zap,
  PiggyBank,
  CalendarDays,
  Target,
  Search,
  MessageCircle,
  Lightbulb,
  ShieldAlert,
  Copy,
  Check,
  X,
  Crown,
  Camera,
  BarChart3,
  Wallet,
  AlertTriangle
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { fundDatabase, generateFundHistory, generateDCAHistory } from '../data/fundData';
import html2canvas from 'html2canvas';

// ==========================================
// 數字動畫 Hook (CountUp)
// ==========================================
const useCountUp = (end: number, duration: number = 1000, decimals: number = 1) => {
  const [count, setCount] = useState(0);
  const prevEndRef = useRef(end);

  useEffect(() => {
    // 當目標值改變時才觸發動畫
    if (prevEndRef.current === end) return;
    prevEndRef.current = end;

    const startTime = Date.now();
    const startValue = count;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      // easeOutExpo 緩動函數
      const easeProgress = 1 - Math.pow(2, -10 * progress);
      const currentValue = startValue + (end - startValue) * easeProgress;

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration]);

  // 初始設定
  useEffect(() => {
    setCount(end);
    prevEndRef.current = end;
  }, []);

  return Number(count.toFixed(decimals));
};

// ==========================================
// 數字動畫元件
// ==========================================
const AnimatedNumber = ({
  value,
  prefix = '',
  suffix = '',
  decimals = 1
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) => {
  const animatedValue = useCountUp(value, 800, decimals);
  return (
    <span>
      {prefix}{animatedValue.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
    </span>
  );
};

// ==========================================
// 業務小抄資料
// ==========================================
const SALES_CHEATSHEET: Record<string, {
  title: string;
  color: string;
  hooks: { label: string; script: string }[];
  objections: { q: string; a: string }[];
  closingLines: string[];
}> = {
  growth: {
    title: '成長型基金',
    color: 'blue',
    hooks: [
      { label: '時光機震撼法', script: '如果 2001 年你投入 100 萬買台灣科技基金，現在已經變成 1500 萬。時間，是財富最好的朋友。' },
      { label: '複利魔法法', script: '愛因斯坦說複利是世界第八大奇蹟。每年 10% 的報酬，7 年就能翻倍。您準備好讓時間幫您賺錢了嗎？' },
      { label: '通膨剋星法', script: '成長型基金長期年化報酬常超過 10%，遠勝定存的 1.5%。這是對抗通膨最有效的武器。' },
    ],
    objections: [
      { q: '股票波動太大，我怕賠錢', a: '短期波動是常態，但拉長到 10 年以上，股市幾乎都是正報酬。重點是「時間」，不是「時機」。' },
      { q: '現在是不是進場的好時機？', a: '沒有人能預測最佳時機。定期定額可以分散風險，買在平均成本，不用擔心買貴。' },
    ],
    closingLines: [
      '財富自由不是靠「存」，是靠「時間 × 複利」。越早開始，越輕鬆達成。',
      '這張回測圖告訴我們：最好的投資時機是 20 年前，其次是現在。',
    ],
  },
  income: {
    title: '配息型基金',
    color: 'emerald',
    hooks: [
      { label: '現金流思維法', script: '每月領息就像多一份被動收入。100 萬本金，年配 6% = 每月 5000 元零用金，不用動到本金。' },
      { label: '退休替代法', script: '勞保可能縮水，但配息基金不會。現在開始累積配息資產，退休後每月有穩定現金流。' },
      { label: '房租替代法', script: '買房收租要管理、怕空租。配息基金每月自動入帳，不用當房東也能有「房租收入」。' },
    ],
    objections: [
      { q: '配息會不會吃到本金？', a: '好的配息基金會控制配息率，長期來看淨值穩定。關鍵是選對標的，我可以幫您挑選。' },
      { q: '淨值會不會一直跌？', a: '配息型基金淨值波動正常，但累積配息 + 淨值的「總報酬」才是重點。這張圖表清楚呈現。' },
    ],
    closingLines: [
      '配息不是「利息」，是您的資產每月自動變現的能力。',
      '退休規劃不只是存一筆錢，更重要的是建立「持續現金流」。',
    ],
  },
};

const FundTimeMachine = () => {
  const [mode, setMode] = useState<'lump' | 'dca'>('lump');
  const [selectedFund, setSelectedFund] = useState("USDEQ3490");
  const [amount, setAmount] = useState(100); // 萬 (單筆)
  const [monthlyAmount, setMonthlyAmount] = useState(10000); // 元 (DCA)
  const [searchTerm, setSearchTerm] = useState("");
  const [fundTypeFilter, setFundTypeFilter] = useState<'all' | 'growth' | 'income'>('all');

  // 圖表區域參考（用於匯出）
  const chartRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // ==========================================
  // 業務小抄狀態（三連點觸發）
  // ==========================================
  const [showCheatsheet, setShowCheatsheet] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [clickCount, setClickCount] = useState(0);
  const clickTimer = useRef<NodeJS.Timeout | null>(null);

  // 首次進入提示狀態
  const HINT_STORAGE_KEY = 'ua_fund_time_machine_cheatsheet_hint_seen';
  const [showTripleClickHint, setShowTripleClickHint] = useState(false);

  // 三連點觸發函式
  const handleSecretClick = () => {
    setClickCount(prev => prev + 1);
    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => setClickCount(0), 800);
    if (clickCount >= 2) {
      setShowCheatsheet(true);
      setClickCount(0);
      // 關閉提示
      if (showTripleClickHint) {
        setShowTripleClickHint(false);
        localStorage.setItem(HINT_STORAGE_KEY, 'true');
      }
    }
  };

  // ESC 鍵關閉
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowCheatsheet(false);
        setShowTripleClickHint(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 首次進入頁面顯示提示
  useEffect(() => {
    const hasSeenHint = localStorage.getItem(HINT_STORAGE_KEY);
    if (!hasSeenHint) {
      const timer = setTimeout(() => {
        setShowTripleClickHint(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // 關閉提示並記錄已看過
  const dismissHint = () => {
    setShowTripleClickHint(false);
    localStorage.setItem(HINT_STORAGE_KEY, 'true');
  };

  // 複製到剪貼簿
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // 取得基金資訊
  const fundInfo = fundDatabase[selectedFund as keyof typeof fundDatabase];
  const isGrowth = fundInfo.type === 'growth';
  const cheatsheetType = isGrowth ? 'growth' : 'income';

  // 定義顏色主題
  const theme = {
    bgGradient: isGrowth ? 'from-blue-800 to-indigo-900' : 'from-emerald-800 to-teal-900',
    iconColor: isGrowth ? 'text-blue-400' : 'text-emerald-400',
    accentColor: isGrowth ? 'text-blue-600' : 'text-emerald-600',
    sliderBg: isGrowth ? 'bg-blue-100' : 'bg-emerald-100',
    sliderAccent: isGrowth ? 'accent-blue-600' : 'accent-emerald-600',
    selectedBorder: isGrowth ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50' : 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50',
    chartStroke: isGrowth ? '#3b82f6' : '#10b981',
    chartFill: isGrowth ? '#3b82f6' : '#10b981',
    chartDivStroke: '#f59e0b',
    chartPrincipal: '#64748b'
  };

  // 過濾基金清單邏輯
  const filteredFunds = useMemo(() => {
    return Object.values(fundDatabase).filter(fund => {
      const matchesSearch = fund.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           fund.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = fundTypeFilter === 'all' ||
                         (fundTypeFilter === 'growth' && fund.type === 'growth') ||
                         (fundTypeFilter === 'income' && fund.type === 'income');
      return matchesSearch && matchesType;
    });
  }, [searchTerm, fundTypeFilter]);

  // 產生回測數據
  const data = useMemo(() => {
    if (mode === 'lump') {
      return generateFundHistory(selectedFund, amount * 10000);
    } else {
      return generateDCAHistory(selectedFund, monthlyAmount);
    }
  }, [mode, selectedFund, amount, monthlyAmount]);

  if (!data || data.length === 0) return <div className="p-8 text-center text-slate-500">數據載入中...</div>;

  const finalResult = data[data.length - 1];
  const totalPrincipal = finalResult.investedPrincipal;
  const totalReturnRate = ((finalResult.totalReturn - totalPrincipal) / totalPrincipal) * 100;

  // 計算 CAGR (年化報酬率)
  const startYear = parseInt(fundInfo.inceptionDate.split('-')[0]);
  const currentYear = new Date().getFullYear();
  const years = currentYear - startYear;
  const cagr = years > 0 ? (Math.pow(finalResult.totalReturn / totalPrincipal, 1 / years) - 1) * 100 : 0;

  // ==========================================
  // 🆕 計算最大回撤 (Max Drawdown)
  // ==========================================
  const maxDrawdown = useMemo(() => {
    let peak = 0;
    let maxDd = 0;
    for (const point of data) {
      if (point.totalReturn > peak) {
        peak = point.totalReturn;
      }
      const drawdown = ((peak - point.totalReturn) / peak) * 100;
      if (drawdown > maxDd) {
        maxDd = drawdown;
      }
    }
    return maxDd;
  }, [data]);

  // ==========================================
  // 🆕 計算平均月配息金額 (僅配息型)
  // ==========================================
  const avgMonthlyDividend = useMemo(() => {
    if (isGrowth || data.length < 2) return 0;
    const totalDividends = finalResult.cumulativeDividends;
    const months = data.length;
    return totalDividends / months;
  }, [data, isGrowth, finalResult]);

  // ==========================================
  // 🆕 計算本金增幅比例 (用於進度條)
  // ==========================================
  const growthMultiplier = finalResult.totalReturn / totalPrincipal;

  // 匯出圖片功能
  const handleExportImage = async () => {
    if (!chartRef.current || isExporting) return;

    setIsExporting(true);
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `基金回測_${fundInfo.id}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('匯出失敗:', error);
      alert('匯出失敗，請稍後再試');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-20">

      {/* Header */}
      <div className={`bg-gradient-to-r ${theme.bgGradient} rounded-3xl p-8 text-white shadow-lg relative overflow-hidden transition-colors duration-500`}>
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <History size={180} />
        </div>
        <div className="relative z-10">
           <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-wider border uppercase ${isGrowth ? 'bg-blue-500/20 text-blue-200 border-blue-400/30' : 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'}`}>
                 {isGrowth ? 'Capital Growth' : 'Income & Stability'}
              </span>
              {/* 🔥 業務小抄秘密觸發點 */}
              <div className="relative">
                <span
                  onClick={handleSecretClick}
                  className="bg-amber-400/20 text-amber-200 px-3 py-1 rounded-full text-[10px] font-bold border border-amber-400/30 cursor-default select-none hover:bg-amber-400/30 transition-colors"
                >
                  時間 × 複利
                </span>
                {/* 首次進入提示氣泡 */}
                {showTripleClickHint && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 animate-pulse">
                    <div className="relative bg-slate-900 text-white px-4 py-2 rounded-lg shadow-xl whitespace-nowrap border border-amber-500/50">
                      <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-slate-900" />
                      <p className="text-sm font-bold flex items-center gap-2">
                        <span className="text-yellow-400">💡</span>
                        點三下可開啟業務小抄
                      </p>
                      <button
                        onClick={(e) => { e.stopPropagation(); dismissHint(); }}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center text-xs border border-slate-500"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>
           </div>
           <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 flex items-center gap-3">
             <LineChartIcon className={theme.iconColor} size={36}/>
             基金時光機
           </h1>
           <p className="text-white/80 text-lg max-w-xl">
             {mode === 'lump'
                ? '回測單筆投入的複利效應。時間是財富最好的朋友。'
                : '回測定期定額的累積力量。紀律投資，無懼市場波動。'}
           </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">

        {/* 左側：控制面板 */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">

              {/* 模式切換 */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                 <button
                   onClick={() => setMode('lump')}
                   className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${mode === 'lump' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                    <Target size={16}/> 單筆投入
                 </button>
                 <button
                   onClick={() => setMode('dca')}
                   className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${mode === 'dca' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                    <CalendarDays size={16}/> 定期定額
                 </button>
              </div>

              {/* 1. 選擇基金 (含分類 Tab + 搜尋與卷軸) */}
              <div>
                 <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-500 block">選擇基金標的</label>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-400">{filteredFunds.length} 支</span>
                 </div>

                 {/* 分類 Tab */}
                 <div className="flex gap-1 mb-3 bg-slate-50 p-1 rounded-lg">
                   <button
                     onClick={() => setFundTypeFilter('all')}
                     className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${
                       fundTypeFilter === 'all' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-400'
                     }`}
                   >
                     全部
                   </button>
                   <button
                     onClick={() => setFundTypeFilter('growth')}
                     className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${
                       fundTypeFilter === 'growth' ? 'bg-blue-100 text-blue-700' : 'text-slate-400'
                     }`}
                   >
                     ⚡ 成長
                   </button>
                   <button
                     onClick={() => setFundTypeFilter('income')}
                     className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${
                       fundTypeFilter === 'income' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-400'
                     }`}
                   >
                     💰 配息
                   </button>
                 </div>

                 {/* 搜尋框 */}
                 <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder="搜尋代碼或名稱..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
                    />
                 </div>

                 {/* 卷軸區域 */}
                 <div className="grid grid-cols-1 gap-2 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    {filteredFunds.length > 0 ? (
                        filteredFunds.map((fund) => {
                           const isThisGrowth = fund.type === 'growth';
                           return (
                            <button
                              key={fund.id}
                              onClick={() => setSelectedFund(fund.id)}
                              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden shrink-0 ${selectedFund === fund.id ? theme.selectedBorder : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                            >
                                <div className="flex justify-between items-center relative z-10">
                                  <span className={`font-bold ${selectedFund === fund.id ? (isThisGrowth ? 'text-blue-700' : 'text-emerald-700') : 'text-slate-700'}`}>{fund.id}</span>
                                  <div className="flex gap-1">
                                    <span className={`text-[10px] px-2 py-1 rounded font-bold ${isThisGrowth ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                        {isThisGrowth ? '⚡ 成長' : '💰 配息'}
                                    </span>
                                    <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500">{fund.currency}</span>
                                  </div>
                                </div>
                                <div className="text-sm text-slate-600 mt-1 relative z-10 line-clamp-1">{fund.name}</div>
                            </button>
                           )
                        })
                    ) : (
                        <div className="text-center py-8 text-slate-400 text-sm">
                            找不到相關基金
                        </div>
                    )}
                 </div>
              </div>

              {/* 2. 投入金額 (根據模式變換) */}
              <div className="pt-2 border-t border-slate-100">
                 <label className="text-xs font-bold text-slate-500 mb-2 block">
                    {mode === 'lump' ? '成立日單筆投入 (萬)' : '每月定期定額 (元)'}
                 </label>
                 <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-black text-slate-700">
                        {mode === 'lump' ? `${amount} 萬` : `$${monthlyAmount.toLocaleString()}`}
                    </span>
                 </div>

                 {mode === 'lump' ? (
                    <input
                      type="range" min={10} max={1000} step={10}
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className={`w-full h-2 rounded-lg cursor-pointer ${theme.sliderBg} ${theme.sliderAccent}`}
                    />
                 ) : (
                    <input
                      type="range" min={3000} max={50000} step={1000}
                      value={monthlyAmount}
                      onChange={(e) => setMonthlyAmount(Number(e.target.value))}
                      className={`w-full h-2 rounded-lg cursor-pointer ${theme.sliderBg} ${theme.sliderAccent}`}
                    />
                 )}
              </div>

              {/* 資訊卡 */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm space-y-2">
                 <div className="flex justify-between">
                    <span className="text-slate-500">成立日期</span>
                    <span className="font-bold text-slate-700">{fundInfo.inceptionDate}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-slate-500">成立時淨值</span>
                    <span className="font-bold text-slate-700">${fundInfo.startNav} {fundInfo.currency}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-slate-500">目前淨值 (估)</span>
                    <span className="font-bold text-slate-700">${fundInfo.currentNav} {fundInfo.currency}</span>
                 </div>
                 {fundInfo.avgYield > 0 && (
                   <div className="flex justify-between">
                      <span className="text-slate-500">平均年配息率</span>
                      <span className="font-bold text-emerald-600">{fundInfo.avgYield}%</span>
                   </div>
                 )}
                 <div className="pt-2 mt-2 border-t border-slate-200 text-xs text-slate-500 leading-relaxed">
                    {fundInfo.desc}
                 </div>
              </div>
           </div>
        </div>

        {/* 右側：結果展示 */}
        <div className="lg:col-span-8 space-y-6">

           {/* 總結算卡片 - 第一排 */}
           <div className="grid md:grid-cols-4 gap-4">
              {/* 卡片 1: 本金 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                 <div className="text-xs text-slate-500 font-bold mb-1">
                    {mode === 'lump' ? '單筆投入本金' : '累積投入本金'}
                 </div>
                 <div className="text-xl font-bold font-mono text-slate-600">
                    <AnimatedNumber value={totalPrincipal / 10000} suffix=" 萬" prefix="$" />
                 </div>
                 <div className="text-xs text-slate-400 mt-1">
                    {mode === 'lump' ? '一次性投入' : '每月持續累積'}
                 </div>
                 <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                    <PiggyBank size={60} className="text-slate-400"/>
                 </div>
              </div>

              {/* 卡片 2: 配息/成長 */}
              <div className={`bg-white p-5 rounded-2xl border shadow-sm relative overflow-hidden ${isGrowth ? 'border-blue-200 bg-blue-50/30' : 'border-emerald-200 bg-emerald-50/30'}`}>
                 <div className={`text-xs font-bold mb-1 ${isGrowth ? 'text-blue-600' : 'text-emerald-600'}`}>
                    {isGrowth ? '資本利得' : '累積領取配息'}
                 </div>
                 <div className={`text-xl font-black font-mono ${isGrowth ? 'text-blue-600' : 'text-emerald-600'}`}>
                    {isGrowth
                      ? <AnimatedNumber value={(finalResult.totalReturn - totalPrincipal) / 10000} suffix=" 萬" prefix="+$" />
                      : <AnimatedNumber value={finalResult.cumulativeDividends / 10000} suffix=" 萬" prefix="+$" />
                    }
                 </div>
                 <div className={`text-xs mt-1 ${isGrowth ? 'text-blue-500' : 'text-emerald-500'}`}>
                    {isGrowth ? '淨值增值' : '現金已落袋'}
                 </div>
                 <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                    {isGrowth ? <Zap size={50} className="text-blue-600"/> : <Coins size={50} className="text-emerald-600"/>}
                 </div>
              </div>

              {/* 卡片 3: 總資產 */}
              <div className="bg-slate-800 p-5 rounded-2xl text-white shadow-lg relative overflow-hidden">
                 <div className="text-xs text-slate-400 font-bold mb-1">總資產</div>
                 <div className="text-2xl font-black text-yellow-400 font-mono">
                    <AnimatedNumber value={finalResult.totalReturn / 10000} suffix=" 萬" prefix="$" />
                 </div>
                 <div className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                    總報酬 <span className="text-yellow-400 font-bold">+<AnimatedNumber value={totalReturnRate} suffix="%" decimals={0} /></span>
                 </div>
                 <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                    <TrendingUp size={50} className="text-yellow-400"/>
                 </div>
              </div>

              {/* 卡片 4: CAGR 年化報酬率 */}
              <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-5 rounded-2xl text-white shadow-lg relative overflow-hidden">
                 <div className="text-xs text-purple-200 font-bold mb-1">年化報酬率 (CAGR)</div>
                 <div className="text-2xl font-black text-white font-mono">
                    <AnimatedNumber value={cagr} suffix="%" />
                 </div>
                 <div className="text-xs text-purple-200 mt-1">
                    {years} 年平均
                 </div>
                 <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                    <BarChart3 size={50} className="text-purple-300"/>
                 </div>
              </div>
           </div>

           {/* 🆕 總結算卡片 - 第二排（風險與進度） */}
           <div className="grid md:grid-cols-3 gap-4">
              {/* 卡片 5: 最大回撤 */}
              <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm relative overflow-hidden">
                 <div className="text-xs text-rose-600 font-bold mb-1 flex items-center gap-1">
                    <TrendingDown size={12} /> 最大回撤 (MDD)
                 </div>
                 <div className="text-xl font-black font-mono text-rose-600">
                    -<AnimatedNumber value={maxDrawdown} suffix="%" />
                 </div>
                 <div className="text-xs text-slate-400 mt-1">
                    歷史最大跌幅
                 </div>
                 <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                    <AlertTriangle size={50} className="text-rose-400"/>
                 </div>
              </div>

              {/* 卡片 6: 平均月配息 (僅配息型) / 翻倍時間 (成長型) */}
              {!isGrowth ? (
                <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm relative overflow-hidden">
                   <div className="text-xs text-amber-600 font-bold mb-1 flex items-center gap-1">
                      <Wallet size={12} /> 平均月配息
                   </div>
                   <div className="text-xl font-black font-mono text-amber-600">
                      $<AnimatedNumber value={avgMonthlyDividend} suffix="" decimals={0} />
                   </div>
                   <div className="text-xs text-slate-400 mt-1">
                      每月現金流入
                   </div>
                   <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                      <Coins size={50} className="text-amber-400"/>
                   </div>
                </div>
              ) : (
                <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-sm relative overflow-hidden">
                   <div className="text-xs text-blue-600 font-bold mb-1 flex items-center gap-1">
                      <Zap size={12} /> 資產倍數
                   </div>
                   <div className="text-xl font-black font-mono text-blue-600">
                      <AnimatedNumber value={growthMultiplier} suffix="x" />
                   </div>
                   <div className="text-xs text-slate-400 mt-1">
                      本金翻了 {growthMultiplier.toFixed(1)} 倍
                   </div>
                   <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                      <TrendingUp size={50} className="text-blue-400"/>
                   </div>
                </div>
              )}

              {/* 卡片 7: 本金 vs 總資產進度條 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                 <div className="text-xs text-slate-500 font-bold mb-3">本金 → 總資產</div>
                 <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
                    {/* 本金基準 */}
                    <div
                      className="absolute inset-y-0 left-0 bg-slate-300 rounded-full"
                      style={{ width: `${Math.min(100 / growthMultiplier, 100)}%` }}
                    />
                    {/* 總資產 */}
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ${isGrowth ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'}`}
                      style={{ width: '100%' }}
                    />
                    {/* 本金標記線 */}
                    <div
                      className="absolute inset-y-0 w-0.5 bg-slate-800"
                      style={{ left: `${Math.min(100 / growthMultiplier, 100)}%` }}
                    />
                 </div>
                 <div className="flex justify-between mt-2 text-[10px]">
                    <span className="text-slate-500">本金 ${(totalPrincipal/10000).toFixed(0)}萬</span>
                    <span className={`font-bold ${isGrowth ? 'text-blue-600' : 'text-emerald-600'}`}>
                      總資產 ${(finalResult.totalReturn/10000).toFixed(0)}萬
                    </span>
                 </div>
                 <div className="text-center mt-1">
                    <span className="text-xs font-bold text-slate-600">
                      增值 +<AnimatedNumber value={(growthMultiplier - 1) * 100} suffix="%" decimals={0} />
                    </span>
                 </div>
              </div>
           </div>

           {/* 圖表區 */}
           <div ref={chartRef} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-slate-700 flex items-center gap-2">
                   <LineChartIcon size={20} className={theme.accentColor}/> 資產成長走勢圖 (含息)
                </h4>
                <button
                  onClick={handleExportImage}
                  disabled={isExporting}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-lg transition-all disabled:opacity-50"
                >
                  {isExporting ? (
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera size={14} />
                  )}
                  {isExporting ? '匯出中...' : '匯出圖片'}
                </button>
              </div>
              <div className="h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                         <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={theme.chartFill} stopOpacity={0.2}/>
                            <stop offset="95%" stopColor={theme.chartFill} stopOpacity={0}/>
                         </linearGradient>
                      </defs>
                      <XAxis dataKey="year" type="number" domain={['dataMin', 'dataMax']} tickFormatter={(tick) => tick.toFixed(0)} tick={{fontSize:12}} />
                      <YAxis tickFormatter={(val) => `${(val/10000).toFixed(0)}萬`} width={60} tick={{fontSize:12}} />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>

                      <Tooltip
                         labelFormatter={(val) => `${Math.floor(val)}年`}
                         formatter={(value: number, name: string) => {
                           const formattedValue = `$${(value/10000).toFixed(1)}萬`;
                           return [formattedValue, name];
                         }}
                         contentStyle={{
                           borderRadius:'12px',
                           border:'none',
                           boxShadow:'0 4px 12px rgba(0,0,0,0.1)',
                           padding: '12px 16px'
                         }}
                         content={({ active, payload, label }) => {
                           if (!active || !payload || payload.length === 0) return null;
                           const dataPoint = payload[0]?.payload;
                           if (!dataPoint) return null;

                           const yearReturn = dataPoint.investedPrincipal > 0
                             ? ((dataPoint.totalReturn - dataPoint.investedPrincipal) / dataPoint.investedPrincipal) * 100
                             : 0;

                           return (
                             <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-4 min-w-[200px]">
                               <div className="font-bold text-slate-800 mb-2 pb-2 border-b border-slate-100">
                                 {Math.floor(label as number)} 年
                               </div>
                               <div className="space-y-1.5 text-sm">
                                 <div className="flex justify-between">
                                   <span className="text-slate-500">總資產</span>
                                   <span className={`font-bold ${isGrowth ? 'text-blue-600' : 'text-emerald-600'}`}>
                                     ${(dataPoint.totalReturn/10000).toFixed(1)}萬
                                   </span>
                                 </div>
                                 <div className="flex justify-between">
                                   <span className="text-slate-500">投入本金</span>
                                   <span className="font-medium text-slate-700">
                                     ${(dataPoint.investedPrincipal/10000).toFixed(1)}萬
                                   </span>
                                 </div>
                                 {!isGrowth && (
                                   <div className="flex justify-between">
                                     <span className="text-slate-500">累積配息</span>
                                     <span className="font-medium text-amber-600">
                                       ${(dataPoint.cumulativeDividends/10000).toFixed(1)}萬
                                     </span>
                                   </div>
                                 )}
                                 <div className="flex justify-between">
                                   <span className="text-slate-500">淨值</span>
                                   <span className="font-medium text-slate-700">
                                     ${dataPoint.nav?.toFixed(2) || '-'} {fundInfo.currency}
                                   </span>
                                 </div>
                                 {fundInfo.currency === 'USD' && (
                                   <div className="flex justify-between">
                                     <span className="text-slate-500">匯率</span>
                                     <span className="font-medium text-slate-700">
                                       {dataPoint.rate?.toFixed(2) || '-'}
                                     </span>
                                   </div>
                                 )}
                                 <div className="flex justify-between pt-1.5 mt-1.5 border-t border-slate-100">
                                   <span className="text-slate-500">累積報酬</span>
                                   <span className={`font-bold ${yearReturn >= 0 ? 'text-emerald-600' : 'text-blue-600'}`}>
                                     {yearReturn >= 0 ? '+' : ''}{yearReturn.toFixed(1)}%
                                   </span>
                                 </div>
                               </div>
                             </div>
                           );
                         }}
                      />

                      <Legend />

                      {/* 1. 總資產 */}
                      <Area
                          type="monotone"
                          dataKey="totalReturn"
                          name="總資產"
                          stroke={theme.chartStroke}
                          fill="url(#colorTotal)"
                          strokeWidth={3}
                      />

                      {/* 2. 累積配息 (僅配息型顯示) */}
                      {!isGrowth && (
                          <Area
                              type="monotone"
                              dataKey="cumulativeDividends"
                              name="累積配息"
                              stroke={theme.chartDivStroke}
                              fill="none"
                              strokeWidth={2}
                              strokeDasharray="5 5"
                          />
                      )}

                      {/* 3. 投入本金 */}
                      <Area
                          type="monotone"
                          dataKey="investedPrincipal"
                          name="投入本金"
                          stroke={theme.chartPrincipal}
                          fill="none"
                          strokeWidth={2}
                          strokeDasharray="4 4"
                      />
                   </AreaChart>
                </ResponsiveContainer>
              </div>
              {/* 圖表內浮水印（匯出時顯示） */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <div className="text-[10px] text-slate-400">
                  {fundInfo.name} | {mode === 'lump' ? `單筆 ${amount} 萬` : `定期定額 $${monthlyAmount.toLocaleString()}/月`}
                </div>
                <div className="text-[10px] text-slate-400">
                  Ultra Advisor © {new Date().getFullYear()}
                </div>
              </div>
           </div>

           {/* 備註 */}
           <div className="text-right">
              <span className="text-[10px] text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 inline-flex items-center gap-1.5">
                 <Info size={12}/>
                 本試算基於 {fundInfo.inceptionDate} 至 {new Date().getFullYear()} 年之歷史淨值與匯率概算，過去績效不代表未來收益。
              </span>
           </div>

        </div>
      </div>

      {/* =========================================================================== */}
      {/* 業務小抄側邊面板（三連點觸發） */}
      {/* =========================================================================== */}
      {showCheatsheet && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* 背景遮罩 */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowCheatsheet(false)}
          />

          {/* 側邊面板 */}
          <div className="relative w-full max-w-md bg-slate-900 text-white shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
            {/* 標題列 */}
            <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-4 flex justify-between items-center z-10">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <MessageCircle size={20} className="text-cyan-400" />
                  業務小抄
                  <Crown size={16} className="text-amber-400" />
                </h3>
                <p className="text-xs text-slate-400">
                  {SALES_CHEATSHEET[cheatsheetType]?.title || '基金時光機'} · 按 ESC 關閉
                </p>
              </div>
              <button
                onClick={() => setShowCheatsheet(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* 小抄內容 */}
            {SALES_CHEATSHEET[cheatsheetType] && (
              <div className="p-4 space-y-6 text-sm">
                {/* ========== 1. 開場話術 ========== */}
                <div>
                  <h4 className="font-bold text-cyan-400 mb-3 flex items-center gap-2">
                    <Lightbulb size={16} />
                    開場切入話術
                  </h4>
                  <div className="space-y-2">
                    {SALES_CHEATSHEET[cheatsheetType].hooks.map((hook, i) => (
                      <div key={i} className="bg-slate-800 rounded-xl p-3 hover:bg-slate-700 transition-all">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-900/50 px-2 py-0.5 rounded-full">
                              {hook.label}
                            </span>
                            <p className="text-slate-300 mt-2 leading-relaxed text-xs">
                              「{hook.script}」
                            </p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(hook.script, `panel-hook-${i}`)}
                            className="p-1.5 text-slate-500 hover:text-cyan-400 hover:bg-slate-600 rounded transition-all shrink-0"
                            title="複製話術"
                          >
                            {copiedIndex === `panel-hook-${i}` ? (
                              <Check size={14} className="text-emerald-400" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ========== 2. 異議處理 ========== */}
                <div>
                  <h4 className="font-bold text-amber-400 mb-3 flex items-center gap-2">
                    <ShieldAlert size={16} />
                    異議處理
                  </h4>
                  <div className="space-y-2">
                    {SALES_CHEATSHEET[cheatsheetType].objections.map((obj, i) => (
                      <div key={i} className="bg-slate-800 rounded-xl p-3">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-[10px] font-bold text-rose-400 bg-rose-900/50 px-2 py-0.5 rounded-full shrink-0">
                            客戶說
                          </span>
                          <p className="text-slate-400 text-xs">「{obj.q}」</p>
                        </div>
                        <div className="flex items-start justify-between gap-2 mt-2 pl-3 border-l-2 border-emerald-500">
                          <div className="flex-1">
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-900/50 px-2 py-0.5 rounded-full">
                              這樣回應
                            </span>
                            <p className="text-slate-300 mt-1.5 leading-relaxed text-xs">
                              「{obj.a}」
                            </p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(obj.a, `panel-obj-${i}`)}
                            className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-slate-600 rounded transition-all shrink-0"
                            title="複製回應"
                          >
                            {copiedIndex === `panel-obj-${i}` ? (
                              <Check size={14} className="text-emerald-400" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ========== 3. 成交金句 ========== */}
                <div>
                  <h4 className="font-bold text-purple-400 mb-3 flex items-center gap-2">
                    <Target size={16} />
                    成交金句
                  </h4>
                  <div className="space-y-2">
                    {SALES_CHEATSHEET[cheatsheetType].closingLines.map((line, i) => (
                      <div
                        key={i}
                        className="bg-purple-900/30 rounded-xl p-3 border border-purple-700/50 flex items-center justify-between gap-2"
                      >
                        <p className="text-purple-200 text-xs italic leading-relaxed">
                          「{line}」
                        </p>
                        <button
                          onClick={() => copyToClipboard(line, `panel-close-${i}`)}
                          className="p-1.5 text-slate-500 hover:text-purple-400 hover:bg-slate-600 rounded transition-all shrink-0"
                          title="複製金句"
                        >
                          {copiedIndex === `panel-close-${i}` ? (
                            <Check size={14} className="text-emerald-400" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 小提示 */}
                <div className="text-center text-[10px] text-slate-500 pt-4 border-t border-slate-700">
                  💡 點擊複製按鈕可直接複製話術
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FundTimeMachine;
