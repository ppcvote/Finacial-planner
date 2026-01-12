# 📊 Ultra Advisor 會員系統 - 資料庫結構

> 版本：1.0.0  
> 更新日期：2026-01-12

---

## 🗄️ Firestore Collections 總覽

```
firestore/
├── users/                      # 用戶資料（擴充）
├── membershipTiers/            # 🆕 身分組定義
├── pointsRules/                # 🆕 點數規則
├── redeemableItems/            # 🆕 兌換商品
├── pointsLedger/               # 🆕 點數帳本
├── redemptionOrders/           # 🆕 兌換訂單
├── referralCodes/              # 🆕 推薦碼
└── auditLogs/                  # 🆕 操作日誌
```

---

## 1️⃣ users Collection（擴充）

### 新增欄位

```typescript
interface User {
  // === 現有欄位 ===
  email: string;
  displayName: string;
  createdAt: Timestamp;
  lastLoginAt?: Timestamp;
  lineUserId?: string;
  isActive: boolean;
  system: {
    dashboard: {
      displayName: string;
      announcement: string;
    };
  };

  // === 🆕 身分組相關 ===
  membershipTierIds: string[];        // 多重身分組（陣列）
  primaryTierId: string;              // 主要身分組（顯示用）
  membershipExpiresAt?: Timestamp;    // 付費會員到期時間（創始會員無此欄位）
  
  // === 🆕 UA 點數相關 ===
  points: number;                     // 當前可用點數
  totalPointsEarned: number;          // 累計獲得
  totalPointsSpent: number;           // 累計消費
  totalPointsExpired: number;         // 累計過期
  
  // === 🆕 推薦系統 ===
  referralCode: string;               // 我的推薦碼（自訂）
  referredBy?: string;                // 推薦人 userId
  referralCount: number;              // 成功推薦人數
  
  // === 🆕 統計追蹤 ===
  toolUsageCount: number;             // 工具使用次數
  loginStreak: number;                // 連續登入天數
  lastPointsEarnedAt?: Timestamp;     // 最後獲得點數時間
}
```

### 索引建議

```javascript
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "primaryTierId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "referralCode", "order": "ASCENDING" }
      ]
    }
  ]
}
```

---

## 2️⃣ membershipTiers Collection 🆕

### 結構定義

```typescript
interface MembershipTier {
  id: string;                         // 自動產生
  
  // === 基本資訊 ===
  name: string;                       // 顯示名稱（如：創始會員）
  slug: string;                       // 代碼（如：founder）
  icon: string;                       // Emoji 或圖示代碼
  color: string;                      // HEX 色碼
  description: string;                // 說明文字
  priority: number;                   // 排序優先級（數字越小越優先）
  
  // === 權限設定 ===
  permissions: {
    canUseTools: boolean;             // 可使用工具
    canExport: boolean;               // 可匯出報表
    canAccessAI: boolean;             // 可使用 AI 功能
    maxClients: number;               // 最大客戶數（-1 = 無限）
    canEarnPoints: boolean;           // 可獲得點數
    canRedeemPoints: boolean;         // 可兌換點數
    canAccessVIP: boolean;            // 可進入 VIP 社群
    canCustomReferral: boolean;       // 可自訂推薦碼
  };
  
  // === 點數設定 ===
  pointsMultiplier: number;           // 點數倍率（1.0, 1.5, 2.0）
  
  // === 有效期設定 ===
  isPermanent: boolean;               // 是否永久有效（如創始會員）
  defaultDurationDays?: number;       // 預設有效天數（付費會員用）
  
  // === 權益說明（前端展示用）===
  benefits: string[];                 // 權益列表
  
  // === 系統設定 ===
  isDefault: boolean;                 // 是否為預設身分組（新用戶）
  isActive: boolean;                  // 是否啟用
  canBeAssignedManually: boolean;     // 可手動指派
  canBeEarnedByReferral: boolean;     // 可透過推薦獲得
  
  // === 時間戳記 ===
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;                  // 管理員 UID
}
```

### 預設資料

