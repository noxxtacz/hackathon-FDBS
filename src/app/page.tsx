import Card from "@/components/Card";
import Link from "next/link";

const features = [
  {
    title: "AI Phishing Detection",
    desc: "Analyze any URL with our AI engine. Get instant risk scores, detailed reasons, and actionable advice.",
    href: "/phishing",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
    ),
    gradient: "from-cyan-500/20 to-blue-500/20",
    border: "hover:border-cyan-500/30",
  },
  {
    title: "Community Threat Reports",
    desc: "Browse and submit crowdsourced threat intelligence from across all governorates.",
    href: "/reports",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    ),
    gradient: "from-purple-500/20 to-pink-500/20",
    border: "hover:border-purple-500/30",
  },
  {
    title: "Encrypted Password Vault",
    desc: "Check password strength and manage your credentials securely with encrypted storage.",
    href: "/vault",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
    ),
    gradient: "from-emerald-500/20 to-cyan-500/20",
    border: "hover:border-emerald-500/30",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex flex-col items-center pb-16 pt-12 text-center sm:pt-20">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 -top-20 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-cyan-500/10 via-blue-500/5 to-transparent blur-3xl" />
        </div>

        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-1.5 text-xs font-medium text-cyan-400">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            AI-Powered Security
          </div>

          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Stay One Step Ahead of{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Cyber Threats
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-gray-400 sm:text-lg">
            Detect phishing attacks, report threats, and strengthen your security posture — all in one platform.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/phishing"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-sm font-semibold text-slate-950 transition-all duration-200 hover:shadow-[0_0_30px_rgba(6,214,160,0.3)] hover:brightness-110"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              Check a Suspicious Link
            </Link>
            <Link
              href="/quiz"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-gray-300 transition-all duration-200 hover:bg-white/10 hover:text-white"
            >
              Take Security Quiz
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Link key={f.href} href={f.href} className="group">
            <Card hover className={`h-full ${f.border}`}>
              <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} text-gray-300 transition-colors group-hover:text-white`}>
                {f.icon}
              </div>
              <h2 className="text-lg font-semibold text-white">
                {f.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-500 group-hover:text-gray-400 transition-colors">
                {f.desc}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-cyan-500 opacity-0 transition-all group-hover:opacity-100">
                Explore
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </span>
            </Card>
          </Link>
        ))}
      </section>
    </>
  );
}
