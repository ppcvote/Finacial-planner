import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Sequence,
} from 'remotion';

// ============================================
// 高速粒子流背景
// ============================================
const SpeedParticles: React.FC<{ intensity?: number }> = ({ intensity = 1 }) => {
  const frame = useCurrentFrame();

  const particles = Array.from({ length: 80 }, (_, i) => {
    const baseSpeed = 3 + (i % 5) * 2;
    const x = ((i * 73 + frame * baseSpeed * intensity) % 2200) - 140;
    const y = 100 + (i * 47) % 880;
    const length = 40 + (i % 4) * 30;
    const opacity = 0.15 + (i % 5) * 0.08;
    const hue = 200 + (i % 3) * 30; // 藍紫色系
    return { x, y, length, opacity, hue };
  });

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: p.length,
            height: 2,
            background: `linear-gradient(90deg, transparent, hsl(${p.hue}, 80%, 60%), transparent)`,
            opacity: p.opacity,
            borderRadius: 1,
          }}
        />
      ))}
    </div>
  );
};

// ============================================
// 脈衝圓環效果
// ============================================
const PulseRing: React.FC<{ delay?: number; color?: string; size?: number }> = ({
  delay = 0,
  color = '#4DA3FF',
  size = 400,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, stiffness: 30 },
  });

  const scale = interpolate(progress, [0, 1], [0.3, 1.5]);
  const opacity = interpolate(progress, [0, 0.3, 1], [0, 0.8, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        border: `3px solid ${color}`,
        transform: `scale(${scale})`,
        opacity,
        boxShadow: `0 0 40px ${color}60, inset 0 0 40px ${color}30`,
      }}
    />
  );
};

