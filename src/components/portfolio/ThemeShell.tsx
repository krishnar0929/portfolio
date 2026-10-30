"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@/components/Icons";
import type { Theme } from "@/lib/types";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
});

/**
 * Wraps one portfolio page and scopes light/dark to it (Tailwind `dark:` uses
 * the nearest `.dark` ancestor). The visitor's choice is remembered per profile.
 */
export function ThemeShell({
  defaultTheme,
  storageKey,
  style,
  className = "",
  children,
}: {
  defaultTheme: Theme;
  storageKey: string;
  style?: React.CSSProperties;
  className?: string;
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setTheme(saved === "dark" || saved === "light" ? saved : defaultTheme);
    } catch {
      setTheme(defaultTheme);
    }
  }, [storageKey, defaultTheme]);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem(storageKey, next);
    } catch {
      /* storage unavailable */
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <div style={style} className={`${theme === "dark" ? "dark" : ""} ${className}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function ThemeToggle() {
  const { theme, toggle } = useContext(ThemeContext);
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:text-accent dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
    >
      {theme === "dark" ? <SunIcon className="h-[18px] w-[18px]" /> : <MoonIcon className="h-[18px] w-[18px]" />}
    </button>
  );
}
