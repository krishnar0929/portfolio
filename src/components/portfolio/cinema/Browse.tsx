"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ExportMenu } from "@/components/export/ExportMenu";
import { ArrowUpRightIcon, CalendarIcon, GithubIcon, MenuIcon, CloseIcon, StarIcon } from "@/components/Icons";
import { displayLocation, formatMonth, type Profile, type Project } from "@/lib/types";
import { contactRows, initialsOf } from "../helpers";
import type { Stage } from "./CinemaPortfolio";
import { InfoIcon, Modal, PlayIcon, Poster, Row } from "./ui";

type Go = (s: Stage, anchor?: string) => void;

const dateRange = (start: string, end: string) => [formatMonth(start), formatMonth(end)].filter(Boolean).join(" – ");

/** The streaming-style home page: nav, hero banner, rows of cards. */
export function Browse({ p, name, showExport, go }: { p: Profile; name: string; showExport: boolean; go: Go }) {
  const [project, setProject] = useState<Project | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);

  const skillGroups = p.skills.filter((g) => g.items.length > 0);
  const top = (p.specialties.length ? p.specialties : skillGroups.flatMap((g) => g.items)).slice(0, 10);
  const hasLearning = p.education.length > 0 || p.certifications.length > 0;

  const links = [
    { id: "home", label: "Home" },
    ...(p.projects.length || p.personalProjects.length ? [{ id: "projects", label: "Projects" }] : []),
    ...(skillGroups.length ? [{ id: "skills", label: "Skills" }] : []),
    ...(p.experience.length ? [{ id: "experience", label: "Experience" }] : []),
    { id: "contact", label: "Contact" },
  ];

  return (
    <div className="cinema-fade">
      <Nav p={p} name={name} links={links} showExport={showExport} go={go} />
      <Hero p={p} name={name} onMore={() => setAboutOpen(true)} />

      <div className="relative z-10 -mt-16 space-y-6 sm:-mt-24 sm:space-y-8">
        {p.projects.length > 0 && (
          <Row id="projects" title={`${name.split(/\s+/)[0]}'s Top Picks`}>
            {p.projects.map((pr, i) => (
              <ProjectCard key={i} pr={pr} seed={i} onOpen={() => setProject(pr)} />
            ))}
          </Row>
        )}

        {top.length > 0 && (
          <Row title={`Top ${top.length} Strengths`}>
            {top.map((s, i) => (
              <div key={s + i} className="flex h-40 w-56 shrink-0 snap-start items-end sm:h-44 sm:w-64">
                <span className="cinema-numeral -mr-3 font-display text-[9rem] font-black leading-[0.8] sm:text-[10rem]">{i + 1}</span>
                <div className="relative flex h-full flex-1 items-end overflow-hidden rounded-md bg-[#1f1f1f] p-3 ring-1 ring-white/5">
                  <span className="absolute inset-x-0 top-0 h-1 bg-accent" />
                  <span className="font-display text-base font-bold leading-tight text-white">{s}</span>
                </div>
              </div>
            ))}
          </Row>
        )}

        {p.personalProjects.length > 0 && (
          <Row id={p.projects.length ? undefined : "projects"} title="Originals">
            {p.personalProjects.map((pr, i) => (
              <ProjectCard key={i} pr={pr} seed={i + 3} label="Original" onOpen={() => setProject(pr)} />
            ))}
          </Row>
        )}

        {skillGroups.length > 0 && (
          <Row id="skills" title="My Skill Universe">
            {skillGroups.map((g, i) => (
              <div
                key={g.name + i}
                className="w-64 shrink-0 snap-start rounded-md bg-gradient-to-br from-[#262626] to-[#141414] p-4 ring-1 ring-white/5 transition duration-300 hover:-translate-y-1 hover:ring-accent/60 sm:w-72"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">Season {i + 1}</p>
                <p className="mt-1 font-display text-lg font-bold text-white">{g.name || "Skills"}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {g.items.map((s) => (
                    <span key={s} className="rounded bg-white/[0.07] px-2 py-0.5 text-xs text-slate-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </Row>
        )}

        {p.experience.length > 0 && <Episodes p={p} />}

        {hasLearning && (
          <Row title="Education & Certifications">
            {p.education.map((e, i) => (
              <div key={`e${i}`} className="w-64 shrink-0 snap-start rounded-md bg-[#1f1f1f] p-4 ring-1 ring-white/5 sm:w-72">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">Education</p>
                <p className="mt-1 font-display text-base font-bold text-white">{[e.degree, e.field].filter(Boolean).join(", ") || e.school}</p>
                <p className="mt-1 text-sm text-slate-400">{e.school}</p>
                <p className="mt-2 text-xs text-slate-500">{[dateRange(e.start, e.end), e.grade].filter(Boolean).join(" · ")}</p>
              </div>
            ))}
            {p.certifications.map((c, i) => {
              const body = (
                <>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400">Certified</p>
                  <p className="mt-1 font-display text-base font-bold text-white">{c.name}</p>
                  <p className="mt-1 text-sm text-slate-400">{c.issuer}</p>
                  {c.issued && <p className="mt-2 text-xs text-slate-500">Issued {formatMonth(c.issued)}</p>}
                </>
              );
              const cls = "block w-64 shrink-0 snap-start rounded-md bg-[#1f1f1f] p-4 ring-1 ring-white/5 transition hover:ring-accent/60 sm:w-72";
              return c.url ? (
                <a key={`c${i}`} href={c.url} target="_blank" rel="noreferrer" className={cls}>
                  {body}
                </a>
              ) : (
                <div key={`c${i}`} className={cls}>
                  {body}
                </div>
              );
            })}
          </Row>
        )}

        {p.reviews.length > 0 && (
          <Row title="Critics' Reviews">
            {p.reviews.map((r, i) => (
              <figure key={i} className="w-72 shrink-0 snap-start rounded-md bg-[#1f1f1f] p-5 ring-1 ring-white/5 sm:w-80">
                <div className="flex gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }, (_, k) => (
                    <StarIcon key={k} filled={k < r.rating} className="h-4 w-4" />
                  ))}
                </div>
                <blockquote className="mt-3 line-clamp-5 text-sm leading-relaxed text-slate-200">&ldquo;{r.text}&rdquo;</blockquote>
                <figcaption className="mt-4 text-xs text-slate-400">
                  <span className="font-semibold text-white">{r.name}</span>
                  {r.role && ` · ${r.role}`}
                </figcaption>
              </figure>
            ))}
          </Row>
        )}

        <Contact p={p} />
      </div>

      <footer className="px-4 pb-10 pt-6 text-xs text-slate-600 sm:px-10">
        © {new Date().getFullYear()} {name} ·{" "}
        <Link href="/" className="hover:text-accent">
          Made with Portfolio
        </Link>
      </footer>

      <Modal open={!!project} onClose={() => setProject(null)} label={project?.title || "Project"}>
        {project && <ProjectDetails pr={project} />}
      </Modal>
      <Modal open={aboutOpen} onClose={() => setAboutOpen(false)} label={`About ${name}`}>
        <AboutDetails p={p} name={name} />
      </Modal>
    </div>
  );
}

/* ---------- Nav ---------- */

function Nav({
  p,
  name,
  links,
  showExport,
  go,
}: {
  p: Profile;
  name: string;
  links: { id: string; label: string }[];
  showExport: boolean;
  go: Go;
}) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-40 transition-colors duration-300 ${solid || open ? "bg-[#0b0b0b]/95 backdrop-blur" : "bg-gradient-to-b from-black/80 to-transparent"}`}>
      <nav className="flex h-16 items-center gap-6 px-4 sm:px-10">
        <a href="#home" className="max-w-[45vw] truncate font-display text-xl font-black uppercase tracking-tight text-accent sm:text-2xl">
          {name}
        </a>
        <ul className="hidden items-center gap-5 text-sm md:flex">
          {links.map((l) => (
            <li key={l.id}>
              <a href={`#${l.id}`} className="text-slate-300 transition hover:text-white">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {showExport && <ExportMenu profile={p} variant="dark" />}
          <button
            type="button"
            onClick={() => go("picker")}
            title="Switch profile"
            aria-label="Switch profile"
            className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-md bg-accent text-sm font-bold text-white ring-white/70 transition hover:ring-2"
          >
            {p.avatarUrl ? <img src={p.avatarUrl} alt="" className="h-full w-full object-cover" /> : initialsOf(name) || "?"}
          </button>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center text-white md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>
      {open && (
        <ul className="border-t border-white/10 px-4 pb-3 md:hidden">
          {links.map((l) => (
            <li key={l.id}>
              <a href={`#${l.id}`} onClick={() => setOpen(false)} className="block py-3 text-slate-300 hover:text-white">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}

/* ---------- Hero banner ---------- */

function Hero({ p, name, onMore }: { p: Profile; name: string; onMore: () => void }) {
  const location = displayLocation(p);
  const projects = p.projectsCount ?? (p.projects.length + p.personalProjects.length || null);
  const meta = [
    p.yearsExperience ? `${p.yearsExperience}+ yrs` : "",
    projects ? `${projects}+ projects` : "",
    location,
  ].filter(Boolean);

  return (
    <section id="home" className="relative -mt-16 flex min-h-[88vh] items-end overflow-hidden sm:min-h-[92vh]">
      {/* Backdrop: custom image, else the photo on the right, else accent light */}
      {p.backgroundUrl ? (
        <img src={p.backgroundUrl} alt="" className="cinema-kenburns absolute inset-0 h-full w-full object-cover" />
      ) : p.avatarUrl ? (
        <img
          src={p.avatarUrl}
          alt=""
          className="cinema-kenburns absolute inset-y-0 right-0 h-full w-full object-cover object-top sm:w-[62%] [mask-image:linear-gradient(to_right,transparent,black_35%)]"
        />
      ) : (
        <div className="absolute inset-0">
          <div className="absolute -right-24 top-10 h-[70vh] w-[70vh] rounded-full bg-accent/30 blur-[120px]" />
          <div className="absolute right-[12%] top-1/4 font-display text-[38vw] font-black leading-none text-accent/10 sm:text-[26vw]">
            {initialsOf(name)}
          </div>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0b0b0b] to-transparent" />

      <div className="relative z-10 max-w-2xl px-4 pb-28 pt-28 sm:px-10 sm:pb-40">
        <p className="cinema-rise flex items-center gap-2 text-xs font-bold uppercase tracking-[0.35em] text-slate-300">
          <span className="grid h-6 w-5 place-items-center rounded-sm bg-accent font-display text-sm font-black tracking-normal text-white">
            {initialsOf(name).charAt(0) || "P"}
          </span>
          Portfolio
        </p>
        <h1 className="cinema-rise mt-3 font-display text-5xl font-black uppercase leading-[0.9] tracking-tight text-white drop-shadow-lg [animation-delay:120ms] sm:text-7xl lg:text-8xl">
          {name}
        </h1>
        <div className="cinema-rise mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm [animation-delay:220ms]">
          {p.available && <span className="font-semibold text-emerald-400">Open to work</span>}
          {p.title && <span className="font-medium text-white">{p.title}</span>}
          {meta.map((m) => (
            <span key={m} className="text-slate-400">
              {m}
            </span>
          ))}
        </div>
        {(p.tagline || p.about) && (
          <p className="cinema-rise mt-4 line-clamp-3 max-w-xl text-base leading-relaxed text-slate-200 [animation-delay:320ms] sm:text-lg">
            {p.tagline || p.about}
          </p>
        )}
        <div className="cinema-rise mt-6 flex flex-wrap gap-3 [animation-delay:420ms]">
          <a
            href={p.projects.length || p.personalProjects.length ? "#projects" : "#contact"}
            className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-2.5 font-semibold text-black transition hover:bg-white/80"
          >
            <PlayIcon /> {p.projects.length || p.personalProjects.length ? "View projects" : "Get in touch"}
          </a>
          <button
            type="button"
            onClick={onMore}
            className="inline-flex items-center gap-2 rounded-md bg-white/20 px-6 py-2.5 font-semibold text-white backdrop-blur transition hover:bg-white/30"
          >
            <InfoIcon /> More info
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------- Cards & details ---------- */

function ProjectCard({ pr, seed, label, onOpen }: { pr: Project; seed: number; label?: string; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group/card relative aspect-video w-64 shrink-0 snap-start overflow-hidden rounded-md bg-[#1f1f1f] text-left ring-1 ring-white/5 transition duration-300 hover:z-10 hover:scale-[1.06] hover:ring-white/30 focus-visible:scale-[1.06] sm:w-80"
    >
      <Poster title={pr.title} subtitle={label || pr.category} image={pr.image} seed={seed} />
      <span className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black via-black/70 to-transparent p-3 opacity-0 transition duration-300 group-hover/card:opacity-100 group-focus-visible/card:opacity-100">
        <span className="font-display text-sm font-bold text-white">{pr.title}</span>
        {pr.tags.length > 0 && <span className="mt-1 line-clamp-1 text-[11px] text-emerald-300">{pr.tags.slice(0, 4).join(" • ")}</span>}
        <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-white/80">
          <InfoIcon className="h-3.5 w-3.5" /> Details
        </span>
      </span>
    </button>
  );
}

function ProjectDetails({ pr }: { pr: Project }) {
  return (
    <div>
      <div className="relative aspect-video w-full">
        <Poster title={pr.title} subtitle={pr.category} image={pr.image} />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#181818] to-transparent" />
      </div>
      <div className="space-y-4 px-6 pb-8 sm:px-10">
        <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">{pr.title}</h3>
        {pr.category && <p className="text-sm font-semibold text-accent">{pr.category}</p>}
        {pr.description && <p className="whitespace-pre-line leading-relaxed text-slate-300">{pr.description}</p>}
        {pr.tags.length > 0 && (
          <p className="text-sm">
            <span className="text-slate-500">Built with: </span>
            <span className="text-slate-200">{pr.tags.join(", ")}</span>
          </p>
        )}
        <div className="flex flex-wrap gap-3 pt-2">
          {pr.liveUrl && (
            <a href={pr.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2 font-semibold text-black hover:bg-white/80">
              <PlayIcon className="h-4 w-4" /> Watch it live
            </a>
          )}
          {pr.repoUrl && (
            <a href={pr.repoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md bg-white/15 px-5 py-2 font-semibold text-white hover:bg-white/25">
              <GithubIcon className="h-4 w-4" /> Source
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function AboutDetails({ p, name }: { p: Profile; name: string }) {
  const facts = [
    { k: "Role", v: p.title },
    { k: "Location", v: displayLocation(p) },
    { k: "Experience", v: p.yearsExperience ? `${p.yearsExperience}+ years` : "" },
    { k: "Languages", v: p.additional.languages.join(", ") },
    { k: "Interests", v: p.additional.interests.join(", ") },
    { k: "Work authorization", v: [p.immigration.workAuthorization, p.immigration.authorizedCountry].filter(Boolean).join(" · ") },
  ].filter((f) => f.v);

  return (
    <div className="px-6 pb-8 pt-12 sm:px-10">
      <h3 className="font-display text-3xl font-black uppercase tracking-tight text-white">{name}</h3>
      {p.tagline && <p className="mt-2 text-lg text-slate-200">{p.tagline}</p>}
      <div className="mt-6 grid gap-8 sm:grid-cols-[minmax(0,1fr)_220px]">
        <p className="whitespace-pre-line leading-relaxed text-slate-300">{p.about || "No summary yet."}</p>
        <dl className="space-y-3 text-sm">
          {facts.map((f) => (
            <div key={f.k}>
              <dt className="text-slate-500">{f.k}</dt>
              <dd className="text-slate-200">{f.v}</dd>
            </div>
          ))}
          {p.specialties.length > 0 && (
            <div>
              <dt className="text-slate-500">Genres</dt>
              <dd className="text-slate-200">{p.specialties.join(", ")}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}

/* ---------- Experience as an episode list ---------- */

function Episodes({ p }: { p: Profile }) {
  return (
    <section id="experience" className="scroll-mt-20 px-4 sm:px-10">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-lg font-semibold text-white sm:text-xl">The Full Story</h2>
        <span className="text-sm text-slate-500">{p.experience.length} episode{p.experience.length === 1 ? "" : "s"}</span>
      </div>
      <ol className="mt-3 divide-y divide-white/10 overflow-hidden rounded-md bg-[#141414] ring-1 ring-white/5">
        {p.experience.map((e, i) => (
          <li key={i} className="flex gap-4 p-4 transition hover:bg-white/[0.03] sm:gap-6 sm:p-6">
            <span className="w-6 shrink-0 pt-1 text-center font-display text-2xl font-bold text-slate-500">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="font-display text-base font-bold text-white sm:text-lg">
                  {e.role}
                  {e.company && <span className="font-normal text-slate-400"> · {e.company}</span>}
                </h3>
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {dateRange(e.start, e.end)}
                </span>
              </div>
              {e.location && <p className="mt-0.5 text-xs text-slate-500">{e.location}</p>}
              {e.summary && <p className="mt-2 text-sm leading-relaxed text-slate-300">{e.summary}</p>}
              {e.highlights.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm text-slate-400">
                  {e.highlights.map((h, k) => (
                    <li key={k} className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                      {h}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ---------- Contact: "Coming up next" ---------- */

function Contact({ p }: { p: Profile }) {
  const rows = contactRows(p);
  return (
    <section id="contact" className="scroll-mt-20 px-4 pt-6 sm:px-10">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-accent/30 via-[#141414] to-[#141414] p-6 ring-1 ring-white/10 sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Coming up next</p>
        <h2 className="mt-2 font-display text-3xl font-black text-white sm:text-4xl">Let&apos;s work together</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => {
            const inner = (
              <>
                <r.Icon className="h-5 w-5 shrink-0 text-accent" />
                <span className="min-w-0">
                  <span className="block text-[11px] uppercase tracking-wider text-slate-500">{r.label}</span>
                  <span className="block truncate text-sm text-white">{r.value}</span>
                </span>
              </>
            );
            const cls = "flex items-center gap-3 rounded-md bg-black/40 px-4 py-3 ring-1 ring-white/5 transition hover:ring-accent/60";
            return r.href ? (
              <a key={r.label + r.value} href={r.href} target={r.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className={cls}>
                {inner}
              </a>
            ) : (
              <div key={r.label + r.value} className={cls}>
                {inner}
              </div>
            );
          })}
        </div>
        {p.meetingUrl && (
          <a
            href={p.meetingUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-white px-6 py-2.5 font-semibold text-black transition hover:bg-white/80"
          >
            <CalendarIcon className="h-4 w-4" /> Book a meeting <ArrowUpRightIcon className="h-4 w-4" />
          </a>
        )}
      </div>
    </section>
  );
}
