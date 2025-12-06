import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ------------------------------------------------------------------
// Firebase 設定區域
// ------------------------------------------------------------------
const apiKey = ""; // API Key 由環境自動提供
const authDomain = "grbt-f87fa.firebaseapp.com";
const projectId = "grbt-f87fa";
const storageBucket = "grbt-f87fa.firebasestorage.app";
const messagingSenderId = "169700005946";
const appId = "1:169700005946:web:9b0722f31aa9fe7ad13d03";

// 為了讓 Preview 與 Vercel 都能運作，這裡做一些環境判斷
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

const app = initializeApp(firebaseConfig);

// 重點：這裡必須使用 export，App.tsx 才能 import 到它們
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);