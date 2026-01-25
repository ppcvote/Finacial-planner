import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import {
  Calculator, Lock, User, Camera, Mail, Phone, MessageCircle, Instagram,
  Home, TrendingUp, Coins, Check, AlertCircle, Eye, EyeOff, Info, Zap,
  Users, Search, Plus, Trash2, LogOut, Settings, X,
  Clock, TriangleAlert, ShieldAlert, Activity, Edit3, Save, Loader2,
  Heart, RefreshCw, Download, Sparkles, Crown, BarChart3, Bell,
  MessageSquarePlus, Send, Lightbulb, ChevronDown, BookOpen, Sun, Moon,
  Share2, Quote, Calendar, Layout, Type, ImageIcon, ExternalLink, PenTool, RotateCcw, Handshake,
  MapPin, Coffee, Navigation, Wifi, ParkingCircle, Volume2
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import html2canvas from 'html2canvas';
import { getTodayQuote, getTodayBackground, formatDateChinese, getRandomQuote, getRandomBackground, DailyQuote, getTodayIGQuote, getRandomIGQuote, IGStyleQuote } from '../data/dailyQuotes';
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

// 🔔 推播通知
import { usePushNotifications } from '../hooks/usePushNotifications';

// 📴 離線同步
import { useOfflineSync } from '../hooks/useOfflineSync';

// 🆕 任務看板
import MissionCard from './MissionCard';
import PWAInstallModal from './PWAInstallModal';

// 🆕 知識庫文章
import { blogArticles } from '../data/blog/index';

// ==========================================
// 🏪 Ultra Alliance 模擬合作夥伴資料
// ==========================================
interface Partner {
  id: string;
  name: string;
  type: 'meeting_spot' | 'service_provider';
  category: 'cafe' | 'restaurant' | 'business' | 'suit' | 'photo';
  location: { lat: number; lng: number; address: string };
  features: { quiet: boolean; parking: boolean; power: boolean };
  offer: { title: string; description: string };
  image: string;
  rating: number;
  isUltraPartner: boolean;
}

// 模擬合作夥伴資料（未來從 Firestore 讀取）
const MOCK_PARTNERS: Partner[] = [
  {
    id: '1',
    name: '路易莎咖啡 信義旗艦店',
    type: 'meeting_spot',
    category: 'cafe',
    location: { lat: 25.0330, lng: 121.5654, address: '台北市信義區信義路五段7號' },
    features: { quiet: true, parking: true, power: true },
    offer: { title: 'Ultra 會員 9 折', description: '出示會員畫面即可' },
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop',
    rating: 4.6,
    isUltraPartner: true,
  },
  {
    id: '2',
    name: 'Cama Café 南港軟體園區店',
    type: 'meeting_spot',
    category: 'cafe',
    location: { lat: 25.0596, lng: 121.6177, address: '台北市南港區三重路19-2號' },
    features: { quiet: true, parking: false, power: true },
    offer: { title: '第二杯半價', description: '限手沖系列' },
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
    rating: 4.5,
    isUltraPartner: true,
  },
  {
    id: '3',
    name: 'COFFEE LAW 大安旗艦',
    type: 'meeting_spot',
    category: 'cafe',
    location: { lat: 25.0264, lng: 121.5436, address: '台北市大安區敦化南路一段233巷28號' },
    features: { quiet: true, parking: true, power: true },
    offer: { title: 'Ultra 專屬包廂', description: '提前預約享免費使用' },
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
    rating: 4.8,
    isUltraPartner: true,
  },
  {
    id: '4',
    name: 'WeWork 信義區',
    type: 'meeting_spot',
    category: 'business',
    location: { lat: 25.0330, lng: 121.5637, address: '台北市信義區松仁路100號' },
    features: { quiet: true, parking: true, power: true },
    offer: { title: '免費會議室 2 小時', description: 'Ultra 白金會員專屬' },
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
    rating: 4.7,
    isUltraPartner: true,
  },
  {
    id: '5',
    name: '星巴克 101 門市',
    type: 'meeting_spot',
    category: 'cafe',
    location: { lat: 25.0339, lng: 121.5645, address: '台北市信義區市府路45號' },
    features: { quiet: false, parking: true, power: true },
    offer: { title: 'Google 推薦', description: '評分 4.5 以上' },
    image: 'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=400&h=300&fit=crop',
    rating: 4.5,
    isUltraPartner: false,
  },
];

// 計算兩點間距離（Haversine 公式）
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // 地球半徑（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // 距離（公里）
};

// 格式化距離顯示
const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
};

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

      {/* 預約1:1免費試算按鈕 */}
      <a
        href="/booking"
        className="ml-2 flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600
                 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold rounded-lg
                 transition-all shrink-0 shadow-lg shadow-purple-500/20"
      >
        <Calendar size={14} />
        <span className="hidden sm:inline">預約試算</span>
      </a>

      {/* 傲創聯盟按鈕 */}
      <a
        href="/alliance"
        className="ml-2 flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30
                 text-amber-300 text-xs font-bold rounded-lg transition-all shrink-0 border border-amber-500/30"
      >
        <Handshake size={14} />
        <span className="hidden sm:inline">聯盟</span>
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
  lineQrCode?: string; // LINE QR Code 圖片 URL
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
// 📊 市場數據卡片（含每日金句）
// ==========================================

// 文案字體風格配置（使用 Google Fonts 繁體中文字體）
// 注意：所有字體都已在 index.html 中透過 Google Fonts 載入
type FontStyle = 'default' | 'wenkai' | 'headline' | 'elegant';
const FONT_STYLES: Record<FontStyle, { name: string; fontFamily: string; className: string }> = {
  default: {
    name: '預設',
    fontFamily: '"Noto Sans TC", sans-serif',
    className: ''
  },
  wenkai: {
    name: '楷書',
    fontFamily: '"LXGW WenKai Mono TC", cursive',
    className: ''
  },
  headline: {
    name: '粗黑',
    fontFamily: '"Noto Sans TC", sans-serif',
    className: 'font-black tracking-tight'
  },
  elegant: {
    name: '明體',
    fontFamily: '"Noto Serif TC", serif',
    className: ''
  }
};

// 排版風格類型
type LayoutStyle = 'center' | 'left' | 'magazine' | 'card';

// 顧問名字字體風格配置（繁體中文書法/手寫風格）
// 注意：所有字體都已在 index.html 中透過 Google Fonts 載入
type NameFontStyle = 'default' | 'serif' | 'wenkai' | 'xiaowei' | 'kuaile';
const NAME_FONT_STYLES: Record<NameFontStyle, { name: string; fontFamily: string; preview: string }> = {
  default: {
    name: '預設',
    fontFamily: '"Noto Sans TC", sans-serif',
    preview: '王大明'
  },
  serif: {
    name: '明體',
    fontFamily: '"Noto Serif TC", serif',
    preview: '王大明'
  },
  wenkai: {
    name: '楷書',
    fontFamily: '"LXGW WenKai Mono TC", cursive',
    preview: '王大明'
  },
  xiaowei: {
    name: '文藝',
    fontFamily: '"ZCOOL XiaoWei", serif',
    preview: '王大明'
  },
  kuaile: {
    name: '可愛',
    fontFamily: '"ZCOOL KuaiLe", cursive',
    preview: '王大明'
  }
};

// 自訂背景介面
interface CustomBackground {
  id: string;
  dataUrl: string;
  uploadedAt: number;
}

interface MarketDataCardProps {
  userId?: string;
  userDisplayName?: string;
  userPhotoURL?: string;
  userLineQrCode?: string; // 會員自訂的 LINE QR Code
}

