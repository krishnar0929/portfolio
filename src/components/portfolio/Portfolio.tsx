import Link from "next/link";
import {
  DownloadIcon,
  GithubIcon,
  GlobeIcon,
  LinkedinIcon,
  MailIcon,
  PinIcon,
  XIcon,
} from "@/components/Icons";
import { hexToRgbTriplet } from "@/lib/color";
import type { Profile } from "@/lib/types";
import { Navbar, type NavLink } from "./Navbar";
import { ProjectGrid } from "./ProjectGrid";
import { Reveal } from "./Reveal";

/**
 * The public one-page portfolio. Rendered on the server for /[username] and
 * on the client for the live preview in the dashboard.
 */
export function Portfolio({ profile: p }: { profile: Profile }) {
  const hasSkills = p.skills.some((g) => g.items.length > 0);
  const links: NavLink[] = [
    { id: "about", label: "About" },
    ...(hasSkills ? [{ id: "skills", label: "Skills" }] : []),
    ...(p.experience.length ? [{ id: "experience", label: "Experience" }] : []),
    ...(p.projects.length ? [{ id: "portfolio", label: "Portfolio" }] : []),
    { id: "contact", label: "Contact" },
  ];

  const style = { "--accent": hexToRgbTriplet(p.accent) } as React.CSSProperties;
  const displayName = p.name || "Your Name";

  return (
    <div style={style} className="relative min-h-screen overflow-x-clip bg-ink-950 text-slate-200">
      <Navbar name={displayName} links={links} />
      <main>
        <Hero p={p} displayName={displayName} />
        <About p={p} />
        {hasSkills && <Skills p={p} />}
        {p.experience.length > 0 && <ExperienceSection p={p} />}
        {p.projects.length > 0 && (
          <section id="portfolio" className="section">
            <SectionHeader eyebrow="Selected work" title="Portfolio" />
            <ProjectGrid projects={p.projects} />
          </section>
        )}
        {p.education.length > 0 && <EducationSection p={p} />}
        <Contact p={p} />
      </main>
      <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {displayName} ·{" "}
        <Link href="/" className="hover:text-accent">
          Made with Portfolio
        </Link>
      </footer>
    </div>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <Reveal className="mb-12">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="heading mt-3">{title}</h2>
    </Reveal>
  );
}

