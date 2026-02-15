"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Toast from "@/components/Toast";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

type Mode = "login" | "register" | "magic";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";
  const authError = searchParams.get("error");

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    authError ? { type: "error", text: "Authentication failed. Please try again." } : null
  );

  const supabase = createSupabaseBrowser();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage({ type: "error", text: error.message });
      setLoading(false);
    } else {
      router.push(redirectTo);
      router.refresh();
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }
    if (password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirectTo}`,
      },
    });

    if (error) {
      setMessage({ type: "error", text: error.message });
      setLoading(false);
    } else {
      setMessage({
        type: "success",
        text: "Account created! Check your email to confirm, then log in.",
      });
      setLoading(false);
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirectTo}`,
      },
    });

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: `Magic link sent to ${email}. Check your inbox!` });
    }
    setLoading(false);
  }

  const titles: Record<Mode, string> = {
    login: "Sign In",
    register: "Create Account",
    magic: "Magic Link",
  };

  const descriptions: Record<Mode, string> = {
    login: "Enter your credentials to sign in.",
    register: "Create a new account to get started.",
    magic: "We'll email you a link — no password needed.",
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
            <svg className="h-7 w-7 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">{titles[mode]}</h1>
          <p className="mt-1 text-sm text-gray-500">{descriptions[mode]}</p>
        </div>

        {/* Feedback */}
        {message && <Toast type={message.type} message={message.text} />}

        {/* ── Login Form ── */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="mt-4 space-y-4">
            <Input
              id="login-email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="Email"
            />
            <Input
              id="login-password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="Password"
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </form>
        )}

        {/* ── Register Form ── */}
        {mode === "register" && (
          <form onSubmit={handleRegister} className="mt-4 space-y-4">
            <Input
              id="reg-email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="Email"
            />
            <Input
              id="reg-password"
              type="password"
              required
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="Password"
            />
            <Input
              id="reg-confirm"
              type="password"
              required
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              label="Confirm Password"
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account…" : "Create Account"}
            </Button>
          </form>
        )}

        {/* ── Magic Link Form ── */}
        {mode === "magic" && (
          <form onSubmit={handleMagicLink} className="mt-4 space-y-4">
            <Input
              id="magic-email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="Email"
            />
            <Button type="submit" className="w-full" disabled={loading}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {loading ? "Sending…" : "Send Magic Link"}
            </Button>
          </form>
        )}

        {/* Mode switcher */}
        <div className="mt-6 space-y-2 text-center text-sm text-gray-500">
          {mode !== "login" && (
            <button onClick={() => { setMode("login"); setMessage(null); }} className="block w-full hover:text-gray-300 transition-colors">
              Already have an account? <span className="text-cyan-400">Sign In</span>
            </button>
          )}
          {mode !== "register" && (
            <button onClick={() => { setMode("register"); setMessage(null); }} className="block w-full hover:text-gray-300 transition-colors">
              Don&apos;t have an account? <span className="text-cyan-400">Register</span>
            </button>
          )}
          {mode !== "magic" && (
            <button onClick={() => { setMode("magic"); setMessage(null); }} className="block w-full hover:text-gray-300 transition-colors">
              Prefer no password? <span className="text-cyan-400">Use Magic Link</span>
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}
