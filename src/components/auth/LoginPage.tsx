import React, { useState, useEffect } from 'react';
import {
  LogIn, Loader2, Eye, EyeOff, AlertCircle, CheckCircle2,
  TrendingUp, Sparkles, Zap, Bell, BookOpen, Award, X,
  Gift, Activity, Megaphone
} from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';

// ==========================================
// 🎯 設計原則：
// 1. 中央登入為主，周圍低調展示內容
// 2. 不要彈窗（除非重大公告）
// 3. 手機/平板完美優化
// 4. 混合模式：試用每次顯示，付費24小時一次
// ==========================================

const LOGO_URL = "https://lh3.googleusercontent.com/d/1CEFGRByRM66l-4sMMM78LUBUvAMiAIaJ";

// ==========================================
// 📢 公告內容系統
// ==========================================
interface Announcement {
  id: string;
  type: 'update' | 'event' | 'tip' | 'case' | 'notice';
  title: string;
  content: string;
  icon: string;
  priority: number;
  targetUsers?: 'trial' | 'paid' | 'all';
  link?: string;
  isUrgent?: boolean;
  enabled?: boolean;
}

// 圖示對照表
const iconMap: Record<string, React.ComponentType<any>> = {
  Sparkles, Zap, Bell, Gift, Activity, Megaphone, TrendingUp, Award
};

// 預設公告（當 Firestore 無資料時使用）
const defaultAnnouncements: Announcement[] = [
  {
    id: '1',
    type: 'update',
    title: '新工具上線',
    content: '保險缺口分析工具正式推出，3 分鐘評估客戶需求',
    icon: 'Sparkles',
    priority: 100,
    targetUsers: 'all',
    enabled: true
  },
  {
    id: '2',
    type: 'tip',
    title: '快捷鍵小技巧',
    content: '按 Cmd/Ctrl + K 快速切換工具，Cmd/Ctrl + S 快速儲存',
    icon: 'Zap',
    priority: 80,
    targetUsers: 'all',
    enabled: true
  },
  {
    id: '3',
    type: 'event',
    title: '創始會員倒數',
    content: '剩餘 72 個終身優惠名額，鎖定永久早鳥價',
    icon: 'Award',
    priority: 90,
    targetUsers: 'trial',
    enabled: true
  }
];

