import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  Easing,
} from 'remotion';

// ============================================
// Ultra Advisor 60 秒系統示範影片 v4
//
// 【真實功能演示版】
// - 展示真實的計算過程和數據視覺化
// - 複利曲線、水庫水位、房貸計算等動態效果
// - 每個功能都有實際數據在跑
// ============================================

// ============================================
// 時間軸（60秒 = 3600 frames @ 60fps）
// ============================================
// 0-180 (0-3s):      開場 Logo + 18種工具
// 180-420 (3-7s):    痛點 + 轉折
// 420-1020 (7-17s):  複利計算機演示（10秒）
// 1020-1620 (17-27s): 大小水庫對比（10秒）
// 1620-2100 (27-35s): 房貸計算演示（8秒）
// 2100-2580 (35-43s): 一鍵出圖（8秒）
// 2580-3000 (43-50s): 18工具矩陣（7秒）
// 3000-3600 (50-60s): CTA（10秒）

// ============================================
// 品牌配色
// ============================================
const colors = {
  bg: '#030712',
  primary: '#4DA3FF',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  cyan: '#06b6d4',
  text: '#ffffff',
  muted: '#64748b',
  card: '#0f172a',
  border: '#334155',
};

// ============================================
// Logo 組件
// ============================================
const Logo: React.FC<{ scale?: number }> = ({ scale = 1 }) => {
  const frame = useCurrentFrame();
  const glow = 1 + Math.sin(frame * 0.06) * 0.15;

  return (
    <div style={{ transform: `scale(${scale})`, filter: `drop-shadow(0 0 ${30 * glow}px ${colors.primary}50)` }}>
      <svg width={180} height={240} viewBox="0 0 320 420">
        <defs>
          <linearGradient id="logoBlue" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4DA3FF" />
            <stop offset="100%" stopColor="#2E6BFF" />
          </linearGradient>
          <linearGradient id="logoRed" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF6A6A" />
            <stop offset="100%" stopColor="#FF3A3A" />
          </linearGradient>
        </defs>
        <path d="M 90,40 C 90,160 130,220 242,380" fill="none" stroke="url(#logoBlue)" strokeWidth="14" strokeLinecap="round" />
        <path d="M 230,40 C 230,160 190,220 78,380" fill="none" stroke="url(#logoRed)" strokeWidth="14" strokeLinecap="round" />
        <path d="M 91.5,314 L 228.5,314" fill="none" stroke="#CE4DFF" strokeWidth="10" strokeLinecap="round" opacity="0.8" />
      </svg>
    </div>
  );
};

