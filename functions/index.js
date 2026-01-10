// ==========================================
// 🤖 Ultra Advisor - 試用帳號自動化系統
// Firebase Cloud Functions
// ==========================================

// 載入環境變數（開發環境用）
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const crypto = require('crypto');

admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

// ==========================================
// 📝 環境變數設定
// 在 functions 資料夾創建 .env 文件，包含：
// LINE_CHANNEL_SECRET=your_secret
// LINE_CHANNEL_ACCESS_TOKEN=your_token
// APP_LOGIN_URL=https://your-app.com/login
// 
// 注意：暫時不使用 Email 發送，只用 LINE 通知
// ==========================================

const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const APP_LOGIN_URL = process.env.APP_LOGIN_URL || 'https://ultra-advisor.com/login';

// ==========================================
// 🔧 工具函數
// ==========================================

/**
 * 生成隨機密碼（8-12位，包含大小寫字母和數字）
 */
function generateRandomPassword() {
  const length = 10;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  // 確保至少有一個大寫、一個小寫、一個數字
  if (!/[A-Z]/.test(password)) password = 'A' + password.slice(1);
  if (!/[a-z]/.test(password)) password = password.slice(0, -1) + 'a';
  if (!/[0-9]/.test(password)) password = password.slice(0, -1) + '1';
  return password;
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
  try {
    await axios.post(
      'https://api.line.me/v2/bot/message/push',
      {
        to: userId,
        messages: messages
      },
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

/**
 * 發送 Email（暫時停用，改用 LINE 發送）
 * 未來可啟用免費 Email 服務
 */
async function sendEmail(to, subject, html) {
  // 暫時註解掉 Email 發送功能
  // 未來可以改用 Resend 或其他免費服務
  console.log(`[SKIPPED] Email to ${to}: ${subject}`);
  console.log('目前使用 LINE 發送所有通知');
  return; // 直接返回，不發送 Email
  
  /* 未來啟用時取消註解
  try {
    await axios.post(
      'https://api.sendgrid.com/v3/mail/send',
      {
        personalizations: [{ to: [{ email: to }] }],
        from: { email: 'noreply@ultraadvisor.com', name: 'Ultra Advisor' },
        subject: subject,
        content: [{ type: 'text/html', value: html }]
      },
      {
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('SendGrid error:', error.response?.data || error.message);
    throw error;
  }
  */
}

/**
 * 生成歡迎 Email HTML
 */
function generateWelcomeEmailHTML(email, password, expiresAt) {
  const loginUrl = `${APP_LOGIN_URL}?email=${encodeURIComponent(email)}`;
  const expiresDateStr = new Date(expiresAt).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 12px; }
    .content { background: #f8fafc; padding: 30px; border-radius: 12px; margin: 20px 0; }
    .info-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #3b82f6; }
    .button { display: inline-block; background: #3b82f6; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; color: #64748b; font-size: 14px; margin-top: 30px; }
    .checklist { list-style: none; padding: 0; }
    .checklist li { padding: 8px 0; }
    .checklist li:before { content: "✅ "; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 歡迎使用 Ultra Advisor！</h1>
      <p>你的試用帳號已成功開通</p>
    </div>
    
    <div class="content">
      <h2>你的登入資訊</h2>
      
      <div class="info-box">
        <p><strong>📧 Email:</strong> ${email}</p>
        <p><strong>🔑 臨時密碼:</strong> <code style="background: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-size: 16px;">${password}</code></p>
        <p><strong>⏰ 試用期限:</strong> 7 天（至 ${expiresDateStr}）</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${loginUrl}" class="button">立即登入 Ultra Advisor →</a>
      </div>
      
      <h3>試用期間你可以：</h3>
      <ul class="checklist">
        <li>無限制使用所有 18 種專業工具</li>
        <li>建立無限客戶檔案</li>
        <li>生成專業視覺化報表</li>
        <li>匯出 PDF 提案文件</li>
        <li>隨時升級為正式會員</li>
      </ul>
      
      <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <p style="margin: 0;"><strong>💡 小提示：</strong>建議登入後先修改密碼（個人設定 > 安全性）</p>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>有任何問題？</strong></p>
      <p>💬 LINE 官方帳號即時支援<br>
      📖 使用教學：<a href="https://docs.ultraadvisor.com">docs.ultraadvisor.com</a></p>
      <p style="margin-top: 20px;">Ultra Advisor 團隊<br>
      讓數據為你說話，讓 AI 當你的軍師</p>
    </div>
  </div>
</body>
</html>
  `;
}

// ==========================================
// 🎯 主要功能
// ==========================================

/**
 * 創建試用帳號
 */
async function createTrialAccount(email, lineUserId) {
  try {
    // 1. 檢查 Email 是否已存在
    const existingUsers = await auth.getUserByEmail(email).catch(() => null);
    if (existingUsers) {
      throw new Error('此 Email 已註冊');
    }

    // 2. 生成隨機密碼
    const password = generateRandomPassword();

    // 3. 創建 Firebase Auth 用戶
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      emailVerified: false,
      disabled: false
    });

    // 4. 計算試用到期時間（7 天後）
    const now = admin.firestore.Timestamp.now();
    const expiresAt = admin.firestore.Timestamp.fromMillis(
      now.toMillis() + 7 * 24 * 60 * 60 * 1000
    );

    // 5. 寫入 Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email: email,
      createdAt: now,
      trialExpiresAt: expiresAt,
      subscriptionStatus: 'trial',
      lineUserId: lineUserId,
      isActive: true,
      clients: [],
      stats: {
        trialsCompleted: 0,
        hoursSaved: 0
      }
    });

    // 6. 暫時不發送 Email（SendGrid 問題）
    // 未來可以改用免費服務（Resend, Brevo 等）
    // const emailHTML = generateWelcomeEmailHTML(email, password, expiresAt.toMillis());
    // await sendEmail(email, '🎉 歡迎使用 Ultra Advisor！你的試用帳號已開通', emailHTML);
    console.log('[SKIPPED] Email sending - using LINE only');

    // 7. 發送 LINE 訊息（Flex Message + 單獨的密碼訊息）
    const loginUrl = `${APP_LOGIN_URL}?email=${encodeURIComponent(email)}`;
    await sendLineMessage(lineUserId, [
      {
        type: 'flex',
        altText: '🎉 你的試用帳號已開通！',
        contents: {
          type: 'bubble',
          hero: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '🎉 帳號開通成功！',
                size: 'xl',
                weight: 'bold',
                color: '#ffffff'
              }
            ],
            backgroundColor: '#3b82f6',
            paddingAll: '20px'
          },
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '登入資訊',
                weight: 'bold',
                size: 'md',
                margin: 'md'
              },
              {
                type: 'box',
                layout: 'vertical',
                margin: 'lg',
                spacing: 'sm',
                contents: [
                  {
                    type: 'box',
                    layout: 'baseline',
                    spacing: 'sm',
                    contents: [
                      {
                        type: 'text',
                        text: 'Email',
                        color: '#64748b',
                        size: 'sm',
                        flex: 2
                      },
                      {
                        type: 'text',
                        text: email,
                        wrap: true,
                        color: '#1e293b',
                        size: 'sm',
                        flex: 5
                      }
                    ]
                  },
                  {
                    type: 'box',
                    layout: 'baseline',
                    spacing: 'sm',
                    contents: [
                      {
                        type: 'text',
                        text: '試用期限',
                        color: '#64748b',
                        size: 'sm',
                        flex: 2
                      },
                      {
                        type: 'text',
                        text: '7 天',
                        wrap: true,
                        color: '#1e293b',
                        size: 'sm',
                        flex: 5
                      }
                    ]
                  }
                ]
              }
            ]
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
              {
                type: 'button',
                style: 'primary',
                height: 'sm',
                action: {
                  type: 'uri',
                  label: '立即登入',
                  uri: loginUrl
                }
              },
              {
                type: 'box',
                layout: 'baseline',
                contents: [
                  {
                    type: 'text',
                    text: '💡 密碼已在下方訊息中發送',
                    color: '#64748b',
                    size: 'xs',
                    wrap: true
                  }
                ],
                margin: 'md'
              }
            ]
          }
        }
      },
      {
        type: 'text',
        text: `🔑 你的登入密碼（長按可複製）：\n\n${password}\n\n💡 建議登入後立即修改密碼`
      }
    ]);

    console.log(`Trial account created: ${email}`);
    return {
      success: true,
      uid: userRecord.uid,
      email: email,
      expiresAt: expiresAt.toMillis()
    };

  } catch (error) {
    console.error('Create trial account error:', error);
    throw error;
  }
}

// ==========================================
// 🌐 HTTP Endpoints
// ==========================================

/**
 * LINE Webhook 接收器
 */
exports.lineWebhook = functions.https.onRequest(async (req, res) => {
  // 只接受 POST
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // 驗證簽章
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

/**
 * 處理 LINE 事件
 */
async function handleEvent(event) {
  const userId = event.source.userId;

  // 1. 處理「加入好友」事件
  if (event.type === 'follow') {
    await sendLineMessage(userId, [
      {
        type: 'text',
        text: '🎉 歡迎加入 Ultra Advisor！\n\n「讓數據為你說話，讓 AI 當你的軍師」\n\n━━━━━━━━━━━━━━━\n\n✨ 立即開通 7 天免費試用\n\n試用期間可免費使用：\n✅ 18 種專業工具\n✅ 無限客戶檔案\n✅ AI 智能分析\n✅ 專業報表生成\n\n━━━━━━━━━━━━━━━\n\n📧 請輸入您的 Email 開始試用：'
      }
    ]);
    return;
  }

  // 2. 處理「訊息」事件
  if (event.type === 'message' && event.message.type === 'text') {
    const userMessage = event.message.text.trim();

    // 檢查是否為 Email
    if (isValidEmail(userMessage)) {
      try {
        // 先回覆「處理中」
        await sendLineMessage(userId, [
          {
            type: 'text',
            text: '⏳ 正在為您開通試用帳號，請稍候...'
          }
        ]);

        // 創建試用帳號（已包含發送訊息）
        await createTrialAccount(userMessage, userId);

      } catch (error) {
        console.error('Account creation error:', error);
        
        let errorMessage = '❌ 開通失敗，請稍後再試。';
        if (error.message.includes('已註冊')) {
          errorMessage = '❌ 此 Email 已註冊過試用帳號。\n\n如需協助請聯繫客服。';
        }

        await sendLineMessage(userId, [
          {
            type: 'text',
            text: errorMessage
          }
        ]);
      }
    } else {
      // 不是 Email 格式
      await sendLineMessage(userId, [
        {
          type: 'text',
          text: '❌ Email 格式不正確，請重新輸入。\n\n範例：your@email.com'
        }
      ]);
    }
  }
}

// ==========================================
// ⏰ 定時任務（Cron Jobs）
// ==========================================

/**
 * 每日檢查試用到期（每天早上 9:00 執行）
 */
exports.checkTrialExpiration = functions.pubsub
  .schedule('0 9 * * *')
  .timeZone('Asia/Taipei')
  .onRun(async (context) => {
    console.log('Running trial expiration check...');

    const now = admin.firestore.Timestamp.now();
    const threeDaysLater = admin.firestore.Timestamp.fromMillis(
      now.toMillis() + 3 * 24 * 60 * 60 * 1000
    );
    const oneDayLater = admin.firestore.Timestamp.fromMillis(
      now.toMillis() + 1 * 24 * 60 * 60 * 1000
    );

    try {
      // 1. 查詢即將到期（剩 3 天）的試用用戶
      const threeDaysSnapshot = await db.collection('users')
        .where('subscriptionStatus', '==', 'trial')
        .where('trialExpiresAt', '<=', threeDaysLater)
        .where('trialExpiresAt', '>', now)
        .get();

      for (const doc of threeDaysSnapshot.docs) {
        const userData = doc.data();
        const daysRemaining = Math.ceil(
          (userData.trialExpiresAt.toMillis() - now.toMillis()) / (24 * 60 * 60 * 1000)
        );

        if (daysRemaining === 3) {
          // 發送 LINE 提醒（剩 3 天）
          if (userData.lineUserId) {
            await sendLineMessage(userData.lineUserId, [
              {
                type: 'text',
                text: '⏰ 試用剩餘 3 天\n\n你的 Ultra Advisor 試用帳號將在 3 天後到期。\n\n立即升級保留所有資料：\nhttps://portaly.cc/GinRollBT'
              }
            ]);
          }
          
          // 暫時不發送 Email
          // 未來可以改用免費 Email 服務
          console.log(`[SKIPPED] Email reminder for ${userData.email}`);
        }

        if (daysRemaining === 1 && userData.lineUserId) {
          // 發送 LINE 提醒（剩 1 天）
          await sendLineMessage(userData.lineUserId, [
            {
              type: 'text',
              text: '⏰ 試用剩餘 1 天\n\n你的 Ultra Advisor 試用帳號明天到期。\n\n立即升級保留所有資料：\nhttps://portaly.cc/GinRollBT'
            }
          ]);
        }
      }

      console.log(`Sent ${threeDaysSnapshot.size} expiration reminders`);
      
    } catch (error) {
      console.error('Trial expiration check error:', error);
    }

    return null;
  });

/**
 * 每日刪除過期帳號（每天凌晨 2:00 執行）
 */
exports.deleteExpiredAccounts = functions.pubsub
  .schedule('0 2 * * *')
  .timeZone('Asia/Taipei')
  .onRun(async (context) => {
    console.log('Running expired accounts deletion...');

    const now = admin.firestore.Timestamp.now();
    const threeDaysAgo = admin.firestore.Timestamp.fromMillis(
      now.toMillis() - 3 * 24 * 60 * 60 * 1000
    );

    try {
      // 查詢 3 天前到期的試用用戶
      const expiredSnapshot = await db.collection('users')
        .where('subscriptionStatus', '==', 'trial')
        .where('trialExpiresAt', '<=', threeDaysAgo)
        .get();

      for (const doc of expiredSnapshot.docs) {
        const userData = doc.data();
        const uid = doc.id;

        try {
          // 1. 備份用戶資料（保留 30 天）
          const backupExpiresAt = admin.firestore.Timestamp.fromMillis(
            now.toMillis() + 30 * 24 * 60 * 60 * 1000
          );

          await db.collection('backups').doc(uid).set({
            backedUpAt: now,
            expiresAt: backupExpiresAt,
            userData: userData
          });

          // 2. 刪除 Firestore 用戶資料
          await doc.ref.delete();

          // 3. 刪除 Firebase Auth 帳號
          await auth.deleteUser(uid);

          // 4. 發送「試用結束」LINE 訊息
          if (userData.lineUserId) {
            await sendLineMessage(userData.lineUserId, [
              {
                type: 'text',
                text: '試用期已結束\n\n感謝你試用 Ultra Advisor！\n\n你的帳號已被停用，但我們為你保留了 30 天的資料備份。\n\n在此期間升級為正式會員，即可恢復所有試算資料：\nhttps://portaly.cc/GinRollBT\n\n備份將於 30 天後自動刪除。'
              }
            ]);
          }
          
          // 暫時不發送 Email
          console.log(`[SKIPPED] Trial end email for ${userData.email}`);

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
 * 每日清理過期備份（每天凌晨 3:00 執行）
 */
exports.cleanupExpiredBackups = functions.pubsub
  .schedule('0 3 * * *')
  .timeZone('Asia/Taipei')
  .onRun(async (context) => {
    console.log('Running expired backups cleanup...');

    const now = admin.firestore.Timestamp.now();

    try {
      const expiredBackups = await db.collection('backups')
        .where('expiresAt', '<=', now)
        .get();

      const batch = db.batch();
      expiredBackups.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`Cleaned up ${expiredBackups.size} expired backups`);

    } catch (error) {
      console.error('Cleanup expired backups error:', error);
    }

    return null;
  });
