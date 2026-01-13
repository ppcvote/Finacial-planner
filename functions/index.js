// ==========================================
// Ultra Advisor - 完整 Cloud Functions
// LINE Bot + 會員系統 + UA 點數
// ==========================================

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const crypto = require('crypto');

admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

// ==========================================
// 環境變數配置
// ==========================================

const LINE_CHANNEL_SECRET = functions.config().line?.channel_secret;
const LINE_CHANNEL_ACCESS_TOKEN = functions.config().line?.channel_access_token;
const APP_LOGIN_URL = functions.config().app?.login_url || 'https://ultra-advisor.tw';

// ==========================================
// 工具函數
// ==========================================

/**
 * 生成隨機密碼
 */
function generateRandomPassword() {
  const length = 10;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  if (!/[A-Z]/.test(password)) password = 'A' + password.slice(1);
  if (!/[a-z]/.test(password)) password = password.slice(0, -1) + 'a';
  if (!/[0-9]/.test(password)) password = password.slice(0, -1) + '1';
  return password;
}

/**
 * 生成推薦碼
 */
function generateReferralCode(email) {
  const emailPrefix = email?.split('@')[0]?.substring(0, 6) || 'user';
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${emailPrefix}-${randomSuffix}`;
}

/**
 * 驗證 Email 格式
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 驗證 LINE Webhook 簽章
 */
function validateSignature(body, signature) {
  if (!LINE_CHANNEL_SECRET) return false;
  const hash = crypto
    .createHmac('sha256', LINE_CHANNEL_SECRET)
    .update(body)
    .digest('base64');
  return hash === signature;
}

/**
 * 發送 LINE 訊息
 */
async function sendLineMessage(userId, messages) {
  if (!LINE_CHANNEL_ACCESS_TOKEN) {
    console.log('LINE token not configured, skipping message');
    return;
  }
  try {
    await axios.post(
      'https://api.line.me/v2/bot/message/push',
      { to: userId, messages: messages },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
        }
      }
    );
  } catch (error) {
    console.error('LINE message send error:', error.response?.data || error.message);
    throw error;
  }
}

// ==========================================
// 🆕 UA 點數系統 - 工具函數
// ==========================================

/**
 * 取得用戶的點數倍率
 */
async function getUserMultiplier(userId) {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) return 1.0;
    
    const userData = userDoc.data();
    const primaryTierId = userData.primaryTierId || 'trial';
    
    const tiersSnapshot = await db.collection('membershipTiers')
      .where('slug', '==', primaryTierId)
      .limit(1)
      .get();
    
    if (tiersSnapshot.empty) return 1.0;
    return tiersSnapshot.docs[0].data().pointsMultiplier || 1.0;
  } catch (error) {
    console.error('Error getting user multiplier:', error);
    return 1.0;
  }
}

/**
 * 取得點數規則
 */
async function getPointsRule(actionId) {
  try {
    const rulesSnapshot = await db.collection('pointsRules')
      .where('actionId', '==', actionId)
      .where('isActive', '==', true)
      .limit(1)
      .get();
    
    if (rulesSnapshot.empty) return null;
    return { id: rulesSnapshot.docs[0].id, ...rulesSnapshot.docs[0].data() };
  } catch (error) {
    console.error('Error getting points rule:', error);
    return null;
  }
}

/**
 * 檢查每日限制
 */
async function checkDailyLimit(userId, actionId, dailyMax) {
  if (!dailyMax) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const snapshot = await db.collection('pointsLedger')
    .where('userId', '==', userId)
    .where('actionId', '==', actionId)
    .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(today))
    .get();
  
  return snapshot.size >= dailyMax;
}

/**
 * 檢查每週限制
 */
async function checkWeeklyLimit(userId, actionId, weeklyMax) {
  if (!weeklyMax) return false;
  
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  weekStart.setHours(0, 0, 0, 0);
  
  const snapshot = await db.collection('pointsLedger')
    .where('userId', '==', userId)
    .where('actionId', '==', actionId)
    .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(weekStart))
    .get();
  
  return snapshot.size >= weeklyMax;
}

/**
 * 檢查總計限制
 */
async function checkTotalLimit(userId, actionId, totalMax) {
  if (!totalMax) return false;
  
  const snapshot = await db.collection('pointsLedger')
    .where('userId', '==', userId)
    .where('actionId', '==', actionId)
    .get();
  
  return snapshot.size >= totalMax;
}

/**
 * 發放點數（核心函數）
 */
async function awardPoints(userId, actionId, reason, referenceId = null) {
  try {
    const rule = await getPointsRule(actionId);
    if (!rule) {
      console.log(`Rule not found or inactive: ${actionId}`);
      return { success: false, reason: 'rule_not_found' };
    }
    
    const limits = rule.limits || {};
    
    if (limits.dailyMax && await checkDailyLimit(userId, actionId, limits.dailyMax)) {
      return { success: false, reason: 'daily_limit_reached' };
    }
    
    if (limits.weeklyMax && await checkWeeklyLimit(userId, actionId, limits.weeklyMax)) {
      return { success: false, reason: 'weekly_limit_reached' };
    }
    
    if (limits.totalMax && await checkTotalLimit(userId, actionId, limits.totalMax)) {
      return { success: false, reason: 'total_limit_reached' };
    }
    
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return { success: false, reason: 'user_not_found' };
    }
    
    const userData = userDoc.data();
    
    // 檢查身分組是否可獲得點數
    const tiersSnapshot = await db.collection('membershipTiers')
      .where('slug', '==', userData.primaryTierId || 'trial')
      .limit(1)
      .get();
    
    if (!tiersSnapshot.empty) {
      const tierData = tiersSnapshot.docs[0].data();
      if (!tierData.permissions?.canEarnPoints) {
        return { success: false, reason: 'tier_cannot_earn_points' };
      }
    }
    
    const multiplier = await getUserMultiplier(userId);
    const basePoints = rule.basePoints;
    const finalPoints = Math.floor(basePoints * multiplier);
    
    const currentPoints = typeof userData.points === 'object' ? (userData.points?.current || 0) : (userData.points || 0);
    const newBalance = currentPoints + finalPoints;
    
    // 12 個月後過期
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 12);
    
    await db.runTransaction(async (transaction) => {
      const ledgerRef = db.collection('pointsLedger').doc();
      transaction.set(ledgerRef, {
        userId,
        userEmail: userData.email,
        type: 'earn',
        amount: finalPoints,
        balanceBefore: currentPoints,
        balanceAfter: newBalance,
        actionId,
        reason: reason || rule.name,
        referenceType: 'rule',
        referenceId: referenceId || rule.id,
        multiplierApplied: multiplier,
        baseAmount: basePoints,
        expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
        isExpired: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: 'system',
      });
      
      transaction.update(userRef, {
        'points.current': newBalance,
        totalPointsEarned: admin.firestore.FieldValue.increment(finalPoints),
        lastPointsEarnedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
    
    console.log(`Awarded ${finalPoints} points to ${userId} for ${actionId}`);
    
    return { success: true, points: finalPoints, multiplier, newBalance };
    
  } catch (error) {
    console.error('Error awarding points:', error);
    return { success: false, reason: 'error', error: error.message };
  }
}

// ==========================================
// LINE Bot - 核心功能
// ==========================================

/**
 * 創建試用帳號
 */
async function createTrialAccount(email, lineUserId) {
  try {
    const existingUsers = await auth.getUserByEmail(email).catch(() => null);
    if (existingUsers) {
      throw new Error('此 Email 已經註冊');
    }

    const password = generateRandomPassword();
    const referralCode = generateReferralCode(email);

    const userRecord = await auth.createUser({
      email: email,
      password: password,
      emailVerified: false,
      disabled: false
    });

    const now = admin.firestore.Timestamp.now();
    const expiresAt = admin.firestore.Timestamp.fromMillis(
      now.toMillis() + 7 * 24 * 60 * 60 * 1000
    );

    // 🆕 新增身分組和點數欄位
    await db.collection('users').doc(userRecord.uid).set({
      email: email,
      createdAt: now,
      trialExpiresAt: expiresAt,
      subscriptionStatus: 'trial',
      lineUserId: lineUserId,
      isActive: true,
      clients: [],
      stats: { trialsCompleted: 0, hoursSaved: 0 },
      // 🆕 身分組
      membershipTierIds: ['trial'],
      primaryTierId: 'trial',
      // 🆕 UA 點數
      points: { current: 0 },
      totalPointsEarned: 0,
      totalPointsSpent: 0,
      totalPointsExpired: 0,
      // 🆕 推薦系統
      referralCode: referralCode,
      referralCount: 0,
      // 🆕 追蹤
      toolUsageCount: 0,
      loginStreak: 0,
    });

    // 🆕 建立推薦碼索引
    await db.collection('referralCodes').doc(referralCode).set({
      ownerId: userRecord.uid,
      ownerEmail: email,
      usageCount: 0,
      successCount: 0,
      totalPointsGenerated: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    const loginUrl = APP_LOGIN_URL;
    await sendLineMessage(lineUserId, [
      {
        type: 'flex',
        altText: '🎉 你的試用帳號已開通！',
        contents: {
          type: 'bubble',
          hero: {
            type: 'box',
            layout: 'vertical',
            contents: [{ type: 'text', text: '🎉 帳號開通成功', size: 'xl', weight: 'bold', color: '#ffffff' }],
            backgroundColor: '#3b82f6',
            paddingAll: '20px'
          },
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              { type: 'text', text: '登入資訊', weight: 'bold', size: 'md', margin: 'md' },
              {
                type: 'box',
                layout: 'vertical',
                margin: 'lg',
                spacing: 'sm',
                contents: [
                  { type: 'box', layout: 'baseline', spacing: 'sm', contents: [
                    { type: 'text', text: 'Email', color: '#64748b', size: 'sm', flex: 2 },
                    { type: 'text', text: email, wrap: true, color: '#1e293b', size: 'sm', flex: 5 }
                  ]},
                  { type: 'box', layout: 'baseline', spacing: 'sm', contents: [
                    { type: 'text', text: '試用期', color: '#64748b', size: 'sm', flex: 2 },
                    { type: 'text', text: '7 天', wrap: true, color: '#1e293b', size: 'sm', flex: 5 }
                  ]},
                  { type: 'box', layout: 'baseline', spacing: 'sm', contents: [
                    { type: 'text', text: '推薦碼', color: '#64748b', size: 'sm', flex: 2 },
                    { type: 'text', text: referralCode, wrap: true, color: '#f59e0b', size: 'sm', flex: 5, weight: 'bold' }
                  ]}
                ]
              }
            ]
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
              { type: 'button', style: 'primary', height: 'sm', action: { type: 'uri', label: '立即登入', uri: loginUrl }},
              { type: 'box', layout: 'baseline', contents: [
                { type: 'text', text: '⚠️ 密碼將在下一則訊息單獨傳送', color: '#64748b', size: 'xs', wrap: true }
              ], margin: 'md' }
            ]
          }
        }
      },
      {
        type: 'text',
        text: `🔐 你的登入密碼（請妥善保管）：\n\n${password}\n\n⚠️ 請立即登入並修改密碼以確保安全\n\n📢 分享你的推薦碼「${referralCode}」給朋友，雙方都能獲得 500 UA 點！`
      }
    ]);

    console.log(`Trial account created: ${email}`);
    return { success: true, uid: userRecord.uid, email: email, expiresAt: expiresAt.toMillis() };

  } catch (error) {
    console.error('Create trial account error:', error);
    throw error;
  }
}

// ==========================================
// LINE Webhook
// ==========================================

exports.lineWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const signature = req.headers['x-line-signature'];
  const body = JSON.stringify(req.body);
  
  if (!validateSignature(body, signature)) {
    console.error('Invalid signature');
    return res.status(401).send('Invalid signature');
  }

  const events = req.body.events;

  try {
    await Promise.all(events.map(handleEvent));
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
});

async function handleEvent(event) {
  const userId = event.source.userId;

  if (event.type === 'follow') {
    await sendLineMessage(userId, [
      {
        type: 'text',
        text: '🎉 歡迎加入 Ultra Advisor！\n\n我是你的專屬 AI 財務軍師\n━━━━━━━━━━━━━━\n\n💎 立即獲得 7 天免費試用\n✓ 18 種專業理財工具\n✓ 無限客戶檔案\n✓ AI 智能建議\n\n🎁 推薦好友雙方各得 500 UA 點！\n\n━━━━━━━━━━━━━━\n\n📧 請直接傳送你的 Email 開始試用！'
      }
    ]);
    return;
  }

  if (event.type === 'message' && event.message.type === 'text') {
    const userMessage = event.message.text.trim();

    if (isValidEmail(userMessage)) {
      try {
        await sendLineMessage(userId, [{ type: 'text', text: '⏳ 正在為你開通帳號，請稍候...' }]);
        await createTrialAccount(userMessage, userId);
      } catch (error) {
        console.error('Account creation error:', error);
        let errorMessage = '❌ 帳號開通失敗，請稍後再試';
        if (error.message.includes('已經註冊')) {
          errorMessage = '⚠️ 此 Email 已經註冊過試用帳號！\n\n如需協助請聯繫客服';
        }
        await sendLineMessage(userId, [{ type: 'text', text: errorMessage }]);
      }
    } else {
      await sendLineMessage(userId, [
        { type: 'text', text: '⚠️ Email 格式不正確！請重新傳送正確的 Email\n\n範例：your@email.com' }
      ]);
    }
  }
}

// ==========================================
// 🆕 UA 點數系統 - Cloud Functions
// ==========================================

/**
 * 每日登入獎勵
 */
exports.onDailyLogin = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '請先登入');
  }
  
  const userId = context.auth.uid;
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    throw new functions.https.HttpsError('not-found', '用戶不存在');
  }
  
  const userData = userDoc.data();
  const lastLogin = userData.lastLoginAt?.toDate();
  const now = new Date();
  
  let newStreak = 1;
  if (lastLogin) {
    const lastLoginDate = new Date(lastLogin);
    lastLoginDate.setHours(0, 0, 0, 0);
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today - lastLoginDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      newStreak = (userData.loginStreak || 0) + 1;
    } else if (diffDays === 0) {
      newStreak = userData.loginStreak || 1;
    }
  }
  
  await userRef.update({
    lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
    loginStreak: newStreak,
  });
  
  const dailyResult = await awardPoints(userId, 'daily_login', '每日登入獎勵');
  
  let streakResult = null;
  if (newStreak === 7) {
    streakResult = await awardPoints(userId, 'login_streak_7', '連續登入 7 天獎勵');
  } else if (newStreak === 30) {
    streakResult = await awardPoints(userId, 'login_streak_30', '連續登入 30 天獎勵');
  }
  
  return { success: true, loginStreak: newStreak, dailyReward: dailyResult, streakReward: streakResult };
});

/**
 * 工具使用獎勵
 */
exports.onToolUse = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '請先登入');
  }
  
  const userId = context.auth.uid;
  const { toolName } = data;
  
  await db.collection('users').doc(userId).update({
    toolUsageCount: admin.firestore.FieldValue.increment(1),
  });
  
  return await awardPoints(userId, 'tool_use', `使用工具: ${toolName || '未知工具'}`);
});

/**
 * 建立首位客戶獎勵
 */
exports.onFirstClient = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '請先登入');
  }
  return await awardPoints(context.auth.uid, 'first_client', '建立首位客戶獎勵');
});

/**
 * 推薦獎勵處理（雙向）
 */
exports.processReferral = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '請先登入');
  }
  
  const { referralCode } = data;
  const newUserId = context.auth.uid;
  
  if (!referralCode) {
    throw new functions.https.HttpsError('invalid-argument', '請提供推薦碼');
  }
  
  const codeDoc = await db.collection('referralCodes').doc(referralCode).get();
  if (!codeDoc.exists) {
    throw new functions.https.HttpsError('not-found', '推薦碼不存在');
  }
  
  const codeData = codeDoc.data();
  
  if (codeData.ownerId === newUserId) {
    throw new functions.https.HttpsError('invalid-argument', '不能使用自己的推薦碼');
  }
  
  const newUserDoc = await db.collection('users').doc(newUserId).get();
  if (newUserDoc.exists && newUserDoc.data().referredBy) {
    throw new functions.https.HttpsError('already-exists', '您已經使用過推薦碼');
  }
  
  const referrerId = codeData.ownerId;
  
  await db.runTransaction(async (transaction) => {
    transaction.update(db.collection('users').doc(newUserId), { referredBy: referrerId });
    transaction.update(db.collection('users').doc(referrerId), {
      referralCount: admin.firestore.FieldValue.increment(1),
    });
    transaction.update(db.collection('referralCodes').doc(referralCode), {
      usageCount: admin.firestore.FieldValue.increment(1),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
  
  const referrerReward = await awardPoints(referrerId, 'referral_success', '推薦用戶成功', newUserId);
  const newUserReward = await awardPoints(newUserId, 'referred_bonus', '透過推薦碼註冊獎勵', referrerId);
  
  return { success: true, referrerReward, newUserReward };
});

/**
 * 更新推薦碼
 */
exports.updateReferralCode = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '請先登入');
  }
  
  const userId = context.auth.uid;
  const { newCode } = data;
  
  if (!newCode || newCode.length < 4 || newCode.length > 20) {
    throw new functions.https.HttpsError('invalid-argument', '推薦碼長度需為 4-20 字元');
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(newCode)) {
    throw new functions.https.HttpsError('invalid-argument', '推薦碼只能包含英文、數字、底線和橫線');
  }
  
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();
  
  const tiersSnapshot = await db.collection('membershipTiers')
    .where('slug', '==', userData.primaryTierId || 'trial')
    .limit(1)
    .get();
  
  if (!tiersSnapshot.empty) {
    const tierData = tiersSnapshot.docs[0].data();
    if (!tierData.permissions?.canCustomReferral) {
      throw new functions.https.HttpsError('permission-denied', '您的會員等級無法自訂推薦碼');
    }
  }
  
  const existingCode = await db.collection('referralCodes').doc(newCode).get();
  if (existingCode.exists) {
    throw new functions.https.HttpsError('already-exists', '此推薦碼已被使用');
  }
  
  const oldCode = userData.referralCode;
  
  await db.runTransaction(async (transaction) => {
    if (oldCode) {
      transaction.delete(db.collection('referralCodes').doc(oldCode));
    }
    transaction.set(db.collection('referralCodes').doc(newCode), {
      ownerId: userId,
      ownerEmail: userData.email,
      usageCount: 0,
      successCount: 0,
      totalPointsGenerated: 0,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    transaction.update(db.collection('users').doc(userId), { referralCode: newCode });
  });
  
  return { success: true, newCode };
});

/**
 * 取得用戶點數摘要
 */
exports.getUserPointsSummary = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '請先登入');
  }
  
  const userId = context.auth.uid;
  const userDoc = await db.collection('users').doc(userId).get();
  
  if (!userDoc.exists) {
    throw new functions.https.HttpsError('not-found', '用戶不存在');
  }
  
  const userData = userDoc.data();
  
  const recentLedger = await db.collection('pointsLedger')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(10)
    .get();
  
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
  
  const expiringSnapshot = await db.collection('pointsLedger')
    .where('userId', '==', userId)
    .where('type', '==', 'earn')
    .where('isExpired', '==', false)
    .where('expiresAt', '<=', admin.firestore.Timestamp.fromDate(thirtyDaysLater))
    .get();
  
  let expiringPoints = 0;
  expiringSnapshot.docs.forEach((doc) => { expiringPoints += doc.data().amount; });
  
  return {
    currentPoints: typeof userData.points === 'object' ? (userData.points?.current || 0) : (userData.points || 0),
    totalEarned: userData.totalPointsEarned || 0,
    totalSpent: userData.totalPointsSpent || 0,
    totalExpired: userData.totalPointsExpired || 0,
    loginStreak: userData.loginStreak || 0,
    referralCode: userData.referralCode,
    referralCount: userData.referralCount || 0,
    expiringIn30Days: expiringPoints,
    recentTransactions: recentLedger.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })),
  };
});

/**
 * 管理員手動發放獎勵
 */
exports.awardActivityPoints = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '請先登入');
  }
  
  const adminDoc = await db.collection('admins').doc(context.auth.uid).get();
  if (!adminDoc.exists) {
    throw new functions.https.HttpsError('permission-denied', '需要管理員權限');
  }
  
  const { userId, actionId, reason } = data;
  
  if (!userId || !actionId) {
    throw new functions.https.HttpsError('invalid-argument', '請提供 userId 和 actionId');
  }
  
  const result = await awardPoints(userId, actionId, reason || '管理員發放');
  
  await db.collection('auditLogs').add({
    adminId: context.auth.uid,
    adminEmail: context.auth.token.email,
    action: 'user.points.award',
    targetType: 'user',
    targetId: userId,
    changes: { actionId, reason, result, description: `手動發放點數: ${actionId}` },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  
  return result;
});

// ==========================================
// 定時任務
// ==========================================

/**
 * 檢查試用到期（每天早上 9:00）
 */
exports.checkTrialExpiration = functions.pubsub
  .schedule('0 9 * * *')
  .timeZone('Asia/Taipei')
  .onRun(async (context) => {
    console.log('Running trial expiration check...');
    const now = admin.firestore.Timestamp.now();
    const threeDaysLater = admin.firestore.Timestamp.fromMillis(now.toMillis() + 3 * 24 * 60 * 60 * 1000);

    try {
      const threeDaysSnapshot = await db.collection('users')
        .where('subscriptionStatus', '==', 'trial')
        .where('trialExpiresAt', '<=', threeDaysLater)
        .where('trialExpiresAt', '>', now)
        .get();

      for (const doc of threeDaysSnapshot.docs) {
        const userData = doc.data();
        const daysRemaining = Math.ceil((userData.trialExpiresAt.toMillis() - now.toMillis()) / (24 * 60 * 60 * 1000));

        if ((daysRemaining === 3 || daysRemaining === 1) && userData.lineUserId) {
          await sendLineMessage(userData.lineUserId, [{
            type: 'text',
            text: `⏰ 試用期剩餘 ${daysRemaining} 天\n\n立即升級：https://portaly.cc/GinRollBT`
          }]);
        }
      }
      console.log(`Sent ${threeDaysSnapshot.size} expiration reminders`);
    } catch (error) {
      console.error('Trial expiration check error:', error);
    }
    return null;
  });

