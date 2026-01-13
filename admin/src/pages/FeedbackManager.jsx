import React, { useState, useEffect } from 'react';
import {
  collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  Lightbulb, Loader2, Trash2, Check, Clock, CheckCircle, XCircle,
  AlertCircle, RefreshCw, User, Calendar, MessageSquare
} from 'lucide-react';

// 狀態配置
const STATUS_CONFIG = {
  pending: { label: '待審核', color: 'amber', icon: Clock },
  reviewed: { label: '已審核', color: 'blue', icon: CheckCircle },
  implemented: { label: '已實作', color: 'emerald', icon: Check },
  rejected: { label: '已拒絕', color: 'red', icon: XCircle },
};

// ==========================================
// 主組件
// ==========================================
export default function FeedbackManager() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, reviewed, implemented, rejected

  // 即時監聽建議
  useEffect(() => {
    const q = query(
      collection(db, 'feedbacks'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setFeedbacks(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 更新狀態
  const updateStatus = async (feedbackId, newStatus) => {
    try {
      await updateDoc(doc(db, 'feedbacks', feedbackId), {
        status: newStatus,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Update status failed:', error);
      alert('更新失敗');
    }
  };

  // 刪除建議
  const deleteFeedback = async (feedbackId) => {
    if (!window.confirm('確定要刪除這則建議？')) return;
    try {
      await deleteDoc(doc(db, 'feedbacks', feedbackId));
    } catch (error) {
      console.error('Delete failed:', error);
      alert('刪除失敗');
    }
  };

  // 篩選後的建議
  const filteredFeedbacks = filter === 'all'
    ? feedbacks
    : feedbacks.filter(f => f.status === filter);

  // 統計數據
  const stats = {
    total: feedbacks.length,
    pending: feedbacks.filter(f => f.status === 'pending').length,
    reviewed: feedbacks.filter(f => f.status === 'reviewed').length,
    implemented: feedbacks.filter(f => f.status === 'implemented').length,
    rejected: feedbacks.filter(f => f.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <span className="ml-2 text-gray-600">載入中...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* 標題區 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Lightbulb className="text-emerald-500" size={32} />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">建議管理</h1>
            <p className="text-gray-500 text-sm">管理用戶提交的功能建議</p>
          </div>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatCard
          label="全部"
          count={stats.total}
          color="gray"
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        />
        <StatCard
          label="待審核"
          count={stats.pending}
          color="amber"
          active={filter === 'pending'}
          onClick={() => setFilter('pending')}
        />
        <StatCard
          label="已審核"
          count={stats.reviewed}
          color="blue"
          active={filter === 'reviewed'}
          onClick={() => setFilter('reviewed')}
        />
        <StatCard
          label="已實作"
          count={stats.implemented}
          color="emerald"
          active={filter === 'implemented'}
          onClick={() => setFilter('implemented')}
        />
        <StatCard
          label="已拒絕"
          count={stats.rejected}
          color="red"
          active={filter === 'rejected'}
          onClick={() => setFilter('rejected')}
        />
      </div>

      {/* 建議列表 */}
      <div className="space-y-4">
        {filteredFeedbacks.length > 0 ? (
          filteredFeedbacks.map(feedback => (
            <FeedbackCard
              key={feedback.id}
              feedback={feedback}
              onUpdateStatus={updateStatus}
              onDelete={deleteFeedback}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <MessageSquare size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">目前沒有建議</p>
          </div>
        )}
      </div>

      {/* 底部間距 */}
      <div className="h-20"></div>
    </div>
  );
}

// ==========================================
// 統計卡片
// ==========================================
const StatCard = ({ label, count, color, active, onClick }) => {
  const colorClasses = {
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    red: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border-2 transition-all ${
        active
          ? `${colorClasses[color]} ring-2 ring-offset-2 ring-${color}-400`
          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
      }`}
    >
      <div className="text-2xl font-bold">{count}</div>
      <div className="text-sm">{label}</div>
    </button>
  );
};

// ==========================================
// 建議卡片
// ==========================================
const FeedbackCard = ({ feedback, onUpdateStatus, onDelete }) => {
  const status = STATUS_CONFIG[feedback.status] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;

  const colorClasses = {
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-red-700',
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <User className="text-emerald-600" size={20} />
          </div>
          <div>
            <p className="font-bold text-gray-800">{feedback.userName || '匿名用戶'}</p>
            <p className="text-xs text-gray-500">{feedback.userEmail}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${colorClasses[status.color]}`}>
            <StatusIcon size={12} />
            {status.label}
          </span>
          <button
            onClick={() => onDelete(feedback.id)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title="刪除"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <p className="text-gray-700 whitespace-pre-wrap">{feedback.content}</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar size={14} />
          {feedback.createdAt?.toDate?.().toLocaleString('zh-TW') || '未知時間'}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 mr-2">變更狀態：</span>
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <button
              key={key}
              onClick={() => onUpdateStatus(feedback.id, key)}
              disabled={feedback.status === key}
              className={`p-1.5 rounded-lg transition-all ${
                feedback.status === key
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title={config.label}
            >
              <config.icon size={16} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
