import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 👇 這裡保留您原本的設定 (請確認 apiKey 等數值是您自己的)
const firebaseConfig = {
  // ... 請確認這裡填的是您截圖中的那些亂碼 (apiKey, authDomain 等) ...
  // 如果您懶得再複製一次，可以直接用您原本的數值取代這裡
  apiKey: "AIzaSyAqs6fhHQVyBNr1LCkCaQPyJ13Rkq7bfHA", 
  authDomain: "grbt-f87fa.firebaseapp.com",
  projectId: "grbt-f87fa",
  storageBucket: "grbt-f87fa.firebasestorage.app",
  messagingSenderId: "169700005946",
  appId: "1:169700005946:web:9b0722f31aa9fe7ad13d03",
  measurementId: "G-58N4KK9M5W"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 👇 關鍵差異！我們必須把這些功能「匯出」，主程式才用得到
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;
```

*(註：我已經幫您把截圖中的 Config 數值填進去了，您可以直接複製上面這段代碼覆蓋即可！)*

---

### 2. 下一步：啟動與測試 (見證奇蹟)

修正完上面的檔案存檔後，我們就可以啟動 APP 來看看成果了。

1.  **啟動程式**：
    在 VS Code 下方的終端機（黑色視窗）輸入：
    ```bash
    npm run dev