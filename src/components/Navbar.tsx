"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/phishing", label: "Phishing" },
  { href: "/reports", label: "Reports" },
  { href: "/heatmap", label: "Heatmap" },
  { href: "/vault", label: "Vault" },
  { href: "/quiz", label: "Quiz" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 glass-strong">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-black text-slate-950 transition-transform duration-200 group-hover:scale-110">
            A
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Aman<span className="text-cyan-400">TN</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
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
                  {l.label}
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
          <Link
            href="/login"
            className="hidden rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-1.5 text-sm font-semibold text-slate-950 transition-all duration-200 hover:shadow-[0_0_20px_rgba(6,214,160,0.3)] hover:brightness-110 sm:inline-flex"
          >
            Login
          </Link>

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
            {links.map((l) => (
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
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="mt-2 block rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-2 text-center text-sm font-semibold text-slate-950"
              >
                Login
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
