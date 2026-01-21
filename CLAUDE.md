# Ultra Advisor 專案說明

## 📋 專案概述
Ultra Advisor 是一個 SaaS 平台，為台灣財務顧問提供 18 種數據視覺化工具，幫助顧問快速產出專業提案。

## 🔧 技術棧
- **前端**：React + TypeScript + Vite + Tailwind CSS
- **後台**：React Admin + Ant Design
- **資料庫**：Firebase Firestore
- **認證**：Firebase Authentication
- **後端**：Firebase Cloud Functions (Node.js 20)
- **部署**：Firebase Hosting

## 📁 專案路徑
```
C:\Users\User\financial-planner\     # 前端主專案
├── src\
│   ├── components\                  # React 元件
│   ├── hooks\                       # 自定義 Hooks
│   ├── pages\                       # 頁面元件
│   └── firebase.ts                  # Firebase 設定
├── functions\                       # Cloud Functions
│   └── index.js                     # Functions 入口
└── admin\                           # Admin 後台（或獨立 repo）

C:\Users\User\ultra-admin\           # Admin 後台（如獨立）
├── src\
│   ├── pages\                       # 後台頁面
│   └── components\                  # 後台元件
```

## 🌐 網址
- 前端：https://ultra-advisor.tw
- 後台：https://admin.ultra-advisor.tw/secret-admin-ultra-2026
- LINE 官方帳號：https://line.me/R/ti/p/@ultraadvisor

