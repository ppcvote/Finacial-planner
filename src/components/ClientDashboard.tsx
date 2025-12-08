import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Trash2, 
  ChevronRight, 
  Calendar, 
  TrendingUp,
  Clock,
  Briefcase,
  MoreVertical,
  Plus
} from 'lucide-react';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

// 預設的工具資料
const defaultToolStates = {
    giftData: { loanAmount: 100, loanTerm: 7, loanRate: 2.8, investReturnRate: 6 },
    estateData: { loanAmount: 1000, loanTerm: 30, loanRate: 2.2, investReturnRate: 6, existingLoanBalance: 700, existingMonthlyPayment: 38000 },
    studentData: { loanAmount: 40, investReturnRate: 6, years: 8, gracePeriod: 1, interestOnlyPeriod: 0, isQualified: false },
    superActiveData: { monthlySaving: 10000, investReturnRate: 6, activeYears: 15 },
    carData: { carPrice: 100, investReturnRate: 6, resaleRate: 50, cycleYears: 5 },
    pensionData: { currentAge: 30, retireAge: 65, salary: 45000, laborInsYears: 35, selfContribution: false, pensionReturnRate: 3, desiredMonthlyIncome: 60000 },
    reservoirData: { initialCapital: 1000, dividendRate: 5, reinvestRate: 8, years: 20 },
    taxData: { spouse: true, children: 2, minorYearsTotal: 0, parents: 0, cash: 3000, realEstateMarket: 4000, stocks: 1000, insurancePlan: 0 }
};

