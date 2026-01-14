/**
 * Ultra Advisor - PWA 安裝教學 Modal
 * 引導用戶將網站加入主畫面
 *
 * 檔案位置：src/components/PWAInstallModal.tsx
 */

import React, { useState, useEffect } from 'react';
import { X, Smartphone, Monitor, Share, Plus, MoreVertical, Download } from 'lucide-react';
import { missionsApi } from '../hooks/useMissions';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (points: number) => void;
}

type DeviceType = 'ios' | 'android' | 'desktop';

const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [activeTab, setActiveTab] = useState<DeviceType>('ios');
  const [completing, setCompleting] = useState(false);

  // 自動偵測裝置類型
  useEffect(() => {
    if (isOpen) {
      const userAgent = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(userAgent)) {
        setActiveTab('ios');
      } else if (/android/.test(userAgent)) {
        setActiveTab('android');
      } else {
        setActiveTab('desktop');
      }
    }
  }, [isOpen]);

  // 處理完成按鈕
  const handleComplete = async () => {
    setCompleting(true);
    try {
      const result = await missionsApi.completeMission('pwa_install');
      if (result.success && onComplete) {
        onComplete(result.pointsAwarded || 0);
      }
      onClose();
    } catch (error) {
      console.error('PWA install complete error:', error);
      // 即使失敗也關閉 Modal
      onClose();
    } finally {
      setCompleting(false);
    }
  };

  if (!isOpen) return null;

  const tabs: { id: DeviceType; label: string; icon: React.ReactNode }[] = [
    { id: 'ios', label: 'iOS', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'android', label: 'Android', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'desktop', label: '電腦版', icon: <Monitor className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal 內容 */}
      <div className="relative w-full max-w-md bg-slate-900 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* 標題 */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">加入主畫面</h2>
              <p className="text-white/70 text-xs">像 App 一樣快速開啟</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="text-white" size={20} />
          </button>
        </div>

        {/* Tab 切換 */}
        <div className="flex border-b border-slate-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 px-4 py-3 flex items-center justify-center gap-2
                text-sm font-medium transition-colors
                ${activeTab === tab.id
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
                }
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* 內容區 */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'ios' && <IOSInstructions />}
          {activeTab === 'android' && <AndroidInstructions />}
          {activeTab === 'desktop' && <DesktopInstructions />}
        </div>

        {/* 底部按鈕 */}
        <div className="p-4 border-t border-slate-700 bg-slate-800/50">
          <button
            onClick={handleComplete}
            disabled={completing}
            className={`
              w-full py-3 rounded-xl font-medium
              bg-gradient-to-r from-emerald-500 to-teal-500
              text-white
              transition-all duration-200
              hover:shadow-lg hover:shadow-emerald-500/30
              disabled:opacity-70 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
            `}
          >
            {completing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                處理中...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                我已完成安裝
              </>
            )}
          </button>
          <p className="text-center text-slate-500 text-xs mt-2">
            完成後可獲得 +30 UA 點數獎勵
          </p>
        </div>
      </div>
    </div>
  );
};

// iOS 安裝步驟
const IOSInstructions: React.FC = () => (
  <div className="space-y-6">
    <p className="text-slate-300 text-sm">
      請使用 <span className="text-blue-400 font-medium">Safari</span> 瀏覽器完成以下步驟：
    </p>

    {/* 步驟 1 */}
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
          <span className="text-blue-400 font-bold">1</span>
        </div>
        <div>
          <p className="text-white font-medium mb-2">
            點擊底部「分享」按鈕
          </p>
          <div className="bg-slate-700/50 rounded-lg p-3 flex items-center justify-center">
            <Share className="w-6 h-6 text-blue-400" />
          </div>
          <p className="text-slate-400 text-xs mt-2">
            位於 Safari 瀏覽器底部工具列
          </p>
        </div>
      </div>
    </div>

    {/* 步驟 2 */}
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
          <span className="text-blue-400 font-bold">2</span>
        </div>
        <div>
          <p className="text-white font-medium mb-2">
            向下滑動，點擊「加入主畫面」
          </p>
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="flex items-center gap-3 text-white">
              <Plus className="w-5 h-5 text-blue-400" />
              <span>加入主畫面</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* 步驟 3 */}
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
          <span className="text-blue-400 font-bold">3</span>
        </div>
        <div>
          <p className="text-white font-medium mb-2">
            點擊右上角「新增」
          </p>
          <div className="bg-slate-700/50 rounded-lg p-3 flex justify-end">
            <span className="text-blue-400 font-medium">新增</span>
          </div>
        </div>
      </div>
    </div>

    {/* 完成提示 */}
    <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30">
      <p className="text-emerald-400 text-sm flex items-center gap-2">
        <span className="text-lg">✅</span>
        完成！現在可以從主畫面直接開啟 Ultra Advisor
      </p>
    </div>
  </div>
);

