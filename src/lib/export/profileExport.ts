// Turns a (visitor-visible) profile into downloadable files.
import { displayLocation, formatMonth, fullName, type Profile, type Project } from "../types";
import { buildXlsx, type Sheet } from "./xlsx";

const join = (parts: (string | undefined | null | false)[], sep = " · ") => parts.filter(Boolean).join(sep);
const range = (start: string, end: string) => join([formatMonth(start), formatMonth(end)], " – ");

/** "alex-rivera" style base name for downloaded files. */
export function fileBaseName(p: Profile): string {
  const base = (fullName(p) || p.username || "profile")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return base || "profile";
}

export function profileSheets(p: Profile): Sheet[] {
  const sheets: Sheet[] = [];
  const im = p.immigration;

  const summary: [string, string][] = [
    ["First name", p.firstName],
    ["Middle name", p.middleName],
    ["Last name", p.lastName],
    ["Headline", p.title],
    ["Email", p.email],
    ["Phone", p.phone],
    ["City", p.city],
    ["State / province", p.region],
    ["ZIP / postal code", p.zip],
    ["Country", p.country],
    ["Years of experience", p.yearsExperience !== null ? String(p.yearsExperience) : ""],
    ["Available for work", p.available ? "Yes" : "No"],
    ["Specialties", p.specialties.join(", ")],
    ["Work authorization", im.workAuthorization],
    ["Authorized to work in", im.authorizedCountry],
    ["Visa sponsorship", im.sponsorship === "yes" ? "Required" : im.sponsorship === "no" ? "Not required" : ""],
    ["Authorization valid until", formatMonth(im.validUntil)],
    ["LinkedIn", p.socials.linkedin],
    ["GitHub", p.socials.github],
    ["Website", p.socials.website],
    ["X / Twitter", p.socials.twitter],
    ...p.otherLinks.map((l): [string, string] => [l.label || "Link", l.url]),
    ["Resume", p.resumeUrl],
    ["Languages", p.additional.languages.join(", ")],
    ["Interests", p.additional.interests.join(", ")],
    ["About", p.about],
  ];
  sheets.push({
    name: "Profile",
    columns: [{ header: "Field", width: 26 }, { header: "Value", width: 80 }],
    rows: summary.filter(([, v]) => v.trim()).map(([k, v]) => [k, v]),
  });

  if (p.experience.length) {
    sheets.push({
      name: "Experience",
      columns: [
        { header: "Job title", width: 28 },
        { header: "Company", width: 24 },
        { header: "Location", width: 18 },
        { header: "Start", width: 12 },
        { header: "End", width: 12 },
        { header: "Summary", width: 50 },
        { header: "Key achievements", width: 70 },
      ],
      rows: p.experience.map((e) => [
        e.role,
        e.company,
        e.location,
        formatMonth(e.start),
        formatMonth(e.end),
        e.summary,
        e.highlights.map((h) => `• ${h}`).join("\n"),
      ]),
    });
  }

  if (p.education.length) {
    sheets.push({
      name: "Education",
      columns: [
        { header: "School", width: 32 },
        { header: "Degree", width: 16 },
        { header: "Field of study", width: 24 },
        { header: "Location", width: 18 },
        { header: "Start", width: 10 },
        { header: "End", width: 10 },
        { header: "Grade / GPA", width: 14 },
      ],
      rows: p.education.map((e) => [e.school, e.degree, e.field, e.location, e.start, e.end, e.grade]),
    });
  }

  if (p.certifications.length) {
    sheets.push({
      name: "Certifications",
      columns: [
        { header: "Certification", width: 40 },
        { header: "Issuer", width: 26 },
        { header: "Issued", width: 12 },
        { header: "Expires", width: 12 },
        { header: "Credential ID", width: 22 },
        { header: "URL", width: 40 },
      ],
      rows: p.certifications.map((c) => [c.name, c.issuer, formatMonth(c.issued), formatMonth(c.expires), c.credentialId, c.url]),
    });
  }

  if (p.skills.length) {
    sheets.push({
      name: "Skills",
      columns: [{ header: "Group", width: 24 }, { header: "Skills", width: 80 }],
      rows: p.skills.map((g) => [g.name, g.items.join(", ")]),
    });
  }

  const projectRows = (type: string, list: Project[]) =>
    list.map((x) => [type, x.title, x.category, x.description, x.tags.join(", "), x.liveUrl, x.repoUrl]);
  if (p.projects.length || p.personalProjects.length) {
    sheets.push({
      name: "Projects",
      columns: [
        { header: "Type", width: 12 },
        { header: "Title", width: 28 },
        { header: "Category", width: 14 },
        { header: "Description", width: 60 },
        { header: "Tech", width: 30 },
        { header: "Live URL", width: 32 },
        { header: "Code URL", width: 32 },
      ],
      rows: [...projectRows("Work", p.projects), ...projectRows("Personal", p.personalProjects)],
    });
  }

  if (p.references.length) {
    sheets.push({
      name: "References",
      columns: [
        { header: "Name", width: 24 },
        { header: "Relationship", width: 20 },
        { header: "Company", width: 22 },
        { header: "Email", width: 30 },
        { header: "Phone", width: 18 },
      ],
      rows: p.references.map((r) => [r.name, r.relationship, r.company, r.email, r.phone]),
    });
  }

  return sheets;
}

export function profileXlsx(p: Profile): Blob {
  const bytes = buildXlsx(profileSheets(p));
  return new Blob([bytes.buffer as ArrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/** vCard 3.0 contact card (opens in Contacts / Outlook / Google Contacts). */
export function profileVcard(p: Profile, pageUrl: string): Blob {
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${esc(p.lastName)};${esc(p.firstName)};${esc(p.middleName)};;`,
    `FN:${esc(fullName(p) || p.username)}`,
    p.title && `TITLE:${esc(p.title)}`,
    p.experience[0]?.company && /present/i.test(p.experience[0].end) && `ORG:${esc(p.experience[0].company)}`,
    p.email && `EMAIL;TYPE=INTERNET:${esc(p.email)}`,
    p.phone && `TEL;TYPE=CELL:${esc(p.phone)}`,
    displayLocation(p) && `ADR;TYPE=HOME:;;;${esc(p.city)};${esc(p.region)};${esc(p.zip)};${esc(p.country)}`,
    pageUrl && `URL:${esc(pageUrl)}`,
    p.socials.linkedin && `URL;TYPE=LinkedIn:${esc(p.socials.linkedin)}`,
    p.socials.github && `URL;TYPE=GitHub:${esc(p.socials.github)}`,
    "END:VCARD",
  ].filter(Boolean) as string[];
  return new Blob([lines.join("\r\n") + "\r\n"], { type: "text/vcard;charset=utf-8" });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export { range as dateRange, join as joinParts };
