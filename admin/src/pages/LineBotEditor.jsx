/**
 * LINE Bot 發言內容管理
 * 管理 LINE Bot 的各種自動回覆和推播內容
 */

import React, { useState, useEffect } from 'react';
import {
  doc, getDoc, setDoc, Timestamp, collection, getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  MessageCircle, Save, Loader2, Plus, Trash2, Eye, Copy,
  ToggleLeft, ToggleRight, HelpCircle, AlertCircle, Check,
  Bell, Users, Clock, Zap, Gift, Star, Send, RefreshCw
} from 'lucide-react';

// ==========================================
// 組件：開關
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
// 組件：輸入欄位
// ==========================================
const InputField = ({ label, value, onChange, placeholder, type = 'text', rows, hint, required }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {rows ? (
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2
                 focus:ring-blue-500 focus:border-transparent outline-none resize-none
                 font-mono text-sm"
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
// 組件：選擇欄位
// ==========================================
const SelectField = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2
               focus:ring-blue-500 focus:border-transparent outline-none bg-white"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

// ==========================================
// 組件：卡片容器
// ==========================================
const Card = ({ title, icon: Icon, children, color = 'blue', badge }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div className={`bg-${color}-50 border-b border-${color}-100 px-6 py-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-${color}-100 rounded-xl flex items-center justify-center`}>
            <Icon className={`text-${color}-600`} size={20} />
          </div>
          <h3 className="font-bold text-gray-800">{title}</h3>
        </div>
        {badge && (
          <span className={`px-3 py-1 bg-${color}-100 text-${color}-700 text-xs font-bold rounded-full`}>
            {badge}
          </span>
        )}
      </div>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

// ==========================================
// 組件：訊息預覽
// ==========================================
const MessagePreview = ({ message, type = 'text' }) => (
  <div className="bg-gray-100 rounded-2xl p-4">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
        <MessageCircle size={16} className="text-white" />
      </div>
      <span className="text-sm font-bold text-gray-600">LINE Bot</span>
    </div>
    <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm max-w-xs">
      <p className="text-sm whitespace-pre-wrap">{message || '（尚無內容）'}</p>
    </div>
  </div>
);

// ==========================================
// 主組件
// ==========================================
export default function LineBotEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('welcome'); // welcome, keywords, broadcast, settings

  // 🆕 預設值（與 Cloud Functions 一致）
  const DEFAULT_WELCOME = {
    newFollower: '🎉 歡迎加入 Ultra Advisor！\n\n我是你的專屬 AI 財務軍師\n━━━━━━━━━━━━━━\n\n💎 立即獲得 7 天免費試用\n✓ 18 種專業理財工具\n✓ 無限客戶檔案\n✓ AI 智能建議\n\n🎁 推薦好友付費後雙方各得 500 UA 點！\n\n━━━━━━━━━━━━━━\n\n📧 請直接傳送你的 Email 開始試用！',
    newFollowerEnabled: true,
    memberLinked: '🎉 綁定成功！\n\n{{name}} 您好，您的帳號已成功綁定。\n\n現在您可以透過 LINE 接收：\n✅ 會員到期提醒\n✅ 最新功能通知\n✅ 專屬優惠資訊',
    memberLinkedEnabled: true,
    // 🆕 Email 收到訊息
    emailReceived: '📧 收到您的 Email！\n\n正在為您建立試用帳號...\n請稍候約 10 秒 ⏳',
    emailReceivedEnabled: true,
    // 🆕 開通成功訊息（Flex Message 的各部分）
    accountCreatedTitle: '🎉 帳號開通成功',
    accountCreatedEnabled: true,
    // 🆕 密碼訊息
    passwordMessage: '🔐 你的登入密碼（請妥善保管）：\n\n{{password}}\n\n⚠️ 請立即登入並修改密碼以確保安全\n\n📢 分享你的推薦碼「{{referralCode}}」給朋友，付費後雙方都能獲得 500 UA 點！',
    passwordMessageEnabled: true,
  };

  const DEFAULT_NOTIFICATIONS = {
    expiryReminder7Days: '⏰ 會員即將到期提醒\n\n{{name}} 您好，\n您的會員資格將在 7 天後到期。\n\n立即續費可享優惠價格！\n👉 https://ultra-advisor.tw/pricing',
    expiryReminder7DaysEnabled: true,
    expiryReminder1Day: '🚨 會員明天到期！\n\n{{name}} 您好，\n您的會員資格將在明天到期。\n\n到期後將無法使用進階工具，請盡快續費！\n👉 https://ultra-advisor.tw/pricing',
    expiryReminder1DayEnabled: true,
    paymentSuccess: '🎉 付款成功！\n\n{{name}} 您好，\n感謝您的支持！您的會員資格已延長。\n\n新到期日：{{expiryDate}}\n\n祝您使用愉快！',
    paymentSuccessEnabled: true,
    dailyTip: '',
    dailyTipEnabled: false,
  };

  // 歡迎訊息
  const [welcomeMessages, setWelcomeMessages] = useState(DEFAULT_WELCOME);

  // 關鍵字回覆
  const [keywordReplies, setKeywordReplies] = useState([]);

  // 推播內容模板
  const [broadcastTemplates, setBroadcastTemplates] = useState([]);

  // 通知設定
  const [notificationSettings, setNotificationSettings] = useState(DEFAULT_NOTIFICATIONS);

  // 載入資料
  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        // 載入歡迎訊息
        const welcomeDoc = await getDoc(doc(db, 'lineBotContent', 'welcome'));
        if (welcomeDoc.exists()) {
          setWelcomeMessages(prev => ({ ...prev, ...welcomeDoc.data() }));
        }

        // 載入關鍵字回覆
        const keywordsDoc = await getDoc(doc(db, 'lineBotContent', 'keywords'));
        if (keywordsDoc.exists()) {
          setKeywordReplies(keywordsDoc.data().items || []);
        }

        // 載入推播模板
        const broadcastDoc = await getDoc(doc(db, 'lineBotContent', 'broadcast'));
        if (broadcastDoc.exists()) {
          setBroadcastTemplates(broadcastDoc.data().templates || []);
        }

        // 載入通知設定
        const notificationsDoc = await getDoc(doc(db, 'lineBotContent', 'notifications'));
        if (notificationsDoc.exists()) {
          setNotificationSettings(prev => ({ ...prev, ...notificationsDoc.data() }));
        }

      } catch (error) {
        console.error('載入失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  // 儲存所有資料
  const handleSaveAll = async () => {
    setSaving(true);
    setSaveMessage(null);

    try {
      const timestamp = Timestamp.now();

      await Promise.all([
        setDoc(doc(db, 'lineBotContent', 'welcome'), { ...welcomeMessages, updatedAt: timestamp }),
        setDoc(doc(db, 'lineBotContent', 'keywords'), { items: keywordReplies, updatedAt: timestamp }),
        setDoc(doc(db, 'lineBotContent', 'broadcast'), { templates: broadcastTemplates, updatedAt: timestamp }),
        setDoc(doc(db, 'lineBotContent', 'notifications'), { ...notificationSettings, updatedAt: timestamp }),
      ]);

      setSaveMessage({ type: 'success', text: '所有變更已儲存！' });
      setTimeout(() => setSaveMessage(null), 3000);

    } catch (error) {
      console.error('儲存失敗:', error);
      setSaveMessage({ type: 'error', text: '儲存失敗，請稍後再試' });
    } finally {
      setSaving(false);
    }
  };

  // 新增關鍵字回覆
  const addKeywordReply = () => {
    setKeywordReplies(prev => [...prev, {
      id: `kw-${Date.now()}`,
      keywords: [],
      reply: '',
      enabled: true,
      matchType: 'contains', // contains, exact, startsWith
    }]);
  };

  // 刪除關鍵字回覆
  const removeKeywordReply = (id) => {
    setKeywordReplies(prev => prev.filter(item => item.id !== id));
  };

  // 更新關鍵字回覆
  const updateKeywordReply = (id, field, value) => {
    setKeywordReplies(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // 新增推播模板
  const addBroadcastTemplate = () => {
    setBroadcastTemplates(prev => [...prev, {
      id: `bc-${Date.now()}`,
      name: '新模板',
      content: '',
      targetAudience: 'all', // all, paid, trial, expired
      enabled: true,
    }]);
  };

  // 刪除推播模板
  const removeBroadcastTemplate = (id) => {
    setBroadcastTemplates(prev => prev.filter(item => item.id !== id));
  };

  // 更新推播模板
  const updateBroadcastTemplate = (id, field, value) => {
    setBroadcastTemplates(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Tab 按鈕
  const TabButton = ({ active, icon: Icon, label, onClick, count }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all
        ${active
          ? 'bg-emerald-600 text-white shadow-lg'
          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
        }`}
    >
      <Icon size={18} />
      {label}
      {count !== undefined && (
        <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
          active ? 'bg-emerald-500' : 'bg-gray-200'
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-emerald-600 mx-auto mb-3" size={40} />
          <p className="text-gray-600 font-medium">載入 LINE Bot 設定...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部工具列 */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl
                           flex items-center justify-center">
              <MessageCircle className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">LINE Bot 內容管理</h1>
              <p className="text-xs text-gray-500">設定 LINE Bot 的自動回覆和推播內容</p>
            </div>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700
                     text-white rounded-xl font-bold transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            {saving ? '儲存中...' : '儲存全部'}
          </button>
        </div>

        {/* 儲存訊息 */}
        {saveMessage && (
          <div className={`px-4 py-2 text-center text-sm font-medium ${
            saveMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-red-50 text-red-700'
          }`}>
            {saveMessage.type === 'success' ? '✅' : '❌'} {saveMessage.text}
          </div>
        )}
      </div>

      {/* 分頁導航 */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-3 mb-6">
          <TabButton
            active={activeTab === 'welcome'}
            icon={Users}
            label="歡迎訊息"
            onClick={() => setActiveTab('welcome')}
          />
          <TabButton
            active={activeTab === 'keywords'}
            icon={MessageCircle}
            label="關鍵字回覆"
            onClick={() => setActiveTab('keywords')}
            count={keywordReplies.length}
          />
          <TabButton
            active={activeTab === 'broadcast'}
            icon={Send}
            label="推播模板"
            onClick={() => setActiveTab('broadcast')}
            count={broadcastTemplates.length}
          />
          <TabButton
            active={activeTab === 'notifications'}
            icon={Bell}
            label="系統通知"
            onClick={() => setActiveTab('notifications')}
          />
        </div>

        {/* ==================== 歡迎訊息分頁 ==================== */}
        {activeTab === 'welcome' && (
          <div className="space-y-6">
            {/* 說明卡片 */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <HelpCircle className="text-emerald-500 flex-shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="font-bold text-emerald-800 mb-1">歡迎訊息說明</h4>
                  <p className="text-emerald-700 text-sm">
                    這些訊息會在用戶首次加入或綁定帳號時自動發送。
                    可使用變數：<code className="bg-emerald-100 px-1 rounded">{'{{name}}'}</code> 用戶名稱、
                    <code className="bg-emerald-100 px-1 rounded">{'{{email}}'}</code> 用戶 Email
                  </p>
                </div>
              </div>
            </div>

            {/* 新追蹤者歡迎訊息 */}
            <Card title="新追蹤者歡迎訊息" icon={Users} color="emerald">
              <div className="space-y-4">
                <Toggle
                  enabled={welcomeMessages.newFollowerEnabled}
                  onChange={(v) => setWelcomeMessages(prev => ({ ...prev, newFollowerEnabled: v }))}
                  label="啟用新追蹤者歡迎訊息"
                />

                {welcomeMessages.newFollowerEnabled && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <InputField
                      label="訊息內容"
                      value={welcomeMessages.newFollower}
                      onChange={(v) => setWelcomeMessages(prev => ({ ...prev, newFollower: v }))}
                      placeholder={`歡迎加入 Ultra Advisor！👋\n\n我是您的專屬助理，有任何問題都可以問我喔！\n\n💡 輸入「功能」查看所有服務`}
                      rows={6}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">預覽效果</p>
                      <MessagePreview message={welcomeMessages.newFollower} />
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* 會員綁定成功訊息 */}
            <Card title="會員綁定成功訊息" icon={Check} color="blue">
              <div className="space-y-4">
                <Toggle
                  enabled={welcomeMessages.memberLinkedEnabled}
                  onChange={(v) => setWelcomeMessages(prev => ({ ...prev, memberLinkedEnabled: v }))}
                  label="啟用綁定成功訊息"
                />

                {welcomeMessages.memberLinkedEnabled && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <InputField
                      label="訊息內容"
                      value={welcomeMessages.memberLinked}
                      onChange={(v) => setWelcomeMessages(prev => ({ ...prev, memberLinked: v }))}
                      placeholder={`🎉 綁定成功！\n\n{{name}} 您好，您的帳號已成功綁定。\n\n現在您可以透過 LINE 接收：\n✅ 會員到期提醒\n✅ 最新功能通知\n✅ 專屬優惠資訊`}
                      rows={6}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">預覽效果</p>
                      <MessagePreview message={welcomeMessages.memberLinked || `🎉 綁定成功！\n\n用戶 您好，您的帳號已成功綁定。`} />
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* 🆕 收到 Email 訊息 */}
            <Card title="收到 Email 回覆" icon={Clock} color="amber">
              <div className="space-y-4">
                <Toggle
                  enabled={welcomeMessages.emailReceivedEnabled}
                  onChange={(v) => setWelcomeMessages(prev => ({ ...prev, emailReceivedEnabled: v }))}
                  label="啟用收到 Email 回覆"
                />

                {welcomeMessages.emailReceivedEnabled && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <InputField
                      label="訊息內容"
                      value={welcomeMessages.emailReceived}
                      onChange={(v) => setWelcomeMessages(prev => ({ ...prev, emailReceived: v }))}
                      placeholder="📧 收到您的 Email！\n\n正在為您建立試用帳號...\n請稍候約 10 秒 ⏳"
                      rows={4}
                      hint="當用戶傳送 Email 後立即回覆的訊息"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">預覽效果</p>
                      <MessagePreview message={welcomeMessages.emailReceived || '📧 收到您的 Email！'} />
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* 🆕 帳號開通成功訊息 */}
            <Card title="帳號開通成功（密碼訊息）" icon={Zap} color="purple">
              <div className="space-y-4">
                <Toggle
                  enabled={welcomeMessages.passwordMessageEnabled}
                  onChange={(v) => setWelcomeMessages(prev => ({ ...prev, passwordMessageEnabled: v }))}
                  label="啟用密碼訊息"
                />

                {welcomeMessages.passwordMessageEnabled && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <InputField
                        label="密碼訊息內容"
                        value={welcomeMessages.passwordMessage}
                        onChange={(v) => setWelcomeMessages(prev => ({ ...prev, passwordMessage: v }))}
                        placeholder="🔐 你的登入密碼：\n\n{{password}}\n\n⚠️ 請立即登入並修改密碼"
                        rows={6}
                        hint="可用變數：{{password}} 密碼、{{referralCode}} 推薦碼、{{referrerName}} 推薦人"
                      />
                      <InputField
                        label="開通成功標題"
                        value={welcomeMessages.accountCreatedTitle}
                        onChange={(v) => setWelcomeMessages(prev => ({ ...prev, accountCreatedTitle: v }))}
                        placeholder="🎉 帳號開通成功"
                        hint="Flex Message 卡片的標題"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">預覽效果</p>
                      <MessagePreview message={welcomeMessages.passwordMessage?.replace('{{password}}', 'Ab1234xyz').replace('{{referralCode}}', 'USER-ABC1') || '🔐 你的登入密碼...'} />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* ==================== 關鍵字回覆分頁 ==================== */}
        {activeTab === 'keywords' && (
          <div className="space-y-6">
            {/* 說明卡片 */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <HelpCircle className="text-blue-500 flex-shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="font-bold text-blue-800 mb-1">關鍵字回覆說明</h4>
                  <p className="text-blue-700 text-sm">
                    當用戶訊息包含指定關鍵字時，LINE Bot 會自動回覆對應內容。
                    多個關鍵字用逗號分隔，例如：<code className="bg-blue-100 px-1 rounded">功能,服務,工具</code>
                  </p>
                </div>
              </div>
            </div>

            {/* 關鍵字列表 */}
            {keywordReplies.map((item, index) => (
              <Card
                key={item.id}
                title={`關鍵字回覆 ${index + 1}`}
                icon={MessageCircle}
                color="blue"
                badge={item.enabled ? '已啟用' : '已停用'}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Toggle
                      enabled={item.enabled}
                      onChange={(v) => updateKeywordReply(item.id, 'enabled', v)}
                    />
                    <button
                      onClick={() => removeKeywordReply(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <InputField
                        label="觸發關鍵字（逗號分隔）"
                        value={item.keywords?.join(', ') || ''}
                        onChange={(v) => updateKeywordReply(item.id, 'keywords', v.split(',').map(k => k.trim()).filter(k => k))}
                        placeholder="功能, 服務, 工具"
                        required
                      />

                      <SelectField
                        label="比對方式"
                        value={item.matchType}
                        onChange={(v) => updateKeywordReply(item.id, 'matchType', v)}
                        options={[
                          { value: 'contains', label: '包含關鍵字' },
                          { value: 'exact', label: '完全符合' },
                          { value: 'startsWith', label: '以關鍵字開頭' },
                        ]}
                      />

                      <InputField
                        label="回覆內容"
                        value={item.reply}
                        onChange={(v) => updateKeywordReply(item.id, 'reply', v)}
                        placeholder="您好！以下是我們提供的功能..."
                        rows={5}
                        required
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">預覽效果</p>
                      <MessagePreview message={item.reply} />
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {/* 新增按鈕 */}
            <button
              onClick={addKeywordReply}
              className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl
                       text-gray-500 hover:border-blue-400 hover:text-blue-500
                       flex items-center justify-center gap-2 transition-colors"
            >
              <Plus size={20} /> 新增關鍵字回覆
            </button>
          </div>
        )}

        {/* ==================== 推播模板分頁 ==================== */}
        {activeTab === 'broadcast' && (
          <div className="space-y-6">
            {/* 說明卡片 */}
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <HelpCircle className="text-purple-500 flex-shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="font-bold text-purple-800 mb-1">推播模板說明</h4>
                  <p className="text-purple-700 text-sm">
                    建立常用的推播訊息模板，方便日後快速發送。實際推播需要透過 LINE Official Account Manager 或 API 執行。
                  </p>
                </div>
              </div>
            </div>

            {/* 推播模板列表 */}
            {broadcastTemplates.map((item, index) => (
              <Card
                key={item.id}
                title={item.name || `推播模板 ${index + 1}`}
                icon={Send}
                color="purple"
                badge={item.targetAudience === 'all' ? '全部用戶' :
                       item.targetAudience === 'paid' ? '付費會員' :
                       item.targetAudience === 'trial' ? '試用會員' : '過期會員'}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Toggle
                      enabled={item.enabled}
                      onChange={(v) => updateBroadcastTemplate(item.id, 'enabled', v)}
                    />
                    <button
                      onClick={() => removeBroadcastTemplate(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <InputField
                        label="模板名稱"
                        value={item.name}
                        onChange={(v) => updateBroadcastTemplate(item.id, 'name', v)}
                        placeholder="新功能上線通知"
                        required
                      />

                      <SelectField
                        label="目標受眾"
                        value={item.targetAudience}
                        onChange={(v) => updateBroadcastTemplate(item.id, 'targetAudience', v)}
                        options={[
                          { value: 'all', label: '全部用戶' },
                          { value: 'paid', label: '僅付費會員' },
                          { value: 'trial', label: '僅試用會員' },
                          { value: 'expired', label: '僅過期會員' },
                        ]}
                      />

                      <InputField
                        label="推播內容"
                        value={item.content}
                        onChange={(v) => updateBroadcastTemplate(item.id, 'content', v)}
                        placeholder={`🎉 新功能上線！\n\n我們推出了全新的...`}
                        rows={6}
                        required
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">預覽效果</p>
                      <MessagePreview message={item.content} />

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item.content);
                        }}
                        className="mt-3 w-full py-2 bg-purple-100 hover:bg-purple-200
                                 text-purple-700 rounded-xl text-sm font-bold
                                 flex items-center justify-center gap-2 transition-colors"
                      >
                        <Copy size={16} /> 複製內容
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {/* 新增按鈕 */}
            <button
              onClick={addBroadcastTemplate}
              className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl
                       text-gray-500 hover:border-purple-400 hover:text-purple-500
                       flex items-center justify-center gap-2 transition-colors"
            >
              <Plus size={20} /> 新增推播模板
            </button>
          </div>
        )}

        {/* ==================== 系統通知分頁 ==================== */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            {/* 說明卡片 */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <HelpCircle className="text-amber-500 flex-shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="font-bold text-amber-800 mb-1">系統通知說明</h4>
                  <p className="text-amber-700 text-sm">
                    這些訊息會由系統自動觸發發送，例如會員即將到期時的提醒通知。
                    可使用變數：<code className="bg-amber-100 px-1 rounded">{'{{name}}'}</code>、
                    <code className="bg-amber-100 px-1 rounded">{'{{daysRemaining}}'}</code> 剩餘天數
                  </p>
                </div>
              </div>
            </div>

            {/* 7 天到期提醒 */}
            <Card title="7 天到期提醒" icon={Clock} color="amber">
              <div className="space-y-4">
                <Toggle
                  enabled={notificationSettings.expiryReminder7DaysEnabled}
                  onChange={(v) => setNotificationSettings(prev => ({ ...prev, expiryReminder7DaysEnabled: v }))}
                  label="啟用 7 天到期提醒"
                />

                {notificationSettings.expiryReminder7DaysEnabled && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <InputField
                      label="訊息內容"
                      value={notificationSettings.expiryReminder7Days}
                      onChange={(v) => setNotificationSettings(prev => ({ ...prev, expiryReminder7Days: v }))}
                      placeholder={`⏰ 會員即將到期提醒\n\n{{name}} 您好，\n您的會員資格將在 7 天後到期。\n\n立即續費可享優惠價格！\n👉 https://ultra-advisor.tw/pricing`}
                      rows={6}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">預覽效果</p>
                      <MessagePreview message={notificationSettings.expiryReminder7Days || `⏰ 會員即將到期提醒\n\n用戶 您好，您的會員資格將在 7 天後到期。`} />
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* 1 天到期提醒 */}
            <Card title="1 天到期提醒" icon={AlertCircle} color="red">
              <div className="space-y-4">
                <Toggle
                  enabled={notificationSettings.expiryReminder1DayEnabled}
                  onChange={(v) => setNotificationSettings(prev => ({ ...prev, expiryReminder1DayEnabled: v }))}
                  label="啟用 1 天到期提醒"
                />

                {notificationSettings.expiryReminder1DayEnabled && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <InputField
                      label="訊息內容"
                      value={notificationSettings.expiryReminder1Day}
                      onChange={(v) => setNotificationSettings(prev => ({ ...prev, expiryReminder1Day: v }))}
                      placeholder={`🚨 會員明天到期！\n\n{{name}} 您好，\n您的會員資格將在明天到期。\n\n到期後將無法使用進階工具，請盡快續費！\n👉 https://ultra-advisor.tw/pricing`}
                      rows={6}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">預覽效果</p>
                      <MessagePreview message={notificationSettings.expiryReminder1Day || `🚨 會員明天到期！\n\n用戶 您好，您的會員資格將在明天到期。`} />
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* 付款成功通知 */}
            <Card title="付款成功通知" icon={Check} color="emerald">
              <div className="space-y-4">
                <Toggle
                  enabled={notificationSettings.paymentSuccessEnabled}
                  onChange={(v) => setNotificationSettings(prev => ({ ...prev, paymentSuccessEnabled: v }))}
                  label="啟用付款成功通知"
                />

                {notificationSettings.paymentSuccessEnabled && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <InputField
                      label="訊息內容"
                      value={notificationSettings.paymentSuccess}
                      onChange={(v) => setNotificationSettings(prev => ({ ...prev, paymentSuccess: v }))}
                      placeholder={`🎉 付款成功！\n\n{{name}} 您好，\n感謝您的支持！您的會員資格已延長。\n\n新到期日：{{expiryDate}}\n\n祝您使用愉快！`}
                      rows={6}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">預覽效果</p>
                      <MessagePreview message={notificationSettings.paymentSuccess || `🎉 付款成功！\n\n用戶 您好，感謝您的支持！`} />
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* 每日小技巧 */}
            <Card title="每日小技巧（選填）" icon={Zap} color="blue">
              <div className="space-y-4">
                <Toggle
                  enabled={notificationSettings.dailyTipEnabled}
                  onChange={(v) => setNotificationSettings(prev => ({ ...prev, dailyTipEnabled: v }))}
                  label="啟用每日小技巧"
                />

                {notificationSettings.dailyTipEnabled && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <InputField
                      label="訊息內容"
                      value={notificationSettings.dailyTip}
                      onChange={(v) => setNotificationSettings(prev => ({ ...prev, dailyTip: v }))}
                      placeholder={`💡 今日小技巧\n\n使用「保險缺口分析」工具，只需 3 分鐘就能為客戶找出保障不足的地方！\n\n立即體驗 👉 https://ultra-advisor.tw`}
                      rows={6}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">預覽效果</p>
                      <MessagePreview message={notificationSettings.dailyTip || `💡 今日小技巧\n\n...`} />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* 底部間距 */}
      <div className="h-20"></div>
    </div>
  );
}
