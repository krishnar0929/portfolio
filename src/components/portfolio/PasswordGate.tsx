"use client";

import { doc, getDoc, getFirestore } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { firebaseApp } from "@/lib/firebase";
import { derivePrivateKey, isPrivateKey } from "@/lib/privateKey";
import { normalizeProfile, type Profile } from "@/lib/types";
import { Portfolio } from "./Portfolio";

const storageKey = (uid: string) => `unlock:${uid}`;

async function fetchPrivate(key: string): Promise<Profile | null> {
  const snap = await getDoc(doc(getFirestore(firebaseApp()), "privateProfiles", key));
  return snap.exists() ? normalizeProfile(snap.data() as Partial<Profile>) : null;
}

/** Asks for the page password, then loads and shows the private portfolio. */
export function PasswordGate({ uid, username }: { uid: string; username: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Re-use an unlock from earlier in this browser tab
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = sessionStorage.getItem(storageKey(uid));
    } catch {
      /* storage unavailable */
    }
    if (!isPrivateKey(saved)) {
      setChecking(false);
      return;
    }
    fetchPrivate(saved)
      .then((p) => setProfile(p))
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [uid]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setBusy(true);
    setError("");
    try {
      const key = await derivePrivateKey(uid, password);
      const p = await fetchPrivate(key);
      if (!p) {
        setError("That password isn't right.");
        return;
      }
      try {
        sessionStorage.setItem(storageKey(uid), key);
      } catch {
        /* storage unavailable */
      }
      setProfile(p);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not unlock this page.");
    } finally {
      setBusy(false);
    }
  };

  if (profile) return <Portfolio profile={profile} />;

  return (
    <main className="relative grid min-h-screen place-items-center bg-slate-50 px-4 text-slate-700">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,rgb(14_165_233/0.15),transparent_65%)]" />
      <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-25px_rgb(15_23_42/0.25)]">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-sky-50 text-sky-600">
          <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
            <rect x="4" y="10" width="16" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="mt-5 text-center font-display text-xl font-bold text-slate-900">This profile is private</h1>
        <p className="mt-1 text-center text-sm text-slate-500">
          Enter the password <span className="font-mono text-slate-700">/{username}</span> shared with you.
        </p>

        {checking ? (
          <div className="mx-auto mt-8 h-6 w-6 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-3">
            <label htmlFor="page-password" className="sr-only">
              Password
            </label>
            <input
              id="page-password"
              type="password"
              autoFocus
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-100"
            />
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <button
              type="submit"
              disabled={busy || !password}
              className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-teal-400 py-3 font-semibold text-white shadow-sm transition hover:brightness-105 disabled:opacity-60"
            >
              {busy ? "Unlocking…" : "Unlock profile"}
            </button>
          </form>
        )}
        <p className="mt-6 text-center text-xs text-slate-400">
          <Link href="/" className="hover:text-sky-600">
            Made with Portfolio
          </Link>
        </p>
      </div>
    </main>
  );
}
