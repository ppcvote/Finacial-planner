/**
 * Ultra Advisor - UA 推薦引擎 Modal
 * 顯示推薦碼、UA 點數、推薦紀錄
 * 
 * 檔案位置：src/components/ReferralEngineModal.tsx
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Users,
  Coins,
  Gift,
  TrendingUp,
  Clock,
  Flame,
  Star,
  AlertTriangle,
  Zap,
  Share2,
  Edit3,
  Save,
  Loader2,
  Lock,
  Ticket,
  ShoppingBag,
} from 'lucide-react';
import { pointsApi } from '../hooks/usePoints';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import StoreModal from './StoreModal';

interface ReferralEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const ReferralEngineModal: React.FC<ReferralEngineModalProps> = ({
  isOpen,
  onClose,
  userId
}) => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [editingCode, setEditingCode] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [savingCode, setSavingCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

  // 🆕 新增：用戶會員資訊
  const [userTier, setUserTier] = useState<string>('trial');
  const [referredBy, setReferredBy] = useState<string | null>(null);

  // 🆕 新增：輸入推薦碼相關
  const [enteringReferralCode, setEnteringReferralCode] = useState(false);
  const [inputReferralCode, setInputReferralCode] = useState('');
  const [submittingReferral, setSubmittingReferral] = useState(false);
  const [referralError, setReferralError] = useState<string | null>(null);
  const [referralSuccess, setReferralSuccess] = useState(false);

  // 🆕 商城 Modal 狀態
  const [storeModalOpen, setStoreModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      loadAllData();
    }
  }, [isOpen, userId]);

  // 🆕 並行載入所有數據，大幅提升載入速度
  const loadAllData = async () => {
    setLoading(true);
    try {
      // 並行執行兩個 API 調用
      const [summaryData, userDoc] = await Promise.all([
        pointsApi.getSummary(),
        getDoc(doc(db, 'users', userId))
      ]);

      // 更新摘要資料
      if (summaryData) {
        setSummary(summaryData);
        setNewCode(summaryData.referralCode || '');
      }

      // 更新用戶資訊
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserTier(data.primaryTierId || 'trial');
        setReferredBy(data.referredBy || null);
      }
    } catch (err) {
      console.error('Load data failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // 重新載入摘要（用於推薦碼提交後）
  const reloadSummary = async () => {
    try {
      const data = await pointsApi.getSummary();
      if (data) {
        setSummary(data);
        setNewCode(data.referralCode || '');
      }
    } catch (err) {
      console.error('Reload summary failed:', err);
    }
  };

  // 🆕 判斷是否為付費會員
  const isPaidMember = ['founder', 'paid'].includes(userTier);

  // 🆕 判斷是否可以輸入推薦碼（試用會員且尚未被推薦）
  const canEnterReferralCode = !isPaidMember && !referredBy;

  // 🆕 提交推薦碼
  const handleSubmitReferralCode = async () => {
    if (!inputReferralCode.trim()) return;

    setSubmittingReferral(true);
    setReferralError(null);
    setReferralSuccess(false);

    try {
      await pointsApi.useReferral(inputReferralCode.toUpperCase());
      setReferralSuccess(true);
      setEnteringReferralCode(false);
      setInputReferralCode('');
      setReferredBy(inputReferralCode.toUpperCase()); // 更新狀態
      await reloadSummary(); // 重新載入以顯示新點數
    } catch (err: any) {
      setReferralError(err.message || '推薦碼無效或已使用過');
    } finally {
      setSubmittingReferral(false);
    }
  };

  const copyReferralCode = () => {
    if (summary?.referralCode) {
      navigator.clipboard.writeText(summary.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyShareLink = () => {
    const link = `https://ultra-advisor.tw?ref=${summary?.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveCode = async () => {
    if (!newCode.trim() || newCode === summary?.referralCode) {
      setEditingCode(false);
      return;
    }

    setSavingCode(true);
    try {
      await pointsApi.updateReferralCode(newCode.toUpperCase());
      await reloadSummary();
      setEditingCode(false);
    } catch (err: any) {
      alert(err.message || '修改失敗，此推薦碼可能已被使用');
    } finally {
      setSavingCode(false);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('zh-TW', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) return null;

  return (
    <>
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg 
                     shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl 
                           flex items-center justify-center">
              <Share2 className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">UA 推薦引擎</h3>
              <p className="text-xs text-slate-500">邀請好友，一起賺點數</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="animate-spin mx-auto mb-2 text-purple-400" size={32} />
              <p className="text-slate-500 text-sm">載入中...</p>
            </div>
          ) : summary ? (
            <>
              {/* 推薦碼區塊 */}
              <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 
                             border border-purple-500/30 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-300 flex items-center gap-2">
                    <Star size={16} className="text-purple-400" />
                    我的推薦碼
                  </span>
                  <span className="text-xs text-purple-300 bg-purple-500/20 px-2 py-1 rounded">
                    付費 +1000 UA
                  </span>
                </div>
                
                {editingCode ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newCode}
                      onChange={e => setNewCode(e.target.value.toUpperCase())}
                      maxLength={12}
                      className="flex-1 bg-slate-900/50 rounded-lg px-4 py-3 font-mono font-bold
                               text-lg text-white tracking-wider border border-purple-500/50
                               focus:border-purple-400 outline-none uppercase"
                      placeholder="輸入新推薦碼"
                    />
                    <button
                      onClick={handleSaveCode}
                      disabled={savingCode}
                      className="p-3 bg-purple-600 hover:bg-purple-500 rounded-lg text-white transition-all"
                    >
                      {savingCode ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                    </button>
                    <button
                      onClick={() => { setEditingCode(false); setNewCode(summary.referralCode); }}
                      className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-900/50 rounded-lg px-4 py-3 font-mono font-bold
                                  text-xl text-white tracking-wider border border-slate-700">
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
                    {/* 🆕 只有付費會員才能修改推薦碼 */}
                    {isPaidMember ? (
                      <button
                        onClick={() => setEditingCode(true)}
                        className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-all"
                        title="自訂推薦碼"
                      >
                        <Edit3 size={20} />
                      </button>
                    ) : (
                      <button
                        className="p-3 bg-slate-800 rounded-lg text-slate-500 cursor-not-allowed relative group"
                        title="付費會員才能自訂推薦碼"
                        disabled
                      >
                        <Lock size={20} />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5
                                      bg-slate-700 text-slate-300 text-xs rounded-lg whitespace-nowrap
                                      opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          付費會員才能自訂
                        </div>
                      </button>
                    )}
                  </div>
                )}

                <p className="text-xs text-slate-400 mt-3">
                  分享給朋友註冊，雙方各得 <span className="text-purple-300 font-bold">500 UA</span> 點！
                </p>

                {/* 分享按鈕 */}
                <button
                  onClick={copyShareLink}
                  className="w-full mt-3 py-2 bg-purple-600/20 hover:bg-purple-600/30
                           border border-purple-500/30 rounded-xl text-purple-300 text-sm font-bold
                           flex items-center justify-center gap-2 transition-all"
                >
                  <Share2 size={16} />
                  複製分享連結
                </button>
              </div>

              {/* 🆕 試用會員輸入推薦碼區塊 */}
              {canEnterReferralCode && (
                <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30
                               border border-emerald-500/30 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-300 flex items-center gap-2">
                      <Ticket size={16} className="text-emerald-400" />
                      輸入推薦碼
                    </span>
                    <span className="text-xs text-emerald-300 bg-emerald-500/20 px-2 py-1 rounded">
                      獲得 +500 UA
                    </span>
                  </div>

                  {referralSuccess ? (
                    <div className="flex items-center gap-3 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
                      <Check className="text-emerald-400" size={24} />
                      <div>
                        <p className="text-emerald-300 font-bold">推薦碼驗證成功！</p>
                        <p className="text-emerald-400/70 text-xs">已獲得 500 UA 點數獎勵</p>
                      </div>
                    </div>
                  ) : enteringReferralCode ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={inputReferralCode}
                          onChange={e => setInputReferralCode(e.target.value.toUpperCase())}
                          maxLength={12}
                          className="flex-1 bg-slate-900/50 rounded-lg px-4 py-3 font-mono font-bold
                                   text-lg text-white tracking-wider border border-emerald-500/50
                                   focus:border-emerald-400 outline-none uppercase"
                          placeholder="輸入朋友的推薦碼"
                          disabled={submittingReferral}
                        />
                        <button
                          onClick={handleSubmitReferralCode}
                          disabled={submittingReferral || !inputReferralCode.trim()}
                          className="p-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white
                                   transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submittingReferral ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                        </button>
                        <button
                          onClick={() => { setEnteringReferralCode(false); setInputReferralCode(''); setReferralError(null); }}
                          className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-all"
                          disabled={submittingReferral}
                        >
                          <X size={20} />
                        </button>
                      </div>
                      {referralError && (
                        <div className="flex items-center gap-2 text-red-400 text-sm">
                          <AlertTriangle size={14} />
                          {referralError}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => setEnteringReferralCode(true)}
                      className="w-full py-3 bg-emerald-600/20 hover:bg-emerald-600/30
                               border border-emerald-500/30 rounded-xl text-emerald-300 text-sm font-bold
                               flex items-center justify-center gap-2 transition-all"
                    >
                      <Gift size={16} />
                      我有推薦碼
                    </button>
                  )}

                  <p className="text-xs text-slate-500 mt-3">
                    有朋友推薦你來嗎？輸入他的推薦碼，付費後雙方各得 1000 UA！
                  </p>
                </div>
              )}

              {/* 🆕 已被推薦顯示 */}
              {referredBy && (
                <div className="flex items-center gap-3 p-3 bg-emerald-900/20 border border-emerald-500/30 rounded-xl">
                  <Check size={18} className="text-emerald-400 shrink-0" />
                  <p className="text-xs text-emerald-300">
                    你是由 <span className="font-bold font-mono">{referredBy}</span> 推薦加入的
                  </p>
                </div>
              )}

              {/* 數據統計 */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700/50">
                  <Coins size={20} className="mx-auto mb-2 text-amber-400" />
                  <p className="text-2xl font-black text-white">{summary.currentPoints?.toLocaleString() || 0}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">UA 點數</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700/50">
                  <Users size={20} className="mx-auto mb-2 text-purple-400" />
                  <p className="text-2xl font-black text-white">{summary.referralCount || 0}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">推薦人數</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700/50">
                  <Flame size={20} className="mx-auto mb-2 text-orange-400" />
                  <p className="text-2xl font-black text-white">{summary.loginStreak || 0}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">連續登入</p>
                </div>
              </div>

              {/* 🛍️ UA 商城入口 */}
              <button
                onClick={() => setStoreModalOpen(true)}
                className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600
                         hover:from-pink-500 hover:to-purple-500
                         rounded-xl text-white font-bold text-base
                         flex items-center justify-center gap-3 transition-all
                         shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
              >
                <ShoppingBag size={20} />
                進入 UA 商城
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  用點數兌換好禮
                </span>
              </button>

              {/* 點數即將過期提示 */}
              {summary.expiringIn30Days > 0 && (
                <div className="flex items-center gap-3 p-3 bg-amber-900/20 border border-amber-500/30 rounded-xl">
                  <AlertTriangle size={18} className="text-amber-400 shrink-0" />
                  <p className="text-xs text-amber-300">
                    <span className="font-bold">{summary.expiringIn30Days}</span> 點將於 30 天內過期
                  </p>
                </div>
              )}

              {/* Tab 切換 */}
              <div className="flex bg-slate-950 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                    activeTab === 'overview' 
                      ? 'bg-slate-700 text-white' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  賺點方式
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                    activeTab === 'history' 
                      ? 'bg-slate-700 text-white' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  最近紀錄
                </button>
              </div>

              {activeTab === 'overview' ? (
                /* 賺點方式 */
                <div className="bg-slate-800/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Clock size={14} /> 每日登入
                    </span>
                    <span className="text-amber-400 font-bold">+5 UA</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Zap size={14} /> 使用工具（每日 10 次）
                    </span>
                    <span className="text-amber-400 font-bold">+10 UA</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Flame size={14} /> 連續登入 7 天
                    </span>
                    <span className="text-amber-400 font-bold">+50 UA</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Flame size={14} /> 連續登入 30 天
                    </span>
                    <span className="text-amber-400 font-bold">+200 UA</span>
                  </div>
                  <div className="flex items-center justify-between text-sm border-t border-slate-700 pt-3">
                    <span className="text-slate-300 flex items-center gap-2 font-bold">
                      <Users size={14} className="text-purple-400" /> 推薦好友成功
                    </span>
                    <span className="text-purple-400 font-bold">+500 UA</span>
                  </div>
                </div>
              ) : (
                /* 最近紀錄 */
                <div className="bg-slate-800/30 rounded-xl overflow-hidden">
                  {summary.recentTransactions?.length > 0 ? (
                    <div className="divide-y divide-slate-700/30 max-h-48 overflow-y-auto">
                      {summary.recentTransactions.map((tx: any) => (
                        <div key={tx.id} className="px-4 py-3 flex items-center justify-between">
                          <div>
                            <p className="text-sm text-white">{tx.reason}</p>
                            <p className="text-xs text-slate-500">{formatDate(tx.createdAt)}</p>
                          </div>
                          <span className={`font-bold text-sm ${
                            tx.amount >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {tx.amount >= 0 ? '+' : ''}{tx.amount} UA
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-500 text-sm">
                      還沒有交易紀錄
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-slate-400">
              無法載入資料
            </div>
          )}
        </div>
      </div>
    </div>

    {/* UA 商城 Modal */}
    <StoreModal
      isOpen={storeModalOpen}
      onClose={() => setStoreModalOpen(false)}
      userPoints={summary?.currentPoints || 0}
      onPointsChange={reloadSummary}
    />
    </>
  );
};

export default ReferralEngineModal;
