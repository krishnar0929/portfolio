import { dateRange, joinParts } from "@/lib/export/profileExport";
import { displayLocation, formatMonth, fullName, type Profile, type Project } from "@/lib/types";

const shortUrl = (u: string) => u.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-1.5 mt-4 border-b border-slate-400 pb-0.5 text-[10.5pt] font-bold uppercase tracking-[0.12em] text-slate-900">
      {children}
    </h2>
  );
}

function Projects({ title, list }: { title: string; list: Project[] }) {
  if (!list.length) return null;
  return (
    <section className="break-inside-avoid-page">
      <Heading>{title}</Heading>
      {list.map((x, i) => (
        <div key={i} className="mb-1.5 break-inside-avoid">
          <p className="text-[10pt]">
            <span className="font-bold">{x.title}</span>
            {x.tags.length > 0 && <span className="text-slate-600"> · {x.tags.join(", ")}</span>}
            {(x.liveUrl || x.repoUrl) && <span className="text-slate-600"> · {shortUrl(x.liveUrl || x.repoUrl)}</span>}
          </p>
          {x.description && <p className="text-[10pt] leading-snug">{x.description}</p>}
        </div>
      ))}
    </section>
  );
}

/**
 * Plain, ATS-friendly résumé used for "Download PDF" (printed via the
 * browser's Save as PDF). Only shows what the visitor is allowed to see.
 */
export function ResumeDocument({ p }: { p: Profile }) {
  const name = fullName(p) || p.username;
  const contact = [
    p.email,
    p.phone,
    displayLocation(p),
    p.socials.linkedin && shortUrl(p.socials.linkedin),
    p.socials.github && shortUrl(p.socials.github),
    p.socials.website && shortUrl(p.socials.website),
    ...p.otherLinks.filter((l) => l.url).map((l) => shortUrl(l.url)),
  ].filter(Boolean);
  const im = p.immigration;
  const authorization = joinParts([
    im.workAuthorization,
    im.authorizedCountry && `Authorized to work in ${im.authorizedCountry}`,
    im.sponsorship === "no" ? "No sponsorship required" : im.sponsorship === "yes" ? "Requires sponsorship" : "",
    im.validUntil && `Valid until ${formatMonth(im.validUntil)}`,
  ]);

  return (
    <article className="mx-auto max-w-[7.5in] bg-white font-sans text-[10pt] leading-normal text-slate-900">
      <header className="text-center">
        <h1 className="text-[20pt] font-bold leading-tight">{name}</h1>
        {p.title && <p className="text-[11pt] text-slate-700">{p.title}</p>}
        {contact.length > 0 && <p className="mt-1 text-[9pt] text-slate-700">{contact.join("  |  ")}</p>}
      </header>

      {p.about && (
        <section>
          <Heading>Summary</Heading>
          {p.about.split(/\n{2,}/).map((para, i) => (
            <p key={i} className="mb-1 leading-snug">
              {para}
            </p>
          ))}
        </section>
      )}

      {p.skills.some((g) => g.items.length) && (
        <section>
          <Heading>Skills</Heading>
          {p.skills
            .filter((g) => g.items.length)
            .map((g, i) => (
              <p key={i} className="leading-snug">
                <span className="font-bold">{g.name}:</span> {g.items.join(", ")}
              </p>
            ))}
        </section>
      )}

      {p.experience.length > 0 && (
        <section>
          <Heading>Experience</Heading>
          {p.experience.map((e, i) => (
            <div key={i} className="mb-2 break-inside-avoid">
              <div className="flex justify-between gap-4">
                <p>
                  <span className="font-bold">{e.role}</span>
                  {e.company && <span>, {e.company}</span>}
                  {e.location && <span className="text-slate-600"> — {e.location}</span>}
                </p>
                <p className="shrink-0 text-slate-700">{dateRange(e.start, e.end)}</p>
              </div>
              {e.summary && <p className="leading-snug">{e.summary}</p>}
              {e.highlights.length > 0 && (
                <ul className="ml-4 list-disc leading-snug">
                  {e.highlights.map((h, j) => (
                    <li key={j}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      <Projects title="Projects" list={p.projects} />
      <Projects title="Personal Projects" list={p.personalProjects} />

      {p.education.length > 0 && (
        <section className="break-inside-avoid-page">
          <Heading>Education</Heading>
          {p.education.map((e, i) => (
            <div key={i} className="mb-1 flex justify-between gap-4 break-inside-avoid">
              <p>
                <span className="font-bold">{joinParts([e.degree, e.field], " in ")}</span>
                {e.school && <span>, {e.school}</span>}
                {e.location && <span className="text-slate-600"> — {e.location}</span>}
                {e.grade && <span className="text-slate-600"> · {e.grade}</span>}
              </p>
              <p className="shrink-0 text-slate-700">{dateRange(e.start, e.end)}</p>
            </div>
          ))}
        </section>
      )}

      {p.certifications.length > 0 && (
        <section className="break-inside-avoid-page">
          <Heading>Certifications</Heading>
          {p.certifications.map((c, i) => (
            <div key={i} className="mb-0.5 flex justify-between gap-4">
              <p>
                <span className="font-bold">{c.name}</span>
                {c.issuer && <span>, {c.issuer}</span>}
                {c.credentialId && <span className="text-slate-600"> · ID {c.credentialId}</span>}
              </p>
              <p className="shrink-0 text-slate-700">
                {joinParts([formatMonth(c.issued), c.expires && `exp. ${formatMonth(c.expires)}`], " · ")}
              </p>
            </div>
          ))}
        </section>
      )}

      {(authorization || p.additional.languages.length > 0) && (
        <section className="break-inside-avoid">
          <Heading>Additional</Heading>
          {authorization && (
            <p>
              <span className="font-bold">Work authorization:</span> {authorization}
            </p>
          )}
          {p.additional.languages.length > 0 && (
            <p>
              <span className="font-bold">Languages:</span> {p.additional.languages.join(", ")}
            </p>
          )}
        </section>
      )}

      {p.references.length > 0 && (
        <section className="break-inside-avoid">
          <Heading>References</Heading>
          {p.references.map((r, i) => (
            <p key={i}>
              <span className="font-bold">{r.name}</span>
              {joinParts([r.relationship, r.company]) && <span>, {joinParts([r.relationship, r.company])}</span>}
              {joinParts([r.email, r.phone]) && <span className="text-slate-600"> — {joinParts([r.email, r.phone])}</span>}
            </p>
          ))}
        </section>
      )}
    </article>
  );
}