```javascript
const defaultTiers = [
  {
    slug: 'founder',
    name: '🏆 創始會員',
    icon: '🏆',
    color: '#f59e0b',
    description: '前 100 名限量，永久特權',
    priority: 1,
    permissions: {
      canUseTools: true,
      canExport: true,
      canAccessAI: true,
      maxClients: -1,
      canEarnPoints: true,
      canRedeemPoints: true,
      canAccessVIP: true,
      canCustomReferral: true,
    },
    pointsMultiplier: 2.0,
    isPermanent: true,
    benefits: [
      '永久享有早鳥價格鎖定',
      '優先體驗所有新功能',
      '專屬 VIP 社群',
      '終身技術支援',
      '功能需求優先處理',
      '創始會員徽章',
      '點數 2 倍獲得',
    ],
    isDefault: false,
    isActive: true,
    canBeAssignedManually: true,
    canBeEarnedByReferral: false,
  },
  {
    slug: 'paid',
    name: '💎 付費會員',
    icon: '💎',
    color: '#22c55e',
    description: '標準年繳訂閱用戶',
    priority: 2,
    permissions: {
      canUseTools: true,
      canExport: true,
      canAccessAI: true,
      maxClients: -1,
      canEarnPoints: true,
      canRedeemPoints: true,
      canAccessVIP: false,
      canCustomReferral: true,
    },
    pointsMultiplier: 1.5,
    isPermanent: false,
    defaultDurationDays: 365,
    benefits: [
      '完整工具使用權限',
      '無限客戶檔案',
      '匯出報表功能',
      'AI 智能分析',
      '點數 1.5 倍獲得',
    ],
    isDefault: false,
    isActive: true,
    canBeAssignedManually: true,
    canBeEarnedByReferral: false,
  },
  {
    slug: 'trial',
    name: '🆓 試用會員',
    icon: '🆓',
    color: '#3b82f6',
    description: '7 天免費試用',
    priority: 3,
    permissions: {
      canUseTools: true,
      canExport: false,
      canAccessAI: false,
      maxClients: 3,
      canEarnPoints: true,
      canRedeemPoints: false,
      canAccessVIP: false,
      canCustomReferral: false,
    },
    pointsMultiplier: 1.0,
    isPermanent: false,
    defaultDurationDays: 7,
    benefits: [
      '完整功能試用',
      '最多 3 位客戶',
      '基礎點數獲得',
    ],
    isDefault: true,
    isActive: true,
    canBeAssignedManually: true,
    canBeEarnedByReferral: false,
  },
  {
    slug: 'grace',
    name: '⏰ 寬限期',
    icon: '⏰',
    color: '#eab308',
    description: '到期未續，唯讀 7 天',
    priority: 4,
    permissions: {
      canUseTools: false,
      canExport: false,
      canAccessAI: false,
      maxClients: 0,
      canEarnPoints: false,
      canRedeemPoints: false,
      canAccessVIP: false,
      canCustomReferral: false,
    },
    pointsMultiplier: 0,
    isPermanent: false,
    defaultDurationDays: 7,
    benefits: [
      '可查看歷史資料',
      '無法新增或編輯',
    ],
    isDefault: false,
    isActive: true,
    canBeAssignedManually: true,
    canBeEarnedByReferral: false,
  },
  {
    slug: 'expired',
    name: '❌ 已過期',
    icon: '❌',
    color: '#ef4444',
    description: '訂閱已過期',
    priority: 5,
    permissions: {
      canUseTools: false,
      canExport: false,
      canAccessAI: false,
      maxClients: 0,
      canEarnPoints: false,
      canRedeemPoints: false,
      canAccessVIP: false,
      canCustomReferral: false,
    },
    pointsMultiplier: 0,
    isPermanent: false,
    benefits: [],
    isDefault: false,
    isActive: true,
    canBeAssignedManually: true,
    canBeEarnedByReferral: false,
  },
];
```

---

## 3️⃣ pointsRules Collection 🆕

### 結構定義

