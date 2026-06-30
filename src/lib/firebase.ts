import { FirebaseError, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasAllFirebaseConfig = Object.values(firebaseConfig).every(
  (value) => typeof value === "string" && value.trim().length > 0
);

let auth: Auth | null = null;
let db: Firestore | null = null;

if (hasAllFirebaseConfig) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error("Firebase initialization failed:", firebaseError.message);
  }
} else {
  console.warn("Firebase env vars are missing. Fill VITE_FIREBASE_* in .env");
}

export const isFirebaseConfigured = hasAllFirebaseConfig && !!auth && !!db;

export { auth, db };
