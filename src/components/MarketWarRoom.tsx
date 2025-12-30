import React, { useState, useEffect, useRef } from 'react';
import { Download, Activity, Edit2, Check, Loader2, RefreshCw } from 'lucide-react'; // 加入 RefreshCw
import html2canvas from 'html2canvas';
import QuickCalculator from './QuickCalculator';

const MarketWarRoom = ({ user, userName }: { user: any; userName?: any }) => {
  const storyRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(true);
  
  const [dailyQuote, setDailyQuote] = useState({ 
    text: "正在連線智庫...", 
    author: "金融智庫" 
  });

  const [advisorName, setAdvisorName] = useState(user?.displayName || userName || '專業財務顧問');
  const [isEditingName, setIsEditingName] = useState(false);

  // --- [核心修改] 抓取本地端 AI 數據 ---
  const fetchAIInsight = async () => {
    setIsLoadingAI(true);
    // 自動判斷環境：如果在 localhost 就用模擬器網址，否則用雲端網址
const API_URL = window.location.hostname === "localhost" 
  ? "http://127.0.0.1:5001/grbt-f87fa/us-central1/getDailyInsight"
  : "https://us-central1-grbt-f87fa.cloudfunctions.net/getDailyInsight";
    
    try {
      const response = await fetch(LOCAL_API_URL);
      if (!response.ok) throw new Error("API 回報錯誤");
      
      const data = await response.json();
      setDailyQuote({
        text: data.text,
        author: data.author || "金融智庫"
      });
    } catch (error) {
      console.error("AI 獲取失敗:", error);
      setDailyQuote({ 
        text: "市場本質是不確定的，唯有邏輯與紀律是你的盔甲。", 
        author: "金融智庫" 
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  useEffect(() => {
    fetchAIInsight();
  }, []);

  const handleDownloadStory = async () => {
    if (!storyRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(storyRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `Ultra_Insight_${new Date().toISOString().slice(0,10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error("Story gen failed", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 p-4 md:p-8 overflow-y-auto bg-gray-950 text-white min-h-screen">
      <div className="flex-1 flex flex-col gap-6 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex justify-between items-end mb-2 border-b border-gray-800 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Activity className="text-amber-400" />
              Wealth War Room
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {isLoadingAI ? "正在讀取全球金融邏輯..." : "AI 戰情分析已更新"}
            </p>
          </div>
          
          {/* 重新整理按鈕 */}
          <button 
            onClick={fetchAIInsight}
            disabled={isLoadingAI}
            className="p-2 text-gray-400 hover:text-amber-400 transition-colors disabled:opacity-30"
            title="更換文案"
          >
            <RefreshCw size={20} className={isLoadingAI ? "animate-spin" : ""} />
          </button>
        </div>

        {/* 限動產生器卡片 */}
        <div className="mt-4 bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex items-center gap-3 bg-black/40 p-2 rounded-lg border border-gray-700">
                    <div className="text-xs text-gray-400">顯示名稱:</div>
                    {isEditingName ? (
                        <div className="flex items-center gap-2">
                            <input 
                                type="text" 
                                value={advisorName} 
                                onChange={(e) => setAdvisorName(e.target.value)}
                                className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:border-amber-500 outline-none w-32"
                                autoFocus
                            />
                            <button onClick={() => setIsEditingName(false)} className="text-emerald-400 hover:text-emerald-300"><Check size={16} /></button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-amber-100">{advisorName}</span>
                            <button onClick={() => setIsEditingName(true)} className="text-gray-500 hover:text-white transition-colors"><Edit2 size={14} /></button>
                        </div>
                    )}
                </div>

                <button 
                  onClick={handleDownloadStory} 
                  disabled={isLoadingAI || isGenerating}
                  className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-amber-900/40 active:scale-95 disabled:opacity-50"
                >
                    {isGenerating ? <Loader2 className="animate-spin" size={16}/> : <Download size={16} />} 
                    {isGenerating ? "正在渲染圖卡..." : "儲存為限動圖卡"}
                </button>
            </div>

            {/* 圖卡畫布 */}
            <div className="relative w-full max-w-[340px] mx-auto aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border border-gray-800 bg-black">
                <div ref={storyRef} className="w-full h-full relative flex flex-col bg-black text-white">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-yellow-950/40 z-0"></div>
                    
                    {/* LOGO 浮水印 - 建議放你個人的標誌 */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
                        <img src="/logo.png" alt="Watermark" className="w-[80%] h-auto grayscale" />
                    </div>

                    <div className="relative z-10 flex flex-col h-full p-8 justify-between">
                        <div className="text-[10px] tracking-[0.3em] text-amber-500/50 font-bold uppercase">Market Insight</div>

                        {/* AI 內容區 */}
                        <div className="flex flex-col gap-6 flex-1 justify-center">
                            <div className="relative">
                                {isLoadingAI ? (
                                  <div className="flex flex-col items-center gap-4">
                                    <Loader2 className="animate-spin text-amber-500/30" size={32} />
                                    <p className="text-slate-600 text-[10px] tracking-widest uppercase">Fetching Logic...</p>
                                  </div>
                                ) : (
                                  <div className="animate-in fade-in zoom-in duration-500">
                                    <p className="text-2xl font-medium leading-relaxed text-left text-gray-100 relative z-10 px-2">
                                        {dailyQuote.text}
                                    </p>
                                    <div className="w-12 h-1 bg-amber-500/50 mt-8 mb-4"></div>
                                    <p className="text-left text-[12px] text-amber-500/80 font-bold uppercase tracking-[0.2em]">
                                        {dailyQuote.author}
                                    </p>
                                  </div>
                                )}
                            </div>
                        </div>

                        {/* 顧問品牌個人化區塊 */}
                        <div className="pb-4">
                            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl">
                                <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-inner">
                                    {advisorName.slice(0, 1).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-white truncate">{advisorName}</p>
                                    <p className="text-[9px] text-gray-500 truncate tracking-wider uppercase">Independent Advisor</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <p className="text-center text-[10px] text-gray-600 mt-6 tracking-widest uppercase font-medium">Ultra Advisor Digital Lab</p>
        </div>
      </div>

      {/* 右側計算機保持不變 */}
      <div className="md:w-96 w-full flex-shrink-0">
         <div className="sticky top-8 h-[calc(100vh-4rem)]">
            <QuickCalculator />
         </div>
      </div>
    </div>
  );
};

export default MarketWarRoom;