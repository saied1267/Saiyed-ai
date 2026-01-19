
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Vite এর মাধ্যমে এনভায়রনমেন্ট ভেরিয়েবল পাওয়ার সঠিক উপায়
const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || (process.env.FIREBASE_API_KEY as string),
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || (process.env.FIREBASE_AUTH_DOMAIN as string),
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || (process.env.FIREBASE_PROJECT_ID as string),
  storageBucket: `${(process.env.FIREBASE_PROJECT_ID as string) || "saiyed-ai"}.firebasestorage.app`,
  messagingSenderId: "959677024114",
  appId: "1:959677024114:web:b583e68494063dc9d53feb",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