```typescript
interface PointsRule {
  id: string;
  
  // === 基本資訊 ===
  actionId: string;                   // 行為代碼（如：daily_login）
  name: string;                       // 顯示名稱
  description: string;                // 說明
  icon: string;                       // Emoji
  category: 'engagement' | 'referral' | 'activity' | 'bonus';
  
  // === 點數設定 ===
  basePoints: number;                 // 基礎點數
  
  // === 限制條件 ===
  limits: {
    dailyMax?: number;                // 每日上限次數
    weeklyMax?: number;               // 每週上限次數
    monthlyMax?: number;              // 每月上限次數
    totalMax?: number;                // 總上限次數
    cooldownMinutes?: number;         // 冷卻時間（分鐘）
  };
  
  // === 條件觸發 ===
  triggerType: 'auto' | 'manual' | 'api';  // 觸發方式
  
  // === 系統設定 ===
  isActive: boolean;
  priority: number;                   // 顯示排序
  
  // === 時間戳記 ===
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 預設資料

```javascript
const defaultPointsRules = [
  {
    actionId: 'daily_login',
    name: '每日登入',
    description: '每天首次登入獲得點數',
    icon: '📅',
    category: 'engagement',
    basePoints: 5,
    limits: { dailyMax: 1 },
    triggerType: 'auto',
    isActive: true,
    priority: 1,
  },
  {
    actionId: 'tool_use',
    name: '使用工具',
    description: '每次使用工具獲得點數',
    icon: '🛠️',
    category: 'engagement',
    basePoints: 10,
    limits: { dailyMax: 10 },
    triggerType: 'auto',
    isActive: true,
    priority: 2,
  },
  {
    actionId: 'first_client',
    name: '建立首位客戶',
    description: '首次建立客戶檔案',
    icon: '👤',
    category: 'engagement',
    basePoints: 50,
    limits: { totalMax: 1 },
    triggerType: 'auto',
    isActive: true,
    priority: 3,
  },
  {
    actionId: 'referral_success',
    name: '推薦成功',
    description: '推薦新用戶並完成付費',
    icon: '🎁',
    category: 'referral',
    basePoints: 500,
    limits: {},
    triggerType: 'auto',
    isActive: true,
    priority: 4,
  },
  {
    actionId: 'referred_bonus',
    name: '被推薦獎勵',
    description: '透過推薦碼註冊並付費',
    icon: '🎉',
    category: 'referral',
    basePoints: 500,
    limits: { totalMax: 1 },
    triggerType: 'auto',
    isActive: true,
    priority: 5,
  },
  {
    actionId: 'activity_participation',
    name: '參與活動',
    description: '參與官方舉辦的活動',
    icon: '🎪',
    category: 'activity',
    basePoints: 100,
    limits: {},
    triggerType: 'manual',
    isActive: true,
    priority: 6,
  },
  {
    actionId: 'feedback_submit',
    name: '功能建議',
    description: '提交功能建議或回饋',
    icon: '💡',
    category: 'engagement',
    basePoints: 20,
    limits: { weeklyMax: 3 },
    triggerType: 'manual',
    isActive: true,
    priority: 7,
  },
  {
    actionId: 'login_streak_7',
    name: '連續登入 7 天',
    description: '連續 7 天登入獎勵',
    icon: '🔥',
    category: 'bonus',
    basePoints: 50,
    limits: { weeklyMax: 1 },
    triggerType: 'auto',
    isActive: true,
    priority: 8,
  },
  {
    actionId: 'admin_adjust',
    name: '管理員調整',
    description: '管理員手動調整點數',
    icon: '⚙️',
    category: 'bonus',
    basePoints: 0,
    limits: {},
    triggerType: 'manual',
    isActive: true,
    priority: 99,
  },
];
```

---

## 4️⃣ redeemableItems Collection 🆕

### 結構定義

```typescript
interface RedeemableItem {
  id: string;
  
  // === 基本資訊 ===
  name: string;                       // 商品名稱
  description: string;                // 商品說明
  image?: string;                     // 商品圖片 URL
  
  // === 點數與庫存 ===
  pointsCost: number;                 // 所需點數
  stock: number;                      // 庫存數量（-1 = 無限）
  stockUsed: number;                  // 已兌換數量
  
  // === 分類 ===
  category: 'subscription' | 'merchandise' | 'digital' | 'experience';
  
  // === 兌換設定 ===
  maxPerUser: number;                 // 每人最多兌換次數（-1 = 無限）
  requiresShipping: boolean;          // 是否需要寄送
  
  // === 自動處理（訂閱延長用）===
  autoAction?: {
    type: 'extend_subscription';
    days: number;                     // 延長天數
  };
  
  // === 系統設定 ===
  isActive: boolean;
  isFeatured: boolean;                // 是否為精選商品
  sortOrder: number;                  // 排序
  
