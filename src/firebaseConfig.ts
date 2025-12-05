import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ------------------------------------------------------------------
// 強制修復模式：
// 為了避免 Vercel 後台的環境變數 (Environment Variables) 存有舊的、錯誤的 Key，
// 這裡暫時「不讀取」環境變數，直接鎖定使用您剛剛確認過正確的 API Key。
// ------------------------------------------------------------------

// 正確 Key (大寫 S): AIzaSyAqS6fhHQVyBNr1LCkCaQPyJ13Rkq7bfHA
// 錯誤 Key (小寫 s): AIzaSyAqs6fhHQVyBNr1LCkCaQPyJ13Rkq7bfHA

const apiKey = "AIzaSyAqS6fhHQVyBNr1LCkCaQPyJ13Rkq7bfHA"; // 直接鎖定正確 Key
const authDomain = "grbt-f87fa.firebaseapp.com";
const projectId = "grbt-f87fa";
const storageBucket = "grbt-f87fa.firebasestorage.app";
const messagingSenderId = "169700005946";
const appId = "1:169700005946:web:9b0722f31aa9fe7ad13d03";

// --- 診斷區域 ---
console.log(`✅ 強制使用硬編碼 API Key (前五碼 Check): ${apiKey.substring(0, 5)}...`);
if (apiKey.includes("Aqs6")) {
  console.error("❌ 警告：偵測到 Key 含有小寫 's'，這可能是錯誤的來源！");
} else if (apiKey.includes("AqS6")) {
  console.log("✅ 檢測通過：Key 含有正確的大寫 'S'");
}

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: authDomain,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId: messagingSenderId,
  appId: appId,
  measurementId: "G-58N4KK9M5W"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;