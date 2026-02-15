"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { LanguageSwitcher, useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/i18n";

const linkKeys = [
  { href: "/", key: "nav.home" },
  { href: "/dashboard", key: "nav.dashboard" },
  { href: "/phishing", key: "nav.phishing" },
  { href: "/reports", key: "nav.reports" },
  { href: "/heatmap", key: "nav.heatmap" },
  { href: "/vault", key: "nav.vault" },
  { href: "/quiz", key: "nav.quiz" },
  { href: "/leaderboard", key: "nav.scoreboard" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useUser();
  const { language } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    if (!user) { setStreak(null); return; }
    fetch("/api/streak")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setStreak(d.current ?? 0); })
      .catch(() => {});
  }, [user]);

  async function handleSignOut() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    setProfileOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="sticky top-0 z-50 glass-strong">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-black text-slate-950 transition-transform duration-200 group-hover:scale-110">
            F
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            faya9ni<span className="text-cyan-400">.tn</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 md:flex">
          {linkKeys.map((l) => {
            const active = pathname === l.href;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`relative rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "text-cyan-400"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {t(l.key, language)}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-full bg-cyan-400" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {loading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-white/10" />
          ) : user ? (
            <div className="relative flex items-center gap-2">
              {streak !== null && streak > 0 && (
                <span className="flex items-center gap-1 rounded-full border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-xs font-semibold text-orange-400">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                  </svg>
                  {streak}
                </span>
              )}
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-xs font-bold text-slate-950 transition-transform hover:scale-110"
                aria-label="User menu"
              >
                {user.email?.charAt(0).toUpperCase() ?? "U"}
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-slate-900/95 p-2 shadow-xl backdrop-blur-md animate-fade-in">
                  <div className="border-b border-white/5 px-3 py-2">
                    <p className="text-xs text-gray-500">{t("auth.signedInAs", language)}</p>
                    <p className="truncate text-sm font-medium text-gray-200">{user.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-white/5"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {t("action.signOut", language)}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-1.5 text-sm font-semibold text-slate-950 transition-all duration-200 hover:shadow-[0_0_20px_rgba(6,214,160,0.3)] hover:brightness-110 sm:inline-flex"
            >
              {t("action.login", language)}
            </Link>
          )}

          {/* Mobile burger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex flex-col gap-1 md:hidden"
            aria-label="Toggle menu"
          >
            <span className={`block h-0.5 w-5 rounded bg-gray-300 transition-all duration-200 ${menuOpen ? "translate-y-1.5 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-5 rounded bg-gray-300 transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-5 rounded bg-gray-300 transition-all duration-200 ${menuOpen ? "-translate-y-1.5 -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-white/5 px-4 pb-4 md:hidden animate-fade-in">
          <ul className="space-y-1 pt-2">
            {linkKeys.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === l.href
                      ? "bg-white/5 text-cyan-400"
                      : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                  }`}
                >
                  {t(l.key, language)}
                </Link>
              </li>
            ))}
            <li>
              {user ? (
                <button
                  onClick={() => { handleSignOut(); setMenuOpen(false); }}
                  className="mt-2 block w-full rounded-lg border border-red-500/30 px-3 py-2 text-center text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10"
                >
                  {t("action.signOut", language)}
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="mt-2 block rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-2 text-center text-sm font-semibold text-slate-950"
                >
                  {t("action.login", language)}
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
