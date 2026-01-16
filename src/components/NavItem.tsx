// src/components/NavItem.tsx
import React from 'react';
import { LucideIcon, Sparkles } from 'lucide-react';

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  isPro: boolean;
  hasAccess: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  icon: Icon,
  label,
  isActive,
  isPro,
  hasAccess,
  isCollapsed,
  onClick
}) => {
  // 根據狀態決定樣式
  const getStyles = () => {
    // 先檢查權限 - 沒有權限的工具永遠不顯示為選中狀態
    if (!hasAccess) {
      // PRO 工具但無權限：淡化顯示（鎖定狀態）
      return 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50';
    }
    if (isActive) {
      return 'bg-blue-600/20 text-blue-400 border border-blue-500/30';
    }
    return 'text-slate-400 hover:text-white hover:bg-slate-800';
  };

  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
        ${getStyles()}
        ${isCollapsed ? 'justify-center' : ''}
      `}
      title={isCollapsed ? label : undefined}
    >
      {/* 圖示 */}
      <Icon size={18} className="shrink-0" />

      {/* 標籤和 PRO 指示（展開時顯示） */}
      {!isCollapsed && (
        <>
          <span className="flex-1 text-left text-sm font-medium truncate">
            {label}
          </span>

          {/* PRO 工具無權限時顯示小星星提示 */}
          {isPro && !hasAccess && (
            <Sparkles size={14} className="text-amber-400/60" />
          )}
        </>
      )}
    </button>
  );
};

export default NavItem;
