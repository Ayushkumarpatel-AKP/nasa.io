// src/components/Header.tsx
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Header() {
  const { user, isAuthorized, loading, signOut } = useAuth();

  return (
    <header className="border-b border-emerald-900/60 backdrop-blur-md bg-black/30 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full border border-cyan-300/30 shadow-lg shadow-cyan-900/30 bg-cover bg-center"
            style={{ backgroundImage: "url('/earth-texture.jpg')" }}
            aria-hidden="true"
          />
          <span className="text-xl font-bold tracking-tight text-emerald-50" style={{fontFamily:'Space Grotesk'}}>NASA.io</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-slate-400 hover:text-emerald-300 transition font-medium text-sm">
            Home
          </Link>
          <Link to="/dashboard" className="text-slate-400 hover:text-emerald-300 transition font-medium text-sm">
            Dashboard
          </Link>
          <Link to="/about" className="text-slate-400 hover:text-emerald-300 transition font-medium text-sm">
            About
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {isAuthorized && user ? (
            <>
              <span className="hidden md:inline text-xs text-slate-300 max-w-[180px] truncate">
                {user.email}
              </span>
              <button
                onClick={signOut}
                className="px-4 py-2 rounded-lg bg-emerald-900/40 border border-emerald-700/40 hover:bg-emerald-800/50 hover:border-emerald-600/60 transition text-sm font-medium text-emerald-200"
              >
                Log Out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className={`px-4 py-2 rounded-lg bg-emerald-900/40 border border-emerald-700/40 hover:bg-emerald-800/50 hover:border-emerald-600/60 transition text-sm font-medium text-emerald-200 ${loading ? "pointer-events-none opacity-60" : ""}`}
            >
              {loading ? "Loading..." : "Sign In"}
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
