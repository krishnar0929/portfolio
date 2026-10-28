export type SocialLinks = {
  github: string;
  linkedin: string;
  twitter: string;
  website: string;
  telegram: string;
  discord: string;
  phone: string;
};

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
  start: string;
  end: string;
};

export type Review = {
  name: string;
  role: string;
  text: string;
  rating: number; // 1–5
};

export type Theme = "light" | "dark";

export type Profile = {
  username: string;
  published: boolean;
  // Identity
  name: string;
  title: string;
  tagline: string;
  specialties: string[];
  available: boolean;
  location: string;
  degree: string;
  avatarUrl: string;
  backgroundUrl: string;
  resumeUrl: string;
  meetingUrl: string;
  // About + stats
  about: string;
  yearsExperience: number | null;
  projectsCount: number | null; // optional override; defaults to projects listed
  clientsCount: number | null;
  // Contact
  email: string;
  socials: SocialLinks;
  // Sections
  skills: SkillGroup[];
  experience: Experience[];
  projects: Project[];
  education: Education[];
  reviews: Review[];
  // Design
  accent: string; // hex, e.g. #0ea5e9
  theme: Theme; // default theme for visitors
};

export const DEFAULT_ACCENT = "#0ea5e9";

export const ACCENT_PRESETS = [
  "#0ea5e9", // sky
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#10b981", // emerald
  "#14b8a6", // teal
  "#f59e0b", // amber
  "#f43f5e", // rose
];

export function emptyProfile(username = ""): Profile {
  return {
    username,
    published: false,
    name: "",
    title: "",
    tagline: "",
    specialties: [],
    available: true,
    location: "",
    degree: "",
    avatarUrl: "",
    backgroundUrl: "",
    resumeUrl: "",
    meetingUrl: "",
    about: "",
    yearsExperience: null,
    projectsCount: null,
    clientsCount: null,
    email: "",
    socials: { github: "", linkedin: "", twitter: "", website: "", telegram: "", discord: "", phone: "" },
    skills: [],
    experience: [],
    projects: [],
    education: [],
    reviews: [],
    accent: DEFAULT_ACCENT,
    theme: "light",
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
  category: "Web",
  tags: [],
  image: "",
  liveUrl: "",
  repoUrl: "",
});

export const emptyEducation = (): Education => ({
  school: "",
  degree: "",
  start: "",
  end: "",
});

export const emptyReview = (): Review => ({
  name: "",
  role: "",
  text: "",
  rating: 5,
});

const numOrNull = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);

/** Fill any missing fields (older docs, partial data) so the UI never sees undefined. */
export function normalizeProfile(data: Partial<Profile> | undefined | null): Profile {
  const base = emptyProfile();
  const d = data ?? {};
  return {
    ...base,
    ...d,
    socials: { ...base.socials, ...(d.socials ?? {}) },
    specialties: d.specialties ?? [],
    skills: (d.skills ?? []).map((s) => ({ name: s.name ?? "", items: s.items ?? [] })),
    experience: (d.experience ?? []).map((e) => ({ ...emptyExperience(), ...e })),
    projects: (d.projects ?? []).map((p) => ({ ...emptyProject(), ...p })),
    education: (d.education ?? []).map((e) => ({ ...emptyEducation(), ...e })),
    reviews: (d.reviews ?? []).map((r) => ({ ...emptyReview(), ...r })),
    accent: d.accent || DEFAULT_ACCENT,
    theme: d.theme === "dark" ? "dark" : "light",
    available: d.available === undefined ? base.available : Boolean(d.available),
    yearsExperience: numOrNull(d.yearsExperience),
    projectsCount: numOrNull(d.projectsCount),
    clientsCount: numOrNull(d.clientsCount),
    published: Boolean(d.published),
  };
}
