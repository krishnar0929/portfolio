"use client";

import { ChevronDownIcon } from "@/components/Icons";
import type { SectionStatus } from "@/lib/sections";

const STATUS: Record<SectionStatus, { label: string; className: string }> = {
  complete: { label: "Complete", className: "bg-emerald-500/15 text-emerald-300" },
  partial: { label: "In progress", className: "bg-amber-500/15 text-amber-200" },
  empty: { label: "Empty", className: "bg-white/[0.06] text-slate-400" },
};

export function StatusIcon({ status }: { status: SectionStatus }) {
  if (status === "complete") {
    return (
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-500 text-white" aria-hidden>
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
          <path d="m5 12 5 5 9-10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  if (status === "partial") {
    return (
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-amber-400/80" aria-hidden>
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
      </span>
    );
  }
  return <span className="h-7 w-7 shrink-0 rounded-full border-2 border-dashed border-white/20" aria-hidden />;
}

/** Collapsible editor section with a status badge (Complete / In progress / Empty). */
export function Section({
  id,
  title,
  description,
  status,
  open,
  onToggle,
  tag,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  status: SectionStatus;
  open: boolean;
  onToggle: () => void;
  tag?: string;
  children: React.ReactNode;
}) {
  const s = STATUS[status];
  return (
    <section
      className={`overflow-hidden rounded-xl border transition ${
        open ? "border-accent/30 bg-ink-950/40" : "border-white/[0.08] bg-ink-950/20 hover:border-white/15"
      }`}
    >
      <h3>
        <button
          type="button"
          id={`${id}-header`}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={onToggle}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
        >
          <StatusIcon status={status} />
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-slate-100">{title}</span>
              {tag && (
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate-400">
                  {tag}
                </span>
              )}
            </span>
            {description && <span className="mt-0.5 block truncate text-xs text-slate-500">{description}</span>}
          </span>
          <span className={`hidden rounded-full px-2.5 py-1 text-[11px] font-medium sm:inline ${s.className}`}>{s.label}</span>
          <ChevronDownIcon className={`h-4 w-4 shrink-0 text-slate-500 transition ${open ? "rotate-180" : ""}`} />
        </button>
      </h3>
      {open && (
        <div id={`${id}-panel`} role="region" aria-labelledby={`${id}-header`} className="space-y-5 border-t border-white/[0.06] px-4 pb-5 pt-5">
          {children}
        </div>
      )}
    </section>
  );
}
