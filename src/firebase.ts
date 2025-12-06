import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ------------------------------------------------------------------
// Firebase 設定區域
// ------------------------------------------------------------------
// 修正：填回您原本的專案設定值，這樣在 Vercel 才能運作
const apiKey = "AIzaSyAqS6fhHQVyBNr1LCkCaQPyJ13Rkq7bfHA"; 
const authDomain = "grbt-f87fa.firebaseapp.com";
const projectId = "grbt-f87fa";
const storageBucket = "grbt-f87fa.firebasestorage.app";
const messagingSenderId = "169700005946";
const appId = "1:169700005946:web:9b0722f31aa9fe7ad13d03";

// @ts-ignore
const firebaseConfig = typeof __firebase_config !== 'undefined' 
// @ts-ignore
  ? JSON.parse(__firebase_config) 
  : {
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

// 匯出功能供其他檔案使用
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);