// Android 安裝步驟
const AndroidInstructions: React.FC = () => (
  <div className="space-y-6">
    <p className="text-slate-300 text-sm">
      請使用 <span className="text-green-400 font-medium">Chrome</span> 瀏覽器完成以下步驟：
    </p>

    {/* 步驟 1 */}
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
          <span className="text-green-400 font-bold">1</span>
        </div>
        <div>
          <p className="text-white font-medium mb-2">
            點擊右上角「選單」按鈕
          </p>
          <div className="bg-slate-700/50 rounded-lg p-3 flex items-center justify-center">
            <MoreVertical className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-slate-400 text-xs mt-2">
            三個垂直的點點
          </p>
        </div>
      </div>
    </div>

    {/* 步驟 2 */}
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
          <span className="text-green-400 font-bold">2</span>
        </div>
        <div>
          <p className="text-white font-medium mb-2">
            點擊「加到主畫面」或「安裝應用程式」
          </p>
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="flex items-center gap-3 text-white">
              <Download className="w-5 h-5 text-green-400" />
              <span>加到主畫面</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* 步驟 3 */}
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
          <span className="text-green-400 font-bold">3</span>
        </div>
        <div>
          <p className="text-white font-medium mb-2">
            確認名稱後點擊「新增」或「安裝」
          </p>
          <div className="bg-slate-700/50 rounded-lg p-3 flex justify-end">
            <span className="text-green-400 font-medium">安裝</span>
          </div>
        </div>
      </div>
    </div>

    {/* 完成提示 */}
    <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30">
      <p className="text-emerald-400 text-sm flex items-center gap-2">
        <span className="text-lg">✅</span>
        完成！現在可以從主畫面直接開啟 Ultra Advisor
      </p>
    </div>
  </div>
);

// 電腦版安裝步驟
const DesktopInstructions: React.FC = () => (
  <div className="space-y-6">
    <p className="text-slate-300 text-sm">
      請使用 <span className="text-blue-400 font-medium">Chrome</span> 或 <span className="text-blue-400 font-medium">Edge</span> 瀏覽器：
    </p>

    {/* 步驟 1 */}
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
          <span className="text-purple-400 font-bold">1</span>
        </div>
        <div>
          <p className="text-white font-medium mb-2">
            查看網址列右側的安裝圖示
          </p>
          <div className="bg-slate-700/50 rounded-lg p-3 flex items-center gap-2">
            <div className="flex-1 bg-slate-600 rounded px-3 py-1 text-slate-400 text-sm">
              ultra-advisor.tw
            </div>
            <Download className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-slate-400 text-xs mt-2">
            或點擊選單 → 「安裝 Ultra Advisor」
          </p>
        </div>
      </div>
    </div>

    {/* 步驟 2 */}
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
          <span className="text-purple-400 font-bold">2</span>
        </div>
        <div>
          <p className="text-white font-medium mb-2">
            點擊「安裝」確認
          </p>
          <div className="bg-slate-700/50 rounded-lg p-3 flex justify-end">
            <span className="text-purple-400 font-medium">安裝</span>
          </div>
        </div>
      </div>
    </div>

    {/* 完成提示 */}
    <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30">
      <p className="text-emerald-400 text-sm flex items-center gap-2">
        <span className="text-lg">✅</span>
        完成！可以從桌面或應用程式列表開啟
      </p>
    </div>

    {/* 提示 */}
    <div className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/30">
      <p className="text-amber-400 text-xs">
        💡 建議在手機上使用，體驗更好！
      </p>
    </div>
  </div>
);

export default PWAInstallModal;
