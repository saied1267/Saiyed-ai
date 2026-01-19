
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// সরাসরি স্ট্যাটিক ভেরিয়েবল এক্সেস
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_PROJECT_ID ? `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app` : "",
  messagingSenderId: process.env.FIREBASE_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// অত্যন্ত গুরুত্বপূর্ণ: যদি API Key না থাকে তবে অ্যাপ ক্রাশ না করে একটি ফ্ল্যাগ সেট করবে
export const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.apiKey.length > 10);

let app: FirebaseApp;

try {
  if (getApps().length > 0) {
    app = getApp();
  } else {
    // যদি কনফিগারেশন ইনভ্যালিড হয়, তবে একটি ডামি কি দিয়ে ইনিশিয়ালাইজ করবে যাতে এরর থ্রো না হয়
    const finalConfig = isFirebaseConfigured ? firebaseConfig : { 
      apiKey: "missing-key-check-netlify-settings", 
      projectId: "missing-project" 
    };
    app = initializeApp(finalConfig);
  }
} catch (error) {
  console.error("Firebase init fail:", error);
  app = getApps()[0]; 
}

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const googleProvider: GoogleAuthProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
