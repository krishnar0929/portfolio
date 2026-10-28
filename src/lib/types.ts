export type SocialLinks = {
  github: string;
  linkedin: string;
  twitter: string;
  website: string;
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

export type Profile = {
  username: string;
  published: boolean;
  name: string;
  title: string;
  location: string;
  tagline: string;
  avatarUrl: string;
  resumeUrl: string;
  about: string;
  yearsExperience: number | null;
  email: string;
  accent: string; // hex, e.g. #0ea5e9
  socials: SocialLinks;
  skills: SkillGroup[];
  experience: Experience[];
  projects: Project[];
  education: Education[];
};

export const DEFAULT_ACCENT = "#0ea5e9";

export const ACCENT_PRESETS = [
  "#0ea5e9", // sky
  "#8b5cf6", // violet
  "#10b981", // emerald
  "#f59e0b", // amber
  "#f43f5e", // rose
  "#14b8a6", // teal
];

export function emptyProfile(username = ""): Profile {
  return {
    username,
    published: false,
    name: "",
    title: "",
    location: "",
    tagline: "",
    avatarUrl: "",
    resumeUrl: "",
    about: "",
    yearsExperience: null,
    email: "",
    accent: DEFAULT_ACCENT,
    socials: { github: "", linkedin: "", twitter: "", website: "" },
    skills: [],
    experience: [],
    projects: [],
    education: [],
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

/** Fill any missing fields (older docs, partial data) so the UI never sees undefined. */
export function normalizeProfile(data: Partial<Profile> | undefined | null): Profile {
  const base = emptyProfile();
  const d = data ?? {};
  return {
    ...base,
    ...d,
    socials: { ...base.socials, ...(d.socials ?? {}) },
    skills: (d.skills ?? []).map((s) => ({ name: s.name ?? "", items: s.items ?? [] })),
    experience: (d.experience ?? []).map((e) => ({ ...emptyExperience(), ...e })),
    projects: (d.projects ?? []).map((p) => ({ ...emptyProject(), ...p })),
    education: (d.education ?? []).map((e) => ({ ...emptyEducation(), ...e })),
    accent: d.accent || DEFAULT_ACCENT,
    yearsExperience: typeof d.yearsExperience === "number" ? d.yearsExperience : null,
    published: Boolean(d.published),
  };
}
