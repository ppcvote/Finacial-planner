/**
 * Ultra Advisor - 用戶點數儀表板
 * 顯示 UA 點數、推薦碼、交易紀錄
 * 
 * 檔案位置：src/components/PointsDashboard.tsx
 */

import React, { useState, useEffect } from 'react';
import {
  Coins,
  Gift,
  Users,
  TrendingUp,
  Clock,
  Copy,
  Check,
  ChevronRight,
  Flame,
  AlertTriangle,
  Star,
  Zap,
  X,
} from 'lucide-react';
import { usePoints } from '../hooks/usePoints';

interface PointsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const PointsDashboard: React.FC<PointsDashboardProps> = ({ isOpen, onClose }) => {
  const { getPointsSummary, loading } = usePoints();
  const [summary, setSummary] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSummary();
    }
  }, [isOpen]);

  const loadSummary = async () => {
    const data = await getPointsSummary();
    if (data) {
      setSummary(data);
    }
  };

  const copyReferralCode = () => {
    if (summary?.referralCode) {
      navigator.clipboard.writeText(summary.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 主內容 */}
      <div className="relative w-full max-w-lg bg-slate-900 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* 標題區 */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Coins className="text-white" size={24} />
            <div>
              <h2 className="text-white font-bold text-lg">我的 UA 點數</h2>
              <p className="text-amber-100 text-xs">使用工具、推薦好友賺取點數</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="text-white" size={20} />
          </button>
        </div>

        {/* 內容區 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-slate-400 text-sm">載入中...</p>
            </div>
          ) : summary ? (
            <>
              {/* 點數餘額卡片 */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-xl p-4 border border-amber-500/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-400 text-sm">目前餘額</span>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Flame size={14} />
                    <span className="text-xs">連續登入 {summary.loginStreak} 天</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white">{summary.currentPoints.toLocaleString()}</span>
                  <span className="text-amber-400 font-bold">UA</span>
                </div>
                
                {/* 即將過期提示 */}
                {summary.expiringIn30Days > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 px-3 py-2 rounded-lg">
                    <AlertTriangle size={14} />
                    <span>{summary.expiringIn30Days} 點將於 30 天內過期</span>
                  </div>
                )}
              </div>

              {/* 統計數據 */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                  <TrendingUp size={18} className="mx-auto mb-1 text-green-400" />
                  <p className="text-lg font-bold text-white">{summary.totalEarned.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400">累計獲得</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                  <Gift size={18} className="mx-auto mb-1 text-blue-400" />
                  <p className="text-lg font-bold text-white">{summary.totalSpent.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400">已兌換</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                  <Users size={18} className="mx-auto mb-1 text-purple-400" />
                  <p className="text-lg font-bold text-white">{summary.referralCount}</p>
                  <p className="text-[10px] text-slate-400">推薦人數</p>
                </div>
              </div>

              {/* 推薦碼區塊 */}
              <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-4 border border-purple-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-300 flex items-center gap-2">
                    <Star size={16} className="text-purple-400" />
                    我的推薦碼
                  </span>
                  <span className="text-xs text-purple-300 bg-purple-500/20 px-2 py-1 rounded">
                    推薦成功 +500 UA
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-900/50 rounded-lg px-4 py-3 font-mono font-bold text-lg text-white tracking-wider">
                    {summary.referralCode || '載入中...'}
                  </div>
                  <button
                    onClick={copyReferralCode}
                    className={`p-3 rounded-lg transition-all ${
                      copied 
                        ? 'bg-green-500 text-white' 
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                    }`}
                  >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  分享給朋友註冊，雙方各得 500 UA 點！
                </p>
              </div>

              {/* 最近交易紀錄 */}
              <div className="bg-slate-800/30 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    <Clock size={16} />
                    最近紀錄
                  </span>
                </div>
                <div className="divide-y divide-slate-700/30">
                  {summary.recentTransactions?.length > 0 ? (
                    summary.recentTransactions.map((tx: any) => (
                      <div key={tx.id} className="px-4 py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm text-white">{tx.reason}</p>
                          <p className="text-xs text-slate-500">{formatDate(tx.createdAt)}</p>
                        </div>
                        <span className={`font-bold ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {tx.amount >= 0 ? '+' : ''}{tx.amount} UA
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-slate-500 text-sm">
                      還沒有交易紀錄<br/>
                      <span className="text-xs">每天登入、使用工具都能獲得點數！</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 賺點提示 */}
              <div className="bg-slate-800/30 rounded-xl p-4">
                <p className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                  <Zap size={16} className="text-amber-400" />
                  如何賺取更多 UA 點？
                </p>
                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>📅 每日登入</span>
                    <span className="text-amber-400">+5 UA</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>🔧 使用工具（每日最多10次）</span>
                    <span className="text-amber-400">+10 UA</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>🔥 連續登入 7 天</span>
                    <span className="text-amber-400">+50 UA</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>🔥 連續登入 30 天</span>
                    <span className="text-amber-400">+200 UA</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>👥 推薦好友成功</span>
                    <span className="text-purple-400">+500 UA</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400">
              無法載入點數資訊
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PointsDashboard;
