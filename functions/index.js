// ==========================================
// ?? Ultra Advisor - 閰衣撣唾??芸??頂蝯?// Firebase Cloud Functions
// ==========================================

// 頛?啣?霈嚗??潛憓嚗?if (process.env.NODE_ENV !== 'production') {
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
// ?? ?啣?霈閮剖?
// ??functions 鞈?憭曉撱?.env ?辣嚗??恬?
// LINE_CHANNEL_SECRET=your_secret
// LINE_CHANNEL_ACCESS_TOKEN=your_token
// APP_LOGIN_URL=https://your-app.com/login
// 
// 瘜冽?嚗??雿輻 Email ?潮??芰 LINE ?
// ==========================================

const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const APP_LOGIN_URL = process.env.APP_LOGIN_URL || 'https://ultra-advisor.com/login';

// ==========================================
// ? 撌亙?賣
// ==========================================

/**
 * ???冽?撖Ⅳ嚗?-12雿??憭批?撖怠?瘥??詨?嚗? */
function generateRandomPassword() {
  const length = 10;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  // 蝣箔??喳????之撖怒???撖怒??摮?  if (!/[A-Z]/.test(password)) password = 'A' + password.slice(1);
  if (!/[a-z]/.test(password)) password = password.slice(0, -1) + 'a';
  if (!/[0-9]/.test(password)) password = password.slice(0, -1) + '1';
  return password;
}

/**
 * 撽? Email ?澆?
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 撽? LINE Webhook 蝪賜?
 */
function validateSignature(body, signature) {
  const hash = crypto
    .createHmac('sha256', LINE_CHANNEL_SECRET)
    .update(body)
    .digest('base64');
  return hash === signature;
}

/**
 * ?潮?LINE 閮
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
 * ?潮?Email嚗???剁??寧 LINE ?潮?
 * ?芯??臬??典?鞎?Email ??
 */
