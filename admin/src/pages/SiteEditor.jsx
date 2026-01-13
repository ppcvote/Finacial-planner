import React, { useState, useEffect } from 'react';
import {
  doc, getDoc, setDoc, Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  Globe, Save, Loader2, Eye, Plus, Trash2, GripVertical,
  Video, Image, Type, Link, ToggleLeft, ToggleRight,
  ChevronDown, ChevronUp, Settings, Megaphone, HelpCircle,
  DollarSign, Sparkles, Mail, MessageCircle, Check, AlertCircle,
  Zap, FileText, Cloud, Target, LayoutDashboard, ShieldCheck,
  Activity, History, Gift, Building, GraduationCap, Rocket,
  Waves, Car, Umbrella, Landmark, Play, ExternalLink, Bell,
  Home, LogIn, Monitor, Smartphone
} from 'lucide-react';

// 圖示對應表
const iconMap = {
  Zap, FileText, Cloud, Target, LayoutDashboard, ShieldCheck,
  Activity, History, Gift, Building, GraduationCap, Rocket,
  Waves, Car, Umbrella, Landmark, Globe, Sparkles, DollarSign,
  HelpCircle, Mail, MessageCircle, Megaphone, Settings, Bell
};

// ==========================================
// 分頁按鈕組件
// ==========================================
const TabButton = ({ active, icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all
      ${active
        ? 'bg-blue-600 text-white shadow-lg'
        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
      }`}
  >
    <Icon size={18} />
    {label}
  </button>
);

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
// 選擇欄位組件
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
// 卡片容器組件
// ==========================================
const Card = ({ title, icon: Icon, children, color = 'blue' }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div className={`bg-${color}-50 border-b border-${color}-100 px-6 py-4`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 bg-${color}-100 rounded-xl flex items-center justify-center`}>
          <Icon className={`text-${color}-600`} size={20} />
        </div>
        <h3 className="font-bold text-gray-800">{title}</h3>
      </div>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

// ==========================================
// 影片位置預覽組件
// ==========================================
const VideoLocationPreview = ({ location, videoType, videoUrl }) => {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-300">
      <div className="flex items-center gap-2 mb-2">
        <Monitor className="text-blue-500" size={18} />
        <span className="font-bold text-gray-700">顯示位置預覽</span>
      </div>

      {/* 模擬官網畫面 */}
      <div className="bg-slate-900 rounded-lg overflow-hidden p-4">
        {/* 模擬 Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded"></div>
            <span className="text-white text-xs font-bold">UltraAdvisor</span>
          </div>
          <div className="flex gap-2">
            <div className="w-12 h-2 bg-slate-700 rounded"></div>
            <div className="w-12 h-2 bg-slate-700 rounded"></div>
          </div>
        </div>

        {/* 模擬 Hero 區 */}
        <div className="text-center py-4">
          <div className="w-32 h-2 bg-slate-600 rounded mx-auto mb-2"></div>
          <div className="w-48 h-3 bg-slate-500 rounded mx-auto mb-4"></div>

          {/* 這是按鈕位置 */}
          <div className="flex justify-center gap-2 mb-3">
            <div className="px-3 py-1.5 bg-blue-600 rounded text-[8px] text-white">免費試用</div>
            <div className="px-3 py-1.5 border border-blue-400 rounded text-[8px] text-blue-300 flex items-center gap-1">
              <Play size={8} />
              觀看示範 ← 點這裡會播放影片
            </div>
          </div>
        </div>
      </div>

      {/* 狀態顯示 */}
      <div className="mt-3 p-3 rounded-lg bg-white border">
        {videoType !== 'none' && videoUrl ? (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <span className="text-emerald-700 text-sm font-bold">已設定影片</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <span className="text-gray-500 text-sm">尚未設定（按鈕會顯示為半透明）</span>
          </div>
        )}
        {videoUrl && (
          <p className="text-gray-400 text-[10px] mt-1 truncate">{videoUrl}</p>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 主組件
// ==========================================
export default function SiteEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('videos'); // videos, announcements, content, contact

  // 各區塊資料狀態
  const [hero, setHero] = useState({
    title: '',
    subtitle: '',
    videoUrl: '',
    videoType: 'none',
    htmlVideoUrl: '',
    ctaText: '',
    ctaLink: '',
    enabled: true
  });

  const [features, setFeatures] = useState({
    sectionTitle: '',
    items: [],
    enabled: true
  });

  const [pricing, setPricing] = useState({
    sectionTitle: '',
    plans: [],
    enabled: true
  });

  const [faq, setFaq] = useState({
    sectionTitle: '',
    items: [],
    enabled: true
  });

  const [contact, setContact] = useState({
    email: '',
    lineId: '',
    lineUrl: '',
    phone: '',
    enabled: true
  });

  // 官網公告
  const [announcement, setAnnouncement] = useState({
    enabled: false,
    type: 'info',
    message: '',
    link: '',
    linkText: ''
  });

  // 🆕 登入頁公告列表
  const [loginAnnouncements, setLoginAnnouncements] = useState([]);

  // 載入資料
  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        // 載入 Hero
        const heroDoc = await getDoc(doc(db, 'siteContent', 'hero'));
        if (heroDoc.exists()) setHero(prev => ({ ...prev, ...heroDoc.data() }));

        // 載入 Features
        const featuresDoc = await getDoc(doc(db, 'siteContent', 'features'));
        if (featuresDoc.exists()) setFeatures(prev => ({ ...prev, ...featuresDoc.data() }));

        // 載入 Pricing
        const pricingDoc = await getDoc(doc(db, 'siteContent', 'pricing'));
        if (pricingDoc.exists()) setPricing(prev => ({ ...prev, ...pricingDoc.data() }));

        // 載入 FAQ
        const faqDoc = await getDoc(doc(db, 'siteContent', 'faq'));
        if (faqDoc.exists()) setFaq(prev => ({ ...prev, ...faqDoc.data() }));

        // 載入 Contact
        const contactDoc = await getDoc(doc(db, 'siteContent', 'contact'));
        if (contactDoc.exists()) setContact(prev => ({ ...prev, ...contactDoc.data() }));

        // 載入官網 Announcement
        const announcementDoc = await getDoc(doc(db, 'siteContent', 'announcement'));
        if (announcementDoc.exists()) setAnnouncement(prev => ({ ...prev, ...announcementDoc.data() }));

        // 🆕 載入登入頁 Announcements
        const loginAnnouncementsDoc = await getDoc(doc(db, 'siteContent', 'loginAnnouncements'));
        if (loginAnnouncementsDoc.exists()) {
          setLoginAnnouncements(loginAnnouncementsDoc.data().items || []);
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
        setDoc(doc(db, 'siteContent', 'hero'), { ...hero, updatedAt: timestamp }),
        setDoc(doc(db, 'siteContent', 'features'), { ...features, updatedAt: timestamp }),
        setDoc(doc(db, 'siteContent', 'pricing'), { ...pricing, updatedAt: timestamp }),
        setDoc(doc(db, 'siteContent', 'faq'), { ...faq, updatedAt: timestamp }),
        setDoc(doc(db, 'siteContent', 'contact'), { ...contact, updatedAt: timestamp }),
        setDoc(doc(db, 'siteContent', 'announcement'), { ...announcement, updatedAt: timestamp }),
        setDoc(doc(db, 'siteContent', 'loginAnnouncements'), { items: loginAnnouncements, updatedAt: timestamp }),
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

  // 新增功能項目
  const addFeatureItem = () => {
    setFeatures(prev => ({
      ...prev,
      items: [...prev.items, {
        id: `feature-${Date.now()}`,
        icon: 'Zap',
        title: '新功能',
        description: '功能描述',
        color: 'blue'
      }]
    }));
  };

  // 刪除功能項目
  const removeFeatureItem = (id) => {
    setFeatures(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  // 更新功能項目
  const updateFeatureItem = (id, field, value) => {
    setFeatures(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  // 新增 FAQ 項目
  const addFaqItem = () => {
    setFaq(prev => ({
      ...prev,
      items: [...prev.items, {
        id: `faq-${Date.now()}`,
        question: '新問題',
        answer: '答案'
      }]
    }));
  };

  // 刪除 FAQ 項目
  const removeFaqItem = (id) => {
    setFaq(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  // 更新 FAQ 項目
  const updateFaqItem = (id, field, value) => {
    setFaq(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  // 新增定價方案
  const addPricingPlan = () => {
    setPricing(prev => ({
      ...prev,
      plans: [...prev.plans, {
        id: `plan-${Date.now()}`,
        name: '新方案',
        price: 0,
        period: '月',
        features: ['功能 1'],
        ctaText: '立即訂閱',
        highlighted: false
      }]
    }));
  };

  // 刪除定價方案
  const removePricingPlan = (id) => {
    setPricing(prev => ({
      ...prev,
      plans: prev.plans.filter(plan => plan.id !== id)
    }));
  };

  // 更新定價方案
  const updatePricingPlan = (id, field, value) => {
    setPricing(prev => ({
      ...prev,
      plans: prev.plans.map(plan =>
        plan.id === id ? { ...plan, [field]: value } : plan
      )
    }));
  };

  // 🆕 登入頁公告相關函數
  const addLoginAnnouncement = () => {
    setLoginAnnouncements(prev => [...prev, {
      id: `login-ann-${Date.now()}`,
      type: 'update',
      title: '新公告',
      content: '公告內容',
      icon: 'Sparkles',
      priority: 50,
      targetUsers: 'all',
      isUrgent: false,
      enabled: true
    }]);
  };

  const removeLoginAnnouncement = (id) => {
    setLoginAnnouncements(prev => prev.filter(item => item.id !== id));
  };

  const updateLoginAnnouncement = (id, field, value) => {
    setLoginAnnouncements(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-3" size={40} />
          <p className="text-gray-600 font-medium">載入官網內容...</p>
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
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl
                           flex items-center justify-center">
              <Globe className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">官網內容管理</h1>
              <p className="text-xs text-gray-500">編輯官網上顯示的所有內容</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://ultra-advisor.tw/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200
                       text-gray-700 rounded-xl font-medium transition-colors"
            >
              <Eye size={18} />
              <span className="hidden sm:inline">預覽官網</span>
            </a>
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700
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
            active={activeTab === 'videos'}
            icon={Video}
            label="影片管理"
            onClick={() => setActiveTab('videos')}
          />
          <TabButton
            active={activeTab === 'announcements'}
            icon={Megaphone}
            label="公告管理"
            onClick={() => setActiveTab('announcements')}
          />
          <TabButton
            active={activeTab === 'content'}
            icon={FileText}
            label="頁面內容"
            onClick={() => setActiveTab('content')}
          />
          <TabButton
            active={activeTab === 'contact'}
            icon={Mail}
            label="聯絡資訊"
            onClick={() => setActiveTab('contact')}
          />
        </div>

        {/* ==================== 影片管理分頁 ==================== */}
        {activeTab === 'videos' && (
          <div className="space-y-6">
            {/* 整體架構說明 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <Monitor className="text-blue-600 flex-shrink-0 mt-1" size={24} />
                <div className="flex-1">
                  <h4 className="font-bold text-blue-800 text-lg mb-3">官網影片架構圖</h4>

                  {/* 視覺化網站結構 */}
                  <div className="bg-white rounded-xl p-4 border border-blue-100 mb-4">
                    <div className="text-center mb-3">
                      <span className="text-xs text-gray-500">訪客開啟官網時看到的畫面</span>
                    </div>

                    {/* 模擬完整網頁 */}
                    <div className="bg-slate-900 rounded-lg overflow-hidden text-white">
                      {/* 公告橫幅 */}
                      <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-center py-1 text-[9px]">
                        🎉 公告橫幅（在「公告管理」分頁設定）
                      </div>

                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700">
                        <div className="flex items-center gap-1">
                          <div className="w-5 h-5 bg-blue-500 rounded"></div>
                          <span className="text-[10px] font-bold">UltraAdvisor</span>
                        </div>
                        <div className="flex gap-3 text-[8px] text-slate-400">
                          <span>功能</span>
                          <span>定價</span>
                          <span>登入</span>
                        </div>
                      </div>

                      {/* Hero 區 */}
                      <div className="text-center py-6 px-4">
                        <div className="text-[10px] text-slate-400 mb-1">專業財務顧問的</div>
                        <div className="text-sm font-bold mb-3">數位武器庫</div>

                        {/* 這是重點！按鈕區域 */}
                        <div className="flex justify-center gap-2">
                          <div className="px-3 py-1.5 bg-blue-600 rounded text-[9px]">免費試用</div>
                          <div className="px-3 py-1.5 border-2 border-amber-400 bg-amber-400/20 rounded text-[9px] text-amber-300 flex items-center gap-1">
                            <Play size={10} />
                            觀看 60 秒示範
                          </div>
                        </div>
                        <div className="mt-2 animate-pulse">
                          <span className="text-amber-400 text-[10px]">↑ 點這個按鈕會彈出影片 ↑</span>
                        </div>
                      </div>

                      {/* 其他區塊 */}
                      <div className="bg-slate-800 px-4 py-3 text-center text-[8px] text-slate-500">
                        ↓ 下方還有功能介紹、定價、FAQ 等區塊...
                      </div>
                    </div>
                  </div>

                  <p className="text-blue-700 text-sm">
                    <strong>總結：</strong>官網目前只有一處使用影片，就是首頁的「觀看 60 秒示範」按鈕。
                  </p>
                </div>
              </div>
            </div>

            {/* HTML 動畫上傳教學 */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <HelpCircle className="text-amber-600 flex-shrink-0 mt-1" size={24} />
                <div className="flex-1">
                  <h4 className="font-bold text-amber-800 text-lg mb-3">如何上傳 HTML 動畫？</h4>

                  <div className="space-y-4">
                    {/* 方法一 */}
                    <div className="bg-white rounded-xl p-4 border border-amber-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                        <span className="font-bold text-amber-800">方法一：放進官網專案（推薦）</span>
                      </div>
                      <ol className="text-amber-700 text-sm space-y-1 ml-8 list-decimal">
                        <li>將你的 <code className="bg-amber-100 px-1 rounded">animation.html</code> 放到 <code className="bg-amber-100 px-1 rounded">public/</code> 資料夾</li>
                        <li>執行 <code className="bg-amber-100 px-1 rounded">firebase deploy</code> 部署</li>
                        <li>填入網址：<code className="bg-amber-100 px-1 rounded">https://ultra-advisor.tw/animation.html</code></li>
                      </ol>
                    </div>

                    {/* 方法二 */}
                    <div className="bg-white rounded-xl p-4 border border-amber-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                        <span className="font-bold text-amber-800">方法二：上傳到 Firebase Storage</span>
                      </div>
                      <ol className="text-amber-700 text-sm space-y-1 ml-8 list-decimal">
                        <li>到 Firebase Console → Storage</li>
                        <li>建立資料夾 <code className="bg-amber-100 px-1 rounded">public-assets/</code></li>
                        <li>上傳 HTML 檔案並設定公開存取</li>
                        <li>複製下載網址貼到這裡</li>
                      </ol>
                    </div>

                    {/* 注意事項 */}
                    <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                      <p className="text-red-700 text-sm font-bold mb-1">⚠️ 注意：HTML 動畫必須是單一檔案</p>
                      <p className="text-red-600 text-xs">
                        如果你的動畫有引用其他 CSS/JS 檔案，需要把它們都內嵌到同一個 HTML 檔案中，
                        或確保所有資源都能透過完整網址存取。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero 影片設定 */}
            <Card title="官網首頁 - Hero 區影片" icon={Home} color="blue">
              <div className="grid md:grid-cols-2 gap-6">
                {/* 左側：設定 */}
                <div className="space-y-4">
                  <SelectField
                    label="影片類型"
                    value={hero.videoType}
                    onChange={(v) => setHero(prev => ({ ...prev, videoType: v }))}
                    options={[
                      { value: 'none', label: '不顯示影片' },
                      { value: 'youtube', label: 'YouTube 嵌入' },
                      { value: 'html', label: '自製 HTML 動畫' }
                    ]}
                  />

                  {hero.videoType === 'youtube' && (
                    <InputField
                      label="YouTube 嵌入網址"
                      value={hero.videoUrl}
                      onChange={(v) => setHero(prev => ({ ...prev, videoUrl: v }))}
                      placeholder="https://www.youtube.com/embed/xxxxxxx"
                      hint="從 YouTube 分享 > 嵌入 > 複製 src 網址"
                    />
                  )}

                  {hero.videoType === 'html' && (
                    <InputField
                      label="HTML 動畫網址"
                      value={hero.htmlVideoUrl}
                      onChange={(v) => setHero(prev => ({ ...prev, htmlVideoUrl: v }))}
                      placeholder="https://your-domain.com/animation.html"
                      hint="需為可嵌入的 HTML 頁面"
                    />
                  )}

                  {hero.videoType !== 'none' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <p className="text-amber-800 text-sm">
                        <strong>提示：</strong>影片會在用戶點擊「觀看 60 秒示範」按鈕後以彈窗形式播放。
                      </p>
                    </div>
                  )}
                </div>

                {/* 右側：預覽 */}
                <VideoLocationPreview
                  location="hero"
                  videoType={hero.videoType}
                  videoUrl={hero.videoType === 'youtube' ? hero.videoUrl : hero.htmlVideoUrl}
                />
              </div>
            </Card>
          </div>
        )}

        {/* ==================== 公告管理分頁 ==================== */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            {/* 官網頂部公告橫幅 */}
            <Card title="官網頂部公告橫幅" icon={Megaphone} color="purple">
              <div className="space-y-4">
                <Toggle
                  enabled={announcement.enabled}
                  onChange={(v) => setAnnouncement(prev => ({ ...prev, enabled: v }))}
                  label="顯示公告橫幅"
                />

                {announcement.enabled && (
                  <>
                    <SelectField
                      label="公告類型"
                      value={announcement.type}
                      onChange={(v) => setAnnouncement(prev => ({ ...prev, type: v }))}
                      options={[
                        { value: 'info', label: '📢 一般資訊（藍色）' },
                        { value: 'success', label: '🎉 好消息（綠色）' },
                        { value: 'warning', label: '⚠️ 警告（黃色）' },
                        { value: 'promo', label: '🔥 促銷（漸層）' }
                      ]}
                    />

                    <InputField
                      label="公告內容"
                      value={announcement.message}
                      onChange={(v) => setAnnouncement(prev => ({ ...prev, message: v }))}
                      placeholder="例如：🎉 限時優惠：年繳方案 83 折！"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <InputField
                        label="連結網址（選填）"
                        value={announcement.link}
                        onChange={(v) => setAnnouncement(prev => ({ ...prev, link: v }))}
                        placeholder="https://..."
                      />
                      <InputField
                        label="連結文字（選填）"
                        value={announcement.linkText}
                        onChange={(v) => setAnnouncement(prev => ({ ...prev, linkText: v }))}
                        placeholder="了解更多"
                      />
                    </div>

                    {/* 預覽 */}
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">預覽效果：</p>
                      <div className={`py-2.5 px-4 text-center text-sm font-bold text-white rounded-xl ${
                        announcement.type === 'info' ? 'bg-blue-600' :
                        announcement.type === 'success' ? 'bg-emerald-600' :
                        announcement.type === 'warning' ? 'bg-amber-500 !text-black' :
                        'bg-gradient-to-r from-purple-600 via-pink-500 to-red-500'
                      }`}>
                        {announcement.message || '公告內容預覽'}
                        {announcement.linkText && (
                          <span className="ml-2 underline">{announcement.linkText} →</span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* 登入頁公告管理 */}
            <Card title="登入頁公告管理" icon={LogIn} color="emerald">
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
                  <p className="text-emerald-800 text-sm">
                    登入頁公告會顯示在登入框左右兩側（桌面版）或下方（手機版）。
                    可設定不同類型的公告，如功能更新、活動通知、使用技巧等。
                  </p>
                </div>

                {loginAnnouncements.map((item, index) => (
                  <div key={item.id} className={`p-4 rounded-xl border-2 ${
                    item.enabled ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-600">公告 {index + 1}</span>
                        {item.isUrgent && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                            彈窗顯示
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Toggle
                          enabled={item.enabled}
                          onChange={(v) => updateLoginAnnouncement(item.id, 'enabled', v)}
                          label=""
                        />
                        <button
                          onClick={() => removeLoginAnnouncement(item.id)}
                          className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <SelectField
                        label="公告類型"
                        value={item.type}
                        onChange={(v) => updateLoginAnnouncement(item.id, 'type', v)}
                        options={[
                          { value: 'update', label: '🆕 功能更新' },
                          { value: 'event', label: '🎉 活動通知' },
                          { value: 'tip', label: '💡 使用技巧' },
                          { value: 'case', label: '📊 成功案例' },
                          { value: 'notice', label: '⚠️ 系統公告' }
                        ]}
                      />
                      <SelectField
                        label="圖示"
                        value={item.icon}
                        onChange={(v) => updateLoginAnnouncement(item.id, 'icon', v)}
                        options={[
                          { value: 'Sparkles', label: '✨ Sparkles' },
                          { value: 'Zap', label: '⚡ Zap' },
                          { value: 'Bell', label: '🔔 Bell' },
                          { value: 'Gift', label: '🎁 Gift' },
                          { value: 'Activity', label: '📈 Activity' },
                          { value: 'Megaphone', label: '📢 Megaphone' }
                        ]}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <InputField
                        label="標題"
                        value={item.title}
                        onChange={(v) => updateLoginAnnouncement(item.id, 'title', v)}
                        placeholder="公告標題"
                      />
                      <SelectField
                        label="顯示對象"
                        value={item.targetUsers}
                        onChange={(v) => updateLoginAnnouncement(item.id, 'targetUsers', v)}
                        options={[
                          { value: 'all', label: '所有用戶' },
                          { value: 'trial', label: '僅試用會員' },
                          { value: 'paid', label: '僅付費會員' }
                        ]}
                      />
                    </div>

                    <InputField
                      label="內容"
                      value={item.content}
                      onChange={(v) => updateLoginAnnouncement(item.id, 'content', v)}
                      placeholder="公告詳細內容"
                      rows={2}
                    />

                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <InputField
                        label="優先級（數字越大越優先）"
                        type="number"
                        value={item.priority}
                        onChange={(v) => updateLoginAnnouncement(item.id, 'priority', Number(v))}
                        placeholder="50"
                      />
                      <div className="flex items-end pb-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.isUrgent || false}
                            onChange={(e) => updateLoginAnnouncement(item.id, 'isUrgent', e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            重大公告（彈窗顯示）
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addLoginAnnouncement}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl
                           text-gray-500 hover:border-emerald-400 hover:text-emerald-500
                           flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus size={18} /> 新增登入頁公告
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* ==================== 頁面內容分頁 ==================== */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            {/* Hero 區塊 */}
            <Card title="Hero 主視覺文案" icon={Sparkles} color="blue">
              <div className="space-y-4">
                <Toggle
                  enabled={hero.enabled}
                  onChange={(v) => setHero(prev => ({ ...prev, enabled: v }))}
                />

                <InputField
                  label="主標題"
                  value={hero.title}
                  onChange={(v) => setHero(prev => ({ ...prev, title: v }))}
                  placeholder="專業財務顧問的數位武器庫"
                />

                <InputField
                  label="副標題"
                  value={hero.subtitle}
                  onChange={(v) => setHero(prev => ({ ...prev, subtitle: v }))}
                  placeholder="3 分鐘，從數據到成交"
                />

                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="CTA 按鈕文字"
                    value={hero.ctaText}
                    onChange={(v) => setHero(prev => ({ ...prev, ctaText: v }))}
                    placeholder="免費試用 14 天"
                  />
                  <InputField
                    label="CTA 連結"
                    value={hero.ctaLink}
                    onChange={(v) => setHero(prev => ({ ...prev, ctaLink: v }))}
                    placeholder="/login"
                  />
                </div>
              </div>
            </Card>

            {/* 功能介紹 */}
            <Card title="功能介紹" icon={Zap} color="amber">
              <div className="space-y-4">
                <Toggle
                  enabled={features.enabled}
                  onChange={(v) => setFeatures(prev => ({ ...prev, enabled: v }))}
                />

                <InputField
                  label="區塊標題"
                  value={features.sectionTitle}
                  onChange={(v) => setFeatures(prev => ({ ...prev, sectionTitle: v }))}
                  placeholder="為什麼選擇 Ultra Advisor？"
                />

                <div className="space-y-3">
                  {features.items.map((item, index) => (
                    <div key={item.id} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-gray-600">功能 {index + 1}</span>
                        <button
                          onClick={() => removeFeatureItem(item.id)}
                          className="p-1 text-red-500 hover:bg-red-100 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <SelectField
                          label="圖示"
                          value={item.icon}
                          onChange={(v) => updateFeatureItem(item.id, 'icon', v)}
                          options={Object.keys(iconMap).map(k => ({ value: k, label: k }))}
                        />
                        <SelectField
                          label="顏色"
                          value={item.color}
                          onChange={(v) => updateFeatureItem(item.id, 'color', v)}
                          options={[
                            { value: 'blue', label: '藍色' },
                            { value: 'purple', label: '紫色' },
                            { value: 'emerald', label: '綠色' },
                            { value: 'amber', label: '金色' },
                            { value: 'red', label: '紅色' }
                          ]}
                        />
                      </div>

                      <div className="mt-3 space-y-3">
                        <InputField
                          label="標題"
                          value={item.title}
                          onChange={(v) => updateFeatureItem(item.id, 'title', v)}
                        />
                        <InputField
                          label="描述"
                          value={item.description}
                          onChange={(v) => updateFeatureItem(item.id, 'description', v)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addFeatureItem}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl
                           text-gray-500 hover:border-blue-400 hover:text-blue-500
                           flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus size={18} /> 新增功能
                </button>
              </div>
            </Card>

            {/* 定價方案 */}
            <Card title="定價方案" icon={DollarSign} color="emerald">
              <div className="space-y-4">
                <Toggle
                  enabled={pricing.enabled}
                  onChange={(v) => setPricing(prev => ({ ...prev, enabled: v }))}
                />

                <InputField
                  label="區塊標題"
                  value={pricing.sectionTitle}
                  onChange={(v) => setPricing(prev => ({ ...prev, sectionTitle: v }))}
                  placeholder="簡單透明的定價"
                />

                <div className="space-y-3">
                  {pricing.plans.map((plan, index) => (
                    <div key={plan.id} className={`p-4 rounded-xl ${
                      plan.highlighted ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-gray-600">方案 {index + 1}</span>
                        <div className="flex items-center gap-2">
                          <Toggle
                            enabled={plan.highlighted}
                            onChange={(v) => updatePricingPlan(plan.id, 'highlighted', v)}
                            label="推薦"
                          />
                          <button
                            onClick={() => removePricingPlan(plan.id)}
                            className="p-1 text-red-500 hover:bg-red-100 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <InputField
                          label="方案名稱"
                          value={plan.name}
                          onChange={(v) => updatePricingPlan(plan.id, 'name', v)}
                        />
                        <InputField
                          label="價格"
                          type="number"
                          value={plan.price}
                          onChange={(v) => updatePricingPlan(plan.id, 'price', Number(v))}
                        />
                        <InputField
                          label="週期"
                          value={plan.period}
                          onChange={(v) => updatePricingPlan(plan.id, 'period', v)}
                          placeholder="月 / 年 / 14 天"
                        />
                      </div>

                      <div className="mt-3">
                        <InputField
                          label="功能列表（每行一個）"
                          value={plan.features?.join('\n') || ''}
                          onChange={(v) => updatePricingPlan(plan.id, 'features', v.split('\n'))}
                          rows={4}
                        />
                      </div>

                      <div className="mt-3">
                        <InputField
                          label="按鈕文字"
                          value={plan.ctaText}
                          onChange={(v) => updatePricingPlan(plan.id, 'ctaText', v)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addPricingPlan}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl
                           text-gray-500 hover:border-blue-400 hover:text-blue-500
                           flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus size={18} /> 新增方案
                </button>
              </div>
            </Card>

            {/* FAQ */}
            <Card title="常見問題 FAQ" icon={HelpCircle} color="purple">
              <div className="space-y-4">
                <Toggle
                  enabled={faq.enabled}
                  onChange={(v) => setFaq(prev => ({ ...prev, enabled: v }))}
                />

                <InputField
                  label="區塊標題"
                  value={faq.sectionTitle}
                  onChange={(v) => setFaq(prev => ({ ...prev, sectionTitle: v }))}
                  placeholder="常見問題"
                />

                <div className="space-y-3">
                  {faq.items.map((item, index) => (
                    <div key={item.id} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-gray-600">問題 {index + 1}</span>
                        <button
                          onClick={() => removeFaqItem(item.id)}
                          className="p-1 text-red-500 hover:bg-red-100 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <InputField
                        label="問題"
                        value={item.question}
                        onChange={(v) => updateFaqItem(item.id, 'question', v)}
                      />

                      <div className="mt-3">
                        <InputField
                          label="答案"
                          value={item.answer}
                          onChange={(v) => updateFaqItem(item.id, 'answer', v)}
                          rows={3}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addFaqItem}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl
                           text-gray-500 hover:border-blue-400 hover:text-blue-500
                           flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus size={18} /> 新增問題
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* ==================== 聯絡資訊分頁 ==================== */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <Card title="聯絡資訊" icon={Mail} color="blue">
              <div className="space-y-4">
                <Toggle
                  enabled={contact.enabled}
                  onChange={(v) => setContact(prev => ({ ...prev, enabled: v }))}
                />

                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Email"
                    value={contact.email}
                    onChange={(v) => setContact(prev => ({ ...prev, email: v }))}
                    placeholder="support@ultraadvisor.com"
                  />
                  <InputField
                    label="電話"
                    value={contact.phone}
                    onChange={(v) => setContact(prev => ({ ...prev, phone: v }))}
                    placeholder="02-1234-5678"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="LINE ID"
                    value={contact.lineId}
                    onChange={(v) => setContact(prev => ({ ...prev, lineId: v }))}
                    placeholder="@ultraadvisor"
                  />
                  <InputField
                    label="LINE 加入連結"
                    value={contact.lineUrl}
                    onChange={(v) => setContact(prev => ({ ...prev, lineUrl: v }))}
                    placeholder="https://line.me/ti/p/@ultraadvisor"
                  />
                </div>
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
