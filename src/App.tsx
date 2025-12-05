import { useState, useEffect, useRef } from 'react';
import { 
  PiggyBank, 
  Wallet, 
  Building2, 
  Calculator,
  Coins,
  CheckCircle2,
  Scale,
  Save,
  FileText,
  Menu,
  X,
  Trash2,
  Printer,
  LogOut,
  User as UserIcon,
  Settings,
  Camera,
  Smartphone,
  Loader2, 
  Focus,   
  ArrowUpFromLine,
  WifiOff
} from 'lucide-react';
import { 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line
} from 'recharts';

// --- Firebase 模組整合 ---
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  getDocs, 
  deleteDoc, 
  doc, 
  orderBy, 
  setDoc, 
  getDoc 
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';

// ------------------------------------------------------------------
// Firebase 設定區域
// ------------------------------------------------------------------
const apiKey = "AIzaSyAqS6fhHQVyBNr1LCkCaQPyJ13Rkq7bfHA"; 
const authDomain = "grbt-f87fa.firebaseapp.com";
const projectId = "grbt-f87fa";
const storageBucket = "grbt-f87fa.firebasestorage.app";
const messagingSenderId = "169700005946";
const appId = "1:169700005946:web:9b0722f31aa9fe7ad13d03";

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: authDomain,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId: messagingSenderId,
  appId: appId,
  measurementId: "G-58N4KK9M5W"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

// ------------------------------------------------------------------
// 輔助函數：超時控制 (防止轉圈圈轉太久)
// ------------------------------------------------------------------
const withTimeout = <T,>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(errorMessage)), ms)
    )
  ]);
};

// --- 樣式注入 ---
const PrintStyles = () => (
  <style>{`
    @media print {
      @page { margin: 1cm; size: A4 portrait; }
      body { background-color: white !important; -webkit-print-color-adjust: exact; }
      .no-print { display: none !important; }
      .print-only { display: block !important; }
      .print-break-inside { break-inside: avoid; }
      .shadow-lg, .shadow-sm, .shadow-xl { box-shadow: none !important; border: 1px solid #ddd !important; }
      .bg-gradient-to-r, .bg-gradient-to-br { background: none !important; background-color: #f0f9ff !important; color: black !important; }
      .text-white { color: black !important; }
      .recharts-wrapper { width: 100% !important; }
    }
  `}</style>
);

