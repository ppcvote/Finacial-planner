import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { FinancialCalculatorAnimation } from './FinancialCalculatorAnimation';
import { UltraAdvisorBrandVideo } from './UltraAdvisorBrandVideo';
import { UltraAdvisorFirstPersonDemo } from './UltraAdvisorFirstPersonDemo';
import { UltraAdvisorSystemDemo } from './UltraAdvisorSystemDemo';

const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ==================== 品牌形象影片 ==================== */}

      {/* Ultra Advisor 品牌形象影片 - 17秒 */}
      <Composition
        id="BrandVideo"
        component={UltraAdvisorBrandVideo}
        durationInFrames={1020} // 17秒 @ 60fps
        fps={60}
        width={1920}
        height={1080}
      />

      {/* Ultra Advisor 第一人稱視角宣傳片 - 22秒 (v5 加快節奏) */}
      <Composition
        id="FirstPersonDemo"
        component={UltraAdvisorFirstPersonDemo}
        durationInFrames={1320} // 22秒 @ 60fps
        fps={60}
        width={1920}
        height={1080}
      />

      {/* Ultra Advisor 60 秒系統示範影片 */}
      <Composition
        id="SystemDemo"
        component={UltraAdvisorSystemDemo}
        durationInFrames={3600} // 60秒 @ 60fps
        fps={60}
        width={1920}
        height={1080}
      />

      {/* ==================== 計算機動畫 ==================== */}

      {/* 計算過程動畫 - 橫向 16:9 */}
      <Composition
        id="FinancialCalculator"
        component={FinancialCalculatorAnimation}
        durationInFrames={420} // 7秒 @ 60fps
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{
          loanAmount: 1000,
          loanTerm: 30,
          loanRate: 2.2,
          investReturnRate: 6,
        }}
      />

      {/* 計算過程動畫 - 短版 (3秒) */}
      <Composition
        id="FinancialCalculatorShort"
        component={FinancialCalculatorAnimation}
        durationInFrames={180}
        fps={60}
        width={1080}
        height={1080}
        defaultProps={{
          loanAmount: 1000,
          loanTerm: 30,
          loanRate: 2.2,
          investReturnRate: 6,
        }}
      />

      {/* 計算過程動畫 - 直向版本 (9:16) */}
      <Composition
        id="FinancialCalculatorVertical"
        component={FinancialCalculatorAnimation}
        durationInFrames={420}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{
          loanAmount: 1000,
          loanTerm: 30,
          loanRate: 2.2,
          investReturnRate: 6,
        }}
      />
    </>
  );
};

registerRoot(RemotionRoot);