## 🔥 Firebase 設定
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAqS6fhHQVyBNr1LCkCaQPyJ13Rkq7bfHA",
  authDomain: "grbt-f87fa.firebaseapp.com",
  projectId: "grbt-f87fa",
  storageBucket: "grbt-f87fa.firebasestorage.app",
  messagingSenderId: "169700005946",
  appId: "1:169700005946:web:9b0722f31aa9fe7ad13d03",
};
```

## 📊 Firestore 資料結構

### users/{uid}
```javascript
{
  // 基本資料
  email: string,
  displayName: string,
  photoURL: string,
  
  // 會員系統
  primaryTierId: "founder" | "paid" | "trial" | "grace" | "expired",
  membershipExpiresAt: Timestamp,
  
  // 點數系統
  points: {
    current: number,
  },
  totalPointsEarned: number,
  totalPointsSpent: number,
  totalPointsExpired: number,
  
  // 推薦系統
  referralCode: string,        // 用戶的推薦碼
  referredBy: string,          // 推薦人 UID
  referralCount: number,       // 推薦人數
  
  // 登入追蹤
  loginStreak: number,         // 連續登入天數
  lastLoginDate: string,       // 最後登入日期 YYYY-MM-DD
  
  // 管理
  adminNote: string,           // 管理員備註
  createdAt: Timestamp,
  updatedAt: Timestamp,
}
```

### pointsLedger/{docId}
```javascript
{
  userId: string,
  type: "earn" | "spend" | "expire" | "admin",
  amount: number,
  reason: string,
  isExpired: boolean,
  expiresAt: Timestamp,
  createdAt: Timestamp,
}
```

### membershipTiers/{tierId}
```javascript
{
  id: "founder" | "paid" | "trial" | "grace" | "expired",
  name: string,
  allowedTools: string[],      // 允許使用的工具 ID 列表
  isActive: boolean,
}
```

### referralCodes/{code}
```javascript
{
  code: string,
  ownerId: string,
  usedCount: number,
  createdAt: Timestamp,
}
```

## 👥 會員身分組

| ID | 名稱 | 工具權限 | 說明 |
|---|---|---|---|
| `founder` | 創始會員 | 全部 18 工具 | 早期支持者，永久權限 |
| `paid` | 付費會員 | 全部 18 工具 | 訂閱用戶 |
| `trial` | 試用會員 | 3 個免費工具 | 新用戶試用期 |
| `grace` | 寬限期 | 3 個免費工具 | 訂閱到期後寬限 |
| `expired` | 已過期 | 3 個免費工具 | 需續訂 |

## 🔓 免費工具（不鎖定）
這三個工具對所有用戶開放：
- `estate` - 金融房產專案
- `reservoir` - 大小水庫專案
- `tax` - 稅務傳承專案

## 🎯 點數規則

| 動作 | 點數 | 說明 |
|---|---|---|
| 每日登入 | +5 | 每天首次登入 |
| 使用工具 | +10 | 每日上限 10 次 |
| 連續登入 7 天 | +50 | 額外獎勵 |
| 連續登入 30 天 | +200 | 額外獎勵 |
| 推薦好友完成註冊 | +100 | 推薦人獲得 |
| 推薦好友成功付費 | +1000 | 雙方各得 |

## ☁️ Cloud Functions 列表

| Function | 類型 | 說明 |
|---|---|---|
| `onDailyLogin` | callable | 每日登入獎勵 |
| `onToolUse` | callable | 工具使用獎勵 |
| `onFirstClient` | callable | 建立首位客戶獎勵 |
| `getUserPointsSummary` | callable | 取得用戶點數摘要 |
| `processReferral` | callable | 處理推薦碼 |
| `updateReferralCode` | callable | 更新推薦碼 |
| `awardActivityPoints` | callable | 活動點數發放 |
| `checkMembershipExpiry` | scheduled | 檢查會員到期 |
| `checkTrialExpiration` | scheduled | 檢查試用到期 |
| `expirePoints` | scheduled | 點數過期處理 |
| `lineWebhook` | https | LINE Bot Webhook |
| `blogSeo` | https | 部落格 SEO 服務（為社群分享提供動態 meta tags）|

## 📝 部落格系統 (SEO)

### 文章資料結構
```
src/data/blog/
├── articles/           # 文章檔案（01-*.ts ~ 32-*.ts）
├── index.ts           # 匯出所有文章
└── types.ts           # BlogArticle 型別定義
```

### 新增文章流程
新增文章只需修改 3 個檔案：
1. **建立文章檔案**：`src/data/blog/articles/{id}-{slug}.ts`
2. **更新 index.ts**：`src/data/blog/index.ts` 加入 import 和 export
3. **更新 API 路由**：`api/blog/[slug].ts` 加入文章 metadata
4. **更新 Cloud Function**：`functions/index.js` 加入文章 metadata（Firebase SEO 用）

然後 commit、push、`npx vercel --prod --yes` 部署即可。

### 文章分類與 OG 圖片
| 分類 ID | 分類名稱 | OG 圖片 |
|---------|---------|---------|
| `mortgage` | 房貸知識 | og-mortgage.png |
| `retirement` | 退休規劃 | og-retirement.png |
| `tax` | 稅務傳承 | og-tax.png |
| `investment` | 投資理財 | og-investment.png |
| `tools` | 工具教學 | og-tools.png |
| `sales` | 銷售技巧 | og-sales.png |

### 社群分享 SEO 機制
1. **blogSeo Cloud Function**：偵測社群爬蟲（Facebook、LINE、Twitter 等），返回正確的 meta tags
2. **firebase.json rewrite**：`/blog/**` 路由到 blogSeo function
3. **BlogPage.tsx**：動態更新頁面 meta tags（給一般瀏覽器用）

### 文章寫作規範
- **避免業務感**：文章是給業務的「工具書」，但分享給客戶時不能有推銷感
- **禁止使用的詞彙**：「業務話術建議」、「金融從業人員必備」、「幫助客戶」
- **建議替代詞**：「實際省錢試算」、「小提醒」、「幫你」

### 文章風格（參考 4THINK）
- **開頭直接點破痛點**：不廢話，馬上抓住讀者
- **用故事或情境帶入**：讓抽象概念變具體
- **重點用粗體標註**：方便快速掃讀
- **善用「一句話總結」**：每個段落都有核心金句
- **結尾給行動建議**：看完知道下一步該做什麼
- **精煉、少廢話**：每句話都有存在的理由

### 內部連結（SEO 優化）
每篇文章結尾加入「延伸閱讀」區塊，連結到 2-3 篇相關文章：
```html
<div class="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 my-8">
  <h4 class="text-white font-bold mb-4">📚 延伸閱讀</h4>
  <ul class="text-slate-300 mb-0 space-y-2">
    <li>→ <a href="/blog/[slug]" class="text-blue-400 hover:underline">[文章標題]</a></li>
  </ul>
</div>
```
連結原則：
- 同分類文章優先
- 主題相關的跨分類文章
- 避免連結到自己

## 🎨 品牌規範

### 詞語修正（避免敏感金融詞彙）
| ❌ 避免使用 | ✅ 改用 |
|---|---|
| 利差 | 收益差額 |
| 套利 | 資產累積 |
| 槓桿 | 保障倍數 |

### 色彩規範
- 負值使用 **藍色**，不使用紅色（避免負面觀感）
- 主色調：紫色漸層 (`from-purple-600 to-blue-600`)
- 背景：深色系 (`slate-900`, `slate-800`)

### 檔案格式
- 不使用 RAR（繁體中文環境易損壞）
- 統一使用 ZIP 格式

## 🖥️ 常用指令

```bash
# 前端開發
cd C:\Users\User\financial-planner
npm run dev

# Admin 後台開發
npm run dev .\admin\
# 或
cd C:\Users\User\ultra-admin
npm run dev

# 部署 Cloud Functions
firebase deploy --only functions

# 部署前端
firebase deploy --only hosting

# 部署 Firestore 索引
firebase deploy --only firestore:indexes

# 查看 Functions 列表
firebase functions:list

# 查看 Functions 日誌
firebase functions:log
```

## 🔑 重要 Hooks

### usePoints.ts
```typescript
// 使用方式
import { usePoints, pointsApi } from '../hooks/usePoints';

// Hook 方式
const { triggerDailyLogin, triggerToolUse, getPointsSummary } = usePoints();

// API 方式（不需 Hook）
await pointsApi.dailyLogin();
await pointsApi.toolUse('mortgage-calculator');
await pointsApi.getSummary();
```

### useMembership.ts
```typescript
// 使用方式
import { useMembership } from '../hooks/useMembership';

const { 
  tier,           // 當前身分組
  canUseTool,     // 檢查工具權限的函數
  isLoading 
} = useMembership();

// 檢查權限
if (canUseTool('golden-vault')) {
  // 可以使用
} else {
  // 顯示鎖定提示
}
```

## 🐛 常見問題排查

### Firestore 權限錯誤
- 檢查 Firestore Rules
- 確認用戶已登入 (`context.auth` 存在)

### Cloud Functions INTERNAL 錯誤
- 通常是缺少 Firestore 複合索引
- 去 Firebase Console → Firestore → 索引 建立

### React Error #31
- 「Objects are not valid as a React child」
- 檢查是否把物件直接渲染，應該渲染物件的屬性
- 例如：`{points}` 應改為 `{points.current}`

### 本地開發 EPERM 錯誤
```powershell
# 清除 Vite 快取
Remove-Item -Recurse -Force "node_modules\.vite" -ErrorAction SilentlyContinue
npm run dev
```

## 📝 開發注意事項

1. **修改 Cloud Functions 後**：記得執行 `firebase deploy --only functions`
2. **新增 Firestore 查詢**：檢查是否需要建立索引
3. **測試會員功能**：可在 Admin 後台調整用戶身分組
4. **點數相關修改**：注意 `points` 是物件 `{ current: number }`，不是純數字