// --- 計算函數 ---
const calculateMonthlyPayment = (principal: number, rate: number, years: number) => {
  const r = rate / 100 / 12;
  const n = years * 12;
  if (rate === 0) return (principal * 10000) / n;
  return (principal * 10000 * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

const calculateMonthlyIncome = (principal: number, rate: number) => {
  return (principal * 10000 * (rate / 100)) / 12;
};

const calculateRemainingBalance = (principal: number, rate: number, totalYears: number, yearsElapsed: number) => {
  const r = rate / 100 / 12;
  const n = totalYears * 12;
  const p = yearsElapsed * 12;
  if (rate === 0) return principal * 10000 * (1 - p/n);
  const balance = (principal * 10000 * (Math.pow(1 + r, n) - Math.pow(1 + r, p))) / (Math.pow(1 + r, n) - 1);
  return Math.max(0, balance);
};

// --- 型別定義 ---
type GiftState = {
  loanAmount: number;
  loanTerm: number;
  loanRate: number;
  investReturnRate: number;
};

type EstateState = {
  loanAmount: number;
  loanTerm: number;
  loanRate: number;
  investReturnRate: number;
};

type SavedProfile = {
  id: string;
  name: string;
  date: string;
  type: 'gift' | 'estate';
  data: GiftState | EstateState;
};

type UserProfile = {
  displayName: string;
  title: string;
  lineId: string;
  photoUrl: string;
  photoPosition?: 'center' | 'top'; 
};

// ----------------------------------------------------------------------
// 登入頁面 (Login View)
// ----------------------------------------------------------------------
const LoginPage = ({ onLogin }: { onLogin: () => void }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center space-y-6">
        <div className="flex justify-center mb-4">
          <div className="bg-yellow-400 p-4 rounded-full shadow-lg">
            <Coins size={48} className="text-slate-900" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800">超業菁英戰情室</h1>
          <p className="text-slate-500 mt-2">武裝您的專業，讓數字幫您說故事</p>
        </div>
        <div className="border-t border-slate-100 pt-6">
          <button 
            onClick={onLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-3 px-4 rounded-xl transition-all shadow-sm"
          >
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-blue-600">G</div>
            使用 Google 帳號登入
          </button>
        </div>
        <p className="text-xs text-slate-400">登入即代表您同意使用條款與隱私權政策</p>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 個人設定頁面 (Settings View) - 數位名片功能
// ----------------------------------------------------------------------
const SettingsPage = ({ user, profile, onSaveProfile, onBack }: { user: User, profile: UserProfile, onSaveProfile: (p: UserProfile) => Promise<void>, onBack: () => void }) => {
  const [formData, setFormData] = useState<UserProfile>({
    ...profile,
    photoPosition: profile.photoPosition || 'center' 
  });
  const [uploading, setUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false); 
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      const file = e.target.files[0];
      
      // 限制檔案大小 (例如 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("圖片檔案過大 (超過 5MB)，請選擇較小的圖片以加快上傳速度。");
        setUploading(false);
        return;
      }

      const storageRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${file.name}`);
      
      try {
        // 放寬超時限制到 60 秒 (60000ms)
        const snapshot = await withTimeout(
          uploadBytes(storageRef, file), 
          60000, 
          "上傳超時"
        );
        const url = await getDownloadURL(snapshot.ref);
        setFormData(prev => ({ ...prev, photoUrl: url }));
        // 成功提示 (非 Alert，避免打斷體驗)
        console.log("Upload success:", url);
      } catch (error: any) {
        console.error("Upload failed", error);
        if (error.message === "上傳超時") {
          alert("網路連線較慢，上傳超時。請嘗試使用 WiFi 或較小的圖片。");
        } else {
          alert(`圖片上傳失敗 (${error.code || '未知錯誤'})，請稍後再試。`);
        }
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true); 
    // 放寬儲存超時到 30 秒，避免資料寫入太慢被誤判失敗
    await onSaveProfile(formData);
    setIsSaving(false); 
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Settings size={24} /> 數位名片設定
          </h2>
          <button onClick={onBack} disabled={isSaving} className="p-2 hover:bg-slate-700 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 頭像上傳與預覽區 */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => !isSaving && fileInputRef.current?.click()}>
              {/* 頭像顯示容器 */}
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-md bg-slate-200 relative">
                {formData.photoUrl ? (
                  <img 
                    src={formData.photoUrl} 
                    alt="Avatar" 
                    className={`w-full h-full object-cover transition-all duration-300 ${formData.photoPosition === 'top' ? 'object-top' : 'object-center'}`} 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400"><UserIcon size={48} /></div>
                )}
                
                {/* 載入中遮罩 */}
                {uploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                    <Loader2 className="animate-spin text-slate-900" size={24} />
                  </div>
                )}
              </div>
              
              {/* 上傳提示 icon */}
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={32} className="text-white" />
              </div>
            </div>
            
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" disabled={isSaving} />
            
            {/* 照片對焦設定 */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setFormData({...formData, photoPosition: 'center'})}
                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${formData.photoPosition === 'center' ? 'bg-white shadow text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Focus size={14} /> 居中 (預設)
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, photoPosition: 'top'})}
                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${formData.photoPosition === 'top' ? 'bg-white shadow text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <ArrowUpFromLine size={14} /> 靠上 (人臉)
              </button>
            </div>
            <p className="text-xs text-slate-400">若全身照被切到頭部，請選擇「靠上」</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">顯示名稱</label>
              <input 
                type="text" 
                value={formData.displayName} 
                onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none disabled:bg-slate-100 disabled:text-slate-400"
                placeholder="例如：王大明"
                disabled={isSaving}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">專業職稱</label>
              <input 
                type="text" 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none disabled:bg-slate-100 disabled:text-slate-400"
                placeholder="例如：資深業務經理"
                disabled={isSaving}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">LINE ID</label>
              <input 
                type="text" 
                value={formData.lineId} 
                onChange={(e) => setFormData({...formData, lineId: e.target.value})}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none disabled:bg-slate-100 disabled:text-slate-400"
                placeholder="例如：@superagent"
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">名片預覽</h3>
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
               <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                 {formData.photoUrl ? (
                   <img 
                    src={formData.photoUrl} 
                    className={`w-full h-full object-cover ${formData.photoPosition === 'top' ? 'object-top' : 'object-center'}`} 
                   />
                 ) : (
                   <UserIcon className="m-4 text-slate-400" />
                 )}
               </div>
               <div>
                 <div className="text-xs text-yellow-600 font-bold bg-yellow-50 px-2 py-0.5 rounded-full inline-block mb-1">{formData.title || '職稱'}</div>
                 <div className="font-bold text-slate-800 text-lg">{formData.displayName || '您的姓名'}</div>
                 <div className="text-xs text-slate-500 flex items-center gap-1"><Smartphone size={12}/> LINE: {formData.lineId || '未設定'}</div>
               </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onBack} 
              disabled={isSaving}
              className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 disabled:opacity-50"
            >
              取消
            </button>
            <button 
              type="submit" 
              disabled={isSaving || uploading}
              className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> 儲存中...
                </>
              ) : (
                '儲存設定'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// APP 功能列 (Toolbar)
// ----------------------------------------------------------------------
const AppToolbar = ({ user, profile, onSave, onLoad, onPrint, onLogout, onOpenSettings }: { user: User | null, profile: UserProfile, onSave: () => void, onLoad: () => void, onPrint: () => void, onLogout: () => void, onOpenSettings: () => void }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-slate-900 text-white p-3 px-4 flex justify-between items-center shadow-md sticky top-0 z-50 no-print">
      <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={onOpenSettings}>
        {profile.photoUrl || user?.photoURL ? (
          <img 
            src={profile.photoUrl || user?.photoURL || ''} 
            alt="User" 
            className={`w-10 h-10 rounded-full border-2 border-yellow-400 object-cover ${profile.photoPosition === 'top' ? 'object-top' : 'object-center'}`} 
          />
        ) : (
          <div className="bg-slate-700 p-2 rounded-full border-2 border-slate-600"><UserIcon size={20} /></div>
        )}
        <div className="flex flex-col">
          <span className="text-xs text-yellow-400 font-bold">{profile.title || '超業菁英'}</span>
          <span className="text-sm font-bold text-white leading-none">{profile.displayName || user?.displayName || '設定名片'}</span>
        </div>
      </div>
      
      {/* Desktop Toolbar */}
      <div className="hidden md:flex gap-2">
        <button onClick={onLoad} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-700 rounded text-sm transition-colors border border-slate-700">
          <FileText size={16} /> 讀取客戶
        </button>
        <button onClick={onSave} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-700 rounded text-sm transition-colors border border-slate-700">
          <Save size={16} /> 儲存規劃
        </button>
        <div className="w-px bg-slate-700 mx-1"></div>
        <button onClick={onPrint} className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors font-bold shadow-lg hover:shadow-blue-500/20">
          <Printer size={16} /> 匯出報表
        </button>
        <button onClick={onOpenSettings} className="ml-2 text-slate-400 hover:text-white p-1.5" title="名片設定">
          <Settings size={18} />
        </button>
        <button onClick={onLogout} className="text-slate-400 hover:text-red-400 p-1.5" title="登出">
          <LogOut size={18} />
        </button>
      </div>

      {/* Mobile Menu */}
      <button className="md:hidden p-2 active:bg-slate-800 rounded" onClick={() => setShowMenu(!showMenu)}>
        {showMenu ? <X size={24} /> : <Menu size={24} />}
      </button>

      {showMenu && (
        <div className="absolute top-full left-0 right-0 bg-slate-800 border-t border-slate-700 p-2 flex flex-col gap-2 shadow-xl md:hidden animate-in slide-in-from-top-2">
           <button onClick={() => { onLoad(); setShowMenu(false); }} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700 rounded text-left active:bg-slate-600">
            <FileText size={20} className="text-slate-400" /> 讀取客戶
          </button>
          <button onClick={() => { onSave(); setShowMenu(false); }} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700 rounded text-left active:bg-slate-600">
            <Save size={20} className="text-slate-400" /> 儲存規劃
          </button>
          <button onClick={() => { onPrint(); setShowMenu(false); }} className="flex items-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded text-left font-bold text-white">
            <Printer size={20} /> 匯出報表
          </button>
          <div className="border-t border-slate-700 my-1"></div>
          <button onClick={() => { onOpenSettings(); setShowMenu(false); }} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700 rounded text-left active:bg-slate-600">
            <Settings size={20} className="text-slate-400" /> 名片設定
          </button>
          <button onClick={onLogout} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-700 rounded text-left">
            <LogOut size={20} /> 登出
          </button>
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------
// 輔助元件 (Modal, Tabs) - SavedFilesModal, Gift/Estate Tabs...
// ----------------------------------------------------------------------
const SavedFilesModal = ({ 
  isOpen, 
  onClose, 
  saves, 
  onLoadProfile, 
  onDeleteProfile,
  loading
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  saves: SavedProfile[], 
  onLoadProfile: (p: SavedProfile) => void,
  onDeleteProfile: (id: string) => void,
  loading: boolean
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2"><FileText size={18} className="text-blue-600"/>雲端客戶資料庫</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors"><X size={20} className="text-slate-500" /></button>
        </div>
        <div className="overflow-y-auto p-2 space-y-2 flex-1">
          {loading ? (<div className="text-center py-12 text-slate-400">載入中...</div>) : saves.length === 0 ? (<div className="text-center py-12 text-slate-400"><PiggyBank size={48} className="mx-auto mb-3 opacity-20" /><p>尚無客戶資料</p><p className="text-xs mt-1">規劃完成後點擊「儲存」建立檔案</p></div>) : (
            saves.map((profile) => (
              <div key={profile.id} className="group flex items-center justify-between p-3 hover:bg-blue-50 rounded-xl border border-slate-100 transition-all cursor-pointer" onClick={() => onLoadProfile(profile)}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${profile.type === 'gift' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>{profile.type === 'gift' ? <Wallet size={18} /> : <Building2 size={18} />}</div>
                  <div><div className="font-bold text-slate-700">{profile.name}</div><div className="text-xs text-slate-400">{profile.date} • {profile.type === 'gift' ? '百萬禮物' : '金融房產'}</div></div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onDeleteProfile(profile.id); }} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const MillionDollarGiftTab = ({ data, setData }: { data: GiftState, setData: (d: GiftState) => void }) => {
  const { loanAmount, loanTerm, loanRate, investReturnRate } = data;
  const targetAmount = loanAmount * 3; 
  const monthlyLoanPayment = calculateMonthlyPayment(loanAmount, loanRate, loanTerm);
  const monthlyInvestIncomeSingle = calculateMonthlyIncome(loanAmount, investReturnRate);
  const phase1_NetOut = monthlyLoanPayment - monthlyInvestIncomeSingle;
  const phase2_LoanPmt = monthlyLoanPayment; 
  const phase2_Income = monthlyInvestIncomeSingle * 2; 
  const phase2_NetOut = phase2_LoanPmt - phase2_Income;
  const standardTotalCost = targetAmount * 10000; 
  const standardMonthlySaving = standardTotalCost / (loanTerm * 2 * 12);
  const generateChartData = () => {
    const dataArr = [];
    let cumulativeStandard = 0;
    let cumulativeProjectCost = 0;
    let projectAssetValue = 0;
    for (let year = 1; year <= 14; year++) {
      cumulativeStandard += standardMonthlySaving * 12;
      if (year <= 7) {
        cumulativeProjectCost += phase1_NetOut * 12;
        projectAssetValue = loanAmount * 10000;
      } else {
        cumulativeProjectCost += phase2_NetOut * 12;
        projectAssetValue = loanAmount * 2 * 10000;
      }
      dataArr.push({
        year: `第${year}年`,
        一般存錢成本: Math.round(cumulativeStandard / 10000),
        專案實付成本: Math.round(cumulativeProjectCost / 10000),
        專案持有資產: Math.round(projectAssetValue / 10000),
      });
    }
    return dataArr;
  };
  const updateField = (field: keyof GiftState, value: number) => { setData({ ...data, [field]: value }); };
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex gap-3 items-start print-break-inside">
        <Wallet className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
        <div><h3 className="font-bold text-blue-900">核心概念：小額槓桿，階梯式累積</h3><p className="text-sm text-blue-700">透過 7 年一輪的循環，用時間換取資產。</p></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4 print-break-inside">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 no-print">
            <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Calculator className="w-5 h-5" /> 參數設定</h2>
            <div className="space-y-5">
              {[{ label: "單次借貸額度 (萬)", field: "loanAmount", min: 50, max: 500, step: 10, val: loanAmount }, { label: "信貸利率 (%)", field: "loanRate", min: 1.5, max: 20.0, step: 0.1, val: loanRate }, { label: "配息率 (%)", field: "investReturnRate", min: 3, max: 10, step: 0.5, val: investReturnRate }].map((item) => (
                <div key={item.field}><label className="text-xs font-bold text-slate-500 uppercase">{item.label}</label><div className="flex items-center gap-3"><input type="range" min={item.min} max={item.max} step={item.step} value={item.val} onChange={(e) => updateField(item.field as any, Number(e.target.value))} className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" /><span className="font-mono font-bold text-blue-700 w-14 text-right">{item.val}</span></div></div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-slate-50 rounded text-xs text-slate-500">規劃目標：累積 <strong className="text-blue-600">{targetAmount} 萬</strong> 資產</div>
          </div>
          <div className="hidden print-only border p-4 mb-4 rounded border-slate-300">
            <h3 className="font-bold mb-2">規劃參數</h3>
            <div className="grid grid-cols-2 gap-2 text-sm"><div>信貸額度：{loanAmount} 萬</div><div>信貸利率：{loanRate} %</div><div>配息率：{investReturnRate} %</div><div>總目標：{targetAmount} 萬</div></div>
          </div>
          <div className="bg-white rounded-xl shadow border border-slate-200 p-5 print-break-inside">
             <div className="text-sm text-slate-500 mb-4 text-center">一般存錢月存金額 <span className="line-through decoration-slate-400 font-bold ml-2">${Math.round(standardMonthlySaving).toLocaleString()}</span></div>
             <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="flex justify-between items-center text-sm"><span className="text-slate-600 font-medium">1. 信貸每月還款</span><span className="text-red-500 font-bold font-mono">-${Math.round(monthlyLoanPayment).toLocaleString()}</span></div>
                <div className="flex justify-between items-center text-sm"><span className="text-slate-600 font-medium">2. 扣除每月配息</span><span className="text-green-600 font-bold font-mono">+${Math.round(monthlyInvestIncomeSingle).toLocaleString()}</span></div>
                <div className="border-t border-slate-200 my-2"></div>
                <div className="flex justify-between items-end"><span className="text-blue-700 font-bold">3. 實質每月應負</span><span className="text-3xl font-black text-blue-600 font-mono">${Math.round(phase1_NetOut).toLocaleString()}</span></div>
             </div>
             <div className="mt-4 text-center"><div className="text-xs bg-green-100 text-green-700 py-1.5 px-3 rounded-full inline-block font-bold">比一般存錢每月省下 ${Math.round(standardMonthlySaving - phase1_NetOut).toLocaleString()}</div></div>
          </div>
        </div>
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-2 gap-4 print-break-inside">
             <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500">
               <div className="text-xs text-slate-500 font-bold mb-1">第一階段 (1-7年)</div>
               <div className="flex justify-between items-end"><span className="text-2xl font-bold text-slate-800">${Math.round(phase1_NetOut).toLocaleString()}</span><span className="text-xs text-slate-400">/月</span></div><div className="text-xs text-slate-500 mt-2">擁有 {loanAmount} 萬資產</div>
             </div>
             <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-indigo-500">
               <div className="text-xs text-slate-500 font-bold mb-1">第二階段 (8-14年)</div>
               <div className="flex justify-between items-end"><span className={`text-2xl font-bold ${phase2_NetOut < 0 ? 'text-green-600' : 'text-slate-800'}`}>{phase2_NetOut < 0 ? `+${Math.abs(Math.round(phase2_NetOut)).toLocaleString()}` : `$${Math.round(phase2_NetOut).toLocaleString()}`}</span><span className="text-xs text-slate-400">/月</span></div><div className="text-xs text-slate-500 mt-2">擁有 {loanAmount * 2} 萬資產</div>
             </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-[300px] print-break-inside">
            <ResponsiveContainer width="100%" height="100%"><ComposedChart data={generateChartData()} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}><defs><linearGradient id="colorAssetGift" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="year" tick={{fontSize: 12}} axisLine={false} tickLine={false} /><YAxis unit="萬" tick={{fontSize: 12}} axisLine={false} tickLine={false} /><Tooltip contentStyle={{borderRadius: '8px', border: '1px solid #ddd', boxShadow: 'none'}} /><Legend /><Area type="monotone" dataKey="專案持有資產" stroke="#3b82f6" fill="url(#colorAssetGift)" strokeWidth={2} /><Bar dataKey="一般存錢成本" fill="#cbd5e1" barSize={15} radius={[4,4,0,0]} /><Line type="monotone" dataKey="專案實付成本" stroke="#f59e0b" strokeWidth={3} dot={false} /></ComposedChart></ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const FinancialRealEstateTab = ({ data, setData }: { data: EstateState, setData: (d: EstateState) => void }) => {
  const { loanAmount, loanTerm, loanRate, investReturnRate } = data;
  const monthlyLoanPayment = calculateMonthlyPayment(loanAmount, loanRate, loanTerm);
  const monthlyInvestIncome = calculateMonthlyIncome(loanAmount, investReturnRate);
  const monthlyCashFlow = monthlyInvestIncome - monthlyLoanPayment;
  const isNegativeCashFlow = monthlyCashFlow < 0;
  const totalOutOfPocket = Math.abs(monthlyCashFlow) * 12 * loanTerm;
  const generateHouseChartData = () => {
    const dataArr = [];
    let cumulativeNetIncome = 0; 
    for (let year = 1; year <= loanTerm; year++) {
      cumulativeNetIncome += monthlyCashFlow * 12;
      const remainingLoan = calculateRemainingBalance(loanAmount, loanRate, loanTerm, year);
      const assetEquity = (loanAmount * 10000) - remainingLoan;
      const financialTotalWealth = assetEquity + cumulativeNetIncome;
      const step = loanTerm > 20 ? 3 : 1; 
      if (year === 1 || year % step === 0 || year === loanTerm) {
         dataArr.push({ year: `第${year}年`, 總資產價值: Math.round(financialTotalWealth / 10000), 剩餘貸款: Math.round(remainingLoan / 10000) });
      }
    }
    return dataArr;
  };
  const chartData = generateHouseChartData();
  const finalData = chartData[chartData.length - 1];
  const updateField = (field: keyof EstateState, value: number) => { setData({ ...data, [field]: value }); };
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex gap-3 items-start print-break-inside">
        <Building2 className="w-6 h-6 text-emerald-600 mt-1 flex-shrink-0" />
        <div><h3 className="font-bold text-emerald-900">核心概念：以息養貸，打造數位包租公</h3><p className="text-sm text-emerald-700">利用長年期貸款，讓配息自動幫你繳貸款，期滿後 <strong className="text-emerald-800 underline">資產歸你</strong>。</p></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4 print-break-inside">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 no-print">
            <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Calculator className="w-5 h-5" /> 資產設定</h2>
            <div className="space-y-5">
              {[{ label: "資產/貸款總額 (萬)", field: "loanAmount", min: 500, max: 3000, step: 100, val: loanAmount }, { label: "貸款年期 (年)", field: "loanTerm", min: 20, max: 40, step: 1, val: loanTerm }, { label: "貸款利率 (%)", field: "loanRate", min: 1.8, max: 4.0, step: 0.1, val: loanRate }, { label: "配息率 (%)", field: "investReturnRate", min: 3, max: 10, step: 0.5, val: investReturnRate }].map((item) => (
                <div key={item.field}><label className="text-xs font-bold text-slate-500 uppercase">{item.label}</label><div className="flex items-center gap-3"><input type="range" min={item.min} max={item.max} step={item.step} value={item.val} onChange={(e) => updateField(item.field as any, Number(e.target.value))} className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" /><span className="font-mono font-bold text-emerald-700 w-14 text-right">{item.val}</span></div></div>
              ))}
            </div>
          </div>
           <div className="hidden print-only border p-4 mb-4 rounded border-slate-300">
            <h3 className="font-bold mb-2">房產參數</h3>
            <div className="grid grid-cols-2 gap-2 text-sm"><div>貸款總額：{loanAmount} 萬</div><div>年期：{loanTerm} 年</div><div>貸款利率：{loanRate} %</div><div>配息率：{investReturnRate} %</div></div>
          </div>
          <div className="bg-white rounded-xl shadow border border-slate-200 p-6 print-break-inside">
             <h3 className="text-center font-bold text-slate-700 mb-4">每月現金流試算</h3>
             <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
               <div className="flex justify-between items-center text-sm"><span className="text-slate-600 font-medium">1. 每月配息收入</span><span className="font-mono text-emerald-600 font-bold">+${Math.round(monthlyInvestIncome).toLocaleString()}</span></div>
               <div className="flex justify-between items-center text-sm"><span className="text-slate-600 font-medium">2. 扣除貸款支出</span><span className="font-mono text-red-500 font-bold">-${Math.round(monthlyLoanPayment).toLocaleString()}</span></div>
               <div className="border-t border-slate-200 my-2"></div>
               {isNegativeCashFlow ? (
                 <div className="text-center">
                    <div className="text-xs text-slate-400 mb-1">每月需負擔</div><div className="text-3xl font-black text-red-500 font-mono">-${Math.abs(Math.round(monthlyCashFlow)).toLocaleString()}</div>
                    <div className="mt-4 bg-orange-50 rounded-lg p-3 border border-orange-100"><div className="flex items-center justify-center gap-2 text-orange-800 font-bold text-sm mb-1"><Scale className="w-4 h-4" /> 槓桿效益分析</div><div className="text-xs text-orange-700 mb-2">{loanTerm}年總共只付出 <span className="font-bold underline">${Math.round(totalOutOfPocket/10000)}萬</span></div><div className="text-xs bg-white rounded py-1 px-2 text-orange-800 border border-orange-200">換取 <span className="font-bold text-lg">${loanAmount}萬</span> 原始資產</div></div>
                 </div>
               ) : (
                 <div className="text-center">
                    <div className="text-xs text-slate-400 mb-1">每月淨現金流</div><div className="text-3xl font-black text-emerald-600 font-mono">+${Math.round(monthlyCashFlow).toLocaleString()}</div><div className="text-xs mt-2 text-slate-500">完全由資產養貸，還有找！</div>
                 </div>
               )}
             </div>
          </div>
        </div>
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden print-break-inside">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Coins size={120} /></div>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><CheckCircle2 className="text-emerald-300" />{loanTerm} 年期滿總結算</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-emerald-400/30">
                <div className="text-emerald-200 text-xs mb-1">1. 房貸結清</div><div className="text-2xl font-bold">0</div><div className="text-xs text-emerald-200 mt-1 opacity-75">無債一身輕</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-emerald-400/30">
                <div className="text-emerald-200 text-xs mb-1">2. 本金歸你</div><div className="text-2xl font-bold">{loanAmount} <span className="text-sm font-normal">萬</span></div><div className="text-xs text-emerald-200 mt-1 opacity-75">資產保留</div>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-yellow-300/50 shadow-lg">
                <div className="text-yellow-200 text-xs mb-1 font-bold">3. 總效益</div><div className="text-3xl font-black text-yellow-300">{finalData ? finalData.總資產價值 : 0} <span className="text-sm font-normal text-white">萬</span></div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-[360px] print-break-inside">
             <h4 className="text-sm font-bold text-slate-600 mb-2 pl-2">{loanTerm}年「總資產價值」走勢 (單位: 萬)</h4>
            <ResponsiveContainer width="100%" height="100%"><ComposedChart data={generateChartData()} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}><defs><linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="year" tick={{fontSize: 12}} axisLine={false} tickLine={false} /><YAxis unit="萬" tick={{fontSize: 12}} axisLine={false} tickLine={false} /><Tooltip contentStyle={{borderRadius: '8px', border: '1px solid #ddd', boxShadow: 'none'}} /><Legend /><Area type="monotone" name="總資產價值 (含配息)" dataKey="總資產價值" stroke="#10b981" fill="url(#colorWealth)" strokeWidth={3} /><Line type="monotone" name="剩餘房貸" dataKey="剩餘貸款" stroke="#ef4444" strokeWidth={1} dot={false} opacity={0.5} /></ComposedChart></ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 主程式 (Web App Entry)
// ----------------------------------------------------------------------
export default function App() {
  const [activeTab, setActiveTab] = useState<'gift' | 'estate'>('gift');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'main' | 'settings'>('main');
  
  // State
  const [giftData, setGiftData] = useState<GiftState>({ loanAmount: 100, loanTerm: 7, loanRate: 2.8, investReturnRate: 6 });
  const [estateData, setEstateData] = useState<EstateState>({ loanAmount: 1000, loanTerm: 30, loanRate: 2.2, investReturnRate: 6 });

  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>({ displayName: '', title: '', lineId: '', photoUrl: '' });

  // Firebase Logic
  const [saves, setSaves] = useState<SavedProfile[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // 監聽登入狀態
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      // 關鍵優化：確認身份後「立刻」解除 Loading，不需要等待資料庫回應
      // 這樣可以解決卡在啟動畫面 30 秒的問題
      setLoading(false);

      if (currentUser) {
        // 載入使用者設定檔 (背景執行，不卡介面)
        const docRef = doc(db, "users", currentUser.uid, "profile", "info");
        try {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          } else {
            // 預設值
            setUserProfile({ displayName: currentUser.displayName || '', title: '', lineId: '', photoUrl: currentUser.photoURL || '' });
          }
        } catch (e) {
          console.error("Error loading profile", e);
          // 即使報錯也不影響主程式運行
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login failed", error);
      if (error.code === 'auth/api-key-not-valid' || error.code === 'auth/invalid-api-key') {
         alert("API Key 驗證失敗：請檢查 Vercel 環境變數設定");
      } else {
         alert("登入失敗，請重試");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setSaves([]); 
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // 載入雲端資料
  const loadCloudFiles = async () => {
    if (!user) return;
    setLoadingFiles(true);
    setIsModalOpen(true);
    try {
      const q = query(collection(db, "users", user.uid, "plans"), orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      const loadedFiles: SavedProfile[] = [];
      querySnapshot.forEach((doc) => {
        loadedFiles.push({ id: doc.id, ...doc.data() } as SavedProfile);
      });
      setSaves(loadedFiles);
    } catch (error) {
      console.error("Error loading files:", error);
      alert("讀取資料失敗");
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    const name = prompt("請輸入客戶姓名或專案名稱：", "新專案");
    if (!name) return;

    const newProfile = {
      name,
      date: new Date().toLocaleDateString(),
      type: activeTab,
      data: activeTab === 'gift' ? { ...giftData } : { ...estateData }
    };

    try {
      // 加入 15 秒超時限制
      await withTimeout(
        addDoc(collection(db, "users", user.uid, "plans"), newProfile),
        15000,
        "儲存超時"
      );
      alert("儲存成功！");
    } catch (error: any) {
      console.error("Error saving document: ", error);
      if (error.message === "儲存超時") {
        alert("儲存時間過長，請檢查網路連線。");
      } else {
        alert("儲存失敗，請稍後再試。");
      }
    }
  };
  
  const handleSaveProfile = async (newProfile: UserProfile) => {
    if (!user) return;
    try {
      // 這裡放寬儲存超時限制到 30 秒
      await withTimeout(
        setDoc(doc(db, "users", user.uid, "profile", "info"), newProfile),
        30000,
        "儲存超時"
      );
      setUserProfile(newProfile);
      alert("名片設定已更新！");
      setView('main');
    } catch (error: any) {
      console.error("Error saving profile: ", error);
      if (error.message === "儲存超時") {
        alert("儲存時間過長，請檢查網路連線。");
      } else {
        alert("儲存失敗，請檢查網路或權限。");
      }
    }
  };

  const handleDeleteProfile = async (id: string) => {
    if (!user || !confirm("確定要刪除此紀錄嗎？")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "plans", id));
      setSaves(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error("Error deleting document: ", error);
      alert("刪除失敗");
    }
  };

  const handleLoadProfile = (profile: SavedProfile) => {
    setActiveTab(profile.type);
    if (profile.type === 'gift') {
      setGiftData(profile.data as GiftState);
    } else {
      setEstateData(profile.data as EstateState);
    }
    setIsModalOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">系統啟動中...</div>;
  if (!user) return <LoginPage onLogin={handleLogin} />;

  // 路由切換：設定頁 或 主畫面
  if (view === 'settings') {
    return (
      <SettingsPage 
        user={user} 
        profile={userProfile} 
        onSaveProfile={handleSaveProfile} 
        onBack={() => setView('main')} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      <PrintStyles />
      
      <AppToolbar 
        user={user}
        profile={userProfile}
        onSave={handleSave} 
        onLoad={loadCloudFiles} 
        onPrint={handlePrint}
        onLogout={handleLogout}
        onOpenSettings={() => setView('settings')}
      />

      <SavedFilesModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        saves={saves} 
        onLoadProfile={handleLoadProfile}
        onDeleteProfile={handleDeleteProfile}
        loading={loadingFiles}
      />

      <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 shadow-lg mb-8 no-print">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Coins className="w-8 h-8 text-yellow-400" />
              全方位資產規劃系統
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              專業版 • 資產累積 • 現金流規劃
            </p>
          </div>
          
          <div className="bg-slate-700/50 p-1 rounded-lg flex">
            <button 
              onClick={() => setActiveTab('gift')}
              className={`px-6 py-2 rounded-md font-bold transition-all flex items-center gap-2 ${activeTab === 'gift' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300 hover:text-white'}`}
            >
              <Wallet size={18} />
              百萬禮物
            </button>
            <button 
              onClick={() => setActiveTab('estate')}
              className={`px-6 py-2 rounded-md font-bold transition-all flex items-center gap-2 ${activeTab === 'estate' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-300 hover:text-white'}`}
            >
              <Building2 size={18} />
              金融房產
            </button>
          </div>
        </div>
      </header>

      {/* 列印用的 Header (隱藏原本的黑底 Header，改用白底簡潔版) */}
      <div className="hidden print-only text-center mb-8 border-b pb-4">
         <div className="flex justify-between items-end mb-4">
            <div className="text-left">
              <h1 className="text-3xl font-bold text-slate-900">資產規劃建議書</h1>
              <div className="text-sm text-slate-500 mt-1">規劃專案：{activeTab === 'gift' ? '百萬禮物專案' : '金融房產專案'}</div>
            </div>
            {/* 列印時顯示的名片區塊 */}
            <div className="text-right">
               <div className="font-bold text-lg">{userProfile.displayName || user.displayName}</div>
               <div className="text-sm text-slate-500">{userProfile.title}</div>
               {userProfile.lineId && <div className="text-xs text-slate-400 mt-1">LINE: {userProfile.lineId}</div>}
            </div>
         </div>
         <div className="text-xs text-slate-300 text-right border-t pt-1">列印日期：{new Date().toLocaleDateString()}</div>
      </div>

      <main className="max-w-6xl mx-auto px-4">
        {activeTab === 'gift' ? (
          <MillionDollarGiftTab data={giftData} setData={setGiftData} />
        ) : (
          <FinancialRealEstateTab data={estateData} setData={setEstateData} />
        )}
      </main>

      <footer className="max-w-6xl mx-auto px-4 mt-12 text-center text-slate-400 text-xs py-8 no-print">
          © 2025 金融理財規劃系統 Web App Edition. All rights reserved.
      </footer>
    </div>
  );
}