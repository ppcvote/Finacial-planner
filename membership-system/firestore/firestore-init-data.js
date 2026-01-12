/**
 * Ultra Advisor 身分組 + UA 點系統
 * Firestore 初始化資料腳本
 * 
 * 使用方式：
 * 1. 複製此腳本到 functions 目錄
 * 2. 執行 node firestore-init-data.js
 * 
 * 或者直接在 Firebase Console 手動新增
 */

const admin = require('firebase-admin');

// 初始化 Firebase Admin（如果還沒初始化）
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// ==========================================
// 🎖️ 預設身分組資料
// ==========================================
const membershipTiers = [
  {
    id: 'founder',
    name: '🏆 創始會員',
    description: '前 100 名限量，永久專屬特權',
    icon: '🏆',
    color: '#f59e0b',
    badgeStyle: {
      background: 'rgba(245, 158, 11, 0.2)',
      border: '#f59e0b',
      text: '#f59e0b'
    },
    priority: 1,
    isDefault: false,
    isActive: true,
    isPermanent: true,
    permissions: {
      canUseTools: true,
      canExport: true,
      canAccessAI: true,
      maxClients: -1,
      canEarnPoints: true,
      canRedeemPoints: true
    },
    pointsMultiplier: 2.0,
    benefits: [
      '永久享有早鳥價格鎖定',
      '優先體驗所有新功能',
      '專屬 VIP 社群',
      '終身技術支援',
      '功能需求優先處理',
      '創始會員徽章'
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: 'system'
  },
  {
    id: 'paid',
    name: '💎 付費會員',
    description: '年繳訂閱用戶，享完整功能',
    icon: '💎',
    color: '#22c55e',
    badgeStyle: {
      background: 'rgba(34, 197, 94, 0.2)',
      border: '#22c55e',
      text: '#22c55e'
    },
    priority: 2,
    isDefault: false,
    isActive: true,
    isPermanent: false,
    permissions: {
      canUseTools: true,
      canExport: true,
      canAccessAI: true,
      maxClients: -1,
      canEarnPoints: true,
      canRedeemPoints: true
    },
    pointsMultiplier: 1.5,
    benefits: [
      '完整工具存取',
      '無限客戶檔案',
      '報表匯出功能',
      'LINE 社群支援',
      'UA 點數獎勵'
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: 'system'
  },
  {
    id: 'trial',
    name: '🆓 試用會員',
    description: '7 天免費試用，體驗完整功能',
    icon: '🆓',
    color: '#3b82f6',
    badgeStyle: {
      background: 'rgba(59, 130, 246, 0.2)',
      border: '#3b82f6',
      text: '#3b82f6'
    },
    priority: 3,
    isDefault: true,
    isActive: true,
    isPermanent: false,
    permissions: {
      canUseTools: true,
      canExport: true,
      canAccessAI: true,
      maxClients: 10,
      canEarnPoints: true,
      canRedeemPoints: false
    },
    pointsMultiplier: 1.0,
    benefits: [
      '7 天完整功能體驗',
      '最多 10 位客戶檔案',
      '報表匯出功能',
      'LINE 社群支援'
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: 'system'
  },
  {
    id: 'grace',
    name: '⏰ 寬限期',
    description: '訂閱到期後 7 天唯讀期間',
    icon: '⏰',
    color: '#eab308',
    badgeStyle: {
      background: 'rgba(234, 179, 8, 0.2)',
      border: '#eab308',
      text: '#eab308'
    },
    priority: 4,
    isDefault: false,
    isActive: true,
    isPermanent: false,
    permissions: {
      canUseTools: false,
      canExport: false,
      canAccessAI: false,
      maxClients: 0,
      canEarnPoints: false,
      canRedeemPoints: false
    },
    pointsMultiplier: 0,
    benefits: [
      '7 天唯讀存取',
      '查看既有客戶資料',
      '無法新增或編輯'
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: 'system'
  },
  {
    id: 'expired',
    name: '❌ 已過期',
    description: '訂閱已過期，需重新訂閱',
    icon: '❌',
    color: '#ef4444',
    badgeStyle: {
      background: 'rgba(239, 68, 68, 0.2)',
      border: '#ef4444',
      text: '#ef4444'
    },
    priority: 5,
    isDefault: false,
    isActive: true,
    isPermanent: false,
    permissions: {
      canUseTools: false,
      canExport: false,
      canAccessAI: false,
      maxClients: 0,
      canEarnPoints: false,
      canRedeemPoints: false
    },
    pointsMultiplier: 0,
    benefits: [
      '僅可查看舊資料摘要'
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: 'system'
  }
];

// ==========================================
// 💎 預設點數規則
// ==========================================
const pointsRules = [
  {
    id: 'daily_login',
    name: '每日登入',
    description: '每天首次登入系統獲得點數',
    icon: '📅',
    category: 'engagement',
    points: 5,
    limits: {
      dailyMax: 5,
      weeklyMax: null,
      monthlyMax: null,
      totalMax: null,
      cooldownMinutes: 1440
    },
    isActive: true,
    isSystemRule: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'tool_use',
    name: '使用工具',
    description: '每次使用財務工具獲得點數',
    icon: '🛠️',
    category: 'engagement',
    points: 10,
    limits: {
      dailyMax: 50,
      weeklyMax: null,
      monthlyMax: null,
      totalMax: null,
      cooldownMinutes: 5
    },
    isActive: true,
    isSystemRule: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'first_client',
    name: '建立首位客戶',
    description: '首次建立客戶檔案獲得獎勵',
    icon: '👤',
    category: 'engagement',
    points: 50,
    limits: {
      dailyMax: null,
      weeklyMax: null,
      monthlyMax: null,
      totalMax: 50,
      cooldownMinutes: 0
    },
    isActive: true,
    isSystemRule: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'referral_success',
    name: '推薦成功',
    description: '成功推薦好友付費訂閱',
    icon: '🎉',
    category: 'referral',
    points: 500,
    limits: {
      dailyMax: null,
      weeklyMax: null,
      monthlyMax: null,
      totalMax: null,
      cooldownMinutes: 0
    },
    isActive: true,
    isSystemRule: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'referred_signup',
    name: '被推薦獎勵',
    description: '使用推薦碼註冊並付費',
    icon: '🎁',
    category: 'referral',
    points: 500,
    limits: {
      dailyMax: null,
      weeklyMax: null,
      monthlyMax: null,
      totalMax: 500,
      cooldownMinutes: 0
    },
    isActive: true,
    isSystemRule: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'activity_participation',
    name: '參與活動',
    description: '參與官方活動獲得點數',
    icon: '🎪',
    category: 'activity',
    points: 100,
    limits: {
      dailyMax: null,
      weeklyMax: null,
      monthlyMax: null,
      totalMax: null,
      cooldownMinutes: 0
    },
    isActive: true,
    isSystemRule: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'feedback_submit',
    name: '提交建議',
    description: '提交功能建議或問題回報',
    icon: '💡',
    category: 'engagement',
    points: 20,
    limits: {
      dailyMax: 60,
      weeklyMax: null,
      monthlyMax: null,
      totalMax: null,
      cooldownMinutes: 0
    },
    isActive: true,
    isSystemRule: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

// ==========================================
// 🎁 預設兌換商品
// ==========================================
const redeemableItems = [
  {
    id: 'extend_1_month',
    name: '延長訂閱 1 個月',
    description: '使用點數延長訂閱期限 1 個月',
    image: '',
    category: 'subscription',
    pointsCost: 1000,
    stock: -1,
    stockUsed: 0,
    limits: {
      perUserMax: 12,
      membershipRequired: []
    },
    isActive: true,
    isFeatured: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: 'system'
  },
  {
    id: 'brand_tshirt',
    name: 'Ultra Advisor 品牌 T-Shirt',
    description: '限量版品牌 T-Shirt，只送不賣！展現你的專業顧問身份。',
    image: '',
    category: 'merchandise',
    pointsCost: 2000,
    stock: 100,
    stockUsed: 0,
    limits: {
      perUserMax: 2,
      membershipRequired: ['founder', 'paid']
    },
    isActive: true,
    isFeatured: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: 'system'
  },
  {
    id: 'brand_cap',
    name: 'Ultra Advisor 品牌棒球帽',
    description: '經典款品牌棒球帽，低調奢華。',
    image: '',
    category: 'merchandise',
    pointsCost: 1500,
    stock: 50,
    stockUsed: 0,
    limits: {
      perUserMax: 2,
      membershipRequired: ['founder', 'paid']
    },
    isActive: true,
    isFeatured: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: 'system'
  },
  {
    id: 'brand_tumbler',
    name: 'Ultra Advisor 保溫杯',
    description: '500ml 不鏽鋼保溫杯，品牌 Logo 雷射雕刻。',
    image: '',
    category: 'merchandise',
    pointsCost: 3000,
    stock: 30,
    stockUsed: 0,
    limits: {
      perUserMax: 1,
      membershipRequired: ['founder', 'paid']
    },
    isActive: true,
    isFeatured: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: 'system'
  }
];

// ==========================================
// 🚀 執行初始化
// ==========================================
async function initializeData() {
  console.log('🚀 開始初始化 Firestore 資料...\n');
  
  const batch = db.batch();
  
  // 1. 初始化身分組
  console.log('📋 初始化身分組...');
  for (const tier of membershipTiers) {
    const ref = db.collection('membershipTiers').doc(tier.id);
    batch.set(ref, tier, { merge: true });
    console.log(`   ✅ ${tier.name}`);
  }
  
  // 2. 初始化點數規則
  console.log('\n📋 初始化點數規則...');
  for (const rule of pointsRules) {
    const ref = db.collection('pointsRules').doc(rule.id);
    batch.set(ref, rule, { merge: true });
    console.log(`   ✅ ${rule.name}`);
  }
  
  // 3. 初始化兌換商品
  console.log('\n📋 初始化兌換商品...');
  for (const item of redeemableItems) {
    const ref = db.collection('redeemableItems').doc(item.id);
    batch.set(ref, item, { merge: true });
    console.log(`   ✅ ${item.name}`);
  }
  
  // 提交批次寫入
  await batch.commit();
  
  console.log('\n✅ 所有資料初始化完成！');
  console.log(`   - 身分組：${membershipTiers.length} 個`);
  console.log(`   - 點數規則：${pointsRules.length} 個`);
  console.log(`   - 兌換商品：${redeemableItems.length} 個`);
}

// 執行
initializeData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ 初始化失敗:', error);
    process.exit(1);
  });

// ==========================================
// 📤 導出資料（供其他用途）
// ==========================================
module.exports = {
  membershipTiers,
  pointsRules,
  redeemableItems
};
