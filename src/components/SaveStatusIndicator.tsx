// src/components/SaveStatusIndicator.tsx
import React from 'react';
import { Check, Loader2, AlertCircle, CloudOff, Save } from 'lucide-react';

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error' | 'offline';

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  isCollapsed?: boolean;
  lastSavedAt?: Date | null;
  onManualSave?: () => void;  // 手動存檔回調
}

const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({
  status,
  isCollapsed = false,
  onManualSave,
  // lastSavedAt 暫未使用
}) => {
  // 狀態配置
  const config: Record<SaveStatus, {
    icon: React.ReactNode;
    text: string;
    dotColor: string;
    textColor: string;
    bgColor: string;
  }> = {
    saved: {
      icon: <Check size={12} />,
      text: '已同步',
      dotColor: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10'
    },
    saving: {
      icon: <Loader2 size={12} className="animate-spin" />,
      text: '儲存中...',
      dotColor: 'bg-blue-500 animate-pulse',
      textColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    unsaved: {
      icon: <AlertCircle size={12} />,
      text: '未儲存',
      dotColor: 'bg-amber-500',
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10'
    },
    error: {
      icon: <CloudOff size={12} />,
      text: '儲存失敗',
      dotColor: 'bg-red-500',
      textColor: 'text-red-400',
      bgColor: 'bg-red-500/10'
    },
    offline: {
      icon: <CloudOff size={12} />,
      text: '離線中',
      dotColor: 'bg-slate-500',
      textColor: 'text-slate-400',
      bgColor: 'bg-slate-500/10'
    }
  };

  const { text, dotColor, textColor, bgColor } = config[status];

  // 判斷是否可點擊（未儲存或錯誤狀態可手動存檔）
  const isClickable = onManualSave && (status === 'unsaved' || status === 'error');

  // 收合模式：只顯示圓點（可點擊時變成按鈕）
  if (isCollapsed) {
    if (isClickable) {
      return (
        <button
          onClick={onManualSave}
          className={`w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-800 transition-all group`}
          title="點擊立即儲存"
        >
          <div className={`w-2.5 h-2.5 rounded-full ${dotColor} group-hover:scale-125 transition-transform`} />
        </button>
      );
    }
    return (
      <div
        className={`w-2.5 h-2.5 rounded-full ${dotColor}`}
        title={text}
      />
    );
  }

  // 展開模式：完整顯示（可點擊時變成按鈕）
  if (isClickable) {
    return (
      <button
        onClick={onManualSave}
        className={`
          inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
          ${bgColor} ${textColor}
          hover:ring-2 hover:ring-amber-500/50 transition-all cursor-pointer
          group
        `}
        title="點擊立即儲存"
      >
        <Save size={12} className="group-hover:scale-110 transition-transform" />
        <span className="text-xs font-medium">點擊儲存</span>
      </button>
    );
  }

  return (
    <div className={`
      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
      ${bgColor} ${textColor}
    `}>
      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      <span className="text-xs font-medium">{text}</span>
    </div>
  );
};

export default SaveStatusIndicator;
