"use client";

import { useMemo, useState } from "react";
import { ArrowUpRightIcon, GithubIcon } from "@/components/Icons";
import type { Project } from "@/lib/types";
import { Reveal } from "./Reveal";

export function ProjectGrid({ projects }: { projects: Project[] }) {
  const categories = useMemo(() => {
    const set = new Set(projects.map((p) => p.category.trim()).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [projects]);
  const [filter, setFilter] = useState("All");

  const shown = filter === "All" ? projects : projects.filter((p) => p.category.trim() === filter);

  return (
    <>
      {categories.length > 2 && (
        <div className="mb-10 flex flex-wrap gap-2" role="tablist" aria-label="Filter projects">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={filter === c}
              onClick={() => setFilter(c)}
              className={`rounded-full px-4 py-1.5 text-sm transition ${
                filter === c
                  ? "bg-accent text-ink-950"
                  : "border border-white/10 text-slate-400 hover:border-accent/40 hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((p, i) => (
          <Reveal key={`${p.title}-${i}`} delay={(i % 3) * 90}>
            <ProjectCard project={p} />
          </Reveal>
        ))}
      </div>
    </>
  );
}

function ProjectCard({ project: p }: { project: Project }) {
  const primaryLink = p.liveUrl || p.repoUrl;
  return (
    <article className="card group flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_20px_60px_-25px_rgb(var(--accent)/0.5)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-ink-800">
        {p.image ? (
          <img
            src={p.image}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="relative grid h-full place-items-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgb(var(--accent)/0.35),transparent_60%)]" />
            <div className="bg-grid absolute inset-0 opacity-60" />
            <span className="relative font-display text-5xl font-semibold text-white/80">
              {p.title.trim()[0]?.toUpperCase() ?? "•"}
            </span>
          </div>
        )}
        {p.category && (
          <span className="absolute left-3 top-3 rounded-full bg-ink-950/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-accent backdrop-blur">
            {p.category}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold text-white">
          {primaryLink ? (
            <a href={primaryLink} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
              {p.title}
            </a>
          ) : (
            p.title
          )}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{p.description}</p>

        {p.tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {p.tags.map((t) => (
              <li key={t} className="font-mono text-[11px] text-slate-500">
                #{t}
              </li>
            ))}
          </ul>
        )}

        {(p.liveUrl || p.repoUrl) && (
          <div className="mt-5 flex gap-4 border-t border-white/[0.06] pt-4 text-sm">
            {p.liveUrl && (
              <a
                href={p.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-slate-300 hover:text-accent"
              >
                Live <ArrowUpRightIcon className="h-4 w-4" />
              </a>
            )}
            {p.repoUrl && (
              <a
                href={p.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-slate-300 hover:text-accent"
              >
                <GithubIcon className="h-4 w-4" /> Code
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
