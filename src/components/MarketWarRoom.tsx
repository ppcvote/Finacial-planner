import React, { useState, useEffect, useRef } from 'react';
import { Download, Activity, Edit2, Loader2, RefreshCw } from 'lucide-react';
import html2canvas from 'html2canvas';

const MarketWarRoom = ({ user, userName }: { user: any; userName?: any }) => {
  const storyRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(true);
  const [dailyData, setDailyData] = useState<any>(null);
  const [advisorName, setAdvisorName] = useState(user?.displayName || userName || '專業財務顧問');

  // --- [核心修正] 增加陣列檢查與圖表解析 ---
  const fetchAIInsight = async (force = false) => {
    setIsLoadingAI(true);
    
    if (force) {
      setDailyData(null);
    }

    const BASE_URL = "https://us-central1-grbt-f87fa.cloudfunctions.net/getDailyInsight";
    const API_URL = `${BASE_URL}?t=${new Date().getTime()}`;
    
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("API 請求失敗");
      const data = await response.json();

      // ⭐ 修正點 1：自動檢查回傳是否為陣列，如果是就取第一個物件
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
    <div className="flex flex-col items-center gap-8 p-8 bg-black min-h-screen text-white">
      {/* 控制面板 */}
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
        className="relative w-[360px] aspect-[9/16] bg-[#080808] overflow-hidden flex flex-col p-10 font-sans shadow-[0_0_80px_rgba(0,0,0,0.5)]"
        style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #1a1a1a 0%, #080808 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.02] flex items-center justify-center pointer-events-none">
          <img src="/logo.png" className="w-[85%]" alt="watermark" />
        </div>

        {/* 1. 標題與副標題 */}
        <div className="relative z-10 mt-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-[2px] w-8 bg-amber-500"></div>
            <span className="text-amber-500 text-[10px] tracking-[0.4em] font-black uppercase">Ultra Insight</span>
          </div>
          <h1 className="text-2xl font-black text-white leading-tight mb-2 drop-shadow-2xl">
            {dailyData?.title || "AI 正在思考..."}
          </h1>
          <p className="text-amber-200/50 text-xs font-medium tracking-tight">
            {dailyData?.subtitle || "智庫正在分析市場觀念..."}
          </p>
        </div>

        {/* ⭐ 修正點 2：渲染 AI 產出的 SVG 圖表 */}
        {dailyData?.visualChart && (
          <div 
            className="relative z-10 my-6 flex justify-center bg-white/5 p-4 rounded-xl border border-white/5"
            dangerouslySetInnerHTML={{ __html: dailyData.visualChart }}
          />
        )}

        {/* 2. 核心觀念呈現 */}
        <div className="relative z-10 flex-1 flex flex-col justify-center gap-5 py-4">
          {dailyData?.concepts?.map((item: any, idx: number) => (
            <div key={idx} className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-6 h-6 rounded-full border border-amber-500/30 flex items-center justify-center text-amber-500 text-[10px] font-black bg-amber-500/5">
                {item.tag}
              </div>
              <div className="flex-1 border-b border-white/5 pb-2">
                <p className="text-[13px] text-gray-200 font-medium leading-relaxed">
                  {item.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 3. 結語 */}
        <div className="relative z-10 mb-8 border-l-2 border-amber-600/50 pl-4 py-1">
          <p className="text-[12px] text-gray-400 leading-relaxed italic">
            "{dailyData?.conclusion}"
          </p>
        </div>

        {/* 4. 品牌底部 */}
        <div className="relative z-10 mt-auto pt-6 border-t border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg flex items-center justify-center shadow-lg">
              <img src="/logo.png" className="w-5 h-5 invert" alt="logo" />
            </div>
            <div>
              <p className="text-[12px] font-black text-white tracking-tight leading-none mb-1">{advisorName}</p>
              <p className="text-[7px] text-gray-500 tracking-widest uppercase font-bold">Wealth Strategy Elite</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-amber-600 font-black tracking-tighter italic">#UltraAdvisor</p>
          </div>
        </div>
      </div>
      
      {isLoadingAI && !dailyData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Loader2 className="animate-spin text-amber-500" size={48} />
              <div className="absolute inset-0 blur-xl bg-amber-500/20 animate-pulse"></div>
            </div>
            <p className="text-amber-500 font-bold tracking-[0.3em] text-xs uppercase animate-pulse">Consulting AI Engine...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketWarRoom;