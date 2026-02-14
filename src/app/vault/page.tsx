"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import PasswordStrengthMeter from "@/components/PasswordStrengthMeter";

interface VaultEntry {
  id: number;
  site: string;
  username: string;
  password: string;
}

export default function VaultPage() {
  // Password strength checker
  const [checkPassword, setCheckPassword] = useState("");

  // Vault state
  const [masterPassword, setMasterPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [entries, setEntries] = useState<VaultEntry[]>([
    { id: 1, site: "example.com", username: "user@example.com", password: "••••••••" },
  ]);

  // Add entry form
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

      {/* Section A: Password Strength Checker */}
      <Card className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          Password Strength Checker
        </h2>
        <label htmlFor="pw-check" className="sr-only">
          Password to check
        </label>
        <input
          id="pw-check"
          type="text"
          placeholder="Paste a password to test…"
          value={checkPassword}
          onChange={(e) => setCheckPassword(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <PasswordStrengthMeter password={checkPassword} />
      </Card>

      {/* Section B: Vault Manager */}
      <Card>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          Vault Manager
        </h2>

        {!unlocked ? (
          <div className="flex gap-2">
            <label htmlFor="master-pw" className="sr-only">
              Master password
            </label>
            <input
              id="master-pw"
              type="password"
              placeholder="Master password"
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={() => masterPassword && setUnlocked(true)}
              className="rounded-md bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Unlock
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-green-700 font-medium">
                🔓 Vault unlocked
              </span>
              <button
                onClick={() => {
                  setUnlocked(false);
                  setMasterPassword("");
                }}
                className="rounded-md bg-gray-200 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-300"
              >
                Lock
              </button>
            </div>

            {/* Entries list */}
            <div className="divide-y divide-gray-100">
              {entries.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <div>
                    <p className="font-medium text-gray-900">{e.site}</p>
                    <p className="text-gray-500">{e.username}</p>
                  </div>
                  <code className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {e.password}
                  </code>
                </div>
              ))}
            </div>

            {/* Add Entry */}
            <div className="mt-4 space-y-2 rounded-lg border border-dashed border-gray-300 p-4">
              <h3 className="text-sm font-medium text-gray-700">Add Entry</h3>
              <div className="grid gap-2 sm:grid-cols-3">
                <input
                  aria-label="Site"
                  placeholder="Site"
                  value={newSite}
                  onChange={(e) => setNewSite(e.target.value)}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                />
                <input
                  aria-label="Username"
                  placeholder="Username"
                  value={newUser}
                  onChange={(e) => setNewUser(e.target.value)}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                />
                <input
                  aria-label="Password"
                  type="password"
                  placeholder="Password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                />
              </div>
              <button
                onClick={addEntry}
                className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </>
        )}
      </Card>
    </>
  );
}
