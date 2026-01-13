import React, { useState, useEffect } from 'react';
import {
  doc, getDoc, setDoc, Timestamp, onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  Bell, Save, Loader2, Plus, Trash2, ToggleLeft, ToggleRight,
  AlertCircle, Check, GripVertical, Sparkles, Gift, Zap, Megaphone, History,
  ChevronDown, ChevronRight
} from 'lucide-react';

// ==========================================
// 開關組件
// ==========================================
const Toggle = ({ enabled, onChange, label }) => (
  <button
    onClick={() => onChange(!enabled)}
    className="flex items-center gap-2"
  >
    {enabled ? (
      <ToggleRight className="text-emerald-500" size={28} />
    ) : (
      <ToggleLeft className="text-gray-400" size={28} />
    )}
    <span className={`text-sm font-medium ${enabled ? 'text-emerald-600' : 'text-gray-500'}`}>
      {label || (enabled ? '已啟用' : '已停用')}
    </span>
  </button>
);

// ==========================================
// 輸入欄位組件
// ==========================================
const InputField = ({ label, value, onChange, placeholder, type = 'text', rows, hint }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {rows ? (
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2
                 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
      />
    ) : (
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2
                 focus:ring-blue-500 focus:border-transparent outline-none"
      />
    )}
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

// ==========================================
// 卡片組件
// ==========================================
const Card = ({ title, icon: Icon, color = 'blue', children }) => {
  const colorClasses = {
    blue: 'from-blue-50 to-indigo-50 border-blue-200',
    amber: 'from-amber-50 to-orange-50 border-amber-200',
    emerald: 'from-emerald-50 to-teal-50 border-emerald-200',
    purple: 'from-purple-50 to-pink-50 border-purple-200',
    red: 'from-red-50 to-rose-50 border-red-200',
  };

  const iconColors = {
    blue: 'text-blue-600',
    amber: 'text-amber-600',
    emerald: 'text-emerald-600',
    purple: 'text-purple-600',
    red: 'text-red-600',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-2xl p-6`}>
      <div className="flex items-center gap-3 mb-4">
        <Icon className={iconColors[color]} size={24} />
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  );
};

// ==========================================
// 主組件
// ==========================================
export default function NotificationsEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  // 通知列表
  const [notifications, setNotifications] = useState([]);
  // 展開的通知 ID 列表
  const [expandedIds, setExpandedIds] = useState([]);

  // 即時監聽資料
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(
      doc(db, 'siteContent', 'notifications'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          // 按優先級排序（與客戶端一致）
          const items = (data.items || []).sort((a, b) => (b.priority || 0) - (a.priority || 0));
          setNotifications(items);
        }
        setLoading(false);
      },
      (error) => {
        console.error('載入失敗:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 儲存
  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      await setDoc(doc(db, 'siteContent', 'notifications'), {
        items: notifications,
        updatedAt: Timestamp.now()
      });
      setSaveMessage({ type: 'success', text: '儲存成功！' });
    } catch (error) {
      console.error('儲存失敗:', error);
      setSaveMessage({ type: 'error', text: '儲存失敗，請重試' });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  // 新增通知
  const addNotification = () => {
    const newNotif = {
      id: `notif_${Date.now()}`,
      title: '',
      content: '',
      priority: 50,
      enabled: true,
      createdAt: new Date().toISOString()
    };
    setNotifications([newNotif, ...notifications]);
  };

  // 更新通知
  const updateNotification = (index, field, value) => {
    const updated = [...notifications];
    updated[index] = { ...updated[index], [field]: value };
    setNotifications(updated);
  };

  // 刪除通知
  const deleteNotification = (index) => {
    if (window.confirm('確定要刪除這則通知？')) {
      const updated = [...notifications];
      updated.splice(index, 1);
      setNotifications(updated);
    }
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
    <div className="max-w-4xl mx-auto">
      {/* 標題區 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Bell className="text-amber-500" size={32} />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">通知管理</h1>
            <p className="text-gray-500 text-sm">發布系統通知給所有用戶</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700
                   text-white rounded-xl font-bold transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          儲存變更
        </button>
      </div>

      {/* 儲存訊息 */}
      {saveMessage && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-2 ${
          saveMessage.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {saveMessage.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
          {saveMessage.text}
        </div>
      )}

      {/* 說明卡片 */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
        <div className="flex items-start gap-3">
          <Sparkles className="text-blue-600 flex-shrink-0 mt-1" size={20} />
          <div>
            <h4 className="font-bold text-blue-800 mb-1">通知系統說明</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• 通知會顯示在戰情室右上角的鈴鐺圖示中</li>
              <li>• 新通知會有未讀紅點提示</li>
              <li>• 優先級數字越大，排序越前面（建議 1-100）</li>
              <li>• 停用的通知不會顯示給用戶</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 新增按鈕 */}
      <div className="mb-6">
        <button
          onClick={addNotification}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700
                   text-white rounded-xl font-bold transition-all"
        >
          <Plus size={18} />
          新增通知
        </button>
      </div>

      {/* 顯示中的通知（前 3 則啟用的） */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
          <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
          顯示中的通知（客戶端顯示前 3 則）
        </h3>
        <div className="space-y-4">
          {notifications.filter(n => n.enabled !== false).slice(0, 3).length > 0 ? (
            notifications.filter(n => n.enabled !== false).slice(0, 3).map((notif) => {
              const index = notifications.findIndex(n => n.id === notif.id);
              return (
                <Card key={notif.id} title={notif.title || '新通知'} icon={Bell} color="emerald">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Toggle
                        enabled={notif.enabled}
                        onChange={(v) => updateNotification(index, 'enabled', v)}
                        label="啟用此通知"
                      />
                      <button
                        onClick={() => deleteNotification(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="刪除"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <InputField
                        label="通知標題"
                        value={notif.title}
                        onChange={(v) => updateNotification(index, 'title', v)}
                        placeholder="例如：新功能上線"
                      />
                      <InputField
                        label="優先級"
                        type="number"
                        value={notif.priority}
                        onChange={(v) => updateNotification(index, 'priority', parseInt(v) || 0)}
                        placeholder="1-100"
                        hint="數字越大越前面"
                      />
                    </div>

                    <InputField
                      label="通知內容"
                      value={notif.content}
                      onChange={(v) => updateNotification(index, 'content', v)}
                      placeholder="通知的詳細內容..."
                      rows={3}
                    />

                    {notif.createdAt && (
                      <p className="text-xs text-gray-400">
                        建立時間：{new Date(notif.createdAt).toLocaleString('zh-TW')}
                      </p>
                    )}
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <Bell size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm">目前沒有顯示中的通知</p>
            </div>
          )}
        </div>
      </div>

      {/* 所有通知紀錄 */}
      <div>
        <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
          <History size={20} className="text-gray-400" />
          所有通知紀錄（共 {notifications.length} 則）
        </h3>
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <Bell size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm">沒有通知紀錄</p>
            </div>
          ) : (
            notifications.map((notif, index) => {
              // 判斷這則通知是否在客戶端顯示中
              const enabledNotifs = notifications.filter(n => n.enabled !== false);
              const isDisplayed = notif.enabled !== false && enabledNotifs.slice(0, 3).some(n => n.id === notif.id);
              const isExpanded = expandedIds.includes(notif.id);

              const toggleExpand = () => {
                setExpandedIds(prev =>
                  prev.includes(notif.id)
                    ? prev.filter(id => id !== notif.id)
                    : [...prev, notif.id]
                );
              };

              return (
                <div
                  key={notif.id}
                  className={`bg-white border rounded-2xl overflow-hidden ${
                    isDisplayed ? 'border-emerald-300 bg-emerald-50/30' : 'border-gray-200'
                  }`}
                >
                  {/* 標題列（可點擊展開） */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-all"
                    onClick={toggleExpand}
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown size={18} className="text-gray-400" />
                      ) : (
                        <ChevronRight size={18} className="text-gray-400" />
                      )}
                      <Bell size={18} className={isDisplayed ? 'text-emerald-500' : 'text-gray-400'} />
                      <h4 className="font-bold text-gray-800">{notif.title || '新通知'}</h4>
                      {isDisplayed && (
                        <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded">顯示中</span>
                      )}
                      {notif.enabled === false && (
                        <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">已停用</span>
                      )}
                      {notif.enabled !== false && !isDisplayed && (
                        <span className="text-xs text-amber-500 bg-amber-50 px-2 py-1 rounded">排序較後</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      {notif.createdAt && (
                        <span>{new Date(notif.createdAt).toLocaleDateString('zh-TW')}</span>
                      )}
                    </div>
                  </div>

                  {/* 展開內容 */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                      <div className="pt-4 space-y-3">
                        <p className="text-gray-600 text-sm whitespace-pre-wrap bg-gray-50 rounded-lg p-3">
                          {notif.content || '（無內容）'}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span>優先級：{notif.priority || 0}</span>
                            {notif.createdAt && (
                              <span>建立：{new Date(notif.createdAt).toLocaleString('zh-TW')}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Toggle
                              enabled={notif.enabled}
                              onChange={(v) => updateNotification(index, 'enabled', v)}
                            />
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteNotification(index); }}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="刪除"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 底部間距 */}
      <div className="h-20"></div>
    </div>
  );
}