interface ClientDashboardProps {
    user: any;
    onSelectClient: (client: any) => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ user, onSelectClient }) => {
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // 新增客戶表單狀態
    const [newClientName, setNewClientName] = useState('');
    const [newClientNote, setNewClientNote] = useState('');

    // 1. 監聽客戶列表
    useEffect(() => {
        if (!user) return;
        
        const q = query(
            collection(db, 'users', user.uid, 'clients'), 
            orderBy('updatedAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const clientList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setClients(clientList);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching clients:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // 2. 新增客戶邏輯
    const handleAddClient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newClientName.trim()) return;

        try {
            const newClientData = {
                name: newClientName,
                note: newClientNote,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                ...defaultToolStates
            };

            await addDoc(collection(db, 'users', user.uid, 'clients'), newClientData);
            
            setIsAddModalOpen(false);
            setNewClientName('');
            setNewClientNote('');
        } catch (error) {
            console.error("Error adding client:", error);
            alert("新增客戶失敗，請檢查網路連線");
        }
    };

    // 3. 刪除客戶邏輯
    const handleDeleteClient = async (e: React.MouseEvent, clientId: string) => {
        e.stopPropagation(); 
        if (window.confirm("確定要刪除這位客戶的資料嗎？此操作無法復原。")) {
            try {
                await deleteDoc(doc(db, 'users', user.uid, 'clients', clientId));
            } catch (error) {
                console.error("Error deleting client:", error);
            }
        }
    };

    // 4. 搜尋過濾
    const filteredClients = clients.filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.note && client.note.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // 5. 統計數據
    const totalClients = clients.length;
    const activeThisMonth = clients.filter(c => {
        const date = c.updatedAt?.toDate();
        const now = new Date();
        return date && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-0"></div>
            <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none z-0">
                <Briefcase size={200} className="text-white"/>
            </div>

            <div className="max-w-6xl mx-auto p-4 md:p-8 relative z-10 animate-fade-in-up">
                
                {/* 1. Dashboard Header & Stats */}
                <div className="mb-8 text-white">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                        <div>
                            <p className="text-blue-300 font-bold tracking-wider text-xs mb-1 uppercase">Overview</p>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                                歡迎回來，{user?.displayName || '顧問'}
                            </h1>
                            <p className="text-slate-400 mt-1">準備好為您的客戶創造價值了嗎？</p>
                        </div>
                        <button 
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-blue-500 hover:bg-blue-400 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/30 flex items-center gap-2 transition-all transform hover:-translate-y-1 active:scale-95"
                        >
                            <UserPlus size={20}/> 新增客戶檔案
                        </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-500/20 rounded-lg"><Users size={18} className="text-blue-400"/></div>
                                <span className="text-slate-300 text-xs font-bold">總客戶數</span>
                            </div>
                            <p className="text-2xl font-black">{totalClients}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-emerald-500/20 rounded-lg"><TrendingUp size={18} className="text-emerald-400"/></div>
                                <span className="text-slate-300 text-xs font-bold">本月活躍</span>
                            </div>
                            <p className="text-2xl font-black">{activeThisMonth}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl hidden md:block">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-purple-500/20 rounded-lg"><Clock size={18} className="text-purple-400"/></div>
                                <span className="text-slate-300 text-xs font-bold">最後更新</span>
                            </div>
                            <p className="text-sm font-bold truncate">
                                {clients.length > 0 && clients[0].updatedAt 
                                    ? new Date(clients[0].updatedAt.seconds * 1000).toLocaleDateString()
                                    : '--'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Search & Filter Bar */}
                <div className="bg-white p-2 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 flex items-center gap-2 mb-6 sticky top-4 z-20">
                    <div className="p-3 text-slate-400">
                        <Search size={20}/>
                    </div>
                    <input 
                        type="text" 
                        placeholder="輸入姓名或備註搜尋..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-slate-700 placeholder:text-slate-400 h-full py-2"
                    />
                </div>

                {/* 3. Client List Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <div className="animate-spin mb-4"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>
                        <p>正在同步雲端資料...</p>
                    </div>
                ) : filteredClients.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="text-slate-300" size={40}/>
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 mb-1">尚無符合的客戶資料</h3>
                        <p className="text-slate-400 text-sm mb-6">點擊上方「新增客戶」開始建立您的第一份規劃</p>
                        <button onClick={() => setIsAddModalOpen(true)} className="text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors">
                            + 立即新增
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredClients.map((client, idx) => (
                            <div 
                                key={client.id}
                                onClick={() => onSelectClient(client)}
                                className="group bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden"
                                style={{ animationDelay: `${idx * 50}ms` }} // Staggered animation
                            >
                                {/* Hover Effect Background */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                                <div className="relative z-10 flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        {/* Avatar with Gradient */}
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg bg-gradient-to-br ${
                                            ['from-blue-500 to-indigo-600', 'from-emerald-500 to-teal-600', 'from-orange-500 to-red-600', 'from-purple-500 to-pink-600'][idx % 4]
                                        }`}>
                                            {client.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                                                {client.name}
                                            </h3>
                                            <p className="text-xs text-slate-400 mt-0.5 font-medium">
                                                ID: {client.id.slice(0, 4)}...
                                            </p>
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={(e) => handleDeleteClient(e, client.id)}
                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="刪除"
                                        >
                                            <Trash2 size={18}/>
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="relative z-10">
                                    <div className="min-h-[3rem] text-sm text-slate-500 mb-4 bg-slate-50 rounded-lg p-2.5 line-clamp-2">
                                        {client.note || "暫無備註說明..."}
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                            <Calendar size={14}/>
                                            {client.updatedAt?.seconds 
                                                ? new Date(client.updatedAt.seconds * 1000).toLocaleDateString() 
                                                : '剛剛'}
                                        </div>
                                        <div className="flex items-center gap-1 text-sm font-bold text-slate-300 group-hover:text-blue-600 transition-colors">
                                            進入規劃 <ChevronRight size={16}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Client Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl space-y-6 relative overflow-hidden">
                        {/* Modal Header Decoration */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>

                        <div>
                            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2 mb-1">
                                <UserPlus className="text-blue-600" size={28}/> 新增客戶
                            </h3>
                            <p className="text-slate-500 text-sm">建立新的專屬規劃檔案</p>
                        </div>

                        <form onSubmit={handleAddClient} className="space-y-5">
                            <div>
                                <label className="text-sm font-bold text-slate-700 block mb-1.5 ml-1">客戶姓名</label>
                                <input 
                                    type="text" 
                                    required
                                    autoFocus
                                    placeholder="請輸入姓名"
                                    value={newClientName}
                                    onChange={e => setNewClientName(e.target.value)}
                                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-700 block mb-1.5 ml-1">備註 (選填)</label>
                                <textarea 
                                    placeholder="例如：35歲，科技業，有兩名子女..."
                                    value={newClientNote}
                                    onChange={e => setNewClientNote(e.target.value)}
                                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all h-28 resize-none text-slate-600"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 py-3.5 text-slate-600 font-bold bg-white border-2 border-slate-100 hover:bg-slate-50 rounded-xl transition-colors"
                                >
                                    取消
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-3.5 text-white font-bold bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-200 rounded-xl transition-all active:scale-95"
                                >
                                    建立檔案
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientDashboard;
