
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

/**
 * সাঈদ ভাই, কোড থেকে সব কি (Key) সরিয়ে দেওয়া হয়েছে। 
 * এগুলো এখন আপনার Netlify Environment Variables থেকে আসবে।
 * নেটলিফাইতে নিচের নামগুলোতে ভ্যালুগুলো সেভ করুন:
 * 1. FIREBASE_API_KEY
 * 2. FIREBASE_AUTH_DOMAIN
 * 3. FIREBASE_PROJECT_ID
 */

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`,
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
