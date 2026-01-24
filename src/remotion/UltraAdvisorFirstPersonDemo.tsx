import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';

// ============================================
// Ultra Advisor 第一人稱視角宣傳片 v9
//
// 【一鏡到底設計 + 傳統業務對比】
// 流程：開場 → 傳統業務痛點 → vs Ultra Advisor → 戰情室 → 試算 → 報表 → 結尾
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
  // 0-120: 開場 Logo
  // 120-320: 傳統業務痛點
  // 320-480: vs Ultra Advisor 對比轉場
  // 480-650: 市場戰情室
  // 650-900: 金融房產 + 大小水庫試算
  // 900-1120: 報表生成 + A4報表展示
  // 1120-1320: 結尾

  // ============================================
  // 鏡頭運動
  // ============================================
  const cameraZoom = interpolate(
    frame,
    [0, 120, 320, 480, 650, 900, 1120, 1320],
    [1, 1.1, 1.2, 1.3, 1.25, 1.2, 1, 1.05],
    { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) }
  );

  const cameraX = interpolate(
    frame,
    [0, 120, 320, 480, 650, 900, 1120, 1320],
    [0, -300, 0, 300, -350, 0, 0, 0],
    { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) }
  );

  const cameraY = interpolate(
    frame,
    [0, 120, 320, 480, 650, 900, 1120, 1320],
    [0, 200, 0, 200, 50, 350, 0, 0],
    { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) }
  );

  // ============================================
  // 各區域位置定義
  // ============================================
  const regions = {
    intro: { x: 0, y: 0 },
    traditional: { x: -300, y: 200 },
    comparison: { x: 0, y: 0 },
    dashboard: { x: 300, y: 200 },
    calculators: { x: -350, y: 50 },
    report: { x: 0, y: 350 },
    outro: { x: 0, y: 0 },
  };

  // ============================================
  // 元素可見性
  // ============================================
  const showIntro = frame < 180;
  const showTraditional = frame >= 80 && frame < 400;
  const showComparison = frame >= 280 && frame < 550;
  const showDashboard = frame >= 420 && frame < 720;
  const showCalculators = frame >= 600 && frame < 980;
  const showReport = frame >= 860 && frame < 1200;
  const showOutro = frame >= 1080;

  // ============================================
  // 動畫進度
  // ============================================
  const introFadeOut = interpolate(frame, [100, 150], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // 傳統業務痛點列表
  const traditionalPains = [
    { icon: '📋', title: '紙本作業', desc: '大量表格、容易出錯', time: 0 },
    { icon: '📊', title: 'Excel 試算', desc: '公式複雜、難以維護', time: 25 },
    { icon: '⏰', title: '耗時費力', desc: '每份報表花費 30+ 分鐘', time: 50 },
    { icon: '😰', title: '客戶等待', desc: '當場無法給出精確數據', time: 75 },
  ];

  // Ultra Advisor 優勢
  const ultraAdvantages = [
    { icon: '⚡', title: '即時試算', desc: '秒速呈現精準數據', color: '#4DA3FF' },
    { icon: '🎯', title: '視覺化呈現', desc: '圖表讓客戶一目了然', color: '#10b981' },
    { icon: '📱', title: '隨時隨地', desc: '手機平板都能用', color: '#8b5cf6' },
    { icon: '📄', title: '一鍵出圖', desc: '專業報表 3 秒生成', color: '#f59e0b' },
  ];

  // 戰情室工具列表
  const dashboardTools = [
    { icon: '📈', name: '通膨指數', value: '3.2%', color: '#ef4444' },
    { icon: '💰', name: '利率水準', value: '2.2%', color: '#3b82f6' },
    { icon: '📊', name: '市場波動', value: '中等', color: '#f59e0b' },
    { icon: '🏠', name: '房價指數', value: '+8.5%', color: '#10b981' },
  ];

  // 計算器動畫
  const calcProgress = interpolate(frame, [720, 880], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const loanAmount = interpolate(calcProgress, [0, 1], [500, 1000]);
  const rate = interpolate(calcProgress, [0, 1], [1.5, 2.2]);
  const years = interpolate(calcProgress, [0, 1], [20, 30]);
  const monthlyPayment = Math.round((loanAmount * 10000 * (rate / 100 / 12) * Math.pow(1 + rate / 100 / 12, years * 12)) / (Math.pow(1 + rate / 100 / 12, years * 12) - 1));
  const totalInterest = Math.round(monthlyPayment * years * 12 - loanAmount * 10000);

  const monthlyIncome = interpolate(calcProgress, [0, 1], [80000, 150000]);
  const bigReservoir = Math.round(monthlyIncome * 6);
  const smallReservoir = Math.round(monthlyIncome * 0.3);
  const waterLevel = interpolate(frame, [720, 880], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });

  // 報表進度
  const reportProgress = interpolate(frame, [940, 1020], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const isGenerating = frame >= 940 && frame < 1020;
  const isComplete = frame >= 1020;

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
      {/* 場景容器 */}
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
            <div style={{ transform: `scale(${interpolate(frame, [10, 50], [0.5, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.5)) })})`, opacity: interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
              <Logo scale={0.9} />
            </div>
            <div style={{ marginTop: 25, fontSize: 42, fontWeight: 900, color: '#ffffff', letterSpacing: 8, textShadow: '0 0 30px #4DA3FF50', opacity: interpolate(frame, [40, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), transform: `translateY(${interpolate(frame, [40, 80], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)` }}>
              ULTRA ADVISOR
            </div>
          </div>
        )}

        {/* ==================== 傳統業務痛點 ==================== */}
        {showTraditional && (
          <div
            style={{
              position: 'absolute',
              left: width / 2 + regions.traditional.x,
              top: height / 2 + regions.traditional.y,
              transform: 'translate(-50%, -50%)',
              opacity: interpolate(frame, [80, 140, 340, 400], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            }}
          >
            <div style={{ fontSize: 32, fontWeight: 900, color: '#ef4444', marginBottom: 8, textAlign: 'center', transform: `translateY(${interpolate(frame, [100, 150], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)` }}>
              😫 傳統業務的痛
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 25, textAlign: 'center', opacity: interpolate(frame, [120, 160], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
              每位顧問都經歷過的困擾...
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, width: 500 }}>
              {traditionalPains.map((pain, i) => {
                const itemStart = 140 + pain.time;
                const itemOpacity = interpolate(frame, [itemStart, itemStart + 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                const itemScale = interpolate(frame, [itemStart, itemStart + 50], [0.8, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.2)) });

                return (
                  <div key={i} style={{ background: 'linear-gradient(135deg, #1e1e1e, #2a2a2a)', borderRadius: 14, padding: 18, border: '2px solid #ef444440', opacity: itemOpacity, transform: `scale(${itemScale})`, boxShadow: '0 10px 30px rgba(239, 68, 68, 0.1)' }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{pain.icon}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#ffffff', marginBottom: 4 }}>{pain.title}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{pain.desc}</div>
                  </div>
                );
              })}
            </div>

            {/* X 標記動畫 */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 120, color: '#ef4444', opacity: interpolate(frame, [300, 340], [0, 0.3], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), pointerEvents: 'none' }}>
              ✕
            </div>
          </div>
        )}

        {/* ==================== VS 對比轉場 ==================== */}
        {showComparison && (
          <div
            style={{
              position: 'absolute',
              left: width / 2 + regions.comparison.x,
              top: height / 2 + regions.comparison.y,
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              opacity: interpolate(frame, [280, 340, 480, 550], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            }}
          >
            {/* VS 文字 */}
            <div style={{ fontSize: 80, fontWeight: 900, marginBottom: 20, opacity: interpolate(frame, [320, 360], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), transform: `scale(${interpolate(frame, [320, 380], [0.5, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.5)) })})` }}>
              <span style={{ color: '#ef4444' }}>傳統</span>
              <span style={{ color: '#64748b', margin: '0 20px' }}>vs</span>
              <span style={{ color: '#4DA3FF' }}>智能</span>
            </div>

            {/* 對比表格 */}
            <div style={{ display: 'flex', gap: 30, justifyContent: 'center', opacity: interpolate(frame, [360, 420], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
              {/* 傳統 */}
              <div style={{ width: 280, background: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)', borderRadius: 16, padding: 20, border: '2px solid #ef444430' }}>
                <div style={{ fontSize: 14, color: '#ef4444', fontWeight: 700, marginBottom: 15 }}>❌ 傳統方式</div>
                {[
                  { label: '試算時間', value: '30+ 分鐘' },
                  { label: '出錯機率', value: '高' },
                  { label: '報表品質', value: '參差不齊' },
                  { label: '客戶體驗', value: '⭐⭐' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #333' }}>
                    <span style={{ color: '#94a3b8', fontSize: 12 }}>{item.label}</span>
                    <span style={{ color: '#ef4444', fontSize: 12, fontWeight: 700 }}>{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Ultra Advisor */}
              <div style={{ width: 280, background: 'linear-gradient(135deg, #0a1628, #1a2744)', borderRadius: 16, padding: 20, border: '2px solid #4DA3FF50', boxShadow: '0 0 40px #4DA3FF20' }}>
                <div style={{ fontSize: 14, color: '#4DA3FF', fontWeight: 700, marginBottom: 15 }}>✓ Ultra Advisor</div>
                {[
                  { label: '試算時間', value: '3 秒' },
                  { label: '出錯機率', value: '零' },
                  { label: '報表品質', value: '專業統一' },
                  { label: '客戶體驗', value: '⭐⭐⭐⭐⭐' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #334155' }}>
                    <span style={{ color: '#94a3b8', fontSize: 12 }}>{item.label}</span>
                    <span style={{ color: '#10b981', fontSize: 12, fontWeight: 700 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 優勢標籤 */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 25, opacity: interpolate(frame, [420, 470], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
              {ultraAdvantages.map((adv, i) => (
                <div key={i} style={{ padding: '8px 16px', background: `${adv.color}20`, border: `1px solid ${adv.color}50`, borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6, transform: `translateY(${interpolate(frame, [420 + i * 15, 470 + i * 15], [15, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)` }}>
                  <span style={{ fontSize: 14 }}>{adv.icon}</span>
                  <span style={{ color: adv.color, fontSize: 11, fontWeight: 700 }}>{adv.title}</span>
                </div>
              ))}
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
              width: 700,
              opacity: interpolate(frame, [420, 500, 650, 720], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            }}
          >
            <div style={{ fontSize: 32, fontWeight: 900, color: '#ffffff', marginBottom: 8, textShadow: '0 0 25px #4DA3FF40', transform: `translateX(${interpolate(frame, [460, 520], [-80, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })}px)` }}>
              📊 市場戰情室
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 25, opacity: interpolate(frame, [480, 530], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
              即時監控市場數據，智能調整策略
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              {dashboardTools.map((tool, i) => {
                const delay = i * 25;
                const itemOpacity = interpolate(frame, [500 + delay, 550 + delay], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                const itemScale = interpolate(frame, [500 + delay, 560 + delay], [0.7, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.2)) });

                return (
                  <div key={i} style={{ height: 100, background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: 12, border: `2px solid ${tool.color}50`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `scale(${itemScale})`, opacity: itemOpacity, boxShadow: `0 10px 30px ${tool.color}15` }}>
                    <div style={{ fontSize: 24, marginBottom: 5 }}>{tool.icon}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 3 }}>{tool.name}</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: tool.color, fontFamily: 'monospace' }}>{tool.value}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 20, padding: '10px 20px', background: 'linear-gradient(135deg, #10b98120, #10b98110)', border: '1px solid #10b98150', borderRadius: 10, opacity: interpolate(frame, [600, 640], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
              <span style={{ color: '#10b981', fontSize: 16 }}>✓</span>
              <span style={{ color: '#ffffff', fontSize: 12, fontWeight: 700 }}>數據即時同步，進入試算模組</span>
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
              gap: 35,
              opacity: interpolate(frame, [600, 680, 900, 980], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            }}
          >
            {/* 左側：金融房產試算 */}
            <div style={{ width: 400 }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#ffffff', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10, transform: `translateX(${interpolate(frame, [640, 700], [-60, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })}px)` }}>
                <span style={{ fontSize: 28 }}>🏠</span>
                <span>金融房產專案</span>
              </div>

              {[
                { label: '貸款金額', value: `${Math.round(loanAmount)} 萬`, progress: (loanAmount - 500) / 500, color: '#3b82f6' },
                { label: '年利率', value: `${rate.toFixed(1)} %`, progress: (rate - 1.5) / 0.7, color: '#10b981' },
                { label: '貸款年期', value: `${Math.round(years)} 年`, progress: (years - 20) / 10, color: '#f59e0b' },
              ].map((item, i) => {
                const itemOpacity = interpolate(frame, [680 + i * 30, 720 + i * 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                return (
                  <div key={i} style={{ marginBottom: 16, opacity: itemOpacity }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ color: '#64748b', fontSize: 11, fontWeight: 600 }}>{item.label}</span>
                      <span style={{ color: item.color, fontSize: 20, fontWeight: 900, fontFamily: 'monospace' }}>{item.value}</span>
                    </div>
                    <div style={{ height: 5, background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.max(0, item.progress) * 100}%`, background: `linear-gradient(90deg, ${item.color}80, ${item.color})`, borderRadius: 3 }} />
                    </div>
                  </div>
                );
              })}

              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                <div style={{ flex: 1, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', borderRadius: 12, padding: 14, opacity: interpolate(frame, [780, 820], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
                  <div style={{ color: '#ffffff80', fontSize: 10, marginBottom: 3 }}>每月還款</div>
                  <div style={{ color: '#ffffff', fontSize: 22, fontWeight: 900, fontFamily: 'monospace' }}>${monthlyPayment.toLocaleString()}</div>
                </div>
                <div style={{ flex: 1, background: 'linear-gradient(135deg, #ef4444, #dc2626)', borderRadius: 12, padding: 14, opacity: interpolate(frame, [800, 840], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
                  <div style={{ color: '#ffffff80', fontSize: 10, marginBottom: 3 }}>累計利息</div>
                  <div style={{ color: '#ffffff', fontSize: 22, fontWeight: 900, fontFamily: 'monospace' }}>${totalInterest.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* 右側：大小水庫專案 */}
            <div style={{ width: 360 }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#ffffff', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10, transform: `translateX(${interpolate(frame, [680, 740], [60, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })}px)` }}>
                <span style={{ fontSize: 28 }}>💧</span>
                <span>大小水庫專案</span>
              </div>

              <div style={{ marginBottom: 20, opacity: interpolate(frame, [700, 750], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: '#64748b', fontSize: 11, fontWeight: 600 }}>每月收入</span>
                  <span style={{ color: '#4DA3FF', fontSize: 20, fontWeight: 900, fontFamily: 'monospace' }}>${Math.round(monthlyIncome).toLocaleString()}</span>
                </div>
                <div style={{ height: 5, background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${((monthlyIncome - 80000) / 70000) * 100}%`, background: 'linear-gradient(90deg, #4DA3FF80, #4DA3FF)', borderRadius: 3 }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 14 }}>
                <div style={{ flex: 1, background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: 12, padding: 14, border: '2px solid #3b82f650', opacity: interpolate(frame, [760, 810], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
                  <div style={{ fontSize: 24, textAlign: 'center', marginBottom: 6 }}>🏔️</div>
                  <div style={{ color: '#94a3b8', fontSize: 9, textAlign: 'center', marginBottom: 4 }}>大水庫（6個月）</div>
                  <div style={{ color: '#3b82f6', fontSize: 18, fontWeight: 900, textAlign: 'center', fontFamily: 'monospace' }}>${bigReservoir.toLocaleString()}</div>
                  <div style={{ marginTop: 8, height: 50, background: '#0f172a', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${waterLevel * 80}%`, background: 'linear-gradient(180deg, #3b82f6, #1d4ed8)' }} />
                  </div>
                </div>

                <div style={{ flex: 1, background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: 12, padding: 14, border: '2px solid #10b98150', opacity: interpolate(frame, [780, 830], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
                  <div style={{ fontSize: 24, textAlign: 'center', marginBottom: 6 }}>🌊</div>
                  <div style={{ color: '#94a3b8', fontSize: 9, textAlign: 'center', marginBottom: 4 }}>小水庫（彈性）</div>
                  <div style={{ color: '#10b981', fontSize: 18, fontWeight: 900, textAlign: 'center', fontFamily: 'monospace' }}>${smallReservoir.toLocaleString()}</div>
                  <div style={{ marginTop: 8, height: 50, background: '#0f172a', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${waterLevel * 60}%`, background: 'linear-gradient(180deg, #10b981, #059669)' }} />
                  </div>
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
              left: width / 2 + regions.report.x,
              top: height / 2 + regions.report.y,
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              opacity: interpolate(frame, [860, 920, 1130, 1200], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            }}
          >
            {!isComplete && (
              <>
                <div style={{ fontSize: 30, fontWeight: 900, color: '#ffffff', marginBottom: 8, textShadow: '0 0 25px #10b98150', transform: `translateY(${interpolate(frame, [900, 950], [15, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)` }}>
                  一鍵生成專業報表
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 20, opacity: interpolate(frame, [920, 960], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
                  告別 Excel，3 秒出圖
                </div>

                <div style={{ display: 'inline-flex', padding: '14px 35px', background: isGenerating ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #3b82f6, #2563eb)', borderRadius: 12, fontSize: 15, fontWeight: 800, color: '#ffffff', boxShadow: isGenerating ? '0 0 40px #f59e0b50' : '0 0 30px #3b82f650', alignItems: 'center', gap: 10, transform: `scale(${interpolate(frame, [930, 970], [0.9, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })})` }}>
                  {isGenerating ? (
                    <>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', border: '3px solid transparent', borderTopColor: '#ffffff', transform: `rotate(${frame * 8}deg)` }} />
                      生成中...
                    </>
                  ) : (
                    <>📊 生成策略報表</>
                  )}
                </div>

                {isGenerating && (
                  <div style={{ width: 260, height: 5, background: '#1e293b', borderRadius: 3, marginTop: 18, overflow: 'hidden', marginLeft: 'auto', marginRight: 'auto' }}>
                    <div style={{ height: '100%', width: `${reportProgress * 100}%`, background: 'linear-gradient(90deg, #3b82f6, #10b981)', borderRadius: 3 }} />
                  </div>
                )}
              </>
            )}

            {isComplete && (
              <div style={{ width: 420, height: 580, background: '#ffffff', borderRadius: 6, boxShadow: '0 25px 70px rgba(0,0,0,0.7)', overflow: 'hidden', display: 'flex', flexDirection: 'column', marginLeft: 'auto', marginRight: 'auto', opacity: interpolate(frame, [1030, 1080], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), transform: `scale(${interpolate(frame, [1030, 1090], [0.85, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.1)) })})` }}>
                <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 24, height: 24, background: 'linear-gradient(135deg, #4DA3FF, #2E6BFF)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#fff', fontSize: 12, fontWeight: 900 }}>U</span>
                    </div>
                    <div>
                      <div style={{ color: '#ffffff', fontSize: 10, fontWeight: 800, letterSpacing: 1.5 }}>ULTRA ADVISOR</div>
                      <div style={{ color: '#4DA3FF', fontSize: 6 }}>AI 財務視覺化平台</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#ffffff', fontSize: 12, fontWeight: 900 }}>綜合財務規劃報表</div>
                    <div style={{ color: '#64748b', fontSize: 6 }}>Financial Report</div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '8px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: 7 }}>
                  <div style={{ display: 'flex', gap: 15 }}>
                    <div><span style={{ color: '#64748b' }}>客戶：</span><span style={{ color: '#0f172a', fontWeight: 700 }}>王小明</span></div>
                    <div><span style={{ color: '#64748b' }}>日期：</span><span style={{ color: '#0f172a', fontWeight: 700 }}>2024/01/15</span></div>
                  </div>
                </div>

                <div style={{ flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ background: '#0f172a', borderRadius: 6, padding: 10 }}>
                    <div style={{ color: '#ffffff', fontSize: 8, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ color: '#3b82f6' }}>🏠</span> 金融房產試算
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', borderRadius: 5, padding: 8 }}>
                        <div style={{ color: '#ffffff80', fontSize: 6 }}>每月還款</div>
                        <div style={{ color: '#ffffff', fontSize: 14, fontWeight: 900, fontFamily: 'monospace' }}>$38,428</div>
                      </div>
                      <div style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', borderRadius: 5, padding: 8 }}>
                        <div style={{ color: '#ffffff80', fontSize: 6 }}>累計利息</div>
                        <div style={{ color: '#ffffff', fontSize: 14, fontWeight: 900, fontFamily: 'monospace' }}>$3,834,080</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 6, padding: 10 }}>
                    <div style={{ color: '#0369a1', fontSize: 8, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span>💧</span> 大小水庫配置
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#64748b', fontSize: 6 }}>每月收入</div>
                        <div style={{ color: '#4DA3FF', fontSize: 12, fontWeight: 900 }}>$150,000</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#64748b', fontSize: 6 }}>大水庫</div>
                        <div style={{ color: '#3b82f6', fontSize: 12, fontWeight: 900 }}>$900,000</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#64748b', fontSize: 6 }}>小水庫</div>
                        <div style={{ color: '#10b981', fontSize: 12, fontWeight: 900 }}>$45,000</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: 10, flex: 1 }}>
                    <div style={{ color: '#0f172a', fontSize: 8, fontWeight: 700, marginBottom: 6 }}>📈 30年財富預測</div>
                    <svg width="100%" height="70" viewBox="0 0 380 70" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="areaGrad3" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {[0, 1, 2, 3].map((i) => <line key={i} x1="0" y1={i * 22 + 5} x2="380" y2={i * 22 + 5} stroke="#f1f5f9" strokeWidth="1" />)}
                      <path d={`M 0,65 ${Array.from({ length: 31 }, (_, i) => `L ${i * 12.6},${65 - (i / 30) * 35}`).join(' ')} L 380,65 Z`} fill="#ef444420" />
                      <path d={`M 0,65 ${Array.from({ length: 31 }, (_, i) => `L ${i * 12.6},${65 - (i / 30) * 35}`).join(' ')}`} fill="none" stroke="#ef4444" strokeWidth="1.2" />
                      <path d={`M 0,65 ${Array.from({ length: 31 }, (_, i) => `L ${i * 12.6},${65 - Math.min(Math.pow(1.06, i) - 1, 4) * 15}`).join(' ')} L 380,65 Z`} fill="url(#areaGrad3)" />
                      <path d={`M 0,65 ${Array.from({ length: 31 }, (_, i) => `L ${i * 12.6},${65 - Math.min(Math.pow(1.06, i) - 1, 4) * 15}`).join(' ')}`} fill="none" stroke="#10b981" strokeWidth="1.5" />
                    </svg>
                  </div>

                  <div style={{ background: '#10b98110', border: '1px solid #10b98130', borderRadius: 5, padding: 8 }}>
                    <div style={{ color: '#10b981', fontSize: 7, fontWeight: 700, marginBottom: 3 }}>✓ 策略建議</div>
                    <div style={{ color: '#0f172a', fontSize: 6, lineHeight: 1.4 }}>
                      建議維持大水庫 90 萬作為緊急備用金，30年後預估淨資產增長 <strong style={{ color: '#10b981' }}>+5,743 萬</strong>
                    </div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '6px 16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: 5, color: '#94a3b8' }}>
                  <div>ULTRA ADVISOR AI 自動生成</div>
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
              opacity: interpolate(frame, [1080, 1140], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            }}
          >
            <div style={{ transform: `scale(${interpolate(frame, [1140, 1200], [0.8, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.2)) })})` }}>
              <Logo scale={1} />
            </div>
            <div style={{ marginTop: 25, fontSize: 44, fontWeight: 900, color: '#ffffff', letterSpacing: 10, textShadow: '0 0 35px #4DA3FF60', opacity: interpolate(frame, [1180, 1230], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), transform: `translateY(${interpolate(frame, [1180, 1240], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)` }}>
              ULTRA ADVISOR
            </div>
            <div style={{ marginTop: 10, fontSize: 15, fontWeight: 600, color: '#4DA3FF', letterSpacing: 3, opacity: interpolate(frame, [1220, 1260], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
              讓數據替你說話
            </div>

            {/* 核心價值標語 */}
            <div style={{ marginTop: 30, display: 'flex', gap: 20, opacity: interpolate(frame, [1250, 1290], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
              {[
                { icon: '⚡', text: '秒速試算' },
                { icon: '📊', text: '視覺呈現' },
                { icon: '📄', text: '一鍵出圖' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: '#4DA3FF15', borderRadius: 20, border: '1px solid #4DA3FF30' }}>
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                  <span style={{ color: '#4DA3FF', fontSize: 11, fontWeight: 700 }}>{item.text}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 25, fontSize: 12, color: '#64748b', letterSpacing: 2, opacity: interpolate(frame, [1280, 1315], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
              ultra-advisor.tw
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
