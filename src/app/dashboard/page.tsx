"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { ArrowUpRightIcon } from "@/components/Icons";
import { ClaimUsername } from "@/components/editor/ClaimUsername";
import { ProfileEditor } from "@/components/editor/ProfileEditor";
import { Portfolio } from "@/components/portfolio/Portfolio";
import { SetupNotice } from "@/components/SetupNotice";
import { hexToRgbTriplet } from "@/lib/color";
import { isFirebaseConfigured, SITE_URL } from "@/lib/firebase";
import { claimUsername, getMyProfile, saveProfile } from "@/lib/profiles";
import { sampleProfile } from "@/lib/sample";
import type { Profile } from "@/lib/types";

type SaveState = "idle" | "saving" | "saved" | "error";

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
      .then((p) => {
        if (cancelled) return;
        setProfile(p);
        setSavedJson(p ? JSON.stringify(p) : "");
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
    async (next: Profile): Promise<boolean> => {
      if (!user) return false;
      setSaveState("saving");
      setSaveError("");
      try {
        await saveProfile(user.uid, next);
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
    [user],
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
    return (
      <main className="relative grid min-h-screen place-items-center px-4">
        <div className="bg-grid pointer-events-none absolute inset-0" />
        <div className="card relative w-full max-w-md p-8">
          <p className="eyebrow">Step 1 of 2</p>
          <h1 className="mt-3 font-display text-2xl font-semibold text-white">Claim your link</h1>
          <p className="mt-2 text-sm text-slate-400">
            This is the address you&apos;ll share. You can change it later.
          </p>
          <div className="mt-6">
            <ClaimUsername
              initial={suggested}
              onClaim={async (u) => {
                const p = await claimUsername(user.uid, u, {
                  name: user.displayName ?? "",
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

  const publicUrl = `${SITE_URL}/${profile.username}`;
  const isEmpty = !profile.title && !profile.about && profile.projects.length === 0 && profile.experience.length === 0;

  // Publishing also saves any pending edits
  const togglePublish = async () => {
    const next = { ...profile, published: !profile.published };
    if (await persist(next)) setProfile(next);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const loadSample = () => {
    if (!isEmpty && !window.confirm("Replace your current content with the sample? Your link stays the same.")) return;
    setProfile({
      ...sampleProfile,
      username: profile.username,
      published: profile.published,
      name: profile.name || sampleProfile.name,
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
            {copied ? "Copied!" : publicUrl.replace(/^https?:\/\//, "")}
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
          <button
            type="button"
            onClick={togglePublish}
            disabled={saveState === "saving"}
            className={`btn border ${
              profile.published
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-white/10 text-slate-300 hover:text-white"
            }`}
            title={profile.published ? "Click to unpublish" : "Make your page public"}
          >
            <span className={`h-2 w-2 rounded-full ${profile.published ? "bg-emerald-400" : "bg-slate-500"}`} />
            {profile.published ? "Live" : "Publish"}
          </button>
          <button
            type="button"
            onClick={() => persist(profile)}
            disabled={!dirty || saveState === "saving"}
            className="btn-primary"
          >
            Save
          </button>
          <button type="button" onClick={() => signOut().then(() => router.replace("/"))} className="btn text-slate-500 hover:text-white">
            Sign out
          </button>
        </div>
      </header>

      {saveError && (
        <div className="bg-rose-500/10 px-6 py-2 text-sm text-rose-300">
          {saveError}
        </div>
      )}

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
          className={`${view === "edit" ? "block" : "hidden"} w-full overflow-y-auto bg-ink-900 px-4 pb-16 sm:px-6 lg:block lg:w-[460px] lg:shrink-0 lg:border-r lg:border-white/[0.06]`}
        >
          {isEmpty && (
            <div className="card mt-5 p-4 text-sm">
              <p className="text-slate-300">Starting from scratch?</p>
              <p className="mt-1 text-slate-500">Load the sample content and replace it with yours.</p>
              <button type="button" onClick={loadSample} className="mt-3 text-accent hover:underline">
                Fill with sample content
              </button>
            </div>
          )}
          {!profile.published && !isEmpty && (
            <p className="mt-5 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-200/80">
              Your page is private. Save, then click <strong>Publish</strong> to make it live.
            </p>
          )}
          <div className="pt-4">
            <ProfileEditor profile={profile} onChange={setProfile} photoURL={user.photoURL} />
          </div>
        </section>

        {/* Live preview */}
        <section className={`${view === "preview" ? "block" : "hidden"} min-w-0 flex-1 overflow-y-auto lg:block`}>
          <div className="flex items-center justify-between border-b border-white/[0.06] bg-ink-950 px-4 py-2 text-xs text-slate-500">
            <span>Live preview</span>
            {profile.published && (
              <a href={`/${profile.username}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-white">
                Open public page <ArrowUpRightIcon className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
          <Portfolio profile={profile} />
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
                  setSavedJson(JSON.stringify(updated));
                  setRenaming(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
