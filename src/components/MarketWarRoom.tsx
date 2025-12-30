import React, { useState, useEffect, useRef } from 'react';
import { Download, Activity, Edit2, Check, Loader2, RefreshCw } from 'lucide-react';
import html2canvas from 'html2canvas';
import QuickCalculator from './QuickCalculator';

const MarketWarRoom = ({ user, userName }: { user: any; userName?: any }) => {
  const storyRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(true);
  
  const [dailyQuote, setDailyQuote] = useState({ text: "", author: "金融智庫" });
  const [advisorName, setAdvisorName] = useState(user?.displayName || userName || '專業財務顧問');
  const [isEditingName, setIsEditingName] = useState(false);

  // --- [核心修改] 抓取 AI 數據與緩存邏輯 (防止 Token 刷爆) ---
  const fetchAIInsight = async (force = false) => {
    setIsLoadingAI(true);
    const CACHE_KEY = 'ultra_insight_cache';
    const CACHE_TIME_KEY = 'ultra_insight_timestamp';
    const API_URL = "https://us-central1-grbt-f87fa.cloudfunctions.net/getDailyInsight";

    // 檢查是否有 24 小時內的緩存
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
    const isCacheValid = cachedTime && (Date.now() - parseInt(cachedTime) < 24 * 60 * 60 * 1000);

    // 如果不是強制更新且緩存有效，就用舊的數據
    if (!force && isCacheValid && cachedData) {
      try {
        setDailyQuote(JSON.parse(cachedData));
        setIsLoadingAI(false);
        return;
      } catch (e) {
        console.error("Cache parse error");
      }
    }

    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      
      setDailyQuote(data);
      // 儲存緩存與時間戳記
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
    } catch (error) {
      setDailyQuote({ 
        text: "複利不是奇蹟，是數學。\n不看邏輯的人，終究在幫看得懂的人打工。", 
        author: "金融智庫" 
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  useEffect(() => { fetchAIInsight(); }, []);

  const handleDownloadStory = async () => {
    if (!storyRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(storyRef.current, { 
        scale: 3, 
        useCORS: true, 
        backgroundColor: null,
        logging: false 
      });
      const link = document.createElement('a');
      link.download = `Ultra_Insight_${new Date().toISOString().slice(0,10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally { setIsGenerating(false); }
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 p-4 md:p-8 overflow-y-auto bg-gray-950 text-white min-h-screen">
      <div className="flex-1 flex flex-col gap-6 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex justify-between items-end border-b border-gray-800 pb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="text-amber-400" />
              Wealth War Room
            </h2>
            <p className="text-gray-500 text-xs mt-1 uppercase tracking-[0.2em]">Digital Intelligence Terminal</p>
          </div>
          <button 
            onClick={() => fetchAIInsight(true)} 
            disabled={isLoadingAI} 
            className="p-2 text-gray-400 hover:text-amber-400 transition-colors disabled:opacity-20"
          >
            <RefreshCw size={20} className={isLoadingAI ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="mt-4 bg-gray-900/50 p-6 rounded-2xl border border-gray-800 shadow-inner">
          {/* 控制列 */}
          <div className="flex justify-between items-center mb-6">
            <div className="bg-black/40 px-3 py-1.5 rounded-lg border border-gray-700 flex items-center gap-2">
              <span className="text-[10px] text-gray-500 uppercase font-bold">Advisor:</span>
              {isEditingName ? (
                <input 
                  value={advisorName} 
                  onChange={(e) => setAdvisorName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  className="bg-transparent border-b border-amber-500 text-sm outline-none w-24 text-amber-100"
                  autoFocus
                />
              ) : (
                <span className="text-sm font-medium text-amber-100">{advisorName}</span>
              )}
              <button onClick={() => setIsEditingName(!isEditingName)} className="text-gray-600 hover:text-white transition-colors">
                <Edit2 size={12}/>
              </button>
            </div>
            <button 
              onClick={handleDownloadStory} 
              disabled={isLoadingAI || isGenerating} 
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-900/40 transition-all active:scale-95"
            >
              {isGenerating ? "正在產圖..." : "儲存圖卡"}
            </button>
          </div>

          {/* 圖卡本體 */}
          <div className="relative w-full max-w-[340px] mx-auto aspect-[9/16] rounded-[2.5rem] overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.8)] border border-white/10 bg-black">
            <div ref={storyRef} className="w-full h-full relative flex flex-col bg-[#050505]">
              {/* 背景高級漸層 */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-950/20 via-black to-black z-0"></div>
              
              {/* UltraAdvisor LOGO 浮水印 (取代文字) */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] select-none pointer-events-none z-0">
                <img 
                  src="/logo.png" 
                  alt="UltraAdvisor Watermark" 
                  className="w-[85%] h-auto grayscale brightness-200" 
                />
              </div>

              <div className="relative z-10 flex flex-col h-full p-10">
                {/* 頂部細節 */}
                <div className="flex justify-between items-center opacity-30">
                  <div className="h-[1px] w-6 bg-amber-500"></div>
                  <div className="text-[9px] tracking-[0.5em] font-black text-amber-500 uppercase">Insight Pro</div>
                  <div className="h-[1px] w-6 bg-amber-500"></div>
                </div>

                {/* 文案展示區 */}
                <div className="flex-1 flex flex-col justify-center">
                  {isLoadingAI ? (
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="animate-spin text-amber-500/20" size={32} />
                      <p className="text-amber-500/20 text-[10px] tracking-widest uppercase">Analyzing Market...</p>
                    </div>
                  ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
                      {/* 重點：white-space: pre-wrap 確保段落與換行顯示 */}
                      <p className="text-[21px] font-medium leading-[1.7] text-gray-100 whitespace-pre-wrap tracking-tight drop-shadow-2xl">
                        {dailyQuote.text}
                      </p>
                      <div className="mt-10 flex items-center gap-4">
                        <div className="h-[2px] w-8 bg-amber-500/60"></div>
                        <p className="text-[12px] text-amber-500/90 font-black uppercase tracking-[0.25em]">
                          {dailyQuote.author}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 底部品牌 Logo 與名稱區 */}
                <div className="bg-white/5 backdrop-blur-2xl p-4 rounded-3xl border border-white/10 shadow-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-black border border-white/10 flex items-center justify-center p-2 shadow-inner overflow-hidden">
                      <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[15px] font-black text-white truncate tracking-tight">{advisorName}</p>
                      <p className="text-[9px] text-amber-500/60 uppercase tracking-widest font-black">Wealth Strategy Insight</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-[10px] text-gray-600 mt-6 tracking-widest uppercase font-bold">Ultra Advisor Intelligence Hub</p>
        </div>
      </div>

      <div className="md:w-96 w-full"><QuickCalculator /></div>
    </div>
  );
};

export default MarketWarRoom;