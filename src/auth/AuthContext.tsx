import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  AuthError,
  User,
  applyActionCode,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, firebaseInitError, isFirebaseConfigured } from "../lib/firebase";

type VerificationStatus = "unauthenticated" | "verified" | "unverified";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAuthorized: boolean;
  verificationStatus: VerificationStatus;
  authError: string | null;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  refreshVerificationStatus: () => Promise<void>;
  completeEmailVerification: (oobCode: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeEmail = (email?: string | null) => (email || "").trim();
const isLocalHost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
const configuredAppUrl = (import.meta.env.VITE_APP_URL || "").trim();
const appUrl = (isLocalHost ? window.location.origin : configuredAppUrl || window.location.origin).replace(/\/$/, "");
const verificationActionSettings = {
  url: `${appUrl}/login`,
  handleCodeInApp: false,
};

function getAuthErrorMessage(error: unknown) {
  const code = (error as Partial<AuthError>)?.code;

  switch (code) {
    case "auth/invalid-email":
      return "Invalid email format.";
    case "auth/email-already-in-use":
      return "This email is already registered. Please use Sign In.";
    case "auth/account-exists-with-different-credential":
      return "This email already exists with a different sign-in method in Firebase.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 6 characters.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Invalid email or password.";
    case "auth/user-not-found":
      return "Account not found. Please create an account first.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a few minutes and try again.";
    case "auth/network-request-failed":
      return "Network error. Check internet and try again.";
    case "auth/operation-not-allowed":
      return "Email/Password sign-in is disabled in Firebase Console.";
    case "auth/quota-exceeded":
      return "Email quota exceeded for now. Please wait and retry later.";
    case "auth/unauthorized-continue-uri":
    case "auth/invalid-continue-uri":
      return "Verification link domain is not authorized in Firebase Authentication settings.";
    default:
      return `${(error as { message?: string })?.message || "Authentication failed. Please retry."}${code ? ` (code: ${code})` : ""}`;
  }
}

async function upsertUser(user: User) {
  if (!db) return;
  const email = normalizeEmail(user.email);
  const userRef = doc(db, "users", user.uid);

  await setDoc(
    userRef,
    {
      uid: user.uid,
      name: user.displayName || "",
      email,
      photoURL: user.photoURL || "",
      provider: user.providerData[0]?.providerId || "password",
      emailVerified: user.emailVerified,
      lastLoginAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("unauthenticated");
  const [authError, setAuthError] = useState<string | null>(null);

  const sendVerification = async (targetUser: User) => {
    await sendEmailVerification(targetUser, verificationActionSettings);
  };

  const applyVerificationState = async (currentUser: User) => {
    await reload(currentUser);
    const refreshedUser = auth?.currentUser ?? currentUser;
    const email = normalizeEmail(refreshedUser.email);
    setUser(refreshedUser);

    if (!email) {
      setAuthError("Account does not have a valid email address.");
      await firebaseSignOut(auth!);
      setUser(null);
      setIsAuthorized(false);
      setVerificationStatus("unverified");
      return;
    }

    if (!refreshedUser.emailVerified) {
      setIsAuthorized(false);
      setVerificationStatus("unverified");
      setAuthError("Email not verified yet. Please open your verification email, then click refresh.");
      return;
    }

    await upsertUser(refreshedUser);
    setIsAuthorized(true);
    setVerificationStatus("verified");
    setAuthError(null);
  };

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      setUser(null);
      setIsAuthorized(false);
      setVerificationStatus("unauthenticated");
      setAuthError(
        firebaseInitError
          ? `Firebase initialization failed: ${firebaseInitError}`
          : "Firebase is not configured. Add VITE_FIREBASE_* values in .env and restart dev server."
      );
      return;
    }

    const authClient = auth;

    const unsubscribe = onAuthStateChanged(authClient, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setIsAuthorized(false);
        setVerificationStatus("unauthenticated");
        setAuthError(null);
        setLoading(false);
        return;
      }

      try {
        await applyVerificationState(currentUser);
      } catch (error) {
        console.error("Auth state handling failed:", error);
        setAuthError("Authentication check failed. Please try again.");
        setUser(null);
        setIsAuthorized(false);
        setVerificationStatus("unverified");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const registerWithEmail = async (email: string, password: string) => {
    if (!auth || !isFirebaseConfigured) {
      setAuthError("Firebase is not configured. Add VITE_FIREBASE_* values in .env.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setAuthError(null);

    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await sendVerification(credential.user);
      setUser(credential.user);
      setIsAuthorized(false);
      setVerificationStatus("unverified");
      setAuthError("Verification email sent. Please check inbox/spam and verify before entering dashboard.");
    } catch (error: unknown) {
      console.error("Account creation failed:", error);
      setAuthError(getAuthErrorMessage(error));
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!auth || !isFirebaseConfigured) {
      setAuthError("Firebase is not configured. Add VITE_FIREBASE_* values in .env.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setAuthError(null);

    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (!credential.user.emailVerified) {
        setUser(credential.user);
        setIsAuthorized(false);
        setVerificationStatus("unverified");
        setAuthError("Email not verified. Verify link pe click karo, ya Resend mail button use karo.");
      }
    } catch (error: unknown) {
      console.error("Email sign in failed:", error);
      setAuthError(getAuthErrorMessage(error));
      setLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    if (!auth?.currentUser) {
      setAuthError("Sign in first to resend the verification email.");
      return;
    }

    setLoading(true);
    setAuthError(null);

    try {
      await sendVerification(auth.currentUser);
      setVerificationStatus("unverified");
      setAuthError("Verification email sent again. Check your inbox and spam folder.");
    } catch (error: unknown) {
      console.error("Verification email resend failed:", error);
      setAuthError(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const refreshVerificationStatus = async () => {
    if (!auth?.currentUser) {
      setAuthError("Sign in first to refresh verification status.");
      return;
    }

    setLoading(true);
    setAuthError(null);

    try {
      await applyVerificationState(auth.currentUser);
    } catch (error: unknown) {
      console.error("Verification refresh failed:", error);
      setAuthError(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const completeEmailVerification = async (oobCode: string) => {
    if (!auth || !oobCode) return;

    setLoading(true);
    setAuthError(null);

    try {
      await applyActionCode(auth, oobCode);

      if (auth.currentUser) {
        await applyVerificationState(auth.currentUser);
      } else {
        setVerificationStatus("unauthenticated");
        setAuthError("Email verified successfully. Ab sign in karo.");
      }
    } catch (error: unknown) {
      console.error("Email verification link failed:", error);
      setAuthError(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (auth) {
      await firebaseSignOut(auth);
    }
    setUser(null);
    setIsAuthorized(false);
    setVerificationStatus("unauthenticated");
    setAuthError(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthorized,
      verificationStatus,
      authError,
      registerWithEmail,
      signInWithEmail,
      resendVerificationEmail,
      refreshVerificationStatus,
      completeEmailVerification,
      signOut,
    }),
    [user, loading, isAuthorized, verificationStatus, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
