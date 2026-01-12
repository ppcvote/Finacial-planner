# 🎯 Ultra Advisor 身分組 + UA 點系統實作指南

> **版本**: v1.0.0  
> **日期**: 2026-01-12  
> **狀態**: Phase 1 實作中

---

## 📦 文件清單

```
membership-system/
├── IMPLEMENTATION_GUIDE.md          # 本文件
├── firestore/
│   ├── collections-schema.md        # Firestore 結構設計
│   └── firestore-init-data.js       # 初始化資料腳本
├── admin/
│   └── src/
│       ├── pages/
│       │   ├── MembershipOverview.jsx    # 會員系統概覽
│       │   ├── MembershipTiers.jsx       # 身分組管理
│       │   ├── PointsRules.jsx           # 點數規則管理
│       │   ├── RedeemableItems.jsx       # 兌換商品管理
│       │   ├── PointsLedger.jsx          # 點數帳本
│       │   └── OperationLogs.jsx         # 操作日誌
│       └── components/
│           ├── Layout.jsx                # 更新版（含新選單）
│           └── App.jsx                   # 更新版（含新路由）
└── functions/
    └── membership-functions.js       # Cloud Functions（Phase 2）
```

---

## 🔧 安裝步驟

### Step 1：複製後台文件

```powershell
# 複製新頁面到 admin/src/pages/
# 更新 Layout.jsx 和 App.jsx
```

### Step 2：初始化 Firestore 資料

```bash
# 在 Firebase Console 或使用腳本執行
node firestore-init-data.js
```

### Step 3：測試功能

1. 啟動後台 `npm run dev`
2. 登入後檢查左側選單「會員系統」
3. 測試各頁面功能

---

## 🗄️ Firestore 結構概覽

### 新增 Collections

| Collection | 說明 | 文件數估計 |
|------------|------|------------|
| `membershipTiers` | 身分組定義 | 5-10 |
| `pointsRules` | 點數規則 | 10-20 |
| `redeemableItems` | 兌換商品 | 10-50 |
| `pointsLedger` | 點數帳本 | 高成長 |
| `operationLogs` | 操作日誌 | 高成長 |

### users Collection 擴充欄位

```javascript
{
  // 既有欄位...
  
  // 🆕 身分組（支援多重）
  membershipTierIds: ['founder', 'paid'],  // 陣列，支援多重身分組
  primaryTierId: 'founder',                 // 主要身分組（顯示用）
  
  // 🆕 UA 點數
  points: 1500,                             // 當前餘額
  totalPointsEarned: 2000,                  // 累計獲得
  totalPointsSpent: 500,                    // 累計消費
  
  // 🆕 推薦系統
  referralCode: 'ULTRA-JOHN123',            // 我的推薦碼（自訂）
  referredBy: 'userId123',                  // 推薦人 UID
  referralCount: 3,                         // 成功推薦數
}
```

---

## 🎨 UI 預覽

### 左側選單結構

```
📊 儀表板
👥 用戶管理
🏆 會員系統 ▼
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

---

## ✅ 功能檢查清單

### Phase 1（本次實作）

- [ ] Firestore 結構設計完成
- [ ] 身分組管理頁面
- [ ] 點數規則管理頁面
- [ ] 兌換商品管理頁面
- [ ] 點數帳本查詢頁面
- [ ] 操作日誌頁面
- [ ] 用戶頁面整合身分組顯示
- [ ] 手動調整點數功能
- [ ] 初始化資料腳本

### Phase 2（下次實作）

- [ ] Cloud Functions：每日登入獎勵
- [ ] Cloud Functions：工具使用獎勵
- [ ] Cloud Functions：推薦獎勵
- [ ] Cloud Functions：點數過期處理
- [ ] 前端：用戶點數查詢頁面
- [ ] 前端：兌換商品頁面

---

## 📝 設計決策記錄

### 1. 多重身分組設計

**決策**：使用 `membershipTierIds` 陣列 + `primaryTierId` 主要身分組

**原因**：
- 創始會員可能同時是付費會員
- 需要保留所有身分組歷史
- 顯示時使用優先級最高的身分組

### 2. 點數過期機制

**決策**：12 個月過期，批次處理

**實作**：
- 每筆點數記錄 `expiresAt` 時間
- Cloud Function 每日掃描過期點數
- 過期時寫入 `type: 'expire'` 記錄

### 3. 操作日誌範圍

**決策**：記錄所有管理員操作

**包含**：
- 身分組 CRUD
- 點數規則 CRUD
- 兌換商品 CRUD
- 手動調整點數
- 用戶身分組變更

---

## 🚀 開始使用

請依序查看以下文件：

1. `firestore/collections-schema.md` - 了解資料結構
2. `firestore/firestore-init-data.js` - 初始化資料
3. `admin/src/` - 複製後台文件

有問題隨時詢問！