// ============================================
// 動態背景
// ============================================
const DynamicBackground: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <>
      {/* 網格 */}
      <div
        style={{
          position: 'absolute',
          inset: -100,
          backgroundImage: `
            linear-gradient(rgba(77, 163, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(77, 163, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          backgroundPosition: `${(frame * 0.3) % 60}px ${(frame * 0.3) % 60}px`,
        }}
      />
      {/* 暗角 */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.8) 100%)',
        pointerEvents: 'none',
      }} />
    </>
  );
};

// ============================================
// 場景1: 開場 (0-3s)
// 轉場：縮放穿越 - Logo 放大穿過鏡頭
// ============================================
const IntroScene: React.FC<{ progress: number }> = ({ progress }) => {
  // 進入：從小到正常
  const enterScale = interpolate(progress, [0, 0.25], [0.6, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  // 退出：放大穿過鏡頭
  const exitScale = interpolate(progress, [0.75, 1], [1, 3], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic) });
  const exitOpacity = interpolate(progress, [0.8, 1], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const scale = progress < 0.75 ? enterScale : exitScale;
  const opacity = progress < 0.75 ? interpolate(progress, [0, 0.15], [0, 1], { extrapolateRight: 'clamp' }) : exitOpacity;

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      opacity,
      transform: `scale(${scale})`,
    }}>
      <div>
        <Logo scale={1.8} />
      </div>
      <div style={{
        marginTop: 40,
        fontSize: 56,
        fontWeight: 900,
        color: colors.text,
        letterSpacing: 8,
      }}>
        ULTRA ADVISOR
      </div>
      <div style={{
        marginTop: 16,
        fontSize: 24,
        color: colors.primary,
        letterSpacing: 4,
      }}>
        AI 財務視覺化平台
      </div>
      <div style={{
        marginTop: 30,
        padding: '12px 32px',
        background: `${colors.primary}20`,
        border: `2px solid ${colors.primary}50`,
        borderRadius: 30,
        fontSize: 20,
        color: colors.text,
        fontWeight: 700,
      }}>
        18 種專業財務工具
      </div>
    </div>
  );
};

// ============================================
// 場景2: 痛點+轉折 (3-7s)
// 轉場：從遠處飛入 → 向右滑出
// ============================================
const PainScene: React.FC<{ progress: number }> = ({ progress }) => {
  const frame = useCurrentFrame();

  // 進入：從遠處（小+模糊）飛入
  const enterScale = interpolate(progress, [0, 0.12], [0.3, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const enterOpacity = interpolate(progress, [0, 0.1], [0, 1], { extrapolateRight: 'clamp' });

  // 退出：向左滑出 + 縮小
  const exitX = interpolate(progress, [0.88, 1], [0, -200], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic) });
  const exitScale = interpolate(progress, [0.88, 1], [1, 0.8], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const exitOpacity = interpolate(progress, [0.88, 1], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const opacity = progress < 0.88 ? enterOpacity : exitOpacity;
  const scale = progress < 0.12 ? enterScale : (progress > 0.88 ? exitScale : 1);
  const translateX = progress > 0.88 ? exitX : 0;

  // 90% 數字動畫
  const numberProgress = interpolate(progress, [0.1, 0.4], [0, 90], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // 轉折出現時機
  const transitionOpacity = interpolate(progress, [0.5, 0.65], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      opacity,
      transform: `scale(${scale}) translateX(${translateX}px)`,
    }}>
      {/* 痛點 */}
      <div style={{ textAlign: 'center', opacity: 1 - transitionOpacity * 0.7 }}>
        <div style={{ fontSize: 22, color: colors.muted, marginBottom: 16 }}>根據調查</div>
        <div style={{
          fontSize: 180,
          fontWeight: 900,
          color: colors.danger,
          fontFamily: 'monospace',
          textShadow: `0 0 80px ${colors.danger}60`,
          lineHeight: 1,
        }}>
          {Math.round(numberProgress)}%
        </div>
        <div style={{ fontSize: 28, color: colors.text, fontWeight: 700, marginTop: 16 }}>
          的顧問在試算時遇到困難
        </div>
      </div>

      {/* 轉折 */}
      <div style={{
        position: 'absolute',
        bottom: 180,
        opacity: transitionOpacity,
        transform: `translateY(${(1 - transitionOpacity) * 30}px)`,
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: 36,
          color: colors.primary,
          fontWeight: 900,
          textShadow: `0 0 40px ${colors.primary}50`,
        }}>
          如果有一套系統，能在 3 秒內完成？
        </div>
      </div>
    </div>
  );
};

// ============================================
// 場景3: 複利計算機演示 (7-17s)
// 轉場：從右側滑入 → 向上縮小飛出
// ============================================
const CompoundInterestScene: React.FC<{ progress: number }> = ({ progress }) => {
  const frame = useCurrentFrame();

  // 進入：從右側滑入
  const enterX = interpolate(progress, [0, 0.08], [300, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const enterOpacity = interpolate(progress, [0, 0.05], [0, 1], { extrapolateRight: 'clamp' });

  // 退出：向上飛出 + 縮小
  const exitY = interpolate(progress, [0.93, 1], [0, -150], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic) });
  const exitScale = interpolate(progress, [0.93, 1], [1, 0.7], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const exitOpacity = interpolate(progress, [0.93, 1], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const opacity = progress < 0.93 ? enterOpacity : exitOpacity;
  const translateX = progress < 0.08 ? enterX : 0;
  const translateY = progress > 0.93 ? exitY : 0;
  const scale = progress > 0.93 ? exitScale : 1;

  // 輸入動畫
  const principal = interpolate(progress, [0.05, 0.2], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const years = interpolate(progress, [0.15, 0.3], [0, 20], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const rate = 8; // 年化報酬率 8%

  // 計算複利結果
  const finalAmount = principal * Math.pow(1 + rate / 100, Math.round(years));

  // 曲線繪製進度
  const curveProgress = interpolate(progress, [0.35, 0.85], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // 生成曲線數據點
  const curvePoints: string[] = [];
  const chartWidth = 600;
  const chartHeight = 280;
  const maxYears = 20;
  const maxValue = 100 * Math.pow(1 + rate / 100, maxYears);

  for (let i = 0; i <= 40; i++) {
    const yearPoint = (i / 40) * maxYears * curveProgress;
    const value = 100 * Math.pow(1 + rate / 100, yearPoint);
    const x = 80 + (i / 40) * curveProgress * chartWidth;
    const y = chartHeight + 40 - (value / maxValue) * chartHeight;
    curvePoints.push(`${x},${y}`);
  }

  // 結果顯示
  const resultOpacity = interpolate(progress, [0.6, 0.75], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity,
      transform: `translateX(${translateX}px) translateY(${translateY}px) scale(${scale})`,
    }}>
      <div style={{
        width: 900,
        background: `linear-gradient(145deg, ${colors.card}, #1e293b)`,
        borderRadius: 24,
        padding: 40,
        border: `2px solid ${colors.primary}40`,
        boxShadow: `0 0 60px ${colors.primary}20`,
      }}>
        {/* 標題 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 30 }}>
          <div style={{
            width: 50,
            height: 50,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${colors.success}, #059669)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
          }}>
            📈
          </div>
          <div>
            <div style={{ color: colors.text, fontSize: 24, fontWeight: 900 }}>複利計算機</div>
            <div style={{ color: colors.muted, fontSize: 14 }}>Compound Interest Calculator</div>
          </div>
          <div style={{
            marginLeft: 'auto',
            padding: '6px 16px',
            background: colors.success,
            borderRadius: 20,
            fontSize: 12,
            color: colors.text,
            fontWeight: 700,
          }}>
            ● 計算中
          </div>
        </div>

        {/* 輸入區 */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 30 }}>
          <div style={{ flex: 1, background: colors.bg, borderRadius: 12, padding: 16, border: `1px solid ${colors.border}` }}>
            <div style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>投入本金</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ color: colors.primary, fontSize: 36, fontWeight: 900, fontFamily: 'monospace' }}>
                {Math.round(principal)}
              </span>
              <span style={{ color: colors.muted, fontSize: 16 }}>萬元</span>
            </div>
          </div>
          <div style={{ flex: 1, background: colors.bg, borderRadius: 12, padding: 16, border: `1px solid ${colors.border}` }}>
            <div style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>投資年期</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ color: colors.warning, fontSize: 36, fontWeight: 900, fontFamily: 'monospace' }}>
                {Math.round(years)}
              </span>
              <span style={{ color: colors.muted, fontSize: 16 }}>年</span>
            </div>
          </div>
          <div style={{ flex: 1, background: colors.bg, borderRadius: 12, padding: 16, border: `1px solid ${colors.border}` }}>
            <div style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>年化報酬</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ color: colors.success, fontSize: 36, fontWeight: 900, fontFamily: 'monospace' }}>
                {rate}
              </span>
              <span style={{ color: colors.muted, fontSize: 16 }}>%</span>
            </div>
          </div>
        </div>

        {/* 曲線圖 */}
        <div style={{ position: 'relative', height: 340, background: colors.bg, borderRadius: 16, padding: 20 }}>
          <svg width="100%" height="100%" viewBox="0 0 760 340">
            {/* Y軸標籤 */}
            {[0, 100, 200, 300, 400, 466].map((val, i) => (
              <text key={i} x="70" y={320 - (val / 500) * 280} fill={colors.muted} fontSize="11" textAnchor="end">
                {val}萬
              </text>
            ))}
            {/* X軸標籤 */}
            {[0, 5, 10, 15, 20].map((year, i) => (
              <text key={i} x={80 + (year / 20) * 600} y="335" fill={colors.muted} fontSize="11" textAnchor="middle">
                {year}年
              </text>
            ))}
            {/* 網格線 */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <line key={i} x1="80" y1={40 + i * 56} x2="680" y2={40 + i * 56} stroke={colors.border} strokeWidth="1" opacity="0.3" />
            ))}
            {/* 曲線 */}
            <polyline
              points={curvePoints.join(' ')}
              fill="none"
              stroke={colors.success}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* 曲線下方填充 */}
            <polygon
              points={`80,320 ${curvePoints.join(' ')} ${80 + curveProgress * 600},320`}
              fill={`${colors.success}20`}
            />
            {/* 終點標記 */}
            {curveProgress > 0.9 && (
              <circle
                cx={80 + curveProgress * 600}
                cy={320 - (finalAmount / 500) * 280}
                r="8"
                fill={colors.success}
                style={{ filter: `drop-shadow(0 0 10px ${colors.success})` }}
              />
            )}
          </svg>

          {/* 結果卡片 */}
          <div style={{
            position: 'absolute',
            right: 40,
            top: 40,
            padding: 20,
            background: `linear-gradient(135deg, ${colors.success}, #059669)`,
            borderRadius: 16,
            textAlign: 'center',
            opacity: resultOpacity,
            transform: `scale(${0.8 + resultOpacity * 0.2})`,
            boxShadow: `0 0 40px ${colors.success}50`,
          }}>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 4 }}>20年後總資產</div>
            <div style={{ color: colors.text, fontSize: 42, fontWeight: 900, fontFamily: 'monospace' }}>
              {Math.round(finalAmount)} 萬
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 8 }}>
              成長 {Math.round((finalAmount / 100 - 1) * 100)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 場景4: 大小水庫對比 (17-27s)
// 轉場：從下方升起 → 向右滑出
// ============================================
const ReservoirScene: React.FC<{ progress: number }> = ({ progress }) => {
  const frame = useCurrentFrame();

  // 進入：從下方升起
  const enterY = interpolate(progress, [0, 0.08], [200, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const enterOpacity = interpolate(progress, [0, 0.05], [0, 1], { extrapolateRight: 'clamp' });

  // 退出：向右滑出
  const exitX = interpolate(progress, [0.93, 1], [0, 250], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic) });
  const exitOpacity = interpolate(progress, [0.93, 1], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const opacity = progress < 0.93 ? enterOpacity : exitOpacity;
  const translateY = progress < 0.08 ? enterY : 0;
  const translateX = progress > 0.93 ? exitX : 0;

  // 水位動畫
  const waterProgress = interpolate(progress, [0.1, 0.7], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // 大水庫（配息花掉）：本金不變
  const bigReservoirValue = 100;
  const bigWaterLevel = waterProgress * 0.6; // 最高60%

  // 小水庫（配息再投）：複利成長
  const smallReservoirValue = 100 * Math.pow(1.06, waterProgress * 20); // 6%年化, 20年
  const smallWaterLevel = Math.min(waterProgress * 0.6 + waterProgress * 0.35, 0.95);

  // 數字動畫
  const bigDisplayValue = Math.round(bigReservoirValue);
  const smallDisplayValue = Math.round(interpolate(waterProgress, [0, 1], [100, smallReservoirValue]));

  // 對比結果顯示
  const comparisonOpacity = interpolate(progress, [0.75, 0.9], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity,
      transform: `translateX(${translateX}px) translateY(${translateY}px)`,
    }}>
      <div style={{
        width: 1000,
        background: `linear-gradient(145deg, ${colors.card}, #1e293b)`,
        borderRadius: 24,
        padding: 40,
        border: `2px solid ${colors.cyan}40`,
        boxShadow: `0 0 60px ${colors.cyan}20`,
      }}>
        {/* 標題 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 30 }}>
          <div style={{
            width: 50,
            height: 50,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${colors.cyan}, #0891b2)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
          }}>
            💧
          </div>
          <div>
            <div style={{ color: colors.text, fontSize: 24, fontWeight: 900 }}>大小水庫專案</div>
            <div style={{ color: colors.muted, fontSize: 14 }}>配息花掉 vs 配息再投資</div>
          </div>
        </div>

        {/* 兩個水庫對比 */}
        <div style={{ display: 'flex', gap: 40, justifyContent: 'center' }}>
          {/* 大水庫 - 配息花掉 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: colors.muted, fontSize: 14, marginBottom: 12 }}>配息花掉</div>
            <div style={{
              width: 200,
              height: 280,
              background: colors.bg,
              borderRadius: 20,
              border: `3px solid ${colors.primary}40`,
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* 水位 */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: `${bigWaterLevel * 100}%`,
                background: `linear-gradient(180deg, ${colors.primary}80, ${colors.primary})`,
                borderRadius: '0 0 17px 17px',
                transition: 'height 0.1s',
              }}>
                {/* 水波紋 */}
                <div style={{
                  position: 'absolute',
                  top: -5,
                  left: 0,
                  right: 0,
                  height: 10,
                  background: `radial-gradient(ellipse at ${50 + Math.sin(frame * 0.1) * 20}% 50%, ${colors.primary}, transparent)`,
                  opacity: 0.5,
                }} />
              </div>
              {/* 金額 */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: colors.text,
                fontSize: 32,
                fontWeight: 900,
                fontFamily: 'monospace',
                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              }}>
                {bigDisplayValue}萬
              </div>
            </div>
            <div style={{ marginTop: 16, color: colors.primary, fontSize: 18, fontWeight: 700 }}>
              20年後：100萬
            </div>
          </div>

          {/* VS */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 48,
            color: colors.muted,
            fontWeight: 900,
          }}>
            VS
          </div>

          {/* 小水庫 - 配息再投 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: colors.warning, fontSize: 14, marginBottom: 12, fontWeight: 700 }}>配息再投資 ⭐</div>
            <div style={{
              width: 200,
              height: 280,
              background: colors.bg,
              borderRadius: 20,
              border: `3px solid ${colors.warning}60`,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: `0 0 30px ${colors.warning}30`,
            }}>
              {/* 水位 */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: `${smallWaterLevel * 100}%`,
                background: `linear-gradient(180deg, ${colors.warning}80, ${colors.warning})`,
                borderRadius: '0 0 17px 17px',
                transition: 'height 0.1s',
              }}>
                {/* 水波紋 */}
                <div style={{
                  position: 'absolute',
                  top: -5,
                  left: 0,
                  right: 0,
                  height: 10,
                  background: `radial-gradient(ellipse at ${50 + Math.sin(frame * 0.12) * 20}% 50%, ${colors.warning}, transparent)`,
                  opacity: 0.6,
                }} />
              </div>
              {/* 金額 */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: colors.text,
                fontSize: 32,
                fontWeight: 900,
                fontFamily: 'monospace',
                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              }}>
                {smallDisplayValue}萬
              </div>
            </div>
            <div style={{ marginTop: 16, color: colors.warning, fontSize: 18, fontWeight: 700 }}>
              20年後：{Math.round(smallReservoirValue)}萬
            </div>
          </div>
        </div>

        {/* 對比結論 */}
        <div style={{
          marginTop: 30,
          padding: 20,
          background: `${colors.warning}15`,
          border: `2px solid ${colors.warning}40`,
          borderRadius: 16,
          textAlign: 'center',
          opacity: comparisonOpacity,
          transform: `translateY(${(1 - comparisonOpacity) * 20}px)`,
        }}>
          <span style={{ color: colors.text, fontSize: 24, fontWeight: 900 }}>
            差距 <span style={{ color: colors.warning, fontSize: 32 }}>{Math.round(smallReservoirValue - 100)}</span> 萬
          </span>
          <span style={{ color: colors.muted, fontSize: 18, marginLeft: 16 }}>
            複利的力量！
          </span>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 場景5: 房貸計算 (27-35s)
