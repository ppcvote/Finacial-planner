import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';

// ============================================
// Ultra Advisor 第一人稱視角宣傳片 v4
//
// 【一鏡到底設計】
// - 沒有黑屏轉場
// - 鏡頭持續移動（縮放、平移）
// - 元素滑入滑出，不用淡入淡出
// - 整體像一個連續的攝影機運動
// ============================================

// ============================================
// 基礎視覺效果
// ============================================

// 細膩網格背景（固定）
const SubtleGrid: React.FC<{ color?: string; opacity?: number }> = ({
  color = '#4DA3FF',
  opacity = 0.04,
}) => {
  const frame = useCurrentFrame();
  const offset = (frame * 0.5) % 100;

  return (
    <div
      style={{
        position: 'absolute',
        inset: -200,
        backgroundImage: `
          linear-gradient(${color} 1px, transparent 1px),
          linear-gradient(90deg, ${color} 1px, transparent 1px)
        `,
        backgroundSize: '100px 100px',
        backgroundPosition: `0 ${offset}px`,
        opacity,
      }}
    />
  );
};

// 浮動光暈
const FloatingGlow: React.FC<{
  color: string;
  size?: number;
  x: number;
  y: number;
}> = ({ color, size = 800, x, y }) => {
  const frame = useCurrentFrame();
  const breathe = 1 + Math.sin(frame * 0.025) * 0.15;
  const drift = Math.sin(frame * 0.015) * 20;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + drift,
        width: size * breathe,
        height: size * breathe,
        background: `radial-gradient(circle, ${color}25 0%, transparent 70%)`,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }}
    />
  );
};

// Logo 元件
const Logo: React.FC<{ scale?: number }> = ({ scale = 1 }) => {
  const frame = useCurrentFrame();
  const glowPulse = 1 + Math.sin(frame * 0.06) * 0.1;

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        filter: `drop-shadow(0 0 ${25 * glowPulse}px #4DA3FF50)`,
      }}
    >
      <svg width={220} height={290} viewBox="0 0 320 420">
        <defs>
          <linearGradient id="logoBlue" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4DA3FF" />
            <stop offset="100%" stopColor="#2E6BFF" />
          </linearGradient>
          <linearGradient id="logoRed" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF6A6A" />
            <stop offset="100%" stopColor="#FF3A3A" />
          </linearGradient>
          <linearGradient id="logoPurple" gradientUnits="userSpaceOnUse" x1="91.5" y1="314" x2="228.5" y2="314">
            <stop offset="0%" stopColor="#8A5CFF" stopOpacity="0" />
            <stop offset="20%" stopColor="#CE4DFF" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#E8E0FF" stopOpacity="1" />
            <stop offset="80%" stopColor="#CE4DFF" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#8A5CFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path
          d="M 90,40 C 90,160 130,220 242,380"
          fill="none"
          stroke="url(#logoBlue)"
          strokeWidth="14"
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 10px #4DA3FF)' }}
        />
        <path
          d="M 230,40 C 230,160 190,220 78,380"
          fill="none"
          stroke="url(#logoRed)"
          strokeWidth="14"
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 10px #FF3A3A)' }}
        />
        <path
          d="M 91.5,314 L 228.5,314"
          fill="none"
          stroke="url(#logoPurple)"
          strokeWidth="10"
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 12px #CE4DFF)' }}
        />
      </svg>
    </div>
  );
};

