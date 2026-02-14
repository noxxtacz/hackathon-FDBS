"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight text-gray-900">
          ShieldsUp
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  pathname === l.href
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/login"
          className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Login
        </Link>
      </div>
    </nav>
  );
}
