"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Input from "@/components/Input";
import PasswordStrengthMeter from "@/components/PasswordStrengthMeter";

interface VaultEntry {
  id: number;
  site: string;
  username: string;
  password: string;
}

export default function VaultPage() {
  const [checkPassword, setCheckPassword] = useState("");

  const [masterPassword, setMasterPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [entries, setEntries] = useState<VaultEntry[]>([
    { id: 1, site: "example.com", username: "user@example.com", password: "••••••••" },
  ]);

  const [newSite, setNewSite] = useState("");
  const [newUser, setNewUser] = useState("");
  const [newPass, setNewPass] = useState("");

  function addEntry() {
    if (!newSite || !newUser || !newPass) return;
    setEntries((prev) => [
      ...prev,
      { id: Date.now(), site: newSite, username: newUser, password: newPass },
    ]);
    setNewSite("");
    setNewUser("");
    setNewPass("");
  }

  return (
    <>
      <PageHeader
        title="Vault"
        subtitle="Check password strength and manage your credentials."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Section A: Password Strength Checker */}
        <Card>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
            </div>
            <h2 className="text-lg font-semibold text-white">Password Strength Checker</h2>
          </div>
          <Input
            id="pw-check"
            type="text"
            placeholder="Paste a password to test…"
            value={checkPassword}
            onChange={(e) => setCheckPassword(e.target.value)}
          />
          <PasswordStrengthMeter password={checkPassword} />

          {checkPassword && (
            <div className="mt-4 space-y-1 text-xs text-gray-500">
              <p className={checkPassword.length >= 8 ? "text-emerald-400" : ""}>
                {checkPassword.length >= 8 ? "✓" : "○"} At least 8 characters
              </p>
              <p className={/[A-Z]/.test(checkPassword) ? "text-emerald-400" : ""}>
                {/[A-Z]/.test(checkPassword) ? "✓" : "○"} Uppercase letter
              </p>
              <p className={/[0-9]/.test(checkPassword) ? "text-emerald-400" : ""}>
                {/[0-9]/.test(checkPassword) ? "✓" : "○"} Number
              </p>
              <p className={/[^A-Za-z0-9]/.test(checkPassword) ? "text-emerald-400" : ""}>
                {/[^A-Za-z0-9]/.test(checkPassword) ? "✓" : "○"} Special character
              </p>
            </div>
          )}
        </Card>

        {/* Section B: Vault Manager */}
        <Card>
          <div className="mb-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${unlocked ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
              {unlocked ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              )}
            </div>
            <h2 className="text-lg font-semibold text-white">Vault Manager</h2>
          </div>

          {!unlocked ? (
            <div className="space-y-3">
              <Input
                id="master-pw"
                type="password"
                placeholder="Enter master password…"
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && masterPassword && setUnlocked(true)}
              />
              <Button
                onClick={() => masterPassword && setUnlocked(true)}
                className="w-full"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                Unlock Vault
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Vault unlocked
                </span>
                <Button
                  variant="secondary"
                  onClick={() => { setUnlocked(false); setMasterPassword(""); }}
                  className="text-xs px-3 py-1.5"
                >
                  Lock
                </Button>
              </div>

              {/* Entries */}
              <div className="divide-y divide-white/5">
                {entries.map((e) => (
                  <div key={e.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-gray-200">{e.site}</p>
                      <p className="text-sm text-gray-500">{e.username}</p>
                    </div>
                    <code className="rounded-lg bg-white/5 px-3 py-1 text-xs text-gray-500 font-mono">
                      {e.password}
                    </code>
                  </div>
                ))}
              </div>

              {/* Add entry */}
              <div className="mt-4 space-y-3 rounded-xl border border-dashed border-white/10 p-4">
                <h3 className="text-sm font-medium text-gray-400">Add Entry</h3>
                <div className="grid gap-2 sm:grid-cols-3">
                  <Input aria-label="Site" placeholder="Site" value={newSite} onChange={(e) => setNewSite(e.target.value)} />
                  <Input aria-label="Username" placeholder="Username" value={newUser} onChange={(e) => setNewUser(e.target.value)} />
                  <Input aria-label="Password" type="password" placeholder="Password" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
                </div>
                <Button onClick={addEntry} variant="secondary" className="w-full">
                  Add Entry
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  );
}
