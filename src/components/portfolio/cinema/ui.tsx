"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "@/components/Icons";

type IconProps = { className?: string };

export const PlayIcon = ({ className = "h-5 w-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M7 4.5v15a1 1 0 0 0 1.52.85l12-7.5a1 1 0 0 0 0-1.7l-12-7.5A1 1 0 0 0 7 4.5Z" />
  </svg>
);

export const InfoIcon = ({ className = "h-5 w-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M12 11v6M12 7.5v.01" strokeLinecap="round" />
  </svg>
);

export const ChevronIcon = ({ className = "h-6 w-6", dir = "right" }: IconProps & { dir?: "left" | "right" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className} aria-hidden>
    <path d={dir === "right" ? "m9 5 7 7-7 7" : "m15 5-7 7 7 7"} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** A titled, horizontally scrolling row of cards with arrow buttons on desktop. */
export function Row({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = () => {
    const el = ref.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  };

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section id={id} className="cinema-row group/row relative scroll-mt-20">
      <h2 className="mb-3 px-4 font-display text-lg font-semibold text-white sm:px-10 sm:text-xl">{title}</h2>
      <div className="relative">
        {!edges.start && (
          <button
            type="button"
            aria-label={`Scroll ${title} left`}
            onClick={() => scroll(-1)}
            className="absolute inset-y-0 left-0 z-20 hidden w-10 place-items-center bg-black/60 text-white opacity-0 transition group-hover/row:opacity-100 sm:grid"
          >
            <ChevronIcon dir="left" />
          </button>
        )}
        <div
          ref={ref}
          onScroll={update}
          className="flex snap-x gap-3 overflow-x-auto scroll-smooth px-4 pb-8 pt-2 [scrollbar-width:none] sm:px-10 [&::-webkit-scrollbar]:hidden"
        >
          {children}
        </div>
        {!edges.end && (
          <button
            type="button"
            aria-label={`Scroll ${title} right`}
            onClick={() => scroll(1)}
            className="absolute inset-y-0 right-0 z-20 hidden w-10 place-items-center bg-black/60 text-white opacity-0 transition group-hover/row:opacity-100 sm:grid"
          >
            <ChevronIcon />
          </button>
        )}
      </div>
    </section>
  );
}

/** Centered dialog over a dimmed page; closes on Escape or backdrop click. */
export function Modal({ open, onClose, label, children }: { open: boolean; onClose: () => void; label: string; children: React.ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/75 px-3 py-10 backdrop-blur-sm sm:py-16"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div role="dialog" aria-modal="true" aria-label={label} className="cinema-pop relative w-full max-w-3xl overflow-hidden rounded-xl bg-[#181818] text-slate-300 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/70 text-white hover:bg-black"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}

/** Poster art: the project's image, or generated title art in the accent colour. */
export function Poster({ title, subtitle, image, seed = 0, className = "" }: { title: string; subtitle?: string; image?: string; seed?: number; className?: string }) {
  if (image) {
    return <img src={image} alt={title} className={`h-full w-full object-cover ${className}`} loading="lazy" />;
  }
  const angle = 115 + ((seed * 47) % 120);
  return (
    <div
      className={`relative flex h-full w-full items-end overflow-hidden p-3 ${className}`}
      style={{
        background: `linear-gradient(${angle}deg, rgb(var(--accent) / 0.95) 0%, rgb(var(--accent) / 0.35) 45%, #0b0b0b 100%)`,
      }}
    >
      <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(rgb(255_255_255/0.35)_1px,transparent_1px)] [background-size:14px_14px] [mask-image:linear-gradient(to_top,transparent,black)]" />
      <div className="relative">
        {subtitle && <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">{subtitle}</p>}
        <p className="line-clamp-2 font-display text-lg font-extrabold uppercase leading-tight tracking-tight text-white drop-shadow sm:text-xl">
          {title || "Untitled"}
        </p>
      </div>
    </div>
  );
}
