"use client";

import { useState } from "react";
import { PlusIcon } from "@/components/Icons";
import {
  ACCENT_PRESETS,
  emptyEducation,
  emptyExperience,
  emptyProject,
  type Profile,
} from "@/lib/types";
import { ItemCard, ListInput, move, removeAt, TextArea, TextInput, updateAt } from "./fields";

const TABS = ["Basics", "About", "Skills", "Experience", "Projects", "Education", "Design"] as const;
type Tab = (typeof TABS)[number];

export function ProfileEditor({
  profile,
  onChange,
  photoURL,
}: {
  profile: Profile;
  onChange: (p: Profile) => void;
  photoURL?: string | null;
}) {
  const [tab, setTab] = useState<Tab>("Basics");
  const set = (patch: Partial<Profile>) => onChange({ ...profile, ...patch });
  const p = profile;

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-4 mb-6 overflow-x-auto border-b border-white/[0.06] bg-ink-900/95 px-4 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex gap-1 py-2" role="tablist">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm transition ${
                tab === t ? "bg-accent text-ink-950" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === "Basics" && (
        <div className="space-y-5">
          <TextInput label="Full name" value={p.name} onChange={(name) => set({ name })} placeholder="Alex Rivera" />
          <TextInput
            label="Headline"
            value={p.title}
            onChange={(title) => set({ title })}
            placeholder="Full-Stack Engineer"
          />
          <TextArea
            label="Tagline"
            rows={2}
            value={p.tagline}
            onChange={(tagline) => set({ tagline })}
            placeholder="One sentence about what you do and who you help."
          />
          <TextInput
            label="Location"
            value={p.location}
            onChange={(location) => set({ location })}
            placeholder="Atlanta, GA"
          />
          <div>
            <TextInput
              label="Photo URL"
              value={p.avatarUrl}
              onChange={(avatarUrl) => set({ avatarUrl })}
              placeholder="https://…"
              hint="Tip: https://github.com/<your-username>.png works well."
            />
            {photoURL && photoURL !== p.avatarUrl && (
              <button
                type="button"
                className="mt-2 text-xs text-accent hover:underline"
                onClick={() => set({ avatarUrl: photoURL })}
              >
                Use my Google profile photo
              </button>
            )}
          </div>
          <TextInput
            label="Resume link (PDF)"
            value={p.resumeUrl}
            onChange={(resumeUrl) => set({ resumeUrl })}
            placeholder="https://drive.google.com/…"
            hint="A public link to your resume PDF (e.g. Google Drive with 'Anyone with the link')."
          />
        </div>
      )}

      {tab === "About" && (
        <div className="space-y-5">
          <TextArea
            label="About you"
            rows={9}
            value={p.about}
            onChange={(about) => set({ about })}
            hint="Leave a blank line between paragraphs."
          />
          <TextInput
            label="Years of experience"
            type="number"
            value={p.yearsExperience === null ? "" : String(p.yearsExperience)}
            onChange={(v) => {
              const n = parseInt(v, 10);
              set({ yearsExperience: Number.isFinite(n) && n >= 0 ? Math.min(n, 60) : null });
            }}
          />
          <TextInput
            label="Contact email"
            type="email"
            value={p.email}
            onChange={(email) => set({ email })}
            hint="Shown publicly on your page."
          />
          <TextInput
            label="GitHub"
            value={p.socials.github}
            onChange={(github) => set({ socials: { ...p.socials, github } })}
            placeholder="https://github.com/…"
          />
          <TextInput
            label="LinkedIn"
            value={p.socials.linkedin}
            onChange={(linkedin) => set({ socials: { ...p.socials, linkedin } })}
            placeholder="https://linkedin.com/in/…"
          />
          <TextInput
            label="X / Twitter"
            value={p.socials.twitter}
            onChange={(twitter) => set({ socials: { ...p.socials, twitter } })}
            placeholder="https://x.com/…"
          />
          <TextInput
            label="Website"
            value={p.socials.website}
            onChange={(website) => set({ socials: { ...p.socials, website } })}
            placeholder="https://…"
          />
        </div>
      )}

      {tab === "Skills" && (
        <div className="space-y-4">
          {p.skills.map((g, i) => (
            <ItemCard
              key={i}
              title={g.name || `Group ${i + 1}`}
              index={i}
              count={p.skills.length}
              onMove={(a, b) => set({ skills: move(p.skills, a, b) })}
              onRemove={(idx) => set({ skills: removeAt(p.skills, idx) })}
            >
              <TextInput
                label="Group name"
                value={g.name}
                onChange={(name) => set({ skills: updateAt(p.skills, i, { name }) })}
                placeholder="Frontend"
              />
              <ListInput
                label="Skills"
                value={g.items}
                onChange={(items) => set({ skills: updateAt(p.skills, i, { items }) })}
                placeholder="React, TypeScript, Tailwind"
              />
            </ItemCard>
          ))}
          <AddButton onClick={() => set({ skills: [...p.skills, { name: "", items: [] }] })}>Add skill group</AddButton>
        </div>
      )}

      {tab === "Experience" && (
        <div className="space-y-4">
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
                <TextInput
                  label="Role"
                  value={e.role}
                  onChange={(role) => set({ experience: updateAt(p.experience, i, { role }) })}
                />
                <TextInput
                  label="Company"
                  value={e.company}
                  onChange={(company) => set({ experience: updateAt(p.experience, i, { company }) })}
                />
                <TextInput
                  label="Start"
                  value={e.start}
                  placeholder="2021"
                  onChange={(start) => set({ experience: updateAt(p.experience, i, { start }) })}
                />
                <TextInput
                  label="End"
                  value={e.end}
                  placeholder="Present"
                  onChange={(end) => set({ experience: updateAt(p.experience, i, { end }) })}
                />
              </div>
              <TextInput
                label="Location"
                value={e.location}
                onChange={(location) => set({ experience: updateAt(p.experience, i, { location }) })}
              />
              <TextArea
                label="Summary"
                rows={2}
                value={e.summary}
                onChange={(summary) => set({ experience: updateAt(p.experience, i, { summary }) })}
              />
              <ListInput
                multiline
                label="Highlights"
                value={e.highlights}
                onChange={(highlights) => set({ experience: updateAt(p.experience, i, { highlights }) })}
                placeholder={"Cut page load time by 60%\nLed a team of 4"}
              />
            </ItemCard>
          ))}
          <AddButton onClick={() => set({ experience: [emptyExperience(), ...p.experience] })}>
            Add role (adds to top)
          </AddButton>
        </div>
      )}

      {tab === "Projects" && (
        <div className="space-y-4">
          {p.projects.map((pr, i) => (
            <ItemCard
              key={i}
              title={pr.title || `Project ${i + 1}`}
              index={i}
              count={p.projects.length}
              onMove={(a, b) => set({ projects: move(p.projects, a, b) })}
              onRemove={(idx) => set({ projects: removeAt(p.projects, idx) })}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput
                  label="Title"
                  value={pr.title}
                  onChange={(title) => set({ projects: updateAt(p.projects, i, { title }) })}
                />
                <TextInput
                  label="Category"
                  value={pr.category}
                  placeholder="Web, Mobile, AI…"
                  hint="Used for the filter buttons."
                  onChange={(category) => set({ projects: updateAt(p.projects, i, { category }) })}
                />
              </div>
              <TextArea
                label="Description"
                rows={3}
                value={pr.description}
                onChange={(description) => set({ projects: updateAt(p.projects, i, { description }) })}
              />
              <ListInput
                label="Tags"
                value={pr.tags}
                placeholder="Next.js, Firebase"
                onChange={(tags) => set({ projects: updateAt(p.projects, i, { tags }) })}
              />
              <TextInput
                label="Image URL"
                value={pr.image}
                placeholder="https://… (optional screenshot)"
                onChange={(image) => set({ projects: updateAt(p.projects, i, { image }) })}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput
                  label="Live URL"
                  value={pr.liveUrl}
                  onChange={(liveUrl) => set({ projects: updateAt(p.projects, i, { liveUrl }) })}
                />
                <TextInput
                  label="Code URL"
                  value={pr.repoUrl}
                  onChange={(repoUrl) => set({ projects: updateAt(p.projects, i, { repoUrl }) })}
                />
              </div>
            </ItemCard>
          ))}
          <AddButton onClick={() => set({ projects: [...p.projects, emptyProject()] })}>Add project</AddButton>
        </div>
      )}

      {tab === "Education" && (
        <div className="space-y-4">
          {p.education.map((ed, i) => (
            <ItemCard
              key={i}
              title={ed.school || `Entry ${i + 1}`}
              index={i}
              count={p.education.length}
              onMove={(a, b) => set({ education: move(p.education, a, b) })}
              onRemove={(idx) => set({ education: removeAt(p.education, idx) })}
            >
              <TextInput
                label="School"
                value={ed.school}
                onChange={(school) => set({ education: updateAt(p.education, i, { school }) })}
              />
              <TextInput
                label="Degree"
                value={ed.degree}
                onChange={(degree) => set({ education: updateAt(p.education, i, { degree }) })}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput
                  label="Start"
                  value={ed.start}
                  onChange={(start) => set({ education: updateAt(p.education, i, { start }) })}
                />
                <TextInput
                  label="End"
                  value={ed.end}
                  onChange={(end) => set({ education: updateAt(p.education, i, { end }) })}
                />
              </div>
            </ItemCard>
          ))}
          <AddButton onClick={() => set({ education: [...p.education, emptyEducation()] })}>Add education</AddButton>
        </div>
      )}

      {tab === "Design" && (
        <div className="space-y-5">
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
          <p className="text-sm text-slate-500">More themes and layouts can be added here later.</p>
        </div>
      )}
    </div>
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
