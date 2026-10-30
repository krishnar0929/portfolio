"use client";

import { getAuth, sendEmailVerification } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { firebaseApp } from "@/lib/firebase";
import { derivePrivateKey, isPrivateKey } from "@/lib/privateKey";
import { normalizeProfile, type Profile } from "@/lib/types";
import { Portfolio } from "./Portfolio";

const unlockKey = (uid: string) => `unlock:${uid}`;
const db = () => getFirestore(firebaseApp());

async function fetchByPassword(key: string): Promise<Profile | null> {
  const snap = await getDoc(doc(db(), "privateProfiles", key));
  return snap.exists() ? normalizeProfile(snap.data()) : null;
}

/** Reads the copy for invited emails; throws permission-denied if this account isn't invited. */
async function fetchAsInvited(uid: string): Promise<Profile | null> {
  const snap = await getDoc(doc(db(), "sharedProfiles", uid));
  return snap.exists() ? normalizeProfile(snap.data()) : null;
}

type Access = "checking" | "signed-out" | "unverified" | "not-invited" | "granted";

/**
 * Private profile: visitors get in by signing in with an email the owner
 * invited, or (if the owner set one) by entering the page password.
 */
export function PrivateGate({ uid, username, hasPassword }: { uid: string; username: string; hasPassword: boolean }) {
  const { user, loading, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [access, setAccess] = useState<Access>("checking");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const checkInvite = useCallback(async () => {
    if (!user) {
      setAccess("signed-out");
      return;
    }
    try {
      const p = await fetchAsInvited(uid);
      if (p) {
        setProfile(p);
        setAccess("granted");
        return;
      }
      setAccess("not-invited");
    } catch {
      setAccess(user.emailVerified ? "not-invited" : "unverified");
    }
  }, [user, uid]);

  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    (async () => {
      // A password unlock from earlier in this tab
      let saved: string | null = null;
      try {
        saved = sessionStorage.getItem(unlockKey(uid));
      } catch {
        /* storage unavailable */
      }
      if (hasPassword && isPrivateKey(saved)) {
        const p = await fetchByPassword(saved).catch(() => null);
        if (p && !cancelled) {
          setProfile(p);
          setAccess("granted");
          return;
        }
      }
      if (!cancelled) await checkInvite();
    })();
    return () => {
      cancelled = true;
    };
  }, [loading, uid, hasPassword, checkInvite]);

  const unlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setBusy(true);
    setError("");
    try {
      const key = await derivePrivateKey(uid, password);
      const p = await fetchByPassword(key);
      if (!p) {
        setError("That password isn't right.");
        return;
      }
      try {
        sessionStorage.setItem(unlockKey(uid), key);
      } catch {
        /* storage unavailable */
      }
      setProfile(p);
      setAccess("granted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not unlock this page.");
    } finally {
      setBusy(false);
    }
  };

  const resendVerification = async () => {
    const current = getAuth(firebaseApp()).currentUser;
    if (!current) return;
    try {
      await sendEmailVerification(current);
      setInfo(`Verification email sent to ${current.email}.`);
    } catch {
      setInfo("Couldn't send the email right now. Try again in a minute.");
    }
  };

  const recheckAfterVerify = async () => {
    const current = getAuth(firebaseApp()).currentUser;
    if (!current) return;
    setBusy(true);
    await current.reload();
    await current.getIdToken(true);
    setBusy(false);
    if (!current.emailVerified) {
      setInfo("Still not verified — open the link in the email first.");
      return;
    }
    setInfo("");
    try {
      const p = await fetchAsInvited(uid);
      if (p) {
        setProfile(p);
        setAccess("granted");
      } else setAccess("not-invited");
    } catch {
      setAccess("not-invited");
    }
  };

  if (profile) return <Portfolio profile={profile} />;

  const next = encodeURIComponent(`/${username}`);

  return (
    <main className="relative grid min-h-screen place-items-center bg-slate-50 px-4 py-10 text-slate-700">
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
          <span className="font-mono text-slate-700">/{username}</span> is shared only with invited people.
        </p>

        {access === "checking" ? (
          <div className="mx-auto mt-8 h-6 w-6 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
        ) : (
          <div className="mt-6 space-y-5">
            {/* Invited by email */}
            <div className="rounded-xl bg-slate-50 p-4 text-sm">
              {access === "signed-out" && (
                <>
                  <p className="font-medium text-slate-800">Were you invited?</p>
                  <p className="mt-1 text-slate-500">Sign in with the email address the owner invited.</p>
                  <Link
                    href={`/login?next=${next}`}
                    className="mt-3 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-teal-400 py-2.5 font-semibold text-white"
                  >
                    Sign in to view
                  </Link>
                </>
              )}
              {access === "unverified" && (
                <>
                  <p className="font-medium text-slate-800">Verify your email first</p>
                  <p className="mt-1 text-slate-500">
                    Signed in as <span className="font-medium text-slate-700">{user?.email}</span>. Open the verification link we
                    emailed you, then check again.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" disabled={busy} onClick={recheckAfterVerify} className="rounded-lg bg-sky-500 px-3 py-2 font-medium text-white">
                      I&apos;ve verified
                    </button>
                    <button type="button" onClick={resendVerification} className="rounded-lg border border-slate-200 px-3 py-2 text-slate-600">
                      Resend email
                    </button>
                  </div>
                </>
              )}
              {access === "not-invited" && (
                <>
                  <p className="font-medium text-slate-800">No access for this account</p>
                  <p className="mt-1 text-slate-500">
                    <span className="font-medium text-slate-700">{user?.email}</span> hasn&apos;t been invited. Ask the owner to add it,
                    or sign in with a different email.
                  </p>
                  <button
                    type="button"
                    onClick={() => signOut().then(() => setAccess("signed-out"))}
                    className="mt-3 rounded-lg border border-slate-200 px-3 py-2 text-slate-600"
                  >
                    Use another account
                  </button>
                </>
              )}
              {info && <p className="mt-3 text-xs text-sky-700">{info}</p>}
            </div>

            {/* Password */}
            {hasPassword && (
              <form onSubmit={unlock} className="space-y-3">
                <p className="text-center text-xs uppercase tracking-wider text-slate-400">or enter the page password</p>
                <label htmlFor="page-password" className="sr-only">
                  Password
                </label>
                <input
                  id="page-password"
                  type="password"
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
                  className="w-full rounded-xl border-2 border-sky-500 py-2.5 font-semibold text-sky-600 transition hover:bg-sky-50 disabled:opacity-60"
                >
                  {busy ? "Unlocking…" : "Unlock profile"}
                </button>
              </form>
            )}
          </div>
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
