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
        <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="Filter projects">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={filter === c}
              onClick={() => setFilter(c)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                filter === c
                  ? "bg-accent text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-accent/40 hover:text-accent dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        {shown.map((p, i) => (
          <Reveal key={`${p.title}-${i}`} delay={(i % 2) * 90}>
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
    <article className="pcard group flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgb(var(--accent)/0.45)]">
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-ink-800">
        {p.image ? (
          <img
            src={p.image}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="grid h-full place-items-center bg-gradient-to-br from-accent/80 via-accent/40 to-teal-300/60">
            <span className="font-display text-5xl font-bold text-white/90">
              {p.title.trim()[0]?.toUpperCase() ?? "•"}
            </span>
          </div>
        )}
        {p.category && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-accent shadow-sm dark:bg-ink-950/80">
            {p.category}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
          {primaryLink ? (
            <a href={primaryLink} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
              {p.title}
            </a>
          ) : (
            p.title
          )}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{p.description}</p>

        {p.tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {p.tags.map((t) => (
              <li
                key={t}
                className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-white/5 dark:text-slate-400"
              >
                {t}
              </li>
            ))}
          </ul>
        )}

        {(p.liveUrl || p.repoUrl) && (
          <div className="mt-5 flex gap-4 border-t border-slate-100 pt-4 text-sm dark:border-white/[0.06]">
            {p.liveUrl && (
              <a
                href={p.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-slate-700 hover:text-accent dark:text-slate-300"
              >
                Live <ArrowUpRightIcon className="h-4 w-4" />
              </a>
            )}
            {p.repoUrl && (
              <a
                href={p.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-slate-700 hover:text-accent dark:text-slate-300"
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
