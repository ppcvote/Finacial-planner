import React, { useState, useEffect, useRef } from 'react';
import { Download, Activity, Edit2, Loader2, RefreshCw } from 'lucide-react';
import html2canvas from 'html2canvas';

const MarketWarRoom = ({ user, userName }: { user: any; userName?: any }) => {
  const storyRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(true);
  const [dailyData, setDailyData] = useState<any>(null);
  const [advisorName, setAdvisorName] = useState(user?.displayName || userName || '專業財務顧問');

  const fetchAIInsight = async (force = false) => {
    setIsLoadingAI(true);
    if (force) setDailyData(null);

    const BASE_URL = "https://us-central1-grbt-f87fa.cloudfunctions.net/getDailyInsight";
    const API_URL = `${BASE_URL}?t=${new Date().getTime()}`;
    
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("API 請求失敗");
      const data = await response.json();
      const finalData = Array.isArray(data) ? data[0] : data;
      setDailyData(finalData);
    } catch (error) {
      console.error("AI Fetch Error", error);
      setDailyData({
        title: "複利不是奇蹟，是數學",
        subtitle: "看懂的人在賺錢，看不懂的人在打工",
        concepts: [
          { tag: "1", content: "薪資永遠追不上通膨與房價" },
          { tag: "2", content: "負債是窮人的枷鎖，槓桿是富人的階梯" },
          { tag: "3", content: "時間是投資中最貴的成本" }
        ],
        conclusion: "現在就開始規劃，不要讓未來的你後悔。",
        author: "Ultra Advisor 系統保底"
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
        backgroundColor: "#080808" 
      });
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0,10);
      link.download = `Ultra_Insight_${dateStr}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally { setIsGenerating(false); }
  };

  return (
    <div className="flex flex-col items-center gap-8 p-8 bg-black min-h-screen text-white font-sans">
      {/* 頂部控制面板 */}
      <div className="flex gap-4 items-center bg-gray-900/50 p-4 rounded-2xl border border-gray-800 backdrop-blur-md">
        <button 
          onClick={() => fetchAIInsight(true)} 
          disabled={isLoadingAI}
          className="flex items-center gap-2 px-5 py-2.5 hover:bg-gray-800 rounded-xl transition-all active:scale-95 disabled:opacity-30"
        >
          <RefreshCw size={18} className={isLoadingAI ? "animate-spin" : ""} /> 
          <span className="font-bold text-sm tracking-widest">換個主題</span>
        </button>
        <button 
          onClick={handleDownloadStory} 
          disabled={isLoadingAI || isGenerating} 
          className="bg-amber-600 px-8 py-2.5 rounded-xl font-bold hover:bg-amber-500 shadow-lg shadow-amber-900/20 transition-all active:scale-95 disabled:opacity-30"
        >
          {isGenerating ? "生成中..." : "儲存高清圖卡"}
        </button>
      </div>

      {/* 圖卡本體 (9:16) */}
      <div 
        ref={storyRef}
        className="relative w-[360px] aspect-[9/16] bg-[#080808] overflow-hidden flex flex-col p-8 shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5"
        style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #151515 0%, #080808 100%)' }}
      >
        {/* 局部 Loader */}
        {isLoadingAI && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center">
            <div className="relative mb-4">
              <Loader2 className="animate-spin text-amber-500" size={40} />
              <div className="absolute inset-0 blur-xl bg-amber-500/30 animate-pulse"></div>
            </div>
            <p className="text-amber-500 font-bold tracking-[0.4em] text-[10px] uppercase">Consulting AI...</p>
          </div>
        )}

        {/* 背景浮水印 (維持現狀) */}
        <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center pointer-events-none">
          <img src="/logo.png" className="w-[80%]" alt="watermark" />
        </div>

        {/* ⭐ 右上角縮小版品牌標誌 */}
        <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
          <span className="text-white/40 font-black tracking-[0.2em] text-[8px] uppercase">Ultra Advisor</span>
          <div className="w-7 h-7 bg-gradient-to-b from-amber-400 to-amber-700 rounded-full p-[1px] shadow-lg">
            <div className="w-full h-full bg-[#080808] rounded-full flex items-center justify-center">
              <img src="/logo.png" className="w-4 h-4" alt="UA Logo" />
            </div>
          </div>
        </div>

        {/* 1. 標題區域 (向上靠齊) */}
        <div className="relative z-10 px-2 mt-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-[1px] w-6 bg-amber-500"></div>
            <span className="text-amber-500 text-[8px] tracking-[0.3em] font-black uppercase">Ultra Insight</span>
          </div>
          <h1 className="text-2xl font-black text-white leading-tight mb-2 drop-shadow-lg">
            {dailyData?.title || " "}
          </h1>
          <p className="text-amber-200/40 text-[10px] font-bold tracking-wider leading-relaxed">
            {dailyData?.subtitle || " "}
          </p>
        </div>

        {/* 圖表區域 (縮小垂直間距) */}
        {dailyData?.visualChart && (
          <div 
            className="relative z-10 my-4 flex justify-center bg-white/[0.02] p-4 rounded-2xl border border-white/5"
            dangerouslySetInnerHTML={{ __html: dailyData.visualChart }}
          />
        )}

        {/* 觀念清單 */}
        <div className="relative z-10 flex-1 flex flex-col justify-center gap-5 px-2">
          {dailyData?.concepts?.map((item: any, idx: number) => (
            <div key={idx} className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-6 h-6 rounded-full border border-amber-500/40 flex items-center justify-center text-amber-500 text-[10px] font-black bg-amber-500/5 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                {item.tag || (idx + 1)}
              </div>
              <div className="flex-1 border-b border-white/5 pb-2">
                <p className="text-[13px] text-gray-200 font-medium leading-relaxed">
                  {item.content || "正在生成觀念內容..."}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 結語 */}
        <div className="relative z-10 mb-6 border-l-2 border-amber-600/60 pl-4 py-1 mx-2">
          <p className="text-[12px] text-gray-400 leading-relaxed italic">
            "{dailyData?.conclusion}"
          </p>
        </div>

        {/* 底部品牌資訊 */}
        <div className="relative z-10 mt-auto pt-6 border-t border-white/10 flex justify-between items-end px-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center border border-white/10">
              <img src="/logo.png" className="w-4 h-4 opacity-80" alt="logo" />
            </div>
            <div>
              <p className="text-[12px] font-black text-white tracking-tight mb-0.5">{advisorName}</p>
              <p className="text-[6px] text-gray-500 tracking-[0.2em] uppercase font-bold">Wealth Strategy Elite</p>
            </div>
          </div>
          <div className="text-right pb-1">
            <p className="text-[8px] text-amber-600/80 font-black tracking-widest uppercase">Insight System</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketWarRoom;