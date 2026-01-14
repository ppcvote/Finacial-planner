/**
 * Ultra Advisor - 任務卡片元件
 * 顯示當前任務，點擊可執行任務
 *
 * 檔案位置：src/components/MissionCard.tsx
 */

import React, { useState } from 'react';
import { ChevronRight, Check, Gift, Loader2 } from 'lucide-react';
import { useMissions, Mission } from '../hooks/useMissions';

interface MissionCardProps {
  onOpenModal?: (modalName: string) => void;
  onNavigate?: (path: string) => void;
  onOpenPWAInstall?: () => void;
}

// 分類中文名稱
const categoryNames: Record<string, string> = {
  onboarding: '新手任務',
  social: '社交任務',
  habit: '習慣任務',
  daily: '每日任務',
};

// 分類顏色
const categoryColors: Record<string, string> = {
  onboarding: 'from-emerald-500 to-teal-500',
  social: 'from-blue-500 to-cyan-500',
  habit: 'from-purple-500 to-pink-500',
  daily: 'from-amber-500 to-orange-500',
};

const MissionCard: React.FC<MissionCardProps> = ({
  onOpenModal,
  onNavigate,
  onOpenPWAInstall,
}) => {
  const { currentMission, allCompleted, loading, completeMission } = useMissions();
  const [completing, setCompleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  // 處理任務點擊
  const handleMissionClick = async (mission: Mission) => {
    if (completing) return;

    // 根據連結類型執行不同操作
    switch (mission.linkType) {
      case 'modal':
        if (onOpenModal && mission.linkTarget) {
          onOpenModal(mission.linkTarget);
        }
        break;

      case 'internal':
        if (onNavigate && mission.linkTarget) {
          onNavigate(mission.linkTarget);
        }
        break;

      case 'external':
        if (mission.linkTarget) {
          window.open(mission.linkTarget, '_blank');
        }
        // 對於手動驗證的外部連結，顯示確認完成按鈕
        if (mission.verificationType === 'manual') {
          // 延遲後自動嘗試完成任務
          setTimeout(() => handleManualComplete(mission), 2000);
        }
        break;

      case 'pwa':
        if (onOpenPWAInstall) {
          onOpenPWAInstall();
        }
        break;

      default:
        // 無連結類型（如每日登入），直接嘗試完成
        if (mission.verificationType === 'auto') {
          await handleAutoComplete(mission);
        }
        break;
    }
  };

  // 自動驗證完成
  const handleAutoComplete = async (mission: Mission) => {
    setCompleting(true);
    try {
      const result = await completeMission(mission.id);
      if (result?.success) {
        setEarnedPoints(result.pointsAwarded || 0);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Auto complete error:', error);
    } finally {
      setCompleting(false);
    }
  };

  // 手動確認完成
  const handleManualComplete = async (mission: Mission) => {
    setCompleting(true);
    try {
      const result = await completeMission(mission.id);
      if (result?.success) {
        setEarnedPoints(result.pointsAwarded || 0);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      // 可能還沒完成條件，靜默失敗
      console.log('Manual complete not ready:', error);
    } finally {
      setCompleting(false);
    }
  };

  // 載入中狀態
  if (loading && !currentMission) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
        <div className="flex items-center justify-center gap-2 text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">載入任務中...</span>
        </div>
      </div>
    );
  }

  // 全部完成狀態
  if (allCompleted) {
    return (
      <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl p-4 border border-emerald-500/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Check className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-emerald-400 font-medium">已完成所有任務！</p>
            <p className="text-slate-400 text-sm">持續使用系統獲得更多獎勵</p>
          </div>
          <Gift className="w-5 h-5 text-emerald-400" />
        </div>
      </div>
    );
  }

  // 無任務狀態
  if (!currentMission) {
    return null;
  }

  const mission = currentMission;
  const gradientClass = categoryColors[mission.category] || 'from-slate-500 to-slate-600';

  return (
    <div className="relative">
      {/* 成功提示 */}
      {showSuccess && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce z-10">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span className="font-medium">+{earnedPoints} UA</span>
          </div>
        </div>
      )}

      {/* 任務卡片 */}
      <button
        onClick={() => handleMissionClick(mission)}
        disabled={completing}
        className={`
          w-full text-left
          bg-gradient-to-r ${gradientClass}
          rounded-xl p-4
          border border-white/10
          transition-all duration-200
          hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/20
          active:scale-[0.98]
          disabled:opacity-70 disabled:cursor-not-allowed
        `}
      >
        <div className="flex items-center gap-3">
          {/* 任務圖示 */}
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl flex-shrink-0">
            {mission.icon}
          </div>

          {/* 任務內容 */}
          <div className="flex-1 min-w-0">
            {/* 分類標籤 */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-white/70 bg-white/10 px-2 py-0.5 rounded-full">
                {categoryNames[mission.category]}
              </span>
              {mission.repeatType === 'daily' && (
                <span className="text-xs text-amber-200 bg-amber-500/20 px-2 py-0.5 rounded-full">
                  每日
                </span>
              )}
            </div>

            {/* 任務名稱 */}
            <p className="text-white font-medium truncate">{mission.title}</p>

            {/* 任務說明 */}
            {mission.description && (
              <p className="text-white/60 text-sm truncate mt-0.5">{mission.description}</p>
            )}
          </div>

          {/* 獎勵與箭頭 */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-right">
              <span className="text-white font-bold">+{mission.points}</span>
              <span className="text-white/70 text-sm ml-1">UA</span>
            </div>
            {completing ? (
              <Loader2 className="w-5 h-5 text-white/70 animate-spin" />
            ) : (
              <ChevronRight className="w-5 h-5 text-white/70" />
            )}
          </div>
        </div>
      </button>
    </div>
  );
};

export default MissionCard;
