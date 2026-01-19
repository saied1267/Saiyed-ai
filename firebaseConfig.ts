
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Vite এর জন্য process.env ব্যবহার করা হয়েছে যা vite.config.ts এ ডিফাইন করা আছে।
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.FIREBASE_PROJECT_ID || "",
  storageBucket: `${process.env.FIREBASE_PROJECT_ID || "saiyed-ai"}.firebasestorage.app`,
  messagingSenderId: "959677024114",
  appId: "1:959677024114:web:b583e68494063dc9d53feb",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// গুগল লগইন পপআপ সেটিংস
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
