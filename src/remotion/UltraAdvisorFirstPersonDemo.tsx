import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';

// ============================================
// Ultra Advisor 第一人稱視角宣傳片 v8.1
//
// 【一鏡到底設計】
// 流程：市場戰情室 → 放大調整 → 房產+大小水庫試算 → 按鈕出報表 → A4報表
// 修復：移除 CSS transition，優化鏡頭運動曲線
// ============================================

// ============================================
// 基礎視覺效果
// ============================================

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
        inset: -500,
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
        <path d="M 90,40 C 90,160 130,220 242,380" fill="none" stroke="url(#logoBlue)" strokeWidth="14" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 10px #4DA3FF)' }} />
        <path d="M 230,40 C 230,160 190,220 78,380" fill="none" stroke="url(#logoRed)" strokeWidth="14" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 10px #FF3A3A)' }} />
        <path d="M 91.5,314 L 228.5,314" fill="none" stroke="url(#logoPurple)" strokeWidth="10" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 12px #CE4DFF)' }} />
      </svg>
    </div>
  );
};

// ============================================
// 主影片組件
// ============================================
export const UltraAdvisorFirstPersonDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // ============================================
  // 時間軸（22秒 = 1320 frames @ 60fps）
  // ============================================
  // 0-150: 開場 Logo（中心）
  // 150-420: 進入市場戰情室（放大）+ 調整配置
  // 420-550: 過渡動畫
  // 550-900: 金融房產＋大小水庫試算
  // 900-1100: 按按鈕生成報表 + 報表展示
  // 1100-1320: 結尾

  // ============================================
  // 鏡頭運動 - 一鏡到底核心（優化版）
  // 使用更平滑的時間點和緩動
  // ============================================
  const cameraZoom = interpolate(
    frame,
    [0, 150, 420, 550, 900, 1100, 1200, 1320],
    [1, 1.2, 1.4, 1.3, 1.3, 1.15, 1, 1.05],
    { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) }
  );

  const cameraX = interpolate(
    frame,
    [0, 150, 420, 550, 900, 1100, 1200, 1320],
    [0, 200, 200, -400, -400, 0, 0, 0],
    { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) }
  );

  const cameraY = interpolate(
    frame,
    [0, 150, 420, 550, 900, 1100, 1200, 1320],
    [0, 250, 250, 50, 50, 400, 0, 0],
    { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) }
  );

  // ============================================
  // 各區域位置定義（相對於畫布中心）
  // ============================================
  const regions = {
    intro: { x: 0, y: 0 },
    dashboard: { x: 200, y: 250 },
    calculators: { x: -400, y: 50 },
    report: { x: 0, y: 400 },
    outro: { x: 0, y: 0 },
  };

  // ============================================
  // 元素可見性（增加緩衝區）
  // ============================================
  const showIntro = frame < 220;
  const showDashboard = frame >= 100 && frame < 620;
  const showCalculators = frame >= 480 && frame < 1020;
  const showReport = frame >= 860 && frame < 1250;
  const showOutro = frame >= 1150;

  // ============================================
  // 動畫進度
  // ============================================
  const introFadeOut = interpolate(frame, [150, 200], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // 戰情室工具列表
  const dashboardTools = [
    { icon: '📈', name: '通膨指數', value: '3.2%', color: '#ef4444' },
    { icon: '💰', name: '利率水準', value: '2.2%', color: '#3b82f6' },
    { icon: '📊', name: '市場波動', value: '中等', color: '#f59e0b' },
    { icon: '🏠', name: '房價指數', value: '+8.5%', color: '#10b981' },
  ];

  // 計算器數值動畫（延長動畫時間讓滑桿更流暢）
  const calcProgress = interpolate(frame, [620, 850], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // 金融房產試算
  const loanAmount = interpolate(calcProgress, [0, 1], [500, 1000]);
  const rate = interpolate(calcProgress, [0, 1], [1.5, 2.2]);
  const years = interpolate(calcProgress, [0, 1], [20, 30]);
  const monthlyPayment = Math.round((loanAmount * 10000 * (rate / 100 / 12) * Math.pow(1 + rate / 100 / 12, years * 12)) / (Math.pow(1 + rate / 100 / 12, years * 12) - 1));
  const totalInterest = Math.round(monthlyPayment * years * 12 - loanAmount * 10000);

  // 大小水庫試算
  const monthlyIncome = interpolate(calcProgress, [0, 1], [80000, 150000]);
  const bigReservoir = Math.round(monthlyIncome * 6);
  const smallReservoir = Math.round(monthlyIncome * 0.3);

  // 水庫水位動畫（使用 interpolate 而非 CSS transition）
  const waterLevel = interpolate(frame, [620, 850], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });

  // 報表進度
  const reportProgress = interpolate(frame, [920, 1000], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const isGenerating = frame >= 920 && frame < 1000;
  const isComplete = frame >= 1000;

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
          transform: `scale(${cameraZoom}) translate(${-cameraX / cameraZoom}px, ${-cameraY / cameraZoom}px)`,
          transformOrigin: 'center center',
        }}
      >
        {/* 背景層 */}
        <SubtleGrid color="#4DA3FF" opacity={0.03} />
        <FloatingGlow color="#4DA3FF" size={1200} x={width * 0.3} y={height * 0.3} />
        <FloatingGlow color="#8b5cf6" size={1000} x={width * 0.7} y={height * 0.7} />
        <FloatingGlow color="#10b981" size={800} x={width * 0.2} y={height * 0.8} />

        {/* ==================== 開場區域 ==================== */}
        {showIntro && (
          <div
            style={{
              position: 'absolute',
              left: width / 2 + regions.intro.x,
              top: height / 2 + regions.intro.y,
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              opacity: introFadeOut,
            }}
          >
            <div style={{ transform: `scale(${interpolate(frame, [20, 70], [0.5, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.5)) })})`, opacity: interpolate(frame, [20, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
              <Logo scale={1} />
            </div>
            <div style={{ marginTop: 30, fontSize: 48, fontWeight: 900, color: '#ffffff', letterSpacing: 10, textShadow: '0 0 30px #4DA3FF50', opacity: interpolate(frame, [50, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), transform: `translateY(${interpolate(frame, [50, 100], [40, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)` }}>
              ULTRA ADVISOR
            </div>
            <div style={{ marginTop: 12, fontSize: 16, fontWeight: 600, color: '#4DA3FF', letterSpacing: 3, opacity: interpolate(frame, [80, 120], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
              AI 財務視覺化平台
            </div>
          </div>
        )}

        {/* ==================== 市場戰情室 ==================== */}
        {showDashboard && (
          <div
            style={{
              position: 'absolute',
              left: width / 2 + regions.dashboard.x,
              top: height / 2 + regions.dashboard.y,
              transform: 'translate(-50%, -50%)',
              width: 750,
              opacity: interpolate(frame, [100, 160, 550, 620], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            }}
          >
            <div style={{ fontSize: 36, fontWeight: 900, color: '#ffffff', marginBottom: 8, textShadow: '0 0 25px #4DA3FF40', transform: `translateX(${interpolate(frame, [140, 200], [-100, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })}px)` }}>
              📊 市場戰情室
            </div>
            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 30, opacity: interpolate(frame, [160, 210], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
              即時監控市場動態，智能調整投資策略
            </div>

            {/* 即時數據面板 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 25 }}>
              {dashboardTools.map((tool, i) => {
                const delay = i * 30;
                const itemOpacity = interpolate(frame, [200 + delay, 260 + delay], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                const itemScale = interpolate(frame, [200 + delay, 280 + delay], [0.7, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.2)) });

                // 配置動畫 - 使用 interpolate 而非 Math.sin（更可預測）
                const updateProgress = interpolate(frame, [320 + i * 40, 380 + i * 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                const isUpdating = updateProgress > 0 && updateProgress < 1;
                const glowIntensity = interpolate(updateProgress, [0, 0.5, 1], [0, 1, 0]);

                return (
                  <div key={i} style={{ height: 110, background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: 14, border: `2px solid ${tool.color}50`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `scale(${itemScale})`, opacity: itemOpacity, boxShadow: `0 12px 35px ${tool.color}15, 0 0 ${30 * glowIntensity}px ${tool.color}60`, position: 'relative' }}>
                    <div style={{ fontSize: 26, marginBottom: 6 }}>{tool.icon}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>{tool.name}</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: tool.color, fontFamily: 'monospace' }}>{tool.value}</div>
                    {isUpdating && <div style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: '50%', background: '#10b981', opacity: glowIntensity }} />}
                  </div>
                );
              })}
            </div>

            {/* 操作提示 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '12px 24px', background: 'linear-gradient(135deg, #10b98120, #10b98110)', border: '1px solid #10b98150', borderRadius: 12, opacity: interpolate(frame, [300, 340, 480, 520], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', opacity: interpolate(frame % 60, [0, 30, 60], [1, 0.4, 1]) }} />
              <span style={{ color: '#10b981', fontSize: 13, fontWeight: 700 }}>系統正在同步最新市場數據...</span>
            </div>

            {/* 配置完成提示 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 15, opacity: interpolate(frame, [460, 500, 540, 580], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
              <span style={{ color: '#10b981', fontSize: 20 }}>✓</span>
              <span style={{ color: '#ffffff', fontSize: 14, fontWeight: 700 }}>數據同步完成，進入試算模組</span>
            </div>
          </div>
        )}

        {/* ==================== 金融房產 + 大小水庫試算區 ==================== */}
        {showCalculators && (
          <div
            style={{
              position: 'absolute',
              left: width / 2 + regions.calculators.x,
              top: height / 2 + regions.calculators.y,
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              gap: 40,
              opacity: interpolate(frame, [480, 560, 940, 1020], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            }}
          >
            {/* 左側：金融房產試算 */}
            <div style={{ width: 420 }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#ffffff', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, transform: `translateX(${interpolate(frame, [520, 600], [-80, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })}px)` }}>
                <span style={{ fontSize: 32 }}>🏠</span>
                <span>金融房產專案</span>
              </div>

              {/* 輸入控制 */}
              {[
                { label: '貸款金額', value: `${Math.round(loanAmount)} 萬`, progress: (loanAmount - 500) / 500, color: '#3b82f6' },
                { label: '年利率', value: `${rate.toFixed(1)} %`, progress: (rate - 1.5) / 0.7, color: '#10b981' },
                { label: '貸款年期', value: `${Math.round(years)} 年`, progress: (years - 20) / 10, color: '#f59e0b' },
              ].map((item, i) => {
                const itemOpacity = interpolate(frame, [560 + i * 35, 620 + i * 35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                const isSliding = calcProgress > 0 && calcProgress < 1;
                return (
                  <div key={i} style={{ marginBottom: 18, opacity: itemOpacity }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ color: '#64748b', fontSize: 12, fontWeight: 600 }}>{item.label}</span>
                      <span style={{ color: item.color, fontSize: 22, fontWeight: 900, fontFamily: 'monospace', textShadow: isSliding ? `0 0 10px ${item.color}60` : 'none' }}>{item.value}</span>
                    </div>
                    <div style={{ height: 6, background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.max(0, item.progress) * 100}%`, background: `linear-gradient(90deg, ${item.color}80, ${item.color})`, borderRadius: 3, boxShadow: `0 0 12px ${item.color}60` }} />
                    </div>
                  </div>
                );
              })}

              {/* 結果卡片 */}
              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <div style={{ flex: 1, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', borderRadius: 14, padding: 16, boxShadow: '0 15px 40px #3b82f650', opacity: interpolate(frame, [680, 730], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), transform: `translateY(${interpolate(frame, [680, 750], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })}px)` }}>
                  <div style={{ color: '#ffffff80', fontSize: 11, marginBottom: 4 }}>每月還款</div>
                  <div style={{ color: '#ffffff', fontSize: 24, fontWeight: 900, fontFamily: 'monospace' }}>${monthlyPayment.toLocaleString()}</div>
                </div>
                <div style={{ flex: 1, background: 'linear-gradient(135deg, #ef4444, #dc2626)', borderRadius: 14, padding: 16, boxShadow: '0 15px 40px #ef444450', opacity: interpolate(frame, [710, 760], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), transform: `translateY(${interpolate(frame, [710, 780], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })}px)` }}>
                  <div style={{ color: '#ffffff80', fontSize: 11, marginBottom: 4 }}>累計利息</div>
                  <div style={{ color: '#ffffff', fontSize: 24, fontWeight: 900, fontFamily: 'monospace' }}>${totalInterest.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* 右側：大小水庫專案 */}
            <div style={{ width: 380 }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#ffffff', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, transform: `translateX(${interpolate(frame, [560, 640], [80, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })}px)` }}>
                <span style={{ fontSize: 32 }}>💧</span>
                <span>大小水庫專案</span>
              </div>

              {/* 月收入輸入 */}
              <div style={{ marginBottom: 22, opacity: interpolate(frame, [600, 660], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: '#64748b', fontSize: 12, fontWeight: 600 }}>每月收入</span>
                  <span style={{ color: '#4DA3FF', fontSize: 22, fontWeight: 900, fontFamily: 'monospace' }}>${Math.round(monthlyIncome).toLocaleString()}</span>
                </div>
                <div style={{ height: 6, background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${((monthlyIncome - 80000) / 70000) * 100}%`, background: 'linear-gradient(90deg, #4DA3FF80, #4DA3FF)', borderRadius: 3, boxShadow: '0 0 12px #4DA3FF60' }} />
                </div>
              </div>

              {/* 水庫視覺化 */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                {/* 大水庫 */}
                <div style={{ flex: 1, background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: 14, padding: 16, border: '2px solid #3b82f650', opacity: interpolate(frame, [680, 740], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), transform: `scale(${interpolate(frame, [680, 760], [0.8, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.2)) })})` }}>
                  <div style={{ fontSize: 28, textAlign: 'center', marginBottom: 8 }}>🏔️</div>
                  <div style={{ color: '#94a3b8', fontSize: 10, textAlign: 'center', marginBottom: 6 }}>大水庫（6個月緊急備用）</div>
                  <div style={{ color: '#3b82f6', fontSize: 20, fontWeight: 900, textAlign: 'center', fontFamily: 'monospace' }}>${bigReservoir.toLocaleString()}</div>
                  <div style={{ marginTop: 10, height: 60, background: '#0f172a', borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${waterLevel * 80}%`, background: 'linear-gradient(180deg, #3b82f6, #1d4ed8)' }} />
                    <div style={{ position: 'absolute', bottom: `${waterLevel * 80}%`, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, transparent, #60a5fa80, transparent)' }} />
                  </div>
                </div>

                {/* 小水庫 */}
                <div style={{ flex: 1, background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: 14, padding: 16, border: '2px solid #10b98150', opacity: interpolate(frame, [720, 780], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), transform: `scale(${interpolate(frame, [720, 800], [0.8, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.2)) })})` }}>
                  <div style={{ fontSize: 28, textAlign: 'center', marginBottom: 8 }}>🌊</div>
                  <div style={{ color: '#94a3b8', fontSize: 10, textAlign: 'center', marginBottom: 6 }}>小水庫（彈性支出）</div>
                  <div style={{ color: '#10b981', fontSize: 20, fontWeight: 900, textAlign: 'center', fontFamily: 'monospace' }}>${smallReservoir.toLocaleString()}</div>
                  <div style={{ marginTop: 10, height: 60, background: '#0f172a', borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${waterLevel * 60}%`, background: 'linear-gradient(180deg, #10b981, #059669)' }} />
                    <div style={{ position: 'absolute', bottom: `${waterLevel * 60}%`, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, transparent, #34d39980, transparent)' }} />
                  </div>
                </div>
              </div>

              {/* 試算完成提示 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '10px 20px', background: 'linear-gradient(135deg, #10b98120, #10b98110)', border: '1px solid #10b98150', borderRadius: 10, opacity: interpolate(frame, [860, 900, 940, 980], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
                <span style={{ color: '#10b981', fontSize: 16 }}>✓</span>
                <span style={{ color: '#ffffff', fontSize: 12, fontWeight: 700 }}>試算完成，可生成報表</span>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 報表區域 ==================== */}
        {showReport && (
          <div
            style={{
              position: 'absolute',
              left: width / 2 + regions.report.x,
              top: height / 2 + regions.report.y,
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              opacity: interpolate(frame, [860, 920, 1180, 1250], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            }}
          >
            {/* 按鈕與進度 */}
            {!isComplete && (
              <>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#ffffff', marginBottom: 10, textShadow: '0 0 25px #10b98150', transform: `translateY(${interpolate(frame, [880, 940], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })}px)` }}>
                  一鍵生成專業報表
                </div>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 25, opacity: interpolate(frame, [900, 940], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
                  整合所有試算結果，3 秒出圖
                </div>

                {/* 生成按鈕 */}
                <div style={{ display: 'inline-flex', padding: '16px 40px', background: isGenerating ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #3b82f6, #2563eb)', borderRadius: 14, fontSize: 16, fontWeight: 800, color: '#ffffff', boxShadow: isGenerating ? '0 0 50px #f59e0b50' : '0 0 35px #3b82f650', alignItems: 'center', gap: 12, transform: `scale(${interpolate(frame, [910, 950], [0.9, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.2)) })})` }}>
                  {isGenerating ? (
                    <>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: '3px solid transparent', borderTopColor: '#ffffff', transform: `rotate(${frame * 8}deg)` }} />
                      生成中...
                    </>
                  ) : (
                    <>📊 生成策略報表</>
                  )}
                </div>

                {/* 進度條 */}
                {isGenerating && (
                  <div style={{ width: 280, height: 6, background: '#1e293b', borderRadius: 3, marginTop: 20, overflow: 'hidden', marginLeft: 'auto', marginRight: 'auto' }}>
                    <div style={{ height: '100%', width: `${reportProgress * 100}%`, background: 'linear-gradient(90deg, #3b82f6, #10b981)', borderRadius: 3, boxShadow: '0 0 12px #10b98160' }} />
                  </div>
                )}
              </>
            )}

            {/* A4 報表 */}
            {isComplete && (
              <div style={{ marginTop: 0, width: 450, height: 620, background: '#ffffff', borderRadius: 6, boxShadow: '0 30px 80px rgba(0,0,0,0.7)', overflow: 'hidden', display: 'flex', flexDirection: 'column', marginLeft: 'auto', marginRight: 'auto', opacity: interpolate(frame, [1010, 1060], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), transform: `scale(${interpolate(frame, [1010, 1080], [0.85, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.1)) })})` }}>
                {/* 報表頭 */}
                <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #4DA3FF, #2E6BFF)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#fff', fontSize: 14, fontWeight: 900 }}>U</span>
                    </div>
                    <div>
                      <div style={{ color: '#ffffff', fontSize: 11, fontWeight: 800, letterSpacing: 2 }}>ULTRA ADVISOR</div>
                      <div style={{ color: '#4DA3FF', fontSize: 7, letterSpacing: 0.5 }}>AI 財務視覺化平台</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#ffffff', fontSize: 13, fontWeight: 900 }}>綜合財務規劃報表</div>
                    <div style={{ color: '#64748b', fontSize: 7 }}>Comprehensive Financial Report</div>
                  </div>
                </div>

                {/* 客戶資訊 */}
                <div style={{ background: '#f8fafc', padding: '10px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: 8 }}>
                  <div style={{ display: 'flex', gap: 20 }}>
                    <div><span style={{ color: '#64748b' }}>客戶姓名：</span><span style={{ color: '#0f172a', fontWeight: 700 }}>王小明</span></div>
                    <div><span style={{ color: '#64748b' }}>報表日期：</span><span style={{ color: '#0f172a', fontWeight: 700 }}>2024/01/15</span></div>
                  </div>
                  <div><span style={{ color: '#64748b' }}>顧問：</span><span style={{ color: '#0f172a', fontWeight: 700 }}>專業財務顧問</span></div>
                </div>

                {/* 報表內容 */}
                <div style={{ flex: 1, padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* 房產試算摘要 */}
                  <div style={{ background: '#0f172a', borderRadius: 8, padding: 12 }}>
                    <div style={{ color: '#ffffff', fontSize: 9, fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: '#3b82f6' }}>🏠</span> 金融房產專案試算
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                      {[
                        { label: '貸款金額', value: '1,000 萬', color: '#3b82f6' },
                        { label: '年利率', value: '2.2%', color: '#10b981' },
                        { label: '貸款年期', value: '30 年', color: '#f59e0b' },
                      ].map((item, i) => (
                        <div key={i} style={{ textAlign: 'center' }}>
                          <div style={{ color: '#64748b', fontSize: 7 }}>{item.label}</div>
                          <div style={{ color: item.color, fontSize: 14, fontWeight: 900 }}>{item.value}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                      <div style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', borderRadius: 6, padding: 10 }}>
                        <div style={{ color: '#ffffff80', fontSize: 7 }}>每月還款</div>
                        <div style={{ color: '#ffffff', fontSize: 16, fontWeight: 900, fontFamily: 'monospace' }}>$38,428</div>
                      </div>
                      <div style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', borderRadius: 6, padding: 10 }}>
                        <div style={{ color: '#ffffff80', fontSize: 7 }}>累計利息</div>
                        <div style={{ color: '#ffffff', fontSize: 16, fontWeight: 900, fontFamily: 'monospace' }}>$3,834,080</div>
                      </div>
                    </div>
                  </div>

                  {/* 大小水庫摘要 */}
                  <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: 12 }}>
                    <div style={{ color: '#0369a1', fontSize: 9, fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>💧</span> 大小水庫專案配置
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#64748b', fontSize: 7 }}>每月收入</div>
                        <div style={{ color: '#4DA3FF', fontSize: 14, fontWeight: 900 }}>$150,000</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#64748b', fontSize: 7 }}>大水庫（6個月）</div>
                        <div style={{ color: '#3b82f6', fontSize: 14, fontWeight: 900 }}>$900,000</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#64748b', fontSize: 7 }}>小水庫（彈性）</div>
                        <div style={{ color: '#10b981', fontSize: 14, fontWeight: 900 }}>$45,000</div>
                      </div>
                    </div>
                  </div>

                  {/* 財富增長預測圖 */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, flex: 1 }}>
                    <div style={{ color: '#0f172a', fontSize: 9, fontWeight: 700, marginBottom: 8 }}>📈 30年財富增長預測</div>
                    <svg width="100%" height="90" viewBox="0 0 400 90" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="areaGrad2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {[0, 1, 2, 3].map((i) => <line key={i} x1="0" y1={i * 27 + 5} x2="400" y2={i * 27 + 5} stroke="#f1f5f9" strokeWidth="1" />)}
                      <path d={`M 0,85 ${Array.from({ length: 31 }, (_, i) => `L ${i * 13.3},${85 - (i / 30) * 45}`).join(' ')} L 400,85 Z`} fill="#ef444420" />
                      <path d={`M 0,85 ${Array.from({ length: 31 }, (_, i) => `L ${i * 13.3},${85 - (i / 30) * 45}`).join(' ')}`} fill="none" stroke="#ef4444" strokeWidth="1.5" />
                      <path d={`M 0,85 ${Array.from({ length: 31 }, (_, i) => `L ${i * 13.3},${85 - Math.min(Math.pow(1.06, i) - 1, 4.5) * 18}`).join(' ')} L 400,85 Z`} fill="url(#areaGrad2)" />
                      <path d={`M 0,85 ${Array.from({ length: 31 }, (_, i) => `L ${i * 13.3},${85 - Math.min(Math.pow(1.06, i) - 1, 4.5) * 18}`).join(' ')}`} fill="none" stroke="#10b981" strokeWidth="2" />
                    </svg>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 6 }}>
                      {[{ color: '#ef4444', label: '累積支出' }, { color: '#10b981', label: '淨資產增長' }].map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: item.color }} />
                          <span style={{ fontSize: 6, color: '#64748b' }}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 策略建議 */}
                  <div style={{ background: '#10b98110', border: '1px solid #10b98130', borderRadius: 6, padding: 10 }}>
                    <div style={{ color: '#10b981', fontSize: 8, fontWeight: 700, marginBottom: 4 }}>✓ 綜合策略建議</div>
                    <div style={{ color: '#0f172a', fontSize: 7, lineHeight: 1.5 }}>
                      建議維持大水庫 90 萬作為緊急備用金，每月結餘扣除房貸後投入年化 6% 投資，30年後預估淨資產增長 <strong style={{ color: '#10b981' }}>+5,743 萬</strong>。
                    </div>
                  </div>
                </div>

                {/* 報表底 */}
                <div style={{ background: '#f8fafc', padding: '8px 18px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: 6, color: '#94a3b8' }}>
                  <div>此報表由 ULTRA ADVISOR AI 自動生成</div>
                  <div>ultra-advisor.tw</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== 結尾區域 ==================== */}
        {showOutro && (
          <div
            style={{
              position: 'absolute',
              left: width / 2 + regions.outro.x,
              top: height / 2 + regions.outro.y,
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              opacity: interpolate(frame, [1150, 1200], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            }}
          >
            <div style={{ transform: `scale(${interpolate(frame, [1200, 1260], [0.8, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.2)) })})` }}>
              <Logo scale={1.1} />
            </div>
            <div style={{ marginTop: 30, fontSize: 48, fontWeight: 900, color: '#ffffff', letterSpacing: 12, textShadow: '0 0 35px #4DA3FF60', opacity: interpolate(frame, [1230, 1280], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), transform: `translateY(${interpolate(frame, [1230, 1290], [25, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })}px)` }}>
              ULTRA ADVISOR
            </div>
            <div style={{ marginTop: 12, fontSize: 16, fontWeight: 600, color: '#4DA3FF', letterSpacing: 4, opacity: interpolate(frame, [1260, 1300], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
              讓數據替你說話
            </div>
            <div style={{ marginTop: 35, fontSize: 13, color: '#64748b', letterSpacing: 3, opacity: interpolate(frame, [1285, 1318], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
              ultra-advisor.tw
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
