import type { Profile, Project } from "./types";

export type SectionStatus = "complete" | "partial" | "empty";

const filled = (s: string) => s.trim().length > 0;

/** empty: nothing entered · complete: all required present · partial: in between */
function fromFields(required: string[], optional: string[] = []): SectionStatus {
  if (![...required, ...optional].some(filled)) return "empty";
  return required.every(filled) ? "complete" : "partial";
}

function fromList<T>(items: T[], ok: (t: T) => boolean): SectionStatus {
  if (items.length === 0) return "empty";
  return items.every(ok) ? "complete" : "partial";
}

const projectOk = (x: Project) => filled(x.title) && filled(x.description);

export const SECTION_STATUS = {
  personal: (p: Profile) =>
    fromFields([p.firstName, p.lastName, p.email, p.city, p.zip, p.country], [p.middleName, p.phone, p.region]),
  summary: (p: Profile) => fromFields([p.title, p.about], [p.tagline, p.avatarUrl, p.resumeUrl, ...p.specialties]),
  education: (p: Profile) => fromList(p.education, (e) => filled(e.school) && filled(e.degree)),
  experience: (p: Profile) => fromList(p.experience, (e) => filled(e.role) && filled(e.company) && filled(e.start)),
  skills: (p: Profile) => fromList(p.skills, (g) => filled(g.name) && g.items.length > 0),
  projects: (p: Profile) => fromList(p.projects, projectOk),
  personalProjects: (p: Profile) => fromList(p.personalProjects, projectOk),
  immigration: (p: Profile) =>
    fromFields(
      [p.immigration.workAuthorization, p.immigration.authorizedCountry, p.immigration.sponsorship],
      [p.immigration.validUntil, p.immigration.notes],
    ),
  references: (p: Profile) => fromList(p.references, (r) => filled(r.name) && (filled(r.email) || filled(r.phone))),
  links: (p: Profile) => {
    const any = Object.values(p.socials).some(filled) || p.otherLinks.length > 0;
    if (!any) return "empty" as SectionStatus;
    return p.otherLinks.every((l) => filled(l.label) && filled(l.url)) ? "complete" : "partial";
  },
  additional: (p: Profile) =>
    fromFields([], [...p.additional.languages, ...p.additional.certifications, ...p.additional.interests, p.additional.notes]),
  reviews: (p: Profile) => fromList(p.reviews, (r) => filled(r.name) && filled(r.text)),
  design: (p: Profile) => fromFields([], [p.meetingUrl, p.backgroundUrl]),
} satisfies Record<string, (p: Profile) => SectionStatus>;

export type SectionId = keyof typeof SECTION_STATUS;

/** Sections that count toward the profile-strength bar. */
const CORE: SectionId[] = ["personal", "summary", "education", "experience", "skills", "projects", "links"];

export function completion(p: Profile): number {
  const score = CORE.reduce((sum, id) => {
    const s = SECTION_STATUS[id](p);
    return sum + (s === "complete" ? 1 : s === "partial" ? 0.5 : 0);
  }, 0);
  return Math.round((score / CORE.length) * 100);
}
