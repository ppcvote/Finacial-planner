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
  Waves, Car, Umbrella, Landmark, Play, ExternalLink
} from 'lucide-react';

// 圖示對應表
const iconMap = {
  Zap, FileText, Cloud, Target, LayoutDashboard, ShieldCheck,
  Activity, History, Gift, Building, GraduationCap, Rocket,
  Waves, Car, Umbrella, Landmark, Globe, Sparkles, DollarSign,
  HelpCircle, Mail, MessageCircle, Megaphone, Settings
};

// 可摺疊區塊組件
const CollapsibleSection = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Icon className="text-blue-600" size={20} />
          </div>
          <span className="font-bold text-gray-800">{title}</span>
        </div>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && (
        <div className="p-5 pt-0 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
};

// 開關組件
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

// 輸入欄位組件
const InputField = ({ label, value, onChange, placeholder, type = 'text', rows }) => (
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
  </div>
);

// 選擇欄位組件
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
// 主組件
// ==========================================
export default function SiteEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  
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
  
  const [announcement, setAnnouncement] = useState({
    enabled: false,
    type: 'info',
    message: '',
    link: '',
    linkText: ''
  });

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
        
        // 載入 Announcement
        const announcementDoc = await getDoc(doc(db, 'siteContent', 'announcement'));
        if (announcementDoc.exists()) setAnnouncement(prev => ({ ...prev, ...announcementDoc.data() }));
        
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
      ]);
      
      setSaveMessage({ type: 'success', text: '✅ 所有變更已儲存！' });
      setTimeout(() => setSaveMessage(null), 3000);
      
    } catch (error) {
      console.error('儲存失敗:', error);
      setSaveMessage({ type: 'error', text: '❌ 儲存失敗，請稍後再試' });
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
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
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
            {saveMessage.text}
          </div>
        )}
      </div>

      {/* 主內容 */}
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        
        {/* ==================== 公告橫幅 ==================== */}
        <CollapsibleSection title="公告橫幅" icon={Megaphone} defaultOpen={false}>
          <div className="space-y-4">
            <Toggle 
              enabled={announcement.enabled} 
              onChange={(v) => setAnnouncement(prev => ({ ...prev, enabled: v }))}
              label="顯示公告"
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
              </>
            )}
          </div>
        </CollapsibleSection>

        {/* ==================== Hero 區塊 ==================== */}
        <CollapsibleSection title="Hero 主視覺" icon={Sparkles} defaultOpen={true}>
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
            
            <div className="p-4 bg-gray-50 rounded-xl space-y-4">
              <h4 className="font-bold text-gray-700 flex items-center gap-2">
                <Video size={18} /> 影片設定
              </h4>
              
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
                />
              )}
              
              {hero.videoType === 'html' && (
                <InputField
                  label="HTML 動畫網址"
                  value={hero.htmlVideoUrl}
                  onChange={(v) => setHero(prev => ({ ...prev, htmlVideoUrl: v }))}
                  placeholder="https://your-domain.com/animation.html"
                />
              )}
            </div>
            
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
        </CollapsibleSection>

        {/* ==================== 功能介紹 ==================== */}
        <CollapsibleSection title="功能介紹" icon={Zap} defaultOpen={false}>
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
        </CollapsibleSection>

        {/* ==================== 定價方案 ==================== */}
        <CollapsibleSection title="定價方案" icon={DollarSign} defaultOpen={false}>
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
        </CollapsibleSection>

        {/* ==================== FAQ ==================== */}
        <CollapsibleSection title="常見問題 FAQ" icon={HelpCircle} defaultOpen={false}>
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
        </CollapsibleSection>

        {/* ==================== 聯絡資訊 ==================== */}
        <CollapsibleSection title="聯絡資訊" icon={Mail} defaultOpen={false}>
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
        </CollapsibleSection>

      </div>
      
      {/* 底部間距 */}
      <div className="h-20"></div>
    </div>
  );
}