// ==========================================
// 🎨 公告卡片組件
// ==========================================
const AnnouncementCard = ({ announcement }: { announcement: Announcement }) => {
  const Icon = iconMap[announcement.icon] || Sparkles;
  const colorMap: Record<string, string> = {
    update: 'blue',
    event: 'amber',
    tip: 'emerald',
    case: 'purple',
    notice: 'red'
  };
  const color = colorMap[announcement.type] || 'blue';

  return (
    <div className={`bg-slate-900/30 border border-slate-800 rounded-2xl p-4 
                    hover:border-${color}-500/30 transition-all group backdrop-blur-sm`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 bg-${color}-600/10 rounded-xl flex items-center justify-center flex-shrink-0
                       group-hover:scale-110 transition-transform`}>
          <Icon className={`text-${color}-400`} size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-bold text-sm mb-1">{announcement.title}</h4>
          <p className="text-slate-400 text-xs leading-relaxed">{announcement.content}</p>
          {announcement.link && (
            <button className={`text-${color}-400 text-xs font-bold mt-2 hover:underline`}>
              了解更多 →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// ⚠️ 重大公告彈窗（僅限 isUrgent）
// ==========================================
const UrgentNoticeModal = ({ 
  announcement, 
  onClose 
}: { 
  announcement: Announcement; 
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-slate-900 border-2 border-red-500/50 rounded-3xl shadow-2xl 
                     max-w-md w-full p-6 animate-scale-in">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-lg transition-colors">
          <X size={20} className="text-slate-400" />
        </button>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-600/10 rounded-2xl flex items-center justify-center">
            <Bell className="text-red-400" size={24} />
          </div>
          <h3 className="text-xl font-black text-white">{announcement.title}</h3>
        </div>
        
        <p className="text-slate-300 leading-relaxed mb-6">
          {announcement.content}
        </p>
        
        <button 
          onClick={onClose}
          className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold
                   transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]">
          我知道了
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 🔐 登入表單組件
// ==========================================
const LoginForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // 🆕 讀取記住的帳號密碼
  useEffect(() => {
    const savedEmail = localStorage.getItem('ua_saved_email');
    const savedPassword = localStorage.getItem('ua_saved_password');
    const savedRemember = localStorage.getItem('ua_remember_me');

    if (savedRemember === 'true' && savedEmail) {
      setEmail(savedEmail);
      if (savedPassword) {
        setPassword(atob(savedPassword)); // 簡單解碼
      }
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);

      // 🆕 儲存或清除記住的帳號密碼
      if (rememberMe) {
        localStorage.setItem('ua_saved_email', email);
        localStorage.setItem('ua_saved_password', btoa(password)); // 簡單編碼
        localStorage.setItem('ua_remember_me', 'true');
      } else {
        localStorage.removeItem('ua_saved_email');
        localStorage.removeItem('ua_saved_password');
        localStorage.removeItem('ua_remember_me');
      }

      onSuccess();
    } catch (err: any) {
      console.error('Login error:', err.code, err.message);
      const errorMessages: Record<string, string> = {
        'auth/invalid-email': '無效的 Email 格式',
        'auth/user-not-found': '帳號不存在',
        'auth/wrong-password': '密碼錯誤',
        'auth/invalid-credential': 'Email 或密碼錯誤',
        'auth/too-many-requests': '登入嘗試次數過多，請稍後再試',
        'auth/network-request-failed': '網路連線失敗，請檢查網路',
        'auth/internal-error': '伺服器錯誤，請稍後再試',
      };
      setError(errorMessages[err.code] || `登入失敗：${err.code || err.message || '未知錯誤'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email */}
      <div>
        <label className="block text-slate-400 text-sm font-bold mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl
                   text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none
                   transition-all"
          placeholder="your@email.com"
          required
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-slate-400 text-sm font-bold mb-2">密碼</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl
                     text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none
                     transition-all pr-12"
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-800
                     rounded-lg transition-colors">
            {showPassword ? (
              <EyeOff size={18} className="text-slate-400" />
            ) : (
              <Eye size={18} className="text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* 🆕 記住帳號密碼 */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setRememberMe(!rememberMe)}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                    ${rememberMe
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-transparent border-slate-600 hover:border-slate-500'}`}
        >
          {rememberMe && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <span
          className="text-slate-400 text-sm cursor-pointer select-none"
          onClick={() => setRememberMe(!rememberMe)}
        >
          記住帳號密碼
        </span>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 bg-red-900/20 border border-red-500/30 
                       rounded-xl px-4 py-3 text-red-300 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white 
                 rounded-xl font-black text-lg shadow-[0_0_30px_rgba(59,130,246,0.4)]
                 hover:shadow-[0_0_50px_rgba(59,130,246,0.6)] transition-all
                 disabled:opacity-50 disabled:cursor-not-allowed flex items-center 
                 justify-center gap-3 group">
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            登入中...
          </>
        ) : (
          <>
            <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
            登入戰情室
          </>
        )}
      </button>
    </form>
  );
};

// ==========================================
// 👋 歡迎回來畫面（已登入用戶）
// ==========================================
const WelcomeBackScreen = ({ 
  user, 
  onContinue 
}: { 
  user: any; 
  onContinue: () => void;
}) => {
  const displayName = user?.displayName || user?.email?.split('@')[0] || '顧問';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center 
                       mx-auto mb-4 shadow-[0_0_40px_rgba(59,130,246,0.4)]">
          <span className="text-3xl font-black text-white">
            {displayName.charAt(0).toUpperCase()}
          </span>
        </div>
        <h2 className="text-3xl font-black text-white mb-2">
          歡迎回來，{displayName} 👋
        </h2>
        <p className="text-slate-400">
          已完成 23 筆試算 · 節省約 12 小時
        </p>
      </div>

      <button
        onClick={onContinue}
        className="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-500 text-white 
                 rounded-2xl font-black text-xl shadow-[0_0_40px_rgba(59,130,246,0.5)]
                 hover:shadow-[0_0_60px_rgba(59,130,246,0.7)] transition-all
                 hover:-translate-y-1 flex items-center justify-center gap-3 group">
        <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
        進入戰情室
        <span className="text-sm opacity-80">→</span>
      </button>

      <button
        onClick={() => auth.signOut()}
        className="w-full py-3 bg-transparent border border-slate-700 text-slate-400 
                 rounded-xl font-bold hover:bg-slate-800 hover:text-white transition-all">
        登出
      </button>
    </div>
  );
};

// ==========================================
// 🚀 主組件
// ==========================================
interface LoginPageProps {
  user?: any;
  onLoginSuccess: () => void;
}

export function LoginPage({ user, onLoginSuccess }: LoginPageProps) {
  const [logoError, setLogoError] = useState(false);
  const [urgentNotice, setUrgentNotice] = useState<Announcement | null>(null);
  const [dismissedNotices, setDismissedNotices] = useState<string[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>(defaultAnnouncements);

  // 🆕 從 Firestore 載入公告
  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const docRef = doc(db, 'siteContent', 'loginAnnouncements');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const items = (data.items || []).filter((a: Announcement) => a.enabled !== false);
          if (items.length > 0) {
            setAnnouncements(items);
          }
        }
      } catch (error) {
        console.log('載入公告失敗，使用預設公告:', error);
      }
    };
    loadAnnouncements();
  }, []);

  // 檢查是否有重大公告需要顯示
  useEffect(() => {
    const urgent = announcements.find(a =>
      a.isUrgent && !dismissedNotices.includes(a.id)
    );
    if (urgent) {
      setUrgentNotice(urgent);
    }
  }, [dismissedNotices, announcements]);

  // 篩選適合顯示的公告（根據用戶類型）
  const getDisplayAnnouncements = () => {
    const userType = user ? 'paid' : 'trial';
    return announcements
      .filter(a => !a.isUrgent)
      .filter(a => !a.targetUsers || a.targetUsers === 'all' || a.targetUsers === userType)
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3);
  };

  const displayAnnouncements = getDisplayAnnouncements();

  return (
    <div className="min-h-screen bg-[#050b14] 
                    bg-[linear-gradient(rgba(77,163,255,0.05)_1px,transparent_1px),
                       linear-gradient(90deg,rgba(77,163,255,0.05)_1px,transparent_1px)]
                    bg-[length:40px_40px] md:bg-[length:40px_40px] 
                    relative overflow-hidden flex items-center justify-center p-4">
      
      {/* 背景光效 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      {/* 主容器 */}
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        
        {/* Logo 居中 - 點擊返回官網 */}
        <div className="flex justify-center mb-12 animate-fade-in">
          <a
            href="https://ultra-advisor.tw"
            className="flex items-center gap-3 group cursor-pointer"
          >
            <img
              src={logoError ? "https://placehold.co/40x40/3b82f6/white?text=UA" : LOGO_URL}
              alt="Ultra Advisor"
              className="h-12 w-auto group-hover:scale-105 transition-transform"
              onError={() => setLogoError(true)}
            />
            <span className="text-2xl font-black tracking-tight">
              <span style={{color: '#FF3A3A'}}>Ultra</span>
              <span className="text-blue-400">Advisor</span>
            </span>
          </a>
        </div>

        {/* 主內容區：桌面版左右分欄，手機版堆疊 */}
        <div className="grid lg:grid-cols-[1fr,400px,1fr] gap-8 items-start">
          
          {/* 左側公告區（桌面版顯示） */}
          <div className="hidden lg:block space-y-4 animate-fade-in" style={{animationDelay: '0.2s'}}>
            {displayAnnouncements.slice(0, 2).map((announcement) => (
              <AnnouncementCard key={announcement.id} announcement={announcement} />
            ))}
          </div>

          {/* 中央登入區 */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 md:p-10
                         backdrop-blur-xl shadow-2xl animate-fade-in"
               style={{animationDelay: '0.4s'}}>
            
            {/* 標題 */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black text-white mb-2">
                {user ? '歡迎回來' : '登入系統'}
              </h1>
              <p className="text-slate-400">
                {user ? '準備好繼續你的財務規劃了嗎？' : '開始你的專業財務規劃之旅'}
              </p>
            </div>

            {/* 登入表單 or 歡迎畫面 */}
            {user ? (
              <WelcomeBackScreen user={user} onContinue={onLoginSuccess} />
            ) : (
              <LoginForm onSuccess={onLoginSuccess} />
            )}

            {/* 底部提示 */}
            {!user && (
              <div className="mt-6 text-center">
                <p className="text-slate-500 text-sm">
                  還沒有帳號？
                  <a 
                    href="https://lin.ee/RFE8A5A" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 font-bold ml-2 
                             hover:underline transition-colors">
                    免費試用 7 天 →
                  </a>
                </p>
              </div>
            )}
          </div>

          {/* 右側公告區（桌面版顯示） */}
          <div className="hidden lg:block space-y-4 animate-fade-in" style={{animationDelay: '0.6s'}}>
            {displayAnnouncements.slice(2, 3).map((announcement) => (
              <AnnouncementCard key={announcement.id} announcement={announcement} />
            ))}
            
            {/* 小提示卡片 */}
            <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 
                           border border-blue-500/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-start gap-3 mb-3">
                <BookOpen className="text-blue-400 flex-shrink-0" size={20} />
                <h4 className="text-white font-bold text-sm">使用小技巧</h4>
              </div>
              <ul className="space-y-2 text-slate-400 text-xs">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>Cmd/Ctrl + K：快速切換工具</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>Cmd/Ctrl + S：快速儲存</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>Cmd/Ctrl + P：列印報表</span>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* 手機/平板版公告區（顯示在底部） */}
        <div className="lg:hidden mt-8 grid md:grid-cols-2 gap-4 animate-fade-in" 
             style={{animationDelay: '0.8s'}}>
          {displayAnnouncements.slice(0, 2).map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </div>

      </div>

      {/* 重大公告彈窗（僅 isUrgent 顯示） */}
      {urgentNotice && (
        <UrgentNoticeModal 
          announcement={urgentNotice}
          onClose={() => {
            setDismissedNotices([...dismissedNotices, urgentNotice.id]);
            setUrgentNotice(null);
          }}
        />
      )}

      {/* 動畫樣式 */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}