// ============================================
// 主影片組件 - 一鏡到底
// ============================================
export const UltraAdvisorFirstPersonDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // ============================================
  // 時間軸定義（以 frame 為單位，60fps）
  // ============================================
  // 0-240 (0-4s): 開場 Logo
  // 240-540 (4-9s): 推進到戰情室
  // 540-840 (9-14s): 平移到計算器
  // 840-1080 (14-18s): 報表生成
  // 1080-1320 (18-22s): 拉遠展示賣點
  // 1320-1500 (22-25s): 結尾

  // ============================================
  // 鏡頭運動 - 一鏡到底的核心
  // ============================================

  // 鏡頭縮放（較小的縮放，避免太近）
  const cameraZoom = interpolate(
    frame,
    [0,    180,  240,  400,  540,  700,  840,  1000, 1080, 1200, 1320, 1500],
    [1,    1,    1.2,  1.4,  1.4,  1.3,  1.3,  1.1,  1.1,  1,    1,    1.05],
    { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) }
  );

  // 鏡頭 X 位置（大範圍平移，各區域分開）
  const cameraX = interpolate(
    frame,
    [0,    240,  400,  540,  700,  840,  1000, 1080, 1320, 1500],
    [0,    0,    -800, -800, 800,  800,  0,    0,    0,    0],
    { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) }
  );

  // 鏡頭 Y 位置（大範圍移動）
  const cameraY = interpolate(
    frame,
    [0,    240,  400,  540,  700,  840,  1000, 1080, 1320, 1500],
    [0,    0,    -400, -600, -600, -400, 200,  200,  0,    0],
    { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) }
  );

  // ============================================
  // 各元素的出現時機（使用滑入而非淡入）
  // ============================================

  // Logo 相關
  const logoScale = interpolate(frame, [30, 80], [0.5, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.5))
  });
  const logoOpacity = interpolate(frame, [30, 60], [0, 1], { extrapolateRight: 'clamp' });

  // 品牌文字
  const brandTextY = interpolate(frame, [80, 130], [60, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)
  });
  const brandTextOpacity = interpolate(frame, [80, 110], [0, 1], { extrapolateRight: 'clamp' });

  // Slogan
  const sloganY = interpolate(frame, [110, 160], [40, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)
  });
  const sloganOpacity = interpolate(frame, [110, 140], [0, 1], { extrapolateRight: 'clamp' });

  // 功能標籤
  const getTagProgress = (index: number) => {
    const start = 150 + index * 15;
    return {
      y: interpolate(frame, [start, start + 30], [30, 0], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)
      }),
      opacity: interpolate(frame, [start, start + 20], [0, 1], { extrapolateRight: 'clamp' }),
    };
  };

  // ============================================
  // 戰情室元素 (frame 240-540)
  // ============================================
  const dashboardTitleX = interpolate(frame, [260, 320], [-300, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)
  });
  const dashboardTitleOpacity = interpolate(frame, [260, 300], [0, 1], { extrapolateRight: 'clamp' });

  // 工具卡片進場
  const getToolCardProgress = (index: number) => {
    const start = 300 + index * 40;
    const scale = interpolate(frame, [start, start + 50], [0.7, 1], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.2))
    });
    const opacity = interpolate(frame, [start, start + 30], [0, 1], { extrapolateRight: 'clamp' });
    const y = interpolate(frame, [start, start + 50], [40, 0], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)
    });
    return { scale, opacity, y };
  };

  const tools = [
    { icon: '🛡️', name: '黃金保險箱', color: '#fbbf24' },
    { icon: '🏠', name: '金融房產', color: '#3b82f6' },
    { icon: '🎓', name: '學貸活化', color: '#8b5cf6' },
    { icon: '☂️', name: '退休缺口', color: '#10b981' },
  ];

  // ============================================
  // 計算器元素 (frame 540-840)
  // ============================================
  const calcTitleX = interpolate(frame, [560, 620], [300, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)
  });
  const calcTitleOpacity = interpolate(frame, [560, 600], [0, 1], { extrapolateRight: 'clamp' });

  // 滑桿動畫
  const loanAmount = interpolate(frame, [600, 700], [500, 1000], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)
  });
  const rate = interpolate(frame, [650, 750], [1.5, 2.2], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)
  });
  const years = interpolate(frame, [700, 800], [20, 30], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)
  });

  // 計算結果
  const monthlyPayment = Math.round(
    (loanAmount * 10000 * (rate / 100 / 12) * Math.pow(1 + rate / 100 / 12, years * 12)) /
      (Math.pow(1 + rate / 100 / 12, years * 12) - 1)
  );
  const totalInterest = Math.round(monthlyPayment * years * 12 - loanAmount * 10000);

  // 圖表進度
  const chartProgress = interpolate(frame, [680, 820], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)
  });

  // ============================================
  // 報表元素 (frame 840-1080)
  // ============================================
  const reportButtonScale = interpolate(frame, [860, 900], [0.8, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.5))
  });
  const reportButtonOpacity = interpolate(frame, [860, 890], [0, 1], { extrapolateRight: 'clamp' });

  const isGenerating = frame >= 920 && frame < 1000;
  const loadProgress = interpolate(frame, [920, 1000], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)
  });
  const isComplete = frame >= 1000;

  const reportScale = interpolate(frame, [1010, 1060], [0.85, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.1))
  });
  const reportOpacity = interpolate(frame, [1010, 1040], [0, 1], { extrapolateRight: 'clamp' });
  const reportY = interpolate(frame, [1010, 1060], [50, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)
  });

  // ============================================
  // 賣點元素 (frame 1080-1320)
  // ============================================
  const getValuePointProgress = (index: number) => {
    const start = 1100 + index * 50;
    const x = interpolate(frame, [start, start + 60], [index === 0 ? -200 : index === 2 ? 200 : 0, 0], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)
    });
    const y = interpolate(frame, [start, start + 60], [80, 0], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)
    });
    const opacity = interpolate(frame, [start, start + 40], [0, 1], { extrapolateRight: 'clamp' });
    const scale = interpolate(frame, [start, start + 60], [0.9, 1], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)
    });
    return { x, y, opacity, scale };
  };

  const valuePoints = [
    { icon: '🧮', title: '傲創計算機', subtitle: '免費財務工具', color: '#3b82f6' },
    { icon: '📚', title: '免費知識庫', subtitle: '獲客渠道', color: '#8b5cf6' },
    { icon: '🎓', title: '教育訓練素材', subtitle: '一站式服務', color: '#10b981' },
  ];

  // ============================================
  // 結尾元素 (frame 1320-1500)
  // ============================================
  const outroLogoScale = interpolate(frame, [1340, 1400], [0.8, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.2))
  });
  const outroLogoOpacity = interpolate(frame, [1340, 1380], [0, 1], { extrapolateRight: 'clamp' });

  const outroBrandY = interpolate(frame, [1380, 1430], [40, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)
  });
  const outroBrandOpacity = interpolate(frame, [1380, 1410], [0, 1], { extrapolateRight: 'clamp' });

  const outroUrlOpacity = interpolate(frame, [1430, 1470], [0, 1], { extrapolateRight: 'clamp' });

  // ============================================
  // 元素可見性（基於時間軸）
  // ============================================
  const showIntro = frame < 400;
  const showDashboard = frame >= 240 && frame < 700;
  const showCalculator = frame >= 520 && frame < 1000;
  const showReport = frame >= 840 && frame < 1200;
  const showValuePoints = frame >= 1080 && frame < 1400;
  const showOutro = frame >= 1300;

  // 開場元素淡出（當鏡頭推進時）
  const introFadeOut = interpolate(frame, [200, 300], [1, 0], { extrapolateRight: 'clamp' });

  // ============================================
  // 渲染
  // ============================================
  return (
    <AbsoluteFill
      style={{
        background: '#030712',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans TC", sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* 場景容器 - 應用鏡頭運動 */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          transform: `scale(${cameraZoom}) translate(${cameraX / cameraZoom}px, ${cameraY / cameraZoom}px)`,
          transformOrigin: 'center center',
        }}
      >
        {/* 背景層 */}
        <SubtleGrid color="#4DA3FF" opacity={0.03} />
        <FloatingGlow color="#4DA3FF" size={1000} x={width * 0.3} y={height * 0.4} />
        <FloatingGlow color="#8b5cf6" size={800} x={width * 0.7} y={height * 0.6} />
        <FloatingGlow color="#3b82f6" size={700} x={width * 0.5} y={height * 0.3} />

        {/* ==================== 開場區域 ==================== */}
        {showIntro && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              opacity: introFadeOut,
            }}
          >
            {/* Logo */}
            <div style={{ transform: `scale(${logoScale})`, opacity: logoOpacity }}>
              <Logo scale={1} />
            </div>

            {/* 品牌名稱 */}
            <div
              style={{
                marginTop: 30,
                fontSize: 52,
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: 10,
                transform: `translateY(${brandTextY}px)`,
                opacity: brandTextOpacity,
                textShadow: '0 0 30px #4DA3FF50',
              }}
            >
              ULTRA ADVISOR
            </div>

            {/* Slogan */}
            <div
              style={{
                marginTop: 12,
                fontSize: 18,
                fontWeight: 600,
                color: '#4DA3FF',
                letterSpacing: 3,
                transform: `translateY(${sloganY}px)`,
                opacity: sloganOpacity,
              }}
            >
              AI 財務視覺化平台
            </div>

            {/* 功能標籤 */}
            <div style={{ display: 'flex', gap: 14, marginTop: 40 }}>
              {['⚡ 3秒出圖', '🛠️ 18種工具', '📊 專業報表'].map((tag, i) => {
                const { y, opacity } = getTagProgress(i);
                return (
                  <div
                    key={i}
                    style={{
                      padding: '10px 20px',
                      background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                      border: '1px solid #334155',
                      borderRadius: 25,
                      color: '#94a3b8',
                      fontSize: 13,
                      fontWeight: 600,
                      transform: `translateY(${y}px)`,
                      opacity,
                    }}
                  >
                    {tag}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== 戰情室區域 ==================== */}
        {showDashboard && (
          <div
            style={{
              position: 'absolute',
              left: width * 0.5 + 600,
              top: height * 0.5 + 350,
              transform: 'translate(-50%, -50%)',
              width: 800,
            }}
          >
            {/* 標題 */}
            <div
              style={{
                fontSize: 36,
                fontWeight: 900,
                color: '#ffffff',
                marginBottom: 30,
                transform: `translateX(${dashboardTitleX}px)`,
                opacity: dashboardTitleOpacity,
              }}
            >
              📊 自由組合戰情室
            </div>

            {/* 2x2 網格 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {tools.map((tool, i) => {
                const { scale, opacity, y } = getToolCardProgress(i);
                return (
                  <div
                    key={i}
                    style={{
                      height: 160,
                      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                      borderRadius: 20,
                      border: `2px solid ${tool.color}60`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: `scale(${scale}) translateY(${y}px)`,
                      opacity,
                      boxShadow: `0 20px 50px ${tool.color}20`,
                    }}
                  >
                    <div style={{ fontSize: 36, marginBottom: 12 }}>{tool.icon}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff' }}>{tool.name}</div>
                    <div
                      style={{
                        marginTop: 10,
                        padding: '5px 14px',
                        background: tool.color,
                        borderRadius: 15,
                        color: '#ffffff',
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      ✓ 已載入
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== 計算器區域 ==================== */}
        {showCalculator && (
          <div
            style={{
              position: 'absolute',
              left: width * 0.5 - 600,
              top: height * 0.5 + 500,
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              gap: 40,
            }}
          >
            {/* 左側：輸入 */}
            <div style={{ width: 350 }}>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 900,
                  color: '#ffffff',
                  marginBottom: 30,
                  transform: `translateX(${calcTitleX}px)`,
                  opacity: calcTitleOpacity,
                }}
              >
                🏠 金融房產專案
              </div>

              {/* 滑桿 */}
              {[
                { label: '貸款金額', value: `${Math.round(loanAmount)} 萬`, progress: (loanAmount - 500) / 500, color: '#3b82f6' },
                { label: '年利率', value: `${rate.toFixed(1)} %`, progress: (rate - 1.5) / 0.7, color: '#10b981' },
                { label: '貸款年期', value: `${Math.round(years)} 年`, progress: (years - 20) / 10, color: '#f59e0b' },
              ].map((item, i) => {
                const itemOpacity = interpolate(frame, [580 + i * 30, 610 + i * 30], [0, 1], { extrapolateRight: 'clamp' });
                return (
                  <div key={i} style={{ marginBottom: 28, opacity: itemOpacity }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ color: '#64748b', fontSize: 14, fontWeight: 600 }}>{item.label}</span>
                      <span style={{ color: item.color, fontSize: 24, fontWeight: 900, fontFamily: 'monospace' }}>
                        {item.value}
                      </span>
                    </div>
                    <div style={{ height: 8, background: '#1e293b', borderRadius: 4, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.max(0, item.progress) * 100}%`,
                          background: `linear-gradient(90deg, ${item.color}80, ${item.color})`,
                          borderRadius: 4,
                          boxShadow: `0 0 15px ${item.color}60`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 右側：結果 */}
            <div style={{ width: 500 }}>
              {/* 結果卡片 */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                <div
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    borderRadius: 20,
                    padding: 24,
                    boxShadow: '0 20px 50px #3b82f640',
                    opacity: interpolate(frame, [620, 660], [0, 1], { extrapolateRight: 'clamp' }),
                    transform: `translateY(${interpolate(frame, [620, 680], [30, 0], { extrapolateRight: 'clamp' })}px)`,
                  }}
                >
                  <div style={{ color: '#ffffff80', fontSize: 13, marginBottom: 6 }}>每月還款</div>
                  <div style={{ color: '#ffffff', fontSize: 32, fontWeight: 900, fontFamily: 'monospace' }}>
                    ${monthlyPayment.toLocaleString()}
                  </div>
                </div>

                <div
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    borderRadius: 20,
                    padding: 24,
                    boxShadow: '0 20px 50px #ef444440',
                    opacity: interpolate(frame, [650, 690], [0, 1], { extrapolateRight: 'clamp' }),
                    transform: `translateY(${interpolate(frame, [650, 710], [30, 0], { extrapolateRight: 'clamp' })}px)`,
                  }}
                >
                  <div style={{ color: '#ffffff80', fontSize: 13, marginBottom: 6 }}>累計利息</div>
                  <div style={{ color: '#ffffff', fontSize: 32, fontWeight: 900, fontFamily: 'monospace' }}>
                    ${totalInterest.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* 圖表 */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  borderRadius: 20,
                  padding: 24,
                  border: '1px solid #334155',
                  opacity: interpolate(frame, [680, 720], [0, 1], { extrapolateRight: 'clamp' }),
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', marginBottom: 16 }}>
                  📈 30年財富增長曲線
                </div>

                <svg width="100%" height="140" viewBox="0 0 450 140" preserveAspectRatio="none">
                  {/* 網格 */}
                  {[0, 1, 2, 3].map((i) => (
                    <line key={i} x1="0" y1={i * 45 + 10} x2="450" y2={i * 45 + 10} stroke="#334155" strokeWidth="1" />
                  ))}

                  {/* 累積支出（紅） */}
                  <path
                    d={`M 0,130 ${Array.from({ length: 31 }, (_, i) => {
                      const x = i * 15;
                      const y = 130 - (i / 30) * 70 * chartProgress;
                      return `L ${x},${y}`;
                    }).join(' ')}`}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0 0 6px #ef444480)' }}
                  />

                  {/* 投資增值（藍） */}
                  <path
                    d={`M 0,130 ${Array.from({ length: 31 }, (_, i) => {
                      const x = i * 15;
                      const growth = Math.pow(1.06, i);
                      const y = 130 - Math.min((growth - 1) * 25 * chartProgress, 110);
                      return `L ${x},${y}`;
                    }).join(' ')}`}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0 0 6px #3b82f680)' }}
                  />

                  {/* 淨資產（綠） */}
                  <path
                    d={`M 0,130 ${Array.from({ length: 31 }, (_, i) => {
                      const x = i * 15;
                      const growth = Math.pow(1.06, i);
                      const y = 130 - Math.min((growth - 1) * 32 * chartProgress, 120);
                      return `L ${x},${y}`;
                    }).join(' ')}`}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0 0 8px #10b98180)' }}
                  />
                </svg>

                {/* 圖例 */}
                <div style={{ display: 'flex', gap: 24, marginTop: 14, justifyContent: 'center' }}>
                  {[
                    { color: '#ef4444', label: '累積支出' },
                    { color: '#3b82f6', label: '投資增值' },
                    { color: '#10b981', label: '淨資產' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 3, background: item.color }} />
                      <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 報表區域 ==================== */}
        {showReport && (
          <div
            style={{
              position: 'absolute',
              left: width * 0.5,
              top: height * 0.5 - 200,
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* 標題 */}
            <div
              style={{
                fontSize: 40,
                fontWeight: 900,
                color: '#ffffff',
                marginBottom: 10,
                textShadow: '0 0 30px #10b98150',
                opacity: interpolate(frame, [860, 900], [0, 1], { extrapolateRight: 'clamp' }),
                transform: `translateY(${interpolate(frame, [860, 920], [30, 0], { extrapolateRight: 'clamp' })}px)`,
              }}
            >
              一鍵生成專業報表
            </div>

            <div
              style={{
                fontSize: 16,
                color: '#64748b',
                marginBottom: 35,
                opacity: interpolate(frame, [880, 920], [0, 1], { extrapolateRight: 'clamp' }),
              }}
            >
              3 秒出圖，讓數據替你說話
            </div>

            {/* 按鈕 */}
            <div
              style={{
                padding: '18px 45px',
                background: isComplete
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                borderRadius: 14,
                fontSize: 18,
                fontWeight: 800,
                color: '#ffffff',
                boxShadow: isComplete ? '0 0 50px #10b98150' : '0 0 35px #3b82f640',
                transform: `scale(${reportButtonScale})`,
                opacity: reportButtonOpacity,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              {isGenerating ? (
                <>
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      border: '3px solid transparent',
                      borderTopColor: '#ffffff',
                      animation: 'spin 0.6s linear infinite',
                    }}
                  />
                  生成中...
                </>
              ) : isComplete ? (
                <>✓ 報表已生成</>
              ) : (
                <>📊 生成策略報表</>
              )}
            </div>

            {/* 進度條 */}
            {isGenerating && (
              <div
                style={{
                  width: 280,
                  height: 5,
                  background: '#1e293b',
                  borderRadius: 3,
                  marginTop: 20,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${loadProgress * 100}%`,
                    background: 'linear-gradient(90deg, #3b82f6, #10b981)',
                    borderRadius: 3,
                    boxShadow: '0 0 15px #10b98160',
                  }}
                />
              </div>
            )}

            {/* 報表預覽 */}
            {isComplete && (
              <div
                style={{
                  marginTop: 30,
                  width: 700,
                  background: '#ffffff',
                  borderRadius: 20,
                  padding: 30,
                  boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
                  transform: `scale(${reportScale}) translateY(${reportY}px)`,
                  opacity: reportOpacity,
                }}
              >
                {/* 報表頭 */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 24,
                    paddingBottom: 20,
                    borderBottom: '2px solid #f1f5f9',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>財務規劃策略報表</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
                      客戶：王小明 ｜ 顧問：專業財務顧問
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '8px 18px',
                      background: '#3b82f608',
                      borderRadius: 10,
                      border: '1px solid #3b82f620',
                    }}
                  >
                    <span style={{ color: '#3b82f6', fontSize: 12, fontWeight: 800, letterSpacing: 1 }}>
                      ULTRA ADVISOR
                    </span>
                  </div>
                </div>

                {/* 報表內容 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  {/* 左：數據 */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>
                      📊 財務摘要
                    </div>
                    {[
                      { label: '貸款金額', value: '1,000 萬', color: '#3b82f6' },
                      { label: '年利率', value: '2.2%', color: '#10b981' },
                      { label: '貸款年期', value: '30 年', color: '#f59e0b' },
                      { label: '每月還款', value: '38,428 元', color: '#8b5cf6' },
                    ].map((item, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '10px 0',
                          borderBottom: '1px solid #f1f5f9',
                        }}
                      >
                        <span style={{ color: '#64748b', fontSize: 13 }}>{item.label}</span>
                        <span style={{ color: item.color, fontSize: 14, fontWeight: 800 }}>{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* 右：迷你圖 */}
                  <div style={{ background: '#f8fafc', borderRadius: 14, padding: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>
                      📈 30年淨資產成長
                    </div>
                    <svg width="100%" height="80" viewBox="0 0 240 80">
                      <path
                        d={`M 0,70 ${Array.from({ length: 31 }, (_, i) => {
                          const x = i * 8;
                          const y = 70 - Math.pow(1.06, i) * 10;
                          return `L ${x},${Math.max(y, 5)}`;
                        }).join(' ')}`}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div style={{ textAlign: 'center', marginTop: 12 }}>
                      <span style={{ fontSize: 26, fontWeight: 900, color: '#10b981' }}>+5,743 萬</span>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>30年預估淨增長</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== 賣點區域 ==================== */}
        {showValuePoints && (
          <div
            style={{
              position: 'absolute',
              left: width * 0.5,
              top: height * 0.5 + 50,
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            {/* 標題 */}
            <div
              style={{
                fontSize: 38,
                fontWeight: 900,
                color: '#ffffff',
                marginBottom: 10,
                textShadow: '0 0 30px #4DA3FF50',
                opacity: interpolate(frame, [1090, 1130], [0, 1], { extrapolateRight: 'clamp' }),
                transform: `translateY(${interpolate(frame, [1090, 1140], [30, 0], { extrapolateRight: 'clamp' })}px)`,
              }}
            >
              一個平台・三大價值
            </div>

            <div
              style={{
                fontSize: 16,
                color: '#64748b',
                marginBottom: 50,
                opacity: interpolate(frame, [1110, 1150], [0, 1], { extrapolateRight: 'clamp' }),
              }}
            >
              購買軟體服務，即獲得完整獲客與教育方案
            </div>

            {/* 三個賣點 */}
            <div style={{ display: 'flex', gap: 30 }}>
              {valuePoints.map((point, i) => {
                const { x, y, opacity, scale } = getValuePointProgress(i);
                return (
                  <div
                    key={i}
                    style={{
                      width: 280,
                      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                      borderRadius: 20,
                      border: `1px solid ${point.color}40`,
                      padding: 28,
                      opacity,
                      transform: `translate(${x}px, ${y}px) scale(${scale})`,
                      boxShadow: `0 25px 60px ${point.color}15`,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* 頂部發光線 */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: '20%',
                        right: '20%',
                        height: 2,
                        background: `linear-gradient(90deg, transparent, ${point.color}60, transparent)`,
                      }}
                    />

                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 16,
                        background: `${point.color}20`,
                        border: `1px solid ${point.color}40`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 32,
                        margin: '0 auto 18px',
                      }}
                    >
                      {point.icon}
                    </div>

                    <div style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', marginBottom: 8 }}>
                      {point.title}
                    </div>

                    <div
                      style={{
                        display: 'inline-block',
                        padding: '5px 12px',
                        background: `${point.color}25`,
                        borderRadius: 15,
                        color: point.color,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {point.subtitle}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 創辦會員提示 */}
            {frame > 1240 && (
              <div
                style={{
                  marginTop: 45,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '14px 30px',
                  background: 'linear-gradient(135deg, #fbbf2420, #f5920020)',
                  border: '1px solid #fbbf2450',
                  borderRadius: 35,
                  opacity: interpolate(frame, [1240, 1280], [0, 1], { extrapolateRight: 'clamp' }),
                  transform: `translateY(${interpolate(frame, [1240, 1290], [20, 0], { extrapolateRight: 'clamp' })}px)`,
                }}
              >
                <span style={{ fontSize: 18 }}>👑</span>
                <span style={{ color: '#fbbf24', fontSize: 16, fontWeight: 800 }}>
                  創辦會員限定優惠中
                </span>
              </div>
            )}
          </div>
        )}

        {/* ==================== 結尾區域 ==================== */}
        {showOutro && (
          <div
            style={{
              position: 'absolute',
              left: width * 0.5,
              top: height * 0.5 + 30,
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Logo */}
            <div style={{ transform: `scale(${outroLogoScale})`, opacity: outroLogoOpacity }}>
              <Logo scale={1.1} />
            </div>

            {/* 品牌名 */}
            <div
              style={{
                marginTop: 35,
                fontSize: 56,
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: 12,
                textShadow: '0 0 40px #4DA3FF60',
                transform: `translateY(${outroBrandY}px)`,
                opacity: outroBrandOpacity,
              }}
            >
              ULTRA ADVISOR
            </div>

            {/* Slogan */}
            <div
              style={{
                marginTop: 16,
                fontSize: 20,
                fontWeight: 600,
                color: '#4DA3FF',
                letterSpacing: 4,
                opacity: outroBrandOpacity,
              }}
            >
              讓數據替你說話
            </div>

            {/* 網址 */}
            <div
              style={{
                marginTop: 45,
                fontSize: 16,
                color: '#64748b',
                letterSpacing: 3,
                opacity: outroUrlOpacity,
              }}
            >
              ultra-advisor.tw
            </div>
          </div>
        )}
      </div>

      {/* CSS 動畫 */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AbsoluteFill>
  );
};
