import React, { useState, useEffect } from 'react';
import { 
  Users, 
  LayoutDashboard, 
  Calculator, 
  Settings, 
  LogOut, 
  Plus, 
  Search, 
  Phone, 
  MessageCircle, 
  MoreVertical, 
  Edit, 
  Trash2,
  Save,
  X,
  User as UserIcon,
  Briefcase,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  FileText, // 補上
  Loader2   // 補上
} from 'lucide-react';

// --- Firebase 模組 ---
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
  where,
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc,
  serverTimestamp,
  orderBy,
  initializeFirestore,
  memoryLocalCache
} from 'firebase/firestore';

// ------------------------------------------------------------------
// Firebase 設定 (維持不變)
// ------------------------------------------------------------------
const apiKey = "AIzaSyAqS6fhHQVyBNr1LCkCaQPyJ13Rkq7bfHA"; 
const authDomain = "grbt-f87fa.firebaseapp.com";
const projectId = "grbt-f87fa";
const storageBucket = "grbt-f87fa.firebasestorage.app";
const messagingSenderId = "169700005946";
const appId = "1:169700005946:web:9b0722f31aa9fe7ad13d03";

const firebaseConfig = {
  apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId,
  measurementId: "G-58N4KK9M5W"
};

// 初始化 - 使用最強健的連線設定
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
// 啟用強制長輪詢與記憶體快取，避開所有 IndexedDB 鎖死問題
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  localCache: memoryLocalCache(),
});

// ------------------------------------------------------------------
// 型別定義
// ------------------------------------------------------------------
type ClientStatus = 'hot' | 'warm' | 'cold' | 'closed';

interface Client {
  id: string;
  agentId: string; // 歸屬的業務員 ID
  name: string;
  phone: string;
  lineId?: string;
  status: ClientStatus;
  notes?: string;
  createdAt: any;
}

// ------------------------------------------------------------------
// UI 元件 - 登入頁面
// ------------------------------------------------------------------
const LoginPage = ({ onLogin, loading }: { onLogin: () => void, loading: boolean }) => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-blue-600 p-4 rounded-xl shadow-lg shadow-blue-500/20">
          <Briefcase size={40} className="text-white" />
        </div>
      </div>
      <h1 className="text-3xl font-black text-white mb-2 tracking-tight">超業戰情室 <span className="text-blue-500">2.0</span></h1>
      <p className="text-slate-400 mb-8">專業客戶管理系統 CRM</p>
      
      <button 
        onClick={onLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-900 font-bold py-4 px-6 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
      >
        <div className="w-6 h-6 flex items-center justify-center font-bold text-slate-900">G</div>
        {loading ? '系統連線中...' : '使用 Google 帳號登入'}
      </button>
      <p className="text-xs text-slate-500 mt-6">系統連線模式：強制長輪詢 (Long Polling)</p>
    </div>
  </div>
);