/**
 * 刪除過期帳號（每天凌晨 2:00）
 */
exports.deleteExpiredAccounts = functions.pubsub
  .schedule('0 2 * * *')
  .timeZone('Asia/Taipei')
  .onRun(async (context) => {
    console.log('Running expired accounts deletion...');
    const now = admin.firestore.Timestamp.now();

    try {
      const expiredSnapshot = await db.collection('users')
        .where('subscriptionStatus', '==', 'trial')
        .where('trialExpiresAt', '<=', now)
        .get();

      for (const doc of expiredSnapshot.docs) {
        const userData = doc.data();
        const uid = doc.id;

        try {
          await db.collection('backups').doc(uid).set({
            backedUpAt: now,
            expiresAt: admin.firestore.Timestamp.fromMillis(now.toMillis() + 30 * 24 * 60 * 60 * 1000),
            userData: userData
          });

          await doc.ref.delete();
          await auth.deleteUser(uid);

          if (userData.lineUserId) {
            await sendLineMessage(userData.lineUserId, [{
              type: 'text',
              text: '試用期已結束\n\n立即訂閱：https://portaly.cc/GinRollBT'
            }]);
          }
          console.log(`Deleted expired account: ${userData.email}`);
        } catch (error) {
          console.error(`Error deleting account ${uid}:`, error);
        }
      }
      console.log(`Deleted ${expiredSnapshot.size} expired accounts`);
    } catch (error) {
      console.error('Delete expired accounts error:', error);
    }
    return null;
  });

