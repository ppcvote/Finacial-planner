/**
 * Ultra Advisor - 初始化任務看板
 *
 * 執行方式：
 * 1. 先確保已安裝 firebase-admin: npm install firebase-admin
 * 2. 下載服務帳戶金鑰 JSON 並設定 GOOGLE_APPLICATION_CREDENTIALS 環境變數
 * 3. 執行: node functions/initMissions.js
 *
 * 或者直接在 Firebase Console > Firestore 中手動建立這些文件
 */

const admin = require('firebase-admin');

// 初始化 Firebase Admin
// 使用專案 ID 初始化
admin.initializeApp({
  projectId: 'grbt-f87fa',
});
const db = admin.firestore();

// ==========================================
// 預設任務清單
// ==========================================
const missions = [
  {
    id: 'set_avatar',
    title: '設定個人頭像',
    description: '上傳一張專業的個人照片，讓客戶更認識你',
    icon: '📸',
    points: 20,
    category: 'onboarding',
    order: 1,
    linkType: 'modal',
    linkTarget: 'editProfile',
    verificationType: 'auto',
    verificationField: 'photoURL',
    verificationCondition: null,
    repeatType: 'once',
    isActive: true,
  },
  {
    id: 'set_display_name',
    title: '設定顯示名稱',
    description: '設定您的顯示名稱，讓系統更好地稱呼您',
    icon: '📝',
    points: 15,
    category: 'onboarding',
    order: 2,
    linkType: 'modal',
    linkTarget: 'editProfile',
    verificationType: 'auto',
    verificationField: 'displayName',
    verificationCondition: null,
    repeatType: 'once',
    isActive: true,
  },
  {
    id: 'first_client',
    title: '建立第一位客戶',
    description: '新增您的第一位客戶，開始使用理財工具',
    icon: '👤',
    points: 20,
    category: 'onboarding',
    order: 3,
    linkType: 'internal',
    linkTarget: '/clients',
    verificationType: 'auto',
    verificationField: 'clients',
    verificationCondition: 'count>=1',
    repeatType: 'once',
    isActive: true,
  },
  {
    id: 'join_line_official',
    title: '加入 LINE 官方帳號',
    description: '加入 Ultra Advisor 官方 LINE，獲取最新資訊',
    icon: '💬',
    points: 20,
    category: 'social',
    order: 1,
    linkType: 'external',
    linkTarget: 'https://line.me/R/ti/p/@ultraadvisor',
    verificationType: 'auto',
    verificationField: 'lineUserId',
    verificationCondition: null,
    repeatType: 'once',
    isActive: true,
  },
  {
    id: 'join_line_community',
    title: '加入 LINE 戰友社群',
    description: '加入顧問戰友社群，與同行交流經驗',
    icon: '👥',
    points: 25,
    category: 'social',
    order: 2,
    linkType: 'external',
    linkTarget: 'https://line.me/ti/g2/9Cca20iCP8J0KrmVRg5GOe1n5dSatYKO8ETTHw?utm_source=invitation&utm_medium=link_copy&utm_campaign=default',
    verificationType: 'manual',
    verificationField: null,
    verificationCondition: null,
    repeatType: 'once',
    isActive: true,
  },
  {
    id: 'pwa_install',
    title: '將 Ultra 加入主畫面',
    description: '將 Ultra Advisor 加入手機主畫面，隨時快速開啟',
    icon: '📱',
    points: 30,
    category: 'habit',
    order: 1,
    linkType: 'pwa',
    linkTarget: null,
    verificationType: 'manual',
    verificationField: null,
    verificationCondition: null,
    repeatType: 'once',
    isActive: true,
  },
  {
    id: 'use_cheat_sheet_3',
    title: '使用 3 次業務小抄',
    description: '善用業務小抄功能，快速掌握話術要點',
    icon: '📋',
    points: 15,
    category: 'habit',
    order: 2,
    linkType: 'internal',
    linkTarget: '/tools',
    verificationType: 'auto',
    verificationField: 'cheatSheetUsageCount',
    verificationCondition: 'count>=3',
    repeatType: 'once',
    isActive: true,
  },
  {
    id: 'daily_login',
    title: '每日登入',
    description: '每天登入系統，培養使用習慣',
    icon: '📅',
    points: 5,
    category: 'daily',
    order: 1,
    linkType: null,
    linkTarget: null,
    verificationType: 'auto',
    verificationField: 'lastLoginDate',
    verificationCondition: 'today',
    repeatType: 'daily',
    isActive: true,
  },
];

// ==========================================
// 執行初始化
// ==========================================
async function init() {
  console.log('開始初始化任務看板...\n');

  const now = admin.firestore.Timestamp.now();

  // 建立任務
  console.log('建立任務...');
  for (const mission of missions) {
    const { id, ...missionData } = mission;
    const docRef = db.collection('missions').doc(id);
    await docRef.set({
      ...missionData,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`  ✓ ${mission.title} (${id})`);
  }

  console.log('\n✅ 任務看板初始化完成！');
  console.log(`\n共建立 ${missions.length} 個任務：`);
  console.log('  - 新手任務 (onboarding): 3 個');
  console.log('  - 社交任務 (social): 2 個');
  console.log('  - 習慣任務 (habit): 2 個');
  console.log('  - 每日任務 (daily): 1 個');
}

init()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('初始化失敗:', error);
    process.exit(1);
  });
