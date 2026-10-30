"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { ArrowUpRightIcon, ChevronDownIcon, CloseIcon } from "@/components/Icons";
import { ClaimUsername } from "@/components/editor/ClaimUsername";
import { ProfileEditor } from "@/components/editor/ProfileEditor";
import { Portfolio } from "@/components/portfolio/Portfolio";
import { SetupNotice } from "@/components/SetupNotice";
import { hexToRgbTriplet } from "@/lib/color";
import { isFirebaseConfigured, SITE_URL } from "@/lib/firebase";
import { derivePrivateKey } from "@/lib/privateKey";
import { claimUsername, getMyProfile, saveProfile } from "@/lib/profiles";
import { sampleProfile } from "@/lib/sample";
import {
  isValidEmail,
  MIN_PASSWORD_LENGTH,
  normalizeEmail,
  normalizeProfile,
  publishedView,
  type Profile,
  type Visibility,
} from "@/lib/types";

type SaveState = "idle" | "saving" | "saved" | "error";

const VISIBILITY: { value: Visibility; label: string; hint: string }[] = [
  { value: "draft", label: "Draft", hint: "Only you can see it" },
  { value: "public", label: "Public", hint: "Anyone can view and find it by name, skills or location" },
  { value: "private", label: "Private", hint: "Only people you invite by email, or who have the password" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [savedJson, setSavedJson] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState("");
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [renaming, setRenaming] = useState(false);
  const [copied, setCopied] = useState(false);
  // Key the password copy is stored under (derived from the page password; the password itself is never saved)
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [passwordDialog, setPasswordDialog] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  // Load the signed-in user's profile
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoadingProfile(true);
    getMyProfile(user.uid)
      .then((res) => {
        if (cancelled) return;
        setProfile(res?.profile ?? null);
        setPrivateKey(res?.privateKey ?? null);
        setSavedJson(res ? JSON.stringify(res.profile) : "");
      })
      .catch((e: unknown) => {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "Could not load your profile.");
      })
      .finally(() => {
        if (!cancelled) setLoadingProfile(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const dirty = useMemo(() => !!profile && JSON.stringify(profile) !== savedJson, [profile, savedJson]);
  const savedEmails = useMemo(() => (savedJson ? normalizeProfile(JSON.parse(savedJson)).authorizedEmails : []), [savedJson]);

  // Warn before leaving with unsaved edits
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const persist = useCallback(
    async (next: Profile, key: string | null = privateKey): Promise<boolean> => {
      if (!user) return false;
      setSaveState("saving");
      setSaveError("");
      try {
        await saveProfile(user.uid, next, { privateKey: key, previousKey: privateKey, previousEmails: savedEmails });
        setPrivateKey(key);
        setSavedJson(JSON.stringify(next));
        setSaveState("saved");
        setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 2000);
        return true;
      } catch (e) {
        setSaveState("error");
        setSaveError(e instanceof Error ? e.message : "Save failed.");
        return false;
      }
    },
    [user, privateKey, savedEmails],
  );

  // Cmd/Ctrl+S saves
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (profile && dirty) persist(profile);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [profile, dirty, persist]);

  if (!isFirebaseConfigured) return <SetupNotice />;

  if (loading || !user || loadingProfile) {
    return (
      <main className="grid min-h-screen place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="grid min-h-screen place-items-center px-4 text-center">
        <div>
          <p className="text-rose-400">{loadError}</p>
          <p className="mt-2 text-sm text-slate-500">Check that Firestore is created and the rules are deployed.</p>
        </div>
      </main>
    );
  }

  // First visit: pick a username
  if (!profile) {
    const suggested = (user.email?.split("@")[0] ?? "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 30);
    const [first = "", ...rest] = (user.displayName ?? "").trim().split(/\s+/).filter(Boolean);
    return (
      <main className="relative grid min-h-screen place-items-center px-4">
        <div className="bg-grid pointer-events-none absolute inset-0" />
        <div className="card relative w-full max-w-md p-8">
          <p className="eyebrow">Step 1 of 2</p>
          <h1 className="mt-3 font-display text-2xl font-semibold text-white">Claim your link</h1>
          <p className="mt-2 text-sm text-slate-400">This is the address you&apos;ll share. You can change it later.</p>
          <div className="mt-6">
            <ClaimUsername
              initial={suggested}
              onClaim={async (u) => {
                const p = await claimUsername(user.uid, u, {
                  firstName: first,
                  lastName: rest.join(" "),
                  email: user.email ?? "",
                  avatarUrl: user.photoURL ?? "",
                });
                setProfile(p);
                setSavedJson(JSON.stringify(p));
              }}
            />
          </div>
        </div>
      </main>
    );
  }

  const shareUrl = `${SITE_URL}/${profile.username}`;
  const isEmpty = !profile.title && !profile.about && profile.projects.length === 0 && profile.experience.length === 0;

  // Changing access also saves any pending edits
  const changeVisibility = async (visibility: Visibility) => {
    if (visibility === profile.visibility) return;
    const next = { ...profile, visibility };
    if (await persist(next)) setProfile(next);
  };

  const changeEmails = async (authorizedEmails: string[]) => {
    const next = { ...profile, authorizedEmails };
    if (await persist(next)) setProfile(next);
  };

  const removePassword = async () => {
    if (!window.confirm("Remove the page password? People who only have the password will lose access.")) return;
    await persist(profile, null);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const loadSample = () => {
    if (!isEmpty && !window.confirm("Replace your current content with the sample? Your link and access settings stay the same.")) return;
    setProfile({
      ...sampleProfile,
      username: profile.username,
      visibility: profile.visibility,
      authorizedEmails: profile.authorizedEmails,
      firstName: profile.firstName || sampleProfile.firstName,
      middleName: profile.middleName,
      lastName: profile.lastName || sampleProfile.lastName,
      email: profile.email || sampleProfile.email,
      avatarUrl: profile.avatarUrl,
    });
  };

  const accentStyle = { "--accent": hexToRgbTriplet(profile.accent) } as React.CSSProperties;

  return (
    <div style={accentStyle} className="flex h-screen flex-col">
      {/* Top bar */}
      <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-white/[0.06] bg-ink-950 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent font-display font-semibold text-ink-950">
            P
          </Link>
          <button
            type="button"
            onClick={copyLink}
            title="Copy link"
            className="hidden min-w-0 truncate font-mono text-sm text-slate-400 hover:text-white sm:block"
          >
            {copied ? "Copied!" : shareUrl.replace(/^https?:\/\//, "")}
          </button>
          <button type="button" onClick={() => setRenaming(true)} className="hidden text-xs text-accent hover:underline sm:block">
            change
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-slate-500 md:block" aria-live="polite">
            {saveState === "saving"
              ? "Saving…"
              : saveState === "saved"
                ? "Saved"
                : saveState === "error"
                  ? "Save failed"
                  : dirty
                    ? "Unsaved changes"
                    : ""}
          </span>
          <VisibilityBadge visibility={profile.visibility} />
          <button type="button" onClick={() => persist(profile)} disabled={!dirty || saveState === "saving"} className="btn-primary">
            Save
          </button>
          <button type="button" onClick={() => signOut().then(() => router.replace("/"))} className="btn text-slate-500 hover:text-white">
            Sign out
          </button>
        </div>
      </header>

      {saveError && <div className="bg-rose-500/10 px-6 py-2 text-sm text-rose-300">{saveError}</div>}

      {/* Mobile view switch */}
      <div className="flex shrink-0 gap-1 border-b border-white/[0.06] p-2 lg:hidden">
        {(["edit", "preview"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`flex-1 rounded-lg py-2 text-sm capitalize ${view === v ? "bg-white/[0.07] text-white" : "text-slate-400"}`}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Editor */}
        <section
          className={`${view === "edit" ? "block" : "hidden"} w-full space-y-3 overflow-y-auto bg-ink-900 px-4 pb-16 pt-4 sm:px-6 lg:block lg:w-[500px] lg:shrink-0 lg:border-r lg:border-white/[0.06]`}
        >
          <SharingPanel
            profile={profile}
            hasPassword={!!privateKey}
            busy={saveState === "saving"}
            shareUrl={shareUrl}
            copied={copied}
            onCopy={copyLink}
            onVisibility={changeVisibility}
            onEmails={changeEmails}
            onSetPassword={() => setPasswordDialog(true)}
            onRemovePassword={removePassword}
          />

          {isEmpty && (
            <div className="rounded-xl border border-white/[0.08] p-4 text-sm">
              <p className="text-slate-300">Starting from scratch?</p>
              <p className="mt-1 text-slate-500">Load sample content and replace it with yours.</p>
              <button type="button" onClick={loadSample} className="mt-3 text-accent hover:underline">
                Fill with sample content
              </button>
            </div>
          )}

          <ProfileEditor profile={profile} onChange={setProfile} photoURL={user.photoURL} />
        </section>

        {/* Live preview — exactly what visitors see */}
        <section className={`${view === "preview" ? "block" : "hidden"} min-w-0 flex-1 overflow-y-auto lg:block`}>
          <div className="flex items-center justify-between border-b border-white/[0.06] bg-ink-950 px-4 py-2 text-xs text-slate-500">
            <span>Live preview · what visitors see</span>
            {profile.visibility !== "draft" && (
              <a href={`/${profile.username}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-white">
                Open my page <ArrowUpRightIcon className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
          <Portfolio profile={publishedView(profile)} />
        </section>
      </div>

      {/* Change username dialog */}
      {renaming && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="card w-full max-w-md p-7">
            <h2 className="font-display text-xl font-semibold text-white">Change your link</h2>
            <p className="mt-1 text-sm text-slate-400">Your old link will stop working and become available to others.</p>
            <div className="mt-6">
              <ClaimUsername
                initial={profile.username}
                submitLabel="Change link"
                onCancel={() => setRenaming(false)}
                onClaim={async (u) => {
                  if (u === profile.username) {
                    setRenaming(false);
                    return;
                  }
                  if (dirty && !(await persist(profile))) return;
                  const updated = await claimUsername(user.uid, u);
                  setProfile(updated);
                  // Recreate the visitor copies under the new name
                  await persist(updated);
                  setRenaming(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Page password dialog */}
      {passwordDialog && (
        <PasswordDialog
          changing={!!privateKey}
          onCancel={() => setPasswordDialog(false)}
          onSubmit={async (password) => {
            const key = await derivePrivateKey(user.uid, password);
            if (await persist(profile, key)) setPasswordDialog(false);
            else throw new Error("Could not save. Please try again.");
          }}
        />
      )}
    </div>
  );
}

function VisibilityBadge({ visibility }: { visibility: Visibility }) {
  const styles: Record<Visibility, string> = {
    draft: "border-white/10 text-slate-300",
    public: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    private: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  };
  return (
    <span className={`hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium capitalize sm:inline-flex ${styles[visibility]}`}>
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          visibility === "public" ? "bg-emerald-400" : visibility === "private" ? "bg-amber-300" : "bg-slate-500"
        }`}
      />
      {visibility}
    </span>
  );
}

function SharingPanel({
  profile,
  hasPassword,
  busy,
  shareUrl,
  copied,
  onCopy,
  onVisibility,
  onEmails,
  onSetPassword,
  onRemovePassword,
}: {
  profile: Profile;
  hasPassword: boolean;
  busy: boolean;
  shareUrl: string;
  copied: boolean;
  onCopy: () => void;
  onVisibility: (v: Visibility) => void;
  onEmails: (emails: string[]) => Promise<void>;
  onSetPassword: () => void;
  onRemovePassword: () => void;
}) {
  const [open, setOpen] = useState(profile.visibility === "draft");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const emails = profile.authorizedEmails;

  const summary =
    profile.visibility === "draft"
      ? "Draft — only you can see your page"
      : profile.visibility === "public"
        ? "Public — anyone can view and search for you"
        : `Private — ${emails.length} invited${hasPassword ? " · password on" : ""}`;

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = normalizeEmail(email);
    if (!isValidEmail(value)) {
      setError("Enter a valid email address.");
      return;
    }
    if (emails.includes(value)) {
      setError("Already invited.");
      return;
    }
    setError("");
    await onEmails([...emails, value]);
    setEmail("");
  };

  return (
    <section className="overflow-hidden rounded-xl border border-accent/25 bg-accent/[0.04]">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent/15 text-accent" aria-hidden>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-medium text-slate-100">Sharing &amp; access</span>
          <span className="block truncate text-xs text-slate-400">{summary}</span>
        </span>
        <ChevronDownIcon className={`h-4 w-4 shrink-0 text-slate-500 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="space-y-5 border-t border-white/[0.06] px-4 pb-5 pt-4">
          <div role="radiogroup" aria-label="Who can see your page" className="grid gap-2">
            {VISIBILITY.map((v) => {
              const active = profile.visibility === v.value;
              return (
                <button
                  key={v.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  disabled={busy}
                  onClick={() => onVisibility(v.value)}
                  className={`flex items-start gap-3 rounded-lg border p-3 text-left transition ${
                    active ? "border-accent/60 bg-accent/10" : "border-white/[0.08] hover:border-white/20"
                  }`}
                >
                  <span
                    className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 ${
                      active ? "border-accent" : "border-slate-500"
                    }`}
                  >
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-slate-100">{v.label}</span>
                    <span className="block text-xs text-slate-400">{v.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {profile.visibility !== "draft" && (
            <div className="flex items-center gap-2 rounded-lg bg-ink-950/50 p-2 pl-3">
              <span className="min-w-0 flex-1 truncate font-mono text-xs text-slate-300">{shareUrl}</span>
              <button type="button" onClick={onCopy} className="btn-ghost px-3 py-1.5 text-xs">
                {copied ? "Copied!" : "Copy link"}
              </button>
            </div>
          )}

          {profile.visibility === "private" && (
            <>
              <div>
                <p className="label">Invited people</p>
                <p className="mb-3 text-xs text-slate-500">
                  They sign in with this email (Google or email/password) to view your page. Changes save immediately.
                </p>
                <form onSubmit={add} className="flex gap-2">
                  <input
                    type="email"
                    className="input"
                    placeholder="recruiter@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-label="Email to invite"
                  />
                  <button type="submit" disabled={busy || !email} className="btn-primary shrink-0 px-4">
                    Invite
                  </button>
                </form>
                {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}
                {emails.length > 0 ? (
                  <ul className="mt-3 space-y-1.5">
                    {emails.map((e) => (
                      <li key={e} className="flex items-center justify-between gap-2 rounded-lg bg-white/[0.03] px-3 py-2 text-sm">
                        <span className="truncate text-slate-200">{e}</span>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => onEmails(emails.filter((x) => x !== e))}
                          aria-label={`Remove ${e}`}
                          className="rounded p-1 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400"
                        >
                          <CloseIcon className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-xs text-slate-500">No one invited yet.</p>
                )}
              </div>

              <div>
                <p className="label">Page password</p>
                <p className="mb-3 text-xs text-slate-500">
                  Optional. Anyone with your link and this password can view your page, without signing in.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" disabled={busy} onClick={onSetPassword} className="btn-ghost px-4 py-2 text-xs">
                    {hasPassword ? "Change password" : "Set password"}
                  </button>
                  {hasPassword && (
                    <button type="button" disabled={busy} onClick={onRemovePassword} className="btn px-3 py-2 text-xs text-rose-300 hover:text-rose-200">
                      Remove password
                    </button>
                  )}
                </div>
              </div>

              {emails.length === 0 && !hasPassword && (
                <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-200/80">
                  Nobody can view your page yet. Invite someone or set a password.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}

function PasswordDialog({
  changing,
  onCancel,
  onSubmit,
}: {
  changing: boolean;
  onCancel: () => void;
  onSubmit: (password: string) => Promise<void>;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onSubmit(password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <form onSubmit={submit} className="card w-full max-w-md p-7">
        <h2 className="font-display text-xl font-semibold text-white">{changing ? "Change page password" : "Set a page password"}</h2>
        <p className="mt-1 text-sm text-slate-400">
          Anyone with your link and this password can view your page. Share it only with people you trust.
          {changing && " The old password stops working immediately."}
        </p>
        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="pw" className="label">
              Page password
            </label>
            <input id="pw" type="password" autoFocus autoComplete="new-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
            <label htmlFor="pw2" className="label">
              Confirm password
            </label>
            <input id="pw2" type="password" autoComplete="new-password" className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          <p className="text-xs text-slate-500">
            This is separate from your sign-in password, and it isn&apos;t stored — if you forget it, just set a new one.
          </p>
          {error && <p className="text-sm text-rose-400">{error}</p>}
        </div>
        <div className="mt-6 flex gap-3">
          <button type="submit" disabled={busy} className="btn-primary">
            {busy ? "Saving…" : "Save password"}
          </button>
          <button type="button" onClick={onCancel} disabled={busy} className="btn-ghost">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
