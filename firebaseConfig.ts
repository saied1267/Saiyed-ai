
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const getEnv = (key: string): string => {
  return process.env[key] || (window as any).process?.env?.[key] || "";
};

const firebaseConfig = {
  apiKey: getEnv("FIREBASE_API_KEY"),
  authDomain: getEnv("FIREBASE_AUTH_DOMAIN"),
  projectId: getEnv("FIREBASE_PROJECT_ID"),
  storageBucket: `${getEnv("FIREBASE_PROJECT_ID")}.firebasestorage.app`,
  messagingSenderId: getEnv("FIREBASE_SENDER_ID"),
  appId: getEnv("FIREBASE_APP_ID"),
};

// Validating essential config
const isConfigValid = firebaseConfig.apiKey && firebaseConfig.projectId;

const app: FirebaseApp = (getApps().length === 0 && isConfigValid) 
  ? initializeApp(firebaseConfig) 
  : (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig));

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const googleProvider: GoogleAuthProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
