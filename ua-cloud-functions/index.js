/**
 * Ultra Advisor - Cloud Functions
 * 會員系統 + UA 點數自動化
 * 
 * 部署指令：
 * cd functions
 * npm install
 * firebase deploy --only functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// 初始化 Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// ============================================
// 工具函數
// ============================================

/**
 * 取得用戶的點數倍率
 */
async function getUserMultiplier(userId) {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) return 1.0;
    
    const userData = userDoc.data();
    const primaryTierId = userData.primaryTierId || 'trial';
    
    // 查詢身分組的點數倍率
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
 * 檢查今日是否已達到限制
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
 * 檢查本週是否已達到限制
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
 * 檢查總計是否已達到限制
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
    // 取得規則
    const rule = await getPointsRule(actionId);
    if (!rule) {
      console.log(`Rule not found or inactive: ${actionId}`);
      return { success: false, reason: 'rule_not_found' };
    }
    
    // 檢查限制
    const limits = rule.limits || {};
    
    if (limits.dailyMax && await checkDailyLimit(userId, actionId, limits.dailyMax)) {
      console.log(`Daily limit reached for ${userId}: ${actionId}`);
      return { success: false, reason: 'daily_limit_reached' };
    }
    
    if (limits.weeklyMax && await checkWeeklyLimit(userId, actionId, limits.weeklyMax)) {
      console.log(`Weekly limit reached for ${userId}: ${actionId}`);
      return { success: false, reason: 'weekly_limit_reached' };
    }
    
    if (limits.totalMax && await checkTotalLimit(userId, actionId, limits.totalMax)) {
      console.log(`Total limit reached for ${userId}: ${actionId}`);
      return { success: false, reason: 'total_limit_reached' };
    }
    
    // 取得用戶資料
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return { success: false, reason: 'user_not_found' };
    }
    
    const userData = userDoc.data();
    
    // 檢查用戶是否可以獲得點數
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
    
    // 計算點數（含倍率）
    const multiplier = await getUserMultiplier(userId);
    const basePoints = rule.basePoints;
    const finalPoints = Math.floor(basePoints * multiplier);
    
    // 計算餘額
    const currentPoints = userData.points || 0;
    const newBalance = currentPoints + finalPoints;
    
    // 設定過期時間（12個月後）
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 12);
    
    // 使用 Transaction 確保資料一致性
    await db.runTransaction(async (transaction) => {
      // 建立點數帳本記錄
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
      
      // 更新用戶點數
      transaction.update(userRef, {
        points: newBalance,
        totalPointsEarned: admin.firestore.FieldValue.increment(finalPoints),
        lastPointsEarnedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
    
    console.log(`Awarded ${finalPoints} points to ${userId} for ${actionId}`);
    
    return {
      success: true,
      points: finalPoints,
      multiplier,
      newBalance,
    };
    
  } catch (error) {
    console.error('Error awarding points:', error);
    return { success: false, reason: 'error', error: error.message };
  }
}

// ============================================
// Cloud Functions
// ============================================

/**
 * 每日登入獎勵
 * 在前端登入成功後呼叫
 */
exports.onDailyLogin = functions.https.onCall(async (data, context) => {
  // 驗證登入狀態
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '請先登入');
  }
  
  const userId = context.auth.uid;
  
  // 更新登入時間
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    throw new functions.https.HttpsError('not-found', '用戶不存在');
  }
  
  const userData = userDoc.data();
  const lastLogin = userData.lastLoginAt?.toDate();
  const now = new Date();
  
  // 計算連續登入
  let newStreak = 1;
  if (lastLogin) {
    const lastLoginDate = new Date(lastLogin);
    lastLoginDate.setHours(0, 0, 0, 0);
    
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((today - lastLoginDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      // 連續登入
      newStreak = (userData.loginStreak || 0) + 1;
    } else if (diffDays === 0) {
      // 同一天，維持 streak
      newStreak = userData.loginStreak || 1;
    }
    // diffDays > 1 則重置為 1
  }
  
  // 更新登入資訊
  await userRef.update({
    lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
    loginStreak: newStreak,
  });
  
  // 發放每日登入獎勵
  const dailyResult = await awardPoints(userId, 'daily_login', '每日登入獎勵');
  
  // 檢查連續登入獎勵
  let streakResult = null;
  
  if (newStreak === 7) {
    streakResult = await awardPoints(userId, 'login_streak_7', '連續登入 7 天獎勵');
  } else if (newStreak === 30) {
    streakResult = await awardPoints(userId, 'login_streak_30', '連續登入 30 天獎勵');
  }
  
  return {
    success: true,
    loginStreak: newStreak,
    dailyReward: dailyResult,
    streakReward: streakResult,
  };
});

/**
 * 工具使用獎勵
 * 在使用工具後呼叫
 */
