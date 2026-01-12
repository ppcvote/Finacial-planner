# 🚀 Ultra Advisor 會員系統 - 完整實作指南

> 版本：1.0.0  
> 更新日期：2026-01-12

---

## 📋 系統概覽

### 確認的需求規格

| 項目 | 設定 |
|------|------|
| 創始會員有效期 | ✅ 永久 |
| 多重身分組 | ✅ 需要（一個用戶可有多個身分組） |
| 升降級規則 | ✅ 混合（自動 + 手動） |
| 點數有效期 | ✅ 12 個月 |
| 兌換寄送流程 | ✅ 標記即可（不需物流追蹤） |
| 點數轉讓 | ❌ 不需要 |
| 推薦碼格式 | ✅ 自訂（用戶可自訂推薦碼） |
| 推薦獎勵 | ✅ 雙向（推薦人 + 被推薦人都有獎勵） |
| 選單位置 | ✅ 會員系統子選單 |
| 操作日誌 | ✅ 需要 |

---

## 📁 檔案結構

```
admin/
├── src/
│   ├── App.jsx                         # ⬅️ 更新（新增路由）
│   ├── components/
│   │   └── Layout.jsx                  # ⬅️ 更新（新增選單）
│   └── pages/
│       ├── Dashboard.jsx               # 現有
│       ├── Users.jsx                   # 現有
│       └── membership/                 # 🆕 新增資料夾
│           ├── MembershipTiers.jsx     # 身分組管理
│           ├── PointsRules.jsx         # 點數規則
│           ├── RedeemableItems.jsx     # 兌換商品
│           ├── PointsLedger.jsx        # 點數紀錄
│           └── AuditLogs.jsx           # 操作日誌
├── scripts/
│   └── init-firestore.mjs              # 🆕 初始化腳本
└── docs/
    ├── DATABASE_SCHEMA.md              # 🆕 資料庫結構文件
    └── IMPLEMENTATION_GUIDE.md         # 🆕 本文件
```

---

## 🛠️ 安裝步驟

### Step 1：建立資料夾結構

```powershell
# 進入 admin 專案目錄
cd C:\Users\User\financial-planner\admin

# 建立新資料夾
mkdir src\pages\membership
mkdir scripts
mkdir docs
```

### Step 2：複製檔案

將以下檔案放到對應位置：

| 檔案 | 目標路徑 |
|------|----------|
| `App.jsx` | `src/App.jsx`（覆蓋） |
| `Layout.jsx` | `src/components/Layout.jsx`（覆蓋） |
| `MembershipTiers.jsx` | `src/pages/membership/MembershipTiers.jsx` |
| `PointsRules.jsx` | `src/pages/membership/PointsRules.jsx` |
| `RedeemableItems.jsx` | `src/pages/membership/RedeemableItems.jsx` |
| `PointsLedger.jsx` | `src/pages/membership/PointsLedger.jsx` |
| `AuditLogs.jsx` | `src/pages/membership/AuditLogs.jsx` |
| `init-firestore.mjs` | `scripts/init-firestore.mjs` |

### Step 3：安裝額外依賴

```powershell
# 安裝 dayjs（日期處理）
npm install dayjs
```

### Step 4：更新 Firebase 配置

編輯 `scripts/init-firestore.mjs`，填入您的 Firebase 配置：

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",                    // ⬅️ 替換
  authDomain: "grbt-f87fa.firebaseapp.com",
  projectId: "grbt-f87fa",
  storageBucket: "grbt-f87fa.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",       // ⬅️ 替換
  appId: "YOUR_APP_ID"                       // ⬅️ 替換
};
```

### Step 5：執行初始化腳本

```powershell
# 執行初始化
node scripts/init-firestore.mjs
```

腳本會：
1. 建立 5 個預設身分組
2. 建立 10 個點數規則
3. 建立 5 個兌換商品
4. 遷移現有用戶（新增身分組欄位）
5. 建立推薦碼索引

### Step 6：啟動開發伺服器

```powershell
npm run dev
```

---

## 🔐 Firestore 安全規則

將以下規則部署到 Firebase Console > Firestore > 規則：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 輔助函數
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // === users ===
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isAuthenticated();
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }
    
    // === membershipTiers ===
    match /membershipTiers/{tierId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // === pointsRules ===
    match /pointsRules/{ruleId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // === redeemableItems ===
    match /redeemableItems/{itemId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // === pointsLedger ===
    match /pointsLedger/{entryId} {
      allow read: if isAdmin() || 
                    resource.data.userId == request.auth.uid;
      allow create: if isAdmin();
      allow update, delete: if isAdmin();
    }
    
    // === redemptionOrders ===
    match /redemptionOrders/{orderId} {
      allow read: if isAdmin() || 
                    resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
    
    // === referralCodes ===
    match /referralCodes/{code} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update: if isAdmin() || 
                      resource.data.ownerId == request.auth.uid;
      allow delete: if isAdmin();
    }
    
    // === auditLogs ===
    match /auditLogs/{logId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
  }
}
```

