// src/components/MarketWarRoom.tsx

import React, { useState, useRef } from 'react';
import { Download, Share2, Activity, Edit2, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import QuickCalculator from './QuickCalculator';

const getDailyQuote = () => {
  const quotes = [
    { text: "複利是世界第八大奇蹟，威力比原子彈還大。", author: "Albert Einstein" },
    { text: "別人恐懼時我貪婪，別人貪婪時我恐懼。", author: "Warren Buffett" },
    { text: "風險來自於你不知道自己在做什麼。", author: "Warren Buffett" },
    { text: "不要為錢工作，要讓錢為你工作。", author: "Robert Kiyosaki" },
    { text: "長期而言，股票市場是稱重機；短期而言，它是投票機。", author: "Benjamin Graham" },
    { text: "投資最重要的三個字：保本、保本、保本。", author: "Warren Buffett" },
    { text: "價格是你付出的，價值是你得到的。", author: "Warren Buffett" },
    { text: "不要把雞蛋放在同一個籃子裡。", author: "James Tobin" },
    { text: "只有退潮時，你才知道誰在裸泳。", author: "Warren Buffett" },
    { text: "最偉大的投資，就是投資你自己。", author: "Unknown" },
    { text: "時間是投資最好的朋友。", author: "John Bogle" }
  ];
  const dayIndex = (new Date().getDate() - 1) % quotes.length;
  return quotes[dayIndex];
};

const MarketWarRoom = ({ user, userName }: { user: any; userName?: any }) => {
  const storyRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const dailyQuote = getDailyQuote();

  const [advisorName, setAdvisorName] = useState(user?.displayName || userName || '專業財務顧問');
  const [isEditingName, setIsEditingName] = useState(false);

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
        <div className="flex justify-between items-end mb-2 border-b border-gray-800 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Activity className="text-amber-400" />
              Advisor Brand Room
            </h2>
            <p className="text-gray-400 text-sm mt-1">經營個人品牌，從每日的專業洞察開始</p>
          </div>
        </div>

        <div className="mt-4 bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    每日限動產生器 2.0
                    <span className="text-xs bg-amber-900/50 text-amber-400 px-2 py-0.5 rounded border border-amber-900">Black Gold Edition</span>
                  </h3>
                </div>

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

                <button onClick={handleDownloadStory} className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-amber-900/20">
                    {isGenerating ? '生成中...' : <><Download size={16} /> 下載圖卡</>}
                </button>
            </div>

            {/* The Canvas Area */}
            <div className="relative w-full max-w-[340px] mx-auto aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border border-gray-800 bg-black">
                <div ref={storyRef} className="w-full h-full relative flex flex-col bg-black text-white">
                    
                    {/* Background Layer */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-yellow-950 z-0"></div>
                    
                    {/* [階段 1] LOGO 浮水印 - 置中且淡化 */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none z-0">
                        <img 
                          src="/logo.png" 
                          alt="Watermark" 
                          className="w-[70%] h-auto grayscale brightness-200" 
                          onError={(e) => e.currentTarget.style.display = 'none'} 
                        />
                    </div>

                    {/* Abstract Shapes */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                    
                    <div className="relative z-10 flex flex-col h-full p-6 justify-between">
                        {/* Top: Empty (Logo 已移至背景) */}
                        <div className="h-10"></div>

                        {/* Middle: Content */}
                        <div className="flex flex-col gap-6 flex-1 justify-center">
                            <div className="relative">
                                <span className="absolute -top-8 -left-2 text-6xl text-amber-500/10 font-serif">"</span>
                                <p className="text-xl font-light leading-relaxed text-center text-gray-100 font-serif italic relative z-10 px-2 line-clamp-8">
                                    {dailyQuote.text}
                                </p>
                                <p className="text-right text-[10px] text-amber-500/60 mt-6 font-bold uppercase tracking-widest border-t border-white/10 pt-4">
                                    — {dailyQuote.author}
                                </p>
                            </div>
                        </div>

                        {/* Bottom: Advisor Brand */}
                        <div className="pb-4 pt-4 flex-shrink-0">
                            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-2xl">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
                                    {advisorName.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-base font-bold text-white truncate">{advisorName}</p>
                                    <p className="text-xs text-amber-400/70 truncate tracking-tight">為您量身打造的財富計畫</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Glass Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none"></div>
                </div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-4">預覽模式：點擊下載按鈕生成高清圖卡</p>
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