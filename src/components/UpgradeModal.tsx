// src/components/UpgradeModal.tsx
import React, { useEffect } from 'react';
import { X, Sparkles, Check, ArrowRight, Zap } from 'lucide-react';
import { Tool } from '../constants/tools';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool: Tool | null;
  onUpgrade: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  tool,
  onUpgrade
}) => {
  // ESC 鍵關閉
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !tool) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal 內容 */}
      <div className="relative bg-slate-900 rounded-3xl border border-slate-700 max-w-md w-full overflow-hidden animate-scale-in">
        {/* 頂部裝飾漸層 */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />

        {/* 關閉按鈕 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all z-10"
        >
          <X size={20} />
        </button>

        {/* 內容 */}
        <div className="relative p-8 text-center">
          {/* 圖示 */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center animate-pulse-slow">
            <Sparkles className="text-amber-400" size={36} />
          </div>

          {/* 標題 */}
          <h2 className="text-2xl font-black text-white mb-2">
            解鎖「{tool.label}」
          </h2>
          <p className="text-slate-400 mb-6">
            {tool.description}
          </p>

          {/* 功能列表 */}
          <div className="bg-slate-800/50 rounded-2xl p-5 mb-6 text-left">
            <p className="text-sm text-slate-400 mb-4 flex items-center gap-2">
              <Zap size={14} className="text-amber-400" />
              此工具可協助您：
            </p>
            <ul className="space-y-3">
              {tool.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} className="text-emerald-400" />
                  </div>
                  <span className="text-white text-sm">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 價格提示 */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
            <p className="text-blue-300 text-sm">
              <span className="font-bold">PRO 會員</span> 可使用全部 18 種專業工具
            </p>
            <p className="text-blue-400/80 text-xs mt-1">
              年繳 NT$6,999（平均每天不到 20 元）
            </p>
          </div>

          {/* CTA 按鈕 */}
          <button
            onClick={onUpgrade}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-amber-500/25 group"
          >
            <Sparkles size={18} />
            升級 PRO 解鎖所有工具
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>

          {/* 次要選項 */}
          <button
            onClick={onClose}
            className="mt-4 text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            稍後再說
          </button>
        </div>
      </div>

      {/* 動畫樣式 */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default UpgradeModal;
