import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";       // 1. 引入驗證功能
import { getFirestore } from "firebase/firestore"; // 2. 引入資料庫功能
import { getStorage } from "firebase/storage"; // 3. 引入儲存功能（大頭貼上傳用）

// ------------------------------------------------------------------
// Firebase 設定區域 (您的專屬身分證)
// ------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyAqS6fhHQVyBNr1LCkCaQPyJ13Rkq7bfHA",
  authDomain: "grbt-f87fa.firebaseapp.com",
  projectId: "grbt-f87fa",
  storageBucket: "grbt-f87fa.firebasestorage.app",
  messagingSenderId: "169700005946",
  appId: "1:169700005946:web:9b0722f31aa9fe7ad13d03",
  measurementId: "G-58N4KK9M5W"
};

// 初始化 Firebase 應用程式
const app = initializeApp(firebaseConfig);

// 匯出功能讓 App.tsx 使用
export const auth = getAuth(app);       // 匯出「守門員 (Auth)」
export const db = getFirestore(app);    // 匯出「檔案櫃 (Firestore)」
export const storage = getStorage(app); // 匯出「倉庫 (Storage)」- 大頭貼上傳用