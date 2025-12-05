import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ------------------------------------------------------------------
// 雙重保險設定：
// 優先讀取環境變數，如果 Vercel 還沒生效 (undefined)，自動使用後面的備用字串
// 這樣可以保證您的網站絕對不會因為讀不到變數而壞掉
// ------------------------------------------------------------------
// 修正：已更新 API Key 為正確版本 (修正大小寫 s -> S)
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAqS6fhHQVyBNr1LCkCaQPyJ13Rkq7bfHA";
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "grbt-f87fa.firebaseapp.com";
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || "grbt-f87fa";
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "grbt-f87fa.firebasestorage.app";
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "169700005946";
const appId = import.meta.env.VITE_FIREBASE_APP_ID || "1:169700005946:web:9b0722f31aa9fe7ad13d03";

// --- 診斷區域 (除錯用) ---
if (!import.meta.env.VITE_FIREBASE_API_KEY) {
  console.warn("⚠️ 注意：目前正在使用「備用硬編碼 Key」，因為偵測不到環境變數。這不影響功能，但建議之後重新部署 Vercel。");
} else {
  console.log("✅ 成功讀取 Vercel 環境變數模式");
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