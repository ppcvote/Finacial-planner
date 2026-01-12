# 🗄️ Firestore Collections Schema

> Ultra Advisor 身分組 + UA 點系統資料結構設計

---

## 📋 Collections 總覽

```
firestore/
├── users/                      # 既有（擴充）
├── membershipTiers/            # 🆕 身分組定義
├── pointsRules/                # 🆕 點數規則
├── redeemableItems/            # 🆕 兌換商品
├── pointsLedger/               # 🆕 點數帳本
├── redemptionOrders/           # 🆕 兌換訂單
└── operationLogs/              # 🆕 操作日誌
```

---

## 1️⃣ membershipTiers（身分組定義）

### 結構

```typescript
interface MembershipTier {
  // 基本資訊
  id: string;                    // 文件 ID，如 'founder', 'paid'
  name: string;                  // 顯示名稱，如 '🏆 創始會員'
  description: string;           // 說明文字
  icon: string;                  // Emoji 或圖示名稱
  color: string;                 // HEX 色碼，如 '#f59e0b'
  badgeStyle: {                  // 徽章樣式
    background: string;          // 背景色
    border: string;              // 邊框色
    text: string;                // 文字色
  };
  
  // 排序與狀態
  priority: number;              // 優先級（數字越小越優先）
  isDefault: boolean;            // 是否為預設身分組（新用戶自動獲得）
  isActive: boolean;             // 是否啟用
  isPermanent: boolean;          // 是否永久有效（如創始會員）
  
  // 權限設定
  permissions: {
    canUseTools: boolean;        // 可使用工具
    canExport: boolean;          // 可匯出報表
    canAccessAI: boolean;        // 可使用 AI 功能
    maxClients: number;          // 最大客戶數 (-1=無限)
    canEarnPoints: boolean;      // 可獲得點數
    canRedeemPoints: boolean;    // 可兌換點數
  };
  
  // 點數設定
  pointsMultiplier: number;      // 點數倍率 (1.0, 1.5, 2.0)
  
  // 權益說明（前端展示用）
  benefits: string[];
  
  // 時間戳記
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;             // 管理員 UID
}
```

### 索引

```
(無需額外索引，文件數量少)
```

### 範例文件

```javascript
// membershipTiers/founder
{
  id: 'founder',
  name: '🏆 創始會員',
  description: '前 100 名限量，永久專屬特權',
  icon: '🏆',
  color: '#f59e0b',
  badgeStyle: {
    background: 'rgba(245, 158, 11, 0.2)',
    border: '#f59e0b',
    text: '#f59e0b'
  },
  priority: 1,
  isDefault: false,
  isActive: true,
  isPermanent: true,
  permissions: {
    canUseTools: true,
    canExport: true,
    canAccessAI: true,
    maxClients: -1,
    canEarnPoints: true,
    canRedeemPoints: true
  },
  pointsMultiplier: 2.0,
  benefits: [
    '永久享有早鳥價格鎖定',
    '優先體驗所有新功能',
    '專屬 VIP 社群',
    '終身技術支援',
    '功能需求優先處理',
    '創始會員徽章'
  ],
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: 'system'
}
```

---

## 2️⃣ pointsRules（點數規則）

### 結構

```typescript
interface PointsRule {
  // 基本資訊
  id: string;                    // 行為 ID，如 'daily_login'
  name: string;                  // 顯示名稱
  description: string;           // 說明
  icon: string;                  // Emoji
  category: 'engagement' | 'referral' | 'activity' | 'admin';
  
  // 點數設定
  points: number;                // 基礎點數
  
  // 限制條件
  limits: {
    dailyMax: number | null;     // 每日上限（null=無限）
    weeklyMax: number | null;    // 每週上限
    monthlyMax: number | null;   // 每月上限
    totalMax: number | null;     // 總上限
    cooldownMinutes: number;     // 冷卻時間（分鐘）
  };
  
  // 狀態
  isActive: boolean;
  isSystemRule: boolean;         // 系統規則不可刪除
  
  // 時間戳記
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 範例文件

```javascript
// pointsRules/daily_login
{
  id: 'daily_login',
  name: '每日登入',
  description: '每天首次登入獲得點數',
  icon: '📅',
  category: 'engagement',
  points: 5,
  limits: {
    dailyMax: 5,
    weeklyMax: null,
    monthlyMax: null,
    totalMax: null,
    cooldownMinutes: 1440  // 24 小時
  },
  isActive: true,
  isSystemRule: true,
  createdAt: Timestamp,
  updatedAt: Timestamp
}

