import { normalizeProfile, type Profile } from "./types";

/** Demo content shown at /demo and offered as a starting point in the editor. */
export const sampleProfile: Profile = normalizeProfile({
  username: "demo",
  published: true,
  name: "Alex Rivera",
  title: "Full-Stack Engineer",
  location: "Atlanta, GA",
  tagline:
    "I build fast, reliable web and mobile products — from the first sketch to production at scale.",
  avatarUrl: "",
  resumeUrl: "",
  about:
    "I'm a full-stack engineer with a soft spot for clean interfaces and boring, dependable infrastructure. Over the last seven years I've shipped SaaS dashboards, consumer mobile apps and data pipelines for startups and enterprise teams.\n\nI like owning a feature end to end: talking to users, designing the data model, writing the code and watching the metrics after launch. Outside work I tinker with browser extensions and side projects.",
  yearsExperience: 7,
  email: "alex@example.com",
  accent: "#0ea5e9",
  socials: {
    github: "https://github.com/",
    linkedin: "https://www.linkedin.com/",
    twitter: "",
    website: "",
  },
  skills: [
    { name: "Frontend", items: ["TypeScript", "React", "Next.js", "Angular", "Tailwind CSS"] },
    { name: "Backend", items: ["Node.js", "Python", "Firebase", "PostgreSQL", "REST & GraphQL"] },
    { name: "Mobile", items: ["Flutter", "React Native"] },
    { name: "Cloud & Tools", items: ["Vercel", "GCP", "Docker", "GitHub Actions", "Figma"] },
  ],
  experience: [
    {
      role: "Senior Software Engineer",
      company: "Brightline Labs",
      start: "2023",
      end: "Present",
      location: "Remote",
      summary: "Lead engineer on the customer analytics platform used by 400+ businesses.",
      highlights: [
        "Rebuilt the reporting dashboard in Next.js, cutting load time by 60%",
        "Designed an event pipeline handling 20M events per day",
        "Mentored four engineers and introduced weekly design reviews",
      ],
    },
    {
      role: "Software Engineer",
      company: "Parcel & Co.",
      start: "2020",
      end: "2023",
      location: "Atlanta, GA",
      summary: "Built the courier and customer mobile apps from zero to 100k users.",
      highlights: [
        "Shipped Flutter apps for iOS and Android from a single codebase",
        "Added live delivery tracking with Firebase and Google Maps",
      ],
    },
    {
      role: "Junior Developer",
      company: "Northside Digital",
      start: "2018",
      end: "2020",
      location: "Atlanta, GA",
      summary: "Agency work across e-commerce, marketing sites and internal tools.",
      highlights: [],
    },
  ],
  projects: [
    {
      title: "ChargeMap Lite",
      description: "Find EV chargers near restaurants and coffee shops, with live availability.",
      category: "Web",
      tags: ["Next.js", "Google Maps", "Firebase"],
      image: "",
      liveUrl: "https://example.com",
      repoUrl: "",
    },
    {
      title: "ThreadSaver",
      description: "Browser extension that exports a full email thread to a clean PDF in one click.",
      category: "Extension",
      tags: ["Chrome", "TypeScript"],
      image: "",
      liveUrl: "",
      repoUrl: "https://github.com/",
    },
    {
      title: "Daily Pulse",
      description: "A mobile habit tracker that scores your day from sleep, steps and screen time.",
      category: "Mobile",
      tags: ["Flutter", "HealthKit"],
      image: "",
      liveUrl: "",
      repoUrl: "",
    },
    {
      title: "Ledger API",
      description: "Double-entry accounting API with idempotent writes and audit logs.",
      category: "Backend",
      tags: ["Node.js", "PostgreSQL"],
      image: "",
      liveUrl: "",
      repoUrl: "https://github.com/",
    },
  ],
  education: [
    { school: "Georgia State University", degree: "B.S. Computer Science", start: "2014", end: "2018" },
  ],
});
