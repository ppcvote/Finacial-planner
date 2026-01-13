/**
 * Ultra Advisor - 工具鎖定提示組件
 * 當免費會員嘗試使用付費工具時顯示
 * 
 * 檔案位置：src/components/ToolLockedOverlay.tsx
 */

import React from 'react';
import { Lock, Crown, Zap, Check, ArrowRight } from 'lucide-react';

interface ToolLockedOverlayProps {
  toolName: string;
  onUpgrade?: () => void;
}

const ToolLockedOverlay: React.FC<ToolLockedOverlayProps> = ({ toolName, onUpgrade }) => {
  const handleUpgrade = () => {
    // 導向訂閱頁面
    window.open('https://portaly.cc/GinRollBT', '_blank');
    onUpgrade?.();
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* 鎖定圖示 */}
        <div className="relative inline-block mb-6">
          <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-700">
            <Lock size={40} className="text-slate-500" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
            <Crown size={20} className="text-white" />
          </div>
        </div>

        {/* 標題 */}
        <h2 className="text-2xl font-bold text-white mb-2">
          {toolName}
        </h2>
        <p className="text-slate-400 mb-6">
          此工具僅限付費會員使用
        </p>

        {/* 升級好處 */}
        <div className="bg-slate-800/50 rounded-xl p-4 mb-6 text-left">
          <p className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
            <Zap size={16} className="text-amber-400" />
            升級後可享有
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Check size={16} className="text-green-400" />
              <span>18 種專業理財工具全部解鎖</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Check size={16} className="text-green-400" />
              <span>無限客戶檔案管理</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Check size={16} className="text-green-400" />
              <span>專業報表匯出</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Check size={16} className="text-green-400" />
              <span>2x UA 點數倍率</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Check size={16} className="text-green-400" />
              <span>自訂推薦碼</span>
            </div>
          </div>
        </div>

        {/* 升級按鈕 */}
        <button
          onClick={handleUpgrade}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2"
        >
          <Crown size={20} />
          立即升級解鎖
          <ArrowRight size={20} />
        </button>

        {/* 免費工具提示 */}
        <p className="text-xs text-slate-500 mt-4">
          免費會員可使用：大小水庫、金融房產、稅務傳承
        </p>
      </div>
    </div>
  );
};

export default ToolLockedOverlay;