// pointsRules/referral_success
{
  id: 'referral_success',
  name: '推薦成功',
  description: '成功推薦好友付費訂閱',
  icon: '🎉',
  category: 'referral',
  points: 500,
  limits: {
    dailyMax: null,
    weeklyMax: null,
    monthlyMax: null,
    totalMax: null,
    cooldownMinutes: 0
  },
  isActive: true,
  isSystemRule: true,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 3️⃣ redeemableItems（兌換商品）

### 結構

```typescript
interface RedeemableItem {
  // 基本資訊
  id: string;
  name: string;                  // 商品名稱
  description: string;           // 商品說明
  image: string;                 // 圖片 URL
  
  // 分類
  category: 'subscription' | 'merchandise' | 'digital';
  
  // 點數設定
  pointsCost: number;            // 所需點數
  
  // 庫存設定
  stock: number;                 // 庫存數量 (-1=無限)
  stockUsed: number;             // 已兌換數量
  
  // 限制
  limits: {
    perUserMax: number | null;   // 每人最多兌換次數
    membershipRequired: string[]; // 需要的身分組（空=所有人）
  };
  
  // 狀態
  isActive: boolean;
  isFeatured: boolean;           // 是否推薦
  
  // 時間戳記
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}
```

### 範例文件

```javascript
// redeemableItems/extend_1_month
{
  id: 'extend_1_month',
  name: '延長訂閱 1 個月',
  description: '使用點數延長訂閱期限 1 個月',
  image: 'https://example.com/subscription-icon.png',
  category: 'subscription',
  pointsCost: 1000,
  stock: -1,
  stockUsed: 0,
  limits: {
    perUserMax: 12,
    membershipRequired: []
  },
  isActive: true,
  isFeatured: true,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: 'system'
}

// redeemableItems/brand_tshirt
{
  id: 'brand_tshirt',
  name: 'Ultra Advisor 品牌 T-Shirt',
  description: '限量版品牌 T-Shirt，只送不賣',
  image: 'https://example.com/tshirt.png',
  category: 'merchandise',
  pointsCost: 2000,
  stock: 100,
  stockUsed: 12,
  limits: {
    perUserMax: 2,
    membershipRequired: ['founder', 'paid']
  },
  isActive: true,
  isFeatured: true,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: 'admin_uid'
}
```

---

## 4️⃣ pointsLedger（點數帳本）

### 結構

```typescript
interface PointsLedgerEntry {
  // 基本資訊
  id: string;                    // 自動生成
  userId: string;                // 用戶 UID
  
  // 交易資訊
  type: 'earn' | 'spend' | 'adjust' | 'expire';
  amount: number;                // 正數=獲得，負數=消費/過期
  balanceBefore: number;         // 交易前餘額
  balanceAfter: number;          // 交易後餘額
  
  // 來源追蹤
  ruleId: string | null;         // 對應 pointsRules.id
  itemId: string | null;         // 對應 redeemableItems.id
  reason: string;                // 說明文字
  
  // 點數過期時間（僅 type='earn' 時有值）
  expiresAt: Timestamp | null;   // 12 個月後過期
  isExpired: boolean;            // 是否已過期
  
  // 關聯資料
  referenceId: string | null;    // 關聯的訂單/活動 ID
  referenceType: string | null;  // 關聯類型
  
  // 時間戳記
  createdAt: Timestamp;
  createdBy: string;             // 'system' 或管理員 UID
}
```

### 索引

```
索引 1：userId + createdAt (DESC)
索引 2：userId + type + createdAt (DESC)
索引 3：expiresAt + isExpired（用於過期處理）
```

### 範例文件

```javascript
// pointsLedger/auto-generated-id-1
{
  id: 'abc123',
  userId: 'user_uid_123',
  type: 'earn',
  amount: 500,
  balanceBefore: 1000,
  balanceAfter: 1500,
  ruleId: 'referral_success',
  itemId: null,
  reason: '成功推薦用戶 user_456 付費訂閱',
  expiresAt: Timestamp.fromDate(new Date('2027-01-12')),
  isExpired: false,
  referenceId: 'user_456',
  referenceType: 'referral',
  createdAt: Timestamp.now(),
  createdBy: 'system'
}

// pointsLedger/auto-generated-id-2
{
  id: 'def456',
  userId: 'user_uid_123',
  type: 'spend',
  amount: -2000,
  balanceBefore: 3000,
  balanceAfter: 1000,
  ruleId: null,
  itemId: 'brand_tshirt',
  reason: '兌換 Ultra Advisor 品牌 T-Shirt',
  expiresAt: null,
  isExpired: false,
  referenceId: 'order_789',
  referenceType: 'redemption',
  createdAt: Timestamp.now(),
  createdBy: 'system'
}
```

---

## 5️⃣ redemptionOrders（兌換訂單）

### 結構

```typescript
interface RedemptionOrder {
  id: string;
  userId: string;
  userEmail: string;             // 冗餘儲存，方便查詢
  
  // 商品資訊
  itemId: string;
  itemName: string;              // 冗餘儲存
  pointsCost: number;
  
  // 訂單狀態
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  
  // 備註
  note: string;                  // 管理員備註
  userNote: string;              // 用戶備註（如尺寸、地址）
  
  // 時間戳記
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt: Timestamp | null;
  processedBy: string | null;    // 處理的管理員 UID
}
```

---

## 6️⃣ operationLogs（操作日誌）

### 結構

```typescript
interface OperationLog {
  id: string;
  
  // 操作者
  operatorId: string;            // 管理員 UID
  operatorEmail: string;         // 管理員 Email
  
  // 操作資訊
  action: string;                // 操作類型
  module: 'membershipTiers' | 'pointsRules' | 'redeemableItems' | 
          'pointsLedger' | 'users' | 'redemptionOrders';
  
  // 目標資訊
  targetId: string | null;       // 目標文件 ID
  targetName: string | null;     // 目標名稱（方便顯示）
  
  // 變更記錄
  changes: {
    before: object | null;       // 變更前資料
    after: object | null;        // 變更後資料
  };
  
  // 說明
  description: string;           // 操作說明
  
  // 時間戳記
  createdAt: Timestamp;
  
  // IP 資訊（可選）
  ipAddress: string | null;
  userAgent: string | null;
}
```

### 索引

```
索引 1：operatorId + createdAt (DESC)
索引 2：module + createdAt (DESC)
索引 3：targetId + createdAt (DESC)
```

### Action 類型列表

```javascript
const OPERATION_ACTIONS = {
  // 身分組
  TIER_CREATE: '建立身分組',
  TIER_UPDATE: '更新身分組',
  TIER_DELETE: '刪除身分組',
  TIER_TOGGLE: '啟用/停用身分組',
  
  // 點數規則
  RULE_CREATE: '建立點數規則',
  RULE_UPDATE: '更新點數規則',
  RULE_DELETE: '刪除點數規則',
  RULE_TOGGLE: '啟用/停用點數規則',
  
  // 兌換商品
  ITEM_CREATE: '建立兌換商品',
  ITEM_UPDATE: '更新兌換商品',
  ITEM_DELETE: '刪除兌換商品',
  ITEM_TOGGLE: '啟用/停用兌換商品',
  ITEM_STOCK_ADJUST: '調整庫存',
  
  // 點數調整
  POINTS_MANUAL_ADJUST: '手動調整點數',
  
  // 用戶管理
  USER_TIER_CHANGE: '變更用戶身分組',
  USER_EXTEND_TRIAL: '延長試用期',
  USER_DELETE: '刪除用戶',
  
  // 訂單處理
  ORDER_STATUS_CHANGE: '變更訂單狀態'
};
```

---

## 7️⃣ users Collection 擴充

### 新增欄位

```typescript
// 在現有 users 文件中新增以下欄位
interface UserExtension {
  // 身分組（多重支援）
  membershipTierIds: string[];   // ['founder', 'paid']
  primaryTierId: string;         // 'founder'（優先級最高的）
  
  // UA 點數
  points: number;                // 當前餘額
  totalPointsEarned: number;     // 累計獲得
  totalPointsSpent: number;      // 累計消費
  
  // 推薦系統
  referralCode: string;          // 自訂推薦碼
  referredBy: string | null;     // 推薦人 UID
  referralCount: number;         // 成功推薦人數
  
  // 點數相關時間戳記
  lastPointsEarnedAt: Timestamp | null;
  lastLoginRewardAt: Timestamp | null;  // 用於每日登入獎勵判斷
}
```

### 預設值（新用戶）

```javascript
{
  membershipTierIds: ['trial'],
  primaryTierId: 'trial',
  points: 0,
  totalPointsEarned: 0,
  totalPointsSpent: 0,
  referralCode: generateReferralCode(), // 自動生成
  referredBy: null,
  referralCount: 0,
  lastPointsEarnedAt: null,
  lastLoginRewardAt: null
}
```

---

## 🔒 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 管理員檢查函數
    function isAdmin() {
      return exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // 身分組：所有人可讀，管理員可寫
    match /membershipTiers/{tierId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // 點數規則：所有人可讀，管理員可寫
    match /pointsRules/{ruleId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // 兌換商品：所有人可讀，管理員可寫
    match /redeemableItems/{itemId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // 點數帳本：本人可讀，系統/管理員可寫
    match /pointsLedger/{entryId} {
      allow read: if request.auth.uid == resource.data.userId || isAdmin();
      allow create: if false; // 只能透過 Cloud Functions
      allow update, delete: if isAdmin();
    }
    
    // 兌換訂單：本人可讀，管理員可讀寫
    match /redemptionOrders/{orderId} {
      allow read: if request.auth.uid == resource.data.userId || isAdmin();
      allow create: if request.auth != null;
      allow update, delete: if isAdmin();
    }
    
    // 操作日誌：管理員可讀，系統可寫
    match /operationLogs/{logId} {
      allow read: if isAdmin();
      allow write: if false; // 只能透過 Cloud Functions 或管理員 SDK
    }
  }
}
```

---

## 📝 備註

### 關於多重身分組

- 用戶可以同時擁有多個身分組
- `membershipTierIds` 陣列儲存所有身分組
- `primaryTierId` 為優先級最高的身分組，用於顯示
- 權限計算時取所有身分組的聯集（最寬鬆）
- 點數倍率取最高值

### 關於點數過期

- 每筆獲得的點數有獨立的過期時間（12 個月）
- 消費時優先扣除即將過期的點數（FIFO）
- Cloud Function 每日掃描並標記過期點數
- 過期點數會產生 `type: 'expire'` 的帳本記錄

### 關於推薦碼

- 用戶可自訂推薦碼（需唯一性檢查）
- 格式建議：`ULTRA-[自訂內容]`，最長 20 字元
- 預設自動生成：`ULTRA-[用戶名前4字]-[隨機4碼]`
