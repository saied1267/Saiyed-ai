
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

/**
 * সাঈদ এআই - ফায়ারবেস কনফিগারেশন
 * ব্যবহারকারীর অনুরোধ অনুযায়ী সরাসরি কি (Key) গুলো কোডে যুক্ত করা হলো।
 */
const firebaseConfig = {
  apiKey: "AIzaSyCIkgoMlFLiK9tafPomloHYxBkeSVBPqyw",
  authDomain: "saiyed-ai.firebaseapp.com",
  projectId: "saiyed-ai",
  storageBucket: "saiyed-ai.firebasestorage.app",
  messagingSenderId: "959677024114",
  appId: "1:959677024114:web:b583e68494063dc9d53feb",
  measurementId: "G-06E2SRZKFR"
};

// চেক করা হচ্ছে কনফিগ ঠিক আছে কিনা (সরাসরি কোড থেকে চেক করবে)
export const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.apiKey.startsWith("AIza"));

let app: FirebaseApp;

try {
  if (getApps().length > 0) {
    app = getApp();
  } else {
    app = initializeApp(firebaseConfig);
  }
} catch (error) {
  console.error("Firebase Initialization Error:", error);
  app = getApps()[0]; 
}

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const googleProvider: GoogleAuthProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