// 轉場：從左側滑入 → 縮小淡出
// ============================================
const MortgageScene: React.FC<{ progress: number }> = ({ progress }) => {
  // 進入：從左側滑入
  const enterX = interpolate(progress, [0, 0.1], [-300, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const enterOpacity = interpolate(progress, [0, 0.06], [0, 1], { extrapolateRight: 'clamp' });

  // 退出：縮小 + 淡出
  const exitScale = interpolate(progress, [0.92, 1], [1, 0.6], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic) });
  const exitOpacity = interpolate(progress, [0.92, 1], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const opacity = progress < 0.92 ? enterOpacity : exitOpacity;
  const translateX = progress < 0.1 ? enterX : 0;
  const scale = progress > 0.92 ? exitScale : 1;

  // 輸入動畫
  const loanAmount = interpolate(progress, [0.05, 0.25], [500, 1000], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const years = 30;
  const rate = 2.2;

  // 計算月付
  const monthlyRate = rate / 100 / 12;
  const totalMonths = years * 12;
  const monthly = (loanAmount * 10000 * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1);
  const totalPayment = monthly * totalMonths;
  const totalInterest = totalPayment - loanAmount * 10000;

  // 結果顯示進度
  const resultProgress = interpolate(progress, [0.3, 0.5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // 圖表進度
  const chartProgress = interpolate(progress, [0.5, 0.9], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity,
      transform: `translateX(${translateX}px) scale(${scale})`,
    }}>
      <div style={{
        width: 900,
        background: `linear-gradient(145deg, ${colors.card}, #1e293b)`,
        borderRadius: 24,
        padding: 40,
        border: `2px solid ${colors.secondary}40`,
        boxShadow: `0 0 60px ${colors.secondary}20`,
      }}>
        {/* 標題 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 30 }}>
          <div style={{
            width: 50,
            height: 50,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${colors.secondary}, #7c3aed)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
          }}>
            🏠
          </div>
          <div>
            <div style={{ color: colors.text, fontSize: 24, fontWeight: 900 }}>房貸試算</div>
            <div style={{ color: colors.muted, fontSize: 14 }}>本息攤還計算</div>
          </div>
        </div>

        {/* 輸入區 */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 30 }}>
          <div style={{ flex: 1, background: colors.bg, borderRadius: 12, padding: 16, border: `1px solid ${colors.border}` }}>
            <div style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>貸款金額</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ color: colors.secondary, fontSize: 36, fontWeight: 900, fontFamily: 'monospace' }}>
                {Math.round(loanAmount)}
              </span>
              <span style={{ color: colors.muted, fontSize: 16 }}>萬元</span>
            </div>
            {/* 進度條 */}
            <div style={{ height: 4, background: colors.border, borderRadius: 2, marginTop: 12 }}>
              <div style={{
                height: '100%',
                width: `${(loanAmount / 1500) * 100}%`,
                background: `linear-gradient(90deg, ${colors.secondary}, ${colors.primary})`,
                borderRadius: 2,
              }} />
            </div>
          </div>
          <div style={{ flex: 0.6, background: colors.bg, borderRadius: 12, padding: 16, border: `1px solid ${colors.border}` }}>
            <div style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>年利率</div>
            <span style={{ color: colors.success, fontSize: 36, fontWeight: 900, fontFamily: 'monospace' }}>{rate}%</span>
          </div>
          <div style={{ flex: 0.6, background: colors.bg, borderRadius: 12, padding: 16, border: `1px solid ${colors.border}` }}>
            <div style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>貸款年期</div>
            <span style={{ color: colors.warning, fontSize: 36, fontWeight: 900, fontFamily: 'monospace' }}>{years}年</span>
          </div>
        </div>

        {/* 結果 */}
        <div style={{ display: 'flex', gap: 20 }}>
          {/* 月付金 */}
          <div style={{
            flex: 1,
            background: `linear-gradient(135deg, ${colors.secondary}, #7c3aed)`,
            borderRadius: 16,
            padding: 24,
            textAlign: 'center',
            opacity: resultProgress,
            transform: `scale(${0.9 + resultProgress * 0.1})`,
          }}>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 8 }}>每月還款</div>
            <div style={{ color: colors.text, fontSize: 48, fontWeight: 900, fontFamily: 'monospace' }}>
              ${Math.round(monthly).toLocaleString()}
            </div>
          </div>

          {/* 本金 vs 利息 */}
          <div style={{
            flex: 1,
            background: colors.bg,
            borderRadius: 16,
            padding: 24,
            border: `1px solid ${colors.border}`,
            opacity: chartProgress,
          }}>
            <div style={{ color: colors.muted, fontSize: 12, marginBottom: 16, textAlign: 'center' }}>本金 vs 利息</div>
            <div style={{ display: 'flex', height: 40, borderRadius: 8, overflow: 'hidden' }}>
              <div style={{
                width: `${(loanAmount * 10000 / totalPayment) * 100 * chartProgress}%`,
                background: colors.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                color: colors.text,
                fontWeight: 700,
                minWidth: chartProgress > 0.5 ? 80 : 0,
              }}>
                {chartProgress > 0.5 && '本金'}
              </div>
              <div style={{
                flex: 1,
                background: colors.danger,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                color: colors.text,
                fontWeight: 700,
              }}>
                {chartProgress > 0.5 && '利息'}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
              <span style={{ color: colors.primary, fontSize: 14, fontWeight: 700 }}>
                ${Math.round(loanAmount * 10000 / 10000)}萬
              </span>
              <span style={{ color: colors.danger, fontSize: 14, fontWeight: 700 }}>
                ${Math.round(totalInterest / 10000)}萬
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 場景6: 一鍵出圖 (35-43s)
// 轉場：旋轉進入 → 向下滑出
// ============================================
const ReportScene: React.FC<{ progress: number }> = ({ progress }) => {
  const frame = useCurrentFrame();

  // 進入：從上方旋轉進入
  const enterY = interpolate(progress, [0, 0.1], [-150, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const enterRotate = interpolate(progress, [0, 0.1], [-8, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const enterOpacity = interpolate(progress, [0, 0.06], [0, 1], { extrapolateRight: 'clamp' });

  // 退出：向下加速滑出
  const exitY = interpolate(progress, [0.92, 1], [0, 200], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic) });
  const exitOpacity = interpolate(progress, [0.92, 1], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const opacity = progress < 0.92 ? enterOpacity : exitOpacity;
  const translateY = progress < 0.1 ? enterY : (progress > 0.92 ? exitY : 0);
  const rotate = progress < 0.1 ? enterRotate : 0;

  // 生成進度
  const generateProgress = interpolate(progress, [0.1, 0.45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // 報表出現
  const reportOpacity = interpolate(progress, [0.5, 0.65], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity,
      transform: `translateY(${translateY}px) rotate(${rotate}deg)`,
    }}>
      <div style={{
        width: 900,
        background: `linear-gradient(145deg, ${colors.card}, #1e293b)`,
        borderRadius: 24,
        padding: 40,
        border: `2px solid ${colors.success}40`,
        boxShadow: `0 0 60px ${colors.success}20`,
      }}>
        {/* 標題 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 30 }}>
          <div style={{
            width: 50,
            height: 50,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${colors.success}, #059669)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
          }}>
            📄
          </div>
          <div>
            <div style={{ color: colors.text, fontSize: 24, fontWeight: 900 }}>一鍵出圖</div>
            <div style={{ color: colors.muted, fontSize: 14 }}>3 秒生成專業報表</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 30 }}>
          {/* 左側：生成過程 */}
          <div style={{ flex: 1 }}>
            {/* 進度條 */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: colors.muted, fontSize: 14 }}>
                  {generateProgress < 1 ? '生成中...' : '✓ 完成'}
                </span>
                <span style={{ color: colors.success, fontSize: 14, fontWeight: 700 }}>
                  {Math.round(generateProgress * 100)}%
                </span>
              </div>
              <div style={{ height: 8, background: colors.bg, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${generateProgress * 100}%`,
                  background: `linear-gradient(90deg, ${colors.success}, ${colors.cyan})`,
                  borderRadius: 4,
                }} />
              </div>
            </div>

            {/* 步驟清單 */}
            {[
              { text: '讀取試算數據', time: 0.2 },
              { text: '套用報表模板', time: 0.4 },
              { text: '生成視覺化圖表', time: 0.6 },
              { text: '輸出高品質 PDF', time: 0.8 },
            ].map((step, i) => {
              const stepDone = generateProgress >= step.time;
              return (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 0',
                  borderBottom: `1px solid ${colors.border}`,
                  opacity: generateProgress >= step.time - 0.2 ? 1 : 0.3,
                }}>
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: stepDone ? colors.success : colors.border,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    color: colors.text,
                  }}>
                    {stepDone ? '✓' : i + 1}
                  </div>
                  <span style={{ color: stepDone ? colors.text : colors.muted, fontSize: 14 }}>
                    {step.text}
                  </span>
                </div>
              );
            })}
          </div>

          {/* 右側：報表預覽 */}
          <div style={{
            flex: 1,
            opacity: reportOpacity,
            transform: `translateY(${(1 - reportOpacity) * 30}px)`,
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            }}>
              {/* 報表 Header */}
              <div style={{
                background: `linear-gradient(135deg, ${colors.card}, #1e293b)`,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}>
                <div style={{
                  width: 32,
                  height: 32,
                  background: `linear-gradient(135deg, ${colors.primary}, #2E6BFF)`,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span style={{ color: '#fff', fontSize: 14, fontWeight: 900 }}>U</span>
                </div>
                <span style={{ color: colors.text, fontSize: 14, fontWeight: 700 }}>ULTRA ADVISOR</span>
              </div>

              {/* 報表內容 */}
              <div style={{ padding: 20 }}>
                <div style={{ height: 16, background: '#1e293b', borderRadius: 4, marginBottom: 12, width: '70%' }} />
                <div style={{ height: 12, background: '#e2e8f0', borderRadius: 4, marginBottom: 8, width: '100%' }} />
                <div style={{ height: 12, background: '#e2e8f0', borderRadius: 4, marginBottom: 8, width: '85%' }} />
                <div style={{ height: 12, background: '#e2e8f0', borderRadius: 4, marginBottom: 16, width: '60%' }} />

                {/* 模擬圖表 */}
                <div style={{
                  height: 80,
                  background: `linear-gradient(90deg, ${colors.primary}20, ${colors.success}20)`,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '0 10px',
                  gap: 8,
                }}>
                  {[40, 55, 45, 70, 60, 80, 75].map((h, i) => (
                    <div key={i} style={{
                      flex: 1,
                      height: `${h}%`,
                      background: `linear-gradient(180deg, ${colors.primary}, ${colors.secondary})`,
                      borderRadius: '4px 4px 0 0',
                    }} />
                  ))}
                </div>
              </div>
            </div>

            {/* 下載按鈕 */}
            {reportOpacity > 0.8 && (
              <div style={{
                marginTop: 20,
                padding: '14px 24px',
                background: `linear-gradient(135deg, ${colors.success}, #059669)`,
                borderRadius: 12,
                textAlign: 'center',
                boxShadow: `0 0 30px ${colors.success}50`,
              }}>
                <span style={{ color: colors.text, fontSize: 16, fontWeight: 700 }}>
                  📥 下載 PDF 報表
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 場景7: 18工具矩陣 (43-50s)
// 轉場：放大展開進入 → 縮小旋轉退出
// ============================================
const ToolsMatrixScene: React.FC<{ progress: number }> = ({ progress }) => {
  // 進入：從中心放大展開
  const enterScale = interpolate(progress, [0, 0.12], [0.5, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.1)) });
  const enterOpacity = interpolate(progress, [0, 0.08], [0, 1], { extrapolateRight: 'clamp' });

  // 退出：縮小 + 輕微旋轉
  const exitScale = interpolate(progress, [0.9, 1], [1, 0.7], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic) });
  const exitRotate = interpolate(progress, [0.9, 1], [0, 5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const exitOpacity = interpolate(progress, [0.9, 1], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const opacity = progress < 0.9 ? enterOpacity : exitOpacity;
  const scale = progress < 0.12 ? enterScale : (progress > 0.9 ? exitScale : 1);
  const rotate = progress > 0.9 ? exitRotate : 0;

  const tools = [
    // 觀念與診斷
    { icon: '📊', name: '戰情室', color: colors.primary },
    { icon: '🛡️', name: '黃金保險箱', color: colors.primary },
    { icon: '📈', name: '基金時光機', color: colors.primary },
    { icon: '⏰', name: '市場數據', color: colors.primary },
    // 創富資產配置
    { icon: '🎁', name: '百萬禮物', color: colors.success },
    { icon: '🏠', name: '金融房產', color: colors.success },
    { icon: '🎓', name: '學貸活化', color: colors.success },
    { icon: '💰', name: '積極存錢', color: colors.success },
    // 守富風險控管
    { icon: '💧', name: '大小水庫', color: colors.cyan },
    { icon: '🚗', name: '五年換車', color: colors.cyan },
    { icon: '👴', name: '退休缺口', color: colors.cyan },
    { icon: '🔒', name: '資產保護', color: colors.cyan },
    // 傳富稅務傳承
    { icon: '📋', name: '稅務傳承', color: colors.warning },
    { icon: '🧮', name: '閃算機', color: colors.warning },
    { icon: '📄', name: '報表生成', color: colors.warning },
    { icon: '📚', name: '知識庫', color: colors.warning },
    // 額外
    { icon: '🎯', name: '目標追蹤', color: colors.secondary },
    { icon: '✨', name: '更多功能', color: colors.secondary },
  ];

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      opacity,
      transform: `scale(${scale}) rotate(${rotate}deg)`,
    }}>
      <div style={{
        fontSize: 36,
        color: colors.text,
        fontWeight: 900,
        marginBottom: 40,
        textAlign: 'center',
      }}>
        一個平台，<span style={{ color: colors.primary }}>18</span> 種專業工具
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: 16,
        maxWidth: 900,
      }}>
        {tools.map((tool, i) => {
          const delay = i * 0.03;
          const itemOpacity = interpolate(progress, [0.1 + delay, 0.2 + delay], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          return (
            <div
              key={i}
              style={{
                padding: '20px 16px',
                background: `${tool.color}15`,
                border: `1px solid ${tool.color}40`,
                borderRadius: 16,
                textAlign: 'center',
                opacity: itemOpacity,
                transform: `scale(${itemOpacity}) translateY(${(1 - itemOpacity) * 20}px)`,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>{tool.icon}</div>
              <div style={{ color: tool.color, fontSize: 12, fontWeight: 700 }}>{tool.name}</div>
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: 40,
        display: 'flex',
        gap: 30,
        opacity: interpolate(progress, [0.7, 0.85], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      }}>
        {[
          { label: '觀念診斷', color: colors.primary, count: 4 },
          { label: '創富配置', color: colors.success, count: 4 },
          { label: '守富控管', color: colors.cyan, count: 4 },
          { label: '傳富稅務', color: colors.warning, count: 4 },
        ].map((cat, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: cat.color }} />
            <span style={{ color: colors.muted, fontSize: 14 }}>{cat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// 場景8: CTA (50-60s)
// 轉場：從下方彈起 + 爆發光芒
// ============================================
const CTAScene: React.FC<{ progress: number }> = ({ progress }) => {
  const frame = useCurrentFrame();

  // 進入：從下方彈起 + 縮放
  const enterY = interpolate(progress, [0, 0.18], [100, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.5)) });
  const enterScale = interpolate(progress, [0, 0.18], [0.7, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.2)) });
  const enterOpacity = interpolate(progress, [0, 0.1], [0, 1], { extrapolateRight: 'clamp' });

  // 爆發光芒效果
  const glowIntensity = interpolate(progress, [0.15, 0.25, 0.4], [0, 1, 0.5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const pulse = 1 + Math.sin(frame * 0.08) * 0.03;

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: enterOpacity,
    }}>
      {/* 爆發光芒背景 */}
      <div style={{
        position: 'absolute',
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${colors.primary}40 0%, transparent 70%)`,
        opacity: glowIntensity,
        transform: `scale(${1 + glowIntensity * 0.5})`,
        filter: 'blur(60px)',
      }} />

      <div style={{ transform: `translateY(${enterY}px) scale(${enterScale})`, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Logo scale={1.5} />

        <div style={{
          marginTop: 40,
          fontSize: 56,
          fontWeight: 900,
          color: colors.text,
          letterSpacing: 6,
        }}>
          ULTRA ADVISOR
        </div>

        <div style={{
          marginTop: 16,
          fontSize: 28,
          color: colors.primary,
          fontWeight: 700,
        }}>
          讓數據替你說話
        </div>

        {/* CTA 按鈕 */}
        <div style={{
          marginTop: 50,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
          padding: '24px 56px',
          background: `linear-gradient(135deg, ${colors.primary}, #2563eb)`,
          borderRadius: 24,
          boxShadow: `0 0 ${50 * pulse}px ${colors.primary}60`,
          transform: `scale(${pulse})`,
        }}>
          <span style={{ fontSize: 28 }}>✨</span>
          <span style={{ color: colors.text, fontSize: 28, fontWeight: 900 }}>立即免費試用</span>
        </div>

        <div style={{
          marginTop: 24,
          fontSize: 18,
          color: colors.muted,
        }}>
          7 天免費 ‧ 不需信用卡 ‧ 隨時取消
        </div>

        <div style={{
          marginTop: 40,
          fontSize: 20,
          color: colors.primary,
          letterSpacing: 3,
          fontWeight: 700,
        }}>
          ultra-advisor.tw
        </div>
      </div>
    </div>
  );
};

// ============================================
// 主影片組件
// ============================================
export const UltraAdvisorSystemDemo: React.FC = () => {
  const frame = useCurrentFrame();

  // 場景切換（使用 frame 計算進度）
  const getSceneProgress = (startFrame: number, endFrame: number) => {
    if (frame < startFrame) return 0;
    if (frame > endFrame) return 1;
    return (frame - startFrame) / (endFrame - startFrame);
  };

  return (
    <AbsoluteFill
      style={{
        background: colors.bg,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans TC", sans-serif',
        overflow: 'hidden',
      }}
    >
      <DynamicBackground />

      {/* 場景1: 開場 (0-180) */}
      {frame < 220 && <IntroScene progress={getSceneProgress(0, 180)} />}

      {/* 場景2: 痛點+轉折 (180-420) */}
      {frame >= 140 && frame < 460 && <PainScene progress={getSceneProgress(180, 420)} />}

      {/* 場景3: 複利計算機 (420-1020) */}
      {frame >= 380 && frame < 1060 && <CompoundInterestScene progress={getSceneProgress(420, 1020)} />}

      {/* 場景4: 大小水庫 (1020-1620) */}
      {frame >= 980 && frame < 1660 && <ReservoirScene progress={getSceneProgress(1020, 1620)} />}

      {/* 場景5: 房貸計算 (1620-2100) */}
      {frame >= 1580 && frame < 2140 && <MortgageScene progress={getSceneProgress(1620, 2100)} />}

      {/* 場景6: 一鍵出圖 (2100-2580) */}
      {frame >= 2060 && frame < 2620 && <ReportScene progress={getSceneProgress(2100, 2580)} />}

      {/* 場景7: 工具矩陣 (2580-3000) */}
      {frame >= 2540 && frame < 3040 && <ToolsMatrixScene progress={getSceneProgress(2580, 3000)} />}

      {/* 場景8: CTA (3000-3600) */}
      {frame >= 2960 && <CTAScene progress={getSceneProgress(3000, 3600)} />}

      {/* 底部進度條 */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        background: '#1e293b',
        zIndex: 200,
      }}>
        <div style={{
          height: '100%',
          width: `${(frame / 3600) * 100}%`,
          background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary}, ${colors.success})`,
        }} />
      </div>
    </AbsoluteFill>
  );
};