// ============================================
// 動態 Logo（加速版）
// ============================================
const AnimatedLogoFast: React.FC<{ delay?: number; scale?: number }> = ({ delay = 0, scale = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 更快的繪製速度
  const blueProgress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  const redProgress = spring({
    frame: frame - delay - 5,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  const purpleProgress = spring({
    frame: frame - delay - 10,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  // 整體脈動效果
  const pulse = 1 + Math.sin(frame * 0.1) * 0.02;

  const blueLength = 450;
  const redLength = 450;
  const purpleLength = 140;

  return (
    <div style={{ transform: `scale(${pulse})` }}>
      <svg
        width={320 * scale}
        height={420 * scale}
        viewBox="0 0 320 420"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="gradBlue" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4DA3FF" />
            <stop offset="100%" stopColor="#2E6BFF" />
          </linearGradient>
          <linearGradient id="gradRed" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF6A6A" />
            <stop offset="100%" stopColor="#FF3A3A" />
          </linearGradient>
          {/* 正確的紫色線 gradient - 與 SplashScreen 一致 */}
          <linearGradient id="gradPurple" gradientUnits="userSpaceOnUse" x1="91.5" y1="314" x2="228.5" y2="314">
            <stop offset="0%" stopColor="#8A5CFF" stopOpacity="0" />
            <stop offset="20%" stopColor="#CE4DFF" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#E8E0FF" stopOpacity="1" />
            <stop offset="80%" stopColor="#CE4DFF" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#8A5CFF" stopOpacity="0" />
          </linearGradient>
          {/* 紫色線發光效果 */}
          <filter id="purple-glow" filterUnits="userSpaceOnUse" x="-50%" y="-50%" width="200%" height="200%">
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
          <filter id="neon-blue">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="neon-red">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Blue Curve */}
        <path
          d="M 90,40 C 90,160 130,220 242,380"
          fill="none"
          stroke="url(#gradBlue)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={blueLength}
          strokeDashoffset={blueLength * (1 - blueProgress)}
          filter="url(#neon-blue)"
        />

        {/* Red Curve */}
        <path
          d="M 230,40 C 230,160 190,220 78,380"
          fill="none"
          stroke="url(#gradRed)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={redLength}
          strokeDashoffset={redLength * (1 - redProgress)}
          filter="url(#neon-red)"
        />

        {/* Purple Line - 使用正確的 gradient 和 filter */}
        <path
          d="M 91.5,314 L 228.5,314"
          fill="none"
          stroke="url(#gradPurple)"
          strokeWidth="10.2"
          strokeLinecap="round"
          strokeDasharray={purpleLength}
          strokeDashoffset={purpleLength * (1 - purpleProgress)}
          filter="url(#purple-glow)"
        />
      </svg>
    </div>
  );
};

// ============================================
// 衝擊文字效果
// ============================================
const ImpactText: React.FC<{
  children: string;
  delay?: number;
  fontSize?: number;
  color?: string;
  glowColor?: string;
}> = ({ children, delay = 0, fontSize = 72, color = '#ffffff', glowColor = '#4DA3FF' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 快速彈入
  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 200 },
  });

  const scale = interpolate(enter, [0, 1], [1.5, 1]);
  const opacity = interpolate(enter, [0, 0.3, 1], [0, 1, 1]);
  const blur = interpolate(enter, [0, 1], [10, 0]);

  return (
    <div
      style={{
        fontSize,
        color,
        fontWeight: 900,
        transform: `scale(${scale})`,
        opacity,
        filter: `blur(${blur}px)`,
        textShadow: `0 0 40px ${glowColor}, 0 0 80px ${glowColor}50`,
        letterSpacing: 4,
      }}
    >
      {children}
    </div>
  );
};

// ============================================
// 滑入文字
// ============================================
const SlideText: React.FC<{
  children: string;
  delay?: number;
  fontSize?: number;
  color?: string;
  direction?: 'left' | 'right' | 'up';
}> = ({ children, delay = 0, fontSize = 24, color = '#ffffff', direction = 'left' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slide = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, stiffness: 150 },
  });

  const getTransform = () => {
    if (direction === 'left') return `translateX(${interpolate(slide, [0, 1], [-100, 0])}px)`;
    if (direction === 'right') return `translateX(${interpolate(slide, [0, 1], [100, 0])}px)`;
    return `translateY(${interpolate(slide, [0, 1], [50, 0])}px)`;
  };

  const opacity = interpolate(slide, [0, 0.5, 1], [0, 1, 1]);

  return (
    <div
      style={{
        fontSize,
        color,
        fontWeight: 600,
        transform: getTransform(),
        opacity,
      }}
    >
      {children}
    </div>
  );
};