/**
 * 清理過期備份（每天凌晨 3:00）
 */
exports.cleanupExpiredBackups = functions.pubsub
  .schedule('0 3 * * *')
  .timeZone('Asia/Taipei')
  .onRun(async (context) => {
    console.log('Running expired backups cleanup...');
    const now = admin.firestore.Timestamp.now();

    try {
      const expiredBackups = await db.collection('backups').where('expiresAt', '<=', now).get();
      const batch = db.batch();
      expiredBackups.docs.forEach(doc => { batch.delete(doc.ref); });
      await batch.commit();
      console.log(`Cleaned up ${expiredBackups.size} expired backups`);
    } catch (error) {
      console.error('Cleanup expired backups error:', error);
    }
    return null;
  });

/**
 * 🆕 點數過期檢查（每天凌晨 3:30）
 */
exports.expirePoints = functions.pubsub
  .schedule('30 3 * * *')
  .timeZone('Asia/Taipei')
  .onRun(async (context) => {
    console.log('Starting points expiration check...');
    const now = admin.firestore.Timestamp.now();
    
    const expiredSnapshot = await db.collection('pointsLedger')
      .where('type', '==', 'earn')
      .where('isExpired', '==', false)
      .where('expiresAt', '<=', now)
      .get();
    
    if (expiredSnapshot.empty) {
      console.log('No expired points found');
      return null;
    }
    
    console.log(`Found ${expiredSnapshot.size} expired point entries`);
    
    const userExpiredPoints = {};
    expiredSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (!userExpiredPoints[data.userId]) {
        userExpiredPoints[data.userId] = { totalExpired: 0, entries: [] };
      }
      userExpiredPoints[data.userId].totalExpired += data.amount;
      userExpiredPoints[data.userId].entries.push({ id: doc.id, ...data });
    });
    
    for (const [userId, expiredData] of Object.entries(userExpiredPoints)) {
      try {
        await db.runTransaction(async (transaction) => {
          const userRef = db.collection('users').doc(userId);
          const userDoc = await transaction.get(userRef);
          if (!userDoc.exists) return;
          
          const userData = userDoc.data();
          const currentPoints = typeof userData.points === 'object' ? (userData.points?.current || 0) : (userData.points || 0);
          const pointsToExpire = Math.min(expiredData.totalExpired, currentPoints);

          transaction.update(userRef, {
            'points.current': currentPoints - pointsToExpire,
            totalPointsExpired: admin.firestore.FieldValue.increment(pointsToExpire),
          });
          
          for (const entry of expiredData.entries) {
            transaction.update(db.collection('pointsLedger').doc(entry.id), { isExpired: true });
          }
          
          if (pointsToExpire > 0) {
            transaction.set(db.collection('pointsLedger').doc(), {
              userId,
              userEmail: userData.email,
              type: 'expire',
              amount: -pointsToExpire,
              balanceBefore: currentPoints,
              balanceAfter: currentPoints - pointsToExpire,
              actionId: 'points_expired',
              reason: `點數過期`,
              referenceType: 'system',
              isExpired: false,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              createdBy: 'system',
            });
          }
        });
        console.log(`Expired ${expiredData.totalExpired} points for user ${userId}`);
      } catch (error) {
        console.error(`Error processing expired points for ${userId}:`, error);
      }
    }
    
    console.log('Points expiration check completed');
    return null;
  });

