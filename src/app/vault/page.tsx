"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Input from "@/components/Input";
import PasswordStrengthMeter from "@/components/PasswordStrengthMeter";
import LoadingSpinner from "@/components/LoadingSpinner";
import Toast from "@/components/Toast";

interface DecryptedEntry {
  id: string;
  label: string;
  secret: string | null;
  error?: string;
  created_at: string;
}

export default function VaultPage() {
  const [checkPassword, setCheckPassword] = useState("");

  // Vault state
  const [masterPassword, setMasterPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [entries, setEntries] = useState<DecryptedEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // New entry fields
  const [newLabel, setNewLabel] = useState("");
  const [newSecret, setNewSecret] = useState("");
  const [addingEntry, setAddingEntry] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  /** Unlock vault: verify password → decrypt items */
  async function handleUnlock() {
    if (!masterPassword.trim()) return;
    setLoading(true);
    setMessage(null);

    try {
      // 1. Verify/setup password
      const unlockRes = await fetch("/api/vault/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: masterPassword }),
      });
      const unlockData = await unlockRes.json();

      if (!unlockRes.ok) {
        setMessage({ type: "error", text: unlockData.error || "Unlock failed" });
        setLoading(false);
        return;
      }

      if (unlockData.setup) {
        setMessage({ type: "success", text: "Vault created! You can now add credentials." });
      }

      // 2. Decrypt all items
      const itemsRes = await fetch("/api/vault/items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: masterPassword }),
      });
      const itemsData = await itemsRes.json();

      if (itemsRes.ok) {
        setEntries(itemsData.items ?? []);
      }

      setUnlocked(true);
    } catch {
      setMessage({ type: "error", text: "Failed to connect to server" });
    } finally {
      setLoading(false);
    }
  }

  /** Lock vault: clear state */
  function handleLock() {
    setUnlocked(false);
    setMasterPassword("");
    setEntries([]);
    setShowSecrets({});
    setMessage(null);
  }

  /** Add a new vault entry */
  async function addEntry() {
    if (!newLabel.trim() || !newSecret.trim()) return;
    setAddingEntry(true);
    setMessage(null);

    try {
      const res = await fetch("/api/vault/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: masterPassword,
          label: newLabel.trim(),
          secret: newSecret,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to add entry" });
        setAddingEntry(false);
        return;
      }

      // Add to local list with the decrypted secret we already have
      setEntries((prev) => [
        { id: data.id, label: newLabel.trim(), secret: newSecret, created_at: data.created_at },
        ...prev,
      ]);
      setNewLabel("");
      setNewSecret("");
      setMessage({ type: "success", text: "Entry saved securely" });
    } catch {
      setMessage({ type: "error", text: "Failed to save entry" });
    } finally {
      setAddingEntry(false);
    }
  }

  /** Delete a vault entry */
  async function deleteEntry(id: string) {
    setDeletingId(id);
    setMessage(null);

    try {
      const res = await fetch(`/api/vault/items/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to delete" });
        return;
      }

      setEntries((prev) => prev.filter((e) => e.id !== id));
      setMessage({ type: "success", text: "Entry deleted" });
    } catch {
      setMessage({ type: "error", text: "Failed to delete entry" });
    } finally {
      setDeletingId(null);
    }
  }

  function toggleSecret(id: string) {
    setShowSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <>
      <PageHeader
        title="Vault"
        subtitle="Check password strength and manage your credentials securely."
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

          {/* Feedback */}
          {message && <div className="mb-4"><Toast type={message.type} message={message.text} /></div>}

          {!unlocked ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Enter your master password to unlock. First time? This will create your vault.
              </p>
              <Input
                id="master-pw"
                type="password"
                placeholder="Enter master password…"
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
              />
              <Button
                onClick={handleUnlock}
                className="w-full"
                disabled={loading || !masterPassword.trim()}
              >
                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                )}
                {loading ? "Unlocking…" : "Unlock Vault"}
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
                  onClick={handleLock}
                  className="text-xs px-3 py-1.5"
                >
                  Lock
                </Button>
              </div>

              {/* Entries */}
              {entries.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-600">No entries yet. Add your first credential below.</p>
              ) : (
                <div className="divide-y divide-white/5 max-h-72 overflow-y-auto">
                  {entries.map((e) => (
                    <div key={e.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-200 truncate">{e.label}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="rounded-lg bg-white/5 px-2 py-0.5 text-xs font-mono text-gray-400 truncate max-w-[180px]">
                            {e.error ? "⚠ decrypt failed" : showSecrets[e.id] ? e.secret : "••••••••••"}
                          </code>
                          {!e.error && (
                            <button
                              onClick={() => toggleSecret(e.id)}
                              className="text-gray-600 hover:text-gray-300 transition-colors"
                              aria-label={showSecrets[e.id] ? "Hide" : "Show"}
                            >
                              {showSecrets[e.id] ? (
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878l4.242 4.242M21 21l-3.122-3.122" /></svg>
                              ) : (
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteEntry(e.id)}
                        disabled={deletingId === e.id}
                        className="flex-shrink-0 rounded-lg p-2 text-gray-600 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                        aria-label="Delete entry"
                      >
                        {deletingId === e.id ? (
                          <LoadingSpinner />
                        ) : (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add entry */}
              <div className="mt-4 space-y-3 rounded-xl border border-dashed border-white/10 p-4">
                <h3 className="text-sm font-medium text-gray-400">Add Entry</h3>
                <Input
                  aria-label="Label"
                  placeholder="Label (e.g. Gmail, GitHub…)"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                />
                <Input
                  aria-label="Secret"
                  type="password"
                  placeholder="Password / secret"
                  value={newSecret}
                  onChange={(e) => setNewSecret(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addEntry()}
                />
                <Button
                  onClick={addEntry}
                  variant="secondary"
                  className="w-full"
                  disabled={addingEntry || !newLabel.trim() || !newSecret.trim()}
                >
                  {addingEntry ? "Encrypting…" : "Add Entry"}
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  );
}
