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

// ?ñÁ§∫Â∞çÊ?Ë°?const iconMap = {
  Zap, FileText, Cloud, Target, LayoutDashboard, ShieldCheck,
  Activity, History, Gift, Building, GraduationCap, Rocket,
  Waves, Car, Umbrella, Landmark, Globe, Sparkles, DollarSign,
  HelpCircle, Mail, MessageCircle, Megaphone, Settings
};

// ?ØÊë∫?äÂ?Â°äÁ?‰ª?const CollapsibleSection = ({ title, icon: Icon, children, defaultOpen = false }) => {
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

// ?ãÈ?ÁµÑ‰ª∂
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
      {label || (enabled ? 'Â∑≤Â??? : 'Â∑≤Â???)}
    </span>
  </button>
);

// Ëº∏ÂÖ•Ê¨Ñ‰?ÁµÑ‰ª∂
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

// ?∏Ê?Ê¨Ñ‰?ÁµÑ‰ª∂
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
// ‰∏ªÁ?‰ª?// ==========================================
export default function SiteEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  
  // ?ÑÂ?Â°äË??ôÁ???  const [hero, setHero] = useState({
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

  // ËºâÂÖ•Ë≥áÊ?
  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        // ËºâÂÖ• Hero
        const heroDoc = await getDoc(doc(db, 'siteContent', 'hero'));
        if (heroDoc.exists()) setHero(prev => ({ ...prev, ...heroDoc.data() }));
        
        // ËºâÂÖ• Features
        const featuresDoc = await getDoc(doc(db, 'siteContent', 'features'));
        if (featuresDoc.exists()) setFeatures(prev => ({ ...prev, ...featuresDoc.data() }));
        
        // ËºâÂÖ• Pricing
        const pricingDoc = await getDoc(doc(db, 'siteContent', 'pricing'));
        if (pricingDoc.exists()) setPricing(prev => ({ ...prev, ...pricingDoc.data() }));
        
        // ËºâÂÖ• FAQ
        const faqDoc = await getDoc(doc(db, 'siteContent', 'faq'));
        if (faqDoc.exists()) setFaq(prev => ({ ...prev, ...faqDoc.data() }));
        
        // ËºâÂÖ• Contact
        const contactDoc = await getDoc(doc(db, 'siteContent', 'contact'));
        if (contactDoc.exists()) setContact(prev => ({ ...prev, ...contactDoc.data() }));
        
        // ËºâÂÖ• Announcement
        const announcementDoc = await getDoc(doc(db, 'siteContent', 'announcement'));
        if (announcementDoc.exists()) setAnnouncement(prev => ({ ...prev, ...announcementDoc.data() }));
        
      } catch (error) {
        console.error('ËºâÂÖ•Â§±Ê?:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadContent();
  }, []);

  // ?≤Â??Ä?âË???  const handleSaveAll = async () => {
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
      
      setSaveMessage({ type: 'success', text: '???Ä?âË??¥Â∑≤?≤Â?Ôº? });
      setTimeout(() => setSaveMessage(null), 3000);
      
    } catch (error) {
      console.error('?≤Â?Â§±Ê?:', error);
      setSaveMessage({ type: 'error', text: '???≤Â?Â§±Ê?ÔºåË?Á®çÂ??çË©¶' });
    } finally {
      setSaving(false);
    }
  };

  // ?∞Â??üËÉΩ?ÖÁõÆ
  const addFeatureItem = () => {
    setFeatures(prev => ({
      ...prev,
      items: [...prev.items, {
        id: `feature-${Date.now()}`,
        icon: 'Zap',
        title: '?∞Â???,
        description: '?üËÉΩ?èËø∞',
        color: 'blue'
      }]
    }));
  };

  // ?™Èô§?üËÉΩ?ÖÁõÆ
  const removeFeatureItem = (id) => {
    setFeatures(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  // ?¥Êñ∞?üËÉΩ?ÖÁõÆ
  const updateFeatureItem = (id, field, value) => {
    setFeatures(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  // ?∞Â? FAQ ?ÖÁõÆ
  const addFaqItem = () => {
    setFaq(prev => ({
      ...prev,
      items: [...prev.items, {
        id: `faq-${Date.now()}`,
        question: '?∞Â?È°?,
        answer: 'Á≠îÊ?'
      }]
    }));
  };

  // ?™Èô§ FAQ ?ÖÁõÆ
  const removeFaqItem = (id) => {
    setFaq(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  // ?¥Êñ∞ FAQ ?ÖÁõÆ
  const updateFaqItem = (id, field, value) => {
    setFaq(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  // ?∞Â?ÂÆöÂÉπ?πÊ?
  const addPricingPlan = () => {
    setPricing(prev => ({
      ...prev,
      plans: [...prev.plans, {
        id: `plan-${Date.now()}`,
        name: '?∞ÊñπÊ°?,
        price: 0,
        period: '??,
        features: ['?üËÉΩ 1'],
        ctaText: 'Á´ãÂç≥Ë®ÇÈñ±',
        highlighted: false
      }]
    }));
  };

  // ?™Èô§ÂÆöÂÉπ?πÊ?
  const removePricingPlan = (id) => {
    setPricing(prev => ({
      ...prev,
      plans: prev.plans.filter(plan => plan.id !== id)
    }));
  };

  // ?¥Êñ∞ÂÆöÂÉπ?πÊ?
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
          <p className="text-gray-600 font-medium">ËºâÂÖ•ÂÆòÁ∂≤?ßÂÆπ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ?ÇÈÉ®Â∑•ÂÖ∑??*/}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl 
                           flex items-center justify-center">
              <Globe className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">ÂÆòÁ∂≤?ßÂÆπÁÆ°Á?</h1>
              <p className="text-xs text-gray-500">Á∑®ËºØÂÆòÁ∂≤‰∏äÈ°ØÁ§∫Á??Ä?âÂÖßÂÆ?/p>
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
              <span className="hidden sm:inline">?êË¶ΩÂÆòÁ∂≤</span>
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
              {saving ? '?≤Â?‰∏?..' : '?≤Â??®ÈÉ®'}
            </button>
          </div>
        </div>
        
        {/* ?≤Â?Ë®äÊÅØ */}
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

      {/* ‰∏ªÂÖßÂÆ?*/}
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        
        {/* ==================== ?¨Â?Ê©´Â? ==================== */}
        <CollapsibleSection title="?¨Â?Ê©´Â?" icon={Megaphone} defaultOpen={false}>
          <div className="space-y-4">
            <Toggle 
              enabled={announcement.enabled} 
              onChange={(v) => setAnnouncement(prev => ({ ...prev, enabled: v }))}
              label="È°ØÁ§∫?¨Â?"
            />
            
            {announcement.enabled && (
              <>
                <SelectField
                  label="?¨Â?È°ûÂ?"
                  value={announcement.type}
                  onChange={(v) => setAnnouncement(prev => ({ ...prev, type: v }))}
                  options={[
                    { value: 'info', label: '?ì¢ ‰∏Ä?¨Ë?Ë®äÔ??çËâ≤Ôº? },
                    { value: 'success', label: '?? Â•ΩÊ??ØÔ?Á∂†Ëâ≤Ôº? },
                    { value: 'warning', label: '?†Ô? Ë≠¶Â?ÔºàÈ??≤Ô?' },
                    { value: 'promo', label: '?î• ‰øÉÈä∑ÔºàÊº∏Â±§Ô?' }
                  ]}
                />
                
                <InputField
                  label="?¨Â??ßÂÆπ"
                  value={announcement.message}
                  onChange={(v) => setAnnouncement(prev => ({ ...prev, message: v }))}
                  placeholder="‰æãÂ?Ôºö???êÊ??™Ê?ÔºöÂπ¥Áπ≥ÊñπÊ°?83 ?òÔ?"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="???Á∂≤Â?ÔºàÈÅ∏Â°´Ô?"
                    value={announcement.link}
                    onChange={(v) => setAnnouncement(prev => ({ ...prev, link: v }))}
                    placeholder="https://..."
                  />
                  <InputField
                    label="????áÂ?ÔºàÈÅ∏Â°´Ô?"
                    value={announcement.linkText}
                    onChange={(v) => setAnnouncement(prev => ({ ...prev, linkText: v }))}
                    placeholder="‰∫ÜËß£?¥Â?"
                  />
                </div>
              </>
            )}
          </div>
        </CollapsibleSection>

        {/* ==================== Hero ?ÄÂ°?==================== */}
        <CollapsibleSection title="Hero ‰∏ªË?Ë¶? icon={Sparkles} defaultOpen={true}>
          <div className="space-y-4">
            <Toggle 
              enabled={hero.enabled} 
              onChange={(v) => setHero(prev => ({ ...prev, enabled: v }))}
            />
            
            <InputField
              label="‰∏ªÊ?È°?
              value={hero.title}
              onChange={(v) => setHero(prev => ({ ...prev, title: v }))}
              placeholder="Â∞àÊ•≠Ë≤°Â?È°ßÂ??ÑÊï∏‰ΩçÊ≠¶?®Â∫´"
            />
            
            <InputField
              label="?ØÊ?È°?
              value={hero.subtitle}
              onChange={(v) => setHero(prev => ({ ...prev, subtitle: v }))}
              placeholder="3 ?ÜÈ?ÔºåÂ??∏Ê??∞Ê?‰∫?
            />
            
            <div className="p-4 bg-gray-50 rounded-xl space-y-4">
              <h4 className="font-bold text-gray-700 flex items-center gap-2">
                <Video size={18} /> ÂΩ±Á?Ë®≠Â?
              </h4>
              
              <SelectField
                label="ÂΩ±Á?È°ûÂ?"
                value={hero.videoType}
                onChange={(v) => setHero(prev => ({ ...prev, videoType: v }))}
                options={[
                  { value: 'none', label: '‰∏çÈ°ØÁ§∫ÂΩ±?? },
                  { value: 'youtube', label: 'YouTube ÂµåÂÖ•' },
                  { value: 'html', label: '?™Ë£Ω HTML ?ïÁï´' }
                ]}
              />
              
              {hero.videoType === 'youtube' && (
                <InputField
                  label="YouTube ÂµåÂÖ•Á∂≤Â?"
                  value={hero.videoUrl}
                  onChange={(v) => setHero(prev => ({ ...prev, videoUrl: v }))}
                  placeholder="https://www.youtube.com/embed/xxxxxxx"
                />
              )}
              
              {hero.videoType === 'html' && (
                <InputField
                  label="HTML ?ïÁï´Á∂≤Â?"
                  value={hero.htmlVideoUrl}
                  onChange={(v) => setHero(prev => ({ ...prev, htmlVideoUrl: v }))}
                  placeholder="https://your-domain.com/animation.html"
                />
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="CTA ?âÈ??áÂ?"
                value={hero.ctaText}
                onChange={(v) => setHero(prev => ({ ...prev, ctaText: v }))}
                placeholder="?çË≤ªË©¶Áî® 14 Â§?
              />
              <InputField
                label="CTA ???"
                value={hero.ctaLink}
                onChange={(v) => setHero(prev => ({ ...prev, ctaLink: v }))}
                placeholder="/login"
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* ==================== ?üËÉΩ‰ªãÁ¥π ==================== */}
        <CollapsibleSection title="?üËÉΩ‰ªãÁ¥π" icon={Zap} defaultOpen={false}>
          <div className="space-y-4">
            <Toggle 
              enabled={features.enabled} 
              onChange={(v) => setFeatures(prev => ({ ...prev, enabled: v }))}
            />
            
            <InputField
              label="?ÄÂ°äÊ?È°?
              value={features.sectionTitle}
              onChange={(v) => setFeatures(prev => ({ ...prev, sectionTitle: v }))}
              placeholder="?∫‰?È∫ºÈÅ∏??Ultra AdvisorÔº?
            />
            
            <div className="space-y-3">
              {features.items.map((item, index) => (
                <div key={item.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-gray-600">?üËÉΩ {index + 1}</span>
                    <button
                      onClick={() => removeFeatureItem(item.id)}
                      className="p-1 text-red-500 hover:bg-red-100 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <SelectField
                      label="?ñÁ§∫"
                      value={item.icon}
                      onChange={(v) => updateFeatureItem(item.id, 'icon', v)}
                      options={Object.keys(iconMap).map(k => ({ value: k, label: k }))}
                    />
                    <SelectField
                      label="È°èËâ≤"
                      value={item.color}
                      onChange={(v) => updateFeatureItem(item.id, 'color', v)}
                      options={[
                        { value: 'blue', label: '?çËâ≤' },
                        { value: 'purple', label: 'Á¥´Ëâ≤' },
                        { value: 'emerald', label: 'Á∂†Ëâ≤' },
                        { value: 'amber', label: '?ëËâ≤' },
                        { value: 'red', label: 'Á¥ÖËâ≤' }
                      ]}
                    />
                  </div>
                  
                  <div className="mt-3 space-y-3">
                    <InputField
                      label="Ê®ôÈ?"
                      value={item.title}
                      onChange={(v) => updateFeatureItem(item.id, 'title', v)}
                    />
                    <InputField
                      label="?èËø∞"
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
              <Plus size={18} /> ?∞Â??üËÉΩ
            </button>
          </div>
        </CollapsibleSection>

        {/* ==================== ÂÆöÂÉπ?πÊ? ==================== */}
        <CollapsibleSection title="ÂÆöÂÉπ?πÊ?" icon={DollarSign} defaultOpen={false}>
          <div className="space-y-4">
            <Toggle 
              enabled={pricing.enabled} 
              onChange={(v) => setPricing(prev => ({ ...prev, enabled: v }))}
            />
            
            <InputField
              label="?ÄÂ°äÊ?È°?
              value={pricing.sectionTitle}
              onChange={(v) => setPricing(prev => ({ ...prev, sectionTitle: v }))}
              placeholder="Á∞°ÂñÆ?èÊ??ÑÂ???
            />
            
            <div className="space-y-3">
              {pricing.plans.map((plan, index) => (
                <div key={plan.id} className={`p-4 rounded-xl ${
                  plan.highlighted ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-gray-600">?πÊ? {index + 1}</span>
                    <div className="flex items-center gap-2">
                      <Toggle
                        enabled={plan.highlighted}
                        onChange={(v) => updatePricingPlan(plan.id, 'highlighted', v)}
                        label="?®Ëñ¶"
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
                      label="?πÊ??çÁ®±"
                      value={plan.name}
                      onChange={(v) => updatePricingPlan(plan.id, 'name', v)}
                    />
                    <InputField
                      label="?πÊ†º"
                      type="number"
                      value={plan.price}
                      onChange={(v) => updatePricingPlan(plan.id, 'price', Number(v))}
                    />
                    <InputField
                      label="?±Ê?"
                      value={plan.period}
                      onChange={(v) => updatePricingPlan(plan.id, 'period', v)}
                      placeholder="??/ Âπ?/ 14 Â§?
                    />
                  </div>
                  
                  <div className="mt-3">
                    <InputField
                      label="?üËÉΩ?óË°®ÔºàÊ?Ë°å‰??ãÔ?"
                      value={plan.features?.join('\n') || ''}
                      onChange={(v) => updatePricingPlan(plan.id, 'features', v.split('\n'))}
                      rows={4}
                    />
                  </div>
                  
                  <div className="mt-3">
                    <InputField
                      label="?âÈ??áÂ?"
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
              <Plus size={18} /> ?∞Â??πÊ?
            </button>
          </div>
        </CollapsibleSection>

        {/* ==================== FAQ ==================== */}
        <CollapsibleSection title="Â∏∏Ë??èÈ? FAQ" icon={HelpCircle} defaultOpen={false}>
          <div className="space-y-4">
            <Toggle 
              enabled={faq.enabled} 
              onChange={(v) => setFaq(prev => ({ ...prev, enabled: v }))}
            />
            
            <InputField
              label="?ÄÂ°äÊ?È°?
              value={faq.sectionTitle}
              onChange={(v) => setFaq(prev => ({ ...prev, sectionTitle: v }))}
              placeholder="Â∏∏Ë??èÈ?"
            />
            
            <div className="space-y-3">
              {faq.items.map((item, index) => (
                <div key={item.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-gray-600">?èÈ? {index + 1}</span>
                    <button
                      onClick={() => removeFaqItem(item.id)}
                      className="p-1 text-red-500 hover:bg-red-100 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <InputField
                    label="?èÈ?"
                    value={item.question}
                    onChange={(v) => updateFaqItem(item.id, 'question', v)}
                  />
                  
                  <div className="mt-3">
                    <InputField
                      label="Á≠îÊ?"
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
              <Plus size={18} /> ?∞Â??èÈ?
            </button>
          </div>
        </CollapsibleSection>

        {/* ==================== ?ØÁµ°Ë≥áË? ==================== */}
        <CollapsibleSection title="?ØÁµ°Ë≥áË?" icon={Mail} defaultOpen={false}>
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
                label="?ªË©±"
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
                label="LINE ?†ÂÖ•???"
                value={contact.lineUrl}
                onChange={(v) => setContact(prev => ({ ...prev, lineUrl: v }))}
                placeholder="https://line.me/ti/p/@ultraadvisor"
              />
            </div>
          </div>
        </CollapsibleSection>

      </div>
      
      {/* Â∫ïÈÉ®?ìË? */}
      <div className="h-20"></div>
    </div>
  );
}
