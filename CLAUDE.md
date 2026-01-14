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
- LINE 官方帳號：https://lin.ee/RFE8A5A

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