exports.onToolUse = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '請先登入');
  }
  
  const userId = context.auth.uid;
  const { toolName } = data;
  
  // 更新工具使用次數
  await db.collection('users').doc(userId).update({
    toolUsageCount: admin.firestore.FieldValue.increment(1),
  });
  
  // 發放點數
  const result = await awardPoints(
    userId, 
    'tool_use', 
    `使用工具: ${toolName || '未知工具'}`
  );
  
  return result;
});

/**
 * 建立首位客戶獎勵
 */
exports.onFirstClient = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '請先登入');
  }
  
  const userId = context.auth.uid;
  
  const result = await awardPoints(userId, 'first_client', '建立首位客戶獎勵');
  
  return result;
});

/**
 * 推薦獎勵處理（雙向獎勵）
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
  
  // 查詢推薦碼
  const codeDoc = await db.collection('referralCodes').doc(referralCode).get();
  
  if (!codeDoc.exists) {
    throw new functions.https.HttpsError('not-found', '推薦碼不存在');
  }
  
  const codeData = codeDoc.data();
  
  // 檢查是否自己推薦自己
  if (codeData.ownerId === newUserId) {
    throw new functions.https.HttpsError('invalid-argument', '不能使用自己的推薦碼');
  }
  
  // 檢查新用戶是否已經被推薦過
  const newUserDoc = await db.collection('users').doc(newUserId).get();
  if (newUserDoc.exists && newUserDoc.data().referredBy) {
    throw new functions.https.HttpsError('already-exists', '您已經使用過推薦碼');
  }
  
  const referrerId = codeData.ownerId;
  
  // 使用 Transaction
  await db.runTransaction(async (transaction) => {
    // 更新新用戶的推薦人
    transaction.update(db.collection('users').doc(newUserId), {
      referredBy: referrerId,
    });
    
    // 更新推薦人的推薦數
    transaction.update(db.collection('users').doc(referrerId), {
      referralCount: admin.firestore.FieldValue.increment(1),
    });
    
    // 更新推薦碼統計
    transaction.update(db.collection('referralCodes').doc(referralCode), {
      usageCount: admin.firestore.FieldValue.increment(1),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
  
  // 發放雙向獎勵
  const referrerReward = await awardPoints(
    referrerId, 
    'referral_success', 
    `推薦用戶成功`,
    newUserId
  );
  
  const newUserReward = await awardPoints(
    newUserId, 
    'referred_bonus', 
    `透過推薦碼註冊獎勵`,
    referrerId
  );
  
  return {
    success: true,
    referrerReward,
    newUserReward,
  };
});

/**
 * 更新推薦碼（用戶自訂）
 */
exports.updateReferralCode = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '請先登入');
  }
  
  const userId = context.auth.uid;
  const { newCode } = data;
  
  // 驗證推薦碼格式
  if (!newCode || newCode.length < 4 || newCode.length > 20) {
    throw new functions.https.HttpsError('invalid-argument', '推薦碼長度需為 4-20 字元');
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(newCode)) {
    throw new functions.https.HttpsError('invalid-argument', '推薦碼只能包含英文、數字、底線和橫線');
  }
  
  // 檢查用戶是否有權限自訂推薦碼
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
  
  // 檢查推薦碼是否已存在
  const existingCode = await db.collection('referralCodes').doc(newCode).get();
  if (existingCode.exists) {
    throw new functions.https.HttpsError('already-exists', '此推薦碼已被使用');
  }
  
  const oldCode = userData.referralCode;
  
  // 使用 Transaction
  await db.runTransaction(async (transaction) => {
    // 刪除舊推薦碼
    if (oldCode) {
      transaction.delete(db.collection('referralCodes').doc(oldCode));
    }
    
    // 建立新推薦碼
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
    
    // 更新用戶推薦碼
    transaction.update(db.collection('users').doc(userId), {
      referralCode: newCode,
    });
  });
  
  return { success: true, newCode };
});

// ============================================
// 排程任務（每日執行）
// ============================================

/**
 * 每日凌晨 3:00 檢查點數過期
 * 點數有效期：12 個月
 */
