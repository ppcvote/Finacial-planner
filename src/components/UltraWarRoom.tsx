import React, { useState, useEffect, useRef } from 'react';
import {
  Calculator, Lock, User, Camera, Mail, Phone, MessageCircle, Instagram,
  Home, TrendingUp, Coins, Check, AlertCircle, Eye, EyeOff, Info, Zap,
  Users, Search, Plus, Trash2, LogOut, Settings, X,
  Clock, TriangleAlert, ShieldAlert, Activity, Edit3, Save, Loader2,
  Heart, RefreshCw, Download, Sparkles, Crown, BarChart3, Bell,
  MessageSquarePlus, Send, Lightbulb, ChevronDown, BookOpen, Sun, Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { 
  getAuth, 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider,
  updateProfile 
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { db, storage } from '../firebase';

// 🆕 會員系統與推薦引擎
import { useMembership } from '../hooks/useMembership';
import ReferralEngineModal from './ReferralEngineModal';

// 🆕 任務看板
import MissionCard from './MissionCard';
import PWAInstallModal from './PWAInstallModal';

// ==========================================
// 🎨 市場快訊跑馬燈（含傲創計算機入口）
// ==========================================
const MarketTicker = () => {
  const [cancerSeconds, setCancerSeconds] = useState(228);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => {
      setCancerSeconds(prev => (prev <= 1 ? 228 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs < 10 ? '0' : ''}${rs}`;
  };

  return (
    <div className="bg-gradient-to-r from-red-900/80 to-red-800/80 text-white py-2 px-4
                    border-b border-red-500/20 flex items-center">
      {/* 跑馬燈區域 */}
      <div className="flex-1 overflow-hidden whitespace-nowrap">
        <div className="flex animate-marquee items-center gap-12 font-black text-[10px] uppercase tracking-widest">
          <span className="flex items-center gap-2">
            <Heart size={12} className="text-red-400 animate-pulse" />
            癌症時鐘：{formatTime(cancerSeconds)}
          </span>
          <span className="flex items-center gap-2">
            <TriangleAlert size={12} className="text-amber-400" />
            醫療通膨：+15.8%
          </span>
          <span className="flex items-center gap-2">
            <TrendingUp size={12} className="text-emerald-400" />
            實質通膨：4.5%
          </span>
          <span className="flex items-center gap-2">
            <ShieldAlert size={12} className="text-orange-400" />
            勞保倒數：2031
          </span>
          <span className="flex items-center gap-2">
            <Heart size={12} className="text-red-400 animate-pulse" />
            癌症時鐘：{formatTime(cancerSeconds)}
          </span>
          <span className="flex items-center gap-2">
            <TriangleAlert size={12} className="text-amber-400" />
            醫療通膨：+15.8%
          </span>
        </div>
      </div>

      {/* 傲創計算機按鈕 */}
      <a
        href="/calculator"
        className="ml-4 flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500
                 text-white text-xs font-bold rounded-lg transition-all shrink-0"
      >
        <Calculator size={14} />
        <span className="hidden sm:inline">傲創計算機</span>
      </a>

      {/* 知識庫按鈕 */}
      <a
        href="https://ultra-advisor.tw/blog"
        target="_blank"
        rel="noopener noreferrer"
        className="ml-2 flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500
                 text-white text-xs font-bold rounded-lg transition-all shrink-0"
      >
        <BookOpen size={14} />
        <span className="hidden sm:inline">知識庫</span>
      </a>

      {/* 主題切換按鈕 */}
      <button
        onClick={toggleTheme}
        className="ml-2 flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30
                 text-amber-300 text-xs font-bold rounded-lg transition-all shrink-0 border border-amber-500/30"
        title={theme === 'dark' ? '切換至亮色模式' : '切換至深色模式'}
      >
        {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        <span className="hidden sm:inline">{theme === 'dark' ? '亮色' : '深色'}</span>
      </button>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </div>
  );
};

// Profile Data Interface
interface ProfileData {
  displayName: string;
  photoURL: string;
  email: string;
  phone: string;
  lineId: string;
  instagram: string;
}

// ==========================================
// 👤 個人檔案卡片
// ==========================================
const ProfileCard = ({
  user,
  profileData,
  membership,
  onEditProfile,
  onChangePassword,
  onOpenReferral,
  onOpenPayment
}: {
  user: any;
  profileData: ProfileData;
  membership: any;
  onEditProfile: () => void;
  onChangePassword: () => void;
  onOpenReferral: () => void;
  onOpenPayment: (isReferral: boolean) => void;
}) => {
  return (
    <div className="dark:bg-slate-900/50 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl p-6 
                    hover:border-blue-500/30 transition-all">
      <div className="flex items-start gap-4">
        {/* 大頭貼 */}
        <div className="relative group">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 
                         flex items-center justify-center overflow-hidden border-2 border-slate-700
                         group-hover:border-blue-500 transition-all">
            {profileData.photoURL ? (
              <img 
                src={profileData.photoURL} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-black text-white">
                {profileData.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full 
                         flex items-center justify-center border-2 border-slate-900">
            <Check size={12} className="text-white" />
          </div>
        </div>

        {/* 資訊 */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-black text-white truncate">
            {profileData.displayName || '專業財務顧問'}
          </h3>
          <p className="text-slate-400 text-sm truncate">
            {user?.email || 'email@example.com'}
          </p>
          
          {/* 🆕 會員身分與天數 */}
          {membership && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: `${membership.tierColor}20`,
                  color: membership.tierColor,
                  border: `1px solid ${membership.tierColor}30`
                }}
              >
                {membership.tier === 'founder' && <Crown size={12} />}
                {membership.tierName}
              </span>
              {/* 🆕 顯示剩餘天數 */}
              {membership.tier !== 'founder' && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  membership.daysRemaining <= 3 ? 'bg-red-500/20 text-red-400' :
                  membership.daysRemaining <= 7 ? 'bg-amber-500/20 text-amber-400' :
                  'bg-slate-700 text-slate-400'
                }`}>
                  {membership.tier === 'grace'
                    ? `寬限期 ${membership.graceDaysRemaining} 天`
                    : membership.tier === 'expired'
                    ? '已過期'
                    : `剩餘 ${membership.daysRemaining} 天`
                  }
                </span>
              )}
            </div>
          )}
          
          {/* 社群連結 */}
          <div className="flex flex-wrap gap-2 mt-2">
            {profileData.phone && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800 
                             rounded-lg text-xs text-slate-400">
                <Phone size={12} /> {profileData.phone}
              </span>
            )}
            {profileData.lineId && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-900/30 
                             border border-emerald-500/30 rounded-lg text-xs text-emerald-400">
                <MessageCircle size={12} /> {profileData.lineId}
              </span>
            )}
            {profileData.instagram && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-900/30 
                             border border-pink-500/30 rounded-lg text-xs text-pink-400">
                <Instagram size={12} /> {profileData.instagram}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 操作按鈕 */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-slate-800">
        <button
          onClick={onEditProfile}
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-600/10 
                   border border-blue-500/30 rounded-xl text-blue-400 text-sm font-bold
                   hover:bg-blue-600/20 transition-all"
        >
          <Edit3 size={14} /> 編輯資料
        </button>
        <button
          onClick={onChangePassword}
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-800 
                   border border-slate-700 rounded-xl text-slate-400 text-sm font-bold
                   hover:bg-slate-700 transition-all"
        >
          <Lock size={14} /> 修改密碼
        </button>
      </div>

      {/* 🆕 UA 推薦引擎按鈕 */}
      <button
        onClick={onOpenReferral}
        className="w-full mt-3 flex items-center justify-center gap-2 py-2.5
                 bg-purple-600/10 border border-purple-500/30 rounded-xl
                 text-purple-400 text-sm font-bold hover:bg-purple-600/20 transition-all"
      >
        <Users size={14} /> UA 推薦引擎
        {membership?.points > 0 && (
          <span className="bg-purple-500/30 text-purple-300 text-xs px-2 py-0.5 rounded-full">
            {membership.points} UA
          </span>
        )}
      </button>

      {/* 🆕 升級按鈕（非 founder/paid 顯示） */}
      {membership && !membership.isPaid && (
        <div className="mt-3 p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30
                       border border-purple-500/20 rounded-xl">
          {membership.tier === 'referral_trial' ? (
            <>
              <button
                onClick={() => onOpenPayment(true)}
                className="block w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600
                         rounded-xl text-white font-bold text-center text-sm
                         hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg"
              >
                🎁 升級 365 天 - $8,000（已折 $999）
              </button>
              <p className="text-[10px] text-purple-300 mt-2 text-center">
                轉介紹專屬優惠價
              </p>
            </>
          ) : (
            <button
              onClick={() => onOpenPayment(false)}
              className="block w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600
                       rounded-xl text-white font-bold text-center text-sm
                       hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg"
            >
              升級 365 天 - $8,999
            </button>
          )}

          {membership.isTrial && membership.daysRemaining > 0 && (
            <p className="text-xs text-slate-400 mt-2 text-center">
              試用剩餘 {membership.daysRemaining} 天
            </p>
          )}
          {membership.tier === 'grace' && (
            <p className="text-xs text-amber-400 mt-2 text-center flex items-center justify-center gap-1">
              <TriangleAlert size={12} />
              寬限期剩餘 {membership.graceDaysRemaining} 天，請盡快續訂
            </p>
          )}
          {membership.tier === 'expired' && (
            <p className="text-xs text-red-400 mt-2 text-center">
              已過期，立即升級恢復使用
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 📊 市場數據卡片
// ==========================================
const MarketDataCard = () => {
  return (
    <div className="dark:bg-slate-900/50 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={18} className="text-blue-400" />
        <h3 className="text-sm font-black text-white uppercase tracking-wider">市場快訊</h3>
        <span className="ml-auto text-[10px] text-slate-500">2026 即時數據</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-red-900/20 border border-red-500/20 rounded-xl p-3 text-center">
          <Heart size={16} className="text-red-400 mx-auto mb-1" />
          <div className="text-2xl font-black text-red-400">
            3:48<span className="text-xs ml-1">分鐘</span>
          </div>
          <div className="text-[10px] text-slate-500 font-bold uppercase">癌症時鐘</div>
        </div>
        <div className="bg-amber-900/20 border border-amber-500/20 rounded-xl p-3 text-center">
          <TrendingUp size={16} className="text-amber-400 mx-auto mb-1" />
          <div className="text-2xl font-black text-amber-400">
            15.8<span className="text-xs ml-1">%</span>
          </div>
          <div className="text-[10px] text-slate-500 font-bold uppercase">醫療通膨</div>
        </div>
        <div className="bg-orange-900/20 border border-orange-500/20 rounded-xl p-3 text-center">
          <Clock size={16} className="text-orange-400 mx-auto mb-1" />
          <div className="text-2xl font-black text-orange-400">
            2031<span className="text-xs ml-1">年</span>
          </div>
          <div className="text-[10px] text-slate-500 font-bold uppercase">勞保倒數</div>
        </div>
        <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-3 text-center">
          <Activity size={16} className="text-emerald-400 mx-auto mb-1" />
          <div className="text-2xl font-black text-emerald-400">
            4.5<span className="text-xs ml-1">%</span>
          </div>
          <div className="text-[10px] text-slate-500 font-bold uppercase">實質通膨</div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 🧮 快速試算工具
// ==========================================
const QuickCalculator = () => {
  const [mode, setMode] = useState<'loan' | 'savings' | 'irr'>('loan');
  
  // 貸款計算
  const [loanAmount, setLoanAmount] = useState(10000000);
  const [loanRate, setLoanRate] = useState(2.2);
  const [loanYears, setLoanYears] = useState(30);
  
  // 複利計算
  const [initialCapital, setInitialCapital] = useState(1000000);
  const [monthlyInvest, setMonthlyInvest] = useState(10000);
  const [expectedRate, setExpectedRate] = useState(6);
  const [investYears, setInvestYears] = useState(20);
  
  // IRR 計算
  const [totalPremium, setTotalPremium] = useState(1000000);
  const [maturityValue, setMaturityValue] = useState(1350000);
  const [irrYears, setIrrYears] = useState(10);

  const getLoanResult = () => {
    const i = loanRate / 100 / 12;
    const n = loanYears * 12;
    if (i === 0) return { monthly: loanAmount / n, totalInterest: 0 };
    const m = (loanAmount * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
    return { monthly: Math.round(m), totalInterest: Math.round(m * n - loanAmount) };
  };

  const getSavingsResult = () => {
    const r = expectedRate / 100 / 12;
    const n = investYears * 12;
    const fvInitial = initialCapital * Math.pow(1 + r, n);
    const fvMonthly = r === 0 ? monthlyInvest * n : monthlyInvest * ((Math.pow(1 + r, n) - 1) / r);
    const total = fvInitial + fvMonthly;
    return { total: Math.round(total), profit: Math.round(total - initialCapital - monthlyInvest * n) };
  };

  const getIrrResult = () => {
    if (totalPremium <= 0 || maturityValue <= 0 || irrYears <= 0) return "0.00";
    return ((Math.pow(maturityValue / totalPremium, 1 / irrYears) - 1) * 100).toFixed(2);
  };

  return (
    <div className="dark:bg-slate-900/50 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calculator size={18} className="text-amber-400" />
        <h3 className="text-sm font-black text-white uppercase tracking-wider">快速試算</h3>
      </div>

      {/* Mode Tabs */}
      <div className="flex bg-slate-950 p-1 rounded-xl mb-4">
        {[
          { id: 'loan' as const, label: '貸款月付', icon: Home },
          { id: 'savings' as const, label: '複利增值', icon: TrendingUp },
          { id: 'irr' as const, label: 'IRR 年化', icon: Coins },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg 
                       text-xs font-bold transition-all ${
              mode === m.id 
                ? 'bg-amber-600 text-white' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <m.icon size={14} />
            {m.label}
          </button>
        ))}
      </div>

      {/* Calculator Content */}
      <div className="space-y-4">
        {mode === 'loan' && (
          <>
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">
                貸款金額
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={loanAmount}
                onChange={e => setLoanAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3
                         text-white font-bold text-sm focus:border-amber-500 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">
                  年利率 %
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={loanRate}
                  onChange={e => setLoanRate(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3
                           text-white font-bold text-sm outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">
                  年期
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={loanYears}
                  onChange={e => setLoanYears(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3
                           text-white font-bold text-sm outline-none focus:border-amber-500"
                />
              </div>
            </div>
            <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4 text-center">
              <div className="text-slate-400 text-xs mb-1">預估月付金</div>
              <div className="text-3xl font-black text-blue-400">
                {getLoanResult().monthly.toLocaleString()}
                <span className="text-sm ml-1">TWD</span>
              </div>
              <div className="text-slate-500 text-xs mt-2">
                累積利息：{getLoanResult().totalInterest.toLocaleString()}
              </div>
            </div>
          </>
        )}

        {mode === 'savings' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">
                  單筆本金
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={initialCapital}
                  onChange={e => setInitialCapital(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3
                           text-white font-bold text-sm outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">
                  每月投入
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={monthlyInvest}
                  onChange={e => setMonthlyInvest(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3
                           text-white font-bold text-sm outline-none focus:border-amber-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">
                  年報酬 %
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={expectedRate}
                  onChange={e => setExpectedRate(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3
                           text-white font-bold text-sm outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">
                  年期
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={investYears}
                  onChange={e => setInvestYears(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3
                           text-white font-bold text-sm outline-none focus:border-amber-500"
                />
              </div>
            </div>
            <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-4 text-center">
              <div className="text-slate-400 text-xs mb-1">滿期總額</div>
              <div className="text-3xl font-black text-emerald-400">
                {getSavingsResult().total.toLocaleString()}
                <span className="text-sm ml-1">TWD</span>
              </div>
              <div className="text-emerald-400 text-xs mt-2">
                淨回報：+{getSavingsResult().profit.toLocaleString()}
              </div>
            </div>
          </>
        )}

        {mode === 'irr' && (
          <>
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">
                累積保費
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={totalPremium}
                onChange={e => setTotalPremium(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3
                         text-white font-bold text-sm outline-none focus:border-amber-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">
                  滿期領回
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={maturityValue}
                  onChange={e => setMaturityValue(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3
                           text-white font-bold text-sm outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">
                  年期
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={irrYears}
                  onChange={e => setIrrYears(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3
                           text-white font-bold text-sm outline-none focus:border-amber-500"
                />
              </div>
            </div>
            <div className="bg-amber-900/20 border border-amber-500/20 rounded-xl p-4 text-center">
              <div className="text-slate-400 text-xs mb-1 uppercase tracking-wider">
                實質年化報酬率
              </div>
              <div className="text-4xl font-black text-amber-400">
                {getIrrResult()}
                <span className="text-lg ml-1">%</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 👥 客戶列表卡片
// ==========================================
const ClientList = ({
  user,
  clients,
  loading,
  onSelectClient,
  onAddClient,
  onEditClient,
  onDeleteClient
}: {
  user: any;
  clients: any[];
  loading: boolean;
  onSelectClient: (client: any) => void;
  onAddClient: () => void;
  onEditClient: (client: any) => void;
  onDeleteClient: (clientId: string) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.note && c.note.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="dark:bg-slate-900/50 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-purple-400" />
          <h3 className="text-sm font-black text-white uppercase tracking-wider">我的客戶</h3>
          <span className="text-xs text-slate-500 ml-2">共 {clients.length} 位</span>
        </div>
        <button
          onClick={onAddClient}
          className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 
                   text-white text-xs font-bold rounded-lg transition-all"
        >
          <Plus size={14} /> 新增
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="搜尋客戶..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-10 pr-4 
                   text-sm text-white placeholder:text-slate-600 
                   focus:border-purple-500 outline-none"
        />
      </div>

      {/* Client Grid */}
      {loading ? (
        <div className="text-center py-10 text-slate-500">
          <Loader2 className="animate-spin mx-auto mb-2" size={24} />
          <span className="text-sm">載入中...</span>
        </div>
      ) : filteredClients.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-h-64 overflow-y-auto">
          {filteredClients.map(client => (
            <div
              key={client.id}
              onClick={() => onSelectClient(client)}
              className="bg-slate-950 border border-slate-800 rounded-xl p-3 cursor-pointer 
                       hover:border-purple-500/50 hover:bg-slate-900 transition-all group relative"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 
                               flex items-center justify-center text-white font-bold text-sm">
                  {client.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-sm truncate">{client.name}</div>
                  <div className="text-[10px] text-slate-500">
                    {client.updatedAt?.toDate?.().toLocaleDateString() || '無更新'}
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-500 truncate">{client.note || '無備註'}</div>

              {/* Action buttons */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditClient(client);
                  }}
                  className="p-1 text-slate-600 hover:text-blue-400 transition-all"
                  title="編輯"
                >
                  <Edit3 size={12} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`確定要刪除 ${client.name} 的檔案嗎？`)) {
                      onDeleteClient(client.id);
                    }
                  }}
                  className="p-1 text-slate-600 hover:text-red-400 transition-all"
                  title="刪除"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-slate-500">
          <Users size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">找不到客戶</p>
          <p className="text-xs text-slate-600 mt-1">試著調整搜尋或新增客戶</p>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 💳 付款 Modal（iframe 嵌入）
// ==========================================
const PaymentModal = ({
  isOpen,
  onClose,
  isReferral
}: {
  isOpen: boolean;
  onClose: () => void;
  isReferral: boolean;
}) => {
  if (!isOpen) return null;

  // 原價訂閱 vs 好友推薦價
  const iframeUrl = isReferral
    ? 'https://portaly.cc/embed/GinRollBT/product/hF1hHcEGbsp5VlbRsKWI'
    : 'https://portaly.cc/embed/GinRollBT/product/WsaTvEYOA1yqAQYzVZgy';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div>
            <h3 className="text-lg font-black text-white">
              {isReferral ? '🎁 好友推薦價' : '💎 年度訂閱'}
            </h3>
            <p className="text-xs text-slate-400">
              {isReferral ? '365 天 - $8,000（已折 $999）' : '365 天 - $8,999'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl transition-all"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* iframe 內容 */}
        <div className="w-full" style={{ height: '620px' }}>
          <iframe
            src={iframeUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            title="付款頁面"
          />
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-700 bg-slate-800/50">
          <p className="text-[10px] text-slate-500 text-center">
            付款完成後系統將自動開通會員權限
          </p>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// ✏️ 編輯個人資料 Modal
// ==========================================
const EditProfileModal = ({
  isOpen,
  onClose,
  user,
  profileData,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  profileData: ProfileData;
  onSave: (data: ProfileData) => Promise<void>;
}) => {
  const [formData, setFormData] = useState<ProfileData>(profileData);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(profileData);
  }, [profileData]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setFormData(prev => ({ ...prev, photoURL: downloadURL }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('上傳失敗，請稍後再試');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
      alert('儲存失敗');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg 
                     shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 flex items-center justify-between p-6 border-b border-slate-800 z-10">
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <User className="text-blue-400" size={24} />
            編輯個人資料
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 
                             flex items-center justify-center overflow-hidden border-4 border-slate-700">
                {formData.photoURL ? (
                  <img src={formData.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-black text-white">
                    {formData.displayName?.charAt(0) || 'U'}
                  </span>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="animate-spin text-white" size={24} />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full 
                         flex items-center justify-center text-white hover:bg-blue-500 transition-colors"
              >
                <Camera size={16} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">點擊上傳大頭貼</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Display Name */}
            <div>
              <label className="text-sm text-slate-400 font-bold mb-2 block">顧問名稱</label>
              <input
                type="text"
                value={formData.displayName}
                onChange={e => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="輸入您的名稱"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 
                         text-white focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Contact Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Phone */}
              <div>
                <label className="text-sm text-slate-400 font-bold mb-2 flex items-center gap-2">
                  <Phone size={14} /> 手機
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="0912-345-678"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 
                           text-white focus:border-blue-500 outline-none transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-sm text-slate-400 font-bold mb-2 flex items-center gap-2">
                  <Mail size={14} /> Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 
                           text-white focus:border-blue-500 outline-none transition-all"
                />
              </div>

              {/* LINE ID */}
              <div>
                <label className="text-sm text-slate-400 font-bold mb-2 flex items-center gap-2">
                  <MessageCircle size={14} className="text-emerald-400" /> LINE ID
                </label>
                <input
                  type="text"
                  value={formData.lineId}
                  onChange={e => setFormData(prev => ({ ...prev, lineId: e.target.value }))}
                  placeholder="your_line_id"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 
                           text-white focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              {/* Instagram */}
              <div>
                <label className="text-sm text-slate-400 font-bold mb-2 flex items-center gap-2">
                  <Instagram size={14} className="text-pink-400" /> Instagram
                </label>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={e => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                  placeholder="@your_instagram"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 
                           text-white focus:border-pink-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="p-4 bg-blue-900/20 border border-blue-500/20 rounded-xl">
            <div className="flex gap-3 items-start">
              <Info size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400 leading-relaxed">
                這些資訊將用於未來的<strong className="text-blue-400">限動產生器</strong>和
                <strong className="text-blue-400">報表產生器</strong>，讓您的品牌一致呈現。
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-900 flex gap-3 p-6 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-slate-800 text-slate-400 rounded-xl font-bold 
                     hover:bg-slate-700 transition-all"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold 
                     hover:bg-blue-500 transition-all disabled:opacity-50 
                     flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                儲存中...
              </>
            ) : (
              <>
                <Save size={18} />
                儲存變更
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 🔐 修改密碼 Modal（已修復）
// ==========================================
const ChangePasswordModal = ({
  isOpen,
  onClose,
  isFirstLogin = false,
  userId,
  onPasswordChanged
}: {
  isOpen: boolean;
  onClose: () => void;
  isFirstLogin?: boolean;  // 🆕 首次登入模式（不可關閉）
  userId?: string;         // 🆕 用於更新 needsPasswordChange 標記
  onPasswordChanged?: () => void;  // 🆕 密碼修改成功後的回調
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 重置表單
  useEffect(() => {
    if (isOpen) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage({ type: '', text: '' });
      setShowOld(false);
      setShowNew(false);
      setShowConfirm(false);
    }
  }, [isOpen]);

  const validatePassword = (password: string) => {
    // 至少 8 位，包含英文和數字
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // 驗證新密碼格式
    if (!validatePassword(newPassword)) {
      setMessage({ type: 'error', text: '密碼必須至少 8 位，包含英文和數字' });
      return;
    }

    // 驗證兩次輸入一致
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: '新密碼與確認密碼不符' });
      return;
    }

    // 確保新舊密碼不同
    if (oldPassword === newPassword) {
      setMessage({ type: 'error', text: '新密碼不能與舊密碼相同' });
      return;
    }

    setLoading(true);

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error('未登入，請重新登入後再試');
      }

      if (!currentUser.email) {
        throw new Error('無法取得用戶 Email');
      }

      // Step 1: 重新驗證用戶（必須先驗證才能修改密碼）
      const credential = EmailAuthProvider.credential(currentUser.email, oldPassword);
      
      try {
        await reauthenticateWithCredential(currentUser, credential);
      } catch (reauthError: any) {
        if (reauthError.code === 'auth/wrong-password' || reauthError.code === 'auth/invalid-credential') {
          setMessage({ type: 'error', text: '目前密碼錯誤，請重新輸入' });
        } else if (reauthError.code === 'auth/too-many-requests') {
          setMessage({ type: 'error', text: '嘗試次數過多，請稍後再試' });
        } else {
          setMessage({ type: 'error', text: '驗證失敗：' + reauthError.message });
        }
        setLoading(false);
        return;
      }
      
      // Step 2: 更新密碼
      await updatePassword(currentUser, newPassword);

      // 🆕 如果是首次登入，清除 needsPasswordChange 標記
      if (isFirstLogin && userId) {
        try {
          await setDoc(doc(db, 'users', userId), {
            needsPasswordChange: false,
            passwordChangedAt: Timestamp.now()
          }, { merge: true });
        } catch (e) {
          console.error('Failed to update needsPasswordChange flag:', e);
        }
      }

      setMessage({ type: 'success', text: '✅ 密碼修改成功！3 秒後將重新登入...' });

      // 🆕 觸發回調
      if (onPasswordChanged) {
        onPasswordChanged();
      }

      // 3 秒後登出並跳轉
      setTimeout(async () => {
        try {
          await auth.signOut();
          window.location.href = '/login';
        } catch (e) {
          window.location.reload();
        }
      }, 3000);

    } catch (error: any) {
      console.error('Password change failed:', error);
      
      let errorMessage = '修改失敗，請稍後再試';
      
      switch (error.code) {
        case 'auth/weak-password':
          errorMessage = '新密碼強度不足，請使用更複雜的密碼';
          break;
        case 'auth/requires-recent-login':
          errorMessage = '安全驗證已過期，請重新登入後再試';
          break;
        case 'auth/network-request-failed':
          errorMessage = '網路連線失敗，請檢查網路後再試';
          break;
        default:
          errorMessage = error.message || '未知錯誤，請稍後再試';
      }
      
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md 
                     shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Lock className="text-amber-400" size={24} />
            {isFirstLogin ? '首次登入 - 請修改密碼' : '修改密碼'}
          </h3>
          {!isFirstLogin && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          )}
        </div>

        {/* 🆕 首次登入提示 */}
        {isFirstLogin && (
          <div className="mx-6 mt-4 p-4 bg-amber-900/20 border border-amber-500/30 rounded-xl">
            <p className="text-amber-300 text-sm font-bold flex items-center gap-2">
              <AlertCircle size={16} />
              為了帳號安全，首次登入需修改密碼
            </p>
            <p className="text-amber-400/70 text-xs mt-1">
              請設定一個您自己的密碼，修改後需重新登入
            </p>
          </div>
        )}

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Old Password */}
          <div>
            <label className="text-sm text-slate-400 font-bold mb-2 block">目前密碼</label>
            <div className="relative">
              <input
                type={showOld ? 'text' : 'password'}
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 pr-12 
                         text-white focus:border-amber-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="text-sm text-slate-400 font-bold mb-2 block">新密碼</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="至少 8 位，包含英文和數字"
                required
                autoComplete="new-password"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 pr-12 
                         text-white focus:border-amber-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {/* Password strength indicator */}
            {newPassword && (
              <div className="mt-2 flex items-center gap-2">
                <div className={`h-1 flex-1 rounded ${
                  newPassword.length >= 8 ? 'bg-emerald-500' : 'bg-slate-700'
                }`} />
                <div className={`h-1 flex-1 rounded ${
                  /[A-Za-z]/.test(newPassword) ? 'bg-emerald-500' : 'bg-slate-700'
                }`} />
                <div className={`h-1 flex-1 rounded ${
                  /\d/.test(newPassword) ? 'bg-emerald-500' : 'bg-slate-700'
                }`} />
                <span className="text-[10px] text-slate-500">
                  {validatePassword(newPassword) ? '✓ 符合要求' : '強度不足'}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm text-slate-400 font-bold mb-2 block">確認新密碼</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className={`w-full bg-slate-950 border rounded-xl py-3 px-4 pr-12 
                         text-white outline-none transition-all ${
                  confirmPassword && confirmPassword !== newPassword 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-slate-700 focus:border-amber-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-red-400 text-xs mt-1">密碼不一致</p>
            )}
          </div>

          {/* Message */}
          {message.text && (
            <div className={`p-4 rounded-xl flex items-center gap-3 ${
              message.type === 'success' 
                ? 'bg-emerald-900/20 border border-emerald-500/20 text-emerald-400' 
                : 'bg-red-900/20 border border-red-500/20 text-red-400'
            }`}>
              {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
              <span className="font-bold text-sm">{message.text}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !oldPassword || !newPassword || !confirmPassword}
            className="w-full py-4 bg-amber-600 text-white rounded-xl font-bold text-lg
                     hover:bg-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                處理中...
              </>
            ) : (
              '修改密碼'
            )}
          </button>

          {/* Tips */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-500 font-bold mb-2 flex items-center gap-2">
              <Lock size={12} /> 安全提示
            </p>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>• 密碼長度至少 8 位</li>
              <li>• 必須包含英文字母和數字</li>
              <li>• 修改成功後將自動登出</li>
              <li>• 定期更換密碼以確保安全</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// ➕ 新增客戶 Modal
// ==========================================
const AddClientModal = ({ 
  isOpen, 
  onClose, 
  onAdd 
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, note: string) => Promise<void>;
}) => {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setNote('');
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onAdd(name, note);
      onClose();
    } catch (error) {
      alert('新增失敗');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md 
                     shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Plus className="text-purple-400" size={24} />
            新增客戶
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm text-slate-400 font-bold mb-2 block">客戶姓名</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="例如：王小明"
              autoFocus
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 
                       text-white focus:border-purple-500 outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 font-bold mb-2 block">備註（選填）</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="例如：工程師，年收 150 萬..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 
                       text-white focus:border-purple-500 outline-none resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-slate-800">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-800 text-slate-400 rounded-xl font-bold 
                     hover:bg-slate-700 transition-all"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || loading}
            className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold 
                     hover:bg-purple-500 transition-all disabled:opacity-50 
                     flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
            建立檔案
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// ✏️ 編輯客戶 Modal
// ==========================================
const EditClientModal = ({
  isOpen,
  onClose,
  client,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  client: any;
  onSave: (clientId: string, name: string, note: string) => Promise<void>;
}) => {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && client) {
      setName(client.name || '');
      setNote(client.note || '');
    }
  }, [isOpen, client]);

  const handleSubmit = async () => {
    if (!name.trim() || !client) return;
    setLoading(true);
    try {
      await onSave(client.id, name, note);
      onClose();
    } catch (error) {
      alert('儲存失敗');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md
                     shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Edit3 className="text-blue-400" size={24} />
            編輯客戶
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm text-slate-400 font-bold mb-2 block">客戶姓名</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="例如：王小明"
              autoFocus
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4
                       text-white focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 font-bold mb-2 block">備註（選填）</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="例如：工程師，年收 150 萬..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4
                       text-white focus:border-blue-500 outline-none resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-slate-800">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-800 text-slate-400 rounded-xl font-bold
                     hover:bg-slate-700 transition-all"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || loading}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold
                     hover:bg-blue-500 transition-all disabled:opacity-50
                     flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
            儲存變更
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 🚀 主組件：Ultra 戰情室
// ==========================================
interface UltraWarRoomProps {
  user: any;
  onSelectClient: (client: any) => void;
  onLogout: () => void;
}

const UltraWarRoom: React.FC<UltraWarRoomProps> = ({ user, onSelectClient, onLogout }) => {
  // 🆕 會員系統
  const { membership } = useMembership(user?.uid || null);
  const [showReferralEngine, setShowReferralEngine] = useState(false);
  const [showPWAInstall, setShowPWAInstall] = useState(false);

  // 客戶列表狀態
  const [clients, setClients] = useState<any[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);

  // 個人資料狀態
  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: user?.displayName || '',
    photoURL: user?.photoURL || '',
    email: user?.email || '',
    phone: '',
    lineId: '',
    instagram: '',
  });

  // Modal 狀態
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showEditClient, setShowEditClient] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);

  // 🆕 付款 Modal 狀態
  const [showPayment, setShowPayment] = useState(false);
  const [isReferralPayment, setIsReferralPayment] = useState(false);

  const handleOpenPayment = (isReferral: boolean) => {
    setIsReferralPayment(isReferral);
    setShowPayment(true);
  };

  // 🆕 首次登入強制改密碼
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);

  // 🆕 通知系統
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [expandedNotificationId, setExpandedNotificationId] = useState<string | null>(null);

  // 計算未讀通知數（只計算最新 3 則）
  const displayedNotifications = showAllNotifications ? notifications : notifications.slice(0, 3);
  const unreadCount = notifications.slice(0, 3).filter(n => !readNotificationIds.includes(n.id)).length;

  // 🆕 功能建議系統
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // 🆕 LOGO 五連點進入後台
  const [logoClickCount, setLogoClickCount] = useState(0);
  const logoClickTimer = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = () => {
    setLogoClickCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        // 連點 5 次，導航到後台
        window.open('/secret-admin-ultra-2026', '_blank');
        return 0;
      }
      return newCount;
    });

    // 重置計時器
    if (logoClickTimer.current) {
      clearTimeout(logoClickTimer.current);
    }
    logoClickTimer.current = setTimeout(() => {
      // 如果不是連點 5 次（進後台），則單擊返回官網首頁
      if (logoClickCount < 4) {
        window.location.href = 'https://ultra-advisor.tw';
      }
      setLogoClickCount(0);
    }, 500); // 0.5 秒後判斷是否為單擊
  };

  // 載入用戶資料
  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      try {
        // 載入個人資料
        const profileRef = doc(db, 'users', user.uid, 'profile', 'data');
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          setProfileData(prev => ({ ...prev, ...profileSnap.data() as ProfileData }));
        }

        // 🆕 檢查是否需要首次修改密碼
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.needsPasswordChange === true) {
            setNeedsPasswordChange(true);
            setShowChangePassword(true); // 自動打開修改密碼 Modal
          }
        }
      } catch (error) {
        console.error('Load profile failed:', error);
      }
    };

    loadProfile();
  }, [user]);

  // 監聽客戶列表
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'clients'),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setClients(list);
      setClientsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 🆕 即時監聽通知
  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'siteContent', 'notifications'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const items = (data.items || [])
            .filter((n: any) => n.enabled !== false)
            .sort((a: any, b: any) => (b.priority || 0) - (a.priority || 0));
          setNotifications(items);
        }
      },
      (error) => {
        console.error('Load notifications failed:', error);
      }
    );

    // 從 localStorage 讀取已讀通知
    const readIds = localStorage.getItem('readNotificationIds');
    if (readIds) {
      setReadNotificationIds(JSON.parse(readIds));
    }

    return () => unsubscribe();
  }, []);

  // 標記通知為已讀
  const markNotificationRead = (notifId: string) => {
    const newReadIds = [...readNotificationIds, notifId];
    setReadNotificationIds(newReadIds);
    localStorage.setItem('readNotificationIds', JSON.stringify(newReadIds));
  };

  // 標記全部已讀（只處理顯示的 3 則）
  const markAllNotificationsRead = () => {
    const allIds = displayedNotifications.map(n => n.id);
    const newReadIds = [...new Set([...readNotificationIds, ...allIds])];
    setReadNotificationIds(newReadIds);
    localStorage.setItem('readNotificationIds', JSON.stringify(newReadIds));
  };

  // 🆕 提交功能建議
  const handleSubmitFeedback = async () => {
    if (!feedbackContent.trim() || !user) return;

    setFeedbackSubmitting(true);
    try {
      // 儲存建議到 Firestore
      await addDoc(collection(db, 'feedbacks'), {
        userId: user.uid,
        userEmail: user.email,
        userName: profileData.displayName || user.displayName || '匿名用戶',
        content: feedbackContent.trim(),
        status: 'pending', // pending, reviewed, implemented, rejected
        createdAt: Timestamp.now(),
        pointsAwarded: false,
      });

      // 發放 10 UA 點獎勵（透過 API）
      try {
        const token = await user.getIdToken();
        await fetch('/api/points/award-feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ amount: 10, reason: 'feedback_submit' })
        });
      } catch (pointsError) {
        console.log('Points award skipped:', pointsError);
      }

      setFeedbackSuccess(true);
      setFeedbackContent('');
      setTimeout(() => {
        setFeedbackSuccess(false);
        setShowFeedback(false);
      }, 2000);
    } catch (error) {
      console.error('Submit feedback failed:', error);
      alert('提交失敗，請重試');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  // 儲存個人資料
  const handleSaveProfile = async (data: ProfileData) => {
    if (!user) return;

    // 更新 Firebase Auth 的 displayName 和 photoURL
    const auth = getAuth();
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: data.displayName,
        photoURL: data.photoURL,
      });
    }

    // 儲存到 Firestore
    await setDoc(doc(db, 'users', user.uid, 'profile', 'data'), {
      ...data,
      updatedAt: Timestamp.now(),
    });

    setProfileData(data);
  };

  // 新增客戶
  const handleAddClient = async (name: string, note: string) => {
    if (!user) return;
    
    await addDoc(collection(db, 'users', user.uid, 'clients'), {
      name,
      note,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  };

  // 刪除客戶
  const handleDeleteClient = async (clientId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'clients', clientId));
  };

  // 編輯客戶
  const handleEditClient = async (clientId: string, name: string, note: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'clients', clientId), {
      name,
      note,
      updatedAt: Timestamp.now(),
    });
  };

  // 開啟編輯客戶 Modal
  const openEditClient = (client: any) => {
    setEditingClient(client);
    setShowEditClient(true);
  };

  return (
    <div
      className="min-h-screen transition-colors duration-300
                    dark:bg-[#050b14] bg-slate-50
                    dark:bg-[linear-gradient(rgba(77,163,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(77,163,255,0.03)_1px,transparent_1px)]
                    bg-[linear-gradient(rgba(100,116,139,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(100,116,139,0.1)_1px,transparent_1px)]
                    bg-[length:40px_40px]"
      onClick={() => setShowNotifications(false)}
    >

      {/* 市場快訊跑馬燈 */}
      <MarketTicker />

      {/* Header */}
      <header className="sticky top-0 z-40 dark:bg-[#050b14]/90 bg-white/90 backdrop-blur-xl border-b dark:border-white/5 border-slate-200 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={handleLogoClick}
            title="Ultra 戰情室"
          >
            <img
              src="https://lh3.googleusercontent.com/d/1CEFGRByRM66l-4sMMM78LUBUvAMiAIaJ"
              alt="Ultra Advisor"
              className="h-10 w-10 rounded-xl object-cover"
              onError={(e: any) => {
                e.currentTarget.src = 'https://placehold.co/40x40/3b82f6/white?text=UA';
              }}
            />
            <div>
              <h1 className="text-lg md:text-xl font-black dark:text-white text-slate-900 tracking-tight">
                <span style={{color: '#FF3A3A'}}>Ultra</span> <span className="text-blue-500">戰情室</span>
              </h1>
              <p className="text-[10px] text-slate-500 hidden md:block">
                專業財務顧問的作戰指揮中心
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* 🆕 通知按鈕 */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotifications(!showNotifications);
                }}
                className="p-2 dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900 dark:hover:bg-slate-800 hover:bg-slate-100 rounded-lg transition-all relative"
                title="通知"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold
                                 rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* 通知面板 */}
              {showNotifications && (
                <div
                  className="fixed md:absolute left-2 right-2 md:left-auto md:right-0 top-16 md:top-full md:mt-2
                             md:w-96 dark:bg-slate-900 bg-white border dark:border-slate-700 border-slate-200
                             rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[calc(100vh-5rem)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <Bell size={16} className="text-amber-400" />
                      通知中心
                    </h4>
                    <div className="flex items-center gap-3">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllNotificationsRead}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          全部已讀
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="md:hidden p-1 text-slate-400 hover:text-white"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-[calc(100vh-12rem)] md:max-h-96 overflow-y-auto">
                    {displayedNotifications.length > 0 ? (
                      displayedNotifications.map(notif => {
                        const isExpanded = expandedNotificationId === notif.id;
                        return (
                          <div
                            key={notif.id}
                            onClick={() => {
                              markNotificationRead(notif.id);
                              setExpandedNotificationId(isExpanded ? null : notif.id);
                            }}
                            className={`p-4 border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer transition-all
                                      ${!readNotificationIds.includes(notif.id) ? 'bg-blue-900/20' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 shrink-0
                                            ${!readNotificationIds.includes(notif.id) ? 'bg-blue-400' : 'bg-slate-600'}`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="font-bold text-white text-sm">{notif.title}</p>
                                  <ChevronDown
                                    size={14}
                                    className={`text-slate-500 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                  />
                                </div>
                                <div className={`text-slate-400 text-xs mt-1 ${isExpanded ? 'max-h-60 overflow-y-auto' : 'line-clamp-2'}`}>
                                  {isExpanded ? (
                                    <div className="space-y-2 whitespace-pre-wrap break-words">
                                      {notif.content?.split('\n').map((line: string, i: number) => {
                                        // 處理標題行 (## 開頭)
                                        if (line.startsWith('## ')) {
                                          return <p key={i} className="font-bold text-amber-400 text-sm mt-2">{line.replace('## ', '')}</p>;
                                        }
                                        // 處理粗體 (**text**)
                                        const parts = line.split(/(\*\*[^*]+\*\*)/g);
                                        return (
                                          <p key={i}>
                                            {parts.map((part, j) => {
                                              if (part.startsWith('**') && part.endsWith('**')) {
                                                return <span key={j} className="font-bold text-white">{part.slice(2, -2)}</span>;
                                              }
                                              return <span key={j}>{part}</span>;
                                            })}
                                          </p>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <span>{notif.content?.replace(/\*\*/g, '').replace(/## /g, '')}</span>
                                  )}
                                </div>
                                {notif.createdAt && (
                                  <p className="text-slate-500 text-[10px] mt-2">
                                    {new Date(notif.createdAt).toLocaleDateString('zh-TW')}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center text-slate-500">
                        <Bell size={32} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">目前沒有通知</p>
                      </div>
                    )}
                  </div>

                  {/* 查看全部/收起按鈕 */}
                  {notifications.length > 3 && (
                    <div className="p-3 border-t border-slate-700">
                      <button
                        onClick={() => setShowAllNotifications(!showAllNotifications)}
                        className="w-full text-center text-xs text-blue-400 hover:text-blue-300 py-1"
                      >
                        {showAllNotifications ? `收起 ▲` : `查看全部 (${notifications.length} 則) ▼`}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 🆕 功能建議按鈕 */}
            <button
              onClick={() => setShowFeedback(true)}
              className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-all"
              title="功能建議"
            >
              <Lightbulb size={20} />
            </button>

            <button
              onClick={() => setShowEditProfile(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              title="設定"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-slate-800 hover:bg-slate-700
                       text-slate-300 rounded-xl text-sm font-bold transition-all"
            >
              <LogOut size={16} />
              <span className="hidden md:inline">登出</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Top Row: Profile + Market Data + Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
          {/* Profile Card + Mission Card */}
          <div className="space-y-4">
            <ProfileCard
              user={user}
              profileData={profileData}
              membership={membership}
              onEditProfile={() => setShowEditProfile(true)}
              onChangePassword={() => setShowChangePassword(true)}
              onOpenReferral={() => setShowReferralEngine(true)}
              onOpenPayment={handleOpenPayment}
            />
            {/* 🆕 任務卡片 */}
            <MissionCard
              onOpenModal={(modalName) => {
                if (modalName === 'editProfile') setShowEditProfile(true);
              }}
              onNavigate={(path) => {
                // 站內跳轉處理
                if (path === '/clients' || path === 'clients') {
                  // 滾動到客戶列表
                  document.getElementById('client-list')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              onOpenPWAInstall={() => setShowPWAInstall(true)}
            />
          </div>

          {/* Market Data */}
          <MarketDataCard />

          {/* Quick Calculator */}
          <QuickCalculator />
        </div>

        {/* Bottom Row: Client List */}
        <ClientList
          user={user}
          clients={clients}
          loading={clientsLoading}
          onSelectClient={onSelectClient}
          onAddClient={() => setShowAddClient(true)}
          onEditClient={openEditClient}
          onDeleteClient={handleDeleteClient}
        />

        {/* CTA Banner */}
        <div className="mt-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30 
                       border border-blue-500/20 rounded-2xl p-6 md:p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="text-amber-400" size={24} />
            <h3 className="text-xl md:text-2xl font-black text-white">選擇客戶，開始專業規劃</h3>
          </div>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
            點擊上方客戶卡片，進入 <strong className="text-blue-400">14 種專業理財工具</strong>，
            3 分鐘產出客製化策略報表
          </p>
        </div>
      </main>

      {/* Modals */}
      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        user={user}
        profileData={profileData}
        onSave={handleSaveProfile}
      />

      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => {
          // 🆕 首次登入模式不可關閉
          if (!needsPasswordChange) {
            setShowChangePassword(false);
          }
        }}
        isFirstLogin={needsPasswordChange}
        userId={user?.uid}
        onPasswordChanged={() => {
          setNeedsPasswordChange(false);
        }}
      />

      <AddClientModal
        isOpen={showAddClient}
        onClose={() => setShowAddClient(false)}
        onAdd={handleAddClient}
      />

      {/* 🆕 編輯客戶 Modal */}
      <EditClientModal
        isOpen={showEditClient}
        onClose={() => {
          setShowEditClient(false);
          setEditingClient(null);
        }}
        client={editingClient}
        onSave={handleEditClient}
      />

      {/* 🆕 UA 推薦引擎 Modal */}
      <ReferralEngineModal
        isOpen={showReferralEngine}
        onClose={() => setShowReferralEngine(false)}
        userId={user?.uid || ''}
      />

      {/* 🆕 付款 Modal */}
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        isReferral={isReferralPayment}
      />

      {/* 🆕 PWA 安裝教學 Modal */}
      <PWAInstallModal
        isOpen={showPWAInstall}
        onClose={() => setShowPWAInstall(false)}
      />

      {/* 🆕 功能建議 Modal */}
      {showFeedback && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md
                         shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Lightbulb className="text-emerald-400" size={24} />
                功能建議
              </h3>
              <button
                onClick={() => {
                  setShowFeedback(false);
                  setFeedbackContent('');
                  setFeedbackSuccess(false);
                }}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {feedbackSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="text-emerald-400" size={32} />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">感謝您的建議！</h4>
                  <p className="text-emerald-400 text-sm">已獲得 +10 UA 點獎勵</p>
                </div>
              ) : (
                <>
                  <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-4 mb-4">
                    <p className="text-emerald-300 text-sm flex items-center gap-2">
                      <Coins size={16} />
                      提交建議即可獲得 <span className="font-bold">+10 UA 點</span> 獎勵！
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-400 font-bold mb-2 block">
                        您希望新增什麼功能？
                      </label>
                      <textarea
                        value={feedbackContent}
                        onChange={e => setFeedbackContent(e.target.value)}
                        placeholder="請描述您希望新增或改進的功能..."
                        rows={5}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4
                                 text-white focus:border-emerald-500 outline-none resize-none"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {!feedbackSuccess && (
              <div className="flex gap-3 p-6 border-t border-slate-800">
                <button
                  onClick={() => {
                    setShowFeedback(false);
                    setFeedbackContent('');
                  }}
                  className="flex-1 py-3 bg-slate-800 text-slate-400 rounded-xl font-bold
                           hover:bg-slate-700 transition-all"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmitFeedback}
                  disabled={!feedbackContent.trim() || feedbackSubmitting}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold
                           hover:bg-emerald-500 transition-all disabled:opacity-50
                           flex items-center justify-center gap-2"
                >
                  {feedbackSubmitting ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Send size={18} />
                  )}
                  提交建議
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Styles */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default UltraWarRoom;
