import React, { useState, useEffect, useRef } from 'react';
import { Download, Share2, Activity, Edit2, Check, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
// 引入 Firebase 功能
import { getFunctions, httpsCallable } from 'firebase/functions';
import QuickCalculator from './QuickCalculator';

const MarketWarRoom = ({ user, userName }: { user: any; userName?: any }) => {
  const storyRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(true); // AI 載入狀態
  
  // 設定初始狀態
  const [dailyQuote, setDailyQuote] = useState({ 
    text: "正在透過 Gemini AI 產生今日財富洞察...", 
    author: "Ultra Advisor AI" 
  });

  const [advisorName, setAdvisorName] = useState(user?.displayName || userName || '專業財務顧問');
  const [isEditingName, setIsEditingName] = useState(false);

  // --- [核心修改] 呼叫雲端 AI 函式 ---
  useEffect(() => {
    const fetchAIInsight = async () => {
      setIsLoadingAI(true);
      try {
        const functions = getFunctions();
        // 呼叫您剛剛部署的 v2 函式
        const getInsight = httpsCallable(functions, 'getDailyInsight');
        const result = await getInsight();
        
        if (result.data) {
          setDailyQuote(result.data as any);
        }
      } catch (error) {
        console.error("AI 獲取失敗:", error);
        // 失敗時的備案
        setDailyQuote({ 
          text: "複利是世界第八大奇蹟，知之者賺，不知者賠。", 
          author: "Albert Einstein" 
        });
      } finally {
        setIsLoadingAI(false);
      }
    };

    fetchAIInsight();
  }, []);

  // 下載邏輯保持不變...
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
      link.download = `Ultra_Story_${new Date().toISOString().slice(0,10)}.png`;
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
              Advisor Brand Room
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {isLoadingAI ? "AI 正在思考中..." : "AI 每日洞察已就緒"}
            </p>
          </div>
        </div>

        {/* 限動產生器卡片 */}
        <div className="mt-4 bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
            {/* 控制區 */}
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
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-amber-900/20 disabled:opacity-50"
                >
                    {isGenerating ? <Loader2 className="animate-spin" size={16}/> : <Download size={16} />} 
                    {isGenerating ? "生成中..." : "下載 AI 洞察圖卡"}
                </button>
            </div>

            {/* 圖卡畫布 */}
            <div className="relative w-full max-w-[340px] mx-auto aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border border-gray-800 bg-black">
                <div ref={storyRef} className="w-full h-full relative flex flex-col bg-black text-white">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-yellow-950 z-0"></div>
                    
                    {/* LOGO 浮水印 */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none z-0">
                        <img src="/logo.png" alt="Watermark" className="w-[70%] h-auto grayscale brightness-200" />
                    </div>

                    <div className="relative z-10 flex flex-col h-full p-6 justify-between">
                        <div className="h-10"></div>

                        {/* AI 內容區 */}
                        <div className="flex flex-col gap-6 flex-1 justify-center">
                            <div className="relative">
                                <span className="absolute -top-10 -left-2 text-7xl text-amber-500/10 font-serif">"</span>
                                {isLoadingAI ? (
                                  <div className="flex flex-col items-center gap-4 py-10">
                                    <Loader2 className="animate-spin text-amber-500/50" size={40} />
                                    <p className="text-slate-500 text-xs tracking-widest uppercase">Consulting Gemini AI...</p>
                                  </div>
                                ) : (
                                  <>
                                    <p className="text-xl font-light leading-relaxed text-center text-gray-100 font-serif italic relative z-10 px-2 animate-fade-in">
                                        {dailyQuote.text}
                                    </p>
                                    <p className="text-right text-[10px] text-amber-500/60 mt-8 font-bold uppercase tracking-widest border-t border-white/10 pt-4">
                                        — {dailyQuote.author}
                                    </p>
                                  </>
                                )}
                            </div>
                        </div>

                        {/* 顧問品牌 */}
                        <div className="pb-4 pt-4 flex-shrink-0">
                            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-2xl">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
                                    {advisorName.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-base font-bold text-white truncate">{advisorName}</p>
                                    <p className="text-xs text-amber-400/70 truncate tracking-tight uppercase font-medium">Wealth Strategy Insight</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none"></div>
                </div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-4">AI 內容由 Google Gemini 1.5 提供，每日更新</p>
        </div>
      </div>

      <div className="md:w-96 w-full flex-shrink-0">
         <div className="sticky top-8 h-[calc(100vh-4rem)]">
            <QuickCalculator />
         </div>
      </div>
    </div>
  );
};

export default MarketWarRoom;