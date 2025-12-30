// src/components/MarketWarRoom.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Download, Share2, RefreshCw, Activity, Globe, Edit2, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import QuickCalculator from './QuickCalculator';

// ----------------------------------------------------------------------
// 1. 每日金句生成器 (保持不變)
// ----------------------------------------------------------------------
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
    { text: "時間是投資最好的朋友。", author: "John Bogle" },
    { text: "如果你無法控制情緒，你就無法控制金錢。", author: "Warren Buffett" },
    { text: "財富不是擁有很多錢，而是擁有財務自由。", author: "Unknown" },
    { text: "如果你買了不需要的東西，很快你就得賣掉需要的東西。", author: "Warren Buffett" },
    { text: "不要等到要用錢時，才發現自己沒存錢。", author: "Unknown" },
    { text: "投資不是為了致富，而是為了避免貧窮。", author: "Unknown" },
    { text: "股市充滿了知道價格但不知道價值的人。", author: "Philip Fisher" },
    { text: "耐心是投資中最重要的美德。", author: "Charlie Munger" },
    { text: "機會總是留給準備好的人。", author: "Louis Pasteur" },
    { text: "你不理財，財不理你。", author: "Chinese Proverb" },
    { text: "成功的投資需要時間、紀律和耐心。", author: "Unknown" },
    { text: "如果你想知道金錢的價值，試著去借錢看看。", author: "Benjamin Franklin" },
    { text: "今天的節省，是為了明天的自由。", author: "Unknown" },
    { text: "不要讓你的支出超過你的收入。", author: "Unknown" },
    { text: "最好的投資時機是十年前，其次是現在。", author: "Unknown" },
    { text: "複利的關鍵在於時間，而不是報酬率。", author: "Morgan Housel" },
    { text: "金錢是一種可怕的主人，但卻是一種很好的僕人。", author: "P.T. Barnum" },
    { text: "財富流向那些有準備的人。", author: "Unknown" },
    { text: "投資知識是支付最高利息的投資。", author: "Benjamin Franklin" },
    { text: "無論你賺多少錢，如果你花得比賺得多，你依然是窮人。", author: "Unknown" },
    { text: "財務自由的關鍵是創造被動收入。", author: "Unknown" }
  ];
  const dayIndex = (new Date().getDate() - 1) % quotes.length;
  return quotes[dayIndex];
};

// ----------------------------------------------------------------------
// 2. 主組件
// ----------------------------------------------------------------------
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
      alert("圖片生成失敗，請稍後再試");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareStory = async () => {
    if (!storyRef.current || !navigator.share) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(storyRef.current, { scale: 3, useCORS: true });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'story.png', { type: 'image/png' });
        await navigator.share({
          title: '今日品牌觀點',
          text: '來自 Ultra Advisor 的每日洞察',
          files: [file],
        });
      });
    } catch (err) {
      console.error("Share failed", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 p-4 md:p-8 overflow-y-auto bg-gray-950 text-white min-h-screen">
      
      {/* 左側：品牌經營 & 限動預覽 */}
      <div className="flex-1 flex flex-col gap-6 max-w-4xl mx-auto w-full">
        
        {/* Header Section - 已移除 API 狀態顯示 */}
        <div className="flex justify-between items-end mb-2 border-b border-gray-800 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Activity className="text-amber-400" />
              Advisor Brand Room
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              經營個人品牌，從每日的專業洞察開始
            </p>
          </div>
        </div>

        {/* 1. Market Ticker Cards - 根據指令已移除 (原展示 mock 數據處) */}

        {/* 2. Story Generator 2.0 */}
        <div className="mt-4 bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    每日限動產生器 2.0
                    <span className="text-xs bg-amber-900/50 text-amber-400 px-2 py-0.5 rounded border border-amber-900">Black Gold Edition</span>
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">自動生成專業圖卡，強化客戶品牌印象</p>
                </div>

                {/* 暱稱修改 */}
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
                            <button onClick={() => setIsEditingName(false)} className="text-emerald-400 hover:text-emerald-300">
                                <Check size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-amber-100">{advisorName}</span>
                            <button onClick={() => setIsEditingName(true)} className="text-gray-500 hover:text-white transition-colors">
                                <Edit2 size={14} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    <button onClick={handleDownloadStory} className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-amber-900/20">
                        {isGenerating ? '生成中...' : <><Download size={16} /> 下載圖卡</>}
                    </button>
                    <button onClick={handleShareStory} className="md:hidden flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
                        <Share2 size={16} />
                    </button>
                </div>
            </div>

            {/* The Canvas Area */}
            <div className="relative w-full max-w-[340px] mx-auto aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border border-gray-800 group bg-black">
                <div ref={storyRef} className="w-full h-full relative flex flex-col bg-black text-white">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-yellow-950 z-0"></div>
                    
                    {/* Abstract Shapes */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                    
                    <div className="relative z-10 flex flex-col h-full p-6 justify-between">
                        
                        {/* Top: Header (已移至右上角) */}
                        <div className="flex justify-end items-center gap-2 pt-2 text-right">
                             <div>
                                 <h4 className="text-amber-500 text-[10px] font-bold tracking-[0.2em] uppercase leading-none">Ultra</h4>
                                 <h4 className="text-gray-500 text-[8px] font-bold tracking-[0.2em] uppercase leading-none">Advisor</h4>
                             </div>
                             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 p-[1px]">
                                <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                                     <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain" onError={(e) => e.currentTarget.src = 'https://placehold.co/100x100?text=U'} />
                                </div>
                             </div>
                        </div>

                        {/* Middle: Quote Only - 已移除市場 Snapshot 表格 */}
                        <div className="flex flex-col gap-6 flex-1 justify-center">
                            <div className="relative mb-2">
                                <span className="absolute -top-4 -left-2 text-5xl text-amber-500/20 font-serif">"</span>
                                <p className="text-lg font-light leading-relaxed text-center text-gray-200 font-serif italic relative z-10 px-2 line-clamp-6">
                                    {dailyQuote.text}
                                </p>
                                <p className="text-right text-[10px] text-amber-500/80 mt-4 font-bold uppercase tracking-wider">— {dailyQuote.author}</p>
                            </div>
                        </div>

                        {/* Bottom: Advisor Brand */}
                        <div className="pb-2 pt-4 flex-shrink-0">
                            <div className="flex items-center gap-3 bg-gradient-to-r from-gray-900 to-gray-800 p-3 rounded-lg border border-amber-500/20 shadow-lg">
                                <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                                    {advisorName.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-white truncate">{advisorName}</p>
                                    <p className="text-[10px] text-amber-400/80 truncate">為您量身打造的財富計畫</p>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none"></div>
                </div>
            </div>
            
            <p className="text-center text-xs text-gray-500 mt-4">預覽模式：點擊下載按鈕生成高清圖卡</p>
        </div>

      </div>

      {/* 右側：Quick Calculator Tool (Sticky) */}
      <div className="md:w-96 w-full flex-shrink-0">
         <div className="sticky top-8 h-[calc(100vh-4rem)]">
            <QuickCalculator />
         </div>
      </div>

    </div>
  );
};

export default MarketWarRoom;