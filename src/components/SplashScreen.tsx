import React, { useEffect, useRef, useState } from 'react';

const SplashScreen = () => {
  const blueLineRef = useRef<SVGPathElement>(null);
  const redLineRef = useRef<SVGPathElement>(null);
  const purpleLineRef = useRef<SVGPathElement>(null);
  
  // 控制各個元素的動畫狀態
  const [showBlue, setShowBlue] = useState(false);
  const [showRed, setShowRed] = useState(false);
  const [showPurple, setShowPurple] = useState(false);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    // 1. 初始化：設定所有線條的 strokeDasharray 和 strokeDashoffset
    const paths = [blueLineRef.current, redLineRef.current, purpleLineRef.current];
    
    paths.forEach(path => {
      if (path) {
        const len = path.getTotalLength();
        path.style.strokeDasharray = `${len}`;
        path.style.strokeDashoffset = `${len}`;
        // 強制瀏覽器重繪 (Reflow)，確保初始狀態被套用
        path.getBoundingClientRect(); 
      }
    });

    // 2. 依照時間軸觸發動畫 (與您的原始 Script 一致)
    const t1 = setTimeout(() => setShowBlue(true), 200);
    const t2 = setTimeout(() => setShowRed(true), 800);
    const t3 = setTimeout(() => setShowPurple(true), 1400);
    const t4 = setTimeout(() => setShowText(true), 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050b14] overflow-hidden font-sans">
      
      {/* 定義 CSS 動畫 (scoped styles) */}
      <style>{`
        .logo-path {
          opacity: 0;
          transition: stroke-dashoffset 1s cubic-bezier(0.25, 1, 0.5, 1), opacity 1s ease-in;
        }
        .anim-draw {
          stroke-dashoffset: 0 !important;
          opacity: 1 !important;
        }
        .glow-blue { filter: drop-shadow(0 0 12px rgba(46, 107, 255, 0.7)); }
        .glow-red { filter: drop-shadow(0 0 12px rgba(255, 58, 58, 0.7)); }
      `}</style>

      {/* Background Grid */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(77, 163, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(77, 163, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative flex flex-col items-center z-10">
        <svg width="320" height="420" viewBox="0 0 320 420" className="overflow-visible">
          <defs>
            <linearGradient id="gradBlue" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4DA3FF" />
              <stop offset="100%" stopColor="#2E6BFF" />
            </linearGradient>

            <linearGradient id="gradRed" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF6A6A" />
              <stop offset="100%" stopColor="#FF3A3A" />
            </linearGradient>

            <linearGradient id="gradPurpleNode" gradientUnits="userSpaceOnUse" x1="91.5" y1="0" x2="228.5" y2="0">
              <stop offset="0%" stopColor="#8A5CFF" stopOpacity="0" />
              <stop offset="20%" stopColor="#CE4DFF" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#E8E0FF" stopOpacity="1" />
              <stop offset="80%" stopColor="#CE4DFF" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#8A5CFF" stopOpacity="0" />
            </linearGradient>

            <filter id="stretched-glow" filterUnits="userSpaceOnUse" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="15 2" result="blur" />
              <feColorMatrix in="blur" type="matrix" values="
                0 0 0 0 0.6 
                0 0 0 0 0.4 
                0 0 0 0 1 
                0 0 0 0.8 0" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Blue Curve */}
          <path 
            ref={blueLineRef}
            d="M 90,40 C 90,160 130,220 242,380" 
            fill="none" 
            stroke="url(#gradBlue)" 
            strokeWidth="14" 
            strokeLinecap="round"
            className={`logo-path glow-blue ${showBlue ? 'anim-draw' : ''}`}
          />

          {/* Red Curve */}
          <path 
            ref={redLineRef}
            d="M 230,40 C 230,160 190,220 78,380" 
            fill="none" 
            stroke="url(#gradRed)" 
            strokeWidth="14" 
            strokeLinecap="round"
            className={`logo-path glow-red ${showRed ? 'anim-draw' : ''}`}
          />

          {/* Purple Line */}
          <path 
            ref={purpleLineRef}
            d="M 91.5,314 L 228.5,314" 
            fill="none" 
            stroke="url(#gradPurpleNode)" 
            strokeWidth="10.2" 
            strokeLinecap="round"
            className={`logo-path ${showPurple ? 'anim-draw' : ''}`}
            style={{ filter: 'url(#stretched-glow)', transitionDuration: '0.8s' }}
          />
        </svg>

        <div 
            className={`mt-4 text-center transition-all duration-1000 transform ${showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
            <h1 className="text-3xl font-bold text-white tracking-widest m-0 leading-tight font-[system-ui]">
                ULTRA ADVISOR
            </h1>
            <p className="text-[#4DA3FF] text-xs tracking-[0.25em] mt-2 font-[system-ui] font-medium">
                AI FINANCIAL PLATFORM
            </p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
