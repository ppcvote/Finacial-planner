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

  // --- [核心修改] 抓取 AI 數據與緩存邏輯 ---
  const fetchAIInsight = async (force = false) => {
    setIsLoadingAI(true);
    const CACHE_KEY = 'ultra_insight_cache';
    const CACHE_TIME_KEY = 'ultra_insight_timestamp';
    const API_URL = "https://us-central1-grbt-f87fa.cloudfunctions.net/getDailyInsight";

    // 檢查是否有 24 小時內的緩存
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
    const isCacheValid = cachedTime && (Date.now() - parseInt(cachedTime) < 24 * 60 * 60 * 1000);

    if (!force && isCacheValid && cachedData) {
      setDailyQuote(JSON.parse(cachedData));
      setIsLoadingAI(false);
      return;
    }

    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      
      setDailyQuote(data);
      // 儲存緩存
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
    } catch (error) {
      setDailyQuote({ text: "複利不是奇蹟，是數學。\n不看邏輯的人，終究在幫看得懂的人打工。", author: "金融智庫" });
    } finally {
      setIsLoadingAI(false);
    }
  };

  useEffect(() => { fetchAIInsight(); }, []);

  const handleDownloadStory = async () => {
    if (!storyRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(storyRef.current, { scale: 3, useCORS: true, backgroundColor: null });
      const link = document.createElement('a');
      link.download = `Insight_${new Date().toISOString().slice(0,10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally { setIsGenerating(false); }
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 p-4 md:p-8 overflow-y-auto bg-gray-950 text-white min-h-screen">
      <div className="flex-1 flex flex-col gap-6 max-w-4xl mx-auto w-full">
        <div className="flex justify-between items-end border-b border-gray-800 pb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2"><Activity className="text-amber-400" />Wealth War Room</h2>
            <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest">Digital Intelligence Terminal</p>
          </div>
          <button onClick={() => fetchAIInsight(true)} disabled={isLoadingAI} className="p-2 hover:text-amber-400 transition-colors">
            <RefreshCw size={20} className={isLoadingAI ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="mt-4 bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
          {/* 控制列 */}
          <div className="flex justify-between items-center mb-6">
            <div className="bg-black/40 px-3 py-1.5 rounded-lg border border-gray-700 flex items-center gap-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-tighter">Advisor:</span>
              <span className="text-sm font-medium text-amber-100">{advisorName}</span>
              <button onClick={() => setIsEditingName(!isEditingName)} className="text-gray-600"><Edit2 size={12}/></button>
            </div>
            <button onClick={handleDownloadStory} disabled={isLoadingAI} className="px-5 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-900/40">
              儲存圖卡
            </button>
          </div>

          {/* 圖卡本體 */}
          <div className="relative w-full max-w-[340px] mx-auto aspect-[9/16] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10">
            <div ref={storyRef} className="w-full h-full relative flex flex-col bg-[#050505]">
              {/* 高級感背景 */}
              <div className="absolute inset-0 bg-gradient-to-b from-amber-950/20 via-black to-black z-0"></div>
              
              {/* 浮水印文字背景 */}
              <div className="absolute inset-0 flex flex-col justify-around py-20 opacity-[0.03] select-none pointer-events-none z-0">
                <div className="text-8xl font-black -rotate-12 tracking-tighter">MARKET</div>
                <div className="text-8xl font-black -rotate-12 tracking-tighter self-end">LOGIC</div>
                <div className="text-8xl font-black -rotate-12 tracking-tighter">WEALTH</div>
              </div>

              <div className="relative z-10 flex flex-col h-full p-10">
                {/* 頂部裝飾 */}
                <div className="flex justify-between items-center opacity-40">
                  <div className="h-[1px] w-8 bg-amber-500"></div>
                  <div className="text-[10px] tracking-[0.4em] font-bold text-amber-500 uppercase">Insight Pro</div>
                  <div className="h-[1px] w-8 bg-amber-500"></div>
                </div>

                {/* 文案區 */}
                <div className="flex-1 flex flex-col justify-center">
                  {isLoadingAI ? (
                    <Loader2 className="animate-spin text-amber-500/20 mx-auto" size={40} />
                  ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                      {/* 重點：white-space: pre-wrap 確保段落顯現 */}
                      <p className="text-[22px] font-medium leading-[1.6] text-gray-100 whitespace-pre-wrap tracking-tight">
                        {dailyQuote.text}
                      </p>
                      <div className="mt-8 flex items-center gap-3">
                        <div className="h-[2px] w-6 bg-amber-500/50"></div>
                        <p className="text-[11px] text-amber-500/80 font-bold uppercase tracking-[0.2em]">
                          {dailyQuote.author}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 個人品牌區 */}
                <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold text-xs shadow-lg">
                      {advisorName.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{advisorName}</p>
                      <p className="text-[9px] text-amber-500/60 uppercase tracking-widest font-semibold">Financial Strategy</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="md:w-96 w-full"><QuickCalculator /></div>
    </div>
  );
};

export default MarketWarRoom;