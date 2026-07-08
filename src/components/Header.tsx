// src/components/Header.tsx
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Header() {
  const { user, isAuthorized, loading, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `header-nav-link${isActive ? " header-nav-link-active" : ""}`;

  return (
    <header className={`site-header sticky top-0 z-50 border-b border-emerald-900/60 bg-black/35 backdrop-blur-md ${isScrolled ? "header-scrolled" : ""}`}>
      <div className="header-comet" aria-hidden="true" />

      <nav className="header-inner relative mx-auto grid max-w-7xl gap-3 px-4 py-3 sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
        <div className="header-brand-wrap flex items-center justify-between gap-3 lg:justify-start">
          <Link to="/" className="header-brand group inline-flex items-center gap-3">
            <div className="header-logo-orbit" aria-hidden="true">
              <div
                className="h-11 w-11 rounded-full border border-cyan-300/35 bg-cover bg-center shadow-lg shadow-cyan-900/30"
                style={{ backgroundImage: "url('/earth-texture.jpg')" }}
              />
            </div>
            <div className="header-brand-text">
              <p className="header-brand-kicker text-[10px] uppercase tracking-[0.28em] text-emerald-200/75">Earth Monitoring</p>
              <span className="header-brand-title text-[34px] font-bold leading-none tracking-tight text-emerald-50" style={{ fontFamily: "Space Grotesk" }}>
                NASA.io
              </span>
            </div>
          </Link>
        </div>

        <div className="header-nav-shell order-3 lg:order-2" role="navigation" aria-label="Primary">
          <NavLink to="/" className={navItemClass}>
            Home
          </NavLink>
          <NavLink to="/dashboard" className={navItemClass}>
            Dashboard
          </NavLink>
          <NavLink to="/about" className={navItemClass}>
            About
          </NavLink>
        </div>

        <div className="order-2 flex items-center justify-end gap-2 lg:order-3">
          {isAuthorized && user ? (
            <>
              <span className="hidden max-w-[220px] truncate text-xs text-slate-300 md:inline">
                {user.email}
              </span>
              <button
                onClick={signOut}
                className="header-action-btn rounded-xl border border-emerald-600/40 bg-emerald-900/35 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:border-emerald-400/60 hover:bg-emerald-800/45"
              >
                Log Out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className={`header-action-btn rounded-xl border border-emerald-600/40 bg-emerald-900/35 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:border-emerald-400/60 hover:bg-emerald-800/45 ${loading ? "pointer-events-none opacity-60" : ""}`}
            >
              {loading ? "Loading..." : "Sign In"}
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
