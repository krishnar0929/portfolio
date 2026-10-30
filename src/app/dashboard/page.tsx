"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { SettingsPanel } from "@/components/dashboard/SettingsPanel";
import { ClaimUsername } from "@/components/editor/ClaimUsername";
import { ProfileEditor } from "@/components/editor/ProfileEditor";
import { ExportMenu } from "@/components/export/ExportMenu";
import { ArrowUpRightIcon } from "@/components/Icons";
import { Portfolio } from "@/components/portfolio/Portfolio";
import { SetupNotice } from "@/components/SetupNotice";
import { hexToRgbTriplet } from "@/lib/color";
import { isFirebaseConfigured, SITE_URL } from "@/lib/firebase";
import { derivePrivateKey } from "@/lib/privateKey";
import { claimUsername, getMyProfile, saveProfile } from "@/lib/profiles";
import { sampleProfile } from "@/lib/sample";
import { completion } from "@/lib/sections";
import { MIN_PASSWORD_LENGTH, normalizeProfile, publishedView, type Profile, type Visibility } from "@/lib/types";

type SaveState = "idle" | "saving" | "saved" | "error";
type Mode = "view" | "edit" | "settings";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [savedJson, setSavedJson] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState("");
  const [mode, setMode] = useState<Mode>("view");
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

  // Scroll to top when switching modes
  useEffect(() => {
    document.getElementById("dashboard-main")?.scrollTo({ top: 0 });
  }, [mode]);

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
                setMode("edit");
              }}
            />
          </div>
        </div>
      </main>
    );
  }

  const shareUrl = `${SITE_URL}/${profile.username}`;
  const isEmpty = !profile.title && !profile.about && profile.projects.length === 0 && profile.experience.length === 0;
  const visitorView = publishedView(profile);

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

  const discard = () => {
    if (!window.confirm("Discard your unsaved changes?")) return;
    setProfile(normalizeProfile(JSON.parse(savedJson)));
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
    if (!isEmpty && !window.confirm("Replace your current content with the sample? Your link and settings stay the same.")) return;
    setProfile({
      ...sampleProfile,
      username: profile.username,
      visibility: profile.visibility,
      authorizedEmails: profile.authorizedEmails,
      accent: profile.accent,
      theme: profile.theme,
      backgroundStyle: profile.backgroundStyle,
      backgroundUrl: profile.backgroundUrl,
      firstName: profile.firstName || sampleProfile.firstName,
      middleName: profile.middleName,
      lastName: profile.lastName || sampleProfile.lastName,
      email: profile.email || sampleProfile.email,
      avatarUrl: profile.avatarUrl,
    });
  };

  const accentStyle = { "--accent": hexToRgbTriplet(profile.accent) } as React.CSSProperties;
  const pct = completion(profile);

  return (
    <div style={accentStyle} className="flex h-screen flex-col bg-ink-950">
      {/* ---------- Top bar ---------- */}
      <header className="shrink-0 border-b border-white/[0.06] bg-ink-950/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Link href="/" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent font-display font-semibold text-ink-950">
            P
          </Link>
          <div className="hidden min-w-0 md:block">
            <p className="truncate text-sm font-medium text-white">
              {[profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.username}
            </p>
            <button type="button" onClick={copyLink} title="Copy link" className="block max-w-[220px] truncate font-mono text-xs text-slate-500 hover:text-slate-300">
              {copied ? "Link copied!" : shareUrl.replace(/^https?:\/\//, "")}
            </button>
          </div>

          <VisibilityStatus
            visibility={profile.visibility}
            invited={profile.authorizedEmails.length}
            onClick={() => setMode("settings")}
          />

          {/* Mode switch */}
          <nav className="mx-auto flex rounded-full border border-white/10 bg-white/[0.03] p-1" aria-label="Dashboard">
            {(
              [
                ["view", "View"],
                ["edit", "Edit"],
                ["settings", "Settings"],
              ] as const
            ).map(([m, label]) => (
              <button
                key={m}
                type="button"
                aria-current={mode === m ? "page" : undefined}
                onClick={() => setMode(m)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition sm:px-4 ${
                  mode === m ? "bg-accent text-ink-950" : "text-slate-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-slate-500 lg:block" aria-live="polite">
              {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved ✓" : saveState === "error" ? "Save failed" : ""}
            </span>
            <ExportMenu profile={visitorView} variant="dark" />
            <button
              type="button"
              onClick={() => persist(profile)}
              disabled={!dirty || saveState === "saving"}
              className="btn-primary px-4"
            >
              Save
            </button>
          </div>
        </div>

        {/* Unsaved-changes bar */}
        {dirty && (
          <div className="border-t border-amber-500/20 bg-amber-500/10">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm sm:px-6">
              <span className="text-amber-200">
                {mode === "view" ? "Previewing unsaved changes — visitors still see your last saved version." : "You have unsaved changes."}
              </span>
              <span className="flex items-center gap-2">
                {mode !== "view" && (
                  <button type="button" onClick={() => setMode("view")} className="rounded-full px-3 py-1 text-amber-100 hover:bg-amber-500/15">
                    Preview
                  </button>
                )}
                {mode === "view" && (
                  <button type="button" onClick={() => setMode("edit")} className="rounded-full px-3 py-1 text-amber-100 hover:bg-amber-500/15">
                    Keep editing
                  </button>
                )}
                <button type="button" onClick={discard} className="rounded-full px-3 py-1 text-amber-100/80 hover:bg-amber-500/15">
                  Discard
                </button>
                <button
                  type="button"
                  onClick={() => persist(profile)}
                  disabled={saveState === "saving"}
                  className="rounded-full bg-amber-400 px-3 py-1 font-medium text-ink-950 hover:bg-amber-300"
                >
                  Save changes
                </button>
              </span>
            </div>
          </div>
        )}
        {saveError && <div className="bg-rose-500/10 px-6 py-2 text-center text-sm text-rose-300">{saveError}</div>}
      </header>

      {/* ---------- Body ---------- */}
      <main id="dashboard-main" className="min-h-0 flex-1 overflow-y-auto">
        {mode === "view" && (
          <>
            {profile.visibility === "draft" && !dirty && (
              <div className="border-b border-white/[0.06] bg-ink-900 px-4 py-2 text-center text-xs text-slate-400">
                This is how your page will look. It&apos;s a <strong className="text-slate-200">draft</strong> — only you can see it.{" "}
                <button type="button" className="text-accent hover:underline" onClick={() => setMode("settings")}>
                  Change visibility
                </button>
              </div>
            )}
            {isEmpty ? (
              <div className="mx-auto max-w-xl px-4 py-24 text-center">
                <h1 className="font-display text-3xl font-semibold text-white">Let&apos;s build your profile</h1>
                <p className="mt-3 text-slate-400">Add your details section by section, or start from sample content and replace it.</p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <button type="button" onClick={() => setMode("edit")} className="btn-primary px-6 py-3">
                    Start editing
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      loadSample();
                      setMode("edit");
                    }}
                    className="btn-ghost px-6 py-3"
                  >
                    Use sample content
                  </button>
                </div>
              </div>
            ) : (
              <Portfolio profile={visitorView} showExport={false} />
            )}
          </>
        )}

        {mode === "edit" && (
          <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-semibold text-white">Edit profile</h1>
                <p className="mt-1 text-sm text-slate-400">Open a section to edit it. Preview anytime before you save.</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setMode("view")} className="btn-ghost">
                  Preview
                </button>
                <button type="button" onClick={() => persist(profile)} disabled={!dirty || saveState === "saving"} className="btn-primary">
                  Save
                </button>
              </div>
            </div>

            {isEmpty && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-ink-900/60 p-4 text-sm">
                <span className="text-slate-300">Starting from scratch? Load sample content and replace it with yours.</span>
                <button type="button" onClick={loadSample} className="text-accent hover:underline">
                  Fill with sample content
                </button>
              </div>
            )}

            <ProfileEditor profile={profile} onChange={setProfile} photoURL={user.photoURL} />

            <div className="mt-8 flex justify-end gap-2">
              <button type="button" onClick={() => setMode("view")} className="btn-ghost">
                Preview
              </button>
              <button type="button" onClick={() => persist(profile)} disabled={!dirty || saveState === "saving"} className="btn-primary">
                Save changes
              </button>
            </div>
          </div>
        )}

        {mode === "settings" && (
          <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-semibold text-white">Settings</h1>
                <p className="mt-1 text-sm text-slate-400">Visibility, who can view, appearance and export.</p>
              </div>
              <div className="text-right text-xs text-slate-500">
                Profile strength <span className="font-mono text-accent">{pct}%</span>
                {profile.visibility !== "draft" && (
                  <a href={`/${profile.username}`} target="_blank" rel="noopener noreferrer" className="ml-3 inline-flex items-center gap-1 text-slate-300 hover:text-white">
                    Open my page <ArrowUpRightIcon className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
            <SettingsPanel
              profile={profile}
              email={user.email ?? ""}
              hasPassword={!!privateKey}
              busy={saveState === "saving"}
              shareUrl={shareUrl}
              copied={copied}
              onCopy={copyLink}
              onRename={() => setRenaming(true)}
              onVisibility={changeVisibility}
              onEmails={changeEmails}
              onSetPassword={() => setPasswordDialog(true)}
              onRemovePassword={removePassword}
              onChange={(patch) => setProfile({ ...profile, ...patch })}
              onSignOut={() => signOut().then(() => router.replace("/"))}
            />
          </div>
        )}
      </main>

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

/** Always-visible visibility pill; opens Settings. */
function VisibilityStatus({ visibility, invited, onClick }: { visibility: Visibility; invited: number; onClick: () => void }) {
  const cfg = {
    draft: { label: "Draft", detail: "Only you", cls: "border-white/15 bg-white/[0.04] text-slate-300", dot: "bg-slate-400" },
    public: { label: "Public", detail: "Anyone · searchable", cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300", dot: "bg-emerald-400" },
    private: {
      label: "Private",
      detail: `${invited} invited`,
      cls: "border-amber-500/30 bg-amber-500/10 text-amber-200",
      dot: "bg-amber-300",
    },
  }[visibility];
  return (
    <button
      type="button"
      onClick={onClick}
      title="Change visibility"
      className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition hover:brightness-125 ${cfg.cls}`}
    >
      {visibility === "private" ? (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      ) : (
        <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
      )}
      {cfg.label}
      <span className="hidden font-normal opacity-70 xl:inline">· {cfg.detail}</span>
    </button>
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
          Anyone with your link and this password can view your page while it&apos;s Private.
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
            Separate from your sign-in password, and not stored — if you forget it, just set a new one.
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
