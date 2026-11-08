"use client";

import { useProfileExport } from "@/components/export/ExportMenu";
import { DownloadIcon, MailIcon, PinIcon } from "@/components/Icons";
import { displayLocation, formatMonth, type Profile } from "@/lib/types";
import { contactRows, initialsOf } from "../helpers";
import type { Stage } from "./CinemaPortfolio";
import { PlayIcon } from "./ui";

const dateRange = (start: string, end: string) => [formatMonth(start), formatMonth(end)].filter(Boolean).join(" – ");

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-white/10 py-6">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-accent">{title}</h2>
      {children}
    </section>
  );
}

/**
 * "Recruiter" profile: everything a recruiter needs in one quick scan —
 * no animations, no rows, a résumé download up top.
 */
export function RecruiterView({ p, name, showExport, go }: { p: Profile; name: string; showExport: boolean; go: (s: Stage) => void }) {
  const { run, portal } = useProfileExport(p);
  const location = displayLocation(p);
  const skills = p.skills.filter((g) => g.items.length > 0);
  const rows = contactRows(p);
  const auth = [p.immigration.workAuthorization, p.immigration.authorizedCountry].filter(Boolean).join(" · ");

  return (
    <div className="cinema-fade min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0b0b]/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center gap-3 px-4">
          <span className="truncate font-display text-lg font-black uppercase tracking-tight text-accent">{name}</span>
          <span className="hidden rounded bg-white/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-300 sm:inline">
            Recruiter view
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={() => go("browse")} className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-slate-300 hover:text-white">
              <PlayIcon className="h-4 w-4" /> <span className="hidden sm:inline">Full experience</span>
            </button>
            <button type="button" onClick={() => go("picker")} className="rounded-md px-3 py-1.5 text-sm text-slate-400 hover:text-white">
              Switch
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pb-16 pt-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md bg-accent">
            {p.avatarUrl ? (
              <img src={p.avatarUrl} alt={name} className="h-full w-full object-cover" />
            ) : (
              <span className="grid h-full w-full place-items-center font-display text-3xl font-black text-white">{initialsOf(name) || "?"}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">{name}</h1>
            {p.title && <p className="mt-1 text-lg text-slate-300">{p.title}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
              {location && (
                <span className="inline-flex items-center gap-1">
                  <PinIcon className="h-4 w-4" /> {location}
                </span>
              )}
              {p.yearsExperience ? <span>{p.yearsExperience}+ years experience</span> : null}
              {p.available && <span className="font-semibold text-emerald-400">Open to work</span>}
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {showExport && (
              <button type="button" onClick={() => run("pdf")} className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/80">
                <DownloadIcon className="h-4 w-4" /> Résumé PDF
              </button>
            )}
            {p.email && (
              <a href={`mailto:${p.email}`} className="inline-flex items-center gap-2 rounded-md bg-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/25">
                <MailIcon className="h-4 w-4" /> Email
              </a>
            )}
          </div>
        </div>

        {(p.about || p.tagline) && (
          <Block title="Summary">
            <p className="whitespace-pre-line leading-relaxed text-slate-300">{p.about || p.tagline}</p>
          </Block>
        )}

        {auth && (
          <Block title="Work authorization">
            <p className="text-slate-200">
              {auth}
              {p.immigration.sponsorship && (
                <span className="text-slate-400"> · Sponsorship {p.immigration.sponsorship === "yes" ? "required" : "not required"}</span>
              )}
              {p.immigration.validUntil && <span className="text-slate-400"> · Valid until {formatMonth(p.immigration.validUntil)}</span>}
            </p>
          </Block>
        )}

        {skills.length > 0 && (
          <Block title="Skills">
            <dl className="space-y-3">
              {skills.map((g, i) => (
                <div key={g.name + i} className="grid gap-1 sm:grid-cols-[160px_1fr]">
                  <dt className="text-sm font-semibold text-white">{g.name}</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {g.items.map((s) => (
                      <span key={s} className="rounded bg-white/[0.07] px-2 py-0.5 text-xs text-slate-200">
                        {s}
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </Block>
        )}

        {p.experience.length > 0 && (
          <Block title="Experience">
            <ol className="space-y-5">
              {p.experience.map((e, i) => (
                <li key={i}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <h3 className="font-semibold text-white">
                      {e.role}
                      {e.company && <span className="font-normal text-slate-400"> · {e.company}</span>}
                    </h3>
                    <span className="text-xs text-slate-500">{[dateRange(e.start, e.end), e.location].filter(Boolean).join(" · ")}</span>
                  </div>
                  {e.summary && <p className="mt-1 text-sm text-slate-300">{e.summary}</p>}
                  {e.highlights.length > 0 && (
                    <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-sm text-slate-400 marker:text-accent">
                      {e.highlights.map((h, k) => (
                        <li key={k}>{h}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          </Block>
        )}

        {(p.education.length > 0 || p.certifications.length > 0) && (
          <Block title="Education & certifications">
            <ul className="space-y-3 text-sm">
              {p.education.map((e, i) => (
                <li key={`e${i}`} className="flex flex-wrap justify-between gap-x-4">
                  <span className="text-white">
                    {[e.degree, e.field].filter(Boolean).join(", ")}
                    {e.school && <span className="text-slate-400"> · {e.school}</span>}
                  </span>
                  <span className="text-xs text-slate-500">{[dateRange(e.start, e.end), e.grade].filter(Boolean).join(" · ")}</span>
                </li>
              ))}
              {p.certifications.map((c, i) => (
                <li key={`c${i}`} className="flex flex-wrap justify-between gap-x-4">
                  <span className="text-white">
                    {c.url ? (
                      <a href={c.url} target="_blank" rel="noreferrer" className="hover:text-accent">
                        {c.name}
                      </a>
                    ) : (
                      c.name
                    )}
                    {c.issuer && <span className="text-slate-400"> · {c.issuer}</span>}
                  </span>
                  {c.issued && <span className="text-xs text-slate-500">{formatMonth(c.issued)}</span>}
                </li>
              ))}
            </ul>
          </Block>
        )}

        {(p.projects.length > 0 || p.personalProjects.length > 0) && (
          <Block title="Selected projects">
            <ul className="grid gap-3 sm:grid-cols-2">
              {[...p.projects, ...p.personalProjects].map((pr, i) => (
                <li key={i} className="rounded-md bg-white/[0.04] p-4 ring-1 ring-white/5">
                  <p className="font-semibold text-white">{pr.title}</p>
                  {pr.description && <p className="mt-1 line-clamp-2 text-sm text-slate-400">{pr.description}</p>}
                  <div className="mt-2 flex gap-3 text-xs">
                    {pr.liveUrl && (
                      <a href={pr.liveUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                        Live
                      </a>
                    )}
                    {pr.repoUrl && (
                      <a href={pr.repoUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                        Code
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Block>
        )}

        {rows.length > 0 && (
          <Block title="Contact">
            <ul className="grid gap-2 text-sm sm:grid-cols-2">
              {rows.map((r) => (
                <li key={r.label + r.value} className="flex items-center gap-2">
                  <r.Icon className="h-4 w-4 shrink-0 text-accent" />
                  <span className="text-slate-500">{r.label}:</span>
                  {r.href ? (
                    <a href={r.href} target={r.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="truncate text-white hover:text-accent">
                      {r.value}
                    </a>
                  ) : (
                    <span className="truncate text-white">{r.value}</span>
                  )}
                </li>
              ))}
            </ul>
          </Block>
        )}
      </main>
      {portal}
    </div>
  );
}
