"use client";

import { useState } from "react";
import { PlusIcon } from "@/components/Icons";
import { completion, SECTION_STATUS, type SectionId } from "@/lib/sections";
import {
  ACCENT_PRESETS,
  emptyEducation,
  emptyExperience,
  emptyProject,
  emptyReference,
  emptyReview,
  WORK_AUTHORIZATION_OPTIONS,
  type Profile,
  type Project,
  type Sponsorship,
} from "@/lib/types";
import {
  ItemCard,
  ListInput,
  move,
  NumberInput,
  removeAt,
  Select,
  TextArea,
  TextInput,
  Toggle,
  updateAt,
} from "./fields";
import { Section } from "./Section";

const ORDER: SectionId[] = [
  "personal",
  "summary",
  "education",
  "experience",
  "skills",
  "projects",
  "personalProjects",
  "immigration",
  "references",
  "links",
  "additional",
  "reviews",
  "design",
];

export function ProfileEditor({
  profile,
  onChange,
  photoURL,
}: {
  profile: Profile;
  onChange: (p: Profile) => void;
  photoURL?: string | null;
}) {
  const [open, setOpen] = useState<Set<SectionId>>(new Set());
  const p = profile;
  const set = (patch: Partial<Profile>) => onChange({ ...p, ...patch });
  const toggle = (id: SectionId) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const sectionProps = (id: SectionId) => ({
    id,
    status: SECTION_STATUS[id](p),
    open: open.has(id),
    onToggle: () => toggle(id),
  });

  const pct = completion(p);
  const doneCount = ORDER.filter((id) => SECTION_STATUS[id](p) === "complete").length;

  return (
    <div className="space-y-3">
      {/* Profile strength */}
      <div className="rounded-xl border border-white/[0.08] bg-ink-950/30 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-200">Profile strength</span>
          <span className="font-mono text-accent">{pct}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full rounded-full bg-gradient-to-r from-accent to-emerald-400 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>
            {doneCount} of {ORDER.length} sections complete
          </span>
          <span className="flex gap-3">
            <button type="button" className="hover:text-white" onClick={() => setOpen(new Set(ORDER))}>
              Expand all
            </button>
            <button type="button" className="hover:text-white" onClick={() => setOpen(new Set())}>
              Collapse all
            </button>
          </span>
        </div>
      </div>

      {/* 1. Personal details */}
      <Section
        {...sectionProps("personal")}
        title="Personal Details"
        tag="As per passport"
        description="Legal name, contact and current location"
      >
        <p className="text-xs text-slate-500">Enter your name exactly as it appears on your passport. * required</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <TextInput label="First name *" value={p.firstName} onChange={(firstName) => set({ firstName })} />
          <TextInput label="Middle name" value={p.middleName} onChange={(middleName) => set({ middleName })} />
          <TextInput label="Last name *" value={p.lastName} onChange={(lastName) => set({ lastName })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Email *" type="email" value={p.email} onChange={(email) => set({ email })} />
          <TextInput label="Phone" type="tel" value={p.phone} onChange={(phone) => set({ phone })} placeholder="+1 555 123 4567" />
        </div>
        <p className="label !mb-0 pt-1">Current location</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="City *" value={p.city} onChange={(city) => set({ city })} />
          <TextInput label="State / province" value={p.region} onChange={(region) => set({ region })} />
          <TextInput label="ZIP / postal code *" value={p.zip} onChange={(zip) => set({ zip })} />
          <TextInput label="Country *" value={p.country} onChange={(country) => set({ country })} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Toggle
            label="Show email on my page"
            checked={p.privacy.showEmail}
            onChange={(showEmail) => set({ privacy: { ...p.privacy, showEmail } })}
          />
          <Toggle
            label="Show phone on my page"
            checked={p.privacy.showPhone}
            onChange={(showPhone) => set({ privacy: { ...p.privacy, showPhone } })}
          />
        </div>
      </Section>

      {/* 2. Professional summary */}
      <Section {...sectionProps("summary")} title="Professional Summary" description="Headline, about you, photo and resume">
        <TextInput label="Headline *" value={p.title} onChange={(title) => set({ title })} placeholder="Senior Full-Stack Engineer" />
        <TextArea
          label="About you *"
          rows={7}
          value={p.about}
          onChange={(about) => set({ about })}
          hint="A few short paragraphs. Leave a blank line between paragraphs."
        />
        <TextArea
          label="Tagline"
          rows={2}
          value={p.tagline}
          onChange={(tagline) => set({ tagline })}
          hint="One sentence, used in link previews."
        />
        <Toggle
          label="Available for work"
          hint="Shows a green badge on your card."
          checked={p.available}
          onChange={(available) => set({ available })}
        />
        <ListInput
          label="Specialties"
          value={p.specialties}
          onChange={(specialties) => set({ specialties })}
          placeholder="AI Agents, Full-Stack, Mobile Apps"
        />
        <div className="grid grid-cols-3 gap-3">
          <NumberInput label="Years exp." max={60} value={p.yearsExperience} onChange={(yearsExperience) => set({ yearsExperience })} />
          <NumberInput label="Projects" value={p.projectsCount} onChange={(projectsCount) => set({ projectsCount })} />
          <NumberInput label="Clients" value={p.clientsCount} onChange={(clientsCount) => set({ clientsCount })} />
        </div>
        <div>
          <TextInput
            label="Photo URL"
            value={p.avatarUrl}
            onChange={(avatarUrl) => set({ avatarUrl })}
            placeholder="https://…"
            hint="Tip: https://github.com/<username>.png works well."
          />
          {photoURL && photoURL !== p.avatarUrl && (
            <button type="button" className="mt-2 text-xs text-accent hover:underline" onClick={() => set({ avatarUrl: photoURL })}>
              Use my Google profile photo
            </button>
          )}
        </div>
        <TextInput
          label="Resume link (PDF)"
          value={p.resumeUrl}
          onChange={(resumeUrl) => set({ resumeUrl })}
          placeholder="https://drive.google.com/…"
          hint="A link anyone can open, e.g. Google Drive with 'Anyone with the link'."
        />
      </Section>

      {/* 3. Education */}
      <Section {...sectionProps("education")} title="Education" description={countLabel(p.education.length, "entry", "entries")}>
        {p.education.map((ed, i) => (
          <ItemCard
            key={i}
            title={[ed.degree, ed.field].filter(Boolean).join(", ") || ed.school || `Education ${i + 1}`}
            index={i}
            count={p.education.length}
            onMove={(a, b) => set({ education: move(p.education, a, b) })}
            onRemove={(idx) => set({ education: removeAt(p.education, idx) })}
          >
            <TextInput label="School / university *" value={ed.school} onChange={(school) => set({ education: updateAt(p.education, i, { school }) })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Degree *" value={ed.degree} placeholder="B.Tech, M.S., MBA…" onChange={(degree) => set({ education: updateAt(p.education, i, { degree }) })} />
              <TextInput label="Field of study" value={ed.field} placeholder="Computer Science" onChange={(field) => set({ education: updateAt(p.education, i, { field }) })} />
              <TextInput label="Start" value={ed.start} placeholder="2014" onChange={(start) => set({ education: updateAt(p.education, i, { start }) })} />
              <TextInput label="End" value={ed.end} placeholder="2018" onChange={(end) => set({ education: updateAt(p.education, i, { end }) })} />
              <TextInput label="Grade / GPA" value={ed.grade} onChange={(grade) => set({ education: updateAt(p.education, i, { grade }) })} />
              <TextInput label="Location" value={ed.location} onChange={(location) => set({ education: updateAt(p.education, i, { location }) })} />
            </div>
          </ItemCard>
        ))}
        <AddButton onClick={() => set({ education: [...p.education, emptyEducation()] })}>Add education</AddButton>
      </Section>

      {/* 4. Experience */}
      <Section {...sectionProps("experience")} title="Work Experience" description={countLabel(p.experience.length, "role", "roles")}>
        {p.experience.map((e, i) => (
          <ItemCard
            key={i}
            title={[e.role, e.company].filter(Boolean).join(" · ") || `Role ${i + 1}`}
            index={i}
            count={p.experience.length}
            onMove={(a, b) => set({ experience: move(p.experience, a, b) })}
            onRemove={(idx) => set({ experience: removeAt(p.experience, idx) })}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Job title *" value={e.role} onChange={(role) => set({ experience: updateAt(p.experience, i, { role }) })} />
              <TextInput label="Company *" value={e.company} onChange={(company) => set({ experience: updateAt(p.experience, i, { company }) })} />
              <TextInput label="Start *" value={e.start} placeholder="Jan 2021" onChange={(start) => set({ experience: updateAt(p.experience, i, { start }) })} />
              <TextInput label="End" value={e.end} placeholder="Present" onChange={(end) => set({ experience: updateAt(p.experience, i, { end }) })} />
            </div>
            <TextInput label="Location" value={e.location} onChange={(location) => set({ experience: updateAt(p.experience, i, { location }) })} />
            <TextArea label="Summary" rows={2} value={e.summary} onChange={(summary) => set({ experience: updateAt(p.experience, i, { summary }) })} />
            <ListInput
              multiline
              label="Key achievements"
              value={e.highlights}
              onChange={(highlights) => set({ experience: updateAt(p.experience, i, { highlights }) })}
              placeholder={"Cut page load time by 60%\nLed a team of 4"}
            />
          </ItemCard>
        ))}
        <AddButton onClick={() => set({ experience: [emptyExperience(), ...p.experience] })}>Add role (adds to top)</AddButton>
      </Section>

      {/* 5. Skills */}
      <Section {...sectionProps("skills")} title="Skills" description={countLabel(p.skills.length, "group", "groups")}>
        {p.skills.map((g, i) => (
          <ItemCard
            key={i}
            title={g.name || `Group ${i + 1}`}
            index={i}
            count={p.skills.length}
            onMove={(a, b) => set({ skills: move(p.skills, a, b) })}
            onRemove={(idx) => set({ skills: removeAt(p.skills, idx) })}
          >
            <TextInput label="Group name *" value={g.name} placeholder="Frontend" onChange={(name) => set({ skills: updateAt(p.skills, i, { name }) })} />
            <ListInput label="Skills *" value={g.items} placeholder="React, TypeScript, Tailwind" onChange={(items) => set({ skills: updateAt(p.skills, i, { items }) })} />
          </ItemCard>
        ))}
        <AddButton onClick={() => set({ skills: [...p.skills, { name: "", items: [] }] })}>Add skill group</AddButton>
      </Section>

      {/* 6–7. Projects */}
      <Section {...sectionProps("projects")} title="Projects" description="Work and client projects">
        <ProjectsEditor list={p.projects} onChange={(projects) => set({ projects })} />
      </Section>
      <Section {...sectionProps("personalProjects")} title="Personal Projects" description="Side projects, open source, hackathons">
        <ProjectsEditor list={p.personalProjects} onChange={(personalProjects) => set({ personalProjects })} />
      </Section>

      {/* 8. Immigration */}
      <Section
        {...sectionProps("immigration")}
        title="Immigration Details"
        tag={p.privacy.showImmigration ? "Shown" : "Hidden"}
        description="Work authorization and sponsorship"
      >
        <Toggle
          label="Show on my page"
          hint="Off by default. When on, everyone who can open your page sees it."
          checked={p.privacy.showImmigration}
          onChange={(showImmigration) => set({ privacy: { ...p.privacy, showImmigration } })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Work authorization *"
            value={p.immigration.workAuthorization}
            options={WORK_AUTHORIZATION_OPTIONS.map((o) => ({ value: o, label: o }))}
            onChange={(workAuthorization) => set({ immigration: { ...p.immigration, workAuthorization } })}
          />
          <TextInput
            label="Authorized to work in *"
            value={p.immigration.authorizedCountry}
            placeholder="USA"
            onChange={(authorizedCountry) => set({ immigration: { ...p.immigration, authorizedCountry } })}
          />
          <Select
            label="Need visa sponsorship? *"
            value={p.immigration.sponsorship}
            options={[
              { value: "no", label: "No" },
              { value: "yes", label: "Yes" },
            ]}
            onChange={(v) => set({ immigration: { ...p.immigration, sponsorship: v as Sponsorship } })}
          />
          <TextInput
            label="Valid until"
            type="month"
            value={p.immigration.validUntil}
            onChange={(validUntil) => set({ immigration: { ...p.immigration, validUntil } })}
          />
        </div>
        <TextArea
          label="Notes"
          rows={2}
          value={p.immigration.notes}
          placeholder="e.g. Eligible for H-1B transfer"
          onChange={(notes) => set({ immigration: { ...p.immigration, notes } })}
        />
        <p className="text-xs text-slate-500">Don&apos;t enter passport or visa numbers here.</p>
      </Section>

      {/* 9. References */}
      <Section
        {...sectionProps("references")}
        title="References"
        tag={p.privacy.showReferences ? "Shown" : "On request"}
        description={countLabel(p.references.length, "reference", "references")}
      >
        <Toggle
          label="Show references on my page"
          hint="Off: your page says “References available on request”. Ask your references before sharing their details."
          checked={p.privacy.showReferences}
          onChange={(showReferences) => set({ privacy: { ...p.privacy, showReferences } })}
        />
        {p.references.map((r, i) => (
          <ItemCard
            key={i}
            title={r.name || `Reference ${i + 1}`}
            index={i}
            count={p.references.length}
            onMove={(a, b) => set({ references: move(p.references, a, b) })}
            onRemove={(idx) => set({ references: removeAt(p.references, idx) })}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Name *" value={r.name} onChange={(name) => set({ references: updateAt(p.references, i, { name }) })} />
              <TextInput label="Relationship" value={r.relationship} placeholder="Former manager" onChange={(relationship) => set({ references: updateAt(p.references, i, { relationship }) })} />
              <TextInput label="Company" value={r.company} onChange={(company) => set({ references: updateAt(p.references, i, { company }) })} />
              <TextInput label="Email" type="email" value={r.email} onChange={(email) => set({ references: updateAt(p.references, i, { email }) })} />
              <TextInput label="Phone" type="tel" value={r.phone} onChange={(phone) => set({ references: updateAt(p.references, i, { phone }) })} />
            </div>
            <p className="text-xs text-slate-500">Email or phone is required.</p>
          </ItemCard>
        ))}
        <AddButton onClick={() => set({ references: [...p.references, emptyReference()] })}>Add reference</AddButton>
      </Section>

      {/* 10. Links */}
      <Section {...sectionProps("links")} title="Links" description="LinkedIn, GitHub, portfolio and other profiles">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="LinkedIn" value={p.socials.linkedin} placeholder="https://linkedin.com/in/…" onChange={(linkedin) => set({ socials: { ...p.socials, linkedin } })} />
          <TextInput label="GitHub" value={p.socials.github} placeholder="https://github.com/…" onChange={(github) => set({ socials: { ...p.socials, github } })} />
          <TextInput label="Website" value={p.socials.website} placeholder="https://…" onChange={(website) => set({ socials: { ...p.socials, website } })} />
          <TextInput label="X / Twitter" value={p.socials.twitter} placeholder="https://x.com/…" onChange={(twitter) => set({ socials: { ...p.socials, twitter } })} />
          <TextInput label="Telegram" value={p.socials.telegram} placeholder="@username" onChange={(telegram) => set({ socials: { ...p.socials, telegram } })} />
          <TextInput label="Discord" value={p.socials.discord} placeholder="username" onChange={(discord) => set({ socials: { ...p.socials, discord } })} />
        </div>
        <p className="label !mb-0 pt-1">Other links</p>
        {p.otherLinks.map((l, i) => (
          <ItemCard
            key={i}
            title={l.label || `Link ${i + 1}`}
            index={i}
            count={p.otherLinks.length}
            onMove={(a, b) => set({ otherLinks: move(p.otherLinks, a, b) })}
            onRemove={(idx) => set({ otherLinks: removeAt(p.otherLinks, idx) })}
          >
            <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
              <TextInput label="Label *" value={l.label} placeholder="Medium, Kaggle…" onChange={(label) => set({ otherLinks: updateAt(p.otherLinks, i, { label }) })} />
              <TextInput label="URL *" value={l.url} placeholder="https://…" onChange={(url) => set({ otherLinks: updateAt(p.otherLinks, i, { url }) })} />
            </div>
          </ItemCard>
        ))}
        <AddButton onClick={() => set({ otherLinks: [...p.otherLinks, { label: "", url: "" }] })}>Add link</AddButton>
      </Section>

      {/* 11. Additional info */}
      <Section {...sectionProps("additional")} title="Additional Info" tag="Optional" description="Languages, certifications, interests">
        <ListInput label="Languages" value={p.additional.languages} placeholder="English, Hindi, Telugu" onChange={(languages) => set({ additional: { ...p.additional, languages } })} />
        <ListInput
          multiline
          label="Certifications"
          value={p.additional.certifications}
          placeholder={"AWS Certified Developer – Associate\nPMP"}
          onChange={(certifications) => set({ additional: { ...p.additional, certifications } })}
        />
        <ListInput label="Interests" value={p.additional.interests} placeholder="Open source, cricket" onChange={(interests) => set({ additional: { ...p.additional, interests } })} />
        <TextArea label="Anything else" rows={3} value={p.additional.notes} onChange={(notes) => set({ additional: { ...p.additional, notes } })} />
      </Section>

      {/* 12. Testimonials */}
      <Section {...sectionProps("reviews")} title="Testimonials" tag="Optional" description={countLabel(p.reviews.length, "quote", "quotes")}>
        <p className="text-xs text-slate-500">Quotes from clients, managers or teammates. Use real feedback only.</p>
        {p.reviews.map((r, i) => (
          <ItemCard
            key={i}
            title={r.name || `Testimonial ${i + 1}`}
            index={i}
            count={p.reviews.length}
            onMove={(a, b) => set({ reviews: move(p.reviews, a, b) })}
            onRemove={(idx) => set({ reviews: removeAt(p.reviews, idx) })}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Name *" value={r.name} onChange={(name) => set({ reviews: updateAt(p.reviews, i, { name }) })} />
              <TextInput label="Role / company" value={r.role} onChange={(role) => set({ reviews: updateAt(p.reviews, i, { role }) })} />
            </div>
            <TextArea label="Quote *" rows={3} value={r.text} onChange={(text) => set({ reviews: updateAt(p.reviews, i, { text }) })} />
            <div>
              <p className="label">Rating</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                    onClick={() => set({ reviews: updateAt(p.reviews, i, { rating: n }) })}
                    className={`text-2xl leading-none ${n <= r.rating ? "text-amber-400" : "text-slate-600"}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </ItemCard>
        ))}
        <AddButton onClick={() => set({ reviews: [...p.reviews, emptyReview()] })}>Add testimonial</AddButton>
      </Section>

      {/* 13. Design */}
      <Section {...sectionProps("design")} title="Design & Extras" tag="Optional" description="Colour, theme, background, meeting link">
        <div>
          <p className="label">Accent colour</p>
          <div className="flex flex-wrap items-center gap-3">
            {ACCENT_PRESETS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Accent ${c}`}
                onClick={() => set({ accent: c })}
                className={`h-9 w-9 rounded-full ring-offset-2 ring-offset-ink-900 transition ${
                  p.accent.toLowerCase() === c ? "ring-2 ring-white" : "hover:scale-110"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
            <label className="flex items-center gap-2 text-sm text-slate-400">
              <input
                type="color"
                value={p.accent}
                onChange={(e) => set({ accent: e.target.value })}
                className="h-9 w-12 cursor-pointer rounded border border-white/10 bg-transparent"
              />
              Custom
            </label>
          </div>
        </div>
        <div>
          <p className="label">Default theme for visitors</p>
          <div className="flex gap-2">
            {(["light", "dark"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set({ theme: t })}
                className={`rounded-full px-4 py-1.5 text-sm capitalize transition ${
                  p.theme === t ? "bg-accent text-ink-950" : "border border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <TextInput
          label="Background image URL"
          value={p.backgroundUrl}
          onChange={(backgroundUrl) => set({ backgroundUrl })}
          placeholder="https://… (shown faded behind the page)"
        />
        <TextInput
          label="Meeting link"
          value={p.meetingUrl}
          onChange={(meetingUrl) => set({ meetingUrl })}
          placeholder="https://calendly.com/…"
          hint="Adds a Meet button (Calendly, Cal.com, Google booking page…)."
        />
      </Section>
    </div>
  );
}

function countLabel(n: number, one: string, many: string) {
  return n === 0 ? "Nothing added yet" : `${n} ${n === 1 ? one : many}`;
}

function ProjectsEditor({ list, onChange }: { list: Project[]; onChange: (v: Project[]) => void }) {
  return (
    <>
      {list.map((pr, i) => (
        <ItemCard
          key={i}
          title={pr.title || `Project ${i + 1}`}
          index={i}
          count={list.length}
          onMove={(a, b) => onChange(move(list, a, b))}
          onRemove={(idx) => onChange(removeAt(list, idx))}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Title *" value={pr.title} onChange={(title) => onChange(updateAt(list, i, { title }))} />
            <TextInput
              label="Category"
              value={pr.category}
              placeholder="Web, Mobile, AI…"
              hint="Used for the filter buttons."
              onChange={(category) => onChange(updateAt(list, i, { category }))}
            />
          </div>
          <TextArea label="Description *" rows={3} value={pr.description} onChange={(description) => onChange(updateAt(list, i, { description }))} />
          <ListInput label="Tech / tags" value={pr.tags} placeholder="Next.js, Firebase" onChange={(tags) => onChange(updateAt(list, i, { tags }))} />
          <TextInput label="Image URL" value={pr.image} placeholder="https://… (optional screenshot)" onChange={(image) => onChange(updateAt(list, i, { image }))} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Live URL" value={pr.liveUrl} onChange={(liveUrl) => onChange(updateAt(list, i, { liveUrl }))} />
            <TextInput label="Code URL" value={pr.repoUrl} onChange={(repoUrl) => onChange(updateAt(list, i, { repoUrl }))} />
          </div>
        </ItemCard>
      ))}
      <AddButton onClick={() => onChange([...list, emptyProject()])}>Add project</AddButton>
    </>
  );
}

function AddButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-3 text-sm text-slate-400 transition hover:border-accent/50 hover:text-accent"
    >
      <PlusIcon className="h-4 w-4" /> {children}
    </button>
  );
}
