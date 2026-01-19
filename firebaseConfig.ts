
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const getEnv = (key: string): string => {
  return (process.env?.[key] as string) || ((window as any).process?.env?.[key] as string) || "";
};

const firebaseConfig = {
  apiKey: getEnv("FIREBASE_API_KEY") || "AIzaSyDummyKeyForInitialization",
  authDomain: getEnv("FIREBASE_AUTH_DOMAIN") || "saiyed-ai.firebaseapp.com",
  projectId: getEnv("FIREBASE_PROJECT_ID") || "saiyed-ai",
  storageBucket: "saiyed-ai.firebasestorage.app",
  messagingSenderId: "959677024114",
  appId: "1:959677024114:web:b583e68494063dc9d53feb",
};

const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const googleProvider: GoogleAuthProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