// ------------------------------------------------------------------
// UI 元件 - 客戶列表項目
// ------------------------------------------------------------------
const ClientItem = ({ client, onEdit, onDelete }: { client: Client, onEdit: (c: Client) => void, onDelete: (id: string) => void }) => {
  const statusColors = {
    hot: 'bg-red-500/10 text-red-500 border-red-500/20',
    warm: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    cold: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    closed: 'bg-green-500/10 text-green-500 border-green-500/20'
  };
  
  const statusLabels = {
    hot: '🔥 熱度高',
    warm: '☀️ 培養中',
    cold: '❄️ 冷名單',
    closed: '✅ 已成交'
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${statusColors[client.status].replace('text-', 'bg-').replace('/10', '')} text-white`}>
          {client.name.charAt(0)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-800 text-lg">{client.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded border ${statusColors[client.status]}`}>
              {statusLabels[client.status]}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
            <span className="flex items-center gap-1"><Phone size={12}/> {client.phone}</span>
            {client.lineId && <span className="flex items-center gap-1"><MessageCircle size={12}/> {client.lineId}</span>}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <button onClick={() => onEdit(client)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          <Edit size={18} />
        </button>
        <button onClick={() => onDelete(client.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// UI 元件 - 新增/編輯 Modal
// ------------------------------------------------------------------
const ClientModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onSubmit: (data: Omit<Client, 'id' | 'createdAt' | 'agentId'>) => void, 
  initialData?: Client 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    lineId: '',
    status: 'warm' as ClientStatus,
    notes: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        phone: initialData.phone,
        lineId: initialData.lineId || '',
        status: initialData.status,
        notes: initialData.notes || ''
      });
    } else {
      setFormData({ name: '', phone: '', lineId: '', status: 'warm', notes: '' });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800">{initialData ? '編輯客戶資料' : '新增潛在客戶'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full text-slate-500"><X size={20}/></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">客戶姓名 <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="請輸入姓名"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">聯絡電話</label>
              <input 
                type="tel" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="0912-345-678"
              />
            </div>
            <div>
               <label className="block text-sm font-bold text-slate-700 mb-1">LINE ID</label>
               <input 
                 type="text" 
                 value={formData.lineId}
                 onChange={e => setFormData({...formData, lineId: e.target.value})}
                 className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                 placeholder="非必填"
               />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">客戶狀態</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { v: 'hot', l: '🔥 熱度高', c: 'border-red-500 text-red-600 bg-red-50' },
                { v: 'warm', l: '☀️ 培養中', c: 'border-orange-500 text-orange-600 bg-orange-50' },
                { v: 'cold', l: '❄️ 冷名單', c: 'border-blue-500 text-blue-600 bg-blue-50' },
                { v: 'closed', l: '✅ 已成交', c: 'border-green-500 text-green-600 bg-green-50' },
              ].map(opt => (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => setFormData({...formData, status: opt.v as ClientStatus})}
                  className={`text-xs py-2 px-1 rounded-lg border font-bold transition-all ${formData.status === opt.v ? opt.c : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          </div>
          <div>
             <label className="block text-sm font-bold text-slate-700 mb-1">備註筆記</label>
             <textarea 
               value={formData.notes}
               onChange={e => setFormData({...formData, notes: e.target.value})}
               className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
               placeholder="例如：對房產投資有興趣，預算 2000 萬..."
             />
          </div>
          <button 
            onClick={() => {
              if (!formData.name) return alert('請輸入姓名');
              onSubmit(formData);
            }}
            className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-lg mt-2"
          >
            {initialData ? '儲存變更' : '新增客戶'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// 主應用程式
// ------------------------------------------------------------------
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'clients'>('dashboard');
  
  // Clients Data
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Clients (當 user 改變時讀取)
  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user]);

  const fetchClients = async () => {
    if (!user) return;
    setLoadingClients(true);
    try {
      // 策略：查詢 'clients' collection，過濾 agentId == user.uid
      const q = query(
        collection(db, "clients"), 
        where("agentId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Client[];
      
      setClients(list);
    } catch (error) {
      console.error("Error fetching clients:", error);
      // 如果還沒建 index，可能會報錯，這時先不處理 orderBy
      // Fallback simple query
      try {
        const qSimple = query(collection(db, "clients"), where("agentId", "==", user.uid));
        const snapSimple = await getDocs(qSimple);
        const list = snapSimple.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Client[];
        setClients(list);
      } catch (e) {
        console.error("Fallback error:", e);
      }
    } finally {
      setLoadingClients(false);
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login Error:", error);
      alert("登入失敗，請檢查網路連線");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setClients([]);
  };

  const handleAddClient = async (data: Omit<Client, 'id' | 'createdAt' | 'agentId'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "clients"), {
        ...data,
        agentId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setIsModalOpen(false);
      fetchClients(); // Refresh list
    } catch (error) {
      console.error("Add Error:", error);
      alert("新增失敗");
    }
  };

  const handleUpdateClient = async (data: Omit<Client, 'id' | 'createdAt' | 'agentId'>) => {
    if (!editingClient) return;
    try {
      const docRef = doc(db, "clients", editingClient.id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      setIsModalOpen(false);
      setEditingClient(undefined);
      fetchClients(); // Refresh
    } catch (error) {
      console.error("Update Error:", error);
      alert("更新失敗");
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm("確定要刪除這位客戶嗎？此動作無法復原。")) return;
    try {
      await deleteDoc(doc(db, "clients", id));
      setClients(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error("Delete Error:", error);
      alert("刪除失敗");
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  // ------------------------------------------------------------------
  // UI 渲染
  // ------------------------------------------------------------------
  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">啟動系統中...</div>;
  if (!user) return <LoginPage onLogin={handleLogin} loading={loading} />;

  // 統計數據
  const stats = {
    total: clients.length,
    hot: clients.filter(c => c.status === 'hot').length,
    monthNew: clients.length, // 暫時顯示總數，之後可改為本月新增
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row font-sans">
      
      {/* 側邊導航欄 (Sidebar) */}
      <aside className="bg-slate-900 text-slate-400 w-full md:w-64 flex-shrink-0 flex flex-col h-auto md:h-screen sticky top-0 z-40">
        <div className="p-6 flex items-center gap-3 text-white border-b border-slate-800">
          <div className="bg-blue-600 p-2 rounded-lg"><Briefcase size={20} /></div>
          <div>
            <h1 className="font-bold text-lg leading-none">超業戰情室</h1>
            <span className="text-xs text-blue-400 font-mono">Ver 2.0</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button 
            onClick={() => setCurrentTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${currentTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutDashboard size={20} /> 戰情總覽
          </button>
          <button 
            onClick={() => setCurrentTab('clients')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${currentTab === 'clients' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <Users size={20} /> 客戶名單
          </button>
          
          <div className="pt-4 mt-4 border-t border-slate-800">
            <p className="px-4 text-xs font-bold text-slate-600 uppercase mb-2">Coming Soon</p>
            <button disabled className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 cursor-not-allowed">
              <Calculator size={20} /> 試算工具 (移植中)
            </button>
            <button disabled className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 cursor-not-allowed">
              <FileText size={20} /> 提案報告
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            {user.photoURL ? (
              <img src={user.photoURL} className="w-8 h-8 rounded-full border border-slate-600" alt="User" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white"><UserIcon size={16}/></div>
            )}
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-white truncate">{user.displayName}</div>
              <div className="text-xs truncate text-slate-500">{user.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm">
            <LogOut size={16} /> 登出系統
          </button>
        </div>
      </aside>

      {/* 主內容區 (Main Content) */}
      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8">
        
        {/* Dashboard View */}
        {currentTab === 'dashboard' && (
          <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800">早安，{user.displayName}。</h2>
              <p className="text-slate-500">準備好開始今天的戰鬥了嗎？</p>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">總客戶數</p>
                    <h3 className="text-4xl font-black text-slate-800 mt-2">{stats.total}</h3>
                  </div>
                  <div className="bg-slate-100 p-3 rounded-xl text-slate-600"><Users size={24}/></div>
                </div>
                <div className="mt-4 text-sm text-slate-500 flex items-center gap-1">
                  <TrendingUp size={14} className="text-green-500" /> 持續累積資產
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-rose-600 p-6 rounded-2xl shadow-lg shadow-red-200 text-white flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-red-100 uppercase tracking-wider">重點熱度客戶</p>
                    <h3 className="text-4xl font-black mt-2">{stats.hot}</h3>
                  </div>
                  <div className="bg-white/20 p-3 rounded-xl text-white"><AlertCircle size={24}/></div>
                </div>
                <div className="mt-4 text-sm text-red-100 flex items-center gap-1">
                   建議優先聯繫跟進
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">待開發名單</p>
                    <h3 className="text-4xl font-black text-slate-800 mt-2">{stats.total - stats.hot}</h3>
                  </div>
                  <div className="bg-slate-100 p-3 rounded-xl text-slate-600"><Search size={24}/></div>
                </div>
                <div className="mt-4 text-sm text-slate-500">
                   潛在機會都在這裡
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-center justify-between cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => { setIsModalOpen(true); setEditingClient(undefined); }}>
                 <div className="flex items-center gap-4">
                   <div className="bg-blue-600 text-white p-4 rounded-full shadow-lg shadow-blue-500/30"><Plus size={24} /></div>
                   <div>
                     <h4 className="font-bold text-blue-900 text-lg">新增客戶資料</h4>
                     <p className="text-blue-600/80 text-sm">快速建立新的潛在名單</p>
                   </div>
                 </div>
                 <ChevronRight className="text-blue-400" />
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex items-center justify-between cursor-pointer hover:bg-emerald-100 transition-colors" onClick={() => setCurrentTab('clients')}>
                 <div className="flex items-center gap-4">
                   <div className="bg-emerald-600 text-white p-4 rounded-full shadow-lg shadow-emerald-500/30"><Search size={24} /></div>
                   <div>
                     <h4 className="font-bold text-emerald-900 text-lg">搜尋客戶</h4>
                     <p className="text-emerald-600/80 text-sm">查看所有名單詳情</p>
                   </div>
                 </div>
                 <ChevronRight className="text-emerald-400" />
              </div>
            </div>
          </div>
        )}

        {/* Client List View */}
        {currentTab === 'clients' && (
          <div className="max-w-5xl mx-auto h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
             <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
               <div>
                 <h2 className="text-2xl font-bold text-slate-800">客戶名單</h2>
                 <p className="text-slate-500 text-sm">管理您的所有人脈資產</p>
               </div>
               <button 
                 onClick={() => { setEditingClient(undefined); setIsModalOpen(true); }}
                 className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 shadow-lg active:scale-95 transition-all"
               >
                 <Plus size={18} /> 新增客戶
               </button>
             </header>

             {/* Search Bar */}
             <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm mb-6 flex items-center gap-2 sticky top-0 z-10">
               <Search className="text-slate-400 ml-2" size={20} />
               <input 
                 type="text" 
                 placeholder="搜尋姓名或電話..." 
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
                 className="flex-1 p-2 outline-none text-slate-700 font-medium bg-transparent"
               />
               {searchTerm && (
                 <button onClick={() => setSearchTerm('')} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
                   <X size={16} />
                 </button>
               )}
             </div>

             {/* List Content */}
             <div className="flex-1 overflow-y-auto space-y-3 pb-20">
               {loadingClients ? (
                 <div className="text-center py-20 text-slate-400 flex flex-col items-center">
                   <Loader2 className="animate-spin mb-2" size={32} />
                   讀取資料庫中...
                 </div>
               ) : filteredClients.length === 0 ? (
                 <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                   <Users className="mx-auto text-slate-300 mb-4" size={48} />
                   <p className="text-slate-500 font-medium">找不到相關客戶</p>
                   <p className="text-slate-400 text-sm mt-1">試試其他關鍵字，或是新增一筆資料</p>
                 </div>
               ) : (
                 filteredClients.map(client => (
                   <ClientItem 
                     key={client.id} 
                     client={client} 
                     onEdit={(c) => { setEditingClient(c); setIsModalOpen(true); }}
                     onDelete={handleDeleteClient}
                   />
                 ))
               )}
             </div>
          </div>
        )}

      </main>

      {/* Edit/Add Modal */}
      <ClientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingClient ? handleUpdateClient : handleAddClient}
        initialData={editingClient}
      />

    </div>
  );
}