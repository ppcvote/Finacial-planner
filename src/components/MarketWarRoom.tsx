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
  User,
  Edit3,     
  Check,
  X,
  Share2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { updateProfile } from 'firebase/auth'; 
import { doc, getDoc, setDoc } from 'firebase/firestore'; 
import { auth, db } from '../firebase'; 
import QuickCalculator from './QuickCalculator';

// --- 模擬市場數據 ---
const MOCK_MARKET_DATA = {
  taiex: { name: '加權指數', base: 22800, volatility: 150, isUp: true },
  usdtwd: { name: '美元/台幣', base: 32.45, volatility: 0.1, isUp: false },
  us10y: { name: '美債10年', base: 4.25, volatility: 0.05, isUp: true },
  fearGreed: { score: 65, status: '貪婪' } 
};

const DAILY_QUOTES = [
  "通膨時代，現金為亡。今日的修正，是為了明日的創高。",
  "投資不是比誰跑得快，是比誰氣長。",
  "別人恐慌時貪婪，最好的買點永遠在「不敢買」的時候。",
  "你不理財，財不理你。種一棵樹最好的時間是十年前，其次是現在。",
  "風險來自於你不知道自己在做什麼，專業讓風險可控。"
];

// --- 極簡文字頭像元件 ---
const TextAvatar = ({ name, size = "md", className = "" }: { name: string, size?: "sm"|"md"|"lg"|"xl", className?: string }) => {
    const firstChar = name ? name.charAt(0) : "專";
    const sizeClasses = {
        sm: "w-8 h-8 text-xs",
        md: "w-12 h-12 text-lg",
        lg: "w-16 h-16 text-2xl",
        xl: "w-20 h-20 text-3xl"
    };

    return (
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold shadow-inner border-2 border-white/20 ${className}`}>
            {firstChar}
        </div>
    );
};

interface MarketWarRoomProps {
  userName?: string; 
}

const MarketWarRoom: React.FC<MarketWarRoomProps> = ({ userName = "菁英顧問" }) => {
  const [marketData, setMarketData] = useState<any>(null);
  const [quote, setQuote] = useState("");
  const [theme, setTheme] = useState<'blue' | 'gold' | 'warm'>('blue'); 
  const [isGenerating, setIsGenerating] = useState(false);
  
  // --- 用戶資料狀態 ---
  const [displayName, setDisplayName] = useState(userName);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempName, setTempName] = useState("");

  const storyRef = useRef<HTMLDivElement>(null);

  // 初始化
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

    if (auth.currentUser) {
        setDisplayName(auth.currentUser.displayName || userName);
        const fetchData = async () => {
            try {
                const docRef = doc(db, 'users', auth.currentUser!.uid, 'system', 'dashboard');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.displayName) setDisplayName(data.displayName);
                }
            } catch (e) {
                console.error("Error fetching dashboard data", e);
            }
        };
        fetchData();
    }
  }, [userName]);

  const handleUpdateProfile = async () => {
      if (!auth.currentUser) return;
      try {
          await updateProfile(auth.currentUser, { displayName: tempName });
          await setDoc(doc(db, 'users', auth.currentUser.uid, 'system', 'dashboard'), {
              displayName: tempName
          }, { merge: true });

          setDisplayName(tempName);
          setIsEditingProfile(false);
      } catch (error) {
          alert("更新失敗，請稍後再試。");
      }
  };

  const openProfileEditor = () => {
      setTempName(displayName || "");
      setIsEditingProfile(true);
  };

  const handleDownloadImage = async () => {
    if (!storyRef.current) return;
    setIsGenerating(true);
    try {
        const canvas = await html2canvas(storyRef.current, { 
            scale: 2, 
            useCORS: true, 
            backgroundColor: null 
        });

        canvas.toBlob(async (blob) => {
            if (!blob) {
                alert("圖片生成失敗");
                setIsGenerating(false);
                return;
            }

            const file = new File([blob], `Market_Story_${new Date().toISOString().split('T')[0]}.png`, { type: 'image/png' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: '今日財經戰情',
                        text: '分享自 Ultra Advisor'
                    });
                } catch (err) {
                    console.log("分享取消或失敗", err);
                }
            } else {
                const link = document.createElement('a');
                link.download = file.name;
                link.href = URL.createObjectURL(blob);
                link.click();
                URL.revokeObjectURL(link.href);
            }
            setIsGenerating(false);
        }, 'image/png');

    } catch (err) {
        console.error(err);
        alert("圖片生成失敗");
        setIsGenerating(false);
    }
  };

  const handleCopyText = () => {
    if (!marketData) return;
    const text = `📅 ${new Date().toLocaleDateString()} 市場快訊\n\n📊 加權指數：${marketData.taiex.value} (${marketData.taiex.isUp ? '▲' : '▼'} ${Math.abs(Number(marketData.taiex.change))})\n💵 美元匯率：${marketData.usdtwd.value}\n🔥 市場情緒：${marketData.fearGreed.status} (${marketData.fearGreed.score})\n\n💡 顧問觀點：\n${quote}\n\n#財經 #投資 #理財規劃`;
    navigator.clipboard.writeText(text);
    alert("文案已複製！");
  };

  const themes = {
      blue: { bg: "bg-gradient-to-br from-slate-800 to-blue-900", accent: "text-blue-400", border: "border-blue-500/30", btn: "bg-blue-600 hover:bg-blue-700" },
      gold: { bg: "bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900", accent: "text-amber-400", border: "border-amber-500/30", btn: "bg-amber-600 hover:bg-amber-700" },
      warm: { bg: "bg-gradient-to-br from-orange-100 to-rose-100", text: "text-slate-800", accent: "text-rose-600", border: "border-rose-300", btn: "bg-rose-500 hover:bg-rose-600" }
  };
  const currentTheme = themes[theme];
  const isLightMode = theme === 'warm';

  if (!marketData) return <div className="p-8 text-center text-slate-400">載入戰情數據中...</div>;

  return (
    <div className="grid lg:grid-cols-12 gap-6 mb-8 animate-fade-in relative">
      
      {/* --- 個人資料編輯 Modal (僅名字) --- */}
      {isEditingProfile && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm rounded-2xl h-full">
              <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl m-4 animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-slate-800">修改顯示名稱</h3>
                      <button onClick={() => setIsEditingProfile(false)}><X size={24} className="text-slate-400"/></button>
                  </div>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-slate-600 mb-1">您的名字 / 職稱</label>
                          <input 
                             type="text" 
                             value={tempName}
                             onChange={(e) => setTempName(e.target.value)}
                             className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                             placeholder="例如：陳經理"
                             autoFocus
                          />
                      </div>
                      <button 
                        onClick={handleUpdateProfile}
                        className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                          <Check size={18}/> 儲存變更
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* 左側：市場儀表板 + 閃算機 */}
      <div className="lg:col-span-7 flex flex-col gap-4">
         {/* 頂部 Header */}
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <button onClick={openProfileEditor} className="relative group">
                    <TextAvatar name={displayName} size="md" className="border-2 border-white shadow-sm"/>
                    <div className="absolute bottom-0 right-0 bg-slate-800 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit3 size={10} />
                    </div>
                </button>
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-black text-slate-800">早安，{displayName}</h2>
                        <button onClick={openProfileEditor} className="text-slate-300 hover:text-blue-600 transition-colors">
                            <Edit3 size={14}/>
                        </button>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">{new Date().toLocaleDateString()}</span>
                </div>
            </div>
            
            <div className="flex gap-2">
                <div className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold flex items-center gap-1">
                    <Activity size={14}/> {marketData.taiex.value}
                </div>
            </div>
         </div>

         {/* 三大指數 */}
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

         {/* [新增] 業務閃算機 (從獨立檔案引入) */}
         <div className="flex-1 min-h-[250px]">
             <QuickCalculator />
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
                 {/* 裝飾 */}
                 <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><TrendingUp size={200} /></div>

                 {/* Header */}
                 <div className="relative z-10 flex justify-between items-start mb-8">
                     <div>
                         <div className={`text-xs font-bold tracking-widest uppercase mb-1 ${currentTheme.accent}`}>Daily Market</div>
                         <div className="text-2xl font-black tracking-tight">{new Date().toLocaleDateString()}</div>
                         <div className={`text-sm opacity-70`}>{['週日','週一','週二','週三','週四','週五','週六'][new Date().getDay()]}</div>
                     </div>
                     {/* 改為文字頭像 */}
                     <TextAvatar name={displayName} size="md" className="border-2 border-white/20 shadow-lg"/>
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

                 {/* Footer */}
                 <div className="relative z-10 pt-6 border-t border-white/10 mt-auto">
                     <div className="flex items-center gap-3">
                         <TextAvatar name={displayName} size="sm" className={isLightMode ? 'bg-rose-100 text-rose-600 border-rose-300' : 'bg-white/10 border-white/30'}/>
                         <div>
                             <div className="text-[10px] opacity-60 uppercase tracking-wider">Your Financial Partner</div>
                             <div className="font-bold text-sm">{displayName}</div>
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
                        {isGenerating ? <RefreshCw size={16} className="animate-spin"/> : navigator.canShare ? <Share2 size={16}/> : <Download size={16}/>}
                        {navigator.canShare ? "分享" : "下載"}
                     </button>
                 </div>
             </div>
         </div>
      </div>

    </div>
  );
};

export default MarketWarRoom;