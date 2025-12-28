import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  FileEdit, 
  Trash2,
  Phone,
  MoreHorizontal,
  ChevronRight,
  Filter
} from 'lucide-react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import MarketWarRoom from './MarketWarRoom'; // [新增]

interface ClientDashboardProps {
  user: any;
  onSelectClient: (client: any) => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ user, onSelectClient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientNote, setNewClientNote] = useState('');

  // 監聽客戶列表
  React.useEffect(() => {
    if (!user) return;
    
    // 這裡使用 onSnapshot 即時監聽
    const { collection, onSnapshot, query, orderBy } = require('firebase/firestore');
    
    const q = query(
        collection(db, 'users', user.uid, 'clients'), 
        orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot: any) => {
        const clientList: any[] = [];
        querySnapshot.forEach((doc: any) => {
            clientList.push({ id: doc.id, ...doc.data() });
        });
        setClients(clientList);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 新增客戶
  const handleAddClient = async () => {
    if (!newClientName.trim()) return;
    try {
        const { collection, addDoc, Timestamp } = require('firebase/firestore');
        await addDoc(collection(db, 'users', user.uid, 'clients'), {
            name: newClientName,
            note: newClientNote,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            // 初始化空的工具數據
            goldenSafeData: {},
            giftData: {},
            estateData: {},
            // ...其他可選
        });
        setShowAddModal(false);
        setNewClientName('');
        setNewClientNote('');
    } catch (e) {
        console.error("Error adding client: ", e);
        alert("新增失敗");
    }
  };

  // 刪除客戶
  const handleDeleteClient = async (e: React.MouseEvent, clientId: string) => {
      e.stopPropagation(); // 避免觸發卡片點擊
      if (!window.confirm("確定要刪除此客戶檔案嗎？此動作無法復原。")) return;
      
      try {
          await deleteDoc(doc(db, 'users', user.uid, 'clients', clientId));
      } catch (e) {
          console.error("Error deleting client: ", e);
          alert("刪除失敗");
      }
  };

  const filteredClients = useMemo(() => {
      return clients.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.note && c.note.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  }, [clients, searchTerm]);

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
        
        {/* --- [新增] 戰情室區塊 --- */}
        <div className="bg-white border-b border-slate-200 pt-6 px-4 md:px-8 pb-8">
            <div className="max-w-5xl mx-auto">
                <MarketWarRoom userName={user.displayName || user.email?.split('@')[0] || "菁英顧問"} />
            </div>
        </div>

        {/* --- 客戶列表區塊 --- */}
        <div className="px-4 md:px-8 py-8 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Users className="text-blue-600"/> 我的客戶名單
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        共 {clients.length} 位客戶，最近更新：{clients[0]?.updatedAt?.toDate().toLocaleDateString() || '無'}
                    </p>
                </div>
                
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                        <input 
                          type="text" 
                          placeholder="搜尋姓名或備註..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                        />
                    </div>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
                    >
                        <Plus size={18}/> 新增
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-400">讀取中...</div>
            ) : filteredClients.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredClients.map(client => (
                        <div 
                          key={client.id}
                          onClick={() => onSelectClient(client)}
                          className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group relative"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-lg group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                        {client.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{client.name}</h3>
                                        <span className="text-xs text-slate-400">
                                            {client.updatedAt?.toDate().toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => handleDeleteClient(e, client.id)}
                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                            
                            <div className="text-sm text-slate-500 line-clamp-2 min-h-[2.5rem] mb-3">
                                {client.note || "無備註資料..."}
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                    點擊進入規劃
                                </span>
                                <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all"/>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                    <div className="inline-block p-4 bg-slate-50 rounded-full mb-4">
                        <Users size={40} className="text-slate-300"/>
                    </div>
                    <h3 className="text-lg font-bold text-slate-600">找不到相關客戶</h3>
                    <p className="text-slate-400 text-sm mt-1">試著調整搜尋關鍵字，或新增一位客戶吧！</p>
                </div>
            )}
        </div>

        {/* Add Client Modal */}
        {showAddModal && (
            <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Plus size={20} className="text-blue-600"/> 新增客戶
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">客戶姓名</label>
                            <input 
                                type="text" 
                                value={newClientName}
                                onChange={(e) => setNewClientName(e.target.value)}
                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="例如：王小明"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">備註 (選填)</label>
                            <textarea 
                                value={newClientNote}
                                onChange={(e) => setNewClientNote(e.target.value)}
                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none h-24 resize-none"
                                placeholder="例如：工程師，年收 150 萬，有房貸..."
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button 
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                取消
                            </button>
                            <button 
                                onClick={handleAddClient}
                                disabled={!newClientName.trim()}
                                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                建立檔案
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default ClientDashboard;