function Socials({ p, size = "h-5 w-5" }: { p: Profile; size?: string }) {
  const items = [
    { href: p.socials.github, label: "GitHub", Icon: GithubIcon },
    { href: p.socials.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
    { href: p.socials.twitter, label: "X / Twitter", Icon: XIcon },
    { href: p.socials.website, label: "Website", Icon: GlobeIcon },
  ].filter((i) => i.href);
  if (!items.length) return null;
  return (
    <ul className="flex items-center gap-2">
      {items.map(({ href, label, Icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-slate-400 transition hover:border-accent/50 hover:text-accent"
          >
            <Icon className={size} />
          </a>
        </li>
      ))}
    </ul>
  );
}

function Avatar({ p, displayName }: { p: Profile; displayName: string }) {
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <div className="relative mx-auto w-56 sm:w-72">
      <div className="absolute -inset-6 rounded-full bg-accent/20 blur-3xl" />
      <div className="relative aspect-square animate-float rounded-[2rem] bg-gradient-to-br from-accent/60 via-accent/10 to-transparent p-[2px]">
        <div className="h-full w-full overflow-hidden rounded-[calc(2rem-2px)] bg-ink-900">
          {p.avatarUrl ? (
            <img src={p.avatarUrl} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center font-display text-6xl font-semibold text-accent/80">
              {initials || "?"}
            </div>
          )}
        </div>
      </div>
      {p.yearsExperience !== null && p.yearsExperience > 0 && (
        <div className="card absolute -bottom-4 -left-4 px-4 py-3 shadow-xl">
          <p className="font-display text-2xl font-semibold text-white">{p.yearsExperience}+</p>
          <p className="text-[11px] uppercase tracking-wider text-slate-400">Years exp.</p>
        </div>
      )}
    </div>
  );
}

function Hero({ p, displayName }: { p: Profile; displayName: string }) {
  return (
    <section id="home" className="relative">
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[780px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pb-24 pt-14 sm:px-6 md:grid-cols-[1.25fr_1fr] md:pb-32 md:pt-24">
        <div>
          <Reveal>
            <p className="font-mono text-sm text-accent">Hi, I&apos;m</p>
            <h1 className="mt-3 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              {displayName}
            </h1>
          </Reveal>
          {p.title && (
            <Reveal delay={100}>
              <p className="mt-4 bg-gradient-to-r from-accent to-white bg-clip-text font-display text-2xl font-medium text-transparent sm:text-3xl">
                {p.title}
              </p>
            </Reveal>
          )}
          {p.tagline && (
            <Reveal delay={180}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">{p.tagline}</p>
            </Reveal>
          )}
          {p.location && (
            <Reveal delay={220}>
              <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-slate-500">
                <PinIcon className="h-4 w-4" /> {p.location}
              </p>
            </Reveal>
          )}
          <Reveal delay={260}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              {p.projects.length > 0 && (
                <a href="#portfolio" className="btn-primary">
                  View my work
                </a>
              )}
              {p.resumeUrl && (
                <a href={p.resumeUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                  <DownloadIcon className="h-4 w-4" /> Resume
                </a>
              )}
              <a href="#contact" className="btn-ghost">
                Contact
              </a>
            </div>
          </Reveal>
          <Reveal delay={320} className="mt-8">
            <Socials p={p} />
          </Reveal>
        </div>
        <Reveal delay={150}>
          <Avatar p={p} displayName={displayName} />
        </Reveal>
      </div>
    </section>
  );
}

function About({ p }: { p: Profile }) {
  const paragraphs = (p.about || "Tell visitors a little about yourself.").split(/\n{2,}/);
  const stats = [
    p.yearsExperience ? { k: `${p.yearsExperience}+`, v: "Years experience" } : null,
    p.projects.length ? { k: String(p.projects.length), v: "Projects" } : null,
    p.experience.length ? { k: String(new Set(p.experience.map((e) => e.company)).size), v: "Companies" } : null,
  ].filter(Boolean) as { k: string; v: string }[];

  return (
    <section id="about" className="section">
      <SectionHeader eyebrow="Get to know me" title="About" />
      <div className="grid gap-10 md:grid-cols-[1.6fr_1fr]">
        <Reveal>
          <div className="space-y-5 text-[17px] leading-relaxed text-slate-300">
            {paragraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </Reveal>
        {stats.length > 0 && (
          <Reveal delay={120}>
            <dl className="grid grid-cols-2 gap-4 md:grid-cols-1">
              {stats.map((s) => (
                <div key={s.v} className="card p-5">
                  <dt className="text-xs uppercase tracking-wider text-slate-500">{s.v}</dt>
                  <dd className="mt-1 font-display text-3xl font-semibold text-white">{s.k}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        )}
      </div>
    </section>
  );
}

function Skills({ p }: { p: Profile }) {
  const groups = p.skills.filter((g) => g.items.length > 0);
  return (
    <section id="skills" className="section">
      <SectionHeader eyebrow="What I work with" title="Skills" />
      <div className="grid gap-5 sm:grid-cols-2">
        {groups.map((g, i) => (
          <Reveal key={`${g.name}-${i}`} delay={(i % 2) * 90}>
            <div className="card h-full p-6">
              <h3 className="font-display text-base font-semibold text-white">{g.name || "Skills"}</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {g.items.map((s) => (
                  <li key={s} className="chip transition hover:border-accent/40 hover:text-white">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ExperienceSection({ p }: { p: Profile }) {
  return (
    <section id="experience" className="section">
      <SectionHeader eyebrow="Where I've been" title="Experience" />
      <ol className="relative ml-2 border-l border-white/10">
        {p.experience.map((e, i) => (
          <li key={`${e.company}-${i}`} className="relative pb-12 pl-8 last:pb-0">
            <span className="absolute -left-[7px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-accent bg-ink-950 shadow-[0_0_12px_rgb(var(--accent)/0.8)]" />
            <Reveal>
              <p className="font-mono text-xs text-accent">
                {e.start}
                {e.end ? ` — ${e.end}` : ""}
              </p>
              <h3 className="mt-2 font-display text-xl font-semibold text-white">{e.role}</h3>
              <p className="text-slate-400">
                {e.company}
                {e.location ? <span className="text-slate-500"> · {e.location}</span> : null}
              </p>
              {e.summary && <p className="mt-3 max-w-3xl text-slate-300">{e.summary}</p>}
              {e.highlights.length > 0 && (
                <ul className="mt-3 max-w-3xl space-y-1.5">
                  {e.highlights.map((h, j) => (
                    <li key={j} className="flex gap-3 text-sm text-slate-400">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                      {h}
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}

function EducationSection({ p }: { p: Profile }) {
  return (
    <section id="education" className="section pt-0 md:pt-0">
      <SectionHeader eyebrow="Learning" title="Education" />
      <div className="grid gap-5 sm:grid-cols-2">
        {p.education.map((e, i) => (
          <Reveal key={`${e.school}-${i}`} delay={(i % 2) * 90}>
            <div className="card p-6">
              <p className="font-mono text-xs text-accent">
                {e.start}
                {e.end ? ` — ${e.end}` : ""}
              </p>
              <h3 className="mt-2 font-display text-lg font-semibold text-white">{e.degree}</h3>
              <p className="text-slate-400">{e.school}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Contact({ p }: { p: Profile }) {
  return (
    <section id="contact" className="section">
      <Reveal>
        <div className="card relative overflow-hidden px-6 py-14 text-center sm:px-12 md:py-20">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[520px] -translate-x-1/2 rounded-full bg-accent/20 blur-[100px]" />
          <p className="eyebrow relative">What&apos;s next?</p>
          <h2 className="relative mt-4 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Let&apos;s work together
          </h2>
          <p className="relative mx-auto mt-4 max-w-lg text-slate-400">
            Have a project, a role or just a question? My inbox is always open.
          </p>
          <div className="relative mt-8 flex flex-col items-center gap-6">
            {p.email && (
              <a href={`mailto:${p.email}`} className="btn-primary px-7 py-3 text-base">
                <MailIcon className="h-5 w-5" /> {p.email}
              </a>
            )}
            <Socials p={p} />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
