import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ⚠️ 這是根據您之前的截圖填入的真實設定
const firebaseConfig = {
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

// 匯出功能給 App.tsx 使用
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;