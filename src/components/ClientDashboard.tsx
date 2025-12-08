import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Trash2, 
  ChevronRight, 
  Calendar, 
  Edit3,
  User,
  Plus
} from 'lucide-react';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

// 預設的工具資料 (當建立新客戶時，初始化這些資料)
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
        
        // 讀取 users/{uid}/clients 子集合
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
                // 寫入預設工具資料，避免新客戶進去是空的壞掉
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
        e.stopPropagation(); // 避免觸發點擊卡片
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

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 animate-fade-in">
            <div className="max-w-5xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                            <Users className="text-blue-600" size={32}/> 
                            客戶檔案櫃
                        </h1>
                        <p className="text-slate-500 mt-1">管理您的客戶名單，追蹤每一份規劃建議。</p>
                    </div>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                    >
                        <UserPlus size={20}/> 新增客戶
                    </button>
                </div>

                {/* Search Bar */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3 sticky top-4 z-10">
                    <Search className="text-slate-400" size={20}/>
                    <input 
                        type="text" 
                        placeholder="搜尋客戶姓名或備註..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                    />
                </div>

                {/* Client List Grid */}
                {loading ? (
                    <div className="text-center py-12 text-slate-400">讀取中...</div>
                ) : filteredClients.length === 0 ? (
                    <div className="text-center py-16 bg-slate-100 rounded-3xl border-2 border-dashed border-slate-300">
                        <Users className="mx-auto text-slate-300 mb-3" size={48}/>
                        <p className="text-slate-500 font-bold text-lg">目前沒有客戶資料</p>
                        <p className="text-slate-400 text-sm mb-6">點擊右上角「新增客戶」開始您的第一份規劃</p>
                        <button onClick={() => setIsAddModalOpen(true)} className="text-blue-600 font-bold hover:underline">
                            + 立即新增
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredClients.map((client) => (
                            <div 
                                key={client.id}
                                onClick={() => onSelectClient(client)}
                                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group relative overflow-hidden"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        {client.name.charAt(0)}
                                    </div>
                                    <button 
                                        onClick={(e) => handleDeleteClient(e, client.id)}
                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                        title="刪除客戶"
                                    >
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                                
                                <h3 className="font-bold text-xl text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                                    {client.name}
                                </h3>
                                
                                <p className="text-sm text-slate-500 line-clamp-2 h-10 mb-4">
                                    {client.note || "無備註資料"}
                                </p>

                                <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={12}/>
                                        {client.updatedAt?.seconds 
                                            ? new Date(client.updatedAt.seconds * 1000).toLocaleDateString() 
                                            : '剛剛'}
                                    </div>
                                    <div className="flex items-center gap-1 font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                        進入規劃 <ChevronRight size={12}/>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Client Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <UserPlus className="text-blue-600"/> 新增客戶檔案
                        </h3>
                        <form onSubmit={handleAddClient} className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-slate-600 block mb-1">客戶姓名</label>
                                <input 
                                    type="text" 
                                    required
                                    autoFocus
                                    placeholder="例如：陳大明"
                                    value={newClientName}
                                    onChange={e => setNewClientName(e.target.value)}
                                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-600 block mb-1">備註 (選填)</label>
                                <textarea 
                                    placeholder="例如：30歲工程師，想規劃退休..."
                                    value={newClientNote}
                                    onChange={e => setNewClientNote(e.target.value)}
                                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 py-3 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                                >
                                    取消
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-3 text-white font-bold bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
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