exports.expirePoints = functions.pubsub
  .schedule('0 3 * * *')
  .timeZone('Asia/Taipei')
  .onRun(async (context) => {
    console.log('Starting points expiration check...');
    
    const now = admin.firestore.Timestamp.now();
    
    // 查詢所有未過期但已超過到期時間的點數記錄
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
    
    // 按用戶分組處理
    const userExpiredPoints = {};
    
    expiredSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const userId = data.userId;
      
      if (!userExpiredPoints[userId]) {
        userExpiredPoints[userId] = {
          totalExpired: 0,
          entries: [],
        };
      }
      
      userExpiredPoints[userId].totalExpired += data.amount;
      userExpiredPoints[userId].entries.push({ id: doc.id, ...data });
    });
    
    // 處理每個用戶的過期點數
    for (const [userId, expiredData] of Object.entries(userExpiredPoints)) {
      try {
        await db.runTransaction(async (transaction) => {
          // 取得用戶資料
          const userRef = db.collection('users').doc(userId);
          const userDoc = await transaction.get(userRef);
          
          if (!userDoc.exists) return;
          
          const userData = userDoc.data();
          const currentPoints = userData.points || 0;
          
          // 扣除過期點數（不能扣成負數）
          const pointsToExpire = Math.min(expiredData.totalExpired, currentPoints);
          const newBalance = currentPoints - pointsToExpire;
          
          // 更新用戶點數
          transaction.update(userRef, {
            points: newBalance,
            totalPointsExpired: admin.firestore.FieldValue.increment(pointsToExpire),
          });
          
          // 標記點數記錄為已過期
          for (const entry of expiredData.entries) {
            transaction.update(db.collection('pointsLedger').doc(entry.id), {
              isExpired: true,
            });
          }
          
          // 建立過期記錄
          if (pointsToExpire > 0) {
            const expireLogRef = db.collection('pointsLedger').doc();
            transaction.set(expireLogRef, {
              userId,
              userEmail: userData.email,
              type: 'expire',
              amount: -pointsToExpire,
              balanceBefore: currentPoints,
              balanceAfter: newBalance,
              actionId: 'points_expired',
              reason: `點數過期（${expiredData.entries.length} 筆）`,
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
 * 每日凌晨 4:00 檢查會員到期
 * 到期 → 寬限期（7天）→ 過期
 */
exports.checkMembershipExpiry = functions.pubsub
  .schedule('0 4 * * *')
  .timeZone('Asia/Taipei')
  .onRun(async (context) => {
    console.log('Starting membership expiry check...');
    
    const now = new Date();
    const nowTimestamp = admin.firestore.Timestamp.fromDate(now);
    
    // 計算 7 天前（用於寬限期到期檢查）
    const gracePeriodEnd = new Date(now);
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() - 7);
    
    // 1. 查詢會員到期的用戶（需進入寬限期）
    const expiredMembersSnapshot = await db.collection('users')
      .where('primaryTierId', '==', 'paid')
      .where('membershipExpiresAt', '<=', nowTimestamp)
      .get();
    
    console.log(`Found ${expiredMembersSnapshot.size} expired paid members`);
    
    for (const doc of expiredMembersSnapshot.docs) {
      try {
        const userData = doc.data();
        
        // 更新為寬限期
        await doc.ref.update({
          primaryTierId: 'grace',
          membershipTierIds: ['grace'],
          graceStartedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        console.log(`User ${userData.email} moved to grace period`);
        
        // TODO: 發送通知（LINE、Email）
      } catch (error) {
        console.error(`Error processing expired member ${doc.id}:`, error);
      }
    }
    
    // 2. 查詢寬限期到期的用戶（需變成過期）
    const graceExpiredSnapshot = await db.collection('users')
      .where('primaryTierId', '==', 'grace')
      .where('graceStartedAt', '<=', admin.firestore.Timestamp.fromDate(gracePeriodEnd))
      .get();
    
    console.log(`Found ${graceExpiredSnapshot.size} grace period expired members`);
    
    for (const doc of graceExpiredSnapshot.docs) {
      try {
        const userData = doc.data();
        
        // 更新為已過期
        await doc.ref.update({
          primaryTierId: 'expired',
          membershipTierIds: ['expired'],
        });
        
        console.log(`User ${userData.email} moved to expired`);
        
        // TODO: 發送通知
      } catch (error) {
        console.error(`Error processing grace expired member ${doc.id}:`, error);
      }
    }
    
    console.log('Membership expiry check completed');
    return null;
  });

/**
 * 手動觸發活動獎勵（管理員用）
 */
exports.awardActivityPoints = functions.https.onCall(async (data, context) => {
  // 驗證管理員權限
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
  
  // 記錄操作日誌
  await db.collection('auditLogs').add({
    adminId: context.auth.uid,
    adminEmail: context.auth.token.email,
    action: 'user.points.award',
    targetType: 'user',
    targetId: userId,
    changes: {
      actionId,
      reason,
      result,
      description: `手動發放點數: ${actionId}`,
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  
  return result;
});

// ============================================
// 輔助 Functions
// ============================================

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
  
  // 取得最近的點數紀錄
  const recentLedger = await db.collection('pointsLedger')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(10)
    .get();
  
  // 取得即將過期的點數
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
  
  const expiringSnapshot = await db.collection('pointsLedger')
    .where('userId', '==', userId)
    .where('type', '==', 'earn')
    .where('isExpired', '==', false)
    .where('expiresAt', '<=', admin.firestore.Timestamp.fromDate(thirtyDaysLater))
    .get();
  
  let expiringPoints = 0;
  expiringSnapshot.docs.forEach((doc) => {
    expiringPoints += doc.data().amount;
  });
  
  return {
    currentPoints: userData.points || 0,
    totalEarned: userData.totalPointsEarned || 0,
    totalSpent: userData.totalPointsSpent || 0,
    totalExpired: userData.totalPointsExpired || 0,
    loginStreak: userData.loginStreak || 0,
    expiringIn30Days: expiringPoints,
    recentTransactions: recentLedger.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })),
  };
});

console.log('Ultra Advisor Cloud Functions loaded');
