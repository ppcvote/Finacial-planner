import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyAFBZewXFrV8Q1GqoMwx0METphFH12VXRM",
  authDomain: "grbt-f87fa.firebaseapp.com",
  projectId: "grbt-f87fa",
  storageBucket: "grbt-f87fa.firebasestorage.app",
  messagingSenderId: "169700005946",
  appId: "1:169700005946:web:34dc698c531ff9ccd13d03",
  measurementId: "G-Q67KR18V0L"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 導出服務
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;