const MarketDataCard: React.FC<MarketDataCardProps> = ({ userId, userDisplayName, userPhotoURL, userLineQrCode }) => {
  const [showStoryPreview, setShowStoryPreview] = useState(false);
  const [totalShareDays, setTotalShareDays] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [todayShared, setTodayShared] = useState(false);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  // 隨機文案/背景 state
  const [customQuote, setCustomQuote] = useState<DailyQuote | null>(null);
  const [customBg, setCustomBg] = useState<ReturnType<typeof getTodayBackground> | null>(null);
  const storyRef = useRef<HTMLDivElement>(null);

  // ========== 進階設定狀態 ==========
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  // 排版風格
  const [layoutStyle, setLayoutStyle] = useState<LayoutStyle>('center');
  // 文案編輯
  const [useCustomText, setUseCustomText] = useState(false);
  const [customText, setCustomText] = useState('');
  // IG 風格專用文案
  const [customIGQuote, setCustomIGQuote] = useState<IGStyleQuote | null>(null);
  const [useCustomIGText, setUseCustomIGText] = useState(false);
  const [customIGTitle, setCustomIGTitle] = useState('');
  const [customIGLines, setCustomIGLines] = useState('');
  // 字體選擇
  const [fontStyle, setFontStyle] = useState<FontStyle>('default');
  // 顧問名字字體
  const [nameFontStyle, setNameFontStyle] = useState<NameFontStyle>('default');
  // 自訂背景
  const [customBackgrounds, setCustomBackgrounds] = useState<CustomBackground[]>([]);
  const [selectedCustomBgIndex, setSelectedCustomBgIndex] = useState<number | null>(null);
  const [isUploadingBg, setIsUploadingBg] = useState(false);
  const bgInputRef = useRef<HTMLInputElement>(null);

  // ========== 簽名功能狀態 ==========
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [signatureColor, setSignatureColor] = useState('#FFFFFF'); // 預設白色
  const [signatureSize, setSignatureSize] = useState<'small' | 'medium' | 'large'>('medium');
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  // ========== 雜誌風格拖拉位置與尺寸狀態 ==========
  const [magazineTitlePos, setMagazineTitlePos] = useState({ x: 24, y: 80 });
  const [magazineTitleSize, setMagazineTitleSize] = useState({ width: 280, height: 'auto' as number | 'auto' });
  const [magazineContentPos, setMagazineContentPos] = useState({ x: 24, y: 180 });
  const [magazineContentSize, setMagazineContentSize] = useState({ width: 280, height: 'auto' as number | 'auto' });
  const [isEditingLayout, setIsEditingLayout] = useState(false); // 是否處於編輯模式

  // ========== Ultra Alliance GPS 狀態 ==========
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [nearbyPartners, setNearbyPartners] = useState<(Partner & { distance: number })[]>([]);

  // 取得使用者位置
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('您的瀏覽器不支援定位功能');
      return;
    }
    setIsLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setIsLocating(false);

        // 計算並排序附近夥伴
        const partnersWithDistance = MOCK_PARTNERS.map(partner => ({
          ...partner,
          distance: calculateDistance(latitude, longitude, partner.location.lat, partner.location.lng)
        }))
        .filter(p => p.distance <= 3) // 3km 內
        .sort((a, b) => {
          // 優先顯示 Ultra Partner，然後按距離排序
          if (a.isUltraPartner && !b.isUltraPartner) return -1;
          if (!a.isUltraPartner && b.isUltraPartner) return 1;
          return a.distance - b.distance;
        })
        .slice(0, 3); // 只取前 3 間

        setNearbyPartners(partnersWithDistance);
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('permission_denied');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('無法取得位置資訊');
            break;
          case error.TIMEOUT:
            setLocationError('定位逾時，請重試');
            break;
          default:
            setLocationError('定位失敗');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // 不再自動請求定位，讓用戶進入 Alliance 頁面後再請求

  // ========== 雜誌風格 - 可拖拉元素位置 ==========
  const [magazineDayBadgePos, setMagazineDayBadgePos] = useState({ x: 270, y: 24 }); // Day 徽章（右上）

  // ========== IG 風格 - 可拖拉元素位置 ==========
  const [igDayBadgePos, setIgDayBadgePos] = useState({ x: 270, y: 20 }); // Day 徽章（右上）
  const [igTitlePos, setIgTitlePos] = useState({ x: 16, y: 180 }); // 標題（左側）
  const [igTitleSize, setIgTitleSize] = useState({ width: 280, height: 'auto' as number | 'auto' });
  const [igContentPos, setIgContentPos] = useState({ x: 16, y: 300 }); // 內文（左側）
  const [igContentSize, setIgContentSize] = useState({ width: 280, height: 'auto' as number | 'auto' });

  const todayQuote = getTodayQuote();
  const todayBg = getTodayBackground();
  const todayDate = formatDateChinese();
  const todayIGQuote = getTodayIGQuote();

  // 實際顯示的金句和背景（優先使用自訂，否則用今日預設）
  const displayQuote = customQuote || todayQuote;

  // IG 風格文案（優先：自訂 > 隨機 > 今日預設）
  const displayIGQuote = useMemo((): IGStyleQuote => {
    if (useCustomIGText && customIGTitle.trim()) {
      return {
        title: customIGTitle,
        lines: customIGLines.split('\n').filter(line => line.trim())
      };
    }
    return customIGQuote || todayIGQuote;
  }, [useCustomIGText, customIGTitle, customIGLines, customIGQuote, todayIGQuote]);

  // 優先：自訂背景 > 隨機背景 > 今日預設
  const displayBg = useMemo(() => {
    if (selectedCustomBgIndex !== null && customBackgrounds[selectedCustomBgIndex]) {
      return {
        id: customBackgrounds[selectedCustomBgIndex].id,
        imageUrl: customBackgrounds[selectedCustomBgIndex].dataUrl,
        fallbackGradient: 'from-slate-900 via-slate-800 to-zinc-900'
      };
    }
    return customBg || todayBg;
  }, [selectedCustomBgIndex, customBackgrounds, customBg, todayBg]);

  // 實際顯示的文案（自訂文案 > 金句庫）- 置中排版用
  const displayQuoteText = useCustomText && customText.trim()
    ? customText
    : displayQuote.text;

  // 隨機切換文案和背景
  const handleShuffle = () => {
    if (layoutStyle === 'left' || layoutStyle === 'magazine') {
      // IG 風格 & 雜誌風格：切換 IG 專用文案（標題+分段）
      setCustomIGQuote(getRandomIGQuote());
    } else {
      // 置中/卡片風格：切換一般金句
      setCustomQuote(getRandomQuote());
    }
    setCustomBg(getRandomBackground());
  };

  // 重置為今日預設
  const handleResetToToday = () => {
    setCustomQuote(null);
    setCustomBg(null);
    setCustomIGQuote(null);
    setSelectedCustomBgIndex(null);
  };

  // ========== 背景上傳處理 ==========
  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 7 - customBackgrounds.length;
    if (remainingSlots <= 0) {
      alert('最多只能上傳 7 張自訂背景');
      return;
    }

    setIsUploadingBg(true);
    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    const newBackgrounds: CustomBackground[] = [];

    for (const file of filesToUpload) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} 超過 5MB 限制`);
        continue;
      }

      // 轉 base64（供 html2canvas 截圖）
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      newBackgrounds.push({
        id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        dataUrl,
        uploadedAt: Date.now()
      });
    }

    setCustomBackgrounds(prev => [...prev, ...newBackgrounds]);
    setIsUploadingBg(false);
    e.target.value = '';
  };

  // 刪除自訂背景
  const handleDeleteBg = (index: number) => {
    setCustomBackgrounds(prev => prev.filter((_, i) => i !== index));
    if (selectedCustomBgIndex === index) {
      setSelectedCustomBgIndex(null);
    } else if (selectedCustomBgIndex !== null && selectedCustomBgIndex > index) {
      setSelectedCustomBgIndex(prev => prev! - 1);
    }
  };

  // ========== 簽名功能處理 ==========
  // 初始化簽名畫布
  const initSignatureCanvas = useCallback(() => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 設定畫布為白色背景
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // 開始簽名
  const startSignatureDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    // 阻止預設行為（防止觸控滾動導致反白）
    e.preventDefault();
    e.stopPropagation();

    isDrawingRef.current = true;
    const rect = canvas.getBoundingClientRect();

    // 計算縮放比例（CSS 寬度 vs canvas 實際寬度）
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    lastPosRef.current = {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }, []);

  // 繪製簽名
  const drawSignature = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current) return;

    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 阻止預設行為（防止觸控滾動導致反白）
    e.preventDefault();
    e.stopPropagation();

    const rect = canvas.getBoundingClientRect();

    // 計算縮放比例（CSS 寬度 vs canvas 實際寬度）
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const currentPos = {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };

    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(currentPos.x, currentPos.y);
    ctx.strokeStyle = '#000000'; // 用黑色畫，之後再轉換
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    lastPosRef.current = currentPos;
  }, []);

  // 結束簽名繪製
  const endSignatureDrawing = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    isDrawingRef.current = false;
  }, []);

  // 清除簽名
  const clearSignature = useCallback(() => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // 儲存簽名（去除白色背景，轉為指定顏色）
  const saveSignature = useCallback(() => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 取得畫布資料
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // 解析目標顏色
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 255, g: 255, b: 255 };
    };
    const targetColor = hexToRgb(signatureColor);

    // 建立輸出畫布（去背景版本）
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const outputCtx = outputCanvas.getContext('2d');
    if (!outputCtx) return;

    const outputImageData = outputCtx.createImageData(canvas.width, canvas.height);
    const outputData = outputImageData.data;

    // 檢查是否有繪製內容
    let hasContent = false;

    // 遍歷每個像素：白色變透明，黑色變目標顏色
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // 判斷是否為白色背景（允許一些誤差）
      const isWhite = r > 240 && g > 240 && b > 240;

      if (isWhite) {
        // 白色變透明
        outputData[i] = 0;
        outputData[i + 1] = 0;
        outputData[i + 2] = 0;
        outputData[i + 3] = 0;
      } else {
        // 非白色（筆跡）變成目標顏色
        hasContent = true;
        // 根據原始像素的深淺程度計算透明度
        const darkness = 255 - ((r + g + b) / 3);
        outputData[i] = targetColor.r;
        outputData[i + 1] = targetColor.g;
        outputData[i + 2] = targetColor.b;
        outputData[i + 3] = Math.min(255, darkness * 1.5); // 增強對比
      }
    }

    if (!hasContent) {
      alert('請先簽名');
      return;
    }

    outputCtx.putImageData(outputImageData, 0, 0);
    const dataUrl = outputCanvas.toDataURL('image/png');
    setSignatureDataUrl(dataUrl);
    setShowSignaturePad(false);
  }, [signatureColor]);

  // 刪除簽名
  const deleteSignature = useCallback(() => {
    setSignatureDataUrl(null);
  }, []);

  // 簽名尺寸對應的 CSS class
  const getSignatureSizeClass = () => {
    switch (signatureSize) {
      case 'small': return 'h-6';
      case 'large': return 'h-14';
      default: return 'h-10';
    }
  };

  // 當簽名畫布彈窗打開時，初始化畫布
  useEffect(() => {
    if (showSignaturePad) {
      // 延遲一點確保 canvas 已經渲染
      setTimeout(initSignatureCanvas, 50);
    }
  }, [showSignaturePad, initSignatureCanvas]);

  // 圖片代理 API URL（Cloud Functions）
  const IMAGE_PROXY_URL = 'https://us-central1-grbt-f87fa.cloudfunctions.net/imageProxy';

  // 檢查是否為有效的圖片 URL（Firebase Storage 或其他圖片來源）
  const isValidImageUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    return (
      url.startsWith('https://') ||
      url.startsWith('http://')
    ) && (
      url.includes('firebasestorage.googleapis.com') ||
      url.includes('googleusercontent.com') ||
      url.includes('storage.googleapis.com') ||
      /\.(jpg|jpeg|png|gif|webp)/i.test(url)
    );
  };

  // 載入頭貼並轉成 base64（透過代理 API 繞過 CORS）
  useEffect(() => {
    if (!isValidImageUrl(userPhotoURL)) {
      console.log('[MarketDataCard] 無效的頭貼 URL，跳過載入');
      setAvatarBase64(null);
      setAvatarLoadError(true);
      return;
    }

    setAvatarLoadError(false);
    console.log('[MarketDataCard] 開始載入頭貼（透過代理）');

    const loadAvatarAsBase64 = async () => {
      try {
        // 透過 Cloud Functions 代理取得圖片（繞過 CORS）
        const proxyUrl = `${IMAGE_PROXY_URL}?url=${encodeURIComponent(userPhotoURL!)}`;
        const response = await fetch(proxyUrl);

        if (!response.ok) {
          throw new Error(`代理回應錯誤: ${response.status}`);
        }

        const blob = await response.blob();
        const reader = new FileReader();

        reader.onloadend = () => {
          const base64 = reader.result as string;
          setAvatarBase64(base64);
          console.log('[MarketDataCard] 頭貼 base64 轉換成功（透過代理）');
        };

        reader.onerror = () => {
          console.error('[MarketDataCard] FileReader 錯誤');
          setAvatarBase64(null);
          setAvatarLoadError(true);
        };

        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('[MarketDataCard] 載入頭貼失敗:', error);
        setAvatarBase64(null);
        setAvatarLoadError(true);
      }
    };

    loadAvatarAsBase64();
  }, [userPhotoURL]);

  // 載入使用者的累積分享天數
  useEffect(() => {
    if (!userId) return;

    const loadShareData = async () => {
      try {
        const docRef = doc(db, 'users', userId, 'dailyStory', 'stats');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTotalShareDays(data.totalShareDays || 0);
          // 檢查今天是否已分享
          const today = new Date().toISOString().split('T')[0];
          if (data.lastShareDate === today) {
            setTodayShared(true);
          }
        }
      } catch (error) {
        console.error('載入分享資料失敗:', error);
      }
    };

    loadShareData();
  }, [userId]);

  // 記錄分享並更新累積天數
  const recordShare = async () => {
    if (!userId || todayShared) return;

    const today = new Date().toISOString().split('T')[0];
    try {
      const docRef = doc(db, 'users', userId, 'dailyStory', 'stats');
      const docSnap = await getDoc(docRef);

      let newTotal = 1;
      let shareHistory: string[] = [];

      if (docSnap.exists()) {
        const data = docSnap.data();
        // 如果今天還沒分享，累積天數 +1
        if (data.lastShareDate !== today) {
          newTotal = (data.totalShareDays || 0) + 1;
          shareHistory = data.shareHistory || [];
          shareHistory.push(today);
        } else {
          newTotal = data.totalShareDays || 1;
          shareHistory = data.shareHistory || [];
        }
      } else {
        shareHistory = [today];
      }

      await setDoc(docRef, {
        totalShareDays: newTotal,
        lastShareDate: today,
        shareHistory: shareHistory.slice(-365), // 只保留最近 365 天
        updatedAt: Timestamp.now()
      });

      setTotalShareDays(newTotal);
      setTodayShared(true);
    } catch (error) {
      console.error('記錄分享失敗:', error);
    }
  };

  // 生成並下載圖片
  const handleDownload = async () => {
    if (!storyRef.current) return;

    // 暫時關閉編輯模式以隱藏框線
    const wasEditing = isEditingLayout;
    if (wasEditing) setIsEditingLayout(false);

    setIsGenerating(true);
    try {
      // 等待 DOM 更新
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(storyRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        allowTaint: true,
      });

      // 檢測是否為 iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

      if (isIOS) {
        // iOS: 開新視窗顯示圖片，讓用戶長按存到相簿
        const dataUrl = canvas.toDataURL('image/png');
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>每日金句</title>
              <style>
                body { margin: 0; padding: 20px; background: #0f172a; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; }
                img { max-width: 100%; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                p { color: #94a3b8; font-family: system-ui; text-align: center; margin-top: 20px; font-size: 14px; }
              </style>
            </head>
            <body>
              <img src="${dataUrl}" alt="每日金句" />
              <p>👆 長按圖片 → 「加入照片」存到相簿</p>
            </body>
            </html>
          `);
          newWindow.document.close();
        }
      } else {
        // 其他平台：直接下載
        const link = document.createElement('a');
        link.download = `ultra-advisor-daily-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }

      // 記錄分享
      await recordShare();
    } catch (error) {
      console.error('生成圖片失敗:', error);
      alert('生成圖片失敗，請稍後再試');
    } finally {
      setIsGenerating(false);
      // 恢復編輯模式
      if (wasEditing) setIsEditingLayout(true);
    }
  };

  // Web Share API 分享（優化支援 IG 限時動態）
  const handleShare = async () => {
    if (!storyRef.current) return;

    // 暫時關閉編輯模式以隱藏框線
    const wasEditing = isEditingLayout;
    if (wasEditing) setIsEditingLayout(false);

    setIsGenerating(true);
    try {
      // 等待 DOM 更新
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(storyRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        allowTaint: true,
      });

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });

      // 使用時間戳確保每次都是新檔案
      const timestamp = Date.now();
      const file = new File([blob], `daily-quote-${timestamp}.png`, { type: 'image/png' });

      // 檢查是否支援 Web Share API（含檔案分享）
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: '每日金句',
          text: `「${displayQuoteText}」— Ultra Advisor 💼`,
        });
        // 記錄分享
        await recordShare();
      } else {
        // 不支援 Web Share API，提供替代方案
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);

        if (isIOS || isAndroid) {
          // 手機：開啟圖片頁面，引導用戶手動分享到 IG
          const dataUrl = canvas.toDataURL('image/png');
          const newWindow = window.open('', '_blank');
          if (newWindow) {
            newWindow.document.write(`
              <!DOCTYPE html>
              <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>分享到 IG 限時動態</title>
                <style>
                  body { margin: 0; padding: 20px; background: #0f172a; display: flex; flex-direction: column; align-items: center; min-height: 100vh; font-family: system-ui; }
                  img { max-width: 100%; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); margin-bottom: 20px; }
                  .steps { color: #e2e8f0; text-align: left; padding: 20px; background: #1e293b; border-radius: 12px; max-width: 300px; }
                  .steps h3 { color: #a855f7; margin-top: 0; }
                  .steps ol { padding-left: 20px; line-height: 1.8; }
                  .steps li { margin-bottom: 8px; }
                  .highlight { color: #f59e0b; font-weight: bold; }
                </style>
              </head>
              <body>
                <img src="${dataUrl}" alt="每日金句" />
                <div class="steps">
                  <h3>📱 分享到 IG 限時動態</h3>
                  <ol>
                    <li><span class="highlight">長按圖片</span> → 儲存圖片</li>
                    <li>開啟 <span class="highlight">Instagram</span></li>
                    <li>點擊 <span class="highlight">+</span> → 限時動態</li>
                    <li>從相簿選擇此圖片</li>
                    <li>發布！🎉</li>
                  </ol>
                </div>
              </body>
              </html>
            `);
            newWindow.document.close();
          }
          // 記錄分享
          await recordShare();
        } else {
          // 桌面：直接下載
          handleDownload();
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('分享失敗:', error);
        // 改用下載
        handleDownload();
      }
    } finally {
      setIsGenerating(false);
      // 恢復編輯模式
      if (wasEditing) setIsEditingLayout(true);
    }
  };

  return (
    <div className="dark:bg-slate-900/50 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl p-6">
      {/* ===== 每日金句區塊 ===== */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Quote size={16} className="text-purple-400" />
          <span className="text-xs font-bold dark:text-white text-slate-900">每日金句</span>
          {totalShareDays > 0 && (
            <span className="ml-auto text-[10px] text-purple-400 font-bold">
              累積分享 {totalShareDays} 天
            </span>
          )}
        </div>

        {/* 金句預覽卡片 */}
        <div
          className="relative rounded-xl p-4 overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform border border-white/10"
          onClick={() => setShowStoryPreview(true)}
        >
          {/* 風景背景（灰階） */}
          <div
            className="absolute inset-0 bg-cover bg-center grayscale"
            style={{ backgroundImage: `url(${displayBg.imageUrl})` }}
          />
          {/* 暗化遮罩 */}
          <div className="absolute inset-0 bg-black/60" />

          {/* 內容 */}
          <div className="relative z-10 text-center">
            <Quote size={20} className="text-white/30 mx-auto mb-2" />
            <p
              className={`text-white font-bold text-sm leading-relaxed mb-2 line-clamp-3 ${FONT_STYLES[fontStyle].className}`}
              style={{ fontFamily: FONT_STYLES[fontStyle].fontFamily }}
            >
              {displayQuoteText}
            </p>
          </div>
          <div className="relative z-10 flex items-center justify-between mt-3 pt-3 border-t border-white/20">
            <div className="flex items-center gap-1 text-white/50 text-[10px]">
              <Calendar size={10} />
              {todayDate}
            </div>
            <div className="text-white/50 text-[10px]">
              點擊預覽 & 分享
            </div>
          </div>
        </div>

        {/* 快速分享按鈕 */}
        <div className="flex gap-2 mt-3">
          {/* 隨機換一組按鈕 */}
          <button
            onClick={handleShuffle}
            className="flex items-center justify-center gap-1 py-2 px-3
                     bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold
                     rounded-lg transition-all"
            title="隨機換一組文案和背景"
          >
            <RefreshCw size={14} />
          </button>
          {/* 如果有自訂，顯示重置按鈕 */}
          {(customQuote || customBg) && (
            <button
              onClick={handleResetToToday}
              className="flex items-center justify-center gap-1 py-2 px-2
                       bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold
                       rounded-lg transition-all"
              title="重置為今日預設"
            >
              <Calendar size={14} />
            </button>
          )}
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3
                     bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold
                     rounded-lg transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            下載圖片
          </button>
          <button
            onClick={handleShare}
            disabled={isGenerating}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3
                     bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold
                     rounded-lg transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Share2 size={14} />
            )}
            分享社群
          </button>
        </div>
      </div>

      {/* ===== 市場快訊區塊（精簡版） ===== */}
      <div className="mt-3 pt-3 border-t dark:border-slate-800 border-slate-200">
        <div className="flex items-center gap-1.5 mb-2">
          <Activity size={12} className="text-blue-400" />
          <h3 className="text-[10px] font-bold dark:text-white text-slate-900 uppercase tracking-wider">市場快訊</h3>
          <span className="ml-auto text-[9px] text-slate-500">2026</span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          <div className="bg-red-900/20 border border-red-500/20 rounded p-1.5 text-center">
            <div className="text-sm font-black text-red-400">3:48</div>
            <div className="text-[8px] text-slate-500 font-bold">癌症時鐘</div>
          </div>
          <div className="bg-amber-900/20 border border-amber-500/20 rounded p-1.5 text-center">
            <div className="text-sm font-black text-amber-400">15.8%</div>
            <div className="text-[8px] text-slate-500 font-bold">醫療通膨</div>
          </div>
          <div className="bg-orange-900/20 border border-orange-500/20 rounded p-1.5 text-center">
            <div className="text-sm font-black text-orange-400">2031</div>
            <div className="text-[8px] text-slate-500 font-bold">勞保倒數</div>
          </div>
          <div className="bg-emerald-900/20 border border-emerald-500/20 rounded p-1.5 text-center">
            <div className="text-sm font-black text-emerald-400">4.5%</div>
            <div className="text-[8px] text-slate-500 font-bold">實質通膨</div>
          </div>
        </div>
      </div>

      {/* ===== Ultra Alliance 戰術據點（簡化版） ===== */}
      <div className="mt-3 pt-3 border-t dark:border-slate-800 border-slate-200">
        <a
          href="/alliance"
          className="flex items-center gap-2 p-2 rounded-lg dark:bg-slate-800/30 bg-slate-100
                   border dark:border-slate-700/50 border-slate-200 hover:border-purple-500/30 transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Handshake size={16} className="text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold dark:text-white text-slate-800">Ultra Alliance</span>
              <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-[8px] font-bold rounded">
                NEW
              </span>
            </div>
            <p className="text-[9px] text-slate-500 mt-0.5">探索附近合作據點，享專屬優惠</p>
          </div>
          <Navigation size={14} className="text-slate-400 group-hover:text-purple-400 transition-colors" />
        </a>
      </div>


      {/* ===== 限時動態預覽彈窗 ===== */}
      {showStoryPreview && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
          {/* 關閉按鈕 - 固定在畫面右上角 */}
          <button
            onClick={() => setShowStoryPreview(false)}
            className="absolute top-4 right-4 z-[110] w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full
                       flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <X size={24} />
          </button>

          <div className="relative max-w-sm w-full">

            {/* 限時動態預覽（這個會被截圖） */}
            <div
              ref={storyRef}
              className={`aspect-[9/16] rounded-3xl overflow-hidden bg-gradient-to-br ${displayBg.fallbackGradient}
                         flex flex-col items-center justify-center p-8 relative`}
            >
              {/* 風景背景（灰階） */}
              <div
                className="absolute inset-0 bg-cover bg-center grayscale"
                style={{ backgroundImage: `url(${displayBg.imageUrl})` }}
              />
              {/* 暗化遮罩 */}
              <div className="absolute inset-0 bg-black/50" />

              {/* ========== 置中排版 ========== */}
              {layoutStyle === 'center' && (
                <>
                  {/* 累積天數徽章 */}
                  <div className="absolute top-6 right-6 bg-black/40 px-3 py-1.5 rounded-full z-10">
                    <span className="text-white text-xs font-bold">
                      Day {totalShareDays + (todayShared ? 0 : 1)}
                    </span>
                  </div>

                  {/* 金句內容 - 置中 */}
                  <div className="relative z-10 text-center max-w-[280px] px-4">
                    <Quote size={36} className="text-white/30 mx-auto mb-4" />
                    <p
                      className={`text-white font-black text-lg leading-relaxed drop-shadow-lg ${FONT_STYLES[fontStyle].className}`}
                      style={{ fontFamily: FONT_STYLES[fontStyle].fontFamily }}
                    >
                      {displayQuoteText}
                    </p>
                  </div>

                  {/* 底部資訊 - 顧問資訊 + 品牌 + QR Code */}
                  <div className="absolute bottom-6 left-5 right-5 flex items-center justify-between z-10">
                    {/* 左側：顧問頭貼 + 名字 + 日期 */}
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0 relative">
                        {/* Fallback 文字（z-index 較低，會被圖片覆蓋） */}
                        <div className="absolute inset-0 flex items-center justify-center z-0">
                          <span className="text-white font-bold text-lg">
                            {(userDisplayName || '顧')[0]}
                          </span>
                        </div>
                        {/* 頭貼圖片（z-index 較高，會覆蓋文字） */}
                        {(avatarBase64 || isValidImageUrl(userPhotoURL)) && (
                          <img
                            src={avatarBase64 || userPhotoURL}
                            alt={userDisplayName || '顧問'}
                            className="absolute inset-0 w-full h-full object-cover z-10"
                            crossOrigin="anonymous"
                            onError={(e) => {
                              // 圖片載入失敗時隱藏，露出下面的文字
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span
                          className="text-white font-bold text-sm"
                          style={{ fontFamily: NAME_FONT_STYLES[nameFontStyle].fontFamily }}
                        >
                          {userDisplayName || '財務顧問'}
                        </span>
                        <span className="text-white/50 text-[10px] flex items-center gap-1">
                          <Calendar size={10} />
                          {todayDate}
                        </span>
                      </div>
                    </div>

                    {/* 中間：品牌浮水印 */}
                    <div className="flex items-center gap-1">
                      <img
                        src="/logo.png"
                        alt="Ultra Advisor"
                        className="w-4 h-4 object-contain"
                      />
                      <span className="text-[10px] font-bold">
                        <span className="text-red-500">Ultra</span>
                        <span className="text-blue-400"> Advisor</span>
                      </span>
                    </div>

                    {/* 右側：QR Code */}
                    <div className="flex flex-col items-center">
                      <div className="bg-white p-1 rounded-lg">
                        <img
                          src={userLineQrCode || `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://ultra-advisor.tw&bgcolor=ffffff&color=000000&margin=0`}
                          alt="QR Code"
                          className="w-11 h-11 rounded"
                          crossOrigin="anonymous"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 簽名（置中下方，品牌上方） */}
                  {signatureDataUrl && (
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10">
                      <img
                        src={signatureDataUrl}
                        alt="簽名"
                        className={`${getSignatureSizeClass()} object-contain drop-shadow-lg`}
                      />
                    </div>
                  )}
                </>
              )}

              {/* ========== IG 風格左對齊排版 ========== */}
              {layoutStyle === 'left' && (
                <>
                  {/* 累積天數徽章 - 可拖拉 */}
                  <Rnd
                    position={{ x: igDayBadgePos.x, y: igDayBadgePos.y }}
                    onDragStop={(e, d) => setIgDayBadgePos({ x: d.x, y: d.y })}
                    bounds="parent"
                    enableResizing={false}
                    disableDragging={!isEditingLayout}
                    className={`z-30 ${isEditingLayout ? 'cursor-move' : ''}`}
                    style={{
                      border: isEditingLayout ? '2px dashed rgba(168, 85, 247, 0.6)' : 'none',
                      borderRadius: isEditingLayout ? '9999px' : '0',
                    }}
                  >
                    <div className="bg-black/40 px-3 py-1.5 rounded-full">
                      <span className="text-white text-xs font-bold whitespace-nowrap">
                        Day {totalShareDays + (todayShared ? 0 : 1)}
                      </span>
                    </div>
                  </Rnd>

                  {/* 編輯模式提示 */}
                  {isEditingLayout && (
                    <div className="absolute top-6 left-6 bg-purple-600/90 px-3 py-1.5 rounded-full z-30">
                      <span className="text-white text-xs font-bold">✏️ 拖拉調整</span>
                    </div>
                  )}

                  {/* 黃色大標題 - 可拖拉+縮放 */}
                  <Rnd
                    position={{ x: igTitlePos.x, y: igTitlePos.y }}
                    size={{ width: igTitleSize.width, height: igTitleSize.height }}
                    onDragStop={(e, d) => setIgTitlePos({ x: d.x, y: d.y })}
                    onResizeStop={(e, direction, ref, delta, position) => {
                      setIgTitleSize({ width: ref.offsetWidth, height: 'auto' });
                      setIgTitlePos(position);
                    }}
                    bounds="parent"
                    enableResizing={isEditingLayout ? { right: true, left: true } : false}
                    disableDragging={!isEditingLayout}
                    minWidth={150}
                    maxWidth={320}
                    className={`z-10 ${isEditingLayout ? 'cursor-move' : ''}`}
                    style={{
                      border: isEditingLayout ? '2px dashed rgba(168, 85, 247, 0.6)' : 'none',
                      borderRadius: isEditingLayout ? '8px' : '0',
                      padding: isEditingLayout ? '4px' : '0',
                    }}
                  >
                    <h2
                      className={`text-amber-400 font-black text-xl leading-tight drop-shadow-lg ${FONT_STYLES[fontStyle].className}`}
                      style={{ fontFamily: FONT_STYLES[fontStyle].fontFamily }}
                    >
                      「{displayIGQuote.title}」
                    </h2>
                  </Rnd>

                  {/* 白色內文 - 可拖拉+縮放 */}
                  <Rnd
                    position={{ x: igContentPos.x, y: igContentPos.y }}
                    size={{ width: igContentSize.width, height: igContentSize.height }}
                    onDragStop={(e, d) => setIgContentPos({ x: d.x, y: d.y })}
                    onResizeStop={(e, direction, ref, delta, position) => {
                      setIgContentSize({ width: ref.offsetWidth, height: 'auto' });
                      setIgContentPos(position);
                    }}
                    bounds="parent"
                    enableResizing={isEditingLayout ? { right: true, left: true } : false}
                    disableDragging={!isEditingLayout}
                    minWidth={150}
                    maxWidth={320}
                    className={`z-10 ${isEditingLayout ? 'cursor-move' : ''}`}
                    style={{
                      border: isEditingLayout ? '2px dashed rgba(168, 85, 247, 0.6)' : 'none',
                      borderRadius: isEditingLayout ? '8px' : '0',
                      padding: isEditingLayout ? '4px' : '0',
                    }}
                  >
                    <div className="border-l-2 border-white/40 pl-4 space-y-2">
                      {displayIGQuote.lines.map((line, i) => (
                        <p
                          key={i}
                          className={`text-white text-sm leading-relaxed drop-shadow-md ${FONT_STYLES[fontStyle].className}`}
                          style={{ fontFamily: FONT_STYLES[fontStyle].fontFamily }}
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  </Rnd>

                  {/* 左下角網址 */}
                  <div className="absolute bottom-6 left-4 z-10">
                    <span className="text-white/50 text-[10px] font-medium whitespace-nowrap">
                      ultra-advisor.tw
                    </span>
                  </div>

                  {/* 底部中間：品牌浮水印 */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
                    <div className="flex items-center gap-1">
                      <img
                        src="/logo.png"
                        alt="Ultra Advisor"
                        className="w-4 h-4 object-contain"
                      />
                      <span className="text-[10px] font-bold whitespace-nowrap">
                        <span className="text-red-500">Ultra</span>
                        <span className="text-blue-400"> Advisor</span>
                      </span>
                    </div>
                  </div>

                  {/* 右下角 QR Code */}
                  <div className="absolute bottom-4 right-4 z-10">
                    <div className="bg-white p-1 rounded-lg">
                      <img
                        src={userLineQrCode || `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://ultra-advisor.tw&bgcolor=ffffff&color=000000&margin=0`}
                        alt="QR Code"
                        className="w-10 h-10 rounded"
                        crossOrigin="anonymous"
                      />
                    </div>
                  </div>

                  {/* 簽名（品牌浮水印上方） */}
                  {signatureDataUrl && (
                    <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-10">
                      <img
                        src={signatureDataUrl}
                        alt="簽名"
                        className={`${getSignatureSizeClass()} object-contain drop-shadow-lg`}
                      />
                    </div>
                  )}
                </>
              )}

              {/* ========== 雜誌風格排版 ========== */}
              {layoutStyle === 'magazine' && (
                <>
                  {/* 累積天數徽章 - 可拖拉 */}
                  <Rnd
                    position={{ x: magazineDayBadgePos.x, y: magazineDayBadgePos.y }}
                    onDragStop={(e, d) => setMagazineDayBadgePos({ x: d.x, y: d.y })}
                    bounds="parent"
                    enableResizing={false}
                    disableDragging={!isEditingLayout}
                    className={`z-30 ${isEditingLayout ? 'cursor-move' : ''}`}
                    style={{
                      border: isEditingLayout ? '2px dashed rgba(168, 85, 247, 0.6)' : 'none',
                      borderRadius: isEditingLayout ? '9999px' : '0',
                    }}
                  >
                    <div className="bg-black/40 px-3 py-1.5 rounded-full">
                      <span className="text-white text-xs font-bold whitespace-nowrap">
                        Day {totalShareDays + (todayShared ? 0 : 1)}
                      </span>
                    </div>
                  </Rnd>

                  {/* 編輯模式提示 */}
                  {isEditingLayout && (
                    <div className="absolute top-6 left-6 bg-purple-600/90 px-3 py-1.5 rounded-full z-30">
                      <span className="text-white text-xs font-bold">✏️ 拖拉調整</span>
                    </div>
                  )}

                  {/* 頂部大標題區 - 可拖拉+縮放 */}
                  <Rnd
                    position={{ x: magazineTitlePos.x, y: magazineTitlePos.y }}
                    size={{ width: magazineTitleSize.width, height: magazineTitleSize.height }}
                    onDragStop={(e, d) => setMagazineTitlePos({ x: d.x, y: d.y })}
                    onResizeStop={(e, direction, ref, delta, position) => {
                      setMagazineTitleSize({ width: ref.offsetWidth, height: 'auto' });
                      setMagazineTitlePos(position);
                    }}
                    bounds="parent"
                    enableResizing={isEditingLayout ? { right: true, left: true } : false}
                    disableDragging={!isEditingLayout}
                    minWidth={150}
                    maxWidth={320}
                    className={`z-10 ${isEditingLayout ? 'cursor-move' : ''}`}
                    style={{
                      border: isEditingLayout ? '2px dashed rgba(168, 85, 247, 0.6)' : 'none',
                      borderRadius: isEditingLayout ? '8px' : '0',
                      padding: isEditingLayout ? '4px' : '0',
                    }}
                  >
                    <div className="px-2">
                      <h1
                        className={`text-white font-black text-xl leading-tight drop-shadow-lg ${FONT_STYLES[fontStyle].className}`}
                        style={{ fontFamily: FONT_STYLES[fontStyle].fontFamily }}
                      >
                        {displayIGQuote.title}
                      </h1>
                      <div className="w-12 h-1 bg-amber-400 mt-3" />
                    </div>
                  </Rnd>

                  {/* 中間內容區 - 可拖拉+縮放 */}
                  <Rnd
                    position={{ x: magazineContentPos.x, y: magazineContentPos.y }}
                    size={{ width: magazineContentSize.width, height: magazineContentSize.height }}
                    onDragStop={(e, d) => setMagazineContentPos({ x: d.x, y: d.y })}
                    onResizeStop={(e, direction, ref, delta, position) => {
                      setMagazineContentSize({ width: ref.offsetWidth, height: 'auto' });
                      setMagazineContentPos(position);
                    }}
                    bounds="parent"
                    enableResizing={isEditingLayout ? { right: true, left: true } : false}
                    disableDragging={!isEditingLayout}
                    minWidth={150}
                    maxWidth={320}
                    className={`z-10 ${isEditingLayout ? 'cursor-move' : ''}`}
                    style={{
                      border: isEditingLayout ? '2px dashed rgba(168, 85, 247, 0.6)' : 'none',
                      borderRadius: isEditingLayout ? '8px' : '0',
                      padding: isEditingLayout ? '4px' : '0',
                    }}
                  >
                    <div className="px-2 space-y-2">
                      {displayIGQuote.lines.map((line, i) => (
                        <p
                          key={i}
                          className={`text-white/90 text-sm leading-relaxed drop-shadow-md ${FONT_STYLES[fontStyle].className}`}
                          style={{ fontFamily: FONT_STYLES[fontStyle].fontFamily }}
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  </Rnd>

                  {/* 左側：顧問資訊 */}
                  <div className="absolute bottom-5 left-4 z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-11 h-11 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0 relative border-2 border-white/30">
                        <div className="absolute inset-0 flex items-center justify-center z-0">
                          <span className="text-white font-bold text-lg">
                            {(userDisplayName || '顧')[0]}
                          </span>
                        </div>
                        {(avatarBase64 || isValidImageUrl(userPhotoURL)) && (
                          <img
                            src={avatarBase64 || userPhotoURL}
                            alt={userDisplayName || '顧問'}
                            className="absolute inset-0 w-full h-full object-cover z-10"
                            crossOrigin="anonymous"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span
                          className="text-white font-bold text-sm whitespace-nowrap"
                          style={{ fontFamily: NAME_FONT_STYLES[nameFontStyle].fontFamily }}
                        >
                          {userDisplayName || '財務顧問'}
                        </span>
                        <span className="text-white/60 text-[10px] whitespace-nowrap">
                          {todayDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 中間：品牌浮水印 */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
                    <div className="flex items-center gap-1">
                      <img
                        src="/logo.png"
                        alt="Ultra Advisor"
                        className="w-4 h-4 object-contain"
                      />
                      <span className="text-[10px] font-bold whitespace-nowrap">
                        <span className="text-red-500">Ultra</span>
                        <span className="text-blue-400"> Advisor</span>
                      </span>
                    </div>
                  </div>

                  {/* 右側：QR Code */}
                  <div className="absolute bottom-4 right-4 z-10">
                    <div className="bg-white p-1 rounded-lg">
                      <img
                        src={userLineQrCode || `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://ultra-advisor.tw&bgcolor=ffffff&color=000000&margin=0`}
                        alt="QR Code"
                        className="w-11 h-11 rounded"
                        crossOrigin="anonymous"
                      />
                    </div>
                  </div>

                  {/* 簽名（品牌浮水印上方） */}
                  {signatureDataUrl && (
                    <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-10">
                      <img
                        src={signatureDataUrl}
                        alt="簽名"
                        className={`${getSignatureSizeClass()} object-contain drop-shadow-lg`}
                      />
                    </div>
                  )}
                </>
              )}

              {/* ========== 卡片風格排版 ========== */}
              {layoutStyle === 'card' && (
                <>
                  {/* 累積天數徽章 */}
                  <div className="absolute top-6 right-6 bg-black/40 px-3 py-1.5 rounded-full z-10">
                    <span className="text-white text-xs font-bold">
                      Day {totalShareDays + (todayShared ? 0 : 1)}
                    </span>
                  </div>

                  {/* 中央卡片區域 - 垂直置中 */}
                  <div className="absolute inset-0 z-10 flex items-center justify-center px-5">
                    {/* 主內容卡片 - 包含所有資訊 */}
                    <div className="w-full bg-white/10 border border-white/20 rounded-2xl p-5">
                      {/* 引號裝飾 */}
                      <div className="text-amber-400 text-4xl font-serif leading-none mb-3">"</div>

                      {/* 金句內容 */}
                      <p
                        className={`text-white font-bold leading-relaxed mb-4 ${
                          displayQuoteText.length > 50 ? 'text-base' : 'text-lg'
                        } ${FONT_STYLES[fontStyle].className}`}
                        style={{ fontFamily: FONT_STYLES[fontStyle].fontFamily }}
                      >
                        {displayQuoteText}
                      </p>

                      {/* 簽名（卡片內） */}
                      {signatureDataUrl && (
                        <div className="flex justify-center mb-3">
                          <img
                            src={signatureDataUrl}
                            alt="簽名"
                            className={`${getSignatureSizeClass()} object-contain`}
                          />
                        </div>
                      )}

                      {/* 分隔線 */}
                      <div className="w-full h-px bg-white/20 my-4" />

                      {/* 底部資訊 */}
                      <div className="flex items-center justify-between">
                        {/* 左側：顧問資訊 */}
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0 relative">
                            <div className="absolute inset-0 flex items-center justify-center z-0">
                              <span className="text-white font-bold text-sm">
                                {(userDisplayName || '顧')[0]}
                              </span>
                            </div>
                            {(avatarBase64 || isValidImageUrl(userPhotoURL)) && (
                              <img
                                src={avatarBase64 || userPhotoURL}
                                alt={userDisplayName || '顧問'}
                                className="absolute inset-0 w-full h-full object-cover z-10"
                                crossOrigin="anonymous"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span
                              className="text-white font-bold text-xs"
                              style={{ fontFamily: NAME_FONT_STYLES[nameFontStyle].fontFamily }}
                            >
                              {userDisplayName || '財務顧問'}
                            </span>
                            <span className="text-white/50 text-[9px]">
                              {todayDate}
                            </span>
                          </div>
                        </div>

                        {/* 中間：品牌浮水印 */}
                        <div className="flex items-center gap-1">
                          <img
                            src="/logo.png"
                            alt="Ultra Advisor"
                            className="w-4 h-4 object-contain"
                          />
                          <span className="text-[10px] font-bold">
                            <span className="text-red-500">Ultra</span>
                            <span className="text-blue-400"> Advisor</span>
                          </span>
                        </div>

                        {/* 右側：QR Code */}
                        <div className="bg-white p-1 rounded-lg">
                          <img
                            src={userLineQrCode || `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://ultra-advisor.tw&bgcolor=ffffff&color=000000&margin=0`}
                            alt="QR Code"
                            className="w-10 h-10 rounded"
                            crossOrigin="anonymous"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 隨機切換 & 進階設定按鈕 */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleShuffle}
                className="flex-1 flex items-center justify-center gap-2 py-2.5
                         bg-amber-500 text-white font-bold rounded-xl
                         hover:bg-amber-400 transition-all"
              >
                <RefreshCw size={16} />
                隨機換一組
              </button>
              <button
                onClick={() => setShowAdvancedSettings(true)}
                className="flex items-center justify-center gap-2 py-2.5 px-4
                         bg-slate-700 text-white font-bold rounded-xl
                         hover:bg-slate-600 transition-all"
              >
                <Settings size={16} />
                進階設定
              </button>
              {(customQuote || customBg || selectedCustomBgIndex !== null) && (
                <button
                  onClick={handleResetToToday}
                  className="flex items-center justify-center gap-2 py-2.5 px-3
                           bg-slate-800 text-white font-bold rounded-xl
                           hover:bg-slate-700 transition-all"
                  title="重置為今日預設"
                >
                  <Calendar size={16} />
                </button>
              )}
            </div>

            {/* 分享按鈕 */}
            <div className="flex gap-3 mt-3">
              <button
                onClick={handleDownload}
                disabled={isGenerating}
                className="flex-1 flex items-center justify-center gap-2 py-3
                         bg-white text-slate-900 font-bold rounded-xl
                         hover:bg-slate-100 transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Download size={18} />
                )}
                下載圖片
              </button>
              <button
                onClick={handleShare}
                disabled={isGenerating}
                className="flex-1 flex items-center justify-center gap-2 py-3
                         bg-purple-600 text-white font-bold rounded-xl
                         hover:bg-purple-500 transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Share2 size={18} />
                )}
                分享社群
              </button>
            </div>

            {/* 提示文字 */}
            <p className="text-center text-white/50 text-xs mt-3">
              下載後可分享到 LINE、IG、FB 限時動態
            </p>

            {/* ========== 進階設定底部抽屜 ========== */}
            {showAdvancedSettings && (
              <div className="fixed inset-0 z-[120] flex items-end justify-center pointer-events-none">
                {/* 背景遮罩 - 只遮下半部 */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-auto"
                  onClick={() => setShowAdvancedSettings(false)}
                />
                {/* 設定面板 - 限制最大高度為 50% */}
                <div className="relative w-full max-w-md bg-slate-900/95 border-t border-slate-700
                                rounded-t-3xl p-5 max-h-[50vh] overflow-y-auto animate-slide-up pointer-events-auto">
                  {/* 頂部拖曳指示條 */}
                  <div className="flex justify-center mb-3">
                    <div className="w-10 h-1 bg-slate-600 rounded-full" />
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-white font-bold text-base flex items-center gap-2">
                      <Settings size={16} /> 進階設定
                    </h4>
                    <button
                      onClick={() => setShowAdvancedSettings(false)}
                      className="w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center"
                    >
                      <X size={16} className="text-slate-400" />
                    </button>
                  </div>

                  {/* 排版風格 */}
                  <div className="mb-4">
                    <label className="text-slate-400 text-[10px] font-bold mb-2 flex items-center gap-1">
                      <Layout size={12} /> 排版風格
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      <button
                        onClick={() => setLayoutStyle('center')}
                        className={`py-2 rounded-lg text-[10px] font-bold transition-all
                                   ${layoutStyle === 'center'
                                     ? 'bg-purple-600 text-white'
                                     : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                      >
                        置中
                      </button>
                      <button
                        onClick={() => setLayoutStyle('left')}
                        className={`py-2 rounded-lg text-[10px] font-bold transition-all
                                   ${layoutStyle === 'left'
                                     ? 'bg-purple-600 text-white'
                                     : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                      >
                        IG
                      </button>
                      <button
                        onClick={() => setLayoutStyle('magazine')}
                        className={`py-2 rounded-lg text-[10px] font-bold transition-all
                                   ${layoutStyle === 'magazine'
                                     ? 'bg-purple-600 text-white'
                                     : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                      >
                        雜誌
                      </button>
                      <button
                        onClick={() => setLayoutStyle('card')}
                        className={`py-2 rounded-lg text-[10px] font-bold transition-all
                                   ${layoutStyle === 'card'
                                     ? 'bg-purple-600 text-white'
                                     : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                      >
                        卡片
                      </button>
                    </div>

                    {/* IG/雜誌風格：編輯位置按鈕 + 重置按鈕 */}
                    {(layoutStyle === 'left' || layoutStyle === 'magazine') && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => {
                            setIsEditingLayout(!isEditingLayout);
                            if (showAdvancedSettings) setShowAdvancedSettings(false);
                          }}
                          className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1
                                     ${isEditingLayout
                                       ? 'bg-amber-500 text-white'
                                       : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                        >
                          <Edit3 size={12} />
                          {isEditingLayout ? '完成編輯' : '拖拉調整'}
                        </button>
                        <button
                          onClick={() => {
                            if (layoutStyle === 'magazine') {
                              // 重置雜誌風格位置
                              setMagazineTitlePos({ x: 24, y: 80 });
                              setMagazineTitleSize({ width: 280, height: 'auto' });
                              setMagazineContentPos({ x: 24, y: 180 });
                              setMagazineContentSize({ width: 280, height: 'auto' });
                              setMagazineDayBadgePos({ x: 270, y: 24 });
                            } else if (layoutStyle === 'left') {
                              // 重置 IG 風格位置
                              setIgDayBadgePos({ x: 270, y: 20 });
                              setIgTitlePos({ x: 16, y: 180 });
                              setIgTitleSize({ width: 280, height: 'auto' });
                              setIgContentPos({ x: 16, y: 300 });
                              setIgContentSize({ width: 280, height: 'auto' });
                            }
                          }}
                          className="px-3 py-2 rounded-lg text-[10px] font-bold transition-all
                                     bg-slate-700 text-slate-300 hover:bg-slate-600 flex items-center justify-center gap-1"
                        >
                          <RefreshCw size={12} />
                          重置
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 文案設定 - 根據排版風格顯示不同編輯區 */}
                  <div className="mb-4">
                    <label className="text-slate-400 text-[10px] font-bold mb-2 flex items-center gap-1">
                      <Type size={12} /> 文案設定
                    </label>

                    {/* 置中/卡片排版：單一文案框 */}
                    {(layoutStyle === 'center' || layoutStyle === 'card') && (
                      <>
                        <div className="grid grid-cols-2 gap-1.5 mb-2">
                          <button
                            onClick={() => setUseCustomText(false)}
                            className={`py-1.5 rounded-lg text-[10px] font-bold transition-all
                                       ${!useCustomText
                                         ? 'bg-purple-600 text-white'
                                         : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                          >
                            使用金句庫
                          </button>
                          <button
                            onClick={() => setUseCustomText(true)}
                            className={`py-1.5 rounded-lg text-[10px] font-bold transition-all
                                       ${useCustomText
                                         ? 'bg-purple-600 text-white'
                                         : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                          >
                            自訂文案
                          </button>
                        </div>
                        {useCustomText && (
                          <textarea
                            value={customText}
                            onChange={(e) => setCustomText(e.target.value)}
                            placeholder="輸入你的金句..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2
                                       text-white text-xs resize-none h-16 focus:outline-none focus:border-purple-500"
                            maxLength={120}
                          />
                        )}
                      </>
                    )}

                    {/* IG 風格 & 雜誌風格：標題 + 分段內文 */}
                    {(layoutStyle === 'left' || layoutStyle === 'magazine') && (
                      <>
                        <div className="grid grid-cols-2 gap-1.5 mb-2">
                          <button
                            onClick={() => setUseCustomIGText(false)}
                            className={`py-1.5 rounded-lg text-[10px] font-bold transition-all
                                       ${!useCustomIGText
                                         ? 'bg-purple-600 text-white'
                                         : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                          >
                            使用文案庫
                          </button>
                          <button
                            onClick={() => setUseCustomIGText(true)}
                            className={`py-1.5 rounded-lg text-[10px] font-bold transition-all
                                       ${useCustomIGText
                                         ? 'bg-purple-600 text-white'
                                         : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                          >
                            自訂文案
                          </button>
                        </div>
                        {useCustomIGText && (
                          <div className="space-y-2">
                            <div>
                              <label className="text-slate-500 text-[9px] mb-1 block">標題</label>
                              <input
                                type="text"
                                value={customIGTitle}
                                onChange={(e) => setCustomIGTitle(e.target.value)}
                                placeholder="例：你的人生，其實一直在用最低標準過日子"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2
                                           text-amber-400 text-xs focus:outline-none focus:border-purple-500"
                                maxLength={40}
                              />
                            </div>
                            <div>
                              <label className="text-slate-500 text-[9px] mb-1 block">內文（每行一段）</label>
                              <textarea
                                value={customIGLines}
                                onChange={(e) => setCustomIGLines(e.target.value)}
                                placeholder={"你有沒有發現\n你的人生\n好像一直都在..."}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2
                                           text-white text-xs resize-none h-16 focus:outline-none focus:border-purple-500"
                              />
                            </div>
                          </div>
                        )}
                        {!useCustomIGText && (
                          <div className="bg-slate-800/50 rounded-lg p-2 text-[10px] text-slate-400">
                            <div className="text-amber-400 font-bold mb-0.5 truncate">「{displayIGQuote.title}」</div>
                            <div className="text-slate-300 truncate">{displayIGQuote.lines[0]}...</div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* 字體選擇 */}
                  <div className="mb-4">
                    <label className="text-slate-400 text-[10px] font-bold mb-2 flex items-center gap-1">
                      <Type size={12} /> 金句字體
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(Object.entries(FONT_STYLES) as [FontStyle, typeof FONT_STYLES[FontStyle]][]).map(([key, style]) => (
                        <button
                          key={key}
                          onClick={() => setFontStyle(key)}
                          className={`py-1.5 rounded-lg text-[10px] font-bold transition-all
                                     ${fontStyle === key
                                       ? 'bg-purple-600 text-white'
                                       : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}
                                     ${style.className}`}
                          style={{ fontFamily: style.fontFamily }}
                        >
                          {style.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 顧問名字字體 */}
                  <div className="mb-4">
                    <label className="text-slate-400 text-[10px] font-bold mb-2 flex items-center gap-1">
                      <PenTool size={12} /> 顧問名字字體
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {(Object.entries(NAME_FONT_STYLES) as [NameFontStyle, typeof NAME_FONT_STYLES[NameFontStyle]][]).map(([key, style]) => (
                        <button
                          key={key}
                          onClick={() => setNameFontStyle(key)}
                          className={`py-2 rounded-lg text-sm transition-all
                                     ${nameFontStyle === key
                                       ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                                       : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                          style={{ fontFamily: style.fontFamily }}
                        >
                          {style.name}
                        </button>
                      ))}
                    </div>
                    {/* 預覽 */}
                    <div className="mt-2 bg-slate-800/50 rounded-lg p-3 text-center">
                      <span
                        className="text-white text-lg"
                        style={{ fontFamily: NAME_FONT_STYLES[nameFontStyle].fontFamily }}
                      >
                        {userDisplayName || '財務顧問'}
                      </span>
                      <p className="text-slate-500 text-[9px] mt-1">預覽效果</p>
                    </div>
                  </div>

                  {/* 自訂背景 */}
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold mb-2 flex items-center gap-1">
                      <ImageIcon size={12} /> 自訂背景 ({customBackgrounds.length}/7)
                    </label>

                    {/* 上傳按鈕 */}
                    <button
                      onClick={() => bgInputRef.current?.click()}
                      disabled={customBackgrounds.length >= 7 || isUploadingBg}
                      className="w-full border border-dashed border-slate-600 rounded-lg p-2.5
                                 text-slate-400 text-xs hover:border-purple-500 hover:text-purple-400
                                 transition-all mb-2 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isUploadingBg ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        <Plus size={14} />
                      )}
                      上傳照片
                    </button>
                    <input
                      ref={bgInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleBgUpload}
                      className="hidden"
                    />

                    {/* 背景預覽格 */}
                    {customBackgrounds.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        {customBackgrounds.map((bg, index) => (
                          <div
                            key={bg.id}
                            className={`relative aspect-[9/16] rounded-lg overflow-hidden cursor-pointer
                                       border-2 transition-all ${selectedCustomBgIndex === index
                                         ? 'border-purple-500 scale-105'
                                         : 'border-transparent hover:border-slate-500'}`}
                            onClick={() => setSelectedCustomBgIndex(index)}
                          >
                            <img
                              src={bg.dataUrl}
                              className="w-full h-full object-cover grayscale"
                              alt={`背景 ${index + 1}`}
                            />
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteBg(index); }}
                              className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full
                                         flex items-center justify-center hover:bg-red-400"
                            >
                              <Trash2 size={10} className="text-white" />
                            </button>
                            {selectedCustomBgIndex === index && (
                              <div className="absolute inset-0 bg-purple-500/30 flex items-center justify-center">
                                <Check size={16} className="text-white" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 使用預設背景按鈕 */}
                    {selectedCustomBgIndex !== null && (
                      <button
                        onClick={() => setSelectedCustomBgIndex(null)}
                        className="w-full py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold
                                   hover:bg-slate-700 transition-all"
                      >
                        改用預設背景庫
                      </button>
                    )}
                  </div>

                  {/* 手寫簽名 */}
                  <div className="mt-4">
                    <label className="text-slate-400 text-[10px] font-bold mb-2 flex items-center gap-1">
                      <PenTool size={12} /> 手寫簽名
                    </label>

                    {/* 已有簽名：顯示預覽 */}
                    {signatureDataUrl ? (
                      <div className="space-y-2">
                        <div className="bg-slate-800/50 rounded-lg p-3 flex items-center justify-center">
                          <img
                            src={signatureDataUrl}
                            alt="簽名預覽"
                            className={`${getSignatureSizeClass()} object-contain`}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setShowSignaturePad(true)}
                            className="py-2 rounded-lg text-[10px] font-bold bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all flex items-center justify-center gap-1"
                          >
                            <Edit3 size={12} /> 重新簽名
                          </button>
                          <button
                            onClick={deleteSignature}
                            className="py-2 rounded-lg text-[10px] font-bold bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-all flex items-center justify-center gap-1"
                          >
                            <Trash2 size={12} /> 刪除簽名
                          </button>
                        </div>
                        {/* 簽名顏色選擇 */}
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 text-[9px]">簽名顏色：</span>
                          {['#FFFFFF', '#FFD700', '#FF6B6B', '#4ECDC4', '#A855F7'].map((color) => (
                            <button
                              key={color}
                              onClick={() => setSignatureColor(color)}
                              className={`w-5 h-5 rounded-full border-2 transition-all ${
                                signatureColor === color ? 'border-purple-500 scale-110' : 'border-transparent'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        {/* 簽名尺寸選擇 */}
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 text-[9px]">簽名大小：</span>
                          <div className="grid grid-cols-3 gap-1 flex-1">
                            {(['small', 'medium', 'large'] as const).map((size) => (
                              <button
                                key={size}
                                onClick={() => setSignatureSize(size)}
                                className={`py-1 rounded text-[9px] font-bold transition-all ${
                                  signatureSize === size
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                }`}
                              >
                                {size === 'small' ? '小' : size === 'medium' ? '中' : '大'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* 尚無簽名：顯示建立按鈕 */
                      <button
                        onClick={() => setShowSignaturePad(true)}
                        className="w-full border border-dashed border-slate-600 rounded-lg p-3
                                   text-slate-400 text-xs hover:border-purple-500 hover:text-purple-400
                                   transition-all flex items-center justify-center gap-2"
                      >
                        <PenTool size={14} />
                        點擊簽名
                      </button>
                    )}
                  </div>

                  {/* 完成按鈕 */}
                  <button
                    onClick={() => setShowAdvancedSettings(false)}
                    className="w-full mt-6 py-3 bg-purple-600 text-white font-bold rounded-xl
                               hover:bg-purple-500 transition-all"
                  >
                    完成設定
                  </button>
                </div>
              </div>
            )}

            {/* ========== 簽名畫布彈窗 ========== */}
            {showSignaturePad && (
              <div className="fixed inset-0 z-[130] flex items-center justify-center">
                {/* 背景遮罩 */}
                <div
                  className="absolute inset-0 bg-black/80"
                  onClick={() => setShowSignaturePad(false)}
                />
                {/* 簽名面板 */}
                <div className="relative w-[90%] max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-white font-bold text-base flex items-center gap-2">
                      <PenTool size={16} /> 手寫簽名
                    </h4>
                    <button
                      onClick={() => setShowSignaturePad(false)}
                      className="w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center"
                    >
                      <X size={16} className="text-slate-400" />
                    </button>
                  </div>

                  {/* 簽名畫布 */}
                  <div className="bg-white rounded-xl overflow-hidden mb-4 select-none">
                    <canvas
                      ref={signatureCanvasRef}
                      width={300}
                      height={150}
                      className="w-full touch-none cursor-crosshair select-none"
                      style={{ touchAction: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
                      onMouseDown={startSignatureDrawing}
                      onMouseMove={drawSignature}
                      onMouseUp={endSignatureDrawing}
                      onMouseLeave={endSignatureDrawing}
                      onTouchStart={startSignatureDrawing}
                      onTouchMove={drawSignature}
                      onTouchEnd={endSignatureDrawing}
                      onTouchCancel={endSignatureDrawing}
                    />
                  </div>

                  {/* 提示文字 */}
                  <p className="text-slate-500 text-[10px] text-center mb-4">
                    在白色區域內簽名，系統會自動去除白色背景
                  </p>

                  {/* 顏色選擇 */}
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <span className="text-slate-400 text-xs">簽名顏色：</span>
                    {['#FFFFFF', '#FFD700', '#FF6B6B', '#4ECDC4', '#A855F7'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setSignatureColor(color)}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${
                          signatureColor === color
                            ? 'border-purple-400 scale-110 ring-2 ring-purple-400/50'
                            : 'border-slate-600 hover:border-slate-400'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color === '#FFFFFF' ? '白色' : color === '#FFD700' ? '金色' : color === '#FF6B6B' ? '紅色' : color === '#4ECDC4' ? '青色' : '紫色'}
                      />
                    ))}
                  </div>

                  {/* 操作按鈕 */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={clearSignature}
                      className="py-3 rounded-xl text-sm font-bold bg-slate-700 text-slate-300
                                 hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
                    >
                      <RotateCcw size={16} /> 清除重畫
                    </button>
                    <button
                      onClick={saveSignature}
                      className="py-3 rounded-xl text-sm font-bold bg-purple-600 text-white
                                 hover:bg-purple-500 transition-all flex items-center justify-center gap-2"
                    >
                      <Check size={16} /> 確認簽名
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 🧮 傲創計算機（簡化版）
// ==========================================
type CalcMode = 'mortgage' | 'credit' | 'smart' | 'irr';

const QuickCalculator = () => {
  const [mode, setMode] = useState<CalcMode>('mortgage');

  // ========== 房貸試算 ==========
  const [mortgageAmount, setMortgageAmount] = useState(10000000);
  const [mortgageRate, setMortgageRate] = useState(2.2);
  const [mortgageYears, setMortgageYears] = useState(30);
  const [mortgageMethod, setMortgageMethod] = useState<'equal_payment' | 'interest_only'>('equal_payment');
  // 房貸圖表投資對比設定
  const [mortgageInvestRate, setMortgageInvestRate] = useState<number | null>(null); // null = 不顯示
  const [mortgageInvestMode, setMortgageInvestMode] = useState<'compound' | 'dividend'>('compound'); // 複利 or 配息
  const [showMortgageInvestSettings, setShowMortgageInvestSettings] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // ========== 智能計算機歷史紀錄 ==========
  const [calcHistory, setCalcHistory] = useState<{ expression: string; result: string }[]>([]);

  // ========== 信貸試算 ==========
  const [creditAmount, setCreditAmount] = useState(500000);
  const [creditRate, setCreditRate] = useState(5.5);
  const [creditYears, setCreditYears] = useState(5);
  // 信貸圖表投資對比設定
  const [creditInvestRate, setCreditInvestRate] = useState<number | null>(null); // null = 不顯示
  const [creditInvestMode, setCreditInvestMode] = useState<'compound' | 'dividend'>('compound');
  const [showCreditInvestSettings, setShowCreditInvestSettings] = useState(false);
  const [showCreditScheduleModal, setShowCreditScheduleModal] = useState(false);

  // ========== 智能計算機 ==========
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcExpression, setCalcExpression] = useState('');
  const [calcLastResult, setCalcLastResult] = useState<number | null>(null);

  // ========== IRR 計算 ==========
  const [totalPremium, setTotalPremium] = useState(1000000);
  const [maturityValue, setMaturityValue] = useState(1350000);
  const [irrYears, setIrrYears] = useState(10);

  // 房貸計算 - 本息均攤
  const getMortgageEqualPayment = () => {
    const i = mortgageRate / 100 / 12;
    const n = mortgageYears * 12;
    if (i === 0) return { monthly: mortgageAmount / n, totalInterest: 0, totalPayment: mortgageAmount };
    const m = (mortgageAmount * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
    const totalPayment = m * n;
    return {
      monthly: Math.round(m),
      totalInterest: Math.round(totalPayment - mortgageAmount),
      totalPayment: Math.round(totalPayment)
    };
  };

  // 房貸計算 - 理財型房貸（只繳息，到期還本）
  const getMortgageInterestOnly = () => {
    const i = mortgageRate / 100 / 12;
    const n = mortgageYears * 12;
    // 每月只繳利息
    const monthlyInterest = mortgageAmount * i;
    // 總利息
    const totalInterest = monthlyInterest * n;
    return {
      monthly: Math.round(monthlyInterest),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(mortgageAmount + totalInterest),
      principalDue: mortgageAmount // 到期須還本金
    };
  };

  // 信貸計算（本息均攤）
  const getCreditResult = () => {
    const i = creditRate / 100 / 12;
    const n = creditYears * 12;
    if (i === 0) return { monthly: creditAmount / n, totalInterest: 0, totalPayment: creditAmount, apr: 0 };
    const m = (creditAmount * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
    const totalPayment = m * n;
    // 計算實質年利率 APR（考慮複利）
    const apr = Math.pow(1 + i, 12) - 1;
    return {
      monthly: Math.round(m),
      totalInterest: Math.round(totalPayment - creditAmount),
      totalPayment: Math.round(totalPayment),
      apr: (apr * 100).toFixed(2)
    };
  };

  // IRR 計算
  const getIrrResult = () => {
    if (totalPremium <= 0 || maturityValue <= 0 || irrYears <= 0) return "0.00";
    return ((Math.pow(maturityValue / totalPremium, 1 / irrYears) - 1) * 100).toFixed(2);
  };

  // ========== 智能計算機邏輯 ==========
  const handleCalcNumber = (num: string) => {
    setCalcDisplay(prev => {
      if (prev === '0' || calcLastResult !== null) {
        setCalcLastResult(null);
        return num;
      }
      return prev + num;
    });
  };

  const handleCalcOperator = (op: string) => {
    setCalcExpression(prev => {
      const newExpr = prev + calcDisplay + ' ' + op + ' ';
      setCalcDisplay('0');
      return newExpr;
    });
    setCalcLastResult(null);
  };

  // 安全的表達式解析器（不使用 eval 或 new Function）
  const safeParseExpression = (expr: string): number => {
    let pos = 0;
    const parseNumber = (): number => {
      let numStr = '';
      while (pos < expr.length && /[0-9.]/.test(expr[pos])) {
        numStr += expr[pos++];
      }
      if (!numStr) throw new Error('Expected number');
      return parseFloat(numStr);
    };
    const parseFactor = (): number => {
      if (expr[pos] === '(') {
        pos++;
        const result = parseAddSub();
        if (expr[pos] === ')') pos++;
        return result;
      }
      if (expr[pos] === '-') {
        pos++;
        return -parseFactor();
      }
      return parseNumber();
    };
    const parseMulDiv = (): number => {
      let result = parseFactor();
      while (pos < expr.length && (expr[pos] === '*' || expr[pos] === '/')) {
        const op = expr[pos++];
        const right = parseFactor();
        result = op === '*' ? result * right : result / right;
      }
      return result;
    };
    const parseAddSub = (): number => {
      let result = parseMulDiv();
      while (pos < expr.length && (expr[pos] === '+' || expr[pos] === '-')) {
        const op = expr[pos++];
        const right = parseMulDiv();
        result = op === '+' ? result + right : result - right;
      }
      return result;
    };
    return parseAddSub();
  };

  const handleCalcEquals = () => {
    try {
      const fullExpr = calcExpression + calcDisplay;
      // 安全計算（使用遞迴解析器，不用 new Function）
      const sanitized = fullExpr.replace(/[^0-9+\-*/.()]/g, '');
      const result = safeParseExpression(sanitized);
      const resultStr = String(Math.round(result * 100) / 100);
      // 加入歷史紀錄（最多保留 10 筆）
      setCalcHistory(prev => {
        const newHistory = [{ expression: fullExpr, result: resultStr }, ...prev];
        return newHistory.slice(0, 10);
      });
      setCalcDisplay(resultStr);
      setCalcExpression('');
      setCalcLastResult(result);
    } catch {
      setCalcDisplay('Error');
    }
  };

  const handleCalcClear = () => {
    setCalcDisplay('0');
    setCalcExpression('');
    setCalcLastResult(null);
  };

  const handleCalcPercent = () => {
    const current = parseFloat(calcDisplay);
    if (!isNaN(current)) {
      setCalcDisplay(String(current / 100));
    }
  };

  const formatMoney = (val: number) => val.toLocaleString('zh-TW');

  return (
    <div className="dark:bg-slate-900/50 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calculator size={18} className="text-amber-400" />
          <h3 className="text-sm font-black dark:text-white text-slate-900 uppercase tracking-wider">傲創計算機</h3>
        </div>
        <a
          href="/calculator"
          onClick={() => {
            // 儲存當前計算數據到 localStorage，讓完整版可以讀取
            localStorage.setItem('ua_calculator_data', JSON.stringify({
              mode,
              mortgage: { amount: mortgageAmount, rate: mortgageRate, years: mortgageYears, method: mortgageMethod },
              credit: { amount: creditAmount, rate: creditRate, years: creditYears },
              irr: { totalPremium, maturityValue, years: irrYears }
            }));
          }}
          className="text-[10px] text-blue-400 hover:text-blue-300 font-bold"
        >
          完整版 →
        </a>
      </div>

      {/* Mode Tabs - 兩排 */}
      <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl mb-4">
        {[
          { id: 'mortgage' as CalcMode, label: '房貸', icon: Home },
          { id: 'credit' as CalcMode, label: '信貸', icon: Coins },
          { id: 'smart' as CalcMode, label: '計算機', icon: Calculator },
          { id: 'irr' as CalcMode, label: 'IRR', icon: TrendingUp },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex items-center justify-center gap-1 py-2 rounded-lg
                       text-[11px] font-bold transition-all ${
              mode === m.id
                ? 'bg-amber-600 text-white'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <m.icon size={12} />
            <span className="hidden sm:inline">{m.label}</span>
          </button>
        ))}
      </div>

      {/* ========== 房貸試算 ========== */}
      {mode === 'mortgage' && (
        <div className="space-y-3">
          {/* 還款方式切換 */}
          <div className="flex bg-slate-800 p-0.5 rounded-lg">
            <button
              onClick={() => setMortgageMethod('equal_payment')}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                mortgageMethod === 'equal_payment'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              本息均攤
            </button>
            <button
              onClick={() => setMortgageMethod('interest_only')}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                mortgageMethod === 'interest_only'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              理財型房貸
            </button>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">貸款金額</label>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={100000}
                step={1}
                value={Math.round(mortgageAmount / 10000)}
                onChange={e => {
                  const val = Math.round(Number(e.target.value));
                  setMortgageAmount(Math.min(Math.max(val, 0), 100000) * 10000);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 pr-10
                         text-white font-bold text-sm focus:border-blue-500 outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">萬</span>
            </div>
            {/* 常用金額按鈕 */}
            <div className="flex gap-1 mt-1.5">
              {[500, 1000, 2000].map(val => (
                <button
                  key={val}
                  onClick={() => setMortgageAmount(val * 10000)}
                  className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all ${
                    mortgageAmount === val * 10000
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {val}萬
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">年利率</label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  min={0.1}
                  max={30}
                  value={mortgageRate}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setMortgageRate(Math.min(Math.max(val, 0), 30));
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 pr-8
                           text-white font-bold text-sm outline-none focus:border-blue-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">%</span>
              </div>
              {/* 常用利率按鈕 */}
              <div className="flex gap-1 mt-1.5">
                {[2.5, 3.0, 3.5].map(val => (
                  <button
                    key={val}
                    onClick={() => setMortgageRate(val)}
                    className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all ${
                      mortgageRate === val
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {val}%
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">年期</label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  step={1}
                  min={1}
                  max={40}
                  value={Math.round(mortgageYears)}
                  onChange={e => {
                    const val = Math.round(Number(e.target.value));
                    setMortgageYears(Math.min(Math.max(val, 1), 40));
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 pr-8
                           text-white font-bold text-sm outline-none focus:border-blue-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">年</span>
              </div>
              {/* 常用年期按鈕 */}
              <div className="flex gap-1 mt-1.5">
                {[20, 25, 30].map(val => (
                  <button
                    key={val}
                    onClick={() => setMortgageYears(val)}
                    className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all ${
                      mortgageYears === val
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {val}年
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 結果顯示 */}
          {mortgageMethod === 'equal_payment' ? (
            <div
              onClick={() => setShowScheduleModal(true)}
              className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4 text-center cursor-pointer hover:bg-blue-900/30 transition-all"
            >
              <div className="text-slate-400 text-[10px] mb-1">每月固定月付金 <span className="text-blue-400">(點擊查看明細)</span></div>
              <div className="text-3xl font-black text-blue-400">
                {formatMoney(getMortgageEqualPayment().monthly)}
                <span className="text-xs ml-1">元</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-blue-500/20">
                <div>
                  <div className="text-[10px] text-slate-500">總利息</div>
                  <div className="text-sm font-bold text-slate-300">{formatMoney(getMortgageEqualPayment().totalInterest)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">總還款</div>
                  <div className="text-sm font-bold text-slate-300">{formatMoney(getMortgageEqualPayment().totalPayment)}</div>
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setShowScheduleModal(true)}
              className="bg-purple-900/20 border border-purple-500/20 rounded-xl p-4 text-center cursor-pointer hover:bg-purple-900/30 transition-all"
            >
              <div className="text-slate-400 text-[10px] mb-1">每月繳息（本金到期歸還）<span className="text-purple-400">(點擊查看明細)</span></div>
              <div className="text-2xl font-black text-purple-400">
                {formatMoney(getMortgageInterestOnly().monthly)}
                <span className="text-xs ml-1">元</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-purple-500/20">
                <div>
                  <div className="text-[10px] text-slate-500">到期還本</div>
                  <div className="text-xs font-bold text-amber-400">{formatMoney(getMortgageInterestOnly().principalDue)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">總利息</div>
                  <div className="text-xs font-bold text-slate-300">{formatMoney(getMortgageInterestOnly().totalInterest)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">總還款</div>
                  <div className="text-xs font-bold text-slate-300">{formatMoney(getMortgageInterestOnly().totalPayment)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========== 信貸試算 ========== */}
      {mode === 'credit' && (
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">貸款金額</label>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={1000}
                step={1}
                value={Math.round(creditAmount / 10000)}
                onChange={e => {
                  const val = Math.round(Number(e.target.value));
                  setCreditAmount(Math.min(Math.max(val, 0), 1000) * 10000);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 pr-10
                         text-white font-bold text-sm focus:border-emerald-500 outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">萬</span>
            </div>
            {/* 常用金額按鈕 */}
            <div className="flex gap-1 mt-1.5">
              {[30, 50, 100].map(val => (
                <button
                  key={val}
                  onClick={() => setCreditAmount(val * 10000)}
                  className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all ${
                    creditAmount === val * 10000
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {val}萬
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">年利率</label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  min={0.1}
                  max={30}
                  value={creditRate}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setCreditRate(Math.min(Math.max(val, 0), 30));
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 pr-8
                           text-white font-bold text-sm outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">%</span>
              </div>
              {/* 常用利率按鈕 */}
              <div className="flex gap-1 mt-1.5">
                {[3, 6, 9, 12].map(val => (
                  <button
                    key={val}
                    onClick={() => setCreditRate(val)}
                    className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all ${
                      creditRate === val
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {val}%
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">年期</label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  step={1}
                  min={1}
                  max={20}
                  value={Math.round(creditYears)}
                  onChange={e => {
                    const val = Math.round(Number(e.target.value));
                    setCreditYears(Math.min(Math.max(val, 1), 20));
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 pr-8
                           text-white font-bold text-sm outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">年</span>
              </div>
              {/* 常用年期按鈕 */}
              <div className="flex gap-1 mt-1.5">
                {[7, 10, 15].map(val => (
                  <button
                    key={val}
                    onClick={() => setCreditYears(val)}
                    className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all ${
                      creditYears === val
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {val}年
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div
            className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-4 text-center cursor-pointer hover:bg-emerald-900/30 transition-colors"
            onClick={() => setShowCreditScheduleModal(true)}
            title="點擊查看還款明細"
          >
            <div className="text-slate-400 text-[10px] mb-1">每月還款金額 <span className="text-emerald-500">(點擊查看明細)</span></div>
            <div className="text-3xl font-black text-emerald-400">
              {formatMoney(getCreditResult().monthly)}
              <span className="text-xs ml-1">元</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-emerald-500/20">
              <div>
                <div className="text-[10px] text-slate-500">總利息</div>
                <div className="text-xs font-bold text-slate-300">{formatMoney(getCreditResult().totalInterest)}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">總還款</div>
                <div className="text-xs font-bold text-slate-300">{formatMoney(getCreditResult().totalPayment)}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">實質年利率</div>
                <div className="text-xs font-bold text-amber-400">{getCreditResult().apr}%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== 智能計算機 ========== */}
      {mode === 'smart' && (
        <div className="space-y-3">
          {/* 顯示區 */}
          <div className="bg-slate-950 border border-slate-700 rounded-xl p-3">
            {calcExpression && (
              <div className="text-slate-500 text-xs text-right mb-1 truncate">{calcExpression}</div>
            )}
            <div className="text-right text-2xl font-mono font-bold text-white truncate">
              {parseFloat(calcDisplay).toLocaleString('zh-TW', { maximumFractionDigits: 4 })}
            </div>
          </div>

          {/* 按鈕區 */}
          <div className="grid grid-cols-4 gap-1.5">
            {/* 第一排 */}
            <button onClick={handleCalcClear} className="bg-red-600/80 hover:bg-red-500 text-white font-bold py-3 rounded-lg text-sm">C</button>
            <button onClick={handleCalcPercent} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg text-sm">%</button>
            <button onClick={() => setCalcDisplay(prev => prev.slice(0, -1) || '0')} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg text-sm">⌫</button>
            <button onClick={() => handleCalcOperator('/')} className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-lg text-sm">÷</button>

            {/* 第二排 */}
            <button onClick={() => handleCalcNumber('7')} className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg">7</button>
            <button onClick={() => handleCalcNumber('8')} className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg">8</button>
            <button onClick={() => handleCalcNumber('9')} className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg">9</button>
            <button onClick={() => handleCalcOperator('*')} className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-lg text-sm">×</button>

            {/* 第三排 */}
            <button onClick={() => handleCalcNumber('4')} className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg">4</button>
            <button onClick={() => handleCalcNumber('5')} className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg">5</button>
            <button onClick={() => handleCalcNumber('6')} className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg">6</button>
            <button onClick={() => handleCalcOperator('-')} className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-lg text-lg">−</button>

            {/* 第四排 */}
            <button onClick={() => handleCalcNumber('1')} className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg">1</button>
            <button onClick={() => handleCalcNumber('2')} className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg">2</button>
            <button onClick={() => handleCalcNumber('3')} className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg">3</button>
            <button onClick={() => handleCalcOperator('+')} className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-lg text-lg">+</button>

            {/* 第五排 */}
            <button onClick={() => handleCalcNumber('00')} className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg text-sm">00</button>
            <button onClick={() => handleCalcNumber('0')} className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg">0</button>
            <button onClick={() => setCalcDisplay(prev => prev.includes('.') ? prev : prev + '.')} className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg">.</button>
            <button onClick={handleCalcEquals} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg">=</button>
          </div>

          {/* 歷史紀錄 - 顯示最近一筆，hover 展開完整 */}
          {calcHistory.length > 0 && (
            <div className="group relative mt-1">
              {/* 最近一筆 + 查看全部 */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <div
                  onClick={() => {
                    setCalcExpression(calcHistory[0].expression + ' =');
                    setCalcDisplay(calcHistory[0].result);
                  }}
                  className="flex-1 truncate cursor-pointer hover:text-slate-300 transition-colors"
                  title="點擊繼續編輯"
                >
                  上次：{calcHistory[0].expression} = <span className="text-blue-400 font-bold">{parseFloat(calcHistory[0].result).toLocaleString()}</span>
                </div>
                <span className="text-slate-600 ml-2 cursor-pointer hover:text-slate-400">
                  ({calcHistory.length}筆) ▼
                </span>
              </div>
              {/* Hover 展開完整歷史 */}
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-slate-900 border border-slate-700 rounded-lg p-2
                            opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-bold">歷史紀錄</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setCalcHistory([]); }}
                    className="text-[10px] text-slate-600 hover:text-red-400 px-2 py-0.5 rounded hover:bg-slate-800"
                  >
                    清除全部
                  </button>
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {calcHistory.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setCalcExpression(item.expression + ' =');
                        setCalcDisplay(item.result);
                      }}
                      className="flex justify-between items-center py-1.5 px-2 bg-slate-800/50 rounded
                               hover:bg-slate-700 cursor-pointer text-xs"
                    >
                      <span className="text-slate-400 truncate flex-1 mr-2">{item.expression}</span>
                      <span className="text-blue-400 font-bold">= {parseFloat(item.result).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========== IRR 年化 ========== */}
      {mode === 'irr' && (
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">累積投入金額</label>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                value={totalPremium / 10000}
                onChange={e => setTotalPremium(Number(e.target.value) * 10000)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 pr-10
                         text-white font-bold text-sm outline-none focus:border-amber-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">萬</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">滿期領回</label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="decimal"
                  value={maturityValue / 10000}
                  onChange={e => setMaturityValue(Number(e.target.value) * 10000)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 pr-10
                           text-white font-bold text-sm outline-none focus:border-amber-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">萬</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">年期</label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  value={irrYears}
                  onChange={e => setIrrYears(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 pr-8
                           text-white font-bold text-sm outline-none focus:border-amber-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">年</span>
              </div>
            </div>
          </div>
          <div className="bg-amber-900/20 border border-amber-500/20 rounded-xl p-4 text-center">
            <div className="text-slate-400 text-[10px] mb-1 uppercase tracking-wider">實質年化報酬率</div>
            <div className="text-4xl font-black text-amber-400">
              {getIrrResult()}
              <span className="text-lg ml-1">%</span>
            </div>
            <div className="text-slate-500 text-[10px] mt-2">
              淨回報：{formatMoney(maturityValue - totalPremium)} 元
            </div>
          </div>
        </div>
      )}

      {/* ========== 還款明細 Modal ========== */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setShowScheduleModal(false)}>
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-white font-bold">
                {mortgageMethod === 'equal_payment' ? '本息均攤還款明細' : '理財型房貸還款明細'}
              </h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {/* 摘要資訊 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-slate-800 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-slate-500">貸款金額</div>
                  <div className="text-sm font-bold text-white">{formatMoney(mortgageAmount)}</div>
                </div>
                <div className="bg-slate-800 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-slate-500">年利率</div>
                  <div className="text-sm font-bold text-white">{mortgageRate}%</div>
                </div>
                <div className="bg-slate-800 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-slate-500">年期</div>
                  <div className="text-sm font-bold text-white">{mortgageYears} 年</div>
                </div>
                <div className="bg-slate-800 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-slate-500">總期數</div>
                  <div className="text-sm font-bold text-white">{mortgageYears * 12} 期</div>
                </div>
              </div>

              {/* 還款趨勢圖 + 投資對比 */}
              <div className="bg-slate-950 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs text-slate-400 font-bold">還款趨勢圖（按年顯示）</div>
                  <button
                    onClick={() => setShowMortgageInvestSettings(!showMortgageInvestSettings)}
                    className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    <Settings size={12} />
                    投資對比設定
                  </button>
                </div>
                {/* 進階設定面板 */}
                {showMortgageInvestSettings && (
                  <div className="bg-slate-800/50 rounded-lg p-3 mb-3 border border-slate-700">
                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">投資報酬率</span>
                        <select
                          className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-white"
                          value={mortgageInvestRate ?? ''}
                          onChange={e => setMortgageInvestRate(e.target.value ? Number(e.target.value) : null)}
                        >
                          <option value="">不顯示</option>
                          <option value="4">4%</option>
                          <option value="5">5%</option>
                          <option value="6">6%</option>
                          <option value="7">7%</option>
                          <option value="8">8%</option>
                          <option value="10">10%</option>
                        </select>
                      </div>
                      {mortgageInvestRate && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">投資方式</span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => setMortgageInvestMode('compound')}
                              className={`px-2 py-1 text-[10px] rounded ${mortgageInvestMode === 'compound' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-400'}`}
                            >
                              複利滾存
                            </button>
                            <button
                              onClick={() => setMortgageInvestMode('dividend')}
                              className={`px-2 py-1 text-[10px] rounded ${mortgageInvestMode === 'dividend' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-400'}`}
                            >
                              每年配息
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    {mortgageInvestRate && (
                      <p className="text-[10px] text-slate-500 mt-2">
                        {mortgageInvestMode === 'compound'
                          ? '複利滾存：本金 + 獲利全部再投資，不領出'
                          : '每年配息：本金不動，每年領取固定配息'}
                      </p>
                    )}
                  </div>
                )}
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={(() => {
                        const chartData: { year: string; 貸款餘額: number; 累計本金: number; 累計利息: number; 投資價值?: number; 累計配息?: number }[] = [];
                        const i = mortgageRate / 100 / 12;
                        const n = mortgageYears * 12;
                        let balance = mortgageAmount;
                        let cumulativePrincipal = 0;
                        let cumulativeInterest = 0;
                        // 投資對比
                        const investRate = mortgageInvestRate ? mortgageInvestRate / 100 : 0;
                        let investValue = mortgageAmount;
                        let cumulativeDividend = 0;

                        if (mortgageMethod === 'equal_payment') {
                          const monthlyPayment = i === 0 ? mortgageAmount / n : (mortgageAmount * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
                          for (let year = 1; year <= mortgageYears; year++) {
                            for (let m = 1; m <= 12; m++) {
                              const interest = balance * i;
                              const principal = monthlyPayment - interest;
                              balance = Math.max(0, balance - principal);
                              cumulativePrincipal += principal;
                              cumulativeInterest += interest;
                            }
                            // 投資計算
                            if (mortgageInvestMode === 'compound') {
                              investValue = mortgageAmount * Math.pow(1 + investRate, year);
                            } else {
                              cumulativeDividend += mortgageAmount * investRate;
                            }
                            const dataPoint: { year: string; 貸款餘額: number; 累計本金: number; 累計利息: number; 投資價值?: number; 累計配息?: number } = {
                              year: `${year}年`,
                              貸款餘額: Math.round(balance / 10000),
                              累計本金: Math.round(cumulativePrincipal / 10000),
                              累計利息: Math.round(cumulativeInterest / 10000),
                            };
                            if (mortgageInvestRate) {
                              if (mortgageInvestMode === 'compound') {
                                dataPoint.投資價值 = Math.round(investValue / 10000);
                              } else {
                                dataPoint.累計配息 = Math.round(cumulativeDividend / 10000);
                              }
                            }
                            chartData.push(dataPoint);
                          }
                        } else {
                          // 理財型：只還利息，本金到期一次還
                          const monthlyInterest = mortgageAmount * i;
                          for (let year = 1; year <= mortgageYears; year++) {
                            cumulativeInterest += monthlyInterest * 12;
                            if (mortgageInvestMode === 'compound') {
                              investValue = mortgageAmount * Math.pow(1 + investRate, year);
                            } else {
                              cumulativeDividend += mortgageAmount * investRate;
                            }
                            const dataPoint: { year: string; 貸款餘額: number; 累計本金: number; 累計利息: number; 投資價值?: number; 累計配息?: number } = {
                              year: `${year}年`,
                              貸款餘額: Math.round(mortgageAmount / 10000),
                              累計本金: 0, // 理財型不還本金
                              累計利息: Math.round(cumulativeInterest / 10000),
                            };
                            if (mortgageInvestRate) {
                              if (mortgageInvestMode === 'compound') {
                                dataPoint.投資價值 = Math.round(investValue / 10000);
                              } else {
                                dataPoint.累計配息 = Math.round(cumulativeDividend / 10000);
                              }
                            }
                            chartData.push(dataPoint);
                          }
                          // 最後一年還清本金
                          chartData[chartData.length - 1].貸款餘額 = 0;
                          chartData[chartData.length - 1].累計本金 = Math.round(mortgageAmount / 10000);
                        }
                        return chartData;
                      })()}
                      margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#475569' }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#475569' }} tickFormatter={(v) => `${v}萬`} width={50} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', fontSize: '11px' }}
                        labelStyle={{ color: '#f8fafc' }}
                        formatter={(value: number) => [`${value.toLocaleString()} 萬`, '']}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      <Area type="monotone" dataKey="貸款餘額" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2} name="貸款餘額" />
                      <Area type="monotone" dataKey="累計本金" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} name="累計本金" />
                      <Area type="monotone" dataKey="累計利息" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} strokeWidth={2} name="累計利息" />
                      {mortgageInvestRate && mortgageInvestMode === 'compound' && (
                        <Area type="monotone" dataKey="投資價值" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} strokeWidth={2} name="投資價值" />
                      )}
                      {mortgageInvestRate && mortgageInvestMode === 'dividend' && (
                        <Area type="monotone" dataKey="累計配息" stroke="#c084fc" fill="#c084fc" fillOpacity={0.2} strokeWidth={2} name="累計配息" />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                {mortgageInvestRate && (
                  <div className="text-[10px] text-slate-500 mt-2">
                    {mortgageInvestMode === 'compound'
                      ? `* 紫色線：假設將 ${formatMoney(mortgageAmount)} 元投資於年化 ${mortgageInvestRate}% 的標的，複利滾存的價值`
                      : `* 淡紫線：假設將 ${formatMoney(mortgageAmount)} 元投資於年化 ${mortgageInvestRate}% 配息的標的，累計領取的配息`}
                  </div>
                )}
              </div>

              {/* 還款明細表格 */}
              <div className="bg-slate-950 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="py-2 px-3 text-left text-slate-400 font-bold">期數</th>
                      <th className="py-2 px-3 text-right text-slate-400 font-bold">月付金</th>
                      <th className="py-2 px-3 text-right text-slate-400 font-bold">本金</th>
                      <th className="py-2 px-3 text-right text-slate-400 font-bold">利息</th>
                      <th className="py-2 px-3 text-right text-slate-400 font-bold">餘額</th>
                      {mortgageInvestRate && mortgageInvestMode === 'dividend' && (
                        <th className="py-2 px-3 text-right text-purple-400 font-bold">累計配息</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const scheduleRows = [];
                      const i = mortgageRate / 100 / 12;
                      const n = mortgageYears * 12;
                      let balance = mortgageAmount;
                      const showDividend = mortgageInvestRate && mortgageInvestMode === 'dividend';
                      const monthlyDividend = showDividend ? (mortgageAmount * (mortgageInvestRate / 100)) / 12 : 0;
                      const colSpan = showDividend ? 6 : 5;

                      if (mortgageMethod === 'equal_payment') {
                        // 本息均攤
                        const monthlyPayment = i === 0
                          ? mortgageAmount / n
                          : (mortgageAmount * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);

                        // 只顯示前12期 + 最後一期
                        const displayPeriods = n <= 24 ? n : 12;
                        for (let period = 1; period <= displayPeriods; period++) {
                          const interest = balance * i;
                          const principal = monthlyPayment - interest;
                          balance = Math.max(0, balance - principal);
                          const cumulativeDividend = monthlyDividend * period;
                          scheduleRows.push(
                            <tr key={period} className="border-b border-slate-800">
                              <td className="py-2 px-3 text-slate-300">{period}</td>
                              <td className="py-2 px-3 text-right text-white font-bold">{formatMoney(Math.round(monthlyPayment))}</td>
                              <td className="py-2 px-3 text-right text-blue-400">{formatMoney(Math.round(principal))}</td>
                              <td className="py-2 px-3 text-right text-amber-400">{formatMoney(Math.round(interest))}</td>
                              <td className="py-2 px-3 text-right text-slate-400">{formatMoney(Math.round(balance))}</td>
                              {showDividend && (
                                <td className="py-2 px-3 text-right text-purple-400">{formatMoney(Math.round(cumulativeDividend))}</td>
                              )}
                            </tr>
                          );
                        }
                        if (n > 24) {
                          scheduleRows.push(
                            <tr key="ellipsis" className="border-b border-slate-800">
                              <td colSpan={colSpan} className="py-2 px-3 text-center text-slate-500">... 中間省略 ...</td>
                            </tr>
                          );
                          // 計算最後一期
                          let lastBalance = mortgageAmount;
                          for (let p = 1; p < n; p++) {
                            const int = lastBalance * i;
                            lastBalance = lastBalance - (monthlyPayment - int);
                          }
                          const lastInterest = lastBalance * i;
                          const totalDividend = monthlyDividend * n;
                          scheduleRows.push(
                            <tr key={n} className="border-b border-slate-800 bg-slate-800/50">
                              <td className="py-2 px-3 text-slate-300">{n}</td>
                              <td className="py-2 px-3 text-right text-white font-bold">{formatMoney(Math.round(monthlyPayment))}</td>
                              <td className="py-2 px-3 text-right text-blue-400">{formatMoney(Math.round(lastBalance))}</td>
                              <td className="py-2 px-3 text-right text-amber-400">{formatMoney(Math.round(lastInterest))}</td>
                              <td className="py-2 px-3 text-right text-green-400 font-bold">0</td>
                              {showDividend && (
                                <td className="py-2 px-3 text-right text-purple-400 font-bold">{formatMoney(Math.round(totalDividend))}</td>
                              )}
                            </tr>
                          );
                        }
                      } else {
                        // 理財型房貸（只繳息）
                        const monthlyInterest = mortgageAmount * i;
                        const displayPeriods = Math.min(12, n);
                        for (let period = 1; period <= displayPeriods; period++) {
                          const cumulativeDividend = monthlyDividend * period;
                          scheduleRows.push(
                            <tr key={period} className="border-b border-slate-800">
                              <td className="py-2 px-3 text-slate-300">{period}</td>
                              <td className="py-2 px-3 text-right text-white font-bold">{formatMoney(Math.round(monthlyInterest))}</td>
                              <td className="py-2 px-3 text-right text-slate-500">0</td>
                              <td className="py-2 px-3 text-right text-amber-400">{formatMoney(Math.round(monthlyInterest))}</td>
                              <td className="py-2 px-3 text-right text-slate-400">{formatMoney(mortgageAmount)}</td>
                              {showDividend && (
                                <td className="py-2 px-3 text-right text-purple-400">{formatMoney(Math.round(cumulativeDividend))}</td>
                              )}
                            </tr>
                          );
                        }
                        if (n > 12) {
                          scheduleRows.push(
                            <tr key="ellipsis" className="border-b border-slate-800">
                              <td colSpan={colSpan} className="py-2 px-3 text-center text-slate-500">... 每期皆相同 ...</td>
                            </tr>
                          );
                        }
                        // 最後一期（到期還本）
                        const totalDividend = monthlyDividend * n;
                        scheduleRows.push(
                          <tr key="final" className="border-b border-slate-800 bg-purple-900/30">
                            <td className="py-2 px-3 text-slate-300">{n} (到期)</td>
                            <td className="py-2 px-3 text-right text-white font-bold">{formatMoney(Math.round(mortgageAmount + monthlyInterest))}</td>
                            <td className="py-2 px-3 text-right text-purple-400 font-bold">{formatMoney(mortgageAmount)}</td>
                            <td className="py-2 px-3 text-right text-amber-400">{formatMoney(Math.round(monthlyInterest))}</td>
                            <td className="py-2 px-3 text-right text-green-400 font-bold">0</td>
                            {showDividend && (
                              <td className="py-2 px-3 text-right text-purple-400 font-bold">{formatMoney(Math.round(totalDividend))}</td>
                            )}
                          </tr>
                        );
                      }
                      return scheduleRows;
                    })()}
                  </tbody>
                </table>
              </div>

              {/* 總計 */}
              <div className="mt-4 p-4 bg-slate-800 rounded-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] text-slate-500 mb-1">總還款金額</div>
                    <div className="text-xl font-black text-white">
                      {formatMoney(mortgageMethod === 'equal_payment'
                        ? getMortgageEqualPayment().totalPayment
                        : getMortgageInterestOnly().totalPayment
                      )} 元
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 mb-1">總利息支出</div>
                    <div className="text-xl font-black text-amber-400">
                      {formatMoney(mortgageMethod === 'equal_payment'
                        ? getMortgageEqualPayment().totalInterest
                        : getMortgageInterestOnly().totalInterest
                      )} 元
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== 信貸還款明細 Modal ========== */}
      {showCreditScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setShowCreditScheduleModal(false)}>
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-white font-bold">信貸還款明細</h3>
              <button onClick={() => setShowCreditScheduleModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {/* 摘要資訊 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-slate-800 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-slate-500">貸款金額</div>
                  <div className="text-sm font-bold text-white">{formatMoney(creditAmount)}</div>
                </div>
                <div className="bg-slate-800 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-slate-500">年利率</div>
                  <div className="text-sm font-bold text-white">{creditRate}%</div>
                </div>
                <div className="bg-slate-800 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-slate-500">年期</div>
                  <div className="text-sm font-bold text-white">{creditYears} 年</div>
                </div>
                <div className="bg-slate-800 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-slate-500">總期數</div>
                  <div className="text-sm font-bold text-white">{creditYears * 12} 期</div>
                </div>
              </div>

              {/* 還款趨勢圖 + 投資對比 */}
              <div className="bg-slate-950 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs text-slate-400 font-bold">還款趨勢圖（按年顯示）</div>
                  <button
                    onClick={() => setShowCreditInvestSettings(!showCreditInvestSettings)}
                    className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    <Settings size={12} />
                    投資對比設定
                  </button>
                </div>
                {/* 進階設定面板 */}
                {showCreditInvestSettings && (
                  <div className="bg-slate-800/50 rounded-lg p-3 mb-3 border border-slate-700">
                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">投資報酬率</span>
                        <select
                          className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-white"
                          value={creditInvestRate ?? ''}
                          onChange={e => setCreditInvestRate(e.target.value ? Number(e.target.value) : null)}
                        >
                          <option value="">不顯示</option>
                          <option value="4">4%</option>
                          <option value="5">5%</option>
                          <option value="6">6%</option>
                          <option value="7">7%</option>
                          <option value="8">8%</option>
                          <option value="10">10%</option>
                        </select>
                      </div>
                      {creditInvestRate && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">投資方式</span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => setCreditInvestMode('compound')}
                              className={`px-2 py-1 text-[10px] rounded ${creditInvestMode === 'compound' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-400'}`}
                            >
                              複利滾存
                            </button>
                            <button
                              onClick={() => setCreditInvestMode('dividend')}
                              className={`px-2 py-1 text-[10px] rounded ${creditInvestMode === 'dividend' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-400'}`}
                            >
                              每年配息
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    {creditInvestRate && (
                      <p className="text-[10px] text-slate-500 mt-2">
                        {creditInvestMode === 'compound'
                          ? '複利滾存：本金 + 獲利全部再投資，不領出'
                          : '每年配息：本金不動，每年領取固定配息'}
                      </p>
                    )}
                  </div>
                )}
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={(() => {
                        const chartData: { year: string; 貸款餘額: number; 累計本金: number; 累計利息: number; 投資價值?: number; 累計配息?: number }[] = [];
                        const i = creditRate / 100 / 12;
                        const n = creditYears * 12;
                        let balance = creditAmount;
                        let cumulativePrincipal = 0;
                        let cumulativeInterest = 0;
                        const monthlyPayment = i === 0 ? creditAmount / n : (creditAmount * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
                        const investRate = creditInvestRate ? creditInvestRate / 100 : 0;
                        let investValue = creditAmount;
                        let cumulativeDividend = 0;

                        for (let year = 1; year <= creditYears; year++) {
                          for (let m = 1; m <= 12; m++) {
                            const interest = balance * i;
                            const principal = monthlyPayment - interest;
                            balance = Math.max(0, balance - principal);
                            cumulativePrincipal += principal;
                            cumulativeInterest += interest;
                          }
                          if (creditInvestMode === 'compound') {
                            investValue = creditAmount * Math.pow(1 + investRate, year);
                          } else {
                            cumulativeDividend += creditAmount * investRate;
                          }
                          const dataPoint: { year: string; 貸款餘額: number; 累計本金: number; 累計利息: number; 投資價值?: number; 累計配息?: number } = {
                            year: `${year}年`,
                            貸款餘額: Math.round(balance / 10000),
                            累計本金: Math.round(cumulativePrincipal / 10000),
                            累計利息: Math.round(cumulativeInterest / 10000),
                          };
                          if (creditInvestRate) {
                            if (creditInvestMode === 'compound') {
                              dataPoint.投資價值 = Math.round(investValue / 10000);
                            } else {
                              dataPoint.累計配息 = Math.round(cumulativeDividend / 10000);
                            }
                          }
                          chartData.push(dataPoint);
                        }
                        return chartData;
                      })()}
                      margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#475569' }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#475569' }} tickFormatter={(v) => `${v}萬`} width={50} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', fontSize: '11px' }}
                        labelStyle={{ color: '#f8fafc' }}
                        formatter={(value: number) => [`${value.toLocaleString()} 萬`, '']}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      <Area type="monotone" dataKey="貸款餘額" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2} />
                      <Area type="monotone" dataKey="累計本金" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                      <Area type="monotone" dataKey="累計利息" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} strokeWidth={2} />
                      {creditInvestRate && creditInvestMode === 'compound' && (
                        <Area type="monotone" dataKey="投資價值" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} strokeWidth={2} />
                      )}
                      {creditInvestRate && creditInvestMode === 'dividend' && (
                        <Area type="monotone" dataKey="累計配息" stroke="#c084fc" fill="#c084fc" fillOpacity={0.2} strokeWidth={2} />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                {creditInvestRate && (
                  <p className="text-[10px] text-slate-500 mt-2">
                    {creditInvestMode === 'compound'
                      ? `* 紫色線：假設將 ${formatMoney(creditAmount)} 元投資於年化 ${creditInvestRate}% 的標的，複利滾存的價值`
                      : `* 淡紫線：假設將 ${formatMoney(creditAmount)} 元投資於年化 ${creditInvestRate}% 配息的標的，累計領取的配息`}
                  </p>
                )}
              </div>

              {/* 還款明細表格 */}
              <div className="bg-slate-950 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="py-2 px-3 text-left text-slate-400 font-bold">期數</th>
                      <th className="py-2 px-3 text-right text-slate-400 font-bold">月付金</th>
                      <th className="py-2 px-3 text-right text-slate-400 font-bold">本金</th>
                      <th className="py-2 px-3 text-right text-slate-400 font-bold">利息</th>
                      <th className="py-2 px-3 text-right text-slate-400 font-bold">餘額</th>
                      {creditInvestRate && creditInvestMode === 'dividend' && (
                        <th className="py-2 px-3 text-right text-purple-400 font-bold">累計配息</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const scheduleRows = [];
                      const i = creditRate / 100 / 12;
                      const n = creditYears * 12;
                      let balance = creditAmount;
                      const showDividend = creditInvestRate && creditInvestMode === 'dividend';
                      const monthlyDividend = showDividend ? (creditAmount * (creditInvestRate / 100)) / 12 : 0;
                      const colSpan = showDividend ? 6 : 5;

                      const monthlyPayment = i === 0
                        ? creditAmount / n
                        : (creditAmount * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);

                      // 只顯示前12期 + 最後一期
                      const displayPeriods = n <= 24 ? n : 12;
                      for (let period = 1; period <= displayPeriods; period++) {
                        const interest = balance * i;
                        const principal = monthlyPayment - interest;
                        balance = Math.max(0, balance - principal);
                        const cumulativeDividend = monthlyDividend * period;
                        scheduleRows.push(
                          <tr key={period} className="border-b border-slate-800">
                            <td className="py-2 px-3 text-slate-300">{period}</td>
                            <td className="py-2 px-3 text-right text-white font-bold">{formatMoney(Math.round(monthlyPayment))}</td>
                            <td className="py-2 px-3 text-right text-emerald-400">{formatMoney(Math.round(principal))}</td>
                            <td className="py-2 px-3 text-right text-amber-400">{formatMoney(Math.round(interest))}</td>
                            <td className="py-2 px-3 text-right text-slate-400">{formatMoney(Math.round(balance))}</td>
                            {showDividend && (
                              <td className="py-2 px-3 text-right text-purple-400">{formatMoney(Math.round(cumulativeDividend))}</td>
                            )}
                          </tr>
                        );
                      }
                      if (n > 24) {
                        scheduleRows.push(
                          <tr key="ellipsis" className="border-b border-slate-800">
                            <td colSpan={colSpan} className="py-2 px-3 text-center text-slate-500">... 中間省略 ...</td>
                          </tr>
                        );
                        // 計算最後一期
                        let lastBalance = creditAmount;
                        for (let p = 1; p < n; p++) {
                          const int = lastBalance * i;
                          lastBalance = lastBalance - (monthlyPayment - int);
                        }
                        const lastInterest = lastBalance * i;
                        const totalDividend = monthlyDividend * n;
                        scheduleRows.push(
                          <tr key={n} className="border-b border-slate-800 bg-slate-800/50">
                            <td className="py-2 px-3 text-slate-300">{n}</td>
                            <td className="py-2 px-3 text-right text-white font-bold">{formatMoney(Math.round(monthlyPayment))}</td>
                            <td className="py-2 px-3 text-right text-emerald-400">{formatMoney(Math.round(lastBalance))}</td>
                            <td className="py-2 px-3 text-right text-amber-400">{formatMoney(Math.round(lastInterest))}</td>
                            <td className="py-2 px-3 text-right text-green-400 font-bold">0</td>
                            {showDividend && (
                              <td className="py-2 px-3 text-right text-purple-400 font-bold">{formatMoney(Math.round(totalDividend))}</td>
                            )}
                          </tr>
                        );
                      }
                      return scheduleRows;
                    })()}
                  </tbody>
                </table>
              </div>

              {/* 總計 */}
              <div className="mt-4 p-4 bg-slate-800 rounded-xl">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-[10px] text-slate-500 mb-1">總還款金額</div>
                    <div className="text-lg font-black text-white">
                      {formatMoney(getCreditResult().totalPayment)} 元
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 mb-1">總利息支出</div>
                    <div className="text-lg font-black text-amber-400">
                      {formatMoney(getCreditResult().totalInterest)} 元
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 mb-1">實質年利率</div>
                    <div className="text-lg font-black text-emerald-400">
                      {getCreditResult().apr}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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
  const [uploadingQr, setUploadingQr] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);

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

  // LINE QR Code 上傳
  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingQr(true);
    try {
      const storageRef = ref(storage, `qrcodes/${user.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setFormData(prev => ({ ...prev, lineQrCode: downloadURL }));
    } catch (error) {
      console.error('QR Code upload failed:', error);
      alert('上傳失敗，請稍後再試');
    } finally {
      setUploadingQr(false);
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

          {/* LINE 網址（自動產生 QR Code） */}
          <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
            <label className="text-sm text-slate-400 font-bold mb-3 flex items-center gap-2">
              <MessageCircle size={14} className="text-emerald-400" />
              LINE 加好友連結（用於限動分享）
            </label>
            <div className="flex items-center gap-4">
              {/* QR Code 預覽 */}
              <div className="w-20 h-20 rounded-xl bg-white border border-slate-600 overflow-hidden flex items-center justify-center flex-shrink-0">
                {formData.lineQrCode ? (
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(formData.lineQrCode)}&bgcolor=ffffff&color=000000&margin=5`}
                    alt="LINE QR Code"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-2">
                    <MessageCircle size={24} className="text-slate-300 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400">未設定</span>
                  </div>
                )}
              </div>

              {/* LINE 網址輸入 */}
              <div className="flex-1">
                <input
                  type="url"
                  value={formData.lineQrCode || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, lineQrCode: e.target.value }))}
                  placeholder="https://line.me/ti/p/xxxxx"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg
                           text-white text-sm placeholder-slate-500
                           focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
                <p className="text-[10px] text-slate-500 mt-2">
                  貼上你的 LINE 加好友網址，系統會自動產生 QR Code 顯示在限動圖卡上
                </p>
                <p className="text-[10px] text-emerald-400 mt-1">
                  💡 可在 LINE App → 主頁 → 加入好友 → 邀請 → 複製連結
                </p>
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

  // 🔔 推播通知
  const pushNotifications = usePushNotifications(user?.uid || null);

  // 📴 離線同步
  const offlineSync = useOfflineSync();

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
    lineQrCode: '',
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

  // 監聽客戶列表（含離線快取）
  useEffect(() => {
    if (!user) return;

    // 離線時先載入快取
    if (!offlineSync.isOnline && offlineSync.isInitialized) {
      offlineSync.getCachedClientList(user.uid).then(cached => {
        if (cached.length > 0) {
          setClients(cached);
          setClientsLoading(false);
          console.log('[Offline] Loaded cached clients:', cached.length);
        }
      });
    }

    const q = query(
      collection(db, 'users', user.uid, 'clients'),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, odId: doc.id, ...doc.data() });
      });
      setClients(list);
      setClientsLoading(false);

      // 快取到 IndexedDB
      if (offlineSync.isInitialized && list.length > 0) {
        offlineSync.cacheClientList(user.uid, list);
      }
    }, (error) => {
      console.error('Load clients failed:', error);
      // 網路錯誤時嘗試從快取載入
      if (offlineSync.isInitialized) {
        offlineSync.getCachedClientList(user.uid).then(cached => {
          if (cached.length > 0) {
            setClients(cached);
            console.log('[Offline] Fallback to cached clients');
          }
          setClientsLoading(false);
        });
      }
    });

    return () => unsubscribe();
  }, [user, offlineSync.isInitialized, offlineSync.isOnline]);

  // 🆕 即時監聽通知（含離線快取）
  useEffect(() => {
    // 離線時先載入快取
    if (!offlineSync.isOnline && offlineSync.isInitialized) {
      offlineSync.getCachedNotificationList().then(cached => {
        if (cached.length > 0) {
          setNotifications(cached);
          console.log('[Offline] Loaded cached notifications:', cached.length);
        }
      });
    }

    const unsubscribe = onSnapshot(
      doc(db, 'siteContent', 'notifications'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const items = (data.items || [])
            .filter((n: any) => n.enabled !== false)
            .sort((a: any, b: any) => (b.priority || 0) - (a.priority || 0));
          setNotifications(items);

          // 快取到 IndexedDB
          if (offlineSync.isInitialized && items.length > 0) {
            offlineSync.cacheNotificationList(items);
          }
        }
      },
      (error) => {
        console.error('Load notifications failed:', error);
        // 網路錯誤時嘗試從快取載入
        if (offlineSync.isInitialized) {
          offlineSync.getCachedNotificationList().then(cached => {
            if (cached.length > 0) {
              setNotifications(cached);
              console.log('[Offline] Fallback to cached notifications');
            }
          });
        }
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
            {/* 📴 離線指示器 */}
            {!offlineSync.isOnline && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 border border-amber-500/30 rounded-lg">
                <Wifi size={14} className="text-amber-400" />
                <span className="text-amber-400 text-xs font-medium hidden md:inline">離線模式</span>
              </div>
            )}

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

                  {/* 🔔 推播通知開關 */}
                  {pushNotifications.isSupported && pushNotifications.permission !== 'denied' && (
                    <div className="p-3 border-t border-slate-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell size={14} className={pushNotifications.isSubscribed ? 'text-purple-400' : 'text-slate-500'} />
                          <span className="text-xs text-slate-400">
                            {pushNotifications.isSubscribed ? '推播已開啟' : '開啟推播通知'}
                          </span>
                        </div>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (pushNotifications.isSubscribed) {
                              await pushNotifications.unsubscribe();
                            } else {
                              await pushNotifications.subscribe();
                            }
                          }}
                          disabled={pushNotifications.isLoading}
                          className={`px-3 py-1 text-xs rounded-lg transition-all ${
                            pushNotifications.isSubscribed
                              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                              : 'bg-purple-600 text-white hover:bg-purple-500'
                          }`}
                        >
                          {pushNotifications.isLoading ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : pushNotifications.isSubscribed ? (
                            '關閉'
                          ) : (
                            '開啟'
                          )}
                        </button>
                      </div>
                      {pushNotifications.error && (
                        <p className="text-red-400 text-[10px] mt-1">{pushNotifications.error}</p>
                      )}
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
          <div className="flex flex-col gap-4">
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

            {/* 🆕 知識庫快捷區塊 - flex-1 讓它填滿剩餘空間與右側卡片底部對齊 */}
            <div className="flex-1 flex flex-col justify-end bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 border border-slate-700/50">
              {/* 標題 */}
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={14} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-300">知識庫</span>
                <span className="text-[10px] text-slate-500">({blogArticles.length} 篇)</span>
              </div>

              {/* 最新文章 */}
              {(() => {
                const latestArticle = [...blogArticles].sort((a, b) => {
                  const dateDiff = new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
                  if (dateDiff !== 0) return dateDiff;
                  return parseInt(b.id) - parseInt(a.id); // 同日期時，id 大的優先
                })[0];
                return (
                  <a
                    href={`/blog/${latestArticle.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mb-2 p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-emerald-400 font-bold">NEW</span>
                      <span className="text-[10px] text-slate-500">{latestArticle.readTime} 分鐘</span>
                    </div>
                    <p className="text-xs text-slate-300 group-hover:text-white line-clamp-1 font-medium">
                      {latestArticle.title}
                    </p>
                  </a>
                );
              })()}

              {/* 按鈕列 */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const randomArticle = blogArticles[Math.floor(Math.random() * blogArticles.length)];
                    window.open(`/blog/${randomArticle.slug}`, '_blank');
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors group"
                >
                  <RefreshCw size={12} className="text-purple-400" />
                  <span className="text-[11px] text-purple-300 group-hover:text-purple-200">隨機</span>
                </button>
                <a
                  href="/blog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors group"
                >
                  <ExternalLink size={12} className="text-slate-400" />
                  <span className="text-[11px] text-slate-400 group-hover:text-slate-300">更多文章...</span>
                </a>
              </div>
            </div>
          </div>

          {/* Market Data */}
          <MarketDataCard
            userId={user?.uid}
            userDisplayName={profileData.displayName || user?.displayName}
            userPhotoURL={profileData.photoURL || user?.photoURL}
            userLineQrCode={profileData.lineQrCode}
          />

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