// ============================================
// 數據流動條
// ============================================
const DataStream: React.FC<{ delay?: number; label: string; value: string; color: string }> = ({
  delay = 0,
  label,
  value,
  color,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 25, stiffness: 100 },
  });

  const width = interpolate(progress, [0, 1], [0, 100]);
  const opacity = interpolate(frame - delay, [0, 10], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <div style={{ opacity, marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ color: '#94a3b8', fontSize: 16 }}>{label}</span>
        <span style={{ color, fontSize: 20, fontWeight: 700, fontFamily: 'monospace' }}>{value}</span>
      </div>
      <div
        style={{
          height: 6,
          background: '#1e293b',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${width}%`,
            background: `linear-gradient(90deg, ${color}80, ${color})`,
            borderRadius: 3,
            boxShadow: `0 0 20px ${color}`,
          }}
        />
      </div>
    </div>
  );
};

// ============================================
// 速度線效果
// ============================================
const SpeedLines: React.FC<{ active?: boolean }> = ({ active = true }) => {
  const frame = useCurrentFrame();

  if (!active) return null;

  const lines = Array.from({ length: 30 }, (_, i) => {
    const y = 50 + (i * 37) % 980;
    const length = 100 + (i % 5) * 80;
    const speed = 20 + (i % 4) * 10;
    const x = ((frame * speed) % 2400) - 200;
    const opacity = 0.1 + (i % 4) * 0.05;
    return { x, y, length, opacity };
  });

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: line.x,
            top: line.y,
            width: line.length,
            height: 1,
            background: 'linear-gradient(90deg, transparent, #4DA3FF, transparent)',
            opacity: line.opacity,
          }}
        />
      ))}
    </div>
  );
};

// ============================================
// 主要影片組件 - 動感酷炫版
// ============================================
export const UltraAdvisorBrandVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: '#050b14',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* 動態背景 */}
      <SpeedParticles intensity={1 + frame * 0.001} />

      {/* ========== Scene 1: 極速開場 (0-2s) ========== */}
      <Sequence from={0} durationInFrames={120}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SpeedLines />
          {/* 多重脈衝環 */}
          <div style={{ position: 'absolute' }}>
            <PulseRing delay={0} color="#4DA3FF" size={300} />
            <PulseRing delay={10} color="#FF3A3A" size={400} />
            <PulseRing delay={20} color="#8B5CF6" size={500} />
          </div>
          <AnimatedLogoFast delay={15} scale={0.7} />
        </AbsoluteFill>
      </Sequence>

      {/* ========== Scene 2: 品牌揭示 (2-4s) ========== */}
      <Sequence from={120} durationInFrames={120}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ImpactText delay={0} fontSize={80} glowColor="#4DA3FF">
            ULTRA ADVISOR
          </ImpactText>
          <div style={{ height: 20 }} />
          <SlideText delay={20} fontSize={20} color="#4DA3FF" direction="up">
            台灣最強財務視覺化平台
          </SlideText>
        </AbsoluteFill>
      </Sequence>

      {/* ========== Scene 3: 速度概念 (4-6.5s) ========== */}
      <Sequence from={240} durationInFrames={150}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SpeedLines />
          <SlideText delay={0} fontSize={28} color="#ef4444" direction="left">
            在這個時代
          </SlideText>
          <div style={{ height: 30 }} />
          <ImpactText delay={20} fontSize={72} glowColor="#ef4444">
            風險不等人
          </ImpactText>
          <div style={{ height: 40 }} />
          <SlideText delay={50} fontSize={32} color="#94a3b8" direction="right">
            財務顧問必須跑在客戶風險的前面
          </SlideText>
        </AbsoluteFill>
      </Sequence>

      {/* ========== Scene 4: 速度對比 (6.5-9s) ========== */}
      <Sequence from={390} durationInFrames={150}>
        <AbsoluteFill style={{ padding: 100 }}>
          <div style={{ display: 'flex', height: '100%' }}>
            {/* 左側：傳統方式 */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                paddingRight: 60,
                borderRight: '2px solid #1e293b',
              }}
            >
              <SlideText delay={0} fontSize={20} color="#ef4444" direction="left">
                傳統提案
              </SlideText>
              <div style={{ height: 20 }} />
              <ImpactText delay={10} fontSize={48} color="#475569" glowColor="#ef4444">
                60 分鐘
              </ImpactText>
              <div style={{ height: 20 }} />
              <SlideText delay={30} fontSize={18} color="#64748b" direction="left">
                口頭講解、手繪圖表
              </SlideText>
              <SlideText delay={40} fontSize={18} color="#64748b" direction="left">
                客戶「再考慮看看」
              </SlideText>
            </div>

            {/* 右側：Ultra Advisor */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                paddingLeft: 60,
              }}
            >
              <SlideText delay={50} fontSize={20} color="#10b981" direction="right">
                ULTRA ADVISOR
              </SlideText>
              <div style={{ height: 20 }} />
              <ImpactText delay={60} fontSize={64} color="#10b981" glowColor="#10b981">
                3 秒出圖
              </ImpactText>
              <div style={{ height: 20 }} />
              <SlideText delay={80} fontSize={18} color="#94a3b8" direction="right">
                視覺化圖表、一鍵生成
              </SlideText>
              <SlideText delay={90} fontSize={18} color="#10b981" direction="right">
                客戶「這就是我要的！」
              </SlideText>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ========== Scene 5: 分水嶺 (9-11.5s) ========== */}
      <Sequence from={540} durationInFrames={150}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SlideText delay={0} fontSize={24} color="#f59e0b" direction="up">
            財務視覺化
          </SlideText>
          <div style={{ height: 30 }} />
          <ImpactText delay={20} fontSize={96} glowColor="#f59e0b">
            分水嶺
          </ImpactText>
          <div style={{ height: 50 }} />
          <div style={{ display: 'flex', gap: 100, marginTop: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <SlideText delay={50} fontSize={56} color="#ef4444" direction="left">
                ←
              </SlideText>
              <SlideText delay={60} fontSize={18} color="#64748b" direction="left">
                被淘汰的顧問
              </SlideText>
            </div>
            <div style={{ width: 4, background: 'linear-gradient(180deg, #f59e0b, transparent)' }} />
            <div style={{ textAlign: 'center' }}>
              <SlideText delay={50} fontSize={56} color="#10b981" direction="right">
                →
              </SlideText>
              <SlideText delay={60} fontSize={18} color="#94a3b8" direction="right">
                頂尖的顧問
              </SlideText>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ========== Scene 6: 數據展示 (11.5-14s) ========== */}
      <Sequence from={690} durationInFrames={150}>
        <AbsoluteFill style={{ padding: 100 }}>
          <div style={{ display: 'flex', gap: 80, height: '100%' }}>
            {/* 左側：數據 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <SlideText delay={0} fontSize={20} color="#4DA3FF" direction="left">
                實測數據
              </SlideText>
              <div style={{ height: 40 }} />
              <DataStream delay={20} label="成交率提升" value="+40%" color="#10b981" />
              <DataStream delay={40} label="提案時間縮短" value="-25%" color="#4DA3FF" />
              <DataStream delay={60} label="客戶記憶留存" value="6.5x" color="#f59e0b" />
              <DataStream delay={80} label="專業工具數量" value="18+" color="#8B5CF6" />
            </div>

            {/* 右側：視覺 */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AnimatedLogoFast delay={30} scale={0.5} />
              <div style={{ height: 30 }} />
              <SlideText delay={100} fontSize={24} color="#ffffff" direction="up">
                讓數據為你說話
              </SlideText>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ========== Scene 7: CTA 結尾 (14-17s) ========== */}
      <Sequence from={840} durationInFrames={180}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SpeedLines />
          <PulseRing delay={0} color="#4DA3FF" size={600} />
          <PulseRing delay={20} color="#8B5CF6" size={700} />

          <AnimatedLogoFast delay={0} scale={0.55} />
          <div style={{ height: 20 }} />
          <ImpactText delay={30} fontSize={56} glowColor="#4DA3FF">
            ULTRA ADVISOR
          </ImpactText>
          <div style={{ height: 30 }} />

          {/* CTA 按鈕 */}
          <div
            style={{
              opacity: interpolate(frame - 900, [0, 30], [0, 1], { extrapolateRight: 'clamp' }),
              transform: `scale(${interpolate(frame - 900, [0, 30], [0.8, 1], { extrapolateRight: 'clamp' })})`,
              background: 'linear-gradient(90deg, #4DA3FF, #8B5CF6, #FF3A3A)',
              padding: '24px 80px',
              borderRadius: 60,
              fontSize: 28,
              fontWeight: 800,
              color: '#ffffff',
              boxShadow: '0 0 40px #4DA3FF60',
              letterSpacing: 2,
            }}
          >
            立即體驗 →
          </div>

          <div style={{ height: 40 }} />
          <SlideText delay={80} fontSize={18} color="#64748b" direction="up">
            ultraadvisor.com.tw
          </SlideText>
        </AbsoluteFill>
      </Sequence>

      {/* 底部浮水印 */}
      <div
        style={{
          position: 'absolute',
          bottom: 30,
          right: 40,
          opacity: 0.3,
          color: '#64748b',
          fontSize: 12,
        }}
      >
        ULTRA ADVISOR © 2024
      </div>
    </AbsoluteFill>
  );
};

export default UltraAdvisorBrandVideo;