---

## 📊 新增的後台頁面

### 1. 身分組管理 `/admin/membership/tiers`

功能：
- 📋 身分組列表（含用戶統計）
- ➕ 新增身分組
- ✏️ 編輯身分組（權限、點數倍率、有效期）
- 🔄 啟用/停用身分組
- ↕️ 調整排序

### 2. 點數規則 `/admin/membership/points-rules`

功能：
- 📋 規則列表
- ➕ 新增規則
- ✏️ 編輯規則（點數、限制條件）
- 🔄 啟用/停用規則

### 3. 兌換商品 `/admin/membership/redeemable-items`

功能：
- 📋 商品列表（含庫存統計）
- ➕ 新增商品
- ✏️ 編輯商品（點數、庫存、限制）
- 🔄 上架/下架商品
- 🗑️ 刪除商品

### 4. 點數紀錄 `/admin/membership/points-ledger`

功能：
- 📋 交易紀錄列表
- 🔍 按用戶/類型/日期篩選
- ➕ 手動調整用戶點數
- 📊 統計儀表板（獲得/消費/過期）
- 📤 匯出 CSV

### 5. 操作日誌 `/admin/membership/audit-logs`

功能：
- 📋 操作紀錄列表
- 🔍 按目標/操作/管理員/日期篩選
- 📊 統計儀表板
- 📤 匯出 CSV
- 🔎 查看變更詳情（Before/After）

---

## 🗄️ 資料庫結構

### users Collection（擴充欄位）

```typescript
{
  // 現有欄位...
  
  // 🆕 身分組
  membershipTierIds: string[];      // 多重身分組
  primaryTierId: string;            // 主要身分組
  membershipExpiresAt?: Timestamp;  // 到期時間
  
  // 🆕 UA 點數
  points: number;                   // 當前餘額
  totalPointsEarned: number;        // 累計獲得
  totalPointsSpent: number;         // 累計消費
  totalPointsExpired: number;       // 累計過期
  
  // 🆕 推薦系統
  referralCode: string;             // 我的推薦碼
  referredBy?: string;              // 推薦人 userId
  referralCount: number;            // 成功推薦數
  
  // 🆕 追蹤
  toolUsageCount: number;           // 工具使用次數
  loginStreak: number;              // 連續登入天數
}
```

### 新增 Collections

| Collection | 說明 |
|------------|------|
| `membershipTiers` | 身分組定義 |
| `pointsRules` | 點數規則 |
| `redeemableItems` | 兌換商品 |
| `pointsLedger` | 點數帳本 |
| `redemptionOrders` | 兌換訂單 |
| `referralCodes` | 推薦碼索引 |
| `auditLogs` | 操作日誌 |

詳細結構請參考 `DATABASE_SCHEMA.md`

---

## 🔜 Phase 2：待實作功能

以下功能建議在 Phase 2 實作：

### Cloud Functions

| Function | 說明 |
|----------|------|
| `onUserLogin` | 每日登入獎勵、連續登入追蹤 |
| `onToolUse` | 工具使用獎勵 |
| `processReferral` | 推薦獎勵發放 |
| `redeemItem` | 兌換商品處理 |
| `expirePoints` | 每日檢查點數過期 |
| `checkMembershipExpiry` | 會員到期檢查 |

### 前台功能

- 用戶點數儀表板
- 兌換商品頁面
- 推薦系統頁面
- 身分組徽章顯示

---

## ❓ 常見問題

### Q1: 初始化腳本執行失敗？

檢查：
1. Firebase 配置是否正確
2. 是否有 Firestore 寫入權限
3. 網路連線是否正常

### Q2: 頁面顯示空白？

檢查瀏覽器 Console：
1. 確認 Firebase 連線正常
2. 確認 Collection 已建立
3. 確認管理員帳號在 `admins` Collection

### Q3: 操作日誌沒有紀錄？

確認：
1. 用戶已登入
2. `auth.currentUser` 有值
3. Firestore 規則允許寫入 `auditLogs`

---

## 📞 技術支援

如有問題，請提供：
1. 錯誤訊息截圖
2. 瀏覽器 Console 輸出
3. 操作步驟

---

**🎉 恭喜完成 Phase 1！**
