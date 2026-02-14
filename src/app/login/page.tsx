"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import Toast from "@/components/Toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    // Placeholder — would call API in production
    setSent(true);
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-sm text-center">
        <PageHeader
          title="Sign In"
          subtitle="Enter your email to receive a magic link."
        />

        {sent ? (
          <Toast
            type="success"
            message={`Magic link sent to ${email}. Check your inbox!`}
          />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <label htmlFor="login-email" className="sr-only">
              Email address
            </label>
            <input
              id="login-email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Send Magic Link
            </button>
          </form>
        )}
      </Card>
    </div>
  );
}
