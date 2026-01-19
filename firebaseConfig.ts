
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const getEnv = (key: string): string => {
  // Safe environment access
  try {
    return process.env[key] || "";
  } catch (e) {
    return "";
  }
};

const firebaseConfig = {
  apiKey: getEnv("FIREBASE_API_KEY"),
  authDomain: getEnv("FIREBASE_AUTH_DOMAIN"),
  projectId: getEnv("FIREBASE_PROJECT_ID"),
  storageBucket: getEnv("FIREBASE_PROJECT_ID") ? `${getEnv("FIREBASE_PROJECT_ID")}.firebasestorage.app` : "",
  messagingSenderId: getEnv("FIREBASE_SENDER_ID"),
  appId: getEnv("FIREBASE_APP_ID"),
};

// Validating essential config to prevent crash
const isConfigValid = firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.apiKey !== "";

let app: FirebaseApp;

try {
  if (getApps().length > 0) {
    app = getApp();
  } else if (isConfigValid) {
    app = initializeApp(firebaseConfig);
  } else {
    // Fallback dummy config so the app doesn't go white/crash
    console.warn("Firebase configuration is missing or invalid. Auth will not work.");
    app = initializeApp({
      apiKey: "invalid-key",
      authDomain: "invalid-domain",
      projectId: "invalid-project",
      storageBucket: "",
      messagingSenderId: "",
      appId: ""
    });
  }
} catch (error) {
  console.error("Firebase init failed:", error);
  // Emergency fallback
  app = getApps()[0] || initializeApp({ apiKey: "error", projectId: "error" });
}

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const googleProvider: GoogleAuthProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
