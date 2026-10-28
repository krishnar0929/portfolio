import Link from "next/link";
import {
  ArrowUpRightIcon,
  BriefcaseIcon,
  CalendarIcon,
  CapIcon,
  ChatIcon,
  ClockIcon,
  CodeIcon,
  DownloadIcon,
  GithubIcon,
  GlobeIcon,
  LinkedinIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
  QuoteIcon,
  StarIcon,
  TelegramIcon,
  UserIcon,
  XIcon,
} from "@/components/Icons";
import { hexToRgbTriplet } from "@/lib/color";
import type { Profile } from "@/lib/types";
import { Navbar, type NavLink } from "./Navbar";
import { ProjectGrid } from "./ProjectGrid";
import { Reveal } from "./Reveal";
import { ThemeShell } from "./ThemeShell";

type Icon = (props: { className?: string }) => JSX.Element;

// Full class strings so Tailwind keeps them
const PALETTE = [
  { dot: "bg-sky-500", chip: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300" },
  { dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" },
  { dot: "bg-teal-500", chip: "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300" },
  { dot: "bg-amber-500", chip: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300" },
  { dot: "bg-rose-500", chip: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300" },
  { dot: "bg-orange-500", chip: "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300" },
  { dot: "bg-violet-500", chip: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300" },
  { dot: "bg-indigo-500", chip: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300" },
];

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

/** "https://github.com/alex" -> "@alex"; leaves handles and plain text alone. */
function handleFromUrl(value: string) {
  const v = value.trim();
  if (!/^https?:\/\//i.test(v)) return v;
  try {
    const parts = new URL(v).pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    return last ? `@${last}` : new URL(v).hostname.replace(/^www\./, "");
  } catch {
    return v;
  }
}

type ContactRow = { label: string; value: string; href?: string; Icon: Icon };

function contactRows(p: Profile): ContactRow[] {
  const s = p.socials;
  const rows: (ContactRow | null)[] = [
    s.telegram
      ? {
          label: "Telegram",
          value: handleFromUrl(s.telegram).startsWith("@") ? handleFromUrl(s.telegram) : `@${s.telegram}`,
          href: /^https?:/i.test(s.telegram) ? s.telegram : `https://t.me/${s.telegram.replace(/^@/, "")}`,
          Icon: TelegramIcon,
        }
      : null,
    s.discord
      ? {
          label: "Discord",
          value: handleFromUrl(s.discord),
          href: /^https?:/i.test(s.discord) ? s.discord : undefined,
          Icon: ChatIcon,
        }
      : null,
    s.github ? { label: "GitHub", value: handleFromUrl(s.github), href: s.github, Icon: GithubIcon } : null,
    s.linkedin ? { label: "LinkedIn", value: handleFromUrl(s.linkedin), href: s.linkedin, Icon: LinkedinIcon } : null,
    s.twitter ? { label: "X / Twitter", value: handleFromUrl(s.twitter), href: s.twitter, Icon: XIcon } : null,
    s.website ? { label: "Website", value: handleFromUrl(s.website), href: s.website, Icon: GlobeIcon } : null,
    s.phone ? { label: "Phone", value: s.phone, href: `tel:${s.phone.replace(/[^\d+]/g, "")}`, Icon: PhoneIcon } : null,
    p.email ? { label: "Email", value: p.email, href: `mailto:${p.email}`, Icon: MailIcon } : null,
  ];
  return rows.filter(Boolean) as ContactRow[];
}

/**
 * The public one-page portfolio. Rendered on the server for /[username] and
 * on the client for the live preview in the dashboard.
 */
export function Portfolio({ profile: p }: { profile: Profile }) {
  const displayName = p.name || "Your Name";
  const hasSkills = p.skills.some((g) => g.items.length > 0);

  const links: NavLink[] = [
    { id: "about", label: "About" },
    ...(hasSkills ? [{ id: "skills", label: "Skills" }] : []),
    ...(p.experience.length || p.education.length ? [{ id: "experience", label: "Experience" }] : []),
    ...(p.projects.length ? [{ id: "portfolio", label: "Portfolio" }] : []),
    ...(p.reviews.length ? [{ id: "reviews", label: "Reviews" }] : []),
    { id: "contact", label: "Contact" },
    ...(p.meetingUrl ? [{ id: "meeting", label: "Meeting" }] : []),
  ];

  const style = { "--accent": hexToRgbTriplet(p.accent) } as React.CSSProperties;
  const bg = p.backgroundUrl ? ({ backgroundImage: `url("${p.backgroundUrl}")` } as React.CSSProperties) : undefined;

  return (
    <ThemeShell
      defaultTheme={p.theme}
      storageKey={`theme:${p.username || "preview"}`}
      style={style}
      className="relative"
    >
      <div id="top" style={bg} className={bg ? "bg-cover bg-fixed bg-center" : ""}>
        <div
          className={`min-h-screen text-slate-700 dark:text-slate-300 ${
            bg ? "bg-slate-50/85 dark:bg-ink-950/90" : "bg-slate-50 dark:bg-ink-950"
          }`}
        >
          {!bg && (
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,rgb(var(--accent)/0.12),transparent_65%)]" />
          )}
          <Navbar initials={initialsOf(displayName) || "•"} links={links} />

          <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-12 lg:py-12">
            <aside className="min-w-0 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto lg:rounded-2xl lg:[scrollbar-width:thin]">
              <ProfileCard p={p} displayName={displayName} />
            </aside>

            <main className="min-w-0 space-y-20">
              <About p={p} displayName={displayName} />
              {hasSkills && <Skills p={p} />}
              {(p.experience.length > 0 || p.education.length > 0) && <ExperienceSection p={p} />}
              {p.projects.length > 0 && (
                <section id="portfolio" className="scroll-mt-24">
                  <SectionTitle>Portfolio</SectionTitle>
                  <ProjectGrid projects={p.projects} />
                </section>
              )}
              {p.reviews.length > 0 && <Reviews p={p} />}
              <Contact p={p} />
              {p.meetingUrl && <Meeting p={p} displayName={displayName} />}
            </main>
          </div>

          <footer className="border-t border-slate-200/70 py-8 text-center text-xs text-slate-500 dark:border-white/[0.06]">
            © {new Date().getFullYear()} {displayName} ·{" "}
            <Link href="/" className="hover:text-accent">
              Made with Portfolio
            </Link>
          </footer>
        </div>
      </div>
    </ThemeShell>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Reveal className="mb-8">
      <h2 className="ptitle">{children}</h2>
      <div className="ptitle-bar" />
    </Reveal>
  );
}

/* ---------- Left column ---------- */

function ProfileCard({ p, displayName }: { p: Profile; displayName: string }) {
  const projects = p.projectsCount ?? (p.projects.length || null);
  const stats = [
    p.yearsExperience ? { Icon: BriefcaseIcon, value: `${p.yearsExperience}+`, label: "Years" } : null,
    projects ? { Icon: CodeIcon, value: `${projects}+`, label: "Projects" } : null,
    p.clientsCount ? { Icon: StarIcon as Icon, value: `${p.clientsCount}+`, label: "Clients" } : null,
  ].filter(Boolean) as { Icon: Icon; value: string; label: string }[];
  const rows = contactRows(p);
  const firstName = displayName.split(/\s+/)[0];

  return (
    <div className="pcard overflow-hidden">
      {/* Cover */}
      <div className="relative h-32 overflow-hidden bg-gradient-to-br from-accent via-accent/80 to-teal-300">
        <span className="absolute -left-6 top-6 h-20 w-20 rounded-full bg-white/20" />
        <span className="absolute left-10 -top-6 h-14 w-14 rounded-full bg-white/15" />
        <span className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15" />
      </div>

      <div className="-mt-16 flex flex-col items-center px-6 pb-6 text-center">
        {/* Avatar */}
        <div className="relative">
          <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-lg ring-2 ring-accent/40 dark:border-ink-900 dark:bg-ink-800">
            {p.avatarUrl ? (
              <img src={p.avatarUrl} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center bg-gradient-to-br from-accent/20 to-teal-200/40 font-display text-4xl font-bold text-accent">
                {initialsOf(displayName) || "?"}
              </div>
            )}
          </div>
          {p.available && (
            <span
              className="absolute bottom-2 right-2 h-5 w-5 rounded-full border-[3px] border-white bg-emerald-500 dark:border-ink-900"
              title="Available"
            />
          )}
        </div>

        <h1 className="mt-4 font-display text-2xl font-bold text-slate-900 dark:text-white">{displayName}</h1>
        {p.title && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{p.title}</p>}
        {p.available && (
          <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
            ✦ Available for work
          </span>
        )}

        {p.specialties.length > 0 && <Specialties items={p.specialties} />}

        {stats.length > 0 && (
          <div className={`mt-5 grid w-full gap-2.5 ${stats.length === 3 ? "grid-cols-3" : stats.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
            {stats.map(({ Icon, value, label }) => (
              <div
                key={label}
                className="rounded-xl border border-slate-200/80 bg-slate-50/70 px-2 py-3 dark:border-white/[0.07] dark:bg-white/[0.03]"
              >
                <Icon className="mx-auto h-4 w-4 text-accent" />
                <p className="mt-1 font-display text-xl font-bold text-slate-900 dark:text-white">{value}</p>
                <p className="text-[11px] text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        )}

        {rows.length > 0 && (
          <ul className="mt-5 w-full space-y-1 border-t border-slate-200/80 pt-4 text-left dark:border-white/[0.07]">
            {rows.map(({ label, value, href, Icon }) => {
              const body = (
                <>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-accent/10 group-hover:text-accent dark:bg-white/5 dark:text-slate-300">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      {label}
                    </span>
                    <span className="block truncate text-[15px] font-medium text-slate-800 dark:text-slate-200">
                      {value}
                    </span>
                  </span>
                </>
              );
              return (
                <li key={label}>
                  {href ? (
                    <a
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                    >
                      {body}
                    </a>
                  ) : (
                    <div className="group flex items-center gap-3 px-2 py-1.5">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-5 w-full space-y-3">
          <a
            href="#contact"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-teal-400 py-3 font-semibold text-white shadow-[0_10px_25px_-10px_rgb(var(--accent)/0.8)] transition hover:brightness-105"
          >
            <MailIcon className="h-5 w-5" /> Contact Me
          </a>
          {p.meetingUrl ? (
            <a
              href={p.meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-accent/70 py-2.5 font-semibold text-accent transition hover:bg-accent/5"
            >
              <CalendarIcon className="h-5 w-5" /> Meet {firstName}
            </a>
          ) : p.resumeUrl ? (
            <a
              href={p.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-accent/70 py-2.5 font-semibold text-accent transition hover:bg-accent/5"
            >
              <DownloadIcon className="h-5 w-5" /> Download Resume
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Specialties({ items }: { items: string[] }) {
  if (items.length === 1) {
    return <p className="mt-3 text-sm font-medium text-accent">{items[0]}</p>;
  }
  const row = (hidden?: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((s, i) => (
        <li key={`${s}-${i}`} className="flex items-center whitespace-nowrap text-sm font-medium text-accent">
          <span className="px-3">{s}</span>
          <span className="text-slate-300 dark:text-slate-600">·</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="relative mt-3 w-full overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
      <div className="flex w-max animate-marquee">
        {row()}
        {row(true)}
      </div>
    </div>
  );
}

/* ---------- Right column ---------- */

function About({ p, displayName }: { p: Profile; displayName: string }) {
  const paragraphs = (p.about || "Tell visitors a little about yourself.").split(/\n{2,}/);
  const degree = p.degree || p.education[0]?.degree || "";
  const facts = [
    { Icon: UserIcon, label: "Name", value: displayName, accent: true },
    degree ? { Icon: CapIcon, label: "Degree", value: degree } : null,
    p.yearsExperience ? { Icon: ClockIcon, label: "Experience", value: `${p.yearsExperience}+ Years` } : null,
    p.email ? { Icon: MailIcon, label: "Email", value: p.email, href: `mailto:${p.email}` } : null,
    p.location ? { Icon: PinIcon, label: "Address", value: p.location } : null,
    p.socials.phone ? { Icon: PhoneIcon, label: "Phone", value: p.socials.phone } : null,
  ].filter(Boolean) as { Icon: Icon; label: string; value: string; accent?: boolean; href?: string }[];

  return (
    <section id="about" className="scroll-mt-24">
      <SectionTitle>About Me</SectionTitle>
      <Reveal>
        <div className="space-y-4 text-[17px] leading-relaxed text-slate-600 dark:text-slate-300">
          {paragraphs.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </Reveal>
      {facts.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {facts.map(({ Icon, label, value, accent, href }, i) => (
            <Reveal key={label} delay={(i % 2) * 70}>
              <div className="pcard flex items-center gap-4 p-4">
                <span className="picon">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">{label}</p>
                  {href ? (
                    <a href={href} className="block truncate font-medium text-slate-900 hover:text-accent dark:text-white">
                      {value}
                    </a>
                  ) : (
                    <p className={`truncate font-medium ${accent ? "text-accent" : "text-slate-900 dark:text-white"}`}>
                      {value}
                    </p>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}
      {p.resumeUrl && p.meetingUrl && (
        <Reveal className="mt-6">
          <a
            href={p.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
          >
            <DownloadIcon className="h-4 w-4" /> Download resume
          </a>
        </Reveal>
      )}
    </section>
  );
}

function Skills({ p }: { p: Profile }) {
  const groups = p.skills.filter((g) => g.items.length > 0);
  return (
    <section id="skills" className="scroll-mt-24">
      <SectionTitle>Skills</SectionTitle>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {groups.map((g, i) => {
          const c = PALETTE[i % PALETTE.length];
          return (
            <Reveal key={`${g.name}-${i}`} delay={(i % 3) * 70}>
              <div className="pcard h-full p-5">
                <h3 className="flex items-center gap-2.5 font-display text-[17px] font-semibold text-slate-900 dark:text-white">
                  <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
                  {g.name || "Skills"}
                </h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {g.items.map((s) => (
                    <li key={s} className={`rounded-lg px-2.5 py-1 text-sm font-medium ${c.chip}`}>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function ExperienceSection({ p }: { p: Profile }) {
  return (
    <section id="experience" className="scroll-mt-24">
      <SectionTitle>Experience</SectionTitle>
      {p.experience.length > 0 && (
        <ol className="relative ml-3 border-l-2 border-slate-200 dark:border-white/10">
          {p.experience.map((e, i) => (
            <li key={`${e.company}-${i}`} className="relative pb-8 pl-8 last:pb-0">
              <span className="absolute -left-[9px] top-6 h-4 w-4 rounded-full border-[3px] border-white bg-accent shadow dark:border-ink-950" />
              <Reveal>
                <div className="pcard p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">{e.role}</h3>
                      <p className="font-medium text-accent">
                        {e.company}
                        {e.location ? <span className="font-normal text-slate-500"> · {e.location}</span> : null}
                      </p>
                    </div>
                    {(e.start || e.end) && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-white/5 dark:text-slate-300">
                        {e.start}
                        {e.end ? ` — ${e.end}` : ""}
                      </span>
                    )}
                  </div>
                  {e.summary && <p className="mt-3 text-slate-600 dark:text-slate-300">{e.summary}</p>}
                  {e.highlights.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {e.highlights.map((h, j) => (
                        <li key={j} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      )}

      {p.education.length > 0 && (
        <div className={p.experience.length ? "mt-10" : ""}>
          <h3 className="mb-4 font-display text-xl font-semibold text-slate-900 dark:text-white">Education</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {p.education.map((e, i) => (
              <Reveal key={`${e.school}-${i}`} delay={(i % 2) * 70}>
                <div className="pcard flex items-start gap-4 p-5">
                  <span className="picon">
                    <CapIcon className="h-[18px] w-[18px]" />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{e.degree}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{e.school}</p>
                    {(e.start || e.end) && (
                      <p className="mt-1 text-xs text-slate-500">
                        {e.start}
                        {e.end ? ` — ${e.end}` : ""}
                      </p>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function Reviews({ p }: { p: Profile }) {
  return (
    <section id="reviews" className="scroll-mt-24">
      <SectionTitle>Reviews</SectionTitle>
      <div className="grid gap-5 md:grid-cols-2">
        {p.reviews.map((r, i) => (
          <Reveal key={`${r.name}-${i}`} delay={(i % 2) * 80}>
            <figure className="pcard relative flex h-full flex-col p-6">
              <QuoteIcon className="absolute right-5 top-5 h-8 w-8 text-accent/15" />
              <div className="flex gap-0.5 text-amber-400" aria-label={`${r.rating} out of 5`}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <StarIcon key={n} filled={n <= r.rating} className={`h-4 w-4 ${n <= r.rating ? "" : "text-slate-300 dark:text-slate-600"}`} />
                ))}
              </div>
              <blockquote className="mt-3 flex-1 leading-relaxed text-slate-600 dark:text-slate-300">“{r.text}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-accent/10 text-sm font-bold text-accent">
                  {initialsOf(r.name) || "?"}
                </span>
                <span>
                  <span className="block font-semibold text-slate-900 dark:text-white">{r.name}</span>
                  {r.role && <span className="block text-xs text-slate-500">{r.role}</span>}
                </span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Contact({ p }: { p: Profile }) {
  const rows = contactRows(p).filter((r) => r.href);
  return (
    <section id="contact" className="scroll-mt-24">
      <SectionTitle>Contact</SectionTitle>
      <Reveal>
        <div className="pcard relative overflow-hidden p-6 sm:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/10 blur-2xl" />
          <h3 className="relative font-display text-2xl font-bold text-slate-900 dark:text-white">
            Let&apos;s work together
          </h3>
          <p className="relative mt-2 max-w-xl text-slate-600 dark:text-slate-400">
            Have a project, a role or just a question? Reach out on any of these — I usually reply within a day.
          </p>
          {rows.length > 0 ? (
            <div className="relative mt-6 grid gap-3 sm:grid-cols-2">
              {rows.map(({ label, value, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href!.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/60 p-3 transition hover:border-accent/50 dark:border-white/[0.07] dark:bg-white/[0.02]"
                >
                  <span className="picon">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs text-slate-500">{label}</span>
                    <span className="block truncate font-medium text-slate-900 group-hover:text-accent dark:text-white">
                      {value}
                    </span>
                  </span>
                </a>
              ))}
            </div>
          ) : (
            <p className="relative mt-6 text-sm text-slate-500">Add an email or social link in the editor.</p>
          )}
        </div>
      </Reveal>
    </section>
  );
}

function Meeting({ p, displayName }: { p: Profile; displayName: string }) {
  return (
    <section id="meeting" className="scroll-mt-24">
      <SectionTitle>Meeting</SectionTitle>
      <Reveal>
        <div className="pcard flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-accent to-teal-400 text-white">
            <CalendarIcon className="h-7 w-7" />
          </span>
          <div className="flex-1">
            <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
              Book a call with {displayName.split(/\s+/)[0]}
            </h3>
            <p className="mt-1 text-slate-600 dark:text-slate-400">Pick a time that works for you — it goes straight onto my calendar.</p>
          </div>
          <a
            href={p.meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold text-white shadow-sm transition hover:brightness-110"
          >
            Schedule <ArrowUpRightIcon className="h-4 w-4" />
          </a>
        </div>
      </Reveal>
    </section>
  );
}
