"use client";

import { useCallback, useEffect, useState } from "react";
import { BriefcaseIcon, ChatIcon, CodeIcon } from "@/components/Icons";
import { hexToRgbTriplet } from "@/lib/color";
import { fullName, type Profile } from "@/lib/types";
import { initialsOf } from "../helpers";
import { Browse } from "./Browse";
import { RecruiterView } from "./RecruiterView";

/** intro → "Who's watching?" → either the full streaming page or a quick résumé. */
export type Stage = "intro" | "picker" | "browse" | "recruiter";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * The "Cinema" layout: a Netflix-style portfolio built from the same profile
 * data as the Classic layout. Always dark; uses the profile's accent colour.
 */
export function CinemaPortfolio({ profile: p, showExport = true }: { profile: Profile; showExport?: boolean }) {
  const name = fullName(p) || "Your Name";
  const storageKey = `cinema:${p.username || "preview"}`;
  const [stage, setStage] = useState<Stage>("intro");

  // Returning visitors in the same tab skip straight to where they were
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = sessionStorage.getItem(storageKey);
    } catch {
      /* storage unavailable */
    }
    if (saved === "browse" || saved === "recruiter") setStage(saved);
    else if (prefersReducedMotion()) setStage("picker");
  }, [storageKey]);

  const go = useCallback(
    (next: Stage, anchor?: string) => {
      setStage(next);
      try {
        if (next === "browse" || next === "recruiter") sessionStorage.setItem(storageKey, next);
        else sessionStorage.removeItem(storageKey);
      } catch {
        /* storage unavailable */
      }
      window.scrollTo({ top: 0 });
      if (anchor) window.setTimeout(() => document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" }), 80);
    },
    [storageKey],
  );

  // Intro plays once, then hands over to the profile picker
  useEffect(() => {
    if (stage !== "intro") return;
    const t = window.setTimeout(() => setStage("picker"), 2600);
    return () => window.clearTimeout(t);
  }, [stage]);

  const style = { "--accent": hexToRgbTriplet(p.accent) } as React.CSSProperties;

  return (
    <div style={style} className="cinema dark relative min-h-screen bg-[#0b0b0b] font-sans text-slate-300">
      {stage === "intro" && <Intro name={name} onSkip={() => setStage("picker")} />}
      {stage === "picker" && <Picker p={p} name={name} go={go} />}
      {stage === "browse" && <Browse p={p} name={name} showExport={showExport} go={go} />}
      {stage === "recruiter" && <RecruiterView p={p} name={name} showExport={showExport} go={go} />}
    </div>
  );
}

/* ---------- Intro: the name "ta-dum" reveal ---------- */

function Intro({ name, onSkip }: { name: string; onSkip: () => void }) {
  return (
    <button
      type="button"
      onClick={onSkip}
      aria-label="Skip intro"
      className="absolute inset-0 z-50 grid min-h-screen cursor-pointer place-items-center overflow-hidden bg-black"
    >
      <span className="cinema-intro-glow absolute h-[40vmin] w-[80vmin] rounded-full bg-accent/40 blur-[80px]" aria-hidden />
      <span className="cinema-intro-name relative px-6 text-center font-display text-[13vw] font-black uppercase leading-none tracking-tight text-accent sm:text-[9vw]">
        {name}
      </span>
      <span className="cinema-intro-bar absolute bottom-[30%] h-1 rounded-full bg-accent" aria-hidden />
      <span className="absolute bottom-6 right-6 text-xs uppercase tracking-[0.25em] text-white/40">Click to skip</span>
    </button>
  );
}

/* ---------- "Who's watching?" ---------- */

function Picker({ p, name, go }: { p: Profile; name: string; go: (s: Stage, anchor?: string) => void }) {
  const firstName = name.split(/\s+/)[0];
  const tiles = [
    {
      key: "recruiter",
      label: "Recruiter",
      hint: "Quick résumé",
      onClick: () => go("recruiter"),
      art: (
        <span className="grid h-full w-full place-items-center bg-gradient-to-br from-sky-500 to-indigo-700">
          <BriefcaseIcon className="h-1/3 w-1/3 text-white" />
        </span>
      ),
    },
    {
      key: "explorer",
      label: "Explorer",
      hint: `The full ${firstName} experience`,
      onClick: () => go("browse"),
      art: p.avatarUrl ? (
        <img src={p.avatarUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="grid h-full w-full place-items-center bg-accent font-display text-5xl font-black text-white">
          {initialsOf(name) || "?"}
        </span>
      ),
    },
    {
      key: "developer",
      label: "Developer",
      hint: "Projects & skills",
      onClick: () => go("browse", "projects"),
      art: (
        <span className="grid h-full w-full place-items-center bg-gradient-to-br from-emerald-400 to-teal-700">
          <CodeIcon className="h-1/3 w-1/3 text-white" />
        </span>
      ),
    },
    {
      key: "contact",
      label: "Let's talk",
      hint: "Get in touch",
      onClick: () => go("browse", "contact"),
      art: (
        <span className="grid h-full w-full place-items-center bg-gradient-to-br from-amber-400 to-orange-600">
          <ChatIcon className="h-1/3 w-1/3 text-white" />
        </span>
      ),
    },
  ];

  return (
    <div className="cinema-fade flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <h1 className="text-center font-display text-3xl font-medium text-white sm:text-5xl">Who&apos;s watching?</h1>
      <div className="mt-10 grid grid-cols-2 gap-6 sm:mt-14 sm:flex sm:gap-8">
        {tiles.map((t) => (
          <button key={t.key} type="button" onClick={t.onClick} className="group flex w-32 flex-col items-center text-center sm:w-40">
            <span className="block aspect-square w-full overflow-hidden rounded-md ring-0 ring-white transition duration-200 group-hover:ring-4 group-focus-visible:ring-4">
              {t.art}
            </span>
            <span className="mt-3 text-base text-slate-400 transition group-hover:text-white sm:text-lg">{t.label}</span>
            <span className="text-xs text-slate-600 transition group-hover:text-slate-400">{t.hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
