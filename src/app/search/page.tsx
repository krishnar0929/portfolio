import type { Metadata } from "next";
import Link from "next/link";
import { PinIcon } from "@/components/Icons";
import { SearchBox } from "@/components/SearchBox";
import { hexToRgbTriplet } from "@/lib/color";
import { MAX_RESULTS, searchProfiles } from "@/lib/directory";

export const dynamic = "force-dynamic";

type Props = { searchParams: { q?: string } };

export function generateMetadata({ searchParams }: Props): Metadata {
  const q = (searchParams.q ?? "").trim();
  return {
    title: q ? `Profiles near “${q}” · Portfolio` : "Find profiles · Portfolio",
    robots: { index: false, follow: false },
  };
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

export default async function SearchPage({ searchParams }: Props) {
  const q = (searchParams.q ?? "").trim().slice(0, 60);
  const results = q.length >= 2 ? await searchProfiles(q) : [];

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold text-white">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-ink-950">P</span>
          Portfolio
        </Link>
        <Link href="/login" className="btn-ghost">
          Create your page
        </Link>
      </header>

      <section className="relative">
        <div className="bg-grid pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-3xl px-4 pb-10 pt-12 text-center sm:px-6">
          <p className="eyebrow">Directory</p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-white">Find people</h1>
          <p className="mt-3 text-slate-400">Search public profiles by name, skill, headline, city or ZIP code. Private profiles never appear here.</p>
          <div className="mt-8">
            <SearchBox defaultValue={q} autoFocus={!q} />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        {q.length >= 2 && (
          <p className="mb-6 text-sm text-slate-400">
            {results.length === 0
              ? `No public profiles match “${q}”.`
              : `${results.length}${results.length === MAX_RESULTS ? "+" : ""} profile${results.length === 1 ? "" : "s"} for “${q}”`}
          </p>
        )}

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((r) => (
            <li key={r.username}>
              <Link
                href={`/${r.username}`}
                style={{ "--accent": hexToRgbTriplet(r.accent) } as React.CSSProperties}
                className="card group flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:border-accent/40"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-accent/15 ring-2 ring-accent/30">
                    {r.avatarUrl ? (
                      <img src={r.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="grid h-full w-full place-items-center font-display text-lg font-semibold text-accent">
                        {initials(r.name)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-display text-lg font-semibold text-white group-hover:text-accent">{r.name}</p>
                    {r.title && <p className="truncate text-sm text-slate-400">{r.title}</p>}
                  </div>
                </div>
                {r.location && (
                  <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-slate-400">
                    <PinIcon className="h-4 w-4 text-accent" /> {r.location}
                  </p>
                )}
                {r.skills.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {r.skills.map((s) => (
                      <li key={s} className="chip">
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-auto flex items-center justify-between pt-5 text-sm">
                  {r.available ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-300">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" /> Available
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="font-mono text-xs text-slate-500">/{r.username}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
