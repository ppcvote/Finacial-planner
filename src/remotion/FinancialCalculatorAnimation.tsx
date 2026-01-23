import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Sequence,
} from 'remotion';

// 計算公式（與 FinancialRealEstateTool 相同）
const calculateMonthlyPayment = (principal: number, rate: number, years: number) => {
  const r = rate / 100 / 12;
  const n = years * 12;
  if (rate === 0) return (principal * 10000) / n;
  return (principal * 10000 * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

const calculateMonthlyIncome = (principal: number, rate: number) => {
  return (principal * 10000 * (rate / 100)) / 12;
};

// 動畫曲線圖元件
const AnimatedChart: React.FC<{
  loanAmount: number;
  monthlyPayment: number;
  monthlyIncome: number;
  years: number;
  delay?: number;
}> = ({ loanAmount, monthlyPayment, monthlyIncome, years, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const chartWidth = 920;
  const chartHeight = 500;
  const padding = { top: 30, right: 30, bottom: 50, left: 80 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // 計算每年的累積數據
  const dataPoints: { year: number; totalPaid: number; totalIncome: number; netWealth: number }[] = [];
  let totalPaid = 0;
  let totalIncome = 0;

  for (let y = 0; y <= years; y++) {
    if (y > 0) {
      totalPaid += monthlyPayment * 12;
      totalIncome += monthlyIncome * 12;
    }
    dataPoints.push({
      year: y,
      totalPaid: totalPaid / 10000,
      totalIncome: totalIncome / 10000,
      netWealth: loanAmount + (totalIncome - totalPaid) / 10000,
    });
  }

  // 找出最大值用於縮放
  const maxValue = Math.max(
    ...dataPoints.map(d => Math.max(d.totalPaid, d.totalIncome, d.netWealth))
  );

  // 動畫進度
  const drawProgress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 30, stiffness: 50 },
  });

  const opacity = interpolate(frame - delay, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

  // 將數據轉換為 SVG 路徑
  const createPath = (getData: (d: typeof dataPoints[0]) => number) => {
    const points = dataPoints.map((d, i) => {
      const x = padding.left + (i / years) * innerWidth;
      const y = padding.top + innerHeight - (getData(d) / maxValue) * innerHeight;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  const paidPath = createPath(d => d.totalPaid);
  const incomePath = createPath(d => d.totalIncome);
  const wealthPath = createPath(d => d.netWealth);

  // 計算路徑長度用於動畫
  const pathLength = innerWidth * 1.5;

  return (
    <div style={{ opacity }}>
      <svg width={chartWidth} height={chartHeight} style={{ overflow: 'visible' }}>
        {/* 背景網格 */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={padding.top + innerHeight * (1 - ratio)}
              x2={padding.left + innerWidth}
              y2={padding.top + innerHeight * (1 - ratio)}
              stroke="#334155"
              strokeWidth={1}
              strokeDasharray={ratio === 0 ? "0" : "4,4"}
            />
            <text
              x={padding.left - 10}
              y={padding.top + innerHeight * (1 - ratio) + 4}
              fill="#64748b"
              fontSize={12}
              textAnchor="end"
            >
              {Math.round(maxValue * ratio)}萬
            </text>
          </g>
        ))}

        {/* X軸標籤 */}
        {[0, Math.floor(years / 4), Math.floor(years / 2), Math.floor(years * 3 / 4), years].map((year, i) => (
          <text
            key={i}
            x={padding.left + (year / years) * innerWidth}
            y={chartHeight - 15}
            fill="#64748b"
            fontSize={12}
            textAnchor="middle"
          >
            {year}年
          </text>
        ))}

        {/* 累計支出線 (紅色) */}
        <path
          d={paidPath}
          fill="none"
          stroke="#ef4444"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={pathLength}
          strokeDashoffset={pathLength * (1 - drawProgress)}
        />

        {/* 累計收入線 (綠色) */}
        <path
          d={incomePath}
          fill="none"
          stroke="#10b981"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={pathLength}
          strokeDashoffset={pathLength * (1 - drawProgress)}
        />

        {/* 淨資產線 (金色) */}
        <path
          d={wealthPath}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={pathLength}
          strokeDashoffset={pathLength * (1 - drawProgress)}
        />

        {/* 終點標記 */}
        {drawProgress > 0.9 && (
          <>
            <circle
              cx={padding.left + innerWidth}
              cy={padding.top + innerHeight - (dataPoints[years].netWealth / maxValue) * innerHeight}
              r={8}
              fill="#f59e0b"
              opacity={interpolate(drawProgress, [0.9, 1], [0, 1])}
            />
            <text
              x={padding.left + innerWidth + 15}
              y={padding.top + innerHeight - (dataPoints[years].netWealth / maxValue) * innerHeight + 5}
              fill="#f59e0b"
              fontSize={16}
              fontWeight="bold"
              opacity={interpolate(drawProgress, [0.9, 1], [0, 1])}
            >
              {dataPoints[years].netWealth.toFixed(0)}萬
            </text>
          </>
        )}
      </svg>

      {/* 圖例 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 40,
        marginTop: 10,
      }}>
        {[
          { color: '#ef4444', label: '累計支出' },
          { color: '#10b981', label: '累計配息' },
          { color: '#f59e0b', label: '淨資產' },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 24,
              height: 4,
              backgroundColor: item.color,
              borderRadius: 2,
            }} />
            <span style={{ color: '#94a3b8', fontSize: 14 }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 動畫數字元件
const AnimatedNumber: React.FC<{
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  color?: string;
  fontSize?: number;
  delay?: number;
}> = ({ value, prefix = '', suffix = '', decimals = 0, color = '#10b981', fontSize = 48, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: {
      damping: 50,
      stiffness: 100,
      mass: 0.5,
    },
  });

  const displayValue = interpolate(progress, [0, 1], [0, value]);
  const opacity = interpolate(frame - delay, [0, 10], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <span style={{
      color,
      fontSize,
      fontWeight: 'bold',
      fontFamily: 'monospace',
      opacity,
    }}>
      {prefix}{displayValue.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}{suffix}
    </span>
  );
};

// 計算步驟卡片（增強版）
const CalculationStep: React.FC<{
  title: string;
  formula: string;
  result: React.ReactNode;
  delay: number;
  icon: string;
  // 新增視覺化屬性
  barValue?: number;
  barMax?: number;
  barColor?: string;
  subInfo?: { label: string; value: string }[];
  miniChart?: number[]; // 迷你趨勢圖數據
}> = ({ title, formula, result, delay, icon, barValue, barMax, barColor = '#10b981', subInfo, miniChart }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideIn = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  const opacity = interpolate(frame - delay, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const translateY = interpolate(slideIn, [0, 1], [50, 0]);

  // 進度條動畫
  const barProgress = spring({
    frame: frame - delay - 20,
    fps,
    config: { damping: 30, stiffness: 60 },
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: 12,
        padding: 20,
        border: '1px solid #334155',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 標題列 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 24 }}>{icon}</span>
        <span style={{ color: '#94a3b8', fontSize: 14, fontWeight: 600 }}>{title}</span>
      </div>

      {/* 公式區 */}
      <div style={{
        color: '#64748b',
        fontSize: 11,
        marginBottom: 16,
        fontFamily: 'monospace',
        background: '#0f172a',
        padding: 10,
        borderRadius: 8,
        border: '1px solid #1e293b',
      }}>
        {formula}
      </div>

      {/* 主結果 */}
      <div style={{ fontSize: 24, marginBottom: 16 }}>
        {result}
      </div>

      {/* 進度條視覺化 */}
      {barValue !== undefined && barMax !== undefined && (
        <div style={{ marginBottom: 16 }}>
          <div style={{
            height: 8,
            background: '#0f172a',
            borderRadius: 4,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${(barValue / barMax) * 100 * barProgress}%`,
              background: `linear-gradient(90deg, ${barColor}80, ${barColor})`,
              borderRadius: 4,
              transition: 'width 0.3s ease',
            }} />
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 4,
            fontSize: 10,
            color: '#475569',
          }}>
            <span>0</span>
            <span>{barMax.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* 迷你趨勢圖 */}
      {miniChart && miniChart.length > 0 && (
        <div style={{ marginBottom: 16, height: 40 }}>
          <svg width="100%" height="40" viewBox="0 0 100 40" preserveAspectRatio="none">
            {/* 背景區域 */}
            <defs>
              <linearGradient id={`gradient-${delay}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={barColor} stopOpacity="0.3" />
                <stop offset="100%" stopColor={barColor} stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* 趨勢線 */}
            {(() => {
              const max = Math.max(...miniChart);
              const min = Math.min(...miniChart);
              const range = max - min || 1;
              const points = miniChart.map((v, i) => {
                const x = (i / (miniChart.length - 1)) * 100 * barProgress;
                const y = 38 - ((v - min) / range) * 34;
                return `${x},${y}`;
              }).join(' ');
              const areaPoints = `0,40 ${points} ${100 * barProgress},40`;
              return (
                <>
                  <polygon points={areaPoints} fill={`url(#gradient-${delay})`} />
                  <polyline
                    points={points}
                    fill="none"
                    stroke={barColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              );
            })()}
          </svg>
        </div>
      )}

      {/* 補充資訊 */}
      {subInfo && subInfo.length > 0 && (
        <div style={{
          marginTop: 'auto',
          display: 'grid',
          gridTemplateColumns: `repeat(${subInfo.length}, 1fr)`,
          gap: 12,
          paddingTop: 12,
          borderTop: '1px solid #1e293b',
        }}>
          {subInfo.map((info, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ color: '#475569', fontSize: 10, marginBottom: 2 }}>{info.label}</div>
              <div style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>{info.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 主要動畫組件
export const FinancialCalculatorAnimation: React.FC<{
  loanAmount?: number;
  loanTerm?: number;
  loanRate?: number;
  investReturnRate?: number;
}> = ({
  loanAmount = 1000,
  loanTerm = 30,
  loanRate = 2.2,
  investReturnRate = 6,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // 計算結果
  const monthlyPayment = calculateMonthlyPayment(loanAmount, loanRate, loanTerm);
  const monthlyIncome = calculateMonthlyIncome(loanAmount, investReturnRate);
  const monthlyCashFlow = monthlyIncome - monthlyPayment;
  const totalWealth = loanAmount + (monthlyCashFlow * 12 * loanTerm) / 10000;

  // 標題動畫
  const titleOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  const titleScale = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* 背景網格 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* 標題區域 */}
      <Sequence from={0} durationInFrames={durationInFrames}>
        <div
          style={{
            position: 'absolute',
            top: 40,
            left: 0,
            right: 0,
            textAlign: 'center',
            opacity: titleOpacity,
            transform: `scale(${titleScale})`,
          }}
        >
          <div style={{
            color: '#10b981',
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: 4,
            marginBottom: 8,
          }}>
            ULTRA ADVISOR
          </div>
          <h1 style={{
            color: 'white',
            fontSize: 36,
            fontWeight: 800,
            margin: 0,
          }}>
            金融房產計算過程
          </h1>
        </div>
      </Sequence>

      {/* 左側面板 - 參數與計算步驟 */}
      <div style={{
        position: 'absolute',
        top: 120,
        left: 60,
        width: 750,
        bottom: 60,
      }}>
        {/* 參數顯示 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 20,
        }}>
          {[
            { label: '貸款總額', value: `${loanAmount} 萬`, color: '#10b981' },
            { label: '年期', value: `${loanTerm} 年`, color: '#0ea5e9' },
            { label: '貸款利率', value: `${loanRate}%`, color: '#f59e0b' },
            { label: '配息率', value: `${investReturnRate}%`, color: '#8b5cf6' },
          ].map((param, i) => {
            const paramDelay = 30 + i * 10;
            const paramOpacity = interpolate(frame - paramDelay, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
            return (
              <div
                key={param.label}
                style={{
                  opacity: paramOpacity,
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.05)',
                  padding: '12px 20px',
                  borderRadius: 12,
                  border: `1px solid ${param.color}30`,
                  flex: 1,
                }}
              >
                <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>{param.label}</div>
                <div style={{ color: param.color, fontSize: 20, fontWeight: 700 }}>{param.value}</div>
              </div>
            );
          })}
        </div>

        {/* 計算步驟 2x2 網格 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: 16,
          height: 'calc(100% - 90px)',
        }}>
          {/* 步驟 1: 每月貸款支出 */}
          <CalculationStep
            icon="💳"
            title="Step 1: 每月貸款支出"
            formula={`P × r × (1+r)^n / [(1+r)^n - 1]`}
            delay={60}
            result={
              <div>
                <span style={{ color: '#64748b', fontSize: 14 }}>每月需還款 </span>
                <AnimatedNumber
                  value={monthlyPayment}
                  prefix="$"
                  color="#ef4444"
                  fontSize={28}
                  delay={80}
                />
              </div>
            }
            barValue={monthlyPayment}
            barMax={100000}
            barColor="#ef4444"
            subInfo={[
              { label: '年付總額', value: `$${Math.round(monthlyPayment * 12).toLocaleString()}` },
              { label: '總還款', value: `$${Math.round(monthlyPayment * 12 * loanTerm / 10000)}萬` },
            ]}
          />

          {/* 步驟 2: 每月配息收入 */}
          <CalculationStep
            icon="💰"
            title="Step 2: 每月配息收入"
            formula={`本金 × 配息率 ÷ 12`}
            delay={90}
            result={
              <div>
                <span style={{ color: '#64748b', fontSize: 14 }}>每月配息 </span>
                <AnimatedNumber
                  value={monthlyIncome}
                  prefix="+$"
                  color="#10b981"
                  fontSize={28}
                  delay={110}
                />
              </div>
            }
            barValue={monthlyIncome}
            barMax={100000}
            barColor="#10b981"
            subInfo={[
              { label: '年收入', value: `$${Math.round(monthlyIncome * 12).toLocaleString()}` },
              { label: '總收益', value: `$${Math.round(monthlyIncome * 12 * loanTerm / 10000)}萬` },
            ]}
          />

          {/* 步驟 3: 每月淨現金流 */}
          <CalculationStep
            icon="📊"
            title="Step 3: 每月淨現金流"
            formula={`配息收入 - 貸款支出`}
            delay={120}
            result={
              <div>
                <span style={{ color: '#64748b', fontSize: 14 }}>淨現金流 </span>
                <AnimatedNumber
                  value={Math.abs(monthlyCashFlow)}
                  prefix={monthlyCashFlow >= 0 ? '+$' : '-$'}
                  color={monthlyCashFlow >= 0 ? '#10b981' : '#ef4444'}
                  fontSize={28}
                  delay={140}
                />
              </div>
            }
            miniChart={Array.from({ length: 12 }, (_, i) => monthlyCashFlow * (i + 1))}
            barColor={monthlyCashFlow >= 0 ? '#10b981' : '#ef4444'}
            subInfo={[
              { label: '年淨流入', value: `${monthlyCashFlow >= 0 ? '+' : ''}$${Math.round(monthlyCashFlow * 12).toLocaleString()}` },
              { label: '佔收入比', value: `${Math.round((monthlyCashFlow / monthlyIncome) * 100)}%` },
            ]}
          />

          {/* 步驟 4: 期滿總累積效益 */}
          <CalculationStep
            icon="🏆"
            title="Step 4: 期滿總累積效益"
            formula={`本金 + (淨現金流 × 12 × 年期)`}
            delay={150}
            result={
              <div>
                <span style={{ color: '#64748b', fontSize: 14 }}>{loanTerm}年後 </span>
                <AnimatedNumber
                  value={totalWealth}
                  suffix=" 萬"
                  color="#f59e0b"
                  fontSize={28}
                  decimals={0}
                  delay={170}
                />
              </div>
            }
            miniChart={Array.from({ length: 10 }, (_, i) => loanAmount + (monthlyCashFlow * 12 * (i + 1) * loanTerm / 10) / 10000)}
            barColor="#f59e0b"
            subInfo={[
              { label: '報酬率', value: `${Math.round(((totalWealth - loanAmount) / loanAmount) * 100)}%` },
              { label: '年化報酬', value: `${((Math.pow(totalWealth / loanAmount, 1 / loanTerm) - 1) * 100).toFixed(1)}%` },
            ]}
          />
        </div>
      </div>

      {/* 右側面板 - 財務成長曲線圖 */}
      <Sequence from={180} durationInFrames={durationInFrames - 180}>
        <div style={{
          position: 'absolute',
          top: 120,
          right: 60,
          width: 1000,
          bottom: 60,
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            borderRadius: 16,
            padding: '24px 30px 20px 30px',
            border: '1px solid #334155',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 20,
            }}>
              <span style={{ fontSize: 28 }}>📈</span>
              <span style={{ color: '#94a3b8', fontSize: 20, fontWeight: 600 }}>
                {loanTerm}年財務成長軌跡
              </span>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AnimatedChart
                loanAmount={loanAmount}
                monthlyPayment={monthlyPayment}
                monthlyIncome={monthlyIncome}
                years={loanTerm}
                delay={20}
              />
            </div>
          </div>
        </div>
      </Sequence>

      {/* 底部品牌 */}
      <Sequence from={240} durationInFrames={durationInFrames - 240}>
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: 0,
            right: 0,
            textAlign: 'center',
            opacity: interpolate(frame - 180, [0, 20], [0, 0.5], { extrapolateRight: 'clamp' }),
          }}
        >
          <span style={{ color: '#475569', fontSize: 12 }}>
            ULTRA ADVISOR · 金融房產專案
          </span>
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};

export default FinancialCalculatorAnimation;
