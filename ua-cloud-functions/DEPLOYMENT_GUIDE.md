# 🚀 Ultra Advisor Cloud Functions 部署指南

## 📋 功能清單

| Function | 觸發方式 | 說明 |
|----------|----------|------|
| `onDailyLogin` | HTTPS Callable | 每日登入獎勵 +5 點 |
| `onToolUse` | HTTPS Callable | 工具使用獎勵 +10 點（每日上限 10 次）|
| `onFirstClient` | HTTPS Callable | 建立首位客戶 +50 點（終身一次）|
| `processReferral` | HTTPS Callable | 推薦獎勵（雙向各 +500 點）|
| `updateReferralCode` | HTTPS Callable | 用戶自訂推薦碼 |
| `getUserPointsSummary` | HTTPS Callable | 取得用戶點數摘要 |
| `expirePoints` | 排程（每日 3:00）| 檢查並處理過期點數 |
| `checkMembershipExpiry` | 排程（每日 4:00）| 會員到期自動降級 |
| `awardActivityPoints` | HTTPS Callable | 管理員手動發放獎勵 |

---

## 🛠️ 部署步驟

### Step 1：安裝 Firebase CLI（如果還沒有）

```powershell
npm install -g firebase-tools
firebase login
```

### Step 2：初始化 Functions（如果還沒有）

```powershell
cd C:\Users\User\financial-planner
firebase init functions
```

選擇：
- ✅ Use an existing project → `grbt-f87fa`
- ✅ JavaScript
- ✅ ESLint → No
- ✅ Install dependencies → Yes

### Step 3：複製程式碼

將以下檔案放到 `functions/` 資料夾：

```
functions/
├── index.js          ← 主要程式碼
├── package.json      ← 依賴設定
└── .eslintrc.js      ← （可選）
```

### Step 4：安裝依賴

```powershell
cd functions
npm install
```

### Step 5：部署

```powershell
firebase deploy --only functions
```

部署成功會顯示：
```
✔ functions: Finished running predeploy script.
✔ functions[onDailyLogin]: Successful create operation.
✔ functions[onToolUse]: Successful create operation.
...
✔ Deploy complete!
```

---

## 🔗 前端整合

### 方法 1：使用 Hook（推薦）

```jsx
// 1. 複製 usePoints.js 到 src/hooks/

// 2. 在元件中使用
import { usePoints } from '../hooks/usePoints';

function Dashboard() {
  const { triggerDailyLogin, triggerToolUse, getUserSummary } = usePoints();
  
  // 登入後呼叫
  useEffect(() => {
    triggerDailyLogin().then((result) => {
      if (result?.dailyReward?.success) {
        message.success(`獲得 ${result.dailyReward.points} 點！`);
      }
    });
  }, []);
  
  // 使用工具後呼叫
  const handleToolUse = async (toolName) => {
    // ... 工具邏輯
    await triggerToolUse(toolName);
  };
}
```

### 方法 2：直接呼叫 API

```jsx
import { pointsApi } from '../hooks/usePoints';

// 登入後
await pointsApi.dailyLogin();

// 使用工具後
await pointsApi.toolUse('退休規劃工具');

// 取得摘要
const summary = await pointsApi.getSummary();
console.log(summary.currentPoints);
```

---

## 📍 整合位置建議

### 1. 每日登入（LoginPage.tsx 或 App.tsx）

```jsx
// 在登入成功後
const handleLoginSuccess = async () => {
  // ... 現有登入邏輯
  
  // 觸發每日登入獎勵
  try {
    const result = await pointsApi.dailyLogin();
    if (result?.dailyReward?.success) {
      // 顯示獲得點數的通知
      notification.success({
        message: '每日登入獎勵',
        description: `獲得 ${result.dailyReward.points} UA 點！`,
      });
    }
    
    // 連續登入獎勵
    if (result?.streakReward?.success) {
      notification.success({
        message: `🔥 連續登入 ${result.loginStreak} 天！`,
        description: `獲得 ${result.streakReward.points} UA 點！`,
      });
    }
  } catch (err) {
    console.error('Daily login reward error:', err);
  }
};
```

### 2. 工具使用（各工具元件）

```jsx
// 在工具的「計算」或「產生報表」按鈕
const handleCalculate = async () => {
  // ... 現有計算邏輯
  
  // 觸發工具使用獎勵
  await pointsApi.toolUse('退休規劃工具');
};
```

### 3. 建立客戶（客戶管理頁面）

```jsx
// 在新增客戶成功後
const handleAddClient = async (clientData) => {
  // ... 新增客戶邏輯
  
  // 檢查是否為首位客戶
  if (clients.length === 0) {
    await pointsApi.firstClient();
  }
};
```

---

## 🔒 注意事項

### 1. Region 設定

如果你的 Firebase Functions 部署在不同區域，需要修改 `usePoints.js`：

```jsx
// 預設是 us-central1，台灣建議用 asia-east1
const functions = getFunctions(app, 'asia-east1');
```

### 2. 錯誤處理

所有 API 呼叫都應該包在 try-catch 中：

```jsx
try {
  const result = await pointsApi.dailyLogin();
} catch (error) {
  if (error.code === 'permission-denied') {
    // 權限不足
  } else if (error.code === 'unauthenticated') {
    // 未登入
  }
}
```

### 3. 排程任務

排程任務需要 Blaze 方案（付費方案），但用量很小基本上在免費額度內。

---

## 📊 測試方式

### 本地測試

```powershell
cd functions
firebase emulators:start --only functions
```

### 查看日誌

```powershell
firebase functions:log
```

### 手動觸發排程任務

```powershell
# 在 Firebase Console → Functions → 點擊函數 → 測試
```

---

## ❓ 常見問題

### Q1: 部署失敗 "Error: Cloud Functions requires Blaze plan"

升級到 Blaze 方案（有免費額度，用量小不會收費）

### Q2: 呼叫 Functions 出現 CORS 錯誤

確認使用 `httpsCallable` 而不是直接 fetch

### Q3: 排程任務沒有執行

1. 確認已部署成功
2. 檢查 Functions 日誌
3. 確認時區設定正確

---

## 🎉 完成！

部署完成後，你的會員系統就會自動：
- ✅ 每日登入發點數
- ✅ 使用工具發點數
- ✅ 連續登入獎勵
- ✅ 推薦獎勵（雙向）
- ✅ 12 個月後點數自動過期
- ✅ 會員到期自動降級（付費 → 寬限 → 過期）
