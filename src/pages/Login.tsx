import { Navigate, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const {
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
  } = useAuth();
  const navigate = useNavigate();
  const handledVerificationLink = useRef(false);
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (handledVerificationLink.current) return;

    const params = new URLSearchParams(location.search);
    const modeParam = params.get("mode");
    const oobCode = params.get("oobCode");

    if (modeParam !== "verifyEmail" || !oobCode) return;

    handledVerificationLink.current = true;

    void (async () => {
      await completeEmailVerification(oobCode);
      navigate("/login", { replace: true });
    })();
  }, [location.search, completeEmailVerification, navigate]);

  if (isAuthorized) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      return;
    }

    if (mode === "signup") {
      await registerWithEmail(email, password);
      return;
    }

    await signInWithEmail(email, password);
  };

  return (
    <section className="relative h-[calc(100vh-78px)] overflow-hidden px-4 sm:px-6">
      <div className="login-nebula" aria-hidden="true" />

      <div className="relative z-10 mx-auto grid h-full max-w-6xl items-center gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
        <div className="hidden min-h-[420px] items-center justify-center lg:flex">
          <div className="cosmos-stage" aria-hidden="true">
            <div className="cosmos-ring" />
            <div className="earth-globe login-earth" />
            <div className="orbit-satellite" />
          </div>
        </div>

        <div className="mx-auto w-full max-w-xs rounded-3xl border border-cyan-500/20 bg-slate-950/55 p-3.5 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-4">
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-cyan-300/80">
            <span
              className="inline-block h-4 w-4 rounded-full border border-cyan-200/40 bg-cover bg-center"
              style={{ backgroundImage: "url('/earth-texture.jpg')" }}
              aria-hidden="true"
            />
            NASA.io Access
          </p>
          <h1 className="mt-1 text-lg font-semibold text-cyan-50 sm:text-xl" style={{ fontFamily: "Space Grotesk" }}>
            {mode === "signup" ? "Create account" : "Sign in"}
          </h1>
          <p className="mt-1.5 text-[11px] text-slate-300 sm:text-xs">Email verify hone ke baad hi dashboard open hoga.</p>

          <div className="mt-3 space-y-2">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              className="w-full rounded-xl border border-cyan-700/30 bg-slate-950/70 px-3.5 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400"
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className="w-full rounded-xl border border-cyan-700/30 bg-slate-950/70 px-3.5 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-2.5 w-full rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:from-cyan-500 hover:to-emerald-500 disabled:opacity-60"
          >
            {loading ? "Please wait..." : mode === "signup" ? "Create account" : "Sign in"}
          </button>

          <button
            type="button"
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            disabled={loading}
            className="mt-2 text-xs text-cyan-300 transition hover:text-cyan-200 disabled:opacity-60"
          >
            {mode === "signup" ? "Already registered? Sign in" : "New here? Create account"}
          </button>

          {authError && (
            <p className="mt-2.5 rounded-lg border border-rose-600/40 bg-rose-950/30 p-2 text-xs text-rose-200">
              {authError}
            </p>
          )}

          {verificationStatus === "unverified" && user && (
            <div className="mt-2.5 rounded-xl border border-amber-600/40 bg-amber-950/25 p-2.5 text-xs text-amber-100">
              <p className="truncate">{user.email}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={resendVerificationEmail}
                  disabled={loading}
                  className="rounded-lg border border-amber-500/40 px-2.5 py-1.5 text-[11px] font-medium hover:bg-amber-900/35 disabled:opacity-60"
                >
                  Resend mail
                </button>
                <button
                  type="button"
                  onClick={refreshVerificationStatus}
                  disabled={loading}
                  className="rounded-lg border border-emerald-500/40 px-2.5 py-1.5 text-[11px] font-medium hover:bg-emerald-900/35 disabled:opacity-60"
                >
                  Refresh access
                </button>
                <button
                  type="button"
                  onClick={signOut}
                  disabled={loading}
                  className="rounded-lg border border-slate-500/40 px-2.5 py-1.5 text-[11px] font-medium text-slate-200 hover:bg-slate-900/35 disabled:opacity-60"
                >
                  Use another email
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