/**
 * 🆕 會員到期檢查（每天凌晨 4:00）
 */
exports.checkMembershipExpiry = functions.pubsub
  .schedule('0 4 * * *')
  .timeZone('Asia/Taipei')
  .onRun(async (context) => {
    console.log('Starting membership expiry check...');
    const now = new Date();
    const nowTimestamp = admin.firestore.Timestamp.fromDate(now);
    
    const gracePeriodEnd = new Date(now);
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() - 7);
    
    // 付費 → 寬限
    const expiredMembers = await db.collection('users')
      .where('primaryTierId', '==', 'paid')
      .where('membershipExpiresAt', '<=', nowTimestamp)
      .get();
    
    for (const doc of expiredMembers.docs) {
      try {
        const userData = doc.data();
        await doc.ref.update({
          primaryTierId: 'grace',
          membershipTierIds: ['grace'],
          graceStartedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        if (userData.lineUserId) {
          await sendLineMessage(userData.lineUserId, [{
            type: 'text',
            text: '⚠️ 訂閱已到期，進入 7 天寬限期\n\n續訂：https://portaly.cc/GinRollBT'
          }]);
        }
        console.log(`User ${userData.email} moved to grace period`);
      } catch (error) {
        console.error(`Error:`, error);
      }
    }
    
    // 寬限 → 過期
    const graceExpired = await db.collection('users')
      .where('primaryTierId', '==', 'grace')
      .where('graceStartedAt', '<=', admin.firestore.Timestamp.fromDate(gracePeriodEnd))
      .get();
    
    for (const doc of graceExpired.docs) {
      try {
        await doc.ref.update({
          primaryTierId: 'expired',
          membershipTierIds: ['expired'],
        });
        console.log(`User ${doc.data().email} moved to expired`);
      } catch (error) {
        console.error(`Error:`, error);
      }
    }
    
    console.log('Membership expiry check completed');
    return null;
  });

console.log('Ultra Advisor Cloud Functions loaded');