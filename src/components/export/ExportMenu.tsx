"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DownloadIcon } from "@/components/Icons";
import { downloadBlob, fileBaseName, profileVcard, profileXlsx } from "@/lib/export/profileExport";
import type { Profile } from "@/lib/types";
import { ResumeDocument } from "./ResumeDocument";

const OPTIONS = [
  { id: "pdf", label: "PDF résumé", hint: "Print-ready, opens Save as PDF" },
  { id: "xlsx", label: "Excel workbook (.xlsx)", hint: "One sheet per section" },
  { id: "vcf", label: "Contact card (.vcf)", hint: "Add to Contacts or Outlook" },
] as const;

/**
 * "Export" dropdown. Exports only what the given profile contains, so pass
 * the visitor-visible copy (publishedView), never the owner's full data.
 */
export function ExportMenu({ profile, variant = "light" }: { profile: Profile; variant?: "light" | "dark" }) {
  const [open, setOpen] = useState(false);
  const [printing, setPrinting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // PDF: render the résumé into <body>, print only it, then clean up
  useEffect(() => {
    if (!printing) return;
    const prevTitle = document.title;
    document.title = `${fileBaseName(profile)}-Resume`;
    document.body.classList.add("print-resume");
    const done = () => {
      document.body.classList.remove("print-resume");
      document.title = prevTitle;
      setPrinting(false);
    };
    window.addEventListener("afterprint", done, { once: true });
    const t = window.setTimeout(() => window.print(), 50);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("afterprint", done);
    };
  }, [printing, profile]);

  const run = (id: (typeof OPTIONS)[number]["id"]) => {
    setOpen(false);
    const base = fileBaseName(profile);
    if (id === "pdf") setPrinting(true);
    if (id === "xlsx") downloadBlob(profileXlsx(profile), `${base}.xlsx`);
    if (id === "vcf") downloadBlob(profileVcard(profile, `${window.location.origin}/${profile.username}`), `${base}.vcf`);
  };

  const button =
    variant === "dark"
      ? "border-white/10 bg-white/[0.03] text-slate-200 hover:border-accent/50 hover:text-white"
      : "border-slate-200 bg-white text-slate-700 hover:border-accent/50 hover:text-accent dark:border-white/10 dark:bg-white/5 dark:text-slate-200";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition ${button}`}
      >
        <DownloadIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Export</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl dark:border-white/10 dark:bg-ink-900"
        >
          {OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              role="menuitem"
              onClick={() => run(o.id)}
              className="block w-full rounded-lg px-3 py-2 text-left transition hover:bg-slate-100 dark:hover:bg-white/5"
            >
              <span className="block text-sm font-medium text-slate-900 dark:text-white">{o.label}</span>
              <span className="block text-xs text-slate-500">{o.hint}</span>
            </button>
          ))}
        </div>
      )}

      {printing &&
        createPortal(
          <div id="resume-print">
            <ResumeDocument p={profile} />
          </div>,
          document.body,
        )}
    </div>
  );
}