  // === 有效期間 ===
  availableFrom?: Timestamp;          // 開始時間
  availableUntil?: Timestamp;         // 結束時間
  
  // === 時間戳記 ===
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 預設資料

```javascript
const defaultRedeemableItems = [
  {
    name: '訂閱延長 7 天',
    description: '將您的訂閱期限延長 7 天',
    pointsCost: 200,
    stock: -1,
    stockUsed: 0,
    category: 'subscription',
    maxPerUser: -1,
    requiresShipping: false,
    autoAction: { type: 'extend_subscription', days: 7 },
    isActive: true,
    isFeatured: true,
    sortOrder: 1,
  },
  {
    name: '訂閱延長 30 天',
    description: '將您的訂閱期限延長 30 天',
    pointsCost: 700,
    stock: -1,
    stockUsed: 0,
    category: 'subscription',
    maxPerUser: -1,
    requiresShipping: false,
    autoAction: { type: 'extend_subscription', days: 30 },
    isActive: true,
    isFeatured: true,
    sortOrder: 2,
  },
  {
    name: 'Ultra Advisor 限定 T-Shirt',
    description: '黑色限定款 T-Shirt，只送不賣',
    image: 'https://placehold.co/400x400/1e293b/f59e0b?text=UA+Tee',
    pointsCost: 2000,
    stock: 50,
    stockUsed: 0,
    category: 'merchandise',
    maxPerUser: 1,
    requiresShipping: true,
    isActive: true,
    isFeatured: true,
    sortOrder: 3,
  },
  {
    name: 'Ultra Advisor 限定馬克杯',
    description: '霧黑質感馬克杯，只送不賣',
    image: 'https://placehold.co/400x400/1e293b/3b82f6?text=UA+Mug',
    pointsCost: 1500,
    stock: 100,
    stockUsed: 0,
    category: 'merchandise',
    maxPerUser: 2,
    requiresShipping: true,
    isActive: true,
    isFeatured: false,
    sortOrder: 4,
  },
];
```

---

## 5️⃣ pointsLedger Collection 🆕

### 結構定義

```typescript
interface PointsLedgerEntry {
  id: string;
  
  // === 用戶資訊 ===
  userId: string;
  userEmail: string;                  // 冗餘儲存方便查詢
  
  // === 交易資訊 ===
  type: 'earn' | 'spend' | 'adjust' | 'expire' | 'refund';
  amount: number;                     // 正數=獲得，負數=消費/過期
  balanceBefore: number;              // 交易前餘額
  balanceAfter: number;               // 交易後餘額
  
  // === 來源追蹤 ===
  actionId: string;                   // 對應 PointsRule.actionId 或 RedeemableItem.id
  reason: string;                     // 說明文字
  
  // === 關聯資料 ===
  referenceType?: 'rule' | 'redemption' | 'referral' | 'admin';
  referenceId?: string;               // 關聯的訂單/活動 ID
  
  // === 點數有效期 ===
  expiresAt?: Timestamp;              // 點數過期時間（獲得後 12 個月）
  isExpired: boolean;
  
  // === 乘數紀錄 ===
  multiplierApplied: number;          // 套用的倍率
  baseAmount: number;                 // 原始點數（套用倍率前）
  
  // === 時間戳記 ===
  createdAt: Timestamp;
  createdBy: string;                  // 'system' 或管理員 UID
}
```

### 索引建議

```javascript
{
  "indexes": [
    {
      "collectionGroup": "pointsLedger",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "pointsLedger",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isExpired", "order": "ASCENDING" },
        { "fieldPath": "expiresAt", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "pointsLedger",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "type", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## 6️⃣ redemptionOrders Collection 🆕

### 結構定義

```typescript
interface RedemptionOrder {
  id: string;
  
  // === 用戶資訊 ===
  userId: string;
  userEmail: string;
  
  // === 商品資訊 ===
  itemId: string;
  itemName: string;                   // 冗餘儲存
  pointsCost: number;
  
  // === 訂單狀態 ===
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  
  // === 寄送資訊（如需要）===
  shippingInfo?: {
    name: string;
    phone: string;
    address: string;
    note?: string;
  };
  
  // === 處理紀錄 ===
  processedAt?: Timestamp;
  processedBy?: string;               // 管理員 UID
  processNote?: string;
  
