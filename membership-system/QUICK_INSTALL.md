# 🚀 Ultra Advisor 身分組 + UA 點系統 - 快速安裝指南

> **預計安裝時間**: 15-30 分鐘  
> **難度**: ⭐⭐ 中等

---

## 📦 檔案清單

```
membership-system/
├── IMPLEMENTATION_GUIDE.md          # 完整實作指南
├── QUICK_INSTALL.md                  # 本文件
├── firestore/
│   ├── collections-schema.md        # 資料結構設計文檔
│   └── firestore-init-data.js       # 初始化資料腳本
└── admin/src/
    ├── App.jsx                       # 更新版（含新路由）
    ├── components/
    │   └── Layout.jsx                # 更新版（含新選單）
    └── pages/
        ├── MembershipOverview.jsx    # 會員系統概覽
        ├── MembershipTiers.jsx       # 身分組管理
        ├── PointsRules.jsx           # 點數規則管理
        ├── RedeemableItems.jsx       # 兌換商品管理
        ├── PointsLedger.jsx          # 點數帳本
        ├── OperationLogs.jsx         # 操作日誌
        └── Users.jsx                 # 更新版（含身分組整合）
```

---

## 🔧 Step 1: 備份現有檔案

```powershell
# 進入後台目錄
cd C:\Users\User\financial-planner\admin

# 備份現有檔案
mkdir backup
copy src\App.jsx backup\App.jsx.bak
copy src\components\Layout.jsx backup\Layout.jsx.bak
copy src\pages\Users.jsx backup\Users.jsx.bak
```

---

## 📥 Step 2: 複製新檔案

### 2.1 覆蓋更新檔案

將以下檔案覆蓋到對應位置：

| 新檔案 | 目標位置 |
|--------|----------|
| `admin/src/App.jsx` | `admin/src/App.jsx` |
| `admin/src/components/Layout.jsx` | `admin/src/components/Layout.jsx` |
| `admin/src/pages/Users.jsx` | `admin/src/pages/Users.jsx` |

### 2.2 新增檔案

將以下新檔案放到 `admin/src/pages/` 目錄：

- `MembershipOverview.jsx`
- `MembershipTiers.jsx`
- `PointsRules.jsx`
- `RedeemableItems.jsx`
- `PointsLedger.jsx`
- `OperationLogs.jsx`

---

## 🗄️ Step 3: 初始化 Firestore 資料

### 方法 A: 使用 Firebase Console（推薦新手）

