import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  Download, 
  Copy, 
  RefreshCw,
  Camera,
  Globe,
  DollarSign,
  Activity,
  User
} from 'lucide-react';
import html2canvas from 'html2canvas';

// --- 模擬市場數據 (擬真引擎) ---
const MOCK_MARKET_DATA = {
  taiex: { name: '加權指數', base: 22800, volatility: 150, isUp: true },
  usdtwd: { name: '美元/台幣', base: 32.45, volatility: 0.1, isUp: false },
  us10y: { name: '美債10年', base: 4.25, volatility: 0.05, isUp: true },
  fearGreed: { score: 65, status: '貪婪' } // 0-100
};

const DAILY_QUOTES = [
  "通膨時代，現金為亡。今日的修正，是為了明日的創高。",
  "投資不是比誰跑得快，是比誰氣長。",
  "別人恐慌時貪婪，最好的買點永遠在「不敢買」的時候。",
  "你不理財，財不理你。種一棵樹最好的時間是十年前，其次是現在。",
  "風險來自於你不知道自己在做什麼，專業讓風險可控。"
];

interface MarketWarRoomProps {
  userName?: string; 
}

// [修正重點] 這裡改成 export const (具名匯出)，而不是 export default
export const MarketWarRoom: React.FC<MarketWarRoomProps> = ({ userName = "專業顧問" }) => {
  const [marketData, setMarketData] = useState<any>(null);
  const [quote, setQuote] = useState("");
  const [theme, setTheme] = useState<'blue' | 'gold' | 'warm'>('blue'); 
  const [isGenerating, setIsGenerating] = useState(false);
  
  const storyRef = useRef<HTMLDivElement>(null);

  // 初始化數據
  useEffect(() => {
    const todayIndex = new Date().getDate() % DAILY_QUOTES.length;
    setQuote(DAILY_QUOTES[todayIndex]);

    const fluctuate = (base: number, vol: number) => {
        const change = (Math.random() - 0.5) * vol;
        return {
            value: (base + change).toFixed(base > 100 ? 0 : 2),
            change: change.toFixed(2),
            isUp: change >= 0
        };
    };

    setMarketData({
        taiex: { ...MOCK_MARKET_DATA.taiex, ...fluctuate(MOCK_MARKET_DATA.taiex.base, MOCK_MARKET_DATA.taiex.volatility) },
        usdtwd: { ...MOCK_MARKET_DATA.usdtwd, ...fluctuate(MOCK_MARKET_DATA.usdtwd.base, MOCK_MARKET_DATA.usdtwd.volatility) },
        us10y: { ...MOCK_MARKET_DATA.us10y, ...fluctuate(MOCK_MARKET_DATA.us10y.base, MOCK_MARKET_DATA.us10y.volatility) },
        fearGreed: MOCK_MARKET_DATA.fearGreed
    });
  }, []);

  const handleDownloadImage = async () => {
    if (!storyRef.current) return;
    setIsGenerating(true);
    try {
        const canvas = await html2canvas(storyRef.current, {
            scale: 2, 
            useCORS: true,
            backgroundColor: null,
        });
        const link = document.createElement('a');
        link.download = `Market_Story_${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (err) {
        console.error("Image generation failed", err);
        alert("圖片生成失敗，請稍後再試");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleCopyText = () => {
    if (!marketData) return;
    const text = `📅 ${new Date().toLocaleDateString()} 市場快訊\n\n📊 加權指數：${marketData.taiex.value} (${marketData.taiex.isUp ? '▲' : '▼'} ${Math.abs(Number(marketData.taiex.change))})\n💵 美元匯率：${marketData.usdtwd.value}\n🔥 市場情緒：${marketData.fearGreed.status} (${marketData.fearGreed.score})\n\n💡 顧問觀點：\n${quote}\n\n#財經 #投資 #理財規劃`;
    navigator.clipboard.writeText(text);
    alert("文案已複製！可直接貼上社群。");
  };

  const themes = {
      blue: {
          bg: "bg-gradient-to-br from-slate-800 to-blue-900",
          accent: "text-blue-400",
          border: "border-blue-500/30",
          btn: "bg-blue-600 hover:bg-blue-700"
      },
      gold: {
          bg: "bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900",
          accent: "text-amber-400",
          border: "border-amber-500/30",
          btn: "bg-amber-600 hover:bg-amber-700"
      },
      warm: {
          bg: "bg-gradient-to-br from-orange-100 to-rose-100", 
          text: "text-slate-800", 
          accent: "text-rose-600",
          border: "border-rose-300",
          btn: "bg-rose-500 hover:bg-rose-600"
      }
  };
  const currentTheme = themes[theme];
  const isLightMode = theme === 'warm';

  if (!marketData) return <div className="p-8 text-center text-slate-400">載入戰情數據中...</div>;

  return (
    <div className="grid lg:grid-cols-12 gap-6 mb-8 animate-fade-in">
      
      {/* 左側：市場儀表板 */}
      <div className="lg:col-span-7 space-y-4">
         <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Activity className="text-red-500"/> 今日財經戰情
            </h2>
            <span className="text-sm text-slate-500 font-mono">{new Date().toLocaleDateString()}</span>
         </div>

         {/* 三大指數卡片 */}
         <div className="grid grid-cols-3 gap-3">
            {[marketData.taiex, marketData.usdtwd, marketData.us10y].map((item: any, idx: number) => (
                <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center">
                    <span className="text-xs text-slate-500 font-bold mb-1">{item.name}</span>
                    <span className={`text-xl font-black font-mono ${item.isUp ? 'text-red-500' : 'text-green-500'}`}>
                        {item.value}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.isUp ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {item.isUp ? '▲' : '▼'} {Math.abs(item.change)}
                    </span>
                </div>
            ))}
         </div>

         {/* 恐慌貪婪指數 */}
         <div className="bg-slate-800 text-white p-5 rounded-2xl flex items-center justify-between relative overflow-hidden">
             <div className="relative z-10">
                 <div className="text-xs text-slate-400 font-bold mb-1">Fear & Greed Index</div>
                 <div className="text-3xl font-black">{marketData.fearGreed.score} <span className="text-base font-normal opacity-80">/ 100</span></div>
                 <div className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${marketData.fearGreed.score > 75 ? 'bg-red-500' : marketData.fearGreed.score > 25 ? 'bg-yellow-500 text-slate-900' : 'bg-green-500'}`}>
                     市場情緒：{marketData.fearGreed.status}
                 </div>
             </div>
             <div className="absolute right-0 top-0 p-4 opacity-10">
                 <Globe size={100} />
             </div>
         </div>

         {/* 每日金句 */}
         <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 relative group cursor-pointer" onClick={handleCopyText}>
             <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Copy size={16} className="text-indigo-400"/>
             </div>
             <h4 className="text-xs font-bold text-indigo-400 mb-2 uppercase">Daily Insight</h4>
             <p className="text-indigo-900 font-medium leading-relaxed">
                 "{quote}"
             </p>
         </div>
      </div>

      {/* 右側：社群限動產生器 */}
      <div className="lg:col-span-5 flex flex-col">
         <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Camera className="text-blue-500"/> 限動產生器
            </h2>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                {(['blue', 'gold', 'warm'] as const).map(t => (
                    <button 
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`w-6 h-6 rounded-md ${t === 'blue' ? 'bg-blue-900' : t === 'gold' ? 'bg-amber-900' : 'bg-orange-200'} ${theme === t ? 'ring-2 ring-offset-1 ring-slate-400' : ''}`}
                    />
                ))}
            </div>
         </div>

         {/* 預覽區域 */}
         <div className="relative group flex-1">
             <div 
               ref={storyRef}
               className={`aspect-[9/16] w-full rounded-2xl shadow-xl overflow-hidden relative flex flex-col p-6 ${currentTheme.bg} ${isLightMode ? 'text-slate-800' : 'text-white'}`}
             >
                 {/* 裝飾背景 */}
                 <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                     <TrendingUp size={200} />
                 </div>

                 {/* Header */}
                 <div className="relative z-10 flex justify-between items-start mb-8">
                     <div>
                         <div className={`text-xs font-bold tracking-widest uppercase mb-1 ${currentTheme.accent}`}>Daily Market</div>
                         <div className="text-2xl font-black tracking-tight">{new Date().toLocaleDateString()}</div>
                         <div className={`text-sm opacity-70`}>{['週日','週一','週二','週三','週四','週五','週六'][new Date().getDay()]}</div>
                     </div>
                     <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center font-bold text-lg">
                         {userName.charAt(0)}
                     </div>
                 </div>

                 {/* Market Stats */}
                 <div className="relative z-10 space-y-4 mb-8">
                     <div className={`p-3 rounded-xl border ${currentTheme.border} bg-white/5 backdrop-blur-sm flex justify-between items-center`}>
                         <div className="flex items-center gap-2">
                             <div className={`p-1.5 rounded bg-red-500/20 text-red-300`}><TrendingUp size={16}/></div>
                             <span className="font-bold text-sm">加權指數</span>
                         </div>
                         <div className="text-right">
                             <div className="font-mono font-bold text-lg">{marketData.taiex.value}</div>
                             <div className={`text-xs ${marketData.taiex.isUp ? 'text-red-400' : 'text-green-400'}`}>
                                 {marketData.taiex.isUp ? '+' : ''}{marketData.taiex.change}
                             </div>
                         </div>
                     </div>

                     <div className={`p-3 rounded-xl border ${currentTheme.border} bg-white/5 backdrop-blur-sm flex justify-between items-center`}>
                         <div className="flex items-center gap-2">
                             <div className={`p-1.5 rounded bg-green-500/20 text-green-300`}><DollarSign size={16}/></div>
                             <span className="font-bold text-sm">美元/台幣</span>
                         </div>
                         <div className="text-right">
                             <div className="font-mono font-bold text-lg">{marketData.usdtwd.value}</div>
                             <div className="text-xs opacity-60">強勢美元</div>
                         </div>
                     </div>
                 </div>

                 {/* Quote */}
                 <div className="relative z-10 flex-1 flex items-center">
                     <div>
                        <div className={`w-8 h-1 mb-4 ${isLightMode ? 'bg-rose-500' : 'bg-white/30'}`}></div>
                        <p className={`text-lg font-medium leading-relaxed ${isLightMode ? 'text-slate-700' : 'text-white/90'}`}>
                            {quote}
                        </p>
                     </div>
                 </div>

                 {/* Footer (Personalization) */}
                 <div className="relative z-10 pt-6 border-t border-white/10 mt-auto">
                     <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-full ${isLightMode ? 'bg-rose-100 text-rose-600' : 'bg-white/10 text-white'}`}>
                             <User size={16}/>
                         </div>
                         <div>
                             <div className="text-[10px] opacity-60 uppercase tracking-wider">Your Financial Partner</div>
                             <div className="font-bold text-sm">{userName}</div>
                         </div>
                     </div>
                 </div>
             </div>

             {/* 操作按鈕 */}
             <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-all rounded-2xl backdrop-blur-[2px]">
                 <div className="flex gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                     <button 
                        onClick={handleCopyText}
                        className="bg-white text-slate-800 px-4 py-2 rounded-full font-bold shadow-lg hover:bg-slate-50 flex items-center gap-2"
                     >
                        <Copy size={16}/> 複製文案
                     </button>
                     <button 
                        onClick={handleDownloadImage}
                        disabled={isGenerating}
                        className={`${currentTheme.btn} text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2`}
                     >
                        {isGenerating ? <RefreshCw size={16} className="animate-spin"/> : <Download size={16}/>}
                        下載圖片
                     </button>
                 </div>
             </div>
         </div>
      </div>

    </div>
  );
};