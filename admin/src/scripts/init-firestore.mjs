/**
 * Ultra Advisor - Firestore 初始化腳本
 * 
 * 使用方式：
 * cd C:\Users\User\financial-planner\admin
 * node scripts/init-firestore.mjs
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';

// ✅ 你的 Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyAFBZewXFrV8Q1GqoMwx0METphFH12VXRM",
  authDomain: "grbt-f87fa.firebaseapp.com",
  projectId: "grbt-f87fa",
  storageBucket: "grbt-f87fa.firebasestorage.app",
  messagingSenderId: "169700005946",
  appId: "1:169700005946:web:34dc698c531ff9ccd13d03",
  measurementId: "G-Q67KR18V0L"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ========================================
// 預設身分組資料
// ========================================
const defaultTiers = [
  {
    slug: 'founder',
    name: '🏆 創始會員',
    icon: '🏆',
    color: '#f59e0b',
    description: '前 100 名限量，永久特權',
    priority: 1,
    permissions: {
      canUseTools: true,
      canExport: true,
      canAccessAI: true,
      maxClients: -1,
      canEarnPoints: true,
      canRedeemPoints: true,
      canAccessVIP: true,
      canCustomReferral: true,
    },
    pointsMultiplier: 2.0,
    isPermanent: true,
    defaultDurationDays: null,
    benefits: [
      '永久享有早鳥價格鎖定',
      '優先體驗所有新功能',
      '專屬 VIP 社群',
      '終身技術支援',
      '功能需求優先處理',
      '創始會員徽章',
      '點數 2 倍獲得',
    ],
    isDefault: false,
    isActive: true,
    canBeAssignedManually: true,
    canBeEarnedByReferral: false,
  },
  {
    slug: 'paid',
    name: '💎 付費會員',
    icon: '💎',
    color: '#22c55e',
    description: '標準年繳訂閱用戶',
    priority: 2,
    permissions: {
      canUseTools: true,
      canExport: true,
      canAccessAI: true,
      maxClients: -1,
      canEarnPoints: true,
      canRedeemPoints: true,
      canAccessVIP: false,
      canCustomReferral: true,
    },
    pointsMultiplier: 1.5,
    isPermanent: false,
    defaultDurationDays: 365,
    benefits: [
      '完整工具使用權限',
      '無限客戶檔案',
      '匯出報表功能',
      'AI 智能分析',
      '點數 1.5 倍獲得',
    ],
    isDefault: false,
    isActive: true,
    canBeAssignedManually: true,
    canBeEarnedByReferral: false,
  },
  {
    slug: 'trial',
    name: '🆓 試用會員',
    icon: '🆓',
    color: '#3b82f6',
    description: '7 天免費試用',
    priority: 3,
    permissions: {
      canUseTools: true,
      canExport: false,
      canAccessAI: false,
      maxClients: 3,
      canEarnPoints: true,
      canRedeemPoints: false,
      canAccessVIP: false,
      canCustomReferral: false,
    },
    pointsMultiplier: 1.0,
    isPermanent: false,
    defaultDurationDays: 7,
    benefits: [
      '完整功能試用',
      '最多 3 位客戶',
      '基礎點數獲得',
    ],
    isDefault: true,
    isActive: true,
    canBeAssignedManually: true,
    canBeEarnedByReferral: false,
  },
  {
    slug: 'grace',
    name: '⏰ 寬限期',
    icon: '⏰',
    color: '#eab308',
    description: '到期未續，唯讀 7 天',
    priority: 4,
    permissions: {
      canUseTools: false,
      canExport: false,
      canAccessAI: false,
      maxClients: 0,
      canEarnPoints: false,
      canRedeemPoints: false,
      canAccessVIP: false,
      canCustomReferral: false,
    },
    pointsMultiplier: 0,
    isPermanent: false,
    defaultDurationDays: 7,
    benefits: [
      '可查看歷史資料',
      '無法新增或編輯',
    ],
    isDefault: false,
    isActive: true,
    canBeAssignedManually: true,
    canBeEarnedByReferral: false,
  },
  {
    slug: 'expired',
    name: '❌ 已過期',
    icon: '❌',
    color: '#ef4444',
    description: '訂閱已過期',
    priority: 5,
    permissions: {
      canUseTools: false,
      canExport: false,
      canAccessAI: false,
      maxClients: 0,
      canEarnPoints: false,
      canRedeemPoints: false,
      canAccessVIP: false,
      canCustomReferral: false,
    },
    pointsMultiplier: 0,
    isPermanent: false,
    defaultDurationDays: null,
    benefits: [],
    isDefault: false,
    isActive: true,
    canBeAssignedManually: true,
    canBeEarnedByReferral: false,
  },
];

// ========================================
// 預設點數規則
// ========================================
const defaultPointsRules = [
  {
    actionId: 'daily_login',
    name: '每日登入',
    description: '每天首次登入獲得點數',
    icon: '📅',
    category: 'engagement',
    basePoints: 5,
    limits: { dailyMax: 1 },
    triggerType: 'auto',
    isActive: true,
    priority: 1,
  },
  {
    actionId: 'tool_use',
    name: '使用工具',
    description: '每次使用工具獲得點數',
    icon: '🛠️',
    category: 'engagement',
    basePoints: 10,
    limits: { dailyMax: 10 },
    triggerType: 'auto',
    isActive: true,
    priority: 2,
  },
  {
    actionId: 'first_client',
    name: '建立首位客戶',
    description: '首次建立客戶檔案',
    icon: '👤',
    category: 'engagement',
    basePoints: 50,
    limits: { totalMax: 1 },
    triggerType: 'auto',
    isActive: true,
    priority: 3,
  },
  {
    actionId: 'referral_success',
    name: '推薦成功',
    description: '推薦新用戶並完成付費（推薦人獎勵）',
    icon: '🎁',
    category: 'referral',
    basePoints: 500,
    limits: {},
    triggerType: 'auto',
    isActive: true,
    priority: 4,
  },
  {
    actionId: 'referred_bonus',
    name: '被推薦獎勵',
    description: '透過推薦碼註冊並付費（被推薦人獎勵）',
    icon: '🎉',
    category: 'referral',
    basePoints: 500,
    limits: { totalMax: 1 },
    triggerType: 'auto',
    isActive: true,
    priority: 5,
  },
  {
    actionId: 'activity_participation',
    name: '參與活動',
    description: '參與官方舉辦的活動',
    icon: '🎪',
    category: 'activity',
    basePoints: 100,
    limits: {},
    triggerType: 'manual',
    isActive: true,
    priority: 6,
  },
  {
    actionId: 'feedback_submit',
    name: '功能建議',
    description: '提交功能建議或回饋',
    icon: '💡',
    category: 'engagement',
    basePoints: 20,
    limits: { weeklyMax: 3 },
    triggerType: 'manual',
    isActive: true,
    priority: 7,
  },
  {
    actionId: 'login_streak_7',
    name: '連續登入 7 天',
    description: '連續 7 天登入獎勵',
    icon: '🔥',
    category: 'bonus',
    basePoints: 50,
    limits: { weeklyMax: 1 },
    triggerType: 'auto',
    isActive: true,
    priority: 8,
  },
  {
    actionId: 'login_streak_30',
    name: '連續登入 30 天',
    description: '連續 30 天登入獎勵',
    icon: '⭐',
    category: 'bonus',
    basePoints: 200,
    limits: { monthlyMax: 1 },
    triggerType: 'auto',
    isActive: true,
    priority: 9,
  },
  {
    actionId: 'admin_adjust',
    name: '管理員調整',
    description: '管理員手動調整點數',
    icon: '⚙️',
    category: 'bonus',
    basePoints: 0,
    limits: {},
    triggerType: 'manual',
    isActive: true,
    priority: 99,
  },
];

// ========================================
// 預設兌換商品
// ========================================
const defaultRedeemableItems = [
  {
    name: '訂閱延長 7 天',
    description: '將您的訂閱期限延長 7 天',
    image: null,
    pointsCost: 200,
    stock: -1,
    stockUsed: 0,
    category: 'subscription',
    maxPerUser: -1,
    requiresShipping: false,
    autoAction: { type: 'extend_subscription', days: 7 },
    isActive: true,
    isFeatured: true,
    sortOrder: 1,
  },
  {
    name: '訂閱延長 30 天',
    description: '將您的訂閱期限延長 30 天',
    image: null,
    pointsCost: 700,
    stock: -1,
    stockUsed: 0,
    category: 'subscription',
    maxPerUser: -1,
    requiresShipping: false,
    autoAction: { type: 'extend_subscription', days: 30 },
    isActive: true,
    isFeatured: true,
    sortOrder: 2,
  },
  {
    name: 'Ultra Advisor 限定 T-Shirt',
    description: '黑色限定款 T-Shirt，尺寸可選 S/M/L/XL',
    image: 'https://placehold.co/400x400/1e293b/f59e0b?text=UA+Tee',
    pointsCost: 2000,
    stock: 50,
    stockUsed: 0,
    category: 'merchandise',
    maxPerUser: 1,
    requiresShipping: true,
    isActive: true,
    isFeatured: true,
    sortOrder: 3,
  },
  {
    name: 'Ultra Advisor 限定馬克杯',
    description: '霧黑質感馬克杯，容量 350ml',
    image: 'https://placehold.co/400x400/1e293b/3b82f6?text=UA+Mug',
    pointsCost: 1500,
    stock: 100,
    stockUsed: 0,
    category: 'merchandise',
    maxPerUser: 2,
    requiresShipping: true,
    isActive: true,
    isFeatured: false,
    sortOrder: 4,
  },
  {
    name: '1 對 1 功能諮詢 30 分鐘',
    description: '與產品團隊進行 30 分鐘線上諮詢',
    image: 'https://placehold.co/400x400/1e293b/22c55e?text=Consult',
    pointsCost: 3000,
    stock: 10,
    stockUsed: 0,
    category: 'experience',
    maxPerUser: 1,
    requiresShipping: false,
    isActive: true,
    isFeatured: true,
    sortOrder: 5,
  },
];

// ========================================
// 初始化函數
// ========================================

async function initMembershipTiers() {
  console.log('\n📋 開始初始化身分組...');
  
  const batch = writeBatch(db);
  const now = Timestamp.now();
  
  for (const tier of defaultTiers) {
    const docRef = doc(collection(db, 'membershipTiers'));
    batch.set(docRef, {
      ...tier,
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
    });
    console.log(`  ✅ ${tier.name}`);
  }
  
  await batch.commit();
  console.log('✅ 身分組初始化完成！');
}

async function initPointsRules() {
  console.log('\n📋 開始初始化點數規則...');
  
  const batch = writeBatch(db);
  const now = Timestamp.now();
  
  for (const rule of defaultPointsRules) {
    const docRef = doc(collection(db, 'pointsRules'));
    batch.set(docRef, {
      ...rule,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`  ✅ ${rule.name} (+${rule.basePoints})`);
  }
  
  await batch.commit();
  console.log('✅ 點數規則初始化完成！');
}

async function initRedeemableItems() {
  console.log('\n📋 開始初始化兌換商品...');
  
  const batch = writeBatch(db);
  const now = Timestamp.now();
  
  for (const item of defaultRedeemableItems) {
    const docRef = doc(collection(db, 'redeemableItems'));
    batch.set(docRef, {
      ...item,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`  ✅ ${item.name} (${item.pointsCost} UA)`);
  }
  
  await batch.commit();
  console.log('✅ 兌換商品初始化完成！');
}

async function migrateExistingUsers() {
  console.log('\n📋 開始遷移現有用戶...');
  
  const usersSnapshot = await getDocs(collection(db, 'users'));
  
  if (usersSnapshot.empty) {
    console.log('  ℹ️ 沒有現有用戶需要遷移');
    return;
  }
  
  const batch = writeBatch(db);
  let count = 0;
  
  usersSnapshot.docs.forEach((userDoc) => {
    const userData = userDoc.data();
    
    // 跳過已遷移的用戶
    if (userData.membershipTierIds) {
      console.log(`  ⏭️ ${userData.email} (已遷移)`);
      return;
    }
    
    // 根據現有 subscriptionStatus 對應身分組
    let primaryTierId = 'trial';
    if (userData.subscriptionStatus === 'paid') {
      primaryTierId = 'paid';
    } else if (userData.subscriptionStatus === 'expired') {
      primaryTierId = 'expired';
    }
    
    // 生成推薦碼
    const emailPrefix = userData.email?.split('@')[0]?.substring(0, 6) || 'user';
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const referralCode = `${emailPrefix}-${randomSuffix}`;
    
    batch.update(userDoc.ref, {
      membershipTierIds: [primaryTierId],
      primaryTierId: primaryTierId,
      points: 0,
      totalPointsEarned: 0,
      totalPointsSpent: 0,
      totalPointsExpired: 0,
      referralCode: referralCode,
      referralCount: 0,
      toolUsageCount: 0,
      loginStreak: 0,
    });
    
    console.log(`  ✅ ${userData.email} → ${primaryTierId} (推薦碼: ${referralCode})`);
    count++;
  });
  
  if (count > 0) {
    await batch.commit();
  }
  
  console.log(`✅ 用戶遷移完成！(${count} 位)`);
}

async function createEmptyCollections() {
  console.log('\n📋 建立空 Collections...');
  
  // 建立 pointsLedger 空 Collection
  const ledgerRef = doc(db, 'pointsLedger', '_init');
  await setDoc(ledgerRef, {
    _placeholder: true,
    createdAt: Timestamp.now(),
  });
  console.log('  ✅ pointsLedger');
  
  // 建立 auditLogs 空 Collection
  const auditRef = doc(db, 'auditLogs', '_init');
  await setDoc(auditRef, {
    _placeholder: true,
    createdAt: Timestamp.now(),
  });
  console.log('  ✅ auditLogs');
  
  // 建立 redemptionOrders 空 Collection
  const ordersRef = doc(db, 'redemptionOrders', '_init');
  await setDoc(ordersRef, {
    _placeholder: true,
    createdAt: Timestamp.now(),
  });
  console.log('  ✅ redemptionOrders');
  
  // 建立 referralCodes 空 Collection
  const codesRef = doc(db, 'referralCodes', '_init');
  await setDoc(codesRef, {
    _placeholder: true,
    createdAt: Timestamp.now(),
  });
  console.log('  ✅ referralCodes');
  
  console.log('✅ 空 Collections 建立完成！');
}

// ========================================
// 主程式
// ========================================

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  Ultra Advisor - Firestore 初始化腳本        ║');
  console.log('║  專案: grbt-f87fa                            ║');
  console.log('╚══════════════════════════════════════════════╝');
  
  try {
    // 執行初始化
    await initMembershipTiers();
    await initPointsRules();
    await initRedeemableItems();
    await createEmptyCollections();
    await migrateExistingUsers();
    
    console.log('\n═══════════════════════════════════════════════');
    console.log('🎉 所有初始化已完成！');
    console.log('═══════════════════════════════════════════════');
    console.log('\n現在可以重新整理後台頁面查看資料了！\n');
    
  } catch (error) {
    console.error('\n❌ 初始化失敗:', error.message);
    console.error(error);
    process.exit(1);
  }
  
  process.exit(0);
}

main();
