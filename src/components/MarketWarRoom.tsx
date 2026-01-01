import React, { useState, useEffect, useRef } from 'react';
import { Download, Activity, Edit2, Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
import html2canvas from 'html2canvas';

const MarketWarRoom = ({ user, userName }: { user: any; userName?: any }) => {
  const storyRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(true);
  const [dailyData, setDailyData] = useState<any>(null);
  const [advisorName, setAdvisorName] = useState(user?.displayName || userName || '專業財務顧問');

  const fetchAIInsight = async (force = false) => {
    setIsLoadingAI(true);
    const API_URL = "https://us-central1-grbt-f87fa.cloudfunctions.net/getDailyInsight";
    
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setDailyData(data);
    } catch (error) {
      console.error("AI Fetch Error", error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  useEffect(() => { fetchAIInsight(); }, []);

  const handleDownloadStory = async () => {
    if (!storyRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(storyRef.current, { scale: 3, useCORS: true });
      const link = document.createElement('a');
      link.download = `Ultra_Advisor_Insight.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally { setIsGenerating(false); }
  };

  return (
    <div className="flex flex-col items-center gap-8 p-8 bg-black min-h-screen text-white">
      {/* 控制面板 */}
      <div className="flex gap-4 items-center bg-gray-900 p-4 rounded-2xl border border-gray-800">
        <button onClick={() => fetchAIInsight(true)} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 rounded-lg transition-all">
          <RefreshCw size={18} className={isLoadingAI ? "animate-spin" : ""} /> 換個主題
        </button>
        <button onClick={handleDownloadStory} disabled={isLoadingAI} className="bg-amber-600 px-6 py-2 rounded-lg font-bold hover:bg-amber-500 transition-all">
          儲存高清圖卡
        </button>
      </div>

      {/* 圖卡本體 (9:16 Instagram Story) */}
      <div 
        ref={storyRef}
        className="relative w-[360px] aspect-[9/16] bg-[#080808] overflow-hidden flex flex-col p-10 font-sans"
        style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #1a1a1a 0%, #080808 100%)' }}
      >
        {/* 背景紋理與浮水印 */}
        <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center pointer-events-none">
          <img src="/logo.png" className="w-[80%]" alt="watermark" />
        </div>

        {/* 1. 標題與副標題 */}
        <div className="relative z-10 mt-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-[2px] w-8 bg-amber-500"></div>
            <span className="text-amber-500 text-[10px] tracking-[0.4em] font-black uppercase">Ultra Insight</span>
          </div>
          <h1 className="text-3xl font-black text-white leading-tight mb-2 drop-shadow-lg">
            {dailyData?.title || "載入中..."}
          </h1>
          <p className="text-amber-200/60 text-sm font-medium">
            {dailyData?.subtitle || "智庫正在分析..."}
          </p>
        </div>

        {/* 2. 核心觀念呈現 (圖+文邏輯) */}
        <div className="relative z-10 flex-1 flex flex-col justify-center gap-8 py-10">
          {dailyData?.concepts?.map((item: any, idx: number) => (
            <div key={idx} className="flex gap-5 items-start animate-in fade-in slide-in-from-left duration-700" style={{ delay: `${idx * 200}ms` }}>
              <div className="flex-shrink-0 w-8 h-8 rounded-full border border-amber-500/30 flex items-center justify-center text-amber-500 text-xs font-black bg-amber-500/5">
                {item.tag}
              </div>
              <div className="flex-1 border-b border-white/5 pb-4">
                <p className="text-[16px] text-gray-200 font-medium leading-relaxed">
                  {item.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 3. 短內文 / 結語 */}
        <div className="relative z-10 mb-10 border-l-2 border-amber-600 pl-4 py-1">
          <p className="text-xs text-gray-400 leading-relaxed italic">
            "{dailyData?.conclusion}"
          </p>
        </div>

        {/* 4. 品牌底部 (包含浮水印與品牌標誌) */}
        <div className="relative z-10 mt-auto pt-6 border-t border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center shadow-lg">
              <img src="/logo.png" className="w-6 h-6 invert" alt="logo" />
            </div>
            <div>
              <p className="text-[13px] font-black text-white tracking-tight">{advisorName}</p>
              <p className="text-[8px] text-gray-500 tracking-widest uppercase font-bold">Financial Strategy Elite</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-amber-600 font-black tracking-tighter">#UltraAdvisor</p>
            <p className="text-[7px] text-gray-700 mt-1 uppercase">Proprietary System</p>
          </div>
        </div>
      </div>
      
      {isLoadingAI && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-amber-500" size={48} />
            <p className="text-amber-500 font-bold tracking-widest">AI 正在撰寫菁英財商觀念...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketWarRoom;