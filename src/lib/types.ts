export type SocialLinks = {
  linkedin: string;
  github: string;
  website: string;
  twitter: string;
  telegram: string;
  discord: string;
};

export type LinkItem = { label: string; url: string };

export type SkillGroup = {
  name: string;
  items: string[];
};

export type Experience = {
  role: string;
  company: string;
  start: string;
  end: string;
  location: string;
  summary: string;
  highlights: string[];
};

export type Project = {
  title: string;
  description: string;
  category: string;
  tags: string[];
  image: string;
  liveUrl: string;
  repoUrl: string;
};

export type Education = {
  school: string;
  degree: string;
  field: string;
  location: string;
  start: string;
  end: string;
  grade: string;
};

export type Certification = {
  name: string;
  issuer: string;
  issued: string; // yyyy-mm
  expires: string; // yyyy-mm, empty = no expiry
  credentialId: string;
  url: string;
};

export type Sponsorship = "" | "yes" | "no";

export type Immigration = {
  workAuthorization: string;
  authorizedCountry: string;
  sponsorship: Sponsorship;
  validUntil: string; // yyyy-mm
  notes: string;
};

export type Reference = {
  name: string;
  relationship: string;
  company: string;
  email: string;
  phone: string;
};

export type AdditionalInfo = {
  languages: string[];
  interests: string[];
  notes: string;
};

export type Review = {
  name: string;
  role: string;
  text: string;
  rating: number; // 1–5
};

export type Privacy = {
  showEmail: boolean;
  showPhone: boolean;
  showImmigration: boolean;
  showReferences: boolean;
};

export type Theme = "light" | "dark";

export type BackgroundStyle = "aurora" | "grid" | "dots" | "plain";

export const BACKGROUND_STYLES: { value: BackgroundStyle; label: string }[] = [
  { value: "aurora", label: "Aurora" },
  { value: "grid", label: "Grid" },
  { value: "dots", label: "Dots" },
  { value: "plain", label: "Plain" },
];

/** One-click looks: accent colour + background + default theme. */
export const THEME_PRESETS: { name: string; accent: string; background: BackgroundStyle; theme: Theme }[] = [
  { name: "Ocean", accent: "#0ea5e9", background: "aurora", theme: "light" },
  { name: "Indigo", accent: "#6366f1", background: "grid", theme: "light" },
  { name: "Emerald", accent: "#10b981", background: "dots", theme: "light" },
  { name: "Sunset", accent: "#f97316", background: "aurora", theme: "light" },
  { name: "Midnight", accent: "#8b5cf6", background: "grid", theme: "dark" },
  { name: "Terminal", accent: "#22c55e", background: "dots", theme: "dark" },
];

/** draft: only the owner · public: anyone, searchable · private: invited emails or password */
export type Visibility = "draft" | "public" | "private";

export const MIN_PASSWORD_LENGTH = 8;

export const WORK_AUTHORIZATION_OPTIONS = [
  "Citizen",
  "Permanent resident / Green Card",
  "H-1B",
  "H-4 EAD",
  "L-1",
  "L-2 EAD",
  "F-1 OPT",
  "F-1 STEM OPT",
  "F-1 CPT",
  "TN",
  "O-1",
  "E-3",
  "Other work visa",
  "Not yet authorized",
];

export type Profile = {
  username: string;
  visibility: Visibility;
  // Personal details (as per passport)
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  region: string; // state / province
  zip: string;
  country: string;
  // Professional summary
  title: string;
  tagline: string;
  about: string;
  avatarUrl: string;
  available: boolean;
  specialties: string[];
  yearsExperience: number | null;
  projectsCount: number | null; // optional override; defaults to projects listed
  clientsCount: number | null;
  resumeUrl: string;
  // Sections
  education: Education[];
  certifications: Certification[];
  experience: Experience[];
  skills: SkillGroup[];
  projects: Project[];
  personalProjects: Project[];
  immigration: Immigration;
  references: Reference[];
  socials: SocialLinks;
  otherLinks: LinkItem[];
  additional: AdditionalInfo;
  reviews: Review[];
  // Design & extras
  meetingUrl: string;
  backgroundUrl: string;
  accent: string; // hex, e.g. #0ea5e9
  theme: Theme;
  backgroundStyle: BackgroundStyle;
  // What visitors see / who can see it
  privacy: Privacy;
  authorizedEmails: string[]; // owner-only; never copied to what visitors read
};

export const DEFAULT_ACCENT = "#0ea5e9";

export const ACCENT_PRESETS = ["#0ea5e9", "#6366f1", "#8b5cf6", "#10b981", "#14b8a6", "#f59e0b", "#f43f5e"];

export const emptyImmigration = (): Immigration => ({
  workAuthorization: "",
  authorizedCountry: "",
  sponsorship: "",
  validUntil: "",
  notes: "",
});

export const emptyAdditional = (): AdditionalInfo => ({ languages: [], interests: [], notes: "" });

export function emptyProfile(username = ""): Profile {
  return {
    username,
    visibility: "draft",
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    region: "",
    zip: "",
    country: "",
    title: "",
    tagline: "",
    about: "",
    avatarUrl: "",
    available: true,
    specialties: [],
    yearsExperience: null,
    projectsCount: null,
    clientsCount: null,
    resumeUrl: "",
    education: [],
    certifications: [],
    experience: [],
    skills: [],
    projects: [],
    personalProjects: [],
    immigration: emptyImmigration(),
    references: [],
    socials: { linkedin: "", github: "", website: "", twitter: "", telegram: "", discord: "" },
    otherLinks: [],
    additional: emptyAdditional(),
    reviews: [],
    meetingUrl: "",
    backgroundUrl: "",
    accent: DEFAULT_ACCENT,
    theme: "light",
    backgroundStyle: "aurora",
    privacy: { showEmail: true, showPhone: true, showImmigration: false, showReferences: false },
    authorizedEmails: [],
  };
}

export const emptyExperience = (): Experience => ({
  role: "",
  company: "",
  start: "",
  end: "Present",
  location: "",
  summary: "",
  highlights: [],
});

export const emptyProject = (): Project => ({
  title: "",
  description: "",
  category: "",
  tags: [],
  image: "",
  liveUrl: "",
  repoUrl: "",
});

export const emptyEducation = (): Education => ({
  school: "",
  degree: "",
  field: "",
  location: "",
  start: "",
  end: "",
  grade: "",
});

export const emptyCertification = (): Certification => ({
  name: "",
  issuer: "",
  issued: "",
  expires: "",
  credentialId: "",
  url: "",
});

export const emptyReference = (): Reference => ({ name: "", relationship: "", company: "", email: "", phone: "" });

export const emptyReview = (): Review => ({ name: "", role: "", text: "", rating: 5 });

/* ---------- Normalisation (tolerates old / partial / storage docs) ---------- */

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => (v && typeof v === "object" && !Array.isArray(v) ? (v as Obj) : {});
const arr = (v: unknown): Obj[] => (Array.isArray(v) ? v.map(obj) : []);
const str = (v: unknown) => (typeof v === "string" ? v : "");
const strArr = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const bool = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback);

const toProject = (p: Obj): Project => ({
  title: str(p.title),
  description: str(p.description),
  category: str(p.category),
  tags: strArr(p.tags),
  image: str(p.image),
  liveUrl: str(p.liveUrl),
  repoUrl: str(p.repoUrl),
});

/**
 * Build a clean Profile from any stored doc. Only known fields are copied, so
 * storage-only fields (privateKey, searchTokens, …) never reach the UI.
 * Older docs (single `name`, `published`, `socials.phone`) are migrated.
 */
export function normalizeProfile(data: unknown): Profile {
  const d = obj(data);
  const socials = obj(d.socials);
  const imm = obj(d.immigration);
  const add = obj(d.additional);
  const priv = obj(d.privacy);

  let firstName = str(d.firstName);
  let lastName = str(d.lastName);
  if (!firstName && !lastName && str(d.name).trim()) {
    const parts = str(d.name).trim().split(/\s+/);
    firstName = parts[0];
    lastName = parts.slice(1).join(" ");
  }

  const visibility: Visibility =
    d.visibility === "public" || d.visibility === "private" || d.visibility === "draft"
      ? d.visibility
      : d.published === true
        ? "public"
        : "draft";

  return {
    username: str(d.username),
    visibility,
    firstName,
    middleName: str(d.middleName),
    lastName,
    email: str(d.email),
    phone: str(d.phone) || str(socials.phone),
    city: str(d.city),
    region: str(d.region),
    zip: str(d.zip),
    country: str(d.country),
    title: str(d.title),
    tagline: str(d.tagline),
    about: str(d.about),
    avatarUrl: str(d.avatarUrl),
    available: bool(d.available, true),
    specialties: strArr(d.specialties),
    yearsExperience: num(d.yearsExperience),
    projectsCount: num(d.projectsCount),
    clientsCount: num(d.clientsCount),
    resumeUrl: str(d.resumeUrl),
    education: arr(d.education).map((e) => ({
      school: str(e.school),
      degree: str(e.degree),
      field: str(e.field),
      location: str(e.location),
      start: str(e.start),
      end: str(e.end),
      grade: str(e.grade),
    })),
    // Older docs kept certifications as plain strings under additional
    certifications: [
      ...arr(d.certifications).map((c) => ({
        name: str(c.name),
        issuer: str(c.issuer),
        issued: str(c.issued),
        expires: str(c.expires),
        credentialId: str(c.credentialId),
        url: str(c.url),
      })),
      ...strArr(add.certifications).map((name) => ({ ...emptyCertification(), name })),
    ],
    experience: arr(d.experience).map((e) => ({
      role: str(e.role),
      company: str(e.company),
      start: str(e.start),
      end: str(e.end),
      location: str(e.location),
      summary: str(e.summary),
      highlights: strArr(e.highlights),
    })),
    skills: arr(d.skills).map((s) => ({ name: str(s.name), items: strArr(s.items) })),
    projects: arr(d.projects).map(toProject),
    personalProjects: arr(d.personalProjects).map(toProject),
    immigration: {
      workAuthorization: str(imm.workAuthorization),
      authorizedCountry: str(imm.authorizedCountry),
      sponsorship: imm.sponsorship === "yes" || imm.sponsorship === "no" ? imm.sponsorship : "",
      validUntil: str(imm.validUntil),
      notes: str(imm.notes),
    },
    references: arr(d.references).map((r) => ({
      name: str(r.name),
      relationship: str(r.relationship),
      company: str(r.company),
      email: str(r.email),
      phone: str(r.phone),
    })),
    socials: {
      linkedin: str(socials.linkedin),
      github: str(socials.github),
      website: str(socials.website),
      twitter: str(socials.twitter),
      telegram: str(socials.telegram),
      discord: str(socials.discord),
    },
    otherLinks: arr(d.otherLinks).map((l) => ({ label: str(l.label), url: str(l.url) })),
    additional: {
      languages: strArr(add.languages),
      interests: strArr(add.interests),
      notes: str(add.notes),
    },
    reviews: arr(d.reviews).map((r) => {
      const n = num(r.rating);
      return {
        name: str(r.name),
        role: str(r.role),
        text: str(r.text),
        rating: n === null ? 5 : Math.min(5, Math.max(1, Math.round(n))),
      };
    }),
    meetingUrl: str(d.meetingUrl),
    backgroundUrl: str(d.backgroundUrl),
    accent: str(d.accent) || DEFAULT_ACCENT,
    theme: d.theme === "dark" ? "dark" : "light",
    backgroundStyle: BACKGROUND_STYLES.some((b) => b.value === d.backgroundStyle)
      ? (d.backgroundStyle as BackgroundStyle)
      : "aurora",
    privacy: {
      showEmail: bool(priv.showEmail, true),
      showPhone: bool(priv.showPhone, true),
      showImmigration: bool(priv.showImmigration, false),
      showReferences: bool(priv.showReferences, false),
    },
    authorizedEmails: strArr(d.authorizedEmails),
  };
}

/* ---------- Helpers ---------- */

export const fullName = (p: Pick<Profile, "firstName" | "middleName" | "lastName">) =>
  [p.firstName, p.middleName, p.lastName].map((s) => s.trim()).filter(Boolean).join(" ");

/** "Atlanta, GA 30303, USA" */
export function displayLocation(p: Pick<Profile, "city" | "region" | "zip" | "country">): string {
  const regionZip = [p.region.trim(), p.zip.trim()].filter(Boolean).join(" ");
  return [p.city.trim(), regionZip, p.country.trim()].filter(Boolean).join(", ");
}

export const normalizeEmail = (e: string) => e.trim().toLowerCase();
export const isValidEmail = (e: string) => /^[^\s@/]+@[^\s@/]+\.[^\s@/]+$/.test(e.trim());

/**
 * What visitors are allowed to see: hides fields the owner switched off and
 * drops owner-only data. Used for the public/private copies and the preview.
 */
export function publishedView(p: Profile): Profile {
  return {
    ...p,
    email: p.privacy.showEmail ? p.email : "",
    phone: p.privacy.showPhone ? p.phone : "",
    immigration: p.privacy.showImmigration ? p.immigration : emptyImmigration(),
    references: p.privacy.showReferences ? p.references : [],
    authorizedEmails: [],
  };
}

/** "2023-05" -> "May 2023" (leaves other text as-is). */
export function formatMonth(v: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec(v.trim());
  if (!m) return v.trim();
  return new Date(Number(m[1]), Number(m[2]) - 1, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
