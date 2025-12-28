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
  Megaphone, // 佈告欄圖示
  Edit3,     // 編輯圖示
  Check,
  X,
  Save
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { updateProfile } from 'firebase/auth'; 
import { doc, getDoc, setDoc } from 'firebase/firestore'; 
import { auth, db } from '../firebase'; 

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

// --- 內建 12 款商務風格頭像庫 (DiceBear API) ---
const PRESET_AVATARS = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&clothing=blazerAndShirt&eyes=happy",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&clothing=blazerAndShirt&eyes=happy",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Christian&clothing=blazerAndShirt",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Sorelle&clothing=blazerAndShirt",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Emery&clothing=blazerAndShirt&eyebrows=default",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Jocelyn&clothing=collarAndSweater",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Brian&clothing=shirt",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Destiny&clothing=shirt",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Joshua&clothing=blazerAndSweater",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia&clothing=blazerAndSweater",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Tyler&clothing=graphicShirt",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria&clothing=graphicShirt"
];

interface MarketWarRoomProps {
  userName?: string; 
}

export const MarketWarRoom: React.FC<MarketWarRoomProps> = ({ userName = "菁英顧問" }) => {
  const [marketData, setMarketData] = useState<any>(null);
  const [quote, setQuote] = useState("");
  const [theme, setTheme] = useState<'blue' | 'gold' | 'warm'>('blue'); 
  const [isGenerating, setIsGenerating] = useState(false);
  
  // --- 用戶資料狀態 ---
  const [displayName, setDisplayName] = useState(userName);
  const [avatarUrl, setAvatarUrl] = useState(PRESET_AVATARS[0]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // 編輯暫存
  const [tempName, setTempName] = useState("");
  const [tempAvatar, setTempAvatar] = useState("");

  // --- 戰略佈告欄狀態 ---
  const [announcement, setAnnouncement] = useState("本週戰略重點：\n1. 鎖定高資產客戶，檢視退休缺口。\n2. 美元匯率波動，適合切入分期繳保單。");
  const [isEditingBoard, setIsEditingBoard] = useState(false);
  const [tempAnnouncement, setTempAnnouncement] = useState("");

  const storyRef = useRef<HTMLDivElement>(null);

  // 初始化：載入市場數據、個人資料、佈告欄
  useEffect(() => {
    // 1. 金句與市場數據
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

    // 2. 載入 Firebase 用戶資料 (Auth + Firestore)
    if (auth.currentUser) {
        setDisplayName(auth.currentUser.displayName || userName);
        setAvatarUrl(auth.currentUser.photoURL || PRESET_AVATARS[0]);
        
        // 從 Firestore 讀取佈告欄內容與最新頭像
        const fetchData = async () => {
            try {
                const docRef = doc(db, 'users', auth.currentUser!.uid, 'system', 'dashboard');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.announcement) setAnnouncement(data.announcement);
                    // 如果 Firestore 有存頭像，優先使用 (覆蓋 Auth 的舊資料)
                    if (data.photoURL) setAvatarUrl(data.photoURL);
                    if (data.displayName) setDisplayName(data.displayName);
                }
            } catch (e) {
                console.error("Error fetching dashboard data", e);
            }
        };
        fetchData();
    }
  }, [userName]);

  // --- 功能：更新個人資料 (名稱 + 頭像) ---
  const handleUpdateProfile = async () => {
      if (!auth.currentUser) return;
      try {
          // 1. 更新 Firebase Auth (登入驗證層)
          await updateProfile(auth.currentUser, {
              displayName: tempName,
              photoURL: tempAvatar
          });

          // 2. 更新 Firestore (資料庫層，確保下次讀取無誤)
          await setDoc(doc(db, 'users', auth.currentUser.uid, 'system', 'dashboard'), {
              displayName: tempName,
              photoURL: tempAvatar
          }, { merge: true });

          // 3. 更新本地狀態
          setDisplayName(tempName);
          setAvatarUrl(tempAvatar);
          setIsEditingProfile(false);
          alert("個人資料更新成功！");
      } catch (error) {
          console.error("Update profile failed", error);
          alert("更新失敗，請稍後再試。");
      }
  };

  // --- 功能：儲存佈告欄 ---
  const handleSaveAnnouncement = async () => {
      if (!auth.currentUser) return;
      try {
          await setDoc(doc(db, 'users', auth.currentUser.uid, 'system', 'dashboard'), {
              announcement: tempAnnouncement
          }, { merge: true });
          setAnnouncement(tempAnnouncement);
          setIsEditingBoard(false);
      } catch (error) {
          console.error("Save announcement failed", error);
      }
  };

  const openProfileEditor = () => {
      setTempName(displayName || "");
      setTempAvatar(avatarUrl || PRESET_AVATARS[0]);
      setIsEditingProfile(true);
  };

  const openBoardEditor = () => {
      setTempAnnouncement(announcement);
      setIsEditingBoard(true);
  };

  // 下載圖片
  const handleDownloadImage = async () => {
    if (!storyRef.current) return;
    setIsGenerating(true);
    try {
        const canvas = await html2canvas(storyRef.current, { scale: 2, useCORS: true, backgroundColor: null });
        const link = document.createElement('a');
        link.download = `Market_Story_${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (err) {
        alert("圖片生成失敗");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleCopyText = () => {
    if (!marketData) return;
    const text = `📅 ${new Date().toLocaleDateString()} 市場快訊\n\n📊 加權指數：${marketData.taiex.value} (${marketData.taiex.isUp ? '▲' : '▼'} ${Math.abs(Number(marketData.taiex.change))})\n💵 美元匯率：${marketData.usdtwd.value}\n🔥 市場情緒：${marketData.fearGreed.status} (${marketData.fearGreed.score})\n\n💡 戰略觀點：\n${announcement}\n\n#財經 #投資 #理財規劃`;
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
      
      {/* --- 個人資料編輯 Modal --- */}
      {isEditingProfile && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm rounded-2xl h-full">
              <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl m-4">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-slate-800">編輯個人名片</h3>
                      <button onClick={() => setIsEditingProfile(false)}><X size={24} className="text-slate-400"/></button>
                  </div>
                  
                  <div className="space-y-4">
                      {/* 頭像選擇器 */}
                      <div>
                          <label className="block text-sm font-bold text-slate-600 mb-2">選擇您的形象頭像</label>
                          <div className="grid grid-cols-4 gap-2 h-48 overflow-y-auto p-2 border border-slate-100 rounded-xl">
                              {PRESET_AVATARS.map((url, idx) => (
                                  <button 
                                    key={idx}
                                    onClick={() => setTempAvatar(url)}
                                    className={`p-1 rounded-lg border-2 transition-all ${tempAvatar === url ? 'border-blue-600 bg-blue-50' : 'border-transparent hover:bg-slate-50'}`}
                                  >
                                      <img src={url} alt={`Avatar ${idx}`} className="w-full h-auto rounded-full"/>
                                  </button>
                              ))}
                          </div>
                      </div>

                      {/* 姓名輸入 */}
                      <div>
                          <label className="block text-sm font-bold text-slate-600 mb-1">顯示名稱</label>
                          <input 
                             type="text" 
                             value={tempName}
                             onChange={(e) => setTempName(e.target.value)}
                             className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                             placeholder="輸入您的名字或職稱"
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

      {/* 左側：市場儀表板 + 戰略佈告欄 */}
      <div className="lg:col-span-7 flex flex-col gap-4">
         {/* 頂部 Header & 編輯按鈕 */}
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <button onClick={openProfileEditor} className="relative group">
                    <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden">
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
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

         {/* [新增] 團隊戰略佈告欄 (填補空白區) */}
         <div className="flex-1 flex flex-col">
             <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 flex-1 relative flex flex-col">
                 <div className="flex justify-between items-start mb-2">
                     <h4 className="text-amber-800 font-bold flex items-center gap-2">
                         <Megaphone size={18}/> 團隊戰略佈告欄
                     </h4>
                     {isEditingBoard ? (
                         <div className="flex gap-2">
                             <button onClick={() => setIsEditingBoard(false)} className="p-1 text-slate-400 hover:text-slate-600"><X size={18}/></button>
                             <button onClick={handleSaveAnnouncement} className="p-1 text-blue-600 hover:text-blue-800"><Save size={18}/></button>
                         </div>
                     ) : (
                         <button onClick={openBoardEditor} className="text-amber-800/40 hover:text-amber-800 transition-colors">
                             <Edit3 size={16}/>
                         </button>
                     )}
                 </div>
                 
                 {isEditingBoard ? (
                     <textarea 
                        className="w-full h-full bg-white/50 p-2 rounded-lg border border-amber-200 focus:ring-2 focus:ring-amber-400 focus:outline-none resize-none text-sm text-slate-700 leading-relaxed"
                        value={tempAnnouncement}
                        onChange={(e) => setTempAnnouncement(e.target.value)}
                        placeholder="輸入本週重點..."
                     />
                 ) : (
                     <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                         {announcement}
                     </p>
                 )}
                 <div className="mt-auto pt-2 text-[10px] text-amber-800/40 text-right">
                     Last updated: {new Date().toLocaleDateString()}
                 </div>
             </div>
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
                     <div className="w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden bg-white/10">
                         <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
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

                 {/* 戰略觀點 (替換原本的 Quote，顯示佈告欄內容的前 50 字) */}
                 <div className="relative z-10 flex-1 flex items-center">
                     <div>
                        <div className={`w-8 h-1 mb-4 ${isLightMode ? 'bg-rose-500' : 'bg-white/30'}`}></div>
                        <div className={`text-xs font-bold mb-1 opacity-70 uppercase tracking-wider`}>Strategy Focus</div>
                        <p className={`text-lg font-medium leading-relaxed ${isLightMode ? 'text-slate-700' : 'text-white/90'}`}>
                            {announcement.length > 60 ? announcement.substring(0, 60) + "..." : announcement}
                        </p>
                     </div>
                 </div>

                 {/* Footer */}
                 <div className="relative z-10 pt-6 border-t border-white/10 mt-auto">
                     <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-full ${isLightMode ? 'bg-rose-100 text-rose-600' : 'bg-white/10 text-white'}`}>
                             <User size={16}/>
                         </div>
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