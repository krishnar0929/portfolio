"use client";

import { useState } from "react";
import { SITE_URL } from "@/lib/firebase";
import { validateUsername } from "@/lib/username";

const host = SITE_URL.replace(/^https?:\/\//, "");

export function ClaimUsername({
  initial = "",
  submitLabel = "Claim my link",
  onClaim,
  onCancel,
}: {
  initial?: string;
  submitLabel?: string;
  onClaim: (username: string) => Promise<void>;
  onCancel?: () => void;
}) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const u = value.trim().toLowerCase();
    const invalid = validateUsername(u);
    if (invalid) {
      setError(invalid);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onClaim(u);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not claim that name.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <label htmlFor="username" className="label">
        Your link
      </label>
      <div className="flex items-center overflow-hidden rounded-lg border border-white/10 bg-ink-950/60 focus-within:border-accent/60 focus-within:ring-2 focus-within:ring-accent/20">
        <span className="whitespace-nowrap pl-3 font-mono text-sm text-slate-500">{host}/</span>
        <input
          id="username"
          autoFocus
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="w-full bg-transparent py-2 pr-3 font-mono text-sm text-white focus:outline-none"
          value={value}
          onChange={(e) => setValue(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
          placeholder="yourname"
          maxLength={30}
        />
      </div>
      {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}
      <div className="mt-5 flex gap-3">
        <button type="submit" disabled={busy || !value} className="btn-primary">
          {busy ? "Checking…" : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-ghost">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