1. 前往 [Firebase Console](https://console.firebase.google.com)
2. 選擇專案 `grbt-f87fa`
3. 進入 **Firestore Database**
4. 手動建立以下 Collections：

#### 建立 `membershipTiers` Collection

點擊 **「新增集合」** → 輸入 `membershipTiers`

新增文件 ID: `founder`
```json
{
  "id": "founder",
  "name": "🏆 創始會員",
  "description": "前 100 名限量，永久專屬特權",
  "icon": "🏆",
  "color": "#f59e0b",
  "priority": 1,
  "isDefault": false,
  "isActive": true,
  "isPermanent": true,
  "pointsMultiplier": 2.0,
  "permissions": {
    "canUseTools": true,
    "canExport": true,
    "canAccessAI": true,
    "maxClients": -1,
    "canEarnPoints": true,
    "canRedeemPoints": true
  },
  "benefits": [
    "永久享有早鳥價格鎖定",
    "優先體驗所有新功能",
    "專屬 VIP 社群"
  ],
  "badgeStyle": {
    "background": "rgba(245, 158, 11, 0.2)",
    "border": "#f59e0b",
    "text": "#f59e0b"
  }
}
```

新增文件 ID: `paid`
```json
{
  "id": "paid",
  "name": "💎 付費會員",
  "description": "年繳訂閱用戶，享完整功能",
  "icon": "💎",
  "color": "#22c55e",
  "priority": 2,
  "isDefault": false,
  "isActive": true,
  "isPermanent": false,
  "pointsMultiplier": 1.5,
  "permissions": {
    "canUseTools": true,
    "canExport": true,
    "canAccessAI": true,
    "maxClients": -1,
    "canEarnPoints": true,
    "canRedeemPoints": true
  },
  "benefits": [
    "完整工具存取",
    "無限客戶檔案",
    "報表匯出功能"
  ],
  "badgeStyle": {
    "background": "rgba(34, 197, 94, 0.2)",
    "border": "#22c55e",
    "text": "#22c55e"
  }
}
```

新增文件 ID: `trial`
```json
{
  "id": "trial",
  "name": "🆓 試用會員",
  "description": "7 天免費試用，體驗完整功能",
  "icon": "🆓",
  "color": "#3b82f6",
  "priority": 3,
  "isDefault": true,
  "isActive": true,
  "isPermanent": false,
  "pointsMultiplier": 1.0,
  "permissions": {
    "canUseTools": true,
    "canExport": true,
    "canAccessAI": true,
    "maxClients": 10,
    "canEarnPoints": true,
    "canRedeemPoints": false
  },
  "benefits": [
    "7 天完整功能體驗",
    "最多 10 位客戶檔案"
  ],
  "badgeStyle": {
    "background": "rgba(59, 130, 246, 0.2)",
    "border": "#3b82f6",
    "text": "#3b82f6"
  }
}
```

#### 建立 `pointsRules` Collection

新增文件 ID: `daily_login`
```json
{
  "id": "daily_login",
  "name": "每日登入",
  "description": "每天首次登入系統獲得點數",
  "icon": "📅",
  "category": "engagement",
  "points": 5,
  "limits": {
    "dailyMax": 5,
    "cooldownMinutes": 1440
  },
  "isActive": true,
  "isSystemRule": true
}
```

新增文件 ID: `referral_success`
```json
{
  "id": "referral_success",
  "name": "推薦成功",
  "description": "成功推薦好友付費訂閱",
  "icon": "🎉",
  "category": "referral",
  "points": 500,
  "limits": {},
  "isActive": true,
  "isSystemRule": true
}
```

#### 建立 `redeemableItems` Collection

新增文件 ID: `extend_1_month`
```json
{
  "id": "extend_1_month",
  "name": "延長訂閱 1 個月",
  "description": "使用點數延長訂閱期限 1 個月",
  "image": "",
  "category": "subscription",
  "pointsCost": 1000,
  "stock": -1,
  "stockUsed": 0,
  "limits": {
    "perUserMax": 12,
    "membershipRequired": []
  },
  "isActive": true,
  "isFeatured": true
}
```

### 方法 B: 使用腳本（進階）

```powershell
# 進入 functions 目錄
cd C:\Users\User\financial-planner\functions

# 複製初始化腳本
# 將 firestore-init-data.js 複製到此目錄

# 執行腳本
node firestore-init-data.js
```

---

## 🚀 Step 4: 啟動測試

```powershell
# 進入後台目錄
cd C:\Users\User\financial-planner\admin

# 啟動開發伺服器
npm run dev
```

打開瀏覽器：http://localhost:3001

---

## ✅ Step 5: 功能驗證

### 5.1 檢查選單

登入後，左側選單應該顯示：

```
📊 儀表板
👥 用戶管理
🏆 會員系統 ◀ 新增！
   ├── 📋 系統概覽
   ├── 🎖️ 身分組管理
   ├── 💎 點數規則
   ├── 🎁 兌換商品
   ├── 📒 點數帳本
   └── 📜 操作日誌
📝 內容管理
🤖 LINE Bot
📈 統計分析
⚙️ 系統設定
```

### 5.2 測試各頁面

- [ ] 點擊「系統概覽」→ 應顯示統計卡片
- [ ] 點擊「身分組管理」→ 應顯示 5 個預設身分組
- [ ] 點擊「點數規則」→ 應顯示預設規則
- [ ] 點擊「兌換商品」→ 應顯示預設商品
- [ ] 點擊「用戶管理」→ 應顯示用戶列表，含身分組標籤

### 5.3 測試操作

- [ ] 新增身分組 → 操作日誌應記錄
- [ ] 編輯點數規則 → 操作日誌應記錄
- [ ] 變更用戶身分組 → 操作日誌應記錄

---

## 🐛 常見問題

### Q1: 選單沒有出現「會員系統」

**原因**: `Layout.jsx` 沒有正確覆蓋

**解決**:
1. 確認 `admin/src/components/Layout.jsx` 已更新
2. 清除瀏覽器快取 (Ctrl+Shift+R)
3. 重啟開發伺服器

### Q2: 點擊會員系統頁面顯示空白

**原因**: 新頁面檔案沒有放到正確位置

**解決**:
1. 確認 `admin/src/pages/` 目錄下有 6 個新檔案
2. 確認 `App.jsx` 已更新並正確 import

### Q3: Firestore 權限錯誤

**原因**: Firestore 規則不允許讀取新 Collections

**解決**: 暫時使用開發模式規則
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Q4: 身分組列表是空的

**原因**: 還沒初始化資料

**解決**: 參照 Step 3 初始化 Firestore 資料

---

## 📋 檢查清單

安裝完成後，確認以下項目：

- [ ] 後台可正常登入
- [ ] 左側選單顯示「會員系統」及子選單
- [ ] 系統概覽頁面顯示統計數據
- [ ] 身分組管理頁面顯示 3-5 個身分組
- [ ] 可以新增/編輯身分組
- [ ] 點數規則頁面顯示預設規則
- [ ] 兌換商品頁面顯示預設商品
- [ ] 用戶管理頁面顯示身分組標籤
- [ ] 可以變更用戶身分組
- [ ] 操作日誌正確記錄

---

## 🔜 下一步

Phase 1 安裝完成後，可以進行：

1. **自訂身分組**: 新增 VIP、企業版等身分組
2. **設定點數規則**: 調整各行為的點數值
3. **新增兌換商品**: 設定實際可兌換的商品
4. **測試點數調整**: 手動給用戶加點測試

Phase 2（下次實作）將包含：
- Cloud Functions 自動發點
- 推薦系統完整流程
- 點數過期處理

---

## 💬 需要幫助？

有問題請提供：
1. 錯誤截圖
2. 瀏覽器 Console 錯誤訊息
3. 執行的操作步驟

我會協助你解決！
