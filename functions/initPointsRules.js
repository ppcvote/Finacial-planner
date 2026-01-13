/**
 * Ultra Advisor - 初始化點數規則與會員身分組
 *
 * 執行方式：
 * 1. 先確保已安裝 firebase-admin: npm install firebase-admin
 * 2. 下載服務帳戶金鑰 JSON 並設定 GOOGLE_APPLICATION_CREDENTIALS 環境變數
 * 3. 執行: node scripts/initPointsRules.js
 *
 * 或者直接在 Firebase Console > Firestore 中手動建立這些文件
 */

const admin = require('firebase-admin');

// 初始化 Firebase Admin
// 注意：需要設定 GOOGLE_APPLICATION_CREDENTIALS 環境變數指向服務帳戶金鑰 JSON
admin.initializeApp();
const db = admin.firestore();

// ==========================================
// 點數規則 (pointsRules)
// ==========================================
const pointsRules = [
  {
    actionId: 'daily_login',
    name: '每日登入',
    description: '每日首次登入獲得點數',
    basePoints: 5,
    isActive: true,
    limits: {
      dailyMax: 1,  // 每天最多 1 次
    },
  },
  {
    actionId: 'tool_use',
    name: '使用工具',
    description: '使用理財工具獲得點數',
    basePoints: 10,
    isActive: true,
    limits: {
      dailyMax: 10,  // 每天最多 10 次
    },
  },
  {
    actionId: 'login_streak_7',
    name: '連續登入 7 天',
    description: '連續登入 7 天獲得額外獎勵',
    basePoints: 50,
    isActive: true,
    limits: {
      weeklyMax: 1,  // 每週最多 1 次
    },
  },
  {
    actionId: 'login_streak_30',
    name: '連續登入 30 天',
    description: '連續登入 30 天獲得額外獎勵',
    basePoints: 200,
    isActive: true,
    limits: {
      totalMax: 12,  // 一年最多 12 次
    },
  },
  {
    actionId: 'first_client',
    name: '建立首位客戶',
    description: '首次建立客戶檔案獲得點數',
    basePoints: 100,
    isActive: true,
    limits: {
      totalMax: 1,  // 總共只能 1 次
    },
  },
  {
    actionId: 'referral_success',
    name: '推薦成功',
    description: '成功推薦新用戶獲得點數',
    basePoints: 500,
    isActive: true,
    limits: null,  // 無限制
  },
  {
    actionId: 'referred_bonus',
    name: '被推薦獎勵',
    description: '透過推薦碼註冊獲得點數',
    basePoints: 500,
    isActive: true,
    limits: {
      totalMax: 1,  // 總共只能 1 次（只能被推薦一次）
    },
  },
];

// ==========================================
// 會員身分組 (membershipTiers)
// ==========================================
const membershipTiers = [
  {
    slug: 'founder',
    name: '創始會員',
    description: '平台創始會員，享有最高權限，不扣天數',
    color: '#f59e0b',
    icon: 'crown',
    priority: 100,
    pointsMultiplier: 2.0,
    permissions: {
      canEarnPoints: true,
      canSpendPoints: true,
      canCustomReferral: true,
      unlimitedClients: true,
      allToolsAccess: true,
    },
    tools: ['*'],  // 所有工具
  },
  {
    slug: 'paid',
    name: '付費會員',
    description: '有剩餘天數的付費會員',
    color: '#3b82f6',
    icon: 'star',
    priority: 80,
    pointsMultiplier: 1.5,
    permissions: {
      canEarnPoints: true,
      canSpendPoints: true,
      canCustomReferral: true,
      unlimitedClients: true,
      allToolsAccess: true,
    },
    tools: ['*'],  // 所有工具
  },
  {
    slug: 'referral_trial',
    name: '轉介紹試用',
    description: '有推薦碼註冊，7天試用，購買享折扣',
    color: '#8b5cf6',
    icon: 'gift',
    priority: 55,
    pointsMultiplier: 1.0,
    discountCode: 'Miiroll7',
    discountAmount: 999,
    permissions: {
      canEarnPoints: true,
      canSpendPoints: false,
      canCustomReferral: false,
      unlimitedClients: false,
      allToolsAccess: false,
    },
    tools: [
      'estate',
      'reservoir',
      'tax',
    ],  // 免費工具
    maxClients: 3,
  },
  {
    slug: 'trial',
    name: '試用會員',
    description: '一般註冊，7天試用',
    color: '#10b981',
    icon: 'clock',
    priority: 50,
    pointsMultiplier: 1.0,
    permissions: {
      canEarnPoints: true,
      canSpendPoints: false,
      canCustomReferral: false,
      unlimitedClients: false,
      allToolsAccess: false,
    },
    tools: [
      'estate',
      'reservoir',
      'tax',
    ],  // 免費工具
    maxClients: 3,
  },
  {
    slug: 'grace',
    name: '寬限期',
    description: '訂閱到期後的 7 天寬限期',
    color: '#f97316',
    icon: 'alert-triangle',
    priority: 30,
    pointsMultiplier: 0.5,
    permissions: {
      canEarnPoints: true,
      canSpendPoints: false,
      canCustomReferral: false,
      unlimitedClients: false,
      allToolsAccess: false,
    },
    tools: [
      'golden_safe',
      'estate',
      'reservoir',
      'tax',
    ],  // 更少工具
    maxClients: 1,
  },
  {
    slug: 'expired',
    name: '已過期',
    description: '訂閱已過期',
    color: '#ef4444',
    icon: 'x-circle',
    priority: 10,
    pointsMultiplier: 0,
    permissions: {
      canEarnPoints: false,
      canSpendPoints: false,
      canCustomReferral: false,
      unlimitedClients: false,
      allToolsAccess: false,
    },
    tools: [],  // 無工具存取
    maxClients: 0,
  },
];

// ==========================================
// 執行初始化
// ==========================================
async function init() {
  console.log('開始初始化點數規則與會員身分組...\n');

  // 建立點數規則
  console.log('建立點數規則...');
  for (const rule of pointsRules) {
    const docRef = db.collection('pointsRules').doc(rule.actionId);
    await docRef.set({
      ...rule,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`  ✓ ${rule.name} (${rule.actionId})`);
  }

  // 建立會員身分組
  console.log('\n建立會員身分組...');
  for (const tier of membershipTiers) {
    const docRef = db.collection('membershipTiers').doc(tier.slug);
    await docRef.set({
      ...tier,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`  ✓ ${tier.name} (${tier.slug})`);
  }

  console.log('\n✅ 初始化完成！');
  console.log('\n現在可以測試：');
  console.log('  1. 登入系統應該會觸發 +5 UA 點數');
  console.log('  2. 使用工具應該會觸發 +10 UA 點數（每日最多 10 次）');
  console.log('  3. 推薦好友雙方各得 +500 UA 點數');
}

init()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('初始化失敗:', error);
    process.exit(1);
  });
