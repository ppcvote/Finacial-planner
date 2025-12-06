import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ------------------------------------------------------------------
// Firebase 設定區域
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

// 1. 初始化 Firebase 應用程式
const app = initializeApp(firebaseConfig);

// 2. 初始化並匯出驗證與資料庫功能 (App.tsx 會用到這些)
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// (可選) 如果您以後需要分析功能再加回來，目前先保持簡單以免出錯
// import { getAnalytics } from "firebase/analytics";
// const analytics = getAnalytics(app);