  // === 關聯點數帳本 ===
  ledgerEntryId: string;
  
  // === 時間戳記 ===
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 7️⃣ referralCodes Collection 🆕

### 結構定義

```typescript
interface ReferralCode {
  id: string;                         // 即推薦碼本身
  
  // === 擁有者 ===
  ownerId: string;                    // 用戶 UID
  ownerEmail: string;
  
  // === 統計 ===
  usageCount: number;                 // 使用次數
  successCount: number;               // 成功轉換次數（付費）
  totalPointsGenerated: number;       // 產生的總點數
  
  // === 設定 ===
  isActive: boolean;
  maxUsage?: number;                  // 最大使用次數（-1 = 無限）
  
  // === 時間戳記 ===
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 8️⃣ auditLogs Collection 🆕

### 結構定義

```typescript
interface AuditLog {
  id: string;
  
  // === 操作者 ===
  adminId: string;
  adminEmail: string;
  
  // === 操作資訊 ===
  action: string;                     // 如：user.tier.update, points.adjust, item.create
  targetType: 'user' | 'tier' | 'rule' | 'item' | 'order' | 'system';
  targetId?: string;
  
  // === 變更內容 ===
  changes: {
    before?: any;                     // 變更前的值
    after?: any;                      // 變更後的值
    description: string;              // 變更說明
  };
  
  // === 環境資訊 ===
  ipAddress?: string;
  userAgent?: string;
  
  // === 時間戳記 ===
  createdAt: Timestamp;
}
```

### 操作類型列表

```javascript
const AUDIT_ACTIONS = {
  // 用戶相關
  'user.tier.update': '更新用戶身分組',
  'user.tier.add': '新增用戶身分組',
  'user.tier.remove': '移除用戶身分組',
  'user.points.adjust': '調整用戶點數',
  'user.delete': '刪除用戶',
  'user.extend_trial': '延長試用期',
  
  // 身分組相關
  'tier.create': '建立身分組',
  'tier.update': '更新身分組',
  'tier.delete': '刪除身分組',
  'tier.toggle': '啟用/停用身分組',
  
  // 點數規則相關
  'rule.create': '建立點數規則',
  'rule.update': '更新點數規則',
  'rule.toggle': '啟用/停用點數規則',
  
  // 兌換商品相關
  'item.create': '建立兌換商品',
  'item.update': '更新兌換商品',
  'item.toggle': '啟用/停用商品',
  'item.stock.adjust': '調整商品庫存',
  
  // 兌換訂單相關
  'order.process': '處理兌換訂單',
  'order.cancel': '取消兌換訂單',
  'order.refund': '退款兌換訂單',
  
  // 系統設定
  'system.config.update': '更新系統設定',
};
```

---

## 📋 Firestore 安全規則

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
      allow create: if isAdmin();  // 只有系統/管理員可建立
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
      allow read: if true;  // 公開讀取（驗證推薦碼）
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

## 🚀 初始化腳本

請參考 `scripts/init-firestore.js` 檔案。

---

## 📈 遷移指南

### 現有用戶資料遷移

```javascript
// 為現有用戶新增身分組欄位
const migrateExistingUsers = async () => {
  const usersSnapshot = await getDocs(collection(db, 'users'));
  
  const batch = writeBatch(db);
  
  usersSnapshot.docs.forEach((doc) => {
    const userData = doc.data();
    
    // 根據現有 subscriptionStatus 對應身分組
    let primaryTierId = 'trial';
    if (userData.subscriptionStatus === 'paid') {
      primaryTierId = 'paid';
    } else if (userData.subscriptionStatus === 'expired') {
      primaryTierId = 'expired';
    }
    
    batch.update(doc.ref, {
      membershipTierIds: [primaryTierId],
      primaryTierId: primaryTierId,
      points: 0,
      totalPointsEarned: 0,
      totalPointsSpent: 0,
      totalPointsExpired: 0,
      referralCode: generateReferralCode(), // 自動產生推薦碼
      referralCount: 0,
      toolUsageCount: 0,
      loginStreak: 0,
    });
  });
  
  await batch.commit();
};
```

---

## 🔗 相關文件

- `IMPLEMENTATION_GUIDE.md` - 實作指南
- `scripts/init-firestore.js` - 初始化腳本
- `functions/` - Cloud Functions 程式碼
