"use client";

import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { SetupNotice } from "@/components/SetupNotice";
import { firebaseApp, isFirebaseConfigured } from "@/lib/firebase";

function friendlyError(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Email or password is incorrect.";
      case "auth/email-already-in-use":
        return "An account with this email already exists. Try signing in.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/invalid-email":
        return "That email address doesn't look right.";
      case "auth/popup-closed-by-user":
        return "Sign-in window was closed.";
      case "auth/too-many-requests":
        return "Too many attempts. Please wait a moment and try again.";
    }
    return err.message;
  }
  return "Something went wrong. Please try again.";
}

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  // Where to go after signing in (e.g. a private profile the visitor was invited to)
  const [next, setNext] = useState("/dashboard");
  useEffect(() => {
    const n = new URLSearchParams(window.location.search).get("next");
    if (n && n.startsWith("/") && !n.startsWith("//")) setNext(n);
  }, []);

  useEffect(() => {
    if (!loading && user) router.replace(next);
  }, [user, loading, router, next]);

  if (!isFirebaseConfigured) return <SetupNotice />;

  const auth = () => getAuth(firebaseApp());

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    setInfo("");
    try {
      await fn();
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  const google = () => run(() => signInWithPopup(auth(), new GoogleAuthProvider()));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    run(() =>
      mode === "signin"
        ? signInWithEmailAndPassword(auth(), email, password)
        : createUserWithEmailAndPassword(auth(), email, password).then((cred) => sendEmailVerification(cred.user)),
    );
  };

  const reset = () => {
    if (!email) {
      setError("Enter your email above first.");
      return;
    }
    run(async () => {
      await sendPasswordResetEmail(auth(), email);
      setInfo("Password reset email sent.");
    });
  };

  return (
    <main className="relative grid min-h-screen place-items-center px-4">
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <div className="relative w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 font-display text-lg font-semibold text-white">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-ink-950">P</span>
          Portfolio
        </Link>
        <div className="card p-7">
          <h1 className="font-display text-xl font-semibold text-white">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {mode === "signin" ? "Sign in to edit your portfolio." : "Start building your portfolio page."}
          </p>

          <button type="button" onClick={google} disabled={busy} className="btn-ghost mt-6 w-full">
            <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden>
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
              <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
            </svg>
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3 text-xs text-slate-500">
            <span className="h-px flex-1 bg-white/10" /> or <span className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-rose-400">{error}</p>}
            {info && <p className="text-sm text-emerald-400">{info}</p>}
            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between text-sm">
            <button
              type="button"
              className="text-slate-400 hover:text-white"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError("");
              }}
            >
              {mode === "signin" ? "New here? Create account" : "Have an account? Sign in"}
            </button>
            {mode === "signin" && (
              <button type="button" className="text-slate-500 hover:text-white" onClick={reset}>
                Forgot?
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
