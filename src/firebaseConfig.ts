import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAqS6fhHQVyBNr1LCkCaQPyJ13Rkq7bfHA", 
  authDomain: "grbt-f87fa.firebaseapp.com",
  projectId: "grbt-f87fa",
  storageBucket: "grbt-f87fa.firebasestorage.app",
  messagingSenderId: "169700005946",
  appId: "1:169700005946:web:9b0722f31aa9fe7ad13d03",
  measurementId: "G-58N4KK9M5W"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;