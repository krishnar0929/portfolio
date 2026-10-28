"use client";

import { useEffect, useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/Icons";
import { ThemeToggle } from "./ThemeShell";

export type NavLink = { id: string; label: string };

export function Navbar({ initials, links }: { initials: string; links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>(links[0]?.id ?? "");
  const idsKey = links.map((l) => l.id).join(",");

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    idsKey.split(",").forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [idsKey]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/75 backdrop-blur-lg dark:border-white/[0.06] dark:bg-ink-950/75">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" className="font-display text-2xl font-bold tracking-tight text-accent" onClick={() => setOpen(false)}>
          {initials}
          <span className="text-slate-400">.</span>
        </a>

        <div className="flex items-center gap-2">
          <ul className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  className={`relative px-3 py-2 text-[15px] font-medium transition ${
                    active === l.id
                      ? "text-accent"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  {l.label}
                  {active === l.id && <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-accent" />}
                </a>
              </li>
            ))}
          </ul>
          <ThemeToggle />
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full text-slate-600 dark:text-slate-300 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {open && (
        <ul className="border-t border-slate-200/60 px-4 pb-3 dark:border-white/[0.06] lg:hidden">
          {links.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-3 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
