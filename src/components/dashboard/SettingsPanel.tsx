"use client";

import { useState } from "react";
import { CloseIcon } from "@/components/Icons";
import { EXPORT_OPTIONS, useProfileExport } from "@/components/export/ExportMenu";
import {
  ACCENT_PRESETS,
  BACKGROUND_STYLES,
  isValidEmail,
  normalizeEmail,
  publishedView,
  THEME_PRESETS,
  type BackgroundStyle,
  type Profile,
  type Visibility,
} from "@/lib/types";

export const VISIBILITY: { value: Visibility; label: string; hint: string }[] = [
  { value: "draft", label: "Draft", hint: "Only you can see it" },
  { value: "public", label: "Public", hint: "Anyone can view it and find it by name, skills or location" },
  { value: "private", label: "Private", hint: "Only people you invite, or who have the page password" },
];

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-ink-900/70 p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold text-white">{title}</h2>
      {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Small swatch showing what a background style looks like. */
function BackgroundSwatch({ style, accent }: { style: BackgroundStyle; accent: string }) {
  const base = "absolute inset-0";
  return (
    <span className="relative block h-16 overflow-hidden rounded-lg bg-slate-100">
      {style === "aurora" && (
        <>
          <span className="absolute -left-4 -top-6 h-14 w-20 rounded-full blur-xl" style={{ background: `${accent}55` }} />
          <span className="absolute -right-2 top-3 h-12 w-16 rounded-full bg-cyan-300/50 blur-xl" />
        </>
      )}
      {style === "grid" && (
        <span
          className={base}
          style={{
            backgroundImage:
              "linear-gradient(rgb(15 23 42/0.12) 1px,transparent 1px),linear-gradient(90deg,rgb(15 23 42/0.12) 1px,transparent 1px)",
            backgroundSize: "10px 10px",
          }}
        />
      )}
      {style === "dots" && (
        <span
          className={base}
          style={{ backgroundImage: "radial-gradient(rgb(15 23 42/0.25) 1px,transparent 1px)", backgroundSize: "8px 8px" }}
        />
      )}
    </span>
  );
}

export function SettingsPanel({
  profile,
  email,
  hasPassword,
  busy,
  shareUrl,
  copied,
  onCopy,
  onRename,
  onVisibility,
  onEmails,
  onSetPassword,
  onRemovePassword,
  onChange,
  onSignOut,
}: {
  profile: Profile;
  email: string;
  hasPassword: boolean;
  busy: boolean;
  shareUrl: string;
  copied: boolean;
  onCopy: () => void;
  onRename: () => void;
  onVisibility: (v: Visibility) => void;
  onEmails: (emails: string[]) => Promise<void>;
  onSetPassword: () => void;
  onRemovePassword: () => void;
  onChange: (patch: Partial<Profile>) => void;
  onSignOut: () => void;
}) {
  const [invite, setInvite] = useState("");
  const [inviteError, setInviteError] = useState("");
  const emails = profile.authorizedEmails;
  const { run, portal } = useProfileExport(publishedView(profile));

  const addInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = normalizeEmail(invite);
    if (!isValidEmail(value)) return setInviteError("Enter a valid email address.");
    if (emails.includes(value)) return setInviteError("Already invited.");
    if (value === normalizeEmail(email)) return setInviteError("That's your own email — you can always see your page.");
    setInviteError("");
    await onEmails([...emails, value]);
    setInvite("");
  };

  return (
    <div className="space-y-5">
      {/* Visibility */}
      <Card title="Visibility" description="Choose who can see your page. Changes save immediately.">
        <div role="radiogroup" aria-label="Who can see your page" className="grid gap-3 sm:grid-cols-3">
          {VISIBILITY.map((v) => {
            const active = profile.visibility === v.value;
            const tone =
              v.value === "public"
                ? "border-emerald-500/60 bg-emerald-500/10"
                : v.value === "private"
                  ? "border-amber-500/60 bg-amber-500/10"
                  : "border-slate-400/60 bg-white/[0.06]";
            return (
              <button
                key={v.value}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={busy}
                onClick={() => onVisibility(v.value)}
                className={`rounded-xl border p-4 text-left transition ${active ? tone : "border-white/[0.08] hover:border-white/20"}`}
              >
                <span className="flex items-center gap-2">
                  <span className={`grid h-4 w-4 place-items-center rounded-full border-2 ${active ? "border-accent" : "border-slate-500"}`}>
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                  </span>
                  <span className="font-medium text-slate-100">{v.label}</span>
                </span>
                <span className="mt-2 block text-xs leading-relaxed text-slate-400">{v.hint}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Link */}
      <Card title="Your link">
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-ink-950/60 p-2 pl-3">
          <span className="min-w-0 flex-1 truncate font-mono text-sm text-slate-200">{shareUrl}</span>
          <button type="button" onClick={onCopy} className="btn-ghost px-3 py-1.5 text-xs">
            {copied ? "Copied!" : "Copy"}
          </button>
          <button type="button" onClick={onRename} className="btn px-3 py-1.5 text-xs text-accent hover:underline">
            Change
          </button>
        </div>
        {profile.visibility === "draft" && (
          <p className="mt-3 text-xs text-slate-500">Your page is a draft, so this link shows “not found” to everyone else.</p>
        )}
      </Card>

      {/* Authorized viewers */}
      <Card
        title="Authorized viewers"
        description="People who can see your page when it's Private — for example recruiters or hiring managers."
      >
        <form onSubmit={addInvite} className="flex gap-2">
          <input
            type="email"
            className="input"
            placeholder="recruiter@company.com"
            value={invite}
            onChange={(e) => setInvite(e.target.value)}
            aria-label="Email to invite"
          />
          <button type="submit" disabled={busy || !invite} className="btn-primary shrink-0 px-5">
            Add
          </button>
        </form>
        {inviteError && <p className="mt-2 text-xs text-rose-400">{inviteError}</p>}

        {emails.length > 0 ? (
          <ul className="mt-4 divide-y divide-white/[0.06] rounded-xl border border-white/[0.08]">
            {emails.map((e) => (
              <li key={e} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent/15 text-xs font-semibold uppercase text-accent">
                    {e[0]}
                  </span>
                  <span className="truncate text-sm text-slate-200">{e}</span>
                </span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onEmails(emails.filter((x) => x !== e))}
                  aria-label={`Remove ${e}`}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-slate-500">No one added yet.</p>
        )}

        <div className="mt-4 rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 text-xs leading-relaxed text-sky-200/80">
          <strong className="text-sky-100">How they get in:</strong> share your link. They sign in with an account using
          this exact email — Google, or a free email/password account they create here (they&apos;ll verify the email
          once). Remove someone and their access ends immediately.
        </div>
        {profile.visibility !== "private" && emails.length > 0 && (
          <p className="mt-3 text-xs text-amber-200/80">These people only matter while your page is Private.</p>
        )}
      </Card>

      {/* Password */}
      <Card title="Page password" description="Optional, for Private pages: anyone with the link and this password can view without an account.">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              hasPassword ? "bg-emerald-500/15 text-emerald-300" : "bg-white/[0.06] text-slate-400"
            }`}
          >
            {hasPassword ? "Password on" : "No password"}
          </span>
          <button type="button" disabled={busy} onClick={onSetPassword} className="btn-ghost px-4 py-2 text-xs">
            {hasPassword ? "Change password" : "Set password"}
          </button>
          {hasPassword && (
            <button type="button" disabled={busy} onClick={onRemovePassword} className="btn px-3 py-2 text-xs text-rose-300 hover:text-rose-200">
              Remove
            </button>
          )}
        </div>
      </Card>

      {/* Appearance */}
      <Card title="Appearance" description="How your page looks to visitors. Press Save to apply.">
        <p className="label">Theme presets</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {THEME_PRESETS.map((t) => {
            const active =
              profile.accent.toLowerCase() === t.accent && profile.backgroundStyle === t.background && profile.theme === t.theme;
            return (
              <button
                key={t.name}
                type="button"
                onClick={() => onChange({ accent: t.accent, backgroundStyle: t.background, theme: t.theme })}
                className={`overflow-hidden rounded-xl border text-left transition ${
                  active ? "border-accent ring-2 ring-accent/30" : "border-white/[0.08] hover:border-white/25"
                }`}
              >
                <span
                  className="relative block h-14"
                  style={{
                    background:
                      t.theme === "dark"
                        ? `radial-gradient(circle at 20% 20%, ${t.accent}66, transparent 60%), #0b1120`
                        : `radial-gradient(circle at 20% 20%, ${t.accent}55, transparent 60%), #f8fafc`,
                  }}
                >
                  <span className="absolute bottom-2 left-2 h-3 w-10 rounded-full" style={{ background: t.accent }} />
                </span>
                <span className="flex items-center justify-between px-3 py-2 text-sm">
                  <span className="text-slate-200">{t.name}</span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500">{t.theme}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="label">Default mode</p>
            <div className="inline-flex rounded-full border border-white/10 p-1">
              {(["light", "dark"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onChange({ theme: t })}
                  className={`rounded-full px-4 py-1.5 text-sm capitalize transition ${
                    profile.theme === t ? "bg-accent text-ink-950" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">Visitors can still switch with the sun/moon button.</p>
          </div>

          <div>
            <p className="label">Accent colour</p>
            <div className="flex flex-wrap items-center gap-2.5">
              {ACCENT_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Accent ${c}`}
                  onClick={() => onChange({ accent: c })}
                  className={`h-8 w-8 rounded-full ring-offset-2 ring-offset-ink-900 transition ${
                    profile.accent.toLowerCase() === c ? "ring-2 ring-white" : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                aria-label="Custom accent colour"
                value={profile.accent}
                onChange={(e) => onChange({ accent: e.target.value })}
                className="h-8 w-10 cursor-pointer rounded border border-white/10 bg-transparent"
              />
            </div>
          </div>
        </div>

        <p className="label mt-6">Background</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {BACKGROUND_STYLES.map((b) => {
            const active = !profile.backgroundUrl && profile.backgroundStyle === b.value;
            return (
              <button
                key={b.value}
                type="button"
                onClick={() => onChange({ backgroundStyle: b.value, backgroundUrl: "" })}
                className={`rounded-xl border p-2 text-left transition ${
                  active ? "border-accent ring-2 ring-accent/30" : "border-white/[0.08] hover:border-white/25"
                }`}
              >
                <BackgroundSwatch style={b.value} accent={profile.accent} />
                <span className="mt-2 block px-1 text-sm text-slate-200">{b.label}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-4">
          <label htmlFor="bg-url" className="label">
            Or use your own image
          </label>
          <input
            id="bg-url"
            className="input"
            placeholder="https://… (shown faded behind your page)"
            value={profile.backgroundUrl}
            onChange={(e) => onChange({ backgroundUrl: e.target.value.trim() })}
          />
        </div>
      </Card>

      {/* Export */}
      <Card title="Export" description="Download your page as visitors see it.">
        <div className="grid gap-3 sm:grid-cols-3">
          {EXPORT_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => run(o.id)}
              className="rounded-xl border border-white/[0.08] p-4 text-left transition hover:border-accent/50 hover:bg-accent/5"
            >
              <span className="block text-sm font-medium text-slate-100">{o.label}</span>
              <span className="mt-1 block text-xs text-slate-500">{o.hint}</span>
            </button>
          ))}
        </div>
        {portal}
      </Card>

      {/* Account */}
      <Card title="Account">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-400">
            Signed in as <span className="text-slate-200">{email}</span>
          </p>
          <button type="button" onClick={onSignOut} className="btn-ghost px-4 py-2 text-xs">
            Sign out
          </button>
        </div>
      </Card>
    </div>
  );
}