async function sendEmail(to, subject, html) {
  // ?急?閮餉圾??Email ?潮???  // ?芯??臭誑?寧 Resend ?隞?鞎餅???  console.log(`[SKIPPED] Email to ${to}: ${subject}`);
  console.log('?桀?雿輻 LINE ?潮??');
  return; // ?湔餈?嚗??潮?Email
  
  /* ?芯????瘨酉閫?  try {
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
 * ??甇∟? Email HTML
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
    .checklist li:before { content: "??"; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>?? 甇∟?雿輻 Ultra Advisor嚗?/h1>
      <p>雿?閰衣撣唾?撌脫?????/p>
    </div>
    
    <div class="content">
      <h2>雿??餃鞈?</h2>
      
      <div class="info-box">
        <p><strong>? Email:</strong> ${email}</p>
        <p><strong>?? ?冽?撖Ⅳ:</strong> <code style="background: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-size: 16px;">${password}</code></p>
        <p><strong>??閰衣??:</strong> 7 憭抬???${expiresDateStr}嚗?/p>
      </div>
      
      <div style="text-align: center;">
        <a href="${loginUrl}" class="button">蝡?餃 Ultra Advisor ??/a>
      </div>
      
      <h3>閰衣??雿隞伐?</h3>
      <ul class="checklist">
        <li>?⊿??嗡蝙?冽???18 蝔桀?璆剖極??/li>
        <li>撱箇??⊿?摰Ｘ瑼?</li>
        <li>??撠平閬死?銵?/li>
        <li>?臬 PDF ???辣</li>
        <li>?冽????箸迤撘???/li>
      </ul>
      
      <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <p style="margin: 0;"><strong>? 撠?蝷綽?</strong>撱箄降?餃敺?靽格撖Ⅳ嚗犖閮剖? > 摰?改?</p>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>?遙雿?憿?</strong></p>
      <p>? LINE 摰撣唾??單??舀<br>
      ?? 雿輻?飛嚗?a href="https://docs.ultraadvisor.com">docs.ultraadvisor.com</a></p>
      <p style="margin-top: 20px;">Ultra Advisor ??<br>
      霈?雿牧閰梧?霈?AI ?嗡???撣?/p>
    </div>
  </div>
</body>
</html>
  `;
}

// ==========================================
// ? 銝餉??
// ==========================================

/**
 * ?萄遣閰衣撣唾?
 */
async function createTrialAccount(email, lineUserId) {
  try {
    // 1. 瑼Ｘ Email ?臬撌脣???    const existingUsers = await auth.getUserByEmail(email).catch(() => null);
    if (existingUsers) {
      throw new Error('甇?Email 撌脰酉??);
    }

    // 2. ???冽?撖Ⅳ
    const password = generateRandomPassword();

    // 3. ?萄遣 Firebase Auth ?冽
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      emailVerified: false,
      disabled: false
    });

    // 4. 閮?閰衣?唳???嚗? 憭拙?嚗?    const now = admin.firestore.Timestamp.now();
    const expiresAt = admin.firestore.Timestamp.fromMillis(
      now.toMillis() + 7 * 24 * 60 * 60 * 1000
    );

    // 5. 撖怠 Firestore
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

    // 6. ?急?銝??Email嚗endGrid ??嚗?    // ?芯??臭誑?寧?祥??嚗esend, Brevo 蝑?
    // const emailHTML = generateWelcomeEmailHTML(email, password, expiresAt.toMillis());
    // await sendEmail(email, '?? 甇∟?雿輻 Ultra Advisor嚗??岫?典董?歇??, emailHTML);
    console.log('[SKIPPED] Email sending - using LINE only');

    // 7. ?潮?LINE 閮嚗lex Message + ?桃??蝣潸??荔?
    const loginUrl = `${APP_LOGIN_URL}?email=${encodeURIComponent(email)}`;
    await sendLineMessage(lineUserId, [
      {
        type: 'flex',
        altText: '?? 雿?閰衣撣唾?撌脤???',
        contents: {
          type: 'bubble',
          hero: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '?? 撣唾?????',
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
                text: '?餃鞈?',
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
                        text: '閰衣??',
                        color: '#64748b',
                        size: 'sm',
                        flex: 2
                      },
                      {
                        type: 'text',
                        text: '7 憭?,
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
                  label: '蝡?餃',
                  uri: loginUrl
                }
              },
              {
                type: 'box',
                layout: 'baseline',
                contents: [
                  {
                    type: 'text',
                    text: '? 撖Ⅳ撌脣銝閮銝剔??,
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
        text: `?? 雿??餃撖Ⅳ嚗?銴ˊ嚗?\n\n${password}\n\n? 撱箄降?餃敺??喃耨?孵?蝣嬋
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
// ?? HTTP Endpoints
// ==========================================

/**
 * LINE Webhook ?交?? */
exports.lineWebhook = functions.https.onRequest(async (req, res) => {
  // ?芣??POST
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // 撽?蝪賜?
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
 * ?? LINE 鈭辣
 */
async function handleEvent(event) {
  const userId = event.source.userId;

  // 1. ?????亙末??隞?  if (event.type === 'follow') {
    await sendLineMessage(userId, [
      {
        type: 'text',
        text: '?? 甇∟?? Ultra Advisor嚗n\n???豢??箔?隤芾店嚗? AI ?嗡???撣怒n\n???????????????n\n??蝡??7 憭拙?鞎餉岫?沔n\n閰衣???臬?鞎颱蝙?剁?\n??18 蝔桀?璆剖極?愧n???⊿?摰Ｘ瑼?\n??AI ?箄??\n??撠平?梯”??\n\n???????????????n\n? 隢撓?交??Email ??閰衣嚗?
      }
    ]);
    return;
  }

  // 2. ?????胯?隞?  if (event.type === 'message' && event.message.type === 'text') {
    const userMessage = event.message.text.trim();

    // 瑼Ｘ?臬??Email
    if (isValidEmail(userMessage)) {
      try {
        // ??閬??葉??        await sendLineMessage(userId, [
          {
            type: 'text',
            text: '??甇??箸?岫?典董??隢???..'
          }
        ]);

        // ?萄遣閰衣撣唾?嚗歇??潮??荔?
        await createTrialAccount(userMessage, userId);

      } catch (error) {
        console.error('Account creation error:', error);
        
        let errorMessage = '???仃??隢?敺?閰艾?;
        if (error.message.includes('撌脰酉??)) {
          errorMessage = '??甇?Email 撌脰酉??閰衣撣唾??n\n憒??隢蝜怠恥??;
        }

        await sendLineMessage(userId, [
          {
            type: 'text',
            text: errorMessage
          }
        ]);
      }
    } else {
      // 銝 Email ?澆?
      await sendLineMessage(userId, [
        {
          type: 'text',
          text: '??Email ?澆?銝迤蝣綽?隢??啗撓?乓n\n蝭?嚗our@email.com'
        }
      ]);
    }
  }
}

// ==========================================
// ??摰?隞餃?嚗ron Jobs嚗?// ==========================================

/**
 * 瘥瑼Ｘ閰衣?唳?嚗?憭拇銝?9:00 ?瑁?嚗? */
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
      // 1. ?亥岷?喳??唳?嚗 3 憭抬??岫?函??      const threeDaysSnapshot = await db.collection('users')
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
          // ?潮?LINE ??嚗 3 憭抬?
          if (userData.lineUserId) {
            await sendLineMessage(userData.lineUserId, [
              {
                type: 'text',
                text: '??閰衣?拚? 3 憭坼n\n雿? Ultra Advisor 閰衣撣唾?撠 3 憭拙??唳??n\n蝡??靽??????\nhttps://portaly.cc/GinRollBT'
              }
            ]);
          }
          
          // ?急?銝??Email
          // ?芯??臭誑?寧?祥 Email ??
          console.log(`[SKIPPED] Email reminder for ${userData.email}`);
        }

        if (daysRemaining === 1 && userData.lineUserId) {
          // ?潮?LINE ??嚗 1 憭抬?
          await sendLineMessage(userData.lineUserId, [
            {
              type: 'text',
              text: '??閰衣?拚? 1 憭坼n\n雿? Ultra Advisor 閰衣撣唾??予?唳??n\n蝡??靽??????\nhttps://portaly.cc/GinRollBT'
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
 * 瘥?芷??撣唾?嚗?憭拙???2:00 ?瑁?嚗? */
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
      // ?亥岷 3 憭拙??唳??岫?函??      const expiredSnapshot = await db.collection('users')
        .where('subscriptionStatus', '==', 'trial')
        .where('trialExpiresAt', '<=', threeDaysAgo)
        .get();

      for (const doc of expiredSnapshot.docs) {
        const userData = doc.data();
        const uid = doc.id;

        try {
          // 1. ?遢?冽鞈?嚗???30 憭抬?
          const backupExpiresAt = admin.firestore.Timestamp.fromMillis(
            now.toMillis() + 30 * 24 * 60 * 60 * 1000
          );

          await db.collection('backups').doc(uid).set({
            backedUpAt: now,
            expiresAt: backupExpiresAt,
            userData: userData
          });

          // 2. ?芷 Firestore ?冽鞈?
          await doc.ref.delete();

          // 3. ?芷 Firebase Auth 撣唾?
          await auth.deleteUser(uid);

          // 4. ?潮岫?函??INE 閮
          if (userData.lineUserId) {
            await sendLineMessage(userData.lineUserId, [
              {
                type: 'text',
                text: '閰衣?歇蝯?\n\n??雿岫??Ultra Advisor嚗n\n雿?撣唾?撌脰◤?嚗??雿??? 30 憭拍?鞈??遢?n\n?冽迨?????箸迤撘??∴??喳?Ｗ儔??岫蝞???\nhttps://portaly.cc/GinRollBT\n\n?遢撠 30 憭拙??芸??芷??
              }
            ]);
          }
          
          // ?急?銝??Email
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
 * 瘥皜????遢嚗?憭拙???3:00 ?瑁?嚗? */
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
