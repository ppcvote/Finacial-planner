/**
 * Ultra Advisor - 點數獲得通知組件
 * 獲得點數時顯示的漂亮動畫通知
 * 
 * 檔案位置：src/components/PointsNotification.tsx
 */

import React, { useEffect, useState } from 'react';
import { Coins, Flame, Star } from 'lucide-react';

interface PointsNotificationProps {
  points: number;
  reason: string;
  streak?: number;
  onClose: () => void;
}

const PointsNotification: React.FC<PointsNotificationProps> = ({ 
  points, 
  reason, 
  streak,
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 延遲顯示動畫
    setTimeout(() => setIsVisible(true), 100);
    
    // 自動關閉
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div 
      className={`fixed top-20 right-4 z-[100] transition-all duration-300 ${
        isVisible 
          ? 'opacity-100 translate-x-0' 
          : 'opacity-0 translate-x-8'
      }`}
    >
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl shadow-2xl shadow-amber-500/30 overflow-hidden">
        <div className="px-4 py-3 flex items-center gap-3">
          {/* 圖示 */}
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Coins size={20} />
          </div>
          
          {/* 內容 */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl">+{points}</span>
              <span className="text-amber-100 text-sm">UA</span>
            </div>
            <p className="text-xs text-amber-100">{reason}</p>
          </div>
        </div>

        {/* 連續登入提示 */}
        {streak && streak > 1 && (
          <div className="px-4 py-2 bg-black/20 flex items-center gap-2 text-xs">
            <Flame size={14} className="text-orange-300" />
            <span>連續登入 {streak} 天</span>
            {streak >= 7 && <Star size={12} className="text-yellow-300" />}
          </div>
        )}
      </div>
    </div>
  );
};

export default PointsNotification;
